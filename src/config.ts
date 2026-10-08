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

/** Optional priority filename keywords for Hero character slots */
export const HERO_PRIORITY: string[] = []

/** Maximum allowable total frame overlap fraction */
export const HERO_MAX_OVERLAP = 0.25

/** Uniform bust crowd layout parameters for Hero characters */
export const HERO_LAYOUT = {
  innerHeightVh: 32,
  outerHeightVh: 28,
  innerCenterX: 22,
  outerCenterX: 10,
  outerTops: [10, 38, 66] as [number, number, number],
  innerTops: [22, 50, 74] as [number, number, number],
  innerOpacity: 0.50,
  outerOpacity: 0.40,
  maxOverlap: HERO_MAX_OVERLAP,
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
