// HELD AND NEAR PROPS for "Armor Where Nobody Shot": real 3D objects with their story marks. Owner: props-hero. No top-level side effects.
//
//   import { buildLantern, buildPlate, buildSlideRule, buildBriefcase, buildChalk, buildMug, buildMugHalf, buildPaddles, buildStepLadder,
//            buildRivetGun, buildClipboard } from './props.js';
//   const L = buildLantern(THREE, { toon: ctx.toon });  scene.add(L.group);  L.group.position.copy(ctx.B2T([x, y, z]));  L.setFlame(true, t);
//
// Every builder is (THREE, opts) -> { group, grip, ...anchors, setFlame, setLid, flame, lid }. three.js axes (Y up), metres, the group's origin
// on the surface the prop rests on. `grip` is the hand point (THREE.Vector3, group-local). Sizes are a little larger than life, as the cast's
// fists are (opts.scale multiplies). opts.toon = ctx.toon or opts.ctx = ctx (the kit's toon material; a matching one is made when both are missing).
// HELD (film.json "held3d": [{ who, obj, module: "sets/props.js", builder: "buildSlideRule" }]): the kit calls builder(THREE, { inHand: true }).
// With inHand the prop is posed as it is carried (upright in the card plane, +X screen right, +Z to the lens) and shifted so its grip sits where the
// kit's default hand anchor is ([0, 0.0259, 0]); the kit's setLid / setFlame / flame calls are answered by every prop.
// Shiny parts (brass, chrome, glass, glaze) are MeshPhongMaterial so the glint comes from the light. Red is used nowhere (the pins own it).

const TAU = Math.PI * 2, HAND_Y = 0.0259;
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function kit(THREE, opts, rootName) {
  let grad = null;
  const toon = opts.toon || (opts.ctx && opts.ctx.toon) || ((c, op = {}) => { if (!grad) { grad = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true; } return new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...op }); });
  const root = new THREE.Group(); root.name = rootName; root.userData.role = 'prop'; const inner = new THREE.Group(); inner.name = rootName + '_body'; root.add(inner);
  const cnt = {}, mc = new Map(), UP = new THREE.Vector3(0, 1, 0), V = p => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (m, name, role, op = {}) => { cnt[name] = (cnt[name] || 0) + 1; m.name = rootName + '_' + name + (cnt[name] > 1 ? '_' + String(cnt[name]).padStart(2, '0') : ''); m.userData.role = role; if (op.mat) m.userData.mat = op.mat; m.castShadow = op.cast ?? true; m.receiveShadow = true; (op.parent || inner).add(m); return m; };
  const M = (col, op) => { const k = col + (op ? JSON.stringify(op) : ''); if (!mc.has(k)) mc.set(k, toon(col, op || {})); return mc.get(k); };
  const shiny = (col, sh = 80, spec = '#fff1d0', op = {}) => new THREE.MeshPhongMaterial({ color: col, shininess: sh, specular: spec, ...op });
  const K = { toon, root, inner, add, M, shiny, V,
    box: (name, role, size, at, col, op = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), op.m || M(col)); m.position.copy(V(at)); if (op.rot) m.rotation.set(op.rot[0], op.rot[1], op.rot[2]); return add(m, name, role, op); },
    cyl: (name, role, a, b, r, col, op = {}) => { const A = V(a), B = V(b), d = B.clone().sub(A), L = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(op.r2 ?? r, r, L, op.seg ?? 14, 1, !!op.open), op.m || M(col)); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return add(m, name, role, op); },
    lathe: (name, role, prof, col, op = {}) => { const m = new THREE.Mesh(new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(Math.max(0, q[0]), q[1])), op.seg ?? 28, op.p0 ?? 0, op.pl ?? TAU), op.m || M(col, { side: THREE.DoubleSide })); if (op.at) m.position.copy(V(op.at)); if (op.rot) m.rotation.set(op.rot[0], op.rot[1], op.rot[2]); return add(m, name, role, op); },
    tube: (name, role, pts, r, col, op = {}) => add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), !!op.closed, 'catmullrom', op.tension ?? .5), op.seg ?? Math.max(10, pts.length * 6), r, op.rs ?? 7, !!op.closed), op.m || M(col)), name, role, op),
    torus: (name, role, R, r, at, col, op = {}) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, op.rs ?? 7, op.seg ?? 24, op.arc ?? TAU), op.m || M(col)); m.position.copy(V(at)); m.rotation.set(...(op.rot || [Math.PI / 2, 0, 0])); return add(m, name, role, op); },
    sph: (name, role, r, at, col, op = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, op.seg ?? 14, op.seg2 ?? 10), op.m || M(col)); m.position.copy(V(at)); if (op.s) m.scale.set(op.s[0], op.s[1], op.s[2]); return add(m, name, role, op); },
    tex: (W, H, fn) => { const c = document.createElement('canvas'); c.width = W; c.height = H; fn(c.getContext('2d'), W, H); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; },
    grain: (g, W, H, base, dark, seed = 3, n = 140) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, H); for (let i = 0; i < n; i++) { g.strokeStyle = dark; g.globalAlpha = .08 + r() * .22; g.lineWidth = 1 + r() * 2.5; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + (r() - .5) * 14, W * .7, y + (r() - .5) * 14, W, y + (r() - .5) * 8); g.stroke(); } g.globalAlpha = 1; },
    // close the prop: scale, pose for the hand, hand back the anchors
    done(grip, extra = {}, flameObj) { const s = opts.scale ?? 1; inner.scale.setScalar(s); const g = V(grip).multiplyScalar(s); if (opts.inHand) inner.position.set(-g.x, HAND_Y - g.y, -g.z); const A = p => p && V(p).multiplyScalar(s).add(inner.position), out = {};
      for (const [k, v] of Object.entries(extra)) out[k] = Array.isArray(v) && typeof v[0] === 'number' ? A(v) : Array.isArray(v) && Array.isArray(v[0]) ? v.map(A) : v;
      const flame = flameObj || new THREE.Group(); if (!flameObj) { flame.name = rootName + '_no_flame'; flame.visible = false; root.add(flame); }
      return { group: root, grip: A(grip), lid: null, flame, setLid() {}, setFlame() {}, ...out }; } };
  return K;
}

