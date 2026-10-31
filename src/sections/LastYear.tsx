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

/** Gallery images — duplicated for seamless infinite loop */
const GALLERY_IMGS = [
  { id: 'g1', src: '/gallery/audi-session.JPG',  alt: 'Opening Ceremony'     },
  { id: 'g2', src: '/gallery/grp-1.JPG',          alt: 'Group Photo'          },
  { id: 'g3', src: '/gallery/speaker.JPG',         alt: 'Speaker Session'      },
  { id: 'g4', src: '/gallery/lab.JPG',             alt: 'Hacking Lab'          },
  { id: 'g5', src: '/gallery/audience.JPG',        alt: 'Audience'             },
  { id: 'g6', src: '/gallery/grp-2.JPG',  alt: 'Group Photo' },
  { id: 'g7', src: '/gallery/audience-2.JPG',        alt: 'Audience'             }
]

/** Single marquee photo tile */
function MarqueePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        width: '260px',
        height: '180px',
        borderRadius: '2px',
        overflow: 'hidden',
        border: '1px solid var(--line)',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          userSelect: 'none',
        }}
      />
      {/* Red corner ticks */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '2px', background: 'var(--red)', opacity: 0.7 }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '20px', background: 'var(--red)', opacity: 0.7 }} aria-hidden="true" />
    </div>
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
          className="font-body uppercase mb-4 mt-6"
          style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--faint)' }}
        >
          Gallery
        </p>

        {/* —— Infinite marquee gallery —— */}
        <style>{`
          @keyframes gallery-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .gallery-marquee-track { animation-play-state: paused !important; }
          }
        `}</style>

        {/* Outer mask — clip overflow, fade edges */}
        <div
          style={{
            overflow: 'hidden',
            /* soft fade on left + right edges */
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage:       'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          {/* Inner track — double the items so the loop is seamless */}
          <div
            className="gallery-marquee-track"
            style={{
              display: 'flex',
              gap: '10px',
              width: 'max-content',
              animation: 'gallery-scroll 22s linear infinite',
            }}
          >
            {/* Render twice for seamless loop */}
            {[...GALLERY_IMGS, ...GALLERY_IMGS].map((img, i) => (
              <MarqueePhoto key={`${img.id}-${i}`} src={img.src} alt={img.alt} />
            ))}
          </div>
        </div>

        
      </div>
    </section>
  )
}
