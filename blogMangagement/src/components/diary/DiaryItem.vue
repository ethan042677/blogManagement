<template>
    <div class="diary-item">
        <yk-space dir="vertical" size="s">
            <div class="diary-item-top">
                <yk-space dir="vertical" :size="4">
                    <!-- 标题和天气-->
                    <p class="diary-item-top-title">
                        {{ props.data.title }}
                        <img :src="weatherUrl" style="width: 20px;height: 20px;"/>
                    </p>
                    <!-- 时间 -->
                    <yk-text type="third">{{ resultTime }}</yk-text>
                </yk-space>
                <!-- 删除 -->
                <yk-popconfirm
                    trigger="click"
                    title="确定删除"
                    placement="topRight"
                    content="删除将不可恢复"
                    @cancel="cancel"
                    @confirm="deleteDiary(props.data?.id)"
                >
                    <IconDeleteOutline class="diary-item-top-delete"/>
                </yk-popconfirm>
            </div>
            <!-- 内容文本以及图片预览 -->
            <yk-text>{{ props.data.content }}</yk-text>
            <div class="diary-item-images">
                <yk-image-preview-group
                    :src-list="pictureUrl"
                    width="80"
                    height="80"
                    class="diary-item-images"
                ></yk-image-preview-group>
            </div>
        </yk-space>
    </div>
    
</template>

<script lang="ts" setup>
import { computed,getCurrentInstance,onMounted } from 'vue';
import type { DiaryData } from '../../utils/interface';
import { weatherList } from '../../utils/weather';

/**拿到父级传的数据 */
type DiaryProps = {
    data : DiaryData
}
const props = withDefaults(defineProps<DiaryProps>(),{})
//传给父级处理的删除操作和更新状态
const emits = defineEmits(['deleteDiary'])

/** 图片url*/
const pictureUrl = computed(()=>{
    if(props.data.picture){
        //深拷贝
        const tempList = JSON.parse(JSON.stringify(props.data.picture))
        const picArr = tempList.map((item:any) => item = `./src/assets/images/${item}`)
        return picArr
    }
    return console.error("undefined")
})
/**截取时间 */
const resultTime = computed(()=>{
    //只保留年,月,日,时,分
    return props.data?.moment.substring(0,16)
})
/**获取天气图标 */
const weatherUrl = computed(()=>{
    return `./src/assets/${weatherList[props.data.weatherId].icon}`
})

/**删除气泡框 */
const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    proxy.$message({ type: 'warning', message: '取消删除' })
}
function deleteDiary(id:number) {
    emits("deleteDiary",id)
    proxy.$message({ type: 'primary', message: '删除成功' })
}

// 生命周期
onMounted(()=>{
    console.log(pictureUrl.value);
    
})
</script>

<style lang="less" scoped>
.diary-item{
    width: 100%;
    border-radius: @radius-m;
    padding: @space-xl;
    background: @bg-color-l;
    padding: @space-xl;
    &-top{
        width: 100%;
        display: flex;
        justify-content: space-between;
        &-title{
            display: flex;
            align-items: center;
            font-size: 20px;
            font-weight: 600;

            img{
                margin-left: @space-s;
            }
        }
        &-delete{
            width: 20px;
            height: 20px;
            padding: 2px;
            color: @font-color-s;
            transition: color @animatb;
            display: none;
            &:hover{
                color: @font-color-l;
            }
        }
    }
    &:hover{
        .diary-item-top-delete{
            display: block;
        }
    }
}
</style>