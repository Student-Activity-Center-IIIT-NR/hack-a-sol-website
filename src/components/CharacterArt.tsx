/**
 * src/components/CharacterArt.tsx  (Phase 3d)
 * ─────────────────────────────────────────────────────────────────────────────
 * HTML overlay for the character PNG art layer in each Tracks chapter.
 *
 * Layer stack (back to front, all inside the "empty half" div in Tracks.tsx):
 *   1. Outlined character-name watermark   [in Tracks.tsx — stays]
 *   2. Accent glow disc                    [in Tracks.tsx — stays]
 *   3. Slow-rotating sig ring + sig effect [this component, z:1–2]
 *   4. Character PNG image                 [this component, z:3]
 *   5. Accent sparks                       [this component, z:4]
 *
 * Scroll-phase animation (localT = chapter progress 0 to 1):
 *   0.00-0.30 : slide in from side (translateX 15vw->0), clip-path reveal,
 *               opacity 0->1, scale 0.9->1
 *   0.30-0.70 : hold; slow float, parallax drift, mouse-tilt +/-6deg, rim glow
 *   0.70-1.00 : slide out to opposite edge, fade, scale 1->0.95
 *
 * Signature effect per track ID (CSS/SVG, no canvas):
 *   aiml     -> rotating HUD rings + scan lines
 *   cybersec -> shield rings + shockwave pulse
 *   web3     -> vibranium crystal shards rising
 *   robonyx  -> glitch scanlines + red wireframe grid
 *   coderun  -> rotating mandala ring + gold sparks
 *
 * Accessibility: prefers-reduced-motion -> simple fade only, no parallax.
 * Mobile: stacked above text, simple fade, no tilt.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { type Track } from '../data/tracks'

// ── easing helpers ────────────────────────────────────────────────────────────
function ss(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function phaseTransX(p: number, right: boolean): number {
  const dir = right ? 1 : -1
  if (p < 0.30) return dir * 15 * (1 - ss(p / 0.30))
  if (p <= 0.70) return 0
  return -dir * 15 * ss((p - 0.70) / 0.30)
}
function phaseOp(p: number): number {
  if (p < 0.10) return ss(p / 0.10)
  if (p < 0.70) return 1
  return 1 - ss((p - 0.70) / 0.30)
}
function phaseSc(p: number): number {
  if (p < 0.30) return 0.90 + 0.10 * ss(p / 0.30)
  if (p <= 0.70) return 1.0
  return 1.0 - 0.05 * ss((p - 0.70) / 0.30)
}
function phaseClip(p: number, right: boolean): string {
  const pct = Math.round(Math.min(100, ss(Math.min(p, 0.30) / 0.30) * 100))
  return right ? `inset(0 ${100 - pct}% 0 0)` : `inset(0 0 0 ${100 - pct}%)`
}

// ── Signature effects ─────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// Public component
// ═══════════════════════════════════════════════════════════════════════════════

export interface CharacterArtProps {
  track: Track
  trackIndex: number
  localT: number
  active: boolean
  debugMode?: boolean
}

export function CharacterArt({ track, trackIndex, localT, active, debugMode = false }: CharacterArtProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLImageElement>(null)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const tiltRef = useRef({ rx: 0, ry: 0 })

  const artOnRight = trackIndex % 2 === 0
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Mouse-tilt tracking
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (reducedMotion || !active || !wrapRef.current) return
    const r  = wrapRef.current.getBoundingClientRect()
    tiltRef.current = {
      rx: ((e.clientY - r.top - r.height / 2) / r.height) * 6,
      ry: ((e.clientX - r.left - r.width / 2) / r.width) * -6,
    }
  }, [active, reducedMotion])

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
      if (reducedMotion) {
        gsap.set(el, { opacity: active ? phaseOp(localT) : 0, clearProps: 'x,y,scale,rotateX,rotateY,clipPath' })
      } else {
        const floatY = active ? Math.sin(performance.now() / 1900) * 8 : 0
        const drift  = (active && localT > 0.30 && localT < 0.70) ? (localT - 0.50) * 14 : 0
        gsap.set(el, {
          opacity: phaseOp(localT),
          scale:   phaseSc(localT),
          x: `${phaseTransX(localT, artOnRight)}vw`,
          translateX: drift,
          y: floatY,
          rotateX: active ? tiltRef.current.rx : 0,
          rotateY: active ? tiltRef.current.ry : 0,
          clipPath: phaseClip(localT, artOnRight),
          transformOrigin: '50% 100%',
        })
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [localT, active, artOnRight, imgError, reducedMotion])

  // Missing image warning
  useEffect(() => {
    if (imgError) {
      const src = track.imagePath ?? `/characters/${track.id}.png`
      console.warn(`[CharacterArt] Missing art for "${track.id}": ${src}. Drop a transparent PNG there.`)
    }
  }, [imgError, track.id, track.imagePath])

  const src    = track.imagePath ?? `/characters/${track.id}.png`
  const isHold = active && localT >= 0.30 && localT <= 0.70
  const c      = track.accentColor

  const SigEffect = () => {
    const p = { c, vis: isHold }
    if (track.id === 'aiml')     return <HUDRings     {...p} />
    if (track.id === 'cybersec') return <ShieldRings  {...p} />
    if (track.id === 'web3')     return <CrystalShards {...p} />
    if (track.id === 'robonyx')  return <GlitchGrid   {...p} />
    if (track.id === 'coderun')  return <MandalaRing  {...p} />
    return null
  }

  if (imgError && !debugMode) return null

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ perspective: '900px' }}>

      {/* Slow-rotating accent ring */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
        <div className="absolute rounded-full border border-dashed"
          style={{ width: '62%', height: '62%', borderColor: c + '28', animation: 'char-cw 26s linear infinite' }} />
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
              height: '80vh',
              maxWidth: '100%',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 16%, black 88%, transparent 100%)',
              maskImage:       'linear-gradient(to top, transparent 0%, black 16%, black 88%, transparent 100%)',
              opacity: 0,
              willChange: 'transform, opacity',
              filter: isHold ? `drop-shadow(0 0 22px ${c}80) drop-shadow(0 0 44px ${c}40)` : 'none',
              transition: 'filter 0.5s ease',
            }}
          />
        </div>
      )}

      {/* Sparks */}
      <div className="absolute inset-0" style={{ zIndex: 4 }}>
        <Sparks c={c} vis={isHold} />
      </div>

      {/* Debug chip */}
      {debugMode && (
        <div className="absolute top-3 left-3 font-mono text-[9px] px-2 py-0.5 rounded border backdrop-blur-sm"
          style={{ zIndex: 50, borderColor: c + '55', color: c, background: 'rgba(5,5,8,0.85)' }}>
          {imgError ? '? ' : loaded ? '? ' : '? '}
          {src}{imgError ? ' (missing)' : ''}
        </div>
      )}

      {/* Placeholder rect when image is missing and debug mode on */}
      {imgError && debugMode && (
        <div className="absolute inset-16 border-2 border-dashed rounded flex items-center justify-center text-xs font-mono text-center p-4"
          style={{ borderColor: c + '60', color: c + '80', zIndex: 3 }}>
          {track.character}<br />
          <span className="text-[9px] opacity-50">{src}</span>
        </div>
      )}
    </div>
  )
}
