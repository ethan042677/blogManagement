<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'摄影图库'" style="margin-bottom: 8px;"/>
        <!-- 分类组件 -->
        <Category />
        <yk-space style="width: 100%;">
            <Gallery />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import Gallery from '../components/gallery/Gallery.vue';

</script>

<style scoped lang="less">

</style>