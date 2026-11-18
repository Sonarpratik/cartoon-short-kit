// WRITE / SIGN at a standing desk (seen in Rick's clips: sign, stamp, chalk). The pen tip ENDS ON the paper.
import { G, track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, INK = '#2a1a1f';
const pen = a => (x, y) => `<g transform="rotate(${a.toFixed(1)} ${x} ${y})"><path d="M${x},${y + 26} L${x},${y - 96}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M${x},${y + 14} L${x},${y - 92}" stroke="#f6f1e4" stroke-width="9" stroke-linecap="round"/><path d="M${x},${y - 30} q26,-34 4,-74 q-30,30 -4,74" fill="#e8503a" stroke="${INK}" stroke-width="8"/></g>`;
// side: a lectern to the right; DT = desk top y, paper lies on it
const DX = 150, DT = 545;
const desk = () => `<rect x="${DX + 60}" y="${DT + 40}" width="44" height="${G - DT - 40}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><path d="M${DX - 30},${DT + 6} L${DX + 210},${DT - 22} L${DX + 210},${DT + 24} L${DX - 30},${DT + 52} Z" fill="#a8683a" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><path d="M${DX},${DT - 6} L${DX + 150},${DT - 24} L${DX + 150},${DT - 12} L${DX},${DT + 6} Z" fill="#fffdf2" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
const py = x => DT - 30 - (x - DX) * .12;           // hand height just above the paper at world x
function fancy(t0, ch) { const t = t0 % 6, w = t < 3.6 ? 1 : 0, a = t * 5, hx = DX + 60 + 45 * sin(a) * w + 12 * t * w, done = track([[0, 0], [3.6, 0], [3.9, 1, 'out'], [5.4, 1], [5.8, 0]], t);
  const P = { view: 'side', dir: 1, x: -60, rot: 10 - 8 * done, feet: [{ x: -80 }, { x: -34 }], hands: [{ f: -.3, d: .6, bow: .9 }, { wx: hx - 40 * done, wy: py(hx) + 14 * cos(a * 2) * w - 120 * done, bow: .5 }], held: [{ hand: 1, svg: pen(18 + 10 * sin(a) * w - 40 * done) }], head: 8 - 14 * done, face: done > .5 ? 'k:happy' : 'k:smirk' };
  P.y = reachDrop(ch, P); return { ...P, back: desk(), cam: 60 }; }
function scribble(t, ch) { const a = t * 34, hx = DX + 70 + 50 * sin(a * .37) + 20 * sin(a), j = sin(t * 40);
  const P = { view: 'side', dir: 1, x: -40 + 2 * j, rot: 20, feet: [{ x: -80 }, { x: -10 }], hands: [{ wx: DX + 10, wy: py(DX + 10) + 6, bow: .5 }, { wx: hx, wy: py(hx) + 5 * cos(a), bow: .5 }], held: [{ hand: 1, svg: pen(20 + 14 * sin(a)) }], head: 12 + 2 * j, face: 'k:angry' };
  P.y = reachDrop(ch, P); return { ...P, back: desk(), cam: 60 }; }
function stuck(t0, ch) { const t = t0 % 6, th = track([[0, 1], [3.6, 1], [4.0, 0, 'io'], [4.5, 0], [4.9, 1, 'io'], [6, 1]], t), tap = th * Math.max(0, sin(t * 9));
  const P = { view: 'side', dir: 1, x: -60, rot: 6 - 6 * th, feet: [{ x: -80 }, { x: -34 }], hands: [{ f: -.3, d: .6, bow: .9 }, th > .5 ? { f: .5, d: -.42 + .05 * tap, bow: .8, over: true } : { wx: DX + 70, wy: py(DX + 70), bow: .5 }], held: [{ hand: 1, svg: pen(th > .5 ? -150 : 18) }], head: -10 * th + 8 * (1 - th), face: th > .5 ? 'k:sad' : 'k:open', blink: th > .5 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, back: desk(), cam: 60 }; }
export default { title: 'WRITE / SIGN  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Fancy signature', blurb: 'huge loops, then flicks the pen up, pleased', pose: fancy },
  { key: 'B', name: 'Furious scribble', blurb: 'bent over, pen flying, angry', pose: scribble },
  { key: 'C', name: 'Stuck', blurb: 'taps the pen on the chin, then writes one dot', pose: stuck },
] };
// ---------- FRONT VIEW: the desk stands in front of the character ----------
const FT = 560;
const deskF = () => `<rect x="-30" y="${FT + 50}" width="60" height="${G - FT - 30}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><rect x="-190" y="${FT}" width="380" height="64" rx="12" fill="#a8683a" stroke="${INK}" stroke-width="12"/><rect x="-110" y="${FT - 8}" width="220" height="22" rx="4" fill="#fffdf2" stroke="${INK}" stroke-width="7"/>`;
function fancyF(t0, ch) { const t = t0 % 6, w = t < 3.6 ? 1 : 0, a = t * 5, done = track([[0, 0], [3.6, 0], [3.9, 1, 'out'], [5.4, 1], [5.8, 0]], t);
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -40 }, { x: 38 }], hands: [{ f: .3, d: .7, bow: 1 }, { wx: 10 + 80 * sin(a) * w + 110 * done, wy: FT - 30 + 8 * cos(a * 2) * w - 130 * done, bow: .6 }], held: [{ hand: 1, svg: pen(14 * sin(a) * w + 30 * done) }], head: 8 * sin(a) * w - 6 * done, face: done > .5 ? 'k:happy' : 'k:smirk' };
  P.y = reachDrop(ch, P); return { ...P, front: deskF(), cam: 0 }; }
function scribbleF(t, ch) { const a = t * 34, j = sin(t * 40);
  const P = { view: 'front', dir: 1, x: 2 * j, y: 40, rot: 0, feet: [{ x: -60 }, { x: 58 }], hands: [{ wx: -90, wy: FT - 26, bow: .7 }, { wx: 30 + 60 * sin(a * .37) + 20 * sin(a), wy: FT - 30 + 5 * cos(a), bow: .6 }], held: [{ hand: 1, svg: pen(14 * sin(a)) }], head: 3 * j, face: 'k:angry' };
  P.y = Math.max(40, reachDrop(ch, P)); return { ...P, front: deskF(), cam: 0 }; }
function stuckF(t0, ch) { const t = t0 % 6, th = track([[0, 1], [3.6, 1], [4.0, 0, 'io'], [4.5, 0], [4.9, 1, 'io'], [6, 1]], t), tap = th * Math.max(0, sin(t * 9));
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -40 }, { x: 38 }], hands: [{ f: .3, d: .7, bow: 1 }, th > .5 ? { lx: 70, ly: 330 + 10 * tap, bow: .9, over: true } : { wx: 20, wy: FT - 30, bow: .6 }], held: [{ hand: 1, svg: pen(th > .5 ? 150 : 0) }], head: 8 * th, face: th > .5 ? 'k:sad' : 'k:open', blink: th > .5 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, front: deskF(), cam: 0 }; }
export const front = { title: 'WRITE / SIGN  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Fancy signature', blurb: 'huge loops, then flicks the pen up, pleased', pose: fancyF },
  { key: 'B', name: 'Furious scribble', blurb: 'pen flying, angry', pose: scribbleF },
  { key: 'C', name: 'Stuck', blurb: 'taps the pen on the chin, then writes one dot', pose: stuckF },
] };
