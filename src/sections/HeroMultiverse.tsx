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
 * Architecture notes vs. the current repo:
 * - This section owns its OWN small WebGL canvas (hero only). It is isolated
 *   from the site-wide R3F canvas so adding it requires zero changes to
 *   Scene.tsx or the Canvas in App.tsx.
 * - The canvas is paused via IntersectionObserver when scrolled out of view.
 * - All hero layers are unmounted once the hero is scrolled past.
 * - All classes are scoped under .hm-hero — no conflict with the crowd-wall
 *   hero or any other section.
 * - FloatingHUD hides its corner labels while the Hero is active (controlled
 *   by scrollProgress < 0.08 in FloatingHUD.tsx — already the case).
 * - Config values come from src/config.ts (EVENT.*).
 *
 * Switch back to the crowd-wall hero by setting
 *   HERO_VARIANT = "wall"
 * in src/config.ts.
 */

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT } from '../config'
import { initHero } from '../three/hero-multiverse/HeroSceneMultiverse'
import type { HeroMultiverseHandle } from '../three/hero-multiverse/HeroSceneMultiverse'
import './hero-multiverse/HeroMultiverse.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroMultiverseProps {
  /** False while the loading screen is showing; the opening sequence starts when it flips to true. */
  ready: boolean
}

/** Positions a HUD orbit-tag relative to the gateway, in units of its outer radius. */
const at = (tx: number, ty: number) => ({ '--tx': tx, '--ty': ty }) as CSSProperties

export function HeroMultiverse({ ready }: HeroMultiverseProps) {
  const rootRef    = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLDivElement>(null)
  const xyRef      = useRef<HTMLSpanElement>(null)
  const heroRef    = useRef<HeroMultiverseHandle | null>(null)
  const playedRef  = useRef(false)

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

  // Always-on live bits: pointer coordinate readout + text parallax.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const textEl = root.querySelector<HTMLElement>('.hm-text')
    const moveX  = textEl
      ? gsap.quickTo(textEl, 'x', { duration: 1.4, ease: 'power3.out' })
      : null

    const pad = (v: number, m: number) =>
      ((v / m) * 100).toFixed(2).padStart(5, '0')

    const onMove = (e: PointerEvent) => {
      if (xyRef.current) {
        xyRef.current.textContent = `X ${pad(e.clientX, innerWidth)} Y ${pad(e.clientY, innerHeight)}`
      }
      moveX?.((e.clientX / innerWidth - 0.5) * -12)
    }
    window.addEventListener('pointermove', onMove)

    return () => {
      window.removeEventListener('pointermove', onMove)
    }
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
        // Pre-headline labels
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
        onUpdate: (s) => hero.setScroll(s.progress),
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
      aria-label={`${EVENT.name} — Enter the Multiverse`}
    >
      {/* ── WebGL gateway canvas (own context, paused when out of view) ── */}
      <div ref={canvasRef} className="hm-canvas" aria-hidden="true" />

      {/* ── Orbit HUD tags around the portal ── */}
      <div className="hm-tags" aria-hidden="true">
        <div className="hm-tag"   style={at(0.72, -0.7)}>
          <i /><p>DIMENSION // 616<br /><span>REALITY // DETECTED</span></p>
        </div>
        <div className="hm-tag l" style={at(-0.8, -0.62)}>
          <i /><p>CALIBRATION // 98.7%<br /><span>ENERGY FLOW // STABLE</span></p>
        </div>
        <div className="hm-tag l" style={at(-0.78, 0.62)}>
          <i /><p>SIGNAL // DETECTED<br /><span>SECTOR // A-07</span></p>
        </div>
        <div className="hm-tag cal" style={at(1.27, 0)}>090</div>
        <div className="hm-tag cal" style={at(-1.27, 0)}>270</div>
      </div>

      {/* ── Left-aligned text block ── */}
      <div className="hm-text">
        <p className="hm-label fade pre">
          <i />{EVENT.hostedBy} presents
        </p>
        <p className="hm-name fade pre">
          Hack-A-Sol <b>{EVENT.edition}</b>
        </p>
        <h1 aria-label="Enter the Multiverse">
          <span className="ln"><span>Enter the</span></span>
          <span className="ln big"><span>Multiverse</span></span>
        </h1>
        <p className="hm-support fade post">
          Teams from every reality. One mission. Build what comes next.
        </p>
        <div className="hm-cta fade post">
          <a
            id="hero-register-btn"
            className="hm-btn"
            href={EVENT.registrationLink}
            data-magnetic
          >
            <span>{EVENT.registrationStatus}</span><em>→</em>
          </a>
          <a id="hero-tracks-link"  className="hm-link" href="#tracks">View tracks</a>
          <a id="hero-sponsor-btn"  className="hm-link" href="#why-sponsor">Become a sponsor</a>
        </div>
      </div>

      {/* ── Bottom status bar HUD ── */}
      <div className="hm-hud" aria-hidden="true">
        <span>MISSION // 005 &nbsp;·&nbsp; {EVENT.date}</span>
        <span className="hm-hud-mid">LAT 21.2514 &nbsp; LNG 81.6296</span>
        <span>
          <i className="hm-dot" />
          SIGNAL STABLE &nbsp;·&nbsp; <span ref={xyRef}>X 00.00 Y 00.00</span>
        </span>
      </div>
    </section>
  )
}
