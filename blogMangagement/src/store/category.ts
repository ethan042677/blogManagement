import { defineStore } from "pinia";
import {type  CategoryData } from "../utils/interface";


// 分类状态仓库：文章、图库、文件页面共用
export const useCategoryStore = defineStore('categories',{
    state(){
        return {
            count:0,
            data:[] as CategoryData []
        }
    },
    getters:{
        //计算未分组数量和未分类对应的 id 列表
        calculateUncategorized(state){
            const idList:string[] = []
            let values = state.count
            //拿到所有id，计算未分组数
            for(let i = 0;i < state.data.length;i++){
                // [联调修复] 原实现直接相加字符串，多个分类会拼成错误 ID。
                if(String(state.data[i].id) !== '-1') idList.push(state.data[i].id)
                values -= state.data[i].value
            }
            return {id:idList.join(','),name:"未分类",value:Math.max(values, 0)}
        }
    },
    actions:{
        //根据分类 id 获取分类名称
        categoryName(id?:number|string){
            for(let i = 0;i<this.$state.data.length;i++){
                if(this.$state.data[i].id === id){
                    return this.$state.data[i].name
                }
            }
            return "未分类"
        }
    }
})
