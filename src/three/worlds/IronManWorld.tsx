/**
 * src/three/worlds/IronManWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Iron Man / AI-ML world — Arc Reactor.
 *
 * localT 0→1 drives:
 *   0.0 – 0.35  : core + 3 rings assemble from scattered positions
 *   0.35 – 0.65 : idle — rings counter-rotate, core pulses, HUD particles orbit
 *   0.65 – 1.0  : disassemble / scatter outward
 *
 * Color: #60A5FA (blue-400)
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface IronManWorldProps {
  localT: number   // 0 = entering, 0.5 = center, 1 = leaving
  active: boolean
}

const BLUE = '#60A5FA'

export function IronManWorld({ localT, active }: IronManWorldProps) {
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Assemble progress: 0=scattered, 1=fully assembled
  // Peaks at localT=0.5, zero at edges
  const assembleProgress = useMemo(
    () => Math.sin(Math.min(1, Math.max(0, localT * 2)) * Math.PI * 0.5),
    [localT],
  )

  // Generate HUD orbit particles
  const particlePositions = useMemo(() => {
    const count = 120
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = 1.8 + Math.sin(i * 2.3) * 0.3
      const y = (Math.random() - 0.5) * 0.6
      pos[i * 3]     = Math.cos(angle) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    const a = assembleProgress

    // Interactive mouse-follow rotation when active
    if (groupRef.current) {
      const targetRotY = active ? state.pointer.x * 0.4 : 0
      const targetRotX = active ? -state.pointer.y * 0.25 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3)
      groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.12
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.8
      ring1Ref.current.scale.setScalar(a)
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 1.2  // counter-rotate
      ring2Ref.current.scale.setScalar(a)
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.6
      ring3Ref.current.rotation.y += delta * 0.4
      ring3Ref.current.scale.setScalar(a * 0.9)
    }
    if (coreRef.current) {
      // Pulse emissive
      const pulse = 0.4 + Math.sin(Date.now() * 0.003) * 0.3
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * a
      coreRef.current.scale.setScalar(a)
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.25
      particlesRef.current.scale.setScalar(a)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Arc Reactor Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial
          color={BLUE}
          emissive={BLUE}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Ring 1 – equatorial */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.0, 0.06, 8, 64]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ring 2 – counter-rotating, tilted 30° */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[1.4, 0.04, 8, 64]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.35} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Ring 3 – tilted 60°, slow axis rotation */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.8, 0.03, 8, 80]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.2} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* HUD orbit particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={BLUE}
          size={0.04}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>

      {/* Point light for glow */}
      <pointLight color={BLUE} intensity={active ? 4 : 1} distance={12} decay={2} />
    </group>
  )
}
