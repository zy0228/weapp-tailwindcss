import type { Plugin } from 'vite'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/defaults'
import { templeteHandler } from '@/wxml'
// import renamePostcssPlugin from '../postcss/plugin'
// import type { Plugin as PostcssPlugin } from 'postcss'
// import postcssrc from 'postcss-load-config'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/3
export default function ViteWeappTailwindcssPlugin (options: UserDefinedOptions = {}): Plugin {
  const {
    htmlMatcher // cssMatcher, mainCssChunkMatcher
  } = getOptions(options)

  return {
    name: 'vite-plugin-uni-app-weapp-tailwindcss-adaptor',
    generateBundle (opt, bundle, isWrite) {
      const entries = Object.entries(bundle)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (htmlMatcher(file)) {
          if (originalSource.type === 'asset') {
            originalSource.source = templeteHandler(originalSource.source.toString())
          }
        }
      }
    }
  }
}
