import { G, track, blinkAt, reachDrop } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f';
// long tools (shovel, broom) are drawn AT the near hand with an angle (0 = straight up-down, + = bottom swings forward)
const shovel = a => (x, y) => `<g transform="translate(${x},${y}) rotate(${-a})"><path d="M0,-150 L0,250" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M0,-150 L0,250" stroke="#9b6b3e" stroke-width="10" stroke-linecap="round"/><path d="M-44,240 L44,240 L36,340 Q0,380 -36,340 Z" fill="#aeb4c2" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/></g>`;
const broom = a => (x, y) => `<g transform="translate(${x},${y}) rotate(${-a})"><path d="M0,-200 L0,330" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M0,-200 L0,330" stroke="#9b6b3e" stroke-width="9" stroke-linecap="round"/><path d="M-60,330 L60,330 L78,430 L-78,430 Z" fill="#e2b13c" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/><path d="M-30,345 L-36,420 M0,345 L0,420 M30,345 L36,420" stroke="#b9862a" stroke-width="6"/></g>`;
const st = (ch, P) => { P.y = Math.max(P.y || 0, reachDrop(ch, P)); return P; };
// ---------- DIG ----------
// d 0 = shovel stabbed into the ground in front, 1 = lifted and thrown back over the shoulder
const digPose = (d, extra) => ({ view: 'side', dir: 1, x: 0, rot: 26 - 34 * d, feet: [{ x: -50 }, { x: 50 }], hands: [{ f: .5 - .2 * d, d: .35 - .5 * d }, { f: .75 - .5 * d, d: .7 - .7 * d, bow: .4 }], held: [{ hand: 1, svg: shovel(-28 + 110 * d) }], head: 10 - 16 * d, cam: 80, ...extra });
function digEager(t, ch) { const u = (t / .55) % 1, d = u < .3 ? 0 : u < .6 ? (u - .3) / .3 : 1 - ((u - .6) / .4) ** 2; return st(ch, { ...digPose(d, { face: 'k:happy' }), y: 30 * (1 - d) }); }
function digTired(t0, ch) { const t = t0 % 6;
  if (t > 3.2) { const w = track([[3.2, 0], [3.6, 1], [5.4, 1], [5.9, 0]], t); return st(ch, { view: 'side', dir: 1, x: 0, rot: 10 * w, feet: [{ x: -50 }, { x: 50 }], hands: [{ f: .3, d: -.5 + .1 * sin(t * 7), over: true, bow: .8 }, { f: .7, d: .05, bow: .4 }], held: [{ hand: 1, svg: shovel(0) }], head: 14 * w, face: 'tired', cam: 80 }); }
  const u = (t / 1.6) % 1, d = u < .35 ? 0 : u < .8 ? ((u - .35) / .45) ** 2 * .8 : .8 * (1 - (u - .8) / .2); return st(ch, { ...digPose(d, { face: 'strain' }), y: 40 * (1 - d) }); }
