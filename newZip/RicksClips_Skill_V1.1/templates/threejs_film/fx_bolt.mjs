// FX_BOLT (kit 2026-11-15, vfx-artist; CB on the lightning spear film: "you should make the thunder bolt much better than this").
// The story's lightning as a hero effect, handed to set modules as ctx.fx.bolt(opts) (hooked in look3d.mjs makeKit3d -> k3.fx, film.js ctx.fx).
//   SHAPE   a fractal main channel (midpoint displacement down to ~0.2-0.4 m segments: hundreds of small jags, never a few long straight lines),
//           4-12 branches leaving the upper 80 % of the channel, each forking again (2 more levels), thinning to nothing and fading at its end;
//           no branch reaches the ground (each branch end stays above 25 % of the drop), only the main channel does.
//   LOOK    two additive screen-space ribbons on one geometry: a thin pure-white hot core (HDR, so the kit's bloom takes it) and a wide soft
//           blue-violet glow (gaussian across, width varies along the channel); brightest at the strike point; a hot flash sprite there.
//   TIMING  stepped leader (faint, crawling down in 2-6 frame steps, with its trial branches), return stroke (1 frame full), 2-4 restrikes
//           strobing bright / dim over ~0.3-0.6 s (dart leaders follow the main channel, branches stay dim), afterglow fade over 4-8 frames
//           while the core cools to the glow colour. All frame-exact on the film clock (update(t), t in seconds).
//   LIGHT   one shared flash rig per scene (a directional light from the bolt, a point light at the strike point, a hemisphere lift on the
//           return-stroke frame) lights ground, towers, metal; the cards are MeshBasic, so characters keep their look. The cloud the bolt
//           leaves from glows from inside (noise-shaped additive puffs that flicker per restrike), and if the clouds group offers
//           group.userData.flash(posVec3, strength, radius) (interface for ctx.sky.clouds) it is called every frame as well.
//   VARIANTS far: true (thin, behind haze, light only as a soft sky flash); path: [...points] (close: the channel runs from the cloud to
//           path[0] and then hugs the path, e.g. the spear tip and down the wire, as one bright line with the current running down it over
//           runFrames and a spark burst at every point in sparks: [...] as the head passes).
// Every division / sqrt / normalize in the shaders is guarded (max(..., 1e-4)); no pow. Cost: a few thousand vertices, 3 draw calls + sprites per bolt.

const hsh = (a, b) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;

const VS = `
uniform vec2 uRes; uniform float uMinPx, uWScale, uLead, uLeadOn, uRun, uMain, uBranch, uFrame, uSpark;
attribute vec3 prev, next, col; attribute float side, wid, tap, inten, arr, run, kind;
varying float vV, vI; varying vec3 vC;
void main(){
  mat4 pm = projectionMatrix * modelViewMatrix;
  vec4 c = pm * vec4(position, 1.), cp = pm * vec4(prev, 1.), cn = pm * vec4(next, 1.);
  float w = max(c.w, 1e-4);
  vec2 sp = cp.xy / max(cp.w, 1e-4) * uRes, sn = cn.xy / max(cn.w, 1e-4) * uRes, d = sn - sp; float dl = length(d);
  d = dl > 1e-4 ? d / dl : vec2(1., 0.); vec2 nrm = vec2(-d.y, d.x);
  float px = wid * uWScale * projectionMatrix[1][1] * uRes.y * .5 / w;          // world width in pixels
  px = max(px, uMinPx) * tap;                                                    // never thinner than uMinPx, tapers to 0 at branch tips
  float b;
  if (uSpark > .5) b = inten;
  else {
    float reached = step(arr, uLead);
    float front = uLead - arr, head = exp(-front * front * 900.) * step(0., front);
    float lead = uLeadOn * reached * (.16 + 1.1 * head);
    float stroke = (kind < .5 ? uMain : uBranch) * reached;
    if (run >= 0.) { float rr = uRun - run; stroke *= step(0., rr); stroke += step(0., rr) * exp(-rr * rr * 160.) * 1.6 * step(uRun, 1.04) * step(.001, uMain + uBranch); }
    float fl = .82 + .36 * fract(sin(dot(position.xy + uFrame, vec2(12.9898, 78.233))) * 43758.5453);   // per-frame shimmer along the channel
    b = inten * max(stroke, lead) * fl;
  }
  vI = b; vV = side; vC = col;
  if (b < 1e-3) px = 0.;
  c.xy += nrm * side * px / uRes * w;                                            // px -> clip space (half width each side)
  gl_Position = c;
}`;
const FS_CORE = `
uniform vec3 uCore, uGlowC, uHazeC; uniform float uHot, uHaze, uSpark; varying float vV, vI; varying vec3 vC;
void main(){
  float a = clamp(1. - abs(vV), 0., 1.); a = a * a * (3. - 2. * a);
  float cool = clamp(1. - vI, 0., 1.);                                           // a dim channel cools from white to the glow colour
  vec3 c = uSpark > .5 ? vC : mix(uCore, uGlowC * 1.4, cool * .7);
  c = mix(c, uHazeC, uHaze) * vI * uHot * a * (1. - uHaze * .55);
  gl_FragColor = vec4(c, 1.);
}`;
const FS_GLOW = `
uniform vec3 uGlowC, uHazeC; uniform float uHot, uHaze; varying float vV, vI; varying vec3 vC;
void main(){
  float v = abs(vV), g = exp(-v * v * 4.) * clamp(1. - v, 0., 1.);
  vec3 c = mix(uGlowC, uHazeC, uHaze) * vI * uHot * g * (1. - uHaze * .4);
  gl_FragColor = vec4(c, 1.);
}`;

