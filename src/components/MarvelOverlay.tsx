/**
 * src/components/MarvelOverlay.tsx  (Phase 3h — common Marvel layer)
 * ─────────────────────────────────────────────────────────────────────────────
 * Common Marvel universe layer rendered above the 3D canvas but behind text:
 *   1. Subtle comic halftone dot overlay (CSS, very dim)
 *   2. "EARTH-616" + "CLASSIFIED" corner HUD text (dim monospace)
 *   3. Multiverse "crack" glitch flash on chapter transitions (triggers when
 *      chapterProgress crosses 0.78 → next chapter enters)
 *
 * All elements use pointer-events:none and z-index:2 (above canvas z=0,
 * below scroll-content z=10).
 * prefers-reduced-motion: static only, no glitch flash.
 */

import { useEffect, useRef, useMemo, useState } from "react"
import { TRACKS } from "../data/tracks"

interface MarvelOverlayProps {
  activeTrackIndex: number
  chapterProgress:  number
  sectionProgress:  number
  velocity?:        number
}

export function MarvelOverlay({
  activeTrackIndex,
  chapterProgress,
  sectionProgress,
  velocity = 0,
}: MarvelOverlayProps) {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )

  // Crack glitch flash: trigger when chapterProgress crosses EXIT threshold
  const [crackVisible, setCrackVisible] = useState(false)
  const prevCpRef = useRef(chapterProgress)
  const crackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const prevC = prevCpRef.current
    const c = chapterProgress
    // Trigger on EXIT crossing: 0.78 → higher
    if (prevC < 0.78 && c >= 0.78) {
      setCrackVisible(true)
      if (crackTimer.current) clearTimeout(crackTimer.current)
      crackTimer.current = setTimeout(() => setCrackVisible(false), 320)
    }
    prevCpRef.current = c
  }, [chapterProgress, reducedMotion])

  // Determine if we are in the tracks zone
  const inTracks = sectionProgress > 0 && sectionProgress < 1
  const track = TRACKS[activeTrackIndex]
  const accent = track?.accentColor ?? "#E23636"

  // Glow boost on high velocity
  const velGlow = Math.min(1, velocity * 4)

  if (!inTracks) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {/* Comic halftone dot overlay — very subtle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          mixBlendMode: "screen",
        }}
      />

      {/* Velocity glow vignette burst (subtle, accent color) */}
      {velGlow > 0.05 && !reducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${accent}${Math.round(velGlow * 30).toString(16).padStart(2, "0")} 0%, transparent 100%)`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Corner HUD text: top-left */}
      <div
        className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.3em] uppercase select-none"
        style={{ color: `${accent}50`, opacity: inTracks ? 1 : 0, transition: "opacity 0.5s" }}
      >
        <div>EARTH-616</div>
        <div style={{ color: `${accent}30` }}>CLASSIFIED</div>
      </div>

      {/* Corner HUD text: top-right */}
      <div
        className="absolute top-6 right-6 font-mono text-[10px] tracking-[0.3em] uppercase text-right select-none"
        style={{ color: `${accent}40` }}
      >
        <div>MULTIVERSE</div>
        <div style={{ color: `${accent}25` }}>SYS:{String(activeTrackIndex + 1).padStart(2, "0")}</div>
      </div>

      {/* Corner HUD text: bottom-left */}
      <div
        className="absolute bottom-6 left-6 font-mono text-[9px] tracking-[0.25em] uppercase select-none"
        style={{ color: `${accent}35` }}
      >
        <div>HACK-A-SOL 5.0</div>
        <div style={{ color: `${accent}22` }}>IIIT NAYA RAIPUR</div>
      </div>

      {/* Multiverse "crack" glitch flash on chapter exit */}
      {crackVisible && !reducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accent}22 0%, transparent 40%, ${accent}18 60%, transparent 100%)`,
            animation: "marvel-crack 0.32s ease-out forwards",
          }}
        />
      )}

      {/* Scan line overlay (very subtle) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.009) 3px, rgba(255,255,255,0.009) 4px)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}