<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ChatDotRound, Share, Star } from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElSkeleton, ElSkeletonItem } from 'element-plus'
import CommentSection from '../components/CommentSection.vue'
import ContentImage from '../components/ContentImage.vue'
import { publicApi } from '../api/public'
import type { ArticleDetail } from '../types/public'
import { formatDate } from '../utils/date'
import { addHeadingIds, sanitizeRichText } from '../utils/richText'

// 详情页负责文章读取、正文安全处理、点赞与分享；评论逻辑由独立组件维护。
const route = useRoute()
const loading = ref(true)
const liking = ref(false)
const error = ref('')//错误信息
const article = ref<ArticleDetail | null>(null)
const headings = ref<{ id: string; text: string }[]>([])
const renderedContent = ref('')

const articleId = computed(() => Number(route.params.id))

// 文章正文先经过 DOMPurify，再为标题补 id 以生成目录。
const loadArticle = async(): Promise<void> => {
  loading.value = true
  error.value = ''
  try {
    // 获取文章
    const data = await publicApi.article(articleId.value)
    article.value = data
    // 移出文本的内联脚本等
    const safe = sanitizeRichText(data.content)
    // 为文章目录生成稳定锚点
    const processed = addHeadingIds(safe)
    renderedContent.value = processed.html || `<p>${data.introduction || '这篇文章还没有正文。'}</p>`
    headings.value = processed.headings
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '文章加载失败'
  } finally {
    loading.value = false
  }
}

// 点赞接口只返回最新总数，前端不保存“我是否点赞”等用户状态。
async function likeArticle(): Promise<void> {
  if (!article.value || liking.value) return;
  liking.value = true
  try {
    const data = await publicApi.like(article.value.id)
    article.value.likes = data.likes
    ElMessage.success('喜欢已记录')
  } catch (caught) {
    ElMessage.error(caught instanceof Error ? caught.message : '操作失败')
  } finally {
    liking.value = false
  }
}

// 支持系统原生分享；不支持时退化为复制当前链接。
async function shareArticle(): Promise<void> {
  if (!article.value) return
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: article.value.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      ElMessage.success('链接已复制')
    }
  } catch {
    // 用户取消分享时不提示错误。
  }
}

