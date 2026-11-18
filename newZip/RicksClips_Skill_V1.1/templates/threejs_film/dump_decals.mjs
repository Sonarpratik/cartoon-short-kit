// dump_decals.mjs (kit 2026-11-13, from the fireworks test): canvas-texture decals on set meshes (footprints, ruts, soot, scorch, wet marks...)
// are written WHITE by --export-lock. This dumps them as PNGs + look/decals/DECALS.json so Blender lays the same alpha decals. Data only.
// Run in the episode folder:  node <kit>/dump_decals.mjs [film.json] [--mats snow_dent,scorch,...]
// A mesh counts as a decal when userData.decal is true or its userData.mat is in --mats (default: snow_dent, snow_trodden, scorch, snow_wet).
import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ARG = process.argv.slice(2), mi = ARG.indexOf('--mats'), MATS = mi >= 0 ? ARG[mi + 1].split(',') : ['snow_dent', 'snow_trodden', 'scorch', 'snow_wet'];
const FILM = path.resolve(ARG.find(a => a.endsWith('.json')) || 'film.json'), EP = path.dirname(FILM), OUT = path.join(EP, 'look', 'decals'), KIT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PORT = 18000 + Math.floor(Math.random() * 2000);
const srv = spawn(process.execPath, [path.join(KIT, 'render.mjs'), FILM, '--serve', String(PORT)], { cwd: EP, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((ok, no) => { let buf = ''; srv.stdout.on('data', d => { buf += d; if (/Open http/.test(buf)) ok(); }); srv.on('exit', c => no(new Error('kit server exited ' + c))); });
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 270, height: 480 } });
page.on('pageerror', e => console.log('[page error]', e.message));
try {
  await page.goto(`http://127.0.0.1:${PORT}/kit/film_page.html`);
  await page.evaluate(async () => { const T = await import('/kit/vendor/three.module.js'); window.__ALL = []; const add = T.Object3D.prototype.add;
    T.Object3D.prototype.add = function (...a) { for (const o of a) window.__ALL.push(o); return add.apply(this, a); }; });
  const SH = path.join(EP, 'out', '.puppet_cache', 'sheets'), sheets = fs.existsSync(SH) ? fs.readdirSync(SH).sort() : [];
  await page.evaluate(c => window.setup(c), { film: '/ep/film.json', W: 270, H: 480, captions: false, sheets, epSets: fs.readdirSync(path.join(EP, 'sets')) });
  const res = await page.evaluate((MATS) => { const seen = new Map(), names = {}, MK = new Set(MATS);
    const all = new Set(); for (const o of window.__ALL) o.traverse(x => all.add(x));
    for (const o of all) { if (!o.isMesh || !(o.userData.decal || MK.has(o.userData.mat))) continue; const m = [].concat(o.material)[0], t = m && m.map; if (!t || !(t.image instanceof HTMLCanvasElement)) continue;
      let id = seen.get(t.image); if (!id) { id = 'd' + seen.size; seen.set(t.image, id); }
      const n = o.name.replace(/(_\d+)?$/, ''); (names[o.name] ||= { tex: id, mat: o.userData.mat, mname: m.name || '', color: '#' + m.color.getHexString(), opacity: m.opacity, basic: !!m.isMeshBasicMaterial, rough: m.roughness ?? null, rep: [t.repeat.x, t.repeat.y], count: 0 }).count++; }
    const tex = {}; for (const [c, id] of seen) tex[id] = { png: c.toDataURL('image/png'), w: c.width, h: c.height };
    return { names, tex }; }, MATS);
  fs.mkdirSync(OUT, { recursive: true }); const man = { format: 'decals/1', how: 'object base name -> texture; sRGB RGBA canvas, colour over the snow by alpha (three.js: map * color, transparent)', names: res.names, tex: {} };
  for (const [id, t] of Object.entries(res.tex)) { fs.writeFileSync(path.join(OUT, id + '.png'), Buffer.from(t.png.split(',')[1], 'base64')); man.tex[id] = { file: id + '.png', w: t.w, h: t.h }; }
  fs.writeFileSync(path.join(OUT, 'DECALS.json'), JSON.stringify(man, null, 1));
  console.log(Object.keys(res.tex).length, 'textures,', Object.keys(res.names).length, 'names'); console.log(Object.entries(res.names).map(([k, v]) => `${k}:${v.tex}:${v.mat}x${v.count}`).join('\n'));
} finally { await browser.close(); srv.kill(); }
