// SET S6 (stretch builder S6): THE CHURCH YARD behind the hero's tower, rose dawn after the storm (light A2), 1765. v2 BUILD-OUT 2026-11-15 (fresh builder).
// YARD-LOCAL plan metres: Z up, ground z = 0, origin = the foot of the CHICKEN COOP's spear. local = world plan (tower_top.js) - YARD_O.
// The whole tower_top.js world (hero tower, town, hills, rival tower) is built by its own builder and shifted by -YARD_O, so every landmark stays where the
// world constants put it and the kit's sun shadow box covers the yard. tower_top.js is NOT edited: the gold angel and the spire of the white tower are hidden
// here (roofless, cracked, smoking), its storm sky is replaced by the dawn sky (and faded back in for the loop, place.loop), the big wire runs down into the earth.
// v2 detail: every roof is ROWS OF BARREL TILES (instanced coppi, colour per tile, wet sheen near the ridge, rafter tails, barge boards); walls are painted
// textures with real parts (house: plaster with corner stones, string course, cracks, worn patches; barn: planks with grain on a coursed stone plinth);
// the dovecote has real holes with landing ledges and doves (sitting, bobbing, three flying); the well has stone courses, coping, windlass, rope and bucket;
// the ground is wet packed earth with pebbles, ruts, mud shine and straw; puddles hold the rose sky with drip rings; 30+ kinds of yard props; lettering
// (hand-painted, Italian of the time): CANONICA (the priest's house), FIENILE (barn), POLLAIO (coop), FERRO (the crate of spare spears).
// Air: dawn motes in the sun, drips from the eaves with rings in the puddles, chimney smoke, doves, swallows, washing in the wind. Shaders guard pow / sqrt / division.
import { build as buildTowerWorld, APEX, RIVAL, TOWN_Z, SPEAR, CAM0 } from './tower_top.js';
export const YARD_O = [-1.1, -16, TOWN_Z];                                   // world plan point of the yard origin (the coop spear's foot on the ground)
export const toLocal = p => [p[0] - YARD_O[0], p[1] - YARD_O[1], p[2] - YARD_O[2]];
export const COOP = { ridgeZ: 1.0, x0: -1.75, x1: 0.12, halfW: 0.62, eaveZ: 0.68, spear: [0, 0, 1.0], spearLen: 0.72 };
export const CAM_LOOP = { pos: toLocal(CAM0.pos), aim: toLocal(CAM0.aim), lens: CAM0.lens };
// layout (v2): the barn's east gable faces the camera of row 35 at x -12; the ladder leans on it; well and dovecote to the right; the house behind.
export const BARN = { cx: -15.6, cy: -12.0, w: 7.2, d: 4.6, wallH: 3.4, roofH: 2.4 };
export const HOUSE = { cx: -24.5, cy: -7.1, w: 5.4, d: 6.0, wallH: 3.7, roofH: 2.2 };
export const WELL = [-12.8, -8.0], DOVE = [-20.6, -4.6];
export const ROOFS = { barn: [BARN.cx + BARN.w / 2 - .15, BARN.cy, BARN.wallH + BARN.roofH], house: [HOUSE.cx, HOUSE.cy + .2, HOUSE.wallH + HOUSE.roofH],
  well: [WELL[0], WELL[1] - .8, 2.93], dovecote: [DOVE[0], DOVE[1], 5.32] };
// the ladder leans on the barn's east gable: foot in the earth, top on the wall under the barge board; RAIL_R = the screen-right rail (the Priest's fist)
export const LADDER = { foot: [BARN.cx + BARN.w / 2 + 2.05, BARN.cy + 1.12, 0], top: [BARN.cx + BARN.w / 2 + .06, BARN.cy + 1.12, 4.55], W: .44 };
export const ladderRail = z => { const { foot: a, top: b } = LADDER, u = z / b[2]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + LADDER.W / 2, z]; };

