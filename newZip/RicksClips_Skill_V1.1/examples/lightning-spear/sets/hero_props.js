// HERO PROPS of "Why The Safest Tower Had A Spear On Top" (props-hero, 2026-11-15). ONE shared module for every stretch (README: hero_props_README.md).
// Every builder is (THREE, ctx, opts) -> { group, anchors, ...setters }. Coordinates are three.js LOCAL metres, Y up; the stretch places the group
// (group.position.copy(ctx.B2T(planPoint))). With kit3d on, metal is ctx.pbr.metal (iron / steel / bronze / gold) and wood is ctx.relief('wood');
// with kit3d off, or a ctx without pbr / relief, the same calls fall back to the kit's toon material, so old films still build.
// CB 2026-11-15 on final v1: "iron speeer need metallic detail", "gold angle more detailed", "stomr bell made metallic gold", "the bell wheel also".
// Parts lists: hero_test/PARTS.md. Shaders: none of our own (no pow / sqrt), so no not-a-number pixel can come from this file.

function kit(THREE, ctx = {}) {
  const toonF = typeof ctx.toon === 'function' ? ctx.toon : (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const pbrOn = !!(ctx.pbr && ctx.pbr.on), TOON = { iron: '#4f5880', steel: '#9aa6bc', bronze: '#c98a2e', gold: '#ffc21f', brass: '#d8a84a' };
  const metal = (kind, o = {}) => (ctx.pbr && typeof ctx.pbr.metal === 'function') ? ctx.pbr.metal(kind, { ...o, toon: o.toon || TOON[kind] }) : toonF(o.toon || TOON[kind] || '#888888');
  const relief = (kind, c, o = {}) => (typeof ctx.relief === 'function') ? ctx.relief(kind, c, o) : toonF(c);
  const matte = c => pbrOn ? new THREE.MeshStandardMaterial({ color: c, roughness: .95, metalness: 0 }) : toonF(c);
  const V = a => (a && a.isVector3) ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const UP = new THREE.Vector3(0, 1, 0);
  const add = (par, geo, mat, name, role = 'metal', pos, rot) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = role; m.castShadow = m.receiveShadow = true; if (pos) m.position.copy(V(pos)); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); par.add(m); return m; };
  const basis = (m, dir, side) => { const y = V(dir).normalize(); let x = side ? V(side) : (Math.abs(y.x) < .9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1)); x.sub(y.clone().multiplyScalar(x.dot(y)));
    if (x.lengthSq() < 1e-8) x = Math.abs(y.z) < .9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0), x.sub(y.clone().multiplyScalar(x.dot(y))); x.normalize(); const z = new THREE.Vector3().crossVectors(x, y); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); return m; };
  const bar = (par, a, b, r, mat, name, role = 'metal', r2 = r, seg = 12) => { const A = V(a), B = V(b), d = B.clone().sub(A), L = Math.max(d.length(), 1e-4); return basis(add(par, new THREE.CylinderGeometry(r2, r, L, seg), mat, name, role, A.clone().addScaledVector(d, .5)), d); };
  const beam = (par, a, b, w, dp, mat, name, role = 'wood', side) => { const A = V(a), B = V(b), d = B.clone().sub(A), L = Math.max(d.length(), 1e-4); return basis(add(par, new THREE.BoxGeometry(w, L, dp), mat, name, role, A.clone().addScaledVector(d, .5)), d, side); };
  const facet = geo => { const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); return g; };          // flat faces: hammer facets, forged corners
  const lathe = (pts, seg = 32) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(Math.max(p[0], 0), p[1])), seg);
  const tube = (par, pts, r, mat, name, seg = 24, rad = 8, role = 'metal') => add(par, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), false, 'catmullrom', .2), seg, r, rad), mat, name, role);
  const bolt = (par, pos, dir, s, mat, name, o = {}) => { const P = V(pos), D = V(dir).normalize(), sg = new THREE.Group(); sg.position.copy(P); basis(sg, D); par.add(sg);   // hex head (or nut) on a washer, a thread stub
    add(sg, new THREE.CylinderGeometry(s * 1.45, s * 1.45, s * .2, 14), mat, name + '_washer', 'metal', [0, s * .1, 0]); add(sg, facet(new THREE.CylinderGeometry(s, s, s * .7, 6)), mat, name, 'metal', [0, s * .55, 0]);
    if (o.stub) add(sg, new THREE.CylinderGeometry(s * .5, s * .5, s * .6, 8), mat, name + '_thread', 'metal', [0, s * 1.15, 0]); return sg; };
  // a decal material from a metal: own canvas map + bump, own UVs (no kit rescale), the place's env map copied in on the first draw
  const decal = (base, map, bump, bs = 1) => { const m = base.clone(); if (m.userData) delete m.userData.k3scale; if (map) m.map = map; if (bump && 'bumpMap' in m) { m.bumpMap = bump; m.bumpScale = bs; m.normalMap = null; } m.needsUpdate = true; return m; };
  const envHook = (mesh, base) => { mesh.onBeforeRender = () => { if (base.envMap && mesh.material.envMap !== base.envMap) { mesh.material.envMap = base.envMap; mesh.material.needsUpdate = true; } }; return mesh; };
  const canvas = (w, h, draw, srgb = true) => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  // a tube twisted round a centre curve: wire strands, bindings, coil ties
  const twist = (curve, off, pitch, phase, r, seg, rad = 6) => { const len = curve.getLength(), fr = curve.computeFrenetFrames(seg, false);
    class Strand extends THREE.Curve { getPoint(u, t = new THREE.Vector3()) { const i = Math.min(seg, Math.max(0, Math.round(u * seg))), th = 2 * Math.PI * u * len / pitch + phase; curve.getPointAt(Math.min(1, Math.max(0, u)), t); return t.addScaledVector(fr.normals[i], Math.cos(th) * off).addScaledVector(fr.binormals[i], Math.sin(th) * off); } getPointAt(u, t) { return this.getPoint(u, t); } }
    return new THREE.TubeGeometry(new Strand(), seg, r, rad, false); };
  let s0 = 1; const rnd = (seed) => { s0 = seed || 1; return () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; };
  return { toonF, pbrOn, metal, relief, matte, V, UP, add, basis, bar, beam, facet, lathe, tube, bolt, decal, envHook, canvas, twist, rnd };
}
const countParts = g => { const s = new Set(); g.traverse(o => { if (o.isMesh || o.isSprite || o.isInstancedMesh) s.add(o.name.replace(/_\d+$/, '')); }); return [...s]; };
export { countParts };

// a soft star for the cold glint (normal blending: never brighter than its colour, so it never clips)
function glintSprite(THREE, k, size, color = '#bfe6ff', name = 'spear_tip_glint') {
  const tex = k.canvas(128, 128, (c, w, h) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.12, 'rgba(255,255,255,.85)'); gr.addColorStop(.4, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter'; for (const [a, l] of [[0, 62], [Math.PI / 2, 62], [Math.PI / 4, 30], [-Math.PI / 4, 30]]) { c.save(); c.translate(64, 64); c.rotate(a); const g2 = c.createLinearGradient(-l, 0, l, 0); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(.5, 'rgba(255,255,255,.7)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g2; c.fillRect(-l, -1.5, 2 * l, 3); c.restore(); } }, true);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: .9, depthWrite: false, toneMapped: false, fog: false }));
  sp.name = name; sp.userData.noExport = true; sp.userData.role = 'lamp'; sp.scale.setScalar(size); sp.renderOrder = 5; return sp;
}

