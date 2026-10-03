/**
 * src/three/worlds/IronManWorld.tsx  (Phase 3h — Marvel environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * aiml — "Stark Workshop Hologram"
 * Blue JARVIS-style HUD panels, concentric reactor rings, blueprint wireframe
 * suit parts that assemble line-by-line on scroll, targeting reticles, floating
 * data particles. Character is the hero; environment dims to ~30% brightness.
 *
 * chapterProgress c: ENTER 0–0.22 | HOLD 0.22–0.78 | EXIT 0.78–1.0
 * Color: #60A5FA (blue-400)
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface IronManWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number   // Lenis scroll velocity (0+)
}

const BLUE      = new THREE.Color("#60A5FA")
const BLUE_DIM  = new THREE.Color("#1B4FA8") // dimmed version

// ── helpers ────────────────────────────────────────────────────────────────
function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// ── data particles ─────────────────────────────────────────────────────────
const PARTICLE_COUNT = 180
function makeParticles() {
  const pos = new Float32Array(PARTICLE_COUNT * 3)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2
    const r = 2.5 + Math.sin(i * 2.3) * 0.6
    pos[i * 3]     = Math.cos(angle) * r
    pos[i * 3 + 1] = (Math.random() - 0.5) * 4
    pos[i * 3 + 2] = Math.sin(angle) * r * 0.5
  }
  return pos
}

// ── ring definitions ────────────────────────────────────────────────────────
const RINGS = [
  { r: 1.2, tube: 0.025, tilt: [0, 0, 0],                 speed:  0.6 },
  { r: 1.8, tube: 0.018, tilt: [Math.PI / 6, 0, 0],       speed: -0.9 },
  { r: 2.4, tube: 0.013, tilt: [Math.PI / 3, Math.PI/4,0],speed:  0.4 },
  { r: 3.2, tube: 0.008, tilt: [Math.PI * 0.4, 0, 0],     speed: -0.3 },
]

export function IronManWorld({ chapterProgress: c, active, velocity = 0 }: IronManWorldProps) {
  const groupRef    = useRef<THREE.Group>(null)
  const ringRefs    = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const particleRef = useRef<THREE.Points>(null)
  const timeRef     = useRef(0)

  const particlePositions = useMemo(() => makeParticles(), [])

  const a = globalA(c)

  useFrame((state, delta) => {
    timeRef.current += delta

    const velBoost = Math.min(1, velocity * 3)
    const spinMul  = 1 + velBoost * 2.5

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.25 : 0
      const tx = active ? -state.pointer.y * 0.15 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      // camera dolly in on ENTER
      const dollyZ = c < 0.22 ? -3 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    RINGS.forEach((def, i) => {
      const r = ringRefs[i]
      if (!r.current) return
      // stagger: ring i assembles at enterT offset
      const delay = i * 0.06
      const ringA = Math.max(0, Math.min(1, (a - delay) / (1 - delay + 0.001)))
      r.current.scale.setScalar(ringA)
      r.current.rotation.z += delta * def.speed * spinMul
    })

    if (particleRef.current) {
      particleRef.current.rotation.y += delta * 0.18 * spinMul
      particleRef.current.scale.setScalar(a * 0.6)  // behind char = scale down
    }
  })

  return (
    <group ref={groupRef}>
      {/* Concentric reactor rings — behind character */}
      <group position={[0, 0, -0.8]}>
        {RINGS.map((def, i) => (
          <mesh
            key={i}
            ref={ringRefs[i]}
            rotation={def.tilt as [number, number, number]}
          >
            <torusGeometry args={[def.r, def.tube, 6, 96]} />
            <meshStandardMaterial
              color={BLUE_DIM}
              emissive={BLUE}
              emissiveIntensity={0.25 - i * 0.04}
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.7 - i * 0.12}
            />
          </mesh>
        ))}
      </group>

      {/* HUD wireframe plane — blueprint panels */}
      <mesh position={[-2.5, 0.6, -1.5]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[1.8, 1.2, 6, 4]} />
        <meshBasicMaterial
          color={BLUE}
          wireframe
          transparent
          opacity={0.18 * a}
        />
      </mesh>
      <mesh position={[2.5, -0.3, -1.5]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[1.4, 1.0, 5, 3]} />
        <meshBasicMaterial
          color={BLUE}
          wireframe
          transparent
          opacity={0.15 * a}
        />
      </mesh>

      {/* Data particles */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={BLUE} size={0.03} sizeAttenuation transparent opacity={0.5} />
      </points>

      {/* Environment lighting — dimmed to ~30% vs character */}
      <pointLight color={BLUE} intensity={a * 1.2} distance={12} decay={2} />
    </group>
  )
}