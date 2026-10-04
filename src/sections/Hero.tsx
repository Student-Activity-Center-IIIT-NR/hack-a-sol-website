/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Marvel Multiverse Hero Section:
 * - Centered hierarchy:
 *     "IIIT NAYA RAIPUR PRESENTS"
 *     "HACK-A-SOL"
 *     "5.0" (between two thin lines)
 *     "MARVEL" (high contrast, tracked)
 *     "5 specialised tracks. 5 Marvel champions."
 *     Centered CTA buttons: COMING SOON + BECOME A SPONSOR
 * - Background: 5 character silhouettes (/characters/<id>.png) flanking left and right,
 *   tinted in track accent colors with grayscale, brightness(0.5), gradient masks,
 *   slow mouse parallax, floating animations, and scroll drift/fade.
 * - Faint generic SVG motifs (shield rings, claw slashes, spell mandala, drone eye, red crack).
 * - Proper top padding to clear fixed navbar.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT } from '../config'
import '../styles/hero.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  /** False while the loading screen is showing */
  ready?: boolean
}

// 5 character silhouettes flanking the sides (center column kept 100% clear)
const SILHOUETTES = [
  // Left flank
  {
    id: 'cybersec',
    image: '/characters/cybersec.png',
    accentColor: '#EF4444',
    name: 'Captain America',
    side: 'left' as const,
    className: 'hidden sm:block -left-6 sm:left-[2%] lg:left-[5%] top-[12%] h-[58vh] max-h-[580px] w-auto z-[1]',
    depth: 0.25,
    floatDuration: 8.5,
    floatDelay: 0,
    baseOpacity: 0.12,
  },
  {
    id: 'aiml',
    image: '/characters/aiml.png',
    accentColor: '#60A5FA',
    name: 'Iron Man',
    side: 'left' as const,
    className: 'left-[1%] sm:left-[11%] lg:left-[15%] top-[24%] h-[50vh] max-h-[500px] w-auto z-[2]',
    depth: 0.5,
    floatDuration: 7.2,
    floatDelay: 1.2,
    baseOpacity: 0.14,
    mobileVisible: true,
  },
  {
    id: 'robonyx',
    image: '/characters/robonyx.png',
    accentColor: '#F87171',
    name: 'Ultron',
    side: 'left' as const,
    className: 'hidden md:block -left-10 lg:-left-4 top-[36%] h-[46vh] max-h-[460px] w-auto z-[1]',
    depth: 0.35,
    floatDuration: 9.0,
    floatDelay: 2.4,
    baseOpacity: 0.10,
  },
  // Right flank
  {
    id: 'coderun',
    image: '/characters/coderun.png',
    accentColor: '#F59E0B',
    name: 'Doctor Strange',
    side: 'right' as const,
    className: 'hidden sm:block -right-6 sm:right-[2%] lg:right-[5%] top-[10%] h-[60vh] max-h-[600px] w-auto z-[1]',
    depth: 0.28,
    floatDuration: 8.0,
    floatDelay: 0.8,
    baseOpacity: 0.12,
  },
  {
    id: 'web3',
    image: '/characters/web3.png',
    accentColor: '#A855F7',
    name: 'Black Panther',
    side: 'right' as const,
    className: 'right-[1%] sm:right-[11%] lg:right-[15%] top-[26%] h-[50vh] max-h-[500px] w-auto z-[2]',
    depth: 0.55,
    floatDuration: 7.6,
    floatDelay: 1.8,
    baseOpacity: 0.14,
    mobileVisible: true,
  },
]

