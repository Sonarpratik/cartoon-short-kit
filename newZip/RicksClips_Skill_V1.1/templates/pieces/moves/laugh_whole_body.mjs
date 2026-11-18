// PIECE 2: THE HELPLESS LAUGH WITH THE WHOLE BODY (side view), ending in a slap on his own knee.
// Source: episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs lines 131-146 (c_laugh). Film: S1 act at f243, the knee slap lands on the word "laughing" (f273); faces k:holdBreath f251, k:bellyLaugh f258.
// ORDER OF EVENTS (frames from the move's start, armor values):
//   7-14 it starts in the belly: shoulders creep up, a small shake · 14-19 HEAD THROWN BACK, the far arm flung out behind, the belly bouncing on a 4 f beat ·
//   22-25 the free hand goes UP (counter) · 25-29 he DOUBLES OVER, the hand comes down · 30 SLAP ON THE KNEE (contact) · 30-34 dip ·
//   he hangs there shaking, the hand on the knee; the shakes die out over 16 f · still.
// The hips go BACK over planted feet when he doubles over (hipsBack), or the head leaves the card drawing and is cut by its edge.
// WHAT MUST CHANGE FOR A NEW STORY: who laughs and at what (a thin man folds further and shakes faster; a child jumps instead), what the far hand holds (or nothing),
// what the slap lands on (knee, table, a friend's back), the word the contact sits on, and the face steps in the film (held breath, then the open laugh, on the word).
import { F, PI, G, snap, tr, dip, mix2, barProp } from '../motion_core.mjs';
const sin = Math.sin;

export const ARMOR = {
  shakeStart: 7,                 // the laugh starts in the belly
  throwBack: 14,                 // head back (5 f)
  handUp: 22,                    // the free hand goes up (3 f): the counter-move of the slap
  doubleOver: 25,                // he folds (5 f)
  slap: 30,                      // contact frame: put it on the word
  dipN: 4, dipAmp: 10,
  beatPeriod: 4,                 // frames per belly bounce
  beatAmp: [5, 12, 9],           // px: starting, head back, doubled over
  dieOut: 16, beatEnd: 60,       // the shakes die out over this many frames after the dip; nothing moves after beatEnd
  drop: 84,                      // px the body sinks when doubled over
  overDeg: 32, hipsBack: 200,    // lean when doubled over; px the hips go back (armor: 150 px and 36 deg cut his cap at the card edge)
  backDeg: 15,
  kneeX: 74,
  feet: [-52, 58],
  farAngle: -118,                // the far hand's tool at rest (armor: the chalk stick on his shoulder)
  farTool: barProp(460),         // or null: then the far arm only swings
};

export function makeLaugh(over = {}) { const P = { ...ARMOR, ...over }, T0 = P.shakeStart, TB = P.throwBack, TU = P.handUp, TO = P.doubleOver, TS = P.slap, TE = TS + P.dipN;
  return function laugh(t, ch) { const f = F(t), S = ch.sh[1], L = ch.armL, sh = f > T0 && f < TB ? (f - T0) / (TB - T0) : 0, back = tr([[0, 0], [TB, 1, 5], [TO, 0, 4]], f), over = tr([[0, 0], [TO, 1, 5]], f);
    const beat = f > T0 && f < P.beatEnd ? Math.abs(sin(PI * f / P.beatPeriod)) * (f < TB ? P.beatAmp[0] * sh : f < TO ? P.beatAmp[1] : P.beatAmp[2] * Math.max(0, 1 - (f - TE) / P.dieOut)) : 0;
    const kneeX = P.kneeX, kneeY = (ch.hipY + P.drop + G) / 2 - 30; let hk = 0;
    if (f > TO && f <= TS) hk = snap(f - TO, TS - TO); else if (f > TS && f <= TE) hk = 1 - .5 * sin(PI * (f - TS) / P.dipN); else if (f > TE) hk = 1;      // the hand bounces half way off the knee and comes back
    const upP = [L * .55, S - L * .55 + P.drop * over], hN0 = mix2([34, ch.hipY - 26], [L * .8, S - L * .25], back), cnt = tr([[0, 0], [TU, 1, 3]], f), nearW = f < TU ? null : mix2(mix2(hN0, upP, cnt), [kneeX, kneeY], hk);
    const y = P.drop * over + beat + dip(f, TS, P.dipAmp, P.dipN) - 10 * back, rot = 6 * snap(f, 4) * (1 - back) - P.backDeg * back + P.overDeg * over + 3 * sh * sin(f * 1.7);
    const sa = P.farAngle + 3 * sh * sin(f * 1.7) - 40 * back + 122 * over, fs = mix2(mix2([.2 * L + 8, S + .12 * L], [-.55 * L, S + .0 * L], back), [.5 * L, S + .55 * L + P.drop], over);
    const xb = -P.hipsBack * over;
    return { view: 'side', dir: 1, x: xb, y, rot, feet: [{ x: P.feet[0] - xb }, { x: P.feet[1] - xb }], shrug: 22 * sh + 14 * back,
      hands: [{ wx: fs[0], wy: fs[1] + beat, bow: .4 }, nearW ? { wx: nearW[0], wy: nearW[1], bow: .5 } : { lx: hN0[0], ly: hN0[1], bow: .9 * (1 - back) + .4 * back }],
      head: tr([[0, -15], [0, 8, 4], [TB, -24, 4], [TO, 20, 5]], f - 1) + .3 * beat, held: P.farTool ? [{ hand: 0, svg: P.farTool(sa), wrap: sa }] : [] }; }; }
export default makeLaugh;
