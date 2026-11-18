// node render.mjs <move.mjs> <out.mp4> [--still t1,t2,...]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { makeChar } from './rig.mjs';
import { frameSvg } from './stage.mjs';
const [, , modSpec, out, flag, list] = process.argv;
const [modPath, exp] = modSpec.split('#');
const move = (await import(new URL(modPath, 'file://' + process.cwd() + '/').href))[exp || 'default'];
const chars = move.styles.map(s => makeChar(s.form || move.form || 'standard', { coat: s.coat }));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.setContent('<html><body style="margin:0;background:#000"></body></html>');
const show = async t => pg.evaluate(s => { document.body.innerHTML = s; }, frameSvg(move, t, chars));
if (flag === '--still') {
  let i = 0; for (const t of list.split(',').map(Number)) { await show(t); await pg.screenshot({ path: out.replace(/\.png$/, `_${i++}.png`) }); }
} else {
  const fps = 30, N = Math.round(move.dur * fps), reps = move.reps || 1;
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'fast', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let r = 0; r < reps; r++) for (let k = 0; k < N; k++) { await show(k / fps); const buf = await pg.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await b.close();
