/**
 * src/components/CharacterArt.tsx  (Phase 3h - slower scroll, dwell & snap)
 * -----------------------------------------------------------------------------
 * HTML overlay for the character PNG art layer in each Tracks chapter.
 *
 * Scroll choreography (chapterProgress = c, 0..1):
 *   c 0.00-0.22  ENTER : clip-path wipe from side, slide in, opacity 0->1, scale 0.9->1
 *   c 0.22-0.78  HOLD  : slow float, depth parallax, mouse-tilt +/-6 deg, rim glow,
 *                        track sig effects loop, subtle parallax drift
 *   c 0.78-1.00  EXIT  : slides to opposite edge + fades, sparks burst
 *
 * The next chapter's ENTER overlap is at most 5%.
 * prefers-reduced-motion -> fades only.
 * Mobile -> simple fade, no tilt or parallax.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { type Track } from '../data/tracks'
import { scrollStore } from '../utils/scrollStore'

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
function exitFrac(c:  number): number { return ss(norm(c, 0.78, 1.0))  }

function phaseOp(c: number): number {
  if (c < 0.08)  return 0
  if (c < 0.22)  return charEnterFrac(c)
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
  if (c < 0.22)  return  dir * 18 * (1 - charEnterFrac(c))  // enter from art side
  if (c <= 0.78) return  dir * (c - 0.50) * 10          // slow hold parallax
  return -dir * 20 * exitFrac(c)                         // exit to opposite side
}


// -- Signature effects -----------------------------------------------------
function HUDRings({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s' }}>
      <div className="absolute inset-8 rounded-full border border-dashed" style={{ borderColor: c + '40', animation: 'char-cw 14s linear infinite' }} />
      <div className="absolute inset-20 rounded-full border" style={{ borderColor: c + '55', borderStyle: 'dotted', animation: 'char-ccw 9s linear infinite' }} />
    </div>
  )
}

function ShieldRings({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute rounded-full border-2"
          style={{ width: `${28 + i * 22}%`, height: `${28 + i * 22}%`, borderColor: c + (i === 0 ? 'cc' : i === 1 ? '66' : '33'), animation: vis ? `char-shockwave 2.6s ${i * 0.35}s ease-out infinite` : 'none' }} />
      ))}
    </div>
  )
}

function CrystalShards({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none overflow-hidden" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s' }}>
      {[12, 30, 50, 68, 84].map((left, i) => (
        <div key={i} className="absolute bottom-0"
          style={{ left: `${left}%`, width: '5px', height: `${35 + i * 12}px`, background: `linear-gradient(to top,${c}bb,${c}00)`, clipPath: 'polygon(50% 0%,0% 100%,100% 100%)', animation: vis ? `char-shard ${1.4 + i * 0.18}s ${i * 0.12}s ease-out infinite` : 'none', transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (4 + i * 3)}deg)` }} />
      ))}
    </div>
  )
}

function Sparks({ c, vis }: { c: string; vis: boolean }) {
  const pts = [{ x: 18, y: 28 }, { x: 72, y: 14 }, { x: 88, y: 58 }, { x: 8, y: 68 }, { x: 52, y: 82 }, { x: 83, y: 38 }]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pts.map((p, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: c, boxShadow: `0 0 6px ${c}`, opacity: vis ? 1 : 0, animation: vis ? `char-spark ${1.1 + i * 0.28}s ${i * 0.18}s ease-out infinite` : 'none' }} />
      ))}
    </div>
  )
}

// -- Exit burst sparks (bigger, during c 0.78-1.0) -------------------------
function ExitSparks({ c, active }: { c: string; active: boolean }) {
  const pts = [
    { x: 10, y: 40 }, { x: 20, y: 20 }, { x: 40, y: 10 },
    { x: 60, y: 15 }, { x: 80, y: 25 }, { x: 90, y: 50 },
    { x: 75, y: 75 }, { x: 50, y: 85 }, { x: 25, y: 70 },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pts.map((p, i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            backgroundColor: c,
            boxShadow: `0 0 10px ${c}, 0 0 20px ${c}`,
            opacity: active ? 1 : 0,
            animation: active ? `char-spark ${0.8 + i * 0.12}s ${i * 0.06}s ease-out forwards` : 'none',
          }} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface CharacterArtProps {
  track: Track
  trackIndex: number
  /** Chapter progress 0..1 within this track's chapter */
  chapterProgress?: number
  active: boolean
  debugMode?: boolean
}

