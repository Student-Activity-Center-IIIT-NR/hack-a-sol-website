/**
 * scripts/optimize-images.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts every PNG in:
 *   - public/characters
 *   - src/assets/hero-characters
 * to WebP, max 1200px tall, target 150-250 KB.
 *
 * For hero silhouettes:
 *   BAKES the grayscale(0.5) + brightness(0.85) dimming and an edge fade
 *   (radial-gradient ellipse 95% 95% at 50% 25%, black 65%, transparent 100%)
 *   directly into the pixels, so NO runtime CSS filter or mask-image is needed.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const CHARACTERS_DIR = path.join(rootDir, 'public', 'characters')
const HERO_ASSETS_DIR = path.join(rootDir, 'src', 'assets', 'hero-characters')

/**
 * Apply baked grayscale(0.5) + brightness(0.85) + radial edge fade to an RGBA buffer
 */
function bakeSilhouetteEffects(rawBuffer, width, height) {
  const output = Buffer.from(rawBuffer)
  const cx = width * 0.5
  const cy = height * 0.25
  const rx = width * 0.475
  const ry = height * 0.475

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const a = output[idx + 3]
      if (a === 0) continue

      const r = output[idx]
      const g = output[idx + 1]
      const b = output[idx + 2]

      // 1. Grayscale 0.5
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      const rMix = 0.5 * r + 0.5 * gray
      const gMix = 0.5 * g + 0.5 * gray
      const bMix = 0.5 * b + 0.5 * gray

      // 2. Brightness 0.85
      output[idx] = Math.min(255, Math.max(0, Math.round(rMix * 0.85)))
      output[idx + 1] = Math.min(255, Math.max(0, Math.round(gMix * 0.85)))
      output[idx + 2] = Math.min(255, Math.max(0, Math.round(bMix * 0.85)))

      // 3. Edge fade: radial ellipse at (50%, 25%), 65% solid to 100% transparent
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      const dist = Math.sqrt(dx * dx + dy * dy)

      let fade = 1.0
      if (dist >= 1.0) {
        fade = 0.0
      } else if (dist > 0.65) {
        const t = (dist - 0.65) / 0.35
        fade = 1.0 - t * t * (3 - 2 * t) // smoothstep
      }

      output[idx + 3] = Math.min(255, Math.max(0, Math.round(a * fade)))
    }
  }

  return output
}

/**
 * Encode raw buffer or image to WebP with target 150-250 KB
 */
async function encodeWebP(sharpPipeline) {
  // First test nearLossless high quality
  let buf = await sharpPipeline.clone().webp({ nearLossless: true, quality: 95, effort: 6 }).toBuffer()
  const sizeKB = buf.length / 1024

  // If already under 250 KB, this gives pristine quality
  if (sizeKB <= 250) {
    return buf
  }

  // If over 250 KB, adjust quality down to target 150-250 KB
  for (const q of [90, 85, 80, 75, 70]) {
    buf = await sharpPipeline.clone().webp({ quality: q, effort: 6 }).toBuffer()
    if (buf.length / 1024 <= 245) {
      break
    }
  }

  return buf
}

async function processFile(filePath, isHeroAsset) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext !== '.png') return

  const dir = path.dirname(filePath)
  const baseName = path.basename(filePath, ext)
  const statBefore = fs.statSync(filePath)
  const sizeBeforeKB = (statBefore.size / 1024).toFixed(1)

  // Load and resize to max 1200px tall
  const metadata = await sharp(filePath).metadata()
  const needsResize = metadata.height && metadata.height > 1200

  let pipeline = sharp(filePath)
  if (needsResize) {
    pipeline = pipeline.resize({ height: 1200, withoutEnlargement: true })
  }

  if (isHeroAsset) {
    // Hero character asset: bake effects directly into WebP
    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    const baked = bakeSilhouetteEffects(data, info.width, info.height)
    const outPipeline = sharp(baked, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })

    const webpBuffer = await encodeWebP(outPipeline)
    const outPath = path.join(dir, `${baseName}.webp`)
    fs.writeFileSync(outPath, webpBuffer)
    const sizeAfterKB = (webpBuffer.length / 1024).toFixed(1)

    console.log(
      `[Hero Silhouette] ${baseName}.png (${sizeBeforeKB} KB) -> ${baseName}.webp (${sizeAfterKB} KB, ${info.width}x${info.height}) [baked filter+mask]`
    )
  } else {
    // public/characters:
    // 1. Regular clean WebP for track chapters (CharacterArt)
    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    const cleanPipeline = sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
    const cleanWebp = await encodeWebP(cleanPipeline)
    const cleanOutPath = path.join(dir, `${baseName}.webp`)
    fs.writeFileSync(cleanOutPath, cleanWebp)
    const cleanSizeKB = (cleanWebp.length / 1024).toFixed(1)

    // 2. Silhouette WebP for Hero section with baked effects
    const baked = bakeSilhouetteEffects(data, info.width, info.height)
    const silhouettePipeline = sharp(baked, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
    const silhouetteWebp = await encodeWebP(silhouettePipeline)
    const silhouetteOutPath = path.join(dir, `${baseName}-silhouette.webp`)
    fs.writeFileSync(silhouetteOutPath, silhouetteWebp)
    const silSizeKB = (silhouetteWebp.length / 1024).toFixed(1)

    console.log(
      `[Track Art]       ${baseName}.png (${sizeBeforeKB} KB) -> ${baseName}.webp (${cleanSizeKB} KB, ${info.width}x${info.height})`
    )
    console.log(
      `[Hero Silhouette] ${baseName}.png (${sizeBeforeKB} KB) -> ${baseName}-silhouette.webp (${silSizeKB} KB, ${info.width}x${info.height}) [baked filter+mask]`
    )
  }
}

async function main() {
  console.log('--- Optimizing public/characters ---')
  if (fs.existsSync(CHARACTERS_DIR)) {
    const files = fs.readdirSync(CHARACTERS_DIR)
    for (const file of files) {
      if (file.endsWith('.png')) {
        await processFile(path.join(CHARACTERS_DIR, file), false)
      }
    }
  }

  console.log('\n--- Optimizing src/assets/hero-characters ---')
  if (fs.existsSync(HERO_ASSETS_DIR)) {
    const files = fs.readdirSync(HERO_ASSETS_DIR)
    for (const file of files) {
      if (file.endsWith('.png')) {
        await processFile(path.join(HERO_ASSETS_DIR, file), true)
      }
    }
  }

  console.log('\nDone optimizing all images!')
}

main().catch((err) => {
  console.error('Error optimizing images:', err)
  process.exit(1)
})