export function makeFx(THREE, scene, L, tick) {
  const bolts = [], V3 = (p, plan) => p && p.isVector3 ? p.clone() : plan ? new THREE.Vector3(p[0], p[2], -p[1]) : new THREE.Vector3(p[0], p[1], p[2]);
  let rig = null, tex = null;
  const res = new THREE.Vector2(1080, 1920);

  function textures() {
    if (tex) return tex; const mk = (fn, N = 128) => { const cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'), im = g.createImageData(N, N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = fn((x + .5) / N * 2 - 1, (y + .5) / N * 2 - 1), i = (y * N + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = 255 * clamp(v); }
      g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), a = hsh(xi + s, yi), b = hsh(xi + 1 + s, yi), c = hsh(xi + s, yi + 1), d = hsh(xi + 1 + s, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    const fbm = (x, y, s) => vn(x * 3, y * 3, s) * .5 + vn(x * 6, y * 6, s + 9) * .3 + vn(x * 12, y * 12, s + 21) * .2;
    tex = {
      hot: mk((x, y) => { const r = Math.hypot(x, y); return Math.exp(-r * r * 30) + .45 * Math.exp(-r * r * 6) + .18 * Math.exp(-r * r * 1.6) - .02; }),          // strike flash: hot pin + soft halo
      puff: [0, 1, 2].map(s => mk((x, y) => { const r = Math.hypot(x, y * 1.5); return clamp(1 - r) ** 1.6 * (.25 + 1.1 * fbm(x, y, s * 31)) - .08; })),   // lit cloud billow (flat-bottomed, noisy)
    }; return tex; }

  function getRig() {                                                            // ONE flash rig per scene, driven by the brightest bolt of the frame
    if (rig) return rig;
    const dir = new THREE.DirectionalLight('#d4dcff', 0); dir.name = 'fx_bolt_flash_dir'; scene.add(dir, dir.target);
    const pt = new THREE.PointLight('#e2e8ff', 0, 60, 2); pt.name = 'fx_bolt_flash_point'; scene.add(pt);
    const hemi = new THREE.HemisphereLight('#b8c6ff', '#2a2440', 0); hemi.name = 'fx_bolt_lift'; scene.add(hemi);
    for (const l of [dir, pt, hemi]) l.userData.noExport = true;
    rig = { dir, pt, hemi, t: null }; tick.unshift(t => drive(t)); return rig; }
  function drive(t) {                                                            // all bolts first, then the rig from the strongest
    let best = null, bl = 0, lift = 0;
    for (const b of bolts) { b.update(t); if (b.state.light > bl) { bl = b.state.light; best = b; } lift = Math.max(lift, b.state.lift); }
    const R = rig; if (!best || bl < 1e-3) { R.dir.intensity = R.pt.intensity = R.hemi.intensity = 0; return; }
    const o = best.o; R.dir.position.copy(best.end).addScaledVector(best.toSky, 60); R.dir.target.position.copy(best.end); R.dir.target.updateMatrixWorld();
    R.dir.intensity = bl * o.light; R.dir.color.set(o.lightColor);
    R.pt.position.copy(best.end).add(new THREE.Vector3(0, o.pointUp, 0)); R.pt.intensity = best.hit ? bl * o.point : 0; R.pt.distance = o.reach; R.pt.color.set(o.lightColor);
    R.hemi.intensity = lift * o.lift; }

  // ---- fractal channel: midpoint displacement, amplitude x ratio per level, perpendicular to the segment ----
  function fractal(A, B, R, rough, minSeg, ratio = .52) {
    let pts = [A.clone(), B.clone()], amp = A.distanceTo(B) * rough, guard = 0; const tmp = new THREE.Vector3(), r = new THREE.Vector3();
    while (guard++ < 12) { let longest = 0; for (let i = 0; i < pts.length - 1; i++) longest = Math.max(longest, pts[i].distanceTo(pts[i + 1])); if (longest <= minSeg) break;
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], d = tmp.subVectors(b, a), len = Math.max(d.length(), 1e-6); d.multiplyScalar(1 / len);
        r.set(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1); r.addScaledVector(d, -r.dot(d)); if (r.lengthSq() < 1e-8) r.set(1, 0, 0); r.normalize();
        const g = (R() + R() + R() - 1.5) * 1.15, m = a.clone().lerp(b, .38 + .24 * R()).addScaledVector(r, amp * g * Math.min(1, len / Math.max(amp * 2.2, 1e-6) + .35));
        out.push(m, b); }
      pts = out; amp *= ratio; }
    return pts; }
  const lenOf = P => { let s = 0; for (let i = 1; i < P.length; i++) s += P[i].distanceTo(P[i - 1]); return s; };

  function bolt(opts = {}) {
    const far = !!opts.far;
    const o = {
      seed: 7, width: far ? .35 : .22, branches: far ? 6 : 8, levels: far ? 2 : 3, rough: .13, seg: far ? .9 : .28, fps: 30,
      leader: 4, restrikes: null, duration: 1, after: 6, runFrames: 0, at: 0,
      core: '#ffffff', glow: far ? '#8c8cff' : '#9a8cff', haze: far ? .3 : 0, hazeColor: '#5a6aa8', hot: far ? 4 : 5,
      glowWidth: far ? 7 : 9, coreMinPx: far ? 1.6 : 1.8, glowMinPx: far ? 9 : 12,
      light: far ? .9 : 3.2, point: far ? 0 : 140, reach: 45, pointUp: .4, lift: far ? .12 : .55, lightColor: '#d6deff',
      cloudR: null, cloudGlow: true, cloudColor: far ? '#7e7cc8' : '#a8a4f0', flashSize: far ? 0 : 1.8, sparks: [], sparkN: 16, sparkColor: '#fff2c8', groundY: 0,
      ...opts };
    o.fps = o.fps || 30;
    const R = rng(o.seed * 7919 + 13), plan = !!o.plan, A = V3(o.from || [0, 80, 0], plan);
    const path = (o.path || []).map(p => V3(p, plan));
    let hit = !!(o.to || path.length), B = path.length ? path[0].clone() : o.to ? V3(o.to, plan) : A.clone().add(V3(o.dir || [0, -1, 0]).normalize().multiplyScalar(o.length || 40));
    const drop = Math.max(1, A.y - B.y), mainPts = fractal(A, B, R, o.rough, o.seg);
    // path part (close variant): hug the given points with a tiny jitter, ~0.12 m steps
    const pathPts = []; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1], n = Math.max(1, Math.ceil(a.distanceTo(b) / .12));
      for (let k = 1; k <= n; k++) { const p = a.clone().lerp(b, k / n); if (k < n) p.add(new THREE.Vector3((R() - .5), (R() - .5), (R() - .5)).multiplyScalar(o.pathJit ?? .025)); pathPts.push(p); } }
    const lines = [];                                                             // {pts, w0, w1, tap0, tap1, i0, i1, arr[], run[], kind}
    const Lm = lenOf(mainPts), Lp = lenOf([B, ...pathPts]);
    { const arr = [], run = []; let s = 0; mainPts.forEach((p, i) => { if (i) s += p.distanceTo(mainPts[i - 1]); arr.push(s / Lm * .999); run.push(-1); });
      let sp = 0; pathPts.forEach((p, i) => { sp += p.distanceTo(i ? pathPts[i - 1] : B); arr.push(.999); run.push(sp / Math.max(Lp, 1e-4)); });
      lines.push({ pts: [...mainPts, ...pathPts], w: i => 1, tap: (u) => hit ? 1 : clamp((1 - u) / .2), inten: u => .78 + .5 * u, arr, run, kind: 0 }); }
    // branches: leave the upper 80 % of the main channel, angle 22-60 degrees off it, fork again, never reach the ground
    const floorY = B.y + drop * .25, tan = new THREE.Vector3(), side = new THREE.Vector3();
    const grow = (P, arrP, lvl, wP, nB, uMax) => {
      for (let k = 0; k < nB; k++) {
        const u = lvl === 0 ? .04 + .76 * Math.pow(R(), 1.25) : .12 + .6 * R(), i = Math.min(P.length - 2, Math.floor(u * (P.length - 1))), S = P[i];
        tan.subVectors(P[Math.min(P.length - 1, i + 6)], P[Math.max(0, i - 6)]).normalize();
        side.set(R() * 2 - 1, (R() - .5) * .4, R() * 2 - 1); side.addScaledVector(tan, -side.dot(tan)); if (side.lengthSq() < 1e-6) side.set(1, 0, 0); side.normalize();
        const ang = (22 + 38 * R()) * Math.PI / 180, dir = tan.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).normalize();
        let len = (lvl === 0 ? Lm * (.1 + .24 * R()) * (1 - u * .45) : lenOf(P) * (.25 + .3 * R())) * (far ? 1.1 : 1);
        let E = S.clone().addScaledVector(dir, len); if (E.y < floorY) { const k2 = (S.y - floorY) / Math.max(S.y - E.y, 1e-4); if (k2 < .2) continue; len *= k2; E = S.clone().addScaledVector(dir, len); }
        const Q = fractal(S, E, R, o.rough * 1.15, o.seg * (lvl ? .8 : 1)), Lq = lenOf(Q), arr = [], run = []; let s = 0;
        Q.forEach((p, j) => { if (j) s += p.distanceTo(Q[j - 1]); arr.push(arrP[i] + s / Lm); run.push(-1); });
        const wq = wP * (lvl === 0 ? .5 : .55);
        lines.push({ pts: Q, w: v => wq * (1 - .55 * v), tap: v => clamp((1 - v) / .55), inten: v => (lvl === 0 ? .8 : .6) * (1 - .75 * v), arr, run, kind: 1 + lvl });
        if (lvl + 1 < o.levels) grow(Q, arr, lvl + 1, wq, lvl === 0 ? 1 + (R() < .6 ? 1 : 0) : (R() < .55 ? 1 : 0)); } };
    grow(mainPts, lines[0].arr, 0, 1, Math.round(clamp(o.branches, 0, 12)));

    // ---- one ribbon geometry for all lines (2 vertices per point, the vertex shader turns them to the lens) ----
    let nV = 0; for (const l of lines) nV += l.pts.length * 2;
    const F = n => new Float32Array(nV * n), pos = F(3), prv = F(3), nxt = F(3), col = F(3), sd = F(1), wd = F(1), tp = F(1), it = F(1), ar = F(1), rn = F(1), kd = F(1), idx = [];
    let v = 0;
    for (const l of lines) { const n = l.pts.length, base = v, Ll = lenOf(l.pts); let s = 0;
      for (let i = 0; i < n; i++) { if (i) s += l.pts[i].distanceTo(l.pts[i - 1]); const u = s / Math.max(Ll, 1e-4), p = l.pts[i], a = l.pts[Math.max(0, i - 1)], b = l.pts[Math.min(n - 1, i + 1)];
        const wv = o.width * l.w(u) * (.72 + .56 * hsh(o.seed * 131 + i, l.kind * 17 + n)) * (l.kind === 0 && hit ? .9 + .35 * u : 1);   // width varies along the channel, swells toward the strike
        for (const sgn of [-1, 1]) { pos.set([p.x, p.y, p.z], v * 3); prv.set([a.x, a.y, a.z], v * 3); nxt.set([b.x, b.y, b.z], v * 3); col.set([1, 1, 1], v * 3); sd[v] = sgn; wd[v] = wv; tp[v] = l.tap(u); it[v] = l.inten(u); ar[v] = l.arr[i]; rn[v] = l.run[i]; kd[v] = l.kind; v++; }
        if (i < n - 1) { const q = base + i * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); } } }
    const geo = new THREE.BufferGeometry(), at = (k, a, s) => geo.setAttribute(k, new THREE.BufferAttribute(a, s));
    at('position', pos, 3); at('prev', prv, 3); at('next', nxt, 3); at('col', col, 3); at('side', sd, 1); at('wid', wd, 1); at('tap', tp, 1); at('inten', it, 1); at('arr', ar, 1); at('run', rn, 1); at('kind', kd, 1); geo.setIndex(idx);
    const U = () => ({ uRes: { value: res }, uMinPx: { value: 1 }, uWScale: { value: 1 }, uLead: { value: 0 }, uLeadOn: { value: 0 }, uRun: { value: 0 }, uMain: { value: 0 }, uBranch: { value: 0 }, uFrame: { value: 0 }, uSpark: { value: 0 },
      uCore: { value: new THREE.Color(o.core) }, uGlowC: { value: new THREE.Color(o.glow) }, uHazeC: { value: new THREE.Color(o.hazeColor) }, uHot: { value: o.hot }, uHaze: { value: o.haze } });
    const matOf = (fs, wScale, minPx, ro) => { const m = new THREE.ShaderMaterial({ uniforms: U(), vertexShader: VS, fragmentShader: fs, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide });
      m.uniforms.uWScale.value = wScale; m.uniforms.uMinPx.value = minPx; const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; mesh.renderOrder = ro; mesh.userData.noExport = true; return mesh; };
    const g = new THREE.Group(); g.name = 'fx_bolt_' + o.seed + (far ? '_far' : ''); g.userData.noExport = true;
    const glowMesh = matOf(FS_GLOW, o.glowWidth, o.glowMinPx, 30), coreMesh = matOf(FS_CORE, 1, o.coreMinPx, 31); glowMesh.name = 'fx_bolt_glow'; coreMesh.name = 'fx_bolt_core'; g.add(glowMesh, coreMesh);
    const mats = [glowMesh.material, coreMesh.material]; glowMesh.material.uniforms.uHot.value = o.hot * (o.glowK ?? .32);
    coreMesh.onBeforeRender = r => r.getDrawingBufferSize(res);                    // the screen-space width needs the real render size
    // strike flash sprite (hot pin + halo) and a wide blue halo
    const T = textures(), spr = (map, c, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false })); m.scale.setScalar(s); m.userData.noExport = true; m.renderOrder = 32; g.add(m); return m; };
    const flash = hit && o.flashSize ? spr(T.hot, '#ffffff', o.flashSize) : null, halo = hit && o.flashSize ? spr(T.hot, o.glow, o.flashSize * 2) : null;
    if (flash) { flash.position.copy(B); halo.position.copy(B); }
    // cloud glow from inside: 6-9 noisy billows around the start, spread along the cloud base, each lit by its own restrikes
    const cloudR = o.cloudR ?? Math.max(6, drop * (far ? .35 : .28)), puffs = [];
    if (o.cloudGlow) { const nP = far ? 6 : 9; for (let k = 0; k < nP; k++) { const a = R() * 6.283, r = cloudR * Math.sqrt(R()) * .8, p = A.clone().add(new THREE.Vector3(Math.cos(a) * r, (R() - .3) * cloudR * .18, Math.sin(a) * r * .6));
      const s = spr(T.puff[k % 3], o.cloudColor, cloudR * (.55 + .6 * R())); s.material.rotation = R() * 6.283; s.position.copy(p); s.renderOrder = 29; s.scale.y *= .55; puffs.push({ s, ph: R(), k: .6 + .4 * R(), d: p.distanceTo(A) / cloudR }); } }
    // sparks at the strike point and every given point (staples): ballistic with drag, bounce on groundY, temperature colour, velocity streaks
    const emit = [], sparkPts = (o.sparks || []).map(p => V3(p, plan)); if (hit && o.sparkN && !far) emit.push({ p: B.clone(), run: 0, n: Math.round(o.sparkN * 1.5) });
    sparkPts.forEach(p => { let best = 0, bd = 1e9, s = 0, acc = 0; const P = [B, ...pathPts]; for (let i = 1; i < P.length; i++) { acc += P[i].distanceTo(P[i - 1]); const d = P[i].distanceTo(p); if (d < bd) { bd = d; best = acc; } } emit.push({ p, run: best / Math.max(Lp, 1e-4), n: o.sparkN }); });
    const sparks = []; for (const e of emit) for (let k = 0; k < e.n; k++) { const a = R() * 6.283, up = .15 + .85 * R(), sp = 2 + 6 * R() * R();
      sparks.push({ e, v: new THREE.Vector3(Math.cos(a) * Math.sqrt(1 - up * up), up, Math.sin(a) * Math.sqrt(1 - up * up)).multiplyScalar(sp), life: .3 + .6 * R(), rest: .3 + .2 * R(), burst: R() < .35 ? 1 : 0 }); }
    let sGeo = null, sMesh = null;
    if (sparks.length) { const n = sparks.length * 4; sGeo = new THREE.BufferGeometry(); const z = k => new Float32Array(n * k), si = [];
      for (let i = 0; i < sparks.length; i++) { const q = i * 4; si.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
      for (const [k, s] of [['position', 3], ['prev', 3], ['next', 3], ['col', 3], ['side', 1], ['wid', 1], ['tap', 1], ['inten', 1], ['arr', 1], ['run', 1], ['kind', 1]]) { const b = new THREE.BufferAttribute(z(s), s); b.setUsage(THREE.DynamicDrawUsage); sGeo.setAttribute(k, b); }
      const S = sGeo.attributes.side.array; for (let i = 0; i < n; i++) S[i] = i % 2 ? 1 : -1; sGeo.setIndex(si);
      const m = new THREE.ShaderMaterial({ uniforms: U(), vertexShader: VS, fragmentShader: FS_CORE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide });
      m.uniforms.uSpark.value = 1; m.uniforms.uMinPx.value = 2.4; m.uniforms.uHot.value = 4.5; sMesh = new THREE.Mesh(sGeo, m); sMesh.frustumCulled = false; sMesh.renderOrder = 33; sMesh.name = 'fx_bolt_sparks'; g.add(sMesh); }
    scene.add(g);

    // ---- the timing: frames relative to the return stroke (frame 0) ----
    const nR = o.restrikes ?? 2 + Math.floor(R() * 3), env = new Map(); env.set(0, 1); env.set(1, .4); let f = 1;
    const bright = [0]; const span = Math.round(.55 * o.fps * o.duration); for (let k = 0; k < nR; k++) { const gap = Math.max(1, Math.round((2 + Math.floor(R() * 3)) * o.duration)); if (f + gap + 1 > span) break; for (let j = 1; j < gap; j++) env.set(f + j, .1 + .1 * R()); f += gap; env.set(f, .62 + .33 * R()); bright.push(f); env.set(f + 1, .3 + .15 * R()); f += 1; }
    const lastF = f, after = Math.max(1, o.after), tStroke = o.frame != null ? o.frame / o.fps : o.at, lead = Math.max(0, o.leader | 0);
    const mainAt = fr => { if (fr < 0) return 0; const i = Math.floor(fr + 1e-4); if (env.has(i)) return env.get(i); if (i <= lastF + after) { const k = (i - lastF) / (after + 1); return .3 * (1 - k) * (1 - k); } return 0; };
    const toSky = A.clone().sub(B).normalize(), state = { light: 0, lift: 0, main: 0 };
    const sparkCol = new THREE.Color(), cHot = new THREE.Color(o.sparkColor), cMid = new THREE.Color('#ffb04a'), cCold = new THREE.Color('#b8361a');
    const api = { group: g, o, end: B, start: A, hit, toSky, state, main: mainPts, path: pathPts, restrikes: bright.slice(1), lines: lines.length, vertices: nV,
      timing: { leaderStart: tStroke - lead / o.fps, stroke: tStroke, restrikeFrames: bright.slice(1), afterglowEnd: tStroke + (lastF + after + 1) / o.fps, fps: o.fps },
      update };
    let lastT = null;
    function update(t) {
      if (t === lastT) return api; lastT = t;
      const fr = (t - tStroke) * o.fps, fi = Math.floor(fr + 1e-4), frame = Math.round(t * o.fps);
      let lead01 = 0, leadOn = 0, m = 0, br = 0, runU = 0;
      if (fr < 0 && fr >= -lead) { const step = Math.floor(fr + lead + 1e-4); leadOn = .55 + .45 * hsh(o.seed, step); lead01 = clamp((step + .55 + .3 * hsh(o.seed + 3, step)) / (lead + .4), 0, .97); }
      else if (fr >= 0) { m = mainAt(fr); lead01 = 10; br = fi === 0 ? .95 : fi === 1 ? .35 : m * (bright.includes(fi) ? .3 : .12); runU = o.runFrames > 0 ? clamp((fr + 1) / o.runFrames, 0, 1.2) : 1.2; }
      const active = leadOn > 0 || m > 0 || br > 0;
      for (const M of mats) { const u = M.uniforms; u.uLead.value = lead01; u.uLeadOn.value = leadOn; u.uMain.value = m; u.uBranch.value = br; u.uRun.value = runU; u.uFrame.value = frame % 97; }
      if (flash) { const k = fi === 0 ? 1.6 : m; flash.material.color.setScalar(4 * k); flash.scale.setScalar(o.flashSize * (.7 + .5 * k)); halo.material.color.set(o.glow).multiplyScalar(.35 * k); flash.visible = halo.visible = m > 0; }
      const lightK = leadOn ? .05 * leadOn : m; state.light = lightK; state.main = m; state.lift = fi === 0 ? 1 : 0;
      for (const P of puffs) { const kk = fr < 0 ? leadOn * .12 * (1 - P.d) : m * P.k * (fi === 0 ? 1 : .5 + .5 * hsh(Math.floor(P.ph * 99), fi)); P.s.material.color.set(o.cloudColor).multiplyScalar(1.5 * kk); P.s.visible = kk > .003; }
      const cf = o.clouds && o.clouds.userData && o.clouds.userData.flash; if (typeof cf === 'function') cf(A, lightK, cloudR);
      // sparks: simulate from emission to t (deterministic, so any frame renders alone)
      let alive = 0;
      if (sMesh) { const ps = sGeo.attributes.position.array, pv = sGeo.attributes.prev.array, nx = sGeo.attributes.next.array, cc = sGeo.attributes.col.array, wd = sGeo.attributes.wid.array, tp = sGeo.attributes.tap.array, it = sGeo.attributes.inten.array, dt = 1 / 240, kDrag = 2.2, gY = o.groundY;
        sparks.forEach((s, i) => { const tE = tStroke + (s.e.run * Math.max(o.runFrames, 0)) / o.fps + (s.burst ? (bright[1] ?? 3) / o.fps : 0), age = t - tE, q = i * 4; let a = 0;
          const p = s.e.p.clone(), vv = s.v.clone();
          if (age > 0 && age < s.life) { const nS = Math.floor(age / dt); for (let k = 0; k < nS; k++) { vv.y -= 9.8 * dt; vv.multiplyScalar(1 - kDrag * dt); p.addScaledVector(vv, dt); if (p.y < gY && vv.y < 0) { p.y = gY; vv.y *= -s.rest; vv.x *= .6; vv.z *= .6; } }
            const k = age / s.life; a = (1 - k) * (1 - k) * (s.burst ? .7 : 1); alive++;
            sparkCol.copy(cHot).lerp(cMid, clamp(k * 2)).lerp(cCold, clamp(k * 2 - 1)); }
          const tail = p.clone().addScaledVector(vv, -1 / 28);                       // streak = the last 1/40 s of travel, along the velocity (motion blur on a prop, allowed)
          for (let j = 0; j < 4; j++) { const head = j < 2, P = head ? p : tail; ps.set([P.x, P.y, P.z], (q + j) * 3); pv.set([tail.x, tail.y, tail.z], (q + j) * 3); nx.set([p.x, p.y, p.z], (q + j) * 3); cc.set([sparkCol.r, sparkCol.g, sparkCol.b], (q + j) * 3); wd[q + j] = .02; tp[q + j] = head ? 1 : .35; it[q + j] = a * 1.4; } });
        for (const k of ['position', 'prev', 'next', 'col', 'wid', 'tap', 'inten']) sGeo.attributes[k].needsUpdate = true; sMesh.visible = alive > 0; }
      g.visible = active || alive > 0;
      return api; }
    getRig(); bolts.push(api); return api; }

  function setSize(w, h) { res.set(w, h); }
  return { bolt, setSize, on: true, bolts };
}
