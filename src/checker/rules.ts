import { visit } from 'unist-util-visit'
import type { Element } from 'hast'
import type { CheckRule, CheckWarning } from './types.ts'

/** 微信正文支持的常见标签白名单（用于「不支持标签」提示）。 */
const SUPPORTED_TAGS = new Set<string>([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'a', 'strong', 'em', 'b', 'i', 'del', 's', 'u',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'hr', 'img', 'span', 'section',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'figure', 'figcaption', 'sub', 'sup',
])

/** 残留 class：微信会忽略 class，提示可能丢样式。 */
const noClassName: CheckRule = {
  id: 'no-class',
  run(tree) {
    let count = 0
    visit(tree, 'element', (node: Element) => {
      if (node.properties && 'className' in node.properties) {
        const cn = node.properties.className
        if (Array.isArray(cn) ? cn.length > 0 : Boolean(cn)) count++
      }
    })
    return count
      ? [
          {
            id: 'no-class',
            level: 'warning',
            message: `检测到 ${count} 处残留 class，微信会忽略 class，相关样式可能丢失`,
            count,
          },
        ]
      : []
  },
}

/** style/script 标签：微信会剥离。 */
const noStyleScriptTag: CheckRule = {
  id: 'no-style-script',
  run(tree) {
    const warnings: CheckWarning[] = []
    let style = 0
    let script = 0
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'style') style++
      if (node.tagName === 'script') script++
    })
    if (style)
      warnings.push({
        id: 'no-style-script',
        level: 'warning',
        message: `检测到 ${style} 个 <style> 标签，微信不支持，样式应为 inline`,
        count: style,
      })
    if (script)
      warnings.push({
        id: 'no-style-script',
        level: 'warning',
        message: `检测到 ${script} 个 <script> 标签，微信会移除`,
        count: script,
      })
    return warnings
  },
}

/** 不支持的标签。 */
const unsupportedTags: CheckRule = {
  id: 'unsupported-tag',
  run(tree) {
    const hit = new Map<string, number>()
    visit(tree, 'element', (node: Element) => {
      if (!SUPPORTED_TAGS.has(node.tagName)) {
        hit.set(node.tagName, (hit.get(node.tagName) ?? 0) + 1)
      }
    })
    return Array.from(hit, ([tag, count]) => ({
      id: 'unsupported-tag',
      level: 'warning' as const,
      message: `标签 <${tag}> 在微信正文可能不被支持（${count} 处）`,
      count,
    }))
  },
}

/** 外链图片：微信粘贴后需上传到素材库，外链可能无法显示。 */
const externalImages: CheckRule = {
  id: 'external-image',
  run(tree) {
    let count = 0
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return
      const src = node.properties?.src
      if (typeof src === 'string' && /^https?:\/\//i.test(src)) count++
    })
    return count
      ? [
          {
            id: 'external-image',
            level: 'info',
            message: `有 ${count} 张外链图片，粘贴到公众号后需在后台重新上传或确认可访问`,
            count,
          },
        ]
      : []
  },
}

export const rules: CheckRule[] = [
  noClassName,
  noStyleScriptTag,
  unsupportedTags,
  externalImages,
]
