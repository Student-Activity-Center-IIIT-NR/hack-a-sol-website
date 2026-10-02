/**
 * src/sections/FAQ.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Frequently asked questions — accordion-style.
 * Data from config.ts FAQ array.
 */

import { useState } from 'react'
import { FAQ as FAQ_DATA } from '../config'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative min-h-screen flex items-center px-6 py-32">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Questions
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide">
            FAQ
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_DATA.map(({ q, a }, i) => (
            <div
              key={i}
              className={`border rounded-sm overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'border-marvel-red/40 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <button
                id={`faq-${i}`}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-body font-medium text-white/80 group-hover:text-white transition-colors pr-4">
                  {q}
                </span>
                <span
                  className={`text-marvel-red text-xl flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="font-body text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
