import { cycle, reachDrop, lerp, blinkAt, ease, clamp } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;

// A BOUNCY: classic rubber-hose cartoon walk. Big up-down bounce each step, big arm swing, toes flick up, head bobs a beat late.
function bouncy(t, ch) {
  const dir = 1, c = cycle(t, { T: .4, S: 150, duty: .55, dir, swing: u => ({ lift: 95 * sin(PI * u) ** 1.2, toe: lerp(-30, 35, u) }) });
  const s2 = cos(2 * PI * c.stride);                            // +1 when foot 0 is forward
  const P = { view: 'side', dir, x: c.bx, rot: 5 * dir, feet: c.feet, head: 5 * sin(2 * PI * c.p - 1.2), face: 'k:happy',
    hands: [{ f: .55 * s2, d: .75 - .25 * Math.max(0, s2), bow: .4 }, { f: -.55 * s2, d: .75 - .25 * Math.max(0, -s2), bow: .4 }] };
  const bob = 70 * sin(PI * c.p) ** 2;                          // high at passing, low at contact
  P.y = 0; const need = reachDrop(ch, P); P.y = Math.max(need, 78 - bob);
  return { ...P, cam: c.bx + 60 };
}
// B SWAGGER: leaning back, chest out, slow long steps, the head nods hard on every beat (like a beat-nod meme), loose wide arms.
function swagger(t, ch) {
  const dir = 1, T = .56, c = cycle(t, { T, S: 165, duty: .62, dir, swing: u => ({ dx: .12 * sin(PI * u) ** 2, lift: 55 * sin(PI * u), toe: lerp(-20, 30, u) }) });
  const s2 = cos(2 * PI * c.stride), nod = Math.max(0, cos(2 * PI * c.p)) ** 3;   // snap down on the landing
  const P = { view: 'side', dir, x: c.bx, rot: -7 * dir + 2.5 * sin(2 * PI * c.stride), feet: c.feet, head: dir * (-6 + 13 * nod), face: 'k:smirk',
    hands: [{ f: .35 * s2 - .1, d: .92, bow: .7 }, { f: -.45 * s2 - .05, d: .9, bow: .7 }] };
  P.y = 0; const need = reachDrop(ch, P); P.y = Math.max(need, 30 + 22 * nod);
  return { ...P, cam: c.bx + 60, blink: blinkAt(t) };
}
// C WADDLE: tiny fast steps, stiff straight legs, the whole body rocks side to side over each foot, arms out like a penguin.
function waddle(t, ch) {
  const dir = 1, T = .24, c = cycle(t, { T, S: 62, duty: .5, dir, swing: u => ({ lift: 34 * sin(PI * u), toe: 0 }) });
  // in 3/4 view the feet sit either side of the hips; rock = lean over the planted foot
  const rockSide = c.side ? 1 : -1, rock = 9 * rockSide * sin(PI * clamp(c.p * 1.1));
  const feet = c.feet.map((ft, i) => ({ ...ft, x: ft.x + (i ? 30 : -30) }));
  const P = { view: '34', dir, x: c.bx, rot: rock, pivot: [c.bx + rockSide * 30, 1003], feet, head: -rock * .6, face: 'k:open',
    hands: [{ f: .62, d: .62 + .05 * sin(2 * PI * c.p * 2), bow: .25 }, { f: .62, d: .62 - .05 * sin(2 * PI * c.p * 2), bow: .25 }] };
  P.y = 0; P.y = reachDrop(ch, P, 2);
  return { ...P, cam: c.bx + 40, blink: null };
}
export default { title: 'WALK  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Bouncy cartoon', blurb: 'big bounce, big arm swing, toes flick', pose: bouncy },
  { key: 'B', name: 'Swagger strut', blurb: 'leans back, head nods on every beat', pose: swagger },
  { key: 'C', name: 'Penguin waddle', blurb: 'tiny fast steps, rocks side to side', pose: waddle },
] };
