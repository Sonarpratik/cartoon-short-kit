// VILLAIN face set (v2). Same contract as memes.mjs / memes2.mjs: each face (cx, hy) => { skin, rot, sx, sy, under: [], over: [] } in head space (R = 100).
// Extra skin gradients for this set go in VILLAIN_DEFS (ids must start with 'villain_').
// 12 meme-level villain faces: laugh scheme sneer maniac coldStare fury gloat whisper twitch curses greedy fakeAngel
import { INK, brush } from './char2d.mjs';
import { PINK, BLUE, RED, GOLD, f1, ell, P, L, drop, star4, brow, teethRow, veins } from './memes.mjs';

export const VILLAIN_DEFS = `
<radialGradient id="villain_purple" cx=".42" cy=".5" r=".75"><stop offset="0" stop-color="#d7b6f0"/><stop offset=".55" stop-color="#a771d6"/><stop offset="1" stop-color="#6e3a9e"/></radialGradient>
<linearGradient id="villain_noir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f1830"/><stop offset=".5" stop-color="#3b2f55"/><stop offset=".53" stop-color="#e4dcec"/><stop offset="1" stop-color="#f6f2f6"/></linearGradient>
<linearGradient id="villain_soot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d6e0"/><stop offset=".6" stop-color="#eeebf1"/><stop offset="1" stop-color="#c9c4d2"/></linearGradient>
<radialGradient id="villain_glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff6a4a" stop-opacity=".85"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>`;

const VRED = '#e0302a', VPURD = '#4a2370', SOOT = '#5a5466', GOLDD = '#a87b10';
const T = (x, y, s, size = 30, rot = 0, fill = INK, extra = '') => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}"${extra} transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
// sharp villain brow: thick at the inner end, angled down to the nose
const vbrow = (ex, ey, s, lift = 0, w = 12) => brush(ex - s * 24, ey + 6, ex - s * 2, ey - 6 - lift * .5, ex + s * 26, ey - 18 - lift, w, { bias: .3, tip: .25 });
// white hand (face-set style)
const hand = (x, y, k = 1, rot = 0) => `<g transform="rotate(${rot} ${f1(x)} ${f1(y)})">${ell(x, y, 22 * k, 26 * k, '#fff', INK, 4.5)}${[-8, 0, 8].map(t => L(`M${f1(x + t * k)},${f1(y - 24 * k)} L${f1(x + t * k)},${f1(y - 10 * k)}`, 3)).join('')}</g>`;
const fistW = (x, y, k = 1) => ell(x, y, 26 * k, 22 * k, '#fff', INK, 5) + [-10, 0, 10].map(t => L(`M${f1(x + t * k - 3)},${f1(y - 16 * k)} q4,6 0,12`, 3)).join('') + L(`M${f1(x - 18 * k)},${f1(y + 6 * k)} q10,6 20,0`, 3);
const shake = (x, y, s) => [0, 1, 2].map(i => L(`M${x + s * i * 9},${y - 18 + i * 2} q${s * 8},18 0,36`, 3.6)).join('');
const puff = (x, y, s, col = '#9e98aa') => P(`M${f1(x - 18 * s)},${f1(y + 4 * s)} Q${f1(x - 20 * s)},${f1(y - 14 * s)} ${f1(x - 2 * s)},${f1(y - 15 * s)} Q${f1(x + 18 * s)},${f1(y - 16 * s)} ${f1(x + 19 * s)},${f1(y)} Q${f1(x + 16 * s)},${f1(y + 14 * s)} ${f1(x - 3 * s)},${f1(y + 13 * s)} Q${f1(x - 18 * s)},${f1(y + 14 * s)} ${f1(x - 18 * s)},${f1(y + 4 * s)} Z`, col, INK, 3.2);

