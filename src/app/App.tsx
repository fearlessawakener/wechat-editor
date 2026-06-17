import { useCallback, useEffect, useMemo, useState } from 'react'
import { MarkdownEditor } from '../editor'
import { formatMarkdown } from '../markdown-core'
import { themes, getThemeById, codeThemes, getCodeThemeById } from '../themes'
import type { ThemeTokens, WindowStyle } from '../themes'
import { copyHtml } from '../clipboard'
import { checkCompatibility } from '../checker'
import { loadDraft, saveDraft, clearDraft, useDebouncedSave } from '../storage'
import { Toolbar } from './Toolbar.tsx'
import { Preview } from './Preview.tsx'
import { CompatibilityBar } from './CompatibilityBar.tsx'
import { TuningPanel } from './TuningPanel.tsx'
import { ShortcutDialog } from './ShortcutDialog.tsx'
import { useThemedRender } from './useThemedRender.ts'
import { useSyncScroll } from './useSyncScroll.ts'
import defaultSource from '../storage/sample.md?raw'
import { matchesShortcut, shortcutDefinitions } from './shortcuts.ts'

const helpShortcut = shortcutDefinitions.find((item) => item.id === 'help')!
const closeShortcut = shortcutDefinitions.find((item) => item.id === 'close')!
const newShortcut = shortcutDefinitions.find((item) => item.id === 'new')!
const formatShortcut = shortcutDefinitions.find((item) => item.id === 'format')!
const copyShortcut = shortcutDefinitions.find((item) => item.id === 'copy')!
const resetShortcut = shortcutDefinitions.find((item) => item.id === 'reset')!

export function App() {
  // 启动时优先恢复草稿。
  const draft = loadDraft()
  const [source, setSource] = useState(draft?.source ?? defaultSource)
  const [themeId, setThemeId] = useState(
    draft?.themeId && getThemeById(draft.themeId).id === draft.themeId
      ? draft.themeId
      : themes[0].id,
  )
  const [toast, setToast] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Partial<ThemeTokens>>(
    draft?.tokenOverrides ?? {},
  )
  const [codeThemeId, setCodeThemeId] = useState(
    draft?.codeThemeId && getCodeThemeById(draft.codeThemeId).id === draft.codeThemeId
      ? draft.codeThemeId
      : codeThemes[0].id,
  )
  const [windowStyle, setWindowStyle] = useState<WindowStyle>(
    draft?.windowStyle ?? 'mac',
  )
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false)
  const theme = getThemeById(themeId)

  const { node, html, tree } = useThemedRender(
    source,
    theme,
    overrides,
    codeThemeId,
    windowStyle,
  )
  const warnings = useMemo(() => checkCompatibility(tree), [tree])
  const { leftRef, rightRef } = useSyncScroll()

  // 防抖自动保存：source / 主题 / 微调 / 代码主题 / 窗口风格变化都触发。
  useDebouncedSave(
    { source, themeId, tokenOverrides: overrides, codeThemeId, windowStyle },
    (v) => saveDraft(v),
  )

  const handleThemeChange = useCallback((id: string) => {
    setThemeId(id)
    // 切换主题清空微调：不同主题 token 基底不同，避免颜色/数值错配。
    setOverrides({})
  }, [])

  // 重置：清空样式微调，并把代码主题/窗口风格恢复到默认（Atom One Dark + Mac）。
  const handleReset = useCallback(() => {
    setOverrides({})
    setCodeThemeId(codeThemes[0].id)
    setWindowStyle('mac')
  }, [])

  const flash = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }, [])

  const handleFormat = useCallback(() => {
    setSource((s) => formatMarkdown(s))
  }, [])

  const handleCopy = useCallback(async () => {
    const result = await copyHtml(html, source)
    if (result.ok) {
      flash(result.fallback ? '已复制（兼容模式）' : '已复制到剪贴板')
    } else {
      flash('复制失败，请手动选择预览区内容复制')
    }
  }, [flash, html, source])

  const handleNew = useCallback(() => {
    if (!window.confirm('新建会清空当前内容，确定吗？')) return
    clearDraft()
    setSource(defaultSource)
    setOverrides({})
    flash('已新建默认文档')
  }, [flash])

  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if (matchesShortcut(event, helpShortcut)) {
        event.preventDefault()
        setShortcutDialogOpen(true)
        return
      }

      if (shortcutDialogOpen) {
        if (matchesShortcut(event, closeShortcut)) {
          event.preventDefault()
          setShortcutDialogOpen(false)
        }
        return
      }

      if (matchesShortcut(event, newShortcut)) {
        event.preventDefault()
        handleNew()
        return
      }

      if (matchesShortcut(event, formatShortcut)) {
        event.preventDefault()
        handleFormat()
        return
      }

      if (matchesShortcut(event, copyShortcut)) {
        event.preventDefault()
        void handleCopy()
        return
      }

      if (matchesShortcut(event, resetShortcut)) {
        event.preventDefault()
        handleReset()
      }
    }

    window.addEventListener('keydown', handleGlobalKeydown, true)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeydown, true)
    }
  }, [handleCopy, handleFormat, handleNew, handleReset, shortcutDialogOpen])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        themes={themes}
        currentThemeId={themeId}
        onThemeChange={handleThemeChange}
        codeThemes={codeThemes}
        currentCodeThemeId={codeThemeId}
        onCodeThemeChange={setCodeThemeId}
        windowStyle={windowStyle}
        onWindowStyleChange={setWindowStyle}
        onFormat={handleFormat}
        onCopy={handleCopy}
        onNew={handleNew}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <section
          style={{
            flex: 1,
            minWidth: 0,
            borderRight: '1px solid #e5e6e8',
            background: '#fff',
          }}
        >
          <MarkdownEditor
            value={source}
            onChange={setSource}
            scrollerRef={leftRef}
          />
        </section>
        <section
          ref={rightRef}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            // 浅灰底衬托：文章被限制为微信正文宽度并居中，宽屏下像一张居中的「纸」。
            background: '#f5f6f7',
          }}
        >
          <Preview
            content={node}
            fontFamily={theme.tokens.fontFamily}
            empty={!source}
          />
        </section>
        <TuningPanel
          base={theme.tokens}
          overrides={overrides}
          onChange={setOverrides}
          onReset={handleReset}
          onOpenShortcuts={() => setShortcutDialogOpen(true)}
        />
      </div>

      <CompatibilityBar warnings={warnings} />
      <ShortcutDialog
        open={shortcutDialogOpen}
        onClose={() => setShortcutDialogOpen(false)}
      />

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(31,35,41,0.92)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
