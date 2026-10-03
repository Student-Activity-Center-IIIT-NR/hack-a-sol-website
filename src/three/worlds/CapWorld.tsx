/**
 * src/three/worlds/CapWorld.tsx  (Phase 3h — Marvel environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * cybersec — "SHIELD Ops Room"
 * Tactical world-map grid with nodes that ping and connect, radar sweep,
 * hexagon firewall ripples, five-point star pulse, red/blue scan sweep, glitch.
 * NO official logos or trademarks — only generic shapes.
 *
 * chapterProgress c: ENTER 0–0.22 | HOLD 0.22–0.78 | EXIT 0.78–1.0
 * Colors: #EF4444 red, #3B82F6 blue
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CapWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number
}

const RED  = new THREE.Color("#EF4444")
const BLUE = new THREE.Color("#3B82F6")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Hexagon grid nodes
const NODE_COUNT = 24
function makeNodes() {
  const positions: { x: number; y: number; delay: number }[] = []
  for (let i = 0; i < NODE_COUNT; i++) {
    const angle = (i / NODE_COUNT) * Math.PI * 2
    const r = 1.5 + (i % 3) * 0.7
    positions.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.5,
      delay: (i / NODE_COUNT) * 0.5,
    })
  }
  return positions
}

// Radar sweep shader
const radarVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const radarFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uAngle;
  uniform float uOpacity;
  void main() {
    vec2 c = vUv - 0.5;
    float dist = length(c);
    float ang  = atan(c.y, c.x);
    float diff = mod(ang - uAngle + 6.2832, 6.2832);
    float sweep = smoothstep(1.2, 0.0, diff) * (1.0 - smoothstep(0.38, 0.50, dist));
    gl_FragColor = vec4(0.24, 0.52, 0.95, sweep * 0.55 * uOpacity);
  }
`

export function CapWorld({ chapterProgress: c, active, velocity = 0 }: CapWorldProps) {
  const groupRef    = useRef<THREE.Group>(null)
  const gridRef     = useRef<THREE.Mesh>(null)
  const radarRef    = useRef<THREE.Mesh>(null)
  const radarMatRef = useRef<THREE.ShaderMaterial>(null)
  const shockRef    = useRef<THREE.Mesh>(null)
  const shockMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const starRef     = useRef<THREE.Mesh>(null)
  const timeRef     = useRef(0)

  const nodes = useMemo(() => makeNodes(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const a = globalA(c)

  // Instanced hex dots for the grid nodes
  const nodeRef = useRef<THREE.InstancedMesh>(null)

  useFrame((state, delta) => {
    timeRef.current += delta
    const velBoost = Math.min(1, velocity * 3)
    const spinMul  = 1 + velBoost * 2

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.3 : 0
      const tx = active ? -state.pointer.y * 0.2 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = c < 0.22 ? -3 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Grid appear
    if (gridRef.current) {
      gridRef.current.scale.setScalar(a * 0.9)
    }

    // Radar sweep
    if (radarMatRef.current) {
      radarMatRef.current.uniforms.uAngle.value = (timeRef.current * 1.2 * spinMul) % (Math.PI * 2)
      radarMatRef.current.uniforms.uOpacity.value = a
    }

    // Shockwave hex ripple
    if (shockRef.current && shockMatRef.current) {
      const cycle = (timeRef.current * 0.4) % 1
      shockRef.current.scale.setScalar(1 + cycle * 2.5)
      shockMatRef.current.opacity = Math.max(0, (1 - cycle) * 0.35 * a)
    }

    // Five-point star pulse
    if (starRef.current) {
      const pulse = 0.9 + Math.sin(timeRef.current * 2.5 + velBoost * 3) * 0.1
      starRef.current.scale.setScalar(a * pulse)
      starRef.current.rotation.z += delta * 0.2
    }

    // Node pings
    if (nodeRef.current) {
      nodes.forEach(({ x, y, delay }, i) => {
        const pingA = Math.max(0, Math.min(1, (a - delay * 0.4) / (0.6 + 0.4))) * (0.6 + Math.sin(timeRef.current * 2 + i) * 0.4)
        dummy.position.set(x, y, -0.8)
        dummy.scale.setScalar(0.06 + pingA * 0.04)
        dummy.updateMatrix()
        nodeRef.current!.setMatrixAt(i, dummy.matrix)
      })
      nodeRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Tactical map grid — flat plane with wireframe */}
      <mesh ref={gridRef} position={[0, -1.5, -1]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <planeGeometry args={[8, 5, 12, 8]} />
        <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.12} />
      </mesh>

      {/* Grid node pings */}
      <instancedMesh ref={nodeRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.8} />
      </instancedMesh>

      {/* Radar sweep disk */}
      <mesh ref={radarRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -0.5]}>
        <circleGeometry args={[2.5, 64]} />
        <shaderMaterial
          ref={radarMatRef}
          vertexShader={radarVert}
          fragmentShader={radarFrag}
          uniforms={{ uAngle: { value: 0 }, uOpacity: { value: 0 } }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hexagon firewall ring */}
      <mesh ref={shockRef} position={[0, 0, -0.6]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.04, 6, 6]} />
        <meshBasicMaterial
          ref={shockMatRef}
          color={RED}
          transparent
          opacity={0}
          wireframe
        />
      </mesh>

      {/* Generic five-point star (built from torus with 5 segments) */}
      <mesh ref={starRef} position={[0, 0, -0.4]}>
        <torusGeometry args={[0.6, 0.08, 4, 5]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.3} transparent opacity={0.6 * a} />
      </mesh>

      {/* Scan line plane */}
      <mesh position={[0, 0, -0.9]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 0.015]} />
        <meshBasicMaterial color={RED} transparent opacity={0.35 * a} />
      </mesh>

      {/* Outer hex ring */}
      <mesh position={[0, 0, -1]} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[2.8, 0.015, 6, 6]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.2 * a} />
      </mesh>

      <pointLight color={RED}  intensity={a * 1.0} distance={10} decay={2} />
      <pointLight color={BLUE} intensity={a * 0.5} distance={8}  decay={2} position={[0, 2, 0]} />
    </group>
  )
}