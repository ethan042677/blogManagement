<script setup lang="ts">
import { computed } from 'vue'
import { ElDrawer } from 'element-plus'
import type { ArticleHeading } from '../../utils/richText'

const props = defineProps<{
  activeHeadingId: string
  headings: ArticleHeading[]
  open: boolean
}>()

const emit = defineEmits<{
  closed: []
  select: [headingId: string]
  'update:open': [open: boolean]
}>()

const drawerOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
</script>

<template>
  <Teleport to="#article-toc-action">
    <button
      v-if="headings.length"
      class="toc-trigger"
      type="button"
      aria-label="打开文章目录"
      aria-controls="mobile-article-toc"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="drawerOpen = true"
    >
      <span class="toc-trigger-lines" aria-hidden="true"></span>
    </button>
  </Teleport>

  <el-drawer
    id="mobile-article-toc"
    v-model="drawerOpen"
    direction="ltr"
    size="min(82vw, 340px)"
    :with-header="false"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    append-to-body
    class="reader-toc-drawer"
    modal-class="reader-toc-modal"
    aria-label="文章目录"
    @closed="emit('closed')"
  >
    <div class="reader-toc-panel">
      <button class="reader-toc-close" type="button" aria-label="关闭文章目录" @click="drawerOpen = false">
        <span class="reader-toc-close-icon" aria-hidden="true"></span>
      </button>

      <nav class="reader-toc-links" aria-label="本文章节">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="{
            'is-level-3': heading.level === 3,
            'is-active': activeHeadingId === heading.id,
          }"
          :aria-current="activeHeadingId === heading.id ? 'location' : undefined"
          @click.prevent="emit('select', heading.id)"
        >
          {{ heading.text }}
        </a>
      </nav>
    </div>
  </el-drawer>
</template>

<style scoped lang="less">
.toc-trigger {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  place-items: center;
  cursor: pointer;
}

.toc-trigger-lines,
.toc-trigger-lines::before,
.toc-trigger-lines::after {
  display: block;
  width: 15px;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
  content: "";
}

.toc-trigger-lines {
  position: relative;
}

.toc-trigger-lines::before {
  position: absolute;
  top: -5px;
  left: 0;
}

.toc-trigger-lines::after {
  position: absolute;
  top: 5px;
  left: 0;
}

.toc-trigger:focus-visible,
.reader-toc-close:focus-visible,
.reader-toc-links a:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 3px;
}

.reader-toc-panel {
  height: 100%;
  overflow-y: auto;
  padding: calc(18px + env(safe-area-inset-top)) 20px 28px;
  background: var(--surface);
}

.reader-toc-close {
  display: grid;
  width: 44px;
  height: 44px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  place-items: center;
  cursor: pointer;
}

.reader-toc-close-icon {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
}

.reader-toc-close-icon::before,
.reader-toc-close-icon::after {
  position: absolute;
  top: 7px;
  left: 0;
  width: 16px;
  height: 1.5px;
  border-radius: 1px;
  background: var(--ink);
  content: "";
}

.reader-toc-close-icon::before {
  transform: rotate(45deg);
}

.reader-toc-close-icon::after {
  transform: rotate(-45deg);
}

.reader-toc-links {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.reader-toc-links a {
  position: relative;
  padding: 16px 10px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  font-size: 14px;
  line-height: 1.65;
  text-decoration: none;
}

.reader-toc-links a.is-level-3 {
  padding-left: 30px;
  color: var(--muted);
  font-size: 12px;
}

.reader-toc-links a.is-active {
  color: var(--blue);
  background: linear-gradient(90deg, #e8eeff 0%, #f4f6fc 100%);
  font-weight: 700;
}

.reader-toc-links a.is-active::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 2px;
  background: var(--blue);
  content: "";
}

@media (max-width: 780px) {
  .toc-trigger {
    display: grid;
  }
}

:global(.reader-toc-modal) {
  background: rgba(24, 25, 29, 0.38);
}

:global(.reader-toc-drawer.el-drawer) {
  --el-drawer-bg-color: var(--surface);
  box-shadow: 12px 0 32px rgba(24, 25, 29, 0.18);
}

:global(.reader-toc-drawer .el-drawer__body) {
  overflow: hidden;
  padding: 0;
}
</style>
