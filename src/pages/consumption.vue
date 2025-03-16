<route lang="json5" type="page">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '消费记录',
    }
  }
</route>

<script lang="ts" setup>
import { consumptionRecordBatchSave, consumptionRecordDelete, consumptionRecordDetail, consumptionTypeDelete, consumptionTypeSave, consumptionTypeSelect } from '@/apis'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { cloneDeep } from 'lodash'
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useMessage } from 'wot-design-uni'

const { proxy } = getCurrentInstance() as { proxy: any }
const confirmMessageBox = useMessage()
const addFormRef = ref()
const consumptionRecordId = ref('')
const consumptionDate = ref('')
const consumptionTime = ref([])
const currentIndex = ref(0)
const visibleTypeSheet = ref(false)
const consumptionTypeOptions = ref<ConsumptionType[]>()
const addFormData = ref<ConsumptionRecord<Array<string>>>({
  id: '',
  consumptionTime: [],
  consumptionAmount: '',
  consumptionType: '',
  consumptionRemark: '',
})
const addFormDatas = reactive<ConsumptionRecord<Array<string>>[]>([])

const consumptionTimeOptions = computed(() => {
  const hours = []
  for (let hour = 0; hour < 24; hour++) {
    hours.push(hour < 10 ? `0${hour}` : hour)
  }
  const minutes = []
  for (let minute = 0; minute < 60; minute++) {
    minutes.push(minute < 10 ? `0${minute}` : minute)
  }
  const seconds = []
  for (let second = 0; second < 60; second++) {
    seconds.push(second < 10 ? `0${second}` : second)
  }
  return [hours, minutes, seconds]
})
function inputConsumptionAmount(row: ConsumptionRecord<Array<string>>, value: string) {
  // 去除非数值字符
  let formatNumber = value.replace(/[^\d.]/g, '')
  // 去除前导0 可以输入0
  // formatNumber = formatNumber.replace(/^0+(\d)/, '$1')
  // 去除前导0 不可以输入0
  formatNumber = formatNumber.replace(/^0+/, '')
  // 去除前导小数点
  formatNumber = formatNumber.replace(/^\./, '')
  // 去除多余小数点
  formatNumber = formatNumber.replace(/(?<=\..*)\./g, '')
  row.consumptionAmount = formatNumber
  return formatNumber
}
function blurConsumptionAmount(row: ConsumptionRecord<Array<string>>, value: string) {
  // 保留两位小数
  row.consumptionAmount = (+inputConsumptionAmount(row, value)).toFixed(2)
}
function submitConsumptionRecord() {
  addFormRef.value?.validate().then(({ valid }: any) => {
    if (valid) {
      uni.showLoading({ mask: true })
      const params: ConsumptionRecord[] = addFormDatas.map(item => ({
        ...item,
        consumptionTime: `${consumptionDate.value} ${item.consumptionTime?.join(':')}`,
      }))
      consumptionRecordBatchSave(params).then(() => {
        uni.hideLoading()
        uni.showToast({
          title: '提交成功',
          icon: 'success',
          mask: true,
          success: () => {
            setTimeout(() => {
              uni.navigateBack({
                delta: 1,
              })
            }, 1500)
          },
        })
      })
    }
  })
}
function queryConsumptionRecordDetail() {
  uni.showLoading({ mask: true })
  consumptionRecordDetail({ id: consumptionRecordId.value }).then((res) => {
    uni.hideLoading()
    const [date, time] = res.data?.consumptionTime?.split(' ') || []
    const tempDate: ConsumptionRecord<Array<string>> = {
      ...res.data,
      consumptionTime: time?.split(':') || [],
    }
    consumptionDate.value = date
    addFormDatas.push(tempDate)
  })
}
function addConsumptionRecord() {
  addFormDatas.push(cloneDeep(addFormData.value))
}
function deleteConsumptionRecord(row: ConsumptionRecord<Array<string>>, index: number) {
  if (!row.id)
    return addFormDatas.splice(index, 1)
  confirmMessageBox.confirm({
    title: `确定要删除${consumptionDate.value} ${row.consumptionTime?.join(':')}的消费记录吗？`,
  }).then(() => {
    uni.showLoading({ mask: true })
    consumptionRecordDelete({ id: row.id }).then(() => {
      uni.hideLoading()
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        mask: true,
        success: () => {
          setTimeout(() => {
            addFormDatas.splice(index, 1)
          }, 1500)
        },
      })
    })
  }).catch(() => {
    // empty
  })
}
function selectConsumptionType() {
  uni.showLoading({ mask: true })
  consumptionTypeSelect().then((res) => {
    uni.hideLoading()
    consumptionTypeOptions.value = res.data || []
  })
}
function addConsumptionType({ value }: Record<string, string>) {
  if (!/^\S{1,8}$/.test(value)) {
    return uni.showToast({
      title: '请输入1~8位非空格字符',
      icon: 'none',
      mask: true,
    })
  }
  uni.showLoading({ mask: true })
  const params: ConsumptionType = {
    id: '',
    consumptionType: value,
  }
  consumptionTypeSave(params).then(() => {
    uni.hideLoading()
    uni.showToast({
      title: '添加成功',
      icon: 'success',
      mask: true,
      success: () => {
        setTimeout(() => {
          selectConsumptionType()
        }, 1500)
      },
    })
  })
}
function deleteConsumptionType (consumptionType: ConsumptionType) {
  confirmMessageBox.confirm({
    title: `确定要删除${consumptionType.consumptionType}消费类型吗？`,
  }).then(() => {
    uni.showLoading({ mask: true })
    consumptionTypeDelete({ id: consumptionType.id }).then(() => {
      uni.hideLoading()
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        mask: true,
        success: () => {
          setTimeout(() => {
            selectConsumptionType()
          }, 1500)
        },
      })
    })
  }).catch(() => {
    // empty
  })
}
function clickConsumptionType(item: ConsumptionType) {
visibleTypeSheet.value = false
  addFormDatas[currentIndex.value].consumptionType = item.consumptionType
}
onLoad((options: any) => {
  consumptionRecordId.value = options.id
  consumptionDate.value = options.date ? options.date : proxy.$day().format('YYYY-MM-DD')
  consumptionTime.value = options.time ? options.time.split(':') : proxy.$day().format('HH:mm:ss').split(':')
  addFormData.value.consumptionTime = consumptionTime.value
  uni.setNavigationBarTitle({
    title: `${proxy.$day(consumptionDate.value).format('YYYY年M月D日')}消费记录`,
  })
  selectConsumptionType()
  if (consumptionRecordId.value) {
    queryConsumptionRecordDetail()
  }
  else {
    addFormDatas.push(cloneDeep(addFormData.value))
  }
})
</script>