export async function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, pl = ctx.place || {}, V = (x, y, z) => B2T([x, y, z]), O3 = V(0, 0, 0), D3 = (x, y, z) => V(x, y, z).sub(O3);
  // ---------- the shared world, shifted so the yard is at the origin ----------
  // v2 VISUAL UPGRADE 2026-11-15 (kit3d): real iron for every spear (hero_props.js), relief on every surface, kit clouds (rose dawn banks; the purple storm wall
  // for the loop), kit trees, the struck angel, rain specks in the last rest. Clouds a tower_top build makes are caught here and fade in with the loop.
  const HP = await import('./hero_props.js'), K3 = !!(ctx.pbr && ctx.pbr.on), towerClouds = [];
  const before = new Set(scene.children);
  const skyT = ctx.sky ? Object.assign({}, ctx.sky, { clouds: o => { const g = ctx.sky.clouds({ ...(o || {}), dome: false }); towerClouds.push(g); return g; } }) : ctx.sky;
  await buildTowerWorld(THREE, scene, film, { ...ctx, sky: skyT, place: {} });
  const off = V(YARD_O[0], YARD_O[1], YARD_O[2]); let stormDome = null;
  for (const o of scene.children) { if (before.has(o) || towerClouds.includes(o)) continue; if (o.name === 'sky_storm_dome') { o.visible = false; stormDome = o; o.renderOrder = -49; continue; } o.position.sub(off); o.updateMatrixWorld(true); }
  scene.traverse(o => { if (o.name === 'rival_gold_angel' || o.name === 'rival_spire' || o.name === 'spear_fist' || o.name === 'spear_fist_fill' || o.name === 'spear_lightning_rod' || o.name === 'spear_tip_glint') o.visible = false; });
  // THE HERO SPEAR (hero_props, forged leaf blade, collars, stays, the eye; the cold glint): stands where tower_top's spear stood
  const bigSpear = HP.buildSpear(THREE, ctx, { glintSize: .3 }); bigSpear.group.name = 'yard_hero_spear'; bigSpear.group.position.copy(V(...toLocal([SPEAR.x, SPEAR.y, SPEAR.base]))); scene.add(bigSpear.group); bigSpear.setGlint(1, .3);
  const fogDawn = new THREE.Color('#e6bcd0'), fogStorm = scene.fog ? scene.fog.color.clone() : new THREE.Color('#b98fc8'); scene.fog = new THREE.Fog(fogDawn.clone(), 120, 700);

  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, rr = (a, b) => a + (b - a) * rnd();
  const add = (geo, mat, name, role, p, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = role; if (p) m.position.copy(p); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const bar = (a, b, r, mat, name, role = 'metal', r2 = r, segs = 8) => { const A = V(...a), Bv = V(...b), d = Bv.clone().sub(A), L = Math.max(d.length(), 1e-4), m = add(new THREE.CylinderGeometry(r2, r, L, segs), mat, name, role, A.clone().addScaledVector(d, .5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return m; };
  const box = (w, d, h, x, y, z, mat, name, role = 'plaster', yaw = 0) => { const m = add(new THREE.BoxGeometry(w, h, d), mat, name, role, V(x, y, z + h / 2)); m.rotation.y = yaw; return m; };
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
  const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
  const blot = (g, x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const softTex = tex(64, 64, (g) => blot(g, 32, 32, 32, 'rgba(255,255,255,A)', 1));
  const RL = (kind, c, o = {}) => ctx.relief ? ctx.relief(kind, c, o) : toon(c), MT = (kind, o = {}) => ctx.pbr ? ctx.pbr.metal(kind, o) : toon(o.toon || o.color || '#3c4470');
  const M = { tile: RL('tile', '#e8632c', { scale: 1.2 }), tileDk: RL('tile', '#b8431c', { scale: 1.2 }), wood: RL('wood', '#b97a3e', { scale: 1.2 }), woodDk: RL('wood', '#7a4a26', { scale: 1.2 }), woodLt: RL('wood', '#d49a52', { scale: 1.2 }), stone: RL('stone', '#d9d3e6', { scale: .9 }), stoneDk: RL('stone', '#a9a0c4', { scale: .9 }),
    iron: MT('iron', { seed: 3, toon: '#3c4470' }), ironDk: MT('iron', { color: '#4d5670', rough: .32, rust: .25, seed: 7, toon: '#252a4a' }), glint: MT('steel', { color: '#d4e2f2', rough: .14, nscale: .15, seed: 5, toon: '#ffd9c0' }), rim: basic('#e4eeff'), shut: RL('wood', '#2f8a5a', { scale: .8 }), shutDk: RL('wood', '#1f6a40', { scale: .8 }), door: RL('wood', '#6a3f2a', { scale: 1 }), earthDk: RL('mud', '#9a6644', { scale: 1 }), grass: toon('#7fb845'), grassDk: toon('#4f9a3a'),
    straw: toon('#f2cf5a'), strawDk: toon('#d9a83a'), white: toon('#fbf6ee'), dove: toon('#e9e6f2'), doveDk: toon('#9d98b8'), beak: toon('#f08a4a'), char: basic('#2a2230'), hole: basic('#3a2234'), cyp: toon('#1f6a44'), cypLt: toon('#2f8a52'),
    blade: MT('iron', { color: '#5a6484', rough: .18, seed: 9, toon: '#2b3052' }), terra: RL('plaster', '#d9693a', { scale: .6 }), red: toon('#d8342c'), cloth: toon('#f4efe2'), clothB: toon('#6aa0d8'), clothR: toon('#e0708a'), copper: MT('brass', { color: '#d88a4a', seed: 4, toon: '#d07a3a' }), cabbage: toon('#8cc85a'), rope: toon('#e2c27a'), sack: toon('#e3c999'), lamp: basic('#ffd27a') };
  const contact = (x, y, rx, ry = rx, op = .45) => { const m = add(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ map: softTex, color: '#3a1e2a', transparent: true, opacity: op, depthWrite: false }), 'contact_shadow', 'fx', V(x, y, .03)); m.rotation.x = -Math.PI / 2; m.scale.set(rx, ry, 1); m.castShadow = m.receiveShadow = false; m.renderOrder = 1; return m; };
  const tips = [];

  // ---------- PAINTED TEXTURES (canvas, drawn once) ----------
  const plasterTex = (base, dk, lt) => tex(512, 512, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) blot(g, rr(0, W), rr(0, H), rr(20, 90), rnd() < .5 ? dk : lt, rr(.10, .25));                                    // weather blotches
    for (let i = 0; i < 7; i++) { const x = rr(30, W - 60), y = rr(60, H - 120), w = rr(40, 90), h = rr(24, 50); g.fillStyle = 'rgba(176,96,70,.55)'; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, rr(-.3, .3), 0, 7); g.fill();   // worn patches: brick shows
      g.strokeStyle = 'rgba(120,60,50,.5)'; g.lineWidth = 1.5; for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(x - w / 2.4, y - h / 3 + r * h / 4.5); g.lineTo(x + w / 2.4, y - h / 3 + r * h / 4.5); g.stroke(); } }
    g.strokeStyle = 'rgba(90,60,70,.55)'; g.lineWidth = 1.6; for (let i = 0; i < 5; i++) { let x = rr(0, W), y = rr(0, H * .5); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += rr(-14, 14); y += rr(8, 20); g.lineTo(x, y); } g.stroke(); }   // cracks
    const gr = g.createLinearGradient(0, H * .82, 0, H); gr.addColorStop(0, 'rgba(120,80,70,0)'); gr.addColorStop(1, 'rgba(120,80,70,.5)'); g.fillStyle = gr; g.fillRect(0, H * .8, W, H * .2); });   // rain splash at the foot
  const plankTex = (base, dk) => tex(512, 512, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H); const n = 14, bw = W / n;
    for (let i = 0; i < n; i++) { const x = i * bw; g.fillStyle = `rgba(${rnd() < .5 ? '255,220,170' : '80,40,20'},${rr(.05, .18)})`; g.fillRect(x, 0, bw, H);
      g.strokeStyle = 'rgba(70,35,20,.35)'; g.lineWidth = 1.2; for (let k = 0; k < 5; k++) { const gx = x + rr(4, bw - 4); g.beginPath(); g.moveTo(gx, 0); for (let y = 0; y <= H; y += 32) g.lineTo(gx + Math.sin(y * .02 + k) * 3, y); g.stroke(); }   // grain
      if (rnd() < .6) { const ky = rr(40, H - 40); g.fillStyle = 'rgba(70,35,20,.5)'; g.beginPath(); g.ellipse(x + bw / 2, ky, 5, 9, 0, 0, 7); g.fill(); }                                  // knots
      g.fillStyle = dk; g.fillRect(x, 0, 3, H); g.fillStyle = 'rgba(60,40,40,.85)'; g.fillRect(x + bw * .5 - 2, H * .12, 4, 4); g.fillRect(x + bw * .5 - 2, H * .86, 4, 4); }               // gaps + nail heads
    const gr = g.createLinearGradient(0, H * .75, 0, H); gr.addColorStop(0, 'rgba(60,30,30,0)'); gr.addColorStop(1, 'rgba(60,30,30,.55)'); g.fillStyle = gr; g.fillRect(0, H * .75, W, H * .25); });
  const courseTex = (base, rows = 6, cols = 5) => tex(512, 512, (g, W, H) => { g.fillStyle = '#8f86a8'; g.fillRect(0, 0, W, H); const rh = H / rows;
    for (let r = 0; r < rows; r++) { let x = r % 2 ? -W / cols / 2 : 0; while (x < W) { const w = W / cols * rr(.7, 1.3), c = rr(-18, 18); g.fillStyle = `rgb(${200 + c},${193 + c},${222 + c})`;
      g.beginPath(); g.roundRect ? g.roundRect(x + 3, r * rh + 3, w - 6, rh - 6, 8) : g.rect(x + 3, r * rh + 3, w - 6, rh - 6); g.fill(); blot(g, x + w * .3, r * rh + rh * .3, w * .3, 'rgba(255,255,255,A)', .25); if (rnd() < .3) blot(g, x + w * .6, r * rh + rh * .7, w * .25, 'rgba(110,140,90,A)', .35); x += w; } } });
  const T = { house: plasterTex('#f6c84a', 'rgba(200,120,60,A)', 'rgba(255,240,190,A)'), cream: plasterTex('#f4dca0', 'rgba(190,130,90,A)', 'rgba(255,250,220,A)'),
    barn: plankTex('#b0502e', '#4a2018'), coop: plankTex('#c08048', '#5a3018'), course: courseTex(), courseS: courseTex('#ccc', 4, 9) };
  // v2: every painted surface is now kit relief (normal map + cavity colour at a texel scale that reads on a phone); the painted maps stay only for kit3d off
  const RS = { house: ['plaster', '#f6c84a', 2.2], cream: ['plaster', '#f4dca0', 1.6], barn: ['wood', '#b0502e', 1.6], coop: ['wood', '#c08048', .9], course: ['stone', '#d9d3e6', 1.5], courseS: ['stone', '#c9c3d8', 1.1] };
  const relKey = new Map(Object.entries(T).map(([k, v]) => [v, k]));
  // FINAL PASS (lead: "the barn planks read like bricks"; the kit wood = short staggered boards): the barn gets its OWN relief of LONG VERTICAL boards,
  // full height (one 2.4 m repeat, no butt joints), 0.16-0.30 m wide, dark 12 mm gaps, grain along the board, a knot now and then, two nail rows on the
  // hidden rails (0.2 m and 1.4 m), per-board tone. Same toon look as the kit relief (3 blended steps, cavity darkening); the kit box-UVs it via userData.k3scale.
  const vPlankMat = (() => { let cache = null; return (side) => { if (!cache) { const N = 512, Hh = new Float32Array(N * N), C = new Uint8ClampedArray(N * N * 4), base = new THREE.Color('#cc6636'), jn = [.16, .08, .05];
      const R2 = (() => { let s = 911; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(), edges = [0]; while (edges[edges.length - 1] < 1) edges.push(edges[edges.length - 1] + (.16 + R2() * .14) / 2.4); edges[edges.length - 1] = 1;
      const nB = edges.length - 1, tone = [...Array(nB)].map(() => .86 + R2() * .3), knot = [...Array(nB)].map(() => R2() < .45 ? [.25 + R2() * .5, R2()] : null), ph = [...Array(nB)].map(() => R2() * 50);
      const vn1 = (x) => { const i = Math.floor(x), f = x - i, a = Math.abs(Math.sin(i * 127.1) * 43758.5 % 1), b = Math.abs(Math.sin((i + 1) * 127.1) * 43758.5 % 1); return a + (b - a) * f * f * (3 - 2 * f); };
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, v = y / N; let b = 0; while (b < nB - 1 && u >= edges[b + 1]) b++;
        const bw = edges[b + 1] - edges[b], fu = (u - edges[b]) / bw, eM = Math.min(u - edges[b], edges[b + 1] - u) * 2.4;   // metres to the gap
        const gap = eM < .006 ? 1 : 0, bev = Math.min(1, Math.max(0, (eM - .006) / .012));
        const gr = .5 + .5 * Math.sin((fu * 7 + vn1(v * 9 + ph[b]) * 1.6 + Math.sin(v * 31 + ph[b]) * .15) * Math.PI * 2), fine = vn1(fu * 60 + v * 3 + ph[b] * 3);
        let kn = 0; if (knot[b]) { const dx = (fu - .3 - knot[b][1] * .4) * bw * 2.4, dy = (v - knot[b][0]) * 2.4; kn = Math.exp(-(dx * dx / .0009 + dy * dy / .0025)); }
        let nail = 0; for (const nz of [.2 / 2.4, 1.4 / 2.4]) for (const nu of [.25, .75]) { const dx = (fu - nu) * bw * 2.4, dy = (v - nz) * 2.4, d2 = dx * dx + dy * dy; if (d2 < .00012) nail = Math.max(nail, 1 - d2 / .00012); }
        const h = gap ? 0 : bev * (.9 + .025 * gr + .02 * fine) - kn * .08 + nail * .12, i = y * N + x; Hh[i] = h;
        const k = gap ? 0 : tone[b] * (.86 + .2 * gr + .08 * fine) - kn * .35, ao = .7 + .3 * Math.min(1, Math.max(0, h));
        const col = nail > .2 ? [.22, .2, .24] : gap ? jn : [base.r * k, base.g * k, base.b * k]; for (let c = 0; c < 3; c++) C[i * 4 + c] = 255 * Math.min(1, Math.max(0, col[c] * ao)); C[i * 4 + 3] = 255; }
      const NB = new Uint8ClampedArray(N * N * 4), w = (a) => ((a % N) + N) % N, str = 3.5; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let nx = (Hh[y * N + w(x - 1)] - Hh[y * N + w(x + 1)]) * str, ny = (Hh[w(y + 1) * N + x] - Hh[w(y - 1) * N + x]) * str; const q = 1 / Math.sqrt(nx * nx + ny * ny + 1), i = (y * N + x) * 4; NB[i] = (nx * q * .5 + .5) * 255; NB[i + 1] = (ny * q * .5 + .5) * 255; NB[i + 2] = (q * .5 + .5) * 255; NB[i + 3] = 255; }
      const dt = (B, srgb) => { const t = new THREE.DataTexture(B, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
      const gd = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); gd.minFilter = gd.magFilter = THREE.LinearFilter; gd.needsUpdate = true;
      cache = { map: dt(C, true), normal: dt(NB, false), gd }; }
    const m = new THREE.MeshToonMaterial({ color: '#ffffff', map: cache.map, normalMap: cache.normal, gradientMap: cache.gd }); m.userData.k3scale = 2.4; m.userData.k3kind = 'wood'; if (side) m.side = side; return m; }; })();
  const mapM = (t, rep, o = {}) => { const k = relKey.get(t); if (ctx.relief && ctx.relief.on && k === 'barn') return vPlankMat(o.side);
    if (ctx.relief && ctx.relief.on && k) { const r = RS[k], m = ctx.relief(r[0], r[1], { scale: r[2], seed: 3 }); if (o.side) m.side = o.side; return m; }
    const tt = t.clone(); tt.needsUpdate = true; tt.repeat.set(rep[0], rep[1]); return toon('#ffffff', { map: tt, ...o }); };

  // ---------- dawn sky: rose horizon, washed blue; north (behind the tower) the purple storm wall; uK fades it to the storm sky of frame 0 ----------
  // FP1 2026-11-15: uS = the kit dusk-storm RISING through the dawn dome (north first, behind the tower; fills the sky by film 2100). The dawn dome
  // is cut away where the storm is (alpha 0), so the opaque kit storm dome below shows with its own cores and lit rims; a rose-lit rim on the dawn side.
  const skyU = { uA: { value: 1 }, uS: { value: 0 } };
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, transparent: true, uniforms: skyU,
    vertexShader: 'varying vec3 vD; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vD = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uA; uniform float uS; varying vec3 vD;
      float fbm(vec2 q){ float cl = 0., a = .5; for (int i = 0; i < 5; i++) { cl += a * (.5 + .5 * sin(q.x * 1.7 + sin(q.y * 2.3) * 1.6) * sin(q.y * 1.3 + q.x * .45 + 1.3)); q = q * 2.03 + vec2(1.7, 4.1); a *= .5; } return cl; }
      void main(){ float L = max(length(vD), 1e-3); vec3 d = vD / L; float h = d.y; float hl = sqrt(max(d.x * d.x + d.z * d.z, 1e-6)); vec2 e = vec2(d.x, -d.z) / hl;
        float north = smoothstep(.25, .9, e.y), east = smoothstep(-.2, 1., e.x);
        vec3 hor = mix(vec3(1., .70, .66), vec3(1., .80, .52), east), mid = vec3(.52, .76, .97), top = vec3(.30, .58, .93);
        vec3 c = mix(hor, mid, smoothstep(0., .22, h)); c = mix(c, top, smoothstep(.2, .8, h));
        vec2 p = vec2(atan(d.x, max(-d.z, 1e-3)) * 3.4, max(h, 0.) * 7.5); float cl = fbm(p + vec2(0., .6 * fbm(p * .6)));
        c = mix(c, vec3(1., .78, .80), smoothstep(.62, .74, cl) * (1. - smoothstep(.05, .4, h)) * .7 * (1. - north));
        float edge = .19 + .14 * (1. - north) + .03 * sin(e.x * 9.) + .02 * sin(e.x * 23. + 1.);
        float wall = smoothstep(edge, edge + .09, h) * max(north, smoothstep(.55, .9, h));
        vec3 dk = vec3(.22, .11, .46), md = vec3(.40, .22, .70), hi = vec3(.62, .40, .88), warm = vec3(.98, .56, .62);
        vec3 w = mix(dk, md, smoothstep(.44, .58, cl)); w = mix(w, hi, smoothstep(.6, .7, cl));
        w = mix(w, warm, smoothstep(.56, .72, cl) * (1. - smoothstep(.1, .5, h)) * .6);
        c = mix(c, w, wall);
        if (h < 0.) c = mix(vec3(.80, .66, .78), hor, smoothstep(-.05, 0., h));
        float sm = 0.;
        if (uS > 0.) { float sn = .5 * (e.y + 1.), v = sn - .9 * max(h, 0.) + .16 * (cl - .5) + .05 * sin(e.x * 14. + 2.) * (1. - sn);
          float thr = 1. - 2.05 * uS; sm = smoothstep(thr, thr + .05, v);
          float rim = smoothstep(thr - .07, thr, v) * (1. - sm); c = mix(c, vec3(1., .66, .70), rim * .55); }
        c = pow(max(c, vec3(0.)), vec3(2.2));
        gl_FragColor = vec4(c, uA * (1. - sm)); }` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(555, 48, 24), skyMat); sky.name = 'sky_dawn_dome'; sky.userData.noExport = true; sky.renderOrder = -50; sky.frustumCulled = false; sky.userData.k3env = true; scene.add(sky);
  // v2 KIT CLOUDS: lit rose-and-gold dawn banks west, south and east; the purple storm wall in the north (behind the tower) with rose-lit edges;
  // the full frame-0 storm (dusk-storm, all round and higher, the camera is 33 m up at the end) fades in with the loop. Plan north = three -Z = arc 270 deg.
  const cloudOps = (g, v) => g.traverse(o => { if (o.material && o.material.uniforms && o.material.uniforms.op) o.material.uniforms.op.value = v; });
  const dawnClouds = ctx.sky && ctx.sky.on ? ctx.sky.clouds({ kind: 'clear-day', dome: false, seed: 21, arc: [20, 235], minEl: 2, maxEl: 22, coverage: 1.5, scale: 1.15,
      colors: { lit: '#fff1dc', shade: '#c98fb4', rim: '#ffd79a', hor: '#ffc4b4' } }) : null;
  const northWall = ctx.sky && ctx.sky.on ? ctx.sky.clouds({ kind: 'dusk-storm', dome: false, seed: 5, arc: [228, 318], minEl: 4, maxEl: 30, coverage: 1.4,
      colors: { lit: '#ff9fb0', shade: '#3a2460', rim: '#ffc9a0', hor: '#d79ab4' } }) : null;
  const endStorm = ctx.sky && ctx.sky.on ? ctx.sky.clouds({ kind: 'dusk-storm', dome: false, seed: 11, arc: [190, 350], minEl: 0, maxEl: 34, base: 26, coverage: 1.0, scale: 1.9,
      colors: { lit: '#d68ad0', shade: '#55308c', rim: '#ffd0b0', hor: '#c27a9a' } }) : null;   // frame 0's purple storm wall: violet bodies, magenta-lit tops, peach rims (LOOK_BIBLE A)
  if (endStorm) { cloudOps(endStorm, 0); endStorm.visible = false; }
  // FINAL PASS: the ending's storm wall = the NEW kit dusk-storm, painted per pixel on the kit dome (the film's hidden 400 m dome), as frame 0 (S1) uses.
  // Key light = S1's tower_top dir (burnt-orange foot and lit rims on the same side as frame 0). Hidden until the loop; opaque, no depth write, so the
  // dawn dome (transparent, alpha 1 - loop) draws over it and fades away. place.end_sky: "tower" = the v2 way (S1's own dome + sprite clouds).
  const kitEnd = !!(ctx.sky && ctx.sky.on) && pl.end_sky !== 'tower';
  let endDome = null; if (kitEnd) { const g = ctx.sky.clouds({ kind: 'dusk-storm', seed: pl.end_sky_seed ?? 23, sunDir: pl.end_sun || [-7, 3.0, 7.5] }); scene.add(g);
    endDome = scene.children.find(o => o.isMesh && o.userData.noExport && o.geometry && o.geometry.parameters && o.geometry.parameters.radius === 400 && o.material && o.material.isShaderMaterial) || g.children.find(o => o.isMesh);
    if (endDome) { endDome.visible = false; endDome.renderOrder = -60; endDome.name = 'sky_end_kit_dusk_storm'; } }
  // a far, quiet flash in the storm wall behind the spear (end rest), so the loop runs into frame 0's live storm: kit bolt far + the cloud lit from inside
  const endBoltF = pl.end_bolt_f ?? 228, endBoltTo = (() => { const t = toLocal([SPEAR.x, SPEAR.y, SPEAR.tip]); return V(t[0] - 85, t[1] + 390, 0); })(), endBoltFrom = endBoltTo.clone().add(D3(8, -15, 165));
  const endBolt = kitEnd && ctx.fx && ctx.fx.bolt ? ctx.fx.bolt({ far: true, from: endBoltFrom, to: endBoltTo, frame: endBoltF, leader: 2, restrikes: 1, seed: 17, light: .45, lift: .06, glowK: .22, width: .5 }) : null;

  // ---------- an iron spear on a roof with ITS OWN thin wire to the ground ----------
  // v2: the spear itself is hero_props' small spear (forged leaf blade, socket, collars, foot plate with bolts, stays; real iron); a pale sky rim along the shaft
  // so it reads on a phone against plaster and tiles; the cold glint sprite (setGlint) catches the dawn in turn. Its own thin wire stays this set's route.
  const smallSpears = [];
  const spearOn = (name, foot, len, route, r = .022) => { const [x, y, z] = foot;
    const sp = HP.buildSpear(THREE, ctx, { small: true, length: len, radius: r * 1.15, glintSize: Math.max(.16, len * .32), name: name + '_spear' }); sp.group.position.copy(V(x, y, z)); scene.add(sp.group); if (sp.glint) sp.glint.userData.s0 = sp.glint.scale.x; smallSpears.push(sp);
    bar([x - r * .75, y - r * 1.05, z + .08], [x - r * .75, y - r * 1.05, z + len * .8], r * .22, M.rim, name + '_spear_sky_rim', 'metal', r * .2, 5).castShadow = false;
    const pts = [[x + r, y - r, z + .04], ...route].map(p => V(...p));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .05), 48, Math.max(.011, r * .5), 6), M.ironDk, name + '_own_wire', 'metal', null);
    for (let i = 1; i < route.length; i++) { const a = route[i - 1], b = route[i], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / .9));
      for (let k = 1; k <= n; k++) { const u = (k - .5) / n; add(new THREE.TorusGeometry(r * 1.3, r * .35, 5, 8, Math.PI), M.glint, name + '_wire_staple', 'metal', V(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u)); } }
    const g = route[route.length - 1]; add(new THREE.SphereGeometry(r * 7, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.earthDk, name + '_wire_earth_mound', 'ground', V(g[0], g[1], 0));
    tips.push(V(x, y, z + len)); };

  // ---------- BARREL-TILE ROOF on any slope: instanced coppi, colour per tile, wet sheen near the ridge ----------
  const tileGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true, 0, Math.PI); tileGeo.translate(0, 0, 0);
  const tileMat = K3 ? Object.assign(RL('plaster', '#ffffff', { scale: .5, normal: 1.4, seed: 9 }), { side: THREE.DoubleSide }) : toon('#ffffff', { side: THREE.DoubleSide }), tileCols = ['#e8632c', '#f07a3a', '#d8552a', '#ff8a4a', '#c94a22', '#e86a36', '#b8431c', '#f29050'];
  const slope = (name, R0, E0, along, colW, tileR = .1) => {         // R0 = ridge start point, E0 = eave point below R0, along = vector along the ridge (its length = ridge length), all plan
    const s = [E0[0] - R0[0], E0[1] - R0[1], E0[2] - R0[2]], sl = Math.hypot(...s), al = Math.hypot(...along), sd = s.map(v => v / sl), ad = along.map(v => v / al);
    let n = [ad[1] * sd[2] - ad[2] * sd[1], ad[2] * sd[0] - ad[0] * sd[2], ad[0] * sd[1] - ad[1] * sd[0]]; if (n[2] < 0) n = n.map(v => -v);
    const cols = Math.max(2, Math.round(al / colW)), rows = Math.max(2, Math.round(sl / .36)), cnt = cols * rows, im = new THREE.InstancedMesh(tileGeo, tileMat, cnt); im.name = name + '_barrel_tiles'; im.userData.role = 'roof'; im.castShadow = im.receiveShadow = true;
    const Xn = D3(...n).normalize(), Ys = D3(...sd).normalize(), Zc = new THREE.Vector3().crossVectors(Xn, Ys).normalize(), basis = new THREE.Matrix4().makeBasis(Xn, Ys, Zc), m4 = new THREE.Matrix4(), sc = new THREE.Matrix4(), col = new THREE.Color();
    let k = 0; for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const u = (c + .5) / cols, v = (r + .5) / rows, p = [0, 1, 2].map(i => R0[i] + along[i] * u + s[i] * v + n[i] * .03);
      sc.makeScale(tileR * rr(.92, 1.05), sl / rows * 1.12, tileR); m4.copy(basis).multiply(sc); m4.setPosition(V(...p)); im.setMatrixAt(k, m4);
      const wet = v < .35 && rnd() < .5; col.set(tileCols[Math.floor(rnd() * tileCols.length)]); if (wet) col.lerp(new THREE.Color('#ffd2c4'), .45); if (rnd() < .05) col.set('#8a9a5a'); im.setColorAt(k, col); k++; }
    scene.add(im);
    const quad = new THREE.BufferGeometry(), P4 = [R0, [R0[0] + along[0], R0[1] + along[1], R0[2] + along[2]], [E0[0] + along[0], E0[1] + along[1], E0[2] + along[2]], E0].map(p => V(...p));
    quad.setFromPoints([P4[0], P4[1], P4[2], P4[0], P4[2], P4[3]]); quad.computeVertexNormals(); add(quad, Object.assign(RL('tile', '#7c3520', { scale: 1.2 }), { side: THREE.DoubleSide }), name + '_roof_bed', 'roof', null);
    for (let r = 1; r < rows; r++) { const v = r / rows, a = [0, 1, 2].map(i => R0[i] + s[i] * v + n[i] * .02), b = [0, 1, 2].map(i => a[i] + along[i]); bar(a, b, .018, M.tileDk, name + '_course_shadow', 'roof', .018, 4).castShadow = false; } };
  const gableBuilding = (name, o, wallMat, gableMat) => {                   // o: cx, cy, w (x), d (y), wallH, roofH, ax ('x' ridge along x | 'y')
    const { cx, cy, w, d, wallH: H, roofH: RH, ax } = o, ov = .4; box(w, d, H, cx, cy, 0, wallMat, name + '_walls');
    box(w + .14, d + .14, .5, cx, cy, 0, mapM(T.courseS, [3, .5]), name + '_plinth', 'stone');
    const across = ax === 'x' ? d : w, half = across / 2 + ov, along = ax === 'x' ? w + 2 * ov * .6 : d + 2 * ov * .6, eZ = H - ov * RH / (across / 2);
    const R0 = ax === 'x' ? [cx - along / 2, cy, H + RH] : [cx, cy - along / 2, H + RH], dirA = ax === 'x' ? [along, 0, 0] : [0, along, 0];
    for (const sg of [-1, 1]) { const E0 = ax === 'x' ? [R0[0], cy + sg * half, eZ] : [cx + sg * half, R0[1], eZ]; slope(name + (sg > 0 ? '_n' : '_s'), R0, E0, dirA, .26, ax === 'x' ? .1 : .1);
      const eaveA = E0, eaveB = [E0[0] + dirA[0], E0[1] + dirA[1], E0[2]]; bar([eaveA[0], eaveA[1], eaveA[2] - .08], [eaveB[0], eaveB[1], eaveB[2] - .08], .06, M.woodDk, name + '_fascia', 'wood', .06, 4);
      const nr = Math.round(along / .6); for (let i = 0; i <= nr; i++) { const u = i / nr, p = [eaveA[0] + dirA[0] * u, eaveA[1] + dirA[1] * u, eaveA[2] - .12], q = ax === 'x' ? [p[0], cy + sg * across / 2, H - .02] : [cx + sg * across / 2, p[1], H - .02]; bar(p, q, .05, M.woodDk, name + '_rafter_tail', 'wood', .05, 4); } }
    bar(R0, [R0[0] + dirA[0], R0[1] + dirA[1], R0[2]], .12, M.tile, name + '_ridge_cap', 'roof', .12, 8);
    for (const sg of [-1, 1]) {                                          // gable triangles in wall paint + barge boards
      const gx = ax === 'x' ? cx + sg * w / 2 : null, gy = ax === 'y' ? cy + sg * d / 2 : null, tri = new THREE.BufferGeometry();
      const P3 = ax === 'x' ? [[gx, cy - across / 2, H], [gx, cy + across / 2, H], [gx, cy, H + RH]] : [[cx - across / 2, gy, H], [cx + across / 2, gy, H], [cx, gy, H + RH]];
      tri.setFromPoints(P3.map(p => V(...p))); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, .5, .6], 2)); tri.computeVertexNormals(); add(tri, gableMat, name + '_gable', 'plaster', null);
      const ex = ax === 'x' ? [gx + sg * ov * .6, 0] : [0, gy + sg * ov * .6]; for (const t of [-1, 1]) { const a = ax === 'x' ? [ex[0], cy + t * half, eZ] : [cx + t * half, ex[1], eZ], b = ax === 'x' ? [ex[0], cy, H + RH + .05] : [cx, ex[1], H + RH + .05]; bar(a, b, .07, M.wood, name + '_barge_board', 'wood', .07, 4); } }
    contact(cx, cy, (w / 2 + .9), (d / 2 + .9), .35); };
  const sign = (text, w, h, p, yaw, col = '#f4ead2', ink = '#6a2a1a', role = 'sign') => { const t = tex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) blot(g, rr(0, W), rr(0, H), rr(10, 40), 'rgba(150,100,60,A)', rr(.05, .15));
      g.fillStyle = ink; g.font = `bold ${Math.round(H * .62)}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H * .54); g.strokeStyle = ink; g.lineWidth = Math.max(3, H * .05); g.strokeRect(H * .08, H * .08, W - H * .16, H - H * .16); });
    const m = add(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: t }), 'sign_' + text.toLowerCase(), role, V(...p)); m.rotation.y = yaw; m.castShadow = false; return m; };

  // ---------- the barn (planks on a coursed stone plinth, big doors with strap hinges, hay door, pulley beam) ----------
  { const B = BARN, ex = B.cx + B.w / 2; gableBuilding('barn', { ...B, ax: 'x' }, mapM(T.barn, [3, 1]), mapM(T.barn, [2, 1], { side: THREE.DoubleSide }));
    for (const s of [-1, 1]) { box(.08, 1.2, 2.6, ex + .04, B.cy + s * .62, 0, mapM(T.barn, [.4, 1]), 'barn_door_leaf', 'wood'); for (const zz of [.5, 2.1]) box(.05, .9, .07, ex + .1, B.cy + s * .42, zz, M.ironDk, 'barn_strap_hinge', 'metal');
      const br = box(.05, 1.5, .12, ex + .1, B.cy + s * .62, .65, M.wood, 'barn_door_brace', 'wood'); br.rotation.x = s * .95; }
    add(new THREE.TorusGeometry(.09, .022, 6, 12, Math.PI * 1.4), M.ironDk, 'barn_horseshoe', 'metal', V(ex + .1, B.cy, 2.85)).rotation.set(0, Math.PI / 2, -Math.PI * .2);
    box(.06, .9, .9, ex + .03, B.cy, 3.95, M.char, 'barn_hay_door', 'wood'); box(.4, 1.0, .25, ex + .12, B.cy, 3.8, M.straw, 'barn_hay_spill', 'straw');
    for (let i = 0; i < 14; i++) bar([ex + .15, B.cy + rr(-.45, .45), 3.85], [ex + .2 + rr(.05, .35), B.cy + rr(-.6, .6), 3.85 - rr(.1, .45)], .012, i % 2 ? M.straw : M.strawDk, 'barn_hay_wisp', 'straw', .01, 3);
    bar([ex - .3, B.cy - .2, 5.05], [ex + .9, B.cy - .2, 5.05], .07, M.woodDk, 'barn_pulley_beam', 'wood'); add(new THREE.TorusGeometry(.1, .03, 6, 12), M.wood, 'barn_pulley', 'wood', V(ex + .8, B.cy - .2, 4.92)).rotation.y = Math.PI / 2;
    bar([ex + .8, B.cy - .2, 4.85], [ex + .8, B.cy - .2, 3.1], .012, M.rope, 'barn_pulley_rope', 'rope', .012, 4); add(new THREE.TorusGeometry(.06, .015, 5, 10, Math.PI * 1.5), M.ironDk, 'barn_hook', 'metal', V(ex + .8, B.cy - .2, 3.05));
    sign('FIENILE', 1.5, .34, [ex + .07, B.cy, 3.05], Math.PI / 2, '#f0dfb0', '#5a2014');
    bar([ex + .05, B.cy - 2.0, 1.4], [ex + .1, B.cy - 2.6, 2.2], .02, M.woodLt, 'barn_scythe_snath', 'wood', .02, 5); { const bl = box(.02, .55, .06, ex + .14, B.cy - 2.45, 2.15, M.ironDk, 'barn_scythe_blade', 'metal'); bl.rotation.x = .5; }
    const [x, y, z] = ROOFS.barn; spearOn('barn', [x, y, z + .1], 1.5, [[x + .3, y - .9, z - .7], [x + .42, y - B.d / 2 - .45, B.wallH - .3], [x + .2, y - B.d / 2 - .1, B.wallH - .4], [x + .2, y - B.d / 2 - .1, .05]], .045); }
  // the ladder leaning on the barn gable (the Priest's fist steadies its screen-right rail): ash rails, pegged rungs, a cord binding, feet sunk in the mud
  { const { foot: a, top: b, W } = LADDER; for (const s of [-1, 1]) bar([a[0], a[1] + s * W / 2, -.05], [b[0], b[1] + s * W / 2, b[2]], .034, M.woodLt, 'ladder_rail', 'wood', .03, 8);
    const n = Math.round(b[2] / .3); for (let i = 1; i < n; i++) { const u = i / n, p = [a[0] + (b[0] - a[0]) * u, a[1], b[2] * u]; bar([p[0], p[1] - W / 2 - .03, p[2]], [p[0], p[1] + W / 2 + .03, p[2]], .02, M.woodDk, 'ladder_rung', 'wood', .02, 6); }
    { const u = .62; add(new THREE.CylinderGeometry(.042, .042, .1, 8), M.straw, 'ladder_cord_binding', 'rope', V(a[0] + (b[0] - a[0]) * u, a[1] - W / 2, b[2] * u)); }
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(.12, 8, 5, 0, 7, 0, Math.PI / 2), M.earthDk, 'ladder_foot_mud', 'ground', V(a[0], a[1] + s * W / 2, 0)).scale.set(1, .4, 1); contact(a[0], a[1], .5, .4, .5); }

  // ---------- the priest's house: yellow plaster with corner stones, string course, green shutters, the door with CANONICA over it, chimney with smoke ----------
  const smokeSrc = [];
  { const Hh = HOUSE, fx = Hh.cx + Hh.w / 2; gableBuilding('priest_house', { ...Hh, ax: 'y' }, mapM(T.house, [1, 1]), mapM(T.house, [1, .6], { side: THREE.DoubleSide }));
    for (const [qx, qy] of [[fx, Hh.cy - Hh.d / 2], [fx, Hh.cy + Hh.d / 2], [Hh.cx - Hh.w / 2, Hh.cy + Hh.d / 2]]) for (let i = 0; i < 9; i++) { const lg = i % 2 ? .32 : .5; box(.14 + (qx === fx ? lg - .14 : 0) * 0 + .14, lg, .36, qx, qy - Math.sign(qy - Hh.cy) * (lg / 2 - .06), .5 + i * .38, i % 2 ? M.stone : M.stoneDk, 'house_corner_stone', 'stone'); }
    box(Hh.w + .2, Hh.d + .2, .14, Hh.cx, Hh.cy, 2.0, M.stone, 'house_string_course', 'stone');
    for (const yy of [-1.6, 1.6]) for (const zz of [.85, 2.45]) { if (zz < 1 && yy > 0) continue; box(.06, .8, 1.05, fx + .02, Hh.cy + yy, zz, M.char, 'house_window', 'glass'); box(.12, 1.04, .1, fx + .05, Hh.cy + yy, zz + 1.05, M.stone, 'house_lintel', 'stone'); box(.2, 1.0, .08, fx + .08, Hh.cy + yy, zz - .08, M.stone, 'house_sill', 'stone');
      for (const s of [-1, 1]) { const sh = box(.06, .44, 1.05, fx + .06 + .2, Hh.cy + yy + s * .64, zz, M.shut, 'house_shutter', 'wood'); sh.rotation.y = s * .5; for (let k = 0; k < 6; k++) box(.07, .4, .03, fx + .1 + .2, Hh.cy + yy + s * .62, zz + .12 + k * .15, M.shutDk, 'house_shutter_slat', 'wood'); }
      if (zz > 2) for (const s of [-.25, .2]) { add(new THREE.CylinderGeometry(.11, .08, .18, 10), M.terra, 'house_flower_pot', 'pot', V(fx + .15, Hh.cy + yy + s, zz + .0)); for (let k = 0; k < 5; k++) add(new THREE.SphereGeometry(.05, 6, 4), k % 2 ? M.red : M.grassDk, 'geranium', 'foliage', V(fx + .15 + rr(-.06, .06), Hh.cy + yy + s + rr(-.08, .08), zz + .17 + rr(0, .1))); } }
    box(.08, 1.0, 1.95, fx + .04, Hh.cy + .1, .5, mapM(T.coop, [.3, 1]), 'house_door', 'wood'); box(.14, 1.3, .16, fx + .07, Hh.cy + .1, 2.45, M.stone, 'house_door_lintel', 'stone'); for (const s of [-1, 1]) box(.12, .14, 1.95, fx + .06, Hh.cy + .1 + s * .57, .5, M.stone, 'house_door_jamb', 'stone');
    box(.5, 1.4, .14, fx + .25, Hh.cy + .1, .36, M.stone, 'house_step', 'stone'); box(.7, 1.6, .14, fx + .35, Hh.cy + .1, .22, M.stoneDk, 'house_step2', 'stone'); box(.9, 1.8, .22, fx + .45, Hh.cy + .1, 0, M.stone, 'house_step3', 'stone');
    sign('CANONICA', 1.7, .34, [fx + .07, Hh.cy + .1, 2.82], Math.PI / 2, '#f7e9c4', '#3a3a7a');
    bar([fx + .02, Hh.cy - .7, 2.2], [fx + .4, Hh.cy - .7, 2.3], .02, M.ironDk, 'house_lantern_bracket', 'metal', .02, 5); add(new THREE.CylinderGeometry(.08, .1, .22, 6), M.ironDk, 'house_lantern', 'metal', V(fx + .4, Hh.cy - .7, 2.05)); add(new THREE.SphereGeometry(.05, 8, 6), M.lamp, 'house_lantern_flame', 'lamp', V(fx + .4, Hh.cy - .7, 2.04));
    const chx = Hh.cx - .9, chy = Hh.cy - 1.2; box(.62, .62, 1.7, chx, chy, Hh.wallH + 1.0, mapM(T.course, [.6, 1.2]), 'house_chimney', 'stone'); box(.78, .78, .12, chx, chy, Hh.wallH + 2.7, M.stoneDk, 'house_chimney_cap', 'stone'); box(.3, .3, .25, chx, chy, Hh.wallH + 2.82, M.terra, 'house_chimney_pot', 'roof');
    smokeSrc.push([chx, chy, Hh.wallH + 3.1]);
    const [x, y, z] = ROOFS.house; spearOn('house', [x, y, z + .1], 1.55, [[x + 1.0, y + .35, z - .8], [x + Hh.w / 2 + .45, y + .4, Hh.wallH - .25], [x + Hh.w / 2 + .06, y + .4, Hh.wallH - .3], [x + Hh.w / 2 + .06, y + .4, .05]], .045); }

  // ---------- the well: coursed stone ring, coping, two posts, windlass with the rope wound on it, the bucket hanging, a little tiled roof, its own spear ----------
  { const [wx, wy] = WELL; add(new THREE.CylinderGeometry(.82, .9, .9, 20, 1, true), mapM(T.course, [4, 1.6], { side: THREE.DoubleSide }), 'well_ring', 'stone', V(wx, wy, .45));
    add(new THREE.CylinderGeometry(.62, .62, .06, 18), M.char, 'well_dark_water', 'water', V(wx, wy, .7)); add(new THREE.CircleGeometry(.6, 18), basic('#b8a0d0'), 'well_water_glint', 'water', V(wx, wy, .735)).rotation.x = -Math.PI / 2;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, c = add(new THREE.BoxGeometry(.42, .14, .22), i % 2 ? M.stone : M.stoneDk, 'well_coping_stone', 'stone', V(wx + Math.cos(a) * .86, wy + Math.sin(a) * .86, .95)); c.rotation.y = -a; }
    for (const s of [-1, 1]) { bar([wx, wy + s * .86, .2], [wx, wy + s * .86, 2.38], .08, M.wood, 'well_post', 'wood', .07); box(.22, .22, .12, wx, wy + s * .86, 2.34, M.woodDk, 'well_post_cap', 'wood'); }
    bar([wx, wy - 1.0, 1.65], [wx, wy + 1.0, 1.65], .09, M.woodDk, 'well_windlass', 'wood'); for (let i = 0; i < 9; i++) add(new THREE.TorusGeometry(.105, .018, 5, 12), M.rope, 'well_rope_coil', 'rope', V(wx, wy - .32 + i * .07, 1.65)).rotation.x = Math.PI / 2;
    bar([wx, wy + 1.0, 1.65], [wx, wy + 1.12, 1.65], .03, M.iron, 'well_crank_arm0', 'metal'); bar([wx, wy + 1.12, 1.65], [wx + .32, wy + 1.12, 1.4], .025, M.iron, 'well_crank', 'metal'); bar([wx + .32, wy + 1.12, 1.4], [wx + .32, wy + 1.28, 1.4], .035, M.wood, 'well_crank_grip', 'wood');
    bar([wx, wy + .15, 1.55], [wx, wy + .15, 1.12], .014, M.rope, 'well_rope', 'rope', .014, 5);
    { const bk = new THREE.Group(); bk.name = 'well_bucket'; bk.position.copy(V(wx, wy + .15, .98)); scene.add(bk); const b0 = add(new THREE.CylinderGeometry(.17, .13, .28, 12), mapM(T.coop, [1.5, .5]), 'well_bucket_staves', 'wood', null, bk);
      for (const yy of [-.08, .08]) add(new THREE.TorusGeometry(.16 - yy * .2, .012, 5, 14), M.ironDk, 'well_bucket_hoop', 'metal', new THREE.Vector3(0, yy, 0), bk).rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(.17, .01, 5, 12, Math.PI), M.ironDk, 'well_bucket_bail', 'metal', new THREE.Vector3(0, .14, 0), bk); add(new THREE.CircleGeometry(.15, 12), basic('#c8b0e0'), 'well_bucket_water', 'water', new THREE.Vector3(0, .12, 0), bk).rotation.x = -Math.PI / 2; }
    { const b2 = add(new THREE.CylinderGeometry(.16, .12, .26, 12), mapM(T.coop, [1.5, .5]), 'well_pail_on_rim', 'wood', V(wx + .55, wy - .55, 1.15)); for (const yy of [-.07, .07]) add(new THREE.TorusGeometry(.15 - yy * .2, .011, 5, 14), M.ironDk, 'well_pail_hoop', 'metal', V(wx + .55, wy - .55, 1.15 + yy)).rotation.x = Math.PI / 2; }
    slope('well_roof_e', [wx - .1, wy - 1.2, 2.95], [wx + .78, wy - 1.2, 2.3], [0, 2.4, 0], .22, .07); slope('well_roof_w', [wx + .1, wy - 1.2, 2.95], [wx - .78, wy - 1.2, 2.3], [0, 2.4, 0], .22, .07);
    bar([wx, wy - 1.22, 2.98], [wx, wy + 1.22, 2.98], .08, M.tile, 'well_ridge_cap', 'roof', .08, 8); contact(wx, wy, 1.25, 1.25, .5);
    spearOn('well', [wx, wy - .8, 3.0], 1.1, [[wx + .1, wy - .82, 2.4], [wx + .1, wy - .9, .05]], .035); }

  // ---------- the dovecote: coursed stone foot, plastered loft, real pigeon holes with landing ledges, doves, pyramid tile roof, its spear ----------
  const doves = [];
  const dove = (p, yaw, sc = 1) => { const g = new THREE.Group(); g.name = 'dove'; g.position.copy(V(...p)); g.rotation.y = yaw; g.scale.setScalar(sc); scene.add(g);
    const b = add(new THREE.SphereGeometry(.09, 10, 8), M.dove, 'dove_body', 'bird', new THREE.Vector3(0, .06, 0), g); b.scale.set(1.5, 1, 1);
    const h = add(new THREE.SphereGeometry(.055, 10, 8), M.dove, 'dove_head', 'bird', new THREE.Vector3(.12, .15, 0), g); add(new THREE.ConeGeometry(.018, .05, 6), M.beak, 'dove_beak', 'bird', new THREE.Vector3(.18, .15, 0), g).rotation.z = -Math.PI / 2;
    add(new THREE.SphereGeometry(.012, 6, 4), M.char, 'dove_eye', 'bird', new THREE.Vector3(.15, .17, .035), g); add(new THREE.SphereGeometry(.012, 6, 4), M.char, 'dove_eye', 'bird', new THREE.Vector3(.15, .17, -.035), g);
    const t = add(new THREE.BoxGeometry(.14, .02, .08), M.doveDk, 'dove_tail', 'bird', new THREE.Vector3(-.16, .07, 0), g); t.rotation.z = .3;
    const wL = add(new THREE.SphereGeometry(.07, 8, 6), M.doveDk, 'dove_wing', 'bird', new THREE.Vector3(-.02, .08, .06), g), wR = add(new THREE.SphereGeometry(.07, 8, 6), M.doveDk, 'dove_wing', 'bird', new THREE.Vector3(-.02, .08, -.06), g); wL.scale.set(1.4, .5, .5); wR.scale.set(1.4, .5, .5);
    g.userData = { h, wL, wR, p0: g.position.clone(), ph: rnd() * 6 }; doves.push(g); return g; };
  { const [x, y] = DOVE; box(1.6, 1.6, 2.7, x, y, 0, mapM(T.course, [1, 1.6]), 'dovecote_foot', 'stone'); box(1.85, 1.85, .14, x, y, 2.7, M.stoneDk, 'dovecote_ledge', 'stone');
    box(1.55, 1.55, 1.7, x, y, 2.84, mapM(T.cream, [.8, .8]), 'dovecote_loft'); box(1.75, 1.75, .1, x, y, 4.5, M.stoneDk, 'dovecote_cornice', 'stone');
    for (const [fx, fy, yaw] of [[x + .78, y, 0], [x, y - .78, -Math.PI / 2]]) for (const r of [0, 1]) for (const c of [-1, 0, 1]) { const ox = yaw ? c * .44 : 0, oy = yaw ? 0 : c * .44;
      const hx = fx + ox, hy = fy + oy, zz = 3.15 + r * .66; const ar = add(new THREE.CircleGeometry(.13, 14, 0, Math.PI), M.hole, 'dovecote_hole_arch', 'wood', V(hx + (yaw ? 0 : .015), hy - (yaw ? .015 : 0), zz + .1)); ar.rotation.y = yaw + Math.PI / 2;
      const sq = add(new THREE.PlaneGeometry(.26, .2), M.hole, 'dovecote_hole', 'wood', V(hx + (yaw ? 0 : .015), hy - (yaw ? .015 : 0), zz)); sq.rotation.y = yaw + Math.PI / 2;
      box(yaw ? .34 : .2, yaw ? .2 : .34, .04, hx + (yaw ? 0 : .1), hy - (yaw ? .1 : 0), zz - .13, M.wood, 'dovecote_landing_ledge', 'wood');
      if ((r + c + (yaw ? 1 : 0)) % 3 === 0) dove([hx + (yaw ? 0 : .14), hy - (yaw ? .14 : 0), zz - .11], yaw ? -Math.PI / 2 + rr(-.6, .6) : rr(-.6, .6), .9); }
    box(.08, .7, 1.4, x + .82, y + .4, .1, M.door, 'dovecote_door', 'wood'); for (const zz of [.4, 1.2]) box(.05, .4, .06, x + .87, y + .4, zz, M.ironDk, 'dovecote_hinge', 'metal');
    { const rf = add(new THREE.ConeGeometry(1.48, .85, 4, 1), M.tile, 'dovecote_roof', 'roof', V(x, y, 4.98)); rf.rotation.y = Math.PI / 4; const t2 = tex(256, 256, (g, W, H) => { g.fillStyle = '#e8632c'; g.fillRect(0, 0, W, H); for (let i = 0; i < 32; i++) { g.fillStyle = i % 2 ? 'rgba(150,50,20,.55)' : 'rgba(255,170,110,.5)'; g.fillRect(i * W / 32, 0, W / 64, H); } for (let r = 0; r < 8; r++) { g.fillStyle = 'rgba(110,30,10,.6)'; g.fillRect(0, r * H / 8, W, 3); } }); rf.material = K3 ? RL('tile', '#e8632c', { scale: .9 }) : toon('#ffffff', { map: t2 }); }
    dove([x + .3, y - .3, 5.0], .5, .85); dove([x - .4, y + .1, 4.95], 2.6, .85); dove([x + .9, y + .5, 2.84], .2, .9);
    spearOn('dovecote', [x, y, 5.38], 1.3, [[x + .9, y - .3, 4.45], [x + .84, y - .3, 4.3], [x + .84, y - .3, .05]], .04); contact(x, y, 1.3, 1.3, .45); }
  const flyers = [0, 1, 2].map(i => { const g = dove([DOVE[0], DOVE[1], 7], 0, 1.0); g.userData.fly = { r: 3.2 + i * 1.3, h: 7 + i * .9, w: .045 + i * .012, ph: i * 2.1 }; return g; });

  // ---------- THE CHICKEN COOP with its tiny tiled roof (the last frame): plank box, hatch, ramp, straw, eggs, POLLAIO board ----------
  { const C = COOP, cx = (C.x0 + C.x1) / 2 - .02, len = C.x1 - C.x0 - .2;
    for (const [lx, ly] of [[C.x0 + .2, -.42], [C.x0 + .2, .42], [C.x1 - .24, -.42], [C.x1 - .24, .42]]) box(.08, .08, .3, lx, ly, 0, M.woodDk, 'coop_leg', 'wood');
    box(len, 1.0, .42, cx, 0, .27, mapM(T.coop, [1.2, .5]), 'coop_box', 'wood');
    box(.3, .03, .28, cx - .2, -.51, .29, M.char, 'coop_hatch', 'wood'); box(.36, .03, .05, cx - .2, -.52, .58, M.woodDk, 'coop_hatch_lintel', 'wood');
    { const rp = add(new THREE.BoxGeometry(.26, .03, .7), M.wood, 'coop_ramp', 'wood', V(cx - .2, -.82, .15)); rp.rotation.x = .42; for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.26, .025, .03), M.woodDk, 'coop_ramp_cleat', 'wood', V(cx - .2, -.6 - i * .15, .26 - i * .065)); }
    for (let i = 0; i < 16; i++) bar([cx - .2 + rr(-.18, .18), -.55 - rr(0, .25), .29], [cx - .2 + rr(-.3, .3), -.6 - rr(0, .35), .26 + rr(-.02, .02)], .006, i % 2 ? M.straw : M.strawDk, 'coop_straw_wisp', 'straw', .006, 3);
    for (const [ex2, ey] of [[cx + .5, -.72], [cx + .62, -.66], [cx + .55, -.6]]) add(new THREE.SphereGeometry(.045, 10, 8), M.white, 'coop_egg', 'egg', V(ex2, ey, .045)).scale.set(1, 1.3, 1);
    sign('POLLAIO', .62, .15, [cx + .18, -.515, .5], 0, '#f4e2b8', '#6a2a1a');
    slope('coop_roof_s', [C.x0, 0, C.ridgeZ - .04], [C.x0, -C.halfW, C.eaveZ], [C.x1 - C.x0, 0, 0], .2, .05); slope('coop_roof_n', [C.x0, 0, C.ridgeZ - .04], [C.x0, C.halfW, C.eaveZ], [C.x1 - C.x0, 0, 0], .2, .05);
    for (const xg of [C.x0 + .02, C.x1 - .02]) { const tri = new THREE.BufferGeometry(); tri.setFromPoints([[xg, -.5, .69], [xg, .5, .69], [xg, 0, C.ridgeZ - .05]].map(p => V(...p))); tri.computeVertexNormals(); add(tri, Object.assign(RL('wood', '#c08048', { scale: .9 }), { side: THREE.DoubleSide }), 'coop_gable', 'wood', null); }
    add(new THREE.BoxGeometry(C.x1 - C.x0 + .04, .09, .13), M.tile, 'coop_ridge_cap', 'roof', V(cx + .02, 0, C.ridgeZ - .02));
    { const tr2 = add(new THREE.BoxGeometry(.5, .08, .12), M.wood, 'hen_feed_trough', 'wood', V(cx - .9, -1.2, .04)); add(new THREE.BoxGeometry(.44, .02, .08), M.strawDk, 'hen_feed_grain', 'straw', V(cx - .9, -1.2, .085)); contact(cx - .9, -1.2, .35, .15, .45);
      add(new THREE.CylinderGeometry(.16, .13, .06, 14), M.terra, 'hen_water_dish', 'pot', V(cx + .8, -1.15, .03)); add(new THREE.CircleGeometry(.13, 14), basic('#f2c0c8'), 'hen_water', 'water', V(cx + .8, -1.15, .062)).rotation.x = -Math.PI / 2; }
    for (let i = 0; i < 6; i++) add(new THREE.ConeGeometry(.012, .05, 4), M.white, 'hen_feather', 'bird', V(cx + rr(-.9, .9), -rr(.6, 1.6), .01)).rotation.set(Math.PI / 2, 0, rr(0, 6));
    contact(cx, 0, 1.25, .75, .5);
    const [sx, sy, sz] = C.spear; spearOn('coop', [sx, sy, sz], C.spearLen, [[sx + .1, sy - .3, sz - .17], [sx + .1, sy - C.halfW - .03, C.eaveZ - .02], [sx + .06, sy - .52, C.eaveZ - .1], [sx + .06, sy - .52, .04]], .016); }
  if (pl.fist) { const r = pl.fist_r || .04, f1 = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), basic('#2a1a1f')), f2 = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), basic('#fbf6ee')); f1.name = 'coop_spear_fist'; f2.name = 'coop_spear_fist_fill'; f1.userData.noExport = f2.userData.noExport = true;
    f1.position.copy(V(pl.fist[0], pl.fist[1] - .012, pl.fist[2])); f1.scale.setScalar(r); f2.position.copy(V(pl.fist[0], pl.fist[1] - .024, pl.fist[2])); f2.scale.setScalar(r * .8); scene.add(f1, f2); }

  // ---------- WET GROUND: packed earth with pebbles, ruts, mud shine and straw (one painted map), grass in clumps, puddles that hold the rose sky ----------
  const earthT = tex(1024, 1024, (g, W, H) => { g.fillStyle = '#c48a5c'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) blot(g, rr(0, W), rr(0, H), rr(30, 120), rnd() < .55 ? 'rgba(120,70,50,A)' : 'rgba(225,170,120,A)', rr(.12, .3));
    for (let i = 0; i < 40; i++) { const x = rr(0, W), y = rr(0, H), w = rr(40, 140); blot(g, x, y, w, 'rgba(95,55,50,A)', .35); g.strokeStyle = 'rgba(255,214,200,.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x - w * .15, y - w * .1, w * .35, w * .08, rr(-.4, .4), 3.6, 5.6); g.stroke(); }   // wet mud + sky shine
    for (let i = 0; i < 650; i++) { const x = rr(0, W), y = rr(0, H), r = rr(1.2, 4.5), c = rr(-20, 20); g.fillStyle = `rgb(${168 + c},${132 + c},${112 + c})`; g.beginPath(); g.ellipse(x, y, r * 1.3, r, rr(0, 3), 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,215,.45)'; g.fillRect(x - r * .4, y - r * .5, r * .5, r * .3); g.fillStyle = 'rgba(70,40,40,.35)'; g.fillRect(x - r, y + r * .6, r * 2, 1.5); }   // pebbles
    for (let i = 0; i < 260; i++) { const x = rr(0, W), y = rr(0, H), a = rr(0, 3.14), l = rr(8, 22); g.strokeStyle = rnd() < .5 ? 'rgba(242,207,90,.9)' : 'rgba(217,168,58,.85)'; g.lineWidth = rr(1, 2.2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }   // straw
    for (const yy of [H * .3, H * .36]) { g.strokeStyle = 'rgba(90,50,45,.35)'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= W; x += 64) g.lineTo(x, yy + Math.sin(x * .01) * 20); g.stroke(); }   // cart ruts
  });
  const paintRelief = (t, kind, sc, tileM) => { if (!(ctx.relief && ctx.relief.on)) return null; const m = ctx.relief(kind, '#ffffff', { scale: sc, normal: 1.3, seed: 5 }), tt = t.clone(); tt.needsUpdate = true; tt.repeat.set(sc / tileM, sc / tileM); m.map = tt; return m; };   // v2: the painted map (straw, pebbles, wet shine) on the kit's relief normals, one tile = tileM metres
  const ground = add(new THREE.PlaneGeometry(44, 40), paintRelief(earthT, 'mud', 2.5, 10) || mapM(earthT, [4.4, 4]), 'yard_wet_earth', 'ground', V(-9, -6, .006)); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const grassT = tex(512, 512, (g, W, H) => { g.fillStyle = '#7fb845'; g.fillRect(0, 0, W, H); for (let i = 0; i < 90; i++) blot(g, rr(0, W), rr(0, H), rr(20, 70), rnd() < .5 ? 'rgba(60,130,50,A)' : 'rgba(170,210,90,A)', .35);
    for (let i = 0; i < 2600; i++) { const x = rr(0, W), y = rr(0, H), l = rr(5, 12); g.strokeStyle = rnd() < .5 ? 'rgba(60,120,40,.7)' : 'rgba(180,220,110,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-3, 3), y - l); g.stroke(); } });
  const gr0 = add(new THREE.CircleGeometry(80, 48), paintRelief(grassT, 'grass', 2.5, 6) || mapM(grassT, [26, 26]), 'yard_grass', 'ground', V(-6, -4, 0)); gr0.rotation.x = -Math.PI / 2; gr0.castShadow = false;
  { const blade = new THREE.ConeGeometry(.025, .32, 3); blade.translate(0, .16, 0); const im = new THREE.InstancedMesh(blade, toon('#ffffff'), 2600); im.name = 'grass_clump_blades'; im.userData.role = 'foliage'; im.castShadow = false; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(); let k = 0;
    const clumps = []; for (let i = 0; i < 120; i++) { const edge = rnd() < .5; let x, y; if (edge) { const a = rr(0, Math.PI * 2), r = rr(18, 26); x = -9 + Math.cos(a) * r * 1.0; y = -6 + Math.sin(a) * r * .85; } else { x = rr(-26, 6); y = rr(-20, 10); }
      if (Math.hypot(x - BARN.cx, y - BARN.cy) < 5 || Math.hypot(x - HOUSE.cx, y - HOUSE.cy) < 4.5 || Math.hypot(x + 9.9, y + 10.3) < 1.2 || Math.hypot(x + .8, y) < 1.6) continue; clumps.push([x, y]); }
    for (const [x, y] of [...clumps, [-.6 - 1.6, -1.0], [.9, -.9], [-2.3, .5], [1.4, .6], [-8.8, -12.4], [-11.9, -6.4], [-7.2, -8.0]]) for (let j = 0; j < 20 && k < 2600; j++) { e.set(rr(-.35, .35), rr(0, 6), rr(-.35, .35)); q.setFromEuler(e); const s = rr(.6, 1.4);
      m4.compose(V(x + rr(-.22, .22), y + rr(-.22, .22), 0), q, new THREE.Vector3(s, s * rr(.7, 1.3), s)); im.setMatrixAt(k, m4); col.set(rnd() < .5 ? '#5aa83a' : '#9ccc55'); im.setColorAt(k, col); k++; }
    im.count = k; scene.add(im); }
  { const pebG = new THREE.IcosahedronGeometry(1, 0), im = new THREE.InstancedMesh(pebG, toon('#ffffff'), 500); im.name = 'yard_pebbles'; im.userData.role = 'ground'; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
    for (let i = 0; i < 500; i++) { e.set(rr(0, 3), rr(0, 3), rr(0, 3)); q.setFromEuler(e); const s = rr(.025, .07); m4.compose(V(rr(-24, 4), rr(-18, 8), s * .3), q, new THREE.Vector3(s * 1.3, s * .6, s)); im.setMatrixAt(i, m4); col.set(['#b89a8a', '#a08070', '#c8b0a0', '#9a8a8a'][i % 4]); im.setColorAt(i, col); } scene.add(im); }
  // puddles: rose sky reflected (painted gradient: rose, peach, washed blue), a mud rim, a bright far lip; rings from the eave drips
  const pudT = tex(256, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7fa8ec'); gr.addColorStop(.35, '#c9b8ee'); gr.addColorStop(.62, '#ffc2b8'); gr.addColorStop(1, '#ffd9a8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) blot(g, rr(0, W), rr(H * .2, H * .7), rr(20, 50), 'rgba(255,230,235,A)', .4); g.fillStyle = 'rgba(90,50,110,.45)'; g.fillRect(0, H * .1, W, H * .08); });
  const puddles = [], ringsP = [];
  for (const [x, y, rx, ry] of [[-9.2, -7.9, 1.2, .55], [-8.0, -11.3, .9, .45], [-11.6, -10.5, .55, .35], [-7.0, -9.6, .45, .3], [-14.6, -8.9, 1.3, .55], [-12.0, -14.6, 1.1, .5], [-17.5, -8.8, .9, .5], [1.3, -1.6, .7, .4], [-2.2, -1.9, .5, .28], [.4, -2.6, .35, .2], [-3.2, -.6, .6, .3], [2.4, .9, .5, .3]]) {
    const r = add(new THREE.CircleGeometry(1, 28), basic('#7a4a40'), 'puddle_mud_rim', 'water', V(x, y, .02)); r.rotation.x = -Math.PI / 2; r.scale.set(rx * 1.13, ry * 1.16, 1); r.castShadow = false;
    const p = add(new THREE.CircleGeometry(1, 28), basic('#ffffff', { map: pudT }), 'puddle', 'water', V(x, y, .026)); p.rotation.x = -Math.PI / 2; p.scale.set(rx, ry, 1); p.castShadow = false; puddles.push([x, y, rx, ry]);
    const lip = add(new THREE.RingGeometry(.93, 1.0, 28, 1, Math.PI * .1, Math.PI * .8), basic('#fff0e8'), 'puddle_bright_lip', 'water', V(x, y, .028)); lip.rotation.x = -Math.PI / 2; lip.scale.set(rx, ry, 1); lip.castShadow = false; }
  for (let i = 0; i < 14; i++) { const P = puddles[i % puddles.length], m = add(new THREE.RingGeometry(.8, 1, 24), basic('#fff6f2', { transparent: true, opacity: 0, depthWrite: false }), 'puddle_drip_ring', 'water', V(P[0] + rr(-.4, .4) * P[2], P[1] + rr(-.3, .3) * P[3], .03)); m.rotation.x = -Math.PI / 2; m.castShadow = false; m.userData = { ph: rr(0, 40), per: rr(26, 44) }; ringsP.push(m); }
  for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(.3, .33, .06, 9), M.stone, 'step_stone', 'stone', V(-8.6 - i * .78, -8.6 + Math.sin(i) * .3, .03));
  // yard wall (coursed stones with a cap), cypresses with real layers, far west hills
  for (let i = 0; i < 18; i++) { box(1.95, .55, .95 + (i % 3) * .06, -32 + i * 2, 9.5, 0, mapM(T.course, [1, .6]), 'yard_wall_stone', 'stone'); box(2.0, .66, .1, -32 + i * 2, 9.5, .95 + (i % 3) * .06, M.stoneDk, 'yard_wall_cap', 'stone'); }
  for (let i = 0; i < 13; i++) { box(.55, 1.95, .95 + (i % 3) * .06, -28.5, -17 + i * 2, 0, mapM(T.course, [1, .6]), 'yard_wall_stone_w', 'stone'); box(.66, 2.0, .1, -28.5, -17 + i * 2, .95 + (i % 3) * .06, M.stoneDk, 'yard_wall_cap', 'stone'); }
  if (ctx.trees && ctx.trees.on) {   // v2 KIT TREES, in groups and lines behind the cast: cypress pairs along the walls, an olive grove north-west, figs by the barn and the coop
    const T3 = (kind, x, y, o = {}) => { const g = ctx.trees.tree({ kind, parent: false, seed: Math.round(Math.abs(x * 7 + y * 13)) + 1, ...o }); g.position.copy(V(x, y, 0)); scene.add(g); return g; };
    for (const [x, y, hc] of [[-30, -14, 8], [-31, -6, 9.5], [-30.5, 1, 7.5], [-26, 11.5, 9], [-10, 11.8, 8], [9, 11.8, 7], [-32, -20, 7], [-25, -19, 6.5]]) { T3('cypress', x, y, { height: hc }); T3('cypress', x + 1.5, y + .9, { height: hc * .82 }); }
    for (const [x, y] of [[-21, 6.5], [-17.5, 8.2], [-14, 6.8], [-23.5, 9.5], [4.5, 8.5], [6.8, 6.2]]) T3('olive', x, y, { height: 3.8 + (x % 2 ? .6 : 0) });
    for (const [x, y] of [[-20.5, -17.2], [-4.6, 6.4]]) T3('oak', x, y, { height: 4.6, crownW: 3.8, leaf: '#3f6e2a', leaf2: '#7aa046', leafSize: .42 });   // fig: broad dark leaves
  } else for (const [x, y, hc] of [[-30, -14, 8], [-31, -6, 9.5], [-30.5, 1, 7.5], [-26, 11.5, 9], [-10, 11.8, 8], [9, 11.8, 7], [-32, -20, 7], [-25, -19, 6.5]]) { for (let k = 0; k < 4; k++) { const c = add(new THREE.ConeGeometry(1.15 - k * .2, hc * (1 - k * .18), 9), k % 2 ? M.cypLt : M.cyp, 'yard_cypress', 'foliage', V(x + rr(-.1, .1), y + rr(-.1, .1), hc * (1 - k * .18) / 2 + k * hc * .12)); c.rotation.y = rr(0, 3); } bar([x, y, 0], [x, y, .6], .12, M.woodDk, 'cypress_trunk', 'wood'); }
  for (const [x, y, top, rx, ry, c] of [[-230, -40, 16, 150, 120, '#5a9a58'], [-260, 120, 22, 140, 110, '#4a86a0'], [-200, -190, 12, 120, 100, '#6aa84e']]) { const m = add(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(c), 'hill_west_far', 'foliage', V(x, y, -.2)); m.scale.set(rx, top, ry); m.castShadow = false; }

  // ---------- YARD PROPS (30+ kinds), each with a contact shadow ----------
  const barrel = (x, y, s = 1) => { add(new THREE.CylinderGeometry(.34 * s, .34 * s, .9 * s, 16), mapM(T.coop, [2, 1]), 'yard_barrel', 'wood', V(x, y, .45 * s)); add(new THREE.SphereGeometry(.37 * s, 16, 8), mapM(T.coop, [2, 1]), 'yard_barrel_belly', 'wood', V(x, y, .45 * s)).scale.set(1, .9, 1);
    for (const zz of [.12, .45, .78]) add(new THREE.TorusGeometry(.355 * s, .018, 5, 18), M.ironDk, 'yard_barrel_hoop', 'metal', V(x, y, zz * s)).rotation.x = Math.PI / 2; add(new THREE.CircleGeometry(.33 * s, 16), M.woodDk, 'yard_barrel_lid', 'wood', V(x, y, .905 * s)).rotation.x = -Math.PI / 2; contact(x, y, .5 * s); };
  const bale = (x, y, z = 0, yaw = 0) => { const b = box(1.0, .5, .45, x, y, z, M.straw, 'yard_hay_bale', 'straw', yaw); for (const o of [-.25, .25]) { const c = box(.04, .52, .47, x + Math.cos(yaw) * o, y - Math.sin(yaw) * o, z - .01, M.rope, 'yard_bale_twine', 'rope', yaw); }
    for (let i = 0; i < 8; i++) bar([x + rr(-.45, .45), y + rr(-.24, .24), z + .45], [x + rr(-.55, .55), y + rr(-.3, .3), z + .45 + rr(.02, .1)], .008, M.strawDk, 'yard_bale_wisp', 'straw', .008, 3); if (!z) contact(x, y, .75, .45); };
  // near the barn and the Priest (and two behind the coop, in the Mason's shot)
  barrel(-2.4, 4.2); bale(2.9, 5.6, 0, .3); bale(2.8, 5.5, .45, .5);
  barrel(-11.2, -14.6); barrel(-10.6, -15.2, .85); bale(-12.6, -15.4); bale(-12.5, -15.3, .45, .1); bale(-13.6, -15.6, 0, .4);
  { const cx2 = -10.4, cy2 = -13.4; box(.8, .55, .45, cx2, cy2, 0, mapM(T.coop, [.8, .5]), 'crate_of_spare_spears', 'wood', .3); sign('FERRO', .6, .16, [cx2 + .25, cy2 + .14, .3], Math.PI / 2 - .3, '#efd8a8', '#2a2a5a');
    for (let i = 0; i < 6; i++) { const ox = rr(-.25, .25), oy = rr(-.12, .12); bar([cx2 + ox, cy2 + oy, .3], [cx2 + ox + rr(-.12, .12), cy2 + oy + rr(-.1, .1), 1.15 + rr(0, .15)], .016, M.iron, 'crate_spear_shaft', 'metal', .014, 6); const bl = add(new THREE.ConeGeometry(.045, .16, 4), M.blade, 'crate_spear_blade', 'metal', V(cx2 + ox, cy2 + oy, 1.25 + rr(0, .1))); bl.scale.set(1, 1, .3); } }
  { const cb = [-9.4, -14.6]; bar([cb[0], cb[1], 0], [cb[0], cb[1], .5], .28, mapM(T.coop, [1, .3]), 'chopping_block', 'wood', .3, 12); add(new THREE.CircleGeometry(.27, 14), toon('#e8c08a'), 'chopping_block_rings', 'wood', V(cb[0], cb[1], .505)).rotation.x = -Math.PI / 2;
    bar([cb[0] + .05, cb[1], .5], [cb[0] + .45, cb[1] + .2, .95], .025, M.woodLt, 'axe_handle', 'wood', .025, 6); box(.04, .16, .14, cb[0] + .05, cb[1], .44, M.ironDk, 'axe_head', 'metal', .4); contact(cb[0], cb[1], .45);
    for (let i = 0; i < 18; i++) { const r = i % 6, c = Math.floor(i / 6), lg = bar([cb[0] - 1.3, cb[1] - .8 + r * .2 + (c % 2) * .1, .1 + c * .18], [cb[0] - .5, cb[1] - .8 + r * .2 + (c % 2) * .1, .1 + c * .18], .09, mapM(T.coop, [.5, .3]), 'woodpile_log', 'wood', .09, 9); } contact(cb[0] - .9, cb[1] - .3, .7, .7); }
  bar([-11.6, -13.75, 0], [-11.95, -13.75, 1.7], .02, M.woodLt, 'pitchfork_handle', 'wood', .02, 6); for (const o of [-.07, 0, .07]) bar([-11.95, -13.75 + o, 1.7], [-11.97, -13.75 + o, 2.0], .008, M.ironDk, 'pitchfork_tine', 'metal', .006, 4);
  bar([-11.55, -14.05, 0], [-11.97, -14.05, 1.6], .018, M.woodLt, 'rake_handle', 'wood', .018, 6); box(.06, .5, .05, -11.97, -14.05, 1.58, M.woodDk, 'rake_head', 'wood');
  { const wb = [-7.4, -12.6]; const tray = box(.6, 1.0, .3, wb[0], wb[1], .3, mapM(T.coop, [.6, .3]), 'wheelbarrow_tray', 'wood', .5); for (const s of [-1, 1]) bar([wb[0] + Math.sin(.5) * s * .25, wb[1] + Math.cos(.5) * .1 + s * .1, .45], [wb[0] - .55, wb[1] + .75 + s * .25, .5], .025, M.wood, 'wheelbarrow_handle', 'wood');
    const wh = add(new THREE.TorusGeometry(.22, .04, 6, 16), M.woodDk, 'wheelbarrow_wheel', 'wood', V(wb[0] + .35, wb[1] - .45, .22)); wh.rotation.y = .5 + Math.PI / 2; add(new THREE.SphereGeometry(.18, 10, 8), M.earthDk, 'wheelbarrow_mud_load', 'ground', V(wb[0], wb[1], .55)).scale.set(1.3, .5, 1.8); contact(wb[0], wb[1], .6, .7); }
  { const cw = [-12.1, -13.9]; const wh = add(new THREE.TorusGeometry(.6, .06, 6, 20), M.woodDk, 'cart_wheel_leaning', 'wood', V(cw[0] + .1, cw[1], .6)); wh.rotation.set(0, Math.PI / 2, .2); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; bar([cw[0] + .1, cw[1] + Math.cos(a) * .05, .6 + Math.sin(a) * .05], [cw[0] + .1 + Math.sin(.2) * Math.sin(a) * .58 * 0, cw[1] + Math.cos(a) * .58, .6 + Math.sin(a) * .58], .022, M.wood, 'cart_wheel_spoke', 'wood', .02, 5); }
    add(new THREE.CylinderGeometry(.1, .1, .2, 10), M.wood, 'cart_wheel_hub', 'wood', V(cw[0] + .1, cw[1], .6)).rotation.z = Math.PI / 2; }
  // the farm cart behind the well
  { const cx2 = -16.0, cy2 = -3.6; box(2.4, 1.3, .12, cx2, cy2, .6, mapM(T.coop, [1, .5]), 'farm_cart_bed', 'wood'); for (const s of [-1, 1]) box(2.4, .06, .4, cx2, cy2 + s * .62, .72, mapM(T.coop, [1, .3]), 'farm_cart_side', 'wood');
    for (const s of [-1, 1]) { const w = add(new THREE.TorusGeometry(.55, .06, 6, 20), M.woodDk, 'farm_cart_wheel', 'wood', V(cx2 - .2, cy2 + s * .72, .55)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; bar([cx2 - .2 + Math.cos(a) * .53, cy2 + s * .72, .55 + Math.sin(a) * .53], [cx2 - .2 - Math.cos(a) * .53, cy2 + s * .72, .55 - Math.sin(a) * .53], .02, M.wood, 'farm_cart_spoke', 'wood', .02, 4); } }
    for (const s of [-1, 1]) bar([cx2 + 1.2, cy2 + s * .4, .65], [cx2 + 2.8, cy2 + s * .3, .05], .04, M.wood, 'farm_cart_shaft', 'wood'); bale(cx2 - .3, cy2, .72, 0); for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(.22, 10, 8), M.sack, 'grain_sack', 'cloth', V(cx2 + .6, cy2 - .3 + i * .3, .95)).scale.set(1, .8, 1.3); contact(cx2, cy2, 1.6, 1.1, .4); }
  // stone water trough, buckets, watering can, bench, stool, millstone, grindstone, egg basket, cabbages, rope coil, broom, sacks
  { const tx = -6.8, ty = -14.4; box(1.6, .6, .55, tx, ty, 0, mapM(T.course, [1.5, .5]), 'water_trough', 'stone'); add(new THREE.PlaneGeometry(1.4, .4), basic('#ffc8c0', { map: pudT }), 'water_trough_water', 'water', V(tx, ty, .5)).rotation.x = -Math.PI / 2; contact(tx, ty, 1.1, .5); }
  for (const [x, y] of [[-6.2, -13.6], [-11.7, -7.1]]) { add(new THREE.CylinderGeometry(.16, .12, .28, 12), mapM(T.coop, [1.5, .5]), 'wooden_pail', 'wood', V(x, y, .14)); for (const z of [.07, .21]) add(new THREE.TorusGeometry(.15 - (z - .14) * .2, .011, 5, 14), M.ironDk, 'pail_hoop', 'metal', V(x, y, z)).rotation.x = Math.PI / 2; contact(x, y, .25); }
  { const wc = [1.25, -.9]; add(new THREE.CylinderGeometry(.14, .16, .3, 14), M.copper, 'watering_can', 'metal', V(wc[0], wc[1], .15)); bar([wc[0] + .12, wc[1], .1], [wc[0] + .42, wc[1], .32], .022, M.copper, 'watering_can_spout', 'metal', .014, 6); add(new THREE.TorusGeometry(.1, .015, 5, 12, Math.PI), M.copper, 'watering_can_handle', 'metal', V(wc[0], wc[1], .3)); contact(wc[0], wc[1], .25); }
  { const bx = HOUSE.cx + HOUSE.w / 2 + .5, by = HOUSE.cy - 2.0; box(.4, 1.6, .06, bx, by, .45, M.wood, 'bench_seat', 'wood'); for (const s of [-1, 1]) box(.35, .08, .45, bx, by + s * .65, 0, M.woodDk, 'bench_leg', 'wood'); contact(bx, by, .4, .9);
    add(new THREE.CylinderGeometry(.2, .14, .22, 12, 1, true), M.strawDk, 'egg_basket', 'straw', V(bx, by + .3, .62)); add(new THREE.TorusGeometry(.18, .015, 5, 12, Math.PI), M.strawDk, 'egg_basket_handle', 'straw', V(bx, by + .3, .74)); for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.045, 8, 6), M.white, 'basket_egg', 'egg', V(bx + rr(-.08, .08), by + .3 + rr(-.08, .08), .7)).scale.set(1, 1.3, 1); }
  { const sx2 = -2.7, sy2 = 2.6; add(new THREE.CylinderGeometry(.2, .2, .05, 12), M.wood, 'milking_stool_seat', 'wood', V(sx2, sy2, .42)); for (let i = 0; i < 3; i++) { const a = i * 2.1; bar([sx2 + Math.cos(a) * .12, sy2 + Math.sin(a) * .12, .4], [sx2 + Math.cos(a) * .22, sy2 + Math.sin(a) * .22, 0], .02, M.woodDk, 'milking_stool_leg', 'wood'); } contact(sx2, sy2, .3); }
  { const mx = -18.8, my = -15.6; const ms = add(new THREE.CylinderGeometry(.75, .75, .25, 20), mapM(T.course, [2, .2]), 'old_millstone', 'stone', V(mx, my, .5)); ms.rotation.x = Math.PI / 2 - .25; add(new THREE.CylinderGeometry(.15, .15, .27, 10), M.char, 'millstone_eye', 'stone', V(mx, my, .5)).rotation.x = Math.PI / 2 - .25; }
  { const gx = 2.3, gy = 3.4; const gs = add(new THREE.CylinderGeometry(.32, .32, .1, 18), M.stoneDk, 'grindstone_wheel', 'stone', V(gx, gy, .7)); gs.rotation.x = Math.PI / 2; box(.1, .7, .65, gx, gy, 0, M.wood, 'grindstone_frame', 'wood'); bar([gx, gy - .35, .7], [gx + .2, gy - .5, .55], .02, M.iron, 'grindstone_crank', 'metal'); add(new THREE.ConeGeometry(.08, .12, 8), M.copper, 'grindstone_drip_pot', 'pot', V(gx, gy + .1, 1.1)).rotation.x = Math.PI; contact(gx, gy, .4); }
  { const kx = -15.4, ky = -6.7; box(.6, .45, .35, kx, ky, 0, mapM(T.coop, [.5, .3]), 'cabbage_crate', 'wood'); for (let i = 0; i < 4; i++) add(new THREE.IcosahedronGeometry(.13, 1), M.cabbage, 'cabbage', 'veg', V(kx - .17 + (i % 2) * .3, ky - .08 + Math.floor(i / 2) * .16, .42)); contact(kx, ky, .45); }
  for (let i = 0; i < 6; i++) add(new THREE.TorusGeometry(.22 - i * .006, .022, 5, 16), M.rope, 'rope_coil', 'rope', V(-11.4, -12.9, .03 + i * .035)).rotation.x = Math.PI / 2;
  { bar([-11.65, -9.9, 0], [-11.97, -9.9, 1.45], .02, M.woodLt, 'broom_handle', 'wood'); const bh = add(new THREE.ConeGeometry(.16, .4, 8), M.strawDk, 'broom_head', 'straw', V(-11.67, -9.9, .18)); bh.rotation.x = Math.PI; }
  for (const [x, y] of [[-10.0, -15.4], [-9.6, -15.6]]) { add(new THREE.SphereGeometry(.3, 10, 8), M.sack, 'flour_sack', 'cloth', V(x, y, .26)).scale.set(1, 1.3, .9); add(new THREE.CylinderGeometry(.05, .09, .12, 8), M.rope, 'sack_tie', 'rope', V(x, y, .62)); contact(x, y, .35); }
  { for (const [x, y] of [[-11.55, -9.3], [-11.2, -9.0]]) { add(new THREE.CylinderGeometry(.16, .11, .26, 12), M.terra, 'flower_pot', 'pot', V(x, y, .13)); for (let k = 0; k < 7; k++) add(new THREE.SphereGeometry(.05, 6, 4), k % 3 ? M.grassDk : M.red, 'geranium', 'foliage', V(x + rr(-.1, .1), y + rr(-.1, .1), .3 + rr(0, .12))); contact(x, y, .22); } }
  // washing line between the house corner and a post: a cassock-black shirt, white sheet, blue apron, a rose cloth (they sway in the dawn wind)
  const washing = []; { const A = [HOUSE.cx + HOUSE.w / 2, HOUSE.cy + HOUSE.d / 2 + .1, 2.3], Bp = [-12.0, -2.2, 2.2]; bar([Bp[0], Bp[1], 0], [Bp[0], Bp[1], 2.4], .05, M.woodDk, 'washing_post', 'wood'); contact(Bp[0], Bp[1], .25);
    bar(A, Bp, .008, M.rope, 'washing_line', 'rope', .008, 4); [[.2, M.cloth, .7, .9], [.42, M.clothB, .45, .6], [.6, M.cloth, .8, 1.0], [.8, M.clothR, .4, .5]].forEach(([u, mat, w, h]) => { const p = [A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u, A[2] + (Bp[2] - A[2]) * u - .08 - Math.sin(Math.PI * u) * .25];
      const g = new THREE.Group(); g.position.copy(V(...p)); g.rotation.y = Math.atan2(-(Bp[1] - A[1]), Bp[0] - A[0]); scene.add(g); const c = add(new THREE.PlaneGeometry(w, h, 4, 4), new THREE.MeshToonMaterial({ color: mat.color, gradientMap: mat.gradientMap, side: THREE.DoubleSide }), 'washing_cloth', 'cloth', new THREE.Vector3(0, -h / 2, 0), g);
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(.03, .08, .03), M.woodLt, 'washing_peg', 'wood', new THREE.Vector3(s * w * .4, 0, 0), g); washing.push({ g, c, ph: u * 7 }); }); }

  // ---------- the BIG WIRE of the tower carried on down the south wall into the earth ----------
  { const Tw = toLocal([SPEAR.x + .5, SPEAR.y - 1.62, 0]), zTop = toLocal([0, 0, APEX[2] - .9 - .38 - 6])[2];
    bar([Tw[0], Tw[1], zTop + .3], [Tw[0], Tw[1], .05], .05, M.ironDk, 'tower_big_wire_down', 'metal', .05); bar([Tw[0] - .03, Tw[1] - .05, zTop], [Tw[0] - .03, Tw[1] - .05, .3], .012, M.glint, 'tower_big_wire_glint', 'metal', .012, 5);
    for (let z = 1.2; z < zTop; z += 2.4) add(new THREE.TorusGeometry(.1, .025, 6, 10, Math.PI), M.glint, 'tower_wire_staple', 'metal', V(Tw[0], Tw[1] - .02, z));
    add(new THREE.SphereGeometry(.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.earthDk, 'tower_wire_earth_mound', 'ground', V(Tw[0], Tw[1] - .2, 0));
    const tw = toLocal([0, 0, 0]); box(3.6, 3.6, .9, tw[0], tw[1], 0, mapM(T.course, [2, .5]), 'tower_plinth', 'stone'); box(.9, .12, 2.0, tw[0] - .6, tw[1] - 1.6, .9, mapM(T.coop, [.4, 1]), 'tower_side_door', 'wood'); }

  // ---------- the WHITE TOWER, struck: roofless, charred beams, soot band, a black crack down the south face, a leaning smoke column ----------
  const R = toLocal([RIVAL.x, RIVAL.y, RIVAL.base]), RH = RIVAL.top - RIVAL.base, rTop = R[2] + RH * .85, puffs = [];
  for (const [a, b] of [[[-4, -3, 0], [1, 2, 5]], [[4, -2, 0], [0, 1, 4]], [[-3, 3, 0], [3, -1, 3]], [[-5, 0, .3], [5, 1, .6]], [[2, 3, 0], [-1, -2, 3.5]]]) { const m = bar([R[0] + a[0], R[1] + a[1], rTop + a[2]], [R[0] + b[0], R[1] + b[1], rTop + b[2]], .45, M.char, 'rival_charred_beam', 'wood', .35, 5); m.material.fog = false; }
  { const soot = add(new THREE.BoxGeometry(10.9, 3, 10.9), basic('#8a7f9a', { fog: false }), 'rival_soot_band', 'stone', V(R[0], R[1], rTop - 2)); soot.castShadow = false;
    let cx2 = R[0] + 1.2, cz = rTop - 3.5; for (let i = 0; i < 12; i++) { const nx = cx2 + rr(-1.1, 1.1), nz = cz - rr(1.5, 2.6); const c = bar([cx2, R[1] - 5.5, cz], [nx, R[1] - 5.5, nz], .28 - i * .015, basic('#2a2230', { fog: false }), 'rival_marble_crack', 'stone', .28 - i * .015, 4); c.castShadow = false; cx2 = nx; cz = nz; } }
  for (let i = 0; i < 12; i++) { const u = i / 11, m = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: i % 2 ? '#5a4f6e' : '#8f84a6', transparent: true, opacity: .75 - u * .35, depthWrite: false, fog: false })); m.name = 'rival_smoke_puff'; m.userData.noExport = true;
    m.position.copy(V(R[0] - u * u * 30, R[1], rTop + 3 + u * 50)); m.userData.r = 9 + u * 20; m.userData.p0 = m.position.clone(); m.scale.setScalar(m.userData.r); m.renderOrder = 3; scene.add(m); puffs.push(m); }

  // ---------- AIR: dawn motes in the sun (layer 1), drips from the eaves (layer 2), chimney smoke, swallows ----------
  const motes = (() => { const n = 260, pos = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { const near = i < 150; base.push([near ? rr(-13, -5) : rr(-3, 3), near ? rr(-13, -6) : rr(-3, 1.5), rr(.2, 3.2), rr(0, 6)]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ map: softTex, color: '#ffe2c8', size: .05, transparent: true, opacity: .75, depthWrite: false, sizeAttenuation: true }));
    m.name = 'dawn_motes'; m.userData.noExport = true; m.frustumCulled = false; scene.add(m); return { m, pos, base }; })();
  const drips = []; for (const [x, y, z, gz] of [[BARN.cx + 2.5, BARN.cy + BARN.d / 2 + .4, BARN.wallH - .3, 0], [BARN.cx + 1.0, BARN.cy + BARN.d / 2 + .4, BARN.wallH - .3, 0], [WELL[0] + .75, WELL[1] - .6, 2.28, 0], [WELL[0] + .75, WELL[1] + .5, 2.28, 0], [COOP.x0 + .3, -COOP.halfW - .02, COOP.eaveZ - .02, 0], [COOP.x1 - .4, -COOP.halfW - .02, COOP.eaveZ - .02, 0], [HOUSE.cx + HOUSE.w / 2 + .4, HOUSE.cy - 1, HOUSE.wallH - .3, 0]]) {
    const m = add(new THREE.SphereGeometry(.018, 6, 5), basic('#fff4f0', { transparent: true, opacity: .9 }), 'eave_drip', 'water', V(x, y, z)); m.scale.set(1, 1.8, 1); m.castShadow = false; m.userData = { x, y, z, per: 22 + drips.length * 5, ph: drips.length * 7 }; drips.push(m);
    const rg = add(new THREE.RingGeometry(.7, 1, 20), basic('#fff6f2', { transparent: true, opacity: 0, depthWrite: false }), 'drip_splash_ring', 'water', V(x, y, .035)); rg.rotation.x = -Math.PI / 2; rg.castShadow = false; m.userData.ring = rg; }
  const smoke = smokeSrc.flatMap(([x, y, z]) => [...Array(10)].map((_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: '#e9dbe8', transparent: true, opacity: .5, depthWrite: false })); s.name = 'chimney_smoke'; s.userData = { x, y, z, ph: i / 10 }; s.userData.noExport = true; scene.add(s); return s; }));
  const swallows = [0, 1, 2, 3].map(i => { const g = new THREE.Group(); g.name = 'swallow'; g.userData.noExport = true; const b = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), basic('#2a2a4a')); b.scale.set(2, .7, .8); g.add(b);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(.05, .32, 3), basic('#2a2a4a')); w.position.set(0, 0, s * .14); w.rotation.x = s * Math.PI / 2; g.add(w); } scene.add(g); g.userData.k = i; return g; });

  // ---------- v2: the struck angel (hero_props) knocked over on the roofless white tower's stump: one gold glint far away ----------
  { const an = HP.buildAngel(THREE, ctx, {}); if (an.setStruck) an.setStruck(true); an.group.name = 'rival_struck_angel'; an.group.position.copy(V(R[0] + 2.5, R[1] - 3, rTop + .6)); an.group.rotation.set(0, .6, 1.15); an.group.scale.setScalar(2.2); scene.add(an.group); }
  // ---------- v2: RAIN SPECKS for the last rest (the storm of frame 0 coming back): short pale streaks round the hero spear, only while the loop is on ----------
  const rain = (() => { const n = 420, pos = new Float32Array(n * 6), base = [], c = toLocal([SPEAR.x, SPEAR.y - 1.4, SPEAR.tip - 1]);
    for (let i = 0; i < n; i++) base.push([c[0] + rr(-5, 5), c[1] + rr(-3.5, 5), c[2] + rr(-4, 5), rr(0, 1)]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#e6dcff', transparent: true, opacity: 0, depthWrite: false, fog: false }));
    m.name = 'end_rain_specks'; m.userData.noExport = true; m.frustumCulled = false; m.renderOrder = 6; scene.add(m); return { m, pos, base }; })();
  // ---------- v2: a cold sky light on the hero spear for the last rest (rises with the loop): the forged blade reads pale-edged against the storm ----------
  const endLight = new THREE.PointLight('#d6e6ff', 0, 7, 1.2); endLight.name = 'end_cold_sky_light'; endLight.position.copy(V(...toLocal([SPEAR.x - .9, SPEAR.y - 1.3, SPEAR.tip + .5]))); scene.add(endLight);
  // ---------- v2: the Priest's armful of spears (held3d buildSpearBundle, built before the place) gets the place's real iron on its first frame here ----------
  const bundleMats = { shaft: M.iron, socket: M.ironDk, blade: M.blade, glint: M.rim, cord: M.straw }; let bundleDone = false;
  const skinBundle = () => { const b = scene.getObjectByName('spear_bundle'); if (!b) return; b.traverse(o => { if (!o.isMesh) return; const k = /shaft/.test(o.name) ? 'shaft' : /socket/.test(o.name) ? 'socket' : /blade/.test(o.name) ? 'blade' : /glint/.test(o.name) ? 'glint' : null; if (k) o.material = bundleMats[k]; }); bundleDone = true; };

  // ---------- life ----------
  const glints = [].map((p) => {   // v2: the old warm flash spheres are replaced by the hero spears' cold glint sprites (smallSpears)
    const m = new THREE.Mesh(new THREE.SphereGeometry(.11, 8, 6), basic('#fff0e0', { transparent: true, opacity: 0 })); m.position.copy(p); m.name = 'spear_dawn_glint'; m.userData.noExport = true; scene.add(m); return m; });
  const gl = pl.glints || { f0: 73, step: 6 }, lp = pl.loop || null;
  const update = (f, t, Rk) => { if (Rk && Rk.camera) { sky.position.copy(Rk.camera.position); sky.updateMatrixWorld(); if (stormDome) { stormDome.position.copy(Rk.camera.position); stormDome.updateMatrixWorld(); } }
    // THE LOOP: from loop.f0 to loop.f1 the dawn sky gives way to frame 0's storm sky (and fog), so the last frame joins frame 0
    const k = lp ? Math.min(1, Math.max(0, (f - lp.f0) / Math.max(1, lp.f1 - lp.f0))) : 0, ks = k * k * (3 - 2 * k); skyU.uA.value = 1 - ks; scene.fog.color.copy(fogDawn).lerp(fogStorm, ks);
    // FP1: the storm rise (stretch frames; film = +1897): 0 before rise[0], eases to rise[2] at rise[1] (coop: the wall behind the tower), then to 1 at rise[3]
    const SR = pl.storm_rise || [113, 173, .5, 203], sst = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    const uS = !endDome ? 0 : f <= SR[0] ? 0 : f <= SR[1] ? SR[2] * (1 - Math.pow(1 - (f - SR[0]) / (SR[1] - SR[0]), 2)) : Math.max(SR[2] + (1 - SR[2]) * sst((f - SR[1]) / (SR[3] - SR[1])), ks >= 1 ? 1 : 0);
    if (endDome) { skyU.uA.value = 1; skyU.uS.value = Math.min(1.05, uS * 1.05); }
    if (dawnClouds) cloudOps(dawnClouds, (1 - ks) * (1 - sst((uS - .6) / .35))); if (northWall) cloudOps(northWall, (1 - ks) * (1 - sst(uS / .25)));
    if (endDome) { endDome.visible = ks > 0 || uS > 0; if (Rk && Rk.camera) { endDome.position.copy(Rk.camera.position); endDome.updateMatrixWorld(); } if (stormDome) stormDome.visible = false; if (endStorm) endStorm.visible = false; towerClouds.forEach(g => { g.visible = false; });
      const d = f - endBoltF, fl = d < 0 ? 0 : d === 0 ? 1 : d < 10 ? .55 * Math.exp(-d / 2.2) + (d >= 4 && d <= 6 ? .45 * (1 - Math.abs(d - 5) / 2) : 0) : 0; ctx.sky.flash({ pos: endBoltFrom.toArray() }, .55 * fl * ks, { spread: .22, slot: 3 }); }
    else { if (stormDome) stormDome.visible = ks > 0; if (endStorm) { endStorm.visible = ks > 0; cloudOps(endStorm, ks); } towerClouds.forEach(g => { g.visible = ks > 0; cloudOps(g, ks); }); }
    if (!bundleDone) skinBundle();
    endLight.intensity = 14 * ks; rain.m.material.opacity = .55 * ks; if (ks > 0) for (let i = 0; i < rain.base.length; i++) { const [x, y, z, ph] = rain.base[i], u = ((f * .09 + ph) % 1), zz = z + 4.5 - u * 9, p = V(x - u * .6, y, zz), q = V(x - u * .6 + .02, y, zz + .16); rain.pos.set([p.x, p.y, p.z, q.x, q.y, q.z], i * 6); }
    rain.m.geometry.attributes.position.needsUpdate = true;
    smallSpears.forEach((sp, i) => { const u = (f - gl.f0 - i * gl.step) / 10, v = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; sp.setGlint(Math.max(v, .35), sp.glint ? sp.glint.userData.s0 * (1 + 1.6 * v) : 0); });
    glints.forEach((m, i) => { const u = (f - gl.f0 - i * gl.step) / 8; m.material.opacity = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; m.scale.setScalar(1 + 2.2 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, u))))); });
    puffs.forEach((m, i) => { const k2 = 1 + .08 * Math.sin(f * .05 + i * 1.7); m.scale.setScalar(m.userData.r * k2); m.position.copy(m.userData.p0); m.position.x += Math.sin(f * .02 + i) * .8; m.position.y += f * .04 * (i / 11); });
    for (let i = 0; i < motes.base.length; i++) { const [x, y, z, ph] = motes.base[i]; motes.pos[i * 3] = 0; const p = V(x + Math.sin(f * .013 + ph) * .3 + f * .004, y + Math.cos(f * .011 + ph * 1.3) * .25, z + Math.sin(f * .017 + ph * .7) * .15 + f * .002); motes.pos[i * 3] = p.x; motes.pos[i * 3 + 1] = p.y; motes.pos[i * 3 + 2] = p.z; }
    motes.m.geometry.attributes.position.needsUpdate = true;
    drips.forEach(m => { const { x, y, z, per, ph, ring } = m.userData, u = ((f + ph) % per) / per, fallT = .45; if (u < .6) { m.visible = true; m.position.copy(V(x, y, z - .01 * u)); m.scale.set(1, 1.2 + u, 1); } else if (u < .6 + fallT * .4) { const v = (u - .6) / (fallT * .4); m.position.copy(V(x, y, z * (1 - v * v))); m.scale.set(.8, 2.6, .8); } else m.visible = false;
      const ru = (u - .78) / .22; ring.material.opacity = ru > 0 && ru < 1 ? .7 * (1 - ru) : 0; ring.scale.setScalar(.03 + .22 * Math.max(0, ru)); });
    ringsP.forEach(m => { const { ph, per } = m.userData, u = ((f + ph) % per) / per; m.material.opacity = .55 * (1 - u); m.scale.setScalar(.05 + .35 * u); });
    smoke.forEach(s => { const { x, y, z, ph } = s.userData, u = ((f / 90) + ph) % 1; s.position.copy(V(x - u * u * 2.6, y + u * .6, z + u * 3.2)); s.scale.setScalar(.35 + u * 1.6); s.material.opacity = .55 * Math.sin(Math.PI * Math.min(1, u * 1.2)); });
    doves.forEach((g, i) => { const d = g.userData; if (d.fly) { const a = f * d.fly.w + d.fly.ph; g.position.copy(V(DOVE[0] + Math.cos(a) * d.fly.r, DOVE[1] + Math.sin(a) * d.fly.r * .8, d.fly.h + Math.sin(a * 2) * .4)); g.rotation.y = -a - Math.PI; const fl = Math.sin(f * .9 + i); d.wL.scale.set(1.4, .5 + .9 * Math.abs(fl), .5); d.wR.scale.set(1.4, .5 + .9 * Math.abs(fl), .5); d.wL.position.y = d.wR.position.y = .1 + .05 * fl; }
      else { const c = Math.floor((f + d.ph * 20) / 23) % 4; d.h.position.y = .15 + (c === 1 ? -.03 : 0); d.h.position.x = .12 + (c === 2 ? .025 : 0); } });
    swallows.forEach(g => { const k2 = g.userData.k, a = f * .035 + k2 * 1.6; g.position.copy(V(-8 + Math.cos(a) * (7 + k2), -6 + Math.sin(a * 1.3) * 6, 6 + k2 * .8 + Math.sin(a * 2.1) * .8)); g.rotation.y = -a * 1.1; g.children[1].rotation.z = g.children[2].rotation.z = .4 * Math.sin(f * 1.1 + k2); });
    washing.forEach(({ g, ph }) => { g.rotation.x = .12 * Math.sin(f * .07 + ph) + .05 * Math.sin(f * .19 + ph * 2); }); };
  const tw = toLocal([SPEAR.x, SPEAR.y, 0]);
  return { update, anchors: { coop_spear: COOP.spear, coop_ridge: [-.8, 0, COOP.ridgeZ], well_spear: ROOFS.well, barn_spear: ROOFS.barn, house_spear: ROOFS.house, dovecote_spear: ROOFS.dovecote, ladder_grip: ladderRail(1.25),
      big_spear: toLocal([SPEAR.x, SPEAR.y, SPEAR.tip]), big_spear_tip: toLocal([SPEAR.x, SPEAR.y, SPEAR.tip]), big_wire_foot: [tw[0] + .5, tw[1] - 1.62, 0], rival_top: [R[0], R[1], rTop] } };
}

