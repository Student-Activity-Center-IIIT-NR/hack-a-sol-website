/**
 * src/utils/artTuneStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time store for ?debug=1&art=tune interactive tuner.
 * Allows Leva controls to tune artHeightVh, artX, artY per track on the fly.
 */

export interface TrackArtTune {
  artHeightVh: number
  artX: number
  artY: number
}

type Listener = () => void

class ArtTuneStore {
  private values: Record<string, TrackArtTune> = {
    aiml:     { artHeightVh: 92, artX: 0, artY: 0 },
    cybersec: { artHeightVh: 92, artX: 0, artY: 0 },
    web3:     { artHeightVh: 92, artX: 0, artY: 0 },
    policy:   { artHeightVh: 92, artX: 0, artY: 0 },
    open:     { artHeightVh: 92, artX: 0, artY: 0 },
  }
  public showAimlOverlay = false
  public isTuneMode = false
  private listeners: Set<Listener> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      this.isTuneMode = p.get('art') === 'tune' || (p.get('debug') === '1' && p.get('art') === 'tune')
    }
  }

  get(trackId: string): TrackArtTune {
    return this.values[trackId] ?? { artHeightVh: 92, artX: 0, artY: 0 }
  }

  set(trackId: string, val: Partial<TrackArtTune>) {
    this.values[trackId] = {
      ...(this.values[trackId] ?? { artHeightVh: 92, artX: 0, artY: 0 }),
      ...val,
    }
    this.notify()
  }

  setOverlay(show: boolean) {
    this.showAimlOverlay = show
    this.notify()
  }

  getAll() {
    return { ...this.values }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }
}

export const artTuneStore = new ArtTuneStore()