export function CharacterArt({
  track,
  trackIndex,
  chapterProgress: _propCp,
  active,
  debugMode = false,
}: CharacterArtProps) {
  const hasImage = Boolean(track.imagePath)
  const effectiveVisual = !hasImage ? 'model' : (track.visual ?? 'image')
  if (effectiveVisual === 'model') return null

  const wrapRef       = useRef<HTMLDivElement>(null)
  const imgRef        = useRef<HTMLImageElement>(null)
  const charGlowRef   = useRef<HTMLDivElement>(null)
  const accentRingRef = useRef<HTMLDivElement>(null)
  const sigRef        = useRef<HTMLDivElement>(null)
  const sparksRef     = useRef<HTMLDivElement>(null)
  const exitSparksRef = useRef<HTMLDivElement>(null)
  const debugChipRef  = useRef<HTMLDivElement>(null)

  const initialSrc = track.imagePath ?? `/characters/${track.id}.webp`
  const [src, setSrc] = useState(initialSrc)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const tiltRef = useRef({ rx: 0, ry: 0 })

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
      console.warn(`[CharacterArt] WebP failed for "${track.id}", falling back to PNG: ${pngFallback}`)
      setFallbackAttempted(true)
      setSrc(pngFallback)
    } else {
      setImgError(true)
      console.error(`[CharacterArt] 404: Image failed to load: ${src} for track "${track.id}"`)
    }
  }, [fallbackAttempted, src, track.id])

  const artOnRight    = trackIndex % 2 === 0
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    []
  )

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

  // Continuous rAF loop driven by scrollStore
  useEffect(() => {
    let raf: number

    const tick = () => {
      const liveC = scrollStore.getChapterProgress()
      const inHold = active && liveC >= 0.22 && liveC <= 0.78
      const isExit = active && liveC > 0.78

      // Update accessory layers
      if (charGlowRef.current) {
        charGlowRef.current.style.opacity = inHold ? '0.8' : isExit ? '0.35' : '0'
      }
      if (accentRingRef.current) {
        accentRingRef.current.style.opacity = inHold ? '1' : '0'
      }
      if (sigRef.current) {
        sigRef.current.style.opacity = inHold ? '1' : '0'
      }
      if (sparksRef.current) {
        sparksRef.current.style.opacity = inHold ? '1' : '0'
      }
      if (exitSparksRef.current) {
        exitSparksRef.current.style.opacity = isExit ? '1' : '0'
      }

      if (imgRef.current && !imgError) {
        const el = imgRef.current
        const op = active ? phaseOp(liveC) : 0
        el.style.opacity = op.toFixed(4)

        if (reducedMotion || isMobile) {
          el.style.transform = 'none'
        } else {
          const sc = phaseSc(liveC)
          const tx = phaseTransX(liveC, artOnRight)
          const floatY = inHold ? Math.sin(performance.now() / 1900) * 8 : 0
          const drift  = inHold ? (liveC - 0.50) * 14 : 0
          const rx     = inHold ? tiltRef.current.rx : 0
          const ry     = inHold ? tiltRef.current.ry : 0

          el.style.transform = `translateX(${tx}vw) translateX(${drift.toFixed(2)}px) translateY(${floatY.toFixed(2)}px) scale(${sc.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
        }
      }

      if (debugChipRef.current) {
        debugChipRef.current.textContent = `${imgError ? 'ERR ' : loaded ? 'OK ' : '... '} ${src} | c=${liveC.toFixed(3)}`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, artOnRight, imgError, loaded, reducedMotion, isMobile, src])

  const ac = track.accentColor

  const SigEffect = () => {
    const p = { c: ac, vis: true }
    if (track.id === 'aiml')     return <HUDRings      {...p} />
    if (track.id === 'cybersec') return <ShieldRings   {...p} />
    if (track.id === 'web3')     return <CrystalShards {...p} />
    return null
  }

  if (imgError && !debugMode) return null

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ perspective: '900px' }}
    >
      {/* Slow-rotating accent ring (hold phase) */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
        <div
          ref={accentRingRef}
          className="absolute rounded-full border border-dashed"
          style={{
            width:       '62%',
            height:      '62%',
            borderColor: ac + '28',
            animation:   'char-cw 26s linear infinite',
            opacity:     0,
            transition:  'opacity 0.4s',
          }}
        />
      </div>

      {/* Signature effect */}
      <div ref={sigRef} className="absolute inset-0" style={{ zIndex: 2, opacity: 0, transition: 'opacity 0.4s' }}>
        <SigEffect />
      </div>

      {/* Character WebP art with pre-blurred glow sprite */}
      {!imgError && (
        <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 3 }}>
          {/* Pre-blurred glow sprite instead of drop-shadow */}
          <div
            ref={charGlowRef}
            aria-hidden="true"
            className="absolute pointer-events-none rounded-full"
            style={{
              width: '34vw',
              height: '34vw',
              bottom: '12%',
              background: `radial-gradient(ellipse 65% 65% at 50% 50%, ${ac}50 0%, ${ac}25 40%, transparent 72%)`,
              opacity: 0,
              transform: 'scale(1.1)',
              transition: 'opacity 0.5s ease',
              willChange: 'opacity',
            }}
          />
          <img
            ref={imgRef}
            data-character-img="true"
            src={src}
            alt={`${track.character} character art`}
            width={666}
            height={375}
            decoding="async"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={handleImgError}
            style={{
              height:          '80vh',
              maxWidth:        '100%',
              width:           'auto',
              objectFit:       'contain',
              objectPosition:  'bottom center',
              opacity:         0,
              willChange:      'transform, opacity',
              transformOrigin: '50% 100%',
            }}
          />
        </div>
      )}

      {/* Hold sparks */}
      <div ref={sparksRef} className="absolute inset-0" style={{ zIndex: 4, opacity: 0, transition: 'opacity 0.4s' }}>
        <Sparks c={ac} vis={true} />
      </div>

      {/* Exit burst sparks */}
      <div ref={exitSparksRef} className="absolute inset-0" style={{ zIndex: 5, opacity: 0, transition: 'opacity 0.3s' }}>
        <ExitSparks c={ac} active={true} />
      </div>

      {/* Debug chip */}
      {debugMode && (
        <div
          ref={debugChipRef}
          className="absolute top-3 left-3 font-mono text-[9px] px-2 py-0.5 rounded border"
          style={{ zIndex: 50, borderColor: ac + '55', color: ac, background: 'rgba(5,5,8,0.92)' }}
        >
          {imgError ? 'ERR ' : loaded ? 'OK ' : '... '} {src}
        </div>
      )}

      {/* Placeholder rect when image is missing and debug mode on */}
      {imgError && debugMode && (
        <div
          className="absolute inset-16 border-2 border-dashed rounded flex items-center justify-center text-xs font-mono text-center p-4"
          style={{ borderColor: ac + '60', color: ac + '80', zIndex: 3 }}
        >
          {track.character}<br />
          <span className="text-[9px] opacity-50">{src}</span>
        </div>
      )}
    </div>
  )
}