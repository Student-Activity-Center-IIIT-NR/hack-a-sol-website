import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { warnZeroSize, isPhoneDevice, clampBufferSize } from '../../utils/webglGuard';

/* ================= THE MULTIVERSE PORTAL (Fullscreen Rift Shader) ================= */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = `
varying vec2 vUv;
uniform float uTime, uAspect, uScale, uScroll, uPx, uSide;
uniform float uSig, uCrack, uLock, uPulseT;
uniform vec2 uMouse, uCenter, uLight;
#define TAU 6.2831853
#define PI 3.14159265

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x), mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float ln(float d, float w){ return 1.0 - smoothstep(0.0, w, d); }
float segd(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }

void main(){
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime;
  float iC = uCrack;
  float fade = 1.0 - smoothstep(0.25, 1.0, uScroll);
  float sc = uScale * mix(1.07, 1.0, uLock) * mix(1.0, 1.6, uScroll);
  float px = uPx / sc;
  vec2 ld = normalize(uLight - uCenter + vec2(0.0001));
  float brt = 0.85 + 0.15 * sin(t * 0.8);
  float dC = length(p - uCenter);

  // ---- fracture / dimensional tear ----
  vec2 qc = (p - uCenter - uMouse * 0.04) / sc;
  vec2 kc = rot(0.06) * qc;
  float L = max(0.56 * iC, 0.001);
  float yn = clamp(abs(kc.y) / L, 0.0, 1.0);
  float dx = kc.x - (noise(vec2(kc.y * 3.0, 4.0)) - 0.5) * 0.018;
  float W = 0.012 * pow(1.0 - yn * yn, 1.5) * (1.0 + 0.25 * sin(t * 1.3) + 0.15 * noise(vec2(t * 0.8, kc.y * 2.0)));
  float dEdge = abs(abs(dx) - W);
  float inTear = 1.0 - smoothstep(W - px * 1.5, W + px * 0.5, abs(dx));
  float lenM = 1.0 - smoothstep(0.6, 1.0, yn);
  float side = clamp(dx / (px * 2.0), -1.0, 1.0);
  float pull = exp(-abs(dx) * 14.0) * (1.0 - smoothstep(0.7, 1.0, yn)) * iC;
  vec2 dislocate = vec2(side * 0.006, side * 0.016) * pull;

  float ph = (t - uPulseT) / 1.7;
  float act = step(0.0, ph) * (1.0 - step(1.0, ph)) * sin(clamp(ph, 0.0, 1.0) * PI);
  float pY = mix(-L, L, clamp(ph, 0.0, 1.0));
  float pg = exp(-abs(kc.y - pY) * 14.0) * act;

  // ---- cosmic atmosphere: dark void, nebula haze, comic print grain ----
  vec2 bp = p + uMouse * 0.012;
  float cloud = fbm(bp * 1.5 + vec2(t * 0.010, -t * 0.007));
  vec3 col = vec3(0.0016, 0.0017, 0.0022);
  col += vec3(0.020, 0.0022, 0.003) * smoothstep(0.38, 0.9, cloud) * 0.8;
  vec2 gd = abs(fract((bp + 0.5) * 9.0) - 0.5);
  col += vec3(0.7, 0.75, 0.85) * max(smoothstep(0.485, 0.5, gd.x), smoothstep(0.485, 0.5, gd.y)) * 0.010 * exp(-dC * 2.2);
  vec2 cell = fract(rot(0.785) * (vUv * vec2(uAspect, 1.0)) * 85.0) - 0.5;
  float hm = smoothstep(0.25, 0.9, cloud) * (0.35 + 0.65 * smoothstep(0.2, 0.9, dC));
  float ht = (1.0 - smoothstep(0.42 * hm - 0.07, 0.42 * hm + 0.07, length(cell))) * smoothstep(0.03, 0.25, hm);
  col += vec3(0.014, 0.004, 0.005) * ht;
  
  // Ambient multiverse red glow radiating from portal center
  col += vec3(0.45, 0.04, 0.03) * exp(-dC * 2.6) * 0.22 * (0.8 + 0.5 * ht) * brt * fade;

  // ---- inner dimensional disc: two realities & vortex depth ----
  float R0 = 0.245;
  float rc = length(qc + dislocate * 0.4);
  float disc = 1.0 - smoothstep(R0 - px * 1.5, R0 + px * 0.5, rc);
  vec2 qi = qc - uMouse * 0.03;
  float ri = length(qi);
  float sideI = smoothstep(-0.006, 0.006, dx);
  float depthShade = 1.0 - smoothstep(0.0, R0, ri);
  float sw = fbm(rot(ri * 2.2 - t * 0.04) * qi * 3.0 + sideI * vec2(3.7, 1.3) + vec2(0.0, t * 0.05));
  vec3 tint = mix(vec3(0.020, 0.040, 0.075), vec3(0.14, 0.012, 0.014), sideI);
  float tun = (1.0 - smoothstep(0.0, 0.06, abs(fract(0.05 / (ri + 0.02) - t * 0.05) - 0.5))) * smoothstep(0.02, 0.08, ri);
  vec3 inner = vec3(0.0008, 0.0004, 0.0008);
  inner += tint * smoothstep(0.35, 0.95, sw) * (0.25 + 0.75 * depthShade);
  inner += mix(vec3(0.03, 0.045, 0.07), vec3(0.16, 0.02, 0.025), sideI) * tun * (0.3 + 0.7 * depthShade) * 0.5;
  inner += vec3(0.35, 0.03, 0.02) * pow(depthShade, 3.0) * 0.5 * sideI;
  col = mix(col, inner, disc * iC);

  // Initial signal pulse on breach opening
  col += vec3(0.9, 0.93, 1.0) * (ln(abs(rc - uSig * 0.16), px * 1.3) * (1.0 - uSig) * smoothstep(0.0, 0.1, uSig) * 0.9
       + (1.0 - smoothstep(0.0, px * 3.0, rc)) * smoothstep(0.0, 0.2, uSig) * (1.0 - iC) * 1.6);

  // ---- the tear / breach, travelling pulse, lightning branches, torn shards ----
  float within = inTear * (1.0 - clamp(abs(dx) / max(W, 0.0005), 0.0, 1.0));
  vec3 tearC = mix(vec3(0.88, 0.05, 0.06) * 1.25, vec3(1.0, 0.94, 0.90) * 1.5, pow(within, 1.4));
  float tm = lenM * brt * iC * fade * (0.94 + 0.06 * noise(vec2(t * 5.0, kc.y * 3.0))) * (1.0 + 0.7 * pg);
  col = mix(col, tearC, inTear * tm);
  col += vec3(1.0, 0.93, 0.88) * ln(dEdge, px * 1.2) * lenM * 0.8 * iC * fade;
  col += vec3(0.88, 0.05, 0.06) * exp(-dEdge * 28.0) * 0.35 * tm;
  col += vec3(0.88, 0.05, 0.06) * exp(-abs(dx) * 8.0) * disc * 0.06 * tm;
  col += vec3(1.0, 0.5, 0.4) * ln(abs(dx), px * 0.9) * (1.0 - smoothstep(0.9, 1.35, abs(kc.y) / L)) * 0.45 * iC * fade;

  // Lightning arcs along the breach
  float br = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float yb = (hash(vec2(fi + 1.0, uPulseT)) - 0.5) * 1.1 * L;
    float sg = hash(vec2(fi + 5.0, uPulseT)) > 0.5 ? 1.0 : -1.0;
    vec2 b0 = vec2(0.0, yb);
    vec2 b1 = b0 + vec2(sg * (0.05 + 0.06 * hash(vec2(fi, uPulseT + 2.0))), (hash(vec2(fi + 9.0, uPulseT)) - 0.5) * 0.12);
    vec2 bm = mix(b0, b1, 0.5) + vec2(0.0, 0.014 * sg);
    br += ln(min(segd(kc, b0, bm), segd(kc, bm, b1)), px * 1.3) * exp(-abs(yb - pY) * 16.0);
  }
  col += vec3(1.0, 0.55, 0.35) * br * act * 1.4 * fade;

  // Crystalline dimensional shards
  vec2 fg = vec2(kc.x * 10.0, kc.y * 10.0 + t * 0.15);
  vec2 cid = floor(fg), fl = fract(fg) - 0.5;
  float ga = hash(cid) * TAU;
  vec2 sd = vec2(cos(ga), sin(ga));
  float shard = ln(abs(dot(fl, vec2(-sd.y, sd.x))), px * 10.0) * step(abs(dot(fl, sd)), 0.12 + 0.1 * hash(cid + 1.0)) * step(0.86, hash(cid + 3.1));
  col += vec3(1.0, 0.35, 0.25) * shard * exp(-abs(kc.x) * 9.0) * 0.8 * lenM * iC * fade;

  // ---- Soft Dimensional Rift Event Horizon (organic cosmic glow, NO arc-reactor rings) ----
  float ac = atan(qc.y, qc.x);
  float hlc = 0.35 + 0.65 * pow(max(0.0, dot(vec2(cos(ac), sin(ac)), ld)), 2.5);
  col += vec3(0.92, 0.08, 0.06) * exp(-abs(rc - R0) * 18.0) * 0.42 * brt * iC * fade;
  col += vec3(1.0, 0.30, 0.20) * ln(abs(rc - R0), px * 1.8) * (0.35 + 0.6 * hlc) * iC * fade;
  col += vec3(0.60, 0.05, 0.04) * exp(-abs(rc - R0) * 6.0) * 0.25 * fade;

  col *= mix(1.0, mix(0.6, 1.0, smoothstep(uCenter.x - 0.8, uCenter.x - 0.15, p.x)), uSide);
  col *= 1.0 - 0.55 * smoothstep(0.35, 1.0, length(vUv - 0.5) * 1.25);
  gl_FragColor = vec4(col, 1.0);
}`;

