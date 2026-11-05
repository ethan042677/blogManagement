import { createRouter, createWebHistory } from 'vue-router'

// 使用 History 路由，使文章和摄影详情拥有可直接分享的地址。
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesView.vue'),
      meta: { title: '文章' },
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('../views/ArticleDetailView.vue'),
      meta: { title: '文章' },
    },
    {
      path: '/photography',
      name: 'photography',
      component: () => import('../views/PhotographyView.vue'),
      meta: { title: '摄影' },
    },
    {
      path: '/photography/:id',
      name: 'photo-detail',
      component: () => import('../views/PhotoDetailView.vue'),
      meta: { title: '摄影' },
    },
    {
      path: '/diary',
      name: 'diary',
      component: () => import('../views/DiaryView.vue'),
      meta: { title: '日记' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '关于' },
    },
    {
      // 404 页面继承同一套前台视觉，避免出现浏览器默认错误页。
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
  // 浏览器前进后退时恢复原位置，普通跳转则回到页面顶部。
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

// 路由切换后同步浏览器标题，供收藏夹和搜索结果直接识别页面。
router.afterEach((to) => {
  document.title = `${String(to.meta.title || '伊森随笔')} · 伊森随笔`
})

export default router
