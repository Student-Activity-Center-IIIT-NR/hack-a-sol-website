/**
 * src/components/LoadingScreen.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel-style loading screen shown on initial page load.
 * Fades out once the app is ready (onComplete callback).
 *
 * Visuals: red/black Marvel comic panel flash, logo reveal, progress bar.
 */

import { useEffect, useRef, useState } from 'react'
import { EVENT } from '../config'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Simulate loading progress
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(intervalRef.current!)
          // Small delay before exit animation
          setTimeout(() => {
            setExiting(true)
            setTimeout(onComplete, 800)
          }, 300)
          return 100
        }
        // Eased increment: fast at first, slow near 100
        const remaining = 100 - p
        return p + Math.max(0.5, remaining * 0.06)
      })
    }, 40)

    return () => clearInterval(intervalRef.current!)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-marvel-darker transition-opacity duration-700 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Comic halftone texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Red scan line strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-marvel-red animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-marvel-red animate-pulse" />

      {/* Central content */}
      <div className="relative text-center px-8">
        {/* IIIT NR pill */}
        <p className="text-xs tracking-[0.4em] text-white/40 uppercase mb-6 font-body">
          IIIT Naya Raipur Presents
        </p>

        {/* Main logo */}
        <h1 className="font-heading text-6xl sm:text-8xl tracking-widest text-white mb-2 loading-glitch">
          HACK<span className="text-marvel-red">-A-</span>SOL
        </h1>
        <p className="font-heading text-3xl sm:text-5xl tracking-[0.5em] text-white/70 mb-2">
          5.0
        </p>
        <p className="font-heading text-xl tracking-[0.8em] text-marvel-red mb-12">
          {EVENT.theme}
        </p>

        {/* Progress bar */}
        <div className="w-64 sm:w-96 mx-auto">
          <div className="flex justify-between text-xs text-white/30 font-body mb-2">
            <span>INITIALISING SYSTEMS</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-marvel-red transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-8 text-white/20 text-xs tracking-widest font-body uppercase">
        Powered by {EVENT.hostedBy}
      </p>
    </div>
  )
}
