/**
 * src/sections/Timeline.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned Marvel cinematic timeline — vertical comic-panel layout with
 * animated glow connectors, milestone icons, descriptions, and step badges.
 * All dates TBA from config.ts.
 */

import { TIMELINE } from '../config'

export function Timeline() {
  return (
    <section id="timeline" className="relative px-6 py-32 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-marvel-red/5 rounded-full blur-[140px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Halftone texture overlay */}
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Mission Schedule
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4">
            TIMELINE
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-marvel-red/60" />
            <p className="font-body text-white/40 text-sm tracking-widest uppercase">
              All dates TBA — updates coming soon
            </p>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-marvel-red/60" />
          </div>
        </div>

        {/* Timeline items */}
        <div className="relative">
          {/* Vertical glowing spine */}
          <div className="absolute left-[2.25rem] top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-marvel-red/80 via-marvel-red/30 to-transparent" />
            {/* Animated pulse along the spine */}
            <div
              className="absolute top-0 w-full bg-gradient-to-b from-white/60 via-marvel-red/40 to-transparent"
              style={{
                height: '40%',
                animation: 'timelinePulse 3s ease-in-out infinite',
              }}
            />
          </div>

          <div className="space-y-6">
            {TIMELINE.map(({ label, date, icon, description }, i) => (
              <div
                key={label}
                className="relative flex items-start gap-6 pl-20 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Step number — far left */}
                <span
                  className="absolute left-0 top-4 font-heading text-xs text-white/15 w-8 text-center select-none"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon orb on the spine */}
                <div
                  className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-marvel-darker border-2 border-marvel-red/50 group-hover:border-marvel-red group-hover:shadow-[0_0_20px_rgba(226,54,54,0.6)] transition-all duration-500 text-lg select-none z-10"
                  style={{ left: '0.75rem', top: '0.5rem' }}
                >
                  {icon}
                </div>

                {/* Content card */}
                <div className="flex-1 border border-white/8 rounded-sm bg-white/[0.02] group-hover:border-marvel-red/30 group-hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
                  {/* Red top accent bar — expands on hover */}
                  <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-marvel-red to-transparent transition-all duration-700" />

                  <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl sm:text-2xl text-white tracking-wide group-hover:text-marvel-red transition-colors duration-300">
                        {label}
                      </h3>
                      <p className="font-body text-sm text-white/40 mt-1.5 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Date badge */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-2 px-4 py-2 border border-marvel-red/30 rounded-sm bg-marvel-red/5 group-hover:bg-marvel-red/10 group-hover:border-marvel-red/60 transition-all duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-marvel-red animate-pulse" />
                        <span className="font-heading text-sm text-marvel-red tracking-widest">
                          {date}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-16 text-center">
          <p className="font-body text-xs text-white/20 tracking-[0.4em] uppercase">
            Stay tuned — follow our socials for instant updates
          </p>
        </div>
      </div>
    </section>
  )
}
