import { buildChar } from './castkit.mjs'; import { drawCharacter } from './char2d.mjs'; import { HAIR_STYLES, withHair } from './hair_lib.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const COMBOS = JSON.parse(process.argv[3]), views = [['front', 1], ['side', 1], ['back', 1]], tw = 190, th = 230, perRow = 4;
const dd = t => t.replace(/<[a-zA-Z][^>]*>/g, tag => { const seen = new Set(); return tag.replace(/\s([a-zA-Z:-]+)="[^"]*"/g, (m, k) => seen.has(k) ? '' : (seen.add(k), m)); });
let h = '';
COMBOS.forEach(([key, pieces, hat, title, coat], i) => {
  const col = i % perRow, row = Math.floor(i / perRow), X = col * (tw * 3 + 16) + 8, Y = row * (th + 50) + 8;
  h += `<div style="position:absolute;left:${X}px;top:${Y}px;font:bold 17px sans-serif;color:#1d2f6f">${title}<div style="font:13px sans-serif;color:#556">hair: ${HAIR_STYLES[key].label}${pieces.length ? ' + ' + pieces.join(', ') : ''}${hat ? ' + hat: ' + hat : ''}</div></div>`;
  views.forEach(([v, d], j) => { let svg;
    try { const S = buildChar(withHair({ name: key, form: 'standard', coat: coat || '#5f7fa6', face: 'standard' }, key, { pieces, hat }), 300); S.view = v; S.dir = d; const r = drawCharacter(S), hy = 333 - 117;
      svg = dd(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 ${hy - 300} 500 ${500 * th / tw}" width="${tw}" height="${th}"><defs>${r.defs}</defs>${r.body}</svg>`); } catch (e) { console.log(key, e.stack); svg = '<svg xmlns="http://www.w3.org/2000/svg"/>'; }
    h += `<div style="position:absolute;left:${X + j * tw}px;top:${Y + 40}px;width:${tw}px;height:${th}px;background:#fff;border:1px solid #c5cddb"><img width="${tw}" height="${th}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"><div style="position:absolute;left:4px;top:2px;font:11px sans-serif;color:#889">${v}</div></div>`; });
});
const W = perRow * (tw * 3 + 16) + 8, H = Math.ceil(COMBOS.length / perRow) * (th + 50) + 16;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
await pg.setContent(`<html><body style="margin:0;background:#e4e9f1;position:relative">${h}</body></html>`); await pg.screenshot({ path: process.argv[2] }); await b.close(); console.log('ok');
