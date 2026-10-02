/**
 * src/three/worlds/CapWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Captain America / Cybersecurity world — Vibranium Shield.
 *
 * localT 0→1 drives:
 *   0.0 – 0.35 : shield flies in spinning from above, scale assembles
 *   0.35 – 0.65: shield hovers + slow spin; shockwave ring expands + fades
 *   0.65 – 1.0 : shield spins out / disassembles
 *
 * Colors: red #EF4444, white, blue #3B82F6
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CapWorldProps {
  localT: number
  active: boolean
}

export function CapWorld({ localT, active }: CapWorldProps) {
  const shieldRef = useRef<THREE.Group>(null)
  const shockRef  = useRef<THREE.Mesh>(null)
  const shockMat  = useRef<THREE.MeshBasicMaterial>(null)
  const groupRef  = useRef<THREE.Group>(null)

  // Assemble: smooth ease-in/ease-out based on localT
  const a = Math.sin(Math.min(1, Math.max(0, localT * 2)) * Math.PI * 0.5)

  // Shockwave progress: fires once shield lands (localT > 0.35)
  const shockT = Math.max(0, Math.min(1, (localT - 0.35) / 0.3))

  useFrame((state, delta) => {
    if (shieldRef.current) {
      // Spin faster while assembling, slow when landed
      const spinSpeed = localT < 0.35 ? 6 : localT > 0.65 ? 4 : 0.4
      shieldRef.current.rotation.z += delta * spinSpeed
      // Fly in from y=3 to y=0
      const targetY = localT < 0.35 ? 3 * (1 - a) : 0
      shieldRef.current.position.y += (targetY - shieldRef.current.position.y) * delta * 4
      shieldRef.current.scale.setScalar(a)
    }
    // Shockwave ring expand
    if (shockRef.current) {
      const s = 1 + shockT * 4
      shockRef.current.scale.setScalar(s)
      if (shockMat.current) {
        shockMat.current.opacity = Math.max(0, 0.6 * (1 - shockT))
      }
    }
    if (groupRef.current) {
      const targetRotY = active ? state.pointer.x * 0.45 : 0
      const targetRotX = active ? -state.pointer.y * 0.3 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3)
      groupRef.current.position.y = Math.sin(Date.now() * 0.0008) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Shield group: 4 concentric disc layers */}
      <group ref={shieldRef}>
        {/* Outer blue ring */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.08, 64, 1, true]} />
          <meshStandardMaterial color="#1D4ED8" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
        {/* Red ring */}
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, 0.09, 64, 1, true]} />
          <meshStandardMaterial color="#EF4444" metalness={0.8} roughness={0.15} side={THREE.DoubleSide} />
        </mesh>
        {/* White ring */}
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 64, 1, true]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.7} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Red inner */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.11, 64, 1, true]} />
          <meshStandardMaterial color="#EF4444" metalness={0.8} roughness={0.15} side={THREE.DoubleSide} />
        </mesh>
        {/* Blue center star */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.1, 8, 5]} />
          <meshStandardMaterial color="#1D4ED8" metalness={0.9} roughness={0.1} emissive="#60A5FA" emissiveIntensity={0.5} />
        </mesh>
        {/* Disc caps */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 64]} />
          <meshStandardMaterial color="#1D4ED8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Shockwave ring */}
      <mesh ref={shockRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 6, 64]} />
        <meshBasicMaterial
          ref={shockMat}
          color="#EF4444"
          transparent
          opacity={0}
        />
      </mesh>

      <pointLight color="#EF4444" intensity={active ? 3 : 0.5} distance={10} decay={2} />
    </group>
  )
}
