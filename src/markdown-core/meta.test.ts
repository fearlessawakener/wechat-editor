import { describe, it, expect } from 'vitest'
import { extractMeta } from './meta.ts'

describe('extractMeta', () => {
  // ---------- 标签提取 ----------
  it('提取单个 CJK 标签', () => {
    const { meta, cleaned } = extractMeta('<原创>')
    expect(meta.tags).toEqual(['原创'])
    expect(cleaned).toBe('')
  })

  it('提取多个标签', () => {
    const { meta } = extractMeta('<原创> <干货> <教程>')
    expect(meta.tags).toEqual(['原创', '干货', '教程'])
  })

  it('过滤 HTML 标签（如 <div>）', () => {
    const { meta, cleaned } = extractMeta('<div>')
    expect(meta.tags).toEqual([])
    // HTML 标签保留在文本中
    expect(cleaned).toBe('<div>')
  })

  it('过滤标准 HTML 标签名但保留自定义名', () => {
    const { meta } = extractMeta('<span> <React> <原创>')
    // span 被过滤，React 和 原创 被提取
    expect(meta.tags).toEqual(['React', '原创'])
  })

  // ---------- 日期提取 ----------
  it('提取日期 ##YYYY-MM-DD##', () => {
    const { meta, cleaned } = extractMeta('##2026-06-16##')
    expect(meta.date).toBe('2026-06-16')
    expect(cleaned).toBe('')
  })

  it('日期不会被误判为作者', () => {
    const { meta } = extractMeta('##2026-06-16##')
    expect(meta.date).toBe('2026-06-16')
    expect(meta.author).toBeNull()
  })

  it('只取第一个日期', () => {
    const { meta } = extractMeta('##2026-06-16## ##2026-07-01##')
    expect(meta.date).toBe('2026-06-16')
  })

  // ---------- 作者提取 ----------
  it('提取作者 ##name##', () => {
    const { meta, cleaned } = extractMeta('##John##')
    expect(meta.author).toBe('John')
    expect(cleaned).toBe('')
  })

  it('提取中文作者名', () => {
    const { meta } = extractMeta('##小明##')
    expect(meta.author).toBe('小明')
  })

  it('只取第一个作者（非日期）', () => {
    const { meta } = extractMeta('##Alice## ##Bob##')
    expect(meta.author).toBe('Alice')
  })

  // ---------- 组合提取 ----------
  it('同时提取 tags + author + date', () => {
    const { meta } = extractMeta('<原创> ##Alice## ##2026-06-16##')
    expect(meta.tags).toEqual(['原创'])
    expect(meta.author).toBe('Alice')
    expect(meta.date).toBe('2026-06-16')
  })

  it('空输入返回空 meta', () => {
    const { meta, cleaned } = extractMeta('')
    expect(meta.tags).toEqual([])
    expect(meta.author).toBeNull()
    expect(meta.date).toBeNull()
    expect(cleaned).toBe('')
  })

  it('无 meta 语法的文本原样返回', () => {
    const input = '# Title\n\nSome content here.'
    const { meta, cleaned } = extractMeta(input)
    expect(meta.tags).toEqual([])
    expect(meta.author).toBeNull()
    expect(meta.date).toBeNull()
    expect(cleaned).toBe(input)
  })

  // ---------- 文本清理 ----------
  it('移除 meta 后保留正文', () => {
    const { cleaned } = extractMeta('<原创> ##Alice## 正文内容')
    expect(cleaned).toBe('正文内容')
  })

  it('保留 Markdown 结构', () => {
    const input = '# Title\n\n<原创>\n\n## Alice##\n\n正文段落。'
    const { cleaned, meta } = extractMeta(input)
    expect(meta.tags).toEqual(['原创'])
    expect(meta.author).toBe('Alice')
    expect(cleaned).toContain('# Title')
    expect(cleaned).toContain('正文段落。')
  })

  it('移除后压缩多余空行', () => {
    const { cleaned } = extractMeta('<原创>\n\n\n##Alice##\n\n\n正文')
    // 不应出现 3 个及以上的连续空行
    expect(cleaned).not.toMatch(/\n{3,}/)
    expect(cleaned).toContain('正文')
  })

  // ---------- 边界情况 ----------
  it('不匹配 ## 无闭合 ##', () => {
    const input = '## Heading'
    const { meta, cleaned } = extractMeta(input)
    expect(meta.author).toBeNull()
    expect(cleaned).toBe(input) // 标准 Markdown h2 不受影响
  })

  it('不匹配 ## 含换行的 ##...##', () => {
    const input = '## line1\nline2##'
    const { meta } = extractMeta(input)
    expect(meta.author).toBeNull()
  })

  it('处理只有空白字符的 ##...##', () => {
    const { meta } = extractMeta('##   ##')
    // 内容为空白，trim 后为空，不计为作者
    expect(meta.author).toBeNull()
  })

  it('meta 在同一行内', () => {
    const { meta } = extractMeta('<原创> <干货> ##Alice## ##2026-03-15##')
    expect(meta.tags).toEqual(['原创', '干货'])
    expect(meta.author).toBe('Alice')
    expect(meta.date).toBe('2026-03-15')
  })

  it('处理仅有标签无作者/日期', () => {
    const { meta } = extractMeta('<原创> <技术>')
    expect(meta.tags).toEqual(['原创', '技术'])
    expect(meta.author).toBeNull()
    expect(meta.date).toBeNull()
  })

  it('处理仅有作者/日期无标签', () => {
    const { meta } = extractMeta('##Alice## ##2026-06-16##')
    expect(meta.tags).toEqual([])
    expect(meta.author).toBe('Alice')
    expect(meta.date).toBe('2026-06-16')
  })

  // ---------- 误匹配防护 ----------
  it('不匹配超过 8 字符的标签名', () => {
    const { meta, cleaned } = extractMeta('<CopyResult>')
    expect(meta.tags).toEqual([])
    // 原文保留
    expect(cleaned).toBe('<CopyResult>')
  })

  it('不匹配含冒号的标签（防 URL）', () => {
    const { meta, cleaned } = extractMeta('<https://a.com>')
    expect(meta.tags).toEqual([])
    expect(cleaned).toBe('<https://a.com>')
  })

  it('不匹配含斜杠的标签', () => {
    const { meta, cleaned } = extractMeta('<br/>')
    expect(meta.tags).toEqual([])
    expect(cleaned).toBe('<br/>')
  })

  it('8 字符以内的有效标签正常提取', () => {
    const { meta } = extractMeta('<React> <Vue>')
    expect(meta.tags).toEqual(['React', 'Vue'])
  })
})
