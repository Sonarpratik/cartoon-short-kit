// node castsheet.mjs sheets/sheet01.mjs [out.png]  -> 10 characters (2 rows x 5) + a far-away silhouette strip
import { renderChar } from './castkit.mjs';
import { createRequire } from 'module'; import path from 'path'; import { pathToFileURL } from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('/opt/node-tools/node_modules/playwright');
const mod = await import(pathToFileURL(path.resolve(process.argv[2])).href), CAST = mod.CAST, TITLE = mod.TITLE || '';
const out = process.argv[3] || 'out/' + path.basename(process.argv[2], '.mjs') + '.png';
const SW = 520, ROWH = 1310, TOPPAD = 110, cols = 5, DY = 210, STRIP = TOPPAD + 2 * ROWH + 20;
let defs = '', body = '', labels = '', sil = '';
CAST.forEach((spec, i) => {
  const col = i % cols, row = Math.floor(i / cols), cx = col * SW + SW / 2, oy = TOPPAD + row * ROWH + DY;
  const r = renderChar(spec, cx), u = t => t.replace(/id="([gc]\d+)"/g, `id="k${i}_$1"`).replace(/url\(#([gc]\d+)\)/g, `url(#k${i}_$1)`);
  defs += u(r.defs);
  const g = `<g transform="translate(0,${oy})">${u(r.body)}</g>`; body += g;
  labels += `<text x="${cx}" y="${oy + 1010 + 62}" font-family="Arial Black,Arial" font-weight="900" font-size="32" text-anchor="middle" fill="#2a1a1f">${spec.label || spec.name}</text>`;
  // silhouette strip: same drawing, solid ink, 1/6 size
  const sx = (i + .5) * SW * cols / CAST.length, k = 1 / 6;
  sil += `<g transform="translate(${sx},${STRIP + 20}) scale(${k}) translate(${-cx},${-oy + 120})" filter="url(#ink)">${g}</g>`;
});
const W = SW * cols, H = STRIP + 250;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${defs}<filter id="ink"><feColorMatrix type="matrix" values="0 0 0 0 .16  0 0 0 0 .1  0 0 0 0 .12  0 0 0 1 0"/></filter></defs>
<rect width="${W}" height="${H}" fill="#e9e4da"/><text x="40" y="76" font-family="Arial Black,Arial" font-weight="900" font-size="54" fill="#2a1a1f">${TITLE}</text>
${[0, 1].map(r => `<path d="M0,${TOPPAD + r * ROWH + DY + 1010} L${W},${TOPPAD + r * ROWH + DY + 1010}" stroke="#2a1a1f" stroke-opacity=".2" stroke-width="3"/>`).join('')}
${body}${labels}<rect x="0" y="${STRIP}" width="${W}" height="250" fill="#f6f3ec"/><text x="${W - 30}" y="${H - 20}" font-family="sans-serif" font-size="24" text-anchor="end" fill="#2a1a1f" opacity=".6">far-away silhouette check</text>${sil}</svg>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({ path: out }); await b.close(); console.log('ok', out, W, H);
