// motion_core.mjs: PIECE 8, the shared motion helpers of the armor film's episode moves ("Armor Where Nobody Shot", 2026-11-14).
// Source: the head of every episodes/armor-*/cast/ep_*.mjs (for example armor-s1-hook/cast/ep_s1.mjs lines 7-17, 29-30, 81-85). Same formulas, exported once.
// A move is pose(t, ch): it draws the body NEW on every frame (film.json "tween": { "ones": true }, "face_frames": 0). It is built as a STUDIO MOTION sequence:
//   NOTICE, READ, counter-move, HOLD, STRIKE (snap), IMPACT dip, SETTLE (ring), then DEAD STILL (a track holds its last value).
// All frame numbers are frames from the move's own start, f = F(t) at 30 per second. Moves are drawn facing +x (dir 1); the film mirrors the card.
// HOW AN EPISODE USES IT: the episode's own moves file (episodes/<name>/cast/ep_<x>.mjs, played from out/.puppet_cache/) imports from here with a relative path,
//   import { snap, tr, dip, ring } from '../../../../templates/pieces/motion_core.mjs';   // from out/.puppet_cache/
// and the piece factories from templates/pieces/moves/. It passes ITS OWN values; the ARMOR values in each piece are only the proof that the piece is the film's move.
import { cycle } from '../motion_styles/rig.mjs';

export const INK = '#2a1a1f', PI = Math.PI, D2R = PI / 180;
const sin = Math.sin, cos = Math.cos;
export const G = 1010;                                            // the rig's ground line (rig px, y down)
export const F = t => Math.round(t * 30 * 100) / 100;             // seconds -> frames of the move

// THE SNAP TABLE: share of the way after each twelfth of the move: 5, 16, 31, 48, 66, 79, 88, 93, 96, 98, 99, 100 %.
// Slow out of the hold, 66 % of the way after 5/12 of the time, then a long soft arrival. Never a linear tween.
export const SN = [0, .05, .16, .31, .48, .66, .79, .88, .93, .96, .98, .99, 1];
export const snap = (f, n = 12) => { if (f <= 0) return 0; const u = f * 12 / n; if (u >= 12) return 1; const i = Math.floor(u); return SN[i] + (SN[i + 1] - SN[i]) * (u - i); };

// TRACK: keys [[f0, value, n]]. The first key is the start value; from frame f0 the value SNAPS to `value` over n frames (default 12), then is dead still.
// Values may be numbers or arrays (a hand position [forward, down]). A key that starts before the last one has arrived takes over from where the value is.
export function tr(keys, f) { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [f0, to, n = 12] = keys[i]; if (f <= f0) break; const u = snap(f - f0, n); v = Array.isArray(to) ? v.map((a, j) => a + (to[j] - a) * u) : v + (to - v) * u; } return v; }

// IMPACT DIP: on a contact the body goes down `amp` px and is back after n frames (3-4). Add it to the body's y on the contact frame.
export const dip = (f, f0, amp = 8, n = 4) => f > f0 && f < f0 + n ? amp * sin(PI * (f - f0) / n) : 0;
// ARC: a hand inside a strike leaves the straight line by `amp` px and comes back (a strike is never a straight line).
export const arcUp = (f, f0, n, amp) => f > f0 && f < f0 + n ? amp * sin(PI * snap(f - f0, n)) : 0;
// SETTLE RING: a part (a tool's angle, a hand) rebounds after the contact and comes to rest inside n frames; amp in the part's own unit.
export const ring = (f, f0, amp, n = 10) => f > f0 && f < f0 + n ? amp * Math.exp(-(f - f0) / 3) * sin((f - f0) * 2.1) : 0;

export const H = (a) => ({ f: a[0], d: a[1], bow: a[2] ?? .45 });   // a hand given as [forward, down] in arm lengths from the shoulder, elbow bow
export const mix2 = (a, b, q) => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];

// BODY MECHANICS. shoulderAt: the side-view shoulder in the move's world coordinates after the body's lean (deg, about the hips) and an offset y.
export const shoulderAt = (ch, rotDeg, yOff) => { const r = rotDeg * D2R, py = ch.hipY + yOff, sy = ch.sh[1] - ch.hipY; return [8 * cos(r) - sy * sin(r), py + 8 * sin(r) + sy * cos(r)]; };
// fistFor: the fist that puts a held tool's TIP ON a point: the crossing of two circles (arm length R1 round the shoulder, tool length R2 round the point),
// the lower one (elbow down, fist under the chin). Out of reach = the arm goes straight at it, and the film must move the character closer.
export const fistFor = (sh, tip, R1, R2) => { const dx = tip[0] - sh[0], dy = tip[1] - sh[1], d = Math.hypot(dx, dy) || 1; if (d < R1 + R2 - 1 && d > Math.abs(R1 - R2) + 1) { const q = (R1 * R1 - R2 * R2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R1 * R1 - q * q)), mx = sh[0] + q * dx / d, my = sh[1] + q * dy / d, c1 = [mx - h * dy / d, my + h * dx / d], c2 = [mx + h * dy / d, my - h * dx / d]; return c1[1] > c2[1] ? c1 : c2; } return [sh[0] + dx / d * R1, sh[1] + dy / d * R1]; };

// THE WALK WHOSE PLANTED FOOT DOES NOT SLIDE. v = the card's speed in rig px per second; the film moves the card at the SAME speed with "linear": true.
// Tstep = seconds per step. Stride = v * Tstep, so a planted foot travels back under the body exactly as fast as the card goes forward.
// Returns feet for the pose, bob (0..1, twice per stride, for the body's y) and sw (-1..1, for the arm swing).
// Armor values: mathematician 0.2 s a step, lift 34; scurry 1/6 s; Rivets' run 4/30 s; a man with a crate 8/30 s; the Chief's stride 0.2 s, lift 60.
export function walker(t, v, Tstep, o = {}) { const S = v * Tstep, c = cycle(t, { T: Tstep, S, duty: o.duty ?? .58, swing: u => ({ lift: (o.lift ?? 46) * sin(PI * u), toe: -18 + 40 * u }) });
  return { c, feet: c.feet.map(ft => ({ ...ft, x: ft.x - c.bx - S * .5 })), bob: sin(PI * c.p) ** 2, sw: cos(2 * PI * c.stride) }; }

// A PLAIN STAND-IN TOOL for the examples: a bar from the fist, `len` px to its tip. A film replaces it with its own drawn prop (the slide rule, the chalk stick):
// a function (angleDeg) => (x, y) => svg string that sits AT the fist. The kit turns a drawn prop with the body's lean, so side-view moves pass angle minus lean.
export const barProp = (len = 156, w = 16, fill = '#efe2b8') => (ang) => (x, y) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-40" y="${-w / 2}" width="${len + 40}" height="${w}" rx="5" fill="${fill}" stroke="${INK}" stroke-width="6"/></g>`;

// a styles module entry, as the kit loads it: export default { title, dur, styles: [sty('name', pose), ...] }; pose id in film.json: "m:../../<file>/<style>"
export const sty = (key, pose) => ({ key, name: key, pose });
