/**
 * src/three/worlds/StrangeWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * coderun — "Sanctum / Algorithmic Timelines"
 *
 * Per-track signature:
 * - Golden sparks along a spiral vortex around the character (at x ≈ 1.6).
 * - Vortex tightens as chapterProgress c goes from 0.2 to 0.7.
 * - Soft glow sprites, additive blending, mandala rings unfolding.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface StrangeWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const GOLD = new THREE.Color("#F59E0B")
const TEAL = new THREE.Color("#06B6D4")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

function createGoldSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.25, "rgba(245, 158, 11, 0.9)")
    grad.addColorStop(0.65, "rgba(217, 119, 6, 0.25)")
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const VORTEX_SPARK_COUNT = 180

function makeVortexSparks() {
  const baseAngles = new Float32Array(VORTEX_SPARK_COUNT)
  const baseHeights = new Float32Array(VORTEX_SPARK_COUNT)
  const baseRadii  = new Float32Array(VORTEX_SPARK_COUNT)
  const speeds     = new Float32Array(VORTEX_SPARK_COUNT)
  const pos        = new Float32Array(VORTEX_SPARK_COUNT * 3)

  for (let i = 0; i < VORTEX_SPARK_COUNT; i++) {
    baseAngles[i]  = (i / VORTEX_SPARK_COUNT) * Math.PI * 8 + Math.random() * 0.4
    baseHeights[i] = (i / VORTEX_SPARK_COUNT - 0.5) * 3.4
    baseRadii[i]   = 0.4 + (i / VORTEX_SPARK_COUNT) * 1.8
    speeds[i]      = 1.5 + Math.random() * 1.2
  }
  return { baseAngles, baseHeights, baseRadii, speeds, pos }
}

const MANDALA_RINGS = [
  { r: 0.9, tube: 0.020, tilt: [0, 0, 0] as [number,number,number],                     speed:  0.8 },
  { r: 1.4, tube: 0.015, tilt: [Math.PI / 2, 0, 0] as [number,number,number],           speed: -1.1 },
  { r: 1.9, tube: 0.010, tilt: [Math.PI / 4, Math.PI / 4, 0] as [number,number,number], speed:  0.6 },
  { r: 2.5, tube: 0.007, tilt: [Math.PI / 3, 0, Math.PI / 5] as [number,number,number], speed: -0.4 },
]

export function StrangeWorld({ chapterProgress: _c, active, velocity: _v }: StrangeWorldProps) {
  const groupRef  = useRef<THREE.Group>(null)
  const vortexRef = useRef<THREE.Points>(null)
  const ringRefs  = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const timeRef   = useRef(0)

  const sparkTex  = useMemo(() => createGoldSparkTexture(), [])
  const vortex    = useMemo(() => makeVortexSparks(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  const charX = 1.6 // Character on right for even track index

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(1.5, Math.abs(liveVel || _v || 0) * 2.5)
    const orbitSpeed = 1.0 + velBoost * 2.2

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Tightening factor: c goes from 0.2 to 0.7
    const tightenFrac = ss(norm(liveC, 0.2, 0.7)) // 0 at c<=0.2, 1 at c>=0.7
    const radiusMultiplier = 1.0 - tightenFrac * 0.62 // Tightens from 100% down to 38%

    // Golden sparks along spiral vortex
    if (vortexRef.current?.geometry?.attributes?.position) {
      const pos = vortexRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < VORTEX_SPARK_COUNT; i++) {
        const angle = vortex.baseAngles[i] + t * vortex.speeds[i] * orbitSpeed * 0.4
        const r = vortex.baseRadii[i] * radiusMultiplier

        pos[i * 3 + 0] = charX + Math.cos(angle) * r
        pos[i * 3 + 1] = vortex.baseHeights[i] * (1.0 - tightenFrac * 0.2) + Math.sin(angle * 2.0) * 0.15
        pos[i * 3 + 2] = -0.8 + Math.sin(angle) * r * 0.6
      }
      vortexRef.current.geometry.attributes.position.needsUpdate = true

      const vMat = vortexRef.current.material as THREE.PointsMaterial
      if (vMat) {
        vMat.opacity = 0.85 * liveA
      }
    }

    // Mandala spell-circle rings unfold
    ringRefs.forEach((r, i) => {
      if (!r.current) return
      const def = MANDALA_RINGS[i]
      const delay = (i / MANDALA_RINGS.length) * 0.30
      const ringA = ss(Math.max(0, Math.min(1, (liveA - delay) / (1 - delay + 0.001))))
      r.current.scale.setScalar(ringA)
      r.current.rotation.z += delta * def.speed * (1 + velBoost)
    })
  })

  return (
    <group ref={groupRef}>
      {/* Golden sparks along spiral vortex */}
      <points ref={vortexRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[vortex.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sparkTex}
          color={GOLD}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.85 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Mandala / Spell-circle rings centered at character */}
      <group position={[charX, 0, -1.0]}>
        {MANDALA_RINGS.map((def, i) => (
          <mesh key={i} ref={ringRefs[i]} rotation={def.tilt}>
            <torusGeometry args={[def.r, def.tube, 6, 72]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? GOLD : TEAL}
              emissive={i % 2 === 0 ? GOLD : TEAL}
              emissiveIntensity={0.35 - i * 0.05}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0.70 - i * 0.12}
            />
          </mesh>
        ))}
      </group>

      <pointLight color={GOLD} intensity={a * 1.3} distance={12} decay={2} position={[charX, 0, 0]} />
      <pointLight color={TEAL} intensity={a * 0.5} distance={8}  decay={2} position={[charX, 1.6, 0]} />
    </group>
  )
}