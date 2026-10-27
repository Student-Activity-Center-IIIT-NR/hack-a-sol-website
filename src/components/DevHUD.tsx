/**
 * src/components/DevHUD.tsx  (Phase 3h - slower scroll, dwell & snap)
 * -----------------------------------------------------------------------------
 * Developer-only HUD: visible ONLY when URL contains ?debug=1.
 * Shows scroll progress, section state, track index, chapter progress c,
 * the phase (ENTER/HOLD/EXIT), and expected GLB filename.
 */

import { TRACKS } from '../data/tracks'

interface DevHUDProps {
  scrollProgress:   number
  activeTrackIndex: number
  chapterProgress:  number
  sectionProgress:  number
}

function getSectionLabel(p: number): string {
  if (p < 0.05) return 'Hero'
  if (p < 0.12) return 'About'
  if (p < 0.78) {
    const idx = Math.min(TRACKS.length - 1, Math.max(0, Math.floor(((p - 0.12) / 0.66) * TRACKS.length)))
    return `Tracks — ${TRACKS[idx]?.name ?? '?'}`
  }
  if (p < 0.83) return 'Why Sponsor Us'
  if (p < 0.88) return 'Sponsor Tiers'
  if (p < 0.92) return 'Timeline'
  if (p < 0.96) return 'FAQ'
  if (p < 0.98) return 'Contact'
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

  const phase =
    chapterProgress < 0.22 ? 'ENTER' :
    chapterProgress <= 0.78 ? 'HOLD'  : 'EXIT'

  // HeroSpace mounted state
  const heroSpaceMounted = sectionProgress === 0 && scrollProgress < 0.15

  return (
    <div
      id="dev-hud"
      className="fixed top-20 right-4 z-[9990] font-mono text-xs bg-black/85 border border-white/10 rounded p-3 min-w-[280px] pointer-events-none shadow-2xl"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="text-yellow-400 font-bold mb-2 text-[10px] tracking-widest flex items-center justify-between">
        <span>DEV HUD — ?debug=1</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">LIVE</span>
      </div>
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
          <span className="text-white/40">HeroSpace mounted</span>
          <span className={heroSpaceMounted ? "text-green-400 font-bold" : "text-red-400"}>
            {heroSpaceMounted ? "yes" : "no"}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-white/40">HeroSpace objects</span>
          <span className="text-cyan-300 font-bold">
            {heroSpaceMounted ? "1 (subtle red embers)" : "0 (unmounted)"}
          </span>
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
          <span className="text-white/40">c (chapterProgress)</span>
          <span className="text-purple-300 font-bold">{chapterProgress.toFixed(4)}</span>
        </div>

        <div className="flex justify-between gap-4 items-center">
          <span className="text-white/40">phase</span>
          <span className={
            'px-2 py-0.5 rounded text-[10px] font-bold ' +
            (phase === 'ENTER' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
             phase === 'HOLD'  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                 'bg-orange-500/20 text-orange-400 border border-orange-500/30')
          }>
            {phase} {phase === 'HOLD' ? '(0.22–0.78)' : phase === 'ENTER' ? '(0–0.22)' : '(0.78–1)'}
          </span>
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