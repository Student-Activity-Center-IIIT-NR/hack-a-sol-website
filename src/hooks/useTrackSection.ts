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

gsap.registerPlugin(ScrollTrigger)

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
 */
export function useTrackSection(options?: UseTrackSectionOptions): TrackSectionState {
  const scrollVh = options?.trackScrollVh ?? TRACK_SCROLL_VH
  const snapEnabled = options?.snapEnabled ?? true

  const [state, setState] = useState<TrackSectionState>(() =>
    computeStateWithHysteresis(0, 0)
  )
  const stRef = useRef<ScrollTrigger | null>(null)
  const activeIdxRef = useRef<number>(0)

  // Keep activeIdxRef in sync
  activeIdxRef.current = state.activeIndex

  const onUpdate = useCallback((self: ScrollTrigger) => {
    setState((prevState) => {
      const next = computeStateWithHysteresis(self.progress, prevState.activeIndex)
      return next
    })
  }, [])

  useEffect(() => {
    const el = document.getElementById('tracks')
    if (!el) return

    // Kill any existing ST pinning this element
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el) st.kill()
    })

    // Chapter centers: (i + 0.5) / N (center of each chapter's HOLD zone)
    const chapterCenters = Array.from({ length: N }, (_, i) => (i + 0.5) / N)

    // Pin the tracks section; end = N chapters * TRACK_SCROLL_VH vh of scrolling room
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${N * scrollVh}vh`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
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

    // Refresh after everything loads so pin-spacer height is correct
    const doRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', doRefresh)
    document.fonts?.ready?.then(doRefresh)

    return () => {
      st.kill()
      stRef.current = null
      window.removeEventListener('load', doRefresh)
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