// ---------- the Chief's amber hurricane lantern: the film's ONE constant warm light ----------
export function buildLantern(THREE, opts = {}) {
  const K = kit(THREE, opts, 'lantern'), brass = K.shiny('#c9a23f', 70), steel = K.shiny('#8d949a', 60), dk = '#3a3326';
  K.lathe('fount', 'metal', [[0, 0], [.088, 0], [.098, .012], [.1, .05], [.088, .078], [.05, .092], [.04, .096]], 0, { m: brass, mat: 'brass' });
  K.torus('fount_foot_ring', 'metal', .094, .006, [0, .006, 0], 0, { m: brass, mat: 'brass' });
  K.cyl('filler_cap', 'metal', [.062, .078, .03], [.066, .1, .032], .014, 0, { m: brass, mat: 'brass', seg: 10 }); K.torus('filler_cap_knurl', 'metal', .014, .003, [.065, .096, .0315], '#8a6d24', { rot: [Math.PI / 2 - .15, 0, 0], seg: 12 });
  K.cyl('burner_collar', 'metal', [0, .092, 0], [0, .128, 0], .046, 0, { m: brass, mat: 'brass', r2: .05 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; K.box('burner_air_slot', 'metal', [.007, .014, .004], [Math.sin(a) * .049, .112, Math.cos(a) * .049], '#1c1712', { rot: [0, a, 0], cast: false }); }
  K.cyl('wick_rod', 'metal', [.04, .108, 0], [.094, .104, 0], .004, 0, { m: steel, seg: 6 }); K.cyl('wick_wheel', 'metal', [.094, .104, 0], [.1, .104, 0], .016, 0, { m: brass, mat: 'brass', seg: 12 });
  K.box('wick_holder', 'metal', [.03, .012, .008], [0, .134, 0], 0, { m: brass, cast: false }); K.box('wick', 'cloth', [.02, .012, .004], [0, .145, 0], '#e9dfc4', { cast: false });
  // flame: amber core, never white; two nested teardrops
  const flame = new THREE.Group(); flame.name = 'lantern_flame'; flame.position.set(0, .15, 0); K.inner.add(flame);
  const tear = [[0, 0], [.012, .006], [.017, .02], [.013, .04], [.006, .058], [0, .07]];
  const fOut = K.lathe('flame_outer', 'lamp', tear, 0, { m: new THREE.MeshBasicMaterial({ color: '#ff8a1e', transparent: true, opacity: .85, depthWrite: false, toneMapped: false }), parent: flame, cast: false, seg: 12, mat: 'flame' });
  const fCore = K.lathe('flame_core', 'lamp', tear.map(q => [q[0] * .58, q[1] * .7 + .004]), 0, { m: new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false }), parent: flame, cast: false, seg: 10, mat: 'flame' });
  // glass chimney with a soot ring near the top, wire guard, the two hurricane tubes, vented top, bail handle with a wooden grip
  const glass = K.shiny('#ffd79a', 150, '#fff3d6', { transparent: true, opacity: .34, side: THREE.DoubleSide, depthWrite: false, emissive: '#ff9a2e', emissiveIntensity: .0 });
  K.lathe('glass_chimney', 'glass', [[.047, .128], [.074, .158], [.088, .2], [.08, .25], [.056, .29], [.05, .3]], 0, { m: glass, cast: false, mat: 'glass_amber' });
  K.lathe('glass_soot', 'glass', [[.074, .262], [.056, .29], [.05, .3]], 0, { m: new THREE.MeshBasicMaterial({ color: '#2a2018', transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false }), cast: false });
  for (const y of [.17, .235]) K.torus('guard_ring', 'metal', y < .2 ? .09 : .088, .0032, [0, y, 0], 0, { m: steel, mat: 'steel_wire', cast: false });
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .78; K.tube('guard_wire', 'metal', [[Math.sin(a) * .052, .13, Math.cos(a) * .052], [Math.sin(a) * .09, .17, Math.cos(a) * .09], [Math.sin(a) * .088, .235, Math.cos(a) * .088], [Math.sin(a) * .055, .298, Math.cos(a) * .055]], .0028, 0, { m: steel, rs: 5, cast: false, mat: 'steel_wire' }); }
  for (const s of [-1, 1]) { K.tube('air_tube', 'metal', [[s * .086, .07, 0], [s * .118, .12, 0], [s * .124, .2, 0], [s * .112, .29, 0], [s * .07, .335, 0], [s * .04, .34, 0]], .0115, 0, { m: brass, mat: 'brass' }); K.torus('air_tube_collar', 'metal', .014, .004, [s * .092, .078, 0], 0, { m: brass, rot: [Math.PI / 2, 0, s * .5], seg: 10 }); }
  K.lathe('chimney_cap', 'metal', [[.052, .298], [.062, .304], [.064, .33], [.046, .352], [.03, .362], [.048, .37], [.048, .378], [0, .386]], 0, { m: brass, mat: 'brass' });
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; K.box('cap_vent', 'metal', [.008, .012, .004], [Math.sin(a) * .0635, .318, Math.cos(a) * .0635], '#1c1712', { rot: [0, a, 0], cast: false }); }
  K.tube('lift_lever', 'metal', [[.05, .13, .03], [.085, .125, .05], [.1, .1, .055]], .003, 0, { m: steel, rs: 5, cast: false });
  const bail = new THREE.Group(); bail.name = 'lantern_bail'; bail.position.set(0, .29, 0); K.inner.add(bail);
  K.tube('bail_wire', 'metal', Array.from({ length: 11 }, (_, i) => { const a = i / 10 * Math.PI; return [Math.cos(a) * .112, Math.sin(a) * .2, 0]; }), .0038, 0, { m: steel, parent: bail, rs: 6, mat: 'steel_wire' });
  K.cyl('bail_grip', 'wood', [-.03, .2, 0], [.03, .2, 0], .011, '#7a5334', { parent: bail, mat: 'wood', seg: 10 });
  for (const s of [-1, 1]) K.torus('bail_eye', 'metal', .008, .003, [s * .112, .29, 0], 0, { m: steel, rot: [0, Math.PI / 2, 0], seg: 10, cast: false });
  K.box('maker_plate', 'metal', [.03, .016, .002], [0, .045, .1], 0, { m: K.shiny('#e0c36a', 90), cast: false });
  const R = K.done(opts.inHand ? [0, .49, 0] : [0, .49, 0], { base: [0, 0, 0], flame_pos: [0, .185, 0], hook_point: [0, .49, 0] }, flame);
  // vfx-artist 2026-11-13 (FIX_LIST_v2 C6): the lantern is the film's signature light and NEVER clips to white. (1) every lantern material gets a soft
  // ceiling on its brightest channel (hue kept, peak 1.12, so the kit's bloom, which starts at luminance .95, cannot burn it out, whatever lamp
  // stands beside it); (2) its glow is its own soft amber halo with a fixed strength, hidden in the kit's character-mask pass.
  const capLight = m => { if (!m || m.userData.lanternCap) return; m.userData.lanternCap = true; const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <tonemapping_fragment>', 'float lpk = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)); if (lpk > .72) gl_FragColor.rgb *= (.72 + .4 * (1. - exp(-(lpk - .72) / .4))) / lpk;\n#include <tonemapping_fragment>'); };
    m.customProgramCacheKey = () => 'lantern_cap'; m.needsUpdate = true; };
  K.root.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) capLight(m); });
  const haloMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 1 }, uS: { value: .95 * (opts.scale ?? 1) } },
    vertexShader: 'uniform float uS; varying vec2 vQ; void main(){ vQ = position.xy * 2.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy * uS; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uK; varying vec2 vQ; void main(){ float r = length(vQ), a = (exp(-r * r * 5.5) * .3 + exp(-r * r * 30.) * .42) * (1. - smoothstep(.8, 1., r)) * uK; gl_FragColor = vec4(vec3(1., .45, .085) * a, 1.); }' });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat); halo.name = 'lantern_halo'; halo.userData.role = 'lamp'; halo.userData.noExport = true; halo.frustumCulled = false; halo.castShadow = halo.receiveShadow = false; halo.renderOrder = 8; halo.position.set(0, .2, 0); K.inner.add(halo);
  halo.onBeforeRender = (r, sc, c, g) => { if (sc.overrideMaterial) { g.userData._dr = [g.drawRange.start, g.drawRange.count]; g.setDrawRange(0, 0); } }; halo.onAfterRender = (r, sc, c, g) => { if (g.userData._dr) { g.setDrawRange(g.userData._dr[0], g.userData._dr[1]); g.userData._dr = null; } };
  let level = 1; R.glass = glass; R.bail = bail; R.halo = halo;
  R.setFlame = (on = true, t = 0, lv) => { if (lv != null) level = lv; const k = on ? level : 0, fl = 1 + .07 * Math.sin(t * 13.1) + .05 * Math.sin(t * 23.7 + 1); flame.visible = k > .02; flame.scale.set(k * (2 - fl), k * fl, k * (2 - fl)); flame.rotation.z = .06 * Math.sin(t * 7.3); glass.emissiveIntensity = .9 * k; glass.opacity = .36 + .24 * k; haloMat.uniforms.uK.value = k * (.9 + .1 * (fl - 1) / .12); halo.visible = k > .02; };
  R.setFlame(opts.lit ?? true, 0, opts.level ?? 1); return R;
}

