// PIECE 14: MANY SMALL THINGS THAT FLY AND HIT (the pins shot into the paper like bullets). Also the timetable half of PIECE 15 (the "hundreds" storm).
// Source: episodes/armor-no-holes/sets_merged/hangar.js lines 597-636 (film.json key pin_fire; first written in armor-pins-test/sets/hangar.js). Film: pins stretch,
// bursts f183/196/205 (13, 9, 14 pins, one per frame), singles f219, 222, 226, the tail volley f307-338 (30 f, the last one alone on its word), the storm f353-406 in three waves
// (build_film.py lines 17-22 and 59-60, frames before the 18 f shift).
// THIS FILE IS THE TECHNIQUE AS NUMBERS: no three.js in it. A set module calls these per frame and puts the numbers on ITS OWN meshes (instanced heads, shanks, shadows, streaks, dust points).
// The rule (CB_RULES section 10): things that go in, on or at something FLY there and HIT: flight with a streak, a one-frame hit, a mark, a quiver, dust, and the thing hit shudders. Nothing just appears.
// WHAT MUST CHANGE FOR A NEW STORY: the thing (pin, arrow, raindrop, coin, stamp) and so its flight time and arc; where it comes from (a real muzzle point in a real hand, on the frame the hand fires);
// the mark it leaves; the quiver (a pin quivers, a coin spins down, a stamp does not move); the dust colour; what shudders (paper on a board here); the order they land in (it tells the story:
// here along the wing from his side, then rows top to bottom, then everything).

export const ARMOR = {
  fly: 5,                 // frames of flight
  arc: .06,               // m the path rises above the straight line at its middle
  streak: 1.7,            // the streak is this many frames of travel long, tapered to nothing behind the head
  flyScale: 1.25,         // head size in flight (x normal)
  hitScale: [1.7, 1.2],   // head size on the hit frame and the frame after, then 1
  quiver: { first: 16, amp: 14, decay: 5.5, swing: 3, frames: 16 },   // deg on the hit frame; then amp * exp(-d / decay) * cos(pi * d / swing); dead still after `frames`
  mark: [2.6, 1.8, 1.3],  // size of the dimple or shadow ring on hit frame, +1, +2, then 1
  flash: { frames: 8, hit: 1.25, k: .8, colour: [1, .8, .42] },      // the head lights up warm on the hit and dies over 8 f
  dust: { frames: 9, motes: 3, speed: [.012, .01], rise: [.015, .012], fall: .0016 },
  shake: { frames: 12, decay: 3.5, gain: .45, max: 1.6, amp: [.0045, .0035], freq: [2.4, 3.1] },   // the board under the hits
};

// 1. THE TIMETABLE: a hit frame for every thing. groups (in the order they are fired):
//    { kind: 'burst', f0, n }                 one per frame from f0 (f0 = the frame the first one LEAVES the hand)
//    { kind: 'single', f }                    one, alone (on a word)
//    { kind: 'volley', f0, n, frames, last }  n spread evenly over `frames`, the last one alone at frame `last`
//    { kind: 'storm', f0, f1, n, waves }      n in `waves` waves over f0..f1 (each wave fills 86 % of its third, then a breath)
//    { kind: 'hand', f }                      put in by hand: it does not fly (no flight, no streak), it is IN at frame f
// Returns [{ leave, hit, flies }] in firing order. hit = leave + fly.
export function timetable(groups, fly = ARMOR.fly) { const out = [];
  for (const g of groups) {
    if (g.kind === 'hand') out.push({ leave: g.f, hit: g.f, flies: false });
    else if (g.kind === 'burst') for (let j = 0; j < g.n; j++) out.push({ leave: g.f0 + j, hit: g.f0 + j + fly, flies: true });
    else if (g.kind === 'single') out.push({ leave: g.f, hit: g.f + fly, flies: true });
    else if (g.kind === 'volley') for (let j = 0; j < g.n; j++) { const lv = j === g.n - 1 && g.last != null ? g.last : g.f0 + Math.floor(j * (g.frames || g.n) / g.n); out.push({ leave: lv, hit: lv + fly, flies: true }); }
    else if (g.kind === 'storm') { const W = g.waves || 3; for (let j = 0; j < g.n; j++) { const u = j / g.n, w = Math.floor(u * W), uu = u * W - w, lv = Math.round(g.f0 + (w + uu * .86) / W * (g.f1 - g.f0)); out.push({ leave: lv, hit: lv + fly, flies: true }); } }
  } return out; }

