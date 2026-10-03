/**
 * src/three/worlds/StrangeWorld.tsx  (Phase 3h — Marvel environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * coderun — "Sanctum / Mirror Dimension"
 * Kaleidoscopic folding city-block planes that rotate on scroll, spell-circle
 * mandalas that unfold layer by layer and counter-rotate, time rings, branching
 * decision tree of "futures" that grows branch by branch, gold sparks, code glyphs.
 * No official logos or trademarks — only generic shapes and original patterns.
 *
 * chapterProgress c: ENTER 0–0.22 | HOLD 0.22–0.78 | EXIT 0.78–1.0
 * Color: #F59E0B gold/amber
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface StrangeWorldProps {
  chapterProgress: number
  active: boolean
  velocity?: number
}

const GOLD   = new THREE.Color("#F59E0B")
const TEAL   = new THREE.Color("#06B6D4")
const SPARK_COUNT  = 220
const BLOCK_COUNT  = 12

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Portal shader (original, NOT from any Marvel source)
const portalVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const portalFrag = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  void main() {
    vec2 ctr = vUv - 0.5;
    float d   = length(ctr);
    float ang  = atan(ctr.y, ctr.x);
    float rings = 0.5 + 0.5 * sin(d * 18.0 - uTime * 2.5);
    float swirl = 0.5 + 0.5 * sin(ang * 6.0 + uTime + d * 5.0);
    float alpha = rings * swirl * smoothstep(0.5, 0.1, d) * uProgress;
    vec3  col   = mix(vec3(0.95, 0.62, 0.04), vec3(0.02, 0.71, 0.84), swirl * 0.4);
    gl_FragColor = vec4(col, alpha * 0.55);
  }
`

function makeSparkPositions() {
  const pos = new Float32Array(SPARK_COUNT * 3)
  for (let i = 0; i < SPARK_COUNT; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const r = 2.0 + Math.random() * 0.8
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.cos(phi)
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  return pos
}

export function StrangeWorld({ chapterProgress: c, active, velocity = 0 }: StrangeWorldProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const portalRef  = useRef<THREE.Mesh>(null)
  const portalMat  = useRef<THREE.ShaderMaterial>(null)
  const sparkRef   = useRef<THREE.Points>(null)
  const blockRef   = useRef<THREE.InstancedMesh>(null)
  const ringRefs   = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const timeRef    = useRef(0)

  const sparkPos = useMemo(() => makeSparkPositions(), [])
  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const a = globalA(c)

  // Mandala ring definitions
  const mandalaRings = useMemo(() => [
    { r: 1.0, tube: 0.025, tilt: [0, 0, 0],                          speed:  0.7 },
    { r: 1.4, tube: 0.018, tilt: [Math.PI / 2, 0, 0],                speed: -1.0 },
    { r: 1.9, tube: 0.013, tilt: [Math.PI / 4, Math.PI / 4, 0],      speed:  0.55 },
    { r: 2.5, tube: 0.009, tilt: [Math.PI / 3, 0, Math.PI / 5],      speed: -0.4 },
    { r: 3.2, tube: 0.005, tilt: [Math.PI * 0.4, Math.PI * 0.2, 0],  speed:  0.25 },
  ], [])

  useFrame((state, delta) => {
    timeRef.current += delta
    const t  = timeRef.current
    const vel = Math.min(1, velocity * 4)
    const spinMul = 1 + vel * 2.5

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.3 : 0
      const tx = active ? -state.pointer.y * 0.2 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = c < 0.22 ? -3 * (1 - enterT(c)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Mandala rings — staggered reveal
    ringRefs.forEach((r, i) => {
      if (!r.current) return
      const def = mandalaRings[i]
      const delay = (i / mandalaRings.length) * 0.35
      const ringA = ss(Math.max(0, Math.min(1, (a - delay) / (1 - delay + 0.001))))
      r.current.scale.setScalar(ringA)
      r.current.rotation.z += delta * def.speed * spinMul
    })

    // Portal shader
    if (portalMat.current) {
      portalMat.current.uniforms.uTime.value = t
      portalMat.current.uniforms.uProgress.value = a
    }

    // Folding city blocks (instanced)
    if (blockRef.current) {
      for (let i = 0; i < BLOCK_COUNT; i++) {
        const delay = (i / BLOCK_COUNT) * 0.4
        const blockA = ss(Math.max(0, Math.min(1, (a - delay) / (1 - delay + 0.001))))
        const angle  = (i / BLOCK_COUNT) * Math.PI * 2 + t * (0.08 + (i % 3) * 0.04)
        const r      = 3.5 + (i % 3) * 0.4
        dummy.position.set(
          Math.cos(angle) * r,
          Math.sin(angle * 0.5) * 0.8,
          -1.5,
        )
        dummy.scale.setScalar(blockA * 0.25)
        dummy.rotation.set(t * 0.3 + i * 0.5, t * 0.2 + i * 0.3, angle)
        dummy.updateMatrix()
        blockRef.current.setMatrixAt(i, dummy.matrix)
      }
      blockRef.current.instanceMatrix.needsUpdate = true
    }

    // Sparks
    if (sparkRef.current) {
      sparkRef.current.rotation.y += delta * 0.22 * spinMul
      sparkRef.current.scale.setScalar(a * 0.65)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Portal disc — swirling original pattern */}
      <mesh ref={portalRef} position={[0, 0, -1.2]}>
        <circleGeometry args={[2.8, 64]} />
        <shaderMaterial
          ref={portalMat}
          vertexShader={portalVert}
          fragmentShader={portalFrag}
          uniforms={{ uTime: { value: 0 }, uProgress: { value: 0 } }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mandala/spell-circle rings — staggered, counter-rotating */}
      {mandalaRings.map((def, i) => (
        <mesh
          key={i}
          ref={ringRefs[i]}
          rotation={def.tilt as [number, number, number]}
        >
          <torusGeometry args={[def.r, def.tube, 6, 72]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? GOLD : TEAL}
            emissive={i % 2 === 0 ? GOLD : TEAL}
            emissiveIntensity={0.3 - i * 0.04}
            metalness={0.6}
            roughness={0.3}
            transparent
            opacity={0.75 - i * 0.1}
          />
        </mesh>
      ))}

      {/* Folding city blocks (instanced wireframe boxes) */}
      <instancedMesh ref={blockRef} args={[undefined, undefined, BLOCK_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.35} />
      </instancedMesh>

      {/* Gold sparks */}
      <points ref={sparkRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={GOLD} size={0.04} sizeAttenuation transparent opacity={0.75} />
      </points>

      {/* Branching decision tree — simplified with line segments */}
      {[0, 1, 2, 3].map((i) => {
        const treeA = Math.max(0, Math.min(1, (a - i * 0.1) / 0.4))
        return (
          <mesh key={`tree-${i}`} position={[i % 2 === 0 ? -0.5 : 0.5, 1.5 + i * 0.4, -0.3]} rotation={[0, 0, Math.PI / 6 * (i % 2 === 0 ? 1 : -1)]}>
            <boxGeometry args={[0.015, treeA * 0.6, 0.015]} />
            <meshBasicMaterial color={GOLD} transparent opacity={treeA * 0.6} />
          </mesh>
        )
      })}

      <pointLight color={GOLD} intensity={a * 1.2} distance={14} decay={2} />
      <pointLight color={TEAL} intensity={a * 0.4} distance={8}  decay={2} position={[0, 2, 0]} />
    </group>
  )
}