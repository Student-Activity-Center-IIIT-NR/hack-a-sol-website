/**
 * src/hooks/useScrollProgress.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a GSAP MotionValue-like reactive value (0 → 1) representing how far
 * the user has scrolled through the entire page. Updated on every scroll event
 * via a ResizeObserver + scroll listener so it works with Lenis.
 */

import { useEffect, useRef, useState } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      const p = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0
      setProgress(parseFloat(p.toFixed(4)))
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return progress
}

/**
 * Returns the index (0-4) of the currently active section among the
 * five track chapters, derived from scroll progress.
 * Assumes each chapter occupies an equal share of 5 pinned sections.
 */
export function useActiveTrackIndex(totalTracks: number): number {
  const progress = useScrollProgress()
  // Tracks section roughly spans 20% – 70% of total page
  const TRACKS_START = 0.15
  const TRACKS_END = 0.7
  if (progress < TRACKS_START) return 0
  if (progress > TRACKS_END) return totalTracks - 1
  const normalized = (progress - TRACKS_START) / (TRACKS_END - TRACKS_START)
  return Math.min(totalTracks - 1, Math.floor(normalized * totalTracks))
}
