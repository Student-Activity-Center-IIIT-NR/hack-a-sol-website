/**
 * src/components/ui/Panel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable panel card following the Marvel UI rules:
 *   - default: var(--panel) bg, 1px var(--line) border, 2px radius
 *   - accent variant: 2px red left border
 *   - all-four corner ticks on hover
 *   - hover: border → var(--red-soft), translateY(-2px)
 * Uses .mu-panel and related classes from marvel-ui.css.
 */

import '../../styles/marvel-ui.css'
import type { ReactNode, CSSProperties } from 'react'

interface PanelProps {
  children: ReactNode
  /** 'default' | 'accent' — accent adds 2px red left border */
  variant?: 'default' | 'accent'
  /** Extra className for layout (padding, grid, etc.) */
  className?: string
  /** Inline styles (border-color override, min-height, etc.) */
  style?: CSSProperties
  /** If true disables the hover lift */
  static?: boolean
  id?: string
}

export function Panel({
  children,
  variant = 'default',
  className = '',
  style,
  static: isStatic = false,
  id,
}: PanelProps) {
  return (
    <div
      id={id}
      style={style}
      className={[
        'mu-panel',
        variant === 'accent' ? 'mu-panel-accent' : '',
        isStatic ? 'mu-panel-static' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Bottom-right corner tick (top-left handled by ::after) */}
      <span className="mu-panel-tick-br" aria-hidden="true" />
      {/* Hover-only extra ticks */}
      <span className="mu-panel-tick-tl" aria-hidden="true" />
      <span className="mu-panel-tick-tr" aria-hidden="true" />
      <span className="mu-panel-tick-bl" aria-hidden="true" />
      {children}
    </div>
  )
}
