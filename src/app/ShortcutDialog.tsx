import { useEffect, useMemo, useRef } from 'react'
import {
  getShortcutKeys,
  isMacPlatform,
  shortcutDefinitions,
} from './shortcuts.ts'

interface ShortcutDialogProps {
  open: boolean
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.28)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  zIndex: 30,
}

const dialogStyle: React.CSSProperties = {
  width: 'min(560px, 100%)',
  maxHeight: 'min(640px, calc(100vh - 48px))',
  overflowY: 'auto',
  background: '#fff',
  border: '1px solid #dfe2e6',
  borderRadius: 8,
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
}

const kbdStyle: React.CSSProperties = {
  minWidth: 28,
  padding: '4px 8px',
  border: '1px solid #d0d7de',
  borderBottomColor: '#b8c0cc',
  borderRadius: 6,
  background: '#f8fafc',
  boxShadow: 'inset 0 -1px 0 rgba(31, 35, 41, 0.08)',
  fontSize: 12,
  lineHeight: 1,
  color: '#1f2329',
  textAlign: 'center',
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd style={kbdStyle}>{children}</kbd>
}

export function ShortcutDialog({ open, onClose }: ShortcutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const isMac = useMemo(() => isMacPlatform(), [])
  const shortcuts = useMemo(
    () =>
      shortcutDefinitions.filter((item) =>
        open ? true : item.id !== 'close',
      ),
    [open],
  )

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="快捷键"
        tabIndex={-1}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid #e5e6e8',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2329' }}>
              快捷键
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#646a73' }}>
              {isMac ? '当前显示 Mac 快捷键' : '当前显示 Windows 快捷键'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid #d0d7de',
              borderRadius: 6,
              background: '#fff',
              color: '#1f2329',
              padding: '6px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>

        <div style={{ padding: '10px 18px 18px' }}>
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid #f0f2f5',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: '#1f2329' }}>
                  {shortcut.label}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#646a73' }}>
                  {shortcut.description}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                {getShortcutKeys(shortcut, isMac).map((key) => (
                  <Kbd key={`${shortcut.id}-${key}`}>{key}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
