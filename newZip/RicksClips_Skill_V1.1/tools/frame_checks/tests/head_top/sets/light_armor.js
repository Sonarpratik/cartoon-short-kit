// LIGHT AND COLOUR module for "Armor Where Nobody Shot" (lighting-director, fix round v2, 2026-11-13).
// Joined by sets/airfield.js in its light section (guarded: if this file is missing or throws, the set renders as before).
//   export async function buildLight(THREE, scene, film, ctx, world) -> { update(f, t, state), anchors }
//   world = { TIME, placeName, place, B2T, stateAt, lanternBase(state, f), LAN_H, skip: [Object3D...] (movers that get no baked contact patch) }
// What it does, all in the coded frame (CB: light and brightness are FINISHED here, Blender keeps them):
//   1 SKY      the kit's dome gets a painted sky: deep above, pale at the horizon, soft clouds lit from the key side (layered noise, no cards),
//              a warm band at dusk and dawn. Colours: light_over.top / light_over.hor (so sky and fog always agree) + place.sky { mid, cloud, ... }.
//   2 HAZE     two far haze steps (soft rings at 150 m and 300 m in the horizon colour) on top of the scene fog: the far field lifts in steps.
//   3 SHADOWS  every character card throws ONE hard, full-figure shadow from the key: a hidden copy of the card turned to the key casts it
//              (CB_RULES 6b SHADOW PASS; the card itself faces the lens and would cast a sliver). The copy is never drawn in a camera pass.
//   4 CONTACT  a tight dark patch under every sole (read from the drawing: whatever touches the ground line), and a baked soft patch under
//              every prop, wheel, chock, crate leg and along wall-floor lines (CB_RULES 3 CONTACT SHADOW). Never a big grey oval.
//   5 LANTERN  the signature light: a soft warm pool on the ground under the lantern, and when the Chief carries it (performance plan:
//              prop "lantern") the light walks with him. anchors.lantern_light feeds the kit's card_shade, so the warm side lands on the FACES.
// Measured on Rick (refs B2b.2 railroads, B1.4 cannon, B2a.1 horse race): the shadow at the foot is 0.40-0.50 of the lit ground's brightness,
// about one foot long and 2-3 leg widths wide, soft edge within a few cm. Numbers used below: patch darkness .55, half depth 7 cm.

let PERF_CACHE = null;
async function loadPerf() {
  if (PERF_CACHE) return PERF_CACHE;
  try { const r = await fetch(new URL('../out/plan/performance_baked.json', import.meta.url)); if (!r.ok) throw new Error(String(r.status)); PERF_CACHE = await r.json(); } catch (e) { PERF_CACHE = {}; }
  return PERF_CACHE;
}

