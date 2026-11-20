<template>
    <section class="article-editor-shell">
        <!-- 顶部操作只保留保存、发布和保存状态，字段编辑全部下沉到元数据组件。 -->
        <header class="article-editor-header">
            <div>
                <p class="article-editor-eyebrow">内容创作</p>
                <h1>{{ articleId ? '编辑博客文章' : '新建博客文章' }}</h1>
            </div>
            <div class="article-editor-actions">
                <span class="article-save-state">{{ savedText }}</span>
                <button class="article-button article-button-secondary" :disabled="saving || publishing" @click="save">
                    {{ saving ? '保存中...' : '保存' }}
                </button>
                <button class="article-button article-button-primary" :disabled="saving || publishing" @click="publish">
                    {{ publishing ? '发布中...' : '发布' }}
                </button>
            </div>
        </header>

        <!-- 元数据组件提供正文插槽；编辑器在历史内容加载完成后才创建，避免回填丢失。 -->
        <ArticleMetaForm
            v-model="form"
            :categories="categories"
            :label-options="labelOptions"
            :cover-uploading="coverUploading"
            @add-label="addLabel"
            @upload-cover="uploadCover"
        >
            <template #body>
                <ArticleMarkdownEditor
                    v-if="editorReady"
                    ref="markdownEditor"
                    :initial-html="initialHtml"
                    :upload-image="uploadInlineImage"
                    @error="notify('danger', $event)"
                />
            </template>
        </ArticleMetaForm>
    </section>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import ArticleMarkdownEditor from './ArticleMarkdownEditor.vue'
import ArticleMetaForm from './ArticleMetaForm.vue'
import type { ArticleFormModel, UploadedInlineImage } from './articleTypes'
import { articleApi, categoryApi, fileApi, labelApi } from '../../api'
import type { ArticleData, CategoryData, LabelData } from '../../utils/interface'

// 子组件只向主编辑器暴露 HTML 读取能力，Markdown 转换和接口调用仍集中在这里。
interface MarkdownEditorExpose {
    getHtml: () => string
}

const router = useRouter()
const route = useRoute()
const proxy: any = getCurrentInstance()?.proxy

const form = ref<ArticleFormModel>({
    title: '',
    categoryId: -1,
    labels: [],
    introduction: '',
    cover: '',
})

const articleId = ref<number | null>(null)
const initialHtml = ref('')
const categories = ref<CategoryData[]>([])
const labelOptions = ref<LabelData[]>([])
const markdownEditor = ref<MarkdownEditorExpose>()
const editorReady = ref(false)
const saving = ref(false)
const publishing = ref(false)
const coverUploading = ref(false)
const savedAt = ref<string | null>(null)

// 首次保存或首次图片上传时创建草稿记录。该 Promise 同时合并多个并发的
// WangEditor 图片上传，避免一次多图操作创建多条空文章。
let draftCreating: Promise<number> | null = null

const savedText = computed(() => {
    if (!savedAt.value) return '尚未保存'
    return `已保存 ${new Date(savedAt.value).toLocaleTimeString('zh-CN', { hour12: false })}`
})

// 保存时只生成 Markdown；HTML 属于 WangEditor 的编辑中间态，不进入 RustFS。
const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
})
turndown.use(gfm)

const notify = (type: 'primary' | 'warning' | 'danger', message: string) => {
    proxy?.$message?.({ type, message })
}

function editorMarkdown() {
    const html = markdownEditor.value?.getHtml() || ''
    return turndown
        .turndown(html)
        .replace(/\u00a0/g, ' ')
        .replace(/^\s+|\s+$/g, '')
}

// 文章元数据和正文 Markdown 分开提交。后端负责剥离 Markdown 字段，
// 因此现有 article 表不需要新增列。
function articlePayload(markdown: string) {
    return {
        title: form.value.title.trim(),
        categoryId: form.value.categoryId > 0 ? form.value.categoryId : null,
        classify: 0,
        label: form.value.labels,
        introduction: form.value.introduction.trim(),
        cover: form.value.cover,
        markdown,
    }
}

async function loadMetadata() {
    try {
        const [categoryResult, labelResult] = await Promise.all([
            categoryApi.list(0),
            labelApi.list(),
        ])
        categories.value = categoryResult.list
        labelOptions.value = labelResult
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '获取文章分类失败')
    }
}

// 编辑历史文章时优先读取后端转换后的 contentHtml；没有 Markdown 草稿时，
// 后端会返回旧 article.content，编辑器可无感接管旧正文。
async function loadExistingArticle() {
    const id = Number(route.query.id)
    if (!Number.isInteger(id) || id <= 0) return
    try {
        const article: ArticleData = await articleApi.get(id)
        articleId.value = article.id
        form.value = {
            title: article.title || '',
            categoryId: article.categoryId ?? -1,
            labels: [...(article.label || [])],
            introduction: article.introduction || '',
            cover: article.cover || '',
        }
        savedAt.value = article.savedAt || null
        initialHtml.value = article.contentHtml || article.content || ''
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '读取文章失败')
    }
}

