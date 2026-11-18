// HERO OBJECT for "Armor Where Nobody Shot": OUR OWN generic four-engine tail-dragger bomber (never a copy of a real type).
// Owner: props-hero. Contract: episodes/armor-no-holes/SET_MAP.md (zone A numbers, anchors, movers). No top-level side effects.
//
//   import { buildBomber } from './bomber.js';
//   const B = buildBomber(THREE, ctx, { hero: true, damage: 'heavy', name: 'OLD FAITHFUL', lod: 0 });
//   B.place(ctx.B2T, [3.0, 9.0, 0], [-0.42, -0.91]);      // or: B.group.position.copy(ctx.B2T([3, 9, 0])); B.group.rotation.y = Math.atan2(ny, nx);
//   B.set({ chalk: 1, panel: 0, patch: 0, armor_here: 0, plate_on: 0, props: 1 });
//
// AXES. Everything is written in a LOCAL PLAN FRAME (metres, Z up): origin = the wing centre ON THE GROUND, nose along local +X, the
// pilot's LEFT wing along local +Y. Inside, each plan point [x, y, z] becomes the three.js point (x, z, -y), the same rule as ctx.B2T, so
// the group lives in three.js axes (Y up) and the caller only moves it and turns it about Y: rotation.y = atan2(noseY, noseX) in plan terms.
// `anchors` and `anchors.holes` are LOCAL PLAN points [x, y, z] (ground frame of the plane, after its 6.5 degree tail-down sit).
// B.toPlan(p, at, nose) turns a local point into a world plan point; B.worldAnchors(at, nose) does it for every anchor.
//
// opts: { hero, damage: 'heavy' | 'tail' | 'wings' (exactly 40 holes, wings only: line 7) | 'light' | 'none', name, lod: 0 | 1, seed, contact }.
//   hero  = big textures, 3D rivets, the ribbed interior (the camera can stand inside the body), wing ribs behind the holes.
//   lod 1 = few segments, small textures, painted holes, no small parts: for the far parked planes.
// set(state): chalk 0..1 (rings appear hole by hole, each drawn round), panel 0..1 (falls, two bounces, rests), patch 0/1, armor_here 0..1
//   (1 = chalked, lower = wiped away), plate_on 0/1, props 0..1 (ticking round to a stop; 1 = stopped, a clear gap under the clean
//   engine's hub), prop_angle (radians, free spin for a taxiing plane), finger_ring 0..1 (the ONE extra ring of the inside shot),
//   t (seconds: the shredded tail's ribbons flutter).
// Shiny parts (polished cowl band, oleo chrome, hub domes, glass) use MeshPhongMaterial so the glint comes from the light; all else ctx.toon.

const TAU = Math.PI * 2, D2R = Math.PI / 180;
const PITCH = 6.5 * D2R, SP = Math.sin(PITCH), CP = Math.cos(PITCH), ZW = 2.6;      // tail-down sit; body centreline height at the wing
const NOSE = 7.05, TAIL = -13.0, LEN = NOSE - TAIL, SPAN = 13, HF = 3.85, SSPAN = 4.4, ZE = -0.45, ENG_Y = [4.24, 8.41], FIN_Z0 = 0.35;
const lerp = (a, b, t) => a + (b - a) * t, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = t => { t = cl(t); return t * t * (3 - 2 * t); };
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** airframe point -> the plane's local ground frame (plan axes) */
export const A2G = p => [p[0] * CP - p[2] * SP, p[1], ZW + p[0] * SP + p[2] * CP];
const A2Gn = n => [n[0] * CP - n[2] * SP, n[1], n[0] * SP + n[2] * CP];
export const BOMBER_SPEC = { length: LEN, span: SPAN * 2, body_radius: 1.15, wing_z: ZW, pitch_deg: 6.5, engines_y: [-8.41, -4.24, 4.24, 8.41], prop_radius: 1.75, wheel: [0.49, 4.2, 0.7], wheel_radius: 0.7 };

// ---------- shape of the airframe (airframe frame: x forward, y left, z up, origin on the body centreline at the wing) ----------
function fusR(x) {
  if (x > 5.5) { const s = cl((NOSE - x) / 1.55); return 0.95 * Math.sqrt(Math.max(0, 1 - (1 - s) * (1 - s))); }
  if (x > 3.4) return lerp(1.15, 0.95, sm((x - 3.4) / 2.1));
  if (x > -4) return 1.15;
  if (x > -12.7) return lerp(1.15, 0.34, Math.pow((-4 - x) / 8.7, 1.15));
  const s = cl((x - TAIL) / 0.3); return 0.34 * Math.sqrt(Math.max(0, 1 - (1 - s) * (1 - s)));
}
const fusZ = x => x > 3.4 ? -0.40 * Math.pow((x - 3.4) / 3.65, 1.6) : x > -4 ? 0 : 0.25 * Math.pow((-4 - x) / 9, 2);
const fusP = (x, ph, off = 0) => { const r = fusR(x) + off; return [x, r * Math.sin(ph), fusZ(x) + r * Math.cos(ph)]; };
const CANW = 62 * D2R, canB = x => x > 5.45 || x < 2.7 ? 0 : x > 4.8 ? 0.58 * sm((5.45 - x) / 0.65) : x > 4.0 ? 0.58 : 0.58 * sm((x - 2.7) / 1.3);
const canP = (x, ph, off = 0) => { const r = fusR(x) + canB(x) * Math.pow(Math.max(0, Math.cos(ph / CANW * Math.PI / 2)), 0.55) + off; return [x, r * Math.sin(ph), fusZ(x) + r * Math.cos(ph)]; };
const naca = c => 5 * (0.2969 * Math.sqrt(c) - 0.126 * c - 0.3516 * c * c + 0.2843 * c ** 3 - 0.1036 * c ** 4);
const wLE = y => 2.35 - 0.135 * y, wCh0 = y => 5.2 - 0.26 * y, wTip = y => y > 12.4 ? Math.sqrt(Math.max(0, 1 - ((y - 12.4) / 0.6) ** 2)) : 1;
const wCh = y => Math.max(.02, wCh0(y) * wTip(y)), wZ = y => -0.433 + 0.035 * y;
const wingP = (s, f, y, c) => { const ch = wCh0(y) * wTip(y), le = wLE(y) - (1 - wTip(y)) * wCh0(y) * 0.35; return [le - c * ch, s * y, wZ(y) + 0.02 * ch * 4 * c * (1 - c) + f * (0.16 - 0.004 * y) * ch * naca(cl(c))]; };
const wingC = (y, x) => (wLE(y) - x) / wCh0(y);                                                    // chord fraction of an x (inner wing, no tip rounding)
const sTip = y => y > 4.0 ? Math.sqrt(Math.max(0, 1 - ((y - 4.0) / 0.4) ** 2)) : 1, sCh0 = y => 2.7 - 0.30 * y, sCh = y => Math.max(.02, sCh0(y) * sTip(y));
const stabP = (s, f, y, c) => { const ch = sCh0(y) * sTip(y), le = -10.3 - 0.22 * y - (1 - sTip(y)) * sCh0(y) * 0.35; return [le - c * ch, s * y, 0.28 + 0.01 * y + f * 0.10 * ch * naca(cl(c))]; };
const fTip = h => h > 3.45 ? Math.sqrt(Math.max(0, 1 - ((h - 3.45) / 0.4) ** 2)) : 1;
const finLE = h => -9.4 - 0.62 * h + 3.4 * Math.max(0, 0.8 - h) ** 2, finTE = h => -13.05 - 0.07 * h, finCh = h => Math.max(.02, (finLE(h) - finTE(h)) * fTip(h));
const finP = (s, h, c) => { const ch = (finLE(h) - finTE(h)) * fTip(h), le = finLE(h) - (1 - fTip(h)) * (finLE(h) - finTE(h)) * 0.4; return [le - c * ch, s * 0.045 * (3.65 - 0.55 * h) * fTip(h) * naca(cl(c)), FIN_Z0 + h]; };
const NAC = [[1.5, .66, ZE], [1.0, .655, ZE], [.3, .62, ZE], [-.5, .54, ZE + .03], [-1.3, .40, ZE + .09], [-2.1, .24, ZE + .16], [-2.7, .09, ZE + .2], [-2.95, .0, ZE + .22]];
const nacAt = x => { for (let i = 0; i < NAC.length - 1; i++) if (x <= NAC[i][0] && x >= NAC[i + 1][0]) { const t = (NAC[i][0] - x) / (NAC[i][0] - NAC[i + 1][0]); return [lerp(NAC[i][1], NAC[i + 1][1], t), lerp(NAC[i][2], NAC[i + 1][2], t)]; } return x > 1.5 ? [.66, ZE] : [0, ZE + .22]; };
const COWL = [[1.45, .70], [1.9, .704], [2.2, .705], [2.5, .69], [2.64, .66], [2.74, .61], [2.795, .545], [2.805, .51], [2.775, .475], [2.6, .46], [2.3, .49]];
const cowlR = x => { for (let i = 0; i < 6; i++) if (x >= COWL[i][0] && x <= COWL[i + 1][0]) return lerp(COWL[i][1], COWL[i + 1][1], (x - COWL[i][0]) / (COWL[i + 1][0] - COWL[i][0])); return .7; };

const TEXC = new Map();                                                                            // far-plane textures are shared between planes of one kind (filled on first build, never at import)

