import { visit } from 'unist-util-visit'
import { createLowlight } from 'lowlight'
import type { Root as HastRoot, Element, ElementContent } from 'hast'
import { HLJS_COLORS } from './highlight-colors.ts'

// 按需注册公众号技术文常用语言，避免 lowlight `common` 把 30+ 语言全打包。
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml' // 含 html
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'

const lowlight = createLowlight({
  javascript,
  typescript,
  xml,
  css,
  json,
  bash,
  python,
  java,
  go,
  rust,
  sql,
  markdown,
})

/** 从 code 节点的 className 中解析语言（language-js → js）。 */
function getLanguage(code: Element): string | undefined {
  const className = code.properties?.className
  const classes = Array.isArray(className) ? className : []
  for (const c of classes) {
    if (typeof c === 'string' && c.startsWith('language-')) {
      const lang = c.slice('language-'.length)
      if (lang && lowlight.registered(lang)) return lang
    }
  }
  return undefined
}

/** 取 code 节点的纯文本内容。 */
function getCodeText(code: Element): string {
  let text = ''
  visit(code, 'text', (n) => {
    text += n.value
  })
  return text
}

/**
 * 把高亮 hast 中的 hljs-* class 替换为 inline color，并清除 className。
 * 微信不认 class，必须 inline。
 */
function inlineHighlightColors(nodes: ElementContent[]): void {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    const className = node.properties?.className
    const classes = Array.isArray(className) ? className : []
    const color = classes
      .map((c) => (typeof c === 'string' ? HLJS_COLORS[c] : undefined))
      .find(Boolean)
    if (color) {
      const existing =
        typeof node.properties?.style === 'string'
          ? node.properties.style
          : ''
      node.properties = {
        ...node.properties,
        style: existing ? `${existing};color:${color}` : `color:${color}`,
      }
    }
    // 移除 class，避免残留到微信。
    if (node.properties) delete node.properties.className
    if (node.children) inlineHighlightColors(node.children as ElementContent[])
  }
}

/**
 * 对 hast 中所有 `pre > code` 做语法高亮，并把高亮颜色 inline 化。
 *
 * 返回原 tree（原地修改 code 子节点）。调用方应在 applyTheme 之前调用，
 * 这样 code/pre 的主题底色仍可正常注入。
 */
export function highlightCodeBlocks(tree: HastRoot): HastRoot {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'pre') return
    const code = node.children.find(
      (c): c is Element => c.type === 'element' && c.tagName === 'code',
    )
    if (!code) return

    const lang = getLanguage(code)
    const text = getCodeText(code)
    if (!text) return

    const result = lang
      ? lowlight.highlight(lang, text)
      : lowlight.highlightAuto(text)

    const children = result.children as ElementContent[]
    inlineHighlightColors(children)
    code.children = children
  })

  return tree
}
