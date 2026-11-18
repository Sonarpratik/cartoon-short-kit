// PIECE 16: A BURST OF SMALL LIVING THINGS FROM AN OPENED CONTAINER (the flies out of the mess-hall trash barrel).
// Source: episodes/armor-no-holes/sets_merged/fx_s4.js lines 85-100 (film.json key s4.flies). Film: S4 night, lid comes up f304 (sound barrel_lid_scrape), burst f306 (flies_buzz_burst),
// the camera dives WITH the lid and lands close on the barrel at f312 (travel 0.33 s, hold 0.75 s): build_film.py lines 79 and 113-114.
// THIS FILE IS THE TECHNIQUE AS NUMBERS (no three.js): positions in the set's own coordinates ([x, y, z], z up, metres); a set module puts its own small meshes there and turns each one
// to face posOf(i, a + 1).
// WHY IT READS AS ALIVE AND NOT AS PARTICLES: (1) the burst is fast then spent (1 - exp(-a / 5)), not a constant fountain; (2) every one then LOOPS on its own small orbit with its own
// speed and phase; (3) a few have a JOB: two cross close to the lens, one lands on the rim and sits (it shifts its feet, wings still), one goes to a character and circles his head;
// (4) they leave at different times (60-100 % of `life`), the ones with a job stay.
// WHAT MUST CHANGE FOR A NEW STORY: the creature (flies, moths, bats, sparks are not alive: use another piece) and so its size, loop radius and wing beat; the container and WHY it is full
// (the story's own mess); the jobs (who do they bother? where does one sit?); the count (14 here: enough to read, few enough to follow); the light they are seen against.

export const hs = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };   // the set's own hash: the same creature does the same thing every render
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); }, V3 = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u], PI = Math.PI;

export const ARMOR = { f0: 306, n: 14, at: [-6.5, 34.98, 0.9], land: [-6.5, 35.0, 1.40], lens: [-6.33, 35.7, 1.55], chief: [-5.8, 35.95, 1.95], life: 110,
  out: [.25, .5], up: [.55, .6],        // m: how far out and up the burst throws them (base, random extra)
  burstTau: 5,                          // frames: the burst is 63 % spent after this
  loop: { w: [.32, .25], r: [.05, .11], grow: 8 },   // each one's own orbit: speed rad/frame, radius m, frames until the orbit is full size
  driftFrom: 55, drift: .012,           // from this frame they wander off
  crossers: [1, 2], crossIn: [4, 10], crossOut: [20, 14],   // which ones cross the lens; smoothstep in (start, length) and out
  lander: 0, landIn: [16, 10], sitFrom: 28,                 // which one lands on `land`; it sits from this frame
  visitor: 3, visitIn: [14, 16],                            // which one goes to `chief` (a character's head) and circles there
  body: [.011, .008, .016], wing: [.016, .009], wingBeat: 2.9 };   // m, and rad per frame

// position of creature i, a frames after the burst
export function posOf(i, a, FL = ARMOR) { const A0 = FL.at, L = FL.loop ?? ARMOR.loop, o = FL.out ?? ARMOR.out, u = FL.up ?? ARMOR.up, cr = FL.crossers ?? ARMOR.crossers;
  const an = hs(i, 11) * PI * 2, out = o[0] + o[1] * hs(i, 12), up = u[0] + u[1] * hs(i, 13), k = 1 - Math.exp(-a / (FL.burstTau ?? 5));                 // the burst: up and out, fast then spent
  let c = [A0[0] + Math.cos(an) * out * k, A0[1] + (Math.sin(an) * .5 + .35) * out * k, A0[2] + up * k + .0016 * a];                                      // loop centre, drifting up
  const ci = cr.indexOf(i), cin = FL.crossIn ?? ARMOR.crossIn, cout = FL.crossOut ?? ARMOR.crossOut;
  if (ci >= 0 && FL.lens) c = V3(c, [FL.lens[0] + (ci - (cr.length - 1) / 2) * .16, FL.lens[1], FL.lens[2] - .12], sm((a - cin[0]) / cin[1]) * (1 - sm((a - cout[0]) / cout[1])));
  const vi = FL.visitIn ?? ARMOR.visitIn; if (i === (FL.visitor ?? 3) && FL.chief) c = V3(c, FL.chief, sm((a - vi[0]) / vi[1]));
  const w = L.w[0] + L.w[1] * hs(i, 14), r = (L.r[0] + L.r[1] * hs(i, 15)) * Math.min(1, a / L.grow), ph = hs(i, 16) * 6.28, drift = Math.max(0, a - (FL.driftFrom ?? 55)) * (FL.drift ?? .012) * (.5 + hs(i, 17));
  const p = [c[0] + Math.cos(a * w + ph) * r + Math.cos(an) * drift, c[1] + Math.sin(a * w * 1.3 + ph) * r * .7 + drift * .6, c[2] + Math.sin(a * w * .8 + ph * 2) * r * .6 + drift * .4];
  const li = FL.landIn ?? ARMOR.landIn; if (i === (FL.lander ?? 0) && FL.land) return V3(p, [FL.land[0] + .004 * Math.sin(a * .7), FL.land[1], FL.land[2] + .008], sm((a - li[0]) / li[1]));
  return p; }

// is creature i on screen at film frame f, and its wings: { on, sit, wingAngle, wingScale }
export function stateOf(i, f, FL = ARMOR) { const a = f - FL.f0, stays = i === (FL.lander ?? 0) || i === (FL.visitor ?? 3), on = a >= 0 && (stays || a < (FL.life || 110) * (.6 + .4 * hs(i, 18)));
  const sit = i === (FL.lander ?? 0) && a > (FL.sitFrom ?? 28), fk = sit ? 0 : 1, wb = FL.wingBeat ?? 2.9;
  return { on, a, sit, wingAngle: fk * (.5 + .5 * Math.sin(f * wb + i)), wingScale: 1 + (sit ? 0 : .25 * Math.sin(f * 1.7 + i * 2)), wingOpacity: sit ? .5 : .34 }; }
