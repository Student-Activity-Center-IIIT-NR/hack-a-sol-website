/**
 * src/three/worlds/CapWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * cybersec — "SHIELD Ops Room / Digital Defense"
 *
 * Per-track signature:
 * - Expanding defense rings expanding from the character (at x ≈ -1.6).
 * - Hex-shaped sparks bursting outward.
 * - Static hex firewall grid, rings, nodes and particles.
 * - Zero hard red sphere meshes.
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

// Generate hexagonal soft spark texture
function createHexSparkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const cx = 32, cy = 32, r = 26
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3
      const x = cx + r * Math.cos(a)
      const y = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.3, "rgba(239, 68, 68, 0.85)")
    grad.addColorStop(0.7, "rgba(59, 130, 246, 0.35)")
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const SPARK_COUNT = 72
function makeHexSparks() {
  const pos = new Float32Array(SPARK_COUNT * 3)
  const dirs = new Float32Array(SPARK_COUNT * 3)
  const speeds = new Float32Array(SPARK_COUNT)

  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = (Math.floor(i / 12) * Math.PI) / 3 + (Math.random() - 0.5) * 0.25
    const r = 0.4 + Math.random() * 2.2
    pos[i * 3 + 0] = -1.6 + Math.cos(angle) * r
    pos[i * 3 + 1] = Math.sin(angle) * r
    pos[i * 3 + 2] = -0.6 + (Math.random() - 0.5) * 1.5

    dirs[i * 3 + 0] = Math.cos(angle)
    dirs[i * 3 + 1] = Math.sin(angle)
    dirs[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    speeds[i] = 0.3 + Math.random() * 0.6
  }
  return { pos, dirs, speeds }
}

export function CapWorld({ chapterProgress: _c, active, velocity: _v }: CapWorldProps) {
  const groupRef     = useRef<THREE.Group>(null)
  const pingRingsRef = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const sparksRef    = useRef<THREE.Points>(null)
  const timeRef      = useRef(0)

  const hexTex   = useMemo(() => createHexSparkTexture(), [])
  const sparkData = useMemo(() => makeHexSparks(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  const charX = -1.6 // Character position on left for odd track index

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)


    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Expanding defense ping rings around character
    pingRingsRef.forEach((ringRef, i) => {
      if (!ringRef.current) return
      const cycle = (t * 0.45 + i * 0.33) % 1
      const scale = 0.4 + cycle * 2.8
      ringRef.current.scale.set(scale, scale, 1)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.opacity = (1 - cycle) * 0.45 * liveA
      }
    })

    // Hex-shaped sparks pulsing outward
    if (sparksRef.current?.geometry?.attributes?.position) {
      const pos = sparksRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < SPARK_COUNT; i++) {
        const cycle = (t * sparkData.speeds[i] + i * 0.1) % 1
        pos[i * 3 + 0] = charX + sparkData.dirs[i * 3 + 0] * (0.3 + cycle * 2.2)
        pos[i * 3 + 1] = sparkData.dirs[i * 3 + 1] * (0.3 + cycle * 2.2)
        pos[i * 3 + 2] = -0.6 + sparkData.dirs[i * 3 + 2] * cycle
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true

      const sMat = sparksRef.current.material as THREE.PointsMaterial
      if (sMat) {
        sMat.opacity = 0.75 * a
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Defense ping rings expanding from character */}
      {pingRingsRef.map((ref, i) => (
        <mesh key={i} ref={ref} position={[charX, 0, -0.8]}>
          <ringGeometry args={[0.96, 1.0, 6]} />
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

      {/* Hex-shaped sparks */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={hexTex}
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.75 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Outer subtle tactical grid */}
      <mesh position={[0, -1.6, -1.2]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <planeGeometry args={[8, 5, 10, 6]} />
        <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.09 * a} />
      </mesh>

      <pointLight color={RED}  intensity={a * 1.0} distance={10} decay={2} position={[charX, 0, 0]} />
      <pointLight color={BLUE} intensity={a * 0.6} distance={8}  decay={2} position={[charX + 1.5, 1.5, 0]} />
    </group>
  )
}