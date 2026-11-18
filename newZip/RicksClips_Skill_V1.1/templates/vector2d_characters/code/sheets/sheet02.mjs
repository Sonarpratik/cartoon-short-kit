// SHEET 02 — OLD ASIA (built on the lead's castkit, same techniques as sheet01)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, GOLD, GOLDL, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4, drop } from '../castkit.mjs';
export const TITLE = 'Cast sheet 02: Old Asia';

const LAQ = '#2b2733', HAIR = '#1d1a26', BLUE = '#2f5fae', JADE = '#3fae7a', PINK = '#ef8fb0', ORANGE = '#ef8a22', CLAY = '#b9805a', CLAYD = '#94603c', CLAYL = '#d6a47c';
const rot = (a, x, y, s) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${s}</g>`;
// ink-edged stroke (cords, bow limbs, strands)
const cord = (d, col, w = 8) => L(d, w + 7, INK) + L(d, w, col);
// row of beads along a quadratic curve
const beads = (x0, y0, qx, qy, x1, y1, n, r, cols) => [...Array(n)].map((_, k) => { const t = k / (n - 1), u = 1 - t, x = u * u * x0 + 2 * u * t * qx + t * t * x1, y = u * u * y0 + 2 * u * t * qy + t * t * y1; return circ(x, y, r, cols[k % cols.length], Math.max(2, r * .45)); }).join('');
// sakura flower
const blossom = (x, y, r, col = PINK) => [0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return ell(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, r * .5, col, INK, 2); }).join('') + ell(x, y, r * .25, r * .25, GOLD);
// hanging wide sleeve shape (behind the body), s = side
const sleeve = (cx, top, s, col, w = 120, h = 250, x0 = 40) => P(`M${cx + s * x0},${top + 20} Q${cx + s * (x0 + w * .7)},${top + 20} ${cx + s * (x0 + w)},${top + 90} L${cx + s * (x0 + w * .95)},${top + h} Q${cx + s * (x0 + w * .6)},${top + h + 20} ${cx + s * (x0 + 30)},${top + h - 10} Z`, col, INK, 5);

export const CAST = [
  // 1 SAMURAI: lacquered kabuto with giant golden crescent horns, laced armour, katana raised
  { name: 'samurai', label: 'Samurai', form: 'chad', coat: '#a3302b', face: 'rage',
    hat: ({ cx, hy }) => { const o = [];
      // golden kuwagata horns (behind the bowl)
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 14},${hy - 64} Q${cx + s * 150},${hy - 110} ${cx + s * 150},${hy - 320} Q${cx + s * 168},${hy - 300} ${cx + s * 166},${hy - 270} Q${cx + s * 150},${hy - 110} ${cx + s * 10},${hy - 94} Z`, GOLD, INK, 6), hl(`M${cx + s * 46},${hy - 88} Q${cx + s * 134},${hy - 124} ${cx + s * 146},${hy - 270}`, 5, .55));
      // shikoro neck guard: stepped lames flaring out
      for (const s of [-1, 1]) for (let k = 2; k >= 0; k--) { const y0 = hy - 46 + k * 30; o.push(poly([[cx + s * 92, y0], [cx + s * (122 + k * 8), y0 + 4], [cx + s * (130 + k * 8), y0 + 36], [cx + s * 98, y0 + 32]], k % 2 ? '#3d3848' : LAQ, 5), ...[0, 1, 2].map(j => L(`M${cx + s * (104 + j * 10 + k * 3)},${y0 + 10} l0,14`, 3.4, '#4f86d6'))); }
      // bowl with ridges
      o.push(fillPts([[cx - 110, hy - 30], [cx - 104, hy - 92], [cx - 52, hy - 126], [cx, hy - 132], [cx + 52, hy - 126], [cx + 104, hy - 92], [cx + 110, hy - 30], [cx + 70, hy - 46], [cx, hy - 52], [cx - 70, hy - 46]], LAQ, 7));
      for (const t of [-.66, -.33, 0, .33, .66]) o.push(L(`M${cx + t * 30},${hy - 128} Q${cx + t * 100},${hy - 100} ${cx + t * 108},${hy - 52}`, 3, '#4a4458'));
      o.push(hl(`M${cx - 80},${hy - 92} Q${cx - 34},${hy - 122} ${cx + 10},${hy - 120}`, 8, .4));
      // fukigaeshi turn-backs + gold peak
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 86},${hy - 70} Q${cx + s * 132},${hy - 84} ${cx + s * 138},${hy - 52} Q${cx + s * 124},${hy - 30} ${cx + s * 96},${hy - 34} Z`, LAQ, INK, 5), L(`M${cx + s * 96},${hy - 66} Q${cx + s * 126},${hy - 74} ${cx + s * 128},${hy - 54}`, 4, GOLD));
      o.push(brush(cx - 104, hy - 42, cx, hy - 60, cx + 104, hy - 42, 13, { col: GOLD, tip: .8 }), P(`M${cx - 26},${hy - 58} L${cx},${hy - 96} L${cx + 26},${hy - 58} Z`, GOLD, INK, 4.5), circ(cx, hy - 104, 18, RED, 5), hl(`M${cx - 10},${hy - 112} q6,-6 14,-4`, 4, .6));
      return o; },
    details: ({ cx, top }) => [rect(cx - 200, top - 10, 400, 80, LAQ, 5, 2), L(`M${cx - 200},${top + 66} L${cx + 200},${top + 66}`, 6, GOLD),
      ...[0, 1, 2, 3, 4, 5].flatMap(k => [rect(cx - 200, top + 76 + k * 34, 400, 34, k % 2 ? '#8e2823' : '#a3302b', 4, 1), ...[...Array(18)].map((_, j) => L(`M${cx - 186 + j * 22},${top + 84 + k * 34} l0,18`, 4, '#4f86d6'))]),
      rect(cx - 170, top + 280, 340, 22, '#f0e6cc', 4, 1), ...[-1, 0, 1].map(j => rect(cx - 52 + j * 104 - 50, top + 302, 100, 60, j ? '#8e2823' : '#a3302b', 4, 2)), ...[-1, 0, 1].flatMap(j => [0, 1, 2].map(i => L(`M${cx + j * 104 - 70 + i * 20},${top + 310} l0,44`, 4, '#4f86d6')))],
    arms: B => ({ front: [B.arm(-1, B.cx + 20, B.top + 200, -40), B.arm(1, B.cx + 60, B.top + 166, 24)] }),
    props: ({ cx, top }) => [-1, 1].map(s => rot(s * 16, cx + s * 160, top + 40, [0, 1, 2].map(k => rect(cx + s * 160 - 46, top + 20 + k * 38, 92, 40, k % 2 ? '#8e2823' : '#a3302b', 4, 2) + [0, 1, 2].map(j => L(`M${cx + s * 160 - 24 + j * 24},${top + 28 + k * 38} l0,22`, 4, '#4f86d6')).join('')).join(''))),
    over: ({ cx, top }) => { const o = [], hx = cx + 92, hy0 = top + 140, tx = cx + 232, ty = top - 50;
      // katana: curved blade up and out to the right, black wrapped grip, gold tsuba
      const bd = `M${hx},${hy0} Q${(hx + tx) / 2 + 14},${(hy0 + ty) / 2 + 14} ${tx},${ty}`; o.push(L(bd, 21, INK), L(bd, 13, STEEL), L(`M${hx + 10},${hy0 - 12} Q${(hx + tx) / 2 + 12},${(hy0 + ty) / 2 + 6} ${tx - 8},${ty + 2}`, 3.4, '#fff'), P(`M${tx - 6},${ty - 8} L${tx + 2},${ty - 2} L${tx - 4},${ty + 8} Z`, STEEL, INK, 3));
      o.push(cord(`M${cx + 6},${top + 230} L${hx - 2},${hy0 + 4}`, LAQ, 15), ...[0, 1, 2, 3].map(k => P(`M${cx + 18 + k * 17},${top + 220 - k * 19} l7,-7 l7,7 l-7,7 Z`, '#f0e6cc', 'none', 0)), rot(-38, hx, hy0 + 3, ell(hx, hy0 + 3, 28, 10, GOLD, INK, 4.5)));
      o.push(fist(cx + 20, top + 200, 16), fist(cx + 60, top + 166, 16));
      return o; } },

  // 2 NINJA: full black hood with eye slot, long knot tails, sword over the shoulder, shuriken
  { name: 'ninja', label: 'Ninja', form: 'noodle', coat: '#2a2a38', face: 'sideeye',
    headBack: ({ cx, hy }) => [P(`M${cx + 70},${hy - 70} C${cx + 120},${hy - 120} ${cx + 150},${hy - 40} ${cx + 176},${hy - 92} L${cx + 172},${hy - 52} C${cx + 146},${hy} ${cx + 116},${hy - 60} ${cx + 78},${hy - 34} Z`, '#2a2a38', INK, 5),
      P(`M${cx + 70},${hy - 40} C${cx + 110},${hy - 20} ${cx + 140},${hy + 50} ${cx + 170},${hy + 20} L${cx + 172},${hy + 58} C${cx + 132},${hy + 92} ${cx + 110},${hy + 10} ${cx + 66},${hy - 4} Z`, '#2a2a38', INK, 5),
      hl(`M${cx + 120},${hy - 84} q24,10 44,-14`, 4, .3), hl(`M${cx + 116},${hy + 4} q24,40 56,32`, 4, .3)],
    hat: ({ cx, hy }) => { const o = [];
      const outer = smooth([[cx, hy - 114], [cx + 82, hy - 88], [cx + 114, hy - 14], [cx + 108, hy + 60], [cx + 60, hy + 108], [cx, hy + 118], [cx - 60, hy + 108], [cx - 108, hy + 60], [cx - 114, hy - 14], [cx - 82, hy - 88]]);
      const slot = `M${cx - 84},${hy - 30} Q${cx - 84},${hy - 50} ${cx - 60},${hy - 50} L${cx + 60},${hy - 50} Q${cx + 84},${hy - 50} ${cx + 84},${hy - 30} L${cx + 84},${hy - 4} Q${cx + 84},${hy + 14} ${cx + 60},${hy + 14} L${cx - 60},${hy + 14} Q${cx - 84},${hy + 14} ${cx - 84},${hy - 4} Z`;
      o.push(`<path d="${outer} ${slot}" fill="#2a2a38" fill-rule="evenodd" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`);
      o.push(L(`M${cx - 70},${hy + 46} Q${cx},${hy + 66} ${cx + 70},${hy + 44}`, 4, '#4a4a60'), L(`M${cx - 50},${hy + 80} Q${cx},${hy + 94} ${cx + 50},${hy + 78}`, 4, '#4a4a60'), hl(`M${cx - 86},${hy - 64} Q${cx - 40},${hy - 104} ${cx + 10},${hy - 104}`, 9, .28));
      o.push(P(`M${cx + 86},${hy - 76} q20,-6 28,10 q-4,22 -26,18 Z`, '#3a3a4c', INK, 4.5), drop(cx + 108, hy - 26, 12));
      return o; },
    details: ({ cx, top }) => [L(`M${cx - 50},${top + 6} L${cx + 14},${top + 110} M${cx + 50},${top + 6} L${cx - 10},${top + 96}`, 5, '#4a4a60'), rect(cx - 90, top + 200, 180, 34, '#6a2e3a', 4, 2), L(`M${cx + 20},${top + 234} q10,40 -6,70 M${cx + 32},${top + 234} q16,36 8,64`, 6, '#6a2e3a'), L(`M${cx - 30},${top + 260} q4,60 -4,120 M${cx + 34},${top + 310} q0,40 6,80`, 3, '#4a4a60')],
    behind: ({ cx, top }) => [cord(`M${cx + 60},${top + 300} L${cx - 126},${top - 6}`, LAQ, 20), rot(-58, cx - 132, top - 16, rect(cx - 160, top - 24, 56, 16, GOLD, 4, 3)), cord(`M${cx - 136},${top - 22} L${cx - 184},${top - 104}`, '#6a2e3a', 13), ...[0, 1, 2].map(k => P(`M${cx - 148 - k * 11},${top - 44 - k * 20} l8,-6 l4,10 Z`, '#e8e2d4', 'none', 0))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 146, B.top + 90, -10)] }),
    props: ({ cx, top }) => { const x = cx + 160, y = top + 60, o = [];
      let d = ''; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 8, r = k % 2 ? 16 : 52; d += (k ? 'L' : 'M') + f1(x + Math.cos(a) * r) + ',' + f1(y + Math.sin(a) * r); }
      o.push(P(d + 'Z', STEEL, INK, 5), circ(x, y, 9, '#5a5f70', 3.5), hl(`M${x - 26},${y - 30} l14,14`, 4, .7), fist(cx + 146, top + 90, 14));
      o.push(...[[-46, -60], [-60, -20], [-30, -84]].map(([dx, dy]) => L(`M${x + dx},${y + dy} l-16,-6`, 4)));
      return o; } },

  // 3 GEISHA: tall black shimada hair with hairpins, giant red parasol, kimono + obi
  { name: 'geisha', label: 'Geisha', form: 'lady', coat: '#3a6fb0', face: ['female', 'blowKiss'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 126, hy - 20], [cx - 132, hy + 40], [cx - 104, hy + 84], [cx, hy + 70], [cx + 104, hy + 84], [cx + 132, hy + 40], [cx + 126, hy - 20], [cx, hy - 100]], HAIR, 6)],
    hat: ({ cx, hy }) => { const o = [];
      // kanzashi pins behind the hair mass
      for (const s of [-1, 1]) o.push(cord(`M${cx + s * 40},${hy - 150} L${cx + s * 122},${hy - 186}`, GOLD, 5), circ(cx + s * 124, hy - 187, 10, s < 0 ? RED : JADE, 4));
      // side wings + top loaf (mage) + front dome
      for (const s of [-1, 1]) o.push(fillPts([[cx + s * 86, hy - 70], [cx + s * 128, hy - 64], [cx + s * 142, hy - 10], [cx + s * 128, hy + 36], [cx + s * 100, hy + 30], [cx + s * 96, hy - 20]], HAIR, 6));
      o.push(fillPts([[cx - 78, hy - 120], [cx - 96, hy - 176], [cx - 50, hy - 218], [cx, hy - 222], [cx + 50, hy - 218], [cx + 96, hy - 176], [cx + 78, hy - 120]], HAIR, 6), rect(cx - 30, hy - 210, 60, 70, '#d8473c', 4.5, 10), L(`M${cx - 30},${hy - 176} L${cx + 30},${hy - 176}`, 3, '#8f2219'));
      o.push(fillPts([[cx - 108, hy - 40], [cx - 104, hy - 100], [cx - 52, hy - 134], [cx, hy - 140], [cx + 52, hy - 134], [cx + 104, hy - 100], [cx + 108, hy - 40], [cx + 60, hy - 64], [cx, hy - 52], [cx - 60, hy - 64]], HAIR, 7));
      o.push(hl(`M${cx - 84},${hy - 96} Q${cx - 40},${hy - 128} ${cx + 10},${hy - 128}`, 8, .3), hl(`M${cx - 70},${hy - 178} Q${cx - 50},${hy - 206} ${cx - 20},${hy - 212}`, 6, .3));
      // gold comb + flower pins with dangles
      o.push(P(`M${cx - 56},${hy - 132} Q${cx},${hy - 160} ${cx + 56},${hy - 132} L${cx + 50},${hy - 116} Q${cx},${hy - 140} ${cx - 50},${hy - 116} Z`, GOLD, INK, 4), ...[-40, -20, 0, 20, 40].map(t => L(`M${cx + t},${hy - 146 + Math.abs(t) * .3} l0,10`, 2.6, '#a8781c')));
      o.push(blossom(cx - 98, hy - 120, 30), blossom(cx - 70, hy - 150, 22, '#f6b8cc'));
      for (const k of [0, 1, 2]) { const x = cx - 112 + k * 16; o.push(L(`M${x},${hy - 104} L${x - 4},${hy - 20 + k * 14}`, 2.4), ...[0, 1, 2].map(j => ell(x - j * 1.4, hy - 84 + j * 22 + k * 5, 6, 7, j % 2 ? '#f6b8cc' : PINK, INK, 2))); }
      return o; },
    behind: ({ cx, top }) => { const x = cx + 92, y = top - 372, r = 156, o = [];
      o.push(circ(x, y, r, '#d8473c', 7), circ(x, y, r * .72, '#f3e3c3', 4), circ(x, y, r * .5, '#d8473c', 4));
      for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10; o.push(L(`M${f1(x + Math.cos(a) * 18)},${f1(y + Math.sin(a) * 18)} L${f1(x + Math.cos(a) * (r - 4))},${f1(y + Math.sin(a) * (r - 4))}`, 2.4, '#8f2219')); }
      o.push(circ(x, y, 18, WOOD, 4), hl(`M${x - r + 26},${y - 30} Q${x - r + 40},${y - r + 60} ${x - 30},${y - r + 22}`, 10, .35));
      o.push(sleeve(cx, top, -1, '#2f5f9e', 100, 260, 34), sleeve(cx, top, 1, '#2f5f9e', 100, 240, 34));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 10} L${cx},${top + 96} L${cx + 60},${top - 10} Z`, '#f6f1e6', INK, 4), L(`M${cx - 40},${top - 6} L${cx + 6},${top + 82}`, 6, RED),
      rect(cx - 200, top + 110, 400, 76, GOLD, 5, 2), L(`M${cx - 200},${top + 148} L${cx + 200},${top + 148}`, 6, '#d8473c'), ...[-60, 0, 60].map(t => L(`M${cx + t - 16},${top + 128} l16,10 l16,-10`, 3, '#a8781c')),
      ...[[-90, 240], [70, 270], [-30, 330], [110, 350], [-120, 360], [20, 220]].map(([dx, dy]) => blossom(cx + dx, top + dy, 18, '#f3efe6'))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 126, B.top + 130, 10)] }),
    props: ({ cx, top }) => [pole(cx + 128, top + 190, cx + 92, top - 372, WOOD, 9), fist(cx + 126, top + 130, 14)] },

  // 4 CHINESE EMPEROR: flat mianguan board crown with bead curtains, yellow dragon robe
  { name: 'emperor', label: 'Chinese Emperor', form: 'dad', coat: '#f2c230', face: 'evil',
    hat: ({ cx, hy }) => { const o = [];
      o.push(rect(cx - 56, hy - 136, 112, 76, LAQ, 6, 8), rect(cx - 58, hy - 82, 116, 18, GOLD, 4.5, 4), cord(`M${cx - 96},${hy - 106} L${cx + 96},${hy - 106}`, GOLD, 7), circ(cx - 98, hy - 106, 9, JADE, 3.5), circ(cx + 98, hy - 106, 9, JADE, 3.5));
      // board
      o.push(poly([[cx - 146, hy - 160], [cx + 146, hy - 160], [cx + 136, hy - 138], [cx - 136, hy - 138]], LAQ, 6), rect(cx - 137, hy - 140, 274, 12, '#c8372f', 4.5, 2), hl(`M${cx - 130},${hy - 152} L${cx + 40},${hy - 152}`, 4, .35));
      // bead curtains (short over the forehead, long at the sides)
      const cols = ['#d8473c', JADE, GOLDL];
      for (let k = 0; k <= 12; k++) { const x = cx - 120 + k * 20, n = Math.abs(x - cx) > 80 ? 6 : 3; o.push(L(`M${x},${hy - 128} L${x},${hy - 128 + n * 14}`, 2), beads(x, hy - 120, x, hy - 120 + n * 7, x, hy - 120 + (n - 1) * 14, n, 6, cols.slice(k % 3).concat(cols.slice(0, k % 3)))); }
      for (const s of [-1, 1]) o.push(cord(`M${cx + s * 100},${hy - 96} Q${cx + s * 120},${hy} ${cx + s * 104},${hy + 92}`, '#c8372f', 5), P(`M${cx + s * 104},${hy + 90} l-8,24 l16,0 Z`, '#c8372f', INK, 3));
      return o; },
    behind: ({ cx, top }) => [sleeve(cx, top, -1, '#f2c230', 110, 270, 40), sleeve(cx, top, 1, '#f2c230', 110, 270, 40)],
    details: ({ cx, top, bot }) => { const o = [], G = '#2f9e6a';
      o.push(P(`M${cx - 70},${top - 6} Q${cx},${top + 70} ${cx + 70},${top - 6} L${cx + 90},${top - 6} Q${cx},${top + 100} ${cx - 90},${top - 6} Z`, BLUE, INK, 4));
      // dragon: S body with scales, head + flaming pearl
      const d = `M${cx - 120},${top + 300} C${cx - 20},${top + 330} ${cx + 110},${top + 260} ${cx + 40},${top + 200} C${cx - 20},${top + 150} ${cx - 120},${top + 170} ${cx - 60},${top + 120}`;
      o.push(L(d, 34, INK), L(d, 24, G), L(d, 6, '#7fd0a0'), ...[0, 1, 2, 3, 4, 5, 6].map(k => L(`M${cx - 110 + k * 30},${top + 296 - Math.sin(k / 6 * Math.PI) * 30} l8,-10 l8,10`, 2.6, '#1d6a44')));
      o.push(circ(cx - 50, top + 112, 26, G, 4.5), P(`M${cx - 66},${top + 92} l-12,-26 l18,14 Z M${cx - 40},${top + 88} l4,-28 l10,22 Z`, '#d8473c', INK, 3), circ(cx - 42, top + 106, 6, '#fff', 2.4), L(`M${cx - 70},${top + 124} q-30,10 -40,-6 M${cx - 66},${top + 130} q-20,30 -46,26`, 3.4, '#d8473c'));
      o.push(circ(cx + 70, top + 110, 16, '#fff', 4), ...[[-1, -1], [1, -1], [0, -1.3]].map(([a, b]) => P(`M${cx + 70 + a * 10},${top + 98} q${a * 6},${b * 16} ${a * 2},${b * 24} q${8 - a * 4},${10} 8,22 Z`, '#ef8a22', INK, 2.4)));
      // jade belt + lishui wave hem
      o.push(rect(cx - 200, top + 232, 400, 26, '#c8372f', 4, 2), ...[-90, -30, 30, 90].map(t => rect(cx + t - 12, top + 236, 24, 18, JADE, 3, 3)));
      const hem = bot - 90; ['#2f5fae', '#d8473c', '#2f9e6a', '#f3efe6', '#7a4aa0'].forEach((c, k) => o.push(`<rect x="${cx - 240}" y="${hem + 30 + k * 12}" width="480" height="12" fill="${c}"/>`));
      o.push(...[...Array(9)].map((_, k) => P(`M${cx - 200 + k * 50},${hem + 32} q25,-34 50,0 Z`, '#2f5fae', INK, 3)));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 14, B.top + 220, 40), B.arm(1, B.cx + 14, B.top + 220, -40)] }),
    props: ({ cx, top }) => [fist(cx - 14, top + 220, 17), fist(cx + 14, top + 220, 17)] },

  // 5 MONGOL HORSE ARCHER: tall pointed fur hat, big recurve bow at full draw, quiver
  { name: 'archer', label: 'Mongol Archer', form: 'chad', coat: '#3d6fa8', face: 'sus',
    hat: ({ cx, hy }) => { const o = [], FUR = '#8a5a34';
      o.push(P(`M${cx + 6},${hy - 236} Q${cx + 60},${hy - 300} ${cx + 120},${hy - 268} Q${cx + 70},${hy - 270} ${cx + 30},${hy - 222} Z`, '#d8473c', INK, 5));
      o.push(fillPts([[cx - 84, hy - 96], [cx - 56, hy - 170], [cx - 12, hy - 232], [cx + 12, hy - 236], [cx + 40, hy - 190], [cx + 84, hy - 96]], '#d8473c', 7), L(`M${cx},${hy - 230} L${cx},${hy - 110}`, 6, GOLD), hl(`M${cx - 56},${hy - 120} Q${cx - 40},${hy - 180} ${cx - 10},${hy - 214}`, 8, .4), circ(cx, hy - 240, 12, GOLD, 4));
      // thick fur brim
      o.push(cloud([...Array(10)].map((_, k) => [cx - 126 + k * 28, hy - 70 - Math.pow(Math.abs(k - 4.5) / 4.5, 2) * 16, 30]), FUR, 5.5), ...[...Array(8)].map((_, k) => L(`M${cx - 100 + k * 28},${hy - 66 - Math.pow(Math.abs(k - 3.5) / 4.5, 2) * 14} l8,-10`, 3, '#5e3a1e')), hl(`M${cx - 110},${hy - 92} Q${cx - 60},${hy - 104} ${cx - 20},${hy - 102}`, 5, .3));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 10} Q${cx + 40},${top + 60} ${cx + 130},${top + 120} L${cx + 112},${top + 360} L${cx + 90},${top + 360} L${cx + 106},${top + 136} Q${cx + 30},${top + 86} ${cx - 80},${top - 10} Z`, GOLD, INK, 4),
      ...[0, 1, 2].map(k => circ(cx + 70 - k * 34, top + 110 - k * 30, 7, GOLD, 3)), rect(cx - 200, top + 240, 400, 42, ORANGE, 5, 2), L(`M${cx - 40},${top + 282} q-10,40 4,70 M${cx - 24},${top + 282} q6,44 -2,66`, 7, ORANGE), ...[[-110, 160], [-60, 330], [40, 180]].map(([dx, dy]) => L(`M${cx + dx},${top + dy} q20,-10 40,0 q20,10 40,0`, 3, '#2c5280'))],
    behind: ({ cx, top }) => [rot(14, cx + 180, top + 260, rect(cx + 156, top + 140, 48, 200, '#6e4527', 5, 8) + L(`M${cx + 156},${top + 180} L${cx + 204},${top + 180} M${cx + 156},${top + 300} L${cx + 204},${top + 300}`, 5, GOLD)),
      ...[0, 1, 2].map(k => rot(14, cx + 180, top + 260, L(`M${cx + 166 + k * 14},${top + 140} L${cx + 166 + k * 14},${top + 70}`, 4) + P(`M${cx + 166 + k * 14},${top + 70} l-8,20 l0,24 l8,-12 l8,12 l0,-24 Z`, k % 2 ? '#f3efe6' : '#d8473c', INK, 3)))],
    arms: B => ({ front: [B.arm(-1, B.cx - 206, B.top + 130, -10), B.arm(1, B.cx + 50, B.top + 120, 50)] }),
    props: ({ cx, top }) => { const gx = cx - 206, gy = top + 130, hx = cx + 50, hy0 = top + 120, o = [];
      const limb = s => `M${gx},${gy} C${gx + 34},${gy + s * 70} ${gx + 50},${gy + s * 150} ${gx + 34},${gy + s * 206} Q${gx + 24},${gy + s * 236} ${gx},${gy + s * 248}`;
      o.push(L(`M${gx + 34},${gy - 206} L${hx},${hy0} L${gx + 34},${gy + 206}`, 2.6));
      for (const s of [-1, 1]) o.push(cord(limb(s), '#7a4a22', 13), L(`M${gx + 30},${gy + s * 150} Q${gx + 40},${gy + s * 200} ${gx + 28},${gy + s * 226}`, 4, '#c98a3c'));
      o.push(rect(gx - 12, gy - 26, 24, 52, '#d8473c', 4, 6));
      o.push(cord(`M${hx + 20},${hy0 + 1} L${gx - 30},${gy + 4}`, WOOD, 5), P(`M${gx - 30},${gy + 4} l18,-12 l0,24 Z`, STEEL, INK, 3.5), P(`M${hx + 4},${hy0} l26,-12 l6,12 l-6,12 Z`, '#f3efe6', INK, 3));
      o.push(fist(gx, gy, 20), fist(hx, hy0, 20));
      return o; } },

  // 6 SHAOLIN MONK (kid): shiny bald head, long staff held across, big prayer beads
  { name: 'monk', label: 'Shaolin Monk', form: 'kid', coat: ORANGE, face: 'proud',
    hat: ({ cx, hy }) => [hl(`M${cx - 70},${hy - 70} Q${cx - 40},${hy - 98} ${cx - 4},${hy - 100}`, 10, .9)],
    details: ({ cx, top }) => [P(`M${cx - 74},${top - 10} L${cx + 30},${top + 120} L${cx + 50},${top + 104} L${cx - 40},${top - 10} Z`, '#c45e14', INK, 4), P(`M${cx + 74},${top - 10} L${cx + 20},${top + 70} L${cx + 40},${top - 10} Z`, '#c45e14', INK, 4),
      P(`M${cx - 80},${top + 30} L${cx + 90},${top + 170} L${cx + 90},${top + 220} L${cx - 80},${top + 70} Z`, '#8f2b1e', INK, 4), rect(cx - 100, top + 150, 200, 22, '#5a3a24', 4, 2)],
    props: ({ cx, top }) => { const y = top + 92, o = [];
      o.push(beads(cx - 76, top - 6, cx, top + 150, cx + 76, top - 6, 13, 11, ['#7a4a22', '#9b6b3e']), circ(cx, top + 78, 13, '#d8473c', 4));
      o.push(pole(cx - 234, y + 8, cx + 234, y - 8, WOOD, 16), ...[-1, 1].map(s => rect(cx + s * 212 - 16, y - s * 7 - 13, 32, 26, '#8f2b1e', 4, 3)), hl(`M${cx - 220},${y + 2} L${cx + 220},${y - 12}`, 3, .45));
      o.push(fist(cx - 90, y + 4, 14), fist(cx + 92, y - 4, 14));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 90, B.top + 96, 26), B.arm(1, B.cx + 92, B.top + 88, -26)] }) },

  // 7 SUMO: giant ball, black top-knot, mawashi belt with hanging cords, throwing salt
  { name: 'sumo', label: 'Sumo', form: 'bigboi', coat: '#f6f1ee', face: 'strain',
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 104, hy - 36], [cx - 96, hy - 92], [cx - 50, hy - 122], [cx, hy - 128], [cx + 50, hy - 122], [cx + 96, hy - 92], [cx + 104, hy - 36], [cx + 70, hy - 62], [cx, hy - 74], [cx - 70, hy - 62]], HAIR, 7));
      o.push(P(`M${cx - 18},${hy - 120} Q${cx - 70},${hy - 168} ${cx - 56},${hy - 196} Q${cx},${hy - 172} ${cx + 56},${hy - 196} Q${cx + 70},${hy - 168} ${cx + 18},${hy - 120} Z`, HAIR, INK, 6), rect(cx - 16, hy - 134, 32, 20, '#f3efe6', 4, 4));
      o.push(hl(`M${cx - 76},${hy - 82} Q${cx - 30},${hy - 114} ${cx + 10},${hy - 114}`, 8, .35), ...[-1, 1].map(s => L(`M${cx + s * 50},${hy - 70} Q${cx + s * 20},${hy - 100} ${cx},${hy - 104}`, 3, '#3d3848')));
      return o; },
    details: ({ cx, top }) => [L(`M${cx - 130},${top + 120} Q${cx - 70},${top + 170} ${cx - 10},${top + 130} M${cx + 130},${top + 120} Q${cx + 70},${top + 170} ${cx + 10},${top + 130}`, 5, '#c9bcc8'), L(`M${cx - 8},${top + 250} q8,10 16,0`, 5),
      P(`M${cx - 240},${top + 330} Q${cx},${top + 352} ${cx + 240},${top + 330} L${cx + 240},${top + 400} Q${cx},${top + 420} ${cx - 240},${top + 400} Z`, '#3b2f6b', INK, 5), P(`M${cx - 60},${top + 410} L${cx + 60},${top + 410} L${cx + 30},${top + 470} L${cx - 30},${top + 470} Z`, '#3b2f6b', INK, 5), hl(`M${cx - 200},${top + 350} Q${cx - 100},${top + 366} ${cx},${top + 366}`, 6, .3)],
    props: ({ cx, top }) => [...[-60, -36, -12, 12, 36, 60].map(t => cord(`M${cx + t},${top + 412} L${cx + t * 1.15},${top + 540}`, '#5a4a8f', 7)), rect(cx - 74, top + 400, 148, 20, '#5a4a8f', 4.5, 4),
      ...[[30, -30, 10], [62, -64, 9], [10, -80, 8], [84, -20, 8], [46, -110, 7], [-14, -50, 7], [78, -100, 8], [0, -120, 6], [40, -150, 6], [-30, -100, 6], [70, -140, 5]].map(([dx, dy, r]) => circ(cx + 150 + dx, top - 100 + dy, r, '#fff', 3.4)), fist(cx + 180, top - 70, 18), fist(cx - 224, top + 150, 18)],
    arms: B => ({ front: [B.arm(-1, B.cx - 224, B.top + 150, -20), B.arm(1, B.cx + 180, B.top - 70, 40)] }) },

  // 8 MAHARAJA: huge wrapped turban with jewel + plume, curled moustache, pearl ropes
  { name: 'maharaja', label: 'Maharaja', form: 'standard', coat: '#2d6e6a', face: 'delight',
    faceTop: ({ cx, hy }) => [P(`M${cx},${hy + 18} Q${cx - 30},${hy + 8} ${cx - 56},${hy + 22} Q${cx - 82},${hy + 30} ${cx - 86},${hy + 6} Q${cx - 86},${hy - 6} ${cx - 74},${hy - 2} Q${cx - 80},${hy + 14} ${cx - 64},${hy + 12} Q${cx - 36},${hy + 4} ${cx},${hy + 6} Q${cx + 36},${hy + 4} ${cx + 64},${hy + 12} Q${cx + 80},${hy + 14} ${cx + 74},${hy - 2} Q${cx + 86},${hy - 6} ${cx + 86},${hy + 6} Q${cx + 82},${hy + 30} ${cx + 56},${hy + 22} Q${cx + 30},${hy + 8} ${cx},${hy + 18} Z`, HAIR, INK, 4)],
    hat: ({ cx, hy }) => { const o = [], SAF = '#f2a22c';
      // plume (behind the turban)
      o.push(P(`M${cx + 6},${hy - 120} Q${cx + 20},${hy - 230} ${cx + 96},${hy - 286} Q${cx + 80},${hy - 220} ${cx + 30},${hy - 120} Z`, '#f6f3f8', INK, 5), ...[0, 1, 2, 3].map(k => L(`M${cx + 22 + k * 14},${hy - 150 - k * 30} l${16 - k},-4`, 2.6, '#b8b2c4')));
      o.push(fillPts([[cx - 116, hy - 34], [cx - 128, hy - 110], [cx - 80, hy - 176], [cx, hy - 196], [cx + 80, hy - 176], [cx + 128, hy - 110], [cx + 116, hy - 34], [cx + 60, hy - 52], [cx, hy - 58], [cx - 60, hy - 52]], SAF, 7));
      for (let k = 0; k < 5; k++) o.push(L(`M${cx - 118 + k * 10},${hy - 50 - k * 28} Q${cx},${hy - 90 - k * 26} ${cx + 116 - k * 12},${hy - 120 - k * 14}`, 4, '#c97a14'));
      o.push(P(`M${cx - 116},${hy - 60} Q${cx - 20},${hy - 120} ${cx + 110},${hy - 150} L${cx + 120},${hy - 126} Q${cx - 10},${hy - 96} ${cx - 112},${hy - 36} Z`, '#e45a84', INK, 4.5), hl(`M${cx - 96},${hy - 110} Q${cx - 60},${hy - 160} ${cx},${hy - 176}`, 9, .4));
      // sarpech jewel
      o.push(P(`M${cx - 26},${hy - 100} Q${cx},${hy - 130} ${cx + 26},${hy - 100} L${cx + 20},${hy - 72} Q${cx},${hy - 62} ${cx - 20},${hy - 72} Z`, GOLD, INK, 5), circ(cx, hy - 92, 15, '#d8304a', 4), hl(`M${cx - 6},${hy - 100} q4,-4 10,-2`, 3.4, .8), ...[-18, 0, 18].map(t => circ(cx + t, hy - 56, 6, '#fff', 2.6)));
      return o; },
    details: ({ cx, top }) => [rect(cx - 40, top - 10, 80, 30, GOLD, 4, 4), L(`M${cx},${top + 20} L${cx},${top + 320}`, 4, '#1e4e4b'), ...[0, 1, 2, 3, 4].map(k => circ(cx + 12, top + 150 + k * 30, 6, GOLD, 3)),
      P(`M${cx - 200},${top + 236} L${cx + 200},${top + 236} L${cx + 200},${top + 270} L${cx - 200},${top + 270} Z`, '#d8473c', INK, 4.5), ...[-80, -40, 0, 40, 80].map(t => L(`M${cx + t},${top + 242} l0,22`, 3, GOLD)), ...[[-100, 110], [90, 120], [-110, 300], [100, 300]].map(([dx, dy]) => star4(cx + dx, top + dy, 10, GOLD))],
    props: ({ cx, top }) => [...[[60, 26], [100, 34], [140, 40]].map(([d, n], i) => beads(cx - 52 - i * 6, top + 6, cx, top + d * 2 - 10, cx + 52 + i * 6, top + 6, n * .55 | 0, 6, ['#fbf8f2'])), P(`M${cx},${top + 140} l-14,18 l14,24 l14,-24 Z`, JADE, INK, 4),
      fist(cx - 112, top + 210, 16), cord(`M${cx + 126},${top + 136} Q${cx + 160},${top + 260} ${cx + 222},${top + 330}`, '#7a2a3a', 16), P(`M${cx + 214},${top + 318} q22,8 18,30 q-20,-2 -30,-16 Z`, GOLD, INK, 4), L(`M${cx + 132},${top + 170} l14,-4 M${cx + 160},${top + 250} l14,-8`, 6, GOLD), rot(-20, cx + 120, top + 126, rect(cx + 92, top + 118, 56, 14, GOLD, 4, 4)), P(`M${cx + 112},${top + 116} q-4,-36 18,-40 q8,12 -4,40 Z`, GOLD, INK, 4), fist(cx + 120, top + 120, 16)],
    arms: B => ({ front: [B.arm(-1, B.cx - 112, B.top + 210, 70), B.arm(1, B.cx + 120, B.top + 120, 10)] }) },

  // 9 TERRACOTTA WARRIOR: clay statue, side top-knot, studded armour, dagger-axe
  { name: 'terracotta', label: 'Terracotta Warrior', form: 'standard', coat: CLAY, face: 'deadInside',
    faceTop: ({ cx, hy }) => [L(`M${cx + 70},${hy - 70} l-10,18 l8,10 l-14,20`, 3, '#7a6a80'), L(`M${cx - 76},${hy + 40} l10,12 l-6,12`, 3, '#7a6a80')],
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 106, hy - 30], [cx - 100, hy - 92], [cx - 50, hy - 124], [cx, hy - 130], [cx + 50, hy - 124], [cx + 100, hy - 92], [cx + 106, hy - 30], [cx + 70, hy - 64], [cx, hy - 76], [cx - 70, hy - 64]], CLAYD, 7));
      for (let k = -4; k <= 4; k++) o.push(L(`M${cx + k * 22},${hy - 70 - (4 - Math.abs(k)) * 2} Q${cx + k * 18},${hy - 110} ${cx + 50},${hy - 128}`, 3, '#6e4527'));
      o.push(circ(cx + 66, hy - 140, 34, CLAYD, 6), L(`M${cx + 40},${hy - 142} Q${cx + 66},${hy - 160} ${cx + 92},${hy - 140}`, 3, '#6e4527'), rect(cx + 40, hy - 122, 52, 16, '#c8372f', 4, 4), hl(`M${cx - 76},${hy - 88} Q${cx - 34},${hy - 116} ${cx + 10},${hy - 118}`, 7, .3));
      return o; },
    details: ({ cx, top }) => { const o = [P(`M${cx - 130},${top + 10} L${cx + 130},${top + 10} L${cx + 140},${top + 250} Q${cx},${top + 290} ${cx - 140},${top + 250} Z`, CLAYL, INK, 5)];
      for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) { const x = cx - 120 + k * 40, y = top + 40 + r * 36; o.push(rect(x - 2, y, 38, 34, r % 2 ? '#cf9a70' : CLAYL, 3, 3), circ(x + 8, y + 8, 3.4, CLAYD, 0), circ(x + 26, y + 8, 3.4, CLAYD, 0)); }
      o.push(L(`M${cx + 60},${top + 60} l-20,40 l16,20 l-24,50`, 3.4, '#6e4527'), L(`M${cx - 140},${top + 30} L${cx + 140},${top + 30}`, 6, CLAYD));
      return o; },
    props: ({ cx, top }) => { const x = cx + 186, o = [];
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 60},${top + 20} Q${cx + s * 130},${top + 10} ${cx + s * 140},${top + 90} L${cx + s * 96},${top + 100} Q${cx + s * 86},${top + 56} ${cx + s * 50},${top + 50} Z`, CLAYL, INK, 5), ...[0, 1].map(k => circ(cx + s * (100 + k * 18), top + 50 + k * 18, 3.6, CLAYD, 0)));
      o.push(pole(x, top + 640, x + 8, top - 360, '#8a5a34', 12), P(`M${x + 8},${top - 420} L${x - 4},${top - 360} L${x + 20},${top - 360} Z`, '#8fa392', INK, 5), P(`M${x - 2},${top - 340} L${x + 56},${top - 330} Q${x + 64},${top - 300} ${x + 58},${top - 262} L${x + 46},${top - 268} Q${x + 44},${top - 296} ${x + 8},${top - 300} Z`, '#8fa392', INK, 5), L(`M${x + 2},${top - 340} l14,0`, 6, '#c8372f'), fist(x + 2, top + 160, 17));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 188, B.top + 160, 10)] }) },

  // 10 JOSEON SCHOLAR (elder): tall translucent black gat with beaded chin cord, white robe, fan
  { name: 'scholar', label: 'Joseon Scholar', form: 'elder', coat: '#f5f3ee', face: ['elder', 'grumpy'],
    faceTop: ({ cx, hy }) => [P(`M${cx - 12},${hy + 92} Q${cx},${hy + 150} ${cx + 6},${hy + 168} Q${cx + 12},${hy + 140} ${cx + 14},${hy + 92} Z`, '#f4f2f6', INK, 3)],
    hat: ({ cx, hy }) => { const o = [];
      o.push(rect(cx - 96, hy - 98, 192, 22, HAIR, 4.5, 8));
      o.push(`<ellipse cx="${cx}" cy="${hy - 96}" rx="166" ry="26" fill="${INK}" fill-opacity=".45" stroke="${INK}" stroke-width="5"/>`, `<ellipse cx="${cx}" cy="${hy - 96}" rx="140" ry="18" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="2.4"/>`);
      o.push(`<path d="M${cx - 52},${hy - 98} L${cx - 46},${hy - 212} Q${cx},${hy - 224} ${cx + 46},${hy - 212} L${cx + 52},${hy - 98} Q${cx},${hy - 86} ${cx - 52},${hy - 98} Z" fill="#2e2834" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`, hl(`M${cx - 36},${hy - 200} L${cx - 40},${hy - 110}`, 6, .35), hl(`M${cx - 150},${hy - 100} Q${cx - 120},${hy - 116} ${cx - 70},${hy - 118}`, 4, .4));
      // beaded chin cord
      o.push(beads(cx - 104, hy - 80, cx - 124, hy + 70, cx, hy + 116, 10, 7.5, ['#d99a3a', '#7a2a3a']), beads(cx + 104, hy - 80, cx + 124, hy + 70, cx, hy + 116, 10, 7.5, ['#d99a3a', '#7a2a3a']), beads(cx + 4, hy + 120, cx + 30, hy + 180, cx + 10, hy + 236, 7, 7, ['#d99a3a', '#7a2a3a']));
      return o; },
    behind: ({ cx, top }) => [sleeve(cx, top, -1, '#f5f3ee', 90, 220, 50), sleeve(cx, top, 1, '#f5f3ee', 90, 220, 50)],
    details: ({ cx, top }) => [L(`M${cx - 70},${top - 6} L${cx + 40},${top + 110}`, 16, HAIR), L(`M${cx + 70},${top - 6} L${cx + 20},${top + 50}`, 16, HAIR), cord(`M${cx - 120},${top + 140} Q${cx},${top + 160} ${cx + 120},${top + 140}`, '#c8372f', 7), cord(`M${cx + 30},${top + 152} q10,60 -4,110 M${cx + 46},${top + 150} q20,60 14,104`, '#2f5fae', 6), ...[[-60, 210], [40, 230], [-20, 180]].map(([dx, dy]) => L(`M${cx + dx},${top + dy} q6,30 2,60`, 3, '#d8d2c8'))],
    props: ({ cx, top }) => { const x = cx + 136, y = top + 180, R = 104, o = [];
      let d = `M${x},${y}`; for (let k = 0; k <= 8; k++) { const a = Math.PI * (1.12 + k * .095); d += ` L${f1(x + Math.cos(a) * R)},${f1(y + Math.sin(a) * R)}`; }
      o.push(P(d + ' Z', '#f3e6c4', INK, 5), ...[...Array(9)].map((_, k) => { const a = Math.PI * (1.12 + k * .095); return L(`M${x},${y} L${f1(x + Math.cos(a) * R)},${f1(y + Math.sin(a) * R)}`, 2, '#b8a47a'); }));
      o.push(P(`M${x - 80},${y - 40} l26,-28 l18,16 l22,-30 l26,40 Z`, '#7a8a9a', INK, 2.6), circ(x - 30, y - 74, 9, '#d8473c', 2.4), fist(x, y, 15));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 116, B.top + 170, 20), B.arm(1, B.cx + 136, B.top + 180, 10)] }) },
];
