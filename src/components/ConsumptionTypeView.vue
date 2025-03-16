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
import { debounce, groupBy, mapValues, sumBy } from 'lodash'
import { nextTick, onMounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  consumptionRecord: ConsumptionRecord[]
}>()

defineExpose({
  initCharts,
  disposeCharts
})

echarts.use([
  PieChart,
  TooltipComponent,
  // GridComponent,
  DatasetComponent,
  LegendComponent,
  // LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

const chartRef = ref()

const drawCharts = debounce((source: ConsumptionRecord[]) => {
  chartRef.value.setOption({
    dataset: {
      dimensions: ['type', 'amount'], // 数据集字段映射
      source: Object.values(mapValues(groupBy(source, 'consumptionType'), group => ({
        type: group[0].consumptionType,
        amount: +sumBy(group, item => +item.consumptionAmount).toFixed(2),
      }))),
    },
    tooltip: {
      trigger: 'item',
      valueFormatter: (value: string) => `${value} 元`,
    },
    // legend: {
    //   top: 'bottom',
    // },
    // grid: {},
    series: {
      name: '消费类型',
      type: 'pie',
      label: {
        alignTo: 'edge',
        position: 'outside',
        formatter: '{b}\n{percentage|{d} %}',
        minMargin: 5,
        width: 100,
        edgeDistance: 10,
        color: 'inherit',
        rich: {
          percentage: {
            fontSize: 10,
            lineHeight: 14,
            color: '#999',
          },
        },
      },
      selectedMode: 'single',
    },
  })
})
function initCharts() {
  chartRef.value.init(echarts).then(() => {
    drawCharts(props.consumptionRecord)
  })
}

function disposeCharts() {
  chartRef.value.dispose()
}

// watchEffect(() => {
//   drawCharts(props.consumptionRecord)
// })

onShow(() => {
  // 但切换应用时不会触发onMounted钩子，但会触发onShow钩子
  initCharts()
})

// onMounted(() => {
//   // 在父组件中使用v-if控制显示隐藏时，但if的值为true时只会出发onMounted钩子，并不会触发onShow钩子
//   initCharts()
// })
</script>

<template>
  <l-charts class="l-charts" ref="chartRef" is-disable-scroll />
</template>
