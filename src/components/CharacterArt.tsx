/**
 * src/components/CharacterArt.tsx  (Phase 3g)
 * -----------------------------------------------------------------------------
 * HTML overlay for the character PNG art layer in each Tracks chapter.
 *
 * Scroll choreography (chapterProgress = c, 0..1):
 *   c 0.00-0.25  ENTER : clip-path wipe from side, slide in, opacity 0?1, scale 0.9?1
 *   c 0.25-0.75  HOLD  : slow float, depth parallax, mouse-tilt ±6°, rim glow,
 *                        track sig effects loop, subtle parallax drift
 *   c 0.75-1.00  EXIT  : slides to opposite edge + fades, sparks burst
 *
 * The next chapter's ENTER overlaps ~10% early (c >= 0.90 drives next reveal)
 * — that is handled by App passing the correct chapterProgress once activeIndex
 * increments when sectionProgress crosses the chapter boundary.
 *
 * prefers-reduced-motion ? fades only.
 * Mobile ? simple fade, no tilt or parallax.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { type Track } from '../data/tracks'

// -- smoothstep ------------------------------------------------------------
function ss(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
function norm(v: number, lo: number, hi: number): number {
  return (v - lo) / (hi - lo)
}

// -- phase helpers (new spec: enter 0-0.25, hold 0.25-0.75, exit 0.75-1) --
function enterFrac(c: number): number { return ss(norm(c, 0,    0.25)) }
function exitFrac(c:  number): number { return ss(norm(c, 0.75, 1.0))  }

function phaseOp(c: number): number {
  if (c < 0.05)  return c / 0.05
  if (c <= 0.75) return 1
  return 1 - exitFrac(c)
}

function phaseSc(c: number): number {
  if (c < 0.25) return 0.90 + 0.10 * enterFrac(c)
  if (c <= 0.75) return 1.0
  return 1.0 - 0.05 * exitFrac(c)
}

/** Slide from art side on enter, to opposite side on exit */
function phaseTransX(c: number, artOnRight: boolean): number {
  const dir = artOnRight ? 1 : -1
  if (c < 0.25)  return  dir * 18 * (1 - enterFrac(c))  // enter from art side
  if (c <= 0.75) return  dir * (c - 0.50) * 10          // slow hold parallax
  return -dir * 20 * exitFrac(c)                         // exit to opposite side
}

function phaseClip(c: number, artOnRight: boolean): string {
  const pct = Math.round(Math.min(100, enterFrac(c) * 100))
  return artOnRight
    ? `inset(0 ${100 - pct}% 0 0)`
    : `inset(0 0 0 ${100 - pct}%)`
}

