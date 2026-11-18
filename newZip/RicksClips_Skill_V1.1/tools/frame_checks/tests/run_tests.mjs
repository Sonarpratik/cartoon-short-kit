// run_tests.mjs: runs check.mjs on the three broken copies and says whether each FAILS with the right check. Exit 0 = the tool caught all three.
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), WANT = { head_top: ['chief', 'head_cut', /top/], side_half: ['chief', 'body_side', /right/], in_cowl: ['mathematician', 'face_covered', /cowl|nacelle|engine/i] }; let ok = 0;
for (const [name, [who, check, what]] of Object.entries(WANT)) { const t0 = Date.now(), r = spawnSync(process.execPath, [path.join(HERE, '..', 'check.mjs'), path.join(HERE, name, 'film.json')], { encoding: 'utf8' });
  const rows = JSON.parse(fs.readFileSync(path.join(HERE, name, 'out', 'frame_checks.json'), 'utf8')).rows, hit = rows.find(x => x.status === 'FAIL' && x.who === who && x.check === check && what.test(x.detail));
  if (hit && r.status === 1) ok++; console.log(`${hit && r.status === 1 ? 'CAUGHT' : 'MISSED'}  ${name}: exit ${r.status}, ${((Date.now() - t0) / 1000).toFixed(0)} s` + (hit ? `, ${hit.who} ${hit.check} ${hit.value} at f${hit.frame} in ${hit.rest}, ${hit.bad_frames}/${hit.frames} frames, ${hit.detail}` : ''));
  for (const x of rows.filter(x => x.status === 'FAIL' && x !== hit)) console.log(`        also FAIL: ${x.who} ${x.rest} ${x.check} ${x.value} (${x.detail})`); }
process.exit(ok === 3 ? 0 : 1);
