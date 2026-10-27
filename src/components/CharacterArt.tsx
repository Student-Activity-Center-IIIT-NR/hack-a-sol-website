/**
 * src/components/CharacterArt.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified HTML character art layer for all five Tracks chapters.
 *
 * Rules:
 * - Reads layout constants from TRACK_LAYOUT in src/config.ts.
 * - Same bottom bleed: height ART_HEIGHT_VH = 92vh (width auto, clamped to 46vw),
 *   bottom offset -6vh, horizontally centered at the same x as the aiml art
 *   (mirrored on alternating sides).
 * - Optional per-track overrides artHeightVh, artX, artY from tracks.ts or artTuneStore.
 * - Rim light is pre-baked into the WebP by scripts/prepare-characters.mjs;
 *   NO runtime CSS filter, mask-image or backdrop-filter on large layers.
 * - Animates ONLY transform and opacity during scroll.
 * - Decor parity: subtle behind the figure, never bigger than the art box.
 *   - open: subtle spider web at most 35% opacity and at most 60% of art box size.
 *   - web3: subtle vibranium shards.
 *   - aiml, cybersec, policy: subtle 3D environment effects, shared glow disk and single ring.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { type Track } from '../data/tracks'
import { TRACK_LAYOUT } from '../config'
import { scrollStore } from '../utils/scrollStore'
import { artTuneStore } from '../utils/artTuneStore'

// -- smoothstep ------------------------------------------------------------
function ss(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number): number {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
}

// -- phase helpers: enter 0.08-0.22, hold 0.22-0.78, exit 0.78-1.0 ------------
function charEnterFrac(c: number): number {
  if (c < 0.08) return 0
  if (c >= 0.22) return 1
  return ss((c - 0.08) / (0.22 - 0.08))
}
function exitFrac(c: number): number {
  return ss(norm(c, 0.78, 1.0))
}

function phaseOp(c: number): number {
  if (c < 0.08) return 0
  if (c < 0.22) return charEnterFrac(c)
  if (c <= 0.78) return 1
  return Math.max(0, 1 - exitFrac(c))
}

function phaseSc(c: number): number {
  if (c < 0.22) return 0.90 + 0.10 * charEnterFrac(c)
  if (c <= 0.78) return 1.0
  return 1.0 - 0.05 * exitFrac(c)
}

/** Slide from art side on enter, to opposite side on exit */
function phaseTransX(c: number, artOnRight: boolean): number {
  const dir = artOnRight ? 1 : -1
  if (c < 0.22)  return dir * 18 * (1 - charEnterFrac(c))
  if (c <= 0.78) return dir * (c - 0.50) * 10
  return -dir * 20 * exitFrac(c)
}

// ── Subtle Signature Decor (at most 60% of art box, behind figure) ──

