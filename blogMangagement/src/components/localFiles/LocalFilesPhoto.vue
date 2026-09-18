<template>
    <div class="files-photo">
        <div class="files-photo-item" :class="{'files-photo-selected':props.data?.selected}">
            <!-- 图片 -->
            <yk-image :src="photoUrl" width="196px" height="172px":is-lazy="true" fit="contain"></yk-image>
            <yk-space class="files-photo-item-tool" size="s">
                <!-- 删除按钮 -->
                <IconDeleteOutline class="files-tool-delete" @click="deletePhoto"/>
                <!-- 切换按钮 -->
                <yk-popconfirm
                    title="选择分组"
                    @confirm="confirm"
                    placement="bottomRight"
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
            </yk-space>
            <!-- 勾选按钮 -->
            <div class="files-photo-item-check" @click="checkPhoto">
                <IconTickMinOutline style="color: #fff;font-size: 24px;"/>
            </div>
        </div>
        <!-- 图片名称 -->
        <div class="files-photo-name">
            <p class="files-photo-name-title">{{ props.data?.fileName }}.</p>
            <p class="files-photo-name-format">{{ props.data?.format }}</p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { type FileData } from '../../utils/interface';
import { onMounted,computed,ref,getCurrentInstance } from 'vue';
import { useCategoryStore } from '../../store/category';
import './template.less'

//拿到pinia中的分组
const categoryStore = useCategoryStore();

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

/**  分类气泡框部分 */
const emits = defineEmits(['changeCategoryId','deletePhoto','selectPhoto'])
const categorySeletedId = ref<number|string>(props.data?.categoryId!)
//切换分组方法
const changeCategory = (el:number|string)=>{
    categorySeletedId.value = el
}

const proxy: any = getCurrentInstance()?.proxy
//点击确认方法
function confirm() {
    //如果与之前的分类选项不同
    if(categorySeletedId.value!=props.data?.categoryId){
        //如果修改分组，则交给父级
        const data = {
            id:props.data?.id,
            categoryId:props.data?.categoryId
        }
        emits('changeCategoryId',data)
        proxy.$message({ type: 'primary', message: '修改完成' })
    }
}
//删除方法
const deletePhoto = ()=>{
    emits('deletePhoto',props.data?.id)
}
//选择方法
const checkPhoto = ()=>{
    emits('selectPhoto',props.data?.id)
}

//生命周期
onMounted(()=>{

})
</script>

<style lang="less" scoped>
.files-photo{
    &-item{
        position: relative;
        // yk-image 根节点是 inline-block,margin:0 auto 不生效,
        // 用 flex 让图片在背景框内水平垂直都居中
        display: flex;
        align-items: center;
        justify-content: center;
        // 卡片做成横向矩形:内容区 196×172(已扣掉 2px 边框)
        // 方图 contain 后约 174×172,撑满高度、左右各留约 11px 背景
        height: 176px;
        background:@pcolor-1;
        border-radius: @radius-s;
        border: 2px solid @bg-color-l;

        &-tool{
            position: absolute;
            right: @space-m;
            bottom: @space-m;
            opacity: 0;
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
            opacity: 0;
        }
        &:hover{
            background:@pcolor-1;
            .files-photo-item-check{
                opacity: 1;
            }
            .files-photo-item-tool{
                opacity: 1;
            }
        }
    }
    &-selected{
        // 选中图片的背景
        background:@pcolor-1;
        border: 2px solid @pcolor-3;
        .files-photo-item-check{
            opacity: 1;
            background: @pcolor;
            .yk-icon{
                opacity: 1;
            }
        }
        .files-photo-item-tool{
            opacity: 0;
        }
        &:hover{
            .files-photo-item-tool{
                opacity: 0;
            }
        }
    }
    &-name{
        padding-top: @space-l;
        display: flex;
        justify-content: center;
    }
    &-title{
        text-align: center;
        overflow: hidden;
        display: -webkit-box;
        line-clamp: 1;
        flex-direction: vertical;
        text-overflow: ellipsis;
    }
}
</style>