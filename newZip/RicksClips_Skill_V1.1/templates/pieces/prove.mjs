// prove.mjs: the numeric proof of the library (no pictures, no graphics card). Run from the skill root:  node templates/pieces/prove.mjs
// For each motion piece it plays the ORIGINAL episode move of the armor film and the piece with its ARMOR values, frame by frame (30/s), and compares every number of the
// returned pose: body x, y, lean, head, shrug, each foot, each hand, every flag, and each held prop's angle and scale (read from its svg; the prop DRAWING is content and is not compared).
// It prints the largest difference per piece. 0 = the piece is the film's move. Then it plays each piece with CHANGED values to show the parameters are live.
import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL, fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const imp = async p => (await import(pathToFileURL(path.resolve(ROOT, p)).href));
// the ORIGINAL is the stretch's own cast/ep_*.mjs. It imports './motion/rig.mjs' (true only inside the kit's cache), so a copy with that one import line pointed at
// templates/motion_styles/rig.mjs is written to the system temp folder and loaded from there. Nothing in episodes/ is touched.
import os from 'node:os';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pieces_prove_')), RIG = pathToFileURL(path.resolve(ROOT, 'templates/motion_styles/rig.mjs')).href;
const orig = async (ep, file) => { const src = fs.readFileSync(path.resolve(ROOT, `episodes/${ep}/cast/${file}`), 'utf8'), out = path.join(TMP, ep + '_' + file); if (!src.includes("'./motion/rig.mjs'")) throw new Error('import line not found in ' + file);
  fs.writeFileSync(out, src.replace("'./motion/rig.mjs'", JSON.stringify(RIG))); const m = (await import(pathToFileURL(out).href)).default; return { st: Object.fromEntries(m.styles.map(s => [s.key, s.pose])), same: true }; };
// character measures as the kit gives them to a move (from episodes/armor-no-holes/stretches/armor-s1-hook/check_moves.mjs): m = the mathematician, c = the Chief
const CH = { m: { form: 'cast', bodyTop: 333, bodyBot: 660, ground: 1010, K: 1.5, hipY: 640, legL: 363.7, sh: [60, 385], armL: 209.2, hy: 216, hipW: 13 }, c: { form: 'cast', bodyTop: 333, bodyBot: 730, ground: 1010, K: 1.74, hipY: 710, legL: 293.9, sh: [123, 385], armL: 230, hy: 197.3, hipW: 26.6 } };
const svgNums = s => { const r = /rotate\(([-\d.]+)\)/.exec(s), k = /scale\(([-\d.]+)\)/.exec(s); return [r ? +r[1] : 0, k ? +k[1] : 1]; };
function flat(v, pre, out) { if (typeof v === 'function') { svgNums(v(0, 0)).forEach((x, i) => out[pre + '.svg' + i] = x); } else if (Array.isArray(v)) v.forEach((x, i) => flat(x, pre + '[' + i + ']', out)); else if (v && typeof v === 'object') for (const k of Object.keys(v)) flat(v[k], pre + '.' + k, out); else out[pre] = v === undefined ? null : v; return out; }
function diff(A, B) { const a = flat(A, '', {}), b = flat(B, '', {}); let mx = 0, where = ''; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k], y = b[k]; let d;
    if (typeof x === 'number' && typeof y === 'number') d = Math.abs(x - y); else d = x === y ? 0 : Infinity; if (d > mx) { mx = d; where = k + ' ' + x + ' vs ' + y; } } return [mx, where]; }
const { makeHop } = await imp('templates/pieces/moves/hop_onto_box.mjs'), { makeLaugh } = await imp('templates/pieces/moves/laugh_whole_body.mjs'), { makeHit } = await imp('templates/pieces/moves/hit_on_object.mjs'),
  { makeDoubleTap } = await imp('templates/pieces/moves/double_tap_tool.mjs'), { makeStroke } = await imp('templates/pieces/moves/stroke_drawn_live.mjs'), { makeGotIt } = await imp('templates/pieces/moves/got_it.mjs'), { makeToldYou } = await imp('templates/pieces/moves/told_you_so.mjs');
