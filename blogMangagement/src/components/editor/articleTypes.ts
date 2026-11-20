// 文章编辑器内部共享的最小表单结构。
// 只有正文 Markdown 和文件对象属于编辑器实现细节，不进入这里。
export interface ArticleFormModel {
    title: string
    categoryId: number
    labels: string[]
    introduction: string
    cover: string
}

// WangEditor 的 customUpload 只需要能插入图片的地址、替代文本和链接。
// 主编辑器负责调用 RustFS 直传，Markdown 编辑器组件不直接依赖上传接口。
export interface UploadedInlineImage {
    url: string
    fileName: string
}
