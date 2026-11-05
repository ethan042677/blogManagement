<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElButton, ElInput, ElMessage } from 'element-plus'
import { publicApi } from '../api/public'
import type { PublicComment } from '../types/public'
import { formatDateTime } from '../utils/date'

const props = defineProps<{
  articleId: number
}>()

// 评论区自行管理加载、表单、服务端剩余额度和发布后的列表更新。
const loading = ref(true)
const submitting = ref(false)
const comments = ref<PublicComment[]>([])
const count = ref(0)
const name = ref(localStorage.getItem('blog_comment_name') || '')
const content = ref('')
const remaining = ref<number | null>(null)
const errorMessage = ref('')

// 首次进入显示规则；发布后使用服务端返回值显示准确剩余次数。
const quotaText = computed(() => {
  if (remaining.value === null) return '无需注册 · 每小时最多 10 条'
  if (remaining.value <= 0) return '本小时评论次数已达上限，请稍后再试'
  return `本小时还可发布 ${remaining.value} 条评论`
})

// 只读取公开昵称、正文和时间，不请求任何用户账号信息。
async function loadComments(): Promise<void> {
  loading.value = true
  try {
    const data = await publicApi.comments(props.articleId)
    comments.value = data.list
    count.value = data.count
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '评论加载失败')
  } finally {
    loading.value = false
  }
}

// 前端校验用于即时反馈，后端仍会再次执行长度与频率限制。
async function submit(): Promise<void> {
  errorMessage.value = ''
  const nickname = name.value.trim()
  const text = content.value.trim()

  if (!nickname) {
    errorMessage.value = '请先填写名称'
    return
  }
  if (!text) {
    errorMessage.value = '请填写评论内容'
    return
  }

  submitting.value = true
  try {
    const data = await publicApi.createComment(props.articleId, {
      name: nickname,
      content: text,
    })
    comments.value = [data.comment, ...comments.value]
    count.value += 1
    remaining.value = data.remaining
    content.value = ''
    // 昵称只保存在当前浏览器，用于下次自动填写，不构成账号或登录状态。
    localStorage.setItem('blog_comment_name', nickname)
    ElMessage.success('评论已发布')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '评论发布失败'
  } finally {
    submitting.value = false
  }
}

onMounted(loadComments)
</script>

<template>
  <!-- 评论区位于文章正文之后，详情页可通过 #comments 滚动定位 -->
  <section id="comments" class="comments" aria-labelledby="comments-title">
    <header class="flex items-end justify-between gap-5">
      <h2 id="comments-title" class="editorial-title text-[26px]">
        评论 <span class="text-[16px] font-normal text-cobalt">{{ count }}</span>
      </h2>
      <p class="m-0 text-right text-[10px] leading-6 text-muted">{{ quotaText }}</p>
    </header>

    <!-- 匿名评论只需要名称和正文，不包含邮箱、密码或注册入口 -->
    <form class="comment-form mt-4" @submit.prevent="submit">
      <label class="field-label" for="comment-name">
        名称 <span>只需填写名称，不需要注册</span>
      </label>
      <el-input
        id="comment-name"
        v-model="name"
        maxlength="20"
        autocomplete="nickname"
        placeholder="怎么称呼你"
      />

      <label class="field-label mt-3" for="comment-content">
        评论内容 <span>最多 500 字</span>
      </label>
      <el-input
        id="comment-content"
        v-model="content"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        resize="vertical"
        placeholder="写下你的想法……"
      />

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <p class="m-0 flex-1 text-[10px] leading-5" :class="errorMessage ? 'text-[#a94731]' : 'text-muted'" aria-live="polite">
          {{ errorMessage || quotaText }}
        </p>
        <el-button type="primary" native-type="submit" :loading="submitting">
          发布评论
        </el-button>
      </div>
    </form>

    <!-- 评论按服务端倒序返回，新发布内容会立即插入列表顶部 -->
    <div class="mt-2">
      <el-skeleton v-if="loading" :rows="4" animated />
      <div v-else-if="!comments.length" class="border-t border-line py-8 text-center text-xs text-muted">
        还没有评论，来写第一条吧。
      </div>
      <template v-else>
        <article
          v-for="comment in comments"
          :key="comment.id"
          class="comment-row"
        >
          <span class="comment-avatar" aria-hidden="true">{{ Array.from(comment.name)[0] }}</span>
          <div>
            <header class="mb-1.5 flex items-baseline gap-2.5">
              <b class="text-[11px]">{{ comment.name }}</b>
              <time class="text-[10px] text-muted" :datetime="comment.moment">
                {{ formatDateTime(comment.moment) }}
              </time>
            </header>
            <p class="m-0 whitespace-pre-wrap font-editorial text-[13px] leading-7 text-[#4c4e4a]">
              {{ comment.content }}
            </p>
          </div>
        </article>
      </template>
    </div>
  </section>
</template>

<style scoped lang="less">
.comments {
  width: min(100%, 680px);
  margin: 40px auto 0;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}

.comment-form {
  padding: 18px;
  border-radius: 5px;
  background: var(--paper-deep);
}

.field-label {
  display: block;
  margin-bottom: 7px;
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
}

.field-label span {
  margin-left: 3px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 400;
}

.comment-row {
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr);
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--line);
}

.comment-avatar {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--blue);
  color: var(--paper);
  font-family: "Songti SC", "STSong", serif;
  font-size: 14px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 3px;
  background: var(--surface);
  box-shadow: 0 0 0 1px #cfc8bb inset;
}

:deep(.el-textarea__inner) {
  padding: 11px;
  font-size: 13px;
  line-height: 1.75;
}

:deep(.el-input__inner) {
  font-size: 13px;
}

@media (max-width: 470px) {
  .comments {
    margin-top: 30px;
  }

  .comment-form {
    padding: 14px;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    font-size: 16px;
  }
}
</style>
