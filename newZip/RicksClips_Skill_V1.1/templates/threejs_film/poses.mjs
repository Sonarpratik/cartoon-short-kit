// POSES for the vector2d puppets, without touching the character package.
// The rig lets us plug in S.arms and S.props, so a pose = hand targets; the arm is one curved line shoulder -> hand
// ("every joint is a curve"). Anything the rig cannot do yet (legs for a walk, arms in front of the head) is handled
// here as an overlay or listed in README "rig hooks".
// Sides: 'R' = the character's right hand = screen-left in the front view (s = -1); 'L' = screen-right (s = +1).
// Targets are [out, down] in arm lengths from the shoulder; `abs` targets are worked out from the head or the other hand.
export const POSES = {
  stand:      {},
  hold_watch: { prop: [0.42, 0.34] },                                   // forearm raised, the held thing in front of the belly
  press_watch:{ prop: [0.42, 0.34], main: 'toProp' },                   // other hand comes across onto it
  point_up:   { main: [0.82, -0.74], finger: 1, over: 1 },
  point_out:  { main: [0.99, -0.12], finger: 1, toDir: 1 },             // points to the side the character faces
  hands_hips: { both: [0.16, 0.60], bow: 1.0 },
  flinch:     { both: [0.55, -0.42], rot: -5, over: 0 },
  finger_up:  { main: 'besideHead', finger: 1, over: 1 },
  show_wrist: { main: [0.05, 0.10], wrist: 1 },                         // forearm across the chest, wrist to the lens
  hand_mouth: { main: 'mouth', over: 1 },
  clap:       { both: 'centre', dy: -6 },
  reach_up:   { main: [0.30, -1.02], over: 1 },                             // stretches for something too high (a lever handle)
  hold_up:    { prop: [0.55, -0.80], over: 1 },                             // the held thing raised beside the head (key to the driver, letter, bottle)
  hold_out:   { prop: [0.88, 0.02], over: 1 },                                       // offers the held thing sideways (a coin)
  push:       { both: [0.80, 0.12], bow: 0.3 },                             // both hands forward on a push bar
  write:      { main: [0.62, 0.42], rot: 3 },                               // hand down on the desk, body tipped
  knock:      { main: [0.78, -0.34] },                                      // fist raised to a door
  walk0:      { swing: 1, dy: -10, rot: 2.5, legs: [[8, 0, 6], [-14, 36, -20]], head: 3 },     // step: one foot planted, the other lifted with a bent knee; the body bobs and rocks
  walk1:      { swing: -1, dy: 0, rot: -2.5, legs: [[14, 36, 20], [-8, 0, -6]], head: -3 },
  push0:      { both: [0.80, 0.12], bow: 0.3, dy: -10, rot: 7, legs: [[8, 0, 6], [-14, 36, -20]], head: 3 },      // pushing something while walking (film.json act "walk_pose": "push")
  push1:      { both: [0.80, 0.12], bow: 0.3, dy: 0, rot: 5, legs: [[14, 36, 20], [-8, 0, -6]], head: -2 },
  // ---- motion upgrade 2026-11-10 (CB: no gliding, whole-body acting). legs = per leg [foot dx, foot lift, knee bend] in rig px; head = head tilt in degrees; dy = body drop; rot = lean about the feet
  hang0:      { bothDir: 'aboveHead', over: 1, rot: 7, legs: [[18, 40, 12], [-6, 96, -28]], head: -9 },   // hanging off something high with both hands, legs kicking
  hang1:      { bothDir: 'aboveHead', over: 1, rot: 13, legs: [[8, 100, 26], [-16, 34, -10]], head: 7 },
  hang_s0:    { bothDir: 'aboveSide', over: 1, rot: 5, legs: [[18, 40, 12], [-6, 96, -28]], head: -8 },   // hanging BESIDE the thing: both hands on a rod up to one side of the head (the side he faces), so the lever stays in view next to the body (CB 2026-11-10: a body can never be inside a solid thing)
  hang_s1:    { bothDir: 'aboveSide', over: 1, rot: 10, legs: [[8, 100, 26], [-16, 34, -10]], head: 6 },
  heave:      { bothDir: 'besideHead', over: 1, rot: -15, legs: [[-34, 0, -20], [30, 0, 12]], head: -10 },  // feet braced, whole body leaning back on the pull
  crouch:     { both: [0.42, 0.50], bow: 1.2, drop: 0.42, spread: 0.10, head: 4 },                      // landing: knees out, body dropped (drop = share of the leg length)
  crouch_low: { both: [0.55, 0.42], bow: 1.3, drop: 0.68, spread: 0.14, head: -3 },
  kneel:      { both: [0.30, 0.56], drop: 0.56, spread: 0.08, rot: 0, head: -4, kneel: 1 },             // down on the knees, body UPRIGHT (CB 2026-11-12, Rick): hips drop by the shin length, thighs straight down, knees on the floor, shins back along it
  kneel_work: { hands: [[0.98, 0.98], [0.62, 1.04]], drop: 0.50, spread: 0.08, rot: 8, rotSide: 1, head: 12, kneel: 1, kneelOne: 1 },   // CB 2026-11-13: down on ONE knee working on something at the side he faces: the knee on the work side is UP (foot planted), the other knee on the floor, body leans to the work, both hands down on it, head looks at it
  kneel_hammer: { hands: [[0.86, 0.10], [0.66, 1.04]], drop: 0.50, spread: 0.08, rot: 6, rotSide: 1, head: 12, kneel: 1, kneelOne: 1, toolHand: 'R', grip: { obj: 'hammer', angle: -100, on: 'R' } },   // the same, hammering: the hand on the work side raises the hammer, the other holds the work (nail, plank) low
  kneel_hammer_hit: { hands: [[0.65, -0.62], [0.66, 1.04]], drop: 0.50, spread: 0.08, rot: 10, rotSide: 1, head: 16, kneel: 1, kneelOne: 1, toolHand: 'R', grip: { obj: 'hammer', angle: 85, on: 'R' } },   // the hammer comes down on the work (the strike frame of kneel_hammer)
  sit:        { both: [0.24, 0.60], drop: 0.93, spread: 0.30, head: 2 },
  cheer:      { both: [0.92, -1.08], elbow: [0.74, -0.32], bow: 1, over: 1, head: 0 },   // both fists up and out, elbows bent (Rick cashier win)
  sit_chair:  { both: [0.30, 0.52], drop: 0.50, spread: 0.12, head: 2, chair: 1 },   // CB 2026-11-11 (Rick seated cashier): on a chair/bench, thighs level forward in outfit colour, shins straight down                                // sitting on the floor, legs out
  shrug:      { both: [0.78, -0.04], bow: 1.3, head: 9 },
  cool:       { both: [0.16, 0.60], bow: 1.0, rot: -3, legs: [[-10, 0, 0], [22, 0, 10]], head: -6 },           // weight on one leg, head cocked
  dust:       { both: 'centre', dy: 6, head: 5 },
  tiltL:      { head: -7 }, tiltR: { head: 7 },
  bend_down:  { both: [0.16, 0.60], bow: 1.0, rot: 12, dy: 96, legs: [[-28, 96, -44], [40, 96, 52]], head: 18 },   // bends right down to someone small (Rick's boss over the rail)
  // ---- GRIPS 2026-11-12 (CB: "holding like human real hand"): the fist closes ROUND the thing (grips.mjs). act key "grip": { obj, kind, angle, at, scale, real } overrides the default object.
  grip_pole:  { prop: [0.50, 0.50], grip: { obj: 'staff' } },                          // upright pole / spear / staff beside the body, fist round the shaft (Rick king with spear)
  grip_point: { prop: [0.96, -0.16], grip: { obj: 'pointer' } },                      // points a stick at something (Rick priest at the price board)
  grip_raise: { prop: [0.52, -0.82], over: 1, grip: { obj: 'torch' } },               // tool raised beside the head (torch, sword up)
  grip_swing: { prop: [0.80, -0.30], grip: { obj: 'hammer', angle: -100 } },          // hammer / axe up, ready to strike
  grip_hang:  { prop: [0.66, 0.30], grip: { obj: 'lantern', scale: 1.7 } },                       // lantern, bucket, bag hang straight down from the fist
  grip_shield:{ prop: [0.50, 0.36], grip: { obj: 'shield', scale: 1.3 } },                        // shield in front of the fist (hand hidden behind it)
  grip_two:   { hands: [[0.80, 0.92], [0.18, 0.50]], grip: { obj: 'shovel', two: 1, at: -150 } }, // two hands on one shaft: shovel, broom, rake, oar (lead hand low, back hand at the chest)
  grip_sign:  { both: [0.10, 0.64], bow: 0.45, grip: { obj: 'sign', two: 1 } },         // flat sign held up in front with both fists on its face (Rick Grave Bell "Bodies")
  grip_box:   { both: [0.42, 0.50], bow: 0.8, grip: { obj: 'box', two: 1 } },          // box / chest carried in front, fists over its side edges
  grip_shoulder: { prop: [0.30, 0.06], grip: { obj: 'pole', kind: 'shoulder', angle: 0 } },   // carrying pole on the shoulder, fist in front on it (Rick: two men with the chest)
  grip_push:  { both: [0.66, 0.74], bow: 0.4, rot: 6, grip: { obj: 'handles', each: 1, angle: 18, angleFront: 96, scale: .55 } },   // wheelbarrow / cart handles: each fist round the end of its own handle
  // ---- LYING 2026-11-12 (CB: "laying correct direction"; Rick Grave Bell coffin, Cart Army cart roof). The card is drawn upright and film.js turns the WHOLE card
  // flat (lieOf): never squashed. lie 'back' = on the back, head to the side opposite the facing dir, face turned back up to the lens; 'front' = face down,
  // head lifted to look at the lens; 'flat' = for a camera looking DOWN: the front view card lies on the floor, face up (act key lie_yaw turns it).
  lie_back:   { both: [0.10, 0.52], bow: 0.8, head: 72, lie: 'back' },              // hands folded on the chest, legs straight, face to the lens (Rick coffin)
  lie_back_up:{ both: [0.10, 0.52], bow: 0.8, head: 72, lie: 'back', lieLegs: 'kneeUp' },   // one knee up, that foot flat on the floor
  lie_front:  { both: [0.40, -0.55], over: 1, bow: 0.6, head: -70, lie: 'front' },    // on the belly, arms forward, head lifted to the lens (Rick cart roof)
  lie_front_kick: { both: [0.40, -0.55], over: 1, bow: 0.6, head: -70, lie: 'front', lieLegs: 'kick' },   // on the belly (on a bed): knees down, shins up in the air, feet crossed
  lie_flat:   { both: [0.22, 0.58], bow: 0.9, lie: 'flat' },                          // top-down camera: flat on the floor, face up
  lean_in:    { both: [0.16, 0.60], bow: 1.0, rot: 12, dy: 30, legs: [[-18, 30, -18], [30, 30, 26]], head: 8 },  // bends at the waist toward the facing side
};
const warned = new Set();
// which way a pose lies (film.js turns the card): null | 'back' | 'front' | 'flat'
export function lieOf(state) { const name = (state && state.pose) || ''; let l = null; for (const n of name.split('+')) if (POSES[n] && POSES[n].lie) l = POSES[n].lie; return state && state.lie || l; }
const num = s => parseFloat(s);
function restArms(S, cx) {
  // read shoulders and resting hands from the character's own arms function (front view), mirror if it only draws one
  const a = S.arms ? S.arms({ cx, view: 'front', dir: 1, turn: 0 }) : {};
  const list = [].concat(a.front || [], a.back || []).map(x => { const m = /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(x.d); return { sh: [num(m[1]), num(m[2])], hand: x.hand.slice() }; });
  if (!list.length) list.push({ sh: [cx - 60, (S.bodyTop ?? 333) + 52], hand: [cx - 120, (S.bodyTop ?? 333) + 240] });
  const side = s => { const hit = list.find(x => Math.sign(x.sh[0] - cx) === s); if (hit) return hit; const o = list[0]; return { sh: [2 * cx - o.sh[0], o.sh[1]], hand: [2 * cx - o.hand[0], o.hand[1]] }; };
  return { [-1]: side(-1), [1]: side(1) };
}
function arm(sh, hand, s, L, bow = 0.5, elbowDir = 0, elbowAt = null) {
  // one smooth curve; the elbow swings out and down, more when the hand is close to the shoulder (keeps the arm length)
  { const d0 = Math.hypot(hand[0] - sh[0], hand[1] - sh[1]); if (d0 > L) hand = [sh[0] + (hand[0] - sh[0]) * L / d0, sh[1] + (hand[1] - sh[1]) * L / d0]; }   // FIXED LIMB LENGTH (CB 2026-11-13 body mechanics rule): an arm never stretches; a target out of reach stops at full reach and the held thing follows the hand
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1, off = Math.max(0.10 * L, Math.sqrt(Math.max(0, (L / 2) ** 2 - (d / 2) ** 2)) * 1.25) * bow * 2;
  let nx = -dy / d, ny = dx / d; if (nx * s + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
  if (elbowDir && nx * elbowDir < 0) { nx = -nx; ny = -ny; }   // CB 2026-11-11 23:53: in the side view the elbow bends BACK (away from where he looks), like a human arm
  const f = v => v.toFixed(1);
  // CB 2026-11-11 23:52: a little bend AT the elbow (upper arm and forearm read as two parts with a soft round elbow), not one even curve
  const E = elbowAt ? elbowAt :  [sh[0] + dx / 2 + nx * off * .62, sh[1] + dy / 2 + ny * off * .62], r = elbowAt ? Math.min(60, L * .3) : Math.min(26, L * .2), pt = (p) => { const q = Math.hypot(p[0] - E[0], p[1] - E[1]) || 1, t = Math.min(r, q * .45) / q; return [E[0] + (p[0] - E[0]) * t, E[1] + (p[1] - E[1]) * t]; }, i = pt(sh), o = pt(hand);
  return { d: `M${f(sh[0])},${f(sh[1])} L${f(i[0])},${f(i[1])} Q${f(E[0])},${f(E[1])} ${f(o[0])},${f(o[1])} L${f(hand[0])},${f(hand[1])}`, hand: [+f(hand[0]), +f(hand[1])], fwd: [dx / d, dy / d] };
}
const PROPS = {
  key: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(-20)"><circle cx="0" cy="-34" r="20" fill="none" stroke="${INK}" stroke-width="15"/><circle cx="0" cy="-34" r="20" fill="none" stroke="#e2b13c" stroke-width="8"/><path d="M0,-14 L0,44 M0,26 L18,26 M0,42 L22,42" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M0,-14 L0,44 M0,26 L18,26 M0,42 L22,42" stroke="#e2b13c" stroke-width="8" stroke-linecap="round"/></g>`,
  coin: (x, y, INK) => `<circle cx="${x}" cy="${y - 6}" r="30" fill="#e2b13c" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${y - 6}" r="20" fill="none" stroke="#b9862a" stroke-width="4"/><path d="M${x - 14},${y - 22} q10,-10 22,-6" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  bottle: (x, y, INK) => `<g transform="translate(${x},${y})"><path d="M-10,-96 L10,-96 L10,-62 Q26,-50 26,-28 L26,22 Q26,30 18,30 L-18,30 Q-26,30 -26,22 L-26,-28 Q-26,-50 -10,-62 Z" fill="#7a4a22" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="-12" y="-104" width="24" height="12" rx="3" fill="#e2b13c" stroke="${INK}" stroke-width="5"/><rect x="-26" y="-22" width="52" height="30" fill="#f3efe6" stroke="${INK}" stroke-width="4"/><path d="M-16,-52 L-16,16" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/></g>`,
  letter: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(-8)"><rect x="-48" y="-92" width="96" height="124" rx="4" fill="#fbf6e8" stroke="${INK}" stroke-width="6"/><path d="M-32,-68 L32,-68 M-32,-48 L32,-48 M-32,-28 L32,-28 M-32,-8 L10,-8" stroke="${INK}" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="12" r="13" fill="#d8473c" stroke="${INK}" stroke-width="4"/></g>`,
  notebook: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(6)"><rect x="-36" y="-70" width="72" height="92" rx="5" fill="#fbf6e8" stroke="${INK}" stroke-width="6"/><rect x="-36" y="-70" width="72" height="18" fill="#2f4f86" stroke="${INK}" stroke-width="5"/><path d="M-22,-36 L22,-36 M-22,-18 L22,-18 M-22,0 L8,0" stroke="${INK}" stroke-opacity=".55" stroke-width="4.5" stroke-linecap="round"/></g>`,
  watch: (x, y, INK) => `<circle cx="${x}" cy="${y - 4}" r="24" fill="#e2b13c" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y - 4}" r="16" fill="#fbf6e8" stroke="${INK}" stroke-width="2.5"/><path d="M${x},${y - 4} L${x},${y - 15} M${x},${y - 4} L${x + 8},${y}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${x}" cy="${y - 30}" r="5" fill="#e2b13c" stroke="${INK}" stroke-width="2.5"/>`,
};
const propSvg = (name, x, y, INK) => PROPS[name] ? PROPS[name](x, y, INK)
  : `<circle cx="${x}" cy="${y}" r="22" fill="#f3efe6" stroke="${INK}" stroke-width="4"/><text x="${x}" y="${y + 8}" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle" fill="${INK}">${String(name)[0].toUpperCase()}</text>`;   // placeholder for props nobody has drawn yet

// applyPose(S, state, { INK, headK, hy, dropProps }) -> mutates S.arms / S.props, returns { over: [svg], rot, dy }
export const SIDE_GRIP = [1.7, 1.05];   // side hang ('aboveSide'): the upper hand, in head radii from the head centre [sideways, up]. tools/film_plan.py apply_clings uses the same numbers.
export function applyPose(S, state, env) {
  const cx = S.x ?? 300, INK = env.INK, R = restArms(S, cx), over = [];
  const armW = (S.legW ?? 17) + 2, handR = (S.handR ?? 15) + 9;   // CB 2026-11-12 00:08: bigger fists (Rick: fist about 2.5x the arm line)   // CB 2026-11-11 23:52: arms the SAME thickness as the legs
  const draw = a => `<path d="${a.d}" fill="none" stroke="${INK}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${handR}" fill="${INK}"/>`;
  const finger = a => `<path d="M${a.hand[0]},${a.hand[1]} l${(a.fwd[0] * (handR + 20)).toFixed(1)},${(a.fwd[1] * (handR + 20)).toFixed(1)}" stroke="${INK}" stroke-width="${Math.max(6, armW * .5)}" stroke-linecap="round"/>`;
  const len = s => Math.hypot(R[s].hand[0] - R[s].sh[0], R[s].hand[1] - R[s].sh[1]) * 1.06;
  const at = (s, t) => [R[s].sh[0] + s * t[0] * len(s), R[s].sh[1] + t[1] * len(s)];
  // the side the work is on: the facing side, except a tool pose seen from the front or back works on the TOOL HAND's side (a right-handed worker works at his right: screen left from the front) - CB 2026-11-13 "which grip which side"
  const workSide = (p, state) => p.toolHand && (state.view === 'front' || state.view === 'back' || state.view === '34') ? (p.toolHand === 'R' ? -1 : 1) : (state.dir || 1);
  // solve one pose (for this character's proportions) into numbers: hand targets, legs, head tilt, lean, drop
  const solve = (state) => {
    const name = state.pose || 'stand', parts = name.split('+'), P = parts.every(n => POSES[n]) ? Object.assign({}, ...parts.map(n => POSES[n])) : null;   // 'sit+reach_up': later parts win, so a seated or kneeling body can still gesture
    if (!P && !warned.has(name)) { warned.add(name); console.warn('poses.mjs: unknown pose "' + name + '", using stand'); }
    let p = P || {};
    const hk = state.hand || (p.grip && p.grip.hand) || (state.grip && state.grip.hand) || ((state.grip || p.grip) && env.grip && env.grip.objects && (env.grip.objects[(typeof state.grip === 'string' ? state.grip : (state.grip && state.grip.obj)) || (p.grip && p.grip.obj)] || {}).hand);
    const sProp = hk === 'L' ? 1 : -1;                                                // which hand holds the prop: -1 = his RIGHT hand (screen left from the front), the same hand in every view (CB 2026-11-13 "which grip which side"); a shield goes on the LEFT arm
    let sMain = state.prop ? -sProp : -1;                                             // a gesture uses the free hand
    if (p.toDir && !state.prop) sMain = state.dir || 1;
    const tgt = {};                                                                   // side -> hand position
    if (p.both === 'centre') { tgt[-1] = [cx - handR * .8, R[-1].sh[1] + .34 * len(-1)]; tgt[1] = [cx + handR * .8, R[1].sh[1] + .34 * len(1)]; }
    else if (p.both) { tgt[-1] = at(-1, p.both); tgt[1] = at(1, p.both); }
    if (p.bothDir === 'aboveHead') { const HR = 100 * env.headK, y = env.hy - HR * 1.62; tgt[-1] = [cx - handR * .9, y]; tgt[1] = [cx + handR * .9, y]; }   // both hands on one thing straight above the head (hanging); the arms arc round the head, see `hang` below
    else if (p.bothDir === 'aboveSide') { const d = state.dir || 1, HR = 100 * env.headK, t = [cx + d * HR * SIDE_GRIP[0], env.hy - HR * SIDE_GRIP[1]]; tgt[d] = t; tgt[-d] = [t[0], t[1] + handR * 2.0]; }   // one hand over the other on a rod, up beside the head
    else if (p.bothDir) { const d = state.dir || 1, HR = 100 * env.headK, t = p.bothDir === 'besideHead' ? [cx + d * (HR + 46), env.hy + HR * .35] : at(d, p.bothDir); tgt[d] = t; tgt[-d] = [t[0] - d * handR * 1.3, t[1] + handR * 1.1]; }   // both hands on one thing beside the body; short-armed forms stretch to reach
    if (p.swing) for (const s of [-1, 1]) { const ph = p.swing * s; tgt[s] = [R[s].hand[0] - s * ph * 12, R[s].hand[1] - (ph > 0 ? 32 : 6)]; }   // walk: one hand forward (in and up), the other back
    if ((state.prop || p.grip || state.grip) && p.prop) tgt[sProp] = at(sProp, p.prop);   // grip poses place the holding hand without a flat prop
    if (p.hands === 'tuck') { for (const s2 of [-1, 1]) tgt[s2] = [R[s2].sh[0], R[s2].sh[1] + 2]; }   // both hands tucked on their own shoulders: the film draws these arms in 3D (ep_kit "ep_arms"), so the fists sit exactly on a 3D tool
    else if (p.hands) { const d = workSide(p, state), A0 = at(d, p.hands[0]), A1 = [R[d].sh[0] + d * p.hands[1][0] * len(d), R[d].sh[1] + p.hands[1][1] * len(d)], sw = p.toolHand && (p.toolHand === 'R' ? -1 : 1) !== d; tgt[d] = sw ? A1 : A0; tgt[-d] = sw ? A0 : A1; }   // toolHand: the tool (hands[0]) always goes in that hand (a right-handed worker swings with his right hand whichever way he faces)   // two hands on two different points of one tool (a brace: one on the head pad, one on the crank grip); both given from the facing-side shoulder
    if (p.main === 'toProp' && tgt[sProp]) tgt[sMain] = [tgt[sProp][0] - sProp * handR * 1.6, tgt[sProp][1] - 8];
    else if (p.main === 'mouth') tgt[sMain] = [cx + sMain * 26 * env.headK, env.hy + 44 * env.headK];
    else if (p.main === 'besideHead') tgt[sMain] = [cx + sMain * (100 * env.headK + handR + 10), env.hy - 30];
    else if (Array.isArray(p.main)) tgt[sMain] = at(sMain, p.main);
    if (p.chair && state.view !== 'side') p = { ...p, drop: 0.30 };   // CB 2026-11-11 23:49: seen from the front the shins come toward the lens, so the legs read LONGER (body sits higher, feet lower in the frame)
    if (p.drop) { const LL = (S.ground ?? 900) - (S.bodyBot ?? 640) + 13, d = p.drop * LL, sp = (p.spread || 0.1) * LL * 2; p = { ...p, dy: d, legs: p.kneel ? [[-sp * .5, d, 0], [sp * .5, d, 0]] : [[-sp, d, -sp * 1.5], [sp, d, sp * 1.5]] }; }
    if (p.drop && !p.kneel && state.view === 'side') {   /* CB 2026-11-12 00:10 lock: chair knees go forward only in the SIDE view; front/3-4 legs spread toward the lens (Rick cashier) */ const d = p.dy, sp = p.legs[1][0], dd = state.dir || 1; p = { ...p, legs: dd === -1 ? [[sp * 1.3, d, -sp * 1.5], [sp * .8, d, -sp * 1.1]] : [[sp * .8, d, sp * 1.1], [sp * 1.3, d, sp * 1.5]] }; }   // seated or crouched in profile: both knees point forward
    const legs = p.legs ? (state.dir === -1 ? [[-p.legs[1][0], p.legs[1][1], -p.legs[1][2]], [-p.legs[0][0], p.legs[0][1], -p.legs[0][2]]] : p.legs) : [[0, 0, 0], [0, 0, 0]];
    return { p, tgt, sMain, sProp, legs, head: (p.head || 0) * (state.dir || 1), rot: (p.rotSide && state.view !== 'side' ? 0 : (p.rot || 0)) * (state.dir || 1),   /* rotSide: lean only in profile; a sideways tilt from the front would lift one side of the body off the floor (CB 2026-11-13 grounding rule) */ dy: p.dy || 0, bow: p.bow ?? 0.5 };
  };
  const A = solve(state); let { p, tgt, sMain, sProp } = A, legs = A.legs, head = A.head, rot = A.rot, dy = A.dy;
  const bowOf = (Q, s) => Q.tgt[s] ? Q.bow : 0.42; let bow = s => bowOf(A, s);
  if (state.tw && state.u != null && state.u < 1) {                                   // IN-BETWEEN (2026-11-10): blend from the previous pose, so a pose change is a move and not a snap
    const B = solve({ ...state, ...state.tw }), u = state.u, L = (a, b) => a + (b - a) * u;
    const t2 = {}; for (const s of [-1, 1]) if (A.tgt[s] || B.tgt[s]) { const a = B.tgt[s] || R[s].hand, b = A.tgt[s] || R[s].hand; t2[s] = [L(a[0], b[0]), L(a[1], b[1])]; }
    tgt = t2; legs = legs.map((l, i) => l.map((v, j) => L(B.legs[i][j], v))); head = L(B.head, head); rot = L(B.rot, rot); dy = L(B.dy, dy); bow = s => L(bowOf(B, s), bowOf(A, s));
  }
  if (state.idle) { head += 2.2 * state.idle; rot += 0.7 * state.idle; }
  // kit 2026-11-13 HELD 3D, generic (props-hero): state.hat = { R: [x, y], L: [x, y] } in CARD px = where a held 3D prop (film.json held3d with "grip") or a hand_at with "hand" wants that fist.
  // The point is taken back through this pose's lean and drop, becomes the hand target, and the arm is solved to it at its fixed length (arm() stops at full reach). No hat = nothing changes.
  const habs = {}; if (state.hat) { const r0 = -rot * Math.PI / 180, cs = Math.cos(r0), sn = Math.sin(r0), GY = (S.ground ?? 900) + (S.dy || 0);
    for (const s of [-1, 1]) { const q = state.hat[s < 0 ? 'R' : 'L']; if (!q) continue; const dx = q[0] - cx, dy0 = q[1] - dy - GY, x = cx + dx * cs - dy0 * sn, y = GY + dx * sn + dy0 * cs - (S.dy || 0); habs[s] = [x, y]; tgt[s] = state.view === 'back' ? [2 * cx - x, y] : [x, y]; } }
  S.legPose = legs.some(l => l.some(v => v)) ? legs : null; S.headTilt = head; S.kneelPose = !!(p.kneel && !(state.tw && state.u < .5)); S.kneelOne = S.kneelPose && p.kneelOne ? workSide(p, state) : 0;   // the knee that is UP is on the work side S.chairPose = !!(p.chair && !(state.tw && state.u < .5)); S.liePose = p.lie && p.lie !== 'flat' && !(state.tw && state.u < .5) ? { lie: p.lie, legs: p.lieLegs || 'straight', art: state.lie_art || 'side' } : null; S.lieFlat = p.lie === 'flat' || state.lie_art === 'top'; if (S.liePose && S.liePose.art !== 'side') S.headTilt = 0;   // lie_art: film.js lie_cam.mjs picks it from the camera (side | top | feet)   // rule 22: kneeling = knees on the ground, shins back
  const made = {};
  for (const s of [-1, 1]) made[s] = arm(R[s].sh, tgt[s] || R[s].hand, s, len(s), bow(s), state.view === 'side' ? -(state.dir || 1) : 0, p.elbow && tgt[s] && !(state.tw && state.u < 1) ? [R[s].sh[0] + s * p.elbow[0] * len(s), R[s].sh[1] + p.elbow[1] * len(s)] : null);   // p.elbow: an explicit elbow [out, down] in arm lengths (cheer: upper arm out to the side, forearm up)
  if (p.bothDir === 'aboveHead' && !(state.tw && state.u < 1)) for (const s of [-1, 1]) { const HR = 100 * env.headK, h = tgt[s], sh = R[s].sh, f = v => v.toFixed(1); made[s] = { d: `M${f(sh[0])},${f(sh[1])} C${f(cx + s * HR * 1.9)},${f(env.hy + HR * .7)} ${f(cx + s * HR * 1.75)},${f(env.hy - HR * 1.3)} ${f(h[0])},${f(h[1])}`, hand: h, fwd: [0, -1] }; }   // hang: each arm goes out and up round its own side of the head
  if (p.bothDir === 'aboveSide' && !(state.tw && state.u < 1)) { const d = state.dir || 1, HR = 100 * env.headK, h = tgt[d], sh = R[d].sh, f = v => v.toFixed(1); made[d] = { d: `M${f(sh[0])},${f(sh[1])} C${f(cx + d * HR * 1.25)},${f(env.hy + HR * 1.2)} ${f(cx + d * HR * 1.8)},${f(env.hy + HR * .1)} ${f(h[0])},${f(h[1])}`, hand: h, fwd: [0, -1] }; }   // side hang: the near arm goes out and up round the head; the far arm passes behind the head
  const isOver = s => !!(p.over && tgt[s] && (p.bothDir === 'aboveSide' ? s === (state.dir || 1) : (p.both || p.bothDir || s === sMain || (s === sProp && state.prop && p.prop))));
  const orig = S.arms, origProps = S.props, V = state.view || 'front', D = state.dir || 1;
  // SIDE and BACK views (2026-11-10, CB: full silhouette from front, 3/4, side or back): gestures and held things show in every view.
  // side: the hands reach to the facing side at the same heights as in the front view; back: mirrored left-right, the head hides what crosses it.
  const sideSh = (() => { if (V !== 'side' || !orig) return null; const o = orig({ cx, view: 'side', dir: D, turn: D }), base = o && [].concat(o.front || [])[0], m = base && /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(base.d); return m ? { o, sh: [num(m[1]), num(m[2])] } : null; })();
  const sideMade = {}, hangs = p.bothDir === 'aboveHead';
  if (sideSh) for (const s of [-1, 1]) if (tgt[s]) sideMade[s] = arm(sideSh.sh, [sideSh.sh[0] + D * (Math.abs(tgt[s][0] - R[s].sh[0]) + (hangs ? 0 : .45 * Math.max(0, R[s].sh[1] - tgt[s][1]))), sideSh.sh[1] + (tgt[s][1] - R[s].sh[1])], D, len(s), bow(s), -D);   // a raised hand also goes forward, so it clears the face
  // CB 2026-11-13 02:33 Bangkok: the back (far) arm is SHOWN, but correctly: its shoulder sits a little behind and above the near one (hidden by the body),
  // and when both hands would land on the same spot the far hand reaches a little further and higher, so its forearm and fist come out past the body and the near arm.
  if (sideSh && sideMade[D] && sideMade[-D]) { const G1 = state.grip || p.grip, fixed = p.toolHand || (G1 && (G1.on === 'R' || G1.on === 'L'));
    let n = sideMade[-D].hand, f0 = sideMade[D].hand;
    if (!fixed && D * (f0[0] - n[0]) < 0) { [n, f0] = [f0, n]; sideMade[-D] = arm(sideSh.sh, n, D, len(-D), bow(-D), -D); }   // the near arm takes the hand nearer the body, the far arm the one further out, so its forearm shows past the body
    const dd0 = Math.hypot(f0[0] - n[0], f0[1] - n[1]), fh = !G1 && dd0 < 46 ? [f0[0] + D * 14, f0[1] - 44] : G1 && dd0 < 20 ? [f0[0] + D * 8, f0[1] - 16] : f0;   // a held thing with both hands at one spot (sign, cart handles): the far fist and handle sit a little higher, like a second handle seen past the first
    sideMade[D] = arm([sideSh.sh[0] - D * 10, sideSh.sh[1] - 6], fh, D, len(D) * 1.04, bow(D), -D); }
  if (sideSh) for (const s of [-1, 1]) if (habs[s]) sideMade[s] = s === D ? arm([sideSh.sh[0] - D * 10, sideSh.sh[1] - 6], habs[s], D, len(D) * 1.04, bow(D), -D) : arm(sideSh.sh, habs[s], D, len(s), bow(s), -D);   // kit 2026-11-13: a hat target is absolute in the side view too
  const backArm = s => arm([2 * cx - R[s].sh[0], R[s].sh[1]], [2 * cx - (tgt[s] || R[s].hand)[0], (tgt[s] || R[s].hand)[1]], -s, len(s), bow(s));
  S.arms = (c) => {
    if (p.noArms || state.lie_art === 'feet' || state.lie_art === 'head') return { front: [] };   // lying seen from the feet / head: the arms lie on the far side of the body, hidden   // the film draws this pose's arms in 3D (ep_kit "ep_arms")
    if (c.view === 'back') return tgt[-1] || tgt[1] ? { front: [-1, 1].map(backArm) } : orig ? orig(c) : {};
    // CB 2026-11-13 02:31 Bangkok: in side view only the near arm is fully seen; the back (far) arm is behind the body, which hides most of it
    if (c.view === 'side') { const fa = sideMade[D] && (hangs || !isOver(D)) ? D : 0;
      return sideMade[-1] || sideMade[1] ? { front: [-1, 1].filter(s => sideMade[s] && (hangs || !isOver(s)) && s !== fa).map(s => sideMade[s]), ...(fa ? { back: sideMade[fa] } : {}) } : sideSh ? sideSh.o : orig ? orig(c) : {}; }
    return { front: [-1, 1].filter(s => !isOver(s) && s !== farArm).map(s => made[s]), ...(farArm && made[farArm] ? { back: made[farArm] } : {}) };
  };
  const extras = (a, s) => [p.finger && s === sMain ? finger(a) : '', state.prop && s === sProp && !state.h3 ? propSvg(state.prop, a.hand[0], a.hand[1], INK) : ''];   // drawn AT the hand every frame: a held prop can never float
  S.props = (c) => {
    const o = [...(origProps && !env.dropProps ? origProps(c) : [])];
    if (c.view === 'back') return o;
    if (c.view === 'side') { for (const s of [-1, 1]) if (sideMade[s] && !isOver(s) && s !== D) o.push(...extras(sideMade[s], s)); return o; }   // the far hand's prop goes behind the body with its arm (under, below)
    for (const s of [-1, 1]) if (!isOver(s)) {
      if (tgt[s] || s === sProp) o.push(...extras(made[s], s));
      if (p.wrist && s === sMain) o.push(`<circle cx="${made[s].hand[0] - s * handR * 1.5}" cy="${made[s].hand[1] - 2}" r="${handR * .8}" fill="#e2b13c" stroke="${INK}" stroke-width="3.5"/>`);
    }
    return o;
  };
  if (V === 'side') { for (const s of [-1, 1]) if (sideMade[s] && isOver(s) && !hangs) over.push(draw(sideMade[s]), ...extras(sideMade[s], s)); }
  else if (V === 'back') { if (state.prop && tgt[sProp] && !state.h3) over.push(propSvg(state.prop, 2 * cx - tgt[sProp][0], tgt[sProp][1], INK)); }
  else for (const s of [-1, 1]) if (isOver(s)) over.push(draw(made[s]), ...extras(made[s], s));           // arms that must sit in front of the head
  // GRIPS (2026-11-12, grips.mjs): the object is drawn first, then the fist closes ROUND it (finger creases + thumb), Rick's layering.
  let farArm = 0; const under = V === 'side' && sideMade[D] && !isOver(D) ? extras(sideMade[D], D).filter(Boolean) : [], G0 = state.grip || p.grip, gripDraw = env.grip;   // env.grip = grips.mjs grip() from the puppet package (puppets.mjs passes it)
  if (G0 && !gripDraw && !warned.has('grip')) { warned.add('grip'); console.warn('poses.mjs: grips.mjs missing from the puppet package, grip poses show bare hands'); }
  if (G0 && gripDraw && !(state.tw && state.u < .6)) {
    const G = { ...(p.grip || {}), ...(typeof state.grip === 'string' ? { obj: state.grip } : state.grip || {}) };
    if (V !== 'side' && G.angleFront != null) G.angle = G.angleFront;   // seen from the front a handle that points at the lens is short and points down
    if (V === 'side' && G.scale && G.angleFront != null) G.scale = 1;
    const sides = G.on === 'R' ? [-1] : G.on === 'L' ? [1] : G.on === 'lead' ? [D] : (G.two || G.each || p.both || p.hands) ? [-1, 1] : [p.prop ? sProp : sMain];
    // NEAR / FAR HAND (CB 2026-11-13): facing screen-right his right hand (-1) is the one nearer the lens. A one-hand hold in the FAR hand goes behind the body in side and 3/4 views
    // (the body covers the fist, the object shows past its edge); a shield is carried in front of the body, so it always shows except from behind.
    const far1 = (V === 'side' || V === '34') && sides.length === 1 && sides[0] === D && !G.two && !G.each && (G.kind || (gripDraw.objects && (gripDraw.objects[G.obj] || {}).kind)) !== 'behind';
    if (state.h3) { if (far1) farArm = sides[0]; } else {   // kit 2026-11-13 HELD 3D: the 3D prop and its 3D fist replace the flat library object; the far hand still goes behind the body
    const src = V === 'side' ? sideMade : V === 'back' ? { [-1]: backArm(-1), [1]: backArm(1) } : made;
    let pts = sides.filter(s2 => src[s2]).map(s2 => ({ s: s2, h: src[s2].hand, sh: V === 'side' ? sideSh.sh : V === 'back' ? [2 * cx - R[s2].sh[0], R[s2].sh[1]] : R[s2].sh }));
    if (G.two && p.hands && pts.length === 2 && V !== 'side') pts.sort((a, b) => (a.s === D ? 1 : 0) - (b.s === D ? 1 : 0));   // [back hand, lead hand]: the shaft runs from the chest through the lead hand on
    if (G.two && p.hands && V === 'side') pts.sort((a, b) => (b.h[1] - a.h[1]) * -1);                                         // side view: higher hand first
    const env2 = { INK, r: handR, view: V };
    const parts = !pts.length ? [] : G.each ? pts.map(q => gripDraw(G, [q.h], { ...env2, dir: V === 'side' ? D : (V === 'back' ? -q.s : q.s), arm: [q.sh] }))
      : pts.length > 1 && G.two ? [gripDraw(G, pts.map(q => q.h), { ...env2, dir: D, arm: pts.map(q => q.sh) })]
      : [gripDraw(G, [pts[0].h], { ...env2, dir: V === 'side' ? D : V === 'back' ? -pts[0].s : pts[0].s, arm: [pts[0].sh] })];
    const U = parts.flatMap(q => q.under), O2 = parts.flatMap(q => q.over), B2 = parts.flatMap(q => q.back);
    if (V === 'back') under.push(...B2, ...U, ...O2);                                    // from behind, what is held in front is behind the body: only its ends show past the silhouette
    else if (far1) { under.push(...U, ...O2); farArm = sides[0]; }                        // the far hand: arm, fist and object all behind the body
    else if (pts.some(q => isOver(q.s))) over.push(...U, ...O2);                          // raised in front of the head
    else { const pr = S.props; S.props = c => [...(pr ? pr(c) : []), ...U, ...O2]; }
    }
  }
  if (S.liePose && (S.liePose.art === 'feet' || S.liePose.art === 'head')) { const LL = (S.ground ?? 900) - (S.bodyBot ?? 640) + 13; S.lieDrop = LL * .72; dy += S.lieDrop; } else S.lieDrop = 0;   // seen from the feet: the legs come at the lens, so they are short and the body sits low behind the soles
  S.shadowDy = -(dy || 0);   // the foot shadow stays ON the floor when the body is dropped (kneel, crouch, sit): CB 2026-11-13 no floating / no ground penetration
  // kit 2026-11-13 HELD 3D: where both fists are (rig px, before the lean / drop transform), their shoulders, which one is the far hand (behind the body) and which way a held thing points: data only
  const hsrc = V === 'side' ? sideMade : V === 'back' ? { [-1]: backArm(-1), [1]: backArm(1) } : made, sideRest = sideSh && sideSh.o ? [].concat(sideSh.o.front || [], sideSh.o.back || [])[0] : null;
  const handOf = s => (hsrc[s] || (V === 'side' && sideRest) || made[s]).hand, shOf = s => V === 'side' && sideSh ? sideSh.sh : V === 'back' ? [2 * cx - R[s].sh[0], R[s].sh[1]] : R[s].sh;
  const farOf = s => V === 'side' ? (s === D && !(isOver(s) && !hangs)) : V === '34' ? farArm === s : V === 'back' ? !isOver(s) : false;
  return { over, rot, dy, under, hands: { R: handOf(-1), L: handOf(1) }, sh: { R: shOf(-1), L: shOf(1) }, far: { R: farOf(-1), L: farOf(1) }, gdir: { R: V === 'side' ? D : V === 'back' ? 1 : -1, L: V === 'side' ? D : V === 'back' ? -1 : 1 }, handR };
}
