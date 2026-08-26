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
import { useCategoryStore } from '../../store/category';

//store
const categoryStore = useCategoryStore();

const proxy: any = getCurrentInstance()?.proxy
// 当前分组名称
let nowCategoryName:string|number;
/**
 * @description 聚焦方法
 */
const focusCategory = (id:number|string)=>{
    let result = categoryStore.data.find((item:{id:number|string})=> item.id === id)
    if(result) nowCategoryName = result.name;
}
/**
 * @description 失焦方法
 */
const blurCategory = (id:number|string)=>{
    let result = categoryStore.data.find((item:{id:number|string})=> item.id === id)
    if(result && nowCategoryName !== result.name){
        // 提交后端
        proxy.$message({ type: 'primary', message: '修改成功' })
    }
}
/**
 *  @description 删除方法
 */
const deleteCategory = (id:number|string)=>{
    categoryStore.data = categoryStore.data.filter(
        (obj:{value:any;id:number|string})=>{
            if(obj.id === id){
                categoryStore.calculateUncategorized.value += obj.value
            }
            return obj.id !== id
        }
    )
    proxy.$message({ type: 'primary', message: '删除成功' })
}
</script>

<style lang="less" scoped>

</style>