import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import { toHtml } from 'hast-util-to-html'
import type { Root as HastRoot } from 'hast'
import { wechatSanitizeSchema } from './sanitize-schema.ts'

/**
 * Markdown → 安全 hast 的渲染管线。
 *
 * 设计要点（见 docs/roadmap.md 核心约束）：
 * - 统一产出 hast(root)，preview 与 export 共用同一棵树，避免两条链路不一致。
 * - sanitize 使用微信友好白名单（放行 style，移除 class）。
 * - 这里不做主题样式注入；inline style 由 Phase 3 在本 hast 上完成。
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, wechatSanitizeSchema)

/** 把 Markdown 源文本解析为安全的 hast root。 */
export function markdownToHast(markdown: string): HastRoot {
  const mdast = processor.parse(markdown)
  // runSync 执行 transformer（remark-rehype + sanitize），得到 hast。
  return processor.runSync(mdast) as HastRoot
}

/** 把 hast root 序列化为 HTML 字符串（供导出/复制使用）。 */
export function hastToHtml(tree: HastRoot): string {
  return toHtml(tree)
}

/** 便捷方法：Markdown 源文本直接转 HTML 字符串。 */
export function markdownToHtml(markdown: string): string {
  return hastToHtml(markdownToHast(markdown))
}
