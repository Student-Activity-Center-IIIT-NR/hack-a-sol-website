/**
 * src/three/TrackWorlds.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel environments for the Tracks section:
 * - WARM-UP AND NO MOUNT CHURN: all five environments created once and kept mounted,
 *   toggling only visible/opacity (no unmounting, no new geometries or materials during scroll).
 * - Removed all CharacterStage GLB loading (images only).
 * - Particles/triangles capped under 1000 per chapter.
 * - Respects perfStore.particlesEnvironments toggle (?debug=1).
 */

import { useState, useEffect } from "react"
import { IronManWorld }      from "./worlds/IronManWorld"
import { CapWorld }          from "./worlds/CapWorld"
import { BlackPantherWorld } from "./worlds/BlackPantherWorld"
import { PolicyWorld }       from "./worlds/PolicyWorld"
import { OpenWorld }         from "./worlds/OpenWorld"
import { perfStore }         from "../utils/perfStore"

interface TrackWorldsProps {
  activeTrackIndex: number
  /** Section-level progress 0..1 across all N chapters */
  sectionProgress?: number
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

  return (
    <group position={[0, 0, 0]}>
      {/* All five environments created once and kept mounted permanently with strict visibility isolation */}
      <group visible={activeTrackIndex === 0}>
        <IronManWorld
          active={activeTrackIndex === 0}
          chapterProgress={activeTrackIndex === 0 ? chapterProgress : 0}
          velocity={velocity}
        />
      </group>
      <group visible={activeTrackIndex === 1}>
        <CapWorld
          active={activeTrackIndex === 1}
          chapterProgress={activeTrackIndex === 1 ? chapterProgress : 0}
          velocity={velocity}
        />
      </group>
      <group visible={activeTrackIndex === 2}>
        <BlackPantherWorld
          active={activeTrackIndex === 2}
          chapterProgress={activeTrackIndex === 2 ? chapterProgress : 0}
          velocity={velocity}
        />
      </group>
      <group visible={activeTrackIndex === 3}>
        <PolicyWorld
          active={activeTrackIndex === 3}
          chapterProgress={activeTrackIndex === 3 ? chapterProgress : 0}
          velocity={velocity}
        />
      </group>
      <group visible={activeTrackIndex === 4}>
        <OpenWorld
          active={activeTrackIndex === 4}
          chapterProgress={activeTrackIndex === 4 ? chapterProgress : 0}
          velocity={velocity}
        />
      </group>
    </group>
  )
}