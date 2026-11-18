// DRINK (seen in Rick's clips: cup, mug, wine, straw). The mug is drawn AT the hand and tips toward the mouth.
import { track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, INK = '#2a1a1f';
// mug standing on the hand, tipped by a degrees (positive = clockwise); s = handle side (+1 right)
const mug = (a, s = 1, col = '#e8503a') => (x, y) => `<g transform="rotate(${a.toFixed(1)} ${x} ${y})"><path d="M${x + s * 34},${y - 58} q${s * 40},4 ${s * 34},34 q${-s * 8},22 ${-s * 34},14" fill="none" stroke="${INK}" stroke-width="24"/><path d="M${x + s * 34},${y - 58} q${s * 40},4 ${s * 34},34 q${-s * 8},22 ${-s * 34},14" fill="none" stroke="${col}" stroke-width="10"/><rect x="${x - 40}" y="${y - 84}" width="80" height="96" rx="12" fill="${col}" stroke="${INK}" stroke-width="12"/><rect x="${x - 40}" y="${y - 84}" width="80" height="18" rx="9" fill="#fff" fill-opacity=".55"/></g>`;
// A FANCY SIP: little finger out, tiny sip, eyes closed, very pleased with itself
function sip(t0, ch) { const t = t0 % 6, u = track([[0, 0], [1.2, 1, 'io'], [2.6, 1], [3.2, 0, 'io'], [6, 0]], t);
  const P = { view: 'side', dir: 1, x: 0, rot: -3 * u, feet: [{ x: -22 }, { x: 22 }], hands: [{ f: -.25, d: .6, bow: .9 }, { f: .62 - .12 * u, d: .2 - .52 * u, bow: .8, over: true }], held: [{ hand: 1, svg: mug(-38 * u, 1) }], head: -8 * u, face: u > .8 ? 'k:happy' : 'k:smirk', blink: u < .1 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
// B CHUG: head goes right back, mug upside down over the face, belly wobbles, gasps after
function chug(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.5, 1, 'out'], [3.6, 1], [3.9, 0, 'out'], [6, 0]], t), g = u > .95 ? sin(t * 16) : 0;
  const P = { view: 'side', dir: 1, x: 0, rot: -16 * u + 1.5 * g, feet: [{ x: -40 }, { x: 30 }], hands: [{ f: .1 - .5 * u, d: .8 - .3 * u, bow: .9 }, { f: .6 - .2 * u, d: .2 - .75 * u, bow: .8, over: true }], held: [{ hand: 1, svg: mug(-112 * u, 1, '#3f7fd6') }], head: -20 * u, face: u > .5 ? 'k:open' : t > 3.9 ? 'k:happy' : 'k:standard' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
// C TOO HOT: sips, freezes, then the mouth is on fire: mug held far away, other hand fans the tongue
function hot(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.9, 1, 'io'], [1.5, 1], [1.7, 0, 'out'], [6, 0]], t), burn = t > 1.7 && t < 5.2 ? 1 : 0, fan = burn * sin(t * 30), j = burn * sin(t * 26);
  const P = { view: 'side', dir: 1, x: 3 * j, rot: -3 * u + 8 * burn, feet: [{ x: -30, lift: burn * 26 * Math.max(0, sin(t * 13)) }, { x: 26, lift: burn * 26 * Math.max(0, -sin(t * 13)) }], hands: [burn ? { f: .55, d: -.38 + .1 * fan, bow: .8, over: true } : { f: -.25, d: .6, bow: .9 }, burn ? { f: -.85, d: .1, bow: .2 } : { f: .62 - .12 * u, d: .2 - .52 * u, bow: .8, over: true }], held: [{ hand: 1, svg: mug(burn ? 25 : -38 * u, burn ? -1 : 1, '#f2c230') }], head: -8 * u + 6 * burn, face: burn ? 'scream' : t > 5.2 ? 'k:sad' : 'k:standard' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
export default { title: 'DRINK  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Fancy sip', blurb: 'tiny sip, eyes closed, very pleased', pose: sip },
  { key: 'B', name: 'Chug', blurb: 'head right back, mug upside down, gasp', pose: chug },
  { key: 'C', name: 'Too hot', blurb: 'sips, mouth on fire, fans the tongue', pose: hot },
] };
// ---------- FRONT VIEW: the mug comes up in front of the mouth ----------
const up = u => ({ lx: 150 - 80 * u, ly: 560 - 250 * u, bow: .9, over: u > .4 });
function sipF(t0, ch) { const t = t0 % 6, u = track([[0, 0], [1.2, 1, 'io'], [2.6, 1], [3.2, 0, 'io'], [6, 0]], t);
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -34 }, { x: 32 }], hands: [{ f: .3, d: .7, bow: 1 }, up(u)], held: [{ hand: 1, svg: mug(-30 * u, 1) }], head: 5 * u, face: u > .8 ? 'k:happy' : 'k:smirk', blink: u < .1 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
function chugF(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.5, 1, 'out'], [3.6, 1], [3.9, 0, 'out'], [6, 0]], t), g = u > .95 ? sin(t * 16) : 0;
  const P = { view: 'front', dir: 1, x: 0, y: 0, rot: 1.5 * g, feet: [{ x: -60 }, { x: 58 }], hands: [{ f: .5, d: .5, bow: 1 }, { lx: 150 - 110 * u, ly: 560 - 300 * u, bow: .9, over: u > .4 }], held: [{ hand: 1, svg: mug(-150 * u, 1, '#3f7fd6') }], head: 4 * g, face: u > .5 ? 'k:open' : t > 3.9 ? 'k:happy' : 'k:standard' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
function hotF(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.9, 1, 'io'], [1.5, 1], [1.7, 0, 'out'], [6, 0]], t), burn = t > 1.7 && t < 5.2 ? 1 : 0, fan = burn * sin(t * 30), j = burn * sin(t * 26);
  const P = { view: 'front', dir: 1, x: 3 * j, rot: 0, feet: [{ x: -40, lift: burn * 26 * Math.max(0, sin(t * 13)) }, { x: 38, lift: burn * 26 * Math.max(0, -sin(t * 13)) }], hands: [burn ? { lx: -70, ly: 330 + 26 * fan, bow: .9, over: true } : { f: .3, d: .7, bow: 1 }, burn ? { f: .95, d: .15, bow: .2 } : up(u)], held: [{ hand: 1, svg: mug(burn ? 20 : -30 * u, 1, '#f2c230') }], head: 5 * j, face: burn ? 'scream' : t > 5.2 ? 'k:sad' : 'k:standard' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; }
export const front = { title: 'DRINK  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Fancy sip', blurb: 'tiny sip, eyes closed, very pleased', pose: sipF },
  { key: 'B', name: 'Chug', blurb: 'mug upside down over the face, gasp', pose: chugF },
  { key: 'C', name: 'Too hot', blurb: 'sips, mouth on fire, fans the tongue', pose: hotF },
] };
