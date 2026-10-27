/**
 * src/hooks/useCursor.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks raw mouse position and a smoothly lagged cursor position.
 * Returns refs so consumers can drive CSS transforms without React re-renders.
 *
 * Also provides `isHovering` state for the outer ring expansion.
 */

import { useEffect, useRef, useState } from 'react'

export interface CursorState {
  /** Smoothed position (for outer ring) */
  smoothX: number
  smoothY: number
  /** Raw position (for inner dot) */
  rawX: number
  rawY: number
  /** Whether cursor is over an interactive element */
  hovering: boolean
}

export function useCursor() {
  const raw   = useRef({ x: -100, y: -100 })
  const smooth = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)
  const [state, setState] = useState<CursorState>({ smoothX: -100, smoothY: -100, rawX: -100, rawY: -100, hovering: false })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      raw.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = () => setState(s => ({ ...s, hovering: true }))
    const onLeave = () => setState(s => ({ ...s, hovering: false }))

    // Attach hover listeners to all interactive elements
    const attachHover = () => {
      document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    attachHover()

    const raf = () => {
      smooth.current.x += (raw.current.x - smooth.current.x) * 0.12
      smooth.current.y += (raw.current.y - smooth.current.y) * 0.12
      setState({
        rawX: raw.current.x,
        rawY: raw.current.y,
        smoothX: smooth.current.x,
        smoothY: smooth.current.y,
        hovering: false, // updated by event listeners
      })
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return state
}
