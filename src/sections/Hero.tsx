/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel Hero Section — Powered by the epic Avengers silhouette wallpaper.
 *
 * Features:
 *   - Perfectly framed 100svh opening viewport
 *   - Cinematic scroll parallax on background wallpaper and typography
 *   - Natural exit on scroll — title stays at the first section only and
 *     smoothly fades away into the About and Tracks sections
 *   - Multi-stage atmospheric vignette blends:
 *       * Top gradient for navbar clarity
 *       * Center radial scrim for comic title pop
 *       * Bottom gradient for seamless blend into #050508 page background
 *   - Interactive mouse parallax depth
 *   - Ambient drifting embers
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT, HERO_WALL, HERO_WALL_SCROLL } from '../config'
import './hero.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  ready?: boolean
}

// 10 subtle floating embers
const EMBERS = [
  { left: '12%', size: 3, delay: '0s', duration: '9s' },
  { left: '25%', size: 4, delay: '2.5s', duration: '11s' },
  { left: '38%', size: 2, delay: '1s', duration: '8s' },
  { left: '52%', size: 3.5, delay: '3.2s', duration: '10s' },
  { left: '68%', size: 2.5, delay: '1.8s', duration: '9.5s' },
  { left: '80%', size: 4, delay: '4s', duration: '12s' },
  { left: '92%', size: 3, delay: '0.5s', duration: '8.5s' },
  { left: '18%', size: 2, delay: '5s', duration: '10.5s' },
  { left: '60%', size: 3, delay: '4.5s', duration: '9s' },
]

