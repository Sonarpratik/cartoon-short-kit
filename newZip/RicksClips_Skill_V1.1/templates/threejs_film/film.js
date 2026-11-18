// THREE.JS FILM PLAYER: plays the baked plan (tools/film_plan.py) with the vector2d puppets on simple toon sets.
// It owns NO timing and NO camera maths: camera_baked.json and performance_baked.json are the single source, so the
// Blender look pass can read the same two files and nothing drifts. Stage in the workflow: storyboard + animatic.
//   window.setup(cfg) -> info        cfg = { film: '/ep/film.json', W, H, captions: true, puppets: '/puppets/' }
//   await window.renderFrame(f)      draws frame f (WebGL canvas + caption overlay), ready for a screenshot
//   window.stations()                every station with its START / END frame, for the storyboard
//   window.visibility(f)             projected centre + height of every character and named prop
import * as THREE from './vendor/three.module.js';
import { initPuppets, svgFor, stateKey, metrics, CARD, moveHands, poseHands } from './puppets.mjs';
import { lieOf } from './poses.mjs';
import { lieLayout, placeLying } from './lie_cam.mjs';
import { kit3dFlags, makeKit3d } from './look3d.mjs';

const B2T = p => new THREE.Vector3(p[0], p[2], -p[1]);          // plan is metres, Z up, Y forward (Blender) -> three is Y up, -Z forward
const LIGHTS = {                                                 // preview light only; the real look is the Blender pass
  night:    { top: '#0b1026', hor: '#27345c', sun: '#9fb6ff', si: 1.1, amb: '#3a4a7a', ai: 1.0, dir: [-4, 9, -3], tint: '#cfd8ff' },
  morning:  { top: '#6fa8dc', hor: '#fbe3c4', sun: '#fff0d6', si: 2.2, amb: '#b8cbe6', ai: 1.3, dir: [-6, 8, 5], tint: '#fff6ea' },
  day:      { top: '#3e7fd2', hor: '#b8d0ec', sun: '#ffffff', si: 2.6, amb: '#b9c8de', ai: 1.3, dir: [-3, 10, 4], tint: '#ffffff' },
  golden:   { top: '#8a6f8a', hor: '#ffc47c', sun: '#ffb36b', si: 2.4, amb: '#8f86b8', ai: 1.1, dir: [-9, 4, 2], tint: '#ffe6c8' },
  interior: { top: '#2a2420', hor: '#5a4a3c', sun: '#ffd9a0', si: 1.8, amb: '#6a5a4c', ai: 1.2, dir: [-3, 8, 4], tint: '#ffeedd' },
};
let R = null;

function T(word, n = 1) { const h = R.words.filter(w => w._k === String(word).toLowerCase()); if (h.length < n) throw new Error(`word "${word}" (#${n}) is not in words.json`); return Math.round(h[n - 1].s * R.fps); }
const fr = t => typeof t === 'number' ? Math.round(t) : Array.isArray(t) ? T(t[0], t[1] ?? 1) + (t[2] ?? 0) : Math.round(t.s * R.fps);   // same time rule as film_plan.fr
// In-betweens: for N frames after a pose change the puppet is drawn part-way from the old pose to the new one.
// film.json "tween": { "frames": 6, "ease": "out" | "inout" | "linear", "walk_frames": 8 }; frames 0 = snap (the old behaviour).
const EASE = { out: u => 1 - Math.pow(1 - u, 3), inout: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, linear: u => u, back: u => { const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); } };
// MOTION LIBRARY (2026-11-11, CB: "we have motion test before why you dont use"): a pose named "m:<library id>" (m:hammer/A, m:sleep/A, m:walk/B ...) is a MOVE from
// templates/motion_styles. It is drawn new on every second frame; mt = seconds since that pose began. puppets.mjs draws it (moveDraw).
// kit_patch CARD SCALE (animator fix round 6): film.json "card_scale": { who: [[f, sx, sy], ...] } eased (smoothstep) between keys, 1 outside the first/last key
// span; the card scales about its ground point (feet stay planted). Used for the cat's acted puff (grow, bristle overshoot, hold, deflate) and the leap squash/stretch.
function cardScale(who, f) {
  const K = ((R.film.card_scale || {})[who]) || null; if (!K || !K.length || f < K[0][0] || f > K[K.length - 1][0]) return [1, 1];
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (f >= a[0] && f <= b[0]) { const u = b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 1, e = u * u * (3 - 2 * u); return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e]; } }
  return [1, 1];
}
const tweened = (who, f) => R.h3o || R.hat ? h3State(who, f, tweenedB(who, f)) : tweenedB(who, f);   // kit 2026-11-13: generic held 3D (held3d entries with "grip") and hand_at with "hand"; a film without them gets tweenedB as before
function tweenedB(who, f) {
  const st = tweened0(who, f); if (!/^m:/.test(st.pose || '')) return st;
  const MC = (R.moveCh ||= {})[who] ||= (() => { const out = []; let prev; for (const r of R.perf[who]) { if (r.state.pose !== prev) { out.push(r.f0); prev = r.state.pose; } } return out; })();
  let f0 = 0; for (const x of MC) { if (x <= f) f0 = x; else break; }
  const T = R.film.tween || {}, out = { ...st, tw: undefined, u: undefined, idle: undefined, mt: T.ones ? (f - f0) / R.fps : Math.round((f - f0) / R.fps * 15) / 15 };   // kit_patch: "ones" = a new pose every frame (STUDIO_MOTION rule 1)
  // kit_patch HANDS END ON THINGS: film.json "hand_at": [{ who, f0, f1, at: [x, y, z] plan metres }] -> st.tgt = that point on this frame's card, in move-rig px
  const ha = (R.film.hand_at || []).find(h => h.who === who && f >= fr(h.f0) && f <= fr(h.f1)); if (ha) out.tgt = handTarget(who, f, out.pos, ha.at);
  // kit_patch HEAD WOBBLE: a 5 f head-size pop (peak +7 %) on every face change (CB_RULES s5)
  const FC = (R.faceCh || {})[who]; if (FC && (R.film.tween || {}).pop !== 0) for (const c of FC) { const d = f - c.f0; if (d >= 0 && d < 5) { out.pop = Math.round(((R.film.tween || {}).pop ?? .07) * Math.sin(Math.PI * (d + 1) / 6) * 100) / 100; break; } }
  return out;
}
function handTarget(who, f, posP, at) {
  const c = R.cam[f], card = R.cards[who]; if (!c || !card) return null; const cp = B2T(c.pos), p = B2T(posP), q = B2T(at), h = card.entry.height || 1.7;
  const ry = Math.atan2(cp.x - p.x, cp.z - p.z), rx = -Math.atan2(cp.y - (p.y + h * .55), Math.hypot(cp.x - p.x, cp.z - p.z)), e = new THREE.Euler(rx, ry, 0, 'YXZ');
  const ex = new THREE.Vector3(1, 0, 0).applyEuler(e), ey = new THREE.Vector3(0, 1, 0).applyEuler(e), n = new THREE.Vector3(0, 0, 1).applyEuler(e), d = q.clone().sub(cp);
  const t = p.clone().sub(cp).dot(n) / d.dot(n), x = cp.clone().addScaledVector(d, t).sub(p), u = x.dot(ex) / card.k, v = x.dot(ey) / card.k;
  return [Math.round(u * 2) / 2, Math.round((1010 - v) * 2) / 2];   // move rig: x from the card centre, ground at 1010
}
window.handWorld = (who, f) => {   // kit_patch: both move hands of a card in PLAN metres on frame f (its card turned to that frame's lens), plus the card's own frame
  const c = R.cards[who]; if (!c) return null; const st = tweened(who, f), h = moveHands(c.entry, st);
  if (!h) { const q = poseHands(c.entry, st); if (!q) return { f, pose: st.pose }; const CF = h3Frame(who, f, st); return { f, pose: st.pose, view: q.view, hands: [h3P(CF.W(q.hands.R)), h3P(CF.W(q.hands.L))], card_px: [q.hands.R, q.hands.L].map(v => v.map(x => +x.toFixed(1))), far: q.far, k: c.k }; }   // kit 2026-11-13: plain poses too, [his right, his left]
  const cam = R.cam[f], cp = B2T(cam.pos), p = B2T(st.pos), hh = c.entry.height || 1.7;
  const e = new THREE.Euler(-Math.atan2(cp.y - (p.y + hh * .55), Math.hypot(cp.x - p.x, cp.z - p.z)), Math.atan2(cp.x - p.x, cp.z - p.z), 0, 'YXZ'), ex = new THREE.Vector3(1, 0, 0).applyEuler(e), ey = new THREE.Vector3(0, 1, 0).applyEuler(e);
  const W = q => { const u = (q[0] - CARD.CX) * c.k, v = (CARD.GY - q[1]) * c.k, w = p.clone().addScaledVector(ex, u).addScaledVector(ey, v); return [+w.x.toFixed(4), +(-w.z).toFixed(4), +w.y.toFixed(4)]; };
  return { f, pose: st.pose, tgt: st.tgt || null, hands: h.hands.map(W), card_px: h.hands.map(q => q.map(v => +v.toFixed(1))), k: c.k, ex: [ex.x, -ex.z, ex.y].map(v => +v.toFixed(4)), ey: [ey.x, -ey.z, ey.y].map(v => +v.toFixed(4)) };
};
// kit_patch HELD 3D (animator fix round 2): film.json "held3d": [{ who, obj: "lighter", module: "sets/props_fireworks.js", behind: 0.012 }]. When the card's move
// holds a thing with that obj (moves/act_fuse.mjs held3 entries: hand, lid, fl), the set's own 3D model (buildLighter({inHand:true})) is placed every frame with
// its GRIP anchor ON the fist centre, upright in the card's plane (puppets.mjs draws no flat lighter then). Fix round 3: in FRONT of the card (behind < 0) with a 3D ink fist round it.
const H3_ANCH = { lighter: { grip: [0, .0162, 0], flame: [-.004, .055, 0], thumb: [.011, .061, 0], s: 1.6 } };
function held3dPose(hd, f) {
  const c = R.cards[hd.who]; if (!c) return null; const st = tweened(hd.who, f), h = moveHands(c.entry, st), ob = h && h.obj && h.obj.obj === hd.obj ? h.obj : null; if (!ob || !st.visible) return null;
  const cam = R.cam[f], cp = B2T(cam.pos), p = B2T(st.pos), hh = c.entry.height || 1.7;
  const e = new THREE.Euler(-Math.atan2(cp.y - (p.y + hh * .55), Math.hypot(cp.x - p.x, cp.z - p.z)), Math.atan2(cp.x - p.x, cp.z - p.z), 0, 'YXZ');
  let ex = new THREE.Vector3(1, 0, 0).applyEuler(e), ey = new THREE.Vector3(0, 1, 0).applyEuler(e), n = new THREE.Vector3(0, 0, 1).applyEuler(e);
  const q = h.hands[ob.hand], u = (q[0] - CARD.CX) * c.k, v = (CARD.GY - q[1]) * c.k, grip = p.clone().addScaledVector(ex, u).addScaledVector(ey, v).addScaledVector(n, -(hd.behind ?? .012));
  if (h.mirror) { ex = ex.clone().negate(); n = n.clone().negate(); }
  const A = H3_ANCH[hd.obj] || H3_ANCH.lighter, R3 = new THREE.Matrix4().makeBasis(ex, ey, n), qt = new THREE.Quaternion().setFromRotationMatrix(R3);
  // fix round 5 TILT: film.json held3d "tilt": { f: [up0, up1, down0, down1], deg } leans the case about the fist (grip stays ON the card hand), top toward
  // screen LEFT for deg > 0, so the case sits BESIDE the fuse stake while the flame (kept upright) licks the fuse tip from the side
  let tilt = 0; const TL = hd.tilt; if (TL && TL.f) { const [a0, a1, b0, b1] = TL.f, sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); var tw = f < b0 ? sm((f - a0) / Math.max(1, a1 - a0)) : 1 - sm((f - b0) / Math.max(1, b1 - b0)); tilt = (TL.deg || 0) * Math.PI / 180 * tw; }
  const nV = h.mirror ? n.clone().negate() : n.clone(); if (tilt) qt.premultiply(new THREE.Quaternion().setFromAxisAngle(nV, tilt));
  const tiltLocal = tilt * (h.mirror ? -1 : 1);
  const off = a => new THREE.Vector3(...a).multiplyScalar(A.s).applyQuaternion(qt), origin = grip.clone().sub(off(A.grip)), flame = origin.clone().add(off(A.flame));
  const n0 = h.mirror ? n.clone().negate() : n.clone(), thumb = origin.clone().add(off(A.thumb || [.011, .061, 0])), rf = (c.entry.handR || 13) * c.k;   // n0 = toward the lens
  // fix round 5 FRONT: in the tilt window the whole held group slides along the camera ray to just in FRONT of hd.tilt.front_of (the fuse stake top) and
  // shrinks by the same factor, so its picture on screen is unchanged but the stake can never hide the case
  let lam = 1; const FO = TL && TL.front_of; if (FO && tilt) { const q = B2T(FO), d0 = grip.distanceTo(cp), ds = q.clone().sub(cp).dot(grip.clone().sub(cp).normalize()) - (TL.gap ?? .045); lam = 1 - (1 - Math.min(1, Math.max(.3, ds / d0))) * (tw ?? 1); }
  if (lam < 1) for (const X of [grip, origin, flame, thumb]) X.sub(cp).multiplyScalar(lam).add(cp);
  return { ob, grip, origin, flame, qt, n0, ey, thumb, rf: rf * lam, tiltLocal, lam };
}
async function held3dUpdate(f, t, pl) {
  if (R.h3o) h3gUpdate(f, t, pl);   // kit 2026-11-13: entries with "grip" (generic path, below)
  for (const hd of R.film.held3d || []) { if (hd.grip) continue;
    const key = hd.who + ':' + hd.obj; let o = (R.h3 ||= {})[key];
    if (!o) { const mod = await import(R.dir + (hd.module || 'sets/props_fireworks.js')); o = R.h3[key] = mod[hd.builder || 'buildLighter'](THREE, { inHand: true });   /* kit 2026-11-13: hd.builder names the set module's builder (default buildLighter); it must return { group, lid, flame, setLid, setFlame } */ o.group.traverse(m => { if (m.isMesh) m.castShadow = false; }); }
    if (o.group.parent !== pl.scene) pl.scene.add(o.group);
    const P = held3dPose(hd, f); o.group.visible = !!P; if (!P) continue;
    o.group.position.copy(P.origin); o.group.quaternion.copy(P.qt); o.base ??= o.group.scale.x; o.group.scale.setScalar(o.base * (P.lam ?? 1)); o.setLid(P.ob.lid); o.setFlame(P.ob.fl > .05, t); o.flame.rotation.z -= P.tiltLocal || 0;   // fix 5: the flame stays upright when the case tilts if (P.ob.fl < 1) o.flame.scale.multiplyScalar(Math.max(.25, P.ob.fl));
    // fix round 3: the FIST is 3D too, so it wraps the case from every lens angle (a drawn fist on a card behind or in front of a 3D case cannot): an ink ellipsoid
    // round the case at the grip anchor (the card's fist size), and the thumb from the fist top onto the flint wheel (thumb anchor) once the lid is open
    if (!o.fist) { const ink = new THREE.MeshBasicMaterial({ color: '#2a1a1f' }), g = new THREE.Group(); g.name = 'held3d_fist';
      const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), ink); palm.name = 'fist_palm'; g.add(palm);
      const th = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), ink); th.name = 'fist_thumb'; const tip = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), ink); tip.name = 'fist_thumb_tip';
      const crease = new THREE.MeshBasicMaterial({ color: '#594852' }); const cr = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), crease); m.name = 'fist_crease'; g.add(m); return m; });
      pl.scene.add(g, th, tip); o.fist = { g, palm, th, tip, cr }; }
    if (o.fist.g.parent !== pl.scene) pl.scene.add(o.fist.g, o.fist.th, o.fist.tip);
    { const F = o.fist, r = P.rf, G = o.group, sc = G.scale.x || 1, V = (x, y, z) => G.localToWorld(new THREE.Vector3(x, y, z)); G.updateMatrixWorld(true);
      const exL = new THREE.Vector3(1, 0, 0).applyQuaternion(P.qt), Wc = .038, Dc = .013, HCc = .036, zs = new THREE.Vector3(0, 0, 1).applyQuaternion(P.qt).dot(P.n0) > 0 ? 1 : -1;   // zs: local +z toward the lens? (mirrored L family: no)
        // lighter case size (props_fireworks buildLighter), local units
      // palm: in FRONT of the case (fingers curled across its front face), a bit wider than the case, lower 2/3 of the case covered; chimney + lid free above
      F.g.position.copy(V(0, HCc * .36, zs * Dc * .5)); F.g.quaternion.copy(P.qt); const pw = Math.max(r * 1.2, Wc * sc * .62), ph = HCc * sc * .40; F.palm.scale.set(pw, ph, Math.min(pw, r) * .55);
      F.cr.forEach((m, i) => { m.scale.set(pw * 1.5, ph * .05, r * .05); m.position.set(0, ph * (.5 - .5 * i), zs * Math.min(pw, r) * .5); });
      // thumb: up the hinge/wheel side of the case, its tip ON the flint wheel (outer side, a hair toward the lens); lid shut -> resting on the case side
      const wh = G.getObjectByName('lighter_flint_wheel'), wp = wh ? wh.getWorldPosition(new THREE.Vector3()) : P.thumb, tr = Math.max(r * .26, .0016 * sc * 2.2);
      const base = V(Wc * .5, HCc * .55, zs * Dc * .3).addScaledVector(exL, tr * .9), end = P.ob.lid > .3 ? wp.clone().addScaledVector(exL, .0011 * sc + tr * .7).addScaledVector(P.ey, tr * .4).addScaledVector(P.n0, tr * .3) : V(Wc * .5, HCc * .98, zs * Dc * .3).addScaledVector(exL, tr * .9);
      const d = end.clone().sub(base), L = d.length(); F.th.position.copy(base).addScaledVector(d, .5); F.th.scale.set(tr, L, tr); F.th.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); F.tip.position.copy(end); F.tip.scale.setScalar(tr * 1.08);
      F.g.visible = F.th.visible = F.tip.visible = true; }
  }
  for (const o of Object.values(R.h3 || {})) if (o.fist && !o.group.visible) o.fist.g.visible = o.fist.th.visible = o.fist.tip.visible = false;
}
window.held3dWorld = (who, f) => { if (R.h3o) { const g = window.held3dAll(f).find(x => x.who === who || x.with === who); if (g) return g; }   // kit 2026-11-13: a generic held prop answers with its own row (grip, tip, flame, anchors, fists, gap)
  const hd = (R.film.held3d || []).find(h => h.who === who && !h.grip); const P = hd && held3dPose(hd, f); if (!P) return null; const T = v => [+v.x.toFixed(4), +(-v.z).toFixed(4), +v.y.toFixed(4)];
  return { f, obj: P.ob.obj, hand: P.ob.hand, lid: P.ob.lid, fl: P.ob.fl, grip: T(P.grip), flame: T(P.flame) }; };   // plan metres: the fist grip point and the lighter's flame anchor (vfx / lighting)
