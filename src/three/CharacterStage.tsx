/**
 * src/three/CharacterStage.tsx  (Phase 3b — full visibility fix)
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart character display with 3-tier priority:
 *   1. GLB model  — Draco-compressed, auto-fit, per-track transform overrides
 *   2. Image plane — transparent PNG depth-layers with parallax
 *   3. null        — lets existing procedural world render
 *
 * Lighting rig per model:
 *   • Key light   — warm white from upper-left front
 *   • Fill light  — cool white from right, 1/3 key intensity
 *   • Rim light   — track.accentColor from behind-left, hot
 *   • Glow disk   — canvas-texture radial gradient plane behind model
 *
 * Pose & animation:
 *   • Default rest: [0, π/8, 0] — slight 3/4 turn
 *   • Scroll rotation: ±25° oscillation around rest pose (localT 0→1)
 *   • Mouse tilt: ±10° horizontal, ±7° vertical (only when active)
 *   • Idle float: ±0.06 units vertical sine
 *
 * Materials:
 *   • Cloned per-instance (no shared-state mutations)
 *   • envMapIntensity bumped to 1.0 on fully-metallic materials to prevent black
 *
 * Debug controls (leva, visible only with ?debug=1 via App.tsx <Leva hidden>):
 *   • Per-track scale / position / rotation sliders
 *   • "Copy modelTransform" button → console.log JSON to paste into tracks.ts
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useControls, button } from 'leva'
import * as THREE from 'three'

import { type Track } from '../data/tracks'
import MODELS_MANIFEST from '../data/models.json'

// ── Decoder path (set once at module load) ───────────────────────────────────
useGLTF.setDecoderPath('/draco/')

// ── Model manifest ───────────────────────────────────────────────────────────
const available: string[] = (MODELS_MANIFEST as { available: string[] }).available ?? []

// Preload all available models
for (const id of available) {
  useGLTF.preload(`/models/${id}.glb`)
}

// ── Constants ────────────────────────────────────────────────────────────────
const TARGET_HEIGHT  = 2.4          // scene units for auto-fit
const DEFAULT_ROT_Y  = Math.PI / 8  // 22.5° — default 3/4 turn
const SCROLL_ROT_AMP = Math.PI / 7.2  // ±25° oscillation around rest

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Center and scale a scene group so its longest axis = TARGET_HEIGHT */
function fitScene(scene: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  scene.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) scene.scale.setScalar(TARGET_HEIGHT / maxDim)
}

/** Fix pure-metallic materials that render black without an env map */
function patchMaterials(scene: THREE.Group): void {
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return

    const fixMat = (mat: THREE.Material) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return
      // Ensure env map intensity on high-metalness materials
      if (mat.metalness > 0.7) mat.envMapIntensity = Math.max(mat.envMapIntensity, 1.0)
      // Prevent fully transparent surfaces from disappearing
      if (mat.opacity < 0.05) mat.opacity = 0.05
      mat.needsUpdate = true
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(fixMat)
    } else if (mesh.material) {
      fixMat(mesh.material)
    }
  })
}

/** Build a radial-gradient canvas texture in the track's accent color */
function makeGlowTexture(accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0,   accentColor + '55')
  gradient.addColorStop(0.5, accentColor + '22')
  gradient.addColorStop(1,   accentColor + '00')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLB Stage (primary tier)
// ═══════════════════════════════════════════════════════════════════════════════

interface StageProps { track: Track; localT: number; active: boolean }

