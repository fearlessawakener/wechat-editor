import type { Theme, CodeTheme, WindowStyle } from '../themes'

interface ToolbarProps {
  themes: Theme[]
  currentThemeId: string
  onThemeChange: (id: string) => void
  codeThemes: CodeTheme[]
  currentCodeThemeId: string
  onCodeThemeChange: (id: string) => void
  windowStyle: WindowStyle
  onWindowStyleChange: (style: WindowStyle) => void
  onFormat?: () => void
  onCopy?: () => void
  onNew?: () => void
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 13,
  border: '1px solid #d0d3d6',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  color: '#1f2329',
}

const disabledButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  color: '#a8abb0',
  cursor: 'not-allowed',
  background: '#f7f8f9',
}

/**
 * 顶部工具栏：主题选择、格式化、复制。
 * 复制将在 Phase 4 接入。
 */
export function Toolbar({
  themes,
  currentThemeId,
  onThemeChange,
  codeThemes,
  currentCodeThemeId,
  onCodeThemeChange,
  windowStyle,
  onWindowStyleChange,
  onFormat,
  onCopy,
  onNew,
}: ToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderBottom: '1px solid #e5e6e8',
        background: '#fff',
      }}
    >
      <strong style={{ fontSize: 15, marginRight: 'auto' }}>
        微信公众号编辑器
      </strong>

      <select
        value={currentThemeId}
        onChange={(e) => onThemeChange(e.target.value)}
        style={{ ...buttonStyle, paddingRight: 24 }}
        title="选择主题"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={currentCodeThemeId}
        onChange={(e) => onCodeThemeChange(e.target.value)}
        style={{ ...buttonStyle, paddingRight: 24 }}
        title="代码高亮主题"
      >
        {codeThemes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={windowStyle}
        onChange={(e) => onWindowStyleChange(e.target.value as WindowStyle)}
        style={{ ...buttonStyle, paddingRight: 24 }}
        title="代码块窗口风格"
      >
        <option value="mac">Mac 风格</option>
        <option value="win">Windows 风格</option>
      </select>

      <button
        type="button"
        style={onNew ? buttonStyle : disabledButtonStyle}
        disabled={!onNew}
        onClick={onNew}
      >
        新建
      </button>
      <button
        type="button"
        style={onFormat ? buttonStyle : disabledButtonStyle}
        disabled={!onFormat}
        onClick={onFormat}
      >
        格式化
      </button>
      <button
        type="button"
        style={onCopy ? buttonStyle : disabledButtonStyle}
        disabled={!onCopy}
        onClick={onCopy}
      >
        复制
      </button>
    </div>
  )
}
