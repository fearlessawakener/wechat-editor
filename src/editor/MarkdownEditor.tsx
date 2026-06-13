import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

/**
 * 轻量 CodeMirror 6 封装。
 *
 * 受控用法：`value` 为唯一数据源，编辑触发 `onChange` 向上传递。
 * 这里只把外部 `value` 与编辑器内容做必要同步，避免每次 keystroke 重建 view。
 */
export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // 用 ref 持有最新 onChange，避免它进入 effect 依赖导致 view 重建。
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': {
            fontFamily:
              "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            lineHeight: '1.6',
          },
          '.cm-content': { padding: '12px 0' },
        }),
      ],
    })

    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // 仅挂载时创建一次；value 的外部变更由下面的 effect 同步。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 当外部 value 与编辑器当前内容不一致时（如加载草稿、格式化）同步进编辑器。
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return <div ref={hostRef} style={{ height: '100%', overflow: 'auto' }} />
}
