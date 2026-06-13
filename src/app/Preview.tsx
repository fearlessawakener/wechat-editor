import type { ReactNode } from 'react'

interface PreviewProps {
  content: ReactNode
  fontFamily: string
  empty: boolean
}

/**
 * 预览区：展示主题化渲染结果。
 * 实际渲染逻辑在 useThemedRender，与复制导出共用同源 hast。
 */
export function Preview({ content, fontFamily, empty }: PreviewProps) {
  return (
    <div style={{ padding: '16px 20px', fontFamily }}>
      {empty ? '在左侧输入 Markdown，这里会实时预览。' : content}
    </div>
  )
}
