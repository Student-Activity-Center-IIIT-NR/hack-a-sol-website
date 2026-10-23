/**
 * src/sections/EventDate.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "MARK YOUR CALENDAR" date band — redesigned to match Marvel UI system.
 * NOVEMBER 2026 on ONE line (clamp(3rem,8vw,7rem)) with (TBA) Chip beside it.
 * Three-column mono info row: host | edition | venue — responsive.
 */

import { EVENT } from '../config'
import { SectionHeader, Chip, Divider } from '../components/ui'
import '../styles/marvel-ui.css'

export function EventDate() {
  return (
    <section
      id="event-date"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(900px, 90vw)',
            height: '200px',
            background: 'rgba(226,54,54,0.07)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Mark Your Calendar"
          title="EVENT DATE"
          align="center"
        />

        {/* Big date — ONE line */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span
              className="font-heading leading-none tracking-wide"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                color: 'var(--text)',
                textShadow: '0 0 60px rgba(226,54,54,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              NOVEMBER 2026
            </span>
            <Chip dot className="self-center">TBA</Chip>
          </div>

          {/* Red divider line */}
          <Divider className="w-48" />

          {/* Edition chip */}
          <Chip>EDITION 5.0</Chip>
        </div>

        {/* Three-column mono info row */}
        <div
          className="mt-10 grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            maxWidth: '720px',
            marginInline: 'auto',
          }}
        >
          {[
            { label: 'HOST', value: EVENT.hostedBy },
            { label: 'EDITION', value: `Hack-A-Sol ${EVENT.edition}` },
            { label: 'VENUE', value: EVENT.venue },
          ].map(({ label, value }) => (
            <div key={label} className="text-center px-4 py-3">
              <p
                className="font-body uppercase"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.32em',
                  color: 'var(--red)',
                  marginBottom: '4px',
                }}
              >
                {label}
              </p>
              <p
                className="font-body"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
