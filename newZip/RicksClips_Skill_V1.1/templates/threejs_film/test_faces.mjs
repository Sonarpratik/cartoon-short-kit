// node test_faces.mjs out.png '<json>'  - acting face close-ups: rows of presets x views (head and shoulders)
// opts: { faces: [[preset, label, {side}]], views: ['front','34','side'], dir, tw, th }
import { buildChar } from '../vector2d_characters/code/castkit.mjs';
import { drawCharacter } from '../vector2d_characters/code/char2d.mjs';
import { withHair } from '../vector2d_characters/code/hair_lib.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const O = JSON.parse(process.argv[3] || '{}'), views = O.views || ['front', '34', 'side'], tw = O.tw || 220, th = O.th || 220;
const dd = t => t.replace(/<[a-zA-Z][^>]*>/g, tag => { const seen = new Set(); return tag.replace(/\s([a-zA-Z:-]+)="[^"]*"/g, (m, k) => seen.has(k) ? '' : (seen.add(k), m)); });
function card(face, view, X) {
  let spec = { name: 'x', form: 'standard', size: 'standard', coat: '#5f7fa6', face: 'standard', outfit: 'peasant' }; spec = withHair(spec, O.hair || 'sidePart');
  const S = buildChar(spec, 300); S.view = view; S.dir = O.dir || 1; S.face = { expr: face, ...(X.side ? { side: X.side * (O.dir || 1) } : {}) };
  const r = drawCharacter(S), hy = (S.bodyTop ?? 333) - 150 * .78;
  return dd(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${300 - 190} ${hy - 200} 380 380" width="${tw}" height="${th}"><rect x="-500" y="-500" width="2000" height="3000" fill="#fff"/><defs>${r.defs}</defs>${r.body}</svg>`);
}
let h = '', Y = 10;
for (const [face, label, X = {}] of O.faces) { h += `<div style="position:absolute;left:8px;top:${Y}px;font:bold 20px sans-serif;color:#1d2f6f">${label}</div>`; Y += 28;
  views.forEach((v, i) => { h += `<div style="position:absolute;left:${8 + i * (tw + 4)}px;top:${Y}px;border:1px solid #c5cddb;width:${tw}px;height:${th}px">${card(face, v, X)}</div>`; }); Y += th + 12; }
const W = 16 + views.length * (tw + 4), b = await chromium.launch(), pg = await b.newPage({ viewport: { width: W, height: Y }, deviceScaleFactor: O.dpr || 1 });
await pg.setContent(`<html><body style="margin:0;background:#e4e9f1;position:relative;width:${W}px;height:${Y}px">${h}</body></html>`); await pg.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); console.log('ok', W, Y);
