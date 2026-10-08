/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Comic Marvel Multiverse Hero Section — Uniform Bust Crowd Wall:
 * - Small red spaced text: "IIIT NAYA RAIPUR PRESENTS"
 * - Huge "HACK-A-SOL" on ONE line (white-space: nowrap, clamp(3rem, 12vw, 11rem))
 * - "5.0" between two thin horizontal lines
 * - "MARVEL" comic-style title treatment (skewed red slab, halftone dots, offset shadow)
 * - Description: "The flagship hackathon of IIIT Naya Raipur returns. 3 specialised tracks. 3 Marvel champions. One multiverse to conquer."
 * - Two centered magnetic buttons: COMING SOON and BECOME A SPONSOR
 *
 * Uniform Bust Crowd Layout:
 * - Fixed portrait frames (aspect-ratio 3/4).
 * - INNER frames 32vh tall, OUTER frames 28vh tall (size ratio <= 1.15).
 * - object-fit: cover with object-position: (faceX*100)% 0% (alpha-weighted head centroid).
 * - Bottom 40% fades to transparent via mask-image linear-gradient with side edge fade.
 * - Staggered anchor grid (tops 10, 22, 38, 50, 66, 74vh) with margin >= 3vw.
 * - Head box (top 40%) strictly 0 overlap; total frame overlap <= 25%.
 * - Mouse parallax clamped to 4px; outward drift/fade on scroll.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useControls, button } from 'leva'
import { EVENT, HERO_PRIORITY, HERO_MAX_OVERLAP, HERO_LAYOUT } from '../config'
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
  faceX: number
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

// ── 2. Crowd Slot Definitions (Anchor Table) ──
export type ColumnRole = 'inner' | 'outer'
export type RowRole = 'top' | 'mid' | 'low'

export interface CrowdSlotDef {
  id: string
  name: string
  side: 'left' | 'right'
  col: ColumnRole
  row: RowRole
  centerX: number     // center x in vw
  topY: number        // top y in vh
  hVh: number         // height in vh (32 for inner, 28 for outer)
  zIndex: number      // row 1..3, inner in front of outer
  baseOpacity: number // inner: 0.50, outer: 0.40
  depth: number       // parallax multiplier
  floatDuration: number
  floatDelay: number
}

