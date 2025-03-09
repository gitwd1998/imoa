<script lang="ts" setup>
import lCharts from '@/uni_modules/lime-echart_1.0.0/components/l-echart/l-echart.vue'

// // 1. 全量引入(主包过大)
// import * as echarts from "echarts";

import { onShow } from '@dcloudio/uni-app'
import { PieChart } from 'echarts/charts'
// 组件
import { DatasetComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
// 2. 按需引入
import * as echarts from 'echarts/core'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'

// 引入 Canvas 渲染器，注意引入 CanvasRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'
import { groupBy, mapValues, sumBy } from 'lodash'
import { nextTick, ref, watchEffect } from 'vue'

const props = defineProps<{
  consumptionRecord: ConsumptionRecordItem[]
}>()

echarts.use([
  PieChart,
  TooltipComponent,
  // GridComponent,
  DatasetComponent,
  // LegendComponent,
  // LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

watchEffect(() => {
  drawCharts(props.consumptionRecord)
})

const chartRef = ref(null)

function drawCharts(source = []) {
  chartRef.value.setOption({
    dataset: {
      dimensions: ['type', 'amount'], // 数据集字段映射
      source: Object.values(mapValues(groupBy(props.consumptionRecord, 'consumptionType'), group => ({
        type: group[0].consumptionType,
        amount: sumBy(group, item => +item.consumptionAmount).toFixed(2),
      }))),
    },
    tooltip: {
      trigger: 'item',
      valueFormatter: (value: string) => `${value} 元`,
    },
    label: {
      formatter: '{b}\n{d}%',
      width: 100,
    },
    // legend: {
    //   top: 'bottom',
    // },
    // grid: {},
    series: {
      name: '消费类型',
      type: 'pie',
    },
  })
}
onShow(() => {
  nextTick(() => {
    chartRef.value.init(echarts).then(() => {
      drawCharts(props.consumptionRecord)
    })
  })
})
</script>

<template>
  <l-charts ref="chartRef" is-disable-scroll />
</template>