// ================= GENERIC HELD 3D (props-hero 2026-11-13; CB_RULES "HANDS GRIP ITEMS", "HANDS ON OBJECTS", "BODY MECHANICS" 4) =================
// A film.json "held3d" entry WITH the key "grip" takes this path; an entry without it keeps the old lighter path above, untouched. A film with no such entry never runs a line of it.
//   { who, obj, module: "sets/props.js", builder: "buildSlideRule", opts: {...builder options}, grip: "<kind>", hand: "R" | "L", anchor: "grip", tip: "tip", angle, scale, fist, when, f0, f1, tip_at, far, behind, turn, up, lift, yaw, flip_opts, shadow, flame, with, spread }
// ANY builder (THREE, opts) -> { group, grip, ...anchors } works: it is called once with { inHand: true, toon, ...opts }; "anchor" names the hand point it returned (a Vector3, group-local) or is [x, y, z].
// WHEN it shows: while the card is visible and its baked state "prop" equals obj ("when": "prop", the default), or always ("when": "always"), or in the listed poses ("when": ["grip_pole", ...]); f0 / f1 narrow it.
// KINDS (the locked grip standard of vector2d_characters/code/grips.mjs, in 3D): the object comes first, then the round ink fist ON its grip anchor, with thumb and three creases across the shaft.
//   pole      upright shaft in the fist, a little off vertical (angle -84)        point     the stick points out to the side the hand is on (angle -12)        raise    held up (angle -80)
//   hang      hangs straight down from the fist by its bail or handle (gravity)   handle    upright thing held by a side handle (mug); "flip_opts" builds the mirrored one so its body is always on the inner / forward side
//   shoulder  a long thing on the shoulder, its long axis along the way the body faces ("up": which local axis points up, "lift": nose-up degrees)
//   box       ONE character, both fists on the object's two side anchors ("anchors": ["grip_left", "grip_right"]); the object stands in front of the body and the two arms are solved to its anchors
//   carry     TWO characters ("with": the second one), four fists: the object lies level between them along the real line from one to the other, each takes his end with both hands ("spread" m)
// Angles are grips.mjs angles: screen degrees of the object's long axis (+Y of the builder), 0 = to the right, -90 = straight up, mirrored when the hand is on the other side. "angle" may be keys [[f, deg], ...].
// "tip_at": [{ f0, f1, at: [x, y, z] | "<anchor of the place>", ramp: [in, out] }]: the working end (anchor "tip") lands ON that plan point: the fist is put where the tip reaches it and the arm is solved to
// the fist at its fixed length (out of reach = the tip only aims at it; held3dWorld reports the gap). With no tip anchor the grip point itself goes there.
// The fist is never moved to the prop: single-hand kinds lock the prop's anchor on the card's fist every frame; two-hand kinds put the fists on the anchors and solve the arms to them (state.hat, poses.mjs).
const H3_KIND = { pole: { angle: -84 }, point: { angle: -12 }, raise: { angle: -80 }, hang: { angle: -90, wrap: 0, fixed: 1 }, handle: { angle: -90, wrap: 90, fixed: 1 }, shoulder: { facing: 1, lift: 7, up: '+z' }, box: { two: 1, wrap: 90 }, carry: { two: 1, men: 1 } };
const h3sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x), h3V = (x, y, z) => new THREE.Vector3(x, y, z), h3P = v => [+v.x.toFixed(4), +(-v.z).toFixed(4), +v.y.toFixed(4)];
const h3Num = (v, f) => { if (v == null || typeof v === 'number') return v ?? null; const K = v.map(k => [fr(k[0]), k[1]]); if (f <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (f <= K[i + 1][0]) return K[i][1] + (K[i + 1][1] - K[i][1]) * h3sm((f - K[i][0]) / Math.max(1, K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
async function h3gBuild() {
  R.h3o = [];
  for (const [i, hd] of R.h3g.entries()) {
    const mod = await import(R.dir + (hd.module || 'sets/props.js')), fn = mod[hd.builder]; if (typeof fn !== 'function') { console.warn(`film.js held3d: ${hd.module || 'sets/props.js'} has no builder "${hd.builder}" (${hd.who}, ${hd.obj})`); continue; }
    if (!H3_KIND[hd.grip]) console.warn(`film.js held3d: unknown grip kind "${hd.grip}" (${hd.who}, ${hd.obj}), using pole`);
    const mk = extra => { const o = fn(THREE, { inHand: true, toon: toonMat, ...(hd.opts || {}), ...extra }), g = o.group; g.userData.noExport = true; g.visible = false; if (hd.shadow === false) g.traverse(m => { if (m.isMesh) m.castShadow = false; });
      g.position.set(0, 0, 0); g.quaternion.identity(); g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g), pt = a => Array.isArray(a) ? h3V(a[0], a[1], a[2]) : a && o[a] && o[a].isVector3 ? o[a].clone() : null;
      const A = pt(hd.anchor || 'grip') || h3V(0, 0, 0), tip = pt(hd.tip || 'tip'), ym = (bb.min.y + bb.max.y) / 2, two = hd.anchors ? hd.anchors.map(pt) : [pt('grip_left'), pt('grip_right')];
      const pair = (two[0] && two[1] ? two : [h3V(bb.min.x, ym, 0), h3V(bb.max.x, ym, 0)]).sort((p, q) => p.x - q.x);   // [lower x = the bearer's RIGHT hand when the thing faces the way he does, higher x = his LEFT]
      return { o, g, bb, A, tip, pair, pt }; };
    const main = mk({}), flip = hd.flip_opts ? mk(hd.flip_opts) : null;
    R.h3o.push({ hd, i, key: [hd.who, hd.obj, hd.hand || hd.with || '', i].join(':'), main, flip, s: hd.scale ?? 1, fists: [] });
  }
}
function h3Frame(who, f, st) {   // the card's own axes on frame f, exactly as renderFrame turns it, and the two ways between card px and the world
  const c = R.cards[who], cp = B2T(R.cam[f].pos), p = B2T(st.pos), hh = c.entry.height || 1.7, cs = cardScale(who, f);
  const e = new THREE.Euler(-Math.atan2(cp.y - (p.y + hh * .55), Math.hypot(cp.x - p.x, cp.z - p.z)), Math.atan2(cp.x - p.x, cp.z - p.z), 0, 'YXZ'), ex = h3V(1, 0, 0).applyEuler(e), ey = h3V(0, 1, 0).applyEuler(e), n = h3V(0, 0, 1).applyEuler(e);
  const W = q => p.clone().addScaledVector(ex, (q[0] - CARD.CX) * c.k * cs[0]).addScaledVector(ey, (CARD.GY - q[1]) * c.k * cs[1]);
  const toCard = w => { const d = w.clone().sub(cp), t = p.clone().sub(cp).dot(n) / d.dot(n), x = cp.clone().addScaledVector(d, t).sub(p); return [CARD.CX + x.dot(ex) / (c.k * cs[0]), CARD.GY - x.dot(ey) / (c.k * cs[1])]; };   // along the camera ray onto the card: the fist is SEEN on the point
  return { c, cp, p, ex, ey, n, W, toCard, k: c.k };
}
function h3Hands(who, st) {   // both fists of a card in card px, the same for plain poses and library moves: { px: { R, L }, sh, far, gdir, r, view, dir }
  const c = R.cards[who];
  if (/^m:/.test(st.pose || '')) { const h = moveHands(c.entry, st); if (!h) return null; const v = h.view || 'side', side = v === 'side', back = v === 'back', iR = side ? (h.mirror ? 0 : 1) : back ? 1 : 0, d = h.mirror ? -1 : 1;
    return { raw: h.hands, px: { R: h.hands[iR], L: h.hands[1 - iR] }, sh: null, far: { R: side ? iR === 0 : back, L: side ? iR === 1 : back }, gdir: { R: side ? d : back ? 1 : -1, L: side ? d : back ? -1 : 1 }, r: h.handR || 15, view: v, dir: d }; }
  const q = poseHands(c.entry, st); return q ? { px: q.hands, sh: q.sh, far: q.far, gdir: q.gdir, r: q.handR, view: q.view, dir: q.dir } : null;
}
function h3On(hd, f) {
  if ((hd.f0 != null && f < fr(hd.f0)) || (hd.f1 != null && f > fr(hd.f1))) return false; const w = hd.when ?? 'prop', place = R.cam[f].place;
  for (const who of hd.with ? [hd.who, hd.with] : [hd.who]) { if (!R.cards[who]) return false; const s = tweened0(who, f); if (!s.visible || (s.place && s.place !== place) || lieOf(s)) return false;
    if (w === 'prop' ? s.prop !== hd.obj : Array.isArray(w) ? !w.includes(s.pose) : false) return false; }
  return true;
}
// the FIRST entry in the list that is on for a character and an object wins (a two-man carry listed before each man's own hold; a special window listed before the general line); two entries for two different hands both stay (a paddle in each fist)
const h3Live = (E, f) => h3On(E.hd, f) && !R.h3o.some(P => P.i < E.i && P.hd.obj === E.hd.obj && [P.hd.who, P.hd.with].some(w => w && (w === E.hd.who || w === E.hd.with)) && !(P.hd.hand && E.hd.hand && P.hd.hand !== E.hd.hand) && h3On(P.hd, f));
function h3Tip(E, f) {   // the tip_at window that is on at frame f: { T (three.js world), w 0..1 }
  for (const k of E.hd.tip_at || []) { const f0 = fr(k.f0 ?? 0), f1 = fr(k.f1 ?? k.f0 ?? R.end), [ri, ro] = k.ramp || [4, 6], w = f < f0 ? (ri ? h3sm(1 - (f0 - f) / ri) : 0) : f > f1 ? (ro ? h3sm(1 - (f - f1) / ro) : 0) : 1; if (w <= 0) continue;
    const pl = R.places[R.cam[f].place], an = typeof k.at === 'string' ? pl && pl.anchors[k.at] : k.at, at = typeof an === 'function' ? an(f) : an; if (!at) { if (!k._w) { k._w = 1; console.warn('film.js held3d tip_at: no anchor "' + k.at + '" in this place'); } continue; }
    return { T: B2T(at), w }; }
  return null;
}
const h3Pick = (E, want) => want > 0 && E.flip ? E.flip : E.main;
const h3Eff = (E, f) => { const hd = E.hd; if (!hd.by_pose) return hd; const p = String(tweened0(hd.who, f).pose || 'stand'), o = hd.by_pose[p] || hd.by_pose[p.replace(/[@+].*$/, '')]; return o ? ((E.eff ||= {})[p] ||= { ...hd, ...o }) : hd; };   // "by_pose": { "<pose>": { grip, angle, ... } } = the hold changes with the pose (rule at rest = pole, pointing = point)
function h3Layout(E, f) {   // two-hand kinds: where the object stands and where its hand anchors are (three.js world), from the bearers' NATURAL pose hands (before any hat)
  const C = (R.h3c && R.h3c.f === f ? R.h3c : (R.h3c = { f, m: new Map() })).m; if (C.has(E.key)) return C.get(E.key);
  const hd = h3Eff(E, f), K = H3_KIND[hd.grip] || H3_KIND.pole, M = E.main, s = E.s, up = h3V(0, 1, 0), mid = M.pair[0].clone().add(M.pair[1]).multiplyScalar(.5); let out = null;
  const sA = tweenedB(hd.who, f), HA = h3Hands(hd.who, sA), FA = h3Frame(hd.who, f, sA);
  if (HA && K.men && hd.with && R.cards[hd.with]) {   // carry: level between two bearers, along the real line from one to the other
    const sB = tweenedB(hd.with, f), HB = h3Hands(hd.with, sB), FB = h3Frame(hd.with, f, sB);
    if (HB) { const X = FB.p.clone().sub(FA.p); X.y = 0; const dist = X.length(); X.normalize(); const Z = X.clone().cross(up).normalize(), q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, up, Z));
      if (hd.roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(h3V(1, 0, 0), (FA.cp.clone().sub(FA.p).dot(Z) >= 0 ? 1 : -1) * hd.roll * Math.PI / 180));   // "roll": the top face tips toward the lens by that many degrees, so its lettering reads
      const hy = hd.z != null ? (FA.p.y + FB.p.y) / 2 + hd.z : [FA.W(HA.px.R).y, FA.W(HA.px.L).y, FB.W(HB.px.R).y, FB.W(HB.px.L).y].reduce((a, b) => a + b, 0) / 4;
      const ctr = FA.p.clone().add(FB.p).multiplyScalar(.5); ctr.y = hy; const origin = ctr.clone().sub(mid.clone().multiplyScalar(s).applyQuaternion(q)), sp = hd.spread ?? .13, Zq = h3V(0, 0, 1).applyQuaternion(q), at = (a, dz) => origin.clone().add(a.clone().multiplyScalar(s).add(h3V(0, 0, dz)).applyQuaternion(q));
      // bearer A faces +X: his right hand is on +Z; bearer B faces -X: his right hand is on -Z
      out = { obj: M, origin, q, s, fists: [{ who: hd.who, hand: 'R', p: at(M.pair[0], sp), shaft: Zq }, { who: hd.who, hand: 'L', p: at(M.pair[0], -sp), shaft: Zq }, { who: hd.with, hand: 'R', p: at(M.pair[1], -sp), shaft: Zq }, { who: hd.with, hand: 'L', p: at(M.pair[1], sp), shaft: Zq }], need: (M.pair[1].x - M.pair[0].x) * s, dist }; }
  } else if (HA && !K.men) {   // box: in front of ONE bearer, turned the way his body is turned, its two side anchors for his two fists
    const D = HA.dir, F = HA.view === 'back' ? FA.n.clone().negate() : HA.view === 'side' ? FA.ex.clone().multiplyScalar(D) : HA.view === '34' ? FA.n.clone().multiplyScalar(.82).addScaledVector(FA.ex, .57 * D).normalize() : FA.n.clone();
    F.y = 0; F.normalize(); const X = up.clone().cross(F).normalize(), q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, up, F)); if (hd.yaw) q.multiply(new THREE.Quaternion().setFromAxisAngle(up, hd.yaw * Math.PI / 180)); if (hd.pitch) q.multiply(new THREE.Quaternion().setFromAxisAngle(h3V(1, 0, 0), hd.pitch * Math.PI / 180));   // "pitch": the top tips forward (toward the way he faces) by that many degrees
    const m2 = [(HA.px.R[0] + HA.px.L[0]) / 2, (HA.px.R[1] + HA.px.L[1]) / 2], ctr = FA.W(m2).addScaledVector(F, (mid.z - M.bb.min.z) * s + (hd.fwd ?? .02)); if (hd.lift_m) ctr.y += hd.lift_m;
    // kit_patch RAY_FWD (s6 builder 2026-11-15, goldrush camp; opt-in, a film without the key is unchanged): "ray_fwd": metres = the box comes that far toward the lens ALONG THE CAMERA RAY
    // through the hands' midpoint, so a pan held by its rim sits in FRONT of the body (never half inside the belly) and its midpoint stays on the fists on screen (no sideways slide; the spread only scales).
    if (hd.ray_fwd) ctr.addScaledVector(ctr.clone().sub(FA.cp).normalize(), -hd.ray_fwd);
    const origin = ctr.clone().sub(mid.clone().multiplyScalar(s).applyQuaternion(q)), aw = M.pair.map(a => origin.clone().add(a.clone().multiplyScalar(s).applyQuaternion(q)));
    out = { obj: M, origin, q, s, fists: [{ who: hd.who, hand: 'R', p: aw[0], shaft: up }, { who: hd.who, hand: 'L', p: aw[1], shaft: up }] }; }
  C.set(E.key, out); return out;
}
function h3Hat(E, who, f, st) {   // the fists this prop drives on this card, in card px: { R: [x, y], L: [x, y] } or null
  const hd = h3Eff(E, f), K = H3_KIND[hd.grip] || H3_KIND.pole, r5 = q => [Math.round(q[0] * 2) / 2, Math.round(q[1] * 2) / 2];
  if (K.two) { const L = h3Layout(E, f); if (!L) return null; const CF = h3Frame(who, f, st), hat = {}; for (const x of L.fists) if (x.who === who) hat[x.hand] = r5(CF.toCard(x.p)); return hat; }
  const TP = h3Tip(E, f); if (!TP || who !== hd.who) return null; const H = h3Hands(who, st); if (!H) return null;
  const CF = h3Frame(who, f, st), hand = hd.hand || (st.hand === 'L' ? 'L' : 'R'), Hn = H.px[hand], M = E.main, d = M.tip ? M.tip.distanceTo(M.A) * E.s : 0, Tpx = CF.toCard(TP.T), Tp = CF.W(Tpx), wv = TP.T.clone().sub(Tp);
  let dir = CF.W(Hn).sub(Tp); if (dir.length() < .02 && H.sh) dir = CF.W(H.sh[hand]).sub(Tp); if (dir.length() < 1e-4) dir.copy(CF.ey).negate(); dir.normalize();
  const b = wv.dot(dir), disc = b * b - wv.lengthSq() + d * d, r = disc >= 0 ? b + Math.sqrt(disc) : Math.max(0, b), px = CF.toCard(Tp.clone().addScaledVector(dir, r));   // the fist sits on the line from the point toward the hand, one tip length from the point
  return { [hand]: r5([Hn[0] + (px[0] - Hn[0]) * TP.w, Hn[1] + (px[1] - Hn[1]) * TP.w]) };
}
function h3State(who, f, st) {   // the drawn state of a card that holds a generic 3D prop: no flat prop (h3), fists where the prop needs them (hat)
  let out = st;
  for (const E of R.h3o || []) { const hd = E.hd; if ((hd.who !== who && hd.with !== who) || !h3Live(E, f)) continue; if (out === st) out = { ...st, h3: 1 }; const hat = h3Hat(E, who, f, st); if (hat) out.hat = { ...(out.hat || {}), ...hat }; }
  for (const h of R.hat || []) { if (h.who !== who || f < fr(h.f0) || f > fr(h.f1 ?? h.f0) || /^m:/.test(st.pose || '')) continue; const CF = h3Frame(who, f, st), q = CF.toCard(B2T(h.at)); if (out === st) out = { ...st }; out.hat = { ...(out.hat || {}), [h.hand]: [Math.round(q[0] * 2) / 2, Math.round(q[1] * 2) / 2] }; }   // hand_at with "hand": "R" | "L" on a PLAIN pose
  return out;
}
function h3gPose(E, f) {   // where the prop and its fists are on frame f (three.js world), or null when it is not held
  const hd = h3Eff(E, f), K = H3_KIND[hd.grip] || H3_KIND.pole; if (!h3Live(E, f)) return null;
  const fistOf = (who, hand, p, shaft, wrap) => { const st = tweened(who, f), H = h3Hands(who, st), CF = h3Frame(who, f, st); if (!H) return null; const hp = CF.W(H.px[hand]);
    return { who, hand, p, shaft, wrap, CF, r: H.r * CF.k * (hd.fist ?? 1), sh: H.sh ? CF.W(H.sh[hand]) : null, far: !!H.far[hand], armEnd: hp, gap: +hp.distanceTo(CF.W(CF.toCard(p))).toFixed(4) }; };
  if (K.two) { const L = h3Layout(E, f); if (!L) return null; const fists = L.fists.map(x => fistOf(x.who, x.hand, x.p, x.shaft, K.wrap)).filter(Boolean); if (!fists.length) return null;
    return { obj: L.obj, origin: L.origin, q: L.q, s: L.s, fists, gap: Math.max(...fists.map(x => x.gap)), need: L.need, dist: L.dist, far: false }; }
  const who = hd.who, st = tweened(who, f), H = h3Hands(who, st); if (!H) return null;
  const CF = h3Frame(who, f, st), hand = hd.hand || (st.hand === 'L' ? 'L' : 'R'), gdir = H.gdir[hand], far = hd.far ?? !!H.far[hand], M = h3Pick(E, H.view === 'side' ? gdir : -gdir), s0 = E.s, r0 = H.r * CF.k * (hd.fist ?? 1), Wh = CF.W(hd.mhand != null && H.raw ? H.raw[hd.mhand] : H.px[hand]);   // "mhand": 0 | 1 = on a library move, the move's own hand number (when the move acts with the other hand)
  // slide along the camera ray to just in front of the card (far hand: just behind it): the 3D fist is SEEN exactly on the card's fist; size on screen unchanged
  // kit_patch TOWARD (animator 2026-11-14, goldrush hook; opt-in, a film without the key is unchanged): "toward": metres or keys [[f, m], ...] = the prop is held
  // that far IN FRONT of the card toward the lens (a fist thrust at the camera) and keeps its OWN size, so it reads bigger the nearer it comes (true perspective).
  // The fist stays on the camera ray through the card's fist, so the arm still ends on it. Without "toward" the prop is slid just in front of the card and resized to keep its screen size.
  const tw = h3Num(hd.toward, f), back = K.facing ? 0 : ((far ? M.bb.max.z - M.A.z : M.A.z - M.bb.min.z) * s0 + .012), depth = tw != null ? tw : hd.behind != null ? -hd.behind : (far ? -1 : 1) * Math.max(r0 * .8, back), lam = 1 - depth / Wh.distanceTo(CF.cp), G = CF.cp.clone().addScaledVector(Wh.clone().sub(CF.cp), lam), s = tw != null ? s0 : s0 * lam;
  const up = h3V(0, 1, 0); let q;
  if (K.facing || hd.turn === 'body') { const D = H.dir, F = H.view === 'back' ? CF.n.clone().negate() : H.view === 'side' ? CF.ex.clone().multiplyScalar(D) : H.view === '34' ? CF.n.clone().multiplyScalar(.82).addScaledVector(CF.ex, .57 * D).normalize() : CF.n.clone(); F.y = 0; F.normalize();
    if (K.facing) { const lift = ((h3Num(hd.lift, f) ?? K.lift) || 0) * Math.PI / 180, A = F.clone().multiplyScalar(Math.cos(lift)).addScaledVector(up, Math.sin(lift)).normalize(), U = up.clone().addScaledVector(A, -up.dot(A)).normalize(), ax = hd.up || K.up, sg = ax[0] === '-' ? -1 : 1;
      const X = /x/.test(ax) ? U.clone().multiplyScalar(sg) : null, Z = X ? X.clone().cross(A).normalize() : U.clone().multiplyScalar(sg), X2 = X || A.clone().cross(Z).normalize(); q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X2, A, Z)); }
    else q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(up.clone().cross(F).normalize(), up, F)); }
  else { let a = h3Num(hd.angle, f) ?? K.angle;
    if (st.tw && st.u != null && st.u < 1 && E.hd.by_pose) { const o0 = E.hd.by_pose[st.tw.pose], h0 = o0 ? { ...E.hd, ...o0 } : E.hd, K0 = H3_KIND[h0.grip] || H3_KIND.pole; if (!K0.facing && !K0.two) { const a0 = h3Num(h0.angle, f) ?? K0.angle; a = a0 + (a - a0) * st.u; } }   // the prop swings with the pose in-between, never snaps
    if (gdir < 0 && !K.fixed) a = 180 - a; const r = a * Math.PI / 180;
    q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(CF.ex, CF.ey, CF.n)).multiply(new THREE.Quaternion().setFromAxisAngle(h3V(0, 0, 1), Math.atan2(-Math.cos(r), -Math.sin(r)))); }
  { const yaw = (hd.yaw || 0) + (hd.face === 'out' && gdir < 0 ? 180 : 0); if (yaw) q.multiply(new THREE.Quaternion().setFromAxisAngle(up, yaw * Math.PI / 180)); }   // "face": "out" = a thing whose working end is its +X (a gun barrel) turns to the side the hand is on
  const TP = h3Tip(E, f); let gap = null, aimed = 0;
  if (TP) { const aim = TP.T.clone().sub(G), L = aim.length(); if (L > 1e-4) { aim.normalize(); let X = aim.clone().cross(CF.n); if (X.lengthSq() < 1e-4) X = CF.ex.clone(); X.normalize(); const Z = X.clone().cross(aim).normalize(); q.slerp(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, aim, Z)), TP.w); gap = +(L - (M.tip ? M.tip.distanceTo(M.A) * s : 0)).toFixed(4); aimed = TP.w; } }
  const A = hd.anchor !== E.hd.anchor ? (M.pt(hd.anchor || 'grip') || M.A) : M.A, origin = G.clone().sub(A.clone().multiplyScalar(s).applyQuaternion(q)), shaft = h3V(0, 1, 0).applyQuaternion(q);   // by_pose may name another hand point
  return { obj: M, origin, q, s, far, gap, aimed, hand, G, fists: [{ who, hand, p: G, shaft, wrap: K.wrap, CF, r: tw != null ? r0 : r0 * lam, sh: H.sh ? CF.W(H.sh[hand]) : null, far, gap: 0 }] };
}
function h3Fist() {   // the round ink fist of the cast as a 3D thing (grips.mjs wrapFist): palm, thumb lobe over the shaft, three creases across it, a soft shine
  const ink = new THREE.MeshBasicMaterial({ color: '#2a1a1f', toneMapped: false, side: THREE.DoubleSide }), crm = new THREE.MeshBasicMaterial({ color: '#594852', toneMapped: false, side: THREE.DoubleSide }), shm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .22, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const g = new THREE.Group(); g.name = 'held3d_fist'; g.userData.noExport = true; const spin = new THREE.Group(); spin.name = 'fist_wrap'; g.add(spin);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), ink); palm.name = 'fist_palm'; palm.scale.set(1, 1, .92); g.add(palm);   // nearly round, so the fist closes over the FRONT of a thick handle too
  const thumb = new THREE.Mesh(new THREE.SphereGeometry(.5, 18, 12), ink); thumb.name = 'fist_thumb'; thumb.position.set(.55, -.55, .3); thumb.scale.set(1, 1, .8); spin.add(thumb);   // spin: +x = along the shaft, +y = the knuckle side
  for (const u of [-.42, 0, .42]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.1, .8, .02), crm); m.name = 'fist_crease'; m.position.set(u * 1.03, .51, .92 * Math.sqrt(Math.max(.05, 1 - u * u - .26)) + .03); m.rotation.z = -u * .06; spin.add(m); }
  const sh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(h3V(-.5, -.62, 0), h3V(-.3, -.86, 0), h3V(.05, -.78, 0)), 10, .065, 5), shm); sh.name = 'fist_shine'; sh.position.z = .62; sh.scale.z = .2; sh.renderOrder = 3; spin.add(sh);
  for (const m of [palm, thumb]) m.castShadow = false; return { g, spin, ink, crm };
}
function h3gUpdate(f, t, pl) {
  for (const E of R.h3o || []) {
    const P = h3gPose(E, f); for (const M of [E.main, E.flip]) if (M) M.g.visible = !!P && P.obj === M; let n = 0;
    if (P) { const g = P.obj.g, o = P.obj.o; if (g.parent !== pl.scene) pl.scene.add(g); g.position.copy(P.origin); g.quaternion.copy(P.q); g.scale.setScalar(P.s); if (o.setFlame) o.setFlame(E.hd.flame ?? true, t, E.hd.level); if (o.setLid && E.hd.lid != null) o.setLid(h3Num(E.hd.lid, f));
      for (const x of P.fists) { const F = E.fists[n] ||= h3Fist(); n++; if (F.g.parent !== pl.scene) pl.scene.add(F.g); F.g.visible = !(x.gap > x.r * 1.5); const CF = x.CF;   // an arm that cannot reach its anchor gets no fist there (a fist with no arm would float): move the mark, held3dAll / --held gives the gap
        if (!F.g.visible && !E.warned) { E.warned = 1; console.warn(`film.js held3d: ${x.who}'s ${x.hand} hand cannot reach the ${E.hd.obj} at frame ${f} (${(x.gap * 100).toFixed(0)} cm short): move the mark or turn him to it`); }
        F.g.position.copy(x.p); F.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(CF.ex, CF.ey, CF.n)); F.g.scale.setScalar(x.r);
        // the creases cross the shaft; the knuckles are on the side away from the forearm (grips.mjs kn)
        let ux, uy; if (typeof x.wrap === 'number') { ux = Math.cos(x.wrap * Math.PI / 180); uy = Math.sin(x.wrap * Math.PI / 180); } else { ux = x.shaft.dot(CF.ex); uy = x.shaft.dot(CF.ey); if (Math.hypot(ux, uy) < .25) { ux = 0; uy = 1; } }
        const a = Math.atan2(uy, ux), fa = x.sh ? x.p.clone().sub(x.sh) : null, kn = fa ? ((fa.dot(CF.ex) * -Math.sin(a) + fa.dot(CF.ey) * Math.cos(a)) >= 0 ? 1 : -1) : 1; F.spin.rotation.z = a; F.spin.scale.set(1, kn, 1);
        F.ink.color.set('#2a1a1f').multiply(new THREE.Color(pl.L.tint)); F.ink.fog = F.crm.fog = pl.L.card_fog ?? true; } }
    for (let i = n; i < E.fists.length; i++) E.fists[i].g.visible = false;
  }
}
window.held3dAll = f => {   // every generic held prop on frame f in plan metres: grip, tip, every anchor the builder gave, the fists and how far each arm end is from its fist (gap, m)
  f = Math.max(0, Math.min(R.end - 1, f)); const out = []; if (R.h3o && R.h3o.length) setCamera(R.cam[f]);
  for (const E of R.h3o || []) { const P = h3gPose(E, f); if (!P) continue; const o = P.obj.o, W = v => h3P(P.origin.clone().add(v.clone().multiplyScalar(P.s).applyQuaternion(P.q))), anchors = {};
    for (const [k, v] of Object.entries(o)) if (v && v.isVector3) anchors[k] = W(v);
    out.push({ f, who: E.hd.who, with: E.hd.with || null, obj: E.hd.obj, kind: E.hd.grip, hand: P.hand || null, far: !!P.far, grip: P.G ? h3P(P.G) : null, tip: P.obj.tip ? W(P.obj.tip) : null, flame: o.flame_pos ? W(o.flame_pos) : null, gap: P.gap, aimed: P.aimed || 0, need: P.need ?? null, dist: P.dist ?? null,
      anchors, fists: P.fists.map(x => ({ who: x.who, hand: x.hand, at: h3P(x.p), px: (project(x.p) || []).map(v => +v.toFixed(4)), r: +x.r.toFixed(4), far: x.far, gap: x.gap })) }); }
  return out;
};
window.moveHand = (who, f, i = 1) => { const c = R.cards[who]; if (!c) return null; const st = tweened(who, f), h = moveHands(c.entry, st); if (!h) return null; const p = h.hands[i] || h.hands[0]; return { u: (p[0] - CARD.CX) * c.k, v: (CARD.GY - p[1]) * c.k, ang: h.ang, mirror: h.mirror }; };
const NOPOP = fc => { const n = /^k:/.test(fc || '') ? fc.slice(2) : null; return !!(n && R.film.faces_ep && R.film.faces_ep[n] && R.film.faces_ep[n].nopop); };   // kit_patch: a blink face (faces_ep nopop) is not a face change: no head pop
function tweened0(who, f) {
  const runs = R.perf[who], st0 = perfAt(runs, f), T = R.film.tween; if (!T || !T.frames) return st0;
  const st = T.idle && !/^walk/.test(st0.pose || '') ? { ...st0, idle: Math.round(8 * Math.sin(f / (R.fps * (T.idle_s || 2.6)) * 2 * Math.PI + who.length)) / 8 * T.idle } : st0;   // optional slow sway (sample C): head and body breathe on a ~2.6 s cycle
  const C = (R.poseCh ||= {})[who] ||= (() => { const out = []; let prev = null; for (const r of runs) { const s = r.state, k = [s.pose, s.prop, s.hand, s.dir].join('|'); if (prev && k !== prev.k) out.push({ f0: r.f0, from: { pose: prev.s.pose, prop: prev.s.prop, hand: prev.s.hand } }); if (!prev || k !== prev.k) prev = { k, s }; } return out; })();
  // face: a change between two calm kit faces ("k:...") or from the standard face is eased over T.face_frames (brows slide, eyes and mouth swap half-way)
  const FC = (R.faceCh ||= {})[who] ||= (() => { const out = []; let prev = null; for (const r of runs) { const fc = r.state.face || 'standard'; if (prev !== null && fc !== prev && !(NOPOP(fc) || NOPOP(prev))) out.push({ f0: r.f0, from: prev }); prev = fc; } return out; })();
  let fl = -1; for (let i = 0; i < FC.length && FC[i].f0 <= f; i++) fl = i;
  let face = {}; if (fl >= 0 && T.face_frames && f - FC[fl].f0 < T.face_frames && /^k:/.test(st.face || '')) face = { fw: { face: FC[fl].from }, fu: Math.round(EASE.inout((f - FC[fl].f0 + 1) / (T.face_frames + 1)) * 10) / 10 };
  let lo = -1; for (let i = 0; i < C.length && C[i].f0 <= f; i++) lo = i; if (lo < 0) return { ...st, ...face };
  const walk = /^walk/.test(st.pose || ''), N = walk ? (T.walk_frames ?? T.frames) : T.frames, d = f - C[lo].f0; if (d >= N) return { ...st, ...face };
  const u = (EASE[walk ? 'inout' : T.ease || 'out'] || EASE.out)((d + 1) / (N + 1));
  return { ...st, ...face, tw: C[lo].from, u: Math.round(u * 20) / 20 };
}
function perfAt(runs, f) { let lo = 0, hi = runs.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (runs[mid].f0 <= f) lo = mid; else hi = mid - 1; } return runs[lo].state; }
const getJSON = async u => { const r = await fetch(u); if (!r.ok) throw new Error('cannot load ' + u); return r.json(); };

