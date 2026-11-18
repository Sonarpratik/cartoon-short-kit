// EAT from a bowl with a spoon (seen in Rick's clips). Bowl in one hand, spoon in the other, both drawn AT the hands.
import { track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, INK = '#2a1a1f', pos = v => Math.max(0, v);
const bowl = (x, y) => `<path d="M${x - 70},${y - 26} h140 q-6,66 -70,66 q-64,0 -70,-66 Z" fill="#f2c230" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y - 26}" rx="62" ry="12" fill="#c9773a" stroke="${INK}" stroke-width="8"/>`;
const spoon = a => (x, y) => `<g transform="rotate(${a.toFixed(1)} ${x} ${y})"><path d="M${x},${y + 24} L${x},${y - 78}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M${x},${y + 18} L${x},${y - 74}" stroke="#d9dde6" stroke-width="8" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - 92}" rx="20" ry="27" fill="#d9dde6" stroke="${INK}" stroke-width="9"/></g>`;
const F = v => v === 'front';
// hand positions: bowl held at the belly, spoon travels bowl <-> mouth (u = 0 bowl, 1 mouth)
const bowlH = f => f ? { lx: -70, ly: 520, bow: .8 } : { f: .62, d: .52, bow: .6 };
const spoonH = (f, u) => f ? { lx: 40 + 50 * u, ly: 455 - 95 * u, bow: .9, over: u > .5 } : { f: .7 - .08 * u, d: .28 - .55 * u, bow: .8, over: u > .5 };
const base = (v, o) => ({ view: v, dir: 1, x: 0, rot: 0, feet: F(v) ? [{ x: -40 }, { x: 38 }] : [{ x: -22 }, { x: 22 }], ...o });
// A DAINTY: tiny spoonfuls, dabs, eyes closed, mmm
const dainty = v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [.9, 1, 'io'], [1.7, 1], [2.2, 0, 'io'], [3, 0]], t), f = F(v);
  const P = base(v, { hands: [bowlH(f), spoonH(f, u)], held: [{ hand: 0, svg: bowl }, { hand: 1, svg: spoon(f ? -20 * u : -40 * u) }], head: f ? 4 * u : -6 * u, face: u > .8 ? 'k:happy' : 'k:smirk' });
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
// B SHOVEL: bowl right under the chin, spoon going like a machine, cheeks full
const shovel = v => (t, ch) => { const u = pos(sin(t * 16)), j = sin(t * 32), f = F(v);
  const P = base(v, { x: 2 * j, rot: f ? 0 : 12, hands: [f ? { lx: -40, ly: 420, bow: .9, over: true } : { f: .6, d: .1, bow: .8, over: true }, f ? { lx: 60 + 20 * u, ly: 400 - 50 * u, bow: .9, over: true } : { f: .7 - .05 * u, d: -.05 - .22 * u, bow: .8, over: true }], held: [{ hand: 0, svg: bowl }, { hand: 1, svg: spoon(f ? -30 : -50) }], head: 3 * j + (f ? 0 : 8), face: 'k:open' });
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
// C REGRET: one spoonful, freezes, the face says it all, bowl pushed far away
const regret = v => (t0, ch) => { const t = t0 % 6, u = track([[0, 0], [.9, 1, 'io'], [1.5, 1], [1.9, 0, 'out'], [6, 0]], t), bad = t > 1.6 && t < 5.4 ? 1 : 0, sh = bad * 2 * sin(t * 36), f = F(v);
  const P = base(v, { x: sh, rot: f ? 0 : -6 * bad, hands: [bad ? (f ? { f: .95, d: .2, bow: .2 } : { f: .97, d: .2, bow: .2 }) : bowlH(f), spoonH(f, u)], held: [{ hand: 0, svg: bowl }, { hand: 1, svg: spoon(f ? -20 * u : -40 * u) }], head: (f ? 8 : -8) * bad, face: bad ? 'terrified' : 'k:standard', blink: bad ? null : blinkAt(t) });
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
const mk = (v, label) => ({ title: `EAT  ·  ${label}`, dur: 6, styles: [
  { key: 'A', name: 'Dainty', blurb: 'tiny spoonfuls, eyes closed, mmm', pose: dainty(v) },
  { key: 'B', name: 'Shovel', blurb: 'bowl under the chin, spoon like a machine', pose: shovel(v) },
  { key: 'C', name: 'Regret', blurb: 'one spoonful, freezes, pushes the bowl away', pose: regret(v) },
] });
export default mk('side', 'side view');
export const front = mk('front', 'front view');
