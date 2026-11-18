// EPISODE MOVES for stretch S1 (lines 1-3 of "Armor Where Nobody Shot": the hook, the last chalk ring and the laugh, the tire joke), animator 2026-11-14.
// One ACTION = one MOVE: pose(t, ch) draws the body new on every frame (film.json "tween": { "ones": true }), built as a STUDIO MOTION sequence:
// NOTICE, READ, counter-move, HOLD, STRIKE (snap table 5, 16, 31, 48, 66, 79, 88 %), IMPACT dip, SETTLE, then DEAD STILL (the tracks hold their last value).
// Loaded with no kit change: this file sits in the puppet_pkg folder "cast", pose id "m:../../ep_s1/<style>[+props]".
// Frames in the comments are frames from the move's own start (f = t * 30). All moves are drawn facing +x (dir 1); the film mirrors the card.
import { cycle } from './motion/rig.mjs';
const INK = '#2a1a1f', PI = Math.PI, sin = Math.sin, cos = Math.cos, D2R = PI / 180;
const SN = [0, .05, .16, .31, .48, .66, .79, .88, .93, .96, .98, .99, 1];
const snap = (f, n = 12) => { if (f <= 0) return 0; const u = f * 12 / n; if (u >= 12) return 1; const i = Math.floor(u); return SN[i] + (SN[i + 1] - SN[i]) * (u - i); };
// track: keys [[f0, value, n]]: the first key is the start value; from frame f0 the value SNAPS to `value` over n frames (default 12, 66 % after 5), then is dead still
function tr(keys, f) { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [f0, to, n = 12] = keys[i]; if (f <= f0) break; const u = snap(f - f0, n); v = Array.isArray(to) ? v.map((a, j) => a + (to[j] - a) * u) : v + (to - v) * u; } return v; }
const dip = (f, f0, amp = 8, n = 4) => f > f0 && f < f0 + n ? amp * sin(PI * (f - f0) / n) : 0;          // IMPACT: the body dips and comes back in 3-4 f
const arcUp = (f, f0, n, amp) => f > f0 && f < f0 + n ? amp * sin(PI * snap(f - f0, n)) : 0;             // hands travel on an arc inside a strike
const ring = (f, f0, amp, n = 10) => f > f0 && f < f0 + n ? amp * Math.exp(-(f - f0) / 3) * sin((f - f0) * 2.1) : 0;   // SETTLE: a part rebounds and comes to rest
const H = (a) => ({ f: a[0], d: a[1], bow: a[2] ?? .45 });
const F = t => Math.round(t * 30 * 100) / 100;
const G = 1010;                                                   // the rig's ground line

// ---------- drawn hand props (they sit AT the fist) ----------
const rule = (ang) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-52" y="-9" width="200" height="18" rx="4" fill="#fff9e6" stroke="${INK}" stroke-width="6"/><rect x="-44" y="-17" width="200" height="34" rx="6" fill="#efe2b8" stroke="${INK}" stroke-width="8"/><rect x="-48" y="-7" width="200" height="14" rx="3" fill="#fff9e6" stroke="${INK}" stroke-width="4"/>`
    + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M${-30 + k * 22},-15 v8" stroke="${INK}" stroke-width="3"/>`).join('') + `<rect x="60" y="-21" width="22" height="42" rx="4" fill="none" stroke="#b08a2e" stroke-width="7"/></g>`;
const RULE_TIP = 156;                                             // px from the fist to the tip along the rule
const CH_L = 86;                                                  // the Chief's big stick of chalk: px from the fist to its tip
const chalk = (ang) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-10" y="${-CH_L}" width="20" height="${CH_L + 14}" rx="6" fill="#fbfbf4" stroke="${INK}" stroke-width="6"/><path d="M-10,${-CH_L + 16} h20" stroke="#d9d6c8" stroke-width="3"/></g>`;
// the rubber patch in his palm: a red-brown oval with a pale rim and cross-hatch (the same patch the set shows on the tire after the slap)
const patch = (ang, k = 1) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${k.toFixed(2)})"><ellipse cx="0" cy="-8" rx="66" ry="50" fill="#a23a2a" stroke="${INK}" stroke-width="8"/><ellipse cx="0" cy="-8" rx="46" ry="33" fill="none" stroke="#e8b9a0" stroke-width="5"/><path d="M-22,-26 l44,36 M22,-26 l-44,36" stroke="#e8b9a0" stroke-width="5"/></g>`;

// a walk whose planted foot does not slide: v = card speed in rig px per second (the film moves the card at the same speed, "linear": true)
function walker(t, v, Tstep, o = {}) { const S = v * Tstep, c = cycle(t, { T: Tstep, S, duty: o.duty ?? .58, swing: u => ({ lift: (o.lift ?? 46) * sin(PI * u), toe: -18 + 40 * u }) });
  return { c, feet: c.feet.map(ft => ({ ...ft, x: ft.x - c.bx - S * .5 })), bob: sin(PI * c.p) ** 2, sw: cos(2 * PI * c.stride) }; }

