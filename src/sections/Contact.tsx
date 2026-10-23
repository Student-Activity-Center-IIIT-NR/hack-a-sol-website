/**
 * src/sections/Contact.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Contact & Connect — Marvel UI redesign.
 * - SectionHeader (eyebrow "Stay Connected")
 * - Social row: equal Panels (icon, name, handle) — uniform red, no platform colors
 * - Two-column grid:
 *     Left:  Venue Panel + two transport mini Panels (airport, railway)
 *     Right: stack — official email Panel, two organizer Panels (accent variant),
 *            sponsorship Panel with primary Button "GET IN TOUCH"
 * - No blue or orange accents anywhere — red only
 */

import { SOCIALS, COLLEGE_LOCATION, ORGANIZERS, HACKASOL_EMAIL, SPONSOR } from '../config'
import { SectionHeader, Panel, Chip, Button } from '../components/ui'
import '../styles/marvel-ui.css'

/* ── Platform SVG icons ───────────────────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.529 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.645 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.375.202 2.392.1 2.645.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.481C19.137 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
}

/* Airport SVG */
const AirportIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
)

/* Railway SVG */
const RailwayIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

export function Contact() {
  return (
    <section
      id="contact"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 'min(700px, 70vw)', height: '500px',
            background: 'rgba(226,54,54,0.05)',
            filter: 'blur(130px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Stay Connected"
          title="CONTACT & CONNECT"
          accent="CONNECT"
        />

        {/* ── Social row — equal Panels (icon, name, handle) ─────────────── */}
        <div
          className="grid gap-3 mb-8"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
        >
          {(Object.entries(SOCIALS) as [keyof typeof SOCIALS, typeof SOCIALS[keyof typeof SOCIALS]][])
            .map(([key, social]) => (
              <a
                key={key}
                id={`social-${key}`}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                style={{ textDecoration: 'none' }}
              >
                <Panel className="p-4 flex flex-col gap-2">
                  {/* Icon — red */}
                  <span style={{ color: 'var(--red)' }}>
                    {SOCIAL_ICONS[key]}
                  </span>
                  <div>
                    <p
                      className="font-heading tracking-wide"
                      style={{ fontSize: '0.9rem', color: 'var(--text)' }}
                    >
                      {social.label}
                    </p>
                    <p
                      className="font-body"
                      style={{ fontSize: '0.68rem', color: 'var(--faint)', letterSpacing: '0.1em' }}
                    >
                      {social.handle}
                    </p>
                  </div>
                </Panel>
              </a>
            ))}
        </div>

        {/* ── Two-column: Venue | Right stack ──────────────────────────── */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}
        >
          {/* LEFT — Venue Panel */}
          <Panel variant="accent" className="flex flex-col">
            {/* Header */}
            <div className="px-8 py-6" style={{ borderBottom: '1px solid var(--line)' }}>
              <p
                className="font-body uppercase mb-1"
                style={{ fontSize: '0.68rem', letterSpacing: '0.32em', color: 'var(--red)' }}
              >
                Venue &amp; Connectivity
              </p>
              <p
                className="font-heading tracking-wide"
                style={{ fontSize: '1.4rem', color: 'var(--text)' }}
              >
                {COLLEGE_LOCATION.name}
              </p>
            </div>

            <div className="px-8 py-6 flex flex-col gap-5 flex-1">
              {/* Full name + address */}
              <div>
                <p
                  className="font-body leading-relaxed"
                  style={{ fontSize: '0.875rem', color: 'var(--muted)' }}
                >
                  {COLLEGE_LOCATION.fullName}
                </p>
                <p
                  className="font-body mt-1.5 tracking-wide"
                  style={{ fontSize: '0.875rem', color: 'var(--red)', opacity: 0.7 }}
                >
                  {COLLEGE_LOCATION.address}
                </p>
              </div>

              {/* Transport mini Panels */}
              <div className="grid grid-cols-2 gap-3">
                {/* Airport */}
                <Panel className="p-4">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--faint)' }}>
                    <AirportIcon />
                    <span
                      className="font-body uppercase"
                      style={{ fontSize: '0.6rem', letterSpacing: '0.32em' }}
                    >
                      Airport
                    </span>
                  </div>
                  <p
                    className="font-heading leading-snug mb-2"
                    style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                  >
                    {COLLEGE_LOCATION.airport.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-heading" style={{ fontSize: '1rem', color: 'var(--red)' }}>
                      {COLLEGE_LOCATION.airport.distance}
                    </span>
                    <span style={{ width: '1px', height: '12px', background: 'var(--line)' }} />
                    <span
                      className="font-body"
                      style={{ fontSize: '0.7rem', color: 'var(--faint)' }}
                    >
                      {COLLEGE_LOCATION.airport.time}
                    </span>
                  </div>
                </Panel>

                {/* Railway */}
                <Panel className="p-4">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--faint)' }}>
                    <RailwayIcon />
                    <span
                      className="font-body uppercase"
                      style={{ fontSize: '0.6rem', letterSpacing: '0.32em' }}
                    >
                      Railway
                    </span>
                  </div>
                  <p
                    className="font-heading leading-snug mb-2"
                    style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                  >
                    {COLLEGE_LOCATION.railway.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-heading" style={{ fontSize: '1rem', color: 'var(--red)' }}>
                      {COLLEGE_LOCATION.railway.distance}
                    </span>
                    <span style={{ width: '1px', height: '12px', background: 'var(--line)' }} />
                    <span
                      className="font-body"
                      style={{ fontSize: '0.7rem', color: 'var(--faint)' }}
                    >
                      {COLLEGE_LOCATION.railway.time}
                    </span>
                  </div>
                </Panel>
              </div>

              {/* Maps link */}
              <a
                href={COLLEGE_LOCATION.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-body uppercase"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.32em',
                  color: 'var(--faint)',
                  textDecoration: 'none',
                  transition: 'color 0.25s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--faint)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </Panel>

          {/* RIGHT — stack: email + organizers + sponsorship */}
          <div className="flex flex-col gap-4">
            {/* Official email */}
            <a
              href={`mailto:${HACKASOL_EMAIL}`}
              id="contact-official-email"
              style={{ textDecoration: 'none' }}
            >
              <Panel className="px-8 py-6 flex items-center justify-between gap-6">
                <div>
                  <p
                    className="font-body uppercase mb-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                  >
                    Official Email
                  </p>
                  <p
                    className="font-heading tracking-wide"
                    style={{ fontSize: '1.1rem', color: 'var(--red)' }}
                  >
                    {HACKASOL_EMAIL}
                  </p>
                </div>
                <svg
                  width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  style={{ color: 'var(--red)', flexShrink: 0, opacity: 0.6 }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Panel>
            </a>

            {/* Organizer cards — accent variant */}
            {ORGANIZERS.map((org) => (
              <Panel key={org.id} variant="accent" className="px-8 py-5">
                <div className="flex items-center gap-4">
                  {/* Avatar — initials in a red-bordered circle */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-sm flex items-center justify-center font-heading text-base"
                    style={{
                      border: '1px solid var(--red-soft)',
                      background: 'rgba(226,54,54,0.06)',
                      color: 'var(--text)',
                    }}
                  >
                    {org.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-heading tracking-wide leading-tight"
                      style={{ fontSize: '1.1rem', color: 'var(--text)' }}
                    >
                      {org.name}
                    </p>
                    <p
                      className="font-body uppercase mt-0.5"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--red)', opacity: 0.8 }}
                    >
                      {org.role}
                    </p>
                  </div>

                  {/* Phone Chip */}
                  {(org.mobile as string) !== 'TBA' ? (
                    <a
                      href={`tel:${org.mobile}`}
                      style={{ textDecoration: 'none', flexShrink: 0 }}
                    >
                      <Chip className="cursor-pointer hover:border-[var(--line-strong)]">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {org.mobile}
                      </Chip>
                    </a>
                  ) : (
                    <Chip>TBA</Chip>
                  )}
                </div>
              </Panel>
            ))}

            {/* Sponsorship enquiry */}
            <Panel className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <p
                  className="font-body uppercase mb-1.5"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                >
                  Sponsorship Enquiries
                </p>
                <a
                  href={`mailto:${SPONSOR.email}`}
                  className="font-heading tracking-wide"
                  style={{ fontSize: '1rem', color: 'var(--red)', textDecoration: 'none' }}
                >
                  {SPONSOR.email}
                </a>
              </div>
              <Button
                id="contact-sponsor-btn"
                href={`mailto:${SPONSOR.email}?subject=Sponsorship%20Enquiry%20%E2%80%93%20Hack-A-Sol%205.0`}
              >
                Get in Touch
              </Button>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  )
}
