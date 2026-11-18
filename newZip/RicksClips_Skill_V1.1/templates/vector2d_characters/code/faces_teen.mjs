// TEEN face set (v2). Same contract as memes.mjs / memes2.mjs: each face (cx, hy) => { skin, rot, sx, sy, under: [], over: [] } in head space (R = 100).
// Extra skin gradients for this set go in TEEN_DEFS (ids must start with 'teen_').
// Teen touches: braces, freckles, a pimple, blush. Eyes ~hy-14 (dx 34), mouth ~hy+40.
import { INK, brush } from './char2d.mjs';
import { PINK, BLUE, RED, GOLD, f1, ell, P, L, drop, star4, heart, brow, teethRow, steamBurst } from './memes.mjs';

export const TEEN_DEFS = `
<linearGradient id="teen_screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3a63"/><stop offset=".42" stop-color="#5f6fae"/><stop offset=".78" stop-color="#a9e4ff"/><stop offset="1" stop-color="#e6fbff"/></linearGradient>
<radialGradient id="teen_blush" cx=".5" cy=".6" r=".72"><stop offset="0" stop-color="#ffb3b0"/><stop offset=".55" stop-color="#f47b7b"/><stop offset="1" stop-color="#d9474f"/></radialGradient>
<radialGradient id="teen_love" cx=".45" cy=".4" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fde8ee"/><stop offset="1" stop-color="#f3c0d0"/></radialGradient>
<linearGradient id="teen_grey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d4de"/><stop offset="1" stop-color="#f4f1f4"/></linearGradient>`;

const T = (x, y, s, size = 30, rot = 0, fill = INK) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}" stroke="#e9e4da" stroke-width="5" paint-order="stroke" transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
const STEEL = '#b9c0cc', BLUSH = '#f39aac', FRECK = '#c9826a', ZIT = '#f0706a';
// outlined white sausage (fingers): ink stroke + white core
const finger = (x0, y0, x1, y1, w = 13) => L(`M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}`, w + 9) + L(`M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}`, w, '#fff');
const freckles = (cx, hy, y = 22, dx = 58) => [-1, 1].flatMap(s => [[0, 0], [12, -5], [9, 9], [-9, 6], [22, 4]].map(([a, b]) => ell(cx + s * (dx + a), hy + y + b, 3.2, 3, FRECK)));
const pimple = (x, y, r = 7) => ell(x, y, r, r * .9, ZIT, INK, 2.6) + ell(x - r * .3, y - r * .3, r * .3, r * .26, '#fff');
const cheeks = (cx, hy, y = 30, k = 1, dx = 60) => [-1, 1].flatMap(s => [ell(cx + s * dx, hy + y, 22 * k, 12 * k, BLUSH), ...[-8, 0, 8].map(t => L(`M${f1(cx + s * dx + t * k - 2)},${f1(hy + y + 5)} l4,-9`, 2.2, '#e0607a'))]);
// braces on a white tooth band: steel wire + square brackets
const braces = (x0, x1, y, n, k = 1) => { const o = [L(`M${f1(x0)},${f1(y)} L${f1(x1)},${f1(y)}`, 3.6 * k, '#7d8696')];
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + .5) / n; o.push(`<rect x="${f1(x - 5 * k)}" y="${f1(y - 5 * k)}" width="${f1(10 * k)}" height="${f1(10 * k)}" rx="2" fill="${STEEL}" stroke="${INK}" stroke-width="2.2"/>`); }
  return o; };
const lidEye = (ex, ey, s, { pr = 9, ph = 13, lw = 18, w = 6, look = 0, open = 1, tilt = 0 } = {}) => [
  ...(open > 0 ? [`<path d="M${f1(ex + look - pr)},${f1(ey)} A${pr},${f1(ph * open)} 0 0,0 ${f1(ex + look + pr)},${f1(ey)} Z" fill="${INK}"/>`] : []),
  brush(ex - s * lw, ey + tilt, ex, ey - 1.5 + tilt * .4, ex + s * lw, ey, w, { tip: .45 })];
