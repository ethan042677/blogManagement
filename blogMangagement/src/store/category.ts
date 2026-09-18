import { defineStore } from "pinia";
import {type  CategoryData } from "../utils/interface";


export const useCategoryStore = defineStore('categories',{
    state(){
        return {
            count:123,
            data:[] as CategoryData []
        }
    },
    getters:{
        //未分组
        calculateUncategorized(state){
            const idList:string[] = []
            let values = state.count
            //拿到所有id，计算未分组数
            for(let i = 0;i < state.data.length;i++){
                idList[i] = state.data[i].id
                values -= state.data[i].value
            }
            return {id:idList.join(''),name:"未分类",value:values}
        }
    },
    actions:{
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