// ================================================================================================================================
// 1. THE SPEAR (lightning rod, 1765). Origin = the shaft's foot (tower_top SPEAR.base), +Y up the shaft. Big: L 2.17 (tip at SPEAR.tip).
// opts: small (arm-length yard variant, L .72), length, radius, mount 'finial' (clamp band, straps and wedges on the stone finial, two stays to the roof)
//       or 'plate' (foot plate bolted to a ridge), stayFeet [[x,y,z], [x,y,z]] (local), glint (true), far (drops bolts and forge scale).
export function buildSpear(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), small = !!opts.small, L = opts.length ?? (small ? .72 : 2.17), R = opts.radius ?? (small ? .016 : .026), q = L / 2.17, far = !!opts.far;
  const mount = opts.mount || (small ? 'plate' : 'finial'), g = new THREE.Group(); g.name = opts.name || (small ? 'spear_small' : 'spear_lightning_rod');
  const iron = k.metal('iron', { seed: 3, toon: '#4f5880' }), ironDk = k.metal('iron', { color: '#4d5670', rough: .32, rust: .25, seed: 7, toon: '#2c3050' }),
    scaleM = k.metal('iron', { color: '#343846', rough: .62, rust: .55, seed: 11, toon: '#2a2c40' }), edge = k.metal('steel', { color: '#d4e2f2', rough: .12, nscale: .15, seed: 5, toon: '#cfe2f4' });
  const P = s => 'spear_' + s;
  // heights (fractions of L, measured on the big spear: finial top .38, upper collar .78, shaft top 1.69, tip 2.17)
  const yCL = (small ? .18 : .205) * L, yCU = .36 * L, ySq = yCU, yOct = .40 * L, yS0 = .735 * L, yS1 = .80 * L, yB0 = .82 * L, bl = L - yB0, bw = R * 3.1;
  // the shaft: forged square below the upper collar, an octagon step, then drawn round and tapered to the socket (hammer-flat faces)
  k.add(g, k.facet(new THREE.CylinderGeometry(R * 1.2, R * 1.32, ySq + .02 * q, 4, 6)), iron, P('shaft_square'), 'metal', [0, (ySq - .02 * q) / 2, 0], [0, Math.PI / 4, 0]);
  k.add(g, k.facet(new THREE.CylinderGeometry(R * 1.02, R * 1.16, yOct - ySq, 8)), iron, P('shaft_octagon_step'), 'metal', [0, (ySq + yOct) / 2, 0]);
  k.add(g, new THREE.CylinderGeometry(R * .8, R * 1.0, yS0 - yOct + .02, 20, 4), iron, P('shaft_round'), 'metal', [0, (yOct + yS0) / 2, 0]);
  if (!far) {   // forge scale: dark flaking skin left by the fire, more near the foot
    const rr = k.rnd(29), n = small ? 22 : 60, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), scaleM, n), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) { const y = Math.pow(rr(), 1.6) * yS0 * .95 + .02 * q, a = rr() * Math.PI * 2, rad = (y < ySq ? R * 1.02 : R * (1 - .2 * (y - yOct) / Math.max(1e-3, yS0 - yOct))) + R * .02;
      e.set(0, -a, 0); qq.setFromEuler(e); m4.compose(new THREE.Vector3(Math.sin(a) * rad, y, Math.cos(a) * rad), qq, new THREE.Vector3(R * (.5 + rr() * .9), R * (.6 + rr() * 1.6), R * .08)); im.setMatrixAt(i, m4); }
    im.name = P('forge_scale'); im.userData.role = 'metal'; im.castShadow = false; im.receiveShadow = true; g.add(im); }
  // two collars: a forged band with a rim top and bottom and a through-bolt with a nut (the lower one also carries the wire eye)
  const collar = (y, nm) => { k.add(g, new THREE.CylinderGeometry(R * 1.75, R * 1.75, R * 1.5, 18), ironDk, P(nm), 'metal', [0, y, 0]);
    for (const s of [-1, 1]) k.add(g, new THREE.TorusGeometry(R * 1.72, R * .26, 6, 20), iron, P(nm + '_rim'), 'metal', [0, y + s * R * .72, 0], [Math.PI / 2, 0, 0]);
    if (!far) { k.bolt(g, [0, y, R * 1.72], [0, 0, 1], R * .42, ironDk, P(nm + '_bolt'), { stub: false }); k.bolt(g, [0, y, -R * 1.72], [0, 0, -1], R * .42, ironDk, P(nm + '_nut'), { stub: true }); } };
  collar(yCL, 'collar_lower'); collar(yCU, 'collar_upper');
  // the hooked eye on the lower collar where the wire is hooked on (big spear: plan EYE [.06, -.06, 1.0] = local [.06, .55, .06])
  const eyeP = opts.eye ? k.V(opts.eye) : new THREE.Vector3(R * 2.3, .253 * L, R * 2.3), eyeDir = new THREE.Vector3(eyeP.x, 0, eyeP.z).normalize();
  k.add(g, new THREE.CylinderGeometry(R * 1.55, R * 1.55, R * 1.3, 16), ironDk, P('eye_band'), 'metal', [0, eyeP.y, 0]);
  k.bar(g, eyeDir.clone().multiplyScalar(R * 1.4).setY(eyeP.y), eyeP.clone().addScaledVector(eyeDir, -R * 1.2), R * .42, iron, P('eye_stem'), 'metal', R * .38, 8);
  const eye = k.add(g, new THREE.TorusGeometry(R * 1.25, R * .38, 8, 18), ironDk, P('eye_hook_ring'), 'metal', eyeP); eye.lookAt(eyeP.clone().add(new THREE.Vector3(-eyeDir.z, 0, eyeDir.x))); eye.rotateY(Math.PI / 2);
  // the socket over the shaft top: a forged taper with a ring at its mouth and two rivets, a short neck, then the blade
  k.add(g, k.lathe([[R * .95, 0], [R * 1.5, .004], [R * 1.42, (yS1 - yS0) * .55], [R * 1.05, yS1 - yS0], [R * .75, yS1 - yS0 + .004]], 16), iron, P('socket'), 'metal', [0, yS0, 0]);
  k.add(g, new THREE.TorusGeometry(R * 1.48, R * .28, 6, 18), ironDk, P('socket_ring'), 'metal', [0, yS0 + .006, 0], [Math.PI / 2, 0, 0]);
  if (!far) for (const s of [-1, 1]) k.add(g, new THREE.SphereGeometry(R * .32, 8, 6), ironDk, P('socket_rivet'), 'metal', [s * R * 1.46, yS0 + (yS1 - yS0) * .45, 0]);
  k.add(g, new THREE.CylinderGeometry(R * .62, R * .78, yB0 - yS1 + .006, 12), iron, P('neck'), 'metal', [0, (yS1 + yB0) / 2, 0]);
  // the forged LEAF point: flattened octagon section (sharp edges at +-x, a raised ridge on both faces), hammer facets (flat normals)
  const leaf = [[R * .62, 0], [bw * .42, .03], [bw * .8, .12], [bw * .98, .25], [bw * .9, .4], [bw * .68, .56], [bw * .42, .72], [bw * .2, .87], [bw * .06, .97], [0, 1]], rB = t => { for (let i = 1; i < leaf.length; i++) if (t <= leaf[i][1]) { const a = leaf[i - 1], b = leaf[i], u = (t - a[1]) / Math.max(1e-4, b[1] - a[1]); return a[0] + (b[0] - a[0]) * u; } return 0; };
  const bladeM = k.metal('iron', { color: '#7c88a8', rough: .2, nscale: 1.1, rust: .08, seed: 9, toon: '#4f5880' }), BZ = .3, blade = k.add(g, k.facet(k.lathe(leaf.map(p => [p[0], p[1] * bl]), 12)), bladeM, P('point_leaf_blade'), 'metal', [0, yB0, 0]); blade.scale.set(1, 1, BZ); blade.rotation.y = Math.PI / 8 * 0;
  for (const s of [-1, 1]) {   // the raised mid-rib on each face, the bright ground cutting edges
    k.tube(g, Array.from({ length: 9 }, (_, i) => { const t = .02 + i * .11; return [0, yB0 + t * bl, s * (rB(t) * BZ + R * .05)]; }), R * .13, ironDk, P('point_mid_rib'), 24, 6);
    k.tube(g, Array.from({ length: 11 }, (_, i) => { const t = .03 + i * .094; return [s * rB(t) * .985, yB0 + t * bl, 0]; }), R * .075, edge, P('point_ground_edge'), 30, 5); }
  // the clamp to the stone finial: a band round the finial block, two straps down its sides into the stone, wedges driven at the neck, and two stays to the roof
  const A = { base: new THREE.Vector3(), tip: new THREE.Vector3(0, L, 0), eye: eyeP.clone(), collar_low: new THREE.Vector3(0, yCL, 0), collar_up: new THREE.Vector3(0, yCU, 0), grip: new THREE.Vector3(0, (yCU + yOct) / 2 + .05 * q, 0), socket: new THREE.Vector3(0, yS0, 0) };
  if (mount === 'finial') {
    const F = { bandY: .22 * q, bandR: .228 * q, topY: .385 * q, neckR: .155 * q, ...(opts.finial || {}) };
    k.add(g, new THREE.CylinderGeometry(F.bandR, F.bandR, .05 * q, 8, 1, true), ironDk, P('finial_clamp_band'), 'metal', [0, F.bandY, 0]).material.side = THREE.DoubleSide;
    for (const s of [-1, 1]) { k.beam(g, [s * (F.bandR + .004), F.bandY + .02 * q, 0], [s * (F.bandR + .03 * q), -.06 * q, 0], .012 * q, .05 * q, ironDk, P('finial_strap'), 'metal', [0, 0, 1]);
      if (!far) { k.bolt(g, [s * (F.bandR + .008), F.bandY, .05 * q], [s, 0, 0], .016 * q, iron, P('finial_band_bolt')); k.bolt(g, [s * (F.bandR + .022 * q), -.02 * q, 0], [s, 0, 0], .015 * q, iron, P('finial_strap_bolt')); } }
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, w = k.add(g, k.facet(new THREE.CylinderGeometry(R * .2, R * .75, .07 * q, 4)), ironDk, P('neck_wedge'), 'metal', [Math.sin(a) * R * 1.55, F.topY + .02 * q, Math.cos(a) * R * 1.55]); w.rotation.y = a; }
    k.add(g, new THREE.TorusGeometry(R * 2.1, R * .35, 6, 16), iron, P('neck_lead_collar'), 'metal', [0, F.topY + .004, 0], [Math.PI / 2, 0, 0]);
    const feet = (opts.stayFeet || [[-.5, -.11, 0], [.5, -.11, 0]]).map(p => k.V(p).multiplyScalar(opts.stayFeet ? 1 : q));
    for (const f of feet) { const s = Math.sign(f.x) || 1, top = new THREE.Vector3(s * R * 1.9, yCU - R * .2, 0);
      k.beam(g, top, f.clone().add(new THREE.Vector3(-s * .03 * q, .025 * q, 0)), .016 * q, .034 * q, iron, P('bracket_stay'), 'metal', [0, 0, 1]);
      for (const dz of [-1, 1]) k.add(g, new THREE.BoxGeometry(.03 * q, .05 * q, .008 * q), ironDk, P('stay_clevis_cheek'), 'metal', [s * R * 2.0, yCU - R * .1, dz * .02 * q]);
      k.add(g, new THREE.CylinderGeometry(.008 * q, .008 * q, .06 * q, 8), iron, P('stay_clevis_pin'), 'metal', [s * R * 2.05, yCU - R * .1, 0], [Math.PI / 2, 0, 0]);
      const ft = k.add(g, new THREE.BoxGeometry(.2 * q, .014 * q, .09 * q), ironDk, P('bracket_stay_foot'), 'metal', f.clone().add(new THREE.Vector3(0, .007 * q, 0))); ft.rotation.z = opts.roofSlope ?? (s * .44);
      if (!far) for (const o of [-.06, .06]) k.bolt(g, f.clone().add(new THREE.Vector3(o * q * Math.cos(ft.rotation.z), .014 * q + o * q * Math.sin(ft.rotation.z), 0)), [-Math.sin(ft.rotation.z), Math.cos(ft.rotation.z), 0], .014 * q, iron, P('stay_foot_bolt')); }
    A.stay_feet = feet;
  } else {   // 'plate': a forged foot plate on the ridge, four bolts, a short stay each side and a wedge at the shaft
    k.add(g, new THREE.BoxGeometry(R * 7, R * .8, R * 4.5), ironDk, P('foot_plate'), 'metal', [0, R * .4, 0]);
    k.add(g, k.lathe([[R * 1.25, 0], [R * 1.9, 0], [R * 1.5, R * 2.2], [R * 1.2, R * 2.6]], 12), iron, P('foot_socket_boss'), 'metal', [0, R * .8, 0]);
    if (!far) for (const [x, z] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) k.bolt(g, [x * R * 2.8, R * .8, z * R * 1.6], [0, 1, 0], R * .38, iron, P('foot_plate_bolt'));
    for (const s of [-1, 1]) { k.beam(g, [s * R * 1.6, yCL, 0], [s * R * 3.3, R * .9, 0], R * .4, R * .9, iron, P('bracket_stay'), 'metal', [0, 0, 1]);
      const w = k.add(g, k.facet(new THREE.CylinderGeometry(R * .15, R * .55, R * 2.2, 4)), ironDk, P('neck_wedge'), 'metal', [s * R * 1.35, R * 3.6, 0]); w.rotation.y = Math.PI / 4; }
    A.stay_feet = [new THREE.Vector3(-R * 3.3, 0, 0), new THREE.Vector3(R * 3.3, 0, 0)];
  }
  let glint = null; if (opts.glint !== false) { glint = glintSprite(THREE, k, opts.glintSize ?? R * 7.5, opts.glintColor || '#bfe6ff'); glint.position.set(-bw * .12, L - bl * .1, bw * BZ * .5); g.add(glint); A.glint = glint.position.clone(); }
  const parts = countParts(g);
  return { group: g, anchors: A, glint, parts, setGlint: (v, s) => { if (glint) { glint.visible = v > 0; glint.material.opacity = .9 * Math.min(1, v); if (s) glint.scale.setScalar(s); } } };
}

