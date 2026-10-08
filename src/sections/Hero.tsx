/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Comic Marvel Multiverse Hero Section — Poster-Style Wing Wall:
 * - Small red spaced text: "IIIT NAYA RAIPUR PRESENTS"
 * - Huge "HACK-A-SOL" on ONE line (white-space: nowrap, clamp(3rem, 12vw, 11rem))
 * - "5.0" between two thin horizontal lines
 * - "MARVEL" comic-style title treatment (skewed red slab, halftone dots, offset shadow)
 * - Description: "The flagship hackathon of IIIT Naya Raipur returns. 3 specialised tracks. 3 Marvel champions. One multiverse to conquer."
 * - Two centered magnetic buttons: COMING SOON and BECOME A SPONSOR
 *
 * Poster-Style Wing Layout:
 * - Symmetrical left wing (0–26vw) & right wing (74–100vw).
 * - Per wing: FRONT (60vh), BACK (52vh, z behind FRONT), BUST-INNER (28vh), BUST-OUTER (28vh).
 * - Head box = top 35% of trimmed figure. Overlap with any head box is strictly 0.
 * - Body overlap (FRONT over BACK) <= HERO_MAX_BODY_OVERLAP (0.30).
 * - Automatic resolution: outward shift (1vw steps), scale down (4% steps), or fallback drop.
 * - Bottom 12vh gradient to black blends figures seamlessly.
 * - Mouse parallax & float clamped to <= 6px. Outward drift/fade on scroll.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useControls, button } from 'leva'
import { EVENT, HERO_PRIORITY, HERO_MAX_BODY_OVERLAP, HERO_LAYOUT } from '../config'
import { perfStore } from '../utils/perfStore'
import './hero.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  /** False while loading screen is active */
  ready?: boolean
}

// ── 1. Raw Character Definitions & Discovery ──
interface RawCharacterItem {
  id: string
  name: string
  filename: string
  src: string
  accentColor: string
}

export interface ProcessedCharacter {
  id: string
  name: string
  filename: string
  originalSrc: string
  trimmedSrc: string
  trimW: number
  trimH: number
  aspect: number
  brightnessMultiplier: number
  accentColor: string
}

// 3 core track champions from /public/characters/
const TRACK_CHARACTERS: RawCharacterItem[] = [
  { id: 'aiml', name: 'Iron Man', filename: 'aiml-silhouette', src: '/characters/aiml-silhouette.webp', accentColor: '#60A5FA' },
  { id: 'web3', name: 'Black Panther', filename: 'web3-silhouette', src: '/characters/web3-silhouette.webp', accentColor: '#A855F7' },
  { id: 'cybersec', name: 'Captain America', filename: 'cybersec-silhouette', src: '/characters/cybersec-silhouette.webp', accentColor: '#EF4444' },
]

function getCharacterMeta(filename: string): { name: string; accent: string } {
  const lower = filename.toLowerCase()
  if (lower.includes('black-widow') || lower.includes('blackwidow')) return { name: 'Black Widow', accent: '#E11D48' }
  if (lower.includes('scarletwitch') || lower.includes('scarlet')) return { name: 'Scarlet Witch', accent: '#EC4899' }
  if (lower.includes('spiderman') || lower.includes('spider') || lower.includes('image-removebg')) return { name: 'Spider-Man', accent: '#EF4444' }
  if (lower.includes('wolverine')) return { name: 'Wolverine', accent: '#F59E0B' }
  if (lower.includes('thor')) return { name: 'Thor', accent: '#38BDF8' }
  if (lower.includes('hulk') || lower.includes('8u4anpj')) return { name: 'Hulk', accent: '#10B981' }
  if (lower.includes('hawkeye') || lower.includes('wp7494946')) return { name: 'Hawkeye', accent: '#A855F7' }
  return {
    name: filename.charAt(0).toUpperCase() + filename.slice(1).replace(/[-_]/g, ' '),
    accent: '#E23636',
  }
}

// Discover all images in src/assets/hero-characters/*.{webp,png}
const assetModules = import.meta.glob<string>(
  ['../assets/hero-characters/*.webp', '../assets/hero-characters/*.png'],
  { eager: true, query: '?url', import: 'default' }
)

const assetMap = new Map<string, string>()
Object.entries(assetModules).forEach(([path, url]) => {
  const file = path.split('/').pop() || ''
  const base = file.replace(/\.(png|webp)$/i, '')
  // Prefer WebP if both exist
  if (!assetMap.has(base) || path.endsWith('.webp')) {
    assetMap.set(base, url)
  }
})

const DISCOVERED_ASSET_CHARACTERS: RawCharacterItem[] = Array.from(assetMap.entries()).map(([base, url]) => {
  const { name, accent } = getCharacterMeta(base)
  return {
    id: `asset-${base}`,
    name,
    filename: base,
    src: url,
    accentColor: accent,
  }
})

const CANDIDATE_POOL: RawCharacterItem[] = [...TRACK_CHARACTERS, ...DISCOVERED_ASSET_CHARACTERS]

// ── 2. Wing Slot Definition ──
export type SlotRole = 'front' | 'back' | 'bust-inner' | 'bust-outer'

export interface WingSlotDef {
  id: string
  name: string
  side: 'left' | 'right'
  role: SlotRole
  xVw: number        // Left coordinate in vw (0..100)
  yVh: number        // Top coordinate in vh (0..100)
  wVw: number        // Width in vw
  hVh: number        // Height in vh
  anchor: 'bottom' | 'top'
  zIndex: number     // 1: back, 2: bust, 3: front
  baseOpacity: number
  brightnessFactor: number
  scale: number
  depth: number      // Parallax multiplier
  floatDuration: number
  floatDelay: number
}

