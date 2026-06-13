import type { Properties as CssProperties } from 'csstype'

/**
 * 把 CssProperties 对象序列化为 inline style 字符串。
 *
 * - camelCase 转 kebab-case（marginTop → margin-top）
 * - 跳过 undefined / null
 * - 数字值按 React 习惯不自动加单位，这里要求调用方传带单位的字符串，
 *   裸数字直接 String() 输出（用于 line-height、font-weight 等无单位属性）。
 */
export function stylesToString(styles: CssProperties): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null || value === '') continue
    const prop = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    parts.push(`${prop}:${String(value)}`)
  }
  return parts.join(';')
}

/**
 * 解析已有的 inline style 字符串为 [prop, value] 列表，保序。
 */
export function parseStyleString(style: string): Array<[string, string]> {
  return style
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':')
      return [decl.slice(0, idx).trim(), decl.slice(idx + 1).trim()] as [
        string,
        string,
      ]
    })
    .filter(([prop]) => prop.length > 0)
}

/**
 * 合并主题样式与节点已有样式。
 *
 * 优先级：节点已有的 inline style 覆盖主题样式（后写覆盖先写）。
 * 这样主题作为基底，未来若某节点已带特定样式（如代码高亮的颜色）不会被主题抹掉。
 */
export function mergeStyle(
  themeStyles: CssProperties,
  existing: string | undefined,
): string {
  const merged = new Map<string, string>()
  for (const [prop, value] of parseStyleString(stylesToString(themeStyles))) {
    merged.set(prop, value)
  }
  if (existing) {
    for (const [prop, value] of parseStyleString(existing)) {
      merged.set(prop, value)
    }
  }
  return Array.from(merged, ([prop, value]) => `${prop}:${value}`).join(';')
}
