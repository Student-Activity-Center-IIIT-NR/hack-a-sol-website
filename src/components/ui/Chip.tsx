/**
 * src/components/ui/Chip.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact mono label chip.
 *   - mono 0.68rem, letter-spacing 0.24em, 1px var(--line) border
 *   - optional red dot for TBA / live status
 */

import '../../styles/marvel-ui.css'

interface ChipProps {
  children: React.ReactNode
  /** If true, shows a pulsing red dot before text (TBA / live) */
  dot?: boolean
  /** Extra className */
  className?: string
}

export function Chip({ children, dot = false, className = '' }: ChipProps) {
  return (
    <span className={`mu-chip ${className}`}>
      {dot && <span className="mu-chip-dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
