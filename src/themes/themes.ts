import type { Theme } from './types.ts'
import type { ThemeTokens } from './tokens.ts'

// 默认正文字体：思源黑体（与微调面板「思源黑体」选项 value 保持一致，
// 使初始下拉有匹配项）；系统未装时按 stack 回退到系统无衬线。
const SANS =
  "'Source Han Sans SC', 'Source Han Sans CN', '思源黑体', 'Noto Sans CJK SC', sans-serif"
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"

/**
 * 三套内置主题。每套都用各自的 tokens 驱动 styles 函数，
 * 切换主题即换 tokens + styles。styles 全部输出 inline-friendly 属性。
 */

// ---------- 通用 styles 构造 ----------
// 不同主题的差异主要在 tokens 与少量装饰，公共部分抽成工厂。
function baseStyles(): Theme['styles'] {
  return {
    h1: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '24px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '28px 0 16px',
      textAlign: 'center',
    }),
    h2: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '20px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '24px 0 14px',
      borderLeft: `4px solid ${t.primaryColor}`,
      paddingLeft: '10px',
    }),
    h3: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '17px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '20px 0 12px',
    }),
    h4: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '15px',
      fontWeight: 700,
      color: t.headingColor,
      margin: '18px 0 10px',
    }),
    h5: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '14px',
      fontWeight: 700,
      color: t.headingColor,
      margin: '16px 0 8px',
    }),
    h6: (t) => ({
      fontFamily: t.headingFontFamily,
      fontSize: '14px',
      fontWeight: 700,
      color: t.blockquoteColor,
      margin: '16px 0 8px',
    }),
    p: (t) => ({
      fontSize: t.fontSize,
      color: t.textColor,
      lineHeight: t.lineHeight,
      margin: `${t.paragraphSpacing} 0`,
    }),
    // 链接固定用经典链接蓝 + 下划线，不随主题变化（忽略 tokens）。
    a: () => ({
      color: '#0066cc',
      textDecoration: 'underline',
      wordBreak: 'break-all',
    }),
    strong: (t) => ({ fontWeight: 700, color: t.headingColor }),
    em: () => ({ fontStyle: 'italic' }),
    ul: (t) => ({
      margin: `${t.paragraphSpacing} 0`,
      paddingLeft: '24px',
      color: t.textColor,
      lineHeight: t.lineHeight,
    }),
    ol: (t) => ({
      margin: `${t.paragraphSpacing} 0`,
      paddingLeft: '24px',
      color: t.textColor,
      lineHeight: t.lineHeight,
    }),
    li: (t) => ({
      fontSize: t.fontSize,
      margin: '6px 0',
    }),
    blockquote: (t) => ({
      fontFamily: t.blockquoteFontFamily,
      margin: `${t.paragraphSpacing} 0`,
      padding: '10px 16px',
      borderLeft: `4px solid ${t.primaryColor}`,
      borderRadius: '6px',
      background: t.blockquoteBackground,
      color: t.blockquoteColor,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
    }),
    code: (t) => ({
      fontFamily: t.codeFontFamily,
      background: t.codeBackground,
      padding: '2px 5px',
      borderRadius: '3px',
      fontSize: '90%',
      color: '#c7254e',
    }),
    pre: (t) => ({
      fontFamily: t.codeFontFamily,
      background: t.codeBackground,
      padding: '14px 16px',
      borderRadius: '6px',
      overflowX: 'auto',
      fontSize: '13px',
      lineHeight: '1.6',
      margin: `${t.paragraphSpacing} 0`,
    }),
    hr: (t) => ({
      border: 'none',
      borderTop: `1px solid ${t.borderColor}`,
      margin: '24px 0',
    }),
    img: () => ({
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px',
    }),
    table: (t) => ({
      // 用 separate + overflow:hidden 让外框圆角生效（collapse 模式圆角无效）。
      borderCollapse: 'separate',
      borderSpacing: 0,
      width: '100%',
      margin: `${t.paragraphSpacing} 0`,
      fontSize: t.fontSize,
      border: `1px solid ${t.borderColor}`,
      borderRadius: '6px',
      overflow: 'hidden',
    }),
    th: (t) => ({
      // 单元格只留右/下边框，外框提供顶/左边，避免双线。
      borderRight: `1px solid ${t.borderColor}`,
      borderBottom: `1px solid ${t.borderColor}`,
      padding: '8px 12px',
      background: t.blockquoteBackground,
      color: t.headingColor,
      fontWeight: 700,
    }),
    td: (t) => ({
      borderRight: `1px solid ${t.borderColor}`,
      borderBottom: `1px solid ${t.borderColor}`,
      padding: '8px 12px',
      color: t.textColor,
    }),
  }
}

