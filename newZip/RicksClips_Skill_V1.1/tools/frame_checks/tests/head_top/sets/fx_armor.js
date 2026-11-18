// EFFECTS for "Armor Where Nobody Shot". Owner: vfx-artist. Joined by sets/airfield.js (lead hook), once per place:
//   export async function buildFx(THREE, scene, film, ctx, world) -> { update(f, t, state), anchors }
//   world = { anchors, holes, hero, hangar, TIME, placeName, stateAt, val, B2T }
// Everything here is light, dust or sparks: soft instanced quads, light cones with soft edges, a few small real lights. No story props,
// nothing solid, nothing red (red is the pins' colour only). Every object carries userData.noExport = true.
// ONE VFX LANGUAGE (crew/vfx/FX_EVENTS.md, section 6): no lines, no stars, no discs with a hard edge; light is the scene's own light colour
// (gold sun #ffdcae by day, pink-gold at dawn, the lantern's amber #ffb347 at night); dust is the ground's colour, chalk is chalk white;
// each effect has a build, a pop on its frame and a settle, and is a pure function of the frame (any frame renders alone).
//
// TIMING. Each effect reads its own state key from the place's events (film.places.<place>.events, { f0, f1, obj, from, to }). Until the
// camera-director adds those events, each falls back to a key that already exists (see crew/vfx/FX_EVENTS.md):
//   beam_on 0..1 · beam_tick 0..1 · lantern_peek 0..1                  (inside)      default: on in `inside`; the tick sweeps before finger_ring
//   sun_spots 0..1                                                     (day, dawn)   default 1
//   hole_glow 0..1 · hole_src [x, y, z]                                (apron_night) default: the fx light_shaft word; the source leans to the nearest figure
//   pin_glint 0..1 · tail_pulse (pulse) · oval_glow 0..1               (hangar)      default: from `map` (pins as they go in, 3 = tail full, 4..5 = ovals)
//   chalk_dust [x, y, z] path (dust while f0..f1)                      (any)         default: chalk, finger_ring, armor_here, tally events at their anchors
//   chalk_slap, chalk_snap [x, y, z] (pulse)                           (any)         default: film.fx chalk_dust / chalk_snap word and pos
//   tire_dust · panel_dust · scale_hit · lid_dust · rivet_sparks · cowl_glint (pulses) default: patch, panel, needle, barrel_lid events, film.fx sparks / glint words
// A PULSE key pops on its event's f1 (f0..f1 is the wind-up); several events of one key = several pops.
// Kit facts this is built on (templates/threejs_film/film.js): the scene is rendered to a half-float target and tone-mapped after, bloom starts
// at luminance .95, cards are self-lit (scene lights do not touch them) and are masked by a pass that draws the world with an override
// material, so every object here empties its draw range in that pass (or it would cut a hole in the character mask).

const TAU = Math.PI * 2;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, v) => { const t = cl((v - a) / (b - a || 1e-6)); return t * t * (3 - 2 * t); };
const hsh = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(a[0], a[1], a[2]), mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const perp = d => nrm(cross(d, Math.abs(d[2]) < .9 ? [0, 0, 1] : [1, 0, 0]));          // any unit vector across d (plan axes)
const OVERLAYS = new Map();                                                              // card mesh -> its light overlay; the cards travel from place to place, so this is shared by every place's build

