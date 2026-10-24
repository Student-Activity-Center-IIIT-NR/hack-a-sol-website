/**
 * scripts/prepare-characters.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Alpha cleanup, normalization, and rim light generation for Hack-A-Sol 5.0:
 * - Reads originals from assets-raw/characters/ (with fallback to public/characters/)
 * - Background keying fallback (flood-fill if baked background detected)
 * - De-matte: alpha < 48 -> 0; 48..255 linearly remapped to 0..255
 * - Connected components on alpha > 96: keep largest + any > 4% of largest, zero rest
 * - Dilate kept mask by 2px and feather by 1.2px
 * - Trim to figure bounding box (max height 1200px)
 * - Luminance normalization (0.9 to 1.3x)
 * - Baked accent rim light generated ONLY from cleaned alpha (blur 18px, accent tint at 40%)
 * - Exports WebP into public/characters/
 * - Performs safety check: exits with code 1 if residual box or >3% near-trans outside main component
 * - Updates src/data/characterMeta.json
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

/** Compute alpha diagnostic stats */
function computeAlphaStats(data, W, H) {
  const total = W * H
  let c1_254 = 0
  let c1_60 = 0
  let minX0 = W, maxX0 = -1, minY0 = H, maxY0 = -1
  let minX128 = W, maxX128 = -1, minY128 = H, maxY128 = -1

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = data[(y * W + x) * 4 + 3]
      if (a >= 1 && a <= 254) c1_254++
      if (a >= 1 && a <= 60) c1_60++
      if (a > 0) {
        if (x < minX0) minX0 = x
        if (x > maxX0) maxX0 = x
        if (y < minY0) minY0 = y
        if (y > maxY0) maxY0 = y
      }
      if (a > 128) {
        if (x < minX128) minX128 = x
        if (x > maxX128) maxX128 = x
        if (y < minY128) minY128 = y
        if (y > maxY128) maxY128 = y
      }
    }
  }

  // Detect straight horizontal edges (rows where alpha jumps from 0 to constant value across > 40% of width)
  const straightEdges = []
  for (let y = 1; y < H; y++) {
    let jumpCount = 0
    let jumpVal = null
    let isConstant = true
    for (let x = 0; x < W; x++) {
      const aPrev = data[((y - 1) * W + x) * 4 + 3]
      const aCurr = data[(y * W + x) * 4 + 3]
      if (aPrev === 0 && aCurr > 0) {
        if (jumpVal === null) jumpVal = aCurr
        else if (jumpVal !== aCurr) isConstant = false
        jumpCount++
      }
    }
    if (jumpCount >= 0.4 * W && isConstant) {
      straightEdges.push(`Row ${y}: jump 0->${jumpVal} over ${jumpCount}/${W} px (${(jumpCount/W*100).toFixed(1)}%)`)
    }
  }

  // Detect straight vertical edges (columns where alpha jumps from 0 to constant value across > 40% of height)
  for (let x = 1; x < W; x++) {
    let jumpCount = 0
    let jumpVal = null
    let isConstant = true
    for (let y = 0; y < H; y++) {
      const aPrev = data[(y * W + x - 1) * 4 + 3]
      const aCurr = data[(y * W + x) * 4 + 3]
      if (aPrev === 0 && aCurr > 0) {
        if (jumpVal === null) jumpVal = aCurr
        else if (jumpVal !== aCurr) isConstant = false
        jumpCount++
      }
    }
    if (jumpCount >= 0.4 * H && isConstant) {
      straightEdges.push(`Col ${x}: jump 0->${jumpVal} over ${jumpCount}/${H} px (${(jumpCount/H*100).toFixed(1)}%)`)
    }
  }

  // Also check if any row or column has a constant alpha streak across > 40% of dimension (for alpha between 1 and 254)
  for (let y = 0; y < H; y++) {
    const valCounts = {}
    for (let x = 0; x < W; x++) {
      const a = data[(y * W + x) * 4 + 3]
      if (a > 0 && a < 255) valCounts[a] = (valCounts[a] || 0) + 1
    }
    for (const [v, cnt] of Object.entries(valCounts)) {
      if (cnt >= 0.4 * W) {
        straightEdges.push(`Row ${y}: constant alpha ${v} across ${cnt}/${W} px (${(cnt/W*100).toFixed(1)}%)`)
      }
    }
  }
  for (let x = 0; x < W; x++) {
    const valCounts = {}
    for (let y = 0; y < H; y++) {
      const a = data[(y * W + x) * 4 + 3]
      if (a > 0 && a < 255) valCounts[a] = (valCounts[a] || 0) + 1
    }
    for (const [v, cnt] of Object.entries(valCounts)) {
      if (cnt >= 0.4 * H) {
        straightEdges.push(`Col ${x}: constant alpha ${v} across ${cnt}/${H} px (${(cnt/H*100).toFixed(1)}%)`)
      }
    }
  }

  return {
    width: W,
    height: H,
    total,
    pct1_254: Number(((c1_254 / total) * 100).toFixed(2)),
    pct1_60: Number(((c1_60 / total) * 100).toFixed(2)),
    count1_254: c1_254,
    count1_60: c1_60,
    bbox0: [minX0, minY0, maxX0, maxY0],
    bbox128: [minX128, minY128, maxX128, maxY128],
    straightEdges,
  }
}

