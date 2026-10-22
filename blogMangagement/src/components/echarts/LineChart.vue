<template>
    <div ref="chartRef" class="line-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
// ECharts 按需引入：折线图 + 所需组件
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import type { LineSeriesOption } from 'echarts/charts'
import type {
    TitleComponentOption,
    TooltipComponentOption,
    GridComponentOption,
    DatasetComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

// 组合 Option 类型，确保配置项类型安全
type ECOption = ComposeOption<
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>
// 注册组件到 echarts 内核
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
])

//类型定义
interface VisitItem {
    date: string
    count: number
}

//Props
const props = defineProps<{
    /** 访问量数据：日期 + 访问次数 */
    data: VisitItem[]
}>()

// ---- 响应式引用 ----
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null
// 初始化图表：构建完整的 ECharts 配置并渲染
const initChart = () => {
    if (!chartRef.value) return

    chartInstance = echarts.init(chartRef.value)

    // 将原始数据拆分为 x 轴（日期） 和 y 轴（数量）
    const dates = props.data.map((item) => item.date)
    const counts = props.data.map((item) => item.count)

    const option: ECOption = {
        // ---- 提示框 ----
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#e8e8e8',
            borderWidth: 1,
            textStyle: {
                color: '#333',
                fontSize: 12,
            },
            formatter: (params: any) => {
                const item = params[0]
                return `<div style="color:#999;margin-bottom:4px;">${item.axisValue}</div>
                        <div style="color:#2B5AED;font-size:16px;font-weight:600;">
                            访问量 <span style="margin-left:8px;">${item.value}</span>
                        </div>`
            },
        },

        // ---- 绘图网格：底部留更多空间给日期标签 ----
        grid: {
            left: '2%',
            right: '3%',
            bottom: '12%',
            top: '6%',
            containLabel: true,
        },

        // ---- X 轴（类目轴：日期） ----
        xAxis: {
            type: 'category',
            data: dates,
            boundaryGap: false,           // 数据点对齐坐标轴两端
            axisLine: {
                lineStyle: { color: '#e8e8e8' },
            },
            axisTick: { show: false },
            axisLabel: {
                color: '#999',
                fontSize: 11,
            },
        },

        // ---- Y 轴（数值轴：访问量） ----
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: { color: '#f0f0f0', type: 'dashed' },
            },
            axisLabel: {
                color: '#999',
                fontSize: 11,
            },
        },

        // ---- 系列数据 ----
        series: [
            {
                type: 'line',
                data: counts,
                smooth: true,                  // 平滑曲线
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: false,             // 默认隐藏数据点，hover 时显示
                lineStyle: {
                    color: '#2B5AED',
                    width: 2,
                },
                itemStyle: {
                    color: '#2B5AED',
                },
                // 渐变面积填充：从上到下由深变浅
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(43, 90, 237, 0.25)' },
                        { offset: 1, color: 'rgba(43, 90, 237, 0.02)' },
                    ]),
                },
            },
        ],
    }

    chartInstance.setOption(option)
}

// 更新图表：数据变化时增量更新（仅更新变化的部分）
const updateChart = () => {
    if (!chartInstance) return

    const dates = props.data.map((item) => item.date)
    const counts = props.data.map((item) => item.count)

    chartInstance.setOption({
        xAxis: { data: dates },
        series: [{ data: counts }],
    })
}

// ---- 窗口缩放自适应 ----
const handleResize = () => {
    chartInstance?.resize()
}

// ---- 生命周期 ----
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    // 移除监听并释放图表实例，防止重复进入页面后内存泄漏
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
})

// ---- 监听数据变化自动更新 ----
watch(
    () => props.data,
    () => {
        updateChart()
    },
    { deep: true }
)
</script>

<style scoped lang="less">
.line-chart {
    width: 100%;
    height: 200px;
}
</style>
