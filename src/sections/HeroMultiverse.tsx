/**
 * src/sections/HeroMultiverse.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic "Breach" hero variant: a fullscreen-shader dimensional gateway
 * (see src/three/hero-multiverse/HeroSceneMultiverse.js) plus the title
 * treatment and HUD micro-details.
 *
 * PORTED from commit d44a2a4 (the version WITHOUT extra HUD labels — no
 * "VARIANT // 07", no "DIMENSIONAL LOCK", no "ENERGY // 097.4%",
 * no "TIMELINE // ACTIVE").
 *
 * Architecture notes:
 * - This section owns its OWN small WebGL canvas (hero only). Isolated from
 *   the site-wide R3F canvas — zero changes to Scene.tsx or App.tsx canvas.
 * - The canvas is paused via IntersectionObserver when scrolled out of view.
 * - All hero layers are unmounted once the hero is scrolled past.
 * - All classes are scoped under .hm-hero — no conflict with the crowd-wall
 *   hero or any other section.
 * - HERO_VARIANT switch in src/config.ts controls which hero renders.
 * - All copy comes from HERO_COPY in src/config.ts.
 * - HERO_SHOW_SPONSOR_LINK gates the sponsor link.
 * - Track-colored orbs: one per track (5) from src/data/tracks.ts.
 * - Bottom HUD: left = date, right = "EARTH-616" crossfades to
 *   "ENTERING THE MULTIVERSE" when hero scroll progress > 0.5.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT, HERO_COPY, HERO_SHOW_SPONSOR_LINK } from '../config'
import { TRACKS } from '../data/tracks'
import { initHero } from '../three/hero-multiverse/HeroSceneMultiverse'
import type { HeroMultiverseHandle } from '../three/hero-multiverse/HeroSceneMultiverse'
import './hero-multiverse/HeroMultiverse.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroMultiverseProps {
  /** False while the loading screen is showing; the opening sequence starts when it flips to true. */
  ready: boolean
}

