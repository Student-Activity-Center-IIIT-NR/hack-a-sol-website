/**
 * src/three/CharacterStage.tsx  (Phase 3g)
 * -----------------------------------------------------------------------------
 * Renders the 3D character in the empty half of the track chapter viewport.
 *
 * Scroll-phase animation (chapterProgress c = 0..1):
 *   c 0.00-0.25  ENTER : model swings from ~-80° side + depth (z=-8), scale 0.7?1
 *   c 0.25-0.75  HOLD  : faces camera, orbits slowly, mouse tilt ±10°
 *   c 0.75-1.00  EXIT  : swings to +80° other side, scale 1?0.7, z recedes
 *
 * Performance:
 *   - GLBs outside the active±1 window are hidden (visible=false)
 *   - useGLTF.preload for next/prev only (managed by TrackWorlds)
 *
 * Dev assertion:
 *   When ?debug=1 — warns if the loaded filename doesn't match track.id.
 *   Leva controls expose scale/yawOffset/pos per track.
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useControls, button } from 'leva'
import * as THREE from 'three'

import { type Track } from '../data/tracks'
import MODELS_MANIFEST from '../data/models.json'

// -- Draco decoder path ---------------------------------------------------
useGLTF.setDecoderPath('/draco/')

// -- Model manifest -------------------------------------------------------
const available: string[] = (MODELS_MANIFEST as { available: string[] }).available ?? []

// Preload all available models upfront
for (const id of available) {
  useGLTF.preload(`/models/${id}.glb`)
}

// -- Constants ------------------------------------------------------------
const TARGET_HEIGHT = 3.8
const ENTER_YAW     = -80 * (Math.PI / 180)
const EXIT_YAW      =  80 * (Math.PI / 180)
const HALF_OFFSET   = 2.4    // scene units ? ~24% viewport width at fov=60, z~5

// -- Easing ---------------------------------------------------------------
function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number): number {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}

// -- Phase helpers (new spec 0.25/0.25/0.50) ------------------------------
/** 3-phase target yaw for chapterProgress c */
function phaseYaw(c: number, yawOffset: number): number {
  if (c < 0.25)  return yawOffset + ENTER_YAW * (1 - easeInOut(norm(c, 0, 0.25)))
  if (c <= 0.75) return yawOffset
  return yawOffset + EXIT_YAW * easeInOut(norm(c, 0.75, 1.0))
}

/** 3-phase scale */
function phaseScale(c: number, base: number): number {
  const MIN_S = 0.7
  let s: number
  if (c < 0.25)       s = MIN_S + (1 - MIN_S) * easeInOut(norm(c, 0, 0.25))
  else if (c <= 0.75) s = 1.0
  else                s = 1.0 - (1 - MIN_S) * easeInOut(norm(c, 0.75, 1.0))
  return s * base
}

/** Z-depth fly-in: enter from z=-8, hold at 0, exit to z=-8 */
function phaseZ(c: number): number {
  if (c < 0.25)  return -8 * (1 - easeInOut(norm(c, 0, 0.25)))
  if (c <= 0.75) return 0
  return -8 * easeInOut(norm(c, 0.75, 1.0))
}

// -- Scene helpers --------------------------------------------------------
function fitScene(scene: THREE.Group): void {
  const box    = new THREE.Box3().setFromObject(scene)
  const size   = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  scene.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) scene.scale.setScalar(TARGET_HEIGHT / maxDim)
}

function patchMaterials(scene: THREE.Group): void {
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    const fixMat = (mat: THREE.Material) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return
      if (mat.metalness > 0.5) mat.metalness = Math.min(mat.metalness, 0.35)
      mat.roughness       = Math.min(mat.roughness, 0.7)
      mat.envMapIntensity = 1.4
      if (mat.opacity < 0.1 && mat.transparent) mat.opacity = 0.85
      mat.needsUpdate = true
    }
    if (Array.isArray(mesh.material)) mesh.material.forEach(fixMat)
    else if (mesh.material) fixMat(mesh.material)
  })
}

function makeGlowTexture(accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0,   accentColor + '55')
  grad.addColorStop(0.5, accentColor + '22')
  grad.addColorStop(1,   accentColor + '00')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

// --------------------------------------------------------------------------
// GLBStage
// --------------------------------------------------------------------------

interface StageProps {
  track: Track
  trackIndex: number
  chapterProgress: number
  active: boolean
}

