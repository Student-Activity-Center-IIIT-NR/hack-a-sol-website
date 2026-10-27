/**
 * src/three/PostFX.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance-optimized Post-Processing pass:
 * - One EffectComposer with multisampling = 0
 * - Bloom with mipmapBlur and reduced resolution (about 0.5)
 * - ChromaticAberration & Noise active ONLY while scroll velocity is above threshold
 *   (otherwise not rendered at all)
 * - Automatically disabled when:
 *     1. Running on mobile (width < 768)
 *     2. Prefers-reduced-motion
 *     3. FPS stays below 45 for >= 2.0 seconds
 *     4. Switched OFF in Leva debug panel (?debug=1)
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { scrollStore } from '../utils/scrollStore'
import { perfStore } from '../utils/perfStore'
import { warnZeroSize, isPhoneDevice } from '../utils/webglGuard'

interface PostFXProps {
  scrollProgress?: number
  activeTrackIndex?: number
}

// Velocity threshold above which chromatic aberration and noise become active
const VELOCITY_THRESHOLD = 0.35
const ABERRATION_MAX = 0.005

export function PostFX(_props: PostFXProps) {
  const { size } = useThree()
  const aberrationOffset = useRef(new THREE.Vector2(0, 0))
  const [isFastScroll, setIsFastScroll] = useState(false)
  const [disabledByLowFps, setDisabledByLowFps] = useState(false)
  const [postProcessingEnabled, setPostProcessingEnabled] = useState(true)

  const lowFpsTimer = useRef(0)
  const isFastScrollRef = useRef(false)

  // Listen to Leva toggle from perfStore
  useEffect(() => {
    return perfStore.subscribe((toggles) => {
      setPostProcessingEnabled(toggles.postProcessing)
    })
  }, [])

  // Phones (window width < 900, coarse pointer, or hardwareConcurrency < 4) / accessibility check
  const isPhone = useMemo(() => isPhoneDevice(), [])
  const isMobileOrReduced = useMemo(() => {
    if (typeof window === 'undefined') return true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return reducedMotion || isPhoneDevice()
  }, [])

  useFrame((state, delta) => {
    if (state.size.width <= 0 || state.size.height <= 0) {
      warnZeroSize('PostFX')
      return
    }
    if (isPhone || isMobileOrReduced || !postProcessingEnabled || disabledByLowFps) return

    // 1. Check FPS guard (disable if stays below 45 fps for 2 continuous seconds)
    const instantFps = 1 / Math.max(delta, 0.001)
    if (instantFps < 45) {
      lowFpsTimer.current += delta
      if (lowFpsTimer.current >= 2.0) {
        setDisabledByLowFps(true)
      }
    } else {
      lowFpsTimer.current = Math.max(0, lowFpsTimer.current - delta * 0.5)
    }

    // 2. Velocity check for chromatic aberration and noise
    const currentVel = scrollStore.getVelocity()
    const active = currentVel > VELOCITY_THRESHOLD

    if (active !== isFastScrollRef.current) {
      isFastScrollRef.current = active
      setIsFastScroll(active)
    }

    if (active) {
      const targetOffset = Math.min(ABERRATION_MAX, currentVel * 0.003)
      aberrationOffset.current.lerp(new THREE.Vector2(targetOffset, targetOffset), Math.min(1, delta * 12))
    }
  })

  // Full guard checks: skip entirely on phones, zero size, mobile, low FPS, or toggle off
  if (
    size.width <= 0 ||
    size.height <= 0 ||
    isPhone ||
    isMobileOrReduced ||
    !postProcessingEnabled ||
    disabledByLowFps
  ) {
    if (size.width <= 0 || size.height <= 0) {
      warnZeroSize('PostFX')
    }
    return null
  }

  if (isFastScroll) {
    return (
      <EffectComposer multisampling={0}>
        {/* Bloom with mipmapBlur and reduced resolution (about 0.5) */}
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.58}
          luminanceSmoothing={0.85}
          mipmapBlur
          resolutionScale={0.5}
        />
        {/* Chromatic Aberration and Noise active ONLY during fast scroll */}
        <ChromaticAberration
          offset={aberrationOffset.current}
          radialModulation={false}
          modulationOffset={0.15}
        />
        <Noise
          premultiply
          blendFunction={BlendFunction.ADD}
          opacity={0.02}
        />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom with mipmapBlur and reduced resolution (about 0.5) */}
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.58}
        luminanceSmoothing={0.85}
        mipmapBlur
        resolutionScale={0.5}
      />
    </EffectComposer>
  )
}
