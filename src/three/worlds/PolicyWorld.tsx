/**
 * src/three/worlds/PolicyWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * policy — "Policy-thon / Daredevil"
 *
 * Requirements:
 * - NO yellow bars or pillars (removed completely).
 * - Hell's Kitchen dark rooftop skyline silhouette at the bottom.
 * - Gentle golden/crimson embers drifting upward.
 * - Elegant scales-of-justice aura ring behind character on the right (CHAR_X = 1.6).
 * - Faint "§" glyph particles.
 * - One gavel-strike shockwave ring on chapter entry (single expanding ring, NO sweep).
 * - Strict visible={active} and early useFrame return when !active to prevent leakage.
 */

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { scrollStore } from "../../utils/scrollStore"

interface PolicyWorldProps {
  chapterProgress?: number
  active: boolean
  velocity?: number
}

const GOLD      = new THREE.Color("#EAB308")
const CRIMSON   = new THREE.Color("#DC2626")
const CHAR_X    = 1.6 // Consistent right side character anchor

function ss(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number) {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}
function enterT(c: number) { return ss(norm(c, 0, 0.22)) }
function exitT(c: number)  { return ss(norm(c, 0.78, 1.0)) }
function globalA(c: number) {
  if (c < 0.22) return enterT(c)
  if (c <= 0.78) return 1
  return 1 - exitT(c)
}

// Generate faint "§" glyph particle texture
function createSectionGlyphTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64)
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
    grad.addColorStop(0, "rgba(234, 179, 8, 0.4)")
    grad.addColorStop(0.6, "rgba(220, 38, 38, 0.15)")
    grad.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)

    ctx.font = "bold 38px 'Cinzel', serif, Georgia"
    ctx.fillStyle = "rgba(254, 240, 138, 0.95)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("§", 32, 32)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
    grad.addColorStop(0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.3, "rgba(234, 179, 8, 0.8)")
    grad.addColorStop(0.7, "rgba(220, 38, 38, 0.25)")
    grad.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

const EMBER_COUNT = 55
function makeEmbers() {
  const pos = new Float32Array(EMBER_COUNT * 3)
  const speeds = new Float32Array(EMBER_COUNT)
  for (let i = 0; i < EMBER_COUNT; i++) {
    pos[i * 3 + 0] = CHAR_X + (Math.random() - 0.5) * 3.5
    pos[i * 3 + 1] = -2.5 + Math.random() * 5.0
    pos[i * 3 + 2] = -1.6 + Math.random() * 2.2
    speeds[i] = 0.35 + Math.random() * 0.45
  }
  return { pos, speeds }
}

const GLYPH_COUNT = 30
function makeGlyphParticles() {
  const pos = new Float32Array(GLYPH_COUNT * 3)
  const speeds = new Float32Array(GLYPH_COUNT)
  for (let i = 0; i < GLYPH_COUNT; i++) {
    pos[i * 3 + 0] = CHAR_X + (Math.random() - 0.5) * 3.0
    pos[i * 3 + 1] = -2.0 + Math.random() * 4.2
    pos[i * 3 + 2] = -1.4 + Math.random() * 1.8
    speeds[i] = 0.2 + Math.random() * 0.25
  }
  return { pos, speeds }
}

// Hell's Kitchen skyline silhouette buildings
const ROOFTOP_COUNT = 10
function makeRooftops() {
  return Array.from({ length: ROOFTOP_COUNT }, (_, i) => ({
    x: -3.5 + i * 0.8,
    y: -2.4 + (i % 3) * 0.2,
    z: -2.5,
    width: 0.65 + (i % 2) * 0.2,
    height: 1.1 + (i % 4) * 0.3,
  }))
}

