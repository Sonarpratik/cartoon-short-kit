#!/usr/bin/env node
// check.mjs: automatic frame checks (CB_RULES 11d). Numbers, not looking.
//   node tools/frame_checks/check.mjs <film.json> [--frames a-b] [--puppets dir,dir] [--out dir] [--crops 12] [--scale 0.25] [--all-frames] [--rest-thr 0.01] [--rest-min 8] [--body-step 2] [--no-body] [--seat regex] [--debug]
// On every frame of a camera rest (plus frame 0 and the last frame), for every character in frame:
//   head_cut      head with hat partly outside the frame                          FAIL
//   body_side     figure cut by the LEFT or RIGHT edge, 15-85 % of its width left FAIL
//   face_covered  set geometry between the lens and the face, or head inside it   FAIL (one eye only: WARN)
//   feet          foot more than 4 cm above or inside the surface below           WARN (both feet floating: FAIL)
//   body_in_mesh  the body (neck to sole) inside a solid set part (counter, table top, tub, cart; not the seat it sits on): 10 % of torso-hips-thighs, or a part
//                 cutting 15 % of the body width with 8 cm of it running on behind the card = FAIL. Tested on rests AND every 2nd moving frame (--body-step), never exempt for moving.
// Writes out/frame_checks.json, out/frame_checks.md and out/frame_checks/*.jpg (one crop per FAIL) beside the film. Exit code 1 on any FAIL.
// It starts templates/threejs_film/render_gpu.mjs once (its --eval hook) and reads the live scene; the kit is not changed and nothing is drawn but the crops.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), KIT = path.resolve(HERE, '..', '..', 'templates', 'threejs_film');
const A = process.argv.slice(2), has = k => A.includes(k), val = (k, d) => { const i = A.indexOf(k); return i >= 0 && A[i + 1] !== undefined ? A[i + 1] : d; };
if (!A[0] || A[0].startsWith('--')) { console.log('usage: node tools/frame_checks/check.mjs <film.json> [--frames a-b] [--puppets dir,dir] [--out dir] [--crops 12] [--all-frames]'); process.exit(2); }
const T0 = Date.now(), FILM = path.resolve(A[0]), EP = path.dirname(FILM), film = JSON.parse(fs.readFileSync(FILM, 'utf8')), OUT = path.resolve(val('--out', path.join(EP, 'out')));
const camFile = path.join(EP, 'out', 'plan', 'camera_baked.json'); if (!fs.existsSync(camFile)) { console.error('No out/plan/camera_baked.json beside the film. Run: python tools/film_plan.py check ' + A[0]); process.exit(2); }
let cam = JSON.parse(fs.readFileSync(camFile, 'utf8')); cam = cam.frames || cam; const N = cam.length;

// ---- camera rests, from the baked camera track: a frame-to-frame move under the threshold, in one place, for at least 8 frames
const THR = +val('--rest-thr', 0.01), MIN = +val('--rest-min', 8), d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const step = f => { const a = cam[f - 1], b = cam[f]; if (a.place !== b.place || b.cut) return 9; if (!has('--ignore-state') && (a.state || b.state) && (a.state !== 'rest' || b.state !== 'rest')) return 8; /* the plan says travel: a slow move is not a rest */ return (d3(a.pos, b.pos) + d3(a.aim, b.aim)) / Math.max(.2, d3(a.pos, a.aim)) + Math.abs(a.fov_v - b.fov_v) / a.fov_v; };
const rests = []; if (has('--all-frames')) rests.push([0, N - 1]); else { let s = 0; for (let f = 1; f <= N; f++) if (f === N || step(f) >= THR) { if (f - 1 - s + 1 >= MIN) rests.push([s, f - 1]); s = f; } }
const [F0, F1] = (() => { const m = /^(\d+)(?:-(\d+))?$/.exec(val('--frames', '')); return m ? [+m[1], Math.min(N - 1, +(m[2] ?? m[1]))] : [0, N - 1]; })();
const label = r => r[0] === r[1] ? 'f' + r[0] : `f${r[0]}-${r[1]}`, frames = [], seen = new Set();
for (const r of rests) for (let f = Math.max(r[0], F0); f <= Math.min(r[1], F1); f++) { frames.push([f, label(r)]); seen.add(f); }
for (const f of [0, N - 1]) if (!seen.has(f) && f >= F0 && f <= F1) { frames.push([f, 'f' + f + (f ? ' (last)' : ' (first)')]); seen.add(f); }
// body_in_mesh also runs between the rests (camera moving, character walking): every --body-step frames, labelled by the run of moving frames ("f10-60 move")
const BSTEP = Math.max(0, Math.round(+val('--body-step', 2)));
if (BSTEP > 0 && !has('--no-body')) for (let f = F0; f <= F1; f++) { if (seen.has(f)) continue; let b = f; while (b < F1 && !seen.has(b + 1)) b++; for (let g = f; g <= b; g += BSTEP) frames.push([g, `f${f}-${b} move`, 1]); if ((b - f) % BSTEP) frames.push([b, `f${f}-${b} move`, 1]); f = b; }
frames.sort((a, b) => a[0] - b[0]);
if (!frames.length) { console.log('frame_checks: no camera rest in the asked frames, nothing to check.'); process.exit(0); }

