export interface ShortcutDefinition {
  id: 'help' | 'close' | 'new' | 'format' | 'copy' | 'reset'
  label: string
  description: string
  windowsKeys: string[]
  macKeys: string[]
  matcher: {
    key: string
    mod?: boolean
    alt?: boolean
    shift?: boolean
  }
}

export const shortcutDefinitions: ShortcutDefinition[] = [
  {
    id: 'help',
    label: '打开快捷键',
    description: '显示当前编辑器支持的快捷键',
    windowsKeys: ['Ctrl', '/'],
    macKeys: ['⌘', '/'],
    matcher: { key: '/', mod: true },
  },
  {
    id: 'close',
    label: '关闭弹窗',
    description: '关闭快捷键面板',
    windowsKeys: ['Esc'],
    macKeys: ['Esc'],
    matcher: { key: 'Escape' },
  },
  {
    id: 'new',
    label: '新建文档',
    description: '加载默认 Markdown 模板',
    windowsKeys: ['Ctrl', 'Alt', 'N'],
    macKeys: ['⌘', '⌥', 'N'],
    matcher: { key: 'n', mod: true, alt: true },
  },
  {
    id: 'format',
    label: '格式化',
    description: '规范当前 Markdown 内容',
    windowsKeys: ['Ctrl', 'Alt', 'F'],
    macKeys: ['⌘', '⌥', 'F'],
    matcher: { key: 'f', mod: true, alt: true },
  },
  {
    id: 'copy',
    label: '复制内容',
    description: '复制当前渲染结果到剪贴板',
    windowsKeys: ['Ctrl', 'Alt', 'C'],
    macKeys: ['⌘', '⌥', 'C'],
    matcher: { key: 'c', mod: true, alt: true },
  },
  {
    id: 'reset',
    label: '重置样式',
    description: '清空微调并恢复默认代码主题和窗口风格',
    windowsKeys: ['Ctrl', 'Alt', 'R'],
    macKeys: ['⌘', '⌥', 'R'],
    matcher: { key: 'r', mod: true, alt: true },
  },
]

export function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
}

export function getShortcutKeys(
  shortcut: ShortcutDefinition,
  isMac: boolean,
): string[] {
  return isMac ? shortcut.macKeys : shortcut.windowsKeys
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutDefinition,
): boolean {
  const expectedKey =
    shortcut.matcher.key.length === 1
      ? shortcut.matcher.key.toLowerCase()
      : shortcut.matcher.key
  const actualKey =
    event.key.length === 1 ? event.key.toLowerCase() : event.key

  return (
    actualKey === expectedKey &&
    (event.ctrlKey || event.metaKey) === Boolean(shortcut.matcher.mod) &&
    event.altKey === Boolean(shortcut.matcher.alt) &&
    event.shiftKey === Boolean(shortcut.matcher.shift)
  )
}