function digAngry(t, ch) { const u = (t / .32) % 1, d = u < .5 ? .5 * (1 - u / .5) : .5 * ((u - .5) / .5); return st(ch, { ...digPose(d, { face: 'rage' }), x: 3 * sin(t * 40), y: 30 * (1 - d) }); }
export const dig = { title: 'DIG  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Eager digger', blurb: 'fast scoops, throws it over the shoulder', pose: digEager },
  { key: 'B', name: 'Worn out', blurb: 'slow scoops, leans on the shovel, wipes brow', pose: digTired },
  { key: 'C', name: 'Furious stabbing', blurb: 'stabs the ground like it owes him money', pose: digAngry },
] };
// ---------- SWEEP ----------
const sweepPose = (s, extra) => ({ view: 'side', dir: 1, x: 0, rot: 8, feet: [{ x: -40 }, { x: 40 }], hands: [{ f: .35 + .25 * s, d: .1 }, { f: .5 + .3 * s, d: .5, bow: .4 }], held: [{ hand: 1, svg: broom(18 * s) }], head: 8, cam: 80, ...extra });
function sweepHappy(t, ch) { const s = sin(2 * PI * t / .7), hip = sin(2 * PI * t / .35); return st(ch, { ...sweepPose(s, { face: 'k:happy' }), x: 25 * s, rot: 8 + 6 * s, head: 8 * hip, y: 20 + 15 * hip }); }
function sweepBored(t, ch) { const s = sin(2 * PI * t / 2.6); return st(ch, { ...sweepPose(s * .5, { face: 'tired' }), rot: 14, head: 16 }); }
function sweepAngry(t, ch) { const s = sin(2 * PI * t / .22); return st(ch, { ...sweepPose(s, { face: 'k:angry' }), x: 4 * s, rot: 12 + 3 * s }); }
export const sweep = { title: 'SWEEP  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Dancing sweep', blurb: 'sways with the broom, hips bob', pose: sweepHappy },
  { key: 'B', name: 'Bored sweep', blurb: 'one slow lazy stroke at a time', pose: sweepBored },
  { key: 'C', name: 'Angry sweep', blurb: 'short furious strokes', pose: sweepAngry },
] };
// ---------- FRONT VIEWS: the tool is held in front of the body, the stroke goes down / sideways ----------
const fr = (ch, o) => st(ch, { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -56, kneeK: .8 }, { x: 54, kneeK: .8 }], cam: 0, camY: -260, ...o });
// d 0 = stabbed into the ground between the feet, 1 = lifted and tipped out over the shoulder
const digF = (ch, d, o) => fr(ch, { y: 105 * (1 - d), rot: -5 * d, hands: [{ lx: -10 + 30 * d, ly: 440 - 90 * d }, { lx: 30 + 70 * d, ly: 545 - 150 * d, bow: .4 }], held: [{ hand: 1, svg: shovel(-70 * d) }], head: 8 - 12 * d, ...o });
function digEagerF(t, ch) { const u = (t / .55) % 1, d = u < .3 ? 0 : u < .6 ? (u - .3) / .3 : 1 - ((u - .6) / .4) ** 2; return digF(ch, d, { face: 'k:happy' }); }
function digTiredF(t0, ch) { const t = t0 % 6;
  if (t > 3.2) { const w = track([[3.2, 0], [3.6, 1], [5.4, 1], [5.9, 0]], t); return fr(ch, { y: 96, rot: 6 * w, hands: [{ lx: -150 + 60 * w, ly: 520 - 330 * w + 8 * sin(t * 7) * w, over: w > .5, bow: .8 }, { lx: 60, ly: 470, bow: .4 }], held: [{ hand: 1, svg: shovel(0) }], head: 10 * w, face: 'tired' }); }
  const u = (t / 1.6) % 1, d = u < .35 ? 0 : u < .8 ? ((u - .35) / .45) ** 2 * .8 : .8 * (1 - (u - .8) / .2); return digF(ch, d, { face: 'strain' }); }
function digAngryF(t, ch) { const u = (t / .32) % 1, d = u < .5 ? .45 * (1 - u / .5) : .45 * ((u - .5) / .5); return digF(ch, d, { face: 'rage', x: 3 * sin(t * 40) }); }
dig.front = { title: 'DIG  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Eager digger', blurb: 'fast scoops, tips it out to the side', pose: digEagerF },
  { key: 'B', name: 'Worn out', blurb: 'slow scoops, leans on the shovel, wipes brow', pose: digTiredF },
  { key: 'C', name: 'Furious stabbing', blurb: 'stabs the ground like it owes him money', pose: digAngryF },
] };
export const digFront = dig.front;
const sweepF = (ch, s, o) => fr(ch, { feet: [{ x: -40 }, { x: 38 }], hands: [{ lx: 20 + 40 * s, ly: 420 }, { lx: 70 + 60 * s, ly: 520, bow: .4 }], held: [{ hand: 1, svg: broom(22 * s) }], head: 6, ...o });
function sweepHappyF(t, ch) { const s = sin(2 * PI * t / .7), hip = sin(2 * PI * t / .35); return sweepF(ch, s, { face: 'k:happy', x: 30 * s, rot: 6 * s, head: 8 * hip, y: 30 + 14 * hip }); }
function sweepBoredF(t, ch) { const s = sin(2 * PI * t / 2.6); return sweepF(ch, s * .5, { face: 'tired', y: 34, rot: 5, head: 12 }); }
function sweepAngryF(t, ch) { const s = sin(2 * PI * t / .22); return sweepF(ch, s, { face: 'k:angry', x: 5 * s, y: 36, rot: 2 * s }); }
export const sweepFront = { title: 'SWEEP  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Dancing sweep', blurb: 'sways with the broom, hips bob', pose: sweepHappyF },
  { key: 'B', name: 'Bored sweep', blurb: 'one slow lazy stroke at a time', pose: sweepBoredF },
  { key: 'C', name: 'Angry sweep', blurb: 'short furious strokes', pose: sweepAngryF },
] };
export default dig;
