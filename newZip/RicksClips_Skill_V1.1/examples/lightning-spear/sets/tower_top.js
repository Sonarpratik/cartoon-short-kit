// SET for pitch 1 hook frame (rough, 2026-11-15): THE TOP OF THE CHURCH BELL TOWER above a north Italian hill town, dusk before a storm, about 1765.
// Plan metres, Z up, Y forward (north). The roof peak (apex) is at plan [0, 0, 0.5], so the kit's sun shadow box (28 m round the origin) covers the hero.
// The town lies 31 m below. Parts: tiled pyramid roof with barrel-tile rows and hip tiles, stone finial, THE SPEAR (lightning rod: forged leaf tip, collar,
// two strap brackets with bolts, a big nail under the hammer) and its iron wire with staples down the roof, stone cornice, belfry with arches and a bronze
// bell, plaster shaft; the town (yellow houses, terracotta gable roofs, green shutters, piazza with fountain and tiny townsfolk), fields, hills, the
// rival's white marble tower with a gold angel and cypresses, and a sky dome with a purple storm cloud wall and one far pale flash.
// Sky dome pattern from episodes/goldrush/sets/street.js (dawn dome). Every pow / sqrt / division in the shader is guarded (GPU: no not-a-number).
export const APEX = [0, 0, 0.5], HW = 1.9, RISE = 0.9, SL = RISE / HW, TOWN_Z = -31;
export const roofZ = (x, y) => APEX[2] - SL * Math.max(Math.abs(x), Math.abs(y)) + 0.075;   // top of the tile rows at plan x, y
export const SPEAR = { x: 0, y: 0, base: 0.45, shaftTop: 2.14, tip: 2.62 };
export const RIVAL = { x: 59, y: 300, base: -10, top: 44 };
export const WIRE_X = 1.0, WALL_Y = -1.575, WIRE_FOOT = [1.0, -2.05, TOWN_Z], EYE = [.06, -.06, 1.0], STREET = { x0: -8, x1: 20, y0: 52, y1: 66 };   // S1 board 2026-11-15: the wire's way down the south wall, the bracket eye, the near street
export const CAM0 = { pos: [-0.15, -3.86, 1.4], aim: [-0.15, 0, 0.85], lens: 35 };

