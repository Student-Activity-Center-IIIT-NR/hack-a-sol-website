/**
 * src/three/worlds/UltronWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Ultron / Robonyx (Buildathon) — Red wireframe + particle swarm.
 *
 * A red wireframe dodecahedron that flickers on/off (glitch effect).
 * Surrounding particle cloud that "pulses" like a breathing entity.
 * localT drives assembly / scatter of the particle swarm.
 *
 * Color: red wireframe #F87171
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface UltronWorldProps {
  localT: number
  active: boolean
}

const RED = '#F87171'
const PARTICLE_COUNT = 300

export function UltronWorld({ localT, active }: UltronWorldProps) {
  const wireRef    = useRef<THREE.Mesh>(null)
  const matRef     = useRef<THREE.MeshBasicMaterial>(null)
  const particleRef = useRef<THREE.Points>(null)
  const groupRef   = useRef<THREE.Group>(null)
  const flickerRef  = useRef(0)

  // Assemble
  const a = Math.sin(Math.min(1, Math.max(0, localT * 2)) * Math.PI * 0.5)

  // Particle positions: random sphere distribution that "breathes"
  const basePositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = 1.5 + Math.random() * 0.8
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 1.3   // slightly taller — head silhouette hint
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return pos
  }, [])

  // Scatter positions
  const scatterPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return pos
  }, [])

  const posAttr = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
  const geomRef = useRef<THREE.BufferGeometry>(null)

  useFrame((state, delta) => {
    // Glitch flicker on wireframe
    flickerRef.current += delta
    if (matRef.current) {
      const flicker = Math.random() > 0.95 ? 0 : 1
      matRef.current.opacity = flicker * a
      wireRef.current && (wireRef.current.rotation.y += delta * 0.3 * a)
      wireRef.current && (wireRef.current.rotation.x += delta * 0.15 * a)
    }

    // Particle breath: radius pulses
    const breathe = 1 + Math.sin(flickerRef.current * 1.5) * 0.15
    if (geomRef.current) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr[i * 3]     = (basePositions[i * 3]     * breathe) * a + scatterPositions[i * 3]     * (1 - a)
        posAttr[i * 3 + 1] = (basePositions[i * 3 + 1] * breathe) * a + scatterPositions[i * 3 + 1] * (1 - a)
        posAttr[i * 3 + 2] = (basePositions[i * 3 + 2] * breathe) * a + scatterPositions[i * 3 + 2] * (1 - a)
      }
      const attr = geomRef.current.getAttribute('position') as THREE.BufferAttribute
      attr.array = posAttr
      attr.needsUpdate = true
    }

    if (groupRef.current) {
      const targetRotY = active ? state.pointer.x * 0.4 : 0
      const targetRotX = active ? -state.pointer.y * 0.25 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Red wireframe dodecahedron */}
      <mesh ref={wireRef}>
        <dodecahedronGeometry args={[1.1, 0]} />
        <meshBasicMaterial
          ref={matRef}
          color={RED}
          wireframe
          transparent
          opacity={a}
        />
      </mesh>
      {/* Solid inner glow */}
      <mesh scale={[0.98, 0.98, 0.98]}>
        <dodecahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color={RED}
          emissive={RED}
          emissiveIntensity={0.2 * a}
          metalness={0.9}
          roughness={0.3}
          transparent
          opacity={0.15 * a}
        />
      </mesh>

      {/* Particle swarm */}
      <points ref={particleRef}>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute attach="attributes-position" args={[posAttr, 3]} />
        </bufferGeometry>
        <pointsMaterial color={RED} size={0.035} sizeAttenuation transparent opacity={0.7 * a} />
      </points>

      <pointLight color={RED} intensity={active ? 5 : 1} distance={14} decay={2} />
    </group>
  )
}
