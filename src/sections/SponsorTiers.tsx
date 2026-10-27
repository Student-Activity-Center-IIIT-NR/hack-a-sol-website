/**
 * src/sections/SponsorTiers.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Sponsor tier cards — redesigned with Marvel UI system.
 * No emoji badges (replaced with Chip + tier name).
 * Tier accent is red-based (dimmer for gold/silver). Red-only accent outside Tracks rule.
 * SectionHeader, Panel (accent for title tier), Chip, Button.
 */

import { TIERS, SPONSOR } from '../config'
import { sound } from '../utils/audio'
import { SectionHeader, Panel, Chip, Button } from '../components/ui'
import '../styles/marvel-ui.css'

/** Tier display metadata — red spectrum only */
const TIER_META: Record<string, { label: string; priority: boolean }> = {
  title:  { label: 'TITLE',  priority: true  },
  gold:   { label: 'GOLD',   priority: false },
  silver: { label: 'SILVER', priority: false },
}

export function SponsorTiers() {
  return (
    <section
      id="sponsor-tiers"
      className="mu-section"
      style={{ overflow: 'clip' }}
    >
      <div className="mu-container">
        <SectionHeader
          eyebrow="Partnership Packages"
          title="SPONSOR TIERS"
          sub="Pricing details coming soon. Contact us to reserve your slot early."
          align="center"
        />

        <div
          className="grid gap-6 mb-8"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}
        >
          {TIERS.map((tier) => {
            const meta = TIER_META[tier.id] ?? TIER_META.silver
            return (
              <Panel
                key={tier.id}
                variant={meta.priority ? 'accent' : 'default'}
                className={`p-8 flex flex-col ${meta.priority ? 'md:-translate-y-4' : ''}`}
                style={
                  meta.priority
                    ? { boxShadow: '0 0 40px rgba(226,54,54,0.12)' }
                    : undefined
                }
              >
                {/* Tier chip badge */}
                <Chip dot={meta.priority} className="self-start mb-6">
                  {meta.label} SPONSOR
                </Chip>

                {/* Tier name */}
                <h3
                  className="font-heading mb-1"
                  style={{ fontSize: '1.8rem', color: 'var(--text)' }}
                >
                  {tier.name}
                </h3>

                {/* Slots */}
                <p
                  className="font-body uppercase mb-4"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--faint)' }}
                >
                  {tier.slots} slot{tier.slots > 1 ? 's' : ''} available
                </p>

                {/* Price */}
                <div
                  className="font-heading mb-8"
                  style={{ fontSize: '3rem', color: 'var(--red)', lineHeight: 1 }}
                >
                  {tier.price}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--line)', marginBottom: '1.5rem' }} />

                {/* Perks */}
                <ul className="space-y-2 flex-1 mb-6">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 font-body"
                      style={{ fontSize: '0.875rem', color: 'var(--muted)' }}
                    >
                      <span style={{ color: 'var(--red)', marginTop: '2px', flexShrink: 0 }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  id={`tier-${tier.id}-cta`}
                  href={`mailto:${SPONSOR.email}?subject=Sponsorship Enquiry – ${tier.name}`}
                  data-magnetic
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                >
                  Enquire Now
                </Button>
              </Panel>
            )
          })}
        </div>

        <p
          className="font-body text-center uppercase"
          style={{ fontSize: '0.65rem', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)' }}
        >
          Custom packages available — contact {SPONSOR.email}
        </p>
      </div>
    </section>
  )
}
