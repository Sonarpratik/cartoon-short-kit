// PIECE 7: "I TOLD YOU SO": the last acted beat and the last-frame pose (front view, arms crossed, one small gesture, then dead still).
// Source: episodes/armor-no-holes/stretches/armor-s5-payoff/cast/ep_s5.mjs lines 77-97 (mBase, m_told; CB 2026-11-14). Film: S5 act at f220 on "clean spot", face k:slowBlink f226, face k:smug f230,
// finger on the hat brim f232, the tip f233-237, arms crossed again f244, DEAD STILL from f247 to the end hold (0.7 s). The loser answers 3 f later with a small defeated shrug (c_defeat, lines 98-100).
// ORDER OF EVENTS (frames from the move's start, armor values): 0-2 chin DOWN (counter) · 2-7 the head comes round and the chin lifts, the body grows 6 px ·
//   6 the satisfied slow blink, 10 the smug face (film face steps) · 8-12 one hand leaves the crossed arms and goes up on an arc · 12 the finger is ON the brim ·
//   13-17 THE TIP: the head nods 8 deg under the finger and comes back · 17-24 the hand comes down, the arms cross again (3 f dip on landing) · 24-27 settle · DEAD STILL.
// WHAT MUST CHANGE FOR A NEW STORY: the gesture (he tips a bowler; with no hat it is a polished fingernail, a sip, a pencil behind the ear), what is tucked in the crossed arms,
// the point the hand goes to (brim), the word it lands on, who loses and how they answer, and how smug this character is allowed to be (the armor mathematician: very small).
import { F, PI, tr, dip, ring, barProp } from '../motion_core.mjs';
const sin = Math.sin;

export const ARMOR = {
  base: { feet: [-30, 30], hands: [[50, 474], [-44, 496]], bow: .7 },   // crossed arms: [x, y] of each fist in the card's own px (lx, ly)
  chinDown: 2,                 // counter ends, the head comes up (5 f)
  grow: 6,                     // px the body grows as the chin lifts
  handUp: 8, handUpN: 5,       // the hand leaves the crossed arms
  brim: [112, 182],            // where the finger lands (lx, ly)
  arc: 46,                     // px the hand's path bows
  tip: [13, 17.5], tipDeg: 8,  // the nod under the finger
  handDown: 17, handDownN: 7,  // back to crossed
  land: 24,                    // the arms cross again: 3 f dip of 6 px, the tucked tool rings 8 f
  headKeys: [7, 10, -9, -7],   // head angle: before, chin down, lifted, at rest
  tuckAngle: -52,
  tuck: barProp(100),          // the thing held in the crossed arms (armor: the slide rule), or null
};

export function makeToldYou(over = {}) { const P = { ...ARMOR, ...over }, B = P.base, R = B.hands[1];
  const base = (o = {}) => ({ view: 'front', dir: 1, x: 0, y: 0, rot: 0, feet: [{ x: B.feet[0] }, { x: B.feet[1] }], hands: [{ lx: B.hands[0][0], ly: B.hands[0][1], bow: B.bow }, { lx: R[0], ly: R[1], bow: B.bow }], head: 0, ...o });
  return function toldYou(t, ch) { const f = F(t), up = tr([[0, 0], [P.handUp, 1, P.handUpN], [P.handDown, 0, P.handDownN]], f), arc = P.arc * sin(PI * Math.min(1, Math.max(0, up))) * (f < P.tip[0] ? 1 : .6);
    const hx = R[0] + (P.brim[0] - R[0]) * up + (f >= P.handDown ? 62 * sin(PI * up) : 0), hy = R[1] + (P.brim[1] - R[1]) * up - arc * (1 - up), nod = f > P.tip[0] && f < P.tip[1] ? P.tipDeg * sin(PI * (f - P.tip[0]) / (P.tip[1] - P.tip[0])) : 0;
    return base({ y: dip(f, 0, 5, 3) - tr([[0, 0], [P.chinDown, P.grow, 5]], f) + dip(f, P.land, 6, 3) + .5 * nod, rot: tr([[0, 2], [P.chinDown, -1, 6]], f), head: tr([[0, P.headKeys[0]], [0, P.headKeys[1], 2], [P.chinDown, P.headKeys[2], 5], [P.land, P.headKeys[3], 4]], f) + nod, shrug: [0, 14 * up],
      hands: [{ lx: B.hands[0][0], ly: B.hands[0][1], bow: B.bow }, { lx: hx, ly: hy, bow: B.bow - .25 * up, over: up > .5 }], held: P.tuck ? [{ hand: 0, svg: P.tuck(P.tuckAngle + ring(f, P.land, 4, 8)) }] : [] }); }; }
export default makeToldYou;
