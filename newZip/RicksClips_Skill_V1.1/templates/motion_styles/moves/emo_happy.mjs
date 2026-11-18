import { track, blinkAt, cycle, reachDrop } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, pos = v => Math.max(0, v);
// A HAPPY DANCE: bounces side to side on the beat, arms pump up and down, head bobs (front view)
function dance(t, ch) {
  const b = 2 * PI * t / .5, side = sin(b / 2), up = pos(sin(b));
  const P = { view: 'front', dir: 1, x: 30 * side, rot: 7 * side, pivot: [30 * side, 1003],
    feet: [{ x: -36 + 30 * side, lift: side > 0 ? 40 * up : 0, kneeK: .4 }, { x: 34 + 30 * side, lift: side < 0 ? 40 * up : 0, kneeK: .4 }],
    hands: [{ f: .6, d: .2 - .4 * (side > 0 ? up : 0), bow: .5, over: side > 0 && up > .5 }, { f: .6, d: .2 - .4 * (side < 0 ? up : 0), bow: .5, over: side < 0 && up > .5 }],
    head: -8 * side, face: 'k:happy' };
  P.y = Math.max(reachDrop(ch, P), 30 - 30 * up); return { ...P, cam: 0 };
}
// B JUMP FOR JOY: little hops on the spot, both fists punch the air on every hop
function joy(t, ch) {
  const k = (t % .7) / .7, air = k > .25 && k < .85, h = air ? -230 * sin(PI * (k - .25) / .6) : 0, crouch = k < .25 ? 50 * sin(PI * k / .25) : 0;
  const P = { view: 'front', dir: 1, x: 0, y: h + crouch, rot: 0, feet: [{ x: -36, lift: air ? -h + 40 : 0, kneeK: .5 }, { x: 34, lift: air ? -h + 40 : 0, kneeK: .5 }],
    hands: [{ f: .45, d: air ? -.75 : .5, bow: .3, over: air }, { f: .45, d: air ? -.75 : .5, bow: .3, over: air }], head: air ? -6 : 4, face: air ? 'starstruck' : 'k:happy' };
  if (!air) P.y = Math.max(P.y, reachDrop(ch, P)); return { ...P, cam: 0, camY: -500, camH: 1700 };
}
// C SKIP: skips along, hop-step on each foot, arms swinging high, happy
function skip(t, ch) {
  const c = cycle(t, { T: .32, S: 120, duty: .45, swing: u => ({ lift: 140 * sin(PI * u), toe: 20 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: 4, feet: c.feet, hands: [{ f: .7 * cos(2 * PI * c.stride), d: .3 - .4 * pos(cos(2 * PI * c.stride)) }, { f: -.7 * cos(2 * PI * c.stride), d: .3 - .4 * pos(-cos(2 * PI * c.stride)) }],
    head: 6 * sin(2 * PI * c.p), face: 'k:happy' };
  P.y = Math.max(reachDrop(ch, P), 30 - 90 * sin(PI * c.p) ** 2); return { ...P, cam: c.bx + 60 };
}
export default { title: 'HAPPY  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Happy dance', blurb: 'side to side on the beat, arms pump', pose: dance },
  { key: 'B', name: 'Jump for joy', blurb: 'hops, fists punch the air', pose: joy },
  { key: 'C', name: 'Skip along', blurb: 'hop-steps, big arm swings', pose: skip },
] };