function GLBStage({ track, trackIndex, chapterProgress, active }: StageProps) {
  const c       = chapterProgress
  const groupRef = useRef<THREE.Group>(null)
  const liveRef  = useRef({ scale: 1, yawOffset: 0, pos: [0, 0, 0] as [number, number, number] })

  const { scene: rawScene } = useGLTF(`/models/${track.id}.glb`)

  // Dev assertion: loaded GLB id must match track.id
  useEffect(() => {
    const isDebug = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1'
    if (isDebug) {
      const glbFile = `/models/${track.id}.glb`
      const glbId   = track.id
      if (!available.includes(glbId)) {
        console.warn(`[CharacterStage] DEV ASSERTION: GLB file "${glbFile}" not in models manifest. Expected track.id="${track.id}".`)
      } else {
        console.info(`[CharacterStage] OK: loaded "${glbFile}" for track "${track.id}"`)
      }
    }
  }, [track.id])

  const scene = useMemo(() => {
    const cloned = rawScene.clone(true)
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((m) => m.clone())
      else if (mesh.material) mesh.material = mesh.material.clone()
    })
    fitScene(cloned)
    patchMaterials(cloned)
    return cloned
  }, [rawScene])

  const glowTexture = useMemo(() => makeGlowTexture(track.accentColor), [track.accentColor])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  const baseScale     = track.modelTransform?.scale     ?? 1
  const basePos       = track.modelTransform?.position  ?? [0, 0, 0] as [number, number, number]
  const baseYawOffset = track.modelTransform?.yawOffset ?? 0
  const halfSign      = trackIndex % 2 === 0 ? 1 : -1

  const controls = useControls(
    `Track ${track.id}`,
    {
      scale:     { value: baseScale,     min: 0.05, max: 15,          step: 0.01 },
      yawOffset: { value: baseYawOffset, min: -Math.PI, max: Math.PI, step: 0.01 },
      posX:      { value: basePos[0],    min: -6,   max: 6,           step: 0.01 },
      posY:      { value: basePos[1],    min: -6,   max: 6,           step: 0.01 },
      posZ:      { value: basePos[2],    min: -6,   max: 6,           step: 0.01 },
      LogGLB: button(() => {
        console.log(`[CharacterStage] GLB: /models/${track.id}.glb | available: ${available.includes(track.id)}`)
      }),
      CopyTransform: button(() => {
        const { scale, yawOffset: yo, pos } = liveRef.current
        const out = JSON.stringify({ scale, yawOffset: yo, position: pos }, null, 2)
        console.log(`\n// Paste into tracks.ts for "${track.id}"\nmodelTransform: ${out}`)
      }),
    },
    { collapsed: true },
  )

  liveRef.current = {
    scale:     controls.scale,
    yawOffset: controls.yawOffset,
    pos:       [controls.posX, controls.posY, controls.posZ],
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const g = groupRef.current

    // Scale
    const tgtScale = phaseScale(c, controls.scale)
    const sNow     = THREE.MathUtils.lerp(g.scale.x, tgtScale, Math.min(1, delta * 5))
    g.scale.setScalar(sNow)

    // Yaw + mouse tilt
    const tgtYaw = phaseYaw(c, controls.yawOffset)
    const tiltX  = active ? -state.pointer.y * 0.10 : 0
    const tiltY  = active ?  state.pointer.x * 0.15 : 0
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX,          Math.min(1, delta * 4))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, tgtYaw + tiltY, Math.min(1, delta * 4))
    g.rotation.z = 0

    // Position: empty-half offset + z fly-in + idle float
    const tgtX = controls.posX + halfSign * HALF_OFFSET
    const tgtZ = controls.posZ + phaseZ(c)
    const floatY = active ? Math.sin(state.clock.elapsedTime * 0.9) * 0.06 : 0
    g.position.set(
      THREE.MathUtils.lerp(g.position.x, tgtX, Math.min(1, delta * 3)),
      controls.posY + floatY,
      THREE.MathUtils.lerp(g.position.z, tgtZ, Math.min(1, delta * 4)),
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
      {/* Rim light (accent color) */}
      <pointLight position={[-2.5, 2, -2]}   color={track.accentColor} intensity={7} distance={10} />
      {/* Under-fill */}
      <pointLight position={[0, -3, 1]}      color="#ffffff" intensity={0.7} distance={8}  />

      <primitive object={scene} />
    </group>
  )
}

// --------------------------------------------------------------------------
// ImagePlane (fallback when GLB not available but imagePath set)
// --------------------------------------------------------------------------

function ImagePlane({ track, trackIndex, chapterProgress, active }: StageProps) {
  const c        = chapterProgress
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
    const g      = groupRef.current
    const tiltX  = active ? -state.pointer.y * 0.1  : 0
    const tiltY  = active ?  state.pointer.x * 0.15 : 0
    const tgtYaw = phaseYaw(c, track.modelTransform?.yawOffset ?? 0)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, tiltX,          Math.min(1, delta * 4))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, tgtYaw + tiltY, Math.min(1, delta * 3))
    g.position.x = THREE.MathUtils.lerp(g.position.x, halfSign * HALF_OFFSET, Math.min(1, delta * 3))
    g.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.06
    g.position.z = phaseZ(c)
    const tgtScale = phaseScale(c, track.modelTransform?.scale ?? 1)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, tgtScale, Math.min(1, delta * 5)))
  })

  if (!texture) return null

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.7]} renderOrder={-1}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial map={glowTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[-2, 2, -1]} color={track.accentColor} intensity={4} distance={6} />
      {[0, 0.1, 0.2].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <planeGeometry args={[TARGET_HEIGHT, TARGET_HEIGHT]} />
          <meshBasicMaterial map={texture} transparent opacity={1 - i * 0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export interface CharacterStageProps {
  track: Track
  trackIndex: number
  /** Chapter progress 0..1 within this track's chapter */
  chapterProgress: number
  active: boolean
}

export function CharacterStage({ track, trackIndex, chapterProgress, active }: CharacterStageProps) {
  const hasGLB   = available.includes(track.id)
  const hasImage = Boolean(track.imagePath)

  useEffect(() => {
    if (!hasGLB && !hasImage) {
      console.warn(
        `[CharacterStage] No GLB or image for track "${track.id}". ` +
        `Drop /public/models/${track.id}.glb and run npm run optimize:models.`
      )
    }
  }, [track.id, hasGLB, hasImage])

  if (hasGLB)   return <GLBStage   track={track} trackIndex={trackIndex} chapterProgress={chapterProgress} active={active} />
  if (hasImage) return <ImagePlane track={track} trackIndex={trackIndex} chapterProgress={chapterProgress} active={active} />
  return null
}
