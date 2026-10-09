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
 *   - Automated Benchmark Report (?debug=1&bench=1):
 *     p50, p95, p99, worst frame, frames > 24ms, chapter boundaries
 */

import { useEffect, useMemo, useState } from 'react'
import { useControls } from 'leva'
import { perfStore } from '../utils/perfStore'
import { benchmarkRunner, type BenchmarkReport } from '../utils/benchmark'

export function PerfPanel() {
  const debugMode = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1'
    )
  }, [])

  const isBench = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('bench') === '1'
    )
  }, [])

  const [benchReport, setBenchReport] = useState<BenchmarkReport | null>(null)
  const [benchRunning, setBenchRunning] = useState(false)
  const [benchProgress, setBenchProgress] = useState(0)

  useEffect(() => {
    if (debugMode && isBench) {
      benchmarkRunner.init()
      return benchmarkRunner.subscribe((report, running, prog) => {
        setBenchReport(report)
        setBenchRunning(running)
        setBenchProgress(prog)
      })
    }
  }, [debugMode, isBench])

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
      className="fixed bottom-4 left-4 z-[9995] font-mono text-xs bg-black/92 border border-emerald-500/30 rounded p-3 min-w-[320px] max-w-[460px] pointer-events-auto shadow-2xl max-h-[85vh] overflow-y-auto"
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

      {/* Benchmark section when ?debug=1&bench=1 */}
      {isBench && (
        <div className="mt-3 pt-2.5 border-t border-emerald-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-yellow-400 tracking-wider">
              AUTO BENCHMARK (?bench=1)
            </span>
            {benchRunning ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 animate-pulse">
                SCROLLING ({benchProgress.toFixed(0)}%)
              </span>
            ) : benchReport ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                COMPLETE
              </span>
            ) : (
              <span className="text-[9px] text-white/40">QUEUED</span>
            )}
          </div>

          {benchRunning && (
            <div className="w-full bg-white/10 h-1 rounded overflow-hidden my-2">
              <div
                className="bg-yellow-400 h-full transition-all duration-100"
                style={{ width: `${benchProgress}%` }}
              />
            </div>
          )}

          {benchReport && (
            <div className="space-y-2 mt-2 text-[10px]">
              <div className="p-2 rounded bg-white/[0.03] border border-white/10">
                <div className="font-bold text-white/90 flex justify-between items-center mb-1">
                  <span>Full Run (25s):</span>
                  <span className={benchReport.overall.targetMet ? "text-emerald-400" : "text-red-400"}>
                    {benchReport.overall.targetMet ? "PASS (p95<=20)" : "FAIL"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-white/60">
                  <div>p50: <b className="text-white">{benchReport.overall.p50} ms</b></div>
                  <div>p95: <b className="text-yellow-300">{benchReport.overall.p95} ms</b></div>
                  <div>p99: <b className="text-white">{benchReport.overall.p99} ms</b></div>
                  <div>Worst: <b className="text-orange-400">{benchReport.overall.worst} ms</b></div>
                  <div className="col-span-2">Frames &gt; 24ms: <b className="text-white">{benchReport.overall.framesOver24}</b></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] text-white/40 uppercase tracking-widest">
                  Chapter Boundaries (±300ms window):
                </div>
                {benchReport.boundaries.map((b, i) => (
                  <div
                    key={i}
                    className={`p-1.5 rounded border text-[9.5px] ${
                      b.targetMet ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="text-white/80">
                        0{b.fromChapter + 1} ➔ 0{b.toChapter + 1} ({b.chapterName})
                      </span>
                      <span className={b.targetMet ? "text-emerald-400" : "text-red-400 font-bold"}>
                        {b.targetMet ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/50 text-[9px] mt-0.5">
                      <span>p95: <b className="text-white">{b.p95}ms</b></span>
                      <span>Worst: <b className="text-white">{b.worst}ms</b></span>
                      <span>&gt;24ms: <b className="text-white">{b.framesOver24}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-white/10 text-[9px] text-white/40 space-y-0.5">
        <div>Toggles active via Leva panel above.</div>
        <div className="text-white/25">Use ?debug=1&bench=1 for automated frame test.</div>
      </div>
    </div>
  )
}
