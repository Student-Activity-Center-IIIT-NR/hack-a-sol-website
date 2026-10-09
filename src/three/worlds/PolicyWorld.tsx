/**
 * src/three/worlds/PolicyWorld.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * policy — "Policy-thon / Daredevil"
 *
 * Requirements:
 * - Instanced golden pillars rising from the floor (staggered).
 * - Floating document sheets drifting with parallax.
 * - Scales-of-justice ring behind the character (x ≈ -1.6 for odd index).
 * - Faint "§" glyph particles.
 * - One gavel-strike shockwave ring (a single expanding ring, NOT a sweep) when chapter enters.
 * - Generic shapes only, no copyrighted logos.
 * - ENTER / HOLD / EXIT phases driven by chapterProgress c, activeIndex, and Lenis velocity.
 * - Under ~1000 particles/triangles, soft glow sprites, capped on-screen size.
 * - Strict: NO radar, radar-sense, sweep, or rotating light-beam effect.
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
const GOLD_DIM  = new THREE.Color("#854D0E")
const CHAR_X    = -1.6 // Track index 3: text on right, character on left

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
    // Soft radial aura behind glyph
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
    grad.addColorStop(0, "rgba(234, 179, 8, 0.35)")
    grad.addColorStop(0.6, "rgba(202, 138, 4, 0.12)")
    grad.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)

    // Render "§" glyph
    ctx.font = "bold 40px 'Cinzel', serif, Georgia"
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

// Pillar configuration (14 staggered pillars)
const PILLAR_COUNT = 14
function makePillarData() {
  const data = []
  for (let i = 0; i < PILLAR_COUNT; i++) {
    const angle = (i / PILLAR_COUNT) * Math.PI * 2
    const radius = 1.6 + (i % 3) * 0.9
    const x = CHAR_X + Math.cos(angle) * radius * 1.3
    const z = -1.4 + Math.sin(angle) * 1.1
    const targetHeight = 1.6 + (i % 4) * 0.5
    data.push({
      x,
      z,
      targetHeight,
      stagger: (i / PILLAR_COUNT) * 0.14,
    })
  }
  return data
}

// Floating documents (10 sheets)
const DOC_COUNT = 10
function makeDocumentData() {
  return Array.from({ length: DOC_COUNT }, (_, i) => ({
    x: CHAR_X + (Math.random() - 0.5) * 3.6,
    y: -1.2 + Math.random() * 2.8,
    z: -1.6 + Math.random() * 2.2,
    rotX: Math.random() * Math.PI,
    rotY: Math.random() * Math.PI,
    rotSpeedX: 0.2 + (i % 3) * 0.15,
    rotSpeedY: 0.25 + (i % 2) * 0.2,
    driftSpeedY: 0.18 + Math.random() * 0.25,
  }))
}

// Glyph particle points (40 particles)
const GLYPH_COUNT = 40
function makeGlyphParticles() {
  const pos = new Float32Array(GLYPH_COUNT * 3)
  const speeds = new Float32Array(GLYPH_COUNT)
  for (let i = 0; i < GLYPH_COUNT; i++) {
    pos[i * 3 + 0] = CHAR_X + (Math.random() - 0.5) * 4.0
    pos[i * 3 + 1] = -2.2 + Math.random() * 4.4
    pos[i * 3 + 2] = -1.8 + Math.random() * 2.4
    speeds[i] = 0.25 + Math.random() * 0.35
  }
  return { pos, speeds }
}

export function PolicyWorld({ chapterProgress: _c, active, velocity: _v }: PolicyWorldProps) {
  const groupRef         = useRef<THREE.Group>(null)
  const pillarsRef       = useRef<THREE.InstancedMesh>(null)
  const docsGroupRef     = useRef<THREE.Group>(null)
  const glyphsRef        = useRef<THREE.Points>(null)
  const scalesRingRef    = useRef<THREE.Group>(null)
  const shockwaveRef     = useRef<THREE.Mesh>(null)
  const timeRef          = useRef(0)

  const glyphTex     = useMemo(() => createSectionGlyphTexture(), [])
  const pillarData   = useMemo(() => makePillarData(), [])
  const docData      = useMemo(() => makeDocumentData(), [])
  const glyphData    = useMemo(() => makeGlyphParticles(), [])
  const dummy        = useMemo(() => new THREE.Object3D(), [])

  const c = _c ?? scrollStore.getChapterProgress()
  const a = globalA(c)

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const liveC = scrollStore.getChapterProgress()
    const liveA = globalA(liveC)
    const liveVel = scrollStore.getVelocity()
    const velBoost = Math.min(1.5, Math.abs(liveVel || _v || 0) * 2.5)

    if (groupRef.current) {
      const ty = active ? state.pointer.x * 0.22 : 0
      const tx = active ? -state.pointer.y * 0.14 : 0
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, delta * 2)
      const dollyZ = liveC < 0.22 ? -2.5 * (1 - enterT(liveC)) : 0
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dollyZ, delta * 3)
    }

    // 1. Instanced golden pillars rising from the floor (staggered during ENTER)
    if (pillarsRef.current) {
      pillarData.forEach((p, i) => {
        const enterFrac = Math.max(0, Math.min(1, (liveC - p.stagger) / 0.18))
        const riseProgress = ss(enterFrac)
        // Pillar rises from y = -4.0 up to base floor y = -1.8
        const floorY = -2.2
        const heightScale = riseProgress * (1 - exitT(liveC))
        const currentY = floorY + (p.targetHeight * heightScale) / 2
        dummy.position.set(p.x, currentY, p.z)
        dummy.scale.set(1, Math.max(0.001, heightScale), 1)
        dummy.rotation.set(0, (i * Math.PI) / 4, 0)
        dummy.updateMatrix()
        pillarsRef.current!.setMatrixAt(i, dummy.matrix)
      })
      pillarsRef.current.instanceMatrix.needsUpdate = true

      const mat = pillarsRef.current.material as THREE.MeshStandardMaterial
      if (mat) {
        mat.opacity = 0.72 * liveA
      }
    }

    // 2. Floating document sheets drifting with parallax
    if (docsGroupRef.current) {
      const children = docsGroupRef.current.children
      docData.forEach((doc, i) => {
        const mesh = children[i] as THREE.Mesh | undefined
        if (!mesh) return
        doc.y += doc.driftSpeedY * (1 + velBoost) * delta
        if (doc.y > 2.2) doc.y = -1.8
        mesh.position.set(doc.x, doc.y, doc.z)
        mesh.rotation.set(
          doc.rotX + t * doc.rotSpeedX,
          doc.rotY + t * doc.rotSpeedY,
          Math.sin(t * 0.8 + i) * 0.15
        )
      })
    }

    // 3. Scales of justice ring behind character gently balances
    if (scalesRingRef.current) {
      scalesRingRef.current.rotation.z = Math.sin(t * 1.4) * 0.05
      scalesRingRef.current.scale.setScalar(0.85 + 0.15 * ss(norm(liveC, 0.05, 0.22)))
    }

    // 4. "§" glyph particles drifting upward
    if (glyphsRef.current?.geometry?.attributes?.position) {
      const positions = glyphsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < GLYPH_COUNT; i++) {
        positions[i * 3 + 1] += glyphData.speeds[i] * (1 + velBoost * 1.5) * delta
        if (positions[i * 3 + 1] > 2.4) {
          positions[i * 3 + 1] = -2.2
        }
      }
      glyphsRef.current.geometry.attributes.position.needsUpdate = true

      const gMat = glyphsRef.current.material as THREE.PointsMaterial
      if (gMat) {
        gMat.opacity = 0.55 * liveA
      }
    }

    // 5. One gavel-strike shockwave ring on chapter enter (single expanding ring, NO sweep)
    if (shockwaveRef.current) {
      if (liveC < 0.22 && active) {
        const enterNorm = liveC / 0.22
        const ringScale = 0.2 + enterNorm * 3.4
        const ringAlpha = (1 - enterNorm) * 0.85 * liveA
        shockwaveRef.current.scale.set(ringScale, ringScale, 1)
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        if (mat) {
          mat.opacity = ringAlpha
        }
      } else {
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        if (mat) mat.opacity = 0
      }
    }
  })

  return (
    <group ref={groupRef} visible={active || a > 0.001}>
      {/* 1. Instanced Golden Pillars */}
      <instancedMesh ref={pillarsRef} args={[undefined, undefined, PILLAR_COUNT]}>
        <cylinderGeometry args={[0.14, 0.16, 2.4, 8]} />
        <meshStandardMaterial
          color={GOLD_DIM}
          emissive={GOLD}
          emissiveIntensity={0.35}
          metalness={0.8}
          roughness={0.25}
          transparent
          opacity={0.72 * a}
        />
      </instancedMesh>

      {/* 2. Floating Document Sheets */}
      <group ref={docsGroupRef}>
        {docData.map((_, i) => (
          <mesh key={i}>
            <planeGeometry args={[0.32, 0.44]} />
            <meshBasicMaterial
              color="#FEF08A"
              wireframe={i % 2 === 1}
              transparent
              opacity={0.32 * a}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* 3. Scales of Justice Ring behind character */}
      <group ref={scalesRingRef} position={[CHAR_X, 0.2, -0.9]}>
        {/* Outer glowing halo ring */}
        <mesh>
          <torusGeometry args={[1.5, 0.022, 6, 48]} />
          <meshStandardMaterial
            color={GOLD_DIM}
            emissive={GOLD}
            emissiveIntensity={0.55}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.75 * a}
          />
        </mesh>
        {/* Horizontal balance beam */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.7, 0.03, 0.03]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.65 * a} />
        </mesh>
        {/* Central fulcrum */}
        <mesh position={[0, 0.15, 0.02]}>
          <coneGeometry args={[0.12, 0.3, 4]} />
          <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.6 * a} />
        </mesh>
        {/* Left and right suspended scale pan rings */}
        <mesh position={[-0.8, -0.45, 0.02]}>
          <torusGeometry args={[0.26, 0.015, 4, 16]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.55 * a} />
        </mesh>
        <mesh position={[0.8, -0.45, 0.02]}>
          <torusGeometry args={[0.26, 0.015, 4, 16]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.55 * a} />
        </mesh>
      </group>

      {/* 4. "§" Glyph Particles */}
      <points ref={glyphsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glyphData.pos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={glyphTex}
          size={0.22}
          sizeAttenuation
          transparent
          opacity={0.55 * a}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 5. Gavel-Strike Shockwave Ring (Single expanding ring, NO sweep) */}
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

      {/* Golden ambient glow point lights */}
      <pointLight color={GOLD} intensity={a * 1.2} distance={11} decay={2} position={[CHAR_X, 0, 0]} />
      <pointLight color="#CA8A04" intensity={a * 0.7} distance={8} decay={2} position={[CHAR_X + 1.2, 1.2, -0.5]} />
    </group>
  )
}