const shut = (ex, ey, { up = true, w = 19, h = 14, lw = 6.5 } = {}) => up ? brush(ex - w, ey + 5, ex, ey - h, ex + w, ey + 5, lw, { tip: .4 }) : brush(ex - w, ey - 4, ex, ey + h, ex + w, ey - 4, lw, { tip: .4 });
const squeeze = (ex, ey, s, w = 18, lw = 7) => [brush(ex - s * w, ey - 13, ex + s * 4, ey - 3, ex + s * w, ey + 1, lw, { tip: .4 }), brush(ex + s * w, ey + 1, ex + s * 4, ey + 5, ex - s * w, ey + 13, lw, { tip: .4 })];
const shiver = (x, y, s, n = 3) => [...Array(n)].map((_, i) => L(`M${f1(x + s * i * 10)},${f1(y - 16 + i * 3)} q${s * 7},8 0,16 q${-s * 7},8 0,16`, 3.4)).join('');

export const TEEN = {
  // 1 CRINGE: whole face scrunches to one side, teeth bared sideways, one eye clamped shut, shiver lines
  cringe: (cx, hy) => { const o = [], y = hy + 34;
    o.push(...squeeze(cx - 36, hy - 18, -1, 22, 8));
    o.push(ell(cx + 40, hy - 18, 17, 19, '#fff', INK, 5), ell(cx + 46, hy - 16, 5, 5.5, INK), brush(cx + 18, hy - 42, cx + 40, hy - 36, cx + 62, hy - 46, 8, { tip: .3 }));
    o.push(brush(cx - 60, hy - 44, cx - 38, hy - 52, cx - 14, hy - 40, 9, { tip: .3 }));
    o.push(P(`M${cx - 64},${y + 4} Q${cx - 30},${y - 18} ${cx + 4},${y - 8} Q${cx + 40},${y - 2} ${cx + 66},${y - 24} Q${cx + 62},${y + 22} ${cx + 20},${y + 26} Q${cx - 30},${y + 34} ${cx - 64},${y + 4} Z`, '#fff', INK, 5.5),
      L(`M${cx - 60},${y + 6} Q${cx},${y + 6} ${cx + 62},${y - 6}`, 3.2), teethRow(cx - 58, cx + 60, y - 18, y + 24, 9));
    o.push(L(`M${cx - 80},${y - 2} q-10,6 -6,18`, 4), ...[0, 1, 2].map(i => L(`M${cx - 14 + i * 14},${hy + 82 + i} q4,6 0,12`, 3, '#8a7f99')));
    o.push(shiver(cx - 116, hy - 10, -1), shiver(cx + 112, hy - 4, 1), drop(cx + 88, hy - 62, 9), drop(cx - 96, hy - 66, 6));
    o.push(T(cx, hy - 128, 'CRINGE', 40, -6));
    return { skin: 'teen_grey', over: o, rot: 8, sx: 1.08, sy: .9 }; },

  // 2 WHATEVER: bored eye-roll, pupils gone up under heavy lids, cheek puffed blowing "pfff"
  whatever: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 12;
      o.push(ell(ex, ey, 22, 21, '#fff', INK, 5), `<path d="M${ex - 9},${ey - 21} A9,8 0 0,0 ${ex + 9},${ey - 21} Z" fill="${INK}"/>`, ell(ex, ey - 19, 9, 3, INK));
      o.push(P(`M${ex - 23},${ey - 2} Q${ex},${ey - 26} ${ex + 23},${ey - 2} Q${ex},${ey - 8} ${ex - 23},${ey - 2} Z`, '#ece6ef', INK, 5), L(`M${ex - 14},${ey + 22} q14,6 28,0`, 2.6, '#8a7f99')); }
    o.push(brush(cx - 58, hy - 48, cx - 36, hy - 50, cx - 14, hy - 46, 7, { tip: .3 }), brush(cx + 14, hy - 46, cx + 36, hy - 50, cx + 58, hy - 48, 7, { tip: .3 }));
    o.push(brush(cx - 30, hy + 50, cx, hy + 42, cx + 22, hy + 46, 6, { tip: .4 }), P(`M${cx + 20},${hy + 38} q14,6 0,16 q-6,-8 0,-16 Z`, INK, INK, 3));
    o.push(...[[0, -8], [6, 4], [0, 16]].map(([a, b]) => L(`M${cx + 40 + a},${hy + 44 + b * .6} q16,${b * .4 - 2} 30,${b}`, 3.4)), ...[[86, 30, 9], [100, 46, 12], [88, 64, 8]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${hy + dy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="3"/>`), T(cx + 112, hy + 100, 'pfff', 28, -10));
    o.push(L(`M${cx - 64},${hy - 140} A64,22 0 1,1 ${cx + 64},${hy - 140}`, 4.5), P(`M${cx + 64},${hy - 152} l8,14 l-16,3 Z`), T(cx - 96, hy + 96, 'whatever', 26, -14));
    return { over: o, rot: -10, sy: .97 }; },

  // 3 PHONE ZOMBIE: face lit blue from below by a screen, staring down, screen glints in the eyes, mouth hangs open
  phoneZombie: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy + 2;
      o.push(ell(ex, ey, 20, 17, '#e6fbff', INK, 5), ell(ex + s * 1, ey + 8, 8, 7, INK), `<rect x="${f1(ex - 2)}" y="${f1(ey + 4)}" width="5" height="6" fill="#bff4ff"/>`);
      o.push(P(`M${ex - 22},${ey + 1} Q${ex},${ey - 20} ${ex + 22},${ey + 1} Q${ex},${ey - 4} ${ex - 22},${ey + 1} Z`, '#4a5590', INK, 4.5));
      o.push(L(`M${ex - 16},${ey + 24} q16,8 32,0`, 3, '#5c6bb0'), L(`M${ex - 12},${ey + 32} q12,5 24,0`, 2.4, '#7b8acb')); }
    o.push(brush(cx - 54, hy - 34, cx - 34, hy - 28, cx - 14, hy - 30, 6, { tip: .3 }), brush(cx + 14, hy - 30, cx + 34, hy - 28, cx + 54, hy - 34, 6, { tip: .3 }));
    o.push(ell(cx, hy + 58, 14, 17, INK), ell(cx, hy + 66, 8, 6, PINK), P(`M${cx + 8},${hy + 72} q4,16 -2,26 q-6,-6 -4,-24 Z`, '#d8f2ff', INK, 2.6));
    o.push(...[[-44, 132], [0, 140], [44, 132], [-80, 112], [80, 112]].map(([dx, dy]) => L(`M${cx + dx * .6},${hy + dy - 18} L${cx + dx},${hy + dy}`, 4, '#8fd3f4')));
    o.push(`<rect x="${cx + 72}" y="${hy - 140}" width="56" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="4"/>`, `<rect x="${cx + 77}" y="${hy - 135}" width="8" height="16" fill="${RED}"/>`, `<rect x="${cx + 128}" y="${hy - 132}" width="6" height="10" fill="${INK}"/>`, T(cx + 100, hy - 92, '1%', 26, 8, RED));
    o.push(T(cx - 110, hy - 96, 'scroll', 24, -14), T(cx - 120, hy - 66, 'scroll', 20, -14));
    return { skin: 'teen_screen', over: o, rot: 6, sy: .98 }; },

  // 4 BRACES GRIN: ear-to-ear grin full of metal braces, glint, squinty happy eyes, freckles
  bracesGrin: (cx, hy) => { const o = [], y = hy + 22;
    for (const s of [-1, 1]) o.push(shut(cx + s * 36, hy - 26, { w: 18, h: 14, lw: 7 }), brow(cx + s * 36 - 18, hy - 52, cx + s * 36, hy - 62, cx + s * 36 + 18, hy - 52, 8));
    o.push(...freckles(cx, hy, -2, 58));
    o.push(P(`M${cx - 84},${y - 10} Q${cx},${y + 2} ${cx + 84},${y - 10} Q${cx + 70},${y + 68} ${cx},${y + 70} Q${cx - 70},${y + 68} ${cx - 84},${y - 10} Z`, INK, INK, 5));
    o.push(P(`M${cx - 76},${y - 6} Q${cx},${y + 5} ${cx + 76},${y - 6} L${cx + 70},${y + 22} Q${cx},${y + 30} ${cx - 70},${y + 22} Z`, '#fff', 'none', 0), teethRow(cx - 74, cx + 74, y - 4, y + 25, 10), ...braces(cx - 72, cx + 72, y + 11, 10, 1.05));
    o.push(P(`M${cx - 50},${y + 56} Q${cx},${y + 36} ${cx + 50},${y + 56} L${cx + 46},${y + 46} Q${cx},${y + 32} ${cx - 46},${y + 46} Z`, '#fff', 'none', 0), ...braces(cx - 42, cx + 42, y + 46, 6, .85), ell(cx, y + 60, 24, 6, PINK));
    o.push(L(`M${cx - 92},${y - 22} q-8,14 2,26`, 4.4), L(`M${cx + 92},${y - 22} q8,14 -2,26`, 4.4));
    o.push(star4(cx + 66, y + 4, 16, '#fff'), star4(cx - 120, hy - 70, 14), star4(cx + 122, hy - 92, 18), star4(cx + 100, hy - 128, 9));
    return { over: o, rot: -6, sx: 1.04 }; },

  // 5 SULK: pouty lower lip sticking way out, puffed cheeks, glare to the side, little rain cloud
  sulk: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...lidEye(cx + s * 32, hy - 8, s, { open: .6, look: -8, pr: 10, ph: 14, tilt: s > 0 ? -2 : 4 }), brush(cx + s * 56, hy - 40, cx + s * 34, hy - 34, cx + s * 10, hy - 22, 9, { tip: .3 }));
    o.push(ell(cx - 70, hy + 30, 24, 18, '#f6dde4'), ell(cx + 70, hy + 30, 24, 18, '#f6dde4'), L(`M${cx - 92},${hy + 36} q8,10 20,10 M${cx + 92},${hy + 36} q-8,10 -20,10`, 3.4));
    o.push(L(`M${cx - 26},${hy + 44} Q${cx},${hy + 34} ${cx + 26},${hy + 44}`, 5), P(`M${cx - 28},${hy + 48} Q${cx},${hy + 40} ${cx + 28},${hy + 48} Q${cx + 30},${hy + 74} ${cx},${hy + 76} Q${cx - 30},${hy + 74} ${cx - 28},${hy + 48} Z`, '#e97a8d', INK, 5), L(`M${cx - 14},${hy + 56} q8,-4 16,-2`, 3, '#fff'));
    o.push(pimple(cx + 52, hy - 60, 7));
    const k = [[-40, -170, 24], [-12, -180, 30], [20, -172, 24], [42, -162, 18], [-58, -160, 16]];
    o.push(...k.map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${hy + dy}" r="${r}" fill="#6f6a84" stroke="${INK}" stroke-width="4.5"/>`), ...k.map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${hy + dy}" r="${r - 2.4}" fill="#6f6a84"/>`));
    o.push(...[-36, -10, 16].map((dx, i) => L(`M${cx + dx},${hy - 140 + i * 2} l-4,14`, 4, '#8fd3f4')), T(cx + 116, hy + 6, 'hmph', 30, 12));
    return { over: o, rot: 10, sx: 1.05, sy: .96 }; },

  // 6 MORTIFIED: entire head flushes red, shaky tiny-pupil eyes, wobbly mouth, steam, "mom STOP"
  mortified: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 16;
      o.push(ell(ex, ey, 22, 25, '#fff', INK, 5), ell(ex, ey + 2, 4, 4.4, INK), L(`M${ex - 28},${ey} q-6,-6 -3,-14 M${ex + 28},${ey} q6,-6 3,-14`, 2.6), brush(ex - s * 22, ey - 34, ex, ey - 46, ex + s * 22, ey - 50, 8, { tip: .3 })); }
    o.push(L(`M${cx - 36},${hy + 44} q9,-10 18,0 q9,10 18,0 q9,-10 18,0 q9,10 18,0`, 6));
    o.push(...[-1, 1].flatMap(s => [-12, 0, 12].map(t => L(`M${cx + s * 64 + t - 3},${hy + 30} l6,-12`, 3, '#9f2632'))));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 112},${hy - 40} q${s * 10},-12 0,-24 q${-s * 10},-12 0,-24 M${cx + s * 128},${hy + 6} q${s * 10},-12 0,-24 q${-s * 10},-12 0,-24`, 4, '#e0453a')), drop(cx + 92, hy - 40, 8), drop(cx - 94, hy - 30, 7));
    o.push(T(cx, hy - 130, 'MOM, STOP!', 36, -4, '#c8372f'));
    return { skin: 'teen_blush', over: o, sx: .94, sy: 1.02 }; },

  // 7 SMUG OK: heavy-lid smirk, one brow cocked, OK hand sign by the cheek, sparkle
  smugOk: (cx, hy) => { const o = [];
    o.push(...lidEye(cx - 34, hy - 14, -1, { open: .45, look: 8, lw: 20, w: 7 }), ...lidEye(cx + 34, hy - 14, 1, { open: .45, look: 8, lw: 20, w: 7 }));
    o.push(brush(cx - 58, hy - 36, cx - 36, hy - 38, cx - 14, hy - 34, 8, { tip: .3 }), brush(cx + 14, hy - 48, cx + 36, hy - 78, cx + 62, hy - 56, 8, { tip: .3 }));
    o.push(brush(cx - 34, hy + 44, cx + 6, hy + 52, cx + 46, hy + 28, 7, { tip: .35 }), L(`M${cx + 46},${hy + 22} q8,4 6,14`, 3.4));
    const x = cx + 112, y = hy + 30;
    o.push(finger(x + 6, y + 6, x + 6, y - 46, 14), finger(x + 22, y + 6, x + 26, y - 40, 13), finger(x + 34, y + 10, x + 44, y - 26, 12));
    o.push(ell(x - 4, y + 20, 30, 28, '#fff', INK, 5));
    o.push(`<circle cx="${x - 22}" cy="${y - 6}" r="15" fill="#e9e4da" fill-opacity="0" stroke="${INK}" stroke-width="18"/>`, `<circle cx="${x - 22}" cy="${y - 6}" r="15" fill="none" stroke="#fff" stroke-width="9"/>`, L(`M${x - 10},${y + 14} q6,4 12,2`, 3));
    o.push(star4(cx - 108, hy - 76, 18), star4(cx - 84, hy - 112, 10), T(cx - 92, hy + 92, 'ok', 32, -12));
    return { over: o, rot: -8 }; },

  // 8 HYPE: screaming "LET'S GOOO", head thrown back, mouth half the face with braces, shake lines
  hype: (cx, hy) => { const o = [], y = hy + 6;
    for (const s of [-1, 1]) { const ex = cx + s * 38, ey = hy - 40;
      o.push(ell(ex, ey, 20, 22, '#fff', INK, 5), ell(ex, ey - 2, 6, 7, INK), brush(ex - s * 20, ey - 30, ex, ey - 46, ex + s * 24, ey - 40, 9, { tip: .3 })); }
    o.push(P(`M${cx - 66},${y - 4} Q${cx},${y + 6} ${cx + 66},${y - 4} Q${cx + 62},${y + 112} ${cx},${y + 118} Q${cx - 62},${y + 112} ${cx - 66},${y - 4} Z`, INK, INK, 5));
    o.push(P(`M${cx - 58},${y} Q${cx},${y + 9} ${cx + 58},${y} L${cx + 56},${y + 16} Q${cx},${y + 24} ${cx - 56},${y + 16} Z`, '#fff', 'none', 0), ...braces(cx - 54, cx + 54, y + 10, 8, .9));
    o.push(P(`M${cx - 34},${y + 104} Q${cx},${y + 66} ${cx + 34},${y + 104} Q${cx},${y + 118} ${cx - 34},${y + 104} Z`, PINK, 'none', 0), ell(cx - 10, y + 52, 9, 13, '#5a4752'));
    o.push(...[-1.1, -.85, .85, 1.1].map(a => { const g = -Math.PI / 2 + a; return L(`M${f1(cx + Math.cos(g) * 116)},${f1(hy + Math.sin(g) * 116)} L${f1(cx + Math.cos(g) * 146)},${f1(hy + Math.sin(g) * 146)}`, 7); }));
    o.push(L(`M${cx - 120},${hy + 10} q-10,20 0,40 M${cx - 134},${hy} q-14,30 0,60 M${cx + 120},${hy + 10} q10,20 0,40 M${cx + 134},${hy} q14,30 0,60`, 4));
    o.push(T(cx + 4, hy - 136, "LET'S GOOO!", 40, 4, RED));
    return { over: o, rot: -12, sy: 1.06 }; },

  // 9 CRUSH: lovestruck melt, pink head, sparkly heart-pupil eyes, giant blush, hearts floating up
  crush: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 10;
      o.push(ell(ex, ey, 22, 26, INK), heart(ex, ey - 2, 14, '#ff5a86'), ell(ex - 9, ey - 14, 4, 4, '#fff'), brush(ex - s * 20, ey - 34, ex, ey - 46, ex + s * 22, ey - 44, 7, { tip: .3 }));
      o.push(ell(cx + s * 64, hy + 32, 26, 15, '#f5869e'), ...[-9, 0, 9].map(t => L(`M${cx + s * 64 + t - 2},${hy + 38} l5,-11`, 2.4, '#d24b6a'))); }
    o.push(P(`M${cx - 24},${hy + 46} Q${cx - 12},${hy + 58} ${cx},${hy + 48} Q${cx + 12},${hy + 58} ${cx + 24},${hy + 46}`, 'none', INK, 5), P(`M${cx + 14},${hy + 54} q6,16 0,28 q-8,-8 -4,-26 Z`, '#d8f2ff', INK, 2.6));
    o.push(heart(cx - 40, hy - 128, 16), heart(cx + 10, hy - 158, 22), heart(cx + 66, hy - 134, 13), heart(cx + 112, hy - 92, 10), heart(cx - 100, hy - 98, 9));
    o.push(L(`M${cx - 120},${hy + 40} q-8,-10 0,-20 q8,-10 0,-20`, 3.4, '#e0607a'), L(`M${cx + 122},${hy + 40} q8,-10 0,-20 q-8,-10 0,-20`, 3.4, '#e0607a'), T(cx - 112, hy - 40, 'senpai', 24, -24, '#c03a62'));
    return { skin: 'teen_love', over: o, rot: 16, sx: 1.02, sy: .96 }; },

  // 10 DEADPAN: huge half-lidded stare straight at camera, flat line, a pimple, "..." and a tumbleweed silence
  deadpan: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 38, ey = hy - 12;
      o.push(ell(ex, ey, 26, 26, '#fff', INK, 5.5), ell(ex, ey + 8, 9, 9, INK), `<path d="M${ex - 27},${ey + 1} A27,27 0 0,1 ${ex + 27},${ey + 1} Z" fill="#ece6ef" stroke="${INK}" stroke-width="5.5"/>`, L(`M${ex - 27},${ey + 1} L${ex + 27},${ey + 1}`, 7));
      o.push(L(`M${ex - 18},${ey + 34} q18,8 36,0`, 2.6, '#8a7f99'), L(`M${ex - 22},${ey - 40} L${ex + 22},${ey - 40}`, 7)); }
    o.push(L(`M${cx - 30},${hy + 54} L${cx + 30},${hy + 54}`, 6), pimple(cx - 64, hy + 40, 8), pimple(cx + 24, hy - 70, 5));
    o.push(T(cx + 118, hy - 70, '...', 56, 0));
    return { over: o, sx: 1.03, sy: .98 }; },

  // 11 UGH: head flung back, eyes squeezed, mouth stretched in a long groan, tongue lolling, "UGHHH"
  ugh: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...squeeze(cx + s * 34, hy - 20, s, 18, 7), brush(cx + s * 56, hy - 54, cx + s * 34, hy - 40, cx + s * 12, hy - 44, 8, { tip: .3 }));
    o.push(P(`M${cx - 34},${hy + 30} Q${cx},${hy + 18} ${cx + 34},${hy + 30} Q${cx + 40},${hy + 110} ${cx},${hy + 118} Q${cx - 40},${hy + 110} ${cx - 34},${hy + 30} Z`, INK, INK, 5));
    o.push(P(`M${cx - 18},${hy + 92} Q${cx},${hy + 70} ${cx + 18},${hy + 92} Q${cx + 20},${hy + 140} ${cx + 2},${hy + 146} Q${cx - 16},${hy + 140} ${cx - 18},${hy + 92} Z`, '#e97a8d', INK, 4.5), L(`M${cx},${hy + 96} l1,32`, 2.6, '#a8344a'));
    o.push(pimple(cx + 60, hy + 20, 7), L(`M${cx - 88},${hy - 82} q10,8 10,22 M${cx + 90},${hy - 84} q-10,8 -10,22`, 3.6, '#8a7f99'));
    o.push(T(cx + 6, hy - 128, 'UGHHHH', 42, 10), ...[0, 1, 2].map(i => L(`M${cx - 120 - i * 8},${hy + 40 + i * 20} q-10,8 0,16`, 3.6)));
    return { skin: 'teen_grey', over: o, rot: 14, sx: .94, sy: 1.08 }; },

  // 12 SELFIE: wink, tongue out sideways, peace sign by the face, freckles, flash sparkles
  selfie: (cx, hy) => { const o = [];
    o.push(shut(cx - 34, hy - 16, { w: 18, h: 13, lw: 7 }), L(`M${cx - 54},${hy - 12} l-10,-6 M${cx - 52},${hy - 22} l-10,-10`, 3.4));
    o.push(ell(cx + 34, hy - 16, 20, 23, INK), ell(cx + 28, hy - 24, 7, 8, '#fff'), ell(cx + 40, hy - 8, 3.4, 3.4, '#fff'));
    o.push(brush(cx - 56, hy - 40, cx - 34, hy - 46, cx - 14, hy - 40, 7, { tip: .3 }), brush(cx + 14, hy - 50, cx + 34, hy - 60, cx + 56, hy - 52, 7, { tip: .3 }));
    o.push(...freckles(cx, hy, 16, 58));
    o.push(P(`M${cx - 36},${hy + 34} Q${cx},${hy + 44} ${cx + 30},${hy + 30} Q${cx + 22},${hy + 64} ${cx - 6},${hy + 64} Q${cx - 30},${hy + 60} ${cx - 36},${hy + 34} Z`, INK, INK, 4.5));
    o.push(P(`M${cx - 4},${hy + 44} Q${cx + 22},${hy + 40} ${cx + 30},${hy + 62} Q${cx + 30},${hy + 90} ${cx + 12},${hy + 90} Q${cx - 4},${hy + 84} ${cx - 4},${hy + 44} Z`, '#e97a8d', INK, 4.5), L(`M${cx + 12},${hy + 56} l2,26`, 2.6, '#a8344a'));
    const x = cx - 116, y = hy + 34;
    o.push(finger(x - 4, y, x - 22, y - 62, 14), finger(x + 10, y, x + 22, y - 60, 14), ell(x + 2, y + 18, 28, 24, '#fff', INK, 5), L(`M${x - 12},${y + 10} q12,6 26,0 M${x - 10},${y + 22} q12,6 24,0`, 3));
    o.push(star4(cx + 112, hy - 104, 20), star4(cx + 132, hy - 60, 11), star4(cx - 70, hy - 120, 12), T(cx + 66, hy + 124, '#nofilter', 24, -6));
    return { over: o, rot: -14 }; },
};
