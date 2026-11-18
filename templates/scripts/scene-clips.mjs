// Scene-by-scene review clips: one short MP4 per scene (its own frame range, with its slice of the narration),
// for the review folder of a version. This is a review render, not the final video (that still waits for "generate").
//
// Usage (preview server running):
//   node templates/scripts/scene-clips.mjs <outDir> [--scale 0.5] [--audio input/voice.wav] [--scenes S01,S03]
//   e.g. node ../../templates/scripts/scene-clips.mjs review/v1_ALL_SCENES/clips --audio input/voice_edit.wav
// Env: PREVIEW_URL (default http://127.0.0.1:8788), CHROME_PATH, RENDER_GL (default d3d11, or swiftshader), FFMPEG.
// The player must expose window.ready, window.renderFrame(f), window.fps and window.frameMeta = [{id, f0, f1, title?, words?}]
// (scene ranges, f1 exclusive), as the project players do.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2), out = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
if (!out) throw new Error('Usage: node scene-clips.mjs <outDir> [--scale 0.5] [--audio voice.wav] [--scenes S01,S02]');
const scale = Number(opt('scale', '0.5')), audio = opt('audio'), only = opt('scenes')?.split(',');
if (!(scale > 0 && scale <= 1)) throw new Error('Scale must be in (0, 1]');

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  const py = spawnSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' });
  if (py.status === 0 && py.stdout.trim()) return py.stdout.trim();
  throw new Error('ffmpeg not found: put it on PATH, set FFMPEG, or pip install imageio-ffmpeg');
}
const FF = ffmpegPath();
await mkdir(out, { recursive: true });
const W = Math.round(1080 * scale / 2) * 2, H = Math.round(1920 * scale / 2) * 2;
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: [`--use-angle=${process.env.RENDER_GL || 'd3d11'}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const made = [];
try {
  const page = await browser.newPage({ viewport: { width: W + 200, height: H + 300 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${process.env.PREVIEW_URL || 'http://127.0.0.1:8788'}/?scale=${scale}`);
  await page.waitForFunction(() => window.ready === true || window.lastError, null, { timeout: 180000 });
  const issue = await page.evaluate(() => window.lastError); if (issue) throw new Error(issue);
  const { scenes, fps } = await page.evaluate(() => ({ scenes: window.frameMeta, fps: window.fps || 30 }));
  if (!Array.isArray(scenes) || !scenes.length) throw new Error('The player exposes no window.frameMeta scene list');
  await page.addStyleTag({ content: `#screen{width:${W}px;height:${H}px}` });
  for (const s of scenes.filter((s) => !only || only.includes(s.id))) {
    const file = path.join(out, `${s.id}.mp4`), n = s.f1 - s.f0;
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
    if (audio) args.push('-ss', (s.f0 / fps).toFixed(3), '-t', (n / fps).toFixed(3), '-i', audio);
    args.push('-map', '0:v', ...(audio ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '160k'] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'fast', '-shortest', file);
    const ff = spawn(FF, args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = s.f0; f < s.f1; f++) {
      await page.evaluate((f) => window.renderFrame(f), f);
      const buf = await page.locator('#screen').screenshot({ type: 'jpeg', quality: 90, animations: 'disabled' });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    const code = await new Promise((r) => ff.on('close', r));
    if (code !== 0) throw new Error(`ffmpeg failed on ${s.id}`);
    made.push({ id: s.id, f0: s.f0, f1: s.f1, title: s.title, words: s.words, clip: path.basename(file) });
    console.log(`${s.id} ${n} frames -> ${file} (${((Date.now() - t0) / n).toFixed(0)} ms/frame)`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  await writeFile(path.join(out, 'clips.json'), JSON.stringify(made, null, 2));
  console.log(`Scene clips done: ${made.length} scenes in ${out}. Review render only; the final video waits for "generate".`);
} finally { await browser.close(); }
