/**
 * src/components/FloatingHUD.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic Marvel Multiverse HUD overlay.
 *
 * UI RULES (per spec):
 * - ALL floating HUD text labels ("MULTIVERSE SECTOR 05 // REALITY DETECTED",
 *   "VOL. 5 // NO. 2026", "TARGET", "PROGRESS") must show ONLY inside the
 *   Tracks section (inTracksSection = true).
 * - The four viewport corner brackets remain always visible but at z-index
 *   below panels (z-30 wrapper, brackets are purely decorative).
 * - Border color: rgba(255,255,255,0.16) max (--line-strong).
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

  // In-tracks: sectionProgress > 0 means Tracks pinned section is active
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
      {/* ── Screen Corner Brackets — always visible, 24px from edges, behind panels ── */}
      {/* border-white/[0.14] keeps them at ≤ var(--line-strong) */}
      <div className="absolute top-20 left-6 w-4 h-4 border-t border-l border-white/[0.14]" />
      <div className="absolute top-20 right-6 w-4 h-4 border-t border-r border-white/[0.14]" />
      <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/[0.14]" />
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/[0.14]" />

      {/* ── HUD labels — only inside Tracks section ── */}

      {/* Top-Left: MULTIVERSE SECTOR 05 */}
      <div
        className={`absolute top-20 left-12 font-mono text-[9px] tracking-widest text-white/40 flex items-center gap-2 transition-opacity duration-500 ${inTracksSection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-marvel-red/80 animate-pulse" />
        <span className="text-white/60 font-semibold">MULTIVERSE SECTOR 05</span>
        <span className="text-white/30 hidden md:inline">// REALITY DETECTED</span>
      </div>

      {/* Bottom-Left: VOL. 5 // NO. 2026 */}
      <div
        className={`absolute bottom-16 left-12 font-mono text-[10px] tracking-wider text-white/40 transition-opacity duration-500 ${inTracksSection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="text-white/70 font-heading tracking-widest text-xs mb-0.5">
          VOL. 5 // NO. 2026
        </div>
        <div className="text-white/40 tracking-widest text-[9px] uppercase">
          FLAGSHIP TECH CONVERGENCE • IIIT NAYA RAIPUR
        </div>
      </div>

      {/* Bottom-Right: TARGET / PROGRESS */}
      <div
        className={`absolute bottom-16 right-12 font-mono text-[10px] tracking-wider text-right text-white/40 max-w-[40vw] transition-opacity duration-500 ${inTracksSection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <span
            className="w-1.5 h-1.5 rounded-sm flex-shrink-0"
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
