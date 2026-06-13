import { defaultSchema } from 'rehype-sanitize'
import type { Options as SanitizeSchema } from 'rehype-sanitize'

/**
 * 微信公众号友好的 sanitize 白名单。
 *
 * 基于 rehype-sanitize 的 defaultSchema 收窄/调整：
 * - 放行所有元素的 `style` 属性：Phase 3 的 inline 注入依赖它，
 *   微信正文也只认 inline style。
 * - 移除 `className`：微信不支持 class，保留只会徒增体积并误导。
 * - 保留 GFM 表格、删除线等元素。
 *
 * 注意：sanitize 仍会剥离 <script>、事件属性等危险内容。
 */
export const wechatSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // 允许任意元素带 style（值仍是字符串，sanitize 不解析 CSS）。
    '*': [
      ...(defaultSchema.attributes?.['*'] ?? []).filter(
        (attr) => attr !== 'className',
      ),
      'style',
    ],
  },
  // 在默认放行标签基础上，确保代码高亮所需的 <span> 可用。
  tagNames: [...(defaultSchema.tagNames ?? [])],
}
