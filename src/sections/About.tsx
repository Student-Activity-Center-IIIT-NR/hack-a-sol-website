/**
 * src/sections/About.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * About Hack-A-Sol 5.0 — event overview stats and narrative.
 */

import { EVENT } from '../config'

const STATS = [
  { label: 'Edition',       value: EVENT.edition },
  { label: 'Participants',  value: EVENT.expectedParticipants },
  { label: 'Tracks',        value: '5' },
  { label: 'Prize Pool',    value: EVENT.prizePool },
]

export function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center px-6 py-32"
    >
      {/* Left red vertical bar — comic panel style */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-marvel-red/40" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <div>
          <p className="font-body text-xs tracking-[0.4em] text-marvel-red uppercase mb-4">
            About the Event
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-6">
            WHERE HEROES<br />
            <span className="text-white/30">ARE FORGED</span>
          </h2>
          <p className="font-body text-white/60 text-lg leading-relaxed mb-4">
            Hack-A-Sol is the flagship annual hackathon hosted by students of IIIT Naya Raipur.
            Now in its fifth edition and themed <span className="text-marvel-red font-medium">MARVEL</span>,
            it brings together the brightest minds across India to solve real-world challenges
            across five specialised tracks.
          </p>
          <p className="font-body text-white/40 text-base leading-relaxed">
            From AI pipelines to vibranium-grade security exploits — if you can imagine it,
            you can build it here.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-body text-xs text-white/20 tracking-widest uppercase">{EVENT.hostedBy}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>

        {/* Right: Stat grid */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="border border-white/10 rounded-sm p-6 bg-white/[0.02] hover:border-marvel-red/40 hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <p className="font-heading text-4xl text-white group-hover:text-marvel-red transition-colors">
                {value}
              </p>
              <p className="font-body text-xs text-white/40 tracking-widest uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
