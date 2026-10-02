/**
 * src/components/FloatingHUD.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Marvel HUD overlay:
 *   • Comic-issue metadata: "VOL. 5 // NO. 2026"
 *   • Campus coordinates: 21.1255° N, 81.7662° E (IIIT Naya Raipur)
 *   • Multiverse sector status & active track target telemetry
 *   • Corner reticle brackets and reactive mouse parallax
 */

import { useEffect, useState } from 'react'
import { TRACKS } from '../data/tracks'

interface FloatingHUDProps {
  scrollProgress: number
  activeTrackIndex: number
}

export function FloatingHUD({ scrollProgress, activeTrackIndex }: FloatingHUDProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const activeTrack = TRACKS[activeTrackIndex]

  useEffect(() => {
    // Subtle parallax response to mouse movements
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8
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
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/20" />

      {/* ── Top-Left: Campus & Multiverse Coordinates ── */}
      <div className="absolute top-20 left-16 font-mono text-[10px] tracking-widest text-white/40 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-marvel-red animate-pulse" />
          <span className="text-white/70 font-semibold">MULTIVERSE SECTOR 05</span>
        </div>
        <span className="text-white/40">COORD: 21.1255° N, 81.7662° E [IIIT-NR]</span>
        <span className="text-white/30 text-[9px]">TIMELINE INTEGRITY: STABLE // EARTH-616</span>
      </div>

      {/* ── Bottom-Left: Comic Meta Data ── */}
      <div className="absolute bottom-8 left-16 font-mono text-[10px] tracking-wider text-white/40">
        <div className="text-white/70 font-heading tracking-widest text-xs mb-0.5">
          VOL. 5 // NO. 2026
        </div>
        <div className="text-white/40 tracking-widest text-[9px] uppercase">
          FLAGSHIP TECH CONVERGENCE • IIIT NAYA RAIPUR
        </div>
      </div>

      {/* ── Bottom-Right: Active Track Telemetry ── */}
      <div className="absolute bottom-8 right-16 font-mono text-[10px] tracking-wider text-right text-white/40">
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
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
