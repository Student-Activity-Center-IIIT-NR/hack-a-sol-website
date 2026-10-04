/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Comic Marvel Multiverse Hero Section:
 * - Small red spaced text: "IIIT NAYA RAIPUR PRESENTS"
 * - Huge "HACK-A-SOL" on ONE line (white-space: nowrap, clamp(3rem, 12vw, 11rem))
 * - "5.0" between two thin horizontal lines
 * - "MARVEL" comic-style title treatment (skewed red slab, halftone dots, offset shadow)
 * - Description: "The flagship hackathon of IIIT Naya Raipur returns. 5 specialised tracks. 5 Marvel champions. One multiverse to conquer."
 * - Two centered magnetic buttons: COMING SOON and BECOME A SPONSOR
 * - Background: 5 character silhouettes (/characters/<id>.png) as pure grayscale <img> elements
 *   flanking the left and right, center column clear, with mouse parallax and scroll outward drift/fade.
 * - Fits within the first viewport at 1920x1080 and 1366x768.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT } from '../config'
import './hero.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  /** False while loading screen is active */
  ready?: boolean
}

// 5 character silhouettes flanking the sides (pure images, no background boxes/color-washes)
const SILHOUETTES = [
  // Left flank
  {
    id: 'cybersec',
    src: '/characters/cybersec.png',
    name: 'Captain America',
    side: 'left' as const,
    className: 'hidden sm:block -left-4 md:left-[1%] lg:left-[3%] top-[12%] h-[48vh] max-h-[460px] w-auto z-[1]',
    depth: 0.25,
    floatDuration: 8.5,
    floatDelay: 0,
    opacity: 0.11,
  },
  {
    id: 'aiml',
    src: '/characters/aiml.png',
    name: 'Iron Man',
    side: 'left' as const,
    className: 'left-[2%] sm:left-[8%] lg:left-[11%] top-[24%] h-[42vh] max-h-[400px] w-auto z-[2]',
    depth: 0.5,
    floatDuration: 7.2,
    floatDelay: 1.2,
    opacity: 0.13,
    mobileVisible: true,
  },
  {
    id: 'robonyx',
    src: '/characters/robonyx.png',
    name: 'Ultron',
    side: 'left' as const,
    className: 'hidden md:block -left-8 lg:-left-2 top-[38%] h-[38vh] max-h-[360px] w-auto z-[1]',
    depth: 0.35,
    floatDuration: 9.0,
    floatDelay: 2.4,
    opacity: 0.09,
  },
  // Right flank
  {
    id: 'coderun',
    src: '/characters/coderun.png',
    name: 'Doctor Strange',
    side: 'right' as const,
    className: 'hidden sm:block -right-4 md:right-[1%] lg:right-[3%] top-[10%] h-[50vh] max-h-[480px] w-auto z-[1]',
    depth: 0.28,
    floatDuration: 8.0,
    floatDelay: 0.8,
    opacity: 0.11,
  },
  {
    id: 'web3',
    src: '/characters/web3.png',
    name: 'Black Panther',
    side: 'right' as const,
    className: 'right-[2%] sm:right-[8%] lg:right-[11%] top-[25%] h-[42vh] max-h-[400px] w-auto z-[2]',
    depth: 0.55,
    floatDuration: 7.6,
    floatDelay: 1.8,
    opacity: 0.13,
    mobileVisible: true,
  },
]

