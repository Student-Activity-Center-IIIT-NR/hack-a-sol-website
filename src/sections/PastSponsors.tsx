/**
 * src/sections/PastSponsors.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Past sponsors showcase: large logo-only tiles in a responsive grid.
 * Staggered fade-up reveal on scroll, gentle floating logos, and a gold
 * glow + animated corner brackets on hover. Config-driven from PAST_SPONSORS.
 */

import { useEffect, useRef, useState } from 'react'
import { PAST_SPONSORS } from '../config'
import type { PastSponsor } from '../config'

/** Fires once when the element scrolls into view */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, inView] as const
}

const CORNER =
  'absolute w-3 h-3 border-marvel-gold/60 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-marvel-gold'

function SponsorTile({
  sponsor,
  index,
  show,
}: {
  sponsor: PastSponsor
  index: number
  show: boolean
}) {
  const [failed, setFailed] = useState(false)

  return (
    /* Outer wrapper handles the staggered reveal only */
    <div
      className={`transition-all duration-700 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: show ? `${index * 110}ms` : '0ms' }}
    >
      {/* Inner tile handles hover effects */}
      <div
        className={`group relative flex items-center justify-center h-40 sm:h-52 rounded-sm border overflow-hidden cursor-default select-none transition-all duration-500 hover:-translate-y-1.5 hover:border-marvel-gold/60 hover:shadow-[0_0_40px_rgba(245,166,35,0.22)] ${
          sponsor.onLight ? 'bg-white/95 border-white/20' : 'bg-white/[0.03] border-white/10'
        }`}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(245,166,35,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Corner brackets */}
        <span className={`${CORNER} top-2 left-2 border-t border-l`} />
        <span className={`${CORNER} top-2 right-2 border-t border-r`} />
        <span className={`${CORNER} bottom-2 left-2 border-b border-l`} />
        <span className={`${CORNER} bottom-2 right-2 border-b border-r`} />

        {/* Logo (gently floating, staggered per tile) */}
        <div
          className="sponsor-float relative z-10 flex items-center justify-center w-full h-full px-8"
          style={{ animationDelay: `${index * 0.6}s` }}
        >
          {failed ? (
            /* Temporary fallback if the logo file is missing */
            <span
              className={`font-heading text-2xl tracking-wide text-center ${
                sponsor.onLight ? 'text-black' : 'text-white'
              }`}
            >
              {sponsor.name}
            </span>
          ) : (
            <img
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              onError={() => setFailed(true)}
              draggable={false}
              className="h-20 sm:h-24 w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function PastSponsors() {
  const [gridRef, inView] = useInView<HTMLDivElement>()

  return (
    <section id="past-sponsors" className="relative py-24 overflow-hidden">
      <style>{`
        @keyframes sponsor-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .sponsor-float { animation: sponsor-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sponsor-float { animation: none; }
        }
      `}</style>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-marvel-gold/8 rounded-full blur-[100px]" />
      </div>

      {/* Top / bottom decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section header */}
      <div className="relative max-w-6xl mx-auto px-6 text-center mb-16">
        <p className="font-body text-xs tracking-[0.5em] text-marvel-gold uppercase mb-4">
          Our Past Allies
        </p>
        <h2 className="font-heading text-5xl sm:text-6xl text-white leading-none tracking-wide mb-4">
          PAST SPONSORS
        </h2>
        <p className="font-body text-white/30 text-sm tracking-widest max-w-lg mx-auto">
          Organizations that have powered Hack-A-Sol's previous editions.
          Join forces with us for 5.0.
        </p>
      </div>

      {/* Logo grid */}
      <div
        ref={gridRef}
        className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
      >
        {PAST_SPONSORS.map((s, i) => (
          <SponsorTile key={s.id} sponsor={s} index={i} show={inView} />
        ))}
      </div>

      {/* CTA */}
      
    </section>
  )
}