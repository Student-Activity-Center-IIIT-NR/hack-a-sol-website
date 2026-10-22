/**
 * src/sections/EventDate.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bold date band — a visually striking mid-page band showing the event date.
 * Large typographic display with a glowing red accent. Not a full page section.
 */

import { EVENT } from '../config'

export function EventDate() {
  return (
    <section
      id="event-date"
      className="relative px-6 py-20 overflow-hidden"
    >
      {/* Red glow spread */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[200px] bg-marvel-red/10 blur-[80px] rounded-full" />
      </div>

      {/* Top & bottom border lines — full width red gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-marvel-red/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-marvel-red/60 to-transparent" />

      {/* Halftone texture */}
      <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: label */}
          <div className="text-center md:text-left">
            <p className="font-body text-xs tracking-[0.6em] text-white/30 uppercase mb-2">
              Mark Your Calendar
            </p>
            <p className="font-body text-sm text-white/50 tracking-widest">
              {EVENT.hostedBy} presents
            </p>
          </div>

          {/* Center: big date */}
          <div className="text-center flex-1">
            {/* Decorative HACK-A-SOL above */}
            <p
              className="font-heading text-lg tracking-[0.6em] text-white/20 mb-1 select-none"
              style={{ letterSpacing: '0.5em' }}
            >
              HACK-A-SOL
            </p>

            {/* The actual date — huge Marvel-style */}
            <div className="relative inline-block">
              <p
                className="font-heading text-5xl sm:text-7xl md:text-8xl text-white leading-none tracking-wide"
                style={{
                  textShadow: '0 0 60px rgba(226,54,54,0.4), 0 0 120px rgba(226,54,54,0.15)',
                }}
              >
                {EVENT.date}
              </p>
              {/* Underline glow */}
              <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-transparent via-marvel-red to-transparent" />
            </div>

            {/* Edition chip below */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 border border-marvel-red/30 rounded-sm bg-marvel-red/8">
              <span className="w-1.5 h-1.5 rounded-full bg-marvel-red animate-pulse" />
              <span className="font-heading text-xs tracking-[0.4em] text-marvel-red uppercase">
                Edition {EVENT.edition} — {EVENT.theme}
              </span>
            </div>
          </div>

          {/* Right: venue */}
          <div className="text-center md:text-right">
            <p className="font-body text-xs tracking-[0.6em] text-white/30 uppercase mb-2">
              Venue
            </p>
            <p className="font-body text-sm text-white/60">
              {EVENT.venue}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
