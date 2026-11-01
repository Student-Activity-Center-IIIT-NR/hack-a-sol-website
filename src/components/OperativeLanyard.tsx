/**
 * src/components/OperativeLanyard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Rope-joint lanyard in the style of React Bits' <Lanyard />, built from
 * @react-three/fiber + @react-three/rapier. Differences from the original:
 *  - no GLB / PNG assets: the card is two textured planes and the strap is a
 *    ribbon mesh with a canvas-drawn texture (no `meshline` dependency)
 *  - card faces are <canvas> elements rendered from the page's DOM cards
 *  - clicking the card (without dragging) calls onFlip; the card turns smoothly
 *
 * npm i three @react-three/fiber @react-three/drei @react-three/rapier
 * npm i -D @types/three
 * (fiber v8 for React 18, fiber v9 for React 19)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'

const CW = 1.6
const CH = (CW * 540) / 340 // matches the 340×540 DOM card
const CLIP_Y = CH / 2 + 0.3 // where the rope attaches, above the card
const N = 32 // ribbon samples
const HALF_W = 0.2 // half strap width (world units)
const REPEAT = 1 // strap texture repeats along its length

export interface LanyardProps {
  front?: HTMLCanvasElement
  back?: HTMLCanvasElement
  flipped: boolean
  onFlip: () => void
  /** Text printed on the strap, e.g. "HACK-A-SOL 5.0" */
  label: string
  /** Increment to give the card a little shove. */
  kick: number
}

function useCanvasTexture(canvas?: HTMLCanvasElement) {
  const gl = useThree((s) => s.gl)
  const tex = useMemo(() => {
    if (!canvas) return undefined
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = gl.capabilities.getMaxAnisotropy()
    return t
  }, [canvas, gl])
  useEffect(() => () => tex?.dispose(), [tex])
  return tex
}

function useStrapTexture(label: string) {
  return useMemo(() => {
    const W = 2048, H = 256
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const t = new THREE.CanvasTexture(c)
    t.wrapS = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    const draw = () => {
      const g = c.getContext('2d')
      if (!g) return
      g.setTransform(1, 0, 0, 1, 0, 0)
      g.clearRect(0, 0, W, H) // transparent margins → soft, anti-aliased edges
      const y0 = 10, y1 = H - 10
      const body = g.createLinearGradient(0, y0, 0, y1)
      body.addColorStop(0, '#1d070b')
      body.addColorStop(0.5, '#2c0a10')
      body.addColorStop(1, '#1d070b')
      g.fillStyle = body
      g.fillRect(0, y0, W, y1 - y0)
      // fine weave
      g.fillStyle = 'rgba(255,255,255,0.035)'
      for (let x = 0; x < W; x += 6) g.fillRect(x, y0, 2, y1 - y0)
      // slim red edge piping
      g.fillStyle = '#b3121a'
      g.fillRect(0, y0 + 14, W, 8)
      g.fillRect(0, y1 - 22, W, 8)
      // lettering
      g.font = '700 118px "Barlow Condensed", sans-serif'
      g.textBaseline = 'middle'
      g.fillStyle = '#f4ece1'
      const unit = `${label.toUpperCase()}   ◆   `
      const w = g.measureText(unit).width || 1
      const n = Math.max(1, Math.round(W / w))
      g.save()
      g.scale(W / (n * w), 1) // whole number of units per tile → seamless
      for (let k = 0; k < n; k++) g.fillText(unit, k * w, H / 2 + 6)
      g.restore()
      t.needsUpdate = true
    }
    draw()
    document.fonts?.ready.then(draw)
    return t
  }, [label])
}

