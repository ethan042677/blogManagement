// 页面只调用这里的接口方法，不直接散落 axios 请求。
import request from '../utils/request'
import type { ArticleData, CategoryData, DiaryData, FileData, GalleryData, LabelData, ReplyData } from '../utils/interface'

type PageRequest = {
    pageSize?: number
    nowPage?: number
}

// 统一取出后端发出数据中的 data，无需重复写 response.data.data
//解析经过axios包装后的返回数据
const unwrap = async <T>(promise: Promise<{ data: { code: number; data: T } }>): Promise<T> => {
    const response = await promise
    // 业务错误已由 axios 响应拦截器统一处理
    return response.data.data
}

/** 登录相关接口 */
export const authApi = {
    // 管理员登录：提交账号密码并获取 token
    signin: (name: string, password: string) => unwrap<{ id: number; name: string; token: string }>(
        request.post('/signin', { name, password }),
    ),
}

/** 总览与统计接口 */
export const overviewApi = {
    // 获取总览数据：文章、图库、日记数量和文件大小
    get: () => unwrap<{ article: number; gallery: number; diary: number; file: string }>(
        request.post('/overview'),
    ),
    // 获取访问量：week 传 7，month 传 30
    visits: (length: number) => unwrap<{ date: string; count: number }[]>(
        request.post('/visits', { length }),
    ),
    // 获取数据监测：设备分布和网站内容分布
    survey: (length: number) => unwrap<{
        device: { key: string; name: string; value: number }[]
        website: { key: string; name: string; value: number }[]
    }>(request.post('/survey', { length })),
}

/** 文章与图库接口 */
export const articleApi = {
    // 获取文章/图库列表：支持分页、分类、状态、搜索和标签筛选
    list: (params: PageRequest & {
        classify: number
        state?: number
        categoryId?: number | string
        searchTerm?: string
        labelId?: number
    }) => unwrap<{ count: number; list: ArticleData[] | GalleryData[] }>(
        request.post('/article', params),
    ),
    // 获取文章状态统计：已发布和未发布数量
    stateCounts: () => unwrap<{ id: number; name: string; value: number }[]>(
        request.post('/articleState'),
    ),
    // 修改文章状态：发布或撤回
    changeState: (articleId: number, state: number) => unwrap<{ affected: number }>(
        request.post('/changeArticleState', { articleId, state }),
    ),
    // 删除文章或图库
    delete: (articleId: number) => unwrap<{ affected: number }>(
        request.post('/deleteArticle', { articleId }),
    ),
    // 新建文章或图库
    create: (value: Record<string, unknown>) => unwrap<ArticleData>(
        request.post('/createArticle', { value }),
    ),
    // 获取文章或图库详情：用于编辑
    get: (articleId: number) => unwrap<ArticleData>(
        request.post('/gainArticle', { articleId }),
    ),
    // 修改文章或图库
    update: (articleId: number, value: Record<string, unknown>) => unwrap<{ affected: number }>(
        request.post('/updateArticle', { articleId, value }),
    ),
}

/** 分类接口 */
export const categoryApi = {
    // 获取分类列表及每类内容数量
    list: (classify: number) => unwrap<{ count: number; list: CategoryData[] }>(
        request.post('/category', { classify }),
    ),
    // 新建分类
    add: (value: { name: string; classify: number; moment: string }) => unwrap<CategoryData>(
        request.post('/addCategory', { value }),
    ),
    // 修改分类名称
    rename: (categoryId: number, categoryName: string) => unwrap<{ affected: number }>(
        request.post('/updateCategoryName', { categoryId, categoryName }),
    ),
    // 删除分类：关联内容会变为未分类
    delete: (categoryId: number) => unwrap<{ affected: number }>(
        request.post('/deleteCategory', { categoryId }),
    ),
}

/** 标签接口 */
export const labelApi = {
    // 获取全部标签
    list: () => unwrap<LabelData[]>(request.post('/label')),
    // 新建标签
    add: (value: { name: string; moment: string }) => unwrap<LabelData>(
        request.post('/addLabel', { value }),
    ),
    // 删除标签
    delete: (labelId: number) => unwrap<{ affected: number }>(
        request.post('/deleteLabel', { labelId }),
    ),
}

/** 本地文件接口 */
export const fileApi = {
    // 获取本地文件列表：支持分页和分类筛选
    list: (params: PageRequest & { categoryId?: number | string }) => unwrap<{
        count: number
        list: FileData[]
    }>(request.post('/file', params)),
    // 上传本地文件：使用 FormData 提交
    upload: (files: File[], categoryId = -1) => {
        // 文件必须使用 FormData，不能按普通 JSON 提交
        const formData = new FormData()
        files.forEach((file) => formData.append('files', file))
        formData.append('categoryId', String(categoryId))
        return unwrap<FileData[]>(request.post('/uploadFile', formData))
    },
    // 删除文件：同时删除数据库记录和本地文件
    delete: (fileId: number | number[], filesUrl?: string | string[]) => unwrap<{ affected: number }>(
        request.post('/deleteFile', { fileId, filesUrl }),
    ),
    // 移动文件：支持单文件和批量移动
    move: (fileId: number | number[], categoryId: number) => unwrap<{ affected: number }>(
        request.post('/moveFile', { fileId, categoryId }),
    ),
}

/** 日记接口 */
export const diaryApi = {
    // 获取日记列表：支持分页和关键词搜索
    list: (params: PageRequest & { searchTerm?: string }) => unwrap<{
        count: number
        list: DiaryData[]
    }>(request.post('/diary', params)),
    // 新建日记：保存正文、天气和图片
    create: (value: Record<string, unknown>) => unwrap<DiaryData>(
        request.post('/createDiary', { value }),
    ),
    // 删除日记
    delete: (diaryId: number) => unwrap<{ affected: number }>(
        request.post('/deleteDiary', { diaryId }),
    ),
}

/** 评论与私信接口 */
export const replyApi = {
    // 获取评论列表
    comments: (params: PageRequest) => unwrap<{ count: number; list: ReplyData[] }>(
        request.post('/comment', params),
    ),
    // 删除评论
    deleteComment: (id: number) => unwrap<{ affected: number }>(
        request.post('/deleteComment', { id }),
    ),
    // 获取私信列表，并自动标记已读
    messages: (params: PageRequest) => unwrap<{ count: number; list: ReplyData[] }>(
        request.post('/message', params),
    ),
    // 删除私信
    deleteMessage: (id: number) => unwrap<{ affected: number }>(
        request.post('/deleteMessage', { id }),
    ),
}

/** 天气接口 */
export const weatherApi = {
    // 获取天气列表
    list: () => unwrap<{ id: number; name: string; icon: string }[]>(request.post('/weather')),
}
