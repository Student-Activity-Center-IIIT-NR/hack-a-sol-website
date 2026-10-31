/**
 * src/components/ui/LogoTile.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Sponsor logo tile with:
 *   - aspect-ratio 3/2 (~200×130)
 *   - uniform light plate (#f3f3f6 at 94% opacity) so every logo is visible
 *   - max-height 44px logo, object-fit contain
 *   - red corner ticks (from mu-panel) instead of gold
 *   - tone field: "plate" (default) | "original" | "invert"
 * Wraps Panel so hover effects are consistent.
 */

import '../../styles/marvel-ui.css'
import { useState } from 'react'
import { Panel } from './Panel'

interface LogoTileProps {
  name: string
  logo: string
  /** plate = light bg (default); original = dark bg no filter; invert = dark bg + filter:invert */
  tone?: 'plate' | 'original' | 'invert'
  /** stagger delay in ms */
  delay?: number
  show?: boolean
  index?: number
  /** Scale up the logo inside the tile without changing tile size. 'lg' = taller max-height */
  logoScale?: 'default' | 'lg'
}

export function LogoTile({
  name,
  logo,
  tone = 'plate',
  delay = 0,
  show = true,
  logoScale = 'default',
}: LogoTileProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: show ? `${delay}ms` : '0ms',
      }}
    >
      <Panel className="overflow-hidden">
        <div
          className="mu-logo-tile"
          style={{
            background: tone === 'plate'
              ? 'rgba(243,243,246,0.94)'
              : 'var(--panel)',
          }}
        >
          {failed ? (
            <span
              className="font-heading text-base tracking-wide text-center"
              style={{ color: tone === 'plate' ? '#111' : 'var(--muted)' }}
            >
              {name}
            </span>
          ) : (
            <img
              src={logo}
              alt={`${name} logo`}
              onError={() => setFailed(true)}
              loading="lazy"
              draggable={false}
              style={{
                maxHeight: logoScale === 'lg' ? '64px' : '44px',
                width: 'auto',
                maxWidth: logoScale === 'lg' ? '90%' : '80%',
                objectFit: 'contain',
                filter: tone === 'invert' ? 'invert(1)' : 'none',
              }}
            />
          )}
        </div>
      </Panel>
    </div>
  )
}
