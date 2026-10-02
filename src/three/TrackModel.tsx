/**
 * src/three/TrackModel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a placeholder Three.js primitive for each track.
 * When real GLB assets are ready, swap the primitive for a <Model> component
 * loaded with useGLTF + Draco decoder inside a <Suspense> boundary.
 *
 * Props:
 *   primitive  — which geometry to render (from Track.primitive)
 *   color      — accent hex colour
 *   active     — whether this track is currently visible (drives animation)
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { TrackPrimitiveType } from '../data/tracks'

interface TrackModelProps {
  primitive: TrackPrimitiveType
  color: string
  active: boolean
}

/** Map primitive type → JSX geometry element */
const PrimitiveGeometry = ({ type }: { type: TrackPrimitiveType }) => {
  switch (type) {
    case 'icosahedron':
      return <icosahedronGeometry args={[1.4, 1]} />
    case 'torus':
      return <torusGeometry args={[1.2, 0.4, 16, 64]} />
    case 'octahedron':
      return <octahedronGeometry args={[1.5, 0]} />
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1.3, 0]} />
    case 'torusKnot':
      return <torusKnotGeometry args={[1, 0.35, 128, 16]} />
  }
}

export function TrackModel({ primitive, color, active }: TrackModelProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    // Slow idle rotation; faster when active
    const speed = active ? 0.6 : 0.15
    meshRef.current.rotation.y += delta * speed
    meshRef.current.rotation.x += delta * speed * 0.4
  })

  return (
    <mesh ref={meshRef}>
      <PrimitiveGeometry type={primitive} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={active ? 0.6 : 0.1}
        metalness={0.7}
        roughness={0.2}
        wireframe={primitive === 'dodecahedron'} // Ultron → red wireframe
      />
    </mesh>
  )
}
