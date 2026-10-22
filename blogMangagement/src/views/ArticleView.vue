<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'博客文章'" style="margin-bottom: 8px;" @search="filters.searchTerm = $event"/>
        <!-- 分类组件 -->
        <Category :classify="0" @nowCategory="changeCategory" />
        <yk-space style="width: 100%;">
            <Article
                style="width: 100%;"
                :category-id="filters.categoryId"
                :state="filters.state"
                :search-term="filters.searchTerm"
                :label-id="filters.labelId"
            />
            <Label @nowCategory="changeLabel" />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import Label from '../components/label/Label.vue';
import Article from '../components/article/Article.vue';

// [联调新增] 分类、发布状态和标签筛选实时下传给文章列表。
// 文章页当前筛选条件
const filters = reactive({
    categoryId: -1 as number | string,
    state: -1,
    searchTerm: '',
    labelId: 0,
})
// 分类、未分类和发布状态切换
const changeCategory = ({ id, type }: { id: number | string; type: string }) => {
    filters.categoryId = type === 'category' || type === 'calculateUncategorized' ? id : -1
    filters.state = type === 'articleState' ? Number(id) : -1
}
// 标签筛选
const changeLabel = ({ id }: { id: number | string }) => {
    filters.labelId = Number(id)
}
</script>

<style scoped lang="less">

</style>
