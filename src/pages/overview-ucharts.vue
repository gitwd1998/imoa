<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '工时概览',
    }
  }
</route>

<script lang="ts" setup>
import { selectWorkingHours } from '@/apis'
import { onLoad, onShow } from '@dcloudio/uni-app'
// import uCharts from '@qiun/ucharts'
import { computed, getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance() as { proxy: any }
const currentMonth = ref(null)
const startDay = computed(() => proxy.$day(currentMonth.value).startOf('month'))
const endDay = computed(() => proxy.$day(currentMonth.value).endOf('month'))
const canvasId = ref('visit-charts')
const uChartsInstance = ref({})
function tap(e) {
  uChartsInstance.value[e.target.id].touchLegend(e)
  uChartsInstance.value[e.target.id].showToolTip(e)
}
function queryTimeSheet() {
  uni.showLoading({ mask: true })
  selectWorkingHours({
    userId: 'oT3y66LIv1S2W61JMD78RZqrcxus',
    workingStartDate: startDay.value.format('YYYY-MM-DD'),
    workingEndDate: endDay.value.format('YYYY-MM-DD'),
  }).then((res) => {
    uni.hideLoading()
    drawCharts((res.data || []).sort((prev, next) => proxy.$day(prev.workingDate).diff(proxy.$day(next.workingDate))))
  })
}
function drawCharts(source) {
  // const id = 'visit-charts'
  // uChartsInstance.value[canvasId.value] = new uCharts({
  //   type: 'column',
  //   context: uni.createCanvasContext(canvasId.value),
  //   width: 400,
  //   height: 800,
  //   padding: [20, 20, 0, 30],
  //   rotate: true,
  //   dataLabel: false,
  //   animation: true,
  //   categories: source.map(item => proxy.$day(item.workingDate).format('YYYY-MM-DD')),
  //   series: [
  //     {
  //       name: '工时',
  //       data: source.map(item => +item.workingHours),
  //     },
  //   ],
  //   legend: {},
  //   xAxis: {
  //     gridType: 'dash',
  //     rotateLabel: true,
  //     rotateAngle: 30,
  //     marginTop: 10,
  //   },
  //   yAxis: {
  //     disableGrid: true,
  //   },
  //   extra: {
  //     column: {
  //       type: 'group',
  //       categoryGap: 10,
  //     },
  //   },
  // })
}
onLoad((options: any) => {
  currentMonth.value = options.month
})
onShow(() => {
  queryTimeSheet()
})
</script>

<template>
  <scroll-view class="h-100vh" :scroll-x="true" :scroll-y="true">
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="w-400px h-800px"
      @tap="tap"
    />
  </scroll-view>
</template>
