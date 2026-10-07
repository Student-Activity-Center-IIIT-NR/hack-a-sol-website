/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Comic Marvel Multiverse Hero Section:
 * - Small red spaced text: "IIIT NAYA RAIPUR PRESENTS"
 * - Huge "HACK-A-SOL" on ONE line (white-space: nowrap, clamp(3rem, 12vw, 11rem))
 * - "5.0" between two thin horizontal lines
 * - "MARVEL" comic-style title treatment (skewed red slab, halftone dots, offset shadow)
 * - Description: "The flagship hackathon of IIIT Naya Raipur returns. 5 specialised tracks. 5 Marvel champions. One multiverse to conquer."
 * - Two centered magnetic buttons: COMING SOON and BECOME A SPONSOR
 * - Background: 5 character silhouettes (/characters/<id>.png) as pure grayscale <img> elements
 *   flanking the left and right, center column clear, with mouse parallax and scroll outward drift/fade.
 * - Fits within the first viewport at 1920x1080 and 1366x768.
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT } from '../config'
import { perfStore } from '../utils/perfStore'
import './hero.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  /** False while loading screen is active */
  ready?: boolean
}

// ── 1. Character Types & Sources ──
interface CharacterItem {
  id: string
  name: string
  src: string
  accentColor: string
}

// 5 core track champions from /public/characters/ (with baked silhouette effects)
const TRACK_CHARACTERS: CharacterItem[] = [
  { id: 'aiml', name: 'Iron Man', src: '/characters/aiml-silhouette.webp', accentColor: '#60A5FA' },
  { id: 'web3', name: 'Black Panther', src: '/characters/web3-silhouette.webp', accentColor: '#A855F7' },
  { id: 'cybersec', name: 'Captain America', src: '/characters/cybersec-silhouette.webp', accentColor: '#EF4444' },
  { id: 'coderun', name: 'Doctor Strange', src: '/characters/coderun-silhouette.webp', accentColor: '#F59E0B' },
  { id: 'robonyx', name: 'Ultron', src: '/characters/robonyx-silhouette.webp', accentColor: '#F87171' },
]

// Helper to extract clean hero name and accent color from asset filename
function getCharacterMeta(filename: string): { name: string; accent: string } {
  const lower = filename.toLowerCase()
  if (lower.includes('black-widow') || lower.includes('blackwidow')) {
    return { name: 'Black Widow', accent: '#E11D48' }
  }
  if (lower.includes('scarletwitch') || lower.includes('scarlet')) {
    return { name: 'Scarlet Witch', accent: '#EC4899' }
  }
  if (lower.includes('spiderman') || lower.includes('spider') || lower.includes('image-removebg')) {
    return { name: 'Spider-Man', accent: '#EF4444' }
  }
  if (lower.includes('wolverine')) {
    return { name: 'Wolverine', accent: '#F59E0B' }
  }
  if (lower.includes('thor')) {
    return { name: 'Thor', accent: '#38BDF8' }
  }
  if (lower.includes('hulk') || lower.includes('8u4anpj')) {
    return { name: 'Hulk', accent: '#10B981' }
  }
  if (lower.includes('hawkeye') || lower.includes('wp7494946')) {
    return { name: 'Hawkeye', accent: '#A855F7' }
  }
  return {
    name: filename.charAt(0).toUpperCase() + filename.slice(1).replace(/[-_]/g, ' '),
    accent: '#E23636',
  }
}

// 2. Automatically load all WebP images from src/assets/hero-characters/*.webp
const assetModules = import.meta.glob<string>(
  '../assets/hero-characters/*.webp',
  { eager: true, query: '?url', import: 'default' }
)

const ASSET_CHARACTERS: CharacterItem[] = Object.entries(assetModules).map(([path, url]) => {
  const filename = path.split('/').pop()?.replace(/\.(png|webp)$/i, '') || 'hero'
  const { name, accent } = getCharacterMeta(filename)
  return {
    id: `asset-${filename}`,
    name,
    src: url,
    accentColor: accent,
  }
})

// Combined character pool
const INITIAL_POOL: CharacterItem[] = [...TRACK_CHARACTERS, ...ASSET_CHARACTERS]

// ── 3. 8 Fixed Slots (4 Left, 4 Right) with Staggered Heights and Depths ──
interface SlotConfig {
  id: string
  side: 'left' | 'right'
  className: string
  depth: number
  opacity: number
  mobileVisible?: boolean
  floatDuration: number
  floatDelay: number
}

