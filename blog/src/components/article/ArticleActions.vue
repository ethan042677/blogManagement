<script setup lang="ts">
import { ChatDotRound, Share, Star } from '@element-plus/icons-vue'
import { ElButton } from 'element-plus'

defineProps<{
  likes: number
  loading: boolean
}>()

defineEmits<{
  comment: []
  like: []
  share: []
}>()
</script>

<template>
  <div class="reader-actions">
    <el-button round :icon="Star" :loading="loading" @click="$emit('like')">
      喜欢 {{ likes }}
    </el-button>
    <el-button round :icon="ChatDotRound" @click="$emit('comment')">
      评论
    </el-button>
    <el-button round :icon="Share" @click="$emit('share')">分享</el-button>
  </div>
</template>

<style scoped lang="less">
.reader-actions {
  width: min(100%, 1000px);
  margin: 28px auto 0;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
</style>
