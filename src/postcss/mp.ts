import { Rule, Declaration } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'

// ':not(template) ~ :not(template)'
// ':not(template)~:not(template)'
// const regexp1 = /:not\(template\)\s*~\s*:not\(template\)/g
// :not([hidden])~:not([hidden])
// :not([hidden]) ~ :not([hidden])
// const regexp2 = /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/g

// eslint-disable-next-line unicorn/better-regex
const PATTERNS = [/:not\(template\)\s*~\s*:not\(template\)/.source, /:not\(\[hidden\]\)\s*~\s*:not\(\[hidden\]\)/.source].join('|')
const BROAD_MATCH_GLOBAL_REGEXP = new RegExp(PATTERNS, 'g')

export function testIfVariablesScope(node: Rule, count = 1): boolean {
  if (/:?:before/.test(node.selector) && /:?:after/.test(node.selector)) {
    for (let i = 0; i < count; i++) {
      const tryTestDecl = node.nodes[i]
      if (tryTestDecl && tryTestDecl.type === 'decl' && tryTestDecl.prop.startsWith('--tw-')) {
        continue
      } else {
        return false
      }
    }
    return true
  }
  return false
}

export function commonChunkPreflight(node: Rule, options: IStyleHandlerOptions) {
  node.selector = node.selector.replaceAll(BROAD_MATCH_GLOBAL_REGEXP, 'view + view')

  // 变量注入和 preflight
  if (testIfVariablesScope(node)) {
    // node.selector = node.selector.replace(/\*/g, 'view')
    const selectorParts = node.selector.split(',')
    // 没有 view 元素时，添加 view
    if (!selectorParts.includes('view')) {
      selectorParts.push('view')
    }
    if (options.cssPreflightRange === 'all' && // 默认对每个元素都生效
      !selectorParts.includes(':not(not)')) {
        selectorParts.push(':not(not)')
      }

    node.selector = selectorParts.join(',')

    // node.walkDecls((decl) => {
    //   // remove empty var 来避免压缩css报错
    //   if (/^\s*$/.test(decl.value)) {
    //     decl.remove()
    //   }
    //   //  console.log(decl.prop, decl.value)
    // })

    // preset
    if (typeof options.cssInjectPreflight === 'function') {
      node.append(...options.cssInjectPreflight())
    }

    const pseudoVarRule = new Rule({
      // selectors: ['::before', '::after'],
      selector: '::before,::after'
    })
    pseudoVarRule.append(
      new Declaration({
        prop: '--tw-content',
        value: '""'
      })
    )
    node.before(pseudoVarRule)
  }
}