// =====================================================================================================================
// THE MATHEMATICIAN: small, even, exact; a short stop before each move; the rule is always in his near fist
// =====================================================================================================================
const A_TAP = -40;
// THE HOOK, on the upended briefcase, on tiptoe, the rule tip ON the spotless cowl from frame 0.
// 0-8 dead still on the spot · 8-15 one finger to his hat brim (he reads the metal) · hold ·
// 60-66 COUNTER: the rule is drawn back and up a hand's width, higher on his toes · 66-103 HOLD (tongue out) · 104-108 STRIKE: TAP, ON the cowl at f108 (clean) · 109-112 the tip lifts a hand · 114-117 TAP again, ON the cowl at f117 (spot) ·
// 107-110 dip · the rule quivers 9 f · DEAD STILL on the tap (the panel falls behind him: he does not turn)
function m_hook(t, ch, TK = 1) { const f = F(t), T = ch.tgt;   // TK 1 = on tiptoe (on the briefcase); TK 0 = soles flat on a ladder tread (heels lift a little only in the counter)
  const c = tr([[0, 0], [60, 1, 6], [104, 0, 4], [109, .45, 3], [114, 0, 3]], f), tip = TK + .22 * c;
  const y = -50 * tip + dip(f, 108, 7, 3) + dip(f, 117, 9, 3), rot = tr([[0, 6], [60, 0, 6], [104, 8, 4], [109, 6, 3], [114, 9, 3], [118, 6, 8]], f);
  // fix round 3, BODY MECHANICS: the fist is SOLVED so the rule tip sits ON the tap point. Shoulder (after the lean) and tap point are the centres of two circles, arm length and rule length their radii;
  // the fist is their lower crossing (under the chin, clear of his face), the rule runs from it to the point. Out of reach = the arm goes straight at it (and the film must move him closer).
  const piv = [0, ch.hipY + y], r = rot * D2R, sx = 8, sy = ch.sh[1] + y - piv[1], shW = [piv[0] + sx * cos(r) - sy * sin(r), piv[1] + sx * sin(r) + sy * cos(r)];
  let g = [120, 500], aT = A_TAP;
  if (T) { const R1 = ch.armL * .93, R2 = RULE_TIP, dx = T[0] - shW[0], dy = T[1] - shW[1], d = Math.hypot(dx, dy) || 1;
    if (d < R1 + R2 - 1 && d > Math.abs(R1 - R2) + 1) { const q = (R1 * R1 - R2 * R2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R1 * R1 - q * q)), mx = shW[0] + q * dx / d, my = shW[1] + q * dy / d, c1 = [mx - h * dy / d, my + h * dx / d], c2 = [mx + h * dy / d, my - h * dx / d]; g = c1[1] > c2[1] ? c1 : c2; }
    else g = [shW[0] + dx / d * R1, shW[1] + dy / d * R1];
    aT = Math.atan2(T[1] - g[1], T[0] - g[0]) / D2R; }
  const ang = aT - 30 * c + ring(f, 108, 7, 5) + ring(f, 117, 10, 9);
  const h1 = { wx: g[0] - 70 * c, wy: g[1] - 46 * c - arcUp(f, 104, 4, 14) - arcUp(f, 114, 3, 8), bow: .3, over: true };
  const h0 = tr([[0, [.08, .93]], [8, [.5, -.52], 7], [60, [-.34, .62], 6], [104, [.1, .93], 6]], f);
  return { view: 'side', dir: 1, x: 0, y, rot, feet: [{ x: -24, lift: 46 * tip, toe: -40 * tip }, { x: 26, lift: 46 * tip, toe: -40 * tip }], hands: [{ ...H([h0[0], h0[1], .5]), over: f > 9 && f < 62 }, h1],
    head: tr([[0, -5], [8, -9, 6], [60, -14, 6], [104, -3, 4]], f), held: [{ hand: 1, svg: rule(ang - rot), wrap: ang - rot }] }; }   // the kit turns the drawn prop with the body's lean: its angle is given minus the lean
// HOP OFF THE CASE (the film lowers the card over 8 f from f3): 0-3 off his toes into a crouch · 3-11 hop · 11-15 landing dip · settle, the rule tucked up like a pointer
function m_hop_off(t, ch, Y0 = -50) { const f = F(t); let y = tr([[0, Y0], [0, 46, 3], [3, 0, 3], [11, 60, 3], [14, 0, 8]], f), lift = 0; if (f > 3 && f <= 11) { const u = (f - 3) / 8; y -= 60 * sin(PI * u); lift = 46 * sin(PI * u); }
  const ang = tr([[0, A_TAP], [0, -70, 6]], f);
  return { view: 'side', dir: 1, x: 0, y, rot: tr([[0, 8], [0, -6, 4], [11, 8, 3], [14, 2, 6]], f), feet: [{ x: -24, lift, toe: lift ? -20 : 0 }, { x: 26, lift: lift * .7 }], hands: [H([-.2, .8]), H([.3, .42, .3])], head: tr([[0, -3], [3, 6, 5], [14, -4, 6]], f), held: [{ hand: 1, svg: rule(ang), wrap: ang }] }; }