const core = await imp('templates/pieces/motion_core.mjs');
const S1 = await orig('armor-s1-hook', 'ep_s1.mjs'), S3 = await orig('armor-pins-test', 'ep_pins.mjs'), S5 = await orig('armor-s5-payoff', 'ep_s5.mjs');
// a moving target for the stroke (the film gives one point per frame): a ring of radius 60 px round [292, -63], one turn over frames 14-55
const ringTgt = f => { const u = Math.min(1, Math.max(0, (f - 14) / 41)) * 2 * Math.PI; return [292 + 60 * Math.cos(u), -63 + 60 * Math.sin(u)]; };
const TESTS = [
  ['1 hop_onto_box', S3, 'm_hop_tap', makeHop(), 'm', () => undefined, 90],
  ['2 laugh_whole_body', S1, 'c_laugh', makeLaugh(), 'c', () => undefined, 90],
  ['3 hit_on_object', S1, 'c_patch', makeHit(), 'c', () => [300, 520], 100],
  ['3 hit_on_object (no target given)', S1, 'c_patch', makeHit(), 'c', () => undefined, 100],
  ['4 double_tap_tool', S1, 'm_hook', makeDoubleTap(), 'm', () => [331, 190], 160],
  ['4 double_tap_tool (flat feet = m_hook_l)', S1, 'm_hook_l', makeDoubleTap({ tiptoe: 0 }), 'm', () => [331, 190], 160],
  ['5 stroke_drawn_live (fixed point)', S1, 'c_ring', makeStroke(), 'c', () => [292, -63], 100],
  ['5 stroke_drawn_live (point moves per frame)', S1, 'c_ring', makeStroke(), 'c', ringTgt, 100],
  ['6 got_it', S3, 'm_realise', makeGotIt(), 'm', () => undefined, 60],
  ['7 told_you_so', S5, 'm_told', makeToldYou(), 'm', () => undefined, 60],
];
console.log('piece                                        frames  largest difference   (original = episodes/<stretch>/cast/ep_*.mjs)');
let bad = 0;
for (const [name, O, key, mine, who, tg, n] of TESTS) { if (!O.st[key]) { console.log(name.padEnd(45) + 'ORIGINAL STYLE ' + key + ' NOT FOUND'); bad++; continue; } let mx = 0, where = '', at = 0;
  for (let f = 0; f <= n; f += .5) { const ch = { ...CH[who], tgt: tg(f) }, [d, w] = diff(O.st[key](f / 30, ch), mine(f / 30, { ...ch })); if (d > mx) { mx = d; where = w; at = f; } }
  if (mx > 1e-9) bad++; console.log(name.padEnd(45) + String(2 * n + 1).padStart(5) + '   ' + (mx === 0 ? '0 (identical)' : mx.toExponential(2) + ' at f' + at + ' ' + where) ); }
// the five named times of the brief, one line each, for the report
for (const [name, O, key, mine, who, tg] of [TESTS[0], TESTS[1], TESTS[2], TESTS[4], TESTS[9]]) { const row = [0, .2, .5, 1, 2].map(t => { const ch = { ...CH[who], tgt: tg(t * 30) }, a = O.st[key](t, ch), b = mine(t, { ...ch }); return `t${t}: y ${a.y.toFixed(2)}/${b.y.toFixed(2)} rot ${a.rot.toFixed(2)}/${b.rot.toFixed(2)}`; }); console.log('  ' + name.slice(0, 20).padEnd(21) + row.join(' | ')); }
// helpers: the core against the original walker and helpers is covered by the moves above (they call snap, tr, dip, ring, arcUp, fistFor); the walk is checked against the film's own walk
{   // planted-foot test of core.walker itself: while a foot is down, its x plus the card's travel (v * t) must stay constant
  const v = 300, T = .2; let slide = 0; const down = [null, null]; for (let f = 0; f <= 120; f++) { const t = f / 30, w = core.walker(t, v, T, { lift: 34 }); w.feet.forEach((ft, i) => { const lifted = (ft.lift || 0) > .01, wx = ft.x + v * t; if (lifted) down[i] = null; else if (down[i] === null) down[i] = wx; else slide = Math.max(slide, Math.abs(wx - down[i])); }); }
  console.log('8 motion_core.walker: largest slide of a planted foot over 4 s at 300 px/s: ' + slide.toFixed(4) + ' px'); if (slide > .5) bad++; }
// the parameters are live: a changed value must change the pose
const live = [['hop without the tap hop', makeHop({ tapHop: null }), makeHop(), 'm', 35], ['laugh, slap 6 f later', makeLaugh({ slap: 36 }), makeLaugh(), 'c', 33], ['hit, strike 5 f instead of 3', makeHit({ strikeN: 5 }), makeHit(), 'c', 50], ['double tap, longer tool', makeDoubleTap({ toolLen: 220 }), makeDoubleTap(), 'm', 108], ['told you, no tucked prop', makeToldYou({ tuck: null }), makeToldYou(), 'm', 12]];
for (const [name, a, b, who, f] of live) { const ch = { ...CH[who], tgt: who === 'm' ? [331, 190] : [300, 520] }; let ok = true, d = 0; try { d = diff(a(f / 30, ch), b(f / 30, ch))[0]; const P = a(f / 30, ch); ok = [P.y, P.rot].every(Number.isFinite); } catch (e) { ok = false; d = e.message; } console.log('  changed: ' + name.padEnd(30) + ' differs from armor by ' + (typeof d === 'number' && isFinite(d) ? d.toFixed(2) : d) + (ok ? '' : '  BROKEN')); if (!ok || d === 0) bad++; }
console.log(bad ? 'FAIL: ' + bad : 'PASS: every piece equals its armor move; every changed parameter changes the pose');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
