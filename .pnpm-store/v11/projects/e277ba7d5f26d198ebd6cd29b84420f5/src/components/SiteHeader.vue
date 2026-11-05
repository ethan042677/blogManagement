<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Search } from '@element-plus/icons-vue'

// 全站导航只在这里维护一份，桌面端和移动端复用同一数据源。
const route = useRoute()
const router = useRouter()
const searchOpen = ref(false)
//搜索词
const searchTerm = ref('')
//导航栏
const navItems = [
  { label: '首页', name: 'home', to: '/' },
  { label: '文章', name: 'articles', to: '/articles' },
  { label: '摄影', name: 'photography', to: '/photography' },
  { label: '日记', name: 'diary', to: '/diary' },
  { label: '关于', name: 'about', to: '/about' },
]

// 详情页仍高亮所属栏目，避免进入文章后导航失去当前位置。
// 如果点进单个文章，则文章导航高亮，如果点击单个摄影图片，则摄影导航高亮
const activeName = computed(() => {
  if (route.name === 'article-detail' || route.name === 'photo-detail') {
    return route.name === 'photo-detail' ? 'photography' : 'articles'
  }
  return String(route.name || 'home')
})

// 搜索统一跳转到文章页，如果有关键词，则用query携带关键词，没有则携带空对象
function submitSearch(): void {
  //去除空格后的关键词
  const search = searchTerm.value.trim()
  searchOpen.value = false
  void router.push({
    name: 'articles',
    query: search ? { search } : {},
  })
}
</script>

<template>
  <!-- 顶部品牌与主导航 -->
  <header class="site-container flex min-h-[74px] items-center justify-between gap-6 border-b border-line">
    <RouterLink to="/" class="shrink-0 text-left" aria-label="伊森随笔首页">
      <strong class="block font-editorial text-[15px] tracking-[0.08em]">伊森随笔</strong>
      <small class="mt-px block text-[9px] tracking-[0.16em] text-muted">ETHAN'S NOTES</small>
    </RouterLink>

    <nav class="hidden items-center gap-7 md:flex" aria-label="主导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-link"
        :class="{ 'is-active': activeName === item.name }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- 搜索使用 Element Plus 浮层，避免在页头长期占用输入框宽度 -->
    <el-popover
      v-model:visible="searchOpen"
      placement="bottom-end"
      :width="300"
      trigger="click"
      popper-class="search-popper"
    >
      <template #reference>
        <el-button round class="!h-9 !px-4 !text-[11px]">
          <el-icon class="mr-1.5"><Search /></el-icon>
          搜索
        </el-button>
      </template>
      <form class="flex items-center gap-2" @submit.prevent="submitSearch">
        <el-input
          v-model="searchTerm"
          size="large"
          clearable
          autofocus
          placeholder="搜索标题、简介或正文"
          aria-label="搜索文章"
        />
        <el-button type="primary" size="large" :icon="ArrowRight" aria-label="提交搜索" @click="submitSearch" />
      </form>
    </el-popover>
  </header>

  <!-- 窄屏把同一导航放到第二行，保证五个栏目都能直接点击 -->
  <nav class="mobile-nav site-container md:hidden" aria-label="移动端主导航">
    <RouterLink
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="nav-link py-3"
      :class="{ 'is-active': activeName === item.name }"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<style scoped lang="less">
.nav-link {
  position: relative;
  color: var(--muted);
  font-size: 13px;
  text-decoration: none;
}

.nav-link::after {
  position: absolute;
  right: 50%;
  bottom: -1px;
  left: 50%;
  height: 2px;
  content: "";
  background: var(--blue);
  transition: right 160ms ease, left 160ms ease;
}

.nav-link.is-active {
  color: var(--ink);
  font-weight: 700;
}

.nav-link.is-active::after {
  right: 0;
  left: 0;
}

.mobile-nav {
  display: none;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
}

/* 使用组件自身断点控制移动导航，避免 scoped 样式覆盖 Tailwind 的 md:hidden。 */
@media (max-width: 767px) {
  .mobile-nav {
    display: flex;
  }
}

@media (max-width: 470px) {
  .nav-link {
    font-size: 10px;
  }
}
</style>
