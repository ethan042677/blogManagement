<template>
    <div class="top-title">
        <!-- 类型标题 -->
        <yk-title :level="3" style="margin:0;line-height: 36px;">{{ props.name }}</yk-title>
        <slot name="custom" />
        <!-- 搜索部分 -->
        <yk-space size="s" v-if="isSearch">
            <!-- 取消搜索按钮 -->
            <yk-button type="secondary" v-show="searchData" @click="cancelSearch">取消搜索</yk-button>
            <!-- 搜索框 -->
            <yk-input-search style="width: 320px" placeholder="请输入..." v-model="searchData" @search="search">
                <template #suffix>
                    <yk-button type="secondary"><IconSearchOutline /></yk-button>
                </template>
            </yk-input-search>
        </yk-space>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
//类型
type titleProp = {
    name?:string;
    isSearch:boolean;
}
//props
const props = withDefaults(defineProps<titleProp>(),{
    name:"总览",
    isSearch:true,
})

const emit = defineEmits(['search'])
//变量
const searchData = ref();

//搜索方法
const search = ()=>{
    emit('search',searchData.value)
}
//取消搜索方法
const cancelSearch = ()=>{
    emit('search','')
    searchData.value = ''
}
</script>

<style scoped lang="less">
.top-title{
    width: 100%;
    background-color: @bg-color-m;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>