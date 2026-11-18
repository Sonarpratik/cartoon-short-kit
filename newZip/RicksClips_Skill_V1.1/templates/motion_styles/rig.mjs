// MOTION TEST RIG (2026-11-10, thread "Design funny character movement styles").
// Draws the LOCKED vector2d puppets unchanged, but takes over the legs (S.noLegs + our own legs drawn in the same
// ink style) so feet can be planted on the floor and knees can bend properly. Body = rigid card (never squashed);
// it only moves, leans and turns between the four locked views.
import * as C from '../vector2d_characters/code/char2d.mjs';
import { heldSvg as heldGrip } from '../vector2d_characters/code/grips.mjs';
import { formChar } from '../vector2d_characters/code/bodies.mjs';
import { MEMES } from '../vector2d_characters/code/memes.mjs';
import { BLINKS, memes2Defs } from '../vector2d_characters/code/memes2.mjs';

export const G = 1010;                       // world ground line (the rig's own ground)
const f = v => (+v).toFixed(1);
export const lerp = (a, b, u) => a + (b - a) * u;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = {
  lin: u => u, in: u => u * u, out: u => 1 - (1 - u) * (1 - u), io: u => u < .5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u),
  in3: u => u * u * u, out3: u => 1 - (1 - u) ** 3,
  back: u => { const s = 1.9; return 1 + (s + 1) * (u - 1) ** 3 + s * (u - 1) ** 2; },          // overshoot then settle
  elastic: u => u === 0 || u === 1 ? u : 1 - Math.pow(2, -9 * u) * Math.cos(u * 11),
};
// keyframe track: [[t, value, easeName?], ...] -> value at time t (value can be a number or an array of numbers)
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, a] = keys[i - 1], [t1, b, e] = keys[i], u = (ease[e || 'io'])((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((x, j) => lerp(x, b[j], u)) : lerp(a, b, u);
  }
  return keys[keys.length - 1][1];
}
const rotP = (p, deg, c) => { const r = deg * Math.PI / 180, s = Math.sin(r), k = Math.cos(r), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * k - dy * s, c[1] + dx * s + dy * k]; };

// character template: form + its numbers
export function makeChar(form = 'standard', opt = {}) {
  const S0 = formChar(form, 0, 'front', 1);
  const bodyTop = S0.bodyTop ?? 333, bodyBot = S0.bodyBot ?? 640, ground = S0.ground ?? 900, K = S0.headK ?? 1.5;
  const hipY = bodyBot - 30, legL = Math.hypot(23, (ground - 7) - hipY);
  const a = S0.arms({ cx: 0, view: 'front', dir: 1, turn: 0 }).front[1], m = /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(a.d);
  const sh = [+m[1], +m[2]], armL = (a.len0 ?? Math.hypot(a.hand[0] - sh[0], a.hand[1] - sh[1])) * 1.24;   // len0: the cast-size arms are drawn long now (bodies.mjs castArms); the film keeps its approved length
    // CB 2026-11-15 (gold mine clip): arms a little LONGER, a hanging hand almost at the body's bottom edge (was x1.06)
  return { form, bodyTop, bodyBot, ground, K, hipY, legL, sh, armL, handX: Math.abs(a.hand[0]), hy: bodyTop - 100 * K * .78, coat: opt.coat };
}

// one elbow curve shoulder -> hand (same construction as poses.mjs arm())
function armCurve(sh, hand, L, bias, bow = .5) {
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1;
  if (d > L) { hand = [sh[0] + dx * L / d, sh[1] + dy * L / d]; }
  const dd = Math.min(d, L), off = Math.max(.10 * L, Math.sqrt(Math.max(0, (L / 2) ** 2 - (dd / 2) ** 2)) * 1.25) * bow * 2;
  let nx = -dy / d, ny = dx / d; if (nx * bias[0] + ny * bias[1] < 0) { nx = -nx; ny = -ny; }
  return { d: `M${f(sh[0])},${f(sh[1])} Q${f(sh[0] + (hand[0] - sh[0]) / 2 + nx * off)},${f(sh[1] + (hand[1] - sh[1]) / 2 + ny * off)} ${f(hand[0])},${f(hand[1])}`, hand: [+f(hand[0]), +f(hand[1])] };
}

