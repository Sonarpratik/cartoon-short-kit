// SHEET 01 — ANCIENT WORLD (quality bar sheet, built by the lead)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, GOLD, GOLDL, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 01: Ancient world';
const BLUE = '#2f5fae', PURPLE = '#6b2d7a', GREEN = '#4f9a3a';

export const CAST = [
  { name: 'pharaoh', label: 'Pharaoh', form: 'standard', coat: '#f4efe2', face: 'proud',
    hat: ({ cx, hy }) => { const o = [];
      for (const s of [-1, 1]) { const x0 = cx + s * 84, x1 = cx + s * 132; o.push(poly([[x0, hy - 40], [cx + s * 116, hy - 40], [x1, hy + 150], [cx + s * 88, hy + 150]], GOLD, 6));
        for (let k = 0; k < 7; k++) { const y = hy - 20 + k * 25; o.push(L(`M${cx + s * (86 + k * .6)},${y} L${cx + s * (120 + k * 1.8)},${y}`, 10, BLUE)); } o.push(poly([[x0, hy - 40], [cx + s * 116, hy - 40], [x1, hy + 150], [cx + s * 88, hy + 150]], 'none', 6)); }
      o.push(fillPts([[cx - 114, hy - 30], [cx - 106, hy - 92], [cx - 50, hy - 124], [cx, hy - 132], [cx + 50, hy - 124], [cx + 106, hy - 92], [cx + 114, hy - 30], [cx + 80, hy - 46], [cx, hy - 54], [cx - 80, hy - 46]], GOLD, 7));
      for (const t of [-.8, -.55, -.3, -.05, .2, .45, .7]) o.push(L(`M${cx + t * 30},${hy - 126} L${cx + t * 128},${hy - 46 + Math.abs(t) * 10}`, 9, BLUE));
      o.push(brush(cx - 96, hy - 44, cx, hy - 62, cx + 96, hy - 44, 16, { col: GOLDL, tip: .7 }), P(`M${cx - 8},${hy - 52} Q${cx - 12},${hy - 84} ${cx},${hy - 92} Q${cx + 14},${hy - 84} ${cx + 8},${hy - 52} Z`, GOLD, INK, 4), ell(cx, hy - 88, 7, 6, GOLD, INK, 3));
      return o; },
    faceTop: ({ cx, hy }) => [rect(cx - 13, hy + 74, 26, 64, GOLD, 4.5, 6), ...[0, 1, 2, 3].map(k => L(`M${cx - 12},${hy + 86 + k * 14} L${cx + 12},${hy + 86 + k * 14}`, 4, BLUE))],
    details: ({ cx, top }) => [circ(cx, top + 4, 118, GOLD, 5), circ(cx, top + 4, 98, BLUE, 4), circ(cx, top + 4, 80, '#c94a3a', 4), circ(cx, top + 4, 62, GOLD, 4),
      rect(cx - 140, top + 190, 280, 24, GOLD, 4, 2), ...[-60, -30, 0, 30, 60].map(t => L(`M${cx + t},${top + 216} L${cx + t * 1.3},${top + 320}`, 3, '#cfc6b0'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 230), B.arm(1, B.cx + 34, B.top + 136, -40)] }),
    props: ({ cx, top }) => { const x0 = cx + 6, y0 = top + 250, x1 = cx + 78, y1 = top - 40; return [pole(x0, y0, x1, y1, GOLD, 13), ...[0, 1, 2, 3, 4, 5].map(k => { const t = .12 + k * .14; return L(`M${f1(x0 + (x1 - x0) * t - 6)},${f1(y0 + (y1 - y0) * t)} l12,-4`, 7, BLUE); }), L(`M${x1},${y1} q8,-40 -26,-44 q-30,-2 -30,26`, 20, INK), L(`M${x1},${y1} q8,-40 -26,-44 q-30,-2 -30,26`, 11, GOLD), fist(cx + 34, top + 136)]; } },

  { name: 'queen', label: 'Nile Queen', form: 'lady', coat: '#f6f1e6', face: ['female', 'smug'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 116, hy - 60], [cx - 126, hy + 60], [cx - 118, hy + 134], [cx + 118, hy + 134], [cx + 126, hy + 60], [cx + 116, hy - 60], [cx, hy - 120]], '#1d1a26', 6)],
    hat: ({ cx, hy }) => { const o = [fillPts([[cx - 112, hy - 6], [cx - 108, hy - 80], [cx - 54, hy - 118], [cx, hy - 124], [cx + 54, hy - 118], [cx + 108, hy - 80], [cx + 112, hy - 6], [cx + 90, hy - 6], [cx + 86, hy - 44], [cx, hy - 50], [cx - 86, hy - 44], [cx - 90, hy - 6]], '#1d1a26', 6)];
      o.push(L(`M${cx - 86},${hy - 46} L${cx + 86},${hy - 46}`, 3, '#3a3446'), hl(`M${cx - 80},${hy - 92} Q${cx - 30},${hy - 118} ${cx + 30},${hy - 112}`, 7, .3));
      o.push(brush(cx - 104, hy - 62, cx, hy - 80, cx + 104, hy - 62, 13, { col: GOLD, tip: .8 }), P(`M${cx - 18},${hy - 70} Q${cx},${hy - 112} ${cx + 18},${hy - 70} Z`, GOLD, INK, 4), ell(cx, hy - 84, 6, 6, '#2fb3a8', INK, 2.6));
      for (const s of [-1, 1]) o.push(circ(cx + s * 106, hy + 44, 14, GOLD, 4), L(`M${cx + s * 106},${hy + 58} l0,22`, 5, GOLD));
      return o; },
    details: ({ cx, top }) => [circ(cx, top, 104, GOLD, 5), circ(cx, top, 86, '#2fb3a8', 4), circ(cx, top, 70, GOLD, 4), rect(cx - 70, top + 118, 140, 20, BLUE, 4, 3), L(`M${cx},${top + 140} L${cx},${top + 380}`, 12, BLUE)],
    props: ({ hdR }) => { const [x, y] = hdR; return [L(`M${x},${y - 16} L${x},${y + 76} M${x - 24},${y + 6} L${x + 24},${y + 6}`, 17, INK), L(`M${x},${y - 16} L${x},${y + 76} M${x - 24},${y + 6} L${x + 24},${y + 6}`, 9, GOLD), `<ellipse cx="${x}" cy="${y - 32}" rx="15" ry="19" fill="none" stroke="${INK}" stroke-width="17"/><ellipse cx="${x}" cy="${y - 32}" rx="15" ry="19" fill="none" stroke="${GOLD}" stroke-width="9"/>`, fist(x, y + 4, 13)]; } },

  { name: 'emperor', label: 'Roman Emperor', form: 'dad', coat: '#f4f0e6', face: 'troll',
    hat: ({ cx, hy }) => { const o = [L(`M${cx - 104},${hy - 30} Q${cx},${hy - 120} ${cx + 104},${hy - 30}`, 8, '#3f7a2c')];
      for (let k = 0; k <= 12; k++) { const t = k / 12, a = Math.PI * (1.05 + t * .9), x = cx + Math.cos(a) * 106, y = hy - 22 + Math.sin(a) * 92, r = (a + Math.PI / 2) * 180 / Math.PI + (k % 2 ? 30 : -30);
        o.push(`<g transform="rotate(${f1(r)} ${f1(x)} ${f1(y)})">${P(`M${f1(x)},${f1(y)} q-8,-16 0,-32 q8,16 0,32 Z`, k % 2 ? GREEN : '#6cbf4a', INK, 3.4)}</g>`); }
      o.push(ell(cx - 104, hy - 22, 8, 8, GOLD, INK, 3), ell(cx + 104, hy - 22, 8, 8, GOLD, INK, 3)); return o; },
    details: ({ cx, top }) => [P(`M${cx - 70},${top - 10} L${cx - 20},${top - 10} L${cx + 170},${top + 330} L${cx + 110},${top + 360} Z`, PURPLE, INK, 5), L(`M${cx - 44},${top - 6} L${cx + 140},${top + 340}`, 4, GOLD), ...[0, 1, 2].map(k => L(`M${cx - 120 + k * 30},${top + 120} q-10,100 4,220`, 3, '#cfc6b0'))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 168, B.top + 210, 26)] }),
    props: ({ cx, top }) => [fist(cx + 168, top + 210, 18), P(`M${cx + 160},${top + 222} q-4,30 6,40 q10,-10 6,-40 Z`, INK, INK, 3)] },

  { name: 'centurion', label: 'Centurion', form: 'chad', coat: '#c23a2f', face: 'rage',
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 160], [cx - 150, hy - 150], [cx - 80, hy - 196], [cx, hy - 206], [cx + 80, hy - 196], [cx + 150, hy - 150], [cx + 160, hy - 120], [cx, hy - 140]].map((p, i) => i ? p : [cx - 160, hy - 120]), RED, 6));
      for (let k = -7; k <= 7; k++) o.push(L(`M${cx + k * 19},${hy - 140 + Math.abs(k) * 1.5} L${cx + k * 21},${hy - 192 + Math.abs(k) * 5}`, 3, '#8f2219'));
      o.push(rect(cx - 10, hy - 146, 20, 34, STEEL, 4, 3), fillPts([[cx - 110, hy - 24], [cx - 104, hy - 82], [cx - 54, hy - 116], [cx, hy - 122], [cx + 54, hy - 116], [cx + 104, hy - 82], [cx + 110, hy - 24], [cx + 70, hy - 44], [cx, hy - 52], [cx - 70, hy - 44]], STEEL, 7), hl(`M${cx - 76},${hy - 86} Q${cx - 30},${hy - 112} ${cx + 20},${hy - 108}`, 8, .5));
      o.push(brush(cx - 100, hy - 40, cx, hy - 58, cx + 100, hy - 40, 12, { col: GOLD, tip: .8 }));
      for (const s of [-1, 1]) o.push(poly([[cx + s * 82, hy - 34], [cx + s * 110, hy - 30], [cx + s * 104, hy + 50], [cx + s * 78, hy + 36]], STEEL, 5), circ(cx + s * 94, hy + 4, 5, GOLD, 2.4));
      return o; },
    details: ({ cx, top }) => [...[0, 1, 2, 3, 4].map(k => poly([[cx - 190, top + 120 + k * 36], [cx + 190, top + 120 + k * 36], [cx + 190, top + 150 + k * 36], [cx - 190, top + 150 + k * 36]], k % 2 ? '#c3c8d4' : STEEL, 4)),
      ...[-1, 1].flatMap(s => [0, 1, 2].map(k => P(`M${cx + s * (90 + k * 26)},${top + 10 + k * 22} q${s * 40},-6 ${s * 70},30 l${-s * 16},14 q${-s * 30},-30 ${-s * 60},-24 Z`, STEEL, INK, 4))), rect(cx - 14, top + 120, 28, 180, GOLD, 4, 2)],
    props: ({ hdL }) => { const [x, y] = hdL; return [P(`M${x - 74},${y - 150} Q${x},${y - 166} ${x + 74},${y - 150} L${x + 70},${y + 150} Q${x},${y + 166} ${x - 70},${y + 150} Z`, '#b8322a', INK, 7), P(`M${x - 58},${y - 136} Q${x},${y - 150} ${x + 58},${y - 136} L${x + 55},${y + 138} Q${x},${y + 150} ${x - 55},${y + 138} Z`, 'none', GOLD, 5), circ(x, y, 26, GOLD, 5), circ(x, y, 10, GOLDL, 3), L(`M${x - 40},${y - 70} l20,30 l-16,10 l36,40 M${x + 40},${y + 70} l-20,-30 l16,-10 l-36,-40`, 6, GOLD), hl(`M${x - 56},${y - 120} L${x - 54},${y + 110}`, 8, .3)]; } },

  { name: 'philosopher', label: 'Philosopher', form: 'elder', coat: '#f1ede4', face: ['elder', 'confused'], hair: 'gramps', cane: false,
    faceTop: ({ cx, hy }) => [cloud([[cx - 56, hy + 70, 26], [cx - 30, hy + 92, 30], [cx, hy + 100, 32], [cx + 30, hy + 92, 30], [cx + 56, hy + 70, 26], [cx - 40, hy + 128, 26], [cx, hy + 142, 30], [cx + 40, hy + 128, 26], [cx - 16, hy + 170, 22], [cx + 16, hy + 172, 22], [cx, hy + 196, 18]], '#f4f2f6'), ...[[-34, 110], [8, 140], [30, 104], [-6, 178]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q6,6 4,14`, 2.6, '#a9a3b5'))],
    details: ({ cx, top }) => [P(`M${cx - 110},${top + 20} Q${cx + 20},${top + 140} ${cx + 130},${top + 280} L${cx + 130},${top + 320} Q${cx},${top + 180} ${cx - 110},${top + 70} Z`, '#2f5fae', INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 60 + k * 40},${top + 160 + k * 10} q14,50 6,110`, 3, '#cfc6b0'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 96, B.top + 150), B.arm(1, B.cx + 70, B.top + 140, 20)] }),
    props: ({ cx, top }) => [poly([[cx - 140, top + 120], [cx - 60, top + 120], [cx - 60, top + 190], [cx - 140, top + 190]], CREAM, 5), ell(cx - 140, top + 155, 12, 37, '#e2d6b8', INK, 5), ell(cx - 60, top + 155, 12, 37, '#e2d6b8', INK, 5), ...[0, 1, 2].map(k => L(`M${cx - 124},${top + 140 + k * 14} l44,0`, 2.6, '#b8ae98')), fist(cx - 96, top + 150, 14), fist(cx + 70, top + 140, 14)] },

  { name: 'spartan', label: 'Spartan', form: 'chad', coat: '#c98a3c', face: 'rage',
    headBack: ({ cx, hy }) => [],
    hat: ({ cx, hy }) => { const o = [];
      const out = smooth([[cx - 112, hy + 90], [cx - 116, hy - 10], [cx - 100, hy - 84], [cx - 50, hy - 118], [cx, hy - 124], [cx + 50, hy - 118], [cx + 100, hy - 84], [cx + 116, hy - 10], [cx + 112, hy + 90], [cx + 40, hy + 100], [cx, hy + 104], [cx - 40, hy + 100]]);
      const t = `M${cx - 78},${hy - 50} L${cx + 78},${hy - 50} L${cx + 78},${hy - 12} L${cx + 30},${hy - 2} L${cx + 34},${hy + 104} L${cx - 34},${hy + 104} L${cx - 30},${hy - 2} L${cx - 78},${hy - 12} Z`;
      o.push(`<path d="${out} ${t}" fill="${BRONZE}" fill-rule="evenodd" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`, hl(`M${cx - 92},${hy - 70} Q${cx - 40},${hy - 112} ${cx + 10},${hy - 112}`, 9, .45), L(`M${cx - 100},${hy + 30} q14,-20 40,-22 M${cx + 100},${hy + 30} q-14,-20 -40,-22`, 4, '#8a5a24'));
      o.push(rect(cx - 12, hy - 150, 24, 32, BRONZE, 4, 3), fillPts([[cx - 30, hy - 140], [cx - 34, hy - 220], [cx - 14, hy - 286], [cx + 10, hy - 296], [cx + 34, hy - 260], [cx + 36, hy - 180], [cx + 30, hy - 140]], RED, 6));
      for (let k = 0; k < 8; k++) o.push(L(`M${cx - 20 + k * 6},${hy - 146} L${cx - 18 + k * 5},${hy - 270 + Math.abs(k - 3.5) * 8}`, 2.6, '#8f2219'));
      return o; },
    behind: ({ cx, top }) => [P(`M${cx - 150},${top + 20} Q${cx},${top - 10} ${cx + 150},${top + 20} L${cx + 230},${top + 640} Q${cx},${top + 680} ${cx - 230},${top + 640} Z`, '#b8322a', INK, 7), ...[-1, 0, 1].map(k => L(`M${cx + k * 70},${top + 80} q${k * 20},300 ${k * 50},560`, 4, '#8f2219'))],
    details: ({ cx, top }) => [L(`M${cx - 120},${top + 90} Q${cx - 60},${top + 140} ${cx - 4},${top + 100} M${cx + 120},${top + 90} Q${cx + 60},${top + 140} ${cx + 4},${top + 100}`, 5, '#8a5a24'), ...[0, 1, 2].map(k => L(`M${cx - 44},${top + 170 + k * 44} q22,8 40,0 M${cx + 4},${top + 170 + k * 44} q22,8 40,0`, 4, '#8a5a24')), hl(`M${cx - 130},${top + 60} Q${cx - 100},${top + 40} ${cx - 60},${top + 50}`, 10, .45)],
    props: ({ hdL, hdR }) => { const [x, y] = hdL; return [circ(x - 10, y - 30, 120, BRONZE, 8), circ(x - 10, y - 30, 98, '#b8322a', 5), L(`M${x - 50},${y + 30} L${x - 10},${y - 90} L${x + 30},${y + 30}`, 16, BRONZE), L(`M${x - 50},${y + 30} L${x - 10},${y - 90} L${x + 30},${y + 30}`, 4, INK), hl(`M${x - 100},${y - 70} Q${x - 80},${y - 120} ${x - 40},${y - 136}`, 10, .45)]; },
    over: ({ hdR }) => { const [x, y] = hdR; return [pole(x, y + 260, x + 10, y - 640, WOOD, 11), P(`M${x + 10},${y - 700} L${x - 8},${y - 640} L${x + 28},${y - 640} Z`, STEEL, INK, 5), fist(x, y, 20)]; } },

  { name: 'viking', label: 'Viking', form: 'bigboi', coat: '#7a5a3a', face: 'delight',
    hat: ({ cx, hy }) => { const o = [];
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 86},${hy - 60} Q${cx + s * 150},${hy - 70} ${cx + s * 168},${hy - 150} Q${cx + s * 176},${hy - 190} ${cx + s * 160},${hy - 214} Q${cx + s * 150},${hy - 150} ${cx + s * 96},${hy - 100} Z`, CREAM, INK, 6), L(`M${cx + s * 110},${hy - 82} l${s * 14},-18 M${cx + s * 138},${hy - 104} l${s * 14},-12`, 3, '#b8ae98'));
      o.push(fillPts([[cx - 106, hy - 34], [cx - 100, hy - 90], [cx - 50, hy - 122], [cx, hy - 128], [cx + 50, hy - 122], [cx + 100, hy - 90], [cx + 106, hy - 34], [cx, hy - 52]], STEEL, 7), rect(cx - 110, hy - 50, 220, 20, BRONZE, 5, 6), rect(cx - 9, hy - 44, 18, 54, BRONZE, 4, 5), L(`M${cx},${hy - 124} L${cx},${hy - 54}`, 8, BRONZE), hl(`M${cx - 76},${hy - 88} Q${cx - 30},${hy - 116} ${cx + 10},${hy - 114}`, 8, .5));
      return o; },
    faceTop: ({ cx, hy }) => { const OR = '#e07a2e'; return [cloud([[cx - 84, hy + 20, 24], [cx + 84, hy + 20, 24], [cx - 76, hy + 56, 28], [cx + 76, hy + 56, 28], [cx - 50, hy + 84, 30], [cx + 50, hy + 84, 30], [cx - 20, hy + 96, 28], [cx + 20, hy + 96, 28]], OR),
      ...[-1, 1].flatMap(s => [P(`M${cx + s * 34},${hy + 104} q${s * 6},50 ${s * 2},92 q${-s * 8},10 ${-s * 16},0 q${s * 4},-46 ${-s * 2},-90 Z`, OR, INK, 4.5), ...[0, 1, 2].map(k => L(`M${cx + s * 28},${hy + 128 + k * 22} l${s * 14},6`, 3, '#a8521a')), ell(cx + s * 30, hy + 200, 8, 6, BRONZE, INK, 3)]),
      P(`M${cx - 54},${hy + 60} Q${cx - 28},${hy + 44} ${cx},${hy + 58} Q${cx + 28},${hy + 44} ${cx + 54},${hy + 60} Q${cx + 30},${hy + 74} ${cx},${hy + 64} Q${cx - 30},${hy + 74} ${cx - 54},${hy + 60} Z`, OR, INK, 4.5)]; },
    details: ({ cx, top }) => [cloud([...Array(11)].map((_, k) => [cx - 220 + k * 44, top + 30 + Math.abs(k - 5) * 6, 34]), '#9a8f84'), rect(cx - 240, top + 300, 480, 34, WOODD, 5, 3), rect(cx - 30, top + 292, 60, 50, GOLD, 5, 8)],
    props: ({ hdR }) => { const [x, y] = hdR; return [pole(x, y + 90, x + 30, y - 260, WOOD, 13), P(`M${x + 24},${y - 250} Q${x + 110},${y - 280} ${x + 120},${y - 190} Q${x + 80},${y - 200} ${x + 30},${y - 180} Z`, STEEL, INK, 6), hl(`M${x + 50},${y - 248} Q${x + 90},${y - 254} ${x + 104},${y - 220}`, 5, .6), fist(x, y, 17)]; } },

  { name: 'gladiator', label: 'Gladiator', form: 'standard', coat: '#c9a26b', face: 'terrified',
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 30},${hy - 118} Q${cx - 40},${hy - 190} ${cx + 30},${hy - 214} Q${cx + 80},${hy - 220} ${cx + 96},${hy - 188} Q${cx + 60},${hy - 196} ${cx + 44},${hy - 170} Q${cx + 30},${hy - 140} ${cx + 30},${hy - 118} Z`, BRONZE, INK, 6));
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 70},${hy - 106} Q${cx + s * 96},${hy - 190} ${cx + s * 80},${hy - 230} Q${cx + s * 110},${hy - 180} ${cx + s * 90},${hy - 100} Z`, '#f4f2f6', INK, 4.5));
      o.push(fillPts([[cx - 104, hy - 46], [cx - 98, hy - 94], [cx - 50, hy - 124], [cx, hy - 128], [cx + 50, hy - 124], [cx + 98, hy - 94], [cx + 104, hy - 46], [cx, hy - 58]], BRONZE, 7), P(`M${cx - 150},${hy - 40} Q${cx},${hy - 76} ${cx + 150},${hy - 40} Q${cx + 140},${hy - 20} ${cx + 100},${hy - 30} Q${cx},${hy - 56} ${cx - 100},${hy - 30} Q${cx - 140},${hy - 20} ${cx - 150},${hy - 40} Z`, BRONZE, INK, 6), hl(`M${cx - 76},${hy - 92} Q${cx - 30},${hy - 118} ${cx + 10},${hy - 116}`, 8, .5));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 70},${top - 10} L${cx - 30},${top - 10} L${cx + 130},${top + 220} L${cx + 96},${top + 240} Z`, WOODD, INK, 4), rect(cx - 150, top + 200, 300, 64, GOLD, 5, 4), ...[-90, -30, 30, 90].map(t => circ(cx + t, top + 232, 9, GOLDL, 3)), P(`M${cx - 120},${top + 264} L${cx + 120},${top + 264} L${cx + 80},${top + 330} L${cx - 80},${top + 330} Z`, CREAM, INK, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 120, 30), B.arm(1, B.cx + 150, B.top + 130, -30)] }),
    props: ({ cx, top }) => [circ(cx - 160, top + 120, 54, BRONZE, 6), circ(cx - 160, top + 120, 16, GOLDL, 4), hl(`M${cx - 196},${top + 100} Q${cx - 186},${top + 78} ${cx - 166},${top + 74}`, 6, .5), fist(cx - 150, top + 120)],
    over: ({ cx, top }) => [P(`M${cx + 148},${top + 116} L${cx + 160},${top - 20} L${cx + 176},${top - 34} L${cx + 180},${top - 16} L${cx + 166},${top + 120} Z`, STEEL, INK, 5), rect(cx + 136, top + 112, 44, 14, GOLD, 4, 4), fist(cx + 150, top + 132), ...[[-12, -60], [20, -70], [40, -40]].map(([dx, dy]) => L(`M${cx + 160 + dx},${top + dy} l${dx > 0 ? 10 : -10},-8`, 4))] },

  { name: 'mummy', label: 'Mummy', form: 'noodle', coat: '#e8dcc0', face: 'soul',
    hat: ({ cx, hy }) => { const B2 = '#efe4c8', o = [];
      for (const [y, a] of [[-92, -8], [-64, 6], [-40, -4], [22, 7], [52, -6], [80, 4]]) o.push(`<g transform="rotate(${a} ${cx} ${hy + y})">${rect(cx - 112, hy + y - 11, 224, 22, B2, 4, 3)}</g>`);
      o.push(P(`M${cx + 80},${hy + 60} q30,20 20,80 q-10,30 6,60 l-14,4 q-18,-30 -8,-62 q8,-50 -16,-72 Z`, B2, INK, 4)); return o; },
    details: ({ cx, top }) => [...[...Array(12)].map((_, k) => `<g transform="rotate(${k % 2 ? 6 : -6} ${cx} ${top + 30 + k * 34})">${rect(cx - 100, top + 18 + k * 34, 200, 26, k % 2 ? '#efe4c8' : '#e2d4b2', 3, 2)}</g>`)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 40, -10), B.arm(1, B.cx + 150, B.top + 30, 10)] }),
    props: ({ cx, top }) => [P(`M${cx + 120},${top + 40} q10,40 -4,90 l12,2 q14,-44 4,-92 Z`, '#efe4c8', INK, 3.5), P(`M${cx - 110},${top + 52} q-6,60 10,110 l-12,2 q-16,-50 -10,-112 Z`, '#efe4c8', INK, 3.5)] },

  { name: 'eagle', label: 'Eagle Warrior', form: 'standard', coat: '#8a5a2b', face: 'sus',
    headBack: ({ cx, hy }) => { const o = [], cols = ['#3fae5a', '#d8473c', '#2f8fd0', '#e2b13c', '#3fae5a', '#d8473c', '#2f8fd0', '#e2b13c', '#3fae5a'];
      cols.forEach((c, k) => { const a = Math.PI * (1.12 + k * .095), x = cx + Math.cos(a) * 230, y = hy - 30 + Math.sin(a) * 210; o.push(P(`M${cx + Math.cos(a) * 60},${hy - 30 + Math.sin(a) * 60} Q${f1(cx + Math.cos(a - .12) * 160)},${f1(hy - 30 + Math.sin(a - .12) * 150)} ${f1(x)},${f1(y)} Q${f1(cx + Math.cos(a + .12) * 160)},${f1(hy - 30 + Math.sin(a + .12) * 150)} ${cx + Math.cos(a) * 60},${hy - 30 + Math.sin(a) * 60} Z`, c, INK, 5)); }); return o; },
    hat: ({ cx, hy }) => { const o = [fillPts([[cx - 110, hy - 20], [cx - 104, hy - 90], [cx - 50, hy - 126], [cx, hy - 132], [cx + 50, hy - 126], [cx + 104, hy - 90], [cx + 110, hy - 20], [cx + 70, hy - 50], [cx, hy - 58], [cx - 70, hy - 50]], '#6e4527', 7)];
      for (let k = 0; k < 7; k++) o.push(L(`M${cx - 90 + k * 30},${hy - 66 - Math.sin(k / 6 * Math.PI) * 40} q15,14 30,0`, 3.4, '#4a2c16'));
      o.push(P(`M${cx - 36},${hy - 60} Q${cx},${hy - 76} ${cx + 36},${hy - 60} Q${cx + 20},${hy - 10} ${cx},${hy + 4} Q${cx - 6},${hy - 30} ${cx - 36},${hy - 60} Z`, GOLD, INK, 6), ...[-1, 1].map(s => circ(cx + s * 52, hy - 74, 9, '#fff', 3) + ell(cx + s * 52, hy - 74, 3.5, 4, INK)));
      return o; },
    details: ({ cx, top }) => [...[...Array(6)].flatMap((_, r) => [...Array(7)].map((_, k) => P(`M${cx - 168 + k * 48 + (r % 2) * 24},${top + 30 + r * 50} q24,40 48,0`, r % 2 ? '#9e6a35' : '#7a4a22', INK, 3)))],
    props: ({ hdL, hdR }) => { const [x, y] = hdL, [u, v] = hdR; return [circ(x - 10, y - 20, 70, '#e8dcc0', 6), circ(x - 10, y - 20, 50, '#2f8fd0', 4), circ(x - 10, y - 20, 22, '#d8473c', 4), ...[-.8, -.4, 0, .4, .8].map(t => P(`M${x - 10 + Math.sin(t) * 64},${y - 20 + Math.cos(t) * 64} l${f1(Math.sin(t) * 10 - 6)},34 l12,0 Z`, '#3fae5a', INK, 3)), pole(u, v + 40, u + 30, v - 220, WOOD, 20), ...[0, 1, 2, 3, 4].map(k => P(`M${u + 4 + k * 6},${v - 30 - k * 46} l-14,-6 l14,-16 Z M${u + 28 + k * 6},${v - 36 - k * 46} l14,-6 l-12,-16 Z`, '#2a2a36', INK, 2.6)), fist(u, v)]; } },
];
