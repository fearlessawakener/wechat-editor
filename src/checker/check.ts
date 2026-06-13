import type { Root as HastRoot } from 'hast'
import type { CheckWarning } from './types.ts'
import { rules } from './rules.ts'

/** 对 themed hast 跑全部兼容性规则，汇总 warning。 */
export function checkCompatibility(tree: HastRoot): CheckWarning[] {
  return rules.flatMap((rule) => rule.run(tree))
}
