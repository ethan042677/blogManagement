<template>
    <div class="pie-chart-wrapper">
        <!-- 设备分布饼图 -->
        <div ref="deviceChartRef" class="pie-chart-item"></div>
        <!-- 内容分布饼图 -->
        <div ref="websiteChartRef" class="pie-chart-item"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// ============================================================
// ECharts 按需引入：饼图 + 所需组件
// ============================================================
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import type { PieSeriesOption } from 'echarts/charts'
import type {
    TitleComponentOption,
    TooltipComponentOption,
    LegendComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

// 组合 Option 类型
type ECOption = ComposeOption<
    | PieSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | LegendComponentOption
>

// 注册组件到 echarts 内核
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    PieChart,
    LabelLayout,
    CanvasRenderer,
])

// ---- 类型定义 ----
interface PieDataItem {
    key: string
    name: string
    value: number
}

// ---- Props ----
const props = defineProps<{
    /** 设备分布数据：移动端 / PC端 */
    deviceData: PieDataItem[]
    /** 网站内容分布数据：文件 / 博客 / 图库 / 随笔 */
    websiteData: PieDataItem[]
}>()

// ---- 响应式引用 ----
const deviceChartRef = ref<HTMLDivElement>()
const websiteChartRef = ref<HTMLDivElement>()
let deviceChartInstance: echarts.ECharts | null = null
let websiteChartInstance: echarts.ECharts | null = null

// 统一配色板
const colorPalette = ['#2B5AED', '#36CFC9', '#FFC53D', '#FF7A45', '#9254DE', '#597EF7']

// 生成饼图配置：提取为公共方法，两个饼图共用
const createPieOption = (
    data: PieDataItem[],
    title: string
): ECOption => ({
    // ---- 标题 ----
    title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: '#333',
        },
    },

    // ---- 提示框 ----
    tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: {
            color: '#333',
            fontSize: 12,
        },
        formatter: (params: any) => {
            return `<div style="color:#999;">${params.name}</div>
                    <div style="font-size:16px;font-weight:600;color:#333;">
                        ${params.value} <span style="font-size:12px;color:#999;">(${params.percent}%)</span>
                    </div>`
        },
    },

    // ---- 图例：右侧垂直排列 ----
    legend: {
        orient: 'vertical',
        right: 0,
        top: 'center',
        textStyle: {
            fontSize: 11,
            color: '#666',
        },
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 12,
    },

    color: colorPalette,

    // ---- 系列：环形图（内外半径差形成环形） ----
    series: [
        {
            type: 'pie',
            radius: ['50%', '70%'],         // 内径 50%，外径 70% → 环形
            center: ['38%', '50%'],          // 左偏，为右侧图例腾出空间
            avoidLabelOverlap: false,
            itemStyle: {
                borderColor: '#fff',         // 扇区间白色间隔
                borderWidth: 2,
                borderRadius: 2,
            },
            label: {
                show: false,                 // 隐藏扇区标签，靠图例展示
            },
            emphasis: {
                scaleSize: 8,                // hover 时扇区放大
            },
            data,
        },
    ],
})
// 初始化两个饼图实例
const initCharts = () => {
    if (deviceChartRef.value) {
        deviceChartInstance = echarts.init(deviceChartRef.value)
        deviceChartInstance.setOption(
            createPieOption(props.deviceData, '设备分布')
        )
    }

    if (websiteChartRef.value) {
        websiteChartInstance = echarts.init(websiteChartRef.value)
        websiteChartInstance.setOption(
            createPieOption(props.websiteData, '内容分布')
        )
    }
}

// 更新图表：数据变化时重新生成完整配置
const updateCharts = () => {
    if (deviceChartInstance) {
        deviceChartInstance.setOption(
            createPieOption(props.deviceData, '设备分布')
        )
    }
    if (websiteChartInstance) {
        websiteChartInstance.setOption(
            createPieOption(props.websiteData, '内容分布')
        )
    }
}

// ---- 窗口缩放自适应 ----
const handleResize = () => {
    deviceChartInstance?.resize()
    websiteChartInstance?.resize()
}

// ---- 生命周期 ----
onMounted(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    deviceChartInstance?.dispose()
    websiteChartInstance?.dispose()
})

// ---- 监听数据变化自动更新 ----
watch(
    () => [props.deviceData, props.websiteData],
    () => {
        updateCharts()
    },
    { deep: true }
)
</script>

<style scoped lang="less">
.pie-chart-wrapper {
    display: flex;
    width: 100%;
    gap: 16px;
    .pie-chart-item {
        flex: 1;
        height: 170px;
    }
}
</style>
