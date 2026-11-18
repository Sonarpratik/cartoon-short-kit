// MEME-LEVEL EXPRESSIONS (CB 20:47: "more unique, more bigger, almost every expression is like a meme").
// Each face is its own drawing: features can break the head outline, the head can tilt / squash / change colour.
// Head space: centre (cx, hy), R = 100 (the whole head group is scaled 1.5 by the character code).
import { INK, brush, headPts, smooth, inkRing } from './char2d.mjs';

export const PINK = '#c94a5f', BLUE = '#8fd3f4', RED = '#e0453a', GOLD = '#ffd23f', GREEN = '#3fae5a';
export const f1 = v => (+v).toFixed(1);
export const ell = (x, y, rx, ry, f, st = '', sw = 0) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`;
export const P = (d, f = INK, st = INK, sw = 3) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const L = (d, w = 5, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const drop = (x, y, sz, col = BLUE) => `<path d="M${f1(x)},${f1(y - sz * 1.5)} Q${f1(x + sz)},${f1(y - sz * .2)} ${f1(x + sz)},${f1(y + sz * .35)} A${f1(sz)},${f1(sz)} 0 0,1 ${f1(x - sz)},${f1(y + sz * .35)} Q${f1(x - sz)},${f1(y - sz * .2)} ${f1(x)},${f1(y - sz * 1.5)} Z" fill="${col}" stroke="${INK}" stroke-width="3"/><path d="M${f1(x - sz * .45)},${f1(y + sz * .1)} q0,${f1(sz * .45)} ${f1(sz * .3)},${f1(sz * .6)}" fill="none" stroke="#fff" stroke-width="${Math.max(1.6, sz * .22).toFixed(1)}" stroke-linecap="round"/>`;
export const star4 = (x, y, r, col = GOLD) => P(`M${x},${y - r} Q${x + r * .18},${y - r * .18} ${x + r},${y} Q${x + r * .18},${y + r * .18} ${x},${y + r} Q${x - r * .18},${y + r * .18} ${x - r},${y} Q${x - r * .18},${y - r * .18} ${x},${y - r} Z`, col, INK, 2.6);
export const star5 = (x, y, r, col = GOLD) => { let d = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; d += (k ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ',' + f1(y + Math.sin(a) * rr); } return P(d + 'Z', col, INK, 3.4); };
export const heart = (x, y, r, col = '#f05a78') => P(`M${x},${y + r * .9} C${x - r * 1.5},${y - r * .1} ${x - r * .9},${y - r * 1.25} ${x},${y - r * .45} C${x + r * .9},${y - r * 1.25} ${x + r * 1.5},${y - r * .1} ${x},${y + r * .9} Z`, col, INK, 3.4) + L(`M${x - r * .7},${y - r * .45} q${r * .15},-${r * .3} ${r * .45},-${r * .25}`, 2.6, '#fff');
export const brow = (x0, y0, qx, qy, x1, y1, w = 9) => brush(x0, y0, qx, qy, x1, y1, w, { bias: .4, tip: .3 });
export const teethRow = (x0, x1, y0, y1, n) => { let o = ''; for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n; o += L(`M${f1(x)},${f1(y0)} L${f1(x)},${f1(y1)}`, 2.4); } return o; };

// ---------- SKIN TONES (gradients defined by memeDefs) ----------
export const memeDefs = () => `
<radialGradient id="sk" cx=".32" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#f9f4f2"/><stop offset="1" stop-color="#d9d2e3"/></radialGradient>
<radialGradient id="skRed" cx=".4" cy=".55" r=".75"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".55" stop-color="#f0604f"/><stop offset="1" stop-color="#c8372f"/></radialGradient>
<linearGradient id="skBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6e6"/><stop offset=".55" stop-color="#d6dbf7"/><stop offset="1" stop-color="#f3f1fa"/></linearGradient>
<linearGradient id="skGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4ee"/><stop offset=".35" stop-color="#cfe6b4"/><stop offset="1" stop-color="#94c97a"/></linearGradient>
<linearGradient id="skShadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2850"/><stop offset=".48" stop-color="#5c4a78"/><stop offset=".62" stop-color="#e9e3ef"/><stop offset="1" stop-color="#f6f2f6"/></linearGradient>
<linearGradient id="skPale" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7ecef"/><stop offset="1" stop-color="#c7cfd8"/></linearGradient>`;

