/**
 * src/utils/perfStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Non-reactive store for performance toggles and metrics.
 * Used by ?debug=1 perf panel and Leva controls to isolate subsystem costs.
 */

export interface PerfToggles {
  postProcessing: boolean
  particlesEnvironments: boolean
  characterImages: boolean
  heroSilhouettes: boolean
}

class PerfStore {
  private toggles: PerfToggles = {
    postProcessing: true,
    particlesEnvironments: true,
    characterImages: true,
    heroSilhouettes: true,
  }

  private listeners = new Set<(toggles: PerfToggles) => void>()

  public get(): Readonly<PerfToggles> {
    return this.toggles
  }

  public set(key: keyof PerfToggles, value: boolean): void {
    if (this.toggles[key] !== value) {
      this.toggles[key] = value
      this.listeners.forEach((fn) => fn(this.toggles))
    }
  }

  public updateAll(next: Partial<PerfToggles>): void {
    let changed = false
    for (const key of Object.keys(next) as Array<keyof PerfToggles>) {
      if (next[key] !== undefined && this.toggles[key] !== next[key]) {
        this.toggles[key] = next[key]!
        changed = true
      }
    }
    if (changed) {
      this.listeners.forEach((fn) => fn(this.toggles))
    }
  }

  public subscribe(listener: (toggles: PerfToggles) => void): () => void {
    this.listeners.add(listener)
    listener(this.toggles)
    return () => this.listeners.delete(listener)
  }
}

export const perfStore = new PerfStore()
