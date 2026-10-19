/**
 * src/components/FloatingHUD.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Marvel Multiverse HUD overlay.
 *
 * Streamlined:
 * - Top-left: Single small dim corner label ("MULTIVERSE SECTOR 05 // REALITY DETECTED").
 * - Hero section has strictly ONE corner label (top-left).
 * - Bottom-left "VOL. 5" and bottom-right telemetry fade out during Hero section
 *   so they never cover the Hero CTA buttons or clutter the view.
 * - Responsive margins prevent right-side text clipping.
 */

import { useEffect, useState } from 'react'
import { TRACKS } from '../data/tracks'

interface FloatingHUDProps {
  scrollProgress: number
  activeTrackIndex: number
  sectionProgress: number
}

export function FloatingHUD({ scrollProgress, activeTrackIndex, sectionProgress }: FloatingHUDProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const activeTrack = TRACKS[activeTrackIndex]

  // In-tracks: sectionProgress > 0 means ST is active (pinned)
  const inTracksSection = sectionProgress > 0 && sectionProgress < 1

  // Hero section flag: keep strictly ONE small dim corner label in Hero; hide bottom telemetries
  const inHeroSection = scrollProgress < 0.08

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 8
      const y = (e.clientY / window.innerHeight - 0.5) * 8
      setMouseOffset({ x, y })
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden hidden sm:block"
      style={{
        transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* ── Screen Corner Brackets (HUD) — FIX 5d: 24px inside viewport ── */}
      <div className="absolute top-20 left-6 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-20 right-6 w-4 h-4 border-t border-r border-white/20" />
      <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20" />

      {/* ── Top-Left: One Small Dim Corner Label (Zero Stacking) ── */}
      {/* FIX 5c: hidden while hero is active AND while tracks are active */}
      <div
        className={`absolute top-20 left-12 font-mono text-[9px] tracking-widest text-white/40 flex items-center gap-2 transition-opacity duration-500 ${(inHeroSection || inTracksSection) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-marvel-red/80 animate-pulse" />
        <span className="text-white/60 font-semibold">MULTIVERSE SECTOR 05</span>
        <span className="text-white/30 hidden sm:inline">// REALITY DETECTED</span>
      </div>

      {/* ── Bottom-Left: Comic Meta Data (VOL. 5) ── */}
      {/* Hidden during Hero so it NEVER covers any CTA button */}
      <div
        className={`absolute bottom-16 left-12 font-mono text-[10px] tracking-wider text-white/40 transition-opacity duration-500 ${(inHeroSection || scrollProgress > 0.92) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="text-white/70 font-heading tracking-widest text-xs mb-0.5">
          VOL. 5 // NO. 2026
        </div>
        <div className="text-white/40 tracking-widest text-[9px] uppercase">
          FLAGSHIP TECH CONVERGENCE • IIIT NAYA RAIPUR
        </div>
      </div>

      {/* ── Bottom-Right: Active Track Telemetry ── */}
      {/* Hidden during Hero to keep strictly ONE corner label in Hero; right margin safeguarded */}
      <div
        className={`absolute bottom-16 right-12 font-mono text-[10px] tracking-wider text-right text-white/40 max-w-[40vw] transition-opacity duration-500 ${(inHeroSection || scrollProgress > 0.92 || !inTracksSection) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-l"
            style={{ backgroundColor: activeTrack ? activeTrack.accentColor : '#E23636' }}
          />
          <span className="text-white/70 uppercase truncate">
            {activeTrack ? `TARGET: ${activeTrack.character}` : 'SYS.STATUS: EXPLORING'}
          </span>
        </div>
        <div className="text-white/30 text-[9px] flex items-center justify-end gap-3">
          <span>PROGRESS: {(scrollProgress * 100).toFixed(0)}%</span>
          <span>DISP: 0.1ms</span>
        </div>
      </div>
    </div>
  )
}