/* ================= sparks: embers from the breach + faint motes ================= */
const PVERT = `
attribute vec4 aSeed;
uniform float uTime, uAspect, uScale, uPR, uScroll, uFlow, uAmb;
uniform vec2 uCenter, uMouse;
varying float vA; varying float vHot;
void main(){
  float s = aSeed.w;
  float depth = 0.3 + aSeed.y * 1.4;
  vec2 pos; float alpha; float size;
  if (s > 0.8) {
    float life = fract(aSeed.x + uTime * (0.035 + aSeed.z * 0.04));
    vec2 start = vec2((aSeed.y - 0.5) * 0.03, (aSeed.z - 0.5) * 0.35) * uScale;
    vec2 vel = vec2((aSeed.x - 0.5) * 0.9, 0.25 + aSeed.y * 0.5);
    pos = uCenter + start + vel * life * 0.45 * uScale;
    pos.x += sin(uTime * 0.6 + aSeed.x * 30.0) * 0.01 * life;
    alpha = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.35, 1.0, life)) * uFlow;
    vHot = 1.0 - life; size = 2.2;
  } else {
    float y = fract(aSeed.y + uTime * 0.004 * (0.4 + aSeed.z));
    pos = vec2((aSeed.x - 0.5) * uAspect * 1.15 + sin(uTime * 0.05 + aSeed.z * 40.0) * 0.02, (y - 0.5) * 1.1);
    alpha = 0.35 * (0.4 + aSeed.z * 0.6) * uAmb * smoothstep(0.0, 0.1, y) * (1.0 - smoothstep(0.9, 1.0, y));
    vHot = 0.0; size = 1.3;
  }
  if (s <= 0.8) {
    float dxm = pos.x - uCenter.x;
    float dir = aSeed.z > 0.5 ? 1.0 : -1.0;
    float near = exp(-abs(dxm) * 2.5) * exp(-abs(pos.y - uCenter.y) * 2.0);
    pos.x -= dxm * near * 0.35 * dir * (0.5 + 0.5 * sin(uTime * 0.3 + aSeed.x * 20.0));
  }
  pos += uMouse * 0.03 * depth;
  vA = alpha * (1.0 - smoothstep(0.2, 1.0, uScroll));
  gl_PointSize = size * (0.7 + depth * 0.5) * uPR;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
}`;
const PFRAG = `
varying float vA; varying float vHot;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.0, 0.5, d)) * vA;
  vec3 c = mix(vec3(0.8, 0.85, 0.95), vec3(0.9, 0.08, 0.06), vHot);
  gl_FragColor = vec4(c * 1.6, a);
}`;

