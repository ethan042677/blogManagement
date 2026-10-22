/// <reference types="vite/client" />

// [联调修复] 组件库解析器未随包提供类型声明，补一个最小模块声明通过类型检查。
declare module '@yike-design/resolver'

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component: DefineComponent<{}, {}, any>
    export default component
}
