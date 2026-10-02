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

import { useEffect, useRef, useState } from 'react'
import { TRACKS } from '../data/tracks'
import { sound } from '../utils/audio'

interface TracksProps {
  activeTrackIndex: number
}

export function Tracks({ activeTrackIndex }: TracksProps) {
  const active    = TRACKS[activeTrackIndex]
  const lastIndex = useRef(activeTrackIndex)
  const [gridOpen, setGridOpen] = useState(false)

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

        {/* ── Track nav dots (All 5 tracks derived from TRACKS) ─────── */}
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
                0{i + 1} // {track.character}
              </span>
            </button>
          ))}
        </div>

        {/* ── Chapter counter & Overview trigger (top-right) ──────── */}
        <div className="absolute top-8 right-8 text-right z-20 hidden md:block">
          <p className="font-heading text-8xl text-white/5 leading-none select-none">
            0{activeTrackIndex + 1}
          </p>
          <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase">
            of {TRACKS.length} Tracks
          </p>
          <button
            type="button"
            data-magnetic
            onClick={() => {
              sound.playClick()
              setGridOpen(true)
            }}
            onMouseEnter={() => sound.playHover()}
            className="mt-2 text-[10px] font-mono tracking-widest text-marvel-red/90 hover:text-white border border-marvel-red/40 hover:border-white/50 px-2.5 py-1 rounded-sm bg-marvel-red/10 hover:bg-marvel-red/20 backdrop-blur-sm transition-all flex items-center gap-1.5 ml-auto"
          >
            <span>⊞</span>
            <span>ALL {TRACKS.length} TRACKS GRID</span>
          </button>
        </div>

        {/* ═══════ DESKTOP: CHARACTER OVERLAYS IN EMPTY HALF (55%) ═══════ */}
        {/* Even tracks (0,2,4): character on RIGHT. Odd tracks (1,3): character on LEFT */}
        <div
          className={`absolute inset-y-0 hidden md:flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${
            activeTrackIndex % 2 === 0 ? 'right-0' : 'left-0'
          }`}
          style={{ width: '55%' }}
        >
          {/* Soft glow disc */}
          <div
            className="absolute w-[36vw] h-[36vw] rounded-full transition-all duration-1000 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${active?.accentColor ?? '#E23636'}25 0%, transparent 70%)`,
              filter: 'blur(50px)',
            }}
          />

          {/* Outlined character-name watermark */}
          <p
            aria-hidden="true"
            className="absolute font-heading select-none text-center leading-none pointer-events-none"
            style={{
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              color: 'transparent',
              WebkitTextStroke: `1px ${active?.accentColor ?? '#E23636'}25`,
              letterSpacing: '0.12em',
              transition: 'all 0.7s',
              userSelect: 'none',
            }}
          >
            {active?.character.toUpperCase()}
          </p>

          {/* Character chip — sits below the model */}
          <div
            className="absolute bottom-20 flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-700 pointer-events-auto"
            style={{
              borderColor:    `${active?.accentColor ?? '#E23636'}50`,
              background:     'rgba(5,5,8,0.7)',
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
            <span className="font-mono text-[10px] text-white/40 pl-2 border-l border-white/10">
              TRACK {String(activeTrackIndex + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* ═══════ MOBILE: TOP 45vh SPACER + CHIP ═══════ */}
        <div className="md:hidden h-[45vh] flex items-end justify-center pb-4 pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-sm border pointer-events-auto"
            style={{
              borderColor: `${active?.accentColor ?? '#E23636'}50`,
              background:  'rgba(5,5,8,0.75)',
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
          </div>
        </div>

        {/* ═══════ TEXT COLUMN (~45% WIDTH) WITH TEXT-SIDE ONLY SCRIM ═══════ */}
        {/* Even tracks (0,2,4): text on LEFT. Odd tracks (1,3): text on RIGHT. */}
        <div
          className={`absolute inset-y-0 flex items-center transition-all duration-700 ${
            activeTrackIndex % 2 === 0
              ? 'left-0 md:w-[48%] md:pl-20 md:pr-8'
              : 'right-0 md:w-[48%] md:pr-20 md:pl-8'
          } w-full`}
        >
          {/* Soft gradient scrim ONLY behind the text column — model side stays 100% transparent */}
          <div
            className="absolute inset-0 hidden md:block pointer-events-none transition-all duration-700"
            style={{
              background: activeTrackIndex % 2 === 0
                ? 'linear-gradient(to right, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)'
                : 'linear-gradient(to left, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.75) 75%, transparent 100%)',
            }}
          />
          {/* Mobile bottom scrim */}
          <div
            className="absolute inset-0 block md:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,8,0.92) 20%, rgba(5,5,8,0.98) 100%)' }}
          />

          {/* Text content */}
          <div className="relative z-10 w-full px-6 md:px-0 mt-[45vh] md:mt-0">
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
            <p className="font-body text-white/60 text-base leading-relaxed max-w-md mb-8">
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

              {/* View All Tracks Grid Button */}
              <button
                type="button"
                data-magnetic
                onClick={() => {
                  sound.playClick()
                  setGridOpen(true)
                }}
                onMouseEnter={() => sound.playHover()}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-sm font-mono text-xs tracking-wider uppercase text-white/70 hover:text-white hover:border-white/50 transition-all bg-white/5 hover:bg-white/10"
              >
                <span>⊞</span>
                <span>ALL {TRACKS.length} TRACKS</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ═══════ ALL 5 TRACKS OVERVIEW MODAL / GRID ═══════ */}
      {gridOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All 5 Tracks Overview Grid"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center p-4 sm:p-8 animate-fadeIn overflow-y-auto"
        >
          <div className="w-full max-w-7xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <p className="font-body text-xs tracking-[0.4em] text-marvel-red uppercase">
                  Multiverse Protocols // Directory
                </p>
                <h3 className="font-heading text-3xl sm:text-4xl text-white tracking-wide">
                  ALL {TRACKS.length} MISSION TRACKS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setGridOpen(false)
                }}
                className="px-4 py-2 border border-white/20 rounded-sm font-mono text-xs tracking-widest text-white/60 hover:text-white hover:border-marvel-red hover:bg-marvel-red/20 transition-all"
              >
                ✕ ESC / CLOSE
              </button>
            </div>

            {/* 5-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {TRACKS.map((track, i) => (
                <div
                  key={track.id}
                  className="border rounded-sm p-5 bg-white/[0.03] hover:bg-white/[0.06] transition-all flex flex-col justify-between group"
                  style={{
                    borderColor: i === activeTrackIndex ? track.accentColor : 'rgba(255,255,255,0.1)',
                    boxShadow: i === activeTrackIndex ? `0 0 20px ${track.accentColor}30` : 'none',
                  }}
                >
                  <div>
                    {/* Top Row: Icon & Track Number */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{track.icon}</span>
                      <span className="font-mono text-xs text-white/40">
                        0{i + 1} / 0{TRACKS.length}
                      </span>
                    </div>

                    {/* Character Tag */}
                    <p
                      className="font-mono text-[10px] tracking-widest uppercase font-semibold mb-1"
                      style={{ color: track.accentColor }}
                    >
                      {track.character}
                    </p>

                    {/* Track Name */}
                    <h4 className="font-heading text-2xl text-white mb-2 leading-tight">
                      {track.name}
                    </h4>

                    {/* Tagline */}
                    <p
                      className="font-body text-xs font-medium mb-3"
                      style={{ color: track.accentColor }}
                    >
                      "{track.tagline}"
                    </p>

                    {/* Description */}
                    <p className="font-body text-xs text-white/60 leading-relaxed mb-4">
                      {track.description}
                    </p>
                  </div>

                  <div>
                    {/* Primitive badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 px-2 py-0.5 border border-white/10 rounded-sm font-mono text-[10px] text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: track.accentColor }} />
                      <span>{track.primitive}</span>
                    </div>

                    {/* Jump Button */}
                    <button
                      type="button"
                      onClick={() => {
                        scrollToTrack(i)
                        setGridOpen(false)
                      }}
                      className="w-full py-2 border rounded-sm font-mono text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1"
                      style={{
                        borderColor: `${track.accentColor}80`,
                        color: track.accentColor,
                        backgroundColor: `${track.accentColor}15`,
                      }}
                    >
                      <span>GO TO CHAPTER</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
