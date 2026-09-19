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
import { ref,onMounted } from 'vue';
import { mkGallery } from '../../mock/data';
import type{ GalleryData } from '../../utils/interface.ts';
import GalleryItem from './GalleryItem.vue';

const props = defineProps({
    pageSize:{
        type:Number,
        default:6
    },
    categoryId:{
        type:Number,
        default:-1
    },
    state:{
        type:Number,
        default:0
    },
    searchTerm:{
        type:String,
        default:""
    }
})
type Request = {
    pageSize:number;//单页条数
    nowPage:number;//当前页
    state?:number;//状态
    categoryId?:number;//分类
    searchTerm?:string;//搜索词条
    isCount?:boolean;
}
const request:Request = {
    pageSize:props.pageSize,
    nowPage:1,
    state:props.state,
    categoryId:props.categoryId,
    searchTerm:props.searchTerm,
    isCount:true//true则获取count总数
}
/**  获取图库 */
//图库列表
const galleryList = ref<GalleryData[]>([])
// 图库总数
const count = ref<number>(0)
//获取图库方法
const fetchGallery = (isCount:boolean) =>{
    if(isCount){
        count.value = mkGallery.count
    }
    galleryList.value = mkGallery.list.slice(
        (request.nowPage -1) * request.pageSize,
        request.nowPage * request.pageSize
    )
}
/**删除 */
const deleteGallery = (id:number) => {
    galleryList.value = galleryList.value.filter(obj => obj.id !== id)
    console.log(id);
}

/**翻页方法 */
const changePage = (page:number)=>{
    request.nowPage = page
    fetchGallery(false)
}

//生命周期
onMounted(()=>{
    fetchGallery(true);
})
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