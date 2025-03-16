<script lang="ts" setup>
import lCharts from '@/uni_modules/lime-echart_1.0.0/components/l-echart/l-echart.vue'

// // 1. 全量引入(主包过大)
// import * as echarts from "echarts";

import { onShow } from '@dcloudio/uni-app'
import { ScatterChart } from 'echarts/charts'
// 组件
import { GridComponent, TooltipComponent } from 'echarts/components'
// 2. 按需引入
import * as echarts from 'echarts/core'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'

// 引入 Canvas 渲染器，注意引入 CanvasRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'
import { debounce } from 'lodash'
import { getCurrentInstance, nextTick, onMounted, ref, watchEffect } from 'vue'

const { proxy } = getCurrentInstance() as { proxy: any }

const props = defineProps<{
  consumptionRecord: ConsumptionRecord[]
}>()

defineExpose({
  initCharts,
  disposeCharts
})

echarts.use([
  ScatterChart,
  TooltipComponent,
  GridComponent,
  // LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

// watchEffect(() => {
//   drawCharts(props.consumptionRecord)
// })

const chartRef = ref()

const drawCharts = debounce((source: ConsumptionRecord[]) => {
  chartRef.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: ({value}: Record<string, any>) => {
        return `${value[0].slice(5, 16)}\n${value[4]}：${value[2]}元\n${value[3]}`
      }
    },
    grid: {
      left: '20%',
    },
    yAxis: {
      axisLabel: {
        formatter: (value: string) => proxy.$day().startOf('day').add(value, 'second').format('HH:mm')
      },
      splitLine: {
        lineStyle: {
          width: 0.5
        }
      }
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        formatter: (value: string) => value.slice(5, 10)
      }
    },
    series: {
      type: 'scatter',
      data: source.map(item => [
        item.consumptionTime,
        proxy.$day(item.consumptionTime).diff(proxy.$day(item.consumptionTime).startOf('day'), 'second'),
        item.consumptionAmount,
        item.consumptionRemark,
        item.consumptionType,
      ]),
    },
  })
})
function initCharts() {
  chartRef.value.init(echarts).then(() => {
    drawCharts(props.consumptionRecord)
  })
}

function disposeCharts () {
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
  <l-charts ref="chartRef" is-disable-scroll />
</template>