// -- Signature effects -----------------------------------------------------
function HUDRings({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s' }}>
      <div className="absolute inset-8 rounded-full border border-dashed" style={{ borderColor: c + '40', animation: 'char-cw 14s linear infinite' }} />
      <div className="absolute inset-20 rounded-full border" style={{ borderColor: c + '55', borderStyle: 'dotted', animation: 'char-ccw 9s linear infinite' }} />
      <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(0deg,transparent,transparent 3px,${c}09 3px,${c}09 4px)`, animation: 'char-scan 4s linear infinite' }} />
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

function GlitchGrid({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: vis ? 0.55 : 0, transition: 'opacity 0.6s' }}>
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${c}22 1px,transparent 1px),linear-gradient(90deg,${c}22 1px,transparent 1px)`, backgroundSize: '42px 42px', animation: vis ? 'char-glitch 3.2s step-end infinite' : 'none' }} />
      <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(0deg,transparent,transparent 7px,${c}12 7px,${c}12 9px)` }} />
    </div>
  )
}

function MandalaRing({ c, vis }: { c: string; vis: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s' }}>
      <svg viewBox="0 0 200 200" className="absolute w-full h-full" style={{ animation: 'char-cw 22s linear infinite' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180
          return <line key={i} x1={100 + 82 * Math.cos(a)} y1={100 + 82 * Math.sin(a)} x2={100 + 62 * Math.cos(a)} y2={100 + 62 * Math.sin(a)} stroke={c} strokeWidth="1.5" strokeOpacity="0.45" />
        })}
        <circle cx="100" cy="100" r="82" fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="100" cy="100" r="62" fill="none" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
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

// -- Exit burst sparks (bigger, during c 0.75-1.0) -------------------------
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
  chapterProgress: number
  active: boolean
  debugMode?: boolean
}

export function CharacterArt({
  track,
  trackIndex,
  chapterProgress,
  active,
  debugMode = false,
}: CharacterArtProps) {
  const c = chapterProgress

  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLImageElement>(null)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const tiltRef = useRef({ rx: 0, ry: 0 })

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

  // GSAP RAF loop
  useEffect(() => {
    if (!imgRef.current || imgError) return
    const el = imgRef.current
    let raf: number

    const tick = () => {
      if (reducedMotion || isMobile) {
        gsap.set(el, { opacity: active ? phaseOp(c) : 0, clearProps: 'x,y,scale,rotateX,rotateY,clipPath' })
      } else {
        const inHold  = c >= 0.25 && c <= 0.75
        const floatY  = active && inHold ? Math.sin(performance.now() / 1900) * 8 : 0
        const drift   = inHold ? (c - 0.50) * 14 : 0

        gsap.set(el, {
          opacity:    phaseOp(c),
          scale:      phaseSc(c),
          x:         `${phaseTransX(c, artOnRight)}vw`,
          translateX: drift,
          y:          floatY,
          rotateX:    active && inHold ? tiltRef.current.rx : 0,
          rotateY:    active && inHold ? tiltRef.current.ry : 0,
          clipPath:   c < 0.25 ? phaseClip(c, artOnRight) : 'none',
          transformOrigin: '50% 100%',
        })
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [c, active, artOnRight, imgError, reducedMotion, isMobile])

  // Missing image warning
  useEffect(() => {
    if (imgError) {
      const src = track.imagePath ?? `/characters/${track.id}.png`
      console.warn(`[CharacterArt] Missing art for "${track.id}": ${src}`)
    }
  }, [imgError, track.id, track.imagePath])

  const src    = track.imagePath ?? `/characters/${track.id}.png`
  const isHold = active && c >= 0.25 && c <= 0.75
  const isExit = active && c > 0.75
  const ac     = track.accentColor

  const SigEffect = () => {
    const p = { c: ac, vis: isHold }
    if (track.id === 'aiml')     return <HUDRings      {...p} />
    if (track.id === 'cybersec') return <ShieldRings   {...p} />
    if (track.id === 'web3')     return <CrystalShards {...p} />
    if (track.id === 'robonyx')  return <GlitchGrid    {...p} />
    if (track.id === 'coderun')  return <MandalaRing   {...p} />
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
          className="absolute rounded-full border border-dashed"
          style={{
            width:       '62%',
            height:      '62%',
            borderColor: ac + '28',
            animation:   'char-cw 26s linear infinite',
            opacity:     isHold ? 1 : 0,
            transition:  'opacity 0.4s',
          }}
        />
      </div>

      {/* Signature effect */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <SigEffect />
      </div>

      {/* Character PNG */}
      {!imgError && (
        <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 3 }}>
          <img
            ref={imgRef}
            src={src}
            alt={`${track.character} character art`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              height:          '80vh',
              maxWidth:        '100%',
              width:           'auto',
              objectFit:       'contain',
              objectPosition:  'bottom center',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 16%, black 88%, transparent 100%)',
              maskImage:       'linear-gradient(to top, transparent 0%, black 16%, black 88%, transparent 100%)',
              opacity:         0,
              willChange:      'transform, opacity',
              filter: isHold
                ? `drop-shadow(0 0 22px ${ac}80) drop-shadow(0 0 44px ${ac}40)`
                : isExit
                  ? `drop-shadow(0 0 12px ${ac}40)`
                  : 'none',
              transition: 'filter 0.5s ease',
            }}
          />
        </div>
      )}

      {/* Hold sparks */}
      <div className="absolute inset-0" style={{ zIndex: 4 }}>
        <Sparks c={ac} vis={isHold} />
      </div>

      {/* Exit burst sparks */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        <ExitSparks c={ac} active={isExit} />
      </div>

      {/* Debug chip */}
      {debugMode && (
        <div
          className="absolute top-3 left-3 font-mono text-[9px] px-2 py-0.5 rounded border backdrop-blur-sm"
          style={{ zIndex: 50, borderColor: ac + '55', color: ac, background: 'rgba(5,5,8,0.85)' }}
        >
          {imgError ? '? ' : loaded ? '? ' : '… '}
          {src}{imgError ? ' (missing)' : ''} | c={c.toFixed(3)}
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
