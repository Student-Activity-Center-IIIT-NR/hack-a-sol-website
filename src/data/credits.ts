/**
 * src/data/credits.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * 3D model attribution data for CREDITS.md and the site footer.
 * Fill this in per model when you add assets. CC-BY licenses require attribution.
 *
 * Usage: npm run optimize:models places a compressed model at /public/models/<id>.glb.
 * Add an entry here with the same `trackId` so FooterCredits can render it.
 */

export interface ModelCredit {
  /** Must match the track id (e.g. 'aiml', 'cybersec') */
  trackId: string
  /** Display name of the asset */
  modelName: string
  /** Original author / artist */
  author: string
  /** License identifier, e.g. 'CC BY 4.0', 'CC0', 'MIT' */
  license: string
  /** Link to the original asset or author page */
  link: string
  /** Any additional notes (e.g. modifications made) */
  notes?: string
}

/**
 * Add one entry per 3D model asset placed in /assets-raw/models/.
 * Leave empty until real models are sourced.
 */
export const MODEL_CREDITS: ModelCredit[] = [
  // Example (uncomment and fill in when real model is added):
  // {
  //   trackId: 'aiml',
  //   modelName: 'Iron Man Arc Reactor',
  //   author: 'Artist Name',
  //   license: 'CC BY 4.0',
  //   link: 'https://sketchfab.com/...',
  //   notes: 'Scaled and re-textured for web',
  // },
]
