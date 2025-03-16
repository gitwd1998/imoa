<script lang="ts" setup>
import type { Dayjs } from 'dayjs'
import { computed, getCurrentInstance, ref } from 'vue'

const props = defineProps<{
  formatter?: (data: MonthData[]) => MonthData[]
  modelValue: Dayjs
  hiddenHeader?: boolean
  customClass?: string
}>()
const emits = defineEmits<{
  (e: 'change', day: Dayjs): void
  (e: 'select', date: MonthData): void
  (e: 'update:modelValue', day: Dayjs): void
}>()
const { proxy } = getCurrentInstance() as { proxy: any }
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const startDay = computed<Dayjs>(() => props.modelValue.startOf('month'))
const endDay = computed<Dayjs>(() => props.modelValue.endOf('month'))
export interface MonthData {
  day: Dayjs
  isCurrentMonth: boolean
  isPrveMonth: boolean
  isNextMonth: boolean
  currentDate: boolean
  [key: string]: any
}
const monthData = computed(() => {
  const dateList: MonthData[] = []
  // 本月日期
  let tempDay = startDay.value
  while (tempDay.isSameOrBefore(endDay.value, 'day')) {
    dateList.push({
      day: tempDay,
      isCurrentMonth: true,
      isPrveMonth: false,
      isNextMonth: false,
      currentDate: proxy.$day().isSame(tempDay, 'day'),
    })
    tempDay = tempDay.add(1, 'day')
  }
  // 上个月补充
  const start = dateList[0].day.day()
  for (let index = 1; index <= start; index++) {
    const day = startDay.value.subtract(index, 'day')
    dateList.unshift({
      day,
      isCurrentMonth: false,
      isPrveMonth: true,
      isNextMonth: false,
      currentDate: proxy.$day().isSame(day, 'day'),
    })
  }
  // 下个月补充
  const nextMonth = 42 - dateList.length
  for (let index = 1; index <= nextMonth; index++) {
    const day = endDay.value.add(index, 'day')
    dateList.push({
      day,
      isCurrentMonth: false,
      isPrveMonth: false,
      isNextMonth: true,
      currentDate: proxy.$day().isSame(day, 'day'),
    })
  }
  return props.formatter ? props.formatter(dateList) : dateList
})
function onChange(day: Dayjs): void {
  emits('update:modelValue', day)
  emits('change', day)
}
defineExpose({
  onChange,
})
</script>

<template>
  <view class="flex flex-col" :class="customClass">
    <view v-if="!hiddenHeader" class="flex flex-row items-center p-4px">
      <wd-button type="icon" icon="a-chevron-leftdouble" @click="onChange(modelValue.subtract(1, 'year'))" />
      <wd-button type="icon" icon="chevron-left" @click="onChange(modelValue.subtract(1, 'month'))" />
      <view class="flex-1 text-center">
        {{ modelValue.format('YYYY年M月') }} · {{ modelValue.format('LYLZ年LM') }}
      </view>
      <wd-button type="icon" icon="chevron-right" @click="onChange(modelValue.add(1, 'month'))" />
      <wd-button type="icon" icon="a-chevron-rightdouble" @click="onChange(modelValue.add(1, 'year'))" />
    </view>
    <view class="flex flex-row gap-1px items-center shadow-xl text-center">
      <view v-for="week in weekDays" :key="week" class="flex-1 p-4px">
        {{ week }}
      </view>
    </view>
    <view class="flex-1 grid grid-cols-7 grid-rows-6 of-hidden">
      <view v-for="(date, index) in monthData" :key="index" class="px-1px pt-8px">
        <view v-if="date.isCurrentMonth" class="size-full flex flex-col items-center" @click="emits('select', date)">
          <view class="text-18px font-bold line-height-20px" :class="{ 'c-error': date.currentDate }">
            {{ date.day.format('D') }}
          </view>
          <view class="text-8px" :class="date.currentDate ? 'c-error' : 'c-info'">
            {{ date.day.format('LD') }}
          </view>
          <view class="flex-1 of-auto w-full">
            <slot name="date" :date="date" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
