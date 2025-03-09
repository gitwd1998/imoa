import type { App } from 'vue'
import dayjs from 'dayjs'
import { PluginLunar } from 'dayjs-plugin-lunar'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

export default (app: App<Element>) => {
  dayjs.extend(PluginLunar)
  dayjs.extend(isSameOrBefore)
  app.config.globalProperties.$day = dayjs
}
