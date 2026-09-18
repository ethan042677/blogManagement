<template>
    <yk-space dir="vertical" size="l">
        <!-- 头部 -->
        <TopTitle :is-search="true" :name="'博客文章'" style="margin-bottom: 8px;"/>
        <!-- 分类组件 -->
        <Category />
        <yk-space style="width: 100%;">
            <Article style="width: 100%;"/>
            <Label />
        </yk-space>
    </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import Label from '../components/label/Label.vue';
import Article from '../components/article/Article.vue';
</script>

<style scoped lang="less">

</style>