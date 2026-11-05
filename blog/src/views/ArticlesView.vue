<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElAlert, ElInput } from 'element-plus'
import ArticleFeed from '../components/ArticleFeed.vue'
import PageIntro from '../components/PageIntro.vue'
import { publicApi } from '../api/public'
import type { ArticleSummary, Category } from '../types/public'

// 当前页面同时维护筛选条件、分页游标和加载状态，查询条件变化后统一回到第一页。
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const loadingMore = ref(false)//加载更多
const error = ref('')//错误信息
const articles = ref<ArticleSummary[]>([])//文章列表
const categories = ref<Category[]>([])//分类列表
const activeCategory = ref<number | null>(null)//文章所属分类
const search = ref(String(route.query.search || ''))//搜索词
const count = ref(0)//文章总数
const page = ref(1)//当前页数
const pageSize = 8

// 已加载条数小于后端总数时才显示“加载更多”。
const hasMore = computed(() => articles.value.length < count.value)

// getArticles 同时服务首次查询、筛选切换和追加分页，减少重复请求代码。
const getArticles = async (reset = true): Promise<void> => {
  if (reset) {
    //如果重新加载，则重新加载
    loading.value = true
    page.value = 1
  } else {
    loadingMore.value = true
  }
  //清除之前的错误信息
  error.value = ''
  try {
    const data = await publicApi.articles({
      page: page.value,
      pageSize,
      categoryId: activeCategory.value,
      search: search.value.trim() || undefined,
    })
    //如果重新加载，则直接渲染重新请求的数据，如果是加载更多，则渲染下一页
    articles.value = reset ? data.list : [...articles.value, ...data.list]
    //文章总数
    count.value = data.count
  } catch (caught) {
    // 错误信息
    error.value = caught instanceof Error ? caught.message : '文章加载失败'
  } finally {
    //无论是否异常，设置为false
    loading.value = false
    loadingMore.value = false
  }
}

// 分类切换属于本地筛选动作，直接重新请求第一页。
const chooseCategory = (id: number | null): void => {
  activeCategory.value = id
  void getArticles()
}

// 搜索词写入 URL，刷新或分享文章列表时可以保留查询条件。
const applySearch = (): void => {
  //搜索词
  const value = search.value.trim()
  //如果URL中的搜索词等于之前的搜索词就直接获取数据，如果
  if (String(route.query.search || '') === value) {
    void getArticles()
  } else {
    void router.replace({ query: value ? { search: value } : {} })
  }
}

// 下一页：追加下一页时不先清空已有文章，防止列表闪烁。
const loadMore = (): void => {
  page.value += 1
  void getArticles(false)
}


// 浏览器前进后退导致搜索参数变化时，让输入框和请求参数保持同步。
watch(
  //对URL中的搜索词进行监听
  () => route.query.search,
  (value) => {
    //将变化的搜索词赋值给search,并重新请求数据
    search.value = String(value || '')
    void getArticles()
  },
)

onMounted(async () => {
  // 分类失败不应阻断文章列表，因此分类接口单独降级为空数组。
  try {
    //请求获取标签列表
    categories.value = await publicApi.categories(0)
  } catch {
    categories.value = []
  }
  await getArticles()
})
</script>

<template>
  <div class="page-shell">
    <PageIntro
      eyebrow="writing · personal essays"
      before="情以物迁，"
      highlight="辞以情发。"
      description=""
    />

    <div class="reading-column flex flex-wrap items-center gap-2 py-5">
      <!-- 全部按钮：没有选中具体分类时默认高亮全部按钮 -->
      <button
        type="button"
        class="filter-pill"
        :class="{ active: activeCategory === null }"
        @click="chooseCategory(null)"
      >
        全部
      </button>
      <!-- 具体分类按钮 -->
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="filter-pill"
        :class="{ active: activeCategory === category.id }"
        @click="chooseCategory(category.id)"
      >
        {{ category.name }} {{ category.count }}
      </button>
      <!-- 搜索框，按下enter执行搜索，点击×时，清空搜索词，重新获取文章列表 -->
      <el-input
        v-model="search"
        class="search-field ml-auto"
        clearable
        placeholder="搜索文章"
        @keyup.enter="applySearch"
        @clear="applySearch"
      />
    </div>

    <p class="reading-column m-0 pb-2 text-right text-[10px] text-muted" aria-live="polite">
      {{ activeCategory === null ? '全部文章' : categories.find(item => item.id === activeCategory)?.name }} · {{ count }} 篇
    </p>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
    <!-- 没有错误则渲染文章列表 -->
    <ArticleFeed
      v-else
      :articles="articles"
      :loading="loading || loadingMore"
      :has-more="hasMore"
      empty-text="没有找到符合条件的文章"
      @load-more="loadMore"
    />
  </div>
</template>

<style scoped lang="less">
.filter-pill {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
}

.filter-pill:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.filter-pill.active {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
  font-weight: 700;
}

.search-field {
  width: min(100%, 180px);
}

@media (max-width: 470px) {
  .search-field {
    width: 100%;
    margin-left: 0;
  }
}
</style>
