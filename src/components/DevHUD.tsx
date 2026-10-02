/**
 * src/components/DevHUD.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Developer-only HUD: visible ONLY when URL contains ?debug=1.
 * Shows scroll progress, active section, track index, and character name.
 *
 * Phase 3 fix: previously visible in all DEV builds. Now requires ?debug=1
 * so it doesn't appear on the live dev server or production previews.
 */

import { TRACKS } from '../data/tracks'

interface DevHUDProps {
  scrollProgress: number
  activeTrackIndex: number
}

/** Derives the current section label from scroll progress */
function getSectionLabel(p: number): string {
  if (p < 0.05) return 'Hero'
  if (p < 0.15) return 'About'
  if (p < 0.70) return `Tracks → ${TRACKS[Math.min(4, Math.floor((p - 0.15) / 0.11))]?.name ?? '?'}`
  if (p < 0.76) return 'Why Sponsor Us'
  if (p < 0.82) return 'Sponsor Tiers'
  if (p < 0.88) return 'Timeline'
  if (p < 0.93) return 'FAQ'
  if (p < 0.97) return 'Contact'
  return 'Footer'
}

export function DevHUD({ scrollProgress, activeTrackIndex }: DevHUDProps) {
  // Show only when ?debug=1 is in the URL — works in both dev and production
  const debugMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1'

  if (!debugMode) return null

  const section = getSectionLabel(scrollProgress)
  const track = TRACKS[activeTrackIndex]

  return (
    <div
      id="dev-hud"
      className="fixed top-20 right-4 z-[9990] font-mono text-xs bg-black/70 border border-white/10 rounded p-3 min-w-[220px] pointer-events-none"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="text-marvel-gold font-bold mb-2 text-[10px] tracking-widest">DEV HUD — ?debug=1</div>
      <div className="flex flex-col gap-1 text-white/70">
        <div className="flex justify-between gap-4">
          <span className="text-white/40">scroll</span>
          <span className="text-green-400">{(scrollProgress * 100).toFixed(2)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">section</span>
          <span className="text-yellow-300 truncate max-w-[130px]">{section}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">track idx</span>
          <span style={{ color: track?.accentColor }}>[{activeTrackIndex}] {track?.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">character</span>
          <span className="text-white/60">{track?.character}</span>
        </div>
      </div>
    </div>
  )
}
