import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { YikeResolver } from '@yike-design/resolver' // https://vitejs.dev/config/ export default

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ resolvers: [YikeResolver] }),
    Components({ resolvers: [YikeResolver] }),
  ],
  server: {
    proxy: {
      // 后台接口统一走 /api，与生产 nginx 的转发规则一致。
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // 后端静态图片目录，/files/xxx 由 Vite 转发给 Express。
      '/files': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData: `@import '@yike-design/ui/es/index.less';`,
      },
    },
  },
})
