<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElAlert, ElEmpty, ElSkeleton, ElSkeletonItem } from 'element-plus'
import ContentImage from '../components/ContentImage.vue'
import PageIntro from '../components/PageIntro.vue'
import { publicApi } from '../api/public'
import type { Category, PhotoCollection } from '../types/public'
import { formatDate } from '../utils/date'

// 摄影页一次加载公开系列，再在前端按分类快速切换。
const loading = ref(true)
const error = ref('')
const photos = ref<PhotoCollection[]>([])
const categories = ref<Category[]>([])
const activeCategory = ref<number | null>(null)

// 分类筛选不重新请求服务端，因为摄影系列数量较小且已一次性读取。
const filteredPhotos = computed(() => (
  activeCategory.value === null
    ? photos.value
    : photos.value.filter((photo) => photo.categoryId === activeCategory.value)
))

// 摄影与分类接口并行请求，分类失败时仍然展示全部摄影内容。
async function loadPhotos(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [feed, categoryList] = await Promise.all([
      publicApi.photos({ page: 1, pageSize: 30 }),
      publicApi.categories(1).catch(() => []),
    ])
    photos.value = feed.list
    categories.value = categoryList
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '摄影内容加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadPhotos)
</script>

<template>
  <div class="page-shell">
    <!-- 统一二级页顶部，标题沿用编辑手记排版 -->
    <PageIntro
      eyebrow="photography · selected series"
      before="摄影，"
      highlight="替时间保留一些证据。"
      description="以摄影系列为单位组织照片，不把图片只当文章配图。每个系列保留地点、时间和一段简短描述，点击后进入完整图集。"
    />

    <!-- 摄影分类使用轻量文字胶囊，不抢占照片的视觉重心 -->
    <div class="flex flex-wrap items-center gap-2 py-5">
      <button type="button" class="filter-pill" :class="{ active: activeCategory === null }" @click="activeCategory = null">
        全部系列
      </button>
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="filter-pill"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        {{ category.name }}
      </button>
      <span class="ml-auto text-[10px] text-muted">{{ filteredPhotos.length }} 组系列</span>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else-if="loading" class="photo-grid">
      <div v-for="index in 6" :key="index" class="overflow-hidden rounded bg-surface">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="image" :style="{ height: index % 3 === 2 ? '360px' : '250px' }" />
            <div class="p-3"><el-skeleton-item variant="text" style="width: 60%" /></div>
          </template>
        </el-skeleton>
      </div>
    </div>
    <el-empty v-else-if="!filteredPhotos.length" description="还没有摄影系列" />
    <!-- 摄影保留多列瀑布流，文章区则单独使用单列流 -->
    <div v-else class="photo-grid">
      <RouterLink
        v-for="(photo, index) in filteredPhotos"
        :key="photo.id"
        :to="`/photography/${photo.id}`"
        class="photo-card group block break-inside-avoid overflow-hidden rounded bg-surface no-underline"
      >
        <div :class="index % 3 === 1 ? 'h-[360px]' : index % 3 === 2 ? 'h-[190px]' : 'h-[250px]'">
          <ContentImage
            :src="photo.cover || photo.pictures?.[0]"
            :alt="photo.title"
            :tone="index"
          />
        </div>
        <div class="px-4 py-3.5">
          <h2 class="editorial-title text-[18px] transition-colors group-hover:text-cobalt">
            {{ photo.title }}
          </h2>
          <p class="mt-1 text-[10px] text-muted">
            {{ photo.categoryName || '摄影' }} · {{ formatDate(photo.moment) }} · {{ photo.pictures.length }} 张照片
          </p>
        </div>
      </RouterLink>
    </div>
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

.filter-pill.active {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
  font-weight: 700;
}

.photo-grid {
  columns: 3;
  column-gap: 16px;
}

.photo-card {
  display: inline-block;
  width: 100%;
  margin-bottom: 16px;
}

@media (max-width: 780px) {
  .photo-grid {
    columns: 2;
  }
}

@media (max-width: 470px) {
  .photo-grid {
    columns: 1;
  }
}
</style>
