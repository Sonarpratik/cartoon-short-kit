import { track, blinkAt, G } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, D2R = PI / 180;
const HL = 191;                                      // half leg = thigh = shin
const hipFor = a => 995 - HL * sin(a * D2R);          // hip height that puts the knee on the floor for thigh angle a
const loop = 4.5;
// knees on the floor: thigh angle a (90 = straight down), shin lies back along the floor to the foot
const kneeLeg = (hx, a, m, lift = 0) => ({ x: hx + HL * cos(a * D2R) - 230, lift, thigh: a, mix: m, toe: -10 });

// A THUD + NOOO: drops hard onto both knees, bounces, throws both arms up, wailing meme face (the dramatic "nooo").
function thud(t0) {
  const t = t0 % loop, a = 74, Y = hipFor(a) - 620;
  const y = track([[0, 0], [.6, 0], [.68, -14, 'out'], [.86, Y, 'in'], [.96, Y - 26, 'out'], [1.06, Y, 'in']], t);
  const m = track([[0, 0], [.68, 0], [.86, 1, 'in']], t);
  const up = track([[0, 0], [1.0, 0], [1.25, 1, 'back'], [3.8, 1], [4.3, 0]], t);
  const shake = up > .9 ? 2.5 * sin(t * 40) : 0;
  return { view: 'side', dir: 1, x: 0, y, rot: track([[0, 0], [.86, 6], [1.2, -10, 'back'], [3.8, -10], [4.3, 0]], t) + shake,
    feet: [kneeLeg(-12, a, m), kneeLeg(10, a + 4, m)].map((f, i) => m < .01 ? { x: i ? 18 : -18 } : f),
    hands: [{ f: .2 + .55 * up, d: .9 - 1.4 * up, bow: .4 }, { f: .3 + .7 * up, d: .9 - 1.25 * up, bow: .4, over: up > .4 }],
    head: track([[0, 0], [1.0, 0], [1.25, -16]], t), face: t < .86 ? 'k:standard' : t < 1.1 ? 'k:open' : 'wail', blink: blinkAt(t), cam: 40, camY: -200 };
}
// B HERO LANDING: drops in from above, lands in a one-knee crouch, holds... then slowly looks up, smug.
function hero(t0) {
  const t = t0 % loop, Yk = hipFor(84) - 620;
  const y = track([[0, -900], [.45, -900], [.75, Yk + 4, 'in'], [.82, Yk + 10, 'out'], [.95, Yk, 'out']], t);
  const air = t < .75;
  const m = track([[0, 0], [.7, 0], [.78, 1, 'out']], t);
  const look = track([[0, 0], [1.6, 0], [2.6, 1, 'io']], t);
  const fist = track([[0, 0], [.6, 0], [.75, 1, 'out']], t);
  const bx = 0, hipW = 620 + y;
  return { view: 'side', dir: 1, x: bx, y, rot: track([[0, 0], [.5, 8], [.78, 30, 'out'], [1.6, 30], [2.6, 12, 'io']], t),
    feet: air ? [{ x: -40, lift: G - 7 - (hipW + 300) }, { x: 70, lift: G - 7 - (hipW + 260) }]
      : [kneeLeg(-12, 84, m), { x: 150, thigh: -2, mix: m }],
    hands: [{ f: -.6, d: .3 - .6 * (1 - fist), bow: .6 }, t > .75 ? { f: .75, d: .45, bow: .6 } : { f: .5, d: -.2, bow: .5 }],
    head: track([[0, 0], [.78, 10], [1.6, 16], [2.6, -6]], t),
    face: t < .75 ? 'k:open' : t < 2.0 ? 'k:angry' : 'k:smirk', blink: blinkAt(t), cam: 60, camY: -200 };
}
// C SLOW-MO COLLAPSE: wobbles, knees buckle in slow motion, sinks to the knees, then slumps forward, dead-inside face.
function collapse(t0) {
  const t = t0 % loop, a = 72, Y = hipFor(a) - 620;
  const wob = t > .3 && t < 1.4 ? 4 * sin(t * 9) : 0;
  const y = track([[0, 0], [.4, 0], [1.4, 30, 'io'], [2.6, Y, 'in'], [2.7, Y - 8, 'out'], [2.8, Y]], t);
  const m = track([[0, 0], [1.4, 0], [2.6, 1, 'in']], t);
  return { view: 'side', dir: 1, x: 0, y, rot: track([[0, 0], [1.4, 4], [2.6, 8], [3.4, 26, 'io']], t) + wob,
    feet: [kneeLeg(-12, a, m), kneeLeg(10, a + 4, m)].map((f, i) => m < .01 ? { x: i ? 18 : -18 } : f),
    hands: [{ f: .05, d: .98 }, { f: .1, d: .98, bow: .3 }],
    head: track([[0, 0], [.4, 0], [1.4, -5], [2.6, 6], [3.4, 18, 'io']], t) + wob * .5,
    face: t < .4 ? 'k:standard' : t < 1.6 ? 'k:sad' : 'deadInside', blink: t < 1.6 ? blinkAt(t) : null, cam: 40, camY: -200 };
}
export default { title: 'KNEEL  ·  pick A, B or C', dur: loop, reps: 2, styles: [
  { key: 'A', name: 'Thud + nooo', blurb: 'drops on both knees, arms up, wails', pose: thud },
  { key: 'B', name: 'Hero landing', blurb: 'drops in on one knee, holds, looks up smug', pose: hero },
  { key: 'C', name: 'Slow-mo collapse', blurb: 'knees buckle slowly, slumps forward', pose: collapse },
] };
// ---------- FRONT VIEW: knees on the floor, shins go back out of sight (leg = thigh only, no foot drawn) ----------
const KY = 1003 - HL - 620, kneeF = (x, s = 1) => ({ x, len: .5, toe: 90, kneeK: 0 }), FXK = [-34, 32];
const legsF = (m, x = 0, wide = 1) => FXK.map(fx => m > .5 ? kneeF(x + fx * wide) : { x: x + fx * wide, kneeK: .6 });
function thudF(t0) { const t = t0 % loop;
  const y = track([[0, 0], [.6, 0], [.68, -14, 'out'], [.86, KY, 'in'], [.96, KY - 26, 'out'], [1.06, KY, 'in']], t), m = t > .8 ? 1 : 0;
  const up = track([[0, 0], [1.0, 0], [1.25, 1, 'back'], [3.8, 1], [4.3, 0]], t), shake = up > .9 ? 2.5 * sin(t * 40) : 0;
  return { view: 'front', dir: 1, x: 0, y, rot: shake, feet: legsF(m), hands: [{ f: .3 + .5 * up, d: .85 - 1.35 * up, bow: .4, over: up > .5 }, { f: .3 + .5 * up, d: .85 - 1.35 * up, bow: .4, over: up > .5 }],
    head: -4 * up + shake, face: up > .4 ? 'wail' : t > .6 ? 'k:open' : 'k:sad', cam: 0, camY: -260 }; }
