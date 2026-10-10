/**
 * scripts/prepare-characters.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes all track character PNGs for Hack-A-Sol 5.0:
 * - Reads originals from assets-raw/characters/ (with fallback to public/characters/)
 * - Trims transparent padding (alpha > 16)
 * - Warns if source is under 900px tall or looks like a bust crop (aspect > 0.95)
 * - Normalizes luminance with a multiplier (0.9 to 1.3)
 * - Bakes a soft accent-colored rim light behind the figure (50% opacity, blurred)
 * - Exports WebP at most 1200px tall into public/characters/
 * - Writes src/data/characterMeta.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const RAW_DIR = path.join(ROOT, 'assets-raw', 'characters')
const PUB_DIR = path.join(ROOT, 'public', 'characters')
const META_FILE = path.join(ROOT, 'src', 'data', 'characterMeta.json')

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true })
}
if (!fs.existsSync(PUB_DIR)) {
  fs.mkdirSync(PUB_DIR, { recursive: true })
}

const TRACKS_INFO = [
  { id: 'aiml',     accent: '#60A5FA' },
  { id: 'cybersec', accent: '#EF4444' },
  { id: 'web3',     accent: '#A855F7' },
  { id: 'policy',   accent: '#EAB308' },
  { id: 'open',     accent: '#14B8A6' },
]

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

async function prepare() {
  console.log('[prepare-characters] Starting character art normalization...')

  // Step 1: Ensure raw folder has originals
  for (const t of TRACKS_INFO) {
    const rawPng = path.join(RAW_DIR, `${t.id}.png`)
    const pubPng = path.join(PUB_DIR, `${t.id}.png`)
    if (!fs.existsSync(rawPng) && fs.existsSync(pubPng)) {
      fs.copyFileSync(pubPng, rawPng)
    }
  }

  const metaData = {}

  for (const t of TRACKS_INFO) {
    const { id, accent } = t
    const rgb = hexToRgb(accent)

    // Find source file (PNG preferred)
    let srcPath = path.join(RAW_DIR, `${id}.png`)
    if (!fs.existsSync(srcPath)) {
      srcPath = path.join(RAW_DIR, `${id}.webp`)
    }
    if (!fs.existsSync(srcPath)) {
      srcPath = path.join(PUB_DIR, `${id}.png`)
    }
    if (!fs.existsSync(srcPath)) {
      srcPath = path.join(PUB_DIR, `${id}.webp`)
    }

    if (!fs.existsSync(srcPath)) {
      console.warn(`[prepare-characters] Missing source image for "${id}"!`)
      continue
    }

    console.log(`[prepare-characters] Processing ${id} from ${path.basename(srcPath)}...`)

    // Load raw RGBA
    const srcInstance = sharp(srcPath).ensureAlpha()
    const { data: rawData, info: rawInfo } = await srcInstance.raw().toBuffer({ resolveWithObject: true })
    const { width: srcW, height: srcH } = rawInfo

    // Find bounding box where alpha > 16 & calculate luminance
    let minX = srcW, maxX = 0, minY = srcH, maxY = 0
    let totalLum = 0
    let nonTransCount = 0

    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const idx = (y * srcW + x) * 4
        const a = rawData[idx + 3]
        if (a > 16) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y

          const r = rawData[idx]
          const g = rawData[idx + 1]
          const b = rawData[idx + 2]
          totalLum += 0.299 * r + 0.587 * g + 0.114 * b
          nonTransCount++
        }
      }
    }

    if (minX > maxX || minY > maxY) {
      minX = 0; maxX = srcW - 1; minY = 0; maxY = srcH - 1
    }

    const trimmedW = maxX - minX + 1
    const trimmedH = maxY - minY + 1
    const aspect = Number((trimmedW / trimmedH).toFixed(3))

    // Check warning condition: source under 900px or bust crop (aspect > 0.95)
    if (srcH < 900 || aspect > 0.95) {
      console.warn(
        `[prepare-characters] WARNING: "${id}" source is under 900px tall (${srcH}px) or looks like a bust crop (aspect: ${aspect} > 0.95) — replace with a 3/4-body PNG.`
      )
    }

    // Average luminance
    const avgLum = nonTransCount > 0 ? totalLum / nonTransCount : 100
    // Reference luminance ~ 100
    const targetLum = 100
    let lumMultiplier = Number((targetLum / avgLum).toFixed(2))
    lumMultiplier = Math.max(0.9, Math.min(1.3, lumMultiplier))

    // Extract trimmed region
    let trimmedSharp = sharp(srcPath).extract({
      left: minX,
      top: minY,
      width: trimmedW,
      height: trimmedH,
    })

    // Clamp to at most 1200px tall
    if (trimmedH > 1200) {
      trimmedSharp = trimmedSharp.resize({ height: 1200, fit: 'inside' })
    }

    // Get trimmed buffer
    const { data: tData, info: tInfo } = await trimmedSharp.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width: curW, height: curH } = tInfo

    // Apply luminance multiplier to RGB
    for (let i = 0; i < tData.length; i += 4) {
      if (tData[i + 3] > 16) {
        tData[i]     = Math.min(255, Math.round(tData[i] * lumMultiplier))
        tData[i + 1] = Math.min(255, Math.round(tData[i + 1] * lumMultiplier))
        tData[i + 2] = Math.min(255, Math.round(tData[i + 2] * lumMultiplier))
      }
    }

    // Prepare soft accent-colored rim light:
    // Pad: top: 20px, left: 24px, right: 24px, bottom: 0px (keeping bottom aligned for bleed)
    const padTop = 20
    const padSide = 24
    const padW = curW + padSide * 2
    const padH = curH + padTop

    // Create alpha canvas for rim light
    const alphaBuf = Buffer.alloc(padW * padH, 0)
    for (let y = 0; y < curH; y++) {
      for (let x = 0; x < curW; x++) {
        const srcIdx = (y * curW + x) * 4
        const a = tData[srcIdx + 3]
        const destIdx = (y + padTop) * padW + (x + padSide)
        alphaBuf[destIdx] = a
      }
    }

    // Blur the alpha channel with sharp
    const blurredAlphaBuf = await sharp(alphaBuf, { raw: { width: padW, height: padH, channels: 1 } })
      .blur(14)
      .raw()
      .toBuffer()

    // Tint blurred alpha with accent color at 50% opacity
    const rimBuffer = Buffer.alloc(padW * padH * 4)
    for (let i = 0; i < padW * padH; i++) {
      const a = blurredAlphaBuf[i]
      const outIdx = i * 4
      rimBuffer[outIdx]     = rgb.r
      rimBuffer[outIdx + 1] = rgb.g
      rimBuffer[outIdx + 2] = rgb.b
      // 50% composite intensity
      rimBuffer[outIdx + 3] = Math.round(a * 0.50)
    }

    // Composite figure OVER tinted rim light
    const figureBuffer = await sharp(tData, { raw: { width: curW, height: curH, channels: 4 } }).png().toBuffer()

    const finalImage = await sharp(rimBuffer, { raw: { width: padW, height: padH, channels: 4 } })
      .composite([{
        input: figureBuffer,
        top: padTop,
        left: padSide,
        blend: 'over',
      }])
      .webp({ quality: 90 })
      .toBuffer()

    // Write output webp
    const outPath = path.join(PUB_DIR, `${id}.webp`)
    fs.writeFileSync(outPath, finalImage)
    console.log(`[prepare-characters] Wrote ${outPath} (${padW}x${padH})`)

    metaData[id] = {
      sourceHeight: srcH,
      sourceWidth: srcW,
      trimmedWidth: trimmedW,
      trimmedHeight: trimmedH,
      finalWidth: padW,
      finalHeight: padH,
      aspect,
      luminanceMultiplier: lumMultiplier,
    }
  }

  // Write metadata JSON
  fs.writeFileSync(META_FILE, JSON.stringify(metaData, null, 2))
  console.log(`[prepare-characters] Wrote metadata to ${META_FILE}`)
}

prepare().catch((err) => {
  console.error('[prepare-characters] Error:', err)
  process.exit(1)
})
