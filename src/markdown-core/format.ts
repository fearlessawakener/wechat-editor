import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'

/**
 * 一键格式化：用 remark 解析后重新序列化，规范化 Markdown 源文本。
 *
 * 统一列表符号、强调符号、表格对齐等，不改变语义。
 */
const formatter = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: '-',
    emphasis: '_',
    strong: '*',
    listItemIndent: 'one',
    rule: '-',
  })

export function formatMarkdown(markdown: string): string {
  return formatter.processSync(markdown).toString()
}
