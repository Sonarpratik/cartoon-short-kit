import { drawCharacter } from './char2d.mjs';
import { memes2Defs } from './memes2.mjs';
import { FORMS, ORDER2 as ORDER, formChar } from './bodies.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('/opt/node-tools/node_modules/playwright');
const view = process.argv[2] || 'front', out = process.argv[3] || `out/bodies2_${view}.png`;
const SLOT = { toddler: 340, teen: 380, teengirl: 380, brute: 640, ghost: 480,  standard: 400, chad: 560, bigboi: 600, noodle: 340, kid: 340, dad: 460, lady: 440, elder: 460, baby: 400 };
const DY = 260, GROUND = 1010 + DY; let x = 0, defs = '', body = '', labels = '';
for (const n of ORDER.concat(['kid','standard'])) {
  const cx = x + SLOT[n] / 2; x += SLOT[n];
  const c = { ...formChar(n, cx, view), dy: DY, extraDefs: memes2Defs() };
  if (view !== 'front') delete c.meme;
  const r = drawCharacter(c), u = t => t.replace(/id="([gc]\d+)"/g, `id="${n}_$1"`).replace(/url\(#([gc]\d+)\)/g, `url(#${n}_$1)`); defs += u(r.defs); body += u(r.body);
  labels += `<text x="${cx}" y="${GROUND + 70}" font-family="sans-serif" font-weight="bold" font-size="30" text-anchor="middle" fill="#2a1a1f">${FORMS[n].label}</text>`;
}
const W = x, H = GROUND + 110;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="#e9e4da"/><path d="M0,${GROUND} L${W},${GROUND}" stroke="#2a1a1f" stroke-opacity=".25" stroke-width="3"/>${body}${labels}</svg>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({ path: out }); await b.close(); console.log('ok', W, H);
