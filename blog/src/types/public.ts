// 后端公开接口统一返回 code、msg、data；code 非 200 时由 Axios 拦截器统一抛错。
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 所有分页接口共享同一结构，页面无需为文章、摄影和日记重复声明。
export interface Paginated<T> {
  count: number
  page: number
  pageSize: number
  list: T[]
}

// 分类只暴露公开展示所需字段，不包含后台创建时间等管理信息。
export interface Category {
  id: number
  name: string
  count: number
}

// 文章卡片与首页复用该摘要结构，减少组件之间的数据转换。
export interface ArticleSummary {
  id: number
  title: string
  introduction: string
  cover: string
  categoryId: number | null
  categoryName: string
  labels: string[]
  moment: string
  views: number
  likes: number
  comments: number
  readMinutes: number
}

// 详情在摘要基础上增加正文与更新时间。
export interface ArticleDetail extends ArticleSummary {
  content: string
  updatedAt: string
}

// 摄影沿用文章基础字段，但正文内容被转换成有序图片地址数组。
export interface PhotoCollection extends ArticleSummary {
  pictures: string[]
}

// 日记与天气信息由公开接口组装好，前端只负责时间轴展示。
export interface DiaryEntry {
  id: number
  title: string
  content: string
  moment: string
  pictures: string[]
  weatherId: number
  weatherName: string
  weatherIcon: string
  mood: number
}

// 匿名评论只包含读者主动填写的名称和内容，不携带用户 ID。
export interface PublicComment {
  id: number
  name: string
  content: string
  moment: string
}

// 评论列表额外返回总数，用于详情页标题计数。
export interface CommentPage {
  count: number
  list: PublicComment[]
}

// 创建评论后服务端返回新评论及本小时剩余次数，前端据此同步界面。
export interface CreateCommentResult {
  comment: PublicComment
  remaining: number | null
}

// 首页统计只展示公开内容数量。
export interface SiteSummary {
  articles: number
  photos: number
  diaries: number
}
