/**
 * src/components/PerfPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Performance HUD and Leva toggles:
 * Mounted ONLY when URL contains ?debug=1.
 *
 * Displays:
 *   - FPS and Frame ms
 *   - Draw calls (gl.info.render.calls)
 *   - Triangles (gl.info.render.triangles)
 *   - Textures (gl.info.memory.textures)
 *   - Geometries (gl.info.memory.geometries)
 *
 * Exposes Leva toggles to individually disable:
 *   - post-processing
 *   - particles/environments
 *   - character images
 *   - hero silhouettes
 */

import { useEffect, useMemo } from 'react'
import { useControls } from 'leva'
import { perfStore } from '../utils/perfStore'

export function PerfPanel() {
  const debugMode = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1'
    )
  }, [])

  // Leva controls to switch off subsystems individually
  const toggles = useControls(
    'Perf Diagnostics (?debug=1)',
    {
      postProcessing: {
        value: true,
        label: 'Post-Processing',
      },
      particlesEnvironments: {
        value: true,
        label: 'Particles / Envs',
      },
      characterImages: {
        value: true,
        label: 'Character Images',
      },
      heroSilhouettes: {
        value: true,
        label: 'Hero Silhouettes',
      },
    },
    { collapsed: false }
  )

  useEffect(() => {
    perfStore.updateAll(toggles)
  }, [toggles])

  if (!debugMode) return null

  return (
    <div
      id="perf-panel"
      className="fixed bottom-4 left-4 z-[9995] font-mono text-xs bg-black/90 border border-emerald-500/30 rounded p-3 min-w-[260px] pointer-events-none shadow-2xl"
      style={{ backdropFilter: 'none' }}
    >
      <div className="text-emerald-400 font-bold mb-2 text-[10px] tracking-widest flex items-center justify-between">
        <span>PERF METRICS (RENDERER.INFO)</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
          DEBUG
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white/80 text-[11px]">
        <div className="flex justify-between">
          <span className="text-white/40">FPS:</span>
          <span id="perf-fps" className="text-emerald-300 font-bold">
            60 fps
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/40">Frame:</span>
          <span id="perf-ms" className="text-yellow-300 font-bold">
            16.6 ms
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/40">Draw Calls:</span>
          <span id="perf-calls" className="text-cyan-300 font-semibold">
            0
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/40">Triangles:</span>
          <span id="perf-triangles" className="text-cyan-300 font-semibold">
            0
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/40">Textures:</span>
          <span id="perf-textures" className="text-purple-300 font-semibold">
            0
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/40">Geometries:</span>
          <span id="perf-geometries" className="text-purple-300 font-semibold">
            0
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-white/10 text-[9px] text-white/40 space-y-0.5">
        <div>Toggles active via Leva panel above.</div>
        <div className="text-white/25">Use toggles to isolate subsystem costs.</div>
      </div>
    </div>
  )
}
