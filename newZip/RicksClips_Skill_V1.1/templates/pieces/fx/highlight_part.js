// PIECE 13: HIGHLIGHT A NAMED PART WITH THE PART ITSELF. Three strengths, all additive light ON the thing; nothing is outlined, no arrow, no label, the rest is NOT dimmed.
// Source: episodes/armor-no-holes/sets_merged/airfield.js lines 550-570 (film.json key spot_fx: the light band; marks: the glow on every ringed hole) and
// hangar.js lines 661-667 (pin_fire.oval_blink: the stronger blink on the four bare engine ovals). Values used: armor-pins-test/build_film.py lines 60 and 162-168.
// Measured from the reference channel (CLOSEUP_STUDY.md): a part is highlighted with the part itself: glow or colour running along it, a glint, dust, a real marker.
// THIS FILE IS THE TECHNIQUE AS NUMBERS (no three.js): a set module calls these per frame and drives ITS OWN sprites or materials.
// WHAT MUST CHANGE FOR A NEW STORY: which part and its real shape (the band runs along the part's own long axis, sized rx, ry to it), the light's colour from the place's key light
// (warm lamp gold here: band 255,244,210; glow #ffb24a, core #fff6d8, flash #ffc866), how many blinks (one per syllable or per named part), and the cause in the world if there is one
// (a door opening, a torch, a reflection). In daylight an additive glow washes out: use a glint or the part's own colour change instead.

// A. THE LIGHT BAND that sweeps along the part. sp = { f0, f1, rx, ry, band, dim, sweeps: [[fa, fb], ...], axis }.
//    Returns { on, k, iris, band: null | { offset, opacity } }: offset = metres from the part's centre along `axis` (from -1.1 rx to +1.1 rx, smoothstep), opacity rises and falls with sin.
//    Band sprite: width rx * 0.5, height ry * 3.2, tilted -0.3 rad, soft at both ends. iris = opacity of a dark vignette round the part; the armor film set dim 0 everywhere (nothing dimmed).
export function lightBand(f, sp) { const on = f >= sp.f0 && f <= sp.f1; if (!on) return { on: false, k: 0, iris: 0, band: null };
  const k = Math.min(1, (f - sp.f0 + 1) / 5, (sp.f1 - f + 1) / 5); let band = null;
  for (const [fa, fb] of sp.sweeps || []) if (f >= fa && f <= fb) { const u = (f - fa) / Math.max(1, fb - fa), e = u * u * (3 - 2 * u); band = { offset: (e * 2 - 1) * sp.rx * 1.1, opacity: (sp.band ?? .5) * Math.sin(Math.PI * u) }; }
  return { on, k, iris: (sp.dim ?? .45) * k, band }; }

// B. THE GLOW ON EVERY MARKED SPOT (each chalk-ringed hole glows and pulses together). sp = { f0, f1, blinks, size }.
//    Returns per frame the scale and opacity of a wide warm glow and a small bright core, both additive, at each spot's own position (they ride on the moving thing).
//    MEASURED 2026-11-15 (prove_fx.mjs): the pulse is max(0, sin(pi * blinks * u)) ^ 1.5, so the negative half waves are dark gaps: blinks 3 gives TWO visible pulses
//    (f108-116 and f123-131 in the armor film), not three. For n visible pulses pass blinks = 2n - 1.
export function markGlow(f, sp) { const on = f >= sp.f0 && f <= sp.f1; if (!on) return null;
  const u = (f - sp.f0) / Math.max(1, sp.f1 - sp.f0), k = Math.min(1, (f - sp.f0 + 1) / 3, (sp.f1 - f + 1) / 4), pu = Math.max(0, Math.sin(Math.PI * (sp.blinks || 3) * u)) ** 1.5, sz = sp.size || .8;
  return { pulse: pu, glowScale: sz * (.75 + .55 * pu), coreScale: sz * (.2 + .16 * pu), glowOpacity: k * (.3 + .7 * pu), coreOpacity: k * (.25 + .75 * pu) }; }

// C. THE STRONGER BLINK (CB wanted the bare spots to read at phone size): n hard blinks of `len` frames. Each blink JUMPS to full on its first frame and decays (1 - q) squared:
//    the part's own glow goes to full and swells 30 %, a soft flash sits on it, and a ring expands off it and fades. ob = { f0, n, len }.
export function strongBlink(f, ob) { const on = f >= ob.f0 && f < ob.f0 + ob.n * ob.len; if (!on) return null; const q = ((f - ob.f0) % ob.len) / ob.len, p = (1 - q) * (1 - q);
  return { q, p, glowAdd: p, glowScale: 1 + .3 * p, flash: { scale: [.3 + .16 * p, .62 + .26 * p], opacity: .75 * p }, ring: { scale: [.36 + .3 * q, .7 + .42 * q], opacity: .85 * (1 - q) * (1 - q) } }; }   // scales in metres, for an oval 0.3 x 0.6 m: resize to the part

// ARMOR VALUES (pins stretch, FILM frames: spot_fx and oval_blink are not shifted by build_film.py line 182, the stations are):
export const ARMOR = {
  wingsOfPlaneOne: { f0: 108, f1: 131, marks: true, blinks: 3, size: .8, sweeps: [] },                        // "holes in its WINGS": every ringed hole on the rolling plane pulses twice in 0.77 s (blinks 3, see B)
  paperWings: { f0: 184, f1: 203, rx: 1.3, ry: .36, dim: 0, band: .55, sweeps: [[186, 199]] },                 // the band runs along the paper wings once, 13 f
  tailOfPlaneTwo: { f0: 250, f1: 277, rx: 4.2, ry: 3.4, dim: 0, band: .6, sweeps: [[256, 270]] },              // follows the limping plane's tail (follow: 'taxi' + off)
  paperTail: { f0: 300, f1: 322, rx: .52, ry: .27, dim: 0, band: .55, sweeps: [[304, 317]] },
  pinsCloseUp: { f0: 350, f1: 382, rx: .34, ry: .5, dim: 0, band: .42, sweeps: [[352, 363], [366, 377]] },     // two passes over the heads in the "hundreds" close-up
  bareEngineOvals: { f0: 520, n: 3, len: 9 },                                                                 // "a few SPOTS never get a pin": 3 blinks, 9 f each, 2 f after the camera lands (station f518 in the film, travel 0.45 s)
};
