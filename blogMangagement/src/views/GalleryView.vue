<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'摄影图库'" style="margin-bottom: 8px;" @search="searchTerm = $event"/>
        <!-- 分类组件 -->
        <Category :classify="1" @nowCategory="changeCategory" />
        <yk-space style="width: 100%;">
            <Gallery :category-id="categoryId" :search-term="searchTerm" />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import Gallery from '../components/gallery/Gallery.vue';

// 当前图库分类
const categoryId = ref<number | string>(-1)
// 当前搜索词
const searchTerm = ref('')
// 切换图库分类
const changeCategory = ({ id }: { id: number | string }) => {
    categoryId.value = id
}
</script>

<style scoped lang="less">

</style>