export async function buildLight(THREE, scene, film, ctx, world) {
  const { TIME, B2T, place: pl = {} } = world, DARK = TIME === 'night' || TIME === 'dusk', L = ctx.light || {}, PI = Math.PI, V3 = THREE.Vector3;
  const cfg = { sky: true, haze: true, card_shadow: true, contact: true, prop_ao: true, pool: true, ...(pl.lighting || {}) };
  const col = (c, k = 1) => new THREE.Color(c).multiplyScalar(k);
  const sun = scene.children.find(o => o.isDirectionalLight);
  const sunVec = () => sun ? sun.position.clone().sub(sun.target.position).normalize() : new V3(-8, 4.6, 4.5).normalize();

  // ------------------------------------------------------------------ 1 SKY
  const SKYD = {
    day:   { mid: '#9cc3ea', cLit: '#fffaf0', cShade: '#b4bedf', cover: .47, soft: .2, cloudA: .94, band: null, bandK: 0, glow: .55, sunCol: '#fff0cc' },
    dawn:  { mid: '#e7b9c6', cLit: '#ffe6cf', cShade: '#b792bd', cover: .47, soft: .24, cloudA: .9, band: '#ffb27a', bandK: .55, glow: 1.2, sunCol: '#ffc79a' },
    dusk:  { mid: '#4c68ae', cLit: '#e39a8c', cShade: '#2f4690', cover: .5, soft: .22, cloudA: .85, band: '#ff9650', bandK: .9, glow: 0, sunCol: '#ffb080' },
    night: { mid: '#2c52a8', cLit: '#93abe6', cShade: '#1d3a84', cover: .53, soft: .22, cloudA: .75, band: null, bandK: 0, glow: 0, sunCol: '#a9c0ff' },
  }[TIME], SK = { ...SKYD, ...(pl.sky || {}) };
  let skyMat = null;
  if (cfg.sky) {
    const dome = scene.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry' && o.material && o.material.side === THREE.BackSide && o.material.vertexColors);
    if (dome) {
      skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
        uniforms: { zen: { value: col(L.top || '#3684d1') }, mid: { value: col(SK.mid) }, hor: { value: col(L.hor || '#f2e2c2') }, cLit: { value: col(SK.cLit) }, cShade: { value: col(SK.cShade) }, band: { value: col(SK.band || '#000000') },
          sunCol: { value: col(SK.sunCol) }, sunDir: { value: sunVec() }, t: { value: 0 }, cover: { value: SK.cover }, soft: { value: SK.soft }, cloudA: { value: SK.cloudA }, bandK: { value: SK.bandK }, glow: { value: SK.glow } },
        vertexShader: 'varying vec3 vDir; void main(){ vec4 wp = modelMatrix * vec4(position, 1.); vDir = wp.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * wp; }',
        fragmentShader: `uniform vec3 zen, mid, hor, cLit, cShade, band, sunCol, sunDir; uniform float t, cover, soft, cloudA, bandK, glow; varying vec3 vDir;
          float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
          float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.3); a *= .5; } return s; }
          float cloud(vec2 p){ vec2 w = vec2(fbm(p * .45 + 4.1), fbm(p * .45 + 9.7)) - .5; return fbm(p * .5 + w * 1.1 + vec2(t * .006, 0.)) * .8 + fbm(p * 1.7 + 3.7) * .2; }   // big soft shapes, bent by a slow warp, a little fine edge
          void main(){
            vec3 d = normalize(vDir); float h = max(d.y, 0.);
            vec3 c = mix(hor, mid, smoothstep(0., .2, h)); c = mix(c, zen, smoothstep(.1, .82, h));                    // pale horizon, deep above
            vec2 sh = normalize(sunDir.xz + vec2(1e-4)); float toSun = .5 + .5 * dot(normalize(d.xz + vec2(1e-4)), sh);
            c = mix(c, band, bandK * exp(-h * 11.) * (.45 + .55 * toSun * toSun));                                   // the warm line on the horizon (dusk, dawn)
            float sd = max(dot(d, normalize(sunDir)), 0.); c += sunCol * glow * (pow(sd, 5.) * .22 + pow(sd, 48.) * .5);
            if (d.y > .012) { vec2 p = d.xz / (d.y + .2) * 3.1; float n = cloud(p), dens = smoothstep(cover, cover + soft, n);
              float lit = clamp(.5 + (n - cloud(p + sh * .26)) * 4.2, 0., 1.), thick = smoothstep(cover, cover + soft * 2.6, n);
              vec3 cc = mix(cShade, cLit, lit * (1. - .4 * thick)); cc = mix(cc, band, bandK * .5 * exp(-h * 5.));
              c = mix(c, cc, dens * cloudA * smoothstep(.015, .15, d.y)); }
            if (d.y < 0.) c = hor;
            gl_FragColor = vec4(c, 1.); }` });
      dome.material = skyMat; dome.name = 'sky_dome_painted';
    }
  }

  // ------------------------------------------------------------------ 2 HAZE STEPS
  if (cfg.haze) {
    const hz = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.7)'); gr.addColorStop(.6, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const K = { day: [.3, .46], dawn: [.42, .6], dusk: [.26, .4], night: [.24, .38] }[TIME], hc = pl.haze_color || L.hor || '#f2e2c2', hk = pl.haze ?? 1;
    for (const [r, hgt, a] of [[150, 16, K[0]], [300, 34, K[1]]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 72, 1, true), new THREE.MeshBasicMaterial({ map: hz, color: hc, side: THREE.BackSide, transparent: true, opacity: a * hk, depthWrite: false, fog: false })); m.position.set(20, hgt / 2 - .5, -30); m.name = 'haze_step'; m.userData.noExport = true; m.renderOrder = -2; scene.add(m); }
  }

  // ------------------------------------------------------------------ 2b AIR VEIL: the haze that lifts the darkest tones of the WORLD (CB_RULES 6b: darkest 1 % at 0.08-0.15, never crushed black).
  // The kit's tone curve pulls dark tones toward zero; this adds a faint layer of the air's colour over the set only: it is drawn before the character cards, so their ink stays crisp.
  // v3 (2026-11-13): by day and dawn the veil is a SCREEN blend (dark tones take all of it, bright tones almost none) and twice as strong and bluer: the kit's tone curve has a toe that pulls anything under 0.03 (linear) to black,
  // so the v2 veil left tyres and blades at 0.03-0.05 and the day shade warm. Measured target: darkest 1 % 0.08-0.15, dark-zone b* -9 to -15 (Rick's day frames). Night and dusk keep the v2 veil (the judge: night blue and readable).
  { const vk = pl.veil ?? { day: .07, dawn: .058, dusk: .036, night: .044 }[TIME], vc = col(pl.veil_color || { day: '#7fa6ff', dawn: '#b9b4f6', dusk: '#7f9bd6', night: '#7896d4' }[TIME], vk), screen = (pl.veil_mode || (DARK ? 'add' : 'screen')) === 'screen';
    if (vk > 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { c: { value: vc } }, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false,
        ...(screen ? { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneMinusDstColorFactor, blendDst: THREE.OneFactor } : { blending: THREE.AdditiveBlending }),
        vertexShader: 'void main(){ gl_Position = vec4(position.xy, .5, 1.); }', fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.); }' }));
      m.frustumCulled = false; m.renderOrder = -2; m.position.y = -3000; m.name = 'air_veil'; m.userData.noExport = true; m.castShadow = m.receiveShadow = false; scene.add(m); } }

  // ------------------------------------------------------------------ 2d CORNERS: the kit's vignette darkens the top and bottom BANDS of a tall frame (its mask is squeezed sideways), which dulls the sky.
  // This one is round: only the four corners fall off (Rick: corner / centre 0.45-1.0 on single frames, 0.67 film median). World only, like the veil; the place's post.vignette is lowered to match.
  { const ck = pl.corner ?? { day: .46, dawn: .46, dusk: .42, night: .42 }[TIME];
    if (ck > 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { k: { value: ck } }, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false,
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
        vertexShader: 'varying vec2 vU; void main(){ vU = position.xy; gl_Position = vec4(position.xy, .5, 1.); }', fragmentShader: 'uniform float k; varying vec2 vU; void main(){ float r = length(vU) / 1.41421; float m = smoothstep(.52, 1., r); gl_FragColor = vec4(vec3(1. - k * m), 1.); }' }));
      m.frustumCulled = false; m.renderOrder = -3;   /* v3: before the veil (-2), so the darkest tones in the corners are lifted too */ m.position.y = -3000; m.name = 'lens_corners'; m.userData.noExport = true; m.castShadow = m.receiveShadow = false; scene.add(m); } }

  // the bounce from below: the kit's sky light has a brown ground colour, which turns every downward face (wing undersides, eaves) brown in the shade. Rick's shade is blue-violet (dark-zone b* -9 to -15 by day).
  { const hemi = scene.children.find(o => o.isHemisphereLight); if (hemi) hemi.groundColor.set(pl.bounce_color || { day: '#8a8ca6', dawn: '#8e80a4', dusk: '#5a72ac', night: '#5a7abc' }[TIME]); }

  // ------------------------------------------------------------------ 2e WARM GROUND BOUNCE (v3): the sunlit apron throws warm light UP under the hero bomber's wing and belly, so the under-wing frames are a warm shade,
  // not a dark one (lead fix 17: about 0.42 mean). Small lights that lie ON the sunlit concrete just outside the wing's shadow, on the key's side; no shadows. Sky-facing ground in the shade stays blue (the sky fills it).
  // place key ground_bounce: false | [{ at: [x, y, z] plan, color, i, range, decay }].
  { const GB = pl.ground_bounce ?? (/hangar|row/.test(world.placeName) ? null : { day: [{ at: [5.2, 3.2, .1], color: '#ffdcb0', i: 2.0, range: 13, decay: 1.5 }, { at: [9.4, 4.6, .1], color: '#ffdcb0', i: 1.5, range: 11, decay: 1.5 }],
        dawn: [{ at: [5.2, 3.2, .1], color: '#ffd2b4', i: .55, range: 13, decay: 1.5 }, { at: [9.4, 4.6, .1], color: '#ffd2b4', i: .4, range: 11, decay: 1.5 }] }[TIME]);   /* v3c: weaker at dawn (was 1.6 and 1.2): the wing underside stays a cool lilac shade, so the chalk words ARMOR HERE read white on it */
    for (const b of GB || []) { const l = new THREE.PointLight(b.color || '#ffd7a2', b.i ?? 4, b.range ?? 12, b.decay ?? 1.5); l.position.copy(B2T(b.at)); l.castShadow = false; l.name = 'ground_bounce_light'; l.userData.noExport = true; l.userData.ld_bounce = true; scene.add(l); } }

  // ------------------------------------------------------------------ 2c FOREGROUND SHADE: a soft cloud shadow lies over the empty camera strip (plan y below about 2), so the lit subject stands behind a darker,
  // cooler foreground (CB_RULES: 'dark roofs and shadow areas next to bright sunlit ground, not every surface bright'; depth: darker near, pale far). Day and dawn only; it drifts slowly with the clouds.
  let fgMat = null; { const A = pl.fg_shade ?? { day: .5, dawn: .44, dusk: 0, night: 0 }[TIME];
    if (A > 0) { fgMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -.25, polygonOffsetUnits: -3, toneMapped: false,
        uniforms: { c: { value: col(pl.fg_shade_color || (TIME === 'dawn' ? '#3a2f5c' : '#27325e')) }, A: { value: A }, t: { value: 0 }, y0: { value: pl.fg_shade_y ?? 2.5 } },
        vertexShader: 'varying vec3 vW; void main(){ vec4 wp = modelMatrix * vec4(position, 1.); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
        fragmentShader: `uniform vec3 c; uniform float A, t, y0; varying vec3 vW;
          float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
          float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.3); a *= .5; } return s; }
          void main(){ float py = -vW.z, px = vW.x + t * .12; float edge = y0 + (fbm(vec2(px * .11, py * .11 + 3.)) - .5) * 3.2; float a = 1. - smoothstep(edge - 1.1, edge + 1.3, py);
            a *= .72 + .28 * fbm(vec2(px * .05 + 7., py * .07)); a *= smoothstep(-9.5, -8., py); gl_FragColor = vec4(c, a * A); }` });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 16).rotateX(-PI / 2), fgMat); m.position.copy(B2T([30, -2.5, .011])); m.name = 'cloud_shadow_foreground'; m.userData.noExport = true; m.renderOrder = 2; m.castShadow = m.receiveShadow = false; scene.add(m); } }

  // ------------------------------------------------------------------ 6 GLINTS: metal and glass answer the key and the lantern with a real highlight (a tight glint and a soft sheen, from the light's direction,
  // the surface normal and the lens), so about 1-2 % of the frame carries small bright accents (CB_RULES RICK FINISH). The kit's toon material has no highlight of its own; this adds one to the set's metal and glass.
  let nSpec = 0; if (cfg.glints !== false) { const K = pl.glint ?? { day: 1, dawn: 1.1, dusk: .8, night: .8 }[TIME], seen = new Set();
    scene.traverse(o => { if (!o.isMesh || !o.material || !o.material.isMeshToonMaterial) return; const role = o.userData.role, mt = String(o.userData.mat || ''); if (role !== 'metal' && role !== 'glass' && !/alumin|chrome|steel|brass|enamel|glass|paint_gloss|glaz|ceramic|porcelain/.test(mt)) return;
      const m = o.material; if (seen.has(m)) return; seen.add(m); const glaze = /glaz|ceramic|porcelain/.test(mt), glass = !glaze && (role === 'glass' || /glass|chrome|polished/.test(mt)), bare = /bare_alumin|polished|chrome|steel|brass|copper|enamel|glaz|ceramic/.test(mt), lum = m.color ? (m.color.r * .2126 + m.color.g * .7152 + m.color.b * .0722) : .5, RK = pl.rim_glint ?? { day: 1, dawn: 1.1, dusk: .7, night: .7 }[TIME],
        small = /rivet|bolt|nail|screw|stud/.test(mt + ' ' + o.name),   /* v3: small hardware (rivet rows, bolts) sparkles: a wide lobe, so one facet of each head answers the key, and it keeps a little of it in a cast shadow (the bright low sky still reflects) */
        k2 = small ? new THREE.Vector4(2.2 * K, 0, 0, -(pl.rivet_lobe ?? 7)) : new THREE.Vector4((glass ? 3.2 : glaze ? 1.1 : 1.7 + lum * 2.) * K, (glass ? .14 : glaze ? .1 : .06 + lum * .16) * K, (glass ? .32 : glaze ? .2 : bare ? .26 : .03 + lum * .14) * RK, 150);   /* v3: z = the bright line along the lit edge of round metal (a streak on a cowl lip, a strut, a blade, a mug rim) */
      m.onBeforeCompile = sh => { sh.uniforms.ldK = { value: k2 }; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', 'uniform vec4 ldK;\n#include <common>').replace('#include <opaque_fragment>', `{ vec3 ldN = normalize(normal), ldV = normalize(vViewPosition); float ldP = abs(ldK.w), ldH = step(ldK.w, 0.), ldE = pow(1. - clamp(dot(ldN, ldV), 0., 1.), 5.) * smoothstep(.006, .035, length(fwidth(ldN)));   // ldE: only the last few per cent of a ROUND form before its silhouette (the normal must be turning: a flat panel seen at a low angle gets none)
          #if NUM_DIR_LIGHTS > 0
            { vec3 ldL = directionalLights[0].direction; float nh = max(dot(ldN, normalize(ldL + ldV)), 0.), nl = dot(ldN, ldL), ldS = 1.;
              #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
                ldS = getShadow(directionalShadowMap[0], directionalLightShadows[0].shadowMapSize, directionalLightShadows[0].shadowBias, directionalLightShadows[0].shadowRadius, vDirectionalShadowCoord[0]);   // v3: no sun glint inside a cast shadow
              #endif
              outgoingLight += directionalLights[0].color * mix(ldS, mix(.1, 1., ldS), ldH) * ((pow(nh, ldP) * ldK.x + pow(nh, 22.) * ldK.y) * smoothstep(0., .12, nl) + ldE * ldK.z * smoothstep(-.15, .45, nl)); }
          #endif
          #if NUM_POINT_LIGHTS > 0
            for (int i = 0; i < NUM_POINT_LIGHTS; i++) { vec3 lv = pointLights[i].position + vViewPosition; float ld = length(lv); vec3 ldL = lv / max(ld, 1e-4); float nh = max(dot(ldN, normalize(ldL + ldV)), 0.), nl = dot(ldN, ldL);
              outgoingLight += min(pointLights[i].color * getDistanceAttenuation(ld, pointLights[i].distance, pointLights[i].decay) * ((pow(nh, mix(90., ldP, ldH)) * ldK.x * mix(.9, 3., ldH) + pow(nh, 18.) * ldK.y * 1.4) * smoothstep(0., .12, nl) + ldE * ldK.z * .35 * smoothstep(-.1, .5, nl)), vec3(.55)); }
          #endif
          #if NUM_SPOT_LIGHTS > 0
            for (int i = 0; i < NUM_SPOT_LIGHTS; i++) { vec3 lv = spotLights[i].position + vViewPosition; float ld = length(lv); vec3 ldL = lv / max(ld, 1e-4); float nh = max(dot(ldN, normalize(ldL + ldV)), 0.), nl = dot(ldN, ldL), cone = getSpotAttenuation(spotLights[i].coneCos, spotLights[i].penumbraCos, dot(ldL, spotLights[i].direction));
              outgoingLight += min(spotLights[i].color * cone * getDistanceAttenuation(ld, spotLights[i].distance, spotLights[i].decay) * ((pow(nh, mix(90., ldP, ldH)) * ldK.x * mix(.9, 2., ldH) + pow(nh, 18.) * ldK.y * 1.4) * smoothstep(0., .12, nl) + ldE * ldK.z * .6 * smoothstep(-.1, .5, nl)), vec3(.45)); }
          #endif
          }
          #include <opaque_fragment>`); };
      m.customProgramCacheKey = () => 'ld_glint3c'; m.needsUpdate = true; nSpec++; }); }

  // ------------------------------------------------------------------ shared: dark patch colours
  const SHC = pl.shadow_color || { day: '#1d1830', dawn: '#2a1c36', dusk: '#0c1430', night: '#0a1230' }[TIME], AO_A = pl.contact ?? { day: .62, dawn: .6, dusk: .64, night: .66 }[TIME];

  // ------------------------------------------------------------------ 4b PROP CONTACT: one instanced soft patch under everything that stands on the ground
  let aoN = 0;
  const buildPropAO = () => {
    scene.updateMatrixWorld(true); const skip = new Set(world.skip || []), rows = [], box = new THREE.Box3(), cs = Array.from({ length: 8 }, () => new V3()), ax = new V3();
    const hidden = o => { for (let p = o; p; p = p.parent) { if (!p.visible || skip.has(p) || p.userData.noExport && p.isGroup) return true; } return false; };
    const foot = (geo, mw, type) => {
      if (!geo.boundingBox) geo.computeBoundingBox(); const b = geo.boundingBox; if (!b || !isFinite(b.min.x)) return; let i = 0;
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) cs[i++].set(x, y, z).applyMatrix4(mw);
      let lo = 1e9, hi = -1e9; for (const c of cs) { lo = Math.min(lo, c.y); hi = Math.max(hi, c.y); } if (lo > .07 || lo < -.25 || hi - lo < .035) return;       // not on the ground, or a flat decal
      const cx = cs.reduce((a, c) => a + c.x, 0) / 8, cz = cs.reduce((a, c) => a + c.z, 0) / 8; if (cx < -62 || cx > 110 || cz > 16 || cz < -78) return;        // only where a camera can come
      const s = cs.slice().sort((a, c) => a.y - c.y), flat = s[3].y - s[0].y < .05;
      if (!flat) { const near = s.filter(c => c.y - s[0].y < .035), mx = near.reduce((a, c) => a + c.x, 0) / near.length, mz = near.reduce((a, c) => a + c.z, 0) / near.length; rows.push([mx, mz, .07, .07, 0]); return; }   // a leaning leg: one small round patch at its foot
      const p0 = s[0], o3 = s.slice(1, 4).sort((a, c) => a.distanceToSquared(p0) - c.distanceToSquared(p0)), u = o3[0].clone().sub(p0), v = o3[1].clone().sub(p0); let lu = Math.hypot(u.x, u.z), lv = Math.hypot(v.x, v.z);
      if (lu < .012 || lv < .012) return; if (Math.min(lu, lv) > 3.4 || Math.max(lu, lv) > 46) return;                                                         // a building body is not a contact; a wall line is
      const mx = (s[0].x + s[1].x + s[2].x + s[3].x) / 4, mz = (s[0].z + s[1].z + s[2].z + s[3].z) / 4, ang = Math.atan2(-u.z, u.x);
      if (type === 'SphereGeometry') { lu *= .45; lv *= .45; }
      else if (type === 'CylinderGeometry' || type === 'LatheGeometry' || type === 'TorusGeometry') { ax.set(type === 'TorusGeometry' ? 0 : 0, type === 'TorusGeometry' ? 0 : 1, type === 'TorusGeometry' ? 1 : 0).transformDirection(mw);
        if (Math.abs(ax.y) < .5) { const au = Math.abs(ax.x * u.x + ax.z * u.z) / (Math.hypot(u.x, u.z) + 1e-6); if (au > .7) lv *= .38; else lu *= .38; } }             // a wheel or a lying drum touches along a line
      rows.push([mx, mz, lu / 2, lv / 2, ang]); };
    const im = new THREE.Matrix4(), wm = new THREE.Matrix4();
    scene.traverse(o => { if (!o.isMesh || !o.geometry || o.isSprite) return; const role = o.userData.role; if (role === 'ground' || role === 'stone' || role === 'lamp' || role === 'glass' || o.userData.noExport || !o.castShadow && !o.isInstancedMesh) return;
      if (o.material && (o.material.transparent || o.material.isMeshBasicMaterial)) return; if (hidden(o)) return;
      if (o.isInstancedMesh) { if (o.count > 700) return; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, im); wm.multiplyMatrices(o.matrixWorld, im); foot(o.geometry, wm, o.geometry.type); } }
      else foot(o.geometry, o.matrixWorld, o.geometry.type); });
    const n = Math.min(rows.length, 6000); if (!n) return 0;
    const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-PI / 2); const half = new Float32Array(n * 2), mesh = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -.5, polygonOffsetUnits: -4, toneMapped: false,
      uniforms: { col: { value: col(SHC) }, A: { value: AO_A * (pl.prop_ao ?? .8) }, M: { value: .1 } },
      vertexShader: 'attribute vec2 half2; uniform float M; varying vec2 vP, vH; varying float vD; void main(){ vH = half2; vP = position.xz * (half2 + M) * 2.; vec4 wp = modelMatrix * instanceMatrix * vec4(vP.x, 0., vP.y, 1.); vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 col; uniform float A, M; varying vec2 vP, vH; varying float vD; void main(){ float r = min(vH.x, vH.y) * .6; vec2 q = abs(vP) - vH + r; float d = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; float a = 1. - smoothstep(-.01, M, d); a = a * a * A * (1. - smoothstep(70., 120., vD)); if (a < .004) discard; gl_FragColor = vec4(col, a); }' }), n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const r = rows[i]; d.position.set(r[0], .013, r[1]); d.rotation.set(0, r[4], 0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); half[i * 2] = r[2]; half[i * 2 + 1] = r[3]; }
    g.setAttribute('half2', new THREE.InstancedBufferAttribute(half, 2)); mesh.instanceMatrix.needsUpdate = true; mesh.frustumCulled = false; mesh.renderOrder = 2; mesh.name = 'contact_shadow_props'; mesh.userData.noExport = true; mesh.castShadow = false; mesh.receiveShadow = false; scene.add(mesh); return n; };
  if (cfg.prop_ao) try { aoN = buildPropAO(); } catch (e) { console.warn('light_armor.js: prop contact patches failed: ' + e.message); }

  // ------------------------------------------------------------------ 3 + 4a CHARACTER CARDS: the key's full-figure shadow, and the patch under each sole
  const softT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), d = g.createImageData(64, 64); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const r = Math.min(1, Math.hypot(x - 31.5, y - 31.5) / 31.5), a = Math.min(1, Math.pow(1 - r, .9) * 1.7);   /* v3: a dark core out to 0.45 of the radius, then a soft edge */ d.data.set([255, 255, 255, Math.round(255 * a)], (y * 64 + x) * 4); } g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); return t; })();
  const patchMat = new THREE.MeshBasicMaterial({ map: softT, color: SHC, transparent: true, opacity: Math.min(1, AO_A * (pl.foot_patch ?? 1.5)), depthWrite: false, polygonOffset: true, polygonOffsetFactor: -.25, polygonOffsetUnits: -4, toneMapped: false, fog: false });
  const patchGeo = new THREE.PlaneGeometry(2, 2); patchGeo.rotateX(-PI / 2); const patches = [];
  const patch = i => { while (patches.length <= i) { const m = new THREE.Mesh(patchGeo, patchMat); m.name = 'contact_shadow_foot'; m.userData.noExport = true; m.renderOrder = 3; m.visible = false; scene.add(m); patches.push(m); } return patches[i]; };
  const invis = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide, alphaTest: .5 }), proxies = new Map(), runsOf = new Map(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const isCard = o => o.isMesh && o.customDepthMaterial && o.material && o.material.isMeshBasicMaterial && o.geometry && o.geometry.type === 'PlaneGeometry' && !o.userData.ld_proxy;
  const isBlob = o => o.isMesh && o.geometry && o.geometry.type === 'CircleGeometry' && o.material && o.material.isMeshBasicMaterial && o.material.color && o.material.color.getHexString() === '1a1028';
  const feetRuns = (card) => {                                            // where the drawing touches the ground line: [centre, half width] in card widths
    const tex = card.material.map, im = tex && tex.image; if (!im || !im.width) return []; let hit = runsOf.get(tex.uuid); if (hit) return hit;
    const g0 = card.geometry; if (!g0.boundingBox) g0.computeBoundingBox(); const v0 = -g0.boundingBox.min.y, W = im.width, H = im.height, yg = Math.round((1 - v0) * H), band = Math.max(3, Math.round(H * .011));
    let data = null; try { const c = document.createElement('canvas'); c.width = W; c.height = band + 2; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, yg - band, W, band + 2, 0, 0, W, band + 2); data = g.getImageData(0, 0, W, band + 2).data; } catch (e) { data = null; }
    hit = []; if (data) { const colOn = new Uint8Array(W); for (let y = 0; y < band + 2; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 120) colOn[x] = 1; const gap = Math.max(2, Math.round(W * .012)); let a = -1, last = -1;
      for (let x = 0; x <= W; x++) { const on = x < W && colOn[x]; if (on) { if (a < 0) a = x; last = x; } else if (a >= 0 && x - last > gap) { hit.push([((a + last + 1) / 2) / W - .5, (last + 1 - a) / 2 / W]); a = -1; } } }
    runsOf.set(tex.uuid, hit); if (runsOf.size > 200) runsOf.delete(runsOf.keys().next().value); return hit; };
  const camOf = card => new V3(Math.sin(card.rotation.y), 0, Math.cos(card.rotation.y));          // the card's normal = toward the lens (flat)

  // ------------------------------------------------------------------ 5 THE LANTERN: soft pool under it; it walks with the Chief when he carries it
  const perf = await loadPerf(), chief = perf.chief || null;
  const chiefAt = f => { if (!chief) return null; let lo = 0, hi = chief.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (chief[m].f0 <= f) lo = m; else hi = m - 1; } const a = chief[lo], b = chief[Math.min(chief.length - 1, lo + 1)]; if (!a || !a.state) return null;
    let p = a.state.pos; if (f > a.f1 && b !== a && b.state && b.state.pos) { const u = (f - a.f1) / Math.max(1, b.f0 - a.f1); p = p.map((v, i) => v + (b.state.pos[i] - v) * u); } return { pos: p, prop: a.state.prop, visible: a.state.visible, hand: a.state.hand, dir: a.state.dir, view: a.state.view }; };
  const LK = { day: .16, dawn: .2, dusk: .36, night: .36 }[TIME] * (pl.pool ?? 1), LCOL = pl.lantern_color || '#ffd080', PCOL = pl.pool_color || '#ffc866';   // the light the lantern THROWS is a yellower amber than its flame (#ffb347): amber plus blue moonlight mixes to mauve (measured: floor 129,100,114), yellow-amber mixes to warm sand, like Rick's lantern pools on blue snow (B7.4)
  const glowT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), d = g.createImageData(128, 128); for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const r = Math.min(1, Math.hypot(x - 63.5, y - 63.5) / 63.5), a = Math.pow(1 - r, 2.2); d.data.set([255, 255, 255, Math.round(255 * a)], (y * 128 + x) * 4); } g.putImageData(d, 0, 0); return new THREE.CanvasTexture(c); })();
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: glowT, color: col(PCOL, LK), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -.25, polygonOffsetUnits: -6, fog: false })); pool.name = 'lantern_pool'; pool.userData.noExport = true; pool.renderOrder = 4; pool.visible = false; scene.add(pool);
  // v3c: the light that walks with the lantern has NO near-field law (decay 0, a smooth cut-off at its range): an inverse-square light 20-30 cm from the wing skin burned the whole under-wing close-up to pale yellow
  // (measured 0.69 mean, 5 % over 0.92, on a NIGHT frame). Now everything within about 2 m takes the same gentle amber, and it is gone by 3.4 m. place keys carry_i, carry_range (lantern_i no longer drives it).
  const carry = new THREE.PointLight(LCOL, 0, pl.carry_range ?? (DARK ? 3.4 : 2.6), 0); carry.name = 'lantern_carried_light'; carry.userData.noExport = true; carry.castShadow = false; scene.add(carry);
  const CARRY_I = (pl.carry_i ?? { day: .25, dawn: .3, dusk: .7, night: .7 }[TIME]);
  const grounds = []; scene.traverse(o => { if (o.isMesh && o.userData.role === 'ground' && !o.isInstancedMesh) grounds.push(o); }); const rayG = new THREE.Raycaster(), DOWN = new V3(0, -1, 0);
  const groundUnder = p => { try { const q = B2T(p); rayG.set(q, DOWN); rayG.far = 8; const h = rayG.intersectObjects(grounds, false)[0]; if (h) return p[2] - h.distance; } catch (e) {} return 0; };   // plan height of the ground under a point (the pool lies ON the ground, not at the height of the step he stands on)
  // 5b THE LANTERN AS A SIDE KEY ON THE MUG SHELF (v3, lead fix 17; judge stations 22-23: 'flat wall, no lantern light on them'). While the lantern STANDS within reach of the shelf (on the stove), a warm spot
  // shines from its flame across the shelf: each mug gets an amber side, a blue moon side and a soft shadow on the backboard, the glaze answers with a highlight and a lit rim line. It is the same light source
  // the picture already shows; it only reaches the shelf (range 4 m) and is off as soon as the Chief carries the lantern away. place key shelf_key: false | { target: [x, y, z] plan, color, i, angle, range, shadow }.
  let shelfKey = null; { const SKc = pl.shelf_key ?? (DARK && /hangar/.test(world.placeName) ? {} : null), board = SKc && (SKc.target ? null : scene.getObjectByName('mug_shelf_backboard'));
    if (SKc && (SKc.target || board)) { let tgt; if (SKc.target) tgt = B2T(SKc.target); else { scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(board); tgt = bb.getCenter(new V3()); tgt.y += (bb.max.y - bb.min.y) * .12; }
      const sp = new THREE.SpotLight(SKc.color || '#ffb25c', 0, SKc.range ?? 4, SKc.angle ?? .62, .8, 1.6); sp.name = 'lantern_shelf_key'; sp.userData.noExport = true; sp.target.position.copy(tgt); scene.add(sp.target);
      if (SKc.shadow !== false) { sp.castShadow = true; sp.shadow.mapSize.set(SKc.shadow_map ?? 2048, SKc.shadow_map ?? 2048); sp.shadow.camera.near = .25; sp.shadow.camera.far = 3.4; sp.shadow.bias = -.0008; sp.shadow.normalBias = .004; }   /* v3b: 2048 on a 71 degree cone = a texel of about 1 mm on the shelf (1024 on 94 degrees gave a lumpy, ragged edge); the edge stays a lantern's: firm near the mug, never a stair */
      scene.add(sp); shelfKey = { sp, tgt, I: SKc.i ?? 1.4, reach: SKc.reach ?? 3.2 }; if (SKc.bounce) { const BO = SKc.bounce, bl = BO.to ? new THREE.SpotLight(BO.color || '#ffb060', 0, BO.range ?? 2.2, BO.angle ?? .45, .6, BO.decay ?? 1.2) : new THREE.PointLight(BO.color || '#ffb060', 0, BO.range ?? 2.2, BO.decay ?? 1.2); bl.position.copy(B2T(BO.at)); bl.castShadow = false; if (BO.to) { bl.target.position.copy(B2T(BO.to)); scene.add(bl.target); bl.castShadow = true; bl.shadow.mapSize.set(1024, 1024); bl.shadow.camera.near = .1; bl.shadow.camera.far = 3; bl.shadow.bias = -.0008; bl.shadow.normalBias = .004; }   /* fix round v2: with `to` the bounce is a narrow cone with shadows, so it lands on the mugs and the shelf plank and not on the wall above them */ bl.name = 'lantern_shelf_bounce'; bl.userData.noExport = true; scene.add(bl); shelfKey.bl = bl; shelfKey.BI = SKc.bounce.i ?? 1; } } }
  const lanternPoint = f => { const s = world.stateAt ? world.stateAt(f) : {}, lb = world.lanternBase ? world.lanternBase(s, f) : null; if (lb && lb[2] > -1) { const pp = [lb[0], lb[1], lb[2] + (world.LAN_H || .3) * .55]; return { p: pp, carried: false, base: Math.min(lb[2], Math.max(0, groundUnder(pp))), raised: lb[2] > .3 }; }   /* v3c: the pool lies on the FLOOR under a lantern that stands on the stove, the wing or hangs on the strut hook (it hung in the air at the lantern's base height: the yellow stripe across the cards at stations 21 and 24) */
    const c = chiefAt(f); if (c && c.visible && c.prop === 'lantern') { let hp = null; try { const hw = window.handWorld && window.handWorld('chief', f); if (hw && hw.hands && hw.hands.length) { const h = hw.hands[c.hand === 'L' ? 0 : hw.hands.length - 1]; if (h && isFinite(h[0])) hp = h; } } catch (e) {}
      const pp = hp ? [hp[0], hp[1], Math.max(.5, hp[2] - .18)] : [c.pos[0], c.pos[1], c.pos[2] + .95]; return { p: pp, carried: true, base: Math.min(c.pos[2], Math.max(0, groundUnder(pp))) }; } return null; };

  const update = (f, t) => {
    if (skyMat) { skyMat.uniforms.t.value = t; skyMat.uniforms.sunDir.value.copy(sunVec()); } if (fgMat) fgMat.uniforms.t.value = t;
    const sv = sunVec(), sh = new V3(sv.x, 0, sv.z).normalize(); let pi = 0;
    for (const o of scene.children) {
      if (isBlob(o)) { o.visible = false; continue; }                      // the kit's faint oval (it sits at the origin): replaced by the patches below
      if (!isCard(o)) continue; const card = o, flatLie = Math.abs(card.rotation.x) > 1.2;
      if (cfg.card_shadow) { let px = proxies.get(card); if (!px) { px = new THREE.Mesh(card.geometry, invis.clone());   /* three copies map and alphaTest from the mesh's OWN material onto the depth material, so each copy carries the card's drawing: the shadow is the figure, not the card's rectangle */ px.userData.ld_proxy = true; px.userData.noExport = true; px.name = 'card_shadow_caster'; px.castShadow = true; px.receiveShadow = false; px.frustumCulled = false;
          px.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: .5 }); px.onBeforeRender = function () { this.matrixWorld.copy(ZERO); }; scene.add(px); proxies.set(card, px); }
        card.castShadow = false; px.visible = card.visible && !flatLie && !!card.material.map; if (px.visible) { const n = sh.dot(camOf(card)) >= 0 ? sh : sh.clone().negate(); px.position.copy(card.position); px.scale.copy(card.scale); px.rotation.set(0, Math.atan2(n.x, n.z), 0);
          if (px.material.map !== card.material.map) { px.material.map = card.material.map; px.material.needsUpdate = true; px.customDepthMaterial.map = card.material.map; px.customDepthMaterial.needsUpdate = true; } } }
      if (cfg.contact && card.visible && !flatLie) { const runs = feetRuns(card), rt = new V3(Math.cos(card.rotation.y), 0, -Math.sin(card.rotation.y)), up = card.position.y > .06, w = card.scale.x;
        for (const [uc, hw] of runs) { const m = patch(pi++); m.visible = true; m.position.copy(card.position).addScaledVector(rt, uc * w); m.position.y += .007;   /* v3: was .014; lower, so the patch never covers the bottom of the foot from a high lens */ m.rotation.set(0, card.rotation.y, 0); m.scale.set(hw * w + (up ? .025 : .05), 1, up ? .035 : .1); } }   /* v3: half width = the sole's own half width + 5 cm, half depth 10 cm (was + 10 cm and 16 cm: a soft halo, not a contact). Measured on Rick: about one foot long, 2-3 leg widths wide */
    }
    for (let i = pi; i < patches.length; i++) patches[i].visible = false;
    if (cfg.debug) { let nc = 0, nv = 0; const info = []; for (const o of scene.children) if (isCard(o)) { nc++; if (o.visible) { nv++; const r = feetRuns(o), im = o.material.map && o.material.map.image; info.push({ pos: o.position.toArray().map(v => +v.toFixed(2)), sx: +o.scale.x.toFixed(2), runs: r.map(q => q.map(v => +v.toFixed(3))), img: im ? [im.width, im.height] : null, minY: o.geometry.boundingBox && +o.geometry.boundingBox.min.y.toFixed(3), cast: o.castShadow }); } } console.warn('LD_DEBUG f=' + f + ' cards=' + nc + ' visible=' + nv + ' patches=' + pi + ' proxies=' + proxies.size + ' ' + JSON.stringify(info)); }
    if (cfg.debug_box && !update.dbx && f > 0) { update.dbx = 1; const [x0, y0, z0, x1, y1, z1] = cfg.debug_box, bb = new THREE.Box3(), out = []; scene.updateMatrixWorld(true); scene.traverse(o => { if (!o.isMesh || !o.geometry) return; let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) vis = false; if (!vis) return; bb.setFromObject(o); const c = bb.getCenter(new V3()), sz = bb.getSize(new V3()), px = c.x, py = -c.z, pz = c.y; if (px > x0 && px < x1 && py > y0 && py < y1 && pz > z0 && pz < z1 && Math.max(sz.x, sz.y, sz.z) > .3) out.push([o.name, o.userData.role, o.userData.mat, o.material && o.material.type, o.geometry.type, [px, py, pz].map(v => +v.toFixed(2)), [sz.x, sz.z, sz.y].map(v => +v.toFixed(2)), o.parent && o.parent.name].join(' | ')); }); console.warn('LD_BOX f=' + f + ' :: ' + out.join(' ;; ')); }   /* debug: lighting.debug_box [x0, y0, z0, x1, y1, z1] plan metres lists every visible mesh inside */
    for (const [card, px] of proxies) if (card.parent !== scene) px.visible = false;
    // lantern
    const lp = cfg.pool ? lanternPoint(f) : null, fl = .93 + .07 * Math.sin(t * 11.3) * Math.sin(t * 4.1);
    pool.visible = !!lp; carry.intensity = 0;
    if (lp) { const q = B2T([lp.p[0], lp.p[1], lp.base + .007]); pool.position.copy(q); const hgt = Math.max(.15, lp.p[2] - lp.base), r = (DARK ? 1.7 : 1.4) + hgt * .9; pool.scale.set(r, 1, r); pool.material.color.copy(col(PCOL, LK * fl / (1 + hgt * .35) * (lp.raised ? (pl.pool_raised ?? .45) : 1)));   /* v3: a lantern that stands ON something (the wing, the stove) lights a smaller, weaker patch there than its pool on open ground: the wing-top macro measured 0.58 with a blown glow */
      if (lp.carried) { carry.position.copy(B2T(lp.p)); carry.intensity = CARRY_I * fl; } }
    if (shelfKey) { const q = lp && !lp.carried ? B2T(lp.p) : null, on = q && q.distanceTo(shelfKey.tgt) < shelfKey.reach; shelfKey.sp.intensity = on ? shelfKey.I * fl : 0; if (shelfKey.bl) shelfKey.bl.intensity = on ? shelfKey.BI * fl : 0; shelfKey.sp.castShadow = !!on && shelfKey.sp.shadow.mapSize.x > 0 && (pl.shelf_key || {}).shadow !== false; if (on) shelfKey.sp.position.copy(q); }
  };
  const anchors = { lantern_light: f => { const lp = lanternPoint(f || 0); return lp ? lp.p : [0, 0, -50]; } };
  console.warn(`light_armor.js [${world.placeName}, ${TIME}]: painted sky=${!!skyMat}, prop contact patches=${aoN}, glint materials=${nSpec}, ground bounce lights=${scene.children.filter(o => o.userData.ld_bounce).length}, lantern shelf key=${!!shelfKey}, performance plan=${chief ? 'read' : 'not found (the carried lantern light is off)'}`);
  return { update, anchors };
}
