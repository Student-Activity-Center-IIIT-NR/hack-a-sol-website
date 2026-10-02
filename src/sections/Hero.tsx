/**
 * src/sections/Hero.tsx  (Phase 2 — ScrollReveal + improved layout)
 */
import { ScrollReveal, FadeUp } from '../components/ScrollReveal'
import { EVENT } from '../config'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      {/* Comic halftone dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      {/* Bottom blend */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-marvel-darker to-transparent pointer-events-none" />

      <div className="relative text-center max-w-5xl mx-auto">
        <FadeUp className="mb-6">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase">
            {EVENT.hostedBy} Presents
          </p>
        </FadeUp>

        {/* Word-by-word staggered reveal */}
        <div className="mb-4">
          <ScrollReveal
            as="h1"
            className="font-heading text-7xl sm:text-[9rem] leading-none tracking-widest text-white block"
            stagger={0.08}
            duration={1.0}
          >
            HACK-A-SOL
          </ScrollReveal>
        </div>

        <FadeUp delay={0.3} className="inline-flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-white/20" />
          <span className="font-heading text-2xl tracking-[0.6em] text-white/60">5.0</span>
          <div className="h-px w-12 bg-white/20" />
        </FadeUp>

        <FadeUp delay={0.4}>
          <p className="font-heading text-3xl tracking-[1em] text-white/30 mb-8">{EVENT.theme}</p>
        </FadeUp>

        <FadeUp delay={0.5}>
          <p className="font-body text-lg text-white/60 max-w-2xl mx-auto mb-10">
            The flagship hackathon of IIIT Naya Raipur returns. Five tracks.
            Five Marvel champions. One universe to conquer.
          </p>
        </FadeUp>

        <FadeUp delay={0.6}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              id="hero-register-btn"
              href={EVENT.registrationLink}
              data-magnetic
              className="px-8 py-3.5 font-heading tracking-widest text-sm bg-marvel-red text-white rounded-sm hover:bg-red-700 transition-all hover:shadow-[0_0_30px_rgba(226,54,54,0.6)] hover:scale-105 active:scale-95"
            >
              {EVENT.registrationStatus.toUpperCase()}
            </a>
            <a
              id="hero-sponsor-btn"
              href="#why-sponsor"
              data-magnetic
              className="px-8 py-3.5 font-heading tracking-widest text-sm border border-white/20 text-white rounded-sm hover:border-white/50 hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
            >
              BECOME A SPONSOR
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.7}>
          <p className="mt-8 font-body text-xs text-white/30 tracking-widest uppercase">
            📅 {EVENT.date}
          </p>
        </FadeUp>

        {/* Scroll indicator */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/20 text-xs tracking-widest uppercase font-body">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
