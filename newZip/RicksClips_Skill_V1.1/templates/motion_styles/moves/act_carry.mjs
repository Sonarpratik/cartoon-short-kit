import { G, cycle, reachDrop } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f';
// the box is drawn AT the near hand (held prop), so it can never float
const box = (w, h, tilt = 0, col = '#b77a3f') => (x, y) => `<g transform="translate(${x},${y}) rotate(${tilt})"><rect x="${-w * .35}" y="${-h + 20}" width="${w}" height="${h}" rx="10" fill="${col}" stroke="${INK}" stroke-width="11"/><path d="M${-w * .35 + 12},${-h / 2 + 20} L${w * .65 - 12},${-h / 2 + 20}" stroke="#8a5a2c" stroke-width="10" stroke-linecap="round"/></g>`;
// A EASY + PROUD: chest out, bouncy walk, box held high like it weighs nothing
function easy(t, ch) {
  const c = cycle(t, { T: .42, S: 140, duty: .55, swing: u => ({ lift: 80 * sin(PI * u), toe: 25 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: -5, feet: c.feet, hands: [{ f: .55, d: .3 }, { f: .6, d: .32 }], held: [{ hand: 1, svg: box(170, 150) }], head: -6 + 4 * sin(2 * PI * c.p), face: 'k:happy' };
  P.y = Math.max(reachDrop(ch, P), 60 - 55 * sin(PI * c.p) ** 2); return { ...P, cam: c.bx + 80 };
}
// B FAR TOO HEAVY: knees buckling, staggers left and right, box hanging low, straining
function heavy(t, ch) {
  const tt = t + .5 * sin(t * 2.2) * .3, c = cycle(tt, { T: .62, S: 55, duty: .72, swing: u => ({ lift: 14 * sin(PI * u) }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: -12 + 5 * sin(t * 3.1), feet: c.feet, hands: [{ f: .35, d: .95 }, { f: .4, d: .98, bow: .15 }], held: [{ hand: 1, svg: box(260, 230, 4 * sin(t * 3.1)) }], head: -8 + 3 * sin(t * 20), face: 'strain' };
  P.y = Math.max(reachDrop(ch, P), 75 + 12 * sin(t * 6)); return { ...P, cam: c.bx + 80 };
}
// C FRAGILE!: tiptoes with tiny steps, box held far out in front, staring at it, terrified to drop it
function fragile(t, ch) {
  const c = cycle(t, { T: .2, S: 26, duty: .5, swing: u => ({ lift: 22 * sin(PI * u), toe: -30 }) });
  const P = { view: 'side', dir: 1, x: c.bx, rot: -3, feet: c.feet.map(f => ({ ...f, lift: f.lift + 10, toe: -25 })), hands: [{ f: .9, d: .1 }, { f: .95, d: .12 + .02 * sin(t * 40), bow: .2 }], held: [{ hand: 1, svg: box(120, 110, 2 * sin(t * 40), '#7fc8e8') }], head: 10, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 0); return { ...P, cam: c.bx + 80 };
}
export default { title: 'CARRY  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Easy and proud', blurb: 'bouncy walk, box held high', pose: easy },
  { key: 'B', name: 'Far too heavy', blurb: 'knees buckle, staggers, strains', pose: heavy },
  { key: 'C', name: 'Fragile!', blurb: 'tiptoes, tiny steps, terrified to drop it', pose: fragile },
] };
// ---------- FRONT VIEW: walks toward the camera with the box held in both hands in front of the body ----------
import { steps } from './front_helpers.mjs';
// the box is drawn AT the right hand and spans to the left hand, so both hands grip its sides
const boxF = (w, h, col = '#b77a3f') => (x, y) => `<g transform="translate(${x},${y})"><rect x="${-w + 6}" y="${-h / 2}" width="${w - 12}" height="${h}" rx="10" fill="${col}" stroke="${INK}" stroke-width="11"/><path d="M${-w + 20},0 L${-20},0" stroke="#8a5a2c" stroke-opacity=".8" stroke-width="10" stroke-linecap="round"/></g>`;
const both = (ch, w, ly) => [{ lx: -w / 2, ly }, { lx: w / 2, ly }];
function easyF(t, ch) { const c = steps(t, { T: .42, lift: 80 }), b = sin(PI * c.p) ** 2, w = 190;
  const P = { view: 'front', dir: 1, x: 0, rot: 3 * sin(2 * PI * c.stride), feet: c.feet.map((f, i) => ({ x: [-36, 34][i], lift: f.lift, kneeK: .35 })), hands: both(ch, w, 470), held: [{ hand: 1, svg: boxF(w, 150) }], head: 4 * sin(2 * PI * c.p), face: 'k:happy' };
  P.y = Math.max(reachDrop(ch, P), 60 - 55 * b); return { ...P, cam: 0, toward: t * 330 }; }
function heavyF(t, ch) { const c = steps(t, { T: .62, duty: .7, lift: 16 }), rs = c.side ? 1 : -1, rock = 7 * rs * sin(PI * c.p), w = 290;
  const P = { view: 'front', dir: 1, x: 14 * sin(t * 2.2), rot: rock, pivot: [rs * 60, 1003], feet: c.feet.map((f, i) => ({ x: 14 * sin(t * 2.2) + [-80, 78][i], lift: f.lift, kneeK: .9 })), hands: both(ch, w, 560), held: [{ hand: 1, svg: boxF(w, 230) }], head: -rock * .5 + 3 * sin(t * 20), face: 'strain' };
  P.y = Math.max(reachDrop(ch, P), 80 + 12 * sin(t * 6)); return { ...P, cam: 0, toward: t * 90 }; }
function fragileF(t, ch) { const c = steps(t, { T: .2, duty: .5, lift: 22 }), w = 140, sh = 2 * sin(t * 40);
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: c.feet.map((f, i) => ({ x: [-30, 28][i], lift: f.lift + 10, toe: -25, kneeK: .2 })), hands: both(ch, w, 455 + sh), held: [{ hand: 1, svg: boxF(w, 110, '#7fc8e8') }], head: 6, face: 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 0); return { ...P, cam: 0, toward: t * 70 }; }
export const front = { title: 'CARRY  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Easy and proud', blurb: 'bouncy walk, box held high', pose: easyF },
  { key: 'B', name: 'Far too heavy', blurb: 'wide knees, rocks side to side, strains', pose: heavyF },
  { key: 'C', name: 'Fragile!', blurb: 'tiptoes, tiny steps, terrified to drop it', pose: fragileF },
] };
