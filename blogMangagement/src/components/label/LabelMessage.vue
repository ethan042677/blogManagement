<template>
    <yk-table>
        <yk-table-column property="name" label="标签名称"></yk-table-column>
        <yk-table-column property="moment" label="创建日期"></yk-table-column>
        <yk-table-column
            property="operation"
            label="操作"
            align="right"
        ></yk-table-column>
        <template #tbody>
            <tr v-for="(item, index) in labelData" :key="index" class="yk-table__row">
                <td class="yk-table__cell">
                    {{ item.name }}
                </td>
                <td class="yk-table__cell">
                    {{ item.moment }}
                </td>
                <td class="yk-table__cell text-right">
                    <yk-text type="primary" style="cursor: pointer" @click="deleteCategory(item.id)">删除</yk-text>
                </td>
            </tr>
        </template>
    </yk-table>
</template>

<script setup lang="ts">
import {getCurrentInstance,ref,watch} from 'vue'
import { labelApi } from '../../api';
import type { LabelData } from '../../utils/interface.ts';

//props类型
type labelProps = {
    label:LabelData[],
}
const Props = withDefaults(defineProps<labelProps>(),{})
// 当前标签列表
const labelData = ref<LabelData[]>([])

const proxy: any = getCurrentInstance()?.proxy
/**
 *  @description 删除方法
 */
const emits = defineEmits(['changed'])
const deleteCategory = async (id:number|string)=>{
    try {
        // 删除成功后同步父组件的标签列表
        await labelApi.delete(Number(id))
        labelData.value = labelData.value.filter(
            (obj:{id:number|string})=>{
                return obj.id !== id
            }
        )
        emits('changed')
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}

//监听父组件标签变化，并用新数组避免直接修改 props
watch(
    ()=>Props.label,
    (data)=> {
        labelData.value = [...data]
    },
    {immediate:true}
)
</script>

<style lang="less" scoped>

</style>
