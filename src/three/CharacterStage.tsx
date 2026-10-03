/**
 * src/three/CharacterStage.tsx  (Phase 3c — scroll-phase rotation & placement)
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart character display with 3-tier priority:
 *   1. GLB model  — Draco-compressed, auto-fit, per-track transform overrides
 *   2. Image plane — transparent PNG depth-layers with parallax
 *   3. null        — lets existing procedural world render
 *
 * Scroll-phase animation (localT = chapter progress 0→1):
 *   p 0.00–0.35 : model swings in from ~-80° (side view) → 0° (front)
 *                 scale ramps  0.7 → 1.0
 *   p 0.35–0.65 : HOLD exactly facing camera (yaw = yawOffset), scale 1.0
 *   p 0.65–1.00 : model swings out toward +80° (other side)
 *                 scale ramps  1.0 → 0.7
 *   All transitions use power2.inOut easing (smoothstep approximation).
 *
 * Placement:
 *   The group X offset puts the model in the EMPTY half of the screen
 *   (alternating per track index so it mirrors the HTML text-column layout).
 *
 * Lighting rig per model:
 *   • Key light   — warm white from upper-left front
 *   • Fill light  — cool white from right, 1/3 key intensity
 *   • Rim light   — track.accentColor from behind-left, hot
 *   • Under-fill  — prevents pitch-black undersides
 *   • Glow disk   — canvas-texture radial gradient plane behind model
 *
 * Materials:
 *   • Cloned per-instance (no shared-state mutations)
 *   • Metalness clamped to ≤ 0.35, envMapIntensity bumped to 1.4
 *
 * Debug controls (leva, visible only with ?debug=1 via App.tsx <Leva hidden>):
 *   • Per-track scale / position / yawOffset sliders
 *   • "Copy modelTransform" button → console.log JSON to paste into tracks.ts
 *   • GLB filename chip button (opens console log)
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
const TARGET_HEIGHT  = 3.8                          // ~75% viewport height auto-fit
const ENTER_YAW      = -80 * (Math.PI / 180)        // start angle (side view, radians)
const EXIT_YAW       =  80 * (Math.PI / 180)        // exit angle (radians)
// scene-unit offset to place model centred in the empty 55% half.
// at fov=60, z~5 from camera, 1 unit ~= ~10% viewport width => 2.4 units ~= ~24%
const HALF_OFFSET    = 2.4

// ── Easing + phase helpers ───────────────────────────────────────────────────

/** power2.inOut (smoothstep) */
function easeInOut(t: number): number {
  return t * t * (3 - 2 * t)
}

/** 3-phase target yaw angle for localT in [0,1] */
function phaseYaw(t: number, yawOffset: number): number {
  if (t < 0.35)  return yawOffset + ENTER_YAW * (1 - easeInOut(t / 0.35))
  if (t <= 0.65) return yawOffset
  return yawOffset + EXIT_YAW * easeInOut((t - 0.65) / 0.35)
}

/** 3-phase scale factor for localT in [0,1] */
function phaseScale(t: number, base: number): number {
  const MIN_S = 0.7
  let s: number
  if (t < 0.35)       s = MIN_S + (1 - MIN_S) * easeInOut(t / 0.35)
  else if (t <= 0.65) s = 1.0
  else                s = 1.0 - (1 - MIN_S) * easeInOut((t - 0.65) / 0.35)
  return s * base
}


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
      // Three.js PBR: metalness=1 has 0 diffuse reflection. When roughness is high
      // or envMap is dark, models render pure pitch-black. Clamping metalness to
      // <= 0.4 allows direct lights (key/fill/rim) to illuminate the diffuse textures!
      if (mat.metalness > 0.5) {
        mat.metalness = Math.min(mat.metalness, 0.35)
      }
      mat.roughness = Math.min(mat.roughness, 0.7)
      mat.envMapIntensity = 1.4
      // Prevent fully transparent surfaces from disappearing
      if (mat.opacity < 0.1 && mat.transparent) mat.opacity = 0.85
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

interface StageProps {
  track: Track
  trackIndex: number
  localT: number
  active: boolean
}

