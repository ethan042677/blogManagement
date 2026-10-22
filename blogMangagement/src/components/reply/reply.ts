import type { ReplyData } from "../../utils/interface"

// 评论组件参数
export type CommentProps = {
    // 单页评论条数
    pageSize?:number,
}

// 单条评论或私信参数
export type ReplyProps = {
    // 当前评论或私信内容
    content?:ReplyData,
    // 是否为评论，false 表示私信
    isComment:boolean,
}

// 私信抽屉参数
export type MessageProps = {
    // 私信抽屉是否打开
    active:boolean,
    // 单页私信条数
    pageSize?:number,
}
