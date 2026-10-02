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
