import { API_BASE_URL } from '../api/public'

// 后台保存的是 /files/xxx 相对路径，前台根据 API 地址补全可访问域名。
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/.test(url)) return url
  if (url.startsWith('/files/')) return `${API_BASE_URL}${url}`
  return url
}
