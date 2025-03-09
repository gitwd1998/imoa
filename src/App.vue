<script setup lang="ts">
import { jscode2session } from '@/apis'
import { onError, onHide, onLaunch, onPageNotFound, onShow, onThemeChange, onUnhandledRejection } from '@dcloudio/uni-app'

onLaunch(async () => {
  uni.showLoading({ mask: true })
  uni.login().then(({ code }) => {
    jscode2session({ code }).then((res) => {
      uni.setStorageSync('Authorization', res.data?.openid)
      uni.hideLoading()
    })
  }).catch((err) => {
    console.error(err)
    uni.hideLoading()
    uni.showToast({
      icon: 'none',
      mask: true,
      title: err.errMsg,
    })
  })
})
onShow(() => {})
onHide(() => {})
onError(() => {})
onPageNotFound(() => {})
onUnhandledRejection(() => {})
onThemeChange(() => {})
</script>

<style></style>
