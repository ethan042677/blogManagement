import http, { API_BASE_URL, unwrap } from './http'
import type {
  ArticleDetail,
  ArticleSummary,
  Category,
  CommentPage,
  CreateCommentResult,
  DiaryEntry,
  Paginated,
  PhotoCollection,
  SiteSummary,
} from '../types/public'

// 文章和摄影列表使用相同查询字段，抽成公共参数类型。
export interface FeedQuery {
  page?: number
  pageSize?: number
  categoryId?: number | null
  search?: string
}

// 页面只调用这里的方法，不直接散落 Axios 请求。
export const publicApi = {
  // 首页顶部展示公开文章、摄影和日记数量。
  summary: () => unwrap<SiteSummary>(http.get('/public/site')),

  // 公开文章接口在后端强制限定“已发布 + 文章类型”。
  articles: (params: FeedQuery) => unwrap<Paginated<ArticleSummary>>(
    http.get('/public/articles', { params }),
  ),

  article: (id: number) => unwrap<ArticleDetail>(
    http.get(`/public/articles/${id}`),
  ),

  // classify：0 表示文章分类，1 表示摄影分类。
  categories: (classify: 0 | 1) => unwrap<Category[]>(
    http.get('/public/categories', { params: { classify } }),
  ),

  // 点赞只返回最新聚合数量，不提交或接收用户标识。
  like: (id: number) => unwrap<{ likes: number }>(
    http.post(`/public/articles/${id}/like`),
  ),

  // 评论读取和创建均走独立的公开接口。
  comments: (id: number) => unwrap<CommentPage>(
    http.get(`/public/articles/${id}/comments`),
  ),

  // 创建评论后返回新评论和本小时剩余额度。
  createComment: (id: number, value: { name: string; content: string }) => unwrap<CreateCommentResult>(
    http.post(`/public/articles/${id}/comments`, value),
  ),

  // 摄影列表复用文章表，通过 classify=1 在后端筛选。
  photos: (params: FeedQuery) => unwrap<Paginated<PhotoCollection>>(
    http.get('/public/photos', { params }),
  ),

  photo: (id: number) => unwrap<PhotoCollection>(
    http.get(`/public/photos/${id}`),
  ),

  diaries: (params: { page?: number; pageSize?: number }) => unwrap<Paginated<DiaryEntry>>(
    http.get('/public/diaries', { params }),
  ),

  // 访问统计只提交路径与设备类型，不提交用户身份。
  // 访问统计数据：提交后端访问路径和设备类型
  trackVisit: (value: { path: string; device: number }) => http.post('/public/visits', value),
}

export { API_BASE_URL }