async function prepare() {
  console.log('[prepare-characters] Starting character art alpha cleanup and normalization...\n')

  // Step 1: Ensure raw folder has originals copied if missing
  for (const t of TRACKS_INFO) {
    const rawPng = path.join(RAW_DIR, `${t.id}.png`)
    const pubPng = path.join(PUB_DIR, `${t.id}.png`)
    if (!fs.existsSync(rawPng) && fs.existsSync(pubPng)) {
      fs.copyFileSync(pubPng, rawPng)
    }
  }

  const metaData = {}
  const preStats = {}
  const postStats = {}
  let hasFailure = false

  for (const t of TRACKS_INFO) {
    const { id, accent } = t

    // Locate source file: prefer assets-raw/characters/<id>.*
    let srcPath = path.join(RAW_DIR, `${id}.png`)
    if (!fs.existsSync(srcPath)) srcPath = path.join(RAW_DIR, `${id}.webp`)
    if (!fs.existsSync(srcPath)) srcPath = path.join(RAW_DIR, `${id}.jpg`)
    if (!fs.existsSync(srcPath)) srcPath = path.join(PUB_DIR, `${id}.png`)
    if (!fs.existsSync(srcPath)) srcPath = path.join(PUB_DIR, `${id}.webp`)

    if (!fs.existsSync(srcPath)) {
      console.warn(`[prepare-characters] Missing source image for "${id}"!`)
      continue
    }

    console.log(`─────────────────────────────────────────────────────────────────`)
    console.log(`[prepare-characters] Processing "${id}" from: ${path.relative(ROOT, srcPath)}`)

    const srcInstance = sharp(srcPath).ensureAlpha()
    const { data: rawData, info: rawInfo } = await srcInstance.raw().toBuffer({ resolveWithObject: true })
    const { width: srcW, height: srcH } = rawInfo

    // ── DIAGNOSTIC: Pre-cleanup stats ──
    const pre = computeAlphaStats(rawData, srcW, srcH)
    preStats[id] = pre
    console.log(`[DIAGNOSIS PRE-CLEANUP: ${id}]`)
    console.log(`  Dimensions: ${pre.width}x${pre.height}`)
    console.log(`  Alpha 1..254: ${pre.pct1_254}% (${pre.count1_254} px)`)
    console.log(`  Alpha 1..60:  ${pre.pct1_60}% (${pre.count1_60} px)`)
    console.log(`  BBox alpha > 0:   [${pre.bbox0.join(', ')}] (${pre.bbox0[2] - pre.bbox0[0] + 1}x${pre.bbox0[3] - pre.bbox0[1] + 1})`)
    console.log(`  BBox alpha > 128: [${pre.bbox128.join(', ')}] (${pre.bbox128[2] - pre.bbox128[0] + 1}x${pre.bbox128[3] - pre.bbox128[1] + 1})`)
    console.log(`  Straight edges:   ${pre.straightEdges.length ? pre.straightEdges.join('; ') : 'None detected'}`)

    // ── 1. BACKGROUND-COLOR KEYING FALLBACK ──
    const sampleCoords = [
      [0, 0], [srcW - 1, 0], [0, srcH - 1], [srcW - 1, srcH - 1],
      [Math.floor(srcW / 2), 0], [Math.floor(srcW / 2), srcH - 1],
      [0, Math.floor(srcH / 2)], [srcW - 1, Math.floor(srcH / 2)],
    ]
    const samples = sampleCoords.map(([x, y]) => {
      const idx = (y * srcW + x) * 4
      return [rawData[idx], rawData[idx + 1], rawData[idx + 2], rawData[idx + 3]]
    })
    const opaqueSamples = samples.filter((s) => s[3] > 220)
    let workingBuffer = Buffer.from(rawData)

    if (opaqueSamples.length >= 6) {
      const avgR = opaqueSamples.reduce((sum, s) => sum + s[0], 0) / opaqueSamples.length
      const avgG = opaqueSamples.reduce((sum, s) => sum + s[1], 0) / opaqueSamples.length
      const avgB = opaqueSamples.reduce((sum, s) => sum + s[2], 0) / opaqueSamples.length
      const allWithinTol = opaqueSamples.every(
        (s) => Math.hypot(s[0] - avgR, s[1] - avgG, s[2] - avgB) <= 28
      )
      if (allWithinTol) {
        console.log(`  [Keying Fallback] Dominant baked background detected (${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)}), flood-filling...`)
        const visited = new Uint8Array(srcW * srcH)
        const queue = []
        for (let x = 0; x < srcW; x++) {
          queue.push(x, (srcH - 1) * srcW + x)
        }
        for (let y = 0; y < srcH; y++) {
          queue.push(y * srcW, y * srcW + srcW - 1)
        }
        let head = 0
        while (head < queue.length) {
          const idx = queue[head++]
          if (visited[idx]) continue
          visited[idx] = 1
          const pIdx = idx * 4
          const dist = Math.hypot(
            workingBuffer[pIdx] - avgR,
            workingBuffer[pIdx + 1] - avgG,
            workingBuffer[pIdx + 2] - avgB
          )
          if (dist <= 28) {
            workingBuffer[pIdx + 3] = 0
            const cx = idx % srcW
            const cy = Math.floor(idx / srcW)
            if (cx > 0) queue.push(idx - 1)
            if (cx < srcW - 1) queue.push(idx + 1)
            if (cy > 0) queue.push(idx - srcW)
            if (cy < srcH - 1) queue.push(idx + srcW)
          }
        }
      }
    }

    // ── 2. DE-MATTE: alpha < 48 -> 0; 48..255 linearly mapped to 0..255 ──
    const dematted = Buffer.from(workingBuffer)
    for (let i = 0; i < srcW * srcH; i++) {
      const a = dematted[i * 4 + 3]
      if (a < 48) {
        dematted[i * 4 + 3] = 0
      } else {
        dematted[i * 4 + 3] = Math.min(255, Math.max(0, Math.round(((a - 48) / (255 - 48)) * 255)))
      }
    }

    // ── 3. CONNECTED COMPONENTS ON alpha > 96 ──
    // Keep largest + any component > 4% of largest, zero everything else
    const labels = new Int32Array(srcW * srcH).fill(0)
    let currentLabel = 0
    const compSizes = [0]

    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const idx = y * srcW + x
        if (dematted[idx * 4 + 3] > 96 && labels[idx] === 0) {
          currentLabel++
          let size = 0
          const queue = [idx]
          labels[idx] = currentLabel
          let head = 0
          while (head < queue.length) {
            const curr = queue[head++]
            size++
            const cx = curr % srcW
            const cy = Math.floor(curr / srcW)

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue
                const nx = cx + dx
                const ny = cy + dy
                if (nx >= 0 && nx < srcW && ny >= 0 && ny < srcH) {
                  const nidx = ny * srcW + nx
                  if (dematted[nidx * 4 + 3] > 96 && labels[nidx] === 0) {
                    labels[nidx] = currentLabel
                    queue.push(nidx)
                  }
                }
              }
            }
          }
          compSizes.push(size)
        }
      }
    }

    const maxSize = Math.max(...compSizes)
    const thresholdSize = maxSize * 0.04
    const keptLabels = new Set()
    for (let l = 1; l < compSizes.length; l++) {
      if (compSizes[l] >= thresholdSize) keptLabels.add(l)
    }

    // Create binary mask of kept components
    const mask = Buffer.alloc(srcW * srcH, 0)
    for (let i = 0; i < srcW * srcH; i++) {
      if (keptLabels.has(labels[i])) mask[i] = 255
    }

    // Dilate kept mask by 2px (Euclidean radius ~ 2.2px)
    const dilated = Buffer.alloc(srcW * srcH, 0)
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        if (mask[y * srcW + x] === 255) {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (dx * dx + dy * dy <= 5) {
                const ny = y + dy
                const nx = x + dx
                if (nx >= 0 && nx < srcW && ny >= 0 && ny < srcH) {
                  dilated[ny * srcW + nx] = 255
                }
              }
            }
          }
        }
      }
    }

    // Feather kept mask by 1.2px
    const feathered = await sharp(dilated, { raw: { width: srcW, height: srcH, channels: 1 } })
      .blur(1.2)
      .toColourspace('b-w')
      .raw()
      .toBuffer()

    // Apply feather mask to dematted image (zeros specks & ghost boxes outside figure)
    for (let i = 0; i < srcW * srcH; i++) {
      const f = feathered[i] / 255
      dematted[i * 4 + 3] = Math.round(dematted[i * 4 + 3] * f)
    }

    // ── 4. TRIM TO FIGURE BOUNDING BOX ──
    let minX = srcW, maxX = 0, minY = srcH, maxY = 0
    let nonTransCount = 0
    let totalLum = 0

    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const idx = (y * srcW + x) * 4
        const a = dematted[idx + 3]
        if (a > 0) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y

          const r = dematted[idx]
          const g = dematted[idx + 1]
          const b = dematted[idx + 2]
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

    // Luminance normalization
    const avgLum = nonTransCount > 0 ? totalLum / nonTransCount : 100
    let lumMultiplier = Number((100 / avgLum).toFixed(2))
    lumMultiplier = Math.max(0.9, Math.min(1.3, lumMultiplier))

    // Extract trimmed figure
    let trimmedSharp = sharp(dematted, { raw: { width: srcW, height: srcH, channels: 4 } })
      .extract({ left: minX, top: minY, width: trimmedW, height: trimmedH })

    // Clamp to at most 1200px tall
    if (trimmedH > 1200) {
      trimmedSharp = trimmedSharp.resize({ height: 1200, fit: 'inside' })
    }

    const { data: tData, info: tInfo } = await trimmedSharp.raw().toBuffer({ resolveWithObject: true })
    const { width: curW, height: curH } = tInfo

    // Apply luminance multiplier to RGB
    for (let i = 0; i < tData.length; i += 4) {
      if (tData[i + 3] > 0) {
        tData[i]     = Math.min(255, Math.round(tData[i] * lumMultiplier))
        tData[i + 1] = Math.min(255, Math.round(tData[i + 1] * lumMultiplier))
        tData[i + 2] = Math.min(255, Math.round(tData[i + 2] * lumMultiplier))
      }
    }

    // ── 5. BAKED ACCENT RIM LIGHT (ONLY FROM CLEANED ALPHA) ──
    // blur radius 18px, accent tint 40%
    const padTop = 24
    const padSide = 32
    const padW = curW + padSide * 2
    const padH = curH + padTop

    const alphaBuf = Buffer.alloc(padW * padH, 0)
    for (let y = 0; y < curH; y++) {
      for (let x = 0; x < curW; x++) {
        const srcIdx = (y * curW + x) * 4
        const a = tData[srcIdx + 3]
        const destIdx = (y + padTop) * padW + (x + padSide)
        alphaBuf[destIdx] = a
      }
    }

    // Crucial: toColourspace('b-w') prevents sharp blur from expanding to 3-channel sRGB
    const blurredAlphaBuf = await sharp(alphaBuf, { raw: { width: padW, height: padH, channels: 1 } })
      .blur(18)
      .toColourspace('b-w')
      .raw()
      .toBuffer()

    const rgb = hexToRgb(accent)
    const rimBuffer = Buffer.alloc(padW * padH * 4)
    for (let i = 0; i < padW * padH; i++) {
      const a = blurredAlphaBuf[i]
      const outIdx = i * 4
      rimBuffer[outIdx]     = rgb.r
      rimBuffer[outIdx + 1] = rgb.g
      rimBuffer[outIdx + 2] = rgb.b
      rimBuffer[outIdx + 3] = Math.round(a * 0.40)
    }

    const figureBuffer = await sharp(tData, { raw: { width: curW, height: curH, channels: 4 } }).png().toBuffer()

    const finalImageBuffer = await sharp(rimBuffer, { raw: { width: padW, height: padH, channels: 4 } })
      .composite([{
        input: figureBuffer,
        top: padTop,
        left: padSide,
        blend: 'over',
      }])
      .webp({ quality: 90 })
      .toBuffer()

    // Write final WebP
    const outPath = path.join(PUB_DIR, `${id}.webp`)
    fs.writeFileSync(outPath, finalImageBuffer)
    console.log(`  Wrote ${outPath} (${padW}x${padH})`)

    // ── 6. SAFETY CHECK: Post-cleanup verification ──
    const verifyInstance = sharp(finalImageBuffer).ensureAlpha()
    const { data: finalRawData, info: finalRawInfo } = await verifyInstance.raw().toBuffer({ resolveWithObject: true })
    const post = computeAlphaStats(finalRawData, finalRawInfo.width, finalRawInfo.height)
    postStats[id] = post

    // Count pixels with alpha 1..60 outside the main component
    // Find largest connected component of alpha > 0 in final image
    const vLabels = new Int32Array(padW * padH).fill(0)
    let vLabel = 0
    const vSizes = [0]
    for (let y = 0; y < padH; y++) {
      for (let x = 0; x < padW; x++) {
        const idx = y * padW + x
        if (finalRawData[idx * 4 + 3] > 0 && vLabels[idx] === 0) {
          vLabel++
          let size = 0
          const q = [idx]
          vLabels[idx] = vLabel
          let qHead = 0
          while (qHead < q.length) {
            const curr = q[qHead++]
            size++
            const cx = curr % padW
            const cy = Math.floor(curr / padW)
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue
                const nx = cx + dx
                const ny = cy + dy
                if (nx >= 0 && nx < padW && ny >= 0 && ny < padH) {
                  const nidx = ny * padW + nx
                  if (finalRawData[nidx * 4 + 3] > 0 && vLabels[nidx] === 0) {
                    vLabels[nidx] = vLabel
                    q.push(nidx)
                  }
                }
              }
            }
          }
          vSizes.push(size)
        }
      }
    }

    let mainVLabel = 1
    let maxVSize = 0
    for (let l = 1; l < vSizes.length; l++) {
      if (vSizes[l] > maxVSize) {
        maxVSize = vSizes[l]
        mainVLabel = l
      }
    }

    let outsideNearTransCount = 0
    for (let i = 0; i < padW * padH; i++) {
      if (vLabels[i] !== mainVLabel) {
        const a = finalRawData[i * 4 + 3]
        if (a >= 1 && a <= 60) outsideNearTransCount++
      }
    }
    const pctOutsideNearTrans = Number(((outsideNearTransCount / (padW * padH)) * 100).toFixed(2))

    console.log(`[DIAGNOSIS POST-CLEANUP: ${id}]`)
    console.log(`  Final Dimensions: ${post.width}x${post.height}`)
    console.log(`  Alpha 1..254:     ${post.pct1_254}% (${post.count1_254} px)`)
    console.log(`  Alpha 1..60:      ${post.pct1_60}% (${post.count1_60} px)`)
    console.log(`  BBox alpha > 0:   [${post.bbox0.join(', ')}] (${post.bbox0[2] - post.bbox0[0] + 1}x${post.bbox0[3] - post.bbox0[1] + 1})`)
    console.log(`  BBox alpha > 128: [${post.bbox128.join(', ')}] (${post.bbox128[2] - post.bbox128[0] + 1}x${post.bbox128[3] - post.bbox128[1] + 1})`)
    console.log(`  Straight edges:   ${post.straightEdges.length ? post.straightEdges.join('; ') : 'None detected'}`)
    console.log(`  Alpha 1..60 outside main component: ${pctOutsideNearTrans}% (${outsideNearTransCount} px)`)

    // Enforce safety criteria
    if (post.straightEdges.length > 0) {
      console.error(`[SAFETY FAILURE] Character "${id}" has straight-edged residual rectangle: ${post.straightEdges.join('; ')}`)
      hasFailure = true
    }
    if (pctOutsideNearTrans > 3.0) {
      console.error(`[SAFETY FAILURE] Character "${id}" has >3% near-transparent pixels outside main component (${pctOutsideNearTrans}%)!`)
      hasFailure = true
    }

    metaData[id] = {
      sourceHeight: srcH,
      sourceWidth: srcW,
      trimmedWidth: curW,
      trimmedHeight: curH,
      finalWidth: padW,
      finalHeight: padH,
      aspect,
      luminanceMultiplier: lumMultiplier,
    }
  }

  // Save metadata
  fs.writeFileSync(META_FILE, JSON.stringify(metaData, null, 2))
  console.log(`\n[prepare-characters] Wrote metadata to ${META_FILE}`)

  if (hasFailure) {
    console.error('\n[prepare-characters] SAFETY CHECK FAILED: exiting with code 1.')
    process.exit(1)
  }

  console.log('[prepare-characters] All 5 characters cleaned and verified successfully! Zero residual boxes.\n')
}

prepare().catch((err) => {
  console.error('[prepare-characters] Error:', err)
  process.exit(1)
})
