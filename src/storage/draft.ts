import type { ThemeTokens, WindowStyle } from '../themes'

/** 草稿数据结构。tokenOverrides 为 Phase 7 微调预留。 */
export interface Draft {
  source: string
  themeId: string
  tokenOverrides?: Partial<ThemeTokens>
  /** 代码高亮主题 id，缺失时由 App 兜默认值 */
  codeThemeId?: string
  /** 代码块窗口装饰风格，缺失时由 App 兜默认值 */
  windowStyle?: WindowStyle
}

const KEY = 'wechat-editor:draft'
const VERSION = 1

interface StoredDraft extends Draft {
  __v: number
}

/** 读取草稿；不存在或解析失败返回 null。 */
export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft
    if (parsed.__v !== VERSION) return null
    if (typeof parsed.source !== 'string') return null
    return {
      source: parsed.source,
      themeId: typeof parsed.themeId === 'string' ? parsed.themeId : '',
      tokenOverrides: parsed.tokenOverrides,
      codeThemeId:
        typeof parsed.codeThemeId === 'string' ? parsed.codeThemeId : undefined,
      windowStyle:
        parsed.windowStyle === 'mac' || parsed.windowStyle === 'win'
          ? parsed.windowStyle
          : undefined,
    }
  } catch {
    return null
  }
}

/** 保存草稿。localStorage 异常（隐私模式/超额）时静默失败。 */
export function saveDraft(draft: Draft): void {
  try {
    const stored: StoredDraft = { __v: VERSION, ...draft }
    localStorage.setItem(KEY, JSON.stringify(stored))
  } catch {
    // 忽略：持久化失败不应阻断编辑。
  }
}

/** 清空草稿。 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // 忽略
  }
}
