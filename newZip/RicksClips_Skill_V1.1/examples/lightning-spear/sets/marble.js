// SET S3 (stretch builder, 2026-11-15, rough board): THE RIVAL'S MARBLE TOWER on the far hill, close up. Northern Italy, about 1765.
// Stands AT the world constant RIVAL (tower_top.js, never edited): foot at z RIVAL.base, angel top at about RIVAL.top. The town, the near hill and the hero's
// tower come from tower_top.js build() (its rough far rival tower, dusk sky and fog are switched off here and replaced).
// Parts: paved terrace, door with portal and steps, plinth, white marble shaft (courses, vertical joints, lavender bands with a gold fillet, corner pilasters),
// cornice with dentils, belfry with one big arch per face, WOODEN shingle roof (the only thing that may burn), pedestal, the GOLD ANGEL with a trumpet
// (states: on the crane, seated, struck = knocked off the peak, trumpet bent like a noodle, black crack down the marble), top scaffold + rope crane,
// white road with dark cypresses; inside the arches THE BELL CHAMBER: plank floor, timber bell frame, headstock, wheel, rope, the giant bronze bell
// (mouldings, clapper, the founder's mark), a polishing plank on trestles, the stair hatch. Night: the kit bolts (ctx.fx.bolt) with the flash on the world and in the storm.
// Everything is driven by film.json places.<name>.m (frames are the film.json's own frames). Plan metres, Z up. pow / sqrt / divisions guarded.
import { APEX, RIVAL, TOWN_Z, SPEAR, build as buildWorld } from './tower_top.js';
import { dress } from './marble_dress.js';
export const TH = RIVAL.top - RIVAL.base;                 // 54 m
export const GROUND_U = .25, GROUND_Z = RIVAL.base + GROUND_U;   // the terrace round the foot
export const FLOOR_U = 36.9, FLOOR_Z = RIVAL.base + FLOOR_U;     // bell chamber floor
export const DECK_U = 50.0, DECK_Z = RIVAL.base + DECK_U;        // top scaffold deck
export const PED_U = 50.8;                                       // top of the angel's pedestal
export const PIVOT = 3.3, BELL_L = 2.7, BELL_R = 1.5;            // headstock axis above the chamber floor, bell length, mouth radius
export const hillZ = (x, y) => { const dx = (x - (RIVAL.x + 4)) / 105, dy = (y - (RIVAL.y + 14)) / 70; return TOWN_Z - .2 + (RIVAL.base + .5 - TOWN_Z) * Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)); };
export const roadZ = y => { const d = RIVAL.y - y, u = Math.min(1, Math.max(0, (d - 9) / 9)), s = u * u * (3 - 2 * u); return GROUND_Z + (hillZ(RIVAL.x, y) + .2 - GROUND_Z) * s; };
const SN = [0, .05, .16, .31, .48, .66, .79, .88, .93, .96, .98, .99, 1];
const snap = (f, n = 12) => { if (f <= 0) return 0; const u = f * 12 / n; if (u >= 12) return 1; const i = Math.floor(u); return SN[i] + (SN[i + 1] - SN[i]) * (u - i); };
const tr = (keys, f) => { if (!keys || !keys.length) return 0; let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [f0, to, n = 12] = keys[i]; if (f <= f0) break; v = v + (to - v) * snap(f - f0, n); } return v; };

// THE RIVAL'S CANE (held prop, right fist): local +Y runs from the gold knob to the ferrule. grip = just under the knob, tip = the ferrule.
export function buildCane(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshLambertMaterial({ color: c })), g = new THREE.Group(); g.name = 'rival_cane';
  const add = (geo, mat, name, y) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = 'metal'; m.position.set(0, y, 0); m.castShadow = true; g.add(m); return m; };
  const gold = new THREE.MeshBasicMaterial({ color: '#ffc21f' }), dark = toon('#2e2a36');
  add(new THREE.SphereGeometry(.05, 12, 10), gold, 'cane_gold_knob', 0); add(new THREE.CylinderGeometry(.022, .03, .05, 10), gold, 'cane_collar', .06);
  add(new THREE.CylinderGeometry(.013, .017, 1.0, 8), dark, 'cane_shaft', .58).userData.role = 'wood'; add(new THREE.CylinderGeometry(.008, .014, .07, 8), gold, 'cane_ferrule', 1.1);
  add(new THREE.TorusGeometry(.02, .006, 6, 10), gold, 'cane_ring', .2).rotation.x = Math.PI / 2;
  return { group: g, grip: new THREE.Vector3(0, .05, 0), tip: new THREE.Vector3(0, 1.13, 0) };
}

