import { useMemo } from 'react'
import {
  markdownToHast,
  hastToHtml,
  hastToReact,
  extractMeta,
} from '../markdown-core'
import { renderThemedHast, getCodeThemeById, injectMetaBar } from '../themes'
import type { Theme, ThemeTokens, WindowStyle } from '../themes'
import type { ReactNode } from 'react'
import type { Root as HastRoot, Element } from 'hast'

/**
 * 微信公众号正文网页端最大宽度（实测约 677px）。
 * 手机端正文满屏自适应，故用 max-width 限制上限而非固定宽度：
 * 父容器更窄时 max-width 不生效，内容自适应；宽屏端则被限制并居中。
 */
export const ARTICLE_MAX_WIDTH = 677

/**
 * 用固定最大宽度的 section 包裹文章内容，使预览与复制出去的 HTML 宽度一致：
 * - 网页端查看/粘贴时宽度不超过 ARTICLE_MAX_WIDTH 并水平居中；
 * - 手机端父容器更窄时自适应满屏。
 * 同时在该容器上设置正文字体（合并 overrides 后的值），让正文字体通过 CSS 继承
 * 作用到所有正文元素，并随复制 HTML 一起带出；代码块由 code/pre 的 codeFontFamily 覆盖。
 * section 在微信正文白名单内（见 checker/rules.ts），不会触发兼容性警告。
 */
function wrapInArticle(tree: HastRoot, fontFamily: string): HastRoot {
  const section = {
    type: 'element',
    tagName: 'section',
    properties: {
      style: `max-width:${ARTICLE_MAX_WIDTH}px;margin:0 auto;font-family:${fontFamily}`,
    },
    children: tree.children,
  } as Element
  return { type: 'root', children: [section] }
}

interface ThemedRender {
  /** 预览用 React 节点 */
  node: ReactNode
  /** 导出/复制用 HTML 字符串 */
  html: string
  /** themed hast，供兼容性检查复用 */
  tree: HastRoot
}

/**
 * 统一的主题化渲染：预览（node）、导出（html）、检查（tree）共用同一棵 themed hast。
 *
 * 这是「所见即所得」的保证点——预览看到的就是复制出去的，也是被检查的。
 */
export function useThemedRender(
  source: string,
  theme: Theme,
  tokenOverrides?: Partial<ThemeTokens>,
  codeThemeId?: string,
  windowStyle: WindowStyle = 'mac',
): ThemedRender {
  return useMemo(() => {
    const codeTheme = getCodeThemeById(codeThemeId ?? '')
    // 合并 overrides 后的正文字体（面板微调读这里才生效）。
    const fontFamily = tokenOverrides?.fontFamily ?? theme.tokens.fontFamily
    const tokens: ThemeTokens = { ...theme.tokens, ...tokenOverrides }

    // Step 1: 从原始 Markdown 提取 meta 信息（在解析前移除自定义语法）
    const { cleaned, meta } = extractMeta(source)

    // Step 2: 解析清理后的 Markdown → 安全 hast
    const base = markdownToHast(cleaned)

    // Step 3: 主题渲染（代码高亮 + inline style 注入）
    const themed = renderThemedHast(
      base,
      theme,
      tokenOverrides,
      codeTheme,
      windowStyle,
    )

    // Step 4: 在 h1 后注入 meta bar（原地修改 themed）
    const withMeta = injectMetaBar(themed, meta, tokens)

    // Step 5: 包一层定宽 section；预览(node)、复制(html)、检查(tree)同源
    const wrapped = wrapInArticle(withMeta, fontFamily)
    return {
      node: hastToReact(wrapped),
      html: hastToHtml(wrapped),
      tree: wrapped,
    }
  }, [source, theme, tokenOverrides, codeThemeId, windowStyle])
}

