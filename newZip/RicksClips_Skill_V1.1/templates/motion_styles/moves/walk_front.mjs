import { reachDrop, blinkAt } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const FX = [-36, 34];
function bouncy(t, ch) {
  const T = .4, c = steps(t, { T, duty: .55, lift: 85 }), s2 = cos(2 * PI * c.stride);
  const P = { view: 'front', dir: 1, x: 0, rot: 3 * sin(2 * PI * c.stride),
    feet: c.feet.map((f, i) => ({ x: FX[i], lift: f.lift, kneeK: .35, toe: 15 * sin(PI * f.u) })),
    hands: [{ f: .3, d: .85 - .3 * Math.max(0, s2), bow: .4 }, { f: .3, d: .85 - .3 * Math.max(0, -s2), bow: .4 }],
    head: 5 * sin(2 * PI * c.p - 1.2) * (c.side ? 1 : -1), face: 'k:happy' };
  P.y = 0; P.y = Math.max(reachDrop(ch, P), 70 - 70 * sin(PI * c.p) ** 2);
  return { ...P, cam: 0, toward: t * 380 };
}
function swagger(t, ch) {
  const T = .56, c = steps(t, { T, duty: .62, lift: 50 }), nod = Math.max(0, cos(2 * PI * c.p)) ** 3, sw = sin(2 * PI * c.stride);
  const P = { view: 'front', dir: 1, x: 6 * sw, rot: 6 * sw, pivot: [0, 1003],
    feet: c.feet.map((f, i) => ({ x: FX[i] * 1.5, lift: f.lift, kneeK: .5 })),
    hands: [{ f: .55 + .1 * sw, d: .88, bow: .8 }, { f: .55 - .1 * sw, d: .88, bow: .8 }],
    head: -6 * sw + 4 * nod, face: 'k:smirk', blink: null };
  P.y = 0; P.y = Math.max(reachDrop(ch, P), 25 + 22 * nod);
  return { ...P, cam: 0, toward: t * 300 };
}
function waddle(t, ch) {
  const T = .24, c = steps(t, { T, duty: .5, lift: 32 }), rs = c.side ? 1 : -1, rock = 10 * rs * sin(PI * Math.min(1, c.p * 1.1));
  const P = { view: 'front', dir: 1, x: 0, rot: rock, pivot: [rs * 34, 1003],
    feet: c.feet.map((f, i) => ({ x: FX[i] * .8, lift: f.lift, kneeK: .1 })),
    hands: [{ f: .62, d: .6 + .06 * sin(4 * PI * c.p), bow: .25 }, { f: .62, d: .6 - .06 * sin(4 * PI * c.p), bow: .25 }], head: -rock * .6, face: 'k:open' };
  P.y = 0; P.y = reachDrop(ch, P, 2);
  return { ...P, cam: 0, toward: t * 200 };
}
export default { title: 'WALK, FRONT VIEW  ·  toward the camera', dur: 6, styles: [
  { key: 'A', name: 'Bouncy cartoon', blurb: 'big bounce, arms pump, head bobs', pose: bouncy },
  { key: 'B', name: 'Swagger strut', blurb: 'wide, shoulders roll, head nods', pose: swagger },
  { key: 'C', name: 'Penguin waddle', blurb: 'tiny steps, rocks side to side', pose: waddle },
] };
