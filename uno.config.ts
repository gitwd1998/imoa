import { presetUni } from '@uni-helper/unocss-preset-uni'

import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    units: {
      default: 'px', // 设置默认单位为 rem
    },
    colors: {
      primary: '#4D80F0',
      success: '#34D19D',
      warning: '#F0883A',
      error: '#FA4350',
      info: '#909399'
    }
  },
  presets: [
    presetUni(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
