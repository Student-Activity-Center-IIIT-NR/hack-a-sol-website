/**
 * src/sections/Tracks.tsx  (Phase 3h - slower scroll, dwell & snap)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for track chapter state comes from App.tsx (useTrackSection).
 * Pin is managed by GSAP ScrollTrigger in useTrackSection hook.
 *
 * Performance Architecture (No-Lag Transitions):
 * - ALL five track chapters (DOM text, buttons, CharacterArt images) are created once
 *   and kept mounted permanently.
 * - Visibility is toggled via `data-active` attribute plus CSS opacity/transform transitions.
 * - ZERO mounting/unmounting on scroll.
 * - DOM styles driven by ONE continuous rAF writer setting CSS custom variables on the container.
 * - Alternating sides:
 *     Index 0, 2, 4 (even): text on LEFT, art on RIGHT
 *     Index 1, 3 (odd):    text on RIGHT, art on LEFT
 * - Dwell choreography:
 *     c 0.00-0.22 ENTER : text/art slides in, opacity 0->1
 *     c 0.22-0.78 HOLD  : text static and fully visible (opacity >= 0.95), background/parallax animates
 *     c 0.78-1.00 EXIT  : text/art slides away, opacity 1->0
 * - Clean All-Tracks Overview Grid (5 cards laid out cleanly).
 */

