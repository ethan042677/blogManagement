<template>
    <yk-space size="l" dir="vertical" class="file-view">
        <!-- TopTitle （标题与搜索栏组件） -->
        <TopTitle  :is-search="false" :name="'本地文件'" style="margin-bottom: 8px;">
            <template #custom>
                <yk-space align="center">
                    <yk-text type="third">图片、视频、音频大小不超过20M</yk-text>
                    <yk-button @click="localFilesRef?.chooseFiles()">上传</yk-button>
                </yk-space>
            </template>
        </TopTitle>
        <!-- 分类组件 -->
        <Category :classify="2" @nowCategory="changeCategory" />
        <!-- 本地文件组件 -->
        <LocalFiles ref="localFilesRef" :category-id="categoryId" />
    </yk-space>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import TopTitle from '../components/TopTitle.vue';
import Category from '../components/category/Category.vue';
import LocalFiles from '../components/localFiles/LocalFiles.vue';

// 当前文件分类
const categoryId = ref<number | string>(-1)
// 文件列表组件实例，用于触发文件选择
const localFilesRef = ref<InstanceType<typeof LocalFiles> | null>(null)
// 切换文件分类
const changeCategory = ({ id }: { id: number | string }) => {
    categoryId.value = id
}
</script>

<style lang="less" scoped>

</style>
