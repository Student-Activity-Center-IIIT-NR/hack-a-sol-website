/**
 * src/sections/About.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * About Hack-A-Sol 5.0 — event overview stats and narrative.
 * Redesigned with Marvel UI system: SectionHeader, Panel, Chip, Divider.
 */

import { EVENT } from '../config'
import { TRACKS } from '../data/tracks'
import { SectionHeader, Panel, Chip, Divider } from '../components/ui'
import '../styles/marvel-ui.css'

export function About() {
  const stats = [
    { label: 'Edition',       value: EVENT.edition },
    { label: 'Participants',  value: EVENT.expectedParticipants },
    { label: 'Tracks',        value: String(TRACKS.length) },
    { label: 'Prize Pool',    value: EVENT.prizePool },
  ]

  return (
    <section
      id="about"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Left red accent bar — very subtle */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '2px', background: 'rgba(226,54,54,0.25)' }}
        aria-hidden="true"
      />

      <div className="mu-container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <SectionHeader
              eyebrow="About the Event"
              title="WHERE HEROES ARE FORGED"
              accent="ARE FORGED"
            />

            <p
              className="font-body leading-relaxed mb-4"
              style={{ fontSize: '1rem', color: 'var(--muted)' }}
            >
              Hack-A-Sol is the flagship annual hackathon hosted by students of IIIT Naya Raipur.
              Now in its fifth edition and themed{' '}
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>MARVEL</span>,
              it brings together the brightest minds across India to solve real-world challenges
              across {TRACKS.length} specialised tracks.
            </p>
            <p
              className="font-body leading-relaxed mb-6"
              style={{ fontSize: '0.9rem', color: 'var(--faint)' }}
            >
              From neural architectures and cyber-fortresses to green Web3 protocols —
              if you can imagine it, you can build it here.
            </p>

            {/* Track badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {TRACKS.map((t) => (
                <a
                  key={t.id}
                  href="#tracks"
                  style={{ textDecoration: 'none' }}
                >
                  <Chip className="cursor-pointer hover:border-[var(--line-strong)]">
                    {t.name}
                  </Chip>
                </a>
              ))}
            </div>

            <Divider />

            <p
              className="font-body uppercase text-center"
              style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.25)' }}
            >
              {EVENT.hostedBy}
            </p>
          </div>

          {/* Right: Stat grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ label, value }) => (
              <Panel key={label} className="p-6 text-center">
                <p
                  className="font-heading"
                  style={{ fontSize: '2.2rem', color: 'var(--text)', lineHeight: 1 }}
                >
                  {value}
                </p>
                <p
                  className="font-body uppercase mt-2"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                >
                  {label}
                </p>
              </Panel>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
