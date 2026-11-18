// SET S4 (stretch builder S4, 2026-11-15, rough board): THE VINEYARD RIDGE between the two hills, summer storm, about 1765.
// LOCAL plan metres, Z up. Origin = where the pickers stand in the aisle between the vine rows. World place of the origin: VY (below), ground 5 m above the town.
// THE RIDGE TREE (world landmark, exported as TREE): one old oak 63 m along the ridge from the pickers, 16 m tall, alone against the sky. The pickers are FAR from it.
// film.json places.<name>.s4: { strike: frame the bolt hits (the tree is whole before it), fall: [f0, f1] the two halves fall apart, flash: [frame, half width] }.
// From the strike on: the tree is split down the middle, the halves lean apart and burn in the rain; the bolt is one branched channel of light; the flash lights
// the whole ridge (light and vine colour). Rain = slanted streaks, see-through sheets, splash rings (square.js buildRain). The rival's white tower stands at its
// world place behind the rain; the hero tower is behind the camera.
import { RIVAL, TOWN_Z } from './tower_top.js';
import { kitTools, buildRain, buildBolt, buildRivalTower, glowSprite, texOf, rep, vn, hsh, plankTex } from './square.js';
// drawn maps for the ridge (build-out 2026-11-15): a five-lobed vine leaf (alpha), an oak leaf spray (alpha), fissured bark, the mud furrows between the rows
const leafTex = THREE => texOf(THREE, 'vineleaf', 128, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const dx = (x - 64) / 58, dy = (N - 1 - y - 30) / 58, r = Math.hypot(dx, dy), th = Math.atan2(dx, dy),
    R = (.62 + .38 * Math.pow(Math.abs(Math.cos(2.5 * th)), .7)) * (1 - .55 * Math.exp(-Math.pow(Math.abs(th) - Math.PI, 2) / .06)) * (1 + .03 * Math.sin(th * 23));
  let vein = 0; for (const a of [0, 1.15, -1.15, 2.2, -2.2]) { const d = Math.abs(dx * Math.cos(a) - dy * Math.sin(a)), along = dx * Math.sin(a) + dy * Math.cos(a); if (along > 0 && d < .025 * Math.max(0, 1 - along)) vein = 1; }
  const inside = r < R * .95, edge = r > R * .82; P(x, y, vein ? [190, 214, 160] : edge ? [205, 228, 190] : [244, 255, 232].map(v => v * (.9 + .1 * vn(x / 7, y / 7))), inside ? 255 : 0); } });
const sprayTex = THREE => texOf(THREE, 'oakspray', 128, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) P(x, y, [0, 0, 0], 0);
  for (let k = 0; k < 26; k++) { const cx = 14 + hsh(k, 1) * 100, cy = 14 + hsh(k, 2) * 100, a = hsh(k, 3) * 6.28, L = 12 + hsh(k, 4) * 9;
    for (let y = -24; y <= 24; y++) for (let x = -24; x <= 24; x++) { const u = (x * Math.cos(a) + y * Math.sin(a)) / L, v = (-x * Math.sin(a) + y * Math.cos(a)) / (L * .45);
      if (u * u + v * v * (1 + .5 * Math.sin(u * 14) ** 2) < 1) P(Math.round(cx + x), Math.round(cy + y), [225 + 30 * hsh(k, 5), 255, 215].map(c => c * (.82 + .18 * (1 - Math.abs(v)))), 255); } } });
const barkTex = THREE => texOf(THREE, 'bark', 128, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = vn(x / 5 + vn(x / 9, y / 30) * 2, y / 26), c = f > .62 ? .45 : .8 + .25 * vn(x / 3, y / 9); P(x, y, [255, 246, 236].map(v => v * c)); } });
const furrowTex = THREE => texOf(THREE, 'furrow', 256, (P, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, d = Math.min(u, 1 - u), n = vn(x / 10, y / 10, 25.6), grass = d < .12 + .04 * n, rut = Math.sin(u * Math.PI * 6) * .5 + .5, wet = vn(x / 18 + 9, y / 40) > .62 && !grass;
  P(x, y, grass ? [106 + 40 * n, 168 + 30 * n, 62 + 20 * n].map(v => v * (hsh(x, y) > .7 ? .8 : 1)) : wet ? [92, 70, 52].map(v => v * (.85 + .2 * n)) : [138 + 30 * rut + 14 * n, 100 + 22 * rut + 10 * n, 66 + 14 * rut].map(v => v * (hsh(x * 3, y) > .97 ? 1.25 : 1))); } });
