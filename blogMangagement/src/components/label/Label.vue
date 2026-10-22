<template>
    <div class="label">
        <div class="label-title">
            <yk-title :level="4" style="margin: 0;">标签</yk-title>
            <yk-space style="flex: none;">
                <!-- 新建 -->
                <yk-popconfirm
                    title="新建标签"
                    @cancel="cancel"
                    @confirm="confirm"
                    trigger="click"
                    placement="bottom"
                >
                    <yk-text type="primary">
                        <IconCirclePlusOutline style="margin-right: 4px;"/>新建
                    </yk-text>
                    <template #content>
                        <div style="margin: 8px 4px 16px;">
                            <yk-input
                                show-counter
                                :limit="6"
                                placeholder="请输入..."
                                style="width:208px"
                                v-model="inputValue"
                            ></yk-input>
                        </div>
                    </template>
                </yk-popconfirm>
                <!-- 管理分组 -->
                <yk-text type="primary" @click="showModal">
                    <IconSettingsOutline style="margin-right: 4px;"/>管理分组
                </yk-text>
            </yk-space>
            <yk-modal v-model="visible" title="管理标签">
                <LabelMessage  :label="labelList" @changed="getLabel"/>
                <template #footer>
                    <yk-button @click="showModal">确定</yk-button>
                </template>
            </yk-modal>
        </div>
        <!-- 分组：细化分类 -->
        <yk-space wrap size="s">
            <yk-tag v-for="item in labelList" :key="item.id" :class="{'label-menu-selected':selected== item.id +'label'}" @click="changeCategory(item.id,'label')">
                {{ item.name }}
            </yk-tag>
        </yk-space>
    </div>
</template>
<script setup lang="ts">
import { onMounted,ref,getCurrentInstance } from 'vue';
import { labelApi } from '../../api';
import  LabelMessage  from './LabelMessage.vue'
import type { LabelData } from '../../utils/interface.ts';

//变量
const selected = ref<number|string>("-1all")
const emits = defineEmits(['nowCategory'])

//新建-输入框的值
const inputValue = ref<number|string>()
// modal对话框
const visible = ref<boolean>(false)
const showModal = () => {
    visible.value = !visible.value;
}

/**
 * @description 获取标签方法
 */
const labelList = ref<LabelData[]>([])
const getLabel = async ()=>{
    try {
        // 选中标签 id 会传给文章列表做筛选
        labelList.value = await labelApi.list()
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '获取标签失败' })
    }
}
/**
 * @description 切换标签
 */
const changeCategory = (id:string|number,type:string)=>{
    if(id+type != selected.value){
        selected.value = id+type
        emits('nowCategory',{id,type})
    }
}
/**
 * @description 新建按钮的cancel（取消）方法和confirm（确定）方法
 */
const proxy: any = getCurrentInstance()?.proxy
function cancel() {
    inputValue.value = ''
}
async function confirm() {
    if(inputValue.value){
        try {
            // 新建后重新拉取，保证标签 id 来自数据库
            await labelApi.add({
                name: String(inputValue.value),
                moment: new Date().toISOString(),
            })
            await getLabel()
            inputValue.value = ''
            proxy.$message({ type: 'primary', message: '新建成功' })
        } catch (error) {
            proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '新建失败' })
        }
    }else{
        proxy.$message({ type: 'primary', message: '请输入' })
    }
}
// 生命周期
onMounted(()=>{
    getLabel()
})
</script>
<style scoped lang="less">
.label{
    padding: @space-l @space-xl;
    border-radius: @radius-l;
    background-color: @bg-color-l;
    flex: none;
    width: 280px;
    &-title{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: @space-l;
    }
    .yk-text{
        cursor: pointer;
    }
    
}
</style>
