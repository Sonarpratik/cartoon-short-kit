// PIECE 5: THE CHALK OR DRAWING STROKE DRAWN LIVE: the tool's tip rides the HEAD of the growing line, frame by frame, then a flourish.
// Source: episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs lines 100-123 (c_ring: the Chief chalks the last ring with a chalk stick). Film: S1 act at f140; the line grows f154-195 (41 f) and closes on "circle".
// THE THREE PARTS THAT MUST AGREE (this was the fix-round lesson):
//   1. the SET draws the line growing (bomber.js chalk state 0..1 over f154-195);
//   2. the FILM gives one hand_at point PER FRAME = the head of the line read from the set's real mesh (build_film.py lines 136-137; dump_ring.mjs wrote out/last_ring_line.json);
//      before the stroke the point is the line's start, after it the line's end;
//   3. the MOVE (this file) solves the fist every frame so the tool's tip is ON ch.tgt, and the DUST leaves from the same points (fx key chalk_head { f0, pts }).
// ORDER OF EVENTS (frames from the move's start, armor values): 0-3 NOTICE, head up · 3-9 the tool goes up and stops a hand short · 10-14 the tip goes ON ·
//   14-55 THE STROKE (the arm travels, the body stays planted) · 55-62 FLOURISH: the tool whips off and spins once · 62-71 it lands at rest (4 f dip) · still.
// WHAT MUST CHANGE FOR A NEW STORY: the mark (a ring, a tick, a letter, a line on a map) and its real points from the set, the tool and its length, the surface and how he reaches it
// (above him: lean and tiptoe are allowed here up to leanMax and 45 px), how long the stroke is (the words it covers), and the flourish (this one is a proud man's; a tired man just lowers it).
import { F, D2R, snap, tr, dip, ring, H, mix2, barProp } from '../motion_core.mjs';
const sin = Math.sin, cos = Math.cos;

export const ARMOR = {
  toolLen: 460,                  // px from the fist to the tip (armor: chalk bound to a pointer stick, 0.95 m; 0.82 m left the far side of the ring out of reach)
  armShare: .9,
  raise: 3,                      // the tool goes up (6 f) and stops short
  on: 10,                        // the tip goes ON the surface (4 f)
  shortBy: 70,                   // px the tip stops short of the surface before it goes on
  strokeEnd: 55,                 // last frame of the stroke = start of the flourish (7 f)
  landAt: 62,                    // the tool lands at rest: 4 f dip of 8 px, the tool rings 9 f from landAt + 1
  startAngle: -52, restAngle: -118, spin: 360,   // tool angle before the stroke, at rest after it, and the flourish turn (0 = no spin)
  leanMax: 0, riseMax: 45,       // how much the body may lean (deg) and go up on its toes (px) to reach
  feet: [-44, 50],
  defaultTarget: [292, -63],
  tool: barProp(460),
};

export function makeStroke(over = {}) { const P = { ...ARMOR, ...over }, ST_L = P.toolLen, TF = P.strokeEnd, TLd = P.landAt;
  return function stroke(t, ch) { const f = F(t), T = ch.tgt || P.defaultTarget, S = ch.sh[1], L = ch.armL;
    const ap = tr([[0, 0], [P.raise, .8, 6], [P.on, 1, 4]], f), fl = tr([[0, 0], [TF, 1, 7]], f);      // ap: approach (0.8 = a hand short, 1 = on); fl: flourish
    const tip = [T[0], T[1] + P.shortBy * (1 - ap) / .2 * (ap >= .8 ? 1 : 0)], start = [.26 * L + 8, S + .02 * L], rest = [.2 * L + 8, S + .12 * L];
    const baseRot = tr([[0, 0], [P.raise, -6, 5], [8, 0, 6], [TF, 5, 6], [TLd + 1, -2, 8]], f), yd = dip(f, TLd, 8, 4), R1 = L * P.armShare, kk = Math.min(1, ap / .8);
    const shAt = (rotDeg, rise) => { const r = rotDeg * D2R, py = ch.hipY + yd - rise, sy = S - ch.hipY; return [8 * cos(r) - sy * sin(r), py + 8 * sin(r) + sy * cos(r)]; }, far = (s) => Math.hypot(tip[0] - s[0], tip[1] - s[1]);
    // BODY-DRIVEN REACH: where the point is beyond arm plus tool he leans in and goes up on his toes just as far as it takes, and comes back as the line comes round to his side
    const LEAN_X = P.leanMax, RISE = P.riseMax, reach = R1 + ST_L - 8, d0 = far(shAt(baseRot, 0)), gain = Math.max(1, d0 - far(shAt(baseRot + LEAN_X, RISE))); let st = Math.max(0, Math.min(1, (d0 - reach) / gain));
    { const d1 = far(shAt(baseRot + LEAN_X * st, RISE * st)); if (d1 > reach && st < 1) st = Math.min(1, st + (d1 - reach) / gain * 1.15); } st *= kk * (1 - fl);
    const rotN = baseRot + LEAN_X * st, rise = RISE * st, shW = shAt(rotN, rise), dx = tip[0] - shW[0], dy = tip[1] - shW[1], d = Math.hypot(dx, dy) || 1; let fOn;
    if (d < R1 + ST_L - 1 && d > Math.abs(R1 - ST_L) + 1) { const q = (R1 * R1 - ST_L * ST_L + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, R1 * R1 - q * q)), mx = shW[0] + q * dx / d, my = shW[1] + q * dy / d, c1 = [mx - hh * dy / d, my + hh * dx / d], c2 = [mx + hh * dy / d, my - hh * dx / d]; fOn = c1[1] > c2[1] ? c1 : c2; }
    else fOn = [shW[0] + dx / d * R1, shW[1] + dy / d * R1];
    const k = Math.min(1, ap / .8), fist = f <= TF ? mix2(start, fOn, k) : mix2(fOn, rest, fl), aOn = Math.atan2(tip[1] - fOn[1], tip[0] - fOn[0]) / D2R;
    const sa = f <= TF ? P.startAngle + (aOn - P.startAngle) * k : aOn + (P.restAngle - aOn) * fl + P.spin * snap(f - TF, 7) + ring(f, TLd + 1, 9, 9);
    return { view: 'side', dir: 1, x: 0, y: yd - rise, rot: rotN, feet: [{ x: P.feet[0], lift: .92 * rise, toe: -.85 * rise }, { x: P.feet[1], lift: .92 * rise, toe: -.85 * rise }],
      hands: [{ wx: fist[0], wy: fist[1], bow: .4 }, H([-.1 - .16 * k * (1 - fl), .93 - .12 * k * (1 - fl), .5])], head: tr([[0, -2], [0, -17, 5], [TF, -6, 6]], f - 1), held: [{ hand: 0, svg: P.tool(sa - rotN), wrap: sa - rotN }] }; }; }   // the kit turns a drawn prop with the body: angle minus the lean
export default makeStroke;
