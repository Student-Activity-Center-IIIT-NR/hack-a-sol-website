# Project Rules — Hack-A-Sol 5.0

> **Scope**: This is the FULL OFFICIAL website for Hack-A-Sol 5.0. Sponsors are one section among many. The site serves all audiences: participants, judges, press, mentors, and sponsors.

## Stack
Vite + React 18 + TypeScript, Tailwind CSS v3, @react-three/fiber, @react-three/drei,
three.js, GSAP + ScrollTrigger, Lenis smooth scroll. Deploy: Vercel.

## Canvas Rule
ONE persistent full-screen R3F `<Canvas>` — never per-section. dpr={[1,1.5]}.

## Models
Placeholder primitives now; real Draco GLBs (≤3 MB) later. No copyrighted assets.

## Config
All TBA values in `src/config.ts`. Never hard-code uncertain info in components.

## Tracks (src/data/tracks.ts — single source of truth)
AI/ML, Cybersecurity, Web3 & Sustainability, Robonyx, CodeRun.

## Code
- No `any`. Strict TS. Small, typed, commented components.
- prefers-reduced-motion → static fallback.

---

## UI Rules (content sections below Tracks)

### Tokens — src/styles/marvel-ui.css (SINGLE SOURCE OF TRUTH)
```
--bg:          #07070b
--panel:       rgba(255,255,255,0.035)
--panel-hover: rgba(255,255,255,0.055)
--line:        rgba(255,255,255,0.09)        ← default border
--line-strong: rgba(255,255,255,0.16)        ← MAXIMUM border brightness
--red:         #e23636
--red-soft:    rgba(226,54,54,0.35)
--text:        rgba(255,255,255,0.92)
--muted:       rgba(255,255,255,0.62)
--faint:       rgba(255,255,255,0.38)
```

### Required Components (src/components/ui/)
Every content section MUST import and use these — never recreate them inline:
- **SectionHeader** — eyebrow, title, accent, subtitle
- **Panel** — default or accent variant (all card surfaces)
- **Chip** — mono label, TBA dot
- **Button** — primary (red, 48px) or ghost (underline)
- **Stat** — icon + value + label + count-up
- **LogoTile** — sponsor tiles with tone setting
- **Divider** — 1px line with 40px red left segment

### Prohibitions
- NO emoji anywhere — use lucide-react icons (20px, strokeWidth 1.5, red)
- NO border brighter than `var(--line-strong)` (rgba 255,255,255,0.16)
- NO accents other than red outside the Tracks section
- NO HUD floating labels outside Tracks (FloatingHUD enforces this)
- NO `overflow-x: hidden` on large elements — use `clip`
- NO backdrop-filter on large layers
- NO per-frame React state for animations — use IntersectionObserver

### Audit
`?debug=1&ui=audit` or `window.__muAudit()` — zero issues required at 1920×868 and 390×844.
