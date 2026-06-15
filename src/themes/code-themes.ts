/**
 * 代码块高亮主题（与文章主题正交，单独切换）。
 *
 * 配色取自 highlight.js 官方 atom-one-dark / atom-one-light，把 hljs-* 语义 class
 * 映射为 inline 颜色（微信不认 class，必须 inline）。代码块底色与基础文字色单列。
 */

/** 代码块窗口装饰风格。 */
export type WindowStyle = 'mac' | 'win'

export interface CodeTheme {
  id: string
  name: string
  /** 代码块底色 */
  background: string
  /** .hljs 基础文字色（未命中具体 token 的文本） */
  text: string
  /** 标题栏文字色（语言标签） */
  titleColor: string
  /** hljs-* class → 颜色 */
  colors: Record<string, string>
}

const atomOneDark: CodeTheme = {
  id: 'atom-one-dark',
  name: 'Atom One Dark',
  background: '#282c34',
  text: '#abb2bf',
  titleColor: '#9da5b4',
  colors: {
    'hljs-comment': '#5c6370',
    'hljs-quote': '#5c6370',
    'hljs-doctag': '#c678dd',
    'hljs-keyword': '#c678dd',
    'hljs-formula': '#c678dd',
    'hljs-section': '#e06c75',
    'hljs-name': '#e06c75',
    'hljs-selector-tag': '#e06c75',
    'hljs-deletion': '#e06c75',
    'hljs-subst': '#e06c75',
    'hljs-literal': '#56b6c2',
    'hljs-string': '#98c379',
    'hljs-regexp': '#98c379',
    'hljs-addition': '#98c379',
    'hljs-attribute': '#98c379',
    'hljs-attr': '#d19a66',
    'hljs-variable': '#d19a66',
    'hljs-template-variable': '#d19a66',
    'hljs-type': '#d19a66',
    'hljs-selector-class': '#d19a66',
    'hljs-selector-attr': '#d19a66',
    'hljs-selector-pseudo': '#d19a66',
    'hljs-number': '#d19a66',
    'hljs-symbol': '#61aeee',
    'hljs-bullet': '#61aeee',
    'hljs-link': '#61aeee',
    'hljs-meta': '#61aeee',
    'hljs-selector-id': '#61aeee',
    'hljs-title': '#61aeee',
    'hljs-built_in': '#e6c07b',
    'hljs-title.class_': '#e6c07b',
    'hljs-class .hljs-title': '#e6c07b',
  },
}

const atomOneLight: CodeTheme = {
  id: 'atom-one-light',
  name: 'Atom One Light',
  background: '#fafafa',
  text: '#383a42',
  titleColor: '#a0a1a7',
  colors: {
    'hljs-comment': '#a0a1a7',
    'hljs-quote': '#a0a1a7',
    'hljs-doctag': '#a626a4',
    'hljs-keyword': '#a626a4',
    'hljs-formula': '#a626a4',
    'hljs-section': '#e45649',
    'hljs-name': '#e45649',
    'hljs-selector-tag': '#e45649',
    'hljs-deletion': '#e45649',
    'hljs-subst': '#e45649',
    'hljs-literal': '#0184bb',
    'hljs-string': '#50a14f',
    'hljs-regexp': '#50a14f',
    'hljs-addition': '#50a14f',
    'hljs-attribute': '#50a14f',
    'hljs-attr': '#986801',
    'hljs-variable': '#986801',
    'hljs-template-variable': '#986801',
    'hljs-type': '#986801',
    'hljs-selector-class': '#986801',
    'hljs-selector-attr': '#986801',
    'hljs-selector-pseudo': '#986801',
    'hljs-number': '#986801',
    'hljs-symbol': '#4078f2',
    'hljs-bullet': '#4078f2',
    'hljs-link': '#4078f2',
    'hljs-meta': '#4078f2',
    'hljs-selector-id': '#4078f2',
    'hljs-title': '#4078f2',
    'hljs-built_in': '#c18401',
    'hljs-title.class_': '#c18401',
    'hljs-class .hljs-title': '#c18401',
  },
}

export const codeThemes: CodeTheme[] = [atomOneDark, atomOneLight]

export const defaultCodeTheme = atomOneDark

export function getCodeThemeById(id: string): CodeTheme {
  return codeThemes.find((t) => t.id === id) ?? defaultCodeTheme
}
