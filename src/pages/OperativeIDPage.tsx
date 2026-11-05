/**
 * src/pages/OperativeIDPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone "ACCESS GRANTED — YOUR OPERATIVE ID" page.
 *
 * - The live preview is a 3D rope-physics lanyard (OperativeLanyard). Its card
 *   textures are rendered from two hidden DOM cards (front + back), which are
 *   also the source of the PNG download.
 * - Download: ONE PNG with the front and back side by side (4× each).
 * - Back = a random Avenger only (art slot + codename). Drop your images into
 *   HEROES[].img.
 *
 * Dependency: html-to-image, gsap, three, @react-three/fiber, drei, rapier
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { toCanvas } from 'html-to-image'
import { EVENT } from '../config'
import { OperativeLanyard } from '../components/OperativeLanyard'
import './operative-id/OperativeID.css'
import collegeLogo from '../assets/college-logo.png'

import ironMan from '../assets/avengers/ironman.webp'
import captainAmerica from '../assets/avengers/captain-america.png'
import thor from '../assets/avengers/thor.jpg'
import hulk from '../assets/avengers/hulk.jpg'
import blackWidow from '../assets/avengers/black-widow.jpg'
import spiderMan from '../assets/avengers/spiderman.jpg'
import blackPanther from '../assets/avengers/black-panther.jpg'
import doctorStrange from '../assets/avengers/doctor-strange.png'
import loki from '../assets/avengers/loki.jpg'
import hawkeye from '../assets/avengers/hawkeye.jpg'
import antMan from '../assets/avengers/ant-man.jpg'
import nickFury from '../assets/avengers/nick-fury.jpg'
import thanos from '../assets/avengers/thanos.jpg'

/* ── CONFIG (organiser edits these) ──────────────────────────────────────── */

const COLLEGE = 'IIIT Naya Raipur'
const SPONSOR_LOGOS: string[] = []
const EVENT_LOGO_SRC: string | undefined = undefined
/** Event tagline, printed at the foot of the card back. */
const TAGLINE = 'ASSEMBLE. INNOVATE. CONQUER.'

/* Avengers. Add art later, e.g.
 *   import ironMan from '../assets/avengers/iron-man.png'   →   img: ironMan
 * Portrait-ish images work best (they are cropped to fill the card back,
 * anchored near the top). Add or remove entries freely; the draw adapts. */
type GlyphKey =
  | 'reactor' | 'shield' | 'hammer' | 'gamma'
  | 'hourglass' | 'target' | 'panther'
  | 'web' | 'portal' | 'scepter'
  | 'quantum' | 'eye' | 'gauntlet'

interface Hero {
  code: string
  real: string
  tag: string
  glyph: GlyphKey
  img?: string
}

const HEROES: Hero[] = [
  { code: 'IRON MAN',        real: 'TONY STARK',       tag: 'GENIUS. BILLIONAIRE. BUILDER.',          glyph: 'reactor',   img: ironMan },
  { code: 'CAPTAIN AMERICA', real: 'STEVE ROGERS',     tag: 'I CAN DO THIS ALL DAY.',                 glyph: 'shield',    img: captainAmerica },
  { code: 'THOR',            real: 'THOR ODINSON',     tag: 'BRING THE THUNDER.',                     glyph: 'hammer',    img: thor },
  { code: 'HULK',            real: 'BRUCE BANNER',     tag: 'THE STRONGEST AVENGER.',                 glyph: 'gamma',     img: hulk },
  { code: 'BLACK WIDOW',     real: 'NATASHA ROMANOFF', tag: 'NO TRACE. NO NOISE.',                    glyph: 'hourglass', img: blackWidow },
  { code: 'SPIDER-MAN',      real: 'PETER PARKER',     tag: 'YOUR FRIENDLY NEIGHBORHOOD HERO.',       glyph: 'web',       img: spiderMan },
  { code: 'BLACK PANTHER',   real: "T'CHALLA",         tag: 'WAKANDA FOREVER.',                       glyph: 'panther',   img: blackPanther },
  { code: 'DOCTOR STRANGE',  real: 'STEPHEN STRANGE',  tag: 'BEND REALITY. DEFY DESTINY.',            glyph: 'portal',    img: doctorStrange },
  { code: 'LOKI',            real: 'LOKI LAUFEYSON',   tag: 'GLORIOUS PURPOSE.',                      glyph: 'scepter',   img: loki },
  { code: 'HAWKEYE',         real: 'CLINT BARTON',     tag: 'NEVER MISS. NEVER BACK DOWN.',           glyph: 'target',    img: hawkeye },
  { code: 'ANT-MAN',         real: 'SCOTT LANG',       tag: 'THINK BIG. GO SMALL.',                   glyph: 'quantum',   img: antMan },
  { code: 'NICK FURY',       real: 'NICHOLAS FURY',    tag: 'THE AVENGERS INITIATIVE STARTS HERE.',   glyph: 'eye',       img: nickFury },
  { code: 'THANOS',          real: 'THANOS',           tag: 'INEVITABLE. UNSTOPPABLE.',               glyph: 'gauntlet',  img: thanos },
]

