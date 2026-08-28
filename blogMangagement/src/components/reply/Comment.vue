<template>
    <div class="card">
        <div class="card-title">
            <p class="card-title-name">评论 {{ count }}</p>
        </div>
        <yk-scrollbar ref="scrollbar" class="comment-scroll" style="padding: 0 24px;">
            <yk-space dir="vertical">
                <Reply :is-comment="true" v-for="item in comments":key="item.id" :content="item" @delete="deleteComment"/>
            </yk-space>
        </yk-scrollbar>
        <!-- 分页功能 -->
        <div class="comment-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance,nextTick } from 'vue';
import Reply from '../reply/Reply.vue'
import {comment} from "../../mock/data.ts"
import type { CommentProps } from './reply.ts';

// 变量
//通过getCurrentInstance()方法拿到组件实例，proxy是其一个属性
const proxy:any = getCurrentInstance()?.proxy
const props = withDefaults(defineProps<CommentProps>(),{
    pageSize:8,
})
//评论条数
const count = ref<number>(1234)
//评论数据内容
const comments = ref()
// 滚动条实例
const scrollbar = ref()

//请求
type Request = {
    token?:string,
    pageSize:number,//单页条数
    nowPage:number,//当前页
}

const request:Request = {
    pageSize:props.pageSize,
    nowPage:1,
}
//获取数据方法
const fetchCommentData = ()=>{
    const data = comment.data
    count.value = data.count
    comments.value = data.list.slice(
        (request.nowPage -1) * request.pageSize,
        (request.nowPage) * request.pageSize,
    )
}
/**
 * @description 删除评论
 */
const deleteComment = (id:number)=>{
    comments.value = comments.value.filter((el:any)=>el.id!==id)
    proxy.$message({ type: 'primary', message: '删除评论' })
}
/**
 * @description 翻页方法
 */
const changePage = (page:number)=>{
    request.nowPage = page
    fetchCommentData()
    // 翻页后滚动条回到最顶层
    nextTick(()=>{
        scrollbar.value?.scrollTo({ top: 0, behavior: 'smooth' })
    })
}
// 生命周期
onMounted(()=>{
    fetchCommentData()
})
</script>

<style lang="less" scoped>
.card{
    display: flex;
    flex-direction: column;
    // 在横向行内拉伸，与旁边两个图表卡片等高
    align-self: stretch;
    position: relative;
    padding: @space-xl @space-xl 0;
    border-radius: @radius-m;
    background: @white;
    width: 100%;
    overflow: hidden;

    .card-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: @space-l;

        .card-title-name {
            .font-l();
            font-weight: 600;
            color: @font-color-l;
            padding: 0 @space-xl;
        }
    }
    // 滚动区域填满剩余高度（覆盖 yk-scrollbar 默认的 height:100%）
    .comment-scroll{
        flex: 1 1 0;
        min-height: 0;
        height: auto;
    }
    .comment-pagination{
        flex-shrink: 0;
        // 抵消卡片左右内边距，让分页条通栏贴在底部
        margin: 0 -@space-xl;
        padding: @space-l @space-xl;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 1px solid @line-color-s;
        box-sizing: border-box;
        background: @white;
    }
}

</style>