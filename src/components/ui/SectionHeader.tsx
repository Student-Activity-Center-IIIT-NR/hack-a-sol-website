/**
 * src/components/ui/SectionHeader.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared section header following the Marvel UI rules:
 *   - eyebrow: red, 0.78rem, letter-spacing 0.32em
 *   - title: Bebas Neue, clamp(2.4rem, 5vw, 4.5rem), optional accented word
 *   - sub: white 62%, max-width 52ch
 * Uses .mu-eyebrow / .mu-title / .mu-subtitle from marvel-ui.css
 */

import '../../styles/marvel-ui.css'

interface SectionHeaderProps {
  /** Small red mono label above the title */
  eyebrow?: string
  /** Main large heading */
  title: string
  /** The word(s) in the title that render outlined/muted */
  accent?: string
  /** Supporting subtitle text */
  sub?: string
  /** Center or left alignment (default left) */
  align?: 'left' | 'center'
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
  sub,
  align = 'left',
}: SectionHeaderProps) {
  // Build title JSX: highlight the `accent` word(s) if provided
  const titleNode = (() => {
    if (!accent) return <>{title}</>
    const idx = title.indexOf(accent)
    if (idx === -1) return <>{title}</>
    return (
      <>
        {title.slice(0, idx)}
        <span className="mu-title-accent">{accent}</span>
        {title.slice(idx + accent.length)}
      </>
    )
  })()

  return (
    <div className={`mb-12 ${align === 'center' ? 'mu-header-center' : ''}`}>
      {eyebrow && <span className="mu-eyebrow">{eyebrow}</span>}
      <h2 className="mu-title">{titleNode}</h2>
      {sub && <p className="mu-subtitle">{sub}</p>}
    </div>
  )
}