// SMALL EVEN STEPS under the wing, the rule up like a pointer, eyes on the holes overhead
const M_V = 630 * 1.3;                     // px/s (the film moves the card 0.98 m/s)
function m_walk(t, ch) { const w = walker(t, M_V, .2, { lift: 34 });
  return { view: 'side', dir: 1, x: 0, y: 10 + 14 * (1 - w.bob), rot: 2, feet: w.feet, hands: [H([.16 * w.sw, .93]), H([.3, .42 - .03 * w.sw, .3])], head: -10 + 2 * w.bob, held: [{ hand: 1, svg: rule(-70), wrap: -70 }] }; }
// COUNT THE HOLES OVERHEAD with the rule tip: 0-6 stops, feet set, the rule goes up · then one tick of the tip per hole (a 3 f flick up, back, 9 f still), the tip walking along the wing ·
// each tick the head nods 3 deg. (His lips count on the film's faces.) When laughed at he gets busier: the ticks come faster after f80.
function m_count(t, ch) { const f = F(t), up = tr([[0, 0], [0, 1, 7]], f), per = f < 84 ? 13 : 9, g = Math.max(0, f - 9), n = Math.floor(g / per), u = g - n * per, tick = u < 4 ? sin(PI * u / 4) : 0;
  const spot = k => ((k % 4) - 1.5) * .09, sw = spot(n) + (spot(n + 1) - spot(n)) * snap(u - (per - 4), 4);
  const ang = -70 + 22 * up + sw * 120 - 7 * tick, h1 = [.34 + (.5 + sw) * up, .42 - (.86 + .5 * sw) * up - .06 * tick];
  return { view: 'side', dir: 1, x: 0, y: tr([[0, 14], [0, 0, 6]], f) - 12 * up, rot: -5 * up, feet: [{ x: -24, lift: 14 * up, toe: -14 * up }, { x: 28, lift: 14 * up, toe: -14 * up }], hands: [H([.02, .93]), { ...H([h1[0], h1[1], .3]), over: true }], head: -15 * up - 3 * tick, held: [{ hand: 1, svg: rule(ang), wrap: ang }] }; }
// TURN TO THE CHIEF (the film flips the card on its first frame): 0-5 heels down, the rule comes down across his chest like a folded umbrella, both hands on it · settle · DEAD STILL, flat face
function m_face_him(t, ch) { const f = F(t), k = tr([[0, 0], [0, 1, 7]], f), ang = -80 + 62 * k + ring(f, 7, 5, 8);
  return { view: 'side', dir: 1, x: 0, y: -12 * (1 - k) + dip(f, 5, 5, 3), rot: -4 + 5 * k, feet: [{ x: -24 }, { x: 28 }], hands: [H([.02 + .24 * k, .93 - .21 * k, .5]), H([.84 - .7 * k, -.44 + 1.04 * k, .3])], head: -15 + 12 * k, held: [{ hand: 1, svg: rule(ang), wrap: ang }] }; }

