<template>
    <div class="gallery">
        <div class="gallery-content">
            <div class="gallery-content-photos">
                <GalleryItem 
                    v-for="item in galleryList" 
                    :key="item.id" 
                    :data="item" 
                    @deleteGallery="deleteGallery"
                />
            </div>
            <div class="gallery-pagination">
                <yk-pagination :total="count" :page-size="pageSize" size="m"  @change="changePage"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance,watch } from 'vue';
import { articleApi } from '../../api';
import type{ GalleryData } from '../../utils/interface.ts';
import GalleryItem from './GalleryItem.vue';

// 图库列表的父组件参数
const props = defineProps({
    pageSize:{ type:Number, default:6 }, // 单页条数
    categoryId:{ type:[Number, String] as any, default:-1 }, // 分类 id
    searchTerm:{ type:String, default:"" }, // 搜索词条
})

// 当前图库列表请求参数
const request = {
    pageSize:props.pageSize, // 单页条数
    nowPage:1, // 当前页
    categoryId:props.categoryId as number | string, // 所属分类
    searchTerm:props.searchTerm, // 搜索词条
}
// 图库列表数据
const galleryList = ref<GalleryData[]>([])
// 图库总数
const count = ref<number>(0)
// 获取组件实例，用于全局消息提示
const proxy: any = getCurrentInstance()?.proxy

// 获取图库列表：查询当前页并同步总条数
const fetchGallery = async ()=>{
    try {
        const data = await articleApi.list({ ...request, classify: 1 })
        count.value = data.count
        galleryList.value = data.list as GalleryData[]
    } catch (error) {
        galleryList.value = []
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取图库失败' })
    }
}

// 删除图库：删除成功后刷新列表
const deleteGallery = async (id:number) => {
    try {
        await articleApi.delete(id)
        await fetchGallery()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 翻页方法
const changePage = (page:number)=>{
    request.nowPage = page
    fetchGallery()
}

// 分类或搜索词变化时重新查询
watch(
    () => [props.categoryId, props.searchTerm],
    () => {
        request.categoryId = props.categoryId as number | string
        request.searchTerm = props.searchTerm
        request.nowPage = 1
        fetchGallery()
    },
)

// 生命周期：组件挂载后获取图库
onMounted(fetchGallery)
</script>

<style lang="less" scoped>
.gallery{
    width: 100%;
    background: @bg-color-l;
    padding: 32px 24px 24px;
    border-radius: @radius-m;

    &-content{
        display: inline;

        &-photos{
            display: grid;
            grid-template-columns: repeat(auto-fill,238px);
            row-gap: 32px;
            column-gap: 24px;
            justify-content: center;
        }
    }

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
