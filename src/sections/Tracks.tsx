/**
 * src/sections/Tracks.tsx  (Phase 3b — left-model / right-text layout)
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout: 3D character lives in the LEFT ~55 % (canvas shows through).
 *         Text column occupies the RIGHT ~45 % with a dark gradient backing.
 *
 * HTML overlays on the left (no canvas involvement):
 *   • Big outlined character-name watermark (low-opacity)
 *   • Soft accent-color glow disc (CSS radial gradient)
 *   • Character-name + track-number chip near bottom
 *
 * Mobile layout: transparent 45 vh spacer on top (model visible) then text.
 */

import { useEffect, useRef } from 'react'
import { TRACKS } from '../data/tracks'
import { sound } from '../utils/audio'

interface TracksProps {
  activeTrackIndex: number
}

export function Tracks({ activeTrackIndex }: TracksProps) {
  const active    = TRACKS[activeTrackIndex]
  const lastIndex = useRef(activeTrackIndex)

  useEffect(() => {
    if (lastIndex.current !== activeTrackIndex) {
      sound.playTrackSwitch()
      lastIndex.current = activeTrackIndex
    }
  }, [activeTrackIndex])

  const scrollToTrack = (index: number) => {
    sound.playClick()
    const el = document.getElementById('tracks')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top + (index / TRACKS.length) * el.offsetHeight, behavior: 'smooth' })
    }
  }

  return (
    <section id="tracks" className="relative" style={{ height: `${TRACKS.length * 100}vh` }}>
      {/* Sticky fullscreen container */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Left accent bar ──────────────────────────────────────── */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-700"
          style={{ backgroundColor: (active?.accentColor ?? '#E23636') + '60' }}
        />

        {/* ── Track nav dots ───────────────────────────────────────── */}
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
                  borderColor:     track.accentColor,
                  boxShadow:       `0 0 12px ${track.accentColor}`,
                  transform:       'scale(1.5)',
                } : {}}
              />
              <span
                className={`font-mono text-[10px] tracking-widest uppercase transition-opacity duration-300 hidden md:inline ${
                  i === activeTrackIndex
                    ? 'opacity-90 font-bold text-white'
                    : 'opacity-0 group-hover:opacity-60 text-white/50'
                }`}
                style={i === activeTrackIndex ? { color: track.accentColor } : {}}
              >
                0{i + 1} // {track.character.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Chapter counter (top-right) ──────────────────────────── */}
        <div className="absolute top-8 right-8 text-right z-20 hidden md:block">
          <p className="font-heading text-8xl text-white/5 leading-none select-none">
            0{activeTrackIndex + 1}
          </p>
          <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase">
            of {TRACKS.length} Tracks
          </p>
        </div>

        {/* ═══════ LEFT 55 % — model shows through + HTML overlays ══════ */}
        <div
          className="absolute inset-y-0 left-0 hidden md:flex flex-col items-center justify-center pointer-events-none"
          style={{ width: '55%' }}
        >
          {/* Soft glow disc */}
          <div
            className="absolute w-[40vw] h-[40vw] rounded-full transition-all duration-1000 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${active?.accentColor ?? '#E23636'}20 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
          />

          {/* Outlined character-name watermark */}
          <p
            aria-hidden="true"
            className="absolute font-heading select-none text-center leading-none"
            style={{
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              color: 'transparent',
              WebkitTextStroke: `1px ${active?.accentColor ?? '#E23636'}25`,
              letterSpacing: '0.12em',
              transition: 'color 0.7s, -webkit-text-stroke-color 0.7s',
              userSelect: 'none',
            }}
          >
            {active?.character.toUpperCase()}
          </p>

          {/* Character chip — sits below the model (~70 % down the left column) */}
          <div
            className="absolute bottom-24 flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-700"
            style={{
              borderColor:    `${active?.accentColor ?? '#E23636'}50`,
              background:     'rgba(5,5,8,0.65)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-sm">{active?.icon}</span>
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: active?.accentColor }}
            >
              {active?.character.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-white/30 pl-2 border-l border-white/10">
              TRACK {String(activeTrackIndex + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* ═══════ MOBILE — 45 vh spacer (model visible above fold) ═════ */}
        <div className="md:hidden h-[45vh] flex items-end justify-center pb-4 pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-sm border pointer-events-auto"
            style={{
              borderColor: `${active?.accentColor ?? '#E23636'}50`,
              background:  'rgba(5,5,8,0.7)',
            }}
          >
            <span className="text-sm">{active?.icon}</span>
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: active?.accentColor }}
            >
              {active?.character.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ═══════ RIGHT 45 % — text with opaque dark backing ════════════ */}
        <div
          className="absolute inset-y-0 right-0 flex items-center"
          style={{
            width: '100%',
            // On desktop: right 45 %, gradient from transparent to dark
            // On mobile: full width below the 45vh spacer (handled by flex-col layout)
          }}
        >
          {/* Dark backing gradient so text is always legible over 3D canvas */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(5,5,8,0.92) 12%, rgba(5,5,8,0.97) 100%)',
            }}
          />
          <div
            className="absolute inset-0 block md:hidden"
            style={{ background: 'rgba(5,5,8,0.88)' }}
          />

          {/* Text content */}
          <div
            className="relative z-10 w-full md:w-[45%] ml-auto px-8 md:pr-14 md:pl-6 mt-[45vh] md:mt-0"
          >
            {/* Track type badge */}
            <p
              className="font-body text-xs tracking-[0.5em] uppercase mb-4 transition-colors duration-700"
              style={{ color: active?.accentColor }}
            >
              {active?.icon} Track {String(activeTrackIndex + 1).padStart(2, '0')}
            </p>

            {/* Character name */}
            <p className="font-heading text-xl tracking-[0.4em] text-white/30 uppercase mb-2 transition-all duration-700">
              {active?.character}
            </p>

            {/* Track name */}
            <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4 transition-all duration-700">
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

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Live telemetry badge */}
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

              {/* CTA */}
              <a
                href="#timeline"
                data-magnetic
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-sm font-mono text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105"
                style={{
                  borderColor:     `${active?.accentColor}60`,
                  color:           active?.accentColor,
                  backgroundColor: `${active?.accentColor}10`,
                }}
              >
                <span>MISSION PROTOCOLS</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
