// [联调新增] axios 统一实例：集中处理 API 地址、JWT、业务错误和登录失效。
import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const TOKEN_KEY = 'blog_admin_token'//token的key(在localstorage中读)

// 创建全局 axios 实例，所有接口统一使用该实例，自动响应拦截器，补全url
const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,//超时
})

// 请求拦截器：每次请求自动携带本地保存的 JWT
request.interceptors.request.use((config) => {
    // 只从 localStorage 读取，页面组件不重复处理 token
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        //检查是否有token,如果有则将Bearer token验证机制携带进请求头
        config.headers.Authorization = `Bearer ${token}` //http头
    }
    return config
})

// 响应拦截器：统一处理业务错误和登录失效
request.interceptors.response.use(
    (response) => {
        const payload = response.data
        if (payload && typeof payload.code === 'number' && payload.code !== 200) {
            return Promise.reject(new Error(payload.msg || '请求失败'))
        }
        return response
    },
    (error) => {
        // token 失效时清理登录状态并跳回登录页
        if (error.response?.status === 401) {
            //清除token
            localStorage.removeItem(TOKEN_KEY)
            //如果不在登录页则跳转登录页
            if (window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }
        const message = error.response?.data?.msg || error.message || '网络请求失败'
        return Promise.reject(new Error(message))
    },
)

// 本地图片地址转换：/files/xxx 会自动拼接后端地址，返回处理后的url
export const resolveAssetUrl = (url?: string) => {
    // 外链和 blob/data 地址保持原样
    if (!url) return ''
    //如果这个地址已经以这几种协议开头，就直接返回
    if (/^(https?:|data:|blob:)/.test(url)) return url
    //真正处理url
    if (url.startsWith('/files/')) return `${API_BASE_URL}${url}`
    return url
}

export { TOKEN_KEY }
export default request
