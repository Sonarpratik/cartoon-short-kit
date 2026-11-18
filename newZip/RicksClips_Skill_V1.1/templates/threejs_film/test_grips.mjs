// node test_grips.mjs out.png '<json opts>'   - grip / kneel / lie test sheet on the three locked body sizes, 4 views
// opts: { poses: [[pose, gripSpec|null, label]], views: [...], sizes: [...] }
import { buildChar } from '../vector2d_characters/code/castkit.mjs';
import { drawCharacter, INK } from '../vector2d_characters/code/char2d.mjs';
import { withHair } from '../vector2d_characters/code/hair_lib.mjs';
import { applyPose, lieOf } from './poses.mjs'; import { grip as gripFn } from '../vector2d_characters/code/grips.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const O = JSON.parse(process.argv[3] || '{}');
const views = O.views || ['front', '34', 'side', 'back'], sizes = O.sizes || ['thin', 'standard', 'fat'];
const OUT = O.outfits || ['peasant', 'blacksmith', 'knight'], HAIR = O.hair || ['sidePart', 'buzz', 'spiky'];
const poses = O.poses || [['grip_pole', { obj: 'spear' }, 'spear']];
const tw = O.tw || 300, th = O.th || 470;
const dd = t => t.replace(/<[a-zA-Z][^>]*>/g, tag => { const seen = new Set(); return tag.replace(/\s([a-zA-Z:-]+)="[^"]*"/g, (m, k) => seen.has(k) ? '' : (seen.add(k), m)); });
// a plain bed for the test: the mattress top is the floor the card lies on, pillow under the head end
const bedSvg = (gy, lie) => { const hx = lie === 'front' ? 600 : -300, wood = '#8a5a3a', I = '#2a1a1f';
  return `<rect x="-600" y="${gy + 150}" width="2000" height="400" fill="#d9cfb8"/><rect x="-340" y="${gy + 40}" width="1220" height="120" rx="10" fill="${wood}" stroke="${I}" stroke-width="8"/>`
    + `<rect x="-330" y="${gy - 10}" width="1200" height="70" rx="26" fill="#f4f1ea" stroke="${I}" stroke-width="8"/><path d="M-320,${gy + 34} H860" stroke="#cfc8bb" stroke-width="6"/>`
    + `<rect x="${lie === 'front' ? 900 : -360}" y="${gy - 160}" width="40" height="320" rx="10" fill="${wood}" stroke="${I}" stroke-width="8"/>`
    + `<rect x="${(lie === 'front' ? 720 : -70) - 150}" y="${gy - 50}" width="300" height="70" rx="34" fill="#dfe8f5" stroke="${I}" stroke-width="7"/>`; };
function card(pose, grip, view, size, j) {
  let spec = { name: size, form: 'standard', size, coat: '#5f7fa6', face: 'standard', ...(OUT[j % OUT.length] ? { outfit: OUT[j % OUT.length] } : {}) }; spec = withHair(spec, HAIR[j % HAIR.length]);
  const lie0 = lieOf({ pose }); if (lie0 === 'back' || lie0 === 'front') view = 'side';   // film.js does the same: lying for a level camera is always the side view
  const S = buildChar(spec, 300); S.view = view; S.dir = O.dir || 1; if (FX && FX.turn != null) S.turn = FX.turn; if (FX && FX.face) S.face = { expr: FX.face, ...(FX.side ? { side: FX.side } : {}) };
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78;
  const st = { pose, view, dir: O.dir || 1, ...(grip ? { grip } : {}) };
  const P = applyPose(S, st, { INK, headK: K, hy, dropProps: false, grip: gripFn });
  const r = drawCharacter(S), body = r.body;
  const over = P.over.length ? P.over.join('') : '', under = P.under && P.under.length ? P.under.join('') : '';
  const tf = P.rot || P.dy ? ` transform="translate(0,${P.dy}) rotate(${P.rot},300,${S.ground ?? 900})"` : '';
  const lie = lieOf(st), gy = S.ground ?? 900; let lt = '';
  if (lie === 'back' || lie === 'front') lt = ` transform="translate(${lie === 'back' ? 400 : -400},-${O.lift ?? 165}) rotate(${(lie === 'back' ? -90 : 90)},300,${gy})"`;   // emulates film.js: the card turned flat, resting on the floor
  if (lie === 'flat') lt = ` transform="translate(0,${gy - 200}) scale(1,.35) translate(0,${-gy + 200})"`;
  return dd(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${lie === 'back' || lie === 'front' ? '-330 ' + ((S.ground ?? 900) + (BED ? 220 : 60) - 1160 * th / tw) + ' 1260 ' + (1260 * th / tw) : '-160 -40 920 ' + (920 * th / tw)}" width="${tw}" height="${th}"><defs>${r.defs}</defs>${BED ? bedSvg(gy, lie) : `<rect x="-600" y="${gy - 4}" width="2000" height="400" fill="#d9cfb8"/>`}${FX && FX.extra ? FX.extra : ''}<g${lt}><g${tf}>${under}${body}${over}</g></g></svg>`);
}
let h = '', Y = 10, BED = false, FX = null; const cols = views.length * sizes.length;
for (const [pose, grip, label, X] of poses) { BED = !!(X && X.bed); FX = X || null;
  h += `<div style="position:absolute;left:8px;top:${Y}px;font:bold 22px sans-serif;color:#1d2f6f">${label || pose}</div>`; Y += 32;
  let i = 0; for (const v of views) for (const [j, sz] of sizes.entries()) {
    const x = 8 + i * (tw + 4);
    if (Y < 50 || i < cols) h += `<div style="position:absolute;left:${x}px;top:${Y - 2}px;width:${tw}px;font:13px sans-serif;color:#555;text-align:center">${v === '34' ? '3/4' : v} · ${sz}</div>`;
    let svg; try { svg = card(pose, grip, v, sz, j); } catch (e) { svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}"><text x="10" y="40" font-size="14">${String(e.message).replace(/[<&]/g, '')}</text></svg>`; console.error(pose, v, sz, e.stack.split('\n').slice(0, 3).join(' | ')); }
    h += `<img style="position:absolute;left:${x}px;top:${Y + 16}px;background:#fff;border:1px solid #c5cddb" width="${tw}" height="${th}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`; i++;
  }
  Y += th + 26;
}
const W = 16 + cols * (tw + 4), H = Y + 6;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: O.dpr || 1 });
await pg.setContent(`<html><body style="margin:0;background:#e4e9f1;position:relative;width:${W}px;height:${H}px">${h}</body></html>`); await pg.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); console.log('ok', W, H);
