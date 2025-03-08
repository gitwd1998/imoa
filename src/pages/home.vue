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
    name: '工时日历',
    icon: 'calendar',
    path: '/pages/timesheet',
  },
])
</script>

<template>
  <wd-cell-group :border="true">
    <wd-cell v-for="(app, index) in appList" :key="index" :title="app.name" :icon="app.icon" is-link :to="app.path" />
  </wd-cell-group>
</template>