// =====================================================================================================================
// THE CHIEF: big, fast, heavy, with a bounce; strikes in 4-5 f, bigger counter-moves.
// His chalk is bound with string to the end of a pointer stick (the wing skin is 2.2 m up): the stick is in his FAR fist the whole stretch, the near hand is free (hip, knee, patch).
// =====================================================================================================================
const ST_L = 460;                    // px from the fist to the chalk tip (0.95 m; 0.82 m left the far side of a ring out of reach)
const stick = (ang) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-74" y="-8" width="${ST_L + 30}" height="16" rx="7" fill="#b88a4a" stroke="${INK}" stroke-width="6"/><path d="M-40,-2 h${ST_L - 90}" stroke="#d6ad6e" stroke-width="3"/><rect x="${ST_L - 62}" y="-11" width="62" height="22" rx="7" fill="#fbfbf4" stroke="${INK}" stroke-width="6"/><path d="M${ST_L - 70},-10 v20 M${ST_L - 80},-10 v20 M${ST_L - 90},-10 v20" stroke="#e9dfc4" stroke-width="4"/></g>`;
const farStick = (fist, ang, extra = {}) => ({ wx: fist[0], wy: fist[1], bow: .4, ...extra });
const mix2 = (a, b, q) => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
// BODY MECHANICS helpers. shoulderAt: the side-view shoulder in the move's world coordinates after the body's lean (deg, about the hips) and offset y.
// fistFor: the fist that puts a prop's tip ON a point: the crossing of two circles (arm length round the shoulder, prop length round the point), the lower one (elbow down); out of reach = straight at it.
const shoulderAt = (ch, rotDeg, yOff) => { const r = rotDeg * D2R, py = ch.hipY + yOff, sy = ch.sh[1] - ch.hipY; return [8 * cos(r) - sy * sin(r), py + 8 * sin(r) + sy * cos(r)]; };
const fistFor = (sh, tip, R1, R2) => { const dx = tip[0] - sh[0], dy = tip[1] - sh[1], d = Math.hypot(dx, dy) || 1; if (d < R1 + R2 - 1 && d > Math.abs(R1 - R2) + 1) { const q = (R1 * R1 - R2 * R2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R1 * R1 - q * q)), mx = sh[0] + q * dx / d, my = sh[1] + q * dy / d, c1 = [mx - h * dy / d, my + h * dx / d], c2 = [mx + h * dy / d, my - h * dx / d]; return c1[1] > c2[1] ? c1 : c2; } return [sh[0] + dx / d * R1, sh[1] + dy / d * R1]; };
// THE HOOK: the chalk stick raised to the next hole, stopped in mid-air a hand under the skin, jaw down. 24-31 the stick sinks a third (he cannot believe it) ·
// 62-67 leans in, the chalk end points AT the slide rule ("that?!") · 107 the tap: he jolts back in 3 f · 120 the panel clangs down beside him: FLINCH (knees, shoulders up, near arm over his head,
// the stick clutched upright), 3 f · 128-140 comes up slowly, eyes still on the rule
function c_hook(t, ch) { const f = F(t), S = ch.sh[1], L = ch.armL, T = ch.tgt;
  let sa = tr([[0, -62], [24, -42, 7], [62, -9, 5], [108, -34, 4], [131, -84, 3], [134, -52, 6]], f) + ring(f, 67, 5, 8) + ring(f, 31, 4, 8);
  let fs = tr([[0, [.28 * L + 8, S - .2 * L]], [24, [.34 * L + 8, S + .02 * L], 7], [62, [.62 * L + 8, S + .08 * L], 5], [108, [.2 * L + 8, S - .1 * L], 4], [131, [.14 * L + 8, S + .25 * L], 3], [134, [.26 * L + 8, S + .02 * L], 6]], f);
  // fix round 3, f36-61 (the film's hand_at gives the ragged edge of the nearest hole): 36-43 the chalk end goes up to it and stops a hand short · 43-47 ON the edge at f47 ("holes") · it shivers 6 f · a second small poke at f53 · 57-62 off
  const h1 = tr([[0, [.0, .93]], [62, [.3, .55], 5], [108, [-.24, .72], 4], [131, [.24, -.56], 3], [134, [.0, .93], 6]], f);
  const y = tr([[0, 0], [62, 16, 5], [108, 0, 4], [131, 150, 3], [134, 0, 6]], f), rot = tr([[0, -4], [24, 1, 7], [38, -5, 6], [57, 1, 5], [62, 11, 5], [108, -9, 4], [131, 14, 3], [134, 0, 6]], f);
  let sd = 0;   // how much of the body's lean is taken out of the drawn stick angle: only while the chalk end is ON a point
  if (T && f > 36 && f < 62) { const k = tr([[0, 0], [36, .82, 7], [43, 1, 4], [49, .93, 2], [51, 1, 2], [57, 0, 5]], f), kb = Math.min(1, k * 1.15), g = fistFor(shoulderAt(ch, rot, y), T, L * .9, ST_L), aOn = Math.atan2(T[1] - g[1], T[0] - g[0]) / D2R;
    fs = mix2(fs, [g[0], g[1] - y], k); sa = sa + (aOn - sa) * kb + ring(f, 47, 3, 6); sd = rot * kb; }
  return { view: 'side', dir: 1, x: 0, y, rot, feet: [{ x: -44 }, { x: 50 }], hands: [farStick([fs[0], fs[1] + y], sa), { ...H([h1[0], h1[1], .5]), over: f > 131 && f < 138 }], shrug: 26 * tr([[0, 0], [131, 1, 3], [134, 0, 6]], f),
    head: tr([[0, -6], [24, 0, 6], [38, -14, 5], [57, 0, 5], [62, 7, 5], [108, -11, 4], [131, 18, 3], [134, -2, 6]], f - 1), held: [{ hand: 0, svg: stick(sa - sd), wrap: sa - sd }] }; }
