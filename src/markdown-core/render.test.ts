import { describe, it, expect } from 'vitest'
import { markdownToHtml } from './render.ts'
import { formatMarkdown } from './format.ts'

describe('markdownToHtml', () => {
  it('renders headings', () => {
    expect(markdownToHtml('# Hello')).toContain('<h1>Hello</h1>')
  })

  it('renders paragraphs and inline strong/em', () => {
    const html = markdownToHtml('a **b** _c_')
    expect(html).toContain('<strong>b</strong>')
    expect(html).toContain('<em>c</em>')
  })

  it('renders lists', () => {
    const html = markdownToHtml('- one\n- two')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>one</li>')
  })

  it('renders blockquote', () => {
    expect(markdownToHtml('> quote')).toContain('<blockquote>')
  })

  it('renders inline code and code block', () => {
    expect(markdownToHtml('`code`')).toContain('<code>code</code>')
    const block = markdownToHtml('```js\nconst a = 1\n```')
    expect(block).toContain('<pre>')
    expect(block).toContain('<code')
  })

  it('renders links', () => {
    expect(markdownToHtml('[t](https://example.com)')).toContain(
      '<a href="https://example.com">t</a>',
    )
  })

  it('renders images', () => {
    expect(markdownToHtml('![alt](https://example.com/a.png)')).toContain(
      '<img',
    )
  })

  it('renders gfm tables', () => {
    const html = markdownToHtml('| a | b |\n| - | - |\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>a</th>')
  })

  it('renders thematic break', () => {
    expect(markdownToHtml('---')).toContain('<hr>')
  })
})

describe('sanitize', () => {
  it('strips script tags', () => {
    const html = markdownToHtml('<script>alert(1)</script>')
    expect(html).not.toContain('<script')
  })

  it('strips event handler attributes', () => {
    // remark 默认把内嵌 HTML 当作 raw 文本，sanitize 再兜底，
    // 无论哪条路径，onerror 都不应出现在输出里。
    const html = markdownToHtml('<img src=x onerror="alert(1)">')
    expect(html).not.toContain('onerror')
  })
})

describe('formatMarkdown', () => {
  it('normalizes list bullets to dash', () => {
    expect(formatMarkdown('* a\n* b')).toContain('- a')
  })

  it('is idempotent', () => {
    const once = formatMarkdown('# Title\n\ntext\n')
    expect(formatMarkdown(once)).toBe(once)
  })
})
