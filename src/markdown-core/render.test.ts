import { describe, it, expect } from 'vitest'
import { markdownToHtml } from './render.ts'
import { formatMarkdown } from './format.ts'

describe('markdownToHtml', () => {
  it('renders headings', () => {
    expect(markdownToHtml('# Hello')).toContain('<h1 id="hello">Hello</h1>')
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

  it('renders custom highlight, underline and wavy underline syntax', () => {
    const html = markdownToHtml('==高亮== ++下划线++ ~波浪线~')
    expect(html).toContain('background-color:#fff3a3')
    expect(html).toContain('<u>下划线</u>')
    expect(html).toContain('text-decoration-style:wavy')
    expect(html).toContain('>波浪线</span>')
  })

  it('keeps double-tilde strikethrough', () => {
    expect(markdownToHtml('~~删除线~~')).toContain('<del>删除线</del>')
  })

  it('renders toc from h2-h6 headings and skips h1', () => {
    const html = markdownToHtml(
      '# Title\n\n[TOC]\n\n## Intro\n\n### Detail\n\n## End',
    )
    expect(html).toContain('<h1 id="title">Title</h1>')
    expect(html).toContain('<h2 id="intro">Intro</h2>')
    expect(html).toContain('<h3 id="detail">Detail</h3>')
    expect(html).toContain('<section>目录导航</section>')
    expect(html).toContain('<a href="#intro">')
    expect(html).toContain('<a href="#detail">')
    expect(html).toContain('<a href="#end">')
    expect(html).toContain('Intro</a>')
    expect(html).toContain('Detail</a>')
    expect(html).toContain('End</a>')
    expect(html).toContain('└─ ')
    expect(html).not.toContain('<span>├─ </span>Intro')
    expect(html).not.toContain('<span>└─ </span>Intro')
    expect(html).not.toContain('<span>├─ </span>End')
    expect(html).not.toContain('<span>└─ </span>End')
    expect(html).not.toContain('<a href="#title">Title</a>')
    expect(html).not.toContain('<p>[TOC]</p>')
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
