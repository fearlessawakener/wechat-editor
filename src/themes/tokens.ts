/**
 * 主题可参数化 token。
 *
 * 这些值是「主题 → inline style」的原料，也是 Phase 8 微调面板的绑定目标。
 * 全部用字符串（含单位），避免数字值在不同渲染路径下被隐式加 px 的歧义。
 */
export interface ThemeTokens {
  /** 正文字体 */
  fontFamily: string
  /** 标题字体；未设置时回退到正文字体（fontFamily） */
  headingFontFamily?: string
  /** 引用块字体；未设置时回退到正文字体（fontFamily） */
  blockquoteFontFamily?: string
  /** 正文字号，如 '15px' */
  fontSize: string
  /** 正文颜色 */
  textColor: string
  /** 主色：用于标题装饰、链接、强调等 */
  primaryColor: string
  /** 标题颜色 */
  headingColor: string
  /** 正文行高，如 '1.75' */
  lineHeight: string
  /** 段落上下间距，如 '16px' */
  paragraphSpacing: string
  /** 分隔线 / 边框颜色 */
  borderColor: string
  /** 代码字体 */
  codeFontFamily: string
  /** 行内代码 / 代码块背景 */
  codeBackground: string
  /** 引用块背景 */
  blockquoteBackground: string
  /** 引用块文字颜色 */
  blockquoteColor: string
}
