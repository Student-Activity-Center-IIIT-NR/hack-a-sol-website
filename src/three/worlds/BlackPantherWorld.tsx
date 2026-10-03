/**
 * src/three/worlds/BlackPantherWorld.tsx  (Phase 3h — Marvel environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * web3 — "Wakanda"
 * Vibranium crystals growing from the floor with purple/green energy, futuristic
 * skyline silhouette, tribal geometric pattern lines that draw on scroll, chain-
 * link cubes, leaf particles that drift with velocity.
 * No official marks — only generic shapes.
 *
 * chapterProgress c: ENTER 0–0.22 | HOLD 0.22–0.78 | EXIT 0.78–1.0
 * Colors: #A855F7 purple, #10B981 green
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface BlackPantherWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number
}

const PURPLE = new THREE.Color("#A855F7")
const GREEN  = new THREE.Color("#10B981")
const CRYSTAL_COUNT = 18
const LEAF_COUNT = 120

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

function makeCrystals() {
  return Array.from({ length: CRYSTAL_COUNT }, (_, i) => {
    const angle = (i / CRYSTAL_COUNT) * Math.PI * 2 + Math.random() * 0.3
    const r = 1.2 + Math.random() * 1.4
    return {
      x:      Math.cos(angle) * r,
      z:      Math.sin(angle) * r * 0.65,
      height: 0.5 + Math.random() * 1.6,
      delay:  (i / CRYSTAL_COUNT) * 0.55,
      rotY:   Math.random() * Math.PI,
      isGreen: i % 4 === 0,
    }
  })
}

function makeLeaves() {
  const pos = new Float32Array(LEAF_COUNT * 3)
  for (let i = 0; i < LEAF_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 6
    pos[i * 3 + 1] = (Math.random() - 0.5) * 4
    pos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1.5
  }
  return pos
}

export function BlackPantherWorld({ chapterProgress: c, active, velocity = 0 }: BlackPantherWorldProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const crystalRef = useRef<THREE.InstancedMesh>(null)
  const leafRef    = useRef<THREE.Points>(null)
  const leafGeo    = useRef<THREE.BufferGeometry>(null)
  const cubeRef    = useRef<THREE.Mesh>(null)
  const skylineRef = useRef<THREE.Group>(null)
  const timeRef    = useRef(0)

  const crystals  = useMemo(() => makeCrystals(), [])
  const leafPos   = useMemo(() => makeLeaves(), [])
  const leafBuf   = useMemo(() => new Float32Array(LEAF_COUNT * 3), [])
  const dummy     = useMemo(() => new THREE.Object3D(), [])
  const a = globalA(c)

  useFrame((state, delta) => {
    timeRef.current += delta
    const t  = timeRef.current
    const vel = Math.min(1, velocity * 4)
    const spinMul = 1 + vel * 2

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.25 : 0
      const tx = active ? -state.pointer.y * 0.15 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = c < 0.22 ? -3 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Crystals grow staggered
    if (crystalRef.current) {
      crystals.forEach(({ x, z, height, delay, rotY }, i) => {
        const growA = ss(Math.max(0, Math.min(1, (a - delay) / (1 - delay + 0.001))))
        const scaleY = growA * height
        const pulse = 1 + Math.sin(t * 2 + i * 0.7) * 0.05
        dummy.position.set(x, scaleY * 0.5 - 1.8, z)
        dummy.scale.set(0.12 * pulse, scaleY, 0.12 * pulse)
        dummy.rotation.set(0, rotY, 0)
        dummy.updateMatrix()
        crystalRef.current!.setMatrixAt(i, dummy.matrix)
      })
      crystalRef.current.instanceMatrix.needsUpdate = true
    }

    // Leaf drift
    if (leafGeo.current) {
      const driftX = vel * 0.8
      for (let i = 0; i < LEAF_COUNT; i++) {
        leafBuf[i * 3]     = leafPos[i * 3]     + Math.sin(t * 0.4 + i * 0.3) * 0.12 + driftX * 0.2
        leafBuf[i * 3 + 1] = leafPos[i * 3 + 1] + Math.sin(t * 0.6 + i * 0.5) * 0.1
        leafBuf[i * 3 + 2] = leafPos[i * 3 + 2]
      }
      const attr = leafGeo.current.attributes.position as THREE.BufferAttribute
      attr.array = leafBuf
      attr.needsUpdate = true
    }

    // Chain-link cube rotate
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 0.4 * spinMul
      cubeRef.current.rotation.x += delta * 0.3
      cubeRef.current.scale.setScalar(a * 0.55)
    }

    // Skyline parallax
    if (skylineRef.current) {
      skylineRef.current.position.x = (active ? state.pointer.x * -0.3 : 0)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Vibranium crystals (instanced cones) */}
      <instancedMesh ref={crystalRef} args={[undefined, undefined, CRYSTAL_COUNT]}>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={0.25}
          metalness={0.7}
          roughness={0.25}
          transparent
          opacity={0.75}
        />
      </instancedMesh>

      {/* Futuristic skyline — spiky box silhouette far away */}
      <group ref={skylineRef} position={[0, -0.5, -3.5]}>
        {[-2.4, -1.5, -0.6, 0.4, 1.2, 2.2].map((x, i) => (
          <mesh key={i} position={[x, (0.4 + i * 0.18) / 2, 0]}>
            <boxGeometry args={[0.18, 0.4 + i * 0.18, 0.12]} />
            <meshStandardMaterial color={PURPLE} emissive={PURPLE} emissiveIntensity={0.1} transparent opacity={0.3 * a} />
          </mesh>
        ))}
      </group>

      {/* Geometric tribal pattern — octagonal ring */}
      <mesh position={[0, 0, -1]}>
        <torusGeometry args={[2.2, 0.02, 4, 8]} />
        <meshBasicMaterial color={PURPLE} transparent opacity={0.3 * a} />
      </mesh>
      <mesh position={[0, 0, -1.1]} rotation={[0, 0, Math.PI / 8]}>
        <torusGeometry args={[1.6, 0.015, 4, 8]} />
        <meshBasicMaterial color={GREEN} transparent opacity={0.25 * a} />
      </mesh>

      {/* Chain-link cube (wireframe box) */}
      <mesh ref={cubeRef} position={[1.6, 0.8, 0.2]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.5} />
      </mesh>

      {/* Floating leaf particles */}
      <points ref={leafRef}>
        <bufferGeometry ref={leafGeo}>
          <bufferAttribute attach="attributes-position" args={[leafBuf, 3]} />
        </bufferGeometry>
        <pointsMaterial color={GREEN} size={0.035} sizeAttenuation transparent opacity={0.55 * a} />
      </points>

      <pointLight color={PURPLE} intensity={a * 1.2} distance={12} decay={2} />
      <pointLight color={GREEN}  intensity={a * 0.5} distance={8}  decay={2} position={[0, -2, 0]} />
    </group>
  )
}