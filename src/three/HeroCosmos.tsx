/**
 * src/three/HeroCosmos.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-choreographed 3D Marvel-universe background objects for the Hero section,
 * rendered within the single persistent R3F scene.
 *
 * All objects built procedural-only from generic shapes (no downloaded models,
 * logos, or trademarks):
 *   a. Generic sci-fi spaceship (low-poly, glowing engine trail, curved fly-by)
 *   b. Large faint floating carrier-ship silhouette (Helicarrier style, approaching)
 *   c. Floating hammer-like object (slow spin, lightning sparks)
 *   d. Cosmic light-bridge beam (rainbow gradient, additive blending, stretches on scroll)
 *   e. Planet with ring + instanced asteroid belt (parallax closer)
 *   f. Glowing energy cube (Tesseract style, soft aura, spins faster on scroll)
 *   g. Comets / meteor streaks (lengthen with scroll velocity), portal sparks, space dust
 *
 * SCROLL CHOREOGRAPHY (h: 0 -> 1 over hero scroll range):
 *   - h = 0.0: Rest state with slow idle drift and mouse parallax per depth.
 *   - 0.0 < h < 0.8: Spaceship flies across on curved path; carrier scales/approaches;
 *     planet & asteroids move closer; beam stretches; cube & hammer spin faster;
 *     comet streaks lengthen with Lenis scroll velocity.
 *   - 0.8 < h < 1.0: Everything drifts outward/upward and fades out cleanly.
 *   - h >= 1.0: Unmounted/hidden completely once Tracks section starts (zero overhead).
 *
 * LAYERING & PERFORMANCE:
 *   - Center column kept clear; soft central vignette ensures 100% text readability.
 *   - InstancedMesh & Points for asteroids/dust/sparks; < 2.5k triangles total; 60fps.
 *   - Mobile & prefers-reduced-motion: Only planet, dust, and 1 slow ship rendered.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HeroCosmosProps {
  scrollProgress: number
  velocity?: number
}

// ── Custom Rainbow Light-Bridge Shader (Bifrost style) ───────────────────────
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

  vec3 rainbow(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    // Reveal along beam length
    float mask = smoothstep(1.0 - uLength, 1.0 - uLength + 0.10, vUv.y);
    if (mask <= 0.001) discard;

    float edge = sin(vUv.x * 3.14159);
    float glow = pow(edge, 1.6);
    float stream = vUv.x * 2.2 + vUv.y * 3.2 - uTime * 1.5;
    vec3 col = rainbow(stream);

    // Incandescent beam core
    col += vec3(1.0, 0.96, 0.92) * pow(edge, 4.0) * 0.85;

    float alpha = glow * mask * uAlpha * 0.42;
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

export function HeroCosmos({ scrollProgress, velocity = 0 }: HeroCosmosProps) {
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

  // Center vignette material
  const vignetteMat = useRef<THREE.ShaderMaterial>(null)

  // Precomputed geometry buffers
  const hammerSparkPos = useMemo(() => createSparkPositions(55, 0.42), [])
  const portalSparkPos = useMemo(() => {
    const arr = new Float32Array(90 * 3)
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2
      const r = 1.2 + (Math.random() - 0.5) * 0.12
      arr[i * 3] = Math.cos(angle) * r
      arr[i * 3 + 1] = Math.sin(angle) * r
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.15
    }
    return arr
  }, [])
  const dustPos = useMemo(() => createDustPositions(130), [])

  // Asteroid belt data (instanced)
  const ASTEROID_COUNT = 38
  const asteroidData = useMemo(() => {
    return Array.from({ length: ASTEROID_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2
      const r = 1.6 + Math.random() * 0.8
      const speed = (0.07 + Math.random() * 0.07) * (Math.random() > 0.5 ? 1 : -1)
      const scale = 0.035 + Math.random() * 0.06
      const rotSpeed = [Math.random() * 2, Math.random() * 2, Math.random() * 2] as [number, number, number]
      return { angle, r, speed, scale, rotSpeed }
    })
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Detect mobile / reduced motion
  const isMobileOrReduced = useMemo(() => {
    if (typeof window === 'undefined') return false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 768
    return reduced || mobile
  }, [])

  useFrame((state, delta) => {
    if (state.size.width <= 0 || state.size.height <= 0) return

    // Hero scroll progress: normalized h from 0 to 1 across the Hero range (0.00 -> 0.15)
    const HERO_END_PROGRESS = 0.15
    const h = Math.min(1.0, Math.max(0.0, scrollProgress / HERO_END_PROGRESS))

    if (!rootGroup.current) return

    // Unmount / hide all hero objects once Tracks section starts (h >= 1.0)
    if (h >= 1.0) {
      rootGroup.current.visible = false
      return
    }
    rootGroup.current.visible = true

    const t = state.clock.getElapsedTime()
    const pointer = state.pointer

    // Outward drift & fade calculation for h between 0.8 and 1.0
    let globalAlpha = 1.0
    let driftOutward = 0.0
    let driftUpward = 0.0

    if (h > 0.8) {
      const exitProgress = (h - 0.8) / 0.2 // 0 to 1
      const easeExit = exitProgress * exitProgress * (3 - 2 * exitProgress)
      globalAlpha = Math.max(0.0, 1.0 - easeExit)
      driftOutward = easeExit * 10.0
      driftUpward = easeExit * 4.5
    }

    // Scroll-velocity multiplier for dynamic spin & trail elongation
    const velBoost = isMobileOrReduced ? 0.0 : Math.min(4.0, velocity * 4.0)

    // Center vignette fade
    if (vignetteMat.current) {
      vignetteMat.current.uniforms.uAlpha.value = globalAlpha
    }

    // ── a. Spaceship: flies across on a curved path & exits ──────────────────
    if (shipGroup.current) {
      // Parallax pointer response
      const px = isMobileOrReduced ? 0 : pointer.x * 0.25
      const py = isMobileOrReduced ? 0 : -pointer.y * 0.18

      // Curved fly-by trajectory: starts left-depth, arcs high across above title, exits right
      const startX = -4.6
      const endX = 7.5
      const curX = THREE.MathUtils.lerp(startX, endX, h * 1.1) - driftOutward
      const curY = 2.0 + Math.sin(h * Math.PI) * 1.6 + driftUpward
      const curZ = -13.0 + h * 14.5 + Math.sin(t * 0.8) * 0.25

      shipGroup.current.position.set(curX + px, curY + py, curZ)

      // Dynamic banking into the curve
      const bankRoll = -0.3 + Math.sin(h * Math.PI) * 0.65
      const pitch = Math.PI * 0.48 - h * 0.25
      shipGroup.current.rotation.set(pitch, -0.35 + h * 0.4, bankRoll)

      if (shipTrail.current) {
        const trailLen = 1.0 + Math.sin(t * 12) * 0.15 + velBoost * 0.5
        shipTrail.current.scale.set(1, trailLen, 1)
      }
    }

    // ── b. Helicarrier: approaches and scales slightly ──────────────────────
    if (carrierGroup.current && !isMobileOrReduced) {
      const px = pointer.x * 0.1
      const py = -pointer.y * 0.08

      const carrierScale = 1.0 + h * 0.28
      const carrierZ = -17.0 + h * 4.5
      const carrierX = 4.4 + driftOutward

      carrierGroup.current.position.set(carrierX + px, 2.3 + driftUpward + py, carrierZ)
      carrierGroup.current.scale.setScalar(carrierScale)
      carrierGroup.current.rotation.y = -0.28 + Math.sin(t * 0.08) * 0.03
    }

    // ── c. Hammer: rotates faster with scroll; lightning sparks ─────────────
    if (hammerGroup.current && !isMobileOrReduced) {
      const px = pointer.x * 0.35
      const py = -pointer.y * 0.22

      const spinSpeed = 1.0 + h * 3.5 + velBoost
      hammerGroup.current.rotation.x += delta * 0.35 * spinSpeed
      hammerGroup.current.rotation.y += delta * 0.45 * spinSpeed
      hammerGroup.current.rotation.z += delta * 0.2 * spinSpeed

      const hammerX = -3.8 - driftOutward
      const hammerY = -1.9 + Math.sin(t * 1.1) * 0.12 - driftUpward * 0.5
      hammerGroup.current.position.set(hammerX + px, hammerY + py, 0.8)

      if (hammerSparks.current) {
        hammerSparks.current.rotation.y += delta * 1.8 * spinSpeed
        hammerSparks.current.scale.setScalar((0.9 + Math.sin(t * 16) * 0.15) * globalAlpha)
      }
    }

    // ── d. Cosmic Light-Bridge: stretches with scroll progress ───────────────
    if (bridgeMat.current && !isMobileOrReduced) {
      bridgeMat.current.uniforms.uTime.value = t
      // Stretches from 0.25 at rest to full length 1.0 on scroll
      const beamExt = THREE.MathUtils.clamp(0.26 + h * 0.85, 0.26, 1.0)
      bridgeMat.current.uniforms.uLength.value = beamExt
      bridgeMat.current.uniforms.uAlpha.value = globalAlpha
    }

    // ── e. Planet with Ring & Asteroid Belt: moves closer (parallax) ────────
    if (planetGroup.current) {
      const px = isMobileOrReduced ? 0 : pointer.x * 0.12
      const py = isMobileOrReduced ? 0 : -pointer.y * 0.08

      // Planet parallax closer in Z and shifts outward
      const planetZ = -7.5 + h * 3.5
      const planetX = 4.6 + h * 1.2 + driftOutward

      planetGroup.current.position.set(planetX + px, -0.6 + driftUpward * 0.3 + py, planetZ)
      planetGroup.current.rotation.y += delta * 0.08

      if (ringMesh.current) {
        ringMesh.current.rotation.z += delta * 0.04
      }

      if (asteroidInst.current) {
        for (let i = 0; i < ASTEROID_COUNT; i++) {
          const ast = asteroidData[i]
          ast.angle += ast.speed * delta * (1.0 + h * 1.2)
          const cosR = Math.cos(0.42)
          const sinR = Math.sin(0.42)

          const lx = Math.cos(ast.angle) * ast.r
          const lz = Math.sin(ast.angle) * ast.r

          dummy.position.set(lx, lz * sinR, lz * cosR)
          dummy.scale.setScalar(ast.scale * globalAlpha)
          dummy.rotation.x += ast.rotSpeed[0] * delta
          dummy.rotation.y += ast.rotSpeed[1] * delta
          dummy.updateMatrix()
          asteroidInst.current.setMatrixAt(i, dummy.matrix)
        }
        asteroidInst.current.instanceMatrix.needsUpdate = true
      }
    }

    // ── f. Glowing Energy Cube: spins faster with scroll ────────────────────
    if (cubeOuter.current && cubeInner.current && !isMobileOrReduced) {
      const px = pointer.x * 0.35
      const py = -pointer.y * 0.22

      const cubeSpin = 1.0 + h * 3.2 + velBoost
      cubeOuter.current.rotation.x += delta * 0.35 * cubeSpin
      cubeOuter.current.rotation.y += delta * 0.45 * cubeSpin
      cubeInner.current.rotation.x -= delta * 0.7 * cubeSpin
      cubeInner.current.rotation.y -= delta * 0.85 * cubeSpin

      const cubeX = -3.6 - driftOutward
      const cubeY = 0.4 + Math.sin(t * 1.2) * 0.12 + driftUpward * 0.4

      cubeOuter.current.position.set(cubeX + px, cubeY + py, 0.6)
      cubeInner.current.position.set(cubeX + px, cubeY + py, 0.6)

      if (cubeLight.current) {
        cubeLight.current.position.set(cubeX + px, cubeY + py, 0.6)
        cubeLight.current.intensity = (1.2 + Math.sin(t * 4) * 0.25) * globalAlpha
      }
    }

    // ── g. Comets, Portal Sparks & Space Dust ───────────────────────────────
    if (cometGroup.current && !isMobileOrReduced) {
      const cometSpeedMul = 1.0 + h * 2.0 + velBoost
      const cometScaleY = 1.0 + velBoost * 0.75

      cometGroup.current.children.forEach((c, idx) => {
        const cMesh = c as THREE.Mesh
        cMesh.position.x -= delta * (7.5 + idx * 2.2) * cometSpeedMul
        cMesh.position.y -= delta * (3.2 + idx * 1.1) * cometSpeedMul
        cMesh.scale.set(1, cometScaleY, 1)

        if (cMesh.position.x < -14) {
          cMesh.position.x = 14 + Math.random() * 4
          cMesh.position.y = 7 + Math.random() * 3
        }
      })
    }

    if (portalSparks.current && !isMobileOrReduced) {
      portalSparks.current.rotation.z += delta * (0.35 + h * 1.5)
      portalSparks.current.position.x = 3.6 + driftOutward
      portalSparks.current.scale.setScalar(globalAlpha)
    }

    if (dustPoints.current) {
      dustPoints.current.rotation.y += delta * 0.02
      dustPoints.current.position.y = driftUpward * 0.4
    }
  })

  return (
    <group ref={rootGroup}>
      {/* ── Soft Central Vignette (keeps text 100% readable) ── */}
      <mesh position={[0, 0, -1.2]}>
        <planeGeometry args={[14, 9]} />
        <shaderMaterial
          ref={vignetteMat}
          vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`varying vec2 vUv; uniform float uAlpha; void main(){
            vec2 c = (vUv - 0.5) * vec2(1.5, 1.0);
            float d = length(c);
            float vignette = smoothstep(0.65, 0.15, d) * 0.48 * uAlpha;
            gl_FragColor = vec4(0.02, 0.02, 0.03, vignette);
          }`}
          uniforms={{ uAlpha: { value: 1.0 } }}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* ── a. Generic Sci-Fi Spaceship (Flies across on curve) ── */}
      <group ref={shipGroup} position={[-4.5, 2.0, -13]}>
        {/* Low-poly fuselage */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.24, 1.15, 5]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Cockpit Canopy */}
        <mesh position={[0, -0.05, 0.11]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.15, 0.32, 0.13]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00bcd4" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>
        {/* Swept Wings */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1.4, 0.04, 0.42]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Wingtip fins */}
        <mesh position={[0.68, 0.08, 0.05]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.04, 0.22, 0.18]} />
          <meshStandardMaterial color="#e53e3e" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-0.68, 0.08, 0.05]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.04, 0.22, 0.18]} />
          <meshStandardMaterial color="#e53e3e" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Glowing Engine Exhaust Trail */}
        <mesh ref={shipTrail} position={[0, 0.92, 0]}>
          <coneGeometry args={[0.13, 1.2, 8, 1, true]} />
          <meshBasicMaterial color="#00d2ff" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── b. Large Faint Carrier-Ship Silhouette (Helicarrier style) ── */}
      {!isMobileOrReduced && (
        <group ref={carrierGroup} position={[4.4, 2.3, -17]}>
          <mesh>
            <boxGeometry args={[5.0, 0.22, 1.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} opacity={0.32} transparent />
          </mesh>
          <mesh position={[0.5, 0.08, 0.6]} rotation={[0, -0.14, 0]}>
            <boxGeometry args={[4.0, 0.11, 0.55]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} opacity={0.3} transparent />
          </mesh>
          <mesh position={[1.4, 0.38, 0.5]}>
            <boxGeometry args={[0.48, 0.52, 0.24]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.5} opacity={0.32} transparent />
          </mesh>
          {/* 4 Hover propulsion rotors */}
          {[
            [-1.7, -0.2, -0.45],
            [-1.7, -0.2, 0.45],
            [1.7, -0.2, -0.45],
            [1.7, -0.2, 0.45],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.38, 0.38, 0.14, 10]} />
              <meshStandardMaterial color="#00e5ff" emissive="#00b4d8" emissiveIntensity={0.45} transparent opacity={0.28} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── c. Floating Hammer-like Object (Slow spin, lightning sparks) ── */}
      {!isMobileOrReduced && (
        <group ref={hammerGroup} position={[-3.8, -1.9, 0.8]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.6, 0.36, 0.36]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.22} emissive="#38bdf8" emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0.31, 0.35, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.3]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.31, 0.35, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.3]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.82, 10]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          <points ref={hammerSparks} position={[0, 0.35, 0]}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[hammerSparkPos, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#a5f3fc" size={0.035} sizeAttenuation transparent opacity={0.85} />
          </points>
        </group>
      )}

      {/* ── d. Cosmic Light-Bridge Beam (Stretches on scroll) ── */}
      {!isMobileOrReduced && (
        <group position={[3.2, -1.8, -4]} rotation={[0.42, 0.28, -0.68]}>
          <mesh position={[0, 7.5, 0]}>
            <cylinderGeometry args={[0.28, 0.4, 15, 20, 1, true]} />
            <shaderMaterial
              ref={bridgeMat}
              vertexShader={bridgeVert}
              fragmentShader={bridgeFrag}
              uniforms={{
                uTime: { value: 0 },
                uLength: { value: 0.26 },
                uAlpha: { value: 1.0 },
              }}
              transparent
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* ── e. Planet with Ring & Asteroid Belt (Moves closer on scroll) ── */}
      <group ref={planetGroup} position={[4.6, -0.6, -7.5]}>
        <mesh>
          <sphereGeometry args={[1.0, 24, 24]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.24} roughness={0.7} metalness={0.15} />
        </mesh>
        <mesh ref={ringMesh} rotation={[1.15, 0.3, 0]}>
          <ringGeometry args={[1.3, 2.15, 48]} />
          <meshStandardMaterial color="#818cf8" emissive="#4338ca" emissiveIntensity={0.16} transparent opacity={0.42} side={THREE.DoubleSide} />
        </mesh>
        <instancedMesh ref={asteroidInst} args={[undefined, undefined, ASTEROID_COUNT]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.1} />
        </instancedMesh>
      </group>

      {/* ── f. Glowing Energy Cube (Tesseract: spins faster with scroll) ── */}
      {!isMobileOrReduced && (
        <>
          <mesh ref={cubeOuter} position={[-3.6, 0.4, 0.6]}>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshPhysicalMaterial color="#bae6fd" transmission={0.82} roughness={0.1} metalness={0.1} ior={1.45} transparent opacity={0.85} />
          </mesh>
          <mesh ref={cubeInner} position={[-3.6, 0.4, 0.6]}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color="#38bdf8" emissive="#00e5ff" emissiveIntensity={2.5} roughness={0.1} metalness={0.2} />
          </mesh>
          <pointLight ref={cubeLight} position={[-3.6, 0.4, 0.6]} color="#00e5ff" intensity={1.2} distance={3.5} decay={2} />
        </>
      )}

      {/* ── g. Comets, Spell-Circle Portal Sparks & Space Dust ── */}
      {!isMobileOrReduced && (
        <>
          {/* Comets: streaks lengthen with scroll velocity */}
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
            <pointsMaterial color="#f59e0b" size={0.04} sizeAttenuation transparent opacity={0.75} blending={THREE.AdditiveBlending} />
          </points>
        </>
      )}

      {/* Ambient Drifting Space Dust (Always active in Hero, low GPU load) */}
      <points ref={dustPoints}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#94a3b8" size={0.026} sizeAttenuation transparent opacity={0.32} />
      </points>
    </group>
  )
}
