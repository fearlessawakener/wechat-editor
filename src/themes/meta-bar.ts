/**
 * 文章 meta bar 注入插件。
 *
 * 在 themed hast 树中找到第一个 `<h1>`，在其后插入一行 meta 信息栏：
 * - 左侧：标签徽章（primaryColor 圆角药丸）
 * - 右侧：作者 + 日期（textColor 文字）
 * - 底部：borderColor 分隔线
 *
 * 全 inline style，无 class，微信正文兼容。
 */
import { visit } from 'unist-util-visit'
import type { Root as HastRoot, Element } from 'hast'
import type { ArticleMeta } from '../markdown-core/meta.ts'
import type { ThemeTokens } from './tokens.ts'

/**
 * 把 meta 信息注入为 h1 下方的样式化 section。
 *
 * 原地修改 tree。若 meta 全为空或未找到 h1 则无操作。
 *
 * @param tree   themed hast 树（post-applyTheme）
 * @param meta   从 Markdown 提取的 meta 信息
 * @param tokens 合并后的主题 tokens（base + overrides）
 */
export function injectMetaBar(
  tree: HastRoot,
  meta: ArticleMeta,
  tokens: ThemeTokens,
): HastRoot {
  // 无 meta 信息则跳过
  if (!meta.tags.length && !meta.author && !meta.date) return tree

  let injected = false
  visit(tree, 'element', (node: Element, index, parent) => {
    if (injected) return
    if (node.tagName !== 'h1') return
    if (!parent || index === undefined) return

    const bar = buildMetaBar(meta, tokens)
    parent.children.splice(index + 1, 0, bar)
    injected = true
  })

  return tree
}

/** 组装 meta bar 的 hast 元素树。 */
function buildMetaBar(meta: ArticleMeta, t: ThemeTokens): Element {
  const children: Element[] = []

  // --- 左侧：标签徽章 ---
  if (meta.tags.length > 0) {
    const tagSpans: Element[] = meta.tags.map((tag) => ({
      type: 'element',
      tagName: 'span',
      properties: {
        style:
          `display:inline-block;padding:2px 10px;` +
          `border-radius:11px;background:${t.primaryColor};` +
          `color:#fff;font-size:12px;line-height:1.6;` +
          `white-space:nowrap`,
      },
      children: [{ type: 'text', value: tag }],
    }))

    children.push({
      type: 'element',
      tagName: 'span',
      properties: {
        style:
          'display:flex;align-items:center;gap:8px;flex-wrap:wrap',
      },
      children: tagSpans,
    })
  }

  // --- 右侧：作者 + 日期 ---
  const rightItems: Element[] = []

  if (meta.author) {
    rightItems.push({
      type: 'element',
      tagName: 'span',
      properties: {
        style:
          `display:flex;align-items:center;gap:4px;` +
          `color:${t.blockquoteColor};font-size:13px;white-space:nowrap`,
      },
      children: [
        { type: 'text', value: '✍️ ' + meta.author },
      ],
    })
  }

  if (meta.date) {
    // 若已有 author，在 date 前插入分隔符
    if (rightItems.length > 0) {
      rightItems.push({
        type: 'element',
        tagName: 'span',
        properties: {
          style: `color:${t.borderColor};font-size:13px`,
        },
        children: [{ type: 'text', value: '·' }],
      })
    }

    rightItems.push({
      type: 'element',
      tagName: 'span',
      properties: {
        style:
          `display:flex;align-items:center;gap:4px;` +
          `color:${t.blockquoteColor};font-size:13px;white-space:nowrap`,
      },
      children: [
        { type: 'text', value: '📅 ' + meta.date },
      ],
    })
  }

  if (rightItems.length > 0) {
    children.push({
      type: 'element',
      tagName: 'span',
      properties: {
        style:
          'display:flex;align-items:center;gap:10px;' +
          'flex-shrink:0;margin-left:auto',
      },
      children: rightItems,
    })
  }

  // --- Meta bar 容器 ---
  return {
    type: 'element',
    tagName: 'section',
    properties: {
      style:
        `display:flex;justify-content:space-between;align-items:center;` +
        `padding:8px 0 12px;margin:0 0 20px;` +
        `border-bottom:1px solid ${t.borderColor};` +
        `font-size:14px;flex-wrap:wrap;gap:8px`,
    },
    children,
  }
}
