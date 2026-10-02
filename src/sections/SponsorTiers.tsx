/**
 * src/sections/SponsorTiers.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Three sponsor tiers: Title / Gold / Silver.
 * All pricing is TBA (from config.ts). Designed for visual impact.
 */

import { TIERS, SPONSOR } from '../config'
import { sound } from '../utils/audio'

const TIER_STYLES: Record<string, { accent: string; glow: string; badge: string }> = {
  title:  { accent: '#F5A623', glow: 'rgba(245,166,35,0.25)', badge: '👑' },
  gold:   { accent: '#FFD700', glow: 'rgba(255,215,0,0.15)',  badge: '🥇' },
  silver: { accent: '#C0C0C0', glow: 'rgba(192,192,192,0.12)',badge: '🥈' },
}

export function SponsorTiers() {
  return (
    <section id="sponsor-tiers" className="relative min-h-screen flex items-center px-6 py-32">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Partnership Packages
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4">
            SPONSOR TIERS
          </h2>
          <p className="font-body text-white/40 text-base">
            Pricing details coming soon. Contact us to reserve your slot early.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const style = TIER_STYLES[tier.id] ?? TIER_STYLES.silver
            return (
              <div
                key={tier.id}
                className={`relative border rounded-sm p-8 bg-white/[0.02] transition-all duration-500 hover:scale-[1.02] group flex flex-col ${
                  tier.id === 'title' ? 'md:-translate-y-4 border-2' : 'border'
                }`}
                style={{
                  borderColor: style.accent + (tier.id === 'title' ? 'AA' : '40'),
                  boxShadow: tier.id === 'title' ? `0 0 40px ${style.glow}` : 'none',
                }}
              >
                {/* Badge */}
                <div className="text-4xl mb-4">{style.badge}</div>

                {/* Tier name */}
                <h3 className="font-heading text-3xl mb-1" style={{ color: style.accent }}>
                  {tier.name}
                </h3>

                {/* Slots */}
                <p className="font-body text-xs text-white/30 mb-4 tracking-widest uppercase">
                  {tier.slots} slot{tier.slots > 1 ? 's' : ''} available
                </p>

                {/* Price */}
                <div
                  className="font-heading text-5xl mb-8 transition-all duration-300"
                  style={{ color: style.accent }}
                >
                  {tier.price}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-6" />

                {/* Perks */}
                <ul className="space-y-3">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 font-body text-sm text-white/60">
                      <span style={{ color: style.accent }} className="mt-0.5 flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  id={`tier-${tier.id}-cta`}
                  href={`mailto:${SPONSOR.email}?subject=Sponsorship Enquiry – ${tier.name}`}
                  data-magnetic
                  onMouseEnter={(e) => {
                    sound.playHover()
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = style.accent + '15'
                  }}
                  onClick={() => sound.playClick()}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                  className="mt-auto w-full block text-center py-3 font-heading tracking-widest text-sm border transition-all duration-300 rounded-sm hover:scale-105"
                  style={{
                    borderColor: style.accent + '60',
                    color: style.accent,
                  }}
                >
                  ENQUIRE NOW
                </a>
              </div>
            )
          })}
        </div>

        <p className="text-center font-body text-xs text-white/20 tracking-widest mt-10 uppercase">
          Custom packages available — contact {SPONSOR.email}
        </p>
      </div>
    </section>
  )
}
