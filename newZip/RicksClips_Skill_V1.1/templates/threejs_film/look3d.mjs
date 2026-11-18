// LOOK3D (kit 2026-11-15, CB on the lightning spear film: "iron speeer need metallic detail and the sky looks weired", "stomr bell made metallic gold.
// even the floor looks to vector with no textuire. the trees also"). OPT-IN features for set modules, handed to build(THREE, scene, film, ctx) as
//   ctx.pbr.metal(kind, opts)        iron | bronze | gold | brass | steel | wet : MeshPhysicalMaterial, env map from the place's own sky (PMREM), procedural normal + roughness
//   ctx.relief(kind, colorHex, opts) stone | brick | tile | cobble | plaster | wood | mud | bark | grass : toon light look + normal map + colour variation per stone / board
//   ctx.sky.clouds(opts)             storm kinds painted per pixel on the dome (anvil deck, storm wall, rain curtains, scud), clear-day lit soft cloud layers; kinds dusk-storm | clear-day | rain-overcast | night-storm
//   ctx.sky.flash(where, strength)   lights the storm clouds from inside around one direction / world point (a bolt); strength 0 = off
//   ctx.trees.tree(opts)             cypress | olive | oak | blossom : bark trunk, 2-3 forks, 20-60 leaf clusters of many leaf cards with a light and a shade side
// Switched on by film.json "kit3d": true | { pbr, relief, sky, trees } (places.<name>.kit3d overrides per place; false = all off for that place).
// With a feature OFF the same call returns what the old kit drew (the toon material, no clouds, a ball-and-stick tree), so one set renders both ways and
// films that never name kit3d are untouched. Every pow / sqrt / normalize / division in the shaders here is guarded (a not-a-number pixel renders black on the GPU).
// Docs: PBR_FEATURES.md. Proof: _pbr_test/.

import { makeFx } from './fx_bolt.mjs';   // FX BOLT HOOK (vfx-artist 2026-11-15): ctx.fx.bolt, code in fx_bolt.mjs, docs PBR_FEATURES.md "Lightning bolt"
const ON = { pbr: true, relief: true, sky: true, trees: true };
export function kit3dFlags(film, pl) {
  if (pl && pl.kit3d === false) return {};
  const n = v => v === true ? ON : v && typeof v === 'object' ? v : {};
  return { ...n(film && film.kit3d), ...n(pl && pl.kit3d) };
}

// ---------- tileable noise (all textures wrap seamlessly) ----------
function h2(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
const wrapI = (v, P) => ((v % P) + P) % P;
function vn(x, y, P, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, a = h2(wrapI(xi, P), wrapI(yi, P), s), b = h2(wrapI(xi + 1, P), wrapI(yi, P), s), c = h2(wrapI(xi, P), wrapI(yi + 1, P), s), d = h2(wrapI(xi + 1, P), wrapI(yi + 1, P), s), ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; }
function fbm(u, v, P, oct, s) { let sum = 0, amp = .5, nrm = 0, p = P; for (let o = 0; o < oct; o++) { sum += amp * vn(u * p, v * p, p, s + o * 17); nrm += amp; amp *= .5; p *= 2; } return sum / nrm; }
function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// tileable voronoi on a G x G jittered grid: F1, F2, id of the nearest cell
function voro(u, v, G, s, jit = .8) { const x = u * G, y = v * G, xi = Math.floor(x), yi = Math.floor(y); let f1 = 9, f2 = 9, id = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const cx = xi + i, cy = yi + j, wx = wrapI(cx, G), wy = wrapI(cy, G), px = cx + .5 + (h2(wx, wy, s) - .5) * jit, py = cy + .5 + (h2(wx, wy, s + 7) - .5) * jit, d = Math.hypot(px - x, py - y);
    if (d < f1) { f2 = f1; f1 = d; id = wy * G + wx; } else if (d < f2) f2 = d; }
  return [f1, f2, id]; }
const cl = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const hexRGB = h => { const c = parseInt(String(h).replace('#', ''), 16); return [(c >> 16 & 255) / 255, (c >> 8 & 255) / 255, (c & 255) / 255]; };

// height field (Float32 N*N) -> tangent-space normal map bytes (wraps)
function normalBytes(H, N, str) { const out = new Uint8ClampedArray(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const l = H[y * N + wrapI(x - 1, N)], r = H[y * N + wrapI(x + 1, N)], u = H[wrapI(y - 1, N) * N + x], d = H[wrapI(y + 1, N) * N + x];
    let nx = (l - r) * str, ny = (d - u) * str, nz = 1; const k = 1 / Math.sqrt(nx * nx + ny * ny + 1); nx *= k; ny *= k; nz *= k; const i = (y * N + x) * 4;
    out[i] = (nx * .5 + .5) * 255; out[i + 1] = (ny * .5 + .5) * 255; out[i + 2] = (nz * .5 + .5) * 255; out[i + 3] = 255; }
  return out; }
