/**
 * src/data/tracks.ts  (Phase 3b — modelTransform overrides added)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all hackathon tracks.
 * Components MUST consume this array — never hardcode track data in JSX.
 *
 * modelTransform: optional per-model overrides applied AFTER auto-fit.
 *   scale    — multiplier on top of auto-fit scale (1 = keep auto-fit result)
 *   position — [x,y,z] offset in scene units after centering
 *   rotation — [x,y,z] Euler angles in radians; default pose is [0, π/8, 0]
 *
 * Tune these live in-browser with ?debug=1 — the Leva panel shows a per-track
 * tuning UI with a "Copy modelTransform" button that prints to the console.
 */

export type TrackPrimitiveType =
  | 'icosahedron'
  | 'torus'
  | 'octahedron'
  | 'dodecahedron'
  | 'torusKnot'

/** Optional per-model transform overrides applied after auto-fit centering. */
export interface ModelTransform {
  /** Uniform scale multiplier applied on top of the auto-fit scale (default 1). */
  scale?: number
  /** World-space position offset [x, y, z] in scene units (default [0, 0, 0]). */
  position?: [number, number, number]
  /**
   * Euler rotation [x, y, z] in radians for the resting pose.
   * Default: [0, π/8, 0] — slight 3/4 turn toward camera.
   */
  rotation?: [number, number, number]
}

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
   * Optional: path to a transparent PNG/WebP image (relative to /public).
   * Used by CharacterStage as a fallback when no GLB is available.
   */
  imagePath?: string
  /** Three.js placeholder primitive to render before GLB is available */
  primitive: TrackPrimitiveType
  /** Short icon emoji for badges */
  icon: string
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
    accentColor: '#60A5FA',   // blue-400
    modelPath: '/models/aiml.glb',
    primitive: 'icosahedron',
    icon: '🤖',
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity',
    character: 'Captain America',
    tagline: 'Shield the Digital Frontier',
    description:
      'From reverse engineering to ethical hacking and secure system design — defend the digital frontier with the resolve of a super-soldier.',
    accentColor: '#EF4444',   // red-500
    modelPath: '/models/cybersec.glb',
    primitive: 'torus',
    icon: '🛡️',
  },
  {
    id: 'web3',
    name: 'Web3 & Sustainability',
    character: 'Black Panther',
    tagline: 'Vibranium for the Planet',
    description:
      'Build decentralised applications, green-tech solutions, and blockchain-powered systems. Wakanda showed us — technology and nature can coexist.',
    accentColor: '#A855F7',   // purple-500
    modelPath: '/models/web3.glb',
    primitive: 'octahedron',
    icon: '🌿',
  },
  {
    id: 'robonyx',
    name: 'Robonyx (Buildathon)',
    character: 'Ultron',
    tagline: 'Forge the Autonomous Machines of Tomorrow',
    description:
      'The ultimate buildathon track — design, prototype, and program autonomous robotics, drones, and embedded hardware platforms. Forge what machines can become.',
    accentColor: '#F87171',   // red wireframe
    modelPath: '/models/robonyx.glb',
    primitive: 'dodecahedron',
    icon: '⚙️',
  },
  {
    id: 'coderun',
    name: 'CodeRun (DSA / Competitive Programming contest)',
    character: 'Doctor Strange',
    tagline: 'See Every Possible Solution',
    description:
      'A high-octane DSA and competitive programming contest. Bend time, peer through infinite algorithmic timelines, and engineer the optimal solution.',
    accentColor: '#F59E0B',   // amber-500 / gold
    modelPath: '/models/coderun.glb',
    primitive: 'torusKnot',
    icon: '✨',
  },
]
