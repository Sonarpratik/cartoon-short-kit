// SHEET 07 — JOBS II (astronaut, pilot, judge, businessman, programmer, barista, mechanic, plumber, dentist, lifeguard)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, star5, drop, heart, GOLD, GOLDL, SILVER, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 07: Jobs II';

// ---- local helpers (sheet-only) ----
const rot = (a, x, y, inner) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${[].concat(inner).join('')}</g>`;
const txt = (x, y, s, size, col = INK, { a = 0, anchor = 'middle', stroke = '' } = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="${anchor}" fill="${col}"${stroke ? ` stroke="${stroke}" stroke-width="6" stroke-linejoin="round" paint-order="stroke"` : ''}${a ? ` transform="rotate(${a} ${f1(x)} ${f1(y)})"` : ''}>${s}</text>`;
const ribbon = (d, w, col, sw = 5, cap = 'round') => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + sw * 2}" stroke-linecap="${cap}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
const ring = (x, y, r, col, w = 6) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="${INK}" stroke-width="${w + 7}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const swish = (x, y, s = 1) => L(`M${x},${y} l${-26 * s},-8 M${x + 4 * s},${y + 16} l${-30 * s},0 M${x},${y + 32} l${-26 * s},8`, 4.5);

const NAVY = '#1f2a48', HAIR = '#2a2228';

