/**
 * src/sections/Brochure.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium sponsor brochure section — dark cinematic editorial layout.
 * Left: vertical "SPONSOR KIT" label + event metadata list with line reveals.
 * Right: Jarvis-style HUD data dashboard with scan-line animation.
 * Bottom: full-width red download CTA bar.
 */

import { useEffect, useRef } from 'react'
import { EVENT, SPONSOR } from '../config'
import { TRACKS } from '../data/tracks'

/* ── stat rows shown in the HUD panel ─────────────────────────────────────── */
const HUD_STATS = [
  { label: 'TRACKS',            value: `${TRACKS.length}`,          unit: 'UNIVERSES'  },
  { label: 'TEAM SIZE',         value: '2–4',                       unit: 'MEMBERS'    },
  { label: 'FORMAT',            value: '24H',                       unit: 'NON-STOP'   },
  { label: 'PARTICIPANTS',      value: EVENT.expectedParticipants,  unit: 'EXPECTED'   },
  { label: 'PRIZE POOL',        value: EVENT.prizePool,             unit: 'IN REWARDS' },
  { label: 'EDITION',           value: EVENT.edition,               unit: 'SERIES'     },
]

/* ── metadata list on the left panel ──────────────────────────────────────── */
const META_ROWS = [
  { key: 'DATE',    val: EVENT.date       },
  { key: 'VENUE',   val: EVENT.venue      },
  { key: 'HOST',    val: EVENT.hostedBy   },
  { key: 'STATUS',  val: EVENT.registrationStatus },
]

