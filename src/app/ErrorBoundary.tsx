import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 顶层错误边界：渲染管线或组件异常时兜底，避免整页白屏。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#cf1322' }}>
          <h2>页面出错了</h2>
          <p style={{ color: '#646a73' }}>
            渲染时发生异常。可尝试修改内容或刷新页面；草稿已自动保存。
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#fff1f0',
              padding: 12,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {this.state.error.message}
          </pre>
          <button type="button" onClick={() => this.setState({ error: null })}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
