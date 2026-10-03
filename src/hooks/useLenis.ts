/**
 * src/hooks/useLenis.ts  (Phase 3h — velocity tracking)
 * ─────────────────────────────────────────────────────────────────────────────
 * Initialises Lenis smooth scroll and syncs its RAF loop with GSAP ticker.
 * Returns the Lenis instance so consumers can call lenis.scrollTo(), etc.
 * Phase 3h: exposes scroll velocity for environment effects.
 *
 * Must be called ONCE at the App root level.
 */

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function useLenis(wheelMultiplier = 0.7) {
  const lenisRef   = useRef<Lenis | null>(null)
  const velocityRef = useRef(0)

  useEffect(() => {
    // Respect prefers-reduced-motion — disable smooth scroll for accessibility
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier,
      touchMultiplier: 1.2,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Sync Lenis RAF with GSAP ticker so ScrollTrigger works correctly
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on("scroll", ScrollTrigger.update)

    // Track velocity for environment effects
    lenis.on("scroll", (e: { velocity: number }) => {
      velocityRef.current = Math.abs(e.velocity ?? 0)
    })

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
    }
  }, [])

  // Live update wheelMultiplier if Leva changes it
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.options.wheelMultiplier = wheelMultiplier
    }
  }, [wheelMultiplier])

  return { lenisRef, velocityRef }
}