<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '消费记录',
    }
  }
</route>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs'
import { consumptionRecordDelete, consumptionRecordSelect } from '@/apis'
import ConsumptionOverView from '@/components/ConsumptionOverView.vue'
import { onShow } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'
import { useMessage } from 'wot-design-uni'

const { proxy } = getCurrentInstance() as { proxy: any }
const confirmMessageBox = useMessage()
const detailMessageBox = useMessage('detail-message-box')
const consumptionRecord = ref<ConsumptionRecordItem[]>([])
const dailyConsumptionRecord = ref<ConsumptionRecordItem[]>([])
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref<Dayjs>(proxy.$day())
const startDay = computed<Dayjs>(() => currentDate.value.startOf('month'))
const endDay = computed<Dayjs>(() => currentDate.value.endOf('month'))
interface MonthData {
  day: Dayjs
  currentMonth: -1 | 0 | 1
  currentDate: boolean
  dailyConsumptionRecord: ConsumptionRecordItem[]
}
const monthData = computed(() => {
  const dateList: MonthData[] = []
  let tempDay = startDay.value
  while (tempDay.isSameOrBefore(endDay.value, 'day')) {
    dateList.push({
      day: tempDay,
      currentMonth: 0,
      currentDate: proxy.$day().isSame(tempDay, 'day'),
      dailyConsumptionRecord: consumptionRecord.value.filter(row => tempDay.isSame(row.consumptionTime, 'day')),
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
      dailyConsumptionRecord: [],
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
      dailyConsumptionRecord: [],
    })
  }
  return dateList
})
function changeDate(day: Dayjs): void {
  currentDate.value = day
  queryConsumptionRecord()
}
function queryConsumptionRecord() {
  uni.showLoading({ mask: true })
  consumptionRecordSelect({
    startDate: startDay.value.format('YYYY-MM-DD'),
    endDate: endDay.value.format('YYYY-MM-DD'),
  }).then((res) => {
    uni.hideLoading()
    consumptionRecord.value = res.data || []
  })
}
function openDetailMessageBox(item: MonthData) {
  dailyConsumptionRecord.value = item.dailyConsumptionRecord
  detailMessageBox.confirm({
    title: `${item.day.format('YYYY年M月D日')}消费记录`,
    confirmButtonText: '添加消费记录',
  }).then(() => {
    uni.navigateTo({
      url: `/pages/consumption?date=${item.day.format('YYYY-MM-DD')}`,
    })
  }).catch(() => {
    // empty
  })
}
function deleteConsumptionRecord(record: ConsumptionRecordItem) {
  detailMessageBox.close()
  confirmMessageBox.confirm({
    title: `确定要删除${record.consumptionTime}的消费记录吗？`,
  }).then(() => {
    uni.showLoading({ mask: true })
    consumptionRecordDelete({ id: record.id }).then(() => {
      uni.hideLoading()
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        mask: true,
        success: () => {
          setTimeout(() => {
            queryConsumptionRecord()
          }, 1500)
        },
      })
    })
  }).catch(() => {
    // empty
  })
}
function updateConsumptionRecord(record: ConsumptionRecordItem) {
  const [date, time] = record.consumptionTime?.split(' ') || []
  detailMessageBox.close()
  uni.navigateTo({
    url: `/pages/consumption?id=${record.id}&date=${date}&time=${time}`,
  })
}
function levelColor(record: ConsumptionRecordItem) {
  if (record.consumptionAmount <= 100) {
    return 'c-primary b-l-4px b-l-solid b-l-primary rd-4px of-hidden relative after:bg-primary after:content-[""] after:absolute after:inset-0 after:opacity-20'
  }
  else if (record.consumptionAmount <= 1000) {
    return 'c-warning b-l-4px b-l-solid b-l-warning rd-4px of-hidden relative after:bg-warning after:content-[""] after:absolute after:inset-0 after:opacity-20'
  }
  else {
    return 'c-error b-l-4px b-l-solid b-l-error rd-4px of-hidden relative after:bg-error after:content-[""] after:absolute after:inset-0 after:opacity-20'
  }
}
onShow(() => {
  queryConsumptionRecord()
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
    <view class="flex flex-row gap-1px items-center shadow-xl">
      <view v-for="week in weekDays" :key="week" class="flex-1 p-4px">
        {{ week }}
      </view>
    </view>
    <view class="flex-1 grid grid-cols-7 grid-rows-6 of-hidden">
      <view v-for="(item, index) in monthData" :key="index" class="px-1px pt-8px">
        <view v-if="!item.currentMonth" class="size-full flex flex-col items-center" @click="openDetailMessageBox(item)">
          <view class="text-18px font-bold line-height-20px" :class="{ 'c-error': item.currentDate }">
            {{ item.day.format('D') }}
          </view>
          <view class="text-8px" :class="item.currentDate ? 'c-error' : 'c-info'">
            {{ item.day.format('LD') }}
          </view>
          <view class="flex-1 of-auto">
            <view v-for="record in item.dailyConsumptionRecord" :key="record.id" class="line-clamp-1 box-border text-10px w-full my-1px px-4px" :class="levelColor(record)">
              {{ record.consumptionRemark }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <wd-message-box />
  <wd-message-box selector="detail-message-box">
    <wd-cell-group v-if="dailyConsumptionRecord.length" :border="true">
      <wd-swipe-action v-for="record in dailyConsumptionRecord" :key="record.id">
        <wd-cell :title="`${record.consumptionType}：${record.consumptionAmount} 元`" :label="`${record.consumptionTime} ${record.consumptionRemark}`" title-width="100%" custom-label-class="line-clamp-2 line-height-16px">
          <template #icon>
            <text class="size-10px rd-full mt-4px mr-4px" :class="record.consumptionAmount <= 100 ? 'bg-primary' : record.consumptionAmount <= 1000 ? 'bg-warning' : 'bg-error'" />
          </template>
        </wd-cell>
        <template #right>
          <view class="h-full flex c-white">
            <!-- <view class="flex items-center bg-warning px-24px" @click="updateConsumptionRecord(record)">
              <text>修改</text>
            </view> -->
            <view class="flex items-center bg-error px-24px" @click="deleteConsumptionRecord(record)">
              <text>删除</text>
            </view>
          </view>
        </template>
      </wd-swipe-action>
    </wd-cell-group>
    <wd-status-tip v-else image="search" tip="暂无消费记录" />
  </wd-message-box>
  <wd-floating-panel custom-class="b b-info b-solid" :content-draggable="false" :anchors="[80, 400]" safe-area-inset-bottom>
    <view class="flex flex-col size-full">
      <view class="text-center text-20px">
        总计 {{ consumptionRecord.reduce((total, attr) => total + +attr.consumptionAmount, 0) }} 元
      </view>
      <view class="flex-1">
        <consumption-over-view :consumption-record="consumptionRecord" />
      </view>
    </view>
  </wd-floating-panel>
</template>
