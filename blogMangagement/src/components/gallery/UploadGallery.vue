<template>
    <div class="upload-gallery">
        <input ref="fileInput" class="upload-input" type="file" accept="image/*" multiple @change="upload">
        <button class="upload-trigger" type="button" @click="fileInput?.click()">
            <IconPlusOutline />
            上传本地图片
        </button>
        <div class="upload-gallery-photos">
            <div class="upload-gallery-photos-item" v-for="item in photos" :key="item.id">
                <!-- 摄影图库的照片 -->
                <img :src="resolveAssetUrl(item.url)" :alt="item.fileName">
                <IconStarFill class="upload-gallery-photos-item-star" v-show="item.url === cover"/>
                <yk-space size="ss">
                    <!-- 点击将图片设置为封面，显示小星星图标 -->
                    <p class="upload-gallery-photos-item-tool" v-show="item.url !== cover" @click="changeCover(item.url)">设为封面</p>
                    <!-- 删除图标 -->
                    <IconDeleteOutline class="upload-gallery-photos-item-delete" @click="deletePhoto(item)"/>
                </yk-space>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted,ref,getCurrentInstance } from 'vue'
import { fileApi } from '../../api'
import type { FileData } from '../../utils/interface'
import { resolveAssetUrl } from '../../utils/request'

const proxy:any = getCurrentInstance()?.proxy
// 通知父组件照片列表和封面变化
const emits = defineEmits<{
    change: [photos: FileData[]]
    coverChange: [cover: string]
}>()
// 隐藏的文件选择框
const fileInput = ref<HTMLInputElement>()
// 本地图片列表
const photos = ref<FileData[]>([])
// 当前选中的封面地址
const cover = ref('')

// 把照片列表和封面同步给父组件
const notify = () => {
    emits('change', photos.value)
    emits('coverChange', cover.value)
}

// 获取本地图片：图库编辑直接读取后端文件库
const fetchPhotos = async () => {
    try {
        const data = await fileApi.list({ pageSize: 100, nowPage: 1, categoryId: -1 })
        photos.value = data.list
        // 默认使用第一张图片作为封面
        cover.value = photos.value[0]?.url || ''
        notify()
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取图片失败' })
    }
}

// 上传本地图片：上传成功后重新获取图片列表
const upload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    if (!files.length) return;
    try {
        await fileApi.upload(files)
        await fetchPhotos()
        proxy.$message({ type: 'primary', message: '图片上传成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '上传失败' })
    } finally {
        input.value = ''
    }
}

// 设置封面：保存图片地址并通知父组件
const changeCover = (url:string) => {
    cover.value = url
    notify()
}

// 删除图片：同时删除数据库记录和本地文件
const deletePhoto = async (file:FileData) => {
    try {
        // 数据库记录和本地文件同时删除，成功后重新同步封面
        await fileApi.delete(file.id, file.url)
        await fetchPhotos()
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

// 生命周期：页面加载时获取本地图片
onMounted(fetchPhotos)
</script>

<style lang="less" scoped>
.upload-input {
    display: none;
}

.upload-trigger {
    width: 100%;
    height: 120px;
    border: 1px dashed @pcolor-3;
    border-radius: @radius-m;
    background: @pcolor-1;
    color: @pcolor;
    font: inherit;
    cursor: pointer;
}

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
            position: relative;
            margin-bottom: @space-xl;
            border-radius: @radius-m;
            overflow: hidden;
            line-height: 0;

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
                background: rgba(255, 255, 255, 0.86);
                padding: 0 @space-m;
                color: @pcolor;
                cursor: pointer;
            }
            &-delete{
                width: 32px;
                height: 32px;
                border-radius: @radius-m;
                background: rgba(255, 255, 255, 0.86);
                padding: 9px;
                color: @gray;
                cursor: pointer;
            }
        }
    }
}
</style>
