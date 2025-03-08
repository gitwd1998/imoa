import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  entryPagePath: 'pages/home',
  pages: [],
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: '小帮手',
    navigationBarBackgroundColor: '@navigationBarBackgroundColor',
    backgroundColor: '@backgroundColor',
    navigationBarTextStyle: '@navigationBarTextStyle',
  },
  subPackages: [],
  tabBar: {
    color: '@color',
    selectedColor: '@selectedColor',
    backgroundColor: '@tabBackgroundColor',
    borderStyle: '@borderStyle',
    list: [
      {
        pagePath: 'pages/home',
        text: '首页',
        iconPath: '@homeIconPath',
        selectedIconPath: '@homeSelectedIconPath',
      },
      {
        pagePath: 'pages/mine',
        text: '我的',
        iconPath: '@mineIconPath',
        selectedIconPath: '@mineSelectedIconPath',
      },
    ],
  },
})
