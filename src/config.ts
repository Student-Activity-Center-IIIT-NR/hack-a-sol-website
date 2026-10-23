/**
 * src/config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all uncertain / TBA information.
 * Update this file when dates and details are confirmed.
 * Components MUST import from here — never hard-code in JSX.
 */

import { TRACKS } from './data/tracks'

/**
 * HERO_VARIANT selects which hero section to render at the top of the page.
 *
 *   "multiverse" — Cinematic breach hero: fullscreen gateway shader,
 *                  HUD orbit tags, left-aligned "Enter the Multiverse" text.
 *                  (ported from commit d44a2a4; no extra HUD labels)
 *
 *   "wall"       — Marvel crowd-wall wallpaper hero with embers, HACK-A-SOL
 *                  headline, and comic-style MARVEL slab.
 *
 * To switch back to the wall hero, change "multiverse" → "wall" here.
 */
export type HeroVariant = 'multiverse' | 'wall'
export const HERO_VARIANT: HeroVariant = 'multiverse'

/**
 * HERO_VISUAL selects which 3D visual to render in the multiverse hero.
 * "portal"  — the arc-reactor dimensional gateway (default, always restored).
 * "rift"    — experimental; not currently maintained.
 * "silhouettes" — experimental; not currently maintained.
 */
export type HeroVisual = 'portal' | 'rift' | 'silhouettes'
export const HERO_VISUAL: HeroVisual = 'portal'

/**
 * All copy for the multiverse hero, in one place.
 * Update here to change any visible text without touching JSX.
 */
export const HERO_COPY = {
  /** Mono eyebrow above the event name */
  eyebrow: 'IIIT NAYA RAIPUR PRESENTS',
  /** Large event name — "5.0" gets the red accent via JSX */
  kickerBase: 'HACK-A-SOL',
  kickerEdition: '5.0',
  /** Two-line headline rendered as <h1> */
  headlineLine1: 'ENTER THE',
  headlineLine2: 'MULTIVERSE',
  /** Single-line supporting tagline */
  tagline: 'Assemble your team. Choose your universe. Build what comes next.',
  /** Primary CTA button label */
  ctaPrimary: 'COMING SOON  →',
  /** Secondary text-link label */
  ctaSecondary: 'MEET THE CHAMPIONS',
  /** anchor href for secondary link */
  ctaSecondaryHref: '#tracks',
} as const

/**
 * When false the "Become a sponsor" link is not rendered in the hero.
 * Flip to true once sponsorship page is ready.
 */
export const HERO_SHOW_SPONSOR_LINK = false

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
  {
    label: 'Registration Opens',
    date: 'TBA',
    icon: '🚀',
    description: 'Assemble your team of 2–4 and stake your claim in the Multiverse.',
  },
  {
    label: 'Registration Closes',
    date: 'TBA',
    icon: '⏳',
    description: 'Last call — once the portal closes, no new Avengers can enter.',
  },
  {
    label: 'Team Announcement',
    date: 'TBA',
    icon: '📢',
    description: 'Selected teams are revealed. Your mission briefing begins here.',
  },
  {
    label: 'Hackathon Day 1 — Setup & Build',
    date: 'TBA',
    icon: '🔧',
    description: '24 hours of ideation, engineering, and relentless problem-solving.',
  },
  {
    label: 'Hackathon Day 2 — Demo Day',
    date: 'TBA',
    icon: '🏆',
    description: 'Present your solution to an elite panel of industry experts and mentors.',
  },
  {
    label: 'Prize Ceremony & Closing',
    date: 'TBA',
    icon: '🎖',
    description: 'The worthy are crowned. Glory, prizes, and legend status await.',
  },
] as const

