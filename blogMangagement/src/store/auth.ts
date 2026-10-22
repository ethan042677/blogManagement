// [联调新增] 登录状态集中保存到 Pinia 与 localStorage。
import { defineStore } from 'pinia'
import { authApi } from '../api'
import { TOKEN_KEY } from '../utils/request'

const NAME_KEY = 'blog_admin_name'

export const useAuthStore = defineStore('auth', {
    // 从本地存储恢复 token 和管理员名称
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY) || '',
        name: localStorage.getItem(NAME_KEY) || '',
    }),
    getters: {
        // 当前是否已经登录
        isLoggedIn: (state) => Boolean(state.token),
    },
    actions: {
        // 登录成功后保存 token 和管理员名称
        async login(name: string, password: string) {
            const data = await authApi.signin(name, password)
            this.token = data.token
            this.name = data.name
            localStorage.setItem(TOKEN_KEY, data.token)
            localStorage.setItem(NAME_KEY, data.name)
        },
        // 退出登录：清空 Pinia 和 localStorage 中的登录信息
        logout() {
            this.token = ''
            this.name = ''
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(NAME_KEY)
        },
    },
})
