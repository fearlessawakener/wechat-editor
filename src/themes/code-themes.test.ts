import { describe, it, expect } from 'vitest'
import { markdownToHast, hastToHtml } from '../markdown-core'
import { renderThemedHast } from './render-themed.ts'
import { defaultTheme } from './themes.ts'
import { getCodeThemeById } from './code-themes.ts'

function renderCode(md: string, codeThemeId: string, windowStyle: 'mac' | 'win') {
  const tree = markdownToHast(md)
  const themed = renderThemedHast(
    tree,
    defaultTheme,
    undefined,
    getCodeThemeById(codeThemeId),
    windowStyle,
  )
  return hastToHtml(themed)
}

const SAMPLE = '```js\nconst a = 1\n```'

describe('code-themes', () => {
  it('applies atom-one-dark background and token colors', () => {
    const html = renderCode(SAMPLE, 'atom-one-dark', 'mac')
    expect(html).toContain('background:#282c34')
    // keyword `const` 应着 atom-one-dark 的 keyword 色
    expect(html).toContain('#c678dd')
  })

  it('applies atom-one-light background and token colors', () => {
    const html = renderCode(SAMPLE, 'atom-one-light', 'mac')
    expect(html).toContain('background:#fafafa')
    expect(html).toContain('#a626a4')
  })

  it('renders language label in titlebar', () => {
    const html = renderCode(SAMPLE, 'atom-one-dark', 'mac')
    expect(html).toContain('>js<')
  })

  it('mac style renders three traffic-light dots', () => {
    const html = renderCode(SAMPLE, 'atom-one-dark', 'mac')
    expect(html).toContain('#ff5f56')
    expect(html).toContain('#ffbd2e')
    expect(html).toContain('#27c93f')
  })

  it('win style renders control glyphs', () => {
    const html = renderCode(SAMPLE, 'atom-one-dark', 'win')
    expect(html).toContain('✕')
  })

  it('never emits class on code blocks', () => {
    const html = renderCode(SAMPLE, 'atom-one-dark', 'mac')
    expect(html).not.toContain('class=')
    expect(html).not.toContain('hljs')
  })

  it('falls back to default code theme for unknown id', () => {
    const html = renderCode(SAMPLE, 'nope', 'mac')
    expect(html).toContain('background:#282c34')
  })
})