// ---------- steel ARMOR plate: stencil and number, four real bolt holes, mill scratches ----------
export function buildPlate(THREE, opts = {}) {
  const K = kit(THREE, opts, 'armor_plate'), n = opts.n ?? 1, W = opts.w ?? .7, H = opts.h ?? .5, T = opts.t ?? .03, up = opts.upright ?? !!opts.inHand;
  const sh = new THREE.Shape(), r = .02; sh.moveTo(-W / 2 + r, -H / 2); sh.lineTo(W / 2 - r, -H / 2); sh.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + r); sh.lineTo(W / 2, H / 2 - r); sh.quadraticCurveTo(W / 2, H / 2, W / 2 - r, H / 2); sh.lineTo(-W / 2 + r, H / 2); sh.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - r); sh.lineTo(-W / 2, -H / 2 + r); sh.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + r, -H / 2);
  const HX = W / 2 - .06, HY = H / 2 - .06; for (const [x, y] of [[-HX, -HY], [HX, -HY], [HX, HY], [-HX, HY]]) { const p = new THREE.Path(); p.absarc(x, y, .02, 0, TAU, true); sh.holes.push(p); }
  const tex = K.tex(700, 500, (g, w, h) => { const q = rng(40 + n); g.fillStyle = '#7d868e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = q() < .5 ? `rgba(255,255,255,${q() * .08})` : `rgba(0,0,0,${q() * .1})`; g.fillRect(q() * w, q() * h, 30 + q() * 200, 1 + q() * 2); }
    for (let i = 0; i < 16; i++) { g.strokeStyle = `rgba(220,226,232,${.25 + q() * .4})`; g.lineWidth = 1 + q() * 1.5; g.beginPath(); const x = q() * w, y = q() * h; g.moveTo(x, y); g.lineTo(x + (q() - .5) * 220, y + (q() - .5) * 60); g.stroke(); }
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(122,74,40,${q() * .35})`; const e = q() < .5; g.beginPath(); g.arc(e ? q() * w : (q() < .5 ? 0 : w), e ? (q() < .5 ? 0 : h) : q() * h, 6 + q() * 26, 0, TAU); g.fill(); }
    g.fillStyle = '#f1ece0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 150px Impact, "Arial Black", sans-serif'; g.fillText('ARMOR', w * .5, h * .37); g.font = '900 170px Impact, "Arial Black", sans-serif'; g.fillText(String(n), w * .5, h * .73);
    g.fillStyle = '#7d868e'; for (let x = 150; x < w - 60; x += 103) g.fillRect(x, h * .18, 4, h * .7);                                                    // stencil bridges
    g.strokeStyle = 'rgba(243,240,230,.8)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * .8, h * .62); g.lineTo(w * .84, h * .72); g.lineTo(w * .93, h * .5); g.stroke(); });   // the Chief's chalk tick
  tex.repeat.set(1 / W, 1 / H); tex.offset.set(.5, .5);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 2, curveSegments: 10 }); geo.translate(0, 0, -T / 2);
  const holder = new THREE.Group(); holder.name = 'armor_plate_pose'; K.inner.add(holder);
  K.add(new THREE.Mesh(geo, [K.toon('#ffffff', { map: tex }), K.M('#4f565c')]), 'steel', 'metal', { mat: 'steel_plate', parent: holder });
  K.box('back_face', 'metal', [W - .1, H - .1, .002], [0, 0, -T / 2 - .0045], '#6a7279', { parent: holder, cast: false, mat: 'steel_plate' });
  for (const [x, y] of [[-HX, -HY], [HX, -HY], [HX, HY], [-HX, HY]]) K.torus('bolt_hole_chamfer', 'metal', .023, .004, [x, y, T / 2 + .003], '#3f454a', { parent: holder, rot: [0, 0, 0], seg: 14, cast: false });
  if (up) holder.position.set(0, H / 2, 0); else { holder.rotation.x = -Math.PI / 2; holder.position.set(0, T / 2 + .004, 0); }
  const P = (x, y) => up ? [x, y + H / 2, 0] : [x, T / 2, -y];
  return K.done(P(-W / 2, 0), { grip_left: P(-W / 2, 0), grip_right: P(W / 2, 0), top: P(0, 0), bolt_holes: [[-HX, -HY], [HX, -HY], [HX, HY], [-HX, HY]].map(q => P(q[0], q[1])) });
}

// ---------- the Mathematician's slide rule: boxwood, brass end braces, glass cursor in a brass frame ----------
export function buildSlideRule(THREE, opts = {}) {
  const K = kit(THREE, opts, 'slide_rule'), L = .46, W = .058, T = .012, lying = opts.lying ?? !opts.inHand, brass = K.shiny('#c9a23f', 90);
  const g0 = new THREE.Group(); g0.name = 'slide_rule_pose'; K.inner.add(g0); const P = { parent: g0 };
  const scale = seed => K.tex(1024, 64, (g, w, h) => { K.grain(g, w, h, '#dcbb74', '#9a7440', seed, 40); g.fillStyle = g.strokeStyle = '#2a2118'; g.lineWidth = 2; for (let d = 1; d < 10; d++) { const x0 = Math.log10(d) * (w - 60) + 30, x1 = Math.log10(d + 1) * (w - 60) + 30; g.font = 'bold 22px Georgia, serif'; g.textAlign = 'center'; g.fillText(String(d), x0, 26); for (let k = 0; k < 10; k++) { const x = x0 + (Math.log10(d + k / 10) - Math.log10(d)) * (w - 60); g.beginPath(); g.moveTo(x, h); g.lineTo(x, h - (k === 0 ? 30 : k === 5 ? 22 : 13)); g.stroke(); } } g.fillText('1', w - 30, 26); });
  // stock in two rails, the slide between them pushed out a little, the back
  for (const s of [-1, 1]) { const m = K.box('stock_rail', 'wood', [W * .3, L, T], [s * W * .35, L / 2, 0], 0, { ...P, m: [K.M('#c9a45c'), K.M('#c9a45c'), K.M('#b8904c'), K.M('#b8904c'), K.toon('#ffffff', { map: scale(s + 3) }), K.M('#c9a45c')], mat: 'boxwood' }); m.geometry.attributes.uv.array.set(s > 0 ? [0, 0, 0, 1, 1, 0, 1, 1] : [1, 1, 1, 0, 0, 1, 0, 0], 32); }
  { const m = K.box('slide', 'wood', [W * .38, L, T * .9], [0, L / 2 + .045, 0], 0, { ...P, m: [K.M('#e3c682'), K.M('#e3c682'), K.M('#caa55c'), K.M('#caa55c'), K.toon('#f6f0de', { map: scale(9) }), K.M('#d7b56d')], mat: 'boxwood' }); m.geometry.attributes.uv.array.set([1, 1, 1, 0, 0, 1, 0, 0], 32); }
  K.box('back', 'wood', [W, L, T * .3], [0, L / 2, -T * .5], '#b8904c', { ...P, mat: 'boxwood' });
  for (const y of [.012, L - .012]) { K.box('end_brace', 'metal', [W + .004, .018, T + .004], [0, y, -.001], 0, { ...P, m: brass, mat: 'brass' }); for (const s of [-1, 1]) K.cyl('brace_screw', 'metal', [s * W * .36, y, T / 2], [s * W * .36, y, T / 2 + .003], .003, '#6d5417', { ...P, seg: 6, cast: false }); }
  // cursor: glass plate with a hairline, brass rails top and bottom, two screws
  const cy = L * .62; K.box('cursor_glass', 'glass', [W + .006, .05, .002], [0, cy, T / 2 + .004], 0, { ...P, m: K.shiny('#cfe6ee', 160, '#ffffff', { transparent: true, opacity: .42, depthWrite: false }), cast: false, mat: 'glass' });
  K.box('cursor_hairline', 'metal', [W + .004, .0016, .0006], [0, cy, T / 2 + .0055], '#191512', { ...P, cast: false });
  for (const s of [-1, 1]) { K.box('cursor_rail', 'metal', [.008, .056, T + .012], [s * (W / 2 + .004), cy, .001], 0, { ...P, m: brass, mat: 'brass' }); K.cyl('cursor_screw', 'metal', [s * (W / 2 + .004), cy + .018, T / 2 + .006], [s * (W / 2 + .004), cy + .018, T / 2 + .009], .003, '#6d5417', { ...P, seg: 6, cast: false }); }
  K.box('ink_spot', 'wood', [.012, .016, .0006], [-W * .36, L * .2, T / 2 + .0004], '#2c2a3a', { ...P, cast: false });
  if (lying) { g0.rotation.set(-Math.PI / 2, 0, Math.PI / 2); g0.position.set(L / 2, T * .65, 0); }
  const Q = y => lying ? [L / 2 - y, T * .65, 0] : [0, y, 0];
  return K.done(Q(L * .17), { tip: Q(L + .045), butt: Q(0), cursor: Q(cy) });
}

// ---------- his brown leather briefcase: two brass catches, a handle on D-rings, stands on end as his step ----------
export function buildBriefcase(THREE, opts = {}) {
  const K = kit(THREE, opts, 'briefcase'), W = .42, H = .3, D = .12, onEnd = opts.onEnd ?? !opts.inHand, brass = K.shiny('#c9a23f', 90);
  const g0 = new THREE.Group(); g0.name = 'briefcase_pose'; K.inner.add(g0); const P = { parent: g0 };
  const leather = K.tex(512, 384, (g, w, h) => { const r = rng(15); g.fillStyle = '#7a4d2c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = r() < .5 ? `rgba(40,20,8,${r() * .16})` : `rgba(255,220,170,${r() * .09})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3.5, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(236,214,160,.75)'; g.setLineDash([7, 5]); g.lineWidth = 2.2; g.strokeRect(14, 14, w - 28, h - 28); g.setLineDash([]);                 // stitching
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { const gr = g.createRadialGradient(x, y, 0, x, y, 90); gr.addColorStop(0, 'rgba(214,180,130,.7)'); gr.addColorStop(1, 'rgba(214,180,130,0)'); g.fillStyle = gr; g.fillRect(x - 90, y - 90, 180, 180); }   // scuffed corners
    g.strokeStyle = 'rgba(40,22,10,.5)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 120, y + (r() - .5) * 40); g.stroke(); } });
  const side = K.M('#6b4226');
  K.box('body', 'cloth', [W, H, D], [0, H / 2, 0], 0, { ...P, m: [side, side, side, side, K.toon('#ffffff', { map: leather }), K.toon('#ffffff', { map: leather })], mat: 'leather' });
  for (const z of [-1, 1]) K.tube('edge_piping', 'cloth', [[-W / 2, .004, z * D / 2], [W / 2, .004, z * D / 2], [W / 2, H - .004, z * D / 2], [-W / 2, H - .004, z * D / 2]], .008, '#5a3620', { ...P, closed: true, tension: .02, seg: 80, rs: 6, mat: 'leather' });
  K.box('lid_seam', 'cloth', [W + .004, .006, D + .004], [0, H * .8, 0], '#3f2616', { ...P, cast: false });
  for (const s of [-1, 1]) { K.box('catch_plate', 'metal', [.05, .05, .006], [s * .12, H * .8, D / 2 + .003], 0, { ...P, m: brass, mat: 'brass' }); K.box('catch_hasp', 'metal', [.022, .044, .008], [s * .12, H * .835, D / 2 + .008], 0, { ...P, m: K.shiny('#e0c36a', 110), mat: 'brass' }); K.cyl('catch_keyhole', 'metal', [s * .12, H * .775, D / 2 + .006], [s * .12, H * .775, D / 2 + .0075], .005, '#2a1d0c', { ...P, seg: 8, cast: false });
    K.torus('handle_ring', 'metal', .013, .0035, [s * .075, H + .012, 0], 0, { ...P, m: brass, rot: [0, 0, 0], seg: 12, mat: 'brass' }); K.box('handle_mount', 'metal', [.03, .006, .03], [s * .075, H + .003, 0], 0, { ...P, m: brass, mat: 'brass' }); }
  K.tube('handle', 'cloth', [[-.075, H + .016, 0], [-.06, H + .05, 0], [0, H + .062, 0], [.06, H + .05, 0], [.075, H + .016, 0]], .011, '#5a3620', { ...P, rs: 8, mat: 'leather' });
  for (const x of [-1, 1]) for (const z of [-1, 1]) { K.cyl('foot_stud', 'metal', [x * (W / 2 - .05), -.006, z * (D / 2 - .03)], [x * (W / 2 - .05), 0, z * (D / 2 - .03)], .011, 0, { ...P, m: brass, seg: 10, mat: 'brass' }); for (const y of [0, 1]) K.sph('corner_cap', 'cloth', .017, [x * (W / 2 - .004), y * H + (y ? -.004 : .004), z * (D / 2 - .004)], '#4a2c18', { ...P, mat: 'leather' }); }
  // story mark: the dusty scuff on the end he stands on
  K.box('dust_scuff', 'cloth', [.002, H * .62, D * .66], [W / 2 + .0012, H / 2, 0], '#c9b38c', { ...P, cast: false, m: K.toon('#c9b38c', { transparent: true, opacity: .55 }) });
  if (onEnd) { g0.rotation.z = Math.PI / 2; g0.position.set(H / 2, W / 2, 0); }
  const Q = p => onEnd ? [H / 2 - p[1], W / 2 + p[0], p[2]] : p;
  return K.done(Q([0, H + .058, 0]), { top: Q([W / 2, H / 2, 0]), handle: Q([0, H + .058, 0]), height: onEnd ? W : H });
}

// ---------- a stick of white chalk: worn round at the tip, snapped flat at the back ----------
export function buildChalk(THREE, opts = {}) {
  const K = kit(THREE, opts, 'chalk'), L = opts.len ?? .13, r = .014, col = '#f3f0e6', lying = opts.lying ?? !opts.inHand;
  const g0 = new THREE.Group(); g0.name = 'chalk_pose'; K.inner.add(g0); const P = { parent: g0 };
  const stick = (name, y0, y1, tip) => { K.cyl(name, 'chalk', [0, y0, 0], [0, y1, 0], r, col, { ...P, r2: tip ? r * .82 : r, seg: 12, mat: 'chalk' }); if (tip) K.sph(name + '_worn_tip', 'chalk', r * .82, [0, y1, 0], col, { ...P, s: [1, .55, 1], mat: 'chalk' }); else K.box(name + '_break', 'chalk', [r * 1.2, .003, r * 1.5], [.002, y1, 0], '#dcd8cb', { ...P, rot: [0, .5, .25], cast: false }); };
  if (opts.broken) { stick('piece_front', 0, L * .55, true); const g1 = new THREE.Group(); g1.name = 'chalk_piece_back'; g1.position.set(.05, 0, .02); g1.rotation.y = .9; g0.add(g1); K.cyl('piece_back', 'chalk', [0, -L * .4, 0], [0, 0, 0], r, col, { parent: g1, seg: 12, mat: 'chalk' }); K.box('piece_back_break', 'chalk', [r * 1.2, .003, r * 1.5], [0, .001, 0], '#dcd8cb', { parent: g1, rot: [0, .2, -.3], cast: false });
    for (let i = 0; i < 6; i++) K.sph('crumb', 'chalk', .003 + (i % 3) * .0012, [.02 + (i * .37 % 1) * .04, L * .55 + (i % 2) * .004, (i * .61 % 1 - .5) * .04], col, { ...P, cast: false }); }
  else stick('stick', 0, L, true);
  if (lying) { g0.rotation.z = -Math.PI / 2; g0.position.set(-L / 2, r, 0); }
  const Q = y => lying ? [y - L / 2, r, 0] : [0, y, 0];
  return K.done(Q(L * (opts.gripAt ?? .35)), { tip: Q(L + r * .4), butt: Q(0) });   // gripAt: where along the stick the fingers hold it (0 = the snapped end)
}

// ---------- ROUND 3: a thick glazed mess mug as ONE smooth mesh with its colours baked in (the same code is in sets/props.js and in the mug shelf of sets/hangar.js) ----------
// The wall has real thickness and a rolled rim. A chip is a notch CUT OUT of the rim: the wall is lower there, its broken top shows the pale clay body, and the stained inside shows through the gap.
// o: { R, H, w, chips: [{ a (angle from +Z toward +X), wd (half-width, radians), d (depth, m), kind: 'bite' | 'vee' | 'wide', flake }], half: { a, span, seed } (a broken half: jagged crack lines, clay break faces),
//      col (glaze), line (the rim line colour, false = none), seg }. Returns a BufferGeometry with position, color and index. Handle: mugHandle below.
function mugGeo(THREE, o) {
  const TAU = Math.PI * 2, R = o.R, H = o.H, w = o.w, k = R / .05, hs = s => { const v = Math.sin(s * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }, lerp = (a, b, t) => a + (b - a) * t, wrap = d => ((d + Math.PI) % TAU + TAU) % TAU - Math.PI;
  const C = s => new THREE.Color(s), glaze = C(o.col || '#f4f2ea'), clay = C(o.clay || '#b8946c'), clayD = C('#94714d'), line = o.line === false ? null : C(o.line || '#3f5f96'), inTop = glaze.clone().multiply(C('#cfc7b4')), inLow = glaze.clone().multiply(C('#8f7f66')), chips = o.chips || [], half = o.half || null;
  let A; if (half) A = Array.from({ length: 21 }, (_, i) => i / 20); else { A = Array.from({ length: o.seg || 30 }, (_, i) => i / (o.seg || 30) * TAU); for (const c of chips) for (let i = 0; i <= 12; i++) A.push(((c.a + (i / 6 - 1) * c.wd * 1.08) % TAU + TAU) % TAU); A.sort((p, q) => p - q); A = A.filter((v, i) => !i || v - A[i - 1] > 2e-3); A.push(A[0] + TAU); }
  const depth = ph => { let d = 0; for (const c of chips) { const x = Math.abs(wrap(ph - c.a)) / c.wd; if (x >= 1) continue; const s = c.kind === 'vee' ? 1 - x : c.kind === 'wide' ? Math.pow(1 - x * x, 1.5) : Math.sqrt(1 - x * x); d = Math.max(d, c.d * s * (1 + .2 * (hs(Math.round(ph * 40) + c.a * 9) - .5))); } return d; };
  const flaked = ph => chips.some(c => c.flake && Math.abs(wrap(ph - c.a)) < c.wd * .85);
  // a half's two crack lines wander down the wall: one offset per level (0 centre of the base .. 7 the rim's top)
  const jag = half ? [0, 1].map(sd => Array.from({ length: 8 }, (_, l) => l < 2 ? (hs(half.seed * 3.1 + sd * 7 + 1) - .5) * .5 : (hs(half.seed * 3.1 + sd * 7 + l) - .5) * .42 + (l % 2 ? .08 : -.08) * (sd ? 1 : -1))) : null;
  const pos = [], col = [], idx = [], NR = 19, LV = [0, 1, 2, 3, 4, 4.5, 4.5, 4.75, 4.75, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0];
  const jagAt = (sd, lv) => { const a = Math.floor(lv), b = Math.min(7, a + 1); return lerp(jag[sd][a], jag[sd][b], lv - a); };
  A.forEach((t, ci) => { const ph0 = half ? half.a + t * half.span : t, d = depth(ph0), yT = H - d, chip = d > .0005 * k, deep = d > .006 * k || (chip && flaked(ph0)), yb0 = Math.min(H - .024 * k, yT - .0165 * k), yb1 = Math.min(H - .019 * k, yT - .0125 * k), rough = chip ? (hs(ci * 3.7 + R * 91) - .5) * .0014 * k : 0;
    const cl = chip ? clay.clone().lerp(clayD, hs(ci * 1.3 + 5) * .6) : glaze, band = line && !deep ? line : glaze;
    const rows = [[0, 0, clay], [R - .004 * k, 0, clay], [R, .007 * k, glaze], [R, .35 * H, glaze], [R, .62 * H, glaze], [R, yb0, glaze], [R, yb0, band], [R, yb1, band], [R, yb1, glaze], [R, yT - .010 * k, glaze],
      chip ? [R - .0006 * k, yT - .0015 * k, cl] : [R + .0018 * k, yT - .004 * k, glaze], [R - w / 2, yT + rough, cl], chip ? [R - w + .0006 * k, yT - .0015 * k, cl] : [R - w - .0012 * k, yT - .004 * k, glaze],
      [R - w, yT - .012 * k, inTop], [R - w, .62 * H, inTop.clone().lerp(inLow, .35)], [R - w, .35 * H, inTop.clone().lerp(inLow, .7)], [R - w, .018 * k, inLow], [R - w - .008 * k, .012 * k, inLow], [0, .012 * k, inLow]];
    rows.forEach(([r, y, c], j) => { const ph = half ? half.a + lerp(jagAt(0, LV[j]), half.span + jagAt(1, LV[j]), t) : t; pos.push(r * Math.sin(ph), y, r * Math.cos(ph)); col.push(c.r, c.g, c.b); }); });
  for (let i = 0; i < A.length - 1; i++) for (let j = 0; j < NR - 1; j++) { const a = i * NR + j, b = a + 1, c = a + NR, e = c + 1; idx.push(a, c, b, b, c, e); }
  if (half) for (const ci of [0, A.length - 1]) { const base = pos.length / 3, P = [[0, 18], [1, 17], [2, 16], [3, 15], [4, 14], [9, 13], [10, 12], [11, 11]];   // the break face: the wall's cross-section in bare clay, between the outer rows and the inner rows of the edge column
      P.forEach(([jo, ji], n) => { for (const j of [jo, ji]) { const q = (ci * NR + j) * 3, c = clay.clone().lerp(clayD, hs(n * 5.1 + j + ci) * .7); pos.push(pos[q], pos[q + 1], pos[q + 2]); col.push(c.r, c.g, c.b); } });
      for (let n = 0; n < P.length - 1; n++) { const a = base + n * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2, a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  if (!half) { const nm = g.attributes.normal, l = (A.length - 1) * NR; for (let j = 0; j < NR; j++) { const x = nm.getX(j) + nm.getX(l + j), y = nm.getY(j) + nm.getY(l + j), z = nm.getZ(j) + nm.getZ(l + j), s = Math.hypot(x, y, z) || 1; nm.setXYZ(j, x / s, y / s, z / s); nm.setXYZ(l + j, x / s, y / s, z / s); } }
  return g;
}
// the handle: a strap of oval section on two thickened roots, at +X (side -1: at -X). broken: 'stubs' (two stubs with clay break ends are left) | 'loose' (the broken-off loop alone, two clay ends). Returns geometries with baked colours.
function mugHandle(THREE, o) {
  const R = o.R, H = o.H, k = R / .05, sd = o.side === -1 ? -1 : 1, glaze = new THREE.Color(o.col || '#f4f2ea'), clay = new THREE.Color(o.clay || '#b8946c'), out = [];
  const tint = (g, c) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
  const pts = [[-.004, .79], [.017, .835], [.035, .72], [.0395, .5], [.033, .3], [.015, .2], [-.004, .235]].map(([x, y]) => new THREE.Vector3(sd * (R + x * k), y * H, 0)), curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .5);
  const piece = (t0, t1, capA, capB) => { const sub = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => curve.getPoint(t0 + (t1 - t0) * i / 12)), false, 'centripetal'), g = new THREE.TubeGeometry(sub, 22, .0078 * k, 9, false); g.scale(1, 1, 1.38); out.push(tint(g, glaze));
    for (const [on, t] of [[capA, t0], [capB, t1]]) { if (!on) continue; const c = new THREE.CircleGeometry(.0078 * k, 9), p = curve.getPoint(t), tg = curve.getTangent(t); c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg.multiplyScalar(t === t0 ? -1 : 1))); c.scale(1, 1, 1.38); c.translate(p.x, p.y, p.z); out.push(tint(c, clay)); } };
  if (o.broken === 'stubs') { piece(0, .17, false, true); piece(.87, 1, true, false); } else if (o.broken === 'loose') piece(.14, .9, true, true); else piece(0, 1, false, false);
  if (o.broken !== 'loose') for (const t of [0.02, .98]) { const p = curve.getPoint(t), s = new THREE.SphereGeometry(.0112 * k, 10, 8); s.scale(.62, 1.15, 1.5); s.translate(p.x + sd * .002 * k, p.y, 0); out.push(tint(s, glaze)); }
  return out;
}
// ---------- thick white mess mug, chipped at the rim; the Chief's says CHIEF (black, hand-painted). ROUND 3: one smooth glazed mesh (mugGeo above), the chip a notch cut out of the rim ----------
// opts: label ('CHIEF' | ''), chip (angle, false = none), chipSize (width, radians), chipDepth (m), chipKind ('bite' | 'vee' | 'wide'), handleStub, coffee, drip, seed, col (glaze colour: '#d5dfe2' = Ladder's enamel mug)
const mugMat = (THREE, K) => K.mugMat || (K.mugMat = new THREE.MeshPhongMaterial({ color: '#ffffff', vertexColors: true, shininess: 85, specular: '#aeb6c2' }));
function mugParts(THREE, K, o, P, half) {
  const R = .062, Hh = .15, w = .011, sd = o.seed ?? 5, chips = half || o.chip === false ? [] : [{ a: o.chip ?? .9, wd: (o.chipSize ?? .62) / 2, d: o.chipDepth ?? .024, kind: o.chipKind || 'bite', flake: !!o.chipFlake }];
  const geo = mugGeo(THREE, { R, H: Hh, w, chips, col: o.col, half: half ? { a: o.side ?? 0, span: Math.PI * (.9 + (sd * 37 % 10) * .02), seed: sd } : null });
  K.add(new THREE.Mesh(geo, mugMat(THREE, K)), 'body', 'ceramic', { ...P, mat: 'glazed_ceramic' });
  return { R, Hh, w };
}
const mugHandleParts = (THREE, K, o, P, R, Hh, side, broken) => mugHandle(THREE, { R, H: Hh, side, col: o.col, broken }).forEach(hg => K.add(new THREE.Mesh(hg, mugMat(THREE, K)), hg.type === 'CircleGeometry' ? 'handle_break_clay' : hg.type === 'SphereGeometry' ? 'handle_root' : 'handle', 'ceramic', { ...P, mat: hg.type === 'CircleGeometry' ? 'unglazed_ceramic' : 'glazed_ceramic' }));
export function buildMug(THREE, opts = {}) {
  const K = kit(THREE, opts, 'mug'), o = { label: '', coffee: false, handle: true, ...opts }, g0 = new THREE.Group(); g0.name = 'mug_pose'; K.inner.add(g0); const P = { parent: g0 };
  const { R, Hh, w } = mugParts(THREE, K, o, P, false);
  const hs = o.handleSide === -1 ? -1 : 1;   // handleSide -1: the handle on -X (the same mug seen from its other side, the word still to +Z): film.json held3d "flip_opts"
  if (o.handle) mugHandleParts(THREE, K, o, P, R, Hh, hs, o.handleStub ? 'stubs' : null);
  if (o.coffee) K.cyl('coffee', 'water', [0, Hh - .034, 0], [0, Hh - .03, 0], R - w - .0005, 0, { ...P, m: K.shiny('#3a2314', 120, '#ffe9c4'), seg: 24, cast: false, mat: 'coffee' });
  // hand-painted word and a dried coffee run, on a thin sleeve just proud of the glaze, facing +Z
  const tex = K.tex(512, 256, (g, W, H) => { g.clearRect(0, 0, W, H); const r = rng(o.seed ?? 5); if (o.label) { g.fillStyle = '#1d1a18'; g.font = 'bold 120px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(W / 2, H * .56); g.rotate(-.03); g.fillText(o.label, 0, 0); g.restore(); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { g.globalAlpha = r() * .6; g.fillRect(r() * W, r() * H, 2 + r() * 10, 1 + r() * 2); } g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    if (o.drip ?? true) { const x = W * (.12 + r() * .1); g.strokeStyle = 'rgba(96,60,30,.55)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, H * .16); g.bezierCurveTo(x + 6, H * .4, x - 8, H * .55, x + 3, H * (.65 + r() * .25)); g.stroke(); } });
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(R + .0009, R + .0009, Hh - .05, 24, 1, true, -1.15, 2.3), K.toon('#ffffff', { map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); sl.position.set(0, Hh * .5 - .008, 0); K.add(sl, 'paint', 'ceramic', { ...P, cast: false, mat: 'enamel_paint' });
  return K.done([hs * (R + .05), Hh * .5, 0], { rim: [0, Hh, 0], handle: [hs * (R + .05), Hh * .5, 0], height: Hh });
}
// a broken half for the trash barrel: split along two real, wandering crack lines; the break faces show the bare clay of the wall
export function buildMugHalf(THREE, opts = {}) {
  const K = kit(THREE, opts, 'mug_half'), o = { handle: false, lying: true, ...opts }, g0 = new THREE.Group(); g0.name = 'mug_half_pose'; K.inner.add(g0); const P = { parent: g0 };
  const { R, Hh } = mugParts(THREE, K, o, P, true), p0 = o.side ?? 0;
  if (o.handle) { const hg = new THREE.Group(); hg.name = 'mug_half_handle_pose'; hg.rotation.y = p0; g0.add(hg); mugHandleParts(THREE, K, o, { parent: hg }, R, Hh, 1, null); }
  if (o.lying) { g0.rotation.set(Math.PI / 2 - .12, 0, p0 + .3); g0.position.set(0, R * .62, -Hh * .45); }
  return K.done([0, o.lying ? R * .6 : Hh * .5, 0], { height: o.lying ? R : Hh });
}

