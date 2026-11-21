<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from 'element-plus'
</script>

<template>
  <div class="reader-loading" aria-label="正在加载文章">
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
</template>

<style scoped lang="less">
.reader-loading {
  padding: 38px 0;
}
</style>
