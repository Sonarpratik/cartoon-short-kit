import { track, blinkAt, cycle, reachDrop } from '../rig.mjs';
import { seated } from './emo_helpers.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
// A SAD SHUFFLE: slumped, head hanging, slow dragging steps, arms dangling
function shuffle(t, ch) {
  const c = cycle(t, { T: .75, S: 60, duty: .7, swing: u => ({ lift: 10 * sin(PI * u), toe: -5 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: 10, feet: c.feet, hands: [{ f: .2, d: .98, bow: .2 }, { f: .25, d: .98, bow: .2 }], head: 22 + 2 * sin(2 * PI * c.p), face: 'k:sad', blink: blinkAt(t, 3) };
  P.y = Math.max(reachDrop(ch, P), 30); return { ...P, cam: c.bx + 60 };
}
// B SOB ON THE CHAIR: sits, face in the hands, shoulders shake with each sob
function sob(t) {
  const s = Math.max(0, sin(2 * PI * t / .9)) ** 2;
  return seated({ rot: 14 + 3 * s, y: 190 - 6 * s, hands: [{ f: .6, d: -.15, bow: 1, over: true }, { f: .65, d: -.1, bow: 1, over: true }], head: 24 + 4 * s, face: 'wail' });
}
// C DRAMATIC SIGH: big breath in (rises), long sigh out, slumps lower and lower, then sinks to the floor
function sigh(t0, ch) {
  const t = t0 % 6, br = track([[0, 0], [.5, 0], [1.3, 1, 'out'], [2.6, -1, 'io'], [3.4, -1], [4.0, 1, 'out'], [5.3, -1.4, 'io'], [6, -1.4]], t);
  const P = { view: '34', dir: 1, x: 0, y: -18 * br, rot: -4 * br, feet: [{ x: -30 }, { x: 42 }], hands: [{ f: .1, d: .95 + .05 * br }, { f: .1, d: .95 + .05 * br }],
    head: -10 * br + 6, face: br > .3 ? 'k:open' : 'k:sad', blink: blinkAt(t) };
  P.y = Math.max(P.y, reachDrop(ch, P)); return { ...P, cam: 0 };
}
export default { title: 'SAD  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Sad shuffle', blurb: 'slumped, head hanging, drags the feet', pose: shuffle },
  { key: 'B', name: 'Sob on the chair', blurb: 'face in the hands, shoulders shake', pose: sob },
  { key: 'C', name: 'Dramatic sigh', blurb: 'huge breath in, long sigh out, slumps', pose: sigh },
] };
