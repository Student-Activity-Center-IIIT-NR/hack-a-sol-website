/**
 * src/three/TrackParticles.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified, scroll-driven soft light particle and transition system for Tracks:
 *
 * 1. Soft glow sprites:
 *    - Canvas-generated radial gradient texture with cubic falloff.
 *    - Additive blending, depthWrite false, toneMapped false.
 *    - Color lerped smoothly from the active track's accent color (~400ms).
 *
 * 2. Three depth layers:
 *    - Far: tiny, dim, high count, slow parallax.
 *    - Mid: medium size, moderate brightness, active parallax.
 *    - Near: a few soft bokeh blobs, strictly capped on-screen size, fades near camera.
 *
 * 3. Scroll behaviour:
 *    - Stretch into light streaks proportional to Lenis scroll velocity (~300ms decay).
 *    - Parallax layers move at different rates based on mouse & scroll.
 *    - Slight swirl toward the character's anchor position.
 *
 * 4. Chapter Transitions:
 *    - Expanding light-rift ring + brief soft flash when activeIndex changes.
 *    - Particle color smoothly transitions between track accents over ~400ms.
 *
 * 5. Performance & Accessibility:
 *    - Mobile & prefers-reduced-motion: ~25% particle count, no velocity streaks, fades only.
 *    - Points only, capped on-screen size (never large solid balls).
 */

import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { TRACKS } from "../data/tracks"
import { perfStore } from "../utils/perfStore"
import { scrollStore } from "../utils/scrollStore"

interface TrackParticlesProps {
  activeTrackIndex: number
  chapterProgress?: number
  sectionProgress?: number
  velocity?: number
}

// Generate smooth, soft radial glow sprite texture
function createSoftGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)")
    grad.addColorStop(0.2, "rgba(255, 255, 255, 0.85)")
    grad.addColorStop(0.45, "rgba(255, 255, 255, 0.35)")
    grad.addColorStop(0.75, "rgba(255, 255, 255, 0.08)")
    grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

// Custom shader for soft light particles with size clamp, near-cam fade, and velocity streaks
const particleVertexShader = /* glsl */ `
  uniform float uBaseSize;
  uniform float uMaxSize;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uParallax;
  uniform vec2  uMouse;

  attribute float aPhase;
  attribute float aScale;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Apply layer parallax
    pos.x += uMouse.x * uParallax * 0.4;
    pos.y += uMouse.y * uParallax * 0.3;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float camDist = -mvPosition.z;

    // Fade smoothly near camera (dist 1.2 to 2.2) to prevent any large clipped balls
    float nearFade = smoothstep(1.1, 2.0, camDist);

    // Subtle breathing pulse
    float pulse = 0.82 + 0.18 * sin(uTime * 2.2 + aPhase);

    // Velocity streak factor
    float streak = min(uVelocity * 0.16, 2.8);

    // Compute screen size with strict upper clamp
    float sizeAtten = uBaseSize * aScale * (220.0 / max(camDist, 0.6));
    gl_PointSize = clamp(sizeAtten * (1.0 + streak * 0.6), 1.0, uMaxSize);

    vAlpha = nearFade * pulse;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = /* glsl */ `
  uniform vec3      uColor;
  uniform float     uOpacity;
  uniform float     uVelocity;
  uniform sampler2D uTexture;

  varying float vAlpha;

  void main() {
    float streak = min(uVelocity * 0.16, 2.8);
    vec2 uv = gl_PointCoord - vec2(0.5);

    // Stretch into light streak along Y by squashing X coord
    uv.x *= (1.0 + streak * 1.5);
    float dist = length(uv);

    if (dist > 0.5) discard;

    // Soft cubic falloff
    float radial = smoothstep(0.5, 0.0, dist);
    float softFalloff = radial * radial;

    vec4 tex = texture2D(uTexture, uv + vec2(0.5));
    float alpha = softFalloff * tex.a * uOpacity * vAlpha;

    gl_FragColor = vec4(uColor, alpha);
  }
