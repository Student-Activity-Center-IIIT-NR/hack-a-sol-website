/**
 * src/sections/WhySponsor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Sponsor pitch section — redesigned with Marvel UI system.
 * SectionHeader, Panel reason cards (lucide icons), primary Button CTA.
 * No emoji. Red-only accent.
 */

import {
  Crosshair,
  Landmark,
  Megaphone,
  Users,
  Globe,
  Trophy,
} from 'lucide-react'
import { SectionHeader, Panel, Button } from '../components/ui'
import '../styles/marvel-ui.css'

const REASONS = [
  {
    Icon: Crosshair,
    title: 'Prime Audience',
    body: "Direct access to 500+ of India's top engineering students — your next interns, employees, and brand advocates.",
  },
  {
    Icon: Landmark,
    title: 'IIIT Naya Raipur',
    body: 'Backed by a premier government institute — credibility, reach, and media coverage across the region.',
  },
  {
    Icon: Megaphone,
    title: 'Multi-Channel Visibility',
    body: 'Logo placement across social media, website, event banners, merchandise, and all official communications.',
  },
  {
    Icon: Users,
    title: 'Talent Pipeline',
    body: "Host a challenge, run a workshop, or conduct on-site interviews. Meet candidates you won't find anywhere else.",
  },
  {
    Icon: Globe,
    title: 'Digital Reach',
    body: 'Our previous editions generated thousands of impressions across LinkedIn, Instagram, and Twitter/X.',
  },
  {
    Icon: Trophy,
    title: 'Innovation First',
    body: 'Align your brand with cutting-edge talent across AI, Web3, cybersecurity and public policy — the future, today.',
  },
]

export function WhySponsor() {
  return (
    <section
      id="why-sponsor"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(600px, 60vw)',
            height: '600px',
            background: 'rgba(226,54,54,0.04)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="mu-container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Back The Multiverse // Partnership"
          title="BACK THE MULTIVERSE"
          sub="Hack-A-Sol 5.0 is the premier technological convergence at IIIT Naya Raipur. Partnering with us puts your brand at the nexus of India's brightest engineers, disruptive projects, and the next generation of builders."
          align="center"
        />

        {/* Reasons grid */}
        <div
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}
        >
          {REASONS.map(({ Icon, title, body }) => (
            <Panel key={title} className="p-6">
              {/* Icon — red, 20px, stroke 1.5 */}
              <span style={{ color: 'var(--red)', display: 'block', marginBottom: '1rem' }}>
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <h3
                className="font-heading tracking-wide mb-2"
                style={{ fontSize: '1.3rem', color: 'var(--text)' }}
              >
                {title}
              </h3>
              <p
                className="font-body leading-relaxed"
                style={{ fontSize: '0.875rem', color: 'var(--muted)' }}
              >
                {body}
              </p>
            </Panel>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button id="whysponsor-cta" href="#sponsor-tiers">
            View Sponsor Packages
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
}