export async function buildFx(THREE, scene, film, ctx, world) {
  const { anchors, hero, TIME, placeName, val } = world, pl = ctx.place || {}, fps = film.fps || 30, V3 = THREE.Vector3;
  if (film.fx_armor === false || pl.fx_armor === false) return null;                     // film.json "fx_armor": false = the film without this module (for before / after sheets)
  const DAY = TIME === 'day', DAWN = TIME === 'dawn', NIGHT = TIME === 'night', DUSK = TIME === 'dusk';
  const INSIDE = /inside/.test(placeName), HANGAR = /hangar/.test(placeName), ROW = /row/.test(placeName), APRON = !INSIDE && !HANGAR && !ROW;
  const T3 = p => new V3(p[0], p[2], -p[1]), P3 = v => [v.x, -v.z, v.y];              // plan <-> three
  const lin = (hex, k = 1) => { const c = new THREE.Color(hex); return [c.r * k, c.g * k, c.b * k]; };
  const root = new THREE.Group(); root.name = 'fx_armor_' + placeName; root.userData.noExport = true; scene.add(root);
  scene.updateMatrixWorld(true);

  // ---------- colours: the scene's own light ----------
  const SUN = lin((ctx.light && ctx.light.sun) || (DAWN ? '#ffd4bc' : '#ffdcae')), GOLD = lin(DAWN ? '#ffc9a0' : '#ffcf8a'), AMBER = lin('#ffb347'), AMBER_DEEP = lin('#ff9a30');
  const DUST = lin(DAY ? '#ecd9b6' : DAWN ? '#f1d9c9' : '#a9b6de'), CHALK = lin(DAY ? '#f6f2e6' : DAWN ? '#f6ebe4' : '#cfd7f0'), DUSTK = DAY || DAWN ? .82 : .7;

  // ---------- time: words, takes, events ----------
  let words = []; try { const j = await (await fetch(new URL('../' + (typeof film.words === 'string' ? film.words : 'voice/words.json'), import.meta.url))).json(); words = (Array.isArray(j) ? j : j.words || []).map(w => ({ k: String(w.w ?? w.word ?? '').toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''), s: +(w.s ?? w.start ?? 0) })); } catch (e) { /* no voice yet: word defaults stay off */ }
  const W = at => { if (typeof at === 'number') return Math.round(at); if (!Array.isArray(at)) return null; const h = words.filter(w => w.k === String(at[0]).toLowerCase()); return h.length < (at[1] ?? 1) ? null : Math.round(h[(at[1] ?? 1) - 1].s * fps) + (at[2] ?? 0); };
  const ranges = []; { const tk = film.takes || []; tk.forEach((t, i) => { const a = W(t.stations && t.stations[0] && t.stations[0].at), nx = tk[i + 1], b = nx ? W(nx.stations && nx.stations[0] && nx.stations[0].at) : 1e9; if (t.place === placeName && a != null) ranges.push([a, (b ?? 1e9) - 1, t]); }); }
  const inPlace = f => !ranges.length || ranges.some(r => f >= r[0] && f <= r[1]), START = ranges.length ? ranges[0][0] : 0;
  const evs = (pl.events || []).slice().sort((a, b) => a.f0 - b.f0), evOf = k => evs.filter(e => e.obj === k), has = k => evs.some(e => e.obj === k);
  const fxOf = re => (film.fx || []).filter(e => re.test(e.kind || '')).map(e => ({ e, f: W(e.at) })).filter(o => o.f != null && inPlace(o.f));
  const A = (k, f = 0) => { const a = anchors[k]; if (!a) return null; const v = typeof a === 'function' ? a(f) : a; return Array.isArray(v) && typeof v[0] === 'number' ? v : null; };
  const crossUp = (k, thr, def) => { const l = evOf(k); if (!l.length) return null; let prev = val(k, l[0].f0 - 1, def); for (let f = l[0].f0; f <= l[l.length - 1].f1 + 1; f++) { const v = val(k, f, def); if (prev < thr && v >= thr) return f; prev = v; } return null; };
  const posOf = e => Array.isArray(e.to) ? e.to : Array.isArray(e.pos) ? e.pos : e.on ? A(e.on, 0) : null;
  // a pulse key: [{ f (the pop frame), w (wind-up frames), p (plan point or null), amp }]
  const pulses = (k, dflt) => has(k) ? evOf(k).map(e => ({ f: e.f1, w: Math.max(1, e.f1 - e.f0), p: Array.isArray(e.to) ? e.to : null, amp: typeof e.to === 'number' ? e.to || 1 : 1 })) : (dflt() || []).filter(o => o && o.f != null);

  // ---------- the pass that masks the characters draws the world with an override material: draw nothing there ----------
  const fxObj = (m, order, pre) => { m.userData.noExport = true; m.frustumCulled = false; m.castShadow = m.receiveShadow = false; m.renderOrder = order;
    m.onBeforeRender = (r, s, c, g) => { if (pre) pre(r, s, c); if (s.overrideMaterial) { g.userData._dr = [g.drawRange.start, g.drawRange.count]; g.setDrawRange(0, 0); } };
    m.onAfterRender = (r, s, c, g) => { if (g.userData._dr) { g.setDrawRange(g.userData._dr[0], g.userData._dr[1]); g.userData._dr = null; } }; return m; };

  // ---------- soft quads (instanced): camera-facing puffs and glows, flat pools and rings, velocity-aligned streaks ----------
  // premultiplied: colour.a = 0 adds light, 1 covers like dust. Shapes: 0 soft dot (core = flat middle; used small, for grains and glows), 1 ring, 2 tapered streak,
  // 3 WISP (round 3): a thin torn strand of dust or smoke on the streak's geometry (long axis = the way it drifts): its middle line wanders, noise breaks it up, and it thins out
  // and falls apart with age (sw = age 0..1, sx = seed). A wisp also fades, per pixel, wherever it would stand in front of a KEEP mark (the chalk ring, the patch, the number just made).
  const KEEP = [], _kv = new V3(), _k2 = new THREE.Vector2();                             // KEEP: this frame's marks that must stay readable, { p: plan point, r: metres }; at most 4
  const makeQuads = (cap, name, order, decal) => { const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const mk = (n, k) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(cap * k), k); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(n, a); return a; };
    const aP = mk('aP', 3), aU = mk('aU', 4), aV = mk('aV', 3), aC = mk('aC', 4), aS = mk('aS', 4);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      polygonOffset: !!decal, polygonOffsetFactor: -2, polygonOffsetUnits: -2, uniforms: { uNear: { value: new THREE.Vector2(decal ? .08 : INSIDE ? .1 : .3, decal ? .3 : INSIDE ? .42 : 1.1) }, uKeep: { value: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, 0)) }, uRes: { value: new V3(1, 1, 1) } },
      vertexShader: `attribute vec3 aP; attribute vec4 aU; attribute vec3 aV; attribute vec4 aC; attribute vec4 aS; varying vec2 vQ; varying vec4 vC; varying vec4 vS; varying float vNear; varying float vVz; uniform vec2 uNear;
        void main(){ vec3 wp;
          if (aU.w < .5) { vec3 rt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]); float c = cos(aU.z), s = sin(aU.z); vec2 q = vec2(position.x * c - position.y * s, position.x * s + position.y * c); wp = aP + rt * q.x * aU.x + up * q.y * aU.y; }
          else if (aU.w < 1.5) wp = aP + aU.xyz * position.x + aV * position.y;
          else { vec3 sd = cross(aU.xyz, cameraPosition - aP); float l = length(sd); sd = l > 1e-6 ? sd / l : vec3(0., 1., 0.); wp = aP + aU.xyz * position.x + sd * aV.x * position.y; }
          vec4 mv = viewMatrix * vec4(wp, 1.); vNear = smoothstep(uNear.x, uNear.y, -mv.z); vVz = -mv.z; vQ = position.xy; vC = aC; vS = aS; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec2 vQ; varying vec4 vC; varying vec4 vS; varying float vNear; varying float vVz; uniform vec4 uKeep[4]; uniform vec3 uRes;
        float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
        void main(){ float r = length(vQ), a;
          if (vS.y < .5) { a = vS.x > .001 ? pow(1. - smoothstep(vS.x, 1., r), 1.7) : exp(-r * r * 3.4) * (1. - smoothstep(.72, 1., r)); }
          else if (vS.y < 1.5) { float d = (r - vS.x) / max(vS.w, .001); a = exp(-d * d) * (1. - smoothstep(.86, 1., r)); }
          else if (vS.y < 2.5) { float ty = 1. - abs(vQ.y); a = ty * ty * smoothstep(-1., .55, vQ.x) * (1. - smoothstep(.72, 1., vQ.x)); }
          else { float sd = vS.x * 41.3, x = vQ.x, y = vQ.y, er = vS.w;
            float mid = (sin(x * 2.3 + sd) * .3 + sin(x * 5.3 + sd * 1.7) * .11) * (1. - .35 * abs(x));                                   // the strand's middle line wanders
            float n = vn(vec2(x * 2.4 + sd, y * 3.2 - sd * .7)) * .62 + vn(vec2(x * 6.1 - sd * 1.3, y * 7.4 + sd)) * .38;               // its density is uneven
            float body = exp(-pow((y - mid) / (.26 + .14 * n), 2.)), ends = 1. - smoothstep(.35, 1., abs(x));
            a = body * ends * smoothstep(.2 + .42 * er, .66 + .3 * er, n) * (1. - smoothstep(.78, 1., abs(y)));                         // with age it thins and breaks up
            vec2 nd = gl_FragCoord.xy / uRes.xy * 2. - 1.;
            for (int i = 0; i < 4; i++) { if (uKeep[i].z > 0. && vVz < uKeep[i].w + .3) { float d = length((nd - uKeep[i].xy) * vec2(uRes.z, 1.)); a *= smoothstep(uKeep[i].z * .85, uKeep[i].z * 1.35, d); } } }
          a *= vS.z * vNear; if (a < .002) discard; gl_FragColor = vec4(vC.rgb * a, clamp(a * vC.a, 0., 1.)); }` });
    const pre = (r, s, c) => { const u = mat.uniforms, rt = r.getRenderTarget(); if (rt) _k2.set(rt.width, rt.height); else r.getDrawingBufferSize(_k2); u.uRes.value.set(_k2.x, _k2.y, _k2.x / Math.max(1, _k2.y)); const pe = c.projectionMatrix.elements;
      for (let i = 0; i < 4; i++) { const k = KEEP[i], q = u.uKeep.value[i]; if (!k) { q.set(0, 0, 0, 0); continue; } _kv.set(k.p[0], k.p[2], -k.p[1]).applyMatrix4(c.matrixWorldInverse); const dz = -_kv.z; if (dz < .05) q.set(0, 0, 0, 0); else q.set(_kv.x * pe[0] / dz, _kv.y * pe[5] / dz, k.r * pe[5] / dz, dz); } };
    const m = fxObj(new THREE.Mesh(g, mat), order, decal ? null : pre); m.name = name; root.add(m); let n = 0;
    const put = (p, ux, uy, uz, uw, vx, vy, vz, col, I, k, shape, sx, sw) => { if (n >= cap || !(I > .002)) return; aP.setXYZ(n, p[0], p[2], -p[1]); aU.setXYZW(n, ux, uy, uz, uw); aV.setXYZ(n, vx, vy, vz); aC.setXYZW(n, col[0], col[1], col[2], k); aS.setXYZW(n, sx, shape, I, sw); n++; };
    return { mesh: m, begin() { n = 0; }, end() { g.instanceCount = n; for (const a of [aP, aU, aV, aC, aS]) a.needsUpdate = true; }, count: () => n,
      cam: (p, w, h, col, I, k = 0, rot = 0, core = 0) => put(p, w, h, rot, 0, 0, 0, 0, col, I, k, 0, core, 0),
      flat: (p, U, V, col, I, k = 0, core = 0) => put(p, U[0], U[2], -U[1], 1, V[0], V[2], -V[1], col, I, k, 0, core, 0),
      ring: (p, U, V, col, I, k, rad, wid) => put(p, U[0], U[2], -U[1], 1, V[0], V[2], -V[1], col, I, k, 1, rad, wid),
      streak: (p, ax, hw, col, I, k = 0) => put(p, ax[0], ax[2], -ax[1], 2, hw, 0, 0, col, I, k, 2, 0, 0),
      wisp: (p, ax, hw, col, I, k, seed, er) => put(p, ax[0], ax[2], -ax[1], 2, hw, 0, 0, col, I, k, 3, seed, er),
      fwisp: (p, U, V, col, I, k, seed, er) => put(p, U[0], U[2], -U[1], 1, V[0], V[2], -V[1], col, I, k, 3, seed, er) }; };   // the same strand lying on a surface (U = long axis, V = across)

  // ---------- light cones (instanced open cylinders): bright where you look along the light, gone at the edge, fading down the length and near the lens ----------
  const makeCones = (cap, name, order) => { const base = new THREE.CylinderGeometry(1, 1, 1, 24, 8, true); base.translate(0, .5, 0); const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.setAttribute('position', base.attributes.position);
    const mk = (n, k) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(cap * k), k); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(n, a); return a; };
    const aA = mk('aA', 3), aB = mk('aB', 3), aR = mk('aR', 2), aK = mk('aK', 4);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, uniforms: { uNear: { value: new THREE.Vector2(INSIDE ? .4 : NIGHT ? .15 : .7, INSIDE ? 1.5 : NIGHT ? .8 : 2.4) }, uSide: { value: INSIDE ? 1.5 : 1 } },   // uSide: inside the body a thin beam seen from its side would be lost on the lit wall behind it, so it is lifted there (seen down its length it keeps its level)
      vertexShader: `attribute vec3 aA; attribute vec3 aB; attribute vec2 aR; attribute vec4 aK; varying vec3 vN; varying vec3 vW; varying float vY; varying vec4 vK; varying vec3 vAx;
        void main(){ vec3 ax = aB - aA; float L = max(length(ax), 1e-4); vec3 d = ax / L; vAx = d; vec3 h = abs(d.y) < .95 ? vec3(0., 1., 0.) : vec3(1., 0., 0.), u = normalize(cross(d, h)), v = cross(d, u);
          vec3 rad = u * position.x + v * position.z; vW = aA + ax * position.y + rad * mix(aR.x, aR.y, position.y); vN = normalize(rad + d * (aR.x - aR.y) / L); vY = position.y; vK = aK; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.); }`,
      fragmentShader: `varying vec3 vN; varying vec3 vW; varying float vY; varying vec4 vK; varying vec3 vAx; uniform vec2 uNear; uniform float uSide;
        void main(){ vec3 V = cameraPosition - vW; float dist = length(V), f = abs(dot(normalize(vN), V / max(dist, 1e-4)));
          float sa = length(cross(normalize(vAx), V / max(dist, 1e-4)));                                                             // 1 = the beam is seen from its side, 0 = down its length
          float a = pow(f, 3.) * pow(1. - vY, vK.a) * smoothstep(0., .05, vY) * smoothstep(uNear.x, uNear.y, dist) * mix(1., uSide, smoothstep(.12, .75, sa)); if (a < .002) discard; gl_FragColor = vec4(vK.rgb * a, 0.); }` });
    const m = fxObj(new THREE.Mesh(g, mat), order); m.name = name; root.add(m); let n = 0;
    return { mesh: m, begin() { n = 0; }, end() { g.instanceCount = n; for (const a of [aA, aB, aR, aK]) a.needsUpdate = true; },
      put(a, b, r0, r1, col, I, fade = 1) { if (n >= cap || !(I > .002)) return; aA.setXYZ(n, a[0], a[2], -a[1]); aB.setXYZ(n, b[0], b[2], -b[1]); aR.setXY(n, r0, r1); aK.setXYZW(n, col[0] * I, col[1] * I, col[2] * I, fade); n++; } }; };

  const QD = makeQuads(900, 'fx_pools', 10, true), CN = makeCones(640, 'fx_light_cones', 11), QP = makeQuads(6000, 'fx_particles', 12, false);

  // ---------- light ON the figures. Cards are self-lit, so each card gets a thin overlay with its own drawing as the mask:
  // result = card x (1 + light x (gain - 1)): cloth gets brighter and warmer, a white face takes the light's colour. ----------
  const NS = 8, overlays = OVERLAYS, OVG = DARK_GAIN();
  function DARK_GAIN() { return NIGHT || DUSK ? [1.9, .93, .5] : DAWN ? [1.5, 1.22, .86] : [1.5, 1.3, .84]; }
  const overlayFor = card => { let o = overlays.get(card); if (o) return o; const g = card.geometry.clone();
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.SrcColorFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
      uniforms: { map: { value: null }, uSize: { value: new THREE.Vector2(1, 1) }, uGain: { value: new V3(...OVG) }, uSpot: { value: Array.from({ length: NS }, () => new THREE.Vector4()) }, uDir: { value: Array.from({ length: NS }, () => new THREE.Vector4()) },
        uConeS: { value: new V3() }, uConeD: { value: new V3(0, -1, 0) }, uCone: { value: new THREE.Vector4(0, 0, 0, 0) } },
      vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform sampler2D map; uniform vec2 uSize; uniform vec3 uGain; uniform vec4 uSpot[${NS}]; uniform vec4 uDir[${NS}]; uniform vec3 uConeS; uniform vec3 uConeD; uniform vec4 uCone; varying vec2 vUv; varying vec3 vW;
        void main(){ if (texture2D(map, vUv).a < .5) discard; float L = 0.;
          for (int i = 0; i < ${NS}; i++) { if (uDir[i].z <= 0.) continue; vec2 q = (vUv - uSpot[i].xy) * uSize, dr = uDir[i].xy; float a = dot(q, dr) / uSpot[i].z, b = dot(q, vec2(-dr.y, dr.x)) / uSpot[i].w; L += uDir[i].z * pow(1. - smoothstep(.45, 1., sqrt(a * a + b * b)), 1.5); }
          if (uCone.w > 0.) { vec3 w = vW - uConeS; float h = dot(w, uConeD); if (h > 0.) { float k = length(w - uConeD * h) / max(h * uCone.x, 1e-4); L += uCone.w * (pow(1. - smoothstep(.5, 1.05, k), 1.4) + uCone.y * exp(-k * k / (uCone.z * uCone.z))) / (1. + h * h * .12); } }
          L = min(L, 1.15); if (L < .004) discard; gl_FragColor = vec4(.5 * (1. + L * (uGain - 1.)), .5); }` });
    const m = fxObj(new THREE.Mesh(g, mat), 5); m.name = 'fx_card_light'; m.position.z = .004; card.add(m); card.geometry.computeBoundingBox(); o = { m, mat, bb: card.geometry.boundingBox, inv: new THREE.Matrix4() }; overlays.set(card, o); return o; };
  const findCards = () => { const out = []; for (const o of scene.children) if (o.isMesh && o.visible && o.customDepthMaterial && o.material && o.material.isMeshBasicMaterial && o.material.map) out.push(o); return out; };
  // rays = [{ o, d, r, I }] (plan; thin parallel beams); cone = { S, d, tan, spill, spillW, I } or null. Returns for each ray the distance at which a body stops it (or Infinity).
  const lightCards = (rays, cone) => { const cards = findCards(), stop = rays.map(() => Infinity);
    for (const card of cards) { const o = overlayFor(card), u = o.mat.uniforms; card.updateMatrix(); card.updateMatrixWorld(true); o.inv.copy(card.matrixWorld).invert(); u.map.value = card.material.map; u.uSize.value.set(card.scale.x, card.scale.y); u.uGain.value.set(OVG[0], OVG[1], OVG[2]);
      const nrmW = new V3().setFromMatrixColumn(card.matrixWorld, 2).normalize(), c0 = new V3().setFromMatrixPosition(card.matrixWorld), bb = o.bb; let k = 0;
      for (let i = 0; i < NS; i++) u.uDir.value[i].z = 0;
      rays.forEach((ry, i) => { if (k >= NS) return; const O = T3(ry.o), D = T3(ry.d), dn = D.dot(nrmW); if (Math.abs(dn) < .05) return; const tt = c0.clone().sub(O).dot(nrmW) / dn; if (tt < .05 || tt > ry.max) return;
        const hit = O.clone().addScaledVector(D, tt), lp = hit.clone().applyMatrix4(o.inv); if (lp.x < bb.min.x || lp.x > bb.max.x || lp.y < bb.min.y || lp.y > bb.max.y) return;
        const dl = D.clone().transformDirection(o.inv), d2 = new THREE.Vector2(dl.x * card.scale.x, dl.y * card.scale.y), l2 = d2.length(); if (l2 > 1e-4) d2.divideScalar(l2); else d2.set(1, 0);
        u.uSpot.value[k].set((lp.x - bb.min.x) / (bb.max.x - bb.min.x), (lp.y - bb.min.y) / (bb.max.y - bb.min.y), Math.min(ry.r / Math.abs(dn), ry.r * 1.5), ry.r); u.uDir.value[k].set(d2.x, d2.y, ry.I, 0); k++;
        if (Math.abs(lp.x) < .17 * (bb.max.x - bb.min.x) && tt < stop[i]) stop[i] = tt; });
      if (cone && cone.I > .003) { u.uConeS.value.copy(T3(cone.S)); u.uConeD.value.copy(T3(cone.d)).normalize(); u.uCone.value.set(cone.tan, cone.spill, cone.spillW, cone.I); } else u.uCone.value.w = 0;
      o.m.visible = k > 0 || u.uCone.value.w > 0; }
    return { stop, cards }; };

  const frontOf = p => { let out = p; for (const c of findCards()) { c.updateMatrix(); c.updateMatrixWorld(true); const n = new V3().setFromMatrixColumn(c.matrixWorld, 2).normalize(), c0 = new V3().setFromMatrixPosition(c.matrixWorld), P = T3(p), d = P.clone().sub(c0).dot(n); if (d < .14 && d > -.5 && Math.hypot(P.x - c0.x, P.z - c0.z) < .8) out = P3(P.addScaledVector(n, .14 - d)); } return out; };

  // ---------- small real lights (always in the scene so the light count never changes; 0 = off) ----------
  const pointLight = (name, col, dist, decay) => { const l = new THREE.PointLight(col, 0, dist, decay); l.name = name; l.castShadow = false; l.userData.noExport = true; root.add(l); return l; };

  // ---------- geometry read from the scene at build time (nothing is hard-coded: the bomber is being rebuilt) ----------
  const hg = hero && hero.group, holesL = (hero && hero.anchors && hero.anchors.holes) || [], holes = (world.holes || []).slice();
  let hd = hero && hero.holder ? hero.holder.rotation.y : Math.atan2(-.91, -.42);
  { let a = -1, b = -1, best = 0; for (let i = 0; i < Math.min(holes.length, holesL.length); i += 7) for (let j = i + 3; j < Math.min(holes.length, holesL.length); j += 11) { const dl = Math.hypot(holesL[j].p[0] - holesL[i].p[0], holesL[j].p[1] - holesL[i].p[1]); if (dl > best) { best = dl; a = i; b = j; } }
    if (a >= 0 && best > 1) hd = Math.atan2(holes[b].p[1] - holes[a].p[1], holes[b].p[0] - holes[a].p[0]) - Math.atan2(holesL[b].p[1] - holesL[a].p[1], holesL[b].p[0] - holesL[a].p[0]); }
  const cH = Math.cos(hd), sH = Math.sin(hd), rotN = n => [n[0] * cH - n[1] * sH, n[0] * sH + n[1] * cH, n[2]];
  const HOLES = holes.map((h, i) => { const nl = holesL[i] && holesL[i].n, same = nl && h.n && Math.abs(nl[0] - h.n[0]) + Math.abs(nl[1] - h.n[1]) < 1e-6; return { ...h, n: nrm(h.n ? (same ? rotN(h.n) : h.n) : [0, 0, 1]) }; });   // airfield.js turns p into world points but leaves n local
  if (film.s2_dump && /inside/.test(placeName)) console.warn('S2HOLES ' + JSON.stringify(HOLES.filter(h => /^fus/.test(h.surf || 'fus')).map(h => ({ p: h.p.map(v => +v.toFixed(3)), n: h.n.map(v => +v.toFixed(2)), r: +(h.r || 0).toFixed(3), tag: h.tag || '', kind: h.kind || h.type || '' }))));   // S2 2026-11-14: film.json "s2_dump": true lists the body's holes (builder's tool, off without the key)
  const NOSE = [cH, sH, 0], LEFT = [-sH, cH, 0];
  const SUNDIR = (() => { const d = (ctx.light && ctx.light.dir) || [-8, 4.6, 4.5]; return nrm([-d[0], d[2], -d[1]]); })();   // the way the sunlight TRAVELS, plan axes
  const solids = []; if (hg) hg.traverse(o => { if (o.isMesh && !o.isInstancedMesh && !o.userData.shadowOnly && !o.userData.noExport && o.material && !o.material.transparent) solids.push(o); });
  const rc = new THREE.Raycaster();
  const castRay = (o, d, far, list = solids, minD = .05) => { rc.set(T3(o), T3(d).normalize()); rc.near = minD; rc.far = far; const h = rc.intersectObjects(list, false)[0]; if (!h) return null; const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null; return { t: h.distance, p: P3(h.point), n: n ? P3(n) : null, name: h.object.name }; };

  const updaters = [], outAnchors = {}, log = [];

  // =====================================================================================================================
  // 1. INSIDE THE BOMBER: one soft gold beam per hole, dust turning in it, a warm patch where it lands, and the blink that sweeps along the holes
  // =====================================================================================================================
  if (INSIDE && HOLES.length) {
    const st = (ranges[0] && ranges[0][2].stations) || [], cams = st.filter(s => Array.isArray(s.pos) && Array.isArray(s.aim)), cam0 = cams[0] ? cams[0].pos : add(HOLES[0].p, [0, 0, 0]), cam1 = cams.length ? cams[cams.length - 1].pos : cam0;
    const tubeC = A('inside_cam_tube', START), tubeA = A('inside_aim_tube', START), tube = tubeC && tubeA ? { pos: tubeC, aim: tubeA } : null;     // props-hero's best view along the cabin (the station 7 lens is moving there): it counts as a camera here even before the plan has it
    const looks = cams.concat(tube ? [tube, tube] : []), view = looks.length ? nrm(looks.reduce((a, s) => add(a, nrm(sub(s.aim, s.pos))), [0, 0, 0])) : LEFT, vh = nrm([view[0], view[1], 0]);
    // the picture needs the light to come IN through the wall the lens looks at (the men's side). Which wall that is: the side of the body's long axis the lens aims at (a lens that looks
    // ALONG the tube still aims at one wall); with no axis point to be had, the wall with more holes. If the real sun would shine OUT through that wall, its direction is mirrored across the long axis.
    const axP = A('inside_floor', START) || A('inside_cam', START), fusAll = HOLES.filter(h => /^fus/.test(h.surf || 'fus')), aimSide = axP && looks.length ? looks.reduce((a, s) => a + dot(sub(s.aim, axP), LEFT), 0) / looks.length : 0;
    const wSide = Math.abs(aimSide) > .2 ? Math.sign(aimSide) : (Math.sign(fusAll.reduce((a, h) => a + dot(h.n, LEFT), 0)) || 1), WN = mul(LEFT, wSide);                                // WN: the outward normal of that wall
    let D = SUNDIR.slice(); const mirrored = dot(D, WN) > 0; if (mirrored) D = nrm(add(D, LEFT, -2 * dot(D, LEFT)));
    // the beams must CROSS the cabin to be seen as shafts: a sun that rakes along the body sends them down the tube, and a lens that looks along the tube sees them end-on (blobs, no shafts).
    // So the sun's rake along the body is held to 28 degrees at most, leaning away from the lens.
    { const across = -dot(D, WN), along = dot(D, NOSE), maxT = Math.tan(28 * Math.PI / 180); if (across > .05 && Math.abs(along) > across * maxT) { const sgn = Math.sign(dot(view, NOSE)) || Math.sign(along) || 1, hl = Math.hypot(across, along), ac2 = hl / Math.hypot(1, maxT); D = nrm(add(add(mul(WN, -ac2), NOSE, sgn * ac2 * maxT), [0, 0, 1], D[2])); } }
    // round 3 (FIX_LIST_v3 item 15): EVERY hole the sun can come through near the lens's way through the body gets its beam (the holes are read here, at build time: the cabin wall is props-hero's)
    const pts = looks.flatMap(s => [s.pos, s.aim, mul(add(s.pos, s.aim), .5)]); if (!pts.length) pts.push(HOLES[0].p); const nearOf = h => Math.min(...pts.map(q => len(sub(h.p, q))));
    const wall = fusAll.filter(h => dot(h.n, WN) > .2 && nearOf(h) < 7);                                                                // the holes of the wall the lens looks at
    // EVERY hole of that wall throws its beam: a hole low on the curve of the body faces the ground, and a sun 27 degrees up cannot shine in through it. The film's sun is low and gold,
    // so inside the body it is taken as low as it must be (never below 5 degrees) for the light to come in through the whole wall; the beams then cross the cabin and land on the far wall.
    const hz0 = nrm([D[0], D[1], 0]), el0 = Math.asin(cl(-D[2], 0, 1)); let el = el0;
    for (const e of [el0, .4, .32, .25, .18, .12, .09]) { if (e > el0 + 1e-6) continue; const d = nrm([hz0[0] * Math.cos(e), hz0[1] * Math.cos(e), -Math.sin(e)]); el = e; D = d; if (wall.every(h => dot(h.n, d) < -.12)) break; }
    const isWall = new Set(wall), lit = HOLES.filter(h => /^fus/.test(h.surf || 'fus') && dot(h.n, D) < -.12 && nearOf(h) < 7).sort((a, b) => (isWall.has(b) ? 1 : 0) - (isWall.has(a) ? 1 : 0) || nearOf(a) - nearOf(b)).slice(0, 80), wallLit = wall.filter(h => lit.includes(h)).length;
    // what can stand in a beam's way: frames, stringers, floor, bottles, cable runs (rivets and nails are left out: thousands, and too small to cut a beam)
    const blockers = []; if (hg) hg.traverse(o => { const m = o.material; if (!o.isMesh || o.userData.shadowOnly || o.userData.noExport || !m || Array.isArray(m) || m.transparent || m.depthWrite === false || m.colorWrite === false) return; if (o.isInstancedMesh && (o.count > 600 || /rivet|nail|bolt|screw/.test(o.name))) return; blockers.push(o); });
    const sAx = h => dot(h.p, NOSE), dirS = Math.sign(dot(sub(cam1, cam0), NOSE)) || 1, s0 = Math.min(...lit.map(sAx)), s1 = Math.max(...lit.map(sAx));
    const BEAM = lin('#ffb95e');                                                           // a deeper gold for the beam's body: forty beams add up along the tube, and pale gold adds up to white
    const A1 = perp(D), A2 = cross(D, A1), SUB = [[0, 0], [.62, 0], [-.62, 0], [0, .62], [0, -.62]]; let nCut = 0; const cutBy = {};
    const beams = lit.map((h, i) => { const r = cl(h.r * .62, .018, .08), u = cl(((sAx(h) - s0) / Math.max(.01, s1 - s0)) * dirS + (dirS < 0 ? 1 : 0));
      const subs = SUB.map(([x, y]) => { const o = add(add(add(h.p, h.n, -.04), A1, x * r), A2, y * r), hit = castRay(o, D, 7, blockers, .09), L = hit ? hit.t : 2.4, e = add(o, D, L), nf = hit && hit.n ? (dot(hit.n, D) > 0 ? mul(hit.n, -1) : hit.n) : mul(D, -1), cs = Math.max(.25, Math.abs(dot(nf, D)));
        let U = sub(D, mul(nf, dot(D, nf))); U = len(U) > .05 ? nrm(U) : perp(nf); return { o, e, L, nf, U, V: nrm(cross(nf, U)), cs, name: hit ? hit.name : '' }; });
      const Ls = subs.map(q => q.L), cut = Math.max(...Ls) - Math.min(...Ls) > .12; if (cut) { nCut++; const sh = subs.slice().sort((a, b) => a.L - b.L)[0]; cutBy[sh.name || '?'] = (cutBy[sh.name || '?'] || 0) + 1; }
      return { h, r, u, subs, L: subs[0].L, a: A1, k: i, cut, finger: h.tag === 'finger_hole' }; });
    const low = lit.filter(h => h.tag !== 'finger_hole').sort((a, b) => a.p[2] - b.p[2])[0], peekIn = low ? nrm(add(mul(low.n, -1), [0, 0, .35])) : null;   // the lantern stands outside, lower: its glow comes in and up
    const c = beams.reduce((a, b) => add(a, b.subs[0].e), [0, 0, 0]), bounce = pointLight('fx_beam_bounce', new THREE.Color().setRGB(GOLD[0], GOLD[1], GOLD[2]), 7, 1.5);
    if (beams.length) { const m = mul(c, 1 / beams.length), up = add(m, D, -.45); bounce.position.copy(T3(up)); outAnchors.beam_floor = m; outAnchors.beam_wall = beams[0].h.p; }
    const f0 = START + 24, fr = evOf('finger_ring')[0], bb = fxOf(/beam_blink/)[0], f1 = fr ? fr.f0 - 4 : bb ? bb.f - 8 : START + 96, tick = f => has('beam_tick') ? val('beam_tick', f, 0) : (f - f0) / Math.max(1, f1 - f0);
    const fingerF = fr ? fr.f0 : 1e9;
    log.push(`inside: ${beams.length} beams of ${HOLES.length} holes (${HOLES.filter(h => /^fus/.test(h.surf || 'fus')).length} in the body; the wall the lens looks at has ${wall.length}, ${wallLit} of them throw a beam; sun ${(el * 180 / Math.PI).toFixed(0)} deg high here, ${(el0 * 180 / Math.PI).toFixed(0)} outside)${mirrored ? ', sun mirrored to the lens side' : ''}${tube ? `; tube view cam ${tubeC.map(v => v.toFixed(2))} aim ${tubeA.map(v => v.toFixed(2))}` : '; no inside_cam_tube anchor'}; median length ${(beams.map(b => b.L).sort((x, y) => x - y)[beams.length >> 1] || 0).toFixed(1)} m; ends on ${Object.entries(beams.reduce((m, b) => { const k = (b.subs[0].name || 'air').replace(/_\d+$/, ''); m[k] = (m[k] || 0) + 1; return m; }, {})).map(([k, v]) => k + ' x' + v).join(', ')}; ${nCut} beams cut by ${Object.entries(cutBy).map(([k, v]) => k + ' x' + v).join(', ') || 'nothing'}; ${blockers.length} blockers; tick ${has('beam_tick') ? 'from events' : `default f ${f0}-${f1}`}`);
    // ---- S2 INSIDE GAG (2026-11-14, film.json "s2_inside"; without the key nothing here runs): the beams blink on a list of frames (his eye passes THAT hole), a hole can be blocked,
    // a 3D fingertip pokes in through the finger hole, the Chief's chalk tip travels round its rim and leaves a chalk ring that pops on bead by bead, chalk dust falls in.
    const GAG = film.s2_inside || null, gB = new Map();
    if (GAG) for (const b of beams) gB.set(b, { fs: (GAG.blinks || []).filter(q => len(sub(q.p, b.h.p)) < .05).map(q => q.f), bl: (GAG.blocks || []).filter(q => len(sub(q.p, b.h.p)) < .05) });
    let gagUp = null;
    if (GAG && GAG.finger) { const G = GAG.finger, R = GAG.ring, hp = G.p, n = nrm(G.n), inw = mul(n, -1), a1 = perp(n), a2 = cross(n, a1), WH = lin('#fff6e4'), UP = new V3(0, 1, 0);
      const SNP = [0, .05, .16, .31, .48, .66, .79, .88, .93, .96, .98, .99, 1], snp = (x, nn = 12) => { if (x <= 0) return 0; const u = x * 12 / nn; if (u >= 12) return 1; const i = Math.floor(u); return SNP[i] + (SNP[i + 1] - SNP[i]) * (u - i); };
      const ink = new THREE.MeshBasicMaterial({ color: '#2a1a1f' }), chk = new THREE.MeshBasicMaterial({ color: '#f6f3e6' }), chk2 = new THREE.MeshBasicMaterial({ color: '#fbf9f0' });
      const fg = new THREE.Group(); fg.name = 'fx_s2_finger'; { const sh = new THREE.Mesh(new THREE.CylinderGeometry(.0165, .02, .36, 14), ink); sh.position.y = -.18; const tp = new THREE.Mesh(new THREE.SphereGeometry(.0165, 14, 10), ink); const kn = new THREE.Mesh(new THREE.SphereGeometry(.019, 12, 8), ink); kn.position.y = -.05; kn.scale.set(1.08, .8, 1.08); fg.add(sh, tp, kn); } fg.userData.noExport = true; fg.traverse(o => { o.frustumCulled = false; }); root.add(fg);
      const ct = new THREE.Mesh(new THREE.CylinderGeometry(.0085, .0115, .1, 10), chk2); ct.name = 'fx_s2_chalk_tip'; ct.geometry.translate(0, -.05, 0); ct.userData.noExport = true; ct.frustumCulled = false; root.add(ct);
      const NB = 170, Rr = (G.r || .06) + (R.pad ?? .034), beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), chk, NB); beads.name = 'fx_s2_chalk_ring'; beads.userData.noExport = true; beads.frustumCulled = false; root.add(beads);
      const TURN = TAU * 1.07, th0 = R.a0 ?? 2.2, thOf = f => { const u = cl((f - R.f0) / (R.f1 - R.f0)); return th0 + TURN * (u < .5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u)); }, rim = (th, rr = Rr, d = .014) => add(add(add(hp, a1, Math.cos(th) * rr), a2, Math.sin(th) * rr), inw, d);
      const beadF = []; for (let j = 0; j < NB; j++) { const th = th0 + TURN * j / (NB - 1); let fj = R.f1; for (let f = R.f0; f <= R.f1; f++) if (thOf(f) >= th - 1e-6) { fj = f; break; } beadF.push([th, fj]); }
      const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qb = new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, 1), T3(n).normalize());
      gagUp = (f, t) => {
        // the finger: 3 f at the mouth of the hole (anticipation), SNAP in (5 f), settle; stiff while the chalk goes round; ONE wiggle; slides out
        let d = -1; if (f >= G.f_in - 3 && f < G.f_in) d = -.03 + .02 * (f - G.f_in + 3) / 3; else if (f >= G.f_in && f < G.f_out) d = -.01 + .125 * snp(f - G.f_in, 6) - .012 * snp(f - G.f_in - 6, 6); else if (f >= G.f_out && f < G.f_out + 5) d = .103 - .16 * snp(f - G.f_out, 5) ;
        fg.visible = d > -.5; if (fg.visible) { const stiff = f >= R.f0 - 1 && f < G.f_wig, aw = f - G.f_wig, wig = aw >= 0 && aw < 8 ? .5 * Math.sin(TAU * aw / 8 * 1.5) * Math.exp(-aw / 9) : 0, droop = stiff ? 0 : .16;
          const dir = nrm(add(add(inw, [0, 0, 1], wig - droop * .5), G.lat || a1, G.lat ? .8 : (G.side || 0))); q.setFromUnitVectors(UP, T3(dir).normalize()); fg.quaternion.copy(q); fg.position.copy(T3(add(hp, dir, (d + (stiff ? .008 : 0)) * 1.25)));   /* the finger goes THROUGH the middle of the hole: its tip is out along its own line (lat = the way it leans, plan vector) */ if (f === G.f_in + 4) QP.cam(add(hp, inw, .02), G.r * 5, G.r * 5, WH, .5); }
        // the chalk tip pokes in at the rim, goes round once and a bit (the flourish), and is gone
        const on = f >= R.f0 - 2 && f <= R.f1 + 2; ct.visible = on; const th = thOf(f);
        if (on) { const dip = f < R.f0 ? (f - R.f0 + 2) / 2 : f > R.f1 ? 1 - (f - R.f1) / 2 : 1, tipP = rim(th, Rr, .012 + .02 * dip), lean = nrm(add(add(inw, a1, -.5 * Math.sin(th)), a2, .5 * Math.cos(th))); ct.position.copy(T3(tipP)); q.setFromUnitVectors(UP, T3(lean).normalize()); ct.quaternion.copy(q); QP.cam(tipP, .05, .05, WH, .35); }
        // the ring: each bead POPS on as the tip passes (big, then its size), and stays
        for (let j = 0; j < NB; j++) { const [bt, fj] = beadF[j], a = f - fj, sc = a < 0 ? 0 : (a === 0 ? 2.1 : a === 1 ? 1.5 : a === 2 ? 1.15 : 1) * (.0028 + .0016 * hsh(j * 3.1)); const P = T3(rim(bt, Rr + .004 * Math.sin(j * 1.9), .012)); M4.compose(P, qb, new V3(sc * 1.25, sc * 1.25, sc * .45)); beads.setMatrixAt(j, M4); }
        beads.instanceMatrix.needsUpdate = true;
        // chalk dust: two grains a frame fall in from the tip, drift and fade
        for (let e = R.f0; e <= Math.min(f, R.f1 + 1); e++) for (let k = 0; k < 3; k++) { const a = f - e; if (a > 30) continue; const h1 = hsh(e * 7.3 + k * 1.7), h2 = hsh(e * 3.1 + k * 5.3), o = rim(thOf(e), Rr, .02), pp = add(add(add(o, inw, .012 * a * (.4 + h1)), [0, 0, -1], .0011 * a * a + .003 * a), a1, (h2 - .5) * .01 * a); QP.cam(pp, .006 + .007 * h1, .006 + .007 * h1, WH, .7 * (1 - a / 30)); }
      }; }
    updaters.push((f, t, s) => { const on = cl(s.beam_on ?? 1), peek = cl(s.lantern_peek ?? 1); let sum = 0;
      for (const b of beams) { let age = -9; for (let k = 0; k <= 14; k++) { if (tick(f - k) >= b.u) age = k; else break; } if (age === 14) age = 99; let soon = age < 0 ? (tick(f + 1) >= b.u ? 1 : tick(f + 2) >= b.u ? 2 : 0) : 0;
        const gg = GAG ? gB.get(b) : null; if (gg) { age = 99; soon = 0; for (const fb of gg.fs) { const a = f - fb; if (a >= 0 && a < 14) age = a; else if (a === -1) soon = 1; else if (a === -2) soon = 2; } if (age === 99 && soon) age = -9; }
        // build: the eye covers the hole (two dark frames) · pop: the light jumps back brighter · settle: back to its own level over 8 frames
        let I = age === 99 || (age < 0 && !soon) ? 1 : soon === 2 ? .3 : soon === 1 ? .05 : 1 + 1.7 * Math.exp(-age / 2.2);
        if (b.finger) I *= 1 - ss(fingerF - 14, fingerF - 8, f); if (gg) for (const q of gg.bl) if (f >= q.f0 && f < q.f1) I = .03; I *= on * (.94 + .06 * Math.sin(t * 1.7 + b.k)); sum += I; b.I = I; if (I < .01) continue;
        const pop = Math.max(0, I - 1), base = .55 + .3 * cl(b.r / .08);
        // five thin rays per hole: each ends where ITS ray ends, so a frame or stringer in the way cuts the beam and takes its light; the far wall or the floor takes the rest
        for (const [k, sb] of b.subs.entries()) { const rr = b.r * (k ? .5 : .62); CN.put(sb.o, sb.e, rr, rr * 1.18 + .006, BEAM, (k ? .06 : .1) * base * I, 1.9);
          QD.flat(add(sb.e, sb.nf, .012), mul(sb.U, rr * 1.2 / sb.cs), mul(sb.V, rr * 1.2), SUN, (k ? .42 : .6) * I, 0, .35); }
        CN.put(b.subs[0].o, b.subs[0].e, b.r * .26, b.r * .32, GOLD, .13 * base * I, 1.5);                                                    // the hot core
        QD.flat(add(b.subs[0].e, b.subs[0].nf, .014), mul(b.subs[0].U, b.r * 3.4 / b.subs[0].cs), mul(b.subs[0].V, b.r * 3.4), GOLD, .15 * I, 0, 0);   // the patch's soft skirt
        QP.cam(add(b.h.p, b.h.n, -.03), b.r * (2.1 + .8 * pop), b.r * (2.1 + .8 * pop), GOLD, Math.min(.8, .13 * I + .26 * pop), 0, 0, .1);                                     // the torn edge blooms
        // dust turning inside the beam: it circles the beam's axis, drifts down its length and twinkles as it tumbles
        const nm = 8 + Math.round(b.L * 5); for (let j = 0; j < nm; j++) { const q = b.k * 53.1 + j * 7.77, u = (hsh(q) + t * (.012 + .02 * hsh(q + 1))) % 1, ang = hsh(q + 2) * TAU + t * (.5 + 1.1 * hsh(q + 3)) * (hsh(q + 4) < .5 ? -1 : 1), rr = b.r * (1 + .3 * u) * Math.sqrt(hsh(q + 5)) * .95;
            const pp = add(add(add(b.subs[0].o, D, u * b.L), A1, Math.cos(ang) * rr), A2, Math.sin(ang) * rr), big = hsh(q + 6) < .22, tw = .35 + .65 * Math.pow(.5 + .5 * Math.sin(t * (2.2 + 3 * hsh(q + 7)) + q), 2), sz = big ? .014 + .01 * hsh(q + 8) : .0045 + .004 * hsh(q + 8);
            QP.cam(pp, sz, sz, big ? GOLD : SUN, (big ? .3 : 1.25) * tw * I * (1 - .55 * u), 0, 0, big ? 0 : .2); } }
      if (peek > .01 && low) { const fl = .93 + .07 * Math.sin(t * 11.3) * Math.sin(t * 4.1), o = add(low.p, low.n, -.04); CN.put(o, add(o, peekIn, .85), low.r * .8, low.r * 2.6, AMBER, .5 * peek * fl, 1.6); QP.cam(add(low.p, low.n, -.03), low.r * 3.4, low.r * 3.4, AMBER, .62 * peek * fl, 0, 0, .1); QP.cam(add(low.p, low.n, -.03), low.r * 9, low.r * 9, AMBER_DEEP, .1 * peek * fl); }
      bounce.intensity = beams.length ? .14 * on * cl(sum / beams.length, 0, 1.6) : 0;  if (gagUp) gagUp(f, t); });
  }

  // =====================================================================================================================
  // 2. UNDER THE WING BY DAY (and at dawn): round sun spots from the holes above, on the ground and across the figures; dust specks in the thin shafts
  // =====================================================================================================================
  if (APRON && (DAY || DAWN) && HOLES.length && SUNDIR[2] < -.05) {
    const sheets = [], casters = solids.filter(o => o.castShadow); if (hg) hg.traverse(o => { if (o.isMesh && /wing_.*shadow_sheet/.test(o.name)) sheets.push(o); });
    const upA = [0, 0, 1], el = -SUNDIR[2], hz = nrm([SUNDIR[0], SUNDIR[1], 0]), side = [-hz[1], hz[0], 0];
    const spots = []; for (const h of HOLES) { if (!/^w.l$/.test(h.surf || '')) continue; const up = castRay(add(h.p, upA, -.02), upA, 1.2, sheets, 0), o = up ? up.p : h.p;      // the hole in the sheet that really casts the wing's shadow
      if (castRay(add(o, SUNDIR, .04), SUNDIR, 40, casters, .02)) continue;                                                               // a nacelle, the gear or the body is in the way
      const t = o[2] / el; if (!(t > 0)) continue; const g = add(o, SUNDIR, t); g[2] = .012; spots.push({ h, o, g, t, r: cl(h.r * 1.45, .045, .15), k: spots.length }); }
    if (spots.length) { const m = spots.reduce((a, s) => add(a, s.g), [0, 0, 0]); outAnchors.sun_spots = mul(m, 1 / spots.length); }
    log.push(`sun spots: ${spots.length} (sheets found ${sheets.length}), on the ground x ${Math.min(...spots.map(s => s.g[0])).toFixed(1)}..${Math.max(...spots.map(s => s.g[0])).toFixed(1)} y ${Math.min(...spots.map(s => s.g[1])).toFixed(1)}..${Math.max(...spots.map(s => s.g[1])).toFixed(1)}`);
    updaters.push((f, t, s) => { const on = cl(s.sun_spots ?? 1); if (on < .01) { lightCards([], null); return; }
      const rays = spots.map(sp => ({ o: sp.o, d: SUNDIR, r: cl(sp.h.r * 1.05, .035, .1), I: .95 * on, max: sp.t })), { stop } = lightCards(rays, null);
      spots.forEach((sp, i) => { const sh = .93 + .07 * Math.sin(t * .9 + sp.k * 1.7), blocked = stop[i] < sp.t, end = blocked ? add(sp.o, SUNDIR, stop[i]) : sp.g;
        if (!blocked) { QD.flat(sp.g, mul(hz, sp.r / el), mul(side, sp.r), SUN, .62 * on * sh, 0, .5); QD.flat(sp.g, mul(hz, sp.r * 2.3 / el), mul(side, sp.r * 2.3), GOLD, .22 * on * sh, 0, .02); }
        CN.put(add(sp.o, SUNDIR, .12), end, sp.r * .8, sp.r * .95, GOLD, .16 * on * sh, .3);
        const L = blocked ? stop[i] : sp.t, a = side, b = cross(SUNDIR, side); for (let j = 0; j < 7; j++) { const q = sp.k * 31.7 + j * 5.3, u = (hsh(q) + t * (.01 + .015 * hsh(q + 1))) % 1, ang = hsh(q + 2) * TAU + t * (.4 + .8 * hsh(q + 3)), rr = sp.r * .85 * Math.sqrt(hsh(q + 4)), tw = Math.pow(.5 + .5 * Math.sin(t * (2 + 3 * hsh(q + 5)) + q), 2);
          QP.cam(add(add(add(sp.o, SUNDIR, .15 + u * (L - .15)), a, Math.cos(ang) * rr), b, Math.sin(ang) * rr), .006 + .004 * hsh(q + 6), .006 + .004 * hsh(q + 6), SUN, 1.1 * tw * on, 0, 0, .2); } }); });
  }

  // =====================================================================================================================
  // 3. NIGHT, LINE 16: the lantern's light through ONE hole: a warm shaft with dust and moths in it, a pool where it lands, amber on the face. Never white.
  // =====================================================================================================================
  if (APRON && NIGHT) {
    const hh = HOLES.filter(h => h.tag === 'hole_light').sort((a, b) => a.p[2] - b.p[2])[0], spot = new THREE.SpotLight('#ffb347', 0, 7, .5, .9, 1.4); spot.name = 'fx_hole_pool_light'; spot.castShadow = false; spot.userData.noExport = spot.target.userData.noExport = true; root.add(spot); root.add(spot.target);
    const lsh = fxOf(/light_shaft/)[0], fw = lsh ? lsh.f : START + 66, hgEv = evOf('hole_glow').find(e => e.to >= .97), popF = has('hole_glow') ? (hgEv ? hgEv.f1 : null) : fw, SRC = .36;
    const glowAt = f => { const v0 = has('hole_glow') ? cl(val('hole_glow', f, 0)) : 0, base = has('hole_glow') ? (popF != null && f < popF ? .42 * Math.pow(v0, 1.3) : v0) : f < fw ? .4 * Math.pow(ss(fw - 20, fw - 1, f), 1.4) : 1; return base * (popF != null && f >= popF ? 1 + .3 * Math.exp(-(f - popF) / 3.2) : 1); };
    log.push(`night hole: ${hh ? 'hole_light found, r ' + hh.r : 'NO hole tagged hole_light, the anchor is used'}; pop f ${popF}${has('hole_glow') ? ' (events)' : ' (word default)'}`);
    const srcAt = (f, s, cards) => { const H = (s && Array.isArray(s.hole_at) ? s.hole_at : null) || A('hole_light', f) || (hh && hh.p);   /* S5: state key hole_at = [x, y, z] names another hole for the lantern light (the access door); no key = the tagged wing hole, as before */ if (!H) return null; if (Array.isArray(s.hole_src)) return { H, S: s.hole_src };
      const nUp = hh ? mul(hh.n, hh.n[2] > 0 ? 1 : -1) : [0, 0, 1]; let best = null, bd = 1.3; for (const c of cards || []) { const p = P3(c.position), d = Math.hypot(p[0] - H[0], p[1] - H[1]); if (d < bd && p[2] < H[2] - 1) { bd = d; best = p; } }
      const aim = best ? [best[0], best[1], H[2] - .92] : add(H, nUp, -1); return { H, S: add(H, nrm(sub(H, aim)), SRC) }; };       // default: the lantern is held behind the hole, on the line from the nearest face
    outAnchors.hole_lantern = f => { const o = srcAt(f, world.stateAt ? world.stateAt(f) : {}, findCards()); return o ? o.S : A('hole_light', f); };
    updaters.push((f, t, s) => { const g = glowAt(f) * (.95 + .05 * Math.sin(t * 11.3) * Math.sin(t * 4.1)), cards = findCards(), o = srcAt(f, s, cards); if (!o || g < .004) { spot.intensity = 0; lightCards([], null); return; }
      // round 3: the light goes the way the LANTERN stands. When the lantern is held BELOW the hole (the Chief's hand under the wing, as staged since v3) its light goes UP through the hole:
      // a soft amber cone from the flame to the hole with dust in it, and the torn rim taking the light, first faint, then full on the word. No shaft comes down, and nothing is laid on the figure
      // (the first version shone down from the hole through the Chief's own card: a hard amber band on his face and jacket).
      const LP = !Array.isArray(s.hole_src) ? (A('lantern_light', f) || null) : null;
      if (LP && LP[2] > -5 && LP[2] < o.H[2] - .15 && len(sub(o.H, LP)) < 3.2) { const H = o.H, d = nrm(sub(H, LP)), L = len(sub(H, LP)), r0 = (hh ? hh.r : .1) * .9, a = perp(d), b = cross(d, a), nDn = hh ? mul(hh.n, hh.n[2] > 0 ? -1 : 1) : [0, 0, -1];
        spot.intensity = 0; { let best = null, bd = 1.6; for (const cd of cards) { const cp = P3(cd.position), dd = Math.hypot(cp[0] - LP[0], cp[1] - LP[1]); if (dd < bd) { bd = dd; best = cp; } }   /* his face takes the amber from where the lantern really is: one wide soft cone from the flame to his head, never more than a warm side */
          if (best) { const head = [best[0], best[1], Math.max(LP[2] + .25, H[2] - .75)], dc = nrm(sub(head, LP)); lightCards([], { S: add(LP, dc, -.25), d: dc, tan: .62, spill: .25, spillW: 1.6, I: .5 * Math.min(1.15, g) }); } else lightCards([], null); }
        CN.put(add(LP, d, .08), H, .035, r0, AMBER, .2 * g, .25); CN.put(add(LP, d, .08), H, .02, r0 * .55, AMBER, .16 * g, .2);                         // from the flame up to the hole, widening
        QP.cam(add(H, nDn, .03), r0 * 2.7, r0 * 2.7, AMBER, .75 * Math.min(1.1, .3 + g), 0, 0, .15); QP.cam(add(H, nDn, .03), r0 * 6.5, r0 * 6.5, AMBER_DEEP, .16 * Math.min(1, g));   // the rim of the hole takes the light
        for (let j = 0; j < 46; j++) { const q = j * 9.31, u = (hsh(q) + t * (.02 + .03 * hsh(q + 1))) % 1, ang = hsh(q + 2) * TAU + t * (.5 + hsh(q + 3)) * (j % 2 ? 1 : -1), rr = (.03 + (r0 - .03) * u) * .9 * Math.sqrt(hsh(q + 4)), tw = Math.pow(.5 + .5 * Math.sin(t * (2 + 3 * hsh(q + 5)) + q), 2), sz = .005 + .006 * hsh(q + 6);
          QP.cam(add(add(add(LP, d, .08 + u * (L - .08)), a, Math.cos(ang) * rr), b, Math.sin(ang) * rr), sz, sz, AMBER, 1.7 * tw * Math.min(1.1, g) * (.5 + .5 * u), 0, 0, .2); }
        for (let j = 0; j < 4; j++) { const q = j * 3.77 + 1, w = 2.1 + j * .53, pm = add(LP, [Math.cos(t * w + q * 4) * (.16 + .05 * j), Math.sin(t * w * 1.21 + q) * (.16 + .05 * j), .1 + .12 * Math.sin(t * 1.3 + q)]), fl = .6 + .4 * Math.abs(Math.sin(t * 19 + j));
          QP.cam(pm, .016, .01 * fl + .004, lin('#fff0cf'), .7 * Math.min(1, g * 1.5), .55, Math.sin(t * 7 + j)); }                                       // moths round the lantern
        return; }
      const { H, S } = o, d = nrm(sub(H, S)), r0 = (hh ? hh.r : .1) * .9, ds = Math.max(.15, len(sub(H, S))), tn = r0 / ds, L = d[2] < -.08 ? Math.min(5, (H[2] - .012) / -d[2]) : 3.2, r1 = r0 + tn * L, toGround = d[2] < -.08 && (H[2] - .012) / -d[2] <= 5;
      const E = add(H, d, L), a = perp(d), b = cross(d, a), build = cl(g / .4), grow = .25 + .75 * ss(.1, 1, g);                         // the shaft grows out of the hole as the lantern comes up
      const Lg = L * grow, Eg = add(H, d, Lg), r1g = r0 + tn * Lg;
      { const HCK = pl.hole_cone_k ?? 1; CN.put(H, Eg, r0, r1g, AMBER, .4 * g * HCK, 1.1); CN.put(H, Eg, r0 * .55, r1g * .5, AMBER, .46 * g * HCK, .8); CN.put(H, add(H, d, Lg * .6), r0 * 1.6, r1g * 1.15, AMBER_DEEP, .1 * g * HCK, 1.6); }
      QP.cam(H, r0 * 2.6, r0 * 2.6, AMBER, .7 * Math.min(1.1, .35 + g), 0, 0, .15); QP.cam(H, r0 * 8, r0 * 8, AMBER_DEEP, .13 * build);          // the rim of the hole takes the light first
      if (toGround && grow > .9) { const hzd = nrm([d[0], d[1], 0.0001]), sd = [-hzd[1], hzd[0], 0], cs = Math.max(.3, -d[2]), k = ss(.9, 1, grow) * g; QD.flat([E[0], E[1], .013], mul(hzd, r1 / cs), mul(sd, r1), AMBER, .34 * k, 0, .3); QD.flat([E[0], E[1], .015], mul(hzd, r1 * 2.1 / cs), mul(sd, r1 * 2.1), AMBER_DEEP, .1 * k, 0, 0); }
      spot.position.copy(T3(add(H, d, -.02))); spot.target.position.copy(T3(E)); spot.angle = Math.min(1.2, Math.atan(r1 / L) * 1.25 + .05); spot.distance = L + 2.5; spot.intensity = 6 * g * ss(.5, 1, grow);
      for (let j = 0; j < 70; j++) { const q = j * 9.31, u = (hsh(q) + t * (.02 + .03 * hsh(q + 1))) % 1; if (u > grow) continue; const ang = hsh(q + 2) * TAU + t * (.5 + hsh(q + 3)) * (j % 2 ? 1 : -1), rr = (r0 + tn * u * L) * .9 * Math.sqrt(hsh(q + 4)), tw = Math.pow(.5 + .5 * Math.sin(t * (2 + 3 * hsh(q + 5)) + q), 2), sz = .006 + .007 * hsh(q + 6);
        QP.cam(add(add(add(H, d, u * L), a, Math.cos(ang) * rr), b, Math.sin(ang) * rr), sz, sz, AMBER, 1.9 * tw * g * (1 - .5 * u), 0, 0, .2); }
      for (let j = 0; j < 5; j++) { const q = j * 3.77 + 1, u = .12 + .28 * (.5 + .5 * Math.sin(t * (.7 + .3 * j) + q * 5)), w = 2.1 + j * .53, rr = (r0 + tn * u * L) * (.5 + .5 * Math.sin(t * 1.3 + q)), p = add(add(add(H, d, u * L), a, Math.cos(t * w + q * 4) * rr), b, Math.sin(t * w * 1.21 + q) * rr), fl = .6 + .4 * Math.abs(Math.sin(t * 19 + j));
        if (u < grow) QP.cam(p, .017, .011 * fl + .004, lin('#fff0cf'), .75 * g, .55, Math.sin(t * 7 + j)); }                             // moths
      lightCards([], { S: add(H, d, -r0 / tn), d, tan: tn, spill: .4, spillW: 2.2, I: 1.1 * (pl.hole_face_i ?? 1) * g * ss(.3, 1, grow) }); });
  }

  // =====================================================================================================================
  // 4. THE MAP: a tiny glint on each pin as it goes in, one soft warm pulse when the tail is full, the lantern's glow on the four bare ovals at stage 5
  // =====================================================================================================================
  if (HANGAR) {
    const pinsM = scene.getObjectByName('map_pin_heads'), ovA = anchors.map_ovals, ovals = Array.isArray(ovA) && Array.isArray(ovA[0]) ? ovA : [], mapC = A('map');
    if (pinsM && pinsM.isInstancedMesh && mapC) { pinsM.updateMatrixWorld(true); const NP = pinsM.instanceMatrix.count, mt = new THREE.Matrix4(), pins = []; for (let i = 0; i < NP; i++) { pinsM.getMatrixAt(i, mt); mt.premultiply(pinsM.matrixWorld); pins.push(P3(new V3().setFromMatrixPosition(mt))); }
      const nY = Math.sign(pins[0][1] - mapC[1]) || 1, N = [0, nY, 0], X = [1, 0, 0], Z = [0, 0, 1], zs = pins.map(p => p[2]), zMin = Math.min(...zs), zMax = Math.max(...zs), xs = pins.map(p => p[0]), xMin = Math.min(...xs), xMax = Math.max(...xs);
      // stage counts as hangar.js fills them: the first 40 (wings), then the tail (the pins below the body's last third), then the rest
      const N1 = Math.min(40, NP), zTail = zMin + (zMax - zMin) * .28; let N2 = N1; while (N2 < NP && pins[N2][2] < zTail) N2++;
      const nfOf = mv => mv <= 1 ? 0 : mv <= 2 ? N1 * (mv - 1) : mv <= 3 ? N1 + (N2 - N1) * (mv - 2) : mv < 4 ? N2 + (NP - N2) * (mv - 3) : NP;
      const mapEv = evOf('map'), base = (pl.state && pl.state.map) ?? 0, pinF = new Int32Array(NP).fill(-1e6);
      if (mapEv.length) { let k = 0; for (let f = mapEv[0].f0; f <= mapEv[mapEv.length - 1].f1 + 1 && k < NP; f++) { const n = Math.floor(nfOf(cl(val('map', f, base), 0, 5)) + 1e-6); while (k < n && k < NP) pinF[k++] = f; } }
      const tailC = (() => { const tp = pins.slice(N1, N2); if (!tp.length) return null; const m = tp.reduce((a, p) => add(a, p), [0, 0, 0]); return mul(m, 1 / tp.length); })(), tailR = tailC ? Math.max(.12, ...pins.slice(N1, N2).map(p => Math.hypot(p[0] - tailC[0], p[2] - tailC[2]))) : .3;
      const tailP = pulses('tail_pulse', () => { const f = crossUp('map', 2.985, base); return f != null ? [{ f, w: 8, amp: 1 }] : []; });
      const og = scene.getObjectByName('map_oval_glow'), ow = og && og.geometry && og.geometry.parameters ? [og.geometry.parameters.width / 2, og.geometry.parameters.height / 2] : [.15, .31];
      const ovalLight = pointLight('fx_oval_glow_light', '#ffb347', 2.6, 1.6), oc = ovals.length ? mul(ovals.reduce((a, p) => add(a, p), [0, 0, 0]), 1 / ovals.length) : mapC; ovalLight.position.copy(T3(add(oc, N, .7)));
      const ovEv = evOf('oval_glow').find(e => e.to >= .97), ovPop = has('oval_glow') ? (ovEv ? ovEv.f1 : null) : crossUp('map', 4.97, base), ovOf = f => has('oval_glow') ? cl(val('oval_glow', f, 0)) : cl(val('map', f, base) - 4);
      // the rest of the paper sinks a little, so bare paper can be the brightest thing on the wall (a glow on white paper cannot get brighter than white)
      const dimG = new THREE.PlaneGeometry(1, 1), cx = (xMin + xMax) / 2, cz = (zMin + zMax) / 2, dw = (xMax - xMin) + 1.1, dh = (zMax - zMin) + .8;
      const dimM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
        uniforms: { uK: { value: 0 }, uO: { value: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 1, 1)) } }, vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
        fragmentShader: `uniform float uK; uniform vec4 uO[4]; varying vec2 vP; void main(){ float m = 0.; for (int i = 0; i < 4; i++) { vec2 q = (vP - uO[i].xy) / uO[i].zw; m = max(m, 1. - smoothstep(.75, 1.9, length(q))); }
          float e = 1. - smoothstep(.36, .5, max(abs(vP.x), abs(vP.y))); gl_FragColor = vec4(mix(vec3(1.), vec3(.66, .6, .52), uK * (1. - m) * e), 1.); }` });
      const dim = fxObj(new THREE.Mesh(dimG, dimM), 9); dim.name = 'fx_map_dim'; dim.position.copy(T3([cx, mapC[1] + nY * .034, cz])); dim.scale.set(dw, dh, 1); if (nY > 0) dim.rotation.y = Math.PI; root.add(dim);
      ovals.slice(0, 4).forEach((o, i) => dimM.uniforms.uO.value[i].set((nY > 0 ? -1 : 1) * (o[0] - cx) / dw, (o[2] - cz) / dh, ow[0] / dw, ow[1] / dh));
      outAnchors.map_tail = tailC || mapC; log.push(`map: ${NP} pins (40 / ${N2 - N1} tail / ${NP - N2}), pin frames ${mapEv.length ? pinF[0] + '..' + pinF[NP - 1] : 'none (no map events)'}, tail pulse f ${tailP.map(p => p.f)}, oval pop f ${ovPop}`);
      const GL = lin('#fff1d6'), LIFE = 9;
      updaters.push((f, t, s) => { const gain = cl(s.pin_glint ?? 1, 0, 2), cnt = Math.min(NP, pinsM.count | 0);
        if (gain > .01) { let shown = 0; for (let i = cnt - 1; i >= 0 && shown < 70; i--) { const a = f - pinF[i]; if (a > LIFE) { if (pinF[i] > -1e5) break; continue; } if (a < 0) continue; shown++;
            // pop on the frame the pin is home (the head has just overshot), then a quick fade; the streak is one thin warm line, never a star
            const k = a === 0 ? 1 : Math.exp(-a / 2.1), p = add(pins[i], N, .016), sz = .016 + .03 * k; QP.cam(p, sz, sz, GL, 1.5 * k * gain, 0, 0, .12); QP.cam(p, .05 + .1 * k, .0045, GL, .9 * k * k * gain); QP.cam(p, .07, .07, GOLD, .16 * k * gain); } }
        for (const tp of tailP) { const a = f - tp.f; if (a < -tp.w || a > 26 || !tailC) continue; const k = (a < 0 ? .3 * ss(-tp.w, 0, a) : Math.exp(-a / 7) * (1 + .5 * Math.exp(-a / 1.6))) * tp.amp, gr = 1 + .35 * ss(0, 18, a);
          QD.flat(add(tailC, N, .03), mul(X, tailR * 1.5 * gr), mul(Z, tailR * 1.5 * gr), GOLD, .6 * k, 0, .25); QD.ring(add(tailC, N, .032), mul(X, tailR * 2.6), mul(Z, tailR * 2.6), GL, .32 * Math.exp(-Math.max(0, a) / 5) * (a >= 0 ? 1 : 0), 0, cl(.3 + a * .045, 0, .92), .1); }
        const ov = ovOf(f), pop = ovPop != null && f >= ovPop ? .45 * Math.exp(-(f - ovPop) / 4) : 0, br = ov * (1 + pop) * (.95 + .05 * Math.sin(t * 11.3) * Math.sin(t * 4.1));
        dimM.uniforms.uK.value = ov; dim.visible = ov > .003; ovalLight.intensity = .34 * br;
        if (ov > .003) ovals.forEach((o, i) => { const p = add(o, N, .03), w = .9 + .1 * Math.sin(t * 1.3 + i * 1.9); QD.flat(p, mul(X, ow[0] * 1.25), mul(Z, ow[1] * 1.2), AMBER, .3 * br * w, 0, .45); QD.flat(add(p, N, .001), mul(X, ow[0] * .85), mul(Z, ow[1] * .9), GOLD, .3 * br * w, 0, .2); QD.flat(add(p, N, .002), mul(X, ow[0] * 2.3), mul(Z, ow[1] * 1.75), AMBER_DEEP, .07 * br, 0, 0);
          if (pop > .01) QD.ring(add(p, N, .003), mul(X, ow[0] * 2.4), mul(Z, ow[1] * 1.9), AMBER, .3 * pop, 0, cl(.45 + (f - ovPop) * .05, 0, .9), .12); }); });
    } else log.push('map: no map_pin_heads or no map anchor, map effects are off');
  }

  // =====================================================================================================================
  // 5. DUST, CHALK AND SPARKS. Each leaves from the contact point, flies with drag and gravity, and settles.
  // =====================================================================================================================
  const GR = 9.8 / (fps * fps);                                                            // metres per frame squared
  // THE DUST LANGUAGE (round 3; FIX_LIST_v3 item 14: "puffs are flat white blobs over the mark just made"). No soft disc stands for dust any more. A puff is two layers:
  //   MOTES  many small grains (4 to 9 mm). Each leaves the contact point with its own speed, drag stops it, it sinks and drifts with the light air, tumbles through the
  //          key light (it flashes in the light's colour) and goes out on its own time.
  //   WISPS  a few thin torn strands, each stretched along the way it drifts, low opacity, thinning and breaking up as they fade. They fade out in front of a KEEP mark.
  // one parcel in still air: p0, velocity v (m per frame), drag k (per frame), sink (m per frame squared, + = falls), age a (frames)
  const fly = (p0, v, k, sink, a) => { const e = (1 - Math.exp(-k * a)) / k; return [p0[0] + v[0] * e, p0[1] + v[1] * e, Math.max(.02, p0[2] + v[2] * e - sink * (a - e) / k)]; };
  const flyV = (v, k, sink, a) => { const e = Math.exp(-k * a); return [v[0] * e, v[1] * e, v[2] * e - sink * (1 - e) / k]; };
  const shade = c => [c[0] * .42, c[1] * .42, c[2] * .52];                                 // a grain or strand seen from its shade side: darker and a little cooler
  const MOTE_S = 1.55, MOTE_I = 1.35, WISP_S = 1.7, WISP_I = 2.3;                          // tuned on phone-size frames (360 px wide): below these the dust is not seen, above them it starts to cover
  const WIND = [.0034, .001, 0];                                                           // light air from screen-left (LOOK_BIBLE), m per frame once a parcel has lost its own speed
  const LIT = DAY ? SUN : DAWN ? SUN : lin('#cfdcff'), CHALKLIT = DAY || DAWN ? lin('#fff8ea') : lin('#e6ecff');   // what a grain flashes with when it turns to the key
  const motes = (seed, a, o) => { if (a < 0 || a > o.life) return; const dr = o.drag ?? .15, sk = o.sink ?? .0012, wk = o.wind ?? 1, lit = o.lit || LIT, fl = o.floor ?? .012;
    for (let j = 0; j < o.n; j++) { const q = seed * 13.7 + j * 2.63, lf = o.life * (.5 + .5 * hsh(q + 7)); if (a > lf) continue; const sp = o.speed * (.3 + 1.2 * hsh(q + 1)), e = (1 - Math.exp(-dr * a)) / dr, wob = .0016 * Math.min(a, 20);
      const p = add(fly(o.at(q, j), mul(o.dir(q, j), sp), dr, sk * (.6 + .8 * hsh(q + 2)), a), WIND, (a - e) * wk); p[0] += Math.sin(a * .19 + q * 5) * wob; p[1] += Math.cos(a * .23 + q * 3) * wob; if (p[2] < fl) p[2] = fl;
      const u = a / lf, fade = ss(-.5, 1.2, a) * (1 - ss(.55, 1, u)), tw = .5 + .5 * Math.sin(a * (.45 + .8 * hsh(q + 3)) + q * 9), sz = o.size * MOTE_S * (.55 + .9 * hsh(q + 4)), I = (o.I ?? 1) * MOTE_I;
      const kind = hsh(q + 5), sp2 = o.sparkle ?? .5;                                    // three kinds of grain: one that flashes in the key, one in the dust's own colour, one seen from its shade side
      if (kind < sp2) QP.cam(p, sz, sz, lit, I * 1.15 * fade * (.25 + .75 * tw * tw), 0, 0, .25); else if (kind < sp2 + (1 - sp2) * .5) QP.cam(p, sz * 1.25, sz * 1.25, o.col, I * .62 * fade, .7, 0, .2); else QP.cam(p, sz * 1.2, sz * 1.2, shade(o.col), .6 * fade, 1, 0, .3); } };
  const wisps = (seed, a, o) => { if (a < 0 || a > o.life) return; const dr = o.drag ?? .14, sk = o.sink ?? .0004, wk = o.wind ?? 1;
    for (let j = 0; j < o.n; j++) { const q = seed * 19.9 + j * 4.41, lf = o.life * (.6 + .4 * hsh(q + 7)); if (a > lf) continue; const d = o.dir(q, j), v0 = mul(d, o.speed * (.5 + .8 * hsh(q + 1))), e = (1 - Math.exp(-dr * a)) / dr;
      const p = add(fly(o.at(q, j), v0, dr, sk, a), WIND, (a - e) * wk); if (o.floor != null && p[2] < o.floor) p[2] = o.floor;
      const v = add(flyV(v0, dr, sk, a), WIND, wk * (1 - Math.exp(-dr * a))), vd = nrm(len(v) > 1e-6 ? v : d), al = o.along ? o.along(q, j) : null, ax = al ? nrm(add(al, vd, o.alongK ?? .25)) : vd;
      const g = 1 - Math.exp(-a / (o.grow ?? 9)), L = (o.l0 + (o.l1 - o.l0) * g) * WISP_S * (.7 + .6 * hsh(q + 2)), u = a / lf;
      const hw = L * (o.thin ?? .4) * (.8 + .4 * hsh(q + 3)), alp = o.op * WISP_I * ss(-.5, 1.6, a) * Math.pow(1 - ss(.3, 1, u), 1.15) * (.7 + .3 * hsh(q + 4)), sd = hsh(q + 5) * 7 + .1, er = .12 + .88 * u * u;
      // two layers: the strand's own shade side a little lower (it covers: this is what reads on a sunlit floor), then the lit side on top (it glows in the key)
      if (o.flat) { const fa = nrm([ax[0], ax[1], 0.0001]), fb = [-fa[1], fa[0], 0];                                                    // dust that runs out over a floor lies ON it (seen from above it spreads; a standing ribbon would sink into the concrete)
        QP.fwisp([p[0] + .012, p[1] + .012, p[2] - .008], mul(fa, L * .96), mul(fb, hw * 1.5), shade(o.col), alp * (o.shade ?? .5), 1, sd + 2.7, er); QP.fwisp(p, mul(fa, L), mul(fb, hw * 1.5), o.col, alp, o.k ?? .45, sd, er); continue; }
      QP.wisp(add(p, [0, 0, -hw * .45]), mul(ax, L * .96), hw, shade(o.col), alp * (o.shade ?? .5), 1, sd + 2.7, er); QP.wisp(p, mul(ax, L), hw, o.col, alp, o.k ?? .45, sd, er); } };
  // heavier bits that hop and land: ballistic with one or two bounces on the floor (z = floor). hot = sparks, chip = small sticks of chalk that tumble and come to rest
  const grains = (seed, a, o) => { if (a < 0 || a > o.life) return; for (let j = 0; j < o.n; j++) { const q = seed * 29.1 + j * 6.13, lf = o.life * (.55 + .45 * hsh(q + 7)); if (a > lf) continue; const d = o.dir(q, j), sp = o.speed * (.4 + .9 * hsh(q + 1)); let p = o.at(q, j).slice(), v = mul(d, sp), spin = 0; const fl = o.floor ?? .012;
      for (let i = 0; i < Math.min(a, 90); i++) { v[2] -= GR; v = mul(v, 1 - (o.drag ?? .03)); p = add(p, v); spin += len(v) * 9; if (p[2] < fl) { p[2] = fl; v[2] = -v[2] * (o.bounce ?? .3); v[0] *= .6; v[1] *= .6; if (Math.abs(v[2]) < .004) v = [0, 0, 0]; } }
      const u = a / lf, sz = o.size * (.6 + .8 * hsh(q + 2)); if (o.hot) { const col = [lerp(1, 1, u), lerp(.84, .3, u), lerp(.5, .06, u)], I = (2.5 - 1.9 * u) * (1 - ss(.75, 1, u)) * (o.I ?? 1), sl = Math.max(sz * 1.5, len(v) * .8); QP.streak(add(p, v, -.5), mul(nrm(len(v) > 1e-5 ? v : [0, 0, 1]), sl), sz, col, I); QP.cam(p, sz * 1.9, sz * 1.9, col, I * .55, 0, 0, .1); }
      else if (o.chip) QP.cam(p, sz * 2.4, sz * .85, o.col, (o.op ?? .95) * (o.stay ? 1 : 1 - ss(.6, 1, u)), .95, hsh(q + 3) * TAU + spin, .5);
      else QP.cam(p, sz, sz, o.col, (o.op ?? .9) * (1 - ss(.6, 1, u)), o.k ?? .9, 0, .3); } };
  const around = n => { const a = perp(n), b = cross(n, a); return (q, up = .25) => { const g = hsh(q + 11) * TAU; return nrm(add(add(mul(a, Math.cos(g)), b, Math.sin(g)), n, up)); }; };
  const holeTag = t => HOLES.find(h => h.tag === t);

  // S1 fix round 3, 2026-11-14: film key chalk_slap_free_above (metres): a chalk_slap puff higher than this stays at its own point (a puff up at the wing skin must not be pulled in front of a character card); no key = as before
  // --- chalk dust: while a stroke lasts, grains fall from the chalk's tip and one thin strand leaves downwind now and then; when the line closes a small flourish drifts off
  //     BESIDE the mark. The mark itself (the ring, the number) is a KEEP mark: no strand ever stands in front of it.
  const strokes = []; { const mk = (k, anc, rising, tag) => { for (const e of evOf(k)) { if (Array.isArray(e.from) || (rising ? !(e.to > e.from) : !(e.to < e.from))) continue; strokes.push({ f0: e.f0, f1: e.f1, p: f => A(anc, f), key: k, tag }); } };
    if (has('chalk_dust')) for (const e of evOf('chalk_dust')) { if (Array.isArray(e.from) && Array.isArray(e.to)) strokes.push({ f0: e.f0, f1: e.f1, p: f => { const u = cl((f - e.f0) / Math.max(1, e.f1 - e.f0)); return add(e.from, sub(e.to, e.from), u); }, key: 'chalk_dust', path: true }); }
    else { mk('chalk', 'last_ring', true, 'last_ring'); mk('finger_ring', 'finger_hole', true, 'finger_hole'); mk('armor_here', 'armor_here', false); mk('tally', 'tally_number', true); } }
  const slaps = pulses('chalk_slap', () => fxOf(/chalk_dust/).map(o => ({ f: o.f, w: 3, p: posOf(o.e), amp: 1 }))).filter(o => o.p);
  const snaps = pulses('chalk_snap', () => fxOf(/chalk_snap/).map(o => ({ f: o.f, w: 2, p: posOf(o.e), amp: 1 }))).filter(o => o.p);
  if (strokes.length || slaps.length || snaps.length) { log.push(`chalk: strokes ${strokes.map(s => s.key + ' f' + s.f0 + '-' + s.f1).join(', ') || 'none'}; slap f ${slaps.map(o => o.f)}; snap f ${snaps.map(o => o.f)}`);
    for (const sk of strokes) { const h = sk.tag && holeTag(sk.tag), n = h ? h.n : null; sk.rho = h ? Math.max(.105, h.r * 1.55 + .045) : sk.key === 'tally' ? .05 : .07; sk.wide = sk.key === 'armor_here';
      if (n) { sk.a = Math.abs(n[2]) > .9 ? [1, 0, 0] : nrm(cross(n, [0, 0, 1])); sk.b = nrm(cross(n, sk.a)); sk.out = n; } else { sk.a = [1, 0, 0]; sk.b = [0, 0, 1]; sk.out = [0, 0, 0]; } }
    const tipOf = (sk, e) => { const c = sk.p(e); if (!c) return null; if (sk.path || sk.wide) return c; if (sk.key === 'tally') return add(c, [(hsh(e * 3.1) - .5) * .05, 0, -.085]);   /* the 9 is small: its dust leaves from under the digit and falls, nothing stands on it */ if (sk.key === 'chalk' && film.chalk_head && Array.isArray(film.chalk_head.pts)) { const P = film.chalk_head.pts; return P[Math.max(0, Math.min(P.length - 1, Math.round(e - film.chalk_head.f0)))]; }   /* S1 2026-11-14, film key chalk_head { f0, pts: one [x, y, z] per frame }: the dust leaves from the head of the real chalk line; no key = the formula below, as before */ const w = (e - sk.f0) / Math.max(1, sk.f1 - sk.f0) * TAU; return add(add(add(c, sk.a, Math.cos(w) * sk.rho), sk.b, Math.sin(w) * sk.rho), sk.out, .02); };
    updaters.push((f, t) => { for (const [si, sk] of strokes.entries()) { if (f < sk.f0 - 1 || f > sk.f1 + 50) continue;
        const c = sk.p(Math.min(f, sk.f1)); if (c && !sk.wide && !sk.path && KEEP.length < 4) KEEP.push({ p: c, r: sk.key === 'tally' ? .085 : sk.rho * 1.12 });
        for (let e = sk.f0; e <= Math.min(f, sk.f1); e++) { const a = f - e; if (a > 42) continue; const tip = tipOf(sk, e); if (!tip) continue;
          const src = q => sk.wide ? add(add(tip, LEFT, (hsh(q + 5) - .5) * .8), NOSE, (hsh(q + 6) - .5) * .2) : add(tip, [(hsh(q + 5) - .5) * .016, (hsh(q + 7) - .5) * .016, (hsh(q + 6) - .5) * .016]);
          motes(si * 91.7 + e * 3.3, a, { n: sk.wide ? 5 : 3, life: 42, at: src, dir: q => nrm([(hsh(q + 8) - .5) * .9, (hsh(q + 9) - .5) * .9, -1]), speed: .011, drag: .1, sink: .0017, size: .0044, col: CHALK, lit: CHALKLIT, sparkle: .5, wind: .8 });
          if (e % 3 === 0) wisps(si * 57.3 + e * 1.9, a, { n: 1, life: 36, at: q => add(src(q), [0, 0, -.025]), dir: q => nrm([.7 + (hsh(q + 8) - .5) * .6, (hsh(q + 9) - .5) * .6, -.9]), speed: .009, drag: .1, sink: .001, l0: .016, l1: .08, thin: .3, col: CHALK, op: .22, k: .5 }); }
        const fa = f - sk.f1, end = sk.p(sk.f1); if (end && fa >= 0 && !sk.wide) { const tipE = tipOf(sk, sk.f1) || end;                // the line closes: the flourish leaves downwind and falls, beside the mark
          wisps(si + 400, fa, { n: sk.key === 'tally' ? 2 : 4, life: 38, at: q => add(tipE, [.02 + .04 * hsh(q + 20), 0, -.03 - .05 * hsh(q + 21)]), dir: q => nrm([.9, (hsh(q + 9) - .5) * .7, -.3 - .5 * hsh(q + 10)]), speed: .017, sink: .001, l0: .022, l1: .11, thin: .3, col: CHALK, op: .22, k: .5 });
          motes(si + 430, fa, { n: 12, life: 40, at: () => tipE, dir: q => nrm([.4 + (hsh(q + 8) - .5), hsh(q + 9) - .5, -.2 - .6 * hsh(q + 10)]), speed: .022, drag: .12, sink: .0017, size: .0044, col: CHALK, lit: CHALKLIT }); } }
      for (const [i, o0] of slaps.entries()) { const a = f - o0.f; if (a < -1 || a > 42) continue; const o = { ...o0, p: (film.chalk_slap_free_above != null && o0.p[2] > film.chalk_slap_free_above) ? o0.p : frontOf(o0.p) }, at = q => add(o.p, [(hsh(q + 20) - .5) * .1, 0, (hsh(q + 21) - .5) * .08]);     // the knee slap: chalk off the palm
        motes(i + 500, a + 1, { n: 26, life: 40, at, dir: q => nrm([hsh(q + 8) - .5 + .3, hsh(q + 9) - .5, hsh(q + 10) * .9 + .2]), speed: .05 * o.amp, drag: .16, sink: .0012, size: .0046, col: CHALK, lit: CHALKLIT });
        wisps(i + 520, a + 1, { n: 4, life: 36, at, dir: q => nrm([hsh(q + 8) - .5 + .35, hsh(q + 9) - .5, hsh(q + 10) * .7 + .15]), speed: .03 * o.amp, sink: .0007, l0: .03, l1: .12, thin: .32, col: CHALK, op: .22, k: .5 });
        grains(i + 510, a, { n: 10, life: 26, at: () => o.p, dir: q => nrm([hsh(q + 8) - .5, hsh(q + 9) - .5, hsh(q + 10) * .9 + .2]), speed: .05, size: .005, col: CHALK, op: .9, k: .85 }); }
      for (const [i, o] of snaps.entries()) { const a = f - o.f, dr = evOf('chalk_drop')[0];
        if (dr && f >= dr.f0 && f < o.f) { let fist = null; try { const hw = window.handWorld && window.handWorld('chief', dr.f0); if (hw && hw.hands) for (const h of hw.hands) if (h && isFinite(h[0]) && (!fist || Math.hypot(h[0] - o.p[0], h[1] - o.p[1]) < Math.hypot(fist[0] - o.p[0], fist[1] - o.p[1]))) fist = h; } catch (e) {}
          const p0 = fist || add(o.p, [0, 0, 1.05]), u = cl((f - dr.f0) / Math.max(1, o.f - dr.f0)), pc = [lerp(p0[0], o.p[0], u), lerp(p0[1], o.p[1], u), lerp(p0[2], o.p[2] + .03, u * u)];   /* chalk_drop: the stick leaves his fist, falls faster and faster, turning, and lands on the snap frame */
          QP.cam(pc, .024, .0075, CHALK, .97, .95, .4 + u * 5.2, .5); }
        if (a < -1 || a > 60) continue; const up = around([0, 0, 1]), fl = o.p[2] + .006, c0 = add(o.p, [0, 0, .02]);   // the chalk breaks on the floor: two sticks tumble and stay, grains hop, a low burst hugs the concrete
        grains(i + 630, a, { n: 2, life: 1e4, stay: 1, chip: 1, at: () => c0, dir: (q, j) => nrm([(j ? -1 : 1) * (.5 + .4 * hsh(q + 8)), (hsh(q + 9) - .5) * .8, .9]), speed: .034, size: .0085, col: CHALK, op: .97, floor: fl, bounce: .32, drag: .02 });
        grains(i + 610, a, { n: 9, life: 30, at: () => c0, dir: q => up(q, .9), speed: .04, size: .0042, col: CHALK, op: .95, k: .9, floor: fl, bounce: .35 });
        motes(i + 600, a + 1, { n: 16, life: 34, at: () => c0, dir: q => up(q, .3), speed: .034, drag: .17, sink: .0018, size: .004, col: CHALK, lit: CHALKLIT, floor: fl, wind: .5 });
        wisps(i + 620, a + 1, { n: 5, life: 30, at: q => add(c0, [(hsh(q + 20) - .5) * .03, (hsh(q + 21) - .5) * .03, .005]), dir: q => up(q, .03), speed: .03, sink: .0002, l0: .022, l1: .1, thin: .4, flat: 1, col: CHALK, op: .26, k: .5, floor: fl + .01, wind: .5 }); } });
  }

  // --- the hook (judge v3, station 1: "two or three holes still giving off a wisp"): the bomber has just come home, so a thin thread of grey smoke still leaves the three biggest
  //     holes that face the hook's lens. It thins out over the first five seconds and is gone before the tire joke. Key: hole_smoke 0..1 (default: 1, fading f 70..150 of the take).
  if (APRON && DAY && HOLES.length && START < 30) { const st0 = ((ranges[0] && ranges[0][2].stations) || []).find(q => Array.isArray(q.pos) && Array.isArray(q.aim));
    const cand = st0 ? HOLES.filter(h => !h.tag && h.r > .035 && h.n[2] > -.25 && dot(h.n, nrm(sub(st0.pos, h.p))) > .2 && len(sub(h.p, st0.aim)) < 4.2).sort((a, b) => b.r - a.r).slice(0, 3) : [];
    if (cand.length) { log.push(`hook: smoke threads from ${cand.length} holes at ${cand.map(h => h.p.map(v => v.toFixed(1)).join(',')).join(' | ')}`); const SMK = lin('#bdb5ac');
      updaters.push((f, t, s) => { const on = cl(s.hole_smoke ?? (1 - ss(START + 70, START + 150, f))); if (on < .01) return;
        cand.forEach((h, i) => { for (let e = Math.floor(f / 6) * 6 - 66; e <= f; e += 6) { const a = f - e; if (a < 0 || a > 66) continue;
            wisps(i * 31.7 + 2000 + e * .371, a, { n: 1, life: 66, at: () => add(h.p, h.n, .03), dir: q => nrm(add(mul(h.n, .45), [hsh(q + 8) * .3 - .15, hsh(q + 9) * .3 - .15, 1])), speed: .013, drag: .05, sink: -.0007, l0: .022, l1: .15, thin: .38, col: SMK, op: .17 * on, k: .6, shade: .7, grow: 16, wind: 1.4 }); } }); }); } }

  // --- the clean cowl: one soft glint slides along the polished band and peaks on the word (a core, one thin warm streak, a small halo; never a star)
  if (APRON && !NIGHT) { const hits = pulses('cowl_glint', () => fxOf(/^glint/).map(o => ({ f: o.f, w: 6, amp: 1 })));
    if (hits.length) { log.push(`cowl glint: pop f ${hits.map(o => o.f)}`); const WARM = [1, .93, .76];
      updaters.push((f, t) => { for (const o of hits) { const a = f - o.f; if (a < -o.w - 1 || a > 16) continue; const C = A('cowl_centre', f), B = A('cowl_band', f) || A('clean_cowl', f); if (!C || !B) continue;
          const v = sub(B, C), th = lerp(-.55, .6, ss(-o.w, 10, a)), kx = cross(NOSE, v), kd = dot(NOSE, v), cs = Math.cos(th), sn = Math.sin(th), r = add(add(mul(v, cs), kx, sn), NOSE, kd * (1 - cs)), p = add(C, r, 1.03);
          const k = (a < 0 ? .3 * ss(-o.w, 0, a) : a === 0 ? 1 : Math.exp(-a / 3.6)) * o.amp; QP.cam(p, .045 + .065 * k, .045 + .065 * k, WARM, 1.7 * k, 0, 0, .12); QP.cam(p, .3 + .52 * k, .009, WARM, 1.1 * k * k); QP.cam(p, .16 + .2 * k, .028, WARM, .3 * k); QP.cam(p, .3, .3, GOLD, .2 * k); } }); } }   /* round 3 (judge, stations 2 and 31): a larger glint, its streak 1.6 m long at the pop (was 0.8 m): a core, ONE thin streak, a short soft sheen under it, a halo */

  // --- the tire patch: a RING of dust jumps off the rubber around the palm: grains fly out along the sidewall, short strands stand along the ring and widen with it, then
  //     everything hangs and sinks. The patch is a KEEP mark: nothing covers it, and nothing reaches the faces.
  if (APRON) { const hits = pulses('tire_dust', () => evOf('patch').filter(e => e.to > e.from).map(e => ({ f: Math.round((e.f0 + e.f1) / 2), w: 2, amp: 1 })).concat(evOf('patch').length ? [] : fxOf(/dust_ring/).map(o => ({ f: o.f, w: 2, amp: 1 }))));
    if (hits.length) { log.push(`tire dust: pop f ${hits.map(o => o.f)}`);
      updaters.push((f, t) => { for (const [i, o] of hits.entries()) { const a = f - o.f; if (a < -1 || a > 48) continue; const c = o.p || A('tire_patch', o.f), wc = A('wheel', o.f); if (!c) continue; const n = wc ? nrm(sub(c, wc)) : [0, -1, 0], ring = around(n), a1 = perp(n), b1 = cross(n, a1), R0 = .135;
          if (KEEP.length < 4) KEEP.push({ p: add(c, n, .02), r: .1 });
          const rim = (q, j, N) => { const g = j / N * TAU + hsh(q + 30) * .5; return [add(add(add(c, n, .03), a1, Math.cos(g) * R0), b1, Math.sin(g) * R0), add(mul(a1, Math.cos(g)), b1, Math.sin(g)), add(mul(a1, -Math.sin(g)), b1, Math.cos(g))]; };
          if (a >= 0 && a < 9) { const k = a / 9; QD.ring(add(c, n, .02), mul(a1, .16 + .42 * k), mul(b1, .16 + .42 * k), DUST, .14 * (1 - k) * (1 - k) * o.amp, .3, .84, .06 + .08 * k); }       // the air ring: one thin soft ring, 9 frames
          motes(i + 700, a + 1, { n: 64, life: 46, at: (q, j) => rim(q, j, 64)[0], dir: (q, j) => nrm(add(rim(q, j, 64)[1], n, .2 + .45 * hsh(q + 31))), speed: .085 * o.amp, drag: .17, sink: .0012, size: .0056, col: DUST, sparkle: .5 });
          wisps(i + 720, a + 1, { n: 16, life: 44, at: (q, j) => rim(q, j, 16)[0], dir: (q, j) => nrm(add(rim(q, j, 16)[1], n, .22)), speed: .06 * o.amp, drag: .15, sink: .0007, along: (q, j) => rim(q, j, 16)[2], alongK: .22, l0: .035, l1: .12, thin: .36, col: DUST, op: .3, k: .5 });
          grains(i + 710, a, { n: 12, life: 24, at: () => add(c, n, .03), dir: q => ring(q, .6), speed: .06, size: .005, col: DUST, op: .85 }); } }); } }

  // --- the fallen panel: at each of its two bounces grit hops away, grains jump, and a low skirt of thin strands runs out along the concrete (each strand lies across its way out)
  if (APRON) { const hits = pulses('panel_dust', () => { const a = crossUp('panel', .42, 0), b = crossUp('panel', .7, 0), fx = fxOf(/dust_hit/)[0]; return a != null ? [{ f: a, w: 3, amp: 1, tr: .45 }, { f: Math.max(a + 2, b ?? a + 3), w: 2, amp: .55, tr: .78 }] : fx ? [{ f: fx.f - 3, w: 3, amp: 1, tr: .45, p: posOf(fx.e) }, { f: fx.f, w: 2, amp: .55, tr: .78, p: posOf(fx.e) }] : []; });
    if (hits.length) { log.push(`panel dust: pops f ${hits.map(o => o.f)}`);
      updaters.push((f, t) => { for (const [i, o] of hits.entries()) { const a = f - o.f; if (a < -1 || a > 56) continue; const p0 = A('panel_from', o.f), p1 = A('panel_rest', o.f), c = o.p ? [o.p[0], o.p[1], .02] : p0 && p1 ? [lerp(p0[0], p1[0], o.tr ?? (i ? .78 : .45)), lerp(p0[1], p1[1], o.tr ?? (i ? .78 : .45)), .02] : null; if (!c) continue; const up = around([0, 0, 1]);
          const rimP = (q, j, N) => { const g = j / N * TAU + hsh(q + 30); return [add(c, [Math.cos(g) * .24, Math.sin(g) * .3, .03]), [Math.cos(g), Math.sin(g), 0], [-Math.sin(g), Math.cos(g), 0]]; }, NW = Math.round(9 * o.amp) + 3, NM = Math.round(34 * o.amp) + 8;
          motes(i + 800, a + 1, { n: NM, life: 52, at: (q, j) => rimP(q, j, NM)[0], dir: (q, j) => nrm(add(rimP(q, j, NM)[1], [0, 0, 1], .12 + .5 * hsh(q + 22))), speed: .12 * o.amp, drag: .15, sink: .0013, size: .0052, col: DUST });
          wisps(i + 820, a + 1, { n: NW, life: 54, flat: 1, at: (q, j) => rimP(q, j, NW)[0], dir: (q, j) => nrm(add(rimP(q, j, NW)[1], [0, 0, 1], .02)), speed: .1 * o.amp, drag: .13, sink: .0002, along: (q, j) => rimP(q, j, NW)[2], alongK: .3, l0: .07, l1: .3, thin: .36, col: DUST, op: .3 * (.6 + .4 * o.amp), k: .45, floor: .03, grow: 11 });
          wisps(i + 840, a + 1, { n: Math.round(6 * o.amp) + 2, life: 48, at: (q, j) => add(rimP(q, j, 8)[0], [0, 0, .04]), dir: (q, j) => nrm(add(rimP(q, j, 8)[1], [0, 0, 1], .5 + .6 * hsh(q + 23))), speed: .07 * o.amp, drag: .15, sink: .0005, l0: .04, l1: .17, thin: .36, col: DUST, op: .22, k: .45 });
          grains(i + 810, a, { n: Math.round(12 * o.amp) + 3, life: 30, at: q => add(c, [(hsh(q + 20) - .5) * .25, (hsh(q + 21) - .5) * .3, .02]), dir: q => up(q, .8), speed: .06 * o.amp, size: .006, col: lin('#bdb2a0'), op: .95, k: .95 });
          if (a >= 0 && a < 8) QD.ring([c[0], c[1], .014], [.2 + .55 * a / 8, 0, 0], [0, .2 + .55 * a / 8, 0], DUST, .2 * o.amp * (1 - a / 8), .4, .84, .1); } }); } }

  // --- the scale's hit: the deck drops and squeezes the dust out along its four edges: a thin strand lies along each edge and runs out over the floor, grains jump, grit hops
  if (HANGAR) { const hits = pulses('scale_hit', () => { const f = crossUp('needle', 1.06, 0), fx = fxOf(/dust_hit/)[0]; return f != null ? [{ f, w: 3, amp: 1 }] : fx ? [{ f: fx.f, w: 3, amp: 1 }] : []; });
    const dk = scene.getObjectByName('scale_deck_plate'); let half = .8; if (dk && dk.geometry) { dk.geometry.computeBoundingBox(); const b = dk.geometry.boundingBox; half = Math.max(.3, (b.max.x - b.min.x) / 2); }
    let EDGE = 1.22; { const fr = scene.getObjectByName('scale_pit_frame') || scene.getObjectByName('scale_frame') || scene.getObjectByName('scale_deck_edge'); if (fr) { const bx = new THREE.Box3().setFromObject(fr), w = (bx.max.x - bx.min.x) / 2; if (w > half && w < half * 1.8) EDGE = w / half + .03; } }   // dust leaves from the OUTER edge of the frame round the deck, not from inside the steel
    if (hits.length) { log.push(`scale hit: pop f ${hits.map(o => o.f)}, deck half ${half.toFixed(2)}, edge x${EDGE.toFixed(2)}`);
      updaters.push((f, t) => { for (const [i, o] of hits.entries()) { const a = f - o.f; if (a < -1 || a > 56) continue; const c = o.p || A('scale', o.f); if (!c) continue;
          const edge = (q, j) => { const sd = j % 4, u = (hsh(q + 40) - .5) * 2 * half, ex = sd === 0 ? half : sd === 1 ? -half : u, ey = sd === 2 ? half : sd === 3 ? -half : u; return [[c[0] + ex * EDGE, c[1] + ey * EDGE, .03], sd === 0 ? [1, 0, 0] : sd === 1 ? [-1, 0, 0] : sd === 2 ? [0, 1, 0] : [0, -1, 0], sd < 2 ? [0, 1, 0] : [1, 0, 0]]; };
          motes(i + 900, a + 1, { n: 52, life: 50, at: (q, j) => edge(q, j)[0], dir: (q, j) => nrm(add(edge(q, j)[1], [(hsh(q + 41) - .5) * .5, (hsh(q + 42) - .5) * .5, .25 + .45 * hsh(q + 43)])), speed: .085 * o.amp, drag: .16, sink: .0013, size: .005, col: DUST });
          wisps(i + 920, a + 1, { n: 16, life: 52, flat: 1, at: (q, j) => edge(q, j)[0], dir: (q, j) => nrm(add(edge(q, j)[1], [0, 0, 1], .02)), speed: .075 * o.amp, drag: .13, sink: .0002, along: (q, j) => edge(q, j)[2], alongK: .15, l0: .1, l1: .3, thin: .34, col: DUST, op: .24, k: .45, floor: .03, grow: 10 });
          wisps(i + 940, a + 1, { n: 8, life: 46, at: (q, j) => add(edge(q, j)[0], [0, 0, .04]), dir: (q, j) => nrm(add(edge(q, j)[1], [0, 0, 1], .55 + .5 * hsh(q + 47))), speed: .05 * o.amp, drag: .15, sink: .0005, l0: .04, l1: .16, thin: .36, col: DUST, op: .22, k: .45 });
          grains(i + 910, a, { n: 26, life: 28, at: (q, j) => { const e = edge(q, j); return add(e[0], e[1], .05 + .5 * hsh(q + 44)); }, dir: q => nrm([(hsh(q + 45) - .5) * .5, (hsh(q + 46) - .5) * .5, 1]), speed: .05, size: .005, col: lin(DAY ? '#cbbf9f' : '#8f9bc0'), op: .95, k: .95, bounce: .3 });
          if (a >= 0 && a < 9) QD.ring([c[0], c[1], .015], [half * (1.05 + .75 * a / 9), 0, 0], [0, half * (1.05 + .75 * a / 9), 0], DUST, .16 * (1 - a / 9), .4, .9, .06); } }); } }

  // --- the trash barrel's lid: as it lifts, old dust slides off its rim: a few strands curl up and drift, grains sink past the rim and catch the lantern
  if (HANGAR) { const hits = pulses('lid_dust', () => { const f = crossUp('barrel_lid', .3, 0), fx = fxOf(/dust_puff/)[0]; return f != null ? [{ f, w: 3, amp: 1 }] : fx ? [{ f: fx.f, w: 3, amp: 1 }] : []; });
    if (hits.length) { log.push(`lid dust: pop f ${hits.map(o => o.f)}`); const WARM = NIGHT ? [lerp(DUST[0], AMBER[0], .45), lerp(DUST[1], AMBER[1], .45), lerp(DUST[2], AMBER[2], .45)] : DUST;
      updaters.push((f, t) => { for (const [i, o] of hits.entries()) { const a = f - o.f; if (a < -1 || a > 62) continue; const c = o.p || A('barrel', o.f), rim = A('barrel_lid', o.f); if (!c) continue; const top = [c[0], c[1], (rim ? Math.min(rim[2], c[2] + .1) : c[2]) + .02], up = around([0, 0, 1]);
          const rimP = (q, j, N) => { const g = j / N * TAU + hsh(q + 30); return add(top, [Math.cos(g) * .24, Math.sin(g) * .24, 0]); };
          motes(i + 1000, a + 1, { n: 22, life: 56, at: (q, j) => rimP(q, j, 22), dir: q => up(q, .9), speed: .03 * o.amp, drag: .1, sink: .0009, size: .0046, col: WARM, lit: NIGHT ? AMBER : LIT, sparkle: .6, wind: .6, floor: .012 });
          wisps(i + 1020, a + 1, { n: 6, life: 58, at: (q, j) => rimP(q, j, 6), dir: q => up(q, 1.5), speed: .024 * o.amp, drag: .1, sink: -.00025, l0: .035, l1: .15, thin: .3, col: WARM, op: .2, k: .4, wind: .6, grow: 12 }); } }); } }

  // --- rivet sparks at dawn: thin hot streaks that fan off the plate, fall, bounce and die; each burst throws its light on the cowl
  if (APRON && (DAWN || DAY)) { const hits = pulses('rivet_sparks', () => { const sp = fxOf(/spark/)[0]; return sp ? [{ f: sp.f - 6, w: 2, amp: .55 }, { f: sp.f, w: 2, amp: 1 }, { f: sp.f + 6, w: 2, amp: .8 }, { f: sp.f + 13, w: 2, amp: .6 }] : []; });
    if (hits.length) { const lgt = pointLight('fx_rivet_light', '#ffb060', 4.5, 1.7); log.push(`rivet sparks: pops f ${hits.map(o => o.f)}`);
      updaters.push((f, t) => { let li = 0, lp = null, lpN = null; for (const [i, o] of hits.entries()) { const a = f - o.f; if (a < -2 || a > 34) continue; const c = o.p || A('cowl_plate', o.f) || A('clean_cowl', o.f), cc = A('cowl_centre', o.f); if (!c) continue; const n = cc ? nrm(sub(c, cc)) : [0, -1, 0], src = add(c, n, .05); let away = [0, 0, 0]; for (const cd of findCards()) { const cp = P3(cd.position), dv = [src[0] - cp[0], src[1] - cp[1], 0], dl = len(dv); if (dl < 2.2 && dl > .01) away = add(away, dv, (2.2 - dl) / dl); }   /* the fan leans away from every figure within 2.2 m: no spark crosses a face */
          const fan = around(nrm(add(add(n, [0, 0, .1]), len(away) > .01 ? nrm(away) : [0, 0, 0], 1.1)));
          // build: two frames of first contact (a few thin sparks, a small glow) · pop: the fan and the flash · settle: the grains bounce on the concrete and go dark
          if (a < 0) { QP.cam(src, .03, .03, [1, .8, .5], .9 * (a === -1 ? 1 : .5)); grains(i + 1120, a + 2, { n: 4, life: 8, at: () => src, dir: q => fan(q, 1.4), speed: .09, size: .0035, hot: 1, I: .7 }); li = Math.max(li, .25 * (a + 3) / 2); lp = src; lpN = n; continue; }
          grains(i + 1100, a + 1, { n: Math.round(95 * o.amp) + 12, life: 26, at: () => src, dir: q => fan(q, .8 + 1.8 * hsh(q + 50)), speed: .19 * (.7 + .3 * o.amp), size: .013, hot: 1, drag: .06, bounce: .34, I: o.amp });
          if (a < 6) { const k = Math.exp(-a / 1.7) * o.amp; const fp = add(c, n, .22); QP.cam(fp, .1 + .18 * k, .1 + .18 * k, [1, .78, .46], 1.5 * k, 0, 0, .12); QP.cam(fp, .75, .75, AMBER, .42 * k); QP.cam(fp, .3 + .3 * k, .014, [1, .86, .6], .8 * k * k); }
          wisps(i + 1150, a - 1, { n: 3, life: 32, at: () => add(src, n, .04), dir: q => nrm(add(n, [hsh(q + 8) - .5, hsh(q + 9) - .5, .9])), speed: .016, sink: -.0005, l0: .025, l1: .11, thin: .3, col: lin('#cfc6c0'), op: .15, k: .5 });   // a thread of grey smoke off the rivet
          li = Math.max(li, Math.exp(-a / 2.4) * o.amp); lp = src; lpN = n; }
        lgt.intensity = 3.6 * li; /* 0.6 m off the plate: about +0.8 on the cowl paint at the pop, never more than 2.7 on anything white */ if (lp && lpN) lgt.position.copy(T3(add(lp, lpN, .6))); }); } }

  // =====================================================================================================================
  // 6. AIR. The kit gives the soft motes near the lens in every place. Where a place had no layer of its own, one is added here.
  // =====================================================================================================================
  if (ROW) { const aims = ranges.flatMap(r => (r[2].stations || []).map(st => st.aim).filter(Array.isArray)), c = aims.length ? mul(aims.reduce((a, b) => add(a, b), [0, 0, 0]), 1 / aims.length) : A('tally') || [16.5, 2.8, 1.3], MIST = lin('#8ea6e6');                // dusk: low wisps of evening mist that crawl over the concrete, and midges that dance in the last light
    log.push('air: dusk mist wisps + midges');
    updaters.push((f, t) => { for (let j = 0; j < 22; j++) { const q = j * 4.13, x = c[0] - 16 + ((hsh(q) * 46 + t * (.16 + .1 * hsh(q + 1))) % 46), y = c[1] - 5 + hsh(q + 2) * 22, w = 2.2 + 3 * hsh(q + 3); QP.wisp([x, y, .22 + .25 * hsh(q + 4) + .05 * Math.sin(t * .4 + q)], [w, w * .25 * (hsh(q + 5) - .5), 0], w * .17, MIST, .3 * (.6 + .4 * Math.sin(t * .23 + q)) * ss(0, 4, x - (c[0] - 16)) * ss(0, 4, c[0] + 30 - x), .35, hsh(q + 6) * 7 + .1, .2 + .15 * Math.sin(t * .11 + q)); }
      for (let j = 0; j < 26; j++) { const q = j * 2.91 + 7, w = 1.6 + 1.5 * hsh(q), p = [c[0] + 1.2 + Math.sin(t * w + q * 3) * (.35 + .5 * hsh(q + 1)) + Math.sin(t * .31 + q) * .5, c[1] + .6 + Math.cos(t * w * 1.13 + q) * (.3 + .4 * hsh(q + 2)), 1.75 + .5 * hsh(q + 3) + Math.sin(t * w * .7 + q * 2) * .22]; QP.cam(p, .013, .013, lin('#dfe6ff'), 1.2 * (.5 + .5 * Math.sin(t * 9 + q)), 0, 0, .2); } });
  }

  // ---------- frame ----------
  const update = (f, t, state) => { const s = state || {}; for (const o of OVERLAYS.values()) o.m.visible = false; KEEP.length = 0; QD.begin(); CN.begin(); QP.begin(); for (const u of updaters) u(f, t, s); QD.end(); CN.end(); QP.end(); };
  if (film.fx_debug) { scene.updateMatrixWorld(true); const bl = []; scene.traverse(o => { if (/^armor_plate_bolt|^tread/.test(o.name || '')) { const v = new THREE.Vector3(); o.getWorldPosition(v); let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) vis = false; bl.push([o.name, +v.x.toFixed(3), +(-v.z).toFixed(3), +v.y.toFixed(3), vis]); } }); console.warn('fx_armor.js S5 debug bolts and treads (plan m) ' + JSON.stringify(bl)); }   // S5 (animator): film.fx_debug only, prints where the plate bolts and ladder treads are
  if (film.fx_debug) console.warn('fx_armor.js anchors [' + placeName + '] ' + JSON.stringify(Object.fromEntries(['last_ring', 'finger_hole', 'armor_here', 'tally_number', 'tire_patch', 'wheel', 'panel_from', 'panel_rest', 'scale', 'barrel', 'hole_light', 'cowl_plate', 'cowl_band', 'cowl_centre', 'map', 'clean_cowl'].map(k => [k, (A(k, START) || []).map(v => +v.toFixed(2))]))) + ' out ' + JSON.stringify(Object.fromEntries(Object.entries(outAnchors).map(([k, v]) => [k, (typeof v === 'function' ? v(START + 70) : v).map(x => +x.toFixed(2))]))));
  console.warn(`fx_armor.js [${placeName}, ${TIME}]: ${log.join(' | ') || 'no effect in this place'}${words.length ? '' : ' | words.json not read: word defaults are off'}`);
  return { update, anchors: outAnchors };
}
