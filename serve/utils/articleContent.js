const Prism = require('prismjs')
require('prismjs/components/prism-rust')

// 文章正文统一存放在 RustFS。这里集中处理对象路径、读写和 Markdown 渲染，
// 避免控制器、公开接口各自拼接路径，后续调整存储结构时只需要改这一处。
const MarkdownIt = require('markdown-it')
const {
    putBuffer,
    getObject,
    headObject,
    deleteObject,
} = require('../storage/rustfs')

//高亮逻辑
function highlightCode(code, language) {
    const lang = String(language || '').toLowerCase()

    if (lang === 'rust') {
        const grammar = Prism.languages.rust
        if (grammar) {
            return `<pre class="article-code-block"><code class="language-rust">${
                Prism.highlight(code, grammar, 'rust')
            }</code></pre>`
        }
    }

    // 返回空字符串，markdown-it 会使用默认的纯文本转义。
    return ''
}

// 关闭 Markdown 原始 HTML，防止文章内容绕过前端的富文本净化直接注入标签。
// 当前详情页仍然接收 HTML，因此这里负责把 Markdown 转成可安全展示的 HTML。
const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    typographer: false,
    highlight: highlightCode,
})

// 单篇 Markdown 设置上限。正文应远小于该值，限制可以避免异常请求占用过多内存。
const MAX_MARKDOWN_BYTES = 2 * 1024 * 1024

// 正文对象放在 private 前缀下；RustFS 初始化脚本只公开 public/*，
// 因此 draft.md 和 published.md 不会被浏览器直接读取。
const draftKey = (articleId) => `private/articles/${Number(articleId)}/draft.md`
const publishedKey = (articleId) => `private/articles/${Number(articleId)}/published.md`

// 判断 RustFS 的“对象不存在”。不同 S3 兼容实现返回的错误名称可能不同，
// 因此同时检查 HTTP 状态码和常见错误名称。
const isNotFound = (error) => (
    error?.$metadata?.httpStatusCode === 404
    || error?.name === 'NoSuchKey'
    || error?.name === 'NotFound'
)

// getObject 返回的是可读流，Sequelize 和控制器都没有通用流工具，
// 这里单独聚合为字符串供 Markdown 渲染和后台编辑读取。
async function streamToString(stream) {
    const chunks = []
    try {
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }
        return Buffer.concat(chunks).toString('utf8')
    } finally {
        stream?.destroy?.()
    }
}

// 统一对象写入参数，保证所有 Markdown 都使用 UTF-8 和正确的 MIME 类型。
async function putMarkdown(key, value) {
    const body = Buffer.from(String(value ?? '').replace(/^\uFEFF/, ''), 'utf8')
    if (body.length > MAX_MARKDOWN_BYTES) {
        const error = new Error('文章正文超过 2MB 限制')
        error.status = 400
        throw error
    }
    await putBuffer({
        key,
        body,
        contentType: 'text/markdown; charset=utf-8',
    })
}

// 读取文章对象的核心方法。对象不存在时返回 null，让调用方回退到旧 content，
// 其他网络或权限错误继续抛出，避免把真实的存储故障误判为“文章为空”。
async function readMarkdown(key) {
    try {
        const response = await getObject(key)
        return await streamToString(response.Body)
    } catch (error) {
        if (isNotFound(error)) return null
        throw error
    }
}

// 保存后台编辑中的正文。路径由文章 ID 推导，不需要在 article 表新增字段。
const saveDraft = (articleId, value) => putMarkdown(draftKey(articleId), value)

// 读取后台草稿；旧文章尚未迁移时返回 null。
const readDraft = (articleId) => readMarkdown(draftKey(articleId))

// 读取线上发布的正文快照；公开详情只使用该对象，避免编辑中的草稿提前泄露。
const readPublished = (articleId) => readMarkdown(publishedKey(articleId))

// 发布时把草稿内容复制为独立快照。先写快照、后更新 state，
// 可以避免数据库已经显示“已发布”但 RustFS 中还没有正文的情况。
async function publishDraft(articleId) {
    const draft = await readDraft(articleId)
    if (draft === null) {
        const error = new Error('请先保存文章正文')
        error.status = 400
        throw error
    }
    await putMarkdown(publishedKey(articleId), draft)
    return draft
}

// 返回草稿对象的最后修改时间，用于后台顶部“已保存 19:43:23”状态，
// 这样不需要给现有 article 表额外增加 updated_at。
async function getDraftMeta(articleId) {
    try {
        const result = await headObject(draftKey(articleId))
        return {
            lastModified: result.LastModified || null,
            etag: result.ETag || null,
        }
    } catch (error) {
        if (isNotFound(error)) return null
        throw error
    }
}

// 删除文章正文与发布快照。deleteObject 在 S3 兼容存储中通常是幂等操作，
// 即可对象不存在也不会影响文章删除流程。
async function deleteArticleContent(articleId) {
    await Promise.allSettled([
        deleteObject(draftKey(articleId)),
        deleteObject(publishedKey(articleId)),
    ])
}

// 将 Markdown 转为公开页可直接消费的 HTML。原始 HTML 已在解析器中关闭，
// 前台现有的 DOMPurify 仍会继续执行，形成两层保护。
const renderMarkdown = (value) => markdown.render(String(value || ''))

// 从 Markdown 中粗略估算阅读时长，避免正文移入 RustFS 后阅读时间永远显示 1 分钟。
const readingMinutes = (value) => {
    const text = String(value || '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[#>*_`~\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    return Math.max(1, Math.ceil(text.length / 500))
}

module.exports = {
    draftKey,
    publishedKey,
    saveDraft,
    readDraft,
    readPublished,
    publishDraft,
    getDraftMeta,
    deleteArticleContent,
    renderMarkdown,
    readingMinutes,
}