// ---------- marshalling paddles (a pair): yellow bats with a blue rim, wooden handles, wrist loops ----------
export function buildPaddles(THREE, opts = {}) {
  const K = kit(THREE, opts, 'paddles'), spread = opts.spread ?? (opts.single ? 0 : .62), list = opts.single ? [0] : [spread / 2, -spread / 2], grips = [];
  const face = K.tex(256, 256, (g, W, H) => { const r = rng(21); g.fillStyle = '#f0c232'; g.fillRect(0, 0, W, H); g.strokeStyle = '#2f5fb8'; g.lineWidth = 26; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 13, 0, TAU); g.stroke(); g.lineWidth = 24; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(W * .3, H * .62); g.quadraticCurveTo(W * .45, H * .42, W * .5, H * .34); g.quadraticCurveTo(W * .55, H * .42, W * .7, H * .62); g.stroke();
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(120,90,20,${r() * .4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 60, y + (r() - .5) * 60); g.stroke(); } });
  list.forEach((x, i) => { const g0 = new THREE.Group(); g0.name = 'paddle_' + (i ? 'left' : 'right'); g0.position.set(x, 0, 0); K.inner.add(g0); const P = { parent: g0 }, fm = K.toon('#ffffff', { map: face }), rimM = K.M('#2f5fb8');
    const d = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .016, 32), [rimM, fm, fm]); d.rotation.set(Math.PI / 2, Math.PI / 2, 0); d.position.set(0, .42, 0); K.add(d, 'bat', 'wood', { ...P, mat: 'painted_plywood' });
    K.torus('bat_rim', 'metal', .15, .006, [0, .42, 0], '#27508f', { ...P, rot: [0, 0, 0], seg: 32 });
    K.cyl('handle', 'wood', [0, 0, 0], [0, .3, 0], .019, '#a8733f', { ...P, r2: .016, mat: 'wood', seg: 10 }); for (const y of [.04, .08, .12, .16]) K.torus('handle_wrap', 'cloth', .0195, .004, [0, y, 0], '#5a3620', { ...P, seg: 10, cast: false, mat: 'leather' });
    K.box('handle_tang', 'wood', [.04, .09, .02], [0, .3, 0], '#a8733f', { ...P, mat: 'wood' }); for (const y of [.285, .325]) K.cyl('tang_rivet', 'metal', [0, y, -.012], [0, y, .012], .006, 0, { ...P, m: K.shiny('#c9cdd0', 90), seg: 8, cast: false });
    K.tube('wrist_loop', 'cloth', [[0, .005, 0], [.03, -.04, 0], [0, -.09, 0], [-.03, -.04, 0]], .004, '#5a3620', { ...P, closed: true, rs: 5, cast: false, mat: 'leather' }); K.sph('handle_pommel', 'wood', .021, [0, 0, 0], '#8c5e31', { ...P, s: [1, .6, 1] });
    grips.push([x, .1, 0]); });
  return K.done(grips[0], { grip_right: grips[0], grip_left: grips[grips.length - 1], bat_right: [list[0], .42, 0], bat_left: [list[list.length - 1], .42, 0] });
}

