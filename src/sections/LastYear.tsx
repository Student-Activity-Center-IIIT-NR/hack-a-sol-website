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

/** Gallery slots: one large (2×2) + four small, each with a real photo */
const GALLERY = [
  { id: 'g1',     src: '/gallery/audi-session.JPG',  large: true  },
  { id: 'g2',  src: '/gallery/grp-1.JPG',  large: false },
  { id: 'g3',        src: '/gallery/speaker.JPG',  large: false },
  { id: 'g4', src: '/gallery/lab.JPG', large: false },
  { id: 'g5', src: '/gallery/audience.JPG',   large: false },
]

function GallerySlot({ src, large }: { src: string; large: boolean }) {
  return (
    <Panel
      className={large ? 'row-span-2 col-span-2' : ''}
      style={{
        minHeight: large ? '260px' : '120px',
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
      } as React.CSSProperties}
    >
      {/* Actual event photograph */}
      <img
        src={src}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          transition: 'transform 0.5s ease',
        }}
        className="gallery-img"
      />
      {/* Red corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '24px',
          height: '2px',
          background: 'var(--red)',
          opacity: 0.7,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2px',
          height: '24px',
          background: 'var(--red)',
          opacity: 0.7,
        }}
        aria-hidden="true"
      />
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
          {GALLERY.map(({ id, src, large }) => (
            <GallerySlot key={id} src={src} large={large} />
          ))}
        </div>

        
      </div>
    </section>
  )
}
