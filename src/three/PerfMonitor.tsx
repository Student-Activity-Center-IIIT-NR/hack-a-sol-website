/**
 * src/three/PerfMonitor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * R3F component mounted ONLY with ?debug=1.
 * Reads renderer.info (draw calls, triangles, textures, geometries) and
 * measures frame ms and fps. Updates perf metrics without causing React re-renders.
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export interface PerfMetrics {
  fps: number
  frameMs: number
  calls: number
  triangles: number
  textures: number
  geometries: number
}

export const livePerfMetrics: PerfMetrics = {
  fps: 60,
  frameMs: 16.6,
  calls: 0,
  triangles: 0,
  textures: 0,
  geometries: 0,
}

export function PerfMonitor() {
  const { gl } = useThree()
  const lastTimeRef = useRef(performance.now())
  const lastUpdateRef = useRef(performance.now())
  const fpsEma = useRef(60)
  const msEma = useRef(16.6)

  useEffect(() => {
    // Enable auto-reset of render info each frame if not already enabled
    gl.info.autoReset = true
  }, [gl])

  useFrame(() => {
    const now = performance.now()
    const deltaMs = Math.max(0.1, now - lastTimeRef.current)
    lastTimeRef.current = now

    const currentFps = 1000 / deltaMs
    fpsEma.current = fpsEma.current * 0.9 + currentFps * 0.1
    msEma.current = msEma.current * 0.9 + deltaMs * 0.1

    // Update shared metric values
    livePerfMetrics.fps = Math.round(fpsEma.current)
    livePerfMetrics.frameMs = parseFloat(msEma.current.toFixed(1))
    livePerfMetrics.calls = gl.info.render.calls
    livePerfMetrics.triangles = gl.info.render.triangles
    livePerfMetrics.textures = gl.info.memory.textures
    livePerfMetrics.geometries = gl.info.memory.geometries

    // Push to DOM if element exists (every ~150ms)
    if (now - lastUpdateRef.current > 150) {
      lastUpdateRef.current = now
      const elFps = document.getElementById('perf-fps')
      const elMs = document.getElementById('perf-ms')
      const elCalls = document.getElementById('perf-calls')
      const elTris = document.getElementById('perf-triangles')
      const elTex = document.getElementById('perf-textures')
      const elGeom = document.getElementById('perf-geometries')

      if (elFps) elFps.textContent = `${livePerfMetrics.fps} fps`
      if (elMs) elMs.textContent = `${livePerfMetrics.frameMs} ms`
      if (elCalls) elCalls.textContent = `${livePerfMetrics.calls}`
      if (elTris) elTris.textContent = `${livePerfMetrics.triangles.toLocaleString()}`
      if (elTex) elTex.textContent = `${livePerfMetrics.textures}`
      if (elGeom) elGeom.textContent = `${livePerfMetrics.geometries}`
    }
  })

  return null
}
