/**
 * src/components/CustomCursor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marvel Reticle / Target Custom Cursor:
 *   • Inner laser dot (immediate response)
 *   • Outer targeting reticle with 4 crosshair tick marks (smooth lag)
 *   • Magnetic snap to elements with [data-magnetic]
 *   • Target locking expansion when hovering interactive elements
 *   • Hidden on touch devices
 */

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const dotRef    = useRef<HTMLDivElement>(null)
  const ringRef   = useRef<HTMLDivElement>(null)
  const raw       = useRef({ x: -100, y: -100 })
  const smooth    = useRef({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)
  const [isMagnetic, setIsMagnetic] = useState(false)
  const magneticTarget = useRef<{ x: number; y: number } | null>(null)
  const rafRef    = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      raw.current.x = e.clientX
      raw.current.y = e.clientY

      // Check magnetic elements
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const magneticEl = el?.closest('[data-magnetic]') as HTMLElement | null

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect()
        magneticTarget.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
        setIsMagnetic(true)
        setHovering(true)
      } else {
        magneticTarget.current = null
        setIsMagnetic(false)
        const isHoverable = el?.closest('a, button, input, textarea, [role="button"]') !== null
        setHovering(isHoverable)
      }
    }

    const animate = () => {
      // If magnetically snapped, pull outer reticle toward button center
      const targetX = magneticTarget.current ? magneticTarget.current.x : raw.current.x
      const targetY = magneticTarget.current ? magneticTarget.current.y : raw.current.y

      const lerpFactor = magneticTarget.current ? 0.22 : 0.15
      smooth.current.x += (targetX - smooth.current.x) * lerpFactor
      smooth.current.y += (targetY - smooth.current.y) * lerpFactor

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${raw.current.x - 3}px, ${raw.current.y - 3}px)`
      }
      if (ringRef.current) {
        const size = isMagnetic ? 64 : (hovering ? 48 : 32)
        const half = size / 2
        ringRef.current.style.transform = `translate(${smooth.current.x - half}px, ${smooth.current.y - half}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMagnetic, hovering])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  const size = isMagnetic ? 64 : (hovering ? 48 : 32)

  return (
    <>
      {/* Laser Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-1.5 h-1.5 rounded-full bg-marvel-red shadow-[0_0_8px_#E23636] transition-opacity duration-150"
      />

      {/* Outer Targeting Reticle */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99998] transition-[width,height,border-color] duration-200"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Reticle Circle */}
        <div
          className={`w-full h-full rounded-full border border-dashed transition-all duration-300 relative ${
            hovering
              ? 'border-marvel-red/80 shadow-[0_0_16px_rgba(226,54,54,0.4)] rotate-45'
              : 'border-white/30'
          }`}
        >
          {/* Top reticle tick */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-marvel-red/80" />
          {/* Bottom reticle tick */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-marvel-red/80" />
          {/* Left reticle tick */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-0.5 bg-marvel-red/80" />
          {/* Right reticle tick */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-0.5 bg-marvel-red/80" />
        </div>
      </div>
    </>
  )
}