export async function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, pl = ctx.place || {}, m = pl.m || {}, night = m.mode === 'night', V = (x, y, z) => B2T([x, y, z]), col = c => new THREE.Color(c), PI = Math.PI;
  let seed = 11; const R0 = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }, rr = (a, b) => a + (b - a) * R0();
  // ---------- the shared world (town, near hill, hero tower), minus its far stand-in of this tower, its dusk sky and fog ----------
  const world = await buildWorld(THREE, scene, film, { ...ctx, place: {} });
  for (const n of ['rival_tower', 'sky_storm_dome', 'storm_cloud_billows'])   // build-out: tower_top's purple dusk billows are hidden by day too (clear morning)
 { const o = scene.getObjectByName(n); if (o) o.visible = false; }
  scene.fog = night ? new THREE.Fog('#4266bd', 180, 1100) : new THREE.Fog('#a9cdf5', 170, 760);
  const add = (geo, mat, name, role, p, parent) => { const o = new THREE.Mesh(geo, mat); o.name = name; o.userData.role = role; if (p) o.position.copy(p); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o }), glowM = (c, op) => basic(c, { transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const em = (mat, c) => { mat.emissive = col(c); return mat; };
  // v2 VISUAL UPGRADE (2026-11-15, kit3d): stone, wood and ground through ctx.relief (marble gets veins painted into its relief map), every metal through ctx.pbr.metal
  const RL = (kind, c, o = {}) => typeof ctx.relief === 'function' ? ctx.relief(kind, c, o) : toon(c), MT = (kind, o = {}) => ctx.pbr && ctx.pbr.metal ? ctx.pbr.metal(kind, o) : toon(o.toon || '#888888');
  const veins = (mat, seedV, amt = 1) => { if (!mat.map || !mat.map.image || !mat.map.image.data) return mat; const N = mat.map.image.width, src = mat.map.image.data, d = new Uint8ClampedArray(src);   // grey-lavender marble veins: thin wandering lines over the courses
    const hh = (x, y) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + seedV * 982451653 | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const vn = (x, y, P) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, w = v => ((v % P) + P) % P, a = hh(w(xi), w(yi)), b = hh(w(xi + 1), w(yi)), c = hh(w(xi), w(yi + 1)), e = hh(w(xi + 1), w(yi + 1)), ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); return a + (b - a) * ux + (c - a) * uy + (a - b - c + e) * ux * uy; };
    const fb = (u, v, P) => { let s = 0, A = .5, n = 0; for (let o = 0; o < 4; o++) { s += A * vn(u * P, v * P, P); n += A; A *= .5; P *= 2; } return s / n; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, v = y / N, w = fb(u, v, 3), l1 = Math.abs(Math.sin((u * 2 + v * 1 + w * 2.2) * Math.PI * 2)), l2 = Math.abs(Math.sin((u * 1 - v * 3 + w * 3.1) * Math.PI * 2)), k = Math.max(Math.max(0, 1 - l1 * 26) * .55, Math.max(0, 1 - l2 * 40) * .35) * amt, i = (y * N + x) * 4;
      d[i] = d[i] * (1 - .32 * k); d[i + 1] = d[i + 1] * (1 - .36 * k); d[i + 2] = d[i + 2] * (1 - .2 * k); }
    const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; mat.map = t; return mat; };
  const M = { marble: veins(RL('stone', '#f8f4ec', { scale: 4.6, normal: .55, seed: 21 }), 3), marbleSh: veins(RL('stone', '#e6def2', { scale: 3.0, normal: .6, seed: 22 }), 4, .7), band: RL('stone', '#cdbff0', { scale: 2.2, normal: .5, seed: 23 }), joint: toon('#c9bfe0'),
    gold: MT('gold', { seed: 41, toon: '#ffc21f' }), goldHi: MT('gold', { color: '#ffd77a', rough: .12, seed: 43, toon: '#ffe58a' }), wood: RL('wood', '#a9682f', { seed: 31 }), woodDk: RL('wood', '#7a4520', { seed: 32 }), woodLt: RL('wood', '#c98a48', { seed: 33 }),
    bronze: MT('bronze', { color: '#e8b062', rough: .22, seed: 31, toon: '#d6902f' }), bronzeHi: MT('bronze', { color: '#f4c878', rough: .16, seed: 35, toon: '#f0b24a' }), bronzeIn: MT('bronze', { color: '#9a6a34', rough: .36, patina: .3, seed: 33, toon: '#8a4f1c' }), iron: MT('iron', { seed: 3, toon: '#2c3050' }), rope: RL('bark', '#e0c080', { scale: .1, seed: 3 }), cyp: toon('#1d5c3d'), cypDk: toon('#143f33'),
    road: RL('mud', '#f6eedc', { scale: 3, seed: 5 }), pave: RL('cobble', '#efe4cc', { scale: 1.3, seed: 6 }), dark: basic('#1b1226'), crack: basic('#120c18'), white: basic('#ffffff', { fog: false }), cloth: toon('#f3ead2') };
  M.bronze.side = M.bronzeIn.side = THREE.DoubleSide; if (M.marble.map) { M.marble.color.setScalar(1.16); M.marbleSh.color.setScalar(1.1); M.band.color.setScalar(1.06); }   // white marble stays white with its relief

  // ---------- sky: clear deep blue morning with a few small clouds, or the blue night storm (flash inside the cloud) ----------
  const SK = night ? { top: '#21338c', hor: '#6b99f2', dk: '#21338c', md: '#3d5cc2', hi: '#759ef2', cov: 1.0 } : { top: '#1558d6', hor: '#8fd0ff', dk: '#dfeeff', md: '#f4f8ff', hi: '#ffffff', cov: .14 };
  const U = { cTop: { value: col(SK.top) }, cHor: { value: col(SK.hor) }, cDk: { value: col(SK.dk) }, cMd: { value: col(SK.md) }, cHi: { value: col(SK.hi) }, cov: { value: SK.cov }, fl: { value: 0 }, flashD: { value: V(.3, -.6, .5).normalize() } };
  for (const k of ['cTop', 'cHor', 'cDk', 'cMd', 'cHi']) U[k].value.convertLinearToSRGB();   // the shader works in picture colours and converts once at the end
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vD = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 cTop, cHor, cDk, cMd, cHi, flashD; uniform float cov, fl; varying vec3 vD;
      float fbm(vec2 q){ float cl = 0., a = .5; for (int i = 0; i < 5; i++) { cl += a * (.5 + .5 * sin(q.x * 1.7 + sin(q.y * 2.3) * 1.6) * sin(q.y * 1.3 + q.x * .45 + 1.3)); q = q * 2.03 + vec2(1.7, 4.1); a *= .5; } return cl; }
      void main(){ float L = max(length(vD), 1e-3); vec3 d = vD / L; float h = d.y; float hc = clamp(h, 0., 1.);
        vec3 sky = mix(cHor, cTop, pow(max(hc, 1e-4), .55));
        vec2 p = d.xz / (hc + .28) * 1.5; float cl = fbm(p + vec2(0., .6 * fbm(p * .6)));
        float mk = smoothstep(1. - cov, 1. - cov + .2, cl) * smoothstep(.0, .1, h);
        vec3 cc = mix(cDk, cMd, smoothstep(.45, .6, cl)); cc = mix(cc, cHi, smoothstep(.62, .76, cl));
        vec3 c = mix(sky, cc, mk);
        float s = clamp(dot(d, flashD), 0., 1.); c += vec3(.75, .82, 1.) * fl * (pow(max(s, 1e-4), 5.) * .75 + .22) * (.45 + .55 * mk);
        if (h < 0.) c = mix(cHor * .85, cHor, smoothstep(-.12, 0., h));
        c = pow(max(c, vec3(0.)), vec3(2.2)); gl_FragColor = vec4(c, 1.); }` });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(560, 48, 24), skyMat); skyDome.name = 'sky_marble_dome'; skyDome.userData.noExport = true; skyDome.renderOrder = -10; skyDome.frustumCulled = false; scene.add(skyDome);
  // v2: kit clouds with volume and lit edges (clear-day: a few fair cumulus low on the horizon; night-storm: a heavy low canopy lit from inside by the flashes). The dome above stays (gradient + flash glow).
  scene.children.filter(o => o.name === 'kit_clouds').forEach(o => { o.visible = false; });   // any clouds the shared world made (tower_top) are not this place's sky
  skyDome.userData.k3env = true; let kitClouds = null; const cloudBase = [];
  // FINAL PASS (2026-11-15, CB "the sky looks weired"): night = the kit's PAINTED night-storm dome (heavy masses, dark cores, lit from inside by ctx.sky.flash at each bolt),
  // in this film's blue night (lighter than the kit default so the night stays >= .31); our own dome is hidden at night. Day = our deep blue gradient with its own fbm
  // clouds OFF (they were the small "popcorn") + the kit's few big clear-day cumulus.
  if (ctx.sky && ctx.sky.clouds) { kitClouds = night ? ctx.sky.clouds({ kind: 'night-storm', seed: 23, colors: { top: '#20338a', mid: '#4262c4', hor: '#6a90e8', sun: '#b8c8ff', core: '#18225c', body: '#30479a', slit: '#8ea8ee', srim: '#c8d6ff', under: '#7a8cc8', scud: '#101a44', rain: '#33467e', flash: '#e6ecff' }, storm: { contrast: .85, underAmt: .35, deck: .7 } })
      : ctx.sky.clouds({ kind: 'clear-day', dome: false, seed: 19, coverage: .75, minEl: 3, maxEl: 22, colors: { lit: '#ffffff', shade: '#a9bde0', rim: '#ffffff', hor: '#9fd2ff' } });
    kitClouds.position.copy(V(RIVAL.x, RIVAL.y, RIVAL.base)); kitClouds.children.forEach(o => { if (o.material && o.material.uniforms && o.material.uniforms.lit && o.material.uniforms.shade && o.material.uniforms.lit.value.isColor) cloudBase.push([o.material.uniforms, o.material.uniforms.lit.value.clone(), o.material.uniforms.shade.value.clone()]); });
    if (night) skyDome.visible = false; else U.cov.value = 0; }

  // ---------- the tower: a group at RIVAL, local x = plan x, y = up from the foot, z = -plan y (so +z is the SOUTH face, toward the town) ----------
  const T = new THREE.Group(); T.name = 'marble_tower'; T.position.copy(V(RIVAL.x, RIVAL.y, RIVAL.base)); scene.add(T);
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z), box = (w, h, d, mat, name, role, p, parent = T) => add(new THREE.BoxGeometry(w, h, d), mat, name, role, p, parent);
  const bar = (a, b, r, mat, name, role = 'wood', parent = T, r2 = r, segs = 8) => { const d = b.clone().sub(a), L = Math.max(d.length(), 1e-4), o = add(new THREE.CylinderGeometry(r2, r, L, segs), mat, name, role, a.clone().addScaledVector(d, .5), parent); o.quaternion.setFromUnitVectors(v3(0, 1, 0), d.clone().normalize()); return o; };
  const face = k => { const g = new THREE.Group(); g.rotation.y = k * PI / 2; T.add(g); return g; };     // k 0 = south (+z), 1 = east (+x), 2 = north, 3 = west
  // terrace, steps, plinth, portal and door (south)
  add(new THREE.CylinderGeometry(11.5, 12.2, 1.2, 32), M.pave, 'terrace', 'ground', v3(0, GROUND_U - .6, 0), T);
  for (let i = 0; i < 26; i++) { const a = i / 26 * PI * 2; box(.5, .34, .5, M.marbleSh, 'terrace_kerb', 'stone', v3(Math.cos(a) * 11.3, GROUND_U + .15, Math.sin(a) * 11.3)).rotation.y = -a; }
  box(10.4, 2.4, 10.4, M.marbleSh, 'plinth', 'stone', v3(0, GROUND_U + 1.2, 0)); box(10.7, .3, 10.7, M.marble, 'plinth_cap', 'stone', v3(0, GROUND_U + 2.5, 0)); box(10.8, .35, 10.8, M.band, 'plinth_foot', 'stone', v3(0, GROUND_U + .17, 0));
  { const g = face(0); box(3.0, 4.2, .7, M.marble, 'portal_block', 'stone', v3(0, GROUND_U + 2.1, 5.3), g); box(3.5, .35, .95, M.band, 'portal_cornice', 'stone', v3(0, GROUND_U + 4.35, 5.35), g);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(.2, .23, 3.4, 12), M.marbleSh, 'portal_column', 'stone', v3(s * 1.25, GROUND_U + 1.9, 5.75), g);
    add(new THREE.CylinderGeometry(.85, .85, .3, 20, 1, false, 0, PI), M.dark, 'door_arch_dark', 'wood', v3(0, GROUND_U + 2.75, 5.56), g).rotation.set(PI / 2, PI / 2, 0);
    box(1.7, 2.6, .12, m.door_open ? M.dark : M.woodDk, 'door_opening', 'wood', v3(0, GROUND_U + 1.45, 5.66), g);
    if (m.door_open) { const leaf = box(.85, 2.6, .1, M.wood, 'door_leaf_open', 'wood', v3(-1.2, GROUND_U + 1.45, 6.05), g); leaf.rotation.y = -1.1; for (const y of [.6, 1.5, 2.3]) box(.8, .09, .13, M.iron, 'door_strap', 'metal', v3(-1.2, GROUND_U + y, 6.07), g).rotation.y = -1.1; }
    else { for (const x of [-.56, -.19, .19, .56]) box(.035, 2.55, .14, M.wood, 'door_plank_gap', 'wood', v3(x, GROUND_U + 1.45, 5.67), g); for (const y of [.6, 1.5, 2.3]) box(1.6, .1, .15, M.iron, 'door_strap', 'metal', v3(0, GROUND_U + y, 5.68), g); add(new THREE.TorusGeometry(.11, .025, 6, 14), M.gold, 'door_gold_ring', 'metal', v3(.5, GROUND_U + 1.35, 5.76), g); }
    for (let i = 0; i < 3; i++) box(3.6 + i * .7, .16, .5, M.marble, 'door_step', 'stone', v3(0, GROUND_U + .4 - i * .16, 6.2 + i * .45), g); }
  // shaft with corner pilasters, courses, staggered vertical joints, three lavender bands with a gold fillet, slit windows
  const S0 = GROUND_U + 2.65, S1 = 36.0, HWd = 4.5;
  box(9, S1 - S0, 9, M.marble, 'shaft_marble', 'stone', v3(0, (S0 + S1) / 2, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(.9, S1 - S0, .9, M.marble, 'shaft_pilaster', 'stone', v3(sx * 4.2, (S0 + S1) / 2, sz * 4.2));
  // v2: the courses and joints now come from the marble relief map (rows of 1.15 m), the old instanced joint lines are gone
  for (const u of [11.5, 20.5, 29.5]) { box(9.16, .9, 9.16, M.band, 'shaft_band', 'stone', v3(0, u, 0)); box(9.22, .09, 9.22, M.gold, 'shaft_band_gold_fillet', 'metal', v3(0, u + .5, 0)); box(9.3, .16, 9.3, M.marble, 'shaft_band_lip', 'stone', v3(0, u - .5, 0)); }
  for (let k = 0; k < 4; k++) { const g = face(k); for (const u of [8, 16.5, 25.5, 33]) { box(.5, 1.7, .1, M.dark, 'shaft_slit_window', 'stone', v3(0, u, 4.5), g); box(.8, .14, .2, M.marbleSh, 'slit_sill', 'stone', v3(0, u - .92, 4.55), g); add(new THREE.TorusGeometry(.27, .06, 6, 12, PI), M.marbleSh, 'slit_hood', 'stone', v3(0, u + .85, 4.54), g); } }
  // cornice with dentils under the belfry
  box(9.5, .3, 9.5, M.band, 'cornice_neck', 'stone', v3(0, 36.05, 0)); box(10.2, .32, 10.2, M.marble, 'cornice_mid', 'stone', v3(0, 36.36, 0)); box(10.7, .2, 10.7, M.marble, 'cornice_top', 'stone', v3(0, 36.62, 0));
  { const dm = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, .26, .3), M.marbleSh, 4 * 23), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); let n = 0; for (let k = 0; k < 4; k++) { q.setFromAxisAngle(v3(0, 1, 0), k * PI / 2); for (let i = -11; i <= 11; i++) { m4.compose(v3(i * .43, 36.1, 4.9).applyQuaternion(q), q, v3(1, 1, 1)); dm.setMatrixAt(n++, m4); } } dm.name = 'cornice_dentils'; dm.userData.role = 'stone'; dm.frustumCulled = false; T.add(dm); }
  // belfry: one big arch per face (a wall panel with an arched hole), archivolt, keystone, sill
  const B0 = 36.7, B1 = 43.4, AR = 2.4, ASP = 40.3, SILL = FLOOR_U - .06;
  { const sh = new THREE.Shape(); sh.moveTo(-4.5, B0); sh.lineTo(4.5, B0); sh.lineTo(4.5, B1); sh.lineTo(-4.5, B1); sh.lineTo(-4.5, B0);
    const ho = new THREE.Path(); ho.moveTo(-AR, SILL); ho.lineTo(AR, SILL); ho.lineTo(AR, ASP); ho.absarc(0, ASP, AR, 0, PI, false); ho.lineTo(-AR, SILL); sh.holes.push(ho);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false, curveSegments: 20 });
    for (let k = 0; k < 4; k++) { const g = face(k); add(geo, M.marble, 'belfry_arch_wall', 'stone', v3(0, 0, 3.3), g);
      add(new THREE.TorusGeometry(AR + .12, .16, 8, 24, PI), M.band, 'belfry_archivolt', 'stone', v3(0, ASP, 4.5), g); box(.5, .7, .3, M.marble, 'belfry_keystone', 'stone', v3(0, ASP + AR + .25, 4.55), g); box(.12, .12, .34, M.gold, 'keystone_gold_stud', 'metal', v3(0, ASP + AR + .25, 4.6), g);
      for (let i = 0; i < 7; i++) box(5.4, .12, .2, [M.woodDk, M.wood, M.woodDk, M.woodLt][i % 4], 'belfry_threshold_plank', 'wood', v3(0, SILL - (i % 2) * .012, 3.31 + i * .214), g); for (const s of [-1, 1]) { box(.5, ASP - SILL, .16, M.marbleSh, 'belfry_jamb_pilaster', 'stone', v3(s * (AR + .32), (ASP + SILL) / 2, 4.52), g); box(.7, .2, .3, M.band, 'belfry_impost', 'stone', v3(s * (AR + .32), ASP, 4.55), g); } } }
  box(9, .3, 9, M.marbleSh, 'belfry_floor_slab', 'stone', v3(0, FLOOR_U - .17, 0));
  { const fl = box(6.56, .05, 6.56, RL('wood', '#b06c36', { scale: 2.05, normal: 1.2, seed: 44 }), 'chamber_floor_planks', 'wood', v3(0, FLOOR_U - .025, 0)); fl.castShadow = false; if (night && fl.material.map) fl.material.color.setScalar(m.floor_k ?? 1); }   // v2: one relief floor, boards .41 m wide with grain, knots and dark gaps
  for (const z of [-2.4, -.8, .8, 2.4]) box(6.6, .3, .3, M.woodDk, 'chamber_ceiling_beam', 'wood', v3(0, B1 - .25, z)); box(6.7, .1, 6.7, M.woodDk, 'chamber_ceiling', 'wood', v3(0, B1 - .05, 0));
  { const HX = -2.85; box(.8, .06, 1.0, M.dark, 'stair_hatch_hole', 'wood', v3(HX, FLOOR_U + .01, 2.4)); for (const s of [-1, 1]) bar(v3(HX + s * .25, FLOOR_U - .3, 2.8), v3(HX + s * .25, FLOOR_U + 1.15, 2.95), .04, M.woodLt, 'stair_ladder_rail'); for (const y of [.25, .6, .95]) bar(v3(HX - .25, FLOOR_U + y, 2.87 + y * .08), v3(HX + .25, FLOOR_U + y, 2.87 + y * .08), .028, M.woodLt, 'stair_ladder_rung'); const lid = box(.8, .06, 1.0, M.wood, 'stair_hatch_lid', 'wood', v3(-3.18, FLOOR_U + .42, 2.4)); lid.rotation.z = 1.35; }   // v2: moved 35 cm to the wall, clear of the hero frame's ground beam
  // top cornice, the WOODEN shingle roof (tiers), pedestal
  box(10.0, .3, 10.0, M.marble, 'top_cornice_low', 'stone', v3(0, B1 + .15, 0)); box(10.5, .3, 10.5, M.band, 'top_cornice', 'stone', v3(0, B1 + .45, 0)); box(10.6, .1, 10.6, M.gold, 'top_cornice_gold_fillet', 'metal', v3(0, B1 + .65, 0));
  const RF0 = 44.1, RF1 = 50.2, RHW = 5.0, roofU = d => RF1 - (RF1 - RF0) * Math.min(1, d / RHW);     // roof surface at horizontal distance d (max of |x|, |z|) from the axis
  const roofG = new THREE.Group(); roofG.name = 'wooden_roof'; T.add(roofG);
  for (let i = 0; i < 8; i++) { const y0 = RF0 + (RF1 - RF0) * i / 8, y1 = RF0 + (RF1 - RF0) * (i + 1) / 8, r0 = RHW * (1 - i / 8) * Math.SQRT2 + .16, r1 = RHW * (1 - (i + 1) / 8) * Math.SQRT2 + .04; add(new THREE.CylinderGeometry(Math.max(r1, .05), r0, y1 - y0, 4, 1), i % 2 ? M.wood : M.woodLt, 'roof_shingle_tier', 'wood', v3(0, (y0 + y1) / 2, 0), roofG).rotation.y = PI / 4; }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) bar(v3(sx * (RHW + .1), RF0 + .05, sz * (RHW + .1)), v3(sx * .1, RF1 + .1, sz * .1), .13, M.woodDk, 'roof_hip_rafter', 'wood', roofG);
  box(.9, .6, .9, M.marble, 'angel_pedestal', 'stone', v3(0, RF1 + .3, 0)); box(1.1, .12, 1.1, M.gold, 'pedestal_gold_cap', 'metal', v3(0, PED_U - .06, 0));

  // ---------- THE GOLD ANGEL (v2: the detailed gilt statue of hero_props.js: folded robe, feathered wings, curls, halo, trumpet; struck = noodle trumpet, scorch, burnt primaries) ----------
  const HP = await import('./hero_props.js');
  const angel = new THREE.Group(); angel.name = 'gold_angel'; T.add(angel); const heroAngel = HP.buildAngel(THREE, ctx, {}); angel.add(heroAngel.group);
  const AN0 = v3(0, PED_U, 0); angel.position.copy(AN0);
  // FINAL PASS (lead's full-size check): the wings tinted blue-green in daylight (the gilt mirrored the blue sky fill). The wing feathers now share the robe's gilt material (the kit metal
  // with its env map), a warmer copy of it
  // (more orange, .7 of the sky reflection, a warm self-light) so the sky-facing feathers stay warm gold; the copy takes the body's env map on the first frame. hero_props.js (shared) is not touched.
  // FINAL PASS: at night the mirror-smooth gilt threw the flash light straight into the lens and bloomed into a big glowing disc round the angel (v2 too);
  // night gilt on the angel is satin (roughness >= .42) and fully metal, so the flash gives a broad gold sheen instead of a hot spot.
  if (night) { const done = new Set(); heroAngel.group.traverse(o => { const mt = o.isMesh && o.material; if (mt && mt.metalness != null && !done.has(mt)) { done.add(mt); mt.roughness = Math.max(mt.roughness ?? 0, .42); mt.metalness = 1; } }); }   // full metal: the flash fill gives no milky diffuse
  let wingGold = null; { const cnt = new Map(); heroAngel.group.traverse(o => { if (o.isMesh && /robe|body|torso|skirt/.test(o.name) && o.material && o.material.metalness > .5) cnt.set(o.material, (cnt.get(o.material) || 0) + 1); });
    const bodyGold = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0];   // the robe's gilt (reads warm gold in the same light): the wings take it
    if (bodyGold) { const src = bodyGold[0], wg = night ? new THREE.MeshStandardMaterial({ color: src.color.clone(), map: src.map || null, metalness: 1, roughness: .5, side: src.side, emissive: '#000000' }) : src.clone();   // night: a plain standard metal (the physical gilt threw HDR fireflies off the mirrored feathers under the flash and bloomed into a big disc) wg.color.lerp(col('#e8900c'), .3); wg.envMapIntensity = (src.envMapIntensity ?? 1) * (night ? .3 : .7); if (night) { wg.roughness = .45; if (wg.clearcoat != null) wg.clearcoat = 0; if (wg.sheen != null) wg.sheen = 0; if (wg.specularIntensity != null) wg.specularIntensity = .6; wg.metalness = 1; } if (wg.emissive) { wg.emissive.set('#a86a10'); wg.emissiveIntensity = night ? 0 : .32; }
      wingGold = { src, wg }; heroAngel.group.traverse(o => { if (o.isMesh && /^angel_(wing|primary)/.test(o.name) && o.material && o.material.metalness != null) o.material = wg; }); } }
  // the seat flare (v2, was a white star of lines): one soft gold flare, additive, camera-facing
  const glint = new THREE.Group(); glint.name = 'angel_gold_flash'; glint.userData.noExport = true; T.add(glint);
  { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), gr = c.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(.1, 'rgba(255,226,140,.85)'); gr.addColorStop(.35, 'rgba(255,190,70,.3)'); gr.addColorStop(1, 'rgba(255,160,40,0)'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    c.globalCompositeOperation = 'lighter'; for (const [ang, l, w] of [[0, 128, 5], [PI / 2, 90, 4]]) { c.save(); c.translate(128, 128); c.rotate(ang); const g2 = c.createLinearGradient(-l, 0, l, 0); g2.addColorStop(0, 'rgba(255,210,110,0)'); g2.addColorStop(.5, 'rgba(255,236,170,.55)'); g2.addColorStop(1, 'rgba(255,210,110,0)'); c.fillStyle = g2; c.fillRect(-l, -w / 2, 2 * l, w); c.restore(); }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const q = add(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }), 'angel_flash_flare', 'lamp', null, glint); q.castShadow = q.receiveShadow = false; }
  glint.visible = false;

  // ---------- top scaffold and the rope crane (built deck-west / mast-east, then mirrored in x), row 13 ----------
  const crane = new THREE.Group(); crane.name = 'scaffold_and_crane'; T.add(crane); crane.visible = !!m.scaffold; crane.scale.x = -1; let hookRope = null;   // mirrored: the deck stands EAST of the peak (the morning sun side), the mast west
  { const DX0 = -3.3, DX1 = -.75; for (let i = 0; i < 5; i++) box(DX1 - DX0, .06, .36, i % 2 ? M.woodLt : M.wood, 'scaffold_deck_plank', 'wood', v3((DX0 + DX1) / 2, DECK_U - .03, -.74 + i * .37), crane);
    for (const x of [DX0 + .1, DX1 - .1]) for (const z of [-.85, .85]) { bar(v3(x, roofU(Math.max(Math.abs(x), Math.abs(z))) - .1, z), v3(x, DECK_U + (x < -2 ? 1.1 : -.03), z), .06, M.woodDk, 'scaffold_pole', 'wood', crane); }
    for (const z of [-.85, .85]) { bar(v3(DX0 + .1, DECK_U - .2, z), v3(DX1 - .1, DECK_U - .2, z), .05, M.woodDk, 'scaffold_ledger', 'wood', crane); bar(v3(DX0 + .1, roofU(3.2) + .2, z), v3(DX1 - .1, DECK_U - .25, z), .04, M.woodDk, 'scaffold_brace', 'wood', crane); }
    bar(v3(DX0 + .1, DECK_U + 1.05, -.85), v3(DX0 + .1, DECK_U + 1.05, .85), .04, M.woodLt, 'scaffold_handrail', 'wood', crane);
    for (const [x, z] of [[DX0 + .1, -.85], [DX0 + .1, .85], [DX1 - .1, -.85], [DX1 - .1, .85]]) add(new THREE.TorusGeometry(.085, .025, 6, 10), M.rope, 'scaffold_rope_lashing', 'cloth', v3(x, DECK_U - .2, z), crane).rotation.x = PI / 2;
    for (const s of [-1, 1]) bar(v3(-3.9, 44.4, .5 + s * .22), v3(-3.15, DECK_U + .5, .5 + s * .22), .04, M.woodLt, 'scaffold_ladder_rail', 'wood', crane); for (let i = 0; i < 13; i++) { const u = i / 13; bar(v3(-3.9 + .75 * u, 44.6 + (DECK_U - 44.2) * u, .28), v3(-3.9 + .75 * u, 44.6 + (DECK_U - 44.2) * u, .72), .025, M.woodLt, 'scaffold_ladder_rung', 'wood', crane); }
    const MX = 3.4, MT = 57.2; bar(v3(MX, roofU(MX) - .2, 0), v3(MX, MT, 0), .13, M.woodDk, 'crane_mast', 'wood', crane, .1); for (const z of [-1.6, 1.6]) bar(v3(MX + .8, roofU(4.2), z), v3(MX, MT - 3, 0), .07, M.woodDk, 'crane_mast_stay', 'wood', crane);
    bar(v3(MX + 1.0, MT - .9, 0), v3(-.5, MT - .2, 0), .1, M.wood, 'crane_jib', 'wood', crane, .08); bar(v3(MX, MT - 3.2, 0), v3(.9, MT - .5, 0), .06, M.woodDk, 'crane_jib_brace', 'wood', crane);
    add(new THREE.CylinderGeometry(.2, .2, .1, 14), M.iron, 'crane_pulley', 'metal', v3(0, MT - .5, 0), crane).rotation.x = PI / 2; add(new THREE.CylinderGeometry(.22, .22, .7, 12), M.woodLt, 'crane_winch_drum', 'wood', v3(MX, 47.6, .45), crane).rotation.x = PI / 2;
    bar(v3(.2, MT - .5, 0), v3(MX + .05, 47.8, .45), .022, M.rope, 'crane_rope_to_winch', 'cloth', crane); bar(v3(MX, 47.6, .85), v3(MX + .5, 47.9, .85), .03, M.iron, 'crane_winch_handle', 'metal', crane);
    hookRope = add(new THREE.CylinderGeometry(.024, .024, 1, 6), M.rope, 'crane_rope_to_angel', 'cloth', null, crane); hookRope.userData.top = MT - .7; }

  // ---------- THE BELL CHAMBER: frame, headstock, wheel, the giant bronze bell, clapper, rope, plank, founder's mark ----------
  const BC = new THREE.Group(); BC.name = 'bell_chamber'; BC.position.set(0, FLOOR_U, 0); T.add(BC);
  // v2: the hero bell frame, the bronze STORM BELL with its 4.0 m oak yoke (raised inscription, cross relief, founder's mark; 10 cm lower: mouth 2.8 m under the pivot),
  // the grooved BELL WHEEL on the axle at z 2.62, all from hero_props.js (real bronze / iron / oak relief). The clapper lags the swing and hangs by its weight.
  const frameP = HP.buildBellFrame(THREE, ctx, { pivot: PIVOT }); BC.add(frameP.group);
  const sw = new THREE.Group(); sw.name = 'bell_swing'; sw.position.set(0, PIVOT, 0); BC.add(sw);
  const heroBell = HP.buildBell(THREE, ctx, {}); sw.add(heroBell.group); const clapper = heroBell.clapper;
  // FINAL PASS (lead's full-size check): the inside of the bell showed teal patina blotches and a dark mirror. Inside = clean gold bronze, patina only in the deepest
  // recesses (.05), rougher (.5) so it does not mirror the dark chamber and the clouds as blotches.
  { const inB = MT('bronze', { color: '#e0a85c', rough: .5, patina: .05, env: 1.0, seed: 37, toon: '#c88a3a' }); inB.side = THREE.DoubleSide; if (inB.emissive) { inB.emissive.set('#5a3008'); inB.emissiveIntensity = .25; } heroBell.group.traverse(o => { if (o.isMesh && o.name === 'bell_body_inside_patina') o.material = inB; }); }
  const WZ = 2.62, heroWheel = HP.buildBellWheel(THREE, ctx, { rope: false }); heroWheel.group.position.set(0, 0, WZ); sw.add(heroWheel.group);
  { const pts = []; for (let i = 0; i <= 24; i++) { const a = -.04 + i / 24 * 2.7; pts.push(v3(Math.cos(a) * 1.22, PIVOT + Math.sin(a) * 1.22, WZ)); }   // the rope in the groove stays put while the wheel turns under it
    const rg = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .032, 8), M.rope, 'wheel_rope_in_groove', 'cloth', null, BC); rg.castShadow = true; }
  const ROPE = { x: 1.25, z: 2.62 }, ropeG = new THREE.Group(); ropeG.name = 'bell_rope'; ropeG.position.set(ROPE.x, PIVOT, ROPE.z); BC.add(ropeG);
  const ropeM = add(new THREE.CylinderGeometry(.035, .035, 1, 8), M.rope, 'bell_rope_line', 'cloth', null, ropeG), ropeK = add(new THREE.SphereGeometry(.07, 8, 6), M.rope, 'bell_rope_end_knot', 'cloth', null, ropeG), sally = add(new THREE.CylinderGeometry(.06, .06, .5, 8), toon('#3f6fb8'), 'bell_rope_wool_grip', 'cloth', null, ropeG);
  const plank = new THREE.Group(); plank.name = 'polishing_plank'; BC.add(plank); plank.visible = !!m.plank;
  { const PX = 2.35, PZ = -.85; box(.6, .06, 2.0, M.woodLt, 'polish_plank', 'wood', v3(PX, .47, PZ + .2), plank); for (const z of [PZ - .55, PZ + .95]) { for (const s of [-1, 1]) bar(v3(PX + s * .32, 0, z), v3(PX + s * .08, .44, z), .035, M.woodDk, 'polish_trestle_leg', 'wood', plank); box(.5, .07, .09, M.woodDk, 'polish_trestle_top', 'wood', v3(PX, .42, z), plank); }
    add(new THREE.CylinderGeometry(.14, .11, .22, 10), M.woodDk, 'polish_wax_pot', 'wood', v3(PX + .05, .61, PZ + .95), plank); box(.3, .03, .22, M.cloth, 'polish_rag_spare', 'cloth', v3(PX - .05, .52, PZ + .6), plank);
    const th = (m.tilt ?? 65) * PI / 180, cx = Math.sin(th) * 2.8, cy = PIVOT - Math.cos(th) * 2.8; for (const s of [-1, 1]) bar(v3(cx + .35, 0, s * 1.75), v3(cx, cy, s * 1.54), .07, M.wood, 'bell_stay_prop', 'wood', plank); }
  const rag = add(new THREE.SphereGeometry(.09, 8, 6), M.cloth, 'polish_rag', 'cloth', null, scene); rag.scale.set(1.2, .9, .5); rag.visible = false; if (m.rag_at) rag.position.copy(V(...m.rag_at));
  const hum = []; for (let i = 0; i < 4; i++) { const r = add(new THREE.TorusGeometry(1, .03, 6, 40), glowM('#ffe7a0', .8), 'bell_hum_ring', 'lamp', null, scene); r.castShadow = false; r.visible = false; r.userData.noExport = true; hum.push(r); }
  const cap = new THREE.Group(); cap.name = 'ringer_cap_flying'; cap.visible = false; scene.add(cap); { const cm = toon('#8d8f96'); add(new THREE.CylinderGeometry(.15, .17, .09, 12), toon('#a9abb2'), 'cap_cuff', 'cloth', v3(0, 0, 0), cap); const cn = add(new THREE.ConeGeometry(.15, .5, 12), cm, 'cap_body', 'cloth', v3(.07, .26, 0), cap); cn.rotation.z = -.35; add(new THREE.SphereGeometry(.05, 8, 6), toon('#a9abb2'), 'cap_tassel', 'cloth', v3(.18, .5, 0), cap); }
  let blob = null; if (m.blob) { blob = add(new THREE.CircleGeometry(.5, 24), basic('#120804', { transparent: true, opacity: .72, depthWrite: false }), 'ringer_floor_shadow', 'fx', v3(m.blob[0], FLOOR_U + .012, m.blob[1]), T); blob.rotation.x = -PI / 2; blob.castShadow = blob.receiveShadow = false; blob.userData.noExport = true; }
  if (m.arch_dark) { const d = box(6.5, 6.3, 6.5, M.dark, 'belfry_dark_inside', 'stone', v3(0, FLOOR_U + 3.2, 0)); d.castShadow = false; }
  // THE FAR HERO TOWER (build-out): ONE stand-in in every frame of this set, the look of tower_top.js's tower (ochre ashlar shaft with pale quoins, white stone
  // cornice, yellow plaster belfry piers with dark arches, terracotta pyramid roof with orange hips, the blue-black iron spear with its cold glint), at its true
  // place, scaled k times (default 2, place key hero_k) about its foot in the town so it reads across 300 m. It is never switched off inside a take.
  const heroFar = new THREE.Group(); heroFar.name = 'far_hero_tower_standin'; heroFar.userData.noExport = true; scene.add(heroFar);
  { const k = m.hero_k ?? 2, o0 = V(SPEAR.x, SPEAR.y, TOWN_Z), P = (dx, dy, z) => V(SPEAR.x + dx, SPEAR.y + dy, z).sub(o0); heroFar.position.copy(o0); heroFar.scale.setScalar(k);
    const ochre = toon('#c88c5c'), quoin = toon('#efe2c8'), stn = toon('#e6e6f2'), pla = toon('#eab552'), tile = toon('#e0602a'), hip = toon('#f08a48'), ir = basic('#2c3050'), hole = basic('#2a1a22'), BZ = APEX[2] - .9 - .38, S1z = BZ - 3.3;
    add(new THREE.BoxGeometry(3.15, S1z - TOWN_Z, 3.15), ochre, 'far_hero_shaft', 'stone', P(0, 0, (S1z + TOWN_Z) / 2), heroFar);
    for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(3.19, .07, 3.19), toon('#a8724a'), 'far_hero_course', 'stone', P(0, 0, TOWN_Z + 3 + i * 3.1), heroFar);
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let i = 0; i < 14; i++) add(new THREE.BoxGeometry(.5, .9, .5), quoin, 'far_hero_quoin', 'stone', P(sx * 1.4, sy * 1.4, TOWN_Z + 1 + i * 2), heroFar);
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add(new THREE.BoxGeometry(.75, 3.3, .75), pla, 'far_hero_belfry_pier', 'plaster', P(sx * 1.2, sy * 1.2, BZ - 1.65), heroFar);
    add(new THREE.BoxGeometry(2.0, 3.0, 2.0), hole, 'far_hero_belfry_dark', 'stone', P(0, 0, BZ - 1.7), heroFar); add(new THREE.SphereGeometry(.7, 10, 8), toon('#d6902f'), 'far_hero_bell', 'metal', P(0, 0, BZ - 1.6), heroFar);
    add(new THREE.BoxGeometry(3.4, .2, 3.4), stn, 'far_hero_cornice_low', 'stone', P(0, 0, BZ - .1), heroFar); add(new THREE.BoxGeometry(3.7, .16, 3.7), stn, 'far_hero_cornice', 'stone', P(0, 0, BZ + .1), heroFar);
    const rf = add(new THREE.ConeGeometry(1.9 * Math.SQRT2, .95, 4), tile, 'far_hero_tile_roof', 'clay', P(0, 0, APEX[2] - .45), heroFar); rf.rotation.y = PI / 4;
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const a = P(sx * 1.95, sy * 1.95, APEX[2] - .92), b = P(0, 0, APEX[2]), d = b.clone().sub(a), hb = add(new THREE.CylinderGeometry(.09, .09, d.length(), 6), hip, 'far_hero_roof_hip', 'clay', a.clone().addScaledVector(d, .5), heroFar); hb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
    add(new THREE.CylinderGeometry(.05, .07, SPEAR.shaftTop - SPEAR.base, 6), ir, 'far_hero_spear', 'metal', P(0, 0, (SPEAR.base + SPEAR.shaftTop) / 2), heroFar); add(new THREE.ConeGeometry(.12, SPEAR.tip - SPEAR.shaftTop, 6), ir, 'far_hero_spear_blade', 'metal', P(0, 0, (SPEAR.shaftTop + SPEAR.tip) / 2), heroFar);
    const gl = add(new THREE.SphereGeometry(.22, 10, 8), glowM('#bfe6ff', .9), 'far_hero_spear_glint', 'lamp', P(0, 0, SPEAR.tip), heroFar); gl.castShadow = false; }
  const warm = new THREE.PointLight(night ? '#ffb070' : '#ffd08a', m.chamber_glow ?? (night ? 0 : 6), 14, 1.2); warm.position.set(1.2, FLOOR_U + 1.6, 1.8); T.add(warm);

  // ---------- the white road down the south slope, dark cypresses, the far thin spear of the hero's tower ----------
  for (let y = RIVAL.y - 10; y > RIVAL.y - 64; y -= 2) add(new THREE.BoxGeometry(3.4, .6, 2.3), M.road, 'white_road', 'ground', V(RIVAL.x, y, roadZ(y) - .45), scene).rotation.x = Math.atan2(roadZ(y + 1) - roadZ(y - 1), 2);
  { let ts = 300; const cyp = (x, y, h) => { const z = hillZ(x, y) - .3, g = ctx.trees && ctx.trees.tree ? ctx.trees.tree({ kind: 'cypress', height: h * 1.12, seed: ts++, leaf: '#244a2c', leaf2: '#3f6a36', crownW: 1.25, parent: false }) : new THREE.Group(); g.name = 'cypress'; g.position.copy(V(x, y, Math.min(z, GROUND_Z))); g.rotation.y = ts * 1.7; scene.add(g); };   // v2: kit cypresses (bark trunk, thousands of sprig cards, lit and shade side)
    for (let i = 0; i < 10; i++) { const y = RIVAL.y - 13 - i * 5.4; cyp(RIVAL.x - 3.5 - (i % 2) * .4, y, 8 + (i * 37 % 5) * .8); cyp(RIVAL.x + 3.5 + ((i + 1) % 2) * .4, y - 2.4, 8.6 + (i * 53 % 5) * .7); }
    for (const [x, y, h] of [[-9, 6, 9], [-12, -3, 10.5], [16, 4, 9.5], [13, -4, 8.5], [-10, 12, 8], [9, 13, 10], [-10.6, 7.4, 7.2], [-13.4, -1.6, 8.4], [17.4, 5.6, 7.6], [14.6, -5.8, 10.2], [-11.8, 13.2, 9.6], [10.6, 14.6, 8.2], [21, -14, 9], [22.4, -16, 7.4], [-20, -18, 9.8], [-21.6, -16.4, 8]]) cyp(RIVAL.x + x, RIVAL.y + y, h); }


  // ---------- struck state: the black crack down the south face, sparks; night bolts and their flash ----------
  const crack = new THREE.Group(); crack.name = 'marble_crack'; crack.visible = false; face(0).add(crack);
  { let x = .7, u = B1 + .7; const seg = (x0, u0, x1, u1, w) => { const L = Math.hypot(x1 - x0, u1 - u0), o = box(w, L, .08, M.crack, 'crack_segment', 'stone', v3((x0 + x1) / 2, (u0 + u1) / 2, 4.53 + (u0 > B0 ? .0 : 0) + (u0 > B1 ? .75 : 0)), crack); o.rotation.z = Math.atan2(-(x1 - x0), u1 - u0); o.castShadow = false; };
    for (let i = 0; i < 30 && u > 17; i++) { const nx = Math.max(2.9, Math.min(4.2, x + rr(-.5, .5))), nx2 = u < B0 + .6 ? x + rr(-.7, .7) : nx, nu = u - rr(.6, 1.2), xx = u > B0 + .6 ? nx : Math.max(-3, Math.min(4, nx2)); seg(u > B0 + .6 && i === 0 ? 3.4 : x, u, xx, nu, .2 - i * .005); if (i % 4 === 2) seg(xx, nu, xx + rr(-.9, .9), nu - rr(.3, .7), .07); x = xx; u = nu; } }
  // the gold spark shower of the hit (v2 streaks; final pass: the line that added them to the tower had slipped into a comment, so they never drew)
  const sparks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .2, 1, 5), basic('#ffffff', { fog: false, toneMapped: false }), 70);
  sparks.name = 'strike_sparks'; sparks.userData.noExport = true; sparks.frustumCulled = false; sparks.visible = false; sparks.castShadow = false; T.add(sparks);
  const SPK = []; for (let i = 0; i < 70; i++) { const a = rr(0, PI * 2), e = rr(-.2, 1.2); SPK.push({ d: v3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)), v: rr(3, 11), s: rr(.04, .1) }); sparks.setColorAt(i, col(i % 3 ? '#ffd24a' : '#ffffff')); } sparks.instanceColor.needsUpdate = true;
  // ---------- FINAL PASS (2026-11-15, CB "make the thunder bolt much better"): every bolt is the kit bolt ctx.fx.bolt (fx_bolt.mjs), on the same film frames as before ----------
  // - every m.flash key [frame, strength] = one FAR bolt (far: true) on that frame, placed 230-290 m out along the take's own camera aim (so the bell chamber sees it through
  //   the east arch (right of the lens; the bell hides the north one) and the road / strike cameras see it behind the tower), alternating left / right; the hit's pre-flicker keys (hit-10 .. hit-1) are left to the hit's leader.
  // - the fingers (row 32 "found no road"): two close bolts whose current crawls DOWN the marble (path = a wandering line over the south face, then the east face).
  // - the hit (row 33): to = the gold angel's head, gold sparks on the metal (head, trumpet, wing), glowK .22 so the strike is a white core, not a lilac disc.
  // The world flash (chamber white, arch fill, cloud tint, ctx.sky.flash inside the storm) is driven by the bolts' own light curve every frame.
  const placeName = (Object.entries(film.places || {}).find(([, v]) => v === pl) || [])[0];
  const camAt = f => { let st = null; for (const tk of film.takes || []) if (tk.place === placeName) for (const s of tk.stations || []) if (s.at <= f && (!st || s.at >= st.at)) st = s;
    if (!st) for (const tk of film.takes || []) if (tk.place === placeName) for (const s of tk.stations || []) if (!st || s.at < st.at) st = s; return st; };
  const BOLTS = [], TW = T.position, LW = (x, y, z) => v3(x, y, z).add(TW);   // LW: tower-local -> three world (T has no rotation)
  const fxOn = ctx.fx && typeof ctx.fx.bolt === 'function';
  if (fxOn && night) {
    const hit = m.hit, fg = m.fingers; let side = 1, sd = 40;
    for (const [f0, I] of m.flash || []) { if (hit != null && f0 > hit - 11 && f0 < hit) continue; if (fg && f0 >= fg[0] - 1 && f0 <= fg[1]) continue;
      const st = camAt(f0); if (!st) continue; const c = V(...st.pos), a = V(...st.aim), dh = a.clone().sub(c); dh.y = 0; if (dh.lengthSq() < 1e-6) dh.set(0, 0, -1); dh.normalize();
      const yaw = m.arch_fill ? -(.56 + .09 * (side + 1) + (sd % 3) * .03) : side * .42 + (sd % 3) * .03, D = m.arch_fill ? 165 + (sd % 4) * 12 : 230 + (sd % 4) * 20, dir = dh.clone().applyAxisAngle(v3(0, 1, 0), yaw), to = c.clone().addScaledVector(dir, D); to.y = -6;
      const from = to.clone().addScaledVector(dir, 25).add(v3(-side * 18, 0, 0)); from.y = c.y + D * (m.arch_fill ? .58 : .62);
      BOLTS.push({ b: ctx.fx.bolt({ far: true, from, to, frame: f0, leader: 2 + (sd % 2), seed: sd, width: (m.arch_fill ? .9 : .55) + .3 * I, glowK: .22, glowWidth: 5, glow: '#aab8ff', hot: 3.6 + 1.4 * Math.min(1.8, I), restrikes: I >= 1 ? 3 : 2 }), I, gain: 1.25 * I }); side = -side; sd += 7; }
    if (fg) {   // the wandering fingers: south face first, then the east face 12 frames later (never two strokes on one frame)
      const wander = (k, x0, s) => { let x = x0, u = 44.25; const pts = [], P = (xx, uu) => { const zf = uu > 36.8 ? 4.62 : uu > 35.9 ? 5.45 : 4.68; return k === 0 ? LW(xx, uu, zf) : LW(zf, uu, -xx); };
        pts.push(P(4.1, 44.25)); x = 4.1; u = 43.6; while (u > 7.5) { const belf = u > 36.8, lo = belf ? 2.9 : -3.5, hi = belf ? 4.1 : 4.1; x = Math.max(lo, Math.min(hi, x + rr(-1.3, 1.1))); pts.push(P(x, u)); u -= rr(.9, 1.8); } return pts; };
      const wa = wander(0, 4.1, 1), wb = wander(1, 4.1, 2);
      BOLTS.push({ b: ctx.fx.bolt({ from: LW(26, 150, 46), path: wa, frame: fg[0] + 1, leader: 3, runFrames: Math.max(8, Math.round((fg[1] - fg[0]) * .8)), duration: 2.1, after: 8, seed: 41, width: .42, glowK: .22, glowWidth: 5, glow: '#b4c0ff', hot: 5.5, branches: 6, sparks: [], groundY: TW.y }), I: .7, gain: .9 });
      BOLTS.push({ b: ctx.fx.bolt({ from: LW(40, 140, -20), path: wb, frame: fg[0] + 13, leader: 2, runFrames: Math.max(8, Math.round((fg[1] - fg[0]) * .55)), duration: 1.6, after: 8, seed: 53, width: .36, glowK: .22, glowWidth: 5, glow: '#b4c0ff', hot: 5.5, branches: 5, groundY: TW.y }), I: .5, gain: .7 }); }
    if (hit != null) {   // the hit on the gold angel: white core, gold sparks on the metal only
      const head = LW(0, PED_U + 2.3, 0);
      BOLTS.push({ hit: true, b: ctx.fx.bolt({ from: LW(9, 150, -14), to: head, frame: hit, leader: 4, seed: 61, lift: .9, width: .34, glowK: .22, glowWidth: 5, glow: '#c4ccff', hot: 6, restrikes: 3, sparks: [head, LW(.55, PED_U + 1.9, .35), LW(-.6, PED_U + 2.4, -.25)], sparkN: 22, sparkColor: '#ffe39a', groundY: TW.y + 49.8, flashSize: 1.1, point: 90, pointUp: 3.2 /* the strike light 3.2 m above the head: at .4 m it burnt the gilt wing white and bloomed into a disc */ }), I: 2, gain: 3.2 }); } }
  const flashAmb = new THREE.AmbientLight('#cfe0ff', 0), flashDir = new THREE.DirectionalLight('#e6eeff', 0), hitL = new THREE.PointLight('#dfe8ff', 0, 60, 1.2); flashDir.position.copy(m.flash_from ? V(...m.flash_from) : V(.5, -.7, .8)); scene.add(flashAmb, flashDir); hitL.position.set(1.5, PED_U + 4.5, 3);   // final pass: higher and softer, so the struck angel's halo does not bloom into an orange disc T.add(hitL);

  // ---------- build-out: the detail layer (marble_dress.js), the cool blue fill from the arches, the smoke of the hit ----------
  let camNow = null; const dressUpd = dress(THREE, scene, { relief: RL, metal: MT, add, box, bar, T, BC, M, v3, V, toon, basic, glowM, night, m, RIVAL, GROUND_U, FLOOR_U, roadZ, hillZ, PI, col, camera: () => camNow });
  const archFill = []; if (m.arch_fill) for (let k = 0; k < 4; k++) { const L = new THREE.PointLight(m.arch_fill[0], m.arch_fill[1], 9, 1.3), a = k * PI / 2; L.position.set(Math.sin(a) * 3.9, FLOOR_U + (m.arch_fill[2] ?? 3.2), Math.cos(a) * 3.9); T.add(L); archFill.push(L); }
  const SMK = [], smokeM = []; for (let i = 0; i < 22; i++) { const mt = new THREE.MeshLambertMaterial({ color: i % 3 ? '#5d6684' : '#7b84a3', transparent: true, opacity: 0, depthWrite: false }); smokeM.push(mt); const s = add(new THREE.IcosahedronGeometry(1, 2), mt, 'hit_smoke_puff', 'fx', v3(0, PED_U + 1.5, 0), T); s.castShadow = s.receiveShadow = false; s.visible = false; s.userData.noExport = true; SMK.push({ o: s, d: v3(rr(-1, 1), rr(.3, 1), rr(-1, 1)).normalize(), v: rr(1.6, 3.4), s0: rr(.18, .36), t0: rr(2, 12), rise: rr(.8, 1.8) }); }
  // ---------- per frame ----------
  let sunL = null, hemiL = null, sun0 = 0, hemi0 = 0; const sunD = new THREE.Vector3(...(ctx.light.dir || [0, 1, 0])).normalize(), fw = new THREE.Vector3(), tg = new THREE.Vector3(), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion();
  const update = (f, t, R) => {
    if (R && R.camera) camNow = R.camera; dressUpd(f);
    if (wingGold && wingGold.wg.envMap !== wingGold.src.envMap) { wingGold.wg.envMap = wingGold.src.envMap; wingGold.wg.needsUpdate = true; }
    if (R && R.camera) { const c = R.camera; skyDome.position.copy(c.position); skyDome.updateMatrixWorld();
      if (!sunL) scene.traverse(o => { if (o.isDirectionalLight && o.castShadow) { sunL = o; sun0 = o.intensity; } if (o.isHemisphereLight) { hemiL = o; hemi0 = o.intensity; } });
      if (m.dim && sunL) { const k = f >= m.dim[0] && f < (m.dim[2] ?? 1e9) ? m.dim[1] : 1; sunL.intensity = sun0 * k; if (hemiL) hemiL.intensity = hemi0 * k; }
      if (sunL) { fw.set(0, 0, -1).applyQuaternion(c.quaternion); tg.copy(c.position).addScaledVector(fw, m.shadow_d ?? 8); sunL.target.position.copy(tg); sunL.target.updateMatrixWorld(); sunL.position.copy(tg).addScaledVector(sunD, 60); const sc = sunL.shadow.camera, S = m.shadow_box ?? 16; if (sc.right !== S) { sc.left = -S; sc.right = S; sc.top = S; sc.bottom = -S; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix(); } } }
    if (blob) { const up = tr(m.lift, f); blob.visible = f >= m.blob[2] && f <= m.blob[3]; blob.scale.set(1 - .25 * up, .55 * (1 - .25 * up), 1); }
    // the angel: lowered by the crane, seated with a gold flash, or struck
    const seat = m.seat, hit = m.hit; let drop = 0; if (seat) drop = 1.5 * (1 - snap(f - seat[0], seat[1] - seat[0]));
    angel.position.copy(AN0); angel.position.y += drop; angel.rotation.set(0, 0, seat && f < seat[1] ? .05 * Math.sin(f * .35) * (drop / 1.5 + .2) : 0); heroAngel.setStruck(false); crack.visible = false; sparks.visible = false;
    if (hookRope) { const top = hookRope.userData.top, bot = PED_U + drop + 2.75; hookRope.visible = !seat || f < seat[1] + 40; hookRope.position.set(0, (top + bot) / 2, 0); hookRope.scale.set(1, Math.max(.01, top - bot), 1); }
    glint.visible = false; if (seat && f >= seat[1] - 1 && f < seat[1] + 14) { const u = (f - seat[1] + 1) / 15, s = Math.sin(PI * Math.min(1, u * 1.15)); glint.visible = true; glint.position.set(.1, PED_U + 2.2, .5); glint.scale.setScalar(.25 + 1.0 * s); if (R && R.camera) glint.quaternion.copy(R.camera.quaternion).premultiply(T.getWorldQuaternion(q4).invert()); }
    if (hit != null && f >= hit) { const d = f - hit, u = Math.min(1, d / 20), k = 1 - (1 - u) * (1 - u); heroAngel.setStruck(true); crack.visible = d >= 2; crack.children.forEach((o, i) => { o.visible = i <= d * 3; });
      const rest = v3(2.2, roofU(2.2) + .55, .6), up = Math.sin(PI * Math.min(1, d / 16)) * 2.2 * (1 - u * .5); angel.position.set(AN0.x + (rest.x - AN0.x) * k, AN0.y + (rest.y - AN0.y) * k + up, rest.z * k); angel.rotation.set(.25 * k, 0, -1.95 * k + (u < 1 ? .5 * Math.sin(d * .6) * (1 - u) : 0));
      sparks.visible = d < 40; const tt = d / 30; for (let i = 0; i < 70; i++) { const s = SPK[i], sc = Math.max(.001, s.s * (1 - tt / 1.3)); const vel = v3(s.d.x * s.v, s.d.y * s.v - 9.8 * tt, s.d.z * s.v), sp = Math.max(vel.length(), 1e-3); q4.setFromUnitVectors(v3(0, 1, 0), vel.multiplyScalar(1 / sp)); m4.compose(v3(s.d.x * s.v * tt, PED_U + 1.6 + s.d.y * s.v * tt - 4.9 * tt * tt, s.d.z * s.v * tt), q4, v3(sc * 1.2, sc * (2 + sp * .9), sc * 1.2)); sparks.setMatrixAt(i, m4); } sparks.instanceMatrix.needsUpdate = true;
      // the hit (build-out): a bright first flash (white core + soft glow, 0-6 f), then gold and white sparks, then soft blue-grey smoke that swells, rises and thins
      SMK.forEach((p, i) => { const e = d - p.t0; p.o.visible = e > 0 && e < 90; if (!p.o.visible) return; const tt = e / 30; p.o.position.set(p.d.x * p.v * Math.sqrt(tt) * 1.6 + .5 * tt, PED_U + 1.6 + p.d.y * p.v * Math.sqrt(tt) + p.rise * tt, p.d.z * p.v * Math.sqrt(tt) * 1.6); p.o.scale.set(p.s0 + 1.3 * Math.sqrt(tt), (p.s0 + 1.3 * Math.sqrt(tt)) * .7, p.s0 + 1.3 * Math.sqrt(tt)); smokeM[i].opacity = .22 * Math.min(1, e / 4) * Math.max(0, 1 - e / 90); }); }
    else { SMK.forEach(p => { p.o.visible = false; }); }
    // the bell, its rope, the hum, the cap
    const th = tr(m.bell, f) * PI / 180; sw.rotation.z = th; { const thP = tr(m.bell, f - 3) * PI / 180; clapper.rotation.z = Math.max(-.36, Math.min(.36, -th * .9 + (thP - th) * 1.6)); }
    const lift = tr(m.lift, f), loose = m.loose != null && f >= m.loose, bot = loose ? 1.1 : Math.max(.25, (m.rope_bot ?? .45) + lift), len = PIVOT - bot; ropeG.rotation.z = loose ? .42 * Math.sin((f - m.loose) * .21 + 1.2) * Math.exp(-(f - m.loose) / 90) : 0; ropeG.rotation.x = loose ? .12 * Math.sin((f - m.loose) * .17) : 0;
    ropeM.position.set(0, -len / 2, 0); ropeM.scale.set(1, len, 1); ropeK.position.set(0, -len, 0); sally.position.set(0, -len + .95, 0);
    rag.visible = !!m.rag_at && m.rag && f >= m.rag[0] && f < m.rag[1]; if (rag.visible && m.rag_at) rag.position.copy(V(m.rag_at[0], m.rag_at[1] + .05 * Math.sin(f * 1.3), m.rag_at[2] + .04 * Math.cos(f * 1.3)));
    hum.forEach((r, i) => { const f0 = (m.hum ?? 1e9) + i * 5; r.visible = f >= f0 && f < f0 + 22; if (r.visible && m.hum_at) { const u = (f - f0) / 22; r.position.copy(V(...m.hum_at)); r.scale.setScalar(.25 + 1.9 * u); r.material.opacity = .85 * (1 - u); if (R && R.camera) r.quaternion.copy(R.camera.quaternion); } });
    cap.visible = m.cap != null && f >= m.cap; if (cap.visible && m.cap_at) { const d = f - m.cap, tt = d / 30, p = m.cap_at; cap.position.copy(V(p[0] + .55 + .5 * tt, p[1] - .9 * tt, p[2] + Math.max(-1.6, 3.2 * tt - 4.9 * tt * tt * .8))); cap.rotation.set(0, 0, d * .33); cap.scale.setScalar(1.25); }
    // lightning (final pass): the world flash follows the kit bolts' own light curve (stroke, dim, restrikes, afterglow); each lit bolt lights the storm from inside (ctx.sky.flash)
    let fl = 0, slot = 0; const tb = t != null ? t : f / (film.fps || 30);
    for (const B of BOLTS) { B.b.update(tb); const L = B.b.state.light || 0; fl += L * B.gain;
      if (L > .01 && slot < 4 && ctx.sky && ctx.sky.flash) ctx.sky.flash(B.b.start.clone().sub(kitClouds ? kitClouds.position : TW), Math.min(2.2, L * (B.hit ? 1.6 : .9 + .5 * B.I)), { slot: slot++, spread: B.hit ? .38 : .26 }); }
    if (ctx.sky && ctx.sky.flash) for (; slot < 4; slot++) ctx.sky.flash([0, 1, 0], 0, { slot });
    for (const [f0, I] of m.flash || []) if (f >= f0 && (!fxOn || (hit != null && f0 > hit - 11 && f0 < hit))) fl += I * Math.exp(-(f - f0) / (m.flash_decay ?? 5));   // no kit bolt (old kit): the old flash curve; with bolts only the storm's pre-hit flicker (the sky glowing before the hit's leader)
    if (fxOn && hit != null && f >= hit - 10 && f < hit) for (const [f0, I] of m.flash || []) if (f >= f0 && f0 > hit - 11 && f0 < hit && ctx.sky && ctx.sky.flash && f - f0 < 4) ctx.sky.flash(V(RIVAL.x + 30, RIVAL.y + 40, 140).sub(kitClouds ? kitClouds.position : TW), I * (1 - (f - f0) / 4), { slot: 3, spread: .45 });
    const fg = m.fingers; let fon = false; if (fg && f >= fg[0] && f <= fg[1] + 4) { fon = true; fl += .2 + .08 * Math.sin(f * 2.3); }
    if (fxOn && hit != null && f >= hit - 10 && f < hit) fl += 1.2;   // the storm flickers on and off over the angel before the hit (leader glow)
    if (fxOn && hit != null && f >= hit && f < hit + 6) fl += .7;   // the dim frames between the hit's restrikes keep the burning glow
    if (hit != null && f >= hit + 6) fl += 1.3 + 1.6 * Math.exp(-(f - hit - 6) / 12);   // the burning angel lights the night after the hit (final pass: +.4, the kit bolt lights less than the old white ball)
    const flD = m.arch_fill ? fl : Math.min(fl, 1.4); flashAmb.intensity = (fl * 1.25 + (fl - flD) * .6) * (m.flash_amb ?? 1.0); flashDir.intensity = flD * (m.flash_dir ?? 1.6);   // outdoors the direct flash is capped (a very hard white key flattens the roof), the rest goes to a stronger soft fill U.fl.value = Math.min(1.6, fl * .6); { const kf = Math.min(1, fl * .45); for (const [u, l0, s0] of cloudBase) { u.lit.value.copy(l0).lerp(col('#f2f6ff'), kf); u.shade.value.copy(s0).lerp(col('#9fb4ff'), kf * .8); } } hitL.intensity = (fon ? 60 : 0) + (hit != null && f >= hit + 6 ? 90 * Math.exp(-(f - hit - 6) / 8) : 0); archFill.forEach(L => { L.intensity = m.arch_fill[1] * (1 + .6 * Math.min(2, fl)); });
    if (world && world.update) world.update(f, t, R);
  };
  const at = (dx, dy, u) => [RIVAL.x + dx, RIVAL.y + dy, RIVAL.base + u];
  return { update, anchors: { angel: at(0, 0, PED_U + 1.5), deck: at(2, 0, DECK_U), bell_floor: at(0, 0, FLOOR_U), rope: at(ROPE.x, -ROPE.z, FLOOR_U + 1.9), door: at(0, -6.4, GROUND_U), hero_tower: [APEX[0], APEX[1], APEX[2]] } };
}
