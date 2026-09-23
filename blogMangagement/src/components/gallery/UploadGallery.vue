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
                <IconStarFill class="upload-gallery-photos-item-star"/>
                <!-- 设为封面和删除 -->
                <yk-space size="ss">
                    <p class="upload-gallery-photos-item-tool">设为封面</p>
                    <IconDeleteOutline class="upload-gallery-photos-item-delete"/>
                </yk-space>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref,onMounted } from 'vue'
import { mkPhotos } from '../../mock/data';
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
                &:hover{
                    color: @pcolor;
                    background: rgba(255, 255, 255, 0.86);
                    backdrop-filter: blur(2px);
                }
            }
        }
    }
}
</style>