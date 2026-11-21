<script setup lang="ts">
import ArticleBody from './ArticleBody.vue'
import ArticleToc from './ArticleToc.vue'
import ContentImage from '../ContentImage.vue'
import type { ArticleDetail } from '../../types/public'
import type { ArticleHeading } from '../../utils/richText'

defineProps<{
  article: ArticleDetail
  content: string
  headings: ArticleHeading[]
}>()
</script>

<template>
  <div class="reader-cover mt-7">
    <ContentImage :src="article.cover" :alt="article.title" :tone="article.id" />
  </div>

  <div class="mx-auto max-w-[1000px]">
    <header class="mx-auto mt-8 text-center">
      <h1 class="editorial-title text-[clamp(34px,4.2vw,52px)] leading-[1.3]">
        {{ article.title }}
      </h1>
      <p class="mt-4 text-[11px] text-muted">
        {{ article.views }} 次阅读 · {{ article.likes }} 人喜欢
      </p>
    </header>

    <div class="reader-layout">
      <ArticleBody :content="content" />
      <ArticleToc :headings="headings" />
    </div>
  </div>
</template>

<style scoped lang="less">
.reader-cover {
  height: 336px;
  overflow: hidden;
  border-radius: 4px;
}

.reader-layout {
  width: min(100%, 900px);
  margin: 32px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 640px) 190px;
  gap: 70px;
  align-items: start;
}

@media (max-width: 780px) {
  .reader-cover {
    height: 300px;
  }

  .reader-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 470px) {
  header {
    text-align: left;
  }

  .reader-cover {
    height: 230px;
  }
}
</style>