// ---------- HELD PROPS of the yard (film.json held3d, module "sets/yard.js"). Local +Y = the long axis; grip = where the round fist closes. ----------
export function buildLadder(THREE, opts = {}) { const toon = opts.toon || (c => new THREE.MeshLambertMaterial({ color: c })), g = new THREE.Group(); g.name = 'yard_ladder'; const wood = toon('#d49a52'), dk = toon('#8a5a2c'), cord = toon('#f2cf5a');
  const add = (geo, mat, name, p) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = 'wood'; m.position.set(...p); m.castShadow = true; g.add(m); return m; }, lo = opts.below ?? 1.5, hi = opts.above ?? 1.25, L = lo + hi, W = .42;
  for (const s of [0, -1]) add(new THREE.CylinderGeometry(.028, .034, L, 8), wood, 'ladder_rail', [s * W, (hi - lo) / 2, 0]);
  for (let y = -lo + .32; y < hi - .1; y += .3) { const r = add(new THREE.CylinderGeometry(.02, .02, W + .1, 7), dk, 'ladder_rung', [-W / 2, y, 0]); r.rotation.z = Math.PI / 2; }
  add(new THREE.CylinderGeometry(.038, .038, .09, 8), cord, 'ladder_cord_binding', [-W, hi - .5, 0]);
  return { group: g, grip: new THREE.Vector3(0, 0, 0), tip: new THREE.Vector3(0, hi, 0) }; }
