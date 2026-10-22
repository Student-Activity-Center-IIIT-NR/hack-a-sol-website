/**
 * src/sections/Contact.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium Contact section — three visually distinct zones:
 *   A. Follow Us   — horizontal social pills with per-platform colour glows
 *   B. Connect     — venue / location card with red accent border
 *   C. Contact     — organizer cards + email CTAs
 *
 * All data from config.ts.
 */

import { SOCIALS, COLLEGE_LOCATION, ORGANIZERS, HACKASOL_EMAIL, SPONSOR } from '../config'

/* ── Platform SVG icons ───────────────────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.529 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.645 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.375.202 2.392.1 2.645.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.481C19.137 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
}

const SOCIAL_META: Record<string, { color: string; glow: string }> = {
  github:    { color: '#e0e0e0', glow: 'rgba(224,224,224,0.15)' },
  discord:   { color: '#5865F2', glow: 'rgba(88,101,242,0.20)'  },
  linkedin:  { color: '#0A66C2', glow: 'rgba(10,102,194,0.20)'  },
  twitter:   { color: '#1DA1F2', glow: 'rgba(29,161,242,0.20)'  },
  instagram: { color: '#E1306C', glow: 'rgba(225,48,108,0.20)'  },
}

export function Contact() {
  return (
    <section id="contact" className="relative px-6 py-28 overflow-hidden">

      {/* Ambient atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-marvel-red/6 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-blue-600/4 blur-[100px] rounded-full" />
        <div className="absolute inset-0 halftone opacity-10" />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mb-20">
          <p className="font-body text-[10px] tracking-[0.6em] text-marvel-red uppercase mb-4">
            Stay Connected
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide">
            CONTACT &amp;{' '}
            <span
              className="font-heading"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' }}
            >
              CONNECT
            </span>
          </h2>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE A — Follow Us (social pills)
        ══════════════════════════════════════════════════════════════ */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-white/20" />
            <p className="font-body text-[10px] tracking-[0.55em] text-white/30 uppercase">
              Follow Us
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {(Object.entries(SOCIALS) as [keyof typeof SOCIALS, typeof SOCIALS[keyof typeof SOCIALS]][]).map(([key, social]) => {
              const meta = SOCIAL_META[key] ?? { color: '#fff', glow: 'rgba(255,255,255,0.1)' }
              return (
                <a
                  key={key}
                  id={`social-${key}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-5 py-3.5 border border-white/8 bg-white/[0.02] overflow-hidden transition-all duration-400 hover:border-white/20 hover:bg-white/[0.05]"
                  style={{ '--s-color': meta.color, '--s-glow': meta.glow } as React.CSSProperties}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = meta.color + '50'
                    el.style.boxShadow = `0 0 30px ${meta.glow}, inset 0 0 20px ${meta.glow}`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = ''
                    el.style.boxShadow = ''
                  }}
                >
                  {/* Platform color bottom-slide bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ backgroundColor: meta.color }}
                  />

                  {/* Icon */}
                  <span
                    className="transition-colors duration-300 text-white/25"
                    style={{ color: undefined }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = meta.color }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    {SOCIAL_ICONS[key]}
                  </span>

                  {/* Text */}
                  <div>
                    <p className="font-heading text-sm text-white/60 group-hover:text-white transition-colors duration-300 tracking-wide leading-none">
                      {social.label}
                    </p>
                    <p className="font-body text-[10px] text-white/20 tracking-widest mt-0.5">
                      {social.handle}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-3 h-3 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all duration-300 ml-1"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE B + C — two-column: Location / Organizers
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">

          {/* ── ZONE B: Venue & Location ──────────────────────────── */}
          <div className="relative overflow-hidden border border-white/8 bg-[#06060D]">

            {/* Red left accent stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-marvel-red via-marvel-red/60 to-transparent" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-white/6 pl-10">
              <p className="font-body text-[10px] tracking-[0.5em] text-marvel-red uppercase mb-1">
                Venue &amp; Connectivity
              </p>
              <p className="font-heading text-2xl text-white tracking-wide">
                {COLLEGE_LOCATION.name}
              </p>
            </div>

            <div className="px-8 py-7 pl-10 space-y-7">

              {/* Full name + address */}
              <div>
                <p className="font-body text-sm text-white/40 leading-relaxed">
                  {COLLEGE_LOCATION.fullName}
                </p>
                <p className="font-body text-sm text-marvel-red/60 mt-1.5 tracking-wide">
                  {COLLEGE_LOCATION.address}
                </p>
              </div>

              <div className="h-px bg-white/6" />

              {/* Travel chips */}
              <div className="grid grid-cols-2 gap-4">

                {/* Airport */}
                <div className="border border-white/8 bg-white/[0.02] p-4 hover:border-white/16 transition-colors duration-300 group">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    <span className="font-body text-[10px] tracking-[0.45em] text-white/25 uppercase">Airport</span>
                  </div>
                  <p className="font-heading text-sm text-white/70 leading-snug mb-2">
                    {COLLEGE_LOCATION.airport.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-marvel-red text-lg">{COLLEGE_LOCATION.airport.distance}</span>
                    <span className="w-px h-3 bg-white/15" />
                    <span className="font-body text-[11px] text-white/30">{COLLEGE_LOCATION.airport.time}</span>
                  </div>
                </div>

                {/* Railway */}
                <div className="border border-white/8 bg-white/[0.02] p-4 hover:border-white/16 transition-colors duration-300 group">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <span className="font-body text-[10px] tracking-[0.45em] text-white/25 uppercase">Railway</span>
                  </div>
                  <p className="font-heading text-sm text-white/70 leading-snug mb-2">
                    {COLLEGE_LOCATION.railway.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-marvel-red text-lg">{COLLEGE_LOCATION.railway.distance}</span>
                    <span className="w-px h-3 bg-white/15" />
                    <span className="font-body text-[11px] text-white/30">{COLLEGE_LOCATION.railway.time}</span>
                  </div>
                </div>
              </div>

              {/* Maps link */}
              <a
                href={COLLEGE_LOCATION.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-heading text-xs tracking-[0.4em] text-white/20 hover:text-marvel-red transition-colors duration-300 uppercase"
              >
                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* ── ZONE C: Organizers + Contact ──────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Official email — hero card */}
            <a
              href={`mailto:${HACKASOL_EMAIL}`}
              id="contact-official-email"
              className="group relative overflow-hidden flex items-center justify-between gap-6 border border-white/8 bg-[#06060D] px-8 py-6 hover:border-marvel-red/30 transition-all duration-400 hover:shadow-[0_0_50px_rgba(226,54,54,0.1)]"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(226,54,54,0.04) 0%, transparent 60%)' }}
              />
              <div className="relative">
                <p className="font-body text-[10px] tracking-[0.5em] text-white/25 uppercase mb-1">Official Email</p>
                <p className="font-heading text-xl text-marvel-red group-hover:text-white transition-colors duration-300 tracking-wide">
                  {HACKASOL_EMAIL}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-marvel-red/40 group-hover:text-marvel-red group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* Organizer cards */}
            {ORGANIZERS.map((org) => (
              <div
                key={org.id}
                className="group relative overflow-hidden border border-white/8 bg-[#06060D] px-8 py-6 hover:border-white/16 transition-all duration-400"
              >
                {/* Gradient left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300 group-hover:w-1"
                  style={{ backgroundColor: org.accentColor }}
                />

                {/* Top glow sweep on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ backgroundColor: org.accentColor + '80' }}
                />

                <div className="flex items-center gap-5 pl-2">
                  {/* Avatar glyph */}
                  <div
                    className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-2xl border transition-all duration-300"
                    style={{
                      borderColor: org.accentColor + '35',
                      backgroundColor: org.accentColor + '0D',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = org.accentColor + '80'
                      el.style.backgroundColor = org.accentColor + '20'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = org.accentColor + '35'
                      el.style.backgroundColor = org.accentColor + '0D'
                    }}
                  >
                    {org.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-2xl text-white tracking-wide leading-tight">{org.name}</p>
                    <p className="font-body text-[10px] tracking-[0.5em] uppercase mt-0.5"
                      style={{ color: org.accentColor + 'BB' }}>
                      {org.role}
                    </p>
                  </div>

                  {/* Mobile pill */}
                  {org.mobile !== 'TBA' ? (
                    <a
                      href={`tel:${org.mobile}`}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-white/8 hover:border-white/20 transition-colors duration-300"
                    >
                      <svg className="w-3.5 h-3.5 text-white/25" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-heading text-xs text-white/50 tracking-wide">{org.mobile}</span>
                    </a>
                  ) : (
                    <span className="flex-shrink-0 font-body text-xs text-white/15 tracking-widest">TBA</span>
                  )}
                </div>
              </div>
            ))}

            {/* Sponsorship enquiry row */}
            <div className="border border-white/8 bg-[#06060D] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <p className="font-body text-[10px] tracking-[0.5em] text-white/20 uppercase mb-1.5">Sponsorship Enquiries</p>
                <a
                  href={`mailto:${SPONSOR.email}`}
                  className="font-heading text-base text-marvel-red hover:text-white transition-colors duration-300 tracking-wide"
                >
                  {SPONSOR.email}
                </a>
              </div>
              <a
                id="contact-sponsor-btn"
                href={`mailto:${SPONSOR.email}?subject=Sponsorship%20Enquiry%20–%20Hack-A-Sol%205.0`}
                className="group inline-flex items-center gap-3 px-7 py-3 bg-marvel-red hover:bg-red-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(226,54,54,0.5)] flex-shrink-0"
              >
                <span className="font-heading tracking-[0.35em] text-xs text-white uppercase">Get in Touch</span>
                <svg
                  className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform duration-300"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
