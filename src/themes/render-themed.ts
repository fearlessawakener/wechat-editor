import type { Root as HastRoot } from 'hast'
import type { Theme } from './types.ts'
import type { ThemeTokens } from './tokens.ts'
import { highlightCodeBlocks } from './highlight.ts'
import { applyTheme } from './apply-theme.ts'

/**
 * 把 markdownToHast 产出的安全 hast 渲染为「带主题 inline style」的 hast。
 *
 * 顺序很重要：
 * 1. 先 highlightCodeBlocks：对 pre>code 高亮并把高亮色 inline 化（产物是新子树）。
 * 2. 再 applyTheme：按 tagName 注入主题 style（深拷贝，不污染入参）。
 *
 * 产出的 hast 同时用于预览（hastToReact）和导出（hastToHtml），保证一致。
 *
 * @param tree            markdownToHast 的输出
 * @param theme           当前主题
 * @param tokenOverrides  微调覆盖（Phase 8）
 */
export function renderThemedHast(
  tree: HastRoot,
  theme: Theme,
  tokenOverrides?: Partial<ThemeTokens>,
): HastRoot {
  // highlightCodeBlocks 原地修改，先克隆一份避免污染传入的共享树。
  const cloned = structuredClone(tree)
  const highlighted = highlightCodeBlocks(cloned)
  return applyTheme(highlighted, theme, tokenOverrides)
}
