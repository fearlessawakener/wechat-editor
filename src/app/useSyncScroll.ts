import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'

/**
 * 双向同步滚动。
 *
 * 监听左右两个滚动容器，任意一侧滚动时按「可滚动距离比例」驱动另一侧跟随。
 * 用 lock 标记当前由谁主动驱动，避免被动方的 scroll 事件再反向驱动形成循环。
 *
 * 返回的 ref 由调用方分别挂到两个滚动容器上。容器可能延迟挂载（如 CodeMirror
 * 的 scrollDOM 在 view 创建后才就绪），因此用轮询等待二者就绪后再绑定监听。
 */
export function useSyncScroll(): {
  leftRef: MutableRefObject<HTMLElement | null>
  rightRef: MutableRefObject<HTMLElement | null>
} {
  const leftRef = useRef<HTMLElement | null>(null)
  const rightRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // 当前主动驱动方；被动方滚动时不应再反向同步。
    let lock: 'left' | 'right' | null = null
    let releaseTimer = 0

    function sync(from: HTMLElement, to: HTMLElement, who: 'left' | 'right') {
      if (lock && lock !== who) return
      lock = who
      const max = from.scrollHeight - from.clientHeight
      const ratio = max > 0 ? from.scrollTop / max : 0
      const toMax = to.scrollHeight - to.clientHeight
      to.scrollTop = ratio * toMax
      // 被动方收到 scroll 事件后短暂内释放锁，避免长期占用。
      window.clearTimeout(releaseTimer)
      releaseTimer = window.setTimeout(() => {
        lock = null
      }, 80)
    }

    let onLeft: (() => void) | null = null
    let onRight: (() => void) | null = null
    let left: HTMLElement | null = null
    let right: HTMLElement | null = null

    // 容器可能尚未挂载，轮询等待两侧就绪后再绑定。
    let pollId = 0
    function bind() {
      left = leftRef.current
      right = rightRef.current
      if (!left || !right) {
        pollId = window.setTimeout(bind, 50)
        return
      }
      onLeft = () => sync(left!, right!, 'left')
      onRight = () => sync(right!, left!, 'right')
      left.addEventListener('scroll', onLeft, { passive: true })
      right.addEventListener('scroll', onRight, { passive: true })
    }
    bind()

    return () => {
      window.clearTimeout(pollId)
      window.clearTimeout(releaseTimer)
      if (left && onLeft) left.removeEventListener('scroll', onLeft)
      if (right && onRight) right.removeEventListener('scroll', onRight)
    }
  }, [])

  return { leftRef, rightRef }
}
