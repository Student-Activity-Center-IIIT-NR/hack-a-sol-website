/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic "Breach" hero: a fullscreen-shader dimensional gateway (see
 * src/three/hero/HeroScene.js) plus the title treatment and HUD micro-details.
 *
 * NOTE: this section owns ONE small WebGL canvas (hero only). It pauses itself
 * when scrolled out of view. All uncertain copy comes from src/config.ts.
 *
 * `ready` should be false while the loading screen is up; the opening sequence
 * starts when it flips to true.
 */

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT } from '../config'
import { initHero } from '../three/hero/HeroScene'
import type { HeroHandle } from '../three/hero/HeroScene'
import '../styles/hero.css'

interface HeroProps {
  /** False while the loading screen is showing. */
  ready: boolean
}

/** Position of a HUD tag relative to the gateway, in units of its outer radius. */
const at = (tx: number, ty: number) => ({ '--tx': tx, '--ty': ty }) as CSSProperties

const GLITCH_CHARS = '#%&01'

export function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const energyRef = useRef<HTMLElement>(null)
  const variantRef = useRef<HTMLElement>(null)
  const xyRef = useRef<HTMLSpanElement>(null)
  const heroRef = useRef<HeroHandle | null>(null)
  const playedRef = useRef(false)

  // Hidden start states, applied before first paint so nothing flashes.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.ln > span', { yPercent: 115 })
      gsap.set('.fade', { opacity: 0, y: 14 })
      gsap.set('.tag, .hud', { opacity: 0 })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Mount / unmount the WebGL gateway.
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

  // Always-on live bits: pointer readout, energy flicker, variant glitch, text parallax.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const textEl = root.querySelector<HTMLElement>('.hs-text')
    const moveX = textEl ? gsap.quickTo(textEl, 'x', { duration: 1.4, ease: 'power3.out' }) : null

    const pad = (v: number, m: number) => ((v / m) * 100).toFixed(2).padStart(5, '0')
    const onMove = (e: PointerEvent) => {
      if (xyRef.current) xyRef.current.textContent = `X ${pad(e.clientX, innerWidth)} Y ${pad(e.clientY, innerHeight)}`
      moveX?.((e.clientX / innerWidth - 0.5) * -12)
    }
    window.addEventListener('pointermove', onMove)

    const energy = window.setInterval(() => {
      if (energyRef.current) energyRef.current.textContent = (97.4 + (Math.random() - 0.5) * 0.6).toFixed(1).padStart(5, '0')
    }, 1400)

    let restore = 0
    const onGlitch = () => {
      const el = variantRef.current
      if (!el) return
      const original = 'VARIANT // 07'
      el.textContent = original.replace(/[A-Z0-9]/g, (c) =>
        Math.random() < 0.35 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c)
      window.clearTimeout(restore)
      restore = window.setTimeout(() => { el.textContent = original }, 140)
    }
    window.addEventListener('variant-glitch', onGlitch)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('variant-glitch', onGlitch)
      window.clearInterval(energy)
      window.clearTimeout(restore)
    }
  }, [])

  // Opening sequence: starts once the loading screen is gone.
  useEffect(() => {
    const hero = heroRef.current
    if (!ready || !hero || playedRef.current) return
    playedRef.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    hero.play()

    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.hud', { opacity: 1, duration: 1.4 }, 1.0)
        .to('.fade.pre', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.0)
        .to('.ln > span', { yPercent: 0, duration: 0.9, stagger: 0.14, ease: 'expo.out' }, 2.2)
        .to('.tag', { opacity: 1, duration: 1.2, stagger: 0.15 }, 2.6)
        .to('.fade.post', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.8)
      if (reduced) tl.timeScale(20)

      // Scroll: the gateway swells and fades while the text lifts away.
      ScrollTrigger.create({
        trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (s) => hero.setScroll(s.progress),
      })
      gsap.to('.hs-text, .tags', {
        yPercent: -10, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: '65% top', scrub: true },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section id="hero" ref={rootRef} className="hs-hero" aria-label={`${EVENT.name} — Enter the Multiverse`}>
      <div ref={canvasRef} className="hs-canvas" aria-hidden="true" />
      <div className="tags" aria-hidden="true">
        <div className="tag" style={at(0.72, -0.7)}><i /><p>DIMENSION // 616<br /><span>REALITY // DETECTED</span></p></div>
        <div className="tag l" style={at(-0.8, -0.62)}><i /><p>CALIBRATION // 98.7%<br /><span>ENERGY FLOW // STABLE</span></p></div>
        <div className="tag l" style={at(-0.78, 0.62)}><i /><p>SIGNAL // DETECTED<br /><span>SECTOR // A-07</span></p></div>
        <div className="tag" style={at(0.9, 0.46)}><i /><p>ENERGY // <b ref={energyRef}>097.4</b>%<br /><span>DIMENSIONAL LOCK // 87%</span></p></div>
        <div className="tag" style={at(0.62, 0.8)}><i /><p><b ref={variantRef}>VARIANT // 07</b><br /><span>TIMELINE // ACTIVE</span></p></div>
        <div className="tag cal" style={at(1.27, 0)}>090</div>
        <div className="tag cal" style={at(-1.27, 0)}>270</div>
      </div>

      <div className="hs-text">
        <p className="label fade pre"><i />{EVENT.hostedBy} presents</p>
        <p className="name fade pre">Hack-A-Sol <b>{EVENT.edition}</b></p>
        <h1 aria-label="Enter the Multiverse">
          <span className="ln"><span>Enter the</span></span>
          <span className="ln big"><span>Multiverse</span></span>
        </h1>
        <p className="support fade post">Teams from every reality. One mission. Build what comes next.</p>
        <div className="cta fade post">
          <a id="hero-register-btn" className="btn" href={EVENT.registrationLink} data-magnetic>
            <span>{EVENT.registrationStatus}</span><em>→</em>
          </a>
          <a id="hero-tracks-link" className="link" href="#tracks">View tracks</a>
          <a id="hero-sponsor-btn" className="link" href="#why-sponsor">Become a sponsor</a>
        </div>
      </div>

      <div className="hud" aria-hidden="true">
        <span>MISSION // 005 &nbsp;·&nbsp; {EVENT.date}</span>
        <span className="hud-mid">LAT 21.2514 &nbsp; LNG 81.6296</span>
        <span><i className="dot" />SIGNAL STABLE &nbsp;·&nbsp; <span ref={xyRef}>X 00.00 Y 00.00</span></span>
      </div>
    </section>
  )
}
