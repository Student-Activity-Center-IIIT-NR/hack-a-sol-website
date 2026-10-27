/**
 * src/components/ArtTuner.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Character Art Tuner (?debug=1&art=tune)
 * - Leva controls per track: artHeightVh, artX, artY
 * - Toggle to overlay aiml art box outline for reference comparison
 * - "Copy values" button to print overrides to paste into tracks.ts
 * - Real-time diagnostics: trimmed size, final art height/width in vh/vw, description lines
 */

import { useEffect, useState } from 'react'
import { useControls, button } from 'leva'
import { artTuneStore } from '../utils/artTuneStore'
import { TRACKS } from '../data/tracks'
import characterMeta from '../data/characterMeta.json'

interface CharacterMetaEntry {
  sourceHeight: number
  sourceWidth: number
  trimmedWidth: number
  trimmedHeight: number
  finalWidth: number
  finalHeight: number
  aspect: number
  luminanceMultiplier: number
}

const typedMeta = characterMeta as Record<string, CharacterMetaEntry>

export function ArtTuner() {
  const [active, setActive] = useState(false)
  const [overlayActive, setOverlayActive] = useState(false)
  const [stats, setStats] = useState<Record<string, { lines: number; widthVw: number; heightVh: number }>>({})

  useEffect(() => {
    setActive(artTuneStore.isTuneMode)
    return artTuneStore.subscribe(() => {
      setOverlayActive(artTuneStore.showAimlOverlay)
    })
  }, [])

  // Leva controls
  useControls(
    'Track Character Art Tuner',
    () => ({
      showAimlOverlay: {
        value: false,
        label: 'Overlay aiml Box',
        onChange: (v: boolean) => artTuneStore.setOverlay(v),
      },
      'aiml Height (vh)': {
        value: 92,
        min: 50,
        max: 120,
        step: 1,
        onChange: (v: number) => artTuneStore.set('aiml', { artHeightVh: v }),
      },
      'aiml X (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('aiml', { artX: v }),
      },
      'aiml Y (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('aiml', { artY: v }),
      },
      'cybersec Height (vh)': {
        value: 92,
        min: 50,
        max: 120,
        step: 1,
        onChange: (v: number) => artTuneStore.set('cybersec', { artHeightVh: v }),
      },
      'cybersec X (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('cybersec', { artX: v }),
      },
      'cybersec Y (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('cybersec', { artY: v }),
      },
      'web3 Height (vh)': {
        value: 92,
        min: 50,
        max: 120,
        step: 1,
        onChange: (v: number) => artTuneStore.set('web3', { artHeightVh: v }),
      },
      'web3 X (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('web3', { artX: v }),
      },
      'web3 Y (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('web3', { artY: v }),
      },
      'policy Height (vh)': {
        value: 92,
        min: 50,
        max: 120,
        step: 1,
        onChange: (v: number) => artTuneStore.set('policy', { artHeightVh: v }),
      },
      'policy X (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('policy', { artX: v }),
      },
      'policy Y (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('policy', { artY: v }),
      },
      'open Height (vh)': {
        value: 92,
        min: 50,
        max: 120,
        step: 1,
        onChange: (v: number) => artTuneStore.set('open', { artHeightVh: v }),
      },
      'open X (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('open', { artX: v }),
      },
      'open Y (px)': {
        value: 0,
        min: -200,
        max: 200,
        step: 1,
        onChange: (v: number) => artTuneStore.set('open', { artY: v }),
      },
      'Copy Values': button(() => {
        const vals = artTuneStore.getAll()
        const text = JSON.stringify(vals, null, 2)
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text)
        }
        console.log('[ArtTuner Overrides]:\n', text)
      }),
    }),
    [active]
  )

  // Measure description lines & art sizes in DOM
  useEffect(() => {
    if (!active) return

    const updateStats = () => {
      const next: Record<string, { lines: number; widthVw: number; heightVh: number }> = {}
      const vh = window.innerHeight / 100
      const vw = window.innerWidth / 100

      TRACKS.forEach((t, i) => {
        const slide = document.querySelector(`[data-track-index="${i}"]`)
        if (slide) {
          const descEl = slide.querySelector('p.max-w-md')
          let lineCount = 1
          if (descEl) {
            const rects = descEl.getClientRects()
            lineCount = Math.max(1, rects.length)
          }

          const imgEl = slide.querySelector('[data-character-img="true"]')
          let wVw = 0
          let hVh = 0
          if (imgEl) {
            const r = imgEl.getBoundingClientRect()
            wVw = Number((r.width / vw).toFixed(1))
            hVh = Number((r.height / vh).toFixed(1))
          }
          next[t.id] = { lines: lineCount, widthVw: wVw, heightVh: hVh }
        }
      })
      setStats(next)
    }

    const timer = setInterval(updateStats, 1000)
    updateStats()
    return () => clearInterval(timer)
  }, [active])

  if (!active) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] p-3 rounded bg-black/90 border border-white/20 text-white font-mono text-[10.5px] max-w-sm pointer-events-auto shadow-2xl backdrop-blur-md"
      style={{ lineHeight: 1.4 }}
    >
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/15">
        <span className="font-bold text-amber-400">ART TUNER (?art=tune)</span>
        <span className="text-white/40">Reference: aiml & web3</span>
      </div>

      <div className="space-y-1.5 mb-2">
        {TRACKS.map((t) => {
          const m = typedMeta[t.id]
          const s = stats[t.id]
          return (
            <div key={t.id} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
              <span style={{ color: t.accentColor }} className="font-bold uppercase w-16">
                {t.id}
              </span>
              <span className="text-white/60">
                Trim: {m ? `${m.trimmedWidth}x${m.trimmedHeight}` : '—'}
              </span>
              <span className="text-white/80">
                {s ? `${s.heightVh}vh × ${s.widthVw}vw` : '—'}
              </span>
              <span className={s && s.lines > 3 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {s ? `${s.lines} lines` : '—'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="text-[9.5px] text-white/50 border-t border-white/10 pt-1.5 flex justify-between">
        <span>Aiml overlay: {overlayActive ? 'ON' : 'OFF'}</span>
        <span className="text-white/30">Use Leva panel on top-right</span>
      </div>
    </div>
  )
}