// one rubber patch, one look (in the Chief's hand, sets/props.js, and on the tire): lighter tan rubber, a buffed cross-hatched edge all round, the maker's ring and number pressed into the smooth middle, apron dust
function paintPatch(g, w, h, clip) { const q = rng(77), rc = Math.min(w, h) * .2, path = m => { g.beginPath(); g.moveTo(m + rc, m); g.lineTo(w - m - rc, m); g.quadraticCurveTo(w - m, m, w - m, m + rc); g.lineTo(w - m, h - m - rc); g.quadraticCurveTo(w - m, h - m, w - m - rc, h - m); g.lineTo(m + rc, h - m); g.quadraticCurveTo(m, h - m, m, h - m - rc); g.lineTo(m, m + rc); g.quadraticCurveTo(m, m, m + rc, m); g.closePath(); };
  g.clearRect(0, 0, w, h); if (clip) { g.save(); path(2); g.clip(); } g.fillStyle = '#a9743f'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(62,36,14,.62)'; g.lineWidth = Math.max(1.5, w / 210); for (let i = -h; i < w; i += w / 34) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
  const m = Math.min(w, h) * .16; path(m); g.fillStyle = '#c8935a'; g.fill(); g.strokeStyle = 'rgba(70,40,16,.7)'; g.lineWidth = Math.max(2, w / 130); g.stroke();
  g.strokeStyle = 'rgba(96,58,26,.75)'; g.lineWidth = Math.max(2, w / 90); g.beginPath(); g.ellipse(w / 2, h / 2, w * .2, h * .24, 0, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(96,58,26,.8)'; g.font = 'bold ' + Math.round(h * .16) + 'px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('No 4', w / 2, h / 2 + 2);
  for (let i = 0; i < 80; i++) { g.fillStyle = q() < .5 ? 'rgba(236,214,170,' + (q() * .2) + ')' : 'rgba(60,36,16,' + (q() * .16) + ')'; g.beginPath(); g.arc(q() * w, q() * h, (1 + q() * 5) * w / 400, 0, Math.PI * 2); g.fill(); }
  path(2); g.strokeStyle = 'rgba(58,32,12,.85)'; g.lineWidth = Math.max(2, w / 110); g.stroke(); if (clip) g.restore(); }

export function buildBomber(THREE, ctx, opts = {}) {
  const o = Object.assign({ hero: false, damage: 'none', name: null, lod: 0, seed: 1943, contact: true }, opts);
  if (o.name == null) o.name = o.hero ? 'OLD FAITHFUL' : '';
  const HI = o.lod === 0, HERO = !!o.hero && HI, Q = HERO ? 1 : HI ? .5 : .25;
  const toon = (ctx && ctx.toon) || ((c, op = {}) => new THREE.MeshToonMaterial({ color: c, ...op }));
  const C = { olive: '#6e7e3a', oliveD: '#525f2c', oliveL: '#88984e', grey: '#b6c4d4', greyD: '#8a98a8', greyL: '#ccd6e2', alu: '#b2c8e2', aluD: '#748eac', inner: '#5a6848', rubber: '#40341f', black: '#2a2b2e', yellow: '#f0c232', blue: '#2f5fb8',
    chalk: '#f3f0e6', steel: '#7b848c', rust: '#5d4234', brass: '#c9a23f', dark: '#17161a', leather: '#6b4630', cream: '#efe2bd', wood: '#a8733f' };
  const root = new THREE.Group(); root.name = 'bomber' + (o.name ? '_' + o.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : ''); root.userData.role = 'vehicle';
  const air = new THREE.Group(); air.name = 'bomber_airframe'; air.position.set(0, ZW, 0); air.rotation.z = PITCH; root.add(air);
  const V = p => new THREE.Vector3(p[0], p[2], -p[1]), UP = new THREE.Vector3(0, 1, 0);
  const stats = { meshes: 0, tris: 0, kinds: new Set() }, cnt = {};
  const add = (m, name, role, op = {}) => { cnt[name] = (cnt[name] || 0) + 1; m.name = cnt[name] > 1 ? `${name}_${String(cnt[name]).padStart(2, '0')}` : name; m.userData.role = role; if (op.mat) m.userData.mat = op.mat; m.castShadow = op.cast ?? true; m.receiveShadow = op.recv ?? true; (op.parent || air).add(m);
    if (m.isMesh) { stats.meshes++; stats.kinds.add(name); const g = m.geometry; stats.tris += Math.round((g.index ? g.index.count : g.attributes.position.count) / 3 * (m.isInstancedMesh ? m.count : 1)); } return m; };
  const mc = new Map();
  const M = (col, op) => { const k = col + (op ? JSON.stringify(op) : ''); if (!mc.has(k)) mc.set(k, toon(col, op || {})); return mc.get(k); };
  const shiny = (col, sh = 90, spec = '#fff3d6', own = false) => { const tn = !own && ctx && ctx.toon && o.metal_glints !== false, k = (tn ? 'G' : 'P') + col + sh + spec; if (!mc.has(k)) mc.set(k, tn ? toon(col) : new THREE.MeshPhongMaterial({ color: col, shininess: sh, specular: spec })); return mc.get(k); };   // fix 12 (round 3): toon + role metal = the lighting module's glint; own = keep the smooth highlight (cowl band, propeller dome); opts.metal_glints: false = all as before
  const GLASS = new THREE.MeshPhongMaterial({ color: '#9cc3d6', transparent: true, opacity: .5, shininess: 110, specular: '#b9c6cf', side: THREE.DoubleSide, depthWrite: false });
  // ---------- primitive helpers (all points in the parent's plan frame) ----------
  const box = (name, role, size, at, col, op = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[2], size[1]), op.m || M(col)); m.position.copy(V(at)); if (op.e) m.rotation.set(op.e[0], op.e[1], op.e[2]); return add(m, name, role, op); };
  const orient = (m, a, b) => { const A = V(a), B = V(b), d = B.clone().sub(A), L = d.length(); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return L; };
  const cyl = (name, role, a, b, r, col, op = {}) => { const A = V(a), B = V(b), L = A.distanceTo(B), m = new THREE.Mesh(new THREE.CylinderGeometry(op.r2 ?? r, r, L, op.seg ?? (HI ? 12 : 6), 1, !!op.open), op.m || M(col)); orient(m, a, b); return add(m, name, role, op); };
  const beam = (name, role, a, b, w, t, col, op = {}) => { const A = V(a), B = V(b), L = A.distanceTo(B), m = new THREE.Mesh(new THREE.BoxGeometry(w, L, t), op.m || M(col)); const d = B.clone().sub(A).normalize(), side = op.side ? V(op.side).normalize() : new THREE.Vector3(0, 0, 1).cross(d).lengthSq() > .01 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const x = side.clone().sub(d.clone().multiplyScalar(side.dot(d))).normalize(), z = new THREE.Vector3().crossVectors(x, d); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, d, z)); m.position.copy(A).addScaledVector(B.clone().sub(A), .5); return add(m, name, role, op); };
  const tube = (name, role, pts, r, col, op = {}) => add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), !!op.closed, 'catmullrom', op.tension ?? .5), op.seg ?? Math.max(8, pts.length * 5), r, op.rs ?? 6, !!op.closed), op.m || M(col)), name, role, op);
  const sph = (name, role, r, at, col, op = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, op.seg ?? (HI ? 14 : 8), op.seg2 ?? (HI ? 10 : 6), 0, TAU, op.t0 ?? 0, op.tl ?? Math.PI), op.m || M(col)); m.position.copy(V(at)); const s = op.s || [1, 1, 1]; m.scale.set(s[0], s[2], s[1]); if (op.e) m.rotation.set(op.e[0], op.e[1], op.e[2]); return add(m, name, role, op); };
  const lathe = (name, role, prof, origin, dir, col, op = {}) => { const m = new THREE.Mesh(new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(Math.max(0, q[1]), q[0])), op.seg ?? (HI ? 36 : 12), op.p0 ?? 0, op.pl ?? TAU), op.m || M(col, { side: THREE.DoubleSide })); m.position.copy(V(origin)); m.quaternion.setFromUnitVectors(UP, V(dir).normalize()); return add(m, name, role, op); };
  // grid surface from a function P(a, b) -> plan point; uv(a, b) -> [u, v] with v DOWN (canvas rows)
  const gridGeo = (Pf, as, bs, uvf, inside, seam) => { const na = as.length, nb = bs.length, pos = new Float32Array(na * nb * 3), uv = new Float32Array(na * nb * 2), idx = [];
    for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) { const k = i * nb + j, p = Pf(as[i], bs[j]); pos[k * 3] = p[0]; pos[k * 3 + 1] = p[2]; pos[k * 3 + 2] = -p[1]; if (uvf) { const t = uvf(as[i], bs[j]); uv[k * 2] = t[0]; uv[k * 2 + 1] = 1 - t[1]; } }
    for (let i = 0; i < na - 1; i++) for (let j = 0; j < nb - 1; j++) { const a = i * nb + j, b = a + 1, c = a + nb, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    if (inside) { const ps = g.attributes.position, ix = g.index.array, cI = V(inside), a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(); let s = 0; const step = 3 * Math.max(1, Math.floor(ix.length / 3 / 60));
      for (let t = 0; t < ix.length; t += step) { a.fromBufferAttribute(ps, ix[t]); b.fromBufferAttribute(ps, ix[t + 1]); d.fromBufferAttribute(ps, ix[t + 2]); const n = b.clone().sub(a).cross(d.clone().sub(a)); s += n.dot(a.clone().add(b).add(d).multiplyScalar(1 / 3).sub(cI)); }
      if (s < 0) for (let t = 0; t < ix.length; t += 3) { const k = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = k; } }
    g.computeVertexNormals();
    if (seam) { const nn = g.attributes.normal; for (let i = 0; i < na; i++) { const a = i * nb, b = a + nb - 1, x = nn.getX(a) + nn.getX(b), y = nn.getY(a) + nn.getY(b), z = nn.getZ(a) + nn.getZ(b), l = Math.hypot(x, y, z) || 1; nn.setXYZ(a, x / l, y / l, z / l); nn.setXYZ(b, x / l, y / l, z / l); } }
    return g; };
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n), cosr = n => Array.from({ length: n }, (_, i) => (1 - Math.cos(Math.PI * i / (n - 1))) / 2);
  const triGeo = pts => { const g = new THREE.BufferGeometry(), a = new Float32Array(pts.length * 3); pts.forEach((p, i) => { a[i * 3] = p.x; a[i * 3 + 1] = p.y; a[i * 3 + 2] = p.z; }); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.computeVertexNormals(); return g; };
  const canvasTex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const mk = (W, H, fn) => { const c = document.createElement('canvas'); c.width = Math.max(8, Math.round(W)); c.height = Math.max(8, Math.round(H)); const g = c.getContext('2d'); fn(g, c.width, c.height); return c; };

  // ---------- skin surfaces: point, outward normal, metres per unit, and where a point sits on the surface's own canvas ----------
  const S = {};
  const surf = (key, P, mb, out, px, b0 = -1e9, b1 = 1e9) => (S[key] = { key, P, ma: () => 1, mb, px, clampB: b => cl(b, b0, b1),
    N(a, b) { const e = 2e-3, p = P(a, b), pa = P(a + e, b), pb = P(a, this.clampB(b + e) === b + e ? b + e : b - e), u = [pa[0] - p[0], pa[1] - p[1], pa[2] - p[2]], v = [pb[0] - p[0], pb[1] - p[1], pb[2] - p[2]];
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(n[0], n[1], n[2]) || 1, r = out(a, b), sg = (n[0] * r[0] + n[1] * r[1] + n[2] * r[2]) < 0 ? -1 : 1; return [n[0] / l * sg, n[1] / l * sg, n[2] / l * sg]; },
    off(a, b, d) { const p = P(a, b), n = this.N(a, b); return [p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d]; },
    loc(a, b, da, db) { return [a + da, b + db / mb(a, b)]; } });
  surf('fus', (x, ph) => fusP(x, ph), x => Math.max(.05, fusR(x)), (x, ph) => [0, Math.sin(ph), Math.cos(ph)], (x, ph) => [(NOSE - x) / LEN, (ph + Math.PI) / TAU]);
  for (const [sd, s] of [['L', 1], ['R', -1]]) {
    for (const [fc, f] of [['u', 1], ['l', -1]]) {
      surf('w' + sd + fc, (y, c) => wingP(s, f, y, c), y => wCh(y), () => [0, 0, f], (y, c) => [y / SPAN, c], .004, .996);
      surf('s' + sd + fc, (y, c) => stabP(s, f, y, c), y => sCh(y), () => [0, 0, f], (y, c) => [y / SSPAN, c], .004, .996);
    }
    surf('fin' + sd, (h, c) => finP(s, h, c), h => finCh(h), () => [0, s, 0], (h, c) => [c, 1 - h / HF], .004, .996);
  }

  // ---------- THE HOLES (seeded, so every build gives the same plane) ----------
  const holes = [], hr = rng(o.seed), HR = (a, b) => a + (b - a) * hr(); let hid = 0;
  const mkPoly = (r, kind) => { const n = kind === 'bullet' ? 9 : kind === 'flak' ? 13 : 18, e = kind === 'bullet' ? 1 : kind === 'flak' ? 1 + hr() * .6 : 1.5 + hr() * .8, th = kind === 'tear' ? HR(-.3, .3) : hr() * TAU, poly = [];
    for (let k = 0; k < n; k++) { const al = k / n * TAU, rad = r * (kind === 'bullet' ? .82 + .36 * hr() : .6 + .8 * hr()), x = Math.cos(al) * rad * e, y = Math.sin(al) * rad; poly.push([x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)]); } return poly; };
  const far = (key, a, b, r) => holes.every(h => h.surf !== key || Math.hypot(h.a - a, (h.b - b) * S[key].mb(a, b)) > (h.r + r) * 1.9 + .05);
  const put = (keys, a, b, r, kind, extra = {}) => { const poly = mkPoly(r, kind), id = ++hid, bend = hr() < .5 ? 1 : -1; keys.forEach((key, i) => holes.push({ id, surf: key, a, b, r, kind, poly, bend: i ? -bend : bend, through: keys.length > 1, ...extra })); };
  const size = (flakP = .3) => hr() < flakP ? [HR(.085, .17), 'flak'] : [HR(.03, .052), 'bullet'];
  const wingOK = (sd, fc, y, c, r) => { if (y < 1.5 || y > 12.3 || c < .012 || c > .93) return false; for (const e of ENG_Y) if (Math.abs(y - e) < 1.0 + r) return false;
    if (sd === 'L' && fc !== 'u') { const x = wLE(y) - c * wCh0(y); if (y > 5.3 - r && y < 6.66 + r && x > .7 - r && x < 1.24 + r) return false; if (y > 6.1 - r && y < 6.74 + r && x > .14 - r && x < .62 + r) return false; } return true; };
  const fusOK = (x, ph, r) => { const a = Math.abs(ph) / D2R; if (x > 5.5 || x < -12.0 || a > 160) return false; if (x > 2.5 && a < 74) return false; if (x > 3.3 && x < 5.35 && a > 76 && a < 116) return false; if (x > -3.2 && x < 2.7 && a > 82 && a < 147) return false;
    if (x > .8 && x < 2.4 && a < 34) return false; if (x > -7.9 && x < -6.5 && ph > 0 && a > 55 && a < 152) return false; if (x > -6.3 && x < -5.2 && a > 60 && a < 100) return false; if (x < -8.2 && x > -9.8 && a > 140) return false; if (x < -8.8 && a < 28) return false; if (x < -9.9 && a > 55 && a < 125) return false; return true; };
  const scatter = (n, gen) => { let tries = 0; for (let i = 0; i < n && tries < n * 60; tries++) if (gen()) i++; };
  const wingHoles = (sd, nThrough, nLow, nUp, flakP) => { const lst = [[nThrough, ['u', 'l']], [nLow, ['l']], [nUp, ['u']]]; for (const [n, fcs] of lst) scatter(n, () => { const y = HR(1.5, 12.3), c = HR(.07, .93), [r, kind] = size(flakP); if (!fcs.every(fc => wingOK(sd, fc, y, c, r) && far('w' + sd + fc, y, c, r))) return false; put(fcs.map(fc => 'w' + sd + fc), y, c, r, kind); return true; }); };
  const fusHoles = (n, x0, x1, p0, p1, flakP) => scatter(n, () => { const x = HR(x0, x1), ph = HR(p0, p1) * D2R, [r, kind] = size(flakP); if (!fusOK(x, ph, r) || !far('fus', x, ph, r)) return false; put(['fus'], x, ph, r, kind); return true; });
  const tailHoles = (nFin, nStab, flakP) => { scatter(nFin, () => { const h = HR(.5, 3.5), c = HR(.1, .9), [r, kind] = size(flakP); if (!far('finL', h, c, r)) return false; put(['finL', 'finR'], h, c, r, kind); return true; });
    for (const sd of ['L', 'R']) scatter(nStab, () => { const y = HR(.9, 4.0), c = HR(.1, .9), [r, kind] = size(flakP); if (!far('s' + sd + 'u', y, c, r)) return false; put(['s' + sd + 'u', 's' + sd + 'l'], y, c, r, kind); return true; }); };
  if (o.damage === 'heavy') {
    put(['wLl', 'wLu'], 5.08, wingC(5.08, .30), .10, 'flak', { tag: 'hole_light' });               // SET_MAP hole_light: straight through both skins
    put(['wLl'], 5.5, wingC(5.5, .45), .085, 'flak', { tag: 'last_ring' });                         // the Chief's LAST chalk circle (B2), right over his mark
    put(['fus'], -4.0, 86 * D2R, .06, 'bullet', { tag: 'finger_hole' });                            // the finger comes through here (B3); ringed by finger_ring, not by chalk
    for (const [x, ph, r] of [[-3.45, 78, .075], [-4.55, 92, .065], [-3.7, 104, .12], [-4.3, 66, .14], [-4.95, 80, .055]]) put(['fus'], x, ph * D2R, r, r > .1 ? 'flak' : 'bullet');   // eye-height holes on the wall the inside shot looks out through
    fusHoles(17, -5.6, -2.9, 42, 138, .3); wingHoles('L', 29, 9, 5, .3); wingHoles('R', 26, 6, 4, .28); fusHoles(9, 2.55, 5.5, 60, 160, .3); fusHoles(7, 2.55, 5.5, -160, -60, .3);
    for (const [sd, n] of [['L', 5], ['R', 4]]) for (const fc of ['l', 'u']) scatter(n, () => { const y = HR(1.5, 12.3), c = HR(.015, .1), [r, kind] = size(.35); if (!wingOK(sd, fc, y, c, r) || !far('w' + sd + fc, y, c, r)) return false; put(['w' + sd + fc], y, c, r, kind); return true; });   // leading-edge hits: these face the hook camera
    fusHoles(14, -11.5, 4.9, 20, 158, .25); fusHoles(18, -11.5, 4.9, -158, -20, .25); fusHoles(4, -8, 2, -20, 20, .2); tailHoles(12, 9, .3);
  } else if (o.damage === 'tail') {
    for (const [h, c, r] of [[2.9, .42, .46], [2.05, .68, .52], [1.2, .40, .42], [3.3, .78, .3], [.75, .80, .36], [2.3, .2, .24]]) put(['finL', 'finR'], h, c, r, 'tear');
    for (const [y, c, r] of [[2.6, .55, .40], [3.5, .7, .3], [1.5, .78, .3]]) put(['sLu', 'sLl'], y, c, r, 'tear'); put(['sRu', 'sRl'], 3.2, .7, .32, 'tear');
    fusHoles(8, -12, -7, -150, 150, .35); tailHoles(4, 3, .2);
  } else if (o.damage === 'wings') { wingHoles('L', 14, 4, 2, .2); wingHoles('R', 14, 4, 2, .2);                                      // line 7: "forty holes in its wings" (exactly 40)
  } else if (o.damage === 'light') { wingHoles('L', 3, 1, 0, .15); wingHoles('R', 2, 1, 0, .15); fusHoles(4, -10, 2, -150, 150, .15); tailHoles(2, 1, .1); }
  // ROUND 3 (2026-11-13, hero only): the cabin wall the inside shot looks at carries MORE and MORE KINDS of hits: two big flak tears, long splinter gashes, medium holes and sprays of small splinter holes,
  // 25 to 40 in one view. They are appended AFTER every older hole on their own random stream, so each older hole, petal and chalk ring stays exactly where it was. Outside and inside are the same openings.
  const fusH0 = holes.filter(h => h.surf === 'fus' && h.kind !== 'tear');
  const BOT = (() => { let best = null; for (const aD of [121, 119, 123, 117, 125, 127]) for (let xx = -5.0; xx <= -2.9; xx += .05) { const clear = fusH0.every(h => h.a < xx - .12 - h.r || h.a > xx + .96 + h.r || Math.abs(h.b - aD * D2R) * 1.15 > .15 + h.r) && Math.abs(xx + .38 + 4.72) > .5; if (clear && (!best || Math.abs(xx + .38 + 4.15) + (aD - 121) * .004 < best.k)) best = { k: Math.abs(xx + .38 + 4.15) + (aD - 121) * .004, xx, aD }; } return best || { xx: -4.42, aD: 127 }; })();   // the oxygen bottle's clear patch, found among the OLDER holes only, so the bottle keeps its place
  const rhoOf = h => h.rho || Math.max(.105, h.r * 1.55 + .045) * (h.kind === 'tear' ? .9 : 1);                                          // radius of a hole's chalk ring
  if (HERO && o.damage === 'heavy') { const q3 = rng(o.seed + 301), Q3 = (a, b) => a + (b - a) * q3(), frameOff = x => Math.abs(x - Math.round(x * 2) / 2);
    const blob = (r, n, e, lo, hi) => { const th = q3() * TAU, poly = []; for (let k = 0; k < n; k++) { const al = k / n * TAU, rad = r * (lo + (hi - lo) * q3()), x = Math.cos(al) * rad * e, y = Math.sin(al) * rad; poly.push([x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)]); } return poly; };
    const ok3 = (x, phD, r, rho, cut) => { const ph = phD * D2R; if (!fusOK(x, ph, r)) return false; if (!cut && frameOff(x) < r * .95 + .035) return false;
      if (x > BOT.xx - .24 - r && x < BOT.xx + 1.25 + r && Math.abs(phD - BOT.aD) * D2R * 1.15 < .25 + r) return false; if (Math.hypot(x + 4.72, (phD - 118) * D2R * 1.15) < .17 + r) return false;   // not behind the oxygen bottle, not behind the hand lamp
      if (Math.abs(phD - 52.3) * D2R * 1.15 < .07 + r && frameOff(x - .02) < .1 + r) return false;                                                                                                   // not under a cable fairlead bracket
      return holes.every(h => h.surf !== 'fus' || Math.hypot(h.a - x, (h.b - ph) * 1.15) > (rhoOf(h) + rho) * .93); };                                                                              // chalk rings do not run into each other
    const put3 = (x, phD, r, kind, poly, extra = {}) => holes.push({ id: ++hid, surf: 'fus', a: x, b: phD * D2R, r, kind, poly, bend: q3() < .72 ? -1 : 1, through: false, round3: true, ...extra });
    const zone = () => { const z = q3(); return z < .68 ? [Q3(-5.2, -3.28), Q3(36, 150)] : z < .88 ? [Q3(-3.2, -2.45), Q3(36, 79)] : [Q3(-5.62, -5.22), Q3(103, 150)]; };
    const scat3 = (n, gen) => { let t = 0, k = 0; while (k < n && t++ < n * 300) if (gen()) k++; };
    scat3(2, () => { const x = Q3(-5.1, -3.4), p = Q3(60, 140), r = Q3(.15, .19); if (!ok3(x, p, r, r * 1.55 + .045, true)) return false; put3(x, p, r, 'flak', blob(r, 15, 1 + q3() * .45, .6, 1.3), { shape: 'flak' }); return true; });
    scat3(5, () => { const [x, p] = zone(), rm = Q3(.022, .036), e = Q3(2.2, 3.0), r = rm * e * .8; if (!ok3(x, p, r, r * 1.55 + .045, q3() < .3)) return false; put3(x, p, r, 'flak', blob(rm, 12, e, .75, 1.25), { shape: 'gash' }); return true; });
    scat3(7, () => { const [x, p] = zone(), r = Q3(.045, .08); if (!ok3(x, p, r, r * 1.55 + .045)) return false; put3(x, p, r, 'bullet', blob(r, 10, 1 + q3() * .25, .84, 1.16), { shape: 'round' }); return true; });
    for (let s = 0; s < 3; s++) { const [cx, cp] = zone(), dir = q3() * TAU; scat3(4 + (s % 2), () => { const d = Q3(0, .34), a = dir + (q3() - .5) * .9, x = cx + Math.cos(a) * d, p = cp + Math.sin(a) * d / 1.15 / D2R, r = Q3(.013, .022); if (!ok3(x, p, r, .058)) return false; put3(x, p, r, 'bullet', blob(r, 7, 1 + q3() * .5, .8, 1.2), { shape: 'splinter', rho: .058 }); return true; }); } }
  // cabin holes get a SMOOTH torn outline (a closed spline through the old corner points): the painted sheets, the torn metal and the cuts in frames and stringers all use it
  const smoothPoly = (poly, sub) => { const n = poly.length, out = []; for (let i = 0; i < n; i++) { const p0 = poly[(i - 1 + n) % n], p1 = poly[i], p2 = poly[(i + 1) % n], p3 = poly[(i + 2) % n]; for (let k = 0; k < sub; k++) { const t = k / sub, t2 = t * t, t3 = t2 * t, f = j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); out.push([f(0), f(1)]); } } return out; };
  const cabHole = h => HERO && h.surf === 'fus' && h.kind !== 'tear' && h.a > -7.55 && h.a < 1.5;
  for (const h of holes) if (cabHole(h)) h.out = smoothPoly(h.poly, h.poly.length > 12 ? 4 : 5);
  const holesOf = key => holes.filter(h => h.surf === key), nHoles = hid;
  // chalk order: tail, body, far wing, near wing top, near wing underside; the tagged last ring comes last
  const rank = h => h.tag === 'last_ring' ? 9 : /^fin|^s/.test(h.surf) ? 0 : h.surf === 'fus' ? 1 : /^wR/.test(h.surf) ? 2 : h.surf === 'wLu' ? 3 : 4;
  const ringList = holes.filter(h => h.tag !== 'finger_hole').map((h, i) => ({ h, k: rank(h) * 1000 + (h.surf === 'fus' ? -h.a * 10 : h.a * 10) + i * 1e-3 })).sort((p, q) => p.k - q.k).map(p => p.h);

  // ---------- painted skins (panel lines, rivet rows, wear, stains, the holes as real openings) ----------
  const local = (g, W, H, sf, a, b, fn) => { const e = .01, p = sf.px(a, b), pa = sf.px(a + e, b), pb = sf.px(a, b + e / sf.mb(a, b)); g.save(); g.setTransform((pa[0] - p[0]) / e * W, (pa[1] - p[1]) / e * H, (pb[0] - p[0]) / e * W, (pb[1] - p[1]) / e * H, p[0] * W, p[1] * H); fn(); g.restore(); };
  const holePath = (g, h, k) => { g.beginPath(); (h.out || h.poly).forEach((q, i) => i ? g.lineTo(q[0] * k, q[1] * k) : g.moveTo(q[0] * k, q[1] * k)); g.closePath(); };
  const PUNCH = HI;                                                                                // lod 1: holes are painted dark, not cut
  const paintHoles = (g, W, H, sf, light) => { for (const h of holesOf(sf.key)) local(g, W, H, sf, h.a, h.b, () => {
    if (h.kind !== 'tear') { const R1 = h.r * (h.kind === 'bullet' ? 2.1 : 2.4), gr = g.createRadialGradient(0, 0, h.r * .5, 0, 0, R1); gr.addColorStop(0, 'rgba(22,17,12,.8)'); gr.addColorStop(1, 'rgba(22,17,12,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R1, 0, TAU); g.fill(); }
    g.fillStyle = light ? '#e6e8ea' : '#cfd2d5'; holePath(g, h, h.kind === 'tear' ? 1.1 : 1.34); g.fill(); g.fillStyle = '#7f858b'; holePath(g, h, h.kind === 'tear' ? 1.04 : 1.14); g.fill();
    if (PUNCH || h.kind === 'tear') { g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; holePath(g, h, 1); g.fill(); if (h.out) { g.lineWidth = .01; g.lineJoin = 'round'; g.stroke(); } g.globalCompositeOperation = 'source-over'; } else { g.fillStyle = '#131009'; holePath(g, h, 1); g.fill(); } }); };
  const tints = (g, r, x0, y0, w, h, nx, ny, amt) => { for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { g.fillStyle = r() < .5 ? `rgba(255,255,235,${r() * amt})` : `rgba(10,12,0,${r() * amt})`; g.fillRect(x0 + i * w / nx, y0 + j * h / ny, w / nx + 1, h / ny + 1); } };
  const chips = (g, r, n, x0, y0, w, h, s) => { for (let i = 0; i < n; i++) { g.fillStyle = r() < .7 ? 'rgba(200,204,208,.85)' : 'rgba(120,126,132,.8)'; const x = x0 + r() * w, y = y0 + r() * h; g.beginPath(); for (let k = 0; k < 5; k++) g.lineTo(x + (r() - .5) * s * 2.2, y + (r() - .5) * s); g.fill(); } };
  const boomerang = (g, L, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-L, L * .5); g.quadraticCurveTo(-L * .2, -L * .25, 0, -L * .55); g.quadraticCurveTo(L * .2, -L * .25, L, L * .5); g.stroke(); };
  const shared = (key, make) => { if (HERO) return make(); const k = [key, o.damage, o.seed, o.lod, o.name].join('|'); if (!TEXC.has(k)) TEXC.set(k, make()); return TEXC.get(k); };

  const texFus = shared('fus', () => canvasTex(mk(4096 * Q, 1024 * Q, (g, W, H) => { const X = x => (NOSE - x) / LEN * W, Y = ph => (ph + Math.PI) / TAU * H, r = rng(o.seed + 11), px = W / 4096, sf = S.fus;
    g.fillStyle = C.grey; g.fillRect(0, 0, W, H); g.fillStyle = C.olive; g.beginPath(); for (let i = 0; i <= 240; i++) g.lineTo(i / 240 * W, Y(-118 * D2R) + Math.sin(i * .7) * H * .006); for (let i = 240; i >= 0; i--) g.lineTo(i / 240 * W, Y(118 * D2R) + Math.sin(i * .9 + 1) * H * .006); g.closePath(); g.fill();
    tints(g, r, 0, 0, W, H, Math.round(LEN / .5), 18, .15);
    // long soft weather streaks down the sides, soot under the belly
    for (let i = 0; i < 230; i++) { const x = r() * W, left = r() < .5, y0 = left ? Y((30 + r() * 80) * D2R) : Y(-(30 + r() * 80) * D2R), len = (40 + r() * 150) * px * (left ? 1 : -1), gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, `rgba(30,28,18,${.12 + r() * .22})`); gr.addColorStop(1, 'rgba(30,28,18,0)'); g.fillStyle = gr; g.fillRect(x, Math.min(y0, y0 + len), (3 + r() * 11) * px, Math.abs(len)); }
    // frames and longerons as fine build lines, a light edge beside each, rivet rows as dashes
    g.lineWidth = Math.max(1, 2.6 * px);
    for (let x = -12.5; x < 5.76; x += .5) { g.strokeStyle = 'rgba(24,26,14,.85)'; g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), H); g.stroke(); g.strokeStyle = 'rgba(240,243,215,.34)'; g.beginPath(); g.moveTo(X(x) + 2.6 * px, 0); g.lineTo(X(x) + 2.6 * px, H); g.stroke(); }
    for (let k = -8; k <= 8; k++) { const y = Y(k * 20 * D2R); g.strokeStyle = 'rgba(24,26,14,.8)'; g.beginPath(); g.moveTo(0, y); g.lineTo(X(TAIL + .4), y); g.stroke(); }
    g.setLineDash([2.6 * px, 7 * px]); g.strokeStyle = 'rgba(232,235,205,.62)'; g.lineWidth = Math.max(1, 2.6 * px);
    for (let x = -12.5; x < 5.76; x += .5) for (const d of [-5, 5]) { g.beginPath(); g.moveTo(X(x) + d * px, 0); g.lineTo(X(x) + d * px, H); g.stroke(); }
    for (let k = -8; k <= 8; k++) for (const d of [-4, 4]) { const y = Y(k * 20 * D2R) + d * px; g.beginPath(); g.moveTo(0, y); g.lineTo(X(TAIL + .4), y); g.stroke(); }
    g.setLineDash([]);
    // belly doors (closed), hatch outlines
    g.strokeStyle = 'rgba(40,42,44,.75)'; g.lineWidth = 2.2 * px; for (const ph of [-178, -146, 146, 178]) { g.beginPath(); g.moveTo(X(1.7), Y(ph * D2R)); g.lineTo(X(-2.4), Y(ph * D2R)); g.stroke(); }
    // worn paint: door sill, walk areas on the roof, nose ring, tail wheel bay, random chips at panel joints
    chips(g, r, 70, X(-6.7), Y(60 * D2R), X(-7.7) - X(-6.7), Y(150 * D2R) - Y(60 * D2R), 9 * px); chips(g, r, 90, X(2.6), Y(-28 * D2R), X(-2) - X(2.6), Y(28 * D2R) - Y(-28 * D2R), 8 * px);
    chips(g, r, 50, X(5.78), 0, 26 * px, H, 7 * px); chips(g, r, 700, 0, 0, W, H, 6 * px); chips(g, r, 40, X(-8.4), Y(150 * D2R), X(-9.6) - X(-8.4), H - Y(150 * D2R), 8 * px);
    // oil and soot along the belly
    for (let i = 0; i < 26; i++) { const x = X(-9 + r() * 12), y = r() < .5 ? r() * H * .06 : H - r() * H * .06, gr = g.createRadialGradient(x, y, 0, x, y, (30 + r() * 90) * px); gr.addColorStop(0, 'rgba(34,26,18,.28)'); gr.addColorStop(1, 'rgba(34,26,18,0)'); g.fillStyle = gr; g.fillRect(x - 130 * px, y - 130 * px, 260 * px, 260 * px); }
    // lettering and marks (this story's own: the crew's yellow boomerangs, the plane's invented name; no codes, no nose art)
    for (const side of [1, -1]) {
      for (let i = 0; i < 14; i++) local(g, W, H, sf, 4.95 - (i % 7) * .21, side * (84 + Math.floor(i / 7) * 7.5) * D2R, () => { g.scale(side > 0 ? -.01 : .01, side > 0 ? .01 : -.01); boomerang(g, 5.6, 2.6, C.yellow); });
      if (o.name) local(g, W, H, sf, 4.3, side * 107 * D2R, () => { g.scale(side > 0 ? -.01 : .01, side > 0 ? .01 : -.01); g.font = 'italic bold 21px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,26,16,.85)'; g.fillText(o.name, 1.2, 1.4); g.fillStyle = C.cream; g.fillText(o.name, 0, 0); });
    }
    paintHoles(g, W, H, sf, false);
  })));
  const paintWing = (sd, fc, W0, H0) => shared('w' + sd + fc, () => canvasTex(mk(W0 * Q, H0 * Q, (g, W, H) => { const up = fc === 'u', sf = S['w' + sd + fc], X = y => y / SPAN * W, r = rng(o.seed + (sd === 'L' ? 21 : 31) + (up ? 0 : 5)), px = W / 2048;
    g.fillStyle = up ? C.olive : C.grey; g.fillRect(0, 0, W, H); tints(g, r, 0, 0, W, H, 29, 5, .15);
    for (let i = 0; i < 150; i++) { const x = r() * W, y0 = r() * H * .7, len = (60 + r() * 200) * px, gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, `rgba(30,28,18,${.1 + r() * .2})`); gr.addColorStop(1, 'rgba(30,28,18,0)'); g.fillStyle = gr; g.fillRect(x, y0, (2 + r() * 7) * px, len); }
    g.lineWidth = Math.max(1, 2.2 * px); g.strokeStyle = 'rgba(24,26,14,.85)';
    for (let y = .45; y < 12.9; y += .45) { g.beginPath(); g.moveTo(X(y), 0); g.lineTo(X(y), H); g.stroke(); }
    for (const c of [.12, .38, .62]) { g.beginPath(); g.moveTo(0, c * H); g.lineTo(W, c * H); g.stroke(); }
    g.setLineDash([2.2 * px, 6 * px]); g.strokeStyle = up ? 'rgba(232,235,205,.62)' : 'rgba(255,255,255,.8)'; g.lineWidth = Math.max(1, 2.2 * px);
    for (let y = .45; y < 12.9; y += .45) for (const d of [-4, 4]) { g.beginPath(); g.moveTo(X(y) + d * px, 0); g.lineTo(X(y) + d * px, H); g.stroke(); }
    for (const c of [.12, .38, .62]) for (const d of [-4, 4]) { g.beginPath(); g.moveTo(0, c * H + d * px); g.lineTo(W, c * H + d * px); g.stroke(); }
    g.setLineDash([]);
    // hinge lines: ailerons (outer), flaps (inner, underside), trim tab
    g.strokeStyle = 'rgba(18,18,14,.9)'; g.lineWidth = 3.2 * px; g.beginPath(); g.moveTo(X(8.95), .76 * H); g.lineTo(X(12.35), .76 * H); g.moveTo(X(8.95), .76 * H); g.lineTo(X(8.95), H); g.moveTo(X(12.35), .76 * H); g.lineTo(X(12.35), H); g.stroke();
    if (!up) { g.beginPath(); for (const [a, b] of [[1.25, 3.3], [5.2, 7.45]]) { g.moveTo(X(a), .76 * H); g.lineTo(X(b), .76 * H); } g.stroke(); }
    // black rubber de-icer boots on the leading edge (between the engines and outboard)
    g.fillStyle = '#24252a'; for (const [a, b] of [[1.2, 3.35], [5.15, 7.5], [9.3, 12.6]]) g.fillRect(X(a), 0, X(b) - X(a), .045 * H); g.fillStyle = 'rgba(255,255,255,.10)'; for (const [a, b] of [[1.2, 3.35], [5.15, 7.5], [9.3, 12.6]]) g.fillRect(X(a), .012 * H, X(b) - X(a), .006 * H);
    if (up) { // walk-way by the body: dark grit strip with the paint worn through to bare metal where boots land; fuel filler caps
      g.fillStyle = '#3b3e2c'; g.fillRect(X(1.2), .16 * H, X(2.75) - X(1.2), .68 * H); g.strokeStyle = 'rgba(240,194,50,.75)'; g.lineWidth = 2.5 * px; g.strokeRect(X(1.2), .16 * H, X(2.75) - X(1.2), .68 * H);
      chips(g, r, 150, X(1.3), .2 * H, X(2.65) - X(1.3), .6 * H, 12 * px); chips(g, r, 120, 0, 0, W, .07 * H, 6 * px); chips(g, r, 260, 0, 0, W, H, 6 * px);
      for (const [y, c] of [[3.2, .3], [6.2, .3], [7.0, .36], [10.2, .3]]) local(g, W, H, sf, y, c, () => { g.fillStyle = '#3a3c30'; g.beginPath(); g.arc(0, 0, .085, 0, TAU); g.fill(); g.strokeStyle = C.yellow; g.lineWidth = .016; g.stroke(); g.fillStyle = '#9aa0a4'; g.beginPath(); g.arc(0, 0, .04, 0, TAU); g.fill(); });
      for (const e of ENG_Y) for (let i = 0; i < 16; i++) { const x = X(e + (r() - .5) * 1.1), gr = g.createLinearGradient(0, .2 * H, 0, H); gr.addColorStop(0, `rgba(26,18,10,${.25 + r() * .3})`); gr.addColorStop(1, 'rgba(26,18,10,0.05)'); g.fillStyle = gr; g.fillRect(x, .2 * H, (4 + r() * 12) * px, .8 * H); }
    } else { // underside: inspection panels with screws, long exhaust stains behind each engine, oil runs
      for (const [y, c, w, h] of [[2.2, .3, .5, .32], [3.0, .55, .36, .24], [7.3, .3, .5, .3], [9.6, .45, .42, .28], [11.0, .35, .36, .24], [6.2, .86, .3, .2]]) local(g, W, H, sf, y, c, () => { g.strokeStyle = 'rgba(40,44,48,.85)'; g.lineWidth = .012; g.strokeRect(-w / 2, -h / 2, w, h); g.fillStyle = '#5b6066'; for (const [i, j] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) { g.beginPath(); g.arc(i * (w / 2 - .03), j * (h / 2 - .03), .011, 0, TAU); g.fill(); } });
      for (const e of ENG_Y) { for (let i = 0; i < 26; i++) { const x = X(e + (r() - .5) * 1.5), gr = g.createLinearGradient(0, .12 * H, 0, H); gr.addColorStop(0, `rgba(30,24,20,${.22 + r() * .3})`); gr.addColorStop(1, 'rgba(30,24,20,.04)'); g.fillStyle = gr; g.fillRect(x, .12 * H, (5 + r() * 16) * px, .88 * H); } }
      chips(g, r, 260, 0, 0, W, H, 6 * px);
      if (sd === 'L' && HI) { const y = 6.42, c = wingC(6.42, .38); local(g, W, H, sf, y, c, () => { g.fillStyle = '#d5d8db'; g.fillRect(-.27, -.2, .54, .4); g.globalCompositeOperation = 'destination-out'; g.fillRect(-.25, -.18, .5, .36); g.globalCompositeOperation = 'source-over'; }); }   // the bay the loose panel falls out of
    }
    paintHoles(g, W, H, sf, !up);
  })));
  const paintTail = (key, W0, H0, fin) => shared(key, () => canvasTex(mk(W0 * Q, H0 * Q, (g, W, H) => { const sf = S[key], r = rng(o.seed + key.length * 7 + key.charCodeAt(key.length - 1)), px = W / 1024, low = /l$/.test(key) && !fin;
    g.fillStyle = low ? C.grey : C.olive; g.fillRect(0, 0, W, H); tints(g, r, 0, 0, W, H, 9, 7, .15);
    g.strokeStyle = 'rgba(24,26,14,.85)'; g.lineWidth = Math.max(1, 2.4 * px);
    if (fin) { for (let h = .35; h < HF; h += .42) { const y = (1 - h / HF) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.strokeStyle = 'rgba(18,18,14,.9)'; g.lineWidth = 3.4 * px; g.beginPath(); g.moveTo(.62 * W, 0); g.lineTo(.62 * W, H * .93); g.stroke(); g.strokeRect(.86 * W, .55 * H, .14 * W, .2 * H);
      g.fillStyle = '#24252a'; g.fillRect(0, 0, .035 * W, H * .8);
      local(g, W, H, sf, 2.05, .33, () => { g.fillStyle = C.blue; g.beginPath(); g.arc(0, 0, .56, 0, TAU); g.fill(); g.strokeStyle = C.cream; g.lineWidth = .035; g.stroke(); g.rotate(-.25); boomerang(g, .33, .15, C.yellow); });   // the crew's yellow boomerang on a blue disc
      chips(g, r, 80, 0, 0, .05 * W, H, 6 * px); }
    else { for (let y = .4; y < SSPAN; y += .42) { const x = y / SSPAN * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.strokeStyle = 'rgba(18,18,14,.9)'; g.lineWidth = 3.2 * px; g.beginPath(); g.moveTo(.1 * W, .62 * H); g.lineTo(W, .62 * H); g.stroke(); g.strokeRect(.3 * W, .88 * H, .22 * W, .12 * H); g.fillStyle = '#24252a'; g.fillRect(.14 * W, 0, .8 * W, .045 * H); chips(g, r, 60, 0, 0, W, .08 * H, 6 * px); }
    chips(g, r, 140, 0, 0, W, H, 6 * px); paintHoles(g, W, H, sf, low);
  })));
  // small shadow-only alpha maps: the sun falls THROUGH the holes (spots under the wing, spots inside the body)
  const shadowTex = (keys, W, H) => canvasTex(mk(W, H, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'destination-out'; for (const key of keys) for (const h of holesOf(key)) local(g, W, H, S[key], h.a, h.b, () => { holePath(g, h, h.kind === 'tear' ? 1 : 1.5); g.fill(); }); }));
  const skinMat = (tex, op = {}) => toon('#ffffff', { map: tex, alphaTest: .5, ...op }), innerMat = tex => toon('#a3ab98', { map: tex, alphaTest: .5, side: THREE.BackSide, emissive: '#23271f' });
  const shadowMat = tex => new THREE.MeshBasicMaterial({ map: tex, alphaTest: .5, colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const IN = col => M(col, { emissive: '#' + new THREE.Color(col).multiplyScalar(.3).getHexString() });
  const shadowOnly = (m, name) => { m.userData.noExport = true; m.userData.shadowOnly = true; return add(m, name, 'shadow', { cast: true, recv: false }); };

  // ================= FUSELAGE =================
  const fxs = []; for (let x = 5.75; x > -12.7; x -= HERO ? .25 : HI ? .5 : 1.25) fxs.push(x); fxs.push(-12.7, -12.82, -12.92, -12.98, TAIL);
  const fph = range(-Math.PI, Math.PI, HERO ? 48 : HI ? 32 : 14);
  const fusGeo = gridGeo((x, ph) => fusP(x, ph), fxs, fph, S.fus.px, [-3, 0, 0], true);
  add(new THREE.Mesh(fusGeo, skinMat(texFus)), 'fuselage_skin', 'metal', { mat: 'painted_aluminium', cast: !PUNCH });
  if (PUNCH) {
    add(new THREE.Mesh(fusGeo, innerMat(texFus)), 'fuselage_inner_skin', 'metal', { mat: 'bare_aluminium_dark', cast: false });
    shadowOnly(new THREE.Mesh(gridGeo((x, ph) => fusP(x, ph, -.03), fxs.filter((x, i) => i % 2 === 0 || x < -12.6), fph, S.fus.px), shadowMat(shadowTex(['fus'], 1024, 256))), 'fuselage_shadow_shell');
  }
  // INSIDE THE CABIN (fix round 2, G7; hero only): the skin as it looks from inside. Its own sheet 2 mm inside the outer skin, on its own canvas (4096 x 2048 for 9.5 m of cabin):
  // zinc-chromate primer, two unpainted replacement panels, lap joints, soft shade under every frame and stringer, brush marks, scuffs, stencils that read from inside, a scorched halo and a bare rim round every hole.
  const XC0 = -7.75, XC1 = 1.75, PRIMER = '#868f5c', BARE = '#b9beb4';
  const IN2 = col => M(col, { side: THREE.DoubleSide, emissive: '#' + new THREE.Color(col).multiplyScalar(.34).getHexString() });
  if (HERO) {
    surf('cab', (x, ph) => fusP(x, ph, -.002), x => Math.max(.05, fusR(x)), (x, ph) => [0, Math.sin(ph), Math.cos(ph)], (x, ph) => [(XC1 - x) / (XC1 - XC0), (ph + Math.PI) / TAU]);
    const texCab = canvasTex(mk(4096, 2048, (g, W, H) => { const X = x => (XC1 - x) / (XC1 - XC0) * W, Y = ph => (ph + Math.PI) / TAU * H, r = rng(o.seed + 53), mx = W / (XC1 - XC0), my = H / (TAU * 1.15), sf = S.cab;
      g.fillStyle = '#8a955e'; g.fillRect(0, 0, W, H); tints(g, r, 0, 0, W, H, 38, 48, .11);
      for (const [x0, p0, p1] of [[-5.0, 108, 124], [-3.0, 38, 58], [-6.0, 62, 80], [-2.0, 100, 120], [-4.0, -72, -52], [-5.5, -112, -92], [-1.0, 60, 78]]) { const xa = X(x0), xb = X(x0 - .5), ya = Y(p0 * D2R), yb = Y(p1 * D2R); g.fillStyle = '#a9afa5'; g.fillRect(xa, ya, xb - xa, yb - ya);   // unpainted replacement panels: brushed bare metal
        for (let i = 0; i < 90; i++) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .13})` : `rgba(40,46,40,${r() * .1})`; g.fillRect(xa + r() * (xb - xa), ya, 1 + r() * 2, yb - ya); } g.strokeStyle = 'rgba(30,34,20,.55)'; g.lineWidth = 2; g.strokeRect(xa, ya, xb - xa, yb - ya); }
      for (let i = 0; i < 520; i++) { const x = r() * W, y = r() * H, l = 40 + r() * 220; g.strokeStyle = r() < .5 ? `rgba(150,160,104,${.05 + r() * .09})` : `rgba(64,72,40,${.05 + r() * .1})`; g.lineWidth = 4 + r() * 12; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 30, y + l); g.stroke(); }   // primer brush marks, round the body
      g.lineWidth = 2.2; for (let k = -8; k <= 8; k++) { const y = Y(k * 20 * D2R); g.strokeStyle = 'rgba(28,32,14,.7)'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.strokeStyle = 'rgba(214,222,170,.3)'; g.beginPath(); g.moveTo(0, y + 2.6); g.lineTo(W, y + 2.6); g.stroke(); }   // skin lap joints
      for (let x = -7.5; x <= 1.51; x += .5) { const w = .1 * mx, gr = g.createLinearGradient(X(x) - w, 0, X(x) + w, 0); gr.addColorStop(0, 'rgba(16,20,6,0)'); gr.addColorStop(.5, 'rgba(16,20,6,.5)'); gr.addColorStop(1, 'rgba(16,20,6,0)'); g.fillStyle = gr; g.fillRect(X(x) - w, 0, 2 * w, H); }   // shade under every frame
      for (let k = 0; k < 24; k++) { let a = (k + .5) / 24 * TAU; if (a > Math.PI) a -= TAU; const w = .05 * my, gr = g.createLinearGradient(0, Y(a) - w, 0, Y(a) + w); gr.addColorStop(0, 'rgba(16,20,6,0)'); gr.addColorStop(.5, 'rgba(16,20,6,.42)'); gr.addColorStop(1, 'rgba(16,20,6,0)'); g.fillStyle = gr; g.fillRect(0, Y(a) - w, W, 2 * w); }   // and under every stringer
      for (let i = 0; i < 260; i++) { const x = r() * W, y = Y((60 + r() * 60) * D2R * (r() < .7 ? 1 : -1)); g.strokeStyle = `rgba(190,196,180,${.1 + r() * .25})`; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 90, y + (r() - .5) * 40); g.stroke(); }   // scuffs at hand and shoulder height, down to bare metal
      for (let i = 0; i < 46; i++) { const x = r() * W, y = Y((120 + r() * 45) * D2R * (r() < .5 ? 1 : -1)), gr = g.createRadialGradient(x, y, 0, x, y, 30 + r() * 70); gr.addColorStop(0, 'rgba(30,24,12,.3)'); gr.addColorStop(1, 'rgba(30,24,12,0)'); g.fillStyle = gr; g.fillRect(x - 100, y - 100, 200, 200); }   // oil and boot dirt low on the walls
      // stencils, drawn so they read from INSIDE (port wall: nose to the right)
      const stencil = (x, phD, txt, sz = 5.2, col = 'rgba(24,26,16,.82)') => local(g, W, H, sf, x, phD * D2R, () => { g.scale(phD > 0 ? .01 : -.01, phD > 0 ? .01 : -.01); g.font = `bold ${sz}px "Arial Narrow", Impact, "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(txt, 0, 0); });
      for (let n = 0, x = 1.25; x > -7.5; x -= .5, n++) for (const sd of [1, -1]) { stencil(x, sd * 26, 'FRAME ' + (9 + n), 3.4); stencil(x + .02, sd * 72.5, 'FR ' + (9 + n) + (sd > 0 ? ' L' : ' R'), 3.0); stencil(x - .04, sd * 109, 'SKIN .040  24ST', 2.3, 'rgba(24,26,16,.6)');
        local(g, W, H, sf, x - .03, sd * 94 * D2R, () => { g.strokeStyle = 'rgba(60,40,110,.0)'; g.strokeStyle = 'rgba(30,34,60,.55)'; g.lineWidth = .004; g.beginPath(); g.arc(0, 0, .028, 0, TAU); g.stroke(); g.scale(sd > 0 ? .01 : -.01, sd > 0 ? .01 : -.01); g.font = 'bold 1.9px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,34,60,.6)'; g.fillText('INSP', 0, -.7); g.fillText(String(11 + (n * 7) % 23), 0, 1.2); }); }   // an inspector's ink stamp in every bay
      for (let i = 0; i < 900; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 60, a = r() * 6.3; g.strokeStyle = r() < .6 ? `rgba(206,212,196,${.12 + r() * .3})` : `rgba(30,34,16,${.12 + r() * .25})`; g.lineWidth = .8 + r() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * .4); g.stroke(); }   // scratches and knocks
 stencil(-4.75, 133, 'WALK ON PLANKS ONLY', 4.4); stencil(-2.75, 133, 'WALK ON PLANKS ONLY', 4.4); stencil(-5.25, 44, 'CONTROL CABLES  KEEP CLEAR', 3.6); stencil(-3.25, 44, 'CONTROL CABLES  KEEP CLEAR', 3.6);
      stencil(-4.25, -100, 'FIRST AID', 6, 'rgba(236,232,214,.85)'); stencil(-2.75, -119.5, 'OXYGEN', 6.4, 'rgba(232,206,96,.9)');
      for (const h of holesOf('fus')) local(g, W, H, sf, h.a, h.b, () => { if (h.kind !== 'tear') { const R1 = h.r * (h.kind === 'bullet' ? 2.3 : 2.1), gr = g.createRadialGradient(0, 0, h.r * .6, 0, 0, R1); gr.addColorStop(0, 'rgba(20,16,8,.75)'); gr.addColorStop(1, 'rgba(20,16,8,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R1, 0, TAU); g.fill(); }
        g.fillStyle = '#d9dcd4'; holePath(g, h, h.kind === 'tear' ? 1.08 : 1.26); g.fill(); g.fillStyle = '#8a9086'; holePath(g, h, h.kind === 'tear' ? 1.03 : 1.1); g.fill(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; holePath(g, h, 1); g.fill(); if (h.out) { g.lineWidth = .007; g.lineJoin = 'round'; g.stroke(); } g.globalCompositeOperation = 'source-over'; });
    }));
    add(new THREE.Mesh(gridGeo((x, ph) => fusP(x, ph, -.002), fxs.filter(x => x <= XC1 + .01 && x >= XC0 - .01), fph, S.cab.px, [-3, 0, 0], true), toon('#ffffff', { map: texCab, alphaTest: .5, side: THREE.BackSide, emissive: '#3b4126' })), 'cabin_inner_skin', 'metal', { mat: 'primed_aluminium', cast: false });
    // ROUND 3: THE WALL THE LENS LOOKS AT gets its own finer sheet (about 1 mm per pixel, 4 m of the port wall) 1.2 mm inside the coarser one: riveted skin panels each a shade of its own, primer brush marks,
    // shade under every frame and stringer, dirt runs, chipped primer and scratches down to bare metal, crisp stencils with their bridges, the scorched halo and bright ring of every hole.
    { const DX0 = -6.0, DX1 = -2.0, DP0 = 18 * D2R, DP1 = 162 * D2R;
      surf('cabD', (x, ph) => fusP(x, ph, -.0032), x => Math.max(.05, fusR(x)), (x, ph) => [0, Math.sin(ph), Math.cos(ph)], (x, ph) => [(DX1 - x) / (DX1 - DX0), (ph - DP0) / (DP1 - DP0)]);
      const texD = canvasTex(mk(4096, 3072, (g, W, H) => { const sf = S.cabD, X = x => (DX1 - x) / (DX1 - DX0) * W, Y = ph => (ph - DP0) / (DP1 - DP0) * H, r = rng(o.seed + 59), kx = W / (DX1 - DX0), ky = H / ((DP1 - DP0) * 1.15), mm = v => v * kx;
        g.fillStyle = '#8a955e'; g.fillRect(0, 0, W, H);
        for (let x = DX0; x < DX1 - .01; x += .5) for (let k = 0; k < 9; k++) { const p0 = Math.max(DP0, k * 20 * D2R), p1 = Math.min(DP1, (k + 1) * 20 * D2R); if (p1 <= p0) continue; g.fillStyle = r() < .5 ? `rgba(200,210,140,${.03 + r() * .1})` : `rgba(30,40,18,${.03 + r() * .12})`; g.fillRect(X(x + .5), Y(p0), X(x) - X(x + .5), Y(p1) - Y(p0)); }   // skin panels
        tints(g, r, 0, 0, W, H, 64, 48, .06);
        for (const [x0, p0, p1] of [[-5.0, 108, 124], [-3.0, 38, 58], [-2.0, 100, 120]]) { const xa = X(x0), xb = X(x0 - .5), ya = Y(p0 * D2R), yb = Y(p1 * D2R); g.fillStyle = '#a9afa5'; g.fillRect(xa, ya, xb - xa, yb - ya);   // unpainted replacement panels: brushed bare metal
          for (let i = 0; i < 420; i++) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .13})` : `rgba(40,46,40,${r() * .11})`; g.fillRect(xa + r() * (xb - xa), ya, 1 + r() * 2, yb - ya); } g.strokeStyle = 'rgba(214,196,96,.5)'; g.lineWidth = mm(.006); g.strokeRect(xa, ya, xb - xa, yb - ya); g.strokeStyle = 'rgba(30,34,20,.6)'; g.lineWidth = mm(.0018); g.strokeRect(xa, ya, xb - xa, yb - ya); }
        for (let i = 0; i < 1500; i++) { const x = r() * W, y = r() * H, l = mm(.05 + r() * .3); g.strokeStyle = r() < .5 ? `rgba(160,172,110,${.04 + r() * .08})` : `rgba(58,68,36,${.04 + r() * .09})`; g.lineWidth = mm(.004 + r() * .012); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * mm(.03), y + l); g.stroke(); }   // primer brush marks, round the body
        for (let x = DX0; x <= DX1 + .01; x += .5) { const w = mm(.13), gr = g.createLinearGradient(X(x) - w, 0, X(x) + w, 0); gr.addColorStop(0, 'rgba(14,18,6,0)'); gr.addColorStop(.5, 'rgba(14,18,6,.46)'); gr.addColorStop(1, 'rgba(14,18,6,0)'); g.fillStyle = gr; g.fillRect(X(x) - w, 0, 2 * w, H); }   // shade under every frame
        for (let k = 0; k < 12; k++) { const a = (k + .5) / 24 * TAU; if (a < DP0 || a > DP1) continue; const w = .062 * ky, gr = g.createLinearGradient(0, Y(a) - w, 0, Y(a) + w); gr.addColorStop(0, 'rgba(14,18,6,0)'); gr.addColorStop(.5, 'rgba(14,18,6,.4)'); gr.addColorStop(1, 'rgba(14,18,6,0)'); g.fillStyle = gr; g.fillRect(0, Y(a) - w, W, 2 * w); }   // and under every stringer
        for (let k = 1; k <= 8; k++) { const y = Y(k * 20 * D2R); g.lineWidth = mm(.0026); g.strokeStyle = 'rgba(24,28,12,.8)'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.lineWidth = mm(.0016); g.strokeStyle = 'rgba(216,224,170,.38)'; g.beginPath(); g.moveTo(0, y + mm(.003)); g.lineTo(W, y + mm(.003)); g.stroke(); }   // skin lap joints
        for (let i = 0; i < 900; i++) { const x = r() * W, y0 = r() * H, len = mm(.04 + r() * .3) * (.4 + y0 / H), gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, `rgba(26,22,10,${.06 + r() * .17})`); gr.addColorStop(1, 'rgba(26,22,10,0)'); g.fillStyle = gr; g.fillRect(x, y0, mm(.003 + r() * .018), len); }   // dirt runs down the wall
        for (let i = 0; i < 60; i++) { const x = r() * W, y = Y((122 + r() * 40) * D2R), R0 = mm(.05 + r() * .12), gr = g.createRadialGradient(x, y, 0, x, y, R0); gr.addColorStop(0, 'rgba(30,24,12,.34)'); gr.addColorStop(1, 'rgba(30,24,12,0)'); g.fillStyle = gr; g.fillRect(x - R0, y - R0, 2 * R0, 2 * R0); }   // oil and boot dirt low on the wall
        for (let i = 0; i < 520; i++) { const x = r() * W, y = Y((58 + r() * 62) * D2R); g.strokeStyle = `rgba(194,200,184,${.1 + r() * .28})`; g.lineWidth = mm(.001 + r() * .0025); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * mm(.11), y + (r() - .5) * mm(.05)); g.stroke(); }   // scuffs at hand and shoulder height
        for (let i = 0; i < 1700; i++) { const nearFrame = r() < .55, x = nearFrame ? X(DX0 + Math.round(r() * 8) * .5 + (r() - .5) * .13) : r() * W, y = r() * H, s = mm(.003 + r() * .009); g.fillStyle = 'rgba(30,34,18,.55)'; g.beginPath(); for (let k = 0; k < 5; k++) g.lineTo(x + (r() - .5) * s * 2.2, y + (r() - .5) * s * 1.6 + mm(.0012)); g.fill(); g.fillStyle = r() < .75 ? 'rgba(198,204,192,.9)' : 'rgba(150,158,146,.85)'; g.beginPath(); for (let k = 0; k < 5; k++) g.lineTo(x + (r() - .5) * s * 2, y + (r() - .5) * s * 1.4); g.fill(); }   // chipped primer, most of it where the frames are fitted
        for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H, l = mm(.008 + r() * .1), a = r() * 6.3; g.strokeStyle = r() < .6 ? `rgba(208,214,198,${.12 + r() * .32})` : `rgba(26,30,14,${.12 + r() * .28})`; g.lineWidth = mm(.0007 + r() * .0013); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * .45); g.stroke(); }   // scratches and knocks
        // stencils that read from inside (port wall: nose to the right), with the bridges a cut stencil leaves
        const stencil = (x, phD, txt, sz, col = 'rgba(20,22,13,.88)') => local(g, W, H, sf, x, phD * D2R, () => { g.scale(.01, .01); g.font = `bold ${sz}px "Arial Narrow", Impact, "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(txt, 0, 0); const w = g.measureText(txt).width; g.fillStyle = 'rgba(138,149,94,.92)'; for (let bx = -w / 2 + sz * .3; bx < w / 2; bx += sz * .58) g.fillRect(bx, -sz * .62, sz * .055, sz * 1.24); });
        for (let n = 0, x = 1.25; x > -7.5; x -= .5, n++) { if (x > DX1 - .1 || x < DX0 + .1) continue; stencil(x, 26, 'FRAME ' + (9 + n), 3.4); stencil(x + .02, 72.5, 'FR ' + (9 + n) + ' L', 3.0); stencil(x - .04, 109, 'SKIN .040  24ST', 2.3, 'rgba(20,22,13,.66)');
          local(g, W, H, sf, x - .03, 94 * D2R, () => { g.strokeStyle = 'rgba(30,34,70,.62)'; g.lineWidth = .003; g.beginPath(); g.arc(0, 0, .028, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, .0235, 0, TAU); g.lineWidth = .0012; g.stroke(); g.scale(.01, .01); g.font = 'bold 1.9px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,34,70,.68)'; g.fillText('INSP', 0, -.7); g.fillText(String(11 + (n * 7) % 23), 0, 1.2); }); }   // an inspector's ink stamp in every bay
        stencil(-4.75, 133, 'WALK ON PLANKS ONLY', 4.4); stencil(-2.75, 133, 'WALK ON PLANKS ONLY', 4.4); stencil(-5.25, 44, 'CONTROL CABLES  KEEP CLEAR', 3.6); stencil(-3.25, 44, 'CONTROL CABLES  KEEP CLEAR', 3.6);
        for (const h of holesOf('fus')) { if (h.b < 0 || h.a < DX0 - .5 || h.a > DX1 + .5) continue; local(g, W, H, sf, h.a, h.b, () => { if (h.kind !== 'tear') { const R1 = h.r * (h.kind === 'bullet' ? 2.5 : 2.2) + .02, gr = g.createRadialGradient(0, 0, h.r * .6, 0, 0, R1); gr.addColorStop(0, 'rgba(18,14,7,.8)'); gr.addColorStop(.55, 'rgba(18,14,7,.3)'); gr.addColorStop(1, 'rgba(18,14,7,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R1, 0, TAU); g.fill();
            for (let k = 0; k < 9; k++) { const a = r() * TAU, l0 = h.r * 1.05, l1 = h.r * (1.5 + r() * 1.3) + .01; g.strokeStyle = `rgba(206,212,200,${.25 + r() * .4})`; g.lineWidth = .0008 + r() * .0014; g.beginPath(); g.moveTo(Math.cos(a) * l0, Math.sin(a) * l0); g.lineTo(Math.cos(a + (r() - .5) * .2) * l1, Math.sin(a + (r() - .5) * .2) * l1); g.stroke(); } }   // splinter scratches thrown out from the hit
          g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; holePath(g, h, 1); g.fill(); g.lineWidth = .007; g.lineJoin = 'round'; g.stroke(); g.globalCompositeOperation = 'source-over'; }); }
      }));
      const m = add(new THREE.Mesh(gridGeo((x, ph) => fusP(x, ph, -.0032), fxs.filter(x => x <= DX1 + .01 && x >= DX0 - .01), range(DP0, DP1, 36), S.cabD.px, [-3, 0, 0]), toon('#ffffff', { map: texD, alphaTest: .5, side: THREE.BackSide, emissive: '#3b4126' })), 'cabin_wall_detail_skin', 'metal', { mat: 'primed_aluminium', cast: false }); m.frustumCulled = false; }
  }
  // glazed nose with frames
  const nxs = [5.75, 6.0, 6.25, 6.5, 6.7, 6.85, 6.95, 7.01, NOSE];
  add(new THREE.Mesh(gridGeo((x, ph) => fusP(x, ph), nxs, range(-Math.PI, Math.PI, HI ? 32 : 12), null, [5, 0, 0], true), GLASS), 'nose_glazing', 'glass', { mat: 'glass', cast: false });
  box('nose_bulkhead', 'metal', [.04, 1.7, 1.7], [5.72, 0, fusZ(5.72)], C.inner, { cast: false });
  lathe('nose_ring_frame', 'metal', [[-.04, fusR(5.75) + .012], [.04, fusR(5.75) + .014], [.04, fusR(5.75) - .02], [-.04, fusR(5.75) - .02]], [5.75, 0, fusZ(5.75)], [1, 0, 0], C.oliveD);
  if (HI) { for (const x of [6.3, 6.75]) tube('nose_frame_ring', 'metal', range(0, TAU, 24).slice(0, 24).map(ph => fusP(x, ph, .008)), .016, C.oliveD, { closed: true, seg: 48, cast: false });
    for (let k = 0; k < 8; k++) tube('nose_frame_bar', 'metal', [5.75, 6.1, 6.45, 6.75, 6.95, 7.04].map(x => fusP(x, k / 8 * TAU + .39, .008)), .015, C.oliveD, { cast: false });
    sph('nose_cap', 'metal', .07, [NOSE - .03, 0, fusZ(NOSE)], C.oliveD); box('bombardier_seat', 'cloth', [.3, .4, .5], [5.95, 0, fusZ(5.95) - .45], C.leather, { cast: false, mat: 'leather' }); }
  // cockpit: glazed canopy with frames, metal fairing behind, seats and the coaming seen through the glass
  const cph = range(-CANW, CANW, HI ? 16 : 6);
  add(new THREE.Mesh(gridGeo((x, ph) => canP(x, ph), range(3.9, 5.45, HI ? 12 : 4), cph, null, [4.5, 0, 0]), GLASS), 'cockpit_glazing', 'glass', { mat: 'glass', cast: false });
  add(new THREE.Mesh(gridGeo((x, ph) => canP(x, ph, .004), range(2.7, 3.9, HI ? 8 : 3), cph, null, [3.3, 0, 0]), M(C.olive)), 'cockpit_fairing', 'metal', { mat: 'painted_aluminium' });
  for (const x of [5.42, 4.8, 4.35, 3.9]) tube('canopy_frame_hoop', 'metal', range(-CANW, CANW, 12).map(ph => canP(x, ph, .012)), HI ? .022 : .03, C.oliveD, { cast: false });
  for (const a of HI ? [-62, -42, -21, 0, 21, 42, 62] : [-62, 0, 62]) tube('canopy_frame_bar', 'metal', range(3.9, 5.42, 8).map(x => canP(x, a * D2R, .012)), HI ? .02 : .03, C.oliveD, { cast: false });
  if (HI) { for (const s of [-1, 1]) { box('pilot_seat_back', 'cloth', [.1, .44, .62], [4.25, s * .42, 1.02], C.leather, { cast: false, mat: 'leather' }); box('pilot_seat_headrest', 'cloth', [.08, .26, .16], [4.24, s * .42, 1.42], '#4f3323', { cast: false, mat: 'leather' }); cyl('control_column', 'metal', [4.75, s * .42, .7], [4.7, s * .42, 1.15], .02, C.black, { cast: false }); tube('control_yoke', 'metal', [[4.7, s * .42 - .12, 1.2], [4.7, s * .42 - .1, 1.1], [4.7, s * .42 + .1, 1.1], [4.7, s * .42 + .12, 1.2]], .016, C.black, { cast: false }); }
    box('instrument_coaming', 'metal', [.3, 1.3, .12], [5.0, 0, 1.04], C.black, { cast: false }); }
  // top turret blister: a plain glass dome on a ring, no guns
  sph('turret_blister', 'glass', .5, [1.6, 0, 1.12], 0, { m: GLASS, tl: Math.PI / 2, s: [1, 1, .82], cast: false, mat: 'glass' });
  lathe('turret_ring', 'metal', [[0, .53], [.07, .53], [.07, .47], [0, .47]], [1.6, 0, 1.09], [0, 0, 1], C.oliveD);
  if (HI) { for (const a of [0, Math.PI / 2]) tube('turret_frame', 'metal', range(0, Math.PI, 10).map(t => [1.6 + Math.cos(t) * Math.cos(a) * .505, Math.cos(t) * Math.sin(a) * .505, 1.13 + Math.sin(t) * .41]), .014, C.oliveD, { cast: false });
    box('turret_seat', 'cloth', [.2, .2, .12], [1.6, 0, 1.2], C.leather, { cast: false, mat: 'leather' }); }
  // surface patch on the body skin (hatches, doors, windows): a curved piece standing a few mm proud
  const fusPatch = (name, role, x0, x1, p0, p1, off, col, op = {}) => add(new THREE.Mesh(gridGeo((x, ph) => fusP(x, ph, off), range(x0, x1, op.nx ?? 4), range(p0 * D2R, p1 * D2R, op.np ?? 6), op.uv || null, [(x0 + x1) / 2, 0, fusZ(x0)]), op.m || M(col)), name, role, { cast: false, ...op });
  const fusFrame = (name, x0, x1, p0, p1, r, col) => tube(name, 'metal', [...range(p0, p1, 5).map(p => fusP(x0, p * D2R, .012)), ...range(p1, p0, 5).map(p => fusP(x1, p * D2R, .012))], r, col, { closed: true, tension: .05, seg: 60, cast: false });
  let bottleAt = null; const rivets = [], rivetsIn = [];                                                                 // rivetsIn (fix round 2, G7): the rivet tails seen from INSIDE the body, round domes                                                                               // { p: airframe point, n, r, c }
  const rv = (sf, a, b, r, c) => { for (const h of holesOf(sf.key)) if (Math.hypot(h.a - a, (h.b - b) * sf.mb(a, b)) < h.r * 1.5) return; rivets.push({ p: sf.off(a, b, .001), n: sf.N(a, b), r, c }); };
  if (HI) {
    // crew door (left, behind the wing): proud panel, frame, two hinges on pivots, lever handle, round window, fold-down step
    fusPatch('crew_door', 'metal', -7.6, -6.8, 68, 142, .012, '#6a7040', { mat: 'painted_aluminium' }); fusFrame('crew_door_frame', -7.62, -6.78, 67, 143, .014, C.oliveD);
    for (const p of [82, 128]) cyl('crew_door_hinge', 'metal', fusP(-6.76, (p - 4) * D2R, .02), fusP(-6.76, (p + 4) * D2R, .02), .018, C.aluD, { cast: false, mat: 'steel' });
    cyl('crew_door_handle_boss', 'metal', fusP(-7.45, 104 * D2R, .0), fusP(-7.45, 104 * D2R, .04), .022, C.aluD, { cast: false }); beam('crew_door_handle', 'metal', fusP(-7.45, 104 * D2R, .04), fusP(-7.33, 106 * D2R, .04), .02, .012, C.alu, { m: shiny(C.alu, 70), cast: false, mat: 'steel' });
    fusPatch('crew_door_window', 'glass', -7.3, -7.08, 84, 95, .016, 0, { m: GLASS, mat: 'glass' }); fusFrame('crew_door_window_frame', -7.31, -7.07, 83.5, 95.5, .009, C.oliveD);
    beam('crew_door_step', 'metal', fusP(-7.5, 146 * D2R, .02), fusP(-6.9, 146 * D2R, .02), .1, .015, C.aluD, { side: [0, 1, .4], mat: 'steel' }); for (const x of [-7.48, -6.92]) cyl('crew_door_step_stay', 'metal', fusP(x, 146 * D2R, .1), fusP(x, 141 * D2R, .0), .008, C.aluD, { cast: false });
    // waist windows, portholes, access hatches with corner fasteners
    for (const s of [1, -1]) { fusPatch('waist_window', 'glass', -6.1, -5.4, s * 66, s * 94, .008, 0, { m: GLASS, mat: 'glass' }); fusFrame('waist_window_frame', -6.12, -5.38, s * 65, s * 95, .016, C.oliveD); beam('waist_window_bar', 'metal', fusP(-5.75, s * 66 * D2R, .012), fusP(-5.75, s * 94 * D2R, .012), .02, .012, C.oliveD, { cast: false });
      for (const x of [1.2, -1.6]) { const c = fusP(x, s * 62 * D2R, .006), n = S.fus.N(x, s * 62 * D2R); lathe('porthole_frame', 'metal', [[0, .15], [.012, .15], [.012, .115], [0, .115]], c, n, C.oliveD, { seg: 20, cast: false }); const d = new THREE.Mesh(new THREE.CircleGeometry(.118, 20), GLASS); d.position.copy(V([c[0] + n[0] * .004, c[1] + n[1] * .004, c[2] + n[2] * .004])); d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), V(n)); add(d, 'porthole_glass', 'glass', { cast: false, mat: 'glass' }); } }
    for (const [x0, x1, p0, p1] of [[4.2, 4.6, 128, 150], [0.2, .75, 34, 52], [-2.2, -1.75, -52, -36], [-9.4, -9.0, 100, 122], [-10.6, -10.25, -118, -100], [3.0, 3.4, -150, -130]]) { fusPatch('access_hatch', 'metal', x0, x1, p0, p1, .006, Math.abs((p0 + p1) / 2) > 118 ? C.greyD : '#69703f'); for (const x of [x0 + .04, x1 - .04]) for (const p of [p0 + 2, p1 - 2]) rivets.push({ p: fusP(x, p * D2R, .009), n: S.fus.N(x, p * D2R), r: .011, c: '#3d4030' }); }
    // pitot tube on its mast, aerial mast and wire with insulators and lead-in, belly antenna blades, D/F loop fairing, tail cone window
    cyl('pitot_mast', 'metal', fusP(6.0, 155 * D2R, -.02), [6.02, .5, fusZ(6) - 1.13], .014, C.aluD, { r2: .022, mat: 'steel' }); cyl('pitot_tube', 'metal', [5.96, .5, fusZ(6) - 1.13], [6.42, .5, fusZ(6) - 1.13], .011, C.alu, { m: shiny(C.alu, 80), mat: 'polished_aluminium' }); cyl('pitot_tip', 'metal', [6.42, .5, fusZ(6) - 1.13], [6.5, .5, fusZ(6) - 1.13], .006, C.brass, { m: shiny(C.brass, 80), mat: 'brass' });
    const mastTop = [2.25, 0, 1.92], finTop = finP(0, HF - .5, .02); cyl('aerial_mast', 'wood', [2.3, 0, 1.1], mastTop, .028, C.wood, { r2: .016, mat: 'wood_varnished' });
    const wire = range(0, 1, 10).map(t => [lerp(mastTop[0], finTop[0], t), 0, lerp(mastTop[2], finTop[2], t) - Math.sin(t * Math.PI) * .12]); tube('aerial_wire', 'metal', wire, .006, '#3a3a3a', { rs: 4, seg: 24, cast: false, mat: 'steel_wire' });
    for (const t of [1, 9]) cyl('aerial_insulator', 'glass', wire[t], [wire[t][0] - .07, 0, wire[t][2] + (t === 1 ? .012 : .028)], .016, '#e8e2d2', { cast: false, mat: 'porcelain' }); tube('aerial_lead_in', 'metal', [wire[4], [-2.6, .25, 1.5], fusP(-2.9, 20 * D2R, 0)], .005, '#3a3a3a', { rs: 4, cast: false, mat: 'steel_wire' });
    for (const x of [2.6, -6.4]) beam('belly_antenna', 'metal', fusP(x, 180 * D2R, -.02), [x - .12, 0, fusZ(x) - fusR(x) - .42], .09, .014, C.oliveD, { side: [1, 0, 0] });
    sph('df_loop_fairing', 'metal', .2, [4.9, 0, fusZ(4.9) - fusR(4.9) - .1], C.oliveD, { s: [2.1, .55, .8] });
    fusPatch('tail_cone_window', 'glass', -12.86, -12.55, -40, 40, .006, 0, { m: GLASS, mat: 'glass' });
    for (const s of [1, -1]) fusPatch('cockpit_side_step', 'metal', 4.6, 4.9, s * 124, s * 132, .01, C.aluD);
    // rivets as real parts on the camera side (left body), frames and longerons
    for (let x = -8; x < 5.6; x += .5) { const R = fusR(x); for (let a = 24 * D2R; a < 166 * D2R; a += .075 / R) for (const d of [-.025, .025]) rv(S.fus, x + d, a, .0095, Math.abs(a) > 118 * D2R ? C.greyL : C.oliveL); }
    for (const a of [40, 60, 80, 100, 120, 140]) for (let x = -7.95; x < 5.6; x += .085) rv(S.fus, x, a * D2R + .022, .009, a > 118 ? C.greyL : C.oliveL);
  }
  // ---- inside the body (hero): frames, stringers, floor, bulkheads, oxygen bottles, cables. The camera stands in here for line 4.
  if (HERO) {
    // FRAMES (fix round 2, G7): real Z-section rings, not round bands: a foot flange riveted to the skin, a web with flanged lightening holes between the stringers, an inner flange with a lip; primer, the inner edge worn to bare metal
    const lhs = [];
    const fusH = holesOf('fus').filter(h => h.kind !== 'tear'), frameGaps = new Map(), strCuts = new Map(), spanF = (h, d0) => { const q = h.out || h.poly; let lo = 1e9, hi = -1e9; for (const e of [-.036, -.018, 0, .014, .028]) { const d = d0 + e; for (let i = 0; i < q.length; i++) { const P = q[i], Q = q[(i + 1) % q.length]; if ((P[0] - d) * (Q[0] - d) <= 0 && P[0] !== Q[0]) { const v = P[1] + (Q[1] - P[1]) * (d - P[0]) / (Q[0] - P[0]); lo = Math.min(lo, v); hi = Math.max(hi, v); } } } return hi >= lo ? [lo, hi] : null; };
    const qf = rng(o.seed + 131), FM = { foot: toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true, emissive: '#3a4024' }), web: toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true, emissive: '#444b2a' }), bead: toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true, emissive: '#4c5236' }) };
    const FC = { foot: ['#646e45', '#59633d'].map(c => new THREE.Color(c)), web: ['#525d33', '#7d8a50', '#a1ae70'].map(c => new THREE.Color(c)), bead: Array.from({ length: 12 }, (_, i) => new THREE.Color('#66723f').lerp(new THREE.Color('#d8dfb6'), Math.pow(.5 - .5 * Math.sin((129 - i * 30) * D2R), 1.4))) };
    for (let x = -7.5; x <= 1.51; x += .5) { const R = fusR(x) - .008, c0 = [x, 0, fusZ(x)];
      // ROUND 3: the ring is one unbroken rib with a rolled round bead on its inner edge; it is cut only where a hit really crossed it (found on the hole's own outline: the hole his finger comes through sits on a frame line)
      const gaps = [], arcs = []; let a0 = -Math.PI; for (const h of fusH) { if (Math.abs(h.a - x) > .6) continue; const c = spanF(h, x - h.a); if (c) gaps.push([h.b + (c[0] - .022) / fusR(x), h.b + (c[1] + .022) / fusR(x)]); } gaps.sort((p, q) => p[0] - q[0]);
      frameGaps.set(Math.round(x * 2), arcs);
      for (const [g0, g1] of gaps) { if (g0 > a0 + .16) arcs.push([a0, g0]); a0 = Math.max(a0, g1); } if (a0 < Math.PI - .16) arcs.push([a0, Math.PI]);   // no stub shorter than about 18 cm is left standing between two holes
      const bead = Array.from({ length: 12 }, (_, i) => { const an = (129 - i * 30) * D2R; return [.012 + .0155 * Math.cos(an), R - .096 + .0155 * Math.sin(an)]; });
      for (const [pa, pb] of arcs) { const op = { p0: 1.5 * Math.PI - pb, pl: pb - pa, seg: Math.max(4, Math.round((pb - pa) / TAU * 72)), cast: false }, cutA = pb < Math.PI - .01, cutB = pa > -Math.PI + .01, bendS = [qf() < .5 ? -1 : 1, qf() < .5 ? -1 : 1];   // lathe angle = 270 degrees - body angle (the lathe's first row is the arc's pb end)
        // shading baked into the rib (dark where it meets the skin, a light line along the rolled bead), and a cut end that is bent out of line by the hit instead of sawn square
        const dress = (me, cols) => { const g = me.geometry, ps = g.attributes.position, np = cols.length, rows = ps.count / np, col = new Float32Array(ps.count * 3); for (let i = 0; i < rows; i++) for (let j = 0; j < np; j++) { const c = cols[j]; col.set([c.r, c.g, c.b], (i * np + j) * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
          for (const [on, i0, i1, sg] of [[cutA, 0, 1, bendS[0]], [cutB, rows - 1, rows - 2, bendS[1]]]) { if (!on) continue; for (const [i, w] of [[i0, 1], [i1, .3]]) for (let j = 0; j < np; j++) { const n = i * np + j; ps.setXYZ(n, ps.getX(n) * (1 - .022 * w), ps.getY(n) + sg * .04 * w, ps.getZ(n) * (1 - .022 * w)); } } ps.needsUpdate = true; g.computeVertexNormals(); return me; };
        dress(lathe('body_frame_foot', 'metal', [[-.036, R], [0, R]], c0, [1, 0, 0], PRIMER, { ...op, m: FM.foot, mat: 'primed_aluminium' }), FC.foot);
        dress(lathe('body_frame_ring', 'metal', [[0, R], [0, R - .03], [0, R - .084]], c0, [1, 0, 0], PRIMER, { ...op, m: FM.web, mat: 'primed_aluminium' }), FC.web);
        dress(lathe('body_frame_bead', 'metal', bead, c0, [1, 0, 0], BARE, { ...op, m: FM.bead, mat: 'bare_aluminium' }), FC.bead); }
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, ph = a > Math.PI ? a - TAU : a; if (Math.cos(a) < -.6 || gaps.some(([g0, g1]) => ph > g0 - .03 && ph < g1 + .03)) continue; lhs.push([x, (R - .043) * Math.sin(a), fusZ(x) + (R - .043) * Math.cos(a)]); } }
    { const dark = new THREE.InstancedMesh(new THREE.CircleGeometry(.021, 14), new THREE.MeshBasicMaterial({ color: '#191c14', side: THREE.DoubleSide }), lhs.length * 2), lip = new THREE.InstancedMesh(new THREE.TorusGeometry(.0228, .0046, 4, 12), IN2('#c3c8be'), lhs.length), d = new THREE.Object3D(); d.rotation.y = Math.PI / 2;
      lhs.forEach((q, i) => { for (const [j, e] of [[0, .0012], [1, -.0012]]) { d.position.copy(V([q[0] + e, q[1], q[2]])); d.updateMatrix(); dark.setMatrixAt(i * 2 + j, d.matrix); } d.position.copy(V(q)); d.updateMatrix(); lip.setMatrixAt(i, d.matrix); });
      dark.frustumCulled = lip.frustumCulled = false; add(dark, 'frame_lightening_hole', 'metal', { cast: false, mat: 'opening' }); add(lip, 'frame_lightening_hole_flange', 'metal', { cast: false, mat: 'bare_aluminium' }); }
    // STRINGERS (ROUND 3): rolled HAT sections with a rounded crown, smooth-shaded, running unbroken through the frames; a stringer is cut only where a hit really crossed it (found on the hole's own outline)
    const cross = (h, axis, d) => { const q = h.out || h.poly, ot = 1 - axis; let lo = 1e9, hi = -1e9; for (let i = 0; i < q.length; i++) { const P = q[i], Q = q[(i + 1) % q.length]; if ((P[axis] - d) * (Q[axis] - d) <= 0 && P[axis] !== Q[axis]) { const v = P[ot] + (Q[ot] - P[ot]) * (d - P[axis]) / (Q[axis] - P[axis]); lo = Math.min(lo, v); hi = Math.max(hi, v); } } return hi >= lo ? [lo, hi] : null; };
    const span = (h, axis, d0, offs) => { let lo = 1e9, hi = -1e9; for (const e of offs) { const c = cross(h, axis, d0 + e); if (c) { lo = Math.min(lo, c[0]); hi = Math.max(hi, c[1]); } } return hi >= lo ? [lo, hi] : null; };
    { const SEC = [[-.024, .0035], [-.0135, .0045], [-.011, .017], [-.0065, .0265], [0, .0302], [.0065, .0265], [.011, .017], [.0135, .0045], [.024, .0035]], accS = { p: [], i: [], c: [] }, accC = { p: [], i: [], c: [] }, qs = rng(o.seed + 113);
      const SHADE = ['#75824f', '#95a268', '#aab878', '#c4cc9e', '#d2d8b2', '#a2ae74', '#7a8750', '#616d3e', '#566238'].map(c => new THREE.Color(c));   // the round crown is baked in: light from above on the upper flank, shade on the lower one, so it reads as a rolled section in any light
      const pg = (acc, rows, cols) => { const base = acc.p.length / 3, nr = rows.length, nc = rows[0].length; for (const row of rows) row.forEach((v, j) => { acc.p.push(v.x, v.y, v.z); const c = cols[j]; acc.c.push(c.r, c.g, c.b); }); for (let a = 0; a < nr - 1; a++) for (let b = 0; b < nc - 1; b++) { const i0 = base + a * nc + b, i1 = i0 + 1, i2 = i0 + nc, i3 = i2 + 1; acc.i.push(i0, i2, i1, i1, i2, i3); } };
      for (let k = 0; k < 24; k++) { const a = (k + .5) / 24 * TAU, ph = a > Math.PI ? a - TAU : a; if (Math.abs(Math.cos(a) + .62) < .1) continue;
        const cuts = [], runs = [], cols = a > Math.PI ? SHADE.slice().reverse() : SHADE; let x0 = -7.6; for (const h of fusH) { if (h.a < -7.9 || h.a > 1.8) continue; const c = span(h, 1, (ph - h.b) * fusR(h.a), [-.024, -.012, 0, .012, .024]); if (c) cuts.push([h.a + c[0] - .02, h.a + c[1] + .02]); } cuts.sort((p, q) => p[0] - q[0]);
        strCuts.set(k, runs);
        for (const [c0, c1] of cuts) { if (c0 > x0 + .2) runs.push([x0, c0]); x0 = Math.max(x0, c1); } if (x0 < 1.3) runs.push([x0, 1.5]);
        for (const [xa, xb] of runs) { const tornA = xa > -7.59, tornB = xb < 1.49, sxs = range(xa + (tornA ? .07 : 0), xb - (tornB ? .07 : 0), Math.max(1, Math.ceil((xb - xa) / .25))); if (tornA) sxs.unshift(xa, xa + .03); if (tornB) sxs.push(xb - .03, xb);
          // a cut end is not sawn off: the last 7 cm is wrenched off the skin, crushed and twisted by the hit
          const lA = tornA ? [.016 + qs() * .03, (qs() - .5) * .05] : [0, 0], lB = tornB ? [.016 + qs() * .03, (qs() - .5) * .05] : [0, 0];
          const bent = x => { const dA = tornA ? Math.max(0, 1 - (x - xa) / .07) : 0, dB = tornB ? Math.max(0, 1 - (xb - x) / .07) : 0, w = dA > dB ? dA : dB, l = dA > dB ? lA : lB; return [l[0] * w * w, l[1] * w * w, 1 - .4 * w * w]; };
          pg(accS, sxs.map(x => { const [lift, tw, sq] = bent(x); return SEC.map(([d, hh]) => V(fusP(x, a + (d * (1 - (1 - sq) * .5) + tw * (hh / .03)) / fusR(x), -(hh * sq + lift)))); }), cols);
          pg(accC, sxs.map(x => { const [lift, tw, sq] = bent(x); return [-.0042, .0042].map(d => V(fusP(x, a + (d + tw) / fusR(x), -(.0309 * sq + lift)))); }), [cols[4], cols[4]]); } }
      const fin = (acc, m, name, mat) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(acc.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(acc.c, 3)); g.setIndex(acc.i); g.computeVertexNormals(); const me = add(new THREE.Mesh(g, m), name, 'metal', { cast: false, mat }); me.frustumCulled = false; };
      fin(accS, toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true, emissive: '#464d2c' }), 'body_stringer', 'primed_aluminium'); fin(accC, toon('#ffffff', { side: THREE.DoubleSide, vertexColors: true, emissive: '#4e5338' }), 'body_stringer_crown', 'bare_aluminium'); }
    // WALKWAY (G7): seven planks with grain along them, knots, dark seams, boot scuffs down the middle, two nail heads at every floor beam
    const plankTex = mk(2048, 128, (g, W, H) => { const r = rng(o.seed + 71); g.fillStyle = '#86683f'; g.fillRect(0, 0, W, H); for (let i = 0; i < 280; i++) { g.strokeStyle = r() < .5 ? `rgba(52,34,16,${.1 + r() * .25})` : `rgba(214,180,128,${.06 + r() * .14})`; g.lineWidth = 1 + r() * 2.5; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + (r() - .5) * 10, W * .7, y + (r() - .5) * 10, W, y + (r() - .5) * 6); g.stroke(); }
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(48,30,14,.55)'; g.beginPath(); g.ellipse(r() * W, r() * H, 10 + r() * 14, 4 + r() * 5, 0, 0, TAU); g.fill(); }
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(20,12,4,.5)'); gr.addColorStop(.1, 'rgba(20,12,4,0)'); gr.addColorStop(.9, 'rgba(20,12,4,0)'); gr.addColorStop(1, 'rgba(20,12,4,.5)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(226,206,168,${.05 + r() * .13})`; g.fillRect(r() * W, H * .2 + r() * H * .6, 30 + r() * 120, 2 + r() * 5); } });
    for (let k = -3; k <= 3; k++) { const t = canvasTex(plankTex); t.wrapS = THREE.RepeatWrapping; t.offset.x = (k + 3) * .137; const top = toon(k % 2 ? '#ffffff' : '#e9dcc8', { map: t, emissive: '#241a0e' }), sd = IN(k % 2 ? '#8a6a45' : '#7c5d3c'); box('cabin_floor_plank', 'wood', [9.0, .155, .03], [-3.0, k * .165, -.66 + (k % 2 ? .0 : .004)], 0, { m: [sd, sd, top, sd, sd, sd], mat: 'wood_plank', cast: false }); }
    { const nails = []; for (let x = -7.4; x < 1.5; x += .75) for (let k = -3; k <= 3; k++) for (const e of [-.045, .045]) nails.push([x, k * .165 + e, -.644 + (k % 2 ? 0 : .004)]); const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0065, .0065, .003, 7), M('#3a3630'), nails.length), d = new THREE.Object3D(); nails.forEach((q, i) => { d.position.copy(V(q)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.frustumCulled = false; add(im, 'cabin_floor_nail', 'metal', { cast: false, mat: 'steel' }); }
    for (let x = -7.4; x < 1.5; x += .75) box('cabin_floor_beam', 'metal', [.05, 1.9, .08], [x, 0, -.72], '#6d7566', { cast: false });
    for (const x of [-7.62, 1.52]) { const m = new THREE.Mesh(new THREE.RingGeometry(.52, fusR(x) - .02, 32), M('#6d7566', { side: THREE.DoubleSide })); m.position.copy(V([x, 0, fusZ(x)])); m.rotation.y = Math.PI / 2; m.scale.set(1, 1, 1); add(m, 'cabin_bulkhead', 'metal', { cast: false, mat: 'bare_aluminium' }); const d = new THREE.Mesh(new THREE.CircleGeometry(.52, 24), M('#1d1f1c', { side: THREE.DoubleSide })); d.position.copy(V([x + (x < 0 ? -.3 : .3), 0, fusZ(x)])); d.rotation.y = Math.PI / 2; add(d, 'cabin_doorway_dark', 'metal', { cast: false }); }
    // on the wall the lens looks at: rivet rows on both flanges of every frame, a cable loom in brass clips, a stowed hand lamp
    // the outside keeps its look: the old inside rivets were tall enough to show as rows of dots on the OUTER skin beside these frames; the same rows stay there as small outside heads (never seen from inside)
    for (let x = -6; x <= -2.4; x += .5) { const R = fusR(x); for (let a2 = 18 * D2R; a2 < 162 * D2R; a2 += .07 / R) for (const d of [-.07, .07]) { if (holesOf('fus').some(h => Math.hypot(h.a - (x + d), (h.b - a2) * R) < h.r * 1.5)) continue; const n = S.fus.N(x + d, a2); rivets.push({ p: fusP(x + d, a2, .0004), n, r: .0052, c: '#b9c1b4' }); } }
    { const fh = holesOf('fus'), holeNear = (x, a2, R) => fh.some(h => Math.hypot(h.a - x, (h.b - a2) * R) < h.r * 1.4 + .014);   // G7: round rivet tails (not diamonds): one row on every frame's foot flange and one on every stringer's foot, port wall
      for (let x = -6.5; x <= -1.4; x += .5) { const R = fusR(x); const arcs = frameGaps.get(Math.round(x * 2)) || []; for (let a2 = 9 * D2R; a2 < 171 * D2R; a2 += .045 / R) { if (holeNear(x - .017, a2, R) || !arcs.some(([pa, pb]) => a2 > pa + .01 && a2 < pb - .01)) continue; const n = S.fus.N(x - .017, a2); rivetsIn.push({ p: fusP(x - .017, a2, -.0048), n: [-n[0], -n[1], -n[2]], r: .0062, c: '#a9b18c' }); } }
      for (let j = 1; j <= 8; j++) for (const e of [-.011, .011]) for (let x = -6.2; x <= -2.2; x += .03) { const R = fusR(x), a2 = j * 20 * D2R + e / R; if (holeNear(x, a2, R)) continue; const n = S.fus.N(x, a2); rivetsIn.push({ p: fusP(x, a2, -.0034), n: [-n[0], -n[1], -n[2]], r: .0036, c: '#98a07c' }); }   // the lap joints: two close rows of small tails
      for (let k = 0; k < 12; k++) { const a = (k + .5) / 24 * TAU; if (Math.abs(Math.cos(a) + .62) < .1) continue; const runs = strCuts.get(k) || []; for (let x = -6.72; x <= -1.3; x += .05) { for (const e of [-.0185, .0185]) { const R = fusR(x), a2 = a + e / R; if (holeNear(x, a2, R) || !runs.some(([xa, xb]) => x > xa + .01 && x < xb - .01)) continue; const n = S.fus.N(x, a2); rivetsIn.push({ p: fusP(x, a2, -.0052), n: [-n[0], -n[1], -n[2]], r: .0048, c: '#a4ac86' }); } } } }
    // ON THE PORT WALL IN THE LENS (G7): two control cables through fairlead blocks on every frame; the oxygen bottle in two strap bands on cradles, with its valve, handwheel, gauge and copper line
    for (const aD of [50, 54.6]) tube('port_control_cable', 'metal', range(-7.5, 1.4, 18).map(x => fusP(x, aD * D2R, -.118)), .0042, '#c2c6c8', { m: shiny('#c2c6c8', 70), rs: 5, seg: 72, cast: false, mat: 'steel_wire' });
    for (let x = -7.0; x <= 1.01; x += .5) { beam('cable_fairlead_bracket', 'metal', fusP(x + .02, 52.3 * D2R, -.08), fusP(x + .02, 52.3 * D2R, -.142), .13, .005, BARE, { m: IN2('#b3b9ae'), cast: false, mat: 'bare_aluminium', side: [0, Math.cos(52.3 * D2R), -Math.sin(52.3 * D2R)] });
      for (const aD of [50, 54.6]) cyl('cable_fairlead_block', 'wood', fusP(x + .008, aD * D2R, -.118), fusP(x + .034, aD * D2R, -.118), .013, '#7a4f2a', { m: IN2('#7a4f2a'), seg: 8, cast: false, mat: 'phenolic' }); }
    { const best = BOT;   // a patch with no hole behind it, as near the lens's bay as there is one (and clear of the hand lamp)
      bottleAt = fusP(best.xx + .38, best.aD * D2R, -.205);
      const BA = best.aD * D2R, off = -.205, x0 = best.xx, x1 = best.xx + .76, rb = .086, bcol = '#b3a23e', bm = shiny(bcol, 34, '#f4e7b0'), P = x => fusP(x, BA, off), steel = shiny('#9aa1a6', 70), brass = shiny(C.brass, 90);
      cyl('port_oxygen_bottle', 'metal', P(x0), P(x1), rb, bcol, { m: bm, seg: 22, cast: false, mat: 'painted_steel' }); for (const x of [x0, x1]) sph('port_oxygen_bottle_end', 'metal', rb, P(x), bcol, { m: bm, seg: 18, seg2: 12, s: [.62, 1, 1], cast: false });
      for (const x of [x0 + .16, x1 - .16]) { const m = new THREE.Mesh(new THREE.TorusGeometry(rb + .003, .0065, 5, 26), steel); m.position.copy(V(P(x))); m.rotation.y = Math.PI / 2; m.scale.z = 2.4; add(m, 'oxygen_strap_band', 'metal', { cast: false, mat: 'steel' });
        beam('oxygen_cradle', 'metal', fusP(x, BA, -.036), fusP(x, BA, off + rb + .002), .07, .006, BARE, { m: IN2('#b3b9ae'), cast: false, mat: 'bare_aluminium', side: [1, 0, 0] }); box('oxygen_strap_buckle', 'metal', [.034, .03, .03], fusP(x, BA - .12, off - rb - .002), C.brass, { m: brass, cast: false, mat: 'brass' }); }
      { const lt = canvasTex(mk(128, 512, (g, W, H) => { g.clearRect(0, 0, W, H); g.translate(W / 2, H / 2); g.rotate(-Math.PI / 2); g.font = 'bold 74px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(28,26,18,.88)'; g.fillText('OXYGEN', 0, 4); })), lm = new THREE.Mesh(new THREE.CylinderGeometry(rb + .0012, rb + .0012, .42, 20, 1, true, -.6, 1.2), toon('#ffffff', { map: lt, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
        lm.position.copy(V(P((x0 + x1) / 2))); lm.quaternion.setFromUnitVectors(UP, V([1, 0, 0])); const zc = new THREE.Vector3(0, 0, 1).applyQuaternion(lm.quaternion), want = V([0, -Math.sin(BA), -Math.cos(BA)]).normalize(), ax = V([1, 0, 0]); lm.rotateY(Math.atan2(zc.clone().cross(want).dot(ax), zc.dot(want))); lm.userData.text = 'OXYGEN'; add(lm, 'port_oxygen_bottle_stencil', 'metal', { cast: false, mat: 'paint_stencil' }); }
      cyl('oxygen_neck', 'metal', P(x1 + .05), P(x1 + .1), .022, C.brass, { m: brass, cast: false, mat: 'brass' }); { const q = P(x1 + .125); box('oxygen_valve_body', 'metal', [.05, .04, .04], q, C.brass, { m: brass, cast: false, mat: 'brass' });
        const hw = new THREE.Mesh(new THREE.TorusGeometry(.03, .006, 6, 16), shiny('#3a3f44', 50)); hw.position.copy(V([q[0], q[1] - .045, q[2] + .0])); add(hw, 'oxygen_handwheel', 'metal', { cast: false, mat: 'painted_steel' }); cyl('oxygen_valve_stem', 'metal', q, [q[0], q[1] - .045, q[2]], .006, C.brass, { m: brass, seg: 6, cast: false });
        cyl('oxygen_gauge', 'metal', [q[0], q[1], q[2] + .02], [q[0], q[1] - .012, q[2] + .062], .03, C.brass, { m: brass, seg: 16, cast: false, mat: 'brass' }); const gq = [q[0], q[1] - .0135, q[2] + .0665], fc = new THREE.Mesh(new THREE.CircleGeometry(.025, 16), new THREE.MeshBasicMaterial({ color: '#efe9d6', side: THREE.DoubleSide })); fc.position.copy(V(gq)); fc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), V([0, -.012, .042]).normalize()); add(fc, 'oxygen_gauge_face', 'glass', { cast: false, mat: 'paper_dial' });
        cyl('oxygen_gauge_needle', 'metal', [gq[0] - .002, gq[1] - .0015, gq[2] + .0005], [gq[0] + .016, gq[1] - .0035, gq[2] + .007], .0015, '#1a1a1a', { seg: 4, cast: false });
        tube('oxygen_copper_line', 'metal', [[q[0] + .03, q[1], q[2]], [q[0] + .07, q[1] + .03, q[2] + .02], ...range(BA / D2R - 6, 97, 6).map(aD => fusP(x1 + .2, aD * D2R, -.1)), fusP(x1 + .36, 96 * D2R, -.06), fusP(x1 + 1.0, 96 * D2R, -.05), fusP(x1 + 1.9, 96 * D2R, -.05)], .0055, '#b06a3a', { m: shiny('#b06a3a', 80, '#ffd9b0'), rs: 6, seg: 64, cast: false, mat: 'copper' }); for (const aD of [BA / D2R - 9, 108, 99]) { const c = fusP(x1 + .2, aD * D2R, -.1), m = new THREE.Mesh(new THREE.TorusGeometry(.0085, .0028, 4, 10), steel); m.position.copy(V(c)); add(m, 'oxygen_line_clip', 'metal', { cast: false, mat: 'steel' }); } } }
    tube('cabin_cable_loom', 'cloth', range(-7.5, 1.4, 9).map(x => fusP(x, 36 * D2R, -.06)), .02, '#2f2a26', { cast: false, mat: 'cloth_tape' }); for (let x = -7.25; x < 1.4; x += .5) { const m = new THREE.Mesh(new THREE.TorusGeometry(.026, .007, 5, 12), shiny(C.brass, 80)); m.position.copy(V(fusP(x, 36 * D2R, -.06))); m.rotation.y = Math.PI / 2; add(m, 'cable_clip', 'metal', { cast: false, mat: 'brass' }); }
    { const q = fusP(-4.72, 118 * D2R, -.1); cyl('hand_lamp_body', 'metal', [q[0], q[1], q[2] - .1], [q[0], q[1], q[2] + .08], .035, C.brass, { m: shiny(C.brass, 90), cast: false, mat: 'brass' }); sph('hand_lamp_head', 'metal', .05, [q[0], q[1], q[2] + .1], C.brass, { m: shiny(C.brass, 90), cast: false, mat: 'brass' }); beam('hand_lamp_clip', 'metal', [q[0] - .06, q[1] + .04, q[2]], [q[0] + .06, q[1] + .04, q[2]], .03, .006, C.aluD, { cast: false }); }
    // ROUND 3, ON THE PORT WALL: OLD FAITHFUL has come home holed before: four riveted repair plates over older holes (bare brushed metal, sealant squeezed out at the edge, the Chief's patch number stencilled on),
    // and two hydraulic lines in P-clips on every frame, with their colour bands
    { const qd = rng(o.seed + 151), bays = []; for (let x = -5.25; x <= -2.7; x += .5) for (const aD of [45, 60, 75, 90, 105, 135]) bays.push([qd(), x, aD]); bays.sort((p, q) => p[0] - q[0]); let n = 0; const used = [];
      for (const [, x, aD] of bays) { if (n >= 4) break; const w = .2 + qd() * .05, hg = .12 + qd() * .03; if (!fusH.every(h => Math.abs(h.a - x) > w / 2 + .05 + h.r * 1.5 || Math.abs(h.b - aD * D2R) * 1.15 > hg / 2 + .05 + h.r * 1.5)) continue;
        if (aD > 100 && aD < 132 && x > BOT.xx - .3 && x < BOT.xx + 1.3) continue; if (used.some(u => Math.abs(u[0] - x) < .6 && Math.abs(u[1] - aD) < 20)) continue; used.push([x, aD]);
        const dp = hg / fusR(x) / 2, x0 = x - w / 2, x1 = x + w / 2, p0 = aD * D2R - dp, p1 = aD * D2R + dp, num = [3, 7, 9, 12][n], sd = o.seed + 160 + n; n++;
        const tex = canvasTex(mk(384, 240, (g, W, H) => { const r = rng(sd); g.fillStyle = '#b3b8ac'; g.fillRect(0, 0, W, H); for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .16})` : `rgba(40,46,40,${r() * .13})`; g.fillRect(0, r() * H, W, 1 + r() * 2); }
          g.fillStyle = 'rgba(214,196,96,.6)'; for (let i = 0; i < 46; i++) { const e = Math.floor(r() * 4); g.fillRect(e < 2 ? r() * W : e === 2 ? 0 : W - 7, e === 0 ? 0 : e === 1 ? H - 7 : r() * H, e < 2 ? 8 + r() * 34 : 7, e < 2 ? 7 : 8 + r() * 30); }   // sealant squeezed out at the edge
          g.strokeStyle = 'rgba(40,46,34,.7)'; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4); g.fillStyle = 'rgba(20,22,13,.86)'; g.font = 'bold 78px "Arial Narrow", Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PATCH ' + num, W / 2, H / 2 + 4, W - 60);
          g.fillStyle = 'rgba(179,184,172,.9)'; for (let bx = 70; bx < W - 40; bx += 46) g.fillRect(bx, H * .2, 4, H * .6); }));
        const pm = add(new THREE.Mesh(gridGeo((xx, ph) => fusP(xx, ph, -.0078), range(x0, x1, 3), range(p0, p1, 4), (xx, ph) => [(xx - x0) / (x1 - x0), (ph - p0) / (p1 - p0)], [-3, 0, 0]), toon('#ffffff', { map: tex, side: THREE.BackSide, emissive: '#3c3e38' })), 'repair_patch_plate', 'metal', { cast: false, mat: 'bare_aluminium' }); pm.userData.text = 'PATCH ' + num;
        const rvt = (xx, pe) => { const nn = S.fus.N(xx, pe); rivetsIn.push({ p: fusP(xx, pe, -.0082), n: [-nn[0], -nn[1], -nn[2]], r: .0046, c: '#c9cdbf' }); };
        for (let i = 0; i <= 7; i++) for (const pe of [p0 + .011, p1 - .011]) rvt(x0 + .014 + (w - .028) * i / 7, pe); for (let i = 1; i <= 3; i++) for (const xx of [x0 + .014, x1 - .014]) rvt(xx, p0 + (p1 - p0) * i / 4); }
      const lines = [[108.5, '#b9bcc0', '#2f5fb8'], [110.6, '#b9bcc0', '#d9b02c']];
      for (const [aD, col, band] of lines) { tube('port_hydraulic_line', 'metal', range(-7.5, 1.4, 18).map(x => fusP(x, aD * D2R, -.128)), .0055, col, { m: shiny(col, 80), rs: 6, seg: 72, cast: false, mat: 'polished_aluminium' });
        for (let x = -7.2; x < 1.3; x += 1.0) for (const dx of [0, .03]) cyl('hydraulic_line_band', 'cloth', fusP(x + dx, aD * D2R, -.128), fusP(x + dx + .018, aD * D2R, -.128), .0062, band, { seg: 8, cast: false, mat: 'paint_band' }); }
      for (let x = -7.0; x <= 1.01; x += .5) { beam('hydraulic_clip_bracket', 'metal', fusP(x + .02, 109.5 * D2R, -.1), fusP(x + .02, 109.5 * D2R, -.14), .075, .004, BARE, { m: IN2('#a9af9c'), cast: false, mat: 'bare_aluminium', side: [0, Math.cos(109.5 * D2R), -Math.sin(109.5 * D2R)] });
        for (const [aD] of lines) { const m = new THREE.Mesh(new THREE.TorusGeometry(.0085, .0028, 5, 10), shiny('#8d949a', 70)); m.position.copy(V(fusP(x + .02, aD * D2R, -.128))); m.rotation.y = Math.PI / 2; add(m, 'hydraulic_p_clip', 'metal', { cast: false, mat: 'steel' }); } } }
    box('wing_spar_box', 'metal', [2.6, 2.0, .62], [-.25, 0, -.42], '#727a6a', { cast: false, mat: 'bare_aluminium' });
    for (let i = 0; i < 3; i++) { const x = -2.2 - i * .34; cyl('oxygen_bottle', 'metal', [x, -.98, .1], [x, -.98, .62], .11, C.yellow, { cast: false, mat: 'painted_steel' }); sph('oxygen_bottle_cap', 'metal', .11, [x, -.98, .62], C.yellow, { cast: false }); cyl('oxygen_valve', 'metal', [x, -.98, .72], [x, -.98, .8], .025, C.brass, { m: shiny(C.brass, 70), cast: false, mat: 'brass' }); }
    beam('oxygen_strap', 'cloth', [-1.95, -.86, .42], [-3.15, -.86, .42], .05, .01, C.leather, { cast: false, mat: 'leather', side: [0, 0, 1] });
    tube('cabin_conduit', 'metal', range(-7.5, 1.4, 8).map(x => fusP(x, 12 * D2R, -.1)), .022, '#3c3f3a', { cast: false }); for (const a of [-14, -20]) tube('control_cable', 'metal', range(-7.5, 1.4, 6).map(x => fusP(x, a * D2R, -.12)), .006, '#b9bcc0', { rs: 4, cast: false, mat: 'steel_wire' });
    box('first_aid_box', 'metal', [.3, .1, .22], [-5.7, -.93, .25], '#d9d2ba', { cast: false }); cyl('cabin_extinguisher', 'metal', [-6.4, -.9, -.1], [-6.4, -.9, .32], .06, C.brass, { m: shiny(C.brass, 60), cast: false, mat: 'brass' });
    box('crew_bench', 'wood', [1.2, .3, .04], [-5.2, -.78, -.28], '#8a6a45', { cast: false, mat: 'plywood' }); for (const x of [-5.7, -4.7]) cyl('crew_bench_leg', 'metal', [x, -.7, -.64], [x, -.7, -.28], .015, '#6d7566', { cast: false });
  }

  // ================= WINGS =================
  const wys = HERO ? [.9, ...range(1.35, 12.15, 24), 12.4, 12.6, 12.75, 12.87, 12.95, 12.99, SPAN] : HI ? [.9, 1.5, 2.4, 3.3, 4.24, 5.2, 6.3, 7.4, 8.41, 9.4, 10.4, 11.4, 12.2, 12.5, 12.75, 12.92, SPAN] : [.9, 4.24, 8.41, 12.2, 12.8, SPAN];
  const wcs = cosr(HERO ? 17 : HI ? 12 : 6);
  const wingTex = {};
  for (const [sd, s] of [['L', 1], ['R', -1]]) {
    for (const [fc, f] of [['u', 1], ['l', -1]]) { const key = 'w' + sd + fc, tex = wingTex[key] = paintWing(sd, fc, sd === 'L' ? 4096 : 2048, sd === 'L' ? 1024 : 512), geo = gridGeo((y, c) => wingP(s, f, y, c), wys, wcs, S[key].px, [0, s * 6, -f * 30]);
      add(new THREE.Mesh(geo, skinMat(tex)), `wing_${sd}_${fc === 'u' ? 'upper' : 'lower'}_skin`, 'metal', { mat: 'painted_aluminium', cast: !PUNCH }); if (PUNCH) add(new THREE.Mesh(geo, innerMat(tex)), `wing_${sd}_${fc === 'u' ? 'upper' : 'lower'}_inner`, 'metal', { mat: 'bare_aluminium_dark', cast: false }); }
    if (PUNCH) shadowOnly(new THREE.Mesh(gridGeo((y, c) => { const p = wingP(s, 0, y, c); return p; }, wys.filter((y, i) => i % 2 === 0 || y > 12), [0, .5, 1], S['w' + sd + 'l'].px), shadowMat(shadowTex(['w' + sd + 'l'], 1024, 256))), `wing_${sd}_shadow_sheet`);
    if (HERO) { // ribs and spars: what you see when you look INTO a hole
      for (const c of [.14, .6]) add(new THREE.Mesh(gridGeo((y, t) => { const a = wingP(s, -1, y, c), b = wingP(s, 1, y, c); return [a[0], a[1], lerp(a[2], b[2], t)]; }, range(1.0, 12.6, 14), [.03, .97], null), M('#6f775f', { side: THREE.DoubleSide })), 'wing_spar', 'metal', { cast: false, mat: 'bare_aluminium' });
      for (let y = 1.45; y < 12.5; y += .9) add(new THREE.Mesh(gridGeo((c, t) => { const a = wingP(s, -1, y, c), b = wingP(s, 1, y, c); return [a[0], a[1], lerp(a[2], b[2], t)]; }, range(.04, .96, 10), [.04, .96], null), M('#646c56', { side: THREE.DoubleSide })), 'wing_rib', 'metal', { cast: false, mat: 'bare_aluminium' });
    }
    if (HI) {
      // split flaps drooped on their hinges, each with jack rods; aileron hinge fairings, trim tab with its rod; tip light; landing light
      const hinged = (name, y0, y1, c0, c1, f, deg, col, ny = 4) => { const A = V(wingP(s, f, y0, c0)), B = V(wingP(s, f, y1, c0)), ax = B.clone().sub(A).normalize(); return add(new THREE.Mesh(gridGeo((y, t) => { const h = V(wingP(s, f, y, c0)), e = V(wingP(s, f, y, c1)).sub(h).applyAxisAngle(ax, deg * D2R * s).multiplyScalar(t).add(h); return [e.x, -e.z, e.y]; }, range(y0, y1, ny), [0, .5, 1], null), M(col, { side: THREE.DoubleSide })), name, 'metal', { mat: 'painted_aluminium' }); };
      for (const [y0, y1] of [[1.3, 3.3], [5.2, 7.45]]) { hinged('split_flap', y0, y1, .76, .985, -1, -13, C.greyD);
        for (const y of [y0 + .25, (y0 + y1) / 2, y1 - .25]) { const a = wingP(s, -1, y, .7), h = V(wingP(s, -1, y, .76)), e = V(wingP(s, -1, y, .9)), ax = new THREE.Vector3(0, 0, -s); const b = e.sub(h).applyAxisAngle(ax, -13 * D2R * s).add(h); cyl('flap_jack', 'metal', [a[0], a[1], a[2] + .02], [b.x, -b.z, b.y + .01], .012, C.alu, { m: shiny(C.alu, 80), cast: false, mat: 'chrome' }); cyl('flap_hinge', 'metal', wingP(s, -1, y - .06, .76), wingP(s, -1, y + .06, .76), .018, C.aluD, { cast: false, mat: 'steel' }); } }
      for (const y of [9.3, 10.65, 12.0]) { const a = wingP(s, -1, y, .7), b = wingP(s, -1, y, .86); sph('aileron_hinge_fairing', 'metal', .05, [(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2 - .02], C.greyD, { s: [3.4, .7, .9], cast: false }); }
      hinged('aileron_trim_tab', 9.5, 10.4, .93, 1.0, 1, 9, C.oliveD, 2); { const a = wingP(s, 1, 9.95, .86), b = wingP(s, 1, 9.95, .955); cyl('trim_tab_rod', 'metal', [a[0], a[1], a[2] + .012], [b[0], b[1], b[2] + .035], .006, C.alu, { cast: false, mat: 'steel' }); }
      sph('wing_tip_light', 'glass', .05, wingP(s, 0, 12.93, .35), 0, { m: GLASS, s: [1.6, .6, .7], cast: false, mat: 'glass' });
      { const a = wingP(s, 0, 9.55, 0), b = wingP(s, 0, 10.05, 0); const m = sph('landing_light_glass', 'glass', .13, [(a[0] + b[0]) / 2 - .05, (a[1] + b[1]) / 2, a[2]], 0, { m: GLASS, s: [.7, 1.7, .8], cast: false, mat: 'glass' }); sph('landing_light_reflector', 'metal', .09, [(a[0] + b[0]) / 2 - .09, (a[1] + b[1]) / 2, a[2]], C.alu, { m: shiny('#e8eaec', 120), s: [.5, 1.5, .8], cast: false, mat: 'chrome' }); }
      box('wing_root_fairing', 'metal', [4.4, .16, .34], [-.2, s * 1.13, wZ(1.1) + .02], s > 0 ? C.olive : C.olive, { cast: false });
    }
  }
  if (HERO) { // rivets as real parts under the near wing: every rib, three spars
    const sf = S.wLl; for (let y = 1.35; y < 12.3; y += .45) { if (ENG_Y.some(e => Math.abs(y - e) < .72)) continue; const ch = wCh(y); for (let c = .06; c < .97; c += .075 / ch) for (const d of [-.022, .022]) rv(sf, y + d, c, .0095, C.greyL); }
    for (const c of [.12, .38, .62]) for (let y = 1.3; y < 12.4; y += .08) { if (ENG_Y.some(e => Math.abs(y - e) < .72)) continue; rv(sf, y, c + .006, .009, C.greyL); } }

  // ================= TAIL =================
  const fhs = HI ? [0, .2, .4, .6, .8, ...range(1.1, 3.4, HERO ? 10 : 5), 3.55, 3.68, 3.78, 3.83, HF] : [0, .4, .8, 2, 3.4, 3.75, HF], tcs = cosr(HI ? 12 : 6);
  const texFin = { L: paintTail('finL', 1024, 1024, true), R: paintTail('finR', 1024, 1024, true) }, TEAR = o.damage === 'tail';
  for (const [sd, s] of [['L', 1], ['R', -1]]) { const geo = gridGeo((h, c) => finP(s, h, c), fhs, tcs, S['fin' + sd].px, [-11, -s * 30, 2]);
    add(new THREE.Mesh(geo, skinMat(texFin[sd])), `fin_${sd}_skin`, 'metal', { mat: 'painted_aluminium', cast: !(PUNCH || TEAR) }); if (PUNCH || TEAR) add(new THREE.Mesh(geo, innerMat(texFin[sd])), `fin_${sd}_inner`, 'metal', { cast: false, mat: 'bare_aluminium_dark' }); }
  if (PUNCH || TEAR) shadowOnly(new THREE.Mesh(gridGeo((h, c) => finP(0, h, c), fhs, [0, .5, 1], S.finL.px), shadowMat(shadowTex(['finL'], 256, 256))), 'fin_shadow_sheet');
  const sys = HI ? [.3, .8, 1.4, 2.0, 2.6, 3.2, 3.7, 4.0, 4.15, 4.27, 4.35, 4.39, SSPAN] : [.3, 2, 3.9, 4.3, SSPAN];
  for (const [sd, s] of [['L', 1], ['R', -1]]) { for (const [fc, f] of [['u', 1], ['l', -1]]) { const key = 's' + sd + fc, tex = paintTail(key, 1024, 512, false), geo = gridGeo((y, c) => stabP(s, f, y, c), sys, tcs, S[key].px, [-11, s * 2, -f * 30]);
      add(new THREE.Mesh(geo, skinMat(tex)), `tailplane_${sd}_${fc === 'u' ? 'upper' : 'lower'}_skin`, 'metal', { mat: 'painted_aluminium', cast: !(PUNCH || TEAR) }); if (PUNCH || TEAR) add(new THREE.Mesh(geo, innerMat(tex)), `tailplane_${sd}_${fc === 'u' ? 'upper' : 'lower'}_inner`, 'metal', { cast: false }); }
    if (PUNCH || TEAR) shadowOnly(new THREE.Mesh(gridGeo((y, c) => stabP(s, 0, y, c), sys, [0, .5, 1], S['s' + sd + 'l'].px), shadowMat(shadowTex(['s' + sd + 'l'], 256, 128))), `tailplane_${sd}_shadow_sheet`); }
  const ribbons = [];
  if (HI) { // rudder and elevator trim tabs on hinges with rods; fin and tailplane skeleton behind the skin (seen through holes and tears)
    for (const s of [1, -1]) { const a = stabP(s, 1, 1.9, .86), b = stabP(s, 1, 1.9, .96); cyl('elevator_tab_rod', 'metal', [a[0], a[1], a[2] + .01], [b[0], b[1], b[2] + .03], .006, C.alu, { cast: false, mat: 'steel' }); for (const y of [1.0, 2.4, 3.6]) cyl('elevator_hinge', 'metal', stabP(s, 1, y - .06, .62), stabP(s, 1, y + .06, .62), .016, C.aluD, { cast: false, mat: 'steel' }); }
    for (const h of [.9, 1.9, 2.9]) for (const s of [1, -1]) { const p = finP(s, h, .62); cyl('rudder_hinge', 'metal', [p[0], p[1] * 1.05, p[2] - .06], [p[0], p[1] * 1.05, p[2] + .06], .016, C.aluD, { cast: false, mat: 'steel' }); }
    { const a = finP(1, 1.55, .8), b = finP(1, 1.55, .93); cyl('rudder_tab_rod', 'metal', [a[0], a[1] + .012, a[2]], [b[0], b[1] + .03, b[2]], .006, C.alu, { cast: false, mat: 'steel' }); }
    cyl('fin_spar', 'metal', finP(0, .1, .5), finP(0, HF - .2, .3), .03, '#6f775f', { cast: false, mat: 'bare_aluminium' }); cyl('rudder_post', 'metal', finP(0, .1, .62), finP(0, HF - .25, .62), .028, '#6f775f', { cast: false, mat: 'bare_aluminium' });
    for (let h = .4; h < HF - .2; h += .42) beam('fin_rib', 'metal', finP(0, h, .05), finP(0, h, .97), .012, .028, '#646c56', { cast: false, side: [0, 0, 1], mat: 'bare_aluminium' });
    for (const s of [1, -1]) { cyl('tailplane_spar', 'metal', stabP(s, 0, .2, .3), stabP(s, 0, 4.1, .3), .028, '#6f775f', { cast: false }); for (let y = .6; y < 4.1; y += .5) beam('tailplane_rib', 'metal', stabP(s, 0, y, .05), stabP(s, 0, y, .97), .028, .012, '#646c56', { cast: false, side: [0, 0, 1] }); }
    sph('tail_light', 'glass', .04, [TAIL - .01, 0, fusZ(TAIL)], 0, { m: GLASS, cast: false, mat: 'glass' });
    if (TEAR) { const rr = rng(o.seed + 77); for (const h of holes.filter(h => h.kind === 'tear')) { const sf = S[h.surf]; for (let k = 0; k < h.poly.length; k += 2) { if (rr() < .35) continue; const q = h.poly[k], [a, b] = sf.loc(h.a, h.b, q[0], q[1]), p0 = V(sf.off(a, sf.clampB(b), .004)), L = .25 + rr() * .5, w = .05 + rr() * .07, segs = 5, pos = new Float32Array((segs + 1) * 6), idx = [];
          for (let i = 0; i <= segs; i++) { pos.set([p0.x - i / segs * L, p0.y - (i / segs) ** 2 * L * .5, p0.z - w / 2], i * 6); pos.set([p0.x - i / segs * L, p0.y - (i / segs) ** 2 * L * .5 - w * .2, p0.z + w / 2], i * 6 + 3); if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = add(new THREE.Mesh(g, M(rr() < .5 ? C.olive : C.alu, { side: THREE.DoubleSide })), 'tail_skin_ribbon', 'metal', { cast: false, mat: 'painted_aluminium' }); ribbons.push({ m, base: pos.slice(), L, w, ph: rr() * TAU, segs }); } } }
  }

  // ================= ENGINES (four radials; in 'heavy' the cowls are the ONE clean thing on the plane) =================
  const texNac = HI ? shared('nac', () => canvasTex(mk(1024 * Q, 512 * Q, (g, W, H) => { const r = rng(o.seed + 5), px = W / 1024; g.fillStyle = C.olive; g.fillRect(0, 0, W, H); g.fillStyle = C.grey; g.fillRect(0, 0, W, H * .17); g.fillRect(0, H * .83, W, H * .17); tints(g, r, 0, 0, W, H, 8, 8, .08);
    g.strokeStyle = 'rgba(28,30,18,.6)'; g.lineWidth = 1.6 * px; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i / 8 * W, 0); g.lineTo(i / 8 * W, H); g.stroke(); } for (let j = 1; j < 6; j++) { g.beginPath(); g.moveTo(0, j / 6 * H); g.lineTo(W, j / 6 * H); g.stroke(); }
    if (o.damage !== 'none' || o.hero) for (let i = 0; i < 46; i++) { const y = r() * H, gr = g.createLinearGradient(W * .05, 0, W, 0); gr.addColorStop(0, `rgba(26,18,10,${.2 + r() * .35})`); gr.addColorStop(1, 'rgba(26,18,10,.03)'); g.fillStyle = gr; g.fillRect(W * .05, y, W, (3 + r() * 12) * px); }   // oil streaks running aft
    for (const y of [.3, .7]) { const gr = g.createLinearGradient(W * .04, 0, W * .9, 0); gr.addColorStop(0, 'rgba(14,12,12,.75)'); gr.addColorStop(1, 'rgba(14,12,12,0)'); g.fillStyle = gr; g.fillRect(W * .04, y * H - 26 * px, W, 52 * px); }                                        // exhaust staining
  }))) : null;
  const props = [], engines = [], REST = { '-8.41': 2.2, '-4.24': 1.3, '4.24': 0, '8.41': .5 };
  const bladeGeo = (r0, r1) => { const st = 10, pos = [], idx = [], chordAt = u => u < .45 ? lerp(.11, .27, sm(u / .45)) : lerp(.27, .12, ((u - .45) / .55) ** 2);
    for (let i = 0; i <= st; i++) { const rr = lerp(r0, r1, i / st), u = rr / 1.75, ch = chordAt(u) * (rr > 1.72 ? .6 : 1), th = lerp(.055, .012, u), be = lerp(64, 18, Math.pow(u, .7)) * D2R, dx = Math.sin(be), dz = Math.cos(be), tx = Math.cos(be), tz = -Math.sin(be);
      pos.push(dx * ch * .5, rr, dz * ch * .5, tx * th * .5 + dx * ch * .1, rr, tz * th * .5 + dz * ch * .1, -dx * ch * .5, rr, -dz * ch * .5, -tx * th * .5 + dx * ch * .1, rr, -tz * th * .5 + dz * ch * .1); if (i < st) for (let j = 0; j < 4; j++) { const a = i * 4 + j, b = i * 4 + (j + 1) % 4; idx.push(a, b, a + 4, b, b + 4, a + 4); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const gBlade = bladeGeo(.12, 1.63), gTip = bladeGeo(1.63, 1.75);
  for (const ye of [-8.41, -4.24, 4.24, 8.41]) {
    const so = Math.sign(ye), ax = [0, ye, ZE], dir = [1, 0, 0];
    // nacelle body, firewall gap, cowl in three pieces (rear, POLISHED BAND, nose lip + duct), cooling gills on hinges
    const ng = gridGeo((x, ph) => { const [r, z] = nacAt(x); return [x, ye + r * Math.sin(ph), z + r * Math.cos(ph)]; }, HI ? [1.5, 1.25, 1.0, .65, .3, -.1, -.5, -.9, -1.3, -1.7, -2.1, -2.4, -2.7, -2.95] : [1.5, .3, -1.3, -2.95], range(-Math.PI, Math.PI, HI ? 24 : 10), (x, ph) => [(1.5 - x) / 4.45, (ph + Math.PI) / TAU], [0, ye, ZE], true);
    add(new THREE.Mesh(ng, HI ? toon('#ffffff', { map: texNac }) : M(C.olive)), 'nacelle', 'metal', { mat: 'painted_aluminium' });
    lathe('cowl_rear', 'metal', COWL.slice(0, 5), ax, dir, '#6f7644', { mat: 'painted_aluminium_clean' }); lathe('cowl_polished_band', 'metal', [[2.64, .66], [2.70, .635], [2.74, .61], [2.775, .575], [2.795, .545], [2.806, .52], [2.805, .50], [2.79, .482]], ax, dir, 0, { m: shiny('#eef1f3', 28, '#ffffff', true), mat: 'polished_aluminium' }); lathe('cowl_duct', 'metal', [[2.79, .482], [2.6, .46], [2.3, .49]], ax, dir, '#4b5030', { mat: 'painted_aluminium_clean' });
    cyl('cowl_firewall_gap', 'metal', [1.12, ye, ZE], [1.5, ye, ZE], .62, C.dark, { seg: 20, cast: false });
    if (HI) { for (let k = 0; k < 18; k++) { const a = (k + .5) / 18 * TAU, sn = Math.sin(a), cs = Math.cos(a); beam('cooling_gill', 'metal', [1.47, ye + sn * .70, ZE + cs * .70], [1.2, ye + sn * .76, ZE + cs * .76], .225, .012, '#6a7040', { side: [0, cs, -sn], mat: 'painted_aluminium_clean' }); }
      for (const x of [1.92, 2.47]) { const m = new THREE.Mesh(new THREE.TorusGeometry(cowlR(x) + .004, .008, 5, 40), M(C.oliveD)); m.position.copy(V([x, ye, ZE])); m.rotation.y = Math.PI / 2; add(m, 'cowl_seam_ring', 'metal', { cast: false }); }
      for (const a of [45, 135, 225, 315]) { const sn = Math.sin(a * D2R), cs = Math.cos(a * D2R); beam('cowl_piano_hinge', 'metal', [1.5, ye + sn * .706, ZE + cs * .706], [2.44, ye + sn * .706, ZE + cs * .706], .016, .008, C.oliveD, { side: [0, cs, -sn], cast: false }); for (let x = 1.6; x < 2.44; x += .14) rivets.push({ p: [x, ye + Math.sin(a * D2R + .05) * .708, ZE + Math.cos(a * D2R + .05) * .708], n: [0, sn, cs], r: .012, c: '#c9cdd0' }); }
      for (const x of [1.53, 2.44, 2.68]) for (let k = 0; k < 40; k++) { const a = k / 40 * TAU, R = cowlR(x) + .001; rivets.push({ p: [x, ye + Math.sin(a) * R, ZE + Math.cos(a) * R], n: [0, Math.sin(a), Math.cos(a)], r: .0075, c: '#8e945f' }); }
      sph('carburettor_scoop', 'metal', .2, [1.75, ye, ZE + .7], '#6f7644', { s: [3.2, .9, .62] }); box('carburettor_scoop_mouth', 'metal', [.02, .26, .1], [2.37, ye, ZE + .74], C.dark, { cast: false });
      sph('oil_cooler_scoop', 'metal', .16, [1.1, ye, ZE - .64], C.greyD, { s: [3.0, 1.2, .7] }); box('oil_cooler_mouth', 'metal', [.02, .26, .1], [1.56, ye, ZE - .7], C.dark, { cast: false });
      // exhaust collector stub (outboard, low) with a dark throat
      cyl('exhaust_stub', 'metal', [1.42, ye + so * .56, ZE - .36], [.98, ye + so * .66, ZE - .43], .075, C.rust, { mat: 'rusty_steel', open: true, m: M(C.rust, { side: THREE.DoubleSide }) }); cyl('exhaust_throat', 'metal', [1.3, ye + so * .588, ZE - .38], [1.0, ye + so * .655, ZE - .427], .06, '#0f0d0c', { cast: false });
      // the engine behind the lip: crankcase, nine finned cylinders, push rods, ignition ring, baffle
      cyl('engine_baffle', 'metal', [2.18, ye, ZE], [2.2, ye, ZE], .66, '#2b2c2a', { seg: 24, cast: false }); cyl('engine_crankcase', 'metal', [2.2, ye, ZE], [2.62, ye, ZE], .2, '#8a8f94', { seg: 16, mat: 'cast_aluminium' }); cyl('engine_nose_case', 'metal', [2.62, ye, ZE], [2.9, ye, ZE], .2, '#8a8f94', { r2: .1, seg: 16, mat: 'cast_aluminium' });
      { const m = new THREE.Mesh(new THREE.TorusGeometry(.25, .014, 5, 24), M('#b06a2e')); m.position.copy(V([2.6, ye, ZE])); m.rotation.y = Math.PI / 2; add(m, 'engine_ignition_ring', 'metal', { cast: false, mat: 'copper' }); }
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, sn = Math.sin(a), cs = Math.cos(a), at = r => [2.38, ye + sn * r, ZE + cs * r]; cyl('engine_cylinder', 'metal', at(.19), at(.5), .075, '#4a4c4e', { seg: 10, mat: 'cast_iron', cast: false }); for (const r of [.26, .31, .36, .41, .46]) cyl('engine_cooling_fin', 'metal', at(r), at(r + .012), .098, '#63676a', { seg: 10, cast: false }); box('engine_rocker_box', 'metal', [.16, .1, .1], at(.54), '#8a8f94', { e: [-a, 0, 0], cast: false }); cyl('engine_push_rod', 'metal', [2.56, ye + sn * .2, ZE + cs * .2], [2.5, ye + sn * .5, ZE + cs * .5], .01, '#c9cdd0', { cast: false, seg: 5 }); }
    } else cyl('engine_dark', 'metal', [2.2, ye, ZE], [2.7, ye, ZE], .46, '#2b2c2a', { cast: false });
    // propeller: shaft, hub with three blade cuffs, polished dome, three twisted blades with yellow tips, maker's disc on each blade
    const pg = new THREE.Group(); pg.name = 'propeller_' + (ye < 0 ? 'R' : 'L') + (Math.abs(ye) > 5 ? '_outer' : '_inner'); pg.position.copy(V([3.0, ye, ZE])); air.add(pg); const P = { parent: pg };
    cyl('prop_shaft', 'metal', [-.25, 0, 0], [0, 0, 0], .06, '#8a8f94', P); cyl('prop_hub', 'metal', [-.1, 0, 0], [.12, 0, 0], .13, '#3a3c40', { ...P, seg: 14, mat: 'steel' }); sph('prop_hub_dome', 'metal', .11, [.12, 0, 0], 0, { ...P, m: shiny('#dfe3e6', 150, '#ffffff', true), s: [1.5, 1, 1], mat: 'polished_aluminium' });
    for (let k = 0; k < 3; k++) { const b = new THREE.Group(); b.rotation.x = k * TAU / 3; pg.add(b); add(new THREE.Mesh(gBlade, M('#2b2d30')), 'prop_blade', 'metal', { parent: b, mat: 'painted_steel_black' }); add(new THREE.Mesh(gTip, M(C.yellow)), 'prop_blade_tip', 'metal', { parent: b, mat: 'painted_yellow' });
      if (HI) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.065, .075, .16, 10), M('#3a3c40')); c.position.set(0, .17, 0); add(c, 'prop_blade_cuff', 'metal', { parent: b }); const d = new THREE.Mesh(new THREE.CircleGeometry(.035, 10), M(C.cream, { side: THREE.DoubleSide })); d.position.set(.031, .62, .02); d.rotation.y = Math.PI / 2 - .75; add(d, 'prop_maker_disc', 'metal', { parent: b, cast: false }); } }
    pg.rotation.x = REST[String(ye)]; props.push({ g: pg, rest: REST[String(ye)], dir: 1 }); engines.push({ y: ye, cowl: A2G([2.2, ye, ZE]), hub: A2G([3.0, ye, ZE]) });
  }

  // ================= UNDERCARRIAGE (ground frame: wheels on axles, oleo struts, torque links on pivots, brake lines) =================
  const G = { parent: root }, chrome = shiny('#eef1f3', 60, '#ffffff'), tyreProf = (() => { const p = [[-.13, .37], [-.175, .40], [-.20, .50], [-.195, .60], [-.17, .665], [-.14, .695]]; let w = -.14; for (let i = 0; i < 5; i++) { p.push([w, .70], [w + .038, .70]); if (i < 4) p.push([w + .043, .678], [w + .052, .678]); w += .0575; } return [...p, [.14, .695], [.17, .665], [.195, .60], [.20, .50], [.175, .40], [.13, .37]]; })();
  const tyreTex = HI ? canvasTex(mk(256, 64, (g, W, H) => { g.fillStyle = '#544428'; g.fillRect(0, 0, W, H); const r = rng(9); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(190,180,150,${r() * .28})`; g.fillRect(r() * W, r() * H, 2 + r() * 8, 1 + r() * 2); } })) : null;
  const wheel = (name, c, R, wd, s) => { const k = R / .7, kw = wd / .4;
    lathe(name + '_tyre', 'rubber', tyreProf.map(q => [q[0] * kw, q[1] * k]), c, [0, 1, 0], C.rubber, { m: HI ? toon('#ffffff', { map: tyreTex, side: THREE.DoubleSide }) : M(C.rubber), seg: HI ? 44 : 14, mat: 'rubber_tyre', ...G });
    cyl(name + '_rim', 'metal', [c[0], c[1] - wd * .36, c[2]], [c[0], c[1] + wd * .36, c[2]], R * .535, '#70784a', { seg: 24, mat: 'painted_steel', ...G });
    if (!HI) return;
    for (const d of [-1, 1]) { cyl(name + '_hub_disc', 'metal', [c[0], c[1] + d * wd * .36, c[2]], [c[0], c[1] + d * wd * .40, c[2]], R * .45, '#8b9360', { seg: 24, r2: R * .2, mat: 'painted_steel', ...G }); const m = new THREE.Mesh(new THREE.TorusGeometry(R * .535, .014, 6, 32), M('#5f6640')); m.position.copy(V([c[0], c[1] + d * wd * .36, c[2]])); add(m, name + '_rim_lip', 'metal', { cast: false, ...G });
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; cyl(name + '_wheel_bolt', 'metal', [c[0] + Math.cos(a) * R * .3, c[1] + d * wd * .37, c[2] + Math.sin(a) * R * .3], [c[0] + Math.cos(a) * R * .3, c[1] + d * wd * .44, c[2] + Math.sin(a) * R * .3], .016, '#c9cdd0', { seg: 6, cast: false, mat: 'steel', ...G }); } }
    cyl(name + '_hub_cap', 'metal', [c[0], c[1] + s * wd * .4, c[2]], [c[0], c[1] + s * wd * .5, c[2]], R * .13, 0, { m: chrome, r2: R * .08, mat: 'chrome', ...G }); cyl(name + '_brake_drum', 'metal', [c[0], c[1] - s * wd * .4, c[2]], [c[0], c[1] - s * wd * .56, c[2]], R * .34, '#3a3c40', { seg: 18, mat: 'cast_iron', ...G });
    // ROUND 3: the tyre reads as a tyre from the side: staggered shoulder lugs (a notched outline), cross grooves in the tread, three raised sidewall rings each side, white creep marks across bead and rim, the valve,
    // a ring of rim bolts, cooling fins round the brake drum
    const side = rr => { const P = [[.695, .14], [.665, .17], [.60, .195], [.50, .20], [.40, .175], [.37, .13]]; for (let i = 0; i < P.length - 1; i++) if (rr <= P[i][0] && rr >= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (P[i][0] - rr) / (P[i][0] - P[i + 1][0])) * kw; return .13 * kw; }, W3 = (th, rr, w) => [c[0] + Math.cos(th) * rr * k, c[1] + w, c[2] + Math.sin(th) * rr * k];
    { const d = new THREE.Object3D(), NL = k > .6 ? 40 : 22, lug = new THREE.InstancedMesh(new THREE.BoxGeometry(.05 * k, .052 * k, .04 * kw), M('#64543a'), NL * 2), grv = new THREE.InstancedMesh(new THREE.BoxGeometry(.012 * k, .013 * k, .262 * kw), M('#15120f'), NL * 2); let n = 0;
      for (let i = 0; i < NL; i++) for (const sg of [-1, 1]) { const th = (i + (sg > 0 ? .5 : 0)) / NL * TAU; d.position.copy(V(W3(th, .672, sg * .158 * kw))); d.rotation.set(0, 0, th); d.updateMatrix(); lug.setMatrixAt(n++, d.matrix); }
      for (let i = 0; i < NL * 2; i++) { const th = (i + .25) / (NL * 2) * TAU; d.position.copy(V(W3(th, .697, 0))); d.rotation.set(0, 0, th); d.updateMatrix(); grv.setMatrixAt(i, d.matrix); }
      lug.frustumCulled = grv.frustumCulled = false; add(lug, name + '_tread_lug', 'rubber', { mat: 'rubber_tyre', ...G }); add(grv, name + '_tread_groove', 'rubber', { mat: 'rubber_tyre', cast: false, ...G }); }
    for (const sg of [-1, 1]) { for (const rr of [.43, .52, .61]) { const m = new THREE.Mesh(new THREE.TorusGeometry(rr * k, .0075 * k, 5, 56), M('#66583e')); m.position.copy(V([c[0], c[1] + sg * (side(rr) + .002), c[2]])); add(m, name + '_sidewall_rib', 'rubber', { mat: 'rubber_tyre', cast: false, ...G }); }
      for (let i = 0; i < 12; i++) { const th = (i + .5) / 12 * TAU; cyl(name + '_rim_bolt', 'metal', W3(th, .335, sg * wd * .355), W3(th, .335, sg * (wd * .355 + .014)), .011 * k, '#b9bec2', { seg: 6, cast: false, mat: 'steel', ...G }); } }
    for (const th of [1.15, 4.3]) box(name + '_creep_mark', 'rubber', [.075 * k, .004, .02 * k], W3(th, .385, s * (side(.39) + .003)), '#e9e6da', { e: [0, 0, th], cast: false, mat: 'paint_white', ...G });
    cyl(name + '_valve', 'metal', W3(2.4, .345, s * wd * .37), W3(2.4, .352, s * (wd * .37 + .045 * k)), .007 * k, C.brass, { m: shiny(C.brass, 80), seg: 8, mat: 'brass', cast: false, ...G });
    for (const ax of [.44, .48, .52]) { const m = new THREE.Mesh(new THREE.TorusGeometry(R * .348, .0075 * k, 5, 30), M('#2c2e31')); m.position.copy(V([c[0], c[1] - s * wd * ax, c[2]])); add(m, name + '_brake_drum_fin', 'metal', { mat: 'cast_iron', cast: false, ...G }); } };
  const gearAnch = {};
  for (const s of [1, -1]) {
    const c = [.49, s * 4.2, .7], yl = s * 4.555, ax0 = [.49, yl, .7], top = [.98, yl, 1.86], at = t => [lerp(ax0[0], top[0], t), yl, lerp(ax0[2], top[2], t)], sd = s > 0 ? 'L' : 'R';
    wheel('main_wheel_' + sd, c, .7, .38, s);
    cyl('main_axle', 'metal', [.49, s * 3.95, .7], [.49, s * 4.66, .7], .05, '#8a8f94', { mat: 'steel', ...G }); if (HI) cyl('main_axle_nut', 'metal', [.49, s * 4.64, .7], [.49, s * 4.70, .7], .07, '#c9cdd0', { seg: 6, mat: 'steel', ...G });
    cyl('oleo_cylinder', 'metal', at(.42), at(1.06), .078, '#5f6640', { mat: 'painted_steel', ...G }); cyl('oleo_piston', 'metal', at(.02), at(.45), .05, 0, { m: chrome, mat: 'chrome', ...G }); cyl('oleo_axle_fitting', 'metal', at(-.07), at(.1), .085, '#5f6640', { mat: 'painted_steel', ...G });
    if (HI) { for (const t of [.42, .62, 1.0]) cyl('oleo_collar', 'metal', at(t - .02), at(t + .02), .095, '#4a5034', { mat: 'painted_steel', ...G });
      // torque links (scissors): two arms pinned at the collar, the knee and the axle fitting
      const A = [at(.46)[0] + .1, yl, at(.46)[2] - .03], B = [at(.08)[0] + .1, yl, at(.08)[2] - .03], K = [at(.27)[0] + .31, yl, at(.27)[2] - .1];
      beam('torque_link_upper', 'metal', A, K, .07, .022, '#5f6640', { side: [0, 1, 0], mat: 'painted_steel', ...G }); beam('torque_link_lower', 'metal', B, K, .07, .022, '#5f6640', { side: [0, 1, 0], mat: 'painted_steel', ...G });
      for (const p of [A, B, K]) cyl('torque_link_pin', 'metal', [p[0], yl - .055, p[2]], [p[0], yl + .055, p[2]], .016, '#c9cdd0', { seg: 6, cast: false, mat: 'steel', ...G });
      // drag strut and retraction jack up into the wheel bay; side brace to the nacelle
      const jb = A2G([-.55, yl, ZE - .5]); cyl('drag_strut', 'metal', at(.72), jb, .04, '#5f6640', { mat: 'painted_steel', ...G }); cyl('retraction_jack', 'metal', at(.9), [lerp(at(.9)[0], jb[0], .55), yl, lerp(at(.9)[2], jb[2] + .12, .55)], .028, 0, { m: chrome, mat: 'chrome', ...G });
      cyl('gear_side_brace', 'metal', at(.8), A2G([.9, s * 4.0, ZE - .55]), .028, '#5f6640', { mat: 'painted_steel', ...G });
      // brake line: a rubber hose clipped down the leg and looping in to the drum
      tube('brake_line', 'rubber', [[at(1.02)[0] - .09, yl - s * .03, at(1.02)[2]], [at(.7)[0] - .1, yl - s * .04, at(.7)[2]], [at(.4)[0] - .1, yl - s * .06, at(.4)[2]], [at(.16)[0] - .16, yl - s * .12, at(.16)[2] + .02], [.36, s * 4.0, .86], [.44, s * 3.98, .74]], .013, '#201c19', { mat: 'rubber_hose', cast: false, ...G });
      for (const t of [.5, .8]) { const m = new THREE.Mesh(new THREE.TorusGeometry(.085, .008, 4, 14), M('#c9cdd0')); orient(m, at(t - .01), at(t + .01)); m.rotateX(Math.PI / 2); add(m, 'brake_line_clip', 'metal', { cast: false, ...G }); }
      // wheel bay: dark opening under the nacelle with a frame, two small bay doors on hinges
      const wb = A2G([.35, s * 4.24, ZE - .62]); box('wheel_bay_dark', 'metal', [1.5, .9, .06], wb, '#141416', { e: [0, 0, PITCH], cast: false, ...G });
      for (const d of [-1, 1]) { const h = A2G([.35, s * 4.24 + d * .47, ZE - .6]); beam('wheel_bay_door', 'metal', [h[0], h[1], h[2]], [h[0], h[1] + d * .08, h[2] - .2], 1.3, .014, C.greyD, { side: [1, 0, PITCH], mat: 'painted_aluminium', ...G }); for (const dx of [-.5, .5]) cyl('wheel_bay_door_hinge', 'metal', [h[0] + dx - .05, h[1], h[2] + dx * SP], [h[0] + dx + .05, h[1], h[2] + dx * SP], .016, C.aluD, { cast: false, ...G }); }
      // the lantern hook: a bent steel rod welded to the leg, front side (SET_MAP strut_hook)
      if (s > 0) { const hk = [at(.52)[0] + .075, yl, at(.52)[2]]; tube('strut_hook', 'metal', [hk, [hk[0] + .07, yl, hk[2] + .01], [hk[0] + .11, yl, hk[2] - .03], [hk[0] + .1, yl, hk[2] - .07], [hk[0] + .06, yl, hk[2] - .075]], .009, '#c9cdd0', { m: shiny('#c9cdd0', 90), mat: 'steel', cast: false, ...G }); gearAnch.hook = [hk[0] + .09, yl, hk[2] - .07]; }
      cyl('tie_down_ring_post', 'metal', at(.12), [at(.12)[0], yl + s * .12, at(.12)[2]], .012, '#c9cdd0', { cast: false, ...G });
    }
    if (o.contact) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: '#120e18', transparent: true, opacity: .5, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.copy(V([c[0], c[1], .006])); m.scale.set(.55, .32, 1); add(m, 'wheel_contact_shadow', 'shadow', { cast: false, recv: false, ...G }); }
  }
  // tail wheel: fork, short oleo into the belly, boot ring
  { const b = A2G([-9.0, 0, fusZ(-9) - fusR(-9) + .05]), c = [b[0] - .14, 0, .27]; wheel('tail_wheel', c, .27, .2, 1);
    cyl('tail_wheel_axle', 'metal', [c[0], -.17, c[2]], [c[0], .17, c[2]], .022, '#8a8f94', { mat: 'steel', ...G });
    for (const d of [-1, 1]) beam('tail_wheel_fork', 'metal', [c[0], d * .15, c[2]], [c[0] + .1, d * .15, .62], .06, .02, '#5f6640', { side: [1, 0, 0], mat: 'painted_steel', ...G });
    box('tail_wheel_yoke', 'metal', [.1, .34, .05], [c[0] + .1, 0, .63], '#5f6640', { ...G }); cyl('tail_wheel_oleo', 'metal', [c[0] + .1, 0, .64], [b[0], 0, b[2] + .08], .045, 0, { m: chrome, mat: 'chrome', ...G }); cyl('tail_wheel_boot', 'cloth', [b[0] - .01, 0, b[2] - .1], [b[0], 0, b[2] + .05], .12, '#4f3323', { r2: .16, mat: 'canvas', ...G });
    if (o.contact) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial({ color: '#120e18', transparent: true, opacity: .5, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.copy(V([c[0], 0, .006])); m.scale.set(.24, .15, 1); add(m, 'wheel_contact_shadow', 'shadow', { cast: false, recv: false, ...G }); }
    gearAnch.tail = c; }

  // ================= STORY MARKS AND MOVERS =================
  // rivets (instanced real parts)
  if (rivets.length) { const im = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), toon('#ffffff'), rivets.length), d = new THREE.Object3D(), col = new THREE.Color(), Z = new THREE.Vector3(0, 0, 1);
    rivets.forEach((r, i) => { d.position.copy(V(r.p)); d.quaternion.setFromUnitVectors(Z, V(r.n).normalize()); d.scale.set(r.r, r.r, r.r * .5); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.set(r.c)); }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; add(im, 'rivets', 'metal', { cast: false, mat: 'rivet_heads' }); }
  if (rivetsIn.length) { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 3, 0, TAU, 0, Math.PI / 2), toon('#ffffff', { emissive: '#3a3f28' }), rivetsIn.length), d = new THREE.Object3D(), col = new THREE.Color();
    rivetsIn.forEach((r, i) => { d.position.copy(V(r.p)); d.quaternion.setFromUnitVectors(UP, V(r.n).normalize()); d.scale.set(r.r, r.r * .62, r.r); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.set(r.c)); }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; add(im, 'rivet_tails_inside', 'metal', { cast: false, mat: 'rivet_tails' }); }
  // torn metal petals round each hole, bent outward (exit) or inward (entry): bare aluminium

  if (HI && holes.length) { const pr = rng(o.seed + 3), pts = [];
    for (const h of holes) { if (h.kind === 'tear') continue; const sf = S[h.surf], n = h.poly.length, c = V(sf.P(h.a, h.b)), nv = V(sf.N(h.a, h.b)), rim = h.poly.map(q => { const [a, b] = sf.loc(h.a, h.b, q[0], q[1]); return V(sf.off(a, sf.clampB(b), .002)); });
      for (let k = 0; k < n; k++) { if (pr() < .22) continue; const p0 = rim[k], p1 = rim[(k + 1) % n], mid = p0.clone().add(p1).multiplyScalar(.5), rad = mid.clone().sub(c), L = Math.max(.012, rad.length()) * (.5 + .6 * pr()); rad.normalize(); const tip = mid.clone().addScaledVector(rad, L * (.1 + .5 * pr())).addScaledVector(nv, h.bend * L * (.55 + .5 * pr())); if (!(cabHole(h) && h.bend < 0)) pts.push(p0, p1, tip); } }   // the cabin's inward petals are built with thickness below (G7); the random stream is unchanged, so every outside petal is where it was
    if (pts.length) add(new THREE.Mesh(triGeo(pts), M('#d3d6d9', { side: THREE.DoubleSide })), 'hole_petals', 'metal', { cast: false, mat: 'bare_aluminium_torn' }); }
  // INSIDE THE CABIN (ROUND 3, replaces the G7 petals): every cabin hole has a SMOOTH torn outline (h.out) and real torn metal with thickness, all smooth-shaded:
  // a bright collar of bare metal on the inner skin (it also hides the stepped cut edge of the painted sheet), the skin's torn edge turned inward as a lip of wandering depth, and at every entry hole the
  // petals: the metal that filled the hole, split into 3 to 9 tongues, punched inward and curled back on itself, 4 mm thick, primer on the cabin face, olive drab (grey low down) on what was the outside,
  // bright torn edges, rounded tips. Outside, the same outline carries a thin bare rim.
  const TUBE_CAM = [-6.15, -.66, .1], TUBE_AIM = [-3.3, 1.0, .02];
  if (HERO) { const q = rng(o.seed + 97), mkAcc = () => ({ p: [], i: [] }), A = { collar: mkAcc(), lip: mkAcc(), front: mkAcc(), backO: mkAcc(), backG: mkAcc(), edge: mkAcc(), rimOut: mkAcc() }, sf = S.fus;
    const pushGrid = (acc, rows) => { const base = acc.p.length / 3, nr = rows.length, nc = rows[0].length; for (const row of rows) for (const v of row) acc.p.push(v.x, v.y, v.z); for (let a = 0; a < nr - 1; a++) for (let b = 0; b < nc - 1; b++) { const i0 = base + a * nc + b, i1 = i0 + 1, i2 = i0 + nc, i3 = i2 + 1; acc.i.push(i0, i2, i1, i1, i2, i3); } };
    const accMesh = (acc, m, name, mat) => { if (!acc.i.length) return; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(acc.p, 3)); g.setIndex(acc.i); g.computeVertexNormals(); const me = add(new THREE.Mesh(g, m), name, 'metal', { cast: false, mat }); me.frustumCulled = false; };
    for (const h of holes) { if (!cabHole(h)) continue; const O = h.out, m = O.length, c = V(sf.P(h.a, h.b)), nin = V(sf.N(h.a, h.b)).negate();
      const at = (p, off, grow = 0) => { const l = Math.hypot(p[0], p[1]) || 1e-6, k = 1 + grow / l, [a, b] = sf.loc(h.a, h.b, p[0] * k, p[1] * k); return V(sf.off(a, b, off)); };
      const rim = O.map(p => at(p, -.0044)), U = rim.map(p => { const u = p.clone().sub(c); return u.addScaledVector(nin, -u.dot(nin)).normalize(); }), ring = f => { const a = O.map((p, i) => f(p, i)); a.push(a[0]); return a; };
      pushGrid(A.collar, [ring((p, i) => rim[i]), ring(p => at(p, -.0048, .0075))]);
      pushGrid(A.rimOut, [ring(p => at(p, .0022)), ring(p => at(p, .0026, .0125))]);
      const ph0 = q() * TAU, lipD = i => .0065 + .0055 * (1 + Math.sin(i / m * TAU * 3 + ph0)) * .5 + .003 * q();
      pushGrid(A.lip, [ring((p, i) => rim[i]), ring((p, i) => rim[i].clone().addScaledVector(nin, lipD(i)).addScaledVector(U[i], .0032))]);
      if (h.bend > 0) continue;
      const per = rim.reduce((s, p, i) => s + p.distanceTo(rim[(i + 1) % m]), 0), np = Math.max(3, Math.min(9, Math.round(per / (.05 + h.r * .35)))), cuts = [], back = h.b > 118 * D2R ? A.backG : A.backO;
      for (let k = 0; k < np; k++) cuts.push((k + (q() - .5) * .5) / np * m);
      for (let k = 0; k < np; k++) { let i0 = cuts[k], i1 = k === np - 1 ? cuts[0] + m : cuts[k + 1]; const skip = q() < .12, gap = Math.min(.8, (i1 - i0) * .08); i0 += gap; i1 -= gap; if (skip || i1 - i0 < 1.2) continue;
        const M2 = 4, N = 8, rp = j => { const f = i0 + (i1 - i0) * j / M2, ia = Math.floor(f), t = f - ia; return rim[((ia % m) + m) % m].clone().lerp(rim[(((ia + 1) % m) + m) % m], t); }, roots = Array.from({ length: M2 + 1 }, (_, j) => rp(j)), mid = roots[M2 / 2];
        const u = mid.clone().sub(c); u.addScaledVector(nin, -u.dot(nin)); const d0 = u.length(); u.normalize();
        const Lp = Math.min(.17, Math.max(.02, d0 * (.7 + .5 * q()))), al0 = (90 + q() * 22) * D2R, al1 = (165 + q() * 42) * D2R, tw = (q() - .5) * .7, t = .005, cup = (q() - .3) * .25, F = [], Bk = [];
        for (let j = 0; j <= M2; j++) { const v = j / M2 * 2 - 1, lenj = Lp * Math.sqrt(Math.max(.05, 1 - v * v * .72)), colF = [], colB = [], P = roots[j].clone();
          for (let i = 0; i <= N; i++) { const s = i / N, al = al0 + (al1 - al0) * Math.pow(s, .85) + tw * v * s + cup * (1 - v * v) * s, dir = u.clone().multiplyScalar(-Math.cos(al)).addScaledVector(nin, Math.sin(al)), nq = u.clone().multiplyScalar(Math.sin(al)).addScaledVector(nin, Math.cos(al));
            const Q = P.clone().addScaledVector(mid.clone().sub(roots[j]), .32 * Math.pow(s, 1.3)); colF.push(Q.clone().addScaledVector(nq, t / 2)); colB.push(Q.clone().addScaledVector(nq, -t / 2)); if (i < N) P.addScaledVector(dir, lenj / N); }
          F.push(colF); Bk.push(colB); }
        pushGrid(A.front, F); pushGrid(back, Bk); pushGrid(A.edge, [F[0], Bk[0]]); pushGrid(A.edge, [F[M2], Bk[M2]]); pushGrid(A.edge, [F.map(cq => cq[N]), Bk.map(cq => cq[N])]); } }
    const TM = (col, em) => M(col, { side: THREE.DoubleSide, emissive: em });
    accMesh(A.collar, TM('#cdd2c6', '#55584e'), 'hole_collar_inside', 'bare_aluminium_torn'); accMesh(A.lip, TM('#c3c8bb', '#4e5148'), 'hole_torn_edge', 'bare_aluminium_torn'); accMesh(A.edge, TM('#e6e9e0', '#62655b'), 'hole_petal_edge', 'bare_aluminium_torn');
    accMesh(A.front, TM('#b4be92', '#474c33'), 'hole_petal_inside', 'primed_aluminium'); accMesh(A.backO, TM('#868c56', '#33361a'), 'hole_petal_inside_paint', 'painted_aluminium'); accMesh(A.backG, TM(C.grey, '#4a4c4d'), 'hole_petal_inside_paint_grey', 'painted_aluminium');
    accMesh(A.rimOut, M('#cfd2d5', { side: THREE.DoubleSide }), 'hole_rim_outside', 'bare_aluminium_torn'); }
  // the Chief's chalk rings: one wobbly hand-drawn ring per hole, revealed in order by set({ chalk })
  const ringPos = (h, rr, N) => { const sf = S[h.surf], out = [], st = rr() * TAU, wob = rr() * TAU, rho = rhoOf(h), w = HI ? .03 : .06, pt = (al, rad) => { const [a, b] = sf.loc(h.a, h.b, Math.cos(al) * rad, Math.sin(al) * rad); return V(sf.off(a, sf.clampB(b), .005)); };
    let pi = null, po = null; for (let j = 0; j <= N; j++) { const al = st + j / N * TAU * 1.06, rad = rho * (1 + .09 * (j / N - .5)) + .008 * Math.sin(al * 3 + wob), wi = w * (.8 + .35 * Math.sin(j * 1.7 + wob)), qi = pt(al, rad - wi / 2), qo = pt(al, rad + wi / 2); if (pi) out.push(pi, po, qi, po, qo, qi); pi = qi; po = qo; } return out; };
  const chalkMat = toon(C.chalk, { emissive: '#6e6c64', side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), RN = HI ? 26 : 10;
  let chalkMesh = null, fingerMesh = null;
  if (ringList.length) { const rr = rng(o.seed + 4), pts = []; for (const h of ringList) pts.push(...ringPos(h, rr, RN)); chalkMesh = add(new THREE.Mesh(triGeo(pts), chalkMat), 'chalk_rings', 'chalk', { cast: false, mat: 'chalk' }); chalkMesh.frustumCulled = false;
    const fh = holes.find(h => h.tag === 'finger_hole'); if (fh) { fingerMesh = add(new THREE.Mesh(triGeo(ringPos(fh, rr, RN)), chalkMat), 'chalk_ring_finger', 'chalk', { cast: false, mat: 'chalk' }); fingerMesh.frustumCulled = false; } }
  // ARMOR HERE with arrows, chalked under the near wing (hero)
  let armorMesh = null, plateGrp = null, patchMesh = null, panel = null;
  const AH = { y: 5.98, x: .97, w: 1.36, d: .56 };
  if (HERO) {
    const tex = canvasTex(mk(1024, 420, (g, W, H) => { const r = rng(8), chalk = (fn) => { for (let k = 0; k < 3; k++) { g.save(); g.translate((r() - .5) * 3, (r() - .5) * 3); g.globalAlpha = .55 + r() * .3; fn(); g.restore(); } };
      g.clearRect(0, 0, W, H); g.fillStyle = g.strokeStyle = C.chalk; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 150px "Comic Sans MS", "Segoe Print", "Chalkboard SE", sans-serif'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
      chalk(() => g.fillText('ARMOR HERE', W / 2, H * .46));
      const arrow = (x0, y0, x1, y1) => chalk(() => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); const a = Math.atan2(y1 - y0, x1 - x0); g.moveTo(x1 - 42 * Math.cos(a - .5), y1 - 42 * Math.sin(a - .5)); g.lineTo(x1, y1); g.lineTo(x1 - 42 * Math.cos(a + .5), y1 - 42 * Math.sin(a + .5)); g.stroke(); });
      arrow(70, H * .82, 20, H * .97); arrow(W - 70, H * .82, W - 20, H * .97); arrow(W * .5, H * .8, W * .5, H * .98); arrow(120, H * .2, 30, H * .04); arrow(W - 120, H * .2, W - 30, H * .04);
      g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 900; i++) { g.globalAlpha = r() * .5; g.fillRect(r() * W, r() * H, 1 + r() * 5, 1 + r() * 2); } }));
    // u runs outboard (+y), the top of the letters points at the nose: read from below with the camera in front of the plane
    const geo = gridGeo((y, t) => S.wLl.off(y, wingC(y, AH.x + AH.d / 2 - t * AH.d), .006), range(AH.y - AH.w / 2, AH.y + AH.w / 2, 8), range(0, 1, 4), (y, t) => [(y - (AH.y - AH.w / 2)) / AH.w, t]);
    armorMesh = add(new THREE.Mesh(geo, toon('#ffffff', { map: tex, emissive: '#6e6c64', emissiveMap: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })), 'chalk_armor_here', 'chalk', { cast: false, mat: 'chalk' }); armorMesh.visible = false;
    // the loose access panel under the near wing: hangs by one screw, falls, bounces twice, rests on the concrete
    const pc = S.wLl.off(6.42, wingC(6.42, .38), .01), pcg = A2G(pc); panel = new THREE.Group(); panel.name = 'loose_panel'; root.add(panel);
    const ptex = canvasTex(mk(256, 180, (g, W, H) => { g.fillStyle = C.grey; g.fillRect(0, 0, W, H); const r = rng(6); tints(g, r, 0, 0, W, H, 3, 2, .08); g.strokeStyle = 'rgba(40,44,48,.8)'; g.lineWidth = 4; g.strokeRect(5, 5, W - 10, H - 10); g.fillStyle = '#5b6066'; for (const [x, y] of [[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16], [W / 2, 14], [W / 2, H - 14]]) { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); } chips(g, r, 30, 0, 0, W, H, 8); }));
    add(new THREE.Mesh(new THREE.BoxGeometry(.36, .012, .5), [M(C.greyD), M(C.greyD), toon('#ffffff', { map: ptex }), M('#6f775f'), M(C.greyD), M(C.greyD)]), 'loose_panel_plate', 'metal', { parent: panel, mat: 'painted_aluminium' });
    for (const [dx, dz] of [[-.15, -.22], [.15, .22]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .02, 6), M('#c9cdd0')); m.position.set(dx, 0, dz); add(m, 'loose_panel_screw', 'metal', { parent: panel, cast: false }); }
    panel.userData = { from: pcg, rest: [pcg[0] + .35, pcg[1] + .55, .012] };
    // the rubber patch the Chief slaps on the GOOD tire (stays there until the last beat). ROUND 3: it sits on the tire's WALL (upper rear quarter, a metre up, clear of the leg and of the lantern on its hook), so it reads from the side: lighter tan rubber, a buffed cross-hatched edge, the maker's ring.
    // Outboard wall by default; place state patch_side: -1 puts it on the inboard wall (anchor tire_patch_inboard).
    const tc = [.49, 4.2, .7], PA = 148 * D2R, sideP = rr => { const P = [[.695, .14], [.665, .17], [.60, .195], [.50, .20], [.40, .175], [.37, .13]]; for (let i = 0; i < P.length - 1; i++) if (rr <= P[i][0] && rr >= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (P[i][0] - rr) / (P[i][0] - P[i + 1][0])) * .95; return .13 * .95; };
    const rubTex = canvasTex(mk(400, 300, (g, W, H) => paintPatch(g, W, H, true)));
    patchMesh = {}; for (const sg of [1, -1]) { patchMesh[sg] = add(new THREE.Mesh(gridGeo((a, rr) => [tc[0] + Math.cos(a) * rr, tc[1] + sg * (sideP(rr) + .005), tc[2] + Math.sin(a) * rr], range(PA - .134, PA + .134, 6), range(.46, .66, 6), (a, rr) => [sg > 0 ? (rr - .46) / .2 : (.66 - rr) / .2, (a - PA + .134) / .268]), toon('#ffffff', { side: THREE.DoubleSide, alphaTest: .5, map: rubTex })), sg > 0 ? 'tire_patch' : 'tire_patch_inboard', 'rubber', { cast: false, mat: 'rubber_patch', parent: root }); patchMesh[sg].visible = false; }
    patchMesh[0] = add(new THREE.Mesh(gridGeo((a, w) => [tc[0] + Math.cos(a) * .708, tc[1] + w, tc[2] + Math.sin(a) * .708], range(-.03, .25, 5), range(-.03, .125, 3), (a, w) => [(a + .03) / .28, (w + .03) / .155]), toon('#ffffff', { side: THREE.DoubleSide, alphaTest: .5, map: rubTex })), 'tire_patch_tread', 'rubber', { cast: false, mat: 'rubber_patch', parent: root }); patchMesh[0].visible = false;   // patch_side: 0 = the old place on the tread, facing forward (anchor tire_patch_tread)
    // the ARMOR plate bolted over the clean cowl (camera side: outboard and low), six hex bolts
    plateGrp = new THREE.Group(); plateGrp.name = 'cowl_armor_plate'; air.add(plateGrp); const ye = ENG_Y[0], p0 = 58 * D2R, p1 = 142 * D2R, x0 = 1.72, x1 = 2.46, PP = (x, ph, r) => [x, ye + r * Math.sin(ph), ZE + r * Math.cos(ph)];
    const stex = canvasTex(mk(512, 512, (g, W, H) => { const r = rng(12); g.fillStyle = '#7d868e'; g.fillRect(0, 0, W, H); for (let i = 0; i < 500; i++) { g.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .09})` : `rgba(0,0,0,${r() * .1})`; g.fillRect(r() * W, r() * H, 30 + r() * 160, 1 + r() * 2); }
      g.fillStyle = '#f1ece0'; g.font = '900 150px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ARMOR', W / 2, H * .4); g.font = '900 120px Impact, "Arial Black", sans-serif'; g.fillText('1', W / 2, H * .72); g.fillStyle = '#7d868e'; for (let x = 108; x < W - 40; x += 76) g.fillRect(x, H * .22, 4, H * .62); }));
    add(new THREE.Mesh(gridGeo((x, ph) => PP(x, ph, cowlR(x) + .032), range(x0, x1, 6), range(p0, p1, 12), (x, ph) => [(x1 - x) / (x1 - x0), (ph - p0) / (p1 - p0)], [x0, ye, ZE]), toon('#ffffff', { map: stex })), 'armor_plate_face', 'metal', { parent: plateGrp, mat: 'steel_plate' });
    for (const [a, b, c, d] of [[x0, x0, p0, p1], [x1, x1, p0, p1], [x0, x1, p0, p0], [x0, x1, p1, p1]]) add(new THREE.Mesh(gridGeo((t, u) => PP(lerp(a, b, t), lerp(c, d, t), cowlR(lerp(a, b, t)) + .002 + u * .03), range(0, 1, 10), [0, 1], null), M('#5d656c', { side: THREE.DoubleSide })), 'armor_plate_edge', 'metal', { parent: plateGrp, mat: 'steel_plate' });
    for (const x of [x0 + .07, (x0 + x1) / 2, x1 - .07]) for (const ph of [p0 + .07, p1 - .07]) { cyl('armor_plate_bolt', 'metal', PP(x, ph, cowlR(x) + .03), PP(x, ph, cowlR(x) + .052), .026, 0, { m: shiny('#c9cdd0', 110), seg: 6, parent: plateGrp, mat: 'steel' }); cyl('armor_plate_washer', 'metal', PP(x, ph, cowlR(x) + .03), PP(x, ph, cowlR(x) + .036), .04, '#4d545a', { seg: 12, parent: plateGrp, cast: false }); }
    plateGrp.visible = false;
  }

  // ---------- set(state): the movers, no rebuild ----------
  const state = { chalk: 0, panel: 0, patch: 0, patch_side: 1, armor_here: 0, plate_on: 0, props: 1, finger_ring: 0 };
  const total = chalkMesh ? chalkMesh.geometry.attributes.position.count : 0, perRing = RN * 6;
  const fall = p => { // gravity, two bounces, rest: returns [height 0..1, travel 0..1, spin]
    if (p <= 0) return [1, 0, 0]; if (p < .42) { const u = p / .42; return [1 - u * u, u * .45, u * 1.2]; } if (p < .7) { const u = (p - .42) / .28; return [.2 * 4 * u * (1 - u), .45 + u * .33, 1.2 + u * 1.3]; } if (p < .88) { const u = (p - .7) / .18; return [.06 * 4 * u * (1 - u), .78 + u * .16, 2.5 + u * .5]; } return [0, .94 + cl((p - .88) / .12) * .06, 3]; };
  function set(st = {}) { Object.assign(state, st);
    if (chalkMesh) { const n = cl(state.chalk) * (total / 3); chalkMesh.geometry.setDrawRange(0, Math.round(n) * 3); chalkMesh.visible = state.chalk > 0; }
    if (fingerMesh) { fingerMesh.geometry.setDrawRange(0, Math.round(cl(state.finger_ring) * perRing / 3) * 3); fingerMesh.visible = state.finger_ring > 0; }
    if (armorMesh) { armorMesh.visible = state.armor_here > .02; armorMesh.material.opacity = cl(state.armor_here); }
    if (plateGrp) plateGrp.visible = state.plate_on >= .5; if (patchMesh) for (const sg of [1, 0, -1]) patchMesh[sg].visible = state.patch >= .5 && Math.sign(state.patch_side ?? 1) === sg;
    if (state.bay_doors != null && state._bd !== state.bay_doors) { state._bd = state.bay_doors; root.traverse(m => { if (/^wheel_bay_door/.test(m.name || '')) m.visible = state.bay_doors > 0; }); }   // S1 2026-11-14, key bay_doors 0: the thin wheel bay doors are not drawn (side-on at head height they are a flat grey bar between the two faces at the tire); no key = as before
    if (patchMesh && state.tire_hit != null) { const th = cl(state.tire_hit), q = .028 * th * Math.cos((1 - th) * 15); for (const sg of [1, -1]) patchMesh[sg].position.y = sg * q; }   // S1 2026-11-14, key tire_hit 1..0: the fresh patch quivers on the rubber after the slap (out 3 cm, back, out, rest); no key = as before
    if (panel && Array.isArray(state.panel_rest_local)) panel.userData.rest = [state.panel_rest_local[0], state.panel_rest_local[1], .012];   // S1 fix round 2026-11-14, key panel_rest_local [x, y] (the plane's own ground frame): where the loose panel comes to rest; no key = as before
    if (panel) { const U = panel.userData, [h, tr, sp] = fall(cl(state.panel)), z = U.rest[2] + (U.from[2] - U.rest[2]) * h; panel.position.copy(V([lerp(U.from[0], U.rest[0], tr), lerp(U.from[1], U.rest[1], tr), z])); panel.rotation.set(Math.PI * (1 + sp / 3), sp * .7, PITCH * h + Math.sin(sp * 2.1) * .5 * (1 - tr)); }
    for (const p of props) p.g.rotation.x = p.rest + (st.prop_angle != null ? st.prop_angle : -Math.pow(1 - cl(state.props), 2) * TAU * 2.5); delete state.prop_angle;   // prop_angle counts only in the call that gives it, so any frame renders the same on its own
    if (state.t != null) for (const rb of ribbons) { const ps = rb.m.geometry.attributes.position; for (let i = 0; i <= rb.segs; i++) { const u = i / rb.segs, dz = Math.sin(state.t * 9 + rb.ph + u * 4) * rb.w * 1.6 * u, dy = Math.cos(state.t * 7 + rb.ph + u * 3) * rb.w * u; for (const k of [0, 3]) { ps.array[i * 6 + k + 1] = rb.base[i * 6 + k + 1] + dy; ps.array[i * 6 + k + 2] = rb.base[i * 6 + k + 2] + dz; } } ps.needsUpdate = true; }
    return api; }

  // ---------- anchors (LOCAL plan points) ----------
  const tagged = t => { const h = holes.find(h => h.tag === t); return h ? A2G(S[h.surf].P(h.a, h.b)) : null; }, r3 = p => p && p.map(v => +v.toFixed(3));
  const anchors = {
    clean_cowl: r3(A2G([2.79, ENG_Y[0] + .05, ZE - .535])),                                          // lower lip of the spotless inner near cowl: the slide rule taps here
    cowl_band: r3(A2G([2.57, ENG_Y[0] + .45, ZE - .52])), cowl_centre: r3(A2G([2.2, ENG_Y[0], ZE])), prop_hub: r3(A2G([3.12, ENG_Y[0], ZE])), cowl_plate: r3(A2G([2.09, ENG_Y[0] + .72, ZE - .13])), cowl_hook: r3(A2G([1.2, ENG_Y[0], ZE - .775])),
    wheel: [.49, 4.2, .7], strut_hook: r3(gearAnch.hook || [.81, 4.555, 1.3]), tire_patch: r3([.49 + Math.cos(148 * D2R) * .56, 4.2 + .187 + .012, .7 + Math.sin(148 * D2R) * .56]), tire_patch_inboard: r3([.49 + Math.cos(148 * D2R) * .56, 4.2 - .187 - .012, .7 + Math.sin(148 * D2R) * .56]), tire_patch_tread: r3([.49 + Math.cos(.11) * .71, 4.25, .7 + Math.sin(.11) * .71]),
    armor_here: r3(A2G(S.wLl.P(AH.y, wingC(AH.y, AH.x)))), hole_light: r3(tagged('hole_light') || A2G(S.wLl.P(5.08, wingC(5.08, .3)))), last_ring: r3(tagged('last_ring') || A2G(S.wLl.P(5.5, wingC(5.5, .45)))),
    finger_hole: r3(tagged('finger_hole') || A2G(fusP(-4, 86 * D2R))), body_side: r3(A2G(fusP(-4.0, 90 * D2R))), inside_cam: r3(A2G([-3.75, -.1, .3])), inside_floor: r3(A2G([-3.75, 0, -.64])), oxygen_bottle: bottleAt ? r3(A2G(bottleAt)) : null, inside_cam_wide: r3(A2G([-3.98, -.45, 0])), inside_cam_tube: r3(A2G(TUBE_CAM)), inside_aim_tube: r3(A2G(TUBE_AIM)),
    panel_from: panel ? r3(panel.userData.from) : null, panel_rest: panel ? r3(panel.userData.rest) : null, nose: r3(A2G([NOSE, 0, fusZ(NOSE)])), fin_top: r3(A2G(finP(0, HF, .5))), fin_emblem: r3(A2G(finP(1, 2.05, .33))),
    name: r3(A2G(fusP(4.3, 107 * D2R))), crew_door: r3(A2G(fusP(-7.2, 105 * D2R))), tail_wheel: r3(gearAnch.tail), wing_tip_near: r3(A2G(wingP(1, 0, SPAN, .5))), wing_tip_far: r3(A2G(wingP(-1, 0, SPAN, .5))), engines,
    holes: holes.map(h => { const sf = S[h.surf]; return { id: h.id, surf: h.surf, p: r3(A2G(sf.P(h.a, h.b))), n: r3(A2Gn(sf.N(h.a, h.b))), r: +h.r.toFixed(3), kind: h.kind, through: h.through, tag: h.tag || null }; }),
  };
  const toPlan = (p, at = [0, 0, 0], nose = [1, 0]) => { const l = Math.hypot(nose[0], nose[1]) || 1, nx = nose[0] / l, ny = nose[1] / l; return [at[0] + p[0] * nx - p[1] * ny, at[1] + p[0] * ny + p[1] * nx, (at[2] || 0) + p[2]]; };
  const api = { group: root, anchors, set, holes: anchors.holes, toPlan,
    place(B2T, at, nose = [1, 0]) { root.position.copy(B2T ? B2T(at) : new THREE.Vector3(at[0], at[2] || 0, -at[1])); root.rotation.y = Math.atan2(nose[1], nose[0]); return api; },
    worldAnchors(at, nose) { const out = {}; for (const [k, v] of Object.entries(anchors)) if (Array.isArray(v) && typeof v[0] === 'number') out[k] = toPlan(v, at, nose); out.holes = anchors.holes.map(h => ({ ...h, p: toPlan(h.p, at, nose), n: toPlan(h.n, [0, 0, 0], nose) })); return out; },
    info: { holes: nHoles, openings: holes.length, rings: ringList.length, meshes: 0, tris: 0, kinds: 0, rivets: rivets.length, cabin_wall_holes: holes.filter(h => cabHole(h) && h.b > 30 * D2R && h.b < 152 * D2R && h.a > -5.7 && h.a < -2.4).length, round3_holes: holes.filter(h => h.round3).length } };
  set({}); api.info.meshes = stats.meshes; api.info.tris = stats.tris; api.info.kinds = stats.kinds.size; api.info.kind_names = [...stats.kinds];
  return api;
}
