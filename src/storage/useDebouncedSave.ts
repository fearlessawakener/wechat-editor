import { useEffect, useRef } from 'react'

/**
 * 防抖地把值持久化。值变化后 delay 毫秒内无新变化才执行 save。
 *
 * 用于自动保存草稿，避免每次 keystroke 都写 localStorage。
 */
export function useDebouncedSave<T>(
  value: T,
  save: (value: T) => void,
  delay = 600,
): void {
  const saveRef = useRef(save)
  saveRef.current = save

  useEffect(() => {
    const id = window.setTimeout(() => saveRef.current(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
}
