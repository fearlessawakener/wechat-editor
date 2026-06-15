import type { ReactNode } from 'react'
import { ARTICLE_MAX_WIDTH } from './useThemedRender.ts'

interface PreviewProps {
  content: ReactNode
  fontFamily: string
  empty: boolean
}

/**
 * 预览区：展示主题化渲染结果。
 * 实际渲染逻辑在 useThemedRender，与复制导出共用同源 hast。
 *
 * 文章本身已被 useThemedRender 包进定宽 section（微信正文宽度），这里再用一张
 * 白底卡片承托并水平居中，在灰底预览区里模拟公众号网页端「居中的一张纸」。
 */
export function Preview({ content, fontFamily, empty }: PreviewProps) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div
        style={{
          maxWidth: ARTICLE_MAX_WIDTH,
          margin: '0 auto',
          background: '#fff',
          padding: '16px 20px',
          borderRadius: 4,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          fontFamily,
        }}
      >
        {empty ? '在左侧输入 Markdown，这里会实时预览。' : content}
      </div>
    </div>
  )
}