export async function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, pl = ctx.place || {}, col = c => new THREE.Color(c), V = (x, y, z) => B2T([x, y, z]);
  let seed = 7; const R0 = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }, rr = (a, b) => a + (b - a) * R0(), pick = a => a[Math.floor(R0() * a.length)];
  const add = (geo, mat, name, role, p, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = role; if (p) m.position.copy(p); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const M = { tile: toon('#e0602a'), tileDark: toon('#a8401a'), hip: toon('#f08a48'), stone: toon('#e6e6f2'), stoneSh: toon('#c4c0dc'), plaster: toon('#eab552'), iron: toon('#4f5880'), ironDk: toon('#2c3050'),
    bronze: toon('#c98a2e'), dark: toon('#3a2444'), marble: new THREE.MeshBasicMaterial({ color: '#fff9f2', fog: false }), marbleSh: new THREE.MeshBasicMaterial({ color: '#cdbff0', fog: false }), gold: new THREE.MeshBasicMaterial({ color: '#ffc62e' }), glint: new THREE.MeshBasicMaterial({ color: '#ffd9a0' }),
    blade: new THREE.MeshBasicMaterial({ color: '#2b3052' }), cyp: toon('#1f5a3a'), pave: toon('#f1d9a6'), wood: toon('#a8703a') };
  // S1 fix round 2 (DETAIL): the shared drawn maps of square.js (plaster with worn patches and cracks, roof tiles, planks); imported at build time (square.js imports this file)
  const SQm = await import('./square.js'), PLT = SQm.plasterTex(THREE), TIL = SQm.tileTex(THREE), PLK = SQm.plankTex(THREE), mapRep = SQm.rep;
  M.plaster = toon('#eab552', { map: mapRep(PLT, .5, 1.6) }); M.wood = toon('#b07a40', { map: mapRep(PLK, 1, 1) });
  // ===== S1 v2 VISUAL UPGRADE (2026-11-15, kit3d): real metal (ctx.pbr), surface relief (ctx.relief), a heavy storm sky (ctx.sky), real trees (ctx.trees),
  // the hero objects from hero_props.js. Every switch falls back to the v1 look when the film has no "kit3d" (other stretches that import this set).
  const PB = !!(ctx.pbr && ctx.pbr.on), RL = !!(ctx.relief && ctx.relief.on), SK = !!(ctx.sky && ctx.sky.on), TR = !!(ctx.trees && ctx.trees.on);
  const MT = (kind, o, old) => PB ? ctx.pbr.metal(kind, o) : old, RF = (kind, c, o, old) => RL ? ctx.relief(kind, c, o) : old;
  const HP = await import('./hero_props.js');
  const repK = (m, r) => { if (!RL || !m.map) return m; for (const k of ['map', 'normalMap']) if (m[k]) { m[k] = m[k].clone(); m[k].wrapS = m[k].wrapT = THREE.RepeatWrapping; m[k].repeat.set(r, r); m[k].needsUpdate = true; } return m; };   // instanced unit boxes keep UVs 0..1 per face: scale the relief to the real size
  if (RL) { M.tile = RF('tile', '#e0602a', { scale: 1.2 }); M.tileDark = RF('tile', '#c4501f', { scale: .9, seed: 3 }); M.hip = RF('tile', '#f08a48', { scale: .7, seed: 5 });
    M.stone = RF('stone', '#ece4d8', { scale: 1.1, seed: 2 }); M.stoneSh = RF('stone', '#d2c8dc', { scale: 1.1, seed: 4 }); M.plaster = RF('plaster', '#eab552', { scale: 2.2 }); M.wood = RF('wood', '#b07a40', { scale: 1.1 }); M.pave = RF('stone', '#e8d2a2', { scale: 2.6, seed: 6 }); }
  if (PB) { M.iron = MT('iron', { color: '#7a86a4', seed: 3 }); M.ironDk = MT('iron', { color: '#5c6684', rough: .3, rust: .2, seed: 7 }); M.bronze = MT('bronze', { seed: 5 }); M.gold = MT('gold', { seed: 41 }); M.glint = MT('steel', { color: '#dfe6f0', rough: .15, seed: 5 }); }
  // the wire and its iron: a rim from the sky (sheen = light at the grazing edge), so the wire reads in the wall's shade
  const wireMat = PB ? (() => { const m = MT('iron', { color: '#6a7696', rough: .28, rust: .12, seed: 13, finish: 'brushed' }); m.sheen = 1; m.sheenColor = new THREE.Color('#b9a8ff'); m.sheenRoughness = .35; return m; })() : M.ironDk;

  // ---------- the kit's own sky and fog: replaced ----------
  scene.children.forEach(o => { if (o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.radius === 400) o.visible = false; });
  scene.fog = new THREE.Fog('#b98fc8', 120, 640);

  // ---------- sky dome: peach gap at the horizon, the purple cloud wall, one far pale flash ----------
  const flash = V(.150, .962, .215).normalize(), sunD = V(-.62, -.72, .12).normalize();
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { flashD: { value: flash }, sunD: { value: sunD }, uFlash: { value: 1 } },
    vertexShader: 'varying vec3 vD; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vD = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 flashD, sunD; uniform float uFlash; varying vec3 vD;
      float fbm(vec2 q){ float cl = 0., a = .5; for (int i = 0; i < 5; i++) { cl += a * (.5 + .5 * sin(q.x * 1.7 + sin(q.y * 2.3) * 1.6) * sin(q.y * 1.3 + q.x * .45 + 1.3)); q = q * 2.03 + vec2(1.7, 4.1); a *= .5; } return cl; }
      void main(){ float L = max(length(vD), 1e-3); vec3 d = vD / L; float h = d.y; float az = atan(d.x, max(-d.z, 1e-3));
        vec2 p = vec2(az * 3.4, max(h, 0.) * 7.5);
        float cl = fbm(p + vec2(0., .6 * fbm(p * .6)));                               // billows
        float edge = .045 + .035 * sin(az * 9.) + .03 * sin(az * 23. + 1.);            // the ragged foot of the wall above the horizon gap
        float wall = smoothstep(edge, edge + .05, h);
        vec3 gap = mix(vec3(1., .66, .36), vec3(.98, .50, .56), smoothstep(0., .09, h));
        vec3 dk = vec3(.19, .09, .42), md = vec3(.36, .19, .66), hi = vec3(.56, .36, .86), warm = vec3(.95, .45, .55);
        vec3 c = mix(dk, md, smoothstep(.44, .58, cl)); c = mix(c, hi, smoothstep(.6, .7, cl));
        float lit = clamp(.5 - d.x * 1.4, 0., 1.);                                    // the low sun is behind us to the left: left flanks of the billows go warm
        c = mix(c, warm, smoothstep(.58, .72, cl) * lit * (1. - smoothstep(.1, .45, h)) * .75);
        c *= 1. - .35 * smoothstep(.25, .8, h);                                       // heavier toward the top
        float s = clamp(dot(d, flashD), 0., 1.);
        float g1 = pow(max(s, 1e-4), 260.), g2 = pow(max(s, 1e-4), 70.);
        c += uFlash * vec3(.93, .90, 1.) * (1.0 * g1 + .55 * g2 * (.45 + .55 * smoothstep(.45, .65, cl)));   // the far flash, inside the cloud
        c = mix(gap, c, wall); 
        if (h < 0.) c = mix(vec3(.72, .56, .78), gap, smoothstep(-.05, 0., h));
        c = pow(max(c, vec3(0.)), vec3(2.2));   /* the kit draws into a linear buffer: sRGB picks -> linear */
        gl_FragColor = vec4(c, 1.); }` });
  // S1 v2: with kit3d sky the dome is a HEAVY storm front painted per pixel (value-noise billows lit from below, a burning orange underside where the low
  // sun hits the wall's foot, far rain curtains hanging into the peach gap, the far flash); the kit's lit cloud layers stand in front of it
  if (SK) skyMat.fragmentShader = `uniform vec3 flashD, sunD; uniform float uFlash; varying vec3 vD;
      float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hs(i), hs(i + vec2(1., 0.)), f.x), mix(hs(i + vec2(0., 1.)), hs(i + vec2(1., 1.)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++) { s += a * vn(p); p = p * 2.07 + vec2(3.1, 1.7); a *= .5; } return s; }
      void main(){ float L = max(length(vD), 1e-3); vec3 d = vD / L; float h = d.y; float az = atan(d.x, max(abs(d.z), 1e-3) * (d.z < 0. ? 1. : -1.));
        vec2 p = vec2(az * 2.6, max(h, 0.) * 5.5);
        vec2 w = vec2(fbm(p * .7 + 2.3), fbm(p * .7 + 7.1));
        float cl = fbm(p + 1.4 * w), up = fbm(p + 1.4 * w + vec2(0., .22));
        float foot = .035 + .05 * fbm(vec2(az * 3.2, 1.3)) + .03 * vn(vec2(az * 11., 4.));        /* the ragged foot of the wall */
        float wall = smoothstep(foot - .006, foot + .03, h);
        float lump = clamp((cl - up) * 3.2 + .5, 0., 1.);                                            /* billow bellies lit from below */
        vec3 gap = mix(vec3(1., .72, .42), vec3(.98, .52, .50), smoothstep(0., .07, h));
        vec3 dk = vec3(.15, .08, .30), md = vec3(.32, .18, .56), hi = vec3(.55, .37, .80);
        vec3 c = mix(dk, md, smoothstep(.36, .62, cl)); c = mix(c, hi, smoothstep(.6, .78, cl) * .8);
        c *= .78 + .45 * lump;
        float under = 1. - smoothstep(foot, foot + .16, h);                                          /* the underside: burnt orange from the low sun */
        vec3 burn = mix(vec3(.92, .40, .26), vec3(1., .62, .36), lump);
        c = mix(c, burn, under * (.35 + .55 * lump) * smoothstep(.3, .6, cl + .1));
        c *= 1. - .3 * smoothstep(.22, .75, h);                                                     /* heavier and darker overhead */
        float s = clamp(dot(d, flashD), 0., 1.);
        float g1 = pow(max(s, 1e-4), 260.), g2 = pow(max(s, 1e-4), 60.);
        c += uFlash * vec3(.93, .90, 1.) * (1.0 * g1 + .6 * g2 * (.4 + .6 * smoothstep(.4, .65, cl)));
        c = mix(gap, c, wall);
        float curt = smoothstep(.55, .75, fbm(vec2(az * 1.9, 8.2))) * (1. - wall);                   /* far rain curtains in the gap */
        float streak = .65 + .35 * vn(vec2(az * 420., h * 6.));
        c = mix(c, mix(vec3(.42, .28, .52), vec3(.55, .40, .62), streak), curt * .78 * smoothstep(-.01, foot, h));
        if (h < 0.) c = mix(vec3(.72, .56, .78), gap, smoothstep(-.05, 0., h));
        c = pow(max(c, vec3(0.)), vec3(2.2));
        gl_FragColor = vec4(c, 1.); }`;
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(560, 64, 32), skyMat); skyDome.name = 'sky_storm_dome'; skyDome.userData.noExport = true; skyDome.renderOrder = SK ? -30 : -10; skyDome.frustumCulled = false; if (SK) skyDome.userData.k3env = true; scene.add(skyDome);

  // ---------- THE TOWER TOP ----------
  const tower = new THREE.Group(); tower.name = 'tower_top'; scene.add(tower);
  const pyr = add(new THREE.ConeGeometry(HW * Math.SQRT2 * 1.03, RISE * 1.03, 4, 1), M.tileDark, 'roof_pyramid_pans', 'roof', V(0, 0, APEX[2] - RISE * 1.03 / 2), tower); pyr.rotation.y = Math.PI / 4;
  // barrel tile rows: tapered half-buried tubes running down each of the four faces, cut by the hips
  { const seg = new THREE.CylinderGeometry(.052, .072, 1, 8), tcols = ['#e2622a', '#d4541f', '#ee7a3a', '#c94a1c', '#e96a2e'].map(col), inst = new THREE.InstancedMesh(seg, repK(RF('plaster', '#ffffff', { scale: .5, seed: 9 }, toon('#ffffff')), .18), 700); inst.name = 'roof_barrel_tiles'; inst.userData.role = 'roof'; inst.castShadow = inst.receiveShadow = true;
    const dir = new THREE.Vector3(0, -SL, 1).normalize(), q0 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate()), m4 = new THREE.Matrix4(), SLEN = Math.sqrt(1 + SL * SL); let n = 0;
    for (let k = 0; k < 4; k++) { const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), k * Math.PI / 2), q = qy.clone().multiply(q0);
      for (let i = -12; i <= 12; i++) { const s = i * .155, d0 = Math.abs(s) + .05, d1 = HW + .1; let d = d0; while (d < d1 - .05 && n < 700) { const len = Math.min(.44, d1 - d), dm = d + len / 2;
          const p = new THREE.Vector3(s, APEX[2] - SL * dm + .02, dm).applyQuaternion(qy); m4.compose(p, q, new THREE.Vector3(1, len * SLEN * 1.12, 1)); inst.setMatrixAt(n, m4); inst.setColorAt(n, pick(tcols)); n++; d += len; } } }
    inst.count = n; inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true; tower.add(inst); }
  const bar = (a, b, r, mat, name, role = 'metal', r2 = r, parent = tower, segs = 10) => { const A = V(...a), Bv = V(...b), d = Bv.clone().sub(A), L = Math.max(d.length(), 1e-4), m = add(new THREE.CylinderGeometry(r2, r, L, segs), mat, name, role, A.clone().addScaledVector(d, .5), parent); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return m; };
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) bar([sx * (HW + .1), sy * (HW + .1), APEX[2] - RISE - .02], [sx * .12, sy * .12, APEX[2] - .02], .1, M.hip, 'roof_hip_tiles', 'roof', .085);
  // stone cornice (two steps with a row of little brackets), belfry with an arch on every face and the bronze bell, plaster shaft
  add(new THREE.BoxGeometry(3.7, .16, 3.7), M.stone, 'cornice_top', 'stone', V(0, 0, APEX[2] - RISE - .1), tower); add(new THREE.BoxGeometry(3.4, .2, 3.4), M.stoneSh, 'cornice_low', 'stone', V(0, 0, APEX[2] - RISE - .28), tower);
  for (let i = -5; i <= 5; i++) for (const s of [-1, 1]) { add(new THREE.BoxGeometry(.14, .2, .16), M.stone, 'cornice_bracket', 'stone', V(i * .3, s * 1.66, APEX[2] - RISE - .46), tower); add(new THREE.BoxGeometry(.16, .2, .14), M.stone, 'cornice_bracket', 'stone', V(s * 1.66, i * .3, APEX[2] - RISE - .46), tower); }
  const BZ = APEX[2] - RISE - .38;   // belfry top
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add(new THREE.BoxGeometry(.75, 3.1, .75), M.plaster, 'belfry_pier', 'plaster', V(sx * 1.2, sy * 1.2, BZ - 1.55), tower);
  for (let k = 0; k < 4; k++) { const g = new THREE.Group(); g.rotation.y = k * Math.PI / 2; tower.add(g); add(new THREE.BoxGeometry(1.65, .7, .7), M.plaster, 'belfry_lintel', 'plaster', new THREE.Vector3(0, BZ - .35, 1.2), g);
    const arch = add(new THREE.TorusGeometry(.82, .11, 8, 20, Math.PI), M.stone, 'belfry_arch', 'stone', new THREE.Vector3(0, BZ - .95, 1.56), g); arch.scale.set(1, .8, 1); add(new THREE.BoxGeometry(1.75, .16, .9), M.stone, 'belfry_sill', 'stone', new THREE.Vector3(0, BZ - 3.02, 1.25), g); }
  add(new THREE.BoxGeometry(3.1, .2, 3.1), M.stoneSh, 'belfry_floor', 'stone', V(0, 0, BZ - 3.2), tower);
  // S1 fix round 2026-11-15: the shaft is coursed brown-ochre stone (a drawn ashlar map: staggered blocks, mortar joints, tone per block), with pale corner quoins
  const texOf = (N, paint) => { const d = new Uint8Array(N * N * 4); paint(d, N); const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const ashlar = texOf(256, (d, N) => { const CH = 32; for (let y = 0; y < N; y++) { const row = Math.floor(y / CH), off = (row % 2) * 40, yy = y % CH; for (let x = 0; x < N; x++) { const xs = (x + off) % N, bw = 64 + (row % 3) * 8, col = Math.floor(xs / bw), xx = xs % bw, h = hsh(row, col), n = hsh(x * .37, y * .91) * .12;
      const joint = yy < 3 || xx < 3, k = joint ? .62 : (.82 + .2 * h + n - (yy > CH - 6 ? .1 : 0)); const i = (y * N + x) * 4; d[i] = Math.min(255, 200 * k + 18 * h); d[i + 1] = Math.min(255, 140 * k + 10 * h); d[i + 2] = Math.min(255, 92 * k); d[i + 3] = 255; } } });
  ashlar.repeat.set(2, 19); const shaftMat = RF('brick', '#c98a52', { scale: 1.5, seed: 2 }, toon('#ffffff', { map: ashlar }));
  add(new THREE.BoxGeometry(3.15, 30, 3.15), shaftMat, 'tower_shaft', 'stone', V(0, 0, BZ - 3.3 - 15), tower);
  { const QN = 4 * 62, q = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), repK(RF('plaster', '#ffffff', { scale: .6, seed: 12, normal: .6 }, toon('#ffffff')), .16), QN); q.name = 'shaft_quoins'; q.userData.role = 'stone'; q.castShadow = q.receiveShadow = true; const m4q = new THREE.Matrix4(), qc = ['#efe2c8', '#e4d2b0', '#f4ead6', '#dccaa6'].map(col); let n = 0;
    for (const [cx, cy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let k = 0; k < 62 && n < QN; k++) { const z = BZ - 3.3 - .25 - k * .48, long = k % 2 === 0, lx = long ? .62 : .36, ly = long ? .36 : .62;
      m4q.compose(V(cx * (1.575 - lx / 2 + .03), cy * (1.575 - ly / 2 + .03), z), new THREE.Quaternion(), new THREE.Vector3(lx, .42, ly)); q.setMatrixAt(n, m4q); q.setColorAt(n, qc[(k * 7 + cx + 2 * cy + 9) % 4]); n++; }
    q.count = n; q.instanceMatrix.needsUpdate = true; if (q.instanceColor) q.instanceColor.needsUpdate = true; tower.add(q); }
  { const pts = [[.02, 0], [.16, .02], [.3, .1], [.4, .3], [.46, .55], [.6, .78], [.7, .82]].map(([r, y]) => new THREE.Vector2(r, -y)); const bell = add(new THREE.LatheGeometry(pts, 20), M.bronze, 'belfry_bell', 'metal', V(0, 0, BZ - .9), tower); bell.material.side = THREE.DoubleSide;
    add(new THREE.BoxGeometry(2.3, .18, .18), M.wood, 'bell_yoke', 'wood', V(0, 0, BZ - .8), tower); add(new THREE.SphereGeometry(.1, 10, 8), M.ironDk, 'bell_clapper', 'metal', V(0, 0, BZ - 1.75), tower); }

  // ---------- THE SPEAR (the lightning rod) on the peak: the hero object ----------
  const sp = new THREE.Group(); sp.name = 'spear_lightning_rod'; scene.add(sp); const S = SPEAR, sx = S.x, sy = S.y;
  add(new THREE.CylinderGeometry(.21, .27, .3, 8), M.stone, 'finial_block', 'stone', V(sx, sy, APEX[2] + .08), sp); add(new THREE.CylinderGeometry(.15, .2, .1, 8), M.stoneSh, 'finial_neck', 'stone', V(sx, sy, APEX[2] + .28), sp); add(new THREE.TorusGeometry(.215, .035, 8, 16), M.stone, 'finial_moulding', 'stone', V(sx, sy, APEX[2] + .22), sp).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(.265, .03, 8, 16), M.stoneSh, 'finial_moulding_low', 'stone', V(sx, sy, APEX[2] - .04), sp).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(.13, .03, 8, 14), M.ironDk, 'finial_iron_band', 'metal', V(sx, sy, APEX[2] + .34), sp).rotation.x = Math.PI / 2;
  let heroSpear = null;
  if (PB) {   // S1 v2: THE HERO SPEAR from hero_props.js (forged square/octagon/round shaft with forge scale, two bolted collars, the hooked eye, socket, leaf point with mid-rib and bright ground edges, finial clamp band with straps and wedges, two stays with clevis pins and bolted feet)
    heroSpear = HP.buildSpear(THREE, ctx, {}); heroSpear.group.position.copy(V(sx, sy, S.base)); sp.add(heroSpear.group);
    // the point turned a little toward the low sun (screen-left behind the lens) so its flat catches the key and the cold glint reads against the storm
    heroSpear.group.updateMatrixWorld(true); const pt = new THREE.Group(); pt.name = 'spear_point_turn'; heroSpear.group.add(pt); const move = []; heroSpear.group.children.forEach(o => { if (o !== pt && /^spear_(point_|socket|neck)/.test(o.name) || o === heroSpear.glint) move.push(o); }); move.forEach(o => pt.attach(o));
    pt.rotation.y = pl.blade_turn ?? -.42;
    heroSpear.group.traverse(o => { if (o.isMesh && o.material && /point_leaf_blade|ground_edge/.test(o.name)) { o.material = o.material.clone(); o.material.envMapIntensity = 3.2; if (/blade/.test(o.name)) o.material.color.setRGB(.72, 1.0, 1.75); } });
    add(new THREE.CylinderGeometry(.04, .04, .02, 8), M.glint, 'spear_nail_head', 'metal', V(sx - .298, sy - .03, roofZ(-.34, 0) + .178), sp); bar([sx - .34, sy - .03, roofZ(-.34, 0) + .02], [sx - .3, sy - .03, roofZ(-.34, 0) + .17], .016, M.iron, 'spear_bracket_nail', 'metal', .016, sp, 6);
  } else {
  bar([sx, sy, S.base], [sx, sy, S.shaftTop], .026, M.iron, 'spear_shaft', 'metal', .022, sp);
  bar([sx - .012, sy - .022, S.base + .2], [sx - .012, sy - .022, S.shaftTop], .007, M.glint, 'spear_shaft_glint', 'metal', .006, sp, 6);      // the low sun along the lit edge
  for (const z of [S.base + .36, S.base + .78]) { add(new THREE.TorusGeometry(.045, .017, 8, 16), M.ironDk, 'spear_strap_collar', 'metal', V(sx, sy, z), sp).rotation.x = Math.PI / 2;   // two strap collars round the shaft
    add(new THREE.SphereGeometry(.02, 8, 6), M.glint, 'spear_collar_bolt', 'metal', V(sx - .03, sy - .055, z), sp); add(new THREE.SphereGeometry(.02, 8, 6), M.glint, 'spear_collar_bolt', 'metal', V(sx + .04, sy - .05, z), sp); }
  // the bracket: a forged iron stay from the upper collar down to the roof on each side, flattened feet with bolts; the big nail the hammer is driving
  for (const s of [-1, 1]) { bar([sx + s * .045, sy - .01, S.base + .78], [sx + s * .5, sy - .02, roofZ(s * .5, 0) + .02], .02, M.ironDk, 'spear_bracket_stay', 'metal', .02, sp, 6);
    const foot = add(new THREE.BoxGeometry(.22, .03, .1), M.iron, 'spear_bracket_foot', 'metal', V(sx + s * .56, sy - .02, roofZ(s * .56, 0) + .02), sp); foot.rotation.z = -s * Math.atan(SL);
    for (const o of [-.06, .06]) add(new THREE.SphereGeometry(.022, 8, 6), M.glint, 'spear_bracket_bolt', 'metal', V(sx + s * (.56 + o), sy - .03, roofZ(s * (.56 + o), 0) + .045), sp); }
  bar([sx - .34, sy - .03, roofZ(-.34, 0) + .02], [sx - .3, sy - .03, roofZ(-.34, 0) + .17], .016, M.iron, 'spear_bracket_nail', 'metal', .016, sp, 6); add(new THREE.CylinderGeometry(.04, .04, .02, 8), M.glint, 'spear_nail_head', 'metal', V(sx - .298, sy - .03, roofZ(-.34, 0) + .178), sp);
  // the forged leaf tip: a socket collar, a flat leaf blade with a mid rib, a needle point
  add(new THREE.CylinderGeometry(.03, .042, .16, 10), M.ironDk, 'spear_tip_socket', 'metal', V(sx, sy, S.shaftTop + .06), sp); add(new THREE.TorusGeometry(.04, .014, 8, 14), M.glint, 'spear_tip_ring', 'metal', V(sx, sy, S.shaftTop - .01), sp).rotation.x = Math.PI / 2;
  { const blade = add(new THREE.ConeGeometry(.105, S.tip - S.shaftTop - .12, 4, 1), M.blade, 'spear_tip_blade', 'metal', V(sx, sy, (S.tip + S.shaftTop + .12) / 2), sp); blade.scale.set(1, 1, .3); blade.rotation.y = Math.PI / 4 * 0;
    const low = add(new THREE.ConeGeometry(.105, .13, 4, 1), M.blade, 'spear_tip_blade_low', 'metal', V(sx, sy, S.shaftTop + .12 - .065 + .001), sp); low.scale.set(1, -1, .3);
    bar([sx - .003, sy - .034, S.shaftTop + .08], [sx - .003, sy - .012, S.tip - .03], .011, M.glint, 'spear_tip_rib_glint', 'metal', .002, sp, 6); }
  }
  // the round ink fist ON the shaft (the cast's fist, as the kit draws it): place given by film.json places.<name>.fist after the hands are measured
  const fist = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#2a1a1f' })); fist.name = 'spear_fist'; fist.userData.noExport = true; fist.visible = false; scene.add(fist);
  const fistIn = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#fbf6ee' })); fistIn.name = 'spear_fist_fill'; fistIn.userData.noExport = true; fistIn.visible = false; scene.add(fistIn);
  if (pl.fist) { const r = pl.fist_r || .036; fist.visible = fistIn.visible = true; fist.position.copy(V(pl.fist[0], pl.fist[1] - .012, pl.fist[2])); fist.scale.setScalar(r); fistIn.position.copy(V(pl.fist[0], pl.fist[1] - .024, pl.fist[2])); fistIn.scale.setScalar(r * .8); }

  // ---------- THE TOWN 31 m below: yellow houses, terracotta gable roofs, green shutters, the piazza ----------
  const town = new THREE.Group(); town.name = 'town'; scene.add(town);
  add(new THREE.CircleGeometry(640, 48), RF('grass', '#6fae3e', { scale: 9, seed: 2 }, toon('#6fae3e')), 'valley_ground', 'ground', V(0, 0, TOWN_Z - .05), town).rotation.x = -Math.PI / 2;
  const prism = (() => { const g = new THREE.BufferGeometry(), v = [-.5, 0, .5, .5, 0, .5, 0, 1, .5, -.5, 0, -.5, .5, 0, -.5, 0, 1, -.5], idx = [0, 1, 2, 4, 3, 5, 0, 2, 5, 0, 5, 3, 1, 4, 5, 1, 5, 2, 0, 3, 4, 0, 4, 1]; g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); const ng = g.toNonIndexed(); ng.computeVertexNormals(); { const P = ng.attributes.position, uv = new Float32Array(P.count * 2); for (let i = 0; i < P.count; i++) { uv[i * 2] = P.getX(i) + .5 + (Math.abs(P.getZ(i)) > .49 ? 0 : 0); uv[i * 2 + 1] = P.getY(i) * 1.6 + P.getZ(i); } ng.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); ng.userData.k3uvDone = true; } return ng; })();
  const NH = 420, walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), repK(RF('plaster', '#ffffff', { seed: 3 }, toon('#ffffff', { map: mapRep(PLT, 1.4, 1.2) })), 2.5), NH), roofs = new THREE.InstancedMesh(prism, repK(RF('tile', '#ffffff', { seed: 7 }, toon('#ffffff', { side: THREE.DoubleSide })), 4), NH), shut = new THREE.InstancedMesh(new THREE.BoxGeometry(.95, 1.45, .12), toon('#ffffff'), NH * 4);
  walls.name = 'town_walls'; walls.userData.role = 'plaster'; roofs.name = 'town_roofs'; roofs.userData.role = 'roof'; shut.name = 'town_shutters'; shut.userData.role = 'wood';
  const wcols = ['#f4c542', '#f7d264', '#efb23a', '#f2a65a', '#f9dc8a', '#eebb4e'].map(col), rcols = ['#e0602a', '#d2521f', '#ea7436', '#c9491c', '#e56a30'].map(col), scols = ['#2f8a4e', '#2a7a66', '#7a3a26', '#3a8f5a'].map(col);
  const ROAD = [[6, 67], [53, 260]], roadDist = (x, y) => { const [a, b] = ROAD, dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy); };   // S4's white road (square.js) from the square to the rival hill
  const PZ = { x0: 22, x1: 60, y0: 186, y1: 222 }, m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), yAx = new THREE.Vector3(0, 1, 0); let nh = 0, ns = 0;
  for (let y = 52; y < 290 && nh < NH; y += 11.5) { const span = .34 * y + 34; for (let x = -span; x < span && nh < NH; x += rr(9.2, 11.5)) {
      const hx = x + rr(-.8, .8), hy = y + rr(-1.2, 1.2); if (hx > PZ.x0 - 5 && hx < PZ.x1 + 5 && hy > PZ.y0 - 5 && hy < PZ.y1 + 5) continue; if (Math.hypot(hx - RIVAL.x, hy - RIVAL.y) < 60) continue; if (hx > STREET.x0 - 8 && hx < STREET.x1 + 8 && hy > STREET.y0 - 12 && hy < STREET.y1 + 14) continue; if (roadDist(hx, hy) < 9.5) continue;
      const w = rr(7, 9.6), d = rr(7.5, 10), h = rr(6, 11.5), turn = R0() < .5 ? 0 : Math.PI / 2, gz = TOWN_Z; qq.setFromAxisAngle(yAx, turn);
      m4.compose(V(hx, hy, gz + h / 2), qq, new THREE.Vector3(w, h, d)); walls.setMatrixAt(nh, m4); walls.setColorAt(nh, pick(wcols));
      m4.compose(V(hx, hy, gz + h), qq, new THREE.Vector3(w + .9, rr(1.8, 2.8), d + .9)); roofs.setMatrixAt(nh, m4); roofs.setColorAt(nh, pick(rcols));
      const sw = turn ? d : w, sd = turn ? w : d, sc = pick(scols); for (const fx of [-.26, .26]) for (const fz of [.42, .78]) { if (fz * h + 1 > h - .6 && fz > .5) continue; m4.compose(V(hx + fx * sw, hy - sd / 2 - .03, gz + fz * h), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)); shut.setMatrixAt(ns, m4); shut.setColorAt(ns, sc); ns++; }
      nh++; } }
  walls.count = roofs.count = nh; shut.count = ns; for (const im of [walls, roofs, shut]) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; town.add(im); }
  // the piazza: pale paving, a fountain, the tiny townsfolk looking up, two striped market awnings
  add(new THREE.BoxGeometry(PZ.x1 - PZ.x0, .12, PZ.y1 - PZ.y0), M.pave, 'piazza_paving', 'ground', V((PZ.x0 + PZ.x1) / 2, (PZ.y0 + PZ.y1) / 2, TOWN_Z + .06), town);
  add(new THREE.CylinderGeometry(3.2, 3.4, .9, 16), M.stone, 'fountain_basin', 'stone', V(46, 206, TOWN_Z + .5), town); add(new THREE.CylinderGeometry(2.8, 2.8, .1, 16), MT('wet', { color: '#3a7ab0', seed: 2 }, toon('#3aa0d8')), 'fountain_water', 'water', V(46, 206, TOWN_Z + .96), town); add(new THREE.CylinderGeometry(.5, .7, 3.2, 10), M.stoneSh, 'fountain_post', 'stone', V(46, 206, TOWN_Z + 2), town);
  { const bcols = ['#c8372f', '#2f6fb8', '#7a4a9a', '#2f8a4e', '#e2a93b', '#3a3050']; for (let i = 0; i < 11; i++) { const px = 27 + rr(0, 14), py = 190 + rr(0, 12), g = new THREE.Group(); g.name = 'townsfolk_tiny'; g.position.copy(V(px, py, TOWN_Z + .12)); town.add(g);
      add(new THREE.ConeGeometry(.48, 1.25, 8), toon(i === 0 ? '#2a2630' : bcols[i % 6]), 'townsfolk_body', 'cloth', new THREE.Vector3(0, .62, 0), g); add(new THREE.SphereGeometry(i === 0 ? .42 : .34, 10, 8), toon('#fbf6ee'), 'townsfolk_head', 'cloth', new THREE.Vector3(0, 1.5, 0), g);
      g.scale.multiplyScalar(1.5); if (i === 0) g.scale.set(2.6, 1.8, 2.6); } }                                                        // the fat priest in black, in front of the others
  for (const [ax, ay] of [[52, 192], [26, 216]]) for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(.9, .12, 4), toon(i % 2 ? '#fbf6ee' : '#d8372f'), 'market_awning_stripe', 'cloth', V(ax + i * .9, ay, TOWN_Z + 2.8), town).rotation.x = .25;
  // fields beyond the houses, hills, a far ridge
  for (const [x, y, w, d, c] of [[-150, 330, 130, 70, '#8fc046'], [-40, 345, 90, 60, '#d9c24a'], [150, 340, 110, 60, '#5d9f3e'], [-230, 250, 90, 120, '#a8c84a'], [240, 250, 100, 130, '#7fb43c']]) add(new THREE.BoxGeometry(w, .1, d), RF('grass', c, { scale: 7, seed: Math.round(w) }, toon(c)), 'field', 'ground', V(x, y, TOWN_Z + .02), town);
  const hill = (x, y, top, rx, ry, c, name) => { const hgt = top - TOWN_Z, m = add(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), RF('grass', c, { scale: 18, seed: 5 }, toon(c)), name, 'foliage', V(x, y, TOWN_Z - .2), town); m.scale.set(rx, hgt, ry); m.castShadow = false; return m; };
  hill(RIVAL.x + 4, RIVAL.y + 14, RIVAL.base + .5, 105, 70, '#4c9a44', 'hill_rival'); hill(-150, 400, -9, 190, 90, '#3f8a52', 'hill_west'); hill(-40, 470, -3, 240, 80, '#4a6fa8', 'hill_far_mid'); hill(250, 440, -6, 200, 90, '#4a7f6a', 'hill_east'); hill(-330, 330, -4, 150, 110, '#3f7f5a', 'hill_far_west');
  // ---------- THE RIVAL'S TOWER: taller, white marble, a gold angel on top, cypresses at its foot ----------
    const rt = new THREE.Group(); rt.name = 'rival_tower'; rt.position.copy(V(RIVAL.x, RIVAL.y, RIVAL.base)); scene.add(rt); const H = RIVAL.top - RIVAL.base;
  add(new THREE.BoxGeometry(11, H * .68, 11), M.marble, 'rival_shaft', 'stone', new THREE.Vector3(0, H * .34, 0), rt);
  for (const f of [.2, .4, .58]) add(new THREE.BoxGeometry(10.8, .9, 10.8), M.marbleSh, 'rival_band', 'stone', new THREE.Vector3(0, H * f, 0), rt);
  add(new THREE.BoxGeometry(11.6, 1.4, 11.6), M.marble, 'rival_cornice', 'stone', new THREE.Vector3(0, H * .685, 0), rt); add(new THREE.BoxGeometry(9, H * .14, 9), M.marble, 'rival_belfry', 'stone', new THREE.Vector3(0, H * .765, 0), rt);
  for (const s of [-2.2, 2.2]) add(new THREE.BoxGeometry(2.2, H * .095, .5), M.dark, 'rival_belfry_arch', 'stone', new THREE.Vector3(s, H * .76, 4.5), rt);
  add(new THREE.BoxGeometry(10.6, 1.2, 10.6), M.marbleSh, 'rival_cornice_top', 'stone', new THREE.Vector3(0, H * .84, 0), rt);
  const spire = add(new THREE.ConeGeometry(6.2, H * .1, 4, 1), RF('wood', '#9a6a44', { scale: 2.2, seed: 4 }, M.marble), 'rival_spire', 'stone', new THREE.Vector3(0, H * .895, 0), rt); spire.rotation.y = Math.PI / 4;
  if (PB) { const a = new THREE.Group(); a.name = 'rival_gold_angel'; a.position.set(0, H * .945 - .6, 0); rt.add(a); const ga = HP.buildAngel(THREE, ctx, { far: true }); ga.group.scale.setScalar(pl.angel_k ?? 1.6); a.add(ga.group); }   // S1 v2: the detailed gilt angel (hero_props), 2.9 m x angel_k so it reads from the hero tower 300 m away
  else { const a = new THREE.Group(); a.name = 'rival_gold_angel'; a.position.set(0, H * .945, 0); a.scale.setScalar(1.7); rt.add(a); const G = M.gold;
    add(new THREE.SphereGeometry(.9, 10, 8), G, 'angel_ball', 'metal', new THREE.Vector3(0, 0, 0), a); add(new THREE.ConeGeometry(1.15, 3.1, 10), G, 'angel_robe', 'metal', new THREE.Vector3(0, 2.3, 0), a); add(new THREE.SphereGeometry(.62, 10, 8), G, 'angel_head', 'metal', new THREE.Vector3(0, 4.3, 0), a);
    for (const s of [-1, 1]) { const w = add(new THREE.SphereGeometry(1, 10, 8), G, 'angel_wing', 'metal', new THREE.Vector3(s * 1.25, 3.5, -.2), a); w.scale.set(.75, 1.7, .25); w.rotation.z = -s * .5; }
    const tr = add(new THREE.CylinderGeometry(.1, .3, 2.4, 8), G, 'angel_trumpet', 'metal', new THREE.Vector3(-1.2, 4.5, .3), a); tr.rotation.z = 1.1; }
  if (!TR) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .3, r = 14 + (i % 3) * 5, hc = 9 + (i % 4) * 2.2; add(new THREE.ConeGeometry(1.9, hc, 8), M.cyp, 'rival_cypress', 'foliage', new THREE.Vector3(Math.cos(a) * r, hc / 2 - 2 - r * .12, Math.sin(a) * r * .6), rt); }

  // ---------- S1 v2: TREES (kit trees: bark trunks with forks, many lit leaf clusters) in groups and lines: cypresses round the rival's tower and up the white road,
  // olive terraces on the rival's hill and the west hill, a cypress clump on the east hill; far trees cast no shadow (outside the sun's box anyway) ----------
  const hillZ = (x, y, cx, cy, rx, ry, top) => TOWN_Z - .2 + (top - TOWN_Z) * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2));
  const hz = (x, y) => Math.max(TOWN_Z, hillZ(x, y, RIVAL.x + 4, RIVAL.y + 14, 105, 70, RIVAL.base + .5), hillZ(x, y, -150, 400, 190, 90, -9), hillZ(x, y, 250, 440, 200, 90, -6));
  const farTrees = new THREE.Group(); farTrees.name = 'far_trees'; scene.add(farTrees);
  const tree = (kind, x, y, h, seed, name, o = {}) => { if (!TR) return null; const t = ctx.trees.tree({ kind, at: [x, y, hz(x, y) - .3], height: h, seed, parent: farTrees, ...o }); t.name = name; t.traverse(m => { if (m.isMesh) m.castShadow = false; }); return t; };
  if (TR) { let sd = 40;
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + .3, r = 15 + (i % 3) * 5; tree('cypress', RIVAL.x + Math.cos(a) * r, RIVAL.y - Math.sin(a) * r * .6, 11 + (i % 4) * 2.4, sd++, 'rival_cypress', { perCl: 40, leafSize: .5 }); }
    for (let k = 0; k < 9; k++) { const u = .42 + k * .066, x = ROAD[0][0] + (ROAD[1][0] - ROAD[0][0]) * u, y = ROAD[0][1] + (ROAD[1][1] - ROAD[0][1]) * u; for (const sgn of [-1, 1]) tree('cypress', x + sgn * 4.6, y - sgn * 1.1, 9 + ((k + (sgn > 0 ? 1 : 0)) % 3) * 1.6, sd++, 'road_cypress', { perCl: 36, leafSize: .5 }); }
    for (let row = 0; row < 3; row++) for (let i = 0; i < 8; i++) { const x = RIVAL.x - 62 + i * 13 + (row % 2) * 6, y = RIVAL.y - 52 + row * 11; if (Math.hypot(x - RIVAL.x, y - RIVAL.y) < 24 || roadDist(x, y) < 7) continue; tree('olive', x, y, 6.5, sd++, 'hill_olive', { perCl: 30, leafSize: .5 }); }
    for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) tree('olive', -205 + i * 16 + row * 7, 322 + row * 13, 7, sd++, 'hill_olive', { perCl: 28, leafSize: .55 });
    for (let i = 0; i < 7; i++) tree('cypress', -112 + i * 6 + (i % 2) * 2, 318 + (i % 3) * 5, 12 + (i % 3) * 2, sd++, 'hill_cypress', { perCl: 34, leafSize: .55 });
    for (let i = 0; i < 6; i++) tree('cypress', 168 + i * 7, 368 + (i % 2) * 6, 13 + (i % 3) * 2, sd++, 'hill_cypress', { perCl: 34, leafSize: .55 }); }
  { const [a, b] = ROAD, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), rd = add(new THREE.BoxGeometry(5.2, .08, L), RF('stone', '#eadfc6', { scale: 3, seed: 11 }, toon('#eadfc6')), 'white_road', 'ground', V((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, TOWN_Z + .05), town); rd.rotation.y = Math.atan2(dx, -dy); }

  // ================= S1 BOARD ADDITIONS (stretch builder S1, 2026-11-15) =================
  // Switched by film.json places.<name>.s1 = { flash_f, hits_roof: [f...], hits_wall: [f...], t: {...} }. WITHOUT that key the set stands in its END state
  // (the wire run complete down to the earth, shutters shut, no rope, no thumb, no flash) so the other stretches get the finished tower.
  const S1 = pl.s1 || null, Bx = (a, b, c) => new THREE.BoxGeometry(a, b, c), basic = c => new THREE.MeshBasicMaterial({ color: c });
  const SNP = [0, .05, .16, .31, .48, .66, .79, .88, .93, .96, .98, .99, 1], snp = (f, n = 12) => { if (f <= 0) return 0; const u = f * 12 / n; if (u >= 12) return 1; const i = Math.floor(u); return SNP[i] + (SNP[i + 1] - SNP[i]) * (u - i); };
  // ---------- the storm wall with VOLUME: three layers of soft billows in front of the painted dome ----------
  const cloudU = { uFlash: { value: 0 }, flashP: { value: V(70, 470, 120) }, sunD: { value: sunD } };
  const cloudMat = (dk, md, hi) => new THREE.ShaderMaterial({ fog: false, uniforms: { uFlash: cloudU.uFlash, flashP: cloudU.flashP, sunD: cloudU.sunD, cD: { value: col(dk) }, cM: { value: col(md) }, cH: { value: col(hi) } },
    vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 cD, cM, cH, flashP, sunD; uniform float uFlash; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 n = vN / max(length(vN), 1e-4); vec3 vv = cameraPosition - vW; vec3 v = vv / max(length(vv), 1e-3);
        float up = n.y * .5 + .5, rim = 1. - abs(dot(n, v)), sun = clamp(dot(n, sunD) * .5 + .5, 0., 1.);
        vec3 c = mix(cD, cM, smoothstep(.25, .7, up)); c = mix(c, cH, smoothstep(.7, 1., up) * .85);
        c = mix(c, vec3(.80, .12, .16), sun * sun * sun * .32);
        c = mix(c, cM * 1.3, rim * rim * .5);
        float d = length(vW - flashP); c += vec3(.55, .60, 1.) * uFlash * (1.6 * exp(-d / 80.) + .10);
        gl_FragColor = vec4(c, 1.); }` });
  // S1 v2: the kit's lit soft cloud layers (dusk-storm, made HEAVY: dense, dark bellies, burnt-orange lit sides toward the low sun, a high canopy), named like the v1 billows so other sets still hide them by name
  const kitCloudMats = [];
  if (SK) { const cg = new THREE.Group(); cg.name = 'storm_cloud_billows'; cg.userData.noExport = true; scene.add(cg);
    if (pl.sky_mode === 'kit') {   // final pass comparison: the kit's own dusk-storm (painted per pixel on the kit dome) instead of the hook's dome + sprite layers
      skyDome.visible = false; const kc = ctx.sky.clouds({ kind: 'dusk-storm', seed: pl.cloud_seed ?? 23, ...(pl.sky_opts || {}) }); cg.add(kc); }
    else {
    // all cloud layers stand BEYOND the rival's tower (300 m) so it stays readable; low band: the storm wall's foot, its bellies burning orange in the low sun
    const low = ctx.sky.clouds({ kind: 'dusk-storm', dome: false, seed: pl.cloud_seed ?? 23, coverage: 2.2, scale: 1.5, minEl: 1.5, maxEl: 9, layers: [{ d: 360, fade: .1, size: 1.2 }, { d: 440, fade: .28, size: 1.3 }],
      colors: { lit: '#ff9a6e', shade: '#4a2a5c', rim: '#ffd09a', hor: '#b86e8a', dark: .45, flat: .4, n: [14, 16, 16] } });
    // high: the heavy purple mass and the canopy overhead, lit edges only
    const high = ctx.sky.clouds({ kind: 'dusk-storm', dome: false, seed: (pl.cloud_seed ?? 23) + 7, coverage: 2.4, scale: 1.8, minEl: 9, maxEl: 24, layers: [{ d: 400, fade: .12, size: 1.3 }, { d: 480, fade: .3, size: 1.4 }, { d: 200, fade: .05, size: 1.8, n: 18, el: [24, 50], canopy: true }],
      colors: { lit: '#9060a8', shade: '#2a1a4c', rim: '#ffa878', hor: '#a8648a', dark: .5, flat: .3, n: [14, 16, 16] } });
    for (const kc of [low, high]) { cg.add(kc); kc.traverse(o => { if (o.isMesh && o.material && o.material.uniforms && o.material.uniforms.lit) kitCloudMats.push({ m: o.material, lit: o.material.uniforms.lit.value.clone(), shade: o.material.uniforms.shade.value.clone() }); }); } } }
  if (!SK) { const clouds = new THREE.Group(); clouds.name = 'storm_cloud_billows'; clouds.userData.noExport = true; scene.add(clouds); const g = new THREE.IcosahedronGeometry(1, 3);
    const LY = [[500, ['#2a1458', '#5a34a0', '#a585e6'], 24, 92, 240], [450, ['#231050', '#4a2890', '#8a66d6'], 20, 72, 150], [400, ['#1c0c44', '#3c2080', '#7350c4'], 17, 52, 80]];
    for (const [y, cs, n, r, top] of LY) { const m = cloudMat(...cs); for (let i = 0; i < n; i++) { const x = -265 + 530 * (i + rr(-.3, .3)) / (n - 1), k = rr(.75, 1.3), ry = r * k * rr(.7, 1), z = 34 + ry + rr(0, 1) * rr(0, 1) * top + (i % 3 === 0 ? top * .5 : 0);
        const b = new THREE.Mesh(g, m); b.name = 'storm_billow'; b.position.copy(V(x, y + rr(-15, 15), z)); b.scale.set(r * k * rr(1, 1.5), ry, r * k); b.frustumCulled = false; clouds.add(b); } } }
  // ---------- "church": a stone cross on a pinnacle at each south corner of the roof; storey bands, slit windows and a plinth on the shaft ----------
  for (const s of [-1, 1]) { const px = s * 1.72, py = -1.72, pz = APEX[2] - RISE - .02; add(Bx(.34, .5, .34), M.stone, 'corner_pinnacle', 'stone', V(px, py, pz + .25), tower); add(new THREE.ConeGeometry(.27, .3, 4), M.stoneSh, 'corner_pinnacle_cap', 'stone', V(px, py, pz + .65), tower).rotation.y = Math.PI / 4;
    add(Bx(.1, .66, .1), M.stone, 'pinnacle_cross_post', 'stone', V(px, py, pz + 1.08), tower); add(Bx(.42, .1, .1), M.stone, 'pinnacle_cross_arm', 'stone', V(px, py, pz + 1.2), tower); }
  const SHAFT_TOP = BZ - 3.3; for (let k = 1; k <= 6; k++) { add(Bx(3.32, .16, 3.32), M.stoneSh, 'shaft_storey_band', 'stone', V(0, 0, SHAFT_TOP - k * 4.4), tower); if (k % 2) add(Bx(.3, 1.0, .08), M.dark, 'shaft_slit_window', 'glass', V(-.55, WALL_Y - .01, SHAFT_TOP - k * 4.4 + 2.2), tower); }
  add(Bx(3.6, 1.1, 3.6), M.stone, 'shaft_plinth', 'stone', V(0, 0, TOWN_Z + .55), tower); add(Bx(3.75, .14, 3.75), M.stoneSh, 'shaft_plinth_cap', 'stone', V(0, 0, TOWN_Z + 1.12), tower);
  // ---------- the bracket eye and THE WIRE: over the tiles of the south face, over the eave, down the pier and the wall, into the earth ----------
  if (!heroSpear) add(new THREE.TorusGeometry(.04, .012, 8, 14), M.ironDk, 'bracket_eye', 'metal', V(EYE[0], EYE[1] - .005, EYE[2]), sp); if (!heroSpear) add(new THREE.TorusGeometry(.047, .006, 6, 14, Math.PI * .9), M.glint, 'bracket_eye_glint', 'metal', V(EYE[0] - .004, EYE[1] - .02, EYE[2] + .004), sp).rotation.z = .5; if (!heroSpear) bar([.008, EYE[1] + .01, EYE[2]], [EYE[0] - .04, EYE[1] - .005, EYE[2]], .012, M.iron, 'bracket_eye_stem', 'metal', .012, sp, 6);   /* fix round 2: the eye on a forged stem off the shaft, a lit edge so it reads */
  const wireG = new THREE.Group(); wireG.name = 'spear_wire_run'; scene.add(wireG); const WT = BZ - .5, WY = WALL_Y - .04, TS = 64, PW = .14;
  const rp = [[EYE[0], EYE[1] - .03, EYE[2]], [.1, -.21, .86], [.15, -.36, .6], [.22, -.5, roofZ(.22, -.5) + .035], [.42, -1.0, roofZ(.42, -1) + .035], [.9, -1.85, roofZ(.9, -1.85) + .035], [WIRE_X, -2.08, APEX[2] - RISE - .12], [WIRE_X, -1.92, APEX[2] - RISE - .62], [WIRE_X, WY, WT]].map(p => V(...p));
  let heroWire = null, roofWire;
  if (PB) { heroWire = HP.buildWire(THREE, ctx, { points: rp, radius: .017, name: 'spear_wire', maxSeg: 1800 }); wireG.add(heroWire.group); roofWire = heroWire.group;
    const roofN = [0, 1, SL]; for (const [x, y] of [[.42, -1.0], [.9, -1.85]]) { const P0 = V(x, y, roofZ(x, y) + .035); let bu = 0, bd = 1e9; for (let i = 0; i <= 200; i++) { const dd = heroWire.curve.getPointAt(i / 200).distanceTo(P0); if (dd < bd) { bd = dd; bu = i / 200; } } heroWire.staple(bu, roofN); }
    heroWire.group.traverse(o => { if (o.isMesh && o.material && o.material.isMeshPhysicalMaterial && !o.material.userData.s1rim) { o.material.sheen = 1; o.material.sheenColor = new THREE.Color('#b9a8ff'); o.material.sheenRoughness = .35; o.material.userData.s1rim = 1; } }); }
  else roofWire = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp, false, 'catmullrom', .15), TS, .017, 7), M.ironDk, 'spear_wire', 'metal', null, wireG);
  // fix round 2: the wire's hooked end goes THROUGH the bracket eye and bends back (row 5 "wire": the hook must read)
  const wireHook = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[EYE[0], EYE[1] - .03, EYE[2]], [EYE[0], EYE[1] + .01, EYE[2] + .012], [EYE[0], EYE[1] + .045, EYE[2] - .01], [EYE[0] + .005, EYE[1] + .03, EYE[2] - .055], [EYE[0] + .01, EYE[1] - .005, EYE[2] - .07]].map(p => V(...p))), 16, .017, 7), wireMat, 'spear_wire_hook', 'metal', null, wireG);
  // fix round 3 (row 5 medium close): the first run of the wire from the eye, a little thicker, with a pale edge, so wire and thumb read as the same thickness on a phone; shown only f140-212
  const r5 = new THREE.Group(); r5.name = 'row5_wire_edge'; r5.userData.noExport = true; scene.add(r5); r5.visible = false; { const c5 = new THREE.CatmullRomCurve3(rp.slice(0, 4), false, 'catmullrom', .15), h5 = wireHook.geometry.parameters.path;
    for (const [cv, segs, rw] of [[c5, 24, .027], [h5, 16, .023]]) { r5.add(new THREE.Mesh(new THREE.TubeGeometry(cv, segs, rw, 8), M.ironDk)); const e = new THREE.Mesh(new THREE.TubeGeometry(cv, segs, rw + .007, 8), new THREE.MeshBasicMaterial({ color: '#f3e4c8', side: THREE.BackSide })); r5.add(e); } }
  const wallWire = add(new THREE.CylinderGeometry(.022, .022, 1, 10), wireMat, 'spear_wire_wall', 'metal', null, wireG);
  const ZLOW = TOWN_Z + 1.2, setWall = zEnd => { const L = Math.max(.001, WT - zEnd); wallWire.scale.set(1, L, 1); wallWire.position.copy(V(WIRE_X, WY, WT - L / 2)); wallWire.visible = L > .02; };
  const footWire = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[WIRE_X, WY, ZLOW + .02], [WIRE_X, -1.9, ZLOW - .1], [WIRE_X, -1.84, ZLOW - .4], [WIRE_X, -1.84, TOWN_Z + .35], [WIRE_X, -2.02, TOWN_Z + .1], [WIRE_X, -2.05, TOWN_Z - .12]].map(p => V(...p))), 24, .017, 8), wireMat, 'spear_wire_foot', 'metal', null, wireG);
  const stapleGeo = new THREE.TorusGeometry(.036, .009, 6, 10, Math.PI), stapleMat = MT('iron', { color: '#9aa6c0', rough: .25, seed: 17 }, M.glint), mkStaple = p => add(stapleGeo, stapleMat, 'spear_wire_staple', 'metal', V(...p), wireG);
  const roofStaples = heroWire ? [] : [[.42, -1.0, roofZ(.42, -1) + .035], [.9, -1.85, roofZ(.9, -1.85) + .035]].map(mkStaple), wallStaples = [];
  if (!S1) for (let k = 0; k < 6; k++) mkStaple([WIRE_X, WY - .01, WT - 1.5 - k * 4.4]).rotation.x = Math.PI / 2;
  // ---------- the mason's rope with its stirrup bar, his coil of wire ----------
  const rope = add(new THREE.CylinderGeometry(.014, .014, 1, 6), toon('#d8b878'), 'mason_rope', 'cloth', null, scene), stirrup = add(Bx(.5, .05, .08), M.wood, 'mason_rope_stirrup', 'wood', null, scene); rope.visible = stirrup.visible = false; const RT = BZ - 3.0;
  add(Bx(.14, .14, 1.9), M.wood, 'mason_rope_beam', 'wood', V(.55, -1.75, RT + .07), tower);   // the putlog beam out of the belfry arch that carries his rope
  const flashL = new THREE.AmbientLight('#cfd8ff', 0); flashL.name = 'storm_flash_light'; scene.add(flashL);
  const coil = new THREE.Group(); coil.name = 'wire_coil'; scene.add(coil); if (PB) { const hc = HP.buildWireCoil(THREE, ctx, { r: .15 }); hc.group.name = 'wire_coil_hero'; coil.add(hc.group); } else for (let i = 0; i < 4; i++) { const t = add(new THREE.TorusGeometry(.15 + (i % 2) * .012, .017, 7, 20), M.ironDk, 'wire_coil_turn', 'metal', new THREE.Vector3(0, 0, i * .03 - .045), coil); t.rotation.y = (i - 1.5) * .05; }
  // ---------- the cold blue-white spark (hammer hits) and the glint on the spear tip ----------
  const mkStar = (name, len) => { const g = new THREE.Group(); g.name = name; g.userData.noExport = true; const m = basic('#bfe6ff'); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(Bx(len, len * .07, len * .07), m); b.rotation.z = i * Math.PI / 4; if (i % 2) b.scale.x = .6; g.add(b); } g.add(new THREE.Mesh(new THREE.SphereGeometry(len * .12, 10, 8), basic('#ffffff'))); g.visible = false; scene.add(g); return g; };
  const spark = mkStar('hammer_spark', .34), glintStar = mkStar('spear_tip_glint', .2); glintStar.position.copy(V(S.x, S.y - .04, S.tip - .03));
  const anchorNail = [S.x - .298, S.y - .03, roofZ(-.34, 0) + .178];
  // ---------- his THUMB beside the wire (row 5): round ink thumb in the cast's fist colours ----------
  const thumb = new THREE.Group(); thumb.name = 'mason_thumb'; thumb.userData.noExport = true; scene.add(thumb); { const cg = new THREE.CapsuleGeometry(.026, .08, 4, 10); const ti = new THREE.Mesh(cg, basic('#fbf6ee')), o = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#2a1a1f', side: THREE.BackSide })), le = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: '#f3e4c8', side: THREE.BackSide })); o.scale.set(1.3, 1.12, 1.3); le.scale.set(1.6, 1.25, 1.6); for (const m of [le, o, ti]) { m.material.depthTest = false; m.material.transparent = true; m.renderOrder = 997 + [le, o, ti].indexOf(m); thumb.add(m); }   /* transparent pass after the cards: over the arm */   /* fix round 3: radius .02 = wire .022 on screen, pale outer edge */   /* fix round 2: drawn over the card's arm */ thumb.visible = false; }
  // ---------- the NEAR STREET below the tower (row 4): four house fronts, shutters that slam one after another, a washing line yanked in ----------
  const leaves = [], cloths = []; { const st = new THREE.Group(); st.name = 'near_street'; scene.add(st); const Y0 = STREET.y1;
    // S1 fix round: COBBLES (a drawn map of rounded setts with dark joints), the houses two storeys so the storm sky shows over the roofs from the street, cast-shadow bands of the low sun on the setts
    const cob = texOf(256, (d, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const cy = Math.floor(y / 32), cx = Math.floor((x + (cy % 2) * 16) / 32), u = ((x + (cy % 2) * 16) % 32) / 32 - .5, v = (y % 32) / 32 - .5, h = hsh(cx, cy), r = Math.hypot(u * (1 + .2 * h), v);
        const k = r > .44 ? .38 : (.78 + .22 * h) * (1 - .5 * Math.max(0, r - .2)) + (u < -.1 && v < -.1 ? .1 : 0); const i = (y * N + x) * 4; d[i] = Math.min(255, 196 * k + 20 * h); d[i + 1] = Math.min(255, 150 * k + 6 * h); d[i + 2] = Math.min(255, 118 * k + 14 * (1 - h)); d[i + 3] = 255; } });
    cob.repeat.set(18, 13); add(Bx(STREET.x1 - STREET.x0 + 8, .1, 26), RF('cobble', '#a8907a', { scale: 1.3, seed: 3 }, toon('#ffffff', { map: cob })), 'street_paving', 'ground', V((STREET.x0 + STREET.x1) / 2, Y0 - 12.5, TOWN_Z + .04), st);   /* fix round 2: the setts run under the lens (no grass in the street foreground) */
    const HS = [[-4.4, 7.4, 7.0, '#f4c542', '#2f8a4e', '#e0602a'], [3.1, 7.0, 7.6, '#f7e3b0', '#2a7a66', '#d2521f'], [10.1, 6.6, 6.8, '#f2a65a', '#3a8f5a', '#ea7436'], [16.7, 6.2, 7.3, '#f9dc8a', '#7a3a26', '#c9491c']].map(h => RL ? [h[0], h[1], h[2], { '#f4c542': '#ffd24a', '#f7e3b0': '#ffe08a', '#f2a65a': '#ffb060', '#f9dc8a': '#ffe490' }[h[3]], h[4], h[5]] : h);
    const shMat = new THREE.MeshBasicMaterial({ color: '#2a1440', transparent: true, opacity: .32, depthWrite: false });
    for (const [hx, w, h, wc, sc, rc] of HS) { add(Bx(w, h, 8), RF('plaster', wc, { scale: 2.4, seed: Math.round(hx * 7) & 15 }, toon(wc, { map: mapRep(PLT, w / 5.5, h / 5.5) })), 'street_house_wall', 'plaster', V(hx, Y0 + 4, TOWN_Z + h / 2), st); const rf = add(prism, toon(rc, { side: THREE.DoubleSide }), 'street_house_roof', 'roof', V(hx, Y0 + 4, TOWN_Z + h), st); rf.scale.set(w + .9, 2.4, 8.9);
      for (const sy of [-1, 1]) { const sl = add(Bx(w + 1.1, .1, 5.12), RF('tile', rc, { scale: 1.3 }, toon(rc, { map: mapRep(TIL, (w + 1.1) / 1.6, 3.2) })), 'street_roof_tiles', 'roof', V(hx, Y0 + 4 + sy * 2.225, TOWN_Z + h + 1.25), st); sl.rotation.x = sy * Math.atan(2.4 / 4.45); }   /* fix round 2: tile rows on both slopes */
      add(Bx(w + 1.2, .16, .5), M.stone, 'street_eave_moulding', 'stone', V(hx, Y0 - .2, TOWN_Z + h - .02), st);
      const sh = add(new THREE.PlaneGeometry(w + .2, h * .42), shMat, 'street_shadow_band', 'ground', V(hx + .9, Y0 - h * .21, TOWN_Z + .1), st); sh.rotation.x = -Math.PI / 2; sh.castShadow = sh.receiveShadow = false;
      add(Bx(w + .3, .22, .3), M.stone, 'street_house_band', 'stone', V(hx, Y0 - .05, TOWN_Z + 3.7), st); add(Bx(1.4, 2.4, .14), RF('wood', '#8a5a30', { scale: 1.0, seed: 2 }, toon('#8a5a30', { map: mapRep(PLK, 1.2, 1) })), 'street_door', 'wood', V(hx - w * .24, Y0 - .05, TOWN_Z + 1.2), st);
      add(Bx(1.85, .3, .22), M.stone, 'street_door_lintel', 'stone', V(hx - w * .24, Y0 - .1, TOWN_Z + 2.55), st); for (const dx of [-.85, .85]) add(Bx(.2, 2.5, .2), M.stone, 'street_door_jamb', 'stone', V(hx - w * .24 + dx, Y0 - .1, TOWN_Z + 1.25), st);
      add(new THREE.TorusGeometry(.07, .015, 6, 12), M.ironDk, 'street_door_knocker', 'metal', V(hx - w * .24 + .3, Y0 - .15, TOWN_Z + 1.3), st); add(Bx(1.6, .14, .5), M.stoneSh, 'street_door_step', 'stone', V(hx - w * .24, Y0 - .35, TOWN_Z + .07), st); add(Bx(.5, 1.2, .5), M.stone, 'street_chimney', 'stone', V(hx + w * .25, Y0 + 5, TOWN_Z + h + 1.9), st);
      for (const fz of [2.2, 5.1]) for (const fx of [-.24, .24]) { if (fz < 4 && fx < 0) continue; const wx = hx + fx * w; add(Bx(1.1, 1.6, .1), M.dark, 'street_window', 'glass', V(wx, Y0 - .04, TOWN_Z + fz), st); add(Bx(1.35, .12, .28), M.stone, 'street_window_sill', 'stone', V(wx, Y0 - .14, TOWN_Z + fz - .86), st);
          for (const sd of [-1, 1]) { const piv = new THREE.Group(); piv.position.copy(V(wx + sd * .55, Y0 - .12, TOWN_Z + fz)); st.add(piv); add(Bx(.55, 1.6, .07), RF('wood', sc, { scale: .8, seed: 5 }, toon(sc)), 'street_shutter', 'wood', new THREE.Vector3(sd * .275, 0, 0), piv); leaves.push({ piv, sd, w: Math.floor(leaves.length / 2) }); } } }
    add(new THREE.CylinderGeometry(.012, .012, 6.4, 5), toon('#d8b878'), 'washing_line', 'cloth', V(3.1, Y0 - .5, TOWN_Z + 6.2), st).rotation.z = Math.PI / 2;
    ['#fbf6ee', '#c8372f', '#2f6fb8', '#f7e3b0', '#fbf6ee'].forEach((c, i) => { const m = add(Bx(.75, .95, .03), toon(c), 'washing_cloth', 'cloth', V(1.2 + i * 1.05, Y0 - .5, TOWN_Z + 5.7), st); cloths.push({ m, x0: 1.2 + i * 1.05, i }); });
    for (let i = 0; i < 9; i++) { const ch = rr(3.5, 6), cx = -14 + i * 4.6 + rr(-.6, .6), cy = 44 + rr(-2, 2); if (TR) { const t = ctx.trees.tree({ kind: 'cypress', at: [cx, cy, TOWN_Z], height: ch * 1.35, seed: 70 + i, parent: st, perCl: 50 }); t.name = 'yard_cypress'; } else add(new THREE.ConeGeometry(.9, ch, 7), M.cyp, 'yard_cypress', 'foliage', V(cx, cy, TOWN_Z + 2.2), st); } }
  // ---------- the WIRE'S FOOT (row 7): dark wet earth by the south wall, a puddle, grass, stones ----------
  { const gg = new THREE.Group(); gg.name = 'wire_foot_ground'; scene.add(gg);
    // S1 fix round: WET MUD with texture and shine: a drawn map (dark churned earth, wet streaks, small stones, boot prints) on a glossy material that catches the low sun, mud clods round the wire's foot
    const vn = (x, y, s, N) => { const M = N / s, X = x / s, Y = y / s, i = Math.floor(X), j = Math.floor(Y); let u = X - i, v = Y - j; u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v); const h = (a, b) => hsh(((a % M) + M) % M, ((b % M) + M) % M), a = h(i, j), b = h(i + 1, j), c = h(i, j + 1), e = h(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
    const mudTex = texOf(256, (d, N) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n1 = vn(x, y, 32, N), n3 = vn(x + 7, y + 3, 16, N), n2 = hsh(Math.floor(x / 3), Math.floor(y / 3)), wet = .65 * vn(x + 90, y + 40, 64, N) + .35 * n3, st = n2 > .975;   /* fix round 3: earth tones (grey-brown, ochre clay, dark umber), blobby wet patches, no wavy streaks */
        let r = 104 + 30 * n3 + 10 * n2, g = 84 + 22 * n3 + 7 * n2, b = 64 + 12 * n3; if (n1 > .62) { const k = Math.min(1, (n1 - .62) * 5); r += (150 - r) * k; g += (112 - g) * k; b += (56 - b) * k; }
        if (wet > .5) { const k = Math.min(1, (wet - .5) * 6); r *= 1 - .52 * k; g *= 1 - .56 * k; b *= 1 - .6 * k; if (k > .9 && n2 > .93) { r = 226; g = 206; b = 172; } }
        if (st) { r = 150; g = 132; b = 112; } const i = (y * N + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; } });
    mudTex.repeat.set(2.5, 2.5); const mudMat = new THREE.MeshPhongMaterial({ color: '#ffffff', map: mudTex, shininess: 70, specular: '#b8a078' });
    const mud = add(new THREE.CircleGeometry(1.0, 36), RF('mud', '#a8896a', { scale: .55, seed: 4, normal: 1.8 }, mudMat), 'wet_earth', 'ground', V(WIRE_X, -2.55, TOWN_Z + .02), gg); mud.rotation.x = -Math.PI / 2; mud.scale.set(1.45, 1.05, 1);
    const mud2 = add(new THREE.CircleGeometry(.32, 20), new THREE.MeshPhongMaterial({ color: '#3a2a1c', shininess: 90, specular: '#d0b890' }), 'wet_earth_dark', 'ground', V(WIRE_X, -2.1, TOWN_Z + .03), gg); mud2.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 16; i++) { const a = rr(0, 6.28), r = rr(.12, .5); add(new THREE.SphereGeometry(rr(.025, .06), 7, 5), new THREE.MeshPhongMaterial({ color: pick(['#4a3626', '#6a5440', '#3a2a1e', '#7a6040']), shininess: 60, specular: '#c8b088' }), 'mud_clod', 'ground', V(WIRE_X + Math.cos(a) * r, -2.15 - Math.abs(Math.sin(a)) * r, TOWN_Z + .025), gg).scale.y = .5; }
    for (let i = 0; i < 22; i++) { const a = rr(0, 6.28), r = rr(1.9, 3.4); add(new THREE.ConeGeometry(.05, rr(.14, .3), 5), toon(pick(['#4f9a3a', '#6fb844', '#3f8a52'])), 'grass_tuft', 'foliage', V(WIRE_X + Math.cos(a) * r * 1.2, Math.min(-2.0, -3.0 + Math.sin(a) * r), TOWN_Z + .1), gg); }
    for (const [x, y, r] of [[.1, -2.0, .11], [1.9, -1.95, .08], [2.1, -2.4, .06], [-.1, -2.7, .07]]) add(new THREE.SphereGeometry(r, 8, 6), M.stoneSh, 'yard_stone', 'stone', V(x, y, TOWN_Z + r * .5), gg).scale.y = .6; }
  const puddle = add(new THREE.CircleGeometry(.3, 24), MT('wet', { color: '#5e5296', rough: .06, seed: 8 }, basic('#6c5cc4')), 'puddle', 'water', V(WIRE_X + .1, -2.6, TOWN_Z + .035), scene); puddle.rotation.x = -Math.PI / 2;
  const puddleHi = add(new THREE.CircleGeometry(.09, 16), basic('#ffd9c0'), 'puddle_shine', 'water', V(WIRE_X, -2.56, TOWN_Z + .04), scene); puddleHi.rotation.x = -Math.PI / 2;
  const ripples = [0, 1].map(i => { const m = add(new THREE.TorusGeometry(.12, .008, 6, 32), new THREE.MeshBasicMaterial({ color: '#efe6ff', transparent: true, opacity: 0, depthWrite: false }), 'puddle_ripple', 'water', V(WIRE_X + .1, -2.6, TOWN_Z + .045), scene); m.rotation.x = Math.PI / 2; m.castShadow = false; m.visible = false; return m; });
  // S1 fix round: the rope round his waist, the coil's feed wire to the wall (both drawn per frame between two points)
  const seg = (m, a, b) => { const d = b.clone().sub(a), L = Math.max(d.length(), 1e-4); m.position.copy(a).addScaledVector(d, .5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.multiplyScalar(1 / L)); };
  const belt = add(new THREE.TorusGeometry(.16, .02, 6, 24), toon('#d8b878'), 'mason_rope_belt', 'cloth', null, scene); belt.visible = false;
  const feed = add(new THREE.CylinderGeometry(.016, .016, 1, 6), M.ironDk, 'spear_wire_feed', 'metal', null, scene); feed.visible = false;
  const WIRE_H = .62, PXM = 531;   // the wire's live end at his hammer height above the card's ground; rig px per metre on the card
  if (PB) { const wf = HP.buildWireFoot(THREE, ctx, { height: .4 }); wf.group.position.copy(V(WIRE_FOOT[0] - .02, WIRE_FOOT[1] + .04, TOWN_Z + .015)); wf.group.rotation.y = .25; wf.group.traverse(o => { if (o.name === 'wire_foot_run') o.visible = false; }); wf.group.name = 'wire_foot_hero'; scene.add(wf.group); }
  const mound = add(new THREE.SphereGeometry(.09, 10, 8), RF('mud', '#4a3424', { scale: .5, seed: 6 }, toon('#3a2218')), 'wire_foot_mound', 'ground', V(WIRE_X, -2.05, TOWN_Z + .01), scene); mound.scale.set(1.3, .45, 1.3);
  // ---------- swallows that scatter from the belfry (row 3) ----------
  const birds = []; for (let i = 0; i < 7; i++) { const g = new THREE.Group(); g.name = 'swallow'; g.userData.noExport = true; const m = basic('#2a2040'); const a = new THREE.Mesh(Bx(.2, .015, .07), m), b = new THREE.Mesh(Bx(.2, .015, .07), m); a.position.x = -.1; b.position.x = .1; g.add(a, b); g.visible = false; scene.add(g); birds.push({ g, a, b, d: [rr(-1.6, 1.6), -rr(.5, 1.4), rr(.25, .9)], ph: rr(0, 6) }); }

  // ================= S1 FIX ROUND 2: STREET DRESSING, SMOKE, PEBBLES, THE FAR BOLT =================
  const dress = new THREE.Group(); dress.name = 'street_dressing'; scene.add(dress); const Y0s = STREET.y1, FZ = TOWN_Z;
  { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c2 = cv.getContext('2d'); c2.fillStyle = '#2c4a2a'; c2.fillRect(0, 0, 512, 128); c2.strokeStyle = '#e8c070'; c2.lineWidth = 6; c2.strokeRect(8, 8, 496, 112);
    c2.fillStyle = '#f2dc9a'; c2.font = 'bold 84px Georgia, serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('FORNO', 256, 68); const tx = new THREE.CanvasTexture(cv); if ('colorSpace' in tx) tx.colorSpace = THREE.SRGBColorSpace;
    add(new THREE.PlaneGeometry(2.2, .55), new THREE.MeshLambertMaterial({ map: tx }), 'street_sign_forno', 'wood', V(10.1 - 6.6 * .24, Y0s - .2, FZ + 3.0), dress); }   // the baker's hand-painted sign over his door
  for (const [hx, w] of [[3.1, 7.0], [10.1, 6.6]]) { const bz = FZ + 4.05, bx = hx + .24 * w;   // balconies with iron railings and geranium pots on the upper storey
    add(Bx(1.9, .12, .7), M.stoneSh, 'street_balcony_slab', 'stone', V(bx, Y0s - .45, bz), dress); add(Bx(1.9, .05, .05), M.ironDk, 'street_balcony_rail', 'metal', V(bx, Y0s - .78, bz + .85), dress);
    for (let i = 0; i <= 8; i++) add(Bx(.025, .8, .025), M.ironDk, 'street_balcony_bar', 'metal', V(bx - .9 + i * .225, Y0s - .78, bz + .45), dress);
    for (let i = 0; i < 3; i++) { add(new THREE.CylinderGeometry(.13, .09, .2, 10), RF('plaster', '#c0603a', { scale: .5, seed: 8 }, toon('#c0603a')), 'street_flower_pot', 'clay', V(bx - .6 + i * .6, Y0s - .55, bz + .16), dress); for (let j = 0; j < 4; j++) add(new THREE.SphereGeometry(.07, 8, 6), toon(j % 2 ? '#d8283a' : '#3f8a3a'), 'street_geranium', 'foliage', V(bx - .6 + i * .6 + (j - 1.5) * .06, Y0s - .55, bz + .33 + (j % 2) * .05), dress); } }
  { const lx = 3.1 - 7 * .24 + 1.2; add(Bx(.05, .05, .6), M.ironDk, 'street_lantern_bracket', 'metal', V(lx, Y0s - .4, FZ + 3.1), dress); add(Bx(.22, .32, .22), MT('iron', { color: '#4a4f66', seed: 21 }, toon('#3a3040')), 'street_lantern_frame', 'metal', V(lx, Y0s - .7, FZ + 2.85), dress);
    add(Bx(.16, .24, .16), new THREE.MeshBasicMaterial({ color: '#ffc870' }), 'street_lantern_glow', 'lamp', V(lx, Y0s - .7, FZ + 2.85), dress); }
  // props along the house fronts: barrels with hoops, crates, a hand cart with sacks, a bench, a broom, a water trough, a ladder, bread baskets, a rope coil, flower pots, loose stones
  const barrel = (x, y) => { add(new THREE.CylinderGeometry(.3, .3, .8, 14), RF('wood', '#9a6434', { scale: .7, seed: 6 }, toon('#9a6434', { map: mapRep(PLK, 2, 1) })), 'street_barrel', 'wood', V(x, y, FZ + .4), dress); for (const z of [.12, .68]) add(new THREE.TorusGeometry(.31, .02, 6, 18), M.ironDk, 'street_barrel_hoop', 'metal', V(x, y, FZ + z), dress).rotation.x = Math.PI / 2; };
  barrel(8.2, Y0s - 4.6); barrel(8.85, Y0s - 4.3); barrel(-1.2, Y0s - 4.5);
  for (const [x, y, k] of [[11.8, Y0s - 4.5, 0], [12.4, Y0s - 4.6, 1], [12.1, Y0s - 4.55, 2]]) add(Bx(.55, .45, .45), RF('wood', '#b98a50', { scale: .6, seed: 7 }, toon('#b98a50', { map: mapRep(PLK, 1, 1) })), 'street_crate', 'wood', V(x, y, FZ + .225 + (k === 2 ? .45 : 0)), dress);
  { const cx = 5.2, cy = Y0s - 5.2; add(Bx(1.3, .12, .8), RF('wood', '#a8743c', { scale: .8 }, toon('#a8743c', { map: mapRep(PLK, 1, 1) })), 'street_cart_bed', 'wood', V(cx, cy, FZ + .55), dress); for (const s2 of [-1, 1]) add(new THREE.TorusGeometry(.32, .04, 6, 16), RF('wood', '#6a4426', { scale: .5 }, toon('#6a4426')), 'street_cart_wheel', 'wood', V(cx, cy + s2 * .45, FZ + .33), dress);
    add(Bx(.05, .05, 1.1), toon('#6a4426'), 'street_cart_handle', 'wood', V(cx - 1.0, cy, FZ + .45), dress).rotation.y = .3; for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(.2, 8, 6), toon('#d9c08a'), 'street_sack', 'cloth', V(cx - .35 + i * .35, cy, FZ + .75), dress).scale.set(1, .8, 1.2); }
  add(Bx(1.6, .1, .4), RF('wood', '#9a6434', { scale: .8 }, toon('#9a6434', { map: mapRep(PLK, 1, 1) })), 'street_bench_seat', 'wood', V(15.5, Y0s - 4.6, FZ + .45), dress); for (const dx of [-.65, .65]) add(Bx(.1, .45, .35), M.stoneSh, 'street_bench_leg', 'stone', V(15.5 + dx, Y0s - 4.6, FZ + .22), dress);
  add(Bx(1.4, .55, .6), M.stone, 'street_water_trough', 'stone', V(-3.2, Y0s - 4.7, FZ + .28), dress); add(Bx(1.25, .04, .48), MT('wet', { color: '#3a6a9a', seed: 3 }, toon('#4a7ab0')), 'street_trough_water', 'water', V(-3.2, Y0s - 4.7, FZ + .53), dress);
  { const g = new THREE.Group(); g.name = 'street_ladder'; g.position.copy(V(17.6, Y0s - 4.3, FZ)); g.rotation.x = -.25; dress.add(g); for (const dx of [-.22, .22]) add(Bx(.06, 3.0, .06), M.wood, 'street_ladder_rail', 'wood', new THREE.Vector3(dx, 1.5, 0), g); for (let i = 0; i < 9; i++) add(Bx(.44, .04, .05), M.wood, 'street_ladder_rung', 'wood', new THREE.Vector3(0, .3 + i * .32, 0), g); }
  { const bm = add(Bx(.04, 1.3, .04), M.wood, 'street_broom_stick', 'wood', V(1.8, Y0s - 4.45, FZ + .65), dress); bm.rotation.z = .15; add(new THREE.ConeGeometry(.13, .35, 8), toon('#d8b060'), 'street_broom_head', 'cloth', V(1.8, Y0s - 4.45, FZ + .16), dress); }
  for (const [x, y] of [[13.6, Y0s - 4.5], [-.4, Y0s - 4.6]]) { add(new THREE.CylinderGeometry(.24, .17, .26, 12), RF('wood', '#c8903e', { scale: .35, seed: 9 }, toon('#d9a04a')), 'street_bread_basket', 'wood', V(x, y, FZ + .13), dress); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(.09, 8, 6), toon('#e0a04a'), 'street_bread_loaf', 'cloth', V(x - .1 + (i % 2) * .2, y + (i > 1 ? .08 : -.08), FZ + .3), dress).scale.set(1.5, .8, .9); }
  add(new THREE.TorusGeometry(.22, .05, 6, 16), toon('#c8a060'), 'street_rope_coil', 'cloth', V(16.6, Y0s - 4.5, FZ + .05), dress).rotation.x = Math.PI / 2;
  for (const [x, c] of [[6.9, '#d8283a'], [7.3, '#f2c030'], [-2.0, '#d8283a']]) { add(new THREE.CylinderGeometry(.16, .12, .3, 10), RF('plaster', '#c0603a', { scale: .5, seed: 8 }, toon('#c0603a')), 'street_ground_pot', 'clay', V(x, Y0s - 4.5, FZ + .15), dress); add(new THREE.SphereGeometry(.17, 8, 6), toon('#3f8a3a'), 'street_pot_leaves', 'foliage', V(x, Y0s - 4.5, FZ + .4), dress); add(new THREE.SphereGeometry(.07, 6, 5), toon(c), 'street_pot_flower', 'foliage', V(x + .05, Y0s - 4.55, FZ + .52), dress); }
  for (let i = 0; i < 26; i++) add(new THREE.SphereGeometry(.05, 6, 5), M.stoneSh, 'street_loose_stone', 'stone', V(rr(-8, 20), rr(Y0s - 14, Y0s - 5), FZ + .05), dress).scale.y = .5;
  // chimney smoke bending away in the storm wind (soft puffs: rise, drift east, grow and fade; out of phase per chimney)
  const smokeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.5, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const smokes = []; for (const [cx, cy, cz, k] of [[-4.4 + 1.85, Y0s + 5, FZ + 9.5, 1], [3.1 + 1.75, Y0s + 5, FZ + 10.1, 1], [10.1 + 1.65, Y0s + 5, FZ + 9.3, 1], [16.7 + 1.55, Y0s + 5, FZ + 9.8, 1], [-30, 110, FZ + 11, 3], [28, 140, FZ + 12, 3], [-55, 170, FZ + 11, 4], [60, 120, FZ + 10.5, 3]]) for (let i = 0; i < 7; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: '#cbbcd8', transparent: true, depthWrite: false, opacity: .5 })); sp.name = 'chimney_smoke'; sp.userData.noExport = true; scene.add(sp); smokes.push({ sp, c: [cx, cy, cz], k, ph: i / 7 + rr(0, .05) }); }
  // pebbles in the wet mud at the wire's foot
  { const n = 70, im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 80, specular: '#e8d4b0' }), n); im.name = 'mud_pebbles'; im.userData.role = 'stone'; im.castShadow = im.receiveShadow = true; const m4p = new THREE.Matrix4(), pc = ['#8a7a66', '#6e6252', '#b8904c', '#c9a35a', '#4a3426', '#3c2a1e', '#9a8a74'].map(col);   /* fix round 3: grey-brown, ochre, dark umber */
    for (let i = 0; i < n; i++) { const a = rr(0, 6.28), r = Math.sqrt(rr(0, 1)) * 1.3, sz = rr(.012, .04); m4p.compose(V(WIRE_X + Math.cos(a) * r * 1.3, -2.55 + Math.sin(a) * r * .9, TOWN_Z + .02), new THREE.Quaternion(), new THREE.Vector3(sz * rr(1, 1.6), sz * .55, sz)); im.setMatrixAt(i, m4p); im.setColorAt(i, pick(pc)); }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; scene.add(im); }
  // ===== FINAL PASS (2026-11-15, CB "visuals more better"): THE MUD CLOSE-UP (row 7) as wet churned earth with relief, sunk wet pebbles, water-filled
  // boot prints and a puddle with a ragged shore that mirrors the warm low sky; ONLY in the hook (place key s1), so S5's night reach-in keeps its own look.
  if (S1 && RL) { const gg = scene.getObjectByName('wire_foot_ground');
    const wetOf = (kind, c, o = {}) => { const r = ctx.relief(kind, c, o); if (!r.map || !r.normalMap) return r; const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: r.map, normalMap: r.normalMap, normalScale: new THREE.Vector2(o.normal ?? 1.6, o.normal ?? 1.6), roughness: o.rough ?? .38, metalness: 0, clearcoat: o.coat ?? .7, clearcoatRoughness: .22, emissive: o.fill || '#5a3426', emissiveMap: r.map, emissiveIntensity: o.fillK ?? .28, envMapIntensity: o.env ?? .9 }); m.userData.k3scale = o.size ?? r.userData.k3scale; m.userData.k3kind = kind; return m; };   // night.js's wet relief, warm fill
    const we = scene.getObjectByName('wet_earth'); if (we) { we.material = wetOf('mud', '#9a7656', { size: .42, seed: 4 }); we.scale.set(1.9, 1.4, 1); }
    const wd = scene.getObjectByName('wet_earth_dark'); if (wd) wd.material = wetOf('mud', '#5a4030', { size: .3, seed: 9, rough: .25, coat: 1, fillK: .2 });
    // a ragged shore: the outline wobbles with two noise tones (never a circle)
    const ragged = (r0, n, s, kx = 1, ky = .75) => { const sh = new THREE.Shape(); for (let i = 0; i <= n; i++) { const a = i / n * 6.2832, r = r0 * (1 + .22 * Math.sin(a * 3 + s) + .12 * Math.sin(a * 7 + 2 * s) + .06 * Math.sin(a * 13 + s * 3)); const x = Math.cos(a) * r * kx, y = Math.sin(a) * r * ky; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } const g = new THREE.ShapeGeometry(sh, 2), uv = g.attributes.uv, P = g.attributes.position, s2 = r0 * 1.45 * Math.max(kx, ky); for (let i = 0; i < uv.count; i++) uv.setXY(i, P.getX(i) / (2 * s2) + .5, P.getY(i) / (2 * s2) + .5); return g; };
    // the mirrored sky: a painted reflection (deep violet water, the burnt-orange gap of the low sun as a broad warm band, a pale streak of sky) on a clear-coat surface
    const refl = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#1a0f22'); g.addColorStop(.38, '#5a2a52'); g.addColorStop(.55, '#e0784a'); g.addColorStop(.66, '#ffb070'); g.addColorStop(.8, '#6a3456'); g.addColorStop(1, '#170d1e'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(255,${200 + (i % 3) * 18},150,${.10 + .12 * ((i * 37) % 7) / 7})`; x.lineWidth = 1 + (i % 3); x.beginPath(); const y0 = 40 + i * 7.5; x.moveTo(0, y0); for (let k = 0; k <= 256; k += 16) x.lineTo(k, y0 + k * .9 - 128 + Math.sin(k * .07 + i) * 4); x.stroke(); }   // wind ripples catch the warm light
      const t = new THREE.CanvasTexture(c); if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const waterM = new THREE.MeshPhysicalMaterial({ color: '#120a14', roughness: .05, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, emissive: '#ffffff', emissiveMap: refl, emissiveIntensity: .85, envMapIntensity: 1.6 });
    const pud = scene.getObjectByName('puddle'); if (pud) { pud.geometry.dispose(); pud.geometry = ragged(.36, 64, 1.7, 1.15, .8); pud.material = waterM; pud.position.copy(V(WIRE_X + .1, -2.6, TOWN_Z + .046)); waterM.polygonOffset = true; waterM.polygonOffsetFactor = -2; waterM.polygonOffsetUnits = -4; }
    // the wet shore: dark glossy mud a hand wide round the water, and a pale lip of drying silt
    add(ragged(.48, 64, 1.7, 1.15, .82), wetOf('mud', '#4a3428', { size: .25, seed: 12, rough: .18, coat: 1, fillK: .18 }), 'puddle_wet_shore', 'ground', V(WIRE_X + .1, -2.6, TOWN_Z + .036), gg || scene).rotation.x = -Math.PI / 2;
    add(ragged(.56, 64, 1.7, 1.15, .84), wetOf('mud', '#b89a74', { size: .3, seed: 14, rough: .6, coat: .2, fillK: .3, fill: '#7a5a3a' }), 'puddle_silt_lip', 'ground', V(WIRE_X + .1, -2.6, TOWN_Z + .028), gg || scene).rotation.x = -Math.PI / 2;
    const ph = scene.getObjectByName('puddle_shine'); if (ph) { ph.geometry.dispose(); ph.geometry = ragged(.09, 24, 4.1, 2.6, .35); ph.material = new THREE.MeshBasicMaterial({ color: '#ffd2a0', transparent: true, opacity: .75, depthWrite: false }); ph.position.copy(V(WIRE_X + .02, -2.64, TOWN_Z + .056)); }
    // boot prints his stamp left, holding water that mirrors the same warm sky; churned ridges between them
    for (const [x, y, a, s] of [[.62, -2.2, .4, 3.1], [.48, -2.62, .2, 5.3], [1.55, -2.25, -.3, 2.2], [1.7, -2.75, -.5, 6.6], [.3, -2.95, .1, 8.1]]) { const bp = add(ragged(.075, 32, s, 1, 1.9), waterM, 'mud_boot_print_water', 'water', V(x, y, TOWN_Z + .036), gg || scene); bp.rotation.set(-Math.PI / 2, 0, a); bp.castShadow = false;
      const rim = add(ragged(.1, 32, s, 1, 1.75), wetOf('mud', '#3e2c22', { size: .2, seed: 16, rough: .2, coat: 1, fillK: .15 }), 'mud_boot_print', 'ground', V(x, y, TOWN_Z + .033), gg || scene); rim.rotation.set(-Math.PI / 2, 0, a); }
    for (let i = 0; i < 22; i++) { const a = rr(0, 6.28), r = rr(.35, 1.4), rg = add(new THREE.SphereGeometry(1, 10, 6), wetOf('mud', pick(['#6a4c36', '#4e3828', '#7c5a40']), { size: .2, seed: 20 + i % 4, rough: .3, coat: .9 }), 'mud_ridge', 'ground', V(WIRE_X + Math.cos(a) * r * 1.3, -2.55 + Math.sin(a) * r * .9, TOWN_Z + .015), gg || scene); rg.scale.set(rr(.05, .14), rr(.012, .03), rr(.025, .05)); rg.rotation.y = rr(0, 3.14); }
    // wet pebbles half sunk in the mud: clear-coated so each catches a point of the warm sun
    { const n = 150, im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .32, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.1 }), n); im.name = 'mud_pebbles_wet'; im.userData.role = 'stone'; im.castShadow = im.receiveShadow = true;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pc = ['#a89276', '#8a7a66', '#c9a35a', '#d8c4a0', '#6e6252', '#b8904c', '#e6d6b8', '#7a5a40'].map(col);
      for (let i = 0; i < n; i++) { const a = rr(0, 6.28), r = Math.sqrt(rr(0, 1)) * 1.5, sz = rr(.006, .03) * (R0() < .08 ? 1.4 : 1); const px = WIRE_X + Math.cos(a) * r * 1.3, py = -2.55 + Math.sin(a) * r * .9; if (Math.hypot((px - WIRE_X - .1) / 1.15, (py + 2.6) / .8) < .4) { m4.makeScale(0, 0, 0); im.setMatrixAt(i, m4); continue; }   /* skipped slots: zero scale (an identity slot = a 1 m stone at the apex) */
        m4.compose(V(px, py, TOWN_Z + .025 + sz * .15), q.setFromEuler(e.set(rr(0, 3), rr(0, 3), rr(0, 3))), new THREE.Vector3(sz * rr(1, 1.5), sz * rr(.45, .7), sz * rr(.8, 1.2))); im.setMatrixAt(i, m4); im.setColorAt(i, pick(pc)); }
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; (gg || scene).add(im); }
    ripples.forEach(m => m.material.color.set('#ffd8b0')); }

  // THE FAR BOLTS (final pass: CB "you should make the thunder bolt much better than this"): the kit bolt ctx.fx.bolt, far variant, at the old flash frames:
  // row 2 "spear" (glint frame, behind the tip in the close-up) and row 4 "lightning" f125 (street take, s1.bolt). Each lights the clouds from inside
  // with ctx.sky.flash and the hook's own storm dome toward the bolt. Place key s1.far_bolts = [{ from, to, f, seed, width }] (plan metres) overrides.
  const FB = []; if (S1 && ctx.fx && ctx.fx.bolt) { const T0 = S1.t || {};
    const list = S1.far_bolts || [{ from: [-150, 424, 150], to: [-146, 431, -24], f: T0.glint ?? 30, seed: 5, width: 1.3, slot: 2 }, ...(S1.bolt ? [{ from: S1.bolt.from, to: [S1.bolt.to[0] + 4, S1.bolt.to[1] + 6, -24], f: S1.bolt.f ?? 125, seed: 9, width: 1.8, slot: 3 }] : [])];
    const cgB = scene.getObjectByName('storm_cloud_billows');
    for (const b of list) { const api = ctx.fx.bolt({ plan: true, far: true, from: b.from, to: b.to, frame: b.f, leader: b.leader ?? 3, seed: b.seed, width: b.width, glowK: .22, haze: .22, branches: 7, clouds: cgB || undefined });
      FB.push({ api, from3: V(...b.from), slot: b.slot ?? FB.length, k: b.k ?? 1.2 }); } }
  // (v1/v2 bolt kept only as the fallback when the kit has no fx)
  let farBolt = null; const flashDir = new THREE.DirectionalLight('#d6deff', 0); flashDir.name = 'storm_flash_dir'; scene.add(flashDir); scene.add(flashDir.target);
  if (S1 && S1.bolt && !FB.length) { farBolt = SQm.buildBolt(THREE, scene, { V }, S1.bolt.from, S1.bolt.to, { r: S1.bolt.r || .9, n: 12, seed: 9, foot: 30, head: 90, color: '#b8d8ff' }); farBolt.visible = false; flashDir.position.copy(V(...S1.bolt.from)); flashDir.target.position.copy(V(5, 60, TOWN_Z)); }
  const posOf = (R, who, f) => { const runs = R && R.perf && R.perf[who]; if (!runs || !runs.length) return null; let lo = 0, hi = runs.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (runs[mid].f0 <= f) lo = mid; else hi = mid - 1; } return runs[lo].state.pos; };
  const flashAt = (f, f0, amp) => { const d = f - f0; return d < 0 ? 0 : amp * (d < 1 ? 1 : d < 2 ? .45 : d < 3 ? .95 : Math.exp(-(d - 2) / 3.2)); };
  const qz = new THREE.Quaternion(), zAx = new THREE.Vector3(0, 0, 1), FLASHC = new THREE.Color('#e4e8ff'), FLASHC2 = new THREE.Color('#8c86d8');
  if (S1 && S1.flash_p) { const fp = V(...S1.flash_p); cloudU.flashP.value = fp; if (S1.flash_dir) skyMat.uniforms.flashD.value = V(...S1.flash_dir).normalize(); }   // fix round: a stretch may put the far flash where its lens looks (row 4 street)
  const envSrc = []; scene.traverse(o => { if (o.isMesh && o.material && o.material.isMeshPhysicalMaterial) envSrc.push(o.material); });
  const update = (f, t, R) => { if (R && R.camera) { skyDome.position.copy(R.camera.position); skyDome.updateMatrixWorld(); }
    if (globalThis.__s1PbrMats && globalThis.__s1PbrMats.length) { const env = (envSrc.find(m => m.envMap) || {}).envMap; if (env) for (const m of globalThis.__s1PbrMats) if (m.envMap !== env) { m.envMap = env; m.needsUpdate = true; } }   // the held hero hammer (s1_props.js) gets this place's env map
    const fe = S1 ? f : 1e6, hr = (S1 && S1.hits_roof) || [], hw = (S1 && S1.hits_wall) || [], T = (S1 && S1.t) || {}, W0 = T.wire0 ?? 172, W1 = T.wire1 ?? 210, ROPE0 = T.rope0 ?? 213, LAND = T.land ?? 247, PUSH = T.push ?? 259, STAMP = T.stamp ?? 264, GL = T.glint ?? 30;
    let fl;
    if (FB.length) {   // final pass: the kit's far bolts drive every flash (clouds lit from inside near the bolt, the hook's dome toward it, the tip glint)
      let best = 0, bestP = null; for (const b of FB) { b.api.update(t); const k = Math.max(0, b.api.state.light || 0); if (ctx.sky && ctx.sky.flash) ctx.sky.flash({ pos: b.from3.toArray() }, k * b.k, { slot: b.slot, spread: .26 }); if (k > best) { best = k; bestP = b.from3; } }
      fl = best; skyMat.uniforms.uFlash.value = .1 + fl * 1.1; if (bestP && R && R.camera) skyMat.uniforms.flashD.value.copy(bestP).sub(R.camera.position).normalize(); cloudU.uFlash.value = fl * .55; flashL.intensity = 0; }
    else { fl = S1 ? flashAt(f, GL, .5) + flashAt(f, S1.flash_f ?? 125, 1.5) : 0; skyMat.uniforms.uFlash.value = .1 + fl; cloudU.uFlash.value = fl * .55; flashL.intensity = fl * 1.6; for (const c of kitCloudMats) { const k = Math.min(1, fl * .45); c.m.uniforms.lit.value.copy(c.lit).lerp(FLASHC, k); c.m.uniforms.shade.value.copy(c.shade).lerp(FLASHC2, k * .7); } }
    // the wire run
    const g = fe < W0 - 22 ? 0 : fe < W0 ? 3 : Math.max(3, Math.round(TS * snp(fe - W0, W1 - W0))); wireHook.visible = fe >= (T.hook ?? 166); if (heroWire) heroWire.setGrow(g / TS); else { roofWire.visible = g > 0; roofWire.geometry.setDrawRange(0, g * 42); } roofStaples.forEach((m, i) => m.visible = g >= [36, 50][i] + 2);
    const mp = S1 ? posOf(R, 'mason', f) : null; let zEnd = ZLOW; if (S1 && f < ROPE0) zEnd = WT; else if (S1 && f < LAND + 4 && mp) zEnd = Math.min(WT, Math.max(ZLOW, mp[2] + WIRE_H)); setWall(zEnd); footWire.visible = fe >= LAND + 4; { const SL0 = T.slide ?? 1e6; footWire.position.y = S1 ? .13 * (1 - snp(fe - SL0, 4)) : 0; } mound.visible = fe >= PUSH; mound.scale.y = .45 * (fe >= STAMP ? .5 : 1);
    hw.forEach((h, i) => { if (!wallStaples[i]) { const p = posOf(R, 'mason', h); wallStaples[i] = mkStaple([WIRE_X, WY - .01, (p ? p[2] : 0) + WIRE_H]); wallStaples[i].rotation.x = Math.PI / 2; } wallStaples[i].visible = f >= h; });
    // camera frame vectors (three world): right, up, the lens position
    const cq = R && R.camera ? R.camera.quaternion : new THREE.Quaternion(), rightW = new THREE.Vector3(1, 0, 0).applyQuaternion(cq), upW = new THREE.Vector3(0, 1, 0), camP = R && R.camera ? R.camera.position : new THREE.Vector3();
    // the rope from the putlog beam straight down to a rope belt round his waist (his far fist holds it overhead); no stirrup
    const onRope = S1 && f >= ROPE0 && f < LAND && mp; rope.visible = belt.visible = !!onRope; stirrup.visible = false; feed.visible = false;
    if (onRope) { seg(rope, V(mp[0], mp[1] + .03, mp[2] + .4), V(mp[0] + .02, -1.98, RT)); belt.position.copy(V(mp[0], mp[1], mp[2] + .37)); belt.rotation.set(Math.PI / 2, 0, 0); }
    coil.visible = !!S1; if (S1) { if (f < ROPE0 || !mp) { coil.position.copy(V(.4, -.12, .6)); coil.rotation.set(0, .5, .35); }
      else if (f < LAND) { const sh = V(mp[0], mp[1], mp[2] + .74), tw = camP.clone().sub(sh).setY(0).normalize(); coil.position.copy(sh).addScaledVector(rightW, -.05).addScaledVector(tw, .1); coil.quaternion.copy(cq).multiply(qz.setFromAxisAngle(zAx, .5)); coil.scale.setScalar(.8);
        feed.visible = true; seg(feed, coil.position.clone().addScaledVector(rightW, .1).addScaledVector(upW, -.08), V(WIRE_X, WY, zEnd)); }
      else { coil.scale.setScalar(1); coil.position.copy(V(mp[0] - .45, mp[1] - .3, TOWN_Z + .08)); coil.rotation.set(Math.PI / 2, 0, 0); } }
    // sparks and the tip glint
    spark.visible = false; if (S1) { for (const h of hr) if (f >= h && f < h + 4) { spark.visible = true; spark.position.copy(V(anchorNail[0], anchorNail[1] - .25, anchorNail[2])); spark.scale.setScalar((1 - (f - h) / 4.5) * (h === hr[0] ? 1.5 : 1)); }
      hw.forEach((h, i) => { if (f >= h && f < h + 3 && wallStaples[i]) { spark.visible = true; spark.position.copy(wallStaples[i].position); spark.position.z += .4; spark.scale.setScalar(1.6 * (1 - (f - h) / 3.5)); } }); }
    const gv = S1 ? (f < GL - 3 ? 0 : .42 * snp(f - GL + 3, 4) + .9 * Math.min(1, fl)) : .42; glintStar.visible = gv > .01 && !heroSpear; glintStar.scale.setScalar(Math.max(.001, gv)); if (heroSpear) heroSpear.setGlint(Math.min(1, gv * 1.7), .09 + .32 * gv);
    if (R && R.camera) { glintStar.quaternion.copy(R.camera.quaternion); if (spark.visible) spark.quaternion.copy(R.camera.quaternion).multiply(qz.setFromAxisAngle(zAx, f * .5)); }
    // the thumb beside the wire: on the camera ray of the point beside the eye, just in front of his card
    r5.visible = !!S1 && !!T.row5_edge && fe >= 140 && fe < 213; if (r5.visible) { const g5 = Math.round(24 * Math.min(1, g / 22)); r5.children.forEach((m, i) => { if (i < 2) { m.visible = g5 > 0; m.geometry.setDrawRange(0, g5 * 48); } else m.visible = wireHook.visible; }); }
    const TH0 = T.thumb ?? 198, TH1 = T.thumb_off ?? 213; thumb.visible = !!S1 && f >= TH0 && f < TH1 && !!mp; if (thumb.visible && R && R.camera) {   // fix round: the thumb stands on his NEAR fist (move: shaft target + [-30, 220] rig px), sized so it looks as thick as the wire at the eye
      const c = R.camera.position, P0 = V(...mp), n = c.clone().sub(P0).setY(0).normalize(), tg = V(...(T.thumb_at || [0, -.03, 1.42])), d = tg.clone().sub(c), tt = n.dot(P0.clone().sub(c)) / Math.min(-1e-4, n.dot(d)) * -1;
      const base = c.clone().addScaledVector(d, Math.max(.05, Math.abs(tt))), fistP = base.addScaledVector(rightW, (T.thumb_dx ?? -30) / PXM).addScaledVector(upW, -(T.thumb_dy ?? 220) / PXM), tp = fistP.clone().addScaledVector(upW, .07).addScaledVector(rightW, .028).addScaledVector(n, .03);
      const k = tp.distanceTo(c) / Math.max(.05, V(...EYE).distanceTo(c)); thumb.position.copy(tp); thumb.scale.setScalar(k * (.2 + .8 * snp(f - TH0, 5))); thumb.quaternion.copy(R.camera.quaternion).multiply(qz.setFromAxisAngle(zAx, .12)); }
    // shutters slam one after another, the washing is yanked in
    const SH0 = T.shut0 ?? 96, WA0 = T.wash0 ?? 106; for (const L of leaves) { const u = snp(fe - (SH0 + L.w * 2.6), 4); L.piv.rotation.y = -L.sd * Math.PI * u; }
    for (const c of cloths) { const u = snp(fe - (WA0 + c.i * 3), 6); c.m.position.x = c.x0 + (4.8 - c.x0) * u; c.m.visible = u < .98; c.m.rotation.z = .5 * Math.sin(u * Math.PI); }
    // puddle shiver on the stamp; swallows
    { const d = fe - STAMP, k = S1 && d >= 0 && d < 14 ? .12 * Math.sin(d * 2.2) * Math.exp(-d / 4) : 0; puddle.scale.set(1.1 * (1 + k), .8 * (1 + k), 1); puddleHi.scale.set(1.4 * (1 - 2 * k), .45 * (1 + 3 * k), 1);
      ripples.forEach((m, i) => { const e = d - i * 3; m.visible = S1 && e >= 0 && e < 16; if (m.visible) { m.scale.setScalar(1 + e * .22); m.material.opacity = (S1 && RL ? .38 : .85) * (1 - e / 16); } }); }
    for (const m of smokes) { const u = ((f / 60 + m.ph) % 1 + 1) % 1, sc = m.k; m.sp.position.copy(V(m.c[0] + u * u * 3.2 * sc, m.c[1] + u * .6 * sc, m.c[2] + u * 2.2 * sc)); m.sp.scale.setScalar((.5 + 1.6 * u) * sc); m.sp.material.opacity = .55 * Math.sin(Math.PI * Math.min(1, u * 1.15)); }
    if (farBolt) { const d = f - (S1.bolt.f ?? 125); farBolt.visible = d >= 0 && d < 6 && d !== 2; }
    flashDir.intensity = S1 && S1.bolt && !FB.length ? fl * 2.2 : 0;
    const B0 = T.birds ?? 54; for (const b of birds) { const d = f - B0; b.g.visible = !!S1 && d >= 0 && d < 70; if (b.g.visible) { const s = 6 * (1 - Math.exp(-d / 14)) + d * .05; b.g.position.copy(V(b.d[0] * s * .9, -1.3 + b.d[1] * s, BZ - 1.6 + b.d[2] * s)); const fp = Math.sin(d * 1.9 + b.ph) * .9; b.a.rotation.z = -fp; b.b.rotation.z = fp; if (R && R.camera) b.g.quaternion.copy(R.camera.quaternion); } } };
  return { update, anchors: { apex: APEX, spear_base: [S.x, S.y, S.base], spear_tip: [S.x, S.y, S.tip], nail_head: [S.x - .298, S.y - .03, roofZ(-.34, 0) + .178], rival_angel: [RIVAL.x, RIVAL.y, RIVAL.top], piazza: [(PZ.x0 + PZ.x1) / 2, (PZ.y0 + PZ.y1) / 2, TOWN_Z], bracket_eye: EYE, wire_foot: WIRE_FOOT } };
}
