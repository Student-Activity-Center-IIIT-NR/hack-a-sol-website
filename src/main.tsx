/**
 * src/main.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React 18 entry point. Registers GSAP ScrollTrigger plugin.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

// Register GSAP plugins once at the module level
gsap.registerPlugin(ScrollTrigger)

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
