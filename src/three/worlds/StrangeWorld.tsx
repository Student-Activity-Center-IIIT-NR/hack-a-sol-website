/**
 * src/three/worlds/StrangeWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Doctor Strange / CodeRun — Eye of Agamotto + Mandala portal.
 *
 * - A central torusKnot (Eye of Agamotto core), gold
 * - 4 stacked torus rings rotating in different axes (mandala)
 * - Expanding portal disc with custom shader that glows from center
 * - Gold spark particles orbiting
 *
 * Color: #F59E0B (amber/gold)
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StrangeWorldProps {
  localT: number
  active: boolean
}

const GOLD  = '#F59E0B'
const SPARK_COUNT = 200

// Simple portal shader — radial gradient from center
const portalVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const portalFragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float ring = smoothstep(0.45, 0.3, dist) * smoothstep(0.0, 0.25, dist);
    float pulse = 0.6 + 0.4 * sin(uTime * 2.0 - dist * 10.0);
    float alpha = ring * pulse * uProgress;
    vec3 color = mix(vec3(0.95, 0.62, 0.04), vec3(1.0, 0.9, 0.4), 1.0 - dist * 2.0);
    gl_FragColor = vec4(color, alpha);
  }
`

export function StrangeWorld({ localT, active }: StrangeWorldProps) {
  const eyeRef     = useRef<THREE.Mesh>(null)
  const ring1Ref   = useRef<THREE.Mesh>(null)
  const ring2Ref   = useRef<THREE.Mesh>(null)
  const ring3Ref   = useRef<THREE.Mesh>(null)
  const ring4Ref   = useRef<THREE.Mesh>(null)
  const portalRef  = useRef<THREE.Mesh>(null)
  const groupRef   = useRef<THREE.Group>(null)
  const sparkRef   = useRef<THREE.Points>(null)
  const timeRef    = useRef(0)

  const portalMat = useRef<THREE.ShaderMaterial>(null)

  const a = Math.sin(Math.min(1, Math.max(0, localT * 2)) * Math.PI * 0.5)

  // Spark positions — orbit in a sphere
  const sparkPositions = useMemo(() => {
    const pos = new Float32Array(SPARK_COUNT * 3)
    for (let i = 0; i < SPARK_COUNT; i++) {
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = 2.0 + Math.random() * 0.6
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi)
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    timeRef.current += delta

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.8
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 1.1
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.6
    if (ring4Ref.current) { ring4Ref.current.rotation.z -= delta * 0.4; ring4Ref.current.rotation.x += delta * 0.3 }

    if (eyeRef.current) {
      eyeRef.current.rotation.y += delta * 0.7
      eyeRef.current.scale.setScalar(a)
    }
    if (sparkRef.current) {
      sparkRef.current.rotation.y += delta * 0.2
      sparkRef.current.scale.setScalar(a)
    }

    // Scale rings in sequence (staggered reveal)
    const rings = [ring1Ref, ring2Ref, ring3Ref, ring4Ref]
    rings.forEach((r, i) => {
      if (r.current) {
        const delay = (i / 4) * 0.3
        const s = Math.max(0, Math.min(1, (a - delay) / 0.7))
        r.current.scale.setScalar(s)
      }
    })

    // Portal shader uniforms
    if (portalMat.current) {
      portalMat.current.uniforms.uTime.value = timeRef.current
      portalMat.current.uniforms.uProgress.value = a
    }

    if (groupRef.current) {
      const targetRotY = active ? state.pointer.x * 0.45 : 0
      const targetRotX = active ? -state.pointer.y * 0.3 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3)
      groupRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Eye of Agamotto core */}
      <mesh ref={eyeRef}>
        <torusKnotGeometry args={[0.5, 0.18, 128, 16, 2, 3]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.7} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Mandala rings — each tilted differently */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.2, 0.04, 8, 80]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.035, 8, 80]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.4} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.0, 0.025, 8, 80]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={ring4Ref} rotation={[Math.PI / 3, Math.PI / 6, Math.PI / 4]}>
        <torusGeometry args={[2.5, 0.02, 8, 100]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.15} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Portal disc (custom shader) */}
      <mesh ref={portalRef}>
        <planeGeometry args={[4, 4, 1, 1]} />
        <shaderMaterial
          ref={portalMat}
          vertexShader={portalVertexShader}
          fragmentShader={portalFragmentShader}
          uniforms={{ uTime: { value: 0 }, uProgress: { value: 0 } }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spark particles */}
      <points ref={sparkRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={GOLD} size={0.05} sizeAttenuation transparent opacity={0.8} />
      </points>

      <pointLight color={GOLD} intensity={active ? 4 : 0.8} distance={14} decay={2} />
    </group>
  )
}
