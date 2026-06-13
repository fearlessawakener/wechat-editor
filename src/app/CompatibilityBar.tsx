import type { CheckWarning } from '../checker'

interface CompatibilityBarProps {
  warnings: CheckWarning[]
}

const levelStyle: Record<string, React.CSSProperties> = {
  warning: { background: '#fff7e6', color: '#ad6800', borderColor: '#ffd591' },
  info: { background: '#e6f4ff', color: '#0958d9', borderColor: '#91caff' },
}

/**
 * 兼容性提示栏：展示 checker 的 warning，不阻断操作。
 * 无 warning 时显示「无兼容性问题」。
 */
export function CompatibilityBar({ warnings }: CompatibilityBarProps) {
  if (warnings.length === 0) {
    return (
      <div
        style={{
          padding: '6px 16px',
          fontSize: 12,
          color: '#52883b',
          background: '#f6ffed',
          borderTop: '1px solid #d9f7be',
        }}
      >
        ✓ 未发现微信兼容性问题
      </div>
    )
  }

  return (
    <div
      style={{
        maxHeight: 120,
        overflowY: 'auto',
        borderTop: '1px solid #e5e6e8',
        background: '#fff',
      }}
    >
      {warnings.map((w, i) => {
        const s = levelStyle[w.level] ?? levelStyle.info
        return (
          <div
            key={`${w.id}-${i}`}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              color: s.color,
              background: s.background,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {w.level === 'warning' ? '⚠ ' : 'ℹ '}
            {w.message}
          </div>
        )
      })}
    </div>
  )
}
