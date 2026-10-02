/**
 * src/data/tracks.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all hackathon tracks.
 * Components MUST consume this array — never hardcode track data in JSX.
 *
 * modelPath: placeholder string. Replace with real .glb path when assets are ready.
 * type:      the placeholder primitive to render until GLB is loaded.
 */

export type TrackPrimitiveType =
  | 'icosahedron'
  | 'torus'
  | 'octahedron'
  | 'dodecahedron'
  | 'torusKnot'

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
  /** Path to the Draco GLB model (relative to /public). Placeholder for now. */
  modelPath: string
  /** Three.js placeholder primitive to render before GLB is available */
  primitive: TrackPrimitiveType
  /** Short icon emoji for badges */
  icon: string
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
    modelPath: '/models/iron-man.glb',
    primitive: 'icosahedron',
    icon: '🤖',
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity',
    character: 'Captain America',
    tagline: 'Shield the Digital World',
    description:
      'From reverse engineering to ethical hacking and secure system design — defend the digital frontier with the resolve of a super-soldier.',
    accentColor: '#EF4444',   // red-500
    modelPath: '/models/cap-shield.glb',
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
    modelPath: '/models/black-panther.glb',
    primitive: 'octahedron',
    icon: '🌿',
  },
  {
    id: 'robonyx',
    name: 'Robonyx',
    character: 'Ultron',
    tagline: 'Evolution Has No Off Switch',
    description:
      'The buildathon track — design, prototype, and program autonomous systems, drones, or robotic platforms. Show us what machines can become.',
    accentColor: '#F87171',   // red wireframe
    modelPath: '/models/ultron.glb',
    primitive: 'dodecahedron',
    icon: '⚙️',
  },
  {
    id: 'coderun',
    name: 'CodeRun',
    character: 'Doctor Strange',
    tagline: 'Master the Infinite Possibilities',
    description:
      'A high-octane DSA and competitive programming contest. Bend time, bend logic — solve what others cannot.',
    accentColor: '#F59E0B',   // amber-500 / gold
    modelPath: '/models/strange.glb',
    primitive: 'torusKnot',
    icon: '✨',
  },
]
