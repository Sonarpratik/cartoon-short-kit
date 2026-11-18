import { cycle, track, blinkAt, clamp, G } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, R2D = 180 / PI;
const HL = 191;
// hands-and-knees gait: knees and hands are planted on the floor (cycle() keeps them still while down), body moves between them
function fours(t, { T, S, rot, hipY, shoulderX, lift = 30, hlift = 40, bounce = 0, wig = 0, head = -70, face, shake = 0, surge = 0 }) {
  const tt = surge ? t + surge * sin(2 * PI * t / (2 * T)) * T / (2 * PI) : t;     // surge: pull-pause rhythm
  const kn = cycle(tt, { T, S, duty: .6, swing: u => ({ lift: lift * sin(PI * u) }) });
  const hd = cycle(tt + T, { T, S, duty: .6, x0: shoulderX + 20, swing: u => ({ lift: hlift * sin(PI * u) }) });
  const bx = kn.bx, y = hipY - 620 - bounce * sin(PI * kn.p) ** 2;
  const feet = kn.feet.map((k, i) => {
    const hx = bx + (i ? 10 : -12), kx = k.x + (i ? 10 : -12), ky = 995 - k.lift, dy = ky - (hipY - bounce * sin(PI * kn.p) ** 2);
    const a = Math.atan2(clamp(dy, 0, HL), clamp(kx - hx, -HL, HL)) * R2D;
    return { x: kx - 260, lift: k.lift * .6, thigh: a, mix: 1, toe: -15 };
  });
  return { view: 'side', dir: 1, x: bx, y, rot: rot + wig * sin(2 * PI * kn.stride) + shake * sin(t * 50), feet,
    hands: hd.feet.map(h => ({ wx: h.x, wy: 990 - h.lift, bow: .5 })), head: head + shake * 2 * sin(t * 37), face, cam: bx + 220, camY: -200 };
}
const baby = t => ({ ...fours(t, { T: .36, S: 70, rot: 95, hipY: 806, shoulderX: 233, lift: 30, hlift: 45, bounce: 12, wig: 5, head: -72, face: 'k:happy' }) });
const army = t => {
  const P = fours(t, { T: .5, S: 60, rot: 80, hipY: 905, shoulderX: 230, lift: 8, hlift: 30, head: -62, face: 'k:angry', surge: 2.2 });
  // belly on the floor: the legs lie out behind; one knee at a time draws up the side (frog push)
  P.feet = P.feet.map((f, i) => { const k = .5 + .5 * sin(2 * PI * t / 1.0 + i * PI); return { x: P.x - 330 + 60 * k, lift: 4, thigh: 168 - 40 * k, mix: 1, toe: -60 }; });
  return P;
};
const scramble = t => fours(t, { T: .14, S: 80, rot: 92, hipY: 806, shoulderX: 233, lift: 45, hlift: 70, bounce: 20, wig: 7, head: -64, face: 'terrified', shake: 2 });
export default { title: 'CRAWL  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Bouncy baby crawl', blurb: 'hands and knees, bum wiggles, happy', pose: baby },
  { key: 'B', name: 'Army belly crawl', blurb: 'flat on the floor, pulls with the arms', pose: army },
  { key: 'C', name: 'Frantic scramble', blurb: 'super fast, flailing, terrified', pose: scramble },
] };