function GLBStage({ track, trackIndex, localT, active }: StageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const liveRef  = useRef({
    scale: 1,
    yawOffset: 0,
    pos: [0, 0, 0] as [number, number, number],
  })

  // Load + process GLB
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

  // Glow disk
  const glowTexture = useMemo(() => makeGlowTexture(track.accentColor), [track.accentColor])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  // Read modelTransform overrides
  const baseScale     = track.modelTransform?.scale     ?? 1
  const basePos       = track.modelTransform?.position  ?? [0, 0, 0] as [number, number, number]
  const baseYawOffset = track.modelTransform?.yawOffset ?? 0

  // X-offset sign: even tracks have text LEFT, model RIGHT (+x); odd opposite
  const halfSign = trackIndex % 2 === 0 ? 1 : -1

  // Leva controls (panel hidden by App.tsx unless ?debug=1)
  const controls = useControls(
    `Track ${track.id}`,
    {
      scale:     { value: baseScale,     min: 0.05, max: 15,          step: 0.01 },
      yawOffset: { value: baseYawOffset, min: -Math.PI, max: Math.PI, step: 0.01 },
      posX:      { value: basePos[0],    min: -6,   max: 6,           step: 0.01 },
      posY:      { value: basePos[1],    min: -6,   max: 6,           step: 0.01 },
      posZ:      { value: basePos[2],    min: -6,   max: 6,           step: 0.01 },
      LogGLB: button(() => {
        console.log(`[CharacterStage] GLB file: /models/${track.id}.glb`)
      }),
      CopyTransform: button(() => {
        const { scale, yawOffset: yo, pos } = liveRef.current
        const out = JSON.stringify({ scale, yawOffset: yo, position: pos }, null, 2)
        console.log(`\n// Paste into tracks.ts for "${track.id}"\nmodelTransform: ${out}`)
      }),
    },
    { collapsed: true },
  )

  // Sync live values so button closures never go stale
  liveRef.current = {
    scale:     controls.scale,
    yawOffset: controls.yawOffset,
    pos:       [controls.posX, controls.posY, controls.posZ],
  }

  // Per-frame animation
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const g = groupRef.current

    // Scale: 3-phase
    const tgtScale = phaseScale(localT, controls.scale)
    const sNow     = THREE.MathUtils.lerp(g.scale.x, tgtScale, Math.min(1, delta * 5))
    g.scale.setScalar(sNow)

    // Yaw: 3-phase
    const tgtYaw = phaseYaw(localT, controls.yawOffset)
    const tiltX  = active ? -state.pointer.y * 0.10 : 0
    const tiltY  = active ?  state.pointer.x * 0.15 : 0
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX,          Math.min(1, delta * 4))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, tgtYaw + tiltY, Math.min(1, delta * 4))
    g.rotation.z = 0

    // Position: empty-half offset + idle float
    const tgtX = controls.posX + halfSign * HALF_OFFSET
    g.position.set(
      THREE.MathUtils.lerp(g.position.x, tgtX, Math.min(1, delta * 3)),
      controls.posY + Math.sin(state.clock.elapsedTime * 0.9) * 0.06,
      controls.posZ,
    )
  })

  return (
    <group ref={groupRef}>
      {/* Glow disk */}
      <mesh position={[0, 0, -0.6]} renderOrder={-1}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Key light */}
      <pointLight position={[-2.5, 3, 2.5]}  color="#fff8ee" intensity={4}   distance={12} />
      {/* Fill light */}
      <pointLight position={[3, 0.5, 2]}     color="#eef4ff" intensity={1.5} distance={10} />
      {/* Rim light */}
      <pointLight position={[-2.5, 2, -2]}   color={track.accentColor} intensity={7} distance={10} />
      {/* Under-fill */}
      <pointLight position={[0, -3, 1]}      color="#ffffff" intensity={0.7} distance={8}  />

      <primitive object={scene} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Image Plane Stage (second tier — depth-layered transparent PNG)
// ═══════════════════════════════════════════════════════════════════════════════

function ImagePlane({ track, trackIndex, localT, active }: StageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const texture  = useMemo(() => {
    if (!track.imagePath) return null
    const t = new THREE.TextureLoader().load(track.imagePath)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [track.imagePath])

  const glowTexture = useMemo(() => makeGlowTexture(track.accentColor), [track.accentColor])
  useEffect(() => () => { glowTexture.dispose() }, [glowTexture])

  const halfSign = trackIndex % 2 === 0 ? 1 : -1

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const g       = groupRef.current
    const tiltX   = active ? -state.pointer.y * 0.1  : 0
    const tiltY   = active ?  state.pointer.x * 0.15 : 0
    const tgtYaw  = phaseYaw(localT, track.modelTransform?.yawOffset ?? 0)
    g.rotation.x  = THREE.MathUtils.lerp(g.rotation.x, tiltX,         Math.min(1, delta * 4))
    g.rotation.y  = THREE.MathUtils.lerp(g.rotation.y, tgtYaw + tiltY, Math.min(1, delta * 3))
    g.position.x  = THREE.MathUtils.lerp(g.position.x, halfSign * HALF_OFFSET, Math.min(1, delta * 3))
    g.position.y  = Math.sin(state.clock.elapsedTime * 0.9) * 0.06
    const tgtScale = phaseScale(localT, track.modelTransform?.scale ?? 1)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, tgtScale, Math.min(1, delta * 5)))
  })

  if (!texture) return null

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.7]} renderOrder={-1}>
        <planeGeometry args={[6, 6]} />
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

export interface CharacterStageProps {
  track: Track
  trackIndex: number
  localT: number
  active: boolean
}

export function CharacterStage({ track, trackIndex, localT, active }: CharacterStageProps) {
  const hasGLB   = available.includes(track.id)
  const hasImage = Boolean(track.imagePath)

  // Warn in dev if a model was expected but is missing
  useEffect(() => {
    if (!hasGLB && !hasImage) {
      console.warn(
        `[CharacterStage] No GLB or image for track "${track.id}". ` +
        `Drop /public/models/${track.id}.glb and run npm run optimize:models.`
      )
    }
  }, [track.id, hasGLB, hasImage])

  if (hasGLB)   return <GLBStage   track={track} trackIndex={trackIndex} localT={localT} active={active} />
  if (hasImage) return <ImagePlane track={track} trackIndex={trackIndex} localT={localT} active={active} />
  return null
}
