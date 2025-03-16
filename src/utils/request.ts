import { un } from '@uni-helper/uni-network'

const request = un.create({
  baseUrl: 'http://1.94.178.106/wx',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  custom: {
    toast: true, // 默认对接口返回的错误进行toast提示，如果不想提示，请在response中自定义toast为false
    catch: true, // 默认对接口返回的错误进入reject，如果不想进入reject，请在response中自定义catch为false
  },
})

request.interceptors.request.use(
  (request) => {
    const pages = getCurrentPages()
    const currentUrl = pages[pages.length - 1]?.route || 'pages/home'
    const Authorization = uni.getStorageSync('Authorization')
    // if (!Authorization) uni.redirectTo({
    //   url: '/oauth/login?redirectUrl=' + encodeURIComponent(currentUrl)
    // })
    // console.log('request', request)
    request.headers['Current-Url'] = currentUrl
    request.headers.Authorization = Authorization
    return Promise.resolve(request)
  },
  (error) => {
  // 对请求错误做些什么
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    uni.hideLoading()
    const data: any = response.data || {}
    const { custom, adapter } = response.config || {}
        
    let succeeded = false
    switch (adapter) {
      case 'download':
        succeeded = true
        break;
      case 'upload':
        succeeded = true
        break;
      case 'request':
        succeeded = data.size || data.code === 200 || data.code === '000000' || data.errno === 0
        break;
      default:
        break;
    }
    if (succeeded) {
      // 成功
      return Promise.resolve(data)
    } else {
      // 如果没有显式定义custom的toast参数为false的话，默认对报错进行toast弹出提示
      if (custom.toast !== false) {
        uni.showToast({
          icon: 'error',
          mask: true,
          title: data.message || data.errmsg || '系统异常，请稍后重试！',
        })
      }
      // 如果没有显式定义custom的catch参数为false的话，进入reject
      if (custom.catch !== false) {
        return Promise.reject(data)
      }
      else {
        // 否则返回一个pending中的promise，请求不会进入catch中
        return new Promise(() => { })
      }
    }
  },
  (error) => {
    uni.showToast({
      icon: 'error',
      mask: true,
      title: `${error.statusCode}: ${error.errMsg}` || '系统异常，请稍后重试！',
    })
    return Promise.reject(error)
  },
)

export default request
