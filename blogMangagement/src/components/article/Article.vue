<template>
    <yk-space dir="vertical" style="width: 100%;"size="xl">
        <ArticleItem 
            v-for="item in articleList" 
            :key="item.id" 
            :data="item" 
            @deleteArticle="deleteArticle"
            @updateState="updateState"
        />
        <!-- 分页 -->
        <div class="article-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </yk-space>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance,watch } from 'vue';
import ArticleItem from './ArticleItem.vue';
import { articleApi } from '../../api';
import type{ ArticleData } from '../../utils/interface.ts';

// 父组件传入的筛选和分页参数
const props = defineProps({
    pageSize:{ type:Number, default:6 }, // 单页条数
    categoryId:{ type:[Number, String] as any, default:-1 }, // 分类 id，-1 表示全部
    state:{ type:Number, default:-1 }, // 发布状态，-1 表示全部
    searchTerm:{ type:String, default:"" }, // 搜索关键词
    labelId:{ type:Number, default:0 }, // 标签 id，0 表示不筛选
})

// 当前文章列表请求参数
const request = {
    pageSize:props.pageSize, // 单页条数
    nowPage:1, // 当前页
    state:props.state, // 文章状态
    categoryId:props.categoryId as number | string, // 所属分类
    searchTerm:props.searchTerm, // 搜索词条
    labelId:props.labelId, // 所属标签
}

// 文章列表数据
const articleList = ref<ArticleData[]>([])
// 文章总数
const count = ref<number>(0)
// 获取组件实例，用来调用全局消息提示
const proxy: any = getCurrentInstance()?.proxy

// 获取文章列表：查询分页数据并同步总条数
const fetchArticles = async () =>{
    try {
        const data = await articleApi.list({ ...request, classify: 0 })
        // 数量
        count.value = data.count
        articleList.value = data.list as ArticleData[]
    } catch (error) {
        articleList.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取文章失败' })
    }
}

// 删除文章：成功后重新获取当前页数据
const deleteArticle = async (id:number) => {
    try {
        await articleApi.delete(id)
        await fetchArticles()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 修改文章状态：state 为 0 表示未发布，为 1 表示已发布
const updateState = async (obj:{id:number,state:number})=>{
    try {
        await articleApi.changeState(obj.id, obj.state)
        // 重新渲染
        await fetchArticles()
        proxy.$message({ type: 'primary', message: obj.state === 1 ? '发布成功' : '撤回成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '修改状态失败' })
    }
}

// 翻页方法：保存当前页并重新请求
const changePage = (page:number)=>{
    request.nowPage = page
    fetchArticles()
}

//筛选条件改变时回到第一页重新请求。
// 筛选条件改变后回到第一页重新查询
watch(
    () => [props.categoryId, props.state, props.searchTerm, props.labelId],
    () => {
        request.categoryId = props.categoryId as number | string
        request.state = props.state
        request.searchTerm = props.searchTerm
        request.labelId = props.labelId
        request.nowPage = 1
        fetchArticles()
    },
)

// 生命周期：组件挂载后获取第一页文章
onMounted(fetchArticles)
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
