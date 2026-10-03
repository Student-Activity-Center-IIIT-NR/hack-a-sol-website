/**
 * src/hooks/useLenis.ts
 * -----------------------------------------------------------------------------
 * Initialises Lenis smooth scroll and syncs its RAF loop with GSAP ticker.
 * Returns the Lenis instance so consumers can call lenis.scrollTo(), etc.
 *
 * Must be called ONCE at the App root level.
 */

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis(wheelMultiplier = 0.7) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion — disable smooth scroll for accessibility
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

    // Prevent GSAP from calling requestAnimationFrame itself — Lenis handles it
    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update)

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

  return lenisRef
}