/* ================= final grade: filmic rolloff, gamma, grain ================= */
const FinalShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGlitch: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uGlitch; varying vec2 vUv;
    float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      float row = floor(vUv.y * 38.0);
      float g = step(0.5, uGlitch) * step(0.82, rand(vec2(row, floor(uTime * 24.0))));
      vec2 uv = vUv + vec2(g * (rand(vec2(row, 3.0)) - 0.5) * 0.02, 0.0);
      vec3 c = texture2D(tDiffuse, uv).rgb;
      vec2 dir = uv - 0.5;
      float ca = 0.002 + 0.006 * length(dir);
      c.r = texture2D(tDiffuse, uv + dir * ca + vec2(g * 0.004, 0.0)).r;
      c.b = texture2D(tDiffuse, uv - dir * ca).b;
      c = 1.0 - exp(-c * 1.1);
      c = pow(c, vec3(0.4545));
      c += (rand(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 37.0) - 0.5) * 0.035;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

/* ================= 6 INFINITY STONES SPECIFICATION ================= */
// Blue (Space), Purple (Power), Red (Reality), Green (Time), Orange (Soul), Yellow (Mind)
const STONES = [
  { name: 'Space',   color: 0x00d2ff, emissive: 0x0088ff, intensity: 2.5, rFactor: 0.40, speed: 0.24, tilt: 0.25, geomType: 'octa' },
  { name: 'Power',   color: 0xcc22ff, emissive: 0x9900ee, intensity: 2.5, rFactor: 0.48, speed: -0.19, tilt: -0.32, geomType: 'ico' },
  { name: 'Reality', color: 0xff1e38, emissive: 0xee0824, intensity: 2.7, rFactor: 0.56, speed: 0.17, tilt: 0.40, geomType: 'elongated' },
  { name: 'Time',    color: 0x10ff66, emissive: 0x00cc44, intensity: 2.5, rFactor: 0.64, speed: -0.15, tilt: -0.22, geomType: 'octa' },
  { name: 'Soul',    color: 0xff7b00, emissive: 0xff5500, intensity: 2.6, rFactor: 0.72, speed: 0.13, tilt: 0.32, geomType: 'ico' },
  { name: 'Mind',    color: 0xffdd00, emissive: 0xffbb00, intensity: 2.5, rFactor: 0.80, speed: -0.11, tilt: -0.36, geomType: 'elongated' },
];

