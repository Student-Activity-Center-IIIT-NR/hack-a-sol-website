/**
 * src/components/ScrollReveal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-scrubbed text reveal — splits text into words, each wrapped in an
 * overflow:hidden mask. As the element scrolls into view, words translate from
 * y+100% to y=0 in a staggered cascade.
 *
 * Usage:
 *   <ScrollReveal as="h2" stagger={0.07} duration={0.9}>
 *     WHERE HEROES ARE FORGED
 *   </ScrollReveal>
 *
 * Uses GSAP ScrollTrigger under the hood. Respects prefers-reduced-motion.
 */

import { useEffect, useRef, createElement, type ReactNode } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealProps {
  children: string | ReactNode
  /** HTML tag to render */
  as?: keyof JSX.IntrinsicElements
  /** Stagger delay between words (seconds) */
  stagger?: number
  /** Duration of each word's animation */
  duration?: number
  className?: string
  /** Additional ScrollTrigger start position */
  start?: string
}

export function ScrollReveal({
  children,
  as = 'span',
  stagger = 0.06,
  duration = 0.8,
  className = '',
  start = 'top 85%',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement>(null)
  const initialized  = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initialized.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    initialized.current = true

    const words = containerRef.current.querySelectorAll<HTMLSpanElement>('.sr-word')
    if (!words.length) return

    gsap.fromTo(
      words,
      { y: '105%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        stagger,
        duration,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: 'play none none reverse',
        },
      },
    )
  }, [stagger, duration, start])

  // Split children string into word spans
  const renderWords = (text: string) =>
    text.split(' ').map((word, i) => (
      <span
        key={i}
        className="sr-mask"
        style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
      >
        <span
          className="sr-word"
          style={{ display: 'inline-block' }}
        >
          {word}
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      </span>
    ))

  const content = typeof children === 'string' ? renderWords(children) : children

  return createElement(as as string, { ref: containerRef, className }, content)
}

/**
 * Simpler variant: fade + slide up a whole block (not word-by-word).
 */
export function FadeUp({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    gsap.fromTo(
      ref.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
