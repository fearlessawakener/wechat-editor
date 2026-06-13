import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyHtml } from './copy.ts'

describe('copyHtml', () => {
  beforeEach(() => {
    // jsdom 默认无 ClipboardItem / clipboard.write，确保走降级。
    vi.stubGlobal('ClipboardItem', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('falls back to execCommand when Clipboard API unavailable', async () => {
    const exec = vi.fn().mockReturnValue(true)
    // jsdom 未实现 execCommand，挂一个 mock。
    document.execCommand = exec as unknown as typeof document.execCommand

    const result = await copyHtml('<p style="color:red">hi</p>', 'hi')
    expect(result.ok).toBe(true)
    expect(result.fallback).toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
  })

  it('reports failure when execCommand returns false', async () => {
    document.execCommand = vi
      .fn()
      .mockReturnValue(false) as unknown as typeof document.execCommand

    const result = await copyHtml('<p>hi</p>', 'hi')
    expect(result.ok).toBe(false)
    expect(result.fallback).toBe(true)
  })

  it('prefers Clipboard API when available', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal(
      'ClipboardItem',
      class {
        constructor(_items: unknown) {
          void _items
        }
      },
    )
    vi.stubGlobal('navigator', { clipboard: { write } })

    const result = await copyHtml('<p>hi</p>', 'hi')
    expect(result.ok).toBe(true)
    expect(result.fallback).toBe(false)
    expect(write).toHaveBeenCalledOnce()
  })
})