// ---------- Ladder's wooden step ladder: five treads, hinged back frame, folding spreaders, one newer, paler rung ----------
export function buildStepLadder(THREE, opts = {}) {
  const folded = opts.folded ?? !!opts.inHand, K = kit(THREE, opts, 'step_ladder'), HT = 1.8, ZF = folded ? .075 : .46, pale = opts.paleRung ?? 1, steel = K.shiny('#8d949a', 70), zf = y => ZF * (1 - y / HT), hw = y => .29 - .09 * y / HT;
  const wood = seed => K.tex(64, 512, (g, W, H) => { g.save(); g.translate(W, 0); g.rotate(Math.PI / 2); K.grain(g, H, W, '#9a7446', '#5d4022', seed, 60); g.restore(); const r = rng(seed); for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(70,45,22,.6)'; g.beginPath(); g.ellipse(r() * W, r() * H, 4, 7, 0, 0, TAU); g.fill(); } });
  const wm = [K.toon('#ffffff', { map: wood(2) }), K.toon('#f1e4cf', { map: wood(5) })], newWood = K.toon('#ffffff', { map: K.tex(64, 256, (g, W, H) => { g.save(); g.translate(W, 0); g.rotate(Math.PI / 2); K.grain(g, H, W, '#ead7a4', '#c7a868', 8, 40); g.restore(); }) });
  const bar = (name, a, b, w, t, m, role = 'wood', mat = 'wood') => { const A = K.V(a), B = K.V(b), d = B.clone().sub(A), L = d.length(), me = new THREE.Mesh(new THREE.BoxGeometry(w, L, t), m); me.position.copy(A).addScaledVector(d, .5); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return K.add(me, name, role, { mat }); };
  for (const s of [-1, 1]) { bar('front_stile', [s * hw(0), 0, zf(0)], [s * hw(HT), HT, 0], .028, .075, wm[0]); bar('back_leg', [s * (hw(0) - .03), 0, -ZF], [s * (hw(HT) - .03), HT - .04, -.03], .026, .05, wm[1]);
    K.box('foot_pad', 'rubber', [.05, .02, .1], [s * hw(0), .01, zf(0) + .005], '#2a2a2e', { mat: 'rubber' }); K.box('foot_pad', 'rubber', [.045, .02, .07], [s * (hw(0) - .03), .01, -ZF], '#2a2a2e', { mat: 'rubber' });
    // hinge plate with its pivot bolt; folding spreader in two links with a centre rivet
    K.box('hinge_plate', 'metal', [.004, .13, .1], [s * (hw(HT) + .016), HT - .07, -.015], 0, { m: steel, mat: 'steel' }); K.cyl('hinge_bolt', 'metal', [s * (hw(HT) - .05), HT - .05, -.02], [s * (hw(HT) + .024), HT - .05, -.02], .008, 0, { m: steel, seg: 8, mat: 'steel' });
    const ys = .98, a = [s * (hw(ys) + .018), ys, zf(ys)], b = [s * (hw(ys) - .012), ys - .0, -ZF * (1 - ys / HT) - .01], mid = [(a[0] + b[0]) / 2, folded ? ys + .15 : ys - .03, (a[2] + b[2]) / 2];
    bar('spreader_link', a, mid, .004, .022, steel, 'metal', 'steel'); bar('spreader_link', mid, b, .004, .022, steel, 'metal', 'steel'); for (const p of [a, mid, b]) K.cyl('spreader_rivet', 'metal', [p[0] - .008, p[1], p[2]], [p[0] + .008, p[1], p[2]], .007, '#5d6368', { seg: 8, cast: false }); }
  const steps = [];
  for (let i = 0; i < 5; i++) { const y = .3 * (i + 1), isNew = i === pale, m = K.box('tread', 'wood', [hw(y) * 2 + .03, .026, .105], [0, y - .013, zf(y) - .012], 0, { m: isNew ? newWood : wm[i % 2], mat: isNew ? 'wood_new' : 'wood' }); steps.push([0, y, zf(y) - .012]);
    if (!isNew) K.box('tread_wear', 'wood', [hw(y) * .9, .002, .07], [0, y + .0008, zf(y) - .012], '#c9ad7c', { cast: false, m: K.toon('#c9ad7c', { transparent: true, opacity: .55 }) });
    for (const s of [-1, 1]) { K.cyl('tread_screw', 'metal', [s * (hw(y) + .016), y - .013, zf(y) - .012], [s * (hw(y) + .02), y - .013, zf(y) - .012], .006, 0, { m: isNew ? K.shiny('#e6e9ec', 140, '#ffffff') : K.shiny('#6d665c', 30), seg: 8, cast: false, mat: 'steel' }); bar('tread_bracket', [s * hw(y) * .96, y - .026, zf(y) + .03], [s * hw(y) * .96, y - .09, zf(y) + .012], .004, .016, steel, 'metal', 'steel'); } }
  K.box('top_cap', 'wood', [hw(HT) * 2 + .09, .03, .2], [0, HT + .015, -.02], 0, { m: [wm[0], wm[0], K.toon('#ffffff', { map: K.tex(256, 128, (g, W, H) => { K.grain(g, W, H, '#9a7446', '#5d4022', 4, 40); const r = rng(31); for (const c of ['#efe2bd', '#727846', '#c2c7c9', '#efe2bd']) for (let i = 0; i < 4; i++) { g.fillStyle = c; g.beginPath(); g.ellipse(r() * W, r() * H, 4 + r() * 16, 3 + r() * 9, r() * 3, 0, TAU); g.fill(); } g.strokeStyle = 'rgba(40,26,12,.7)'; g.lineWidth = 3; g.beginPath(); g.arc(W * .7, H * .5, 26, 0, TAU); g.stroke(); }) }), wm[0], wm[0], wm[0]], mat: 'wood' });   // paint spots and a mug ring
  for (const y of [.35, 1.05]) bar('back_rail', [-(hw(y) - .03), y, -ZF * (1 - y / HT)], [hw(y) - .03, y, -ZF * (1 - y / HT)], .05, .02, wm[1]);
  bar('back_brace', [-(hw(.35) - .03), .37, -ZF * (1 - .35 / HT) + .012], [hw(1.05) - .03, 1.03, -ZF * (1 - 1.05 / HT) + .012], .04, .012, wm[0]);
  K.tube('rag', 'cloth', [[-.1, HT - .13, .035], [-.03, HT - .2, .05], [.04, HT - .15, .04], [.1, HT - .26, .05]], .012, '#b8a888', { mat: 'cloth', rs: 5 });
  return K.done([hw(1.25) + .0, 1.25, zf(1.25) + .04], { steps, top: [0, HT + .03, -.02], lean: [0, HT, .0], pale_rung: steps[pale], height: HT });
}

// ---------- Rivets' pneumatic rivet gun: barrel, snap die on a spring, trigger, brass air fitting, rubber hose ----------
export function buildRivetGun(THREE, opts = {}) {
  const K = kit(THREE, { scale: 1.5, ...opts }, 'rivet_gun'), body = K.shiny('#59636d', 40, '#dfe8f0'), steel = K.shiny('#c9cdd0', 130, '#ffffff'), brass = K.shiny('#c9a23f', 90), hy = .14;
  K.cyl('barrel', 'metal', [-.06, hy, 0], [.1, hy, 0], .03, 0, { m: body, mat: 'painted_steel' }); K.sph('rear_cap', 'metal', .03, [-.06, hy, 0], 0, { m: body, s: [.6, 1, 1] }); for (const x of [-.03, .06]) K.torus('barrel_band', 'metal', .031, .004, [x, hy, 0], '#3d454d', { rot: [0, Math.PI / 2, 0], seg: 16 });
  K.cyl('nose', 'metal', [.1, hy, 0], [.15, hy, 0], .02, 0, { m: body, r2: .016 }); K.cyl('snap_die', 'metal', [.15, hy, 0], [.21, hy, 0], .011, 0, { m: steel, mat: 'steel', seg: 10 }); K.cyl('snap_die_cup', 'metal', [.21, hy, 0], [.218, hy, 0], .014, 0, { m: steel, seg: 10 });
  for (let i = 0; i < 5; i++) K.torus('retainer_spring', 'metal', .017, .0028, [.152 + i * .009, hy, 0], 0, { m: steel, rot: [0, Math.PI / 2 + .12, 0], seg: 12, cast: false, mat: 'steel_wire' });
  K.box('handle', 'metal', [.042, .12, .036], [-.035, hy - .075, 0], 0, { m: body, rot: [0, 0, -.22], mat: 'painted_steel' }); for (const d of [.03, .055, .08]) K.box('handle_grip_rib', 'rubber', [.047, .014, .04], [-.035 - d * .22, hy - .03 - d, 0], '#26262a', { rot: [0, 0, -.22], mat: 'rubber' });
  K.box('trigger', 'metal', [.012, .04, .014], [.004, hy - .05, 0], 0, { m: steel, rot: [0, 0, .25], mat: 'steel' }); K.cyl('trigger_pin', 'metal', [.0, hy - .032, -.02], [.0, hy - .032, .02], .004, '#3d454d', { seg: 6, cast: false });
  K.tube('trigger_guard', 'metal', [[.03, hy - .028, 0], [.035, hy - .07, 0], [.01, hy - .095, 0], [-.012, hy - .1, 0]], .004, 0, { m: body, rs: 5 });
  K.cyl('air_fitting', 'metal', [-.062, .012, 0], [-.058, .034, 0], .014, 0, { m: brass, seg: 6, mat: 'brass' }); K.cyl('air_nipple', 'metal', [-.066, -.012, 0], [-.062, .012, 0], .008, 0, { m: brass, seg: 8, mat: 'brass' });
  K.box('maker_plate', 'metal', [.05, .018, .002], [.02, hy, .0295], 0, { m: K.shiny('#e0c36a', 90), cast: false });
  if (opts.hose ?? true) { const hl = opts.hoseLen ?? .55; K.tube('air_hose', 'rubber', [[-.066, -.01, 0], [-.075, -.08, 0], [-.11, -.16 - hl * .2, .02], [-.2, -.2 - hl * .5, .05], [-.32, -.22 - hl * .8, .06], [-.42, -.2 - hl, .1]], .011, '#1c1c20', { mat: 'rubber_hose', rs: 7, seg: 40 }); K.torus('hose_clamp', 'metal', .0125, .003, [-.068, -.022, 0], 0, { m: steel, seg: 10, cast: false }); }
  return K.done([-.045, hy - .08, 0], { muzzle: [.22, hy, 0], shoulder: [0, hy, 0] });
}

// ---------- the Adjutant's clipboard: the tally sheet with an EMPTY engine column ----------
export function buildClipboard(THREE, opts = {}) {
  const K = kit(THREE, opts, 'clipboard'), W = .27, H = .38, steel = K.shiny('#c9cdd0', 120, '#ffffff'), lying = opts.lying ?? false;
  const g0 = new THREE.Group(); g0.name = 'clipboard_pose'; K.inner.add(g0); const P = { parent: g0 };
  const paper = K.tex(540, 720, (g, w, h) => { const r = rng(17); g.fillStyle = '#f4efdf'; g.fillRect(0, 0, w, h); g.fillStyle = '#23201c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 76px "Arial Black", Impact, sans-serif'; g.fillText('HITS', w / 2, 96); g.strokeStyle = '#23201c'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 150); g.lineTo(w - 30, 150); g.moveTo(30, 216); g.lineTo(w - 30, 216); for (const x of [30, 155, 280, 395, w - 30]) { g.moveTo(x, 150); g.lineTo(x, h - 40); } g.moveTo(30, h - 40); g.lineTo(w - 30, h - 40); g.stroke();
    g.font = 'bold 30px "Arial Black", Arial, sans-serif'; [['WING', 92], ['BODY', 217], ['TAIL', 337], ['ENGINE', 453]].forEach(([t, x]) => { g.save(); g.translate(x, 184); if (t === 'ENGINE') g.scale(.82, 1); g.fillText(t, 0, 0); g.restore(); });
    g.strokeStyle = '#3a3630'; g.lineWidth = 3.4; g.lineCap = 'round'; const gate = (x, y) => { for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 9 + (r() - .5) * 2, y); g.lineTo(x + k * 9 + (r() - .5) * 2, y + 30); g.stroke(); } g.beginPath(); g.moveTo(x - 5, y + 26); g.lineTo(x + 33, y + 4); g.stroke(); };
    [[46, 11], [171, 9], [296, 8]].forEach(([x, rows], c) => { for (let j = 0; j < rows; j++) for (let k = 0; k < 2; k++) if (r() < .93) gate(x + k * 52, 232 + j * 41); });                                   // wings, body, tail: full of tally gates; ENGINE: nothing
    g.fillStyle = 'rgba(150,120,70,.25)'; g.beginPath(); g.arc(w * .82, h * .86, 46, 0, TAU); g.fill(); });
  K.box('board', 'wood', [W, H, .008], [0, H / 2, 0], '#7a5334', { ...P, mat: 'hardboard' }); K.box('paper', 'paper', [W - .03, H - .06, .0016], [0, H / 2 - .012, .0052], 0, { ...P, cast: false, m: [K.M('#e9e2cf'), K.M('#e9e2cf'), K.M('#e9e2cf'), K.M('#e9e2cf'), K.toon('#ffffff', { map: paper }), K.M('#e9e2cf')], mat: 'paper' });
  K.box('paper_under', 'paper', [W - .034, H - .064, .0012], [.004, H / 2 - .016, .0038], '#e3dbc4', { ...P, rot: [0, 0, .012], cast: false, mat: 'paper' });
  K.box('clip_base', 'metal', [.12, .035, .004], [0, H - .03, .008], 0, { ...P, m: steel, mat: 'steel' }); K.cyl('clip_roll', 'metal', [-.06, H - .014, .012], [.06, H - .014, .012], .007, 0, { ...P, m: steel, seg: 10, mat: 'steel' }); K.box('clip_lever', 'metal', [.07, .04, .003], [0, H + .004, .016], 0, { ...P, m: steel, rot: [.5, 0, 0], mat: 'steel' });
  for (const s of [-1, 1]) K.cyl('clip_rivet', 'metal', [s * .045, H - .036, .01], [s * .045, H - .036, .0125], .005, '#8d949a', { ...P, seg: 8, cast: false });
  K.cyl('hang_hole', 'wood', [0, H - .012, -.0045], [0, H - .012, .0045], .006, '#2a1d0c', { ...P, seg: 8, cast: false });
  if (opts.pencil) { K.cyl('pencil', 'wood', [-.1, H - .055, .014], [.07, H - .055, .014], .0055, '#f0c232', { ...P, seg: 6, mat: 'painted_wood' }); K.cyl('pencil_tip', 'wood', [.07, H - .055, .014], [.09, H - .055, .014], .0055, '#d9b98a', { ...P, r2: .0008, seg: 6 }); K.cyl('pencil_ferrule', 'metal', [-.112, H - .055, .014], [-.1, H - .055, .014], .0058, 0, { ...P, m: steel, seg: 8 }); }
  if (lying) { g0.rotation.x = -Math.PI / 2; g0.position.set(0, .005, H / 2); }
  const Q = p => lying ? [p[0], .005 + p[2], H / 2 - p[1]] : p;
  return K.done(Q([0, .03, 0]), { top: Q([0, H, 0]), page: Q([0, H / 2, .006]), grip_left: Q([-W / 2, H * .36, 0]), grip_right: Q([W / 2, H * .36, 0]), grip_side: Q([-W / 2, H * .3, 0]) });
}

