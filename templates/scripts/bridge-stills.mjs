// npm run stills -- out/bridge/frame_ 0,100,400 0.5
// Use a range such as 0-2024 for an entire frame sequence. Start npm run dev first.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [prefix, selection, scale = '0.5'] = process.argv.slice(2);
if (!prefix || !selection) throw new Error('Usage: npm run stills -- <prefix> <frames: 0,100 or 0-2024> [scale]');
const frames = selection.split(',').flatMap((part) => {
  if (!/^\d+(?:-\d+)?$/.test(part)) throw new Error('Invalid frame selection');
  const [a, b = a] = part.split('-').map(Number);
  if (b < a) throw new Error('Frame range must ascend');
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
});
await mkdir(path.dirname(prefix), { recursive: true });
const backViews = [];
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 2100 }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => console.error(error.message));
  await page.goto(`${process.env.PREVIEW_URL || 'http://127.0.0.1:8788'}/?scale=${encodeURIComponent(scale)}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 });
  await page.addStyleTag({ content: `#screen{height:${Math.round(1920 * Number(scale))}px;width:${Math.round(1080 * Number(scale))}px}` });
  // No-backs gate: character-rig.ts logs every draw past a pure profile (|yaw| > 90).
  // Cached character textures are drawn once, so a warning names the first frame that used the view.
  await page.evaluate(() => { if (globalThis.__rigBackViews) globalThis.__rigBackViews.length = 0; });
  for (const frame of frames) {
    await page.evaluate((f) => window.renderFrame(f), frame);
    const backs = await page.evaluate(() => (globalThis.__rigBackViews ? globalThis.__rigBackViews.splice(0) : []));
    if (backs.length) backViews.push({ frame, views: [...new Set(backs.map((b) => `${b.id}@${Math.round(b.yaw)}deg`))] });
    const filename = `${prefix}${String(frame).padStart(4, '0')}.jpg`;
    await page.locator('#screen').screenshot({ path: filename, type: 'jpeg', quality: 95, animations: 'disabled', timeout: 180000 });
    console.log(filename);
  }
  if (backViews.length) {
    const report = `${prefix}back-views.json`;
    await writeFile(report, JSON.stringify(backViews, null, 2));
    console.error(`BACK VIEW: ${backViews.length} frame(s) show a character from behind. Restage with frontSafeYaw() or move the camera. Report: ${report}`);
    if (process.env.ALLOW_BACK_VIEWS !== '1') process.exitCode = 1;
  }
} finally { await browser.close(); }
