<script setup lang="ts">
import { ElButton, ElEmpty, ElSkeleton, ElSkeletonItem } from 'element-plus'
import ArticleCard from './ArticleCard.vue'
import type { ArticleSummary } from '../types/public'

// 首页与文章页共享同一内容流，分页、加载和空状态均在这里统一维护。
withDefaults(defineProps<{
  articles: ArticleSummary[]
  loading?: boolean
  hasMore?: boolean
  emptyText?: string
}>(), {
  loading: false,
  hasMore: false,
  emptyText: '暂时还没有文章',
})

// 子组件只发出“加载更多”意图，由页面根据自身分页状态发起请求。
const emit = defineEmits<{
  loadMore: []
}>()
</script>

<template>
  <!-- 单列固定为 720px 阅读宽度，靠封面比例形成纵向瀑布流节奏 -->
  <div class="reading-column mt-6 flex flex-col gap-[18px]">
    <!-- 首次加载时显示接近真实卡片高度的骨架，避免页面突然跳动 -->
    <template v-if="loading && articles.length === 0">
      <div
        v-for="index in 3"
        :key="index"
        class="overflow-hidden rounded-[5px] border border-black/10 bg-surface"
      >
      <!-- 骨架屏，显示动画效果 -->
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="image" :style="{ height: index === 2 ? '350px' : '250px' }" />
            <div class="p-5">
              <el-skeleton-item variant="text" style="width: 28%" />
              <el-skeleton-item variant="h3" style="width: 74%; margin-top: 14px" />
              <el-skeleton-item variant="text" style="width: 92%; margin-top: 12px" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </template>
    <!-- 没有文章时 -->
    <el-empty v-else-if="!articles.length" :description="emptyText" />

    <!-- 数据就绪后统一复用 ArticleCard，页面不再复制卡片模板 -->
    <template v-else>
      <ArticleCard
        v-for="(article, index) in articles"
        :key="article.id"
        :article="article"
        :index="index"
      />
    </template>

    <!-- 由读者明确点击加载下一页，不使用不可控的无限滚动 -->
    <div v-if="hasMore && !loading" class="pt-5 text-center">
      <el-button round @click="emit('loadMore')">加载更多文章</el-button>
    </div>
    <div v-if="loading && articles.length" class="py-5 text-center text-xs text-muted">
      正在加载更多文章…
    </div>
  </div>
</template>
