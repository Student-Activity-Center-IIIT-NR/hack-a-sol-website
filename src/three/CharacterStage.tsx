/**
 * src/three/CharacterStage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart character display for each track chapter. Chooses the best available
 * visual in priority order:
 *
 *   1. GLB model (from /public/models/<track.id>.glb) — if in models manifest
 *   2. Image plane (track.imagePath) — transparent PNG with depth layers + tilt
 *   3. Procedural placeholder — existing world-specific R3F primitives
 *
 * Features (all visual tiers):
 *   • Rim light in track.accentColor
 *   • Idle float animation
 *   • Mouse-parallax tilt (from R3F state.pointer)
 *   • Scroll-linked rotation within the chapter (localT 0→1)
 *   • Safe material cloning (no shared-material mutations)
 *
 * GLB-specific:
 *   • Loaded via useGLTF with Draco compression at /draco/
 *   • Auto-centered + auto-scaled to 2.2 units height
 *   • Wrapped in <Suspense> at the call site (TrackWorlds handles this)
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { type Track } from '../data/tracks'
import MODELS_MANIFEST from '../data/models.json'

// Configure Draco decoder path globally once
useGLTF.setDecoderPath('/draco/')

// ── Preload models that are in the manifest ──────────────────────────────────
const available: string[] = (MODELS_MANIFEST as { available: string[] }).available ?? []
for (const id of available) {
  useGLTF.preload(`/models/${id}.glb`)
}

// ── Target height for auto-scale ─────────────────────────────────────────────
const TARGET_HEIGHT = 2.2

// ── Helper: auto-center + auto-scale a scene group ───────────────────────────
function fitScene(scene: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  // Center
  scene.position.sub(center)

  // Scale to target height
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) {
    const scale = TARGET_HEIGHT / maxDim
    scene.scale.setScalar(scale)
  }
}

// ── Shared frame animation mixin ──────────────────────────────────────────────
function useCharacterFrame(
  groupRef: React.RefObject<THREE.Group | null>,
  active: boolean,
  localT: number,
) {
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Mouse-parallax tilt (only when this track is active)
    const targetRotY = active ? state.pointer.x * 0.4 : 0
    const targetRotX = active ? -state.pointer.y * 0.25 : 0
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, targetRotY, delta * 3,
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, targetRotX, delta * 3,
    )

    // Idle float
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08

    // Scroll-linked rotation in chapter (localT 0→1 → full 360° / 2π)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z, localT * Math.PI * 0.1, delta * 2,
    )
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLB Model Stage
// ═══════════════════════════════════════════════════════════════════════════════
interface GLBStageProps {
  track: Track
  localT: number
  active: boolean
}

function GLBStage({ track, localT, active }: GLBStageProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene: rawScene } = useGLTF(`/models/${track.id}.glb`)

  // Clone the scene so we don't mutate the shared cached object
  const scene = useMemo(() => {
    const cloned = rawScene.clone(true)
    // Clone materials to avoid cross-instance mutation
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => m.clone())
        } else if (mesh.material) {
          mesh.material = mesh.material.clone()
        }
      }
    })
    fitScene(cloned)
    return cloned
  }, [rawScene])

  useCharacterFrame(groupRef, active, localT)

  return (
    <group ref={groupRef}>
      {/* Rim light in track accent colour */}
      <pointLight
        position={[-2, 2, -1]}
        color={track.accentColor}
        intensity={2.5}
        distance={8}
      />
      <primitive object={scene} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Image Plane Stage (3-layer parallax PNG)
// ═══════════════════════════════════════════════════════════════════════════════
interface ImagePlaneProps {
  track: Track
  localT: number
  active: boolean
}

function ImagePlane({ track, localT, active }: ImagePlaneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const texture = useMemo(() => {
    if (!track.imagePath) return null
    const t = new THREE.TextureLoader().load(track.imagePath)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [track.imagePath])

  useCharacterFrame(groupRef, active, localT)

  if (!texture) return null

  return (
    <group ref={groupRef}>
      <pointLight
        position={[-2, 2, -1]}
        color={track.accentColor}
        intensity={1.5}
        distance={6}
      />
      {/* 3 depth-layered planes for parallax feel */}
      {[0, 0.15, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={1 - i * 0.25}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public CharacterStage — picks the right tier automatically
// ═══════════════════════════════════════════════════════════════════════════════
export interface CharacterStageProps {
  track: Track
  localT: number
  active: boolean
}

export function CharacterStage({ track, localT, active }: CharacterStageProps) {
  const hasGLB   = available.includes(track.id)
  const hasImage = Boolean(track.imagePath)

  if (hasGLB)   return <GLBStage   track={track} localT={localT} active={active} />
  if (hasImage) return <ImagePlane track={track} localT={localT} active={active} />

  // No GLB, no image — return null and let the existing procedural world render
  return null
}