const SLOTS: SlotConfig[] = [
  // ── LEFT FLANK (4 slots: L0 nearest title, L3 outermost) ──
  {
    id: 'slot-L0',
    side: 'left',
    className: 'left-[2%] sm:left-[16%] lg:left-[20%] top-[8%] sm:top-[10%] h-[34vh] sm:h-[52vh] max-h-[300px] sm:max-h-[500px] max-w-[32vw] sm:max-w-none w-auto z-[4]',
    depth: 0.50,
    opacity: 0.52,
    mobileVisible: true,
    floatDuration: 7.2,
    floatDelay: 0.4,
  },
  {
    id: 'slot-L1',
    side: 'left',
    className: 'hidden sm:block left-[9%] lg:left-[12%] top-[48%] h-[42vh] sm:h-[46vh] max-h-[440px] w-auto z-[3]',
    depth: 0.38,
    opacity: 0.48,
    mobileVisible: false,
    floatDuration: 8.2,
    floatDelay: 0.9,
  },
  {
    id: 'slot-L2',
    side: 'left',
    className: 'hidden sm:block left-[3%] lg:left-[5%] top-[6%] h-[36vh] sm:h-[40vh] max-h-[380px] w-auto z-[2]',
    depth: 0.28,
    opacity: 0.45,
    mobileVisible: false,
    floatDuration: 9.0,
    floatDelay: 1.6,
  },
  {
    id: 'slot-L3',
    side: 'left',
    className: 'hidden sm:block -left-4 lg:left-0 top-[44%] h-[30vh] sm:h-[34vh] max-h-[320px] w-auto z-[1]',
    depth: 0.18,
    opacity: 0.42,
    mobileVisible: false,
    floatDuration: 8.6,
    floatDelay: 2.2,
  },

  // ── RIGHT FLANK (4 slots: R0 nearest title, R3 outermost) ──
  {
    id: 'slot-R0',
    side: 'right',
    className: 'right-[2%] sm:right-[16%] lg:right-[20%] top-[8%] sm:top-[10%] h-[34vh] sm:h-[52vh] max-h-[300px] sm:max-h-[500px] max-w-[32vw] sm:max-w-none w-auto z-[4]',
    depth: 0.50,
    opacity: 0.52,
    mobileVisible: true,
    floatDuration: 7.5,
    floatDelay: 0.6,
  },
  {
    id: 'slot-R1',
    side: 'right',
    className: 'hidden sm:block right-[9%] lg:right-[12%] top-[48%] h-[42vh] sm:h-[46vh] max-h-[440px] w-auto z-[3]',
    depth: 0.38,
    opacity: 0.48,
    mobileVisible: false,
    floatDuration: 8.4,
    floatDelay: 1.1,
  },
  {
    id: 'slot-R2',
    side: 'right',
    className: 'hidden sm:block right-[3%] lg:right-[5%] top-[6%] h-[36vh] sm:h-[40vh] max-h-[380px] w-auto z-[2]',
    depth: 0.28,
    opacity: 0.45,
    mobileVisible: false,
    floatDuration: 7.8,
    floatDelay: 1.8,
  },
  {
    id: 'slot-R3',
    side: 'right',
    className: 'hidden sm:block -right-4 lg:right-0 top-[44%] h-[30vh] sm:h-[34vh] max-h-[320px] w-auto z-[1]',
    depth: 0.18,
    opacity: 0.42,
    mobileVisible: false,
    floatDuration: 9.2,
    floatDelay: 2.5,
  },
]

interface SlotState {
  current: CharacterItem
  incoming: CharacterItem | null
  isFading: boolean
}

