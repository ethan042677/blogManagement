import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicApi } from '../api/public'

// 同一页面只在路径真正变化时上报一次，避免组件重渲染造成重复访问。
let lastTrackedPath = ''

// 前台访问统计只发送路由路径和设备类型，不携带 token 或用户身份。
export function usePageView(): void {
  const route = useRoute()

  watch(
    //fullPath为url详细路径
    () => route.fullPath,
    () => {
      //如果页面路由没有变化，直接返回，如果变化，则将改变之后的fullPath赋值给lastTrackedPath(避免重复判断访问量)
      if (route.fullPath === lastTrackedPath) return;
      lastTrackedPath = route.fullPath
      // 0 表示移动端，1 表示桌面端，与后台已有记录表约定一致。
      //判断用户是移动端登录还是PC端登录：检查视口最大宽度是否超过780px .matches将返回布尔值
      const device = window.matchMedia('(max-width: 780px)').matches ? 0 : 1
      publicApi.trackVisit({ path: route.fullPath, device }).catch(() => {
        // 访问统计失败不影响页面浏览。
        console.error("访问数据统计失败")
      })
    },
    { immediate: true },
  )
}
