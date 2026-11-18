// shared bits for the GESTURE moves: one builder for side and front, feet planted, body lowered to reach them
import { reachDrop } from '../rig.mjs';
export const INK = '#2a1a1f', sin = Math.sin, PI = Math.PI, pos = v => Math.max(0, v);
export const isF = v => v === 'front';
// o.feet may be given; o.dy = extra crouch
export function S(v, ch, o) { const f = isF(v), P = { view: v, dir: 1, x: 0, rot: 0, feet: f ? [{ x: -40 }, { x: 38 }] : [{ x: -22 }, { x: 22 }], hands: [null, null], head: 0, face: 'k:standard', ...o };
  const dy = P.dy || 0; delete P.dy; P.y = Math.max(reachDrop(ch, P), dy) + (P.hop || 0); return { cam: 0, ...P }; }
export const mk = (title, defs) => v => ({ title: `${title}  ·  ${isF(v) ? 'front' : 'side'} view`, dur: 6, styles: defs.map((d, i) => ({ key: 'ABC'[i], name: d[0], blurb: d[1], pose: d[2](v) })) });
export const talk = t => (Math.floor(t * 7) % 2 ? 'k:open' : 'k:happy');
