// 后台保存的是 /files/xxx 相对路径，前台与接口同源访问，由 Vite 和 nginx 统一转发。
export function resolveAssetUrl(url?: string | null): string {
  return url || ''
}
