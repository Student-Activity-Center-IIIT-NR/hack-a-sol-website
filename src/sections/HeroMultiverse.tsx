/**
 * src/sections/HeroMultiverse.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Minimal Marvel "Rift" hero — redesigned from the Breach/sci-fi HeroMultiverse.
 *
 * What was removed:
 *   - WebGL / HeroSceneMultiverse canvas (no more per-section canvas)
 *   - All tick rings, segmented rings, polygon overlays, orbit ellipse
 *   - HUD orbit tags (DIMENSION // 616, CALIBRATION // 98.7%, etc.)
 *   - Corner brackets, crosshair lines, grid, red haze box
 *   - Mouse X/Y readout (xyRef, onMove XY display)
 *   - Dust canvas, animated orbs
 *   - "VIEW TRACKS / BECOME A SPONSOR" old links
 *   - Old bottom HUD (MISSION // 005, LAT/LNG, SIGNAL STABLE X Y)
 *
 * What is here:
 *   - Near-black (#07070b) background with ONE soft radial red glow
 *   - SVG lens-shaped rift (pointed top/bottom, tilted -3deg)
 *   - Five vertical color bands from TRACKS accentColor
 *   - White 2px core line + layered-gradient 16px red glow (no filter blur)
 *   - Slow rift flicker (opacity 0.85 → 1 over 5s CSS animation)
 *   - Five character silhouettes in a row (from public/hero/sil-<id>.webp)
 *   - Left text column: eyebrow, kicker, headline, tagline, CTAs
 *   - One quiet bottom HUD row: date left, EARTH-616 / ENTERING... right
 *   - GSAP intro sequence + scroll parallax + mouse parallax
 *   - Leva tuner (with ?debug=1&hero=tune)
 *   - Fully off for prefers-reduced-motion
 *
 * Performance:
 *   - Only transform and opacity animate — no runtime filter/blur/mask on large layers
 *   - Width changes via scaleX only
 *   - Canvas/3D: none (uses HTML/SVG/CSS only)
 *
 * @see src/config.ts for HERO_COPY, HERO_RIFT, HERO_VISUAL
 * @see scripts/prepare-hero-silhouettes.mjs for silhouette generation
 */

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useControls, button } from 'leva'
import { HERO_COPY, HERO_RIFT, HERO_VISUAL, EVENT } from '../config'
import { TRACKS } from '../data/tracks'
import './hero-multiverse/HeroMultiverse.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroMultiverseProps {
  /** False while the loading screen is showing; the opening sequence starts when it flips to true. */
  ready: boolean
}

/** Derive rift band colors from TRACKS in order */
const RIFT_BANDS = TRACKS.map((t) => t.accentColor)

/** Check if a silhouette asset is expected to exist */
const SIL_ENABLED = HERO_VISUAL === 'rift+silhouettes'