// pre 内的 code 不应再有行内代码的红色/背景，单独覆盖。
function withPreCodeReset(styles: Theme['styles']): Theme['styles'] {
  return {
    ...styles,
    code: (t) => ({
      fontFamily: t.codeFontFamily,
      background: t.codeBackground,
      padding: '2px 5px',
      borderRadius: '3px',
      fontSize: '90%',
      color: '#c7254e',
    }),
  }
}

const classicTokens: ThemeTokens = {
  fontFamily: SANS,
  fontSize: '16px',
  textColor: '#3f3f3f',
  primaryColor: '#07c160',
  headingColor: '#1f2329',
  lineHeight: '1.8',
  paragraphSpacing: '18px',
  borderColor: '#e5e6e8',
  codeFontFamily: MONO,
  codeBackground: '#f6f8fa',
  blockquoteBackground: '#f7f8fa',
  blockquoteColor: '#6a737d',
}

const elegantTokens: ThemeTokens = {
  fontFamily: SANS,
  fontSize: '16px',
  textColor: '#4a4a4a',
  primaryColor: '#5b6cf0',
  headingColor: '#2b2b40',
  lineHeight: '1.8',
  paragraphSpacing: '18px',
  borderColor: '#e6e6f0',
  codeFontFamily: MONO,
  codeBackground: '#f5f5fb',
  blockquoteBackground: '#f5f5fb',
  blockquoteColor: '#6b6b80',
}

const warmTokens: ThemeTokens = {
  fontFamily: SANS,
  fontSize: '16px',
  textColor: '#4d4439',
  primaryColor: '#e8804f',
  headingColor: '#3a2f25',
  lineHeight: '1.8',
  paragraphSpacing: '18px',
  borderColor: '#ece3d8',
  codeFontFamily: MONO,
  codeBackground: '#faf6f0',
  blockquoteBackground: '#faf4ec',
  blockquoteColor: '#8a7a66',
}

// Obsidian Gold：深邃曜石蓝（obsidian）作标题/正文，金色（gold）作主色装饰。
// 受微信正文「白底 + 仅 inline style」约束，深色仅用于文字与边框，不做深色背景。
const obsidianGoldTokens: ThemeTokens = {
  fontFamily: SANS,
  fontSize: '16px',
  textColor: '#33302a',
  primaryColor: '#bf9b30',
  headingColor: '#14213d',
  lineHeight: '1.8',
  paragraphSpacing: '18px',
  borderColor: '#e6dcc2',
  codeFontFamily: MONO,
  codeBackground: '#f8f4ea',
  blockquoteBackground: '#faf6ea',
  blockquoteColor: '#6b6450',
}

export const themes: Theme[] = [
  {
    id: 'classic',
    name: '微信经典绿',
    tokens: classicTokens,
    styles: withPreCodeReset(baseStyles()),
  },
  {
    id: 'elegant',
    name: '雅致蓝',
    tokens: elegantTokens,
    styles: withPreCodeReset(baseStyles()),
  },
  {
    id: 'warm',
    name: '暖橙',
    tokens: warmTokens,
    styles: withPreCodeReset(baseStyles()),
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    tokens: obsidianGoldTokens,
    styles: withPreCodeReset(baseStyles()),
  },
]

export const defaultTheme = themes[0]

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? defaultTheme
}
