<template>
    <div class="files">
        <div class="files-tool">
            <!-- 左侧功能 -->
            <yk-space>
                <!-- 全选框 -->
                <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
                    全选
                </yk-checkbox>
                <yk-text>已选择 3 项内容</yk-text>
                <yk-text type="primary" style="cursor: pointer;">取消选择</yk-text>
            </yk-space>
            <!-- 右侧功能 -->
            <yk-space>
                <!-- 删除 -->
                <IconDeleteOutline class="files-tool-delete"/>
                <!-- 切换 -->
                <IconSwitchOutline class="files-tool-switch"/>
            </yk-space>
        </div>
        <div class="files-main">
            <LocalFilesPhoto v-for="item in files" :data="item" :key="item.id"/>
        </div>
        <!-- 分页功能 -->
        <div class="comment-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,nextTick,onMounted } from 'vue';
import { mkFiles } from '../../mock/data';
import LocalFilesPhoto from './LocalFilesPhoto.vue';


//文件props接口
type FileProps = {
    pageSize:number,
    categoryId:number|string,
}
const props = withDefaults(defineProps<FileProps>(),{
    pageSize:8,
    categoryId:-1,// 全部
})


/**多选框部分 */
const checkedAll = ref<boolean>(false)//全选
const indeterminate = ref<boolean>(false)//半选
const handleChangeAll = (val:boolean)=>{
    indeterminate.value = false
    if(val){
        checkedAll.value = true
    }else{
        checkedAll.value = false
    }
}


/** 分页部分 */
const count = ref<number>(1234)
//数据内容
const files = ref()
// 滚动条实例
const scrollbar = ref()
//请求接口
type Request = {
    token?:string,
    pageSize:number,//单页条数
    nowPage:number,//当前页
}
//请求数据
const request:Request = {
    pageSize:props.pageSize,
    nowPage:1,
}
//获取数据方法
const fetchFileData = (boo:boolean)=>{
    const data = mkFiles
    //控制值的获取
    if(boo){
        count.value = data.count
    }
    files.value = data.list.slice(
        (request.nowPage -1) * request.pageSize,
        (request.nowPage) * request.pageSize,
    )
    console.log(files.value);
    
}
/**
 * @description 翻页方法
 */
const changePage = (page:number)=>{
    request.nowPage = page
    fetchFileData(false)
    // 翻页后滚动条回到最顶层
    nextTick(()=>{
        scrollbar.value?.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

//生命周期
onMounted(()=>{
    fetchFileData(true)
})
</script>
<style scoped lang="less"> 
.files{
    background: @bg-color-l;
    padding: @space-xl;
    border-radius: @radius-m;
    width: 100%;

    .files-tool{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: @space-l;
        border-radius: @radius-m;
        background: @bg-color-m;

        .files-tool-delete{
            width: 20px;
            height: 20px;
            color: @font-color-s;
            cursor: pointer;

            &:hover{
                color: @font-color-l;
            }
        }
    }

    &-main{
        padding: 24px 0 32px;
        display: grid;
        grid-template-columns: repeat(auto-fill,200px);
        row-gap: 32px;
        column-gap: 24px;
        justify-content: center;
    }
    .comment-pagination{
        flex-shrink: 0;
        // 抵消卡片左右内边距，让分页条通栏贴在底部
        margin: 0 -@space-xl;
        padding: @space-l 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        background: @white;
    }
}
</style>