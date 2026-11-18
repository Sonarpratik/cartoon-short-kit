// check_views.mjs - guards the CHARACTER VIEW RULES (CB approved sheet v5 on 2026-11-10 03:32, "now is fully correct").
// It draws the reference characters in the four views (front, 3/4, side, back) and compares every tile with the approved
// picture in templates/vector2d_characters/views_golden/. Run it after ANY change to char2d.mjs, castkit.mjs, cast.mjs,
// memes*.mjs, bodies.mjs, puppets.mjs or poses.mjs, and before a film is rendered.
//
//   node tools/check_views.mjs                  compare, exit 1 on any difference; writes views_golden/_last_run/ + _last_sheet.png
//   node tools/check_views.mjs --update         re-make the approved pictures. ONLY after CB has approved the new sheet.
//   node tools/check_views.mjs --add cast:name [--sheet path/to/sheet.mjs]   draw a new character's four views into
//                                               _last_run/ for a look by eye against VIEW_RULES.md (add it to rows.json after CB's OK)
// The rules themselves are in templates/vector2d_characters/VIEW_RULES.md.
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url'; import { createRequire } from 'module';
const require = createRequire(import.meta.url), ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG = path.join(ROOT, 'templates/vector2d_characters/code'), KIT = path.join(ROOT, 'templates/threejs_film'), GOLD = path.join(ROOT, 'templates/vector2d_characters/views_golden');
const args = process.argv.slice(2), has = f => args.includes(f), val = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const imp = f => import(pathToFileURL(f).href);
const VIEWS = ['front', '34', 'side', 'back'];
const cfg = JSON.parse(fs.readFileSync(path.join(GOLD, 'rows.json'), 'utf8'));
let chars = cfg.characters;                                       // [{ puppet, name, sheet? (path from the skill root) }]
if (val('--add')) chars = [{ puppet: val('--add'), name: val('--add').replace(/[^a-z0-9]+/gi, '_'), sheet: val('--sheet') }];

// work on a temporary copy of the package so that an episode's own sheet (which imports ../castkit.mjs) can sit beside the locked sheets
const os = await import('os'), TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'views_')); fs.mkdirSync(path.join(TMP, 'sheets'));
for (const f of fs.readdirSync(PKG)) if (f.endsWith('.mjs')) fs.copyFileSync(path.join(PKG, f), path.join(TMP, f));
for (const f of fs.readdirSync(path.join(PKG, 'sheets'))) if (f.endsWith('.mjs')) fs.copyFileSync(path.join(PKG, 'sheets', f), path.join(TMP, 'sheets', f));
for (const f of ['puppets.mjs', 'poses.mjs']) fs.copyFileSync(path.join(KIT, f), path.join(TMP, f));
for (const c of chars) if (c.sheet) { const f = path.resolve(ROOT, c.sheet); if (fs.existsSync(f)) fs.copyFileSync(f, path.join(TMP, 'sheets', path.basename(f))); else c.missing = true; }
const [char2d, memes, memes2, memes3, bodies, cast, castkit] = await Promise.all(['char2d', 'memes', 'memes2', 'memes3', 'bodies', 'cast', 'castkit'].map(n => imp(path.join(TMP, n + '.mjs'))));
const P = await imp(path.join(TMP, 'puppets.mjs'));
const castIndex = {};
for (const f of fs.readdirSync(path.join(TMP, 'sheets')).sort()) { const m = await imp(path.join(TMP, 'sheets', f)); for (const c of m.CAST || []) castIndex[c.name] ??= c; }
P.initPuppets({ char2d, memes, memes2, memes3, bodies, cast, castkit, castIndex });

let chromium; try { ({ chromium } = await import('playwright')); } catch { try { ({ chromium } = require(path.join(KIT, 'node_modules/playwright'))); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright')); } }
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 800, height: 1500 } });
const OUT = path.join(GOLD, '_last_run'); fs.mkdirSync(OUT, { recursive: true });
const update = has('--update'), adding = !!val('--add'), bad = [], rowsDone = [];
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
for (const c of chars) {
  if (c.missing) { console.log(`  SKIP ${c.name}: sheet ${c.sheet} is not in this copy`); continue; }
  const tiles = [];
  for (const view of VIEWS) {
    const svg = P.svgFor({ puppet: c.puppet }, { view, dir: 1, pose: 'stand', face: 'standard', prop: null, hand: null, mouth: null, blink: null });
    await page.setContent(`<body style="margin:0;background:#cfd8e6">${svg}</body>`);
    const name = `${c.name}_${view}.png`, now = path.join(OUT, name), gold = path.join(GOLD, name);
    await page.screenshot({ path: now }); tiles.push(now);
    if (adding) continue;
    if (update) { fs.copyFileSync(now, gold); continue; }
    if (!fs.existsSync(gold)) { bad.push(`${name}: no approved picture`); continue; }
    // share of pixels that differ clearly from the approved picture (a small allowance covers anti-aliasing between Chromium builds)
    const d = await page.evaluate(async ([a, b]) => { const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; }); const [A, B] = await Promise.all([load(a), load(b)]);
      const px = im => { const c = document.createElement('canvas'); c.width = 800; c.height = 1500; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, 800, 1500).data; };
      const p = px(A), q = px(B); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 120) { n++; const k = i / 4, x = k % 800, y = (k - x) / 800; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      return { pct: n / (800 * 1500) * 100, box: n ? [x0, y0, x1, y1] : null }; }, [b64(now), b64(gold)]);
    const ok = d.pct <= (c.allow_pct ?? cfg.max_diff_pct ?? 0.05);   // allow_pct: a character whose drawing holds lettering (system font, differs a little between Windows and Linux)
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(28)} differs ${d.pct.toFixed(3)} %${d.box ? '  in box ' + d.box.join(',') : ''}`);
    if (!ok) bad.push(`${name}: ${d.pct.toFixed(2)} % of the card differs from the approved view (box ${d.box.join(',')})`);
  }
  rowsDone.push(tiles);
}
// contact sheet of this run, for a look by eye
if (rowsDone.length) { const W = 400, H = 750;
  await page.setViewportSize({ width: W * 4, height: H * rowsDone.length + 60 });
  await page.setContent(`<body style="margin:0;background:#cdd7e6;font:700 34px sans-serif;color:#2a1a22"><div style="display:flex;height:60px;align-items:center">${['Front', '3/4', 'Side', 'Back'].map(t => `<div style="width:${W}px;text-align:center">${t}</div>`).join('')}</div>${rowsDone.map(r => `<div style="display:flex">${r.map(f => `<img src="${b64(f)}" width="${W}" height="${H}">`).join('')}</div>`).join('')}</body>`);
  await page.waitForTimeout(200); await page.screenshot({ path: path.join(GOLD, adding ? '_added_sheet.png' : '_last_sheet.png') }); }
await browser.close(); fs.rmSync(TMP, { recursive: true, force: true });
if (update) { console.log(`approved pictures re-made in ${GOLD} (only valid if CB approved this sheet)`); process.exit(0); }
if (adding) { console.log(`drawn: ${path.join(GOLD, '_added_sheet.png')} - check it by eye against VIEW_RULES.md`); process.exit(0); }
console.log(bad.length ? `RESULT: FAIL, ${bad.length} view tile(s) no longer match the sheet CB approved:\n  ` + bad.join('\n  ') + `\n  FIX: undo the change that altered the view, or show CB the new sheet (${path.join(GOLD, '_last_sheet.png')}) and run --update only after his OK.` : `RESULT: PASS, all views match the sheet CB approved (${rowsDone.length} characters x 4 views).`);
process.exit(bad.length ? 1 : 0);
