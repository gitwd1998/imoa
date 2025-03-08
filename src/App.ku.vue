<script setup lang="ts">
import type { Ref } from 'vue'
import type { ConfigProviderTheme } from 'wot-design-uni/components/wd-config-provider/types'
import { ref } from 'vue'

const theme = ref(uni.getSystemInfoSync().hostTheme || 'light') as Ref<ConfigProviderTheme>

uni.onThemeChange((res) => {
  theme.value = res.theme
})
</script>

<template>
  <WdConfigProvider :theme="theme">
    <KuRootView />
  </WdConfigProvider>
</template>

<style lang="scss">
</style>
