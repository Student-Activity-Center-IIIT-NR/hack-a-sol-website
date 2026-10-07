/**
 * src/hooks/useScrollProgress.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a normalized (0→1) page scroll progress value.
 * Used for: camera path, canvas dimming, non-track sections.
 *
 * Track chapter state (activeIndex, chapterProgress) is managed exclusively by
 * useTrackSection (GSAP ScrollTrigger pin on #tracks) — not derived from this.
 */

import { useEffect, useRef } from 'react'
import { scrollStore } from '../utils/scrollStore'

export function useScrollProgress() {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      const p = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0
      scrollStore.updateScroll(p)
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

  return scrollStore.getScrollProgress()
}