// Base Slot Geometry (Desktop >= 1280px)
// Left wing: x 0-26vw, Right wing: mirror 74-100vw
export const BASE_WING_SLOTS: WingSlotDef[] = [
  // 1. FRONT L (x: 6-24vw, h: 60vh, bottom-anchored, opacity: 0.55, z: 3)
  {
    id: 'front-L',
    name: 'Front Left',
    side: 'left',
    role: 'front',
    xVw: 6,
    yVh: 40,
    wVw: 18,
    hVh: 60,
    anchor: 'bottom',
    zIndex: 3,
    baseOpacity: 0.55,
    brightnessFactor: 1.0,
    scale: 1.0,
    depth: 0.6,
    floatDuration: 6.8,
    floatDelay: 0.1,
  },
  // 2. FRONT R (x: 76-94vw, h: 60vh, bottom-anchored, opacity: 0.55, z: 3)
  {
    id: 'front-R',
    name: 'Front Right',
    side: 'right',
    role: 'front',
    xVw: 76,
    yVh: 40,
    wVw: 18,
    hVh: 60,
    anchor: 'bottom',
    zIndex: 3,
    baseOpacity: 0.55,
    brightnessFactor: 1.0,
    scale: 1.0,
    depth: 0.6,
    floatDuration: 7.1,
    floatDelay: 0.4,
  },
  // 3. BACK L (x: -2-14vw, h: 52vh, bottom-anchored, opacity: 0.42, brightness: x0.85, z: 1)
  {
    id: 'back-L',
    name: 'Back Left',
    side: 'left',
    role: 'back',
    xVw: -2,
    yVh: 48,
    wVw: 16,
    hVh: 52,
    anchor: 'bottom',
    zIndex: 1,
    baseOpacity: 0.42,
    brightnessFactor: 0.85,
    scale: 1.0,
    depth: 0.4,
    floatDuration: 8.0,
    floatDelay: 0.8,
  },
  // 4. BACK R (x: 86-102vw, h: 52vh, bottom-anchored, opacity: 0.42, brightness: x0.85, z: 1)
  {
    id: 'back-R',
    name: 'Back Right',
    side: 'right',
    role: 'back',
    xVw: 86,
    yVh: 48,
    wVw: 16,
    hVh: 52,
    anchor: 'bottom',
    zIndex: 1,
    baseOpacity: 0.42,
    brightnessFactor: 0.85,
    scale: 1.0,
    depth: 0.4,
    floatDuration: 8.3,
    floatDelay: 1.1,
  },
  // 5. BUST-INNER L (x: 12-24.5vw, y: 8-36vh, h: 28vh, top-aligned, opacity: 0.40, z: 2)
  {
    id: 'bust-inner-L',
    name: 'Bust Inner Left',
    side: 'left',
    role: 'bust-inner',
    xVw: 12,
    yVh: 8,
    wVw: 12.5,
    hVh: 28,
    anchor: 'top',
    zIndex: 2,
    baseOpacity: 0.40,
    brightnessFactor: 0.9,
    scale: 1.0,
    depth: 0.5,
    floatDuration: 7.4,
    floatDelay: 0.5,
  },
  // 6. BUST-INNER R (x: 75.5-88vw, y: 8-36vh, h: 28vh, top-aligned, opacity: 0.40, z: 2)
  {
    id: 'bust-inner-R',
    name: 'Bust Inner Right',
    side: 'right',
    role: 'bust-inner',
    xVw: 75.5,
    yVh: 8,
    wVw: 12.5,
    hVh: 28,
    anchor: 'top',
    zIndex: 2,
    baseOpacity: 0.40,
    brightnessFactor: 0.9,
    scale: 1.0,
    depth: 0.5,
    floatDuration: 7.6,
    floatDelay: 0.7,
  },
  // 7. BUST-OUTER L (x: 0-12vw, y: 8-36vh, h: 28vh, top-aligned, opacity: 0.38, z: 2)
  {
    id: 'bust-outer-L',
    name: 'Bust Outer Left',
    side: 'left',
    role: 'bust-outer',
    xVw: 0,
    yVh: 8,
    wVw: 12,
    hVh: 28,
    anchor: 'top',
    zIndex: 2,
    baseOpacity: 0.38,
    brightnessFactor: 0.9,
    scale: 1.0,
    depth: 0.35,
    floatDuration: 8.5,
    floatDelay: 1.3,
  },
  // 8. BUST-OUTER R (x: 88-100vw, y: 8-36vh, h: 28vh, top-aligned, opacity: 0.38, z: 2)
  {
    id: 'bust-outer-R',
    name: 'Bust Outer Right',
    side: 'right',
    role: 'bust-outer',
    xVw: 88,
    yVh: 8,
    wVw: 12,
    hVh: 28,
    anchor: 'top',
    zIndex: 2,
    baseOpacity: 0.38,
    brightnessFactor: 0.9,
    scale: 1.0,
    depth: 0.35,
    floatDuration: 8.7,
    floatDelay: 1.5,
  },
]

