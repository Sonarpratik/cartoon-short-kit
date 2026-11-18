import { track, blinkAt, reachDrop, cycle } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
// A CHIN SCRATCH: hand on the chin, eyes up, foot taps, then the idea lands (pops up on the toes, finger up)
function chin(t0, ch) {
  const t = t0 % 5, idea = track([[0, 0], [3.2, 0], [3.35, 1, 'back'], [4.6, 1], [4.9, 0]], t), tap = Math.max(0, sin(2 * PI * t * 2)) * (1 - idea);
  const P = { view: '34', dir: 1, x: 0, y: -30 * idea, feet: [{ x: -30, lift: 30 * idea }, { x: 42, lift: 30 * idea + 4 * tap, toe: 22 * tap }],
    hands: [{ f: .2, d: .6 }, idea > .5 ? { f: .3, d: -.95, over: true, bow: .2 } : { lx: 30, ly: 300 + 4 * sin(t * 12), over: true }], head: -8 * (1 - idea) + 3 * sin(t * 1.5), face: idea > .5 ? 'k:happy' : 'sus' };
  return { ...P, cam: 0, camY: -320 };
}
// B PACING: walks back and forth, hands behind the back, head down thinking, turns at each end
function pace(t0, ch) {
  const t = t0 % 6, leg = Math.floor(t / 3), u = t % 3, dir = leg ? -1 : 1, x0 = leg ? 200 : -200;
  const c = cycle(Math.min(u, 2.4), { T: .4, S: 70, duty: .6, dir, x0, swing: v => ({ lift: 30 * sin(PI * v) }) });
  const P = { view: u > 2.4 ? 'front' : 'side', dir, x: c.bx, rot: 6 * dir, feet: u > 2.4 ? [{ x: c.bx - 36 }, { x: c.bx + 34 }] : c.feet,
    hands: [{ f: -.35, d: .8 }, { f: -.3, d: .8 }], head: 12 * dir, face: 'k:standard', blink: blinkAt(t) };
  P.y = Math.max(reachDrop(ch, P), 10); return { ...P, cam: 0 };
}
// C HEAD SCRATCH CONFUSED: scratches the head, tilts left, tilts right, shrugs big
function confused(t0, ch) {
  const t = t0 % 5, scr = sin(t * 18), shrug = track([[0, 0], [3.0, 0], [3.3, 1, 'back'], [4.4, 1], [4.7, 0]], t), tilt = track([[0, 0], [.5, 12], [1.5, 12], [1.9, -12], [2.9, -12], [3.2, 0]], t);
  const P = { view: 'front', dir: 1, x: 0, y: -10 * shrug, feet: [{ x: -36 }, { x: 34 }],
    hands: shrug > .3 ? [{ f: .95, d: -.1 }, { f: .95, d: -.1 }] : [{ f: .2, d: .9 }, { f: .5, d: -.85 + .05 * scr, over: true, bow: .2 }], head: tilt + 4 * shrug, face: 'confused' };
  P.y = Math.max(P.y, reachDrop(ch, P)); return { ...P, cam: 0 };
}
export default { title: 'THINKING  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Chin scratch + idea', blurb: 'hmm... foot taps... got it! finger up', pose: chin },
  { key: 'B', name: 'Pacing', blurb: 'back and forth, hands behind the back', pose: pace },
  { key: 'C', name: 'Confused scratch', blurb: 'scratches the head, tilts, big shrug', pose: confused },
] };
