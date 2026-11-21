<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElButton } from 'element-plus'
import ArticleActions from '../components/article/ArticleActions.vue'
import ArticleReader from '../components/article/ArticleReader.vue'
import ArticleSkeleton from '../components/article/ArticleSkeleton.vue'
import ArticleTocDrawer from '../components/article/ArticleTocDrawer.vue'
import CommentSection from '../components/CommentSection.vue'
import { useArticleActions } from '../composables/useArticleActions'
import { useArticleDetail } from '../composables/useArticleDetail'
import { useArticleToc } from '../composables/useArticleToc'

// 详情视图只负责组合文章状态与各个独立区域。
const {
  article,
  error,
  headings,
  loading,
  renderedContent,
  reload,
} = useArticleDetail()
const {
  likeArticle,
  liking,
  scrollToComments,
  shareArticle,
} = useArticleActions(article)
const {
  activeHeadingId,
  handleTocClosed,
  selectHeading,
  tocOpen,
} = useArticleToc({ error, headings, loading })
</script>

<template>
  <div class="page-shell rounded-[5px] reader-page">
    <ArticleTocDrawer
      :active-heading-id="activeHeadingId"
      :headings="headings"
      :open="tocOpen"
      @update:open="tocOpen = $event"
      @select="selectHeading"
      @closed="handleTocClosed"
    />

    <RouterLink to="/articles" class="subtle-link mt-7 ml-2">
      <el-icon><ArrowLeft /></el-icon>
      返回文章
    </RouterLink>

    <ArticleSkeleton v-if="loading" />

    <el-empty v-else-if="error" :description="error">
      <el-button type="primary" @click="reload">重新加载</el-button>
    </el-empty>

    <template v-else-if="article">
      <ArticleReader
        :article="article"
        :content="renderedContent"
        :headings="headings"
      />
      <ArticleActions
        :likes="article.likes"
        :loading="liking"
        @like="likeArticle"
        @comment="scrollToComments"
        @share="shareArticle"
      />
      <CommentSection :article-id="article.id" />
    </template>
  </div>
</template>

<style scoped lang="less">
.reader-page {
  padding-bottom: 60px;
}
</style>
