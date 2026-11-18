// LEAN ON A WALL (seen in Rick's clips: leaning on a post or wall, arms crossed, watching). The back RESTS ON the wall, never in it.
import { G, track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, INK = '#2a1a1f';
const WX = -150;
const wall = () => `<rect x="${WX - 420}" y="-400" width="420" height="${G + 400}" fill="#8a5a7a" stroke="${INK}" stroke-width="12"/><path d="M${WX - 420},300 h420 M${WX - 420},650 h420 M${WX - 210},-400 v700 M${WX - 100},300 v350 M${WX - 300},650 v360" stroke="${INK}" stroke-opacity=".35" stroke-width="8"/>`;
const crossed = [{ f: .42, d: .5, bow: .9 }, { f: .34, d: .58, bow: .9 }];
// A COOL: back on the wall, arms crossed, ankles crossed, slow nod
function cool(t, ch) { const P = { view: 'side', dir: 1, x: -18, rot: -15, feet: [{ x: 96, toe: -18 }, { x: 70 }], hands: crossed, head: 12 + 3 * sin(t * 1.6), face: 'k:smirk', blink: blinkAt(t) };
  P.y = reachDrop(ch, P); return { ...P, back: wall(), cam: 0 }; }
// B SLIDE DOWN: too tired to stand, slides down the wall until sitting, knees up
function slide(t0, ch) { const t = t0 % 6, s = track([[0, 0], [.8, 0], [3.6, 1, 'io'], [5.4, 1], [5.9, 0, 'io']], t);
  const P = { view: 'side', dir: 1, x: -18 + 24 * s, rot: -15 + 6 * s, feet: [{ x: 96 + 60 * s }, { x: 70 + 60 * s }], hands: s > .6 ? [{ f: .5, d: .8 }, { f: .45, d: .85 }] : crossed, head: 12 + 14 * s, face: s > .3 ? 'k:standard' : 'k:sad', blink: s > .8 ? 'closed' : s > .3 ? 'half' : null };
  P.y = Math.max(reachDrop(ch, P), 330 * s); return { ...P, back: wall(), cam: 0 }; }
// C TRYING TO LOOK CASUAL: leans, the feet slip, catches itself, pretends nothing happened
function casual(t0, ch) { const t = t0 % 3, s = track([[0, 0], [1.5, 0], [1.62, 1, 'out'], [1.9, 1], [2.4, 0, 'io']], t);
  const P = { view: 'side', dir: 1, x: -18 + 30 * s, rot: -15 - 12 * s, feet: [{ x: 96 + 90 * s, toe: -30 * s }, { x: 70 + 70 * s, toe: -30 * s }], hands: s > .3 ? [{ f: .7, d: .1, bow: .4 }, { f: .6, d: -.2, bow: .4 }] : crossed, head: 12 - 10 * s, face: s > .3 ? 'terrified' : 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 120 * s); return { ...P, back: wall(), cam: 0 }; }
export default { title: 'LEAN ON A WALL  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Cool', blurb: 'arms crossed, ankles crossed, slow nod', pose: cool },
  { key: 'B', name: 'Slide down', blurb: 'too tired, slides down until sitting', pose: slide },
  { key: 'C', name: 'Trying to look casual', blurb: 'feet slip, catches itself, pretends', pose: casual },
] };
// ---------- FRONT VIEW: shoulder against a post ----------
const PX = -150;
const postF = () => `<rect x="${PX - 110}" y="-400" width="110" height="${G + 400}" fill="#8a5a7a" stroke="${INK}" stroke-width="12"/>`;
const crossF = [{ lx: 46, ly: 470 }, { lx: -40, ly: 492 }];
function coolF(t, ch) { const P = { view: 'front', dir: 1, x: 20, rot: -13, feet: [{ x: 100 }, { x: 66, toe: 0 }], hands: crossF, head: 10 + 3 * sin(t * 1.6), face: 'k:smirk', blink: blinkAt(t) };
  P.y = reachDrop(ch, P); return { ...P, back: postF(), cam: -40 }; }
function slideF(t0, ch) { const t = t0 % 6, s = track([[0, 0], [.8, 0], [3.6, 1, 'io'], [5.4, 1], [5.9, 0, 'io']], t);
  const P = { view: 'front', dir: 1, x: 20 + 16 * s, rot: -13 + 5 * s, feet: [{ x: 0, kneeK: 1 + s }, { x: 150, kneeK: 1 + s }], hands: s > .6 ? [{ f: .3, d: .9 }, { f: .3, d: .9 }] : crossF, head: 10 + 8 * s, face: s > .3 ? 'k:standard' : 'k:sad', blink: s > .8 ? 'closed' : s > .3 ? 'half' : null };
  P.y = Math.max(reachDrop(ch, P), 300 * s); return { ...P, back: postF(), cam: -40 }; }
function casualF(t0, ch) { const t = t0 % 3, s = track([[0, 0], [1.5, 0], [1.62, 1, 'out'], [1.9, 1], [2.4, 0, 'io']], t);
  const P = { view: 'front', dir: 1, x: 20 + 26 * s, rot: -13 - 12 * s, feet: [{ x: 100 + 90 * s }, { x: 66 + 110 * s }], hands: s > .3 ? [{ f: .5, d: -.2, bow: .4 }, { f: .9, d: -.1, bow: .4 }] : crossF, head: 10 - 8 * s, face: s > .3 ? 'terrified' : 'awkward' };
  P.y = Math.max(reachDrop(ch, P), 110 * s); return { ...P, back: postF(), cam: -40 }; }
export const front = { title: 'LEAN ON A WALL  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Cool', blurb: 'shoulder on the post, arms crossed', pose: coolF },
  { key: 'B', name: 'Slide down', blurb: 'too tired, slides down the post', pose: slideF },
  { key: 'C', name: 'Trying to look casual', blurb: 'feet slip, catches itself, pretends', pose: casualF },
] };
