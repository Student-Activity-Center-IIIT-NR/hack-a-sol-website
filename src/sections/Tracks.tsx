/**
 * src/sections/Tracks.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Five "pinned" track chapters. As the user scrolls through this section,
 * the activeTrackIndex changes (driven by App.tsx via useActiveTrackIndex),
 * which both swaps the 3D object in the Canvas and updates the text content here.
 *
 * Each chapter shows the track name, character, tagline, and description
 * styled with the track's accent color.
 */

import { TRACKS } from '../data/tracks'

interface TracksProps {
  /** 0–4, controlled by parent App based on scroll progress */
  activeTrackIndex: number
}

export function Tracks({ activeTrackIndex }: TracksProps) {
  const active = TRACKS[activeTrackIndex]

  return (
    <section id="tracks" className="relative" style={{ height: `${TRACKS.length * 100}vh` }}>
      {/* Sticky container — stays fixed while section scrolls */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Left red bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: active?.accentColor + '60' }} />

        {/* Track indicator dots */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {TRACKS.map((track, i) => (
            <div
              key={track.id}
              className="w-2 h-2 rounded-full border border-white/20 transition-all duration-500"
              style={i === activeTrackIndex ? {
                backgroundColor: track.accentColor,
                boxShadow: `0 0 8px ${track.accentColor}`,
                transform: 'scale(1.4)',
              } : {}}
            />
          ))}
        </div>

        {/* Chapter counter */}
        <div className="absolute top-8 right-8 text-right">
          <p className="font-heading text-8xl text-white/5 leading-none select-none">
            0{activeTrackIndex + 1}
          </p>
          <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase">
            of {TRACKS.length} Tracks
          </p>
        </div>

        {/* Main content — right half (left half is R3F Canvas) */}
        <div className="ml-auto w-full md:w-1/2 px-8 md:pr-16">
          {/* Track type badge */}
          <p
            className="font-body text-xs tracking-[0.5em] uppercase mb-4 transition-colors duration-700"
            style={{ color: active?.accentColor }}
          >
            {active?.icon} Track {String(activeTrackIndex + 1).padStart(2, '0')}
          </p>

          {/* Character */}
          <p className="font-heading text-xl tracking-[0.4em] text-white/30 uppercase mb-2 transition-all duration-700">
            {active?.character}
          </p>

          {/* Track name */}
          <h2
            className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4 transition-all duration-700"
          >
            {active?.name}
          </h2>

          {/* Tagline */}
          <p
            className="font-body text-xl mb-6 transition-colors duration-700"
            style={{ color: active?.accentColor }}
          >
            {active?.tagline}
          </p>

          {/* Description */}
          <p className="font-body text-white/50 text-base leading-relaxed max-w-md mb-8">
            {active?.description}
          </p>

          {/* Primitive label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active?.accentColor }} />
            <span className="font-body text-xs text-white/30 tracking-widest uppercase">
              3D: {active?.primitive} placeholder
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
