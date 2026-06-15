import type { Root as HastRoot } from 'hast'
import type { Theme } from './types.ts'
import type { ThemeTokens } from './tokens.ts'
import type { CodeTheme, WindowStyle } from './code-themes.ts'
import { defaultCodeTheme } from './code-themes.ts'
import { highlightCodeBlocks } from './highlight.ts'
import { applyTheme } from './apply-theme.ts'

/**
 * 把 markdownToHast 产出的安全 hast 渲染为「带主题 inline style」的 hast。
 *
 * 顺序很重要：
 * 1. 先 highlightCodeBlocks：对 pre>code 高亮、包窗口装饰、注入代码主题底色。
 * 2. 再 applyTheme：按 tagName 注入文章主题 style（深拷贝，不污染入参）。
 *
 * 产出的 hast 同时用于预览（hastToReact）和导出（hastToHtml），保证一致。
 *
 * @param tree            markdownToHast 的输出
 * @param theme           当前文章主题
 * @param tokenOverrides  微调覆盖（Phase 8）
 * @param codeTheme       代码高亮主题（默认 atom-one-dark）
 * @param windowStyle     代码块窗口装饰风格（默认 mac）
 */
export function renderThemedHast(
  tree: HastRoot,
  theme: Theme,
  tokenOverrides?: Partial<ThemeTokens>,
  codeTheme: CodeTheme = defaultCodeTheme,
  windowStyle: WindowStyle = 'mac',
): HastRoot {
  // highlightCodeBlocks 原地修改，先克隆一份避免污染传入的共享树。
  const cloned = structuredClone(tree)
  const highlighted = highlightCodeBlocks(cloned, codeTheme, windowStyle)
  return applyTheme(highlighted, theme, tokenOverrides)
}
