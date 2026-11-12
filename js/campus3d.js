/* École d'automne Data Science — vol 3D « croquis » vers le bâtiment 24
 *
 * Les bâtiments sont extrudés à partir des emprises OpenStreetMap (assets/campus.json,
 * produit par tools/osm_to_campus.py) puis dessinés comme dans un carnet :
 *   passe 1  rendu de la scène dans deux textures (teinte + hachures / normale + identifiant)
 *   passe 2  détection des contours (profondeur, normales, identifiants) avec un tracé tremblé,
 *            grain du papier et du crayon.
 * Le module est piloté par app.js : window.CampusFlight.render(p), p ∈ [0, 1] = défilement.
 */
import * as THREE from '../vendor/three-0.170.0.module.min.js';

const section = document.getElementById('vol');
const canvas = document.getElementById('campusCanvas');
const labelLayer = document.getElementById('flightLabels');

/* ---------- Réglages ---------- */
const COL = {
  paper: [0.965, 0.953, 0.925],   // #f6f3ec
  paperHi: [1.0, 0.992, 0.973],   // #fffdf8
  ink: [0.114, 0.125, 0.153],     // #1d2027
  teal: [0.122, 0.616, 0.545],    // #1f9d8b
  tealDk: [0.086, 0.478, 0.424],  // #167a6c
  orange: [0.910, 0.349, 0.047],  // #e8590c
  orangeDk: [0.66, 0.24, 0.02],
  marker: [1.0, 0.64, 0.30]
};
const SUN = new THREE.Vector3(-0.52, 0.66, 0.54).normalize();   // soleil au sud-ouest
const DEG = Math.PI / 180;

// Trajectoire : [p, x (m, est), y (m, nord), distance, inclinaison (°, 90 = vue de dessus), cap (°), hauteur visée]
const PATH_WIDE = [
  [0.00, -104, -36, 1080, 90, -20, 0],
  [0.14, -96, -28, 880, 82, -22, 0],
  [0.34, -70, -6, 540, 60, -26, 2],
  [0.56, -160, 18, 380, 46, -38, 4],
  [0.80, -306, 46, 215, 35, -50, 6],
  [1.00, -330, 52, 178, 31, -55, 7]
];
const PATH_TALL = [
  [0.00, -120, -10, 1450, 90, -46, 0],
  [0.14, -112, -6, 1180, 82, -46, 0],
  [0.34, -60, 0, 720, 62, -40, 2],
  [0.56, -150, 22, 520, 48, -44, 4],
  [0.80, -316, 48, 380, 37, -58, 6],
  [1.00, -330, 50, 330, 33, -66, 7]
];

const TXT = {
  fr: { street: 'rue de Saint-Brieuc', entry: 'Entrée · 65 rue de Saint-Brieuc', main: 'Bât. 11 · bâtiment historique', here: 'c’est ici !', target: 'Bât. 24 · Salle D4' },
  en: { street: 'rue de Saint-Brieuc', entry: 'Entrance · 65 rue de Saint-Brieuc', main: 'Bldg 11 · historic building', here: 'it’s here!', target: 'Bldg 24 · Room D4' }
};

/* ---------- Outils ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const ringOf = flat => { const r = []; for (let i = 0; i < flat.length; i += 2) r.push([flat[i] / 10, flat[i + 1] / 10]); return r; };
function centroid(r) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < r.length; i++) {
    const [x0, y0] = r[i], [x1, y1] = r[(i + 1) % r.length], c = x0 * y1 - x1 * y0;
    a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  if (Math.abs(a) < 1e-6) return r[0];
  return [cx / (3 * a), cy / (3 * a)];
}
const polyArea = r => { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
// (x est, y nord, hauteur) → coordonnées three.js (X est, Y haut, Z sud)
const P3 = (q, h) => [q[0], h, -q[1]];

/* ---------- GLSL commun à la passe 1 ---------- */
const GLSL_COMMON = /* glsl */`
uniform vec3 uSun;
uniform vec2 uFadeC;
uniform vec2 uFadeR;
uniform vec3 uPaper;
uniform vec3 uPaperHi;
uniform vec3 uInk;
uniform vec3 uTeal;
uniform vec3 uTealDk;
uniform vec3 uMarker;
uniform vec3 uOrangeDk;
uniform vec4 uGridAxes;
uniform vec2 uGridO;
uniform float uDpr;
uniform sampler2D uShadow;
uniform mat4 uShadowMat;
uniform float uShadowTexel;
uniform float uShadowOn;
layout(location = 0) out vec4 oColor;
layout(location = 1) out vec4 oInfo;

float hash12(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
// couverture d'un réseau de traits (s en périodes, w largeur relative), sans crénelage
float lineCov(float s, float w) {
  float fw = max(fwidth(s), 1e-5);
  float d = abs(fract(s) - 0.5);
  float c = smoothstep(0.5 - w * 0.5 - fw, 0.5 - w * 0.5 + fw, d);
  return mix(c, w, smoothstep(0.22, 0.5, fw));
}
// trait d'épaisseur constante en pixels (quadrillage)
float gridLine(float s, float px) {
  float fw = max(fwidth(s), 1e-5);
  float d = abs(fract(s + 0.5) - 0.5) / fw;
  return (1.0 - smoothstep(px * 0.5 - 0.6, px * 0.5 + 0.6, d)) * (1.0 - smoothstep(0.06, 0.2, fw));
}
vec2 octEncode(vec3 n) {
  n /= (abs(n.x) + abs(n.y) + abs(n.z));
  vec2 e = n.xz;
  if (n.y < 0.0) e = (1.0 - abs(n.zx)) * vec2(n.x >= 0.0 ? 1.0 : -1.0, n.z >= 0.0 ? 1.0 : -1.0);
  return e * 0.5 + 0.5;
}
float fadeAt(vec3 w) {
  float d = distance(w.xz, uFadeC) + (vnoise(w.xz * 0.012) - 0.5) * 90.0;
  return 1.0 - smoothstep(uFadeR.x, uFadeR.y, d);
}
vec3 paperAt(vec3 w) {
  vec2 q = w.xz - uGridO;
  vec2 g = vec2(dot(q, uGridAxes.xy), dot(q, uGridAxes.zw));
  float minor = max(gridLine(g.x / 20.0, 1.0 * uDpr), gridLine(g.y / 20.0, 1.0 * uDpr));
  float major = max(gridLine(g.x / 100.0, 1.6 * uDpr), gridLine(g.y / 100.0, 1.6 * uDpr));
  float far = 1.0 - smoothstep(900.0, 2300.0, distance(cameraPosition, w));
  return mix(uPaper, uTeal, (minor * 0.12 + major * 0.12) * far);
}
float shadowAt(vec3 w, vec3 n) {
  if (uShadowOn < 0.5) return 0.0;
  vec4 s = uShadowMat * vec4(w + n * 0.45, 1.0);
  vec3 c = s.xyz * 0.5 + 0.5;
  if (c.x <= 0.0 || c.x >= 1.0 || c.y <= 0.0 || c.y >= 1.0) return 0.0;
  float sh = 0.0;
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++)
    sh += step(texture(uShadow, c.xy + vec2(float(i), float(j)) * uShadowTexel).x, c.z - 0.0005);
  return sh / 9.0;
}
// hachures d'ombre portée sur le sol
float groundHatch(vec3 w) {
  float s = (w.x - w.z) * 0.7071;
  float k = smoothstep(0.16, 0.42, fwidth(s / 0.8));
  return mix(lineCov(s / 0.8, 0.26), lineCov(s / 2.4, 0.2), k);
}
void writeOut(vec3 col, float weight, vec3 n, float tint, float id) {
  oColor = vec4(col, weight);
  oInfo = vec4(octEncode(normalize(n)), tint, id);
}
`;