function dataTex(THREE, bytes, N, srgb) { const t = new THREE.DataTexture(bytes, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; }

// ---------- RELIEF patterns: each returns per pixel { h: height 0..1, k: colour factor, m: mix to the joint colour 0..1 } ----------
const RELIEF = {
  stone: { N: 512, str: 5, joint: .55, gen(u, v, s) {          // flagstones: rows of slabs of random length, bevelled, joints sunk
    const rows = 4, r = Math.floor(v * rows), fv = v * rows - r, off = h2(r, 0, s); let x = wrapI(u + off, 1) * 4, c = Math.floor(x), fx = x - c;
    const cut = .35 + .3 * h2(c, r, s + 3); let id = c * 2; if (h2(c, r, s + 9) > .75) { if (fx > cut) { fx = (fx - cut) / (1 - cut); id++; } else fx = fx / cut; }
    const e = Math.min(fx, 1 - fx, fv, 1 - fv) * 6 + (fbm(u, v, 8, 3, s) - .5) * .5, bev = sm(.02, .2, e), n = fbm(u, v, 6, 5, s + 11);
    return { h: bev * (.75 + .25 * n), k: .82 + .3 * h2(id, r, s + 5) + (n - .5) * .35, m: 1 - sm(.0, .09, e) }; } },
  brick: { N: 512, str: 5, joint: 1.25, gen(u, v, s) {
    const rows = 12, r = Math.floor(v * rows), fv = v * rows - r, x = wrapI(u + (r % 2) * .125, 1) * 4, c = Math.floor(x), fx = x - c, e = Math.min(fx / 3, (1 - fx) / 3, fv, 1 - fv) * 8, n = fbm(u, v, 16, 4, s);
    return { h: sm(.05, .35, e) * (.8 + .2 * n), k: .78 + .38 * h2(c, r, s) + (n - .5) * .3, m: 1 - sm(.05, .3, e) }; } },
  tile: { N: 512, str: 4, joint: .7, gen(u, v, s) {
    const G = 6, x = u * G, y = v * G, c = Math.floor(x), r = Math.floor(y), fx = x - c, fy = y - r, e = Math.min(fx, 1 - fx, fy, 1 - fy) * 10, n = fbm(u, v, 12, 3, s);
    return { h: sm(.1, .5, e) * (.92 + .08 * n), k: .86 + .24 * h2(c, r, s) + (n - .5) * .12, m: 1 - sm(.1, .4, e) }; } },
  cobble: { N: 512, str: 7, joint: .38, gen(u, v, s) {         // rounded setts: voronoi cells, domed, dark soil between
    const [f1, f2, id] = voro(u, v, 10, s, .55), e = f2 - f1, n = fbm(u, v, 10, 4, s + 3), dome = Math.sqrt(cl(e * 2.2)) * (.8 + .2 * cl(1 - f1 * 1.6));
    return { h: dome * (.85 + .15 * n), k: .74 + .45 * h2(id, 1, s) + (n - .5) * .3, m: 1 - sm(.03, .16, e) }; } },
  plaster: { N: 512, str: 2.2, joint: .72, gen(u, v, s) {
    const n = fbm(u, v, 4, 6, s), b = fbm(u, v, 3, 3, s + 5), cr = Math.abs(fbm(u, v, 5, 4, s + 9) - .5);
    return { h: n * .7 + b * .3 - (cr < .012 ? .3 : 0), k: .88 + (b - .5) * .35 + (n - .5) * .15, m: cr < .012 ? .7 : 0 }; } },
  wood: { N: 512, str: 4, joint: .35, gen(u, v, s) {           // planks along u: boards, grain, a knot now and then, dark gaps
    const B = 5, r = Math.floor(v * B), fv = v * B - r, L = Math.floor(wrapI(u + h2(r, 2, s), 1) * 2), fu = wrapI(u + h2(r, 2, s), 1) * 2 - L, e = Math.min(fv, 1 - fv, fu * 3, (1 - fu) * 3) * 12;
    const w = fbm(u, v, 4, 3, s + r), g = .5 + .5 * Math.sin((v * B * 22 + w * 9 + h2(r, L, s) * 6) * Math.PI), kx = fu - h2(r, L, s + 4), ky = fv - .5, knot = Math.exp(-(kx * kx * 120 + ky * ky * 30)) * (h2(r, L, s + 8) > .6 ? 1 : 0);
    return { h: sm(.05, .3, e) * (.85 + .1 * g) - knot * .2, k: .8 + .3 * h2(r, L, s + 1) + (g - .5) * .22 - knot * .3, m: 1 - sm(.05, .25, e) }; } },
  mud: { N: 512, str: 3.5, joint: .6, gen(u, v, s) {
    const n = fbm(u, v, 5, 6, s), p = fbm(u, v, 3, 3, s + 4), rut = Math.abs(Math.sin((v * 3 + fbm(u, v, 2, 2, s + 6) * .6) * Math.PI * 2));
    const wet = sm(.58, .66, p); return { h: n * (1 - wet) * .9 - (1 - rut) * .15, k: .9 + (n - .5) * .5 - wet * .25, m: wet * .5 }; } },
  bark: { N: 512, str: 6, joint: .45, gen(u, v, s) {           // vertical fissures (u around the trunk, v up it)
    const ridge = Math.abs(fbm(u, v * .25, 8, 4, s) - .5) * 2, f = sm(.02, .25, ridge), n = fbm(u, v, 16, 3, s + 2);
    return { h: f * (.7 + .3 * n), k: .8 + .35 * n, m: 1 - f }; } },
  grass: { N: 512, str: 3, joint: .7, gen(u, v, s) {           // turf: clumps, blade strokes, bare earth patches
    const c = fbm(u, v, 6, 4, s), bl = vn(u * 220, v * 60, 220, s + 3), bare = sm(.62, .7, fbm(u, v, 3, 3, s + 9));
    return { h: (c * .6 + bl * .4) * (1 - bare * .6), k: .78 + (c - .5) * .6 + (bl - .5) * .35, m: bare * .9 }; } },
};
const JOINT = { stone: '#5a5048', brick: '#cfc6b8', tile: '#bdb6aa', cobble: '#3e342c', plaster: '#8a8076', wood: '#2e2016', mud: '#3a2a1e', bark: '#2a1e16', grass: '#7a6248' };

// ---------- METAL presets ----------
const METAL = {
  iron:   { color: '#66708a', rough: .26, finish: 'hammered', nscale: .45, rust: .18, env: 1.4, coat: 0 },
  steel:  { color: '#b7c0cc', rough: .26, finish: 'brushed', nscale: .4, rust: 0, env: 1.2, coat: 0 },
  bronze: { color: '#cf9458', rough: .28, finish: 'cast', nscale: .5, patina: .22, env: 1.45, coat: 0 },
  gold:   { color: '#ffc55a', rough: .17, finish: 'smooth', nscale: .2, env: 1.6, coat: 1, coatRough: .05 },
  brass:  { color: '#dcae52', rough: .27, finish: 'brushed', nscale: .4, env: 1.35, coat: 0 },
  wet:    { color: '#3b3a3c', rough: .1, finish: 'cast', nscale: .3, env: 1.0, coat: 1, coatRough: .03, metal: 0 },
};
function metalField(finish, N, s) {                            // height of the metal surface
  const H = new Float32Array(N * N), R = rng(s * 7 + 3);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, v = y / N; H[y * N + x] = finish === 'brushed' ? vn(u * 3, v * 160, 3, s) * .6 + vn(u * 2, v * 40, 2, s + 1) * .4 : finish === 'cast' ? fbm(u, v, 5, 5, s) : fbm(u, v, 4, 3, s) * .25; }
  if (finish === 'hammered' || finish === 'smooth') { const n = finish === 'hammered' ? 420 : 90;   // overlapping hammer dimples (wrapped)
    for (let k = 0; k < n; k++) { const cx = R() * N, cy = R() * N, r = N * (.025 + R() * .035), dep = .5 + R() * .5, r2 = r * r;
      for (let j = Math.floor(cy - r); j <= cy + r; j++) for (let i = Math.floor(cx - r); i <= cx + r; i++) { const d2 = (i - cx) * (i - cx) + (j - cy) * (j - cy); if (d2 >= r2) continue; const q = 1 - d2 / r2; H[wrapI(j, N) * N + wrapI(i, N)] -= q * q * dep * .35; } } }
  if (finish === 'cast') for (let k = 0; k < 160; k++) { const cx = Math.floor(R() * N), cy = Math.floor(R() * N), r = 1 + Math.floor(R() * 3); for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) H[wrapI(cy + j, N) * N + wrapI(cx + i, N)] -= .25; }
  let lo = 1e9, hi = -1e9; for (const h of H) { if (h < lo) lo = h; if (h > hi) hi = h; } const sp = Math.max(1e-6, hi - lo); for (let i = 0; i < H.length; i++) H[i] = (H[i] - lo) / sp;
  return H; }

