<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveAssetUrl } from '../utils/assets'

// 通用媒体框统一处理外链、后端静态图片、加载失败和 CSS 占位视觉。
const props = withDefaults(defineProps<{
  src?: string | null
  alt: string
  tone?: number
}>(), {
  src: '',
  tone: 0,
})

const failed = ref(false)
// 后端只保存 /files/ 相对路径，这里统一转换成当前部署环境可访问的 URL。
const imageUrl = computed(() => resolveAssetUrl(props.src))

// 同一组件切换到另一篇文章时，重置失败状态并重新尝试加载。
watch(imageUrl, () => {
  failed.value = false
})
</script>

<template>
  <div class="media-frame" :class="`media-tone-${Math.abs(tone) % 6}`" role="img" :aria-label="alt">
    <img
      v-if="imageUrl && !failed"
      :src="imageUrl"
      :alt="alt"
      loading="lazy"
      @error="failed = true"
    >
    <div v-else class="media-placeholder" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </div>
</template>

<style scoped lang="less">
.media-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--paper-deep);
}

.media-frame::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  opacity: 0.14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.65px, transparent 0.75px);
  background-size: 4px 4px;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.media-placeholder {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.media-placeholder span {
  position: absolute;
  display: block;
}

.media-placeholder span:nth-child(1) {
  top: 20%;
  right: 24%;
  width: 12%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #f2d0a4;
}

.media-placeholder span:nth-child(2) {
  right: -8%;
  bottom: 8%;
  width: 84%;
  height: 43%;
  border-radius: 42% 58% 0 0;
  background: rgba(42, 67, 79, 0.94);
  transform: rotate(-4deg);
}

.media-placeholder span:nth-child(3) {
  bottom: -13%;
  left: -15%;
  width: 70%;
  height: 48%;
  background: rgba(61, 94, 87, 0.88);
  transform: rotate(18deg);
}

.media-tone-0 {
  background:
    radial-gradient(circle at 74% 28%, #f1d0a3 0 7%, transparent 8%),
    linear-gradient(18deg, #7b9da9 0 36%, #d5b18e 37% 52%, #eae0cc 53% 72%, #6f8796 73%);
}

.media-tone-1 {
  background:
    linear-gradient(90deg, transparent 39%, rgba(250, 221, 185, 0.72) 40% 42%, transparent 43% 67%, rgba(250, 221, 185, 0.58) 68% 70%, transparent 71%),
    linear-gradient(178deg, #adc1ce 0 39%, #627888 40% 65%, #283b4a 66%);
}

.media-tone-2 {
  background:
    radial-gradient(circle at 28% 74%, rgba(235, 188, 133, 0.9) 0 9%, transparent 10%),
    linear-gradient(20deg, transparent 0 43%, rgba(255, 255, 255, 0.75) 44% 46%, transparent 47%),
    linear-gradient(145deg, #d4c5b0 0 42%, #6f8b88 43% 67%, #d9b68c 68%);
}

.media-tone-3 {
  background:
    radial-gradient(circle at 64% 20%, rgba(247, 219, 172, 0.96) 0 8%, transparent 9%),
    linear-gradient(169deg, #bdc9bd 0 36%, #7a987d 37% 52%, #536d58 53% 69%, #d1ba95 70%);
}

.media-tone-4 {
  background:
    radial-gradient(circle at 72% 24%, rgba(238, 219, 190, 0.78) 0 8%, transparent 9%),
    linear-gradient(151deg, #243a52 0 45%, #526d87 46% 64%, #d3a47f 65% 73%, #172b38 74%);
}

.media-tone-5 {
  background:
    linear-gradient(90deg, transparent 49%, rgba(255, 255, 255, 0.5) 50%, transparent 51%),
    linear-gradient(180deg, #e3d5bd 0 55%, #a98f76 56% 72%, #6f857f 73%);
}

:global(a:hover) img {
  transform: scale(1.02);
}

@media (prefers-reduced-motion: reduce) {
  img {
    transition: none;
  }
}
</style>