/* ---------- Shaders ---------- */
const VS_BUILDING = /* glsl */`
in float aId;
in float aKind;
in float aDelay;
uniform float uGrow;
out vec3 vWorld;
out vec3 vNormal;
flat out float vId;
flat out float vKind;
void main() {
  vec3 p = position;
  float g = smoothstep(aDelay, aDelay + 0.4, uGrow);
  if (p.y > 0.01) p.y = max(p.y * g, 0.3 + p.y * 0.004);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vNormal = normal;
  vId = aId;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FS_BUILDING = /* glsl */`
in vec3 vWorld;
in vec3 vNormal;
flat in float vId;
flat in float vKind;
void main() {
  vec3 n = normalize(vNormal);
  float fade = fadeAt(vWorld);
  bool wall = abs(n.y) < 0.5;
  bool slope = !wall && n.y < 0.985;
  vec2 fc = wall ? vec2(dot(vWorld.xz, normalize(vec2(-n.z, n.x))), vWorld.y) : vWorld.xz;
  float lit = min(dot(n, uSun), 1.0 - shadowAt(vWorld, n) * 1.4);
  float h1 = smoothstep(0.42, 0.14, lit);
  float h2 = smoothstep(0.04, -0.3, lit);
  float a = (fc.x + fc.y) * 0.7071, b = (fc.x - fc.y) * 0.7071;
  float k = smoothstep(0.16, 0.42, fwidth(a / 0.5));
  float l1 = mix(lineCov(a / 0.5, 0.24), lineCov(a / 1.5, 0.17), k);
  float l2 = mix(lineCov(b / 0.5, 0.22), lineCov(b / 1.5, 0.15), k);
  float dark = max(l1 * h1, l2 * h2);
  bool campus = vKind > 0.5;
  bool target = vKind > 1.5 && vKind < 2.5;
  bool main = vKind > 2.5;
  vec3 base = campus ? uPaperHi : mix(uPaper, uPaperHi, 0.55);
  vec3 hatchCol = uInk;
  float tint = 0.0;
  float weight = campus ? 1.0 : 0.55;
  if (slope) {
    float sy = vWorld.y / 0.55;
    dark = max(dark, lineCov(sy, 0.16) * 0.6 * (1.0 - smoothstep(0.25, 0.5, fwidth(sy))));
    if (main) base = mix(base, uInk, 0.09);
  }
  if (target) {
    float streak = vnoise(vec2(fc.x * 0.18 + fc.y * 0.6, fc.y * 0.22 - fc.x * 0.05));
    base = mix(uPaperHi, uMarker, 0.6 + 0.22 * streak);
    hatchCol = uOrangeDk;
    tint = 1.0;
  }
  vec3 col = mix(base, hatchCol, dark * (campus ? 0.6 : 0.42));
  col = mix(paperAt(vWorld), col, fade);
  writeOut(col, weight * fade, n, tint, vId);
}`;

const VS_FLAT = /* glsl */`
in float aId;
in float aKind;
out vec3 vWorld;
flat out float vId;
flat out float vKind;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vId = aId;
  vKind = aKind;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FS_GROUND = /* glsl */`
in vec3 vWorld;
flat in float vId;
flat in float vKind;
void main() {
  float fade = fadeAt(vWorld);
  vec3 col = paperAt(vWorld);
  col = mix(col, uInk, shadowAt(vWorld, vec3(0.0, 1.0, 0.0)) * groundHatch(vWorld) * 0.4 * fade);
  writeOut(col, 0.0, vec3(0.0, 1.0, 0.0), 0.0, 0.0);
}`;

