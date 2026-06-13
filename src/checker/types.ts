import type { Root as HastRoot } from 'hast'

export type WarningLevel = 'warning' | 'info'

export interface CheckWarning {
  /** 规则 id */
  id: string
  level: WarningLevel
  message: string
  /** 命中次数（如有多处） */
  count?: number
}

/**
 * 一条兼容性规则：接收 themed hast，返回 0 或多条 warning。
 *
 * 规则以纯函数组织，新增规则只需 push 到 rules 数组。
 */
export interface CheckRule {
  id: string
  run: (tree: HastRoot) => CheckWarning[]
}
