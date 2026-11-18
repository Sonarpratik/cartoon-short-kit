import { track, blinkAt, G } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
// one wooden crate behind the character (a solid thing: the body sits ON it, never in it)
const CR = { x0: -185, x1: 70, top: 822 };
const crate = () => { const { x0, x1, top } = CR, h = G - top;
  return `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${h}" rx="10" fill="#b77a3f" stroke="#2a1a1f" stroke-width="12"/>` +
    `<path d="M${x0 + 10},${top + h / 2} L${x1 - 10},${top + h / 2} M${x0 + 20},${top + 14} L${x1 - 20},${G - 14}" stroke="#8a5a2c" stroke-width="12" stroke-linecap="round"/>` +
    `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="16" rx="8" fill="#d9a066"/>`; };
const SEAT_Y = CR.top - 640 + 8, SEAT_X = -50;   // body drop and x when the bottom rests on the crate top
const SX = 135, F0 = 112, F1 = 152;              // standing in front of the crate; feet stay planted on these marks
const loop = 5;
// seated legs blend in as the bottom reaches the seat (m 0 -> 1), thighs forward, shins down to the planted feet
const legs = (m, th0 = 6, th1 = 2, extra = {}) => [{ x: F0, thigh: th0, mix: m, ...extra[0] }, { x: F1, thigh: th1, mix: m, ...extra[1] }];

// A PLOP: tiny hop up, then drops hard onto the seat, bounces once, the feet kick up and the arms fly up on the impact.
function plop(t0) {
  const t = t0 % loop;
  const x = track([[0, SX], [.7, SX], [.95, SEAT_X, 'in']], t);
  const y = track([[0, 0], [.55, 0], [.7, -18, 'out'], [.95, SEAT_Y, 'in'], [1.08, SEAT_Y - 34, 'out'], [1.22, SEAT_Y, 'in'], [1.3, SEAT_Y - 8, 'out'], [1.38, SEAT_Y, 'in']], t);
  const kick = track([[0, 0], [.95, 0], [1.08, 1, 'out'], [1.45, 0, 'in']], t);
  const m = track([[0, 0], [.72, 0], [.95, 1, 'in']], t);
  const arms = track([[0, 0], [.6, 0], [.7, .4], [.95, .2], [1.08, 1, 'out'], [1.5, 0, 'io']], t);
  const sat = t > .95;
  const hand = (k) => sat ? { f: .55 + .3 * arms - k * .08, d: .62 - 1.3 * arms } : { f: .1 + .2 * arms, d: .92 - .9 * arms };
  return { view: 'side', dir: 1, x, y, rot: track([[0, 0], [.7, -3], [.95, 4], [1.1, -6], [1.4, 0]], t), back: crate(),
    feet: legs(m, 6 - 30 * kick, 2 - 40 * kick, [{ lift: 60 * kick, toe: 30 * kick }, { lift: 90 * kick, toe: 40 * kick }]),
    hands: [hand(0), hand(1)], head: track([[0, 0], [.95, 0], [1.05, 10], [1.3, -4], [1.5, 0]], t),
    face: t < .7 ? 'k:standard' : t < 1.4 ? 'k:open' : t < 2.4 ? 'k:happy' : 'k:standard', blink: blinkAt(t, 2.4, .3), cam: 0, camY: -200 };
}
// B CAREFUL: looks back at the seat, one hand feels for it, lowers very slowly with shaky knees, hovers... then the last bit and a big relief.
function careful(t0) {
  const t = t0 % loop;
  const x = track([[0, SX], [1.0, SX], [2.6, SEAT_X + 20, 'io'], [3.25, SEAT_X, 'in']], t);
  const shake = t > 1.0 && t < 3.2 ? 3 * sin(t * 70) : 0;
  const y = track([[0, 0], [1.0, 12], [2.6, SEAT_Y - 24, 'io'], [3.1, SEAT_Y - 20], [3.25, SEAT_Y, 'in'], [3.4, SEAT_Y - 5, 'out'], [3.5, SEAT_Y, 'in']], t) + shake;
  const m = track([[0, 0], [1.0, 0], [2.6, .85, 'io'], [3.25, 1]], t);
  const reach = track([[0, 0], [.5, 0], [1.0, 1], [3.2, 1], [3.6, 0]], t);
  return { view: 'side', dir: 1, x, y, rot: track([[0, 0], [1.0, 6], [2.6, 16], [3.25, 6], [3.8, 0]], t), back: crate(),
    feet: legs(m),
    hands: [{ f: .45 + .2 * (1 - reach), d: .75 - .1 * (1 - reach) }, { f: .2 - .85 * reach, d: .95 - .2 * reach }],
    head: track([[0, 0], [.5, 0], [1.0, -16], [2.0, -12], [2.6, 4], [3.25, 6], [3.7, 10], [4.4, 0]], t),
    face: t < .5 ? 'k:standard' : t < 1.1 ? 'k:open' : t < 3.25 ? 'strain' : t < 4.2 ? 'k:happy' : 'k:standard', blink: blinkAt(t, 2.2, .2), cam: 0, camY: -200 };
}
// C COOL SPRAWL: drops back onto the seat, leans way back on one hand, swings one leg over the other knee, hand behind the head.
function sprawl(t0) {
  const t = t0 % loop;
  const x = track([[0, SX], [.6, SX], [1.0, SEAT_X, 'io'], [1.3, SEAT_X - 10]], t);
  const y = track([[0, 0], [.6, 0], [1.0, SEAT_Y, 'in'], [1.12, SEAT_Y - 10, 'out'], [1.25, SEAT_Y]], t);
  const m = track([[0, 0], [.62, 0], [1.0, 1, 'in']], t);
  const lean = track([[0, 0], [.6, 0], [1.0, -6], [1.4, -16, 'back']], t);
  const cross = track([[0, 0], [1.4, 0], [1.85, 1, 'back']], t);
  const cool = track([[0, 0], [1.9, 0], [2.3, 1, 'back']], t);
  return { view: 'side', dir: 1, x, y, rot: lean, back: crate(),
    feet: legs(m, 10, 2 - 14 * cross, [{}, { x: F1 + 40 * cross, lift: 75 * cross, toe: -25 * cross }]),
    hands: [{ f: -.75 * Math.min(1, cross * 2 + (t > 1 ? .5 : 0)), d: .85 }, cool > 0 ? { f: -.1 - .35 * cool, d: .9 - 1.7 * cool, over: cool > .5, bow: .6 } : { f: .1, d: .92 }],
    head: track([[0, 0], [1.4, 0], [1.9, -8], [2.4, -14, 'back']], t),
    face: t < 1.0 ? 'k:standard' : 'k:smirk', blink: blinkAt(t), cam: 0, camY: -200 };
}
export default { title: 'SIT  ·  pick A, B or C', dur: 5, reps: 2, styles: [
  { key: 'A', name: 'Plop', blurb: 'drops hard, bounces, feet kick up', pose: plop },
  { key: 'B', name: 'Careful old back', blurb: 'feels for the seat, shaky, hovers, relief', pose: careful },
  { key: 'C', name: 'Cool sprawl', blurb: 'leans back, leg over knee, hand behind head', pose: sprawl },
] };
