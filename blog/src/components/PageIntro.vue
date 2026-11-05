<script setup lang="ts">
// 所有二级页面复用同一标题结构，只通过 props 替换栏目名称和说明文字。
withDefaults(defineProps<{
  eyebrow: string
  before: string
  highlight: string
  after?: string
  description: string
}>(), {
  after: '',
})
</script>

<template>
  <!-- 主标题中的重点短句使用钴蓝色，延续编辑手记方案 -->
  <header class="page-intro">
    <div>
      <div class="eyebrow">{{ eyebrow }}</div>
      <h1 class="editorial-title mt-4 text-[clamp(38px,4.2vw,56px)] leading-[1.15]">
        {{ before }}<em v-if="highlight">{{ highlight }}</em>{{ after }}
      </h1>
    </div>
    <p>{{ description }}</p>
  </header>
</template>

<style scoped lang="less">
.page-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 36px;
  padding: 42px 0 24px;
  border-bottom: 1px solid var(--line);
}

h1 {
  max-width: 760px;
  margin-bottom: 0;
}

h1 em {
  color: var(--blue);
  font-style: normal;
}

p {
  width: min(36%, 350px);
  margin: 0 0 5px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}

@media (max-width: 780px) {
  .page-intro {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
    padding-top: 32px;
  }

  p {
    width: 100%;
  }
}
</style>
