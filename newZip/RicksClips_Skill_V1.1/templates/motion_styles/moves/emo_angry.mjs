import { track, blinkAt, reachDrop } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, pos = v => Math.max(0, v);
// A STOMP TANTRUM: stomps hard foot after foot, fists shaking down by the sides (front view)
function stomp(t, ch) {
  const k = (t % .5) / .5, foot = Math.floor(t / .5) % 2, up = k < .6 ? sin(PI * k / .6) : 0, slam = k > .6 && k < .7 ? 1 : 0;
  const P = { view: 'front', dir: 1, x: 0, rot: (foot ? 1 : -1) * 4 * up, feet: [{ x: -40, lift: foot === 0 ? 110 * up : 0, kneeK: .7 }, { x: 38, lift: foot === 1 ? 110 * up : 0, kneeK: .7 }],
    hands: [{ f: .5, d: .55 + .06 * sin(t * 60), bow: .7 }, { f: .5, d: .55 + .06 * sin(t * 60 + 1), bow: .7 }], head: 6 * sin(t * 30) * .3, face: 'rage' };
  P.y = Math.max(reachDrop(ch, P), 20 + 25 * slam); return { ...P, cam: 0 };
}
// B HUFF + TURN AWAY: arms crossed, chin up, turns his back with a hmph, glances back
function huff(t0) {
  const t = t0 % 4;
  const view = t < 1.2 ? 'front' : t < 1.35 ? 'side' : t < 2.8 ? 'back' : t < 3.4 ? 'side' : 'back';
  const hop = t > 1.15 && t < 1.4 ? -30 * sin(PI * (t - 1.15) / .25) : 0;
  const crossed = view === 'front' ? [{ lx: 46, ly: 470 }, { lx: -40, ly: 492 }] : [{ f: .2, d: .6 }, { f: .2, d: .6 }];
  return { view, dir: 1, x: 0, y: hop, feet: (view === 'side' ? [-18, 18] : [-36, 34]).map(x => ({ x, lift: -hop })), hands: crossed,
    head: view === 'front' ? -10 : view === 'side' ? -8 : 0, face: view === 'side' ? 'sideeye' : 'k:angry', cam: 0 };
}
// C SHAKING FURY: rises up stiff, whole body trembles faster and faster, then points and yells
function fury(t0, ch) {
  const t = t0 % 5, build = track([[0, 0], [2.5, 1, 'in']], t), shake = (2 + 7 * build) * sin(t * (30 + 40 * build));
  const point = track([[0, 0], [2.6, 0], [2.75, 1, 'out'], [4.6, 1], [4.9, 0]], t);
  const P = { view: 'side', dir: 1, x: shake * .6, rot: shake * .4 - 6 * point, feet: [{ x: -18 }, { x: 18 }],
    hands: [{ f: .3, d: .5, bow: .7 }, point > .5 ? { f: 1, d: -.15, bow: .1 } : { f: .3, d: .5 + .05 * sin(t * 50), bow: .7 }], head: shake * .5 - 6 * point, face: point > .5 ? 'k:angry' : 'k:angry' };
  P.y = reachDrop(ch, P); return { ...P, cam: 40 };
}
export default { title: 'ANGRY  ·  pick A, B or C', dur: 5, reps: 1, styles: [
  { key: 'A', name: 'Stomp tantrum', blurb: 'stomps hard, fists shaking', pose: stomp },
  { key: 'B', name: 'Huff + turn away', blurb: 'arms crossed, hmph, turns his back', pose: huff },
  { key: 'C', name: 'Shaking fury', blurb: 'trembles harder and harder, then points', pose: fury },
] };
