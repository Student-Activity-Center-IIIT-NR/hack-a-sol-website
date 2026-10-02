/**
 * src/hooks/useScrollCamera.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Piecewise keyframe camera path synced to scroll progress (0→1).
 *
 * Each keyframe defines: scroll t, camera world-position, and lookAt target.
 * Between keyframes, position and lookAt are smooth-lerped via CatmullRomCurve3
 * so the camera travels through the Marvel multiverse world continuously.
 *
 * Track world positions (where each 3D object lives in scene space):
 *   Iron Man       : (+3.5, 0, -8)
 *   Cap America    : (-3.5, 0, -20)
 *   Black Panther  : (+3.5, 0, -32)
 *   Ultron         : (-3.5, 0, -44)
 *   Doctor Strange : (  0,  0, -56)
 */

import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'

// ---------------------------------------------------------------------------
// World anchor positions (where track 3D objects are placed)
// ---------------------------------------------------------------------------
export const TRACK_WORLD_POSITIONS: [number, number, number][] = [
  [ 3.5, 0, -8  ],   // 0: Iron Man
  [-3.5, 0, -20 ],   // 1: Cap America
  [ 3.5, 0, -32 ],   // 2: Black Panther
  [-3.5, 0, -44 ],   // 3: Ultron
  [  0,  0, -56 ],   // 4: Doctor Strange
]

// ---------------------------------------------------------------------------
// Camera keyframes: [scroll_t, camX, camY, camZ, lookX, lookY, lookZ]
// Scroll thresholds match useScrollProgress:  tracks span ~0.15 → 0.70
// Each track ≈ 0.11 of total scroll.  Center of each track:
//   Iron Man   : 0.205   Cap: 0.315   BP: 0.425   Ultron: 0.535   Strange: 0.645
// ---------------------------------------------------------------------------
const KF: Array<{ t: number; pos: [number,number,number]; look: [number,number,number] }> = [
  { t: 0.00, pos: [0,  0,  8  ], look: [0,    0,  0   ] },  // Hero
  { t: 0.09, pos: [0,  0,  4  ], look: [0,    0,  0   ] },  // About
  { t: 0.15, pos: [0,  0,  1  ], look: [5.0,  0,  -8  ] },  // Approaching Iron Man (look right of model → model left-of-center)
  { t: 0.21, pos: [0,  0, -5  ], look: [5.0,  0,  -8  ] },  // AT Iron Man
  { t: 0.27, pos: [-1, 0, -13 ], look: [-2.0, 0,  -20 ] },  // Leaving → Cap
  { t: 0.32, pos: [0,  0, -18 ], look: [-2.0, 0,  -20 ] },  // AT Cap
  { t: 0.38, pos: [1,  0, -25 ], look: [5.0,  0,  -32 ] },  // Leaving → Black Panther
  { t: 0.43, pos: [0,  0, -30 ], look: [5.0,  0,  -32 ] },  // AT Black Panther
  { t: 0.49, pos: [-1, 0, -37 ], look: [-2.0, 0,  -44 ] },  // Leaving → Ultron
  { t: 0.54, pos: [0,  0, -42 ], look: [-2.0, 0,  -44 ] },  // AT Ultron
  { t: 0.60, pos: [0,  0, -49 ], look: [1.5,  0,  -56 ] },  // Leaving → Strange
  { t: 0.65, pos: [0,  0, -54 ], look: [1.5,  0,  -56 ] },  // AT Strange
  { t: 0.72, pos: [0, 0.5,-62 ], look: [0,    0,  -65 ] },  // Post-tracks / Sponsors
  { t: 0.85, pos: [0,  0, -70 ], look: [0,    0,  -72 ] },  // FAQ / Contact
  { t: 1.00, pos: [0,  0, -78 ], look: [0,    0,  -80 ] },  // Footer
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
  const perTrack = total / 5
  const tStart = TRACKS_START + trackIndex * perTrack
  const tEnd   = tStart + perTrack
  return Math.max(0, Math.min(1, (scrollProgress - tStart) / (tEnd - tStart)))
}
