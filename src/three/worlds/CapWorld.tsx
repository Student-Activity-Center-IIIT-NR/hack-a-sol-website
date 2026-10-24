/**
 * src/three/worlds/CapWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * cybersec — "SHIELD Digital Defense"
 *
 * Requirements:
 * - Removed all hexagonal rings completely.
 * - Circular shield defense rings around character (charX = 1.6 on right).
 * - Soft sparks and tactical energy aura.
 * - Strict visible={active} and early useFrame return when !active to prevent leakage.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface CapWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const RED  = new THREE.Color("#EF4444")
const BLUE = new THREE.Color("#3B82F6")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

function createSoftSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.3, "rgba(239, 68, 68, 0.85)")
    grad.addColorStop(0.7, "rgba(59, 130, 246, 0.3)")
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const SPARK_COUNT = 60
const CHAR_X = 1.6 // Consistent right side character anchor

function makeShieldSparks() {
  const pos = new Float32Array(SPARK_COUNT * 3)
  const dirs = new Float32Array(SPARK_COUNT * 3)
  const speeds = new Float32Array(SPARK_COUNT)

  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = (i / SPARK_COUNT) * Math.PI * 2
    const r = 0.5 + Math.random() * 2.0
    pos[i * 3 + 0] = CHAR_X + Math.cos(angle) * r
    pos[i * 3 + 1] = Math.sin(angle) * r
    pos[i * 3 + 2] = -0.7 + (Math.random() - 0.5) * 1.5

    dirs[i * 3 + 0] = Math.cos(angle)
    dirs[i * 3 + 1] = Math.sin(angle)
    dirs[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    speeds[i] = 0.3 + Math.random() * 0.5
  }
  return { pos, dirs, speeds }
}

export function CapWorld({ chapterProgress: _c, active, velocity: _v }: CapWorldProps) {
  const groupRef     = useRef<THREE.Group>(null)
  const shieldRingsRef = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const sparksRef    = useRef<THREE.Points>(null)
  const timeRef      = useRef(0)

  const sparkTex  = useMemo(() => createSoftSparkTexture(), [])
  const sparkData = useMemo(() => makeShieldSparks(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    if (state.size.width <= 0 || state.size.height <= 0) return
    if (!active) return

    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)

    if (groupRef.current) {
      const ty = state.pointer.x * 0.22
      const tx = -state.pointer.y * 0.14
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Circular vibranium concentric shield rings (NO hexagons)
    shieldRingsRef.forEach((ringRef, i) => {
      if (!ringRef.current) return
      ringRef.current.rotation.z += (i % 2 === 0 ? 0.3 : -0.3) * delta
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.opacity = (0.35 - i * 0.08) * liveA
      }
    })

    // Sparks pulsing outward around shield
    if (sparksRef.current?.geometry?.attributes?.position) {
      const pos = sparksRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < SPARK_COUNT; i++) {
        const cycle = (t * sparkData.speeds[i] + i * 0.1) % 1
        pos[i * 3 + 0] = CHAR_X + sparkData.dirs[i * 3 + 0] * (0.4 + cycle * 2.0)
        pos[i * 3 + 1] = sparkData.dirs[i * 3 + 1] * (0.4 + cycle * 2.0)
        pos[i * 3 + 2] = -0.7 + sparkData.dirs[i * 3 + 2] * cycle
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true

      const sMat = sparksRef.current.material as THREE.PointsMaterial
      if (sMat) {
        sMat.opacity = 0.65 * a
      }
    }
  })

  return (
    <group ref={groupRef} visible={active}>
      {/* Concentric circular vibranium shield rings (smooth 64-segment circles, ZERO hexagons) */}
      {[1.2, 1.8, 2.3].map((radius, i) => (
        <mesh key={i} ref={shieldRingsRef[i]} position={[CHAR_X, 0, -0.9]}>
          <ringGeometry args={[radius - 0.025, radius, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? RED : BLUE}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Shield sparks */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sparkTex}
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.65 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <pointLight color={RED}  intensity={a * 1.0} distance={10} decay={2} position={[CHAR_X, 0, 0]} />
      <pointLight color={BLUE} intensity={a * 0.6} distance={8}  decay={2} position={[CHAR_X - 1.2, 1.2, 0]} />
    </group>
  )
}