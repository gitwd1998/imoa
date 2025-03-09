<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '工时日期',
    }
  }
</route>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs'
import { selectWorkingHours } from '@/apis'
import TimesheetOverView from '@/components/TimesheetOverView.vue'
import { onShow } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance() as { proxy: any }
const selectedDate = ref<WorkingHoursItem[]>([])
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref<Dayjs>(proxy.$day())
const startDay = computed<Dayjs>(() => currentDate.value.startOf('month'))
const endDay = computed<Dayjs>(() => currentDate.value.endOf('month'))
interface MonthData {
  day: Dayjs
  currentMonth: -1 | 0 | 1
  currentDate: boolean
  selected: WorkingHoursItem | undefined | null
}
const monthData = computed(() => {
  const dateList: MonthData[] = []
  let tempDay = startDay.value
  while (tempDay.isSameOrBefore(endDay.value, 'day')) {
    dateList.push({
      day: tempDay,
      currentMonth: 0,
      currentDate: proxy.$day().isSame(tempDay, 'day'),
      selected: selectedDate.value.find(row => tempDay.isSame(row.workingDate, 'day')),
    })
    tempDay = tempDay.add(1, 'day')
  }
  // 上个月补充
  const start = dateList[0].day.day()
  for (let index = 1; index <= start; index++) {
    const day = startDay.value.subtract(index, 'day')
    dateList.unshift({
      day,
      currentMonth: -1,
      currentDate: proxy.$day().isSame(day, 'day'),
      selected: null,
    })
  }
  // 下个月补充
  const nextMonth = 42 - dateList.length
  for (let index = 1; index <= nextMonth; index++) {
    const day = endDay.value.add(index, 'day')
    dateList.push({
      day,
      currentMonth: 1,
      currentDate: proxy.$day().isSame(day, 'day'),
      selected: null,
    })
  }
  return dateList
})
function changeDate(day: Dayjs): void {
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
onShow(() => {
  queryTimeSheet()
})
</script>

<template>
  <view class="flex h-90vh flex-col">
    <view class="flex flex-row items-center p-4px">
      <wd-button type="icon" icon="a-chevron-leftdouble" @click="changeDate(currentDate.subtract(1, 'year'))" />
      <wd-button type="icon" icon="chevron-left" @click="changeDate(currentDate.subtract(1, 'month'))" />
      <view class="flex-1 text-center">
        {{ currentDate.format('YYYY年M月') }} · {{ currentDate.format('LYLZ年LM') }}
      </view>
      <wd-button type="icon" icon="chevron-right" @click="changeDate(currentDate.add(1, 'month'))" />
      <wd-button type="icon" icon="a-chevron-rightdouble" @click="changeDate(currentDate.add(1, 'year'))" />
    </view>
    <view class="flex flex-row gap-1px items-center shadow-xl text-center">
      <view v-for="week in weekDays" :key="week" class="flex-1 p-4px">
        {{ week }}
      </view>
    </view>
    <view class="flex-1 grid grid-cols-7 grid-rows-6 of-hidden">
      <view v-for="(item, index) in monthData" :key="index" class="px-1px pt-8px">
        <view v-if="!item.currentMonth" class="size-full flex flex-col items-center">
          <view class="text-18px font-bold line-height-20px" :class="{ 'c-error': item.currentDate }">
            {{ item.day.format('D') }}
          </view>
          <view class="text-8px" :class="item.currentDate ? 'c-error' : 'c-info'">
            {{ item.day.format('LD') }}
          </view>
          <view v-if="item.selected" class="bg-primary text-12px rd-8px w-full c-light my-1px text-center">
            {{ item.selected?.workingHours }}H
          </view>
        </view>
      </view>
    </view>
  </view>
  <wd-floating-panel
    custom-class="b b-info b-solid"
    :content-draggable="false"
    :anchors="[80, 400]"
    :safe-area-inset-bottom="true"
  >
    <view class="flex flex-col size-full">
      <view class="text-center text-20px">
        总计 {{ selectedDate.reduce((total, attr) => total + +attr.workingHours, 0) }} 小时
      </view>
      <view class="flex-1">
        <timesheet-over-view :time-sheet="selectedDate" />
      </view>
    </view>
  </wd-floating-panel>
</template>
