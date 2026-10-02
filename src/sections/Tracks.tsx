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

import { useEffect, useRef } from 'react'
import { TRACKS } from '../data/tracks'
import { sound } from '../utils/audio'

interface TracksProps {
  /** 0–4, controlled by parent App based on scroll progress */
  activeTrackIndex: number
}

export function Tracks({ activeTrackIndex }: TracksProps) {
  const active = TRACKS[activeTrackIndex]
  const lastIndex = useRef(activeTrackIndex)

  useEffect(() => {
    if (lastIndex.current !== activeTrackIndex) {
      sound.playTrackSwitch()
      lastIndex.current = activeTrackIndex
    }
  }, [activeTrackIndex])

  const scrollToTrack = (index: number) => {
    sound.playClick()
    const tracksEl = document.getElementById('tracks')
    if (tracksEl) {
      const rect = tracksEl.getBoundingClientRect()
      const scrollY = window.scrollY + rect.top + (index / TRACKS.length) * tracksEl.offsetHeight
      window.scrollTo({ top: scrollY, behavior: 'smooth' })
    }
  }

  return (
    <section id="tracks" className="relative" style={{ height: `${TRACKS.length * 100}vh` }}>
      {/* Sticky container — stays fixed while section scrolls */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Left red bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: active?.accentColor + '60' }} />

        {/* Track indicator dots */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {TRACKS.map((track, i) => (
            <button
              key={track.id}
              type="button"
              data-magnetic
              onClick={() => scrollToTrack(i)}
              onMouseEnter={() => sound.playHover()}
              className="group flex items-center gap-3 text-left focus:outline-none"
              aria-label={`Jump to ${track.name}`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/30 transition-all duration-500 group-hover:scale-125"
                style={i === activeTrackIndex ? {
                  backgroundColor: track.accentColor,
                  borderColor: track.accentColor,
                  boxShadow: `0 0 12px ${track.accentColor}`,
                  transform: 'scale(1.5)',
                } : {}}
              />
              <span
                className={`font-mono text-[10px] tracking-widest uppercase transition-opacity duration-300 hidden md:inline ${
                  i === activeTrackIndex ? 'opacity-90 text-white font-bold' : 'opacity-0 group-hover:opacity-60 text-white/50'
                }`}
                style={i === activeTrackIndex ? { color: track.accentColor } : {}}
              >
                0{i + 1} // {track.character.split(' ')[0]}
              </span>
            </button>
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

          {/* Target telemetry & Interactive Lock-on badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-sm bg-white/5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: active?.accentColor }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: active?.accentColor }}
                />
              </span>
              <span className="font-mono text-xs text-white/60 tracking-widest uppercase">
                CORE: {active?.primitive}
              </span>
            </div>

            <a
              href="#timeline"
              data-magnetic
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-sm font-mono text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                borderColor: `${active?.accentColor}60`,
                color: active?.accentColor,
                backgroundColor: `${active?.accentColor}10`,
              }}
            >
              <span>MISSION PROTOCOLS</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
