/**
 * src/utils/benchmark.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Built-in Performance & Frame Timing Benchmark.
 *
 * Triggered automatically when URL contains ?debug=1&bench=1.
 *
 * Workflow:
 * 1. Waits for loading screen to complete and initial layout to settle.
 * 2. Auto-scrolls from top (scrollY = 0) to bottom at a constant speed (~25s).
 * 3. Records frame delta times in high-resolution performance.now().
 * 4. Tracks every chapter boundary switch (timestamp of activeIndex transition).
 * 5. Computes p50, p95, p99, worst frame, and frames > 24ms for:
 *    - The full page scroll run
 *    - Each chapter boundary (the 300ms before and after each chapter switch)
 * 6. Validates against targets:
 *    - Target: p95 <= 20 ms and no frame > 50 ms at any chapter boundary.
 *    - If a boundary misses target, prints which chapter it was.
 * 7. Prints formatted table in console.table and notifies subscribers for debug UI.
 */

import { TRACKS } from "../data/tracks"
import { scrollStore } from "./scrollStore"

export interface BenchmarkMetrics {
  p50: number
  p95: number
  p99: number
  worst: number
  framesOver24: number
  frameCount: number
  targetMet: boolean
}

export interface BoundaryMetrics extends BenchmarkMetrics {
  fromChapter: number
  toChapter: number
  chapterName: string
}

export interface BenchmarkReport {
  overall: BenchmarkMetrics
  boundaries: BoundaryMetrics[]
  durationMs: number
  timestamp: string
}

type BenchmarkListener = (report: BenchmarkReport | null, inProgress: boolean, progressPercent: number) => void

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))))
  return sorted[index]
}

