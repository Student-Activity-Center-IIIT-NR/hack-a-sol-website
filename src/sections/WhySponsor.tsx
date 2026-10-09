/**
 * src/sections/WhySponsor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Sponsor pitch section — the key value propositions for partners.
 * Designed to impress potential sponsors browsing the site.
 */

const REASONS = [
  {
    icon: '🎯',
    title: 'Prime Audience',
    body: 'Direct access to 500+ of India\'s top engineering students — your next interns, employees, and brand advocates.',
  },
  {
    icon: '🏫',
    title: 'IIIT Naya Raipur',
    body: 'Backed by a premier government institute — credibility, reach, and media coverage across the region.',
  },
  {
    icon: '📣',
    title: 'Multi-Channel Visibility',
    body: 'Logo placement across social media, website, event banners, merchandise, and all official communications.',
  },
  {
    icon: '🤝',
    title: 'Talent Pipeline',
    body: 'Host a challenge, run a workshop, or conduct on-site interviews. Meet candidates you won\'t find anywhere else.',
  },
  {
    icon: '🌐',
    title: 'Digital Reach',
    body: 'Our previous editions generated thousands of impressions across LinkedIn, Instagram, and Twitter/X.',
  },
  {
    icon: '🏆',
    title: 'Innovation First',
    body: 'Align your brand with cutting-edge talent across AI, Web3, cybersecurity and public policy — the future, today.',
  },
]

export function WhySponsor() {
  return (
    <section id="why-sponsor" className="relative min-h-screen flex items-center px-6 py-32">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-marvel-red/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Back The Multiverse // Partnership
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-6">
            BACK THE MULTIVERSE<br />
            <span className="text-white/30">PARTNER WITH HACK-A-SOL 5.0</span>
          </h2>
          <p className="font-body text-white/50 text-lg max-w-2xl mx-auto">
            Hack-A-Sol 5.0 is the premier technological convergence at IIIT Naya Raipur. Partnering with us puts
            your brand at the nexus of India's brightest engineers, disruptive projects, and the next generation of builders.
          </p>
        </div>

        {/* Reasons grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REASONS.map(({ icon, title, body }) => (
            <div
              key={title}
              className="group border border-white/10 rounded-sm p-6 bg-white/[0.02] hover:border-marvel-red/40 hover:bg-white/[0.04] transition-all duration-300 cursor-default"
            >
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-heading text-2xl text-white mb-2 group-hover:text-marvel-red transition-colors">
                {title}
              </h3>
              <p className="font-body text-white/50 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            id="whysponsor-cta"
            href="#sponsor-tiers"
            className="inline-flex items-center gap-3 px-10 py-4 font-heading tracking-widest text-sm bg-marvel-red text-white rounded-sm hover:bg-red-700 transition-all hover:shadow-[0_0_40px_rgba(226,54,54,0.5)] hover:scale-105 active:scale-95"
          >
            VIEW SPONSOR PACKAGES
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
