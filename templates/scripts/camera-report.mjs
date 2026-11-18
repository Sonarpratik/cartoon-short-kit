// Camera numbers for a whole short, without rendering a single picture (poses only).
// Needs a player that calls installCameraProbe() from templates/bridge/transitions.ts.
// Usage: node templates/scripts/camera-report.mjs [previewUrl] [out.json]
//   PREVIEW_URL / CHROME_PATH env vars work as in the other scripts.
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const url = process.argv[2] || process.env.PREVIEW_URL || 'http://127.0.0.1:8788';
const out = process.argv[3];
const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${url}/?scale=0.25`);
  await page.waitForFunction(() => window.ready || window.lastError, null, { timeout: 180000 });
  const issue = await page.evaluate(() => window.lastError); if (issue) throw new Error(issue);
  if (!(await page.evaluate(() => typeof window.cameraReport === 'function'))) throw new Error('This player has no camera probe (installCameraProbe).');
  const r = await page.evaluate(() => window.cameraReport(window.totalFrames, window.fps));
  if (errors.length) throw new Error(errors.join('\n'));
  if (out) await writeFile(out, JSON.stringify(r, null, 2));
  const pct = (g) => `${g >= 0 ? '+' : ''}${Math.round(g * 100)}%`;
  console.log('shot  frames      scenes            push   max look-down at a character');
  r.shots.forEach((s, i) => console.log(`${String(i + 1).padStart(3)}  ${String(s.f0).padStart(4)}-${String(s.f1).padEnd(5)} ${s.scenes.join('+').padEnd(17)} ${pct(s.grow).padStart(5)}  ${s.maxDown ? `${s.maxDown.deg} deg (${s.maxDown.who} @${s.maxDown.f})` : '-'}`));
  console.log('\nhard cuts at: ' + (r.hardCuts.map((c) => `${c.f} ${c.from}->${c.to}`).join(', ') || 'none'));
  for (const v of r.verdict) console.log(v);
  process.exitCode = r.verdict.some((v) => v.startsWith('FAIL')) ? 1 : 0;
} finally { await browser.close(); }
