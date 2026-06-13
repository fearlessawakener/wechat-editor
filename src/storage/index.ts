// storage 模块：负责草稿保存（localStorage）。
export { loadDraft, saveDraft, clearDraft } from './draft.ts'
export type { Draft } from './draft.ts'
export { useDebouncedSave } from './useDebouncedSave.ts'