// ── 3. Client Offscreen Canvas Trim & Normalize ──
async function processCandidateImage(cand: RawCharacterItem): Promise<ProcessedCharacter | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = img.naturalWidth
        const h = img.naturalHeight
        if (!w || !h) {
          resolve(null)
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, w, h)
        const data = imgData.data

        const getAlpha = (x: number, y: number) => data[(y * w + x) * 4 + 3]

        // 1. Skip if all 4 corners and edge midpoints are nearly opaque (baked background)
        const samplePoints = [
          getAlpha(0, 0),
          getAlpha(w - 1, 0),
          getAlpha(0, h - 1),
          getAlpha(w - 1, h - 1),
          getAlpha(Math.floor(w / 2), 0),
          getAlpha(Math.floor(w / 2), h - 1),
          getAlpha(0, Math.floor(h / 2)),
          getAlpha(w - 1, Math.floor(h / 2)),
        ]
        const allNearlyOpaque = samplePoints.every((a) => a > 220)
        if (allNearlyOpaque) {
          console.warn(`[Hero] Skipping ${cand.name} (${cand.filename}): baked background detected (corners/edges opaque)`)
          resolve(null)
          return
        }

        // 2. Find bounding box of pixels with alpha > 16 & compute average luminance
        let minX = w, maxX = 0, minY = h, maxY = 0
        let sumLum = 0, countLum = 0

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            const a = data[idx + 3]
            if (a > 16) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y

              const r = data[idx]
              const g = data[idx + 1]
              const b = data[idx + 2]
              const lum = 0.299 * r + 0.587 * g + 0.114 * b
              sumLum += lum
              countLum++
            }
          }
        }

        if (countLum === 0 || maxX < minX || maxY < minY) {
          console.warn(`[Hero] Skipping ${cand.name} (${cand.filename}): no visible pixels found`)
          resolve(null)
          return
        }

        const trimW = maxX - minX + 1
        const trimH = maxY - minY + 1
        const aspect = trimW / trimH

        // 3. Auto-normalize brightness (average luminance multiplier between 0.8 and 1.6)
        const avgLum = sumLum / countLum
        const targetLum = 115
        const rawMult = targetLum / Math.max(15, avgLum)
        const brightnessMultiplier = Math.min(1.6, Math.max(0.8, rawMult))

        // 4. Draw trimmed figure to cropped offscreen canvas (zero transparent padding)
        const cropCanvas = document.createElement('canvas')
        cropCanvas.width = trimW
        cropCanvas.height = trimH
        const cropCtx = cropCanvas.getContext('2d')
        if (cropCtx) {
          cropCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH)
        }
        const trimmedSrc = cropCanvas.toDataURL('image/webp')

        resolve({
          id: cand.id,
          name: cand.name,
          filename: cand.filename,
          originalSrc: cand.src,
          trimmedSrc,
          trimW,
          trimH,
          aspect,
          brightnessMultiplier,
          accentColor: cand.accentColor,
        })
      } catch (err) {
        console.warn(`[Hero] Error processing ${cand.name}:`, err)
        resolve(null)
      }
    }
    img.onerror = () => {
      console.warn(`[Hero] Failed to load image for ${cand.name} (${cand.src})`)
      resolve(null)
    }
    img.src = cand.src
  })
}

interface SlotState {
  current: ProcessedCharacter
  incoming: ProcessedCharacter | null
  isFading: boolean
}

interface PlacedSlot {
  slot: WingSlotDef
  state: SlotState
  adjustedX: number
  adjustedScale: number
}

