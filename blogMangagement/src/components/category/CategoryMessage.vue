<template>
    <yk-table :data="categoryStore.data">
        <yk-table-column property="name" label="分组名称"></yk-table-column>
        <yk-table-column property="value" label="关联文章数"></yk-table-column>
        <yk-table-column property="moment" label="创建日期"></yk-table-column>
        <yk-table-column
            property="operation"
            label="操作"
            align="right"
        ></yk-table-column>
        <template #tbody>
            <tr v-for="(item, index) in categoryStore.data" :key="index" class="yk-table__row">
                <td class="yk-table__cell">
                    <yk-input v-model="item.name" @focus="focusCategory(item.id)" @blur="blurCategory(item.id)" />
                </td>
                <td class="yk-table__cell">
                    {{ item.value }}
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
import {getCurrentInstance} from 'vue'
import { categoryApi } from '../../api';
import { useCategoryStore } from '../../store/category';

//store
const categoryStore = useCategoryStore();

const proxy: any = getCurrentInstance()?.proxy
const emits = defineEmits(['changed'])
// 当前分组名称
let nowCategoryName:string|number;
/**
 * @description 聚焦方法
 */
const focusCategory = (id:number|string)=>{
    // 聚焦时记录旧名称，失焦后用于判断是否真的修改
    let result = categoryStore.data.find((item:{id:number|string})=> item.id === id)
    if(result) nowCategoryName = result.name;
}
/**
 * @description 失焦方法
 */
const blurCategory = async (id:number|string)=>{
    // 只有名称发生变化才调用修改接口
    let result = categoryStore.data.find((item:{id:number|string})=> item.id === id)
    if(result && nowCategoryName !== result.name){
        try {
            await categoryApi.rename(Number(id), String(result.name))
            proxy.$message({ type: 'primary', message: '修改成功' })
            emits('changed')
        } catch (error) {
            proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '修改失败' })
            emits('changed')
        }
    }
}
/**
 *  @description 删除方法
 */
const deleteCategory = async (id:number|string)=>{
    try {
        // [联调修复] 删除分类后由后端把关联内容移到“未分类”，再重新拉取统计。
        await categoryApi.delete(Number(id))
        emits('changed')
        proxy.$message({ type: 'primary', message: '删除成功' })
    } catch (error) {
        proxy.$message({ type: 'danger', message: error instanceof Error ? error.message : '删除失败' })
    }
}
</script>

<style lang="less" scoped>

</style>
