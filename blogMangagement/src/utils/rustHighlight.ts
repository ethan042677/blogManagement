import { DomEditor, SlateText } from '@wangeditor/editor'
import { wangEditorCodeHighLightDecorate } from '@wangeditor/code-highlight'
import Prism from 'prismjs'
import 'prismjs/components/prism-rust'

// WangEditor 自带 CSS 支持这些 token。
// Rust 专有的 token 可以映射到已有类型，避免再写整套样式。
const SUPPORTED_TYPES = new Set([
    'comment',
    'punctuation',
    'namespace',
    'property',
    'tag',
    'boolean',
    'number',
    'constant',
    'symbol',
    'deleted',
    'attr-name',
    'builtin',
    'char',
    'inserted',
    'selector',
    'string',
    'operator',
    'entity',
    'url',
    'atrule',
    'attr-value',
    'keyword',
    'function',
    'class-name',
    'regex',
    'important',
    'variable',
    'bold',
    'italic',
])

const TYPE_ALIAS: Record<string, string> = {
    // Rust 生命周期，例如 'a
    'lifetime-annotation': 'symbol',
    // Rust 宏，例如 println!
    macro: 'function',
    // Rust attribute，例如 #[derive(Debug)]
    annotation: 'function',
}

// 从当前文本节点找到它所属的 code 节点。
function getCodeNode(node: any) {
    if (!SlateText.isText(node)) return null

    const codeNode = DomEditor.getParentNode(null, node)
    if (!codeNode) return null
    if (DomEditor.getNodeType(codeNode) !== 'code') return null

    const preNode = DomEditor.getParentNode(null, codeNode)
    if (!preNode || DomEditor.getNodeType(preNode) !== 'pre') return null

    return codeNode
}

// 生成一个 Rust 代码块的装饰范围。
function createRustRanges(textNode: any, path: number[]) {
    const codeNode = getCodeNode(textNode)
    if (!codeNode) return []
    // code 节点由 code-highlight 模块扩展，Slate 基础类型上没有 language 字段。
    if ((codeNode as { language?: string }).language !== 'rust') return []

    const grammar = Prism.languages.rust
    if (!grammar) return []

    const ranges: any[] = []
    const tokens = Prism.tokenize(textNode.text, grammar)

    // Slate 的 offset 是相对当前 text 节点计算的，所以每个节点都从 0 开始。
    let offset = 0

    const walkToken = (token: string | any) => {
        // Prism 的普通文本 token 就是字符串。
        if (typeof token === 'string') {
            offset += token.length
            return
        }

        const start = offset
        const children = Array.isArray(token.content)
            ? token.content
            : [token.content]

        // 递归处理嵌套 token，例如字符串中的插值或宏内部结构。
        children.forEach(walkToken)

        const end = offset
        const originalType = String(token.type)
        const styleType = TYPE_ALIAS[originalType] || originalType

        if (end <= start) return
        if (!SUPPORTED_TYPES.has(styleType)) return

        ranges.push({
            // mark 的 key 必须和 WangEditor 能识别的 token 样式一致。
            [styleType]: true,
            // anchor 和 focus 使用的是 text 节点的 path 和字符偏移量。
            anchor: { path, offset: start },
            focus: { path, offset: end },
        })
    }

    tokens.forEach(walkToken)
    return ranges
}

// 最终交给 WangEditor 的装饰器。
// 其他语言继续使用官方装饰器，Rust 使用自定义装饰器。
export function articleCodeDecorate(nodeEntry: any) {
    const officialRanges = wangEditorCodeHighLightDecorate(nodeEntry)

    // JavaScript、Python、Go 等语言由官方装饰器处理。
    if (officialRanges.length > 0) return officialRanges

    const [node, path] = nodeEntry
    return createRustRanges(node, path)
}