function CrystalShards({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none overflow-hidden"
      style={{ opacity: vis ? 0.8 : 0, transition: 'opacity 0.6s' }}
    >
      {[16, 34, 50, 68, 84].map((left, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${left}%`,
            width: '4px',
            height: `${32 + i * 10}px`,
            background: `linear-gradient(to top,${c}bb,${c}00)`,
            clipPath: 'polygon(50% 0%,0% 100%,100% 100%)',
            animation: vis ? `char-shard ${1.4 + i * 0.18}s ${i * 0.12}s ease-out infinite` : 'none',
            transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (4 + i * 3)}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/** Spider web decor: <= 35% opacity, <= 60% of art box size */
function OpenSpiderWebDecor({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: vis ? 0.35 : 0 }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        className="w-[50%] h-[50%] max-w-[320px] max-h-[320px]"
        style={{ opacity: 0.35 }}
      >
        <line x1="100" y1="10" x2="100" y2="190" strokeOpacity="0.4" />
        <line x1="10" y1="100" x2="190" y2="100" strokeOpacity="0.4" />
        <line x1="36" y1="36" x2="164" y2="164" strokeOpacity="0.4" />
        <line x1="36" y1="164" x2="164" y2="36" strokeOpacity="0.4" />
        <polygon points="100,30 149,51 170,100 149,149 100,170 51,149 30,100 51,51" strokeOpacity="0.35" />
        <polygon points="100,50 135,65 150,100 135,135 100,150 65,135 50,100 65,65" strokeOpacity="0.4" />
        <polygon points="100,70 121,79 130,100 121,121 100,130 79,121 70,100 79,79" strokeOpacity="0.45" />
        <polygon points="100,85 110,90 115,100 110,110 100,115 90,110 85,100 90,90" strokeOpacity="0.5" />
      </svg>
    </div>
  )
}

// ── Fallback Emblems when image file is missing ──
function FallbackEmblem({ trackId, color }: { trackId: string; color: string }) {
  if (trackId === 'policy') {
    return (
      <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" className="w-36 h-36">
        <path d="M50 14 L50 86 M32 86 L68 86" />
        <path d="M20 28 L80 28" />
        <path d="M20 28 L10 52 M20 28 L30 52" />
        <path d="M8 52 Q20 64 32 52 Z" fill={color + '25'} />
        <path d="M80 28 L70 52 M80 28 L90 52" />
        <path d="M68 52 Q80 64 92 52 Z" fill={color + '25'} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" className="w-36 h-36">
      <circle cx="50" cy="50" r="38" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="50" cy="50" r="28" strokeWidth="3" />
      <polygon points="50,28 69,61 31,61" strokeWidth="2.5" fill={color + '20'} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Public Component
// ---------------------------------------------------------------------------

export interface CharacterArtProps {
  track: Track
  trackIndex: number
  chapterProgress?: number
  active: boolean
  debugMode?: boolean
  artOnRight?: boolean
}

export const CharacterArt = React.memo(function CharacterArt({
  track,
  trackIndex: _trackIndex,
  chapterProgress: _propCp,
  active,
  debugMode = false,
  artOnRight = true,
}: CharacterArtProps) {
  const hasImage = Boolean(track.imagePath)
  const effectiveVisual = !hasImage ? 'model' : (track.visual ?? 'image')
  if (effectiveVisual === 'model') return null

  const wrapRef       = useRef<HTMLDivElement>(null)
  const imgRef        = useRef<HTMLImageElement>(null)
  const fallbackRef   = useRef<HTMLDivElement>(null)
  const sigRef        = useRef<HTMLDivElement>(null)
  const debugChipRef  = useRef<HTMLDivElement>(null)

  const initialSrc = track.imagePath ?? `/characters/${track.id}.webp`
  const [src, setSrc] = useState(initialSrc)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const [tuneOverrides, setTuneOverrides] = useState(() => artTuneStore.get(track.id))
  const [showOverlay, setShowOverlay] = useState(artTuneStore.showAimlOverlay)
  const isAlphaDebug = useMemo(() => {
    if (typeof window === 'undefined') return false
    const p = new URLSearchParams(window.location.search)
    return p.get('debug') === '1' && p.get('art') === 'alpha'
  }, [])
  const tiltRef = useRef({ rx: 0, ry: 0 })

  // Listen to ArtTuneStore for live ?art=tune changes
  useEffect(() => {
    return artTuneStore.subscribe(() => {
      setTuneOverrides(artTuneStore.get(track.id))
      setShowOverlay(artTuneStore.showAimlOverlay)
    })
  }, [track.id])

  useEffect(() => {
    const s = track.imagePath ?? `/characters/${track.id}.webp`
    setSrc(s)
    setFallbackAttempted(false)
    setImgError(false)
    setLoaded(false)
  }, [track.id, track.imagePath])

  const handleImgError = useCallback(() => {
    if (!fallbackAttempted && src.endsWith('.webp')) {
      const pngFallback = src.replace(/\.webp$/, '.png')
      console.warn(`[CharacterArt] WebP failed for "${track.id}", trying PNG: ${pngFallback}`)
      setFallbackAttempted(true)
      setSrc(pngFallback)
    } else {
      setImgError(true)
      console.warn(`[CharacterArt Fallback] Image missing: "${src}" for track "${track.id}". Displaying fallback emblem.`)
    }
  }, [fallbackAttempted, src, track.id])

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mouse-tilt tracking (desktop hold phase only)
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (reducedMotion || isMobile || !active || !wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    tiltRef.current = {
      rx: ((e.clientY - r.top  - r.height / 2) / r.height) *  6,
      ry: ((e.clientX - r.left - r.width  / 2) / r.width)  * -6,
    }
  }, [active, reducedMotion, isMobile])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  // Continuous rAF loop driven by scrollStore (no per-frame React state)
  useEffect(() => {
    let raf: number

    const tick = () => {
      const liveC = scrollStore.getChapterProgress()
      const inHold = active && liveC >= 0.22 && liveC <= 0.78

      if (sigRef.current) {
        sigRef.current.style.opacity = inHold ? (isMobile ? '0.3' : '1') : '0'
      }

      // Between chapter progress 0.22 and 0.78 its opacity is at least 0.95
      let op = active ? phaseOp(liveC) : 0
      if (inHold) {
        op = Math.max(0.95, op)
      }

      const sc = phaseSc(liveC)
      const tx = phaseTransX(liveC, artOnRight)
      const floatY = inHold ? Math.sin(performance.now() / 1900) * 8 : 0
      const drift  = inHold ? (liveC - 0.50) * 12 : 0
      const rx     = inHold ? tiltRef.current.rx : 0
      const ry     = inHold ? tiltRef.current.ry : 0

      // Overrides from tracks.ts or artTuneStore
      const artX = (track.artX ?? 0) + (tuneOverrides.artX ?? 0)
      const artY = (track.artY ?? 0) + (tuneOverrides.artY ?? 0)

      const targetEl = imgRef.current ?? fallbackRef.current
      if (targetEl) {
        targetEl.style.opacity = op.toFixed(4)
        targetEl.style.visibility = 'visible'
        targetEl.style.display = 'block'
        if (isMobile) {
          // On mobile, ignore desktop overrides and center cleanly using CSS variables
          targetEl.style.transform = `translateX(var(--art-x, 0px)) translateY(var(--art-y, 0px))`
        } else if (reducedMotion) {
          targetEl.style.transform = `translateX(${artX}px) translateY(${artY}px)`
        } else {
          targetEl.style.transform = `translateX(${tx}vw) translateX(${(drift + artX).toFixed(2)}px) translateY(${(floatY + artY).toFixed(2)}px) scale(${sc.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
        }
      }

      if (debugChipRef.current) {
        debugChipRef.current.textContent = `${imgError ? 'FALLBACK ' : loaded ? 'OK ' : '... '} ${src} | c=${liveC.toFixed(3)}`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, artOnRight, imgError, loaded, reducedMotion, isMobile, src, track.artX, track.artY, tuneOverrides.artX, tuneOverrides.artY])

  const ac = track.accentColor

  // Subtle signature decor behind figure (<= 60% art box size)
  const SigDecor = () => {
    if (track.id === 'web3') return <CrystalShards c={ac} vis={active} />
    if (track.id === 'open') return <OpenSpiderWebDecor c={ac} vis={active} />
    return null
  }

  // Exact shared sizing from TRACK_LAYOUT with optional override
  const heightVh = track.artHeightVh ?? tuneOverrides.artHeightVh ?? TRACK_LAYOUT.artHeightVh
  const bottomOffsetVh = TRACK_LAYOUT.artBottomOffsetVh
  const maxWidthVw = TRACK_LAYOUT.maxArtWidthVw
  const artX = (track.artX ?? 0) + (tuneOverrides.artX ?? 0)
  const artY = (track.artY ?? 0) + (tuneOverrides.artY ?? 0)

  return (
    <div
      ref={wrapRef}
      className="character-art-container absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        perspective: '900px',
        // @ts-expect-error CSS custom properties for desktop default overrides
        '--art-x': `${artX}px`,
        '--art-y': `${artY}px`,
        '--art-height': `${heightVh}vh`,
        '--art-bottom': `${bottomOffsetVh}vh`,
        '--art-max-w': `${maxWidthVw}vw`,
        '--desktop-art-x': `${artX}px`,
        '--desktop-art-y': `${artY}px`,
        '--desktop-art-height': `${heightVh}vh`,
        '--desktop-art-bottom': `${bottomOffsetVh}vh`,
        '--desktop-art-max-w': `${maxWidthVw}vw`,
      }}
    >
      {/* Subtle signature decor behind figure (z-index 1, <= 30% opacity on mobile) */}
      <div
        ref={sigRef}
        className="character-art-decor absolute inset-0 pointer-events-none"
        style={{ zIndex: 1, opacity: 0, transition: 'opacity 0.4s' }}
      >
        <SigDecor />
      </div>

      {/* Aiml comparison reference outline overlay (?art=tune) */}
      {showOverlay && (
        <div
          className="absolute inset-x-0 mx-auto pointer-events-none border-2 border-dashed border-cyan-400/70 z-20 flex items-start justify-center hidden min-[900px]:flex"
          style={{
            height: `${TRACK_LAYOUT.artHeightVh}vh`,
            maxWidth: `${TRACK_LAYOUT.maxArtWidthVw}vw`,
            bottom: `${bottomOffsetVh}vh`,
            boxShadow: '0 0 24px rgba(96,165,250,0.25)',
          }}
        >
          <span className="font-mono text-[9px] tracking-widest text-cyan-300 bg-black/85 px-2 py-0.5 mt-2 rounded">
            AIML REF BOX ({TRACK_LAYOUT.artHeightVh}vh × {TRACK_LAYOUT.maxArtWidthVw}vw)
          </span>
        </div>
      )}

      {/* Bottom-anchored character art with unified bleed */}
      {!imgError ? (
        <div
          className="character-art-img-wrap absolute inset-x-0 flex items-end justify-center pointer-events-none"
          style={{
            zIndex: 2,
            bottom: 'var(--art-bottom, -6vh)',
          }}
        >
          {/* Debug view (?debug=1&art=alpha): checkerboard + bounding-box outline */}
          {isAlphaDebug && active && (
            <div
              data-testid="alpha-debug-checkerboard"
              className="absolute pointer-events-none z-0 border-2 border-dashed border-cyan-400"
              style={{
                height: `${heightVh}vh`,
                maxWidth: `${maxWidthVw}vw`,
                width: '100%',
                backgroundImage:
                  'linear-gradient(45deg, #2a2a3c 25%, transparent 25%), ' +
                  'linear-gradient(-45deg, #2a2a3c 25%, transparent 25%), ' +
                  'linear-gradient(45deg, transparent 75%, #2a2a3c 75%), ' +
                  'linear-gradient(-45deg, transparent 75%, #2a2a3c 75%)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                backgroundColor: '#12121a',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 0 24px rgba(0,0,0,0.85)',
              }}
            >
              <div className="absolute top-2 left-2 bg-black/90 px-2 py-0.5 rounded font-mono text-[10px] text-cyan-300 border border-cyan-400/50">
                ALPHA DEBUG // {track.character.toUpperCase()} ({track.id})
              </div>
            </div>
          )}
          <img
            ref={imgRef}
            data-character-img="true"
            className="character-art-img"
            src={src}
            alt={`${track.character} character art`}
            decoding="async"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={handleImgError}
            style={{
              height: 'var(--art-height, 92vh)',
              maxWidth: 'var(--art-max-w, 46vw)',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              opacity: 0,
              visibility: 'visible',
              display: 'block',
              willChange: 'transform, opacity',
              transformOrigin: '50% 100%',
              zIndex: 2,
              outline: isAlphaDebug && active ? '2px dashed rgba(239, 68, 68, 0.9)' : undefined,
            }}
          />
        </div>
      ) : (
        /* Fallback when image file is missing */
        <div
          ref={fallbackRef}
          data-character-img="true"
          className="character-art-img character-art-img-wrap absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 2, opacity: 0, visibility: 'visible', display: 'flex', willChange: 'transform, opacity' }}
        >
          <FallbackEmblem trackId={track.id} color={ac} />
        </div>
      )}

      {/* Debug mode indicator */}
      {debugMode && (
        <div
          ref={debugChipRef}
          className="absolute top-4 right-4 z-20 px-2 py-1 rounded bg-black/80 border border-white/20 font-mono text-[9px] text-white/70 pointer-events-none"
        />
      )}
    </div>
  )
})