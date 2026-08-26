import { createApp } from 'vue'
import App from './App.vue'
//引入组件库样式
import '@yike-design/ui/es/index.less'
// 引入全局方法
import { YkMessage, YkNotification } from '@yike-design/ui'
//引入图标库
import Icon from '@yike-design/ui/es/components/svg-icon'
import './style.less'
//路由
import router from './router'
//pinia
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$notification = YkNotification
app.config.globalProperties.$message = YkMessage

app.use(router).use(Icon).use(pinia).mount('#app')