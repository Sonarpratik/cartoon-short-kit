import { track, blinkAt, G } from '../rig.mjs';
const sin = Math.sin;
const CR = { x0: -150, x1: 150, top: 822 };
const crate = () => { const { x0, x1, top } = CR, h = G - top;
  return `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${h}" rx="10" fill="#b77a3f" stroke="#2a1a1f" stroke-width="12"/>` +
    `<path d="M${x0 + 10},${top + h / 2} L${x1 - 10},${top + h / 2} M${x0 + 20},${top + 14} L${x1 - 20},${G - 14}" stroke="#8a5a2c" stroke-width="12" stroke-linecap="round"/>` +
    `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="16" rx="8" fill="#d9a066"/>`; };
// seen from the front the crate is behind the body; the bottom lands on its top (front edge) and the thighs point at the lens
const SEAT = CR.top - 640 + 10, loop = 5, FX = [-60, 58];
const seated = (k = 0) => FX.map(x => ({ x, kneeK: k }));
function plop(t0) {
  const t = t0 % loop;
  const y = track([[0, 0], [.55, 0], [.7, -18, 'out'], [.95, SEAT, 'in'], [1.08, SEAT - 34, 'out'], [1.22, SEAT, 'in'], [1.3, SEAT - 8, 'out'], [1.38, SEAT, 'in']], t);
  const kick = track([[0, 0], [.95, 0], [1.08, 1, 'out'], [1.45, 0, 'in']], t), arms = track([[0, 0], [.6, 0], [.7, .4], [.95, .2], [1.08, 1, 'out'], [1.5, 0, 'io']], t);
  return { view: 'front', dir: 1, x: 0, y, rot: 0, back: crate(),
    feet: FX.map((x, i) => ({ x: x * (1 + .9 * kick), lift: 90 * kick, kneeK: .2 })),
    hands: [{ f: .3 + .3 * arms, d: .85 - 1.3 * arms }, { f: .3 + .3 * arms, d: .85 - 1.3 * arms }], head: track([[0, 0], [.95, 0], [1.05, 6], [1.3, -4], [1.5, 0]], t),
    face: t < .7 ? 'k:standard' : t < 1.4 ? 'k:open' : t < 2.4 ? 'k:happy' : 'k:standard', blink: blinkAt(t, 2.4, .3), cam: 0, camY: -200 };
}
function careful(t0) {
  const t = t0 % loop, shake = t > 1.0 && t < 3.2 ? 3 * sin(t * 70) : 0;
  const y = track([[0, 0], [1.0, 20], [2.6, SEAT - 24, 'io'], [3.1, SEAT - 20], [3.25, SEAT, 'in'], [3.4, SEAT - 5, 'out'], [3.5, SEAT, 'in']], t) + shake;
  const knees = track([[0, 0], [1.0, .6], [2.6, 1], [3.25, .3], [3.8, 0]], t);
  return { view: 'front', dir: 1, x: shake * .5, y, rot: 0, back: crate(),
    feet: FX.map(x => ({ x: x * 1.25, kneeK: .2 + .9 * knees })),
    hands: [{ f: .55, d: .75 }, { f: .55, d: .75 }], head: track([[0, 0], [.5, 0], [1.0, -6], [2.6, 4], [3.25, 6], [3.7, 8], [4.4, 0]], t),
    face: t < .5 ? 'k:standard' : t < 1.1 ? 'k:open' : t < 3.25 ? 'strain' : t < 4.2 ? 'k:happy' : 'k:standard', blink: blinkAt(t, 2.2, .2), cam: 0, camY: -200 };
}
function sprawl(t0) {
  const t = t0 % loop;
  const y = track([[0, 0], [.6, 0], [1.0, SEAT, 'in'], [1.12, SEAT - 10, 'out'], [1.25, SEAT]], t);
  const lean = track([[0, 0], [1.0, 0], [1.4, -9, 'back']], t), cross = track([[0, 0], [1.4, 0], [1.85, 1, 'back']], t), cool = track([[0, 0], [1.9, 0], [2.3, 1, 'back']], t);
  return { view: 'front', dir: 1, x: 0, y, rot: lean, back: crate(),
    feet: [{ x: FX[0] - 10 }, { x: FX[1] - 150 * cross, lift: 120 * cross, kneeK: .2, toe: 20 * cross }],
    hands: [{ f: .7, d: .7 }, cool > 0 ? { f: .2 + .2 * cool, d: .9 - 1.7 * cool, over: cool > .5, bow: .6 } : { f: .3, d: .9 }],
    head: track([[0, 0], [1.4, 0], [2.4, 10, 'back']], t), face: t < 1.0 ? 'k:standard' : 'k:smirk', blink: blinkAt(t), cam: 0, camY: -200 };
}
export default { title: 'SIT, FRONT VIEW  ·  pick A, B or C', dur: 5, reps: 2, styles: [
  { key: 'A', name: 'Plop', blurb: 'drops hard, bounces, feet fly out', pose: plop },
  { key: 'B', name: 'Careful old back', blurb: 'shaky knees, hovers, relief', pose: careful },
  { key: 'C', name: 'Cool sprawl', blurb: 'leans over, leg crossed, hand behind head', pose: sprawl },
] };
