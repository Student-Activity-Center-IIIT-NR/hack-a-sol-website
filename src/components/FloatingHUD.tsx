/**
 * src/components/FloatingHUD.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Marvel HUD overlay.
 *
 * FIX (Phase 3): bottom-right telemetry no longer overlaps the footer —
 * it hides automatically when scrollProgress > 0.92 (footer zone).
 * Bottom content raised from bottom-8 to bottom-16 to clear corner brackets.
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

  // In-tracks: sectionProgress > 0 means ST is active (we're pinned)
  const inTracksSection = sectionProgress > 0 && sectionProgress < 1


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
      {/* ── Screen Corner Brackets (JARVIS HUD) ── */}
      <div className="absolute top-20 left-8 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-20 right-8 w-4 h-4 border-t border-r border-white/20" />
      {/* Bottom brackets raised so they don't clash with footer */}
      <div className="absolute bottom-16 left-8 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-16 right-8 w-4 h-4 border-b border-r border-white/20" />

      {/* ── Top-Left: Campus & Multiverse Coordinates ── */}
      {/* Hidden during Tracks section to avoid overlapping headings */}
      <div
        className={`absolute top-20 left-16 font-mono text-[10px] tracking-widest text-white/40 flex flex-col gap-0.5 transition-opacity duration-500 ${inTracksSection ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <span className="text-white/40">COORD: 21.1255° N, 81.7662° E [IIIT-NR]</span>
        <span className="text-white/30 text-[9px]">TIMELINE INTEGRITY: STABLE // EARTH-616</span>
      </div>

      

      {/* ── Bottom-Right: Active Track Telemetry ── */}
      <div
        className={`absolute bottom-20 right-16 font-mono text-[10px] tracking-wider text-right text-white/40 transition-opacity duration-500 ${scrollProgress > 0.92 || !inTracksSection? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-l"
            style={{ backgroundColor: activeTrack ? activeTrack.accentColor : '#E23636' }}
          />
          <span className="text-white/70 uppercase">
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