// ================================================================================================================================
// 2. THE WIRE. A thumb-thick twisted iron wire (three strands round a core) along opts.points (local three metres, from the eye downward).
// opts: points, radius (.017), strands (3; 0 = plain tube for far runs), pitch, staples [{u, n}] (u 0..1 along the run, n = wall normal toward the wire),
//       splice u (a spliced join with a bound overlap), hook (eye-splice loop at the start), maxSeg. Returns setGrow(u) for the S1 build-up.
export function buildWire(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), r = opts.radius ?? .017, g = new THREE.Group(); g.name = opts.name || 'spear_wire_run';
  const pts = (opts.points || [[0, 0, 0], [0, -3, 0]]).map(k.V), curve = opts.curve || new THREE.CatmullRomCurve3(pts, false, 'catmullrom', opts.tension ?? .15), len = curve.getLength();
  const strands = opts.strands ?? 3, pitch = opts.pitch ?? r * 7, N = Math.min(opts.maxSeg ?? 2600, Math.max(24, Math.ceil(len / pitch * (strands ? 9 : 2))));
  const wm = k.metal('iron', { color: '#5a6580', finish: 'brushed', rough: .3, rust: .12, seed: 13, toon: '#2c3050' }), stM = k.metal('iron', { color: '#4a5268', rough: .36, rust: .3, seed: 17, toon: '#3a4060' }), lead = k.metal('steel', { color: '#8f96a4', rough: .55, seed: 19, toon: '#8a90a0' });
  const tubes = [];
  if (strands) { tubes.push(k.add(g, new THREE.TubeGeometry(curve, N, r * .55, 6, false), wm, 'wire_core')); for (let s = 0; s < strands; s++) tubes.push(k.add(g, k.twist(curve, r * .5, pitch, s * 2 * Math.PI / strands, r * .5, N, 6), wm, 'wire_strand')); }
  else tubes.push(k.add(g, new THREE.TubeGeometry(curve, N, r, 8, false), wm, 'wire_core'));
  const extra = [];
  // iron staples: a forged U over the wire, both legs driven into the wall joint
  const staple = (u, n) => { const p = curve.getPointAt(u), t = curve.getTangentAt(u), N0 = k.V(n || opts.wallNormal || [0, 0, 1]).normalize(), x = new THREE.Vector3().crossVectors(N0, t).normalize(), z = new THREE.Vector3().crossVectors(x, N0);
    const sg = new THREE.Group(); sg.name = 'wire_staple_set'; sg.position.copy(p); sg.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, N0, z)); g.add(sg); const a = r * 1.75;
    k.add(sg, new THREE.TorusGeometry(a, r * .42, 8, 16, Math.PI), stM, 'wire_staple'); for (const s of [-1, 1]) { k.bar(sg, [s * a, 0, 0], [s * a, -r * 3.4, 0], r * .42, stM, 'wire_staple_leg', 'metal', r * .3, 6); k.add(sg, new THREE.BoxGeometry(r * 1.6, r * .5, r * 1.4), lead, 'wire_staple_lead_plug', 'metal', [s * a, -r * 1.6, 0]); }
    sg.userData.u = u; extra.push(sg); return sg; };
  for (const st of opts.staples || []) staple(typeof st === 'number' ? st : st.u, st.n);
  // the spliced join: the next length laid alongside for 26 cm, ends bent in, bound with thin soft-iron wire
  if (opts.splice != null) { const u0 = opts.splice, du = .13 / len, fr = curve.computeFrenetFrames(40, false), sp = new THREE.Group(); sp.name = 'wire_splice'; g.add(sp); sp.userData.u = u0 - du; extra.push(sp);
    const off = (u, o) => { const i = Math.round(Math.min(1, Math.max(0, u)) * 40); return curve.getPointAt(Math.min(1, Math.max(0, u))).addScaledVector(fr.binormals[i], o); };
    const lay = new THREE.CatmullRomCurve3([off(u0 - du * 1.25, r * .3), off(u0 - du, r * 1.7), off(u0, r * 1.85), off(u0 + du, r * 1.7), off(u0 + du * 1.2, r * .4)]);
    k.add(sp, new THREE.TubeGeometry(lay, 60, r * .9, 7, false), wm, 'wire_splice_overlap');
    for (const s of [-1, 1]) k.add(sp, new THREE.SphereGeometry(r * .95, 8, 6), wm, 'wire_splice_cut_end', 'metal', off(u0 + s * du * 1.25, r * (s < 0 ? .3 : .4)));
    const mid = new THREE.CatmullRomCurve3([off(u0 - du * .7, r * .92), off(u0, r * .95), off(u0 + du * .7, r * .92)]);
    k.add(sp, k.twist(mid, r * 1.85, r * .75, 0, r * .22, 380, 5), lead, 'wire_splice_binding'); }
  // the eye-splice: the start is bent round through the spear's eye and wrapped back three turns round itself
  if (opts.hook) { const p0 = curve.getPointAt(0), t0 = curve.getTangentAt(0), fr = curve.computeFrenetFrames(20, false), h = new THREE.Group(); h.name = 'wire_hook'; g.add(h);
    const lp = new THREE.Group(); lp.position.copy(p0).addScaledVector(t0, -r * 2.6); lp.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(t0, fr.normals[0], fr.binormals[0])); h.add(lp);
    k.add(lp, new THREE.TorusGeometry(r * 2.6, r, 8, 22), wm, 'wire_hook_loop'); const wrap = new THREE.CatmullRomCurve3([curve.getPointAt(0), curve.getPointAt(Math.min(.5, .1 / len)), curve.getPointAt(Math.min(.8, .16 / len))]);
    k.add(h, k.twist(wrap, r * 1.2, r * 4.5, 1, r * .55, 90, 6), wm, 'wire_hook_wrap'); }
  const setGrow = u => { for (const m of tubes) { const segs = m.geometry.parameters.tubularSegments, rad = m.geometry.parameters.radialSegments; m.geometry.setDrawRange(0, Math.round(Math.min(1, Math.max(0, u)) * segs) * rad * 6); m.visible = u > 0; } for (const e of extra) e.visible = u >= e.userData.u; };
  return { group: g, curve, length: len, setGrow, staple, anchors: { start: curve.getPointAt(0), end: curve.getPointAt(1) }, parts: countParts(g) };
}

// THE WIRE'S FOOT: origin = where the wire meets the earth; the wire comes down from +Y (opts.height) beside a wall (opts.wallZ behind it).
export function buildWireFoot(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), r = opts.radius ?? .017, h = opts.height ?? 1.1, g = new THREE.Group(); g.name = opts.name || 'wire_foot';
  const ironDk = k.metal('iron', { color: '#474e64', rough: .4, rust: .35, seed: 23, toon: '#2c3050' }), iron = k.metal('iron', { seed: 3, toon: '#4f5880' });
  const w = buildWire(THREE, ctx, { radius: r, points: [[0, h, -.02], [0, .5, -.02], [0, .16, .0], [.02, .045, .03], [.03, -.1, .05]], staples: opts.wallZ != null ? [{ u: .3, n: [0, 0, 1] }] : [], name: 'wire_foot_run' }); g.add(w.group);
  k.add(g, new THREE.BoxGeometry(.36, .018, .3), ironDk, 'wire_foot_earth_plate', 'metal', [.02, .012, .05]);
  for (const [x, z] of [[-.13, -.1], [.17, -.1], [-.13, .2], [.17, .2]]) { const s = k.add(g, k.facet(new THREE.CylinderGeometry(.018, .022, .02, 4)), iron, 'wire_foot_plate_spike_head', 'metal', [x, .03, z]); s.rotation.y = Math.PI / 4; }
  k.add(g, k.lathe([[.0, 0], [.052, 0], [.046, .05], [.03, .065], [.0, .066]], 12), iron, 'wire_foot_clamp_boss', 'metal', [.025, .02, .04]);
  k.bolt(g, [.075, .052, .04], [1, 0, 0], .011, ironDk, 'wire_foot_set_screw', { stub: true });
  k.bar(g, [.29, .0, -.02], [.31, .2, -.02], .013, iron, 'wire_foot_driven_rod', 'metal', .012, 8); k.add(g, new THREE.CylinderGeometry(.024, .016, .02, 8), ironDk, 'wire_foot_rod_mushroom_head', 'metal', [.31, .205, -.02]);
  k.tube(g, [[.31, .17, -.02], [.2, .1, 0], [.1, .05, .04], [.05, .04, .04]], .006, ironDk, 'wire_foot_bond_strap', 20, 5);
  const mud = k.relief('mud', '#4a3526', { scale: 1.2, seed: 4 }), stone = k.relief('stone', '#8a8174', { scale: .4, seed: 6 });
  const mound = k.add(g, new THREE.SphereGeometry(.6, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), mud, 'wire_foot_tamped_earth', 'ground', [.03, -.008, .05]); mound.scale.set(1, .05, .85);
  const rr = k.rnd(41); for (let i = 0; i < 9; i++) { const a = rr() * 6.28, d = .3 + rr() * .25, p = k.add(g, new THREE.DodecahedronGeometry(.03 + rr() * .03, 0), stone, 'wire_foot_pebble', 'stone', [Math.cos(a) * d, .01, Math.sin(a) * d * .8 + .05]); p.scale.y = .55; }
  return { group: g, anchors: { top: new THREE.Vector3(0, h, -.02), ground: new THREE.Vector3() }, parts: countParts(g) };
}