// THE LAST RING, with a flourish. The film's hand_at gives the ring centre on the wing skin; the chalk END of the stick runs the same circle the set draws (one turn, 20 f).
// (CB 2026-11-14: the chalk mark is on screen at seconds 5-6.) 0-3 NOTICE: head up to the hole · 3-9 the stick goes up, the chalk stops a hand short · 10-14 the chalk goes ON the skin ·
// 14-55 THE STROKE, 41 f, so the line is seen being drawn: one round, his whole body riding the circle; it closes on "circle" · 55-62 FLOURISH: the stick whips off the skin and spins once like a baton · 62-71 it lands on his shoulder · still
function c_ring(t, ch) { const f = F(t), T = ch.tgt || [292, -63], S = ch.sh[1], L = ch.armL;
  const ap = tr([[0, 0], [3, .8, 6], [10, 1, 4]], f), fl = tr([[0, 0], [55, 1, 7]], f);   // the film's hand_at gives ONE point per frame f154-195: the head of the growing chalk line (before: its start, after: its end)
  const tip = [T[0], T[1] + 70 * (1 - ap) / .2 * (ap >= .8 ? 1 : 0)], start = [.26 * L + 8, S + .02 * L], rest = [.2 * L + 8, S + .12 * L];
  // BODY MECHANICS: the fist is the crossing of two circles, arm length round the shoulder (after the lean) and stick length round the chalk's target; the lower crossing keeps the
  // elbow down and the fist in front of his chest. The stick runs from the fist to the target. Out of reach (it is not, from where he stands) = the arm goes straight at it.
  const baseRot = tr([[0, 0], [3, -6, 5], [8, 0, 6], [55, 5, 6], [63, -2, 8]], f), yd = dip(f, 62, 8, 4), R1 = L * .9, kk = Math.min(1, ap / .8);   // a look up and back (-6), then upright for the stroke: leaning back costs reach
  const shAt = (rotDeg, rise) => { const r = rotDeg * D2R, py = ch.hipY + yd - rise, sy = S - ch.hipY; return [8 * cos(r) - sy * sin(r), py + 8 * sin(r) + sy * cos(r)]; }, far = (s) => Math.hypot(tip[0] - s[0], tip[1] - s[1]);
  // BODY-DRIVEN: where the chalk's target is beyond arm plus stick he leans in and goes up on his toes just as far as it takes (at most +10 deg and 45 px), and comes back as the line comes round to his side
  const LEAN_X = 0, reach = R1 + ST_L - 8, d0 = far(shAt(baseRot, 0)), gain = Math.max(1, d0 - far(shAt(baseRot + LEAN_X, 45))); let st = Math.max(0, Math.min(1, (d0 - reach) / gain));
  { const d1 = far(shAt(baseRot + LEAN_X * st, 45 * st)); if (d1 > reach && st < 1) st = Math.min(1, st + (d1 - reach) / gain * 1.15); } st *= kk * (1 - fl);
  const rotN = baseRot + LEAN_X * st, rise = 45 * st, shW = shAt(rotN, rise), dx = tip[0] - shW[0], dy = tip[1] - shW[1], d = Math.hypot(dx, dy) || 1; let fOn;
  if (d < R1 + ST_L - 1 && d > Math.abs(R1 - ST_L) + 1) { const q = (R1 * R1 - ST_L * ST_L + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, R1 * R1 - q * q)), mx = shW[0] + q * dx / d, my = shW[1] + q * dy / d, c1 = [mx - hh * dy / d, my + hh * dx / d], c2 = [mx + hh * dy / d, my - hh * dx / d]; fOn = c1[1] > c2[1] ? c1 : c2; }
  else fOn = [shW[0] + dx / d * R1, shW[1] + dy / d * R1];
  const k = Math.min(1, ap / .8), fist = f <= 55 ? mix2(start, fOn, k) : mix2(fOn, rest, fl), aOn = Math.atan2(tip[1] - fOn[1], tip[0] - fOn[0]) / D2R;
  const sa = f <= 55 ? -52 + (aOn + 52) * k : aOn + (-118 - aOn) * fl + 360 * snap(f - 55, 7) + ring(f, 63, 9, 9);
  const sway = 0;   // the arm does the travelling; the body stays planted (a body riding the circle on a guessed phase would lean against its own hand)
  return { view: 'side', dir: 1, x: sway, y: yd - rise, rot: rotN, feet: [{ x: -44 - sway, lift: .92 * rise, toe: -.85 * rise }, { x: 50 - sway, lift: .92 * rise, toe: -.85 * rise }],
    hands: [farStick(fist, sa), H([-.1 - .16 * k * (1 - fl), .93 - .12 * k * (1 - fl), .5])], head: tr([[0, -2], [0, -17, 5], [55, -6, 6]], f - 1), held: [{ hand: 0, svg: stick(sa - rotN), wrap: sa - rotN }] }; }   // the kit turns the drawn prop with the body: give its angle minus the lean
