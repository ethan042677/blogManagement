import { createWebHistory, createRouter } from 'vue-router'

import IndexView from '../views/IndexView.vue'
import { TOKEN_KEY } from '../utils/request'

const routes = [
    {
        // 登录页：管理页面需要先获取 JWT
        path: '/login',
        component: () => import('../views/LoginView.vue'),
        meta: { public: true },
    },
    {
        path: '/',
        component: IndexView,
        redirect: '/overview',
        children: [
            {
                path: 'overview',
                component: () => import('../views/OverView.vue'), // 懒加载
            },
            {
                path: 'localfile',
                component: () => import('../views/LocalFileView.vue'), // 懒加载
            },
            {
                path: 'article',
                component: () => import('../views/ArticleView.vue'), // 懒加载
            },
            {
                path: 'gallery',
                component: () => import('../views/GalleryView.vue'), // 懒加载
            },
            {
                path: 'diary',
                component: () => import('../views/DiaryView.vue'), // 懒加载
            },
            {
                path: 'setting',
                component: () => import('../views/SettingView.vue'), // 懒加载
            },
        ],
    },
    {
        // 全屏图库编辑页，不套 IndexView，所以没有左侧导航栏
        path: '/editGallery',
        component: () => import('../views/EditGallery.vue'), // 懒加载
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 路由守卫：无 token 时统一跳转登录，已登录时不重复进入登录页
router.beforeEach((to) => {
    if (!to.meta.public && !localStorage.getItem(TOKEN_KEY)) {
        return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (to.path === '/login' && localStorage.getItem(TOKEN_KEY)) {
        return '/overview'
    }
    return true
})

export default router;
