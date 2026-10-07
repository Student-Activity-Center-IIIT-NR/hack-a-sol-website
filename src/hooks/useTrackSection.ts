/**
 * src/hooks/useTrackSection.ts  (Phase 3h - slower scroll, dwell & snap)
 * -----------------------------------------------------------------------------
 * Computes the Tracks section state from a GSAP ScrollTrigger pinned to
 * the #tracks element - NOT from page scroll progress.
 *
 *   N = TRACKS.length
 *   p = sectionProgress (0..1) - from ScrollTrigger progress callback
 *   activeIndex: floor(p * N) with ~3% hysteresis to prevent boundary flicker
 *   chapterProgress = Math.max(0, Math.min(1, p * N - activeIndex))
 *
 * Scroll Budget:
 *   pin end = "+=" + (N * TRACK_SCROLL_VH) + "vh" (default 280vh/chapter)
 *
 * Snap:
 *   Snaps to chapter centers: (i + 0.5) / N (the center of each HOLD zone)
 *   duration: 0.5-0.9s, ease: power2.inOut, delay: 0.15s, directional: true
 *
 * Smoothing:
 *   scrub: 1
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { TRACKS } from '../data/tracks'
import { TRACK_SCROLL_VH } from '../config'
import { scrollStore } from '../utils/scrollStore'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ limitCallbacks: true })
gsap.ticker.lagSmoothing(0)

export interface TrackSectionState {
  /** 0..1 overall progress through the entire pinned tracks section */
  sectionProgress: number
  /** 0..N-1 currently active track chapter index */
  activeIndex: number
  /** 0..1 progress within the active chapter */
  chapterProgress: number
}

export interface UseTrackSectionOptions {
  trackScrollVh?: number
  snapEnabled?: boolean
}

const N = TRACKS.length
const HYSTERESIS = 0.03 // ~3% buffer at chapter boundaries

function computeStateWithHysteresis(p: number, currentIdx: number): TrackSectionState {
  const clamped = Math.max(0, Math.min(1, p))
  const raw = clamped * N

  let idx = currentIdx
  // Hysteresis boundary checks
  if (raw >= currentIdx + 1 + HYSTERESIS) {
    idx = Math.min(N - 1, Math.floor(raw - HYSTERESIS))
  } else if (raw < currentIdx - HYSTERESIS) {
    idx = Math.max(0, Math.floor(raw + HYSTERESIS))
  }

  // Ensure index is within [0, N - 1]
  idx = Math.max(0, Math.min(N - 1, idx))
  const cp = Math.max(0, Math.min(1, raw - idx))

  return { sectionProgress: clamped, activeIndex: idx, chapterProgress: cp }
}

/**
 * Sets up a GSAP ScrollTrigger pin on #tracks and returns the live state.
 * Only triggers React re-renders when activeIndex changes.
 * Continuous metrics are updated into scrollStore.
 */
export function useTrackSection(options?: UseTrackSectionOptions): TrackSectionState {
  const scrollVh = options?.trackScrollVh ?? TRACK_SCROLL_VH
  const snapEnabled = options?.snapEnabled ?? true

  const [state, setState] = useState<TrackSectionState>(() => {
    const initial = computeStateWithHysteresis(0, 0)
    scrollStore.updateTrackSection(initial.sectionProgress, initial.activeIndex, initial.chapterProgress)
    return initial
  })

  const stRef = useRef<ScrollTrigger | null>(null)
  const activeIdxRef = useRef<number>(0)
  activeIdxRef.current = state.activeIndex

  const onUpdate = useCallback((self: ScrollTrigger) => {
    const next = computeStateWithHysteresis(self.progress, activeIdxRef.current)
    // Non-reactive store receives 60fps updates for Three.js useFrame
    scrollStore.updateTrackSection(next.sectionProgress, next.activeIndex, next.chapterProgress)

    // DOM text updates ONLY when activeIndex changes
    if (next.activeIndex !== activeIdxRef.current) {
      activeIdxRef.current = next.activeIndex
      setState(next)
    }
  }, [])

  useEffect(() => {
    const el = document.getElementById('tracks')
    if (!el) return

    // Kill any existing ST pinning this element to avoid duplicate triggers doing the same scrub
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el) st.kill()
    })

    // Chapter centers: (i + 0.5) / N (center of each chapter's HOLD zone)
    const chapterCenters = Array.from({ length: N }, (_, i) => (i + 0.5) / N)

    // Pin the tracks section; end = N chapters * TRACK_SCROLL_VH vh of scrolling room
    const st = ScrollTrigger.create({
      id: 'tracks-pin',
      trigger: el,
      start: 'top top',
      end: `+=${N * scrollVh}vh`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      snap: snapEnabled
        ? {
            snapTo: chapterCenters,
            duration: { min: 0.5, max: 0.9 },
            ease: 'power2.inOut',
            delay: 0.15,
            directional: true,
          }
        : undefined,
      onUpdate,
    })

    stRef.current = st

    // Refresh only after fonts and window load (once, not repeatedly)
    let refreshed = false
    const doRefresh = () => {
      if (refreshed) return
      refreshed = true
      ScrollTrigger.refresh()
    }

    if (document.readyState === 'complete') {
      document.fonts?.ready?.then(doRefresh)
    } else {
      window.addEventListener('load', () => {
        document.fonts?.ready?.then(doRefresh)
      }, { once: true })
    }

    return () => {
      st.kill()
      stRef.current = null
    }
  }, [scrollVh, snapEnabled, onUpdate])

  return state
}

/**
 * Given section-level sectionProgress (0..1 across all N chapters)
 * and a track index, return how far through that chapter we are (0..1).
 * Used by TrackWorlds / CharacterStage.
 */
export function chapterLocalT(sectionProgress: number, trackIndex: number): number {
  const raw = Math.max(0, Math.min(1, sectionProgress)) * N
  return Math.max(0, Math.min(1, raw - trackIndex))
}