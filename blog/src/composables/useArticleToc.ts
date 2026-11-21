import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { ArticleHeading } from '../utils/richText'

interface ArticleTocOptions {
  error: Ref<string>
  headings: Ref<ArticleHeading[]>
  loading: Ref<boolean>
}

// 目录位置、移动抽屉和滚动监听共享同一份标题数据，避免组件重复查询 DOM。
export function useArticleToc({ error, headings, loading }: ArticleTocOptions) {
  const tocOpen = ref(false)
  const activeHeadingId = ref('')

  let activeHeadingFrame = 0
  let pendingHeadingId = ''

  function updateActiveHeading(): void {
    if (loading.value || error.value || !headings.value.length) return

    let currentId = headings.value[0]?.id || ''
    for (const heading of headings.value) {
      const element = document.getElementById(heading.id)
      if (!element) continue
      if (element.getBoundingClientRect().top > 112) break
      currentId = heading.id
    }
    activeHeadingId.value = currentId
  }

  // 高频 scroll 事件通过 requestAnimationFrame 合并，避免重复触发布局读取。
  function scheduleActiveHeadingUpdate(): void {
    if (activeHeadingFrame) return
    activeHeadingFrame = requestAnimationFrame(() => {
      activeHeadingFrame = 0
      updateActiveHeading()
    })
  }

  function selectHeading(id: string): void {
    pendingHeadingId = id
    activeHeadingId.value = id
    tocOpen.value = false
  }

  function handleTocClosed(): void {
    if (!pendingHeadingId) return
    const target = document.getElementById(pendingHeadingId)
    pendingHeadingId = ''
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleReaderResize(): void {
    if (window.innerWidth > 780) tocOpen.value = false
    scheduleActiveHeadingUpdate()
  }

  watch(
    [loading, headings],
    async ([isLoading]) => {
      if (isLoading) {
        tocOpen.value = false
        return
      }
      await nextTick()
      updateActiveHeading()
    },
    { flush: 'post' },
  )

  watch(headings, (items) => {
    if (!items.length) activeHeadingId.value = ''
  })

  watch(error, (message) => {
    if (message) tocOpen.value = false
  })

  onMounted(() => {
    window.addEventListener('scroll', scheduleActiveHeadingUpdate, { passive: true })
    window.addEventListener('resize', handleReaderResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', scheduleActiveHeadingUpdate)
    window.removeEventListener('resize', handleReaderResize)
    if (activeHeadingFrame) cancelAnimationFrame(activeHeadingFrame)
  })

  return {
    activeHeadingId,
    handleTocClosed,
    selectHeading,
    tocOpen,
  }
}
