import { track, blinkAt, reachDrop, cycle, G } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, D = PI / 180;
const loop = 4;
const HB = 640 - 620;                       // hip sits this far above the body's bottom
// body lying flat: rot +-90 about the hips; the bean's half-thickness in side view keeps it ON the floor (never through it)
const LIE = 918;   // with rot 80 the belly and the big head both rest on the floor                       // hip height when lying
// A TRIP + FACEPLANT: walks, a foot catches, he pitches forward flat on his face, the legs flip up and flop down.
function trip(t0, ch) {
  const t = t0 % loop;
  if (t < .8) { const c = cycle(t, { T: .4, S: 140, duty: .55, x0: -260, swing: u => ({ lift: 70 * sin(PI * u), toe: 0 }) });
    const P = { view: 'side', dir: 1, x: c.bx, rot: 4, feet: c.feet, hands: [{ f: .3 * cos(2 * PI * c.stride), d: .85 }, { f: -.3 * cos(2 * PI * c.stride), d: .85 }], face: 'k:standard', blink: blinkAt(t) };
    P.y = reachDrop(ch, P); return { ...P, cam: 220, camH: 1800, camY: -500 }; }
  const x0 = -260 + 140 / .4 * .8, u = t - .8;
  const rot = track([[0, 0], [.1, 15], [.42, 80, 'in'], [.52, 74, 'out'], [.6, 80, 'in']], u);
  const hipY = track([[0, 620 + 20], [.42, LIE, 'in'], [.52, LIE - 18, 'out'], [.6, LIE, 'in']], u);
  const x = x0 + track([[0, 0], [.42, 120, 'out']], u);
  const flip = track([[0, 0], [.42, 0], [.6, 1, 'out'], [1.0, 0, 'in'], [1.1, .15, 'out'], [1.2, 0]], u);
  const arms = track([[0, 0], [.1, 1, 'out'], [.4, 1], [.6, 0]], u);
  const feet = u < .42 ? [{ x: x0 + 40 }, { x: x0 - 30, lift: 160 * Math.min(1, u * 4) }] : [{ x: x - 300, lift: 260 * flip, kneeK: .3 }, { x: x - 330, lift: 330 * flip, kneeK: .3 }];
  return { view: 'side', dir: 1, x, y: hipY - 620, rot, feet,
    hands: [{ f: .2 + .8 * arms, d: .8 - 1.0 * arms }, { f: .3 + .8 * arms, d: .7 - 1.0 * arms }],
    head: track([[0, 0], [.42, -10], [.6, -30]], u), face: u < .42 ? 'jawdrop' : 'deadInside', cam: 220, camH: 1800, camY: -500 };
}
// B SLIP ON THE BACK: feet shoot out forward, he hangs in the air flat for a moment (cartoon), then slams down on his back.
function slip(t0) {
  const t = t0 % loop;
  const rot = track([[0, 0], [.8, 0], [.95, -40, 'out'], [1.1, -80, 'out'], [1.55, -82], [1.7, -80, 'in'], [1.8, -74, 'out'], [1.9, -80]], t);
  const hipY = track([[0, 620], [.8, 620], [1.1, 560, 'out'], [1.5, 575], [1.7, LIE, 'in3'], [1.8, LIE - 22, 'out'], [1.9, LIE, 'in']], t);
  const legsUp = track([[0, 0], [.8, 0], [1.0, 1, 'out'], [1.7, 1], [2.1, 0, 'io']], t);
  const hips = hipY - 620;
  const feet = t < .8 ? [{ x: -18 }, { x: 18 }] : [{ x: 260, lift: Math.max(0, 1003 - hipY + 120) * legsUp, kneeK: .2 }, { x: 290, lift: Math.max(0, 1003 - hipY + 160) * legsUp, kneeK: .2 }];
  const arms = track([[0, 0], [.85, 0], [1.0, 1, 'out'], [1.7, 1], [2.0, .2]], t);
  return { view: 'side', dir: 1, x: 0, y: hips, rot, feet,
    hands: [{ f: -.2 + .9 * arms, d: .9 - 1.5 * arms }, { f: .9 * arms, d: .9 - 1.6 * arms }],
    head: track([[0, 0], [.8, 0], [1.0, 14], [1.8, 10], [2.2, 30]], t), face: t < .8 ? 'k:standard' : t < 1.75 ? 'jawdrop' : 'deadInside', blink: blinkAt(t), cam: -120 };
}
// C TIMBER: wobbles... freezes stiff... and topples like a tree, straight as a plank, thud, small bounce.
function timber(t0) {
  const t = t0 % loop;
  const wob = t < 1.2 ? 5 * sin(t * 8) * Math.min(1, t * 2) : 0;
  const fall = track([[0, 0], [1.5, 0], [2.3, 1, 'in3'], [2.38, .93, 'out'], [2.48, 1, 'in']], t);
  const rot = wob + 90 * fall, sx = -120 * fall;     // sx lifts the plank so the big head (not the body) lands on the floor
  const piv = [40, 1003];
  // rigid: the feet go round with the body about the toes
  const ank = [[-18 + sx, 1003], [18 + sx, 1003]].map(([ax, ay]) => { const a = rot * D, dx = ax - piv[0], dy = ay - piv[1]; return [piv[0] + dx * cos(a) - dy * sin(a), piv[1] + dx * sin(a) + dy * cos(a)]; });
  return { view: 'side', dir: 1, x: sx, y: 0, rot, pivot: piv, feet: ank.map(([x, y]) => ({ x, lift: 1003 - y, kneeK: .05, toe: -rot })),
    hands: [{ f: .02, d: .99, bow: .1 }, { f: .02, d: .99, bow: .1 }],
    head: 0, face: t < 1.5 ? 'k:open' : 'deadInside', blink: t < 1.5 ? blinkAt(t) : null, cam: 400, camH: 1900, camY: -600 };
}
export default { title: 'FALL  ·  pick A, B or C', dur: loop, reps: 2, styles: [
  { key: 'A', name: 'Trip + faceplant', blurb: 'foot catches, flat on the face, legs flop', pose: trip },
  { key: 'B', name: 'Slip on the back', blurb: 'feet shoot up, hangs, slams down', pose: slip },
  { key: 'C', name: 'Timber', blurb: 'wobbles, goes stiff, topples like a tree', pose: timber },
] };