import React, { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { TRACKS, type Track } from "../data/tracks"
import { CharacterArt } from "../components/CharacterArt"
import { sound } from "../utils/audio"
import { TRACK_SCROLL_VH, TRACK_LAYOUT } from "../config"
import { scrollStore } from "../utils/scrollStore"
import { perfStore } from "../utils/perfStore"
import { ArtTuner } from "../components/ArtTuner"

function ss(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number): number {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}
function textEnterFrac(c: number): number {
  if (c < 0.03) return 0
  if (c >= 0.22) return 1
  return ss((c - 0.03) / (0.22 - 0.03))
}
function exitFrac(c: number): number {
  return ss(norm(c, 0.78, 1.0))
}
function clampVal(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

const N = TRACKS.length

interface ChapterSlideProps {
  track: Track
  index: number
  isActive: boolean
  debugMode: boolean
  characterImagesEnabled: boolean
  onOpenGrid: () => void
}

/** Memoized individual chapter slide to prevent re-rendering the big tree */
const ChapterSlide = React.memo(function ChapterSlide({
  track,
  index,
  isActive,
  debugMode,
  characterImagesEnabled,
  onOpenGrid,
}: ChapterSlideProps) {
  // Unified layout across all chapters (mirrored on alternating sides)
  const artOnRight = index % 2 === 0
  const textOnLeft = index % 2 === 0
  const ac = track.accentColor

  return (
    <div
      data-track-index={index}
      data-active={isActive ? "true" : "false"}
      className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
      style={{
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
        zIndex: isActive ? 10 : 1,
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* ── ART HALF (width 55%) ── */}
      <div
        className={
          "absolute inset-y-0 hidden md:flex flex-col items-center justify-center pointer-events-none " +
          (artOnRight ? "right-0" : "left-0")
        }
        style={{ width: TRACK_LAYOUT.artHalfWidth, zIndex: 5 }}
      >
        {/* Glow disk */}
        <div
          data-glow-disk="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${TRACK_LAYOUT.glowDiskSizeVw}vw`,
            height: `${TRACK_LAYOUT.glowDiskSizeVw}vw`,
            background: `radial-gradient(circle, ${ac}35 0%, ${ac}15 45%, transparent 72%)`,
            transform: "scale(var(--glow-scale, 1))",
            transition: "background 0.5s ease",
          }}
        />

        {/* The single signature ring */}
        <div
          data-pulse-ring="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${TRACK_LAYOUT.signatureRingSizeVw}vw`,
            height: `${TRACK_LAYOUT.signatureRingSizeVw}vw`,
            border: `${TRACK_LAYOUT.signatureRingBorderWidth} solid ${ac}`,
            opacity: "var(--pulse-op, 0)",
            transform: "scale(var(--pulse-scale, 1))",
          }}
        />

        {/* Big watermark character name */}
        <p
          aria-hidden="true"
          className="absolute font-heading select-none text-center leading-none pointer-events-none"
          style={{
            fontSize: TRACK_LAYOUT.watermarkFontSize,
            color: "transparent",
            WebkitTextStroke: `1px ${ac}${TRACK_LAYOUT.watermarkStrokeOpacity}`,
            letterSpacing: TRACK_LAYOUT.watermarkLetterSpacing,
            transform: "translateX(var(--name-x, 0px))",
            opacity: "var(--name-op, 1)",
            userSelect: "none",
          }}
        >
          {track.character.toUpperCase()}
        </p>

        {/* Character Art component — kept permanently mounted */}
        {characterImagesEnabled && (
          <CharacterArt
            track={track}
            trackIndex={index}
            active={isActive}
            debugMode={debugMode}
            artOnRight={artOnRight}
          />
        )}

        {/* Bottom chapter badge */}
        <div
          className="absolute bottom-20 flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-700 pointer-events-auto"
          style={{
            borderColor: ac + "50",
            background: "rgba(5,5,8,0.92)",
            opacity: "var(--badge-op, 1)",
          }}
        >
          <span className="text-sm">{track.icon}</span>
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: ac }}>
            {track.character.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] text-white/40 pl-2 border-l border-white/10">
            TRACK {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── MOBILE ART BADGE ── */}
      <div className="md:hidden h-[45vh] flex items-end justify-center pb-4 pointer-events-none">
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-sm border pointer-events-auto"
          style={{
            borderColor: ac + "50",
            background: "rgba(5,5,8,0.92)",
          }}
        >
          <span className="text-sm">{track.icon}</span>
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: ac }}>
            {track.character.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── TEXT COLUMN ── */}
      <div
        className={
          "absolute inset-y-0 flex items-center " +
          (textOnLeft
            ? "left-0 md:w-[48%] md:pl-20 md:pr-8"
            : "right-0 md:w-[48%] md:pr-20 md:pl-8") +
          " w-full"
        }
        style={{ zIndex: 15 }}
      >
        {/* Scrim gradient */}
        <div
          className="absolute inset-0 hidden md:block pointer-events-none"
          style={{
            background: textOnLeft
              ? "linear-gradient(to right, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)"
              : "linear-gradient(to left, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 block md:hidden pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(5,5,8,0.92) 20%, rgba(5,5,8,0.98) 100%)",
          }}
        />

        {/* Text block */}
        <div
          data-text-block="true"
          className="relative z-10 w-full px-6 md:px-0 mt-[45vh] md:mt-0"
        >
          <p
            className={TRACK_LAYOUT.labelChipClass}
            style={{
              color: ac,
              opacity: "var(--line-op-0, 1)",
              transform: "translateY(var(--line-y-0, 0px))",
            }}
          >
            {track.icon} Track {String(index + 1).padStart(2, "0")}
          </p>
          <p
            className={TRACK_LAYOUT.characterSubtitleClass}
            style={{
              opacity: "var(--line-op-1, 1)",
              transform: "translateY(var(--line-y-1, 0px))",
            }}
          >
            {track.character}
          </p>
          <h2
            className={TRACK_LAYOUT.titleClass}
            style={{
              opacity: "var(--line-op-2, 1)",
              transform: "translateY(var(--line-y-2, 0px)) skewX(var(--heading-skew, 0deg))",
              willChange: "transform, opacity",
            }}
          >
            {track.name}
          </h2>
          <p
            className={TRACK_LAYOUT.taglineClass}
            style={{
              color: ac,
              opacity: "var(--line-op-3, 1)",
              transform: "translateY(var(--line-y-3, 0px))",
            }}
          >
            {track.tagline}
          </p>
          <p
            className={TRACK_LAYOUT.descriptionClass}
            style={{
              opacity: "var(--line-op-4, 1)",
              transform: "translateY(var(--line-y-4, 0px))",
            }}
          >
            {track.description}
          </p>
          <div
            data-buttons-block="true"
            className="flex flex-wrap items-center gap-3"
            style={{
              opacity: "var(--line-op-5, 1)",
              transform: "translateY(var(--line-y-5, 0px))",
            }}
          >
            <a
              href="#timeline"
              data-magnetic
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-sm font-mono text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                borderColor: ac + "60",
                color: ac,
                backgroundColor: ac + "10",
              }}
            >
              <span>MISSION PROTOCOLS</span>
              <span>&#x2192;</span>
            </a>
            <button
              type="button"
              data-magnetic
              onClick={onOpenGrid}
              onMouseEnter={() => sound.playHover()}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-sm font-mono text-xs tracking-wider uppercase text-white/70 hover:text-white hover:border-white/50 transition-all bg-white/5 hover:bg-white/10"
            >
              <span>&#x229E;</span>
              <span>ALL {N} TRACKS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

