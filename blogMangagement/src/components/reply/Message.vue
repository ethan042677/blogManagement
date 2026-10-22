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
import { ref,toRefs,onMounted,getCurrentInstance,watch } from 'vue';
import { type MessageProps } from './reply';
import { replyApi } from '../../api';
import type { ReplyData } from '../../utils/interface';

const props = withDefaults(defineProps<MessageProps>(),{
    active:false, // 私信抽屉是否打开
    pageSize:8 // 单页条数
})
// 把 props.active 转成响应式引用
const {active} = toRefs(props)
// 关闭抽屉事件
const emits = defineEmits(["close"])
// 获取组件实例，用于全局消息提示
const proxy:any = getCurrentInstance()?.proxy
// 私信总数
const count = ref<number>(0)
// 私信列表数据
const comments = ref<ReplyData[]>([])
// 当前私信列表请求参数
const request = {
    pageSize:props.pageSize, // 单页条数
    nowPage:1, // 当前页
}

// 获取私信列表：打开抽屉或翻页时调用
const fetchCommentData = async ()=>{
    try {
        // [联调接入] 私信列表改为真实接口。
        const data = await replyApi.messages(request)
        count.value = data.count
        comments.value = data.list
    } catch (error) {
        comments.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取私信失败' })
    }
}

// 删除私信：删除成功后刷新列表
const deleteComment = async (id:number)=>{
    try {
        await replyApi.deleteMessage(id)
        await fetchCommentData()
        proxy.$message({ type: 'primary', message: '删除私信成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 翻页方法
const changePage = (page:number)=>{
    request.nowPage = page
    fetchCommentData()
}

// 生命周期：组件挂载后获取私信
onMounted(fetchCommentData)
// 打开私信抽屉时重新获取最新数据
watch(active, (value) => {
    if (value) fetchCommentData()
})
</script>

<style lang="less"></style>
