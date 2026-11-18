import { cycle, reachDrop, lerp, ease } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;

// A CARTOON DASH: deep forward lean, legs wheel round in big loops (kick high behind, knee up in front), fists pump.
function dash(t, ch) {
  const dir = 1, T = .17, c = cycle(t, { T, S: 210, duty: .36, dir, swing: u => ({ dx: -.18 * sin(PI * u), lift: 170 * sin(PI * Math.min(1, u * 1.1)) ** .8, toe: lerp(-50, 25, u) }) });
  const s2 = cos(2 * PI * c.stride);
  const P = { view: 'side', dir, x: c.bx, rot: 17 * dir, feet: c.feet, head: 4 * dir, face: 'k:angry',
    hands: [{ f: .55 * s2 + .1, d: .35 - .3 * Math.max(0, s2), bow: .9 }, { f: -.55 * s2 + .1, d: .35 - .3 * Math.max(0, -s2), bow: .9 }] };
  P.y = 0; const need = reachDrop(ch, P, 10); P.y = Math.max(need, 40 - 50 * sin(PI * c.p) ** 2);   // a little flight between steps
  return { ...P, cam: c.bx + 140 };
}
// B PANIC FLAIL: upright, leaning back, knees pumped high, both arms flailing wildly, screaming meme face, head thrown back.
function panic(t, ch) {
  const dir = 1, T = .2, c = cycle(t, { T, S: 150, duty: .4, dir, swing: u => ({ dx: .05 * sin(PI * u), lift: 210 * sin(PI * u) ** 1.3, toe: lerp(-30, 10, u) }) });
  const w = 2 * PI * t / .26;
  const P = { view: 'side', dir, x: c.bx, rot: -6 * dir + 3 * sin(w), feet: c.feet, head: dir * (-10 + 6 * sin(w * .5)), face: 'scream',
    hands: [{ f: 1.0 * sin(w), d: .05 + .3 * cos(w * 1.3), bow: .3 }, { f: -1.0 * sin(w + 1.6), d: 0 + .3 * cos(w * 1.3 + 1), bow: .3 }] };
  P.y = 0; const need = reachDrop(ch, P, 8); P.y = Math.max(need, 30 - 40 * sin(PI * c.p) ** 2);
  return { ...P, cam: c.bx + 120 };
}
// C ARMS-BACK SPRINT: body almost flat forward, both arms stiff straight back, tiny super-fast legs, head pushed forward.
function armsback(t, ch) {
  const dir = 1, T = .11, c = cycle(t, { T, S: 170, duty: .38, dir, swing: u => ({ dx: -.1 * sin(PI * u), lift: 120 * sin(PI * u), toe: lerp(-40, 15, u) }) });
  const jit = sin(2 * PI * t / (2 * T));
  const P = { view: 'side', dir, x: c.bx, rot: 30 * dir, feet: c.feet, head: dir * (-14), face: 'k:smirk',
    hands: [{ f: -.95, d: .2 + .04 * jit, bow: .08 }, { f: -1.0, d: .1 - .04 * jit, bow: .08 }] };
  P.y = 0; const need = reachDrop(ch, P, 10); P.y = Math.max(need, 50 - 30 * sin(PI * c.p) ** 2);
  return { ...P, cam: c.bx + 160 };
}
export default { title: 'RUN  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Cartoon dash', blurb: 'leans in, legs wheel round, fists pump', pose: dash },
  { key: 'B', name: 'Panic flail', blurb: 'knees high, arms flailing, screaming', pose: panic },
  { key: 'C', name: 'Arms-back sprint', blurb: 'flat forward, arms stiff behind', pose: armsback },
] };