export function Brochure() {
  const scanRef = useRef<HTMLDivElement>(null)

  /* Animate scan-line downward on a loop */
  useEffect(() => {
    const el = scanRef.current
    if (!el) return
    let frame = 0
    let raf: number
    const animate = () => {
      frame = (frame + 0.3) % 100
      el.style.top = `${frame}%`
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section id="brochure" className="relative overflow-hidden py-0">

      {/* ── Ambient atmosphere ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-marvel-red/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-[700px] h-[500px] bg-marvel-red/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 halftone opacity-10" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-24 relative">

        {/* ── Section kicker ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <p className="font-body text-[10px] tracking-[0.6em] text-marvel-red uppercase">
            Sponsor Intel
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* ── Main two-column layout ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-0 border border-white/10 bg-[#06060D] overflow-hidden">

          {/* ══ LEFT PANEL — editorial identity ═══════════════════════ */}
          <div className="relative border-r border-white/8 flex flex-col">

            {/* Red diagonal slash accent */}
            <div
              className="absolute -top-20 -left-20 w-64 h-[140%] bg-marvel-red/6 pointer-events-none"
              style={{ transform: 'skewX(-8deg)' }}
            />

            {/* Vertical "SPONSOR KIT" rotated label */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 border-r border-white/6">
              <p
                className="font-heading text-[10px] tracking-[0.6em] text-white/10 uppercase select-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                SPONSOR KIT — HACK-A-SOL {EVENT.edition}
              </p>
            </div>

            <div className="pl-20 pr-10 py-14 flex flex-col h-full">

              {/* Top badge */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 mb-10 border border-marvel-red/30 bg-marvel-red/8">
                <span className="w-1.5 h-1.5 rounded-full bg-marvel-red animate-pulse" />
                <span className="font-body text-[10px] tracking-[0.5em] text-marvel-red uppercase">
                  Official Sponsor Kit
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-heading text-6xl sm:text-8xl text-white leading-none tracking-tight mb-2">
                HACK
              </h2>
              <h2 className="font-heading text-6xl sm:text-8xl leading-none tracking-tight mb-1"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)', color: 'transparent' }}>
                A-SOL
              </h2>
              <div className="flex items-end gap-3 mb-10">
                <span className="font-heading text-7xl text-marvel-red leading-none">5.0</span>
                <span className="font-body text-xs text-white/25 tracking-widest mb-2 uppercase">
                  {EVENT.theme}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-marvel-red/60 to-transparent mb-8" />

              {/* Metadata rows */}
              <div className="space-y-4 flex-1">
                {META_ROWS.map(({ key, val }) => (
                  <div key={key} className="flex items-baseline gap-4">
                    <span className="font-body text-[10px] tracking-[0.5em] text-white/25 uppercase w-16 flex-shrink-0">
                      {key}
                    </span>
                    <span className="font-heading text-sm text-white/70 tracking-wide">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="font-body text-sm text-white/35 leading-relaxed mt-10 max-w-xs">
                Download our sponsor brochure to explore partnership opportunities,
                audience demographics, and tier benefits for India's most
                Marvel-themed hackathon.
              </p>

              {/* Contact line */}
              <p className="font-body text-[11px] text-white/20 tracking-widest mt-6 uppercase">
                {SPONSOR.contactName}
              </p>
            </div>
          </div>

          {/* ══ RIGHT PANEL — Jarvis HUD dashboard ═══════════════════ */}
          <div className="relative flex flex-col overflow-hidden bg-[#04040A]">

            {/* Scan-line sweep */}
            <div
              ref={scanRef}
              className="absolute left-0 right-0 h-[2px] pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(226,54,54,0.4), transparent)',
                top: '0%',
              }}
            />

            {/* Corner HUD marks */}
            {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos) => (
              <div key={pos} className={`absolute ${pos} w-4 h-4 pointer-events-none opacity-30`}>
                <div className="absolute top-0 left-0 w-full h-px bg-marvel-red" />
                <div className="absolute top-0 left-0 h-full w-px bg-marvel-red" />
              </div>
            ))}

            {/* Panel header */}
            <div className="px-10 py-6 border-b border-white/6 flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] tracking-[0.6em] text-marvel-red uppercase">
                  Event at a Glance
                </p>
                <p className="font-body text-[10px] text-white/20 tracking-widest mt-0.5">
                  SYSTEM: ACTIVE — JARVIS v5.0
                </p>
              </div>
              {/* Blinking status dot */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-body text-[10px] text-green-400/60 tracking-widest uppercase">Live</span>
              </div>
            </div>

            {/* HUD stat rows */}
            <div className="flex-1 divide-y divide-white/5">
              {HUD_STATS.map(({ label, value, unit }, i) => (
                <div
                  key={label}
                  className="group flex items-center px-10 py-5 hover:bg-marvel-red/4 transition-colors duration-300"
                >
                  {/* Row index */}
                  <span className="font-body text-[10px] text-white/12 w-6 flex-shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Label */}
                  <span className="font-body text-[10px] tracking-[0.45em] text-white/30 uppercase w-36 flex-shrink-0 ml-4">
                    {label}
                  </span>

                  {/* Filling bar */}
                  <div className="flex-1 mx-6 h-px bg-white/6 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-marvel-red/40 group-hover:bg-marvel-red/70 transition-all duration-500"
                      style={{ width: `${30 + i * 12}%` }}
                    />
                  </div>

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-heading text-2xl text-white group-hover:text-marvel-red transition-colors duration-300 leading-none">
                      {value}
                    </span>
                    <span className="font-body text-[9px] tracking-widest text-white/20 uppercase block mt-0.5">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Expected participants — big hero number */}
            <div className="px-10 py-8 border-t border-white/6 bg-marvel-red/4 flex items-center gap-8">
              <div>
                <p className="font-heading text-5xl text-white leading-none">
                  {EVENT.expectedParticipants}
                </p>
                <p className="font-body text-[10px] tracking-[0.5em] text-white/30 uppercase mt-1">
                  Expected Participants
                </p>
              </div>
              <div className="w-px h-12 bg-white/10 flex-shrink-0" />
              <div>
                <p className="font-heading text-5xl text-white leading-none">
                  24<span className="text-marvel-red">H</span>
                </p>
                <p className="font-body text-[10px] tracking-[0.5em] text-white/30 uppercase mt-1">
                  Non-Stop Build
                </p>
              </div>
              <div className="w-px h-12 bg-white/10 flex-shrink-0" />
              <div className="flex-1 text-right">
                <p className="font-body text-[10px] tracking-widest text-white/20 uppercase mb-1">
                  Website
                </p>
                <p className="font-heading text-sm text-white/50">
                  {EVENT.website}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width download CTA bar ────────────────────────────── */}
        <div className="mt-0 border border-t-0 border-white/10 bg-[#06060D]">
          <div className="flex flex-col sm:flex-row items-stretch">
            {/* Download */}
            <a
              id="brochure-download"
              href={SPONSOR.brochureLink}
              className="group flex-1 flex items-center justify-center gap-4 px-10 py-5 bg-marvel-red hover:bg-red-700 transition-all duration-300 hover:shadow-[0_0_60px_rgba(226,54,54,0.5)]"
            >
              <svg
                className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-heading tracking-[0.35em] text-sm text-white uppercase">
                Download Brochure
              </span>
              <svg
                className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform duration-300"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Divider */}
            <div className="w-px bg-white/10 hidden sm:block" />

            {/* Email */}
            <a
              href={`mailto:${SPONSOR.email}`}
              className="group flex items-center justify-center gap-3 px-10 py-5 hover:bg-white/4 transition-all duration-300 sm:w-72"
            >
              <svg
                className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors duration-300"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-heading tracking-[0.35em] text-sm text-white/40 group-hover:text-white transition-colors duration-300 uppercase">
                Email Us
              </span>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
