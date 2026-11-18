// PIECE 6: "I GOT IT": the realisation, a change of FACE first and body second, almost nothing moving (side view).
// Source: episodes/armor-no-holes/stretches/armor-pins-test/cast/ep_pins.mjs lines 208-213 (m_realise, entered from m_stare: he has been dead still, staring up at the bare spots).
// Film: pins stretch build_film.py lines 118-120 (frames before the 18 f shift): move at f594 with face k:browUp, face k:think at f604 (the eyes narrow), face k:halfSmile at f612;
// the camera is on its last gentle push to his face (station at f639, travel 1.0 s).
// ORDER OF EVENTS (frames from the move's start, armor values): 0-4 the head LIFTS 4 deg, the eyes widen (film face) · 4-10 HOLD · 10-18 the head tilts back down 13 deg, the tool comes up,
//   its tip finds his chin · 18 the half-smile (film face) · 21-23 and 26-28 two small taps on the chin · 30-37 one tiny nod · DEAD STILL.
// It works because of what is NOT there: no jump, no finger in the air, no light bulb. The stillness before it (the stare) is part of the piece.
// WHAT MUST CHANGE FOR A NEW STORY: what he has been staring at and for how long, the three faces and their frames (on the words), the thinking gesture (this man taps his chin with
// his slide rule; another bites a pencil, pushes his cap back, stops chewing), and how big the body answer is for this character (a loud character may straighten; this one nods once).
import { F, PI, snap, tr, dip, H, barProp } from '../motion_core.mjs';
const sin = Math.sin;

export const ARMOR = {
  headFrom: -20, headLift: -24, headDown: -11,   // head angle: in the stare, lifted (4 f), tilted to think (from toolUp, 7 f)
  toolUp: 10, toolUpN: 9,                        // the tool comes up to the chin
  taps: [21, 26], tapN: 3,                       // two small taps of the tip on the chin
  nod: [30, 37], nodDeg: 7,                      // one tiny nod
  toolFrom: 78, toolTo: -96,                     // tool angle: hanging lowered, tip at the chin
  feet: [-22, 26],
  tool: barProp(156),
};

export function makeGotIt(over = {}) { const P = { ...ARMOR, ...over };
  return function gotIt(t, ch) { const f = F(t), up = tr([[0, 0], [P.toolUp, 1, P.toolUpN]], f), tap = P.taps.reduce((s, a) => s + dip(f, a, 1, P.tapN), 0), nod = f > P.nod[0] && f < P.nod[1] ? sin(PI * (f - P.nod[0]) / (P.nod[1] - P.nod[0])) : 0;
    const ang = P.toolFrom + (P.toolTo - P.toolFrom) * up - 5 * tap;
    return { view: 'side', dir: 1, x: 0, y: -4 * snap(f, 5) + 3 * nod, rot: -3 + 2 * snap(f, 5) - 2 * up, feet: [{ x: P.feet[0] }, { x: P.feet[1] }], hands: [H([.05, .93]), H([.08 + .1 * up, .94 - .5 * up - .03 * tap, .3])],
      head: tr([[0, P.headFrom], [0, P.headLift, 4], [P.toolUp, P.headDown, 7]], f) + P.nodDeg * nod, held: P.tool ? [{ hand: 1, svg: P.tool(ang), wrap: ang }] : [] }; }; }
export default makeGotIt;