// ================================================================================================================================
// 3. THE STORM BELL with its YOKE. Origin = the pivot (axle) as in marble.js bell_swing; the bell hangs down, mouth at y -(L + .1).
// opts: R (mouth radius 1.5), L (2.7), stockLen (4.0, along local Z), axleTo (2.75: the iron axle reaches the wheel hub at z 2.62),
//       text (the raised inscription), far. Returns { group, clapper, anchors }.
const BELL_TEXT = '+ FVLGVRA FRANGO + VIVOS VOCO + MORTVOS PLANGO + A D MDCCXL +';
export function buildBell(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), BR = opts.R ?? 1.5, BL = opts.L ?? 2.7, sr = BR / 1.5, sy = BL / 2.7, top = -.22, far = !!opts.far, g = new THREE.Group(); g.name = opts.name || 'storm_bell';
  const bronze = k.metal('bronze', { color: '#e8b062', rough: .2, patina: .08, env: 1.7, seed: 31, toon: '#d89a3a' }), bronzeIn = k.metal('bronze', { color: '#9a6a34', rough: .36, patina: .3, seed: 33, toon: '#8a5a2a' }),
    bronzeHi = k.metal('bronze', { color: '#f4c878', rough: .15, patina: .14, env: 1.8, seed: 35, toon: '#ffd27a' }), iron = k.metal('iron', { seed: 3, toon: '#4f5880' }), ironDk = k.metal('iron', { color: '#4a5268', rough: .34, rust: .3, seed: 7, toon: '#2c3050' });
  const oak = k.relief('wood', '#7c5534', { scale: 3, seed: 8 });
  // outside profile, mouth to crown (y up = outward normals); depth below the crown top in metres
  const OUT = [[1.36, 2.73], [1.47, 2.725], [1.515, 2.70], [1.5, 2.655], [1.44, 2.6], [1.22, 2.45], [.98, 2.05], [.9, 1.75], [.86, 1.5], [.82, 1.15], [.8, .9], [.77, .6], [.74, .42], [.68, .27], [.62, .2], [.45, .14], [.3, .13], [.02, .12]].map(([r, d]) => [r * sr, d * sy]);
  const IN = [[.02, .34], [.5, .42], [.66, .62], [.72, 1.0], [.75, 1.4], [.8, 1.75], [.88, 2.05], [1.12, 2.45], [1.3, 2.66], [1.36, 2.73]].map(([r, d]) => [r * sr, d * sy]);
  const rAt = d => { for (let i = 1; i < OUT.length; i++) { const a = OUT[i - 1], b = OUT[i]; if ((d - a[1]) * (d - b[1]) <= 0) { const dd = b[1] - a[1]; if (Math.abs(dd) < 1e-5) return a[0]; return a[0] + (b[0] - a[0]) * (d - a[1]) / dd; } } return OUT[0][0]; };
  const Y = d => top + .12 * sy - d;   // depth -> local y (crown top at y = top)
  k.add(g, k.lathe(OUT.map(([r, d]) => [r, Y(d)]), 72), bronze, 'bell_body_outside');
  k.add(g, k.lathe(IN.map(([r, d]) => [r, Y(d)]), 72), bronzeIn, 'bell_body_inside_patina');
  // mouldings: shoulder cords, waist lines, the sound bow beads, the lip
  for (const [d, t, nm] of [[.5, .03, 'shoulder_cord'], [.6, .022, 'shoulder_cord'], [.93, .022, 'inscription_lower_cord'], [1.97, .028, 'waist_line'], [2.08, .02, 'waist_line'], [2.36, .035, 'sound_bow_bead'], [2.44, .025, 'sound_bow_bead'], [2.66, .045, 'lip_roll']])
    k.add(g, new THREE.TorusGeometry(rAt(d * sy) + t * .35, t * sy, 8, 72), bronzeHi, 'bell_' + nm, 'metal', [0, Y(d * sy), 0], [Math.PI / 2, 0, 0]);
  // the RAISED INSCRIPTION band (cast letters, darker recess): a lathe slice standing .012 proud, canvas colour + bump
  { const d0 = .64 * sy, d1 = .9 * sy, band = []; for (let i = 0; i <= 6; i++) { const d = d1 - (d1 - d0) * i / 6; band.push([rAt(d) + .012, Y(d)]); }
    const txt = opts.text || BELL_TEXT, draw = (col, bg, sh) => (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.font = 'bold 78px Georgia, "Times New Roman", serif'; c.textBaseline = 'middle'; const tw = c.measureText(txt).width, sc = (w * .96) / tw;
      c.save(); c.scale(sc, 1); if (sh) { c.fillStyle = sh; c.fillText(txt, 6, h / 2 + 5); } c.fillStyle = col; c.fillText(txt, 0, h / 2); c.restore(); c.fillStyle = col; c.fillRect(0, 6, w, 5); c.fillRect(0, h - 11, w, 5); };
    const map = k.canvas(4096, 128, draw('#ffd890', '#a5743c', '#5a3a1c')), bump = k.canvas(4096, 128, draw('#ffffff', '#000000', null), false), bm = bump ? k.decal(bronze, map, bump, .02) : bronzeHi;
    const m = k.add(g, k.lathe(band, 96), bm, 'bell_raised_inscription_band'); if (bump) k.envHook(m, bronze); }
  // a cast relief: a cross budding into leaves on three Calvary steps (the bell's face, local -X)  and the founder's round seal (-X turned 55 degrees)
  const onBell = (ang, d, nm) => { const r = rAt(d), sub = new THREE.Group(); sub.name = nm; sub.position.set(Math.sin(ang) * r, Y(d), Math.cos(ang) * r); sub.rotation.y = ang; const sl = (rAt(d + .1) - rAt(d - .1)) / .2; sub.rotateX(-Math.atan(sl)); g.add(sub); return sub; };
  { const c = onBell(-Math.PI / 2, 1.42 * sy, 'bell_relief_cross_with_leaves'), s = sr, Z = .012;
    k.add(c, new THREE.BoxGeometry(.07 * s, .5 * s, .03), bronzeHi, 'relief_cross_upright', 'metal', [0, .02 * s, Z]); k.add(c, new THREE.BoxGeometry(.34 * s, .07 * s, .03), bronzeHi, 'relief_cross_arm', 'metal', [0, .12 * s, Z]);
    for (const [x, y] of [[0, .28], [0, -.24], [-.18, .12], [.18, .12]]) k.add(c, k.facet(new THREE.CylinderGeometry(.055 * s, .035 * s, .03, 3)), bronzeHi, 'relief_cross_trefoil_end', 'metal', [x * s, y * s, Z], [Math.PI / 2, 0, Math.atan2(x, y)]);
    for (let i = 0; i < 3; i++) k.add(c, new THREE.BoxGeometry((.3 - i * .08) * s, .04 * s, .028), bronzeHi, 'relief_calvary_step', 'metal', [0, (-.3 + i * .04) * s, Z]);
    for (const [x, y, a] of [[-.07, -.16, .9], [.07, -.16, -.9], [-.1, -.07, 1.2], [.1, -.07, -1.2], [-.06, .0, .7], [.06, .0, -.7], [-.11, .2, .5], [.11, .2, -.5]]) { const l = k.add(c, new THREE.SphereGeometry(.05 * s, 10, 6), bronzeHi, 'relief_leaf', 'metal', [x * s, y * s, Z]); l.scale.set(.42, 1, .28); l.rotation.z = a; }
    for (const [x, y] of [[-.13, -.12], [.13, -.12]]) k.add(c, new THREE.TorusGeometry(.04 * s, .007, 5, 12, Math.PI * 1.3), bronzeHi, 'relief_tendril', 'metal', [x * s, y * s, Z + .005]); }
  { const c = onBell(-Math.PI / 2 - .95, 1.3 * sy, 'bell_founders_mark'), map = k.canvas(256, 256, (x, w) => { x.fillStyle = '#a5743c'; x.fillRect(0, 0, w, w); x.strokeStyle = '#ffd890'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 112, 0, 6.29); x.stroke();
      x.fillStyle = '#ffd890'; x.beginPath(); x.moveTo(128, 50); x.quadraticCurveTo(92, 60, 88, 120); x.lineTo(76, 150); x.lineTo(180, 150); x.lineTo(168, 120); x.quadraticCurveTo(164, 60, 128, 50); x.fill(); x.beginPath(); x.arc(128, 160, 10, 0, 6.29); x.fill();
      for (const [sx2, sy2] of [[70, 70], [186, 70], [128, 30]]) { x.save(); x.translate(sx2, sy2); x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? 6 : 15; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.fill(); x.restore(); }
      x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.fillText('MDCCXL', 128, 205); });
    const bump = k.canvas(256, 256, (x, w) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, w); x.drawImage(map.image, 0, 0); const id = x.getImageData(0, 0, w, w); for (let i = 0; i < id.data.length; i += 4) { const v = id.data[i] > 200 ? 255 : 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; } x.putImageData(id, 0, 0); }, false);
    const fm = map ? k.decal(bronze, map, bump, .015) : bronzeHi, s = sr; const face = k.add(c, new THREE.CircleGeometry(.17 * s, 32), fm, 'founders_mark_seal_face', 'metal', [0, 0, .016]); if (map) k.envHook(face, bronze);
    k.add(c, new THREE.TorusGeometry(.17 * s, .016, 6, 32), bronzeHi, 'founders_mark_rim', 'metal', [0, 0, .012]); }
  // the crown: a crown plate, the central argent loop and four cannons (cast loops) through which the yoke straps pass
  k.add(g, new THREE.CylinderGeometry(.34 * sr, .4 * sr, .05, 32), bronze, 'bell_crown_plate', 'metal', [0, top + .025 - .06, 0]);
  k.add(g, new THREE.TorusGeometry(.1 * sr, .045 * sr, 8, 16, Math.PI), bronzeHi, 'bell_crown_argent', 'metal', [0, top - .04, 0]);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, cn = k.add(g, new THREE.TorusGeometry(.085 * sr, .036 * sr, 8, 14, Math.PI), bronzeHi, 'bell_crown_cannon', 'metal', [Math.cos(a) * .22 * sr, top - .05, Math.sin(a) * .22 * sr]); cn.rotation.y = -a + Math.PI / 2; }
  // the clapper: crown staple inside, an iron baldric strap with its pin, the shank, the ball, the flight
  const cl = new THREE.Group(); cl.name = 'bell_clapper'; cl.position.set(0, Y(.34 * sy) - .02, 0); g.add(cl);
  k.add(cl, new THREE.TorusGeometry(.05, .016, 6, 12), ironDk, 'clapper_crown_staple', 'metal', [0, 0, 0]); k.add(cl, new THREE.BoxGeometry(.05, .2, .1), ironDk, 'clapper_baldric_strap', 'metal', [0, -.12, 0]);
  k.add(cl, new THREE.CylinderGeometry(.016, .016, .14, 8), iron, 'clapper_baldric_pin', 'metal', [0, -.08, 0], [Math.PI / 2, 0, 0]);
  const shL = (2.05 * sy) - .22; k.add(cl, new THREE.CylinderGeometry(.04, .055, shL, 10), iron, 'clapper_shank', 'metal', [0, -.22 - shL / 2, 0]);
  k.add(cl, new THREE.SphereGeometry(.16 * sr, 18, 14), iron, 'clapper_ball', 'metal', [0, -.22 - shL - .1, 0]).scale.set(1, 1.3, 1);
  k.add(cl, new THREE.CylinderGeometry(.05, .035, .34 * sy, 10), iron, 'clapper_flight', 'metal', [0, -.22 - shL - .38 * sy, 0]); k.add(cl, new THREE.SphereGeometry(.045, 10, 8), iron, 'clapper_flight_knob', 'metal', [0, -.22 - shL - .56 * sy, 0]);
  // THE YOKE (headstock): chamfered oak, iron U-straps through the cannons with through-bolts and nuts, the big crown bolt, end hoops, end plates, the iron axle (gudgeons)
  const SL = opts.stockLen ?? 4.0, H = .44, hs = new THREE.Shape(), c0 = .06; hs.moveTo(-H / 2 + c0, -H / 2); hs.lineTo(H / 2 - c0, -H / 2); hs.lineTo(H / 2, -H / 2 + c0); hs.lineTo(H / 2, H / 2 - c0); hs.lineTo(H / 2 - c0, H / 2); hs.lineTo(-H / 2 + c0, H / 2); hs.lineTo(-H / 2, H / 2 - c0); hs.lineTo(-H / 2, -H / 2 + c0); hs.lineTo(-H / 2 + c0, -H / 2);
  const stockG = new THREE.ExtrudeGeometry(hs, { depth: SL, bevelEnabled: false }); stockG.translate(0, 0, -SL / 2); k.add(g, stockG, oak, 'yoke_oak_headstock', 'wood');
  for (const z of [-.3, -.1, .1, .3]) { k.add(g, new THREE.BoxGeometry(H + .05, .022, .09), ironDk, 'yoke_strap_top', 'metal', [0, H / 2 + .011, z]);
    for (const s of [-1, 1]) { k.add(g, new THREE.BoxGeometry(.022, H + .16, .09), ironDk, 'yoke_strap_side', 'metal', [s * (H / 2 + .011), -.08, z]); if (!far) k.bolt(g, [s * (H / 2 + .022), .05, z], [s, 0, 0], .028, iron, s > 0 ? 'yoke_strap_bolt' : 'yoke_strap_nut', { stub: s < 0 }); } }
  k.add(g, new THREE.BoxGeometry(.3, .03, .3), ironDk, 'yoke_crown_bolt_plate', 'metal', [0, H / 2 + .035, 0]); k.bolt(g, [0, H / 2 + .05, 0], [0, 1, 0], .05, iron, 'yoke_crown_bolt_nut', { stub: true });
  for (const s of [-1, 1]) { const z = s * (SL / 2 - .25); k.add(g, new THREE.BoxGeometry(H + .03, H + .03, .07), ironDk, 'yoke_end_hoop', 'metal', [0, 0, z]);
    k.add(g, new THREE.BoxGeometry(H - .04, H - .04, .03), ironDk, 'yoke_end_plate', 'metal', [0, 0, s * (SL / 2 + .015)]); if (!far) for (const [x, y] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) k.bolt(g, [x * .13, y * .13, s * (SL / 2 + .03)], [0, 0, s], .022, iron, 'yoke_end_plate_bolt');
    k.bar(g, [0, 0, s * (SL / 2 + .03)], [0, 0, s * (opts.axleTo ?? 2.75)], .065, iron, 'yoke_iron_axle_gudgeon', 'metal', .065, 18); k.add(g, new THREE.CylinderGeometry(.085, .085, .03, 18), ironDk, 'axle_collar', 'metal', [0, 0, s * (SL / 2 + .16)], [Math.PI / 2, 0, 0]); }
  return { group: g, clapper: cl, anchors: { pivot: new THREE.Vector3(), mouth: new THREE.Vector3(0, Y(2.7 * sy), 0), crown: new THREE.Vector3(0, top, 0), mark: new THREE.Vector3(-rAt(1.3 * sy), Y(1.3 * sy), 0) }, rAt: d => rAt(d), parts: countParts(g) };
}

