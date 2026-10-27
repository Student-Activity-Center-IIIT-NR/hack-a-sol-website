/**
 * src/sections/PastSponsors.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Past sponsors showcase — Marvel UI redesign.
 * Grid: repeat(auto-fill, minmax(180px,1fr)), gap 16px, max 1100px.
 * Each LogoTile: aspect-ratio 3/2 (~200×130), uniform light plate,
 * logo max-height 44px, red corner ticks.
 * Staggered fade-up reveal via IntersectionObserver (once).
 */

import { useEffect, useRef, useState } from 'react'
import { PAST_SPONSORS } from '../config'
import { SectionHeader, LogoTile } from '../components/ui'
import '../styles/marvel-ui.css'

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, inView] as const
}

export function PastSponsors() {
  const [gridRef, inView] = useInView<HTMLDivElement>()

  return (
    <section
      id="past-sponsors"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(900px, 90vw)', height: '400px',
            background: 'rgba(226,54,54,0.05)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Our Past Allies"
          title="PAST SPONSORS"
          sub="Organizations that have powered Hack-A-Sol's previous editions. Join forces with us for 5.0."
          align="center"
        />

        {/* Logo grid */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            maxWidth: '1100px',
            marginInline: 'auto',
          }}
        >
          {PAST_SPONSORS.map((s, i) => (
            <LogoTile
              key={s.id}
              name={s.name}
              logo={s.logo}
              tone={s.tone ?? 'plate'}
              delay={i * 80}
              show={inView}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}