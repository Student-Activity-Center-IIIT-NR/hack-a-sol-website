/**
 * src/three/PostFX.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Multiverse Post-processing:
 *   • Bloom: Glow for emissive surfaces (arc reactor, vibranium crystals, Doctor Strange mandalas)
 *   • ChromaticAberration: Dynamic portal warp / chromatic pulse during track transitions
 *   • Noise: Subtle comic film grain
 *   • Vignette: Cinematic corner darkening
 *
 * Performance guard:
 *   Disabled automatically on mobile (<768px), low-concurrency CPUs (<=4 cores),
 *   or prefers-reduced-motion.
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

// Track transition boundaries in scroll space (0→1)
const TRANSITION_BOUNDARIES = [0.15, 0.26, 0.37, 0.48, 0.59, 0.70]

export function PostFX({ scrollProgress = 0 }: PostFXProps) {
  const aberrationOffset = useRef(new THREE.Vector2(0.0008, 0.0008))
  const lastScroll = useRef(scrollProgress)

  const shouldRender = useMemo(() => {
    if (typeof window === 'undefined') return false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768
    const isLowEnd = (navigator.hardwareConcurrency ?? 8) <= 4
    return !reducedMotion && !isMobile && !isLowEnd
  }, [])

  useFrame((_, delta) => {
    if (!shouldRender) return

    // Calculate scroll speed
    const scrollDelta = Math.abs(scrollProgress - lastScroll.current)
    lastScroll.current = scrollProgress

    // Calculate proximity to any track transition boundary
    let minDistanceToBoundary = 1.0
    for (const b of TRANSITION_BOUNDARIES) {
      const d = Math.abs(scrollProgress - b)
      if (d < minDistanceToBoundary) minDistanceToBoundary = d
    }

    // Portal warp peak when within 0.02 of boundary
    const boundaryProximity = Math.max(0, 1 - minDistanceToBoundary / 0.02)
    const warpIntensity = Math.min(0.008, 0.0006 + boundaryProximity * 0.005 + scrollDelta * 0.04)

    // Smooth lerp for aberration offset
    aberrationOffset.current.x = THREE.MathUtils.lerp(
      aberrationOffset.current.x,
      warpIntensity,
      Math.min(1, delta * 6)
    )
    aberrationOffset.current.y = THREE.MathUtils.lerp(
      aberrationOffset.current.y,
      warpIntensity,
      Math.min(1, delta * 6)
    )
  })

  if (!shouldRender) return null

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom glow for energy cores, shields, runes */}
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.85}
        mipmapBlur
      />

      {/* Dynamic Chromatic Aberration portal transition pulse */}
      <ChromaticAberration
        offset={aberrationOffset.current}
        radialModulation={false}
        modulationOffset={0.15}
      />

      {/* Subtle comic film grain */}
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.035}
      />

      {/* Cinematic Vignette */}
      <Vignette
        offset={0.35}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