// THE BELL WHEEL: origin = the hub on the axle, wheel plane = local XY, axle = local Z (marble.js: on the bell swing at z 2.62).
// opts: R (1.25), width (.16), spokes (6), rope (true: the rope lies in the groove and leaves at +X going down: anchors.rope_exit), far.
export function buildBellWheel(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), R = opts.R ?? 1.25, W = opts.width ?? .16, far = !!opts.far, g = new THREE.Group(); g.name = opts.name || 'bell_wheel';
  const oak = k.relief('wood', '#9a6a3c', { scale: 2.6, seed: 12 }), oakDk = k.relief('wood', '#74502e', { scale: 2.2, seed: 14 }), iron = k.metal('iron', { seed: 3, toon: '#4f5880' }), ironDk = k.metal('iron', { color: '#4a5268', rough: .36, rust: .35, seed: 21, toon: '#2c3050' });
  oak.side = THREE.DoubleSide;
  // the grooved rim (felloes): a lathe ring round local Y, turned so its axle is local Z; a U groove between two flanges
  const fl = .035, rimIn = R - .14, prof = [[rimIn, -W / 2], [R + fl, -W / 2], [R + fl, -W / 2 + .025], [R - .015, -.04], [R - .05, -.015], [R - .055, 0], [R - .05, .015], [R - .015, .04], [R + fl, W / 2 - .025], [R + fl, W / 2], [rimIn, W / 2], [rimIn, -W / 2]];
  const rim = k.add(g, k.lathe(prof, 96), oak, 'wheel_grooved_oak_rim', 'wood'); rim.rotation.x = Math.PI / 2;
  // felloe joints with iron tyre straps across the outer flanges and side plates, each with two bolts through
  const nS = opts.spokes ?? 6; for (let i = 0; i < nS; i++) { const a = (i + .5) * 2 * Math.PI / nS, ca = Math.cos(a), sa = Math.sin(a);
    k.add(g, new THREE.BoxGeometry(.006, .12, W + .01), oakDk, 'wheel_felloe_joint', 'wood', [ca * (R - .07), sa * (R - .07), 0]).rotation.z = a;
    for (const s of [-1, 1]) { const p = k.add(g, new THREE.BoxGeometry(.2, .1, .012), ironDk, 'wheel_iron_tyre_strap', 'metal', [ca * (R - .06), sa * (R - .06), s * (W / 2 + .006)]); p.rotation.z = a + Math.PI / 2;
      if (!far) for (const o of [-.06, .06]) k.bolt(g, [ca * (R - .06) - sa * o, sa * (R - .06) + ca * o, s * (W / 2 + .012)], [0, 0, s], .016, iron, 'wheel_strap_bolt'); }
    k.add(g, new THREE.TorusGeometry(R + fl + .004, .01, 5, 10, .26), ironDk, 'wheel_flange_tyre_band', 'metal', [0, 0, W / 2 - .012], [0, 0, a - .13]); k.add(g, new THREE.TorusGeometry(R + fl + .004, .01, 5, 10, .26), ironDk, 'wheel_flange_tyre_band', 'metal', [0, 0, -W / 2 + .012], [0, 0, a - .13]); }
  // the spokes: oak bars from the hub to the rim, iron corner plates at the rim, a wedge at each spoke foot
  for (let i = 0; i < nS; i++) { const a = i * 2 * Math.PI / nS, d = [Math.cos(a), Math.sin(a), 0];
    k.beam(g, [d[0] * .2, d[1] * .2, 0], [d[0] * (rimIn + .02), d[1] * (rimIn + .02), 0], .075, .09, oak, 'wheel_oak_spoke', 'wood', [0, 0, 1]);
    for (const s of [-1, 1]) { const p = k.add(g, new THREE.BoxGeometry(.16, .07, .01), ironDk, 'wheel_spoke_corner_plate', 'metal', [d[0] * (rimIn - .04), d[1] * (rimIn - .04), s * .05]); p.rotation.z = a; if (!far) k.bolt(g, [d[0] * (rimIn - .07), d[1] * (rimIn - .07), s * .055], [0, 0, s], .014, iron, 'wheel_spoke_bolt'); }
    const w = k.add(g, k.facet(new THREE.CylinderGeometry(.012, .035, .08, 4)), oakDk, 'wheel_spoke_wedge', 'wood', [d[0] * .27, d[1] * .27, .05]); w.rotation.z = a - Math.PI / 2; }
  // the hub: an oak octagon boss, an iron hub plate each side with bolts, the key in the axle
  k.add(g, k.facet(new THREE.CylinderGeometry(.24, .24, .2, 8)), oakDk, 'wheel_oak_hub', 'wood', [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) { k.add(g, k.facet(new THREE.CylinderGeometry(.19, .19, .02, 8)), ironDk, 'wheel_iron_hub_plate', 'metal', [0, 0, s * .11], [Math.PI / 2, 0, Math.PI / 8]); if (!far) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; k.bolt(g, [Math.cos(a) * .14, Math.sin(a) * .14, s * .12], [0, 0, s], .018, iron, 'wheel_hub_bolt'); } }
  k.add(g, new THREE.BoxGeometry(.03, .035, .26), iron, 'wheel_axle_key', 'metal', [0, .07, 0]);
  const A = { hub: new THREE.Vector3(), rope_exit: new THREE.Vector3(R - .05, 0, 0) };
  if (opts.rope !== false) { const rope = k.relief('bark', '#c9a46a', { scale: .08, seed: 3 }); const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * 2.6; pts.push([Math.cos(a) * (R - .03), Math.sin(a) * (R - .03), 0]); }
    k.tube(g, pts, .03, rope, 'wheel_rope_in_groove', 60, 8, 'cloth'); k.tube(g, [[R - .03, 0, 0], [R - .03, -.6, 0]], .03, rope, 'wheel_rope_leaving', 6, 8, 'cloth');
    const ga = 2.6; k.add(g, new THREE.SphereGeometry(.05, 10, 8), rope, 'wheel_rope_garter_knot', 'cloth', [Math.cos(ga) * (R - .06), Math.sin(ga) * (R - .06), 0]); k.add(g, new THREE.CylinderGeometry(.04, .04, W + .02, 10), ironDk, 'wheel_garter_hole_bush', 'metal', [Math.cos(ga + .07) * (R - .09), Math.sin(ga + .07) * (R - .09), 0], [Math.PI / 2, 0, 0]); }
  return { group: g, anchors: A, parts: countParts(g) };
}

