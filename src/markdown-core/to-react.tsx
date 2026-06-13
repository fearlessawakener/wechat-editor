import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import type { Root as HastRoot } from 'hast'
import type { ReactNode } from 'react'

/**
 * 把 hast root 渲染为 React 节点，供预览区使用。
 *
 * 预览与导出共用同一棵 hast：导出走 hastToHtml，预览走这里，
 * 保证「所见即所得」，避免预览正常但粘贴错乱。
 */
export function hastToReact(tree: HastRoot): ReactNode {
  return toJsxRuntime(tree, { Fragment, jsx, jsxs })
}
