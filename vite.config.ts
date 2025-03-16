import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import uni from '@dcloudio/vite-plugin-uni'
// @see https://github.com/uni-helper/vite-plugin-uni-components
import Components from '@uni-helper/vite-plugin-uni-components'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
// @see https://uni-helper.js.org/vite-plugin-uni-layouts
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
// @see https://github.com/uni-helper/vite-plugin-uni-manifest
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
// @see https://github.com/uni-helper/vite-plugin-uni-middleware
import UniMiddleware from '@uni-helper/vite-plugin-uni-middleware'
// @see https://uni-helper.js.org/vite-plugin-uni-pages
import UniPages from '@uni-helper/vite-plugin-uni-pages'
// @see https://github.com/uni-helper/vite-plugin-uni-platform
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'
// @see https://github.com/uni-helper/vite-plugin-uni-platform-modifier
import UniPlatformModifier from '@uni-helper/vite-plugin-uni-platform-modifier'
// @see https://github.com/uni-ku/root
import UniRoot from '@uni-ku/root'
import dayjs from 'dayjs'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import ViteRestart from 'vite-plugin-restart'

// eslint-disable-next-line node/prefer-global/process
const { UNI_PLATFORM, NODE_ENV } = process.env
console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // mp-weixin | h5 | app
console.log('NODE_ENV -> ', NODE_ENV) // development | production | test

// eslint-disable-next-line node/prefer-global/process
const env = loadEnv(NODE_ENV, path.resolve(process.cwd(), 'env'))
const {
  VITE_SERVER_BASEURL,
  VITE_DELETE_CONSOLE,
  VITE_SHOW_SOURCEMAP,
} = env
// console.log('环境变量 env -> ', env, process.env)

export default defineConfig(async () => {
  // @see https://unocss.dev/
  const UnoCSS = (await import('unocss/vite')).default

  return {
    server: {
    // host: '0.0.0.0',
      hmr: true,
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: {
        '/wx': {
          target: VITE_SERVER_BASEURL,
          changeOrigin: true,
          rewrite: path => path.replace('/wx', '/wx'),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      Components({
        dts: true,
        resolvers: [WotResolver()],
      }),
      UniPages(),
      UniLayouts(),
      UniManifest(),
      UniPlatform(),
      UniPlatformModifier(),
      UniMiddleware(),
      UniRoot(),
      uni(),
      UnoCSS(),
      ViteRestart({
        // 通过这个插件，在修改vite.config.js文件则不需要重新运行也生效配置
        restart: ['vite.config.js'],
      }),
      // h5环境增加 BUILD_TIME 和 BUILD_BRANCH
      UNI_PLATFORM === 'h5' && {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace('%BUILD_TIME%', dayjs().format('YYYY-MM-DD HH:mm:ss'))
        },
      },
      // 打包分析插件，h5 + 生产环境才弹出
      UNI_PLATFORM === 'h5' && NODE_ENV === 'production' && visualizer({
        filename: './node_modules/.cache/visualizer/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      target: 'es6',
      cssTarget: 'chrome61',
      // 方便非h5端调试
      sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      // 开发环境不用压缩
      minify: NODE_ENV === 'development' ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      exclude: [
        'vue-demi',
      ],
    },
  }
})
