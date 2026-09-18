<template>
    <yk-space size="l" dir="vertical" class="file-view">
        <!-- TopTitle （标题与搜索栏组件） -->
        <TopTitle  :is-search="false" :name="'本地文件'" style="margin-bottom: 8px;">
            <template #custom>
                <yk-space align="center">
                    <yk-text type="third">图片、视频、音频大小不超过20M</yk-text>
                    <yk-button>上传</yk-button>
                </yk-space>
            </template>
        </TopTitle>
        <!-- 分类组件 -->
        <Category />
        <!-- 本地文件组件 -->
        <LocalFiles />
    </yk-space>
</template>
<script setup lang="ts">
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import LocalFiles from '../components/localFiles/LocalFiles.vue';
</script>

<style lang="less" scoped>

</style>