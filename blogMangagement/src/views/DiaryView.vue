<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'随笔随记'" style="margin-bottom: 8px;"/>
        <yk-space style="width:100%" size="l">
            <Diary />
            <DiaryEditor style="flex: none;width: 600px;" />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from '../components/TopTitle.vue';
import Diary from '../components/diary/Diary.vue';
import DiaryEditor from '../components/diary/DiaryEditor.vue';

</script>

<style scoped lang="less">

</style>