/**
 * src/sections/PlatformSponsor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform Sponsors — compact strip showing logo + brand name.
 * Minimal vertical footprint. Uses LogoTile (logo) + brand name below each tile.
 * "Coming Soon" state when PLATFORM_SPONSORS is empty.
 */

import { useEffect, useRef, useState } from 'react'
import { PLATFORM_SPONSORS } from '../config'
import { LogoTile, Divider } from '../components/ui'
import '../styles/marvel-ui.css'

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); io.disconnect() }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, inView] as const
}

export function PlatformSponsor() {
  const [rowRef, inView] = useInView<HTMLDivElement>()
  const isEmpty = PLATFORM_SPONSORS.length === 0

  return (
    <section
      id="platform-sponsors"
      style={{ overflow: 'clip', paddingBlock: '3rem' }}
    >
      <div className="mu-container" style={{ position: 'relative' }}>
        {/* Label row */}
        <div className="flex items-center gap-4 mb-6">
          <Divider />
          <p
            className="font-body uppercase whitespace-nowrap"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'var(--faint)', flexShrink: 0 }}
          >
            Platform Sponsors
          </p>
          <Divider />
        </div>

        {isEmpty ? (
          /* ── Coming soon strip ─────────────────────────────────── */
          <div className="flex items-center justify-center gap-3 py-4">
            <span
              className="font-body uppercase"
              style={{ fontSize: '0.62rem', letterSpacing: '0.35em', color: 'var(--faint)' }}
            >
              To be announced
            </span>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--red)',
                opacity: 0.5,
              }}
              aria-hidden="true"
            />
            <a
              href="mailto:hackasol@iiitnr.edu.in?subject=Platform Sponsorship Enquiry"
              id="platform-sponsor-cta"
              className="font-body uppercase"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.35em',
                color: 'var(--red)',
                textDecoration: 'none',
                opacity: 0.8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
              Become a partner
            </a>
          </div>
        ) : (
          /* ── Sponsor tiles row ─────────────────────────────────── */
          <div
            ref={rowRef}
            className="flex flex-wrap justify-center gap-6"
          >
            {PLATFORM_SPONSORS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(12px)',
                  transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '140px',
                }}
              >
                {/* Logo tile */}
                <LogoTile
                  name={s.name}
                  logo={s.logo}
                  tone={s.tone ?? 'plate'}
                  show={inView}
                  delay={i * 80}
                  index={i}
                  logoScale="lg"
                />
                {/* Brand name below */}
                <span
                  className="font-body uppercase text-center"
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.25em',
                    color: 'var(--muted)',
                  }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
