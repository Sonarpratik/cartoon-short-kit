// SET S4 (stretch builder S4, 2026-11-15, rough board): THE MARKET SQUARE at the foot of the hero's tower, northern Italy about 1765.
// LOCAL plan metres, Z up. Origin = the fountain centre on the paving (so the kit's sun shadow box covers the cast). World place of the origin: SQ (below).
// The landmarks stay where tower_top.js puts them: the hero tower (APEX) is at local [0, -SQ.y], apex 31.5 m above the paving; the rival's white marble
// tower with the gold angel (RIVAL) is at local [59, 300 - SQ.y]. Nothing of tower_top.js is edited or built here; the two towers are drawn again, simply.
// Sides: SOUTH = the arcade house (6 arches, the cast shelters under it), the hero tower rises above its roof. NORTH = houses with a gap where the WHITE ROAD
// leaves for the far hill. EAST and WEST = houses. Stalls flank an aisle north of the fountain. All windows have green shutters that can slam.
// States by film.json places.<name>.state: "noon" (awnings out, goods), "spring" (awnings rolled in, pink blossom tree, wet stone, puddles, drizzle, a pale far
// flash), "night" (lantern points, blue storm, a far branched bolt with a flash on the world, shutters slam shut). Frame keys in places.<name>.s4 (see update).
// Held props for film.json held3d (module "sets/square.js"): buildToothpick, buildFingers, buildBasket, buildHeadBasket.
// Every pow / sqrt / division is guarded. Exaggerated on purpose so it reads from the square: the spear shaft is 0.14 m thick here (0.05 in tower_top.js).
import { APEX, RIVAL, TOWN_Z, SPEAR } from './tower_top.js';
import { buildSpear, buildAngel } from './hero_props.js';
export const SQ = { x: 0, y: 46, z: TOWN_Z };                       // world place of the fountain
export const HERO = [APEX[0] - SQ.x, APEX[1] - SQ.y, APEX[2] - SQ.z];   // local apex of the hero tower: [0, -46, 31.5]
export const FAR = [RIVAL.x - SQ.x, RIVAL.y - SQ.y, RIVAL.base - SQ.z, RIVAL.top - SQ.z];   // local rival tower: x, y, base z, top z
export const INK = '#2a1a1f';
const S_PIG = [];
const rnd = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

// ---------- drawn surface maps (build-out 2026-11-15: no flat one-colour surface). DataTextures, painted once per page, shared by vineyard.js ----------
export const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
export const vn = (x, y, w = 1e9) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), H = (i, j) => hsh(((i % w) + w) % w, ((j % w) + w) % w);
  const a = H(xi, yi), b = H(xi + 1, yi), c = H(xi, yi + 1), d = H(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const TEXC = new Map();
export function texOf(THREE, key, N, paint, alpha = false) { const k = key + N; if (TEXC.has(k)) return TEXC.get(k); const d = new Uint8Array(N * N * 4).fill(255);
  const P = (x, y, c, a = 255) => { const i = ((((y % N) + N) % N) * N + (((x % N) + N) % N)) * 4; d[i] = Math.max(0, Math.min(255, c[0])); d[i + 1] = Math.max(0, Math.min(255, c[1])); d[i + 2] = Math.max(0, Math.min(255, c[2])); d[i + 3] = a; };
  paint(P, N, d); const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8;
  if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; TEXC.set(k, t); return t; }
export function rep(t, x, y) { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; }
const hexC = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], mixC = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u), mul = (a, k) => a.map(v => v * k);
// cobbles: rounded river stones in a Voronoi lay, a tone per stone, dark sand joints, a soft dome light from the top left
export function cobbleTex(THREE) { return texOf(THREE, 'cobble', 256, (P, N) => { const G = 14, C = N / G, pal = ['#efdcb0', '#e2c690', '#d6b47e', '#f2e6c8', '#cdb79a', '#e8cfa2', '#c9a878'].map(hexC), jt = hexC('#8a6c48');
  const pt = (i, j) => { const ii = ((i % G) + G) % G, jj = ((j % G) + G) % G; return [(i + .2 + .6 * hsh(ii, jj)) * C, (j + .2 + .6 * hsh(jj + 7, ii + 3)) * C, ii * 31 + jj]; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const ci = Math.floor(x / C), cj = Math.floor(y / C); let f1 = 1e9, f2 = 1e9, id = 0, cx = 0, cy = 0;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const p = pt(ci + a, cj + b), dd = Math.hypot(x - p[0], y - p[1]); if (dd < f1) { f2 = f1; f1 = dd; id = p[2]; cx = x - p[0]; cy = y - p[1]; } else if (dd < f2) f2 = dd; }
    const e = f2 - f1, base = pal[id % pal.length], dome = 1 + .16 * Math.max(-1, Math.min(1, (-cx - cy) / (C * .6))) - .1 * Math.min(1, f1 / (C * .7)), grit = .93 + .1 * hsh(x * 1.3, y * .7);
    P(x, y, e < 2.2 ? mixC(jt, mul(jt, .75), hsh(x, y)) : e < 3.4 ? mixC(mul(base, .78), base, (e - 2.2) / 1.2) : mul(base, dome * grit)); } }); }
// lime plaster: two scales of blotches, a few worn holes that show the brick under it, hairline cracks, damp at the foot (the wall map spans the whole height)
export function plasterTex(THREE) { return texOf(THREE, 'plaster', 512, (P, N) => { const brick = hexC('#c2643c'), mortar = hexC('#e6d2b0');
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n = .55 * vn(x / 64, y / 64, 8) + .3 * vn(x / 16, y / 16, 32) + .15 * vn(x / 4, y / 4, 128), damp = Math.max(0, (y - N * .8) / (N * .2)), top = Math.max(0, (N * .06 - y) / (N * .06));
    let c = mul([255, 252, 246], .86 + .16 * n - .2 * damp * (.7 + .3 * vn(x / 9, y / 30, 57)) - .08 * top);
    const hole = vn(x / 70 + 3.3, y / 50 + 1.7, 8); if (hole > .8) { const bx = (x + (Math.floor(y / 10) % 2) * 9) % 18, by = y % 10; c = bx < 2 || by < 2 ? mortar : mul(brick, .85 + .3 * hsh(Math.floor((x + (Math.floor(y / 10) % 2) * 9) / 18), Math.floor(y / 10))); if (hole < .82) c = mul([255, 246, 230], .66); }
    P(x, y, c); }
  for (let k = 0; k < 9; k++) { let x = hsh(k, 1) * N, y = hsh(k, 2) * N * .7, a = Math.PI / 2 + (hsh(k, 3) - .5); for (let s = 0; s < 70 + hsh(k, 4) * 90; s++) { P(Math.round(x), Math.round(y), [118, 96, 80]); P(Math.round(x) + 1, Math.round(y), [168, 146, 128]); a += (hsh(k, s) - .5) * .7; x += Math.cos(a); y += Math.sin(a); } } }); }
// cut stone ashlar (brown-stone tower, fountain, sills): staggered blocks, joints, a tone per block, chisel grain
export function ashlarTex(THREE) { return texOf(THREE, 'ashlar', 256, (P, N) => { const CH = 32;
  for (let y = 0; y < N; y++) { const row = Math.floor(y / CH), off = (row % 2) * 40; for (let x = 0; x < N; x++) { const xs = (x + off) % N, bw = 64, col = Math.floor(xs / bw), xx = xs % bw, yy = y % CH, h = hsh(row, col), j = xx < 3 || yy < 3;
    P(x, y, j ? [150, 132, 112] : mul([255, 250, 240], .8 + .2 * h + .06 * vn(x / 5, y / 5, 52) - (xx < 6 || yy < 6 ? .06 : 0))); } } }); }
// roof tiles: rows of half-round coppi, each row's lower lip in shade, a tone per tile
export function tileTex(THREE) { return texOf(THREE, 'tiles', 256, (P, N) => { const RW = 32, TW = 21;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const row = Math.floor(y / RW), yy = y % RW, xs = (x + (row % 2) * 10) % N, col = Math.floor(xs / TW), xx = (xs % TW) / TW, round = Math.sin(Math.PI * xx), h = hsh(row, col);
    P(x, y, mul([255, 255, 255], (.62 + .38 * round) * (.84 + .2 * h) * (yy > RW - 5 ? .62 : 1) * (xx < .06 ? .7 : 1))); } }); }
// planks: vertical boards with grain and dark seams
export function plankTex(THREE) { return texOf(THREE, 'planks', 128, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const b = Math.floor(x / 21), xx = x % 21, g = Math.sin(y * .32 + b * 7 + Math.sin(x * .6 + b) * 2.5) * .5 + .5;
  P(x, y, mul([255, 250, 240], xx < 2 ? .5 : (.78 + .14 * g + .1 * hsh(b, 3)) * (y % 64 === b * 9 % 64 ? .7 : 1))); } }); }
// a soft-edged worn strip (alpha): where feet and wheels polished the stone
export function wornTex(THREE) { return texOf(THREE, 'worn', 128, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = Math.abs(x / N - .5) * 2, a = Math.max(0, 1 - u * u) * (.55 + .45 * vn(x / 9, y / 9, 14)); P(x, y, [255, 255, 255], 255 * Math.min(1, a)); } }); }

