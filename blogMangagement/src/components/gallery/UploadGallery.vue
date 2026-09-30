<template>
    <div class="upload-gallery">
        <!-- 图片上传 -->
        <yk-upload
            :upload-url="uploadUrl"
            :draggable="true"
        ></yk-upload>
        <!--图片渲染-->
        <div class="upload-gallery-photos">
            <div class="upload-gallery-photos-item" v-for="item in photos" :key="item.id">
                <img :src="`./src/assets/images/${item.url}`">
                <!-- 收藏/星星图标 -->
                <IconStarFill class="upload-gallery-photos-item-star" v-show="item.id === coverIndex"/>
                <!-- 设为封面和删除 -->
                <yk-space size="ss">
                    <p class="upload-gallery-photos-item-tool" v-show="item.id !== coverIndex" @click="changeCover(item.id)">设为封面</p>
                    <IconDeleteOutline class="upload-gallery-photos-item-delete" @click="deletePhoto(item.id)"/>
                </yk-space>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted,getCurrentInstance } from 'vue'
import { mkPhotos } from '../../mock/data';

const proxy: any = getCurrentInstance()?.proxy
//上传的服务器地址
const uploadUrl = ''

/**获取图片 */
type PhotoType = {
    id:number,
    url:string
}
const photos = ref<PhotoType[]>([])
const fetchPhotos = ()=>{
    photos.value = mkPhotos.data
}
/**封面和设置封面方法 */
const coverIndex = ref<number>(0)//哪一张封面

const changeCover = (id:number) =>{
    coverIndex.value = id
}
/**删除 */
const deletePhoto = (id:number) => {
    photos.value = photos.value.filter(obj => obj.id !== id)
    //如果删掉的是封面，并且图片数组内还有多张图片
    if(coverIndex.value === id && photos.value.length > 0){
        coverIndex.value = photos.value[0].id
    }else if(coverIndex.value === id && photos.value.length === 0){
        //如果删掉的是封面，并且图片数组内没有图片
        coverIndex.value = -1
    }
    proxy.$message({ type: 'primary', message: '删除成功' })
}

//生命周期
onMounted(()=>{
    fetchPhotos()
})
</script>

<style lang="less" scoped>
.upload-gallery{
    background: @bg-color-l;
    border-radius: @radius-m;
    padding: @space-xl;
    width: 100%;

    &-photos{
        width: 100%;
        column-count: 3;
        column-gap: @space-xl;
        padding-top: 32px;

        &-item{
            margin-bottom: @space-xl;
            border-radius: @radius-m;
            overflow: hidden;
            line-height: 0%;

            img{
                width: 100%;
            }
            &-star{
                position: absolute;
                left: @space-l;
                top: @space-l;
                width: 24px;
                height: 24px;
                color: @wcolor;
            }
            .yk-space{
                position: absolute;
                top: @space-l;
                right: @space-l;
            }
            &-tool{
                line-height: 32px;
                border-radius: @radius-m;
                background: rgba(255, 255, 255, 0.56);
                padding: 0 @space-m;
                color: @pcolor;
                cursor: pointer;
                transition: all @animatb;
                opacity: 0;
                &:hover{
                    background: rgba(255, 255, 255, 0.86);
                    backdrop-filter: blur(2px);
                }
            }
            &-delete{
                width: 32px;
                height: 32px;
                border-radius: @radius-m;
                background: rgba(255, 255, 255, 0.56);
                padding: 9px;
                color: @gray;
                cursor: pointer;
                transition: all @animatb;
                opacity: 0;
                &:hover{
                    color: @pcolor;
                    background: rgba(255, 255, 255, 0.86);
                    backdrop-filter: blur(2px);
                }
            }
            &:hover{
                .upload-gallery-photos-item-tool,
                .upload-gallery-photos-item-delete{
                    opacity: 1;
                }
            }
        }
    }
}
</style>