window.setup = async (cfg) => {
  const dir = cfg.film.replace(/[^/]*$/, ''), film = await getJSON(cfg.film);
  const [camB, perf] = await Promise.all([getJSON(dir + 'out/plan/camera_baked.json'), getJSON(dir + 'out/plan/performance_baked.json')]);
  const words = await getJSON(dir + (film.words || 'voice/words.json')).catch(() => []);
  words.forEach(w => w._k = w.w.replace(/^[ .,?!"';:-]+|[ .,?!"';:-]+$/g, '').toLowerCase());
  const pk = cfg.puppets || '/puppets/', imp = n => import(pk + n + '.mjs');
  const [char2d, memes, memes2, bodies, cast] = await Promise.all([imp('char2d'), imp('memes'), imp('memes2'), imp('bodies'), imp('cast').catch(() => ({}))]);
  // the cast (150 characters on sheets): loaded only when film.json names one, as "cast:<name>" or "cast:sheet04/<name>" when two sheets share a name
  const castIndex = {}; let castkit = null, memes3 = null;
  if (Object.values(film.cast || {}).some(c => (c.puppet || '').startsWith('cast:'))) {
    castkit = await imp('castkit').catch(e => (console.warn('film.js: castkit.mjs missing from the puppet package: ' + e.message), null));
    for (const sh of (castkit ? cfg.sheets || [] : [])) { const m = await import(pk + 'sheets/' + sh).catch(e => (console.warn('film.js: ' + sh + ' did not load: ' + e.message), null)); for (const spec of (m && m.CAST) || []) { castIndex[sh.replace('.mjs', '') + '/' + spec.name] = spec; castIndex[spec.name] ??= spec; } }
  }
  memes3 = await imp('memes3').catch(() => null);
  const grips = await imp('grips').catch(() => (console.warn('film.js: grips.mjs missing from the puppet package (hands closed round held things)'), null));
  let motion = null;
  { const used = new Set(); for (const runs of Object.values(perf)) for (const r of (Array.isArray(runs) ? runs : [])) if (/^m:/.test((r.state || {}).pose || '')) used.add(r.state.pose);
    if (used.size) { const lib = await import(pk + 'motion/library.mjs').catch(e => (console.warn('film.js: motion library missing: ' + e.message), null));
      if (lib) { motion = { LIB: lib.LIB, mods: {}, cloth: await import(pk + 'motion/cloth_live.mjs').catch(() => null) /* live long cloth + capes, 2026-11-12 */ }; const want = new Set();
        for (const p of used) { const id = /^m:([^@+]+)/.exec(p)[1], e = lib.LIB.find(x => x.id === id), mn = (e ? e.module : id.slice(0, id.lastIndexOf('/'))).split('#')[0]; want.add(mn); want.add(mn + '_front'); }
        for (const mn of want) { const m = await import(pk + 'motion/moves/' + mn + '.mjs').catch(() => null); if (m) motion.mods[mn] = m; else if (!/_front$/.test(mn)) console.warn('film.js: move module not found: ' + mn); } } } }
  initPuppets({ char2d, memes, memes2, memes3, bodies, cast, castkit, castIndex, motion, grips, epFaces: film.faces_ep || null, held3d: (film.held3d || []).map(h => h.obj), faceShadow: film.face_shadow });   // kit_patch: episode faces; face_shadow false = no drawn face shadow on any card (CB 2026-11-15)

  const W = cfg.W || 540, H = cfg.H || 960, stage = document.getElementById('stage'); stage.innerHTML = ''; stage.style.width = W + 'px'; stage.style.height = H + 'px';
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
  const over = document.createElement('canvas'); over.width = W; over.height = H; stage.append(renderer.domElement, over);
  const cam = new THREE.PerspectiveCamera(60, W / H, .05, 600);
  R = { cfg, dir, film, cam: camB.frames, stationRows: camB.stations || null, perf, words, fps: film.fps || camB.fps || 30, W, H, renderer, over, camera: cam, places: {}, cards: {}, tex: new Map(), place: null, frame: -1 };
  R.end = R.cam.length;
  R.h3g = (film.held3d || []).filter(h => h.grip); R.hat = (film.hand_at || []).filter(h => h.hand === 'R' || h.hand === 'L'); if (!R.hat.length) R.hat = null; if (R.h3g.length) await h3gBuild(); else R.h3g = null;   // kit 2026-11-13: generic held 3D props (held3d entries with "grip"), built once

  // one scene per place, built once by its set module (episode sets win over kit sets)
  for (const [name, pl] of Object.entries(film.places || {})) {
    const scene = new THREE.Scene(), L = { ...(LIGHTS[pl.light] || LIGHTS.day), ...(pl.light_over || {}) }, set = pl.set || name;   // light_over (optional, film.json places.<name>.light_over): any of top, hor, sun, si, amb, ai, dir, tint replaces the preset's value for this place; tint is the colour laid over the character cards (white = cards keep their own colours). No key = the preset, as before
    const own = cfg.epSets ? cfg.epSets.includes(set + '.js') : (await fetch(dir + 'sets/' + set + '.js', { method: 'HEAD' })).ok;      // the episode's own sets/ folder wins over the kit's
    const mod = await import((own ? dir : './') + 'sets/' + set + '.js');
    const k3 = makeKit3d(THREE, scene, L, kit3dFlags(film, pl), toonMat);   // kit 2026-11-15 (look3d.mjs, PBR_FEATURES.md): opt-in real metal, relief, sky, trees; film.json "kit3d" switches them on, off = the old toon picture
    const ctx = { THREE, B2T, film, place: pl, light: L, toon: toonMat, pbr: k3.pbr, relief: k3.relief, sky: k3.sky, trees: k3.trees, fx: k3.fx /* FX BOLT HOOK 2026-11-15: ctx.fx.bolt (fx_bolt.mjs) */ };
    baseLight(scene, L); const built = (await mod.build(THREE, scene, film, ctx)) || {};
    R.places[name] = { scene, L, set, update: k3.finish(renderer, built.update), anchors: built.anchors || {} };
    // lamps bloom (Rick: every lamp, headlight and lens glows): a soft additive halo on each lit lens or globe, depth-tested so things in front hide it
    scene.updateMatrixWorld(true); const lamps = []; scene.traverse(o => { if (o.isMesh && o.userData.role === 'lamp' && /lens|globe/.test(o.name) && !/halo/.test(o.name)) lamps.push(o); });
    for (const o of lamps) { o.geometry.computeBoundingSphere(); const r = o.geometry.boundingSphere.radius, sp = glowSprite('#' + o.material.color.getHexString(), .6); sp.scale.setScalar(r * 9); sp.position.set(0, 0, o.geometry.type === 'CircleGeometry' ? r * 1.2 : 0); o.add(sp); }
  }
  // one card per character (a flat plane that turns to the lens about the vertical axis only, like Rick's cut-outs)
  for (const [who, entry] of Object.entries(film.cast || {})) {
    if (!perf[who]) continue;
    const m = metrics(entry), k = (entry.height || 1.7) / m.px;                       // metres per rig pixel, from the character's own height
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5 - (CARD.H - CARD.GY) / CARD.H, 0);   // origin on the ground line: feet stand on state.pos
    const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .03, toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat); mesh.scale.set(CARD.W * k, CARD.H * k, 1); mesh.castShadow = true;
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: .5 });
    const blob = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#1a1028', transparent: true, opacity: .22, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.scale.set(m.headPx * k * .42, m.headPx * k * .2, 1);   // contact shadow so feet never float
    mesh.userData.noExport = blob.userData.noExport = true; R.cards[who] = { entry, mesh, blob, k, m, key: null };
  }
  R.fx = (film.fx || []).map(e => ({ ...e, f: fr(e.at) })); R.moods = (film.moods || []).map(e => ({ ...e, f: fr(e.at) })); R.trans = (film.transitions || []).map(e => ({ ...e, f: fr(e.at) }));
  R.hl = (film.highlights || []).map(e => ({ ...e, f: fr(e.at), n: Math.max(2, Math.round((e.s ?? 1.2) * (film.fps || 30))) }));
  return { frames: R.end, fps: R.fps, W, H, cast: Object.keys(R.cards), places: Object.keys(R.places) };
};

