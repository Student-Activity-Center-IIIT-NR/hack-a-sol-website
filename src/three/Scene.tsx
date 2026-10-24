/**
 * src/three/Scene.tsx  (Phase 3h — Marvel scroll environments)
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE persistent R3F scene. Camera path, fog, stars, environments.
 * Phase 3h: TrackWorlds receives sectionProgress + velocity for environment fx.
 */

import { useRef, useEffect, useState, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Stars, PerformanceMonitor, AdaptiveDpr, Preload } from "@react-three/drei"
import * as THREE from "three"

import { TRACKS } from "../data/tracks"
import { useScrollCamera } from "../hooks/useScrollCamera"
import { scrollStore } from "../utils/scrollStore"
import { warnZeroSize, isPhoneDevice } from "../utils/webglGuard"
import { TrackWorlds } from "./TrackWorlds"
import { TrackParticles } from "./TrackParticles"
import { HeroSpace } from "./HeroSpace"
import { PostFX } from "./PostFX"
import { PerfMonitor } from "./PerfMonitor"

interface SceneProps {
  scrollProgress?:   number
  activeTrackIndex?: number
  sectionProgress?:  number
  chapterProgress?: number
  velocity?:        number
}

const _targetPos  = new THREE.Vector3()
const _targetLook = new THREE.Vector3()
const _tempObj    = new THREE.PerspectiveCamera()
const _fogColor   = new THREE.Color("#0A0A0F")
const _mouseDelta = new THREE.Vector2()

const ACCENT_COLORS = TRACKS.map(t => new THREE.Color(t.accentColor).multiplyScalar(0.08))
const NEUTRAL       = new THREE.Color("#0A0A0F")

export function Scene({ activeTrackIndex = 0 }: SceneProps) {
  const { camera, scene, gl, set, size } = useThree()
  const { getCameraTransform } = useScrollCamera()
  const mouseRef = useRef({ x: 0, y: 0 })

  // Warm-up: pre-compile all shaders and upload textures to prevent scroll jank
  useEffect(() => {
    try {
      gl.compile(scene, camera)
    } catch {
      // safe fallback
    }
  }, [gl, scene, camera])

  const [zone, setZone] = useState(() => scrollStore.getZone())

  const debugMode = useMemo(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1"
  , [])

  // Zone subscriptions (re-renders at most twice across entire scroll: hero exit & tracks exit)
  useEffect(() => {
    return scrollStore.subscribeZone(setZone)
  }, [])

  // Pause rendering when tab is hidden, when size is 0, or when neither Hero nor Tracks is in view
  useEffect(() => {
    const updateFrameloop = () => {
      const isHidden = typeof document !== "undefined" && document.hidden
      const inView = scrollStore.isInHeroOrTracks()
      const hasSize = size.width > 0 && size.height > 0
      set({ frameloop: !isHidden && inView && hasSize ? "always" : "never" })
    }

    const unsub = scrollStore.subscribeInView(updateFrameloop)
    document.addEventListener("visibilitychange", updateFrameloop)
    window.addEventListener("resize", updateFrameloop)
    window.addEventListener("orientationchange", updateFrameloop)

    updateFrameloop()

    return () => {
      unsub()
      document.removeEventListener("visibilitychange", updateFrameloop)
      window.removeEventListener("resize", updateFrameloop)
      window.removeEventListener("orientationchange", updateFrameloop)
    }
  }, [set, size.width, size.height])

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#0A0A0F", 0.0012)
    scene.background = new THREE.Color("#050508")

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("mousemove", onMouse, { passive: true })

    return () => {
      scene.fog = null
      window.removeEventListener("mousemove", onMouse)
    }
  }, [scene])

  useFrame((state, delta) => {
    if (state.size.width <= 0 || state.size.height <= 0) {
      warnZeroSize('Scene')
      return
    }

    const scrollP = scrollStore.getScrollProgress()
    const { position, lookAt } = getCameraTransform(scrollP)
    _targetPos.copy(position)
    _targetLook.copy(lookAt)

    _mouseDelta.set(mouseRef.current.x * 0.3, mouseRef.current.y * -0.2)
    _targetPos.x += _mouseDelta.x
    _targetPos.y += _mouseDelta.y

    camera.position.lerp(_targetPos, Math.min(1, delta * 2.5))

    _tempObj.position.copy(camera.position)
    _tempObj.lookAt(_targetLook)
    camera.quaternion.slerp(_tempObj.quaternion, Math.min(1, delta * 2.5))

    const activeIdx = scrollStore.getActiveIndex()
    const targetFog = activeIdx >= 0 && activeIdx < ACCENT_COLORS.length ? ACCENT_COLORS[activeIdx] : NEUTRAL
    _fogColor.lerp(targetFog, delta * 0.8)
    if (scene.fog instanceof THREE.FogExp2) scene.fog.color.copy(_fogColor)
  })

  return (
    <>
      {/* Dynamic DPR optimization: on phones, DPR is strictly 1 */}
      {!isPhoneDevice() && (
        <PerformanceMonitor bounds={() => [50, 60]}>
          <AdaptiveDpr />
        </PerformanceMonitor>
      )}

      {/* Renderer metrics & FPS debug monitor (mounted strictly with ?debug=1) */}
      {debugMode && <PerfMonitor />}

      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 8]} intensity={1.2} />

      <Stars radius={100} depth={100} count={5000} factor={4} saturation={0.1} fade speed={0.3} />

      {/* Local lighting setup */}
      <hemisphereLight args={["#ffffff", "#050508", 0.65]} />
      <directionalLight position={[-8, -6, -4]} intensity={0.45} color="#60a5fa" />
      <directionalLight position={[0, 8, -6]} intensity={0.35} color="#a855f7" />

      {/* Scroll-driven 3D Marvel space layer for Hero section — STRICTLY unmounted in Tracks */}
      {zone.hero && <HeroSpace scrollProgress={0} />}

      {/* Unified soft light particle & transition system for Tracks */}
      {zone.tracks && (
        <>
          <TrackParticles
            activeTrackIndex={activeTrackIndex}
            chapterProgress={0}
            sectionProgress={0}
          />
          <TrackWorlds
            activeTrackIndex={activeTrackIndex}
            sectionProgress={0}
          />
        </>
      )}

      <Preload all />
      <PostFX />
    </>
  )
}