/**
 * src/App.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application component.
 *
 * Architecture:
 *   ┌─────────────────────────────────────────┐
 *   │  #canvas-wrapper (fixed, z-0)           │
 *   │    <Canvas dpr={[1,1.5]}>               │
 *   │      <Scene scrollProgress activeTrack> │
 *   │    </Canvas>                            │
 *   ├─────────────────────────────────────────┤
 *   │  <LoadingScreen> (z-9999, fades out)    │
 *   ├─────────────────────────────────────────┤
 *   │  #scroll-content (relative, z-10)       │
 *   │    <Navbar>                             │
 *   │    <Hero>                               │
 *   │    <About>                              │
 *   │    <Tracks activeTrackIndex>            │
 *   │    <WhySponsor>                         │
 *   │    <SponsorTiers>                       │
 *   │    <Timeline>                           │
 *   │    <FAQ>                                │
 *   │    <Contact>                            │
 *   │    <Footer>                             │
 *   ├─────────────────────────────────────────┤
 *   │  <DevHUD> (z-9990, dev only)            │
 *   └─────────────────────────────────────────┘
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

import { useLenis } from './hooks/useLenis'
import { useScrollProgress, useActiveTrackIndex } from './hooks/useScrollProgress'
import { TRACKS } from './data/tracks'

import { Scene } from './three/Scene'
import { Navbar } from './components/Navbar'
import { LoadingScreen } from './components/LoadingScreen'
import { DevHUD } from './components/DevHUD'

import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Tracks } from './sections/Tracks'
import { WhySponsor } from './sections/WhySponsor'
import { SponsorTiers } from './sections/SponsorTiers'
import { Timeline } from './sections/Timeline'
import { FAQ } from './sections/FAQ'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'

export default function App() {
  const [loading, setLoading] = useState(true)

  // Lenis smooth scroll — synced with GSAP ticker
  useLenis()

  // Reactive scroll state
  const scrollProgress = useScrollProgress()
  const activeTrackIndex = useActiveTrackIndex(TRACKS.length)

  return (
    <>
      {/* ── Loading Screen ─────────────────────────────────────────────── */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* ── Fixed 3D Canvas (ONE persistent canvas for the entire site) ── */}
      <div id="canvas-wrapper" aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene
              scrollProgress={scrollProgress}
              activeTrackIndex={activeTrackIndex}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Scrollable HTML content (layered above canvas) ─────────────── */}
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

      {/* ── Dev HUD (only visible in development) ─────────────────────── */}
      <DevHUD scrollProgress={scrollProgress} activeTrackIndex={activeTrackIndex} />
    </>
  )
}
