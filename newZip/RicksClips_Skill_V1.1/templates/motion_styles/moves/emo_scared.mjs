import { track, blinkAt, reachDrop, cycle } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
// A KNOCKING KNEES: knees knock together, whole body shivers, hands clutched at the chest (front view)
function knees(t, ch) {
  const k = sin(t * 40);
  const P = { view: 'front', dir: 1, x: 2 * k, y: 40, rot: 1.5 * k, feet: [{ x: -60, kneeK: -1.2 - .6 * k }, { x: 58, kneeK: -1.2 + .6 * k }],
    hands: [{ lx: 30, ly: 430 + 3 * k }, { lx: -30, ly: 440 - 3 * k }], head: 2 * k, face: 'terrified' };
  return { ...P, cam: 0 };
}
// B BACK AWAY SLOWLY: tiptoes backwards, hands up in front, eyes huge... then turns and bolts
function backaway(t0, ch) {
  const t = t0 % 5;
  if (t < 3.4) { const c = cycle(t, { T: .55, S: 50, duty: .6, dir: -1, x0: 120, swing: u => ({ lift: 30 * Math.sin(PI * u), toe: -20 }) });
    const P = { view: 'side', dir: 1, x: c.bx, rot: -8, feet: c.feet, hands: [{ f: .7, d: -.05 }, { f: .75, d: .0 }], head: -6, face: 'k:open' };
    P.y = Math.max(reachDrop(ch, P), 20); return { ...P, cam: c.bx - 60 }; }
  const u = t - 3.4, c = cycle(u, { T: .15, S: 200, duty: .36, dir: -1, x0: 120 - 50 / .55 * 3.4, swing: v => ({ lift: 150 * Math.sin(PI * v), toe: -30 }) });
  const P = { view: 'side', dir: -1, x: c.bx, rot: -18, feet: c.feet, hands: [{ f: .9 * Math.sin(u * 40), d: -.2 }, { f: -.9 * Math.sin(u * 40), d: -.2, over: true }], head: 10, face: 'scream' };
  P.y = Math.max(reachDrop(ch, P), 30); return { ...P, cam: Math.max(c.bx, -260) - 60 };
}
// C HIDE + PEEK: ducks down behind a crate, then the head pops up slowly to peek, and ducks again fast
const crate = `<rect x="-200" y="410" width="560" height="600" rx="12" fill="#b77a3f" stroke="#2a1a1f" stroke-width="12"/><path d="M-190,700 L350,700" stroke="#8a5a2c" stroke-width="12"/>`;
function peek(t0, ch) {
  const t = t0 % 4, up = track([[0, 0], [.6, 0], [1.8, 1, 'io'], [2.6, 1], [2.72, 0, 'in'], [4, 0]], t);
  const shake = up > .2 ? 2 * sin(t * 45) : 0;
  const P = { view: 'side', dir: 1, x: 0, y: 355 - 345 * up + shake, rot: 18 - 12 * up, feet: [{ x: 110 }, { x: 160 }], hands: [{ f: .9, d: .3 }, { f: .95, d: .25 - .2 * up, over: true }], head: -4, face: up > .8 && t > 2.2 ? 'terrified' : 'k:open' };
  return { ...P, front: crate, cam: 120 };
}
export default { title: 'SCARED  ·  pick A, B or C', dur: 5, styles: [
  { key: 'A', name: 'Knocking knees', blurb: 'knees knock, body shivers', pose: knees },
  { key: 'B', name: 'Back away... bolt', blurb: 'tiptoes back, then runs screaming', pose: backaway },
  { key: 'C', name: 'Hide + peek', blurb: 'ducks behind a crate, peeks, ducks', pose: peek },
] };