export function HeroMultiverse({ ready }: HeroMultiverseProps) {
  const rootRef     = useRef<HTMLElement>(null)
  const riftRef     = useRef<SVGSVGElement>(null)
  const silRowRef   = useRef<HTMLDivElement>(null)
  const textRef     = useRef<HTMLDivElement>(null)
  const bottomRightRef = useRef<HTMLSpanElement>(null)
  const playedRef   = useRef(false)
  const scrollProgRef = useRef(0)

  // Debug / tune mode: ?debug=1&hero=tune
  const isTuneMode = useMemo(() => {
    if (typeof window === 'undefined') return false
    const p = new URLSearchParams(window.location.search)
    return p.get('debug') === '1' && p.get('hero') === 'tune'
  }, [])

  // Leva tuning sliders — only rendered/active when ?debug=1&hero=tune
  const [tuneVals, setTuneVals] = useState<{
    riftX: number
    riftWidthVw: number
    riftGlowPx: number
    silhouetteHeightVh: number
    silhouetteBottomPx: number
    silhouetteGapPx: number
    textColumnWidthVw: number
    headlineMaxVw: number
  }>({ ...HERO_RIFT })
  const levaControls = useControls(
    'Hero Rift Tuner',
    {
      riftX:              { value: HERO_RIFT.riftX,              min: 0.4, max: 0.95, step: 0.01, label: 'Rift center x (vw)' },
      riftWidthVw:        { value: HERO_RIFT.riftWidthVw,        min: 4,   max: 40,   step: 0.5,  label: 'Rift width (vw)' },
      riftGlowPx:         { value: HERO_RIFT.riftGlowPx,         min: 4,   max: 60,   step: 1,    label: 'Glow px' },
      silhouetteHeightVh: { value: HERO_RIFT.silhouetteHeightVh, min: 0.2, max: 0.8,  step: 0.01, label: 'Sil height (vh)' },
      silhouetteBottomPx: { value: HERO_RIFT.silhouetteBottomPx, min: -200, max: 200, step: 4,    label: 'Sil bottom (px)' },
      silhouetteGapPx:    { value: HERO_RIFT.silhouetteGapPx,    min: 0,   max: 80,   step: 4,    label: 'Sil gap (px)' },
      textColumnWidthVw:  { value: HERO_RIFT.textColumnWidthVw,  min: 0.2, max: 0.6,  step: 0.01, label: 'Text col width (vw)' },
      headlineMaxVw:      { value: HERO_RIFT.headlineMaxVw,       min: 4,   max: 12,   step: 0.1,  label: 'Headline max (vw)' },
      'Copy values': button(() => {
        const vals = {
          riftX:              levaControls.riftX,
          riftWidthVw:        levaControls.riftWidthVw,
          riftGlowPx:         levaControls.riftGlowPx,
          silhouetteHeightVh: levaControls.silhouetteHeightVh,
          silhouetteBottomPx: levaControls.silhouetteBottomPx,
          silhouetteGapPx:    levaControls.silhouetteGapPx,
          textColumnWidthVw:  levaControls.textColumnWidthVw,
          headlineMaxVw:      levaControls.headlineMaxVw,
        }
        console.log('// Paste into src/config.ts > HERO_RIFT:\n', JSON.stringify(vals, null, 2))
      }),
    },
    { collapsed: !isTuneMode }
  )

  // Keep tuneVals in sync with leva sliders
  useEffect(() => {
    if (!isTuneMode) return
    setTuneVals({
      riftX:              levaControls.riftX,
      riftWidthVw:        levaControls.riftWidthVw,
      riftGlowPx:         levaControls.riftGlowPx,
      silhouetteHeightVh: levaControls.silhouetteHeightVh,
      silhouetteBottomPx: levaControls.silhouetteBottomPx,
      silhouetteGapPx:    levaControls.silhouetteGapPx,
      textColumnWidthVw:  levaControls.textColumnWidthVw,
      headlineMaxVw:      levaControls.headlineMaxVw,
    })
  }, [isTuneMode, levaControls])

  const cfg = isTuneMode ? tuneVals : HERO_RIFT

  // Set hidden start states before paint to avoid flash
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Text lines
      gsap.set('.hm-rift .hm-eyebrow, .hm-rift .hm-kicker', { opacity: 0, y: 10 })
      gsap.set('.hm-rift .hm-line-enter, .hm-rift .hm-line-main', { yPercent: 110 })
      gsap.set('.hm-rift .hm-tagline, .hm-rift .hm-cta-row', { opacity: 0, y: 12 })
      // Rift: start collapsed
      gsap.set('.hm-rift .rift-inner', { scaleX: 0, scaleY: 0 })
      gsap.set('.hm-rift .rift-bands', { opacity: 0 })
      // Silhouettes
      gsap.set('.hm-rift .sil-item', { opacity: 0, y: '6vh' })
      // Bottom HUD
      gsap.set('.hm-rift .hm-bottom-hud', { opacity: 0 })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Opening sequence — plays once loading is done
  useEffect(() => {
    if (!ready || playedRef.current) return
    playedRef.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Immediately reveal everything for reduced-motion users
      gsap.set('.hm-rift .rift-inner',   { scaleX: 1, scaleY: 1, opacity: 1 })
      gsap.set('.hm-rift .rift-bands',   { opacity: 1 })
      gsap.set('.hm-rift .sil-item',     { opacity: 0.95, y: 0 })
      gsap.set('.hm-rift .hm-eyebrow, .hm-rift .hm-kicker', { opacity: 1, y: 0 })
      gsap.set('.hm-rift .hm-line-enter, .hm-rift .hm-line-main', { yPercent: 0 })
      gsap.set('.hm-rift .hm-tagline, .hm-rift .hm-cta-row', { opacity: 1, y: 0 })
      gsap.set('.hm-rift .hm-bottom-hud', { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 0.0s — black (nothing)
      // 0.3s — rift line ignites: scaleY 0 → 1
      tl.to('.hm-rift .rift-inner', {
        scaleY: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, 0.3)

      // 0.8s — rift opens: scaleX → final width
      tl.to('.hm-rift .rift-inner', {
        scaleX: 1,
        duration: 0.7,
        ease: 'expo.out',
      }, 0.8)

      // 1.0s — color bands fade in
      tl.to('.hm-rift .rift-bands', {
        opacity: 1,
        duration: 0.6,
      }, 1.0)

      // 1.2–2.0s — silhouettes rise (stagger 0.12s)
      tl.to('.hm-rift .sil-item', {
        opacity: 0.95,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      }, 1.2)

      // 1.6–2.4s — text lines stagger in
      tl.to('.hm-rift .hm-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 1.6)
      tl.to('.hm-rift .hm-kicker',  { opacity: 1, y: 0, duration: 0.6 }, 1.75)
      tl.to('.hm-rift .hm-line-enter', { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 1.9)
      tl.to('.hm-rift .hm-line-main',  { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 2.0)
      tl.to('.hm-rift .hm-tagline',  { opacity: 1, y: 0, duration: 0.6 }, 2.1)
      tl.to('.hm-rift .hm-cta-row', { opacity: 1, y: 0, duration: 0.6 }, 2.2)

      // Bottom HUD
      tl.to('.hm-rift .hm-bottom-hud', { opacity: 1, duration: 0.8 }, 1.8)
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  // Scroll effects: rift widens to 40vw and fades, silhouettes scale/fade, text dims
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          scrollProgRef.current = self.progress
          // Bottom-right text crossfade
          if (bottomRightRef.current) {
            if (self.progress > 0.5) {
              bottomRightRef.current.textContent = HERO_COPY.bottomRightScroll
            } else {
              bottomRightRef.current.textContent = HERO_COPY.bottomRight
            }
          }
        },
      })

      // Rift: widen to 40vw and fade out on scroll
      gsap.to('.hm-rift .rift-inner', {
        scaleX: 40 / cfg.riftWidthVw, // scale ratio to reach 40vw
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '80% top',
          scrub: true,
        },
      })

      // Silhouettes: scale and fade out
      gsap.to('.hm-rift .sil-item', {
        scaleY: 1.06,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '70% top',
          scrub: true,
        },
      })

      // Text: dims to 40% and moves up 3vh
      gsap.to('.hm-rift .hm-text-col', {
        opacity: 0.4,
        y: '-3vh',
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '60% top',
          scrub: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready, cfg.riftWidthVw])

  // Mouse parallax: rift ±4px, silhouettes ±8px
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const riftEl = riftRef.current
    const silEl  = silRowRef.current
    if (!riftEl || !silEl) return

    const riftMoveX = gsap.quickTo(riftEl,  'x', { duration: 1.2, ease: 'power3.out' })
    const riftMoveY = gsap.quickTo(riftEl,  'y', { duration: 1.2, ease: 'power3.out' })
    const silMoveX  = gsap.quickTo(silEl,   'x', { duration: 1.4, ease: 'power3.out' })
    const silMoveY  = gsap.quickTo(silEl,   'y', { duration: 1.4, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5)
      const ny = (e.clientY / window.innerHeight - 0.5)
      riftMoveX(nx *  4)
      riftMoveY(ny *  4)
      silMoveX (nx * -8)
      silMoveY (ny * -8)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // ── CSS custom property updates for tune mode
  const textColStyle: React.CSSProperties = {
    maxWidth: `${cfg.textColumnWidthVw * 100}vw`,
    '--headline-max-vw': `${cfg.headlineMaxVw}vw`,
  } as React.CSSProperties

  const riftWrapStyle: React.CSSProperties = {
    left: `${cfg.riftX * 100}vw`,
  }

  // Rift dimensions: half-width = riftWidthVw/2 vw, height = riftWidthVw * 3.5
  const riftHalfW = cfg.riftWidthVw / 2   // vw
  const riftH     = cfg.riftWidthVw * 3.5  // vw (tall lens)

  // SVG lens path (pointed top/bottom, lens shape)
  // We use vw-relative units via viewBox, actual size in CSS
  const vbW = 100  // viewBox width units = riftWidthVw vw
  const vbH = 350  // viewBox height units (aspect = riftH/riftWidthVw * 100)
  const cx = vbW / 2
  const lensPath = `M${cx},0 Q${vbW * 1.18},${vbH * 0.5} ${cx},${vbH} Q${-vbW * 0.18},${vbH * 0.5} ${cx},0 Z`

  // Glow shadow: layered box-shadow-like effect via SVG filter-less gradient rings
  const glow = cfg.riftGlowPx

  // Silhouette layout: 5 items from 52vw to 96vw
  const silStart = 52  // vw
  const silEnd   = 96  // vw
  const n = TRACKS.length
  const silStep  = (silEnd - silStart) / (n - 1)

  return (
    <section
      id="hero"
      ref={rootRef}
      className="hm-rift"
      aria-label={`${EVENT.name} — Enter the Multiverse`}
    >
      {/* ── Background: near-black with soft red radial glow ── */}
      <div className="hm-rift__bg" aria-hidden="true" />

      {/* ── THE RIFT (SVG lens shape, right side) ── */}
      <div
        className="hm-rift__rift-wrap"
        style={riftWrapStyle}
        aria-hidden="true"
      >
        {/* Glow rings — layered gradients, no blur filter */}
        <div
          className="hm-rift__glow-outer"
          style={{
            width:  `calc(${riftHalfW * 2}vw + ${glow * 6}px)`,
            height: `calc(${riftH}vw + ${glow * 6}px)`,
          }}
        />
        <div
          className="hm-rift__glow-mid"
          style={{
            width:  `calc(${riftHalfW * 2}vw + ${glow * 3}px)`,
            height: `calc(${riftH}vw + ${glow * 3}px)`,
          }}
        />

        {/* SVG lens containing the rift interior */}
        <svg
          ref={riftRef}
          className="hm-rift__svg"
          viewBox={`0 0 ${vbW} ${vbH}`}
          style={{
            width:  `${riftHalfW * 2}vw`,
            height: `${riftH}vw`,
          }}
          overflow="visible"
        >
          <defs>
            <clipPath id="rift-clip">
              <path d={lensPath} />
            </clipPath>
          </defs>

          {/* Core white outline */}
          <path
            d={lensPath}
            fill="none"
            stroke="white"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="rift-inner"
          />

          {/* Red glow outline (simulated via thick semi-transparent strokes) */}
          <path d={lensPath} fill="none" stroke="rgba(226,54,54,0.55)" strokeWidth={glow * 0.8}     vectorEffect="non-scaling-stroke" className="rift-inner" />
          <path d={lensPath} fill="none" stroke="rgba(226,54,54,0.30)" strokeWidth={glow * 1.6}     vectorEffect="non-scaling-stroke" className="rift-inner" />
          <path d={lensPath} fill="none" stroke="rgba(226,54,54,0.12)" strokeWidth={glow * 2.8}     vectorEffect="non-scaling-stroke" className="rift-inner" />

          {/* Rift interior: color bands + stars */}
          <g clipPath="url(#rift-clip)" className="rift-inner rift-bands">
            {RIFT_BANDS.map((color, i) => {
              const bandW = vbW / RIFT_BANDS.length
              const x = i * bandW
              return (
                <rect
                  key={color}
                  x={x}
                  y={0}
                  width={bandW}
                  height={vbH}
                  fill={color}
                  opacity={0.72}
                />
              )
            })}
            {/* Thin dark dividers between bands */}
            {RIFT_BANDS.slice(1).map((_, i) => {
              const x = ((i + 1) / RIFT_BANDS.length) * vbW
              return (
                <line
                  key={i}
                  x1={x} y1={0} x2={x} y2={vbH}
                  stroke="rgba(0,0,0,0.45)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
            {/* Static star dots */}
            {[
              [18, 40], [55, 85], [82, 155], [32, 220], [70, 285],
              [12, 130], [44, 60], [91, 200], [60, 310], [25, 170],
            ].map(([sx, sy], idx) => (
              <circle key={idx} cx={sx} cy={sy} r={1.2} fill="white" opacity={0.6} />
            ))}
          </g>
        </svg>
      </div>

      {/* ── SILHOUETTES: row of 5, bottom-anchored, in front of rift ── */}
      {SIL_ENABLED && (
        <div
          ref={silRowRef}
          className="hm-rift__sil-row"
          aria-hidden="true"
          style={{ bottom: `${cfg.silhouetteBottomPx}px` }}
        >
          {TRACKS.map((track, i) => {
            const leftVw = silStart + i * silStep
            return (
              <img
                key={track.id}
                src={`/hero/sil-${track.id}.webp`}
                alt=""
                className="sil-item"
                draggable={false}
                style={{
                  height:   `${cfg.silhouetteHeightVh * 100}vh`,
                  left:     `${leftVw}vw`,
                  transform: 'translateX(-50%)',
                }}
                onError={(e) => {
                  console.warn(`[HeroMultiverse] Missing silhouette for "${track.id}" (public/hero/sil-${track.id}.webp) — run npm run prepare:hero-sil`)
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )
          })}
        </div>
      )}

      {/* ── TEXT COLUMN (left, vertically centered) ── */}
      <div ref={textRef} className="hm-rift__text hm-text-col" style={textColStyle}>

        {/* Eyebrow: red line + label */}
        <div className="hm-eyebrow">
          <span className="hm-eyebrow__line" aria-hidden="true" />
          <span className="hm-eyebrow__text">{HERO_COPY.eyebrow}</span>
        </div>

        {/* Kicker: HACK-A-SOL 5.0 */}
        <p className="hm-kicker">
          {HERO_COPY.kicker.replace(HERO_COPY.kickerAccent, '').trim()}{' '}
          <span className="hm-kicker__accent">{HERO_COPY.kickerAccent}</span>
        </p>

        {/* H1 Headline */}
        <h1 aria-label={`${HERO_COPY.headlineTop} ${HERO_COPY.headlineMain}`}>
          <span className="hm-h1-clip">
            <span className="hm-line-enter">{HERO_COPY.headlineTop}</span>
          </span>
          <span className="hm-h1-clip big">
            <span className="hm-line-main">{HERO_COPY.headlineMain}</span>
          </span>
        </h1>

        {/* Tagline */}
        <p className="hm-tagline">{HERO_COPY.tagline}</p>

        {/* CTAs */}
        <div className="hm-cta-row">
          <a
            id="hero-register-btn"
            className="hm-btn-primary"
            href={EVENT.registrationLink}
          >
            {HERO_COPY.primaryCTA}
          </a>
          <a
            id="hero-champions-link"
            className="hm-link-secondary"
            href={HERO_COPY.secondaryCTAHref}
          >
            {HERO_COPY.secondaryCTA}
          </a>
        </div>
      </div>

      {/* ── BOTTOM HUD: one quiet row ── */}
      <div className="hm-bottom-hud" aria-label="Event status">
        <span>{HERO_COPY.bottomLeft}</span>
        <span ref={bottomRightRef}>{HERO_COPY.bottomRight}</span>
      </div>
    </section>
  )
}
