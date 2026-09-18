import { createWebHistory, createRouter } from 'vue-router'

import IndexView from '../views/IndexView.vue'

const routes = [
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
                component: () => import('../views/ArticleView.vue'), // 懒加载
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router;