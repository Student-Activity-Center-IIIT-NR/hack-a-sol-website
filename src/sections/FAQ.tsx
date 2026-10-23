/**
 * src/sections/FAQ.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Frequently asked questions — accordion-style.
 * Redesigned with Marvel UI: SectionHeader, Panel accordion items.
 */

import { useState } from 'react'
import { FAQ as FAQ_DATA } from '../config'
import { SectionHeader, Panel } from '../components/ui'
import '../styles/marvel-ui.css'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      <div className="mu-container" style={{ maxWidth: '800px' }}>
        <SectionHeader
          eyebrow="Questions"
          title="FAQ"
          align="center"
        />

        <div className="space-y-2">
          {FAQ_DATA.map(({ q, a }, i) => (
            <Panel
              key={i}
              static={openIndex !== i}
              className="overflow-hidden"
              style={openIndex === i ? { borderColor: 'var(--red-soft)' } : undefined}
            >
              <button
                id={`faq-${i}`}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span
                  className="font-body pr-4"
                  style={{ fontSize: '0.95rem', color: 'var(--muted)', fontWeight: 500 }}
                >
                  {q}
                </span>
                <span
                  className="font-heading flex-shrink-0"
                  style={{
                    fontSize: '1.2rem',
                    color: 'var(--red)',
                    transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5">
                  <div style={{ height: '1px', background: 'var(--line)', marginBottom: '1rem' }} />
                  <p
                    className="font-body leading-relaxed"
                    style={{ fontSize: '0.875rem', color: 'var(--faint)' }}
                  >
                    {a}
                  </p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      </div>
    </section>
  )
}