<template>
  <view>
    <wd-form ref="addFormRef" :model="addFormDatas">
      <wd-cell-group
        v-for="(row, index) in addFormDatas"
        :key="index"
        :border="true"
        :title="`消费记录 ${consumptionDate} ${row.consumptionTime?.join(':')}`"
      >
        <template v-if="addFormDatas.length > 1" #value>
          <wd-icon name="delete" custom-class="c-error" @click="deleteConsumptionRecord(row, index)" />
        </template>
        <wd-picker-view v-model="row.consumptionTime" :columns="consumptionTimeOptions" :columns-height="100" />
        <wd-input
          v-model="row.consumptionAmount"
          :rules="[
            { required: true, message: '请输入消费金额' },
            { required: true, pattern: /^(0|[1-9]\d*)\.\d{2}$/, message: '请输入有效金额并保留两位小数' },
          ]"
          label="消费金额"
          :prop="`${index}.consumptionAmount`"
          placeholder="请输入"
          clearable
          :maxlength="10"
          size="large"
          @input="({ value }) => inputConsumptionAmount(row, value)"
          @blur="({ value }) => blurConsumptionAmount(row, value)"
        />
        <wd-input
          v-model.trim="row.consumptionType"
          :rules="[
            { required: true, message: '请选择消费类型' },
          ]"
          label="消费类型"
          :prop="`${index}.consumptionType`"
          placeholder="请选择"
          clearable
          readonly
          size="large"
          suffix-icon="arrow-down"
          @click="visibleTypeSheet = true; currentIndex = index"
        />
        <wd-input
          v-model="row.consumptionRemark"
          :rules="[
            { required: true, message: '请输入消费备注' },
          ]"
          label="消费备注"
          :prop="`${index}.consumptionRemark`"
          placeholder="请输入"
          clearable
          :maxlength="500"
          size="large"
        />
      </wd-cell-group>
    </wd-form>
    <view class="m-20px">
      <wd-button custom-class="w-full" plain hairline size="large" @click="addConsumptionRecord">
        添加
      </wd-button>
      <wd-button custom-class="w-full" size="large" @click="submitConsumptionRecord">
        提交
      </wd-button>
    </view>
  </view>
  <wd-message-box />
  <wd-action-sheet v-model="visibleTypeSheet" title="请选择消费类型">
    <view class="flex flex-wrap p-20px gap-10px">
      <wd-tag 
      v-for="item in consumptionTypeOptions"
      :key="item.id"
      closable
      round
      @close="deleteConsumptionType(item)"
      @click="clickConsumptionType(item)"
      >
        {{ item.consumptionType }}
      </wd-tag>
      <wd-tag round dynamic type="primary" @confirm="addConsumptionType" />
    </view>
  </wd-action-sheet>
</template>
