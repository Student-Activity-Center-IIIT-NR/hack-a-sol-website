/**
 * src/three/Scene.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The ONE persistent R3F scene rendered inside the fixed <Canvas> in App.tsx.
 * All track models live here; visibility is controlled by activeTrackIndex.
 *
 * Camera drifts subtly based on global scroll progress (0 → 1).
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { TRACKS } from '../data/tracks'
import { TrackModel } from './TrackModel'

interface SceneProps {
  /** 0 → 1 global scroll progress */
  scrollProgress: number
  /** Index of the currently active track (0–4) */
  activeTrackIndex: number
}

export function Scene({ scrollProgress, activeTrackIndex }: SceneProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5))

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Subtle camera drift driven by scroll
    targetPosition.current.set(
      Math.sin(scrollProgress * Math.PI * 2) * 0.8,
      -scrollProgress * 2 + 1,
      5 + Math.cos(scrollProgress * Math.PI) * 0.5,
    )

    // Smooth camera lerp
    camera.position.lerp(targetPosition.current, delta * 1.2)
    camera.lookAt(0, 0, 0)

    // Rotate the whole group very slowly for ambient life
    groupRef.current.rotation.y += delta * 0.04
  })

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#6060ff" />

      {/* Accent point light coloured to the active track */}
      <pointLight
        position={[0, 0, 2]}
        intensity={3}
        color={TRACKS[activeTrackIndex]?.accentColor ?? '#60A5FA'}
        distance={8}
      />

      {/* Starfield background */}
      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      {/* Environment map for reflections */}
      <Environment preset="night" />

      {/* Track model group — only active model visible */}
      <group ref={groupRef}>
        {TRACKS.map((track, i) => (
          <group key={track.id} visible={i === activeTrackIndex}>
            <TrackModel
              primitive={track.primitive}
              color={track.accentColor}
              active={i === activeTrackIndex}
            />
          </group>
        ))}
      </group>
    </>
  )
}
