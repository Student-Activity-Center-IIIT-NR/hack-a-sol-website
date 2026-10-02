/**
 * src/sections/Timeline.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Event timeline — all dates TBA from config.ts.
 * Visual: vertical comic-panel timeline with connectors.
 */

import { TIMELINE } from '../config'

export function Timeline() {
  return (
    <section id="timeline" className="relative min-h-screen flex items-center px-6 py-32">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Schedule
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4">
            TIMELINE
          </h2>
          <p className="font-body text-white/40 text-sm tracking-widest">
            All dates are TBA — updates coming soon
          </p>
        </div>

        {/* Timeline items */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-marvel-red/60 via-white/10 to-transparent" />

          <div className="space-y-8">
            {TIMELINE.map(({ label, date }, i) => (
              <div key={label} className="relative flex items-start gap-6 pl-14 group">
                {/* Dot */}
                <div
                  className="absolute left-[18px] w-4 h-4 rounded-full border-2 border-marvel-red bg-marvel-darker group-hover:bg-marvel-red transition-colors duration-300 -translate-x-1/2 mt-1"
                  style={{ top: '4px' }}
                />

                {/* Step number */}
                <span className="absolute left-0 top-0 font-heading text-xs text-white/20 w-10 text-right pr-2 pt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="border border-white/10 rounded-sm px-6 py-4 bg-white/[0.02] flex-1 group-hover:border-marvel-red/30 transition-colors duration-300">
                  <h3 className="font-heading text-xl text-white tracking-wide">{label}</h3>
                  <p className="font-body text-sm text-marvel-red/70 mt-1 tracking-widest">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
