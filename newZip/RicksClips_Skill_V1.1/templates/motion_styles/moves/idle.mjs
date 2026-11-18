import { track, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
const loop = 6;
// A STILL HOLD (like Rick): stands still, only breathing, a blink and one small head tilt.
function still(t) {
  const br = 2.5 * sin(2 * PI * t / 3.2);
  return { view: '34', dir: 1, x: 0, y: br, feet: [{ x: -30 }, { x: 42 }], hands: [null, null], head: track([[0, 0], [2.0, 0], [2.4, 5, 'io'], [4.4, 5], [4.8, 0, 'io']], t), face: 'k:standard', blink: blinkAt(t, 2.8, .6), cam: 0 };
}
// B IMPATIENT: arms crossed, one foot taps fast, head ticks, annoyed side-eye.
function impatient(t) {
  const tap = Math.max(0, sin(2 * PI * t * 2.6)), tick = Math.round(sin(2 * PI * t / 2) * 1.5) * 3;
  return { view: 'front', dir: 1, x: 0, y: 0, feet: [{ x: -36 }, { x: 40, lift: 6 * tap, toe: 26 * tap }],
    hands: [{ lx: 46, ly: 470 }, { lx: -40, ly: 492 }], head: tick, face: t % 3 < 1.6 ? 'k:angry' : 'sideeye', cam: 0 };
}
// C BORED SWAY: hands behind the back, rocks heel to toe, looks around at the ceiling.
function bored(t) {
  const r = 5 * sin(2 * PI * t / 1.6), back = r < 0;
  return { view: 'side', dir: 1, x: 3 * r, y: Math.abs(r) * 1.5, rot: r, feet: [{ x: -18, toe: back ? -r * 3 : 0 }, { x: 18, toe: back ? -r * 3 : 0 }],
    hands: [{ f: -.35, d: .82 }, { f: -.3, d: .82 }], head: -6 + 4 * sin(2 * PI * t / 3.2), face: 'tired', cam: 0 };
}
export default { title: 'IDLE  ·  pick A, B or C', dur: loop, styles: [
  { key: 'A', name: 'Still hold', blurb: 'only breathing and a blink (like Rick)', pose: still },
  { key: 'B', name: 'Impatient tap', blurb: 'arms crossed, foot taps, side-eye', pose: impatient },
  { key: 'C', name: 'Bored sway', blurb: 'hands behind back, rocks heel to toe', pose: bored },
] };
