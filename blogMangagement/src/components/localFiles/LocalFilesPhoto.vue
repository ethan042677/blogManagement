<template>
    <div class="files-photo">
        <div class="files-photo-item">
            <yk-image :src="photoUrl" width="200" height="200":is-lazy="true" fit="contain"></yk-image>
            <yk-space class="files-photo-item-tool" size="s">
                <!-- 删除 -->
                <IconDeleteOutline class="files-tool-delete"/>
                <!-- 切换 -->
                <IconSwitchOutline class="files-tool-switch"/>
            </yk-space>
            <!-- 勾选按钮 -->
            <div class="files-photo-item-check">
                <IconTickMinOutline style="color: #fff;font-size: 24px;"/>
            </div>
        </div>
        <yk-text>{{ props.data?.fileName }}.{{ props.data?.format }}</yk-text>
    </div>
</template>
<script lang="ts" setup>
import { type FileData } from '../../utils/interface';
import { onMounted,computed } from 'vue';

//props接口
type FilePhotoProps = {
    data?:FileData,
}

const props = withDefaults(defineProps<FilePhotoProps>(),{

})

//图片路径
const photoUrl = computed(()=>{
    return `/src/assets/images/${props.data?.url}`
})

//生命周期
onMounted(()=>{

})
</script>

<style lang="less" scoped>
.files-photo{
    &-item{
        position: relative;
        background:@pcolor-1;

        &-tool{
            position: absolute;
            right: @space-m;
            bottom: @space-m;
            .yk-icon{
                width: 32px;
                height: 32px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.56);
                border-radius: 8px;
                transition: all @animatb;
                cursor: pointer;
                &:hover{
                    color: @pcolor;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(2px);
                }
            }
        }

        &-check{
            width: 26px;
            height: 26px;
            border-radius: @radius-s;
            background: @gray-4;
            position: absolute;
            left: @space-s;
            top: @space-s;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.56);
        }
    }
}
</style>