export const CAST = [
  // 1 ASTRONAUT — giant glass bubble helmet, life-support pack, planted flag
  { name: 'astronaut', label: 'Astronaut', form: 'dad', coat: '#f2f2f4', face: 'starstruck',
    hat: ({ cx, hy }) => [`<circle cx="${cx}" cy="${hy - 4}" r="146" fill="#bfe6ff" fill-opacity=".2" stroke="${INK}" stroke-width="8"/>`,
      `<path d="M${cx - 120},${hy - 50} A130,130 0 0,1 ${cx - 40},${hy - 132}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="16" stroke-linecap="round"/>`, `<path d="M${cx - 132},${hy + 4} A132,132 0 0,1 ${cx - 128},${hy - 26}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="10" stroke-linecap="round"/>`,
      L(`M${cx + 92},${hy + 70} A120,120 0 0,0 ${cx + 118},${hy + 30}`, 6, '#8fc6e8'), rect(cx - 118, hy + 122, 236, 36, SILVER, 6, 12), ...[-80, -40, 0, 40, 80].map(t => circ(cx + t, hy + 140, 5, '#8a90a0', 2.4))],
    behind: ({ cx, top }) => [L(`M${cx + 130},${top + 100} L${cx + 226},${top + 10}`, 7), circ(cx + 228, top + 6, 12, RED, 4), rect(cx - 150, top + 90, 300, 230, '#d9dbe2', 7, 26), rect(cx - 134, top + 110, 26, 190, '#c3c6d0', 0, 8)],
    details: ({ cx, top, bot }) => [rect(cx - 60, top + 70, 120, 84, '#c9ccd6', 5, 8), ...[[-34, 96, RED], [-6, 96, '#f5c518'], [22, 96, '#3fae5a'], [-34, 126, '#2f8fd0']].map(([dx, dy, c]) => circ(cx + dx, top + dy, 8, c, 3)), rect(cx + 6, top + 116, 40, 20, '#2a2a36', 3.4, 3),
      circ(cx - 70, top + 40, 26, '#2c3f72', 4), star5(cx - 70, top + 40, 14, '#fff'), L(`M${cx - 96},${top + 52} Q${cx - 70},${top + 30} ${cx - 44},${top + 26}`, 3, RED),
      ...[0, 1, 2].map(k => L(`M${cx - 200},${top + 230 + k * 30} Q${cx},${top + 250 + k * 30} ${cx + 200},${top + 230 + k * 30}`, 4, '#b9bcc8')), rect(cx - 200, bot - 60, 400, 30, '#c9ccd6', 4, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 176, B.top + 120, 20), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top }) => { const px = cx - 182; return [pole(px - 4, 1000, px + 6, -150, SILVER, 10),
      P(`M${px + 6},${-146} Q${px + 60},${-160} ${px + 110},${-140} Q${px + 160},${-122} ${px + 200},${-140} L${px + 200},${-30} Q${px + 160},${-12} ${px + 110},${-30} Q${px + 60},${-48} ${px + 6},${-36} Z`, '#2c3f72', INK, 6),
      ell(px + 104, -88, 46, 16, 'none', '#f5c518', 6), circ(px + 104, -88, 22, '#e07a2e', 4), star4(px + 40, -120, 10, '#fff'), star4(px + 170, -60, 8, '#fff'), star4(px + 160, -116, 6, '#fff'),
      L(`M${px + 6},${-150} L${px + 200},${-150}`, 9), fist(px + 6, top + 120, 16)]; } },

  // 2 AIRLINE PILOT — winged captain cap, aviators, rolling suitcase
  { name: 'pilot', label: 'Airline Pilot', form: 'standard', coat: NAVY, face: 'troll',
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 72} Q${cx - 124},${hy - 140} ${cx},${hy - 150} Q${cx + 124},${hy - 140} ${cx + 104},${hy - 72} Z`, '#f6f7f9', INK, 6), hl(`M${cx - 86},${hy - 116} Q${cx - 40},${hy - 140} ${cx + 10},${hy - 142}`, 7, .6),
      rect(cx - 104, hy - 92, 208, 30, NAVY, 5, 4), L(`M${cx - 98},${hy - 78} L${cx + 98},${hy - 78}`, 4, GOLD),
      P(`M${cx - 100},${hy - 64} Q${cx},${hy - 86} ${cx + 100},${hy - 64} Q${cx + 78},${hy - 38} ${cx},${hy - 42} Q${cx - 78},${hy - 38} ${cx - 100},${hy - 64} Z`, '#161a28', INK, 5), L(`M${cx - 70},${hy - 54} Q${cx},${hy - 70} ${cx + 70},${hy - 54}`, 4, GOLD),
      ...[-1, 1].map(s => P(`M${cx + s * 14},${hy - 118} Q${cx + s * 60},${hy - 150} ${cx + s * 150},${hy - 150} Q${cx + s * 120},${hy - 136} ${cx + s * 126},${hy - 128} Q${cx + s * 100},${hy - 120} ${cx + s * 104},${hy - 112} Q${cx + s * 60},${hy - 100} ${cx + s * 14},${hy - 100} Z`, GOLD, INK, 4.5)),
      ...[-1, 1].flatMap(s => [0, 1].map(k => L(`M${cx + s * (50 + k * 30)},${hy - 128 - k * 6} l${s * 22},-4`, 2.6, '#a87a1a'))), circ(cx, hy - 110, 16, GOLD, 4.5), star5(cx, hy - 110, 9, '#fff')],
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 8},${hy - 34} L${cx + s * 74},${hy - 34} Q${cx + s * 80},${hy + 4} ${cx + s * 50},${hy + 8} Q${cx + s * 14},${hy + 8} ${cx + s * 10},${hy - 20} Z`, '#3a4458', GOLD, 5)),
      L(`M${cx - 8},${hy - 32} Q${cx},${hy - 38} ${cx + 8},${hy - 32}`, 5, GOLD), L(`M${cx - 74},${hy - 34} L${cx - 100},${hy - 40} M${cx + 74},${hy - 34} L${cx + 100},${hy - 40}`, 5, GOLD),
      ...[-1, 1].map(s => L(`M${cx + s * 22},${hy - 22} l${s * 24},-6`, 5, '#fff')), ...[-1, 1].map(s => L(`M${cx + s * 22},${hy - 8} l${s * 12},-3`, 3.4, '#9aa6c0'))],
    details: ({ cx, top, bot }) => [P(`M${cx - 40},${top - 10} L${cx},${top + 80} L${cx + 40},${top - 10} Z`, '#f6f7f9', INK, 4), P(`M${cx - 8},${top + 10} L${cx + 8},${top + 10} L${cx + 12},${top + 120} L${cx},${top + 136} L${cx - 12},${top + 120} Z`, '#161a28', INK, 3),
      ...[-1, 1].map(s => P(`M${cx + s * 42},${top - 10} L${cx + s * 10},${top + 120} L${cx + s * 30},${top + 150} L${cx + s * 96},${top + 40} Z`, '#2c3a60', INK, 4)), ...[0, 1, 2].flatMap(k => [circ(cx - 26, top + 170 + k * 44, 7, GOLD, 3), circ(cx + 26, top + 170 + k * 44, 7, GOLD, 3)]),
      P(`M${cx + 30},${top + 96} q14,-14 30,-6 q16,-8 30,6 q-16,4 -30,0 q-14,4 -30,0 Z`, GOLD, INK, 3), ...[0, 1, 2, 3].map(k => L(`M${cx - 150},${bot - 50 - k * 14} L${cx + 150},${bot - 50 - k * 14}`, 4, GOLD))],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 260, 10), B.arm(1, B.cx + 150, B.top - 170, 50)] }),
    props: ({ cx, top }) => { const x = cx - 150, y = top + 260; return [L(`M${x - 18},${y} L${x - 18},${y + 120} M${x + 18},${y} L${x + 18},${y + 120}`, 14), L(`M${x - 18},${y} L${x - 18},${y + 120} M${x + 18},${y} L${x + 18},${y + 120}`, 6, SILVER), rect(x - 26, y - 10, 52, 18, '#2a2a36', 4, 6),
      rect(x - 80, y + 116, 160, 240, '#2c3a60', 6, 16), ...[-40, 0, 40].map(t => L(`M${x + t},${y + 130} L${x + t},${y + 340}`, 4, '#1c2440')), rect(x - 50, y + 180, 50, 34, '#f5c518', 4, 6), circ(x - 50, 1000 - 14, 14, '#2a2a36', 4), circ(x + 50, 1000 - 14, 14, '#2a2a36', 4), hl(`M${x - 64},${y + 140} L${x - 64},${y + 300}`, 7, .3), fist(x, y, 16),
    ]; },
    over: ({ cx, top }) => [fist(cx + 150, top - 170, 16), star4(cx + 196, top - 196, 14), star4(cx + 214, top - 150, 8)] },

  // 3 JUDGE — enormous curly white wig, black robe, gavel
  { name: 'judge', label: 'Judge', form: 'elder', coat: '#1c1a24', face: ['elder', 'grumpy'], cane: false,
    headBack: ({ cx, hy }) => { const W = '#f4f2f6', o = []; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) for (let j = 0; j < 2; j++) o.push([cx + s * (112 + j * 40), hy - 50 + k * 56 + j * 26, 30]);
      return [cloud(o, W, 5.5), ...o.filter((_, i) => i % 2 === 0).map(([x, y]) => L(`M${x - 12},${y - 4} a12,10 0 1,0 12,-10`, 3, '#b9b5c8'))]; },
    hat: ({ cx, hy }) => { const W = '#f4f2f6', cs = [[cx - 104, hy - 70, 32], [cx - 76, hy - 108, 34], [cx - 38, hy - 128, 34], [cx, hy - 136, 36], [cx + 38, hy - 128, 34], [cx + 76, hy - 108, 34], [cx + 104, hy - 70, 32], [cx - 114, hy - 30, 28], [cx + 114, hy - 30, 28]];
      return [cloud(cs, W, 5.5), ...cs.map(([x, y]) => L(`M${x - 12},${y + 2} a12,10 0 1,1 12,10`, 3, '#b9b5c8')), L(`M${cx - 86},${hy - 64} Q${cx},${hy - 98} ${cx + 86},${hy - 64}`, 5, '#d6d2de')]; },
    details: ({ cx, top, bot }) => [...[-1, 1].map(s => P(`M${cx},${top + 10} L${cx + s * 34},${top + 6} L${cx + s * 26},${top + 96} L${cx + s * 4},${top + 92} Z`, '#fff', INK, 4)), ...[-90, -45, 45, 90].map(t => L(`M${cx + t},${top + 40} L${cx + t * 1.2},${bot}`, 4, '#3a3646')),
      ...[-1, 1].map(s => P(`M${cx + s * 40},${top - 10} Q${cx + s * 110},${top + 40} ${cx + s * 150},${top + 10} L${cx + s * 150},${top + 40} Q${cx + s * 110},${top + 70} ${cx + s * 40},${top + 30} Z`, '#8f2219', INK, 4))],
    arms: B => ({ front: [B.arm(-1, B.cx - 96, B.top + 200, 20), ] }),
    props: ({ cx, top }) => [rect(cx - 160, top + 210, 130, 30, WOOD, 5, 6), rect(cx - 150, top + 236, 110, 18, WOODD, 4, 4), fist(cx - 96, top + 200, 14)],
    over: ({ cx, top }) => { const x = cx + 196, y = top - 190; return [L(`M${cx + 74},${top + 40} Q${cx + 250},${top + 30} ${x},${y}`, 14), rot(-20, x, y, [pole(x, y + 30, x, y - 130, WOOD, 13), rect(x - 66, y - 186, 132, 64, WOOD, 6, 12), rect(x - 52, y - 186, 18, 64, WOODD, 3, 2), rect(x + 34, y - 186, 18, 64, WOODD, 3, 2), hl(`M${x - 24},${y - 176} L${x + 24},${y - 176}`, 6, .45)]),
      fist(x, y, 15), txt(cx - 120, top - 400, 'ORDER!', 46, RED, { a: -8, stroke: '#fff' }), ...[0, 1, 2].map(k => L(`M${cx + 78 - k * 10},${top - 420 + k * 26} l${-18},${(k - 1) * 8}`, 5))]; } },

  // 4 BUSINESSMAN — tie blown over the shoulder, phone yelling, briefcase
  { name: 'business', label: 'Businessman', form: 'standard', coat: '#3a3f4c', face: 'rage',
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 50} Q${cx - 112},${hy - 112} ${cx - 50},${hy - 130} Q${cx + 20},${hy - 146} ${cx + 80},${hy - 116} Q${cx + 112},${hy - 96} ${cx + 106},${hy - 50} Q${cx + 70},${hy - 104} ${cx - 30},${hy - 96} Q${cx - 80},${hy - 92} ${cx - 104},${hy - 50} Z`, HAIR, INK, 6),
      L(`M${cx - 40},${hy - 128} Q${cx - 50},${hy - 110} ${cx - 44},${hy - 96}`, 4, '#4a3f48'), ...[0, 1, 2].map(k => L(`M${cx - 20 + k * 30},${hy - 126 + k * 2} q30,4 44,20`, 3, '#4a3f48')), hl(`M${cx - 80},${hy - 100} Q${cx - 60},${hy - 124} ${cx - 30},${hy - 128}`, 7, .5)],
    details: ({ cx, top }) => [P(`M${cx - 40},${top - 10} L${cx},${top + 90} L${cx + 40},${top - 10} Z`, '#f6f7f9', INK, 4), ...[-1, 1].map(s => P(`M${cx + s * 42},${top - 10} L${cx + s * 6},${top + 130} L${cx + s * 34},${top + 160} L${cx + s * 96},${top + 40} Z`, '#2c303b', INK, 4)),
      circ(cx - 6, top + 190, 7, '#1c1f28', 3), circ(cx - 6, top + 240, 7, '#1c1f28', 3), P(`M${cx + 34},${top + 110} l30,-8 l6,10 l-30,8 Z`, '#f6f7f9', INK, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top + 230, 16), B.arm(1, B.cx + 168, B.top - 100, 40)] }),
    props: ({ cx, top }) => { const x = cx - 140, y = top + 230; return [ribbon(`M${cx},${top + 4} Q${cx + 90},${top - 10} ${cx + 140},${top - 60} Q${cx + 190},${top - 110} ${cx + 236},${top - 96}`, 30, '#d8473c', 4.5, 'butt'),
      P(`M${cx + 226},${top - 120} L${cx + 250},${top - 96} L${cx + 226},${top - 72} Z`, '#d8473c', INK, 4.5), ...[0, 1, 2].map(k => L(`M${cx + 60 + k * 50},${top - 8 - k * 30} l14,-16`, 4, '#9e2a22')), P(`M${cx - 14},${top - 6} L${cx + 14},${top - 6} L${cx + 10},${top + 18} L${cx - 10},${top + 18} Z`, '#d8473c', INK, 4),
      L(`M${x},${y} L${x},${y + 30}`, 8), rect(x - 80, y + 30, 160, 110, '#7a4a28', 6, 10), rect(x - 80, y + 30, 160, 26, '#8f5a32', 5, 6), rect(x - 14, y + 46, 28, 18, GOLD, 4, 3), hl(`M${x - 64},${y + 74} L${x - 64},${y + 124}`, 6, .3), fist(x, y, 15),
      ...[[cx - 230, top - 50], [cx - 210, top - 10]].map(([u, v]) => L(`M${u},${v} l50,0`, 4, '#a9a3b5'))]; },
    over: ({ cx, top }) => { const x = cx + 168, y = top - 100; return [rot(18, x, y, [rect(x - 22, y - 70, 44, 96, '#2a2a36', 5, 10), rect(x - 15, y - 60, 30, 70, '#6ec6f0', 2.6, 4)]), fist(x, y + 10, 15), txt(cx + 150, top - 228, 'SELL!!', 50, RED, { a: 10, stroke: '#fff' }), L(`M${cx + 60},${top - 220} l26,10 M${cx + 50},${top - 190} l28,0`, 5)]; } },

  // 5 PROGRAMMER — hood, giant headphones, laptop + oversized coffee (noodle)
  { name: 'programmer', label: 'Programmer', form: 'noodle', coat: '#3a3d48', face: 'tired',
    headBack: ({ cx, hy }) => [fillPts([[cx - 128, hy + 120], [cx - 140, hy + 10], [cx - 120, hy - 90], [cx - 60, hy - 134], [cx, hy - 142], [cx + 60, hy - 134], [cx + 120, hy - 90], [cx + 140, hy + 10], [cx + 128, hy + 120], [cx, hy + 140]], '#4a4e5c', 6)],
    hat: ({ cx, hy }) => [L(`M${cx - 120},${hy - 6} Q${cx - 124},${hy - 144} ${cx},${hy - 146} Q${cx + 124},${hy - 144} ${cx + 120},${hy - 6}`, 26), L(`M${cx - 120},${hy - 6} Q${cx - 124},${hy - 144} ${cx},${hy - 146} Q${cx + 124},${hy - 144} ${cx + 120},${hy - 6}`, 14, '#2a2a36'),
      ...[-1, 1].flatMap(s => [rect(cx + s * 122 - 30, hy - 44, 60, 100, '#2a2a36', 6, 22), rect(cx + s * 122 - (s < 0 ? 30 : -14) - (s < 0 ? 0 : 16), hy - 34, 16, 80, '#3fe0c0', 4, 6), hl(`M${cx + s * 122 - 12},${hy - 30} L${cx + s * 122 - 12},${hy + 20}`, 5, .4)])],
    details: ({ cx, top, bot }) => [L(`M${cx - 16},${top + 10} q-6,40 2,90 M${cx + 16},${top + 10} q6,40 -2,90`, 4, '#d6d8e0'), circ(cx - 14, top + 104, 5, '#d6d8e0', 2.4), circ(cx + 14, top + 104, 5, '#d6d8e0', 2.4),
      txt(cx, top + 196, '{ }', 44, '#3fe0c0'), P(`M${cx - 70},${bot - 150} L${cx + 70},${bot - 150} L${cx + 80},${bot - 40} L${cx - 80},${bot - 40} Z`, '#4a4e5c', INK, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 270, 26), B.arm(1, B.cx + 130, B.top + 200, 30)] }),
    props: ({ cx, top }) => { const x = cx - 120, y = top + 270; return [rot(-8, x, y, [rect(x - 110, y - 160, 160, 110, '#c9ccd6', 6, 10), circ(x - 30, y - 105, 16, '#3fe0c0', 4), rect(x - 120, y - 50, 180, 20, '#aeb4c2', 5, 6), hl(`M${x - 96},${y - 146} L${x + 30},${y - 146}`, 6, .5),
      txt(x - 70, y - 64, '01', 16, '#6e7486')]), fist(x, y - 40, 13)]; },
    over: ({ cx, top }) => { const x = cx + 130, y = top + 200; return [rect(x - 6, y - 76, 96, 120, '#e8476e', 6, 10), `<path d="M${x + 88},${y - 50} q40,0 40,30 q0,30 -40,30" fill="none" stroke="${INK}" stroke-width="18"/><path d="M${x + 88},${y - 50} q40,0 40,30 q0,30 -40,30" fill="none" stroke="#e8476e" stroke-width="8"/>`,
      ell(x + 42, y - 76, 48, 10, '#5a3a22', INK, 4), txt(x + 42, y - 4, 'MORE', 22, '#fff'), hl(`M${x + 8},${y - 60} L${x + 8},${y + 30}`, 6, .4), ...[0, 24, 48].map(t => L(`M${x + 18 + t},${y - 96} q-12,-18 0,-36 q12,-18 0,-36`, 4.5, '#b9b2c2')), fist(x, y, 14)]; } },

  // 6 BARISTA — knit beanie with pompom, apron, latte-art cup held high
  { name: 'barista', label: 'Barista', form: 'lady', coat: '#2f2f3a', face: ['female', 'sassy'], hair: 'bob',
    hat: ({ cx, hy }) => { const Y = '#d9a43a', o = [fillPts([[cx - 104, hy - 70], [cx - 96, hy - 130], [cx - 50, hy - 168], [cx, hy - 176], [cx + 50, hy - 168], [cx + 96, hy - 130], [cx + 104, hy - 70], [cx, hy - 84]], Y, 6)];
      for (let k = -4; k <= 4; k++) o.push(L(`M${cx + k * 20},${hy - 96} Q${cx + k * 22},${hy - 140} ${cx + k * 12},${hy - 168 + Math.abs(k) * 4}`, 3, '#a8781e'));
      o.push(P(`M${cx - 112},${hy - 96} Q${cx},${hy - 116} ${cx + 112},${hy - 96} L${cx + 112},${hy - 56} Q${cx},${hy - 76} ${cx - 112},${hy - 56} Z`, '#e8b850', INK, 6), ...[-90, -60, -30, 0, 30, 60, 90].map(t => L(`M${cx + t},${hy - 98 - (1 - Math.abs(t) / 100) * 12} l0,32`, 3, '#a8781e')));
      o.push(cloud([[cx - 16, hy - 196, 26], [cx + 14, hy - 200, 26], [cx, hy - 216, 24], [cx - 2, hy - 186, 22]], '#f3efe6', 5)); return o; },
    details: ({ cx, top, bot }) => [P(`M${cx - 54},${top + 40} L${cx + 54},${top + 40} L${cx + 60},${top + 150} L${cx + 120},${top + 170} L${cx + 136},${bot + 10} L${cx - 136},${bot + 10} L${cx - 120},${top + 170} L${cx - 60},${top + 150} Z`, '#9a5a34', INK, 5),
      L(`M${cx - 50},${top + 40} L${cx - 40},${top - 10} M${cx + 50},${top + 40} L${cx + 40},${top - 10}`, 8, '#9a5a34'), rect(cx - 50, top + 200, 100, 60, '#87492a', 4, 6), L(`M${cx - 30},${top + 202} l0,-26`, 6, '#f3efe6'), ell(cx + 16, top + 90, 14, 20, '#f3efe6', INK, 3), L(`M${cx + 16},${top + 72} q-8,18 0,36`, 3, INK),
      rect(cx - 160, top + 160, 320, 14, '#6e3a1e', 3.4, 2)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 166, B.top + 70, 30)] }),
    over: ({ cx, top }) => { const x = cx + 170, y = top + 46; return [ell(x, y + 34, 74, 16, '#f6f7f9', INK, 5), P(`M${x - 56},${y - 50} L${x + 56},${y - 50} Q${x + 52},${y + 22} ${x},${y + 26} Q${x - 52},${y + 22} ${x - 56},${y - 50} Z`, '#f6f7f9', INK, 6),
      `<path d="M${x + 50},${y - 34} q34,0 30,22 q-4,18 -36,14" fill="none" stroke="${INK}" stroke-width="16"/><path d="M${x + 50},${y - 34} q34,0 30,22 q-4,18 -36,14" fill="none" stroke="#f6f7f9" stroke-width="6"/>`,
      ell(x, y - 50, 56, 18, '#c08a5a', INK, 5), P(`M${x},${y - 38} C${x - 30},${y - 50} ${x - 22},${y - 68} ${x},${y - 56} C${x + 22},${y - 68} ${x + 30},${y - 50} ${x},${y - 38} Z`, '#fbf3e6', 'none', 0), L(`M${x},${y - 66} L${x},${y - 40}`, 2.4, '#c08a5a'),
      hl(`M${x - 40},${y - 30} Q${x - 36},${y} ${x - 16},${y + 12}`, 6, .6), ...[-20, 10].map(t => L(`M${x + t},${y - 80} q-12,-18 0,-36 q12,-18 0,-36`, 4.5, '#b9b2c2')), star4(x + 60, y - 110, 16), fist(cx + 166, top + 70, 13)]; } },

  // 7 MECHANIC — backwards cap, coverall, giant wrench on the shoulder, grease
  { name: 'mechanic', label: 'Mechanic', form: 'bigboi', coat: '#5a6d8a', face: 'sideeye',
    hat: ({ cx, hy }) => [P(`M${cx - 40},${hy - 110} Q${cx - 120},${hy - 120} ${cx - 196},${hy - 92} Q${cx - 200},${hy - 70} ${cx - 176},${hy - 70} Q${cx - 120},${hy - 84} ${cx - 50},${hy - 74} Z`, '#3d7a3a', INK, 6),
      fillPts([[cx - 106, hy - 50], [cx - 100, hy - 106], [cx - 50, hy - 140], [cx, hy - 146], [cx + 50, hy - 140], [cx + 100, hy - 106], [cx + 106, hy - 50], [cx, hy - 62]], '#4f9a3a', 7), circ(cx, hy - 144, 9, '#3d7a3a', 3.4),
      P(`M${cx - 30},${hy - 66} Q${cx},${hy - 76} ${cx + 30},${hy - 66} L${cx + 30},${hy - 56} L${cx - 30},${hy - 56} Z`, '#3d7a3a', INK, 3.4), ...[-1, 1].map(s => L(`M${cx + s * 6},${hy - 140} Q${cx + s * 50},${hy - 110} ${cx + s * 60},${hy - 60}`, 3, '#33702a')), hl(`M${cx - 78},${hy - 100} Q${cx - 50},${hy - 130} ${cx - 20},${hy - 136}`, 8, .45),
      ell(cx + 70, hy - 110, 16, 8, '#2a2a36', 'none', 0)],
    faceTop: ({ cx, hy }) => [P(`M${cx - 74},${hy + 30} q20,-8 36,4 q-16,10 -36,-4 Z`, '#3a3440', 'none', 0), L(`M${cx + 52},${hy + 52} l28,-4`, 7, '#3a3440'), ell(cx + 86, hy - 50, 9, 6, '#3a3440')],
    details: ({ cx, top, bot }) => [L(`M${cx},${top + 10} L${cx},${bot}`, 5), P(`M${cx - 70},${top - 8} L${cx},${top + 40} L${cx + 70},${top - 8} Z`, '#4a5b76', INK, 4), rect(cx + 50, top + 80, 110, 40, '#f6f7f9', 4, 8), txt(cx + 105, top + 110, 'GUS', 28, '#c23a2f'),
      rect(cx - 160, top + 90, 70, 70, '#4a5b76', 4, 6), P(`M${cx - 150},${top + 92} q10,-30 30,-26 q20,4 14,28 Z`, RED, INK, 3.4), rect(cx - 240, top + 250, 480, 30, '#3a4860', 4, 2),
      ...[[-150, 320, 40, 18], [90, 380, 34, 14], [-40, 200, 26, 12], [140, 210, 20, 10]].map(([dx, dy, rx, ry]) => ell(cx + dx, top + dy, rx, ry, '#2e2a32', 'none', 0)).map(e => e.replace('/>', ' opacity=".55"/>'))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 194, B.top + 40, 40)] }),
    over: ({ cx, top }) => { const x = cx + 194, y = top + 40, G = STEEL; return [rot(-5, x, y, [rect(x - 22, y - 300, 44, 380, G, 6, 18), hl(`M${x - 8},${y - 260} L${x - 8},${y + 50}`, 7, .6),
      P(`M${x - 56},${y - 320} Q${x - 70},${y - 400} ${x - 20},${y - 420} L${x - 24},${y - 360} L${x + 24},${y - 360} L${x + 20},${y - 420} Q${x + 70},${y - 400} ${x + 56},${y - 320} Q${x + 30},${y - 290} ${x},${y - 290} Q${x - 30},${y - 290} ${x - 56},${y - 320} Z`, G, INK, 6),
      circ(x, y + 100, 40, G, 6), circ(x, y + 100, 20, '#e9e4da', 5), txt(x, y - 100, '24', 28, '#6e7486', { a: 90 })]), fist(x, y, 17)]; } },

  // 8 PLUMBER — teal cap with a water-drop badge, giant plunger, tool belt (no moustache, no overalls)
  { name: 'plumber', label: 'Plumber', form: 'standard', coat: '#e07a2e', face: 'disgust',
    hat: ({ cx, hy }) => { const T = '#2f9e96'; return [P(`M${cx - 20},${hy - 62} Q${cx + 100},${hy - 76} ${cx + 176},${hy - 44} Q${cx + 182},${hy - 24} ${cx + 156},${hy - 26} Q${cx + 90},${hy - 46} ${cx - 10},${hy - 40} Z`, '#24786f', INK, 6),
      fillPts([[cx - 106, hy - 46], [cx - 100, hy - 104], [cx - 50, hy - 140], [cx, hy - 146], [cx + 50, hy - 140], [cx + 100, hy - 104], [cx + 106, hy - 46], [cx, hy - 58]], T, 7), circ(cx, hy - 144, 9, '#24786f', 3.4),
      circ(cx - 6, hy - 96, 28, '#f6f7f9', 4.5), drop(cx - 6, hy - 90, 15, '#4fb3e8'), hl(`M${cx - 80},${hy - 96} Q${cx - 60},${hy - 126} ${cx - 34},${hy - 134}`, 8, .5)]; },
    behind: ({ cx }) => [...[[-150, 120], [170, 60], [-180, 260]].map(([dx, y]) => L(`M${cx + dx},${y} q-10,-20 0,-40 q10,-20 0,-40`, 5, '#7ab84a'))],
    details: ({ cx, top, bot }) => [P(`M${cx - 30},${top - 10} L${cx - 40},${top + 40} L${cx},${top + 20} L${cx + 40},${top + 40} L${cx + 30},${top - 10} Z`, '#c0601e', INK, 4), L(`M${cx},${top + 20} L${cx},${bot}`, 4), ...[0, 1, 2].map(k => circ(cx + 12, top + 70 + k * 50, 6, '#f3efe6', 3)),
      rect(cx - 74, top + 60, 46, 40, '#c0601e', 3.4, 3), ell(cx + 60, top + 190, 20, 12, '#5a4a3a', 'none', 0).replace('/>', ' opacity=".5"/>')],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 150, B.top + 40, 30)] }),
    props: ({ cx, bot, hdL }) => { const y = bot - 40; return [rect(cx - 150, y, 300, 36, '#7a4a28', 5, 4), rect(cx - 16, y + 2, 32, 32, GOLD, 4, 4), rect(cx - 140, y + 30, 60, 60, '#8f5a32', 5, 6), rect(cx + 80, y + 30, 56, 52, '#8f5a32', 5, 6),
      pole(cx - 124, y + 30, cx - 120, y - 40, WOOD, 9), rect(cx - 150, y - 60, 60, 26, STEEL, 4, 4), P(`M${cx + 100},${y + 30} l-4,-70 l-14,-10 l20,-10 l20,10 l-8,10 l2,70 Z`, '#d8473c', INK, 4),
    ]; },
    over: ({ cx, top }) => { const x = cx + 150, y = top + 40, R2 = '#c2362c'; return [pole(x - 4, y + 80, x + 30, y - 260, WOOD, 14), P(`M${x - 34},${y - 266} Q${x - 30},${y - 340} ${x + 40},${y - 340} Q${x + 110},${y - 336} ${x + 100},${y - 266} Q${x + 34},${y - 250} ${x - 34},${y - 266} Z`, R2, INK, 6),
      ell(x + 33, y - 262, 70, 14, '#8f2219', INK, 5), hl(`M${x - 10},${y - 290} Q${x},${y - 324} ${x + 30},${y - 330}`, 7, .5), drop(x - 30, y - 220, 11, '#8a9a4a'), drop(x + 100, y - 230, 9, '#8a9a4a'), fist(x, y, 16)]; } },

  // 9 DENTIST — mask on the chin, giant sparkly tooth, buzzing drill
  { name: 'dentist', label: 'Dentist', form: 'lady', coat: '#8fd0d6', face: ['female', 'smug'], hair: 'bob',
    faceTop: ({ cx, hy }) => [L(`M${cx - 74},${hy + 74} Q${cx - 104},${hy + 30} ${cx - 98},${hy - 10} M${cx + 74},${hy + 74} Q${cx + 104},${hy + 30} ${cx + 98},${hy - 10}`, 4, '#e8eef2'),
      P(`M${cx - 76},${hy + 64} Q${cx},${hy + 54} ${cx + 76},${hy + 64} L${cx + 66},${hy + 118} Q${cx},${hy + 132} ${cx - 66},${hy + 118} Z`, '#a8d8f0', INK, 4.5), ...[0, 1, 2].map(k => L(`M${cx - 66},${hy + 78 + k * 14} Q${cx},${hy + 70 + k * 14} ${cx + 66},${hy + 78 + k * 14}`, 2.6, '#7ab4d0'))],
    details: ({ cx, top, bot }) => [P(`M${cx - 40},${top - 6} L${cx},${top + 54} L${cx + 40},${top - 6} Z`, '#6ab8c0', INK, 4), rect(cx + 20, top + 90, 46, 40, '#7cc4cc', 3.4, 3), L(`M${cx + 30},${top + 92} l0,-20`, 6, '#e8476e'),
      rect(cx - 170, top + 180, 340, 18, '#5aa4ac', 3.4, 2), ...[0, 1, 2, 3, 4].map(k => L(`M${cx - 100 + k * 50},${top + 210} L${cx - 125 + k * 62},${bot}`, 3, '#73b8c0'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 150, 20), B.arm(1, B.cx + 186, B.top + 70, 30)] }),
    props: ({ cx, top }) => { const x = cx - 150, y = top + 130; return [P(`M${x - 74},${y - 70} Q${x - 80},${y - 130} ${x - 34},${y - 130} Q${x - 10},${y - 128} ${x},${y - 112} Q${x + 10},${y - 128} ${x + 34},${y - 130} Q${x + 80},${y - 130} ${x + 74},${y - 70} Q${x + 70},${y - 10} ${x + 50},${y + 60} Q${x + 40},${y + 100} ${x + 24},${y + 96} Q${x + 10},${y + 90} ${x + 8},${y + 30} Q${x},${y + 10} ${x - 8},${y + 30} Q${x - 10},${y + 90} ${x - 24},${y + 96} Q${x - 40},${y + 100} ${x - 50},${y + 60} Q${x - 70},${y - 10} ${x - 74},${y - 70} Z`, '#fbfbfd', INK, 7),
      hl(`M${x - 54},${y - 90} Q${x - 56},${y - 40} ${x - 40},${y + 10}`, 9, .9), L(`M${x - 20},${y - 70} q20,10 40,0`, 4, '#c9c3d4'), star4(x + 70, y - 140, 18), star4(x - 80, y - 150, 11), fist(cx - 120, top + 150, 13)]; },
    over: ({ cx, top }) => { const x = cx + 186, y = top + 70; return [rot(-14, x, y, [rect(x - 18, y - 30, 36, 110, '#f6f7f9', 5, 14), rect(x - 12, y - 120, 24, 96, '#f6f7f9', 5, 10), rect(x - 4, y - 160, 8, 44, SILVER, 3.4, 2), circ(x, y - 162, 6, STEEL, 3), ribbon(`M${x},${y + 80} q0,60 -40,100`, 8, '#9aa3b5', 3), L(`M${x - 10},${y + 20} l20,0`, 4, '#6ab8c0')]),
      fist(x, y, 13), ...[0, 1, 2].map(k => L(`M${cx + 222},${top - 120 + k * 26} l18,${(k - 1) * 10}`, 4.5)), txt(cx + 196, top - 170, 'BZZZ', 36, INK, { a: -12, stroke: '#fff' })]; } },

  // 10 LIFEGUARD — red-white ring buoy, whistle on lanyard, deal-with-it shades, zinc nose
  { name: 'lifeguard', label: 'Lifeguard', form: 'chad', coat: '#d8473c', face: 'cool',
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 50} Q${cx - 130},${hy - 120} ${cx - 60},${hy - 150} Q${cx - 30},${hy - 190} ${cx + 10},${hy - 160} Q${cx + 50},${hy - 200} ${cx + 80},${hy - 150} Q${cx + 130},${hy - 130} ${cx + 106},${hy - 50} Q${cx + 70},${hy - 110} ${cx},${hy - 104} Q${cx - 70},${hy - 110} ${cx - 104},${hy - 50} Z`, '#f2cf5a', INK, 6),
      L(`M${cx - 40},${hy - 150} q20,10 30,40 M${cx + 30},${hy - 156} q16,16 16,44`, 3.4, '#c9a030'), hl(`M${cx - 86},${hy - 100} Q${cx - 70},${hy - 136} ${cx - 40},${hy - 146}`, 7, .6)],
    faceTop: ({ cx, hy }) => [P(`M${cx - 10},${hy + 10} q10,-6 22,0 l-2,16 q-10,4 -18,0 Z`, '#fff', INK, 3)],
    details: ({ cx, top }) => [txt(cx, top + 220, 'GUARD', 52, '#fff'), L(`M${cx - 130},${top + 250} L${cx + 130},${top + 250}`, 6, '#fff')],
    arms: B => ({ front: [B.arm(-1, B.cx - 190, B.top + 180, 30), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top, hdR }) => { const x = cx - 190, y = top + 220; const segs = [...Array(8)].map((_, k) => { const a0 = k * Math.PI / 4, a1 = a0 + Math.PI / 4, r = 70; return `<path d="M${f1(x + Math.cos(a0) * r)},${f1(y + Math.sin(a0) * r)} A${r},${r} 0 0,1 ${f1(x + Math.cos(a1) * r)},${f1(y + Math.sin(a1) * r)}" fill="none" stroke="${k % 2 ? '#fff' : '#e0453a'}" stroke-width="34"/>`; }).join('');
      return [L(`M${cx - 60},${top + 4} Q${cx - 30},${top + 150} ${cx + 10},${top + 160} M${cx + 60},${top + 4} Q${cx + 40},${top + 140} ${cx + 10},${top + 160}`, 4, '#2f8fd0'), P(`M${cx - 6},${top + 156} L${cx + 40},${top + 152} Q${cx + 58},${top + 154} ${cx + 58},${top + 170} Q${cx + 56},${top + 186} ${cx + 38},${top + 184} L${cx - 6},${top + 172} Z`, SILVER, INK, 4),
        `<circle cx="${x}" cy="${y}" r="87" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="53" fill="none" stroke="${INK}" stroke-width="6"/>`, segs, `<circle cx="${x}" cy="${y}" r="88" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="52" fill="none" stroke="${INK}" stroke-width="6"/>`,
        ...[0, 1, 2, 3].map(k => { const a = Math.PI / 8 + k * Math.PI / 2; return L(`M${f1(x + Math.cos(a) * 52)},${f1(y + Math.sin(a) * 52)} L${f1(x + Math.cos(a) * 88)},${f1(y + Math.sin(a) * 88)}`, 6, '#e9e4da'); }), hl(`M${x - 66},${y - 30} A72,72 0 0,1 ${x - 30},${y - 66}`, 7, .6), fist(x, y - 70, 20),
        ...[[-1, 0]].map(() => '')]; } },
];