/* ────────────────────────────────────────────────────────────────────────── */

const CARD_W = 340
const CARD_H = 540
const PHOTO_W = 480
const PHOTO_H = 600

const PLACEHOLDER_NAME = 'YOUR NAME'
const PLACEHOLDER_TEAM = 'YOUR TEAM'

type Role = 'lead' | 'member'
const ROLES: { id: Role; label: string; level: number }[] = [
  { id: 'lead', label: 'TEAM LEAD', level: 9 },
  { id: 'member', label: 'TEAM MEMBER', level: 7 },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function splitEvent(name: string): [string, string] {
  const m = name.match(/^(.*?)\s*(\d+(?:\.\d+)?)$/)
  return m ? [m[1], m[2]] : [name, '']
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = () => rej(new Error('read'))
    fr.readAsDataURL(file)
  })
}

function checkImage(file: File, maxMb: number): string {
  if (!file.type.startsWith('image/')) return 'That is not an image. Use a JPG, PNG or WebP.'
  if (file.size > maxMb * 1024 * 1024) return `Image is too large. Keep it under ${maxMb} MB.`
  return ''
}

function processPhoto(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.max(PHOTO_W / img.width, PHOTO_H / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const c = document.createElement('canvas')
      c.width = PHOTO_W
      c.height = PHOTO_H
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('no canvas'))
      ctx.drawImage(img, (PHOTO_W - dw) / 2, (PHOTO_H - dh) * 0.2, dw, dh)
      resolve(c.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => reject(new Error('bad image'))
    img.src = src
  })
}

const exportFilter = (n: Node) => !(n instanceof HTMLElement && n.dataset.noexport !== undefined)

/* ── Card pieces ── */



function AInsignia({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="#f4ece1">
        <circle cx="50" cy="50" r="47" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" strokeWidth=".7" strokeDasharray="2 2.4" />
        <path d="M14 66 Q50 54 88 70" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <path fillRule="evenodd" fill="#f4ece1" d="M50 13 L80 87 H65.5 L59.8 72 H40.2 L34.5 87 H20 Z M50 39 L44.4 58 H55.6 Z" />
    </svg>
  )
}

function ReactorMark({ className }: { className?: string }) {
  const ticks = Array.from({ length: 10 }, (_, i) => (i * 36 * Math.PI) / 180)
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <circle cx="20" cy="20" r="17.5" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="7" strokeWidth="1.6" />
      {ticks.map((a, i) => (
        <path key={i} strokeWidth="2.6" d={`M${(20 + 11 * Math.cos(a)).toFixed(2)} ${(20 + 11 * Math.sin(a)).toFixed(2)}L${(20 + 15 * Math.cos(a)).toFixed(2)} ${(20 + 15 * Math.sin(a)).toFixed(2)}`} />
      ))}
      <circle cx="20" cy="20" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const REACTOR_TICKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i * 36 * Math.PI) / 180
  return `M${(50 + 26 * Math.cos(a)).toFixed(1)} ${(50 + 26 * Math.sin(a)).toFixed(1)}L${(50 + 36 * Math.cos(a)).toFixed(1)} ${(50 + 36 * Math.sin(a)).toFixed(1)}`
})

