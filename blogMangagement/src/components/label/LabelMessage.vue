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
import type { LabelData } from '../../utils/interface.ts';

//props类型
type labelProps = {
    label:LabelData[],
}
const Props = withDefaults(defineProps<labelProps>(),{})
// 当前分组
const labelData = ref<LabelData[]>([])

const proxy: any = getCurrentInstance()?.proxy
/**
 *  @description 删除方法
 */
const deleteCategory = (id:number|string)=>{
    labelData.value = labelData.value.filter(
        (obj:{id:number|string})=>{
            return obj.id !== id
        }
    )
    proxy.$message({ type: 'primary', message: '删除成功' })
}

//监听数据变化
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