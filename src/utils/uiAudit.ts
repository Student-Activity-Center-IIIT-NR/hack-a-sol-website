/**
 * src/utils/uiAudit.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * UI Audit Tool — activated with ?debug=1&ui=audit
 *
 * Scans the live DOM and console.table reports:
 *   1. Borders brighter than rgba(255,255,255,0.2)
 *   2. Elements wider than the viewport
 *   3. Emoji characters in text nodes
 *   4. Fonts outside the allowed list
 *   5. Panels that do not use the shared .mu-panel class
 *
 * Run in browser console: window.__muAudit?.()
 * Or add ?debug=1&ui=audit to the URL — the main.tsx bootstrap calls this.
 */

const ALLOWED_FONTS = ['Bebas Neue', 'Anton', 'Inter', 'monospace', 'sans-serif']

/** Detect if a computed rgba border is brighter than the allowed threshold */
function isBorderTooLight(rgba: string): boolean {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!m) return false
  const a = parseFloat(m[4] ?? '1')
  if (a === 0) return false // transparent — fine
  const r = parseInt(m[1], 10)
  const g = parseInt(m[2], 10)
  const b = parseInt(m[3], 10)
  // Approximate luminance — if all channels are close to white
  const nearWhite = r > 200 && g > 200 && b > 200
  return nearWhite && a > 0.2
}

/** Simple emoji detector — matches Unicode emoji ranges */
function containsEmoji(text: string): boolean {
  return /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/u.test(text)
}

export function runUIAudit() {
  console.group('%c[Marvel UI Audit]', 'color:#e23636;font-weight:bold;font-size:14px')

  const vw = window.innerWidth

  // ── 1. Borders too bright ────────────────────────────────────────────────
  const brightBorders: { element: string; borderColor: string; opacity: string }[] = []
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el as HTMLElement)
    const sides = ['borderTopColor','borderRightColor','borderBottomColor','borderLeftColor']
    for (const side of sides) {
      const val = s.getPropertyValue(side)
      if (val && isBorderTooLight(val)) {
        brightBorders.push({
          element: (el as HTMLElement).tagName + (el.id ? `#${el.id}` : '') + (el.className ? `.${String(el.className).split(' ')[0]}` : ''),
          borderColor: val,
          opacity: s.opacity,
        })
        break
      }
    }
  })
  if (brightBorders.length > 0) {
    console.warn(`🔴 ${brightBorders.length} border(s) brighter than rgba(255,255,255,0.2):`)
    console.table(brightBorders)
  } else {
    console.log('✅ No borders exceed rgba(255,255,255,0.2)')
  }

  // ── 2. Elements wider than viewport ─────────────────────────────────────
  const wideEls: { element: string; width: number; vw: number }[] = []
  document.querySelectorAll('*').forEach(el => {
    const rect = (el as HTMLElement).getBoundingClientRect()
    if (rect.width > vw + 1) { // +1 for float rounding
      wideEls.push({
        element: (el as HTMLElement).tagName + (el.id ? `#${el.id}` : ''),
        width: Math.round(rect.width),
        vw,
      })
    }
  })
  if (wideEls.length > 0) {
    console.warn(`🔴 ${wideEls.length} element(s) wider than viewport (${vw}px):`)
    console.table(wideEls)
  } else {
    console.log(`✅ No elements exceed viewport width (${vw}px)`)
  }

  // ── 3. Emoji in text nodes ───────────────────────────────────────────────
  const emojiNodes: { text: string; parentTag: string; parentId: string }[] = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? ''
    if (containsEmoji(text.trim())) {
      const parent = node.parentElement
      emojiNodes.push({
        text: text.trim().slice(0, 60),
        parentTag: parent?.tagName ?? '?',
        parentId: parent?.id ?? parent?.className?.toString().slice(0, 30) ?? '',
      })
    }
  }
  if (emojiNodes.length > 0) {
    console.warn(`🔴 ${emojiNodes.length} text node(s) contain emoji:`)
    console.table(emojiNodes)
  } else {
    console.log('✅ No emoji found in text nodes')
  }

  // ── 4. Fonts outside allowed list ────────────────────────────────────────
  const badFonts: { element: string; fontFamily: string }[] = []
  document.querySelectorAll('*').forEach(el => {
    const ff = getComputedStyle(el as HTMLElement).fontFamily
    const allowed = ALLOWED_FONTS.some(f => ff.toLowerCase().includes(f.toLowerCase()))
    if (!allowed && (el as HTMLElement).innerText?.trim()) {
      badFonts.push({
        element: (el as HTMLElement).tagName + (el.id ? `#${el.id}` : ''),
        fontFamily: ff.slice(0, 60),
      })
    }
  })
  if (badFonts.length > 0) {
    console.warn(`🟡 ${badFonts.length} element(s) use fonts outside the allowed list:`)
    console.table(badFonts.slice(0, 20))
  } else {
    console.log('✅ All fonts are from the allowed set')
  }

  // ── 5. Panels without .mu-panel ─────────────────────────────────────────
  // Cards that look like panels (have background + border) but lack .mu-panel
  const nonSystemPanels: { element: string; background: string }[] = []
  document.querySelectorAll('[class*="border"][class*="bg"]').forEach(el => {
    if (!el.classList.contains('mu-panel') && !el.closest('[aria-hidden="true"]')) {
      nonSystemPanels.push({
        element: (el as HTMLElement).tagName + (el.id ? `#${el.id}` : ''),
        background: getComputedStyle(el as HTMLElement).background.slice(0, 60),
      })
    }
  })
  if (nonSystemPanels.length > 0) {
    console.warn(`🟡 ${nonSystemPanels.length} panel-like element(s) do not use .mu-panel:`)
    console.table(nonSystemPanels.slice(0, 20))
  } else {
    console.log('✅ All panel-like elements use .mu-panel')
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const totalIssues = brightBorders.length + wideEls.length + emojiNodes.length
  console.log(
    `%c[Audit Complete] ${totalIssues === 0 ? '✅ Zero issues' : `🔴 ${totalIssues} critical issue(s)`} at ${vw}×${window.innerHeight}`,
    `color:${totalIssues === 0 ? '#22c55e' : '#e23636'};font-weight:bold`
  )

  console.groupEnd()
  return { brightBorders, wideEls, emojiNodes, badFonts, nonSystemPanels }
}

/** Install the audit on window for manual triggering */
export function installUIAudit() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('debug') === '1' && params.get('ui') === 'audit') {
    // Run once after hydration
    window.addEventListener('load', () => {
      setTimeout(runUIAudit, 800)
    })
  }
  // Always expose for manual console use
  ;(window as Window & { __muAudit?: () => ReturnType<typeof runUIAudit> }).__muAudit = runUIAudit
}
