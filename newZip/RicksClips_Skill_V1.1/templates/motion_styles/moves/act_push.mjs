import { G, cycle, reachDrop } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f';
// HANDS ON THE BOX, NO GAP (CB 2026-11-10): the arm is a fixed length, so work out where the hands really end
// (shoulder in the world + reach) and put the face of the box exactly there. Returns the box x and sets P.hands.
function grip(ch, P, x, { reach = .97, ys = [25, 50], only = null } = {}) {
  const r = (P.rot || 0) * PI / 180, lx = 8, ly = ch.sh[1] - ch.hipY, sx = x + lx * cos(r) - ly * sin(r), sy = ch.hipY + (P.y || 0) + lx * sin(r) + ly * cos(r);
  const hx = sx + ch.armL * reach, mk = dy => ({ wx: hx, wy: Math.max(sy + dy, G - BH + 45), bow: P.bow ?? .5 });
  P.hands = only != null ? P.hands.map((h, i) => i === only ? { ...mk(ys[0]), bow: .15 } : h) : ys.map(mk);
  return hx + 15 + 2;                       // hand radius, then the box outline starts
}
const BH = 560;   // a BIG crate: its face has to be at shoulder height, because the arms cannot reach down to a low box
const box = (x, w = 320, h = BH, jolt = 0) => `<g transform="translate(${jolt},0)"><rect x="${x}" y="${G - h}" width="${w}" height="${h}" rx="12" fill="#b77a3f" stroke="${INK}" stroke-width="12"/><path d="M${x + 12},${G - h / 2} L${x + w - 12},${G - h / 2} M${x + 24},${G - h + 16} L${x + w - 24},${G - 16}" stroke="#8a5a2c" stroke-width="12" stroke-linecap="round"/></g>`;
// A DETERMINED HEAVE: leaning right in, pushes in surges, the crate moves a bit with every shove
function heave(t, ch) {
  const tt = t + .28 * sin(2 * PI * t / .9) * .9 / (2 * PI) * 3, c = cycle(tt, { T: .45, S: 70, duty: .65, swing: u => ({ lift: 22 * sin(PI * u), toe: -20 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: 19, feet: c.feet, hands: [null, null], head: -14, face: 'strain' };
  P.y = Math.max(reachDrop(ch, P), 40); const b = grip(ch, { ...P, y: 40 }, c.bx); grip(ch, P, c.bx); P.hands.forEach(h => h.wx = b - 17); return { ...P, front: box(b), cam: c.bx + 200 };
}
// B ONE FINGER: strolls upright, pushes the huge crate with one hand, smug, not even looking
function finger(t, ch) {
  const c = cycle(t, { T: .5, S: 120, duty: .6, swing: u => ({ lift: 45 * sin(PI * u), toe: 20 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: -5, feet: c.feet, hands: [{ f: -.2, d: .9 }, null], head: -8, face: 'k:smirk' };
  P.y = Math.max(reachDrop(ch, P), 20); const b = grip(ch, P, c.bx, { only: 1, ys: [110], reach: .8 }); return { ...P, front: box(b), cam: c.bx + 200 };
}
// C WILL NOT BUDGE: runs on the spot against it, feet slipping back, the crate does not move at all
function stuck(t, ch) {
  const ph = (t / .14) % 2, feet = [0, 1].map(i => { const u = ((ph + i) % 2) / 2; return u < .5 ? { x: 20 - 150 * (u / .5), lift: 0, toe: -25 } : { x: -130 + 150 * ((u - .5) / .5), lift: 80 * sin(PI * (u - .5) / .5), toe: -30 }; });
  const P = { view: 'side', dir: 1, x: 2 * sin(t * 50), rot: 21, feet, hands: [null, null], head: -10, face: 'strain' };
  P.y = Math.max(reachDrop(ch, P), 60); const b = grip(ch, { ...P, y: 60 }, 0, {}); grip(ch, P, 0, {}); P.hands.forEach(h => h.wx = b - 17); return { ...P, front: box(b), cam: 200 };
}
export default { title: 'PUSH  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Determined heave', blurb: 'leans in, shoves in surges', pose: heave },
  { key: 'B', name: 'One hand, smug', blurb: 'strolls, pushes it like nothing', pose: finger },
  { key: 'C', name: 'Will not budge', blurb: 'feet slip on the spot, nothing moves', pose: stuck },
] };
// ---------- FRONT VIEW: the crate comes straight at the camera; we see the pusher over its top edge, hands ON the edge ----------
import { track } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const CT = 505, crateF = (w = 430, jx = 0) => `<g transform="translate(${jx},0)"><rect x="${-w / 2}" y="${CT}" width="${w}" height="${G - CT + 6}" rx="14" fill="#b77a3f" stroke="${INK}" stroke-width="12"/><rect x="${-w / 2}" y="${CT}" width="${w}" height="26" rx="12" fill="#d9a066" stroke="${INK}" stroke-width="10"/><path d="M${-w / 2 + 16},${CT + 250} L${w / 2 - 16},${CT + 250} M${-w / 2 + 30},${CT + 44} L${w / 2 - 30},${G - 16}" stroke="#8a5a2c" stroke-width="12" stroke-linecap="round"/></g>`;
const onEdge = (x, dy = 0) => ({ wx: x, wy: CT - 17 + dy, bow: .5 });          // the hand sits on the top edge, half over it
function heaveF(t, ch) { const s = Math.max(0, sin(2 * PI * t / .9)), c = steps(t, { T: .45, lift: 20 });
  return { view: 'front', dir: 1, x: 0, y: 105 + 34 * s, rot: 0, feet: c.feet.map((f, i) => ({ x: [-70, 68][i], lift: f.lift, kneeK: .6 })), hands: [onEdge(-120), onEdge(120)], head: 3 * sin(t * 7), face: 'strain', front: crateF(), cam: 0, camY: -260, toward: t * 90 + 22 * sin(2 * PI * t / .9) }; }
function smugF(t, ch) { const c = steps(t, { T: .5, lift: 45 }), b = sin(2 * PI * c.p);
  return { view: 'front', dir: 1, x: 70, y: 96 + 8 * b, rot: 4, feet: c.feet.map((f, i) => ({ x: 70 + [-36, 34][i], lift: f.lift, kneeK: .3 })), hands: [onEdge(-40), { f: .5, d: .85, bow: .8 }], head: 8, face: 'k:smirk', front: crateF(), cam: 0, camY: -260, toward: t * 260 }; }
function stuckF(t, ch) { const k = t % 3, give = track([[0, 0], [2.0, 0], [2.2, 1, 'in'], [2.8, 1], [3, 0]], k), sh = (1 - give) * 3 * sin(t * 50);
  return { view: 'front', dir: 1, x: sh, y: 105 + 12 * sin(t * 9) * (1 - give) + 110 * give, rot: 0, feet: [{ x: -80, kneeK: .7 }, { x: 78, kneeK: .7 }], hands: [onEdge(-130 + sh), onEdge(130 + sh)], head: 0, face: give > .5 ? 'tired' : 'strain', front: crateF(), cam: 0, camY: -260 }; }
export const front = { title: 'PUSH  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Determined heave', blurb: 'shoves in surges, the crate comes at us', pose: heaveF },
  { key: 'B', name: 'One hand, smug', blurb: 'strolls beside it, one hand on top', pose: smugF },
  { key: 'C', name: 'Will not budge', blurb: 'shakes with effort, then sags behind it', pose: stuckF },
] };
