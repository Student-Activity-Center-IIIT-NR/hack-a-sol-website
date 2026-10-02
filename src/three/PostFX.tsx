/**
 * src/three/PostFX.tsx  (Phase 3b — velocity-based chromatic aberration)
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-processing changes from Phase 3b:
 *   • ChromaticAberration at rest = near-zero (0.0003 base)
 *   • Aberration spikes only on fast scroll, decays back in ~300 ms
 *   • Boundary-proximity warp kept for track transitions
 *   • Noise and Vignette unchanged but grain reduced to 0.022
 *   • Bloom luminance threshold raised to avoid washing models
 *
 * Performance guard: disabled on mobile, <=4 cores, prefers-reduced-motion.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

interface PostFXProps {
  scrollProgress?: number
  activeTrackIndex?: number
}

// Track transition boundaries
const TRANSITION_BOUNDARIES = [0.15, 0.26, 0.37, 0.48, 0.59, 0.70]

// Minimum aberration at rest (zero at rest per requirement 6)
const ABERRATION_BASE    = 0.0
// Maximum aberration peak during fast scroll
const ABERRATION_MAX     = 0.006
// Velocity time-constant (seconds) for exponential decay (~300ms)
const VELOCITY_DECAY_TAU = 0.09

export function PostFX({ scrollProgress = 0 }: PostFXProps) {
  const aberrationOffset = useRef(new THREE.Vector2(ABERRATION_BASE, ABERRATION_BASE))
  // Keep a mutable ref for scrollProgress so useFrame always sees current value
  const scrollRef     = useRef(scrollProgress)
  const prevScroll    = useRef(scrollProgress)
  const velocityRef   = useRef(0)

  // Sync scroll ref each render (this runs before useFrame)
  scrollRef.current = scrollProgress

  const shouldRender = useMemo(() => {
    if (typeof window === 'undefined') return false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile      = window.innerWidth < 768
    const isLowEnd      = (navigator.hardwareConcurrency ?? 8) <= 4
    return !reducedMotion && !isMobile && !isLowEnd
  }, [])

  useFrame((_, delta) => {
    if (!shouldRender) return

    const current = scrollRef.current
    const scrollDelta = Math.abs(current - prevScroll.current)
    prevScroll.current = current

    // Instant velocity (scroll units per second)
    const instantVelocity = scrollDelta / Math.max(delta, 0.001)

    // velocityRef = max(instantVelocity, decay of previous)
    velocityRef.current = Math.max(
      instantVelocity,
      velocityRef.current * Math.exp(-delta / VELOCITY_DECAY_TAU),
    )

    // Proximity to nearest transition boundary
    let minDist = 1.0
    for (const b of TRANSITION_BOUNDARIES) {
      const d = Math.abs(current - b)
      if (d < minDist) minDist = d
    }
    const boundaryProximity = Math.max(0, 1 - minDist / 0.025)

    // Target aberration strength: velocity-driven + boundary-proximity boost
    const velocityContrib  = Math.min(ABERRATION_MAX * 0.7, velocityRef.current * 0.004)
    const boundaryContrib  = boundaryProximity * ABERRATION_MAX * 0.5
    const target = ABERRATION_BASE + velocityContrib + boundaryContrib

    // Smooth the value (fast attack, slow decay)
    const lerpSpeed = target > aberrationOffset.current.x ? 12 : 5
    const val = THREE.MathUtils.lerp(aberrationOffset.current.x, target, Math.min(1, delta * lerpSpeed))
    aberrationOffset.current.set(val, val)
  })

  if (!shouldRender) return null

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom — slightly tighter threshold so model bodies aren't washed out */}
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Chromatic Aberration — only spikes during fast scroll */}
      <ChromaticAberration
        offset={aberrationOffset.current}
        radialModulation={false}
        modulationOffset={0.15}
      />

      {/* Subtle film grain — reduced from 0.035 */}
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.022}
      />

      {/* Cinematic vignette — subtle so side character areas stay bright */}
      <Vignette
        offset={0.45}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
