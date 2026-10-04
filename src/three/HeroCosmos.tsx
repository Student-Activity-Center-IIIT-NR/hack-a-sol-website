/**
 * src/three/HeroCosmos.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-driven 3D Marvel-universe background objects for the Hero section,
 * rendered in the single persistent R3F scene.
 *
 * All objects are procedural/generic (no downloaded models, no logos, no trademarks):
 *   a. Generic sci-fi spaceship (low-poly, glowing engine trail, flies in from depth)
 *   b. Large faint floating carrier-ship silhouette (Helicarrier style)
 *   c. Floating hammer-like object slowly spinning with lightning sparks
 *   d. Cosmic light-bridge beam (rainbow gradient, additive blending, extends on scroll)
 *   e. Planet with ring + instanced asteroid belt
 *   f. Glowing energy cube (Tesseract style: outer crystal cube + inner glowing core)
 *   g. Comets / meteor streaks, spell-circle portal sparks, and drifting space dust
 *
 * Flanks the sides and deep background so the center title remains 100% readable.
 * Fades out smoothly on scroll (0 -> 0.16) as the user leaves Hero.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HeroCosmosProps {
  scrollProgress: number
}

// ── Custom Rainbow Light-Bridge Shader ───────────────────────────────────────
const bridgeVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const bridgeFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uLength;
  uniform float uAlpha;

  // Cosine rainbow palette
  vec3 rainbow(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    // Reveal along beam length
    float mask = smoothstep(1.0 - uLength, 1.0 - uLength + 0.12, vUv.y);
    if (mask <= 0.001) discard;

    // Cylinder edge falloff
    float edge = sin(vUv.x * 3.14159);
    float glow = pow(edge, 1.6);

    // Flowing rainbow streams
    float stream = vUv.x * 2.0 + vUv.y * 3.0 - uTime * 1.4;
    vec3 col = rainbow(stream);

    // Hot central core
    col += vec3(1.0, 0.95, 0.9) * pow(edge, 4.0) * 0.8;

    float alpha = glow * mask * uAlpha * 0.45;
    gl_FragColor = vec4(col, alpha);
  }
`

// ── Particle Helpers ─────────────────────────────────────────────────────────
function createSparkPositions(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const r = radius * (0.8 + Math.random() * 0.4)
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.cos(phi)
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  return arr
}

function createDustPositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 22
    arr[i * 3 + 1] = (Math.random() - 0.5) * 14
    arr[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
  }
  return arr
}

export function HeroCosmos({ scrollProgress }: HeroCosmosProps) {
  const rootGroup = useRef<THREE.Group>(null)

  // Object A: Spaceship
  const shipGroup = useRef<THREE.Group>(null)
  const shipTrail = useRef<THREE.Mesh>(null)

  // Object B: Carrier ship
  const carrierGroup = useRef<THREE.Group>(null)

  // Object C: Hammer & lightning sparks
  const hammerGroup = useRef<THREE.Group>(null)
  const hammerSparks = useRef<THREE.Points>(null)

  // Object D: Light-bridge
  const bridgeMat = useRef<THREE.ShaderMaterial>(null)

  // Object E: Planet, ring, asteroid belt
  const planetGroup = useRef<THREE.Group>(null)
  const ringMesh = useRef<THREE.Mesh>(null)
  const asteroidInst = useRef<THREE.InstancedMesh>(null)

  // Object F: Energy cube
  const cubeOuter = useRef<THREE.Mesh>(null)
  const cubeInner = useRef<THREE.Mesh>(null)
  const cubeLight = useRef<THREE.PointLight>(null)

  // Object G: Comets, portal sparks, space dust
  const cometGroup = useRef<THREE.Group>(null)
  const portalSparks = useRef<THREE.Points>(null)
  const dustPoints = useRef<THREE.Points>(null)

  // Precomputed geometry buffers
  const hammerSparkPos = useMemo(() => createSparkPositions(70, 0.45), [])
  const portalSparkPos = useMemo(() => {
    const arr = new Float32Array(120 * 3)
    for (let i = 0; i < 120; i++) {
      const angle = (i / 120) * Math.PI * 2
      const r = 1.25 + (Math.random() - 0.5) * 0.15
      arr[i * 3] = Math.cos(angle) * r
      arr[i * 3 + 1] = Math.sin(angle) * r
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    return arr
  }, [])
  const dustPos = useMemo(() => createDustPositions(160), [])

  // Asteroid belt data
  const ASTEROID_COUNT = 45
  const asteroidData = useMemo(() => {
    return Array.from({ length: ASTEROID_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2
      const r = 1.7 + Math.random() * 0.9
      const speed = (0.08 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1)
      const scale = 0.04 + Math.random() * 0.07
      const rotSpeed = [Math.random() * 2, Math.random() * 2, Math.random() * 2] as [number, number, number]
      return { angle, r, speed, scale, rotSpeed }
    })
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Global fade out as scroll exits Hero (0 -> 0.16)
    const heroAlpha = Math.max(0, Math.min(1, 1.0 - scrollProgress / 0.16))

    if (!rootGroup.current) return
    if (heroAlpha <= 0.002) {
      rootGroup.current.visible = false
      return
    }
    rootGroup.current.visible = true

    // ── a. Spaceship: flies in from depth with glowing engine trail ─────────
    if (shipGroup.current) {
      // Scroll moves ship forward, time adds subtle banking hover
      const shipZ = -14 + scrollProgress * 55 + Math.sin(t * 0.8) * 0.4
      const shipX = -4.3 + Math.sin(t * 0.5) * 0.3
      const shipY = 2.0 + Math.cos(t * 0.6) * 0.25

      shipGroup.current.position.set(shipX, shipY, shipZ)
      shipGroup.current.rotation.set(
        Math.PI * 0.45 + Math.sin(t * 0.6) * 0.08,
        -0.35 + Math.cos(t * 0.5) * 0.12,
        Math.sin(t * 0.8) * 0.2,
      )

      if (shipTrail.current) {
        shipTrail.current.scale.set(1, 1 + Math.sin(t * 12) * 0.15, 1)
      }
    }

    // ── b. Helicarrier: slow majestic drift in the far background ───────────
    if (carrierGroup.current) {
      carrierGroup.current.position.x = 4.2 + Math.sin(t * 0.08) * 0.5
      carrierGroup.current.position.y = 2.4 + Math.cos(t * 0.1) * 0.2
      carrierGroup.current.rotation.y = -0.3 + Math.sin(t * 0.06) * 0.04
    }

    // ── c. Hammer: tumbling rotation with lightning sparks ───────────────────
    if (hammerGroup.current) {
      hammerGroup.current.rotation.x += delta * 0.35
      hammerGroup.current.rotation.y += delta * 0.45
      hammerGroup.current.rotation.z += delta * 0.2
      hammerGroup.current.position.y = -1.9 + Math.sin(t * 1.1) * 0.15

      if (hammerSparks.current) {
        hammerSparks.current.rotation.y += delta * 1.8
        hammerSparks.current.scale.setScalar(0.9 + Math.sin(t * 18) * 0.15)
      }
    }

    // ── d. Cosmic Light-Bridge: extends with scroll progress ────────────────
    if (bridgeMat.current) {
      bridgeMat.current.uniforms.uTime.value = t
      // Beam extends from 0.25 at rest to 1.0 as user scrolls
      const beamExt = THREE.MathUtils.clamp(0.28 + scrollProgress * 5.5, 0.28, 1.0)
      bridgeMat.current.uniforms.uLength.value = beamExt
      bridgeMat.current.uniforms.uAlpha.value = heroAlpha
    }

    // ── e. Planet, Ring & Asteroid Belt ──────────────────────────────────────
    if (planetGroup.current) {
      planetGroup.current.rotation.y += delta * 0.08
    }
    if (ringMesh.current) {
      ringMesh.current.rotation.z += delta * 0.04
    }
    if (asteroidInst.current) {
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        const ast = asteroidData[i]
        ast.angle += ast.speed * delta
        const cosR = Math.cos(0.42) // tilt of ring
        const sinR = Math.sin(0.42)

        const lx = Math.cos(ast.angle) * ast.r
        const lz = Math.sin(ast.angle) * ast.r
        const rx = lx
        const ry = lz * sinR
        const rz = lz * cosR

        dummy.position.set(rx, ry, rz)
        dummy.scale.setScalar(ast.scale)
        dummy.rotation.x += ast.rotSpeed[0] * delta
        dummy.rotation.y += ast.rotSpeed[1] * delta
        dummy.updateMatrix()
        asteroidInst.current.setMatrixAt(i, dummy.matrix)
      }
      asteroidInst.current.instanceMatrix.needsUpdate = true
    }

    // ── f. Glowing Energy Cube: slow tumbling rotation & soft pulse ─────────
    if (cubeOuter.current && cubeInner.current) {
      cubeOuter.current.rotation.x += delta * 0.35
      cubeOuter.current.rotation.y += delta * 0.45
      cubeInner.current.rotation.x -= delta * 0.7
      cubeInner.current.rotation.y -= delta * 0.85

      const cubeFloat = Math.sin(t * 1.2) * 0.12
      cubeOuter.current.position.y = 0.5 + cubeFloat
      cubeInner.current.position.y = 0.5 + cubeFloat

      if (cubeLight.current) {
        cubeLight.current.position.y = 0.5 + cubeFloat
        cubeLight.current.intensity = (1.2 + Math.sin(t * 4) * 0.25) * heroAlpha
      }
    }

    // ── g. Comets, Portal Sparks & Dust ─────────────────────────────────────
    if (cometGroup.current) {
      cometGroup.current.children.forEach((c, idx) => {
        const cMesh = c as THREE.Mesh
        cMesh.position.x -= delta * (7 + idx * 2)
        cMesh.position.y -= delta * (3 + idx * 1)
        if (cMesh.position.x < -14) {
          cMesh.position.x = 14 + Math.random() * 4
          cMesh.position.y = 7 + Math.random() * 3
        }
      })
    }
    if (portalSparks.current) {
      portalSparks.current.rotation.z += delta * 0.35
    }
    if (dustPoints.current) {
      dustPoints.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group ref={rootGroup}>
      {/* ── a. Generic Sci-Fi Spaceship (Upper Left Flank) ── */}
      <group ref={shipGroup} position={[-4.3, 2.0, -10]}>
        {/* Fuselage */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 1.2, 5]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Cockpit Canopy */}
        <mesh position={[0, -0.05, 0.12]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.16, 0.35, 0.14]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00bcd4" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
        {/* Swept Wings */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.04, 0.45]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Dual Wingtip Canards */}
        <mesh position={[0.72, 0.08, 0.05]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.04, 0.25, 0.2]} />
          <meshStandardMaterial color="#e53e3e" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-0.72, 0.08, 0.05]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.04, 0.25, 0.2]} />
          <meshStandardMaterial color="#e53e3e" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Glowing Engine Exhaust Trail */}
        <mesh ref={shipTrail} position={[0, 0.95, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.14, 1.2, 8, 1, true]} />
          <meshBasicMaterial color="#00d2ff" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── b. Large Faint Carrier-Ship Silhouette (Far Depth, Upper Right) ── */}
      <group ref={carrierGroup} position={[4.5, 2.3, -17]}>
        {/* Main Hull / Flight Deck */}
        <mesh>
          <boxGeometry args={[5.2, 0.25, 1.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} opacity={0.35} transparent />
        </mesh>
        {/* Angled Outrigger Deck */}
        <mesh position={[0.5, 0.08, 0.65]} rotation={[0, -0.14, 0]}>
          <boxGeometry args={[4.2, 0.12, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} opacity={0.32} transparent />
        </mesh>
        {/* Bridge Island */}
        <mesh position={[1.4, 0.4, 0.55]}>
          <boxGeometry args={[0.5, 0.55, 0.25]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.5} opacity={0.35} transparent />
        </mesh>
        {/* 4 Hover Propulsion Rotors (underneath with cyan glow) */}
        {[
          [-1.8, -0.22, -0.5],
          [-1.8, -0.22, 0.5],
          [1.8, -0.22, -0.5],
          [1.8, -0.22, 0.5],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.42, 0.42, 0.16, 12]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00b4d8"
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* ── c. Floating Hammer-Like Object (Lower Left Flank) ── */}
      <group ref={hammerGroup} position={[-3.8, -1.9, 0.8]}>
        {/* Hammer Head (beveled block) */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.62, 0.38, 0.38]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.88}
            roughness={0.22}
            emissive="#38bdf8"
            emissiveIntensity={0.12}
          />
        </mesh>
        {/* End Caps */}
        <mesh position={[0.32, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.32, 0.32]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.32, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.32, 0.32]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.85, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        {/* Leather Ring Bands on Handle */}
        {[-0.1, -0.25, -0.4].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.04, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        ))}
        {/* Pommel Base */}
        <mesh position={[0, -0.68, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.06, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Lightning Sparks flickering around head */}
        <points ref={hammerSparks} position={[0, 0.35, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[hammerSparkPos, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#a5f3fc" size={0.035} sizeAttenuation transparent opacity={0.85} />
        </points>
      </group>

      {/* ── d. Cosmic Light-Bridge Beam (Extends as You Scroll) ── */}
      <group position={[3.2, -1.8, -4]} rotation={[0.42, 0.28, -0.68]}>
        <mesh position={[0, 7.5, 0]}>
          <cylinderGeometry args={[0.3, 0.42, 15, 24, 1, true]} />
          <shaderMaterial
            ref={bridgeMat}
            vertexShader={bridgeVert}
            fragmentShader={bridgeFrag}
            uniforms={{
              uTime: { value: 0 },
              uLength: { value: 0.28 },
              uAlpha: { value: 1.0 },
            }}
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── e. Planet with Ring & Instanced Asteroid Belt (Right Flank) ── */}
      <group ref={planetGroup} position={[4.6, -0.6, -7.5]}>
        {/* Planet Sphere */}
        <mesh>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#312e81"
            emissiveIntensity={0.25}
            roughness={0.7}
            metalness={0.15}
          />
        </mesh>
        {/* Planetary Ring */}
        <mesh ref={ringMesh} rotation={[1.15, 0.3, 0]}>
          <ringGeometry args={[1.35, 2.25, 64]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#4338ca"
            emissiveIntensity={0.18}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Instanced Asteroid Belt */}
        <instancedMesh ref={asteroidInst} args={[undefined, undefined, ASTEROID_COUNT]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.1} />
        </instancedMesh>
      </group>

      {/* ── f. Glowing Energy Cube (Tesseract, Upper Left Mid-Ground) ── */}
      <group position={[-3.6, 0.4, 0.6]}>
        {/* Outer Transparent Crystal Cube */}
        <mesh ref={cubeOuter}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transmission={0.82}
            roughness={0.1}
            metalness={0.1}
            ior={1.45}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Inner Luminous Core */}
        <mesh ref={cubeInner}>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#00e5ff"
            emissiveIntensity={2.5}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        {/* Soft Radial Point Light */}
        <pointLight ref={cubeLight} color="#00e5ff" intensity={1.2} distance={3.5} decay={2} />
      </group>

      {/* ── g. Comets, Spell-Circle Portal Sparks & Space Dust ── */}
      {/* Comet Streaks */}
      <group ref={cometGroup}>
        {[
          [8, 5, -8],
          [12, 3, -12],
          [6, 6, -10],
        ].map((initPos, idx) => (
          <mesh key={idx} position={initPos as [number, number, number]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.03, 1.8, 4]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>

      {/* Spell-Circle Portal Sparks Ring (Upper Right) */}
      <points ref={portalSparks} position={[3.6, 1.8, -2]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[portalSparkPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#f59e0b"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Ambient Drifting Space Dust */}
      <points ref={dustPoints}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#94a3b8" size={0.028} sizeAttenuation transparent opacity={0.35} />
      </points>
    </group>
  )
}