export const VILLAIN = {
  // 1 MWAHAHA: head thrown back, eyes squeezed into evil arcs, cavern mouth with fangs
  laugh: (cx, hy) => { const o = [], y = hy + 6;
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 32;
      o.push(brush(ex - s * 20, ey + 6, ex + s * 2, ey - 16, ex + s * 22, ey - 2, 8, { tip: .35 }), brush(ex - s * 26, ey - 16, ex - s * 2, ey - 26, ex + s * 26, ey - 46, 13, { bias: .3, tip: .25 }));
      o.push(L(`M${cx + s * 74},${hy - 4} q${s * 10},10 ${s * 4},24`, 3.6)); }
    o.push(P(`M${cx - 62},${y} Q${cx},${y + 14} ${cx + 62},${y} Q${cx + 58},${y + 86} ${cx},${y + 92} Q${cx - 58},${y + 86} ${cx - 62},${y} Z`, INK, INK, 5));
    o.push(P(`M${cx - 56},${y + 4} Q${cx},${y + 16} ${cx + 56},${y + 4} L${cx + 54},${y + 16} Q${cx},${y + 28} ${cx - 54},${y + 16} Z`, '#fff', 'none', 0), teethRow(cx - 54, cx + 54, y + 4, y + 22, 9));
    for (const s of [-1, 1]) o.push(P(`M${cx + s * 42},${y + 14} L${cx + s * 34},${y + 40} L${cx + s * 28},${y + 17} Z`, '#fff', INK, 2.4));
    o.push(P(`M${cx - 30},${y + 84} Q${cx - 26},${y + 58} ${cx + 2},${y + 60} Q${cx + 30},${y + 58} ${cx + 32},${y + 82} Q${cx},${y + 92} ${cx - 30},${y + 84} Z`, PINK, 'none', 0), L(`M${cx + 2},${y + 64} l0,12`, 2.6, '#a8344a'));
    o.push(T(cx + 30, hy - 136, 'MWAHAHA!', 40, 12, VRED, ` stroke="${INK}" stroke-width="2.4"`), T(cx + 128, hy - 70, 'HA', 26, 30), T(cx + 136, hy + 4, 'HA', 22, 40));
    return { over: o, rot: -16, sy: 1.03 }; },

  // 2 SCHEMING: shifty side-glance, one brow in orbit, lopsided smirk with a glinting tooth, steepled fingers
  scheme: (cx, hy) => { const o = [];
    { const ex = cx - 34, ey = hy - 16; o.push(P(`M${ex - 4},${ey} A14,11 0 0,0 ${ex + 22},${ey} Z`), brush(ex - 22, ey + 2, ex, ey - 3, ex + 22, ey, 7, { tip: .4 }), vbrow(ex, ey - 22, -1, -4, 12)); }
    { const ex = cx + 36, ey = hy - 18; o.push(P(`M${ex - 20},${ey} Q${ex},${ey - 22} ${ex + 20},${ey - 2} Q${ex + 16},${ey + 16} ${ex},${ey + 16} Q${ex - 18},${ey + 16} ${ex - 20},${ey} Z`, '#fff', INK, 4.5), ell(ex + 10, ey + 4, 7, 8, INK), brush(ex - 22, ey + 1, ex, ey - 16, ex + 22, ey - 2, 6, { tip: .4 }), brow(ex - 22, ey - 44, ex + 2, ey - 78, ex + 26, ey - 56, 10)); }
    o.push(brush(cx - 30, hy + 44, cx + 12, hy + 48, cx + 50, hy + 22, 7, { bias: .7, tip: .35 }), L(`M${cx + 54},${hy + 16} q6,6 2,16`, 3.2), P(`M${cx + 30},${hy + 36} L${cx + 42},${hy + 30} L${cx + 40},${hy + 42} Z`, '#fff', INK, 2.2), star4(cx + 52, hy + 44, 9, '#fff'));
    for (const s of [-1, 1]) { o.push(P(`M${cx + s * 2},${hy + 70} Q${cx + s * 16},${hy + 68} ${cx + s * 30},${hy + 96} Q${cx + s * 52},${hy + 130} ${cx + s * 44},${hy + 156} Q${cx + s * 30},${hy + 172} ${cx + s * 14},${hy + 156} Q${cx + s * 4},${hy + 120} ${cx + s * 2},${hy + 70} Z`, '#fff', INK, 4.5));
      for (const k of [1, 2]) o.push(L(`M${f1(cx + s * (6 + k * 8))},${f1(hy + 80 + k * 8)} q${s * 4},12 ${s * 4},24`, 2.6)); }
    o.push(L(`M${cx - 18},${hy + 62} q-6,-6 -4,-14 M${cx + 18},${hy + 62} q6,-6 4,-14`, 3), T(cx - 118, hy + 120, 'hmm...', 26, -8));
    return { over: o, rot: 6 }; },

  // 3 SNEER: chin up, looking down the nose, upper lip curled off a fang, nose wrinkles
  sneer: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 16;
      o.push(P(`M${ex - 14},${ey + 2} A14,9 0 0,0 ${ex + 14},${ey + 2} Z`), brush(ex - 22, ey + 2 - s * 3, ex, ey - 3, ex + 22, ey + 2 + s * 3, 7.5, { tip: .4 }), L(`M${ex - 14},${ey + 16} q14,5 28,0`, 2.6, '#8a7f99'), vbrow(ex, ey - 22, s, s > 0 ? 8 : -2, 12)); }
    o.push(L(`M${cx - 8},${hy + 4} q8,4 16,0 M${cx - 6},${hy + 12} q6,3 12,0`, 3), L(`M${cx + 26},${hy + 14} q10,4 12,16`, 3.4));
    o.push(brush(cx - 40, hy + 48, cx - 18, hy + 50, cx - 2, hy + 46, 6, { tip: .4 }));
    o.push(P(`M${cx - 4},${hy + 46} Q${cx + 18},${hy + 22} ${cx + 44},${hy + 24} Q${cx + 40},${hy + 48} ${cx + 22},${hy + 52} Q${cx + 6},${hy + 52} ${cx - 4},${hy + 46} Z`, INK, INK, 4));
    o.push(P(`M${cx + 2},${hy + 42} Q${cx + 20},${hy + 26} ${cx + 40},${hy + 28} L${cx + 39},${hy + 36} Q${cx + 20},${hy + 34} ${cx + 4},${hy + 46} Z`, '#fff', 'none', 0), teethRow(cx + 4, cx + 40, hy + 28, hy + 42, 4), P(`M${cx + 26},${hy + 32} L${cx + 30},${hy + 50} L${cx + 34},${hy + 32} Z`, '#fff', INK, 2.2));
    o.push(L(`M${cx + 50},${hy + 14} q8,10 0,22`, 3.4), T(cx + 118, hy + 84, 'tch.', 30, -10));
    return { over: o, rot: -10, sx: .98, sy: 1.02 }; },

  // 4 MANIAC GRIN: saucer eyes with pinprick pupils, bloodshot, a grin wider than the head
  maniac: (cx, hy) => { const o = [], y = hy + 32;
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 24, r = s < 0 ? 28 : 32;
      o.push(ell(ex, ey, r, r + 2, '#fff', INK, 5));
      for (const a of [.3, 1.2, 2.3, 3.6, 4.6, 5.6]) { const x0 = ex + Math.cos(a) * r, y0 = ey + Math.sin(a) * r; o.push(L(`M${f1(x0)},${f1(y0)} q${f1(-Math.cos(a) * 6 + 3)},${f1(-Math.sin(a) * 4)} ${f1(-Math.cos(a) * 11)},${f1(-Math.sin(a) * 11)}`, 2, VRED)); }
      o.push(ell(ex + s * 2, ey + 2, 3.4, 3.4, INK), brush(ex - 20, ey - r - 14 + s * 4, ex, ey - r - 26, ex + 20, ey - r - 14 - s * 6, 7, { tip: .4 }), L(`M${ex - 16},${ey + r + 8} q16,7 32,0`, 2.6, '#8a7f99')); }
    o.push(P(`M${cx - 96},${y - 30} Q${cx},${y + 8} ${cx + 96},${y - 36} Q${cx + 74},${y + 52} ${cx},${y + 58} Q${cx - 74},${y + 52} ${cx - 96},${y - 30} Z`, '#fff', INK, 5.5));
    o.push(L(`M${cx - 90},${y - 26} Q${cx},${y + 32} ${cx + 90},${y - 32}`, 3), teethRow(cx - 86, cx + 86, y - 26, y + 52, 16));
    for (const s of [-1, 1]) o.push(L(`M${cx + s * 100},${y - 44} q${s * 8},12 ${s * 2},26`, 4));
    o.push(T(cx + 116, hy - 112, 'hee', 24, 20), T(cx + 132, hy - 80, 'hee', 20, 28), drop(cx - 104, hy - 70, 9));
    return { over: o, rot: 14 }; },

  // 5 COLD STARE: hard shadow over the top half, red glowing slit eyes, flat frown
  coldStare: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 26;
      o.push(ell(ex, ey, 38, 22, 'url(#villain_glow)'), P(`M${ex - s * 26},${ey - 12} Q${ex},${ey - 6} ${ex + s * 26},${ey + 8} Q${ex},${ey + 12} ${ex - s * 26},${ey - 12} Z`, '#ff4a36', '#ff8a6a', 1.6), ell(ex + s * 3, ey + 1, 2, 3, '#fff6b0'));
      o.push(brush(ex - s * 26, ey - 22, ex, ey - 12, ex + s * 24, ey - 2, 10, { bias: .3, tip: .3, col: '#0f0b18' })); }
    o.push(star4(cx + 58, hy - 34, 10, '#fff'));
    o.push(brush(cx - 30, hy + 52, cx, hy + 44, cx + 30, hy + 52, 6, { tip: .5 }), L(`M${cx - 18},${hy + 66} q18,5 36,0`, 2.6, '#8a7f99'));
    o.push(T(cx + 118, hy + 70, '...', 44, 0));
    return { skin: 'villain_noir', over: o }; },

  // 6 PURPLE FURY: purple head, popping forehead veins, bulging eyes, clenched teeth, lightning
  fury: (cx, hy) => { const o = [], y = hy + 36;
    const vein = d => L(d, 6, VPURD) + L(d, 2.4, '#c08ae6');
    o.push(vein(`M${cx - 20},${hy - 96} q-10,14 2,26 q10,12 -4,24`), vein(`M${cx + 60},${hy - 82} q14,10 6,26 q-6,12 8,22`), vein(`M${cx - 82},${hy - 40} q-6,16 6,28`));
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18;
      o.push(ell(ex, ey, 21, 23, '#fff', INK, 5), ell(ex - s * 3, ey + 2, 4, 4, VRED), ell(ex - s * 3, ey + 2, 1.6, 1.6, INK));
      for (const a of [.4, 2.6, 3.3]) o.push(L(`M${f1(ex + Math.cos(a) * 21)},${f1(ey + Math.sin(a) * 21)} l${f1(-Math.cos(a) * 9)},${f1(-Math.sin(a) * 7)}`, 2, VRED));
      o.push(brush(ex - s * 30, ey - 4, ex - s * 2, ey - 24, ex + s * 28, ey - 46, 15, { bias: .3, tip: .25 })); }
    o.push(P(`M${cx - 58},${y - 12} Q${cx},${y - 20} ${cx + 58},${y - 12} L${cx + 52},${y + 28} Q${cx},${y + 20} ${cx - 52},${y + 28} Z`, '#fff', INK, 5.5), L(`M${cx - 56},${y + 7} Q${cx},${y} ${cx + 56},${y + 7}`, 3), teethRow(cx - 56, cx + 56, y - 16, y + 26, 10));
    for (const s of [-1, 1]) o.push(L(`M${cx + s * 62},${y - 18} q${s * 10},16 ${s * 2},34`, 3.6));
    o.push(...veins(cx + 52, hy - 60, 1.1));
    const bolt = (x, y2, k, r) => `<g transform="rotate(${r} ${x} ${y2})">${P(`M${x},${y2 - 26 * k} L${x - 10 * k},${y2 + 2 * k} L${x},${y2 + 2 * k} L${x - 6 * k},${y2 + 26 * k} L${x + 12 * k},${y2 - 6 * k} L${x + 2 * k},${y2 - 6 * k} Z`, GOLD, INK, 3)}</g>`;
    o.push(bolt(cx - 128, hy - 50, 1.3, -14), bolt(cx + 130, hy - 40, 1.1, 16), bolt(cx - 112, hy + 40, .8, -24), T(cx + 6, hy - 136, 'GRRRR', 40, -4, '#6e3a9e', ` stroke="${INK}" stroke-width="2.4"`));
    return { skin: 'villain_purple', over: o, sx: 1.08, sy: .94 }; },

  // 7 SMUG GLOAT: chin high, heavy lids looking down at you, wide closed-teeth grin, sparkle
  gloat: (cx, hy) => { const o = [], y = hy + 38;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 14;
      o.push(P(`M${ex - 19},${ey} A19,14 0 0,0 ${ex + 19},${ey} Z`, '#fff', INK, 4.5), ell(ex + 2, ey + 8, 6.5, 5.5, INK), brush(ex - 23, ey + 1 + s * 2, ex, ey - 3, ex + 23, ey + 1 - s * 2, 8, { tip: .4 }), L(`M${ex + s * 21},${ey + 2} l${s * 7},4`, 3));
      o.push(s < 0 ? brow(ex - 20, ey - 30, ex, ey - 40, ex + 20, ey - 34, 9) : brush(ex - 22, ey - 40, ex, ey - 70, ex + 24, ey - 52, 10, { bias: .45, tip: .3 })); }
    o.push(P(`M${cx - 52},${y - 8} Q${cx},${y + 12} ${cx + 58},${y - 18} Q${cx + 48},${y + 30} ${cx},${y + 30} Q${cx - 42},${y + 28} ${cx - 52},${y - 8} Z`, '#fff', INK, 5), L(`M${cx - 48},${y + 4} Q${cx},${y + 22} ${cx + 52},${y - 4}`, 2.6), teethRow(cx - 48, cx + 52, y - 10, y + 28, 9));
    o.push(L(`M${cx - 58},${y - 18} q-6,10 0,20 M${cx + 64},${y - 28} q8,10 2,22`, 3.4));
    o.push(star4(cx + 116, hy - 66, 22), star4(cx + 96, hy - 108, 11), star4(cx - 120, hy - 40, 12), T(cx + 122, hy + 72, 'heh.', 30, -14));
    return { over: o, rot: -14, sx: 1.03 }; },

  // 8 SINISTER WHISPER: hand cupped at the mouth casting a shadow over half the face, shifty eyes, "psst"
  whisper: (cx, hy) => { const o = [];
    o.push(P(`M${cx + 6},${hy - 98} Q${cx + 70},${hy - 86} ${cx + 92},${hy - 30} Q${cx + 100},${hy + 30} ${cx + 70},${hy + 74} Q${cx + 40},${hy + 98} ${cx},${hy + 96} Q${cx + 26},${hy + 40} ${cx + 10},${hy - 10} Q${cx - 6},${hy - 60} ${cx + 6},${hy - 98} Z`, '#3a2850', 'none', 0).replace('<path', '<path fill-opacity=".42"'));
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18;
      o.push(P(`M${ex - 18},${ey} Q${ex},${ey - 12} ${ex + 18},${ey} Q${ex},${ey + 14} ${ex - 18},${ey} Z`, '#fff', INK, 4.5), ell(ex - 11, ey + 1, 5.5, 6, INK), brush(ex - 21, ey - 1, ex, ey - 9, ex + 21, ey - 1, 7, { tip: .4 }), vbrow(ex, ey - 22, s, 0, 11)); }
    o.push(P(`M${cx + 14},${hy + 44} Q${cx + 26},${hy + 34} ${cx + 38},${hy + 42} Q${cx + 28},${hy + 54} ${cx + 14},${hy + 44} Z`, INK, INK, 3), brush(cx - 22, hy + 46, cx - 4, hy + 48, cx + 14, hy + 44, 5, { tip: .4 }));
    o.push(`<g transform="rotate(-8 ${cx + 74} ${hy + 40})">${P(`M${cx + 52},${hy + 76} Q${cx + 46},${hy + 30} ${cx + 58},${hy + 4} Q${cx + 70},${hy - 6} ${cx + 80},${hy + 6} L${cx + 92},${hy + 70} Q${cx + 74},${hy + 88} ${cx + 52},${hy + 76} Z`, '#fff', INK, 4.5)}${[0, 1, 2].map(k => L(`M${cx + 62 + k * 7},${hy + 14 + k * 4} l4,${22 - k * 2}`, 2.6)).join('')}</g>`);
    o.push(`<g opacity=".7">${[0, 1, 2].map(k => L(`M${cx + 104 + k * 12},${hy + 10 - k * 4} q10,26 0,52`, 3.4)).join('')}</g>`, T(cx + 116, hy - 66, 'psst...', 28, 8), T(cx - 120, hy + 100, 'shh', 22, -12, '#7a6e8f'));
    return { over: o, rot: -10 }; },

  // 9 EYE TWITCH: one saucer eye, one squeezed and twitching, wobbly forced grin, vein + sweat
  twitch: (cx, hy) => { const o = [], y = hy + 40;
    { const ex = cx - 36, ey = hy - 20; o.push(ell(ex, ey, 27, 31, '#fff', INK, 5), ell(ex + 2, ey + 2, 3.2, 3.2, INK), brush(ex - 22, ey - 50, ex, ey - 64, ex + 22, ey - 50, 7, { tip: .4 })); }
    { const ex = cx + 36, ey = hy - 14; o.push(L(`M${ex - 22},${ey} l7,-6 l7,6 l7,-6 l7,6 l7,-6`, 6), L(`M${ex - 18},${ey + 10} l6,4 l6,-4 l6,4 l6,-4 l6,4`, 3.4), brush(ex - 24, ey - 22, ex, ey - 16, ex + 24, ey - 30, 9, { tip: .3 }));
      o.push(L(`M${ex + 30},${ey - 14} l10,-6 M${ex + 32},${ey} l12,0 M${ex + 30},${ey + 14} l10,6 M${ex + 22},${ey + 24} l6,10`, 3.4)); }
    let top = `M${cx - 56},${y - 10}`, bot = '';
    for (let k = 1; k <= 8; k++) top += ` L${f1(cx - 56 + k * 14)},${f1(y - 10 + (k % 2 ? -5 : 3) - Math.sin(k / 8 * Math.PI) * 2)}`;
    for (let k = 7; k >= 0; k--) bot += ` L${f1(cx - 56 + k * 14)},${f1(y + 20 + (k % 2 ? 4 : -3) - (k === 0 || k === 8 ? 10 : 0))}`;
    o.push(P(top + bot + ' Z', '#fff', INK, 5), L(`M${cx - 52},${y + 4} L${cx + 52},${y + 4}`, 2.6), teethRow(cx - 56, cx + 56, y - 14, y + 22, 8));
    o.push(L(`M${cx - 72},${hy + 16} q-12,26 0,48`, 3), ...veins(cx + 62, hy - 70, .9), drop(cx - 90, hy - 62, 11), T(cx + 118, hy - 92, 'twitch', 24, 22), L(`M${cx - 10},${hy - 96} q-6,-30 14,-40 q20,-6 18,12 q-2,14 -16,8`, 4.5));
    return { over: o, rot: -8 }; },

  // 10 "CURSES!": singed after the plan blew up: soot, smoke, gritted teeth, shaking fist
  curses: (cx, hy) => { const o = [], y = hy + 36;
    o.push(...[[-48, -60, 22, 12], [44, 30, 18, 10], [-60, 34, 14, 8], [20, -78, 16, 8]].map(([dx, dy, rx, ry]) => ell(cx + dx, hy + dy, rx, ry, SOOT).replace('<ellipse', '<ellipse fill-opacity=".45"')));
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18;
      o.push(brush(ex - s * 18, ey - 12, ex + s * 4, ey - 2, ex + s * 18, ey + 2, 7.5, { tip: .4 }), brush(ex + s * 18, ey + 2, ex + s * 4, ey + 6, ex - s * 18, ey + 14, 7.5, { tip: .4 }), brush(ex - s * 26, ey - 26, ex, ey - 26, ex + s * 22, ey - 40, 11, { bias: .3, tip: .3 })); }
    o.push(P(`M${cx - 50},${y - 6} Q${cx},${y - 16} ${cx + 50},${y - 6} L${cx + 46},${y + 22} Q${cx},${y + 14} ${cx - 46},${y + 22} Z`, '#fff', INK, 5), L(`M${cx - 48},${y + 8} Q${cx},${y + 2} ${cx + 48},${y + 8}`, 2.6), teethRow(cx - 48, cx + 48, y - 12, y + 20, 8));
    o.push(drop(cx - 84, hy - 50, 12), drop(cx + 80, hy - 66, 9), drop(cx - 100, hy + 4, 7));
    o.push(puff(cx - 40, hy - 120, 1.1), puff(cx - 6, hy - 150, .8), puff(cx + 30, hy - 128, .6));
    o.push(fistW(cx + 118, hy + 30, 1.05), shake(cx + 150, hy + 30, 1), shake(cx + 86, hy + 30, -1), T(cx + 10, hy - 168, 'CURSES!', 36, -6, VRED, ` stroke="${INK}" stroke-width="2.4"`));
    return { skin: 'villain_soot', over: o, rot: 6 }; },

  // 11 GREEDY: gold-coin eyes, tongue out, drool rope, hands rubbing together
  greedy: (cx, hy) => { const o = [], y = hy + 32;
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 20;
      o.push(ell(ex, ey, 26, 26, GOLD, INK, 5), ell(ex, ey, 18, 18, 'none', GOLDD, 2.6), T(ex, ey + 12, '$', 34, 0, GOLDD), L(`M${ex - 14},${ey - 12} q6,-8 14,-8`, 3.4, '#fff8d0'), brush(ex - 20, ey - 42, ex, ey - 54, ex + 20, ey - 42, 8, { tip: .4 })); }
    o.push(star4(cx - 10, hy - 50, 10, '#fff'), star4(cx + 70, hy - 44, 8, '#fff'));
    o.push(P(`M${cx - 48},${y - 8} Q${cx},${y + 2} ${cx + 48},${y - 8} Q${cx + 40},${y + 36} ${cx},${y + 38} Q${cx - 40},${y + 36} ${cx - 48},${y - 8} Z`), P(`M${cx - 42},${y - 5} Q${cx},${y + 4} ${cx + 42},${y - 5} L${cx + 40},${y + 4} Q${cx},${y + 12} ${cx - 40},${y + 4} Z`, '#fff', 'none', 0));
    o.push(P(`M${cx - 18},${y + 22} Q${cx - 22},${y + 66} ${cx + 2},${y + 70} Q${cx + 24},${y + 66} ${cx + 20},${y + 22} Z`, PINK, INK, 3.6), L(`M${cx + 1},${y + 30} l0,22`, 2.6, '#a8344a'));
    o.push(P(`M${cx + 34},${y + 14} Q${cx + 40},${y + 60} ${cx + 36},${y + 84} A7,7 0 0,1 ${cx + 24},${y + 82} Q${cx + 28},${y + 50} ${cx + 30},${y + 16} Z`, '#cfefff', INK, 2.6));
    o.push(`<g transform="rotate(-20 ${cx - 14} ${hy + 130})">${ell(cx - 14, hy + 130, 30, 20, '#fff', INK, 4.5)}</g>`, `<g transform="rotate(20 ${cx + 14} ${hy + 132})">${ell(cx + 14, hy + 132, 30, 20, '#fff', INK, 4.5)}${[-8, 2, 12].map(t => L(`M${cx + 14 + t},${hy + 116} q4,6 2,14`, 2.6)).join('')}</g>`);
    o.push(L(`M${cx - 66},${hy + 112} q-8,16 0,32 M${cx + 66},${hy + 112} q8,16 0,32`, 3.4), T(cx - 120, hy - 96, 'hehe', 26, -16));
    o.push(...[[-120, -30, 12], [124, -60, 14], [118, 30, 10]].map(([dx, dy, r]) => ell(cx + dx, hy + dy, r, r, GOLD, INK, 3) + T(cx + dx, hy + dy + r * .45, '$', f1(r * 1.3), 0, GOLDD)));
    return { over: o, rot: -6 }; },

  // 12 FAKE ANGEL: halo, sweet ^ eye and blush... but horns peek out, one red-glint eye, one tiny fang
  fakeAngel: (cx, hy) => { const o = [];
    const under = [-1, 1].map(s => P(`M${cx + s * 44},${hy - 82} Q${cx + s * 54},${hy - 104} ${cx + s * 66},${hy - 116} Q${cx + s * 70},${hy - 96} ${cx + s * 68},${hy - 70} Z`, '#d8473c', INK, 4.5));
    o.push(`<ellipse cx="${cx - 4}" cy="${hy - 144}" rx="66" ry="15" fill="none" stroke="${INK}" stroke-width="15"/><ellipse cx="${cx - 4}" cy="${hy - 144}" rx="66" ry="15" fill="none" stroke="${GOLD}" stroke-width="8"/>`, L(`M${cx - 50},${hy - 152} q16,-6 34,-7`, 3, '#fff8d0'));
    o.push(brush(cx - 54, hy - 12, cx - 34, hy - 34, cx - 14, hy - 12, 7, { tip: .4 }), brow(cx - 52, hy - 50, cx - 34, hy - 58, cx - 14, hy - 50, 7));
    { const ex = cx + 34, ey = hy - 18; o.push(P(`M${ex - 18},${ey + 2} Q${ex},${ey - 6} ${ex + 18},${ey + 2} Q${ex},${ey + 10} ${ex - 18},${ey + 2} Z`, '#fff', INK, 3.4), ell(ex + 4, ey + 2, 3.4, 3.8, VRED), brush(ex - 22, ey - 2, ex, ey - 9, ex + 22, ey - 2, 7, { tip: .4 }), brush(ex - 16, ey - 20, ex + 2, ey - 26, ex + 22, ey - 40, 8, { bias: .3, tip: .3 }), star4(ex + 20, ey - 8, 9, '#ff5a48')); }
    o.push(brush(cx - 22, hy + 38, cx, hy + 52, cx + 24, hy + 36, 5.5, { tip: .4 }), P(`M${cx + 12},${hy + 43} L${cx + 15},${hy + 54} L${cx + 19},${hy + 41} Z`, '#fff', INK, 2));
    o.push(...[-1, 1].flatMap(s => [ell(cx + s * 56, hy + 16, 17, 9, '#f39aac'), ...[-7, 0, 7].map(t => L(`M${cx + s * 56 + t - 2},${hy + 20} l4,-8`, 2.2, '#e0607a'))]));
    o.push(star4(cx - 118, hy - 60, 16, '#fff'), star4(cx - 100, hy + 10, 9, '#fff'), star4(cx + 116, hy - 30, 12, '#fff'), T(cx - 84, hy + 134, 'who, me?', 24, -8));
    return { under, over: o, rot: 8 }; },
};
