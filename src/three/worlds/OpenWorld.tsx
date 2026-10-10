/**
 * src/three/worlds/OpenWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * open — "Open / Spider-Man"
 *
 * Requirements:
 * - A spider web (radial and concentric lines) that draws itself progressively as c goes 0 -> 0.6.
 * - Glowing nodes at the intersections.
 * - Dim city skyline silhouette at the bottom.
 * - A few swing-arc light trails that stretch with scroll velocity.
 * - Generic shapes only, no copyrighted logos.
 * - ENTER / HOLD / EXIT phases driven by chapterProgress c, activeIndex, and Lenis velocity.
 * - Under ~1000 particles/triangles, soft glow sprites, capped on-screen size.
 * - Strict: NO radar, radar-sense, sweep, or rotating light-beam effect.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface OpenWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const TEAL        = new THREE.Color("#14B8A6")
const TEAL_BRIGHT = new THREE.Color("#5EEAD4")
const CHAR_X      = 1.6 // Track index 4: text on left, character on right

function ss(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number) {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Generate soft teal glow sprite texture
function createTealGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.25, "rgba(94, 234, 212, 0.9)")
    grad.addColorStop(0.65, "rgba(20, 184, 166, 0.25)")
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

// ── Web Geometry Definitions (capped <= 60% of art box size) ──
const SPOKE_COUNT = 8
const RING_COUNT  = 5
const MAX_RADIUS  = 1.35

// Total lines in web:
// 8 radial spokes (8 lines) + 5 rings of 8 segments each (40 lines) = 48 lines = 96 vertices = 288 floats
const TOTAL_WEB_LINES = SPOKE_COUNT + SPOKE_COUNT * RING_COUNT

// City silhouette data (12 simple building rectangles)
const BUILDING_COUNT = 12
function makeCityBuildings() {
  const buildings = []
  const startX = -4.2
  const widthStep = 0.7
  for (let i = 0; i < BUILDING_COUNT; i++) {
    const width = 0.45 + (i % 3) * 0.12
    const height = 1.0 + (i % 4) * 0.45 + Math.sin(i * 1.5) * 0.2
    const x = startX + i * widthStep + (Math.random() - 0.5) * 0.1
    const y = -2.6 + height / 2
    const z = -2.2 + (i % 2) * 0.3
    buildings.push({ x, y, z, width, height })
  }
  return buildings
}

// Swing-arc trail trajectories (4 light trails)
const TRAIL_COUNT = 4
const TRAIL_SEGS  = 16 // 16 segments per trail

export function OpenWorld({ chapterProgress: _c, active, velocity: _v }: OpenWorldProps) {
  const groupRef       = useRef<THREE.Group>(null)
  const webLinesRef    = useRef<THREE.LineSegments>(null)
  const webNodesRef    = useRef<THREE.Points>(null)
  const trailsRef      = useRef<THREE.LineSegments>(null)
  const timeRef        = useRef(0)

  const softTex     = useMemo(() => createTealGlowTexture(), [])
  const buildings   = useMemo(() => makeCityBuildings(), [])

  // Web buffers: 48 line segments * 2 vertices * 3 coords = 288 floats
  const webLineBuffer = useMemo(() => new Float32Array(TOTAL_WEB_LINES * 2 * 3), [])

  // Node positions: 40 intersection nodes + 1 center node = 41 nodes = 123 floats
  const nodeCount = SPOKE_COUNT * RING_COUNT + 1
  const nodePosBuffer = useMemo(() => {
    const buf = new Float32Array(nodeCount * 3)
    // Node 0: Center
    buf[0] = CHAR_X
    buf[1] = 0.1
    buf[2] = -0.8
    let idx = 1
    for (let r = 1; r <= RING_COUNT; r++) {
      const radius = (r / RING_COUNT) * MAX_RADIUS
      for (let s = 0; s < SPOKE_COUNT; s++) {
        const angle = (s / SPOKE_COUNT) * Math.PI * 2
        buf[idx * 3 + 0] = CHAR_X + Math.cos(angle) * radius
        buf[idx * 3 + 1] = 0.1 + Math.sin(angle) * radius * 0.85
        buf[idx * 3 + 2] = -0.8 + Math.sin(angle * 2) * 0.1
        idx++
      }
    }
    return buf
  }, [nodeCount])

  // Swing-arc trail buffer: 4 trails * 15 line segments * 2 * 3 = 360 floats
  const trailBuffer = useMemo(() => new Float32Array(TRAIL_COUNT * (TRAIL_SEGS - 1) * 2 * 3), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    if (!active) return

    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(2.0, Math.abs(liveVel || _v || 0) * 3.0)

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // 1. Spider web draws itself progressively as c goes 0 -> 0.6
    // At c = 0, drawProgress = 0. At c >= 0.6, drawProgress = 1.0
    const webProgress = ss(Math.max(0, Math.min(1, liveC / 0.6)))
    const currentMaxR = MAX_RADIUS * webProgress
    const centerX = CHAR_X
    const centerY = 0.1
    const centerZ = -0.8

    if (webLinesRef.current?.geometry?.attributes?.position) {
      const pos = webLinesRef.current.geometry.attributes.position.array as Float32Array
      let lineIdx = 0

      // A. Radial spokes (8 lines)
      for (let s = 0; s < SPOKE_COUNT; s++) {
        const angle = (s / SPOKE_COUNT) * Math.PI * 2
        // Start at center
        pos[lineIdx * 6 + 0] = centerX
        pos[lineIdx * 6 + 1] = centerY
        pos[lineIdx * 6 + 2] = centerZ

        // End extends to currentMaxR
        pos[lineIdx * 6 + 3] = centerX + Math.cos(angle) * currentMaxR
        pos[lineIdx * 6 + 4] = centerY + Math.sin(angle) * currentMaxR * 0.85
        pos[lineIdx * 6 + 5] = centerZ + Math.sin(angle * 2) * 0.1
        lineIdx++
      }

      // B. Concentric rings (5 rings * 8 segments each)
      for (let r = 1; r <= RING_COUNT; r++) {
        const ringTargetR = (r / RING_COUNT) * MAX_RADIUS
        // Ring appears if webProgress has reached this ring's fraction
        const ringFraction = r / RING_COUNT
        const ringVisible = webProgress >= ringFraction * 0.75
        const ringAlpha = ss(Math.max(0, Math.min(1, (webProgress - ringFraction * 0.75) / 0.25)))
        const activeRadius = ringTargetR * ringAlpha

        for (let s = 0; s < SPOKE_COUNT; s++) {
          const a1 = (s / SPOKE_COUNT) * Math.PI * 2
          const a2 = (((s + 1) % SPOKE_COUNT) / SPOKE_COUNT) * Math.PI * 2

          if (ringVisible && activeRadius > 0.05) {
            pos[lineIdx * 6 + 0] = centerX + Math.cos(a1) * activeRadius
            pos[lineIdx * 6 + 1] = centerY + Math.sin(a1) * activeRadius * 0.85
            pos[lineIdx * 6 + 2] = centerZ + Math.sin(a1 * 2) * 0.1

            pos[lineIdx * 6 + 3] = centerX + Math.cos(a2) * activeRadius
            pos[lineIdx * 6 + 4] = centerY + Math.sin(a2) * activeRadius * 0.85
            pos[lineIdx * 6 + 5] = centerZ + Math.sin(a2 * 2) * 0.1
          } else {
            // Collapse segment to center if not drawn yet
            pos[lineIdx * 6 + 0] = centerX
            pos[lineIdx * 6 + 1] = centerY
            pos[lineIdx * 6 + 2] = centerZ
            pos[lineIdx * 6 + 3] = centerX
            pos[lineIdx * 6 + 4] = centerY
            pos[lineIdx * 6 + 5] = centerZ
          }
          lineIdx++
        }
      }

      webLinesRef.current.geometry.attributes.position.needsUpdate = true
      const lMat = webLinesRef.current.material as THREE.LineBasicMaterial
      if (lMat) {
        lMat.opacity = 0.58 * liveA
      }
    }

    // 2. Glowing nodes at intersections
    if (webNodesRef.current) {
      const nMat = webNodesRef.current.material as THREE.PointsMaterial
      if (nMat) {
        nMat.opacity = 0.8 * webProgress * liveA
        nMat.size = 0.12 + Math.sin(t * 2.5) * 0.02
      }
    }

    // 3. Swing-arc light trails that stretch with scroll velocity
    if (trailsRef.current?.geometry?.attributes?.position) {
      const tPos = trailsRef.current.geometry.attributes.position.array as Float32Array
      let segIdx = 0

      // Generate curved arc swing paths
      for (let tr = 0; tr < TRAIL_COUNT; tr++) {
        const baseSpeed = 0.6 + tr * 0.3
        const trailCycle = (t * baseSpeed * (1 + velBoost * 0.8) + tr * 0.25) % 1
        const arcSpread = 2.4 + velBoost * 1.8
        const arcCenterX = CHAR_X - 1.2 + tr * 0.8
        const arcCenterY = 0.2 + (tr % 2) * 0.4

        for (let s = 0; s < TRAIL_SEGS - 1; s++) {
          const u1 = (s / (TRAIL_SEGS - 1)) * 0.35 + trailCycle
          const u2 = ((s + 1) / (TRAIL_SEGS - 1)) * 0.35 + trailCycle

          const angle1 = u1 * Math.PI
          const angle2 = u2 * Math.PI

          // Quadratic pendulum swing trajectory
          const x1 = arcCenterX + Math.cos(angle1) * arcSpread
          const y1 = arcCenterY - Math.sin(angle1) * 1.6 + Math.cos(angle1 * 2) * 0.3
          const z1 = -1.2 + Math.sin(angle1) * 0.8

          const x2 = arcCenterX + Math.cos(angle2) * arcSpread
          const y2 = arcCenterY - Math.sin(angle2) * 1.6 + Math.cos(angle2 * 2) * 0.3
          const z2 = -1.2 + Math.sin(angle2) * 0.8

          tPos[segIdx * 6 + 0] = x1
          tPos[segIdx * 6 + 1] = y1
          tPos[segIdx * 6 + 2] = z1
          tPos[segIdx * 6 + 3] = x2
          tPos[segIdx * 6 + 4] = y2
          tPos[segIdx * 6 + 5] = z2
          segIdx++
        }
      }

      trailsRef.current.geometry.attributes.position.needsUpdate = true
      const trailMat = trailsRef.current.material as THREE.LineBasicMaterial
      if (trailMat) {
        trailMat.opacity = Math.min(0.85, (0.25 + velBoost * 0.45) * liveA)
      }
    }
  })

  return (
    <group ref={groupRef} visible={active}>
      {/* 1. Spider Web (Capped <= 35% Opacity & <= 60% of Art Box) */}
      <lineSegments ref={webLinesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[webLineBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={TEAL_BRIGHT}
          transparent
          opacity={0.32 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 2. Glowing Nodes at Web Intersections (Subtle) */}
      <points ref={webNodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePosBuffer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          size={0.10}
          sizeAttenuation
          transparent
          opacity={0.35 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 3. Dim City Skyline Silhouette at the bottom */}
      <group position={[0, 0, 0]}>
        {buildings.map((b, i) => (
          <mesh key={i} position={[b.x, b.y, b.z]}>
            <planeGeometry args={[b.width, b.height]} />
            <meshBasicMaterial
              color="#042F2E"
              transparent
              opacity={0.42 * a}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Swing-Arc Light Trails (Stretch with Scroll Velocity) */}
      <lineSegments ref={trailsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={TEAL}
          transparent
          opacity={0.35 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Ambient teal glow point lights */}
      <pointLight color={TEAL_BRIGHT} intensity={a * 1.2} distance={11} decay={2} position={[CHAR_X, 0.2, 0]} />
      <pointLight color="#0D9488" intensity={a * 0.7} distance={8} decay={2} position={[CHAR_X - 1.5, -0.8, -0.5]} />
    </group>
  )
}
