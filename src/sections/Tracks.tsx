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
import { useEffect, useRef, useCallback, useMemo } from "react"
import gsap from "gsap"
import { TRACKS } from "../data/tracks"
import { CharacterArt } from "../components/CharacterArt"
import { sound } from "../utils/audio"
import { TRACK_SCROLL_VH } from "../config"

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
function exitFrac(c: number): number  { return ss(norm(c, 0.78, 1.0)) }
function textOp(c: number): number {
  if (c < 0.22) return textEnterFrac(c)
  if (c <= 0.78) return 1
  return 1 - exitFrac(c)
}
function clampVal(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

interface TracksProps {
  activeIndex: number
  chapterProgress: number
  sectionProgress: number
  debugMode?: boolean
  trackScrollVh?: number
}

const N = TRACKS.length

export function Tracks({ activeIndex, chapterProgress, sectionProgress, debugMode = false, trackScrollVh }: TracksProps) {
  const active = TRACKS[activeIndex]
  const c = chapterProgress
  const nextTrack = TRACKS[Math.min(N - 1, activeIndex + 1)]
  const lastIndexRef = useRef(activeIndex)
  const prevProgRef = useRef(sectionProgress)

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

  const headingRef = useRef<HTMLHeadingElement>(null)
  const rafRef = useRef<number>(0)

  const animFrame = useCallback(() => {
    const now = sectionProgress
    const vel = Math.abs(now - prevProgRef.current) / (1 / 60)
    prevProgRef.current = now
    if (!reducedMotion && headingRef.current) {
      const skewDeg = clampVal(vel * 800, -8, 8)
      gsap.set(headingRef.current, { skewX: skewDeg })
    }
    rafRef.current = requestAnimationFrame(animFrame)
  }, [sectionProgress, reducedMotion])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animFrame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animFrame])

  const glowScale = (() => {
    if (c < 0.22) return 0.88 + 0.12 * textEnterFrac(c)
    if (c <= 0.78) return 1
    return 1 - 0.1 * exitFrac(c)
  })()

  const bgGradient = (() => {
    const curA = active?.accentColor ?? "#E23636"
    const nextA = nextTrack?.accentColor ?? curA
    const ef = exitFrac(c)
    const opacity = 0.08 + ef * 0.04
    const hexAlpha = Math.round(opacity * 255).toString(16).padStart(2, "0")
    const chosenColor = activeIndex % 2 === 0 ? curA : nextA
    return "radial-gradient(ellipse 60% 70% at 50% 50%, " + chosenColor + hexAlpha + " 0%, transparent 100%)"
  })()

  const artOnRight = activeIndex % 2 === 0
  const textOnLeft = activeIndex % 2 === 0

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

  const lineDelay = 0.02
  function lineOp(line: number): number {
    // During HOLD (0.22 - 0.78), all text stays fully visible (opacity: 1)
    if (c >= 0.22 && c <= 0.78) return 1
    if (c < 0.22) return textOp(Math.max(0, c - line * lineDelay))
    return textOp(c)
  }
  function lineY(line: number): number {
    // During HOLD and EXIT, text is static (un-animated)
    if (c < 0.22) return (1 - ss(norm(c - line * lineDelay, 0, 0.22))) * 20
    return 0
  }

  const nameSlideX = (() => {
    if (reducedMotion) return 0
    const dir = artOnRight ? -1 : 1
    if (c < 0.22) return dir * 60 * (1 - textEnterFrac(c))
    if (c <= 0.78) return dir * (c - 0.50) * 12
    return -dir * 30 * exitFrac(c)
  })()

  return (
    <section
      id="tracks"
      className="relative w-full"
      style={{ height: "100vh" }}
    >
      <div className="relative w-full h-screen overflow-hidden">
        <div
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
          <div
            className="absolute w-[36vw] h-[36vw] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, " + (active?.accentColor ?? "#E23636") + "28 0%, transparent 70%)",
              filter: "blur(50px)",
              transform: "scale(" + glowScale + ")",
              transition: "transform 0.15s ease-out, background 0.7s",
            }}
          />
          {c < 0.22 && !reducedMotion && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "36vw",
                height: "36vw",
                border: "2px solid " + (active?.accentColor ?? "#E23636"),
                opacity: Math.max(0, 1 - c / 0.22),
                transform: "scale(" + (0.6 + (c / 0.22) * 1.4) + ")",
                transition: "none",
              }}
            />
          )}
          <p
            aria-hidden="true"
            className="absolute font-heading select-none text-center leading-none pointer-events-none"
            style={{
              fontSize: "clamp(3rem, 9vw, 7.5rem)",
              color: "transparent",
              WebkitTextStroke: "1px " + (active?.accentColor ?? "#E23636") + "25",
              letterSpacing: "0.12em",
              transform: "translateX(" + (reducedMotion ? 0 : nameSlideX) + "px)",
              opacity: c < 0.05 ? c / 0.05 : c > 0.95 ? Math.max(0, 1 - (c - 0.95) / 0.05) : 1,
              transition: "color 0.7s",
              userSelect: "none",
            }}
          >
            {active?.character.toUpperCase()}
          </p>
          {active && (!active.imagePath ? false : (active.visual ?? "image") !== "model") && (
            <CharacterArt
              track={active}
              trackIndex={activeIndex}
              chapterProgress={c}
              active={true}
              debugMode={debugMode}
            />
          )}
          <div
            className="absolute bottom-20 flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-700 pointer-events-auto"
            style={{
              borderColor: (active?.accentColor ?? "#E23636") + "50",
              background: "rgba(5,5,8,0.7)",
              backdropFilter: "blur(8px)",
              opacity: c > 0.05 && c < 0.95 ? 1 : 0,
              transition: "opacity 0.4s, border-color 0.7s",
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
              background: "rgba(5,5,8,0.75)",
              backdropFilter: "blur(8px)",
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
          <div className="relative z-10 w-full px-6 md:px-0 mt-[45vh] md:mt-0">
            <p
              className="font-body text-xs tracking-[0.5em] uppercase mb-4"
              style={{ color: active?.accentColor, opacity: lineOp(0), transform: "translateY(" + lineY(0) + "px)" }}
            >
              {active?.icon} Track {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <p
              className="font-heading text-xl tracking-[0.4em] text-white/30 uppercase mb-2 transition-all duration-700"
              style={{ opacity: lineOp(1), transform: "translateY(" + lineY(1) + "px)" }}
            >
              {active?.character}
            </p>
            <h2
              ref={headingRef}
              className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4"
              style={{ opacity: lineOp(2), transform: "translateY(" + lineY(2) + "px)", willChange: "transform, opacity" }}
            >
              {active?.name}
            </h2>
            <p
              className="font-body text-xl mb-6 transition-colors duration-700"
              style={{ color: active?.accentColor, opacity: lineOp(3), transform: "translateY(" + lineY(3) + "px)" }}
            >
              {active?.tagline}
            </p>
            <p
              className="font-body text-white/60 text-base leading-relaxed max-w-md mb-8"
              style={{ opacity: lineOp(4), transform: "translateY(" + lineY(4) + "px)" }}
            >
              {active?.description}
            </p>
            <div
              className="flex flex-wrap items-center gap-3"
              style={{ opacity: lineOp(5), transform: "translateY(" + lineY(5) + "px)" }}
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
            {debugMode && (
              <div className="mt-4 font-mono text-[9px] text-white/30 space-y-0.5">
                <div>activeIndex: {activeIndex} | c: {c.toFixed(3)} | phase: {c < 0.22 ? 'ENTER' : c <= 0.78 ? 'HOLD' : 'EXIT'} | sp: {sectionProgress.toFixed(3)}</div>
                <div>GLB: /models/{active?.id}.glb</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}