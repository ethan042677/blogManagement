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
import { ref,onMounted } from 'vue';
import { mkDiary } from '../../mock/data';
import type{ DiaryData } from '../../utils/interface.ts';
import DiaryItem from './DiaryItem.vue';

const props = defineProps({
    pageSize:{
        type:Number,
        default:6
    },
    searchTerm:{
        type:String,
        default:""
    }
})
type Request = {
    pageSize:number;//单页条数
    nowPage:number;//当前页
    searchTerm?:string;//搜索词条
    isCount?:boolean;
}
const request:Request = {
    pageSize:props.pageSize,
    nowPage:1,
    searchTerm:props.searchTerm,
    isCount:true//true则获取count总数
}
/**  获取日记 */
//日记列表
const diaryList = ref<DiaryData[]>([])
// 日记总数
const count = ref<number>(0)
//获取日记方法
const fetchDiary = () =>{
    if(request.nowPage === 1){ 
        count.value = mkDiary.count 
    }
    diaryList.value = mkDiary.list.slice(
        (request.nowPage -1) * request.pageSize,
        request.nowPage * request.pageSize
    )
}
/**删除 */
const deleteDiary = (id:number) => {
    diaryList.value = diaryList.value.filter(obj => obj.id !== id)
}

/**翻页方法 */
const changePage = (page:number)=>{
    request.nowPage = page
    fetchDiary()
}

//生命周期
onMounted(()=>{
    fetchDiary();
})
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