export function Hero({ ready = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const leftGroupRef = useRef<HTMLDivElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const textGroupRef = useRef<HTMLDivElement>(null)
  const crackRef = useRef<SVGSVGElement>(null)
  const slotWrapperRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const quickToMap = useRef<{ [key: string]: { x: (v: number) => void; y: (v: number) => void } }>({})

  // Track failed image files that fail to load
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Toggle from perfStore (?debug=1 leva toggle)
  const [silhouettesEnabled, setSilhouettesEnabled] = useState(true)
  useEffect(() => {
    return perfStore.subscribe((t) => setSilhouettesEnabled(t.heroSilhouettes))
  }, [])

  // Valid characters (filtering out any skipped/failed images)
  const validCharacters = useMemo(
    () => INITIAL_POOL.filter((c) => !failedImages.has(c.src)),
    [failedImages]
  )

  // Slot states (current character + incoming crossfading character)
  const [slotStates, setSlotStates] = useState<SlotState[]>(() => {
    return SLOTS.map((_, i) => ({
      current: INITIAL_POOL[i % INITIAL_POOL.length],
      incoming: null,
      isFading: false,
    }))
  })

  // Replace any slot character that fails to load with another valid character
  useEffect(() => {
    if (failedImages.size === 0) return
    setSlotStates((prev) =>
      prev.map((slot, i) => {
        if (failedImages.has(slot.current.src)) {
          const replacement = validCharacters[i % validCharacters.length] || slot.current
          return { ...slot, current: replacement }
        }
        return slot
      })
    )
  }, [failedImages, validCharacters])

  // Queue rotation index for extras when > 8 characters exist
  const rotationIndexRef = useRef(SLOTS.length)
  const rotateSlotRef = useRef(0)

  // Handle image load error: skip file and log warning
  const handleImageError = (src: string, name?: string) => {
    console.warn(`[Hero] Failed to load character image (${name || 'unknown'}): ${src}`)
    setFailedImages((prev) => new Set(prev).add(src))
  }

  // ── Rotation Effect: Crossfade extras into slots every ~6s (one slot at a time) ──
  useEffect(() => {
    if (validCharacters.length <= SLOTS.length) return

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const interval = setInterval(() => {
      const slotIdx = rotateSlotRef.current % SLOTS.length
      rotateSlotRef.current = (rotateSlotRef.current + 1) % SLOTS.length

      setSlotStates((prev) => {
        // Collect currently visible character IDs across all slots to avoid duplicates
        const visibleIds = new Set(prev.map((s) => s.current.id))
        if (prev[slotIdx]?.incoming) {
          visibleIds.add(prev[slotIdx]!.incoming!.id)
        }

        let nextCandidate: CharacterItem | undefined
        for (let i = 0; i < validCharacters.length; i++) {
          const idx = (rotationIndexRef.current + i) % validCharacters.length
          if (!visibleIds.has(validCharacters[idx].id)) {
            nextCandidate = validCharacters[idx]
            rotationIndexRef.current = idx + 1
            break
          }
        }
        if (!nextCandidate) {
          nextCandidate = validCharacters[rotationIndexRef.current % validCharacters.length]
          rotationIndexRef.current += 1
        }

        const next = [...prev]
        if (next[slotIdx]) {
          next[slotIdx] = {
            ...next[slotIdx],
            incoming: nextCandidate,
            isFading: true,
          }
        }
        return next
      })

      // Complete crossfade after 1.8s
      setTimeout(() => {
        setSlotStates((prev) => {
          const next = [...prev]
          if (next[slotIdx] && next[slotIdx].incoming) {
            next[slotIdx] = {
              current: next[slotIdx].incoming!,
              incoming: null,
              isFading: false,
            }
          }
          return next
        })
      }, 1800)
    }, 6000)

    return () => clearInterval(interval)
  }, [validCharacters])

  // ── Mouse parallax with individual depths per slot ──
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    SLOTS.forEach((slot) => {
      const el = slotWrapperRefs.current[slot.id]
      if (el) {
        quickToMap.current[slot.id] = {
          x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power2.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power2.out' }),
        }
      }
    })

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2

      SLOTS.forEach((slot) => {
        const q = quickToMap.current[slot.id]
        if (!q) return
        const multX = slot.side === 'left' ? -30 : 30
        q.x(nx * multX * slot.depth)
        q.y(ny * -20 * slot.depth)
      })
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  // ── Scroll animations: silhouettes drift outward and fade away as Tracks section starts ──
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !ready) return

    const ctx = gsap.context(() => {
      // Left silhouettes drift outward left
      if (leftGroupRef.current) {
        gsap.to(leftGroupRef.current, {
          xPercent: -35,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '55% top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      }

      // Right silhouettes drift outward right
      if (rightGroupRef.current) {
        gsap.to(rightGroupRef.current, {
          xPercent: 35,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '55% top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      }

      // Red multiverse crack fades on scroll
      if (crackRef.current) {
        gsap.to(crackRef.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '50% top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      }

      // Centered text lifts and fades
      if (textGroupRef.current) {
        gsap.to(textGroupRef.current, {
          yPercent: -12,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '50% top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      }
    }, hero)

    return () => ctx.revert()
  }, [ready])

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-label={`${EVENT.name} — Enter the Multiverse`}
      className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden pt-20 sm:pt-24 pb-8 px-4 sm:px-6 select-none"
    >
      {/* ── Faint Thin Red Multiverse Crack of Light ── */}
      <svg
        ref={crackRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[240px] h-[100svh] opacity-[0.07] pointer-events-none z-[1]"
        viewBox="0 0 240 800"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M120 0 L124 130 L117 260 L127 380 L115 510 L123 660 L120 800"
          stroke="#ff2424"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M120 0 L124 130 L117 260 L127 380 L115 510 L123 660 L120 800"
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeOpacity="0.85"
        />
      </svg>

      {/* ── BACKGROUND CHARACTER SILHOUETTES: LEFT SLOTS (Up to 4 slots) ── */}
      {silhouettesEnabled && (
        <div ref={leftGroupRef} className="absolute inset-y-0 left-0 w-1/2 pointer-events-none z-[2]" aria-hidden="true">
          {SLOTS.filter((s) => s.side === 'left').map((slot) => {
            const slotIndex = SLOTS.findIndex((s) => s.id === slot.id)
            const state = slotStates[slotIndex] || {
              current: INITIAL_POOL[slotIndex % INITIAL_POOL.length],
              incoming: null,
              isFading: false,
            }
            const char = state.current
            const incoming = state.incoming

            return (
              <div
                key={slot.id}
                ref={(el) => {
                  slotWrapperRefs.current[slot.id] = el
                }}
                className={`absolute pointer-events-none ${slot.className} hero-float-anim`}
                style={{
                  animationDuration: `${slot.floatDuration}s`,
                  animationDelay: `${slot.floatDelay}s`,
                }}
              >
                {/* Pre-blurred glow sprite (hardware composited instead of runtime drop-shadow) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    background: `radial-gradient(ellipse 65% 75% at 50% 35%, ${char.accentColor}35 0%, transparent 72%)`,
                    opacity: state.isFading ? 0 : slot.opacity * 0.7,
                    transform: 'scale(1.2)',
                    transition: 'opacity 1.8s ease-in-out',
                  }}
                />

                {/* Current Character */}
                <img
                  src={char.src}
                  alt=""
                  width={600}
                  height={600}
                  decoding="async"
                  loading={slot.id === 'slot-L0' ? 'eager' : 'lazy'}
                  onError={() => handleImageError(char.src, char.name)}
                  className="hero-silhouette-img hero-slot-char w-full h-full"
                  style={{
                    opacity: state.isFading ? 0 : slot.opacity,
                  }}
                />

                {/* Incoming Character for crossfade */}
                {incoming && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none rounded-full"
                      style={{
                        background: `radial-gradient(ellipse 65% 75% at 50% 35%, ${incoming.accentColor}35 0%, transparent 72%)`,
                        opacity: state.isFading ? slot.opacity * 0.7 : 0,
                        transform: 'scale(1.2)',
                        transition: 'opacity 1.8s ease-in-out',
                      }}
                    />
                    <img
                      src={incoming.src}
                      alt=""
                      width={600}
                      height={600}
                      decoding="async"
                      loading="lazy"
                      onError={() => handleImageError(incoming.src, incoming.name)}
                      className="hero-silhouette-img hero-slot-char absolute inset-0 w-full h-full"
                      style={{
                        opacity: state.isFading ? slot.opacity : 0,
                      }}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── BACKGROUND CHARACTER SILHOUETTES: RIGHT SLOTS (Up to 4 slots) ── */}
      {silhouettesEnabled && (
        <div ref={rightGroupRef} className="absolute inset-y-0 right-0 w-1/2 pointer-events-none z-[2]" aria-hidden="true">
          {SLOTS.filter((s) => s.side === 'right').map((slot) => {
            const slotIndex = SLOTS.findIndex((s) => s.id === slot.id)
            const state = slotStates[slotIndex] || {
              current: INITIAL_POOL[slotIndex % INITIAL_POOL.length],
              incoming: null,
              isFading: false,
            }
            const char = state.current
            const incoming = state.incoming

            return (
              <div
                key={slot.id}
                ref={(el) => {
                  slotWrapperRefs.current[slot.id] = el
                }}
                className={`absolute pointer-events-none ${slot.className} hero-float-anim`}
                style={{
                  animationDuration: `${slot.floatDuration}s`,
                  animationDelay: `${slot.floatDelay}s`,
                }}
              >
                {/* Pre-blurred glow sprite (hardware composited instead of runtime drop-shadow) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    background: `radial-gradient(ellipse 65% 75% at 50% 35%, ${char.accentColor}35 0%, transparent 72%)`,
                    opacity: state.isFading ? 0 : slot.opacity * 0.7,
                    transform: 'scale(1.2)',
                    transition: 'opacity 1.8s ease-in-out',
                  }}
                />

                {/* Current Character */}
                <img
                  src={char.src}
                  alt=""
                  width={600}
                  height={600}
                  decoding="async"
                  loading="lazy"
                  onError={() => handleImageError(char.src, char.name)}
                  className="hero-silhouette-img hero-slot-char w-full h-full"
                  style={{
                    opacity: state.isFading ? 0 : slot.opacity,
                  }}
                />

                {/* Incoming Character for crossfade */}
                {incoming && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none rounded-full"
                      style={{
                        background: `radial-gradient(ellipse 65% 75% at 50% 35%, ${incoming.accentColor}35 0%, transparent 72%)`,
                        opacity: state.isFading ? slot.opacity * 0.7 : 0,
                        transform: 'scale(1.2)',
                        transition: 'opacity 1.8s ease-in-out',
                      }}
                    />
                    <img
                      src={incoming.src}
                      alt=""
                      width={600}
                      height={600}
                      decoding="async"
                      loading="lazy"
                      onError={() => handleImageError(incoming.src, incoming.name)}
                      className="hero-silhouette-img hero-slot-char absolute inset-0 w-full h-full"
                      style={{
                        opacity: state.isFading ? slot.opacity : 0,
                      }}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── CENTERED HERO CONTENT (All fits cleanly inside the first screen) ── */}
      <div
        ref={textGroupRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center my-auto w-full px-2"
      >
        {/* Soft dark radial gradient behind the center text only (preserves legibility, no hard boxes) */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-8 -inset-y-12 sm:-inset-x-16 sm:-inset-y-16 -z-10 pointer-events-none rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(5, 5, 8, 0.88) 0%, rgba(5, 5, 8, 0.55) 55%, transparent 100%)',
          }}
        />
        {/* Optional slot: render /brand/official-logo.svg only if that file exists */}
        <img
          src="/brand/official-logo.svg"
          alt=""
          aria-hidden="true"
          className="h-7 w-auto mb-2 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* 1. Small red spaced text */}
        <p className="font-body text-xs sm:text-sm tracking-[0.42em] sm:tracking-[0.5em] text-[#e23636] uppercase font-semibold mb-2">
          {EVENT.hostedBy} PRESENTS
        </p>

        {/* 2. Huge HACK-A-SOL on ONE line: only the letter "A" is red (#e23636) */}
        <h1 className="hero-hackasol-title select-none my-1">
          HACK-<span className="text-[#e23636]">A</span>-SOL
        </h1>

        {/* 3. 5.0 between two thin horizontal lines */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-5 my-1 sm:my-2">
          <div className="h-px w-10 sm:w-16 bg-white/20" />
          <span className="font-heading text-xl sm:text-2xl md:text-3xl tracking-[0.45em] text-white/80 font-bold pl-2">
            {EVENT.edition}
          </span>
          <div className="h-px w-10 sm:w-16 bg-white/20" />
        </div>

        {/* 4. MARVEL comic-style title treatment (skewed red slab) */}
        <div className="my-1 sm:my-2">
          <div className="hero-marvel-slab">
            <span className="hero-marvel-text">{EVENT.theme}</span>
          </div>
        </div>

        {/* 5. Centered Description */}
        <p className="font-body text-xs sm:text-sm md:text-base text-white/70 max-w-xl mx-auto my-3 sm:my-4 leading-relaxed font-light px-4">
          The flagship hackathon of {EVENT.hostedBy} returns. 5 specialised tracks. 5 Marvel champions. One multiverse to conquer.
        </p>

        {/* 6. Two centered buttons: COMING SOON and BECOME A SPONSOR */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          {/* COMING SOON CTA */}
          <a
            id="hero-register-btn"
            href={EVENT.registrationLink}
            data-magnetic
            className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white bg-[#e23636] hover:bg-[#ff4444] rounded-sm transition-all duration-300 shadow-[0_0_24px_rgba(226,54,54,0.45)] hover:shadow-[0_0_36px_rgba(226,54,54,0.65)] hover:scale-105 active:scale-95"
          >
            <span>{EVENT.registrationStatus.toUpperCase()}</span>
          </a>

          {/* BECOME A SPONSOR CTA */}
          <a
            id="hero-sponsor-btn"
            href="#why-sponsor"
            data-magnetic
            className="px-7 sm:px-8 py-3 font-body font-semibold tracking-[0.2em] text-xs uppercase text-white/85 hover:text-white border border-white/25 hover:border-white/60 bg-white/[0.03] hover:bg-white/[0.08] rounded-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>BECOME A SPONSOR</span>
          </a>
        </div>
      </div>
    </section>
  )
}
