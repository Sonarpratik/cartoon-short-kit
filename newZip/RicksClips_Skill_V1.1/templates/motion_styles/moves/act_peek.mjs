// PEEK ROUND A CORNER (seen in Rick's clips: peeking round a door). The wall is in front; only what leans out is seen.
import { G, track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, INK = '#2a1a1f', isF = v => v === 'front';
const EX = 0;   // wall edge; the wall covers everything left of it
const wall = (grip, gy = 470) => `<rect x="${EX - 900}" y="-900" width="900" height="${G + 900}" fill="#8a5a7a" stroke="${INK}" stroke-width="12"/><path d="M${EX - 900},250 h900 M${EX - 900},640 h900 M${EX - 300},-900 v1150 M${EX - 520},250 v390 M${EX - 200},640 v370" stroke="${INK}" stroke-opacity=".3" stroke-width="8"/>` + (grip ? [0, 1, 2, 3].map(i => `<circle cx="${EX - 6}" cy="${gy + i * 24}" r="12" fill="${INK}"/>`).join('') : '');
// out = 0 hidden .. 1 head fully out
const P0 = (v, ch, out, o = {}) => { const f = isF(v), lean = 16 * out;
  const P = { view: v, dir: 1, x: EX - 215 + 150 * out, rot: lean, feet: f ? [{ x: EX - 260 }, { x: EX - 180 }] : [{ x: EX - 250 }, { x: EX - 200 }], hands: [null, null], head: (f ? 10 : 4) * out, face: 'k:standard', ...o };
  P.y = reachDrop(ch, P); return { ...P, front: wall(out > .25), cam: 60 }; };
const slow = v => (t0, ch) => { const t = t0 % 6, u = track([[0, 0], [1.6, .55, 'io'], [2.4, .55], [3.0, 1, 'io'], [4.4, 1], [5.2, 0, 'io']], t), look = t > 3.2 && t < 4.3 ? sin(t * 5) : 0; return P0(v, ch, u, { head: 6 * u + 8 * look, face: 'k:smirk', blink: blinkAt(t) }); };
const pop = v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [.12, 1, 'out'], [.5, 1], [.6, 0, 'in'], [1.3, 0], [1.42, 1, 'out'], [1.7, 1], [1.8, 0, 'in']], t); return P0(v, ch, u, { face: 'awkward' }); };
const caught = v => (t0, ch) => { const t = t0 % 6, u = track([[0, 0], [1.0, 1, 'io'], [3.4, 1], [5.4, 0]], t), seen = t > 1.3, sh = seen && u > .2 ? 2 * sin(t * 40) : 0; return P0(v, ch, u, { x: EX - 215 + 150 * u + sh, face: seen ? 'terrified' : 'k:smirk' }); };
const mk = v => ({ title: `PEEK ROUND A CORNER  ·  ${isF(v) ? 'front' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'Slow peek', blurb: 'eyes first, then the whole head, looks about', pose: slow(v) },
  { key: 'B', name: 'Pop', blurb: 'head shoots out and back, twice, too fast', pose: pop(v) },
  { key: 'C', name: 'Caught', blurb: 'peeks, gets seen, freezes, slides back very slowly', pose: caught(v) },
] });
export default mk('side'); export const front = mk('front');
