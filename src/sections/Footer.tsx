/**
 * src/sections/Footer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Site footer with logo, nav links, copyright, and social links.
 */

import { EVENT, SPONSOR } from '../config'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: '📷' },
  { label: 'LinkedIn',  href: '#', icon: '💼' },
  { label: 'Twitter/X', href: '#', icon: '𝕏'  },
]

export function Footer() {
  return (
    <footer id="footer" className="relative border-t border-white/5 px-6 py-16">
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
                    {href.replace('#', '').replace('-', ' ')}
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

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-white/20">
            © {new Date().getFullYear()} {EVENT.hostedBy}. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/20">
            Made with ❤️ by the Hack-A-Sol Team
          </p>
        </div>
      </div>
    </footer>
  )
}
