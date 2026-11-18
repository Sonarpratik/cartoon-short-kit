// CHEER (seen in Rick's clips: crowd with both arms up, laughing, thumbs up).
import { track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, pos = v => Math.max(0, v), F = v => v === 'front';
const feet = (f, l0 = 0, l1 = 0) => f ? [{ x: -40, lift: l0, kneeK: .4 }, { x: 38, lift: l1, kneeK: .4 }] : [{ x: -22, lift: l0 }, { x: 22, lift: l1 }];
// A STADIUM: both arms up in a V, bouncing on the spot, shaking the fists
const stadium = v => (t, ch) => { const b = pos(sin(t * 10)), w = sin(t * 20), f = F(v);
  const P = { view: v, dir: 1, x: 0, rot: f ? 3 * sin(t * 5) : -6, feet: feet(f, 30 * b, 30 * b), hands: f ? [{ f: .78, d: -.58 + .05 * w, bow: .3 }, { f: .78, d: -.58 - .05 * w, bow: .3 }] : [{ f: -.82, d: -.5 + .05 * w, bow: .3 }, { f: .9, d: -.42 - .05 * w, bow: .3 }], head: f ? 4 * sin(t * 5) : -8, face: 'k:happy' };
  P.y = reachDrop(ch, P) - 40 * b; return { ...P, cam: 0 }; };
// B FIST PUMP: winds down, one sharp "yes!", knee up, holds it, smug
const pump = v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [.5, -1, 'io'], [.68, 1, 'out'], [1.9, 1], [2.4, 0, 'io']], t), up = pos(u), f = F(v);
  const P = { view: v, dir: 1, x: 0, rot: f ? -5 * up : -10 * up + 8 * pos(-u), feet: feet(f, 0, 150 * up), hands: f ? [{ f: .3, d: .7, bow: 1 }, { f: .55, d: .5 - 1.0 * up + .2 * pos(-u), bow: .9 }] : [{ f: -.4, d: .6, bow: .9 }, { f: .5, d: .5 - 1.0 * up + .2 * pos(-u), bow: .9, over: up > .5 }], head: -8 * up, face: up > .5 ? 'k:smirk' : 'k:standard', blink: up > .5 ? null : blinkAt(t) };
  P.y = reachDrop(ch, P) + 40 * pos(-u); return { ...P, cam: 0 }; };
// C POLITE CLAP: tiny claps at the chest, face of stone
const clap = v => (t, ch) => { const c = pos(sin(t * 11)), f = F(v);
  const P = { view: v, dir: 1, x: 0, rot: 0, feet: feet(f), hands: f ? [{ lx: -14 - 34 * c, ly: 470, bow: .9 }, { lx: 14 + 34 * c, ly: 470, bow: .9 }] : [{ f: .5 + .08 * c, d: .34, bow: .9 }, { f: .5 - .08 * c, d: .4, bow: .9 }], head: 0, face: 'k:standard', blink: blinkAt(t) };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
const mk = (v, label) => ({ title: `CHEER  ·  ${label}`, dur: 6, styles: [
  { key: 'A', name: 'Stadium', blurb: 'both arms up, bouncing, shaking the fists', pose: stadium(v) },
  { key: 'B', name: 'Fist pump', blurb: 'winds down, one sharp yes, knee up, smug', pose: pump(v) },
  { key: 'C', name: 'Polite clap', blurb: 'tiny claps, face of stone', pose: clap(v) },
] });
export default mk('side', 'side view');
export const front = mk('front', 'front view');
