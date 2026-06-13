import { useMemo } from 'react'
import { markdownToHast, hastToHtml, hastToReact } from '../markdown-core'
import { renderThemedHast } from '../themes'
import type { Theme, ThemeTokens } from '../themes'
import type { ReactNode } from 'react'
import type { Root as HastRoot } from 'hast'

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
): ThemedRender {
  return useMemo(() => {
    const base = markdownToHast(source)
    const themed = renderThemedHast(base, theme, tokenOverrides)
    return {
      node: hastToReact(themed),
      html: hastToHtml(themed),
      tree: themed,
    }
  }, [source, theme, tokenOverrides])
}

