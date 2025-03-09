<route lang="json5" type="page">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '消费记录',
    }
  }
</route>

<script lang="ts" setup>
import type { FormRules } from 'wot-design-uni/components/wd-form/types'
import { consumptionRecordSave } from '@/apis'
import { onLoad } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance() as { proxy: any }
const addFormRef = ref()
const consumptionDate = ref(null)
const consumptionTime = ref([])
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
const addFormData = ref<ConsumptionRecordItem>({
  id: null,
  userId: uni.getStorageSync('Authorization'),
  consumptionTime: null,
  consumptionAmount: null,
  consumptionType: null,
  consumptionRemark: null,
})
const baseInfoRules = ref<FormRules>({
  consumptionAmount: [
    { required: true, message: '请输入消费金额' },
    { required: true, pattern: /^(0|[1-9]\d*)\.\d{2}$/, message: '请输入有效金额并保留两位小数' },
  ],
  consumptionType: [
    { required: true, message: '请输入消费类型' },
  ],
  consumptionRemark: [
    { required: true, message: '请输入消费备注' },
  ],
})
function inputConsumptionAmount({ value }) {
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
  addFormData.value.consumptionAmount = formatNumber
  return formatNumber
}
function blurConsumptionAmount({ value }) {
  // 保留两位小数
  addFormData.value.consumptionAmount = (+inputConsumptionAmount({ value })).toFixed(2)
}
function submitConsumption() {
  addFormRef.value?.validate().then(({ valid }) => {
    if (valid) {
      uni.showLoading({ mask: true })
      const params = {
        ...addFormData.value,
        consumptionTime: `${consumptionDate.value} ${consumptionTime.value?.join(':')}`,
      }
      consumptionRecordSave(params).then(() => {
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
onLoad((options: any) => {
  addFormData.value.id = options.id
  consumptionDate.value = options.date
  consumptionTime.value = options.time ? options.time.split(':') : proxy.$day().format('HH:mm:ss').split(':')
  uni.setNavigationBarTitle({
    title: `${proxy.$day(consumptionDate.value).format('YYYY年M月D日')}消费记录`,
  })
})
</script>

<template>
  <view>
    <wd-form ref="addFormRef" :model="addFormData" :rules="baseInfoRules">
      <wd-cell-group :border="true">
        <wd-cell :title="`消费时间：${consumptionDate} ${consumptionTime?.join(':')}`" size="large" :vertical="true">
          <wd-picker-view v-model="consumptionTime" :columns="consumptionTimeOptions" :columns-height="100" />
        </wd-cell>
        <wd-input
          v-model="addFormData.consumptionAmount"
          label="消费金额"
          prop="consumptionAmount"
          placeholder="请输入"
          clearable
          :maxlength="10"
          size="large"
          @input="inputConsumptionAmount"
          @blur="blurConsumptionAmount"
        />
        <wd-input
          v-model.trim="addFormData.consumptionType"
          label="消费类型"
          prop="consumptionType"
          placeholder="请输入"
          clearable
          size="large"
        />
        <wd-input
          v-model="addFormData.consumptionRemark"
          label="消费备注"
          prop="consumptionRemark"
          placeholder="请输入"
          clearable
          :maxlength="500"
          size="large"
        />
      </wd-cell-group>
    </wd-form>
    <view class="m-20px">
      <wd-button custom-class="w-full" size="large" @click="submitConsumption">
        提交
      </wd-button>
    </view>
  </view>
</template>
