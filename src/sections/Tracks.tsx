/**
 * src/sections/Tracks.tsx  (Phase 3h - slower scroll, dwell & snap)
 * Single source of truth for track chapter state comes from App.tsx (useTrackSection).
 * Pin is managed by GSAP ScrollTrigger in useTrackSection hook.
 * Alternating sides: even index text LEFT art RIGHT; odd index text RIGHT art LEFT.
 *
 * Dwell choreography:
 *   c 0.00-0.22 ENTER : text/art slides in, opacity 0->1
 *   c 0.22-0.78 HOLD  : text static and fully visible, background/parallax animates
 *   c 0.78-1.00 EXIT  : text/art slides away, opacity 1->0
 */
import React, { useEffect, useRef, useMemo, useState } from "react"
import { TRACKS } from "../data/tracks"
import { CharacterArt } from "../components/CharacterArt"
import { sound } from "../utils/audio"
import { TRACK_SCROLL_VH } from "../config"
import { scrollStore } from "../utils/scrollStore"
import { perfStore } from "../utils/perfStore"

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

interface TracksProps {
  activeIndex: number
  chapterProgress?: number
  sectionProgress?: number
  debugMode?: boolean
  trackScrollVh?: number
}

const N = TRACKS.length

export const Tracks = React.memo(function Tracks({
  activeIndex,
  chapterProgress: _propCp,
  sectionProgress: _sp,
  debugMode = false,
  trackScrollVh,
}: TracksProps) {
  const active = TRACKS[activeIndex]
  const nextTrack = TRACKS[Math.min(N - 1, activeIndex + 1)]
  const lastIndexRef = useRef(activeIndex)

  // DOM node refs for rAF style driving & debug computed style inspection
  const containerRef   = useRef<HTMLDivElement>(null)
  const headingRef     = useRef<HTMLHeadingElement>(null)
  const textBlockRef   = useRef<HTMLDivElement>(null)
  const buttonsRef     = useRef<HTMLDivElement>(null)
  const glowDiskRef    = useRef<HTMLDivElement>(null)
  const pulseRingRef   = useRef<HTMLDivElement>(null)
  const bigNameRef     = useRef<HTMLParagraphElement>(null)
  const badgeRef       = useRef<HTMLDivElement>(null)
  const scrimRef       = useRef<HTMLDivElement>(null)
  const bgGradientRef  = useRef<HTMLDivElement>(null)
  const debugHudRef    = useRef<HTMLDivElement>(null)

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
  const textOnLeft = activeIndex % 2 === 0

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
        const textEl = textBlockRef.current
        const btnEl = buttonsRef.current
        const imgEl = container?.querySelector('[data-character-img="true"]') as HTMLElement | null
        const glowEl = glowDiskRef.current
        const scrimEl = scrimRef.current
        const bgEl = bgGradientRef.current
        const marvelEl = document.querySelector('[data-marvel-overlay="true"]') as HTMLElement | null

        const getComp = (el: Element | null) => {
          if (!el) return { opacity: '0.000', transform: 'none' }
          const cs = window.getComputedStyle(el)
          return { opacity: cs.opacity, transform: cs.transform }
        }

        const textComp = getComp(textEl)
        const btnComp = getComp(btnEl)
        const imgComp = getComp(imgEl)
        const glowComp = getComp(glowEl)
        const scrimComp = getComp(scrimEl)
        const bgComp = getComp(bgEl)
        const marvelComp = getComp(marvelEl)

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

        // Live HUD render (throttled to ~30fps for minimal debug cost)
        const now = performance.now()
        if (debugHudRef.current && now - lastHudUpdateTime > 33) {
          lastHudUpdateTime = now
          debugHudRef.current.innerHTML = `
            <div style="font-weight:bold;color:#60A5FA;margin-bottom:3px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:2px">
              TRACK 0${activeIndex + 1}: ${active?.character?.toUpperCase()} &nbsp;|&nbsp; PHASE: <span style="color:${phase === 'HOLD' ? '#34D399' : '#FBBF24'}">${phase}</span>
            </div>
            <div style="color:#FBBF24;margin-bottom:4px">
              c: <b>${c.toFixed(3)}</b> &nbsp;|&nbsp; sp: <b>${scrollStore.getSectionProgress().toFixed(3)}</b> &nbsp;|&nbsp; vel: <b>${vel.toFixed(3)}</b>
            </div>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:9px">
              <span style="color:#94A3B8">Text Block:</span><span>op=<b>${textComp.opacity}</b> tf=${textComp.transform}</span>
              <span style="color:#94A3B8">Buttons:</span><span>op=<b>${btnComp.opacity}</b> tf=${btnComp.transform}</span>
              <span style="color:#94A3B8">Char Image:</span><span>op=<b>${imgComp.opacity}</b> tf=${imgComp.transform}</span>
              <span style="color:#94A3B8">Glow Disk:</span><span>op=<b>${glowComp.opacity}</b> tf=${glowComp.transform}</span>
              <span style="color:#94A3B8">Text Scrim:</span><span>op=<b>${scrimComp.opacity}</b> tf=${scrimComp.transform}</span>
              <span style="color:#94A3B8">BG Overlay:</span><span>op=<b>${bgComp.opacity}</b> tf=${bgComp.transform}</span>
              <span style="color:#94A3B8">Marvel Overlay:</span><span>op=<b>${marvelComp.opacity}</b> tf=${marvelComp.transform}</span>
            </div>
          `
        }
      }

      rafId = requestAnimationFrame(updateFrame)
    }

    rafId = requestAnimationFrame(updateFrame)
    return () => cancelAnimationFrame(rafId)
  }, [activeIndex, active?.character, artOnRight, debugMode, reducedMotion])

  const bgGradient = (() => {
    const curA = active?.accentColor ?? "#E23636"
    const nextA = nextTrack?.accentColor ?? curA
    const chosenColor = activeIndex % 2 === 0 ? curA : nextA
    return "radial-gradient(ellipse 60% 70% at 50% 50%, " + chosenColor + "20 0%, transparent 100%)"
  })()

  const scrollToTrack = (index: number) => {
    sound.playClick()
    const el = document.getElementById("tracks")
    if (!el) return
    const pinTop = el.getBoundingClientRect().top + window.scrollY
    const viewportH = window.innerHeight
    const vh = trackScrollVh ?? TRACK_SCROLL_VH
    const target = pinTop + (index + 0.5) * (vh / 100) * viewportH
    window.scrollTo({ top: target, behavior: "smooth" })
  }

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
        <div
          ref={bgGradientRef}
          className="absolute inset-0 pointer-events-none"
          style={{ background: bgGradient, zIndex: 0 }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-700"
          style={{ backgroundColor: (active?.accentColor ?? "#E23636") + "60", zIndex: 20 }}
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
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
                style={i === activeIndex ? {
                  backgroundColor: track.accentColor,
                  borderColor: track.accentColor,
                  boxShadow: "0 0 12px " + track.accentColor,
                  transform: "scale(1.5)",
                } : {}}
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
        <div className="absolute top-8 right-8 text-right z-20 hidden md:block">
          <p className="font-heading text-8xl text-white/5 leading-none select-none">
            0{activeIndex + 1}
          </p>
          <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase">
            of {N} Tracks
          </p>
        </div>

        {/* ART HALF */}
        <div
          className={"absolute inset-y-0 hidden md:flex flex-col items-center justify-center pointer-events-none " + (artOnRight ? "right-0" : "left-0")}
          style={{ width: "55%", zIndex: 5 }}
        >
          {/* Pre-blurred glow sprite instead of filter: blur(50px) */}
          <div
            ref={glowDiskRef}
            className="absolute w-[36vw] h-[36vw] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, " + (active?.accentColor ?? "#E23636") + "35 0%, " + (active?.accentColor ?? "#E23636") + "15 45%, transparent 72%)",
              transform: "scale(var(--glow-scale, 1))",
              transition: "background 0.7s",
            }}
          />
          {/* Pulse ring on chapter enter */}
          <div
            ref={pulseRingRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "36vw",
              height: "36vw",
              border: "2px solid " + (active?.accentColor ?? "#E23636"),
              opacity: "var(--pulse-op, 0)",
              transform: "scale(var(--pulse-scale, 1))",
            }}
          />
          {/* Big watermark character name */}
          <p
            ref={bigNameRef}
            aria-hidden="true"
            className="absolute font-heading select-none text-center leading-none pointer-events-none"
            style={{
              fontSize: "clamp(3rem, 9vw, 7.5rem)",
              color: "transparent",
              WebkitTextStroke: "1px " + (active?.accentColor ?? "#E23636") + "25",
              letterSpacing: "0.12em",
              transform: "translateX(var(--name-x, 0px))",
              opacity: "var(--name-op, 1)",
              transition: "color 0.7s",
              userSelect: "none",
            }}
          >
            {active?.character.toUpperCase()}
          </p>

          {/* Character Art component */}
          {characterImagesEnabled && active && (!active.imagePath ? false : (active.visual ?? "image") !== "model") && (
            <CharacterArt
              track={active}
              trackIndex={activeIndex}
              active={true}
              debugMode={debugMode}
            />
          )}

          {/* Bottom chapter badge */}
          <div
            ref={badgeRef}
            className="absolute bottom-20 flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-700 pointer-events-auto"
            style={{
              borderColor: (active?.accentColor ?? "#E23636") + "50",
              background: "rgba(5,5,8,0.92)",
              opacity: "var(--badge-op, 1)",
              transition: "border-color 0.7s",
            }}
          >
            <span className="text-sm">{active?.icon}</span>
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: active?.accentColor }}>
              {active?.character.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-white/40 pl-2 border-l border-white/10">
              TRACK {String(activeIndex + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden h-[45vh] flex items-end justify-center pb-4 pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-sm border pointer-events-auto"
            style={{
              borderColor: (active?.accentColor ?? "#E23636") + "50",
              background: "rgba(5,5,8,0.92)",
            }}
          >
            <span className="text-sm">{active?.icon}</span>
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: active?.accentColor }}>
              {active?.character.toUpperCase()}
            </span>
          </div>
        </div>

        {/* TEXT COLUMN */}
        <div
          className={"absolute inset-y-0 flex items-center " + (textOnLeft ? "left-0 md:w-[48%] md:pl-20 md:pr-8" : "right-0 md:w-[48%] md:pr-20 md:pl-8") + " w-full"}
          style={{ zIndex: 15 }}
        >
          <div
            ref={scrimRef}
            className="absolute inset-0 hidden md:block pointer-events-none"
            style={{
              background: textOnLeft
                ? "linear-gradient(to right, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)"
                : "linear-gradient(to left, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 block md:hidden pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(5,5,8,0.92) 20%, rgba(5,5,8,0.98) 100%)" }}
          />
          <div ref={textBlockRef} className="relative z-10 w-full px-6 md:px-0 mt-[45vh] md:mt-0">
            <p
              className="font-body text-xs tracking-[0.5em] uppercase mb-4"
              style={{
                color: active?.accentColor,
                opacity: "var(--line-op-0, 1)",
                transform: "translateY(var(--line-y-0, 0px))",
              }}
            >
              {active?.icon} Track {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <p
              className="font-heading text-xl tracking-[0.4em] text-white/30 uppercase mb-2 transition-all duration-700"
              style={{
                opacity: "var(--line-op-1, 1)",
                transform: "translateY(var(--line-y-1, 0px))",
              }}
            >
              {active?.character}
            </p>
            <h2
              ref={headingRef}
              className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4"
              style={{
                opacity: "var(--line-op-2, 1)",
                transform: "translateY(var(--line-y-2, 0px)) skewX(var(--heading-skew, 0deg))",
                willChange: "transform, opacity",
              }}
            >
              {active?.name}
            </h2>
            <p
              className="font-body text-xl mb-6 transition-colors duration-700"
              style={{
                color: active?.accentColor,
                opacity: "var(--line-op-3, 1)",
                transform: "translateY(var(--line-y-3, 0px))",
              }}
            >
              {active?.tagline}
            </p>
            <p
              className="font-body text-white/60 text-base leading-relaxed max-w-md mb-8"
              style={{
                opacity: "var(--line-op-4, 1)",
                transform: "translateY(var(--line-y-4, 0px))",
              }}
            >
              {active?.description}
            </p>
            <div
              ref={buttonsRef}
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
                style={{ borderColor: (active?.accentColor ?? "") + "60", color: active?.accentColor, backgroundColor: (active?.accentColor ?? "") + "10" }}
              >
                <span>MISSION PROTOCOLS</span>
                <span>&#x2192;</span>
              </a>
              <button
                type="button"
                data-magnetic
                onClick={() => scrollToTrack(0)}
                onMouseEnter={() => sound.playHover()}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-sm font-mono text-xs tracking-wider uppercase text-white/70 hover:text-white hover:border-white/50 transition-all bg-white/5 hover:bg-white/10"
              >
                <span>&#x229E;</span>
                <span>ALL {N} TRACKS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostics panel in ?debug=1 */}
        {debugMode && (
          <div
            ref={debugHudRef}
            className="fixed bottom-4 left-4 z-[9999] font-mono text-[9.5px] bg-black/90 text-emerald-400 p-3 rounded border border-emerald-500/40 shadow-2xl max-w-md pointer-events-none leading-relaxed"
            style={{ backdropFilter: "blur(8px)" }}
          />
        )}
      </div>
    </section>
  )
})