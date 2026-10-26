<template>
    <div class="gallery-item">
        <yk-space size="s" dir="vertical">
            <!-- 文章图片 -->
            <div class="gallery-item-image">
                <!-- 最上面的照片 -->
                <div class="gallery-item-image-cover">
                    <yk-image
                        :src="coverUrl"
                        width="238px"
                        height="160px"
                        :is-lazy="true"
                        :preview="false"
                        fit="cover"
                    />
                </div>
                <yk-space :size="2">
                    <!-- 左边图片 -->
                    <div class="gallery-item-image-left imgs">
                        <yk-image :src="resolveAssetUrl(props.data?.content?.[0])" width="78px" height="78px" :is-lazy="true" :preview="false" fit="cover" v-if="props.data?.content?.[0]"/>
                    </div>
                    <!-- 中间照片 -->
                    <div class="gallery-item-image-middle imgs">
                        <yk-image :src="resolveAssetUrl(props.data?.content?.[1])" width="78px" height="78px" :is-lazy="true" :preview="false" fit="cover" v-if="props.data?.content?.[1]"/>
                    </div>
                    <!-- 右边照片 -->
                    <div class="gallery-item-image-right imgs">
                        <yk-image :src="resolveAssetUrl(props.data?.content?.[2])" width="78px" height="78px" :is-lazy="true" :preview="false" fit="cover" v-if="props.data?.content?.[2]"/>
                    </div>
                </yk-space>
                <!-- 右上的选择框 -->
                <yk-space class="gallery-item-right" :size="4">
                    <!-- 编辑 -->
                    <IconFillOutline/>
                    <!-- 删除 -->
                    <yk-popconfirm
                        trigger="click"
                        title="确定删除"
                        placement="topRight"
                        content="删除将不可恢复"
                        @cancel="cancel"
                        @confirm="deleteGallery(props.data?.id)"
                    >
                        <IconDeleteOutline/>
                    </yk-popconfirm>
                </yk-space>
            </div>
            <div style="width: 100%;">
                <!-- 标题 -->
                <p class="gallery-item-title">{{ props.data?.title }}</p>
                <!-- 下方信息部分-->
                <div class="gallery-item-data">
                    <!-- 标签以及日期等标记 (左边)-->
                    <yk-space class="gallery-item-left">
                            <yk-text type="third">
                                查看{{ props.data?.views }}
                            </yk-text>
                            <yk-text type="third">
                                喜欢{{ props.data?.praise }}
                            </yk-text>
                            <yk-text type="third" class="gallery-item-time">{{ resultTime }}</yk-text>
                    </yk-space>
                </div>
            </div>
        </yk-space>
    </div>
    
</template>

<script lang="ts" setup>
import { computed,getCurrentInstance } from 'vue';
import type { GalleryData } from '../../utils/interface';
import { resolveAssetUrl } from '../../utils/request';


/**拿到父级传的数据 */
type GalleryProps = {
    data : GalleryData
}
const props = withDefaults(defineProps<GalleryProps>(),{})
//传给父级处理的删除操作和更新状态
const emits = defineEmits(['deleteGallery'])

/** 图片url*/
const coverUrl = computed(()=>{
    return resolveAssetUrl(props.data?.cover)
})
/**截取时间 */
const resultTime = computed(()=>{
    // 只保留年月日
    return props.data?.moment.substring(0,10)
})

/**删除气泡框 */
const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    proxy.$message({ type: 'warning', message: '取消删除' })
}
function deleteGallery(id:number) {
    // 弹窗确认后交给父组件删除并刷新
    emits("deleteGallery",id)
}
</script>

<style lang="less" scoped>
.gallery-item{
    width: 238px;
    border-radius: @radius-m;
    background: @bg-color-l;
    padding: @space-xl;
    &-image{
        &-cover{
            position: relative;
            border-radius: @radius-m @radius-m 0 0;
            overflow: hidden;
            flex: none;
            padding-bottom: 2px;
        }

        &-left{
            border-radius: 0 0 0 @radius-m;
            overflow:hidden;
        }
        &-right{
            border-radius: 0 0 @radius-m 0;
            overflow:hidden;
        }
    }
    .imgs{
        background-color: @gray-2;
        height: 78px;
        width: 78px;
    }
    &-unpublish{
        width: 100%;
        height: 36px;
        position: absolute;
        bottom: 0;
        text-align: center;
        background: rgba(43, 90, 237, 0.8);
        color: @white;
        line-height: 36px;
        font-weight: 600;
    }
    &-title{
        .font-l();
        font-weight: 600;
        /* 单行截断:nowrap + text-overflow 才会出省略号。*/
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    &-introduction{
        .font-m();
        height: 48px;
        overflow: hidden;
        display: -webkit-box;
        line-clamp: 2;
        text-overflow: ellipsis;
        color: @font-color-l;
        margin-bottom: @space-m;
        max-width: 720px;
    }
    &-data{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    // 与 .gallery-item-image 等宽(封面 238px,缩略图 78*3+2*2=238),
    // 这样日期右边缘才能和图片右边缘对齐
    &-left{
        width: 238px;
        flex: none;// 撑满 238px 后不被 space-between 压缩
    }
    &-time{
        // flex 项靠 auto margin 顶到该组最右,不受 justify-content 影响
        margin-left: auto;
    }
    &-right{
        position: absolute;
        right:@space-l;
        top: @space-l;
        background-color: rgba(255, 255, 255, 0.56);
        border-radius: @radius-m;
        padding: @space-ss;
        opacity: 0;
        .yk-icon{
            width: 24px;
            height: 24px;
            padding: 5px;
            color: @gray;
            cursor: pointer;
            &:hover{
                color: @pcolor;
            }
        }
        &:hover{
            background-color: rgba(255, 255, 255, 0.64);
            backdrop-filter: blur(2px);
            color: @pcolor;
        }
    }
    &:hover{
        .gallery-item-right{
            opacity: 1;
        }
    }
}
// yk-image 是第三方组件,内部节点不带本组件的 scoped 标记,
// 必须用 :deep() 才选得到
:deep(.yk-image__img){
    border-radius: 0;
}
</style>

