// MONSTER face set (v2). Same contract as memes.mjs / memes2.mjs: each face (cx, hy) => { skin, rot, sx, sy, under: [], over: [] } in head space (R = 100).
// Extra skin gradients for this set go in MONSTER_DEFS (ids must start with 'monster_').
// 12 creature faces, each its own drawing: roar, cyclops, patchwork, booo, goblin, troll, blob, skull, swamp, werewolf, demon, shy.
import { INK, brush, headPts, smooth, inkRing, faceKit } from './char2d.mjs';
import { PINK, BLUE, RED, GOLD, GREEN, f1, ell, P, L, drop, star4, star5, heart, brow, teethRow, blush } from './memes.mjs';

const rg = (id, a, b, c) => `<radialGradient id="${id}" cx=".32" cy=".3" r=".9"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
export const MONSTER_DEFS = [
  rg('monster_green', '#eef7c4', '#b9d86c', '#83ad46'), rg('monster_blue', '#f4f9ff', '#c2dcf2', '#8fb2d6'), rg('monster_purple', '#f3e8ff', '#c7a6ec', '#9670c6'),
  rg('monster_patch', '#e8eed8', '#bccaa2', '#8e9d7a'), rg('monster_ghost', '#ffffff', '#e3edfb', '#b6c9e8'), rg('monster_grey', '#f0eee8', '#c6c2b6', '#958f83'),
  rg('monster_teal', '#e8fdf6', '#a3e3d2', '#5db6a3'), rg('monster_bone', '#fffdf6', '#f2ead4', '#d3c5a0'), rg('monster_swamp', '#e2e8b6', '#a6b36c', '#6c7a42'),
  rg('monster_fur', '#efe2d2', '#c9a98b', '#94735a'), rg('monster_red', '#ff9c8c', '#e5483c', '#a82a25'), rg('monster_lilac', '#fdf6ff', '#e6d2f8', '#c4a6e8'),
].join('');

const T = (x, y, s, size = 30, rot = 0, fill = INK, sw = 0) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}" paint-order="stroke"` : ''} transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
const q = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
// cross stitches along a seam
const stitch = (x0, y0, x1, y1, n, w = 3.4) => { const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len * 9, ny = dx / len * 9; let o = L(`M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}`, w);
  for (let k = 0; k < n; k++) { const t = (k + .5) / n, x = x0 + dx * t, y = y0 + dy * t; o += L(`M${f1(x - nx + dx / len * 3)},${f1(y - ny + dy / len * 3)} L${f1(x + nx - dx / len * 3)},${f1(y + ny - dy / len * 3)}`, w); } return o; };
// stroke all, then fill all on top: one clean merged outline (slime, fur)
const merge = (ds, col, sw = 4.5) => ds.map(d => `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`).join('') + ds.map(d => `<path d="${d}" fill="${col}"/>`).join('');
const bubble = (x, y, r, col = '#d8f5c8') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}" fill-opacity=".85" stroke="${INK}" stroke-width="3"/>` + L(`M${f1(x - r * .5)},${f1(y - r * .2)} q${f1(r * .1)},${f1(-r * .35)} ${f1(r * .45)},${f1(-r * .45)}`, 2.4, '#fff');
const fly = (x, y) => ell(x - 5, y - 6, 6, 4, '#fff', INK, 2) + ell(x + 5, y - 6, 6, 4, '#fff', INK, 2) + ell(x, y, 5, 4, INK) + L(`M${x + 8},${y + 6} q8,4 14,-2`, 2, INK);
const glossy = (ex, ey, rx, ry, iris) => [ell(ex, ey, rx, ry, INK), ell(ex + rx * .05, ey + ry * .18, rx * .74, ry * .7, iris), ell(ex + rx * .08, ey + ry * .24, rx * .4, ry * .4, INK), ell(ex - rx * .3, ey - ry * .36, rx * .4, ry * .32, '#fff'), ell(ex + rx * .38, ey + ry * .42, rx * .17, rx * .17, '#fff')];