/** Fallback line-art shown on the card back if a hero image is missing. */
const GLYPHS: Record<GlyphKey | 'unknown', ReactNode> = {
  reactor: (<><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="16" />{REACTOR_TICKS.map((d, i) => <path key={i} d={d} strokeWidth="5" />)}<circle cx="50" cy="50" r="5" fill="currentColor" stroke="none" /></>),
  shield: (<><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="29" /><circle cx="50" cy="50" r="18" /><path fill="currentColor" stroke="none" d="M50 36 L53.5 45.1 L63.3 45.7 L55.7 51.9 L58.2 61.3 L50 56 L41.8 61.3 L44.3 51.9 L36.7 45.7 L46.5 45.1 Z" /></>),
  hammer: (<><rect x="26" y="20" width="48" height="26" rx="2" /><rect x="45" y="46" width="10" height="40" /><path d="M26 33 H74" strokeWidth="1.5" /></>),
  gamma: (<><circle cx="50" cy="50" r="42" /><path d="M30 28 L50 56 L70 28 M50 56 V78" strokeWidth="6" /></>),
  hourglass: (<><path d="M30 20 H70 L50 50 L70 80 H30 L50 50 Z" /><path d="M38 24 H62" /><path d="M50 62 V76" /></>),
  target: (<><circle cx="50" cy="50" r="40" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="12" /><path d="M50 4 V24 M50 76 V96 M4 50 H24 M76 50 H96" /><circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" /></>),
  panther: (<><path d="M50 16 L78 34 V62 L50 86 L22 62 V34 Z" /><path d="M34 40 L50 52 L66 40" /><path d="M50 52 V72" /><path d="M36 58 L44 64 M64 58 L56 64" /></>),
  web: (<><path d="M50 8 V92 M8 50 H92 M20 20 L80 80 M80 20 L20 80" /><circle cx="50" cy="50" r="12" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="40" /></>),
  portal: (<><circle cx="50" cy="50" r="42" strokeDasharray="4 5" /><circle cx="50" cy="50" r="30" /><circle cx="50" cy="50" r="18" /><path d="M50 4 V16 M50 84 V96 M4 50 H16 M84 50 H96" /></>),
  scepter: (<><path d="M30 74 C20 44 28 22 44 12 M70 74 C80 44 72 22 56 12" /><path d="M34 74 H66" /><path d="M50 30 V90" /></>),
  quantum: (<><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="11" /><circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" /></>),
  eye: (<><path d="M6 50 C26 22 74 22 94 50 C74 78 26 78 6 50 Z" /><circle cx="50" cy="50" r="15" /><circle cx="50" cy="50" r="5" fill="currentColor" stroke="none" /></>),
  gauntlet: (<><rect x="26" y="54" width="50" height="32" rx="6" /><path d="M32 54 V26 M44 54 V18 M56 54 V18 M68 54 V26 M26 66 L14 54" /><circle cx="38" cy="70" r="3" fill="currentColor" stroke="none" /><circle cx="51" cy="70" r="3" fill="currentColor" stroke="none" /><circle cx="64" cy="70" r="3" fill="currentColor" stroke="none" /></>),
  unknown: (<><path d="M38 38 C38 22 62 22 62 38 C62 50 50 50 50 60" strokeWidth="5" /><circle cx="50" cy="74" r="3" fill="currentColor" stroke="none" /></>),
}

function Glyph({ k, className }: { k: GlyphKey | 'unknown'; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {GLYPHS[k]}
    </svg>
  )
}

/* ── Form pieces ─────────────────────────────────────────────────────────── */

interface DropProps {
  ariaLabel: string
  title: string
  hint: string
  thumb: ReactNode
  filled: boolean
  onFiles: (files: File[]) => void | Promise<void>
}

function Drop({ ariaLabel, title, hint, thumb, filled, onFiles }: DropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <>
      <div
        className={`oidp-drop${over ? ' is-over' : ''}${filled ? ' has-photo' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          onFiles(Array.from(e.dataTransfer.files))
        }}
      >
        <span className="thumb">{thumb}</span>
        <span className="copy">
          <strong>{title}</strong>
          <small>{hint}</small>
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
    </>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function OperativeIDPage() {
  const rootRef  = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef  = useRef<HTMLDivElement>(null)

  const [name, setName]               = useState('')
  const [team, setTeam]               = useState('')
  const [role, setRole]               = useState<Role>('member')
  const [photoSrc, setPhotoSrc]       = useState('')
  const [generated, setGenerated]     = useState(false)
  const [flipped, setFlipped]         = useState(false)
  const [kick, setKick]               = useState(0)
  const [heroIdx, setHeroIdx]         = useState(() => Math.floor(Math.random() * HEROES.length))
  const [faces, setFaces]             = useState<{ front?: HTMLCanvasElement; back?: HTMLCanvasElement }>({})
  const [error, setError]             = useState('')
  const [busy, setBusy]               = useState(false)
  const [loadingPhoto, setLoadingPhoto] = useState(false)

  const sponsors       = SPONSOR_LOGOS.slice(0, 4)
  const roleInfo       = ROLES.find((r) => r.id === role)!
  const displayName    = name.trim() ? name.trim().toUpperCase() : PLACEHOLDER_NAME
  const displayTeam    = team.trim() ? team.trim().toUpperCase() : PLACEHOLDER_TEAM
  const teamSize       = displayTeam.length > 18 ? 13 : displayTeam.length > 12 ? 15 : 18
  const [evBase, evEdition] = splitEvent(EVENT.name)

  const parts   = displayName.split(/\s+/)
  const surname = parts[parts.length - 1]
  const given   = parts.length > 1 ? parts.slice(0, -1).join(' ') : ''
  const surSize = surname.length > 14 ? 26 : surname.length > 10 ? 34 : 42

  const hero     = generated ? HEROES[heroIdx] : null
  const heroSize = hero ? (hero.code.length > 12 ? 26 : hero.code.length > 9 ? 32 : 40) : 32

  // Entrance
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.oidp-bar', { opacity: 0, y: -10, duration: 0.7 })
        .from('.oidp-h1 .ln > span', { yPercent: 115, duration: 0.9, stagger: 0.14, ease: 'expo.out' }, 0.1)
        .from('.oidp-step', { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, 0.5)
        .from('.oidp-canvas', { opacity: 0, duration: 1.1 }, 0.4)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Re-render the hidden DOM cards into canvases → textures for the 3D card.
  useEffect(() => {
    let dead = false
    const t = window.setTimeout(async () => {
      const f = frontRef.current
      const b = backRef.current
      if (!f || !b) return
      try {
        if (document.fonts?.ready) await document.fonts.ready
        // preview texture keeps the dashed sponsor placeholder visible; the PNG export hides it
        const opts = { pixelRatio: 2, width: CARD_W, height: CARD_H, style: { transform: 'none', margin: '0' } }
        const [fc, bc] = await Promise.all([toCanvas(f, opts), toCanvas(b, opts)])
        if (!dead) setFaces({ front: fc, back: bc })
      } catch {
        /* keep the previous textures */
      }
    }, 250)
    return () => { dead = true; window.clearTimeout(t) }
  }, [name, team, role, photoSrc, generated, heroIdx])

  const readPortrait = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    const bad = checkImage(file, 12)
    if (bad) return setError(bad)
    setLoadingPhoto(true)
    try {
      setPhotoSrc(await processPhoto(await fileToDataUrl(file)))
      setError('')
    } catch {
      setError('Could not read that image. Try another one.')
    } finally {
      setLoadingPhoto(false)
    }
  }

  const issue = () => {
    if (!name.trim()) return setError('Enter your full name first.')
    if (!team.trim()) return setError('Enter your team name.')
    if (!photoSrc) return setError('Add a portrait to issue your ID.')
    // new Avenger on every re-issue
    setHeroIdx((h) => (generated ? (h + 1 + Math.floor(Math.random() * (HEROES.length - 1))) % HEROES.length : h))
    setGenerated(true)
    setFlipped(false)
    setKick((k) => k + 1)
    setError('')
    if (window.innerWidth < 900) {
      document.querySelector('.oidp-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  /** One PNG: front and back side by side, each at 4× (1360×2160). */
  const download = async () => {
    const f = frontRef.current
    const b = backRef.current
    if (!f || !b || !generated) return
    setBusy(true)
    setError('')
    try {
      if (document.fonts?.ready) await document.fonts.ready
      const opts = { pixelRatio: 4, cacheBust: true, width: CARD_W, height: CARD_H, style: { transform: 'none', margin: '0' }, filter: exportFilter }
      const [fc, bc] = await Promise.all([toCanvas(f, opts), toCanvas(b, opts)])
      const gap = 160
      const out = document.createElement('canvas')
      out.width = fc.width + gap + bc.width
      out.height = Math.max(fc.height, bc.height)
      const ctx = out.getContext('2d')
      if (!ctx) throw new Error('no canvas')
      ctx.drawImage(fc, 0, 0)
      ctx.drawImage(bc, fc.width + gap, 0)
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'operative'
      const a = document.createElement('a')
      a.download = `operative-id-${slug}.png`
      a.href = out.toDataURL('image/png')
      a.click()
    } catch {
      setError('Could not render the PNG. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={rootRef} className="oidp">
      <nav className="oidp-bar" aria-label="Page">
        <a href="/" className="oidp-back">← BACK TO THE MISSION</a>
        <span className="oidp-bar-ev">{evBase} <b>{evEdition}</b></span>
      </nav>

      <main className="oidp-main">
        {/* ── left ── */}
        <div className="oidp-left">
          <h1 className="oidp-h1" aria-label="Access granted — your operative ID">
            <span className="ln small"><span>ACCESS GRANTED —</span></span>
            <span className="ln big"><span>YOUR OPERATIVE <em>ID</em></span></span>
          </h1>
          <p className="oidp-sub">
            Name, face, done. Thirty seconds and you've got a credential worth posting.
          </p>

          <ol className="oidp-steps">
            <li className="oidp-step">
              <span className="n">01</span>
              <div className="f">
                <label htmlFor="oidp-name">Full name</label>
                <input id="oidp-name" type="text" value={name} maxLength={28} autoComplete="name" placeholder="Your Name" onChange={(e) => setName(e.target.value)} />
              </div>
            </li>

            <li className="oidp-step">
              <span className="n">02</span>
              <div className="f">
                <label htmlFor="oidp-team">Team name</label>
                <input id="oidp-team" type="text" value={team} maxLength={24} placeholder="Your Team" onChange={(e) => setTeam(e.target.value)} />
              </div>
            </li>

            <li className="oidp-step">
              <span className="n">03</span>
              <div className="f">
                <label id="oidp-pos-l">Position</label>
                <div className="oidp-seg" role="radiogroup" aria-labelledby="oidp-pos-l">
                  {ROLES.map((r) => (
                    <button key={r.id} type="button" role="radio" aria-checked={role === r.id} onClick={() => setRole(r.id)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </li>

            <li className="oidp-step">
              <span className="n">04</span>
              <div className="f">
                <label>Portrait</label>
                <Drop
                  ariaLabel="Choose a portrait photo"
                  title={loadingPhoto ? 'Processing…' : photoSrc ? 'Portrait locked in' : 'Drop a portrait or tap to browse'}
                  hint={photoSrc ? 'Tap to swap it' : 'Face forward, good light, shoulders up'}
                  thumb={photoSrc ? <img src={photoSrc} alt="Your portrait" /> : <i>+</i>}
                  filled={!!photoSrc}
                  onFiles={readPortrait}
                />
              </div>
            </li>

            <li className="oidp-step">
              <span className="n">05</span>
              <div className="f">
                {error && <p className="oidp-error" role="alert">{error}</p>}
                <div className="oidp-actions">
                  <button type="button" className="oidp-btn" onClick={issue}>
                    {generated ? 'RE-ISSUE MY ID' : 'ISSUE MY ID'}
                  </button>
                  <button type="button" className="oidp-btn alt" onClick={download} disabled={!generated || busy}>
                    {busy ? 'RENDERING…' : 'DOWNLOAD PNG'}
                  </button>
                </div>
                <p className="oidp-hint">Your photo never leaves your browser. Re-issuing draws a new Avenger.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* ── right: the lanyard ── */}
        <div className="oidp-desk">
          <span className="oidp-reg tl" /><span className="oidp-reg tr" /><span className="oidp-reg bl" /><span className="oidp-reg br" />
          <div className="oidp-canvas">
            <OperativeLanyard
              front={faces.front}
              back={faces.back}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              label={EVENT.name}
              kick={kick}
            />
          </div>
          {/* caption + flip button: change marginTop to move this group up/down */}
          <div className="oidp-meta" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <p className="oidp-caption" style={{ margin: 0 }}>
              {generated ? 'ISSUED — DRAG TO SWING · CLICK TO FLIP' : 'LIVE PREVIEW — DRAG TO SWING · CLICK TO FLIP'}
            </p>
            <button type="button" className="oidp-flipbtn" style={{ margin: 0 }} onClick={() => setFlipped((f) => !f)}>
              {flipped ? '← SHOW FRONT' : 'SHOW BACK →'}
            </button>
          </div>
        </div>
      </main>

      {/* ── hidden render sources (textures + PNG export) ── */}
      <div className="oid-offscreen" aria-hidden="true">
        {/* FRONT */}
        <div ref={frontRef} className="oid-card" style={{ width: CARD_W, height: CARD_H }}>
          <div className="oid-face">
            <AInsignia className="oid-wm" />
            <div className="oid-body">
              <header className="oid-hd">
                <div className="oid-id-left">
                  {EVENT_LOGO_SRC ? (
                    <img className="oid-logo-img" src={EVENT_LOGO_SRC} alt="" />
                  ) : (
                    <div className="oid-word"><span>{evBase}</span>{evEdition && <b>{evEdition}</b>}</div>
                  )}
                  <small>SECURITY CREDENTIAL // LVL 7</small>
                </div>
                <img className="oid-college" src={collegeLogo} alt="" />
              </header>

              <div className="oid-row">
                <div className="oid-photo">
                  <div className="oid-photo-frame">
                    <div className="oid-photo-in">
                      {photoSrc ? (
                        <img src={photoSrc} alt="" />
                      ) : (
                        <svg viewBox="0 0 60 75" className="oid-sil" aria-hidden="true">
                          <circle cx="30" cy="27" r="13" />
                          <path d="M4 75 C4 52 17 46 30 46 C43 46 56 52 56 75 Z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <i className="oid-br tl" /><i className="oid-br tr" /><i className="oid-br bl" /><i className="oid-br br" />
                  {generated && <span className="oid-stamp">CLEARED</span>}
                </div>

                <div className="oid-side">
                  <div className="oid-lvlrow">
                    <span className="oid-lvl">7</span>
                    <small>CLEARANCE<br />LEVEL</small>
                  </div>
                  <div className="oid-fld">
                    <small>TEAM NAME</small>
                    <b className={`team${team.trim() ? '' : ' is-pending'}`} style={{ fontSize: teamSize, lineHeight: `${teamSize - 1}px` }}>{displayTeam}</b>
                  </div>
                  <div className="oid-fld">
                    <small>STATUS</small>
                    <b className={`sm${generated ? '' : ' is-pending'}`}>{generated ? 'ACTIVE' : 'PENDING'}</b>
                  </div>
                  <div className="oid-tail">
                    <ReactorMark className="oid-mark" />
                    <span className="oid-bar" />
                  </div>
                </div>
              </div>

              <div className="oid-nm">
                <small>{given}</small>
                <div style={{ fontSize: surSize }}>{surname}</div>
              </div>

              <div className="oid-facts">
                <div><small>EVENT</small><b>{EVENT.name}</b></div>
                <div><small>DATE</small><b>{EVENT.date}</b></div>
                <div><small>COLLEGE</small><b>{COLLEGE}</b></div>
              </div>
            </div>

            <footer className="oid-partners">
              <p>OFFICIAL MISSION PARTNERS</p>
              {sponsors.length > 0 ? (
                <div className="oid-partners-row">
                  {sponsors.map((src, i) => <div key={i} className="oid-sp"><img src={src} alt="" /></div>)}
                </div>
              ) : (
                <div className="oid-sp-empty" data-noexport="">SPONSOR LOGOS APPEAR HERE</div>
              )}
            </footer>
          </div>
          <span className="oid-slot" />
        </div>

        {/* BACK: Avenger only */}
        <div ref={backRef} className="oid-card" style={{ width: CARD_W, height: CARD_H }}>
          <div className="oid-face">
            <div className="oid-bk">
              <div className="oid-bk-wrap">
                <div className="oid-bk-art">
                  {hero?.img ? (
                    <img src={hero.img} alt="" />
                  ) : (
                    <Glyph k={hero ? hero.glyph : 'unknown'} className="oid-bk-glyph" />
                  )}
                </div>
                <i className="oid-br tl" /><i className="oid-br tr" /><i className="oid-br bl" /><i className="oid-br br" />
              </div>
              <div className="oid-bk-name">
                <small>ASSIGNED ALLY // {roleInfo.label}</small>
                <b style={{ fontSize: heroSize }}>{hero ? hero.code : 'CLASSIFIED'}</b>
                <span>{hero ? hero.real : 'ISSUE YOUR ID TO REVEAL'}</span>
              </div>
              <p
                style={{
                  margin: 0,
                  paddingTop: 8,
                  borderTop: '1px solid rgba(244,236,225,.22)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-head)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '.28em',
                  color: 'var(--cream)',
                  whiteSpace: 'nowrap',
                }}
              >
                {TAGLINE}
              </p>
            </div>
          </div>
          <span className="oid-slot" />
        </div>
      </div>
    </div>
  )
}