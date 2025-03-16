<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '消费记录',
    }
  }
</route>

<script lang="ts" setup>
import type { MonthData } from '@/components/CalendarView.vue'
import type { Dayjs } from 'dayjs'
import { consumptionRecordDelete, consumptionRecordExport, consumptionRecordSelect, consumptionTypeSelect } from '@/apis'
import { onShow } from '@dcloudio/uni-app'
import { groupBy, mapValues, sumBy } from 'lodash'
import { computed, getCurrentInstance, ref } from 'vue'
import { useMessage } from 'wot-design-uni'

const { proxy } = getCurrentInstance() as { proxy: any }
const calendarViewRef = ref()
const confirmMessageBox = useMessage()
const detailMessageBox = useMessage('detail-message-box')
const activedTab = ref('列表视图')
const segmentedOptions = ref(['列表视图', '日历视图'])
const consumptionTypeFilter = ref('全部类型')
const visibleTypeSheet = ref(false)
const consumptionTypeOptions = ref<string[]>([])
const visibleTimeViewSheet = ref(false)
const consumptionTimeViewRef = ref()
const visibleTypeViewSheet = ref(false)
const consumptionTypeViewRef = ref()
const consumptionRecord = ref<ConsumptionRecord[]>([])
const dailyConsumptionRecord = ref<ConsumptionRecord[]>([])
const calendarDay = ref<Dayjs>(proxy.$day())

const filteredConsumptionRecord = computed(() => {
  const consumptionRecordReverse = consumptionRecord.value.filter((item) => {
    return consumptionTypeFilter.value === '全部类型' ? true : item.consumptionType === consumptionTypeFilter.value
  })
  consumptionRecordReverse.reverse()
  return consumptionRecordReverse
})
const groupedConsumptionRecord = computed(() => Object.values(mapValues(groupBy(filteredConsumptionRecord.value, (row) => {  
  return proxy.$day(row.consumptionTime).format('YYYY-MM-DD')
}), (group, key) => ({
  date: key,
  data: group,
}))))
function onChange(day: Dayjs): void {
  calendarDay.value = day
  selectConsumptionRecord()
}
function onFormatter(data: MonthData[]) {
  return data.map(item => ({
    ...item,
    dailyConsumptionRecord: consumptionRecord.value.filter(row => item.day.isSame(row.consumptionTime, 'day')),
  }))
}
function selectConsumptionType() {
  uni.showLoading({ mask: true })
  consumptionTypeSelect().then((res) => {
    uni.hideLoading()
    consumptionTypeOptions.value = (res.data || []).map(item => item.consumptionType)
    consumptionTypeOptions.value.unshift('全部类型')
  })
}
function selectConsumptionRecord() {
  uni.setNavigationBarTitle({
    title: `${calendarDay.value.format('YYYY年M月')}消费记录`,
  })
  uni.showLoading({ mask: true })
  consumptionRecordSelect({
    startDate: calendarDay.value.startOf('month').format('YYYY-MM-DD 00:00:00'),
    endDate: calendarDay.value.endOf('month').format('YYYY-MM-DD 23:59:59'),
  }).then((res) => {
    uni.hideLoading()
    consumptionRecord.value = res.data || []
  })
}
function openDetailMessageBox(item: MonthData) {
  dailyConsumptionRecord.value = item.dailyConsumptionRecord
  detailMessageBox.confirm({
    title: `${item.day.format('YYYY年M月D日')}消费记录`,
    confirmButtonText: '记一笔',
  }).then(() => {
    toConsumption(item.day)
  }).catch(() => {
    // empty
  })
}
function deleteConsumptionRecord(record: ConsumptionRecord) {
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
            selectConsumptionRecord()
          }, 1500)
        },
      })
    })
  }).catch(() => {
    // empty
  })
}
function updateConsumptionRecord(record: ConsumptionRecord) {
  detailMessageBox.close()
  uni.navigateTo({
    url: `/pages/consumption?id=${record.id}`,
  })
}
function exportConsumptionRecord() {
  uni.showLoading({ mask: true })
  const params = {
    startDate: calendarDay.value.startOf('month').format('YYYY-MM-DD 00:00:00'),
    endDate: calendarDay.value.endOf('month').format('YYYY-MM-DD 23:59:59'),
  }
  consumptionRecordExport(params).then((res) => {
    uni.hideLoading()
    uni.openDocument({
      filePath: res.tempFilePath,
      showMenu: true,
    }).catch((err) => {
      console.error(err)
      uni.showToast({
        title: '打开失败',
        icon: 'error',
        mask: true,
      })
    })
  })
}
function importConsumptionRecord() {
  uni.chooseMessageFile({
    type: 'file',
    extension: ['xlsx'],
    count: 1,
  }).then((res) => {
    console.log(res)
  })
  //     success: (res) => {
  //       console.log(res);
  // //       const filePath = res.tempFiles[0].path;
  // //       // 上传文件到服务器
  // //       uni.uploadFile({
  // //         url: 'http://1.94.178.106/wx/consumptionRecord/import', // 替换为你的上传接口URL
  // //         filePath: filePath,
  // //         name: 'file', // 文件对应的字段名，要和后端接收的参数名一致
  // //         formData: {
  // //           'user': 'test' // 其他需要传递的数据
  // //         },
  // //         header: {
  // //           'Authorization': uni.getStorageSync('Authorization'),
  // //         },
  // //         success: (uploadRes) => {
  // //           if (uploadRes.statusCode === 200) {
  // //             console.log('文件上传成功');
  // //             uni.showToast({
  // //               title: '导入成功',
  // //               icon: 'success',
  // //               mask: true,
  // //             });
  // //           } else {
  // //             console.error('文件上传失败：', uploadRes
  // // }
  // //             );
  // //             uni.showToast({
  // //               title: '导入失败',
  // //               icon: 'error',
  // //               mask: true,
  // //             });
  // //           }
  // //         },
  // //         fail: (err) => {
  // //           console.error('文件上传失败：', err);
  // //         },
  // //       });
  //     },
}
function toConsumption(day: Dayjs) {  
  uni.navigateTo({
    url: `/pages/consumption?date=${day.format('YYYY-MM-DD')}&time=${proxy.$day().format('HH:mm:ss')}`,
  })
}
function levelColor(record: ConsumptionRecord) {
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
  selectConsumptionType()
  selectConsumptionRecord()
})
</script>

