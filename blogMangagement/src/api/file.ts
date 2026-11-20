import axios from 'axios'
import { type FileData } from '../utils/interface'
import request from '../utils/request'

const directUpload = axios.create({
    timeout: 0,
})

type UploadTicket = {
    id: number
    url: string
    headers: Record<string, string>
}

type UploadStatus = {
    id: number
    status: 'pending' | 'processing' | 'ready' | 'failed'
    errorMessage?: string
    file?: FileData
}

// 统一取出后端发出数据中的 data，无需重复写 response.data.data
//解析经过axios包装后的返回数据
const unwrap = async <T>(promise: Promise<{ data: { code: number; data: T } }>): Promise<T> => {
    const response = await promise
    // 业务错误已由 axios 响应拦截器统一处理
    return response.data.data
}
const sleep = (ms: number) => {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
}
//轮询等待
const waitForReady = async (fileId: number) => {
    const deadline = Date.now() + 120_000 // 设置 2 分钟超时

    while (Date.now() < deadline) {
        await sleep(800) // 每 800ms 请求一次（不要请求太快）

        const state = await unwrap<UploadStatus>(
            request.get(`/admin/uploads/${fileId}`),
        )

        if (state.status === 'ready' && state.file) return state.file // 成功
        if (state.status === 'failed') throw new Error(state.errorMessage || '文件处理失败') // 失败抛错
    }

    throw new Error('文件处理超时')
}

//上传
export const uploadOne = async (
    file: File,
    categoryId: number,
    articleId?: number,
): Promise<FileData> => {
    // 文章编辑器传入 articleId 后，后端会把对象写入文章专属前缀。
    // 该标记不会写入 local_file 新字段，仍由现有 storage_key 表达归属。
    if (articleId && !file.type.startsWith('image/')) {
        throw new Error('文章只允许上传图片')
    }
    //向后端拿通行签名url
    const ticket = await unwrap<UploadTicket>(
        request.post('/admin/uploads/presign',{
            fileName:file.name,
            mimeType:file.type,
            size:file.size,
            categoryId,
            usage: articleId ? 'article' : 'file',
            articleId,
        })
    )
    //不带JWT拦截的request
    await directUpload.put(ticket.url,file,{
        headers : ticket.headers
    })
    //确认
    await request.post('/admin/uploads/confirm', {
        id: ticket.id,
    })
    return waitForReady(ticket.id)
}