// Desktop anchor table (1920x1080) ordered by FILL ORDER:
// INNER-mid L,R; INNER-top L,R; OUTER-mid L,R; OUTER-top L,R; INNER-low L,R; OUTER-low L,R
export const BASE_CROWD_SLOTS: CrowdSlotDef[] = [
  // 1. INNER-mid L & R (tops 50vh, h: 32vh, center 22vw / 78vw, z: 4)
  {
    id: 'inner-mid-L',
    name: 'Inner Mid Left',
    side: 'left',
    col: 'inner',
    row: 'mid',
    centerX: HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[1],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 4,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.6,
    floatDuration: 7.0,
    floatDelay: 0.2,
  },
  {
    id: 'inner-mid-R',
    name: 'Inner Mid Right',
    side: 'right',
    col: 'inner',
    row: 'mid',
    centerX: 100 - HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[1],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 4,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.6,
    floatDuration: 7.2,
    floatDelay: 0.4,
  },
  // 2. INNER-top L & R (tops 22vh, h: 32vh, center 22vw / 78vw, z: 2)
  {
    id: 'inner-top-L',
    name: 'Inner Top Left',
    side: 'left',
    col: 'inner',
    row: 'top',
    centerX: HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[0],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 2,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.5,
    floatDuration: 7.5,
    floatDelay: 0.6,
  },
  {
    id: 'inner-top-R',
    name: 'Inner Top Right',
    side: 'right',
    col: 'inner',
    row: 'top',
    centerX: 100 - HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[0],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 2,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.5,
    floatDuration: 7.8,
    floatDelay: 0.8,
  },
  // 3. OUTER-mid L & R (tops 38vh, h: 28vh, center 10vw / 90vw, z: 3)
  {
    id: 'outer-mid-L',
    name: 'Outer Mid Left',
    side: 'left',
    col: 'outer',
    row: 'mid',
    centerX: HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[1],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 3,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.4,
    floatDuration: 8.0,
    floatDelay: 1.0,
  },
  {
    id: 'outer-mid-R',
    name: 'Outer Mid Right',
    side: 'right',
    col: 'outer',
    row: 'mid',
    centerX: 100 - HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[1],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 3,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.4,
    floatDuration: 8.2,
    floatDelay: 1.2,
  },
  // 4. OUTER-top L & R (tops 10vh, h: 28vh, center 10vw / 90vw, z: 1)
  {
    id: 'outer-top-L',
    name: 'Outer Top Left',
    side: 'left',
    col: 'outer',
    row: 'top',
    centerX: HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[0],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 1,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.35,
    floatDuration: 8.5,
    floatDelay: 1.4,
  },
  {
    id: 'outer-top-R',
    name: 'Outer Top Right',
    side: 'right',
    col: 'outer',
    row: 'top',
    centerX: 100 - HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[0],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 1,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.35,
    floatDuration: 8.7,
    floatDelay: 1.6,
  },
  // 5. INNER-low L & R (tops 74vh, h: 32vh, center 22vw / 78vw, z: 6)
  {
    id: 'inner-low-L',
    name: 'Inner Low Left',
    side: 'left',
    col: 'inner',
    row: 'low',
    centerX: HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[2],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 6,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.65,
    floatDuration: 7.3,
    floatDelay: 1.8,
  },
  {
    id: 'inner-low-R',
    name: 'Inner Low Right',
    side: 'right',
    col: 'inner',
    row: 'low',
    centerX: 100 - HERO_LAYOUT.innerCenterX,
    topY: HERO_LAYOUT.innerTops[2],
    hVh: HERO_LAYOUT.innerHeightVh,
    zIndex: 6,
    baseOpacity: HERO_LAYOUT.innerOpacity,
    depth: 0.65,
    floatDuration: 7.6,
    floatDelay: 2.0,
  },
  // 6. OUTER-low L & R (tops 66vh, h: 28vh, center 10vw / 90vw, z: 5)
  {
    id: 'outer-low-L',
    name: 'Outer Low Left',
    side: 'left',
    col: 'outer',
    row: 'low',
    centerX: HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[2],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 5,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.45,
    floatDuration: 8.4,
    floatDelay: 2.2,
  },
  {
    id: 'outer-low-R',
    name: 'Outer Low Right',
    side: 'right',
    col: 'outer',
    row: 'low',
    centerX: 100 - HERO_LAYOUT.outerCenterX,
    topY: HERO_LAYOUT.outerTops[2],
    hVh: HERO_LAYOUT.outerHeightVh,
    zIndex: 5,
    baseOpacity: HERO_LAYOUT.outerOpacity,
    depth: 0.45,
    floatDuration: 8.6,
    floatDelay: 2.4,
  },
]

// ── 3. Client Offscreen Canvas Trim, FaceX & Normalize ──
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

        // 3. Compute faceX: alpha-weighted horizontal centroid of top 35% rows of trimmed figure (0..1)
        const headMaxY = minY + Math.floor(trimH * 0.35)
        let sumHeadWeight = 0
        let sumHeadX = 0

        for (let y = minY; y <= headMaxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const idx = (y * w + x) * 4
            const a = data[idx + 3]
            if (a > 16) {
              sumHeadWeight += a
              sumHeadX += (x - minX) * a
            }
          }
        }

        const rawCentroidX = sumHeadWeight > 0 ? (sumHeadX / sumHeadWeight) / trimW : 0.5
        const faceX = Math.min(0.85, Math.max(0.15, rawCentroidX))

        // 4. Auto-normalize brightness (average luminance multiplier between 0.8 and 1.6)
        const avgLum = sumLum / countLum
        const targetLum = 115
        const rawMult = targetLum / Math.max(15, avgLum)
        const brightnessMultiplier = Math.min(1.6, Math.max(0.8, rawMult))

        // 5. Draw trimmed figure to cropped offscreen canvas (zero transparent padding)
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
          faceX,
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

