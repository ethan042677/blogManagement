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
//文件接口
export interface FileData {
    id:number,
    url:string,
    fileName:string,
    format:string,
    categoryId:number,
    selected?:boolean//是否选择
}