<template>
    <div class="files">
        <div class="files-tool">
            <!-- 左侧功能 -->
            <yk-space>
                <!-- 全选框 -->
                <yk-checkbox :checked="checkedAll" :indeterminate="indeterminate" @change="handleChangeAll">
                    全选
                </yk-checkbox>
                <yk-text>已选择 3 项内容</yk-text>
                <yk-text type="primary" style="cursor: pointer;">取消选择</yk-text>
            </yk-space>
            <!-- 右侧功能 -->
            <yk-space>
                <!-- 删除 -->
                <IconDeleteOutline class="files-tool-delete"/>
                <!-- 切换 -->
                <IconSwitchOutline class="files-tool-switch"/>
            </yk-space>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
//多选框
const checkedAll = ref<boolean>(false)//全选
const indeterminate = ref<boolean>(false)//半选
const handleChangeAll = (val:boolean)=>{
    indeterminate.value = false
    if(val){
        checkedAll.value = true
    }else{
        checkedAll.value = false
    }
}
</script>
<style scoped lang="less"> 
.files{
    background: @bg-color-l;
    padding: @space-xl;
    border-radius: @radius-m;
    width: 100%;

    &-tool{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: @space-l;
        border-radius: @radius-m;
        background: @bg-color-m;

        &-delete{
            width: 200px;
            height: 20px;
            color: @font-color-s;
            cursor: pointer;

            &:hover{
                color: @font-color-l;
            }
        }
    }
}
</style>