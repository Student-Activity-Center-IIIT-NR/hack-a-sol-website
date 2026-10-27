/**
 * src/sections/Footer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Site footer: logo, nav links, contact, socials, credits link.
 * Redesigned with Marvel UI tokens: var(--bg), var(--line), var(--text), etc.
 * No emoji social icons. Faint top line via var(--line). Same text styles throughout.
 */

import { EVENT, SPONSOR } from '../config'
import { MODEL_CREDITS } from '../data/credits'
import { TRACKS } from '../data/tracks'
import '../styles/marvel-ui.css'

/* Minimal SVG social icons — red, no platform colors */
const FooterSocials = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Twitter/X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer
      id="footer"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--line)',
        paddingTop: '4rem',
        paddingBottom: '6rem',
        position: 'relative',
        overflow: 'clip',
      }}
    >
      {/* Faint red top line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(226,54,54,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mu-container">
        <div
          className="grid gap-12 mb-12"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
        >
          {/* Brand */}
          <div>
            <p
              className="font-heading tracking-widest mb-2"
              style={{ fontSize: '1.3rem', color: 'var(--text)' }}
            >
              HACK<span style={{ color: 'var(--red)' }}>-A-</span>SOL {EVENT.edition}
            </p>
            <p
              className="font-body leading-relaxed"
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}
            >
              The flagship hackathon of {EVENT.hostedBy}.<br />
              Marvel-themed. Date: {EVENT.date}.

            </p>
          </div>

          {/* Navigate */}
          <div>
            <p
              className="font-body uppercase mb-4"
              style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.3)' }}
            >
              Navigate
            </p>
            <ul className="space-y-2">
              {['#hero','#tracks','#about','#why-sponsor','#sponsor-tiers','#timeline','#faq','#contact'].map((href) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-body capitalize"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                      transition: 'color 0.25s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
                  >
                    {href.replace('#', '').replace(/-/g, ' ')}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tracks */}
          <div>
            <p
              className="font-body uppercase mb-4"
              style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.3)' }}
            >
              Tracks ({TRACKS.length})
            </p>
            <ul className="space-y-2">
              {TRACKS.map((t) => (
                <li key={t.id}>
                  <a
                    href="#tracks"
                    className="font-body"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                      transition: 'color 0.25s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
                  >
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p
              className="font-body uppercase mb-4"
              style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.3)' }}
            >
              Contact
            </p>
            <a
              href={`mailto:${SPONSOR.email}`}
              className="font-body"
              style={{
                fontSize: '0.875rem',
                color: 'var(--red)',
                textDecoration: 'none',
                transition: 'color 0.25s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
            >
              {SPONSOR.email}
            </a>

            {/* Social icons — SVG, red, no emoji */}
            <div className="flex gap-3 mt-6">
              {FooterSocials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '2px',
                    border: '1px solid var(--line)',
                    color: 'rgba(255,255,255,0.4)',
                    textDecoration: 'none',
                    transition: 'border-color 0.25s, color 0.25s',
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--red-soft)'
                    el.style.color = 'var(--red)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--line)'
                    el.style.color = 'rgba(255,255,255,0.4)'
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <p
            className="font-body"
            style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}
          >
            &copy; {new Date().getFullYear()} {EVENT.hostedBy}. All rights reserved.
          </p>
          <p
            className="font-body"
            style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}
          >
            Made with care by the Hack-A-Sol Team
          </p>
        </div>

        {/* 3D Model Credits */}
        {MODEL_CREDITS.length > 0 && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <p
              className="font-body uppercase mb-2"
              style={{ fontSize: '0.6rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)' }}
            >
              3D Model Credits
            </p>
            <ul className="space-y-1">
              {MODEL_CREDITS.map(credit => (
                <li key={credit.trackId} className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>{credit.modelName}</span>
                  {' '}by{' '}
                  <a
                    href={credit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'rgba(226,54,54,0.6)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(226,54,54,0.6)' }}
                  >
                    {credit.author}
                  </a>
                  {' '}— {credit.license}
                  {credit.notes && <span style={{ color: 'rgba(255,255,255,0.15)' }}> ({credit.notes})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {MODEL_CREDITS.length === 0 && (
          <p
            className="font-mono text-center mt-6"
            style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)' }}
          >
            3D model credits will appear here once assets are sourced. See{' '}
            <a
              href="https://github.com/sandeepsidar1210-rgb/Hack-A-Sol-5.0/blob/main/CREDITS.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'underline' }}
            >
              CREDITS.md
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}
