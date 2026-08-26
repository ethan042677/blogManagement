<template>
    <yk-space class="gather">
        <!--渲染标题、文本 -->
        <div v-for="(item,index) in gathers" :key="index" class="gather-list" :style="{background:'linear-gradient('+ item.bgColor+')'}">
            <yk-space dir="vertical" size="s">
                <yk-text type="secondary">{{ item.name }}</yk-text>
                <yk-title :level="2" style="margin:0">{{ item.total }}</yk-title>
            </yk-space>
            <!-- 新增按钮 -->
            <yk-button v-if="index>0" size="xl" type="secondary" shape="square">
                <IconPlusOutline />
            </yk-button>
        </div>
    </yk-space>
</template>

<script setup lang="ts">
import { overLinks } from '../../utils/menu';
import { overViewData } from '../../mock/data';
import { ref } from 'vue';


// 变量
const gathers = ref(overLinks)
//模拟获取数据
const fetchGatherData = ()=>{
    try {
        const data = overViewData.data
        //渲染数据
        const keys = ['file', 'article', 'gallery', 'diary']
        gathers.value.forEach((el, index) => {
            el.total = data[keys[index]]
        })
    } catch (error) {
        console.error("获取失败！")
    }
}
fetchGatherData()
</script>

<style scoped lang="less">
.gather{
    width: 100%;
    .gather-list{
        width: 25%;
        background: #eee;
        display: flex;
        justify-content: space-between;
        padding: @space-l;
        border-radius: @radius-m;
        align-items: center;
        &:first-child{
            .yk-text,.yk-title{
                color:@white;
            }
        }
    }
}
</style>