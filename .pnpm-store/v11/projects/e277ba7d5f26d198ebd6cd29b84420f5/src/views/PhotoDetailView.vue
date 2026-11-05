<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElButton, ElEmpty, ElSkeleton } from 'element-plus'
import ContentImage from '../components/ContentImage.vue'
import { publicApi } from '../api/public'
import type { PhotoCollection } from '../types/public'
import { formatDate } from '../utils/date'

// 摄影详情以系列为单位展示完整图片集合。
const route = useRoute()
const loading = ref(true)
const error = ref('')
const photo = ref<PhotoCollection | null>(null)

// 只读取已发布摄影系列；接口失败时保留可重试状态。
async function loadPhoto(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    photo.value = await publicApi.photo(Number(route.params.id))
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '摄影系列加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadPhoto)
// 在两个摄影系列之间切换时重新请求数据。
watch(() => route.params.id, loadPhoto)
</script>

<template>
  <div class="page-shell">
    <!-- 返回摄影列表后，路由滚动策略会把页面带回顶部 -->
    <RouterLink to="/photography" class="subtle-link mt-7">
      <el-icon><ArrowLeft /></el-icon>
      返回摄影
    </RouterLink>

    <el-skeleton v-if="loading" animated :rows="8" class="mt-8" />
    <el-empty v-else-if="error" :description="error">
      <el-button type="primary" @click="loadPhoto">重新加载</el-button>
    </el-empty>
    <template v-else-if="photo">
      <header class="mx-auto mt-8 max-w-[780px] text-center">
        <div class="text-[10px] font-semibold tracking-[0.13em] text-cobalt">
          {{ photo.categoryName || '摄影系列' }} · {{ formatDate(photo.moment) }}
        </div>
        <h1 class="editorial-title mt-3 text-[clamp(36px,4.4vw,56px)]">{{ photo.title }}</h1>
        <p v-if="photo.introduction" class="mx-auto mt-4 max-w-[560px] text-[11px] leading-7 text-muted">
          {{ photo.introduction }}
        </p>
      </header>

      <!-- 图片顺序与后台摄影系列中的数组顺序保持一致 -->
      <div class="photo-series mt-8">
        <figure v-for="(picture, index) in photo.pictures" :key="picture" class="m-0">
          <div :class="index % 3 === 1 ? 'h-[420px]' : index % 3 === 2 ? 'h-[260px]' : 'h-[340px]'">
            <ContentImage :src="picture" :alt="`${photo.title} 图片 ${index + 1}`" :tone="index" />
          </div>
          <figcaption>{{ String(index + 1).padStart(2, '0') }} / {{ String(photo.pictures.length).padStart(2, '0') }}</figcaption>
        </figure>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.photo-series {
  width: min(100%, 980px);
  margin-inline: auto;
  columns: 2;
  column-gap: 18px;
}

figure {
  display: inline-block;
  width: 100%;
  margin-bottom: 18px;
  break-inside: avoid;
}

figure > div {
  overflow: hidden;
  border-radius: 4px;
}

figcaption {
  margin-top: 7px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.1em;
}

@media (max-width: 600px) {
  .photo-series {
    columns: 1;
  }
}
</style>
