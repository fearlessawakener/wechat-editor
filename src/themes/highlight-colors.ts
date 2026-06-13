/**
 * highlight.js 语义 class → inline 颜色映射（单一配色，偏 GitHub 浅色）。
 *
 * 微信不支持 <style>，所以代码高亮不能依赖 hljs 的 class，
 * 必须把每个 token 的颜色写成 inline style。这里维护一份精简映射，
 * 覆盖常见语言的主要 token 类型，未命中的 class 不着色（用代码块默认色）。
 */
export const HLJS_COLORS: Record<string, string> = {
  'hljs-comment': '#6a737d',
  'hljs-quote': '#6a737d',
  'hljs-keyword': '#d73a49',
  'hljs-selector-tag': '#d73a49',
  'hljs-literal': '#005cc5',
  'hljs-number': '#005cc5',
  'hljs-built_in': '#005cc5',
  'hljs-type': '#005cc5',
  'hljs-string': '#032f62',
  'hljs-title': '#6f42c1',
  'hljs-title.function_': '#6f42c1',
  'hljs-function': '#6f42c1',
  'hljs-name': '#22863a',
  'hljs-attr': '#005cc5',
  'hljs-attribute': '#005cc5',
  'hljs-variable': '#e36209',
  'hljs-template-variable': '#e36209',
  'hljs-regexp': '#032f62',
  'hljs-symbol': '#005cc5',
  'hljs-bullet': '#735c0f',
  'hljs-meta': '#005cc5',
  'hljs-tag': '#22863a',
  'hljs-section': '#005cc5',
  'hljs-property': '#005cc5',
  'hljs-params': '#24292e',
  'hljs-deletion': '#b31d28',
  'hljs-addition': '#22863a',
}
