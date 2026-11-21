<script setup lang="ts">
import type { ArticleHeading } from '../../utils/richText'

defineProps<{
  headings: ArticleHeading[]
}>()
</script>

<template>
  <aside v-if="headings.length" class="toc" aria-label="文章目录">
    <span>本文目录</span>
    <a v-for="heading in headings" :key="heading.id" :href="`#${heading.id}`">
      {{ heading.text }}
    </a>
  </aside>
</template>

<style scoped lang="less">
.toc {
  padding-top: 8px;
}

.toc span {
  display: block;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.toc a {
  display: block;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  color: var(--ink);
  font-size: 10px;
  line-height: 1.5;
  text-decoration: none;
}

.toc a:hover {
  color: var(--blue);
}

@media (max-width: 780px) {
  .toc {
    display: none;
  }
}
</style>