// The armful of small iron spears, carried like firewood: seven forged rods with leaf tips and sockets, bound by two straw cords, tips all to one end.
export function buildSpearBundle(THREE, opts = {}) { const toon = opts.toon || (c => new THREE.MeshLambertMaterial({ color: c })), g = new THREE.Group(); g.name = 'spear_bundle'; const iron = toon('#3c4470'), dk = toon('#252a4a'), cord = toon('#f2cf5a'), gl = new THREE.MeshBasicMaterial({ color: '#ffd9c0' }), blade = new THREE.MeshBasicMaterial({ color: '#2b3052' });
  const add = (geo, mat, name, p, par = g) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = 'metal'; m.position.set(...p); m.castShadow = true; par.add(m); return m; }, L = opts.len ?? .86;
  const at = [[0, 0], [.05, .01], [-.05, .012], [.025, .048], [-.026, .05], [.03, -.04], [-.028, -.042]];
  at.forEach(([x, z], i) => { const s = new THREE.Group(); s.position.set(x, (i % 3 - 1) * .05, z + .05); s.rotation.z = (i % 2 ? 1 : -1) * .035 * (1 + i % 3); g.add(s);
    add(new THREE.CylinderGeometry(.016, .02, L * .78, 7), iron, 'bundle_spear_shaft', [0, -L * .11, 0], s); add(new THREE.CylinderGeometry(.024, .03, .07, 7), dk, 'bundle_spear_socket', [0, L * .3, 0], s);
    const b = add(new THREE.ConeGeometry(.05, L * .2, 4, 1), blade, 'bundle_spear_blade', [0, L * .42, 0], s); b.scale.set(1, 1, .3); add(new THREE.CylinderGeometry(.004, .004, L * .5, 4), gl, 'bundle_spear_glint', [-.012, -.1, .016], s); });
  for (const y of [-.2, .16]) { const c = add(new THREE.TorusGeometry(.085, .014, 6, 14), cord, 'bundle_cord', [0, y, .05]); c.rotation.x = Math.PI / 2; }
  return { group: g, grip: new THREE.Vector3(0, 0, -.03), tip: new THREE.Vector3(0, L * .5, .05) }; }
