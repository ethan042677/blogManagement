<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import { usePageView } from './composables/usePageView'
//记录用户使用设备，返回后端
usePageView()
</script>

<template>
  <div class="min-h-screen bg-paper font-ui text-ink">
    <!-- 导航栏 -->
    <SiteHeader />
    <main>
      <!-- 通过插槽拿到RouterView当前渲染的组件，
      使用Transition内置组件给组件添加切换动画 -->
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <!-- is对应哪个组件就渲染哪个组件 -->
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style lang="less">
.page-enter-active,
.page-leave-active {
  transition: opacity 160ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
