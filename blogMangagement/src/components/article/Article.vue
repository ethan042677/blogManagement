<template>
    <yk-space dir="vertical" style="width: 100%;"size="xl">
        <ArticleItem 
            v-for="item in articleList" 
            :key="item.id" 
            :data="item" 
            @deleteArticle="deleteArticle"
            @updateState="updateState"
        />
        <div class="article-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </yk-space>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance } from 'vue';
import ArticleItem from './ArticleItem.vue';
import { mkArticle } from '../../mock/data';
import type{ ArticleData } from '../../utils/interface.ts';

const props = defineProps({
    pageSize:{
        type:Number,
        default:6
    },
    categoryId:{
        type:Number,
        default:-1
    },
    state:{
        type:Number,
        default:0
    },
    searchTerm:{
        type:String,
        default:""
    }
})
type Request = {
    pageSize:number;//单页条数
    nowPage:number;//当前页
    state?:number;//状态
    categoryId?:number;//分类
    searchTerm?:string;//搜索词条
    isCount?:boolean;
}
const request:Request = {
    pageSize:props.pageSize,
    nowPage:1,
    state:props.state,
    categoryId:props.categoryId,
    searchTerm:props.searchTerm,
    isCount:true//true则获取count总数
}
/**  获取文章 */
//文章列表
const articleList = ref<ArticleData[]>([])
// 文章总数
const count = ref<number>(0)
//获取文章方法
const fetchArticles = (isCount:boolean) =>{
    if(isCount){
        count.value = mkArticle.count
    }
    articleList.value = mkArticle.list.slice(
        (request.nowPage -1) * request.pageSize,
        request.nowPage * request.pageSize
    )
}
/**删除 */
const deleteArticle = (id:number) => {
    articleList.value = articleList.value.filter(obj => obj.id !== id)
    console.log(id);
    
}
/**修改状态 */
const proxy: any = getCurrentInstance()?.proxy
const updateState = (obj:{id:number,state:number})=>{
    articleList.value.filter((item:{id:number,state:number})=>{
        if(item.id === obj.id){
            item.state = obj.state
            if(item.state === 1){
                proxy.$message({ type: 'primary', message: '发布成功' })
            }else{
                proxy.$message({ type: 'primary', message: '撤回成功' })
            }
        }
    })
}

/**翻页方法 */
const changePage = (page:number)=>{
    request.nowPage = page
    fetchArticles(false)
}

//生命周期
onMounted(()=>{
    fetchArticles(true);
})
</script>

<style lang="less" scoped>
.article-pagination{
        width: 100%;
        flex-shrink: 0;
        padding: 0 @space-s;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        box-sizing: border-box;
    }
</style>