/**
 * scripts/prepare-hero-silhouettes.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * For each track, reads the character image from public/characters/<id>.webp
 * (or .png as fallback):
 *   1. Trims transparent padding (alpha > 16)
 *   2. Keeps only the upper 55% of the trimmed figure (head, shoulders, chest)
 *   3. Turns all RGB to black while keeping alpha unchanged
 *   4. Adds a soft glow in the track's accent color under the figure
 *      (blurred alpha layer tinted at 45% opacity)
 *   5. Fades the bottom 25% of the image to transparent
 *   6. Writes public/hero/sil-<id>.webp at most 700px tall
 *
 * Skips any missing or baked-background file with a console.warn.
 * Run:  npm run prepare:hero-sil
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const CHAR_DIR = path.join(ROOT, 'public', 'characters')
const OUT_DIR  = path.join(ROOT, 'public', 'hero')

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

/** Track info must match the order in src/data/tracks.ts */
const TRACKS_INFO = [
  { id: 'aiml',     accent: '#60A5FA' },
  { id: 'cybersec', accent: '#EF4444' },
  { id: 'web3',     accent: '#A855F7' },
  { id: 'policy',   accent: '#EAB308' },
  { id: 'open',     accent: '#14B8A6' },
]

const MAX_HEIGHT = 700

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

/**
 * Returns true if the image appears to have a baked / opaque background.
 * Samples 6 corners/edges; if fewer than 2 are transparent it's likely baked.
 */
function looksLikeBakedBackground(data, width, height) {
  const positions = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [0, Math.floor(height / 2)],
  ]
  let transparentCount = 0
  for (const [x, y] of positions) {
    if (data[(y * width + x) * 4 + 3] < 16) transparentCount++
  }
  return transparentCount < 2
}

async function prepare() {
  console.log('[prepare-hero-silhouettes] Starting silhouette generation...')

  for (const t of TRACKS_INFO) {
    const { id, accent } = t
    const rgb = hexToRgb(accent)

    // Find source file
    let srcPath = path.join(CHAR_DIR, `${id}.webp`)
    if (!fs.existsSync(srcPath)) srcPath = path.join(CHAR_DIR, `${id}.png`)
    if (!fs.existsSync(srcPath)) {
      console.warn(`[prepare-hero-silhouettes] SKIP "${id}": no source image found`)
      continue
    }

    console.log(`[prepare-hero-silhouettes] Processing ${id}...`)

    // Load as RGBA
    const { data: rawData, info: rawInfo } = await sharp(srcPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width: srcW, height: srcH } = rawInfo

    // Check for baked background
    if (looksLikeBakedBackground(rawData, srcW, srcH)) {
      console.warn(
        `[prepare-hero-silhouettes] SKIP "${id}": image appears to have a baked/opaque background. ` +
        `Replace with a transparent PNG for proper silhouettes.`
      )
      continue
    }

    // Step 1: Find bounding box where alpha > 16
    let minX = srcW, maxX = 0, minY = srcH, maxY = 0
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const a = rawData[(y * srcW + x) * 4 + 3]
        if (a > 16) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (minX > maxX || minY > maxY) {
      console.warn(`[prepare-hero-silhouettes] SKIP "${id}": image is fully transparent.`)
      continue
    }

    const trimW = maxX - minX + 1
    const trimH = maxY - minY + 1

    // Step 2: Keep upper 55% of the figure
    const keepH = Math.ceil(trimH * 0.55)

    // Step 3: Extract cropped region, resize to max 700px tall
    let workSharp = sharp(srcPath)
      .ensureAlpha()
      .extract({ left: minX, top: minY, width: trimW, height: keepH })

    if (keepH > MAX_HEIGHT) {
      workSharp = workSharp.resize({ height: MAX_HEIGHT, fit: 'inside' })
    }

    const { data: croppedData, info: croppedInfo } = await workSharp
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width: curW, height: curH } = croppedInfo

    // Step 4: Convert to black silhouette, fade bottom 25%
    const fadeStartY = Math.floor(curH * 0.75)
    const silData = Buffer.alloc(curW * curH * 4)

    for (let y = 0; y < curH; y++) {
      for (let x = 0; x < curW; x++) {
        const idx = (y * curW + x) * 4
        const origAlpha = croppedData[idx + 3]

        let alpha = origAlpha
        if (y >= fadeStartY) {
          const fadeProgress = (y - fadeStartY) / (curH - fadeStartY)
          alpha = Math.round(origAlpha * (1 - fadeProgress))
        }

        silData[idx]     = 0
        silData[idx + 1] = 0
        silData[idx + 2] = 0
        silData[idx + 3] = alpha
      }
    }

    // Step 5: Create accent glow layer (padded, blurred alpha tinted at 45%)
    const padTop  = 30
    const padSide = 40
    const glowW   = curW + padSide * 2
    const glowH   = curH + padTop

    const alphaBuf = Buffer.alloc(glowW * glowH, 0)
    for (let y = 0; y < curH; y++) {
      for (let x = 0; x < curW; x++) {
        const a = silData[(y * curW + x) * 4 + 3]
        alphaBuf[(y + padTop) * glowW + (x + padSide)] = a
      }
    }

    const blurredAlpha = await sharp(alphaBuf, {
      raw: { width: glowW, height: glowH, channels: 1 },
    })
      .blur(18)
      .raw()
      .toBuffer()

    const glowBuf = Buffer.alloc(glowW * glowH * 4)
    for (let i = 0; i < glowW * glowH; i++) {
      const a = blurredAlpha[i]
      const o = i * 4
      glowBuf[o]     = rgb.r
      glowBuf[o + 1] = rgb.g
      glowBuf[o + 2] = rgb.b
      glowBuf[o + 3] = Math.round(a * 0.45)
    }

    // Step 6: Composite silhouette OVER glow
    const silPng = await sharp(silData, {
      raw: { width: curW, height: curH, channels: 4 },
    })
      .png()
      .toBuffer()

    const finalBuf = await sharp(glowBuf, {
      raw: { width: glowW, height: glowH, channels: 4 },
    })
      .composite([{ input: silPng, top: padTop, left: padSide, blend: 'over' }])
      .webp({ quality: 90 })
      .toBuffer()

    const outPath = path.join(OUT_DIR, `sil-${id}.webp`)
    fs.writeFileSync(outPath, finalBuf)
    console.log(`[prepare-hero-silhouettes] Wrote ${outPath} (${glowW}x${glowH})`)
  }

  console.log('[prepare-hero-silhouettes] Done.')
}

prepare().catch((err) => {
  console.error('[prepare-hero-silhouettes] Error:', err)
  process.exit(1)
})