function GLBStage({ track, localT, active }: StageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const liveRef  = useRef({ scale: 1, pos: [0, 0, 0] as [number,number,number], rot: [0, DEFAULT_ROT_Y, 0] as [number,number,number] })

  // ── Load + process GLB ──────────────────────────────────────────────────
  const { scene: rawScene } = useGLTF(`/models/${track.id}.glb`)

  const scene = useMemo(() => {
    const cloned = rawScene.clone(true)
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone())
      } else if (mesh.material) {
        mesh.material = mesh.material.clone()
      }
    })
    fitScene(cloned)
    patchMaterials(cloned)
    return cloned
  }, [rawScene])

  // ── Glow disk ──────────────────────────────────────────────────────────
  const glowTexture = useMemo(() => makeGlowTexture(track.accentColor), [track.accentColor])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  // ── Read modelTransform overrides ───────────────────────────────────────
  const baseScale = track.modelTransform?.scale    ?? 1
  const basePos   = track.modelTransform?.position ?? [0, 0, 0] as [number,number,number]
  const baseRot   = track.modelTransform?.rotation ?? [0, DEFAULT_ROT_Y, 0] as [number,number,number]

  // ── Leva controls (panel hidden by App.tsx unless ?debug=1) ────────────
  const controls = useControls(
    `🎭 ${track.id}`,
    {
      scale: { value: baseScale, min: 0.05, max: 15,       step: 0.01, label: 'scale' },
      posX:  { value: basePos[0], min: -6,  max: 6,        step: 0.01, label: 'pos X' },
      posY:  { value: basePos[1], min: -6,  max: 6,        step: 0.01, label: 'pos Y' },
      posZ:  { value: basePos[2], min: -6,  max: 6,        step: 0.01, label: 'pos Z' },
      rotX:  { value: baseRot[0], min: -Math.PI, max: Math.PI, step: 0.01, label: 'rot X' },
      rotY:  { value: baseRot[1], min: -Math.PI, max: Math.PI, step: 0.01, label: 'rot Y' },
      rotZ:  { value: baseRot[2], min: -Math.PI, max: Math.PI, step: 0.01, label: 'rot Z' },
      'Copy modelTransform 📋': button(() => {
        const { scale, pos, rot } = liveRef.current
        const output = JSON.stringify({ scale, position: pos, rotation: rot }, null, 2)
        console.log(`\n// ── Paste into tracks.ts for "${track.id}" ──\nmodelTransform: ${output}`)
      }),
    },
    { collapsed: true },
  )

  // Sync live values to ref so button closure is never stale
  liveRef.current = {
    scale: controls.scale,
    pos:   [controls.posX, controls.posY, controls.posZ],
    rot:   [controls.rotX, controls.rotY, controls.rotZ],
  }

  // ── Per-frame animation ─────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const g = groupRef.current

    // Scale from leva/modelTransform
    g.scale.setScalar(controls.scale)

    // Scroll-driven rotation: ±25° around rest rotY
    const scrollRotY = controls.rotY + (localT - 0.5) * SCROLL_ROT_AMP * 2
    // Mouse tilt (only when active to avoid fighting camera)
    const tiltX = active ? -state.pointer.y * 0.12 : 0
    const tiltY = active ?  state.pointer.x * 0.18 : 0

    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, controls.rotX + tiltX, Math.min(1, delta * 4))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, scrollRotY    + tiltY, Math.min(1, delta * 3))
    g.rotation.z = controls.rotZ

    // Float
    g.position.set(
      controls.posX,
      controls.posY + Math.sin(state.clock.elapsedTime * 0.9) * 0.06,
      controls.posZ,
    )
  })

  return (
    <group ref={groupRef}>
      {/* Glow disk — behind model */}
      <mesh position={[0, 0, -0.6]} renderOrder={-1}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Key light — warm white, upper-left front */}
      <pointLight position={[-2.5, 3, 2.5]} color="#fff8ee" intensity={4} distance={10} />
      {/* Fill light — cool white, right side, 1/3 key */}
      <pointLight position={[3, 0.5, 2]}   color="#eef4ff" intensity={1.5} distance={8} />
      {/* Rim light — accent color, behind-left, hot */}
      <pointLight
        position={[-2.5, 2, -2]}
        color={track.accentColor}
        intensity={6}
        distance={8}
      />
      {/* Under-fill to prevent total darkness on bottom */}
      <pointLight position={[0, -3, 1]} color="#ffffff" intensity={0.6} distance={6} />

      <primitive object={scene} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Image Plane Stage (second tier — depth-layered transparent PNG)
// ═══════════════════════════════════════════════════════════════════════════════

function ImagePlane({ track, localT, active }: StageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const texture  = useMemo(() => {
    if (!track.imagePath) return null
    const t = new THREE.TextureLoader().load(track.imagePath)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [track.imagePath])

  const glowTexture = useMemo(() => makeGlowTexture(track.accentColor), [track.accentColor])
  useEffect(() => () => { glowTexture.dispose() }, [glowTexture])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const g = groupRef.current
    const tiltX = active ? -state.pointer.y * 0.1 : 0
    const tiltY = active ?  state.pointer.x * 0.15 : 0
    const scrollRotY = DEFAULT_ROT_Y + (localT - 0.5) * SCROLL_ROT_AMP * 2
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX, Math.min(1, delta * 4))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, scrollRotY + tiltY, Math.min(1, delta * 3))
    g.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.06
  })

  if (!texture) return null

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.7]} renderOrder={-1}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight position={[-2, 2, -1]} color={track.accentColor} intensity={4} distance={6} />
      {[0, 0.1, 0.2].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <planeGeometry args={[TARGET_HEIGHT, TARGET_HEIGHT]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={1 - i * 0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API — picks the right tier automatically
// ═══════════════════════════════════════════════════════════════════════════════

export interface CharacterStageProps { track: Track; localT: number; active: boolean }

export function CharacterStage({ track, localT, active }: CharacterStageProps) {
  const hasGLB   = available.includes(track.id)
  const hasImage = Boolean(track.imagePath)
  if (hasGLB)   return <GLBStage   track={track} localT={localT} active={active} />
  if (hasImage) return <ImagePlane track={track} localT={localT} active={active} />
  return null
}