export const VY = { x: 42, y: 108, z: TOWN_Z + 5 };
export const TREE = { x: 30, y: 171, h: 27 };                         // world place of the ridge tree
const rnd = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

export async function build(THREE, scene, film, ctx) {
  const T = kitTools(THREE, scene, ctx), { V, add, box, cyl, bar, basic, toon, relief: RL, metal: MT, wetOf } = T, pl = ctx.place || {}, K = pl.s4 || {}, R0 = rnd(41), rr = (a, b) => a + (b - a) * R0();
  const TX = TREE.x - VY.x, TY = TREE.y - VY.y, FAR = [RIVAL.x - VY.x, RIVAL.y - VY.y, RIVAL.base - VY.z, RIVAL.top - VY.z];
  scene.fog = new THREE.Fog('#a9b8b4', 30, 240);
  // the ridge: a long green back with the flat top the cast stands on, the valley on both sides
  add(new THREE.CircleGeometry(700, 40), RL('grass', '#5f9a52', { scale: 8, seed: 70 }), 'valley_ground', 'ground', V(0, 60, -5)).rotation.x = -Math.PI / 2;
  { const r = add(new THREE.SphereGeometry(1, 30, 14, 0, Math.PI * 2, 0, Math.PI / 2), RL('grass', '#6aa83e', { scale: 3, seed: 71 }), 'ridge_back', 'ground', V(-4, 40, -5.05)); r.scale.set(60, 5, 150); r.castShadow = false; }
  box(30, 120, .1, 0, 40, -.12, RL('grass', '#6f9e40', { scale: 2.2, seed: 72 }), 'ridge_top_grass', 'ground');
  for (const [x, y, t, rx, ry, c] of [[-190, 260, 30, 190, 90, '#4a8a62'], [200, 300, 28, 200, 90, '#4a7f6a'], [-60, 420, 34, 260, 80, '#5a8fa0'], [FAR[0] + 4, FAR[1] + 14, FAR[2] + 5.5, 110, 75, '#4c9a54']]) { const m = add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), RL('grass', c, { scale: 10, seed: 73 }), 'hill_far', 'foliage', V(x, y, -5)); m.scale.set(rx, t, ry); m.castShadow = false; }
  buildRivalTower(THREE, scene, T, FAR, true);
  // MUD FURROWS: the rows stand on grass strips, wet ploughed mud between them (a drawn map with ruts and wet patches, a rain shine); the aisle is a puddled cart track
  const mudN = RL('mud', '#8a6446', { scale: 1.8, seed: 74 }), furM = (map, sc, o = {}) => { const m = new THREE.MeshPhongMaterial({ color: '#ffffff', map, normalMap: mudN.normalMap || null, normalScale: new THREE.Vector2(1.4, 1.4), shininess: 55, specular: '#7a8a8a', ...o }); m.userData.k3scale = sc; return m; };
  for (const sd of [-1, 1]) box(7.2, 120, .1, sd * 6.2, 40, -.09, furM(furrowTex(THREE), 1.8), 'mud_furrows', 'ground');
  box(5.2, 120, .1, 0, 40, -.085, wetOf(RL('mud', '#9a7452', { scale: 2.0, seed: 75 }), { shininess: 60, specular: '#8a9a9a' }), 'aisle_cart_track', 'ground');
  for (const sd of [-1, 1]) box(.38, 58, .02, sd * .95, 21, .0, wetOf(RL('mud', '#5a3e28', { scale: .8, seed: 76 }), { shininess: 80, specular: '#9aaab0' }), 'cart_rut_wet', 'ground');
  const puddles = []; for (const [x, y, r] of [[.95, -1.6, .5], [-.95, 2.8, .45], [.95, 7.4, .6], [-3.5, .8, .5], [3.5, -2.4, .55], [5.3, 4.2, .5], [-5.3, 6.4, .6], [-.95, 13, .6], [3.5, 10, .5], [0, 18, .8]]) {
    const p = add(new THREE.CircleGeometry(r, 20), MT('wet', { color: '#7a8a96', rough: .03, env: 1.8, seed: 77, toon: '#8a9aa6' }), 'puddle', 'water', V(x, y, .012)); p.rotation.x = -Math.PI / 2; p.scale.set(.7, 2.2, 1); p.castShadow = false;
    const rings = [0, 1, 2].map(() => { const q = add(new THREE.RingGeometry(.8, 1, 20), basic('#ffffff', { transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), 'puddle_ring_glow', 'water', V(x, y, .02)); q.rotation.x = -Math.PI / 2; q.castShadow = false; return q; }); puddles.push({ rings, r, x, y, ph: x * 3 + y }); }
  // grass clumps along the rows and the aisle edges
  { const bl = new THREE.InstancedMesh(new THREE.ConeGeometry(.025, .32, 4), toon('#ffffff'), 2600), m4b = new THREE.Matrix4(), qb = new THREE.Quaternion(), eb = new THREE.Euler(); bl.name = 'grass_clumps'; bl.userData.role = 'foliage'; let k = 0;
    for (const x of [-9.8, -8, -6.2, -4.4, -2.6, 2.6, 4.4, 6.2, 8, 9.8, -1.75, 1.75]) for (let y = -8; y < 34 && k < 2600; y += .25 + R0() * .3) for (let j = 0; j < 4 && k < 2600; j++, k++) { const h = rr(.6, 1.3); qb.setFromEuler(eb.set(rr(-.35, .35), 0, rr(-.35, .35))); m4b.compose(V(x + rr(-.25, .25), y + rr(-.1, .1), .1 * h), qb, new THREE.Vector3(1, h, 1)); bl.setMatrixAt(k, m4b); bl.setColorAt(k, new THREE.Color(['#5fa83a', '#7cbf48', '#4a8f30', '#8ac850'][k % 4])); }
    bl.count = k; bl.instanceMatrix.needsUpdate = true; bl.instanceColor.needsUpdate = true; bl.castShadow = false; scene.add(bl); }
  // VINES on stakes and wires: chestnut stakes (end posts braced), two wires, gnarled trunks up to a cordon on the low wire, five-lobed leaves on the canes, hanging bunches
  const LT = leafTex(THREE), leafM = toon('#ffffff', { map: LT, alphaTest: .5, side: THREE.DoubleSide }), NL = 9000, leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), leafM, NL), NG = 4200, grapes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), toon('#ffffff'), NG), m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), eu = new THREE.Euler();
  leaves.name = 'vine_leaves'; leaves.userData.role = 'foliage'; grapes.name = 'grape_bunches'; grapes.userData.role = 'foliage'; let nl = 0, ng = 0; const lc = ['#3f9a2e', '#57b03a', '#2f8228', '#6cbc3e', '#4aa634', '#8ab83a'].map(c => new THREE.Color(c)), gc = ['#4a1a6a', '#6a2a8a', '#8a3aa8', '#52206e'].map(c => new THREE.Color(c)), leafBase = [], leafP = [];
  const postM = RL('wood', '#8a6a48', { scale: .5, seed: 78 }), trunkM = RL('bark', '#5a4030', { scale: .35, seed: 79 }), wireM = MT('iron', { color: '#7a8296', rough: .3, seed: 80, toon: '#4a4a52' });
  for (const x of [-9.8, -8, -6.2, -4.4, -2.6, 2.6, 4.4, 6.2, 8, 9.8]) { const near = Math.abs(x) < 7;
    for (let y = -8; y < 50; y += 2.4) { bar([x, y, -.1], [x + rr(-.03, .03), y, 1.6 + rr(-.04, .06)], y === -8 ? .07 : .045, postM, 'vine_stake', 'wood');
      if (near && y < 34) for (const dy of [.8, 1.6]) { let p = [x + rr(-.08, .08), y + dy, 0]; for (let k = 1; k <= 3; k++) { const q = [x + rr(-.09, .09), y + dy + rr(-.12, .12), .3 * k]; bar(p, q, .045 - k * .006, trunkM, 'vine_trunk_gnarled', 'wood', scene, .05 - k * .006); p = q; }
        bar(p, [x, y + dy + .7, .9], .022, trunkM, 'vine_cordon', 'wood'); bar(p, [x, y + dy - .7, .9], .022, trunkM, 'vine_cordon', 'wood'); } }
    bar([x, -8, 1.5], [x, -9.6, 0], .03, postM, 'end_post_brace', 'wood');
    for (const z of [.9, 1.45]) bar([x, -8, z], [x, 50, z], .007, wireM, 'vine_wire', 'metal');
    const step = near ? .055 : .16; for (let y = -8; y < 50 && nl < NL; y += step * (y > 30 ? 2.2 : 1)) { const s = rr(.17, .27) * (near ? 1 : 1.5), z = rr(.85, 1.95), out = (R0() < .5 ? -1 : 1);
      eu.set(rr(-.5, .5), out * Math.PI / 2 + rr(-.7, .7), rr(-.6, .6)); q0.setFromEuler(eu); const p = V(x + out * rr(.02, .22), y, z); m4.compose(p, q0, new THREE.Vector3(s, s, s)); leaves.setMatrixAt(nl, m4); const c = lc[Math.floor(R0() * 6)]; leaves.setColorAt(nl, c); leafBase.push(c); leafP.push([p.clone(), q0.clone(), s, R0() * 6.28]); nl++;
      if (R0() < (near ? .03 : .02) && y < 34 && ng < NG - 20) { const side = x < 0 ? 1 : -1, bx = x + side * rr(.12, .22), bz = rr(.55, .8), col = gc[Math.floor(R0() * 4)];   // a bunch: a cone of berries, broad at the top
        for (let k = 0; k < 16; k++) { const lv = k / 16, rad = .075 * (1 - lv * .8), a = k * 2.4; m4.compose(V(bx + Math.cos(a) * rad * R0(), y + Math.sin(a) * rad * R0(), bz - lv * .2), new THREE.Quaternion(), new THREE.Vector3(.024, .026, .024)); grapes.setMatrixAt(ng, m4); grapes.setColorAt(ng, col.clone().offsetHSL(0, 0, rr(-.05, .08))); ng++; } } } }
  leaves.count = nl; grapes.count = ng; for (const im of [leaves, grapes]) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  // full grape baskets and a ladder in the aisle edge, a wooden tub
  const basket = (x, y) => { const pts = [[.14, 0], [.24, .04], [.3, .22], [.33, .4]].map(([r, yy]) => new THREE.Vector2(r, yy)); const b = add(new THREE.LatheGeometry(pts, 14), Object.assign(RL('wood', '#d9a04a', { scale: .3, seed: 81 }), { side: THREE.DoubleSide }), 'grape_basket', 'wood', V(x, y, 0)); add(new THREE.TorusGeometry(.33, .025, 6, 18), toon('#a86a2a'), 'grape_basket_rim', 'wood', V(x, y, .4)).rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) add(new THREE.SphereGeometry(.075, 8, 6), basic(['#6a2a8a', '#8a3aa8', '#52206e'][i % 3]), 'grapes_in_basket', 'foliage', V(x + rr(-.2, .2), y + rr(-.2, .2), .42 + rr(0, .08))); };
  basket(-1.9, 1.2); basket(2.0, -.6); basket(-2.0, 4.6); basket(1.95, 6.5);
  cyl(.5, .58, .6, 2.05, 3.2, 0, RL('wood', '#a8703a', { scale: .6, seed: 82 }), 'grape_tub', 'wood', 14); for (const z of [.12, .48]) add(new THREE.TorusGeometry(.56, .025, 6, 20), MT('iron', { seed: 83, toon: '#3a3a48' }), 'grape_tub_hoop', 'metal', V(2.05, 3.2, z)).rotation.x = Math.PI / 2;
  // ----- THE OLD TREE (v2): a big old oak built from TWO kit oaks (ctx.trees: bark trunk forking three times, oak leaf-card crown), one per half, round a fissured split trunk with
  // root flares and knots. The halves share the seam the bolt opens; whole before the strike, they lean apart and burn after it. Fog off on the tree so it stays dark-green and sharp against the rain.
  const tree = new THREE.Group(); tree.name = 'ridge_tree'; tree.position.copy(V(TX, TY, -1.2)); scene.add(tree); const H = TREE.h, halves = [], barkA = RL('bark', '#6e523a', { scale: 1.6, seed: 84 }), barkB = RL('bark', '#614832', { scale: 1.6, seed: 85 }), heart = basic('#ffe2a0'), TR = H * .4;
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.name = 'tree_half'; tree.add(g); const bk = s > 0 ? barkA : barkB;
    const tr = add(new THREE.CylinderGeometry(1.35, 2.2, TR, 16, 1, false, s > 0 ? 0 : Math.PI, Math.PI), bk, 'tree_half_trunk', 'wood', new THREE.Vector3(0, TR / 2, 0), g); tr.material = bk.clone(); tr.material.side = THREE.DoubleSide; tr.material.userData = { ...bk.userData };
    for (const [a, l] of [[.4, 3.4], [1.2, 2.6], [1.9, 3.2], [2.7, 2.8]]) { const ang = (s > 0 ? 0 : Math.PI) + a, f = add(new THREE.ConeGeometry(.95, l, 9), bk, 'tree_root_flare', 'wood', new THREE.Vector3(Math.sin(ang) * 2.0, .45, Math.cos(ang) * 2.0), g); f.rotation.set(Math.cos(ang) * 1.25, 0, -Math.sin(ang) * 1.25); }
    for (let k = 0; k < 6; k++) { const kn = add(new THREE.SphereGeometry(.38, 10, 8), bk, 'tree_knot', 'wood', new THREE.Vector3(s * 1.25 + rr(-.3, .3), rr(2, TR - 1), rr(-1.1, 1.1)), g); kn.scale.set(.6, 1, .6); }
    const face = add(new THREE.PlaneGeometry(.05, TR), heart, 'tree_split_face_glow', 'wood', new THREE.Vector3(s * .05, TR / 2, 0), g); face.scale.x = 30; face.rotation.y = Math.PI / 2; face.visible = false; g.userData.face = face;
    let lv = null; const oak = ctx.trees ? ctx.trees.tree({ kind: 'oak', height: H, seed: s > 0 ? 61 : 67, parent: false, bark: s > 0 ? '#6e523a' : '#614832', leaf: '#356f26', leaf2: '#64a03c', crownW: 3.0, clusters: 60, perCl: 95, leafSize: .5 }) : null;
    if (oak) { oak.position.set(s * .8, 0, 0); oak.rotation.y = s > 0 ? 0 : Math.PI; g.add(oak); oak.traverse(o => { if (o.material) o.material.fog = false; if (o.isInstancedMesh) lv = o; }); }
    g.userData.leaves = lv;
    const fl = []; for (let i = 0; i < 10; i++) { const f = add(new THREE.ConeGeometry(rr(.9, 1.7), rr(3.2, 6), 7), basic(i % 3 === 0 ? '#ffe27a' : i % 3 === 1 ? '#ff9a2e' : '#ff6a1e', { fog: false }), 'tree_fire_glow', 'lamp', i < 3 ? new THREE.Vector3(s * rr(.3, 1.2), TR * rr(.5, .95), rr(-.6, .6)) : new THREE.Vector3(s * rr(1.5, 5.5), rr(13, 22), rr(-3, 3)), g); f.castShadow = false; f.visible = false; fl.push(f); }
    const sp = glowSprite(THREE, '#ff9a3a'); sp.name = 'tree_fire_halo_glow'; sp.position.set(s * 2, H * .55, 0); sp.scale.setScalar(.01); g.add(sp); g.userData.fire = fl; g.userData.halo = sp; g.userData.s = s; halves.push(g); }
  const smoke = []; for (let i = 0; i < 8; i++) { const m = add(new THREE.SphereGeometry(1, 10, 8), basic('#5a5a66', { transparent: true, opacity: .0, depthWrite: false }), 'tree_smoke', 'cloth', new THREE.Vector3(rr(-3, 3), H * (1 + i * .16), rr(-1, 1)), tree); m.castShadow = false; m.scale.setScalar(1.6 + i * .5); smoke.push(m); }
  // the bolt from the cloud base down into the crown: one channel, forks leave it
  // FINAL PASS 2026-11-15: the kit bolt (ctx.fx.bolt) with to = the crown top, stroke on K.strike (the split frame); made after the sky (below) so it can light the clouds
  let bolt = null;
  const fireL = new THREE.PointLight('#ff8a2e', 0, 120, 1.2); fireL.position.copy(V(TX, TY, 9)); scene.add(fireL);
  // THE SKY (ctx.sky.clouds rain-overcast, heavy and low, darker bases); the sector toward the white tower gets only high cloud; the flash lights the cloud undersides
  const SKC = { top: '#4a5260', mid: '#66707e', hor: '#b4c2c2', sun: '#e6eef0', lit: '#d0d8dc', shade: '#465060', rim: '#e6ecf0', glow: .2 }, clouds = [];
  if (ctx.sky) { clouds.push(ctx.sky.clouds({ kind: 'rain-overcast', colors: SKC, seed: 51, arc: [-80, 262], coverage: 1.3, scale: 1.5, minEl: 6, maxEl: 30 })); clouds.push(ctx.sky.clouds({ kind: 'rain-overcast', colors: SKC, seed: 52, arc: [262, 290], dome: false, coverage: .6, minEl: 24, maxEl: 36 })); }
  if (ctx.fx && K.strike != null) bolt = ctx.fx.bolt({ plan: true, from: [TX + 14, TY + 30, 125], to: [TX, TY, H - 2.4], frame: K.strike, leader: 4, seed: 3, width: .7, glowK: .2, glowWidth: 3.5, branches: 9, light: 3.6, reach: 70, clouds: clouds[0] });
  const cloudMats = []; for (const cg of clouds) cg.traverse(o => { if (o.material && o.material.uniforms && o.material.uniforms.lit) cloudMats.push({ u: o.material.uniforms, lit: o.material.uniforms.lit.value.clone(), shade: o.material.uniforms.shade.value.clone() }); });
  // OLIVE LINES on both flanks of the ridge, a CYPRESS LINE up the far hill toward the white tower (ctx.trees)
  { const zr = (x, y) => { const dx = (x + 4) / 60, dy = (y - 40) / 150, q = 1 - dx * dx - dy * dy; return Math.max(Math.abs(x) < 15 ? -.12 : -5, q > 0 ? 5 * Math.sqrt(q) - 5.05 : -5); };
    if (ctx.trees) { for (const x of [-17, -21.5, 17, 21.5]) for (let y = -2; y < 58; y += 7.5) { const xx = x + rr(-.6, .6), yy = y + (x > 0 ? 3 : 0); if (Math.hypot(xx - TX, yy - TY) < 14) continue; ctx.trees.tree({ kind: 'olive', at: [xx, yy, zr(xx, yy) - .1], height: rr(4.6, 5.8), seed: 400 + Math.round(x * 10 + y), leaf: '#7a9064', leaf2: '#a8b694', perCl: 45 }); }
      for (let i = 0; i < 14; i++) { const u = i / 13, x = FAR[0] - 34 + 26 * u + (i % 2 ? 4 : -4), y = FAR[1] - 70 + 52 * u; ctx.trees.tree({ kind: 'cypress', at: [x, y, (() => { const dx = (x - FAR[0] - 4) / 110, dy = (y - FAR[1] - 14) / 75, q = 1 - dx * dx - dy * dy; return q > 0 ? (FAR[2] + 5.5) * Math.sqrt(q) - 5.3 : -5.3; })()], height: 10 + (i % 3) * 2, seed: 500 + i }); } } }
  const rain = buildRain(THREE, scene, T, { n: 2600, len: 1.2, opacity: .5, slant: .26, box: [-14, 14, -10, 34, 9], splashes: 320, color: '#eef4f8', sheets: [[6, 30, 14, .3], [13, 50, 20, .36], [26, 90, 30, .42], [50, 170, 50, .5], [90, 300, 80, .5]] });
  const hemi = scene.children.find(o => o.isHemisphereLight), hemi0 = hemi ? hemi.intensity : 1, white = new THREE.Color('#f4ffe8'), cTmp = new THREE.Color();
  const sm = (a, b, f) => { const u = Math.min(1, Math.max(0, (f - a) / Math.max(1e-4, b - a))); return u * u * (3 - 2 * u); };
  let lastFl = -1;
  const update = (f, t, R) => { rain.update(f, R);
    const st = K.strike ?? 1e9, fall = K.fall || [st + 2, st + 16], hit = f >= st, u = hit ? sm(fall[0], fall[1], f) : 0, e = u + (u >= 1 ? .04 * Math.exp(-(f - fall[1]) / 4) * Math.sin((f - fall[1]) * 1.2) : 0);
    let fl = 0; if (bolt) { bolt.update(t); fl = Math.min(1, bolt.state.light); if (ctx.sky && ctx.sky.flash) ctx.sky.flash({ pos: bolt.start.toArray() }, bolt.state.light, { spread: .4, slot: 0 }); }   // the bolt's own light curve
    for (const g of halves) { g.rotation.z = -g.userData.s * (.03 * (hit ? 1 : 0) + .62 * e); g.userData.face.visible = hit; for (const [i, fm] of g.userData.fire.entries()) { fm.visible = hit && f > st + 2 + i; fm.scale.set(1, 1 + .3 * Math.sin(f * 1.3 + i * 2), 1); fm.rotation.z = g.userData.s * (.62 * e) + .15 * Math.sin(f * .7 + i); }
      g.userData.halo.scale.setScalar(hit ? 16 + 9 * u + Math.sin(f * 1.1) : .01); if (hit && !g.userData.burnt && g.userData.leaves) { const lv = g.userData.leaves, bc = new THREE.Color('#3a2a22'); for (let i = 0; i < lv.count; i += 3) lv.setColorAt(i, bc); lv.instanceColor.needsUpdate = true; g.userData.burnt = 1; } }
    smoke.forEach((m, i) => { m.material.opacity = hit ? .5 * sm(st + 4 + i * 2, st + 14 + i * 2, f) * (1 - i / 10) : 0; m.position.x = Math.sin(i * 1.7) * 2 + (hit ? (f - st) * .04 * i : 0); });
    fireL.intensity = hit ? 900 * (.6 + .4 * u) : 0; if (hemi) hemi.intensity = hemi0 * (1 + .3 * fl);
    for (const P of puddles) P.rings.forEach((q, k) => { const u = (((f / 14 + k / 3 + P.ph) % 1) + 1) % 1, r = P.r * (.15 + .6 * u); q.scale.set(r * .7, r * 1.6, 1); q.material.opacity = .55 * (1 - u); });
    for (let i = 0; i < nl; i += 1) { const L = leafP[i]; if (L[0].z > -24 && Math.abs(L[0].x) < 7) { const w = .12 * Math.sin(f * .21 + L[3] + L[0].z * .3); m4.compose(L[0], q0.copy(L[1]).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), w)), new THREE.Vector3(L[2], L[2], L[2])); leaves.setMatrixAt(i, m4); } } leaves.instanceMatrix.needsUpdate = true;
    if (Math.abs(fl - lastFl) > 1e-3) { for (let i = 0; i < nl; i++) leaves.setColorAt(i, cTmp.copy(leafBase[i]).lerp(white, fl * .35)); leaves.instanceColor.needsUpdate = true; lastFl = fl; } };
  update(0, 0, null);
  return { update, anchors: { pickers: [0, 0, 0], tree_foot: [TX, TY, 0], tree_top: [TX, TY, H], rival_top: [FAR[0], FAR[1], FAR[3]] } };
}
