/**
 * src/three/TrackWorlds.tsx  (Phase 3g)
 * -----------------------------------------------------------------------------
 * Places all 5 track world objects at fixed 3D positions.
 *
 * Performance: only the active track ±1 neighbour is rendered (visible).
 * Others are hidden (group.visible = false) to keep the renderer lean.
 * useGLTF.preload is called for next and prev track ahead of time.
 *
 * chapterProgress is now the canonical progress value per chapter (0..1),
 * derived from sectionProgress in App.tsx / useTrackSection.
 */

import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { TRACKS } from '../data/tracks'
import { TRACK_WORLD_POSITIONS } from '../hooks/useScrollCamera'
import { chapterLocalT } from '../hooks/useTrackSection'
import { CharacterStage } from './CharacterStage'
import { IronManWorld }       from './worlds/IronManWorld'
import { CapWorld }           from './worlds/CapWorld'
import { BlackPantherWorld }  from './worlds/BlackPantherWorld'
import { UltronWorld }        from './worlds/UltronWorld'
import { StrangeWorld }       from './worlds/StrangeWorld'

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
  /** Section-level progress 0..1 across all N chapters */
  sectionProgress: number
}

export function TrackWorlds({ activeTrackIndex, sectionProgress }: TrackWorldsProps) {
  const N = TRACKS.length

  // Preload next and previous GLBs only
  const prevId = TRACKS[Math.max(0, activeTrackIndex - 1)]?.id
  const nextId = TRACKS[Math.min(N - 1, activeTrackIndex + 1)]?.id
  if (prevId && AVAILABLE_MODELS.includes(prevId)) useGLTF.preload(`/models/${prevId}.glb`)
  if (nextId && AVAILABLE_MODELS.includes(nextId)) useGLTF.preload(`/models/${nextId}.glb`)

  return (
    <>
      {TRACKS.map((track, i) => {
        const [x, y, z] = TRACK_WORLD_POSITIONS[i]
        // chapterProgress for THIS chapter derived from section progress
        const cp         = chapterLocalT(sectionProgress, i)
        const active     = i === activeTrackIndex
        const hasGLB     = AVAILABLE_MODELS.includes(track.id)
        const ProceduralWorld = PROCEDURAL_WORLDS[i]

        // Only render this world if it is within activeIndex ± 1
        const inWindow = Math.abs(i - activeTrackIndex) <= 1

        return (
          <group key={track.id} position={[x, y, z]} visible={inWindow}>
            {inWindow && (
              <>
                {/* Character stage: GLB or image-plane (highest priority) */}
                <Suspense fallback={null}>
                  <CharacterStage
                    track={track}
                    trackIndex={i}
                    chapterProgress={cp}
                    active={active}
                  />
                </Suspense>

                {/* Procedural fallback — only when no GLB is available */}
                {!hasGLB && (
                  <ProceduralWorld localT={cp} active={active} />
                )}
              </>
            )}
          </group>
        )
      })}
    </>
  )
}
