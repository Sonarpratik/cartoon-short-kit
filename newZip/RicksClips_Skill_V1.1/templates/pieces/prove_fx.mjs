// prove_fx.mjs: numeric checks of the effect pieces (no pictures of the film, no graphics card). Run from the skill root:  node templates/pieces/prove_fx.mjs
// A. burst_of_living_things.posOf against the ORIGINAL code: the text of posOf is cut out of episodes/armor-no-holes/sets_merged/fx_s4.js and run as it stands.
// B. fly_and_hit.timetable against the original timetable rules (hangar.js lines 603-611), written out here from the source as plain loops over the armor numbers.
// C. fly_and_hit.thingAt and highlight_part: the numbers named in the source comments (hit frame, quiver, flash, blink) are printed and tested.
// D. time_pass.py against the original episodes/armor-no-holes/stretches/armor-s5-payoff/time_pass.py on six small made-up frames (pixel difference 0..255).
import path from 'node:path'; import fs from 'node:fs'; import os from 'node:os'; import { pathToFileURL, fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..'), imp = async p => (await import(pathToFileURL(path.resolve(HERE, p)).href));
let bad = 0; const say = (ok, s) => { if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + s); };

// ---- A
{ const B = await imp('fx/burst_of_living_things.js'), src = fs.readFileSync(path.resolve(ROOT, 'episodes/armor-no-holes/sets_merged/fx_s4.js'), 'utf8');
  const a0 = src.indexOf('const A0 = FL.at'), a1 = src.indexOf('ups.push((f, t) => { const a = f - FL.f0'); if (a0 < 0 || a1 < 0) say(false, 'A: posOf not found in fx_s4.js');
  else { const FL = B.ARMOR, PI = Math.PI, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), hs = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const posOrig = new Function('FL', 'PI', 'cl', 'hs', src.slice(a0, a1) + '; return posOf;')(FL, PI, cl, hs); let mx = 0;
    for (let i = 0; i < 14; i++) for (let a = 0; a <= 130; a++) { const p = posOrig(i, a), q = B.posOf(i, a); for (let j = 0; j < 3; j++) mx = Math.max(mx, Math.abs(p[j] - q[j])); }
    say(mx < 1e-12, 'A burst_of_living_things.posOf vs the original text of fx_s4.js: 14 creatures x 131 frames, largest difference ' + mx.toExponential(2) + ' m');
    const s0 = B.stateOf(0, 306 + 40), s5 = B.stateOf(5, 306 + 40); say(s0.sit && s0.wingAngle === 0 && !s5.sit, 'A the lander sits with still wings 40 f after the burst; the others still fly'); } }

