// SHEET 11 — FANTASY & WEIRD
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, SILVER, BRONZE, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4, star5 } from '../castkit.mjs';
export const TITLE = 'Cast sheet 11: Fantasy & weird';

// ---------- local helpers ----------
const gear = (x, y, r, col = BRONZE, n = 10, sw = 5) => { let d = ''; const ri = r * .8;
  for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = a0 + Math.PI / n * .45, a2 = a0 + Math.PI / n, a3 = a0 + Math.PI / n * 1.55;
    for (const [a, rr] of [[a0, ri], [a1, r], [a2, r], [a3, ri]]) d += (d ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ',' + f1(y + Math.sin(a) * rr); }
  return P(d + 'Z', col, INK, sw) + circ(x, y, r * .42, tint(col), sw * .8) + circ(x, y, r * .16, INK, 0) + hl(`M${f1(x - r * .55)},${f1(y - r * .3)} Q${f1(x - r * .45)},${f1(y - r * .6)} ${f1(x - r * .15)},${f1(y - r * .66)}`, 5, .4); };
const tint = c => ({ [BRONZE]: '#e0a85a', [GOLD]: GOLDL, [STEEL]: '#d6dae2' }[c] || '#f0e6d0');
const bolt = (x, y, k = 1, col = '#ffe14a') => P(`M${x},${y} l${-18 * k},${44 * k} l${14 * k},${-2 * k} l${-12 * k},${40 * k} l${30 * k},${-52 * k} l${-14 * k},${2 * k} l${12 * k},${-32 * k} Z`, col, INK, 3.6);
const glow = (x, y, r, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" opacity=".18"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .72)}" fill="${col}" opacity=".22"/>`;
const flower5 = (x, y, r, col, mid = '#ffd23f', sw = 3) => { let o = ''; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; o += circ(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, col, sw); }
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; o += `<circle cx="${f1(x + Math.cos(a) * r * .55)}" cy="${f1(y + Math.sin(a) * r * .55)}" r="${f1(r * .5 - sw / 2)}" fill="${col}"/>`; }
  return o + circ(x, y, r * .26, mid, sw * .8); };

export const CAST = [
  // 1 WIZARD — giant bent star hat, beard to the belt, long robe, staff with a glowing orb
  { name: 'wizard', label: 'Wizard', form: 'elder', coat: '#2c3f8f', face: ['elder', 'suspicious'], cane: false,
    headBack: ({ cx, hy }) => [cloud([[cx - 100, hy - 10, 22], [cx - 108, hy + 30, 24], [cx - 104, hy + 72, 24], [cx - 94, hy + 110, 20], [cx + 100, hy - 10, 22], [cx + 108, hy + 30, 24], [cx + 104, hy + 72, 24], [cx + 94, hy + 110, 20]], '#f4f2f6')],
    hat: ({ cx, hy }) => { const o = [], PU = '#5a3a9a';
      const cone = `M${cx - 96},${hy - 70} Q${cx - 60},${hy - 190} ${cx - 8},${hy - 270} Q${cx + 30},${hy - 324} ${cx + 118},${hy - 300} Q${cx + 60},${hy - 292} ${cx + 36},${hy - 246} Q${cx + 66},${hy - 160} ${cx + 96},${hy - 70} Z`;
      o.push(P(`M${cx - 156},${hy - 64} Q${cx - 168},${hy - 90} ${cx - 120},${hy - 96} Q${cx},${hy - 108} ${cx + 120},${hy - 96} Q${cx + 168},${hy - 90} ${cx + 156},${hy - 64} Q${cx},${hy - 34} ${cx - 156},${hy - 64} Z`, PU, INK, 7));
      o.push(P(cone, PU, INK, 7), hl(`M${cx - 70},${hy - 90} Q${cx - 46},${hy - 190} ${cx - 10},${hy - 250}`, 9, .3));
      o.push(P(`M${cx - 92},${hy - 104} Q${cx},${hy - 88} ${cx + 92},${hy - 104} L${cx + 96},${hy - 76} Q${cx},${hy - 60} ${cx - 96},${hy - 76} Z`, GOLD, INK, 5), circ(cx, hy - 86, 9, '#5fd8e8', 3.4));
      o.push(star5(cx - 30, hy - 160, 18), star5(cx + 30, hy - 200, 13), star4(cx + 10, hy - 136, 11), star4(cx - 14, hy - 230, 10), star4(cx + 78, hy - 290, 9), P(`M${cx + 40},${hy - 150} a24,24 0 1,0 6,36 a18,18 0 1,1 -6,-36 Z`, GOLDL, INK, 3.4));
      return o; },
    faceTop: ({ cx, hy }) => [cloud([[cx - 70, hy + 40, 24], [cx - 40, hy + 64, 30], [cx, hy + 72, 32], [cx + 40, hy + 64, 30], [cx + 70, hy + 40, 24], [cx - 50, hy + 110, 30], [cx, hy + 118, 34], [cx + 50, hy + 110, 30], [cx - 34, hy + 160, 28], [cx + 30, hy + 162, 28], [cx - 8, hy + 200, 24], [cx + 6, hy + 236, 18], [cx - 6, hy + 262, 13]], '#f4f2f6'),
      ...[[-40, 90], [20, 120], [-14, 170], [30, 80], [4, 220]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q6,8 3,18`, 2.6, '#a9a3b5')),
      P(`M${cx},${hy + 36} Q${cx - 30},${hy + 22} ${cx - 64},${hy + 38} Q${cx - 80},${hy + 46} ${cx - 76},${hy + 30} Q${cx - 40},${hy + 10} ${cx},${hy + 24} Q${cx + 40},${hy + 10} ${cx + 76},${hy + 30} Q${cx + 80},${hy + 46} ${cx + 64},${hy + 38} Q${cx + 30},${hy + 22} ${cx},${hy + 36} Z`, '#f4f2f6', INK, 3.6)],
    details: ({ cx, top }) => [...[[-60, 60], [50, 120], [-30, 200], [70, 240]].map(([dx, dy], i) => i % 2 ? star4(cx + dx, top + dy, 14, '#c9ccd6') : star5(cx + dx, top + dy, 13, '#c9ccd6')), L(`M${cx - 120},${top + 230} Q${cx},${top + 252} ${cx + 120},${top + 230}`, 9, GOLD), ...[-1, 1].map(s => L(`M${cx + s * 12},${top + 244} l${s * 8},44`, 6, GOLD))],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 120, 30), B.arm(1, B.cx + 168, B.top + 150, -10)] }),
    props: ({ cx, top, grad }) => [P(`M${cx - 94},${top + 240} L${cx + 94},${top + 240} L${cx + 126},${top + 520} Q${cx},${top + 534} ${cx - 126},${top + 520} Z`, grad('#2c3f8f', cx - 126, cx + 126), INK, 6), ...[[-70, 340], [40, 400], [-20, 470], [80, 470], [-90, 450]].map(([dx, dy], i) => i % 2 ? star4(cx + dx, top + dy, 13, '#c9ccd6') : star5(cx + dx, top + dy, 12, '#c9ccd6')),
      ...[0, 1, 2, 3, 4].map(k => star4(cx - 180 + (k % 2) * 20, top + 40 - k * 26, 6 + k * 2)), fist(cx - 150, top + 120, 14)],
    over: ({ cx, top }) => { const x = cx + 192, y = 64; return [glow(x, y, 70, '#5fd8e8'), L(`M${cx + 172},990 Q${cx + 160},700 ${cx + 172},480 Q${cx + 192},300 ${x - 6},${y + 40}`, 19, INK), L(`M${cx + 172},990 Q${cx + 160},700 ${cx + 172},480 Q${cx + 192},300 ${x - 6},${y + 40}`, 11, WOOD), P(`M${x - 34},${y + 30} Q${x - 50},${y - 10} ${x - 30},${y - 40} M${x + 34},${y + 30} Q${x + 50},${y - 10} ${x + 30},${y - 40}`, 'none', INK, 10), L(`M${x - 34},${y + 30} Q${x - 50},${y - 10} ${x - 30},${y - 40} M${x + 34},${y + 30} Q${x + 50},${y - 10} ${x + 30},${y - 40}`, 5, WOOD),
      circ(x, y, 32, '#7ee8f4', 5), circ(x - 6, y - 4, 20, '#c9f6fb', 0), ell(x - 12, y - 12, 8, 6, '#fff'), star4(x + 54, y - 40, 12, '#c9f6fb'), star4(x - 52, y - 54, 9, '#c9f6fb'), fist(cx + 168, top + 150, 15)]; } },

  // 2 VAMPIRE — widow's peak, bat-spread cape with a towering collar, red vest + medallion
  { name: 'vampire', label: 'Vampire', form: 'noodle', coat: '#1c1a22', face: 'evil',
    headBack: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 30},${hy + 130} L${cx + s * 168},${hy - 70} L${cx + s * 150},${hy + 60} L${cx + s * 110},${hy + 150} Z`, '#1c1a22', INK, 6) + P(`M${cx + s * 52},${hy + 122} L${cx + s * 150},${hy - 34} L${cx + s * 136},${hy + 60} L${cx + s * 104},${hy + 128} Z`, '#b01e2e', INK, 3.6))],
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 104},${hy - 4} Q${cx - 108},${hy - 100} ${cx - 40},${hy - 120} Q${cx},${hy - 128} ${cx + 40},${hy - 120} Q${cx + 108},${hy - 100} ${cx + 104},${hy - 4} Q${cx + 96},${hy - 40} ${cx + 80},${hy - 56} Q${cx + 40},${hy - 74} ${cx},${hy - 46} Q${cx - 40},${hy - 74} ${cx - 80},${hy - 56} Q${cx - 96},${hy - 40} ${cx - 104},${hy - 4} Z`, '#14121a', INK, 6));
      o.push(hl(`M${cx - 80},${hy - 80} Q${cx - 50},${hy - 110} ${cx - 10},${hy - 112}`, 7, .45), hl(`M${cx + 20},${hy - 100} Q${cx + 50},${hy - 100} ${cx + 76},${hy - 80}`, 5, .3), L(`M${cx - 20},${hy - 66} Q${cx - 40},${hy - 96} ${cx - 30},${hy - 118} M${cx + 20},${hy - 66} Q${cx + 40},${hy - 96} ${cx + 30},${hy - 118}`, 2.6, '#3a3446'));
      return o; },
    behind: ({ cx }) => { const pts = [], n = 6; for (let k = 0; k <= n; k++) pts.push([cx - 214 + k * 428 / n, 920 + (k % 2 ? -50 : 0)]);
      const bot = pts.map(([x, y], i) => i ? `Q${f1(x - 428 / n / 2)},${f1(y - 30)} ${f1(x)},${f1(y)}` : `L${f1(x)},${f1(y)}`).join(' ');
      return [P(`M${cx - 40},${160} L${cx - 214},${236} Q${cx - 246},${560} ${cx - 214},${920} ${bot.replace(/^L[^ ]+ /, '')} Q${cx + 246},${560} ${cx + 214},${236} L${cx + 40},${160} Z`, '#b01e2e', INK, 7), ...[-1, 1].map(s => L(`M${cx + s * 214},${236} Q${cx + s * 246},${560} ${cx + s * 214},${920}`, 22, '#1c1a22')), ...[-1, 1].map(s => L(`M${cx + s * 196},${236} Q${cx + s * 228},${560} ${cx + s * 196},${900}`, 4)), ...[-1, 0, 1].map(k => L(`M${cx + k * 120},${300} Q${cx + k * 130},${600} ${cx + k * 140},${860}`, 4, '#7e1420')), hl(`M${cx - 180},${300} Q${cx - 200},${500} ${cx - 190},${700}`, 9, .25)]; },
    details: ({ cx, top }) => [P(`M${cx - 30},${top} L${cx},${top + 130} L${cx + 30},${top} Z`, '#f6f3ec', INK, 4), P(`M${cx - 44},${top + 60} L${cx - 2},${top + 130} L${cx - 2},${top + 330} L${cx - 44},${top + 330} Z M${cx + 44},${top + 60} L${cx + 2},${top + 130} L${cx + 2},${top + 330} L${cx + 44},${top + 330} Z`, '#8e1424', INK, 4),
      P(`M${cx - 26},${top + 14} L${cx},${top + 24} L${cx + 26},${top + 14} L${cx + 26},${top + 40} L${cx},${top + 30} L${cx - 26},${top + 40} Z`, '#14121a', INK, 3), L(`M${cx - 30},${top + 40} Q${cx},${top + 110} ${cx + 30},${top + 40}`, 4, GOLD), circ(cx, top + 108, 16, GOLD, 4), circ(cx, top + 108, 8, RED, 2.6), ...[0, 1, 2].map(k => circ(cx - 22, top + 180 + k * 40, 5, GOLD, 2.4))],
    arms: B => ({ front: [B.arm(-1, B.cx - 206, B.top + 80, -30), B.arm(1, B.cx + 206, B.top + 80, -30)] }),
    props: ({ cx, top }) => [fist(cx - 206, top + 80, 15), fist(cx + 206, top + 80, 15), ...[[-170, -150, 1], [176, -110, .8]].map(([dx, dy, k]) => { const x = cx + dx, y = top + dy; return P(`M${x},${y} q${-12 * k},${-14 * k} ${-34 * k},${-10 * k} q${8 * k},${6 * k} ${4 * k},${14 * k} q${-10 * k},${-4 * k} ${-16 * k},${4 * k} q${18 * k},${2 * k} ${46 * k},${10 * k} q${28 * k},${-8 * k} ${46 * k},${-10 * k} q${-6 * k},${-8 * k} ${-16 * k},${-4 * k} q${-4 * k},${-8 * k} ${4 * k},${-14 * k} q${-22 * k},${-4 * k} ${-34 * k},${10 * k} Z`, '#14121a', INK, 2.6) + ell(x, y - 2 * k, 7 * k, 8 * k, '#14121a'); })] },

  // 3 ZOMBIE — big boi, green face, ragged shirt + torn trousers, one arm reaching out, flies
  { name: 'zombie', label: 'Zombie', form: 'bigboi', coat: '#7d93b0', face: 'disgust',
    hat: ({ cx, hy }) => [L(`M${cx - 10},${hy - 98} q-10,-30 6,-46 M${cx + 10},${hy - 98} q20,-20 10,-48 M${cx + 30},${hy - 96} q24,-6 30,-28`, 5), L(`M${cx - 70},${hy - 70} L${cx - 20},${hy - 92}`, 4), ...[0, 1, 2, 3].map(k => L(`M${cx - 64 + k * 14},${hy - 82 - k * 6.5} l-4,-10 m4,10 l4,10`, 3)), P(`M${cx + 60},${hy - 80} l20,-6 l10,16 l-18,8 Z`, '#e8dcc0', INK, 3.4)],
    details: ({ cx, top }) => { const o = [`<rect x="${cx - 240}" y="${top + 300}" width="480" height="200" fill="#5a5048"/>`];
      let z = `M${cx - 240},${top + 300}`; for (let k = 0; k <= 16; k++) z += ` L${cx - 240 + k * 30},${top + 290 + (k % 2 ? 34 : 0) + (k % 3) * 8}`; o.push(P(z + ` L${cx + 240},${top - 20} L${cx - 240},${top - 20} Z`, '#7d93b0', 'none', 0), L(z.replace(`M${cx - 240},${top + 300} L`, 'M'), 5));
      o.push(P(`M${cx - 70},${top + 120} l30,-10 l14,40 l-20,30 l-28,-16 Z`, '#fbf7f2', INK, 4), P(`M${cx + 80},${top + 200} l24,-6 l8,30 l-26,10 Z`, '#fbf7f2', INK, 4), P(`M${cx - 130},${top + 380} l40,0 l-6,40 l-30,-4 Z`, '#fbf7f2', INK, 4), rect(cx + 40, top + 380, 70, 50, '#8a6a4c', 4, 4), ...[0, 1, 2].map(k => L(`M${cx + 46 + k * 22},${top + 376} l8,10 M${cx + 46 + k * 22},${top + 434} l8,-10`, 2.6)), L(`M${cx - 160},${top + 60} l20,30 M${cx + 140},${top + 100} l-10,40`, 3, '#4a5a70'), ell(cx - 30, top + 250, 24, 14, '#5c6e48', 'none', 0), ell(cx + 120, top + 60, 18, 10, '#6e5a48', 'none', 0));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 236, B.top + 60, -30), B.arm(1, B.cx + 236, B.top + 20, 30)] }),
    props: ({ cx, top }) => [fist(cx - 236, top + 60, 17), fist(cx + 236, top + 20, 17), L(`M${cx + 226},${top + 34} l-4,18 M${cx + 238},${top + 36} l0,18 M${cx + 248},${top + 30} l4,16 M${cx - 226},${top + 74} l4,18 M${cx - 238},${top + 76} l0,18 M${cx - 248},${top + 70} l-4,16`, 5)],
    over: ({ cx, top }) => [...[[cx - 190, 40], [cx - 150, -20], [cx + 170, -10]].map(([x, y]) => ell(x, y, 7, 6, INK) + `<ellipse cx="${x - 6}" cy="${y - 8}" rx="7" ry="4" fill="#e6f4ff" stroke="${INK}" stroke-width="2" transform="rotate(-30 ${x - 6} ${y - 8})"/><ellipse cx="${x + 6}" cy="${y - 8}" rx="7" ry="4" fill="#e6f4ff" stroke="${INK}" stroke-width="2" transform="rotate(30 ${x + 6} ${y - 8})"/>`), L(`M${cx - 176},${46} q20,10 14,-30 q-6,-30 20,-34`, 2, '#2a1a1f').replace('fill="none"', 'fill="none" stroke-dasharray="4 6"')] },

  // 4 ROBOT BUTLER — TV-screen head (face on the screen), antenna, tux panels, silver tray with cloche
  { name: 'robot', label: 'Robot Butler', form: 'standard', coat: '#b9c0cc', face: 'deadInside',
    hat: ({ cx, hy }) => { const o = [], M = '#9aa3b5';
      const fr = `M${cx - 128},${hy - 112} Q${cx - 128},${hy - 128} ${cx - 112},${hy - 128} L${cx + 112},${hy - 128} Q${cx + 128},${hy - 128} ${cx + 128},${hy - 112} L${cx + 128},${hy + 112} Q${cx + 128},${hy + 128} ${cx + 112},${hy + 128} L${cx - 112},${hy + 128} Q${cx - 128},${hy + 128} ${cx - 128},${hy + 112} Z`;
      const hole = `M${cx - 102},${hy} A102,102 0 1,0 ${cx + 102},${hy} A102,102 0 1,0 ${cx - 102},${hy} Z`;
      o.push(...[0, 1, 2, 3, 4, 5].map(k => `<rect x="${cx - 100}" y="${hy - 70 + k * 28}" width="200" height="3" fill="#6fd3ff" opacity=".22"/>`));
      o.push(L(`M${cx},${hy - 128} L${cx},${hy - 196}`, 9), circ(cx, hy - 206, 17, '#ff4a4a', 5), ell(cx - 5, hy - 211, 5, 4, '#fff'), ...[1, 2, 3].map(k => `<path d="M${cx - 18 - k * 10},${hy - 222 + k * 2} q${-6},${16} 0,${30}" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/><path d="M${cx + 18 + k * 10},${hy - 222 + k * 2} q6,16 0,30" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>`));
      o.push(`<path d="${fr} ${hole}" fill="${M}" fill-rule="evenodd" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`, `<path d="${hole}" fill="none" stroke="#5c6474" stroke-width="5"/>`, hl(`M${cx - 112},${hy - 70} L${cx - 112},${hy - 112} L${cx - 70},${hy - 112}`, 8, .55));
      for (const [x, y] of [[-114, -114], [114, -114], [-114, 114], [114, 114]]) o.push(circ(cx + x, hy + y, 6, '#d6dae2', 3));
      for (const s of [-1, 1]) o.push(rect(cx + s * 128 - (s < 0 ? 22 : 0), hy - 34, 22, 68, '#7a8294', 5, 5), circ(cx + s * 156, hy, 14, '#ffd23f', 4), L(`M${cx + s * 150},${hy} l${s * 12},0`, 3));
      o.push(rect(cx + 50, hy + 106, 40, 12, '#3ad17a', 3, 3), rect(cx + 2, hy + 106, 40, 12, '#ffd23f', 3, 3));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 160},${top - 10} L${cx - 26},${top - 10} L${cx - 10},${top + 160} L${cx - 54},${top + 330} L${cx - 160},${top + 330} Z M${cx + 160},${top - 10} L${cx + 26},${top - 10} L${cx + 10},${top + 160} L${cx + 54},${top + 330} L${cx + 160},${top + 330} Z`, '#24222c', INK, 4),
      P(`M${cx - 26},${top - 10} L${cx - 10},${top + 160} L${cx + 10},${top + 160} L${cx + 26},${top - 10} Z`, '#f6f3ec', INK, 3.4), P(`M${cx - 34},${top + 10} L${cx},${top + 26} L${cx + 34},${top + 10} L${cx + 34},${top + 46} L${cx},${top + 32} L${cx - 34},${top + 46} Z`, RED, INK, 3.4), circ(cx, top + 28, 7, '#a8222a', 2.4),
      ...[0, 1, 2].map(k => circ(cx, top + 76 + k * 30, 5, '#d6dae2', 2.4)), rect(cx - 30, top + 196, 60, 70, '#9aa3b5', 4, 6), ...[0, 1].map(k => circ(cx - 12 + k * 24, top + 216, 7, k ? '#3ad17a' : '#ff4a4a', 2.6)), L(`M${cx - 18},${top + 248} l36,0`, 3), ...[-1, 1].flatMap(s => [0, 1, 2].map(k => circ(cx + s * 70, top + 60 + k * 90, 4, '#4a4858', 0)))],
    arms: B => ({ front: [B.arm(-1, B.cx - 110, B.top + 200, 30), B.arm(1, B.cx + 176, B.top + 136, 40)] }),
    over: ({ cx, top }) => { const x = cx + 176, y = top + 120; return [P(`M${cx - 132},${top + 170} Q${cx - 110},${top + 160} ${cx - 88},${top + 172} L${cx - 84},${top + 290} L${cx - 108},${top + 276} L${cx - 124},${top + 296} Z`, '#fbfbf8', INK, 4), L(`M${cx - 122},${top + 196} l30,0`, 3, '#c9ccd6'), fist(cx - 110, top + 200),
      P(`M${x - 64},${y} Q${x - 62},${y - 74} ${x},${y - 78} Q${x + 62},${y - 74} ${x + 64},${y} Z`, '#d6dae2', INK, 6), circ(x, y - 84, 9, '#d6dae2', 4), hl(`M${x - 44},${y - 14} Q${x - 42},${y - 56} ${x - 12},${y - 64}`, 8, .7), ell(x, y + 4, 86, 14, '#c9ccd6', INK, 6), fist(cx + 176, top + 136), star4(x + 52, y - 66, 12, '#fff')]; } },

  // 5 ALIEN TOURIST — kid-size, springy antennae, aloha shirt, big camera, parked saucer
  { name: 'alien', label: 'Alien Tourist', form: 'kid', coat: '#2fb3a8', face: 'starstruck',
    hat: ({ cx, hy }) => { const o = []; for (const s of [-1, 1]) { const d = `M${cx + s * 30},${hy - 92} q${s * 30},-20 ${s * 10},-50 q${-s * 20},-30 ${s * 16},-56 q${s * 36},-26 ${s * 20},-62`;
      o.push(L(d, 15, INK), L(d, 7, '#7ad84a'), circ(cx + s * 76, hy - 268, 24, '#b6f25a', 6), ell(cx + s * 76 - 8, hy - 276, 8, 6, '#fff'), glow(cx + s * 76, hy - 268, 44, '#b6f25a')); } return o; },
    behind: ({ cx }) => { const x = cx - 150, y = 290; return [P(`M${x - 92},${y + 8} Q${x},${y - 30} ${x + 92},${y + 8} Q${x},${y + 40} ${x - 92},${y + 8} Z`, '#aeb4c2', INK, 6), P(`M${x - 44},${y - 4} Q${x - 40},${y - 54} ${x},${y - 56} Q${x + 40},${y - 54} ${x + 44},${y - 4} Z`, '#9fe6f0', INK, 5), hl(`M${x - 30},${y - 14} Q${x - 26},${y - 40} ${x - 8},${y - 46}`, 6, .7), ...[-60, -20, 20, 60].map((t, i) => circ(x + t, y + 12 + Math.abs(t) * -.1, 6, i % 2 ? '#ffd23f' : '#ff4a4a', 2.6)), `<path d="M${x - 40},${y + 30} L${x - 80},${y + 140} L${x + 80},${y + 140} L${x + 40},${y + 30} Z" fill="#ffe680" opacity=".35"/>`]; },
    details: ({ cx, top }) => [...[[-50, 40], [40, 30], [10, 100], [-60, 130], [60, 120]].map(([dx, dy], i) => i % 2 ? P(`M${cx + dx},${top + dy} l0,-28 M${cx + dx},${top + dy - 28} q-16,-4 -22,8 M${cx + dx},${top + dy - 28} q16,-4 22,8 M${cx + dx},${top + dy - 28} q-6,-14 -18,-12 M${cx + dx},${top + dy - 28} q6,-14 18,-12`, 'none', '#1d6a4a', 4) : flower5(cx + dx, top + dy, 20, '#ffd23f', '#f05a9a', 2.4)), rect(cx - 100, top + 160, 200, 60, '#e8d9a0', 0, 0), L(`M${cx - 80},${top + 160} L${cx + 80},${top + 160}`, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 54, B.top + 126, 30), B.arm(1, B.cx + 56, B.top + 126, 30)] }),
    props: ({ cx, top }) => { const x = cx, y = top + 116; return [L(`M${cx - 50},${top + 4} Q${cx},${top + 90} ${cx + 50},${top + 4}`, 5), rect(x - 62, y - 30, 124, 74, '#2a2733', 6, 12), rect(x - 54, y - 44, 40, 16, '#2a2733', 4, 4), circ(x + 4, y + 8, 30, '#6a6f80', 5), circ(x + 4, y + 8, 17, '#2f8fd0', 4), ell(x - 2, y + 2, 6, 5, '#fff'), rect(x + 34, y - 22, 20, 12, '#fbf7f2', 3, 3), star4(x + 70, y - 46, 22, '#fff'), star4(x + 92, y - 16, 10, '#fff'), fist(cx - 54, top + 126, 13), fist(cx + 56, top + 126, 13)]; } },

  // 6 MAD SCIENTIST — exploding white hair, brass goggles up top, lab coat, glowing flask with lightning
  { name: 'scientist', label: 'Mad Scientist', form: 'dad', coat: '#f4f4f0', face: 'hysterical',
    headBack: ({ cx, hy }) => { const pts = []; const n = 15; for (let k = 0; k <= n; k++) { const a = Math.PI * (.85 + k / n * 1.3), r = k % 2 ? 126 : 158; pts.push([cx + Math.cos(a) * r, hy - 4 + Math.sin(a) * r * .92]); }
      return [P('M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L') + ` L${cx + 90},${hy + 60} L${cx - 90},${hy + 60} Z`, '#f1eff4', INK, 6), ...pts.filter((_, i) => i % 2 === 0).map(([x, y]) => L(`M${f1(cx + (x - cx) * .7)},${f1(hy + (y - hy) * .7)} L${f1(cx + (x - cx) * .88)},${f1(hy + (y - hy) * .88)}`, 3, '#b9b4c4'))]; },
    hat: ({ cx, hy }) => { const o = [];
      o.push(L(`M${cx - 102},${hy - 60} Q${cx},${hy - 120} ${cx + 102},${hy - 60}`, 12, INK), L(`M${cx - 102},${hy - 60} Q${cx},${hy - 120} ${cx + 102},${hy - 60}`, 6, '#5a3a24'));
      for (const s of [-1, 1]) o.push(circ(cx + s * 34, hy - 96, 28, BRONZE, 6), circ(cx + s * 34, hy - 96, 18, '#7ef08a', 4), ell(cx + s * 34 - 6, hy - 102, 6, 5, '#fff'));
      o.push(rect(cx - 8, hy - 102, 16, 12, BRONZE, 3.4, 3), P(`M${cx - 60},${hy - 140} q10,-30 -6,-50 q24,10 26,44 Z M${cx + 30},${hy - 150} q20,-20 10,-56 q22,24 6,60 Z`, '#f1eff4', INK, 4));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 10} L${cx},${top + 80} L${cx + 30},${top - 10} Z`, '#8a5ab8', INK, 4), P(`M${cx - 6},${top + 30} L${cx + 6},${top + 30} L${cx + 12},${top + 120} L${cx},${top + 136} L${cx - 12},${top + 120} Z`, '#3ad17a', INK, 3),
      ...[-1, 1].map(s => P(`M${cx + s * 32},${top - 10} L${cx + s * 4},${top + 150} L${cx + s * 4},${top + 400} L${cx + s * 200},${top + 400} L${cx + s * 200},${top - 10} Z`, '#f4f4f0', INK, 4)), L(`M${cx - 32},${top - 10} L${cx - 70},${top + 70} L${cx - 26},${top + 90} M${cx + 32},${top - 10} L${cx + 70},${top + 70} L${cx + 26},${top + 90}`, 4),
      rect(cx - 110, top + 110, 54, 60, '#ecebe4', 3.4, 4), ...[['#2f8fd0', -100], [RED, -84], ['#3ad17a', -68]].map(([c, x]) => rect(cx + x, top + 92, 8, 30, c, 2.4, 3)), ...[0, 1, 2].map(k => circ(cx + 18, top + 180 + k * 50, 6, '#d9d6cc', 2.6)),
      ell(cx + 90, top + 260, 30, 18, '#3a3446', 'none', 0), ell(cx + 70, top + 250, 10, 7, '#3a3446', 'none', 0), ell(cx - 80, top + 300, 18, 11, '#7ef08a', 'none', 0)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 178, B.top - 30, 50)] }),
    props: ({ cx, top }) => [fist(cx + 178, top - 30, 16)],
    over: ({ cx, top }) => { const x = cx + 184, y = top - 96; return [glow(x, y + 10, 76, '#7ef08a'), P(`M${x - 14},${y - 70} L${x - 14},${y - 34} Q${x - 52},${y - 22} ${x - 52},${y + 14} A52,52 0 1,0 ${x + 52},${y + 14} Q${x + 52},${y - 22} ${x + 14},${y - 34} L${x + 14},${y - 70} Z`, '#e6f4ff', INK, 5),
      P(`M${x - 49},${y + 4} Q${x},${y + 18} ${x + 49},${y + 4} A50,50 0 1,1 ${x - 49},${y + 4} Z`, '#5fe86a', 'none', 0), ...[[-16, 30, 8], [10, 44, 6], [20, 20, 10], [-4, 10, 5]].map(([dx, dy, r]) => circ(x + dx, y + dy, r, '#c9ffc9', 2.4)), rect(x - 20, y - 82, 40, 14, '#a87a4a', 4, 4), hl(`M${x - 34},${y - 4} Q${x - 44},${y + 30} ${x - 26},${y + 52}`, 7, .7),
      bolt(x + 10, y - 170, 1.1), bolt(x - 50, y - 130, .7), bolt(x + 50, y - 120, .6), fist(cx + 178, top - 30, 16)]; } },

  // 7 FAIRY — big translucent wings, petal dress, flower crown, star wand with a sparkle trail
  { name: 'fairy', label: 'Fairy', form: 'lady', coat: '#f29ac8', face: ['female', 'blowKiss'], hair: 'bob',
    hat: ({ cx, hy }) => [...[...Array(7)].map((_, k) => { const a = Math.PI * (1.2 + k * .1); return flower5(cx + Math.cos(a) * 104, hy - 10 + Math.sin(a) * 104, 18, k % 2 ? '#fbfbf8' : '#ffd0e8', '#ffd23f', 2.6); })],
    behind: ({ cx }) => { const o = [], W = '#cfeaf8';
      for (const s of [-1, 1]) { o.push(`<path d="M${cx + s * 20},${420} Q${cx + s * 120},${200} ${cx + s * 236},${180} Q${cx + s * 250},${300} ${cx + s * 150},${420} Q${cx + s * 90},${450} ${cx + s * 20},${430} Z" fill="${W}" fill-opacity=".85" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`, `<path d="M${cx + s * 20},${440} Q${cx + s * 150},${460} ${cx + s * 214},${580} Q${cx + s * 200},${650} ${cx + s * 130},${620} Q${cx + s * 60},${560} ${cx + s * 20},${450} Z" fill="${W}" fill-opacity=".85" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
        L(`M${cx + s * 30},${424} Q${cx + s * 120},${300} ${cx + s * 220},${200} M${cx + s * 100},${340} q${s * 40},10 ${s * 70},50 M${cx + s * 30},${446} Q${cx + s * 120},${520} ${cx + s * 190},${590}`, 3, '#8fc3e0'), hl(`M${cx + s * 120},${260} Q${cx + s * 170},${220} ${cx + s * 214},${206}`, 6, .8)); }
      return o; },
    details: ({ cx, top }) => [rect(cx - 160, top + 104, 320, 26, '#5fae4a', 4, 0), ...[...Array(7)].map((_, k) => P(`M${cx - 150 + k * 50},${top + 130} q25,170 0,280 q-30,-120 0,-280 Z`, '#f6b8da', 'none', 0)), ...[...Array(8)].map((_, k) => L(`M${cx - 175 + k * 50},${top + 140} q10,140 0,270`, 3, '#d070a8')), ...[[-50, 40], [40, 60], [0, 200], [-80, 300], [70, 280]].map(([dx, dy]) => star4(cx + dx, top + dy, 9, '#fff'))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 140, B.top + 70, 20)] }),
    props: ({ cx, top }) => { const x = cx + 140, y = top + 70, tx = x + 64, ty = y - 120; return [pole(x - 6, y + 20, tx, ty, '#fbfbf8', 7), star5(tx, ty, 34, '#ffe14a'), glow(tx, ty, 60, '#ffe14a'), ...[[-50, -40, 12], [-90, 10, 9], [-120, 60, 7], [-40, 50, 8], [30, 50, 10]].map(([dx, dy, r]) => star4(tx + dx, ty + dy, r, '#fff6b0')), fist(x, y, 13)]; } },

  // 8 ORIGINAL SUPERHERO "Captain Upbeat" — quiff, domino mask, double-chevron chest badge, billowing cape, hands on hips
  { name: 'hero', label: 'Superhero', form: 'chad', coat: '#1f9e8a', face: 'proud',
    hat: ({ cx, hy }) => [P(`M${cx - 98},${hy - 40} Q${cx - 104},${hy - 104} ${cx - 50},${hy - 120} Q${cx - 20},${hy - 170} ${cx + 40},${hy - 168} Q${cx + 90},${hy - 160} ${cx + 70},${hy - 120} Q${cx + 104},${hy - 100} ${cx + 98},${hy - 40} Q${cx + 80},${hy - 80} ${cx + 30},${hy - 86} Q${cx - 40},${hy - 92} ${cx - 98},${hy - 40} Z`, '#1d1a26', INK, 6), hl(`M${cx - 40},${hy - 128} Q${cx - 10},${hy - 160} ${cx + 40},${hy - 156}`, 8, .45), L(`M${cx + 20},${hy - 110} q20,-10 40,6`, 3, '#3a3446')],
    faceTop: ({ cx, hy }) => { const m = `M${cx - 88},${hy - 40} Q${cx},${hy - 52} ${cx + 88},${hy - 40} Q${cx + 96},${hy - 14} ${cx + 72},${hy} Q${cx + 40},${hy + 6} ${cx + 12},${hy - 8} Q${cx},${hy - 2} ${cx - 12},${hy - 8} Q${cx - 40},${hy + 6} ${cx - 72},${hy} Q${cx - 96},${hy - 14} ${cx - 88},${hy - 40} Z`,
      holes = [-1, 1].map(s => `M${cx + s * 32 - 22},${hy - 22} A22,13 0 1,0 ${cx + s * 32 + 22},${hy - 22} A22,13 0 1,0 ${cx + s * 32 - 22},${hy - 22} Z`).join(' ');
      return [`<path d="${m} ${holes}" fill="#f08a2a" fill-rule="evenodd" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`, hl(`M${cx - 76},${hy - 36} Q${cx - 60},${hy - 42} ${cx - 44},${hy - 42}`, 4, .5)]; },
    behind: ({ cx, top }) => [P(`M${cx - 120},${top + 10} Q${cx - 200},${top + 300} ${cx - 190},${top + 620} Q${cx - 60},${top + 650} ${cx + 40},${top + 600} Q${cx + 160},${top + 640} ${cx + 248},${top + 560} Q${cx + 210},${top + 300} ${cx + 120},${top + 10} Z`, '#7a3fb5', INK, 7), L(`M${cx - 60},${top + 120} Q${cx - 80},${top + 400} ${cx - 70},${top + 620} M${cx + 60},${top + 120} Q${cx + 110},${top + 380} ${cx + 140},${top + 610}`, 4, '#8f2219'), hl(`M${cx - 160},${top + 200} Q${cx - 176},${top + 400} ${cx - 170},${top + 580}`, 9, .3)],
    details: ({ cx, top }) => [circ(cx, top + 130, 70, GOLD, 5), L(`M${cx - 34},${top + 140} L${cx},${top + 104} L${cx + 34},${top + 140} M${cx - 34},${top + 172} L${cx},${top + 136} L${cx + 34},${top + 172}`, 14, INK).replace(/stroke-width="14"/, 'stroke-width="16"'), L(`M${cx - 34},${top + 140} L${cx},${top + 104} L${cx + 34},${top + 140} M${cx - 34},${top + 172} L${cx},${top + 136} L${cx + 34},${top + 172}`, 8, RED),
      rect(cx - 160, top + 270, 320, 34, GOLD, 5, 2), rect(cx - 22, top + 266, 44, 42, GOLDL, 4, 6), P(`M${cx - 94},${top + 304} L${cx + 94},${top + 304} L${cx + 50},${top + 360} L${cx - 50},${top + 360} Z`, '#7a3fb5', INK, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 104, B.top + 270, 90), B.arm(1, B.cx + 104, B.top + 270, 90)] }),
    props: ({ cx, top }) => [fist(cx - 104, top + 270, 20), fist(cx + 104, top + 270, 20)] },

  // 9 CYBERPUNK HACKER — neon pink mohawk, glowing visor, hoodie with neon trim, glowing keyboard on cables
  { name: 'hacker', label: 'Cyber Hacker', form: 'noodle', coat: '#2a2740', face: 'troll',
    hat: ({ cx, hy }) => { const o = [], PK = '#ff3fa4';
      let d = `M${cx - 30},${hy - 92}`; for (let k = 0; k < 5; k++) { const x = cx - 30 + k * 15, tip = 150 + (k === 2 ? 30 : k % 2 ? 22 : 8); d += ` L${x + 3},${hy - tip} L${x + 15},${hy - 96}`; }
      o.push(P(d + ` L${cx + 46},${hy - 92} Z`, PK, INK, 5), L(`M${cx - 12},${hy - 104} L${cx - 12},${hy - 140} M${cx + 18},${hy - 104} L${cx + 18},${hy - 150}`, 3, '#ff9fd2'));
      o.push(P(`M${cx - 100},${hy - 24} Q${cx - 96},${hy - 80} ${cx - 40},${hy - 92} L${cx + 40},${hy - 92} Q${cx + 96},${hy - 80} ${cx + 100},${hy - 24}`, 'none', 'none', 0));
      for (const s of [-1, 1]) o.push(L(`M${cx + s * 60},${hy - 70} l${s * 20},14 M${cx + s * 66},${hy - 52} l${s * 18},12`, 3, '#8a8aa0'));
      return o; },
    faceTop: ({ cx, hy }) => [`<path d="M${cx - 104},${hy - 50} Q${cx},${hy - 64} ${cx + 104},${hy - 50} L${cx + 100},${hy - 8} Q${cx},${hy - 20} ${cx - 100},${hy - 8} Z" fill="#2ff3e0" opacity=".35" stroke="#2ff3e0" stroke-width="16"/>`, P(`M${cx - 104},${hy - 50} Q${cx},${hy - 64} ${cx + 104},${hy - 50} L${cx + 100},${hy - 8} Q${cx},${hy - 20} ${cx - 100},${hy - 8} Z`, '#1b3a4a', INK, 5), ...[0, 1, 2].map(k => L(`M${cx - 88},${hy - 44 + k * 12} Q${cx},${hy - 56 + k * 12} ${cx + 88},${hy - 44 + k * 12}`, 3, '#2ff3e0')), L(`M${cx - 60},${hy - 38} l18,0 M${cx + 30},${hy - 30} l30,0`, 5, '#ff3fa4'), circ(cx + 110, hy - 30, 10, '#ff3fa4', 3.4)],
    details: ({ cx, top }) => [L(`M${cx - 14},${top + 30} q-4,40 2,80`, 4, '#2ff3e0'), L(`M${cx + 14},${top + 30} q4,40 -2,80`, 4, '#ff3fa4'), P(`M${cx - 44},${top + 240} L${cx + 44},${top + 240} L${cx + 52},${top + 320} L${cx - 52},${top + 320} Z`, '#232036', INK, 4), L(`M${cx - 70},${top + 120} L${cx + 70},${top + 120}`, 4, '#2ff3e0'), ...[-1, 1].map(s => L(`M${cx + s * 62},${top + 20} L${cx + s * 56},${top + 400}`, 3, '#ff3fa4')), L(`M${cx - 30},${top + 170} l10,-14 l10,14 l10,-14 l10,14 l10,-14`, 3, '#2ff3e0')],
    arms: B => ({ front: [B.arm(-1, B.cx - 100, B.top + 300, 30), B.arm(1, B.cx + 100, B.top + 300, 30)] }),
    props: ({ cx, top }) => { const y = top + 300; const o = [`<rect x="${cx - 148}" y="${y - 36}" width="296" height="64" rx="12" fill="#2ff3e0" opacity=".25"/>`, P(`M${cx - 136},${y - 20} L${cx + 136},${y - 20} L${cx + 120},${y + 18} L${cx - 120},${y + 18} Z`, '#1b1930', INK, 6)];
      for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) o.push(`<rect x="${cx - 118 + k * 24 + r * 4}" y="${y - 14 + r * 10}" width="18" height="7" rx="2" fill="${(k + r) % 4 ? '#2ff3e0' : '#ff3fa4'}"/>`);
      o.push(fist(cx - 100, y, 14), fist(cx + 100, y, 14));
      return o; },
    over: ({ cx, top, hy }) => { const o = []; [['#2ff3e0', 0], ['#ff3fa4', 14], ['#ffe14a', 28]].forEach(([c, d]) => { const p = `M${cx + 136},${30 + d * .6} Q${cx + 220 - d},${200 + d} ${cx + 180 - d},${360} Q${cx + 150 - d},${430} ${cx + 110 + d * .5},${top + 290}`; o.push(L(p, 11, INK), L(p, 5, c)); }); o.push(rect(cx + 124, 18, 22, 30, '#8a8aa0', 4, 4)); return o; } },

  // 10 TIME TRAVELLER — towering top hat with brass goggles + gear, Victorian coat, giant pocket watch, floating clock gears
  { name: 'timetraveller', label: 'Time Traveller', form: 'standard', coat: '#6e4527', face: 'confused',
    hat: ({ cx, hy }) => { const o = [], HT = '#3a2a2a';
      o.push(P(`M${cx - 70},${hy - 76} L${cx - 82},${hy - 250} Q${cx},${hy - 266} ${cx + 82},${hy - 250} L${cx + 70},${hy - 76} Z`, HT, INK, 7), ell(cx, hy - 250, 82, 14, '#4a3636', INK, 5), hl(`M${cx - 58},${hy - 100} L${cx - 66},${hy - 230}`, 9, .3));
      o.push(P(`M${cx - 74},${hy - 130} Q${cx},${hy - 116} ${cx + 74},${hy - 130} L${cx + 72},${hy - 96} Q${cx},${hy - 82} ${cx - 72},${hy - 96} Z`, '#8a5a34', INK, 5));
      for (const s of [-1, 1]) o.push(circ(cx + s * 30, hy - 112, 26, BRONZE, 6), circ(cx + s * 30, hy - 112, 16, '#ffb84a', 4), ell(cx + s * 30 - 6, hy - 118, 5, 4, '#fff'));
      o.push(gear(cx + 64, hy - 180, 30, GOLD, 8, 4.5), P(`M${cx - 136},${hy - 72} Q${cx - 140},${hy - 92} ${cx - 110},${hy - 90} Q${cx},${hy - 82} ${cx + 110},${hy - 90} Q${cx + 140},${hy - 92} ${cx + 136},${hy - 72} Q${cx},${hy - 50} ${cx - 136},${hy - 72} Z`, HT, INK, 6));
      return o; },
    behind: ({ cx, top }) => [gear(cx - 176, top - 40, 64, BRONZE, 10, 6), gear(cx - 196, top + 110, 38, GOLD, 8, 5), gear(cx + 196, top + 250, 50, BRONZE, 9, 5.5), gear(cx + 170, top + 380, 30, STEEL, 7, 4.5)],
    details: ({ cx, top }) => [P(`M${cx - 50},${top} L${cx + 50},${top} L${cx + 56},${top + 220} L${cx - 56},${top + 220} Z`, '#d8a83a', INK, 4), P(`M${cx - 26},${top - 6} L${cx},${top + 40} L${cx + 26},${top - 6} Z`, '#fbf7f2', INK, 3.6), P(`M${cx - 16},${top + 10} Q${cx},${top + 4} ${cx + 16},${top + 10} L${cx + 10},${top + 60} L${cx},${top + 70} L${cx - 10},${top + 60} Z`, '#8e1424', INK, 3.4),
      ...[0, 1, 2, 3].map(k => circ(cx + 14, top + 90 + k * 34, 5, '#6e4527', 2.4)), ...[-1, 1].map(s => L(`M${cx + s * 50},${top} L${cx + s * 78},${top + 90} L${cx + s * 56},${top + 120}`, 4)), L(`M${cx - 40},${top + 150} Q${cx + 40},${top + 186} ${cx + 110},${top + 60}`, 4, GOLD).replace('fill="none"', 'fill="none" stroke-dasharray="5 4"')],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 178, B.top - 20, 40)] }),
    props: ({ cx, top }) => { const x = cx + 182, y = top + 86; const o = [L(`M${cx + 178},${top - 20} L${x},${y - 78}`, 4, GOLD), L(`M${cx + 30},${top + 150} Q${cx + 120},${top + 140} ${x - 6},${y + 64}`, 4, GOLD), circ(x, y - 66, 12, 'none', 5), rect(x - 10, y - 60, 20, 16, GOLD, 4, 3), circ(x, y, 56, GOLD, 7), circ(x, y, 44, '#fbf7f2', 4)];
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; o.push(L(`M${f1(x + Math.cos(a) * 36)},${f1(y + Math.sin(a) * 36)} L${f1(x + Math.cos(a) * 40)},${f1(y + Math.sin(a) * 40)}`, k % 3 ? 2.4 : 4.4)); }
      o.push(L(`M${x},${y} L${x - 4},${y - 30} M${x},${y} L${x + 22},${y + 8}`, 5), circ(x, y, 5, INK, 0), hl(`M${x - 38},${y - 14} Q${x - 30},${y - 36} ${x - 10},${y - 42}`, 6, .6), fist(cx + 178, top - 20, 16));
      return o; } },
];
