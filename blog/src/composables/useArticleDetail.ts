import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicApi } from '../api/public'
import type { ArticleDetail } from '../types/public'
import { addHeadingIds, sanitizeRichText, type ArticleHeading } from '../utils/richText'

// 文章数据、正文清洗和目录解析集中在这里，视图不再直接处理请求细节。
export function useArticleDetail() {
  const route = useRoute()
  const articleId = computed(() => Number(route.params.id))
  const loading = ref(true)
  const error = ref('')
  const article = ref<ArticleDetail | null>(null)
  const headings = ref<ArticleHeading[]>([])
  const renderedContent = ref('')

  async function loadArticle(): Promise<void> {
    loading.value = true
    error.value = ''
    headings.value = []

    try {
      const data = await publicApi.article(articleId.value)
      article.value = data
      const processed = addHeadingIds(sanitizeRichText(data.content))
      renderedContent.value = processed.html || `<p>${data.introduction || '这篇文章还没有正文。'}</p>`
      headings.value = processed.headings
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '文章加载失败'
    } finally {
      loading.value = false
    }
  }

  watch(articleId, loadArticle)
  onMounted(loadArticle)

  return {
    article,
    articleId,
    error,
    headings,
    loading,
    renderedContent,
    reload: loadArticle,
  }
}
