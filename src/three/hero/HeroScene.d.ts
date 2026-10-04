/** Typings for the plain-JS hero gateway scene (HeroScene.js). */
export interface HeroHandle {
  /** Plays the staged opening sequence (signal, rings, fracture, lock). */
  play(): void
  /** 0..1 scroll progress through the hero; swells and fades the gateway. */
  setScroll(progress: number): void
  /** Stops the loop and frees GPU resources. Call on unmount. */
  destroy(): void
}

/** Mounts the gateway into `container`. `container.parentElement` receives --cx/--cy/--r CSS variables. */
export function initHero(container: HTMLElement): HeroHandle
