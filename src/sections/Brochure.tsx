/**
 * src/sections/Brochure.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium sponsor brochure section — Marvel UI system redesign.
 * Left Panel: definition list (DATE, VENUE, HOST, STATUS) + paragraph.
 * Right Panel: numbered spec rows with Dividers + decorative meter lines.
 * Bottom: 3-stat strip + primary Button + ghost Button.
 * A-SOL / 5.0 decorations: ≤6% opacity.
 * Replaced: white vertical/horizontal lines, full-width red bar.
 */

import { EVENT, SPONSOR } from '../config'
import { TRACKS } from '../data/tracks'
import { SectionHeader, Panel, Chip, Button, Divider } from '../components/ui'
import '../styles/marvel-ui.css'

const HUD_STATS = [
  { label: 'TRACKS',       value: `${TRACKS.length}`,         unit: 'UNIVERSES'  },
  { label: 'TEAM SIZE',    value: '2–4',                      unit: 'MEMBERS'    },
  { label: 'FORMAT',       value: '24H',                      unit: 'NON-STOP'   },
  { label: 'PARTICIPANTS', value: EVENT.expectedParticipants, unit: 'EXPECTED'   },
  { label: 'PRIZE POOL',   value: EVENT.prizePool,            unit: 'IN REWARDS' },
  { label: 'EDITION',      value: EVENT.edition,              unit: 'SERIES'     },
]

const META_ROWS = [
  { key: 'DATE',   val: EVENT.date              },
  { key: 'VENUE',  val: EVENT.venue             },
  { key: 'HOST',   val: EVENT.hostedBy          },
  { key: 'STATUS', val: EVENT.registrationStatus },
]

const BOTTOM_STATS = [
  { value: EVENT.expectedParticipants, label: 'Expected Participants' },
  { value: '24H',                      label: 'Non-Stop Build'        },
  { value: `${TRACKS.length}`,         label: 'Tracks'                },
]

export function Brochure() {
  return (
    <section
      id="brochure"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            top: '50%', left: '25%',
            transform: 'translateY(-50%)',
            width: 'min(700px, 60vw)', height: '500px',
            background: 'rgba(226,54,54,0.04)',
            filter: 'blur(150px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Sponsor Intel"
          title="SPONSOR KIT"
          sub="Download our sponsor brochure to explore partnership opportunities, audience demographics, and tier benefits."
        />

        {/* Two-column panel group */}
        <div
          className="grid gap-4 mb-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}
        >
          {/* LEFT — definition list */}
          <Panel className="p-8 flex flex-col" style={{ position: 'relative' }}>
            {/* Decorative A-SOL watermark — ≤6% opacity */}
            <span
              className="font-heading select-none pointer-events-none"
              style={{
                position: 'absolute',
                bottom: '-0.5rem',
                right: '-0.5rem',
                fontSize: 'clamp(4rem, 10vw, 7rem)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.06)',
                lineHeight: 1,
                userSelect: 'none',
                overflow: 'hidden',
              }}
              aria-hidden="true"
            >
              A-SOL
            </span>

            {/* Badge */}
            <Chip dot className="mb-8 self-start">Official Sponsor Kit</Chip>

            {/* Metadata definition list */}
            <dl className="space-y-4 flex-1">
              {META_ROWS.map(({ key, val }) => (
                <div key={key} className="flex items-baseline gap-4">
                  <dt
                    className="font-body uppercase flex-shrink-0 w-16"
                    style={{ fontSize: '0.68rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                  >
                    {key}
                  </dt>
                  <dd
                    className="font-heading tracking-wide"
                    style={{ fontSize: '0.9rem', color: 'var(--muted)' }}
                  >
                    {val}
                  </dd>
                </div>
              ))}
            </dl>

            <Divider className="mt-8" />

            {/* Description paragraph */}
            <p
              className="font-body leading-relaxed mt-0"
              style={{ fontSize: '0.875rem', color: 'var(--faint)' }}
            >
              Download our sponsor brochure to explore partnership opportunities,
              audience demographics, and tier benefits for India's most
              Marvel-themed hackathon.
            </p>

            <p
              className="font-body uppercase mt-4"
              style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)' }}
            >
              {SPONSOR.contactName}
            </p>
          </Panel>

          {/* RIGHT — numbered spec rows */}
          <Panel className="flex flex-col overflow-hidden">
            {/* Panel header */}
            <div
              className="px-8 py-5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <div>
                <p
                  className="font-body uppercase"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.32em', color: 'var(--red)' }}
                >
                  Event at a Glance
                </p>
                <p
                  className="font-body mt-0.5"
                  style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}
                >
                  SYSTEM: ACTIVE — JARVIS v5.0
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#4ade80', animation: 'mu-pulse 2s ease-in-out infinite' }}
                />
                <span
                  className="font-body uppercase"
                  style={{ fontSize: '0.65rem', color: 'rgba(74,222,128,0.6)', letterSpacing: '0.2em' }}
                >
                  Live
                </span>
              </div>
            </div>

            {/* Spec rows */}
            <div className="flex-1">
              {HUD_STATS.map(({ label, value, unit }, i) => (
                <div key={label}>
                  <div
                    className="group flex items-center px-8 py-5"
                    style={{ transition: 'background 0.3s' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(226,54,54,0.04)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    {/* Row index */}
                    <span
                      className="font-body tabular-nums flex-shrink-0 w-6"
                      style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.12)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Label */}
                    <span
                      className="font-body uppercase flex-shrink-0 ml-4"
                      style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.32em',
                        color: 'var(--faint)',
                        width: '9rem',
                      }}
                    >
                      {label}
                    </span>

                    {/* Decorative meter line — red at 40% opacity */}
                    <div
                      className="flex-1 mx-4 relative overflow-hidden"
                      style={{ height: '1px', background: 'var(--line)' }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: '0 auto 0 0',
                          width: `${30 + i * 12}%`,
                          background: 'rgba(226,54,54,0.40)',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>

                    {/* Value */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className="font-heading leading-none"
                        style={{ fontSize: '1.5rem', color: 'var(--text)' }}
                      >
                        {value}
                      </span>
                      <span
                        className="font-body uppercase block mt-0.5"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}
                      >
                        {unit}
                      </span>
                    </div>
                  </div>

                  {/* Divider between rows */}
                  {i < HUD_STATS.length - 1 && (
                    <div style={{ height: '1px', background: 'var(--line)', marginInline: '2rem' }} />
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* 3-stat strip */}
        <Panel className="mb-4" static>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
          >
            {BOTTOM_STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className="px-8 py-6 text-center"
                style={{
                  borderRight: i < BOTTOM_STATS.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <p className="font-heading" style={{ fontSize: '2.4rem', color: 'var(--text)', lineHeight: 1 }}>
                  {value}
                </p>
                <p
                  className="font-body uppercase mt-1"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* CTA buttons — primary + ghost side by side */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Button
            id="brochure-download"
            href={SPONSOR.brochureLink}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Brochure
          </Button>
          <Button
            variant="ghost"
            href={`mailto:${SPONSOR.email}`}
          >
            Email Us
          </Button>
        </div>
      </div>
    </section>
  )
}