export function Hero({ ready = true }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const leftGroupRef = useRef<HTMLDivElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const textGroupRef = useRef<HTMLDivElement>(null)
  const crackRef = useRef<SVGSVGElement>(null)
  const slotWrapperRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const quickToMap = useRef<{ [key: string]: { x: (v: number) => void; y: (v: number) => void } }>({})

  // Toggle from perfStore (?debug=1 leva toggle)
  const [silhouettesEnabled, setSilhouettesEnabled] = useState(true)
  useEffect(() => {
    return perfStore.subscribe((t) => setSilhouettesEnabled(t.heroSilhouettes))
  }, [])

  // Check URL query parameters
  const isDebugUrl = typeof window !== 'undefined' && window.location.search.includes('debug=1')
  const isHeroTune = typeof window !== 'undefined' && window.location.search.includes('hero=tune')
  const showHeroBoxes = typeof window !== 'undefined' && (window.location.search.includes('hero=boxes') || (isDebugUrl && window.location.search.includes('hero=boxes')))

  // Leva Tuner Controls (?debug=1&hero=tune)
  const tuneValues = useControls(
    'Hero Poster Wall Tuner',
    {
      frontHeightVh:   { value: HERO_LAYOUT.frontHeightVh, min: 40, max: 75, step: 1, label: 'Front H (vh)' },
      backHeightVh:    { value: HERO_LAYOUT.backHeightVh,  min: 35, max: 65, step: 1, label: 'Back H (vh)' },
      bustHeightVh:    { value: HERO_LAYOUT.bustHeightVh,  min: 20, max: 40, step: 1, label: 'Bust H (vh)' },
      frontOpacity:    { value: HERO_LAYOUT.frontOpacity,  min: 0.2, max: 1.0, step: 0.05, label: 'Front Opacity' },
      backOpacity:     { value: HERO_LAYOUT.backOpacity,   min: 0.2, max: 1.0, step: 0.05, label: 'Back Opacity' },
      maxBodyOverlap:  { value: HERO_LAYOUT.maxBodyOverlap,min: 0.0, max: 0.6, step: 0.02, label: 'Max Body Overlap' },
      edgeBleedVw:     { value: HERO_LAYOUT.edgeBleedVw,   min: 0, max: 5, step: 0.5, label: 'Edge Bleed (vw)' },
      'Copy values': button(() => {
        const out = `export const HERO_LAYOUT = ${JSON.stringify(
          {
            frontHeightVh: tuneValues.frontHeightVh,
            backHeightVh: tuneValues.backHeightVh,
            bustHeightVh: tuneValues.bustHeightVh,
            frontOpacity: tuneValues.frontOpacity,
            backOpacity: tuneValues.backOpacity,
            bustInnerOpacity: HERO_LAYOUT.bustInnerOpacity,
            bustOuterOpacity: HERO_LAYOUT.bustOuterOpacity,
            maxBodyOverlap: tuneValues.maxBodyOverlap,
            edgeBleedVw: tuneValues.edgeBleedVw,
          },
          null,
          2
        )} as const`
        navigator.clipboard?.writeText(out).catch(() => {})
        console.log('[Hero Tuner] Copied HERO_LAYOUT config:\n', out)
      }),
    },
    { render: () => isHeroTune }
  )

  const activeLayout = useMemo(() => {
    if (isHeroTune) {
      return {
        frontHeightVh: tuneValues.frontHeightVh,
        backHeightVh: tuneValues.backHeightVh,
        bustHeightVh: tuneValues.bustHeightVh,
        frontOpacity: tuneValues.frontOpacity,
        backOpacity: tuneValues.backOpacity,
        maxBodyOverlap: tuneValues.maxBodyOverlap,
        edgeBleedVw: tuneValues.edgeBleedVw,
      }
    }
    return {
      frontHeightVh: HERO_LAYOUT.frontHeightVh,
      backHeightVh: HERO_LAYOUT.backHeightVh,
      bustHeightVh: HERO_LAYOUT.bustHeightVh,
      frontOpacity: HERO_LAYOUT.frontOpacity,
      backOpacity: HERO_LAYOUT.backOpacity,
      maxBodyOverlap: HERO_MAX_BODY_OVERLAP,
      edgeBleedVw: HERO_LAYOUT.edgeBleedVw,
    }
  }, [isHeroTune, tuneValues])

  const [activeSlots, setActiveSlots] = useState<PlacedSlot[]>([])
  const extraRotationQueueRef = useRef<ProcessedCharacter[]>([])
  const rotateSlotCounterRef = useRef(0)

  // 1. Process candidate images on mount & resolve layer rules
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      const results = await Promise.all(CANDIDATE_POOL.map(processCandidateImage))
      if (cancelled) return
      const valid = results.filter((r): r is ProcessedCharacter => r !== null)

      // Sort usable images deterministically by filename (no randomness)
      const sorted = [...valid].sort((a, b) => a.filename.localeCompare(b.filename))

      // Check priority keywords from HERO_PRIORITY in src/config.ts
      const priorityChars: ProcessedCharacter[] = []
      const normalChars: ProcessedCharacter[] = []

      sorted.forEach((char) => {
        const isPriority = HERO_PRIORITY.length > 0 && HERO_PRIORITY.some((kw) => char.filename.toLowerCase().includes(kw.toLowerCase()))
        if (isPriority) priorityChars.push(char)
        else normalChars.push(char)
      })

      // Combine: Priority heroes go first into FRONT then BACK, followed by sorted heroes
      const orderedPool = [...priorityChars, ...normalChars]

      // Fill symmetric pairs only (front L/R, back L/R, bust-inner L/R, bust-outer L/R)
      const usablePairsCount = Math.floor(orderedPool.length / 2) * 2
      const initialAssigned = orderedPool.slice(0, Math.min(BASE_WING_SLOTS.length, usablePairsCount))
      const extras = orderedPool.slice(initialAssigned.length)
      extraRotationQueueRef.current = extras

      // Map to initial slots in fill order
      const initialPlaced: PlacedSlot[] = []
      initialAssigned.forEach((char, i) => {
        if (BASE_WING_SLOTS[i]) {
          const slot = { ...BASE_WING_SLOTS[i] }
          // Apply active layout heights & opacities
          if (slot.role === 'front') {
            slot.hVh = activeLayout.frontHeightVh
            slot.yVh = 100 - activeLayout.frontHeightVh
            slot.baseOpacity = activeLayout.frontOpacity
          } else if (slot.role === 'back') {
            slot.hVh = activeLayout.backHeightVh
            slot.yVh = 100 - activeLayout.backHeightVh
            slot.baseOpacity = activeLayout.backOpacity
          } else {
            slot.hVh = activeLayout.bustHeightVh
          }

          initialPlaced.push({
            slot,
            state: {
              current: char,
              incoming: null,
              isFading: false,
            },
            adjustedX: slot.xVw,
            adjustedScale: slot.scale,
          })
        }
      })

      // ── Layering & Collision Resolution ──
      // Head box = top 35% of trimmed box. Overlap with head box MUST be 0.
      // Body overlap (FRONT over BACK) allowed up to activeLayout.maxBodyOverlap (0.30)
      const resolved = resolveLayeringRules(initialPlaced, activeLayout)
      setActiveSlots(resolved)
    }

    loadAll()
    return () => {
      cancelled = true
    }
  }, [activeLayout])

  // 2. Extras rotation: rotate extras into BUST slots only with 1.2s crossfade every ~6s
  useEffect(() => {
    if (extraRotationQueueRef.current.length === 0 || activeSlots.length === 0) return

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const interval = setInterval(() => {
      if (extraRotationQueueRef.current.length === 0) return

      // Find bust slot indices
      const bustIndices: number[] = []
      activeSlots.forEach((item, idx) => {
        if (item.slot.role.startsWith('bust')) bustIndices.push(idx)
      })
      if (bustIndices.length === 0) return

      const targetIndex = bustIndices[rotateSlotCounterRef.current % bustIndices.length]
      rotateSlotCounterRef.current++

      const incomingCandidate = extraRotationQueueRef.current.shift()
      if (!incomingCandidate) return

      setActiveSlots((prev) => {
        const next = [...prev]
        if (next[targetIndex]) {
          next[targetIndex] = {
            ...next[targetIndex],
            state: {
              ...next[targetIndex].state,
              incoming: incomingCandidate,
              isFading: true,
            },
          }
        }
        return next
      })

      // Complete crossfade after 1.2s
      setTimeout(() => {
        setActiveSlots((prev) => {
          const next = [...prev]
          if (next[targetIndex] && next[targetIndex].state.incoming) {
            const oldCurrent = next[targetIndex].state.current
            // Return old character to rotation pool
            extraRotationQueueRef.current.push(oldCurrent)

            next[targetIndex] = {
              ...next[targetIndex],
              state: {
                current: next[targetIndex].state.incoming!,
                incoming: null,
                isFading: false,
              },
            }
          }
          return next
        })
      }, 1200)
    }, 6000)

    return () => clearInterval(interval)
  }, [activeSlots])

  // 3. Diagnostics & self-check overlap metrics
  const [debugMetrics, setDebugMetrics] = useState<{
    figureBoxes: {
      slotId: string
      charName: string
      slotBox: { x: number; y: number; w: number; h: number }
      figBox: { x: number; y: number; w: number; h: number }
      headBox: { x: number; y: number; w: number; h: number }
      zIndex: number
    }[]
    maxHeadOverlap: number
    maxBodyOverlapFraction: number
    maxCenterZoneIntrusion: number
  }>({ figureBoxes: [], maxHeadOverlap: 0, maxBodyOverlapFraction: 0, maxCenterZoneIntrusion: 0 })

  const runSelfCheck = useCallback(() => {
    if (typeof window === 'undefined' || activeSlots.length === 0) return

    const vw = window.innerWidth
    const vh = window.innerHeight

    const computedBoxes = activeSlots.map(({ slot, state, adjustedX, adjustedScale }) => {
      const char = state.current
      const slotX = (adjustedX / 100) * vw
      const slotY = (slot.yVh / 100) * vh
      const slotW = (slot.wVw / 100) * vw
      const slotH = (slot.hVh / 100) * vh

      const s = Math.min(slotW / char.trimW, slotH / char.trimH) * adjustedScale
      const figW = char.trimW * s
      const figH = char.trimH * s
      const figX = slotX + (slotW - figW) / 2
      const figY = slot.anchor === 'top' ? slotY : slotY + (slotH - figH) // bottom-center or top-center

      // Head box: top 35% of trimmed figure box
      const headH = figH * 0.35
      const headBox = { x: figX, y: figY, w: figW, h: headH }

      return {
        slotId: slot.id,
        role: slot.role,
        side: slot.side,
        charName: char.name,
        zIndex: slot.zIndex,
        slotBox: { x: slotX, y: slotY, w: slotW, h: slotH },
        figBox: { x: figX, y: figY, w: figW, h: figH },
        headBox,
      }
    })

    let maxHeadOverlap = 0
    let maxBodyOverlapFraction = 0
    let maxCenterZoneIntrusion = 0

    // 1. Center text zone check (26vw to 74vw: 0vw at title band y:28-46vh, <=4vw elsewhere)
    const centerLeft = 0.26 * vw
    const centerRight = 0.74 * vw
    const titleBandTop = 0.28 * vh
    const titleBandBottom = 0.46 * vh

    computedBoxes.forEach(({ slotId, charName, figBox }) => {
      const figRight = figBox.x + figBox.w
      const figBottom = figBox.y + figBox.h
      const xOverlap = Math.max(0, Math.min(figRight, centerRight) - Math.max(figBox.x, centerLeft))
      if (xOverlap > 0) {
        const inTitleBand = Math.max(0, Math.min(figBottom, titleBandBottom) - Math.max(figBox.y, titleBandTop)) > 0
        const intrusionVw = (xOverlap / vw) * 100
        if (inTitleBand && intrusionVw > 0) {
          maxCenterZoneIntrusion = Math.max(maxCenterZoneIntrusion, intrusionVw)
          console.warn(`[Hero Center Intrusion] ${slotId} (${charName}) entered title band center zone by ${intrusionVw.toFixed(2)}vw!`)
        } else if (!inTitleBand && intrusionVw > 4) {
          maxCenterZoneIntrusion = Math.max(maxCenterZoneIntrusion, intrusionVw - 4)
          console.warn(`[Hero Center Intrusion] ${slotId} (${charName}) entered center zone by ${intrusionVw.toFixed(2)}vw (>4vw allowed)!`)
        }
      }
    })

    // 2. Head Box & Body Overlap Check across all pairs
    for (let i = 0; i < computedBoxes.length; i++) {
      for (let j = 0; j < computedBoxes.length; j++) {
        if (i === j) continue
        const a = computedBoxes[i]
        const b = computedBoxes[j]

        // Check if figure A overlaps figure B's head box
        const hOverlapX = Math.max(0, Math.min(a.figBox.x + a.figBox.w, b.headBox.x + b.headBox.w) - Math.max(a.figBox.x, b.headBox.x))
        const hOverlapY = Math.max(0, Math.min(a.figBox.y + a.figBox.h, b.headBox.y + b.headBox.h) - Math.max(a.figBox.y, b.headBox.y))
        const headOverlapArea = hOverlapX * hOverlapY
        if (headOverlapArea > 0) {
          maxHeadOverlap = Math.max(maxHeadOverlap, headOverlapArea)
          console.warn(`[Hero Head Collision] ${a.slotId} (${a.charName}) covers head box of ${b.slotId} (${b.charName}) by ${headOverlapArea.toFixed(1)} px²!`)
        }

        // Check Body Overlap: FRONT over BACK
        if (a.role === 'front' && b.role === 'back' && a.side === b.side) {
          const bodyOverlapX = Math.max(0, Math.min(a.figBox.x + a.figBox.w, b.figBox.x + b.figBox.w) - Math.max(a.figBox.x, b.figBox.x))
          const fraction = bodyOverlapX / b.figBox.w
          maxBodyOverlapFraction = Math.max(maxBodyOverlapFraction, fraction)
          if (fraction > activeLayout.maxBodyOverlap) {
            console.warn(`[Hero Body Overlap] ${a.slotId} over ${b.slotId} exceeds limit: ${(fraction * 100).toFixed(1)}% > ${(activeLayout.maxBodyOverlap * 100).toFixed(1)}%`)
          }
        }
      }
    }

    setDebugMetrics({
      figureBoxes: computedBoxes,
      maxHeadOverlap,
      maxBodyOverlapFraction,
      maxCenterZoneIntrusion,
    })
  }, [activeSlots, activeLayout])

  useEffect(() => {
    runSelfCheck()
    window.addEventListener('resize', runSelfCheck)
    return () => window.removeEventListener('resize', runSelfCheck)
  }, [runSelfCheck])

  // 4. Mouse parallax clamped to <= 6px
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    activeSlots.forEach(({ slot }) => {
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

      activeSlots.forEach(({ slot }) => {
        const q = quickToMap.current[slot.id]
        if (!q) return
        const rawX = nx * (slot.side === 'left' ? -6 : 6) * slot.depth
        const rawY = ny * -6 * slot.depth
        // Strictly clamp parallax within [-6px, 6px]
        const clampedX = Math.max(-6, Math.min(6, rawX))
        const clampedY = Math.max(-6, Math.min(6, rawY))
        q.x(clampedX)
        q.y(clampedY)
      })
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [activeSlots])

  // 5. Scroll animations: outward drift and fade
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !ready) return

    const ctx = gsap.context(() => {
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

      {/* ── WING WALL: LEFT WING SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={leftGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'left')
            .map(({ slot, state, adjustedX, adjustedScale }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive slot visibility:
              // - Busts: hidden below 1280px (hidden xl:block)
              // - Back: hidden below 1024px (hidden lg:block)
              // - Front: desktop 60vh, tablet 50vh, mobile 36vh corner
              let responsiveClass = ''
              if (slot.role.startsWith('bust')) {
                responsiveClass = 'hidden xl:block'
              } else if (slot.role === 'back') {
                responsiveClass = 'hidden lg:block lg:max-xl:!h-[44vh] lg:max-xl:!top-auto lg:max-xl:!bottom-0'
              } else if (slot.role === 'front') {
                responsiveClass = 'block max-lg:!top-auto max-lg:!bottom-0 max-lg:!left-0 max-lg:!w-[34vw] max-lg:!max-w-[190px] max-lg:!h-[36vh] lg:max-xl:!h-[50vh] lg:max-xl:!top-auto lg:max-xl:!bottom-0'
              }

              const isBust = slot.role.startsWith('bust')

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`absolute pointer-events-none hero-float-anim overflow-hidden ${responsiveClass}`}
                  style={{
                    left: `${adjustedX}vw`,
                    top: `${slot.yVh}vh`,
                    width: `${slot.wVw}vw`,
                    height: `${slot.hVh}vh`,
                    zIndex: slot.zIndex,
                    animationDuration: `${slot.floatDuration}s`,
                    animationDelay: `${slot.floatDelay}s`,
                  }}
                >
                  {/* Subtle character glow sprite */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${char.accentColor}25 0%, transparent 70%)`,
                      opacity: state.isFading ? 0 : slot.baseOpacity * 0.7,
                      transform: 'scale(1.15)',
                      transition: 'opacity 1.2s ease-in-out',
                    }}
                  />

                  {/* Current Character */}
                  <img
                    src={char.trimmedSrc}
                    alt=""
                    width={char.trimW}
                    height={char.trimH}
                    decoding="async"
                    loading="eager"
                    className={`${isBust ? 'hero-silhouette-img-bust' : 'hero-silhouette-img'} hero-slot-char w-full h-full`}
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      transform: `scale(${adjustedScale})`,
                      transformOrigin: slot.anchor === 'top' ? 'top center' : 'bottom center',
                      filter: `brightness(${char.brightnessMultiplier * slot.brightnessFactor})`,
                    }}
                  />

                  {/* Incoming Character for crossfade */}
                  {incoming && (
                    <img
                      src={incoming.trimmedSrc}
                      alt=""
                      width={incoming.trimW}
                      height={incoming.trimH}
                      decoding="async"
                      loading="lazy"
                      className={`${isBust ? 'hero-silhouette-img-bust' : 'hero-silhouette-img'} hero-slot-char absolute inset-0 w-full h-full`}
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        transform: `scale(${adjustedScale})`,
                        transformOrigin: slot.anchor === 'top' ? 'top center' : 'bottom center',
                        filter: `brightness(${incoming.brightnessMultiplier * slot.brightnessFactor})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── WING WALL: RIGHT WING SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={rightGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'right')
            .map(({ slot, state, adjustedX, adjustedScale }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive slot visibility:
              // - Busts: hidden below 1280px (hidden xl:block)
              // - Back: hidden below 1024px (hidden lg:block)
              // - Front: desktop 60vh, tablet 50vh, mobile 36vh corner
              let responsiveClass = ''
              if (slot.role.startsWith('bust')) {
                responsiveClass = 'hidden xl:block'
              } else if (slot.role === 'back') {
                responsiveClass = 'hidden lg:block lg:max-xl:!h-[44vh] lg:max-xl:!top-auto lg:max-xl:!bottom-0'
              } else if (slot.role === 'front') {
                responsiveClass = 'block max-lg:!top-auto max-lg:!bottom-0 max-lg:!right-0 max-lg:!left-auto max-lg:!w-[34vw] max-lg:!max-w-[190px] max-lg:!h-[36vh] lg:max-xl:!h-[50vh] lg:max-xl:!top-auto lg:max-xl:!bottom-0'
              }

              const isBust = slot.role.startsWith('bust')

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`absolute pointer-events-none hero-float-anim overflow-hidden ${responsiveClass}`}
                  style={{
                    left: `${adjustedX}vw`,
                    top: `${slot.yVh}vh`,
                    width: `${slot.wVw}vw`,
                    height: `${slot.hVh}vh`,
                    zIndex: slot.zIndex,
                    animationDuration: `${slot.floatDuration}s`,
                    animationDelay: `${slot.floatDelay}s`,
                  }}
                >
                  {/* Subtle character glow sprite */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${char.accentColor}25 0%, transparent 70%)`,
                      opacity: state.isFading ? 0 : slot.baseOpacity * 0.7,
                      transform: 'scale(1.15)',
                      transition: 'opacity 1.2s ease-in-out',
                    }}
                  />

                  {/* Current Character */}
                  <img
                    src={char.trimmedSrc}
                    alt=""
                    width={char.trimW}
                    height={char.trimH}
                    decoding="async"
                    loading="eager"
                    className={`${isBust ? 'hero-silhouette-img-bust' : 'hero-silhouette-img'} hero-slot-char w-full h-full`}
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      transform: `scale(${adjustedScale})`,
                      transformOrigin: slot.anchor === 'top' ? 'top center' : 'bottom center',
                      filter: `brightness(${char.brightnessMultiplier * slot.brightnessFactor})`,
                    }}
                  />

                  {/* Incoming Character for crossfade */}
                  {incoming && (
                    <img
                      src={incoming.trimmedSrc}
                      alt=""
                      width={incoming.trimW}
                      height={incoming.trimH}
                      decoding="async"
                      loading="lazy"
                      className={`${isBust ? 'hero-silhouette-img-bust' : 'hero-silhouette-img'} hero-slot-char absolute inset-0 w-full h-full`}
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        transform: `scale(${adjustedScale})`,
                        transformOrigin: slot.anchor === 'top' ? 'top center' : 'bottom center',
                        filter: `brightness(${incoming.brightnessMultiplier * slot.brightnessFactor})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── BOTTOM GRADIENT TO BLACK (12vh) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[12vh] bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-[3]"
        aria-hidden="true"
      />

      {/* ── DEBUG RECTANGLES & METRICS (?debug=1&hero=boxes) ── */}
      {showHeroBoxes && (
        <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
          {/* Center Text Safe Zone (26vw - 74vw) */}
          <div
            className="absolute top-0 bottom-0 border-x border-dashed border-red-500/50 bg-red-500/5 flex flex-col items-center justify-between py-6"
            style={{ left: '26vw', width: '48vw' }}
          >
            <span className="font-mono text-[10px] text-red-400 bg-black/90 px-2 py-0.5 rounded border border-red-500/40">
              CENTER ZONE (26vw — 74vw)
            </span>
            {/* Title Band Highlight (28vh - 46vh) */}
            <div
              className="w-full border-y border-red-500/40 bg-red-500/10 flex items-center justify-center"
              style={{ height: '18vh', marginTop: '28vh' }}
            >
              <span className="font-mono text-[9px] text-red-300 bg-black/80 px-2 py-0.5 rounded">
                TITLE BAND (28-46vh, 0vw INTRUSION)
              </span>
            </div>
            <span className="font-mono text-[9px] text-red-400/80 bg-black/90 px-2 py-0.5 rounded">
              Intrusion: {debugMetrics.maxCenterZoneIntrusion.toFixed(1)}vw
            </span>
          </div>

          {/* Slot, Figure, and Head Boxes */}
          {debugMetrics.figureBoxes.map(({ slotId, charName, slotBox, figBox, headBox, zIndex }) => (
            <div key={slotId}>
              {/* Cyan dashed slot box */}
              <div
                className="absolute border border-dashed border-cyan-400/60 pointer-events-none"
                style={{
                  left: `${slotBox.x}px`,
                  top: `${slotBox.y}px`,
                  width: `${slotBox.w}px`,
                  height: `${slotBox.h}px`,
                }}
              >
                <span className="absolute -top-4 left-0 font-mono text-[8.5px] text-cyan-300 bg-black/90 px-1 rounded whitespace-nowrap">
                  {slotId} (z-{zIndex})
                </span>
              </div>

              {/* Emerald solid figure box */}
              <div
                className="absolute border border-emerald-400 pointer-events-none"
                style={{
                  left: `${figBox.x}px`,
                  top: `${figBox.y}px`,
                  width: `${figBox.w}px`,
                  height: `${figBox.h}px`,
                }}
              >
                <span className="absolute -bottom-4 left-0 font-mono text-[8px] text-emerald-300 bg-black/90 px-1 rounded whitespace-nowrap">
                  {charName} ({Math.round(figBox.w)}x{Math.round(figBox.h)})
                </span>
              </div>

              {/* Amber solid head box (top 35% of trimmed figure) */}
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/15 pointer-events-none"
                style={{
                  left: `${headBox.x}px`,
                  top: `${headBox.y}px`,
                  width: `${headBox.w}px`,
                  height: `${headBox.h}px`,
                }}
              >
                <span className="absolute top-0 right-0 font-mono text-[7.5px] text-amber-200 bg-black/90 px-0.5 rounded whitespace-nowrap">
                  HEAD (35%)
                </span>
              </div>
            </div>
          ))}

          {/* Diagnostics summary HUD banner */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/95 text-emerald-400 font-mono text-[10px] px-4 py-1.5 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-4">
            <span>HEAD OVERLAP: <b className={debugMetrics.maxHeadOverlap === 0 ? 'text-emerald-400' : 'text-red-400'}>{debugMetrics.maxHeadOverlap.toFixed(1)} px²</b></span>
            <span>BODY OVERLAP: <b className={debugMetrics.maxBodyOverlapFraction <= activeLayout.maxBodyOverlap ? 'text-emerald-400' : 'text-amber-400'}>{(debugMetrics.maxBodyOverlapFraction * 100).toFixed(1)}%</b> / {(activeLayout.maxBodyOverlap * 100).toFixed(0)}%</span>
            <span>HEROES: <b>{activeSlots.length}</b></span>
          </div>
        </div>
      )}

      {/* ── CENTERED HERO CONTENT ── */}
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
          The flagship hackathon of {EVENT.hostedBy} returns. 3 specialised tracks. 3 Marvel champions. One multiverse to conquer.
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

// ── 4. Layering Rules Solver (Poster Style) ──
function resolveLayeringRules(
  initialSlots: PlacedSlot[],
  layout: { maxBodyOverlap: number; edgeBleedVw: number }
): PlacedSlot[] {
  const result: PlacedSlot[] = initialSlots.map((s) => ({ ...s }))

  // Mock viewport width/height for resolution (standard 1920x1080)
  const vw = 1920
  const vh = 1080

  function getBoxes(slots: PlacedSlot[]) {
    return slots.map(({ slot, state, adjustedX, adjustedScale }) => {
      const char = state.current
      const slotX = (adjustedX / 100) * vw
      const slotY = (slot.yVh / 100) * vh
      const slotW = (slot.wVw / 100) * vw
      const slotH = (slot.hVh / 100) * vh

      const s = Math.min(slotW / char.trimW, slotH / char.trimH) * adjustedScale
      const figW = char.trimW * s
      const figH = char.trimH * s
      const figX = slotX + (slotW - figW) / 2
      const figY = slot.anchor === 'top' ? slotY : slotY + (slotH - figH)

      return {
        id: slot.id,
        role: slot.role,
        side: slot.side,
        char,
        figBox: { x: figX, y: figY, w: figW, h: figH },
        headBox: { x: figX, y: figY, w: figW, h: figH * 0.35 },
      }
    })
  }

  // Iterate over Left and Right wings to resolve collisions between FRONT and BACK
  for (const side of ['left', 'right'] as const) {
    const frontIdx = result.findIndex((s) => s.slot.side === side && s.slot.role === 'front')
    const backIdx = result.findIndex((s) => s.slot.side === side && s.slot.role === 'back')

    if (frontIdx === -1 || backIdx === -1) continue

    const backSlot = result[backIdx]

    let resolved = false
    const maxOutwardShiftVw = layout.edgeBleedVw

    // Step 1: Shift BACK figure outward in 1vw steps
    for (let shiftStep = 0; shiftStep <= maxOutwardShiftVw; shiftStep++) {
      const shiftDirection = side === 'left' ? -1 : 1
      backSlot.adjustedX = backSlot.slot.xVw + shiftStep * shiftDirection

      // Step 2: If still colliding, shrink in 4% steps (down to 76%)
      for (let shrinkStep = 0; shrinkStep <= 6; shrinkStep++) {
        backSlot.adjustedScale = backSlot.slot.scale * Math.pow(0.96, shrinkStep)

        const boxes = getBoxes(result)
        const bFront = boxes.find((b) => b.id === result[frontIdx].slot.id)!
        const bBack = boxes.find((b) => b.id === backSlot.slot.id)!

        // Check head overlap: Front covering Back's head
        const headOverlapX = Math.max(0, Math.min(bFront.figBox.x + bFront.figBox.w, bBack.headBox.x + bBack.headBox.w) - Math.max(bFront.figBox.x, bBack.headBox.x))
        const headOverlapY = Math.max(0, Math.min(bFront.figBox.y + bFront.figBox.h, bBack.headBox.y + bBack.headBox.h) - Math.max(bFront.figBox.y, bBack.headBox.y))
        const headOverlap = headOverlapX * headOverlapY

        // Check body overlap: Front over Back body
        const bodyOverlapX = Math.max(0, Math.min(bFront.figBox.x + bFront.figBox.w, bBack.figBox.x + bBack.figBox.w) - Math.max(bFront.figBox.x, bBack.figBox.x))
        const bodyOverlapFraction = bodyOverlapX / bBack.figBox.w

        if (headOverlap === 0 && bodyOverlapFraction <= layout.maxBodyOverlap) {
          resolved = true
          break
        }
      }
      if (resolved) break
    }

    // Step 3: If rule fails, drop lowest priority hero from the slot (log it)
    if (!resolved) {
      console.warn(`[Hero Layering] Failed to resolve overlap for ${backSlot.slot.id} (${backSlot.state.current.name}) — dropping hero from slot.`)
      result.splice(backIdx, 1)
    }
  }

  return result
}
