import * as char2d from './char2d.mjs'; import * as memes from './memes.mjs'; import * as memes2 from './memes2.mjs'; import * as memes3 from './memes3.mjs'; import * as bodies from './bodies.mjs'; import * as cast from './cast.mjs';
import { initPuppets, svgFor } from './puppets.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('/opt/node-tools/node_modules/playwright');
initPuppets({ char2d, memes, memes2, memes3, bodies, cast });
const who = process.argv[2] || 'form:dad', view = process.argv[3] || 'front', face = process.argv[4] || 'standard', out = process.argv[5] || 'scene.png';
const card = svgFor({ puppet: who }, { view, dir: 1, pose: 'sit_chair+cheer', face });
const W = 1080, H = 1920, KS = 1.25, FEET = 1780, ox = 560 - 400 * KS, oy = FEET - 1440 * KS;
const INK = '#231a20';
const sy = y => y + oy;
const cx = 560, seatY = oy + (1070 + (view === 'side' ? .5 : .3) * 383 - 18) * KS + 30;
let spk = ''; let r = 7; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
for (let i = 0; i < 500; i++) { const x = rnd() * W, y = 1080 + rnd() * 840, c = ['#e0605a', '#2aa6a0', '#5a6a8a'][i % 3]; spk += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + rnd() * 2).toFixed(1)}" fill="${c}" opacity=".55"/>`; }
const chair = (x0, col, dark) => { const w = n => (n * 1.45).toFixed(0), L = FEET - seatY; return `
  <path d="M${x0 - +w(170)},${seatY - 420} Q${x0},${seatY - 450} ${x0 + +w(170)},${seatY - 420} L${x0 + +w(160)},${seatY - 30} L${x0 - +w(160)},${seatY - 30} Z" fill="${col}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M${x0 - +w(150)},${seatY - 410} L${x0 - +w(142)},${seatY - 40}" stroke="#fff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/>
  <path d="M${x0 - +w(215)},${seatY + 70} L${x0 + +w(215)},${seatY + 70} L${x0 + +w(185)},${seatY - 30} L${x0 - +w(185)},${seatY - 30} Z" fill="${col}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M${x0 - +w(215)},${seatY + 70} L${x0 + +w(215)},${seatY + 70} L${x0 + +w(215)},${seatY + 100} L${x0 - +w(215)},${seatY + 100} Z" fill="${dark}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
  <path d="M${x0 - +w(190)},${seatY + 100} L${x0 - +w(205)},${seatY + L} M${x0 + +w(190)},${seatY + 100} L${x0 + +w(205)},${seatY + L}" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="M${x0 - +w(190)},${seatY + 100} L${x0 - +w(205)},${seatY + L} M${x0 + +w(190)},${seatY + 100} L${x0 + +w(205)},${seatY + L}" stroke="#4a5568" stroke-width="10" stroke-linecap="round"/>
  <path d="M${x0 - +w(140)},${seatY + 100} L${x0 - +w(150)},${seatY + L * .75} M${x0 + +w(140)},${seatY + 100} L${x0 + +w(150)},${seatY + L * .75}" stroke="${INK}" stroke-width="16" stroke-linecap="round" opacity=".9"/>`; };
const frames = [140, 380, 700, 940].map((x, i) => `<g><rect x="${x - 70}" y="380" width="140" height="170" fill="#fff8e6" stroke="${INK}" stroke-width="7"/><rect x="${x - 56}" y="394" width="112" height="120" fill="${['#9bd1f0', '#f7d77a', '#b7e3b0', '#f4b6c8'][i]}"/><circle cx="${x}" cy="440" r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><text x="${x}" y="538" font-family="sans-serif" font-size="18" font-weight="bold" fill="${INK}" text-anchor="middle">$${[5, 25, 10, 50][i]},000</text></g>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c83a"/><stop offset="1" stop-color="#e8b521"/></linearGradient>
<radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="1000" fill="url(#wall)"/>
<rect width="${W}" height="70" fill="#dfe6ee"/><path d="M0,70 L${W},70" stroke="${INK}" stroke-width="6"/>
<text x="540" y="300" font-family="Impact, 'Arial Black', sans-serif" font-size="120" font-weight="900" fill="#1d2f6f" text-anchor="middle" letter-spacing="4">OUR WINNERS</text>
${frames}
<rect y="880" width="${W}" height="60" fill="#e9f0f2"/><rect y="940" width="${W}" height="70" fill="#22a39b"/><path d="M0,1010 L${W},1010" stroke="${INK}" stroke-width="6"/>
<rect y="1010" width="${W}" height="910" fill="#f2f0ea"/>
${[1150, 1350, 1600, 1900].map(y => `<path d="M0,${y} L${W},${y - 60}" stroke="#e2b23a" stroke-width="5" opacity=".7"/>`).join('')}
${[200, 540, 880].map(x => `<path d="M${x},1010 L${x + (x - 540) * 1.2},1920" stroke="#e2b23a" stroke-width="5" opacity=".7"/>`).join('')}
${spk}
<ellipse cx="760" cy="1250" rx="300" ry="120" fill="url(#pool)"/>
<ellipse cx="${cx}" cy="${FEET + 10}" rx="380" ry="40" fill="#1a1028" opacity=".22"/>
${chair(cx - 680, '#23a3a0', '#16706d')}
${chair(cx, '#ec6f5f', '#b84d42')}
<image x="${ox}" y="${oy}" width="${800 * KS}" height="${1500 * KS}" href="data:image/svg+xml;base64,${Buffer.from(card).toString('base64')}"/>
</svg>`;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
await pg.setContent(`<html><body style="margin:0">${svg}</body></html>`); await pg.screenshot({ path: out }); await b.close(); console.log('ok');
