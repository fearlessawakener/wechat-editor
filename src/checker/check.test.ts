import { describe, it, expect } from 'vitest'
import { markdownToHast } from '../markdown-core'
import { renderThemedHast } from '../themes'
import { defaultTheme } from '../themes'
import { checkCompatibility } from './check.ts'
import type { Root as HastRoot, Element } from 'hast'

function themed(md: string): HastRoot {
  return renderThemedHast(markdownToHast(md), defaultTheme)
}

describe('checkCompatibility', () => {
  it('no warnings for clean themed output', () => {
    const warnings = checkCompatibility(themed('# Hi\n\npara\n\n- a'))
    // themed 输出已无 class/style 标签，常规内容应无 warning。
    const ids = warnings.map((w) => w.id)
    expect(ids).not.toContain('no-class')
    expect(ids).not.toContain('no-style-script')
    expect(ids).not.toContain('unsupported-tag')
  })

  it('flags external images as info', () => {
    const warnings = checkCompatibility(
      themed('![a](https://example.com/x.png)'),
    )
    const img = warnings.find((w) => w.id === 'external-image')
    expect(img).toBeDefined()
    expect(img?.level).toBe('info')
  })

  it('flags residual class', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: { className: ['foo'] },
          children: [],
        } as Element,
      ],
    }
    const warnings = checkCompatibility(tree)
    expect(warnings.some((w) => w.id === 'no-class')).toBe(true)
  })

  it('flags style and script tags', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'style', properties: {}, children: [] },
        { type: 'element', tagName: 'script', properties: {}, children: [] },
      ] as Element[],
    }
    const warnings = checkCompatibility(tree)
    expect(warnings.filter((w) => w.id === 'no-style-script').length).toBe(2)
  })

  it('flags unsupported tags', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'marquee', properties: {}, children: [] },
      ] as Element[],
    }
    const warnings = checkCompatibility(tree)
    expect(warnings.some((w) => w.id === 'unsupported-tag')).toBe(true)
  })
})