// ---------- the rubber tire patch the Chief slaps on the good tire: buffed black rubber, bevelled edge, the maker's ring, rubber cement on the back ----------
export function buildPatch(THREE, opts = {}) {
  const K = kit(THREE, opts, 'tire_patch'), W = .2, H = .15, T = .008, up = opts.upright ?? !!opts.inHand, g0 = new THREE.Group(); g0.name = 'tire_patch_pose'; K.inner.add(g0); const P = { parent: g0 };
  const sh = new THREE.Shape(), r = .04; sh.moveTo(-W / 2 + r, -H / 2); sh.lineTo(W / 2 - r, -H / 2); sh.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + r); sh.lineTo(W / 2, H / 2 - r); sh.quadraticCurveTo(W / 2, H / 2, W / 2 - r, H / 2); sh.lineTo(-W / 2 + r, H / 2); sh.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - r); sh.lineTo(-W / 2, -H / 2 + r); sh.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + r, -H / 2);
  const tex = K.tex(400, 300, (g, w, h) => paintPatch(g, w, h, false));   // ROUND 3: the same lighter tan rubber with a cross-hatched edge as the patch on the tire (one patch, one colour)
  tex.repeat.set(1 / W, 1 / H); tex.offset.set(.5, .5);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: .003, bevelSize: .006, bevelSegments: 2, curveSegments: 8 }); geo.translate(0, 0, -T / 2);
  K.add(new THREE.Mesh(geo, [K.toon('#ffffff', { map: tex }), K.M('#8a5c30')]), 'rubber', 'rubber', { ...P, mat: 'rubber_patch' });
  for (const [x, y] of [[-W * .3, H * .22], [W * .3, -H * .22]]) K.box('glue_smear', 'rubber', [.03, .012, .001], [x, y, -T / 2 - .0035], '#8a6a32', { ...P, cast: false, rot: [0, 0, .5] });   // rubber cement on the back
  if (up) g0.position.set(0, H / 2, 0); else { g0.rotation.x = -Math.PI / 2; g0.position.set(0, T / 2 + .003, 0); }
  const Q = (x, y) => up ? [x, y + H / 2, 0] : [x, T / 2, -y];
  return K.done(Q(0, 0), { centre: Q(0, 0), grip_left: Q(-W / 2, 0), grip_right: Q(W / 2, 0) });
}