// one knee down, the other foot planted out to the side, hand on that knee; holds, then the slow smug look
function heroF(t0) { const t = t0 % loop;
  const y = track([[0, -520], [.45, KY + 30, 'in'], [.6, KY - 6, 'out'], [.75, KY]], t), down = t > .42;
  const look = track([[0, 0], [1.9, 0], [2.4, 1, 'io'], [3.9, 1], [4.3, 0]], t);
  return { view: 'front', dir: 1, x: 0, y, rot: 0, feet: down ? [kneeF(-36), { x: 120, kneeK: 1.1 }] : [{ x: -36, lift: -y * .9 }, { x: 60, lift: -y * .9 }],
    hands: [{ lx: -70, ly: 585, bow: .2 }, down ? { lx: 150, ly: 545, bow: .6 } : { f: .5, d: .2 }], head: 16 - 22 * look, face: look > .5 ? 'k:smirk' : 'k:standard', blink: look > .5 ? null : 'closed', cam: 0, camY: -260, noShadow: !down }; }
function collapseF(t0) { const t = t0 % loop;
  const wob = t < 1.6 ? 7 * sin(t * 9) * (t / 1.6) : 0, y = track([[0, 0], [1.2, 20], [2.4, KY, 'io']], t), m = t > 2.3 ? 1 : 0;
  const slump = track([[0, 0], [2.6, 0], [3.3, 1, 'io'], [4.2, 1], [4.5, 0]], t);
  return { view: 'front', dir: 1, x: wob, y, rot: wob * .6 + 16 * slump, pivot: [0, 1003], feet: m ? legsF(1) : FXK.map((fx, i) => ({ x: fx * (1 + 1.2 * Math.min(1, y / KY)), kneeK: .3 + 1.1 * Math.min(1, y / KY) * (i ? 1 : 1), knee: -1 })),
    hands: [{ f: .2, d: .95 }, { f: .2, d: .95 }], head: 14 * slump + wob, face: 'deadInside', cam: 0, camY: -260 }; }
export const front = { title: 'KNEEL DOWN  ·  front view', dur: 4.5, reps: 2, styles: [
  { key: 'A', name: 'Thud + nooo', blurb: 'drops on both knees, arms up, wails', pose: thudF },
  { key: 'B', name: 'Hero landing', blurb: 'drops in on one knee, holds, looks up smug', pose: heroF },
  { key: 'C', name: 'Slow-mo collapse', blurb: 'knees knock inward, sinks, slumps over', pose: collapseF },
] };
