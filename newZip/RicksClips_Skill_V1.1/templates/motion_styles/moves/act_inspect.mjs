// INSPECT WITH A MAGNIFIER (seen in Rick's clips: horse race, burglar, random numbers). The lens is drawn AT the hand.
import { G, cycle, track, reachDrop, blinkAt } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const sin = Math.sin, PI = Math.PI, INK = '#2a1a1f';
// ring centre is offset from the hand by (ox, oy); the handle runs from the hand to the ring
const lens = (ox, oy, r = 58) => (x, y) => { const d = Math.hypot(ox, oy) || 1, hx = x + ox * (1 - r / d), hy = y + oy * (1 - r / d);
  return `<path d="M${x},${y} L${hx.toFixed(1)},${hy.toFixed(1)}" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M${x},${y} L${hx.toFixed(1)},${hy.toFixed(1)}" stroke="#8a5a2c" stroke-width="11" stroke-linecap="round"/><circle cx="${x + ox}" cy="${y + oy}" r="${r}" fill="#bfe6ff" fill-opacity=".32" stroke="${INK}" stroke-width="20"/><circle cx="${x + ox}" cy="${y + oy}" r="${r}" fill="none" stroke="#e2b13c" stroke-width="9"/><path d="M${x + ox - r * .5},${y + oy - r * .3} q${r * .25},${-r * .35} ${r * .6},${-r * .3}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="7" stroke-linecap="round"/>`; };
// clues on the floor (world-locked, so they show that nothing glides)
const prints = cx => { const o = []; for (let k = Math.floor((cx - 700) / 170); k <= Math.ceil((cx + 700) / 170); k++) o.push(`<ellipse cx="${k * 170 + (k % 2 ? 0 : 18)}" cy="${G + 34 + (k % 2 ? 0 : 26)}" rx="30" ry="11" fill="#1b0f2a" opacity=".35"/>`); return o.join(''); };
// A DETECTIVE CREEP: tiptoes forward, leaning in, lens held out, other hand behind the back, smug
function creep(t, ch) { const c = cycle(t, { T: .55, S: 46, duty: .6, swing: u => ({ lift: 46 * sin(PI * u), toe: -30 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: 20 + 3 * sin(t * 2), feet: c.feet.map(f => ({ ...f, toe: f.toe ?? -20 })), hands: [{ f: -.35, d: .55, bow: .9 }, { f: .8, d: .25 + .08 * sin(t * 2.4), bow: .3 }], held: [{ hand: 1, svg: lens(70, 30) }], head: -6 + 4 * sin(t * 2.4), face: 'k:smirk', blink: null };
  P.y = Math.max(reachDrop(ch, P), 60); return { ...P, back: prints(c.bx), cam: c.bx + 120 }; }
// B NOSE TO THE FLOOR: bent right over, bum in the air, shuffles along with the lens almost on the ground
function nose(t, ch) { const c = cycle(t, { T: .3, S: 30, duty: .6, swing: u => ({ lift: 16 * sin(PI * u) }) }), w = sin(t * 5);
  const P = { view: 'side', dir: 1, x: c.bx, rot: 50, feet: c.feet, hands: [{ f: .2, d: .95 }, { f: .25 + .12 * w, d: .98, bow: .25 }], held: [{ hand: 1, svg: lens(40 + 14 * w, 78) }], head: 14 + 3 * w, face: 'k:open' };
  P.y = Math.max(reachDrop(ch, P), 120); return { ...P, back: prints(c.bx), cam: c.bx + 160 }; }
// C PARANOID: stands stiff, lens up at the eye, snaps round to look the other way, sweating
function paranoid(t0, ch) { const t = t0 % 6, dir = (t % 1.6) < .8 ? 1 : -1, k = (t % .8) / .8, snap = k < .12 ? 1 - k / .12 : 0;
  const P = { view: 'side', dir, x: 0, rot: dir * (4 + 10 * snap), feet: [{ x: -22 }, { x: 22 }], hands: [{ f: .2, d: .8 }, { f: .5, d: -.5 + .03 * sin(t * 40), bow: .8, over: true }], held: [{ hand: 1, svg: lens(dir * 66, -52) }], head: dir * -4, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 10 + 30 * snap); return { ...P, back: prints(0), cam: 0 }; }
export default { title: 'INSPECT WITH A MAGNIFIER  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Detective creep', blurb: 'tiptoes, leans in, lens out, smug', pose: creep },
  { key: 'B', name: 'Nose to the floor', blurb: 'bent right over, shuffles, bum up', pose: nose },
  { key: 'C', name: 'Paranoid', blurb: 'lens at the eye, snaps round, sweats', pose: paranoid },
] };
// ---------- FRONT VIEW: the lens comes up in front of the face ----------
function eyeF(t, ch) { const sw = sin(t * 1.6);
  const P = { view: 'front', dir: 1, x: 60 * sw, rot: 5 * sw, feet: [{ x: -40 }, { x: 38 }], hands: [{ f: .2, d: .75, bow: 1 }, { lx: 150, ly: 300, bow: .9, over: true }], held: [{ hand: 1, svg: lens(-92, -92, 64) }], head: 6 * sw, face: 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 30 + 20 * Math.abs(sw)); return { ...P, cam: 0 }; }
function floorF(t, ch) { const c = steps(t, { T: .3, lift: 18 }), sw = sin(t * 1.3), w = sin(t * 5);
  const P = { view: 'front', dir: 1, x: 90 * sw, rot: 0, feet: c.feet.map((f, i) => ({ x: 90 * sw + [-80, 78][i], lift: f.lift, kneeK: 1.1 })), hands: [{ lx: -70, ly: 560, bow: .3 }, { lx: 40 + 30 * w, ly: 585, bow: .3 }], held: [{ hand: 1, svg: lens(10, 96, 60) }], head: 10 * sw, face: 'k:open' };
  P.y = Math.max(reachDrop(ch, P), 150); return { ...P, cam: 0 }; }
function paranoidF(t0, ch) { const t = t0 % 6, s = (t % 1.6) < .8 ? 1 : -1, k = (t % .8) / .8, snap = k < .12 ? 1 - k / .12 : 0, sh = 2 * sin(t * 45);
  const P = { view: 'front', dir: 1, x: sh, rot: 0, feet: [{ x: -30 }, { x: 28 }], hands: s > 0 ? [{ f: .2, d: .8 }, { lx: 150, ly: 300, bow: .9, over: true }] : [{ lx: -150, ly: 300, bow: .9, over: true }, { f: .2, d: .8 }], held: [{ hand: s > 0 ? 1 : 0, svg: lens(-s * 92, -92, 64) }], head: s * 10, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 12 * snap); return { ...P, cam: 0 }; }
export const front = { title: 'INSPECT WITH A MAGNIFIER  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Lens to the eye', blurb: 'sways in close, one eye behind the glass', pose: eyeF },
  { key: 'B', name: 'Searching the floor', blurb: 'squats low, waddles, sweeps the lens', pose: floorF },
  { key: 'C', name: 'Paranoid', blurb: 'lens jumps from eye to eye, shaking', pose: paranoidF },
] };