export function Hero({ ready = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const leftGroupRef = useRef<HTMLDivElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const textGroupRef = useRef<HTMLDivElement>(null)
  const motifsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Mouse parallax with variable depths per layer
    let quickXLeft: ((v: number) => void) | null = null
    let quickYLeft: ((v: number) => void) | null = null
    let quickXRight: ((v: number) => void) | null = null
    let quickYRight: ((v: number) => void) | null = null
    let quickXMotifs: ((v: number) => void) | null = null
    let quickYMotifs: ((v: number) => void) | null = null

    if (!reduced) {
      if (leftGroupRef.current) {
        quickXLeft = gsap.quickTo(leftGroupRef.current, 'x', { duration: 1.2, ease: 'power2.out' })
        quickYLeft = gsap.quickTo(leftGroupRef.current, 'y', { duration: 1.2, ease: 'power2.out' })
      }
      if (rightGroupRef.current) {
        quickXRight = gsap.quickTo(rightGroupRef.current, 'x', { duration: 1.2, ease: 'power2.out' })
        quickYRight = gsap.quickTo(rightGroupRef.current, 'y', { duration: 1.2, ease: 'power2.out' })
      }
      if (motifsRef.current) {
        quickXMotifs = gsap.quickTo(motifsRef.current, 'x', { duration: 1.6, ease: 'power2.out' })
        quickYMotifs = gsap.quickTo(motifsRef.current, 'y', { duration: 1.6, ease: 'power2.out' })
      }

      const onPointerMove = (e: PointerEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2 // -1 to 1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2

        quickXLeft?.(nx * -24)
        quickYLeft?.(ny * -18)
        quickXRight?.(nx * 24)
        quickYRight?.(ny * -18)
        quickXMotifs?.(nx * -14)
        quickYMotifs?.(ny * -10)
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })

      return () => {
        window.removeEventListener('pointermove', onPointerMove)
      }
    }
  }, [])

  // Scroll animations: characters drift outward and fade as user enters Tracks
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !ready) return

    const ctx = gsap.context(() => {
      // Outward drift and fade for left silhouettes
      if (leftGroupRef.current) {
        gsap.to(leftGroupRef.current, {
          xPercent: -35,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '60% top',
            scrub: true,
          },
        })
      }

      // Outward drift and fade for right silhouettes
      if (rightGroupRef.current) {
        gsap.to(rightGroupRef.current, {
          xPercent: 35,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '60% top',
            scrub: true,
          },
        })
      }

      // Motifs fade on scroll
      if (motifsRef.current) {
        gsap.to(motifsRef.current, {
          opacity: 0,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '50% top',
            scrub: true,
          },
        })
      }

      // Center text lifts and fades
      if (textGroupRef.current) {
        gsap.to(textGroupRef.current, {
          yPercent: -15,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '55% top',
            scrub: true,
          },
        })
      }
    }, hero)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-label={`${EVENT.name} — Enter the Multiverse`}
      className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden pt-24 sm:pt-28 pb-16 px-4 sm:px-6 select-none"
    >
      {/* ── Subtle Comic Halftone Dot Texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden="true"
      />

      {/* ── GENERIC FAINT MOTIFS (References: Shield, Slashes, Mandala, Drone Eye, Crack) ── */}
      <div ref={motifsRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* 1. Shield Rings Motif (Left / Cap reference) */}
        <svg
          className="absolute left-[8%] top-[18%] w-56 h-56 sm:w-80 sm:h-80 opacity-[0.07] stroke-red-500"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="90" strokeWidth="1.2" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="68" strokeWidth="1.6" />
          <circle cx="100" cy="100" r="46" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="24" strokeWidth="2" />
        </svg>

        {/* 2. Diagonal Claw Slashes Motif (Right / Black Panther reference) */}
        <svg
          className="absolute right-[12%] bottom-[22%] w-44 h-44 sm:w-64 sm:h-64 opacity-[0.07] stroke-purple-400"
          viewBox="0 0 160 160"
          fill="none"
        >
          <path d="M20 140 L130 20" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 150 L145 35" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 160 L160 55" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* 3. Spell Circle Mandala Motif (Upper Right / Strange reference) */}
        <svg
          className="hero-mandala-spin absolute right-[8%] top-[12%] w-60 h-60 sm:w-88 sm:h-88 opacity-[0.07] stroke-amber-400"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="88" strokeWidth="1" />
          <circle cx="100" cy="100" r="72" strokeWidth="1.2" strokeDasharray="4 4" />
          <rect x="42" y="42" width="116" height="116" strokeWidth="1" transform="rotate(45 100 100)" />
          <rect x="42" y="42" width="116" height="116" strokeWidth="1" />
          <circle cx="100" cy="100" r="32" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="16" strokeWidth="1" strokeDasharray="2 2" />
        </svg>

        {/* 4. Drone Eye with Red Glint (Lower Left / Ultron reference) */}
        <svg
          className="absolute left-[16%] bottom-[26%] w-16 h-16 opacity-[0.08]"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle cx="32" cy="32" r="14" stroke="#f87171" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="5" fill="#ef4444" />
          {/* Glint flare lines */}
          <line x1="32" y1="12" x2="32" y2="52" stroke="#f87171" strokeWidth="1" opacity="0.6" />
          <line x1="12" y1="32" x2="52" y2="32" stroke="#f87171" strokeWidth="1" opacity="0.6" />
        </svg>

        {/* 5. Thin Red Multiverse Crack of Light */}
        <svg
          className="absolute left-1/2 -translate-x-1/2 top-4 w-[280px] h-[92vh] opacity-[0.07] pointer-events-none"
          viewBox="0 0 280 800"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M140 0 L144 140 L136 280 L148 390 L135 520 L144 670 L140 800"
            stroke="#ff2424"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M140 0 L144 140 L136 280 L148 390 L135 520 L144 670 L140 800"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.8"
          />
        </svg>
      </div>

      {/* ── BACKGROUND CHARACTERS: 5 Flanking Dark Tinted Silhouettes ── */}
      {/* Left Flank Group (Cap, Iron Man, Ultron) */}
      <div ref={leftGroupRef} className="absolute inset-y-0 left-0 w-1/2 pointer-events-none" aria-hidden="true">
        {SILHOUETTES.filter((s) => s.side === 'left').map((s) => (
          <div
            key={s.id}
            className={`absolute pointer-events-none ${s.className} hero-char-float`}
            style={{
              animationDuration: `${s.floatDuration}s`,
              animationDelay: `${s.floatDelay}s`,
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={s.image}
                alt=""
                onError={(e) => {
                  (e.currentTarget.parentElement?.parentElement as HTMLElement)?.style.setProperty('display', 'none')
                }}
                className="w-full h-full object-contain pointer-events-none"
                style={{
                  filter: 'grayscale(100%) brightness(0.45)',
                  opacity: s.baseOpacity,
                  mixBlendMode: 'screen',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%), radial-gradient(ellipse at 50% 40%, black 50%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%), radial-gradient(ellipse at 50% 40%, black 50%, transparent 90%)',
                }}
              />
              {/* Subtle accent color wash */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: s.accentColor,
                  opacity: 0.12,
                  mixBlendMode: 'screen',
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Right Flank Group (Doctor Strange, Black Panther) */}
      <div ref={rightGroupRef} className="absolute inset-y-0 right-0 w-1/2 pointer-events-none" aria-hidden="true">
        {SILHOUETTES.filter((s) => s.side === 'right').map((s) => (
          <div
            key={s.id}
            className={`absolute pointer-events-none ${s.className} hero-char-float`}
            style={{
              animationDuration: `${s.floatDuration}s`,
              animationDelay: `${s.floatDelay}s`,
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={s.image}
                alt=""
                onError={(e) => {
                  (e.currentTarget.parentElement?.parentElement as HTMLElement)?.style.setProperty('display', 'none')
                }}
                className="w-full h-full object-contain pointer-events-none"
                style={{
                  filter: 'grayscale(100%) brightness(0.45)',
                  opacity: s.baseOpacity,
                  mixBlendMode: 'screen',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%), radial-gradient(ellipse at 50% 40%, black 50%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%), radial-gradient(ellipse at 50% 40%, black 50%, transparent 90%)',
                }}
              />
              {/* Subtle accent color wash */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: s.accentColor,
                  opacity: 0.12,
                  mixBlendMode: 'screen',
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── CENTERED HERO CONTENT (Keep center column 100% clear of silhouettes) ── */}
      <div
        ref={textGroupRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center my-auto"
      >
        {/* 1. IIIT NAYA RAIPUR PRESENTS (small, red, spaced) */}
        <p className="font-mono text-xs sm:text-sm tracking-[0.45em] sm:tracking-[0.55em] text-[#e53935] uppercase mb-4 sm:mb-6 font-semibold">
          {EVENT.hostedBy} PRESENTS
        </p>

        {/* 2. HUGE CENTERED HACK-A-SOL */}
        <h1
          className="font-heading font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] leading-[0.88] tracking-widest text-white uppercase drop-shadow-[0_0_50px_rgba(229,57,53,0.32)]"
        >
          HACK-A-SOL
        </h1>

        {/* 3. 5.0 BETWEEN TWO THIN LINES */}
        <div className="inline-flex items-center justify-center gap-4 sm:gap-6 my-3 sm:my-4">
          <div className="h-px w-10 sm:w-16 bg-white/25" />
          <span className="font-heading text-xl sm:text-2xl md:text-3xl tracking-[0.6em] text-white/80 font-bold pl-2">
            {EVENT.edition}
          </span>
          <div className="h-px w-10 sm:w-16 bg-white/25" />
        </div>

        {/* 4. MARVEL (spaced letters, higher contrast) */}
        <p className="font-heading text-2xl sm:text-4xl md:text-5xl tracking-[0.75em] sm:tracking-[0.95em] text-white/90 uppercase font-black pl-3 my-1 sm:my-2 text-shadow-marvel">
          {EVENT.theme}
        </p>

        {/* 5. DESCRIPTION: 5 specialised tracks. 5 Marvel champions. */}
        <p className="font-body text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto my-5 sm:my-7 leading-relaxed font-light px-4">
          5 specialised tracks. 5 Marvel champions.
        </p>

        {/* 6. TWO CENTERED BUTTONS: COMING SOON + BECOME A SPONSOR */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-2">
          {/* COMING SOON button */}
          <a
            id="hero-register-btn"
            href={EVENT.registrationLink}
            data-magnetic
            className="px-8 sm:px-9 py-3.5 sm:py-4 font-mono font-medium tracking-[0.22em] text-xs sm:text-sm uppercase text-white bg-[#e53935] hover:bg-[#ff4a4e] rounded-sm transition-all duration-300 shadow-[0_0_24px_rgba(229,57,53,0.45)] hover:shadow-[0_0_36px_rgba(229,57,53,0.7)] hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>{EVENT.registrationStatus.toUpperCase()}</span>
            <span aria-hidden="true">→</span>
          </a>

          {/* BECOME A SPONSOR button */}
          <a
            id="hero-sponsor-btn"
            href="#why-sponsor"
            data-magnetic
            className="px-8 sm:px-9 py-3.5 sm:py-4 font-mono font-medium tracking-[0.22em] text-xs sm:text-sm uppercase text-white/85 hover:text-white border border-white/25 hover:border-white/60 bg-white/[0.03] hover:bg-white/[0.08] rounded-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            BECOME A SPONSOR
          </a>
        </div>
      </div>

      {/* ── Bottom Gradient Blend ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#04050a] to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  )
}
