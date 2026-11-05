/**
 * src/sections/OperativeIDButton.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in CTA for the main site. Links to the standalone generator page
 * (operative-id.html). Self-contained styles, scoped under .oidb.
 *
 *   <OperativeIDButton />                       // default href
 *   <OperativeIDButton href="/operative-id" />  // if you mount the page on a route
 */

import './OperativeIDButton.css'

interface Props {
  href?: string
  className?: string
}

export function OperativeIDButton({ href = '/operative-id.html', className = '' }: Props) {
  return (
    <a id="operative-id-btn" className={`oidb ${className}`.trim()} href={href} data-magnetic>
      <svg className="oidb-ico" viewBox="0 0 22 28" width="16" height="20" aria-hidden="true">
        <rect x="1" y="1" width="20" height="26" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="11" cy="10" r="3.2" fill="currentColor" />
        <path d="M5.5 19.5c.8-3 3-4.2 5.5-4.2s4.7 1.2 5.5 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 23.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="oidb-txt">
        <small>CLEARANCE GRANTED</small>
        <b>GET YOUR OPERATIVE ID</b>
      </span>
      <span className="oidb-arrow" aria-hidden="true">→</span>
    </a>
  )
}