// THE BELL FRAME: origin = the chamber floor under the pivot. Two oak A-frames at z = +-halfZ, sills, legs, braces, a collar tie, a cap beam,
// iron gudgeon bearings (plummer blocks) at y = pivot, iron corner straps, oak wedges and pegs. opts: halfZ 2.2, pivot 3.3, spread 2.0, far.
export function buildBellFrame(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), Z = opts.halfZ ?? 2.2, PV = opts.pivot ?? 3.3, SP = opts.spread ?? 2.0, far = !!opts.far, g = new THREE.Group(); g.name = opts.name || 'bell_frame';
  const oak = k.relief('wood', '#8a5e36', { scale: 3, seed: 9 }), oakDk = k.relief('wood', '#6e4a2a', { scale: 2.6, seed: 10 }), iron = k.metal('iron', { seed: 3, toon: '#4f5880' }), ironDk = k.metal('iron', { color: '#4a5268', rough: .36, rust: .35, seed: 21, toon: '#2c3050' });
  for (const s of [-1, 1]) k.beam(g, [s * (SP + .25), .13, -Z - .3], [s * (SP + .25), .13, Z + .3], .26, .26, oakDk, 'frame_ground_beam', 'wood', [1, 0, 0]);
  for (const z of [-Z, Z]) { const zs = Math.sign(z);
    k.add(g, new THREE.BoxGeometry(2 * SP + .9, .26, .3), oakDk, 'frame_sill', 'wood', [0, .39, z]);
    k.add(g, new THREE.BoxGeometry(1.0, .24, .32), oak, 'frame_cap_beam', 'wood', [0, PV - .27, z]);
    for (const s of [-1, 1]) { k.beam(g, [s * SP, .5, z], [s * .4, PV - .36, z], .24, .26, oak, 'frame_oak_leg', 'wood', [0, 0, 1]);
      k.beam(g, [s * (SP - .45), 1.25, z], [s * .05, 2.2, z], .13, .16, oakDk, 'frame_brace', 'wood', [0, 0, 1]);
      k.add(g, k.facet(new THREE.CylinderGeometry(.02, .07, .22, 4)), oakDk, 'frame_oak_wedge', 'wood', [s * (SP + .18), .6, z], [0, 0, s * .2]);
      for (const [x, y] of [[s * (SP - .12), .62], [s * .45, PV - .45], [s * (SP - .45), 1.32]]) k.add(g, new THREE.CylinderGeometry(.025, .025, .34, 8), oakDk, 'frame_oak_peg', 'wood', [x, y, z], [Math.PI / 2, 0, 0]);
      for (const zz of [-1, 1]) { const p = k.add(g, new THREE.BoxGeometry(.34, .06, .012), ironDk, 'frame_iron_corner_strap', 'metal', [s * (SP - .1), .58, z + zz * .156]); p.rotation.z = -s * .55; if (!far) k.bolt(g, [s * (SP - .1), .58, z + zz * .162], [0, 0, zz], .02, iron, 'frame_strap_bolt', { stub: zz < 0 }); } }
    k.add(g, new THREE.BoxGeometry(1.7, .2, .28), oak, 'frame_collar_tie', 'wood', [0, 2.25, z]);
    // the plummer block: base plate bolted to the cap beam, the bearing housing, the cap with two bolts, a grease cup
    k.add(g, new THREE.BoxGeometry(.6, .05, .34), ironDk, 'bearing_base_plate', 'metal', [0, PV - .13, z]); k.add(g, new THREE.BoxGeometry(.34, .12, .3), iron, 'bearing_housing', 'metal', [0, PV - .06, z]);
    k.add(g, new THREE.CylinderGeometry(.11, .11, .3, 18, 1, false, 0, Math.PI), ironDk, 'bearing_cap', 'metal', [0, PV, z], [Math.PI / 2, 0, Math.PI / 2 - Math.PI / 2]);
    if (!far) for (const x of [-.24, .24]) k.bolt(g, [x, PV - .1, z], [0, 1, 0], .025, iron, 'bearing_cap_bolt', { stub: true });
    k.add(g, k.lathe([[.0, 0], [.035, 0], [.04, .04], [.025, .07], [0, .075]], 10), iron, 'bearing_grease_cup', 'metal', [0, PV + .1, z + zs * .02]); }
  return { group: g, anchors: { pivot: new THREE.Vector3(0, PV, 0), floor: new THREE.Vector3() }, parts: countParts(g) };
}

