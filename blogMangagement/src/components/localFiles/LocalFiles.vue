<template>
    <div class="files">
        <input ref="fileInput" class="file-input" type="file" multiple @change="uploadFiles">
        <!-- 如果有选中照片，则显示 -->
        <div class="files-tool" v-show="selectPhotoId.length > 0">
            <yk-space>
                <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
                    全选
                </yk-checkbox>
                <yk-text>已选择 {{ selectPhotoId.length }} 项内容</yk-text>
                <yk-text type="primary" style="cursor: pointer;" @click="cancelAll">取消选择</yk-text>
            </yk-space>
            <!-- 删除按钮和转换分组按钮 -->
            <yk-space>
                <IconDeleteOutline class="files-tool-delete" @click="deletePhotos"/>
                <yk-popconfirm
                    title="选择分组"
                    @cancel="cancel"
                    @confirm="confirm"
                    placement="bottomRight"
                    trigger="click"
                >
                    <IconSwitchOutline class="files-tool-switch"/>
                    <!-- 渲染可选择分类 -->
                    <template #content>
                        <yk-scrollbar ref="scrollbar" height="148px" class="category">
                            <div
                                class="category-item"
                                v-for="item in categoryStore.data"
                                :key="item.id"
                                :class="{'category-selected':categorySelectedId === item.id}"
                                @click="changeCategory(item.id)"
                            >{{ item.name }} {{ item.value }}</div>
                        </yk-scrollbar>
                    </template>
                </yk-popconfirm>
            </yk-space>
        </div>
        <!-- 渲染存储的本地文件 -->
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
        <!-- 分页组件 -->
        <div class="comment-pagination">
            <yk-pagination :total="count" :page-size="pageSize" size="m" @change="changePage"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,nextTick,onMounted,getCurrentInstance,watch } from 'vue';
import { fileApi } from '../../api';
import LocalFilesPhoto from './LocalFilesPhoto.vue';
import { useCategoryStore } from '../../store/category';
import type { FileData } from '../../utils/interface';
import './template.less'

// 拿到 Pinia 中的文件分类
const categoryStore = useCategoryStore();
// 文件列表组件的父组件参数
const props = withDefaults(defineProps<{
    pageSize?:number,
    categoryId?:number|string,
}>(),{
    pageSize:8, // 单页条数
    categoryId:-1, // -1 表示全部文件
})
// 获取组件实例，用于全局消息提示
const proxy: any = getCurrentInstance()?.proxy
// 当前页文件数据
const files = ref<FileData[]>([])
// 文件总数
const count = ref(0)
// 隐藏的文件选择框
const fileInput = ref<HTMLInputElement>()
// 被选择文件的 id 数组
const selectPhotoId = ref<number[]>([])
// 是否全选
const checkedAll = ref(false)
// 是否处于半选状态
const indeterminate = ref(false)
// 批量移动时选中的目标分类
const categorySelectedId = ref<number|string>()
// 滚动条实例
const scrollbar = ref()
// 当前文件列表请求参数
const request = {
    pageSize: props.pageSize, // 单页条数
    nowPage: 1, // 当前页
    categoryId: props.categoryId, // 所属分类
}

// 获取文件列表：查询分页数据并清空上一次的选择状态
const fetchFileData = async () => {
    try {
        const data = await fileApi.list(request)
        // 数量
        count.value = data.count
        // 实际渲染的本地文件信息
        files.value = data.list.map((item) => ({ ...item, selected: false }))
        selectPhotoId.value = []
        checkedAll.value = false
        indeterminate.value = false
    } catch (error) {
        files.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取文件失败' })
    }
}

// 打开系统文件选择框
const chooseFiles = () => fileInput.value?.click()

// 上传文件：上传本地文件并刷新列表
const uploadFiles = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const selected = Array.from(input.files || [])
    if (!selected.length) return;
    try {
        const categoryId = typeof props.categoryId === 'number' ? props.categoryId : -1
        await fileApi.upload(selected, categoryId)
        await fetchFileData()
        proxy.$message({ type: 'primary', message: '上传成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '上传失败' })
    } finally {
        input.value = ''
    }
}

// 全选或取消全选
const handleChangeAll = (value:boolean) => {
    checkedAll.value = value
    indeterminate.value = false
    files.value.forEach((item) => { item.selected = value })
    selectPhotoId.value = value ? files.value.map((item) => item.id) : []
}

// 取消全部选择
const cancelAll = () => {
    selectPhotoId.value = []
    files.value.forEach((item) => { item.selected = false })
    checkedAll.value = false
    indeterminate.value = false
}

// 选择单张文件，并更新全选、半选状态
const selectPhoto = (id:number|string) => {
    const file = files.value.find((item) => item.id === Number(id))
    if (!file) return
    file.selected = !file.selected
    // 如果选中就更新被选中文件数组，没有选中则移出
    if(file.selected){
        selectPhotoId.value = [...new Set([...selectPhotoId.value, file.id])]
    }else{
        selectPhotoId.value = selectPhotoId.value.filter((item) => item !== file.id)
    }
    // 更新半选状态
    indeterminate.value = selectPhotoId.value.length > 0 && selectPhotoId.value.length < files.value.length
    // 更新全选
    checkedAll.value = selectPhotoId.value.length === files.value.length && files.value.length > 0
}

// 根据 id 获取文件地址并调用删除接口
const deleteFilesByIds = async (ids:number[]) => {
    const urls = files.value.filter((item) => ids.includes(item.id)).map((item) => item.url)
    await fileApi.delete(ids, urls)
}

// 删除单个文件
const deletePhoto = async (id:number|string) => {
    try {
        await deleteFilesByIds([Number(id)])
        await fetchFileData()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 移动单个文件到新分类
const changeCategoryId = async (data:{ id:number; categoryId:number }) => {
    try {
        await fileApi.move(data.id, data.categoryId)
        await fetchFileData()
        proxy.$message({ type: 'primary', message: '移动成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '移动失败' })
    }
}

// 批量删除已选择的文件
const deletePhotos = async () => {
    // 没有选中直接退出
    if (!selectPhotoId.value.length) return;
    try {
        await deleteFilesByIds(selectPhotoId.value)
        await fetchFileData()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 选择批量移动的目标分类
const changeCategory = (id:number|string) => {
    categorySelectedId.value = id
}

// 取消批量移动
function cancel() {
    categorySelectedId.value = undefined
}

// 确认批量移动文件
const confirm = async () => {
    if (categorySelectedId.value === undefined || !selectPhotoId.value.length) return
    try {
        await fileApi.move(selectPhotoId.value, Number(categorySelectedId.value))
        await fetchFileData()
        proxy.$message({ type: 'primary', message: '移动成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '移动失败' })
    }
}

// 翻页方法：请求新一页并让滚动条回到顶部
const changePage = (page:number) => {
    request.nowPage = page
    fetchFileData()
    nextTick(() => scrollbar.value?.scrollTo({ top: 0, behavior: 'smooth' }))
}

// 分类变化时回到第一页重新查询
watch(
    () => props.categoryId,
    (value) => {
        request.categoryId = value
        request.nowPage = 1
        fetchFileData()
    },
)

// 暴露文件选择方法，供页面上传按钮调用
defineExpose({ chooseFiles })
// 生命周期：组件挂载后获取文件列表
onMounted(fetchFileData)
</script>

<style scoped lang="less">
.file-input {
    display: none;
}

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
            &:hover{ color: @font-color-l; }
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
