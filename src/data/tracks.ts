/**
 * src/data/tracks.ts  (Phase 3d — character art + visual mode)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all hackathon tracks.
 * Components MUST consume this array — never hardcode track data in JSX.
 *
 * modelTransform: optional per-model overrides applied AFTER auto-fit.
 *   scale      — multiplier on top of auto-fit scale (1 = keep auto-fit result)
 *   position   — [x,y,z] offset in scene units after centering
 *   yawOffset  — radians added so model's "front" faces camera at chapter p=0.5
 *
 * imagePath: transparent PNG rendered in the HTML layer (default /characters/<id>.png)
 * visual:    controls which layers render:
 *   "image" — image only (default, character image with background environment)
 *   "both"  — character image + 3D model prop
 *   "model" — 3D only (image layer skipped, fallback if image missing)
 *
 * Tune live with ?debug=1 — Leva panel exposes yawOffset, scale, and visual mode.
 */

export type TrackPrimitiveType =
  | 'icosahedron'
  | 'torus'
  | 'octahedron'

/** Optional per-model transform overrides applied after auto-fit centering. */
export interface ModelTransform {
  /** Uniform scale multiplier applied on top of the auto-fit scale (default 1). */
  scale?: number
  /** World-space position offset [x, y, z] in scene units (default [0, 0, 0]). */
  position?: [number, number, number]
  /**
   * Y-axis rotation offset in radians so the model's "front" faces the camera
   * when chapter scroll progress p = 0.5.
   * Default: 0 (model's +Z is its front; camera approaches from +Z).
   */
  yawOffset?: number
}

/**
 * Which visual layers render for this track chapter.
 * "image" — HTML image only, no 3D character in canvas (default)
 * "both"  — character art image + 3D model
 * "model" — 3D only, skip character art image layer (fallback if image missing)
 */
export type TrackVisual = 'both' | 'image' | 'model'

export interface Track {
  id: string
  /** Display name of the track */
  name: string
  /** Marvel character associated with this track */
  character: string
  /** One-line tagline shown in the section hero */
  tagline: string
  /** 2–3 sentence description for the card / modal */
  description: string
  /** Tailwind / hex accent colour for glow, gradient, text */
  accentColor: string
  /**
   * Path to the Draco GLB model (relative to /public).
   * Automatically wired from models.json manifest when the file exists.
   */
  modelPath: string
  /**
   * Path to the transparent PNG/WebP character art (relative to /public).
   * Defaults to /characters/<id>.png when not set.
   * CharacterArt logs a console warning if the file cannot be loaded.
   */
  imagePath?: string
  /** Three.js placeholder primitive to render before GLB is available */
  primitive: TrackPrimitiveType
  /** Short icon emoji for badges */
  icon: string
  /**
   * Controls which visual layers render in the track chapter.
   * Defaults to "image".
   */
  visual?: TrackVisual
  /**
   * Optional per-model transform overrides. Tune live with ?debug=1
   * then copy the printed JSON here.
   */
  modelTransform?: ModelTransform
}

export const TRACKS: Track[] = [
  {
    id: 'aiml',
    name: 'AI / ML',
    character: 'Iron Man',
    tagline: 'Build the Arc Reactor of Intelligence',
    description:
      'Harness machine learning, computer vision, and generative AI to solve real-world problems. Think like Tony Stark — iterate fast, build smarter.',
    accentColor: '#60A5FA',
    modelPath: '/models/aiml.glb',
    imagePath: '/characters/aiml.webp',
    primitive: 'icosahedron',
    icon: '🤖',
    visual: 'image',
    modelTransform: { yawOffset: Math.PI, scale: 1.0 },
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity',
    character: 'Captain America',
    tagline: 'Shield the Digital Frontier',
    description:
      'From reverse engineering to ethical hacking and secure system design — defend the digital frontier with the resolve of a super-soldier.',
    accentColor: '#EF4444',
    modelPath: '/models/cybersec.glb',
    imagePath: '/characters/cybersec.webp',
    primitive: 'torus',
    icon: '🛡️',
    visual: 'image',
    modelTransform: { yawOffset: Math.PI, scale: 1.0 },
  },
  {
    id: 'web3',
    name: 'Web3 & Sustainability',
    character: 'Black Panther',
    tagline: 'Vibranium for the Planet',
    description:
      'Build decentralised applications, green-tech solutions, and blockchain-powered systems. Wakanda showed us — technology and nature can coexist.',
    accentColor: '#A855F7',
    modelPath: '/models/web3.glb',
    imagePath: '/characters/web3.webp',
    primitive: 'octahedron',
    icon: '🌿',
    visual: 'image',
    modelTransform: { yawOffset: Math.PI, scale: 1.0 },
  },
]
