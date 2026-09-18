<template>
    <div class="files">
        <div class="files-tool" v-show="selectPhotoId.length > 0">
            <!-- 左侧功能 -->
            <yk-space>
                <!-- 全选框 -->
                <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
                    全选
                </yk-checkbox>
                <yk-text>已选择 {{ selectPhotoId.length }} 项内容</yk-text>
                <yk-text type="primary" style="cursor: pointer;"@click="cancelAll">取消选择</yk-text>
            </yk-space>
            <!-- 右侧功能 -->
            <yk-space>
                <!-- 删除 -->
                <IconDeleteOutline class="files-tool-delete" @click="deletePhotos"/>
                <!-- 点击弹出的分组框 -->
                <yk-popconfirm
                    title="选择分组"
                    @cancel="cancel"
                    @confirm="confirm"
                    placement="bottomRight"
                    trigger="click"
                >
                    <IconSwitchOutline class="files-tool-switch"/>
                    <!-- 内容插槽 -->
                    <template #content>
                        <yk-scrollbar ref="scrollbar" height="148px" class="category">
                            <div 
                                class="category-item"
                                v-for="item in categoryStore.data" 
                                :key="item.id"
                                :class="{'category-selected':categorySeletedId === item.id}"
                                @click="changeCategory(item.id)"
                            >{{ item.name }} {{ item.value }}
                            </div>
                        </yk-scrollbar>
                    </template>
                </yk-popconfirm>
                <!-- 切换 -->
            </yk-space>
        </div>
        <div class="files-main">
            <LocalFilesPhoto 
                v-for="item in files" 
                :data="item" 
                :key="item.id"
                @selectPhoto="selectPhoto"
                @deletePhoto="deletePhoto"
                @changeCategoryId="changeCategoryId"
            />
        </div>
        <!-- 分页功能 -->
        <div class="comment-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,nextTick,onMounted,getCurrentInstance } from 'vue';
import { mkFiles } from '../../mock/data';
import LocalFilesPhoto from './LocalFilesPhoto.vue';
import { useCategoryStore } from '../../store/category';
import './template.less'

//拿到pinia中的分组
const categoryStore = useCategoryStore();
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
    //清空选择
    if(val){
        checkedAll.value = true
        for(let i = 0;i<files.value.length;i++){
            files.value[i].selected = true
        }
    }else{
        checkedAll.value = false
        selectPhotoId.value = []
        for(let i = 0;i<files.value.length;i++){
            files.value[i].selected = false
        }
    }
}
//取消选择
const cancelAll = ()=>{
    selectPhotoId.value = []
    for(let i = 0;i<files.value.length;i++){
        files.value[i].selected = false
    }
}
/**  分类气泡框部分 */
const categorySeletedId = ref<number|string>()
//切换分组方法
const changeCategory = (el:number|string)=>{
    categorySeletedId.value = el
}

const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    proxy.$message({ type: 'warning', message: '你点击了取消按钮' })
}
function confirm() {
    proxy.$message({ type: 'primary', message: '你点击了确认按钮' })
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
// 请求的数据
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
    // 选择项：默认为未选择false()
    for(let i = 0;i < files.value.length;i++){
        files.value[i].selected = false
    }
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
/** 删除，转换分组，删除图片——组件方法 */
//被选择图片的id数组
const selectPhotoId = ref<number[]>([])
//选择
const selectPhoto = (id:number|string)=>{
    for(let i = 0;i<files.value.length;i++){
        if(files.value[i].id === id){
            files.value[i].selected = !files.value[i].selected
            //如果选中，则加入被选中图片的数组，如果没有选中，则从数组中移除
            if(files.value[i].selected){
                selectPhotoId.value.push(files.value[i].id)
            }else{
                selectPhotoId.value = selectPhotoId.value.filter(item => item !== id)
                console.log(selectPhotoId.value);
                
            }
            //全选与半选
            if(selectPhotoId.value.length === 0){
                indeterminate.value = false
                checkedAll.value = false
            }else if(selectPhotoId.value.length === files.value.length){
                indeterminate.value = false
                checkedAll.value = true
            }else{
                indeterminate.value = true
                checkedAll.value = false
            }
        }
    }
}
//删除
const deletePhoto = (id:number|string)=>{
    files.value = files.value.filter((item:any) => item.id !== id)
}
//转换分组
const changeCategoryId = (data:any)=>{
    proxy.$message({ type: 'primary', message: `移动到${data.id}` })
}
/**删除选中全部按钮方法（区别于组件中的删除） */
const deletePhotos = ()=>{
    if(selectPhotoId.value.length !== 0){
        for(let i = 0;i<selectPhotoId.value.length;i++){
            files.value = files.value.filter((item:any) => item.id !== selectPhotoId.value[i])
        }
    }
    //清除内容
    selectPhotoId.value = []
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

        &-delete,&-switch{
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