function toonMat(color, opt = {}) {                                                  // 3-step toon shading shared by every set
  if (!toonMat.g) { const d = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]); toonMat.g = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); toonMat.g.minFilter = toonMat.g.magFilter = THREE.NearestFilter; toonMat.g.needsUpdate = true; }
  return new THREE.MeshToonMaterial({ color, gradientMap: toonMat.g, ...opt });
}
function baseLight(scene, L) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true, fog: false, toneMapped: false }));
  const top = new THREE.Color(L.top), hor = new THREE.Color(L.hor), pos = sky.geometry.attributes.position, col = [];
  for (let i = 0; i < pos.count; i++) { const t = Math.max(0, Math.min(1, pos.getY(i) / 400 * 2.2)), c = hor.clone().lerp(top, Math.pow(t, .7)); col.push(c.r, c.g, c.b); }
  sky.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); sky.userData.noExport = true; scene.add(sky);
  scene.fog = new THREE.Fog(L.hor, 30, 260);                                          // fog = horizon colour, so far things sink into the sky
  scene.add(new THREE.HemisphereLight(L.amb, '#6b6258', L.ai));
  const sun = new THREE.DirectionalLight(L.sun, L.si); sun.position.set(...L.dir).multiplyScalar(3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 90 }); sun.shadow.bias = -.0008; sun.shadow.radius = 3; scene.add(sun);
}

async function texture(key, svg, scale) {
  const id = key + '@' + scale, hit = R.tex.get(id); if (hit) { R.tex.delete(id); R.tex.set(id, hit); return hit; }   // refresh LRU order
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
  const c = document.createElement('canvas'); c.width = Math.round(CARD.W * scale); c.height = Math.round(CARD.H * scale); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  R.tex.set(id, t); if (R.tex.size > 60) { const [old, ot] = R.tex.entries().next().value; ot.dispose(); R.tex.delete(old); }   // holds are dead still, so a film needs few drawings; cap the rest
  return t;
}

function setCamera(c) {
  const cam = R.camera, p = B2T(c.pos), a = B2T(c.aim), fwd = a.clone().sub(p).normalize();
  cam.fov = c.fov_v; cam.updateProjectionMatrix(); cam.position.copy(p);
  cam.up.copy(c.up ? B2T(c.up) : Math.abs(fwd.y) > .97 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0));   // top-down: "up" = world Y, as in film_plan._basis
  cam.lookAt(a); if (c.roll) cam.rotateZ(-c.roll * Math.PI / 180);                    // + roll = the picture turns counter-clockwise (film_plan.project)
  cam.updateMatrixWorld(true);
}

// kit_patch (animator, Blender prep 2b): data only, never called by renderFrame. Places the held 3D objects for frame f exactly as renderFrame
// does (held3dUpdate) and returns their world transforms (three.js world = glTF, Y up), the lid hinge angle, the flame state and every
// card's acted card_scale. heldGLTF() returns the lighter and the ink fist geometry (glTF JSON, identity transforms) for the rebuild.
window.held3dDump = async (f) => {
  f = Math.max(0, Math.min(R.end - 1, f)); const c = R.cam[f], pl = R.places[c.place] || Object.values(R.places)[0], t = f / R.fps;
  await held3dUpdate(f, t, pl);
  const TRS = o => { o.updateWorldMatrix(true, false); const p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); o.matrixWorld.decompose(p, q, sc); const r = v => +v.toFixed(6);
    return { t: [p.x, p.y, p.z].map(r), q: [q.x, q.y, q.z, q.w].map(r), s: [sc.x, sc.y, sc.z].map(r), plan: [r(p.x), r(-p.z), r(p.y)] }; };
  const held = [];
  for (const hd of R.film.held3d || []) { const o = (R.h3 || {})[hd.who + ':' + hd.obj]; if (!o) continue; const P = held3dPose(hd, f), vis = !!(P && o.group.visible);
    const row = { who: hd.who, obj: hd.obj, visible: vis };
    if (vis) { const pin = o.group.getObjectByName('lighter_hinge_pin');
      Object.assign(row, { origin: TRS(o.group), anchor_scale: (H3_ANCH[hd.obj] || H3_ANCH.lighter).s, lid: +P.ob.lid.toFixed(4), lid_node: o.lid.name || null, lid_rot_z: +o.lid.rotation.z.toFixed(5), hinge_pin: pin ? TRS(pin) : null,
        fl: +(P.ob.fl ?? 0).toFixed(4), flame_on: !!o.flame.visible, flame: { local_scale: [o.flame.scale.x, o.flame.scale.y, o.flame.scale.z].map(v => +v.toFixed(5)), local_rot_z: +o.flame.rotation.z.toFixed(5), world: TRS(o.flame) },
        tilt_local: +(P.tiltLocal || 0).toFixed(5), grip_plan: [P.grip.x, -P.grip.z, P.grip.y].map(v => +v.toFixed(5)) });
      if (o.fist) { const F = o.fist; row.fist = { visible: !!F.g.visible, palm: TRS(F.palm), creases: F.cr.map(TRS), thumb: TRS(F.th), thumb_tip: TRS(F.tip) }; } }
    held.push(row); }
  for (const E of R.h3o || []) { const P = h3gPose(E, f); held.push({ who: E.hd.who, with: E.hd.with || null, obj: E.hd.obj, key: E.key, generic: true, kind: E.hd.grip, visible: !!P, ...(P ? { variant: P.obj === E.flip ? 'flip' : 'main', origin: TRS(P.obj.g), far: !!P.far, fists: E.fists.filter(F => F.g.visible).map(F => ({ t: TRS(F.g), wrap_rot_z: +F.spin.rotation.z.toFixed(5), kn: F.spin.scale.y })) } : {}) }); }   // kit 2026-11-13
  const cards = {}; for (const who of Object.keys(R.cards)) { const st = tweened(who, f); cards[who] = { visible: !!st.visible, card_scale: cardScale(who, f) }; }
  return { f, held, cards };
};
window.heldGLTF = async () => {
  const { GLTFExporter } = await import('./vendor/GLTFExporter.js'), out = {};
  for (const [key, o] of Object.entries(R.h3 || {})) {
    const L = o.group.clone(true); L.position.set(0, 0, 0); L.quaternion.identity(); L.scale.set(1, 1, 1); L.visible = true; L.traverse(m => { m.visible = true; });
    out[key + ':lighter'] = await new GLTFExporter().parseAsync(L, { binary: false, onlyVisible: false, trs: true });
    if (o.fist) { const g = new THREE.Group(); g.name = 'held3d_fist'; const id = m => { const k = m.clone(); k.position.set(0, 0, 0); k.quaternion.identity(); k.scale.set(1, 1, 1); k.visible = true; return k; };
      g.add(id(o.fist.palm), ...o.fist.cr.map(id), id(o.fist.th), id(o.fist.tip)); out[key + ':fist'] = await new GLTFExporter().parseAsync(g, { binary: false, onlyVisible: false, trs: true }); } }
  for (const E of R.h3o || []) { for (const [nm, M] of [['prop', E.main], ['prop_flip', E.flip]]) if (M) { const L = M.g.clone(true); L.position.set(0, 0, 0); L.quaternion.identity(); L.scale.set(1, 1, 1); L.visible = true; L.traverse(m => { m.visible = true; }); out[E.key + ':' + nm] = await new GLTFExporter().parseAsync(L, { binary: false, onlyVisible: false, trs: true }); }
    if (E.fists[0]) { const g = E.fists[0].g.clone(true); g.position.set(0, 0, 0); g.quaternion.identity(); g.scale.set(1, 1, 1); g.visible = true; out[E.key + ':fist'] = await new GLTFExporter().parseAsync(g, { binary: false, onlyVisible: false, trs: true }); } }   // kit 2026-11-13: generic held props and the 3D fist
  return out;
};
window.renderFrame = async (f, opt = {}) => {
  f = Math.max(0, Math.min(R.end - 1, f)); const c = R.cam[f], pl = R.places[c.place] || Object.values(R.places)[0], t = f / R.fps;
  setCamera(c);
  R.renderer.domElement.style.visibility = opt.overlayOnly ? 'hidden' : 'visible';
  if (opt.overlayOnly) { document.documentElement.style.background = document.body.style.background = 'transparent'; R.placeNow = pl; if (pl.update) pl.update(f, t, R); pl.scene.updateMatrixWorld(true); overlay(f, opt.captions ?? R.cfg.captions ?? true); R.frame = -1; return true; }   // the drawn layer alone (effects, glints, transitions, captions) on a clear ground: laid over the Blender picture
  for (const [who, card] of Object.entries(R.cards)) {
    const st = tweened(who, f), show = st.visible && (!st.place || st.place === c.place);
    if (card.mesh.parent !== pl.scene) { pl.scene.add(card.mesh); pl.scene.add(card.blob); }
    card.mesh.visible = card.blob.visible = show; if (!show) continue;
    const pos = B2T(st.pos); card.mesh.position.copy(pos); card.mesh.scale.set(CARD.W * card.k, CARD.H * card.k, 1);
    { const cs = cardScale(who, f); if (cs[0] !== 1 || cs[1] !== 1) { card.mesh.scale.x *= cs[0]; card.mesh.scale.y *= cs[1]; } }   // kit_patch (animator fix 6): acted size changes (cat puff, squash/stretch), about the feet
    card.blob.rotation.set(-Math.PI / 2, 0, 0); card.blob.scale.set(card.m.headPx * card.k * .42, card.m.headPx * card.k * .2, 1);   // lying may slide / turn them: reset each frame
    card.blob.position.set(pos.x, pos.y + .012, pos.z);   // 2026-11-13 lead fix: these three statements had been swallowed by the comment above, so every foot blob sat at the world origin
    card.mesh.rotation.order = 'YXZ'; card.mesh.rotation.y = Math.atan2(R.camera.position.x - pos.x, R.camera.position.z - pos.z);                       // face the lens
    { const hm = (card.entry.height || 1.7) * .55, hd = Math.hypot(R.camera.position.x - pos.x, R.camera.position.z - pos.z); card.mesh.rotation.x = -Math.atan2(R.camera.position.y - (pos.y + hm), hd); }
    { const lie = lieOf(st), D2 = Math.PI / 180; card.mesh.rotation.z = 0;   // LYING (2026-11-12, poses.mjs lieOf): the whole card turns flat, never squashed
      if (lie === 'flat') { card.mesh.rotation.x = -Math.PI / 2; card.mesh.rotation.z = (st.lie_yaw || 0) * D2; card.mesh.position.y += .015; }   // camera above: on the floor, face up
      else if (lie) {   // PERSPECTIVE (CB 2026-11-12 13:39Z): the body lies along a real line on the floor (act key lie_yaw, degrees; 0 = head toward plan -X); lie_cam.mjs picks side / top / feet / head drawing from the camera and turns the card along that line
        const h = card.entry.height || 1.7, len = h * .95, rt = new THREE.Vector3().setFromMatrixColumn(R.camera.matrixWorld, 0); rt.y = 0; rt.normalize();
        const hd = rt.clone().multiplyScalar((lie === 'back' ? -1 : 1) * (st.dir || 1)), yaw = st.lie_yaw ?? Math.atan2(hd.z, -hd.x) * 180 / Math.PI;   // no lie_yaw: across the shot, as before
        const L = lieLayout(THREE, R.camera, { centre: pos.clone(), yaw, lie, len });
        st.lie_art = L.art; if (L.art === 'side') st.dir = L.dir; st.view = L.art === 'side' ? 'side' : lie === 'front' ? 'back' : 'front';
        const hr = card.m.headPx * card.k * .5;
        placeLying(THREE, R.camera, card.mesh, L, { centre: pos.clone(), lie, len, hc: h * .5, lift: st.lie_lift != null ? h * st.lie_lift : hr * .95, bodyN: h / (CARD.H * card.k), wN: card.m.headPx * .5 / CARD.W, floorY: pos.y });
        card.blob.position.set(pos.x, pos.y + .012, pos.z); card.blob.rotation.set(-Math.PI / 2, 0, yaw * Math.PI / 180); card.blob.scale.set(len * .52, hr * .9, 1); } }   // side: head away from the facing side (back) or toward it (front); lifted by half the body so it rests ON the floor   // CB 2026-11-10: NEVER squash a character: the card also tips to the lens, so a high or low camera still sees the full silhouette
    const dist = R.camera.position.distanceTo(pos), px = CARD.H * card.k / dist * (R.H / (2 * Math.tan(c.fov_v * Math.PI / 360)));
    const scale = [.25, .5, 1, 2].find(s => s * CARD.H >= px * 1.2) || 2;                                               // drawing resolution follows the card's size on screen, so close-ups stay sharp
    const key = stateKey(who, st), tex = await texture(key, svgFor(card.entry, st), scale);
    const tn = cardTint(who, f); let tx = tex; if (tn && tn.a > 0) tx = tintedTexture(key + '@' + scale + '|' + tn.hex + tn.a, tex, card, tn);
    { const sh = pl.L.card_shade; if (sh && st.view !== 'back') {   // card_shade (optional, via light_over): white faces WITH a shadow side and light picked up ONLY from a real light source (CB 2026-11-10). lights: [{pos, color, range}] = the set's practical lights; far: {pos, color} = the moon or key, used when no practical is in range
        let best = null, bd = 1e9; for (const l of sh.lights || []) { if (l.when && (f < l.when[0] || f > l.when[1])) continue; const an = l.anchor && pl.anchors[l.anchor], lpos = an ? (typeof an === 'function' ? an(f) : an) : l.pos; if (!lpos) continue; const lp = B2T(lpos), dd = lp.distanceTo(pos) / (l.prio ?? 1); if (dd < (l.range ?? 4.5) && dd < bd) { bd = dd; best = { l, lp, k: Math.max(.45, 1 - dd / (l.range ?? 4.5)) }; } }
        if (!best && sh.far) best = { l: sh.far, lp: B2T(sh.far.pos), k: sh.far.k ?? .6 };
        if (best) { R.camera.updateMatrixWorld(); const inv = R.camera.matrixWorldInverse.copy(R.camera.matrixWorld).invert(), ls = best.lp.clone().applyMatrix4(inv).x >= pos.clone().applyMatrix4(inv).x ? 1 : -1, kq = Math.round(best.k * 4) / 4;
          tx = shadedTexture(key + '@' + scale + '|' + (tn && tn.a > 0 ? tn.hex + tn.a : '') + '|sh' + ls + best.l.color + kq, tx, card, { ...sh, side: -ls, rim: best.l.color, rim_amount: (sh.rim_amount ?? 1) * kq }); } } }
    { const cs = pl.L.costume_shade || R.film.costume_shade; if (cs && cs.amount > 0) { const sd = (st.view === '34' || st.view === 'side') ? -(st.dir || 1) : 1; tx = costumeShadedTexture(key + '@' + scale + '|cs' + sd + cs.amount + (cs.smooth > 0 ? 's' + cs.smooth : '') + (cs.keep_drawn_light ? 'k' : '') + (tx === tex ? '' : '|' + tx.uuid), tx, sd, cs, card, tex); } }   // CB 2026-11-12 rule: costume, headwear and cloth accessories get a darker side, the same side as the face's soft shadow   /* lighting-director 2026-11-13: ported from cart-army kit_patch (CB-APPROVED 02:12 "exept for the face") */
    if (card.mesh.material.map !== tx) { card.mesh.material.map = tx; card.mesh.customDepthMaterial.map = tx; card.mesh.material.needsUpdate = true; card.mesh.customDepthMaterial.needsUpdate = true; }
    card.mesh.material.color.set(pl.L.tint).multiplyScalar(pl.L.card_gain ?? 1); card.mesh.material.fog = pl.L.card_fog ?? true;   // card_gain / card_fog (optional, via light_over): lift the cards toward clean white (CB 2026-11-10: faces must not read grey)
                                                                               // scene tint: cards are mostly self-lit, tinted by the place
  }
  await held3dUpdate(f, t, pl);   // kit_patch: the 3D held lighter, grip anchor locked on the fist
  if (pl.update) pl.update(f, t, R);
  R.placeNow = pl; const lit = applyHighlights(f, pl);
  renderLook(pl, f, t); R.frame = f;
  for (const [mt, col, em] of lit) { mt.color.copy(col); if (em) mt.emissive.copy(em); }
  overlay(f, opt.captions ?? R.cfg.captions ?? true);
  return true;
};

