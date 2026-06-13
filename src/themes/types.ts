import type { Properties as CssProperties } from 'csstype'
import type { ThemeTokens } from './tokens.ts'

/**
 * 受主题控制的 HTML 节点类型（hast tagName）。
 *
 * 每类节点映射到一组 inline style；注入时按 tagName 查表合并到节点 style。
 */
export type StyledTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'a'
  | 'strong'
  | 'em'
  | 'ul'
  | 'ol'
  | 'li'
  | 'blockquote'
  | 'code' // 行内代码
  | 'pre' // 代码块容器
  | 'hr'
  | 'img'
  | 'table'
  | 'thead'
  | 'tr'
  | 'th'
  | 'td'

/** 每类节点的样式由 tokens 计算得出，便于微调时整体重算。 */
export type StyleMap = {
  [Tag in StyledTag]?: (tokens: ThemeTokens) => CssProperties
}

export interface Theme {
  id: string
  name: string
  /** 默认 token，UI 微调会基于它做覆盖。 */
  tokens: ThemeTokens
  /** 节点样式映射。 */
  styles: StyleMap
}
