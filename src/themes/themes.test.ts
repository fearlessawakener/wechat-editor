import { describe, it, expect } from 'vitest'
import { markdownToHast, hastToHtml, extractMeta } from '../markdown-core'
import { renderThemedHast } from './render-themed.ts'
import { defaultTheme, getThemeById } from './themes.ts'
import { stylesToString, mergeStyle } from './style-utils.ts'
import { injectMetaBar } from './meta-bar.ts'
import type { ThemeTokens } from './tokens.ts'

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

describe('injectMetaBar', () => {
  const tokens: ThemeTokens = defaultTheme.tokens

  function themedHtml(md: string, overrides?: Partial<ThemeTokens>): string {
    const tree = markdownToHast(md)
    const themed = renderThemedHast(tree, defaultTheme, overrides)
    return hastToHtml(themed)
  }

  function fullRender(md: string, overrides?: Partial<ThemeTokens>): string {
    const { cleaned, meta } = extractMeta(md)
    const mergedTokens = { ...tokens, ...overrides }
    const tree = markdownToHast(cleaned)
    const themed = renderThemedHast(tree, defaultTheme, overrides)
    const withMeta = injectMetaBar(themed, meta, mergedTokens)
    return hastToHtml(withMeta)
  }

  it('在 h1 后注入 meta section', () => {
    const html = fullRender('# Title\n<原创>')
    expect(html).toMatch(/<h1 [^>]*>Title<\/h1>/)
    // meta bar section 应在 h1 之后
    expect(html).toMatch(/<\/h1><section style="[^"]*display:flex/)
  })

  it('无 h1 时不注入', () => {
    const html = fullRender('just a paragraph <原创>')
    expect(html).not.toContain('display:flex')
  })

  it('无 meta 时空操作', () => {
    const html = fullRender('# Title\n\nContent')
    expect(html).not.toContain('border-bottom')
  })

  it('标签使用 primaryColor 作徽章背景', () => {
    const html = fullRender('# Title\n<原创>')
    expect(html).toContain(`background:${tokens.primaryColor}`)
    expect(html).toContain('color:#fff')
  })

  it('作者使用 blockquoteColor', () => {
    const html = fullRender('# Title\n##Alice##')
    expect(html).toContain(tokens.blockquoteColor)
    expect(html).toContain('Alice')
  })

  it('日期使用 blockquoteColor', () => {
    const html = fullRender('# Title\n##2026-06-16##')
    expect(html).toContain('2026-06-16')
    expect(html).toContain(tokens.blockquoteColor)
  })

  it('同时渲染 tags + author + date', () => {
    const html = fullRender('# Title\n<原创> ##Alice## ##2026-06-16##')
    expect(html).toContain('原创')
    expect(html).toContain('Alice')
    expect(html).toContain('2026-06-16')
  })

  it('使用 borderColor 作底部分隔线', () => {
    const html = fullRender('# Title\n<原创>')
    expect(html).toContain(`border-bottom:1px solid ${tokens.borderColor}`)
  })

  it('不输出 class 属性', () => {
    const html = fullRender('# Title\n<原创> ##Alice##')
    expect(html).not.toContain('class=')
  })

  it('微调覆盖的 primaryColor 生效', () => {
    const html = fullRender('# Title\n<原创>', { primaryColor: '#ff0000' })
    expect(html).toContain('background:#ff0000')
    expect(html).not.toContain(`background:${tokens.primaryColor}`)
  })

  it('只有 tags 时正常渲染（无右侧）', () => {
    const html = fullRender('# Title\n<原创> <干货>')
    expect(html).toContain('原创')
    expect(html).toContain('干货')
    // 不应有 margin-left:auto（右侧容器不存在）
    // 但 flex 容器依然存在
    expect(html).toMatch(/display:flex/)
  })

  it('只有 author 时正常渲染（无左侧 tags）', () => {
    const html = fullRender('# Title\n##Alice##')
    expect(html).toContain('Alice')
    expect(html).not.toContain('原创')
  })

  it('h1 字号为 28px', () => {
    const html = themedHtml('# Title')
    expect(html).toContain('font-size:28px')
  })
})
