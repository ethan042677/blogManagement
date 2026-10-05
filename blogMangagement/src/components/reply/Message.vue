<template>
    <yk-drawer placement="right" :show="active" @close="emits('close')" :title="'私信'+count">
        <yk-space dir="vertical">
            <!-- 渲染每条私信内容 -->
            <Reply v-for="item in comments":key="item.id" :content="item" @delete="deleteComment" :isComment="false" />
        </yk-space>
        <template #footer>
            <yk-pagination :total="count" simple @change="changePage"/>
        </template>
    </yk-drawer>
</template>

<script lang="ts" setup>
import { ref,toRefs,onMounted,getCurrentInstance,nextTick } from 'vue';
import { type MessageProps } from './reply';
import {mkComment} from "../../mock/data.ts"
//active是私信窗口的开关
const props = withDefaults(defineProps<MessageProps>(),{
    active:false,
    pageSize:8
})
const {active} = toRefs(props)
const emits = defineEmits(["close"])
const proxy:any = getCurrentInstance()?.proxy

const count = ref<number>(1234)
//评论数据内容
const comments = ref()
// 滚动条实例
const scrollbar = ref()

//请求类型
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
const fetchCommentData = async ()=>{
    try {
        const data = await mkComment.data
        count.value = data.count
        comments.value = data.list.slice(
            (request.nowPage -1) * request.pageSize,
            (request.nowPage) * request.pageSize,
        )
    } catch (error) {
        console.error("获取私信失败")
    }
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

<style lang="less"></style>