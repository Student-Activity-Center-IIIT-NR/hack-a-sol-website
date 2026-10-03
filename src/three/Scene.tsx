/**
 * src/three/Scene.tsx  ── MAJOR REWRITE (Phase 2)
 * ─────────────────────────────────────────────────────────────────────────────
 * The ONE persistent R3F scene. Camera follows a CatmullRomCurve3 path
 * through the Marvel multiverse, driven by scroll progress 0→1.
 *
 * Architecture:
 *   - useScrollCamera provides getCameraTransform(t) → {position, lookAt}
 *   - TrackWorlds places 5 Marvel worlds at fixed 3D positions
 *   - Fog color lerps smoothly between track accent colours
 *   - Stars fill the entire scene depth
 *   - Mouse parallax adds subtle camera offset relative to pointer
 *   - Tab visibility pause: stops rendering when page is hidden
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars, Environment } from '@react-three/drei'
import * as THREE from 'three'

import { TRACKS } from '../data/tracks'
import { useScrollCamera } from '../hooks/useScrollCamera'
import { TrackWorlds } from './TrackWorlds'
import { PostFX } from './PostFX'

interface SceneProps {
  scrollProgress:   number
  activeTrackIndex: number
  sectionProgress:  number
}

// Pre-allocate to avoid GC
const _targetPos  = new THREE.Vector3()
const _targetLook = new THREE.Vector3()
const _tempObj    = new THREE.Object3D()
const _fogColor   = new THREE.Color('#0A0A0F')
const _mouseDelta = new THREE.Vector2()

// Track accent colours parsed as THREE.Color
const ACCENT_COLORS = TRACKS.map(t => new THREE.Color(t.accentColor).multiplyScalar(0.08))
const NEUTRAL       = new THREE.Color('#0A0A0F')

export function Scene({ scrollProgress, activeTrackIndex, sectionProgress }: SceneProps) {
  const { camera, scene, gl } = useThree()
  const { getCameraTransform } = useScrollCamera()

  // Mouse parallax offset (updated by window mousemove, applied per frame)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // ── Fog (reduced so models are never swallowed in darkness)
    scene.fog = new THREE.FogExp2('#0A0A0F', 0.0012)
    scene.background = new THREE.Color('#050508')

    // ── Mouse parallax
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // ── Pause rendering when tab is hidden (performance)
    const onVisibility = () => { gl.setAnimationLoop(document.hidden ? null : () => {}) }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      scene.fog = null
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [scene, gl])

  useFrame((_, delta) => {
    // ── Camera along path
    const { position, lookAt } = getCameraTransform(scrollProgress)
    _targetPos.copy(position)
    _targetLook.copy(lookAt)

    // Add subtle mouse parallax (max ±0.3 units)
    _mouseDelta.set(mouseRef.current.x * 0.3, mouseRef.current.y * -0.2)
    _targetPos.x += _mouseDelta.x
    _targetPos.y += _mouseDelta.y

    camera.position.lerp(_targetPos, Math.min(1, delta * 2.5))

    // Smooth look-at via quaternion slerp (avoids gimbal lock)
    _tempObj.position.copy(camera.position)
    _tempObj.lookAt(_targetLook)
    camera.quaternion.slerp(_tempObj.quaternion, Math.min(1, delta * 2.5))

    // ── Fog colour: lerp toward active track accent (darkened)
    const targetFog = activeTrackIndex >= 0 ? ACCENT_COLORS[activeTrackIndex] : NEUTRAL
    _fogColor.lerp(targetFog, delta * 0.8)
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(_fogColor)
    }
  })

  return (
    <>
      {/* Global illumination */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 8]} intensity={1.2} />

      {/* Deep-space starfield */}
      <Stars radius={100} depth={100} count={5000} factor={4} saturation={0.1} fade speed={0.3} />

      {/* PBR environment — preset "city" with low intensity */}
      <Environment preset="city" environmentIntensity={0.45} />

      {/* All 5 track worlds — positioned in 3D space */}
      <TrackWorlds
        activeTrackIndex={activeTrackIndex}
        sectionProgress={sectionProgress}
      />

      {/* Post-processing (desktop/high-end only) */}
      <PostFX scrollProgress={scrollProgress} activeTrackIndex={activeTrackIndex} />
    </>
  )
}
