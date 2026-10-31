/**
 * src/sections/PlatformSponsor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform Sponsor — hero-style centred treatment for a single featured logo.
 * For multiple sponsors it falls back to a justified tile row.
 * "Coming Soon" state when PLATFORM_SPONSORS is empty.
 */

import { useEffect, useRef, useState } from 'react'
import { PLATFORM_SPONSORS } from '../config'
import { Divider } from '../components/ui'
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
  const isSingle = PLATFORM_SPONSORS.length === 1

  return (
    <section
      id="platform-sponsors"
      style={{ overflow: 'clip', paddingBlock: '4rem' }}
    >
      <div className="mu-container" style={{ position: 'relative' }}>

        {/* ── Label row ── */}
        <div className="flex items-center gap-4 mb-8">
          <Divider />
          <p
            className="font-body uppercase whitespace-nowrap"
            style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'var(--faint)', flexShrink: 0 }}
          >
            Platform Sponsor
          </p>
          <Divider />
        </div>

        {isEmpty ? (
          /* ── Coming soon strip ─────────────────────────────────────────── */
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

        ) : isSingle ? (
          /* ── Hero treatment for a single featured sponsor ──────────────── */
          <div
            ref={rowRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.55s ease, transform 0.55s ease',
            }}
          >
            {PLATFORM_SPONSORS.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.25rem',
                  width: '100%',
                }}
              >
                {/* Large centred logo plate */}
                <div
                  style={{
                    position: 'relative',
                    width: 'min(380px, 90vw)',
                    background: 'rgba(243,243,246,0.95)',
                    borderRadius: '4px',
                    padding: '2.5rem 3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    /* Subtle red corner ticks matching Panel */
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Corner ticks */}
                  <span aria-hidden="true" style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '10px', height: '10px',
                    borderTop: '1.5px solid var(--red)',
                    borderLeft: '1.5px solid var(--red)',
                  }} />
                  <span aria-hidden="true" style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '10px', height: '10px',
                    borderTop: '1.5px solid var(--red)',
                    borderRight: '1.5px solid var(--red)',
                  }} />
                  <span aria-hidden="true" style={{
                    position: 'absolute', bottom: 0, left: 0,
                    width: '10px', height: '10px',
                    borderBottom: '1.5px solid var(--red)',
                    borderLeft: '1.5px solid var(--red)',
                  }} />
                  <span aria-hidden="true" style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '10px', height: '10px',
                    borderBottom: '1.5px solid var(--red)',
                    borderRight: '1.5px solid var(--red)',
                  }} />

                  <img
                    src={s.logo}
                    alt={`${s.name} logo`}
                    loading="lazy"
                    draggable={false}
                    style={{
                      maxHeight: '72px',
                      width: 'auto',
                      maxWidth: '80%',
                      objectFit: 'contain',
                      filter: s.tone === 'invert' ? 'invert(1)' : 'none',
                    }}
                  />
                </div>

                {/* Brand name + powered-by label */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span
                    className="font-heading uppercase"
                    style={{ fontSize: '1rem', letterSpacing: '0.22em', color: 'var(--text)' }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="font-body uppercase"
                    style={{ fontSize: '0.58rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                  >
                    Official Platform Partner
                  </span>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* ── Multi-sponsor tile row ─────────────────────────────────────── */
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
                  width: '160px',
                }}
              >
                {/* Logo plate */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '3 / 2',
                    background: s.tone === 'plate' ? 'rgba(243,243,246,0.94)' : 'var(--panel)',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  <img
                    src={s.logo}
                    alt={`${s.name} logo`}
                    loading="lazy"
                    draggable={false}
                    style={{
                      maxHeight: '56px',
                      width: 'auto',
                      maxWidth: '85%',
                      objectFit: 'contain',
                      filter: s.tone === 'invert' ? 'invert(1)' : 'none',
                    }}
                  />
                </div>
                <span
                  className="font-body uppercase text-center"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.25em', color: 'var(--muted)' }}
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
