# Hack-A-Sol 5.0 — Agent Reference

> **Scope**: This is the FULL OFFICIAL website for Hack-A-Sol 5.0.
> Sponsors are **one section** among many. The site serves all audiences:
> participants, judges, press, mentors, and sponsors.

## Stack
- **Framework**: Vite + React 18 + TypeScript (strict)
- **Styling**: Tailwind CSS v3
- **3D**: @react-three/fiber + @react-three/drei + three.js
- **Animation**: GSAP + ScrollTrigger, Lenis smooth scroll (raf driven by gsap.ticker)
- **Deploy**: Vercel

## Hard Rules

### Canvas
- ONE persistent `<Canvas>` fixed full-screen behind all content. Never create per-section canvases.
- `dpr={[1, 1.5]}` — no heavy postprocessing on mobile.
- All 3D objects start as placeholder primitives; real `.glb` files loaded later with Draco + Suspense.

### Models (future)
- Draco-compressed GLB, max 3 MB each.
- Lazy-loaded with `React.lazy` + `<Suspense>`.
- No copyrighted ripped assets — stylized / symbol-based only.

### Configuration
- All uncertain info (dates, prize pool, registration link, venue) lives in `src/config.ts`.
- Display as "Coming Soon", "TBA", or "November 2026 (TBA)". Never invent numbers.

### Tracks (src/data/tracks.ts — single source of truth)
1. AI/ML → Iron Man — arc reactor + HUD rings — blue (#60A5FA)
2. Cybersecurity → Captain America — vibranium shield — red/white/blue (#EF4444)
3. Web3 & Sustainability → Black Panther — vibranium crystals — purple/green (#A855F7)
4. Robonyx (buildathon) → Ultron — robot head + drones — red wireframe (#F87171)
5. CodeRun (DSA/CP) → Doctor Strange — Eye of Agamotto + mandalas — gold (#F59E0B)

### Code Quality
- Keep components small, typed, and commented where non-obvious.
- No `any` types.
- All components in `src/components/`, sections in `src/sections/`, three in `src/three/`.

### Accessibility
- `prefers-reduced-motion`: static visuals + CSS parallax fallback, no R3F scroll animation.
- Mobile / low-end: simplified canvas or hidden 3D.

## Folder Structure
```
src/
  components/   — reusable UI (Navbar, Button, etc.)
  components/ui/ — SHARED MARVEL UI COMPONENTS (SectionHeader, Panel, Chip, Button, Stat, LogoTile, Divider)
  sections/     — page sections (Hero, Tracks, About, etc.)
  styles/       — marvel-ui.css (design tokens — SINGLE SOURCE OF TRUTH)
  three/        — R3F components (Scene, track models, etc.)
  hooks/        — custom hooks (useScrollProgress, useLenis, etc.)
  data/         — tracks.ts, faq.ts, tiers.ts
  config.ts     — all TBA/placeholder values
  main.tsx      — entry, Lenis + GSAP ScrollTrigger setup
  App.tsx       — root: Canvas + scrolling HTML
  index.css     — Tailwind base + global tokens
  utils/uiAudit.ts — UI audit tool (?debug=1&ui=audit)
```

## UI Rules

> All content sections below Tracks MUST follow these rules.

### Design Tokens (src/styles/marvel-ui.css)
Only use these CSS custom properties — never hardcode equivalent values:
- `--bg` #07070b, `--panel` rgba(255,255,255,0.035), `--panel-hover` rgba(255,255,255,0.055)
- `--line` rgba(255,255,255,0.09), `--line-strong` rgba(255,255,255,0.16) — **brightest border allowed**
- `--red` #e23636, `--red-soft` rgba(226,54,54,0.35)
- `--text` rgba(255,255,255,0.92), `--muted` rgba(255,255,255,0.62), `--faint` rgba(255,255,255,0.38)

### Required Components (`src/components/ui/`)
Every content section MUST use these shared components:
| Component | Usage |
|-----------|-------|
| `SectionHeader` | Every section's title block — eyebrow, title, accent word, subtitle |
| `Panel` | All card/box surfaces — default or accent variant |
| `Chip` | Mono labels, TBA badges, status tags |
| `Button` | CTAs — primary (red) or ghost (underline) |
| `Stat` | Stat display with icon + count-up |
| `LogoTile` | Sponsor logo tiles — always with plate/tone setting |
| `Divider` | Horizontal rules |

### Absolute Prohibitions
- **No emoji** anywhere in the UI — use Lucide React icons (20px, stroke 1.5, red)
- **No border brighter than `var(--line-strong)`** (rgba 255,255,255,0.16)
- **Red is the ONLY accent outside Tracks** — no gold, blue, orange, green accents
- **No HUD labels outside the Tracks section** — `FloatingHUD` handles this
- **No `overflow-x: hidden`** on large elements — use `clip` instead
- **No backdrop-filter on large layers** — performance rule
- **No per-frame React state for animations** — use IntersectionObserver + CSS

### UI Audit
Run `?debug=1&ui=audit` or call `window.__muAudit()` in the console to check for violations.
Target: zero critical issues at 1920×868 and 390×844.

