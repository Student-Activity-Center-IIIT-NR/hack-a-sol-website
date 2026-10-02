/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-height landing section. The R3F Canvas behind it shows Iron Man's
 * icosahedron. Text fades in on load.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { EVENT } from '../config'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const tl = gsap.timeline({ delay: 0.3 })
    tl.fromTo(
      containerRef.current.querySelectorAll('.hero-anim'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out' },
    )
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Halftone dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Bottom gradient to blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-marvel-darker to-transparent pointer-events-none" />

      <div ref={containerRef} className="relative text-center max-w-5xl mx-auto">
        {/* Eyebrow */}
        <p className="hero-anim font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-6 opacity-0">
          {EVENT.hostedBy} Presents
        </p>

        {/* Main heading */}
        <h1 className="hero-anim font-heading text-7xl sm:text-[10rem] leading-none tracking-widest text-white mb-4 opacity-0">
          HACK
          <br />
          <span className="text-marvel-red">-A-SOL</span>
        </h1>

        {/* Edition badge */}
        <div className="hero-anim inline-flex items-center gap-3 mb-6 opacity-0">
          <div className="h-px w-12 bg-white/20" />
          <span className="font-heading text-2xl tracking-[0.6em] text-white/60">5.0</span>
          <div className="h-px w-12 bg-white/20" />
        </div>

        {/* Theme */}
        <p className="hero-anim font-heading text-3xl tracking-[1em] text-white/40 mb-8 opacity-0">
          {EVENT.theme}
        </p>

        {/* Sub tagline */}
        <p className="hero-anim font-body text-lg text-white/60 max-w-2xl mx-auto mb-10 opacity-0">
          The flagship hackathon of IIIT Naya Raipur returns. Five tracks. Five champions.
          One universe.
        </p>

        {/* CTAs */}
        <div className="hero-anim flex flex-wrap items-center justify-center gap-4 opacity-0">
          <a
            id="hero-register-btn"
            href={EVENT.registrationLink}
            className="px-8 py-3.5 font-heading tracking-widest text-sm bg-marvel-red text-white rounded-sm hover:bg-red-700 transition-all hover:shadow-[0_0_30px_rgba(226,54,54,0.6)] hover:scale-105 active:scale-95"
          >
            {EVENT.registrationStatus.toUpperCase()}
          </a>
          <a
            id="hero-sponsor-btn"
            href="#why-sponsor"
            className="px-8 py-3.5 font-heading tracking-widest text-sm border border-white/20 text-white rounded-sm hover:border-white/50 hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            BECOME A SPONSOR
          </a>
        </div>

        {/* Date badge */}
        <p className="hero-anim mt-8 font-body text-xs text-white/30 tracking-widest uppercase opacity-0">
          📅 {EVENT.date}
        </p>

        {/* Scroll indicator */}
        <div className="hero-anim absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
          <span className="text-white/20 text-xs tracking-widest uppercase font-body">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
