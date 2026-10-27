/**
 * src/components/ui/Divider.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 1px horizontal rule in var(--line) with a 40px red segment on the left.
 */

import '../../styles/marvel-ui.css'

interface DividerProps {
  className?: string
}

export function Divider({ className = '' }: DividerProps) {
  return <div className={`mu-divider ${className}`} aria-hidden="true" />
}
