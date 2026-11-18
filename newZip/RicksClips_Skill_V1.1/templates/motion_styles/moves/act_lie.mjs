// LIE ON THE BACK (seen in Rick's clips: on the grass, on a lounger). The body RESTS ON the floor (rot -80, hip 918), never in it.
import { G, track } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, pos = v => Math.max(0, v);
const LIE = 918, lying = o => ({ view: 'side', dir: 1, x: 0, y: LIE - 620, rot: -80, cam: -130, camY: -420, ...o });
// A CHILL: hands behind the head, one knee up, the other leg crossed over it, foot bobbing
function chill(t) { const b = sin(t * 5); return lying({ feet: [{ x: 250 }, { x: 330, lift: 230 + 14 * b, toe: -60 + 10 * b, kneeK: .6 }], hands: [{ f: -.2, d: -.75, bow: 1 }, { f: -.1, d: -.8, bow: 1 }], head: 70, face: 'k:smirk', blink: 'half' }); }
// B STARFISH: flat out, done with everything, one long sigh
function star(t) { const b = sin(2 * PI * t / 3.6); return lying({ y: LIE - 620 - 3 * b, feet: [{ x: 400, kneeK: .05, toe: 60, lift: 14 }, { x: 420, kneeK: .05, toe: 60, lift: 30 }], hands: [{ f: -.9, d: -.2, bow: .2 }, { f: .2, d: -.95, bow: .2 }], head: 76, face: 'k:sad', blink: t % 3.6 > 2.6 ? 'closed' : 'half' }); }
// C TURTLE: stuck on its back, rocks, arms and legs paddle the air
function turtle(t) { const r = sin(t * 5), k = sin(t * 11); return lying({ rot: -80 + 9 * r, x: 12 * r, feet: [{ x: 230 + 60 * k, lift: 300 - 80 * k, kneeK: .5 }, { x: 250 - 60 * k, lift: 300 + 80 * k, kneeK: .5 }], hands: [{ f: .7 + .2 * k, d: -.5, bow: .5 }, { f: .7 - .2 * k, d: -.6, bow: .5 }], head: 60 + 6 * r, face: 'strain' }); }
export default { title: 'LIE ON THE BACK  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Chill', blurb: 'hands behind the head, leg crossed, foot bobs', pose: chill },
  { key: 'B', name: 'Starfish', blurb: 'flat out, done with everything', pose: star },
  { key: 'C', name: 'Turtle', blurb: 'stuck on its back, paddles the air', pose: turtle },
] };