export function Hero({ ready = true }: HeroProps) {
  const heroRef      = useRef<HTMLElement>(null)
  const wallpaperRef = useRef<HTMLImageElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)
  const descRef      = useRef<HTMLDivElement>(null)
  const isInViewRef  = useRef(false)

  // Lite mode detection
  const liteMode = useMemo(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    const cores = navigator.hardwareConcurrency ?? 4
    return cores < 4
  }, [])

  // ── GSAP Scroll Parallax ──
  useEffect(() => {
    if (!ready) return
    const section = heroRef.current
    if (!section) return

    const setWillChange = (on: boolean) => {
      const val = on ? 'transform, opacity' : 'auto'
      if (wallpaperRef.current) wallpaperRef.current.style.willChange = on ? 'transform' : 'auto'
      if (textRef.current) textRef.current.style.willChange = val
      isInViewRef.current = on
    }

    const observer = new IntersectionObserver(
      ([entry]) => setWillChange(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(section)

    const ctx = gsap.context(() => {
      if (!liteMode) {
        // Wallpaper subtle parallax zoom & drift as user scrolls through the 100svh Hero
        if (wallpaperRef.current) {
          gsap.fromTo(
            wallpaperRef.current,
            { scale: HERO_WALL.scale, yPercent: 0 },
            {
              scale: HERO_WALL_SCROLL.bgScaleEnd,
              yPercent: HERO_WALL_SCROLL.bgShiftPercent,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            }
          )
        }

        // Title and description float up and fade out smoothly before About starts
        if (textRef.current) {
          gsap.fromTo(
            textRef.current,
            { y: 0, opacity: 1 },
            {
              y: HERO_WALL_SCROLL.textShiftPx,
              opacity: 0,
              ease: 'power1.in',
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.5,
              },
            }
          )
        }
      }
    }, section)

    const handleLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', handleLoad)

    return () => {
      ctx.revert()
      observer.disconnect()
      window.removeEventListener('load', handleLoad)
    }
  }, [ready, liteMode])

  // ── Interactive Mouse Parallax ──
  useEffect(() => {
    if (liteMode || !wallpaperRef.current) return

    const wp = wallpaperRef.current
    const quickX = gsap.quickTo(wp, 'x', { duration: 1.2, ease: 'power2.out' })
    const quickY = gsap.quickTo(wp, 'y', { duration: 1.2, ease: 'power2.out' })

    const onMouseMove = (e: MouseEvent) => {
      if (!isInViewRef.current) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2 // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      const depth = HERO_WALL_SCROLL.mouseParallax
      quickX(nx * -depth)
      quickY(ny * -depth)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [liteMode])

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-label={`${EVENT.name} — Enter the Multiverse`}
      className="hero-section flex flex-col items-center justify-center select-none"
      style={{
        ['--hero-bg-opacity' as string]: HERO_WALL.opacity,
      } as React.CSSProperties}
    >
      {/* ── BACKGROUND WALLPAPER LAYER ── */}
      <div className="hero-bg-layer" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero/hero-wall-mobile.webp" type="image/webp" />
          <img
            ref={wallpaperRef}
            src="/hero/hero-wall-main.webp"
            alt="Marvel Heroes Silhouette"
            decoding="async"
            draggable={false}
            className="hero-wallpaper-img"
            onLoad={() => ScrollTrigger.refresh()}
          />
        </picture>
      </div>

      {/* ── ATMOSPHERIC BLEND VIGNETTES ── */}
      {/* 1. Top shade for navbar */}
      <div className="hero-blend-top" aria-hidden="true" />

      {/* 2. Center radial scrim for text legibility */}
      <div className="hero-blend-center" aria-hidden="true" />

      {/* 3. Bottom seamless gradient into page background (#050508) */}
      <div className="hero-blend-bottom" aria-hidden="true" />

      {/* ── FLOATING RED EMBERS ── */}
      {!liteMode && (
        <div className="hero-embers-container" aria-hidden="true">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="hero-ember"
              style={{
                left: e.left,
                width: `${e.size}px`,
                height: `${e.size}px`,
                animationDelay: e.delay,
                animationDuration: e.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* ── HERO FOREGROUND / TITLE CONTENT (Positioned strictly in upper crimson sky) ── */}
      <div
        ref={textRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-start w-full px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-4"
      >
        {/* 1. Hosted by tag */}
        <p className="font-body text-xs sm:text-sm tracking-[0.45em] sm:tracking-[0.55em] text-white/90 uppercase font-semibold mb-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {EVENT.hostedBy} <span className="text-[#ff3b3b]">PRESENTS</span>
        </p>

        {/* 2. Giant HACK-A-SOL Comic Headline */}
        <h1 className="hero-hackasol-title select-none my-0.5">
          HACK-<span className="text-[#ff3b3b]">A</span>-SOL
        </h1>

        {/* 3. 5.0 Edition Badge */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-4 my-1.5 sm:my-2">
          <div className="h-px w-8 sm:w-14 bg-white/40" />
          <span className="font-heading text-lg sm:text-2xl md:text-3xl tracking-[0.4em] text-white font-bold pl-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {EVENT.edition}
          </span>
          <div className="h-px w-8 sm:w-14 bg-white/40" />
        </div>

        {/* 4. Skewed MARVEL Slab (Centered on its own line) */}
        <div className="my-2 sm:my-2.5">
          <div className="hero-marvel-slab">
            <span className="hero-marvel-text">{EVENT.theme}</span>
          </div>
        </div>

        {/* 5. Description & CTAs with generous breathing room */}
        <div ref={descRef} className="mt-3 sm:mt-4 max-w-xl mx-auto w-full">
          <p className="font-body text-xs sm:text-sm md:text-base text-white/90 max-w-lg mx-auto mb-4 sm:mb-5 leading-relaxed font-normal px-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            The flagship hackathon of {EVENT.hostedBy} returns. 3 specialised tracks. 3 Marvel champions. One multiverse to conquer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <a
              id="hero-register-btn"
              href={EVENT.registrationLink}
              data-magnetic
              className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white bg-[#e23636] hover:bg-[#ff4444] rounded-sm transition-all duration-300 shadow-[0_0_24px_rgba(226,54,54,0.5)] hover:shadow-[0_0_36px_rgba(226,54,54,0.85)] hover:scale-105 active:scale-95"
            >
              <span>{EVENT.registrationStatus.toUpperCase()}</span>
            </a>
            <a
              id="hero-sponsor-btn"
              href="#tracks"
              data-magnetic
              className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white/95 hover:text-white border border-white/40 hover:border-white/80 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
            >
              <span>EXPLORE TRACKS</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
