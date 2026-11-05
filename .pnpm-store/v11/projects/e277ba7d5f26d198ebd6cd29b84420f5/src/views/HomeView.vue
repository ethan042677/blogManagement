<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElAlert, ElButton, ElSkeleton, ElSkeletonItem } from 'element-plus'
import ArticleFeed from '../components/ArticleFeed.vue'
import ContentImage from '../components/ContentImage.vue'
import { publicApi } from '../api/public'
import type { ArticleSummary, SiteSummary } from '../types/public'
import { formatDate } from '../utils/date'

// 首页状态分为独立的内容列表、站点统计和请求状态，避免数据互相覆盖。
const loading = ref(true)
const error = ref('')//错误信息
const articles = ref<ArticleSummary[]>([])//文章
const summary = ref<SiteSummary>({ articles: 0, photos: 0, diaries: 0 })//文章数量、摄影数量、日记数量

// 第一篇文章作为封面故事，其余文章继续进入单列瀑布流。
const featured = computed(() => articles.value[0])
const recent = computed(() => articles.value.slice(1))

// 首页只发起两个公开请求；失败时保留可重试状态，不显示虚构内容。
async function loadHome(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [site, feed] = await Promise.all([
      //获取文章数量、摄影数量、日记数量
      publicApi.summary(),
      //获取文章
      publicApi.articles({ page: 1, pageSize: 4 }),
    ])
    summary.value = site
    articles.value = feed.list
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '首页内容加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadHome)
</script>

<template>
  <div class="page-shell">
    <!-- 编辑手记式首屏：左侧表达作者主张，右侧由最新文章承担封面 -->
    <section class="home-hero">
      <!-- 左 -->
      <div>
        <div class="eyebrow">issue 024 · autumn 2026</div>
        <h1 class="home-title editorial-title">
          在代码与日常之间，记录一些<em>缓慢发生</em>的事。
        </h1>
        <p class="home-lead">
          关于设计、开发与城市漫游的个人月刊。这里没有日更，只有想清楚之后才写下的文字。
        </p>
        <RouterLink to="/articles" class="start-reading">
          开始阅读
          <el-icon><ArrowRight /></el-icon>
        </RouterLink>
        <div class="home-meta">
          <span><b>{{ summary.articles }}</b> 篇文章</span>
          <span><b>{{ summary.photos }}</b> 组摄影</span>
          <span><b>{{ summary.diaries }}</b> 篇日记</span>
        </div>
      </div>
      <!-- 右 -->
      <div class="hero-art">
        <el-skeleton v-if="loading" animated class="h-full">
          <template #template>
            <el-skeleton-item variant="image" class="!h-full" />
          </template>
        </el-skeleton>
        <ContentImage
          v-else-if="featured"
          :src="featured.cover"
          :alt="featured.title"
          :tone="0"
        />
        <ContentImage v-else alt="山与海的抽象封面" :tone="0" />
        <span class="hero-tag">FIELD NOTE / 024</span>
        <RouterLink
          v-if="featured"
          :to="`/articles/${featured.id}`"
          class="hero-caption"
        >
        <!-- 类型名称和时间 -->
          <small>{{ featured.categoryName || '封面故事' }} · {{ formatDate(featured.moment) }}</small>
          <h2>{{ featured.title }}</h2>
        </RouterLink>
      </div>
    </section>

    <!-- 最近写作与文章页共用 ArticleFeed 和 ArticleCard -->
    <section class="feed-section" aria-labelledby="latest-title">
      <div class="reading-column mb-4 flex items-end justify-between gap-6">
        <div>
          <h2 id="latest-title" class="editorial-title m-0 text-[30px]">最近写作</h2>
        </div>
        <RouterLink to="/articles" class="subtle-link shrink-0">
          全部文章
          <el-icon><ArrowRight /></el-icon>
        </RouterLink>
      </div>
      <!-- 错误页 -->
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false">
        <template #default>
          <el-button size="small" class="mt-3" @click="loadHome">重新加载</el-button>
        </template>
      </el-alert>
      <!-- 暂无文章 -->
      <ArticleFeed
        v-else
        :articles="recent"
        :loading="loading"
        empty-text="还没有发布新的文章"
      />
    </section>
  </div>
</template>

<style scoped lang="less">
.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr);
  gap: 56px;
  align-items: center;
  padding: 47px 0 40px;
}

.home-title {
  max-width: 555px;
  margin: 18px 0 0;
  font-size: clamp(38px, 4.4vw, 57px);
  line-height: 1.18;
}

.home-title em {
  color: var(--blue);
  font-style: normal;
}

.home-lead {
  max-width: 470px;
  margin: 19px 0 22px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.85;
}

.start-reading {
  min-height: 43px;
  display: inline-flex;
  align-items: center;
  gap: 11px;
  padding: 0 18px;
  border-radius: 2px;
  background: var(--ink);
  color: var(--paper);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.home-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 27px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.05em;
}

.home-meta b {
  color: var(--blue);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 14px;
  font-weight: 400;
}

.hero-art {
  position: relative;
  min-height: 398px;
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0 22px 50px rgba(35, 44, 58, 0.15);
}

.hero-tag {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  color: #fff;
  font-size: 10px;
  letter-spacing: 0.12em;
}

.hero-caption {
  position: absolute;
  right: 22px;
  bottom: 22px;
  left: 146px;
  padding: 16px;
  background: rgba(250, 248, 242, 0.95);
  color: var(--ink);
  text-decoration: none;
  box-shadow: 0 12px 28px rgba(27, 36, 49, 0.12);
  transition: all 0.1s linear;
}

.hero-caption small {
  display: block;
  margin-bottom: 6px;
  color: var(--blue);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.hero-caption h2 {
  margin: 0;
  font-family: "Songti SC", "STSong", serif;
  font-size: 21px;
  font-weight: 600;
  line-height: 1.4;
}

.hero-caption p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 10px;
}

.feed-section {
  padding-top: 28px;
  border-top: 1px solid var(--line);
}

@media (max-width: 780px) {
  .home-hero {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 34px 0 32px;
  }

  .home-title {
    font-size: 39px;
  }

  .hero-art {
    min-height: 390px;
  }
}

@media (max-width: 470px) {
  .home-title {
    font-size: 34px;
  }

  .hero-art {
    min-height: 330px;
  }

  .hero-caption {
    right: 18px;
    bottom: 18px;
    left: 18px;
  }

  .hero-caption h2 {
    font-size: 18px;
  }
}
</style>