// THE PROUD STEP BACK (the film moves the card back 0.5 m over 10 f, linear): two planted steps backwards (far foot first), then the near fist slaps onto his hip, the stick on his shoulder like a rifle,
// chest out, chin up at his hundred rings. 0-5 far foot back · 5-10 near foot back · 10-14 elbow out (counter) · 14-17 slap ON the hip · 17-21 the belly dips · settle · DEAD STILL
const C_PPM = 486, C_BACK = .38 * C_PPM;
function c_proud(t, ch) { const f = F(t), u = Math.min(1, f / 10), s1 = snap(f, 5), s2 = snap(f - 5, 5), Dp = C_BACK, S = ch.sh[1], L = ch.armL;
  const far = f < 5 ? -44 - Dp * s1 + Dp * u : -44 - Dp + Dp * u, near = f < 5 ? 50 + Dp * u : 50 + Dp * .5 * (1 - s2) + Dp * (u - .5) * (1 - s2);
  const k = tr([[0, 0], [6, 1, 4]], f), s = tr([[0, 0], [10, 1, 3]], f), hipN = [34, ch.hipY - 26], n0 = [0, S + L * .9], out = [L * .7, S + L * .45], hn = mix2(mix2(n0, out, k), hipN, s), d = dip(f, 13, 12, 4);
  return { view: 'side', dir: 1, x: 0, y: d + 10 * sin(PI * Math.min(1, f / 10)), rot: tr([[0, -2], [0, 5, 5], [10, -7, 6]], f), feet: [{ x: far, lift: f < 5 ? 40 * sin(PI * s1) : 0 }, { x: near, lift: f >= 5 && f < 10 ? 40 * sin(PI * s2) : 0 }],
    hands: [farStick([.2 * L + 8, S + .12 * L + d], -118), { lx: hn[0], ly: hn[1], bow: .9 }], head: tr([[0, -6], [10, -15, 6]], f - 1) + .2 * d, held: [{ hand: 0, svg: stick(-118 + ring(f, 17, 6, 8)), wrap: -118 }] }; }
// HE SEES WHAT THE LITTLE MAN IS DOING, and the laugh comes up from his belly, then out, then he doubles over and slaps his knee.
// (fix round 2 timing) 0-3 NOTICE: the head comes down from the rings to the slide rule · 3-7 READ (frozen) · 7-14 the belly starts to shake, shoulders up, lips pressed (it grows) ·
// 14-19 HEAD THROWN BACK, the stick arm flung out behind, the belly bouncing on a 4 f beat · 22-25 the free hand goes UP (counter) · 25-29 he DOUBLES OVER, the hand comes down ·
// 30 SLAP ON THE KNEE (contact, chalk dust off his palm) · 30-34 dip · he hangs there shaking, the hand on the knee, the stick propped on the concrete · the shakes die out · still
const C_HIPS = 200, C_OVER = 32;   // round 3c: 150 px and 36 deg still let the card's side edge shave the cap; 200 px and 32 deg keep the head 100 px further inside
function c_laugh(t, ch) { const f = F(t), S = ch.sh[1], L = ch.armL, sh = f > 7 && f < 14 ? (f - 7) / 7 : 0, back = tr([[0, 0], [14, 1, 5], [25, 0, 4]], f), over = tr([[0, 0], [25, 1, 5]], f);
  const beat = f > 7 && f < 60 ? Math.abs(sin(PI * f / 4)) * (f < 14 ? 5 * sh : f < 25 ? 12 : 9 * Math.max(0, 1 - (f - 34) / 16)) : 0;
  const kneeX = 74, kneeY = (ch.hipY + 84 + G) / 2 - 30; let hk = 0;
  if (f > 25 && f <= 30) hk = snap(f - 25, 5); else if (f > 30 && f <= 34) hk = 1 - .5 * sin(PI * (f - 30) / 4); else if (f > 34) hk = 1;
  const upP = [L * .55, S - L * .55 + 84 * over], hN0 = mix2([34, ch.hipY - 26], [L * .8, S - L * .25], back), cnt = tr([[0, 0], [22, 1, 3]], f), nearW = f < 22 ? null : mix2(mix2(hN0, upP, cnt), [kneeX, kneeY], hk);
  const y = 84 * over + beat + dip(f, 30, 10, 4) - 10 * back, rot = 6 * snap(f, 4) * (1 - back) - 15 * back + C_OVER * over + 3 * sh * sin(f * 1.7);
  const sa = -118 + 3 * sh * sin(f * 1.7) - 40 * back + 122 * over, fs = mix2(mix2([.2 * L + 8, S + .12 * L], [-.55 * L, S + .0 * L], back), [.5 * L, S + .55 * L + 84], over);
  const xb = -C_HIPS * over;   // doubled over, his hips go BACK over planted feet (counterweight): the head stays inside the card drawing (round 3b: at 36 deg about the feet the head crossed the card's side edge and was cut in half)
  return { view: 'side', dir: 1, x: xb, y, rot, feet: [{ x: -52 - xb }, { x: 58 - xb }], shrug: 22 * sh + 14 * back,
    hands: [farStick([fs[0], fs[1] + beat], sa), nearW ? { wx: nearW[0], wy: nearW[1], bow: .5 } : { lx: hN0[0], ly: hN0[1], bow: .9 * (1 - back) + .4 * back }],
    head: tr([[0, -15], [0, 8, 4], [14, -24, 4], [25, 20, 5]], f - 1) + .3 * beat, held: [{ hand: 0, svg: stick(sa), wrap: sa }] }; }