export function Hero({ ready = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const leftGroupRef = useRef<HTMLDivElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const textGroupRef = useRef<HTMLDivElement>(null)
  const crackRef = useRef<SVGSVGElement>(null)

  // Verify PNG transparency: if a PNG has an opaque background, hide it and log warning
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const img = e.currentTarget
      const canvas = document.createElement('canvas')
      canvas.width = 16
      canvas.height = 16
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, 16, 16)
        const pixel = ctx.getImageData(0, 0, 1, 1).data
        // Corner pixel is fully opaque without alpha
        if (pixel[3] === 255 && (pixel[0] > 240 || pixel[0] < 15)) {
          console.warn(`[Hero] Silhouette ${img.src} has a non-transparent background; skipped silently.`)
          img.style.display = 'none'
        }
      }
    } catch {
      // CORS or canvas error, maintain default image rendering
    }
  }

  // Mouse parallax with individual depths per layer
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let quickXLeft: ((v: number) => void) | null = null
    let quickYLeft: ((v: number) => void) | null = null
    let quickXRight: ((v: number) => void) | null = null
    let quickYRight: ((v: number) => void) | null = null

    if (leftGroupRef.current) {
      quickXLeft = gsap.quickTo(leftGroupRef.current, 'x', { duration: 1.2, ease: 'power2.out' })
      quickYLeft = gsap.quickTo(leftGroupRef.current, 'y', { duration: 1.2, ease: 'power2.out' })
    }
    if (rightGroupRef.current) {
      quickXRight = gsap.quickTo(rightGroupRef.current, 'x', { duration: 1.2, ease: 'power2.out' })
      quickYRight = gsap.quickTo(rightGroupRef.current, 'y', { duration: 1.2, ease: 'power2.out' })
    }

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2

      quickXLeft?.(nx * -20)
      quickYLeft?.(ny * -14)
      quickXRight?.(nx * 20)
      quickYRight?.(ny * -14)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  // Scroll animations: silhouettes drift outward and fade away as Tracks section starts
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !ready) return

    const ctx = gsap.context(() => {
      // Left silhouettes drift outward left
      if (leftGroupRef.current) {
        gsap.to(leftGroupRef.current, {
          xPercent: -35,
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

      // Right silhouettes drift outward right
      if (rightGroupRef.current) {
        gsap.to(rightGroupRef.current, {
          xPercent: 35,
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

      // Red multiverse crack fades on scroll
      if (crackRef.current) {
        gsap.to(crackRef.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '50% top',
            scrub: true,
          },
        })
      }

      // Centered text lifts and fades
      if (textGroupRef.current) {
        gsap.to(textGroupRef.current, {
          yPercent: -12,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '50% top',
            scrub: true,
          },
        })
      }
    }, hero)

    return () => ctx.revert()
  }, [ready])

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-label={`${EVENT.name} — Enter the Multiverse`}
      className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden pt-20 sm:pt-24 pb-8 px-4 sm:px-6 select-none"
    >
      {/* ── ONE Small Dim Corner Label (Top-Left) ── */}
      <div
        className="absolute top-20 left-8 sm:left-12 font-mono text-[9px] tracking-widest text-white/40 flex items-center gap-2 pointer-events-none select-none z-20"
        aria-hidden="true"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#e23636]/80 animate-pulse" />
        <span>MULTIVERSE SECTOR 05 // REALITY DETECTED</span>
      </div>

      {/* ── Faint Thin Red Multiverse Crack of Light ── */}
      <svg
        ref={crackRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[240px] h-[100svh] opacity-[0.07] pointer-events-none z-[1]"
        viewBox="0 0 240 800"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M120 0 L124 130 L117 260 L127 380 L115 510 L123 660 L120 800"
          stroke="#ff2424"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M120 0 L124 130 L117 260 L127 380 L115 510 L123 660 L120 800"
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeOpacity="0.85"
        />
      </svg>

      {/* ── BACKGROUND CHARACTER SILHOUETTES (Flanking Left, Pure <img> Only) ── */}
      <div ref={leftGroupRef} className="absolute inset-y-0 left-0 w-1/2 pointer-events-none z-[2]" aria-hidden="true">
        {SILHOUETTES.filter((s) => s.side === 'left').map((s) => (
          <div
            key={s.id}
            className={`absolute pointer-events-none ${s.className} hero-float-anim`}
            style={{
              animationDuration: `${s.floatDuration}s`,
              animationDelay: `${s.floatDelay}s`,
            }}
          >
            <img
              src={s.src}
              alt=""
              onLoad={handleImageLoad}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="hero-silhouette-img w-full h-full"
              style={{
                opacity: s.opacity,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── BACKGROUND CHARACTER SILHOUETTES (Flanking Right, Pure <img> Only) ── */}
      <div ref={rightGroupRef} className="absolute inset-y-0 right-0 w-1/2 pointer-events-none z-[2]" aria-hidden="true">
        {SILHOUETTES.filter((s) => s.side === 'right').map((s) => (
          <div
            key={s.id}
            className={`absolute pointer-events-none ${s.className} hero-float-anim`}
            style={{
              animationDuration: `${s.floatDuration}s`,
              animationDelay: `${s.floatDelay}s`,
            }}
          >
            <img
              src={s.src}
              alt=""
              onLoad={handleImageLoad}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="hero-silhouette-img w-full h-full"
              style={{
                opacity: s.opacity,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── CENTERED HERO CONTENT (All fits cleanly inside the first screen) ── */}
      <div
        ref={textGroupRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center my-auto w-full px-2"
      >
        {/* Optional slot: render /brand/official-logo.svg only if that file exists */}
        <img
          src="/brand/official-logo.svg"
          alt=""
          aria-hidden="true"
          className="h-7 w-auto mb-2 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* 1. Small red spaced text */}
        <p className="font-body text-xs sm:text-sm tracking-[0.42em] sm:tracking-[0.5em] text-[#e23636] uppercase font-semibold mb-2">
          {EVENT.hostedBy} PRESENTS
        </p>

        {/* 2. Huge HACK-A-SOL on ONE line */}
        <h1 className="hero-hackasol-title select-none my-1">
          HACK-A-SOL
        </h1>

        {/* 3. 5.0 between two thin horizontal lines */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-5 my-1 sm:my-2">
          <div className="h-px w-10 sm:w-16 bg-white/20" />
          <span className="font-heading text-xl sm:text-2xl md:text-3xl tracking-[0.45em] text-white/80 font-bold pl-2">
            {EVENT.edition}
          </span>
          <div className="h-px w-10 sm:w-16 bg-white/20" />
        </div>

        {/* 4. MARVEL comic-style title treatment (skewed red slab) */}
        <div className="my-1 sm:my-2">
          <div className="hero-marvel-slab">
            <span className="hero-marvel-text">{EVENT.theme}</span>
          </div>
        </div>

        {/* 5. Centered Description */}
        <p className="font-body text-xs sm:text-sm md:text-base text-white/70 max-w-xl mx-auto my-3 sm:my-4 leading-relaxed font-light px-4">
          The flagship hackathon of {EVENT.hostedBy} returns. 5 specialised tracks. 5 Marvel champions. One multiverse to conquer.
        </p>

        {/* 6. Two centered buttons: COMING SOON and BECOME A SPONSOR */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          {/* COMING SOON CTA */}
          <a
            id="hero-register-btn"
            href={EVENT.registrationLink}
            data-magnetic
            className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white bg-[#e23636] hover:bg-[#ff4444] rounded-sm transition-all duration-300 shadow-[0_0_24px_rgba(226,54,54,0.45)] hover:shadow-[0_0_36px_rgba(226,54,54,0.65)] hover:scale-105 active:scale-95"
          >
            <span>{EVENT.registrationStatus.toUpperCase()}</span>
          </a>

          {/* BECOME A SPONSOR CTA */}
          <a
            id="hero-sponsor-btn"
            href="#why-sponsor"
            data-magnetic
            className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white/85 hover:text-white border border-white/25 hover:border-white/60 bg-white/[0.03] hover:bg-white/[0.08] rounded-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>BECOME A SPONSOR</span>
          </a>
        </div>
      </div>
    </section>
  )
}
