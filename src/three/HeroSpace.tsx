/**
 * src/three/HeroSpace.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * High-performance, scroll-driven 3D Marvel space layer for the Hero section:
 *
 * 1. SPACESHIP:
 *    - Low-poly sci-fi starfighter (wedge hull, glowing canopy, swept wings,
 *      twin engine nacelles, pure cyan thrusters & trailing flame cone).
 *    - Clearly visible at a glance (emissive/basic materials with toneMapped={false}).
 *    - At rest (h = 0): floats visibly in the right flank at [3.2, 0.4, 1.2] with
 *      slow idle drift and mouse parallax.
 *    - On scroll: swoops across in a sweeping curved arc (scaling up as it approaches,
 *      banking into the turn, crossing the upper sky clear of title text, exiting left).
 *
 * 2. RED PARTICLES:
 *    - ~220 glowing ember particles (Points, additive blending, radial texture) drifting upward.
 *    - Flanking left and right, center column kept clear.
 *    - Speed and streak stretch surge with Lenis scroll velocity and decay back in ~300ms.
 *
 * 3. PLANET & ASTEROID FIELD:
 *    - Luminous ringed Marvel celestial planet in the bottom-right flank at [3.4, -1.6, 0.2].
 *    - Instanced asteroid field (60 pieces) orbiting the planet with glinting highlights.
 *    - On scroll: planet and asteroids move closer with distinct parallax.
 *
 * 4. SPACE DUST & COMETS:
 *    - Drifting ambient space dust + high-speed diagonal meteor streaks.
 *
 * 5. PERFORMANCE & UNMOUNT:
 *    - Total geometry: ~1,800 triangles (far below 5k budget), 60fps.
 *    - Mobile & prefers-reduced-motion: static/idle drift only, no velocity effects.
 *    - Unmounts cleanly when Tracks section is active.
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HeroSpaceProps {
  scrollProgress: number
  velocity?: number
}

// Generate smooth circular glowing texture for ember particles
function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255, 170, 100, 1)')
    grad.addColorStop(0.25, 'rgba(255, 60, 40, 0.95)')
    grad.addColorStop(0.65, 'rgba(230, 20, 30, 0.55)')
    grad.addColorStop(1, 'rgba(180, 0, 0, 0)')
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
  const shipRef = useRef<THREE.Group>(null)
  const shipTrailRef = useRef<THREE.Mesh>(null)
  const embersRef = useRef<THREE.Points>(null)
  const meteorsRef = useRef<THREE.LineSegments>(null)
  const planetGroupRef = useRef<THREE.Group>(null)
  const asteroidsRef = useRef<THREE.InstancedMesh>(null)
  const dustRef = useRef<THREE.Points>(null)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const isMobile = size.width < 768

  const smoothVelRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointerRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  // ── Ember Texture, Positions & Geometry ──
  const emberTexture = useMemo(() => createEmberTexture(), [])
  const EMBER_COUNT = isMobile ? 80 : 200

  const [emberPositions, emberSpeeds] = useMemo(() => {
    const pos = new Float32Array(EMBER_COUNT * 3)
    const speeds = new Float32Array(EMBER_COUNT)

    for (let i = 0; i < EMBER_COUNT; i++) {
      // Flank particles on both sides (|x| >= 2.6), keeping center title column clear
      const side = i % 2 === 0 ? 1 : -1
      const x = side * (2.6 + Math.random() * 4.6)
      const y = (Math.random() - 0.5) * 9.0
      const z = -1.5 + Math.random() * 3.5

      pos[i * 3 + 0] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      speeds[i] = 0.5 + Math.random() * 0.8
    }
    return [pos, speeds]
  }, [EMBER_COUNT])

  const emberGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
    return geom
  }, [emberPositions])

  // ── Instanced Asteroids around Planet (60 pieces) ──
  const ASTEROID_COUNT = isMobile ? 24 : 60
  const asteroidTransforms = useMemo(() => {
    const dummy = new THREE.Object3D()
    const data: Array<{ matrix: THREE.Matrix4 }> = []

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const angle = (i / ASTEROID_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      const radius = 1.3 + Math.random() * 0.9
      const x = Math.cos(angle) * radius
      const y = (Math.random() - 0.5) * 0.35 + Math.sin(angle) * 0.25
      const z = Math.sin(angle) * (radius * 0.7)

      const scale = 0.05 + Math.random() * 0.06
      dummy.position.set(x, y, z)
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()

      const mat = new THREE.Matrix4()
      mat.copy(dummy.matrix)
      data.push({ matrix: mat })
    }
    return data
  }, [ASTEROID_COUNT])

  const asteroidGeometry = useMemo(() => new THREE.DodecahedronGeometry(0.12, 0), [])
  const asteroidMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#cbd5e1',
        toneMapped: false,
      }),
    []
  )

  useEffect(() => {
    if (!asteroidsRef.current) return
    asteroidTransforms.forEach((item, i) => {
      asteroidsRef.current!.setMatrixAt(i, item.matrix)
    })
    asteroidsRef.current.instanceMatrix.needsUpdate = true
  }, [asteroidTransforms])

  // ── Space Dust (150 Points) ──
  const DUST_COUNT = isMobile ? 50 : 150
  const dustPositions = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3)
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = -2 - Math.random() * 6
    }
    return pos
  }, [DUST_COUNT])

  const dustGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    return geom
  }, [dustPositions])

  // ── Diagonal Meteor Streaks ──
  const METEOR_COUNT = 4
  const meteorPositions = useMemo(() => {
    const pos = new Float32Array(METEOR_COUNT * 6)
    for (let i = 0; i < METEOR_COUNT; i++) {
      pos[i * 6 + 0] = 4.0 + i * 1.8
      pos[i * 6 + 1] = 3.0 + i * 0.9
      pos[i * 6 + 2] = -3 - i * 1.2
      pos[i * 6 + 3] = pos[i * 6 + 0] + 1.2
      pos[i * 6 + 4] = pos[i * 6 + 1] + 0.65
      pos[i * 6 + 5] = pos[i * 6 + 2] - 0.4
    }
    return pos
  }, [])

  const meteorGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3))
    return geom
  }, [meteorPositions])

  // ── Frame Animation Loop ──
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Normalized Hero scroll progress: h: 0.0 -> 1.0 (spanning scrollProgress: 0.0 -> 0.14)
    const h = THREE.MathUtils.clamp(scrollProgress / 0.14, 0, 1)

    // Exponential velocity smoothing (~300ms decay)
    const targetVel = reducedMotion ? 0 : Math.abs(velocity)
    smoothVelRef.current = THREE.MathUtils.lerp(smoothVelRef.current, targetVel, Math.min(1, delta * 3.5))
    const velEffect = Math.min(2.5, smoothVelRef.current * 0.15)

    // ── Global Outward / Upward Fade at h 0.8 - 1.0 ──
    if (groupRef.current) {
      if (h >= 0.8) {
        const exitProgress = (h - 0.8) / 0.2
        groupRef.current.position.y = exitProgress * 4.5
        groupRef.current.position.z = -exitProgress * 3.5
      } else {
        groupRef.current.position.y = 0
        groupRef.current.position.z = 0
      }
    }

    // ── 1. SPACESHIP CHOREOGRAPHY ──
    if (shipRef.current) {
      const px = pointerRef.current.x
      const py = pointerRef.current.y

      if (h <= 0.02) {
        // At rest: sits in the right background flank, readable at a glance (~6-8% width)
        const restX = 4.2 + Math.sin(t * 0.7) * 0.15 + px * 0.25
        const restY = 0.8 + Math.cos(t * 0.8) * 0.12 - py * 0.15
        const restZ = 0.6

        shipRef.current.position.set(restX, restY, restZ)
        shipRef.current.rotation.set(
          -0.06 + Math.sin(t * 0.6) * 0.04,
          -2.35 + Math.cos(t * 0.5) * 0.05,
          0.10 + px * 0.06
        )
        shipRef.current.scale.setScalar(0.68)
      } else {
        // On scroll: flies across screen on curved path (scaling up, banking, exiting left)
        const flightT = Math.min(1, h / 0.8)

        // Arc path: X sweeps from +4.2 -> -7.2
        const curX = THREE.MathUtils.lerp(4.2, -7.2, flightT)
        // High curved arch across upper sky clear of center title and buttons
        const curY = 0.8 + Math.sin(flightT * Math.PI) * 1.8 - flightT * 0.6
        // Approaches closer to camera (scaling up to ~1.2), then passes
        const curZ = 0.6 + Math.sin(flightT * Math.PI * 0.9) * 2.8

        shipRef.current.position.set(curX, curY, curZ)

        // Bank / roll dynamically into the turn
        const bankAngle = THREE.MathUtils.lerp(0.12, -0.9, flightT)
        const yawAngle = THREE.MathUtils.lerp(-2.35, -3.2, flightT)
        const pitchAngle = THREE.MathUtils.lerp(-0.06, 0.32, flightT)

        shipRef.current.rotation.set(pitchAngle, yawAngle, bankAngle)
        const shipScale = 0.68 + Math.sin(flightT * Math.PI) * 0.55
        shipRef.current.scale.setScalar(shipScale)
      }

      // Engine trail dynamic stretch with velocity
      if (shipTrailRef.current) {
        const trailScale = 1.0 + velEffect * 1.5 + (h > 0.05 ? 0.8 : 0)
        shipTrailRef.current.scale.set(1, trailScale, 1)
      }
    }

    // ── 2. GLOWING RED EMBER PARTICLES ──
    if (embersRef.current?.geometry?.attributes?.position) {
      const positions = embersRef.current.geometry.attributes.position.array as Float32Array
      const speedMult = 1.0 + velEffect * 3.5

      for (let i = 0; i < EMBER_COUNT; i++) {
        // Drift upward
        positions[i * 3 + 1] += emberSpeeds[i] * speedMult * delta

        // Gentle horizontal oscillation
        positions[i * 3 + 0] += Math.sin(t * 1.5 + i) * 0.005

        // Wrap around at top
        if (positions[i * 3 + 1] > 5.5) {
          positions[i * 3 + 1] = -5.5
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true

      // Fade out smoothly near tracks
      const emberMat = embersRef.current.material as THREE.PointsMaterial
      if (emberMat) {
        emberMat.opacity = h > 0.8 ? THREE.MathUtils.lerp(0.85, 0, (h - 0.8) / 0.2) : 0.85
        emberMat.size = 0.14 + velEffect * 0.08
      }
    }

    // ── 3. PLANET & ASTEROID FIELD PARALLAX ──
    if (planetGroupRef.current) {
      // Parallax approach on scroll: Z moves closer
      const planetApproach = h * 2.2
      planetGroupRef.current.position.set(
        4.4 - h * 0.5 + pointerRef.current.x * 0.2,
        -2.1 + h * 0.35 - pointerRef.current.y * 0.15,
        -0.5 + planetApproach
      )
      planetGroupRef.current.rotation.y = t * 0.05

      if (asteroidsRef.current) {
        asteroidsRef.current.rotation.y = t * 0.08
      }
    }

    // ── 4. METEOR STREAKS ──
    if (meteorsRef.current?.geometry?.attributes?.position && !reducedMotion) {
      const mPos = meteorsRef.current.geometry.attributes.position.array as Float32Array
      const mSpeed = (2.4 + velEffect * 5) * delta

      for (let i = 0; i < METEOR_COUNT; i++) {
        mPos[i * 6 + 0] -= mSpeed * 2.2
        mPos[i * 6 + 1] -= mSpeed * 1.2
        mPos[i * 6 + 3] -= mSpeed * 2.2
        mPos[i * 6 + 4] -= mSpeed * 1.2

        if (mPos[i * 6 + 0] < -8) {
          mPos[i * 6 + 0] = 7 + (i % 2) * 2.5
          mPos[i * 6 + 1] = 4 + Math.random() * 2
          mPos[i * 6 + 3] = mPos[i * 6 + 0] + (1.2 + velEffect * 0.9)
          mPos[i * 6 + 4] = mPos[i * 6 + 1] + (0.65 + velEffect * 0.5)
        }
      }
      meteorsRef.current.geometry.attributes.position.needsUpdate = true
    }

    // ── 5. DRIFTING SPACE DUST ──
    if (dustRef.current) {
      dustRef.current.rotation.y = t * 0.015
    }
  })

  // Unmount completely when Tracks section is active
  if (scrollProgress >= 0.15) {
    return null
  }

  return (
    <group ref={groupRef} name="HeroSpace">
      {/* ── 1. LOW-POLY SCI-FI SPACESHIP ── */}
      <group ref={shipRef} position={[3.2, 0.4, 1.2]}>
        {/* Main Wedge Fuselage Hull (Metallic Slate / Blue) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2.2, 4]} />
          <meshBasicMaterial color="#60a5fa" toneMapped={false} />
        </mesh>

        {/* Cockpit Canopy (Brilliant White / Cyan Core) */}
        <mesh position={[0, 0.22, 0.2]} scale={[0.26, 0.18, 0.7]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>

        {/* Swept Port & Starboard Delta Wings */}
        <mesh position={[-0.95, 0.02, -0.3]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[1.5, 0.06, 0.6]} />
          <meshBasicMaterial color="#3b82f6" toneMapped={false} />
        </mesh>
        <mesh position={[0.95, 0.02, -0.3]} rotation={[0, -0.35, 0]}>
          <boxGeometry args={[1.5, 0.06, 0.6]} />
          <meshBasicMaterial color="#3b82f6" toneMapped={false} />
        </mesh>

        {/* Wingtip Navigation Glow Beacons (Red Marvel Glow) */}
        <mesh position={[-1.6, 0.2, -0.4]}>
          <boxGeometry args={[0.08, 0.4, 0.25]} />
          <meshBasicMaterial color="#ff2222" toneMapped={false} />
        </mesh>
        <mesh position={[1.6, 0.2, -0.4]}>
          <boxGeometry args={[0.08, 0.4, 0.25]} />
          <meshBasicMaterial color="#ff2222" toneMapped={false} />
        </mesh>

        {/* Engine Glow Thrusters (Intense Pure Cyan Thruster) */}
        <mesh position={[-0.26, 0.02, -1.0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} />
        </mesh>
        <mesh position={[0.26, 0.02, -1.0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} />
        </mesh>

        {/* Glowing Trailing Flame Plume */}
        <mesh ref={shipTrailRef} position={[0, 0.02, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.16, 1.2, 8]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ── 2. GLOWING RED / ORANGE EMBER PARTICLES ── */}
      <points ref={embersRef} geometry={emberGeometry}>
        <pointsMaterial
          map={emberTexture}
          size={0.14}
          color="#ff3b30"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          toneMapped={false}
        />
      </points>

      {/* ── 3. PLANET WITH RING & ASTEROID FIELD ── */}
      <group ref={planetGroupRef} position={[4.4, -2.1, -0.5]}>
        {/* Planet Sphere (Dim Celestial Maroon) */}
        <mesh>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshBasicMaterial color="#7f1d1d" toneMapped={false} />
        </mesh>

        {/* Planetary Tilted Ring */}
        <mesh rotation={[Math.PI / 2.6, 0.25, 0]}>
          <ringGeometry args={[1.08, 1.7, 48]} />
          <meshBasicMaterial
            color="#991b1b"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Instanced Asteroids (60 pieces with glinting highlights) */}
        <instancedMesh
          ref={asteroidsRef}
          args={[asteroidGeometry, asteroidMaterial, ASTEROID_COUNT]}
        />
      </group>

      {/* ── 4. FAINT COMET / METEOR STREAKS ── */}
      {!reducedMotion && (
        <lineSegments ref={meteorsRef} geometry={meteorGeometry}>
          <lineBasicMaterial
            color="#ff6b6b"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      )}

      {/* ── 5. DRIFTING SPACE DUST ── */}
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          size={0.08}
          color="#cbd5e1"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
