import { ref, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { publicApi } from '../api/public'
import type { ArticleDetail } from '../types/public'
import { getVisitorId, hasLikedArticle, markArticleLiked } from '../utils/visitor'

// 点赞、分享和评论定位属于读者动作，与文章加载状态分开维护。
export function useArticleActions(article: Ref<ArticleDetail | null>) {
  const liking = ref(false)
  const liked = ref(false)

  // 文章加载或切换后，按当前文章 ID 恢复按钮状态。
  watch(article, (value) => {
    liked.value = value ? hasLikedArticle(value.id) : false
  }, { immediate: true })

  async function likeArticle(): Promise<void> {
    if (!article.value || liking.value || liked.value) return
    liking.value = true
    try {
      const data = await publicApi.like(article.value.id, getVisitorId())
      // 接口成功返回后，用服务端结果更新数量、按钮和本地缓存。
      article.value.likes = data.likes
      liked.value = data.liked
      if (data.liked) markArticleLiked(article.value.id)
      if (data.alreadyLiked) {
        ElMessage.info('已经喜欢过了')
      } else {
        ElMessage.success('喜欢已记录')
      }
    } catch (caught) {
      ElMessage.error(caught instanceof Error ? caught.message : '操作失败')
    } finally {
      liking.value = false
    }
  }

  async function shareArticle(): Promise<void> {
    if (!article.value) return
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: article.value.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        ElMessage.success('链接已复制')
      }
    } catch {
      // 用户取消系统分享时不需要额外提示。
    }
  }

  function scrollToComments(): void {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    likeArticle,
    liked,
    liking,
    scrollToComments,
    shareArticle,
  }
}