// ---------- THE 28 MEME FACES ----------
// each returns { skin, rot, sx, sy, under: [], over: [] } ; under = drawn before the head (e.g. jaw, cheeks), over = face
export const MEMES = {
  // 1 TROLL SMUG: grin wider than the face, wrinkles, heavy lids
  troll: (cx, hy) => {
    const y = hy + 22, o = [];
    o.push(P(`M${cx - 74},${y - 16} Q${cx},${y + 4} ${cx + 74},${y - 22} Q${cx + 58},${y + 46} ${cx},${y + 50} Q${cx - 56},${y + 46} ${cx - 74},${y - 16} Z`, '#fff', INK, 5));
    o.push(L(`M${cx - 66},${y - 5} Q${cx},${y + 26} ${cx + 66},${y - 10}`, 3.4)); o.push(teethRow(cx - 66, cx + 66, y - 12, y + 40, 12));
    o.push(L(`M${cx - 80},${y - 30} q-8,16 4,30`, 4.4), L(`M${cx + 80},${y - 36} q8,16 -4,30`, 4.4), L(`M${cx - 40},${y + 64} q40,14 80,0`, 3.6));
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 26; o.push(P(`M${ex - 15},${ey + 2} A15,11 0 0,0 ${ex + 15},${ey + 2} Z`), brush(ex - 22, ey + 2 - s * 3, ex, ey - 3, ex + 22, ey + 2 + s * 3, 6.5, { tip: .4 }), brow(ex - s * 20, ey - 16 + 6, ex, ey - 30, ex + s * 22, ey - 30 + s * 0, 9)); }
    return { over: o, rot: -8 };
  },
  // 2 BRUH / DEADPAN: tiny far-apart dots, long flat mouth, eye bags
  bruh: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 46, ey = hy - 10; o.push(ell(ex, ey, 4.5, 4.5, INK), L(`M${ex - 18},${ey - 8} L${ex + 18},${ey - 8}`, 5), L(`M${ex - 12},${ey + 12} q12,6 24,0`, 2.6, '#8a7f99'), brow(ex - 18, ey - 30, ex, ey - 31, ex + 18, ey - 30, 7)); }
    o.push(L(`M${cx - 30},${hy + 44} L${cx + 30},${hy + 44}`, 5.5));
    return { over: o, sx: 1.04, sy: .97 };
  },
  // 3 JAW DROP: chin falls below the head, eyes pop
  jawdrop: (cx, hy) => {
    const under = [P(`M${cx - 58},${hy + 50} Q${cx - 64},${hy + 168} ${cx},${hy + 176} Q${cx + 64},${hy + 168} ${cx + 58},${hy + 50} Z`, 'url(#sk)', INK, 8)];
    const o = [P(`M${cx - 34},${hy + 18} Q${cx},${hy + 8} ${cx + 34},${hy + 18} Q${cx + 44},${hy + 150} ${cx},${hy + 156} Q${cx - 44},${hy + 150} ${cx - 34},${hy + 18} Z`, INK, INK, 3),
      P(`M${cx - 26},${hy + 21} Q${cx},${hy + 13} ${cx + 26},${hy + 21} L${cx + 25},${hy + 32} Q${cx},${hy + 26} ${cx - 25},${hy + 32} Z`, '#fff', 'none', 0), ell(cx + 2, hy + 132, 24, 13, PINK)];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 34; o.push(ell(ex, ey, 26, 31, '#fff', INK, 5.5), ell(ex, ey + 2, 3.5, 3.5, INK), brow(ex - 20, ey - 44, ex, ey - 58, ex + 20, ey - 44, 8)); }
    o.push(...[-.5, -.25, 0, .25, .5].map(a => { const g = -Math.PI / 2 + a; return L(`M${f1(cx + Math.cos(g) * 118)},${f1(hy + Math.sin(g) * 118)} L${f1(cx + Math.cos(g) * 150)},${f1(hy + Math.sin(g) * 150)}`, 7); }));
    return { under, over: o, sy: 1.04 };
  },
  // 4 WAIL: waterfall tears, giant wobbling mouth
  wail: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18; o.push(brush(ex - s * 18, ey - 14, ex + s * 4, ey - 4, ex + s * 18, ey + 2, 7, { tip: .4 }), brush(ex + s * 18, ey + 2, ex + s * 4, ey + 6, ex - s * 18, ey + 14, 7, { tip: .4 }), brow(ex - s * 20, ey - 40, ex, ey - 36, ex + s * 22, ey - 24, 9));
      o.push(P(`M${ex + s * 4},${ey + 10} Q${ex + s * 30},${ey + 70} ${ex + s * 14},${hy + 140} L${ex + s * 44},${hy + 140} Q${ex + s * 50},${ey + 60} ${ex + s * 14},${ey + 8} Z`, BLUE, INK, 3)); }
    o.push(P(`M${cx - 40},${hy + 60} Q${cx - 34},${hy + 4} ${cx},${hy + 6} Q${cx + 34},${hy + 4} ${cx + 40},${hy + 60} Q${cx + 20},${hy + 50} ${cx},${hy + 58} Q${cx - 20},${hy + 50} ${cx - 40},${hy + 60} Z`), ell(cx, hy + 44, 16, 7, PINK));
    return { over: o, sy: .97 };
  },
  // 5 HYSTERICAL LAUGH: head thrown back, mouth half the face, tears flying
  hysterical: (cx, hy) => {
    const o = [], y = hy + 12;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 32; o.push(brush(ex - s * 16, ey - 12, ex + s * 4, ey - 2, ex + s * 16, ey + 2, 7, { tip: .4 }), brush(ex + s * 16, ey + 2, ex + s * 4, ey + 6, ex - s * 16, ey + 14, 7, { tip: .4 }), brow(ex - 18, ey - 26, ex, ey - 40, ex + 18, ey - 26, 8), drop(ex + s * 40, ey - 18, 9), drop(ex + s * 58, ey + 6, 6)); }
    o.push(P(`M${cx - 56},${y - 12} Q${cx},${y - 2} ${cx + 56},${y - 12} Q${cx + 50},${y + 70} ${cx},${y + 72} Q${cx - 50},${y + 70} ${cx - 56},${y - 12} Z`), P(`M${cx - 48},${y - 8} Q${cx},${y + 1} ${cx + 48},${y - 8} L${cx + 45},${y + 6} Q${cx},${y + 14} ${cx - 45},${y + 6} Z`, '#fff', 'none', 0), teethRow(cx - 46, cx + 46, y - 6, y + 9, 7), ell(cx + 4, y + 54, 26, 12, PINK));
    o.push(...[[-120, -40], [120, -50], [-110, 30], [118, 26]].map(([dx, dy]) => `<text x="${cx + dx}" y="${hy + dy}" font-family="Arial Black,Arial" font-weight="900" font-size="26" text-anchor="middle" fill="${INK}" transform="rotate(${dx > 0 ? 18 : -18} ${cx + dx} ${hy + dy})">HA</text>`));
    return { over: o, rot: -14 };
  },
  // 6 RAGE: red skin, top+bottom teeth shout, steam, veins
  rage: (cx, hy) => {
    const o = [], y = hy + 18;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 20; o.push(brush(ex - s * 18, ey - 12, ex + s * 4, ey - 2, ex + s * 18, ey + 2, 7.5, { tip: .4 }), brush(ex + s * 18, ey + 2, ex + s * 4, ey + 6, ex - s * 18, ey + 14, 7.5, { tip: .4 }), brush(ex - s * 26, ey - 34, ex, ey - 26, ex + s * 22, ey - 12, 13, { bias: .7, tip: .3 })); }
    o.push(P(`M${cx - 58},${y - 14} L${cx + 58},${y - 14} L${cx + 46},${y + 56} L${cx - 46},${y + 56} Z`), P(`M${cx - 54},${y - 11} L${cx + 54},${y - 11} L${cx + 52},${y + 2} L${cx - 52},${y + 2} Z`, '#fff', 'none', 0), teethRow(cx - 52, cx + 52, y - 11, y + 2, 8), P(`M${cx - 47},${y + 52} L${cx + 47},${y + 52} L${cx + 48},${y + 42} L${cx - 48},${y + 42} Z`, '#fff', 'none', 0), teethRow(cx - 46, cx + 46, y + 42, y + 52, 7), ell(cx, y + 30, 22, 8, PINK));
    o.push(...veins(cx + 50, hy - 70, 1.4), ...veins(cx - 62, hy - 56, 1), ...steamBurst(cx, hy, 1.3));
    return { skin: 'skRed', over: o, sx: 1.06, sy: .96 };
  },
  // 7 EVIL PLAN: shadow over the eyes, glowing slits, shark grin
  evil: (cx, hy) => {
    const o = [], y = hy + 26;
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 26; o.push(P(`M${ex - s * 22},${ey - 10} L${ex + s * 20},${ey + 2} Q${ex + s * 4},${ey + 10} ${ex - s * 22},${ey - 10} Z`, '#fff6b0', INK, 2), ell(ex + s * 4, ey - 1, 3, 4, INK)); }
    o.push(P(`M${cx - 70},${y - 22} Q${cx},${y + 4} ${cx + 70},${y - 22} Q${cx + 40},${y + 40} ${cx},${y + 40} Q${cx - 40},${y + 40} ${cx - 70},${y - 22} Z`));
    let d = `M${cx - 62},${y - 15}`; for (let k = 0; k < 12; k++) d += ` L${f1(cx - 62 + k * 10.3 + 5.2)},${f1(y + (k % 2 ? -6 : 10) + Math.sin(k / 11 * Math.PI) * 6)}`; o.push(P(d + ` L${cx + 62},${y - 15} Q${cx},${y + 6} ${cx - 62},${y - 15} Z`, '#fff', 'none', 0));
    return { skin: 'skShadow', over: o, rot: 6 };
  },
  // 8 DISGUST: green tint, one eye crushed one wide, tongue out sideways
  disgust: (cx, hy) => {
    const o = [], ey = hy - 16;
    o.push(brush(cx - 54, ey - 6, cx - 34, ey + 4, cx - 14, ey - 4, 7, { tip: .4 }), brush(cx - 50, ey + 8, cx - 34, ey + 4, cx - 18, ey + 10, 5, { tip: .4 }), brow(cx - 58, ey - 12, cx - 36, ey - 2, cx - 14, ey - 18, 9));
    o.push(ell(cx + 34, ey, 15, 18, '#fff', INK, 4.5), ell(cx + 30, ey + 3, 5, 5.5, INK), brow(cx + 14, ey - 34, cx + 34, ey - 46, cx + 56, ey - 36, 9));
    o.push(L(`M${cx - 36},${hy + 40} q12,-10 24,0 q12,10 24,0 q12,-10 24,0`, 5.5), P(`M${cx + 6},${hy + 40} Q${cx + 2},${hy + 78} ${cx + 18},${hy + 80} Q${cx + 34},${hy + 76} ${cx + 28},${hy + 40}`, PINK, INK, 3.5));
    o.push(...[[-120, 0], [-128, -30], [120, -10], [130, 20]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q8,-8 0,-16 q-8,-8 0,-16`, 4, GREEN)));
    return { skin: 'skGreen', over: o, sx: .96, sy: 1.02 };
  },
  // 9 TERRIFIED: blue face, shrunk pupils, chattering teeth, gloom, sweat rain
  terrified: (cx, hy) => {
    const o = [], y = hy + 34;
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 14; o.push(ell(ex, ey, 20, 24, '#fff', INK, 5), ell(ex + s * 2, ey + 2, 2.6, 2.6, INK), brow(ex - s * 20, ey - 52, ex, ey - 46, ex + s * 24, ey - 36, 8)); }
    o.push(P(`M${cx - 44},${y - 12} L${cx + 44},${y - 12} L${cx + 44},${y + 14} L${cx - 44},${y + 14} Z`, '#fff', INK, 4.5), L(`M${cx - 44},${y + 1} L${cx + 44},${y + 1}`, 2.6), teethRow(cx - 44, cx + 44, y - 12, y + 14, 8));
    for (const s of [-1, 1]) o.push(L(`M${cx + s * 54},${y - 10} l${s * 8},4 l${-s * 6},4 l${s * 8},4`, 3));
    o.push(...[-50, -30, -10, 10, 30, 50].map(t => L(`M${cx + t},${hy - 92 + Math.abs(t) * .6} L${cx + t},${hy - 40}`, 4.5, '#4b4f9c')));
    o.push(drop(cx + 82, hy - 52, 12), drop(cx - 86, hy - 40, 10), drop(cx + 100, hy - 10, 7), drop(cx - 104, hy - 2, 6));
    return { skin: 'skBlue', over: o, sx: .94, sy: 1.04 };
  },
  // 10 HEART EYES: huge hearts, drooling grin, hearts floating
  heartEyes: (cx, hy) => {
    const o = [], y = hy + 30;
    for (const s of [-1, 1]) o.push(heart(cx + s * 34, hy - 18, 24));
    o.push(P(`M${cx - 38},${y - 8} Q${cx},${y + 2} ${cx + 38},${y - 8} Q${cx + 30},${y + 34} ${cx},${y + 36} Q${cx - 30},${y + 34} ${cx - 38},${y - 8} Z`), ell(cx + 2, y + 24, 16, 7, PINK), P(`M${cx + 26},${y + 8} Q${cx + 34},${y + 40} ${cx + 30},${y + 52} A6,6 0 0,1 ${cx + 20},${y + 50} Q${cx + 22},${y + 30} ${cx + 26},${y + 8} Z`, '#cfefff', INK, 2.6));
    o.push(...blush(cx, hy, 1.2), heart(cx + 110, hy - 92, 13), heart(cx - 112, hy - 72, 10), heart(cx + 126, hy - 40, 8));
    return { over: o, rot: -6 };
  },
  // 11 MONEY: dollar eyes, giant grin, coins
  money: (cx, hy) => {
    const o = [], y = hy + 30;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18; o.push(ell(ex, ey, 22, 25, '#fff', INK, 5), `<text x="${ex}" y="${ey + 16}" font-family="Arial Black,Arial" font-weight="900" font-size="46" text-anchor="middle" fill="${GREEN}" stroke="${INK}" stroke-width="2">$</text>`, brow(ex - 18, ey - 38, ex, ey - 50, ex + 18, ey - 38, 8)); }
    o.push(P(`M${cx - 52},${y - 10} Q${cx},${y} ${cx + 52},${y - 10} Q${cx + 44},${y + 38} ${cx},${y + 40} Q${cx - 44},${y + 38} ${cx - 52},${y - 10} Z`, '#fff', INK, 5), L(`M${cx - 50},${y + 12} Q${cx},${y + 22} ${cx + 50},${y + 12}`, 2.6), teethRow(cx - 48, cx + 48, y - 6, y + 36, 10));
    o.push(...[[-112, -70, 12], [118, -80, 14], [124, -30, 10]].map(([dx, dy, r]) => ell(cx + dx, hy + dy, r, r, GOLD, INK, 3) + `<text x="${cx + dx}" y="${hy + dy + r * .45}" font-family="Arial Black,Arial" font-weight="900" font-size="${r * 1.3}" text-anchor="middle" fill="#a87b10">$</text>`));
    return { over: o };
  },
  // 12 DEAD TIRED: droopy lids, deep bags, snot bubble, drool
  tired: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 8; o.push(P(`M${ex - 14},${ey} A14,8 0 0,0 ${ex + 14},${ey} Z`), brush(ex - 22, ey - 2 + s * 4, ex, ey - 4, ex + 22, ey - 2 - s * 4, 6.5, { tip: .4 }), L(`M${ex - 16},${ey + 14} q16,10 32,0`, 3.6, '#7b6f92'), L(`M${ex - 12},${ey + 22} q12,7 24,0`, 2.6, '#9a90ae'), brow(ex - 18, ey - 24 + s * 4, ex, ey - 26, ex + 18, ey - 24 - s * 4, 7)); }
    o.push(L(`M${cx - 18},${hy + 46} q18,-6 36,2`, 5), P(`M${cx + 14},${hy + 47} Q${cx + 20},${hy + 74} ${cx + 16},${hy + 80} A5,5 0 0,1 ${cx + 8},${hy + 78} Q${cx + 10},${hy + 62} ${cx + 14},${hy + 47} Z`, '#cfefff', INK, 2.4));
    o.push(`<circle cx="${cx - 34}" cy="${hy + 30}" r="24" fill="#d8f2ff" fill-opacity=".75" stroke="${INK}" stroke-width="3"/>`, L(`M${cx - 46},${hy + 20} q4,-8 12,-9`, 3, '#fff'));
    o.push(...[[92, -70, 14], [118, -98, 18], [148, -132, 22]].map(([dx, dy, z]) => L(`M${cx + dx - z / 2},${hy + dy - z / 2} L${cx + dx + z / 2},${hy + dy - z / 2} L${cx + dx - z / 2},${hy + dy + z / 2} L${cx + dx + z / 2},${hy + dy + z / 2}`, z * .28)));
    return { skin: 'skPale', over: o, rot: 12, sy: .96 };
  },
  // 13 SUS: one eye slit, other huge, brow in orbit, side mouth
  sus: (cx, hy) => {
    const o = [];
    o.push(P(`M${cx - 50},${hy - 18} A16,7 0 0,0 ${cx - 18},${hy - 18} Z`), brush(cx - 56, hy - 18, cx - 34, hy - 22, cx - 12, hy - 18, 7, { tip: .4 }), brow(cx - 58, hy - 30, cx - 34, hy - 22, cx - 12, hy - 34, 10));
    o.push(ell(cx + 36, hy - 16, 18, 22, '#fff', INK, 5), ell(cx + 28, hy - 14, 6, 7, INK), brow(cx + 14, hy - 60, cx + 36, hy - 84, cx + 60, hy - 64, 10));
    o.push(brush(cx + 4, hy + 44, cx + 22, hy + 46, cx + 44, hy + 32, 6, { tip: .4 }), L(`M${cx + 48},${hy + 28} q4,4 2,10`, 3));
    return { over: o, rot: 10 };
  },
  // 14 STAR STRUCK: star eyes, open smile, sparkle storm
  starstruck: (cx, hy) => {
    const o = [], y = hy + 30;
    for (const s of [-1, 1]) o.push(star5(cx + s * 34, hy - 20, 28), brow(cx + s * 34 - 18, hy - 64, cx + s * 34, hy - 74, cx + s * 34 + 18, hy - 64, 8));
    o.push(P(`M${cx - 46},${y - 8} Q${cx},${y} ${cx + 46},${y - 8} Q${cx + 38},${y + 46} ${cx},${y + 48} Q${cx - 38},${y + 46} ${cx - 46},${y - 8} Z`), ell(cx + 3, y + 32, 20, 9, PINK), P(`M${cx - 38},${y - 4} Q${cx},${y + 3} ${cx + 38},${y - 4} L${cx + 35},${y + 6} Q${cx},${y + 12} ${cx - 35},${y + 6} Z`, '#fff', 'none', 0));
    o.push(star4(cx - 116, hy - 70, 16), star4(cx + 120, hy - 60, 20), star4(cx + 96, hy - 112, 11), star4(cx - 96, hy - 112, 9), star4(cx - 128, hy - 10, 8));
    return { over: o, sy: 1.03 };
  },
  // 15 AWKWARD: huge forced grin, eyes sliding sideways, sweat everywhere
  awkward: (cx, hy) => {
    const o = [], y = hy + 34;
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 16; o.push(ell(ex, ey, 15, 17, '#fff', INK, 4.5), ell(ex + 9, ey + 2, 5.5, 6, INK), brow(ex - s * 18, ey - 38, ex, ey - 36, ex + s * 20, ey - 26, 8)); }
    o.push(P(`M${cx - 54},${y - 14} Q${cx},${y - 22} ${cx + 54},${y - 14} Q${cx + 58},${y + 4} ${cx + 52},${y + 18} Q${cx},${y + 26} ${cx - 52},${y + 18} Q${cx - 58},${y + 4} ${cx - 54},${y - 14} Z`, '#fff', INK, 5), L(`M${cx - 54},${y + 2} Q${cx},${y} ${cx + 54},${y + 2}`, 2.6), teethRow(cx - 52, cx + 52, y - 16, y + 22, 10));
    o.push(drop(cx + 80, hy - 56, 18), drop(cx - 94, hy - 30, 9), drop(cx + 112, hy - 4, 7), drop(cx - 84, hy + 20, 6));
    return { over: o, rot: -4 };
  },
  // 16 KNOCKED OUT: spiral + X eyes, tongue flop, bump, birdies
  ko: (cx, hy) => {
    const o = [];
    let d = `M${cx - 34},${hy - 16}`; for (let a = 0; a < Math.PI * 6; a += .25) { const r = 1.15 * a; d += ` L${f1(cx - 34 + Math.cos(a) * r)},${f1(hy - 16 + Math.sin(a) * r)}`; } o.push(L(d, 4.5));
    o.push(brush(cx + 20, hy - 30, cx + 34, hy - 16, cx + 50, hy - 2, 8, { tip: .5 }), brush(cx + 50, hy - 30, cx + 34, hy - 16, cx + 20, hy - 2, 8, { tip: .5 }));
    o.push(brush(cx - 30, hy + 36, cx, hy + 50, cx + 30, hy + 34, 6, { tip: .4 }), P(`M${cx - 6},${hy + 42} Q${cx - 14},${hy + 92} ${cx + 4},${hy + 94} Q${cx + 20},${hy + 92} ${cx + 14},${hy + 44}`, PINK, INK, 3.5));
    o.push(P(`M${cx + 2},${hy - 94} C${cx + 6},${hy - 136} ${cx + 50},${hy - 136} ${cx + 52},${hy - 90} Z`, 'url(#sk)', INK, 5) + L(`M${cx + 14},${hy - 112} q8,-8 18,-6`, 3, '#fff'), `<ellipse cx="${cx}" cy="${hy - 126}" rx="74" ry="15" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 7" opacity=".6"/>`, star4(cx - 66, hy - 128, 12), star4(cx + 70, hy - 132, 11), bird(cx - 8, hy - 112));
    return { over: o, rot: 18 };
  },
  // 17 PUPPY EYES: giant glossy eyes, quivering mouth
  puppy: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 10; o.push(ell(ex, ey, 25, 30, INK), ell(ex - 8, ey - 12, 9, 10, '#fff'), ell(ex + 9, ey + 10, 4.5, 4.5, '#fff'), ell(ex - 12, ey + 12, 2.5, 2.5, '#fff'), L(`M${ex - 24},${ey + 24} Q${ex},${ey + 36} ${ex + 24},${ey + 24}`, 5, BLUE), brow(ex - s * 20, ey - 52, ex, ey - 46, ex + s * 22, ey - 38, 7)); }
    o.push(P(`M${cx - 12},${hy + 52} q6,-6 12,0 q6,-6 12,0 Q${cx + 10},${hy + 64} ${cx},${hy + 64} Q${cx - 10},${hy + 64} ${cx - 12},${hy + 52} Z`), ...blush(cx, hy, .8));
    return { over: o, sx: .95, sy: 1.05 };
  },
  // 18 PROUD CHAD: chin up, eyes closed, mega smirk, sparkle
  proud: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 22; o.push(brush(ex - 18, ey, ex, ey + 9, ex + 18, ey, 7, { tip: .4 }), L(`M${ex + s * 16},${ey + 2} l${s * 6},-4`, 3), brow(ex - 20, ey - 28, ex, ey - 36, ex + 20, ey - 30, 10)); }
    o.push(brush(cx - 36, hy + 30, cx + 4, hy + 52, cx + 46, hy + 16, 8, { bias: .6, tip: .35 }), L(`M${cx + 48},${hy + 12} q6,6 2,14`, 3.4), L(`M${cx - 22},${hy + 70} q22,10 44,0`, 3.6));
    o.push(star4(cx + 112, hy - 66, 20), star4(cx + 92, hy - 104, 11), star4(cx - 116, hy - 50, 12));
    return { over: o, rot: -12, sx: 1.03 };
  },
  // 19 CONFUSED: mismatched eyes, zigzag mouth, question storm
  confused: (cx, hy) => {
    const o = [];
    o.push(ell(cx - 34, hy - 18, 20, 24, '#fff', INK, 5), ell(cx - 30, hy - 14, 4, 4, INK), brow(cx - 54, hy - 56, cx - 34, hy - 72, cx - 12, hy - 54, 8));
    o.push(ell(cx + 34, hy - 14, 6, 7, INK), brow(cx + 16, hy - 26, cx + 34, hy - 30, cx + 52, hy - 22, 8));
    o.push(L(`M${cx - 30},${hy + 46} l10,-8 l10,8 l10,-8 l10,8 l10,-8 l10,8`, 5));
    o.push(...[[96, -110, 1.3, 14], [-110, -96, 1, -16], [128, -50, .8, 22]].map(([dx, dy, k, r]) => `<text x="${cx + dx}" y="${hy + dy}" font-family="Arial Black,Arial" font-weight="900" font-size="${f1(56 * k)}" text-anchor="middle" fill="${INK}" transform="rotate(${r} ${cx + dx} ${hy + dy})">?</text>`));
    return { over: o, rot: 14 };
  },
  // 20 SCREAM: stretched head, tall black mouth, hollow eyes
  scream: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 28, ey = hy - 30; o.push(ell(ex, ey, 13, 22, INK), ell(ex, ey + 2, 3, 5, '#fff'), brow(ex - s * 16, ey - 50, ex, ey - 44, ex + s * 18, ey - 34, 7)); }
    o.push(P(`M${cx},${hy + 2} C${cx + 26},${hy + 2} ${cx + 28},${hy + 96} ${cx},${hy + 96} C${cx - 28},${hy + 96} ${cx - 26},${hy + 2} ${cx},${hy + 2} Z`), ell(cx, hy + 80, 14, 9, PINK));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 110},${hy - 30} q${s * 10},20 0,40 q${-s * 10},20 0,40`, 4.5)));
    return { skin: 'skPale', over: o, sx: .86, sy: 1.16 };
  },
  // 21 DEAD INSIDE: empty white eyes, flat line, gloom
  deadInside: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 14; o.push(ell(ex, ey, 18, 18, '#fff', INK, 4.5), L(`M${ex - 16},${ey + 22} q16,8 32,0`, 3, '#7b6f92'), L(`M${ex - 18},${ey - 28} L${ex + 18},${ey - 28}`, 7)); }
    o.push(L(`M${cx - 24},${hy + 44} L${cx + 24},${hy + 44}`, 5));
    o.push(`<g opacity=".55">${[-56, -40, -24, -8, 8, 24, 40, 56].map(t => L(`M${cx + t},${hy - 94 + Math.abs(t) * .5} L${cx + t},${hy - 44}`, 4.5, '#4b4f9c')).join('')}</g>`);
    return { skin: 'skPale', over: o };
  },
  // 22 FLIRTY: wink, big lips, hearts
  flirty: (cx, hy) => {
    const o = [];
    o.push(brush(cx - 50, hy - 14, cx - 34, hy - 30, cx - 16, hy - 14, 7, { tip: .45 }), brow(cx - 52, hy - 42, cx - 34, hy - 50, cx - 16, hy - 42, 8));
    o.push(ell(cx + 34, hy - 16, 14, 18, INK), ell(cx + 29, hy - 22, 5, 6, '#fff'), L(`M${cx + 18},${hy - 36} l-6,-8 M${cx + 30},${hy - 38} l0,-9 M${cx + 42},${hy - 36} l6,-8`, 3.4), brow(cx + 16, hy - 56, cx + 34, hy - 66, cx + 52, hy - 56, 8));
    o.push(P(`M${cx - 4},${hy + 30} Q${cx + 16},${hy + 18} ${cx + 20},${hy + 34} Q${cx + 16},${hy + 50} ${cx - 4},${hy + 40} Q${cx + 6},${hy + 35} ${cx - 4},${hy + 30} Z`, '#e4566f', INK, 3.4));
    o.push(...blush(cx, hy, 1.1), heart(cx + 64, hy + 30, 11), heart(cx + 96, hy + 6, 15), heart(cx + 120, hy - 34, 10));
    return { over: o, rot: -10 };
  },
  // 23 SICK: green, puffed cheeks, spiral-ish eyes, hand-over-mouth bulge
  sick: (cx, hy) => {
    const o = [-1, 1].map(s => P(`M${cx + s * 50},${hy + 2} Q${cx + s * 118},${hy - 6} ${cx + s * 112},${hy + 40} Q${cx + s * 104},${hy + 80} ${cx + s * 46},${hy + 66} Z`, '#a9d98e', INK, 5.5)), under = [];
    o.push(...[-1, 1].map(s => L(`M${cx + s * 80},${hy + 14} q${s * 14},6 ${s * 12},22`, 3.4, '#fff')));
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 22; o.push(brush(ex - 16, ey - 2, ex, ey + 6, ex + 16, ey - 2, 6, { tip: .4 }), L(`M${ex - 14},${ey + 12} q14,8 28,0`, 3, '#5b8a4a'), brow(ex - s * 18, ey - 36, ex, ey - 30, ex + s * 20, ey - 22, 7)); }
    o.push(P(`M${cx - 14},${hy + 40} Q${cx},${hy + 30} ${cx + 14},${hy + 40} Q${cx},${hy + 50} ${cx - 14},${hy + 40} Z`, '#7fb86a', INK, 4.5), drop(cx + 70, hy - 66, 10, '#bfe8a8'));
    o.push(...[[-110, -54], [118, -60], [0, -126]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q10,-8 0,-16 q-10,-8 0,-16`, 4, GREEN)));
    return { skin: 'skGreen', under, over: o, sx: 1.04 };
  },
  // 24 DEAL WITH IT: pixel shades, smug smirk
  cool: (cx, hy) => {
    const o = [], y = hy - 24;
    o.push(P(`M${cx - 84},${y - 10} L${cx + 84},${y - 10} L${cx + 84},${y + 2} L${cx + 66},${y + 2} L${cx + 62},${y + 22} L${cx + 14},${y + 22} L${cx + 10},${y + 6} L${cx - 10},${y + 6} L${cx - 14},${y + 22} L${cx - 62},${y + 22} L${cx - 66},${y + 2} L${cx - 84},${y + 2} Z`, '#141217', INK, 3));
    for (const s of [-1, 1]) o.push(`<rect x="${cx + s * 38 - 16}" y="${y - 4}" width="9" height="7" fill="#fff"/><rect x="${cx + s * 38 - 5}" y="${y + 5}" width="9" height="7" fill="#fff"/>`);
    o.push(brush(cx - 24, hy + 38, cx + 6, hy + 50, cx + 36, hy + 28, 7, { bias: .6, tip: .35 }), star4(cx + 104, hy - 70, 16), star4(cx - 108, hy - 60, 10));
    return { over: o, rot: -6 };
  },
  // 25 STRAIN: everything squeezed to the centre, veins, sweat
  strain: (cx, hy) => {
    const o = [], y = hy + 28;
    for (const s of [-1, 1]) { const ex = cx + s * 30, ey = hy - 18; o.push(brush(ex - s * 20, ey - 14, ex + s * 4, ey - 2, ex + s * 20, ey + 2, 8, { tip: .4 }), brush(ex + s * 20, ey + 2, ex + s * 4, ey + 6, ex - s * 20, ey + 16, 8, { tip: .4 }), brush(ex - s * 24, ey - 22, ex - s * 4, ey - 28, ex + s * 22, ey - 36, 10, { tip: .3 }), L(`M${ex + s * 26},${ey - 8} l${s * 8},-3 M${ex + s * 26},${ey + 4} l${s * 9},0 M${ex + s * 26},${ey + 15} l${s * 8},3`, 3)); }
    o.push(P(`M${cx - 48},${y - 12} Q${cx},${y - 18} ${cx + 48},${y - 12} L${cx + 44},${y + 16} Q${cx},${y + 22} ${cx - 44},${y + 16} Z`, '#fff', INK, 5), L(`M${cx - 46},${y + 2} L${cx + 46},${y + 2}`, 2.6), teethRow(cx - 46, cx + 46, y - 14, y + 18, 9));
    o.push(...veins(cx + 54, hy - 66, 1.1), drop(cx - 86, hy - 50, 10), drop(cx + 92, hy - 20, 8));
    return { skin: 'skRed', over: o, sx: 1.08, sy: .92 };
  },
  // 26 DELIGHT GASP: sparkling eyes, tiny O, hands-free cheeks glow
  delight: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 16; o.push(ell(ex, ey, 20, 26, INK), ell(ex - 6, ey - 9, 7.5, 8.5, '#fff'), ell(ex + 7, ey + 9, 3.6, 3.6, '#fff'), star4(ex + 8, ey - 14, 5, '#fff'), brow(ex - 18, ey - 44, ex, ey - 56, ex + 18, ey - 44, 7)); }
    o.push(P(`M${cx},${hy + 30} C${cx + 13},${hy + 30} ${cx + 13},${hy + 56} ${cx},${hy + 56} C${cx - 13},${hy + 56} ${cx - 13},${hy + 30} ${cx},${hy + 30} Z`), ...blush(cx, hy, 1.1), star4(cx - 112, hy - 66, 14), star4(cx + 114, hy - 62, 16), star4(cx + 90, hy - 108, 9));
    return { over: o, sy: 1.04 };
  },
  // 27 GUILTY SIDE-EYE: pupils jammed into the corners, tight mouth, one bead of sweat
  sideeye: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 14; o.push(P(`M${ex - 20},${ey - 4} Q${ex},${ey - 14} ${ex + 20},${ey - 4} Q${ex + 20},${ey + 14} ${ex},${ey + 14} Q${ex - 20},${ey + 14} ${ex - 20},${ey - 4} Z`, '#fff', INK, 4.5), ell(ex + 13, ey + 4, 6.5, 8, INK), brush(ex - 22, ey - 6, ex, ey - 12, ex + 22, ey - 4, 6, { tip: .4 }), brow(ex - 18, ey - 28 + s * 3, ex, ey - 32, ex + 18, ey - 26 - s * 3, 7)); }
    o.push(L(`M${cx - 12},${hy + 44} q8,-4 14,0 q6,4 12,0`, 5), drop(cx + 84, hy - 50, 14));
    return { over: o };
  },
  // 28 SOUL LEAVING: X eyes, gaping mouth, little ghost floating out
  soul: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 14; o.push(brush(ex - 13, ey - 13, ex, ey, ex + 13, ey + 13, 7, { tip: .5 }), brush(ex + 13, ey - 13, ex, ey, ex - 13, ey + 13, 7, { tip: .5 })); }
    o.push(ell(cx, hy + 44, 20, 14, INK));
    const gx = cx + 40, gy = hy - 130;
    o.push(`<g opacity=".85">${P(`M${gx - 28},${gy + 40} Q${gx - 32},${gy - 24} ${gx},${gy - 26} Q${gx + 32},${gy - 24} ${gx + 28},${gy + 40} Q${gx + 18},${gy + 30} ${gx + 10},${gy + 42} Q${gx},${gy + 30} ${gx - 10},${gy + 42} Q${gx - 18},${gy + 30} ${gx - 28},${gy + 40} Z`, '#f4fbff', INK, 3.5)}${ell(gx - 9, gy - 2, 4, 5, INK)}${ell(gx + 9, gy - 2, 4, 5, INK)}${ell(gx, gy + 12, 4, 3, INK)}</g>`, L(`M${cx + 4},${hy + 36} Q${cx + 20},${hy - 40} ${gx - 2},${gy + 44}`, 3, '#b9c3d6'));
    return { skin: 'skPale', over: o, rot: 8 };
  },
};

