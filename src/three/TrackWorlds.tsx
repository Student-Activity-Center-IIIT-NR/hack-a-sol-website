/**
 * src/three/TrackWorlds.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Places all 5 track world objects at their fixed positions in the 3D scene.
 * The camera travels between them (see useScrollCamera.ts).
 *
 * Each world receives:
 *   localT : 0→1 progress within its own scroll window (for assembly animation)
 *   active : true when the camera is closest to it
 */

import { TRACK_WORLD_POSITIONS, getTrackLocalT } from '../hooks/useScrollCamera'
import { IronManWorld }       from './worlds/IronManWorld'
import { CapWorld }           from './worlds/CapWorld'
import { BlackPantherWorld }  from './worlds/BlackPantherWorld'
import { UltronWorld }        from './worlds/UltronWorld'
import { StrangeWorld }       from './worlds/StrangeWorld'

interface TrackWorldsProps {
  activeTrackIndex: number
  scrollProgress: number
}

export function TrackWorlds({ activeTrackIndex, scrollProgress }: TrackWorldsProps) {
  const worlds = [
    { Component: IronManWorld },
    { Component: CapWorld },
    { Component: BlackPantherWorld },
    { Component: UltronWorld },
    { Component: StrangeWorld },
  ]

  return (
    <>
      {worlds.map(({ Component }, i) => {
        const [x, y, z] = TRACK_WORLD_POSITIONS[i]
        const localT = getTrackLocalT(scrollProgress, i)
        return (
          <group key={i} position={[x, y, z]}>
            <Component localT={localT} active={i === activeTrackIndex} />
          </group>
        )
      })}
    </>
  )
}
