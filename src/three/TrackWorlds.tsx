/**
 * src/three/TrackWorlds.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Places all 5 track world objects at their fixed positions in the 3D scene.
 * The camera travels between them (see useScrollCamera.ts).
 *
 * Rendering priority per track position:
 *   1. CharacterStage renders the optimised GLB if /public/models/<id>.glb exists.
 *   2. CharacterStage renders the image plane if track.imagePath is set.
 *   3. Procedural world (IronManWorld, CapWorld…) is the final fallback.
 *
 * When a GLB is loaded, the procedural world is HIDDEN (opacity 0) so both
 * don't fight visually. This is controlled by hiding the procedural group
 * when CharacterStage reports it is rendering.
 *
 * Each world receives:
 *   localT : 0→1 progress within its own scroll window (for assembly animation)
 *   active : true when the camera is closest to it
 */

import { Suspense } from 'react'
import { TRACKS } from '../data/tracks'
import { TRACK_WORLD_POSITIONS, getTrackLocalT } from '../hooks/useScrollCamera'
import { CharacterStage } from './CharacterStage'
import { IronManWorld }       from './worlds/IronManWorld'
import { CapWorld }           from './worlds/CapWorld'
import { BlackPantherWorld }  from './worlds/BlackPantherWorld'
import { UltronWorld }        from './worlds/UltronWorld'
import { StrangeWorld }       from './worlds/StrangeWorld'

// Map track index to its procedural world component
const PROCEDURAL_WORLDS = [
  IronManWorld,
  CapWorld,
  BlackPantherWorld,
  UltronWorld,
  StrangeWorld,
]

import MODELS_MANIFEST from '../data/models.json'
const AVAILABLE_MODELS: string[] = (MODELS_MANIFEST as { available: string[] }).available ?? []

interface TrackWorldsProps {
  activeTrackIndex: number
  scrollProgress: number
}

export function TrackWorlds({ activeTrackIndex, scrollProgress }: TrackWorldsProps) {
  return (
    <>
      {TRACKS.map((track, i) => {
        const [x, y, z] = TRACK_WORLD_POSITIONS[i]
        const localT = getTrackLocalT(scrollProgress, i)
        const active = i === activeTrackIndex
        const hasGLB = AVAILABLE_MODELS.includes(track.id)
        const ProceduralWorld = PROCEDURAL_WORLDS[i]

        return (
          <group key={track.id} position={[x, y, z]}>
            {/* Character stage: GLB or image-plane (highest priority) */}
            <Suspense fallback={null}>
              <CharacterStage track={track} localT={localT} active={active} />
            </Suspense>

            {/* Procedural fallback — hidden when a real GLB is loaded */}
            {!hasGLB && (
              <ProceduralWorld localT={localT} active={active} />
            )}
          </group>
        )
      })}
    </>
  )
}
