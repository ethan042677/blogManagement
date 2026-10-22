<template>
    <yk-space dir="vertical" size="l">
        <!-- 主页类型标题与搜索栏 -->
        <TopTitle :is-search="true" />
        <!-- 四个类型的按钮 -->
        <Gather />
        <!-- 数据展示 -->
        <yk-space style="width:100%;" size="xl">
            <!-- echarts图 -->
            <Data  style="width: 50%;"/>
            <!-- 评论部分 -->
            <Comment style="width: 50%;" />
        </yk-space>
    </yk-space>
</template>

<script setup lang="ts">
// 页面标题、总览卡片、统计图表和评论列表
import TopTitle from '../components/TopTitle.vue';
import Gather from '../components/overView/Gather.vue';
import Data from '../components/overView/Data.vue';
import {Comment} from '../components/reply';
</script>
