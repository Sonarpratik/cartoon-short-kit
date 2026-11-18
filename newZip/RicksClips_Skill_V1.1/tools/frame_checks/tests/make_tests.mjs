// make_tests.mjs: builds the three BROKEN copies of the S1 film that prove check.mjs (never touches the original).
//   node tools/frame_checks/tests/make_tests.mjs          then: node tools/frame_checks/tests/run_tests.mjs
// Each copy = the S1 film.json with ONE act changed, its own sets/, cast/, voice/words.json, and the plan baked again (tools/film_plan.py bake).
// The original camera track is put back after the bake, so only the character moved.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..', '..', '..'), SRC = path.join(ROOT, 'episodes', 'armor-no-holes', 'final', 'armor-s1-hook');
const TESTS = {
  // the chief steps to 0.9 m in front of the lens of the rest f298-331 (camera 0.95 m high, level): the frame top is at about 1.7 m, his head is above it
  head_top: f => { const i = f.acts.findLastIndex(a => a.who === 'chief' && a.at <= 290); f.acts.splice(i + 1, 0, { who: 'chief', at: 290, pos: [9.709, 5.309, 0], move_s: 0.1, linear: true, note: 'FRAME CHECK TEST: too close, head above the frame top' }); },
  // the chief's last mark (f206 on) is moved 2.2 m to screen right of the rest f222-283: the right edge runs through him
  side_half: f => { const a = f.acts.find(a => a.who === 'chief' && a.at === 206 && a.pos); a.pos = [8.50, 9.46, 0]; a.note = 'FRAME CHECK TEST: half out of the right edge'; },
  // the mathematician's first mark is moved up into the clean engine cowl (meshes cowl_*_03, plan x 5.1-6.9, y 4.4-6.2, height 1.6-3.15): his head is inside the metal
  in_cowl: f => { const a = f.acts.find(a => a.who === 'mathematician' && a.at === 0 && a.pos); a.pos = [5.98, 5.3, 1.2]; a.note = 'FRAME CHECK TEST: head inside the bomber cowl'; },
};
for (const [name, edit] of Object.entries(TESTS)) {
  const D = path.join(HERE, name); fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(path.join(D, 'voice'), { recursive: true });
  for (const d of ['sets', 'cast']) fs.cpSync(path.join(SRC, d), path.join(D, d), { recursive: true }); fs.copyFileSync(path.join(SRC, 'voice', 'words.json'), path.join(D, 'voice', 'words.json'));
  const film = JSON.parse(fs.readFileSync(path.join(SRC, 'film.json'), 'utf8')); edit(film); film.title = (film.title || 'S1') + ' [frame check test: ' + name + ']';
  film.puppet_pkg = ['cast', '../../../../templates/vector2d_characters/code'];
  fs.writeFileSync(path.join(D, 'film.json'), JSON.stringify(film, null, 1));
  const r = spawnSync('python', [path.join(ROOT, 'tools', 'film_plan.py'), 'bake', path.join(D, 'film.json')], { cwd: D, encoding: 'utf8' });
  console.log(name, (r.stdout || '').trim().split('\n').pop(), (r.stderr || '').trim().split('\n').pop() || '');
  fs.copyFileSync(path.join(SRC, 'out', 'plan', 'camera_baked.json'), path.join(D, 'out', 'plan', 'camera_baked.json'));
}