export function HeroMultiverse({ ready }: HeroMultiverseProps) {
  const rootRef   = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const heroRef   = useRef<HeroMultiverseHandle | null>(null)
  const playedRef = useRef(false)

  /** 0..1 scroll progress through the hero section (for crossfade HUD). */
  const [scrollProg, setScrollProg] = useState(0)
  const hudRightEntering = scrollProg > 0.5

  // Apply hidden start states before first paint so nothing flashes.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hm-hero .ln > span', { yPercent: 115 })
      gsap.set('.hm-hero .fade',       { opacity: 0, y: 14 })
      gsap.set('.hm-hero .hm-tag, .hm-hero .hm-hud', { opacity: 0 })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Mount / unmount the WebGL gateway canvas.
  useEffect(() => {
    const container = canvasRef.current
    if (!container) return
    const hero = initHero(container)
    heroRef.current = hero
    return () => {
      hero.destroy()
      heroRef.current = null
      playedRef.current = false
    }
  }, [])

  // Always-on live bits: pointer-driven text parallax.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const textEl = root.querySelector<HTMLElement>('.hm-text')
    const moveX  = textEl
      ? gsap.quickTo(textEl, 'x', { duration: 1.4, ease: 'power3.out' })
      : null

    const onMove = (e: PointerEvent) => {
      moveX?.((e.clientX / innerWidth - 0.5) * -12)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Opening sequence: plays once the loading screen is gone.
  useEffect(() => {
    const hero = heroRef.current
    if (!ready || !hero || playedRef.current) return
    playedRef.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    hero.play()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        // HUD bar fades in first
        .to('.hm-hero .hm-hud', { opacity: 1, duration: 1.4 }, 1.0)
        // Pre-headline labels (eyebrow, kicker)
        .to('.hm-hero .fade.pre', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.0)
        // Headline lines rise
        .to('.hm-hero .ln > span', { yPercent: 0, duration: 0.9, stagger: 0.14, ease: 'expo.out' }, 2.2)
        // Orbit tags appear
        .to('.hm-hero .hm-tag', { opacity: 1, duration: 1.2, stagger: 0.15 }, 2.6)
        // Post-headline: tagline + CTAs
        .to('.hm-hero .fade.post', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.8)
      if (reduced) tl.timeScale(20)

      // Scroll: gateway swells and fades; text lifts away.
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (s) => {
          hero.setScroll(s.progress)
          setScrollProg(s.progress)
        },
      })
      gsap.to('.hm-hero .hm-text, .hm-hero .hm-tags', {
        yPercent: -10,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: '65% top',
          scrub: true,
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section
      id="hero"
      ref={rootRef}
      className="hm-hero"
      aria-label={`${EVENT.name} — ${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}
    >
      {/* ── WebGL gateway canvas (own context, paused when out of view) ── */}
      <div ref={canvasRef} className="hm-canvas" aria-hidden="true" />

      {/* ── Track-colored orbital orbs (one per track) ── */}
      <div className="hm-tags" aria-hidden="true">
        {TRACKS.map((track, i) => (
          <div
            key={track.id}
            className="hm-tag hm-orb"
            style={{
              /* Each orb gets its own orbit radius tier and speed offset */
              '--orb-color': track.accentColor,
              '--orb-idx': i,
            } as React.CSSProperties}
            aria-label={track.name}
          />
        ))}
      </div>

      {/* ── Left-aligned text block ── */}
      <div className="hm-text">
        {/* Eyebrow */}
        <p className="hm-label fade pre">
          <i />{HERO_COPY.eyebrow}
        </p>
        {/* Kicker: HACK-A-SOL 5.0 */}
        <p className="hm-name fade pre">
          {HERO_COPY.kickerBase} <b>{HERO_COPY.kickerEdition}</b>
        </p>
        {/* H1 headline */}
        <h1 aria-label={`${HERO_COPY.headlineLine1} ${HERO_COPY.headlineLine2}`}>
          <span className="ln"><span>{HERO_COPY.headlineLine1}</span></span>
          <span className="ln big"><span>{HERO_COPY.headlineLine2}</span></span>
        </h1>
        {/* Tagline */}
        <p className="hm-support fade post">
          {HERO_COPY.tagline}
        </p>
        {/* CTA row */}
        <div className="hm-cta fade post">
          <a
            id="hero-register-btn"
            className="hm-btn"
            href={EVENT.registrationLink}
            data-magnetic
          >
            <span>{HERO_COPY.ctaPrimary}</span>
          </a>
          <a
            id="hero-tracks-link"
            className="hm-link"
            href={HERO_COPY.ctaSecondaryHref}
          >
            {HERO_COPY.ctaSecondary}
          </a>
          {HERO_SHOW_SPONSOR_LINK && (
            <a id="hero-sponsor-btn" className="hm-link" href="#why-sponsor">
              BECOME A SPONSOR
            </a>
          )}
        </div>
      </div>

      {/* ── Bottom status bar HUD ── */}
      <div className="hm-hud" aria-hidden="true">
        {/* Left: event date */}
        <span className="hm-hud-left">
          <i className="hm-dot" />
          {EVENT.date}
        </span>
        {/* Right: crossfades EARTH-616 → ENTERING THE MULTIVERSE */}
        <span className="hm-hud-right">
          <span
            className="hm-hud-label"
            style={{ opacity: hudRightEntering ? 0 : 1 }}
            aria-hidden={hudRightEntering}
          >
            EARTH-616
          </span>
          <span
            className="hm-hud-label hm-hud-label-entering"
            style={{ opacity: hudRightEntering ? 1 : 0 }}
            aria-hidden={!hudRightEntering}
          >
            ENTERING THE MULTIVERSE
          </span>
        </span>
      </div>
    </section>
  )
}
