/**
 * src/hooks/useScrollCamera.ts  (Phase 3i — environments at origin fix)
 * ─────────────────────────────────────────────────────────────────────────────
 * Piecewise keyframe camera path synced to scroll progress (0→1).
 *
 * PHASE 3i KEY CHANGE:
 *   All track environments now render at [0,0,0] (origin) because the GSAP pin
 *   on #tracks FREEZES scrollProgress during the entire Tracks section. The
 *   camera must therefore stay in front of origin for the entire tracks range.
 *
 *   Camera sits at [0, 0, 4], looking at [0, 0, 0] for ALL tracks (t=0.15→0.70).
 *   Before: approached along Z, now stays put — scroll-within-pin is managed by
 *   GSAP/chapterProgress, not by the global scrollProgress camera path.
 *
 * Post-tracks (t>0.70): camera moves away to give sponsors/FAQ/footer a clear bg.
 */

import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'
import { TRACKS } from '../data/tracks'

// ---------------------------------------------------------------------------
// Legacy world anchor positions — kept for reference only; TrackWorlds no
// longer uses these (all environments render at [0,0,0] now).
// ---------------------------------------------------------------------------
export const TRACK_WORLD_POSITIONS: [number, number, number][] = [
  [ 3.0, 0, -8  ],
  [-3.0, 0, -20 ],
  [ 3.0, 0, -32 ],
  [-3.0, 0, -44 ],
  [ 3.0, 0, -56 ],
]

// ---------------------------------------------------------------------------
// Camera keyframes: [scroll_t, camX, camY, camZ, lookX, lookY, lookZ]
//
 // During the pinned Tracks section (t ≈ 0.15 → 0.70), scrollProgress is
// FROZEN at the pin-start value, so the camera must stay at a fixed position
// that keeps the origin ([0,0,0]) clearly visible in the frustum.
// Camera at z=+4 looking at z=0 gives ~37° angle to origin at fov=60 — good.
// ---------------------------------------------------------------------------
const KF: Array<{ t: number; pos: [number,number,number]; look: [number,number,number] }> = [
  { t: 0.00, pos: [0, 0,  8  ], look: [0, 0,   0  ] },  // Hero
  { t: 0.09, pos: [0, 0,  5  ], look: [0, 0,   0  ] },  // About
  { t: 0.14, pos: [0, 0,  4  ], look: [0, 0,   0  ] },  // Approaching Tracks — settle at z=4
  { t: 0.15, pos: [0, 0,  4  ], look: [0, 0,   0  ] },  // Tracks START — camera stays here
  { t: 0.70, pos: [0, 0,  4  ], look: [0, 0,   0  ] },  // Tracks END   — same position
  { t: 0.72, pos: [0, 0.5, 6 ], look: [0, 0,   2  ] },  // Post-tracks / Sponsors (pull back)
  { t: 0.85, pos: [0, 0,   8 ], look: [0, 0,   4  ] },  // FAQ / Contact
  { t: 1.00, pos: [0, 0,  10 ], look: [0, 0,   6  ] },  // Footer
]

// Build CatmullRomCurve3 for both position and lookAt
function buildCurve(points: [number,number,number][]): CatmullRomCurve3 {
  return new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    'catmullrom',
    0.5,
  )
}

/**
 * Returns camera position and lookAt target for a given scroll progress (0→1).
 * Uses piecewise linear t-mapped CatmullRom for predictable timing.
 */
export function useScrollCamera() {
  const posCurve = useMemo(() => buildCurve(KF.map(k => k.pos)), [])
  const lookCurve = useMemo(() => buildCurve(KF.map(k => k.look)), [])

  // Pre-allocate reusable Vector3s (avoid GC pressure per frame)
  const _pos  = useRef(new Vector3())
  const _look = useRef(new Vector3())

  /**
   * Get camera transform at scroll progress t (0→1).
   * Uses arc-length parameterisation to keep timing predictable.
   */
  function getCameraTransform(scrollT: number): { position: Vector3; lookAt: Vector3 } {
    // Find surrounding keyframes
    const clamped = Math.max(0, Math.min(1, scrollT))
    let lo = 0
    for (let i = 0; i < KF.length - 1; i++) {
      if (clamped >= KF[i].t && clamped <= KF[i + 1].t) { lo = i; break }
      if (clamped > KF[KF.length - 1].t) { lo = KF.length - 2 }
    }
    const hi = Math.min(lo + 1, KF.length - 1)
    const span = KF[hi].t - KF[lo].t
    const localT = span > 0 ? (clamped - KF[lo].t) / span : 0

    // Map local [0,1] to curve parameter [lo/n, hi/n]
    const n = KF.length - 1
    const curveT = (lo + localT) / n

    posCurve.getPoint(curveT, _pos.current)
    lookCurve.getPoint(curveT, _look.current)

    return { position: _pos.current, lookAt: _look.current }
  }

  return { getCameraTransform, TRACK_WORLD_POSITIONS }
}

/**
 * Given global scrollProgress, compute how far through a specific track's
 * scroll window we are (0 = entering, 0.5 = centered, 1 = leaving).
 */
export function getTrackLocalT(scrollProgress: number, trackIndex: number): number {
  const TRACKS_START = 0.15
  const TRACKS_END   = 0.70
  const total = TRACKS_END - TRACKS_START
  const perTrack = total / TRACKS.length
  const tStart = TRACKS_START + trackIndex * perTrack
  const tEnd   = tStart + perTrack
  return Math.max(0, Math.min(1, (scrollProgress - tStart) / (tEnd - tStart)))
}
