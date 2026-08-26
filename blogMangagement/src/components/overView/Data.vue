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
import { ref, computed } from 'vue'
import LineChart from '../echarts/LineChart.vue'
import PieChart from '../echarts/PieChart.vue'
import { visitsData, monitorData } from '../../mock/data'

// 访问量
const visitRadio = ref('week')

// 根据选中的时间范围过滤访问量数据（取最近7天或30天）
const visitChartData = computed(() => {
    const days = visitRadio.value === 'week' ? 7 : 30
    return visitsData.data.slice(-days)
})

// 数据监测
const monitorRadio = ref('week')

// 数据监测饼图数据（week/month 可用于未来扩展，目前使用同一份 mock 数据）
const monitorChartData = computed(() => {
    return monitorData.data
})
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
