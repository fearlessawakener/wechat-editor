/**
 * 文章 meta 信息提取模块。
 *
 * 在 Markdown 进入 unified 管线之前，从原始文本中扫描自定义 meta 语法，
 * 提取后将其从文本移除。这样 remark-parse 不会看到这些语法，
 * 规避了 `##text##` 被解析为 h2 的问题。
 *
 * 支持的自定义语法：
 * - `<tag>`   标签（如 `<原创>`、`<干货>`）
 * - `##YYYY-MM-DD##`  日期
 * - `##name##`  作者
 */

/** 常见的 HTML 标签名，不应被当作 meta tag 提取。 */
const HTML_TAG_BLACKLIST = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
  'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
  'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins',
  'kbd',
  'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'meta', 'meter',
  'nav', 'noscript',
  'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'picture', 'pre', 'progress',
  'q',
  'rp', 'rt', 'ruby',
  's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
  'strong', 'style', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'title', 'tr', 'track',
  'u', 'ul',
  'var', 'video',
  'wbr',
])

export interface ArticleMeta {
  /** 从 `<tag>` 语法提取的标签列表，如 ['原创', '干货'] */
  tags: string[]
  /** 作者名（第一个非日期的 `##...##` 匹配），无则为 null */
  author: string | null
  /** 日期字符串（`##YYYY-MM-DD##`），无则为 null */
  date: string | null
}

export interface ExtractResult {
  /** 移除 meta 语法片段后的干净 Markdown 文本 */
  cleaned: string
  /** 提取的 meta 信息 */
  meta: ArticleMeta
}

/**
 * 从原始 Markdown 文本中提取 meta 信息，返回清理后的文本。
 *
 * 提取顺序很重要：
 * 1. 先提取 `<tag>` — 短标签语法
 * 2. 再提取 `##YYYY-MM-DD##` — 日期
 * 3. 最后提取剩余 `##...##` — 作者
 *
 * 这样日期不会被误判为作者名。
 */
export function extractMeta(raw: string): ExtractResult {
  const tags: string[] = []
  let author: string | null = null
  let date: string | null = null

  let cleaned = raw

  // Step 1: 提取 <tag>
  // 约束：1-8 个字符，以字母/中文开头，不含空格、冒号、斜杠。
  // 避免误匹配 URL（含 ://）和过长的技术名词（如 CopyResult）。
  cleaned = cleaned.replace(
    /<([a-zA-Z一-鿿][^\s>:/]{0,7})>/g,
    (_match, tag: string) => {
      if (HTML_TAG_BLACKLIST.has(tag.toLowerCase())) {
        return _match // HTML 标签保留原文不动
      }
      tags.push(tag)
      return ''
    },
  )

  // Step 2: 提取日期 ##YYYY-MM-DD##（在通用 ##...## 之前）
  cleaned = cleaned.replace(
    /##(\d{4}-\d{2}-\d{2})##/g,
    (_match, d: string) => {
      if (!date) date = d
      return ''
    },
  )

  // Step 3: 提取作者 ##...##（剩余的非空匹配，取第一个）
  cleaned = cleaned.replace(/##([^#\n]+?)##/g, (_match, content: string) => {
    const trimmed = content.trim()
    if (!author && trimmed) {
      author = trimmed
    }
    return ''
  })

  // Step 4: 清理多余空白
  cleaned = cleaned.trim()
  // 合并 3 个及以上的连续空行为 2 个（保留段落间的一个空行）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  return { cleaned, meta: { tags, author, date } }
}