const FS_AREA = /* glsl */`
in vec3 vWorld;
flat in float vId;
flat in float vKind;
void main() {
  float fade = fadeAt(vWorld);
  vec3 paper = paperAt(vWorld);
  vec3 col = paper;
  float w = 0.3, tint = 0.5;
  vec2 q = vWorld.xz;
  float mpp = fwidth(q.x);                       // mètres par pixel
  if (vKind < 0.5) {                             // pelouses, jardins, bois : pointillés
    col = mix(col, uTeal, 0.08);
    vec2 cell = floor(q / 2.6), f = fract(q / 2.6);
    vec2 j = vec2(hash12(cell), hash12(cell + 7.7)) * 0.6 + 0.2;
    float on = step(0.52, hash12(cell + 3.1));
    float r = length(f - j) * 2.6;
    float dotc = (1.0 - smoothstep(0.2, 0.2 + mpp * 1.2, r)) * on * (1.0 - smoothstep(0.1, 0.26, mpp));
    col = mix(col, uTealDk, dotc * 0.6);
  } else if (vKind < 1.5) {                      // eau : vaguelettes
    col = mix(col, uTeal, 0.2);
    float s = (q.y + sin(q.x * 0.45) * 0.5) / 1.6;
    col = mix(col, uTealDk, lineCov(s, 0.12) * 0.55);
    w = 0.75;
  } else if (vKind < 2.5) {                      // parkings : hachures fines
    col = mix(col, uInk, lineCov((q.x + q.y) / 2.2, 0.08) * 0.13);
    w = 0.35; tint = 0.0;
  } else {                                       // terrains de sport
    col = mix(col, uTeal, 0.12);
    w = 0.45;
  }
  col = mix(col, uInk, shadowAt(vWorld, vec3(0.0, 1.0, 0.0)) * groundHatch(vWorld) * 0.4 * fade);
  col = mix(paper, col, fade);
  writeOut(col, w * fade, vec3(0.0, 1.0, 0.0), tint, vId);
}`;

const VS_ROAD = /* glsl */`
in float aCls;
in float aSide;
in float aDist;
out vec3 vWorld;
out float vSide;
out float vDist;
flat out float vCls;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vSide = aSide;
  vDist = aDist;
  vCls = aCls;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FS_ROAD = /* glsl */`
