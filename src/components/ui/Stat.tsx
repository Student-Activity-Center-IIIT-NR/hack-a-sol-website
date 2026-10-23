/**
 * src/components/ui/Stat.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Stat display card: icon (lucide, 20px, red), value (heading font), label (mono).
 * Optionally runs a count-up animation once on scroll into view.
 */

import '../../styles/marvel-ui.css'
import { useEffect, useRef, type ReactNode } from 'react'

interface StatProps {
  /** Lucide icon element (or any 20×20 SVG) — red, stroke 1.5 */
  icon: ReactNode
  /** The displayed value string, e.g. "500+" or "₹1,00,000+" */
  value: string
  /** Label below the value */
  label: string
  /** If true, animate numeric prefix on scroll-in (once) */
  countUp?: boolean
}

/** Extract leading digits for count-up animation */
function parseLeadingNumber(v: string): { num: number; suffix: string } | null {
  const m = v.match(/^(\d[\d,]*)(.*)$/)
  if (!m) return null
  return { num: parseInt(m[1].replace(/,/g, ''), 10), suffix: m[2] }
}

export function Stat({ icon, value, label, countUp = false }: StatProps) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!countUp) return
    const el = valueRef.current
    if (!el) return

    const parsed = parseLeadingNumber(value)
    if (!parsed) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true
        io.disconnect()

        const { num, suffix } = parsed
        const duration = 1200
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = Math.round(eased * num)
          if (el) el.textContent = current.toLocaleString() + suffix
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [countUp, value])

  return (
    <div className="mu-stat">
      <span className="mu-stat-icon" aria-hidden="true">{icon}</span>
      <span className="mu-stat-value" ref={valueRef}>{value}</span>
      <span className="mu-stat-label">{label}</span>
    </div>
  )
}