// ---- held things (never count as "covering a face"): generic held 3D props and props with held_by
const heldNames = [...new Set([...(film.held3d || []).map(h => h.obj), ...Object.entries(film.props || {}).filter(([, p]) => p && p.held_by).map(([k]) => k)].filter(Boolean))].map(s => String(s).replace(/[^a-z0-9_]/gi, '.'));
const cfg = { frames, heldNames, crops: has('--no-crops') ? 0 : +val('--crops', 12), skipName: val('--skip', 'sky|dome|cone|beam|haze|fog|dust|glow|halo|smoke|spark|cloud|backdrop|mote|rain|snow'),
  headOut: .02, headFull: +val('--head-full', .97), bodyLo: .15, bodyHi: .85, faceEps: .03, footTol: +val('--foot-tol', .04), footReach: +val('--foot-reach', .25), footUp: .5, footDown: 3, moveEps: .002, minBad: +val('--min-bad', 4),
  body: !has('--no-body'), debug: has('--debug'), bodyUpper: .75, bodyLowSkip: .06, bodyFail: +val('--body-fail', .10), bodyWarn: .03, bodyBand: +val('--body-band', .15), bodyBandWarn: .08, bodyIn: .01, bodyBehind: +val('--body-behind', .08),
  seatName: val('--seat', 'seat|stool|bench|saddle|sofa|couch') };

// ---- the character package: the film's own list, with a missing folder replaced by the kit's locked package (film.json copies in other folders keep working)
const LOCKED = path.join(KIT, '..', 'vector2d_characters', 'code');
let pup = val('--puppets'); if (!pup && film.puppet_pkg) { const list = [].concat(film.puppet_pkg).map(p => path.resolve(EP, p)).map(p => fs.existsSync(p) ? p : /vector2d_characters/.test(p) ? LOCKED : p); pup = list.join(','); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'frame_checks_')), evalFile = path.join(TMP, 'eval.js');
fs.writeFileSync(evalFile, 'window.__FC = ' + JSON.stringify(cfg) + ';\n' + fs.readFileSync(path.join(HERE, 'page_check.js'), 'utf8'));
const args = ['render_gpu.mjs', FILM, '--frames', String(frames[0][0]), '--scale', val('--scale', '0.25'), '--seed', '7', '--no-captions', '--stills-dir', path.join(TMP, 'still'), '--eval', evalFile, ...(pup ? ['--puppets', pup] : []), ...(has('--software') ? ['--software'] : [])];
const run = spawnSync(process.execPath, args, { cwd: KIT, encoding: 'utf8', maxBuffer: 1 << 29 });
const line = (run.stdout || '').split(/\r?\n/).find(l => l.startsWith('eval {'));
if (!line) { console.error('frame_checks: the film page gave no result.\n' + (run.stdout || '').split(/\r?\n/).filter(l => !l.startsWith('eval')).slice(-15).join('\n') + '\n' + (run.stderr || '').slice(-1500)); process.exit(2); }
const pageErr = (run.stdout || '').split(/\r?\n/).filter(l => l.startsWith('[page error]')).slice(0, 5);
const res = JSON.parse(line.slice(5)); fs.rmSync(TMP, { recursive: true, force: true });

