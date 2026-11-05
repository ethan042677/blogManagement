import axios from 'axios'
import type { ApiResponse } from '../types/public'

// 未配置环境变量时使用相对地址，由 Vite 代理到本地 Express 服务。
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// 前台专用 Axios 实例不挂 JWT，也不会在 401 时跳转后台登录页。
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// 把后端业务错误转换成普通 Error，页面只需处理统一的错误文案。
http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>
    if (payload && typeof payload.code === 'number' && payload.code !== 200) {
      return Promise.reject(new Error(payload.msg || '请求失败'))
    }
    return response
  },
  (error) => {
    const message = error.response?.data?.msg || error.message || '网络请求失败'
    return Promise.reject(new Error(message))
  },
)

// 统一解包 { code, msg, data }，避免每个页面重复读取 response.data.data。
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}

export default http
