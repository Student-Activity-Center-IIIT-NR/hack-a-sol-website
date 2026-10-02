/**
 * src/sections/Contact.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Contact / Sponsor Enquiry section.
 * Features a mailto link and sponsor brochure placeholder.
 */

import { SPONSOR, EVENT } from '../config'

export function Contact() {
  return (
    <section id="contact" className="relative min-h-screen flex items-center px-6 py-32">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-marvel-red/8 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Headline */}
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.5em] text-marvel-red uppercase mb-4">
            Get In Touch
          </p>
          <h2 className="font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-6">
            LET'S PARTNER<br />
            <span className="text-white/30">UP</span>
          </h2>
          <p className="font-body text-white/50 text-lg max-w-xl mx-auto">
            Interested in sponsoring Hack-A-Sol 5.0? We'd love to hear from you.
            Drop us an email and our team will respond within 48 hours.
          </p>
        </div>

        {/* Contact card */}
        <div className="border border-white/10 rounded-sm p-10 bg-white/[0.02] text-center max-w-2xl mx-auto">
          <p className="font-body text-xs text-white/30 tracking-widest uppercase mb-4">
            Sponsorship Enquiries
          </p>
          <a
            id="contact-email"
            href={`mailto:${SPONSOR.email}?subject=Sponsorship%20Enquiry%20–%20Hack-A-Sol%205.0`}
            className="font-heading text-2xl sm:text-4xl text-marvel-red hover:text-white transition-colors break-all"
          >
            {SPONSOR.email}
          </a>

          <div className="h-px bg-white/10 my-8" />

          <p className="font-body text-white/30 text-sm mb-6">
            {SPONSOR.contactName}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              id="contact-download-brochure"
              href={SPONSOR.brochureLink}
              className="px-8 py-3 font-heading tracking-widest text-sm bg-marvel-red text-white rounded-sm hover:bg-red-700 transition-all hover:shadow-[0_0_30px_rgba(226,54,54,0.5)]"
            >
              DOWNLOAD BROCHURE
            </a>
            <a
              href={`mailto:${SPONSOR.email}`}
              className="px-8 py-3 font-heading tracking-widest text-sm border border-white/20 text-white rounded-sm hover:border-white/50 hover:bg-white/5 transition-all"
            >
              EMAIL US
            </a>
          </div>
        </div>

        {/* Event details */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <p className="font-heading text-xl text-white">{EVENT.date}</p>
            <p className="font-body text-xs text-white/30 tracking-widest uppercase">Date</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="font-heading text-xl text-white">{EVENT.venue}</p>
            <p className="font-body text-xs text-white/30 tracking-widest uppercase">Venue</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="font-heading text-xl text-white">{EVENT.expectedParticipants}</p>
            <p className="font-body text-xs text-white/30 tracking-widest uppercase">Participants</p>
          </div>
        </div>
      </div>
    </section>
  )
}
