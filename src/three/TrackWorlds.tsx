/**
 * src/three/TrackWorlds.tsx  (Phase 3h — Marvel scroll environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * Places all 5 track world environments + character stages in 3D space.
 *
 * Phase 3h changes:
 *   - Environments now accept chapterProgress (0..1) and velocity instead of localT
 *   - Environments always render alongside the character (not just as fallback)
 *   - Environments are BEHIND the character (negative Z offset)
 *   - Only active +/- 1 window is rendered for performance
 */

import { Suspense } from "react"
import { TRACKS } from "../data/tracks"
import { TRACK_WORLD_POSITIONS } from "../hooks/useScrollCamera"
import { chapterLocalT } from "../hooks/useTrackSection"
import { CharacterStage } from "./CharacterStage"
import { IronManWorld }      from "./worlds/IronManWorld"
import { CapWorld }          from "./worlds/CapWorld"
import { BlackPantherWorld } from "./worlds/BlackPantherWorld"
import { UltronWorld }       from "./worlds/UltronWorld"
import { StrangeWorld }      from "./worlds/StrangeWorld"

const ENVIRONMENTS = [
  IronManWorld,
  CapWorld,
  BlackPantherWorld,
  UltronWorld,
  StrangeWorld,
] as const

interface TrackWorldsProps {
  activeTrackIndex: number
  /** Section-level progress 0..1 across all N chapters */
  sectionProgress: number
  /** Lenis scroll velocity (0+), passed to environments for velocity fx */
  velocity?: number
}

export function TrackWorlds({ activeTrackIndex, sectionProgress, velocity = 0 }: TrackWorldsProps) {
  return (
    <>
      {TRACKS.map((track, i) => {
        const [x, y, z] = TRACK_WORLD_POSITIONS[i]
        const cp         = chapterLocalT(sectionProgress, i)
        const active     = i === activeTrackIndex
        const Environment = ENVIRONMENTS[i]

        // Fall back to "model" visual if a track has no image; otherwise respect track.visual (default "image")
        const hasImage        = Boolean(track.imagePath)
        const effectiveVisual = !hasImage ? 'model' : (track.visual ?? 'image')
        const showModel       = effectiveVisual !== 'image'

        // Only render within activeIndex +/- 1 window
        const inWindow = Math.abs(i - activeTrackIndex) <= 1

        return (
          <group key={track.id} position={[x, y, z]} visible={inWindow}>
            {inWindow && (
              <>
                {/* Marvel environment — BEHIND character, full scroll choreography */}
                <group position={[0, 0, 0]}>
                  <Environment
                    chapterProgress={cp}
                    active={active}
                    velocity={active ? velocity : 0}
                  />
                </group>

                {/* Character stage (GLB or image-plane) — mounted only when visual is "model" or no image */}
                {showModel && (
                  <Suspense fallback={null}>
                    <CharacterStage
                      track={track}
                      trackIndex={i}
                      chapterProgress={cp}
                      active={active}
                    />
                  </Suspense>
                )}
              </>
            )}
          </group>
        )
      })}
    </>
  )
}