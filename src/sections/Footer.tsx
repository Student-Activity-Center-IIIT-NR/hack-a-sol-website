/**
 * src/sections/Footer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Site footer: logo, nav links, contact, socials, credits link.
 * Phase 3: added 3D model credits line driven by src/data/credits.ts.
 * Extra bottom padding (pb-24) prevents overlap with corner HUD brackets.
 */

import { EVENT, SPONSOR } from '../config'
import { MODEL_CREDITS } from '../data/credits'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: '📷' },
  { label: 'LinkedIn',  href: '#', icon: '💼' },
  { label: 'Twitter/X', href: '#', icon: '𝕏'  },
]

export function Footer() {
  return (
    <footer id="footer" className="relative border-t border-white/5 px-6 pt-16 pb-24">
      {/* Top red line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-marvel-red/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <p className="font-heading text-2xl tracking-widest text-white mb-2">
              HACK<span className="text-marvel-red">-A-</span>SOL {EVENT.edition}
            </p>
            <p className="font-body text-xs text-white/30 leading-relaxed">
              The flagship hackathon of {EVENT.hostedBy}.<br />
              Theme: {EVENT.theme}. Date: {EVENT.date}.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase mb-4">Navigate</p>
            <ul className="space-y-2">
              {['#hero','#tracks','#about','#why-sponsor','#sponsor-tiers','#timeline','#faq','#contact'].map((href) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-body text-sm text-white/50 hover:text-white transition-colors capitalize"
                  >
                    {href.replace('#', '').replace(/-/g, ' ')}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-body text-xs tracking-[0.4em] text-white/30 uppercase mb-4">Contact</p>
            <a
              href={`mailto:${SPONSOR.email}`}
              className="font-body text-sm text-marvel-red hover:text-white transition-colors"
            >
              {SPONSOR.email}
            </a>
            <div className="mt-6 flex gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-sm border border-white/10 flex items-center justify-center text-base hover:border-marvel-red/40 hover:bg-white/5 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-white/20">
            © {new Date().getFullYear()} {EVENT.hostedBy}. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/20">
            Made with ❤️ by the Hack-A-Sol Team
          </p>
        </div>

        {/* 3D Model Credits — only rendered when credits exist */}
        {MODEL_CREDITS.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="font-body text-[10px] text-white/20 tracking-widest uppercase mb-2">3D Model Credits</p>
            <ul className="space-y-1">
              {MODEL_CREDITS.map(credit => (
                <li key={credit.trackId} className="font-mono text-[10px] text-white/20">
                  <span className="text-white/30">{credit.modelName}</span>
                  {' '}by{' '}
                  <a
                    href={credit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-marvel-red/60 hover:text-marvel-red transition-colors"
                  >
                    {credit.author}
                  </a>
                  {' '}— {credit.license}
                  {credit.notes && <span className="text-white/15"> ({credit.notes})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Static credits note when no models are loaded */}
        {MODEL_CREDITS.length === 0 && (
          <p className="mt-6 font-mono text-[10px] text-white/15 text-center">
            3D model credits will appear here once assets are sourced. See{' '}
            <a
              href="https://github.com/sandeepsidar1210-rgb/Hack-A-Sol-5.0/blob/main/CREDITS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-white/50 transition-colors underline"
            >
              CREDITS.md
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}
