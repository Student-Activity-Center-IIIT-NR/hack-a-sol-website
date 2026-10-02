/**
 * src/App.tsx  (Phase 3 — character stage, canvas dimming, debug-only HUD)
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *   [fixed canvas z-0]   — ONE persistent R3F canvas, dims behind non-track sections
 *   [z-9999 loading]     — Marvel loading screen (fades out)
 *   [z-10 scroll HTML]   — All sections scroll over the canvas
 *   [z-99990 cursor]     — Custom dot+ring cursor (desktop only)
 *   [z-9990 devHUD]      — Only visible with ?debug=1 in URL
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import { useLenis }                    from './hooks/useLenis'
import { useScrollProgress, useActiveTrackIndex } from './hooks/useScrollProgress'
import { TRACKS }                      from './data/tracks'

import { Scene }          from './three/Scene'
import { Navbar }         from './components/Navbar'
import { LoadingScreen }  from './components/LoadingScreen'
import { DevHUD }         from './components/DevHUD'
import { CustomCursor }   from './components/CustomCursor'
import { FloatingHUD }    from './components/FloatingHUD'

import { Hero }          from './sections/Hero'
import { About }         from './sections/About'
import { Tracks }        from './sections/Tracks'
import { WhySponsor }    from './sections/WhySponsor'
import { SponsorTiers }  from './sections/SponsorTiers'
import { Timeline }      from './sections/Timeline'
import { FAQ }           from './sections/FAQ'
import { Contact }       from './sections/Contact'
import { Footer }        from './sections/Footer'

export default function App() {
  const [loading, setLoading] = useState(true)

  // Lenis smooth scroll — synced with GSAP ticker
  useLenis()

  // Global scroll state
  const scrollProgress    = useScrollProgress()
  const activeTrackIndex  = useActiveTrackIndex(TRACKS.length)

  // Dim the 3D canvas behind non-track sections (sponsor / faq / footer)
  // Track zone: 0.05 – 0.72. Hero/About are fine at full opacity.
  const canvasDimmed = scrollProgress > 0.72

  return (
    <>
      {/* ── Loading Screen ─────────────────────────────────────────────── */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* ── Custom Cursor (desktop only) ────────────────────────────────── */}
      <CustomCursor />

      {/* ── Cinematic Multiverse HUD (desktop/tablet) ─────────────────────── */}
      <FloatingHUD scrollProgress={scrollProgress} activeTrackIndex={activeTrackIndex} />

      {/* ── Fixed 3D Canvas — ONE persistent canvas for the entire site ── */}
      <div id="canvas-wrapper" aria-hidden="true" className={canvasDimmed ? 'canvas-dimmed' : ''}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 300 }}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          <Suspense fallback={null}>
            <Scene
              scrollProgress={scrollProgress}
              activeTrackIndex={activeTrackIndex}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Scrollable HTML content ─────────────────────────────────────── */}
      <div id="scroll-content">
        <Navbar />
        <Hero />
        <About />
        <Tracks activeTrackIndex={activeTrackIndex} />
        <WhySponsor />
        <SponsorTiers />
        <Timeline />
        <FAQ />
        <Contact />
        <Footer />
      </div>

      {/* ── Dev HUD ─────────────────────────────────────────────────────── */}
      <DevHUD scrollProgress={scrollProgress} activeTrackIndex={activeTrackIndex} />
    </>
  )
}