// ---------- shared small builders (also used by vineyard.js) ----------
export function kitTools(THREE, scene, ctx) {
  const { B2T, toon } = ctx, V = (x, y, z) => B2T([x, y, z]);
  const add = (geo, mat, name, role, p, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = role; if (p) m.position.copy(p); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, d, h, x, y, z, mat, name, role = 'plaster', parent = scene) => add(new THREE.BoxGeometry(w, h, d), mat, name, role, V(x, y, z + h / 2), parent);
  const cyl = (r0, r1, h, x, y, z, mat, name, role = 'stone', seg = 14, parent = scene) => add(new THREE.CylinderGeometry(r1, r0, h, seg), mat, name, role, V(x, y, z + h / 2), parent);
  const bar = (a, b, r, mat, name, role = 'wood', parent = scene, r2 = r) => { const A = V(...a), Bv = V(...b), d = Bv.clone().sub(A), L = Math.max(d.length(), 1e-4), m = add(new THREE.CylinderGeometry(r2, r, L, 8), mat, name, role, A.clone().addScaledVector(d, .5), parent); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return m; };
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
  // v2 (2026-11-15, kit3d): relief surfaces and PBR metal; with kit3d off they fall back to the toon colour
  const relief = (k, c, o = {}) => (typeof ctx.relief === 'function') ? ctx.relief(k, c, o) : toon(c);
  const metal = (k, o = {}) => (ctx.pbr && typeof ctx.pbr.metal === 'function') ? ctx.pbr.metal(k, o) : toon(o.toon || o.color || '#4f5880');
  // a wet copy of a relief material: same colour and normal map, a Phong shine (rain on stone)
  const wetOf = (r, o = {}) => { if (!r.normalMap) return r; const m = new THREE.MeshPhongMaterial({ map: r.map, normalMap: r.normalMap, normalScale: r.normalScale.clone(), shininess: 70, ...o }); m.userData.k3scale = r.userData.k3scale; return m; };
  return { V, add, box, cyl, bar, basic, toon, relief, metal, wetOf, ctx };
}
// rain: slanted streaks round the cast, big see-through sheets at several depths, and splash rings on the ground. amount 0..1.
export function buildRain(THREE, scene, T, o = {}) {
  const { V, basic } = T, R0 = rnd(o.seed || 11), n = o.n || 1800, box = o.box || [-14, 14, -16, 30, 9], col = o.color || '#e8f4ff', g = new THREE.Group(); g.name = 'rain'; scene.add(g);
  const geo = new THREE.PlaneGeometry(.022, o.len || .9), mat = basic(col, { transparent: true, opacity: o.opacity ?? .5, depthWrite: false, side: THREE.DoubleSide }), inst = new THREE.InstancedMesh(geo, mat, n); inst.name = 'rain_streaks_haze'; inst.frustumCulled = false; inst.castShadow = false;
  const P = []; for (let i = 0; i < n; i++) P.push([box[0] + (box[1] - box[0]) * R0(), box[2] + (box[3] - box[2]) * R0(), box[4] * R0(), R0()]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), o.slant ?? .18), sc = new THREE.Vector3(1, 1, 1);
  g.add(inst);
  // sheets: canvas of streaks on big planes
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 512; const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 256, 512); c2.strokeStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 220; i++) { const x = R0() * 256, y = R0() * 512, l = 30 + R0() * 70; c2.lineWidth = .6 + R0() * 1.4; c2.globalAlpha = .25 + R0() * .6; c2.beginPath(); c2.moveTo(x, y); c2.lineTo(x - l * .2, y + l); c2.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; const sheets = [];
  for (const [d, w, h, op] of (o.sheets || [[7, 30, 14, .28], [14, 50, 20, .34], [26, 90, 30, .4], [48, 160, 46, .46]])) { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / 7, h / 9);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, color: col, transparent: true, opacity: op * (o.sheet_gain ?? 1), depthWrite: false, side: THREE.DoubleSide, fog: false })); m.name = 'rain_sheet_haze'; m.userData.noExport = true; m.userData.d = d; m.userData.h = h; g.add(m); sheets.push(m); }
  // splashes: flat rings on the ground
  const ns = o.splashes || 260, ring = new THREE.InstancedMesh(new THREE.RingGeometry(.6, 1, 14), basic('#ffffff', { transparent: true, opacity: .6, depthWrite: false, side: THREE.DoubleSide }), ns); ring.name = 'rain_splash_haze'; ring.frustumCulled = false; g.add(ring);
  const S = []; for (let i = 0; i < ns; i++) S.push([box[0] + (box[1] - box[0]) * R0(), box[2] + (box[3] - box[2]) * R0(), R0()]);
  const qf = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), gz = o.ground || 0;
  const update = (f, R) => { const cam = R && R.camera;
    for (let i = 0; i < n; i++) { const p = P[i], z = (((p[2] - f * .42 - p[3] * 3) % box[4]) + box[4]) % box[4]; m4.compose(V(p[0], p[1], z + gz), cam ? cam.quaternion.clone().multiply(q) : q, sc); inst.setMatrixAt(i, m4); } inst.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < ns; i++) { const s = S[i], u = (((f / 9 + s[2]) % 1) + 1) % 1, r = .05 + .16 * u; m4.compose(V(s[0], s[1], gz + .02), qf, new THREE.Vector3(r, r, r)); ring.setMatrixAt(i, m4); } ring.instanceMatrix.needsUpdate = true;
    if (cam) { const fw = new THREE.Vector3(); cam.getWorldDirection(fw); fw.y = 0; if (fw.lengthSq() < 1e-6) fw.set(0, 0, -1); fw.normalize(); for (const m of sheets) { m.position.copy(cam.position).addScaledVector(fw, m.userData.d); m.position.y = V(0, 0, gz).y + m.userData.h / 2 - 1; m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fw.clone().negate()); m.material.map.offset.y = f * .035; } } };
  return { group: g, update };
}
// a lightning bolt: a jagged main channel with forks, a bright core inside a soft additive sleeve, a glow at the foot. Never loose spaghetti: one trunk, forks leave it downward.
export function buildBolt(THREE, scene, T, from, to, o = {}) {
  const { V } = T, R0 = rnd(o.seed || 5), g = new THREE.Group(); g.name = 'bolt_glow'; g.userData.noExport = true; scene.add(g);
  const core = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 1 }), sleeve = new THREE.MeshBasicMaterial({ color: o.color || '#9fd0ff', transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const seg = (a, b, r) => { for (const [mat, k, nm] of [[core, 1, 'bolt_core_glow'], [sleeve, 3.4, 'bolt_sleeve_glow']]) { const A = V(...a), Bv = V(...b), d = Bv.clone().sub(A), L = Math.max(d.length(), 1e-4), m = new THREE.Mesh(new THREE.CylinderGeometry(r * k, r * k, L, 6), mat); m.name = nm; m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); m.renderOrder = 6; g.add(m); } };
  const path = (a, b, n, jit, r, fork) => { let p = a.slice(); for (let i = 1; i <= n; i++) { const u = i / n, q = [a[0] + (b[0] - a[0]) * u + (i < n ? (R0() - .5) * jit : 0), a[1] + (b[1] - a[1]) * u + (i < n ? (R0() - .5) * jit : 0), a[2] + (b[2] - a[2]) * u]; seg(p, q, r * (1 - .35 * u));
      if (fork && i > 1 && i < n - 1 && R0() < .5) { const L = (a[2] - b[2]) * (.12 + .16 * R0()), e = [q[0] + (R0() - .5) * L * 1.6, q[1] + (R0() - .5) * L * 1.6, q[2] - L]; path(q, e, 3, jit * .4, r * .45, false); } p = q; } };
  path(from, to, o.n || 9, o.jit ?? (Math.abs(from[2] - to[2]) * .09), o.r || .35, true);
  const tx = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(210,235,255,.7)'); gr.addColorStop(1, 'rgba(160,200,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glow = (p, s, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: op, transparent: true })); sp.name = 'bolt_foot_glow'; sp.renderOrder = 6; sp.position.copy(V(...p)); sp.scale.setScalar(s); g.add(sp); return sp; };
  glow(to, o.foot || 16, 1); glow(from, o.head || 40, .8);
  return g;
}
export function glowSprite(THREE, color = '#ffffff') { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); sp.name = 'glow_sprite'; sp.userData.noExport = true; return sp; }
// the two towers as seen from the ground, at their world places (local point p = apex or base)
export function buildHeroTower(THREE, scene, T, at) {
  const { V, add, box, basic } = T, [x, y, z] = at, g = new THREE.Group(); g.name = 'hero_tower_far'; scene.add(g), T.toon;
  const st = T.relief('stone', '#c98a4e', { size: 2.0, seed: 21 }), stD = T.relief('stone', '#a86a3a', { size: 1.6, seed: 22 }), stone = T.relief('stone', '#ecdcc0', { size: 1.6, seed: 23 });
  box(3.15, 3.15, z - 5.4 + 3, x, y, -3, st, 'hero_shaft', 'stone', g); for (const h of [8, 15, 22]) box(3.3, 3.3, .3, x, y, h, stD, 'hero_shaft_band', 'stone', g);
  for (const h of [4, 11, 18]) box(.5, .1, 1.2, x, y + 1.6, h, basic('#3a2a30'), 'hero_slit_window', 'stone', g);
  box(3.4, 3.4, .5, x, y, z - 5.4, stone, 'hero_belfry_sill', 'stone', g);
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) box(.75, .75, 3.1, x + sx * 1.2, y + sy * 1.2, z - 4.4, st, 'hero_belfry_pier', 'stone', g);
  box(1.6, 1.6, 2.9, x, y, z - 4.3, basic('#3a2a30'), 'hero_belfry_dark', 'stone', g);
  { const pts = [[.05, 0], [.3, .1], [.42, .5], [.62, .85]].map(([r, yy]) => new THREE.Vector2(r, -yy)), b = add(new THREE.LatheGeometry(pts, 20), T.metal('bronze', { seed: 5, toon: '#c98a2e' }), 'hero_bell', 'metal', V(x, y + 1.15, z - 2.3), g); b.material.side = THREE.DoubleSide; }
  box(3.7, 3.7, .45, x, y, z - 1.4, stone, 'hero_cornice', 'stone', g);
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) box(.62, .62, .62, x + sx * 1.55, y + sy * 1.55, z - .95, stone, 'hero_corner_finial', 'stone', g);   // a stone ball-finial base at each corner of the cornice
  const roof = add(new THREE.ConeGeometry(1.9 * Math.SQRT2 * 1.06, .95, 4, 1), T.relief('tile', '#e0602a', { size: 1.8, seed: 24 }), 'hero_roof', 'roof', V(x, y, z - .48), g); roof.rotation.y = Math.PI / 4;
  // THE SPEAR (hero_props.js, far version) on the roof peak, exaggerated x2.4 so it reads from the square; iron with the place's sky in it, the cold glint at the tip
  const sp = buildSpear(THREE, T.ctx, { far: true, glintSize: .2 }); sp.group.scale.setScalar(2.4); sp.group.position.copy(V(x, y, z - .06)); g.add(sp.group);
  sp.group.traverse(o => { if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = (o.material.envMapIntensity || 1) * .45; /* the kit's studio strips are HDR: at full strength the blade bloomed into a halo three towers wide */ });
  return { group: g, glint: sp.glint || glowSprite(THREE, '#bfe6ff'), spear: sp, gs: 2.4 };
}
export function buildRivalTower(THREE, scene, T, at, fog = false) {
  const { V, add, basic } = T, [x, y, zb, zt] = at, H = zt - zb, rt = new THREE.Group(); rt.name = 'rival_tower_far'; rt.position.copy(V(x, y, zb)); scene.add(rt);
  const fo = m => (m.fog = fog, m), marble = fo(T.relief('stone', '#fffaf2', { size: 2.4, seed: 31 })), sh = fo(T.relief('stone', '#e2d8f4', { size: 2.0, seed: 32 })), dark = basic('#4a3a5a', { fog });
  const A = (geo, mat, name, p) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = 'stone'; m.position.set(...p); rt.add(m); return m; };
  A(new THREE.BoxGeometry(11, H * .68, 11), marble, 'rival_shaft', [0, H * .34, 0]); for (const f of [.2, .4, .58]) A(new THREE.BoxGeometry(11.3, .9, 11.3), sh, 'rival_band', [0, H * f, 0]);
  A(new THREE.BoxGeometry(11.8, 1.4, 11.8), marble, 'rival_cornice', [0, H * .685, 0]); A(new THREE.BoxGeometry(9, H * .14, 9), marble, 'rival_belfry', [0, H * .765, 0]);
  for (const s of [-2.2, 2.2]) for (const zz of [4.55, -4.55]) A(new THREE.BoxGeometry(2.2, H * .095, .2), dark, 'rival_belfry_arch', [s, H * .76, zz]);
  A(new THREE.BoxGeometry(10.6, 1.2, 10.6), sh, 'rival_cornice_top', [0, H * .84, 0]); A(new THREE.ConeGeometry(6.2, H * .1, 4, 1), fo(T.relief('wood', '#b9824a', { scale: 2.5, seed: 33 })), 'rival_wooden_roof', [0, H * .895, 0]).rotation.y = Math.PI / 4;
  for (const s of [-1, 1]) for (const zz of [4.55, -4.55]) A(new THREE.BoxGeometry(.8, H * .1, .8), marble, 'rival_belfry_pilaster', [s * 4.1, H * .765, zz]);
  // THE GOLD ANGEL (hero_props.js), x2.4 so it reads at 260 m: gilt with the sky in it, trumpet toward +X, facing the hero hill
  const an = buildAngel(THREE, T.ctx, {}); an.group.name = 'rival_gold_angel'; an.group.position.set(0, H * .945, 0); an.group.scale.setScalar(2.4); rt.add(an.group);
  an.group.traverse(o => { if (o.isMesh && o.material) { if (!fog) o.material.fog = false; if (o.material.emissive && o.material.metalness !== undefined) { o.material.emissive.set('#b07818'); o.material.emissiveIntensity = .45; } } });   // gilt reads warm at 260 m even when the env sky is dull
  rt.userData.angel = an; return rt;
}
// ---------- held props (film.json held3d). Local +Y runs up the thing; grip = where the fist closes ----------
export function buildToothpick(THREE, o = {}) {      // one green olive on a wooden pick: shaft below = the tower, olive = belfry and roof, the short point above = the spear
  const g = new THREE.Group(); g.name = 'olive_on_toothpick'; const B = c => new THREE.MeshBasicMaterial({ color: c }), A = (geo, mat, n, p, s) => { const m = new THREE.Mesh(geo, mat); m.name = n; m.position.set(...p); if (s) m.scale.set(...s); g.add(m); return m; };
  A(new THREE.CylinderGeometry(.006, .008, .2, 8), B('#e8c98a'), 'pick_shaft', [0, .1, 0]); A(new THREE.CylinderGeometry(.0085, .0085, .2, 8), B(INK), 'pick_shaft_ink', [0, .1, -.004]);
  A(new THREE.ConeGeometry(.006, .05, 8), B('#e8c98a'), 'pick_point', [0, .262, 0]); A(new THREE.ConeGeometry(.0085, .058, 8), B(INK), 'pick_point_ink', [0, .262, -.004]);
  A(new THREE.SphereGeometry(.034, 18, 14), B(INK), 'olive_ink', [0, .2, -.006], [1, 1.22, 1]); A(new THREE.SphereGeometry(.03, 18, 14), B('#86a82a'), 'olive', [0, .2, 0], [1, 1.22, 1]);
  A(new THREE.SphereGeometry(.012, 10, 8), B('#d8362a'), 'olive_pimento', [0, .232, .012]); A(new THREE.SphereGeometry(.008, 8, 6), B('#e6f2a0'), 'olive_shine', [-.012, .214, .026]);
  return { group: g, grip: new THREE.Vector3(0, .02, 0), tip: new THREE.Vector3(0, .285, 0) };
}
export function buildFingers(THREE, o = {}) {        // the kit's ink finger strokes (poses.mjs "finger"), n of them fanned from the round fist: a count the lens can read
  const n = o.n || 5, L = o.len || .1, r = o.r || .017, g = new THREE.Group(); g.name = 'count_fingers_' + n; const ink = new THREE.MeshBasicMaterial({ color: INK }), cap = new THREE.CapsuleGeometry(r, L, 4, 10);
  const angs = n === 1 ? [0] : Array.from({ length: n }, (_, i) => (-1 + 2 * i / (n - 1)) * (o.spread || .78));
  angs.forEach((a, i) => { const m = new THREE.Mesh(cap, ink); m.name = 'count_finger'; const len = L * (n > 1 && (i === 0 || i === n - 1) ? .8 : 1), d = .035 + len / 2 + r; m.scale.y = len / L; m.position.set(Math.sin(a) * d, Math.cos(a) * d, 0); m.rotation.z = -a; g.add(m);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r * .42, 8, 6), new THREE.MeshBasicMaterial({ color: '#6a5a66' })); s.name = 'count_finger_shine'; s.position.set(Math.sin(a) * (d + len * .3) - r * .3, Math.cos(a) * (d + len * .3), r * .8); g.add(s); });
  return { group: g, grip: new THREE.Vector3(0, 0, 0), tip: new THREE.Vector3(0, .05 + L, 0) };
}
function basketBody(THREE, g, toon, fill, y0 = 0) { const B = c => new THREE.MeshBasicMaterial({ color: c }), pts = [[.1, 0], [.17, .02], [.22, .12], [.25, .24]].map(([r, y]) => new THREE.Vector2(r, y));
  const b = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), toon('#d9a04a', { side: THREE.DoubleSide })); b.name = 'basket_weave'; b.position.y = y0; g.add(b);
  for (const y of [.06, .13, .2]) { const t = new THREE.Mesh(new THREE.TorusGeometry(.19 + y * .25, .009, 6, 20), toon('#a86a2a')); t.name = 'basket_band'; t.rotation.x = Math.PI / 2; t.position.y = y0 + y; g.add(t); }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.25, .018, 8, 22), toon('#b9792e')); rim.name = 'basket_rim'; rim.rotation.x = Math.PI / 2; rim.position.y = y0 + .24; g.add(rim);
  const cols = { grapes: ['#6a2a8a', '#8a3aa8', '#52206e'], bread: ['#e0a04a', '#c9853a'], eggs: ['#fff6e6', '#f2e2c8'], olives: ['#86a82a', '#5a7a1e'], oranges: ['#ff8a1e', '#f2701a'], cloth: ['#c8372f', '#2f6fb8', '#e2a93b'] }[fill || 'bread'];
  for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = i < 6 ? .13 : .05, s = new THREE.Mesh(new THREE.SphereGeometry(fill === 'grapes' ? .05 : .065, 10, 8), B(cols[i % cols.length])); s.name = 'basket_' + (fill || 'bread'); s.position.set(Math.cos(a) * rr, y0 + .25 + (i < 6 ? 0 : .05), Math.sin(a) * rr); if (fill === 'bread') s.scale.set(1.5, .8, .9); g.add(s); } }