export function PolicyWorld({ chapterProgress: _c, active, velocity: _v }: PolicyWorldProps) {
  const groupRef         = useRef<THREE.Group>(null)
  const embersRef        = useRef<THREE.Points>(null)
  const glyphsRef        = useRef<THREE.Points>(null)
  const scalesRingRef    = useRef<THREE.Group>(null)
  const shockwaveRef     = useRef<THREE.Mesh>(null)
  const timeRef          = useRef(0)

  const emberTex     = useMemo(() => createEmberTexture(), [])
  const glyphTex     = useMemo(() => createSectionGlyphTexture(), [])
  const emberData    = useMemo(() => makeEmbers(), [])
  const glyphData    = useMemo(() => makeGlyphParticles(), [])
  const rooftops     = useMemo(() => makeRooftops(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    if (state.size.width <= 0 || state.size.height <= 0) return
    if (!active) return

    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(1.5, Math.abs(liveVel || _v || 0) * 2.5)

    if (groupRef.current) {
      const ty = state.pointer.x * 0.22
      const tx = -state.pointer.y * 0.14
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // Embers rising
    if (embersRef.current?.geometry?.attributes?.position) {
      const pos = embersRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < EMBER_COUNT; i++) {
        pos[i * 3 + 1] += emberData.speeds[i] * (1 + velBoost) * delta
        pos[i * 3 + 0] += Math.sin(t * 1.5 + i) * 0.003
        if (pos[i * 3 + 1] > 2.5) {
          pos[i * 3 + 1] = -2.5
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true
      const eMat = embersRef.current.material as THREE.PointsMaterial
      if (eMat) eMat.opacity = 0.7 * liveA
    }

    // Scales of justice ring gently rocks
    if (scalesRingRef.current) {
      scalesRingRef.current.rotation.z = Math.sin(t * 1.3) * 0.05
    }

    // Glyphs drifting
    if (glyphsRef.current?.geometry?.attributes?.position) {
      const pos = glyphsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < GLYPH_COUNT; i++) {
        pos[i * 3 + 1] += glyphData.speeds[i] * delta
        if (pos[i * 3 + 1] > 2.2) {
          pos[i * 3 + 1] = -2.0
        }
      }
      glyphsRef.current.geometry.attributes.position.needsUpdate = true
      const gMat = glyphsRef.current.material as THREE.PointsMaterial
      if (gMat) gMat.opacity = 0.45 * liveA
    }

    // Gavel shockwave ring
    if (shockwaveRef.current) {
      if (liveC < 0.22) {
        const enterNorm = liveC / 0.22
        const ringScale = 0.3 + enterNorm * 3.2
        shockwaveRef.current.scale.set(ringScale, ringScale, 1)
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        if (mat) mat.opacity = (1 - enterNorm) * 0.75 * liveA
      } else {
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        if (mat) mat.opacity = 0
      }
    }
  })

  return (
    <group ref={groupRef} visible={active}>
      {/* 1. Dark Hell's Kitchen Rooftops Silhouette */}
      <group position={[0, 0, 0]}>
        {rooftops.map((r, i) => (
          <mesh key={i} position={[r.x, r.y, r.z]}>
            <planeGeometry args={[r.width, r.height]} />
            <meshBasicMaterial color="#0A0808" transparent opacity={0.6 * a} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* 2. Scales of Justice Aura Ring behind Daredevil */}
      <group ref={scalesRingRef} position={[CHAR_X, 0.0, -0.9]}>
        <mesh>
          <torusGeometry args={[1.5, 0.02, 6, 48]} />
          <meshStandardMaterial
            color="#78350F"
            emissive={GOLD}
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.65 * a}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.6, 0.025, 0.025]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.6 * a} />
        </mesh>
        <mesh position={[-0.75, -0.4, 0.02]}>
          <torusGeometry args={[0.22, 0.012, 4, 16]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.5 * a} />
        </mesh>
        <mesh position={[0.75, -0.4, 0.02]}>
          <torusGeometry args={[0.22, 0.012, 4, 16]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.5 * a} />
        </mesh>
      </group>

      {/* 3. Golden / Crimson Embers drifting */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={emberTex}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.7 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 4. "§" Glyph Particles */}
      <points ref={glyphsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glyphData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={glyphTex}
          size={0.20}
          sizeAttenuation
          transparent
          opacity={0.45 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 5. Gavel Strike Expanding Shockwave Ring (Single ring, NO sweep) */}
      <mesh ref={shockwaveRef} position={[CHAR_X, -0.7, -0.6]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[0.94, 1.0, 48]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <pointLight color={GOLD}    intensity={a * 1.1} distance={11} decay={2} position={[CHAR_X, 0, 0]} />
      <pointLight color={CRIMSON} intensity={a * 0.7} distance={9}  decay={2} position={[CHAR_X - 1.2, 1.2, 0]} />
    </group>
  )
}
