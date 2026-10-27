/**
 * src/utils/webglGuard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central WebGL guard utilities for zero-size protection, phone detection,
 * safe buffer sizing, and dev warnings.
 */

let warnedZeroSize = false

/**
 * Dev-only console.warn (triggered at most once) if a render is attempted with size 0.
 */
export function warnZeroSize(context = 'WebGL'): void {
  if (import.meta.env.DEV && !warnedZeroSize) {
    warnedZeroSize = true
    console.warn(
      `[${context}] Render attempted with size 0 (width: 0 or height: 0). Skipping render to prevent framebuffer incomplete error.`
    )
  }
}

/**
 * On phones (window width below 900, or coarse pointer, or navigator.hardwareConcurrency below 4):
 * no post-processing at all and dpr 1.
 */
export function isPhoneDevice(): boolean {
  if (typeof window === 'undefined') return true
  const isSmallWidth = window.innerWidth < 900
  const isCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const isLowConcurrency =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency < 4

  return isSmallWidth || isCoarsePointer || isLowConcurrency
}

/**
 * Guard sizes: use Math.max(1, Math.floor(...)) of the real drawing buffer size.
 */
export function clampBufferSize(val: number): number {
  return Math.max(1, Math.floor(val || 0))
}