export function buildBasket(THREE, o = {}) {         // a market basket hanging from its hoop handle
  const g = new THREE.Group(); g.name = 'market_basket'; const toon = o.toon || (c => new THREE.MeshLambertMaterial({ color: c }));
  basketBody(THREE, g, toon, o.fill, -.52); const h = new THREE.Mesh(new THREE.TorusGeometry(.24, .014, 6, 20, Math.PI), toon('#a86a2a')); h.name = 'basket_handle'; h.position.y = -.28; g.add(h);
  return { group: g, grip: new THREE.Vector3(0, -.04, 0), tip: new THREE.Vector3(0, -.52, 0) };
}
export function buildHeadBasket(THREE, o = {}) {     // a grape basket that sits on the head; the fist steadies its foot
  const g = new THREE.Group(); g.name = 'grape_basket_on_head'; const toon = o.toon || (c => new THREE.MeshLambertMaterial({ color: c }));
  basketBody(THREE, g, toon, o.fill || 'grapes', .0); const leaf = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#4c9a2e' })); leaf.name = 'basket_vine_leaf'; leaf.scale.set(1.3, .25, 1); leaf.position.set(.12, .33, .08); g.add(leaf);
  return { group: g, grip: new THREE.Vector3(o.gx ?? 0, .03, .0), tip: new THREE.Vector3(0, .3, 0) };
}

