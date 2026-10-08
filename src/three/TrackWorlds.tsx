/**
 * src/three/TrackWorlds.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel environments for the Tracks section:
 * - Keeps AT MOST the active chapter's environment mounted (zero inactive envs).
 * - Removed all CharacterStage GLB loading (images only per requirement 6).
 * - Particles capped around 800 per chapter.
 * - Respects perfStore.particlesEnvironments toggle (?debug=1).
 */

import { useState, useEffect } from "react"
import { TRACKS } from "../data/tracks"
import { IronManWorld }      from "./worlds/IronManWorld"
import { CapWorld }          from "./worlds/CapWorld"
import { BlackPantherWorld } from "./worlds/BlackPantherWorld"
import { perfStore }         from "../utils/perfStore"

const ENVIRONMENTS = [
  IronManWorld,
  CapWorld,
  BlackPantherWorld,
] as const

interface TrackWorldsProps {
  activeTrackIndex: number
  /** Section-level progress 0..1 across all N chapters */
  sectionProgress: number
  /** Chapter-level progress 0..1 */
  chapterProgress?: number
  /** Lenis scroll velocity (0+), passed to environments for velocity fx */
  velocity?: number
}

export function TrackWorlds({
  activeTrackIndex,
  chapterProgress = 0,
  velocity = 0,
}: TrackWorldsProps) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    return perfStore.subscribe((t) => setEnabled(t.particlesEnvironments))
  }, [])

  if (!enabled) return null
  if (activeTrackIndex < 0 || activeTrackIndex >= TRACKS.length) return null

  const Environment = ENVIRONMENTS[activeTrackIndex]
  if (!Environment) return null

  return (
    <group position={[0, 0, 0]}>
      {/* AT MOST the active chapter's environment mounted at origin */}
      <Environment
        chapterProgress={chapterProgress}
        active={true}
        velocity={velocity}
      />
    </group>
  )
}