// ---- report
const rank = { FAIL: 0, WARN: 1, PASS: 2 }, rows = res.rows.sort((a, b) => rank[a.status] - rank[b.status] || b.bad_frames - a.bad_frames || a.frame - b.frame);
const cropDir = path.join(OUT, 'frame_checks'); fs.mkdirSync(OUT, { recursive: true }); fs.rmSync(cropDir, { recursive: true, force: true });
for (const c of res.crops) { fs.mkdirSync(cropDir, { recursive: true }); const name = `FAIL_${c.check}_${c.who}_f${String(c.frame).padStart(5, '0')}.jpg`; fs.writeFileSync(path.join(cropDir, name), Buffer.from(c.jpg, 'base64')); const r = rows.find(r => r.who === c.who && r.rest === c.rest && r.check === c.check); if (r) r.crop = 'frame_checks/' + name; }
const n = s => rows.filter(r => r.status === s).length, secs = +((Date.now() - T0) / 1000).toFixed(1);
const summary = { film: FILM, frames_in_film: N, frames_checked: res.frames, rests: rests.map(label), cast: res.cast, fail: n('FAIL'), warn: n('WARN'), pass: n('PASS'), seconds: secs, scan_seconds: +(res.scan_ms / 1000).toFixed(1), pose_seconds: +(res.pose_ms / 1000).toFixed(1), moving_exempt: res.moving_exempt, ms: res.tm, settings: { ...cfg, frames: undefined, rest_thr: THR, rest_min: MIN }, set_meshes: res.skipped, notes: res.notes, page_errors: pageErr };
fs.writeFileSync(path.join(OUT, 'frame_checks.json'), JSON.stringify({ summary, rows }, null, 1));
const num = r => r.value === null ? 'none' : r.value + (r.check === 'feet' ? ' cm' : r.check === 'face_covered' ? ' rays' : ' %');
const cell = r => [r.status, r.who, r.rest, r.check, num(r), 'f' + r.frame, `${r.bad_frames}/${r.frames}`, r.detail || ''];
const head = ['result', 'who', 'rest', 'check', 'number', 'worst at', 'bad frames', 'what'];
fs.writeFileSync(path.join(OUT, 'frame_checks.md'), `# Frame checks: ${path.basename(EP)}/${path.basename(FILM)}\n\n${summary.fail} FAIL, ${summary.warn} WARN, ${summary.pass} PASS. ${res.frames} of ${N} frames checked (camera rests: ${summary.rests.join(', ') || 'none'}), cast ${res.cast.join(', ')}, ${secs} s.\n` +
  `Numbers: head_cut = % of head+hat inside the frame (100 = whole). body_side = % of the figure's width inside the frame. face_covered = face rays (head centre, two eyes) blocked by set geometry. feet = cm between the foot and the surface below (+ floats, - inside). body_in_mesh = % of the body (neck to sole) inside a solid set part (counter, table, tub, chair, cart).\n\n` +
  `| ${head.join(' | ')} | crop |\n|${head.map(() => '---').join('|')}|---|\n` + rows.map(r => `| ${cell(r).join(' | ')} | ${r.crop ? `[crop](${r.crop})` : ''} |`).join('\n') + '\n' + (res.notes.length ? '\nNotes:\n' + res.notes.map(s => '- ' + s).join('\n') + '\n' : ''));
const pad = (s, w) => String(s).length > w ? String(s).slice(0, w - 1) + '~' : String(s).padEnd(w), wd = [6, 14, 12, 13, 9, 9, 10, 58], bad = rows.filter(r => r.status !== 'PASS'), show = bad.slice(0, 32);
console.log(`frame_checks: ${path.basename(EP)}/${path.basename(FILM)}  ${res.frames} of ${N} frames (rests ${summary.rests.join(' ') || 'none'})  cast ${res.cast.join(', ')}`);
console.log(head.map((h, i) => pad(h, wd[i])).join(' ')); for (const r of show) console.log(cell(r).map((c, i) => pad(c, wd[i])).join(' '));
if (bad.length > show.length) console.log(`... ${bad.length - show.length} more in frame_checks.md`);
for (const e of pageErr) console.log(e);
console.log(`${summary.fail} FAIL, ${summary.warn} WARN, ${summary.pass} PASS (${secs} s, scan ${summary.scan_seconds} s)  ->  ${path.join(OUT, 'frame_checks.md')}` + (res.crops.length ? `, ${res.crops.length} crops in ${cropDir}` : ''));
process.exit(summary.fail ? 1 : 0);
