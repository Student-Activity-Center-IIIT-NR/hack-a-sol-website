/**
 * src/sections/LastYear.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Hack-A-Sol 4.0 — A Look Back" section.
 * Features:
 *   - Cinematic section header
 *   - Animated stats row (participants, teams, tracks, prize pool, colleges, mentors)
 *   - Photo gallery grid with placeholder images (masonry-style)
 *   - Marvel-themed styling
 */

import { LAST_YEAR } from '../config'

const STATS = [
  { icon: '👥', value: LAST_YEAR.participants, label: 'Participants'  },
  { icon: '🤝', value: LAST_YEAR.teams,        label: 'Teams'         },
  { icon: '🎯', value: LAST_YEAR.tracks,       label: 'Tracks'        },
  { icon: '💰', value: LAST_YEAR.prizePool,    label: 'Prize Pool'    },
  { icon: '🏫', value: LAST_YEAR.colleges,     label: 'Colleges'      },
  { icon: '🧑‍🏫', value: LAST_YEAR.mentors,    label: 'Mentors'       },
]

/** Placeholder photo slots — each has a unique Marvel-inspired label */
const GALLERY_PHOTOS = [
  { id: 'g1', caption: 'Opening Ceremony',     wide: true  },
  { id: 'g2', caption: 'Team Hacking Session', wide: false },
  { id: 'g3', caption: 'Mentor Rounds',        wide: false },
  { id: 'g4', caption: 'Project Showcase',     wide: false },
  { id: 'g5', caption: 'Prize Distribution',   wide: false },
  { id: 'g6', caption: 'Closing Highlights',   wide: true  },
]

function PlaceholderPhoto({ caption, wide }: { caption: string; wide: boolean }) {
  return (
    <div
      className={`relative border border-white/8 rounded-sm overflow-hidden group bg-[#0A0A0F] hover:border-marvel-red/40 transition-all duration-500 ${wide ? 'col-span-2' : 'col-span-1'}`}
      style={{ minHeight: wide ? '200px' : '170px' }}
    >
      {/* Comic-panel fill */}
      <div className="absolute inset-0 halftone opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-marvel-red/5 via-transparent to-blue-500/5" />

      {/* Comic scan lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Center icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center">
          <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm3.75 0h.008v.008H13.5V12z" />
          </svg>
        </div>
        <p className="font-body text-[10px] text-white/20 tracking-widest uppercase">Photo</p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-marvel-red/0 group-hover:bg-marvel-red/5 transition-colors duration-500" />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="font-heading text-sm text-white tracking-wide">{caption}</p>
      </div>

      {/* Corner accent */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-marvel-red/40 group-hover:bg-marvel-red transition-colors duration-300" />
    </div>
  )
}

export function LastYear() {
  return (
    <section id="last-year" className="relative px-6 py-32 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-marvel-red/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 halftone opacity-25" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            The Legacy
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4">
            HACK-A-SOL<br />
            <span className="text-white/25">{LAST_YEAR.edition} — A LOOK BACK</span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {STATS.map(({ icon, value, label }, i) => (
            <div
              key={label}
              className="group border border-white/8 rounded-sm p-5 bg-white/[0.02] text-center hover:border-marvel-red/40 hover:bg-white/[0.05] transition-all duration-400"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-heading text-3xl text-white group-hover:text-marvel-red transition-colors duration-300">
                {value}
              </p>
              <p className="font-body text-[10px] text-white/30 tracking-widest uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider with label */}
        <div className="flex items-center gap-6 mb-10">
          <div className="flex-1 h-px bg-white/8" />
          <p className="font-body text-xs tracking-[0.5em] text-white/20 uppercase">Gallery</p>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Photo gallery — masonry grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[170px]">
          {GALLERY_PHOTOS.map(({ id, caption, wide }) => (
            <PlaceholderPhoto key={id} caption={caption} wide={wide} />
          ))}
        </div>

        {/* CTA below gallery */}
        <p className="text-center font-body text-xs text-white/20 tracking-widest uppercase mt-10">
          Real gallery photos from Hack-A-Sol 4.0 will be added here soon
        </p>
      </div>
    </section>
  )
}
