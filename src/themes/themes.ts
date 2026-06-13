import type { Theme } from './types.ts'
import type { ThemeTokens } from './tokens.ts'

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
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
      fontSize: '24px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '28px 0 16px',
    }),
    h2: (t) => ({
      fontSize: '20px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '24px 0 14px',
      borderLeft: `4px solid ${t.primaryColor}`,
      paddingLeft: '10px',
    }),
    h3: (t) => ({
      fontSize: '17px',
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: '1.4',
      margin: '20px 0 12px',
    }),
    h4: (t) => ({
      fontSize: '15px',
      fontWeight: 700,
      color: t.headingColor,
      margin: '18px 0 10px',
    }),
    h5: (t) => ({
      fontSize: '14px',
      fontWeight: 700,
      color: t.headingColor,
      margin: '16px 0 8px',
    }),
    h6: (t) => ({
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
    a: (t) => ({
      color: t.primaryColor,
      textDecoration: 'none',
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
      margin: `${t.paragraphSpacing} 0`,
      padding: '10px 16px',
      borderLeft: `4px solid ${t.primaryColor}`,
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
      borderCollapse: 'collapse',
      width: '100%',
      margin: `${t.paragraphSpacing} 0`,
      fontSize: t.fontSize,
    }),
    th: (t) => ({
      border: `1px solid ${t.borderColor}`,
      padding: '8px 12px',
      background: t.blockquoteBackground,
      color: t.headingColor,
      fontWeight: 700,
    }),
    td: (t) => ({
      border: `1px solid ${t.borderColor}`,
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
  fontSize: '15px',
  textColor: '#3f3f3f',
  primaryColor: '#07c160',
  headingColor: '#1f2329',
  lineHeight: '1.75',
  paragraphSpacing: '16px',
  borderColor: '#e5e6e8',
  codeFontFamily: MONO,
  codeBackground: '#f6f8fa',
  blockquoteBackground: '#f7f8fa',
  blockquoteColor: '#6a737d',
}

const elegantTokens: ThemeTokens = {
  fontFamily: SANS,
  fontSize: '15px',
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
  fontSize: '15px',
  textColor: '#4d4439',
  primaryColor: '#e8804f',
  headingColor: '#3a2f25',
  lineHeight: '1.8',
  paragraphSpacing: '16px',
  borderColor: '#ece3d8',
  codeFontFamily: MONO,
  codeBackground: '#faf6f0',
  blockquoteBackground: '#faf4ec',
  blockquoteColor: '#8a7a66',
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
]

export const defaultTheme = themes[0]

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? defaultTheme
}
