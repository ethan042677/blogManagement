const VISITOR_ID_KEY = 'blog_visitor_id'
const LIKED_ARTICLES_KEY = 'blog_liked_articles'

function createVisitorId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  // 普通 HTTP 页面也可使用 getRandomValues，按 UUID v4 规范设置版本位和变体位。
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

// 首次请求点赞时生成访客 ID，之后复用浏览器中保存的值。
export function getVisitorId(): string {
  const saved = localStorage.getItem(VISITOR_ID_KEY)
  if (saved) return saved

  const visitorId = createVisitorId()
  localStorage.setItem(VISITOR_ID_KEY, visitorId)
  return visitorId
}

// 本地缓存用于恢复按钮状态，服务端按访客 ID 和文章 ID 去重。
function getLikedArticleIds(): number[] {
  const saved = localStorage.getItem(LIKED_ARTICLES_KEY)
  if (!saved) return []

  try {
    const ids = JSON.parse(saved)
    return Array.isArray(ids)
      ? ids.filter((id): id is number => Number.isInteger(id) && id > 0)
      : []
  } catch {
    // 缓存格式损坏时按空列表处理。
    return []
  }
}

// 判断当前浏览器是否记录过指定文章的点赞状态。
export function hasLikedArticle(articleId: number): boolean {
  return getLikedArticleIds().includes(articleId)
}

// 记录文章点赞状态，避免刷新页面后重复发起已经完成的点赞请求。
export function markArticleLiked(articleId: number): void {
  const ids = getLikedArticleIds()
  if (ids.includes(articleId)) return

  localStorage.setItem(LIKED_ARTICLES_KEY, JSON.stringify([...ids, articleId]))
}
