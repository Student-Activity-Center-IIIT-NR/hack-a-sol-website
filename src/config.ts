/**
 * src/config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all uncertain / TBA information.
 * Update this file when dates and details are confirmed.
 * Components MUST import from here — never hard-code in JSX.
 */

import { TRACKS } from './data/tracks'

/** Scroll length per track chapter in vh units */
export const TRACK_SCROLL_VH = 280

/**
 * Shared Track Chapter layout numbers measured from reference chapters (aiml & web3).
 * Single source of truth for all 5 track chapters.
 */
export const TRACK_LAYOUT = {
  // Art box sizing & positioning
  artHeightVh: 92, // ART_HEIGHT_VH = 92vh
  maxArtWidthVw: 46, // clamped to at most 46vw
  artBottomOffsetVh: -6, // bottom offset -6vh
  artHalfWidth: '55%',

  // Text column
  textColumnWidth: '48%',
  textColumnPaddingL: '5rem', // md:pl-20
  textColumnPaddingR: '2rem', // md:pr-8
  textColumnMaxWidth: '28rem', // max-w-md

  // Glow disk & single signature ring
  glowDiskSizeVw: 36,
  glowDiskOpacity: 0.35,
  signatureRingSizeVw: 36,
  signatureRingBorderWidth: '2px',

  // Big outlined character name watermark
  watermarkFontSize: 'clamp(3rem, 9vw, 7.5rem)',
  watermarkStrokeOpacity: '25',
  watermarkLetterSpacing: '0.12em',

  // Typography tokens
  labelChipClass: 'font-body text-xs tracking-[0.5em] uppercase mb-4',
  characterSubtitleClass: 'font-heading text-xl tracking-[0.4em] text-white/30 uppercase mb-2',
  titleClass: 'font-heading text-5xl sm:text-7xl text-white leading-none tracking-wide mb-4',
  taglineClass: 'font-body text-xl mb-6',
  descriptionClass: 'font-body text-white/60 text-base leading-relaxed max-w-md mb-8',

  // Left-rail position
  leftRailPosition: 'absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20',

  // Chapter badge position
  chapterBadgeBottom: '5rem', // bottom-20
} as const

/** Hero background visual defaults */
export const HERO_WALL = {
  scale:     1.02,
  opacity:   0.38,
  centerDim: 0.30,
} as const

/** Hero parallax scroll knobs */
export const HERO_WALL_SCROLL = {
  bgScaleEnd:    1.12,
  bgShiftPercent: 12,
  textShiftPx:   -70,
  textFadeEnd:   0.75,
  mouseParallax: 16,
} as const

export const EVENT = {
  name: 'Hack-A-Sol 5.0',
  edition: '5.0',
  theme: 'MARVEL',
  hostedBy: 'IIIT Naya Raipur',
  /** Update when confirmed */
  date: 'November 2026 (TBA)',
  dateShort: 'Nov 2026',
  venue: 'IIIT Naya Raipur Campus (TBA)',
  registrationLink: '#coming-soon',
  registrationStatus: 'Coming Soon',
  prizePool: 'TBA',
  teamSize: '2 – 4 members (TBA)',
  expectedParticipants: '500+ (TBA)',
  website: 'https://hackasol.iiitnr.ac.in',
} as const

export const SPONSOR = {
  email: 'sponsorship@hackasol.iiitnr.ac.in',
  brochureLink: '#coming-soon',
  contactName: 'Sponsorship Team, Hack-A-Sol 5.0',
} as const

export const TIERS = [
  {
    id: 'title',
    name: 'Title Sponsor',
    perks: ['Exclusive naming rights', 'Prime logo placement', 'Keynote slot', 'Exclusive booth', 'All-access pass for 10'],
    price: 'TBA',
    slots: 1,
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    perks: ['Logo on all materials', 'Booth space', 'Judging panel seat', 'All-access pass for 5'],
    price: 'TBA',
    slots: 3,
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    perks: ['Logo on website & banners', 'Digital mentions', 'All-access pass for 2'],
    price: 'TBA',
    slots: 5,
  },
] as const

export const TIMELINE = [
  { label: 'Registration Opens',   date: 'TBA' },
  { label: 'Registration Closes',  date: 'TBA' },
  { label: 'Team Announcement',    date: 'TBA' },
  { label: 'Hackathon Day 1 Setup', date: 'TBA' },
  { label: 'Hackathon Day 2 + Project Demos', date: 'TBA' },
  { label: 'Prize Ceremony',       date: 'TBA' },
] as const

export const FAQ = [
  {
    q: 'Who can participate?',
    a: 'Any student currently enrolled in an undergraduate or postgraduate program. Teams of 2–4 members.',
  },
  {
    q: 'Is there a registration fee?',
    a: 'Registration details are coming soon. Follow our socials for updates.',
  },
  {
    q: 'What tracks are available?',
    a: `Hack-A-Sol 5.0 features ${TRACKS.length} specialised tracks: ${TRACKS.map(t => `${t.name} (${t.character})`).join(', ')}.`,
  },
  {
    q: 'Are travel and accommodation provided?',
    a: 'Accommodation details will be announced. Stay tuned.',
  },
  {
    q: 'When will the problem statements be released?',
    a: 'Problem statements will be shared closer to the event date. TBA.',
  },
] as const
