import DOMPurify from 'dompurify'

// 正文来自后台富文本编辑器，进入 v-html 前先移除脚本、内联事件和危险标签。
export function sanitizeRichText(value?: string): string {
  if (!value) return ''
  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  })
}

// 为正文标题自动补充稳定 id，生成文章右侧目录的锚点。
export function addHeadingIds(html: string): { html: string; headings: { id: string; text: string }[] } {
  if (!html) return { html: '', headings: [] }
  const container = document.createElement('div')
  container.innerHTML = html
  const headings = [...container.querySelectorAll<HTMLElement>('h2, h3')].map((heading, index) => {
    const id = heading.id || `section-${index + 1}`
    heading.id = id
    return { id, text: heading.textContent?.trim() || `章节 ${index + 1}` }
  })
  return { html: container.innerHTML, headings }
}
