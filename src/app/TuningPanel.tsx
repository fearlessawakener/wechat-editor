import type { ThemeTokens } from '../themes'

interface TuningPanelProps {
  /** 当前主题默认 token（作为各控件的回退值） */
  base: ThemeTokens
  /** 用户微调覆盖 */
  overrides: Partial<ThemeTokens>
  onChange: (next: Partial<ThemeTokens>) => void
  onReset: () => void
}

// 思源系列。
const SOURCE_HAN_SERIF = {
  label: '思源宋体',
  value:
    "'Source Han Serif SC', 'Source Han Serif CN', '思源宋体', 'Noto Serif CJK SC', serif",
}
const SOURCE_HAN_SANS = {
  label: '思源黑体',
  value:
    "'Source Han Sans SC', 'Source Han Sans CN', '思源黑体', 'Noto Sans CJK SC', sans-serif",
}

// 内容、标题、引用字体共用：思源宋体、思源黑体。
const FONT_OPTIONS = [SOURCE_HAN_SERIF, SOURCE_HAN_SANS]

const CODE_FONT_OPTIONS = [
  {
    label: '系统等宽',
    value: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  {
    label: 'JetBrainsMono',
    value:
      "'JetBrainsMono Nerd Font Mono', 'JetBrainsMono Nerd Font', monospace",
  },
  {
    label: 'Monaspace Krypton',
    value: "'Monaspace Krypton Frozen', 'Monaspace Krypton', monospace",
  },
]

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 0',
  fontSize: 13,
  color: '#1f2329',
}

const labelStyle: React.CSSProperties = { color: '#646a73' }

/**
 * 主题微调面板：绑定 ThemeTokens 的核心字段。
 *
 * 任一改动通过 onChange 合并进 overrides，预览与导出实时反映（见 useThemedRender）。
 * 微调以「覆盖」形式存在，base 不变，便于重置与切换主题后保留/清除。
 */
export function TuningPanel({
  base,
  overrides,
  onChange,
  onReset,
}: TuningPanelProps) {
  const merged = { ...base, ...overrides }

  function set<K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) {
    onChange({ ...overrides, [key]: value })
  }

  return (
    <div
      style={{
        width: 240,
        padding: '12px 16px',
        borderLeft: '1px solid #e5e6e8',
        background: '#fafbfc',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <strong style={{ fontSize: 13 }}>样式微调</strong>
        <button
          type="button"
          onClick={onReset}
          style={{
            fontSize: 12,
            border: 'none',
            background: 'none',
            color: '#5b6cf0',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          重置
        </button>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>内容字体</span>
        <select
          value={merged.fontFamily}
          onChange={(e) => set('fontFamily', e.target.value)}
          style={{ width: 130 }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>标题字体</span>
        <select
          value={merged.headingFontFamily ?? ''}
          onChange={(e) => set('headingFontFamily', e.target.value)}
          style={{ width: 130 }}
        >
          <option value="">跟随内容</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>引用字体</span>
        <select
          value={merged.blockquoteFontFamily ?? ''}
          onChange={(e) => set('blockquoteFontFamily', e.target.value)}
          style={{ width: 130 }}
        >
          <option value="">跟随内容</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>代码字体</span>
        <select
          value={merged.codeFontFamily}
          onChange={(e) => set('codeFontFamily', e.target.value)}
          style={{ width: 130 }}
        >
          {CODE_FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>正文字号</span>
        <span>
          <input
            type="range"
            min={12}
            max={20}
            value={parseInt(merged.fontSize, 10)}
            onChange={(e) => set('fontSize', `${e.target.value}px`)}
          />
          <span style={{ marginLeft: 6 }}>{merged.fontSize}</span>
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>行高</span>
        <span>
          <input
            type="range"
            min={12}
            max={24}
            value={Math.round(parseFloat(merged.lineHeight) * 10)}
            onChange={(e) =>
              set('lineHeight', (Number(e.target.value) / 10).toFixed(1))
            }
          />
          <span style={{ marginLeft: 6 }}>{merged.lineHeight}</span>
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>段间距</span>
        <span>
          <input
            type="range"
            min={8}
            max={28}
            value={parseInt(merged.paragraphSpacing, 10)}
            onChange={(e) => set('paragraphSpacing', `${e.target.value}px`)}
          />
          <span style={{ marginLeft: 6 }}>{merged.paragraphSpacing}</span>
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>主色</span>
        <input
          type="color"
          value={merged.primaryColor}
          onChange={(e) => set('primaryColor', e.target.value)}
        />
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>正文色</span>
        <input
          type="color"
          value={merged.textColor}
          onChange={(e) => set('textColor', e.target.value)}
        />
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>标题色</span>
        <input
          type="color"
          value={merged.headingColor}
          onChange={(e) => set('headingColor', e.target.value)}
        />
      </div>
    </div>
  )
}
