import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 前台工程独立运行在 5174 端口，开发阶段只代理公开接口和静态图片。
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      // 前台公开接口走 /api/public，和后台共用同一个 /api 前缀。
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // 文章的封面与摄影图片继续由后端静态目录提供。
      '/files': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