function project(v3) { const p = v3.clone().project(R.camera); return p.z > 1 || p.z < -1 ? null : [(p.x + 1) / 2, (1 - p.y) / 2]; }
function propPos(name, f) {
  const pr = (R.film.props || {})[name], anc = R.placeNow && R.placeNow.anchors[name];
  if (anc) return B2T(typeof anc === 'function' ? anc(f) : anc);
  if (pr && pr.pos) return B2T([pr.pos[0], pr.pos[1], pr.pos[2] + (pr.h ?? 1.2)]);
  if (pr && pr.held_by && R.cards[pr.held_by]) { const st = perfAt(R.perf[pr.held_by], f), c = R.cards[pr.held_by]; return B2T([st.pos[0], st.pos[1], st.pos[2] + (c.entry.height || 1.7) * .5]); }   // roughly at the hands
  if (R.cards[name]) { const st = perfAt(R.perf[name], f); return B2T([st.pos[0], st.pos[1], st.pos[2] + (R.cards[name].entry.height || 1.7) * .6]); }
  return null;
}

// HIGHLIGHTS (2026-11-10, CB: "what about highlight vfx, I didn't see anything"; measured in Rick's railroad clip: the thing the line talks about
// lights up in a saturated glowing colour for about a second). film.json "highlights": [{ at, s (seconds, default 1.2), on, color, size, amp }].
//   on    = a set object by name (a group or a mesh: "lever3", "signal_arm"), a list of names, "/regex/" over object names, a character, a held prop or an anchor
//   color = one colour or a list the glow runs through (Rick: purple, magenta, pink, yellow, white)
// The object itself is tinted (a character card too: a face that goes purple), and a soft additive glow with twinkles is drawn over it.
const hlColor = (c, k) => { const L = Array.isArray(c) ? c : [c || '#ffd23f']; if (L.length === 1) return new THREE.Color(L[0]); const x = Math.min(.9999, Math.max(0, k)) * (L.length - 1), i = Math.floor(x); return new THREE.Color(L[i]).lerp(new THREE.Color(L[i + 1]), x - i); };
const hlAmp = (h, k) => Math.min(1, k / .12, (1 - k) / .3) * (h.amp ?? 1) * (.82 + .18 * Math.sin(k * h.n * .9));
function hlMeshes(h, pl) {
  const key = '_hl_' + pl.set; if (h[key]) return h[key]; const out = [], names = [].concat(h.on || []);
  for (const nm of names) { const rx = /^\/.*\/$/.test(nm) ? new RegExp(nm.slice(1, -1)) : null;
    if (rx) pl.scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && rx.test(o.name)) out.push(o); });
    else { const o = pl.scene.getObjectByName(nm); if (o) o.traverse(m => { if (m.isMesh && !m.isInstancedMesh) out.push(m); }); } }
  for (const m of out) if (!m.userData.ownMat) { m.material = m.material.clone(); m.userData.ownMat = true; }       // sets share one material per colour: a lit thing gets its own
  return h[key] = out;
}
function glowTex() { if (glowTex.t) return glowTex.t; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.22, 'rgba(255,255,255,.5)'); gr.addColorStop(.55, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return glowTex.t = new THREE.CanvasTexture(c); }
// a soft additive light bloom that lives IN the scene (depth-tested: a figure in front of the lit thing stays clean)
const glowSprite = (col = '#ffffff', op = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false })); sp.userData.noExport = true; return sp; };
function hlPoints(h, f, pl) {                                         // where the bloom sits: a typed point, an anchor, or three points along a single lit object (a lever glows along its length)
  if (Array.isArray(h.pos)) return [B2T(h.pos)];
  if (h.glow_on) { const p = propPos(h.glow_on, f); return p ? [p] : []; }
  if (typeof h.on !== 'string' || /^\//.test(h.on) || R.cards[h.on]) return [];
  const o = pl.scene.getObjectByName(h.on); if (!o) return [];
  if (!o.userData.hlBox) { const inv = new THREE.Matrix4().copy(o.matrixWorld).invert(), bx = new THREE.Box3(); o.updateWorldMatrix(true, true);
    o.traverse(m => { if (!m.isMesh) return; m.geometry.computeBoundingBox(); const q = m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)); bx.union(q); }); o.userData.hlBox = bx; }
  const bx = o.userData.hlBox, sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3()), ax = sz.x >= sz.y && sz.x >= sz.z ? 'x' : sz.y >= sz.z ? 'y' : 'z';
  o.updateWorldMatrix(true, false); return [.2, .55, .9].map(t => { const q = c.clone(); q[ax] = bx.min[ax] + sz[ax] * t; return q.applyMatrix4(o.matrixWorld); });
}
function applyHighlights(f, pl) {
  const lit = [];
  if (!pl.hlSprites) { pl.hlSprites = Array.from({ length: 9 }, () => { const sp = glowSprite(); sp.visible = false; pl.scene.add(sp); return sp; }); }
  for (const sp of pl.hlSprites) sp.visible = false; let si = 0;
  for (const h of R.hl || []) { const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue; const a = hlAmp(h, k), col = hlColor(h.color, k);
    for (const m of hlMeshes(h, pl)) { const mt = m.material; lit.push([mt, mt.color.clone(), mt.emissive ? mt.emissive.clone() : null]);
      if (mt.emissive) { mt.emissive.copy(col).multiplyScalar(a * .9); mt.color.lerp(col, a * .7); } else mt.color.lerp(col, a * .85); }
    if (h.glow === false || h.flare) continue;
    for (const p of hlPoints(h, f, pl)) { const sp = pl.hlSprites[si++]; if (!sp) break; sp.visible = true; sp.position.copy(p); sp.scale.setScalar((h.size ?? .6) * (1 + .1 * Math.sin(f * .7))); sp.material.color.copy(col); sp.material.opacity = Math.min(1, a * (h.bloom ?? .8)); } }
  return lit;
}
// a face that changes colour (Rick: "his face goes purple"): only the bare head of the card is tinted, the hat, hair and clothes keep their colours
function cardTint(who, f) { for (const h of R.hl || []) { if (![].concat(h.on || []).includes(who)) continue; const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue;
  return { hex: hlColor(h.color, Math.round(k * 6) / 6).getHexString(), a: Math.round(Math.min(1, k / .15, (1 - k) / .25) * 5) / 5 * (h.card ?? .8) }; } return null; }
// card_shade = { side: 1 | -1 (which side of the head is in shadow, +1 = screen right), shadow: '#hex', amount: 0..1, rim: '#hex', rim_amount: 0..1 }
// Only the near-white skin pixels of the head change: the lit side stays pure white, the far side gets a soft coloured shadow, and its very edge picks up the scene's light.
function shadedTexture(id, tex, card, sh) {
  const hit = R.tex.get(id); if (hit) return hit; const src = tex.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const sc = src.height / CARD.H, y1 = Math.min(c.height, Math.round((card.m.hy + card.m.headPx * .56) * sc)), im = g.getImageData(0, 0, c.width, y1), d = im.data, W = c.width;
  const hx = (c, k) => ((parseInt(c.slice(1), 16) >> (16 - 8 * k)) & 255) / 255, S = [0, 1, 2].map(k => hx(sh.shadow || '#b8c2ee', k)), Rm = [0, 1, 2].map(k => hx(sh.rim || '#ffffff', k)), A = sh.amount ?? .7, RA = sh.rim_amount ?? .8, side = sh.side ?? 1;
  const skin = i => d[i + 3] >= 40 && d[i] >= 150 && d[i + 1] >= 150 && d[i + 2] >= 150 && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) <= 40;
  const cx0 = W / 2, cy = card.m.hy * sc, Rr = card.m.headPx * .5 * sc, ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  let sx = 0, n = 0; const ext = new Int32Array(y1 * 2).fill(-1), xa = Math.max(0, Math.round(cx0 - Rr * 1.25)), xb = Math.min(W - 1, Math.round(cx0 + Rr * 1.25));
  for (let y = 0; y < y1; y++) for (let x = xa; x <= xb; x++) if (skin((y * W + x) * 4)) { sx += x; n++; if (ext[y * 2] < 0) ext[y * 2] = x; ext[y * 2 + 1] = x; }   // per row: first and last skin pixel = the head's real edge
  if (!n) { R.tex.set(id, tex); return tex; }
  const cx = sx / n, rw = Rr * (sh.rim_width ?? .11);
  // RICK SHADE (default; CB 2026-11-11 "remove that purple shadow from face", "use real shadow like rick clips"). Measured on Rick's faces: no coloured shadow;
  // the shadow is the SAME light, only ~8 % darker, as a narrow soft band along the far edge, and a hat or hair brim throws a short shadow on the forehead.
  // film.json card_shade.style = "color" brings back the old coloured shadow (card_shade.shadow).
  const RICK = (sh.style ?? 'rick') === 'rick', top = new Int32Array(W).fill(-1);
  if (RICK) { for (let k = 0; k < 3; k++) S[k] = .9 * (.9 + .1 * Rm[k]);
    let y0 = y1; for (let y = 0; y < y1; y++) if (ext[y * 2] >= 0) { y0 = y; break; }   // the highest skin row of the head
    const gap = Math.max(5, Math.round(Rr * .14));
    for (let x = xa; x <= xb; x++) { for (let y = y0; y < Math.min(y1, y0 + Rr * 1.2); y++) { if (skin((y * W + x) * 4)) { const ya = y - gap; if (ya >= 0 && d[(ya * W + x) * 4 + 3] >= 200) top[x] = y; break; } } } }   // covered: opaque hat or hair right above the first skin pixel (a bare head has only its thin outline, then air)
  for (let y = 0; y < y1; y++) { if (ext[y * 2] < 0) continue; const e = side > 0 ? ext[y * 2] : ext[y * 2 + 1];   // the rim sits on the LIGHT side (opposite the shadow side)
    for (let x = xa; x <= xb; x++) { const i = (y * W + x) * 4; if (!skin(i)) continue;
      const u = (x - cx) / Rr * side, v = (y - cy) / Rr, rim = (1 - ss(0, rw, Math.abs(x - e))) * RA * ss(-.9, -.3, -Math.abs(v));
      let s = RICK ? ss(.35, 1.0, u + v * .25) * A : ss(-.02, .5, u + v * .2) * A;
      const hs = RICK && top[x] >= 0 ? (1 - ss(Rr * .14, Rr * .32, y - top[x])) * .3 * (sh.hat_shadow ?? 0)   /* CB 2026-11-12 11:55Z: no brim shadow on faces, default 0 */ : 0;   // the hat or hair brim casts a short soft shadow on the forehead (Rick's police cap: ~30 % darker, same hue)
      for (let k = 0; k < 3; k++) { let p = d[i + k] / 255; p = p * (1 - s + s * S[k]) * (1 - hs); p = p + (Rm[k] - p) * rim; d[i + k] = Math.round(255 * Math.min(1, p)); } } }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; R.tex.set(id, t); if (R.tex.size > 60) { const [old, ot] = R.tex.entries().next().value; ot.dispose(); R.tex.delete(old); } return t;
}
// COSTUME SHADOW SIDE (CB 2026-11-12 18:57Z: "for the costume head or cloth accessoires etc. also have darker shadow where the lights falls. at the side. this is a rule").
// Per row of the card: the coloured (not skin, not ink) pixels get a soft ramp, darker toward the side away from the light (side +1 = screen right), the same side as the
// template's face shadow. A shade only: same hue, no texture, no lines. cs = { amount (0..1, darkness at the edge), start (0..1 across the row where it begins), cool (0..1 blue push) }
function costumeShadedTexture(id, tex, side, cs, card, base) {   /* fireworks kit_patch: the face mask is read from the UNSHADED base drawing, so card_shade's rim / burst tint on the face can never be mistaken for costume */
  const hit = R.tex.get(id); if (hit) return hit; const src = tex.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const W = c.width, H = c.height, im = g.getImageData(0, 0, W, H), d = im.data, A = cs.amount ?? .3, st0 = cs.start ?? .45, cool = cs.cool ?? .15;
  let bd = null; if (base && base !== tex && base.image && base.image.width === W && base.image.height === H) { const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const g2 = c2.getContext('2d'); g2.drawImage(base.image, 0, 0); bd = g2.getImageData(0, 0, W, H).data; }
  const sc = H / CARD.H, hcx = W / 2, hcy = card.m.hy * sc, hr2 = (card.m.headPx * .5 * sc * 1.02) ** 2, ink = i => d[i] + d[i + 1] + d[i + 2] < 150;
  /* cs.keep_drawn_light (CB 2026-11-15, lightning spear: "still generated shadow ... on the character face and chicken"): without card_shade there is no base copy (bd null), so the skin test fell back to a
     head circle (lo >= 185 inside, lo >= 246 outside): the outer part of the template's DRAWN face crescent (#c9c9ce) and a white card with no person head (the hen) were ramped as costume = a hard grey band / wedge.
     true = every white / light-grey unsaturated pixel of the drawing (face, its drawn crescent, teeth, the hen's white) is left exactly as drawn, wherever it sits; coloured costume keeps its shade. Default off = the old picture. */
  if (!bd && cs.keep_drawn_light) bd = d;
  const skin = i => { const q = bd || d, p = i / 4, x = p % W, y = (p - x) / W, ch = Math.max(q[i], q[i + 1], q[i + 2]) - Math.min(q[i], q[i + 1], q[i + 2]), lo = Math.min(q[i], q[i + 1], q[i + 2]); return ch <= 40 && (bd ? lo >= 150 : ((x - hcx) ** 2 + (y - hcy) ** 2 < hr2 ? lo >= 185 : lo >= 246)); };   /* with the base drawing: every white / light-grey pixel of the drawing (face, its soft template shade, teeth) is left as drawn */   // the face (white and its soft grey shadow) keeps the template's own shading; outside the head only pure white is skipped
  /* cs.smooth (CB 2026-11-15, lightning spear: "the horizontal lines" in the hair): the shade ramp is measured per pixel row, so rows whose left or right end jumps (hair beside the white face, a cap band) get
     different ramps and show as horizontal streaks. With smooth > 0 the row ends are averaged over +-smooth card pixels before the ramp. Default off = the old picture. */
  const XL = new Float32Array(H).fill(-1), XR = new Float32Array(H).fill(-1);
  for (let y = 0; y < H; y++) { let xl = -1, xr = -1; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] < 128 || ink(i) || skin(i)) continue; if (xl < 0) xl = x; xr = x; } XL[y] = xl; XR[y] = xr; }
  if (cs.smooth > 0) { const n = Math.max(1, Math.round(cs.smooth * sc)), a = XL.slice(), b = XR.slice(); for (let y = 0; y < H; y++) { if (a[y] < 0) continue; let sl = 0, sr = 0, m = 0; for (let q = Math.max(0, y - n); q <= Math.min(H - 1, y + n); q++) if (a[q] >= 0) { sl += a[q]; sr += b[q]; m++; } XL[y] = sl / m; XR[y] = sr / m; } }
  for (let y = 0; y < H; y++) { const xl = XL[y], xr = XR[y];
    if (xl < 0 || xr - xl < 6) continue; const w = xr - xl;
    for (let x = (cs.smooth > 0 ? 0 : xl); x <= (cs.smooth > 0 ? W - 1 : xr); x++) { const i = (y * W + x) * 4; if (d[i + 3] < 40 || ink(i) || skin(i)) continue; let u = Math.min(1, Math.max(0, (x - xl) / w)); if (side < 0) u = 1 - u; let t = (u - st0) / (1 - st0); if (t <= 0) continue; t = Math.min(1, t); t = t * t * (3 - 2 * t); const k = 1 - A * t;
      d[i] = Math.round(d[i] * k * (1 - cool * t * .5)); d[i + 1] = Math.round(d[i + 1] * k * (1 - cool * t * .25)); d[i + 2] = Math.round(d[i + 2] * Math.min(1, k * (1 + cool * t * .2))); } }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; R.tex.set(id, t); if (R.tex.size > 60) { const [old, ot] = R.tex.entries().next().value; ot.dispose(); R.tex.delete(old); } return t;
}
function tintedTexture(id, tex, card, tint) {
  const hit = R.tex.get(id); if (hit) return hit; const src = tex.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const sc = src.height / CARD.H, y1 = Math.min(c.height, Math.round((card.m.hy + card.m.headPx * .56) * sc)), im = g.getImageData(0, 0, c.width, y1), d = im.data, n = parseInt(tint.hex, 16), tr = (n >> 16) / 255, tg = ((n >> 8) & 255) / 255, tb = (n & 255) / 255, A = tint.a;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40 || d[i] < 150 || d[i + 1] < 150 || d[i + 2] < 150 || Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 40) continue; d[i] *= 1 - A + A * tr; d[i + 1] *= 1 - A + A * tg; d[i + 2] *= 1 - A + A * tb; }   // skin = the near-white, unsaturated pixels of the head
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; R.tex.set(id, t); return t;
}
// Held things (a coin, a bottle, the letter in a hand) have no set object: they get a small lens glint drawn over the picture, no star, no outline.
function drawHighlights(g, f, W, H) {
  const pl = R.placeNow; if (!pl) return;
  for (const h of R.hl || []) { if (!h.flare) continue; const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue; const p3 = Array.isArray(h.pos) ? B2T(h.pos) : propPos(h.glow_on || h.on, f), p = p3 && project(p3); if (!p) continue;
    drawFx(g, 'glint', p[0] * W, p[1] * H, k, W * (h.size ?? 1), h.f, '#' + hlColor(h.color, k).getHexString()); }
}

