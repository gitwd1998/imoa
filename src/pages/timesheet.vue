<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '工时',
    }
  }
</route>

<script lang="ts" setup>
import { selectWorkingHours } from '@/apis'
import OverView from '@/components/OverView.vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance() as { proxy: any }
const selectedDate = ref([])
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref(proxy.$day())
const startDay = computed(() => currentDate.value.startOf('month'))
const endDay = computed(() => currentDate.value.endOf('month'))
const monthData = computed(() => {
  const list = []
  let tempDay = startDay.value
  while (tempDay.isBefore(endDay.value)) {
    list.push({
      visible: true,
      day: tempDay,
      selected: selectedDate.value.find(row => tempDay.isSame(row.workingDate)),
    })
    tempDay = tempDay.add(1, 'day')
  }
  // 上个月补充
  const start = list[0].day.day()
  for (let i = 1; i <= start; i++) {
    list.unshift({
      visible: false,
      day: startDay.value.subtract(i, 'day'),
    })
  }
  // 下个月补充
  const end = list[list.length - 1].day.day()
  const nextMonth = 42 - list.length
  for (let i = 1; i <= nextMonth; i++) {
    list.push({
      visible: false,
      day: endDay.value.add(i, 'day'),
    })
  }
  return list
})
function changeDate(day) {
  currentDate.value = day
  queryTimeSheet()
}
function queryTimeSheet() {
  uni.showLoading({ mask: true })
  selectWorkingHours({
    userId: 'oT3y66LIv1S2W61JMD78RZqrcxus',
    workingStartDate: startDay.value.format('YYYY-MM-DD'),
    workingEndDate: endDay.value.format('YYYY-MM-DD'),
  }).then((res) => {
    uni.hideLoading()
    selectedDate.value = (res.data || []).map(item => ({ ...item, workingDate: proxy.$day(item.workingDate).format('YYYY-MM-DD') }))
  })
}
onLoad((options) => {})
onShow(() => {
  queryTimeSheet()
})
</script>

<template>
  <view class="flex text-center h-90vh flex-col">
    <view class="flex flex-row items-center p-4px">
      <wd-button type="icon" icon="a-chevron-leftdouble" @click="changeDate(currentDate.subtract(1, 'year'))" />
      <wd-button type="icon" icon="chevron-left" @click="changeDate(currentDate.subtract(1, 'month'))" />
      <view class="flex-1 text-center">
        {{ currentDate.format('YYYY年M月') }} · {{ currentDate.format('LYLZ年LM') }}
      </view>
      <wd-button type="icon" icon="chevron-right" @click="changeDate(currentDate.add(1, 'month'))" />
      <wd-button type="icon" icon="a-chevron-rightdouble" @click="changeDate(currentDate.add(1, 'year'))" />
    </view>
    <view class="flex flex-row gap-1px items-center shadow-xl">
      <view v-for="week in weekDays" :key="week" class="flex-1 p-4px">
        {{ week }}
      </view>
    </view>
    <view class="flex-1 grid grid-cols-7 grid-rows-6 text-center gap-2px">
      <view v-for="(item, index) in monthData" :key="index" class="flex flex-col items-center pt-8px">
        <block v-if="item.visible">
          <view class="text-18px font-bold line-height-20px">
            {{ item.day.format('D') }}
          </view>
          <view class="text-10px c-info">
            {{ item.day.format('LD') }}
          </view>
          <view v-if="item.selected" class="bg-primary text-12px rd-8px w-full c-light my-1px">
            {{ item.selected?.workingHours }}H
          </view>
        </block>
      </view>
    </view>
  </view>
  <wd-floating-panel custom-class="b b-info b-solid" :content-draggable="false" :anchors="[80, 400]">
    <view>
      <view class="text-center text-20px">
        总计 {{ selectedDate.reduce((total, attr) => total + +attr.workingHours, 0) }} 小时
      </view>
      <view>
        <over-view :time-sheet="selectedDate" />
      </view>
    </view>
  </wd-floating-panel>
</template>
