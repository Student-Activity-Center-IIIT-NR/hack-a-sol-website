/**
 * src/components/DevHUD.tsx  (Phase 3g)
 * -----------------------------------------------------------------------------
 * Developer-only HUD: visible ONLY when URL contains ?debug=1.
 * Shows scroll progress, section state, track index, chapter progress,
 * and expected GLB filename — all from the single-source track state.
 */

import { TRACKS } from '../data/tracks'

interface DevHUDProps {
  scrollProgress:  number
  activeTrackIndex: number
  chapterProgress: number
  sectionProgress: number
}

function getSectionLabel(p: number): string {
  if (p < 0.05) return 'Hero'
  if (p < 0.15) return 'About'
  if (p < 0.70) {
    const idx = Math.min(TRACKS.length - 1, Math.max(0, Math.floor(((p - 0.15) / 0.55) * TRACKS.length)))
    return `Tracks ? ${TRACKS[idx]?.name ?? '?'}`
  }
  if (p < 0.76) return 'Why Sponsor Us'
  if (p < 0.82) return 'Sponsor Tiers'
  if (p < 0.88) return 'Timeline'
  if (p < 0.93) return 'FAQ'
  if (p < 0.97) return 'Contact'
  return 'Footer'
}

export function DevHUD({ scrollProgress, activeTrackIndex, chapterProgress, sectionProgress }: DevHUDProps) {
  const debugMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1'

  if (!debugMode) return null

  const section = getSectionLabel(scrollProgress)
  const track   = TRACKS[activeTrackIndex]
  const glbFile = `/models/${track?.id ?? '?'}.glb`

  // Phase label
  const phase =
    chapterProgress < 0.25 ? 'ENTER' :
    chapterProgress < 0.75 ? 'HOLD'  : 'EXIT'

  return (
    <div
      id="dev-hud"
      className="fixed top-20 right-4 z-[9990] font-mono text-xs bg-black/80 border border-white/10 rounded p-3 min-w-[260px] pointer-events-none"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="text-yellow-400 font-bold mb-2 text-[10px] tracking-widest">DEV HUD — ?debug=1</div>
      <div className="flex flex-col gap-1 text-white/70">

        <div className="flex justify-between gap-4">
          <span className="text-white/40">page scroll</span>
          <span className="text-green-400">{(scrollProgress * 100).toFixed(2)}%</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-white/40">section</span>
          <span className="text-yellow-300 truncate max-w-[160px]">{section}</span>
        </div>

        <div className="border-t border-white/10 my-1" />

        <div className="flex justify-between gap-4">
          <span className="text-white/40">sectionProgress</span>
          <span className="text-blue-300">{sectionProgress.toFixed(4)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-white/40">activeIndex</span>
          <span style={{ color: track?.accentColor }}>[{activeTrackIndex}] {track?.name}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-white/40">chapterProgress</span>
          <span className="text-purple-300">{chapterProgress.toFixed(4)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-white/40">phase</span>
          <span className={
            phase === 'ENTER' ? 'text-green-400' :
            phase === 'HOLD'  ? 'text-white/80' : 'text-orange-400'
          }>{phase}</span>
        </div>

        <div className="border-t border-white/10 my-1" />

        <div className="flex justify-between gap-4">
          <span className="text-white/40">character</span>
          <span className="text-white/60">{track?.character}</span>
        </div>

        <div className="flex justify-between gap-4 items-start">
          <span className="text-white/40 shrink-0">GLB file</span>
          <span className="text-cyan-400 text-right break-all">{glbFile}</span>
        </div>

      </div>
    </div>
  )
}
