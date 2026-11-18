// SNEAK (seen in Rick's clips: burglar on tiptoe, peeking). Feet plant and stay put, nothing glides.
import { cycle, track, reachDrop } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const sin = Math.sin, PI = Math.PI;
const paws = w => [{ f: .5, d: .12 + .08 * w, bow: .9 }, { f: .58, d: .02 - .08 * w, bow: .9 }];
// A TIPTOE: huge slow high steps on the toes, hands held like paws, rocks back and forth
function tiptoe(t, ch) { const c = cycle(t, { T: .7, S: 80, duty: .55, swing: u => ({ lift: 170 * sin(PI * u), toe: 55 }) }), w = sin(2 * PI * c.p);
  const P = { view: 'side', dir: 1, x: c.bx, rot: 8 + 8 * w, feet: c.feet.map(f => ({ ...f, toe: f.down ? 0 : f.toe })), hands: paws(w), head: -6 * w, face: 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 50); return { ...P, cam: c.bx + 100 }; }
// B FREEZE: tiptoes, hears something, freezes with one foot in the air, eyes wide, then carries on
function freeze(t0, ch) { const t = t0 % 6, tt = track([[0, 0], [1.6, 1.6], [3.6, 1.6], [6, 4.0]], t) + Math.floor(t0 / 6) * 4.0, fr = t > 1.6 && t < 3.6, sh = fr ? 1.5 * sin(t * 40) : 0;
  const c = cycle(tt + .52, { T: .7, S: 80, duty: .55, swing: u => ({ lift: 170 * sin(PI * u), toe: 55 }) }), w = sin(2 * PI * c.p);
  const P = { view: 'side', dir: 1, x: c.bx + sh, rot: 8 + 8 * w, feet: c.feet.map(f => ({ ...f, toe: f.down ? 0 : f.toe })), hands: paws(w), head: fr ? -16 : -6 * w, face: fr ? 'terrified' : 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 50); return { ...P, cam: c.bx + 100 }; }
// C LOW SCUTTLE: bent double, tiny fast steps, knuckles nearly on the floor, eyes everywhere
function scuttle(t, ch) { const c = cycle(t, { T: .15, S: 30, duty: .6, swing: u => ({ lift: 22 * sin(PI * u) }) }), look = Math.floor(t * 1.5) % 2 ? 1 : -1;
  const P = { view: 'side', dir: 1, x: c.bx, rot: 38, feet: c.feet, hands: [{ f: .3, d: .9 }, { f: .45, d: .85 }], head: -14 + 10 * look, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 150); return { ...P, cam: c.bx + 140 }; }
export default { title: 'SNEAK  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Tiptoe', blurb: 'huge slow steps on the toes, paws up', pose: tiptoe },
  { key: 'B', name: 'Freeze', blurb: 'hears a noise, freezes with a foot in the air', pose: freeze },
  { key: 'C', name: 'Low scuttle', blurb: 'bent double, tiny fast steps, eyes everywhere', pose: scuttle },
] };
// ---------- FRONT VIEW: sneaking toward the camera ----------
const pawsF = w => [{ lx: -70, ly: 450 + 20 * w, bow: .9 }, { lx: 70, ly: 450 - 20 * w, bow: .9 }];
function tiptoeF(t, ch) { const c = steps(t, { T: .7, duty: .55, lift: 150 }), w = sin(2 * PI * c.stride);
  const P = { view: 'front', dir: 1, x: 26 * w, rot: 7 * w, feet: c.feet.map((f, i) => ({ x: [-50, 48][i], lift: f.lift, kneeK: 1.2 })), hands: pawsF(w), head: -6 * w, face: 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 50); return { ...P, cam: 0, toward: t * 130 }; }
function freezeF(t0, ch) { const t = t0 % 6, tt = track([[0, 0], [1.6, 1.6], [3.6, 1.6], [6, 4.0]], t) + Math.floor(t0 / 6) * 4.0, fr = t > 1.6 && t < 3.6, sh = fr ? 1.5 * sin(t * 40) : 0;
  const c = steps(tt + .52, { T: .7, duty: .55, lift: 150 }), w = sin(2 * PI * c.stride);
  const P = { view: 'front', dir: 1, x: 26 * w + sh, rot: 7 * w, feet: c.feet.map((f, i) => ({ x: [-50, 48][i], lift: f.lift, kneeK: 1.2 })), hands: pawsF(w), head: fr ? 12 : -6 * w, face: fr ? 'terrified' : 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 50); return { ...P, cam: 0, toward: (tt + .52) * 130 }; }
function scuttleF(t, ch) { const c = steps(t, { T: .15, lift: 24 }), look = Math.floor(t * 1.5) % 2 ? 1 : -1;
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: c.feet.map((f, i) => ({ x: [-90, 88][i], lift: f.lift, kneeK: 1.2 })), hands: [{ lx: -80, ly: 590, bow: .3 }, { lx: 80, ly: 590, bow: .3 }], head: 12 * look, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 190); return { ...P, cam: 0, toward: t * 200 }; }
export const front = { title: 'SNEAK  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Tiptoe', blurb: 'huge slow steps on the toes, paws up', pose: tiptoeF },
  { key: 'B', name: 'Freeze', blurb: 'hears a noise, freezes with a foot in the air', pose: freezeF },
  { key: 'C', name: 'Low scuttle', blurb: 'squats low, tiny fast steps, eyes everywhere', pose: scuttleF },
] };
