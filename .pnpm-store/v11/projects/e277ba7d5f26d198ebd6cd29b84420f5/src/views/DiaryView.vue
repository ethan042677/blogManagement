<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElAlert, ElButton, ElEmpty, ElSkeleton } from 'element-plus'
import ContentImage from '../components/ContentImage.vue'
import PageIntro from '../components/PageIntro.vue'
import { publicApi } from '../api/public'
import type { DiaryEntry } from '../types/public'
import { formatMonthDay, formatDateTime } from '../utils/date'

// 日记使用时间轴分页，每次加载一组，新增内容追加到列表末尾。
const loading = ref(true)
const error = ref('')
const diaries = ref<DiaryEntry[]>([])
const count = ref(0)
const page = ref(1)
const pageSize = 8

// reset=true 用于首次加载和刷新；追加分页时保留已有日记。
async function loadDiaries(reset = true, targetPage?: number): Promise<void> {
  if (reset) {
    page.value = targetPage || 1
    loading.value = true
  }
  error.value = ''
  try {
    const data = await publicApi.diaries({ page: page.value, pageSize })
    diaries.value = reset ? data.list : [...diaries.value, ...data.list]
    count.value = data.count
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '日记加载失败'
  } finally {
    loading.value = false
  }
}

// 当前页面只递增页码，具体请求仍由 loadDiaries 统一处理。
function loadMore(): void {
  page.value += 1
  void loadDiaries(false)
}

// 天气图标使用轻量字符映射，不额外依赖一套图片资源。
function weatherGlyph(name?: string): string {
  if (!name) return '○'
  if (name.includes('雨')) return '☂'
  if (name.includes('雪')) return '❄'
  if (name.includes('云') || name.includes('阴')) return '☁'
  if (name.includes('风')) return '≈'
  return '☀'
}

onMounted(() => loadDiaries())
</script>

<template>
  <div class="page-shell">
    <!-- 日记标题说明内容定位，不把它做成完整文章的摘要列表 -->
    <PageIntro
      eyebrow="journal · ordinary days"
      before="日记，"
      highlight="把普通的一天留下来。"
      description="日记不追求完整的观点，更像时间轴上的短波记录。天气、心情与照片作为辅助信息，不抢正文的注意力。"
    />

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mt-6">
      <template #default>
        <el-button size="small" class="mt-3" @click="loadDiaries()">重新加载</el-button>
      </template>
    </el-alert>

    <!-- 左侧日期列与右侧内容卡片共同形成时间轴 -->
    <div v-else class="diary-list">
      <el-skeleton v-if="loading" animated :rows="10" class="py-10" />
      <el-empty v-else-if="!diaries.length" description="还没有日记" />
      <article v-for="(diary, index) in diaries" v-else :key="diary.id" class="diary-entry">
        <time class="diary-date" :datetime="diary.moment">
          <b>{{ formatMonthDay(diary.moment).day }}</b>
          <span>{{ formatMonthDay(diary.moment).month }}</span>
        </time>
        <div class="diary-card">
          <div class="diary-meta">
            <span>{{ weatherGlyph(diary.weatherName) }} {{ diary.weatherName || '天气未记录' }}</span>
            <span>{{ formatDateTime(diary.moment) }}</span>
          </div>
          <h2>{{ diary.title }}</h2>
          <p>{{ diary.content }}</p>
          <div v-if="diary.pictures.length" class="diary-photos" :class="{ single: diary.pictures.length === 1 }">
            <div v-for="(picture, pictureIndex) in diary.pictures.slice(0, 2)" :key="picture" class="overflow-hidden">
              <ContentImage :src="picture" :alt="`${diary.title} 图片 ${pictureIndex + 1}`" :tone="index + pictureIndex" />
            </div>
          </div>
        </div>
      </article>

      <div v-if="!loading && diaries.length < count" class="flex justify-center py-6">
        <el-button round @click="loadMore">加载更多日记</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.diary-list {
  margin: 26px 0 0 112px;
  padding-top: 4px;
  border-left: 1px solid var(--line);
}

.diary-entry {
  position: relative;
  display: grid;
  grid-template-columns: 126px minmax(0, 1fr);
  gap: 32px;
  margin-left: -113px;
  padding-bottom: 30px;
}

.diary-entry::before {
  position: absolute;
  top: 5px;
  left: 104px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--paper);
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 0 1px var(--blue);
  content: "";
}

.diary-date {
  color: var(--muted);
  font-size: 10px;
  text-align: right;
}

.diary-date b {
  display: block;
  color: var(--blue);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 31px;
  font-weight: 400;
  line-height: 1;
}

.diary-date span {
  display: block;
  margin-top: 4px;
  letter-spacing: 0.08em;
}

.diary-card {
  padding: 20px 22px;
  border: 1px solid rgba(113, 108, 98, 0.16);
  border-radius: 5px;
  background: var(--surface);
}

.diary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--muted);
  font-size: 10px;
}

.diary-card h2 {
  margin: 11px 0 8px;
  font-family: "Songti SC", "STSong", serif;
  font-size: 23px;
  font-weight: 600;
}

.diary-card > p {
  margin: 0;
  color: #4f514d;
  font-family: "Songti SC", "STSong", serif;
  font-size: 14px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.diary-photos {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 5px;
  height: 130px;
  margin-top: 15px;
}

.diary-photos.single {
  grid-template-columns: 1fr;
}

.diary-photos > div:last-child:not(:first-child) {
  height: 100%;
}

@media (max-width: 780px) {
  .diary-list {
    margin-left: 86px;
  }

  .diary-entry {
    grid-template-columns: 98px minmax(0, 1fr);
    gap: 22px;
    margin-left: -87px;
  }

  .diary-entry::before {
    left: 78px;
  }
}

@media (max-width: 470px) {
  .diary-list {
    margin-left: 0;
    border-left: 0;
  }

  .diary-entry {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-left: 0;
  }

  .diary-entry::before {
    display: none;
  }

  .diary-date {
    display: flex;
    align-items: baseline;
    gap: 8px;
    text-align: left;
  }

  .diary-date b {
    font-size: 24px;
  }

  .diary-date span {
    margin: 0;
  }

  .diary-card {
    padding: 16px;
  }

  .diary-photos {
    grid-template-columns: 1fr;
    height: 210px;
  }

  .diary-photos > div:nth-child(2) {
    display: none;
  }
}
</style>