// ================================================================================================================================
// 4. THE GOLD ANGEL (gilt weathervane statue, 2.9 m to the halo; the trumpet bell reaches about 3.7 m). Origin = underside of the stepped base,
// faces local +Z (toward the hero tower), the trumpet goes up toward +X so it reads in profile from the town. Returns setStruck(bool):
// struck = trumpet bent like a noodle, scorch marks on robe, wing and ball, two primaries burnt off, the right wing knocked down.
export function buildAngel(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), g = new THREE.Group(); g.name = opts.name || 'gold_angel';
  const gold = k.metal('gold', { seed: 41, toon: '#ffc21f' }), goldHi = k.metal('gold', { color: '#ffd77a', rough: .12, seed: 43, toon: '#ffe58a' }), goldDp = k.metal('gold', { color: '#e0a634', rough: .22, seed: 45, toon: '#e0a020' }),
    soot = k.metal('iron', { color: '#2a2018', rough: .8, rust: .3, env: .4, seed: 47, toon: '#2a2018' });
  // stepped base, gadroon ring, the ball with its equator band and meridian, the collar
  for (const [r, y0, h] of [[.6, 0, .06], [.5, .06, .05], [.4, .11, .04]]) k.add(g, k.facet(new THREE.CylinderGeometry(r, r + .02, h, 16)), goldDp, 'angel_base_step', 'metal', [0, y0 + h / 2, 0]);
  for (let i = 0; i < 20; i++) { const a = i * Math.PI / 10; k.add(g, new THREE.SphereGeometry(.035, 8, 6), goldHi, 'angel_base_gadroon', 'metal', [Math.cos(a) * .36, .165, Math.sin(a) * .36]).scale.set(1, .6, 1); }
  const bY = .15 + .26; k.add(g, new THREE.SphereGeometry(.26, 32, 22), gold, 'angel_orb', 'metal', [0, bY, 0]); k.add(g, new THREE.TorusGeometry(.262, .014, 6, 40), goldHi, 'angel_orb_equator', 'metal', [0, bY, 0], [Math.PI / 2, 0, 0]);
  k.add(g, new THREE.TorusGeometry(.262, .01, 6, 40, Math.PI), goldHi, 'angel_orb_meridian', 'metal', [0, bY, 0]); k.add(g, k.lathe([[.17, 0], [.1, .05], [.09, .1], [.15, .14], [.12, .16]], 24), goldHi, 'angel_collar_cup', 'metal', [0, bY + .24, 0]);
  // the robe: a lathe with deep folds that fan out to the hem (vertices pushed in and out by angle), an overfold at the hips, the belt with a knot and two ends
  const y0 = bY + .38, robeH = 1.3, prof = [[.47, 0], [.49, .03], [.44, .12], [.36, .4], [.28, .75], [.22, 1.05], [.21, 1.2], [.23, 1.3]];
  const robeG = k.lathe(prof.map(([r, y]) => [r, y]), 72), pa = robeG.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), r = Math.hypot(x, z), th = Math.atan2(x, z), A = .1 * Math.max(0, 1 - y / 1.25) + .012, f = 1 + A * Math.sin(9 * th + 1.2 * Math.sin(2 * th + y * 2.2)) + .04 * A * Math.sin(23 * th);
    pa.setX(i, x * f); pa.setZ(i, z * f * .72); }
  robeG.computeVertexNormals(); k.add(g, robeG, gold, 'angel_robe_folded', 'metal', [0, y0, 0]);
  const over = k.lathe([[.31, 0], [.34, .05], [.29, .2], [.25, .26]], 48); { const p2 = over.attributes.position; for (let i = 0; i < p2.count; i++) { const x = p2.getX(i), z = p2.getZ(i), th = Math.atan2(x, z), f = 1 + .07 * Math.sin(7 * th + .5); p2.setX(i, x * f); p2.setZ(i, z * f * .74); } over.computeVertexNormals(); }
  k.add(g, over, goldDp, 'angel_robe_overfold', 'metal', [0, y0 + .62, 0]); k.add(g, new THREE.TorusGeometry(.215, .025, 8, 32), goldHi, 'angel_belt', 'metal', [0, y0 + 1.03, 0], [Math.PI / 2, 0, 0]).scale.set(1, .74, 1);
  k.add(g, new THREE.SphereGeometry(.04, 10, 8), goldHi, 'angel_belt_knot', 'metal', [.06, y0 + 1.03, .16]); for (const s of [-1, 1]) k.tube(g, [[.06, y0 + 1.02, .17], [.06 + s * .04, y0 + .8, .2], [.06 + s * .03, y0 + .55, .22]], .016, goldHi, 'angel_belt_hanging_end', 14, 6);
  for (let i = 0; i < 5; i++) { const x = -.2 + i * .1; k.tube(g, [[x * 1.9, y0 + .04, .34], [x * 1.3, y0 + .4, .27], [x * .8, y0 + .8, .19]], .012, goldHi, 'angel_robe_fold_crest', 12, 5); }
  k.add(g, new THREE.SphereGeometry(.05, 10, 8), goldDp, 'angel_bare_toe', 'metal', [-.08, y0 + .01, .4]).scale.set(1, .6, 1.4); k.add(g, new THREE.SphereGeometry(.05, 10, 8), goldDp, 'angel_bare_toe', 'metal', [.1, y0 + .01, .38]).scale.set(1, .6, 1.4);
  // torso, a sash across the chest, neck
  const tY = y0 + robeH; k.add(g, new THREE.SphereGeometry(.24, 24, 16), gold, 'angel_chest', 'metal', [0, tY + .08, 0]).scale.set(1, 1.0, .72);
  k.tube(g, [[-.2, tY + .24, .06], [0, tY + .1, .19], [.2, tY - .08, .13]], .035, goldHi, 'angel_chest_sash', 16, 8); k.add(g, new THREE.CylinderGeometry(.07, .08, .14, 14), gold, 'angel_neck', 'metal', [0, tY + .32, 0]);
  // the head turned to the trumpet: face (nose, brow, lips, chin), curls, the halo on a rod
  const hC = new THREE.Vector3(.02, tY + .5, .0), F = new THREE.Vector3(.98, 0, .19).normalize(), head = new THREE.Group(); head.name = 'angel_head'; head.position.copy(hC); head.rotation.y = Math.atan2(F.x, F.z); head.rotation.x = -.18; g.add(head);
  k.add(head, new THREE.SphereGeometry(.16, 28, 20), gold, 'angel_head_skull', 'metal').scale.set(.94, 1.08, 1); k.add(head, k.facet(new THREE.ConeGeometry(.03, .07, 4)), gold, 'angel_nose', 'metal', [0, -.0, .165], [Math.PI / 2 + .3, 0, 0]);
  k.add(head, new THREE.TorusGeometry(.06, .012, 5, 12, Math.PI), goldHi, 'angel_brow', 'metal', [0, .035, .145], [0, 0, 0]); k.add(head, new THREE.SphereGeometry(.04, 10, 8), gold, 'angel_chin', 'metal', [0, -.12, .12]); k.add(head, new THREE.SphereGeometry(.026, 10, 8), goldDp, 'angel_lips_puffed', 'metal', [0, -.075, .16]).scale.set(1.3, .8, 1);
  { const rr = k.rnd(53); for (let i = 0; i < 34; i++) { const th = rr() * Math.PI * 1.5 + Math.PI * .25 + Math.PI, ph = rr() * 1.25 - .15, r = .165; const c = k.add(head, new THREE.SphereGeometry(.036 + rr() * .014, 10, 8), i % 3 ? gold : goldHi, 'angel_hair_curl', 'metal', [Math.sin(th) * Math.cos(ph) * r, Math.sin(ph) * r * 1.05 + .03, Math.cos(th) * Math.cos(ph) * r]); c.scale.set(1, .8, 1); k.add(head, new THREE.TorusGeometry(.022, .006, 5, 10), goldDp, 'angel_hair_curl_groove', 'metal', c.position.clone().multiplyScalar(1.12)).lookAt(c.position.clone().multiplyScalar(3)); }
    for (const s of [-1, 1]) for (let j = 0; j < 3; j++) k.add(head, new THREE.TorusGeometry(.022, .011, 6, 10), goldHi, 'angel_forehead_curl', 'metal', [s * (.05 + j * .035), .12 - j * .02, .11 - j * .025]).rotation.y = s * .5; }
  const halo = new THREE.Group(); halo.name = 'angel_halo'; halo.position.set(0, .06, -.2); head.add(halo); k.add(halo, new THREE.TorusGeometry(.3, .02, 8, 48), goldHi, 'angel_halo_ring'); k.add(halo, new THREE.TorusGeometry(.24, .008, 6, 48), goldHi, 'angel_halo_inner_ring');
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; k.bar(halo, [Math.cos(a) * .245, Math.sin(a) * .245, 0], [Math.cos(a) * .295, Math.sin(a) * .295, 0], .006, goldHi, 'angel_halo_ray', 'metal', .004, 5); } k.bar(head, [0, 0, -.12], [0, .06, -.2], .012, goldDp, 'angel_halo_rod', 'metal');
  // THE WINGS: layered feather rows (primaries with a raised shaft, secondaries, greater and lesser coverts, a row of small scapulars), extruded gilt feathers
  const fGeo = (l, w) => { const s = new THREE.Shape(); s.moveTo(-w * .22, 0); s.quadraticCurveTo(-w * .62, l * .45, -w * .18, l * .93); s.quadraticCurveTo(0, l * 1.03, w * .14, l * .95); s.quadraticCurveTo(w * .58, l * .45, w * .22, 0); s.lineTo(-w * .22, 0);
    return new THREE.ExtrudeGeometry(s, { depth: .008, bevelEnabled: true, bevelThickness: .005, bevelSize: .005, bevelSegments: 1, curveSegments: 6 }); };
  const wingArm = new THREE.CatmullRomCurve3([[0, 0, 0], [.32, .3, 0], [.55, .7, 0], [.62, 1.05, 0]].map(k.V)), wings = [];
  for (const s of [-1, 1]) { const wg = new THREE.Group(); wg.name = s > 0 ? 'angel_wing_right' : 'angel_wing_left'; wg.position.set(s * .1, tY + .14, -.17); wg.rotation.set(-.15, s * -.55, 0); wg.scale.x = s; g.add(wg); wings.push(wg);
    const row = (n, s0, s1, l0, l1, w, z, mat, nm, a0, a1, rib) => { for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : 0, sp = s0 + (s1 - s0) * u, B = wingArm.getPointAt(sp), a = a0 + (a1 - a0) * u, l = l0 + (l1 - l0) * u;
      const f = k.add(wg, fGeo(l, w), mat, nm, 'metal', [B.x, B.y, z - u * .004]); f.rotation.z = a - Math.PI / 2; f.userData.u = u; if (rib) k.bar(wg, [B.x, B.y, z + .02], [B.x + Math.cos(a) * l * .9, B.y + Math.sin(a) * l * .9, z + .02], .006, goldHi, 'angel_primary_raised_shaft', 'metal', .003, 5); } };
    row(9, .72, 1.0, .78, 1.12, .17, -.04, gold, 'angel_wing_primary', -1.0, .35 + Math.PI / 2 - .2, true);   // fan from the wrist: outer down-out to the tip straight up
    row(10, .08, .7, .6, .74, .17, -.02, goldDp, 'angel_wing_secondary', -1.75, -1.0, false);
    row(11, .06, .96, .3, .36, .13, .0, goldHi, 'angel_wing_greater_covert', -1.6, .9, false); row(12, .04, .93, .17, .2, .1, .018, gold, 'angel_wing_lesser_covert', -1.4, 1.2, false);
    row(7, .02, .4, .11, .13, .09, .034, goldHi, 'angel_wing_scapular', -1.2, 0, false);
    k.tube(wg, [[0, 0, .03], [.32, .3, .035], [.55, .7, .035], [.62, 1.05, .03]], .03, gold, 'angel_wing_leading_edge_bone', 24, 8); }
  // arms in wide sleeves, hands on the trumpet; THE TRUMPET: mouthpiece cup, lead pipe, ferrules, a ball boss, the long tube, the flared bell with a rolled rim
  const M0 = hC.clone().addScaledVector(F, .17).add(new THREE.Vector3(0, -.09, 0)), T = new THREE.Vector3(.62, .76, .12).normalize(), TL = 1.5, at = t => M0.clone().addScaledVector(T, t * TL);
  const arm = (sh, el, hd, nm) => { k.bar(g, sh, el, .055, gold, nm + '_upper', 'metal', .05, 14); k.bar(g, el, hd, .045, gold, nm + '_forearm', 'metal', .04, 14); const d = k.V(hd).sub(k.V(el)); k.bar(g, k.V(el).addScaledVector(d, .25), k.V(el).addScaledVector(d, .62), .06, goldDp, nm + '_sleeve_flare', 'metal', .1, 16).material.side = THREE.DoubleSide;
    k.add(g, new THREE.SphereGeometry(.05, 14, 10), gold, nm + '_fist_on_trumpet', 'metal', hd).scale.set(1, .85, 1.15); k.add(g, new THREE.SphereGeometry(.07, 12, 8), gold, nm + '_shoulder', 'metal', sh); };
  arm([.2, tY + .16, .02], [.36, tY - .02, .2], at(.14), 'angel_arm_right'); arm([-.2, tY + .16, .02], [.06, tY + .02, .36], at(.38), 'angel_arm_left');
  const tS = new THREE.Group(); tS.name = 'angel_trumpet_straight'; g.add(tS); const tB = new THREE.Group(); tB.name = 'angel_trumpet_bent_noodle'; g.add(tB);
  const trumpet = (par, path, nm) => { const c = new THREE.CatmullRomCurve3(path.map(k.V)), N = 60;
    k.add(par, new THREE.TubeGeometry(c, N, .022, 12, false), goldHi, nm + '_tube'); const pS = c.getPointAt(0), dS = c.getTangentAt(0);
    k.basis(k.add(par, k.lathe([[.0, -.06], [.018, -.06], [.022, -.02], [.035, .0], [.03, .01], [.0, .0]].map(([r, y]) => [r, -y]), 16), goldHi, nm + '_mouthpiece_cup', 'metal', pS), dS.clone().negate());
    for (const t of [.12, .45, .7]) { const p = c.getPointAt(t), d = c.getTangentAt(t); k.basis(k.add(par, new THREE.CylinderGeometry(.032, .032, .05, 14), gold, nm + '_ferrule', 'metal', p), d); }
    k.add(par, new THREE.SphereGeometry(.045, 14, 10), goldHi, nm + '_ball_boss', 'metal', c.getPointAt(.3));
    const pE = c.getPointAt(1), dE = c.getTangentAt(1), bell = k.add(par, k.lathe([[.022, 0], [.03, .12], [.05, .2], [.1, .27], [.2, .31], [.24, .315]], 32), goldHi, nm + '_bell_flare', 'metal', pE); bell.material.side = THREE.DoubleSide; k.basis(bell, dE);
    k.add(bell, new THREE.TorusGeometry(.24, .014, 8, 36), goldHi, nm + '_bell_rolled_rim', 'metal', [0, .315, 0], [Math.PI / 2, 0, 0]); return { c, bell }; };
  trumpet(tS, [0, .25, .5, .75, 1].map(t => at(t)), 'trumpet');
  const nb = trumpet(tB, [M0, at(.18), M0.clone().add(new THREE.Vector3(.45, .2, .12)), M0.clone().add(new THREE.Vector3(.68, -.05, .2)), M0.clone().add(new THREE.Vector3(.66, -.4, .3)), M0.clone().add(new THREE.Vector3(.48, -.55, .4)), M0.clone().add(new THREE.Vector3(.58, -.78, .5))], 'trumpet_bent'); nb.bell.scale.set(1.15, .7, .8);
  // scorch marks and burnt feathers (struck state only)
  const sc = new THREE.Group(); sc.name = 'angel_scorch_marks'; g.add(sc); { const rr = k.rnd(61); const spots = [[.0, y0 + .5, .34], [.2, y0 + .2, .3], [-.25, y0 + .1, .28], [.1, tY + .1, .17], [.17, bY + .1, .19], [-.12, bY - .05, .22], [.05, y0 + .95, .2], [-.1, y0 + .7, .27]];
    for (const p of spots) { const m = k.add(sc, new THREE.SphereGeometry(.07 + rr() * .07, 12, 8), soot, 'angel_scorch_mark', 'metal', p); m.scale.set(1, 1.4, .22); m.lookAt(new THREE.Vector3(p[0] * 3, p[1], p[2] * 3)); }
    for (let i = 0; i < 6; i++) k.tube(sc, [[-.05 + i * .03, y0 + .9 - i * .04, .2 + i * .01], [-.02 + i * .05, y0 + .6 - i * .05, .27], [.04 + i * .04, y0 + .3 - i * .03, .33]], .006, soot, 'angel_scorch_streak', 10, 4); }
  const burnt = []; wings[1].children.forEach(m => { if (m.name === 'angel_wing_primary' && m.userData.u > .75) burnt.push(m); });
  const setStruck = on => { tS.visible = !on; tB.visible = !!on; sc.visible = !!on; burnt.forEach(m => m.visible = !on); wings[1].rotation.z = on ? -.45 : 0; wings[1].rotation.x = on ? .25 : -.15; };
  setStruck(!!opts.struck);
  return { group: g, setStruck, trumpetStraight: tS, trumpetBent: tB, anchors: { top: new THREE.Vector3(0, tY + .92, 0), mouth: M0.clone(), trumpet_bell: at(1), orb: new THREE.Vector3(0, bY, 0), base: new THREE.Vector3() }, parts: countParts(g) };
}

