/**
 * src/three/worlds/BlackPantherWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * web3 — "Wakanda / Vibranium Sanctuary"
 *
 * Per-track signature:
 * - Elongated purple vibranium shards (instanced) rising and slowly rotating.
 * - Green glints flashing and floating around the shards.
 * - Soft glow sprites, additive blending, smooth ambient lighting.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface BlackPantherWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const PURPLE = new THREE.Color("#A855F7")
const GREEN  = new THREE.Color("#10B981")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

function createGreenGlintTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.25, "rgba(16, 185, 129, 0.9)")
    grad.addColorStop(0.65, "rgba(5, 150, 105, 0.25)")
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const SHARD_COUNT = 30
const GLINT_COUNT = 65

function makeShardInitialData() {
  return Array.from({ length: SHARD_COUNT }, () => ({
    x: 1.6 + (Math.random() - 0.5) * 3.8, // Centered around character on right
    y: -3.0 + Math.random() * 6.0,
    z: -1.8 + Math.random() * 2.5,
    speedY: 0.35 + Math.random() * 0.55,
    rotSpeedX: 0.4 + Math.random() * 0.8,
    rotSpeedY: 0.5 + Math.random() * 1.0,
    scale: 0.7 + Math.random() * 0.6,
  }))
}

function makeGreenGlints() {
  const pos = new Float32Array(GLINT_COUNT * 3)
  const phases = new Float32Array(GLINT_COUNT)
  for (let i = 0; i < GLINT_COUNT; i++) {
    pos[i * 3 + 0] = 1.6 + (Math.random() - 0.5) * 4.2
    pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0
    pos[i * 3 + 2] = -1.5 + (Math.random() - 0.5) * 2.5
    phases[i] = Math.random() * Math.PI * 2
  }
  return { pos, phases }
}

export function BlackPantherWorld({ chapterProgress: _c, active, velocity: _v }: BlackPantherWorldProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const shardsRef  = useRef<THREE.InstancedMesh>(null)
  const glintsRef  = useRef<THREE.Points>(null)
  const timeRef    = useRef(0)

  const glintTex   = useMemo(() => createGreenGlintTexture(), [])
  const shardData  = useMemo(() => makeShardInitialData(), [])
  const glintData  = useMemo(() => makeGreenGlints(), [])
  const dummy      = useMemo(() => new THREE.Object3D(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(1.5, Math.abs(liveVel || _v || 0) * 2.5)
    const riseSpeed = 1 + velBoost * 2.2

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Instanced vibranium shards rising and rotating
    if (shardsRef.current) {
      shardData.forEach((shard, i) => {
        shard.y += shard.speedY * riseSpeed * delta
        if (shard.y > 3.2) {
          shard.y = -3.2
        }
        dummy.position.set(shard.x, shard.y, shard.z)
        dummy.rotation.set(t * shard.rotSpeedX, t * shard.rotSpeedY, Math.PI / 12)
        dummy.scale.setScalar(shard.scale * liveA)
        dummy.updateMatrix()
        shardsRef.current!.setMatrixAt(i, dummy.matrix)
      })
      shardsRef.current.instanceMatrix.needsUpdate = true
    }

    // Green glints twinkling and drifting
    if (glintsRef.current?.geometry?.attributes?.position) {
      const pos = glintsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < GLINT_COUNT; i++) {
        pos[i * 3 + 1] += Math.sin(t * 1.5 + glintData.phases[i]) * 0.005
        pos[i * 3 + 0] += Math.cos(t * 1.2 + glintData.phases[i]) * 0.003
      }
      glintsRef.current.geometry.attributes.position.needsUpdate = true

      const gMat = glintsRef.current.material as THREE.PointsMaterial
      if (gMat) {
        gMat.opacity = 0.8 * liveA
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Elongated purple vibranium crystal shards */}
      <instancedMesh ref={shardsRef} args={[undefined, undefined, SHARD_COUNT]}>
        <cylinderGeometry args={[0.015, 0.08, 0.85, 6]} />
        <meshStandardMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={0.65}
          metalness={0.7}
          roughness={0.25}
          transparent
          opacity={0.82 * a}
        />
      </instancedMesh>

      {/* Floating green glints */}
      <points ref={glintsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glintData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={glintTex}
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.8 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Subtle tribal geometric pattern rings */}
      <mesh position={[1.6, 0, -1.0]}>
        <torusGeometry args={[2.0, 0.018, 4, 8]} />
        <meshBasicMaterial color={PURPLE} transparent opacity={0.25 * a} />
      </mesh>
      <mesh position={[1.6, 0, -1.1]} rotation={[0, 0, Math.PI / 8]}>
        <torusGeometry args={[1.5, 0.014, 4, 8]} />
        <meshBasicMaterial color={GREEN} transparent opacity={0.22 * a} />
      </mesh>

      <pointLight color={PURPLE} intensity={a * 1.2} distance={12} decay={2} position={[1.6, 0, 0]} />
      <pointLight color={GREEN}  intensity={a * 0.7} distance={8}  decay={2} position={[1.6, 1.5, 0]} />
    </group>
  )
}