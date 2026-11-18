// PIECE 1: THE HOP ONTO A BOX (and, if the story wants it, a second stretched hop that taps something overhead with a held tool).
// Source: episodes/armor-no-holes/stretches/armor-pins-test/cast/ep_pins.mjs lines 41-62 (m_hop_tap, the rewritten hop). Film: act at f18 of the pins stretch (build_film.py line 88).
// ORDER OF EVENTS (frames from the move's start, armor values):
//   0-5 CROUCH, both arms swing back, head down to the box · 5-12 JUMP on a clear arc, arms thrown forward and up, legs TUCK (the FILM lifts the card onto the box over the same frames) ·
//   12-15 LANDING SQUASH, arms out for balance · 15-20 rebound past standing · 16-27 WOBBLE dying out · f22 the head tips up (he sees the thing overhead) ·
//   27-31 second crouch, tool arm down and back · 31-37 HOP stretched to the toes, the tool tip TAPS at the top (f37) · 37-43 fall, tool arm whips over the head · 43-46 squash · settle.
// WHAT MUST CHANGE FOR A NEW STORY: the box height (the film's card lift, not in here), who hops (crouch depth, squash and wobble: a heavy man squashes deeper and wobbles less),
// the tool and why he taps, the look-up frame (it is the frame he SEES the thing), or tapHop: null for a plain hop.
import { F, PI, tr, ring, H, barProp } from '../motion_core.mjs';
const sin = Math.sin;

export const ARMOR = {
  startY: 12, startRot: 3,          // the pose the move is entered from (here: the end of his walk-in)
  crouchEnd: 5,                     // A: frame the feet leave the ground
  land: 12,                         // B: frame the feet land on the box
  crouch: 100, rise: 150,           // px the body sinks in the crouch; px it rises over the straight line at the top of the jump
  tuck: [215, 235],                 // px each foot lifts in the air (far, near): the legs tuck
  squash: 96, rebound: -16,         // landing: px down in 3 f, px past standing in the next 5 f
  wobble: 7,                        // deg, the see-saw after landing (dies out with exp(-f/5))
  lookUp: 22,                       // frame the head tips up
  tapHop: { takeoff: 31, top: 37, land: 43, height: 400, crouch: 86, squash: 84, rebound: -8, wobble: 4 },   // or null
  feet: [-24, 26],
  tool: barProp(156),               // (angleDeg) => (x, y) => svg; the armor film: his slide rule
};

export function makeHop(over = {}) { const P = { ...ARMOR, ...over }, A = P.crouchEnd, B = P.land, T2 = P.tapHop, BIG = 1e9, C = T2 ? T2.takeoff : BIG, D = T2 ? T2.top : BIG, E = T2 ? T2.land : BIG, JH = T2 ? T2.height : 0;
  const two = (a, b) => T2 ? a.concat(b) : a;
  return function hop(t, ch) { const f = F(t);
    let y = tr([[0, P.startY], [0, P.crouch, A]], f), lift = [0, 0], air = 0;
    if (f > A && f <= B) { const u = (f - A) / (B - A), sn = sin(PI * u); y = P.crouch * (1 - u) * (1 - u) - P.rise * sn; lift = [P.tuck[0] * Math.pow(sn, .8), P.tuck[1] * Math.pow(sin(PI * Math.min(1, u * 1.12)), .8)]; air = 1; }
    if (f > B && f <= C) y = tr(two([[B, 0], [B, P.squash, 3], [B + 3, P.rebound, 5], [B + 8, 0, 6]], T2 ? [[C - 4, T2.crouch, 4]] : []), f);
    if (T2) {
      if (f > C && f <= D) { const u = (f - C) / (D - C), a = JH * (1 - (1 - u) * (1 - u)); y = T2.crouch * Math.max(0, 1 - u * 3) - a; lift = [a, a]; air = 2; }      // up: fast off the toes, slowing to the top
      if (f > D && f <= E) { const u = (f - D) / (E - D), a = JH * (1 - u * u); y = -a; lift = [a, a * (1 + .12 * sin(PI * u))]; air = 2; }                            // down: slow off the top, fast into the box
      if (f > E) y = tr([[E, 0], [E, T2.squash, 3], [E + 3, T2.rebound, 5], [E + 8, 0, 7]], f); }
    const w = f > B + 3 && f < C - 4 ? P.wobble * Math.exp(-(f - B - 3) / 5) * sin((f - B - 3) * 1.25) : 0, w2 = T2 && f > E + 3 ? T2.wobble * Math.exp(-(f - E - 3) / 4) * sin((f - E - 3) * 1.3) : 0;
    // THE ACTING (lean, both hands, tool angle, head). These key values are the armor mathematician's; keep the ORDER and the frame anchors, retune the amounts for another body.
    const rot = tr(two([[0, P.startRot], [0, 17, 5], [A, -11, 5], [B, 12, 3], [B + 3, -7, 5], [B + 8, 0, 6]], [[C - 4, 13, 4], [C, -8, 6], [D + 1, -15, 5], [E, 7, 3], [E + 3, -10, 5], [E + 9, 0, 8]]), f) + w + w2;
    const h1 = tr(two([[0, [.14, .62]], [0, [-.62, .5], 5], [A, [.62, -.22], 7], [B, [.88, .04], 3], [B + 8, [.3, .45], 7]], [[C - 4, [-.46, .7], 4], [C, [.66, -.7], 6], [D + 1, [.16, -.56], 4], [E, [.62, .08], 3], [E + 5, [.3, .42], 9]]), f);
    const h0 = tr(two([[0, [.1, .93]], [0, [-.72, .44], 5], [A + 1, [.55, -.1], 7], [B, [-.86, -.02], 3], [B + 9, [.1, .9], 7]], [[C - 4, [-.4, .76], 4], [C + 1, [.3, .2], 6], [D + 1, [-.56, -.12], 4], [E, [-.6, .1], 3], [E + 6, [.08, .93], 9]]), f);
    const ang = tr(two([[0, -58], [0, 34, 5], [A, -30, 7], [B, -8, 3], [B + 8, -34, 7]], [[C - 4, 42, 4], [C, -70, 6], [D + 1, -128, 4], [E, -40, 3], [E + 5, -34, 9]]), f) + (T2 ? ring(f, D, 14, 8) : 0) + 2.5 * w;
    const head = tr(two([[0, -2], [0, 12, 5], [A, -8, 5], [B, 13, 3], [B + 3, -4, 5], [P.lookUp, -17, 4]], [[C - 4, -8, 4], [C, -19, 5], [D + 1, 9, 4], [E, 11, 3], [E + 4, -13, 8]]), f - 1) - .6 * w;
    const tuck = air === 1 ? sin(PI * (f - A) / (B - A)) : 0, pt = air === 2;
    return { view: 'side', dir: 1, x: 0, y, rot, feet: [{ x: P.feet[0] + 14 * tuck + (pt ? 8 : 0), lift: lift[0], toe: pt ? -35 : -20 * tuck }, { x: P.feet[1] - 4 * tuck - (pt ? 8 : 0), lift: lift[1], toe: pt ? -30 : 24 * tuck }],
      hands: [H([h0[0], h0[1] + .014 * w, .3]), H([h1[0], h1[1] - .014 * w, .3])], head, held: P.tool ? [{ hand: 1, svg: P.tool(ang), wrap: ang }] : [] }; }; }
export default makeHop;