<template>
  <view class="flex h-100vh flex-col">
    <view class="flex flex-row items-center p-4px gap-4px">
      <wd-button type="icon" icon="a-chevron-leftdouble" @click="onChange(calendarDay.subtract(1, 'year'))" />
      <wd-button type="icon" icon="chevron-left" @click="onChange(calendarDay.subtract(1, 'month'))" />
      <wd-segmented v-model:value="activedTab" custom-class="flex-1" size="small" :options="segmentedOptions" />
      <wd-button type="icon" icon="chevron-right" @click="onChange(calendarDay.add(1, 'month'))" />
      <wd-button type="icon" icon="a-chevron-rightdouble" @click="onChange(calendarDay.add(1, 'year'))" />
    </view>
    <!-- 列表视图 -->
    <view v-if="activedTab === '列表视图'" class="flex flex-col flex-1 of-hidden">
      <view class="of-x-auto w-full">
        <view class="inline-flex p-10px items-center gap-4px whitespace-nowrap">
          <wd-button size="small" type="info" icon="app" @click="visibleTypeSheet = true">
            {{ consumptionTypeFilter }}
          </wd-button>
          <wd-button type="info" size="small" icon="chart-bubble" @click="visibleTimeViewSheet = true">
            共 {{ filteredConsumptionRecord.length }} 笔
          </wd-button>
          <wd-button type="info" size="small" icon="chart-pie" @click="visibleTypeViewSheet = true">
            共 {{ sumBy(filteredConsumptionRecord, (item) => +item.consumptionAmount).toFixed(2) }} 元
          </wd-button>
          <wd-button type="info" size="small" icon="add-circle1" @click="toConsumption(proxy.$day())">
            记一笔
          </wd-button>
          <wd-button type="info" size="small" icon="cloud-download" @click="exportConsumptionRecord">
            导出
          </wd-button>
          <wd-button type="info" size="small" icon="cloud-upload" @click="importConsumptionRecord">
            导入
          </wd-button>
        </view>
      </view>
      <view v-if="groupedConsumptionRecord.length" class="flex-1 h-full of-auto">
        <view v-for="group in groupedConsumptionRecord" :key="group.date" class="relative">
          <view class="flex items-center sticky top-0 bg-inherit p-10px bg z-10 text-14px">
            <text>{{ proxy.$day(group.date).format('M月D日') }}</text>
            <wd-divider vertical />
            <text>共 {{ group.data.length }} 笔</text>
            <wd-divider vertical />
            <text>总计 {{ sumBy(group.data, (item) => +item.consumptionAmount).toFixed(2) }} 元</text>
            <text class="flex-1"></text>
            <wd-button size="small" :plain="true" icon="add-circle1" @click="toConsumption(proxy.$day(group.date))">
              记一笔
            </wd-button>
          </view>
          <wd-swipe-action v-for="record in group.data" :key="record.id" custom-class="divider-b">
            <view class="px-15px py-10px">
              <view class="flex flex-row justify-between">
                <text class="text-14px">
                  {{ record.consumptionType }}
                </text>
                <text class="font-bold text-18px">
                  ¥ {{ record.consumptionAmount }}
                </text>
              </view>
              <view class="line-clamp-2 c-info text-14px">
                {{ record.consumptionTime.slice(10) }} {{ record.consumptionRemark }}
              </view>
            </view>
            <template #right>
              <view class="h-full flex c-white">
                <view class="flex items-center bg-warning px-24px" @click="updateConsumptionRecord(record)">
                  <text>修改</text>
                </view>
                <view class="flex items-center bg-error px-24px" @click="deleteConsumptionRecord(record)">
                  <text>删除</text>
                </view>
              </view>
            </template>
          </wd-swipe-action>
        </view>
      </view>
      <wd-status-tip v-else image="search" tip="暂无消费记录" />
    </view>
    <!-- 日历视图 -->
    <view v-else-if="activedTab === '日历视图'" class="flex-1 of-hidden">
      <calendar-view ref="calendarViewRef" v-model="calendarDay" custom-class="h-full" :hidden-header="true" :formatter="onFormatter" @select="openDetailMessageBox">
        <template #date="{ date }">
          <view v-for="record in date.dailyConsumptionRecord" :key="record.id" class="line-clamp-1 box-border text-10px w-full my-1px px-4px" :class="levelColor(record)">
            {{ record.consumptionRemark }}
          </view>
        </template>
      </calendar-view>
    </view>    
  </view>
  <wd-message-box />
  <wd-message-box selector="detail-message-box">
    <template v-if="dailyConsumptionRecord.length">
      <wd-swipe-action v-for="record in dailyConsumptionRecord" :key="record.id" custom-class="divider-b">
        <view class="px-15px py-10px">
          <view class="flex flex-row justify-between">
            <text>{{ record.consumptionType }}</text>
            <text>¥ {{ record.consumptionAmount }}</text>
          </view>
          <view class="line-clamp-1 text-14px text-left c-info">
            {{ record.consumptionTime.slice(10) }} {{ record.consumptionRemark }}
          </view>
        </view>
        <template #right>
          <view class="h-full flex c-white">
            <view class="flex items-center bg-warning px-24px" @click="updateConsumptionRecord(record)">
              <text>修改</text>
            </view>
            <view class="flex items-center bg-error px-24px" @click="deleteConsumptionRecord(record)">
              <text>删除</text>
            </view>
          </view>
        </template>
      </wd-swipe-action>
    </template>
    <wd-status-tip v-else image="search" tip="暂无消费记录" />
  </wd-message-box>
  <wd-action-sheet v-model="visibleTypeSheet" title="请选择类型">
    <wd-radio-group v-model="consumptionTypeFilter" shape="button" custom-class="flex flex-wrap gap-10px p-20px" @change="visibleTypeSheet = false">
      <wd-radio v-for="item in consumptionTypeOptions" :key="item" custom-class="!m-0" :value="item">
        {{ item }}
      </wd-radio>
    </wd-radio-group>
  </wd-action-sheet>
  <wd-action-sheet
    v-model="visibleTimeViewSheet"
    title="消费时间分布情况"
    @opened="consumptionTimeViewRef.initCharts()"
    @closed="consumptionTimeViewRef.disposeCharts()"
  >
    <view class="h-300px">
      <consumption-time-view ref="consumptionTimeViewRef" :consumption-record="consumptionRecord" />
    </view>
  </wd-action-sheet>
  <wd-action-sheet
    v-model="visibleTypeViewSheet"
    title="消费类型分布情况"
    @opened="consumptionTypeViewRef.initCharts()"
    @closed="consumptionTypeViewRef.disposeCharts()"
  >
    <view class="h-300px">
      <consumption-type-view ref="consumptionTypeViewRef" :consumption-record="consumptionRecord" />
    </view>
  </wd-action-sheet>
</template>