// 2. ONE THING ON ONE FRAME. d = frame - hit frame. from = the muzzle point, to = where it sticks ([x, y, z], z up). lean = [ux, uy, k]: the direction it leans in the surface and how lively it is
//    (armor: a random direction and k = 0.6..1.4 per pin, so no two quiver alike). Returns null before it leaves.
export function thingAt(d, from, to, lean = [1, 0, 1], P = ARMOR) { const FLY = P.fly;
  if (d < -FLY || (d < 0 && !from)) return null;
  if (d < 0) { const u = (d + FLY) / FLY, u0 = Math.max(0, u - P.streak / FLY), at = v => [from[0] + (to[0] - from[0]) * v, from[1] + (to[1] - from[1]) * v, from[2] + (to[2] - from[2]) * v + P.arc * Math.sin(Math.PI * v)];
    return { state: 'flight', head: at(u), tail: at(u0), scale: P.flyScale };                                   // draw the thing nose first at head, and a tapered streak from head back to tail
  }
  const Q = P.quiver, q = d < Q.frames ? (d === 0 ? Q.first : Q.amp * Math.exp(-d / Q.decay) * Math.cos(Math.PI * d / Q.swing)) * lean[2] : 0;
  return { state: d === 0 ? 'hit' : d < Q.frames ? 'quiver' : 'still', quiverDeg: q, scale: d === 0 ? P.hitScale[0] : d === 1 ? P.hitScale[1] : 1, mark: d < P.mark.length ? P.mark[d] : 1,
    flash: d < P.flash.frames ? (d === 0 ? P.flash.hit : (1 - d / P.flash.frames) ** 2 * P.flash.k) : 0,     // multiply P.flash.colour by this, additive
    shake: d < P.shake.frames ? Math.exp(-d / P.shake.decay) : 0,                                              // add up over all things, then boardShake()
    dust: d < P.dust.frames ? Array.from({ length: P.dust.motes }, (_, k) => { const sp = P.dust.speed[0] + P.dust.speed[1] * k; return { out: sp * d, up: P.dust.rise[0] + P.dust.rise[1] * d, fall: P.dust.fall * d * d, angleStep: k * 2.1 }; }) : [] }; }

// 3. THE THING THAT IS HIT SHUDDERS: sum of thingAt().shake over all things -> an offset in the surface's plane (m). Everything stuck in it rides on the same offset.
export function boardShake(f, shakeSum, P = ARMOR) { const S = P.shake, sk = Math.min(S.max, shakeSum * S.gain); return [Math.sin(f * S.freq[0]) * S.amp[0] * sk, Math.cos(f * S.freq[1]) * S.amp[1] * sk]; }

// 4. THE COUNT: how many are IN on frame f (drives a counter plate that is part of the set: armor had a three-digit plate on the wall and a small one on the sheet for the close-up).
export const countIn = (f, table) => table.reduce((n, x) => n + (f >= x.hit ? 1 : 0), 0);

// ARMOR EXAMPLE (the pins stretch; N1 = 40 pins of the first plane, then the tail, then the storm). The set sorted WHICH pin takes which slot: the first forty along the wing from his side to the
// far tip (the one nearest his hand first, by hand), the tail rows top to bottom, the storm at random.
export const ARMOR_GROUPS = [{ kind: 'hand', f: 90 }, { kind: 'burst', f0: 183, n: 13 }, { kind: 'burst', f0: 196, n: 9 }, { kind: 'burst', f0: 205, n: 14 }, { kind: 'single', f: 219 }, { kind: 'single', f: 222 }, { kind: 'single', f: 226 },
  { kind: 'volley', f0: 307, n: 90, frames: 30, last: 338 }, { kind: 'storm', f0: 353, f1: 406, n: 300, waves: 3 }];