/** Past sponsors — replace with real logos/names when confirmed */
export type PastSponsor = {
  id: string
  name: string
  logo: string
  /** Set true for dark logos so the tile gets a light background */
  onLight?: boolean
  /**
   * How the logo plate is rendered:
   *   "plate"    — light plate (#f3f3f6 94%) so dark logos are visible (default)
   *   "original" — transparent dark bg, logo as-is
   *   "invert"   — dark bg with CSS filter:invert so white logos become dark
   */
  tone?: 'plate' | 'original' | 'invert'
}

export const PAST_SPONSORS: readonly PastSponsor[] = [
  // GitHub logo is black on white — plate mode keeps it visible;
  // onLight kept for legacy compat, tone controls the new LogoTile
  { id: 'github',        name: 'GitHub',          logo: '/sponsors/github.svg',        tone: 'plate'    },
  { id: 'geeksforgeeks', name: 'Geeks for Geeks', logo: '/sponsors/geeksforgeeks.svg', tone: 'plate'    },
  { id: 'coding-ninjas', name: 'Coding Ninjas',   logo: '/sponsors/codingninjas.svg',  tone: 'plate'    },
  { id: 'ath-india',     name: 'ETH India',        logo: '/sponsors/ethindia.svg',     tone: 'original' },
  { id: 'quill-audit',   name: 'Quill Audits',     logo: '/sponsors/quillaudits.svg',  tone: 'plate'    },
  // Incogni logo is typically white/dark — plate mode makes it visible
  { id: 'incognito',     name: 'Incogni',          logo: '/sponsors/incogni.svg',      tone: 'plate'    },
]

/** Last year stats — update when Hack-A-Sol 4.0 numbers are confirmed */
export const LAST_YEAR = {
  edition: '4.0',
  participants: '400+',
  teams: '100+',
  tracks: '4',
  prizePool: '₹1,00,000+',
  colleges: '50+',
  mentors: '20+',
  theme: 'DC UNIVERSE',
} as const

/** Organizers — update with real names and numbers */
export const ORGANIZERS = [
  {
    id: 'org-1',
    name: 'Sumit Sahoo',
    role: 'Lead Organizer',
    mobile: '8260984497',
    avatar: '⚡',
    accentColor: '#E23636',
  },
  {
    id: 'org-2',
    name: 'Bhavika Jawrani',
    role: 'Lead Organizer',
    mobile: '9039027103',
    avatar: '🛡',
    accentColor: '#60A5FA',
  },
] as const

/** College / venue location details */
export const COLLEGE_LOCATION = {
  name: 'IIIT Naya Raipur',
  fullName: 'International Institute of Information Technology, Naya Raipur',
  address: 'Atal Nagar, Naya Raipur, Chhattisgarh — 493661',
  mapLink: 'https://www.google.com/maps/place/International+Institute+of+Information+Technology,+Naya+Raipur/@21.1284694,81.7635905,17z/data=!3m1!4b1!4m6!3m5!1s0x3a28c434ac2ae871:0x4e3568497a7e1d7e!8m2!3d21.1284644!4d81.7661654!16s%2Fg%2F11dxm6nvnl?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D',
  airport: {
    name: 'Swami Vivekananda Airport, Raipur',
    distance: '~15 km',
    time: '~40 min by cab',
  },
  railway: {
    name: 'Raipur Railway Station',
    distance: '~26 km',
    time: '~35 min by cab',
  },
} as const

/** Social media links — update when handles are confirmed */
export const SOCIALS = {
  github:    { label: 'GitHub',    href: 'https://github.com/Student-Activity-Center-IIIT-NR/hack-a-sol-website',       handle: '@hackasol'    },
  discord:   { label: 'Discord',   href: 'https://discord.gg/hackasol',       handle: 'Join Server'  },
  linkedin:  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/hack-a-sol/ahome/', handle: '@hackasol' },
  twitter:   { label: 'Twitter/X', href: 'https://x.com/home',      handle: '@hackasol'    },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/hack_a_sol_iiitnr/',    handle: '@hackasol'    },
} as const

/** Hackathon official contact email */
export const HACKASOL_EMAIL = 'hackasol@iiitnr.ac.in'

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
