// SHEET 06 — JOBS I (doctor, nurse, chef, firefighter, police, construction, scientist, teacher, mail carrier, farmer)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, drop, heart, GOLD, GOLDL, SILVER, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 06: Jobs I';

// ---- local helpers (sheet-only) ----
const rot = (a, x, y, inner) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${[].concat(inner).join('')}</g>`;
const txt = (x, y, s, size, col = INK, { a = 0, anchor = 'middle', w = 900, stroke = '' } = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="${w}" font-size="${size}" text-anchor="${anchor}" fill="${col}"${stroke ? ` stroke="${stroke}" stroke-width="3" paint-order="stroke"` : ''}${a ? ` transform="rotate(${a} ${f1(x)} ${f1(y)})"` : ''}>${s}</text>`;
// ribbon along a path: ink edge + fill (paper strips, hoses, straps)
const ribbon = (d, w, col, sw = 5, cap = 'round') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + sw * 2}" stroke-linecap="${cap}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
const bez = ([x0, y0], [x1, y1], [x2, y2], [x3, y3], t) => { const u = 1 - t; return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]; };
const envelope = (x, y, a, s = 1) => rot(a, x, y, [rect(x - 34 * s, y - 22 * s, 68 * s, 44 * s, '#fbf8f0', 4, 3), L(`M${x - 34 * s},${y - 22 * s} L${x},${y + 4 * s} L${x + 34 * s},${y - 22 * s}`, 3.4), rect(x + 16 * s, y - 16 * s, 12 * s, 12 * s, RED, 2.4, 1)]);
const ibrush = (x0, y0, qx, qy, x1, y1, w, col, o = {}) => brush(x0, y0, qx, qy, x1, y1, w, { col, ...o }).replace(`stroke="${col}" stroke-width="1.2"`, `stroke="${INK}" stroke-width="9" paint-order="stroke"`);
const shake = (x, y, s = 1) => L(`M${x},${y} l${8 * s},-10 M${x + 2 * s},${y + 16} l${10 * s},-8`, 4);

const WHITE = '#f6f7f9', DENIM = '#4a74a8', STRAW = '#e8c25a', STRAWD = '#b8922e', HIVIS = '#c6ff3a';

