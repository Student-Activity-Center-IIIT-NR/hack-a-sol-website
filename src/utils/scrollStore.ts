/**
 * src/utils/scrollStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Non-reactive singleton store for scroll metrics and physics.
 * Keeps scrollProgress, chapterProgress, sectionProgress, and velocity in refs/memory
 * without triggering React component tree re-renders on every scroll tick.
 *
 * Three.js objects read live values in useFrame().
 * DOM text components subscribe ONLY to activeIndex changes (0..4).
 */

export interface ScrollState {
  scrollProgress: number
  sectionProgress: number
  activeIndex: number
  chapterProgress: number
  velocity: number
  inHeroOrTracks: boolean
}

class ScrollStore {
  private state: ScrollState = {
    scrollProgress: 0,
    sectionProgress: 0,
    activeIndex: 0,
    chapterProgress: 0,
    velocity: 0,
    inHeroOrTracks: true,
  }

  private activeIndexListeners = new Set<(idx: number) => void>()
  private inViewListeners = new Set<(inView: boolean) => void>()

  public get(): Readonly<ScrollState> {
    return this.state
  }

  public getScrollProgress(): number {
    return this.state.scrollProgress
  }

  public getSectionProgress(): number {
    return this.state.sectionProgress
  }

  public getActiveIndex(): number {
    return this.state.activeIndex
  }

  private zoneState = {
    hero: true,
    tracks: false,
  }
  private zoneListeners = new Set<(zone: { hero: boolean; tracks: boolean }) => void>()

  public getChapterProgress(): number {
    return this.state.chapterProgress
  }

  public getVelocity(): number {
    return this.state.velocity
  }

  public isInHeroOrTracks(): boolean {
    return this.state.inHeroOrTracks
  }

  public getZone(): { hero: boolean; tracks: boolean } {
    return this.zoneState
  }

  public updateScroll(progress: number): void {
    this.state.scrollProgress = progress

    // Hero ends around ~0.14, Tracks active around ~0.06..0.82
    const isHero = progress < 0.14
    const isTracks = (this.state.sectionProgress > 0 && this.state.sectionProgress < 1) || (progress >= 0.06 && progress <= 0.80)

    if (isHero !== this.zoneState.hero || isTracks !== this.zoneState.tracks) {
      this.zoneState = { hero: isHero, tracks: isTracks }
      this.zoneListeners.forEach((fn) => fn(this.zoneState))
    }

    // Beyond 0.82 is sponsor/tiers/timeline/faq/footer where 3D is not in view
    const inHeroOrTracks = progress <= 0.82
    if (inHeroOrTracks !== this.state.inHeroOrTracks) {
      this.state.inHeroOrTracks = inHeroOrTracks
      this.inViewListeners.forEach((fn) => fn(inHeroOrTracks))
    }

    // Canvas dimming past 0.78 - DOM class update without React re-renders
    if (typeof document !== 'undefined') {
      const el = document.getElementById('canvas-wrapper')
      if (el) {
        if (progress > 0.78) {
          el.classList.add('canvas-dimmed')
        } else {
          el.classList.remove('canvas-dimmed')
        }
      }
    }
  }

  public updateTrackSection(sectionProgress: number, activeIndex: number, chapterProgress: number): void {
    this.state.sectionProgress = sectionProgress
    this.state.chapterProgress = chapterProgress

    if (activeIndex !== this.state.activeIndex) {
      this.state.activeIndex = activeIndex
      this.activeIndexListeners.forEach((fn) => fn(activeIndex))
    }
  }

  public updateVelocity(velocity: number): void {
    this.state.velocity = velocity
  }

  public subscribeActiveIndex(listener: (idx: number) => void): () => void {
    this.activeIndexListeners.add(listener)
    listener(this.state.activeIndex)
    return () => this.activeIndexListeners.delete(listener)
  }

  public subscribeZone(listener: (zone: { hero: boolean; tracks: boolean }) => void): () => void {
    this.zoneListeners.add(listener)
    listener(this.zoneState)
    return () => this.zoneListeners.delete(listener)
  }

  public subscribeInView(listener: (inView: boolean) => void): () => void {
    this.inViewListeners.add(listener)
    listener(this.state.inHeroOrTracks)
    return () => this.inViewListeners.delete(listener)
  }
}

export const scrollStore = new ScrollStore()
