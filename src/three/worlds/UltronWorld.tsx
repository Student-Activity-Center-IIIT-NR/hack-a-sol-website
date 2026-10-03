/**
 * src/three/worlds/UltronWorld.tsx  (Phase 3h — Marvel environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * robonyx — "Ultron Swarm"
 * Instanced drone sentinels flying in and locking into formation, red eye glints,
 * floating debris chunks with exposed wire-circuits (wireframe boxes), gears
 * spinning faster with scroll velocity, sparks.
 * No official logos or trademarks — only generic shapes.
 *
 * chapterProgress c: ENTER 0–0.22 | HOLD 0.22–0.78 | EXIT 0.78–1.0
 * Color: #F87171 red
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface UltronWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number
}

const RED    = new THREE.Color("#F87171")
const ORANGE = new THREE.Color("#FB923C")

const DRONE_COUNT  = 20
const SPARK_COUNT  = 200
const DEBRIS_COUNT = 8

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Drone formation positions (diamond grid)
function makeDroneTargets() {
  return Array.from({ length: DRONE_COUNT }, (_, i) => {
    const row = Math.floor(i / 5)
    const col = i % 5
    return new THREE.Vector3(
      (col - 2) * 0.8,
      (row - 2) * 0.6 + 0.5,
      -0.8 - row * 0.2,
    )
  })
}

// Drone scatter positions (random, far away)
function makeDroneScatter() {
  return Array.from({ length: DRONE_COUNT }, () =>
    new THREE.Vector3(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 2,
    )
  )
}

function makeSparkPositions() {
  const pos = new Float32Array(SPARK_COUNT * 3)
  for (let i = 0; i < SPARK_COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const r = 1.8 + Math.random() * 1.4
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.cos(phi)
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  return pos
}

export function UltronWorld({ chapterProgress: c, active, velocity = 0 }: UltronWorldProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const droneRef   = useRef<THREE.InstancedMesh>(null)
  const debrisRef  = useRef<THREE.InstancedMesh>(null)
  const gearRefs   = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const sparkRef   = useRef<THREE.Points>(null)
  const timeRef    = useRef(0)

  const formation = useMemo(() => makeDroneTargets(), [])
  const scatter   = useMemo(() => makeDroneScatter(),  [])
  const sparkPos  = useMemo(() => makeSparkPositions(), [])
  const dummy     = useMemo(() => new THREE.Object3D(), [])
  const a = globalA(c)

  useFrame((state, delta) => {
    timeRef.current += delta
    const t   = timeRef.current
    const vel = Math.min(1, velocity * 4)
    const spinMul = 1 + vel * 3

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.3 : 0
      const tx = active ? -state.pointer.y * 0.2 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = c < 0.22 ? -3 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Drone formation: lerp from scatter to formation based on a (staggered)
    if (droneRef.current) {
      formation.forEach((target, i) => {
        const delay = (i / DRONE_COUNT) * 0.5
        const t2 = Math.max(0, Math.min(1, (a - delay) / (1 - delay + 0.001)))
        const tss = ss(t2)
        const src = scatter[i]
        dummy.position.lerpVectors(src, target, tss)
        dummy.scale.setScalar(0.08 + tss * 0.04)
        dummy.rotation.set(
          Math.sin(timeRef.current * 0.8 + i) * 0.2,
          t * 1.5 + i * 0.4,
          0,
        )
        dummy.updateMatrix()
        droneRef.current!.setMatrixAt(i, dummy.matrix)
      })
      droneRef.current.instanceMatrix.needsUpdate = true
    }

    // Debris chunks — float and rotate
    if (debrisRef.current) {
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        const angle = (i / DEBRIS_COUNT) * Math.PI * 2 + t * 0.15
        const r = 2.5 + i * 0.2
        dummy.position.set(
          Math.cos(angle) * r,
          Math.sin(angle * 1.3) * 0.8,
          -0.5 - i * 0.1,
        )
        dummy.scale.setScalar(a * 0.12)
        dummy.rotation.set(t * 0.4 + i, t * 0.3 + i, 0)
        dummy.updateMatrix()
        debrisRef.current.setMatrixAt(i, dummy.matrix)
      }
      debrisRef.current.instanceMatrix.needsUpdate = true
    }

    // Gears spin (faster with velocity)
    gearRefs.forEach((gr, i) => {
      if (!gr.current) return
      const dir = i % 2 === 0 ? 1 : -1
      gr.current.rotation.z += delta * (0.5 + i * 0.3) * spinMul * dir
    })

    if (sparkRef.current) {
      sparkRef.current.rotation.y += delta * 0.3 * spinMul
      sparkRef.current.scale.setScalar(a * 0.6)
    }
  })

  const gearData = [
    { r: 0.4, pos: [-2.0, 1.0,  -0.5] as [number,number,number] },
    { r: 0.28, pos: [-1.3, 1.4, -0.5] as [number,number,number] },
    { r: 0.5, pos: [2.2, -0.8,  -0.6] as [number,number,number] },
    { r: 0.32, pos: [2.8, -0.3, -0.6] as [number,number,number] },
  ]

  return (
    <group ref={groupRef}>
      {/* Drone sentinels (instanced spheres with red tint) */}
      <instancedMesh ref={droneRef} args={[undefined, undefined, DRONE_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
      </instancedMesh>

      {/* Floating debris chunks (wireframe boxes) */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={ORANGE} wireframe transparent opacity={0.4} />
      </instancedMesh>

      {/* Spinning gears (torus geometries with thick tubes, many segments) */}
      {gearData.map((gd, i) => (
        <mesh key={i} ref={gearRefs[i]} position={gd.pos}>
          <torusGeometry args={[gd.r, gd.r * 0.18, 4, 10]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.2} metalness={0.8} roughness={0.3} transparent opacity={0.7 * a} />
        </mesh>
      ))}

      {/* Spark cloud */}
      <points ref={sparkRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={ORANGE} size={0.04} sizeAttenuation transparent opacity={0.7} />
      </points>

      {/* Glitch line */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 0.01]} />
        <meshBasicMaterial color={RED} transparent opacity={0.4 * a} />
      </mesh>

      <pointLight color={RED}    intensity={a * 1.5} distance={14} decay={2} />
      <pointLight color={ORANGE} intensity={a * 0.4} distance={6}  decay={2} position={[0, 2, 1]} />
    </group>
  )
}