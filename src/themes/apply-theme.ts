import { visit } from 'unist-util-visit'
import type { Root as HastRoot, Element } from 'hast'
import type { Properties as CssProperties } from 'csstype'
import type { Theme, StyledTag } from './types.ts'
import type { ThemeTokens } from './tokens.ts'
import { mergeStyle } from './style-utils.ts'

const LINK_BLUE = '#0066cc'

/** 已支持注入的 tag 集合，用于快速判断。 */
const STYLED_TAGS = new Set<string>([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'hr',
  'img',
  'table',
  'thead',
  'tr',
  'th',
  'td',
])

function hasMarker(node: Element, key: string): boolean {
  return node.properties?.[key] === 'true'
}

function getCustomStyles(
  node: Element,
  tokens: ThemeTokens,
): CssProperties {
  if (hasMarker(node, 'data-md-wavy')) {
    return {
      textDecorationColor: tokens.primaryColor,
    }
  }

  if (hasMarker(node, 'data-md-toc')) {
    return {
      margin: `${tokens.paragraphSpacing} 0`,
      padding: '12px 16px',
      border: `1px solid ${tokens.borderColor}`,
      borderRadius: '8px',
      background: '#fafbfc',
      color: tokens.textColor,
    }
  }

  if (hasMarker(node, 'data-md-toc-list')) {
    return {
      listStyle: 'none',
      margin: '0',
      paddingLeft: '0',
    }
  }

  if (hasMarker(node, 'data-md-toc-item')) {
    return {
      margin: '0',
    }
  }

  if (hasMarker(node, 'data-md-toc-link')) {
    return {
      display: 'inline-flex',
      alignItems: 'flex-start',
      color: LINK_BLUE,
      textDecoration: 'none',
      wordBreak: 'break-word',
      lineHeight: tokens.lineHeight,
      padding: '0',
    }
  }

  if (hasMarker(node, 'data-md-toc-label')) {
    return {
      fontSize: '13px',
      fontWeight: '700',
      color: LINK_BLUE,
      lineHeight: '1.5',
      marginBottom: '4px',
    }
  }

  if (hasMarker(node, 'data-md-toc-prefix')) {
    return {
      whiteSpace: 'pre',
      fontFamily: tokens.codeFontFamily,
      color: tokens.blockquoteColor,
      flexShrink: '0',
      marginRight: '2px',
    }
  }

  return {}
}

/**
 * 把主题样式注入到 hast 的每个节点 style 属性。
 *
 * 返回**新的** hast root（深拷贝），不修改入参，便于 preview/export 复用同源树。
 *
 * @param tree   markdownToHast 产出的安全 hast
 * @param theme  主题定义
 * @param tokenOverrides  微调覆盖（Phase 8），与 theme.tokens 合并
 */
export function applyTheme(
  tree: HastRoot,
  theme: Theme,
  tokenOverrides?: Partial<ThemeTokens>,
): HastRoot {
  const tokens: ThemeTokens = { ...theme.tokens, ...tokenOverrides }
  // 深拷贝，避免污染原始树。structuredClone 在目标环境（现代浏览器/Node18+）可用。
  const cloned = structuredClone(tree)

  visit(cloned, 'element', (node: Element, _index, parent) => {
    // 微信全程不认 class：移除任何来源的 className（含 language-xxx）。
    if (node.properties && 'className' in node.properties) {
      delete node.properties.className
    }

    const tag = node.tagName
    const themeStyles: CssProperties = STYLED_TAGS.has(tag)
      ? (theme.styles[tag as StyledTag]?.(tokens) ?? {})
      : {}

    // 引用块内的段落：首段去上 margin、末段去下 margin，避免引用内部上下留白过宽
    // （微信不支持 :first-child 等选择器，只能在渲染阶段按位置注入）。
    if (
      tag === 'p' &&
      parent &&
      parent.type === 'element' &&
      (parent as Element).tagName === 'blockquote'
    ) {
      const siblings = (parent as Element).children.filter(
        (c) => c.type === 'element',
      )
      if (siblings[0] === node) themeStyles.marginTop = '0'
      if (siblings[siblings.length - 1] === node) themeStyles.marginBottom = '0'
    }

    const customStyles = getCustomStyles(
      node,
      tokens,
    )

    const existing =
      typeof node.properties?.style === 'string'
        ? node.properties.style
        : undefined
    const merged = mergeStyle({ ...themeStyles, ...customStyles }, existing)
    if (merged) {
      node.properties = { ...node.properties, style: merged }
    }
  })

  return cloned
}