// ---------- Rivets' cigar box of red glass-head pins: lid open on its paper hinge, brass clasp, a heap of pins ----------
export function buildCigarBox(THREE, opts = {}) {
  const K = kit(THREE, opts, 'cigar_box'), W = .26, D = .16, H = .06, t = .006, wood = '#9a6a3c', q = rng(opts.seed ?? 9);
  const lidTex = K.tex(384, 240, (g, w, h) => { K.grain(g, w, h, '#a87644', '#6e4a26', 12, 50); g.fillStyle = '#efe6cc'; g.fillRect(w * .16, h * .2, w * .68, h * .6); g.strokeStyle = '#7a5a2a'; g.lineWidth = 5; g.strokeRect(w * .19, h * .25, w * .62, h * .5); g.fillStyle = '#4a3418'; g.font = 'bold 50px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PINS', w / 2, h * .5); });
  K.box('bottom', 'wood', [W, t, D], [0, t / 2, 0], wood, { mat: 'wood' });
  for (const s of [-1, 1]) { K.box('side_long', 'wood', [W, H, t], [0, H / 2, s * (D / 2 - t / 2)], s > 0 ? '#a87644' : '#8c5e34', { mat: 'wood' }); K.box('side_end', 'wood', [t, H, D - 2 * t], [s * (W / 2 - t / 2), H / 2, 0], '#946638', { mat: 'wood' }); K.box('paper_edging', 'paper', [W + .002, .012, .0012], [0, H - .008, s * (D / 2 + .0006)], '#efe6cc', { cast: false, mat: 'paper' }); }
  K.box('inside_paper', 'paper', [W - 2 * t, .001, D - 2 * t], [0, t + .0006, 0], '#e9dcc0', { cast: false, mat: 'paper' });
  const lid = new THREE.Group(); lid.name = 'cigar_box_lid'; lid.position.set(0, H, -D / 2); lid.rotation.x = -(opts.open ?? 1.9); K.inner.add(lid);   // hinge line along the back edge
  K.box('lid_board', 'wood', [W, t, D], [0, t / 2, D / 2], 0, { parent: lid, m: [K.M(wood), K.M(wood), K.toon('#ffffff', { map: lidTex }), K.M('#c79a62'), K.M(wood), K.M(wood)], mat: 'wood' });
  K.box('paper_hinge', 'paper', [W - .02, .0012, .03], [0, H + .0008, -D / 2 + .004], '#efe6cc', { cast: false, mat: 'paper' });
  K.box('clasp_plate', 'metal', [.022, .02, .003], [0, H - .016, D / 2 + .0015], 0, { m: K.shiny('#c9a23f', 90), mat: 'brass' }); K.cyl('clasp_pin', 'metal', [0, H - .016, D / 2 + .003], [0, H - .016, D / 2 + .007], .003, 0, { m: K.shiny('#e0c36a', 110), seg: 8, cast: false, mat: 'brass' });
  const red = new THREE.MeshPhongMaterial({ color: '#d0141f', specular: '#ffffff', shininess: 110, emissive: '#5a0509' }), steel = K.shiny('#c9cdd0', 120, '#ffffff'), n = opts.pins ?? 46;
  K.sph('pin_heap', 'glass', .07, [0, t, 0], '#b5121b', { s: [1.5, .32, .85], cast: false, mat: 'glass_red_pin' });
  for (let i = 0; i < n; i++) { const a = q() * TAU, d = Math.sqrt(q()) * .085, x = Math.cos(a) * d * 1.25, z = Math.sin(a) * d * .7, y = t + .024 * (1 - d / .09) + .008 + q() * .006; K.sph('pin_head', 'glass', .0065 + q() * .0015, [x, y, z], 0, { m: red, seg: 8, seg2: 6, cast: false, mat: 'glass_red_pin' }); if (i % 3 === 0) K.cyl('pin_shank', 'metal', [x, y, z], [x + (q() - .5) * .05, y + .004, z + (q() - .5) * .05], .0009, 0, { m: steel, seg: 4, cast: false }); }
  return K.done([-W / 2, H * .5, 0], { grip_left: [-W / 2, H * .5, 0], grip_right: [W / 2, H * .5, 0], pins: [0, H, 0], height: H });
}

// ---------- the Colonel's peaked cap in his hand: olive-brown crown, stiff band, glossy peak, brass badge, chin strap on two buttons ----------
export function buildCap(THREE, opts = {}) {
  const K = kit(THREE, opts, 'cap'), col = opts.col || '#6a5c3a', dk = '#4d4329', g0 = new THREE.Group(); g0.name = 'cap_pose'; K.inner.add(g0); const P = { parent: g0 }, brass = K.shiny('#c9a23f', 100);
  K.lathe('crown', 'cloth', [[0, .105], [.07, .104], [.128, .094], [.15, .078], [.146, .062], [.112, .05], [.106, .0]], col, { ...P, mat: 'wool_cloth' });
  K.lathe('band', 'cloth', [[.108, .002], [.108, .046], [.113, .05]], dk, { ...P, mat: 'wool_cloth' }); K.lathe('sweatband', 'cloth', [[.1, .0], [.1, .04]], '#8a6a42', { ...P, cast: false, mat: 'leather' });
  K.torus('crown_piping', 'cloth', .149, .004, [0, .078, 0], dk, { ...P, seg: 40 });
  const pk = new THREE.Shape(); pk.absarc(0, 0, .178, Math.PI * .18, Math.PI * .82, false); pk.absarc(0, 0, .104, Math.PI * .82, Math.PI * .18, true);
  const peak = new THREE.Mesh(new THREE.ExtrudeGeometry(pk, { depth: .006, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 1, curveSegments: 14 }), K.shiny('#17150f', 140, '#ffffff')); peak.rotation.x = Math.PI / 2 + .22; peak.position.set(0, .012, -.012); K.add(peak, 'peak', 'cloth', { ...P, mat: 'patent_leather' });
  K.tube('chin_strap', 'cloth', [[-.1, .028, .05], [-.06, .03, .095], [0, .031, .112], [.06, .03, .095], [.1, .028, .05]], .0045, '#2a2218', { ...P, rs: 5, cast: false, mat: 'leather' }); for (const s of [-1, 1]) K.sph('strap_button', 'metal', .008, [s * .102, .028, .046], 0, { ...P, m: brass, s: [1, 1, .6], cast: false, mat: 'brass' });
  K.cyl('badge', 'metal', [0, .058, .118], [0, .058, .124], .02, 0, { ...P, m: brass, seg: 14, mat: 'brass' }); K.sph('badge_boss', 'metal', .009, [0, .058, .125], 0, { ...P, m: K.shiny('#e0c36a', 130), s: [1, 1, .5], cast: false });
  if (opts.inHand) { g0.rotation.set(.87, 0, 0); g0.position.set(0, -.158, 0); }   // carried by the back edge of its crown: the crown tipped to the lens, the glossy peak below it
  return K.done(opts.inHand ? [0, 0, 0] : [0, .012, .16], { top: [0, .105, 0] });
}

// ---------- ONE red glass-head pin, larger than life so it reads in a fist: the only red in the film ----------
export function buildPin(THREE, opts = {}) {
  const K = kit(THREE, { scale: 2.2, ...opts }, 'pin'), L = .05;
  K.cyl('shank', 'metal', [0, 0, 0], [0, L, 0], .0011, 0, { m: K.shiny('#c9cdd0', 140, '#ffffff'), seg: 6, mat: 'steel' }); K.cyl('point', 'metal', [0, -.006, 0], [0, 0, 0], .0011, 0, { m: K.shiny('#c9cdd0', 140, '#ffffff'), r2: .0001, seg: 6, cast: false });
  K.sph('head', 'glass', .0125, [0, L + .011, 0], 0, { m: new THREE.MeshPhongMaterial({ color: '#d0141f', specular: '#ffffff', shininess: 120, emissive: '#5a0509' }), seg: 18, seg2: 12, mat: 'glass_red_pin' });
  K.sph('head_glint', 'glass', .0032, [-.0045, L + .0165, .0095], '#ffffff', { m: new THREE.MeshBasicMaterial({ color: '#fff4f0', transparent: true, opacity: .85 }), cast: false });
  return K.done([0, L * .55, 0], { tip: [0, -.006, 0], head: [0, L + .011, 0] });
}

