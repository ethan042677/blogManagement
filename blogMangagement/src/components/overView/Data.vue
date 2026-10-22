<template>
    <yk-space dir="vertical" size="xl" style="width: 100%;">
        <!-- 访问量图表 -->
        <div class="data-card">
            <!-- 标题 -->
            <div class="data-card-title">
                <p class="data-card-name">访问量</p>
                <yk-radio-group v-model="visitRadio" type="button" :solid="true">
                    <yk-radio value="week">近一周</yk-radio>
                    <yk-radio value="month">近一月</yk-radio>
                </yk-radio-group>
            </div>
            <line-chart :data="visitChartData" />
        </div>
        <!-- 数据监测图表 -->
        <div class="data-card">
            <div class="data-card-title">
                <p class="data-card-name">数据监测</p>
                <yk-radio-group v-model="monitorRadio" type="button" :solid="true">
                    <yk-radio value="week">近一周</yk-radio>
                    <yk-radio value="month">近一月</yk-radio>
                </yk-radio-group>
            </div>
            <pie-chart
                :device-data="monitorChartData.device"
                :website-data="monitorChartData.website"
            />
        </div>
    </yk-space>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LineChart from '../echarts/LineChart.vue'
import PieChart from '../echarts/PieChart.vue'
import { overviewApi } from '../../api'

// 访问量时间范围
const visitRadio = ref('week')
// 当前访问量折线图数据
const visitChartData = ref<{ date:string; count:number }[]>([])

// 数据监测时间范围
const monitorRadio = ref('week')
// 当前设备分布和网站内容分布
const monitorChartData = ref({
    device: [] as { key:string; name:string; value:number }[],
    website: [] as { key:string; name:string; value:number }[],
})

// 切换周/月时同时刷新访问量和数据监测
watch([visitRadio, monitorRadio], async () => {
    try {
        const [visits, survey] = await Promise.all([
            overviewApi.visits(visitRadio.value === 'week' ? 7 : 30),
            overviewApi.survey(monitorRadio.value === 'week' ? 7 : 30),
        ])
        visitChartData.value = visits
        monitorChartData.value = survey
    } catch (error) {
        console.error('获取统计数据失败', error)
    }
}, { immediate: true })
</script>

<style scoped lang="less">
.data-card{
    padding: @space-xl;
    border-radius: @radius-m;
    background: @bg-color-l;
    width: 100%;

    .data-card-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: @space-l;

        .data-card-name {
            .font-l();
            font-weight: 600;
            color: @font-color-l;
        }
    }
}
</style>
