import { G, cycle, track } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
const INK = '#2a1a1f', RS = 110, LX = 128;           // rung spacing, ladder x (in front of the climber)
function ladder(y0, y1, phase) {
  const o = [`<path d="M${LX},${y0} L${LX},${y1} M${LX + 70},${y0} L${LX + 70},${y1}" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="M${LX},${y0} L${LX},${y1} M${LX + 70},${y0} L${LX + 70},${y1}" stroke="#d9a066" stroke-width="13"/>`];
  for (let y = Math.ceil((y0 - phase) / RS) * RS + phase; y < y1; y += RS) o.push(`<path d="M${LX},${y} L${LX + 70},${y - 14}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M${LX},${y} L${LX + 70},${y - 14}" stroke="#b77a3f" stroke-width="9" stroke-linecap="round"/>`);
  return o.join('');
}
// hands and feet are PLANTED on rungs (cycle() run upward); the body rises between them
function climb(t, { T, face, head = 0, lean = 6, hug = 0, shake = 0, sag = 0, pause = null, blink = null }) {
  let tt = t; if (pause) { const k = t % pause[0]; tt = t - k + Math.min(k, pause[0] - pause[1]) - Math.floor(t / pause[0]) * pause[1]; }   // freezes for pause[1] s in every pause[0] s
  const D = .55, c = cycle(tt, { T, S: RS, duty: D, swing: u => ({ lift: 0 }) }), h = cycle(tt + T, { T, S: RS, duty: D, x0: 0, swing: u => ({ lift: 0 }) });
  const up = c.bx, sg = sag * Math.abs(sin(PI * c.p)), sh = shake * sin(t * 45);
  const hipH = up + 290 - sg, hipY = G - 7 - hipH, rung0 = G - 7 - RS * D;                 // rungs sit at G-7 - (n*RS + RS*D)
  const feet = c.feet.map((f, i) => ({ x: LX - 30 + i * 14 + 24 * (f.down ? 0 : -sin(PI * f.phase)), lift: f.x, toe: 0 }));
  const hands = h.feet.map((f, i) => ({ wx: LX + 4 + i * 10 - (f.down ? 0 : 30 * sin(PI * f.phase)), wy: G - 7 - (f.x + 4 * RS) + 4, bow: .7, over: i === 1 }));
  return { view: 'side', dir: 1, x: -78 + 26 * hug + sh, y: hipY - 620, rot: lean - 4 * hug + sh * .5, feet, hands, head: head + sh, face, blink,
    back: ladder(hipY - 1500, G + 20, rung0 % RS), cam: 60, camY: hipY - 620 - 300, noShadow: up > 150 };
}
// A EAGER SCAMPER: zips up fast, head up, happy
const eager = t => climb(t, { T: .2, face: 'k:happy', head: -14 });
// B TERRIFIED: hugs the ladder, shaking, one slow rung at a time, freezes and looks down
const scared = t => { const k = t % 2.4, frozen = k > 1.5; return climb(t, { T: .55, face: frozen ? 'terrified' : 'k:open', head: frozen ? 26 : -4, hug: 1, shake: frozen ? 3 : 1.5, pause: [2.4, .9] }); };
// C EXHAUSTED: heavy slow pulls, the body sags down between rungs, straining
const heavy = t => climb(t, { T: .8, face: 'strain', head: 6, lean: 12, sag: 46 });
export default { title: 'CLIMB A LADDER  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Eager scamper', blurb: 'zips up fast, head up, happy', pose: eager },
  { key: 'B', name: 'Terrified', blurb: 'hugs the ladder, shakes, looks down', pose: scared },
  { key: 'C', name: 'Exhausted', blurb: 'heavy pulls, sags between rungs', pose: heavy },
] };
// ---------- BACK VIEW: seen from behind, the ladder is beyond the climber; hands and feet sit ON the rungs ----------
const RW = 130, R0 = G - 7 - 60;                                   // half ladder width; the lowest rung
const ladderB = (y0, y1) => { const o = [`<path d="M${-RW},${y0} L${-RW},${y1} M${RW},${y0} L${RW},${y1}" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="M${-RW},${y0} L${-RW},${y1} M${RW},${y0} L${RW},${y1}" stroke="#d9a066" stroke-width="13"/>`];
  for (let y = R0 - Math.floor((R0 - y0) / RS) * RS; y < y1; y += RS) o.push(`<path d="M${-RW},${y} L${RW},${y}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M${-RW},${y} L${RW},${y}" stroke="#b77a3f" stroke-width="9" stroke-linecap="round"/>`);
  return o.join(''); };
const rungIn = (lo) => R0 - Math.floor((R0 - lo) / RS) * RS - (((R0 - lo) % RS) === 0 ? 0 : 0);   // the rung at or just above world y `lo`... (first rung with y <= lo)
function climbB(t, { speed, face, head = 0, shake = 0, sag = 0, hug = 0, pause = null }) {
  let tt = t; if (pause) { const k = t % pause[0]; tt = t - k + Math.min(k, pause[0] - pause[1]) - Math.floor(t / pause[0]) * pause[1]; }
  const up = speed * tt, sh = shake * sin(t * 45), sg = sag * Math.abs(sin(PI * up / RS)), hipY = G - 7 - 290 - up + sg, y = hipY - 620;
  // each limb holds the rung inside its own window (windows are half a rung apart, so left and right alternate)
  const grab = lo => { const r = R0 - Math.ceil((R0 - lo) / RS) * RS; return r; };
  const hands = [0, 1].map(i => ({ wx: (i ? 1 : -1) * (RW - 2), wy: grab(hipY - 140 + i * RS / 2 - sg) + 2, bow: .6 + .3 * hug }));
  const feet = [0, 1].map(i => ({ x: (i ? 1 : -1) * 48, lift: G - 7 - grab(hipY + 330 - i * RS / 2 - sg) + 8, kneeK: 1, toe: 0 }));
  return { view: 'back', dir: 1, x: sh, y, rot: sh * .5, feet, hands, head: head + sh, face, back: ladderB(hipY - 1500, G + 20), cam: 0, camY: hipY - 620 - 300, noShadow: up > 150 };
}
const eagerB = t => climbB(t, { speed: 520, face: 'k:happy' });
const scaredB = t => { const k = t % 2.4, frozen = k > 1.5; return climbB(t, { speed: 190, face: 'terrified', head: frozen ? 14 * sin(t * 3) : 0, hug: 1, shake: frozen ? 3 : 1.5, pause: [2.4, .9] }); };
const heavyB = t => climbB(t, { speed: 130, face: 'strain', head: 8, sag: 46 });
export const front = { title: 'CLIMB A LADDER  ·  from behind', dur: 6, styles: [
  { key: 'A', name: 'Eager scamper', blurb: 'zips up fast', pose: eagerB },
  { key: 'B', name: 'Terrified', blurb: 'shakes, freezes, head turns to look down', pose: scaredB },
  { key: 'C', name: 'Exhausted', blurb: 'heavy pulls, sags between rungs', pose: heavyB },
] };
