/**
 * src/utils/audio.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-asset Web Audio API sound generator for Marvel cinematic UI.
 * Creates subtle futuristic tech beeps, hums, and clicks.
 */

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled: boolean = false
  private ambientOsc: OscillatorNode | null = null
  private ambientGain: GainNode | null = null

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.initCtx()
    this.enabled = !this.enabled

    if (this.enabled) {
      this.playChirp(880, 1320, 0.08)
      this.startAmbientDrone()
    } else {
      this.playChirp(440, 220, 0.08)
      this.stopAmbientDrone()
    }

    return this.enabled
  }

  public playHover() {
    if (!this.enabled || !this.ctx) return
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.03)

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Audio playback fails gracefully if blocked
    }
  }

  public playClick() {
    if (!this.enabled || !this.ctx) return
    try {
      this.playChirp(600, 1200, 0.06)
    } catch {
      // Audio playback fails gracefully
    }
  }

  public playTrackSwitch() {
    if (!this.enabled || !this.ctx) return
    try {
      this.playChirp(350, 700, 0.12)
    } catch {
      // Audio playback fails gracefully
    }
  }

  private playChirp(startFreq: number, endFreq: number, duration: number) {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration)

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  private startAmbientDrone() {
    if (!this.ctx) return
    try {
      if (this.ambientOsc) return
      this.ambientOsc = this.ctx.createOscillator()
      this.ambientGain = this.ctx.createGain()

      this.ambientOsc.type = 'sine'
      this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime) // Low A

      this.ambientGain.gain.setValueAtTime(0.0001, this.ctx.currentTime)
      this.ambientGain.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + 2)

      this.ambientOsc.connect(this.ambientGain)
      this.ambientGain.connect(this.ctx.destination)

      this.ambientOsc.start()
    } catch {
      // Graceful fallback
    }
  }

  private stopAmbientDrone() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5)
        setTimeout(() => {
          this.ambientOsc?.stop()
          this.ambientOsc?.disconnect()
          this.ambientGain?.disconnect()
          this.ambientOsc = null
          this.ambientGain = null
        }, 550)
      } catch {
        this.ambientOsc = null
        this.ambientGain = null
      }
    }
  }
}

export const sound = new SoundManager()