// TWO STEPS TO THE TIRE, still wheezing (the film moves the card, linear, 10 f): he straightens as he goes, the stick comes back up onto his shoulder
const C_V = 2.14 * C_PPM;
function c_to_tire(t, ch) { const f = F(t), S = ch.sh[1], L = ch.armL, w = walker(t, C_V, .167, { lift: 50, duty: .55 }), k = snap(f, 9), sa = 4 * (1 - k) - 118 * k;
  return { view: 'side', dir: 1, x: 0, y: 84 * (1 - k) + 12 * (1 - w.bob) + 6, rot: 36 * (1 - k) + 5, feet: w.feet, hands: [farStick(mix2([.5 * L, S + .55 * L + 84], [.2 * L + 8, S + .12 * L], k), sa), H([.24 * w.sw, .5 + .4 * k, .6])], head: 20 * (1 - k) - 2, held: [{ hand: 0, svg: stick(sa), wrap: sa }] }; }
// THE TIRE JOKE (fix round 2: the slap lands on "flat"). The film's hand_at gives the patch's place on the tire wall. He speaks the whole time (the film lip-syncs his mouth).
// 0-4 skid stop, belly forward · 2-6 the near hand dips into his breast pocket · 6-11 it comes out with the rubber patch and HOLDS IT UP between them, a little shake ("patch") ·
// 24-28 the chalk stick swings down off his shoulder and its chalk end points AT the tire, he leans in over it ("the tire") · 34-39 the stick goes back up ·
// 36-40 the patch to his mouth, licked · 43-47 COUNTER: the patch arm swings far back and low, he rises on his toes ("isn't") · 47-48 hold · 48-51 STRIKE on an arc, PALM ON THE TIRE at f51 ("flat") ·
// 51-55 dip, the whole man bounces off the rubber · the palm STAYS pressed on the patch, grin held, DEAD STILL
function c_patch(t, ch) { const f = F(t), T = ch.tgt || [210, 560], S = ch.sh[1], L = ch.armL;
  const show = [300, S - 70], low = [270, S - 20], lick = [176, S - 96], back = [-250, S + 60], pocket = [50, S + 60];
  let p = mix2([74, (ch.hipY + 84 + G) / 2 - 30], pocket, snap(f - 1, 5)); p = mix2(p, show, snap(f - 6, 5)); if (f > 8 && f < 20) p = [p[0] + 7 * sin((f - 8) * 2.1) * Math.max(0, 1 - (f - 8) / 12), p[1]];
  if (f > 22) p = mix2(show, low, snap(f - 22, 5)); if (f > 36) p = mix2(low, lick, snap(f - 36, 4)); if (f > 43) p = mix2(lick, back, snap(f - 43, 4));
  if (f > 48) { const u = Math.min(1, (f - 48) / 3); p = mix2(back, T, u * u); p[1] -= 70 * sin(PI * u); } if (f >= 51) p = [T[0] + ring(f, 51, 5, 8), T[1]];
  const has = f >= 5 && f < 51, pt = tr([[0, 0], [24, 1, 4], [34, 0, 5]], f);
  const y = tr([[0, 84], [0, 0, 6], [24, 14, 4], [34, 0, 5], [43, -20, 4], [48, 34, 3], [55, 14, 6]], f) + dip(f, 51, 12, 4), rot = tr([[0, C_OVER], [0, -5, 6], [8, 2, 5], [24, 10, 4], [34, 2, 5], [43, -12, 4], [48, 17, 3], [55, 9, 6]], f);
  const tipt = f >= 43 && f < 49 ? snap(f - 43, 4) : 0, pa = tr([[0, -20], [6, 0, 5], [36, 20, 4], [43, -60, 4], [48, 10, 3]], f), sa = -118 + 122 * (1 - snap(f, 6)) + 140 * pt + ring(f, 28, 6, 8) + ring(f, 51, 10, 9) - 8 * tipt;
  const up0 = snap(f, 6), fs = mix2(mix2([.5 * L, S + .55 * L], [.2 * L + 8, S + .12 * L], up0), [.6 * L + 8, S + .2 * L], pt);
  const xb = tr([[0, -C_HIPS], [0, 0, 6]], f);
  return { view: 'side', dir: 1, x: xb, y, rot, feet: [{ x: -52 - xb, lift: 26 * tipt, toe: -24 * tipt }, { x: 60 - xb, lift: 26 * tipt, toe: -24 * tipt }], hands: [farStick([fs[0], fs[1] + y], sa), { wx: p[0], wy: p[1], bow: .45, over: f < 43 || f >= 51 }],
    head: tr([[0, 20], [0, 6, 5], [8, -4, 5], [24, 8, 4], [34, 0, 5], [36, 4, 4], [43, -10, 4], [48, 12, 3], [55, 6, 6]], f - 1), held: [{ hand: 0, svg: stick(sa), wrap: sa }].concat(has ? [{ hand: 1, svg: patch(pa, f < 6 ? .7 : 1.25) }] : []) }; }

