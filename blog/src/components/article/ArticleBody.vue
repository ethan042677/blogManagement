<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="article-content" v-html="content" />
</template>

<style scoped lang="less">
.article-content {
  min-width: 0;
  color: #343531;
  font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
  font-size: 15px;
  line-height: 2;
}

.article-content :deep(p) {
  margin: 0 0 1.1em;
}

.article-content :deep(p:first-child::first-letter) {
  float: left;
  margin: 9px 8px 0 0;
  color: var(--blue);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 56px;
  line-height: 0.78;
}

.article-content :deep(h2) {
  margin: 29px 0 10px;
  color: var(--ink);
  font-size: 25px;
  font-weight: 600;
  line-height: 1.5;
  scroll-margin-top: 24px;
}

.article-content :deep(h3) {
  margin: 24px 0 8px;
  color: var(--ink);
  font-size: 19px;
  font-weight: 600;
  scroll-margin-top: 24px;
}

.article-content :deep(blockquote) {
  margin: 25px 0;
  padding: 4px 0 4px 18px;
  border-left: 3px solid var(--blue);
  color: var(--ink);
  font-size: 19px;
  line-height: 1.8;
}

.article-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 24px 0;
  border-radius: 3px;
}

.article-content :deep(a) {
  color: var(--blue);
}

.article-content :deep(pre) {
  overflow-x: auto;
  margin: 22px 0;
  border-radius: 4px;
  background: #f4f5f3;
  padding: 18px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
  line-height: 1.7;
}

.article-content :deep(code) {
  border-radius: 3px;
  background: #f1f2ef;
  padding: 2px 5px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.9em;
}

.article-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.article-content :deep(table) {
  width: 100%;
  margin: 22px 0;
  border-collapse: collapse;
  font-size: 13px;
}

.article-content :deep(th),
.article-content :deep(td) {
  border: 1px solid var(--line);
  padding: 9px 11px;
  text-align: left;
}

@media (max-width: 470px) {
  .article-content {
    font-size: 14px;
  }
}
</style>
