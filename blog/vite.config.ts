import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 前台工程独立运行在 5174 端口，开发阶段只代理公开接口和静态图片。
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      // /public 只对应无需 JWT 的前台接口，避免误用后台管理接口。
      '/public': {
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
