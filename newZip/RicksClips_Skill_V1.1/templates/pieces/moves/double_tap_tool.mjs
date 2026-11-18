// PIECE 4: THE EXACT DOUBLE TAP WITH A HELD TOOL (side view): the tool's tip lands ON one point twice, on two words.
// Source: episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs lines 36-56 (m_hook: the slide rule taps the one clean cowl). Film: S1 act at f0, taps at f108 ("clean") and f117 ("spot"),
// hand_at f0-141 = the tap point, camera kicks 0.3 and 0.4, the set's answer: a glint on the metal 3 f before each tap (event cowl_glint).
// ORDER OF EVENTS (frames from the move's start, armor values):
//   0-8 dead still, the tip ON the spot · 8-15 the free hand to his hat brim (he reads the thing) · hold ·
//   60-66 COUNTER: the tool is drawn back and up a hand's width, he goes higher on his toes · 66-103 HOLD (the long hold makes the tap exact) ·
//   104-108 STRIKE (4 f), CONTACT f108 · 109-112 the tip lifts a hand · 114-117 second STRIKE (3 f), CONTACT f117 · dips 7 and 9 px (3 f) · the tool quivers 5 and 9 f · DEAD STILL on the tap.
// BODY MECHANICS: the fist is SOLVED so the tip sits on the point (two circles: arm round the shoulder, tool round the point; the lower crossing). ch.tgt = the point (film hand_at).
// WHAT MUST CHANGE FOR A NEW STORY: the tool and its length, the thing tapped and its answer (glint, ring of sound, dent), the two words, how far the counter goes (a nervous man: small; a show-off: big),
// what the free hand does while he reads, tiptoe or flat feet (on a ladder tread: tiptoe 0), and the hold length (it is the gap between the words).
import { F, D2R, tr, dip, arcUp, ring, H, fistFor, barProp } from '../motion_core.mjs';
const sin = Math.sin, cos = Math.cos;

export const ARMOR = {
  tiptoe: 1,                      // 1 = on tiptoe the whole move (on the briefcase); 0 = soles flat (ladder tread)
  toolLen: 156,                   // px from the fist to the tool's tip
  armShare: .93,                  // share of the arm length used (the elbow stays a little bent)
  read: 8,                        // the free hand goes to the hat brim (7 f)
  counter: 60,                    // counter-move starts (6 f)
  strike1: 104, n1: 4,            // first strike starts; frames to contact (f108)
  liftAt: 109, liftK: .45,        // the tip lifts between the taps, this share of the counter
  strike2: 114, n2: 3,            // second strike; contact f117
  dips: [7, 9], rings: [[7, 5], [10, 9]],   // px body dip per tap; [deg, frames] the tool quivers after each tap
  back: [70, 46], backDeg: 30,    // how far the fist goes back and up in the counter (px), and the tool's angle change
  restAngle: -40,                 // tool angle if there is no target
  feet: [-24, 26],
  tool: barProp(156),
};

export function makeDoubleTap(over = {}) { const P = { ...ARMOR, ...over }, TC = P.counter, S1 = P.strike1, K1 = S1 + P.n1, TL = P.liftAt, S2 = P.strike2, K2 = S2 + P.n2;
  return function doubleTap(t, ch) { const f = F(t), T = ch.tgt;
    const c = tr([[0, 0], [TC, 1, 6], [S1, 0, P.n1], [TL, P.liftK, 3], [S2, 0, P.n2]], f), tip = P.tiptoe + .22 * c;      // c = how far the counter is out (0 = tip on the point)
    const y = -50 * tip + dip(f, K1, P.dips[0], 3) + dip(f, K2, P.dips[1], 3), rot = tr([[0, 6], [TC, 0, 6], [S1, 8, P.n1], [TL, 6, 3], [S2, 9, P.n2], [K2 + 1, 6, 8]], f);
    const piv = [0, ch.hipY + y], r = rot * D2R, sx = 8, sy = ch.sh[1] + y - piv[1], shW = [piv[0] + sx * cos(r) - sy * sin(r), piv[1] + sx * sin(r) + sy * cos(r)];
    let g = [120, 500], aT = P.restAngle;
    if (T) { g = fistFor(shW, T, ch.armL * P.armShare, P.toolLen); aT = Math.atan2(T[1] - g[1], T[0] - g[0]) / D2R; }
    const ang = aT - P.backDeg * c + ring(f, K1, P.rings[0][0], P.rings[0][1]) + ring(f, K2, P.rings[1][0], P.rings[1][1]);
    const h1 = { wx: g[0] - P.back[0] * c, wy: g[1] - P.back[1] * c - arcUp(f, S1, P.n1, 14) - arcUp(f, S2, P.n2, 8), bow: .3, over: true };
    const h0 = tr([[0, [.08, .93]], [P.read, [.5, -.52], 7], [TC, [-.34, .62], 6], [S1, [.1, .93], 6]], f);
    return { view: 'side', dir: 1, x: 0, y, rot, feet: [{ x: P.feet[0], lift: 46 * tip, toe: -40 * tip }, { x: P.feet[1], lift: 46 * tip, toe: -40 * tip }], hands: [{ ...H([h0[0], h0[1], .5]), over: f > P.read + 1 && f < TC + 2 }, h1],
      head: tr([[0, -5], [P.read, -9, 6], [TC, -14, 6], [S1, -3, 4]], f), held: [{ hand: 1, svg: P.tool(ang - rot), wrap: ang - rot }] }; }; }   // the kit turns a drawn prop with the body's lean: its angle is given minus the lean
export default makeDoubleTap;