export function initHero(container) {
  const hero = container.parentElement;
  const isPhone = isPhoneDevice();
  const mobile = window.innerWidth < 768;
  let maxPR = isPhone ? 1 : (mobile ? 1.25 : 1.5);
  let aspect = 1;

  const U = {
    uTime: { value: 0 }, uAspect: { value: 1 }, uScale: { value: 0.8 },
    uScroll: { value: 0 }, uPx: { value: 0.001 }, uSide: { value: 1 }, uPR: { value: 1 },
    uSig: { value: 0 }, uCrack: { value: 0 }, uLock: { value: 0 },
    uFlow: { value: 0 }, uAmb: { value: 0 }, uPulseT: { value: -100 }, uGlitch: { value: 0 },
    uMouse: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2() }, uLight: { value: new THREE.Vector2(0.4, 0.1) },
  };

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);

  // Background dimensional rift shader
  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, depthTest: false, depthWrite: false })
  );
  bg.frustumCulled = false; bg.renderOrder = -1;
  scene.add(bg);

  // Sparks / embers rising from the breach
  const COUNT = (isPhone || mobile) ? 220 : 600;
  const seed = new Float32Array(COUNT * 4);
  for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const sparks = new THREE.Points(pg, new THREE.ShaderMaterial({
    vertexShader: PVERT, fragmentShader: PFRAG, uniforms: U,
    transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
  }));
  sparks.frustumCulled = false; sparks.renderOrder = 1;
  scene.add(sparks);

  // Scene lighting for 3D gemstone facets
  const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
  dirLight.position.set(1.5, 2.0, 2.5);
  scene.add(dirLight);

  // ---- 6 GLOWING INFINITY STONES ----
  const gemGroupRoot = new THREE.Group();
  gemGroupRoot.renderOrder = 2;
  scene.add(gemGroupRoot);

  const gemEntrance = { scale: 0, opacity: 0 };

  const gemItems = STONES.map((stone, index) => {
    const group = new THREE.Group();
    const gemRadius = mobile ? 0.019 : 0.023;

    let geom;
    if (stone.geomType === 'ico') {
      geom = new THREE.IcosahedronGeometry(gemRadius, 0);
    } else if (stone.geomType === 'elongated') {
      geom = new THREE.OctahedronGeometry(gemRadius, 0);
      geom.scale(0.85, 1.35, 0.85);
    } else {
      geom = new THREE.OctahedronGeometry(gemRadius, 0);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: stone.color,
      emissive: stone.emissive,
      emissiveIntensity: stone.intensity,
      roughness: 0.15,
      metalness: 0.35,
      flatShading: true,
      transparent: true,
      opacity: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    // Inner bright hot core for intense bloom highlight
    const coreGeom = new THREE.OctahedronGeometry(gemRadius * 0.42, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    group.add(coreMesh);

    // Local emissive point light for glow radiance
    const pLight = new THREE.PointLight(stone.color, 0.9, 0.35);
    group.add(pLight);

    gemGroupRoot.add(group);

    return {
      stone,
      index,
      group,
      mesh,
      geom,
      coreMesh,
      coreGeom,
      mat,
      coreMat,
      pLight,
      baseRadius: stone.rFactor,
      phase: (index * Math.PI * 2) / 6,
    };
  });

  // Postprocessing composer with UnrealBloomPass (disabled on phones)
  let composer = null;
  let bloom = null;
  let final = null;

  function initComposer() {
    if (isPhoneDevice()) return;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const initW = clampBufferSize(container.clientWidth || 1);
      const initH = clampBufferSize(container.clientHeight || 1);
      bloom = new UnrealBloomPass(new THREE.Vector2(initW, initH), 0.55, 0.45, 0.65);
      composer.addPass(bloom);
      final = new ShaderPass(FinalShader);
      composer.addPass(final);
    } catch {
      composer = null;
    }
  }

  if (!isPhone) {
    initComposer();
  }

  function resize() {
    const rawW = container.clientWidth;
    const rawH = container.clientHeight;
    if (rawW <= 0 || rawH <= 0) return;

    const isPhoneNow = isPhoneDevice();
    const w = clampBufferSize(rawW);
    const h = clampBufferSize(rawH);
    const pr = isPhoneNow ? 1 : Math.min(window.devicePixelRatio || 1, maxPR);
    aspect = w / h;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);

    if (isPhoneNow) {
      if (composer) {
        if (bloom && bloom.dispose) bloom.dispose();
        composer.dispose();
        composer = null;
        bloom = null;
        final = null;
      }
    } else {
      if (!composer) {
        initComposer();
      }
      if (composer) {
        composer.setPixelRatio(pr);
        composer.setSize(w, h);
      }
    }

    camera.left = -aspect / 2; camera.right = aspect / 2; camera.top = 0.5; camera.bottom = -0.5;
    camera.updateProjectionMatrix();

    const wide = aspect >= 1.1;
    const scale = THREE.MathUtils.clamp(aspect * 0.85, 0.5, 0.74);
    const cx = wide ? aspect * 0.27 : 0;
    const cy = wide ? 0.0 : 0.17;
    U.uAspect.value = aspect; U.uScale.value = scale; U.uSide.value = wide ? 1 : 0;
    U.uCenter.value.set(cx, cy);
    U.uPx.value = 1 / (h * pr); U.uPR.value = pr;

    hero.style.setProperty('--cx', (0.5 + cx / aspect) * w + 'px');
    hero.style.setProperty('--cy', (0.5 - cy) * h + 'px');
    hero.style.setProperty('--r', 0.5 * scale * h + 'px');
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  resize();

  // Pointer tracking
  const pt = new THREE.Vector2(), lt = new THREE.Vector2();
  let lastMove = -10;
  const onMove = (e) => {
    pt.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    lt.set((e.clientX / innerWidth - 0.5) * aspect, -(e.clientY / innerHeight - 0.5));
    lastMove = performance.now() / 1000;
  };
  window.addEventListener('pointermove', onMove);

  let visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
  io.observe(container);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nextPulse = Infinity, nextGlitch = Infinity;

  const t0 = performance.now() / 1000;
  let last = t0, frames = 0, acc = 0, raf;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    if (container.clientWidth <= 0 || container.clientHeight <= 0) {
      warnZeroSize('HeroScene');
      return;
    }
    const now = performance.now() / 1000, t = now - t0, dt = now - last;
    last = now;

    // Auto-downgrade on weak GPUs (desktop only)
    if (frames < 120 && !isPhoneDevice()) {
      if (frames > 20) acc += dt;
      if (++frames === 120 && acc / 99 > 0.034) {
        maxPR = 1;
        if (bloom) bloom.enabled = false;
        resize();
      }
    }

    const idle = now - lastMove > 3;
    if (idle) {
      pt.set(0, 0);
      lt.set(U.uCenter.value.x + Math.cos(t * 0.25) * 0.5, U.uCenter.value.y + Math.sin(t * 0.25) * 0.4);
    }
    U.uMouse.value.lerp(pt, 0.04);
    U.uLight.value.lerp(lt, 0.05);

    const ts = reduced ? t * 0.15 : t;
    if (t > nextPulse) { U.uPulseT.value = ts; nextPulse = t + 5 + Math.random() * 2.5; }
    if (t > nextGlitch) {
      U.uGlitch.value = 1; nextGlitch = t + 7 + Math.random() * 6;
      window.dispatchEvent(new Event('variant-glitch'));
      setTimeout(() => (U.uGlitch.value = 0), 110);
    }
    U.uTime.value = ts;
    if (final && final.uniforms) {
      final.uniforms.uTime.value = ts;
      final.uniforms.uGlitch.value = U.uGlitch.value;
    }

    // ---- ANIMATE ORBITING INFINITY STONES ----
    const scrollVal = U.uScroll.value; // 0 to 1
    const scaleVal = U.uScale.value;
    const center = U.uCenter.value;

    // On scroll: drift upward & outward, then smoothly fade before entering tracks section
    const scrollDriftY = scrollVal * 0.95;
    const scrollExpand = 1.0 + scrollVal * 2.4;
    const scrollFade = Math.max(0, 1.0 - scrollVal * 2.8);
    const activeOpacity = gemEntrance.opacity * scrollFade;
    const activeScale = gemEntrance.scale;

    gemItems.forEach((item) => {
      const { stone, group, mesh, mat, coreMat, pLight, baseRadius, phase } = item;
      const orbitSpeed = stone.speed * (reduced ? 0.3 : 1.0);
      const angle = ts * orbitSpeed + phase;
      const r = baseRadius * scaleVal * 0.72;

      // 3D tilted orbit around portal center
      const cosTilt = Math.cos(stone.tilt);
      const sinTilt = Math.sin(stone.tilt);
      const orbitX = Math.cos(angle) * r * scrollExpand;
      const orbitY = Math.sin(angle) * r * cosTilt * scrollExpand;
      const orbitZ = Math.sin(angle) * r * sinTilt;

      group.position.set(
        center.x + orbitX,
        center.y + orbitY + scrollDriftY,
        orbitZ
      );

      group.scale.setScalar(activeScale);

      // Slow tumbling faceted rotation
      mesh.rotation.x = ts * 0.65 + item.index;
      mesh.rotation.y = ts * 0.85 + item.index * 0.6;
      mesh.rotation.z = ts * 0.35;

      // Emissive & opacity adjustments
      mat.opacity = activeOpacity;
      coreMat.opacity = activeOpacity * 0.9;
      pLight.intensity = 0.9 * activeOpacity;
    });

    if (isPhoneDevice() || !composer) {
      renderer.render(scene, camera);
    } else {
      composer.render();
    }
  }
  tick();

  return {
    play() {
      if (reduced) {
        ['uSig', 'uCrack', 'uLock', 'uFlow', 'uAmb'].forEach((k) => (U[k].value = 1));
        gemEntrance.scale = 1;
        gemEntrance.opacity = 1;
        return;
      }
      const T = performance.now() / 1000 - t0;
      nextPulse = T + 2.4; nextGlitch = T + 9;
      gsap.timeline()
        .to(U.uAmb,   { value: 1, duration: 1.5 }, 0)
        .to(U.uSig,   { value: 1, duration: 0.9, ease: 'power2.out' }, 0.8)
        .to(U.uFlow,  { value: 1, duration: 0.8 }, 1.4)
        .to(U.uCrack, { value: 1, duration: 0.6, ease: 'power4.in' }, 1.6)
        .to(U.uLock,  { value: 1, duration: 0.7, ease: 'power3.out' }, 2.0);

      // Smooth gemstone entrance
      gsap.to(gemEntrance, {
        scale: 1,
        opacity: 1,
        duration: 1.6,
        delay: 1.2,
        ease: 'back.out(1.5)',
      });
    },
    setScroll(v) { U.uScroll.value = v; },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      ro.disconnect(); io.disconnect();
      bg.geometry.dispose(); bg.material.dispose(); pg.dispose(); sparks.material.dispose();
      gemItems.forEach((item) => {
        item.geom.dispose();
        item.mat.dispose();
        item.coreGeom.dispose();
        item.coreMat.dispose();
      });
      if (bloom && bloom.dispose) bloom.dispose();
      if (composer) composer.dispose();
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}