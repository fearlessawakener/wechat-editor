import { visit, SKIP } from 'unist-util-visit'
import { createLowlight } from 'lowlight'
import type { Root as HastRoot, Element, ElementContent } from 'hast'
import type { CodeTheme, WindowStyle } from './code-themes.ts'
import { defaultCodeTheme } from './code-themes.ts'

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
 * 微信不认 class，必须 inline。颜色取自传入的代码主题。
 */
function inlineHighlightColors(
  nodes: ElementContent[],
  colors: Record<string, string>,
): void {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    const className = node.properties?.className
    const classes = Array.isArray(className) ? className : []
    const color = classes
      .map((c) => (typeof c === 'string' ? colors[c] : undefined))
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
    if (node.children) {
      inlineHighlightColors(node.children as ElementContent[], colors)
    }
  }
}

/** 构造一个带 inline style 的 span。 */
function span(style: string, value?: string): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: { style },
    children: value ? [{ type: 'text', value }] : [],
  }
}

/** Mac 三色圆点。 */
function macDots(): Element[] {
  const dot = (color: string) =>
    span(
      `display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:8px`,
    )
  return [dot('#ff5f56'), dot('#ffbd2e'), dot('#27c93f')]
}

/** Windows 最小化/最大化/关闭三个方块（用符号近似，inline 兼容微信）。 */
function winControls(color: string): Element[] {
  const box = (symbol: string) =>
    span(
      `display:inline-block;width:16px;text-align:center;margin-left:12px;font-size:12px;color:${color}`,
      symbol,
    )
  return [box('—'), box('☐'), box('✕')]
}

/**
 * 构造代码块标题栏（窗口装饰 + 可选语言标签）。
 * Mac：左侧圆点 + 语言名靠右；Win：语言名靠左 + 右侧方块。
 */
function buildTitlebar(
  windowStyle: WindowStyle,
  lang: string | undefined,
  theme: CodeTheme,
): Element {
  const langLabel = lang
    ? span(
        `font-size:12px;color:${theme.titleColor};font-family:inherit`,
        lang,
      )
    : undefined

  const children: Element[] =
    windowStyle === 'mac'
      ? [...macDots(), ...(langLabel ? [withMarginLeftAuto(langLabel)] : [])]
      : [
          ...(langLabel ? [langLabel] : []),
          ...winControls(theme.titleColor).map((c, i) =>
            i === 0 && langLabel ? withMarginLeftAuto(c) : c,
          ),
        ]

  return {
    type: 'element',
    tagName: 'section',
    properties: {
      style:
        'display:flex;align-items:center;padding:10px 14px;' +
        'background:rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.08)',
    },
    children,
  }
}

/** 给节点 style 追加 margin-left:auto（把后续内容推到右侧）。 */
function withMarginLeftAuto(el: Element): Element {
  const style =
    typeof el.properties?.style === 'string' ? el.properties.style : ''
  return {
    ...el,
    properties: { ...el.properties, style: `${style};margin-left:auto` },
  }
}

/**
 * 对 hast 中所有 `pre > code` 做语法高亮，并把 pre 替换为带窗口装饰的容器。
 *
 * 调用方应在 applyTheme 之前调用：highlightCodeBlocks 注入的 background/color 借
 * mergeStyle「已有 inline style 优先」规则盖过 applyTheme 的 token 底色。
 *
 * @param tree         安全 hast（会被原地修改）
 * @param codeTheme    代码高亮主题（含配色与底色）
 * @param windowStyle  窗口装饰风格（mac/win）
 */
export function highlightCodeBlocks(
  tree: HastRoot,
  codeTheme: CodeTheme = defaultCodeTheme,
  windowStyle: WindowStyle = 'mac',
): HastRoot {
  visit(
    tree,
    'element',
    (node: Element, index: number | undefined, parent) => {
      if (node.tagName !== 'pre') return
      if (!parent || index === undefined) return
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
      inlineHighlightColors(children, codeTheme.colors)
      code.children = children

      // 给 pre/code 注入代码主题底色与基础文字色（inline 优先级盖过文章主题）。
      node.properties = {
        ...node.properties,
        style:
          `margin:0;background:${codeTheme.background};color:${codeTheme.text};` +
          'padding:14px 16px;overflow-x:auto;font-size:13px;line-height:1.6',
      }
      code.properties = {
        ...code.properties,
        style: `color:${codeTheme.text};background:transparent;padding:0`,
      }

      // 用窗口装饰容器包裹 titlebar + pre，替换原 pre。
      const wrapper: Element = {
        type: 'element',
        tagName: 'section',
        properties: {
          style:
            `background:${codeTheme.background};border-radius:6px;` +
            'overflow:hidden;margin:16px 0',
        },
        children: [buildTitlebar(windowStyle, lang, codeTheme), node],
      }
      parent.children[index] = wrapper
      // 替换后跳过原 pre 子树，避免重复处理。
      return SKIP
    },
  )

  return tree
}