// ---- B
{ const Fy = await imp('fx/fly_and_hit.js'), T = Fy.timetable(Fy.ARMOR_GROUPS), FLY = 5, want = [];
  want.push(90); for (const b of [{ f0: 183, n: 13 }, { f0: 196, n: 9 }, { f0: 205, n: 14 }]) for (let j = 0; j < b.n; j++) want.push(b.f0 + j + FLY); for (const sf of [219, 222, 226]) want.push(sf + FLY);
  const nT = 90; for (let j = 0; j < nT; j++) want.push((j === nT - 1 ? 338 : 307 + Math.floor(j * 30 / nT)) + FLY);
  const R = 300; for (let j = 0; j < R; j++) { const u = j / R, w = Math.floor(u * 3), uu = u * 3 - w; want.push(Math.round(353 + (w + uu * .86) / 3 * (406 - 353)) + FLY); }
  const got = T.map(x => x.hit), same = got.length === want.length && got.every((v, i) => v === want[i]);
  say(same, 'B fly_and_hit.timetable vs the rules of hangar.js 603-611: ' + got.length + ' hit frames, ' + (same ? 'all equal' : 'DIFFERENT') + '; first forty in by f' + got[39] + ', storm f' + got[130] + '-' + got[got.length - 1]);
  say(Fy.countIn(231, T) === 40 && Fy.countIn(89, T) === 0, 'B countIn: 0 before the first pin, 40 at f231 (the last single has hit)');
  // ---- C
  const from = [-9.2, 34.95, 1.1], to = [-11.5, 34.42, 1.97], a = Fy.thingAt(-5, from, to), m = Fy.thingAt(-2.5, from, to), h = Fy.thingAt(0, from, to), q3 = Fy.thingAt(3, from, to), st = Fy.thingAt(16, from, to);
  say(Fy.thingAt(-6, from, to) === null && a.state === 'flight' && Math.hypot(a.head[0] - from[0], a.head[1] - from[1], a.head[2] - from[2]) < 1e-9, 'C not drawn before it leaves; on its first flight frame it is AT the muzzle');
  say(Math.abs(m.head[2] - ((from[2] + to[2]) / 2 + .06)) < 1e-9, 'C mid flight it is 0.06 m above the straight line (the arc)');
  say(h.state === 'hit' && h.quiverDeg === 16 && h.scale === 1.7 && h.mark === 2.6 && h.flash === 1.25, 'C hit frame: head x1.7, mark x2.6, flash 1.25, lean 16 deg');
  say(Math.abs(q3.quiverDeg - 14 * Math.exp(-3 / 5.5) * Math.cos(Math.PI)) < 1e-12 && q3.quiverDeg < 0, 'C 3 f later it has swung to the other side: ' + q3.quiverDeg.toFixed(2) + ' deg');
  say(st.state === 'still' && st.quiverDeg === 0 && st.flash === 0 && st.dust.length === 0 && st.shake === 0, 'C 16 f after the hit it is dead still: no quiver, flash, dust or shake');
  const sh = Fy.boardShake(200, 10); say(Math.abs(Math.hypot(sh[0], sh[1])) <= .0045 * 1.6 * 1.5, 'C the board shake is capped: ' + (sh[0] * 1000).toFixed(2) + ', ' + (sh[1] * 1000).toFixed(2) + ' mm under a full burst'); }
{ const Hl = await imp('fx/highlight_part.js'), A = Hl.ARMOR, b0 = Hl.lightBand(186, A.paperWings).band, bm = Hl.lightBand(192.5, A.paperWings).band, b1 = Hl.lightBand(199, A.paperWings).band;
  say(Math.abs(b0.offset + 1.43) < 1e-9 && Math.abs(bm.offset) < 1e-9 && Math.abs(b1.offset - 1.43) < 1e-9 && Math.abs(bm.opacity - .55) < 1e-9 && b0.opacity < 1e-9, 'C light band: runs from -1.43 m to +1.43 m along the paper wings in 13 f, brightest (0.55) in the middle, 0 at both ends');
  say(Hl.lightBand(190, A.paperWings).iris === 0 && Hl.lightBand(183, A.paperWings).on === false, 'C nothing is dimmed (iris 0); off outside its frames');
  let peaks = 0, prev = 0, up = false; for (let f = 108; f <= 131; f += .25) { const g = Hl.markGlow(f, A.wingsOfPlaneOne), v = g ? g.pulse : 0; if (v > prev) up = true; else if (v < prev && up) { peaks++; up = false; } prev = v; }
  say(peaks === 2, 'C mark glow with blinks 3: ' + peaks + ' visible pulses over f108-131 (the source clips the negative half wave: blinks n gives (n + 1) / 2 pulses)');
  const s0 = Hl.strongBlink(520, A.bareEngineOvals), s8 = Hl.strongBlink(528, A.bareEngineOvals), s9 = Hl.strongBlink(529, A.bareEngineOvals);
  say(s0.p === 1 && s8.p < .02 && s9.p === 1 && Hl.strongBlink(547, A.bareEngineOvals) === null, 'C strong blink: full on the first frame of each 9 f blink, ' + s8.p.toFixed(3) + ' on its last, 3 blinks, off at f547'); }

// ---- D
{ const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pieces_tp_')), py = `
import os, sys, numpy as np
from PIL import Image
root = sys.argv[1]; rng = np.random.RandomState(7)
for run in ('orig', 'mine'):
    for s in ('n', 'd'):
        os.makedirs(os.path.join(root, run, s), exist_ok=True)
for f in range(6):
    a = rng.randint(0, 256, (48, 27, 3)).astype(np.uint8); b = rng.randint(0, 256, (48, 27, 3)).astype(np.uint8)
    for run in ('orig', 'mine'):
        Image.fromarray(a).save(os.path.join(root, run, 'n', 'f_%05d.png' % f)); Image.fromarray(b).save(os.path.join(root, run, 'd', 'f_%05d.png' % f))
`, cmp = `
import os, sys, numpy as np
from PIL import Image
root = sys.argv[1]; mx = 0
for f in range(6):
    a = np.asarray(Image.open(os.path.join(root, 'orig', 'f_%05d.png' % f))).astype(int); b = np.asarray(Image.open(os.path.join(root, 'mine', 'f_%05d.png' % f))).astype(int); mx = max(mx, int(abs(a - b).max()))
print(mx)
`;
  try { fs.writeFileSync(path.join(tmp, 'mk.py'), py); fs.writeFileSync(path.join(tmp, 'cmp.py'), cmp); const run = (...a) => execFileSync('python', a, { encoding: 'utf8' });
    run(path.join(tmp, 'mk.py'), tmp); run(path.resolve(ROOT, 'episodes/armor-no-holes/stretches/armor-s5-payoff/time_pass.py'), path.join(tmp, 'orig'), '1', '4', '6'); run(path.resolve(HERE, 'fx/time_pass.py'), path.join(tmp, 'mine'), '1', '4', '6');
    const mx = +run(path.join(tmp, 'cmp.py'), tmp).trim(); say(mx === 0, 'D time_pass.py vs the original script on 6 made-up frames (27 x 48): largest pixel difference ' + mx + ' of 255');
  } catch (e) { say(false, 'D time_pass.py could not be run: ' + String(e.message).split('\n')[0]); }
  fs.rmSync(tmp, { recursive: true, force: true }); }
console.log(bad ? 'FAIL: ' + bad : 'PASS'); process.exit(bad ? 1 : 0);
