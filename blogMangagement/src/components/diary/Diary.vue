<template>
    <div class="diary">
        <yk-space dir="vertical" size="xl" style="width: 100%;padding-bottom: 24px;">
            <DiaryItem 
                v-for="item in diaryList"
                :key="item.id"
                :data="item"
                @deleteDiary="deleteDiary"
            />
        </yk-space>
        <div class="diary-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance,watch } from 'vue';
import { diaryApi } from '../../api';
import type{ DiaryData } from '../../utils/interface.ts';
import DiaryItem from './DiaryItem.vue';

// 日记列表的父组件参数
const props = defineProps({
    pageSize:{ type:Number, default:6 }, // 单页条数
    searchTerm:{ type:String, default:"" }, // 搜索词条
})

// 当前日记列表请求参数
const request = {
    pageSize:props.pageSize, // 单页条数
    nowPage:1, // 当前页
    searchTerm:props.searchTerm, // 搜索词条
}
// 日记列表数据
const diaryList = ref<DiaryData[]>([])
// 日记总数
const count = ref<number>(0)
// 获取组件实例，用于全局消息提示
const proxy:any = getCurrentInstance()?.proxy

// 获取日记列表：查询当前页并同步总数
const fetchDiary = async () =>{
    try {
        const data = await diaryApi.list(request)
        count.value = data.count
        diaryList.value = data.list
    } catch (error) {
        diaryList.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取日记失败' })
    }
}

// 删除日记：删除成功后刷新列表
const deleteDiary = async (id:number) => {
    try {
        await diaryApi.delete(id)
        await fetchDiary()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 翻页方法：保存页码并重新请求
const changePage = (page:number)=>{
    request.nowPage = page
    fetchDiary()
}

// 搜索词变化时回到第一页重新查询
watch(
    () => props.searchTerm,
    (value) => {
        request.searchTerm = value
        request.nowPage = 1
        fetchDiary()
    },
)

// 暴露刷新方法，新建日记后由父组件调用
defineExpose({ refresh: fetchDiary })
// 生命周期：组件挂载后获取日记
onMounted(fetchDiary)
</script>

<style lang="less" scoped>
.diary{
    width: 100%;

    &-pagination{
        width: 100%;
        flex-shrink: 0;
        padding: 0 @space-s;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        box-sizing: border-box;
    }
}

</style>
