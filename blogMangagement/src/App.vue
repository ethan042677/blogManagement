<script setup lang="ts">
import HeaderNav from './components/HeaderNav.vue';
import LoginNav from './components/LoginNav.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute()
const isPubicPage = computed(()=> route.meta.public === true)
</script>

<template>
    <!-- 登录导航栏 -->
  <LoginNav v-if="isPubicPage"/>
  <!-- 顶部导航栏 -->
  <HeaderNav v-else />
  <!-- 路由页面内容 -->
  <router-view />
</template>

<style lang="less">

</style>
