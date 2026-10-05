/**
 * src/three/HeroSpace.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Minimal, subtle red ember particle layer for the Hero section:
 * - 80-100 glowing red/orange embers (Points, additive blending).
 * - Small size, low opacity (max 0.55), slow upward drift.
 * - Gentle streak / speed surge with Lenis scroll velocity (~300ms decay).
 * - Kept strictly along the flanks (|x| >= 2.8) so the center title and buttons
 *   remain completely clear and legible.
 * - Spaceship, planet, asteroids, comet lines, and dust removed per requirement.
 * - Clean unmount when Tracks section is active (scrollProgress >= 0.15).
 */

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HeroSpaceProps {
  scrollProgress: number
  velocity?: number
}

// Generate smooth circular glowing texture for subtle ember particles
function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255, 160, 80, 1)')
    grad.addColorStop(0.3, 'rgba(230, 45, 30, 0.85)')
    grad.addColorStop(0.7, 'rgba(180, 15, 20, 0.35)')
    grad.addColorStop(1, 'rgba(120, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

export function HeroSpace({ scrollProgress, velocity = 0 }: HeroSpaceProps) {
  const { size } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const embersRef = useRef<THREE.Points>(null)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const isMobile = size.width < 768

  const smoothVelRef = useRef(0)

  // ── Ember Texture, Positions & Geometry (80-100 particles) ──
  const emberTexture = useMemo(() => createEmberTexture(), [])
  const EMBER_COUNT = isMobile ? 45 : 90

  const [emberPositions, emberSpeeds] = useMemo(() => {
    const pos = new Float32Array(EMBER_COUNT * 3)
    const speeds = new Float32Array(EMBER_COUNT)

    for (let i = 0; i < EMBER_COUNT; i++) {
      // Flank particles on left and right (|x| >= 2.8), never in center title column
      const side = i % 2 === 0 ? 1 : -1
      const x = side * (2.8 + Math.random() * 4.4)
      const y = (Math.random() - 0.5) * 9.0
      const z = -1.5 + Math.random() * 3.5

      pos[i * 3 + 0] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      speeds[i] = 0.35 + Math.random() * 0.45
    }
    return [pos, speeds]
  }, [EMBER_COUNT])

  const emberGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
    return geom
  }, [emberPositions])

  // ── Frame Animation Loop ──
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const h = THREE.MathUtils.clamp(scrollProgress / 0.14, 0, 1)

    // Smooth velocity decay (~300ms)
    const targetVel = reducedMotion ? 0 : Math.abs(velocity)
    smoothVelRef.current = THREE.MathUtils.lerp(smoothVelRef.current, targetVel, Math.min(1, delta * 3.5))
    const velEffect = Math.min(2.0, smoothVelRef.current * 0.12)

    // Global fade/drift on scroll exit (h >= 0.8)
    if (groupRef.current) {
      if (h >= 0.8) {
        const exitP = (h - 0.8) / 0.2
        groupRef.current.position.y = exitP * 3.0
      } else {
        groupRef.current.position.y = 0
      }
    }

    // Upward drift of red ember particles
    if (embersRef.current?.geometry?.attributes?.position) {
      const positions = embersRef.current.geometry.attributes.position.array as Float32Array
      const speedMult = 1.0 + velEffect * 2.5

      for (let i = 0; i < EMBER_COUNT; i++) {
        // Slow upward drift
        positions[i * 3 + 1] += emberSpeeds[i] * speedMult * delta

        // Subtle horizontal wave
        positions[i * 3 + 0] += Math.sin(t * 1.2 + i) * 0.003

        // Wrap around vertically
        if (positions[i * 3 + 1] > 5.5) {
          positions[i * 3 + 1] = -5.5
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true

      // Gentle fade out as hero transitions to tracks
      const emberMat = embersRef.current.material as THREE.PointsMaterial
      if (emberMat) {
        emberMat.opacity = h > 0.8 ? THREE.MathUtils.lerp(0.55, 0, (h - 0.8) / 0.2) : 0.55
        emberMat.size = 0.11 + velEffect * 0.05
      }
    }
  })

  // Unmount completely when Tracks section is active
  if (scrollProgress >= 0.15) {
    return null
  }

  return (
    <group ref={groupRef} name="HeroSpace">
      <points ref={embersRef} geometry={emberGeometry}>
        <pointsMaterial
          map={emberTexture}
          size={0.11}
          color="#ff3828"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </group>
  )
}
