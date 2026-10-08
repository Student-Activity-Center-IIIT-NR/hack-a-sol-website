/**
 * src/sections/Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centered Comic Marvel Multiverse Hero Section:
 * - Small red spaced text: "IIIT NAYA RAIPUR PRESENTS"
 * - Huge "HACK-A-SOL" on ONE line (white-space: nowrap, clamp(3rem, 12vw, 11rem))
 * - "5.0" between two thin horizontal lines
 * - "MARVEL" comic-style title treatment (skewed red slab, halftone dots, offset shadow)
 * - Description: "The flagship hackathon of IIIT Naya Raipur returns. 3 specialised tracks. 3 Marvel champions. One multiverse to conquer."
 * - Two centered magnetic buttons: COMING SOON and BECOME A SPONSOR
 * - Background: Honeycomb wall of character silhouettes flanking left and right,
 *   strictly outside the 24vw-76vw center no-go zone, zero overlap, bottom-center contained.
 * - Mouse parallax & float clamped to <= 6px. Outward drift/fade on scroll.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { EVENT, HERO_PRIORITY } from '../config'
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

// ── 2. Honeycomb Slot Grid Definition (10 Slots Total) ──
export interface HoneycombSlotDef {
  id: string
  name: string
  side: 'left' | 'right'
  columnType: 'outer' | 'inner'
  isInner: boolean
  xVw: number // Left coordinate in vw (0..100)
  yVh: number // Top coordinate in vh (0..100)
  wVw: number // Width in vw
  hVh: number // Height in vh
  depth: number // Parallax multiplier
  scale: number // Depth look
  baseOpacity: number // Depth look
  brightnessFactor: number // Depth look
  floatDuration: number
  floatDelay: number
}

// Mirrored Honeycomb Grid with strict positive gaps and center no-go zone (24vw - 76vw)
export const HONEYCOMB_SLOTS: HoneycombSlotDef[] = [
  // Outer Column Left (x: 2vw - 12vw, w: 10vw)
  {
    id: 'outer-L1',
    name: 'Outer L1',
    side: 'left',
    columnType: 'outer',
    isInner: false,
    xVw: 2,
    yVh: 8,
    wVw: 10,
    hVh: 27,
    depth: 0.35,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 7.2,
    floatDelay: 0.4,
  },
  // Outer Column Right (x: 88vw - 98vw, w: 10vw)
  {
    id: 'outer-R1',
    name: 'Outer R1',
    side: 'right',
    columnType: 'outer',
    isInner: false,
    xVw: 88,
    yVh: 8,
    wVw: 10,
    hVh: 27,
    depth: 0.35,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 7.5,
    floatDelay: 0.6,
  },
  {
    id: 'outer-L2',
    name: 'Outer L2',
    side: 'left',
    columnType: 'outer',
    isInner: false,
    xVw: 2,
    yVh: 37,
    wVw: 10,
    hVh: 27,
    depth: 0.40,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 8.0,
    floatDelay: 1.1,
  },
  {
    id: 'outer-R2',
    name: 'Outer R2',
    side: 'right',
    columnType: 'outer',
    isInner: false,
    xVw: 88,
    yVh: 37,
    wVw: 10,
    hVh: 27,
    depth: 0.40,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 8.3,
    floatDelay: 1.3,
  },
  {
    id: 'outer-L3',
    name: 'Outer L3',
    side: 'left',
    columnType: 'outer',
    isInner: false,
    xVw: 2,
    yVh: 66,
    wVw: 10,
    hVh: 27,
    depth: 0.45,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 7.8,
    floatDelay: 1.7,
  },
  {
    id: 'outer-R3',
    name: 'Outer R3',
    side: 'right',
    columnType: 'outer',
    isInner: false,
    xVw: 88,
    yVh: 66,
    wVw: 10,
    hVh: 27,
    depth: 0.45,
    scale: 0.92,
    baseOpacity: 0.40,
    brightnessFactor: 0.85,
    floatDuration: 8.1,
    floatDelay: 1.9,
  },
  // Inner Column Left (x: 13vw - 23vw, w: 10vw) - shifted half row
  {
    id: 'inner-L1',
    name: 'Inner L1',
    side: 'left',
    columnType: 'inner',
    isInner: true,
    xVw: 13,
    yVh: 22,
    wVw: 10,
    hVh: 27,
    depth: 0.55,
    scale: 1.0,
    baseOpacity: 0.50,
    brightnessFactor: 1.0,
    floatDuration: 7.0,
    floatDelay: 0.2,
  },
  // Inner Column Right (x: 77vw - 87vw, w: 10vw) - shifted half row
  {
    id: 'inner-R1',
    name: 'Inner R1',
    side: 'right',
    columnType: 'inner',
    isInner: true,
    xVw: 77,
    yVh: 22,
    wVw: 10,
    hVh: 27,
    depth: 0.55,
    scale: 1.0,
    baseOpacity: 0.50,
    brightnessFactor: 1.0,
    floatDuration: 7.3,
    floatDelay: 0.5,
  },
  {
    id: 'inner-L2',
    name: 'Inner L2',
    side: 'left',
    columnType: 'inner',
    isInner: true,
    xVw: 13,
    yVh: 51,
    wVw: 10,
    hVh: 27,
    depth: 0.50,
    scale: 1.0,
    baseOpacity: 0.50,
    brightnessFactor: 1.0,
    floatDuration: 8.4,
    floatDelay: 0.8,
  },
  {
    id: 'inner-R2',
    name: 'Inner R2',
    side: 'right',
    columnType: 'inner',
    isInner: true,
    xVw: 77,
    yVh: 51,
    wVw: 10,
    hVh: 27,
    depth: 0.50,
    scale: 1.0,
    baseOpacity: 0.50,
    brightnessFactor: 1.0,
    floatDuration: 8.6,
    floatDelay: 1.0,
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

  // Check URL query params for ?debug=1&hero=boxes
  const [showHeroBoxes, setShowHeroBoxes] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search
      setShowHeroBoxes(search.includes('hero=boxes'))
    }
  }, [])

  const [activeSlots, setActiveSlots] = useState<{ slot: HoneycombSlotDef; state: SlotState }[]>([])
  const extraRotationQueueRef = useRef<ProcessedCharacter[]>([])
  const rotateSlotCounterRef = useRef(0)

  // 1. Process candidate images on mount
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

      // Combine with priority characters placed first in inner columns if available
      const orderedPool = [...priorityChars, ...normalChars]

      // Keep both sides symmetric: if usable count is odd, reserve last one for rotation pool
      const usableCount = orderedPool.length % 2 === 0 ? orderedPool.length : orderedPool.length - 1
      const initialAssigned = orderedPool.slice(0, Math.min(HONEYCOMB_SLOTS.length, usableCount))
      const extras = orderedPool.slice(initialAssigned.length)
      extraRotationQueueRef.current = extras

      // Map to slots in standard fill order: outer L1, R1, L2, R2, L3, R3, then inner L1, R1, L2, R2
      const slotList: { slot: HoneycombSlotDef; state: SlotState }[] = []
      initialAssigned.forEach((char, i) => {
        if (HONEYCOMB_SLOTS[i]) {
          slotList.push({
            slot: HONEYCOMB_SLOTS[i],
            state: {
              current: char,
              incoming: null,
              isFading: false,
            },
          })
        }
      })

      setActiveSlots(slotList)
    }

    loadAll()
    return () => {
      cancelled = true
    }
  }, [])

  // 2. Extras rotation: rotate extras into OUTER slots with 1.2s crossfade every ~7s
  useEffect(() => {
    if (extraRotationQueueRef.current.length === 0 || activeSlots.length === 0) return

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const interval = setInterval(() => {
      if (extraRotationQueueRef.current.length === 0) return

      // Find outer slot indices
      const outerIndices: number[] = []
      activeSlots.forEach((item, idx) => {
        if (!item.slot.isInner) outerIndices.push(idx)
      })
      if (outerIndices.length === 0) return

      const targetOuterIndex = outerIndices[rotateSlotCounterRef.current % outerIndices.length]
      rotateSlotCounterRef.current++

      const incomingCandidate = extraRotationQueueRef.current.shift()
      if (!incomingCandidate) return

      setActiveSlots((prev) => {
        const next = [...prev]
        if (next[targetOuterIndex]) {
          next[targetOuterIndex] = {
            ...next[targetOuterIndex],
            state: {
              ...next[targetOuterIndex].state,
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
          if (next[targetOuterIndex] && next[targetOuterIndex].state.incoming) {
            const oldCurrent = next[targetOuterIndex].state.current
            // Return old character to rotation pool
            extraRotationQueueRef.current.push(oldCurrent)

            next[targetOuterIndex] = {
              ...next[targetOuterIndex],
              state: {
                current: next[targetOuterIndex].state.incoming!,
                incoming: null,
                isFading: false,
              },
            }
          }
          return next
        })
      }, 1200)
    }, 7000)

    return () => clearInterval(interval)
  }, [activeSlots])

  // 3. Overlap check & debug self-check calculation
  const [debugMetrics, setDebugMetrics] = useState<{
    figureBoxes: { slotId: string; charName: string; slotBox: { x: number; y: number; w: number; h: number }; figBox: { x: number; y: number; w: number; h: number } }[]
    maxPairwiseOverlap: number
    maxNoGoOverlap: number
  }>({ figureBoxes: [], maxPairwiseOverlap: 0, maxNoGoOverlap: 0 })

  const runSelfCheck = useCallback(() => {
    if (typeof window === 'undefined' || activeSlots.length === 0) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const noGoLeft = 0.24 * vw
    const noGoRight = 0.76 * vw

    let maxNoGoOverlap = 0
    let maxPairwiseOverlap = 0

    const computedBoxes = activeSlots.map(({ slot, state }) => {
      const char = state.current
      const slotX = (slot.xVw / 100) * vw
      const slotY = (slot.yVh / 100) * vh
      const slotW = (slot.wVw / 100) * vw
      const slotH = (slot.hVh / 100) * vh

      // Scale to fit ("contain") inside slot box aligned bottom-center
      const s = Math.min(slotW / char.trimW, slotH / char.trimH) * slot.scale
      const figW = char.trimW * s
      const figH = char.trimH * s
      const figX = slotX + (slotW - figW) / 2
      const figY = slotY + (slotH - figH) // aligned bottom-center

      return {
        slotId: slot.id,
        charName: char.name,
        slotBox: { x: slotX, y: slotY, w: slotW, h: slotH },
        figBox: { x: figX, y: figY, w: figW, h: figH },
      }
    })

    // 1. Center no-go zone intersection
    computedBoxes.forEach(({ slotId, charName, figBox }) => {
      const right = figBox.x + figBox.w
      const bottom = figBox.y + figBox.h
      const xOverlap = Math.max(0, Math.min(right, noGoRight) - Math.max(figBox.x, noGoLeft))
      const yOverlap = Math.max(0, Math.min(bottom, vh) - Math.max(figBox.y, 0))
      const area = xOverlap * yOverlap
      if (area > 0) {
        maxNoGoOverlap = Math.max(maxNoGoOverlap, area)
        console.warn(`[Hero Overlap Check] ${slotId} (${charName}) intersects center no-go zone by ${area.toFixed(1)} px²!`)
      }
    })

    // 2. Pairwise overlaps between figures
    for (let i = 0; i < computedBoxes.length; i++) {
      for (let j = i + 1; j < computedBoxes.length; j++) {
        const a = computedBoxes[i].figBox
        const b = computedBoxes[j].figBox
        const aRight = a.x + a.w
        const aBottom = a.y + a.h
        const bRight = b.x + b.w
        const bBottom = b.y + b.h

        const xOverlap = Math.max(0, Math.min(aRight, bRight) - Math.max(a.x, b.x))
        const yOverlap = Math.max(0, Math.min(aBottom, bBottom) - Math.max(a.y, b.y))
        const area = xOverlap * yOverlap
        if (area > 0) {
          maxPairwiseOverlap = Math.max(maxPairwiseOverlap, area)
          console.warn(
            `[Hero Overlap Check] Overlap between ${computedBoxes[i].slotId} (${computedBoxes[i].charName}) and ${computedBoxes[j].slotId} (${computedBoxes[j].charName}): ${area.toFixed(1)} px²!`
          )
        }
      }
    }

    if (maxPairwiseOverlap === 0 && maxNoGoOverlap === 0) {
      console.log(
        `[Hero Overlap Check] SUCCESS: Pairwise Overlap = 0 px², Center No-Go Overlap = 0 px² across ${computedBoxes.length} characters.`
      )
    }

    setDebugMetrics({
      figureBoxes: computedBoxes,
      maxPairwiseOverlap,
      maxNoGoOverlap,
    })
  }, [activeSlots])

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

      {/* ── HONEYCOMB WALL: LEFT SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={leftGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'left')
            .map(({ slot, state }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive slot visibility:
              // - inner columns: >= 1280px (hidden xl:block)
              // - outer-L1, outer-L2: >= 1024px (hidden lg:block)
              // - outer-L3: mobile bottom-left corner (<1024px) or desktop slot (>=1024px)
              let responsiveClass = 'hidden xl:block'
              if (!slot.isInner) {
                if (slot.id === 'outer-L3') {
                  responsiveClass = 'block max-lg:!top-auto max-lg:!bottom-[2vh] max-lg:!left-[2vw] max-lg:!w-[28vw] max-lg:!max-w-[140px] max-lg:!h-[20vh]'
                } else {
                  responsiveClass = 'hidden lg:block'
                }
              }

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`absolute pointer-events-none hero-float-anim overflow-hidden ${responsiveClass}`}
                  style={{
                    left: `${slot.xVw}vw`,
                    top: `${slot.yVh}vh`,
                    width: `${slot.wVw}vw`,
                    height: `${slot.hVh}vh`,
                    animationDuration: `${slot.floatDuration}s`,
                    animationDelay: `${slot.floatDelay}s`,
                  }}
                >
                  {/* Subtle character glow sprite */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${char.accentColor}30 0%, transparent 70%)`,
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
                    className="hero-silhouette-img hero-slot-char w-full h-full"
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      transform: `scale(${slot.scale})`,
                      transformOrigin: 'bottom center',
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
                      className="hero-silhouette-img hero-slot-char absolute inset-0 w-full h-full"
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        transform: `scale(${slot.scale})`,
                        transformOrigin: 'bottom center',
                        filter: `brightness(${incoming.brightnessMultiplier * slot.brightnessFactor})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── HONEYCOMB WALL: RIGHT SLOTS ── */}
      {silhouettesEnabled && (
        <div ref={rightGroupRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          {activeSlots
            .filter(({ slot }) => slot.side === 'right')
            .map(({ slot, state }) => {
              const char = state.current
              const incoming = state.incoming

              // Responsive slot visibility:
              // - inner columns: >= 1280px (hidden xl:block)
              // - outer-R1, outer-R2: >= 1024px (hidden lg:block)
              // - outer-R3: mobile bottom-right corner (<1024px) or desktop slot (>=1024px)
              let responsiveClass = 'hidden xl:block'
              if (!slot.isInner) {
                if (slot.id === 'outer-R3') {
                  responsiveClass = 'block max-lg:!top-auto max-lg:!bottom-[2vh] max-lg:!right-[2vw] max-lg:!left-auto max-lg:!w-[28vw] max-lg:!max-w-[140px] max-lg:!h-[20vh]'
                } else {
                  responsiveClass = 'hidden lg:block'
                }
              }

              return (
                <div
                  key={slot.id}
                  id={slot.id}
                  ref={(el) => {
                    slotWrapperRefs.current[slot.id] = el
                  }}
                  className={`absolute pointer-events-none hero-float-anim overflow-hidden ${responsiveClass}`}
                  style={{
                    left: `${slot.xVw}vw`,
                    top: `${slot.yVh}vh`,
                    width: `${slot.wVw}vw`,
                    height: `${slot.hVh}vh`,
                    animationDuration: `${slot.floatDuration}s`,
                    animationDelay: `${slot.floatDelay}s`,
                  }}
                >
                  {/* Subtle character glow sprite */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(ellipse 65% 75% at 50% 50%, ${char.accentColor}30 0%, transparent 70%)`,
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
                    className="hero-silhouette-img hero-slot-char w-full h-full"
                    style={{
                      opacity: state.isFading ? 0 : slot.baseOpacity,
                      transform: `scale(${slot.scale})`,
                      transformOrigin: 'bottom center',
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
                      className="hero-silhouette-img hero-slot-char absolute inset-0 w-full h-full"
                      style={{
                        opacity: state.isFading ? slot.baseOpacity : 0,
                        transform: `scale(${slot.scale})`,
                        transformOrigin: 'bottom center',
                        filter: `brightness(${incoming.brightnessMultiplier * slot.brightnessFactor})`,
                      }}
                    />
                  )}
                </div>
              )
            })}
        </div>
      )}

      {/* ── DEBUG RECTANGLES & METRICS (?debug=1&hero=boxes) ── */}
      {showHeroBoxes && (
        <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
          {/* Center No-Go Zone (24vw - 76vw) */}
          <div
            className="absolute top-0 bottom-0 border-x border-dashed border-red-500/50 bg-red-500/5 flex flex-col items-center justify-between py-6"
            style={{ left: '24vw', width: '52vw' }}
          >
            <span className="font-mono text-[10px] text-red-400 bg-black/80 px-2 py-0.5 rounded border border-red-500/40">
              CENTER NO-GO ZONE (24vw — 76vw)
            </span>
            <span className="font-mono text-[9px] text-red-400/80 bg-black/80 px-2 py-0.5 rounded">
              Overlap: {debugMetrics.maxNoGoOverlap.toFixed(1)} px²
            </span>
          </div>

          {/* Top Navbar Reservation (top 8vh) */}
          <div
            className="absolute top-0 left-0 right-0 border-b border-dashed border-amber-500/50 bg-amber-500/5 flex items-center justify-center"
            style={{ height: '8vh' }}
          >
            <span className="font-mono text-[10px] text-amber-400 bg-black/80 px-2 py-0.5 rounded border border-amber-500/40">
              NAVBAR SAFE ZONE (Top 8vh)
            </span>
          </div>

          {/* Slot and Figure Boxes */}
          {debugMetrics.figureBoxes.map(({ slotId, charName, slotBox, figBox }) => (
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
                  {slotId}
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
            </div>
          ))}

          {/* Diagnostics summary HUD banner */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/95 text-emerald-400 font-mono text-[10px] px-4 py-1.5 rounded-full border border-emerald-500/50 shadow-2xl flex items-center gap-4">
            <span>PAIRWISE OVERLAP: <b>{debugMetrics.maxPairwiseOverlap.toFixed(1)} px²</b></span>
            <span>NO-GO OVERLAP: <b>{debugMetrics.maxNoGoOverlap.toFixed(1)} px²</b></span>
            <span>ACTIVE HEROES: <b>{activeSlots.length}</b></span>
          </div>
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
