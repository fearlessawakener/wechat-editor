import { describe, it, expect, beforeEach } from 'vitest'
import { loadDraft, saveDraft, clearDraft } from './draft.ts'

describe('draft storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when empty', () => {
    expect(loadDraft()).toBeNull()
  })

  it('round-trips a draft', () => {
    saveDraft({ source: '# Hi', themeId: 'elegant' })
    const draft = loadDraft()
    expect(draft?.source).toBe('# Hi')
    expect(draft?.themeId).toBe('elegant')
  })

  it('clears a draft', () => {
    saveDraft({ source: 'x', themeId: 'classic' })
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('ignores corrupted json', () => {
    localStorage.setItem('wechat-editor:draft', '{not json')
    expect(loadDraft()).toBeNull()
  })

  it('ignores version mismatch', () => {
    localStorage.setItem(
      'wechat-editor:draft',
      JSON.stringify({ __v: 999, source: 'x', themeId: 'classic' }),
    )
    expect(loadDraft()).toBeNull()
  })

  it('persists tokenOverrides', () => {
    saveDraft({
      source: 'x',
      themeId: 'classic',
      tokenOverrides: { fontSize: '17px' },
    })
    expect(loadDraft()?.tokenOverrides?.fontSize).toBe('17px')
  })
})
