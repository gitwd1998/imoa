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
      info: '#909399',
    },
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
  shortcuts: [
    ['bg', 'light:bg-light dark:bg-dark'],
    ['c', 'light:c-dark dark:c-light'],
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  rules: [
    [/^divider-([trbl])/, (match, { theme }) => {
      return `
        .${match[0]} {
          position: relative;
        }
        .${match[0]}:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 0;
          height: 1px;
          background-color: ${theme.colors.info};
          transform-origin: center bottom;
          transform: scaleY(0.2);
        }
      `
    }],
  ],
})
