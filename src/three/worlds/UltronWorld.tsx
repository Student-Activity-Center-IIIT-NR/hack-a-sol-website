/**
 * src/three/worlds/UltronWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * robonyx — "Ultron Foundry / Autonomous Hardware"
 *
 * Per-track signature:
 * - Red-orange welding sparks showering down with short bright streaks.
 * - Acceleration downwards with gravity and random horizontal scatter.
 * - Additive blending, toneMapped false, zero hard ball meshes.
 * - Rotating mechanical gear silhouettes in background.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface UltronWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number
}

const RED    = new THREE.Color("#EF4444")
const ORANGE = new THREE.Color("#FB923C")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Generate vertical streak welding spark texture
function createWeldingStreakTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 32
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createLinearGradient(16, 0, 16, 128)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 0.0)")
    grad.addColorStop(0.2, "rgba(255, 200, 120, 0.4)")
    grad.addColorStop(0.5, "rgba(255, 120, 40, 0.95)")
    grad.addColorStop(0.8, "rgba(239, 68, 68, 0.7)")
    grad.addColorStop(1.0, "rgba(180, 20, 20, 0.0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 128)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const WELD_SPARK_COUNT = 150

function makeWeldingSparks() {
  const pos = new Float32Array(WELD_SPARK_COUNT * 3)
  const vel = new Float32Array(WELD_SPARK_COUNT * 3)

  for (let i = 0; i < WELD_SPARK_COUNT; i++) {
    // Showering around character on left (x ≈ -1.6)
    pos[i * 3 + 0] = -1.6 + (Math.random() - 0.5) * 2.8
    pos[i * 3 + 1] = 1.0 + Math.random() * 2.5
    pos[i * 3 + 2] = -1.2 + (Math.random() - 0.5) * 1.8

    vel[i * 3 + 0] = (Math.random() - 0.5) * 0.4
    vel[i * 3 + 1] = -(1.8 + Math.random() * 2.6) // Downward velocity
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
  }
  return { pos, vel }
}

export function UltronWorld({ chapterProgress: c, active, velocity = 0 }: UltronWorldProps) {
  const groupRef  = useRef<THREE.Group>(null)
  const sparksRef = useRef<THREE.Points>(null)
  const gearRefs  = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const timeRef   = useRef(0)

  const streakTex = useMemo(() => createWeldingStreakTexture(), [])
  const sparkData = useMemo(() => makeWeldingSparks(), [])
  const a         = globalA(c)

  const charX = -1.6

  useFrame((state, delta) => {
    timeRef.current += delta
    const velBoost = Math.min(1.5, Math.abs(velocity) * 2.5)
    const showerSpeed = 1.0 + velBoost * 2.0

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = c < 0.22 ? -2.5 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Welding sparks showering down with gravity acceleration
    if (sparksRef.current?.geometry?.attributes?.position) {
      const pos = sparksRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < WELD_SPARK_COUNT; i++) {
        // Accelerate downwards
        pos[i * 3 + 1] += sparkData.vel[i * 3 + 1] * showerSpeed * delta
        pos[i * 3 + 0] += sparkData.vel[i * 3 + 0] * delta

        // Wrap to the top when reaching floor
        if (pos[i * 3 + 1] < -2.8) {
          pos[i * 3 + 1] = 2.2 + Math.random() * 1.0
          pos[i * 3 + 0] = charX + (Math.random() - 0.5) * 2.6
        }
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true

      const sMat = sparksRef.current.material as THREE.PointsMaterial
      if (sMat) {
        sMat.opacity = 0.85 * a
      }
    }

    // Background gears spin
    gearRefs.forEach((gr, i) => {
      if (!gr.current) return
      const dir = i % 2 === 0 ? 1 : -1
      gr.current.rotation.z += delta * (0.4 + i * 0.3) * (1 + velBoost) * dir
    })
  })

  return (
    <group ref={groupRef}>
      {/* Showering red-orange welding sparks */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={streakTex}
          color={ORANGE}
          size={0.16}
          sizeAttenuation
          transparent
          opacity={0.85 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Background stylized mechanical gears */}
      {[
        { r: 0.55, pos: [charX - 1.2, 1.2, -1.2] as [number,number,number] },
        { r: 0.40, pos: [charX - 0.4, 1.6, -1.2] as [number,number,number] },
        { r: 0.70, pos: [charX + 1.2, -1.0, -1.4] as [number,number,number] },
      ].map((g, i) => (
        <mesh key={i} ref={gearRefs[i]} position={g.pos}>
          <torusGeometry args={[g.r, g.r * 0.14, 4, 12]} />
          <meshStandardMaterial
            color={RED}
            emissive={RED}
            emissiveIntensity={0.25}
            metalness={0.8}
            roughness={0.25}
            transparent
            opacity={0.55 * a}
          />
        </mesh>
      ))}

      <pointLight color={ORANGE} intensity={a * 1.3} distance={12} decay={2} position={[charX, 1.2, 0]} />
      <pointLight color={RED}    intensity={a * 0.8} distance={10} decay={2} position={[charX, -0.8, 0]} />
    </group>
  )
}