// ---------- shared effect helpers ----------
export function veins(x, y, k = 1) { const a = (dx1, dy1, dx2, dy2) => L(`M${f1(x + dx1 * k)},${f1(y + dy1 * k)} Q${f1(x + (dx1 + dx2) * .2 * k)},${f1(y + (dy1 + dy2) * .2 * k)} ${f1(x + dx2 * k)},${f1(y + dy2 * k)}`, 5.5 * k, RED); return [a(-4, -14, -4, -4), a(-14, -4, -4, -4), a(4, -14, 4, -4), a(14, -4, 4, -4), a(-4, 14, -4, 4), a(-14, 4, -4, 4), a(4, 14, 4, 4), a(14, 4, 4, 4)]; }
export function steamBurst(cx, hy, k = 1) {
  const puff = (x, y, s) => P(smooth([[x - 18 * s, y + 4 * s], [x - 14 * s, y - 10 * s], [x - 2 * s, y - 15 * s], [x + 12 * s, y - 12 * s], [x + 19 * s, y - 1 * s], [x + 12 * s, y + 11 * s], [x - 3 * s, y + 13 * s], [x - 14 * s, y + 11 * s]]), '#eeeaf2', INK, 3.4);
  return [puff(cx - 118, hy - 4, 1.2 * k), puff(cx - 146, hy - 36, .8 * k), puff(cx - 160, hy - 66, .55 * k), puff(cx + 118, hy - 4, 1.2 * k), puff(cx + 146, hy - 36, .8 * k), puff(cx + 160, hy - 66, .55 * k), puff(cx - 20, hy - 124, .9 * k), puff(cx + 26, hy - 140, .7 * k)];
}
export function blush(cx, hy, k = 1) { return [-1, 1].flatMap(s => [ell(cx + s * 56, hy + 14, 18 * k, 9 * k, '#f39aac'), ...[-7, 0, 7].map(t => L(`M${cx + s * 56 + t - 2},${hy + 18} l4,-8`, 2.2, '#e0607a'))]); }
export function bird(x, y) { return P(`M${x - 10},${y} Q${x},${y - 12} ${x + 10},${y} Q${x},${y + 10} ${x - 10},${y} Z`, '#ffe066', INK, 2.6) + P(`M${x + 9},${y - 2} l7,2 l-7,3 Z`, '#f08a2a', INK, 1.6) + ell(x + 3, y - 3, 1.6, 1.6, INK); }

// full meme head (shape + skin + ink + face), ready to drop into the head group (R = 100 space)
export function memeHead(name, cx, hy, shape = 'rick') {
  const M = MEMES[name](cx, hy), HP = headPts(cx, hy, 100, shape);
  const t = `translate(${cx},${hy}) rotate(${M.rot || 0}) scale(${M.sx || 1},${M.sy || 1}) translate(${-cx},${-hy})`;
  return `<g transform="${t}">${(M.under || []).join('')}<path d="${smooth(HP)}" fill="url(#${M.skin || 'sk'})"/>${inkRing(HP, 13 * 1.12 / 1.5, { seed: 5 })}${M.over.join('')}</g>`;
}
