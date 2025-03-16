<route lang="json5" type="home">
  {
    style: {
      navigationStyle: 'default',
      navigationBarTitleText: '小帮手',
    }
  }
</route>

<script lang="ts" setup>
import { ref } from 'vue'

const appList = ref([
  {
    name: '消费记录',
    icon: 'list',
    path: '/pages/bookkeeping',
  },
  {
    name: '工时记录',
    icon: 'calendar',
    path: '/pages/timesheet',
  },
])
</script>

<template>
  <wd-grid :clickable="true" :border="true">
    <wd-grid-item v-for="(app, index) in appList" :key="index" :text="app.name" :icon="app.icon" link-type="navigateTo" :url="app.path" />
  </wd-grid>
</template>