function computeMetrics(frames: number[]): BenchmarkMetrics {
  if (frames.length === 0) {
    return { p50: 0, p95: 0, p99: 0, worst: 0, framesOver24: 0, frameCount: 0, targetMet: true }
  }
  const sorted = [...frames].sort((a, b) => a - b)
  const p50 = percentile(sorted, 50)
  const p95 = percentile(sorted, 95)
  const p99 = percentile(sorted, 99)
  const worst = sorted[sorted.length - 1]
  const framesOver24 = sorted.filter((f) => f > 24).length
  const targetMet = p95 <= 20 && worst <= 50

  return {
    p50: Number(p50.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    p99: Number(p99.toFixed(2)),
    worst: Number(worst.toFixed(2)),
    framesOver24,
    frameCount: frames.length,
    targetMet,
  }
}

class BenchmarkRunner {
  private active = false
  private report: BenchmarkReport | null = null
  private listeners = new Set<BenchmarkListener>()

  public isEnabled(): boolean {
    if (typeof window === "undefined") return false
    const params = new URLSearchParams(window.location.search)
    return params.get("debug") === "1" && params.get("bench") === "1"
  }

  public subscribe(listener: BenchmarkListener): () => void {
    this.listeners.add(listener)
    listener(this.report, this.active, 0)
    return () => this.listeners.delete(listener)
  }

  private notify(inProgress: boolean, progress: number) {
    this.listeners.forEach((fn) => fn(this.report, inProgress, progress))
  }

  public init() {
    if (!this.isEnabled() || this.active) return

    // Wait until document is ready and initial loading screen clears (~1200ms)
    window.addEventListener(
      "load",
      () => {
        setTimeout(() => this.start(), 1500)
      },
      { once: true }
    )

    if (document.readyState === "complete") {
      setTimeout(() => this.start(), 1500)
    }
  }

  public start() {
    if (this.active || typeof window === "undefined") return
    this.active = true
    this.report = null
    console.log("🏁 [BENCHMARK] Starting automated 25s constant-speed scroll benchmark (?debug=1&bench=1)...")

    // Ensure we start at the top
    window.scrollTo(0, 0)

    const TOTAL_DURATION_MS = 25000 // 25 seconds
    const startTime = performance.now()
    let lastFrameTime = startTime

    interface FrameRecord {
      time: number
      dt: number
    }
    const frameRecords: FrameRecord[] = []

    interface SwitchEvent {
      from: number
      to: number
      time: number
      name: string
    }
    const switches: SwitchEvent[] = []
    let lastTrackIndex = scrollStore.getActiveIndex()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / TOTAL_DURATION_MS)

      // Record frame delta time
      const dt = now - lastFrameTime
      lastFrameTime = now
      if (dt > 0 && dt < 500) {
        frameRecords.push({ time: now, dt })
      }

      // Track chapter boundaries
      const currentTrackIndex = scrollStore.getActiveIndex()
      if (currentTrackIndex !== lastTrackIndex) {
        switches.push({
          from: lastTrackIndex,
          to: currentTrackIndex,
          time: now,
          name: TRACKS[currentTrackIndex]?.name ?? `Track ${currentTrackIndex + 1}`,
        })
        lastTrackIndex = currentTrackIndex
      }

      // Auto-scroll constant speed from top to bottom
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      window.scrollTo(0, progress * maxScroll)

      this.notify(true, progress * 100)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        this.finish(frameRecords, switches, TOTAL_DURATION_MS)
      }
    }

    requestAnimationFrame(step)
  }

  private finish(
    frameRecords: Array<{ time: number; dt: number }>,
    switches: Array<{ from: number; to: number; time: number; name: string }>,
    durationMs: number
  ) {
    this.active = false
    const allDts = frameRecords.map((f) => f.dt)
    const overall = computeMetrics(allDts)

    // Compute boundary metrics: 300ms before and 300ms after each chapter switch
    const boundaryMetricsList: BoundaryMetrics[] = switches.map((sw) => {
      const windowStart = sw.time - 300
      const windowEnd = sw.time + 300
      const windowFrames = frameRecords
        .filter((f) => f.time >= windowStart && f.time <= windowEnd)
        .map((f) => f.dt)

      const metrics = computeMetrics(windowFrames)
      return {
        ...metrics,
        fromChapter: sw.from,
        toChapter: sw.to,
        chapterName: sw.name,
      }
    })

    const report: BenchmarkReport = {
      overall,
      boundaries: boundaryMetricsList,
      durationMs,
      timestamp: new Date().toLocaleTimeString(),
    }
    this.report = report

    // Print to console.table
    console.log("\n=======================================================")
    console.log("📊 HACK-A-SOL 5.0 — SCROLL PERFORMANCE BENCHMARK REPORT")
    console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s | Total Frames: ${allDts.length}`)
    console.log("=======================================================")

    const tableData: Record<string, any> = {
      "OVERALL RUN (25s)": {
        "p50 (ms)": overall.p50,
        "p95 (ms)": overall.p95,
        "p99 (ms)": overall.p99,
        "Worst Frame (ms)": overall.worst,
        "Frames > 24ms": overall.framesOver24,
        "Target Met (p95<=20, worst<=50)": overall.targetMet ? "✅ PASS" : "❌ FAIL",
      },
    }

    boundaryMetricsList.forEach((bm) => {
      const key = `BOUNDARY ${bm.fromChapter + 1} ➔ ${bm.toChapter + 1} (${bm.chapterName})`
      tableData[key] = {
        "p50 (ms)": bm.p50,
        "p95 (ms)": bm.p95,
        "p99 (ms)": bm.p99,
        "Worst Frame (ms)": bm.worst,
        "Frames > 24ms": bm.framesOver24,
        "Target Met (p95<=20, worst<=50)": bm.targetMet ? "✅ PASS" : "❌ FAIL",
      }

      if (!bm.targetMet) {
        console.warn(
          `⚠️ [BENCHMARK TARGET MISSED] Chapter boundary transition to Track ${bm.toChapter + 1} (${bm.chapterName}): ` +
            `p95 = ${bm.p95}ms (target <= 20ms), worst frame = ${bm.worst}ms (target <= 50ms)`
        )
      }
    })

    console.table(tableData)
    this.notify(false, 100)
  }

  public getReport(): BenchmarkReport | null {
    return this.report
  }

  public isActive(): boolean {
    return this.active
  }
}

export const benchmarkRunner = new BenchmarkRunner()