// Drawn 2D effects for the animatic (2026-11-10: CB wants to SEE the effects, not timing rings). k = 0..1 through the effect, u = W-relative unit.
// The look pass may replace them with particles; the timing and the place stay.
function drawFx(g, kind, x, y, k, W, seed, tintCol) {
  // 2026-11-10 (CB: "too much cartoon highlight effects, like stars; it needs to look cool, like Rick's Clips"): NO drawn stars, bursts, ink outlines or
  // speed lines. Like Rick: light (a soft bloom, a thin lens streak), small hot sparks that fall, soft steam, thin ripples in the air.
  const u = W / 540, rnd = n => { const v = Math.sin((seed + 1) * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); }, out = 1 - (1 - k) * (1 - k);
  const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`; };
  const bloom = (px, py, r, col, a) => { if (r < .5 || a <= 0) return; const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.35, rgba(col, a * .5)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); };
  const sparks = (n, speed) => { for (let i = 0; i < n; i++) { const a = -Math.PI * (.08 + .84 * rnd(i)), v = speed * (.35 + rnd(i + 5)) * u, life = .5 + .5 * rnd(i + 11); if (k > life) continue; const q = k / life, px = Math.cos(a) * v * k, py = Math.sin(a) * v * k + 520 * u * k * k, vx = Math.cos(a) * v, vy = Math.sin(a) * v + 1040 * u * k, L = Math.hypot(vx, vy) || 1, tl = (10 + 16 * rnd(i + 3)) * u * (1 - q);
    g.strokeStyle = rgba(i % 3 ? '#ffd27a' : '#ff8a3a', 1 - q * q); g.lineWidth = (1.4 + 1.6 * rnd(i + 7)) * u * (1 - q * .6); g.beginPath(); g.moveTo(px, py); g.lineTo(px - vx / L * tl, py - vy / L * tl); g.stroke(); } };
  const puffs = (n, col, kk, ox) => { const o2 = 1 - (1 - kk) * (1 - kk); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i) - .5) * 1.5, d = (10 + 90 * o2 * (.5 + rnd(i + 9))) * u, r = (22 + 46 * o2 * (.6 + rnd(i + 3))) * u; bloom(ox + Math.cos(a) * d, Math.sin(a) * d - 34 * u * o2, r, col, (1 - kk * kk) * .8); } };
  g.save(); g.translate(x, y); g.lineCap = 'round';
  if (/clank|knock|hit|stamp|kick/.test(kind)) {                      // impact: a white-hot flash of light for 5 frames, a thin ring of air, a few sparks
    g.globalCompositeOperation = 'lighter'; if (k < .28) bloom(0, 0, (50 + 260 * k) * u, '#fff3d0', (1 - k / .28) * .95);
    g.strokeStyle = rgba('#ffffff', .4 * (1 - k)); g.lineWidth = 2.2 * u * (1 - k); g.beginPath(); g.arc(0, 0, (20 + 120 * out) * u, 0, 7); g.stroke();
    if (/dust/.test(kind)) { g.globalCompositeOperation = 'source-over'; puffs(5, '#e6cfae', k, 0); } else sparks(/knock|stamp/.test(kind) ? 7 : 16, 420);
  } else if (/dust|puff|steam|whistle|smoke/.test(kind)) {            // soft steam, no outline; "x2" / "x4" in the name = that many bursts one after the other (counted toots)
    const m = /x(\d)/.exec(kind), n = m ? +m[1] : /counted/.test(kind) ? 3 : 1, span = 1 / (1 + .55 * (n - 1)), ear = /ear/.test(kind);
    for (let j = 0; j < n; j++) { const kj = (k - j * .55 * span) / span; if (kj < 0 || kj >= 1) continue; if (ear) { for (const sx of [-1, 1]) { g.save(); g.translate(sx * 70 * u, 0); g.rotate(sx * .5); puffs(6, '#ffffff', kj, 0); puffs(4, '#ffffff', Math.min(.999, kj * 1.3), 0); g.restore(); } } else puffs(6, /dust/.test(kind) ? '#e6cfae' : '#ffffff', kj, (j - (n - 1) / 2) * 26 * u); }
  } else if (/glint|coin|glow|shine/.test(kind)) {                    // lens glint: a small bloom and ONE thin horizontal streak (anamorphic), never a cross: a cross reads as a cartoon star
    g.globalCompositeOperation = 'lighter'; const a = Math.sin(Math.PI * Math.min(1, k * 1.25)), col = tintCol || '#fff2cc';
    bloom(0, 0, 52 * u, col, a * .8); bloom(0, 0, 13 * u, '#ffffff', a);
    for (const [lw, lh, al, c2] of [[250, 1.6, .75, '#ffffff'], [150, 5, .22, col]]) { const gr = g.createLinearGradient(-lw * u * a, 0, lw * u * a, 0); gr.addColorStop(0, rgba(c2, 0)); gr.addColorStop(.5, rgba(c2, al * a)); gr.addColorStop(1, rgba(c2, 0)); g.fillStyle = gr; g.fillRect(-lw * u * a, -lh * u * a, lw * 2 * u * a, lh * 2 * u * a); }
  } else if (/spark/.test(kind)) {                                    // grinding metal: many fine sparks
    g.globalCompositeOperation = 'lighter'; bloom(0, 0, 30 * u, '#ffd27a', (1 - k) * .7); sparks(26, 380);
  } else if (/scream|sound|ring|toot/.test(kind)) {                   // sound: thin ripples in the air
    for (let i = 0; i < 3; i++) { const kk = k - i * .14; if (kk <= 0) continue; g.strokeStyle = rgba('#ffffff', .55 * (1 - kk)); g.lineWidth = 2.4 * u; g.beginPath(); g.arc(0, 0, (30 + 210 * (1 - (1 - kk) * (1 - kk))) * u, 0, 7); g.stroke(); }
  } else if (/sweat|spit|drop|ink/.test(kind)) {                      // a few small drops, no outline
    for (let i = 0; i < 5; i++) { const a = -Math.PI * (.15 + .7 * rnd(i)), v = (50 + 90 * rnd(i + 2)) * u, px = Math.cos(a) * v * out, py = Math.sin(a) * v * out + 160 * u * k * k; g.fillStyle = rgba(/ink/.test(kind) ? '#b3261e' : '#bfe6ff', (1 - k * k) * .9); g.beginPath(); g.ellipse(px, py, 3.2 * u, 5.5 * u, a + Math.PI / 2, 0, 7); g.fill(); }
  } else if (/paper|letter/.test(kind)) {                             // sheets of paper tumbling up, lit from one side
    for (let i = 0; i < 7; i++) { const px = (rnd(i) - .5) * 260 * u * out, py = -(60 + 260 * rnd(i + 4)) * u * out, sq = Math.abs(Math.cos(k * 9 * (rnd(i) - .5) + i)); g.save(); g.translate(px, py); g.rotate((rnd(i + 8) - .5) * 3 + k * 4 * (rnd(i) - .5)); g.globalAlpha = 1 - k * k; g.fillStyle = sq > .5 ? '#fbf6e8' : '#d8d0bd'; g.fillRect(-15 * u, -21 * u * sq, 30 * u, 42 * u * sq); g.restore(); }
  } else { g.globalCompositeOperation = 'lighter'; bloom(0, 0, (30 + 60 * k) * u, '#fff2cc', (1 - k) * .7); }
  g.restore(); g.globalAlpha = 1;
}

function drawTransition(g, e, k, f, W, H) {
  const u = W / 540, INK = '#231218', a = k < .5 ? k * 2 : (1 - k) * 2, ez = a * a * (3 - 2 * a), diag = Math.hypot(W, H);
  const at = name => { const p3 = name && propPos(name, f), p = p3 && project(p3); return p && p[0] > -.2 && p[0] < 1.2 && p[1] > -.2 && p[1] < 1.2 ? [p[0] * W, p[1] * H] : [W / 2, H * .55]; };
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (/match/.test(e.kind)) {                                             // OBJECT MATCH (CB 2026-11-10: push in to the contract, then it becomes the one in his hand): the story object itself
    // lifts off where it lies (from), grows until it covers the frame (the cut or the hidden jump sits there), and shrinks onto the same object in the next picture (to).
    const closing = k < .5, P = closing ? e.from : e.to, sz = (closing ? e.from_size : e.to_size) || [.3, .21], rot = ((closing ? e.from_rot : e.to_rot) || 0) * Math.PI / 180;
    const p3 = Array.isArray(P) ? B2T(P) : propPos(P, f), p = p3 && project(p3), x0 = p ? p[0] * W : W / 2, y0 = p ? p[1] * H : H / 2, dist = p3 ? R.camera.position.distanceTo(p3) : 1, foc = H / (2 * Math.tan(R.camera.fov * Math.PI / 360));
    const w0 = sz[0] / dist * foc, h0 = sz[1] / dist * foc, e2 = ez * ez, x = x0 + (W / 2 - x0) * ez, y = y0 + (H / 2 - y0) * ez, w = w0 + (W * 1.5 - w0) * e2, h = h0 + (H * 1.5 - h0) * e2, r = rot * (1 - ez);
    g.translate(x, y); g.rotate(r); g.globalAlpha = Math.min(1, a * 5);
    g.fillStyle = e.color || '#fbf6e8'; g.strokeStyle = INK; g.lineWidth = Math.max(3 * u, w * .012); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.stroke();
    g.globalAlpha = Math.min(1, a * 5) * Math.max(0, 1 - ez * 1.25);                                                    // the writing fades as the sheet fills the frame: the middle is plain paper
    g.fillStyle = '#8c2a24'; g.fillRect(-w * .22, -h * .40, w * .44, h * .07); g.fillStyle = '#3a2a30'; for (let i = 0; i < 5; i++) g.fillRect(-w * .40, -h * .24 + i * h * .10, w * (i === 4 ? .5 : .8), h * .035);
    g.fillStyle = '#c4261c'; g.beginPath(); g.arc(w * .26, h * .33, Math.min(w, h) * .09, 0, 7); g.fill(); g.lineWidth = Math.max(2 * u, w * .006); g.stroke();
  } else if (/calendar/.test(e.kind)) {                                   // TIME PASSES (Rick dissolves over a calendar): a wall calendar drops over the frame, its days flip, the last page tears away
    const n = e.days || 30, cover = k < .5, b = cover ? Math.min(1, k / .3) : (k - .5) * 2, eb = b * b * (3 - 2 * b), day = cover ? Math.max(1, Math.min(n, Math.round(1 + (n - 1) * Math.max(0, (k - .22) / .26)))) : n;
    if (cover) g.translate(0, -H * 1.05 * (1 - eb)); else { g.translate(-W * .1, 0); g.rotate(-eb * .55); g.translate(W * .1, eb * eb * H * 1.5); }
    g.fillStyle = '#fbf6e8'; g.strokeStyle = INK; g.lineWidth = 6 * u; g.beginPath(); g.rect(-W * .03, -H * .03, W * 1.06, H * 1.06); g.fill(); g.stroke();
    g.fillStyle = '#c4261c'; g.fillRect(-W * .03, -H * .03, W * 1.06, H * .21); g.beginPath(); g.moveTo(-W * .03, H * .18); g.lineTo(W * 1.03, H * .18); g.stroke();
    for (const x of [.28, .72]) { g.fillStyle = INK; g.beginPath(); g.arc(W * x, H * .075, 20 * u, 0, 7); g.fill(); g.strokeStyle = '#cfd6dd'; g.lineWidth = 9 * u; g.beginPath(); g.arc(W * x, H * .04, 26 * u, Math.PI * .9, Math.PI * 2.1); g.stroke(); g.strokeStyle = INK; g.lineWidth = 6 * u; }
    if (e.label) { g.fillStyle = '#fbf6e8'; g.font = `900 ${H * .05}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.label, W / 2, H * .135); }
    g.fillStyle = INK; g.font = `900 ${H * .3}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(day), W / 2, H * .5);
    g.globalAlpha = .25; for (let i = 0; i < 3; i++) g.fillRect(W * .2, H * (.74 + i * .045), W * (i === 2 ? .35 : .6), H * .012); g.globalAlpha = 1;
  } else if (/steam/.test(e.kind)) {
    const rnd = i => { const v = Math.sin((e.f + 1) * 12.9898 + i * 78.233) * 43758.5453; return v - Math.floor(v); };
    if (a > .86) { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); }
    for (let i = 0; i < 26; i++) { const cx = ((i % 5) + .5 + (rnd(i) - .5) * .7) / 5 * W, cy = (Math.floor(i / 5) + .5 + (rnd(i + 40) - .5) * .6) / 5.2 * H + (1 - ez) * H * (.25 + .3 * rnd(i + 9)), r = ez * W * (.2 + .12 * rnd(i + 80));
      if (r < 2) continue; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.25), c0 = i % 3 ? '244,241,234' : '226,222,214'; gr.addColorStop(0, `rgba(${c0},1)`); gr.addColorStop(.55, `rgba(${c0},.92)`); gr.addColorStop(1, `rgba(${c0},0)`); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * 1.25, 0, 7); g.fill(); }   // soft steam, no drawn outline (CB 2026-11-10: not cartoonish)
  } else {                                                                 // wheel / iris
    const closing = k < .5, [x, y] = at(closing ? e.from : e.to), col = e.color || '#2b2d36', rim = '#cfd6dd';
    if (closing) { const r = 14 * u + ez * ez * diag * 1.05; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = col; g.fill(); g.lineWidth = Math.max(5 * u, r * .09); g.strokeStyle = rim; g.stroke(); g.lineWidth = 4 * u; g.strokeStyle = INK; g.stroke();
      g.strokeStyle = rim; g.lineWidth = Math.max(4 * u, r * .05); for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3 + k * 9; g.beginPath(); g.moveTo(x + Math.cos(t) * r * .16, y + Math.sin(t) * r * .16); g.lineTo(x + Math.cos(t) * r * .9, y + Math.sin(t) * r * .9); g.stroke(); }
      g.beginPath(); g.arc(x, y, r * .16, 0, 7); g.fillStyle = rim; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = INK; g.stroke(); }
    else { const b = (k - .5) * 2, eb = b * b * (3 - 2 * b), r = eb * diag * 1.05, T = Math.PI * 2; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(x + r, y); g.arc(x, y, r, 0, T, true); g.closePath(); g.fillStyle = col; g.fill('evenodd'); g.beginPath(); g.arc(x, y, r, 0, T); g.lineWidth = Math.max(5 * u, r * .06); g.strokeStyle = rim; g.stroke(); g.lineWidth = 4 * u; g.strokeStyle = INK; g.stroke(); }
  }
  g.restore();
}

function overlay(f, captions) {
  const g = R.over.getContext('2d'), W = R.W, H = R.H, t = f / R.fps; g.clearRect(0, 0, W, H);
  // PLACEHOLDER mood: a short colour wash on the word, so the animatic shows WHERE the light changes. The real change is a light/grade key in the look pass.
  for (const m of R.moods) { const k = (f - m.f) / (R.fps * .5); if (k >= 0 && k < 1) { g.fillStyle = /red/.test(m.look) ? '#ff3b30' : /warm|gold/.test(m.look) ? '#ffb347' : /spot|dark/.test(m.look) ? '#000000' : /cold|blue/.test(m.look) ? '#3b82f6' : '#ffffff'; const col = g.fillStyle, gr = g.createRadialGradient(W / 2, H * .45, H * .18, W / 2, H * .45, H * .75); gr.addColorStop(0, col + '00'); gr.addColorStop(1, col + 'ff'); g.fillStyle = gr; g.globalAlpha = .34 * (1 - k) * (1 - k); g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
  // PLACEHOLDER fx: an expanding ring at the named thing, so effects are timed and placed before they are designed.
  drawHighlights(g, f, W, H);
  for (const e of R.fx) { const k = (f - e.f) / (R.fps * (e.s ?? .8)); if (k >= 0 && k < 1) { const p3 = Array.isArray(e.pos) ? B2T(e.pos) : propPos(e.on, f), p = p3 && project(p3); if (p) drawFx(g, e.kind || '', p[0] * W, p[1] * H, k, W * (e.size ?? 1.25) * Math.max(.3, Math.min(1.5, 3 / R.camera.position.distanceTo(p3))), e.f); } }   // an effect is a thing in the world: it is smaller when the camera is far
  // DRAWN TRANSITIONS (2026-11-10, CB: transitions through a form or an object, like Rick's): film.json "transitions": [{ at, kind, frames, from, to }].
  //   "wheel": the picture closes into a spoked wheel that grows out of the thing named in "from", and opens again as a round hole on the thing named in "to".
  //   "steam": drawn steam puffs boil up over the frame and clear again. The middle frame (at) is fully covered: put the hidden jump or the cut there.
  for (const e of R.trans || []) { const n = e.frames || 16, k = (f - (e.f - n / 2)) / n; if (k < 0 || k >= 1) continue; drawTransition(g, e, k, f, W, H); }
  if (!captions || !R.words.length) return;
  if (R.film.caption_style === 'old') return oldCaption(g, t, W, H);
  // RICK CAPTIONS (CB 2026-11-11 "make caption font and size like ricks"; measured on 30 of his frames, 720x1280):
  //   Arial Bold (heavy grotesque, double-storey a), lowercase as spoken, punctuation kept ("wine.", "get out."),
  //   white fill, thin black outline, soft dark drop shadow down-right, baseline at 71.5 % of the height,
  //   ascender-to-descender 3.5 % of the height (font size 3.9 % H, measured on "locking"), centred; 1 word, or 2 when the first is a short word ("a ball", "get out.").
  //   No pop or scale animation: the chunk simply appears 0.1 s before it is spoken.
  if (!R.capChunks) { R.capChunks = []; const ws = R.words; for (let j = 0; j < ws.length; j++) { const a = ws[j], b = ws[j + 1], ta = a.w.trim(); if (b && ta.length <= 3 && !/[.,?!;:]$/.test(ta) && (ta + ' ' + b.w.trim()).length <= 10 && b.s - a.e < .25) { R.capChunks.push({ s: a.s, e: b.e, w: ta + ' ' + b.w.trim() }); j++; } else R.capChunks.push({ s: a.s, e: a.e, w: ta }); } }
  const C = R.capChunks; let c = null, i = -1; for (let j = 0; j < C.length; j++) if (C[j].s - .1 <= t) { c = C[j]; i = j; }
  if (!c) return; const nx = C[i + 1]; if (t > (nx ? nx.s - .1 : c.e + .35) || t > c.e + .6) return;
  const size = H * .039 * (R.film.caption_rick_scale ?? 1), txt = c.w.replace(/["\u201c\u201d]/g, ''), y = H * .715;
  g.font = `700 ${size}px Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = size * .12; g.shadowOffsetX = size * .05; g.shadowOffsetY = size * .07;
  g.lineWidth = size * .13; g.strokeStyle = '#000'; g.strokeText(txt, W / 2, y); g.restore();
  g.fillStyle = '#fff'; g.fillText(txt, W / 2, y);
}
function oldCaption(g, t, W, H) {
  // the earlier style (one Arial Black word, pop 108 % -> 100 %, centre at 67 %): film.json "caption_style": "old"
  let w = null, i = -1; for (let j = 0; j < R.words.length; j++) if (R.words[j].s - .1 <= t) { w = R.words[j]; i = j; }
  if (!w) return; const next = R.words[i + 1]; if (t > (next ? next.s - .1 : w.e + .35) || t > w.e + .6) return;
  const k = Math.min(1, (t - (w.s - .1)) / .09), sc = 1.08 - .08 * k, size = H * .062 * sc * (R.film.caption_scale ?? 1), txt = w.w.replace(/[.,?!"';:]/g, '');
  g.font = `900 ${size}px "Arial Black", "Arial Bold", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size * .26; g.strokeStyle = '#000'; g.strokeText(txt, W / 2, H * .67); g.fillStyle = '#fff'; g.fillText(txt, W / 2, H * .67);
}

// Stations with their START (camera arrives at rest) and END (last resting frame before it leaves) frames, read from the bake.
// The word and its frame come from the bake's stations table; for a bake without one they are re-derived from film.json in film_plan's order.
window.stations = () => {
  const out = [], takes = {}; R.cam.forEach(c => (takes[c.take] ||= []).push(c));
  const planTakes = (R.film.takes || []).map((tk, i) => ({ id: tk.id || 't' + i, S: tk.stations.map(s => ({ ...s, _at: fr(s.at) })).map(s => ({ ...s, _arr: s._at - (s.lead ?? ((s.word || typeof s.at !== 'number') ? 3 : 0)) })).sort((a, b) => a._arr - b._arr) }));
  for (const [id, frames] of Object.entries(takes)) {
    const pt = planTakes.find(t => t.id === id), n = Math.max(...frames.map(c => c.station)) + 1;
    for (let j = 0; j < n; j++) {
      const mine = frames.filter(c => c.station === j), trav = mine.filter(c => c.state === 'travel'); let rest = mine.filter(c => c.state === 'rest'); if (!mine.length) continue;
      const passes = !rest.length; if (passes) rest = [mine[0]];        // hold 0: the camera passes this pose without stopping; still shown (often frame 0)
      const row = (R.stationRows || []).find(x => x.take === id && x.station === j), s = row ? { word: row.word, _at: row.at } : (pt && pt.S[j] || {}), start = rest[0].f, end = rest[rest.length - 1].f, who = rest[0].subject, st = who && R.perf[who] ? perfAt(R.perf[who], start) : null, st2 = who && R.perf[who] ? perfAt(R.perf[who], end) : null;
      out.push({ take: id, place: rest[0].place, station: j, start, end, framing: rest[0].framing, lens: rest[0].lens, rest_s: passes ? 0 : +(rest.length / R.fps).toFixed(2), passes, travel_s: +(trav.length / R.fps).toFixed(2), next: frames.find(c => c.station === j + 1)?.framing || null,
        subject: who, shows: rest[0].shows, word: s.word || (Array.isArray(s.at) ? s.at[0] : null), at: s._at ?? start,
        move_start: st ? `${who}: ${st.pose}, ${st.face}${st.mouth ? ', talking' : ''}` : (who || 'place'), move_end: st2 ? `${who}: ${st2.pose}, ${st2.face}${st2.mouth ? ', talking' : ''}` : (who || 'place') });
    }
  }
  return out;
};

// Projection only (no occlusion test): tells the checks whether a thing is INSIDE the frame and how big, not whether a prop hides it.
window.visibility = (f) => {
  const c = R.cam[f]; setCamera(c); R.placeNow = R.places[c.place] || Object.values(R.places)[0]; const o = {};
  for (const [who, card] of Object.entries(R.cards)) {
    const st = perfAt(R.perf[who], f); if (!st.visible) { o[who] = null; continue; }
    const H = card.entry.height || 1.7, a = project(B2T([st.pos[0], st.pos[1], st.pos[2] + H])), b = project(B2T(st.pos)), m = project(B2T([st.pos[0], st.pos[1], st.pos[2] + H / 2]));
    o[who] = a && b && m && m[0] > -.1 && m[0] < 1.1 && m[1] > -.2 && m[1] < 1.2 ? { x: +m[0].toFixed(3), y: +m[1].toFixed(3), h: +(b[1] - a[1]).toFixed(3), head_y: +a[1].toFixed(3) } : null;
  }
  for (const name of Object.keys(R.film.props || {})) { const p3 = propPos(name, f), p = p3 && project(p3); o[name] = p && p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1 ? { x: +p[0].toFixed(3), y: +p[1].toFixed(3) } : null; }
  return o;
};

// ---- THE LOCK (render.mjs --export-lock): what the Blender look pass reads, so layout can never drift ----
// Set -> .glb, exported as the three.js scene is (Y up). Blender's glTF importer turns (x, y, z) into (x, -z, y), which is exactly the
// plan's (x, y, z): a prop at plan [1.5, 0.6, 2.62] sits at three [1.5, 2.62, -0.6] and lands in Blender at [1.5, 0.6, 2.62].
// Materials are named mat:<library name> (mesh.userData.mat, else the role table below, else mat:untagged_<hex>); when one library
// material is used in several colours each gets mat:<name>.<rrggbb> (read the name up to the first dot). The colour is the base colour.
const ROLE_MAT = { ground: 'turf', wood: 'wood_grain', metal: 'painted_metal_chipped', cloth: 'burlap', glass: 'glass', stone: 'cobble', brick: 'brick', plaster: 'plaster', roof: 'roof_tile', water: 'water', foliage: 'foliage', lamp: 'emissive_lamp' };
window.exportSet = async (place) => {
  const { GLTFExporter } = await import('./vendor/GLTFExporter.js'), pl = R.places[place], root = new THREE.Scene(); root.name = 'set_' + place;
  if (pl.update) pl.update(0, 0, R);                                                  // moving set parts are exported in their frame 0 pose
  for (const ch of pl.scene.children) if (!ch.isLight && !ch.isCamera && !ch.userData.noExport) root.add(ch.clone(true));
  const meshes = [], uses = {}; root.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) { const hex = (Array.isArray(o.material) ? o.material[0] : o.material).color.getHexString(), lib = o.userData.mat || ROLE_MAT[o.userData.role] || 'untagged_' + hex; o.userData.mat = lib; o.userData.color = '#' + hex; (uses[lib] ||= new Set()).add(hex); }
  const mats = {};
  for (const o of meshes) {
    const lib = o.userData.mat, hex = o.userData.color.slice(1), name = 'mat:' + lib + (uses[lib].size > 1 ? '.' + hex : '');
    mats[name] ||= Object.assign(new THREE.MeshStandardMaterial({ color: '#' + hex, roughness: .8, metalness: 0, ...(o.userData.role === 'lamp' ? { emissive: '#' + hex } : {}) }), { name, userData: { lib, color: '#' + hex } });
    o.material = mats[name];
  }
  const buf = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true, trs: true }), u8 = new Uint8Array(buf); let bin = '';
  for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return { b64: btoa(bin), meshes: meshes.length, materials: Object.keys(mats).sort() };
};
// Cards -> one drawing per UNIQUE state (the same key as the texture cache; keys that draw the same picture share an image) and the runs that say which drawing stands where.
// The rig draws both facings itself (dir is part of the state), so flip is always false.
// LOCK: the face shading of the animatic (card_shade) for one frame, worked out from the baked camera, so the Blender cards carry the same shadow side and light rim.
function lockShade(who, f, st) {
  const c = R.cam[f], pl = R.places[c.place], sh = pl && pl.L && pl.L.card_shade; if (!sh || st.view === 'back' || !st.visible) return null;
  const pos = B2T(st.pos); let best = null, bd = 1e9;
  for (const l of sh.lights || []) { if (l.when && (f < l.when[0] || f > l.when[1])) continue; const an = l.anchor && pl.anchors[l.anchor], lpos = an ? (typeof an === 'function' ? an(f) : an) : l.pos; if (!lpos) continue; const lp = B2T(lpos), dd = lp.distanceTo(pos) / (l.prio ?? 1); if (dd < (l.range ?? 4.5) && dd < bd) { bd = dd; best = { l, lp, k: Math.max(.45, 1 - dd / (l.range ?? 4.5)) }; } }
  if (!best && sh.far) best = { l: sh.far, lp: B2T(sh.far.pos), k: sh.far.k ?? .6 };
  if (!best) return null;
  const cp = B2T(c.pos), fw = B2T(c.aim).sub(cp), right = new THREE.Vector3().crossVectors(fw, new THREE.Vector3(0, 1, 0)), ls = best.lp.clone().sub(cp).dot(right) >= pos.clone().sub(cp).dot(right) ? 1 : -1, kq = Math.round(best.k * 4) / 4;
  return { key: '|sh' + ls + best.l.color + kq, sh: { ...sh, side: -ls, rim: best.l.color, rim_amount: (sh.rim_amount ?? 1) * kq } };
}
window.cardIndex = (who, px = 2) => {
  // LOCK v2: one run per stretch of frames that shows the same drawing at the same place. The drawing is the one the animatic drew:
  // in-betweens (tween), eased faces and the face tint of a highlight are all part of it, so the Blender card moves exactly as approved.
  const card = R.cards[who], byKey = {}, bySvg = new Map(), states = [], runs = [];
  for (let f = 0; f < R.end; f++) {
    const c = R.cam[f], st = tweened(who, f), tn = cardTint(who, f), tint = tn && tn.a > 0 ? tn : null, shd = lockShade(who, f, st), tk = (tint ? '|tint' + tint.hex + tint.a : '') + (shd ? shd.key : '');
    const vis = !!st.visible && (!st.place || st.place === c.place), key = vis || !states.length ? stateKey(who, st) + tk : states[runs[runs.length - 1].img - 1].keys[0]; let i = byKey[key];
    if (i === undefined) { const svg = svgFor(card.entry, st), sk = svg + tk; i = bySvg.get(sk); if (i === undefined) { i = states.push({ img: states.length + 1, keys: [], svg, tint, shade: shd ? shd.sh : null }) - 1; bySvg.set(sk, i); } states[i].keys.push(key); byKey[key] = i; }
    const run = { f0: f, f1: f, img: i + 1, pos: st.pos.map(v => +(+v).toFixed(4)), flip: false, visible: !!st.visible && (!st.place || st.place === c.place) }, last = runs[runs.length - 1];
    if (last && last.f1 + 1 === run.f0 && last.img === run.img && last.visible === run.visible && String(last.pos) === String(run.pos)) last.f1 = run.f1; else runs.push(run);
  }
  card.lock = states;
  return { who, puppet: card.entry.puppet ?? card.entry.char ?? null, px: [CARD.W * px, CARD.H * px], ground_px: CARD.GY * px, centre_px: CARD.CX * px, height_m: card.entry.height || 1.7, metres_per_px: +(card.k / px).toPrecision(8),
    tip: { head_k: .55, note: 'the card turns to the lens about the vertical axis AND tips to it: yaw = atan2(cam - pos), tilt = atan2(cam height - (pos height + head_k * height_m), ground distance)' },
    images: states.map(s => ({ img: s.img, file: 's' + String(s.img).padStart(4, '0') + '.png', keys: s.keys })), runs };
};
window.cardPNG = async (who, n, px = 2) => {
  const card = R.cards[who], S = card.lock[n - 1], img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S.svg); await img.decode();
  const c = document.createElement('canvas'); c.width = CARD.W * px; c.height = CARD.H * px; const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  if (S.tint) { const y1 = Math.min(c.height, Math.round((card.m.hy + card.m.headPx * .56) * px)), im = g.getImageData(0, 0, c.width, y1), d = im.data, q = parseInt(S.tint.hex, 16), tr = (q >> 16) / 255, tg = ((q >> 8) & 255) / 255, tb = (q & 255) / 255, A = S.tint.a;   // the same head-only tint as tintedTexture
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40 || d[i] < 150 || d[i + 1] < 150 || d[i + 2] < 150 || Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 40) continue; d[i] *= 1 - A + A * tr; d[i + 1] *= 1 - A + A * tg; d[i + 2] *= 1 - A + A * tb; }
    g.putImageData(im, 0, 0); }
  if (S.shade) { const id = 'lockshade|' + who + '|' + n, t = shadedTexture(id, { image: c }, card, S.shade), out = t.image ? t.image.toDataURL('image/png').split(',')[1] : null; if (t.dispose) t.dispose(); R.tex.delete(id); if (out) return out; }
  return c.toDataURL('image/png').split(',')[1];
};

// ---- LOCK v2 (2026-11-10, first real episode): the lock also carries what MOVES and what GLOWS ----
// lockIds numbers every set node (userData.lock_id, written to the .glb as a custom property), exportMotion lists the nodes the set's
// update() moves with their local position / rotation / scale / opacity on every frame of the place (three.js axes, Y up: the Blender side
// converts like its glTF importer), exportHighlights lists every highlight with its meshes, colour, strength and bloom points per frame.
const T2B = v => [+v.x.toFixed(4), +(-v.z).toFixed(4), +v.y.toFixed(4)];
window.lockIds = (place) => { const pl = R.places[place]; let n = 0; pl.scene.traverse(o => { if (o.isLight || o.isCamera || o.isSprite || o.userData.noExport) return; o.userData.lock_id = ++n; }); return n; };
window.exportMotion = (place) => {
  const pl = R.places[place], nodes = []; pl.scene.traverse(o => { if (o.userData.lock_id) nodes.push(o); });
  const frames = R.cam.filter(c => c.place === place).map(c => c.f); if (!pl.update || !frames.length) return { place, frames: [], nodes: {} };
  const snap = o => [o.position.x, o.position.y, o.position.z, o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w, o.scale.x, o.scale.y, o.scale.z, o.isMesh && o.material && o.material.transparent ? o.material.opacity : 1];
  pl.update(0, 0, R); const base = nodes.map(snap), dyn = new Set();
  for (const f of frames) { pl.update(f, f / R.fps, R); nodes.forEach((o, i) => { if (dyn.has(i)) return; const s = snap(o), b = base[i]; for (let k = 0; k < 11; k++) if (Math.abs(s[k] - b[k]) > 1e-6) { dyn.add(i); break; } }); }
  const out = {}; for (const i of dyn) out[nodes[i].userData.lock_id] = { name: nodes[i].name, trs: [] };
  for (const f of frames) { pl.update(f, f / R.fps, R); for (const i of dyn) out[nodes[i].userData.lock_id].trs.push(snap(nodes[i]).map(v => +v.toFixed(5))); }
  pl.update(0, 0, R); return { place, frames, channels: 'px py pz qx qy qz qw sx sy sz opacity (local, three.js axes)', nodes: out };
};
window.exportHighlights = () => {
  const out = [];
  for (const h of R.hl || []) {
    const place = R.cam[Math.min(R.end - 1, h.f)].place, pl = R.places[place]; R.placeNow = pl;
    const isCard = [].concat(h.on || []).some(n => R.cards[n]), ids = isCard ? [] : hlMeshes(h, pl).map(m => m.userData.lock_id).filter(Boolean), rows = [];
    for (let f = h.f; f < h.f + h.n && f < R.end; f++) { const k = (f - h.f) / h.n; setCamera(R.cam[f]); if (pl.update) pl.update(f, f / R.fps, R); pl.scene.updateMatrixWorld(true);
      rows.push({ f, a: +hlAmp(h, k).toFixed(3), col: '#' + hlColor(h.color, k).getHexString(), pts: (h.glow === false || h.flare) ? [] : hlPoints(h, f, pl).map(T2B) }); }
    out.push({ at: h.f, n: h.n, place, on: h.on, ids, card: isCard, flare: !!h.flare, glow: h.glow !== false, size: h.size ?? .6, bloom: h.bloom ?? .8, frames: rows });
  }
  for (const pl of Object.values(R.places)) if (pl.update) pl.update(0, 0, R);
  return out;
};
window.placeLight = (place) => R.places[place].L;
// instanced set parts (ballast pebbles, sleepers, grass): glTF carries their places but not their colours, so the lock lists the colour of every instance in order
window.exportInstances = (place) => { const out = [], c = new THREE.Color(); R.places[place].scene.traverse(o => { if (!o.isInstancedMesh || !o.userData.lock_id) return; const cols = []; for (let i = 0; i < o.count; i++) { if (o.instanceColor) o.getColorAt(i, c); else c.set('#ffffff'); cols.push(c.getHexString()); } out.push({ id: o.userData.lock_id, name: o.name, n: o.count, mat: o.userData.mat || null, colors: cols }); }); return out; };

// open film_page.html?film=/ep/film.json to watch it play (render.mjs --serve); space = pause, arrows = step
const q = new URLSearchParams(location.search);
if (q.get('film')) (async () => {
  const H = Math.min(960, innerHeight), info = await window.setup({ film: q.get('film'), W: Math.round(H * 9 / 16), H, captions: q.get('captions') !== '0' });
  const audio = new Audio(R.dir + 'voice/voice.wav'); let f = +(q.get('f') || 0), play = q.get('play') !== '0', busy = false, t0 = performance.now() - f / R.fps * 1000;
  addEventListener('keydown', e => { if (e.key === ' ') { play = !play; t0 = performance.now() - f / R.fps * 1000; play ? (audio.currentTime = f / R.fps, audio.play().catch(() => {})) : audio.pause(); } if (e.key === 'ArrowRight') f = Math.min(info.frames - 1, f + 1); if (e.key === 'ArrowLeft') f = Math.max(0, f - 1); });
  const tick = async () => { if (play) { f = Math.floor((performance.now() - t0) / 1000 * R.fps); if (f >= info.frames) { f = 0; t0 = performance.now(); audio.currentTime = 0; } } if (!busy && f !== R.frame) { busy = true; await window.renderFrame(f); busy = false; } requestAnimationFrame(tick); };
  if (play) audio.play().catch(() => {}); tick();
})();

// ============================================================================================================
// RICK LOOK PASS (CB 2026-11-11, "add particles, lighting and background blur same as Rick's Clips, check the dragon jar episode";
// "characters never blur, always sharp"). Measured on The Ancient Jar That Warned an Empire: the set behind (and any set object in
// front) is softly out of focus, the characters are always crisp; warm dust motes float in the air (cool specks at night); lamps,
// fire and sun bloom; the corners fall off (vignette ~0.7). This preview pass gives the storyboard and animatic the same read; the
// Blender look pass does the real depth of field, haze and volumetrics.
// film.json "post": false switches it off; "post": { dof, bloom, dust, vignette } (numbers, 0 = off) sets the film's strength;
// places.<name>.post (same keys, plus dust_color) overrides per place. Camera focus = the camera's aim point (c.focus in m overrides).
// ============================================================================================================
const LOOK = { dof: 1, bloom: 1, dust: 1, vignette: 1 };
function lookCfg(pl) { const fp = R.film.post; if (fp === false) return null; const P = { ...LOOK, ...(typeof fp === 'object' ? fp : {}) }; const name = Object.keys(R.places).find(k => R.places[k] === pl); const pp = name && R.film.places[name] && R.film.places[name].post; if (pp === false) return null; return { ...P, ...(pp || {}) }; }
function initLook() {
  const W = R.W, H = R.H, mk = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, ...o });
  const depth = new THREE.DepthTexture(W, H); depth.type = THREE.FloatType;
  const L = R.look = { scene: mk(W, H, { samples: 4, depthTexture: depth }), mask: new THREE.WebGLRenderTarget(W, H, { samples: 4 }), bright: mk(Math.round(W / 4), Math.round(H / 4)), bright2: mk(Math.round(W / 4), Math.round(H / 4)),
    black: new THREE.MeshBasicMaterial({ color: 0x000000 }), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad: new THREE.Scene() };
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
  L.brightMat = new THREE.ShaderMaterial({ uniforms: { tC: { value: null } }, vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tC; varying vec2 vUv; void main(){ vec3 c = texture2D(tC, vUv).rgb; float l = dot(c, vec3(.2126,.7152,.0722)); gl_FragColor = vec4(c * smoothstep(.95, 2.2, l), 1.); }` });
  L.blurMat = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tC; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 s = vec3(0.); float ws = 0.; for (int i = -12; i <= 12; i++) { float x = float(i), w = exp(-x * x / 50.); s += texture2D(tC, vUv + dir * x).rgb * w; ws += w; } gl_FragColor = vec4(s / ws, 1.); }` });
  L.finalMat = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, tD: { value: null }, tM: { value: null }, tB: { value: null }, near: { value: .05 }, far: { value: 600 }, focus: { value: 5 }, res: { value: new THREE.Vector2(W, H) }, dof: { value: 1 }, bloom: { value: 1 }, vig: { value: 1 } },
    vertexShader: vs, depthTest: false, depthWrite: false, toneMapped: false,
    fragmentShader: `uniform sampler2D tC, tD, tM, tB; uniform float near, far, focus, dof, bloom, vig; uniform vec2 res; varying vec2 vUv;
      float dist(vec2 uv){ float z = texture2D(tD, uv).x; return (near * far) / ((far - near) * z - far) * -1.; }
      float fc = 1e9;
      float coc(float d){ return smoothstep(.1, 1., abs(1. - fc / d)) * res.y * .0068 * dof; }       // pixels; the far set and anything close to the lens go soft
      vec3 neutral(vec3 c){ float s = .76, x = min(c.r, min(c.g, c.b)), off = x < .08 ? x - 6.25 * x * x : .04; c -= off; float p = max(c.r, max(c.g, c.b)); if (p < s) return c; float d = 1. - s, np = 1. - d * d / (p + d - s); c *= np / p; float g = 1. - 1. / (.15 * (p - np) + 1.); return mix(c, vec3(np), g); }
      vec3 srgb(vec3 c){ c = clamp(c, 0., 1.); return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
      void main(){
        fc = focus; for (int i = 0; i < 5; i++) { vec2 p = vec2(.5, .47) + .06 * vec2(i == 1 ? -1. : i == 2 ? 1. : 0., i == 3 ? -1. : i == 4 ? 1. : 0.); fc = min(fc, dist(p)); }   // focus: the aim point, or the subject in the middle of the frame when it is nearer
        vec3 sharp = texture2D(tC, vUv).rgb; float m = texture2D(tM, vUv).r, d0 = dist(vUv);
        float r0 = coc(d0);
        vec3 acc = sharp; float wsum = 1.;
        if (r0 > .6) { for (int i = 1; i < 48; i++) { float fi = float(i), a = fi * 2.39996, rr = sqrt(fi / 48.) * r0; vec2 o = vec2(cos(a), sin(a)) * rr / res, uv = vUv + o;
            if (texture2D(tM, uv).r > .4) continue;                                   // never smear a character into the background
            float ds = dist(uv), rs = coc(ds); float w = ds < d0 - .05 ? smoothstep(rr - 1., rr + 1., rs) : 1.;   // a nearer sample only counts if it is itself blurred that wide
            acc += texture2D(tC, uv).rgb * w; wsum += w; } }
        vec3 bg = acc / wsum, col = mix(bg, sharp, smoothstep(.15, .85, m));          // characters: always the sharp picture
        col += texture2D(tB, vUv).rgb * .65 * bloom * (1. - .6 * m);
        vec3 tm = mix(neutral(col), col, step(.5, m));                                // cards are drawn colour (toneMapped false): keep them, tone-map the set
        vec2 q = (vUv - .5) * vec2(res.x / res.y, 1.) * 1.55; tm *= 1. - .3 * vig * smoothstep(.35, 1.05, length(q));
        gl_FragColor = vec4(srgb(tm), 1.); }` });
  L.q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), L.finalMat); L.q.frustumCulled = false; L.quad.add(L.q);
  for (const c of Object.values(R.cards)) c.mesh.layers.enable(1);
}
function dustFor(pl, cfg) {
  if (pl.dust !== undefined) return pl.dust; const night = /0b1026|27345c/.test(pl.L.top + pl.L.hor) || (pl.L.si ?? 2) < 1.2;
  const n = Math.round((night ? 260 : 520) * (cfg.dust ?? 1)); if (!n) return (pl.dust = null);
  const g = new THREE.BufferGeometry(), p0 = new Float32Array(n * 3), v = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { p0.set([Math.random() * 14, Math.random() * 7, Math.random() * 14], i * 3); v.set([(Math.random() - .5) * .06, .015 + Math.random() * .05, (Math.random() - .5) * .06, Math.random()], i * 4); }
  g.setAttribute('position', new THREE.BufferAttribute(p0, 3)); g.setAttribute('vel', new THREE.BufferAttribute(v, 4));
  const col = new THREE.Color(cfg.dust_color || (night ? '#bcd2ff' : '#ffd79a'));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { t: { value: 0 }, cam: { value: new THREE.Vector3() }, col: { value: col }, H: { value: R.H }, focus: { value: 5 }, amt: { value: night ? .9 : 1.4 } },
    vertexShader: `attribute vec4 vel; uniform float t, H, focus; uniform vec3 cam; varying float a;
      void main(){ vec3 box = vec3(14., 7., 14.), hb = box * .5; vec3 p = position + vel.xyz * t + vec3(sin(t * .7 + vel.w * 40.) * .05, 0., cos(t * .5 + vel.w * 30.) * .05);
        p = cam + mod(p - cam + hb, box) - hb; vec4 mv = modelViewMatrix * vec4(p, 1.); float d = -mv.z;
        float defocus = abs(1. - focus / max(d, .1)); gl_PointSize = H * (.008 + .02 * clamp(defocus, 0., 1.)) / max(d, .3) * 3.2;
        a = smoothstep(.4, 1.2, d) * (1. - smoothstep(6., 9., d)) * (.55 + .45 * sin(t * 1.3 + vel.w * 60.)) / (1. + 2. * defocus);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; uniform float amt; varying float a; void main(){ vec2 q = gl_PointCoord - .5; float r = length(q); if (r > .5) discard; gl_FragColor = vec4(col * amt * a * pow(1. - r * 2., 1.6), 1.); }` });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.userData.noExport = true; pts.name = 'look_dust'; pl.scene.add(pts); return (pl.dust = pts);
}
function renderLook(pl, f, t) {
  const cfg = lookCfg(pl), rd = R.renderer; if (!cfg) { rd.render(pl.scene, R.camera); return; }
  if (!R.look) initLook(); const L = R.look, c = R.cam[f] || {}, cam = R.camera;
  const focus = c.focus ?? (c.pos && c.aim ? B2T(c.pos).distanceTo(B2T(c.aim)) : 5);
  const dust = dustFor(pl, cfg); if (dust) { dust.material.uniforms.t.value = t; dust.material.uniforms.cam.value.copy(cam.position); dust.material.uniforms.focus.value = focus; }
  rd.setRenderTarget(L.scene); rd.clear(); rd.render(pl.scene, cam);
  // character mask: the whole world in black (depth), then the cards in white on top, depth-tested, so a pillar in front still hides a body
  const vis = []; if (dust) { vis.push([dust, dust.visible]); dust.visible = false; }
  for (const cd of Object.values(R.cards)) if (cd.mesh.parent === pl.scene) { vis.push([cd.mesh, cd.mesh.visible]); cd.mesh.visible = false; }
  // kit 2026-11-13 (vfx-artist, armor-no-holes FIX_LIST_v3 item 13): a SEE-THROUGH piece cannot hide a character, so it is no occluder in the mask either. Before, a light pool, a light
  // shaft, a lamp halo, steam or a dust sprite in front of a card was drawn here as a solid black shape (the override material ignores blending, opacity and a sprite's turn to the lens) and
  // knocked that part of the card out of the mask: the card was tone-mapped and blurred like the set there, with a hard edge (the "band"). See-through = the material does not write depth in
  // the picture, only adds light, or is less than half opaque. Left as they were: materials with colorWrite off (unseen shells that sets use as occluders). A material's own .visible is still
  // read under an override material, so only these materials are skipped (children stay). Tried and dropped: drawing the world with its own materials and colour writes locked (the exact
  // picture depth): right, but 5 times slower per frame on a 40,000-object set.
  const seeThru = []; pl.scene.traverse(o => { if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine) || !o.material) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m && m.visible && m.colorWrite !== false && !m.userData.maskSolid && (m.depthWrite === false || m.blending === THREE.AdditiveBlending || (m.transparent && m.opacity < .5))) { m.visible = false; seeThru.push(m); } });
  rd.setRenderTarget(L.mask); rd.setClearColor(0x000000, 1); rd.clear(); const bg = pl.scene.background; pl.scene.background = null; pl.scene.overrideMaterial = L.black; rd.render(pl.scene, cam); pl.scene.overrideMaterial = null;
  for (const m of seeThru) m.visible = true;
  for (const [o, v] of vis) o.visible = v; if (dust) dust.visible = false;
  const swaps = []; for (const cd of Object.values(R.cards)) { if (cd.mesh.parent !== pl.scene || !cd.mesh.visible) continue; cd.maskMat ||= new THREE.ShaderMaterial({ uniforms: { map: { value: null } }, side: THREE.DoubleSide, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }', fragmentShader: 'uniform sampler2D map; varying vec2 vUv; void main(){ if (texture2D(map, vUv).a < .5) discard; gl_FragColor = vec4(1.); }' }); cd.maskMat.uniforms.map.value = cd.mesh.material.map; swaps.push([cd.mesh, cd.mesh.material]); cd.mesh.material = cd.maskMat; }
  const ac = rd.autoClear; rd.autoClear = false; cam.layers.set(1); rd.clearColor(); rd.render(pl.scene, cam); cam.layers.set(0); rd.autoClear = ac;
  for (const [m, mt] of swaps) m.material = mt; pl.scene.background = bg; for (const [o, v] of vis) o.visible = v;
  L.q.material = L.brightMat; L.brightMat.uniforms.tC.value = L.scene.texture; rd.setRenderTarget(L.bright); rd.render(L.quad, L.cam);
  const bw = L.bright.width, bh = L.bright.height; L.q.material = L.blurMat;
  for (const [src, dst, dx, dy] of [[L.bright, L.bright2, 1.5 / bw, 0], [L.bright2, L.bright, 0, 1.5 / bh], [L.bright, L.bright2, 3.5 / bw, 0], [L.bright2, L.bright, 0, 3.5 / bh]]) { L.blurMat.uniforms.tC.value = src.texture; L.blurMat.uniforms.dir.value.set(dx, dy); rd.setRenderTarget(dst); rd.render(L.quad, L.cam); }
  const u = L.finalMat.uniforms; Object.assign(u.tC, { value: L.scene.texture }); u.tD.value = L.scene.depthTexture; u.tM.value = L.mask.texture; u.tB.value = L.bright.texture;
  u.near.value = cam.near; u.far.value = cam.far; u.focus.value = focus; u.dof.value = c.dof ?? cfg.dof; u.bloom.value = cfg.bloom; u.vig.value = cfg.vignette;
  L.q.material = L.finalMat; rd.setRenderTarget(null); rd.render(L.quad, L.cam);
}