// =====================================================================================================================
// RIVETS: eager, late by 10 f, overdoes it
// =====================================================================================================================
// WATCHING: hands behind his back, up on his toes to see. 10 f after the panel clangs (the film starts r_jump there) he jumps.
function r_watch(t, ch) { const f = F(t), k = tr([[0, 0], [14, 1, 8]], f);
  return { view: 'side', dir: 1, x: 0, y: -14 * k, rot: 5 * k, feet: [{ x: -26, lift: 14 * k, toe: -14 * k }, { x: 30, lift: 14 * k, toe: -14 * k }], hands: [H([-.3, .8, .7]), H([-.24, .84, .7])], head: 4 * k }; }
// JUMP AT THE CLANG (late): 0-3 crouch · 3-11 straight up, knees tucked, arms out · 11-14 landing dip · 14-24 settle, one hand on his chest · still
function r_jump(t, ch) { const f = F(t); let y = tr([[0, -14], [0, 40, 3], [3, 0, 3], [11, 56, 3], [14, 0, 9]], f), lift = 0; if (f > 3 && f <= 11) { const u = (f - 3) / 8; y -= 150 * sin(PI * u); lift = 150 * sin(PI * u); }
  const air = lift > 0, h = tr([[0, [-.24, .84]], [3, [.7, -.4], 4], [11, [.3, .5], 4], [14, [.14, .3], 8]], f);
  return { view: 'side', dir: 1, x: 0, y, rot: tr([[0, 5], [3, -8, 4], [11, 6, 3], [14, 0, 8]], f), feet: [{ x: -26 + (air ? 10 : 0), lift, toe: air ? -30 : 0 }, { x: 30 - (air ? 10 : 0), lift: lift * 1.15, toe: air ? -26 : 0 }], hands: [H([-h[0] * .8, h[1], .6]), H([h[0], h[1], .6])], shrug: air ? 20 : 0, head: tr([[0, 4], [3, -10, 4], [14, 0, 8]], f) }; }
// THE LATE LAUGH, too big and too long: 0-4 head back, he points at the little man with a straight arm · 4-40 the pointing arm pumps on a 5 f beat, he slaps his own thigh with the other hand, knees bouncing ·
// 40-44 it STOPS DEAD (nobody else is laughing any more): arm half down, frozen · still
function r_laugh(t, ch) { const f = F(t), on = f < 40, k = snap(f, 4), end = snap(f - 40, 4), b = on ? Math.abs(sin(PI * f / 5)) : 0, kneeY = (ch.hipY + G) / 2;
  const sl = on ? Math.abs(sin(PI * f / 10)) : 0;
  return { view: 'side', dir: 1, x: 0, y: 12 * b * k + 6 * end, rot: 9 * k * (1 - end) + 2 * end, feet: [{ x: -30 }, { x: 34 }], shrug: 12 * b,
    hands: [{ wx: 40 + 30 * (1 - sl), wy: kneeY - 60 - 120 * (1 - sl) * k - 300 * (1 - k), bow: .6 }, H([.9 * k - .25 * end, -.12 * k - .08 * b + .3 * end + .9 * (1 - k), .3])], head: -10 * k * (1 - end) - 4 * b + 6 * end }; }

const sty = (key, pose) => ({ key, name: key, pose });
export default { title: 'S1 hook episode moves', dur: 6, styles: [
  sty('m_hook', (t, ch) => m_hook(t, ch, 1)), sty('m_hook_l', (t, ch) => m_hook(t, ch, 0)), sty('m_hop_off', (t, ch) => m_hop_off(t, ch, -50)), sty('m_hop_off_l', (t, ch) => m_hop_off(t, ch, 0)), sty('m_walk', m_walk), sty('m_count', m_count), sty('m_face_him', m_face_him),
  sty('c_hook', c_hook), sty('c_ring', c_ring), sty('c_proud', c_proud), sty('c_laugh', c_laugh), sty('c_to_tire', c_to_tire), sty('c_patch', c_patch),
  sty('r_watch', r_watch), sty('r_jump', r_jump), sty('r_laugh', r_laugh),
] };
