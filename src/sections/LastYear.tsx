/**
 * src/sections/LastYear.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Hack-A-Sol 4.0 — A Look Back" — Marvel UI redesign.
 * - SectionHeader with eyebrow "The Legacy"
 * - 6 stat cards (6 col ≥1280px, 3 col ≥768px, 2 below) with lucide icons
 *   and count-up animation (once on scroll-in, via Stat component)
 * - Asymmetric gallery grid: 1 large 2×2 + 4 small tiles, Panel frames
 * - Placeholder state: subtle halftone + muted label, no bright icon boxes
 */

import {
  Users,
  Handshake,
  Target,
  Trophy,
  Building2,
  GraduationCap,
} from 'lucide-react'
import { LAST_YEAR } from '../config'
import { SectionHeader, Panel, Stat, Divider } from '../components/ui'
import '../styles/marvel-ui.css'

const STATS = [
  { icon: <Users size={20} strokeWidth={1.5} />,         value: LAST_YEAR.participants, label: 'Participants' },
  { icon: <Handshake size={20} strokeWidth={1.5} />,     value: LAST_YEAR.teams,        label: 'Teams'        },
  { icon: <Target size={20} strokeWidth={1.5} />,        value: LAST_YEAR.tracks,       label: 'Tracks'       },
  { icon: <Trophy size={20} strokeWidth={1.5} />,        value: LAST_YEAR.prizePool,    label: 'Prize Pool'   },
  { icon: <Building2 size={20} strokeWidth={1.5} />,     value: LAST_YEAR.colleges,     label: 'Colleges'     },
  { icon: <GraduationCap size={20} strokeWidth={1.5} />, value: LAST_YEAR.mentors,      label: 'Mentors'      },
]

/** Gallery slots: one large (2×2) + four small */
const GALLERY = [
  { id: 'g1', caption: 'Opening Ceremony',     large: true  },
  { id: 'g2', caption: 'Team Hacking Session', large: false },
  { id: 'g3', caption: 'Mentor Rounds',        large: false },
  { id: 'g4', caption: 'Project Showcase',     large: false },
  { id: 'g5', caption: 'Prize Distribution',   large: false },
]

function GallerySlot({ caption, large }: { caption: string; large: boolean }) {
  return (
    <Panel
      className={large ? 'row-span-2 col-span-2' : ''}
      style={{
        minHeight: large ? '260px' : '120px',
        overflow: 'hidden',
        position: 'relative',
      } as React.CSSProperties}
    >
      {/* Subtle halftone placeholder — no bright icon boxes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Muted label only */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="16" height="16"
          fill="none" stroke="currentColor" strokeWidth="1.2"
          viewBox="0 0 24 24"
          style={{ color: 'rgba(255,255,255,0.1)' }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12z"
          />
        </svg>
        <span
          className="font-body uppercase"
          style={{ fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
        >
          {caption}
        </span>
      </div>
    </Panel>
  )
}

export function LastYear() {
  return (
    <section
      id="last-year"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 'min(800px, 80vw)', height: '400px',
            background: 'rgba(226,54,54,0.04)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="The Legacy"
          title="HACK-A-SOL 4.0 — A LOOK BACK"
          accent="4.0 — A LOOK BACK"
        />

        {/* Stats grid — responsive via inline style + media via Tailwind */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-12"
        >
          {STATS.map(({ icon, value, label }) => (
            <Panel key={label}>
              <Stat icon={icon} value={value} label={label} countUp />
            </Panel>
          ))}
        </div>

        <Divider />

        {/* Gallery label */}
        <p
          className="font-body uppercase mb-6 mt-0"
          style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--faint)' }}
        >
          Gallery
        </p>

        {/* Asymmetric gallery — 1 large (2×2) + 4 small in a 4-col grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(2, 130px)',
            gap: '8px',
          }}
        >
          {GALLERY.map(({ id, caption, large }) => (
            <GallerySlot key={id} caption={caption} large={large} />
          ))}
        </div>

        <p
          className="font-body text-center uppercase mt-8"
          style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)' }}
        >
          Real gallery photos from Hack-A-Sol 4.0 will be added here soon
        </p>
      </div>
    </section>
  )
}