`

// Shader for the transition light-rift ring
const riftRingVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const riftRingFragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uAlpha;
  varying vec2  vUv;

  void main() {
    vec2 p = vUv - vec2(0.5);
    float d = length(p);
    // Thin ring between 0.44 and 0.50
    float ring = smoothstep(0.40, 0.47, d) * (1.0 - smoothstep(0.47, 0.50, d));
    gl_FragColor = vec4(uColor, ring * uAlpha);
  }
`

export function TrackParticles({
  activeTrackIndex,
  chapterProgress: _c,
  sectionProgress: _sp,
  velocity: _v = 0,
}: TrackParticlesProps) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    return perfStore.subscribe((t) => setEnabled(t.particlesEnvironments))
  }, [])

  const { size } = useThree()
  const isMobile = size.width < 768
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )

  const softGlowTexture = useMemo(() => createSoftGlowTexture(), [])

  // Color lerping state (~400ms transition between track accents)
  const currentColor = useRef(new THREE.Color(TRACKS[Math.max(0, activeTrackIndex)]?.accentColor ?? "#60A5FA"))
  const targetColor  = useRef(new THREE.Color(TRACKS[Math.max(0, activeTrackIndex)]?.accentColor ?? "#60A5FA"))

  // Velocity smoothing with ~300ms decay
  const smoothVel = useRef(0)
  const mouseSmooth = useRef({ x: 0, y: 0 })

  // Transition rift state
  const prevTrackIdx = useRef(activeTrackIndex)
  const riftProgress = useRef(1.0) // 0 -> 1 during 400ms transition
  const riftMeshRef  = useRef<THREE.Mesh>(null)
  const riftMatRef   = useRef<THREE.ShaderMaterial>(null)
  const flashLightRef = useRef<THREE.PointLight>(null)

  // Track switch trigger
  useEffect(() => {
    if (prevTrackIdx.current !== activeTrackIndex && activeTrackIndex >= 0) {
      targetColor.current.set(TRACKS[activeTrackIndex].accentColor)
      riftProgress.current = 0.0 // Start transition rift expansion
      prevTrackIdx.current = activeTrackIndex
    }
  }, [activeTrackIndex])

  // --- Depth Layer Counts ---
  const farCount  = isMobile || reducedMotion ? 90 : 360
  const midCount  = isMobile || reducedMotion ? 40 : 160
  const nearCount = isMobile || reducedMotion ? 5  : 18

  // Helper to generate particle layer buffer attributes
  const makeLayerData = (count: number, zMin: number, zMax: number, rX: number, rY: number) => {
    const pos = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const scales = new Float32Array(count)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * rX
      pos[i * 3 + 1] = (Math.random() - 0.5) * rY
      pos[i * 3 + 2] = zMin + Math.random() * (zMax - zMin)

      phases[i] = Math.random() * Math.PI * 2
      scales[i] = 0.7 + Math.random() * 0.6

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.15
      velocities[i * 3 + 1] = 0.15 + Math.random() * 0.35
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }
    return { pos, phases, scales, velocities }
  }

  // Generate the 3 depth layers
  const farData  = useMemo(() => makeLayerData(farCount,  -5.5, -2.0, 10.0, 7.0), [farCount])
  const midData  = useMemo(() => makeLayerData(midCount,  -2.0,  1.2,  8.0, 5.5), [midCount])
  const nearData = useMemo(() => makeLayerData(nearCount,  1.2,  2.6,  6.5, 4.5), [nearCount])

  // Refs for Points
  const farPointsRef  = useRef<THREE.Points>(null)
  const midPointsRef  = useRef<THREE.Points>(null)
  const nearPointsRef = useRef<THREE.Points>(null)

  // Refs for Materials
  const farMatRef  = useRef<THREE.ShaderMaterial>(null)
  const midMatRef  = useRef<THREE.ShaderMaterial>(null)
  const nearMatRef = useRef<THREE.ShaderMaterial>(null)

  // Track mouse coordinates
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseSmooth.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseSmooth.current.y = (e.clientY / window.innerHeight - 0.5) * -2
    }
    window.addEventListener("mousemove", onMouse, { passive: true })
    return () => window.removeEventListener("mousemove", onMouse)
  }, [])

  // Animation frame loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Smooth color lerp (~400ms transition)
    currentColor.current.lerp(targetColor.current, Math.min(1, delta * 7.5))

    // Smooth velocity with ~300ms decay
    const liveVel = scrollStore.getVelocity()
    const targetVel = reducedMotion ? 0 : Math.abs(liveVel)
    smoothVel.current = THREE.MathUtils.lerp(smoothVel.current, targetVel, Math.min(1, delta * 6.5))
    const curVel = smoothVel.current

    // Character anchor position: even tracks on right (+1.6), odd tracks on left (-1.6)
    const charX = activeTrackIndex % 2 === 0 ? 1.6 : -1.6

    // Update Materials Uniforms
    const updateMat = (mat: THREE.ShaderMaterial | null, opacity: number) => {
      if (!mat) return
      mat.uniforms.uColor.value.copy(currentColor.current)
      mat.uniforms.uVelocity.value = curVel
      mat.uniforms.uTime.value = t
      mat.uniforms.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y)
      // Fade overall during exit or extreme boundaries
      mat.uniforms.uOpacity.value = opacity
    }

    updateMat(farMatRef.current, 0.38)
    updateMat(midMatRef.current, 0.55)
    updateMat(nearMatRef.current, 0.28)

    // Gentle swirl toward character + upward drift for mid & near particles
    const applyMotion = (
      points: THREE.Points | null,
      posArray: Float32Array,
      velArray: Float32Array,
      swirlStrength: number,
      yBounds: [number, number]
    ) => {
      if (!points?.geometry?.attributes?.position) return
      const attr = points.geometry.attributes.position as THREE.BufferAttribute
      const count = attr.count

      for (let i = 0; i < count; i++) {
        // Slow vertical drift
        posArray[i * 3 + 1] += velArray[i * 3 + 1] * delta * (1.0 + curVel * 0.4)

        // Swirl around character
        const dx = posArray[i * 3 + 0] - charX
        const dy = posArray[i * 3 + 1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 0.1 && dist < 4.0) {
          const force = (1.0 - dist / 4.0) * swirlStrength * delta
          posArray[i * 3 + 0] -= (dy / dist) * force
          posArray[i * 3 + 1] += (dx / dist) * force * 0.5
        }

        // Wrap vertically
        if (posArray[i * 3 + 1] > yBounds[1]) {
          posArray[i * 3 + 1] = yBounds[0]
        }
      }
      attr.needsUpdate = true
    }

    if (!reducedMotion) {
      applyMotion(midPointsRef.current, midData.pos, midData.velocities, 0.25, [-3.0, 3.5])
      applyMotion(nearPointsRef.current, nearData.pos, nearData.velocities, 0.15, [-2.5, 3.0])
    }

    // Handle transition rift ring expansion and soft flash (~400ms)
    if (riftProgress.current < 1.0) {
      riftProgress.current = Math.min(1.0, riftProgress.current + delta / 0.4)
      const rp = riftProgress.current

      if (riftMeshRef.current && riftMatRef.current) {
        // Ring expands from 0.4 to 4.2
        const scale = 0.4 + rp * 3.8
        riftMeshRef.current.position.set(charX, 0, -0.4)
        riftMeshRef.current.scale.set(scale, scale, 1)

        // Opacity spikes then smoothly fades
        const alpha = (1.0 - rp) * 0.75
        riftMatRef.current.uniforms.uAlpha.value = alpha
        riftMatRef.current.uniforms.uColor.value.copy(currentColor.current)
      }

      if (flashLightRef.current) {
        const flashIntensity = Math.sin(rp * Math.PI) * 2.2
        flashLightRef.current.intensity = flashIntensity
        flashLightRef.current.color.copy(currentColor.current)
        flashLightRef.current.position.set(charX, 0, 0.5)
      }
    } else {
      if (riftMatRef.current) riftMatRef.current.uniforms.uAlpha.value = 0
      if (flashLightRef.current) flashLightRef.current.intensity = 0
    }
  })

  // Shader Uniform Definitions
  const farUniforms = useMemo(
    () => ({
      uBaseSize:      { value: isMobile ? 0.05 : 0.07 },
      uMaxSize:       { value: 16.0 },
      uVelocity:      { value: 0.0 },
      uTime:          { value: 0.0 },
      uParallax:      { value: 0.12 },
      uMouse:         { value: new THREE.Vector2() },
      uColor:         { value: new THREE.Color() },
      uOpacity:       { value: 0.35 },
      uTexture:       { value: softGlowTexture },
    }),
    [isMobile, softGlowTexture]
  )

  const midUniforms = useMemo(
    () => ({
      uBaseSize:      { value: isMobile ? 0.10 : 0.14 },
      uMaxSize:       { value: 34.0 },
      uVelocity:      { value: 0.0 },
      uTime:          { value: 0.0 },
      uParallax:      { value: 0.38 },
      uMouse:         { value: new THREE.Vector2() },
      uColor:         { value: new THREE.Color() },
      uOpacity:       { value: 0.55 },
      uTexture:       { value: softGlowTexture },
    }),
    [isMobile, softGlowTexture]
  )

  const nearUniforms = useMemo(
    () => ({
      uBaseSize:      { value: isMobile ? 0.22 : 0.32 },
      uMaxSize:       { value: 58.0 },
      uVelocity:      { value: 0.0 },
      uTime:          { value: 0.0 },
      uParallax:      { value: 0.75 },
      uMouse:         { value: new THREE.Vector2() },
      uColor:         { value: new THREE.Color() },
      uOpacity:       { value: 0.28 },
      uTexture:       { value: softGlowTexture },
    }),
    [isMobile, softGlowTexture]
  )

  const riftUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uAlpha: { value: 0.0 },
    }),
    []
  )

  if (!enabled) return null

  return (
    <group name="TrackParticles" position={[0, 0, 0]}>
      {/* 1. Far Depth Layer: Tiny, dim, high-count particles */}
      <points ref={farPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farData.pos, 3]} />
          <bufferAttribute attach="attributes-aPhase"   args={[farData.phases, 1]} />
          <bufferAttribute attach="attributes-aScale"   args={[farData.scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={farMatRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={farUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* 2. Mid Depth Layer: Medium size, swirl-responsive light sprites */}
      <points ref={midPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[midData.pos, 3]} />
          <bufferAttribute attach="attributes-aPhase"   args={[midData.phases, 1]} />
          <bufferAttribute attach="attributes-aScale"   args={[midData.scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={midMatRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={midUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* 3. Near Depth Layer: Soft bokeh blobs, capped on-screen size */}
      <points ref={nearPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearData.pos, 3]} />
          <bufferAttribute attach="attributes-aPhase"   args={[nearData.phases, 1]} />
          <bufferAttribute attach="attributes-aScale"   args={[nearData.scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={nearMatRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={nearUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* Transition Light-Rift Ring */}
      <mesh ref={riftMeshRef} position={[0, 0, -0.4]}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={riftMatRef}
          vertexShader={riftRingVertexShader}
          fragmentShader={riftRingFragmentShader}
          uniforms={riftUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Transition Soft Flash */}
      <pointLight ref={flashLightRef} distance={10} decay={2} intensity={0} />
    </group>
  )
}
