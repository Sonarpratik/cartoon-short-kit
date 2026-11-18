// face board for the v2 sets: node board3.mjs teen|villain|monster [cols]  -> out/<set>_board.png
import { TEEN, VILLAIN, MONSTER, memes3Defs } from './memes3.mjs';
import { headPts, smooth, inkRing } from './char2d.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('/opt/node-tools/node_modules/playwright');
const set = process.argv[2], cols = +(process.argv[3] || 6), K = 1.5, CW = 470, CH = 620;
const SET = { teen: TEEN, villain: VILLAIN, monster: MONSTER }[set], SHAPE = { teen: 'rick', villain: 'rick', monster: 'potato' }[set];
const fix = s => s.replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${(+w / Math.sqrt(K)).toFixed(2)}"`);
const head = (n, cx, hy) => {
  const M = SET[n](cx, hy), shape = SHAPE, HP = headPts(cx, hy, 100, shape);
  const skin = M.skin ? `url(#${M.skin})` : 'url(#sk)';
  const g = [...(M.under || []), `<path d="${smooth(HP)}" fill="${skin}"/>`, inkRing(HP, 13 * 1.12 / K, { seed: 5 }), ...M.over].join('');
  return `<g transform="rotate(${M.rot || 0} ${cx} ${hy}) translate(${cx} ${hy}) scale(${M.sx || 1},${M.sy || 1}) translate(${-cx} ${-hy})">${g}</g>`;
};
const names = Object.keys(SET); let body = '';
names.forEach((n, i) => {
  const cx = (i % cols) * CW + CW / 2, hy = Math.floor(i / cols) * CH + 290;
  body += `<g transform="translate(${cx},${hy}) scale(${K}) translate(${-cx},${-hy})">${fix(head(n, cx, hy))}</g>`;
  body += `<text x="${cx}" y="${hy + 300}" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle" fill="#2a1a1f">${n}</text>`;
});
const W = CW * cols, H = Math.ceil(names.length / cols) * CH + 20;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${memes3Defs()}</defs><rect width="${W}" height="${H}" fill="#e9e4da"/>${body}</svg>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({ path: `out/${set}_board.png` }); await b.close(); console.log('ok', set, names.length, W, H);
