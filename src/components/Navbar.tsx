/**
 * src/components/Navbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed top navigation bar.
 * - Logo text on the left
 * - Section links in the centre
 * - "Become a Sponsor" CTA on the right (links to sponsor section)
 */

import { useState, useEffect } from 'react'
import { EVENT, SPONSOR } from '../config'

const NAV_LINKS = [
  { label: 'Tracks',   href: '#tracks'   },
  { label: 'About',    href: '#about'    },
  { label: 'Timeline', href: '#timeline' },
  { label: 'FAQ',      href: '#faq'      },
  { label: 'Contact',  href: '#contact'  },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-marvel-darker/90 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          id="nav-logo"
          className="font-heading text-2xl tracking-widest text-white hover:text-marvel-red transition-colors"
        >
          HACK<span className="text-marvel-red">-A-</span>SOL {EVENT.edition}
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors tracking-wider uppercase"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          id="nav-sponsor-cta"
          href="#why-sponsor"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-heading tracking-widest text-sm bg-marvel-red hover:bg-red-700 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(226,54,54,0.5)] hover:scale-105"
        >
          BECOME A SPONSOR
        </a>

        {/* Mobile hamburger */}
        <button
          id="nav-hamburger"
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-marvel-darker/95 backdrop-blur-md border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white font-medium tracking-wider uppercase text-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#why-sponsor"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-2.5 text-center font-heading tracking-widest text-sm bg-marvel-red text-white rounded-sm"
          >
            BECOME A SPONSOR
          </a>
          <p className="text-white/30 text-xs">{SPONSOR.email}</p>
        </div>
      )}
    </nav>
  )
}
