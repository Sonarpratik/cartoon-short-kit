// PIECE 3: THE SLAP OR HIT ON AN OBJECT, with the wind-up, the impact dip and the settle (side view).
// Source: episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs lines 150-170 (c_patch: the Chief slaps a rubber patch on the good tire). Film: S1 act at f283, contact on the word "flat" at f335 (F_SLAP),
// camera kick amp 0.8 at f335, the set's own answer: the patch quivers (bomber.js key tire_hit, f335-349) and a dust ring (fx tire_dust).
// ORDER OF EVENTS (frames from the move's start, armor values):
//   0-6 up out of the pose before (here: out of the laugh) · 6 the thing comes out and is SHOWN · 22 lowered (the far tool points at the target) · 36-40 a beat of business (he licks the patch) ·
//   43-47 COUNTER: the arm swings far back and low, he rises on his toes · 47-48 HOLD · 48-51 STRIKE on an arc (3 f, accelerating: u squared) · 51 CONTACT ·
//   51-55 IMPACT DIP 12 px, the hand rings 8 f · the palm STAYS on the object, the face holds, DEAD STILL.
// The contact point is ch.tgt (the film's hand_at gives it), so the palm ends ON the object, not near it.
// WHAT MUST CHANGE FOR A NEW STORY: the object and its own answer to the hit (quiver, dent, dust, ring of water: built in the set), what is in the hand (payload) or a bare palm,
// the business before the wind-up (it is this character's own; drop it rather than keep the lick), the pose it starts from, the word under the contact, the kick strength.
import { F, PI, G, snap, tr, dip, ring, mix2, barProp, INK } from '../motion_core.mjs';
const sin = Math.sin;

export const ARMOR = {
  from: { y: 84, rot: 32, x: -200, head: 20, farAngleOff: 122 },   // the pose the move is entered from (the end of the laugh: doubled over)
  takeOut: 1, show: 6,           // the thing comes out of the pocket, is held up
  lower: 22, lowerEnd: 34,       // lowered while the far tool points
  business: 36,                  // the beat before the wind-up (4 f)
  counter: 43,                   // wind-up starts (4 f)
  strike: 48, strikeN: 3,        // strike starts; frames to contact
  dipAmp: 12, dipN: 4, ringAmp: 5, ringN: 8,
  arc: 70,                       // px the hand leaves the straight line in the strike
  tiptoe: 26,                    // px the heels lift in the wind-up
  feet: [-52, 60],
  // points of the near hand, from the shoulder height S (rig px): shown, lowered, business, wound back, pocket
  points: (S) => ({ show: [300, S - 70], low: [270, S - 20], lick: [176, S - 96], back: [-250, S + 60], pocket: [50, S + 60] }),
  farAngle: -118, farTool: barProp(460),                            // the far hand's tool (armor: the chalk stick), or null
  payload: (ang, k = 1) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${k.toFixed(2)})"><ellipse cx="0" cy="-8" rx="66" ry="50" fill="#a23a2a" stroke="${INK}" stroke-width="8"/></g>`,   // the thing in the palm (armor: the patch), or null
  defaultTarget: [210, 560],
};

export function makeHit(over = {}) { const P = { ...ARMOR, ...over }, T1 = P.takeOut, T6 = P.show, TL = P.lower, TLE = P.lowerEnd, TBz = P.business, TC = P.counter, TS = P.strike, TK = TS + P.strikeN, TE = TK + P.dipN, FR = P.from;
  return function hit(t, ch) { const f = F(t), T = ch.tgt || P.defaultTarget, S = ch.sh[1], L = ch.armL;
    const { show, low, lick, back, pocket } = P.points(S);
    let p = mix2([74, (ch.hipY + 84 + G) / 2 - 30], pocket, snap(f - T1, 5)); p = mix2(p, show, snap(f - T6, 5)); if (f > T6 + 2 && f < T6 + 14) p = [p[0] + 7 * sin((f - T6 - 2) * 2.1) * Math.max(0, 1 - (f - T6 - 2) / 12), p[1]];   // shown with a small shake: look at this
    if (f > TL) p = mix2(show, low, snap(f - TL, 5)); if (f > TBz) p = mix2(low, lick, snap(f - TBz, 4)); if (f > TC) p = mix2(lick, back, snap(f - TC, 4));
    if (f > TS) { const u = Math.min(1, (f - TS) / P.strikeN); p = mix2(back, T, u * u); p[1] -= P.arc * sin(PI * u); } if (f >= TK) p = [T[0] + ring(f, TK, P.ringAmp, P.ringN), T[1]];       // STRIKE on an arc, then ON the target for good
    const has = f >= T6 - 1 && f < TK, pt = tr([[0, 0], [TL + 2, 1, 4], [TLE, 0, 5]], f);
    const y = tr([[0, FR.y], [0, 0, 6], [TL + 2, 14, 4], [TLE, 0, 5], [TC, -20, 4], [TS, 34, 3], [TE, 14, 6]], f) + dip(f, TK, P.dipAmp, P.dipN), rot = tr([[0, FR.rot], [0, -5, 6], [8, 2, 5], [TL + 2, 10, 4], [TLE, 2, 5], [TC, -12, 4], [TS, 17, 3], [TE, 9, 6]], f);
    const tipt = f >= TC && f < TS + 1 ? snap(f - TC, 4) : 0, pa = tr([[0, -20], [T6, 0, 5], [TBz, 20, 4], [TC, -60, 4], [TS, 10, 3]], f), sa = P.farAngle + FR.farAngleOff * (1 - snap(f, 6)) + 140 * pt + ring(f, TL + 6, 6, 8) + ring(f, TK, 10, 9) - 8 * tipt;
    const up0 = snap(f, 6), fs = mix2(mix2([.5 * L, S + .55 * L], [.2 * L + 8, S + .12 * L], up0), [.6 * L + 8, S + .2 * L], pt);
    const xb = tr([[0, FR.x], [0, 0, 6]], f);
    return { view: 'side', dir: 1, x: xb, y, rot, feet: [{ x: P.feet[0] - xb, lift: P.tiptoe * tipt, toe: -24 * tipt }, { x: P.feet[1] - xb, lift: P.tiptoe * tipt, toe: -24 * tipt }], hands: [{ wx: fs[0], wy: fs[1] + y, bow: .4 }, { wx: p[0], wy: p[1], bow: .45, over: f < TC || f >= TK }],
      head: tr([[0, FR.head], [0, 6, 5], [8, -4, 5], [TL + 2, 8, 4], [TLE, 0, 5], [TBz, 4, 4], [TC, -10, 4], [TS, 12, 3], [TE, 6, 6]], f - 1),
      held: (P.farTool ? [{ hand: 0, svg: P.farTool(sa), wrap: sa }] : []).concat(has && P.payload ? [{ hand: 1, svg: P.payload(pa, f < T6 ? .7 : 1.25) }] : []) }; }; }
export default makeHit;
