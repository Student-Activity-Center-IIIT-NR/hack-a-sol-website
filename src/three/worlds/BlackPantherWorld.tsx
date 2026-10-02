/**
 * src/three/worlds/BlackPantherWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Black Panther / Web3 & Sustainability — Vibranium Crystals.
 *
 * Instanced cone geometry: 24 crystals grow upward from the floor, staggered.
 * localT drives:
 *   0.0 – 0.5 : crystals grow (scale Y from 0 → 1)
 *   0.5 – 1.0 : crystals retract
 *
 * Colors: purple #A855F7, green #10B981
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BlackPantherWorldProps {
  localT: number
  active: boolean
}

const CRYSTAL_COUNT = 24
const PURPLE = new THREE.Color('#A855F7')
const GREEN  = new THREE.Color('#10B981')

export function BlackPantherWorld({ localT, active }: BlackPantherWorldProps) {
  const instanceRef = useRef<THREE.InstancedMesh>(null)
  const groupRef    = useRef<THREE.Group>(null)
  const coreRef     = useRef<THREE.Mesh>(null)

  // Pre-compute crystal placement data
  const crystalData = useMemo(() => {
    const data: Array<{ x: number; z: number; delay: number; height: number; color: THREE.Color; rotY: number }> = []
    for (let i = 0; i < CRYSTAL_COUNT; i++) {
      const angle = (i / CRYSTAL_COUNT) * Math.PI * 2 + Math.random() * 0.3
      const r = 0.8 + Math.random() * 1.2
      data.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        delay: (i / CRYSTAL_COUNT) * 0.5,          // staggered grow
        height: 0.6 + Math.random() * 1.2,
        color: Math.random() > 0.5 ? PURPLE.clone() : GREEN.clone(),
        rotY: Math.random() * Math.PI,
      })
    }
    return data
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorAttr = useMemo(() => {
    const arr = new Float32Array(CRYSTAL_COUNT * 3)
    crystalData.forEach(({ color }, i) => {
      arr[i * 3]     = color.r
      arr[i * 3 + 1] = color.g
      arr[i * 3 + 2] = color.b
    })
    return arr
  }, [crystalData])

  useFrame((state, delta) => {
    if (!instanceRef.current) return

    // Triangle wave: grows 0→0.5, recedes 0.5→1
    const growT = localT < 0.5 ? localT * 2 : (1 - localT) * 2

    crystalData.forEach(({ x, z, delay, height, rotY }, i) => {
      const localGrow = Math.max(0, Math.min(1, (growT - delay * 0.6) / 0.6))
      const scaleY = localGrow * height
      dummy.position.set(x, scaleY * 0.5 - 1.5, z)
      dummy.scale.set(0.1, scaleY, 0.1)
      dummy.rotation.set(0, rotY, 0)
      dummy.updateMatrix()
      instanceRef.current!.setMatrixAt(i, dummy.matrix)
    })
    instanceRef.current.instanceMatrix.needsUpdate = true

    // Set colors on first frame (they don't change)
    if (instanceRef.current.instanceColor) {
      instanceRef.current.instanceColor.needsUpdate = true
    }

    // Core float + rotate
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5
      coreRef.current.rotation.x += delta * 0.2
      const scale = Math.sin(Math.min(1, localT * 3) * Math.PI * 0.5)
      coreRef.current.scale.setScalar(scale)
    }
    if (groupRef.current) {
      const targetRotY = active ? state.pointer.x * 0.4 : 0
      const targetRotX = active ? -state.pointer.y * 0.25 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3)
      groupRef.current.position.y = Math.sin(Date.now() * 0.0009) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Instanced crystals */}
      <instancedMesh ref={instanceRef} args={[undefined, undefined, CRYSTAL_COUNT]}>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial
          metalness={0.8}
          roughness={0.2}
          vertexColors
        />
      </instancedMesh>

      {/* Floating core octahedron */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Crystal color buffer */}
      {instanceRef.current && (
        <bufferAttribute
          attach="instanceColor"
          args={[colorAttr, 3]}
        />
      )}

      <pointLight color="#A855F7" intensity={active ? 4 : 0.8} distance={12} decay={2} />
      <pointLight color="#10B981" intensity={active ? 2 : 0.3} distance={8} decay={2} position={[0, -1, 0]} />
    </group>
  )
}
