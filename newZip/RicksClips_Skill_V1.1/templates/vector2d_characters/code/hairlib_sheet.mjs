// Sheet: every hair style in the library, front / side / back on the standard template (3/4 = front hair, VIEW_RULES 2)
import { buildChar } from './castkit.mjs'; import { drawCharacter } from './char2d.mjs'; import { HAIR_STYLES, withHair } from './hair_lib.mjs'; import fs from 'fs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const out = process.argv[2], only = process.argv[3] ? process.argv[3].split(',') : Object.keys(HAIR_STYLES), opt = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const views = opt.views || [['front', 1], ['side', 1], ['back', 1]], tw = opt.tw || 190, th = opt.th || 230, perRow = opt.perRow || 4;
const dd = t => t.replace(/<[a-zA-Z][^>]*>/g, tag => { const seen = new Set(); return tag.replace(/\s([a-zA-Z:-]+)="[^"]*"/g, (m, k) => seen.has(k) ? '' : (seen.add(k), m)); });
let h = '', i = 0;
for (const key of only) {
  const st = HAIR_STYLES[key], col = i % perRow, row = Math.floor(i / perRow), X = col * (tw * views.length + 16) + 8, Y = row * (th + 50) + 8;
  h += `<div style="position:absolute;left:${X}px;top:${Y}px;width:${tw * views.length}px;font:bold 17px sans-serif;color:#1d2f6f">${i + 1}. ${st.label}<div style="font:13px sans-serif;color:#556">${st.era}</div></div>`;
  views.forEach(([v, d], j) => {
    let svg;
    try { const spec = withHair({ name: key, form: opt.form || 'standard', coat: opt.coat || '#5f7fa6', face: 'standard' }, key, { pieces: opt.pieces, hat: opt.hat });
      const S = buildChar(spec, 300); S.view = v; S.dir = d; const r = drawCharacter(S), K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78;
      svg = dd(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${300 - 250} ${hy - 290} 500 ${500 * th / tw}" width="${tw}" height="${th}"><defs>${r.defs}</defs>${r.body}</svg>`);
    } catch (e) { svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}"><text y="20" font-size="10">${e.message}</text></svg>`; console.log(key, v, e.stack); }
    h += `<div style="position:absolute;left:${X + j * tw}px;top:${Y + 40}px;width:${tw}px;height:${th}px;background:#fff;border:1px solid #c5cddb"><img width="${tw}" height="${th}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"><div style="position:absolute;left:4px;top:2px;font:11px sans-serif;color:#889">${v}</div></div>`;
  });
  i++;
}
const W = perRow * (tw * views.length + 16) + 8, H = Math.ceil(i / perRow) * (th + 50) + 16;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
await pg.setContent(`<html><body style="margin:0;background:#e4e9f1;position:relative">${opt.title ? '' : ''}${h}</body></html>`); await pg.screenshot({ path: out }); await b.close(); console.log('ok', i);
