<template>
    <div class="index-view">
        <!-- 左侧导航栏 ，脱离文档流-->
        <leftMenu />
        <!-- 右侧内容 -->
        <router-view />
    </div>
</template>

<script setup lang="ts">
// 后台主布局左侧导航
import LeftMenu from '../components/LeftMenu.vue';
</script>

<style lang="less" scoped>
.index-view{
    padding:32px 32px 32px 232px;
}
</style>
