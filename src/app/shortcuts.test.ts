import { describe, expect, it } from 'vitest'
import {
  getShortcutKeys,
  matchesShortcut,
  shortcutDefinitions,
} from './shortcuts.ts'

function keyboardEvent(init: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...init,
  } as KeyboardEvent
}

describe('shortcuts', () => {
  it('matches mod slash for help', () => {
    const helpShortcut = shortcutDefinitions.find((item) => item.id === 'help')!
    expect(
      matchesShortcut(
        keyboardEvent({ key: '/', ctrlKey: true }),
        helpShortcut,
      ),
    ).toBe(true)
  })

  it('matches mod alt n for new document', () => {
    const newShortcut = shortcutDefinitions.find((item) => item.id === 'new')!
    expect(
      matchesShortcut(
        keyboardEvent({ key: 'n', ctrlKey: true, altKey: true }),
        newShortcut,
      ),
    ).toBe(true)
  })

  it('does not match when required modifier is missing', () => {
    const copyShortcut = shortcutDefinitions.find((item) => item.id === 'copy')!
    expect(
      matchesShortcut(
        keyboardEvent({ key: 'c', ctrlKey: true }),
        copyShortcut,
      ),
    ).toBe(false)
  })

  it('returns platform specific key labels', () => {
    const resetShortcut = shortcutDefinitions.find((item) => item.id === 'reset')!
    expect(getShortcutKeys(resetShortcut, false)).toEqual(['Ctrl', 'Alt', 'R'])
    expect(getShortcutKeys(resetShortcut, true)).toEqual(['⌘', '⌥', 'R'])
  })
})
