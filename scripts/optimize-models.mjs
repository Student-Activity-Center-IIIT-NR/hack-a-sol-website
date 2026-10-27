#!/usr/bin/env node
/**
 * scripts/optimize-models.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * GLB Compression Pipeline for Hack-A-Sol 5.0.
 *
 * Input:  /assets-raw/models/*.glb
 * Output: /public/models/*.glb (Draco-compressed, WebP textures, ≤1024px)
 *
 * If output is still >3 MB after first pass, retries with 512px textures and
 * mesh simplification (ratio 0.5).
 *
 * Also writes src/data/models.json — a manifest of available optimised models
 * so CharacterStage can check existence at build time.
 *
 * Usage:
 *   npm run optimize:models
 */

import { execSync } from 'node:child_process'
import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dir, '..')

const INPUT_DIR = join(root, 'assets-raw', 'models')
const OUTPUT_DIR = join(root, 'public', 'models')
const MANIFEST = join(root, 'src', 'data', 'models.json')
const MAX_BYTES = 3 * 1024 * 1024  // 3 MB

// Ensure output dir exists
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

// Discover input GLBs
const inputs = existsSync(INPUT_DIR)
  ? readdirSync(INPUT_DIR).filter(f => extname(f).toLowerCase() === '.glb')
  : []

if (inputs.length === 0) {
  console.log('⚠  No .glb files found in assets-raw/models/ — nothing to optimise.')
  console.log('   Drop your source GLBs there and re-run: npm run optimize:models')
  // Write empty manifest so CharacterStage doesn't crash
  writeFileSync(MANIFEST, JSON.stringify({ available: [] }, null, 2))
  process.exit(0)
}

const GLTF = resolve(root, 'node_modules', '.bin', 'gltf-transform')

/**
 * Run gltf-transform optimize with Draco + WebP textures.
 * The 'optimize' subcommand already handles flatten, prune, simplify, weld.
 */
function optimise(input, output, texSize, simplify = false) {
  const args = [
    `"${GLTF}"`,
    'optimize',
    `"${input}"`,
    `"${output}"`,
    '--compress draco',
    `--texture-size ${texSize}`,
    '--texture-compress webp',
    '--flatten true',
    '--prune true',
    '--weld true',
  ]

  if (simplify) {
    args.push('--simplify true', '--simplify-ratio 0.5')
  } else {
    args.push('--simplify false')
  }

  const cmd = args.join(' ')
  execSync(cmd, { stdio: 'inherit', shell: true })
}

const results = []

for (const file of inputs) {
  const inputPath = join(INPUT_DIR, file)
  const outputPath = join(OUTPUT_DIR, file)
  const beforeSize = statSync(inputPath).size

  console.log(`\n▶ Optimising ${file} (${(beforeSize / 1024).toFixed(0)} KB raw)`)

  // First pass: 1024px textures, no simplify
  optimise(inputPath, outputPath, 1024, false)
  let afterSize = statSync(outputPath).size

  if (afterSize > MAX_BYTES) {
    console.log(`  ⚠ Still ${(afterSize / 1024 / 1024).toFixed(2)} MB — retrying with 512px + simplify…`)
    // Second pass: 512px + mesh simplification
    optimise(inputPath, outputPath, 512, true)
    afterSize = statSync(outputPath).size
  }

  const ok = afterSize <= MAX_BYTES
  results.push({
    file,
    beforeKB: Math.round(beforeSize / 1024),
    afterKB: Math.round(afterSize / 1024),
    ok,
  })
}

// ── Print summary table ──
console.log('\n┌──────────────────────────────────┬──────────┬──────────┬────────┐')
console.log('│ File                             │ Before   │ After    │ OK?    │')
console.log('├──────────────────────────────────┼──────────┼──────────┼────────┤')
for (const r of results) {
  const name = r.file.padEnd(32).slice(0, 32)
  const before = `${r.beforeKB} KB`.padStart(8)
  const after = `${r.afterKB} KB`.padStart(8)
  const status = r.ok ? '  ✓   ' : '  ✗   '
  console.log(`│ ${name} │ ${before} │ ${after} │${status}│`)
}
console.log('└──────────────────────────────────┴──────────┴──────────┴────────┘')

// ── Write manifest of all successfully optimised models ──
const available = results.filter(r => r.ok).map(r => basename(r.file, '.glb'))
const oversized = results.filter(r => !r.ok).map(r => basename(r.file, '.glb'))

// Include oversized ones too with a warning flag — CharacterStage still tries to load them
const manifestData = {
  available: results.map(r => basename(r.file, '.glb')),
  oversized,
}
writeFileSync(MANIFEST, JSON.stringify(manifestData, null, 2))
console.log(`\n✅ Manifest written → src/data/models.json`)
console.log(`   Available models: ${manifestData.available.join(', ') || '(none)'}`)

if (oversized.length) {
  console.warn(`\n⚠  ${oversized.length} model(s) still exceed 3 MB after compression:`, oversized.join(', '))
  console.warn('   Consider further simplification or use --simplify-ratio 0.3')
  process.exit(1)
}
