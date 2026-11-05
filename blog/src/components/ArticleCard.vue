<script setup lang="ts">
import { computed } from 'vue'
import ContentImage from './ContentImage.vue'
import type { ArticleSummary } from '../types/public'
import { formatDate } from '../utils/date'

const props = defineProps<{
  article: ArticleSummary
  index: number
}>()

// 单列瀑布流不做多栏排版，但仍用三种封面高度形成纵向节奏。
const imageClass = computed(() => {
  const cycle = props.index % 3
  return cycle === 1 ? 'h-[350px] max-[470px]:h-[300px]' : cycle === 2 ? 'h-[190px] max-[470px]:h-[220px]' : 'h-[250px] max-[470px]:h-[220px]'
})
</script>

<template>
  <!-- 整张卡片是语义化链接，键盘和触屏都能直接进入文章详情 -->
  <RouterLink
    :to="`/articles/${article.id}`"
    class="article-card group block overflow-hidden rounded-[5px] border border-black/10 bg-surface no-underline"
  >
    <div :class="imageClass">
      <ContentImage :src="article.cover" :alt="article.title" :tone="index" />
    </div>
    <!-- 标题、分类与公开统计保持在同一个阅读顺序中 -->
    <div class="px-5 pb-5 pt-4">
      <!-- 分类与日期 -->
      <div class="flex items-center justify-between gap-4 text-[10px] text-muted">
        <b class="font-semibold text-cobalt">{{ article.categoryName || '未分类' }}</b>
        <time :datetime="article.moment">{{ formatDate(article.moment) }}</time>
      </div>
      <!-- 标题 -->
      <h2 class="editorial-title mt-2 text-[22px] leading-[1.45] transition-colors group-hover:text-cobalt">
        {{ article.title }}
      </h2>
      <!-- 文章简介 -->
      <p v-if="article.introduction" class="mt-2 line-clamp-2 text-[11px] leading-7 text-muted">
        {{ article.introduction }}
      </p>
      <!-- 阅读次数，喜欢 -->
      <div class="mt-4 flex items-center justify-between gap-4 border-t border-line pt-3 text-[10px] text-muted">
        <span>{{ article.views }} 阅读 · {{ article.likes }} 喜欢</span>
        <span class="font-semibold text-ink">阅读全文 ↗</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped lang="less">
.article-card {
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(38, 41, 47, 0.045);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 13px 28px rgba(38, 41, 47, 0.09);
}

@media (prefers-reduced-motion: reduce) {
  .article-card {
    transition: none;
  }
}
</style>