// POSE -> svg (world coords). P = {
//   view: front|34|side|back, dir: 1|-1, x, y (body offset; + = down), rot (deg, screen clockwise), pivot: [wx, wy] (world, default = hips),
//   feet: [{x, lift, toe (deg, + = toe up), knee: +1|-1 (side view: +1 bends forward)}] (side view: [far, near]; front: [screen-left, screen-right]),
//   hands: [{f, d} | {lx, ly} | null, ...] (side: [far, near]; f = forward along dir, d = down, in arm lengths from the shoulder; over: true = in front of the head),
//   head: tilt deg, face: 'k:<kit face>' | '<meme name>', blink: 'half'|'closed'|null,
//   CB 2026-11-15 leg/arm rules (references/rick_pose_traces): in side and 3/4 the NEAR leg is drawn over the body, the FAR leg behind it, one tone
//   lighter ONLY when the scene has a light source (lit: true); default, night or no light = both legs ink. legsBehind: true = old look (both behind). The far arm goes behind the body
//   (farArmFront: true keeps it in front). feet[i].pts = exact leg points (world), feet[i].kneeAt = exact knee, feet[i].behind = this leg behind the body, feet[i].far = this leg is the far one (overrides its slot), feet[i].over = this leg over the body, feet[i].ink = this leg ink (not the far tone), feet[i].curve = pts are hip, knee, ankle, toe... drawn with a rounded knee; legW = leg line width.
//   arms: [{ s, c, h, behind, over }] = editor arms in world coords (shoulder, curve control, hand) replacing the computed ones; an arm not behind draws ON TOP of the body, as in the editor }
export function drawPose(ch, P) {
  const view = P.view || 'side', dir = P.dir || 1, side = view === 'side';
  const S = formChar(ch.form, 0, view, dir); S.x = 0; S.view = view; S.dir = dir; S.noLegs = true;
  if (ch.coat) S.coat = ch.coat;
  // face
  delete S.meme; S.face = { expr: 'standard' };
  const face = P.face || 'k:standard';
  if (P.blink && face === 'k:standard') S.meme = BLINKS[P.blink];
  else if (face.startsWith('k:')) S.face = { expr: face.slice(2) };
  else if (MEMES[face]) S.meme = MEMES[face];
  S.headTilt = P.head || 0; S.extraDefs = memes2Defs();
  // body transform (needed early: hands can be given in world coords {wx, wy})
  const x = P.x || 0, y = P.y || 0, rot = P.rot || 0, piv = P.pivot || [x, ch.hipY + y];
  const toLocal = w => { const q = rotP(w, -rot, piv); return [q[0] - x, q[1] - y]; };
  // arms
  const near34 = view === '34' ? (dir === 1 ? 0 : 1) : -1;   // CB 2026-11-15: 3/4 facing right = the screen-RIGHT arm goes behind the body and the screen-LEFT (near) arm hangs from the MIDDLE of the body; facing left mirrored
  const shL = side ? [[dir * 8, ch.sh[1] + 35], [dir * 8, ch.sh[1] + 35]]   /* CB 2026-11-15 era preview: side shoulder a little lower, clear of the head (same as castArms) */ : [[-ch.sh[0], ch.sh[1]], [ch.sh[0], ch.sh[1]]];
  const W34 = (ch.handX ?? 120) - 14;   // body half width (front hand sits 14 outside it)
  if (near34 >= 0) shL[near34] = [-dir * ch.sh[0], ch.sh[1] + 35];   // CB 2026-11-15: "a little bit more down, not too close to the head"
  const restH = side ? [[dir * 16, ch.bodyBot - 22], [dir * 16, ch.bodyBot - 22]] : [[-110, ch.bodyBot - 22], [110, ch.bodyBot - 22]];
  if (near34 >= 0) { restH[near34] = [-dir * .85 * W34, ch.bodyBot - 22]; restH[1 - near34] = [dir * (W34 + 14), ch.bodyBot - 22]; }   // CB 2026-11-15: "the arms need to be on the side not on the middle"   // the near arm hangs in front of the body
  const H = (P.hands || [null, null]).map((h, i) => {
    const sh = shL[i], s = side ? dir : (i ? 1 : -1);
    let hand = restH[i];
    if (h && h.wx != null) hand = toLocal([h.wx, h.wy]);
    else if (h && h.lx != null) hand = [h.lx, h.ly];
    else if (h) hand = [sh[0] + s * h.f * ch.armL, sh[1] + h.d * ch.armL];
    const bias = side ? [-dir * .8, .6] : [s, .6];
    return { ...armCurve(sh, hand, ch.armL, h && h.bias ? h.bias : bias, h && h.bow != null ? h.bow : .5), over: !!(h && h.over), sh };
  });
  const armW = S.armW ?? (S.legW ?? 17) + 2, handR = (S.handR ?? 15) + 11;   // same line and fist as char2d's own arms (CB 2026-11-15: on-top arms were thinner)
  const armSvg = a => `<path d="${a.d}" fill="none" stroke="${C.INK}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${handR}" fill="${C.INK}"/>`;
  // CB 2026-11-15 (references/rick_pose_traces): the limb AWAY from the lens is feet[farIdx] / hands[farIdx]: side = 0; 3/4 = the screen side behind the facing.
  // In side and 3/4 the far arm goes BEHIND the body (P.farArmFront: true keeps it in front). P.arms = editor arms, world coords:
  // [{ s: shoulder, c: curve control, h: hand, behind, over }] in the order of P.hands (held props follow them).
  const farIdx = side ? 0 : view === '34' ? (dir === 1 ? 1 : 0) : -1;   // arms: side = hands[0]; 3/4 facing right = the screen-right arm (CB 2026-11-15)
  if (P.arms) { H.length = 0; P.arms.forEach(a => { const s0 = toLocal(a.s), c0 = toLocal(a.c), h0 = toLocal(a.h);
    H.push({ d: `M${f(s0[0])},${f(s0[1])} Q${f(c0[0])},${f(c0[1])} ${f(h0[0])},${f(h0[1])}`, hand: [+f(h0[0]), +f(h0[1])], over: a.over ?? !a.behind, behind: !!a.behind, sh: s0 }); }); }
  const behindArms = P.arms ? H.filter(a => a.behind && !a.over) : farIdx >= 0 && H[farIdx] && !H[farIdx].over && !P.farArmFront ? [H[farIdx]] : [];
  const frontArms = H.filter(a => !a.over && !behindArms.includes(a)), extraBack = behindArms.slice(1);
  S.arms = () => ({ back: behindArms[0], front: frontArms });
  const overs = H.filter(a => a.over);
  S.over = () => [...overs.map(armSvg), ...heldSvg.filter(h => h.over).map(h => h.s)];
  // held things: drawn AT the hand every frame (never float). P.held = [{ hand: 0|1, svg: (x, y) => '<...>' }]
  const heldSvg = (P.held || []).map(h => ({ over: H[h.hand].over, s: heldGrip(h, H, (S.handR ?? 15) + 9, C.INK) }));   // GRIPS 2026-11-12: held.wrap (handle angle) or held.grip ({ obj, ... }) closes the fist round the tool
  S.props = () => heldSvg.filter(h => !h.over).map(h => h.s);
  const r = C.drawCharacter(S);
  let body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '').replace(/#f9f4f2/g, '#ffffff').replace(/#d9d2e3/g, '#e2e0ec');
  // white faces (CB 2026-11-10: pure white, shaded from the light): lift the rig's ivory/grey skin stops
  const defs = r.defs.replace(/#f9f4f2/g, '#ffffff').replace(/#d9d2e3/g, '#e2e0ec');
  // body transform
  // CB 2026-11-15 (Rick, gold mine: legs leave the body 30-39 % of its width apart): front / 3/4 / back hips 2.4x wider; the feet move out by the same amount so the legs stay as the move drew them
  const HIPW = (S.hipW ?? 13) * 2.4, spreadD = HIPW - (S.hipW ?? 13);
  const hipLocal = side ? [[-12 * dir, ch.hipY], [10 * dir, ch.hipY]] : [[-HIPW, ch.hipY], [HIPW, ch.hipY]];
  const toW = p => rotP([p[0] + x, p[1] + y], rot, piv);
  const hips = hipLocal.map(toW);
  // legs (world): hip -> knee -> ankle -> toe, one ink line with an L at the ankle (locked leg look)
  // CB 2026-11-15: "when he looks to the right side, the left leg is the one at the front, the right leg behind the body": side = feet[0] (the rear hip) is the NEAR leg,
  // feet[1] the far one; 3/4 facing right = the screen-left leg near (mirrored facing left). Arms keep farIdx.
  const legFarIdx = side ? 1 : view === '34' ? (dir === 1 ? 1 : 0) : -1;
  const LEG = P.legW ?? S.legW ?? 17, legsBack = [], legsFront = [], FAR = '#544656';   // FAR: one tone lighter than ink (Rick: near ~7 %, far ~19 % lightness)
  (P.feet || []).forEach((ft, i) => {
    if (S.noLegs === 'ghost') return;
    const hp = hips[i]; let A = [ft.x + (side ? 0 : (i ? 1 : -1) * spreadD), G - 7 - (ft.lift || 0)];
    let dx = A[0] - hp[0], dy = A[1] - hp[1], d = Math.hypot(dx, dy);
    const L = ch.legL * (ft.len || 1);
    if (d > L) { A = [hp[0] + dx * L / d, hp[1] + dy * L / d]; dx = A[0] - hp[0]; dy = A[1] - hp[1]; d = L; }
    const sd = side ? dir : (i ? 1 : -1), kd = side ? dir * (ft.knee || 1) : sd * (ft.knee || 1);
    let nx = -dy / d, ny = dx / d; if (nx * kd < 0) { nx = -nx; ny = -ny; }
    const off = Math.max(7, Math.sqrt(Math.max(0, (L / 2) ** 2 - (d / 2) ** 2)) * (ft.kneeK ?? 1));
    let K = ft.kneeAt ? [ft.kneeAt[0], ft.kneeAt[1]] : [(hp[0] + A[0]) / 2 + nx * off, (hp[1] + A[1]) / 2 + ny * off];   // ft.kneeAt: exact knee (world)
    if (ft.thigh != null) {                     // seated legs: the thigh angle is given (0 = straight forward, 90 = straight down), the shin hangs to the foot
      const a = ft.thigh * Math.PI / 180, kd2 = side ? dir : sd, K2 = [hp[0] + kd2 * L / 2 * Math.cos(a), hp[1] + L / 2 * Math.sin(a)];
      const vx = A[0] - K2[0], vy = A[1] - K2[1], vl = Math.hypot(vx, vy) || 1, A2 = [K2[0] + vx / vl * L / 2, K2[1] + vy / vl * L / 2], m = ft.mix ?? 1;
      K = [lerp(K[0], K2[0], m), lerp(K[1], K2[1], m)]; A = [lerp(A[0], A2[0], m), lerp(A[1], A2[1], m)];
    }
    const fdir = side ? dir : view === '34' ? (sd === dir ? dir : sd * .6) : sd, fl = side ? 44 : view === '34' && sd === dir ? 40 : 28;
    const ta = (ft.toe ?? (side ? 0 : -25)) * Math.PI / 180,   // CB 2026-11-15: front / 3/4 feet point out AND down (Rick ~25 deg)
          toe = [A[0] + fdir * fl * Math.cos(ta), A[1] - fl * Math.sin(ta) * (fdir > 0 ? 1 : 1)];
    // ft.pts: the whole leg as exact world points (hip ... foot), drawn as one line with round joins (CB's editor legs)
    const line = ft.pts ? (ft.curve ? C.smooth(ft.pts.slice(0, 3), false, .55) + ft.pts.slice(3).map(q => ` L${f(q[0])},${f(q[1])}`).join('') : 'M' + ft.pts.map(q => `${f(q[0])},${f(q[1])}`).join(' L')) : C.smooth([hp, K, A], false, .55) + ` L${f(toe[0])},${f(toe[1])}`, join = ft.pts && !ft.curve ? 'round' : 'miter';
    const far = ft.far ?? i === legFarIdx, overBody = !S.skirt && (ft.over || (legFarIdx >= 0 && !far && !P.legsBehind && !ft.behind));   // LONG CLOTH (CB 2026-11-15 "legs need to be under the long cloth"): with S.skirt every leg goes behind the body + cloth, only below the hem shows
    const col = legFarIdx < 0 || ft.ink ? C.INK : far && P.lit && !P.dark ? FAR : C.INK;   // CB 2026-11-15: the far leg is lighter ONLY with a light source (P.lit); night or no light = same ink as the near leg
    (overBody ? legsFront : legsBack).push(`<path d="${line}" fill="none" stroke="${col}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="${join}" stroke-miterlimit="4"/>`);
  });
  // floor shadow: stays on the floor, shrinks as the body goes up
  const hipW = hips.reduce((a, p) => a + p[0], 0) / 2, up = Math.max(0, G - 7 - (ch.hipY + y) - (ch.legL - 10));
  const sk = clamp(1 - up / 700, .35, 1);
  const shadow = P.noShadow ? '' : `<ellipse cx="${f(hipW + 10)}" cy="${G}" rx="${f((side ? 90 : 110) * sk * (P.shadowW || 1))}" ry="${f(16 * sk)}" fill="#1b0f2a" opacity="${(.28 * sk).toFixed(2)}"/>`;
  const tf = `rotate(${f(rot)},${f(piv[0])},${f(piv[1])}) translate(${f(x)},${f(y)})`;
  const backTail = P.arms && view === 'back' ? H.filter(a => a.over && !a.behind).map(armSvg).join('') : '';   // char2d skips S.over in the back view: editor arms set in front still draw on top
  return { defs, svg: `${shadow}${legsBack.join('')}<g transform="${tf}">${extraBack.map(armSvg).join('')}${body}${backTail}</g>${legsFront.join('')}`, hips };
}

// ---- walk / run cycle with PLANTED feet (no gliding: a foot on the floor never moves) ----
// T = seconds per step, S = step length (world px), duty = share of a stride a foot is on the floor,
// swing(u) -> {dx (extra fwd as share of stride), lift (px), toe} shapes the swinging foot.
export function cycle(t, { T, S, duty = .6, x0 = 0, dir = 1, swing, lift = 50, toeUp = 20, toeOff = -25, speed = null }) {
  const v = S / T, bx = x0 + dir * v * t, feet = [];
  for (let i = 0; i < 2; i++) {
    const ph = t / (2 * T) + i * .5, k = Math.floor(ph), phi = ph - k, tl = (k - i * .5) * 2 * T;
    const Xp = x0 + dir * (v * tl + S * duty);
    if (phi < duty) feet.push({ x: Xp, lift: 0, toe: 0, phase: phi / duty, down: true });
    else {
      const u = (phi - duty) / (1 - duty), sw = swing ? swing(u) : { dx: 0, lift: lift * Math.sin(Math.PI * u), toe: lerp(toeOff, toeUp, u) };
      const xe = ease.io(u) + (sw.dx || 0);
      feet.push({ x: Xp + dir * 2 * S * xe, lift: sw.lift, toe: sw.toe ?? lerp(toeOff, toeUp, u), phase: u, down: false });
    }
  }
  const p = (t / T) % 1;                                    // step phase: 0 = a foot lands
  const side = Math.floor(t / T) % 2;                        // which foot just landed
  return { bx, feet, p, side, stride: (t / (2 * T)) % 1 };
}
// lowest body drop that lets every planted foot reach the floor (keeps a slight knee bend)
export function reachDrop(ch, P, slack = 6) {
  const view = P.view || 'side', dir = P.dir || 1, side = view === 'side';
  const hipLocal = side ? [[-12 * dir, ch.hipY], [10 * dir, ch.hipY]] : [[-13, ch.hipY], [13, ch.hipY]];
  const piv = P.pivot || [P.x || 0, ch.hipY + (P.y || 0)];
  let need = 0;
  (P.feet || []).forEach((ft, i) => {
    const hp = rotP([hipLocal[i][0] + (P.x || 0), hipLocal[i][1] + (P.y || 0)], P.rot || 0, piv), ay = G - 7 - (ft.lift || 0), dx = ft.x - hp[0];
    const L = ch.legL - slack, can = Math.sqrt(Math.max(0, L * L - dx * dx));
    need = Math.max(need, (ay - can) - hp[1]);
  });
  return Math.max(0, need);
}
export function blinkAt(t, every = 2.6, off = .9) { const k = ((t - off) % every + every) % every, fr = Math.floor(k * 30); return fr === 0 || fr === 3 ? 'half' : fr === 1 || fr === 2 ? 'closed' : null; }
