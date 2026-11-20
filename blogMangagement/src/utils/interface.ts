//回复内容接口
export type ReplyData = {
    id:number;
    article?:{
        id:number;
        title:string;
        };
    user:{
        id:string|number;
        name:string;
        imgurl:string;
        };
    comment:string;//内容
    moment:string;//时间
    complaint:number;//举报数
}
//分类接口
export interface CategoryData {
    id:string,
    name:string | number,
    value:number,
    moment?:string
}
//标签接口
export interface LabelData {
    id:string,
    name:string | number,
    moment?:string
}
//文章
export interface ArticleData {
    id:number;
    title?:string;
    categoryId?:number;//分类
    moment:string;//时间
    label?:string[];
    introduction?:string;//简介
    cover?:string;//封面地址
    views:number;//查看次数
    state:number//状态0未发布1已发布
    comment:number;
    praise:number;//点赞次数
    content?:string;//旧正文，仅用于兼容历史文章
    markdown?:string;//RustFS 返回的 Markdown 草稿
    contentHtml?:string;//用于回填 WangEditor 的安全 HTML
    savedAt?:string|null;//RustFS 草稿对象最后保存时间
}
//图库
export interface GalleryData {
    id:number;
    title?:string;
    categoryId?:number;//分类
    moment:string;//时间
    label?:string[];
    introduction?:string;//简介
    cover?:string;//封面地址
    views:number;//查看次数
    comment:number;
    praise:number;//点赞次数
    content?:string | string[];//内容
    state:number
}
//随笔随记
export interface DiaryData {
    id:number;
    title:string;
    moment:string;//时间
    weatherId:number;
    content:string;//内容
    picture?:string[]
}
//variant(json)
export type FileVariant = {
    name: string
    key: string
    url: string
    mimeType: string
    width: number
    height: number
    sizeBytes: number
}
//文件接口
export interface FileData {
    id: number
    url: string
    fileName: string
    format: string
    categoryId: number
    mimeType?: string
    sizeBytes?: number
    status?: string
    variants?: FileVariant[]
    selected?: boolean
}