in vec3 vWorld;
in float vSide;
in float vDist;
flat in float vCls;
void main() {
  float fade = fadeAt(vWorld);
  vec3 paper = paperAt(vWorld);
  vec3 col = mix(mix(uPaperHi, paper, 0.3), uInk, vCls < 1.5 ? 0.05 : 0.03);
  if (vCls < 1.5) {
    float c = 1.0 - smoothstep(0.035, 0.035 + fwidth(vSide) * 1.5, abs(vSide));
    float dash = step(fract(vDist / 7.0), 0.5) * (1.0 - smoothstep(0.12, 0.3, fwidth(vDist / 7.0)));
    col = mix(col, uInk, c * dash * 0.4);
  }
  col = mix(col, uInk, shadowAt(vWorld, vec3(0.0, 1.0, 0.0)) * groundHatch(vWorld) * 0.4 * fade);
  col = mix(paper, col, fade);
  writeOut(col, (vCls < 1.5 ? 0.8 : vCls < 2.5 ? 0.62 : 0.5) * fade, vec3(0.0, 1.0, 0.0), 0.0, 1.0 / 255.0);
}`;

const VS_LINE = /* glsl */`
in vec2 aMiter;
in float aSide;
in float aDist;
uniform float uPx;
uniform float uHalfPx;
out vec3 vWorld;
out float vDist;
void main() {
  float d = distance(cameraPosition, position);
  vec3 p = position + vec3(aMiter.x, 0.0, aMiter.y) * aSide * d * uPx * uHalfPx;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vDist = aDist;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FS_LINE = /* glsl */`
in vec3 vWorld;
in float vDist;
uniform vec3 uColor;
uniform float uAlpha;
uniform vec2 uDash;
void main() {
  if (fract(vDist / (uDash.x + uDash.y)) > uDash.x / (uDash.x + uDash.y)) discard;
  float fade = fadeAt(vWorld);
  writeOut(mix(paperAt(vWorld), uColor, uAlpha * fade), 0.0, vec3(0.0, 1.0, 0.0), 0.0, 1.0);
}`;

const VS_TREE = /* glsl */`
in vec3 aOff;
in float aScl;
in float aId;
in float aDelay;
uniform float uGrow;
uniform float uTrunk;
out vec3 vWorld;
out vec3 vNormal;
flat out float vId;
void main() {
  float g = smoothstep(aDelay, aDelay + 0.4, uGrow);
  vec3 p;
  if (uTrunk > 0.5) p = vec3(position.x * aScl * 0.07, position.y * aOff.y, position.z * aScl * 0.07);
  else p = vec3(position.x * aScl, aOff.y + position.y * aScl * 0.92, position.z * aScl);
  p.y = p.y * g + 0.32;
  vec4 w = modelMatrix * vec4(p + vec3(aOff.x, 0.0, aOff.z), 1.0);
  vWorld = w.xyz;
  vNormal = normal;
  vId = aId;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FS_TREE = /* glsl */`
in vec3 vWorld;
in vec3 vNormal;
flat in float vId;
uniform float uTrunk;
void main() {
  vec3 n = normalize(vNormal);
  float fade = fadeAt(vWorld);
  float lit = min(dot(n, uSun), 1.0 - shadowAt(vWorld, n) * 1.2);
  float shade = smoothstep(0.45, -0.15, lit);
  vec3 col;
  if (uTrunk > 0.5) col = mix(uPaperHi, uTealDk, 0.35);
  else {
    col = mix(mix(uPaperHi, uTeal, 0.16), mix(uPaperHi, uTeal, 0.34), shade);
    // pointillés à l'ombre, accrochés à la couronne
    vec2 q = vec2(vWorld.x + vWorld.z * 0.5, vWorld.y * 1.2 - vWorld.z * 0.5) / 0.55;
    vec2 cell = floor(q), f = fract(q);
    vec2 j = vec2(hash12(cell), hash12(cell + 4.3)) * 0.5 + 0.25;
    float mpp = fwidth(q.x) * 0.55;
    float dotc = (1.0 - smoothstep(0.1, 0.1 + mpp * 1.5, length(f - j) * 0.55)) * step(0.35, hash12(cell + 1.7));
    col = mix(col, uTealDk, dotc * shade * 0.7 * (1.0 - smoothstep(0.08, 0.2, mpp)));
  }
  col = mix(paperAt(vWorld), col, fade);
  writeOut(col, 0.85 * fade, n, 0.5, vId);
}`;

const FS_SHADOW = /* glsl */`
layout(location = 0) out vec4 oColor;
void main() { oColor = vec4(0.0); }`;

const VS_POST = /* glsl */`
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FS_POST = /* glsl */`
uniform sampler2D tColor;
uniform sampler2D tInfo;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uDpr;
uniform float uNear;
uniform float uFar;
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform vec3 uInk;
uniform vec3 uTealDk;
uniform vec3 uOrangeDk;
in vec2 vUv;
layout(location = 0) out vec4 fragColor;

float hash12(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 octDecode(vec2 e) {
  e = e * 2.0 - 1.0;
  vec3 n = vec3(e.x, 1.0 - abs(e.x) - abs(e.y), e.y);
  float t = max(-n.y, 0.0);
  n.x += n.x >= 0.0 ? -t : t;
  n.z += n.z >= 0.0 ? -t : t;
  return normalize(n);
}
float linZ(float d) { float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
float rz(vec2 uv) { return 1.0 / linZ(texture(tDepth, uv).x); }
float idDiff(float a, float b) { return (a > 0.998 || b > 0.998) ? 0.0 : step(0.5 / 255.0, abs(a - b)); }

void main() {
  vec2 px = 1.0 / uRes;
  float d0 = texture(tDepth, vUv).x;
  vec4 vp = uInvProj * vec4(vUv * 2.0 - 1.0, d0 * 2.0 - 1.0, 1.0);
  vp /= vp.w;
  vec3 wp = (uCamWorld * vp).xyz;
  float lz = min(-vp.z, 4000.0);
  // tremblé du trait : bruit accroché au monde, d'échelle proportionnelle à la distance
  float sc = 1.0 / (0.02 * lz + 0.35);
  vec2 nq = (wp.xz + vec2(wp.y * 0.8, -wp.y * 0.5)) * sc;
  vec2 wob = vec2(vnoise(nq), vnoise(nq + 31.7)) - 0.5;
  vec2 uv = vUv + wob * (3.4 * uDpr) * px;
  float rad = (0.7 + 0.6 * vnoise(nq * 0.37 + 5.3)) * uDpr;
  vec2 ox = vec2(rad, 0.0) * px, oy = vec2(0.0, rad) * px;

  float zc = rz(uv), zl = rz(uv - ox), zr = rz(uv + ox), zb = rz(uv - oy), zt = rz(uv + oy);
  float lap = (abs(zl + zr - 2.0 * zc) + abs(zb + zt - 2.0 * zc)) / zc;
  float eD = smoothstep(0.004, 0.02, lap);

  vec4 ic = texture(tInfo, uv), il = texture(tInfo, uv - ox), ir = texture(tInfo, uv + ox), ib = texture(tInfo, uv - oy), it = texture(tInfo, uv + oy);
  vec3 nc = octDecode(ic.xy);
  float dn = max(max(1.0 - dot(nc, octDecode(il.xy)), 1.0 - dot(nc, octDecode(ir.xy))),
                 max(1.0 - dot(nc, octDecode(ib.xy)), 1.0 - dot(nc, octDecode(it.xy))));
  float eN = smoothstep(0.1, 0.32, dn);
  float eI = clamp(idDiff(ic.a, il.a) + idDiff(ic.a, ir.a) + idDiff(ic.a, ib.a) + idDiff(ic.a, it.a), 0.0, 1.0);

  vec4 cc = texture(tColor, uv), cl = texture(tColor, uv - ox), cr = texture(tColor, uv + ox), cb = texture(tColor, uv - oy), ct = texture(tColor, uv + oy);
  float wgt = cc.a; float tint = ic.z;
  if (cl.a > wgt) { wgt = cl.a; tint = il.z; }
  if (cr.a > wgt) { wgt = cr.a; tint = ir.z; }
  if (cb.a > wgt) { wgt = cb.a; tint = ib.z; }
  if (ct.a > wgt) { wgt = ct.a; tint = it.z; }

  float edge = max(eD, max(eN, eI)) * wgt;
  edge *= 0.74 + 0.26 * vnoise(gl_FragCoord.xy * 0.42 / uDpr + nq * 3.0);
  vec3 inkC = tint > 0.75 ? uOrangeDk : tint > 0.25 ? mix(uInk, uTealDk, 0.75) : uInk;
  vec3 col = mix(texture(tColor, vUv).rgb, inkC, clamp(edge, 0.0, 1.0) * 0.93);
  vec2 g = gl_FragCoord.xy / uDpr;
  col *= 0.988 + 0.026 * (vnoise(g * 0.9) * 0.55 + vnoise(g * 0.13) * 0.45);
  fragColor = vec4(col, 1.0);
}`;

/* ---------- Construction de la scène ---------- */
function buildBuildings(data) {
  const pos = [], nor = [], ids = [], kinds = [], delays = [];
  const R = rng(11);
  const C = data.center;
  let id = 0, kind = 0, delay = 0;
  const v = (p, n) => { pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]); ids.push(id); kinds.push(kind); delays.push(delay); };
  const tri = (a, b, c, n) => { v(a, n); v(b, n); v(c, n); };
  const quad = (a, b, c, d, n) => { tri(a, b, c, n); tri(a, c, d, n); };
  const faceN = (a, b, c) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
    const n = [uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
  };
  const UP = [0, 1, 0];
  const walls = (r, h) => {
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      quad(P3(a, 0), P3(b, 0), P3(b, h), P3(a, h), [dy / L, 0, dx / L]);
    }
  };
  const band = (r, h0, s, h1) => {
    for (let i = 0; i < r.length; i++) {
      const j = (i + 1) % r.length;
      const A = P3(r[i], h0), B = P3(r[j], h0), Cc = P3(s[j], h1), D = P3(s[i], h1);
      quad(A, B, Cc, D, faceN(A, B, D));
    }
  };
  const cap = (r, h, holes) => {
    const contour = r.map(q => new THREE.Vector2(q[0], q[1]));
    const hs = holes.map(hh => hh.map(q => new THREE.Vector2(q[0], q[1])));
    const faces = THREE.ShapeUtils.triangulateShape(contour, hs);
    const all = contour.concat(...hs);
    for (const [i, j, k] of faces) {
      const a = all[i], b = all[j], c = all[k];
      const s = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      const A = [a.x, h, -a.y], B = [b.x, h, -b.y], Cc = [c.x, h, -c.y];
      if (s >= 0) tri(A, B, Cc, UP); else tri(A, Cc, B, UP);
    }
  };
  const labels = {};
  data.buildings.forEach((b, i) => {
    const outer = ringOf(b.p);
    const H = b.h / 10;
    kind = b.f & 2 ? 2 : b.f & 4 ? 3 : b.f & 1 ? 1 : 0;
    id = (16 + (i * 37) % 235) / 255;
    const c = centroid(outer);
    const dist = Math.hypot(c[0] - C[0], c[1] - C[1]);
    delay = kind ? 0.02 + R() * 0.1 : 0.12 + 0.46 * clamp(dist / 640, 0, 1) + R() * 0.08;
    const holes = (b.o || []).map(ringOf);
    walls(outer, H);
    holes.forEach(hh => walls(hh, H));
    let top = H;
    if (b.r) {
      let prev = outer, h0 = H;
      for (const [rf, rh] of b.r) { const rr = ringOf(rf); top = H + rh / 10; band(prev, h0, rr, top); prev = rr; h0 = top; }
      cap(prev, top, []);
    } else cap(outer, H, holes);
    if (b.n) {
      const a = Math.abs(polyArea(outer));
      if (!labels[b.n] || labels[b.n].area < a) labels[b.n] = { n: b.n, x: c[0], y: c[1], h: top, delay, area: a, kind };
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aId', new THREE.Float32BufferAttribute(ids, 1));
  g.setAttribute('aKind', new THREE.Float32BufferAttribute(kinds, 1));
  g.setAttribute('aDelay', new THREE.Float32BufferAttribute(delays, 1));
  return { geometry: g, labels: Object.values(labels) };
}

function buildAreas(data) {
  const pos = [], ids = [], kinds = [];
  const layer = [0.06, 0.1, 0.08, 0.07];
  data.areas.forEach((a, i) => {
    const r = ringOf(a.p);
    const contour = r.map(q => new THREE.Vector2(q[0], q[1]));
    const faces = THREE.ShapeUtils.triangulateShape(contour, []);
    const y = layer[a.k] + (i % 7) * 0.004;
    const id = (2 + a.k * 2 + (i % 2)) / 255;
    for (const [i0, j0, k0] of faces) {
      let A = contour[i0], B = contour[j0], Cc = contour[k0];
      if ((B.x - A.x) * (Cc.y - A.y) - (B.y - A.y) * (Cc.x - A.x) < 0) [B, Cc] = [Cc, B];
      for (const q of [A, B, Cc]) { pos.push(q.x, y, -q.y); ids.push(id); kinds.push(a.k); }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aId', new THREE.Float32BufferAttribute(ids, 1));
  g.setAttribute('aKind', new THREE.Float32BufferAttribute(kinds, 1));
  return g;
}

// Ruban le long d'une polyligne (coordonnées three.js XZ), avec onglets limités
function miters(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[Math.max(0, i - 1)], c = pts[i], n = pts[Math.min(pts.length - 1, i + 1)];
    let d0x = c[0] - p[0], d0z = c[1] - p[1], d1x = n[0] - c[0], d1z = n[1] - c[1];
    const l0 = Math.hypot(d0x, d0z), l1 = Math.hypot(d1x, d1z);
    if (l0 < 1e-6) { d0x = d1x; d0z = d1z; } else { d0x /= l0; d0z /= l0; }
    if (l1 < 1e-6) { d1x = d0x; d1z = d0z; } else { d1x /= l1; d1z /= l1; }
    let tx = d0x + d1x, tz = d0z + d1z;
    const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    const nx = -tz, nz = tx;                              // normale à gauche
    const m = 1 / Math.max(0.35, nx * -d1z + nz * d1x);   // longueur de l'onglet
    out.push([nx * m, nz * m, d1x, d1z]);
  }
  return out;
}

function buildRoads(data) {
  const pos = [], cls = [], side = [], dist = [], idx = [];
  const layer = [0.2, 0.18, 0.16, 0.14, 0.13];
  for (const r of data.roads) {
    if (r.c >= 4) continue;
    const pts = ringOf(r.p).map(q => [q[0], -q[1]]);
    if (pts.length < 2) continue;
    const w = r.w / 10, hw = w / 2;
    // prolonger les extrémités pour fermer les carrefours
    const ext = (a, b) => { const dx = a[0] - b[0], dz = a[1] - b[1], l = Math.hypot(dx, dz) || 1; return [a[0] + dx / l * hw, a[1] + dz / l * hw]; };
    pts[0] = ext(pts[0], pts[1]);
    pts[pts.length - 1] = ext(pts[pts.length - 1], pts[pts.length - 2]);
    const M = miters(pts);
    const base = pos.length / 3;
    let s = 0;
    pts.forEach((p, i) => {
      if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const [mx, mz] = M[i];
      pos.push(p[0] + mx * hw, layer[r.c], p[1] + mz * hw, p[0] - mx * hw, layer[r.c], p[1] - mz * hw);
      cls.push(r.c, r.c); side.push(1, -1); dist.push(s, s);
      if (i) { const k = base + (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 2, k + 3, k + 1); }
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aCls', new THREE.Float32BufferAttribute(cls, 1));
  g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
  g.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  g.setIndex(idx);
  return g;
}

function buildLines(lines, y, closed) {
  const pos = [], mit = [], side = [], dist = [], idx = [];
  for (let pts of lines) {
    if (closed) pts = pts.concat([pts[0]]);
    if (pts.length < 2) continue;
    const M = miters(pts);
    const base = pos.length / 3;
    let s = 0;
    pts.forEach((p, i) => {
      if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      pos.push(p[0], y, p[1], p[0], y, p[1]);
      mit.push(M[i][0], M[i][1], M[i][0], M[i][1]);
      side.push(1, -1); dist.push(s, s);
      if (i) { const k = base + (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 2, k + 3, k + 1); }
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aMiter', new THREE.Float32BufferAttribute(mit, 2));
  g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
  g.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  g.setIndex(idx);
  return g;
}

function buildTrees(data, trunk) {
  const base = trunk ? new THREE.CylinderGeometry(1, 1, 1, 6, 1, true).translate(0, 0.5, 0) : new THREE.IcosahedronGeometry(1, 2);
  if (!trunk) {   // couronne bosselée : silhouette « nuage » dessinée à main levée
    const p = base.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = 1 + 0.06 * Math.sin(x * 5.3 + y * 2.1) + 0.05 * Math.sin(y * 6.1 - z * 3.7) + 0.04 * Math.sin(z * 7.3 + x * 1.3);
      p.setXYZ(i, x * d, y * d, z * d);
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute('position', base.attributes.position);
  g.setAttribute('normal', base.attributes.normal);
  g.setAttribute('uv', base.attributes.uv);
  const t = data.trees, n = t.length / 3;
  const off = new Float32Array(n * 3), scl = new Float32Array(n), ids = new Float32Array(n), del = new Float32Array(n);
  const R = rng(5);
  const C = data.center;
  for (let i = 0; i < n; i++) {
    const x = t[i * 3] / 10, y = t[i * 3 + 1] / 10, r = t[i * 3 + 2] / 10;
    off[i * 3] = x; off[i * 3 + 1] = 1.8 + r * 1.05; off[i * 3 + 2] = -y;
    scl[i] = r; ids[i] = (10 + (i % 6)) / 255;
    del[i] = 0.1 + 0.45 * clamp(Math.hypot(x - C[0], y - C[1]) / 640, 0, 1) + R() * 0.12;
  }
  g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 3));
  g.setAttribute('aScl', new THREE.InstancedBufferAttribute(scl, 1));
  g.setAttribute('aId', new THREE.InstancedBufferAttribute(ids, 1));
  g.setAttribute('aDelay', new THREE.InstancedBufferAttribute(del, 1));
  g.instanceCount = n;
  return g;
}

/* ---------- Annotations manuscrites ---------- */
function arrowSvg(path, head, cls) {
  return `<svg class="fl-arrow ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true"><path d="${path}"/><path d="${head}"/></svg>`;
}
function buildLabels(world) {
  labelLayer.innerHTML = '';
  const list = [];
  const add = (el, anchor, from, to, extra) => { labelLayer.appendChild(el); list.push(Object.assign({ el, anchor, from, to, text: el.querySelector('.fl-text') }, extra)); return el; };
  const make = (cls, html) => { const el = document.createElement('div'); el.className = 'fl ' + cls; el.innerHTML = html; return el; };

  for (const b of world.labels) {
    const el = make('fl-num' + (b.kind === 2 ? ' fl-num-target' : ''), `<span>${b.n}</span>`);
    add(el, new THREE.Vector3(b.x, b.h, -b.y), -1, b.kind === 2 ? 0.5 : 0.3, { building: b });
  }
  const T = world.marks;
  add(make('fl-street', '<span data-t="street"></span>'), new THREE.Vector3(-82, 0.5, -148), -1, 0.4,
    { dir: new THREE.Vector3(-82 + 40, 0.5, -148 + 34.7) });
  add(make('fl-note fl-entry', arrowSvg('M88 14 C 60 6, 30 30, 10 88', 'M2 74 L10 90 L22 78') + '<span class="fl-text" data-t="entry"></span>'),
    new THREE.Vector3(-22, 0.5, -86), 0.06, 0.42);
  add(make('fl-note fl-main', arrowSvg('M90 12 C 62 4, 30 26, 12 86', 'M4 72 L12 88 L24 76') + '<span class="fl-text" data-t="main"></span>'),
    new THREE.Vector3(T.main[0], 17, -T.main[1]), 0.24, 0.6, { building: { h: 17, delay: 0.05 } });
  add(make('fl-note fl-target', arrowSvg('M92 10 C 66 2, 26 22, 10 86', 'M2 70 L10 88 L24 76', 'fl-arrow-big') +
    '<span class="fl-text"><em data-t="here"></em> <b data-t="target"></b></span>'),
    new THREE.Vector3(T.target[0] + 6, 11.5, -T.target[1] - 6), 0.79, 2, { building: { h: 11.5, delay: 0.05 }, big: true });
  return list;
}

/* ---------- Programme principal ---------- */
async function start() {
  if (!canvas || !section) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('WebGL2 indisponible');
  renderer.autoClear = true;
  renderer.setClearColor(new THREE.Color().setRGB(...COL.paper, THREE.SRGBColorSpace), 0);

  const res = await fetch('assets/campus.json');
  if (!res.ok) throw new Error('campus.json ' + res.status);
  const data = await res.json();
  const C = data.center;

  // Uniformes partagés
  const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);
  const U = {
    uSun: { value: SUN.clone() },
    uFadeC: { value: new THREE.Vector2(C[0], -C[1]) },
    uFadeR: { value: new THREE.Vector2(360, 640) },
    uPaper: { value: v3(COL.paper) }, uPaperHi: { value: v3(COL.paperHi) }, uInk: { value: v3(COL.ink) },
    uTeal: { value: v3(COL.teal) }, uTealDk: { value: v3(COL.tealDk) }, uMarker: { value: v3(COL.marker) },
    uOrangeDk: { value: v3(COL.orangeDk) },
    uGridAxes: { value: new THREE.Vector4(1, 0, 0, -1) },
    uGridO: { value: new THREE.Vector2(C[0], -C[1]) },
    uDpr: { value: 1 },
    uShadow: { value: null }, uShadowMat: { value: new THREE.Matrix4() }, uShadowTexel: { value: 1 / 2048 }, uShadowOn: { value: 0 },
    uGrow: { value: 0 }
  };
  const mat = (vs, fs, extra) => new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: vs, fragmentShader: GLSL_COMMON + fs,
    uniforms: Object.assign({}, U, extra || {})
  });

  const scene = new THREE.Scene();
  const world = buildBuildings(data);
  world.marks = data.marks;
  const bMesh = new THREE.Mesh(world.geometry, mat(VS_BUILDING, FS_BUILDING));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2).translate(C[0], 0, -C[1]), mat(VS_FLAT, FS_GROUND));
  ground.geometry.setAttribute('aId', new THREE.Float32BufferAttribute(new Float32Array(4), 1));
  ground.geometry.setAttribute('aKind', new THREE.Float32BufferAttribute(new Float32Array(4), 1));
  const areas = new THREE.Mesh(buildAreas(data), mat(VS_FLAT, FS_AREA));
  const roads = new THREE.Mesh(buildRoads(data), mat(VS_ROAD, FS_ROAD));
  const lineU = { uPx: { value: 0.001 } };
  const paths = new THREE.Mesh(
    buildLines(data.roads.filter(r => r.c === 4).map(r => ringOf(r.p).map(q => [q[0], -q[1]])), 0.26, false),
    mat(VS_LINE, FS_LINE, { uPx: lineU.uPx, uHalfPx: { value: 0.75 }, uColor: { value: v3(COL.ink) }, uAlpha: { value: 0.45 }, uDash: { value: new THREE.Vector2(2.4, 1.8) } }));
  const boundary = new THREE.Mesh(
    buildLines([ringOf(data.campus).map(q => [q[0], -q[1]])], 0.3, true),
    mat(VS_LINE, FS_LINE, { uPx: lineU.uPx, uHalfPx: { value: 1.5 }, uColor: { value: v3(COL.orange) }, uAlpha: { value: 0.9 }, uDash: { value: new THREE.Vector2(9, 6) } }));
  const crownG = buildTrees(data, false), trunkG = buildTrees(data, true);
  const crowns = new THREE.Mesh(crownG, mat(VS_TREE, FS_TREE, { uTrunk: { value: 0 } }));
  const trunks = new THREE.Mesh(trunkG, mat(VS_TREE, FS_TREE, { uTrunk: { value: 1 } }));
  for (const m of [bMesh, ground, areas, roads, paths, boundary, crowns, trunks]) { m.frustumCulled = false; scene.add(m); }

  // Ombres portées (carte de profondeur vue du soleil)
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const SM = small ? 1536 : 2048;
  const shadowRT = new THREE.WebGLRenderTarget(SM, SM, { format: THREE.RedFormat, type: THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false });
  shadowRT.depthTexture = new THREE.DepthTexture(SM, SM, THREE.UnsignedIntType);
  const ext = 520;
  const lightCam = new THREE.OrthographicCamera(-ext, ext, ext, -ext, 400, 2200);
  const focus = new THREE.Vector3(-170, 0, -15);
  lightCam.position.copy(focus).addScaledVector(SUN, 1200);
  lightCam.lookAt(focus);
  lightCam.updateMatrixWorld(); lightCam.updateProjectionMatrix();
  U.uShadowMat.value.multiplyMatrices(lightCam.projectionMatrix, lightCam.matrixWorldInverse);
  U.uShadow.value = shadowRT.depthTexture;
  U.uShadowTexel.value = 1 / SM;
  const shadowScene = new THREE.Scene();
  const shadowMat = (vs, extra) => new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vs, fragmentShader: FS_SHADOW, uniforms: Object.assign({ uGrow: U.uGrow }, extra || {}), colorWrite: false });
  const sB = new THREE.Mesh(world.geometry, shadowMat(VS_BUILDING));
  const sT = new THREE.Mesh(crownG, shadowMat(VS_TREE, { uTrunk: { value: 0 } }));
  sB.frustumCulled = sT.frustumCulled = false;
  shadowScene.add(sB, sT);
  let shadowGrow = -1;

  // Cibles de rendu
  const rt = new THREE.WebGLRenderTarget(4, 4, { count: 2, type: THREE.UnsignedByteType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false });
  rt.depthTexture = new THREE.DepthTexture(4, 4, THREE.UnsignedIntType);
  const camera = new THREE.PerspectiveCamera(34, 1, 4, 6000);
  const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_POST, fragmentShader: FS_POST, depthTest: false, depthWrite: false,
    uniforms: {
      tColor: { value: rt.textures[0] }, tInfo: { value: rt.textures[1] }, tDepth: { value: rt.depthTexture },
      uRes: { value: new THREE.Vector2(1, 1) }, uDpr: U.uDpr, uNear: { value: camera.near }, uFar: { value: camera.far },
      uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() },
      uInk: U.uInk, uTealDk: U.uTealDk, uOrangeDk: U.uOrangeDk
    }
  }));
  post.frustumCulled = false;
  const postScene = new THREE.Scene(); postScene.add(post);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Annotations
  const labels = buildLabels(world);
  let lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const setTexts = () => labelLayer.querySelectorAll('[data-t]').forEach(el => { el.textContent = TXT[lang][el.dataset.t]; });
  setTexts();

  // Taille
  let W = 1, H = 1, dpr = 1, tall = false;
  function resize() {
    W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
    tall = H > W * 1.1;
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 2 : 1.75);
    if (W * H * dpr * dpr > 4.2e6) dpr = Math.sqrt(4.2e6 / (W * H));
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
    post.material.uniforms.uRes.value.set(Math.round(W * dpr), Math.round(H * dpr));
    U.uDpr.value = dpr;
    camera.aspect = W / H;
    camera.fov = tall ? 46 : 34;
  }

  // Caméra le long de la trajectoire (spline de Hermite)
  function sample(keys, p) {
    const n = keys.length;
    if (p <= keys[0][0]) return keys[0].slice(1);
    if (p >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (p > keys[i + 1][0]) i++;
    const t0 = keys[i][0], t1 = keys[i + 1][0], h = t1 - t0, s = (p - t0) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    const out = [];
    for (let c = 1; c < keys[0].length; c++) {
      const val = k => c === 3 ? Math.log(keys[k][c]) : keys[k][c];
      const tan = k => (k === 0 || k === n - 1) ? 0 : (val(k + 1) - val(k - 1)) / (keys[k + 1][0] - keys[k - 1][0]);
      const v = h00 * val(i) + h10 * h * tan(i) + h01 * val(i + 1) + h11 * h * tan(i + 1);
      out.push(c === 3 ? Math.exp(v) : v);
    }
    return out;
  }
  const look = new THREE.Vector3();
  function placeCamera(p) {
    const keys = tall ? PATH_TALL : PATH_WIDE;
    const [x, y, D, pitch0, heading, te] = sample(keys, p);
    const ph = Math.min(pitch0, 89.95) * DEG, hd = heading * DEG;
    const cp = Math.cos(ph), sp = Math.sin(ph);
    camera.position.set(x - D * cp * Math.sin(hd), te + D * sp, -(y - D * cp * Math.cos(hd)));
    camera.up.set(sp * Math.sin(hd), cp, -sp * Math.cos(hd));
    look.set(x, te, -y);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const e = camera.projectionMatrix.elements;
    e[8] = tall ? 0 : -0.14;      // décalage optique : le sujet laisse de la place au texte
    e[9] = tall ? -0.2 : -0.08;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    // quadrillage aligné sur l'écran au départ
    const h0 = keys[0][5] * DEG;
    U.uGridAxes.value.set(Math.cos(h0), Math.sin(h0), Math.sin(h0), -Math.cos(h0));
    // zone dessinée : suit le sujet
    const k = smooth(0.25, 1, p);
    U.uFadeC.value.set(lerp(C[0], x, k), -lerp(C[1], y, k));
    U.uFadeR.value.set(lerp(tall ? 420 : 380, 300, k), lerp(tall ? 720 : 660, 540, k));
    lineU.uPx.value = 2 * Math.tan(camera.fov * DEG / 2) / (H * dpr);
  }

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  function placeLabels(p) {
    const grow = U.uGrow.value;
    for (const L of labels) {
      let o = L.from < 0 ? 1 - smooth(L.to, L.to + 0.05, p) : smooth(L.from, L.from + 0.05, p) * (1 - smooth(L.to, L.to + 0.05, p));
      if (o < 0.01) { if (L.vis !== false) { L.el.style.opacity = '0'; L.vis = false; } continue; }
      tmp.copy(L.anchor);
      if (L.building) tmp.y = Math.max(L.building.h * smooth(L.building.delay, L.building.delay + 0.4, grow), 0.3) + 1;
      tmp.project(camera);
      if (tmp.z > 1 || tmp.z < -1 || Math.abs(tmp.x) > 1.15 || Math.abs(tmp.y) > 1.15) { L.el.style.opacity = '0'; L.vis = false; continue; }
      const sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
      let rot = '';
      if (L.dir) {
        tmp2.copy(L.dir).project(camera);
        let a = Math.atan2(-(tmp2.y - tmp.y) * H, (tmp2.x - tmp.x) * W);
        if (a > Math.PI / 2) a -= Math.PI; else if (a < -Math.PI / 2) a += Math.PI;
        rot = ` rotate(${a.toFixed(3)}rad)`;
      }
      if (L.text) {
        // côté de l'annotation et glissement horizontal pour rester dans l'écran
        if (!L.w) { L.w = L.text.offsetWidth; L.off = L.big ? 76 : 50; }
        const m = 10, overR = Math.max(0, sx + L.off + L.w - (W - m)), overL = Math.max(0, m - (sx - L.off - L.w));
        const left = overR > 0 && overL < overR;
        if (left !== L.left) { L.el.classList.toggle('fl-left', left); L.left = left; }
        const dx = left ? overL : -Math.min(overR, Math.max(0, sx + L.off - m));
        if (dx !== L.dx) { L.text.style.setProperty('--dx', dx.toFixed(0) + 'px'); L.dx = dx; }
      }
      L.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)${rot}`;
      L.el.style.opacity = o.toFixed(3);
      L.vis = true;
    }
  }

  let progress = 0, needResize = true;
  function draw() {
    if (needResize) { resize(); needResize = false; }
    const p = clamp(progress, 0, 1);
    U.uGrow.value = smooth(0.012, 0.3, p) * 1.0;
    placeCamera(p);
    if (Math.abs(shadowGrow - U.uGrow.value) > 1e-4) {
      renderer.setRenderTarget(shadowRT);
      renderer.clear();
      renderer.render(shadowScene, lightCam);
      shadowGrow = U.uGrow.value;
      U.uShadowOn.value = 1;
    }
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(scene, camera);
    const pu = post.material.uniforms;
    pu.uInvProj.value.copy(camera.projectionMatrixInverse);
    pu.uCamWorld.value.copy(camera.matrixWorld);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    placeLabels(p);
  }

  window.addEventListener('resize', () => { needResize = true; labels.forEach(L => { L.w = 0; }); api.render(progress); });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); section.classList.add('no-3d'); });

  const api = {
    render(p) { progress = p; draw(); },
    setLang(l) { lang = l === 'en' ? 'en' : 'fr'; setTexts(); labels.forEach(L => { L.w = 0; }); draw(); },
    get progress() { return progress; }
  };
  window.CampusFlight = api;
  draw();
  section.classList.add('has-3d');
  document.dispatchEvent(new CustomEvent('campus:ready'));
}

start().catch(err => {
  console.warn('Vol 3D indisponible :', err);
  section && section.classList.add('no-3d');
});
