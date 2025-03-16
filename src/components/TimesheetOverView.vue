<script lang="ts" setup>
import lCharts from '@/uni_modules/lime-echart_1.0.0/components/l-echart/l-echart.vue'

// // 1. 全量引入(主包过大)
// import * as echarts from "echarts";

import { onShow } from '@dcloudio/uni-app'
import { BarChart } from 'echarts/charts'
// 组件
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
// 2. 按需引入
import * as echarts from 'echarts/core'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'

// 引入 Canvas 渲染器，注意引入 CanvasRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, ref, watchEffect } from 'vue'

const props = defineProps<{
  timeSheet: any[]
}>()

echarts.use([
  BarChart,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  // LegendComponent,
  // LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

watchEffect(() => {
  drawCharts(props.timeSheet)
})

const chartRef = ref()

function drawCharts(source: any[]) {
  chartRef.value.setOption({
    dataset: {
      dimensions: ['workingDate', 'workingHours'], // 数据集字段映射
      source,
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: string) => `${value} h`,
      axisPointer: {
        type: 'shadow',
      },
    },
    // legend: {},
    grid: {
      left: '12%',
      right: '12%',
    },
    yAxis: {
      name: '工时',
      type: 'value',
      axisLabel: {
        formatter: '{value} h',
      },
    },
    xAxis: {
      name: '日期',
      type: 'category',
      axisLabel: {
        showMaxLabel: true,
        showMinLabel: true,
        formatter: (value: string) => value.slice(8, 10),
      },
    },
    series: {
      name: '工时',
      type: 'bar',
    },
  })
}
onShow(() => {
  nextTick(() => {
    chartRef.value.init(echarts).then(() => {
      drawCharts(props.timeSheet)
    })
  })
})
</script>

<template>
  <l-charts ref="chartRef" is-disable-scroll />
</template>
