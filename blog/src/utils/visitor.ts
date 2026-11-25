const VISITOR_ID_KEY = 'blog_visitor_id'
const LIKED_ARTICLES_KEY = 'blog_liked_articles'

// 首次请求点赞时生成访客 ID，之后复用浏览器中保存的值。
export function getVisitorId(): string {
  const saved = localStorage.getItem(VISITOR_ID_KEY)
  if (saved) return saved

  const visitorId = crypto.randomUUID()
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