// one rubber patch, one look (in the Chief's hand, sets/props.js, and on the tire): lighter tan rubber, a buffed cross-hatched edge all round, the maker's ring and number pressed into the smooth middle, apron dust
function paintPatch(g, w, h, clip) { const q = rng(77), rc = Math.min(w, h) * .2, path = m => { g.beginPath(); g.moveTo(m + rc, m); g.lineTo(w - m - rc, m); g.quadraticCurveTo(w - m, m, w - m, m + rc); g.lineTo(w - m, h - m - rc); g.quadraticCurveTo(w - m, h - m, w - m - rc, h - m); g.lineTo(m + rc, h - m); g.quadraticCurveTo(m, h - m, m, h - m - rc); g.lineTo(m, m + rc); g.quadraticCurveTo(m, m, m + rc, m); g.closePath(); };
  g.clearRect(0, 0, w, h); if (clip) { g.save(); path(2); g.clip(); } g.fillStyle = '#a9743f'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(62,36,14,.62)'; g.lineWidth = Math.max(1.5, w / 210); for (let i = -h; i < w; i += w / 34) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
  const m = Math.min(w, h) * .16; path(m); g.fillStyle = '#c8935a'; g.fill(); g.strokeStyle = 'rgba(70,40,16,.7)'; g.lineWidth = Math.max(2, w / 130); g.stroke();
  g.strokeStyle = 'rgba(96,58,26,.75)'; g.lineWidth = Math.max(2, w / 90); g.beginPath(); g.ellipse(w / 2, h / 2, w * .2, h * .24, 0, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(96,58,26,.8)'; g.font = 'bold ' + Math.round(h * .16) + 'px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('No 4', w / 2, h / 2 + 2);
  for (let i = 0; i < 80; i++) { g.fillStyle = q() < .5 ? 'rgba(236,214,170,' + (q() * .2) + ')' : 'rgba(60,36,16,' + (q() * .16) + ')'; g.beginPath(); g.arc(q() * w, q() * h, (1 + q() * 5) * w / 400, 0, Math.PI * 2); g.fill(); }
  path(2); g.strokeStyle = 'rgba(58,32,12,.85)'; g.lineWidth = Math.max(2, w / 110); g.stroke(); if (clip) g.restore(); }

// ---------- a wheel chock (ROUND 3): a laminated timber wedge with a hollow face to the tyre, two tie rods with washers and hex nuts, a steel toe plate with three teeth, a rope becket knotted through its end,
// yellow paint worn to the wood at every edge, the parking spot's number stencilled on its back ----------
// Local frame of the airfield's old wedge: X toward the wheel (the tall side is +X), Y up, Z across; 0.42 long, 0.26 high, 0.40 wide (the airfield scales it by 1.45). opts: n (the number), col (paint), seed
export function buildChock(THREE, opts = {}) {
  const K = kit(THREE, opts, 'wheel_chock'), o = { n: '6', col: '#e0b22e', ...opts }, sd = o.seed ?? 3, a = .42, h = .26, wd = .4, steel = K.shiny('#8d949a', 70, '#ffffff'), dk = K.M('#4c5258');
  const sh = new THREE.Shape(); sh.moveTo(-a / 2, 0); sh.lineTo(a / 2, 0); sh.quadraticCurveTo(a / 2 - .075, .085, a / 2 - .07, h - .012); sh.quadraticCurveTo(a / 2 - .072, h, a / 2 - .09, h); sh.lineTo(a / 2 - .14, h); sh.lineTo(-a / 2, .035); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: wd - .016, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 2, curveSegments: 10 }); geo.translate(0, 0, -(wd - .016) / 2);
  // end faces: three glued boards seen on their end grain (growth rings), the paint worn off along every edge and round the rod holes
  const cap = K.tex(256, 160, (g, W, H) => { const r = rng(sd + 1); g.fillStyle = '#b98a52'; g.fillRect(0, 0, W, H); for (let b = 0; b < 3; b++) { const cx = W * (.2 + r() * .6), cy = H * (1.25 - b * .12) + b * H / 3; g.strokeStyle = 'rgba(92,58,24,.55)'; g.lineWidth = 1.6; for (let k = 4; k < 46; k++) { g.save(); g.beginPath(); g.rect(0, H - (b + 1) * H / 3, W, H / 3); g.clip(); g.beginPath(); g.arc(cx, H - b * H / 3 + H * .5, k * 5.5, 0, TAU); g.stroke(); g.restore(); } }
    g.fillStyle = o.col; g.globalAlpha = .93; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 520; i++) { const e = r(), x = e < .5 ? r() * W : (r() < .5 ? r() * 16 : W - r() * 16), y = e < .5 ? (r() < .5 ? r() * 12 : H - r() * 12) : r() * H; g.globalAlpha = .25 + r() * .6; g.beginPath(); g.ellipse(x, y, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, TAU); g.fill(); } for (let i = 0; i < 60; i++) { g.globalAlpha = .2 + r() * .5; g.fillRect(r() * W, r() * H, 2 + r() * 12, 1 + r() * 2); }
    g.globalCompositeOperation = 'destination-over'; g.globalAlpha = 1; g.fillStyle = '#a9773f'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(60,36,14,.7)'; g.lineWidth = 2; for (const y of [H / 3, 2 * H / 3]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } });
  cap.repeat.set(1 / a, 1 / h); cap.offset.set(.5, 0);
  // the long faces: paint with brush marks, the glue lines of the boards, chips and scuffs down to the wood, tyre black rubbed onto the hollow face
  const sides = K.tex(256, 256, (g, W, H) => { const r = rng(sd + 2); g.fillStyle = o.col; g.fillRect(0, 0, W, H); for (let i = 0; i < 160; i++) { g.fillStyle = r() < .5 ? `rgba(255,236,150,${r() * .12})` : `rgba(96,66,10,${r() * .13})`; g.fillRect(0, r() * H, W, 1 + r() * 3); }
    for (let i = 0; i < 34; i++) { g.fillStyle = r() < .7 ? 'rgba(178,132,78,.9)' : 'rgba(40,36,30,.5)'; g.beginPath(); g.ellipse(r() * W, r() * H, 2 + r() * 10, 1 + r() * 3, r() * 3, 0, TAU); g.fill(); } g.strokeStyle = 'rgba(70,46,12,.5)'; g.lineWidth = 2; for (const x of [W / 3, 2 * W / 3]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } });
  sides.wrapS = sides.wrapT = THREE.RepeatWrapping; sides.repeat.set(2.6, 2.6);
  K.add(new THREE.Mesh(geo, [K.toon('#ffffff', { map: cap }), K.toon('#ffffff', { map: sides })]), 'block', 'wood', { mat: 'painted_wood' });
  for (const [x, y] of [[-.06, .062], [.075, .15]]) { K.cyl('tie_rod', 'metal', [x, y, -wd / 2 - .014], [x, y, wd / 2 + .014], .0065, 0, { m: steel, seg: 8, mat: 'steel', cast: false });
    for (const s of [-1, 1]) { K.cyl('tie_rod_washer', 'metal', [x, y, s * wd / 2], [x, y, s * (wd / 2 + .003)], .022, 0, { m: dk, seg: 14, mat: 'steel', cast: false }); K.cyl('tie_rod_nut', 'metal', [x, y, s * (wd / 2 + .003)], [x, y, s * (wd / 2 + .013)], .013, 0, { m: steel, seg: 6, mat: 'steel', cast: false }); } }
  K.box('toe_plate', 'metal', [.085, .007, wd - .04], [a / 2 - .046, .0035, 0], 0, { m: dk, mat: 'steel_plate', cast: false }); for (const z of [-.14, 0, .14]) { K.cyl('toe_tooth', 'metal', [a / 2 - .012, .007, z], [a / 2 + .016, 0, z], .009, 0, { m: steel, r2: .001, seg: 6, mat: 'steel', cast: false }); K.cyl('toe_plate_screw', 'metal', [a / 2 - .07, .0065, z + .05], [a / 2 - .07, .009, z + .05], .006, 0, { m: steel, seg: 8, cast: false }); }
  // rope becket through a hole in the end: stopper knot against the wood on both ends, a loop to pull it by
  const hemp = K.M('#b79b6a'), by = .125; K.cyl('becket_hole', 'wood', [0, by, -wd / 2 - .0005], [0, by, wd / 2 + .0005], .014, '#3a2a18', { seg: 10, cast: false });
  K.tube('rope_becket', 'cloth', [[0, by, wd / 2 - .02], [0, by + .004, wd / 2 + .03], [-.035, by - .04, wd / 2 + .075], [-.085, by - .092, wd / 2 + .06], [-.11, by - .06, wd / 2 + .028], [-.07, by - .01, wd / 2 + .02], [-.01, by, wd / 2 + .034]], .0085, 0, { m: hemp, rs: 6, seg: 36, mat: 'hemp_rope', cast: false });
  for (const s of [-1, 1]) K.sph('rope_knot', 'cloth', .018, [0, by, s * (wd / 2 + .014)], 0, { m: hemp, s: [1, 1, .85], cast: false, mat: 'hemp_rope' });
  // the stencilled number on the sloped back (read from behind the chock)
  const num = K.tex(128, 128, (g, W, H) => { const r = rng(sd + 4); g.clearRect(0, 0, W, H); g.fillStyle = '#1c1a16'; g.font = '900 104px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(o.n), W / 2, H / 2 + 6, W - 10); g.globalCompositeOperation = 'destination-out'; g.fillRect(0, H * .5, W, 5); for (let i = 0; i < 70; i++) { g.globalAlpha = r() * .7; g.fillRect(r() * W, r() * H, 2 + r() * 9, 1 + r() * 2); } });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.17, .15), K.toon('#ffffff', { map: num, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })), X = new THREE.Vector3(0, 0, 1), Y = new THREE.Vector3(.28, .225, 0).normalize(), Z = new THREE.Vector3().crossVectors(X, Y);
  pl.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); pl.position.set(-.072 + Z.x * .0095, .146 + Z.y * .0095, 0); pl.userData.text = String(o.n); K.add(pl, 'stencil_number', 'wood', { cast: false, mat: 'paint_stencil' });
  return K.done([-.085, by - .092, wd / 2 + .06], { rope: [-.085, by - .092, wd / 2 + .06], top: [a / 2 - .11, h, 0] });
}

/** every builder by the prop name used in film.json "held3d" / PROPS.md */
export const PROP_BUILDERS = { lantern: 'buildLantern', plate: 'buildPlate', slide_rule: 'buildSlideRule', briefcase: 'buildBriefcase', chalk: 'buildChalk', mug: 'buildMug', mug_half: 'buildMugHalf', chock: 'buildChock', paddles: 'buildPaddles', step_ladder: 'buildStepLadder', rivet_gun: 'buildRivetGun', clipboard: 'buildClipboard', patch: 'buildPatch', cigar_box: 'buildCigarBox', cap: 'buildCap', pin: 'buildPin' };
