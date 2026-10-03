/**
 * src/App.tsx  (Phase 3h - slower scroll, dwell & snap)
 * -----------------------------------------------------------------------------
 * Architecture:
 *   [fixed canvas z-0]   - ONE persistent R3F canvas
 *   [z-9999 loading]     - Marvel loading screen (fades out)
 *   [z-10 scroll HTML]   - All sections scroll over the canvas
 *   [z-99990 cursor]     - Custom dot+ring cursor (desktop only)
 *   [z-9990 devHUD]      - Only visible with ?debug=1 in URL
 *
 * Phase 3h:
 *   useTrackSection() provides activeIndex + chapterProgress from a GSAP
 *   ScrollTrigger pin on #tracks with 280vh/chapter budget, 3% hysteresis,
 *   and snap to HOLD zone centers.
 *   Leva controls (?debug=1) expose TRACK_SCROLL_VH, wheelMultiplier and snap on/off.
 */

import { useState, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'

import { useLenis }           from './hooks/useLenis'
import { useScrollProgress }  from './hooks/useScrollProgress'
import { useTrackSection }    from './hooks/useTrackSection'
import { TRACK_SCROLL_VH }    from './config'

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

  // Leva debug controls (visible with ?debug=1)
  const controls = useControls(
    'Track Scroll & Physics',
    {
      trackScrollVh:   { value: TRACK_SCROLL_VH, min: 100, max: 600, step: 10, label: 'Scroll VH/track' },
      wheelMultiplier: { value: 0.7,             min: 0.1, max: 2.0, step: 0.05, label: 'Wheel Multiplier' },
      snapEnabled:     { value: true,            label: 'Snap to HOLD Center' },
    },
    { collapsed: false }
  )

  // Lenis smooth scroll - synced with GSAP ticker; accepts dynamic wheelMultiplier from Leva
  useLenis(controls.wheelMultiplier)

  // Global scroll progress (0..1) - for camera path + canvas dim
  const scrollProgress = useScrollProgress()

  // SINGLE SOURCE OF TRUTH for track chapter state
  const { sectionProgress, activeIndex, chapterProgress } = useTrackSection({
    trackScrollVh: controls.trackScrollVh,
    snapEnabled:   controls.snapEnabled,
  })

  // Show Leva tuning panel only with ?debug=1
  const debugMode = useMemo(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1'
  , [])

  // Dim the 3D canvas behind non-track sections (sponsor / faq / footer)
  // Track zone: approximately 0.05 - 0.72 global scroll.
  const canvasDimmed = scrollProgress > 0.72

  return (
    <>
      {/* -- Leva debug panel (only with ?debug=1) ----------------------- */}
      <Leva hidden={!debugMode} collapsed />

      {/* -- Loading Screen ----------------------------------------------- */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* -- Custom Cursor (desktop only) ---------------------------------- */}
      <CustomCursor />

      {/* -- Cinematic Multiverse HUD (desktop/tablet) ----------------------- */}
      <FloatingHUD
        scrollProgress={scrollProgress}
        activeTrackIndex={activeIndex}
        sectionProgress={sectionProgress}
      />

      {/* -- Fixed 3D Canvas - ONE persistent canvas for the entire site -- */}
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
              activeTrackIndex={activeIndex}
              sectionProgress={sectionProgress}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* -- Scrollable HTML content --------------------------------------- */}
      <div id="scroll-content">
        <Navbar />
        <Hero />
        <About />
        <Tracks
          activeIndex={activeIndex}
          chapterProgress={chapterProgress}
          sectionProgress={sectionProgress}
          debugMode={debugMode}
          trackScrollVh={controls.trackScrollVh}
        />
        <WhySponsor />
        <SponsorTiers />
        <Timeline />
        <FAQ />
        <Contact />
        <Footer />
      </div>

      {/* -- Dev HUD ------------------------------------------------------- */}
      <DevHUD
        scrollProgress={scrollProgress}
        activeTrackIndex={activeIndex}
        chapterProgress={chapterProgress}
        sectionProgress={sectionProgress}
      />
    </>
  )
}