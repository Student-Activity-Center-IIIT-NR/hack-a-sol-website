/**
 * src/three/TrackWorlds.tsx  (Phase 3i — fix: environments at camera origin)
 * ─────────────────────────────────────────────────────────────────────────────
 * ROOT FIX: All environments render at [0,0,0] (origin, right in front of the
 * camera). The previous layout placed them at z=-8,-20,-32,-44,-56, positions
 * the camera only reaches when scrollProgress advances beyond the pin — which
 * never happens because GSAP pins #tracks (scrollProgress stays frozen).
 *
 * Solution: mount only the ACTIVE environment at origin; crossfade via
 * chapterProgress. Adjacent environments (±1) are mounted but positioned at
 * origin too — their globalA() naturally fades them to 0 when not active.
 *
 * chapterLocalT for track i:
 *   - i === activeTrackIndex: cp = chapterProgress ∈ [0,1]
 *   - i === activeTrackIndex - 1: cp → 1 (exiting), α → 0
 *   - i === activeTrackIndex + 1: cp = 0 (not yet entered), α = 0
 *
 * Phase 3i changes:
 *   - Removed TRACK_WORLD_POSITIONS offset — all environments at [0, 0, 0]
 *   - CharacterStage still mounted when visual === "model"
 *   - ?debug=1&env=bright: renderOrder trick + large emissive boost via prop
 */

import { Suspense } from "react"
import { TRACKS } from "../data/tracks"
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
        // Next chapter's particles start ~5% before previous ends to avoid any empty gap
        const leadIn      = 0.05
        const rawProgress = sectionProgress * TRACKS.length - i
        const cp          = Math.max(0, Math.min(1, (rawProgress + leadIn) / (1 + leadIn)))
        const active      = i === activeTrackIndex
        const Environment = ENVIRONMENTS[i]

        // Fall back to "model" visual if a track has no image
        const hasImage        = Boolean(track.imagePath)
        const effectiveVisual = !hasImage ? 'model' : (track.visual ?? 'image')
        const showModel       = effectiveVisual !== 'image'

        // Only render within activeIndex ±1 window (adjacent chapters fade out naturally)
        const inWindow = Math.abs(i - activeTrackIndex) <= 1

        return (
          <group key={track.id} position={[0, 0, 0]} visible={inWindow}>
            {inWindow && (
              <>
                {/* Marvel environment — at origin, right in front of camera */}
                <Environment
                  chapterProgress={cp}
                  active={active}
                  velocity={active ? velocity : 0}
                />

                {/* Character stage (GLB) — only when visual === "model" */}
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