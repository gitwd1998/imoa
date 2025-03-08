import type { App } from 'vue'
import dayjs from 'dayjs'
import toArray from 'dayjs/plugin/toArray'
import { PluginLunar } from "dayjs-plugin-lunar";


export default (app: App<Element>) => {
  dayjs.extend(PluginLunar)
  dayjs.extend(toArray)
  app.config.globalProperties.$day = dayjs
}
