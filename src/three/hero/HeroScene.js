import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/* ================= THE BREACH (one fullscreen shader) ================= */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = `
varying vec2 vUv;
uniform float uTime, uAspect, uScale, uScroll, uPx, uSide;
uniform float uSig, uR1, uR2, uCrack, uLock, uPulseT;
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
  float iT = uR1, iD = uR2, iC = uCrack;
  float fade = 1.0 - smoothstep(0.25, 1.0, uScroll);
  float sc = uScale * mix(1.07, 1.0, uLock) * mix(1.0, 1.6, uScroll);
  float px = uPx / sc;
  vec2 ld = normalize(uLight - uCenter + vec2(0.0001));
  float brt = 0.85 + 0.15 * sin(t * 0.8);
  float dC = length(p - uCenter);

  // ---- fracture first: it drives light, displacement, pulses ----
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

  // ---- environment: near-black, haze, faint grid, comic print ----
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
  col += vec3(0.35, 0.03, 0.025) * exp(-dC * 3.0) * 0.07 * (0.7 + 0.6 * ht) * brt * iD * fade;

  // ---- shared ring frame ----
  vec2 q = (p - uCenter - uMouse * 0.02) / sc + dislocate;
  float r = length(q);
  float a = atan(q.y, q.x);
  float hl = 0.30 + 0.70 * pow(max(0.0, dot(vec2(cos(a), sin(a)), ld)), 2.5);
  vec3 ringC = mix(vec3(0.80, 0.84, 0.92), vec3(0.9, 0.1, 0.08), exp(-abs(kc.x) * 5.0) * 0.7 * brt);

  // ---- LAYER 1: engineered outer ring (draws on as a sweep) ----
  float draw = step((a + PI) / TAU, iT * 1.02);
  float rT = 0.0;
  rT += ln(abs(r - 0.58), px * 1.1) * 0.25;
  rT += ln(abs(r - 0.50), px * 1.2) * 0.55;
  rT += ln(abs(r - 0.565), px * 1.2) * step(0.12, fract((a + t * 0.04) / TAU * 36.0)) * 0.35;
  rT += ln(abs(r - 0.50), px * 1.6) * pow(fract((t * 0.9 - a) / TAU), 6.0) * 1.1;
  float tk  = 1.0 - smoothstep(0.0, 0.08, abs(fract(a / TAU * 180.0) - 0.5));
  float tkL = 1.0 - smoothstep(0.0, 0.05, abs(fract(a / TAU * 30.0) - 0.5));
  rT += (tk * step(abs(r - 0.535), 0.006) + tkL * step(abs(r - 0.538), 0.012)) * 0.5;
  float cd = abs(fract(a / TAU * 4.0 + 0.5) - 0.5);
  rT += (1.0 - smoothstep(0.0, 0.004, cd)) * step(abs(r - 0.545), 0.075) * 0.7;
  col += ringC * rT * draw * hl * fade;

  // ---- LAYER 3: dimensional ring, deliberately off-plane ----
  vec2 qm = q + vec2(0.011, -0.007) + uMouse * 0.012;
  float rm = length(qm), am = atan(qm.y, qm.x);
  float a1 = am + t * 0.035;
  float s1 = mod(floor(a1 / TAU * 28.0), 28.0);
  float h1 = hash(vec2(s1, 4.7)), h2 = hash(vec2(s1, 9.1)), h3 = hash(vec2(s1, 1.3));
  float on1 = step(h1 * 0.8, iD);
  float lx = (fract(a1 / TAU * 28.0) - 0.5) * 0.2244 * rm;
  float ly = rm - 0.455;
  float rD = 0.0;
  rD += ln(abs(ly), px * 1.3) * step(0.3, h1) * on1 * 0.75;
  rD += ln(abs(lx), px * 1.1) * step(0.008, ly) * step(ly, 0.008 + 0.03 * h1) * step(0.45, h1) * on1 * 0.8;
  rD += ln(abs(ly - (0.018 + 0.012 * h2)), px * 1.1) * step(abs(lx), 0.028 * (0.5 + h2)) * step(0.55, h2) * on1 * 0.7;
  rD += (1.0 - smoothstep(0.003, 0.006, length(vec2(lx, ly - 0.036)))) * step(0.78, h3) * on1 * 0.9;
  vec2 qn = rot(0.5) * q * vec2(1.0, 1.07);
  float rn = length(qn), a2 = atan(qn.y, qn.x) - t * 0.05;
  rD += ln(abs(rn - 0.395), px * 1.3) * step(0.4, hash(vec2(mod(floor(a2 / TAU * 17.0), 17.0), 2.2))) * 0.6;
  rD += ln(abs(rn - 0.375), px * 3.0) * step(0.72, hash(vec2(mod(floor(a2 / TAU * 7.0), 7.0), 5.5))) * 0.4;
  vec2 sqa = rot(t * 0.02 + 0.3) * q, sqb = rot(-t * 0.014 + 1.085) * q;
  float gm = step(0.25, hash(vec2(mod(floor(a / TAU * 12.0), 12.0), 8.8)));
  rD += ln(abs(max(abs(sqa.x), abs(sqa.y)) - 0.30), px) * gm * 0.3;
  rD += ln(abs(max(abs(sqb.x), abs(sqb.y)) - 0.30), px) * step(0.4, hash(vec2(mod(floor(a / TAU * 9.0), 9.0), 3.3))) * 0.22;

  // ---- LAYER 2: shield-like concentric rings + slow pulse ----
  rD += (ln(abs(r - 0.31), px) + ln(abs(r - 0.26), px)) * 0.16;
  float pr = fract(t / 7.0);
  rD += ln(abs(r - mix(0.25, 0.58, pr)), px * 2.0) * (1.0 - pr) * uLock * 0.5;

  // ---- LAYER 7: etched circuit band, only in some arcs ----
  float ca = a / TAU * 48.0, cr = (r - 0.26) / 0.039;
  vec2 pc = vec2(fract(ca), fract(cr)), pid = vec2(mod(floor(ca), 48.0), floor(cr));
  float hw = hash(pid);
  float vl = ln(abs(pc.x - 0.5) * 0.039, px), hz = ln(abs(pc.y - 0.5) * 0.039, px);
  float nd = 1.0 - smoothstep(0.0, 0.08, length(pc - 0.5));
  float circ = hw < 0.4 ? vl : (hw < 0.75 ? hz : max(vl * step(pc.y, 0.5), hz * step(pc.x, 0.5)) + nd);
  circ *= step(0.0, cr) * step(cr, 3.0) * step(0.45, hash(pid + 7.0)) * step(0.5, noise(vec2(a * 1.3 + 3.0, 2.0)));
  rD += circ * 0.45;
  col += ringC * rD * hl * iD * fade;

  // ---- LAYER 4: web threads, lit by the pointer / idle light ----
  float sec = TAU / 12.0;
  float aw = mod(a, sec) - sec * 0.5;
  float u = (r * cos(aw) - 0.26) / 0.045;
  float web = ln(abs(fract(u + 0.5) - 0.5) * 0.045, px * 0.9) * step(0.0, u) * step(u, 4.6)
            + ln((sec * 0.5 - abs(aw)) * r, px * 0.9) * step(0.25, r) * step(r, 0.47);
  vec2 dl = p - uLight;
  web *= 0.07 + 1.5 * exp(-dot(dl, dl) * 20.0);
  col += vec3(0.85, 0.9, 1.0) * web * iD * fade * 0.8;
  col += vec3(0.9, 0.1, 0.08) * ln(abs(r - 0.285), px * 1.2) * 0.18 * iD * fade;

  // ---- six tiny nodes + orbiting specks ----
  vec3 nodes = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 np = vec2(cos(fi * TAU / 6.0 + 0.52), sin(fi * TAU / 6.0 + 0.52)) * 0.355;
    float dn = length(q - np);
    vec3 stn = i == 0 ? vec3(0.62, 0.35, 1.0) : i == 1 ? vec3(0.3, 0.6, 1.0) : i == 2 ? vec3(1.0, 0.2, 0.2)
             : i == 3 ? vec3(1.0, 0.6, 0.15) : i == 4 ? vec3(0.3, 1.0, 0.5) : vec3(1.0, 0.85, 0.25);
    float pl = exp(-fract(t / 7.2 - fi / 6.0) * 6.0);
    nodes += mix(vec3(0.85, 0.88, 0.95), stn, 0.5) * ((1.0 - smoothstep(0.004, 0.009, dn)) + exp(-dn * 70.0) * 0.25) * (0.4 + 1.6 * pl);
  }
  col += nodes * iD * fade;
  float orb = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float ang = t * (0.22 + 0.08 * fi) * (mod(fi, 2.0) < 1.0 ? 1.0 : -1.0) + fi * 1.7;
    orb += 1.0 - smoothstep(0.002, 0.005, length(qm - vec2(cos(ang), sin(ang)) * (0.455 + 0.022 * fi)));
  }
  col += vec3(0.9) * orb * 0.8 * iD * fade;

  // tilted orbit ring: back half behind the disc
  vec2 qe = rot(-0.38) * ((p - uCenter - uMouse * 0.045) / sc + dislocate);
  float ringE = ln(abs(length(qe * vec2(1.0, 3.4)) - 0.66), px * 1.5);
  float fr = 1.0 - smoothstep(-0.03, 0.03, qe.y);
  float heE = 0.3 + 0.7 * pow(max(0.0, dot(normalize(qe + vec2(0.0001)), ld)), 2.0);
  col += ringC * ringE * 0.2 * (1.0 - fr) * iT * fade;

  // ---- inner disc: two realities, parallax depth ----
  float R0 = 0.235;
  float rc = length(qc);
  float disc = 1.0 - smoothstep(R0 - px * 1.5, R0 + px * 0.5, rc);
  vec2 qi = qc - uMouse * 0.03;
  float ri = length(qi);
  float sideI = smoothstep(-0.006, 0.006, dx);
  float depthShade = 1.0 - smoothstep(0.0, R0, ri);
  float sw = fbm(rot(ri * 2.2 - t * 0.04) * qi * 3.0 + sideI * vec2(3.7, 1.3) + vec2(0.0, t * 0.05));
  vec3 tint = mix(vec3(0.020, 0.040, 0.075), vec3(0.12, 0.010, 0.012), sideI);
  float tun = (1.0 - smoothstep(0.0, 0.06, abs(fract(0.05 / (ri + 0.02) - t * 0.05) - 0.5))) * smoothstep(0.02, 0.08, ri);
  vec3 inner = vec3(0.0008, 0.0004, 0.0008);
  inner += tint * smoothstep(0.35, 0.95, sw) * (0.25 + 0.75 * depthShade);
  inner += mix(vec3(0.03, 0.045, 0.07), vec3(0.14, 0.02, 0.02), sideI) * tun * (0.3 + 0.7 * depthShade) * 0.5;
  inner += vec3(0.30, 0.025, 0.02) * pow(depthShade, 3.0) * 0.5 * sideI;
  col = mix(col, inner, disc * iC);

  // signal pulse (opening)
  col += vec3(0.9, 0.93, 1.0) * (ln(abs(rc - uSig * 0.16), px * 1.3) * (1.0 - uSig) * smoothstep(0.0, 0.1, uSig) * 0.9
       + (1.0 - smoothstep(0.0, px * 3.0, rc)) * smoothstep(0.0, 0.2, uSig) * (1.0 - iC) * 1.6);

  // ---- LAYERS 5+6: the tear, travelling pulse, branches, torn shards ----
  float within = inTear * (1.0 - clamp(abs(dx) / max(W, 0.0005), 0.0, 1.0));
  vec3 tearC = mix(vec3(0.85, 0.04, 0.05) * 1.2, vec3(1.0, 0.92, 0.88) * 1.5, pow(within, 1.4));
  float tm = lenM * brt * iC * fade * (0.94 + 0.06 * noise(vec2(t * 5.0, kc.y * 3.0))) * (1.0 + 0.7 * pg);
  col = mix(col, tearC, inTear * tm);
  col += vec3(1.0, 0.93, 0.88) * ln(dEdge, px * 1.2) * lenM * 0.8 * iC * fade;
  col += vec3(0.85, 0.04, 0.05) * exp(-dEdge * 30.0) * 0.3 * tm;
  col += vec3(0.85, 0.04, 0.05) * exp(-abs(dx) * 8.0) * disc * 0.05 * tm;
  col += vec3(1.0, 0.5, 0.4) * ln(abs(dx), px * 0.9) * (1.0 - smoothstep(0.9, 1.35, abs(kc.y) / L)) * 0.45 * iC * fade;

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

  vec2 fg = vec2(kc.x * 10.0, kc.y * 10.0 + t * 0.15);
  vec2 cid = floor(fg), fl = fract(fg) - 0.5;
  float ga = hash(cid) * TAU;
  vec2 sd = vec2(cos(ga), sin(ga));
  float shard = ln(abs(dot(fl, vec2(-sd.y, sd.x))), px * 10.0) * step(abs(dot(fl, sd)), 0.12 + 0.1 * hash(cid + 1.0)) * step(0.86, hash(cid + 3.1));
  col += vec3(1.0, 0.35, 0.25) * shard * exp(-abs(kc.x) * 9.0) * 0.8 * lenM * iC * fade;

  // ---- machined rim with pointer specular ----
  float ac = atan(qc.y, qc.x);
  float hlc = 0.25 + 0.75 * pow(max(0.0, dot(vec2(cos(ac), sin(ac)), ld)), 3.0);
  col += vec3(0.85, 0.88, 0.95) * ln(abs(rc - R0), px * 1.6) * (0.35 + 1.5 * hlc) * iC * fade;
  col += vec3(1.0, 0.08, 0.05) * exp(-abs(rc - R0) * 38.0) * 0.10 * brt * iC * fade;
  col += vec3(0.8) * ln(abs(rc - (R0 - 0.018)), px * 1.1) * 0.12 * iC * fade;
  col += ringC * ringE * fr * (0.35 + 0.9 * heE) * iT * fade;

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

export function initHero(container) {
  const hero = container.parentElement;
  const mobile = window.innerWidth < 768;
  let maxPR = mobile ? 1.25 : 1.5;
  let aspect = 1;

  const U = {
    uTime: { value: 0 }, uAspect: { value: 1 }, uScale: { value: 0.8 },
    uScroll: { value: 0 }, uPx: { value: 0.001 }, uSide: { value: 1 }, uPR: { value: 1 },
    uSig: { value: 0 }, uR1: { value: 0 }, uR2: { value: 0 }, uCrack: { value: 0 }, uLock: { value: 0 },
    uFlow: { value: 0 }, uAmb: { value: 0 }, uPulseT: { value: -100 }, uGlitch: { value: 0 },
    uMouse: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2() }, uLight: { value: new THREE.Vector2(0.4, 0.1) },
  };

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, depthTest: false, depthWrite: false })
  );
  bg.frustumCulled = false; bg.renderOrder = -1;
  scene.add(bg);

  const COUNT = mobile ? 260 : 700;
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

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.6, 1.0);
  composer.addPass(bloom);
  const final = new ShaderPass(FinalShader);
  composer.addPass(final);

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    const pr = Math.min(window.devicePixelRatio, maxPR);
    aspect = w / h;
    renderer.setPixelRatio(pr); renderer.setSize(w, h);
    composer.setPixelRatio(pr); composer.setSize(w, h);
    camera.left = -aspect / 2; camera.right = aspect / 2; camera.updateProjectionMatrix();

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
  resize();

  // pointer: parallax target + light position; drifts on its own when idle
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
    const now = performance.now() / 1000, t = now - t0, dt = now - last;
    last = now;

    // auto-downgrade on weak GPUs
    if (frames < 120) {
      if (frames > 20) acc += dt;
      if (++frames === 120 && acc / 99 > 0.034) { maxPR = 1; bloom.enabled = false; resize(); }
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
    final.uniforms.uTime.value = ts;
    final.uniforms.uGlitch.value = U.uGlitch.value;
    composer.render();
  }
  tick();

  return {
    play() {
      if (reduced) { ['uSig', 'uR1', 'uR2', 'uCrack', 'uLock', 'uFlow', 'uAmb'].forEach((k) => (U[k].value = 1)); return; }
      const T = performance.now() / 1000 - t0;
      nextPulse = T + 2.4; nextGlitch = T + 9;
      gsap.timeline()
        .to(U.uAmb,   { value: 1, duration: 1.5 }, 0)
        .to(U.uSig,   { value: 1, duration: 0.9, ease: 'power2.out' }, 0.8)
        .to(U.uR1,    { value: 1, duration: 1.1, ease: 'power2.inOut' }, 1.1)
        .to(U.uR2,    { value: 1, duration: 1.0, ease: 'power2.inOut' }, 1.7)
        .to(U.uFlow,  { value: 1, duration: 0.8 }, 2.0)
        .to(U.uCrack, { value: 1, duration: 0.5, ease: 'power4.in' }, 2.2)
        .to(U.uLock,  { value: 1, duration: 0.7, ease: 'power3.out' }, 2.5);
    },
    setScroll(v) { U.uScroll.value = v; },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect(); io.disconnect();
      bg.geometry.dispose(); bg.material.dispose(); pg.dispose(); sparks.material.dispose();
      composer.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}