export const CAST = [
  // 1 DOCTOR — head mirror disc + endless medical bill (money eyes)
  { name: 'doctor', label: 'Doctor', form: 'standard', coat: WHITE, face: 'money',
    hat: ({ cx, hy }) => [L(`M${cx - 104},${hy - 40} Q${cx},${hy - 84} ${cx + 104},${hy - 40}`, 16), L(`M${cx - 104},${hy - 40} Q${cx},${hy - 84} ${cx + 104},${hy - 40}`, 8, '#3a3a46'),
      circ(cx + 6, hy - 116, 56, SILVER, 7), circ(cx + 6, hy - 116, 42, '#eef3fb', 4), circ(cx + 6, hy - 116, 9, '#3a3a46', 3), hl(`M${cx - 26},${hy - 136} Q${cx - 14},${hy - 150} ${cx + 4},${hy - 152}`, 7, .9), star4(cx + 70, hy - 166, 14), star4(cx - 58, hy - 150, 9)],
    details: ({ cx, top, bot }) => [P(`M${cx - 44},${top - 10} L${cx},${top + 74} L${cx + 44},${top - 10} Z`, '#6fb0d0', INK, 4),
      ...[-1, 1].map(s => P(`M${cx + s * 48},${top - 10} L${cx + s * 6},${top + 116} L${cx + s * 34},${top + 150} L${cx + s * 96},${top + 40} Z`, '#e3e7ee', INK, 4)),
      L(`M${cx + 6},${top + 116} L${cx + 6},${bot}`, 4), circ(cx - 8, top + 190, 6, '#e3e7ee', 3), circ(cx - 8, top + 245, 6, '#e3e7ee', 3),
      rect(cx + 26, top + 150, 44, 46, '#e3e7ee', 4, 3), L(`M${cx + 36},${top + 152} l0,-26 M${cx + 50},${top + 152} l0,-20`, 6, '#2f5fae'), L(`M${cx + 60},${top + 152} l0,-24`, 6, RED)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 160, B.top + 130, 30)] }),
    props: ({ cx, top }) => { const p0 = [cx + 168, top + 140], p1 = [cx + 230, top + 300], p2 = [cx + 110, top + 460], p3 = [cx + 176, top + 650]; const o = [];
      o.push(L(`M${cx - 40},${top + 2} Q${cx - 52},${top + 100} ${cx - 14},${top + 140} M${cx + 40},${top + 2} Q${cx + 52},${top + 100} ${cx + 14},${top + 140}`, 7), L(`M${cx},${top + 142} Q${cx - 40},${top + 200} ${cx - 10},${top + 238}`, 8), circ(cx - 6, top + 250, 17, SILVER, 4), circ(cx - 6, top + 250, 7, '#eef3fb', 2.5));
      o.push(ribbon(`M${p0} C${p1} ${p2} ${p3} L${cx + 238},${top + 664}`, 84, '#fbf8f0', 4.5, 'butt'));
      for (let k = 1; k < 12; k++) { const [x, y] = bez(p0, p1, p2, p3, .1 + k * .07); o.push(L(`M${x - 26},${y} l${k % 3 ? 40 : 28},0`, 3.4, '#9a92a2')); }
      o.push(txt(cx + 168, top + 196, 'BILL', 30, INK), txt(cx + 196, top + 676, '$999,999', 22, RED, { a: 0 }), fist(cx + 160, top + 130));
      return o; } },

  // 2 NURSE — winged nurse cap + giant green syringe (tee-hee)
  { name: 'nurse', label: 'Nurse', form: 'lady', coat: '#f4a9bd', face: ['female', 'giggle'], hair: 'bob',
    hat: ({ cx, hy }) => [P(`M${cx - 92},${hy - 98} L${cx - 70},${hy - 168} Q${cx},${hy - 184} ${cx + 70},${hy - 168} L${cx + 92},${hy - 98} Q${cx},${hy - 120} ${cx - 92},${hy - 98} Z`, '#fff', INK, 6),
      L(`M${cx - 76},${hy - 132} Q${cx},${hy - 146} ${cx + 76},${hy - 132}`, 3.4, '#c9c3d4'), heart(cx, hy - 140, 22, '#e8476e'),
      hl(`M${cx - 60},${hy - 160} Q${cx - 30},${hy - 170} ${cx - 16},${hy - 170}`, 6, .7)],
    details: ({ cx, top, bot }) => [P(`M${cx - 44},${top - 6} Q${cx},${top + 50} ${cx + 44},${top - 6} L${cx + 70},${top + 30} Q${cx},${top + 90} ${cx - 70},${top + 30} Z`, '#fff', INK, 4),
      poly([[cx - 90, top + 170], [cx + 90, top + 170], [cx + 130, bot], [cx - 130, bot]], '#fff', 4), rect(cx - 160, top + 150, 320, 22, '#d8476a', 4, 2),
      circ(cx - 34, top + 100, 22, '#fff', 4), heart(cx - 34, top + 100, 11, '#e8476e'),
      rect(cx - 44, top + 240, 50, 46, '#fbe3ea', 4, 4)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 170, B.top + 60, 26)] }),
    over: ({ cx, top }) => { const x = cx + 170, y = top + 60, G = '#7ddc5a';
      return [rot(16, x, y, [rect(x - 8, y + 8, 16, 66, SILVER, 4, 3), rect(x - 30, y + 70, 60, 14, SILVER, 4, 5),
        rect(x - 30, y - 260, 60, 262, '#eaf6fb', 6, 10), rect(x - 23, y - 200, 46, 186, G, 0, 6), L(`M${x - 23},${y - 200} L${x + 23},${y - 200}`, 3, '#4fa636'),
        ...[0, 1, 2].map(k => circ(x - 6 + k * 8, y - 160 + k * 40, 5 + k, tint(G, .5), 2)), rect(x - 24, y - 20, 48, 16, INK, 0, 3),
        ...[0, 1, 2, 3, 4, 5].map(k => L(`M${x + 30},${y - 230 + k * 36} l-14,0`, 3.4)), hl(`M${x - 18},${y - 246} L${x - 18},${y - 30}`, 8, .7),
        rect(x - 46, y - 4, 92, 16, '#dfe6ee', 4, 6), poly([[x - 18, y - 258], [x + 18, y - 258], [x + 6, y - 286], [x - 6, y - 286]], SILVER, 4),
        L(`M${x},${y - 286} L${x},${y - 370}`, 9), L(`M${x},${y - 286} L${x},${y - 370}`, 3.6, '#eef3fb'), drop(x + 2, y - 384, 8, G), star4(x + 34, y - 380, 16)]), fist(x, y, 14)]; } },

  // 3 CHEF — towering toque + handlebar moustache + ladle
  { name: 'chef', label: 'Chef', form: 'bigboi', coat: '#f7f5ef', face: 'proud',
    hat: ({ cx, hy }) => { const W2 = '#ffffff', o = [];
      o.push(P(`M${cx - 92},${hy - 110} L${cx - 116},${hy - 214} L${cx + 116},${hy - 214} L${cx + 92},${hy - 110} Z`, W2, INK, 6));
      o.push(cloud([[cx - 104, hy - 226, 44], [cx - 52, hy - 254, 52], [cx + 6, hy - 262, 54], [cx + 62, hy - 250, 50], [cx + 108, hy - 224, 42], [cx, hy - 214, 50]], W2, 6));
      for (const t of [-56, -18, 20, 58]) o.push(L(`M${cx + t},${hy - 116} L${cx + t * 1.25},${hy - 206}`, 3.4, '#cfcad6'));
      o.push(rect(cx - 98, hy - 126, 196, 46, W2, 6, 10), hl(`M${cx - 120},${hy - 236} Q${cx - 96},${hy - 270} ${cx - 56},${hy - 284}`, 8, .9), L(`M${cx + 80},${hy - 116} l0,26`, 3, '#cfcad6'));
      return o; },
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx},${hy + 18} Q${cx + s * 32},${hy + 0} ${cx + s * 66},${hy + 16} Q${cx + s * 92},${hy + 26} ${cx + s * 102},${hy - 2} Q${cx + s * 116},${hy + 44} ${cx + s * 66},${hy + 44} Q${cx + s * 28},${hy + 44} ${cx},${hy + 32} Z`, '#3a2622', INK, 4.5)),
      hl(`M${cx - 70},${hy + 24} Q${cx - 40},${hy + 14} ${cx - 16},${hy + 22}`, 4, .35)],
    details: ({ cx, top, bot }) => [P(`M${cx - 70},${top - 8} L${cx + 70},${top - 8} L${cx},${top + 80} Z`, RED, INK, 4.5), L(`M${cx - 30},${top + 10} L${cx},${top + 50}`, 3, '#9e2a22'),
      L(`M${cx - 20},${top + 50} Q${cx + 40},${top + 200} ${cx + 30},${bot}`, 4.5), ...[0, 1, 2, 3].flatMap(k => [circ(cx - 70, top + 110 + k * 70, 10, '#e9e4da', 4), circ(cx + 110, top + 110 + k * 70, 10, '#e9e4da', 4)]),
      P(`M${cx - 200},${top + 300} L${cx + 200},${top + 300} L${cx + 240},${bot + 10} L${cx - 240},${bot + 10} Z`, '#3b4d78', INK, 4.5), ...[-150, -75, 0, 75, 150].map(t => L(`M${cx + t},${top + 300} L${cx + t * 1.2},${bot}`, 3, '#5d72a3')), rect(cx - 210, top + 290, 420, 20, '#3b4d78', 4.5, 4)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 210, B.top + 40, 40)] }),
    over: ({ cx, top }) => { const x = cx + 210, y = top + 40, bx = cx + 200; return [pole(x - 4, y + 70, bx, y - 190, STEEL, 12),
      P(`M${bx - 50},${y - 222} Q${bx},${y - 208} ${bx + 46},${y - 222} Q${bx + 46},${y - 160} ${bx - 2},${y - 156} Q${bx - 50},${y - 160} ${bx - 50},${y - 222} Z`, STEEL, INK, 6),
      ell(bx - 2, y - 220, 48, 11, '#e07a2e', INK, 4), hl(`M${bx - 38},${y - 202} Q${bx - 32},${y - 176} ${bx - 14},${y - 168}`, 6, .6), drop(bx + 40, y - 262, 10, '#e07a2e'), drop(bx - 34, y - 290, 8, '#e07a2e'),
      ...[-24, 0, 24].map(t => L(`M${bx + t},${y - 244} q-12,-18 0,-36 q12,-18 0,-36`, 4.5, '#b9b2c2')), fist(x, y, 17)]; } },

  // 4 FIREFIGHTER — red helmet with tall front shield + hose blasting a water arc
  { name: 'firefighter', label: 'Firefighter', form: 'chad', coat: '#e2a62b', face: 'cool',
    hat: ({ cx, hy }) => { const R2 = '#d23b2f', o = [];
      o.push(P(`M${cx - 170},${hy - 34} Q${cx},${hy - 84} ${cx + 170},${hy - 34} Q${cx + 186},${hy - 8} ${cx + 140},${hy - 14} Q${cx},${hy - 48} ${cx - 140},${hy - 14} Q${cx - 186},${hy - 8} ${cx - 170},${hy - 34} Z`, R2, INK, 6));
      o.push(fillPts([[cx - 108, hy - 44], [cx - 100, hy - 104], [cx - 50, hy - 140], [cx, hy - 148], [cx + 50, hy - 140], [cx + 100, hy - 104], [cx + 108, hy - 44], [cx, hy - 60]], R2, 7));
      o.push(L(`M${cx - 76},${hy - 120} Q${cx},${hy - 168} ${cx + 76},${hy - 120}`, 10), L(`M${cx - 76},${hy - 120} Q${cx},${hy - 168} ${cx + 76},${hy - 120}`, 4, '#f05a4a'));
      o.push(P(`M${cx - 50},${hy - 176} Q${cx},${hy - 196} ${cx + 50},${hy - 176} L${cx + 44},${hy - 100} Q${cx},${hy - 64} ${cx - 44},${hy - 100} Z`, CREAM, INK, 6), P(`M${cx - 36},${hy - 166} Q${cx},${hy - 180} ${cx + 36},${hy - 166} L${cx + 32},${hy - 106} Q${cx},${hy - 80} ${cx - 32},${hy - 106} Z`, 'none', GOLD, 4),
        txt(cx, hy - 104, '7', 54, INK), ell(cx, hy - 196, 16, 12, GOLD, INK, 4), hl(`M${cx - 86},${hy - 92} Q${cx - 70},${hy - 126} ${cx - 50},${hy - 132}`, 8, .5));
      return o; },
    details: ({ cx, top }) => [rect(cx - 30, top - 10, 60, 50, '#c48d1e', 4, 4), L(`M${cx},${top + 40} L${cx},${top + 360}`, 5), ...[0, 1, 2, 3].map(k => rect(cx - 12, top + 70 + k * 64, 24, 12, BLACK, 3, 3)),
      ...[top + 160, top + 260].flatMap(y => [rect(cx - 220, y, 440, 46, HIVIS, 4, 0), rect(cx - 220, y + 12, 440, 22, '#d6dbe3', 3, 0)])],
    arms: B => ({ front: [B.arm(-1, B.cx + 30, B.top + 200, -40), B.arm(1, B.cx + 150, B.top + 150, 30)] }),
    props: ({ cx, top }) => [ribbon(`M${cx - 230},${1000} Q${cx - 200},${top + 300} ${cx - 60},${top + 250} Q${cx + 40},${top + 210} ${cx + 150},${top + 150}`, 26, '#b8322a', 5),
      rot(-40, cx + 150, top + 150, [poly([[cx + 140, top + 136], [cx + 230, top + 140], [cx + 230, top + 160], [cx + 140, top + 166]], BRONZE, 5), rect(cx + 150, top + 132, 22, 38, '#2a2a36', 4, 4), hl(`M${cx + 180},${top + 142} L${cx + 224},${top + 144}`, 4, .6)]),
      fist(cx + 30, top + 200, 20), fist(cx + 150, top + 150, 20)],
    over: ({ cx, top }) => { const x0 = cx + 214, y0 = top + 80, WA = '#6ec6f0';
      return [ibrush(x0, y0, cx + 250, top - 90, cx + 180, top - 250, 120, WA, { bias: 1, tip: .25 }), L(`M${x0 - 2},${y0 - 20} Q${cx + 236},${top - 90} ${cx + 176},${top - 230}`, 7, '#e4f6ff'), L(`M${cx + 236},${top - 30} Q${cx + 232},${top - 120} ${cx + 206},${top - 190}`, 4, '#e4f6ff'),
        cloud([[cx + 130, top - 270, 30], [cx + 176, top - 296, 40], [cx + 222, top - 266, 26], [cx + 150, top - 236, 26], [cx + 206, top - 232, 24]], '#9ad8f5', 6), L(`M${cx + 150},${top - 300} q20,-16 40,-10`, 5, '#e4f6ff'),
        ...[[cx + 100, top - 330, 12], [cx + 236, top - 330, 11], [cx + 120, top - 200, 9], [cx + 244, top - 200, 9], [cx + 176, top - 360, 10]].map(([x, y, s]) => drop(x, y, s, WA))]; } },

  // 5 POLICE — peaked cap, whistle, donut, dad belly
  { name: 'police', label: 'Police Officer', form: 'dad', coat: '#2c3f72', face: 'sus',
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 74} Q${cx - 112},${hy - 112} ${cx - 132},${hy - 142} Q${cx},${hy - 206} ${cx + 132},${hy - 142} Q${cx + 112},${hy - 112} ${cx + 104},${hy - 74} Z`, '#2c3f72', INK, 6), hl(`M${cx - 106},${hy - 148} Q${cx - 60},${hy - 176} ${cx - 10},${hy - 178}`, 7, .3), L(`M${cx - 108},${hy - 128} Q${cx},${hy - 150} ${cx + 108},${hy - 128}`, 3.4, '#1c2a52'),
      rect(cx - 104, hy - 94, 208, 30, '#161a28', 5, 4), ...[0, 1, 2, 3, 4, 5, 6].map(k => rect(cx - 98 + k * 28, hy - 90 + (k % 2) * 11, 14, 11, '#f3efe6', 0, 0)),
      P(`M${cx - 100},${hy - 64} Q${cx},${hy - 86} ${cx + 100},${hy - 64} Q${cx + 78},${hy - 36} ${cx},${hy - 40} Q${cx - 78},${hy - 36} ${cx - 100},${hy - 64} Z`, '#161a28', INK, 5), hl(`M${cx - 70},${hy - 62} Q${cx - 30},${hy - 72} ${cx + 10},${hy - 72}`, 5, .5),
      P(`M${cx},${hy - 176} l26,14 l-4,34 l-22,14 l-22,-14 l-4,-34 Z`, GOLD, INK, 4.5), circ(cx, hy - 146, 9, GOLDL, 2.4)],
    faceTop: ({ cx, hy }) => [L(`M${cx + 66},${hy + 50} Q${cx + 90},${hy + 110} ${cx + 30},${hy + 150}`, 4, '#c9ccd6'), P(`M${cx + 18},${hy + 38} L${cx + 70},${hy + 34} Q${cx + 92},${hy + 34} ${cx + 92},${hy + 52} Q${cx + 92},${hy + 72} ${cx + 70},${hy + 70} Q${cx + 56},${hy + 60} ${cx + 18},${hy + 50} Z`, SILVER, INK, 4.5),
      hl(`M${cx + 30},${hy + 40} L${cx + 64},${hy + 38}`, 3.4, .9), ...[0, 1, 2].map(k => L(`M${cx + 104},${hy + 18 + k * 26} l${24 - Math.abs(k - 1) * 6},${(k - 1) * 12}`, 5))],
    details: ({ cx, top, bot }) => [P(`M${cx - 20},${top + 6} L${cx - 50},${top + 34} L${cx - 6},${top + 44} Z M${cx + 20},${top + 6} L${cx + 50},${top + 34} L${cx + 6},${top + 44} Z`, '#3d5594', INK, 3.5),
      P(`M${cx - 10},${top + 40} L${cx + 10},${top + 40} L${cx + 14},${top + 200} L${cx},${top + 222} L${cx - 14},${top + 200} Z`, '#161a28', INK, 3.4),
      rect(cx + 40, top + 90, 64, 18, '#3d5594', 3.4, 2), P(`M${cx - 74},${top + 72} l9,19 21,3 -15,15 4,21 -19,-10 -19,10 4,-21 -15,-15 21,-3 Z`, GOLD, INK, 3.5),
      rect(cx - 220, bot - 70, 440, 34, '#161a28', 4.5, 3), rect(cx - 22, bot - 76, 44, 46, GOLD, 4, 6), rect(cx + 70, bot - 86, 46, 52, '#161a28', 4, 6), ...[[cx - 120, bot - 26], [cx - 84, bot - 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${INK}" stroke-width="12"/><circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${SILVER}" stroke-width="5"/>`)],
    props: ({ hdL, hdR }) => { const [x, y] = hdL, [u, v] = hdR; return [circ(x - 6, y - 4, 38, '#d9a25a', 5), P(`M${x - 40},${y - 10} Q${x - 30},${y - 46} ${x},${y - 42} Q${x + 30},${y - 40} ${x + 30},${y - 4} Q${x + 10},${y + 4} ${x - 8},${y - 6} Q${x - 26},${y + 6} ${x - 40},${y - 10} Z`, '#f080a8', INK, 3.5), circ(x - 6, y - 8, 11, '#e9e4da', 4),
      ...[[-26, -24, 0], [12, -30, 1], [-10, -36, 2], [20, -16, 0]].map(([dx, dy, c]) => L(`M${x + dx},${y + dy} l7,-3`, 4, ['#2f8fd0', '#f5c518', '#3fae5a'][c])), fist(x, y + 18, 15),
      rect(u - 14, v - 60, 28, 50, '#161a28', 4, 5), L(`M${u - 6},${v - 60} l0,-26`, 5), fist(u, v)]; } },

  // 6 CONSTRUCTION — hard hat, hi-vis vest, jackhammer + dust
  { name: 'construction', label: 'Construction Worker', form: 'standard', coat: '#f3812a', face: 'strain',
    hat: ({ cx, hy }) => { const Y = '#f5c518'; return [P(`M${cx - 128},${hy - 46} Q${cx},${hy - 76} ${cx + 128},${hy - 46} Q${cx + 132},${hy - 26} ${cx + 110},${hy - 28} Q${cx},${hy - 48} ${cx - 110},${hy - 28} Q${cx - 132},${hy - 26} ${cx - 128},${hy - 46} Z`, Y, INK, 6),
      fillPts([[cx - 104, hy - 50], [cx - 98, hy - 104], [cx - 50, hy - 140], [cx, hy - 148], [cx + 50, hy - 140], [cx + 98, hy - 104], [cx + 104, hy - 50], [cx, hy - 64]], Y, 7),
      P(`M${cx - 20},${hy - 146} Q${cx},${hy - 154} ${cx + 20},${hy - 146} L${cx + 16},${hy - 62} L${cx - 16},${hy - 62} Z`, '#f8d84a', INK, 4.5), hl(`M${cx - 80},${hy - 100} Q${cx - 60},${hy - 130} ${cx - 34},${hy - 136}`, 9, .6),
      shake(cx - 150, hy - 40), shake(cx + 140, hy - 30, -1), shake(cx - 160, hy + 40), shake(cx + 150, hy + 50, -1)]; },
    details: ({ cx, top, bot }) => [P(`M${cx - 40},${top - 10} L${cx},${top + 60} L${cx + 40},${top - 10} Z`, '#3f6fb0', INK, 4), L(`M${cx - 30},${top} L${cx - 12},${top + 26} M${cx + 30},${top} L${cx + 12},${top + 26}`, 3, '#2a4f86'),
      ...[-1, 1].map(s => rect(cx + s * 42 - 13, top - 10, 26, 330, '#d6dbe3', 4, 0)), ...[top + 150, top + 220].flatMap(y => [rect(cx - 130, y, 260, 36, HIVIS, 4, 0), rect(cx - 130, y + 10, 260, 16, '#d6dbe3', 3, 0)])],
    arms: B => ({ front: [B.arm(-1, B.cx - 86, B.top + 196, 26), B.arm(1, B.cx + 86, B.top + 196, -26)] }),
    over: ({ cx, top }) => { const y0 = top + 196; return [
      cloud([[cx - 110, 980, 30], [cx - 60, 960, 40], [cx, 950, 46], [cx + 64, 962, 40], [cx + 116, 982, 28]], '#d9d2c6', 5),
      rect(cx - 10, top + 450, 20, 200, STEEL, 5, 3), rect(cx - 36, top + 330, 72, 140, '#3b3f4c', 6, 10), rect(cx - 30, top + 470, 60, 18, '#2a2a36', 4, 3),
      rect(cx - 42, y0 + 20, 84, 130, '#f5c518', 6, 14), ...[0, 1, 2].map(k => L(`M${cx - 26},${y0 + 52 + k * 30} L${cx + 26},${y0 + 52 + k * 30}`, 4, '#b8922e')), hl(`M${cx - 28},${y0 + 36} L${cx - 28},${y0 + 130}`, 7, .6),
      ribbon(`M${cx - 92},${y0} L${cx + 92},${y0}`, 16, '#2a2a36', 4), L(`M${cx},${y0} L${cx},${y0 + 22}`, 14), fist(cx - 86, y0, 17), fist(cx + 86, y0, 17),
      ...[-1, 1].flatMap(s => [L(`M${cx + s * 54},${top + 360} l${s * 12},6 M${cx + s * 54},${top + 400} l${s * 14},-2 M${cx + s * 50},${top + 440} l${s * 12},8`, 4)]),
      ...[[-150, 900, 14, 20], [140, 890, 12, -30], [-90, 860, 9, 50], [110, 850, 10, 10]].map(([dx, y, r, a]) => rot(a, cx + dx, y, poly([[cx + dx - r, y], [cx + dx, y - r], [cx + dx + r, y - 2], [cx + dx + 2, y + r]], '#9a8f84', 4)))]; } },

  // 7 SCIENTIST — exploding white hair, brass goggles, bubbling flask (noodle)
  { name: 'scientist', label: 'Scientist', form: 'noodle', coat: WHITE, face: 'hysterical',
    headBack: ({ cx, hy }) => { const pts = [], N = 15; for (let k = 0; k <= N; k++) { const a = Math.PI * (.82 + k / N * 1.36), r = k % 2 ? 128 : 178 - Math.abs(k - N / 2) * 2; pts.push([cx + Math.cos(a) * r, hy - 10 + Math.sin(a) * r]); } pts.push([cx, hy + 40]);
      return [poly(pts, '#ecebf2', 6), ...[.95, 1.25, 1.55, 1.85, 2.1].map(t => L(`M${f1(cx + Math.cos(Math.PI * t) * 100)},${f1(hy - 10 + Math.sin(Math.PI * t) * 100)} L${f1(cx + Math.cos(Math.PI * t) * 140)},${f1(hy - 10 + Math.sin(Math.PI * t) * 140)}`, 3.4, '#b9b5c8'))]; },
    hat: ({ cx, hy }) => [L(`M${cx - 106},${hy - 52} Q${cx},${hy - 98} ${cx + 106},${hy - 52}`, 16), L(`M${cx - 106},${hy - 52} Q${cx},${hy - 98} ${cx + 106},${hy - 52}`, 8, '#5a4a3a'),
      ...[-1, 1].flatMap(s => [circ(cx + s * 38, hy - 80, 32, BRONZE, 6), circ(cx + s * 38, hy - 80, 21, '#8fe0c0', 4), hl(`M${cx + s * 38 - 12},${hy - 88} q4,-8 12,-10`, 5, .9)]), rect(cx - 10, hy - 88, 20, 14, BRONZE, 4, 3)],
    details: ({ cx, top, bot }) => [P(`M${cx - 30},${top - 6} L${cx},${top + 60} L${cx + 30},${top - 6} Z`, '#7a4fb0', INK, 4), P(`M${cx - 14},${top + 8} L${cx + 14},${top + 22} L${cx + 14},${top + 6} L${cx - 14},${top + 22} Z`, RED, INK, 3),
      ...[-1, 1].map(s => P(`M${cx + s * 34},${top - 6} L${cx + s * 4},${top + 90} L${cx + s * 22},${top + 120} L${cx + s * 70},${top + 30} Z`, '#e3e7ee', INK, 3.5)), L(`M${cx + 4},${top + 90} L${cx + 4},${bot}`, 3.6),
      rect(cx + 16, top + 150, 32, 34, '#e3e7ee', 3.4, 3), L(`M${cx + 24},${top + 152} l0,-18 M${cx + 36},${top + 152} l0,-14`, 5, '#2f8fd0'), P(`M${cx - 40},${top + 240} q10,10 20,0 q10,-10 18,4`, 'none', '#7ddc5a', 5)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 180, -20), B.arm(1, B.cx + 156, B.top + 160, 20)] }),
    over: ({ cx, top }) => { const x = cx + 162, y = top + 156, G = '#7ddc5a', o = [];
      o.push(P(`M${x - 14},${y - 10} L${x - 14},${y + 30} L${x - 66},${y + 132} Q${x - 70},${y + 148} ${x - 52},${y + 150} L${x + 52},${y + 150} Q${x + 70},${y + 148} ${x + 66},${y + 132} L${x + 14},${y + 30} L${x + 14},${y - 10} Z`, '#eaf6fb', INK, 6));
      o.push(P(`M${x - 44},${y + 88} Q${x},${y + 76} ${x + 44},${y + 88} L${x + 62},${y + 132} Q${x + 64},${y + 142} ${x + 50},${y + 143} L${x - 50},${y + 143} Q${x - 64},${y + 142} ${x - 62},${y + 132} Z`, G, 'none', 0), ...[[-20, 112, 7], [12, 122, 9], [30, 104, 5]].map(([dx, dy, r]) => circ(x + dx, y + dy, r, tint(G, .5), 2.4)));
      o.push(hl(`M${x - 4},${y + 40} L${x - 40},${y + 120}`, 6, .8), rect(x - 20, y - 18, 40, 14, '#eaf6fb', 5, 4));
      o.push(cloud([[x - 20, y - 50, 22], [x + 10, y - 70, 26], [x - 10, y - 100, 20], [x + 22, y - 116, 16]], '#b6f09a', 4.5));
      o.push(...[[x - 40, y - 140, 10], [x + 30, y - 160, 8], [x - 6, y - 180, 6]].map(([u, v, r]) => circ(u, v, r, '#d8f7c8', 3.4)), fist(x, y, 13));
      const t = cx - 150, v = top + 180; o.push(rot(-20, t, v, [P(`M${t - 13},${v - 70} L${t - 13},${v + 50} Q${t},${v + 66} ${t + 13},${v + 50} L${t + 13},${v - 70} Z`, '#eaf6fb', INK, 5), P(`M${t - 9},${v - 6} L${t - 9},${v + 48} Q${t},${v + 58} ${t + 9},${v + 48} L${t + 9},${v - 6} Z`, '#f080a8', 'none', 0), rect(t - 17, v - 78, 34, 10, '#eaf6fb', 4, 3)]), fist(t, v, 13));
      return o; } },

  // 8 TEACHER — glasses low on the nose, chalkboard easel, long pointer
  { name: 'teacher', label: 'Teacher', form: 'lady', coat: '#8a3f5a', face: ['female', 'judging'], hair: 'bob',
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => `<circle cx="${cx + s * 36}" cy="${hy + 14}" r="25" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="6"/>`), L(`M${cx - 11},${hy + 12} Q${cx},${hy + 4} ${cx + 11},${hy + 12}`, 5),
      L(`M${cx - 61},${hy + 14} Q${cx - 80},${hy + 80} ${cx - 64},${hy + 130} M${cx + 61},${hy + 14} Q${cx + 80},${hy + 80} ${cx + 64},${hy + 130}`, 2.6, GOLD)],
    behind: ({ cx }) => { const x0 = cx - 250, x1 = cx - 50, y0 = 400, y1 = 590; return [
      L(`M${x0 + 30},${y0 - 30} L${x0 + 10},1004 M${x1 - 30},${y0 - 30} L${x1 - 6},1004 M${(x0 + x1) / 2},${y1} L${(x0 + x1) / 2 + 10},960`, 14, INK), L(`M${x0 + 30},${y0 - 30} L${x0 + 10},1004 M${x1 - 30},${y0 - 30} L${x1 - 6},1004`, 6, WOOD),
      rect(x0, y0, x1 - x0, y1 - y0, WOOD, 6, 6), rect(x0 + 14, y0 + 14, x1 - x0 - 28, y1 - y0 - 28, '#2f5a46', 4, 3),
      txt(x0 + 64, y0 + 82, '2+2=', 40, '#f4f2ea', { a: -4 }), txt(x1 - 50, y0 + 84, '?', 48, '#ffd2d2', { a: 8 }), L(`M${x0 + 34},${y0 + 120} q40,-10 80,0 q30,6 50,-4`, 4, '#f4f2ea'), L(`M${x0 + 40},${y0 + 146} q30,-6 60,0`, 4, '#f4f2ea'),
      rect(x0 + 6, y1 - 4, x1 - x0 - 12, 14, WOODD, 4, 2), rect(x0 + 40, y1 - 14, 26, 10, '#fff', 3, 2), circ(x1 - 40, y1 - 26, 18, '#d8473c', 4), L(`M${x1 - 40},${y1 - 42} q2,-10 10,-12`, 4), P(`M${x1 - 38},${y1 - 46} q10,-12 20,-4 q-10,8 -20,4 Z`, '#3fae5a', INK, 2.6)]; },
    details: ({ cx, top, bot }) => [P(`M${cx - 40},${top - 6} L${cx},${top + 54} L${cx + 40},${top - 6} Z`, '#f3efe6', INK, 4), L(`M${cx},${top + 54} L${cx},${top + 220}`, 4), ...[0, 1, 2].map(k => circ(cx, top + 90 + k * 50, 7, GOLD, 3)),
      rect(cx - 170, top + 220, 340, 20, '#5a2338', 4, 2), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${cx - 125 + k * 50},${top + 250} L${cx - 150 + k * 60},${bot}`, 3, '#6e2f48'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 96, B.top + 120, -20), B.arm(1, B.cx + 120, B.top + 170, 30)] }),
    props: ({ cx, top }) => [rot(-30, cx - 96, top + 120, rect(cx - 104, top + 86, 14, 34, '#fff', 3.4, 3)), fist(cx - 96, top + 120, 13)],
    over: ({ cx, top }) => [pole(cx + 104, top + 230, cx + 214, top - 230, WOOD, 10), L(`M${cx + 204},${top - 190} L${cx + 214},${top - 230}`, 14, RED), fist(cx + 120, top + 170, 13)] },

  // 9 MAIL CARRIER — pith helmet, satchel, letters everywhere, a dog on his leg
  { name: 'mail', label: 'Mail Carrier', form: 'standard', coat: '#7aa6d6', face: 'scream',
    hat: ({ cx, hy }) => { const K2 = '#c9bd9a', o = [];
      o.push(ell(cx, hy - 52, 150, 30, K2, INK, 6), fillPts([[cx - 100, hy - 56], [cx - 96, hy - 130], [cx - 50, hy - 172], [cx, hy - 182], [cx + 50, hy - 172], [cx + 96, hy - 130], [cx + 100, hy - 56], [cx, hy - 64]], K2, 7));
      o.push(rect(cx - 101, hy - 88, 202, 26, '#2c3f72', 5, 4), circ(cx, hy - 186, 10, K2, 4), L(`M${cx - 50},${hy - 166} Q${cx - 30},${hy - 120} ${cx - 40},${hy - 90} M${cx + 50},${hy - 166} Q${cx + 30},${hy - 120} ${cx + 40},${hy - 90}`, 3, '#a89c78'), hl(`M${cx - 80},${hy - 116} Q${cx - 60},${hy - 154} ${cx - 30},${hy - 166}`, 8, .5));
      return o; },
    details: ({ cx, top, bot }) => [P(`M${cx - 36},${top - 6} L${cx},${top + 40} L${cx + 36},${top - 6} Z`, '#f3efe6', INK, 3.5), L(`M${cx},${top + 40} L${cx},${bot}`, 4), rect(cx - 66, top + 70, 44, 30, '#5f8fc4', 3.4, 3),
      rect(cx - 200, bot - 60, 400, 80, '#2c3f72', 4, 0), L(`M${cx - 72},${top - 10} L${cx + 110},${top + 220}`, 30, INK), L(`M${cx - 72},${top - 10} L${cx + 110},${top + 220}`, 22, '#6e4527')],
    arms: B => ({ front: [B.arm(-1, B.cx - 196, B.top - 100, -20), B.arm(1, B.cx + 196, B.top - 90, 20)] }),
    props: ({ cx, top }) => [envelope(cx + 120, top + 156, -16, .9), envelope(cx + 150, top + 150, 10, .9), P(`M${cx + 70},${top + 170} L${cx + 230},${top + 170} L${cx + 224},${top + 320} Q${cx + 150},${top + 336} ${cx + 76},${top + 320} Z`, '#8a5a2b', INK, 6),
      P(`M${cx + 66},${top + 166} L${cx + 234},${top + 166} L${cx + 230},${top + 236} Q${cx + 150},${top + 256} ${cx + 70},${top + 236} Z`, '#a8713a', INK, 5), rect(cx + 136, top + 226, 28, 24, GOLD, 4, 4), envelope(cx + 150, top + 290, 0, .7), hl(`M${cx + 84},${top + 186} L${cx + 210},${top + 184}`, 5, .4)],
    over: ({ cx, top }) => { const D = '#b07a4a', o = [], lx = cx + 44, ly = 830;
      o.push(...[[cx - 200, 120, -24], [cx + 120, 60, 18], [cx + 220, 200, -10], [cx - 220, 330, 14], [cx - 150, -10, 30], [cx + 210, 400, 26]].map(([x, y, a]) => envelope(x, y, a, .85)));
      o.push(...[[cx + 100, 920, -8], [cx + 126, 924, 6], [cx + 176, 926, -6], [cx + 204, 920, 10]].map(([x, y, a]) => L(`M${x},${y - 30} l${a},40`, 10)));
      o.push(P(`M${cx + 226},${866} q26,-20 22,-50`, 'none', INK, 9), ...[0, 1].map(k => L(`M${cx + 250 - k * 12},${812 - k * 6} l6,-10`, 3.4)), rot(10, cx + 150, 880, [ell(cx + 150, 880, 78, 40, D, INK, 6), ell(cx + 150, 896, 46, 18, '#e8d4b4', 'none', 0)]));
      o.push(ell(lx + 40, ly + 8, 46, 38, D, INK, 6), P(`M${lx + 6},${ly - 6} Q${lx - 26},${ly - 8} ${lx - 30},${ly + 10} Q${lx - 24},${ly + 32} ${lx + 6},${ly + 30} Z`, '#e8d4b4', INK, 5), L(`M${lx - 22},${ly + 2} l6,8 l6,-8 l6,8 M${lx - 22},${ly + 22} l6,-8 l6,8 l6,-8`, 3, '#fff'));
      o.push(P(`M${lx + 60},${ly - 20} q30,-20 30,20 q-6,30 -22,24 Z`, '#7a4f2a', INK, 5), circ(lx + 26, ly - 6, 8, '#fff', 3), circ(lx + 28, ly - 5, 4, INK, 0), L(`M${lx + 14},${ly - 20} l20,8`, 4), circ(lx - 26, ly - 2, 7, INK, 0));
      o.push(...[0, 1, 2].map(k => L(`M${lx - 46},${ly - 30 + k * 18} l-16,${(k - 1) * 6}`, 4)), txt(lx + 60, ly - 50, 'GRR', 30, RED, { a: -8 }));
      return o; } },

  // 10 FARMER — giant straw hat, pitchfork, overalls, chicken
  { name: 'farmer', label: 'Farmer', form: 'elder', coat: '#c0453a', face: ['elder', 'gumLaugh'], hair: 'gramps', cane: false,
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 166},${hy - 54} Q${cx - 120},${hy - 96} ${cx},${hy - 98} Q${cx + 120},${hy - 96} ${cx + 166},${hy - 54} Q${cx + 120},${hy - 30} ${cx},${hy - 34} Q${cx - 120},${hy - 30} ${cx - 166},${hy - 54} Z`, STRAW, INK, 6));
      for (let k = -6; k <= 6; k++) o.push(L(`M${cx + k * 13},${hy - 72} L${cx + k * 25},${hy - 40 - Math.abs(k) * 1.4}`, 2.6, STRAWD));
      for (const s of [-1, 1]) o.push(L(`M${cx + s * 164},${hy - 52} l${s * 10},6 M${cx + s * 150},${hy - 44} l${s * 8},12 M${cx + s * 130},${hy - 38} l${s * 2},12`, 3.4, STRAWD));
      o.push(P(`M${cx - 74},${hy - 78} L${cx - 66},${hy - 168} Q${cx},${hy - 184} ${cx + 66},${hy - 168} L${cx + 74},${hy - 78} Q${cx},${hy - 90} ${cx - 74},${hy - 78} Z`, STRAW, INK, 6), P(`M${cx - 72},${hy - 102} Q${cx},${hy - 116} ${cx + 72},${hy - 102} L${cx + 74},${hy - 80} Q${cx},${hy - 92} ${cx - 74},${hy - 80} Z`, RED, INK, 4.5));
      for (let k = 0; k < 4; k++) o.push(L(`M${cx - 66},${hy - 120 - k * 12} Q${cx},${hy - 132 - k * 12} ${cx + 66},${hy - 120 - k * 12}`, 2.6, STRAWD));
      o.push(P(`M${cx + 60},${hy - 110} q20,-50 4,-90 q30,36 6,92 Z`, '#e8d07a', INK, 3.4), hl(`M${cx - 56},${hy - 130} L${cx - 52},${hy - 160}`, 6, .5));
      return o; },
    details: ({ cx, top, bot }) => [...[0, 1, 2, 3, 4, 5, 6].map(k => L(`M${cx - 160 + k * 50},${top - 20} L${cx - 160 + k * 50},${bot}`, 7, '#9e2f27')), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${cx - 200},${top + 20 + k * 50} L${cx + 200},${top + 20 + k * 50}`, 7, '#9e2f27')),
      ...[-1, 1].map(s => L(`M${cx + s * 54},${top + 60} L${cx + s * 74},${top - 20}`, 30, INK)), ...[-1, 1].map(s => L(`M${cx + s * 54},${top + 60} L${cx + s * 74},${top - 20}`, 22, DENIM)),
      P(`M${cx - 70},${top + 60} L${cx + 70},${top + 60} L${cx + 84},${top + 160} L${cx + 200},${top + 170} L${cx + 200},${bot + 10} L${cx - 200},${bot + 10} L${cx - 200},${top + 170} L${cx - 84},${top + 160} Z`, DENIM, INK, 5), rect(cx - 40, top + 90, 80, 50, '#5b88bf', 4, 4),
      ...[-1, 1].map(s => circ(cx + s * 56, top + 72, 10, GOLD, 3.4)), L(`M${cx},${top + 160} L${cx},${bot}`, 3.4, '#35598a')],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 180, 20), B.arm(1, B.cx + 150, B.top + 120, 24)] }),
    props: ({ cx, top }) => { const x = cx + 150, y = top + 120; return [pole(x - 6, 1000, x + 26, y - 420, WOOD, 13), rect(x - 34, y - 440, 128, 18, STEEL, 5, 6),
      ...[-24, 30, 84].map(dx => P(`M${x + dx - 8},${y - 436} L${x + dx - 6},${y - 540} L${x + dx},${y - 560} L${x + dx + 6},${y - 540} L${x + dx + 8},${y - 436} Z`, STEEL, INK, 4.5)), fist(x, y, 15)]; },
    over: ({ cx }) => { const x = cx - 190, y = 930, W2 = '#fbf8f0'; return [L(`M${x - 6},${y + 34} L${x - 10},1004 M${x + 14},${y + 34} L${x + 18},1004`, 6),
      P(`M${x - 56},${y - 4} Q${x - 70},${y - 40} ${x - 46},${y - 30} Q${x - 30},${y + 44} ${x + 20},${y + 40} Q${x + 60},${y + 30} ${x + 50},${y - 20} Q${x + 46},${y - 66} ${x + 40},${y - 72} Q${x + 20},${y - 80} ${x + 18},${y - 54} Q${x + 10},${y - 10} ${x - 56},${y - 4} Z`, W2, INK, 5),
      P(`M${x + 24},${y - 82} q4,-16 12,-4 q6,-14 12,0 q8,-6 6,8 Z`, RED, INK, 3.4), P(`M${x + 52},${y - 62} l18,6 l-18,6 Z`, '#f5b31e', INK, 3), circ(x + 38, y - 62, 4, INK, 0), P(`M${x + 44},${y - 48} q4,12 -4,14 q-6,-6 4,-14 Z`, RED, INK, 2.4),
      L(`M${x - 30},${y + 4} q20,14 40,0`, 3.4, '#cfc6b0'), txt(x + 4, y - 104, 'bawk!', 24, INK, { a: -10 })]; } },
];