export const MONSTER = {
  // 1 FANG ROAR: jaw drops below the head, mouth is the whole face, fangs, spit flying
  roar: (cx, hy) => {
    const under = [P(`M${cx - 74},${hy + 20} Q${cx - 84},${hy + 158} ${cx},${hy + 166} Q${cx + 84},${hy + 158} ${cx + 74},${hy + 20} Z`, 'url(#monster_blue)', INK, 8)], o = [];
    o.push(P(`M${cx - 66},${hy + 4} Q${cx},${hy - 16} ${cx + 66},${hy + 4} Q${cx + 70},${hy + 140} ${cx},${hy + 148} Q${cx - 70},${hy + 140} ${cx - 66},${hy + 4} Z`), ell(cx + 6, hy + 118, 38, 20, PINK), L(`M${cx + 6},${hy + 104} l0,22`, 3, '#a8344a'));
    for (const [x, len, w] of [[-46, 58, 12], [-22, 26, 8], [22, 26, 8], [46, 58, 12]]) o.push(P(`M${cx + x - w},${hy - 2} L${cx + x},${hy + len} L${cx + x + w},${hy - 2} Z`, '#fff', INK, 3));
    for (const [x, len, w] of [[-40, 40, 10], [40, 40, 10], [-14, 18, 7], [14, 18, 7]]) o.push(P(`M${cx + x - w},${hy + 138 - Math.abs(x) * .35} L${cx + x},${hy + 138 - Math.abs(x) * .35 - len} L${cx + x + w},${hy + 138 - Math.abs(x) * .35} Z`, '#fff', INK, 3));
    for (const s of [-1, 1]) { const ex = cx + s * 40, ey = hy - 44; o.push(ell(ex, ey, 18, 13, '#fff', INK, 4.5), ell(ex - s * 4, ey + 2, 6, 6, INK), brush(ex + s * 32, ey - 34, ex + s * 4, ey - 26, ex - s * 26, ey - 8, 14, { bias: .7, tip: .3 })); }
    o.push(L(`M${cx - 12},${hy - 22} l-4,-8 M${cx + 12},${hy - 22} l4,-8`, 4));
    o.push(drop(cx - 104, hy + 40, 11, '#d6f1ff'), drop(cx + 108, hy + 56, 12, '#d6f1ff'), drop(cx + 128, hy + 8, 7, '#d6f1ff'), drop(cx - 126, hy + 2, 7, '#d6f1ff'), drop(cx - 96, hy + 96, 6, '#d6f1ff'));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 118},${hy - 66} l${s * 22},-12 M${cx + s * 124},${hy - 40} l${s * 26},-2 M${cx + s * 118},${hy - 88} l${s * 14},-18`, 6)));
    o.push(T(cx, hy - 122, 'RAWR!', 40, -4, '#fff', 7));
    return { skin: 'monster_blue', under, over: o, sy: 1.02 };
  },
  // 2 CYCLOPS: one giant bloodshot eye, single bushy brow raised, gappy grin, horn
  cyclops: (cx, hy) => {
    const o = [];
    o.push(P(`M${cx - 20},${hy - 92} Q${cx - 8},${hy - 150} ${cx + 16},${hy - 166} Q${cx + 8},${hy - 130} ${cx + 24},${hy - 94} Z`, '#f3e6c4', INK, 5), L(`M${cx - 14},${hy - 112} q16,4 32,-2 M${cx - 8},${hy - 132} q12,4 24,-2`, 3, '#b8a57a'));
    o.push(ell(cx, hy - 2, 54, 46, '#fff', INK, 6.5), L(`M${cx - 54},${hy - 4} q12,2 18,-8 M${cx - 50},${hy + 16} q12,-2 20,6 M${cx + 52},${hy - 34} q-12,0 -18,10 M${cx + 50},${hy + 10} q-10,-4 -18,4 M${cx - 30},${hy - 60} q4,10 14,12`, 2.6, RED));
    o.push(ell(cx + 8, hy - 2, 29, 29, '#7cc23d', INK, 4), ell(cx + 10, hy, 14, 15, INK), ell(cx - 2, hy - 14, 9, 10, '#fff'), ell(cx + 20, hy + 12, 4, 4, '#fff'));
    o.push(brush(cx - 44, hy - 58, cx - 4, hy - 86, cx + 46, hy - 66, 12, { bias: .6, tip: .3 }));
    o.push(P(`M${cx - 44},${hy + 52} Q${cx},${hy + 70} ${cx + 46},${hy + 48} Q${cx + 34},${hy + 86} ${cx},${hy + 88} Q${cx - 34},${hy + 86} ${cx - 44},${hy + 52} Z`), ell(cx + 6, hy + 78, 16, 7, PINK),
      P(`M${cx - 18},${hy + 60} L${cx - 2},${hy + 63} L${cx - 4},${hy + 76} L${cx - 17},${hy + 74} Z`, '#fff', INK, 2.4), P(`M${cx + 18},${hy + 61} L${cx + 30},${hy + 58} L${cx + 29},${hy + 70} L${cx + 19},${hy + 72} Z`, '#fff', INK, 2.4));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 112},${hy - 40} l${s * 22},-8 M${cx + s * 114},${hy - 12} l${s * 24},0 M${cx + s * 112},${hy + 16} l${s * 22},8`, 5)));
    return { skin: 'monster_purple', over: o, sx: 1.05 };
  },
  // 3 PATCHWORK: sewn-on patch of a different skin, mismatched eyes, stitched crooked grin
  patchwork: (cx, hy) => {
    const o = [];
    o.push(P(`M${cx + 8},${hy - 86} L${cx + 16},${hy - 8} L${cx + 86},${hy + 2} Q${cx + 88},${hy - 44} ${cx + 62},${hy - 72} Q${cx + 38},${hy - 88} ${cx + 8},${hy - 86} Z`, '#d6dcb0', 'none', 0));
    o.push(stitch(cx + 8, hy - 86, cx + 16, hy - 8, 5), stitch(cx + 16, hy - 8, cx + 86, hy + 2, 4), stitch(cx - 84, hy - 54, cx - 22, hy - 74, 4), stitch(cx - 90, hy + 18, cx - 52, hy + 58, 3));
    o.push(ell(cx - 38, hy - 24, 26, 29, '#fff', INK, 5), ell(cx - 34, hy - 20, 5, 5.5, INK), brow(cx - 62, hy - 64, cx - 40, hy - 74, cx - 16, hy - 62, 8));
    { const ex = cx + 50, ey = hy - 44; o.push(ell(ex, ey, 16, 16, '#fff', INK, 4.5), ell(ex + 4, ey + 6, 7.5, 7.5, INK), P(`M${ex - 17},${ey + 1} A17,17 0 0,1 ${ex + 17},${ey + 1} Z`, '#a7b384', INK, 4), brush(ex - 22, ey + 2, ex, ey - 2, ex + 22, ey + 4, 6, { tip: .4 })); }
    o.push(L(`M${cx - 54},${hy + 42} Q${cx - 20},${hy + 34} ${cx + 4},${hy + 54} Q${cx + 30},${hy + 70} ${cx + 62},${hy + 46}`, 7), P(`M${cx + 30},${hy + 62} L${cx + 36},${hy + 78} L${cx + 44},${hy + 60} Z`, '#fff', INK, 2.6));
    o.push(...[-44, -28, -12, 4, 20, 46].map((t, i) => L(`M${cx + t},${hy + [32, 30, 36, 46, 52, 46][i]} l2,${i === 5 ? 18 : 16}`, 3)));
    o.push(drop(cx - 20, hy + 70, 7, '#d6f1ff'), T(cx - 96, hy - 112, 'uhh', 30, -14));
    return { skin: 'monster_patch', over: o, rot: -6 };
  },
  // 4 BOOO: pale ghost face, stretched, hollow black eyes, long O mouth, the word itself
  booo: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) o.push(`<g transform="rotate(${s * -12} ${cx + s * 34} ${hy - 30})">${ell(cx + s * 34, hy - 30, 19, 32, INK)}${ell(cx + s * 34, hy - 18, 10, 14, '#3b3550')}</g>`);
    o.push(ell(cx, hy + 50, 24, 48, INK), ell(cx, hy + 80, 12, 10, '#3b3550'));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 116},${hy - 30} q${s * 12},16 0,32 q${-s * 12},16 0,32 q${s * 12},16 0,32`, 5, '#8fa6d6')));
    o.push(T(cx + 6, hy - 128, 'BOOO!', 44, -6, '#fff', 8));
    return { skin: 'monster_ghost', over: o, sx: .9, sy: 1.12 };
  },
  // 5 GOBLIN: bat ears, yellow slit eyes, hook nose, grin of pointy teeth
  goblin: (cx, hy) => {
    const under = [-1, 1].map(s => P(`M${cx + s * 84},${hy - 40} Q${cx + s * 130},${hy - 80} ${cx + s * 152},${hy - 112} Q${cx + s * 150},${hy - 30} ${cx + s * 92},${hy + 22} Z`, 'url(#monster_green)', INK, 6) + L(`M${cx + s * 96},${hy - 26} Q${cx + s * 128},${hy - 60} ${cx + s * 140},${hy - 86}`, 3.4, '#6f9a3a'));
    const o = [];
    for (const s of [-1, 1]) { const ix = cx + s * 12, iy = hy - 24, ox = cx + s * 62, oy = hy - 44;
      o.push(P(`M${ix},${iy} Q${cx + s * 38},${hy - 52} ${ox},${oy} Q${cx + s * 40},${hy - 12} ${ix},${iy} Z`, GOLD, INK, 4.5), ell(cx + s * 36, hy - 31, 3.6, 10, INK), brush(cx + s * 70, hy - 66, cx + s * 40, hy - 52, cx + s * 8, hy - 36, 12, { bias: .7, tip: .3 })); }
    o.push(P(`M${cx - 8},${hy - 22} Q${cx + 10},${hy + 4} ${cx + 34},${hy + 12} Q${cx + 14},${hy + 22} ${cx - 6},${hy + 10} Z`, 'url(#monster_green)', INK, 4.5));
    const A = [cx - 80, hy + 16], C = [cx, hy + 50], B = [cx + 80, hy + 10];
    o.push(P(`M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]} Q${cx + 52},${hy + 86} ${cx},${hy + 88} Q${cx - 54},${hy + 86} ${A[0]},${A[1]} Z`));
    let d = ''; for (let k = 0; k < 10; k++) { const t0 = .06 + k * .088, t1 = t0 + .088, a = q(A, C, B, t0), b = q(A, C, B, t1), m = q(A, C, B, (t0 + t1) / 2); d += `M${f1(a[0])},${f1(a[1] - 1)} L${f1(m[0])},${f1(m[1] + 15)} L${f1(b[0])},${f1(b[1] - 1)} Z `; }
    o.push(P(d, '#fff', INK, 2.2));
    o.push(...[-46, -18, 12, 40].map(x => { const y = hy + 84 - Math.abs(x) * .32; return P(`M${cx + x - 8},${y} L${cx + x},${y - 15} L${cx + x + 8},${y} Z`, '#fff', INK, 2.2); }));
    o.push(ell(cx - 58, hy + 52, 5, 5, '#6f9a3a'), ell(cx + 70, hy - 82, 6, 6, '#6f9a3a', INK, 2.4), T(cx - 92, hy - 112, 'hehe', 28, -14), star4(cx + 50, hy + 48, 9, '#fff'));
    return { skin: 'monster_green', under, over: o, rot: -6 };
  },
  // 6 TROLL TUSKS: huge underbite jaw, tusks up, beady eyes under a unibrow, bulb nose, warts, flies
  troll: (cx, hy) => {
    const under = [], o = [];
    o.push(P(`M${cx - 90},${hy + 14} Q${cx - 114},${hy + 140} ${cx},${hy + 146} Q${cx + 114},${hy + 140} ${cx + 90},${hy + 14} Q${cx},${hy + 40} ${cx - 90},${hy + 14} Z`, 'url(#monster_grey)', INK, 7));
    o.push(P(`M${cx - 74},${hy + 30} Q${cx},${hy + 44} ${cx + 74},${hy + 30} Q${cx + 40},${hy + 58} ${cx},${hy + 60} Q${cx - 40},${hy + 58} ${cx - 74},${hy + 30} Z`));
    for (let k = -2; k <= 2; k++) o.push(`<rect x="${cx + k * 15 - 6}" y="${hy + 42 - Math.abs(k) * 2}" width="12" height="11" rx="2" fill="#f6efd8" stroke="${INK}" stroke-width="2.4"/>`);
    for (const s of [-1, 1]) o.push(P(`M${cx + s * 42},${hy + 52} Q${cx + s * 30},${hy + 12} ${cx + s * 50},${hy - 14} Q${cx + s * 62},${hy + 18} ${cx + s * 62},${hy + 50} Z`, '#f6efd8', INK, 4.5), L(`M${cx + s * 50},${hy + 30} q${s * 6},-4 ${s * 8},-2`, 2.4, '#c9bd98'));
    o.push(L(`M${cx - 30},${hy + 112} q30,10 60,0`, 3.4), L(`M${cx - 80},${hy + 74} q-8,16 -2,30 M${cx + 80},${hy + 74} q8,16 2,30`, 3.4), L(`M${cx - 80},${hy + 60} Q${cx - 70},${hy + 120} ${cx - 20},${hy + 132}`, 6, '#fff').replace('stroke="#fff"','stroke="#fff" stroke-opacity=".35"'));
    for (const s of [-1, 1]) o.push(ell(cx + s * 34, hy - 20, 12, 10, '#fff', INK, 4), ell(cx + s * 32, hy - 18, 4.5, 4.5, INK));
    o.push(brush(cx - 66, hy - 44, cx, hy - 22, cx + 66, hy - 46, 17, { bias: .5, tip: .25 }));
    o.push(ell(cx, hy + 6, 28, 21, 'url(#monster_grey)', INK, 5), ell(cx - 10, hy + 15, 5, 4, INK), ell(cx + 10, hy + 15, 5, 4, INK), L(`M${cx - 14},${hy - 4} q6,-6 14,-6`, 3, '#fff'));
    o.push(ell(cx + 66, hy - 70, 7, 7, '#a59f90', INK, 2.6), ell(cx - 70, hy + 20, 6, 6, '#a59f90', INK, 2.6), ell(cx + 40, hy + 90, 5, 5, '#a59f90', INK, 2.4));
    o.push(fly(cx + 110, hy - 96), fly(cx - 116, hy - 70), `<path d="M${cx + 96},${hy - 86} q-20,10 -10,24 q14,14 -6,26" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 5"/>`);
    return { skin: 'monster_grey', under, over: o, sx: 1.08, sy: .96 };
  },
  // 7 THREE-EYED BLOB: melting drips, three eyes each looking elsewhere, gurgling wobble mouth, bubbles
  blob: (cx, hy) => {
    const under = [merge([-1, 1].map(s => `M${cx + s * 22},${hy + 88} Q${cx + s * 36},${hy + 140} ${cx + s * 30},${hy + 148} Q${cx + s * 18},${hy + 150} ${cx + s * 16},${hy + 128} Q${cx + s * 6},${hy + 96} ${cx + s * 22},${hy + 88} Z`).concat([`M${cx + 60},${hy + 70} Q${cx + 74},${hy + 110} ${cx + 66},${hy + 118} Q${cx + 54},${hy + 118} ${cx + 52},${hy + 92} Z`]), '#7fcbb8', 5)], o = [];
    o.push(ell(cx, hy - 56, 26, 26, '#fff', INK, 5), ell(cx - 8, hy - 66, 9, 9, INK), ell(cx - 12, hy - 70, 3, 3, '#fff'));
    o.push(ell(cx - 50, hy - 8, 19, 19, '#fff', INK, 4.5), ell(cx - 38, hy - 6, 7.5, 7.5, INK));
    o.push(ell(cx + 52, hy - 12, 21, 22, '#fff', INK, 4.5), ell(cx + 56, hy + 2, 8, 8, INK));
    o.push(brow(cx - 20, hy - 94, cx, hy - 104, cx + 20, hy - 94, 7), brow(cx - 68, hy - 38, cx - 50, hy - 44, cx - 32, hy - 34, 6), brow(cx + 34, hy - 48, cx + 52, hy - 54, cx + 70, hy - 44, 6));
    o.push(P(`M${cx - 42},${hy + 38} q10,-10 21,0 q10,-10 21,0 q10,-10 21,0 q10,-10 21,0 Q${cx + 46},${hy + 84} ${cx},${hy + 88} Q${cx - 46},${hy + 84} ${cx - 42},${hy + 38} Z`), ell(cx - 4, hy + 72, 20, 9, PINK));
    o.push(P(`M${cx + 26},${hy + 70} Q${cx + 32},${hy + 102} ${cx + 28},${hy + 114} A6,6 0 0,1 ${cx + 18},${hy + 112} Q${cx + 20},${hy + 92} ${cx + 22},${hy + 74} Z`, '#c9f2b0', INK, 2.6));
    o.push(bubble(cx + 76, hy + 76, 9, '#c9f2e8'), bubble(cx + 98, hy + 48, 13, '#c9f2e8'), bubble(cx + 120, hy + 10, 9, '#c9f2e8'), bubble(cx - 96, hy + 60, 8, '#c9f2e8'), T(cx + 104, hy - 96, 'glrbl', 28, 14));
    return { skin: 'monster_teal', under, over: o, sx: 1.05, sy: .98 };
  },
  // 8 SKULL GRIN: bone skin, black sockets with pinpoint glints, heart nose hole, big teeth grin, cracks, rattle
  skull: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 20; o.push(P(`M${ex - s * 26},${ey - 4} Q${ex - s * 24},${ey - 30} ${ex},${ey - 30} Q${ex + s * 28},${ey - 28} ${ex + s * 26},${ey + 2} Q${ex + s * 22},${ey + 28} ${ex},${ey + 28} Q${ex - s * 26},${ey + 24} ${ex - s * 26},${ey - 4} Z`), ell(ex + s * 2, ey, 5, 6, '#fff'), L(`M${ex - 22},${ey + 40} Q${ex},${ey + 34} ${ex + 22},${ey + 40}`, 3, '#bfae84')); }
    o.push(P(`M${cx},${hy + 24} L${cx - 11},${hy + 10} Q${cx - 13},${hy - 2} ${cx - 3},${hy + 1} L${cx},${hy + 4} L${cx + 3},${hy + 1} Q${cx + 13},${hy - 2} ${cx + 11},${hy + 10} Z`));
    const A = [cx - 66, hy + 34], C = [cx, hy + 54], B = [cx + 66, hy + 34], A2 = [cx - 62, hy + 50], C2 = [cx, hy + 102], B2 = [cx + 62, hy + 50];
    o.push(P(`M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]} Q${cx + 64},${hy + 80} ${cx},${hy + 86} Q${cx - 64},${hy + 80} ${A[0]},${A[1]} Z`, '#fff', INK, 5));
    o.push(L(`M${cx - 62},${hy + 48} Q${cx},${hy + 74} ${cx + 62},${hy + 48}`, 3));
    for (let k = 1; k < 10; k++) { const t = k / 10, a = q(A, C, B, t), b = q([cx - 64, hy + 66], [cx, hy + 100], [cx + 64, hy + 66], t); o.push(L(`M${f1(a[0])},${f1(a[1] + 2)} L${f1(b[0])},${f1(b[1] - 4)}`, 2.6)); }
    o.push(L(`M${cx - 72},${hy + 26} q-8,12 -2,26 M${cx + 72},${hy + 26} q8,12 2,26`, 3.4));
    o.push(L(`M${cx + 24},${hy - 98} l-6,18 l12,8 l-10,18 l6,8`, 3.6), L(`M${cx - 70},${hy - 70} l12,10 l-4,12`, 3));
    o.push(...[-1, 1].map(s => L(`M${cx + s * 112},${hy - 50} q${s * 10},10 0,20 M${cx + s * 122},${hy - 20} q${s * 10},10 0,20 M${cx + s * 112},${hy + 10} q${s * 10},10 0,20`, 4)), T(cx + 96, hy - 110, 'clatter', 26, 14));
    return { skin: 'monster_bone', over: o, rot: -8 };
  },
  // 9 SWAMP DRIP: slime cap oozing over the head, dreamy half-lidded eyes, gloopy grin, bubbles
  swamp: (cx, hy) => {
    const S = '#8fc24a', o = [], cap = [];
    let d = ''; for (let k = 0; k <= 16; k++) { const a = Math.PI * (1.05 + k * .9 / 16); d += (k ? ' L' : 'M') + f1(cx + Math.cos(a) * 108) + ',' + f1(hy - 4 + Math.sin(a) * 106); }
    d += ` Q${cx + 92},${hy - 30} ${cx + 74},${hy - 50} Q${cx + 40},${hy - 68} ${cx + 10},${hy - 58} Q${cx - 30},${hy - 74} ${cx - 64},${hy - 52} Q${cx - 90},${hy - 34} ${cx - 104},${hy - 20} Z`;
    cap.push(d);
    for (const [x, y, len, w] of [[-84, -44, 70, 9], [-40, -64, 46, 8], [20, -60, 90, 10], [62, -54, 40, 7], [92, -30, 60, 8]]) cap.push(`M${cx + x - w},${hy + y - 8} L${cx + x - w},${hy + y + len} A${w},${w} 0 0,0 ${cx + x + w},${hy + y + len} L${cx + x + w},${hy + y - 8} Z`);
    o.push(merge(cap, S, 4.5), L(`M${cx - 70},${hy - 84} Q${cx - 30},${hy - 104} ${cx + 10},${hy - 102}`, 6, '#d8f0a0'), ...[[-84, 10], [20, 18], [92, 18]].map(([x, l]) => L(`M${cx + x - 3},${hy - 30 + l} l0,${l}`, 3, '#d8f0a0')));
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 2; o.push(ell(ex, ey, 19, 17, '#fff', INK, 4.5), ell(ex + 2, ey + 6, 8, 8, INK), P(`M${ex - 20},${ey + 2} A20,18 0 0,1 ${ex + 20},${ey + 2} Z`, '#6c7a42', INK, 4), brush(ex - 24, ey + 3, ex, ey + 6, ex + 24, ey + 3, 6, { tip: .4 })); }
    o.push(P(`M${cx - 46},${hy + 46} Q${cx},${hy + 66} ${cx + 48},${hy + 42} Q${cx + 36},${hy + 92} ${cx},${hy + 92} Q${cx - 36},${hy + 92} ${cx - 46},${hy + 46} Z`), ell(cx + 4, hy + 80, 18, 8, PINK));
    o.push(L(`M${cx - 14},${hy + 58} Q${cx - 10},${hy + 72} ${cx - 16},${hy + 86}`, 5, S), P(`M${cx + 40},${hy + 58} Q${cx + 50},${hy + 96} ${cx + 44},${hy + 116} A7,7 0 0,1 ${cx + 32},${hy + 114} Q${cx + 34},${hy + 84} ${cx + 36},${hy + 62} Z`, S, INK, 3));
    o.push(bubble(cx - 110, hy + 30, 13), bubble(cx - 128, hy - 4, 8), bubble(cx + 112, hy + 66, 11), bubble(cx + 128, hy + 36, 7), fly(cx + 106, hy - 110), T(cx - 104, hy + 98, 'blub', 26, -10));
    return { skin: 'monster_swamp', over: o, rot: 6, sy: .98 };
  },
  // 10 WEREWOLF SNARL: fur tufts burst out of the cheeks, wild jagged brows, muzzle, snout wrinkles, fangs
  werewolf: (cx, hy) => {
    const F = '#7a5a40';
    const under = [merge([-1, 1].map(s => `M${cx + s * 78},${hy - 40} L${cx + s * 130},${hy - 30} L${cx + s * 104},${hy - 8} L${cx + s * 142},${hy + 16} L${cx + s * 106},${hy + 30} L${cx + s * 132},${hy + 62} L${cx + s * 92},${hy + 62} L${cx + s * 100},${hy + 92} L${cx + s * 60},${hy + 70} Z`).concat([`M${cx - 60},${hy - 70} L${cx - 50},${hy - 128} L${cx - 22},${hy - 92} L${cx - 2},${hy - 138} L${cx + 20},${hy - 94} L${cx + 52},${hy - 124} L${cx + 60},${hy - 70} Z`]), F, 6)], o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 38, ey = hy - 26;
      o.push(P(`M${cx + s * 14},${ey + 2} Q${ex},${ey - 18} ${cx + s * 62},${ey - 10} Q${ex + s * 4},${ey + 14} ${cx + s * 14},${ey + 2} Z`, '#ffd23f', INK, 4.5), ell(ex, ey - 2, 5, 7, INK));
      o.push(P(`M${cx + s * 8},${ey - 12} L${cx + s * 30},${ey - 30} L${cx + s * 34},${ey - 44} L${cx + s * 46},${ey - 34} L${cx + s * 56},${ey - 52} L${cx + s * 62},${ey - 36} L${cx + s * 80},${ey - 46} L${cx + s * 72},${ey - 24} L${cx + s * 36},${ey - 18} Z`, INK, INK, 3)); }
    o.push(L(`M${cx - 12},${hy - 34} q12,-6 24,0 M${cx - 10},${hy - 22} q10,-5 20,0`, 3.4));
    o.push(ell(cx, hy + 40, 66, 48, '#f1e6d6', INK, 4.5));
    o.push(P(`M${cx - 52},${hy + 48} Q${cx - 26},${hy + 30} ${cx},${hy + 40} Q${cx + 26},${hy + 30} ${cx + 52},${hy + 48} Q${cx + 40},${hy + 82} ${cx},${hy + 84} Q${cx - 40},${hy + 82} ${cx - 52},${hy + 48} Z`), ell(cx, hy + 72, 18, 7, PINK));
    o.push(P(`M${cx - 40},${hy + 42} L${cx - 33},${hy + 72} L${cx - 26},${hy + 39} Z M${cx + 40},${hy + 42} L${cx + 33},${hy + 72} L${cx + 26},${hy + 39} Z`, '#fff', INK, 2.6), P(`M${cx - 20},${hy + 38} L${cx - 14},${hy + 50} L${cx - 8},${hy + 39} L${cx - 2},${hy + 50} L${cx + 4},${hy + 39} L${cx + 10},${hy + 50} L${cx + 16},${hy + 38} Z`, '#fff', INK, 2.2), P(`M${cx - 24},${hy + 82} L${cx - 18},${hy + 66} L${cx - 12},${hy + 83} Z M${cx + 24},${hy + 82} L${cx + 18},${hy + 66} L${cx + 12},${hy + 83} Z`, '#fff', INK, 2.2));
    o.push(P(`M${cx - 22},${hy + 4} Q${cx},${hy - 8} ${cx + 22},${hy + 4} Q${cx + 14},${hy + 26} ${cx},${hy + 28} Q${cx - 14},${hy + 26} ${cx - 22},${hy + 4} Z`), L(`M${cx - 10},${hy + 4} q6,-4 12,-3`, 3, '#fff'), L(`M${cx},${hy + 28} L${cx},${hy + 37}`, 3.4));
    o.push(drop(cx + 56, hy + 92, 7, '#d6f1ff'), T(cx + 4, hy - 150, 'GRRR', 28, 0, '#fff', 7));
    return { skin: 'monster_fur', under, over: o, sx: 1.02 };
  },
  // 11 DEMON SMIRK: red skin, little horns, glowing yellow eyes, one brow up, sly smirk with a fang, goatee
  demon: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) o.push(P(`M${cx + s * 34},${hy - 90} Q${cx + s * 50},${hy - 146} ${cx + s * 86},${hy - 158} Q${cx + s * 70},${hy - 128} ${cx + s * 74},${hy - 78} Z`, '#3a2230', INK, 5), L(`M${cx + s * 50},${hy - 112} q${s * 12},-20 ${s * 28},-30`, 3.4, '#7a5a6a'));
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 22;
      o.push(ell(ex, ey, 34, 22, '#ffe066', '', 0).replace('/>', ' opacity=".45"/>'), P(`M${ex - 22},${ey - 6 + s * 4} L${ex + 22},${ey - 6 - s * 4} Q${ex + 16},${ey + 14} ${ex},${ey + 14} Q${ex - 16},${ey + 14} ${ex - 22},${ey - 6 + s * 4} Z`, '#fff6a8', INK, 4.5), ell(ex + 4, ey + 4, 3, 7, INK)); }
    o.push(brow(cx - 62, hy - 52, cx - 40, hy - 54, cx - 12, hy - 44, 9), brow(cx + 14, hy - 56, cx + 40, hy - 92, cx + 66, hy - 66, 9));
    o.push(brush(cx - 34, hy + 40, cx + 8, hy + 56, cx + 54, hy + 26, 8, { bias: .6, tip: .35 }), L(`M${cx + 56},${hy + 22} q6,6 2,14`, 3.4), P(`M${cx + 24},${hy + 46} L${cx + 30},${hy + 64} L${cx + 37},${hy + 43} Z`, '#fff', INK, 2.6));
    o.push(P(`M${cx - 16},${hy + 76} Q${cx},${hy + 82} ${cx + 16},${hy + 76} L${cx + 2},${hy + 116} Z`, '#3a2230', INK, 3.4));
    o.push(star4(cx + 34, hy + 72, 8, '#fff'), T(cx - 112, hy - 66, 'heh', 30, -12), P(`M${cx + 116},${hy - 20} Q${cx + 104},${hy - 44} ${cx + 118},${hy - 64} Q${cx + 120},${hy - 46} ${cx + 132},${hy - 40} Q${cx + 136},${hy - 20} ${cx + 116},${hy - 20} Z`, '#ff9a3c', INK, 3), P(`M${cx - 120},${hy + 30} Q${cx - 130},${hy + 10} ${cx - 118},${hy - 6} Q${cx - 116},${hy + 8} ${cx - 106},${hy + 12} Q${cx - 104},${hy + 30} ${cx - 120},${hy + 30} Z`, '#ff9a3c', INK, 3));
    return { skin: 'monster_red', over: o, rot: 8 };
  },
  // 12 SHY LITTLE MONSTER: huge glossy violet eyes looking away, worried brows, tiny smile with one fang, big blush, horn nubs
  shy: (cx, hy) => {
    const o = [];
    for (const s of [-1, 1]) o.push(P(`M${cx + s * 30},${hy - 92} Q${cx + s * 40},${hy - 124} ${cx + s * 56},${hy - 122} Q${cx + s * 58},${hy - 104} ${cx + s * 52},${hy - 86} Z`, '#f3e6c4', INK, 4.5));
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy - 14; o.push(...glossy(ex + 4, ey + 4, 29, 35, '#8a62d8'), brow(ex - s * 20, ey - 50 + 0, ex, ey - 56 + s * 4, ex + s * 22, ey - 50 + 10, 6)); }
    o.push(L(`M${cx - 14},${hy + 50} q14,10 28,0`, 4.5), P(`M${cx + 3},${hy + 54} L${cx + 8},${hy + 66} L${cx + 13},${hy + 53} Z`, '#fff', INK, 2.4));
    o.push(...blush(cx, hy + 6, 1.25), drop(cx + 88, hy - 64, 12), L(`M${cx - 110},${hy - 20} q-8,10 0,20 M${cx - 122},${hy - 6} q-8,10 0,20`, 3.4), T(cx + 104, hy - 96, '...', 34, 0));
    return { skin: 'monster_lilac', over: o, rot: -10, sx: .97, sy: 1.02 };
  },
};