async function ensureArticle(allowPlaceholder = false): Promise<number> {
    if (articleId.value) return articleId.value
    if (!allowPlaceholder && !form.value.title.trim()) throw new Error('请输入标题')
    if (draftCreating) return draftCreating

    draftCreating = (async () => {
        const title = form.value.title.trim() || '未命名文章'
        const created = await articleApi.create({
            ...articlePayload(editorMarkdown()),
            title,
            state: 0,
            moment: new Date().toISOString(),
        })
        articleId.value = created.id
        savedAt.value = new Date().toISOString()
        return created.id
    })()

    try {
        return await draftCreating
    } finally {
        draftCreating = null
    }
}

async function persistDraft() {
    if (!form.value.title.trim()) throw new Error('请输入标题')
    const markdown = editorMarkdown()
    if (articleId.value) {
        await articleApi.update(articleId.value, articlePayload(markdown))
    } else {
        const created = await articleApi.create({
            ...articlePayload(markdown),
            state: 0,
            moment: new Date().toISOString(),
        })
        articleId.value = created.id
    }
    savedAt.value = new Date().toISOString()
}

async function save() {
    saving.value = true
    try {
        await persistDraft()
        notify('primary', '草稿保存成功')
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '保存失败')
    } finally {
        saving.value = false
    }
}

// 发布先更新 draft.md，再由现有状态接口生成 published.md。
async function publish() {
    if (!form.value.title.trim()) {
        notify('warning', '请输入标题')
        return
    }
    if (!editorMarkdown()) {
        notify('warning', '请输入文章正文')
        return
    }
    publishing.value = true
    try {
        await persistDraft()
        if (!articleId.value) throw new Error('文章创建失败')
        await articleApi.changeState(articleId.value, 1)
        notify('primary', '文章发布成功')
        await router.push('/article')
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '发布失败')
    } finally {
        publishing.value = false
    }
}

// 封面和正文图片都通过同一个文章作用域上传，但图片插入动作由各自的子组件负责。
async function uploadCover(file: File) {
    coverUploading.value = true
    try {
        const id = await ensureArticle(true)
        const uploaded = await fileApi.upload([file], -1, id)
        form.value = { ...form.value, cover: uploaded[0]?.url || '' }
        notify('primary', '封面已就绪，保存文章后生效')
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '封面上传失败')
    } finally {
        coverUploading.value = false
    }
}

// WangEditor 只通过这个函数取图，不感知文章创建、直传确认和轮询细节。
async function uploadInlineImage(file: File): Promise<UploadedInlineImage> {
    const id = await ensureArticle(true)
    const uploaded = await fileApi.upload([file], -1, id)
    const image = uploaded[0]
    if (!image) throw new Error('图片上传未返回结果')
    return {
        url: image.url,
        fileName: image.fileName || '文章图片',
    }
}

// 新标签继续写入现有 label 表；成功后同步组件内的标签选项和当前选中项。
async function addLabel(name: string) {
    try {
        if (!labelOptions.value.some((item) => String(item.name) === name)) {
            await labelApi.add({ name, moment: new Date().toISOString() })
            labelOptions.value = await labelApi.list()
        }
        if (!form.value.labels.includes(name)) {
            form.value = { ...form.value, labels: [...form.value.labels, name] }
        }
    } catch (error) {
        notify('danger', error instanceof Error ? error.message : '新建标签失败')
    }
}

// 页面初始化包含两条异步数据链路：分类/标签元数据和历史文章正文。
// 两者完成后再挂载 WangEditor，避免编辑器先用空内容初始化。
async function initializeArticleEditor() {
    await Promise.all([loadMetadata(), loadExistingArticle()])
    editorReady.value = true
}

// 生命周期直接引用初始化函数，不在钩子内堆积请求或状态赋值。
onMounted(initializeArticleEditor)
</script>

<style scoped lang="less">
/* 主编辑器只管理页面卡片和顶部操作，字段、正文与封面样式归属各自组件。 */
.article-editor-shell {
    max-width: 1200px;
    margin: 0 auto;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 14px 42px rgba(32, 39, 54, 0.08);
}

.article-editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 26px;
    border-bottom: 1px solid #edf0f4;

    h1 {
        margin: 2px 0 0;
        color: #202530;
        font-size: 21px;
    }
}

.article-editor-eyebrow {
    margin: 0;
    color: #8a93a3;
    font-size: 11px;
    letter-spacing: 0.12em;
}

.article-editor-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.article-save-state {
    margin-right: 8px;
    color: #8a93a3;
    font-size: 12px;
}

.article-button {
    height: 34px;
    border: 0;
    border-radius: 5px;
    padding: 0 18px;
    font: inherit;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }
}

.article-button-secondary {
    background: #f1f3f6;
    color: #515b6b;
}

.article-button-primary {
    background: #2b65e9;
    color: #fff;
}

@media (max-width: 640px) {
    .article-editor-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .article-editor-actions {
        width: 100%;
    }

    .article-save-state {
        margin-right: auto;
    }
}
</style>
