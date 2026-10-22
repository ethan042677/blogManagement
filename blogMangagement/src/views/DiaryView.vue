<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'随笔随记'" style="margin-bottom: 8px;" @search="searchTerm = $event"/>
        <yk-space style="width:100%" size="l">
            <Diary ref="diaryRef" :search-term="searchTerm" />
            <DiaryEditor style="flex: none;width: 600px;" @created="diaryRef?.refresh()" />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import TopTitle from '../components/TopTitle.vue';
import Diary from '../components/diary/Diary.vue';
import DiaryEditor from '../components/diary/DiaryEditor.vue';

// 日记列表组件实例，新建成功后调用刷新
const diaryRef = ref<InstanceType<typeof Diary> | null>(null)
// 当前搜索词
const searchTerm = ref('')
</script>

<style scoped lang="less">

</style>