// 评论按钮只负责滚动定位，评论加载与提交全部封装在 CommentSection。
async function scrollToComments(): Promise<void> {
  await nextTick()
  document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(articleId, loadArticle)
// 生命周期
onMounted(loadArticle)
</script>

<template>
  <div class="page-shell shadow-md rounded-[5px] reader-page">
    <!-- 详情页从文章列表进入，并提供明确的返回路径 -->
    <RouterLink to="/articles" class="subtle-link mt-7 ml-2">
      <el-icon><ArrowLeft /></el-icon>
      返回文章
    </RouterLink>

    <!-- 骨架屏：正文加载期间使用与最终排版相似的结构骨架 -->
    <div v-if="loading" class="reader-loading">
      <el-skeleton animated>
        <template #template>
          <div class="mx-auto max-w-[760px] text-center">
            <el-skeleton-item variant="text" style="width: 20%; margin-inline: auto" />
            <el-skeleton-item variant="h1" style="width: 72%; margin: 22px auto 0; height: 52px" />
            <el-skeleton-item variant="text" style="width: 42%; margin: 16px auto 0" />
          </div>
          <el-skeleton-item variant="image" style="height: 336px; margin-top: 28px" />
          <div class="mx-auto mt-9 max-w-[640px]">
            <el-skeleton-item v-for="index in 7" :key="index" variant="text" style="margin-top: 14px" />
          </div>
        </template>
      </el-skeleton>
    </div>
    <!-- 报错 -->
    <el-empty v-else-if="error" :description="error">
      <el-button type="primary" @click="loadArticle">重新加载</el-button>
    </el-empty>
    <!-- 正常渲染文章内容 -->
    <template v-else-if="article" >
      <header class="mx-auto mt-8 max-w-[780px] text-center">
        <!-- 文章分类与创建时间 -->
        <div class="text-[10px] font-semibold tracking-[0.13em] text-cobalt">
          {{ article.categoryName || '文章' }} · {{ formatDate(article.moment) }}
        </div>
        <!-- 文章标题 -->
        <h1 class="editorial-title mt-3 text-[clamp(34px,4.2vw,52px)] leading-[1.3]">
          {{ article.title }}
        </h1>
        <!-- 文章阅读次数与喜欢 -->
        <p class="mt-4 text-[11px] text-muted">
          {{ article.views }} 次阅读 · {{ article.likes }} 人喜欢
        </p>
      </header>

      <div class="reader-cover mt-7">
        <ContentImage :src="article.cover" :alt="article.title" :tone="article.id" />
      </div>

      <!-- 桌面端为正文与目录双栏，窄屏由样式自动隐藏目录 -->
      <div class="reader-layout">
        <!-- 正文 -->
        <article class="article-content" v-html="renderedContent" />
        <!-- 目录 -->
        <aside v-if="headings.length" class="toc" aria-label="文章目录">
          <span>本文目录</span>
          <a v-for="heading in headings" :key="heading.id" :href="`#${heading.id}`">
            {{ heading.text }}
          </a>
        </aside>
      </div>

      <div class="reader-actions">
        <el-button round :icon="Star" :loading="liking" @click="likeArticle">
          喜欢 {{ article.likes }}
        </el-button>
        <el-button round :icon="ChatDotRound" @click="scrollToComments">
          评论
        </el-button>
        <el-button round :icon="Share" @click="shareArticle">分享</el-button>
      </div>

      <!-- 评论无需登录，只需填写名称和正文；每小时限制由服务端执行 -->
      <CommentSection :article-id="article.id" />
    </template>
  </div>
</template>

<style scoped lang="less">
.reader-page {
  padding-bottom: 60px;
}

.reader-loading {
  padding: 38px 0;
}

.reader-cover {
  height: 336px;
  overflow: hidden;
  border-radius: 4px;
}

.reader-layout {
  width: min(100%, 900px);
  margin: 34px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 640px) 190px;
  gap: 70px;
  align-items: start;
}

.article-content {
  min-width: 0;
  color: #343531;
  font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
  font-size: 15px;
  line-height: 2;
}

.article-content :deep(p) {
  margin: 0 0 1.1em;
}

.article-content :deep(p:first-child::first-letter) {
  float: left;
  margin: 9px 8px 0 0;
  color: var(--blue);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 56px;
  line-height: 0.78;
}

.article-content :deep(h2) {
  margin: 29px 0 10px;
  color: var(--ink);
  font-size: 25px;
  font-weight: 600;
  line-height: 1.5;
  scroll-margin-top: 24px;
}

.article-content :deep(h3) {
  margin: 24px 0 8px;
  color: var(--ink);
  font-size: 19px;
  font-weight: 600;
  scroll-margin-top: 24px;
}

.article-content :deep(blockquote) {
  margin: 25px 0;
  padding: 4px 0 4px 18px;
  border-left: 3px solid var(--blue);
  color: var(--ink);
  font-size: 19px;
  line-height: 1.8;
}

.article-content :deep(img) {
  height: auto;
  margin: 24px 0;
  border-radius: 3px;
}

.article-content :deep(a) {
  color: var(--blue);
}

.toc {
  padding-top: 8px;
}

.toc span {
  display: block;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.toc a {
  display: block;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  color: var(--ink);
  font-size: 10px;
  line-height: 1.5;
  text-decoration: none;
}

.toc a:hover {
  color: var(--blue);
}

.reader-actions {
  width: min(100%, 640px);
  margin: 28px auto 0;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

@media (max-width: 780px) {
  .reader-cover {
    height: 300px;
  }

  .reader-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .toc {
    display: none;
  }
}

@media (max-width: 470px) {
  header {
    text-align: left;
  }

  .reader-cover {
    height: 230px;
  }

  .article-content {
    font-size: 14px;
  }
}
</style>
