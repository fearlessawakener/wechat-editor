/**
 * 把 HTML 写入剪贴板，供粘贴到微信公众号后台。
 *
 * 优先用 navigator.clipboard.write 同时写入 text/html 与 text/plain；
 * 不支持时降级到 execCommand('copy')；都失败则抛错由调用方提示手动复制。
 */
export interface CopyResult {
  ok: boolean
  /** 降级时为 true，提示可能需要手动确认 */
  fallback: boolean
  error?: string
}

async function tryClipboardItem(
  html: string,
  plain: string,
): Promise<boolean> {
  if (
    typeof ClipboardItem === 'undefined' ||
    !navigator.clipboard?.write
  ) {
    return false
  }
  const item = new ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' }),
    'text/plain': new Blob([plain], { type: 'text/plain' }),
  })
  await navigator.clipboard.write([item])
  return true
}

/**
 * 降级方案：把 HTML 注入隐藏可编辑节点，选中后 execCommand('copy')，
 * 这样能保留富文本格式（纯 writeText 只能复制纯文本）。
 */
function execCommandCopyHtml(html: string): boolean {
  const container = document.createElement('div')
  container.setAttribute('contenteditable', 'true')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(container)
    selection?.removeAllRanges()
    selection?.addRange(range)
    const ok = document.execCommand('copy')
    selection?.removeAllRanges()
    return ok
  } finally {
    document.body.removeChild(container)
  }
}

/** 把渲染后的微信 HTML 复制到剪贴板，附带纯文本兜底。 */
export async function copyHtml(
  html: string,
  plainText: string,
): Promise<CopyResult> {
  try {
    const ok = await tryClipboardItem(html, plainText)
    if (ok) return { ok: true, fallback: false }
  } catch (err) {
    // Clipboard API 可能因权限或聚焦问题抛错，继续走降级。
    void err
  }

  try {
    const ok = execCommandCopyHtml(html)
    return { ok, fallback: true }
  } catch (err) {
    return {
      ok: false,
      fallback: true,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
