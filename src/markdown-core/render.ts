import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import { toHtml } from 'hast-util-to-html'
import type {
  Root as HastRoot,
  RootContent as HastRootContent,
  Element,
  ElementContent,
  Text,
} from 'hast'
import { wechatSanitizeSchema } from './sanitize-schema.ts'

/**
 * Markdown → 安全 hast 的渲染管线。
 *
 * 设计要点（见 docs/roadmap.md 核心约束）：
 * - 统一产出 hast(root)，preview 与 export 共用同一棵树，避免两条链路不一致。
 * - sanitize 使用微信友好白名单（放行 style，移除 class）。
 * - 这里不做主题样式注入；inline style 由 Phase 3 在本 hast 上完成。
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm, { singleTilde: false })
  .use(remarkRehype)
  .use(rehypeSanitize, wechatSanitizeSchema)

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocTreeNode extends TocItem {
  children: TocTreeNode[]
}

const INTERNAL_DATA_PREFIX = 'data-md-'

function createTextNode(value: string): Text {
  return { type: 'text', value }
}

function createElement(
  tagName: string,
  children: ElementContent[],
  properties?: Element['properties'],
): Element {
  return { type: 'element', tagName, properties: properties ?? {}, children }
}

function parseInlineSyntax(value: string): ElementContent[] {
  const pattern = /==([^=\n]+)==|\+\+([^+\n]+)\+\+|~([^~\n]+)~/g
  const nodes: ElementContent[] = []
  let lastIndex = 0

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      nodes.push(createTextNode(value.slice(lastIndex, index)))
    }

    if (match[1]) {
      nodes.push(
        createElement('span', [createTextNode(match[1])], {
          style: 'background-color:#fff3a3;padding:0 2px;',
        }),
      )
    } else if (match[2]) {
      nodes.push(createElement('u', [createTextNode(match[2])]))
    } else if (match[3]) {
      nodes.push(
        createElement('span', [createTextNode(match[3])], {
          'data-md-wavy': 'true',
          style:
            'text-decoration-line:underline;text-decoration-style:wavy;' +
            'text-decoration-thickness:1.5px;text-underline-offset:2px;',
        }),
      )
    }

    lastIndex = index + match[0].length
  }

  if (lastIndex === 0) return [createTextNode(value)]
  if (lastIndex < value.length) {
    nodes.push(createTextNode(value.slice(lastIndex)))
  }
  return nodes
}

function transformInlineSyntax(node: HastRoot | Element, inCode = false): void {
  for (const child of node.children) {
    if (child.type !== 'element') continue
    transformInlineSyntax(
      child,
      inCode || child.tagName === 'code' || child.tagName === 'pre',
    )
  }

  if (inCode) return

  if (node.type === 'root') {
    node.children = node.children.flatMap((child): HastRootContent[] => {
      if (child.type !== 'text') return [child]
      return parseInlineSyntax(child.value)
    })
    return
  }

  node.children = node.children.flatMap((child): ElementContent[] => {
    if (child.type !== 'text') return [child]
    return parseInlineSyntax(child.value)
  })
}

function getTextContent(node: HastRootContent | ElementContent): string {
  if (node.type === 'text') return node.value
  if (node.type !== 'element') return ''
  return node.children.map((child) => getTextContent(child)).join('')
}

function buildSlug(text: string, fallbackIndex: number, seen: Map<string, number>): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')

  const base = normalized || `section-${fallbackIndex}`
  const hit = (seen.get(base) ?? 0) + 1
  seen.set(base, hit)
  return hit === 1 ? base : `${base}-${hit}`
}

function collectTocItemsAndSetHeadingIds(tree: HastRoot): TocItem[] {
  const items: TocItem[] = []
  const seen = new Map<string, number>()
  let headingIndex = 0

  function walk(node: HastRoot | Element): void {
    for (const child of node.children) {
      if (child.type !== 'element') continue

      if (/^h[1-6]$/.test(child.tagName)) {
        headingIndex += 1
        const level = Number(child.tagName[1])
        const text = getTextContent(child).trim()
        const id = buildSlug(text, headingIndex, seen)
        child.properties = { ...child.properties, id }
        if (level >= 2 && text) {
          items.push({ id, text, level })
        }
      }

      walk(child)
    }
  }

  walk(tree)
  return items
}

function buildTocTree(items: TocItem[]): TocTreeNode[] {
  const roots: TocTreeNode[] = []
  const stack: TocTreeNode[] = []

  for (const item of items) {
    const node: TocTreeNode = { ...item, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      roots.push(node)
    } else {
      stack[stack.length - 1].children.push(node)
    }

    stack.push(node)
  }

  return roots
}

function renderTocNodes(
  nodes: TocTreeNode[],
  ancestorHasNext: boolean[] = [],
): Element[] {
  return nodes.map((node, index) => {
    const isLast = index === nodes.length - 1
    const prefix = ancestorHasNext.length === 0
      ? ''
      : ancestorHasNext
          .map((hasNext) => (hasNext ? '│  ' : '   '))
          .join('') + (isLast ? '└─ ' : '├─ ')

    const children: ElementContent[] = [
      createElement(
        'a',
        [
          createElement('span', [createTextNode(prefix)], {
            'data-md-toc-prefix': 'true',
          }),
          createTextNode(node.text),
        ],
        {
          href: `#${node.id}`,
          'data-md-toc-link': 'true',
        },
      ),
    ]

    if (node.children.length > 0) {
      children.push(
        createElement(
          'ul',
          renderTocNodes(node.children, [...ancestorHasNext, !isLast]),
          { 'data-md-toc-list': 'true' },
        ),
      )
    }

    return createElement('li', children, { 'data-md-toc-item': 'true' })
  })
}

function buildTocList(items: TocItem[]): Element {
  return createElement('section', [
    createElement('section', [createTextNode('目录导航')], {
      'data-md-toc-label': 'true',
    }),
    createElement(
      'ul',
      renderTocNodes(buildTocTree(items)),
      { 'data-md-toc-list': 'true' },
    ),
  ])
}

function replaceTocPlaceholders(tree: HastRoot, items: TocItem[]): void {
  function walk(node: HastRoot | Element): void {
    if (node.type === 'root') {
      node.children = node.children.flatMap((child): HastRootContent[] => {
        if (
          child.type === 'element' &&
          child.tagName === 'p' &&
          child.children.length === 1 &&
          child.children[0].type === 'text' &&
          child.children[0].value.trim() === '[TOC]'
        ) {
          if (items.length === 0) return []
          return [
            createElement('section', [buildTocList(items)], {
              'data-md-toc': 'true',
            }),
          ]
        }

        if (child.type === 'element') walk(child)
        return [child]
      })
      return
    }

    node.children = node.children.flatMap((child): ElementContent[] => {
      if (
        child.type === 'element' &&
        child.tagName === 'p' &&
        child.children.length === 1 &&
        child.children[0].type === 'text' &&
        child.children[0].value.trim() === '[TOC]'
      ) {
        if (items.length === 0) return []
        return [
          createElement('section', [buildTocList(items)], {
            'data-md-toc': 'true',
          }),
        ]
      }

      if (child.type === 'element') walk(child)
      return [child]
    })
  }

  walk(tree)
}

function applyCustomMarkdownExtensions(tree: HastRoot): HastRoot {
  transformInlineSyntax(tree)
  const tocItems = collectTocItemsAndSetHeadingIds(tree)
  replaceTocPlaceholders(tree, tocItems)
  return tree
}

function stripInternalDataAttributes(node: HastRoot | Element): void {
  for (const child of node.children) {
    if (child.type === 'element') stripInternalDataAttributes(child)
  }

  if ('properties' in node && node.properties) {
    for (const key of Object.keys(node.properties)) {
      if (key.startsWith(INTERNAL_DATA_PREFIX)) {
        delete node.properties[key]
      }
    }
  }
}

/** 把 Markdown 源文本解析为安全的 hast root。 */
export function markdownToHast(markdown: string): HastRoot {
  const mdast = processor.parse(markdown)
  // runSync 执行 transformer（remark-rehype + sanitize），得到 hast。
  return applyCustomMarkdownExtensions(processor.runSync(mdast) as HastRoot)
}

/** 把 hast root 序列化为 HTML 字符串（供导出/复制使用）。 */
export function hastToHtml(tree: HastRoot): string {
  const cloned = structuredClone(tree)
  stripInternalDataAttributes(cloned)
  return toHtml(cloned)
}

/** 便捷方法：Markdown 源文本直接转 HTML 字符串。 */
export function markdownToHtml(markdown: string): string {
  return hastToHtml(markdownToHast(markdown))
}
