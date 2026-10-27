/**
 * src/main.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React 18 entry point. Registers GSAP ScrollTrigger plugin.
 * UI audit tool: ?debug=1&ui=audit — see src/utils/uiAudit.ts
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'
import { installUIAudit } from './utils/uiAudit'

// Register GSAP plugins once at the module level
gsap.registerPlugin(ScrollTrigger)

// Install UI audit tool (?debug=1&ui=audit) and expose window.__muAudit()
installUIAudit()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
