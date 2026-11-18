import { reachDrop } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const FX = [-36, 34];
function dash(t, ch) {
  const T = .17, c = steps(t, { T, duty: .36, lift: 150 }), s2 = cos(2 * PI * c.stride);
  const P = { view: 'front', dir: 1, x: 0, rot: 4 * sin(2 * PI * c.stride),
    feet: c.feet.map((f, i) => ({ x: FX[i] * .8, lift: f.lift, kneeK: .3, toe: -10 })),
    hands: [{ f: .35, d: .25 - .25 * s2, bow: 1.1 }, { f: .35, d: .25 + .25 * s2, bow: 1.1 }], head: 3 * sin(2 * PI * c.stride), face: 'k:angry' };
  P.y = 0; P.y = Math.max(reachDrop(ch, P, 10), 40 - 50 * sin(PI * c.p) ** 2);
  return { ...P, cam: 0, toward: t * 900 };
}
function panic(t, ch) {
  const T = .2, c = steps(t, { T, duty: .4, lift: 190 }), w = 2 * PI * t / .26;
  const P = { view: 'front', dir: 1, x: 0, rot: 5 * sin(w * .5),
    feet: c.feet.map((f, i) => ({ x: FX[i], lift: f.lift, kneeK: .45 })),
    hands: [{ f: .7 + .3 * sin(w), d: -.2 + .5 * cos(w), bow: .3, over: true }, { f: .7 + .3 * sin(w + 2), d: -.2 + .5 * cos(w + 2), bow: .3, over: true }],
    head: 8 * sin(w * .5), face: 'scream' };
  P.y = 0; P.y = Math.max(reachDrop(ch, P, 8), 30 - 40 * sin(PI * c.p) ** 2);
  return { ...P, cam: 0, toward: t * 600 };
}
// arms-back sprint toward the lens: shown in 3/4 view so the lean and the arms behind still read (a front card cannot lean toward us)
function armsback(t, ch) {
  const T = .11, c = steps(t, { T, duty: .38, lift: 110 }), jit = sin(2 * PI * t / (2 * T));
  const P = { view: '34', dir: 1, x: 0, rot: 18,
    feet: c.feet.map((f, i) => ({ x: FX[i] + 20, lift: f.lift, kneeK: .4, toe: -15 })),
    hands: [{ f: -.25, d: .2 + .04 * jit, bow: .08 }, { f: .95, d: .25 - .04 * jit, bow: .08 }].map((h, i) => i === 0 ? { lx: -150, ly: 470 + 6 * jit } : { lx: -40, ly: 520 - 6 * jit }),
    head: -10, face: 'k:smirk' };
  P.y = 0; P.y = Math.max(reachDrop(ch, P, 10), 50 - 30 * sin(PI * c.p) ** 2);
  return { ...P, cam: 0, toward: t * 1000 };
}
export default { title: 'RUN, FRONT VIEW  ·  toward the camera', dur: 6, styles: [
  { key: 'A', name: 'Cartoon dash', blurb: 'knees pump, fists pump, angry', pose: dash },
  { key: 'B', name: 'Panic flail', blurb: 'arms windmill, knees high, screaming', pose: panic },
  { key: 'C', name: 'Arms-back sprint', blurb: '3/4 view, leaning in, arms behind', pose: armsback },
] };
