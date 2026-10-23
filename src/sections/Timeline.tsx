/**
 * src/sections/Timeline.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel UI redesign — vertical timeline with:
 * - 1px var(--line) vertical spine with red scroll-progress fill (scaleY)
 * - Gem SVG nodes cycling Infinity Stone colors (no emoji)
 * - Compact Panel cards: title, one-line copy, TBA Chip
 * - Mobile: line on the left
 * - Red fill grows via IntersectionObserver scroll tracking (no per-frame React state)
 */

import { useEffect, useRef } from 'react'
import { TIMELINE } from '../config'
import { SectionHeader, Panel, Chip } from '../components/ui'
import '../styles/marvel-ui.css'

/** Infinity Stone gem colors cycling per node */
const GEM_COLORS = ['#60A5FA', '#A855F7', '#E23636', '#22C55E', '#F97316', '#EAB308']

/** Faceted diamond SVG gem — generic shape, no logos */
function GemNode({ color }: { color: string }) {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mu-gem-node"
      style={{ color }}
      aria-hidden="true"
    >
      <polygon
        points="10,1 19,7 16,18 4,18 1,7"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.2"
      />
      <polygon
        points="10,1 14,8 10,11 6,8"
        fill={color}
        fillOpacity="0.5"
      />
    </svg>
  )
}

export function Timeline() {
  const spineRef = useRef<HTMLDivElement>(null)
  const fillRef  = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  /* Scroll-driven spine fill — IntersectionObserver + scroll event, no React state */
  useEffect(() => {
    const section = sectionRef.current
    const fill    = fillRef.current
    if (!section || !fill) return

    let active = false

    const update = () => {
      if (!active) return
      const rect = section.getBoundingClientRect()
      const vh   = window.innerHeight
      // 0 when top of section hits viewport bottom; 1 when bottom hits viewport top
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / (rect.height + vh))
      )
      fill.style.transform = `scaleY(${progress})`
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        if (active) update()
      },
      { threshold: 0 }
    )
    io.observe(section)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(800px, 80vw)', height: '800px',
            background: 'rgba(226,54,54,0.04)',
            filter: 'blur(140px)',
          }}
        />
      </div>

      <div
        className="mu-container"
        style={{ position: 'relative', maxWidth: '780px' }}
      >
        <SectionHeader
          eyebrow="Mission Schedule"
          title="TIMELINE"
          sub="All dates TBA — updates coming soon."
          align="center"
        />

        <div style={{ position: 'relative' }}>
          {/* Vertical spine — behind cards */}
          <div
            ref={spineRef}
            style={{
              position: 'absolute',
              left: '10px',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'var(--line)',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            {/* Red progress fill — scaleY from top */}
            <div
              ref={fillRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--red)',
                transformOrigin: 'top',
                transform: 'scaleY(0)',
                transition: 'transform 0.1s linear',
              }}
            />
          </div>

          <div className="space-y-4" style={{ paddingLeft: '40px' }}>
            {TIMELINE.map(({ label, date, description }, i) => {
              const gemColor = GEM_COLORS[i % GEM_COLORS.length]
              return (
                <div
                  key={label}
                  style={{ position: 'relative' }}
                >
                  {/* Step number */}
                  <span
                    className="font-body"
                    style={{
                      position: 'absolute',
                      left: '-36px',
                      top: '16px',
                      fontSize: '0.6rem',
                      color: 'rgba(255,255,255,0.15)',
                      letterSpacing: '0.1em',
                      width: '20px',
                      textAlign: 'center',
                      userSelect: 'none',
                    }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Gem node on the spine */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-49px',
                      top: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                    }}
                  >
                    <GemNode color={gemColor} />
                  </div>

                  {/* Card */}
                  <Panel>
                    <div
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex-1">
                        <h3
                          className="font-heading tracking-wide"
                          style={{ fontSize: '1.1rem', color: 'var(--text)' }}
                        >
                          {label}
                        </h3>
                        <p
                          className="font-body mt-1 leading-relaxed"
                          style={{ fontSize: '0.82rem', color: 'var(--faint)' }}
                        >
                          {description}
                        </p>
                      </div>

                      {/* Date — TBA chip */}
                      <div className="flex-shrink-0">
                        <Chip dot>{date}</Chip>
                      </div>
                    </div>
                  </Panel>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom note */}
        <p
          className="font-body uppercase text-center mt-12"
          style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)' }}
        >
          Stay tuned — follow our socials for instant updates
        </p>
      </div>
    </section>
  )
}
