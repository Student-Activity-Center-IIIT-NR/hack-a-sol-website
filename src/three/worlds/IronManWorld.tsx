/**
 * src/three/worlds/IronManWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * aiml — "Stark Workshop / Hologram"
 *
 * Per-track signature:
 * - Cyan data streams flowing toward the camera.
 * - Small soft nodes appear and connect with thin glowing lines as you scroll
 *   (a constellation that builds up from c = 0.05 to 0.70).
 * - Soft glow sprites, additive blending, no hard balls.
 * - Concentric arc reactor rings & subtle wireframe blueprint panels.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface IronManWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const CYAN     = new THREE.Color("#60A5FA")
const CYAN_DIM = new THREE.Color("#1E3A8A")

function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function norm(v: number, lo: number, hi: number) { return Math.max(0, Math.min(1, (v - lo) / (hi - lo))) }
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Generate circular soft glow sprite texture
function createSoftPointTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.3, "rgba(96, 165, 250, 0.8)")
    grad.addColorStop(0.7, "rgba(30, 58, 138, 0.25)")
    grad.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

// --- Data Streams & Constellation Node definitions ---
const STREAM_COUNT = 90
const NODE_COUNT   = 32

function makeStreamParticles() {
  const pos = new Float32Array(STREAM_COUNT * 3)
  const speeds = new Float32Array(STREAM_COUNT)
  for (let i = 0; i < STREAM_COUNT; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 6.5
    pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0
    pos[i * 3 + 2] = -4.5 + Math.random() * 6.5
    speeds[i] = 1.2 + Math.random() * 1.8
  }
  return { pos, speeds }
}

function makeConstellationNodes() {
  const nodes: Array<{ x: number; y: number; z: number; threshold: number }> = []
  for (let i = 0; i < NODE_COUNT; i++) {
    const angle = (i / NODE_COUNT) * Math.PI * 2
    const r = 1.2 + Math.sin(i * 1.7) * 0.8
    nodes.push({
      x: 0.8 + Math.cos(angle) * r,
      y: (Math.random() - 0.5) * 2.8,
      z: -1.2 + Math.sin(angle) * 0.6,
      threshold: 0.05 + (i / NODE_COUNT) * 0.62,
    })
  }
  return nodes
}

// Pre-calculate candidate line pairs
function makeConstellationPairs(nodes: Array<{ x: number; y: number; z: number; threshold: number }>) {
  const pairs: Array<[number, number]> = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dz = nodes[i].z - nodes[j].z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < 1.7) {
        pairs.push([i, j])
      }
    }
  }
  return pairs
}

// Concentric arc reactor rings
const RINGS = [
  { r: 1.1, tube: 0.020, tilt: [0, 0, 0] as [number,number,number],                   speed:  0.5 },
  { r: 1.7, tube: 0.015, tilt: [Math.PI / 6, 0, 0] as [number,number,number],         speed: -0.7 },
  { r: 2.3, tube: 0.010, tilt: [Math.PI / 3, Math.PI / 4, 0] as [number,number,number], speed:  0.4 },
]

export function IronManWorld({ chapterProgress: _c, active, velocity: _v }: IronManWorldProps) {
  const groupRef     = useRef<THREE.Group>(null)
  const ringRefs     = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)]
  const streamRef    = useRef<THREE.Points>(null)
  const nodePointsRef = useRef<THREE.Points>(null)
  const linesRef     = useRef<THREE.LineSegments>(null)

  const softTex = useMemo(() => createSoftPointTexture(), [])
  const streamData = useMemo(() => makeStreamParticles(), [])
  const nodes = useMemo(() => makeConstellationNodes(), [])
  const pairs = useMemo(() => makeConstellationPairs(nodes), [nodes])

  // Constellation buffer allocations
  const nodePosBuffer = useMemo(() => {
    const buf = new Float32Array(NODE_COUNT * 3)
    nodes.forEach((n, i) => {
      buf[i * 3 + 0] = n.x
      buf[i * 3 + 1] = n.y
      buf[i * 3 + 2] = n.z
    })
    return buf
  }, [nodes])

  const linePosBuffer = useMemo(() => new Float32Array(pairs.length * 6), [pairs])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    if (!active) return

    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(1.5, Math.abs(liveVel || _v || 0) * 2.5)
    const flowSpeed = 1.0 + velBoost * 2.2

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Arc reactor rings spin
    ringRefs.forEach((r, i) => {
      if (!r.current) return
      const ringA = Math.max(0, Math.min(1, (liveA - i * 0.05) / 0.85))
      r.current.scale.setScalar(ringA)
      r.current.rotation.z += delta * RINGS[i].speed * (1 + velBoost)
    })

    // Data streams flowing toward camera (z advancing from -4.5 to +2.5)
    if (streamRef.current?.geometry?.attributes?.position) {
      const positions = streamRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < STREAM_COUNT; i++) {
        positions[i * 3 + 2] += streamData.speeds[i] * flowSpeed * delta
        if (positions[i * 3 + 2] > 2.5) {
          positions[i * 3 + 2] = -4.5
        }
      }
      streamRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Constellation lines dynamic build-up
    if (linesRef.current?.geometry?.attributes?.position) {
      const lPos = linesRef.current.geometry.attributes.position.array as Float32Array
      let lineIdx = 0

      pairs.forEach(([idxA, idxB]) => {
        const nodeA = nodes[idxA]
        const nodeB = nodes[idxB]
        const activeA = c >= nodeA.threshold
        const activeB = c >= nodeB.threshold

        if (activeA && activeB) {
          lPos[lineIdx * 6 + 0] = nodeA.x
          lPos[lineIdx * 6 + 1] = nodeA.y
          lPos[lineIdx * 6 + 2] = nodeA.z
          lPos[lineIdx * 6 + 3] = nodeB.x
          lPos[lineIdx * 6 + 4] = nodeB.y
          lPos[lineIdx * 6 + 5] = nodeB.z
        } else {
          // Collapse unused segments
          lPos[lineIdx * 6 + 0] = 0
          lPos[lineIdx * 6 + 1] = 0
          lPos[lineIdx * 6 + 2] = 0
          lPos[lineIdx * 6 + 3] = 0
          lPos[lineIdx * 6 + 4] = 0
          lPos[lineIdx * 6 + 5] = 0
        }
        lineIdx++
      })
      linesRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Constellation node appearance
    if (nodePointsRef.current?.geometry?.attributes?.position) {
      const nMat = nodePointsRef.current.material as THREE.PointsMaterial
      if (nMat) {
        nMat.opacity = 0.75 * a
      }
    }
  })

  return (
    <group ref={groupRef} visible={active}>
      {/* Concentric Arc Reactor Rings */}
      <group position={[1.6, 0, -0.9]}>
        {RINGS.map((def, i) => (
          <mesh key={i} ref={ringRefs[i]} rotation={def.tilt}>
            <torusGeometry args={[def.r, def.tube, 6, 80]} />
            <meshStandardMaterial
              color={CYAN_DIM}
              emissive={CYAN}
              emissiveIntensity={0.35 - i * 0.08}
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.65 - i * 0.12}
            />
          </mesh>
        ))}
      </group>

      {/* Blueprint HUD Panels */}
      <mesh position={[-2.4, 0.5, -1.4]} rotation={[0, 0.35, 0]}>
        <planeGeometry args={[1.6, 1.1, 5, 4]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.16 * a} />
      </mesh>
      <mesh position={[2.4, -0.4, -1.4]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[1.3, 0.9, 4, 3]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.14 * a} />
      </mesh>

      {/* Data streams flowing toward camera */}
      <points ref={streamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[streamData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          color={CYAN}
          size={0.10}
          sizeAttenuation
          transparent
          opacity={0.65 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Constellation Nodes */}
      <points ref={nodePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePosBuffer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={softTex}
          color="#93C5FD"
          size={0.14}
          sizeAttenuation
          transparent
          opacity={0.75 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Constellation connecting lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePosBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={CYAN}
          transparent
          opacity={0.32 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Ambient glow point light */}
      <pointLight color={CYAN} intensity={a * 1.1} distance={10} decay={2} position={[0.8, 0, 0]} />
    </group>
  )
}