interface TracksProps {
  activeIndex: number
  chapterProgress?: number
  sectionProgress?: number
  debugMode?: boolean
  trackScrollVh?: number
}

export const Tracks = React.memo(function Tracks({
  activeIndex,
  chapterProgress: _propCp,
  sectionProgress: _sp,
  debugMode = false,
  trackScrollVh,
}: TracksProps) {
  const active = TRACKS[activeIndex] || TRACKS[0]
  const nextTrack = TRACKS[Math.min(N - 1, activeIndex + 1)] || active
  const lastIndexRef = useRef(activeIndex)

  const [gridOpen, setGridOpen] = useState(false)

  // DOM node refs for rAF style driving & debug computed style inspection
  const containerRef  = useRef<HTMLDivElement>(null)
  const bgGradientRef = useRef<HTMLDivElement>(null)
  const debugHudRef   = useRef<HTMLDivElement>(null)

  // Toggle from perfStore
  const [characterImagesEnabled, setCharacterImagesEnabled] = useState(true)
  useEffect(() => {
    return perfStore.subscribe((t) => setCharacterImagesEnabled(t.characterImages))
  }, [])

  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )

  useEffect(() => {
    if (lastIndexRef.current !== activeIndex) {
      sound.playTrackSwitch()
      lastIndexRef.current = activeIndex
    }
  }, [activeIndex])

  const artOnRight = activeIndex % 2 === 0

  // Continuous rAF loop to drive DOM styles via CSS custom properties on container
  useEffect(() => {
    let rafId: number
    let lastWarnTime = 0
    let lastHudUpdateTime = 0

    const updateFrame = () => {
      const c = scrollStore.getChapterProgress()
      const vel = scrollStore.getVelocity()
      const phase = c < 0.22 ? "ENTER" : c <= 0.78 ? "HOLD" : "EXIT"
      const ef = exitFrac(c)

      const container = containerRef.current
      if (container) {
        // Line opacities and translateY offsets
        const lineDelay = 0.02
        for (let i = 0; i <= 5; i++) {
          let op = 1.0
          let y = 0
          if (c < 0.22) {
            const lineC = Math.max(0, c - i * lineDelay)
            op = textEnterFrac(lineC)
            y = (1 - ss(norm(lineC, 0, 0.22))) * 20
          } else if (c <= 0.78) {
            op = 1.0
            y = 0
          } else {
            op = Math.max(0, 1 - ef)
            y = 0
          }
          container.style.setProperty(`--line-op-${i}`, op.toFixed(4))
          container.style.setProperty(`--line-y-${i}`, `${y.toFixed(2)}px`)
        }

        // Glow scale
        let gs = 1
        if (c < 0.22) {
          gs = 0.88 + 0.12 * textEnterFrac(c)
        } else if (c <= 0.78) {
          gs = 1
        } else {
          gs = 1 - 0.1 * ef
        }
        container.style.setProperty("--glow-scale", gs.toFixed(4))

        // Pulse ring
        const pulseOp = c < 0.22 && !reducedMotion ? Math.max(0, 1 - c / 0.22) : 0
        const pulseSc = 0.6 + (c / 0.22) * 1.4
        container.style.setProperty("--pulse-op", pulseOp.toFixed(4))
        container.style.setProperty("--pulse-scale", pulseSc.toFixed(4))

        // Big watermark character name
        const nameOp = c < 0.05 ? c / 0.05 : c > 0.95 ? Math.max(0, 1 - (c - 0.95) / 0.05) : 1
        const dir = artOnRight ? -1 : 1
        let nameX = 0
        if (!reducedMotion) {
          if (c < 0.22) nameX = dir * 60 * (1 - textEnterFrac(c))
          else if (c <= 0.78) nameX = dir * (c - 0.50) * 12
          else nameX = -dir * 30 * ef
        }
        container.style.setProperty("--name-op", nameOp.toFixed(4))
        container.style.setProperty("--name-x", `${nameX.toFixed(2)}px`)

        // Bottom badge opacity
        const badgeOp = c > 0.05 && c < 0.95 ? 1 : 0
        container.style.setProperty("--badge-op", String(badgeOp))

        // Heading skew from velocity
        const skew = !reducedMotion ? clampVal(vel * 8, -8, 8) : 0
        container.style.setProperty("--heading-skew", `${skew.toFixed(2)}deg`)
      }

      // Debug mode checks and live HUD updates
      if (debugMode) {
        const activeSlide = container?.querySelector(`[data-track-index="${activeIndex}"]`)
        const textEl = activeSlide?.querySelector('[data-text-block="true"]')
        const btnEl = activeSlide?.querySelector('[data-buttons-block="true"]')
        const imgEl = activeSlide?.querySelector('[data-character-img="true"]')

        const getComp = (el: Element | null | undefined) => {
          if (!el) return { opacity: "0.000", transform: "none" }
          const cs = window.getComputedStyle(el)
          return { opacity: cs.opacity, transform: cs.transform }
        }

        const textComp = getComp(textEl)
        const btnComp = getComp(btnEl)
        const imgComp = getComp(imgEl)

        // Console.warn if text/buttons/image opacity is below 0.95 while 0.22 <= c <= 0.78
        if (c >= 0.22 && c <= 0.78) {
          const tOp = parseFloat(textComp.opacity)
          const bOp = parseFloat(btnComp.opacity)
          const iOp = parseFloat(imgComp.opacity)
          const now = performance.now()
          if ((tOp < 0.95 || bOp < 0.95 || iOp < 0.95) && now - lastWarnTime > 1000) {
            lastWarnTime = now
            console.warn(
              `[Tracks Debug Warning] Track 0${activeIndex + 1} (${active?.character}) during HOLD (c=${c.toFixed(3)}): ` +
                `text opacity=${tOp.toFixed(3)}, buttons opacity=${bOp.toFixed(3)}, image opacity=${iOp.toFixed(3)} (< 0.95)`
            )
          }
        }

        // Live HUD render
        const now = performance.now()
        if (debugHudRef.current && now - lastHudUpdateTime > 40) {
          lastHudUpdateTime = now
          debugHudRef.current.innerHTML = `
            <div style="font-weight:bold;color:#60A5FA;margin-bottom:3px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:2px">
              TRACK 0${activeIndex + 1}: ${active?.character?.toUpperCase()} &nbsp;|&nbsp; PHASE: <span style="color:${phase === "HOLD" ? "#34D399" : "#FBBF24"}">${phase}</span>
            </div>
            <div style="color:#FBBF24;margin-bottom:4px">
              c: <b>${c.toFixed(3)}</b> &nbsp;|&nbsp; sp: <b>${scrollStore.getSectionProgress().toFixed(3)}</b> &nbsp;|&nbsp; vel: <b>${vel.toFixed(3)}</b>
            </div>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:9px">
              <span style="color:#94A3B8">Text Block:</span><span>op=<b>${textComp.opacity}</b> tf=${textComp.transform}</span>
              <span style="color:#94A3B8">Buttons:</span><span>op=<b>${btnComp.opacity}</b> tf=${btnComp.transform}</span>
              <span style="color:#94A3B8">Char Image:</span><span>op=<b>${imgComp.opacity}</b> tf=${imgComp.transform}</span>
            </div>
          `
        }
      }

      rafId = requestAnimationFrame(updateFrame)
    }

    rafId = requestAnimationFrame(updateFrame)
    return () => cancelAnimationFrame(rafId)
  }, [activeIndex, active?.character, artOnRight, debugMode, reducedMotion])

  const bgGradient = useMemo(() => {
    const curA = active?.accentColor ?? "#E23636"
    const nextA = nextTrack?.accentColor ?? curA
    const chosenColor = activeIndex % 2 === 0 ? curA : nextA
    return `radial-gradient(ellipse 60% 70% at 50% 50%, ${chosenColor}20 0%, transparent 100%)`
  }, [active?.accentColor, nextTrack?.accentColor, activeIndex])

  const scrollToTrack = useCallback(
    (index: number) => {
      sound.playClick()
      const el = document.getElementById("tracks")
      if (!el) return
      const pinTop = el.getBoundingClientRect().top + window.scrollY
      const viewportH = window.innerHeight
      const vh = trackScrollVh ?? TRACK_SCROLL_VH
      const target = pinTop + (index + 0.5) * (vh / 100) * viewportH
      window.scrollTo({ top: target, behavior: "smooth" })
    },
    [trackScrollVh]
  )

  return (
    <section
      id="tracks"
      className="relative w-full"
      style={{ height: "100vh" }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Background Accent Gradient */}
        <div
          ref={bgGradientRef}
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: bgGradient, zIndex: 0 }}
        />

        {/* Left vertical accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-700"
          style={{ backgroundColor: (active?.accentColor ?? "#E23636") + "60", zIndex: 20 }}
        />

        {/* Left Rail Dots (Derived from all tracks) */}
        <div className={TRACK_LAYOUT.leftRailPosition}>
          {TRACKS.map((track, i) => (
            <button
              key={track.id}
              type="button"
              data-magnetic
              onClick={() => scrollToTrack(i)}
              onMouseEnter={() => sound.playHover()}
              className="group flex items-center gap-3 text-left focus:outline-none"
              aria-label={"Jump to " + track.name}
            >
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/30 transition-all duration-500 group-hover:scale-125"
                style={
                  i === activeIndex
                    ? {
                        backgroundColor: track.accentColor,
                        borderColor: track.accentColor,
                        boxShadow: `0 0 12px ${track.accentColor}`,
                        transform: "scale(1.5)",
                      }
                    : {}
                }
              />
              <span
                className="font-mono text-[10px] tracking-widest uppercase transition-opacity duration-300 hidden md:inline opacity-0 group-hover:opacity-100 text-white/80"
                style={{ color: track.accentColor }}
              >
                0{i + 1} // {track.character}
              </span>
            </button>
          ))}
        </div>

        {/* Top-Right Chapter Counter */}
        <div className="absolute top-8 right-8 text-right z-20 hidden md:block">
          <p className="font-heading text-8xl text-white/5 leading-none select-none">
            0{activeIndex + 1}
          </p>
          <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase">
            of {N} Tracks
          </p>
        </div>

        {/* All Five Chapters Kept Mounted In DOM Permanently (No Mount Churn) */}
        <div className="chapters-container absolute inset-0">
          {TRACKS.map((track, i) => (
            <ChapterSlide
              key={track.id}
              track={track}
              index={i}
              isActive={i === activeIndex}
              debugMode={debugMode}
              characterImagesEnabled={characterImagesEnabled}
              onOpenGrid={() => {
                sound.playClick()
                setGridOpen(true)
              }}
            />
          ))}
        </div>

        {/* ── ALL TRACKS OVERVIEW GRID (5 Cards Laid Out Cleanly) ── */}
        {gridOpen && (
          <div
            className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-label="All Tracks Overview"
          >
            <div className="relative w-full max-w-6xl bg-[#08080c] border border-white/15 rounded-sm p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-marvel-red uppercase">
                    Multiverse Spectrum // Index
                  </p>
                  <h3 className="font-heading text-3xl sm:text-4xl text-white tracking-wide">
                    ALL {N} SPECIALISED TRACKS
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGridOpen(false)}
                  className="px-3 py-1.5 border border-white/20 rounded font-mono text-xs uppercase text-white/60 hover:text-white hover:border-white/50 transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              {/* 5 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {TRACKS.map((t, i) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      scrollToTrack(i)
                      setGridOpen(false)
                    }}
                    onMouseEnter={() => sound.playHover()}
                    className="group cursor-pointer border rounded-sm p-4 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between"
                    style={{
                      borderColor: i === activeIndex ? t.accentColor : "rgba(255,255,255,0.1)",
                      boxShadow: i === activeIndex ? `0 0 20px ${t.accentColor}25` : "none",
                    }}
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between mb-3 text-xs font-mono">
                        <span style={{ color: t.accentColor }}>0{i + 1}</span>
                        <span className="text-white/40">{t.icon}</span>
                      </div>

                      {/* Character image thumbnail */}
                      <div className="w-full h-32 flex items-center justify-center mb-3 overflow-hidden rounded bg-black/40">
                        <img
                          src={t.imagePath ?? `/characters/${t.id}.webp`}
                          alt={t.character}
                          className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Title & Character */}
                      <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-0.5">
                        {t.character}
                      </p>
                      <h4 className="font-heading text-xl text-white mb-2 group-hover:text-white">
                        {t.name}
                      </h4>
                      <p className="font-body text-xs text-white/50 line-clamp-3 leading-relaxed mb-4">
                        {t.tagline}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    <div
                      className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] tracking-wider uppercase"
                      style={{ color: t.accentColor }}
                    >
                      <span>{i === activeIndex ? "CURRENT" : "SELECT"}</span>
                      <span>&#x2192;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics panel in ?debug=1 */}
        {debugMode && (
          <div
            ref={debugHudRef}
            className="fixed bottom-4 left-4 z-[9999] font-mono text-[9.5px] bg-black/90 text-emerald-400 p-3 rounded border border-emerald-500/40 shadow-2xl max-w-md pointer-events-none leading-relaxed"
            style={{ backdropFilter: "blur(8px)" }}
          />
        )}
        {/* Character Art Tuner (?art=tune) */}
        <ArtTuner />
      </div>
    </section>
  )
})