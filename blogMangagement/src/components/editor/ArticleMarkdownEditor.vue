<template>
    <!-- 工具栏和正文由 WangEditor 自行创建；该组件只提供稳定的挂载节点。 -->
    <div id="article-editor-toolbar" ref="toolbarHost" class="article-editor-toolbar"></div>
    <div id="article-editor-body" ref="editorHost" class="article-editor-body"></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createEditor, createToolbar } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import type { UploadedInlineImage } from './articleTypes'
import { articleCodeDecorate } from '../../utils/rustHighlight'

const props = withDefaults(defineProps<{
    initialHtml?: string
    uploadImage: (file: File) => Promise<UploadedInlineImage>
}>(), {
    initialHtml: '',
})

const emit = defineEmits<{
    error: [message: string]
}>()

// WangEditor 5 当前依赖包没有提供完整可用的 TypeScript 声明，
// 因此实例类型在组件内部收敛为 any，对外只暴露字符串形式的 HTML。
type EditorInstance = any

const toolbarHost = ref<HTMLElement>()
const editorHost = ref<HTMLElement>()
const editor = ref<EditorInstance>()

// 主编辑器只通过 getHtml 获取 WangEditor 的实际内容，再统一转换成 Markdown。
const getHtml = (): string => editor.value?.getHtml?.() || ''

// 自定义图片上传由 WangEditor 菜单回调触发。这里只把注入的上传函数结果
// 转换成 insertFn 所需参数，错误统一交给父组件展示，避免编辑器组件直接提示。
async function handleImageUpload(
    file: File,
    insertFn: (url: string, alt: string, href: string) => void,
) {
    try {
        const image = await props.uploadImage(file)
        insertFn(image.url, image.fileName || '文章图片', image.url)
    } catch (error) {
        emit('error', error instanceof Error ? error.message : '图片上传失败')
    }
}


// 创建 WangEditor 实例。初始 HTML 由父组件在历史文章加载完成后传入，
// 因此这里只负责编辑器本体，不负责请求分类、标签或文章数据。

//定义配置项
const CODE_LANGS = [
    { text: 'CSS', value: 'css' },
    { text: 'HTML', value: 'html' },
    { text: 'XML', value: 'xml' },
    { text: 'Javascript', value: 'javascript' },
    { text: 'Typescript', value: 'typescript' },
    { text: 'JSX', value: 'jsx' },
    { text: 'Go', value: 'go' },
    { text: 'PHP', value: 'php' },
    { text: 'C', value: 'c' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C++', value: 'cpp' },
    { text: 'C#', value: 'csharp' },
    { text: 'Visual Basic', value: 'visual-basic' },
    { text: 'SQL', value: 'sql' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Swift', value: 'swift' },
    { text: 'Bash', value: 'bash' },
    { text: 'Lua', value: 'lua' },
    { text: 'Groovy', value: 'groovy' },
    { text: 'Markdown', value: 'markdown' },
    { text: 'Rust', value: 'rust' },
]

function createArticleEditor() {
    return createEditor({
        selector: '#article-editor-body',
        html: props.initialHtml,
        mode: 'default',
        config: {
            placeholder: '这里是正文，支持标题、列表、引用、代码、表格和图片。',
            scroll: false,
            decorate: articleCodeDecorate,

            MENU_CONF: {
                codeSelectLang: {
                    codeLangs: CODE_LANGS,
                },
                uploadImage: {
                    customUpload: handleImageUpload,
                },
            },
        },
    })
}

// 工具栏配置只开放 Markdown 可稳定表达的格式。
// 颜色、字号和对齐会破坏纯 Markdown 的往返一致性，因此不加入菜单。
function createArticleToolbar(editorInstance: EditorInstance) {
    return createToolbar({
        editor: editorInstance,
        selector: '#article-editor-toolbar',
        mode: 'default',
        config: {
            toolbarKeys: [
                'headerSelect',
                '|',
                'bold',
                'italic',
                'through',
                '|',
                'bulletedList',
                'numberedList',
                'blockquote',
                'codeBlock',
                'insertTable',
                'insertLink',
                'uploadImage',
                '|',
                'undo',
                'redo',
            ],
        },
    })
}

onMounted(()=>{
    if (!toolbarHost.value || !editorHost.value) return
    editor.value = createArticleEditor()
    createArticleToolbar(editor.value)
})
onBeforeUnmount(()=>{
    editor.value?.destroy?.()
    editor.value = undefined
})

defineExpose({ getHtml })
</script>

<style lang="less">
/* 工具栏在页面内吸顶，正文保持无边框的长文编辑区域。 */
.article-editor-toolbar {
    position: sticky;
    top: 64px;
    z-index: 8;
    border-top: 1px solid #edf0f4;
    border-bottom: 1px solid #edf0f4;
    background: #fff;
}

.article-editor-toolbar .w-e-bar {
    padding: 4px 20px;
}

.article-editor-body .w-e-text-container,
.article-editor-body .w-e-scroll {
    background: transparent;
}

.article-editor-body [data-slate-editor] {
    min-height: 460px;
    padding: 0;
    color: #424a57;
    font-size: 15px;
    line-height: 1.9;
}
</style>
