import { describe, it, expect } from 'vitest'
import { markdownToHast, hastToHtml } from '../markdown-core'
import { renderThemedHast } from './render-themed.ts'
import { defaultTheme, getThemeById } from './themes.ts'
import { stylesToString, mergeStyle } from './style-utils.ts'

function render(md: string, themeId = 'classic'): string {
  const tree = markdownToHast(md)
  const themed = renderThemedHast(tree, getThemeById(themeId))
  return hastToHtml(themed)
}

describe('style-utils', () => {
  it('serializes camelCase to kebab-case', () => {
    expect(stylesToString({ marginTop: '4px', color: 'red' })).toBe(
      'margin-top:4px;color:red',
    )
  })

  it('lets existing style override theme style', () => {
    const merged = mergeStyle({ color: 'red' }, 'color:blue')
    expect(merged).toBe('color:blue')
  })
})

describe('renderThemedHast', () => {
  it('injects inline style on block elements', () => {
    const html = render('# Hi\n\npara')
    expect(html).toMatch(/<h1 style="[^"]+">/)
    expect(html).toMatch(/<p style="[^"]+">/)
  })

  it('never emits class attributes', () => {
    const html = render('# Hi\n\n```js\nconst a = 1\n```\n\n- x')
    expect(html).not.toContain('class=')
    expect(html).not.toContain('className')
  })

  it('never emits style tags', () => {
    const html = render('# Hi\n\npara')
    expect(html).not.toContain('<style')
  })

  it('inlines code highlight colors', () => {
    const html = render('```js\nconst a = 1\n```')
    // 高亮后关键字/字面量应带 inline color，且不应有 hljs class
    expect(html).not.toContain('hljs')
    expect(html).toMatch(/color:#[0-9a-f]{6}/i)
  })

  it('applies different primary color per theme', () => {
    const classic = render('## Title', 'classic')
    const elegant = render('## Title', 'elegant')
    expect(classic).toContain('#07c160')
    expect(elegant).toContain('#5b6cf0')
  })

  it('does not mutate the input tree', () => {
    const tree = markdownToHast('# Hi')
    const before = hastToHtml(tree)
    renderThemedHast(tree, defaultTheme)
    const after = hastToHtml(tree)
    expect(after).toBe(before)
  })

  it('applies token overrides (tuning)', () => {
    const tree = markdownToHast('para')
    const base = hastToHtml(renderThemedHast(tree, defaultTheme))
    const tuned = hastToHtml(
      renderThemedHast(tree, defaultTheme, { fontSize: '19px' }),
    )
    expect(base).not.toContain('font-size:19px')
    expect(tuned).toContain('font-size:19px')
  })
})
