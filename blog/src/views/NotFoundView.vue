<template>
  <!-- 未匹配路由继续使用博客视觉，并提供清晰的返回首页入口 -->
  <div class="page-shell flex min-h-[70vh] flex-col items-center justify-center text-center">
    <div class="eyebrow">404 · lost in the margin</div>
    <p class="mt-3 text-sm text-muted">你访问的内容不存在，或者已经被移到了别处。</p>
    <RouterLink to="/" class="mt-7 rounded-sm bg-ink px-5 py-3 text-xs font-semibold text-paper no-underline">
      返回首页
    </RouterLink>
  </div>
</template>