function Band({ front, back, flipped, onFlip, label, kick }: LanyardProps) {
  const fixed = useRef<RapierRigidBody>(null)
  const j1 = useRef<RapierRigidBody>(null)
  const j2 = useRef<RapierRigidBody>(null)
  const j3 = useRef<RapierRigidBody>(null)
  const card = useRef<RapierRigidBody>(null)
  const ribbon = useRef<THREE.Mesh>(null)
  const flipRef = useRef<THREE.Group>(null)
  const press = useRef({ x: 0, y: 0, t: 0 })
  const restY = useRef<number | null>(null) // card centre height once it has settled
  const clock = useRef(0)

  const vec = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const ang = useMemo(() => new THREE.Vector3(), [])
  const rot = useMemo(() => new THREE.Vector3(), [])
  const curve = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
    c.curveType = 'chordal'
    return c
  }, [])

  const dragPos = useRef(new THREE.Vector3())
  const samples = useMemo(() => Array.from({ length: N }, () => new THREE.Vector3()), [])

  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false)
  const [hovered, setHovered] = useState(false)

  const frontTex = useCanvasTexture(front)
  const backTex = useCanvasTexture(back)
  const strapTex = useStrapTexture(label)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3))
    const uv = new Float32Array(N * 2 * 2)
    for (let i = 0; i < N; i++) {
      const u = (i / (N - 1)) * REPEAT
      uv.set([u, 0, u, 1], i * 4)
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const idx: number[] = []
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    g.setIndex(idx)
    return g
  }, [])

  const seg = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 }

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, CLIP_Y, 0]])

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered, dragged])

  useEffect(() => {
    if (!kick) return
    card.current?.wakeUp()
    card.current?.applyImpulse({ x: 0.2, y: 0, z: 0.15 }, true)
  }, [kick])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30)
    const c = card.current, f = fixed.current, a = j1.current, b = j2.current, d = j3.current
    if (!c || !f || !a || !b || !d) return

    // ── auto-frame: once the card has settled, fit the camera to the WHOLE ID ──
    clock.current += delta
    if (!dragged && clock.current > 1.5) {
      const y = c.translation().y
      // follow the card's average height slowly (no need to wait for it to stop swinging)
      restY.current = restY.current === null ? y : THREE.MathUtils.damp(restY.current, y, 0.8, delta)
    }
    if (restY.current !== null) {
      const cam = state.camera as THREE.PerspectiveCamera
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
      const aspect = state.size.width / state.size.height
      const top = restY.current + CLIP_Y + 0.65 // ring + a little strap
      const bottom = restY.current - CH / 2 - 0.12 // just under the card
      const zV = (top - bottom) / (2 * tanHalf)
      const zH = (CW + 1.4) / aspect / (2 * tanHalf) // keep room to swing sideways
      cam.position.y = THREE.MathUtils.damp(cam.position.y, (top + bottom) / 2, 4, delta)
      cam.position.z = THREE.MathUtils.damp(cam.position.z, Math.max(zV, zH), 4, delta)
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.copy(state.camera.position).addScaledVector(dir, -state.camera.position.z / dir.z)
      ;[c, a, b, d, f].forEach((r) => r.wakeUp())
      const k = 28
      dragPos.current.set(
        THREE.MathUtils.damp(dragPos.current.x, vec.x - dragged.x, k, delta),
        THREE.MathUtils.damp(dragPos.current.y, vec.y - dragged.y, k, delta),
        THREE.MathUtils.damp(dragPos.current.z, vec.z - dragged.z, k, delta),
      )
      c.setNextKinematicTranslation(dragPos.current)
    }

    // smoothed rope points: [card end, j2, j1, anchor]
    const smooth = (body: RapierRigidBody, i: number) => {
      const bd = body as unknown as { lerped?: THREE.Vector3 }
      const p = body.translation() as unknown as THREE.Vector3
      bd.lerped ||= new THREE.Vector3().copy(p)
      const dist = Math.max(0.1, Math.min(1, bd.lerped.distanceTo(p)))
      bd.lerped.lerp(p, delta * (10 + dist * 40))
      curve.points[i].copy(bd.lerped)
    }
    curve.points[0].copy(d.translation() as unknown as THREE.Vector3)
    smooth(b, 1)
    smooth(a, 2)
    curve.points[3].copy(f.translation() as unknown as THREE.Vector3)

    // ribbon: row r (u from the top anchor down to the card)
    for (let k = 0; k < N; k++) curve.getPoint(k / (N - 1), samples[k])
    const pts = samples
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    for (let r = 0; r < N; r++) {
      const i = N - 1 - r
      const p = pts[i]
      const pv = pts[Math.max(i - 1, 0)]
      const nx = pts[Math.min(i + 1, N - 1)]
      const tx = nx.x - pv.x, ty = nx.y - pv.y
      const l = Math.hypot(tx, ty) || 1
      const ox = (-ty / l) * HALF_W, oy = (tx / l) * HALF_W
      pos.setXYZ(r * 2, p.x + ox, p.y + oy, p.z)
      pos.setXYZ(r * 2 + 1, p.x - ox, p.y - oy, p.z)
    }
    pos.needsUpdate = true

    // keep the card from spinning, then flip smoothly
    ang.copy(c.angvel() as unknown as THREE.Vector3)
    rot.copy(c.rotation() as unknown as THREE.Vector3)
    c.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
    if (flipRef.current) {
      flipRef.current.rotation.y = THREE.MathUtils.damp(flipRef.current.rotation.y, flipped ? Math.PI : 0, 6, delta)
    }
  })

  return (
    <>
      <group position={[0, 3.65, 0]}>
        <RigidBody ref={fixed} {...seg} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...seg}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...seg}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...seg}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...seg} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[CW / 2, CH / 2, 0.01]} />
          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={(e) => {
              e.stopPropagation()
              const t = e.target as Element
              t.setPointerCapture(e.pointerId)
              press.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: performance.now() }
              dragPos.current.copy(card.current!.translation() as unknown as THREE.Vector3)
              setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation() as unknown as THREE.Vector3)))
            }}
            onPointerUp={(e) => {
              e.stopPropagation()
              const t = e.target as Element
              t.releasePointerCapture(e.pointerId)
              setDragged(false)
              const moved = Math.hypot(e.nativeEvent.clientX - press.current.x, e.nativeEvent.clientY - press.current.y)
              if (moved < 8 && performance.now() - press.current.t < 700) onFlip()
            }}
          >
            {/* card faces */}
            <group ref={flipRef}>
              <mesh position={[0, 0, 0.012]}>
                <planeGeometry args={[CW, CH]} />
                <meshBasicMaterial key={frontTex ? 'tex' : 'blank'} map={frontTex} color={frontTex ? '#ffffff' : '#240509'} transparent alphaTest={0.02} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[CW, CH]} />
                <meshBasicMaterial key={backTex ? 'tex' : 'blank'} map={backTex} color={backTex ? '#ffffff' : '#240509'} transparent alphaTest={0.02} toneMapped={false} />
              </mesh>
            </group>
            {/* steel clip + ring */}
            <RoundedBox args={[0.42, 0.2, 0.07]} radius={0.045} smoothness={4} position={[0, CH / 2 + 0.07, 0]}>
              <meshStandardMaterial color="#cfc8bc" metalness={1} roughness={0.25} />
            </RoundedBox>
            <mesh position={[0, CLIP_Y - 0.06, 0]}>
              <torusGeometry args={[0.085, 0.026, 12, 24]} />
              <meshStandardMaterial color="#cfc8bc" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* strap */}
      <mesh ref={ribbon} geometry={geo} frustumCulled={false}>
        <meshBasicMaterial map={strapTex} side={THREE.DoubleSide} transparent alphaTest={0.01} toneMapped={false} />
      </mesh>
    </>
  )
}

export function OperativeLanyard(props: LanyardProps) {
  return (
    <Canvas
      camera={{ position: [0, -0.5, 11.0], fov: 20 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
    >
      <ambientLight intensity={Math.PI} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60} interpolate>
        <Band {...props} />
      </Physics>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  )
}