// ---------- THE SQUARE ----------
export async function build(THREE, scene, film, ctx) {
  const T = kitTools(THREE, scene, ctx), { V, add, box, cyl, bar, basic, toon, relief: RL, metal: MT, wetOf } = T, pl = ctx.place || {}, state = pl.state || 'noon', K = pl.s4 || {}, R0 = rnd(23), rr = (a, b) => a + (b - a) * R0();
  const night = state === 'night', spring = state === 'spring', wet = spring || night;
  // v2 (2026-11-15, kit3d): every stone, plaster, tile and wood surface is ctx.relief (a colour map with cavities + a normal map at a texel density that reads on a phone), every metal is ctx.pbr.metal
  const WT = m => wet ? wetOf(m, { shininess: 55, specular: night ? '#5a68b0' : '#7a9a90' }) : m;
  const M = { wallY: toon('#f4c542'), wallO: toon('#f2a65a'), wallC: toon('#f9dc8a'), wallP: toon('#eeb04e'), roof: RL('tile', '#e0602a', { size: 1.8, seed: 2 }), roofD: RL('tile', '#c9491c', { size: 1.8, seed: 3 }),
    stone: WT(RL('stone', '#ece4d2', { size: 1.6, seed: 4 })), stoneD: WT(RL('stone', '#cfc4ae', { size: 1.6, seed: 5 })), wood: RL('wood', '#a8703a', { scale: 1.2, seed: 6 }), woodD: RL('wood', '#7a4a26', { scale: 1.2, seed: 7 }), green: RL('wood', '#2f8a4e', { scale: .8, seed: 8 }), greenD: RL('wood', '#236a3e', { scale: .8, seed: 9 }),
    dark: basic(night ? '#141833' : '#4a3040'), water: MT('wet', { color: night ? '#5a78d0' : spring ? '#5aa8b8' : '#3a9ad8', rough: .04, env: 1.3, toon: '#3aa0d8' }), red: toon('#d8372f'), white: toon('#fbf6ee'), road: RL('mud', night ? '#cfd6f2' : '#f6ead0', { scale: 4, seed: 10 }) };
  const TX = { plaster: plasterTex(THREE), cobble: cobbleTex(THREE), ashlar: ashlarTex(THREE), tiles: tileTex(THREE), planks: plankTex(THREE), worn: wornTex(THREE) };
  Object.assign(M, { roofT: M.roof, roofDT: M.roofD, stoneQ: WT(RL('stone', '#f2ead8', { size: 1.6, seed: 11 })), plinth: WT(RL('stone', '#b8a888', { size: 2.0, seed: 12 })),
    iron: MT('iron', { seed: 13, toon: '#2a2e48' }), brass: MT('brass', { seed: 14, toon: '#c9a040' }), bronze: MT('bronze', { seed: 15, toon: '#7a6a3a' }), terra: RL('plaster', '#c9622e', { scale: .5, seed: 16 }), terraD: toon('#9a4422'), planks: RL('wood', '#a8703a', { scale: 1.0, seed: 17 }), leaf: toon('#3f8a2e'), flowerR: toon('#e8323a'), flowerP: toon('#ff6fa8') });
  // a hand-painted sign board (1-4 words, Italian of the time), a terracotta pot with geraniums
  const sign = (text, w, h, ink = '#2f6f2a') => { const c = document.createElement('canvas'); c.width = 512; c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#f6e7c0'; x.fillRect(0, 0, 512, 200); x.strokeStyle = '#a8401a'; x.lineWidth = 12; x.strokeRect(10, 10, 492, 180);
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(120,80,40,${.04 + .05 * hsh(k, 9)})`; x.fillRect(hsh(k, 1) * 512, hsh(k, 2) * 200, 30 + 60 * hsh(k, 3), 3 + 6 * hsh(k, 4)); } x.fillStyle = ink;
    const fs = Math.min(150, 760 / Math.max(3, text.length)); [...text].forEach((ch, i) => { x.save(); x.translate(60 + i * (392 / Math.max(1, text.length - 1)), 108 + (i % 2 ? 6 : -5)); x.rotate((i % 2 ? .06 : -.05)); x.font = `bold ${fs + (i % 3) * 6}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 0, 0); x.restore(); });
    if (text === 'OLIVE') { x.fillStyle = '#86a82a'; x.beginPath(); x.ellipse(468, 44, 16, 22, .4, 0, 7); x.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); };
  const pot = (parent, x, y, z, s = 1) => { const p = new THREE.Group(); p.name = 'flower_pot'; p.position.set(x, y, z); p.scale.setScalar(s); parent.add(p); const A = (geo, mat, n, px, py, pz, sy = 1) => { const m = new THREE.Mesh(geo, mat); m.name = n; m.userData.role = 'foliage'; m.position.set(px, py, pz); m.scale.y = sy; m.castShadow = true; p.add(m); return m; };
    A(new THREE.CylinderGeometry(.16, .11, .26, 10), M.terra, 'pot_terracotta', 0, .13, 0); A(new THREE.TorusGeometry(.16, .025, 6, 14), M.terraD, 'pot_rim', 0, .26, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) A(new THREE.SphereGeometry(.1, 7, 5), M.leaf, 'geranium_leaves', Math.cos(i * 1.3) * .09, .33, Math.sin(i * 1.3) * .09, .7); for (let i = 0; i < 4; i++) A(new THREE.SphereGeometry(.055, 7, 5), (i + Math.round(x * 3)) % 3 ? M.flowerR : M.flowerP, 'geranium_flower', Math.cos(i * 1.7) * .1, .43, Math.sin(i * 1.7) * .1); return p; };
  // the kit sky stays (light_over top / hor); fog pushed back so both towers read
  scene.fog = new THREE.Fog(scene.fog ? scene.fog.color : '#cfe0ff', 90, night ? 900 : 700);
  // ground: grass under everything, paving with bands, the white road north to the far hill
  add(new THREE.CircleGeometry(700, 40), RL('grass', night ? '#2f5a72' : spring ? '#4fa24a' : '#6fae3e', { scale: 8, seed: 18 }), 'valley_ground', 'ground', V(0, 60, -.08)).rotation.x = -Math.PI / 2;
  { // COBBLES: rounded setts in dark joints (ctx.relief cobble, about 15 cm stones, real normal relief); wet = a shine on them. Granite guide strips in a grid, the drain down the aisle, worn paths, market litter
    const cr = RL('cobble', night ? '#9aa4e0' : spring ? '#b8d0c0' : '#efd6a2', { size: 1.8, seed: 19 }), pm = wet ? wetOf(cr, { shininess: 75, specular: night ? '#6a78c8' : '#8ab0a0' }) : cr;
    box(34, 40, .1, 0, 3, -.1, pm, 'square_cobbles', 'ground');
    const gs = WT(RL('stone', night ? '#a8b0e0' : spring ? '#c8d6c4' : '#f6ecd6', { size: 1.4, seed: 20 })); for (let i = -3; i <= 3; i++) { if (i !== 0) box(34, .34, .014, 0, 5 + i * 4.6, 0, gs, 'granite_strip', 'ground'); box(.34, 34, .016, i * 4.6 + (i === 0 ? 2.3 : 0), 5, .001, gs, 'granite_strip', 'ground'); }
    // the drain: a stone channel from the fountain's overflow north along the aisle to an iron grate by the road
    box(.42, 17, .02, 0, 10.4, .0, basic(night ? '#1c2040' : '#4a3c2e'), 'drain_channel', 'ground'); for (const s of [-1, 1]) box(.14, 17, .045, s * .28, 10.4, 0, M.stoneD, 'drain_kerb', 'stone');
    if (wet) { const w2 = box(.3, 17, .01, 0, 10.4, .021, basic(night ? '#7f94f2' : '#bfe8e0', { transparent: true, opacity: .75 }), 'drain_water', 'water'); w2.castShadow = false; }
    box(.9, .9, .02, 0, 19.4, .0, basic('#1a1a22'), 'drain_grate_hole', 'ground'); for (let i = 0; i < 7; i++) box(.05, .9, .04, -.39 + i * .13, 19.4, .0, M.iron, 'drain_grate_bar', 'metal'); box(1.0, .1, .05, 0, 18.95, 0, M.iron, 'drain_grate_frame', 'metal'); box(1.0, .1, .05, 0, 19.85, 0, M.iron, 'drain_grate_frame', 'metal');
    for (const s of [-1, 1]) box(.1, 1.0, .05, s * .5, 19.4, 0, M.iron, 'drain_grate_frame', 'metal'); for (let i = 0; i < 12; i++) box(.44, .05, .035, 0, 15.2 + i * .1, .0, M.iron, 'drain_cross_grate', 'metal');   // iron frame round the grate, small cross grates along the channel
    // worn paths: arcade -> fountain -> road gap, and along the stalls (polished paler stone)
    const wm = new THREE.MeshBasicMaterial({ color: night ? '#b8c2f2' : spring ? '#e2f2e4' : '#fff4dc', map: rep(TX.worn, 1, 6), transparent: true, opacity: wet ? .32 : .42, depthWrite: false });
    for (const [a, b, wd] of [[[-1.5, -10.5], [-.4, -2.2], 2.4], [[1.6, 1.8], [5.8, 21], 2.8], [[-2.6, 2], [-2.4, 11], 1.6], [[2.4, 2], [2.6, 11], 1.6], [[-12, -3], [-2.4, -1], 1.8]]) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), m = add(new THREE.PlaneGeometry(wd, L), wm, 'worn_path', 'ground', V(a[0] + dx / 2, a[1] + dy / 2, .006)); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(dx, dy); m.castShadow = false; }
    // litter: straw from the crates, cabbage leaves, olive pits, orange peel, a lost ribbon, feathers by the hen crate
    const straw = new THREE.InstancedMesh(new THREE.BoxGeometry(.012, .002, .16), toon('#e8c45a'), 420), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e3 = new THREE.Euler(); straw.name = 'litter_straw'; straw.userData.role = 'foliage';
    for (let i = 0; i < 420; i++) { const cx = [-4.3, -4.6, 4.3, 4.7, -9, 9.5, 0][i % 7], cy = [7.4, 2.9, 7.6, 3.0, 12, 11.5, 15][i % 7], r = Math.sqrt(R0()) * 2.2, a = R0() * 6.28; qq.setFromEuler(e3.set(0, R0() * 6.28, 0)); m4.compose(V(cx + Math.cos(a) * r, cy + Math.sin(a) * r, .004), qq, new THREE.Vector3(1, 1, .6 + R0())); straw.setMatrixAt(i, m4); }
    straw.receiveShadow = true; scene.add(straw);
    for (let i = 0; i < 22; i++) { const m = add(new THREE.SphereGeometry(.13, 8, 5), toon(['#7fbf4a', '#a8d06a', '#5f9a3a'][i % 3]), 'litter_cabbage_leaf', 'foliage', V(rr(-6.5, 6.5), rr(1, 11), .012)); m.scale.set(1, .08, rr(.6, 1)); m.rotation.y = R0() * 6; }
    for (let i = 0; i < 30; i++) add(new THREE.SphereGeometry(.022, 6, 4), toon('#5a4a2a'), 'litter_olive_pit', 'foliage', V(4.3 + rr(-1.6, 1.6), 7.6 + rr(-1.8, 1.8), .01)).scale.set(1, .6, 1.3);
    for (let i = 0; i < 6; i++) { const m = add(new THREE.SphereGeometry(.05, 8, 5, 0, 6.28, 0, 1.4), toon('#ff8a1e', { side: THREE.DoubleSide }), 'litter_orange_peel', 'foliage', V(rr(-2, 3), rr(3, 10), .02)); m.rotation.x = Math.PI; }
    for (let i = 0; i < 12; i++) add(new THREE.SphereGeometry(.03, 5, 4), basic('#fbf6ee'), 'litter_feather', 'cloth', V(-4.6 + rr(-.8, .8), 3.9 + rr(-.5, .7), .01)).scale.set(.4, .15, 1.4);
    { const m = box(.05, .9, .006, -1.2, 6.2, 0, M.red, 'litter_ribbon', 'cloth'); m.rotation.y = .7; } }
  const roadTo = [FAR[0] - 6, FAR[1] - 40]; { const a = [6, 21], dx = roadTo[0] - a[0], dy = roadTo[1] - a[1], L = Math.hypot(dx, dy), m = box(5.2, L, .06, a[0] + dx / 2, a[1] + dy / 2, -.05, M.road, 'white_road', 'ground'); m.rotation.y = -Math.atan2(dx, dy); m.receiveShadow = true; }
  // ----- houses: local group (X = along the front, Y up, +Z = out of the front), turned to its side of the square -----
  const shutters = [], lamps = [], laundry = [];
  const house = (cx, cy, rot, w, d, h, wall, o = {}) => { const g = new THREE.Group(); g.name = 'house'; g.position.copy(V(cx, cy, 0)); g.rotation.y = rot; scene.add(g);
    const P = (geo, mat, name, role, x, y, z) => add(geo, mat, name, role, new THREE.Vector3(x, y, z), g);
    const near = !!o.near, wm = RL('plaster', '#' + wall.color.getHexString(), { scale: 2.6, seed: 40 + Math.round(cx * 7 + cy) % 3 });
    P(new THREE.BoxGeometry(w, h, d), wm, 'house_wall', 'plaster', 0, h / 2, -d / 2); P(new THREE.BoxGeometry(w + .5, .3, d + .6), M.stone, 'house_eave', 'stone', 0, h + .1, -d / 2);
    const rf = P(new THREE.CylinderGeometry(.01, d * .62, 1.5, 4, 1), o.roofD ? M.roofDT : M.roofT, 'house_roof', 'roof', 0, h + .95, -d / 2); rf.rotation.y = Math.PI / 4; rf.scale.set(w / (d * .62 * Math.SQRT2) * 1.03, 1, 1.18);
    if (near) {   // the square's own houses: corner stones, a plinth, a string course, eave brackets, stone window frames, pots, a balcony, a wall lantern
      for (const sx of [-1, 1]) for (let k = 0, z = 0; z < h - .3; k++) { const hh = .42 + .1 * hsh(k, sx + 5), ww = k % 2 ? .48 : .78; P(new THREE.BoxGeometry(ww, hh - .04, .1), M.stoneQ, 'corner_stone', 'stone', sx * (w / 2 - ww / 2 + .02), z + hh / 2, .05); z += hh; }
      P(new THREE.BoxGeometry(w + .04, .62, .12), M.plinth, 'wall_plinth', 'stone', 0, .31, .06); P(new THREE.BoxGeometry(w + .06, .16, .2), M.stone, 'string_course', 'stone', 0, (o.arcade ? 4.45 : 2.85), .1);
      for (let i = 0; i < Math.floor(w / .9); i++) P(new THREE.BoxGeometry(.12, .16, .34), M.woodD, 'eave_bracket', 'wood', -w / 2 + .45 + i * .9, h - .05, .17);
      if (!o.arcade && o.balcony !== false && w > 8) { const bx = o.balcony ?? 0, by = 4.2; P(new THREE.BoxGeometry(2.4, .14, .8), M.stone, 'balcony_slab', 'stone', bx, by, .4); for (const s of [-1, 1]) P(new THREE.BoxGeometry(.14, .3, .7), M.stoneD, 'balcony_corbel', 'stone', bx + s * .9, by - .2, .35);
        P(new THREE.BoxGeometry(2.4, .04, .04), M.iron, 'balcony_rail', 'metal', bx, by + .95, .78); P(new THREE.BoxGeometry(2.4, .04, .04), M.iron, 'balcony_rail_low', 'metal', bx, by + .2, .78); for (let i = 0; i <= 12; i++) P(new THREE.BoxGeometry(.022, .8, .022), M.iron, 'balcony_baluster', 'metal', bx - 1.18 + i * .197, by + .55, .78);
        for (const s of [-.75, .1, .8]) pot(g, bx + s, by + .07, .5, .75); }
      if (o.lamp !== false) { const lx = (o.lampX ?? w / 2 - 1.1); P(new THREE.BoxGeometry(.04, .04, .5), M.iron, 'wall_lamp_bracket', 'metal', lx, 3.6, .25); P(new THREE.BoxGeometry(.24, .02, .02), M.iron, 'wall_lamp_brace', 'metal', lx, 3.55, .14).rotation.z = .6;
        for (const [ax, az] of [[-.08, .4], [.08, .4], [-.08, .56], [.08, .56]]) P(new THREE.BoxGeometry(.018, .26, .018), M.iron, 'wall_lamp_frame', 'metal', lx + ax, 3.42, az); P(new THREE.ConeGeometry(.15, .12, 4), M.iron, 'wall_lamp_roof', 'metal', lx, 3.61, .48).rotation.y = Math.PI / 4; P(new THREE.BoxGeometry(.2, .025, .2), M.iron, 'wall_lamp_base', 'metal', lx, 3.28, .48); const gl = P(new THREE.SphereGeometry(.07, 8, 6), basic(night ? '#ffd27a' : '#f2e2b0'), 'wall_lamp_globe', 'lamp', lx, 3.42, .48); gl.castShadow = false;
        if (night) { const sp = glowSprite(THREE, '#ffb347'); sp.scale.setScalar(1.3); sp.position.set(lx, 3.42, .55); g.add(sp); } }
      if (o.sign) { const s = sign(o.sign[0], o.sign[1], o.sign[2], o.sign[3]), sx = o.sign[4] ?? 0, sy = o.sign[5] ?? 2.75; s.name = 'house_sign_' + o.sign[0]; s.position.set(sx, sy, .09); g.add(s);
        // the iron sign bracket: a forged arm over the board with a scroll, two hooks down to the board, four corner studs
        P(new THREE.BoxGeometry(o.sign[1] + .3, .04, .04), M.iron, 'sign_bracket_arm', 'metal', sx, sy + o.sign[2] / 2 + .14, .12); for (const e of [-1, 1]) { P(new THREE.BoxGeometry(.03, .14, .03), M.iron, 'sign_bracket_hook', 'metal', sx + e * o.sign[1] * .4, sy + o.sign[2] / 2 + .07, .1);
          P(new THREE.TorusGeometry(.08, .014, 5, 12, Math.PI * 1.5), M.iron, 'sign_bracket_scroll', 'metal', sx + e * (o.sign[1] / 2 + .1), sy + o.sign[2] / 2 + .06, .12); for (const v of [-1, 1]) P(new THREE.SphereGeometry(.022, 8, 6), M.iron, 'sign_corner_stud', 'metal', sx + e * (o.sign[1] / 2 - .05), sy + v * (o.sign[2] / 2 - .05), .1); } } }
    for (let i = 0; i < Math.floor(w / 1.1); i++) P(new THREE.CylinderGeometry(.09, .09, d * .5, 6), M.roofD, 'house_roof_tile_row', 'roof', -w / 2 + .55 + i * 1.1, h + .78, .1).rotation.x = Math.PI / 2 - .5;
    const y0 = o.arcade ? 4.5 : 1.3, rows = o.arcade ? 1 : Math.max(1, Math.floor((h - 1.2) / 2.9)), nw = Math.max(1, Math.floor(w / 2.6));
    for (let r = 0; r < rows; r++) for (let i = 0; i < nw; i++) { const x = -w / 2 + (i + .5) * w / nw, y = y0 + r * 2.9; if (!o.arcade && r === 0 && i === (o.door ?? 1)) { P(new THREE.BoxGeometry(1.1, 2.2, .1), M.woodD, 'house_door', 'wood', x, 1.1, .03); P(new THREE.BoxGeometry(1.4, .2, .16), M.stone, 'house_door_lintel', 'stone', x, 2.3, .05); continue; }
        P(new THREE.BoxGeometry(.95, 1.45, .06), night ? basic(R0() < .4 ? '#ffc56a' : '#1a1e3a') : M.dark, 'window_dark', 'glass', x, y + .72, .02); P(new THREE.BoxGeometry(1.2, .14, .22), M.stone, 'window_sill', 'stone', x, y - .06, .1);
        if (near) { P(new THREE.BoxGeometry(1.3, .2, .1), M.stone, 'window_lintel', 'stone', x, y + 1.55, .05); for (const s of [-1, 1]) P(new THREE.BoxGeometry(.12, 1.5, .08), M.stone, 'window_jamb', 'stone', x + s * .54, y + .72, .04);
          P(new THREE.BoxGeometry(.04, 1.4, .03), M.woodD, 'window_mullion', 'wood', x, y + .72, .06); P(new THREE.BoxGeometry(.9, .04, .03), M.woodD, 'window_transom', 'wood', x, y + .95, .06); if (R0() < .55) pot(g, x + rr(-.3, .3), y + .02, .17, .6); }
        for (const s of [-1, 1]) { const hg = new THREE.Group(); hg.name = 'shutter_hinge'; hg.position.set(x + s * .49, y + .72, .07); g.add(hg); const lf = add(new THREE.BoxGeometry(.49, 1.45, .05), R0() < .75 ? M.green : M.greenD, 'shutter_leaf', 'wood', new THREE.Vector3(-s * .245, 0, 0), hg);
          for (const yy of [-.5, -.25, 0, .25, .5]) add(new THREE.BoxGeometry(.4, .03, .065), M.greenD, 'shutter_slat', 'wood', new THREE.Vector3(-s * .245, yy, 0), hg); shutters.push({ hg, s, ph: R0(), open: 2.6 + R0() * .4 }); } }
    if (o.arcade) { const n = o.arcade, bw = w / n; P(new THREE.BoxGeometry(w, .5, 3.2), RL('brick', '#e8c8a4', { size: 0.92, seed: 41 }), 'arcade_vault_ceiling', 'stone', 0, 4.0, 1.6); for (let i = 0; i <= 2 * o.arcade; i++) P(new THREE.BoxGeometry(.16, .14, 3.1), M.woodD, 'arcade_ceiling_beam', 'wood', -w / 2 + i * w / (2 * o.arcade), 3.7, 1.6); P(new THREE.BoxGeometry(w, .35, .3), M.stone, 'arcade_string_course', 'stone', 0, 4.3, 3.1);
      for (let i = 0; i <= n; i++) { const x = -w / 2 + i * bw; P(new THREE.BoxGeometry(.7, 3.0, .7), M.stone, 'arcade_pier', 'stone', x, 1.5, 2.85); P(new THREE.BoxGeometry(.9, .22, .9), M.stoneD, 'arcade_pier_cap', 'stone', x, 2.9, 2.85); P(new THREE.BoxGeometry(.9, .3, .9), M.stoneD, 'arcade_pier_foot', 'stone', x, .15, 2.85); }
      for (let i = 0; i < n; i++) { const x = -w / 2 + (i + .5) * bw, a = P(new THREE.TorusGeometry((bw - .7) / 2, .2, 8, 22, Math.PI), M.stone, 'arcade_arch', 'stone', x, 3.0, 2.95); a.scale.set(1, .52, 1); P(new THREE.BoxGeometry(bw, 1.2, .5), wm, 'arcade_spandrel', 'plaster', x, 3.75, 2.9);
        P(new THREE.BoxGeometry(1.2, 2.3, .1), M.woodD, 'arcade_shop_door', 'wood', x - .9, 1.15, .04); P(new THREE.BoxGeometry(1.3, 1.2, .08), night ? basic('#ffc56a') : M.dark, 'arcade_shop_window', 'glass', x + 1.0, 1.7, .03);
        const lz = new THREE.Group(); lz.position.set(x, 3.25, 2.3); g.add(lz); add(new THREE.CylinderGeometry(.012, .012, .5, 6), M.iron, 'lantern_chain', 'metal', new THREE.Vector3(0, .32, 0), lz);
        for (const [lx, lzz] of [[-.1, -.1], [.1, -.1], [-.1, .1], [.1, .1]]) add(new THREE.BoxGeometry(.022, .3, .022), M.iron, 'lantern_frame_post', 'metal', new THREE.Vector3(lx, 0, lzz), lz);
        add(new THREE.ConeGeometry(.17, .14, 4), M.iron, 'lantern_roof', 'metal', new THREE.Vector3(0, .21, 0), lz).rotation.y = Math.PI / 4; add(new THREE.BoxGeometry(.24, .03, .24), M.iron, 'lantern_base', 'metal', new THREE.Vector3(0, -.15, 0), lz); add(new THREE.TorusGeometry(.03, .008, 5, 10), M.iron, 'lantern_ring', 'metal', new THREE.Vector3(0, .3, 0), lz);
        const gl = add(new THREE.SphereGeometry(.085, 10, 8), basic(night ? '#ffd27a' : '#f2e2b0'), 'lantern_globe', 'lamp', new THREE.Vector3(0, -.01, 0), lz); gl.castShadow = false; if (night) { const sp = glowSprite(THREE, '#ffb347'); sp.scale.setScalar(1.7); lz.add(sp); const pt = new THREE.PointLight('#ffb347', 2.2, 7, 1.6); lz.add(pt); lamps.push(pt); } } }
    return g; };
  const N = 0, S = Math.PI, E = -Math.PI / 2, W = Math.PI / 2;
  house(0, -14, S, 30, 6, 6.5, M.wallY, { arcade: 6, near: 1, lamp: false, sign: ['PANE', 1.5, .5, '#8a3a1a', -5, 5.3] });                                  // SOUTH: the arcade house (front piers at y -11.15)
  house(-13.5, -22, S, 9, 6, 9.5, M.wallO, { roofD: 1 }); house(13.5, -22, S, 9, 6, 8.6, M.wallC);
  for (const [x, w, h, c, o] of [[-13, 8, 8.5, M.wallO, { sign: ['OSTERIA', 2.4, .6, '#2f5a8a', 0, 2.75], balcony: false }], [-4.4, 8.4, 7.2, M.wallC, { balcony: 1 }], [14.5, 9, 9, M.wallP, { sign: ['VINO', 1.3, .5, '#7a1f3a', 2.2, 2.75] }]]) house(x, 22, N, w, 7, h, c, { roofD: R0() < .5, near: 1, ...o });   // NORTH (gap x 0..10 = the white road)
  for (const [y, w, h, c] of [[-6, 9, 8, M.wallP], [3.5, 9.4, 9.4, M.wallY], [13.5, 9.4, 7.6, M.wallO]]) { house(17, y, E, w, 7, h, c, { near: 1, balcony: y > 0 ? -1.5 : false }); house(-17, y, W, w, 7, h - .6, c === M.wallY ? M.wallC : M.wallY, { roofD: 1, near: 1, balcony: y < 10 ? 1.2 : false, sign: y < 0 ? ['STOFFE', 1.9, .55, '#3a2a6a', -2.4, 2.75] : null }); }
  for (let i = 0; i < 26; i++) { const up = i < 13, y = up ? 36 + i * 9 : -34 - rr(0, 30), x = up ? 6 + .244 * (y - 21) + (i % 2 ? 1 : -1) * rr(9.5, 13) : rr(-70, 70); if (!up && Math.abs(x) < 12) continue; house(x, y, up ? (i % 2 ? E : W) : S, rr(7, 9), 7, rr(6, 9), [M.wallY, M.wallO, M.wallC, M.wallP][i % 4], { roofD: i % 3 === 0 }); }
  // ----- the two towers at their world places, the far hill with cypresses up the white road -----
  const hero = buildHeroTower(THREE, scene, T, HERO); box(11, 16, 9.5, HERO[0] + 1, HERO[1] + 9.6, 0, RL('stone', '#d9a05e', { size: 2.0, seed: 42 }), 'church_nave', 'stone'); { const r = add(new THREE.CylinderGeometry(.01, 7.6, 3, 4, 1), M.roofD, 'church_roof', 'roof', V(HERO[0] + 1, HERO[1] + 9.6, 11)); r.rotation.y = Math.PI / 4; r.scale.set(1, 1, 1.45); }
  buildRivalTower(THREE, scene, T, FAR);
  const TR = (o) => ctx.trees ? ctx.trees.tree(o) : null, hillZ = (x, y) => { const dx = (x - FAR[0] - 4) / 110, dy = (y - FAR[1] - 14) / 75, q = 1 - dx * dx - dy * dy; return q > 0 ? (FAR[2] + .8) * Math.sqrt(q) - .3 : -.3; };
  { const h = add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), RL('grass', night ? '#2c5a5a' : '#4c9a44', { scale: 6, seed: 43 }), 'hill_rival', 'foliage', V(FAR[0] + 4, FAR[1] + 14, -.3)); h.scale.set(110, FAR[2] + .8, 75); h.castShadow = false;
    for (const [x, y, t, rx, ry, c] of [[-170, 330, 26, 190, 90, '#3f8a52'], [230, 380, 24, 200, 90, '#4a7f6a'], [-60, -260, 20, 260, 80, '#4a8f5a'], [260, -160, 22, 160, 110, '#3f7f5a'], [-280, 60, 24, 130, 160, '#4a7fa0']]) { const m = add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), RL('grass', night ? '#26486a' : c, { scale: 10, seed: 44 }), 'hill_far', 'foliage', V(x, y, -.3)); m.scale.set(rx, t, ry); m.castShadow = false; }
    // CYPRESS LINE up the white road on both sides, and OLIVE GROVES in rows on the far hill's flanks (ctx.trees: bark trunks, leaf-card crowns); night = darker leaf
    const cyL = night ? '#14302e' : '#24452a', cyL2 = night ? '#1e403a' : '#35593a', olL = night ? '#3a5262' : '#7f9268', olL2 = night ? '#4c6676' : '#a8b49a';
    for (let i = 0; i < 18; i++) { const u = .5 + i * .027, x = 6 + (roadTo[0] - 6) * u + (i % 2 ? 5 : -5), y = 21 + (roadTo[1] - 21) * u; TR({ kind: 'cypress', at: [x, y, hillZ(x, y) - .2], height: 9 + (i % 3) * 2.2, seed: 100 + i, leaf: cyL, leaf2: cyL2 }); }
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const x = FAR[0] - 70 + i * 9 + r * 3, y = FAR[1] - 52 + r * 10; TR({ kind: 'olive', at: [x, y, hillZ(x, y) - .2], height: 5.5, seed: 200 + r * 10 + i, leaf: olL, leaf2: olL2, perCl: 40 }); }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { const x = FAR[0] + 30 + i * 9 - r * 3, y = FAR[1] - 50 + r * 11; TR({ kind: 'olive', at: [x, y, hillZ(x, y) - .2], height: 5.5, seed: 300 + r * 10 + i, leaf: olL, leaf2: olL2, perCl: 40 }); }
    // in the square: an old olive in the north-west corner by the osteria (all seasons); south-east by the arcade corner a second one
    TR({ kind: 'olive', at: [-11.2, 16.6, 0], height: 5.2, seed: 7, leaf: olL, leaf2: olL2 }); TR({ kind: 'olive', at: [11.2, -4.4, 0], height: 4.8, seed: 9, leaf: olL, leaf2: olL2 });
    for (const [x, y] of [[-11.2, 16.6], [11.2, -4.4]]) { cyl(1.1, 1.15, .32, x, y, 0, M.stoneD, 'tree_bed_kerb', 'stone', 16); cyl(1.0, 1.0, .02, x, y, .3, RL('mud', '#6a4a30', { scale: 1.5, seed: 45 }), 'tree_bed_earth', 'ground', 16); } }
  // ----- the fountain: octagon basin with a rim, water, a pier with a bowl and a spout ball -----
  cyl(1.85, 1.75, .78, 0, 0, 0, M.stone, 'fountain_basin', 'stone', 8); add(new THREE.TorusGeometry(1.78, .12, 8, 8), M.stoneD, 'fountain_rim', 'stone', V(0, 0, .8)).rotation.x = Math.PI / 2; cyl(1.55, 1.55, .06, 0, 0, .68, M.water, 'fountain_water', 'water', 16);
  cyl(.5, .42, .5, 0, 0, 0, M.stoneD, 'fountain_plinth', 'stone', 8); cyl(.2, .16, 1.9, 0, 0, .5, M.stone, 'fountain_pier', 'stone', 10); cyl(.2, .75, .28, 0, 0, 2.3, M.stoneD, 'fountain_bowl', 'stone', 14); cyl(.68, .68, .04, 0, 0, 2.55, M.water, 'fountain_bowl_water', 'water', 14); add(new THREE.SphereGeometry(.16, 12, 10), M.stone, 'fountain_ball', 'stone', V(0, 0, 2.78));
  // fountain detail: a step ring round the basin, a carved panel on each of the 8 faces, the pier's ring mouldings, 4 bronze mask spouts with real water arcs, foam where they land, ripples, a wet ring on the paving
  { const sm8 = WT(RL('stone', '#e8dcc4', { size: 1.6, seed: 46 })); cyl(2.3, 2.25, .16, 0, 0, 0, sm8, 'fountain_step_ring', 'stone', 8); cyl(1.86, 1.76, .78, 0, 0, .0, sm8, 'fountain_basin_ashlar', 'stone', 8);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8, r = 1.79, pn = add(new THREE.BoxGeometry(1.0, .42, .05), M.stoneD, 'fountain_panel', 'stone', V(Math.cos(a) * r, Math.sin(a) * r, .44)); pn.rotation.y = a - Math.PI / 2; pn.rotation.order = 'YXZ';
      const ro = add(new THREE.SphereGeometry(.09, 10, 8), M.stone, 'fountain_panel_rosette', 'stone', V(Math.cos(a) * (r + .04), Math.sin(a) * (r + .04), .44)); ro.scale.set(1, 1, .4); }
    for (const z of [.95, 1.6, 2.2]) add(new THREE.TorusGeometry(.2, .045, 6, 14), M.stoneD, 'fountain_pier_ring', 'stone', V(0, 0, z)).rotation.x = Math.PI / 2;
    if (!night || true) { const wet0 = add(new THREE.RingGeometry(2.25, 2.9, 32), basic(night ? '#5a68b0' : spring ? '#7f9a8a' : '#c9a878', { transparent: true, opacity: .45, depthWrite: false }), 'fountain_wet_ring', 'ground', V(0, 0, .008)); wet0.rotation.x = -Math.PI / 2; wet0.castShadow = false; } }
  const jets = [], foam = [], bronze = M.bronze, wmat = new THREE.MeshBasicMaterial({ color: night ? '#a8c0ff' : '#cfeeff', transparent: true, opacity: .78, depthWrite: false });
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4, c = Math.cos(a), s = Math.sin(a);
    const mk = add(new THREE.CylinderGeometry(.11, .11, .05, 12), bronze, 'fountain_spout_mask', 'metal', V(c * .2, s * .2, 1.85)); mk.rotation.x = Math.PI / 2; mk.rotation.z = -a + Math.PI / 2; mk.rotation.order = 'ZXY';
    bar([c * .2, s * .2, 1.85], [c * .34, s * .34, 1.86], .025, bronze, 'fountain_spout_pipe', 'metal');
    const curve = new THREE.QuadraticBezierCurve3(V(c * .34, s * .34, 1.86), V(c * .85, s * .85, 1.95), V(c * 1.15, s * 1.15, .72)), j = add(new THREE.TubeGeometry(curve, 16, .035, 8, false), wmat, 'fountain_water_arc_glow', 'water'); j.castShadow = false; jets.push(j);
    const fm = add(new THREE.SphereGeometry(.12, 10, 6), basic('#ffffff', { transparent: true, opacity: .8, depthWrite: false }), 'fountain_foam_glow', 'water', V(c * 1.15, s * 1.15, .72)); fm.scale.y = .35; fm.castShadow = false; foam.push(fm); }
  const fRings = [0, 1, 2, 3].map(k => { const q = add(new THREE.RingGeometry(.9, 1, 32), basic('#ffffff', { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), 'fountain_ripple_glow', 'water', V(0, 0, .745)); q.rotation.x = -Math.PI / 2; q.castShadow = false; return q; });
  box(.5, .34, .5, -1.5, 1.95, 0, M.stoneD, 'fountain_step', 'stone');
  // ----- MARKET PROPS (30+ kinds): sacks, barrels, amphorae, cheeses, pumpkins, cabbages, onions, oranges, a balance, a bench, a hand cart, a broom, a ladder, a bucket, a straw bale, flower buckets, hanging salami and garlic -----
  { const sack = (x, y, c = '#d9c49a') => { const s = add(new THREE.SphereGeometry(.32, 12, 9), toon(c), 'grain_sack', 'cloth', V(x, y, .3)); s.scale.set(1, 1.25, .9); add(new THREE.CylinderGeometry(.06, .1, .14, 8), toon(c), 'sack_neck', 'cloth', V(x, y, .74)); add(new THREE.TorusGeometry(.065, .015, 5, 10), toon('#7a4a26'), 'sack_tie', 'cloth', V(x, y, .7)).rotation.x = Math.PI / 2; };
    const barrel = (x, y, h = .9) => { const pts = [[.28, 0], [.34, h * .5], [.28, h]].map(([r, z]) => new THREE.Vector2(r, z)); add(new THREE.LatheGeometry(pts, 16), RL('wood', '#a8703a', { scale: .7, seed: 47 }), 'barrel_staves', 'wood', V(x, y, 0)); for (const z of [.12, h * .5, h - .12]) add(new THREE.TorusGeometry(z === h * .5 ? .345 : .3, .018, 5, 18), M.iron, 'barrel_hoop', 'metal', V(x, y, z)).rotation.x = Math.PI / 2; cyl(.27, .27, .02, x, y, h - .03, M.woodD, 'barrel_lid', 'wood', 14); };
    const jug = (x, y, c = '#c9622e') => { const pts = [[.05, 0], [.17, .1], [.2, .3], [.1, .52], [.07, .62], [.09, .66]].map(([r, z]) => new THREE.Vector2(r, z)); add(new THREE.LatheGeometry(pts, 14), RL('plaster', c, { scale: .5, seed: 54 }), 'wine_jug', 'stone', V(x, y, 0)); add(new THREE.TorusGeometry(.07, .015, 5, 10, Math.PI), toon(c), 'jug_handle', 'stone', V(x + .1, y, .48)).rotation.y = Math.PI / 2; };
    for (const [x, y, c] of [[-6.2, 9.4, '#d9c49a'], [-6.7, 9.0, '#c9b07a'], [-6.4, 8.4, '#e2d2a8'], [6.6, 1.6, '#d9c49a'], [7.0, 2.3, '#c9b07a']]) sack(x, y, c);
    for (const [x, y, h] of [[6.4, 9.6, .9], [7.1, 9.1, .8], [-6.9, 4.4, .9], [12.6, -9.8, .95]]) barrel(x, y, h);
    for (const [x, y, c] of [[6.0, 5.5, '#c9622e'], [6.35, 5.8, '#b8562a'], [6.15, 6.2, '#d27a3a'], [-12.3, -8.6, '#c9622e']]) jug(x, y, c);
    // cheese wheels on a plank table, a balance scale, pumpkins, cabbages in a crate, an onion pile, an orange pyramid, a flower bucket
    box(1.4, .6, .05, 6.6, 7.6, .7, M.planks, 'cheese_table', 'wood'); for (const s of [-1, 1]) box(.06, .5, .7, 6.6 + s * .6, 7.6, 0, M.woodD, 'cheese_table_leg', 'wood');
    for (let i = 0; i < 4; i++) { cyl(.2, .2, .12, 6.2 + i * .28, 7.6, .75 + (i % 2) * .12, toon('#f2c45a'), 'cheese_wheel', 'foliage', 16); }
    { const bx = 6.95, by = 7.6, bz = .75; bar([bx, by, bz], [bx, by, bz + .45], .015, M.iron, 'scale_post', 'metal'); bar([bx - .22, by, bz + .45], [bx + .22, by, bz + .45], .012, M.iron, 'scale_beam', 'metal'); for (const s of [-1, 1]) { bar([bx + s * .22, by, bz + .45], [bx + s * .22, by, bz + .2], .004, M.iron, 'scale_chain', 'metal'); cyl(.1, .1, .015, bx + s * .22, by, bz + .19, M.brass, 'scale_pan', 'metal', 14); } }
    for (const [x, y, s] of [[-7.4, 6.3, 1], [-7.0, 6.9, .8], [-7.6, 7.1, .9]]) { const p = add(new THREE.SphereGeometry(.26 * s, 14, 10), toon('#ff8a2a'), 'pumpkin', 'foliage', V(x, y, .2 * s)); p.scale.y = .75; add(new THREE.CylinderGeometry(.02, .03, .1, 6), toon('#4a6a2a'), 'pumpkin_stem', 'foliage', V(x, y, .38 * s)); }
    box(.8, .6, .4, -7.3, 2.6, 0, M.planks, 'cabbage_crate', 'wood'); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(.15, 10, 8), toon(i % 2 ? '#8ac850' : '#6fae3e'), 'cabbage', 'foliage', V(-7.55 + (i % 3) * .25, 2.45 + Math.floor(i / 3) * .3, .5));
    for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(.07, 8, 6), toon(i % 3 ? '#d9a050' : '#a8452e'), 'onion', 'foliage', V(-7.9 + rr(-.25, .25), 3.6 + rr(-.25, .25), .07 + (i > 9 ? .1 : 0)));
    for (let l = 0, k = 0; l < 3; l++) for (let i = 0; i < 3 - l; i++) for (let j = 0; j < 3 - l; j++, k++) add(new THREE.SphereGeometry(.075, 10, 8), toon(k % 2 ? '#ff8a1e' : '#f2701a'), 'orange_pyramid', 'foliage', V(3.1 + (i + l * .5) * .15, 1.8 + (j + l * .5) * .15, .97 + l * .12));
    box(.5, .5, .08, 3.25, 1.95, .86, M.planks, 'orange_tray', 'wood'); for (const s of [-1, 1]) bar([3.25 + s * .2, 1.95, 0], [3.25 + s * .2, 1.95, .86], .025, M.woodD, 'orange_tray_leg', 'wood');
    { cyl(.2, .24, .38, -6.8, 0.6, 0, MT('steel', { color: '#9aa6b8', seed: 48, toon: '#7a8a9a' }), 'flower_bucket', 'metal', 12); for (let i = 0; i < 9; i++) { bar([-6.8, .6, .3], [-6.8 + rr(-.25, .25), .6 + rr(-.25, .25), .75 + rr(0, .2)], .008, M.leaf, 'flower_stem', 'foliage'); } for (let i = 0; i < 9; i++) add(new THREE.SphereGeometry(.06, 7, 5), toon(['#ffd23a', '#ff6fa8', '#fbf6ee'][i % 3]), 'cut_flower', 'foliage', V(-6.8 + rr(-.25, .25), .6 + rr(-.25, .25), .8 + rr(0, .2))); }
    // the bench under the arcade, a hand cart with spoked wheels, a broom, a ladder against the east house, a bucket by the fountain, a straw bale, a mounting stone
    box(2.2, .4, .06, 5.2, -11.8, .45, M.planks, 'arcade_bench', 'wood'); for (const s of [-1, 1]) box(.08, .36, .45, 5.2 + s * .95, -11.8, 0, M.woodD, 'bench_leg', 'wood');
    { const cx = 10.2, cy = 7.6; box(1.1, 1.6, .3, cx, cy, .5, M.planks, 'hand_cart_bed', 'wood'); for (const s of [-1, 1]) { box(.06, 1.6, .25, cx + s * .55, cy, .8, M.woodD, 'hand_cart_side', 'wood'); bar([cx + s * .3, cy + .8, .55], [cx + s * .3, cy + 1.9, .35], .03, M.woodD, 'hand_cart_handle', 'wood');
        const wh = new THREE.Group(); wh.name = 'cart_wheel'; wh.position.copy(V(cx + s * .66, cy - .2, .45)); wh.rotation.z = Math.PI / 2; scene.add(wh); const tr = new THREE.Mesh(new THREE.TorusGeometry(.42, .035, 6, 22), M.woodD); tr.name = 'wheel_rim'; tr.rotation.y = Math.PI / 2; wh.add(tr); for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .84, 5), M.wood); sp.name = 'wheel_spoke'; sp.rotation.x = k * Math.PI / 8; wh.add(sp); } }
      for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.16, 10, 8), toon(['#d9c49a', '#86a82a', '#ff8a1e'][i % 3]), 'cart_load', 'foliage', V(cx + rr(-.35, .35), cy + rr(-.6, .6), .9)); }
    bar([8.7, -10.6, 0], [8.95, -10.9, 1.45], .02, M.wood, 'broom_handle', 'wood'); { const b = add(new THREE.ConeGeometry(.15, .4, 10), toon('#d9b45a'), 'broom_head', 'foliage', V(8.68, -10.57, .18)); b.rotation.x = Math.PI; }
    for (const s of [-1, 1]) bar([13.6, -1.5 + s * .25, 0], [16.2, -1.5 + s * .25, 4.6], .035, M.wood, 'ladder_rail', 'wood'); for (let k = 1; k < 12; k++) { const u = k / 12; bar([13.6 + 2.6 * u, -1.75, 4.6 * u], [13.6 + 2.6 * u, -1.25, 4.6 * u], .02, M.woodD, 'ladder_rung', 'wood'); }
    cyl(.17, .2, .3, -2.3, -1.9, 0, M.planks, 'water_bucket', 'wood', 12); add(new THREE.TorusGeometry(.18, .012, 5, 14), M.iron, 'bucket_hoop', 'metal', V(-2.3, -1.9, .24)).rotation.x = Math.PI / 2;
    box(1.0, .5, .45, -9.4, 9.6, 0, RL('grass', '#e8c45a', { scale: .6, seed: 50 }), 'straw_bale', 'foliage'); box(.9, .6, .5, 12.8, 14.6, 0, M.stoneQ, 'mounting_stone', 'stone');
    // hanging goods under the noon awnings: salami, a garlic braid, strings of red peppers
    if (!wet) for (const [x, y] of [[-4.3, 6.3], [-4.6, 1.85], [4.3, 8.7], [4.7, 4.1]]) { for (let i = 0; i < 4; i++) { const hx = x + (i - 1.5) * .18; bar([hx, y, 2.25], [hx, y, 2.05], .004, M.woodD, 'hanging_string', 'cloth'); const it = add(new THREE.CapsuleGeometry(.04, .22, 4, 8), toon(i % 2 ? '#8a2a2a' : '#f2ead2'), i % 2 ? 'hanging_salami' : 'hanging_garlic', 'foliage', V(hx, y, 1.88)); } }
    // pigeons on the paving (noon): head bobs as they peck
    S_PIG.length = 0; const pigAt = []; if (!wet) { for (let i = 0; i < 7; i++) pigAt.push([rr(-6, 6), rr(-9, 1.5), 0, R0() * 6.28]); pigAt.push([-1.36, 1.14, .92, 2.2], [-1.62, -.74, .92, -1.0], [-3.9, -2.2, 0, .6], [-4.3, -1.5, 0, 2.6]); }   // + two on the fountain rim, two by the dropped basket (row 16)
    else if (spring) pigAt.push([-4.6, -10.95, 4.48, 0], [-3.9, -10.95, 4.48, .4], [3.1, -10.95, 4.48, -.3]);                                                                // spring: sheltering on the arcade string course
    for (const [px, py, pz, prot] of pigAt) { const g = new THREE.Group(); g.name = 'pigeon'; g.position.copy(V(px, py, pz)); g.rotation.y = prot; scene.add(g); const gm = toon('#8a8fa8'), b = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), gm); b.scale.set(.8, .75, 1.3); b.position.y = .1; b.castShadow = true; b.name = 'pigeon_body'; g.add(b);
      const t = new THREE.Mesh(new THREE.ConeGeometry(.05, .14, 6), toon('#5a5f78')); t.rotation.x = -Math.PI / 2 - .3; t.position.set(0, .12, -.14); t.name = 'pigeon_tail'; g.add(t); const hd = new THREE.Group(); hd.position.set(0, .17, .1); g.add(hd); const h = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), toon('#6a7090')); h.name = 'pigeon_head'; hd.add(h); const bk = new THREE.Mesh(new THREE.ConeGeometry(.012, .04, 5), toon('#e0a050')); bk.rotation.x = Math.PI / 2; bk.position.z = .05; hd.add(bk);
      for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .07, 4), toon('#e0604a')); l.position.set(s * .03, .035, 0); g.add(l); } S_PIG.push({ hd, ph: S_PIG.length < 7 && !wet ? R0() * 9 : px * 3.1 + py }); } }
  // ----- stalls: trestle table, four poles, a red and white striped awning (out at noon, rolled in for rain), real goods -----
  const stall = (cx, cy, kind, side) => { const g = new THREE.Group(); g.name = 'stall_' + kind; scene.add(g); const L = 2.6, D = 1.15;      // long side along y; side = +1: the aisle is toward +x
    box(D, L, .08, cx, cy, .86, M.wood, 'stall_table', 'wood', g); for (const sy of [-1, 1]) { bar([cx - .4, cy + sy * 1.05, 0], [cx + .4, cy + sy * 1.05, .86], .035, M.woodD, 'stall_trestle', 'wood', g); bar([cx + .4, cy + sy * 1.05, 0], [cx - .4, cy + sy * 1.05, .86], .035, M.woodD, 'stall_trestle', 'wood', g); }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bar([cx + sx * .62, cy + sy * 1.35, 0], [cx + sx * .62, cy + sy * 1.35, sx === -side ? 2.75 : 2.35], .04, M.woodD, 'stall_pole', 'wood', g);
    if (!wet) for (let i = 0; i < 8; i++) { const m = box(1.9, .36, .05, cx + side * .1, cy - 1.26 + i * .36, 2.5, i % 2 ? M.white : M.red, 'awning_stripe', 'cloth', g); m.rotation.z = side * .21; for (const e of [1]) box(.05, .36, .2, cx + side * 1.03, cy - 1.26 + i * .36, 2.2, i % 2 ? M.white : M.red, 'awning_valance', 'cloth', g); }
    else for (let i = 0; i < 8; i++) { const m = cyl(.15, .15, .36, cx - side * .62, cy - 1.26 + i * .36, 2.6, i % 2 ? M.white : M.red, 'awning_rolled', 'cloth', 10, g); m.rotation.x = Math.PI / 2; m.position.copy(V(cx - side * .62, cy - 1.26 + i * .36, 2.72)); }
    const top = .9, B = c => toon(c);
    if (kind === 'olive') { for (const [dy, c] of [[-.8, '#86a82a'], [0, '#3a3a2a'], [.8, '#a8b83a']]) { cyl(.24, .3, .2, cx, cy + dy, top, RL('wood', '#c9853a', { scale: .5, seed: 51 }), 'olive_bowl', 'wood', 14, g); for (let i = 0; i < 16; i++) add(new THREE.SphereGeometry(.05, 8, 6), B(c), 'olives', 'foliage', V(cx + rr(-.2, .2), cy + dy + rr(-.2, .2), top + .22 + rr(0, .06)), g).scale.set(1, 1.25, 1); }
      cyl(.3, .3, .7, cx - side * .9, cy + .9, 0, M.woodD, 'olive_barrel', 'wood', 12, g); const s = sign('OLIVE', 1.5, .58); s.name = 'stall_sign_OLIVE'; s.position.copy(V(cx + side * 1.06, cy, wet ? 2.2 : 1.86)); s.rotation.y = side * Math.PI / 2; g.add(s); const s2 = sign('OLIVE', 1.5, .58); s2.name = 'stall_sign_OLIVE_north'; s2.position.copy(V(cx, cy + 1.42, 2.05)); s2.rotation.y = Math.PI; g.add(s2); }
    if (kind === 'bread') { for (let i = 0; i < 7; i++) { const m = add(new THREE.SphereGeometry(.17, 12, 8), B(i % 2 ? '#e0a04a' : '#c9853a'), 'bread_loaf', 'wood', V(cx + rr(-.3, .3), cy - .9 + i * .3, top + .12), g); m.scale.set(1.4, .7, .9); }
      cyl(.16, .2, .3, cx, cy + 1.0, top, RL('plaster', '#d9a04a', { scale: .4, seed: 52 }), 'breadstick_jar', 'wood', 12, g); for (let i = 0; i < 7; i++) bar([cx + rr(-.08, .08), cy + 1.0 + rr(-.08, .08), top + .05], [cx + rr(-.2, .2), cy + 1.0 + rr(-.2, .2), top + .75], .017, B('#e8b85a'), 'breadstick', 'wood', g); }
    if (kind === 'eggs') { for (const dy of [-.7, .3]) { cyl(.3, .36, .16, cx, cy + dy, top, toon('#d9a04a'), 'egg_basket', 'wood', 14, g); cyl(.3, .3, .04, cx, cy + dy, top + .13, toon('#e8d27a'), 'egg_straw', 'foliage', 12, g); for (let i = 0; i < 11; i++) add(new THREE.SphereGeometry(.06, 10, 8), B(i % 3 ? '#fff6e6' : '#e8c9a0'), 'eggs', 'stone', V(cx + rr(-.22, .22), cy + dy + rr(-.22, .22), top + .2), g).scale.set(1, 1.3, 1); } box(.5, .5, .45, cx, cy + 1.0, top, RL('wood', '#c9853a', { scale: .5, seed: 53 }), 'hen_crate', 'wood', g); }
    if (kind === 'cloth') { ['#c8372f', '#2f6fb8', '#e2a93b', '#7a4a9a', '#2f8a4e'].forEach((c, i) => { const m = cyl(.13, .13, 1.0, cx, cy - .9 + i * .42, top + .02, B(c), 'cloth_bolt', 'cloth', 12, g); m.rotation.z = Math.PI / 2; m.position.copy(V(cx, cy - .9 + i * .42, top + .15)); }); box(.9, .05, .9, cx + side * .5, cy + .2, 1.2, B('#2f6fb8'), 'cloth_hanging', 'cloth', g).rotation.z = side * 1.2; }
    return g; };
  stall(-4.3, 7.4, 'bread', 1); stall(-4.6, 2.9, 'eggs', 1); stall(4.3, 7.6, 'olive', -1); stall(4.7, 3.0, 'cloth', -1);
  // crates and a hand cart in the corners, laundry line across a side street
  for (const [x, y, c] of [[-9, 12, '#c9853a'], [-9.6, 12.9, '#a8703a'], [9.5, 11.5, '#c9853a'], [10, -7.5, '#a8703a']]) box(.8, .8, .6, x, y, 0, RL('wood', c, { scale: .8, seed: 49 }), 'crate', 'wood');
  { const cols = ['#fbf6ee', '#c8372f', '#2f6fb8', '#fbf6ee', '#e2a93b']; bar([-13, 18.4, 5.2], [-13 + 0, 18.6, 5.2], .01, M.woodD, 'x', 'wood'); bar([10.2, 18.5, 5.4], [-.2, 18.5, 5.4], .015, M.woodD, 'laundry_line', 'cloth'); cols.forEach((c, i) => { const m = box(.9, .04, 1.0, 1.2 + i * 1.7, 18.5, 4.35, toon(c), 'laundry', 'cloth'); laundry.push({ m, ph: i * 1.3 }); }); }
  // more washing lines across the side streets (sheets, shirts, a red petticoat), each piece swings on its own
  for (const [a, b, z, n] of [[[-16.9, 16.0], [-13.0, 21.9], 5.6, 4], [[16.9, -9.6], [13.6, -10.9], 5.4, 3], [[-12.6, 21.6], [-8.6, 21.6], 6.0, 3]]) { bar([a[0], a[1], z], [b[0], b[1], z], .012, M.woodD, 'laundry_line', 'cloth');
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, c = ['#fbf6ee', '#c8372f', '#e8d8b0', '#2f6fb8'][(i + n) % 4], g = new THREE.Group(); g.position.copy(V(x, y, z)); g.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); scene.add(g);
      const m = new THREE.Mesh(new THREE.BoxGeometry(.8, .9 + .3 * (i % 2), .03), toon(c)); m.name = 'laundry'; m.position.y = -.5; m.castShadow = true; g.add(m); laundry.push({ m: g, ph: i * 2.1 + z }); } }
  // ----- the dropped orange (noon, row 16): rolls from the aisle to the Mason's foot -----
  const orange = add(new THREE.SphereGeometry(.11, 18, 14), toon('#ff8a1e'), 'dropped_orange', 'foliage', V(0, 0, -5)); add(new THREE.SphereGeometry(.026, 6, 5), basic('#2f8a2a'), 'orange_stalk', 'foliage', new THREE.Vector3(0, .105, 0), orange); add(new THREE.SphereGeometry(.03, 6, 5), basic('#ffd08a'), 'orange_shine', 'foliage', new THREE.Vector3(-.05, .06, .07), orange);
  // ----- noon, row 16: the market left in a hurry. On the fountain rim: a flat basket of lemons, a red head-scarf, a tin cup; on the cobbles: a basket dropped on its side, oranges and onions rolled out -----
  if (!wet) { const rz = .92, wk = RL('wood', '#d9a04a', { scale: .35, seed: 57 });
    { const g = new THREE.Group(); g.name = 'rim_lemon_basket'; g.position.copy(V(-1.54, -.89, rz)); scene.add(g); const b = add(new THREE.CylinderGeometry(.3, .24, .13, 18, 1, true), wk, 'rim_basket_weave', 'wood', new THREE.Vector3(0, .065, 0), g); b.material.side = THREE.DoubleSide;
      add(new THREE.CylinderGeometry(.24, .24, .02, 18), wk, 'rim_basket_floor', 'wood', new THREE.Vector3(0, .01, 0), g); add(new THREE.TorusGeometry(.3, .022, 6, 22), RL('wood', '#a86a2a', { scale: .3, seed: 58 }), 'rim_basket_rim', 'wood', new THREE.Vector3(0, .13, 0), g).rotation.x = Math.PI / 2;
      for (let i = 0; i < 11; i++) { const a = i * 2.39, r = i < 7 ? .16 : .06; add(new THREE.SphereGeometry(.06, 12, 9), toon(i % 3 ? '#ffd83a' : '#f2c21e'), 'lemon', 'foliage', new THREE.Vector3(Math.cos(a) * r, .12 + (i < 7 ? 0 : .05), Math.sin(a) * r), g).scale.set(1, 1, 1.35); }
      for (const [lx, lz] of [[.38, .1], [.3, -.28]]) add(new THREE.SphereGeometry(.06, 12, 9), toon('#ffd83a'), 'lemon_rolled', 'foliage', new THREE.Vector3(lx, .05, lz), g).scale.set(1, 1, 1.35); }
    { const m = box(.55, .38, .025, -1.76, -.28, rz, M.red, 'rim_red_headscarf', 'cloth'); m.rotation.y = .5; const t = box(.08, .3, .02, -1.95, -.5, rz - .12, M.red, 'headscarf_hanging_end', 'cloth'); t.rotation.x = .2; }
    cyl(.052, .044, .09, -1.14, -1.36, rz, MT('steel', { color: '#a8b0bc', seed: 59, toon: '#9aa2b0' }), 'rim_tin_cup', 'metal', 14);
    { const g = new THREE.Group(); g.name = 'dropped_market_basket'; g.position.copy(V(-2.94, -.86, .2)); g.rotation.set(0, .9, Math.PI / 2 - .12); scene.add(g); add(new THREE.CylinderGeometry(.24, .18, .36, 18, 1, false), wk, 'dropped_basket_weave', 'wood', null, g); add(new THREE.CircleGeometry(.215, 18), basic('#4a3018'), 'dropped_basket_inside', 'wood', new THREE.Vector3(0, .181, 0), g).rotation.x = -Math.PI / 2;
      for (const y of [-.1, .02, .12]) add(new THREE.TorusGeometry(.2 + y * .2, .012, 5, 18), RL('wood', '#a86a2a', { scale: .3, seed: 58 }), 'dropped_basket_band', 'wood', new THREE.Vector3(0, y, 0), g).rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(.22, .014, 6, 20, Math.PI), RL('wood', '#a86a2a', { scale: .3, seed: 58 }), 'dropped_basket_handle', 'wood', new THREE.Vector3(0, .18, 0), g); }
    for (const [x, y, c, r] of [[-2.55, -1.15, '#ff8a1e', .075], [-2.35, -1.4, '#f2701a', .075], [-2.7, -1.55, '#ff8a1e', .075], [-2.1, -1.1, '#d9a050', .065], [-2.5, -1.75, '#a8452e', .065], [-1.95, -1.6, '#ff8a1e', .075]]) add(new THREE.SphereGeometry(r, 12, 9), toon(c), 'spilled_goods', 'foliage', V(x, y, r));
    for (let i = 0; i < 5; i++) { const m = add(new THREE.SphereGeometry(.12, 8, 5), toon(['#7fbf4a', '#a8d06a'][i % 2]), 'litter_cabbage_leaf', 'foliage', V(-3.4 + i * .35, -1.9 - (i % 2) * .3, .012)); m.scale.set(1, .08, .7); } }
  // ----- spring: the blossom tree, puddles, drizzle, the pale far flash. night: storm clouds, the far bolt -----
  let rain = null, puddles = [], flashSp = null, bolt = null, flashL = null, breadsticks = null;
  if (spring || night) { for (const [x, y, r] of [[-2.3, -7.4, 1.5], [2.6, -4.2, .9], [-4.8, -3.0, .8], [1.0, 4.6, 1.1], [-2.5, 8.5, .9], [3.8, -8.2, 1.0], [-5.5, -8.6, 1.1]]) { const p = add(new THREE.CircleGeometry(r, 22), MT('wet', { color: night ? '#6a80e0' : '#a8d8d0', rough: .03, env: 1.8, seed: 56, toon: night ? '#5a6fd0' : '#bfe8e0' }), 'puddle', 'water', V(x, y, .012)); p.rotation.x = -Math.PI / 2; p.scale.set(1, .7, 1); p.castShadow = false;
      const rings = [0, 1, 2].map(i => { const q = add(new THREE.RingGeometry(.8, 1, 28), basic('#ffffff', { transparent: true, opacity: .0, side: THREE.DoubleSide, depthWrite: false }), 'puddle_ring_glow', 'water', V(x, y, .02)); q.rotation.x = -Math.PI / 2; q.castShadow = false; return q; }); puddles.push({ p, rings, r }); }
    rain = buildRain(THREE, scene, T, spring ? { n: 1500, len: .55, opacity: .45, sheet_gain: .7, box: [-13, 13, -16, 16, 8], splashes: 240 } : { n: 2200, len: 1.1, opacity: .55, slant: .3, box: [-13, 13, -16, 16, 9], splashes: 300 }); }
  if (spring) { const tx = -7.0, ty = -8.0, pk = ['#ff9ec4', '#ffb8d6', '#f77fb0', '#ffd0e4'];
    // THE BLOSSOM TREE (ctx.trees blossom: a bark trunk that forks three times, pink flower-card crown), in a stone bed with wet earth
    if (ctx.trees) ctx.trees.tree({ kind: 'blossom', at: [tx, ty, 0], height: 5.6, seed: 12, leaf: '#ff9ec4', leaf2: '#ffd6e8', green: '#8ab85a', crownW: 3.6, clusters: 44 });
    cyl(1.0, 1.05, .3, tx, ty, 0, M.stoneD, 'tree_bed_kerb', 'stone', 16); cyl(.92, .92, .02, tx, ty, .28, wetOf(RL('mud', '#5a3e2a', { scale: 1.2, seed: 55 }), { shininess: 60 }), 'tree_bed_earth', 'ground', 16);
    for (let i = 0; i < 40; i++) add(new THREE.CircleGeometry(.05, 6), basic(pk[i % 4]), 'blossom_petal_fallen', 'foliage', V(tx + rr(-3, 3), ty + rr(-2.5, 3), .02)).rotation.x = -Math.PI / 2;
    // the baker's ten breadsticks, standing in a rack on a small table under the arcade, countable
    const bx = K.rack ? K.rack[0] : -2.3, by = K.rack ? K.rack[1] : -10.5; box(1.0, .5, .06, bx, by, .72, M.wood, 'rack_table', 'wood'); for (const s of [-1, 1]) { bar([bx + s * .4, by - .2, 0], [bx + s * .4, by + .2, .72], .03, M.woodD, 'rack_table_leg', 'wood'); bar([bx + s * .4, by + .2, 0], [bx + s * .4, by - .2, .72], .03, M.woodD, 'rack_table_leg', 'wood'); }
    box(.86, .12, .1, bx, by, .78, M.woodD, 'breadstick_rack', 'wood'); breadsticks = []; for (let i = 0; i < 10; i++) { const x = bx - .36 + i * .08; breadsticks.push(bar([x, by, .86], [x + (i % 2 ? .006 : -.006), by, 1.27 + (i % 3) * .02], .023, basic(i % 2 ? '#f0c060' : '#e2a848'), 'breadstick_of_ten', 'wood')); add(new THREE.SphereGeometry(.021, 8, 6), basic('#c98a3a'), 'breadstick_tip', 'wood', V(x, by, 1.28 + (i % 3) * .02)); }
  }   // final pass 2026-11-15: the old buildBolt + flash sprite are replaced by ctx.fx.bolt (below, after the sky)
  // THE SKY (ctx.sky.clouds): noon = clear day, a few lit cumulus on deep blue; spring = rain overcast in silver-green with light breaking through; night = heavy night-storm.
  // The sector toward the rival tower (cloud angle 250..305 deg) gets only high clouds, so nothing hangs in front of the white tower and the gold angel.
  const SKC = night ? { top: '#121c58', mid: '#24317a', hor: '#4a5cc0', sun: '#b4c4ff', lit: '#9cb0f0', shade: '#1c2560', rim: '#d4deff', glow: .45 }
    : spring ? { top: '#4f7a78', mid: '#78a29a', hor: '#c4e6d6', sun: '#fbfff0', lit: '#eef8f0', shade: '#6f8c86', rim: '#ffffff', glow: .65,   // final pass: the kit's painted storm in spring's silver-green, not grey
        core: '#34524c', body: '#668a80', slit: '#bcd8cc', srim: '#e0f2e8', under: '#8aa89c', scud: '#44605a', rain: '#7a968e' }
    : { top: '#1a58cc', mid: '#3f86e4', hor: '#b2d8ff', sun: '#fff3da', lit: '#ffffff', shade: '#b8c8e4', rim: '#ffffff', glow: .7 };
  const skyKind = night ? 'night-storm' : spring ? 'rain-overcast' : 'clear-day', clouds = [];
  if (ctx.sky) { clouds.push(ctx.sky.clouds({ kind: skyKind, colors: SKC, seed: night ? 31 : spring ? 21 : 11, arc: [-55, 250], coverage: night ? 1.2 : spring ? 1.25 : .35, scale: night ? 1.45 : spring ? 1 : 2.0, minEl: night ? 4 : spring ? 5 : 7, maxEl: night ? 30 : 24 }));
    clouds.push(ctx.sky.clouds({ kind: skyKind, colors: SKC, seed: 41, arc: [250, 305], dome: false, coverage: .5, minEl: 21, maxEl: 34 })); }
  const cloudMats = []; for (const cg of clouds) cg.traverse(o => { if (o.material && o.material.uniforms && o.material.uniforms.lit) cloudMats.push({ u: o.material.uniforms, lit: o.material.uniforms.lit.value.clone(), shade: o.material.uniforms.shade.value.clone() }); });
  // FINAL PASS 2026-11-15 (CB: "make the thunder bolt much better"): the kit bolt ctx.fx.bolt, stroke on the same frame as the old flash (K.flash[0]); it lights the clouds from inside (ctx.sky.flash, every frame)
  // spring row 18 "flash": a FAR bolt over the plain to the south-east, lower half behind the roofs; night row 24 "ONE": a NEAR blinding bolt just beyond the south houses
  if (ctx.fx && K.flash && (spring || night)) bolt = ctx.fx.bolt(spring
    ? { plan: true, far: true, from: [-34, -150, 100], to: [-20, -146, 0], frame: K.flash[0], leader: 3, seed: 4, width: .9, glowK: .22, glowWidth: 4, clouds: clouds[0] }
    : { plan: true, from: [30, -92, 115], to: [14, -84, 0], frame: K.flash[0], leader: 3, seed: 9, width: .75, glowK: .22, glowWidth: 4, branches: 9, light: 4, clouds: clouds[0] });
  const hemi = scene.children.find(o => o.isHemisphereLight), hemi0 = hemi ? hemi.intensity : 1;

  const sm = (a, b, f) => { const u = Math.min(1, Math.max(0, (f - a) / Math.max(1e-4, b - a))); return u * u * (3 - 2 * u); }, FLC = new THREE.Color(night ? '#dfe6ff' : '#f6fbf8');
  const update = (f, t, R) => {
    jets.forEach((j, i) => { j.material.opacity = .7 + .1 * Math.sin(f * 1.7 + i); }); foam.forEach((m, i) => { const k = 1 + .25 * Math.sin(f * 1.1 + i * 1.7); m.scale.set(k, .35 * k, k); });
    fRings.forEach((q, k) => { const u = (((f / 40 + k / 4) % 1) + 1) % 1, r = .4 + 1.1 * u; q.scale.set(r, r, 1); q.material.opacity = .35 * (1 - u); });
    for (const p of S_PIG) { const u = ((f + p.ph * 10) % 46) / 46; p.hd.rotation.x = u < .2 ? .9 * Math.sin(Math.PI * u / .2) : 0; }
    for (const l of laundry) { l.m.rotation.x = .08 * Math.sin(f * .13 + l.ph) + (wet ? .02 : 0); }
    if (K.orange) { const [f0, f1, a, b] = K.orange, u = sm(f0, f1, f), e = 1 - (1 - u) * (1 - u), x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e; orange.position.copy(V(x, y, .11 + (f < f0 + 6 ? .25 * Math.abs(Math.sin((f - f0) * .9)) * Math.max(0, 1 - (f - f0) / 6) : 0))); orange.rotation.z = -u * 9; orange.visible = f >= f0; }
    if (rain) rain.update(f, R);
    let fl = 0; if (bolt) { bolt.update(t); fl = Math.min(1, bolt.state.light); if (ctx.sky && ctx.sky.flash) ctx.sky.flash({ pos: bolt.start.toArray() }, bolt.state.light * (night ? 1.2 : .9), { spread: night ? .45 : .32, slot: 0 }); }   // the bolt's own light curve
    if (hemi) hemi.intensity = hemi0 * (1 + (night ? .9 : .25) * fl);
    if (K.tremble) for (const [i, P] of puddles.entries()) P.rings.forEach((q, k) => { const u = ((f - K.tremble) / 16 - k * .28 - (i % 3) * .1); if (u > 0 && u < 1.4) { const s = P.r * (.2 + .8 * Math.min(1, u)); q.scale.set(s, s * .7, 1); q.material.opacity = .9 * Math.max(0, 1 - u / 1.4); } else q.material.opacity = 0; });
    // shutters: open by day; at night they bang shut one after another after K.slam (each its own beat), with a rebound
    for (const sh of shutters) { let a = sh.open; if (night) { const d = f - ((K.slam ?? 1e9) + sh.ph * 9); a = d <= 0 ? sh.open * (.75 + .25 * Math.sin(f * .8 + sh.ph * 9)) : d < 3 ? sh.open * (1 - d / 3) : .35 * Math.exp(-(d - 3) / 3) * Math.abs(Math.sin((d - 3) * 1.3)); } sh.hg.rotation.y = -sh.s * a; }
    hero.glint.scale.setScalar((night ? 1.2 + 5 * fl : spring ? .9 : .01) / (hero.gs || 1));
  };
  update(0, 0, null);
  return { update, anchors: { fountain: [0, 0, .8], hero_apex: HERO, rival_top: [FAR[0], FAR[1], FAR[3]], road_exit: [6, 21, 0], arcade: [0, -12.4, 0], olive_stall: [4.3, 7.6, .9] } };
}
