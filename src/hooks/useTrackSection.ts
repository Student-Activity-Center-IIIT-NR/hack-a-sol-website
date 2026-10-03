/**
 * src/hooks/useTrackSection.ts  (Phase 3g — single source of truth)
 * -----------------------------------------------------------------------------
 * Computes the Tracks section state from a GSAP ScrollTrigger pinned to
 * the #tracks element — NOT from page scroll progress.
 *
 *   N = TRACKS.length
 *   p = sectionProgress (0..1) — from ScrollTrigger progress callback
 *   activeIndex    = min(N-1, floor(p * N))
 *   chapterProgress = p * N - activeIndex   (0..1 within each chapter)
 *
 * Everything in Tracks (text, image, glow disk, HUD, 3D model) must
 * derive from this one activeIndex + chapterProgress pair.
 *
 * The pinned section height is set to N * 120vh via the `end` config
 * so all N chapters are reachable.
 *
 * ScrollTrigger.refresh() is called whenever fonts + images finish loading.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { TRACKS } from '../data/tracks'

gsap.registerPlugin(ScrollTrigger)

export interface TrackSectionState {
  /** 0..1 overall progress through the entire pinned tracks section */
  sectionProgress: number
  /** 0..N-1 currently active track chapter index */
  activeIndex: number
  /** 0..1 progress within the active chapter */
  chapterProgress: number
}

const N = TRACKS.length

function computeState(p: number): TrackSectionState {
  const clamped = Math.max(0, Math.min(1, p))
  const raw = clamped * N
  const idx = Math.min(N - 1, Math.floor(raw))
  const cp  = raw - idx
  return { sectionProgress: clamped, activeIndex: idx, chapterProgress: cp }
}

/**
 * Sets up a GSAP ScrollTrigger pin on #tracks and returns the live state.
 */
export function useTrackSection(): TrackSectionState {
  const [state, setState] = useState<TrackSectionState>(computeState(0))
  const stRef = useRef<ScrollTrigger | null>(null)

  const onUpdate = useCallback((self: ScrollTrigger) => {
    setState(computeState(self.progress))
  }, [])

  useEffect(() => {
    const el = document.getElementById('tracks')
    if (!el) return

    // Kill any existing ST pinning this element
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === el) st.kill()
    })

    // Pin the tracks section; end = N chapters * 120vh of scrolling room
    const st = ScrollTrigger.create({
      trigger:    el,
      start:      'top top',
      end:        `+=${N * 120}vh`,
      pin:        true,
      pinSpacing: true,
      scrub:      0.4,
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
  }, [onUpdate])

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
