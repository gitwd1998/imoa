<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '工时记录',
    }
  }
</route>

<script lang="ts" setup>
import type { MonthData } from '@/components/CalendarView.vue'
import type { Dayjs } from 'dayjs'
import { selectWorkingHours } from '@/apis'
import { onShow } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'
import { useMessage } from 'wot-design-uni'

const detailMessageBox = useMessage('detail-message-box')

const { proxy } = getCurrentInstance() as { proxy: any }
const selectedDate = ref<WorkingHoursItem[]>([])
const calendarDay = ref<Dayjs>(proxy.$day())
const startDay = computed<Dayjs>(() => calendarDay.value.startOf('month'))
const endDay = computed<Dayjs>(() => calendarDay.value.endOf('month'))

function onSelect(date: MonthData) {
  detailMessageBox.confirm({
    title: '工时',
  }).then(() => {
    console.log(date)

    // empty
  }).catch(() => {
    // empty
  })
}
function queryTimeSheet() {
  uni.showLoading({ mask: true })
  selectWorkingHours({
    userId: 'oT3y66LIv1S2W61JMD78RZqrcxus',
    workingStartDate: startDay.value.format('YYYY-MM-DD 00:00:00'),
    workingEndDate: endDay.value.format('YYYY-MM-DD 23:59:59'),
  }).then((res) => {
    uni.hideLoading()
    selectedDate.value = (res.data || []).map(item => ({ ...item, workingDate: proxy.$day(item.workingDate).format('YYYY-MM-DD') }))
  })
}
function onFormatter(data: MonthData[]) {
  return data.map(item => ({
    ...item,
    selected: selectedDate.value.find(row => item.day.isSame(row.workingDate, 'day')),
  }))
}
onShow(() => {
  queryTimeSheet()
})
</script>

<template>
  <calendar-view v-model="calendarDay" custom-class="h-90vh" :formatter="onFormatter" @change="queryTimeSheet" @select="onSelect">
    <template #date="{ date }">
      <view v-if="date.selected" class="bg-primary text-12px rd-8px w-full c-light my-1px text-center">
        {{ date.selected?.workingHours }}H
      </view>
    </template>
  </calendar-view>
  <wd-message-box selector="detail-message-box" />
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