// ================================================================================================================================
// 5. TOOLS for the hook. THE MASON'S HAMMER: same frame as tower_props.buildHammer (+Y up the handle, butt at 0, head centre y .375, face at +X),
// so { group, grip, tip } drops in for it (held3d builder "buildMasonHammer"). THE COIL of wire on his shoulder: origin = coil centre, axis local Z.
export function buildMasonHammer(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), g = new THREE.Group(); g.name = 'mason_hammer';
  const ash = k.relief('wood', '#c99a5e', { scale: 1.2, seed: 18, normal: 1.4 }), ashDk = k.relief('wood', '#8e6a40', { scale: 1.0, seed: 19 }), iron = k.metal('iron', { color: '#5a627a', rough: .3, seed: 25, toon: '#4a5174' }), face = k.metal('steel', { color: '#e2e8f0', rough: .1, nscale: .1, seed: 27, toon: '#ffd9a0' });
  k.add(g, k.lathe([[.0, -.012], [.022, -.01], [.027, .02], [.024, .06], [.019, .16], [.0175, .3], [.019, .34], [.021, .36], [0, .362]], 16), ash, 'hammer_ash_handle_turned', 'wood');
  k.add(g, new THREE.CylinderGeometry(.0225, .0245, .1, 16, 1, true), ashDk, 'hammer_handle_worn_grip', 'wood', [0, .085, 0]).material.side = THREE.DoubleSide;
  k.add(g, new THREE.SphereGeometry(.026, 12, 8), ashDk, 'hammer_butt_swell', 'wood', [0, -.004, 0]).scale.set(1, .6, 1);
  const hd = k.add(g, k.facet(new THREE.CylinderGeometry(.04, .04, .16, 8)), iron, 'hammer_forged_head_octagon', 'metal', [.01, .375, 0], [0, 0, Math.PI / 2]); hd.rotation.x = Math.PI / 8;
  k.add(g, k.facet(new THREE.CylinderGeometry(.036, .041, .025, 8)), iron, 'hammer_face_chamfer', 'metal', [.1, .375, 0], [Math.PI / 8, 0, Math.PI / 2]);
  k.add(g, new THREE.CylinderGeometry(.036, .036, .008, 20), face, 'hammer_bright_striking_face', 'metal', [.1165, .375, 0], [0, 0, Math.PI / 2]);
  const peen = new THREE.BufferGeometry(), pv = [-.07, -.04, -.04, -.07, .04, -.04, -.07, .04, .04, -.07, -.04, .04, -.13, -.042, -.006, -.13, .042, -.006, -.13, .042, .006, -.13, -.042, .006];
  peen.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3)); peen.setIndex([0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5, 4, 5, 6, 4, 6, 7, 0, 3, 2, 0, 2, 1]); k.add(g, k.facet(peen), iron, 'hammer_cross_peen', 'metal', [0, .375, 0]);
  for (const s of [-1, 1]) k.add(g, new THREE.BoxGeometry(.05, .012, .05), iron, 'hammer_eye_cheek', 'metal', [0, .375 + s * .044, 0]);
  k.add(g, new THREE.BoxGeometry(.008, .012, .032), ashDk, 'hammer_oak_wedge', 'wood', [0, .419, 0]); k.add(g, new THREE.BoxGeometry(.03, .013, .005), face, 'hammer_iron_cross_wedge', 'metal', [0, .421, 0]);
  return { group: g, grip: new THREE.Vector3(0, .07, 0), tip: new THREE.Vector3(.12, .375, 0), parts: countParts(g) };
}
export function buildWireCoil(THREE, ctx = {}, opts = {}) {
  const k = kit(THREE, ctx), r = opts.r ?? .15, wr = opts.radius ?? .012, n = opts.turns ?? 9, g = new THREE.Group(); g.name = 'wire_coil';
  const wm = k.metal('iron', { color: '#5a6580', finish: 'brushed', rough: .3, rust: .12, seed: 13, toon: '#2c3050' }), lead = k.metal('steel', { color: '#8f96a4', rough: .55, seed: 19, toon: '#8a90a0' }), rr = k.rnd(71);
  for (let i = 0; i < n; i++) { const pts = []; const z = (i - (n - 1) / 2) * wr * 2.05, rad = r + (rr() - .5) * .012; for (let j = 0; j <= 24; j++) { const a = j / 24 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad * (1 + (rr() - .5) * .02), z + Math.sin(a * 2 + i) * .004)); }
    const c = new THREE.CatmullRomCurve3(pts, true); k.add(g, k.twist(c, wr * .45, wr * 7, i, wr * .52, 160, 5), wm, 'coil_wire_turn_strand_a'); k.add(g, new THREE.TubeGeometry(c, 96, wr * .62, 6, true), wm, 'coil_wire_turn_core'); }
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + .4, cc = new THREE.CatmullRomCurve3([-1, 0, 1].map(t => new THREE.Vector3(Math.cos(a + t * .12) * r, Math.sin(a + t * .12) * r, 0)));
    k.add(g, k.twist(cc, n * wr * 1.15, .012, 0, .0035, 160, 4), lead, 'coil_binding_tie'); }
  const end = new THREE.Vector3(r + .28, -.25, .03); k.tube(g, [[r, 0, (n / 2) * wr * 2], [r + .08, -.05, .03], [r + .2, -.15, .04], end], wr, wm, 'coil_loose_end', 30, 7);
  k.add(g, new THREE.SphereGeometry(wr * 1.05, 8, 6), wm, 'coil_cut_end', 'metal', end);
  return { group: g, anchors: { end, centre: new THREE.Vector3() }, parts: countParts(g) };
}