interface PlacedCrowdSlot {
  slot: CrowdSlotDef
  state: SlotState
  adjustedLeftVw: number
  widthVw: number
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
    'Hero Crowd Tuner',
    {
      innerHeightVh: { value: HERO_LAYOUT.innerHeightVh, min: 24, max: 40, step: 1, label: 'Inner H (vh)' },
      outerHeightVh: { value: HERO_LAYOUT.outerHeightVh, min: 20, max: 36, step: 1, label: 'Outer H (vh)' },
      innerCenterX:  { value: HERO_LAYOUT.innerCenterX,  min: 16, max: 28, step: 0.5, label: 'Inner Center X' },
      outerCenterX:  { value: HERO_LAYOUT.outerCenterX,  min: 6,  max: 16, step: 0.5, label: 'Outer Center X' },
      outerTop1:     { value: HERO_LAYOUT.outerTops[0],  min: 6,  max: 20, step: 1, label: 'Outer Top 1 (vh)' },
      outerTop2:     { value: HERO_LAYOUT.outerTops[1],  min: 26, max: 48, step: 1, label: 'Outer Top 2 (vh)' },
      outerTop3:     { value: HERO_LAYOUT.outerTops[2],  min: 54, max: 76, step: 1, label: 'Outer Top 3 (vh)' },
      innerTop1:     { value: HERO_LAYOUT.innerTops[0],  min: 14, max: 32, step: 1, label: 'Inner Top 1 (vh)' },
      innerTop2:     { value: HERO_LAYOUT.innerTops[1],  min: 40, max: 62, step: 1, label: 'Inner Top 2 (vh)' },
      innerTop3:     { value: HERO_LAYOUT.innerTops[2],  min: 64, max: 84, step: 1, label: 'Inner Top 3 (vh)' },
      innerOpacity:  { value: HERO_LAYOUT.innerOpacity,  min: 0.2, max: 0.9, step: 0.05, label: 'Inner Opacity' },
      outerOpacity:  { value: HERO_LAYOUT.outerOpacity,  min: 0.2, max: 0.8, step: 0.05, label: 'Outer Opacity' },
      maxOverlap:    { value: HERO_LAYOUT.maxOverlap,    min: 0.05, max: 0.40, step: 0.01, label: 'Max Overlap' },
      'Copy values': button(() => {
        const out = `export const HERO_LAYOUT = ${JSON.stringify(
          {
            innerHeightVh: tuneValues.innerHeightVh,
            outerHeightVh: tuneValues.outerHeightVh,
            innerCenterX: tuneValues.innerCenterX,
            outerCenterX: tuneValues.outerCenterX,
            outerTops: [tuneValues.outerTop1, tuneValues.outerTop2, tuneValues.outerTop3],
            innerTops: [tuneValues.innerTop1, tuneValues.innerTop2, tuneValues.innerTop3],
            innerOpacity: tuneValues.innerOpacity,
            outerOpacity: tuneValues.outerOpacity,
            maxOverlap: tuneValues.maxOverlap,
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
        innerHeightVh: tuneValues.innerHeightVh,
        outerHeightVh: tuneValues.outerHeightVh,
        innerCenterX: tuneValues.innerCenterX,
        outerCenterX: tuneValues.outerCenterX,
        outerTops: [tuneValues.outerTop1, tuneValues.outerTop2, tuneValues.outerTop3] as [number, number, number],
        innerTops: [tuneValues.innerTop1, tuneValues.innerTop2, tuneValues.innerTop3] as [number, number, number],
        innerOpacity: tuneValues.innerOpacity,
        outerOpacity: tuneValues.outerOpacity,
        maxOverlap: tuneValues.maxOverlap,
      }
    }
    return {
      innerHeightVh: HERO_LAYOUT.innerHeightVh,
      outerHeightVh: HERO_LAYOUT.outerHeightVh,
      innerCenterX: HERO_LAYOUT.innerCenterX,
      outerCenterX: HERO_LAYOUT.outerCenterX,
      outerTops: HERO_LAYOUT.outerTops,
      innerTops: HERO_LAYOUT.innerTops,
      innerOpacity: HERO_LAYOUT.innerOpacity,
      outerOpacity: HERO_LAYOUT.outerOpacity,
      maxOverlap: HERO_MAX_OVERLAP,
    }
  }, [isHeroTune, tuneValues])

  const [activeSlots, setActiveSlots] = useState<PlacedCrowdSlot[]>([])
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

      // Combine: Priority heroes go first into INNER-mid, INNER-top, etc., followed by sorted heroes
      const orderedPool = [...priorityChars, ...normalChars]

      // Fill symmetric pairs only (symmetric pairs = even count)
      const usablePairsCount = Math.floor(orderedPool.length / 2) * 2
      const initialAssigned = orderedPool.slice(0, Math.min(BASE_CROWD_SLOTS.length, usablePairsCount))
      const extras = orderedPool.slice(initialAssigned.length)
      extraRotationQueueRef.current = extras

      // Map to slots in fill order
      const initialPlaced: PlacedCrowdSlot[] = []
      initialAssigned.forEach((char, i) => {
        if (BASE_CROWD_SLOTS[i]) {
          const slot = { ...BASE_CROWD_SLOTS[i] }

          // Apply active layout dimensions & anchors
          const isInner = slot.col === 'inner'
          slot.hVh = isInner ? activeLayout.innerHeightVh : activeLayout.outerHeightVh
          slot.baseOpacity = isInner ? activeLayout.innerOpacity : activeLayout.outerOpacity

          if (isInner) {
            slot.centerX = slot.side === 'left' ? activeLayout.innerCenterX : 100 - activeLayout.innerCenterX
            const rowIndex = slot.row === 'top' ? 0 : slot.row === 'mid' ? 1 : 2
            slot.topY = activeLayout.innerTops[rowIndex]
          } else {
            slot.centerX = slot.side === 'left' ? activeLayout.outerCenterX : 100 - activeLayout.outerCenterX
            const rowIndex = slot.row === 'top' ? 0 : slot.row === 'mid' ? 1 : 2
            slot.topY = activeLayout.outerTops[rowIndex]
          }

          // Compute initial width in vw at aspect-ratio 3/4 (1920x1080)
          // widthPx = hVh * 10.8 * 0.75 = hVh * 8.1; widthVw = (hVh * 8.1) / 19.2 = hVh * 0.421875
          const widthVw = slot.hVh * 0.421875
          const halfWidthVw = widthVw / 2
          const initialLeftVw = slot.centerX - halfWidthVw

          initialPlaced.push({
            slot,
            state: {
              current: char,
              incoming: null,
              isFading: false,
            },
            adjustedLeftVw: initialLeftVw,
            widthVw,
          })
        }
      })

      // ── Layering & Collision Resolution ──
      // Head box = top 40% of frame. Overlap with head box MUST be 0.
      // Total frame overlap between any 2 frames <= activeLayout.maxOverlap (0.25).
      const resolved = resolveCrowdLayering(initialPlaced, activeLayout)
      setActiveSlots(resolved)
    }

    loadAll()
    return () => {
      cancelled = true
    }
  }, [activeLayout])

  // 2. Extras rotation: if more images than slots, rotate extras into OUTER-top slots with 1.2s crossfade every 6s
  useEffect(() => {
    if (extraRotationQueueRef.current.length === 0 || activeSlots.length === 0) return

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const interval = setInterval(() => {
      if (extraRotationQueueRef.current.length === 0) return

      // Find outer-top slot indices
      const outerTopIndices: number[] = []
      activeSlots.forEach((item, idx) => {
        if (item.slot.col === 'outer' && item.slot.row === 'top') outerTopIndices.push(idx)
      })
      if (outerTopIndices.length === 0) return

      const targetIndex = outerTopIndices[rotateSlotCounterRef.current % outerTopIndices.length]
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
    frames: {
      slotId: string
      charName: string
      frameBox: { x: number; y: number; w: number; h: number }
      headBox: { x: number; y: number; w: number; h: number }
      zIndex: number
    }[]
    maxHeadOverlap: number
    maxTotalOverlapFraction: number
    maxCenterZoneIntrusion: number
  }>({ frames: [], maxHeadOverlap: 0, maxTotalOverlapFraction: 0, maxCenterZoneIntrusion: 0 })

  const runSelfCheck = useCallback(() => {
    if (typeof window === 'undefined' || activeSlots.length === 0) return

    const vw = window.innerWidth
    const vh = window.innerHeight

    const computedFrames = activeSlots.map(({ slot, state, adjustedLeftVw, widthVw }) => {
      const char = state.current
      const fX = (adjustedLeftVw / 100) * vw
      const fY = (slot.topY / 100) * vh
      const fW = (widthVw / 100) * vw
      const fH = (slot.hVh / 100) * vh

      // Head box: top 40% of portrait frame
      const headBox = { x: fX, y: fY, w: fW, h: fH * 0.40 }

      return {
        slotId: slot.id,
        charName: char.name,
        zIndex: slot.zIndex,
        frameBox: { x: fX, y: fY, w: fW, h: fH },
        headBox,
      }
    })

    let maxHeadOverlap = 0
    let maxTotalOverlapFraction = 0
    let maxCenterZoneIntrusion = 0

    // Description & Buttons Protected Zone: x: 29-71vw, y: 68-86vh
    const descLeft = 0.29 * vw
    const descRight = 0.71 * vw
    const descTop = 0.68 * vh
    const descBottom = 0.86 * vh

    computedFrames.forEach(({ slotId, charName, frameBox }) => {
      const fRight = frameBox.x + frameBox.w
      const fBottom = frameBox.y + frameBox.h
      const xOverlap = Math.max(0, Math.min(fRight, descRight) - Math.max(frameBox.x, descLeft))
      const yOverlap = Math.max(0, Math.min(fBottom, descBottom) - Math.max(frameBox.y, descTop))
      if (xOverlap > 0 && yOverlap > 0) {
        const intrusionVw = (xOverlap / vw) * 100
        maxCenterZoneIntrusion = Math.max(maxCenterZoneIntrusion, intrusionVw)
        console.warn(`[Hero Zone Conflict] ${slotId} (${charName}) sits behind description/buttons by ${intrusionVw.toFixed(2)}vw!`)
      }
    })

    // Pairwise Head & Total Overlap checks
    for (let i = 0; i < computedFrames.length; i++) {
      for (let j = i + 1; j < computedFrames.length; j++) {
        const a = computedFrames[i]
        const b = computedFrames[j]

        // 1. Head box overlap: does frame A intersect headBox B or frame B intersect headBox A?
        const hOverAtoB_X = Math.max(0, Math.min(a.frameBox.x + a.frameBox.w, b.headBox.x + b.headBox.w) - Math.max(a.frameBox.x, b.headBox.x))
        const hOverAtoB_Y = Math.max(0, Math.min(a.frameBox.y + a.frameBox.h, b.headBox.y + b.headBox.h) - Math.max(a.frameBox.y, b.headBox.y))
        const headArea1 = hOverAtoB_X * hOverAtoB_Y

        const hOverBtoA_X = Math.max(0, Math.min(b.frameBox.x + b.frameBox.w, a.headBox.x + a.headBox.w) - Math.max(b.frameBox.x, a.headBox.x))
        const hOverBtoA_Y = Math.max(0, Math.min(b.frameBox.y + b.frameBox.h, a.headBox.y + a.headBox.y) - Math.max(b.frameBox.y, a.headBox.y))
        const headArea2 = hOverBtoA_X * hOverBtoA_Y

        const pairHeadOverlap = Math.max(headArea1, headArea2)
        if (pairHeadOverlap > 0) {
          maxHeadOverlap = Math.max(maxHeadOverlap, pairHeadOverlap)
          console.warn(`[Hero Head Overlap] Head collision between ${a.slotId} and ${b.slotId}: ${pairHeadOverlap.toFixed(1)} px²!`)
        }

        // 2. Total frame overlap between A and B
        const totOverX = Math.max(0, Math.min(a.frameBox.x + a.frameBox.w, b.frameBox.x + b.frameBox.w) - Math.max(a.frameBox.x, b.frameBox.x))
        const totOverY = Math.max(0, Math.min(a.frameBox.y + a.frameBox.h, b.frameBox.y + b.frameBox.h) - Math.max(a.frameBox.y, b.frameBox.y))
        const totOverlapArea = totOverX * totOverY
        if (totOverlapArea > 0) {
          const smallerArea = Math.min(a.frameBox.w * a.frameBox.h, b.frameBox.w * b.frameBox.h)
          const fraction = totOverlapArea / smallerArea
          maxTotalOverlapFraction = Math.max(maxTotalOverlapFraction, fraction)
          if (fraction > activeLayout.maxOverlap) {
            console.warn(`[Hero Frame Overlap] Overlap between ${a.slotId} and ${b.slotId} is ${(fraction * 100).toFixed(1)}% (max allowed: ${(activeLayout.maxOverlap * 100).toFixed(0)}%)`)
          }
        }
      }
    }

    setDebugMetrics({
      frames: computedFrames,
      maxHeadOverlap,
      maxTotalOverlapFraction,
      maxCenterZoneIntrusion,
    })
  }, [activeSlots, activeLayout])

  useEffect(() => {
    runSelfCheck()
    window.addEventListener('resize', runSelfCheck)
    return () => window.removeEventListener('resize', runSelfCheck)
  }, [runSelfCheck])

  // 4. Mouse parallax clamped to <= 4px
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
        const rawX = nx * (slot.side === 'left' ? -4 : 4) * slot.depth
        const rawY = ny * -4 * slot.depth
        // Strictly clamp parallax within [-4px, 4px]
        const clampedX = Math.max(-4, Math.min(4, rawX))
        const clampedY = Math.max(-4, Math.min(4, rawY))
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

      {/* ── UNIFORM BUST CROWD WALL: LEFT WING SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={leftGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'left')
            .map(({ slot, state, adjustedLeftVw, widthVw }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive classes:
              // - OUTER column: hidden below 1280px (hidden xl:block)
              // - INNER column low row: hidden below 1024px (hidden lg:block)
              // - Under 1024px: 2 per side at top corners, 22vh tall behind title
              let responsiveClass = ''
              if (slot.col === 'outer') {
                responsiveClass = 'hidden xl:block'
              } else if (slot.row === 'low') {
                responsiveClass = 'hidden lg:block'
              } else {
                // inner-top or inner-mid
                responsiveClass = 'block max-lg:!h-[22vh] max-lg:!w-[16.5vh] max-lg:!top-[10vh] max-lg:opacity-30'
              }

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`hero-portrait-frame hero-float-anim ${responsiveClass}`}
                  style={{
                    left: `${adjustedLeftVw}vw`,
                    top: `${slot.topY}vh`,
                    height: `${slot.hVh}vh`,
                    width: `${widthVw}vw`,
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
                      background: `radial-gradient(ellipse 70% 70% at 50% 40%, ${char.accentColor}25 0%, transparent 70%)`,
                      opacity: state.isFading ? 0 : slot.baseOpacity * 0.7,
                      transform: 'scale(1.15)',
                      transition: 'opacity 1.2s ease-in-out',
                    }}
                  />

                  {/* Current Hero Portrait Image */}
                  <img
                    src={char.trimmedSrc}
                    alt=""
                    width={char.trimW}
                    height={char.trimH}
                    decoding="async"
                    loading="eager"
                    className="hero-portrait-img hero-slot-char"
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      objectPosition: `${(char.faceX * 100).toFixed(1)}% 0%`,
                      filter: `brightness(${char.brightnessMultiplier})`,
                    }}
                  />

                  {/* Incoming Hero Portrait Image for crossfade */}
                  {incoming && (
                    <img
                      src={incoming.trimmedSrc}
                      alt=""
                      width={incoming.trimW}
                      height={incoming.trimH}
                      decoding="async"
                      loading="lazy"
                      className="hero-portrait-img hero-slot-char absolute inset-0"
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        objectPosition: `${(incoming.faceX * 100).toFixed(1)}% 0%`,
                        filter: `brightness(${incoming.brightnessMultiplier})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── UNIFORM BUST CROWD WALL: RIGHT WING SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={rightGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'right')
            .map(({ slot, state, adjustedLeftVw, widthVw }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive classes:
              // - OUTER column: hidden below 1280px (hidden xl:block)
              // - INNER column low row: hidden below 1024px (hidden lg:block)
              // - Under 1024px: 2 per side at top corners, 22vh tall behind title
              let responsiveClass = ''
              if (slot.col === 'outer') {
                responsiveClass = 'hidden xl:block'
              } else if (slot.row === 'low') {
                responsiveClass = 'hidden lg:block'
              } else {
                // inner-top or inner-mid
                responsiveClass = 'block max-lg:!h-[22vh] max-lg:!w-[16.5vh] max-lg:!top-[10vh] max-lg:opacity-30'
              }

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`hero-portrait-frame hero-float-anim ${responsiveClass}`}
                  style={{
                    left: `${adjustedLeftVw}vw`,
                    top: `${slot.topY}vh`,
                    height: `${slot.hVh}vh`,
                    width: `${widthVw}vw`,
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
                      background: `radial-gradient(ellipse 70% 70% at 50% 40%, ${char.accentColor}25 0%, transparent 70%)`,
                      opacity: state.isFading ? 0 : slot.baseOpacity * 0.7,
                      transform: 'scale(1.15)',
                      transition: 'opacity 1.2s ease-in-out',
                    }}
                  />

                  {/* Current Hero Portrait Image */}
                  <img
                    src={char.trimmedSrc}
                    alt=""
                    width={char.trimW}
                    height={char.trimH}
                    decoding="async"
                    loading="eager"
                    className="hero-portrait-img hero-slot-char"
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      objectPosition: `${(char.faceX * 100).toFixed(1)}% 0%`,
                      filter: `brightness(${char.brightnessMultiplier})`,
                    }}
                  />

                  {/* Incoming Hero Portrait Image for crossfade */}
                  {incoming && (
                    <img
                      src={incoming.trimmedSrc}
                      alt=""
                      width={incoming.trimW}
                      height={incoming.trimH}
                      decoding="async"
                      loading="lazy"
                      className="hero-portrait-img hero-slot-char absolute inset-0"
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        objectPosition: `${(incoming.faceX * 100).toFixed(1)}% 0%`,
                        filter: `brightness(${incoming.brightnessMultiplier})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── BOTTOM GRADIENT TO BLACK (10vh) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[10vh] bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-[8]"
        aria-hidden="true"
      />

      {/* ── DEBUG RECTANGLES & METRICS (?debug=1&hero=boxes) ── */}
      {showHeroBoxes && (
        <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
          {/* Description & Buttons Protected Zone (29vw - 71vw, 68vh - 86vh) */}
          <div
            className="absolute border border-dashed border-red-500/60 bg-red-500/10 flex flex-col items-center justify-center p-2"
            style={{ left: '29vw', width: '42vw', top: '68vh', height: '18vh' }}
          >
            <span className="font-mono text-[9px] text-red-300 bg-black/90 px-2 py-0.5 rounded border border-red-500/40">
              PROTECTED ZONE (Desc & Buttons: 29-71vw, 68-86vh)
            </span>
          </div>

          {/* Frames and Head Boxes */}
          {debugMetrics.frames.map(({ slotId, charName, frameBox, headBox, zIndex }) => (
            <div key={slotId}>
              {/* Cyan dashed frame outline */}
              <div
                className="absolute border border-dashed border-cyan-400/60 pointer-events-none"
                style={{
                  left: `${frameBox.x}px`,
                  top: `${frameBox.y}px`,
                  width: `${frameBox.w}px`,
                  height: `${frameBox.h}px`,
                }}
              >
                <span className="absolute -top-4 left-0 font-mono text-[8px] text-cyan-300 bg-black/90 px-1 rounded whitespace-nowrap">
                  {slotId} (z-{zIndex}) {charName}
                </span>
              </div>

              {/* Amber solid head box (top 40% of portrait frame) */}
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none"
                style={{
                  left: `${headBox.x}px`,
                  top: `${headBox.y}px`,
                  width: `${headBox.w}px`,
                  height: `${headBox.h}px`,
                }}
              >
                <span className="absolute top-0 right-0 font-mono text-[7px] text-amber-200 bg-black/90 px-0.5 rounded whitespace-nowrap">
                  HEAD (40%)
                </span>
              </div>
            </div>
          ))}

          {/* Diagnostics summary HUD banner */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/95 text-emerald-400 font-mono text-[10px] px-4 py-1.5 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-4">
            <span>HEAD OVERLAP: <b className={debugMetrics.maxHeadOverlap === 0 ? 'text-emerald-400' : 'text-red-400'}>{debugMetrics.maxHeadOverlap.toFixed(1)} px²</b></span>
            <span>FRAME OVERLAP: <b className={debugMetrics.maxTotalOverlapFraction <= activeLayout.maxOverlap ? 'text-emerald-400' : 'text-amber-400'}>{(debugMetrics.maxTotalOverlapFraction * 100).toFixed(1)}%</b> / {(activeLayout.maxOverlap * 100).toFixed(0)}%</span>
            <span>FRAMES: <b>{activeSlots.length}</b></span>
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

// ── 4. Layering Rules Solver (Uniform Crowd Poster Style) ──
function resolveCrowdLayering(
  initialSlots: PlacedCrowdSlot[],
  layout: { maxOverlap: number }
): PlacedCrowdSlot[] {
  const result: PlacedCrowdSlot[] = initialSlots.map((s) => ({ ...s }))

  const vw = 1920
  const vh = 1080

  // Minimum margin from screen edge: 3vw
  const minMarginVw = 3

  // Description / buttons protected zone: x 29-71vw, y 68-86vh
  const descLeft = 0.29 * vw
  const descRight = 0.71 * vw
  const descTop = 0.68 * vh
  const descBottom = 0.86 * vh

  function getComputed(slots: PlacedCrowdSlot[]) {
    return slots.map(({ slot, state, adjustedLeftVw, widthVw }) => {
      const fX = (adjustedLeftVw / 100) * vw
      const fY = (slot.topY / 100) * vh
      const fW = (widthVw / 100) * vw
      const fH = (slot.hVh / 100) * vh
      const headBox = { x: fX, y: fY, w: fW, h: fH * 0.40 }
      return {
        id: slot.id,
        side: slot.side,
        char: state.current,
        frameBox: { x: fX, y: fY, w: fW, h: fH },
        headBox,
      }
    })
  }

  // Iterate to resolve any head overlap, total overlap > 25%, or intrusion into description/buttons
  for (let i = result.length - 1; i >= 0; i--) {
    const placed = result[i]
    let resolved = false

    // Try shifting outward in 0.5vw steps (up to 8 steps = 4vw)
    for (let step = 0; step <= 8; step++) {
      const shiftDirection = placed.slot.side === 'left' ? -1 : 1
      const testLeftVw = (placed.slot.centerX + step * 0.5 * shiftDirection) - (placed.widthVw / 2)

      // Respect screen margin >= 3vw
      if (placed.slot.side === 'left' && testLeftVw < minMarginVw) break
      if (placed.slot.side === 'right' && (testLeftVw + placed.widthVw) > (100 - minMarginVw)) break

      placed.adjustedLeftVw = testLeftVw

      const computed = getComputed(result)
      const currentBox = computed.find((c) => c.id === placed.slot.id)!

      // 1. Check description/buttons collision
      const fRight = currentBox.frameBox.x + currentBox.frameBox.w
      const fBottom = currentBox.frameBox.y + currentBox.frameBox.h
      const dX = Math.max(0, Math.min(fRight, descRight) - Math.max(currentBox.frameBox.x, descLeft))
      const dY = Math.max(0, Math.min(fBottom, descBottom) - Math.max(currentBox.frameBox.y, descTop))
      if (dX > 0 && dY > 0) continue // still colliding with description/buttons

      // 2. Check head overlap & frame overlap with all other placed slots
      let hasHeadConflict = false
      let hasFrameConflict = false

      for (let j = 0; j < computed.length; j++) {
        if (computed[j].id === placed.slot.id) continue
        const other = computed[j]

        // Head box A with frame B or Head box B with frame A
        const h1_X = Math.max(0, Math.min(currentBox.frameBox.x + currentBox.frameBox.w, other.headBox.x + other.headBox.w) - Math.max(currentBox.frameBox.x, other.headBox.x))
        const h1_Y = Math.max(0, Math.min(currentBox.frameBox.y + currentBox.frameBox.h, other.headBox.y + other.headBox.h) - Math.max(currentBox.frameBox.y, other.headBox.y))
        if (h1_X * h1_Y > 0) {
          hasHeadConflict = true
          break
        }

        const h2_X = Math.max(0, Math.min(other.frameBox.x + other.frameBox.w, currentBox.headBox.x + currentBox.headBox.w) - Math.max(other.frameBox.x, currentBox.headBox.x))
        const h2_Y = Math.max(0, Math.min(other.frameBox.y + other.frameBox.h, currentBox.headBox.y + currentBox.headBox.h) - Math.max(other.frameBox.y, currentBox.headBox.y))
        if (h2_X * h2_Y > 0) {
          hasHeadConflict = true
          break
        }

        // Total frame overlap <= layout.maxOverlap (0.25)
        const tX = Math.max(0, Math.min(currentBox.frameBox.x + currentBox.frameBox.w, other.frameBox.x + other.frameBox.w) - Math.max(currentBox.frameBox.x, other.frameBox.x))
        const tY = Math.max(0, Math.min(currentBox.frameBox.y + currentBox.frameBox.h, other.frameBox.y + other.frameBox.h) - Math.max(currentBox.frameBox.y, other.frameBox.y))
        const totArea = tX * tY
        if (totArea > 0) {
          const smaller = Math.min(currentBox.frameBox.w * currentBox.frameBox.h, other.frameBox.w * other.frameBox.h)
          if (totArea / smaller > layout.maxOverlap) {
            hasFrameConflict = true
            break
          }
        }
      }

      if (!hasHeadConflict && !hasFrameConflict) {
        resolved = true
        break
      }
    }

    if (!resolved) {
      console.warn(`[Hero Crowd Layering] Overlap rule failed for ${placed.slot.id} (${placed.state.current.name}) — dropping hero.`)
      result.splice(i, 1)
    }
  }

  return result
}
