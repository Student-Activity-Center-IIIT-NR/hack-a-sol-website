/**
 * scripts/prepare-hero-wall.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Bakes high-fidelity webp assets from the uploaded Marvel wallpaper
 * in src/assets/hero-wall/ into public/hero/.
 * Automatically trims any transparent padding on the sides.
 */

import sharp from 'sharp'
import { readdir, mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT     = resolve(__dirname, '..')
const SRC      = join(ROOT, 'src/assets/hero-wall')
const OUT      = join(ROOT, 'public/hero')
const JSON_OUT = join(ROOT, 'src/data/heroWall.json')

// Find image
const files = (await readdir(SRC)).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
if (files.length === 0) {
  console.error('[hero-wall] ERROR: No image found in src/assets/hero-wall/')
  process.exit(1)
}

const inputPath = join(SRC, files[0])
console.log(`[hero-wall] Processing: ${files[0]}`)

// Check transparency & trim bounding box
const raw = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true })
const { data, info } = raw
const w = info.width, h = info.height

let minX = w, maxX = 0, minY = h, maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const a = data[(y * w + x) * 4 + 3]
    if (a > 20) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

const cropX = minX <= maxX ? minX : 0
const cropY = minY <= maxY ? minY : 0
const cropW = minX <= maxX ? (maxX - minX + 1) : w
const cropH = minY <= maxY ? (maxY - minY + 1) : h

console.log(`[hero-wall] Original: ${w}x${h}, Trimmed: ${cropW}x${cropH} (at x=${cropX}, y=${cropY})`)
const aspect = cropW / cropH

if (!existsSync(OUT)) await mkdir(OUT, { recursive: true })

// 1. High-fidelity main wallpaper (2560px wide)
const mainW = Math.min(cropW, 2560)
const mainH = Math.round(mainW / aspect)

console.log(`[hero-wall] Baking hero-wall-main.webp (${mainW}x${mainH})...`)
await sharp(inputPath)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(mainW, mainH, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
  .webp({ quality: 88, effort: 4 })
  .toFile(join(OUT, 'hero-wall-main.webp'))

// Also write to wall-back.webp for backwards compatibility
await sharp(inputPath)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(mainW, mainH, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
  .webp({ quality: 88, effort: 4 })
  .toFile(join(OUT, 'wall-back.webp'))

// 2. High-res mobile / tablet version (1440px wide)
const mobW = 1440
const mobH = Math.round(mobW / aspect)
console.log(`[hero-wall] Baking hero-wall-mobile.webp (${mobW}x${mobH})...`)
await sharp(inputPath)
  .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
  .resize(mobW, mobH, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
  .webp({ quality: 86, effort: 4 })
  .toFile(join(OUT, 'hero-wall-mobile.webp'))

// 3. Write metadata
const json = {
  aspect: parseFloat(aspect.toFixed(4)),
  source: { width: cropW, height: cropH, file: files[0] },
  main: '/hero/hero-wall-main.webp',
  mobile: '/hero/hero-wall-mobile.webp',
}
await writeFile(JSON_OUT, JSON.stringify(json, null, 2))
console.log('[hero-wall] Done successfully.')