// ---------- the kit ----------
export function makeKit3d(THREE, scene, L, F, toon) {
  const used = { pbr: [], relief: [], clouds: [], tick: [] }, cache = makeKit3d.cache ||= new Map();
  const sunDir = new THREE.Vector3(...(L.dir || [-3, 10, 4])).normalize();

  // ---- relief ----
  const reliefGrad = (() => { const d = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t; })();   // the kit's 3 steps, blended, so the relief reads instead of speckling
  function reliefMaps(kind, color, seed) {
    const key = 'relief|' + kind + '|' + color + '|' + seed; if (cache.has(key)) return cache.get(key);
    const P = RELIEF[kind] || RELIEF.stone, N = P.N, H = new Float32Array(N * N), C = new Uint8ClampedArray(N * N * 4), base = hexRGB(color), jn = hexRGB(JOINT[kind] || '#4a4038'), jo = base.map((b, i) => b * P.joint * .5 + jn[i] * .5);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const o = P.gen(x / N, y / N, seed), i = y * N + x, k = cl(o.k, .3, 1.6), m = cl(o.m); H[i] = o.h; const ao = .72 + .28 * cl(o.h);   // cavities darker: the relief reads even where the light is flat
      for (let c = 0; c < 3; c++) C[i * 4 + c] = 255 * cl((base[c] * k * (1 - m) + jo[c] * m) * ao); C[i * 4 + 3] = 255; }
    const out = { map: dataTex(THREE, C, N, true), normal: dataTex(THREE, normalBytes(H, N, P.str), N, false) }; cache.set(key, out); return out; }
  function relief(kind, colorHex, opts = {}) {
    if (!F.relief) return toon(colorHex);
    const M = reliefMaps(kind, colorHex, opts.seed ?? 1), ns = opts.normal ?? 1;
    const m = new THREE.MeshToonMaterial({ color: '#ffffff', map: M.map, normalMap: M.normal, normalScale: new THREE.Vector2(ns, ns), gradientMap: reliefGrad });
    // metres per texture repeat (texel density). REAL = real-world size (2026-11-15 fix: cobble 0.18 m, flag 0.5 m, brick 0.23 x 0.077 m, roof tile row 0.3 m).
    // opts.scale keeps its old numbers but is read as a MULTIPLIER of the old default (LEGACY), so a set that passed scale keeps its proportion and shrinks with
    // the new real size; scale 1.4 on a cobble = exactly the default. opts.size = absolute metres per repeat (wins).
    const LEGACY = { cobble: 1.4, stone: 3.2, brick: 1.6, tile: 1.8, wood: 2.4, bark: 1.0, grass: 2.5, mud: 3, plaster: 3 }, REAL = { ...LEGACY, cobble: 1.8, stone: 2.0, brick: .92 }, lg = LEGACY[kind] || 2;
    m.userData.k3scale = opts.size ?? (REAL[kind] || 2) * (opts.scale ?? lg) / lg;
    m.userData.k3kind = kind; used.relief.push(m); return m; }

  // ---- pbr metal ----
  function metalMaps(kind, P, seed) {
    const key = 'metal|' + kind + '|' + P.finish + '|' + P.color + '|' + seed + '|' + (P.rust || 0) + '|' + (P.patina || 0); if (cache.has(key)) return cache.get(key);
    const N = 512, H = metalField(P.finish, N, seed), C = new Uint8ClampedArray(N * N * 4), RM = new Uint8ClampedArray(N * N * 4), base = hexRGB(P.color), rust = hexRGB('#8a4a26'), pat = hexRGB('#4f9a86');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x, u = x / N, v = y / N, h = H[i], n = fbm(u, v, 6, 4, seed + 31);
      const r = P.rust ? sm(1 - P.rust * .9, 1 - P.rust * .9 + .12, n * .7 + (1 - h) * .45) * .85 : 0, p = P.patina ? sm(.62 - P.patina * .4, .8 - P.patina * .4, (1 - h) * .75 + n * .35) : 0;   // rust on low, exposed spots; patina in the recesses
      const tone = .9 + .2 * n; for (let c = 0; c < 3; c++) C[i * 4 + c] = 255 * cl(base[c] * tone * (1 - r - p) + rust[c] * r + pat[c] * p); C[i * 4 + 3] = 255;
      RM[i * 4] = 255; RM[i * 4 + 1] = 255 * cl(P.rough * (.8 + .4 * n) + r * .5 + p * .4 + (1 - h) * .06, .04, 1); RM[i * 4 + 2] = 255 * cl((P.metal ?? 1) * (1 - r * .9 - p * .8)); RM[i * 4 + 3] = 255; }
    const out = { map: dataTex(THREE, C, N, true), rm: dataTex(THREE, RM, N, false), normal: dataTex(THREE, normalBytes(H, N, P.finish === 'brushed' ? 2.5 : 4), N, false) }; cache.set(key, out); return out; }
  function metal(kind = 'iron', opts = {}) {
    const P = { ...(METAL[kind] || METAL.iron), ...opts }; if (opts.color) P.color = opts.color;
    if (!F.pbr) return toon(opts.toon || P.color);
    const M = metalMaps(kind, P, opts.seed ?? 3), ns = P.nscale;
    const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: M.map, metalness: 1, roughness: 1, roughnessMap: M.rm, metalnessMap: M.rm, normalMap: M.normal, normalScale: new THREE.Vector2(ns, ns),
      clearcoat: P.coat || 0, clearcoatRoughness: P.coatRough ?? .1, envMapIntensity: P.env, specularIntensity: 1 });
    m.userData.k3scale = opts.scale ?? .6; m.userData.k3metal = kind; used.pbr.push(m); return m; }

  // ---- sky ----
  // 2026-11-15 cloud fix (lead on the lightning spear finals: clear day read as popcorn, storms as cauliflower). A cloud is now ONE mass: few large overlapping
  // puffs with low-frequency noise, lit by the CLOUD's shape (not each puff's ball), a flat soft base cut in world height, lit top / cool shaded underside,
  // large-scale value variation (storm: dark cores, rims lit only on the outer and upper puffs). clear-day = few big cumulus + a faint high thin layer.
  //   n: clouds per layer (x coverage) · tall: cloud height / half width · puffs: [min, extra] per cloud · ero: noise erosion of the edge (low = smooth)
  //   pw: weight of the puff's own ball normal (low = no bubbles) · vari: large-scale value variation · over: a mid-height layer seen from a low camera
  //   canopy: the high storm deck (x clouds) · cirrus: faint high streaks · det: fine crease shading inside a cloud (clear-day internal detail)
  // 2026-11-15 STORM fix (lead: storm kinds were soft blurred blobs, no drama). Storm kinds (night-storm, dusk-storm, rain-overcast) are now PAINTED PER PIXEL on
  // the dome, the way the lightning-spear hook's storm dome works (episodes/lightning-spear/sets/tower_top.js), generalised: domain-warped value-noise masses cut
  // with a narrow threshold (crisp but soft edge), dark cores, billow bellies lit from below, rims lit toward the sun / town light, a burnt or sodium underside,
  // 4 layers: a high anvil deck (planar, perspective toward the horizon), the mid storm wall (ragged towering top, ragged foot over a lighter horizon gap), rain
  // curtains hanging from the wall's foot, low dark scud (planar, drifts ~6x faster). Flash: sky.flash() lights the clouds from inside near the bolt only.
  //   storm: per-pixel dome · core/body/lit/under/scud/rain/flash colours · wallTop (sin elevation of the wall's top) · foot (its base) · deck/scudCov (0-1 coverage)
  //   rainAmt · underAmt (warm underside) · rimAmt · contrast (core darkness). Any of these can be passed in opts.colors (or opts.storm = { ... }).
  //   A set that passes opts.layers or dome:false keeps the sprite layers (the hook's own dome + kit layers in front); opts.puffs: true adds them to a storm dome.
  const SKY = {
    'dusk-storm':    { top: '#1a1233', mid: '#7a5a9a', hor: '#ffb27a', sun: '#ffb27a', glow: .9, lit: '#eaa58e', shade: '#2c2246', rim: '#ffd2a8', n: [5, 6, 7], cov: 1.2, tall: .5, dark: .55, canopy: 1, puffs: [16, 10], ero: .3, pw: .22, vari: .4, wid: [.2, .16],
      storm: { core: '#1c1030', body: '#4e2f78', slit: '#ffa682', srim: '#ffd8b0', under: '#f06a3c', scud: '#2a1838', rain: '#6a4a7c', flash: '#f4ecff', wallTop: .62, foot: .04, deck: .65, scudCov: .32, rainAmt: .75, underAmt: .85, rimAmt: 1, contrast: .9 } },
    'clear-day':     { top: '#2d6cc6', mid: '#5f9ae0', hor: '#cfe3f4', sun: '#fff3da', glow: .7, lit: '#ffffff', shade: '#a9bad6', rim: '#ffffff', n: [3, 4, 4], cov: .8, tall: .68, dark: .3, puffs: [20, 12], ero: .4, pw: .18, vari: .12, det: .32, wid: [.15, .1], over: { n: 4, el: [22, 46], d: 260, size: 1.15 }, cirrus: { n: 4, el: [28, 62], d: 430 } },
    'rain-overcast': { top: '#4c545f', mid: '#79828f', hor: '#a7aeb6', sun: '#dfe3e8', glow: .25, lit: '#c8ced6', shade: '#5f6774', rim: '#dde2e8', n: [6, 7, 8], cov: 1.5, tall: .28, dark: .28, canopy: 1.4, puffs: [14, 8], ero: .2, pw: .15, vari: .25, wid: [.24, .18],
      storm: { core: '#2e343d', body: '#58606b', slit: '#a9b1bb', srim: '#cdd3db', under: '#80858c', scud: '#3c424b', rain: '#6d7581', flash: '#eef2ff', wallTop: .95, foot: .03, deck: .8, scudCov: .45, rainAmt: 1, underAmt: .2, rimAmt: .45, contrast: .7 } },
    'night-storm':   { top: '#04060e', mid: '#1c2648', hor: '#3a4672', sun: '#a8bcff', glow: .35, lit: '#8b9fd4', shade: '#151b36', rim: '#c4d2ff', n: [5, 6, 6], cov: 1.2, tall: .45, dark: .55, canopy: 1, puffs: [16, 10], ero: .25, pw: .18, vari: .5, wid: [.22, .18],
      storm: { core: '#03050c', body: '#18203e', slit: '#8299d8', srim: '#b8c8ff', under: '#c4804c', scud: '#080b18', rain: '#2a3456', flash: '#dfe7ff', wallTop: .62, foot: .04, deck: .72, scudCov: .35, rainAmt: .8, underAmt: .55, rimAmt: 1, contrast: 1 } },
  };
  const NFL = 4, flashU = { dir: [...Array(NFL)].map(() => new THREE.Vector4(0, 1, 0, 0)), spread: [...Array(NFL)].map(() => .3) };   // shared by every storm dome and cloud layer
  let flashSlot = 0;
  const GLSL_FLASH = `uniform vec4 fl[${NFL}]; uniform float flS[${NFL}];
    float flashAt(vec3 d){ float g = 0.; for (int i = 0; i < ${NFL}; i++) { if (fl[i].w <= 0.) continue; float c = clamp(dot(d, fl[i].xyz), -1., 1.), an = acos(c), s = max(flS[i], 1e-3); g += fl[i].w * exp(-an * an / (s * s)); } return g; }`;
  function puffTex() { if (cache.has('puff2')) return cache.get('puff2'); const N = 128, D = new Uint8ClampedArray(N * N * 4);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, v = y / N, n = fbm(u, v, 2, 5, 77), i = (y * N + x) * 4; D[i] = D[i + 1] = D[i + 2] = 255 * n; D[i + 3] = 255; }   // low base frequency: soft billows, not bubbles
    const t = dataTex(THREE, D, N, false); cache.set('puff2', t); return t; }
  const domeOf = () => scene.children.find(o => o.isMesh && o.userData.noExport && o.geometry && o.geometry.parameters && o.geometry.parameters.radius === 400);
  function stormDome(K, S, sd, g) {
    let dome = domeOf(); if (!dome) { dome = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.MeshBasicMaterial()); dome.userData.noExport = true; dome.userData.k3env = true; dome.frustumCulled = false; dome.renderOrder = -30; g.add(dome); }
    const C = h => new THREE.Color(h), U = { top: C(K.top), mid: C(K.mid), hor: C(K.hor), sunC: C(K.sun), sunD: { value: sd.clone() }, glow: K.glow, t: 0,
      core: C(S.core), body: C(S.body), lit: C(S.slit), rimC: C(S.srim), under: C(S.under), scudC: C(S.scud), rain: C(S.rain), flashC: C(S.flash),
      wallTop: S.wallTop, foot: S.foot, deckCov: S.deck, scudCov: S.scudCov, rainAmt: S.rainAmt, underAmt: S.underAmt, rimAmt: S.rimAmt, contrast: S.contrast };
    const uniforms = {}; for (const [k, v] of Object.entries(U)) uniforms[k] = v && v.value !== undefined ? v : { value: v };
    uniforms.fl = { value: flashU.dir }; uniforms.flS = { value: flashU.spread };
    dome.material = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false, uniforms,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform vec3 top, mid, hor, sunC, sunD, core, body, lit, rimC, under, scudC, rain, flashC; uniform float glow, t, wallTop, foot, deckCov, scudCov, rainAmt, underAmt, rimAmt, contrast; varying vec3 vP;
        ${GLSL_FLASH}
        float hs(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
          return mix(mix(mix(hs(i), hs(i + vec3(1., 0., 0.)), f.x), mix(hs(i + vec3(0., 1., 0.)), hs(i + vec3(1., 1., 0.)), f.x), f.y),
                     mix(mix(hs(i + vec3(0., 0., 1.)), hs(i + vec3(1., 0., 1.)), f.x), mix(hs(i + vec3(0., 1., 1.)), hs(i + vec3(1., 1., 1.)), f.x), f.y), f.z); }
        float fbm(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++) { s += a * vn(p); p = p * 2.07 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
        float fb3(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++) { s += a * vn(p); p = p * 2.03 + vec3(5.1, 1.3, 7.7); a *= .5; } return s * 1.14; }
        void main(){ vec3 d = vP / max(length(vP), 1e-4); float h = d.y; vec2 hd = d.xz / max(length(d.xz), 1e-4);
          float tt = clamp(h * 1.5, 0., 1.);
          vec3 c = mix(hor, mid, smoothstep(0., .3, tt)); c = mix(c, top, smoothstep(.3, 1., tt));
          float s = clamp(dot(d, sunD), 0., 1.), sunFace = pow(clamp(dot(normalize(vec3(d.x, 0., d.z) + 1e-4), normalize(vec3(sunD.x, 0., sunD.z) + 1e-4)) * .5 + .5, 0., 1.), 2.);
          c += sunC * glow * (.3 * s * s * s * s + .8 * pow(max(s, 1e-4), 48.)) * (1. - clamp(-h * 6., 0., 1.));
          float F = flashAt(d);
          c += flashC * F * .22;                                                                                   /* the flash glows in the clear sky too */
          /* 1. the high anvil deck: a plane overhead, so it shrinks into the distance */
          if (h > .02) { vec2 pp = d.xz / (h + .14) * 1.15 + vec2(t * .004, t * .002); vec3 q = vec3(pp, 3.7);
            vec3 w = vec3(fb3(q * .7), fb3(q * .7 + 5.2), 0.); float D = fbm(q + 1.35 * w), Dl = fbm(q + 1.35 * w + vec3(sunD.xz * .1, 0.));
            float th = .66 - deckCov * .35, a = smoothstep(th - .015, th + .055, D) * smoothstep(.02, .14, h);
            float lump = clamp((D - Dl) * 7. + .5, 0., 1.), dep = clamp((D - th) * 3.2, 0., 1.), edge = 1. - smoothstep(0., .07, D - th);
            vec3 dc = mix(body, core, dep * contrast * .75) * (.72 + .56 * lump);
            dc += rimC * edge * lump * (.1 + .5 * sunFace) * rimAmt * .4 + flashC * F * (.3 + 1.1 * edge + .4 * lump) * (1. - .5 * dep);
            dc = mix(dc, mid, .3 * (1. - smoothstep(.06, .4, h)));                                                    /* far deck goes into the air */
            c = mix(c, dc, a); }
          /* 2. the storm wall: towering masses on a cylinder round the camera, ragged top against the lighter sky, ragged foot over the horizon gap */
          float topH = wallTop + .2 * (fb3(vec3(hd * 2.1, 4.1)) - .45);
          float ft = foot + .05 * fb3(vec3(hd * 3.2, 1.3)) + .025 * vn(vec3(hd * 11., 4.));
          if (h < topH + .2 && h > ft - .03) { vec3 q = vec3(hd.x * 3.0, h * 4.6, hd.y * 3.0) + vec3(t * .003, 0., 0.);
            vec3 w = vec3(fb3(q * .55 + 1.3), fb3(q * .55 + 7.7), fb3(q * .55 + 3.9));
            float cl = fbm(q + 1.5 * w), up = fbm(q + 1.5 * w + vec3(0., .22, 0.)), sl = fbm(q + 1.5 * w + vec3(sunD.x * .22, max(sunD.y, 0.) * .1, sunD.z * .22));
            float W = cl + .14 - smoothstep(topH - .2, topH + .1, h) * .66;
            float a = smoothstep(.47, .52, W) * smoothstep(ft - .004, ft + .022, h);
            float dep = clamp((W - .5) * 2.4, 0., 1.), edge = 1. - smoothstep(0., .07, W - .5);
            float belly = clamp((cl - up) * 3.4 + .5, 0., 1.), toL = clamp((cl - sl) * 5. + .5, 0., 1.);
            vec3 wc = mix(body, core, smoothstep(0., .7, dep) * contrast) * (.68 + .62 * belly);
            wc += lit * toL * sunFace * .35 * (1. - dep * .6);                                                          /* the side toward the low sun / key */
            wc = mix(wc, lit, edge * toL * toL * (.2 + .8 * sunFace) * rimAmt * .5);                          /* lit rims on the silhouette */
            float und = 1. - smoothstep(ft, ft + .17, h);
            wc = mix(wc, under, und * underAmt * (.3 + .6 * belly) * smoothstep(.3, .6, cl + .1) * (.5 + .5 * sunFace));
            wc *= 1. - .28 * smoothstep(.22, .75, h);                                                                   /* heavier overhead */
            wc += flashC * F * (.18 + .55 * (1. - dep) + 1.2 * edge) * (.55 + .7 * belly);                               /* lit from inside near the bolt */
            wc = mix(wc, hor, .22 * (1. - smoothstep(0., .1, h - ft)));                                                 /* the foot sits in the air */
            c = mix(c, wc, a); }
          /* 3. rain curtains hanging from the wall's foot into the gap (slanted, streaked) */
          float ang = h * .5; vec2 hr = vec2(hd.x * cos(ang) - hd.y * sin(ang), hd.x * sin(ang) + hd.y * cos(ang));
          float cm = smoothstep(.5, .7, fb3(vec3(hr * 2.6, 8.2 + t * .002))), st = .55 + .45 * vn(vec3(hr * 420., h * 4.));
          float band = smoothstep(-.03, .0, h) * (1. - smoothstep(ft + .02, ft + .2, h));
          c = mix(c, rain * st, cm * band * rainAmt * .72);
          /* 4. low scud: dark ragged rags close by, drifting fast */
          if (h > -.01 && h < .75) { vec2 sp = d.xz / (h + .07) * .5 + vec2(t * .022, t * .009); vec3 q = vec3(sp, 11.3);
            float S = fbm(q * 1.5 + .9 * vec3(fb3(q * .8), fb3(q * .8 + 2.), 0.));
            float a = smoothstep(1. - scudCov * .7, 1. - scudCov * .7 + .1, S) * smoothstep(-.01, .05, h) * (1. - smoothstep(.4, .75, h));
            vec3 sc = scudC * (.75 + .5 * S) + under * underAmt * .25 * (1. - smoothstep(0., .25, h)) + flashC * F * .7;
            c = mix(c, sc, a * .9); }
          if (h < 0.) c = mix(hor * .55, c, smoothstep(-.05, 0., h));
          gl_FragColor = vec4(max(c, vec3(0.)), 1.); }` });
    dome.material.userData.k3 = true; dome.visible = true; used.clouds.push(dome.material); return dome; }
  function flash(where, strength = 1, o = {}) {   // where: [x,y,z] direction | { pos: [x,y,z] } world point | THREE.Vector3 direction; strength 0 = off
    const slot = o.slot ?? (strength > 0 ? flashSlot++ % NFL : 0), v = flashU.dir[slot]; let d;
    if (where && where.pos) { const c = (domeOf() || { position: new THREE.Vector3() }).position; d = new THREE.Vector3(...where.pos).sub(c); }
    else d = where && where.isVector3 ? where.clone() : new THREE.Vector3(...(where || [0, 1, 0]));
    d.normalize(); v.set(d.x, d.y, d.z, Math.max(0, strength)); flashU.spread[slot] = o.spread ?? .3; return slot; }
  function clouds(opts = {}) {
    const g = new THREE.Group(); g.name = 'kit_clouds'; g.userData.noExport = true; if (!F.sky) return g;
    const K = { ...(SKY[opts.kind] || SKY['dusk-storm']), ...(opts.colors || {}) }, R = rng(opts.seed ?? 11), cov = opts.coverage ?? K.cov, sd = opts.sunDir ? new THREE.Vector3(...opts.sunDir).normalize() : sunDir;
    const S = K.storm && { ...K.storm, ...Object.fromEntries(Object.entries(opts.colors || {}).filter(([k]) => k in K.storm)), ...(opts.storm || {}) };
    const painted = S && opts.dome !== false && !opts.layers;
    if (painted) stormDome(K, S, sd, g);
    else if (opts.dome !== false) { const dome = domeOf(); if (dome) { dome.material = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { top: { value: new THREE.Color(K.top) }, mid: { value: new THREE.Color(K.mid) }, hor: { value: new THREE.Color(K.hor) }, sunC: { value: new THREE.Color(K.sun) }, sunD: { value: sd.clone() }, glow: { value: K.glow } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform vec3 top, mid, hor, sunC, sunD; uniform float glow; varying vec3 vP;
        void main(){ vec3 d = vP / max(length(vP), 1e-4); float y = d.y, t = clamp(y * 1.5, 0., 1.);
          vec3 c = mix(hor, mid, smoothstep(0., .32, t)); c = mix(c, top, smoothstep(.28, 1., t)); c = mix(c, hor * .55, clamp(-y * 5., 0., 1.));
          float s = clamp(dot(d, sunD), 0., 1.); c += sunC * glow * (.28 * s * s * s * s + .9 * pow(max(s, 1e-4), 48.)) * (1. - clamp(-y * 6., 0., 1.));
          gl_FragColor = vec4(c, 1.); }` }); dome.material.userData.k3 = true; } }
    if (!painted || opts.puffs) {
    const tex = puffTex(), hor = new THREE.Color(K.hor);
    const layers = opts.layers || [{ d: 120, fade: .08, size: 1 }, { d: 200, fade: .3, size: 1 }, { d: 320, fade: .55, size: 1.1 },
      ...(K.over ? [{ d: K.over.d, fade: .15, size: K.over.size, n: K.over.n, el: K.over.el }] : []),
      ...(K.canopy ? [{ d: 240, fade: .2, size: 2.2, n: Math.round(6 * K.canopy), el: [24, 58], canopy: true }] : []),
      ...(K.cirrus && opts.cirrus !== false ? [{ d: K.cirrus.d, fade: .35, size: 1.6, n: K.cirrus.n, el: K.cirrus.el, cirrus: true }] : [])];
    const arc = opts.arc ? opts.arc.map(a => a * Math.PI / 180) : [0, Math.PI * 2];
    layers.forEach((Ly, li) => { const nC = Math.max(1, Math.round((Ly.n ?? K.n[li % 3]) * cov)), pos = [], prm = [], ctr = [], bas = [];
      for (let c = 0; c < nC; c++) { const a = arc[0] + (arc[1] - arc[0]) * (c + .3 + .4 * R()) / nC, el = Ly.el ? Ly.el[0] + R() * (Ly.el[1] - Ly.el[0]) : (opts.minEl ?? 3) + R() * ((opts.maxEl ?? 26) - (opts.minEl ?? 3)) * (li === 0 ? .7 : 1), d = Ly.d * (.85 + .3 * R());
        const C = new THREE.Vector3(Math.cos(a) * d, Math.tan(el * Math.PI / 180) * d + (opts.base ?? 0), Math.sin(a) * d), w = d * (K.wid[0] + K.wid[1] * R()) * (Ly.size ?? 1) * (opts.scale ?? 1);
        const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));   // the cloud spreads along the ring, across the view
        if (Ly.cirrus) {   // faint high streaks: a few long flat wisps
          const nP = 7 + Math.floor(R() * 5); for (let p = 0; p < nP; p++) { const s = R() * 2 - 1, q = C.clone().addScaledVector(side, s * w * 1.2).add(new THREE.Vector3(0, (R() - .5) * w * .08, 0));
            pos.push(q.x, q.y, q.z); ctr.push(C.x, C.y, C.z); bas.push(-1e5, 1, w * 1.5, 1); prm.push(w * (.35 + .3 * R()), R() * 100, .8, 0); } continue; }
        const hgt = w * (Ly.canopy ? .14 : K.tall * (.8 + .4 * R())), nP = K.puffs[0] + Math.floor(R() * K.puffs[1]), base = C.y;
        for (let p = 0; p < nP; p++) { const s = (R() * 2 - 1) * (p < 3 ? .3 : 1), sz = w * (.42 + .3 * R()) * (1 - .45 * s * s) * (Ly.canopy ? 1.15 : 1), up = Math.pow(R(), 1.2) * hgt * (1 - .55 * s * s);
          const q = C.clone().addScaledVector(side, s * w * .85).addScaledVector(out, (R() - .5) * w * .5); q.y = base + Math.max(sz * .35, up);   // puff centres sit above the base: the base plane cuts them flat
          pos.push(q.x, q.y, q.z); ctr.push(C.x, base + hgt * .35, C.z); bas.push(base, Math.max(hgt, 1e-3), w, Ly.canopy ? 0 : 1); prm.push(sz, R() * 100, cl(up / Math.max(hgt, 1e-3)), R() * 6.283); } }
      // far to near inside the layer, so soft edges blend in order (the camera stands near the ring centre)
      const idx = [...Array(pos.length / 3).keys()].sort((i, j) => Math.hypot(pos[j * 3], pos[j * 3 + 2]) - Math.hypot(pos[i * 3], pos[i * 3 + 2]));
      const P = new Float32Array(idx.length * 3), Q = new Float32Array(idx.length * 4), Cc = new Float32Array(idx.length * 3), B = new Float32Array(idx.length * 4);
      idx.forEach((s, k) => { P.set(pos.slice(s * 3, s * 3 + 3), k * 3); Q.set(prm.slice(s * 4, s * 4 + 4), k * 4); Cc.set(ctr.slice(s * 3, s * 3 + 3), k * 3); B.set(bas.slice(s * 4, s * 4 + 4), k * 4); });
      const geo = new THREE.InstancedBufferGeometry(); const pl = new THREE.PlaneGeometry(1, 1); geo.index = pl.index; geo.setAttribute('position', pl.attributes.position); geo.setAttribute('uv', pl.attributes.uv);
      geo.setAttribute('iPos', new THREE.InstancedBufferAttribute(P, 3)); geo.setAttribute('iPrm', new THREE.InstancedBufferAttribute(Q, 4)); geo.setAttribute('iCtr', new THREE.InstancedBufferAttribute(Cc, 3)); geo.setAttribute('iBase', new THREE.InstancedBufferAttribute(B, 4)); geo.instanceCount = idx.length;
      const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, toneMapped: false,
        uniforms: { tex: { value: tex }, sunD: { value: sd.clone() }, lit: { value: new THREE.Color(K.lit) }, shade: { value: new THREE.Color(K.shade) }, rim: { value: new THREE.Color(K.rim) }, fogC: { value: hor }, fade: { value: Ly.fade }, dark: { value: K.dark }, t: { value: 0 },
          op: { value: (opts.opacity ?? 1) * (Ly.cirrus ? .32 : 1) }, ero: { value: Ly.cirrus ? .6 : K.ero }, pw: { value: K.pw }, vari: { value: K.vari }, det: { value: K.det ?? .1 }, asp: { value: Ly.cirrus ? 4.5 : 1 }, big: { value: 1 / Math.max(Ly.d * .35, 1) },
          fl: { value: flashU.dir }, flS: { value: flashU.spread }, flashC: { value: new THREE.Color(S ? S.flash : '#eef2ff') } },
        vertexShader: `attribute vec3 iPos, iCtr; attribute vec4 iPrm, iBase; uniform float t, asp; varying vec2 vUv; varying vec3 vW, vN, vWp, vC; varying float vUp, vRot, vSeed, vOut, vCum; varying vec2 vB;
          void main(){ vec3 p = iPos + vec3(sin(t * .03 + iPrm.y) * 1.5, 0., cos(t * .025 + iPrm.y) * 1.5); vec4 mv = modelViewMatrix * vec4(p, 1.); vec2 o = position.xy * iPrm.x * vec2(asp, 1.); mv.xy += o;
            vec3 rgt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), upv = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]); vWp = p + rgt * o.x + upv * o.y;   // this pixel's world point (flat base, height shading)
            vUv = uv; vW = p; vec3 dn = iPos - iCtr; vN = dn / max(length(dn), 1e-3); vUp = iPrm.z; vRot = iPrm.w; vSeed = iPrm.y; vB = iBase.xy; vOut = iBase.z; vCum = iBase.w; vC = iCtr; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform sampler2D tex; uniform vec3 sunD, lit, shade, rim, fogC, flashC; uniform float fade, dark, op, ero, pw, vari, big, det; varying vec2 vUv; varying vec3 vW, vN, vWp, vC; varying float vUp, vRot, vSeed, vOut, vCum; varying vec2 vB;
          ${GLSL_FLASH}
          void main(){ vec2 q = vUv * 2. - 1.; float r2 = dot(q, q); if (r2 >= 1.) discard;
            float cs = cos(vRot), sn = sin(vRot); vec2 ru = mat2(cs, -sn, sn, cs) * q * .3 + vec2(fract(vSeed * .37), fract(vSeed * .71));
            float n = texture2D(tex, ru).r, n2 = texture2D(tex, ru * 1.7 + .5).r, n3 = texture2D(tex, ru * 3.1 + .2).r, dens = (1. - r2) * (1. - ero + ero * (n * 1.25 + n2 * .55));
            float hb = vWp.y - vB.x, hRel = clamp(hb / vB.y, 0., 1.);
            float a = smoothstep(.0, .65, dens * (1. - r2 * .35)) * smoothstep(0., vB.y * .1, hb) * op; if (a < .004) discard;   // soft flat base
            vec3 nv = vec3(q, sqrt(max(1. - r2, 0.))); vec3 nw = (vec4(nv, 0.) * viewMatrix).xyz; vec3 dc = vWp - vC; dc.y *= 1.6; float rad = length(dc) / max(vOut, 1e-3); vec3 cn = dc / max(length(dc), 1e-3);   // the CLOUD's normal at this pixel
            vec3 nn = nw * pw * .5 + cn + vec3(0., (hRel - .35) * .8 * vCum, 0.); nn = nn / max(length(nn), 1e-4);
            float dl = dot(nn, sunD), wrapL = clamp(dl * .5 + .5, 0., 1.);
            float L = clamp(wrapL * .75 + mix(hRel, .5, 1. - vCum) * .55 - .15 + det * (n3 - .5) * 1.2, 0., 1.);   // lit tops, shaded undersides, fine creases (det)
            float bn = texture2D(tex, vWp.xz * big * .5 + vSeed * .001).r, core = clamp(1. - rad, 0., 1.) * (1. - hRel * .7);   // large-scale variation, dark cores
            vec3 c = mix(shade, lit, L * L * (3. - 2. * L)) * (1. - dark * .55 * core * (1. - L)) * (1. - vari * .5 + vari * bn);
            vec3 V = vW - cameraPosition; V = V / max(length(V), 1e-3); float fw = clamp(dot(V, sunD), 0., 1.); fw = fw * fw; fw = fw * fw;
            float sil = 1. - abs(dot(cn, V)), rw = smoothstep(.55, 1., rad) * sil * clamp(.4 + hRel, 0., 1.);   // rim on the cloud's own silhouette, never on each puff
            c += rim * rw * (.25 * clamp(dl, 0., 1.) + 1.3 * fw);   // (was commented out by a stray comment until the storm fix)
            c += flashC * flashAt(V) * (.35 + .9 * rw) * (1. - .5 * core);
            c = mix(c, fogC, fade); gl_FragColor = vec4(c, a); }` });
      const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = -20 - Ly.d * .01; mesh.name = 'kit_cloud_layer_' + li; mesh.userData.noExport = true; mesh.userData.k3env = true; g.add(mesh); used.clouds.push(mat); }); }
    if (!used.cloudTick) { used.cloudTick = true; used.tick.push(t => { for (const m of used.clouds) if (m.uniforms.t) m.uniforms.t.value = t; }); }
    scene.add(g); return g; }

  // ---- trees ----
  const TREE = {
    cypress: { h: 9, trunk: .12, r0: .22, leaf: '#2c4a2a', leaf2: '#3d5e33', clusters: 56, perCl: 70, leafSize: .26, crownW: 1.0 },
    olive:   { h: 4.2, trunk: .38, r0: .2, leaf: '#7f9268', leaf2: '#a8b49a', clusters: 34, perCl: 70, leafSize: .26, crownW: 2.4 },
    oak:     { h: 7, trunk: .38, r0: .34, leaf: '#4a6a30', leaf2: '#6f8f42', clusters: 48, perCl: 80, leafSize: .36, crownW: 3.4 },
    blossom: { h: 4.5, trunk: .4, r0: .17, leaf: '#f4d6e2', leaf2: '#fff4f6', green: '#7a9a50', clusters: 36, perCl: 70, leafSize: .26, crownW: 2.3 },
  };
  function leafTex(kind) { const key = 'leaf|' + kind; if (cache.has(key)) return cache.get(key); const N = 128, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'), R = rng(kind.length * 31);
    g.clearRect(0, 0, N, N); const sprig = kind === 'cypress' ? 9 : kind === 'blossom' ? 5 : 6;
    for (let i = 0; i < sprig; i++) { const a = (i / sprig) * Math.PI * 2 + R() * .5, x = N / 2 + Math.cos(a) * N * .2, y = N / 2 + Math.sin(a) * N * .2, l = N * (kind === 'cypress' ? .2 : .26), w = l * (kind === 'olive' ? .22 : kind === 'cypress' ? .5 : kind === 'blossom' ? .9 : .5);
      g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); const v = 170 + R() * 85; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(0, 0, w, l, 0, 0, 7); g.fill();
      if (kind !== 'blossom') { g.strokeStyle = 'rgba(90,90,90,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -l * .9); g.lineTo(0, l * .9); g.stroke(); } else { g.fillStyle = 'rgb(200,150,90)'; g.beginPath(); g.arc(0, 0, w * .25, 0, 7); g.fill(); } g.restore(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; cache.set(key, t); return t; }
  function mergeGeos(list) {                                   // positions + normals + uvs of many geometries into one (one draw call per trunk)
    const P = [], N = [], U = []; for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); U.push(...g.attributes.uv.array); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.userData.k3uvDone = true; return g; }
  function limb(a, b, r1, r2, uvS) {                           // tapered cylinder from a to b, its UVs in metres / uvS (bark texel density)
    const len = Math.max(1e-3, a.distanceTo(b)), g = new THREE.CylinderGeometry(r2, r1, len, 9, 1, true), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.PI * (r1 + r2) / uvS, uv.getY(i) * len / uvS);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), q, new THREE.Vector3(1, 1, 1))); return g; }
  function tree(opts = {}) {
    const kind = TREE[opts.kind] ? opts.kind : 'oak', T = { ...TREE[kind], ...opts }, S = (opts.height ?? T.h) / T.h, R = rng(opts.seed ?? 5), g = new THREE.Group(); g.name = 'tree_' + kind;
    const barkCol = opts.bark || (kind === 'olive' ? '#7a6e60' : kind === 'cypress' ? '#5a4636' : '#5e4a3a');
    const mark = (m, nm, role) => { m.name = nm; m.userData.role = role; m.castShadow = true; m.receiveShadow = true; return m; };
    if (opts.at) g.position.copy(new THREE.Vector3(opts.at[0], opts.at[2] || 0, -opts.at[1]));
    if (!F.trees) {                                            // the old kit tree: a stick and a ball (or a cone for the cypress)
      g.add(mark(new THREE.Mesh(new THREE.CylinderGeometry(T.r0 * .6 * S, T.r0 * S, T.h * S * (kind === 'cypress' ? .2 : .5), 10), toon(barkCol)), 'tree_trunk', 'wood')).position.y = T.h * S * (kind === 'cypress' ? .1 : .25);
      const crown = kind === 'cypress' ? new THREE.ConeGeometry(T.crownW * .55 * S, T.h * S * .9, 12) : new THREE.SphereGeometry(T.crownW * .55 * S, 12, 9), cm = mark(new THREE.Mesh(crown, toon(T.leaf)), 'tree_crown', 'foliage'); cm.position.y = kind === 'cypress' ? T.h * S * .55 : T.h * S * .68; g.add(cm);
      if (opts.parent !== false) (opts.parent || scene).add(g); return g; }
    const limbs = [], tips = [], up = new THREE.Vector3(0, 1, 0);
    // trunk (olive: two or three twisting stems from low down)
    const stems = kind === 'olive' ? 2 + (R() > .5 ? 1 : 0) : 1, th = T.h * S * T.trunk;
    for (let s = 0; s < stems; s++) { let p = new THREE.Vector3(0, -.05, 0), r = T.r0 * S * (stems > 1 ? .7 : 1); const lean = new THREE.Vector3((R() - .5) * (stems > 1 ? .9 : .15), 1, (R() - .5) * (stems > 1 ? .9 : .15)).normalize(); const segs = kind === 'cypress' ? 3 : 4;
      for (let k = 0; k < segs; k++) { const dir = lean.clone().add(new THREE.Vector3((R() - .5) * .35, 0, (R() - .5) * .35)).normalize(), q = p.clone().addScaledVector(dir, th / segs); limbs.push(limb(p, q, r, r * .88, .7)); p = q; r *= .88; }
      // branch forks: 2-3 per level, 3 levels
      const grow = (o, d, len, r, lvl) => { const n = lvl === 0 ? 2 + (R() > .4 ? 1 : 0) : 2 + (R() > .7 ? 1 : 0);
        for (let i = 0; i < n; i++) { const az = (i / n) * Math.PI * 2 + R() * 1.2, spread = kind === 'cypress' ? .18 : kind === 'oak' ? .75 : .6, nd = d.clone().multiplyScalar(1 - spread).add(new THREE.Vector3(Math.cos(az) * spread, .25 + R() * .3, Math.sin(az) * spread)).normalize();
          const e = o.clone().addScaledVector(nd, len * (.8 + .4 * R())); limbs.push(limb(o, e, r, r * .62, .5)); if (lvl < 2) grow(e, nd, len * .68, r * .62, lvl + 1); else tips.push(e); if (lvl >= 1) tips.push(o.clone().lerp(e, .6)); } };
      if (kind !== 'cypress') grow(p, up.clone().lerp(lean, .5).normalize(), (T.h * S - th) * .42, r * .8, 0); }
    const bark = relief('bark', barkCol, { scale: .7, seed: 4 }); const trunk = mark(new THREE.Mesh(mergeGeos(limbs), bark), 'tree_trunk', 'wood'); g.add(trunk);
    // leaf clusters: cypress = a dense spindle up the stem; the others = branch tips plus fill inside the crown hull
    const cls = [], crownR = T.crownW * S * .5;
    if (kind === 'cypress') { const H = T.h * S; for (let i = 0; i < T.clusters; i++) { const y = H * (.08 + .9 * (i + R()) / T.clusters), prof = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(y / H, .8))), .7), rr = crownR * prof, a = R() * 6.283; cls.push({ c: new THREE.Vector3(Math.cos(a) * rr * .45, y, Math.sin(a) * rr * .45), r: rr * .75 + .12 * S }); } }
    else { const top = tips.reduce((m, p) => Math.max(m, p.y), 0), ctr = new THREE.Vector3(0, top - crownR * .55, 0);
      for (const p of tips) cls.push({ c: p, r: crownR * (.32 + .18 * R()) }); while (cls.length < T.clusters) { const d = new THREE.Vector3(R() * 2 - 1, (R() * 2 - 1) * .7, R() * 2 - 1); if (d.lengthSq() > 1) continue; cls.push({ c: ctr.clone().addScaledVector(d, crownR * .85), r: crownR * (.28 + .15 * R()) }); }
      cls.splice(60); }
    const cards = cls.length * T.perCl, geo = new THREE.PlaneGeometry(T.leafSize * S * 1.6, T.leafSize * S * 1.6), lt = leafTex(kind);
    const lm = new THREE.MeshToonMaterial({ color: '#ffffff', map: lt, alphaTest: .45, side: THREE.DoubleSide, gradientMap: reliefGrad });
    const im = mark(new THREE.InstancedMesh(geo, lm, cards), 'tree_leaves', 'foliage'); im.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: lt, alphaTest: .45 });
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), col = new THREE.Color(), c1 = new THREE.Color(T.leaf), c2 = new THREE.Color(T.leaf2), cg = T.green ? new THREE.Color(T.green) : null, hull = new THREE.Vector3();
    cls.forEach(c => hull.add(c.c)); hull.multiplyScalar(1 / Math.max(1, cls.length)); let k = 0;
    for (const C of cls) for (let i = 0; i < T.perCl; i++) {
      const d = new THREE.Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1); if (d.lengthSq() < 1e-4) d.set(0, 1, 0); d.normalize(); const rr = C.r * (.35 + .65 * Math.cbrt(R())), p = C.c.clone().addScaledVector(d, rr);
      const out = p.clone().sub(hull); out.y *= .6; const nrm = d.clone().multiplyScalar(.6).add(out.normalize().multiplyScalar(.4)).add(new THREE.Vector3(0, .25, 0)).normalize();   // the card faces out of its cluster and out of the crown: a lit side and a shade side
      Q.setFromUnitVectors(Z, nrm); Q.multiply(new THREE.Quaternion().setFromAxisAngle(Z, R() * 6.283)); const sc = .7 + .6 * R(); M.compose(p, Q, new THREE.Vector3(sc, sc, sc)); im.setMatrixAt(k, M);
      const inner = cl(rr / Math.max(C.r, 1e-3)) * .5 + cl(p.distanceTo(hull) / Math.max(crownR, .3)) * .5;   // deep inside the crown = darker (ambient occlusion)
      col.copy(c1).lerp(c2, R() * .6 + (kind === 'olive' && R() > .6 ? .4 : 0)); if (cg && R() < .3) col.copy(cg); col.multiplyScalar(.55 + .55 * inner); im.setColorAt(k, col); k++; }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; g.add(im);
    const sway = R() * 6.283; used.tick.push(t => { im.rotation.z = Math.sin(t * .9 + sway) * .012; im.rotation.x = Math.cos(t * .7 + sway) * .008; });   // wind micro motion
    if (opts.parent !== false) (opts.parent || scene).add(g); return g; }

  // ---- after the set is built: texel density UVs, the env map from the place's own sky ----
  function boxUV(mesh, scale) {
    let g = mesh.geometry; if (!g || !g.attributes.position || g.userData.k3uvDone) return; g = mesh.geometry = g.clone(); const ws = new THREE.Vector3(); mesh.updateWorldMatrix(true, false); mesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), ws);
    const P = g.attributes.position, Nn = g.attributes.normal, n = P.count, uv = new Float32Array(n * 2), t = g.type, pr = g.parameters || {};
    if (/^(Cylinder|Cone|Lathe|Sphere|Torus|Tube|Capsule)Geometry$/.test(t) && g.attributes.uv) { const U = g.attributes.uv, r = (pr.radiusTop ?? pr.radius ?? pr.tube ?? .5) * Math.max(ws.x, ws.z), h = (pr.height ?? pr.length ?? (pr.radius || .5) * 2) * ws.y, circ = Math.PI * 2 * Math.max(r, .01);
      const su = t === 'TubeGeometry' ? (pr.path ? pr.path.getLength() : 1) * Math.max(ws.x, ws.y, ws.z) : circ, sv = t === 'TubeGeometry' ? Math.PI * 2 * (pr.radius || .05) : t === 'TorusGeometry' ? Math.PI * 2 * (pr.radius || .5) : Math.max(h, .01);
      for (let i = 0; i < n; i++) { uv[i * 2] = U.getX(i) * su / scale; uv[i * 2 + 1] = U.getY(i) * sv / scale; } }
    else for (let i = 0; i < n; i++) { const x = P.getX(i) * ws.x, y = P.getY(i) * ws.y, z = P.getZ(i) * ws.z, ax = Nn ? Math.abs(Nn.getX(i)) : 0, ay = Nn ? Math.abs(Nn.getY(i)) : 1, az = Nn ? Math.abs(Nn.getZ(i)) : 0;
      const [a, b] = ay >= ax && ay >= az ? [x, z] : ax >= az ? [z, y] : [x, y]; uv[i * 2] = a / scale; uv[i * 2 + 1] = b / scale; }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.userData.k3uvDone = true; }
  function finish(renderer, update) {
    if (!used.pbr.length && !used.relief.length && !used.clouds.length && !used.tick.length) return update;   // nothing of the kit3d used: the place is exactly as before
    scene.updateMatrixWorld(true);
    scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && m.userData && m.userData.k3scale) boxUV(o, m.userData.k3scale); });
    if (used.pbr.length) {
      // studio strips far out in the sky (env only, never seen): a warm key strip on the key side and a cool rim strip opposite, so every curve gets ONE clean highlight
      const K = SKY[F.skyKind] || null, keyC = new THREE.Color(L.sun || '#ffffff'), rimC = new THREE.Color(K ? K.rim : (L.amb || '#9fb6ff')), envOnly = [];
      const strip = (dir, w, h, c, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(k), side: THREE.DoubleSide, fog: false, toneMapped: false })); m.position.copy(dir).multiplyScalar(300); m.lookAt(0, 0, 0); scene.add(m); envOnly.push(m); return m; };
      const kd = new THREE.Vector3(sunDir.x, Math.max(.12, Math.min(.5, sunDir.y)), sunDir.z).normalize(), rd = new THREE.Vector3(-sunDir.x, .25, -sunDir.z).normalize();
      const kv = new THREE.Vector3(sunDir.x, .08, sunDir.z).normalize(), rv = new THREE.Vector3(-sunDir.x * .6 - .4 * Math.sign(sunDir.x || 1) * 0, .08, -sunDir.z).normalize();
      strip(kv, 40, 420, keyC, 22); strip(kd, 220, 60, keyC, 4); strip(rv, 30, 420, rimC, 9); strip(new THREE.Vector3(-kv.z, .08, kv.x), 18, 420, keyC.clone().lerp(rimC, .5), 1.6); strip(new THREE.Vector3(0, 1, 0), 150, 150, new THREE.Color('#ffffff').lerp(rimC, .5), 1.1);
      const ground = new THREE.Mesh(new THREE.CircleGeometry(380, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(F.envGround || '#2e2630'), fog: false, toneMapped: false })); ground.rotation.x = -Math.PI / 2; ground.position.y = -3; scene.add(ground); envOnly.push(ground);
      const hidden = []; scene.traverse(o => { if (o === scene || !o.visible) return; const keep = envOnly.includes(o) || o.userData.k3env || o === domeOf() || o.isLight || (o.isGroup && o.name === 'kit_clouds'); if (!keep && (o.isMesh || o.isPoints || o.isSprite || o.isLine)) { o.visible = false; hidden.push(o); } });
      const fog = scene.fog; scene.fog = null; const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(scene, .015, .5, 1000).texture; pm.dispose(); scene.fog = fog;
      for (const o of hidden) o.visible = true; for (const o of envOnly) { scene.remove(o); o.geometry.dispose(); }
      for (const m of used.pbr) { m.envMap = env; m.needsUpdate = true; } }
    if (!used.tick.length) return update;
    return (f, t, R) => { for (const fn of used.tick) fn(t); if (update) return update(f, t, R); };
  }
  F.skyKind = undefined;
  const sky = { clouds: o => { F.skyKind = o && o.kind || 'dusk-storm'; return clouds(o); }, flash, kinds: Object.keys(SKY) };   // sky.flash(where, strength, { spread, slot }): see the storm fix note above
  const fx = makeFx(THREE, scene, L, used.tick);   // FX BOLT HOOK (vfx-artist 2026-11-15): always available (not gated by kit3d); adds nothing until a set calls fx.bolt()
  return { fx, pbr: { metal, kinds: Object.keys(METAL), on: !!F.pbr }, relief: Object.assign(relief, { kinds: Object.keys(RELIEF), on: !!F.relief }), sky: Object.assign(sky, { on: !!F.sky }), trees: { tree, kinds: Object.keys(TREE), on: !!F.trees }, finish };
}
