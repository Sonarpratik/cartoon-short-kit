// SHEET 04 — FAMOUS FIGURES (affectionate caricatures of real historical people)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, GOLD, GOLDL, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 04: Famous figures';
const SILVERISH = "#e6e8f0", NAVY = '#2d4a8f', WHITE = '#f6f3ee', BRASS = '#d9a441', COPPER = '#c47a3c';
// music note (eighth note) at x,y = note head centre
const note = (x, y, s = 1, col = INK) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${s}) rotate(-18)">${ell(0, 0, 15, 11, col)}<path d="M13,-2 L13,-62 Q30,-50 34,-30" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// zig-zag lightning bolt along points, glow + white core
const bolt = pts => { const d = 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L'); return L(d, 16, INK) + L(d, 10, '#7fd8ff') + L(d, 3.5, '#ffffff'); };

export const CAST = [
  // 1 NAPOLEON: tiny kid body under a GIANT bicorne worn side to side, hand tucked in the coat
  { name: 'napoleon', label: 'Napoleon', form: 'kid', coat: NAVY, face: 'evil',
    faceTop: ({ cx, hy }) => [P(`M${cx + 6},${hy - 96} Q${cx + 14},${hy - 70} ${cx + 34},${hy - 68} Q${cx + 26},${hy - 80} ${cx + 30},${hy - 94} Z`, '#2a2230', INK, 3.4)],
    hat: ({ cx, hy }) => { const o = [];
      const d = `M${cx - 152},${hy - 52} Q${cx - 124},${hy - 140} ${cx - 60},${hy - 182} Q${cx},${hy - 214} ${cx + 60},${hy - 182} Q${cx + 124},${hy - 140} ${cx + 152},${hy - 52} Q${cx + 80},${hy - 92} ${cx},${hy - 94} Q${cx - 80},${hy - 92} ${cx - 152},${hy - 52} Z`;
      o.push(P(d, BLACK, INK, 7), L(`M${cx - 136},${hy - 64} Q${cx - 70},${hy - 96} ${cx},${hy - 100} Q${cx + 70},${hy - 96} ${cx + 136},${hy - 64}`, 9, GOLD));
      o.push(hl(`M${cx - 112},${hy - 112} Q${cx - 70},${hy - 168} ${cx - 10},${hy - 190}`, 9, .28));
      o.push(circ(cx - 34, hy - 128, 24, '#2f5fae', 5), circ(cx - 34, hy - 128, 15, '#fff', 3.4), circ(cx - 34, hy - 128, 7, RED, 3));
      return o; },
    details: ({ cx, top, bot }) => [rect(cx - 30, top - 4, 60, 150, WHITE, 4, 2), ...[0, 1, 2].map(k => circ(cx - 14, top + 54 + k * 30, 5, GOLD, 2.6)),
      P(`M${cx - 30},${top - 4} L${cx - 70},${top + 40} L${cx - 34},${top + 150} L${cx - 30},${top + 150} Z`, '#233a73', INK, 4), P(`M${cx + 30},${top - 4} L${cx + 70},${top + 40} L${cx + 34},${top + 150} L${cx + 30},${top + 150} Z`, '#233a73', INK, 4),
      rect(cx - 100, top - 4, 200, 22, RED, 4, 2), rect(cx - 100, top + 148, 200, 80, WHITE, 4, 2), L(`M${cx},${top + 160} L${cx},${bot}`, 3)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1], 16), B.arm(1, B.cx + 16, B.top + 78, -28)] }),
    props: ({ cx, top }) => [...[-1, 1].flatMap(s => [ell(cx + s * 60, top + 26, 30, 14, GOLD, INK, 4.5), ...[0, 1, 2, 3, 4].map(k => L(`M${cx + s * (40 + k * 10)},${top + 38} l${s * 2},16`, 4, GOLD))]),
      P(`M${cx - 2},${top + 50} L${cx + 40},${top + 58} L${cx + 34},${top + 106} L${cx + 2},${top + 98} Z`, '#233a73', INK, 4)] },

  // 2 EINSTEIN: white hair explosion, bushy moustache, chalk at the blackboard
  { name: 'einstein', label: 'Albert Einstein', form: 'standard', coat: '#827a6e', face: 'delight',
    headBack: ({ cx, hy }) => { const cs = [];
      for (let k = 0; k <= 16; k++) { const a = (-205 + k * 14.4) * Math.PI / 180, r = k % 2 ? 128 : 120; cs.push([cx + Math.cos(a) * r, hy - 6 + Math.sin(a) * r * .95, k % 2 ? 30 : 38]); }
      const o = [cloud(cs, '#f3f3f7', 5)];
      for (let k = 0; k <= 16; k += 2) { const a = (-205 + k * 14.4) * Math.PI / 180; o.push(L(`M${f1(cx + Math.cos(a) * 112)},${f1(hy - 6 + Math.sin(a) * 106)} q${f1(Math.cos(a) * 24)},${f1(Math.sin(a) * 18 - 8)} ${f1(Math.cos(a) * 40)},${f1(Math.sin(a) * 34)}`, 3.4, '#b6b5c4')); }
      for (const [a, len] of [[-150, 60], [-110, 70], [-70, 66], [-30, 58]]) { const r = a * Math.PI / 180, x = cx + Math.cos(r) * 150, y = hy - 6 + Math.sin(r) * 150; o.push(L(`M${f1(x)},${f1(y)} q${f1(Math.cos(r) * 14 + 10)},${f1(Math.sin(r) * 14)} ${f1(Math.cos(r) * len * .5)},${f1(Math.sin(r) * len * .5)}`, 5, INK)); }
      return o; },
    faceTop: ({ cx, hy }) => [cloud([[cx - 34, hy + 30, 17], [cx - 14, hy + 24, 18], [cx + 8, hy + 24, 18], [cx + 30, hy + 30, 17], [cx - 44, hy + 40, 12], [cx + 42, hy + 40, 12]], '#e9e9ef', 4), ...[-26, -8, 10, 28].map(dx => L(`M${cx + dx},${hy + 28} l${dx > 0 ? 3 : -3},12`, 2.4, '#a9a8b8'))],
    behind: ({ cx, top }) => [rect(cx - 248, top + 10, 168, 150, '#2f4a3c', 8, 6), rect(cx - 248, top + 10, 168, 150, 'none', 3, 6), L(`M${cx - 240},${top + 166} L${cx - 88},${top + 166}`, 10, WOOD),
      `<text x="${cx - 236}" y="${top + 66}" font-family="Comic Sans MS, Chalkboard, cursive" font-weight="700" font-size="40" fill="#f4f4f0">E=mc²</text>`,
      L(`M${cx - 234},${top + 100} q14,-12 26,0 t26,0 M${cx - 232},${top + 130} l40,0 M${cx - 176},${top + 100} l22,0 M${cx - 165},${top + 90} l0,20`, 3.4, '#e8e8e2')],
    details: ({ cx, top }) => [P(`M${cx - 40},${top - 6} L${cx},${top + 100} L${cx + 40},${top - 6} Z`, WHITE, INK, 4), P(`M${cx - 42},${top - 6} L${cx - 66},${top + 130} L${cx - 6},${top + 112} Z M${cx + 42},${top - 6} L${cx + 66},${top + 130} L${cx + 6},${top + 112} Z`, '#6f685d', INK, 4),
      rect(cx + 34, top + 150, 44, 50, '#6f685d', 4, 4), L(`M${cx + 46},${top + 150} l0,-24 M${cx + 60},${top + 150} l0,-30`, 6, '#e2b13c'), ...[[-50, 210], [20, 240], [-20, 180], [40, 120]].map(([dx, dy]) => ell(cx + dx, top + dy, 14, 7, '#fff', '', 0).replace('/>', ' opacity=".4"/>'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 130, B.top + 136, 30), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top }) => [rect(cx - 146, top + 108, 12, 26, '#fff', 3.4, 3), fist(cx - 130, top + 136, 15)] },

  // 3 LINCOLN: endless noodle under a towering stovepipe hat, chin beard, bow tie
  { name: 'lincoln', label: 'Abraham Lincoln', form: 'noodle', coat: '#26232c', face: 'bruh',
    faceTop: ({ cx, hy }) => [P(`M${cx - 99},${hy - 8} Q${cx - 104},${hy + 92} ${cx - 44},${hy + 122} Q${cx},${hy + 144} ${cx + 44},${hy + 122} Q${cx + 104},${hy + 92} ${cx + 99},${hy - 8} Q${cx + 84},${hy + 58} ${cx + 40},${hy + 70} Q${cx},${hy + 78} ${cx - 40},${hy + 70} Q${cx - 84},${hy + 58} ${cx - 99},${hy - 8} Z`, '#2e2630', INK, 5),
      ...[-60, -30, 0, 30, 60].map(dx => L(`M${cx + dx},${hy + 86 + Math.abs(dx) * .2} l${dx * .06},22`, 2.6, '#4a3f4e')),
      ...[-1, 1].map(s => P(`M${cx + s * 100},${hy - 62} Q${cx + s * 112},${hy - 30} ${cx + s * 100},${hy - 4} Q${cx + s * 88},${hy - 30} ${cx + s * 86},${hy - 62} Z`, '#2e2630', INK, 4))],
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 76},${hy - 64} L${cx - 84},${hy - 262} Q${cx},${hy - 274} ${cx + 84},${hy - 262} L${cx + 76},${hy - 64} Z`, BLACK, INK, 7));
      o.push(P(`M${cx - 77},${hy - 90} L${cx + 77},${hy - 90} L${cx + 76},${hy - 64} L${cx - 76},${hy - 64} Z`, '#45414e', INK, 4));
      o.push(ell(cx, hy - 262, 84, 12, '#34313c', INK, 5), hl(`M${cx - 58},${hy - 104} L${cx - 62},${hy - 240}`, 10, .22));
      o.push(P(`M${cx - 126},${hy - 56} Q${cx},${hy - 36} ${cx + 126},${hy - 56} Q${cx + 132},${hy - 72} ${cx + 106},${hy - 76} Q${cx},${hy - 62} ${cx - 106},${hy - 76} Q${cx - 132},${hy - 72} ${cx - 126},${hy - 56} Z`, BLACK, INK, 6));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 26},${top - 6} L${cx},${top + 80} L${cx + 26},${top - 6} Z`, WHITE, INK, 4), L(`M${cx},${top + 80} L${cx},${top + 400}`, 3.4, '#4a4552'), ...[0, 1, 2].map(k => circ(cx + 10, top + 120 + k * 50, 5, '#4a4552', 2.4)),
      L(`M${cx - 50},${top + 230} q30,20 50,0`, 4, GOLD)],
    props: ({ cx, top }) => [P(`M${cx},${top + 22} L${cx - 30},${top + 6} L${cx - 30},${top + 40} Z M${cx},${top + 22} L${cx + 30},${top + 6} L${cx + 30},${top + 40} Z`, '#1a1820', INK, 4), circ(cx, top + 22, 7, '#1a1820', 3),
      `<g transform="rotate(-12 ${cx - 90} ${top + 300})">${rect(cx - 104, top + 262, 30, 84, CREAM, 4, 6)}${L(`M${cx - 98},${top + 280} l18,0 M${cx - 98},${top + 296} l18,0 M${cx - 98},${top + 312} l14,0`, 2.4, '#b8ae98')}</g>`, fist(cx - 84, top + 330, 13)] },

  // 4 LEONARDO: long white hair + beard down the chest, floppy beret, palette and brush
  { name: 'leonardo', label: 'Leonardo da Vinci', form: 'elder', coat: '#a5433a', face: ['elder', 'proudTears'],
    headBack: ({ cx, hy }) => [P(`M${cx - 96},${hy - 70} Q${cx - 132},${hy + 40} ${cx - 120},${hy + 170} Q${cx - 70},${hy + 186} ${cx - 50},${hy + 120} L${cx + 50},${hy + 120} Q${cx + 70},${hy + 186} ${cx + 120},${hy + 170} Q${cx + 132},${hy + 40} ${cx + 96},${hy - 70} Z`, '#f1f0f5', INK, 6),
      ...[-1, 1].map(s => L(`M${cx + s * 108},${hy + 10} q${s * 6},60 ${s * -2},140 M${cx + s * 96},${hy + 40} q${s * 4},50 ${s * 4},110`, 3, '#b3b1c2'))],
    faceTop: ({ cx, hy }) => [P(`M${cx - 92},${hy + 22} Q${cx - 80},${hy + 96} ${cx - 60},${hy + 160} Q${cx - 40},${hy + 230} ${cx - 6},${hy + 290} Q${cx + 10},${hy + 250} ${cx + 30},${hy + 280} Q${cx + 50},${hy + 200} ${cx + 66},${hy + 150} Q${cx + 84},${hy + 92} ${cx + 92},${hy + 22} Q${cx + 70},${hy + 70} ${cx + 30},${hy + 74} Q${cx},${hy + 60} ${cx - 30},${hy + 74} Q${cx - 70},${hy + 70} ${cx - 92},${hy + 22} Z`, '#f1f0f5', INK, 5),
      ...[[-50, 110, 70], [-20, 130, 100], [14, 120, 110], [44, 110, 70], [-34, 200, 50], [10, 200, 50]].map(([dx, dy, l]) => L(`M${cx + dx},${hy + dy} q${dx > 0 ? -8 : 8},${l / 2} ${dx > 0 ? -2 : 2},${l}`, 3, '#b3b1c2')),
      P(`M${cx - 4},${hy + 52} Q${cx - 34},${hy + 44} ${cx - 54},${hy + 60} Q${cx - 66},${hy + 80} ${cx - 62},${hy + 98} Q${cx - 46},${hy + 70} ${cx - 4},${hy + 66} Z M${cx + 4},${hy + 52} Q${cx + 34},${hy + 44} ${cx + 54},${hy + 60} Q${cx + 66},${hy + 80} ${cx + 62},${hy + 98} Q${cx + 46},${hy + 70} ${cx + 4},${hy + 66} Z`, '#e6e5ec', INK, 4)],
    hat: ({ cx, hy }) => [`<g transform="rotate(-10 ${cx} ${hy - 80})">${P(`M${cx - 132},${hy - 66} Q${cx - 150},${hy - 120} ${cx - 60},${hy - 146} Q${cx + 40},${hy - 164} ${cx + 120},${hy - 128} Q${cx + 160},${hy - 104} ${cx + 128},${hy - 72} Q${cx},${hy - 44} ${cx - 132},${hy - 66} Z`, '#2f2a40', INK, 7)}${hl(`M${cx - 110},${hy - 100} Q${cx - 60},${hy - 136} ${cx},${hy - 140}`, 9, .3)}${ell(cx + 6, hy - 150, 12, 9, '#2f2a40', INK, 4)}</g>`],
    details: ({ cx, top }) => [rect(cx - 140, top + 200, 280, 22, '#6e2a26', 4, 2), L(`M${cx - 40},${top + 30} q-10,120 4,240 M${cx + 50},${top + 30} q10,120 -4,240`, 3.4, '#7e2f2a')],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 120, 20), B.arm(1, B.cx + 150, B.top + 60, -20)] }),
    props: ({ cx, top }) => { const x = cx - 168, y = top + 130; return [P(`M${x - 66},${y - 30} Q${x - 50},${y - 72} ${x + 10},${y - 64} Q${x + 70},${y - 56} ${x + 66},${y} Q${x + 60},${y + 50} ${x},${y + 46} Q${x - 30},${y + 44} ${x - 30},${y + 20} Q${x - 10},${y + 4} ${x - 40},${y} Q${x - 74},${y - 4} ${x - 66},${y - 30} Z`, '#d9b07a', INK, 6),
      ...[['#d8473c', -36, -40], ['#2f8fd0', -6, -48], ['#e2b13c', 26, -38], ['#4f9a3a', 40, -10], ['#ffffff', 26, 22]].map(([c, dx, dy]) => circ(x + dx, y + dy, 11, c, 3.4)), fist(cx - 150, top + 120, 15),
      pole(cx + 150, top + 80, cx + 196, top - 110, WOOD, 8), P(`M${cx + 196},${top - 110} l-4,-18 q8,-26 18,0 l-4,18 Z`, '#d8473c', INK, 4), fist(cx + 150, top + 60, 15)]; } },

  // 5 SHAKESPEARE: huge ruff collar, receding hair, quill raised, weeping at the skull
  { name: 'shakespeare', label: 'William Shakespeare', form: 'dad', coat: '#2c2a3c', face: 'puppy',
    headBack: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 84},${hy - 66} Q${cx + s * 130},${hy - 10} ${cx + s * 122},${hy + 70} Q${cx + s * 114},${hy + 104} ${cx + s * 88},${hy + 90} Q${cx + s * 96},${hy + 20} ${cx + s * 70},${hy - 50} Z`, '#7a4a2a', INK, 6))],
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 98},${hy - 50} Q${cx + s * 112},${hy} ${cx + s * 104},${hy + 50} Q${cx + s * 92},${hy + 20} ${cx + s * 86},${hy - 40} Z`, '#7a4a2a', INK, 4)),
      L(`M${cx - 30},${hy - 100} q20,-10 40,-4 M${cx - 10},${hy - 92} q24,-12 46,-2`, 3, '#7a4a2a'), circ(cx - 104, hy + 70, 8, GOLD, 3),
      P(`M${cx},${hy + 34} Q${cx - 24},${hy + 26} ${cx - 46},${hy + 40} Q${cx - 54},${hy + 46} ${cx - 50},${hy + 52} Q${cx - 30},${hy + 40} ${cx},${hy + 44} Q${cx + 30},${hy + 40} ${cx + 50},${hy + 52} Q${cx + 54},${hy + 46} ${cx + 46},${hy + 40} Q${cx + 24},${hy + 26} ${cx},${hy + 34} Z`, '#7a4a2a', INK, 3.4), P(`M${cx - 12},${hy + 70} Q${cx},${hy + 66} ${cx + 12},${hy + 70} L${cx},${hy + 100} Z`, '#7a4a2a', INK, 3.4)],
    props: ({ cx, top }) => { const cs = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; cs.push([cx + Math.cos(a) * 176, top + 14 + Math.sin(a) * 50, 28]); }
      const sk = [cx - 186, top + 86];
      return [cloud(cs, WHITE, 5), ell(cx, top + 14, 160, 40, WHITE), ...[...Array(18)].map((_, k) => { const a = k / 18 * Math.PI * 2; return L(`M${f1(cx + Math.cos(a) * 140)},${f1(top + 14 + Math.sin(a) * 36)} L${f1(cx + Math.cos(a) * 196)},${f1(top + 14 + Math.sin(a) * 58)}`, 3, '#c9c3b6'); }),
        P(`M${sk[0] - 40},${sk[1]} Q${sk[0] - 42},${sk[1] - 52} ${sk[0]},${sk[1] - 54} Q${sk[0] + 42},${sk[1] - 52} ${sk[0] + 40},${sk[1]} Q${sk[0] + 38},${sk[1] + 22} ${sk[0] + 22},${sk[1] + 28} L${sk[0] + 20},${sk[1] + 46} L${sk[0] - 20},${sk[1] + 46} L${sk[0] - 22},${sk[1] + 28} Q${sk[0] - 38},${sk[1] + 22} ${sk[0] - 40},${sk[1]} Z`, '#efe8d6', INK, 5),
        ell(sk[0] - 16, sk[1] - 2, 11, 13, INK), ell(sk[0] + 16, sk[1] - 2, 11, 13, INK), P(`M${sk[0]},${sk[1] + 12} l-5,10 l10,0 Z`, INK, INK, 2), L(`M${sk[0] - 12},${sk[1] + 34} l0,10 M${sk[0]},${sk[1] + 34} l0,10 M${sk[0] + 12},${sk[1] + 34} l0,10`, 3), fist(cx - 176, top + 140, 15),
        P(`M${cx + 158},${top + 150} Q${cx + 170},${top + 40} ${cx + 230},${top - 70} Q${cx + 238},${top - 10} ${cx + 206},${top + 50} Q${cx + 190},${top + 100} ${cx + 164},${top + 150} Z`, WHITE, INK, 5), L(`M${cx + 160},${top + 160} Q${cx + 186},${top + 40} ${cx + 230},${top - 70}`, 3, '#b8b0a0'),
        ...[0, 1, 2, 3].map(k => L(`M${cx + 178 + k * 10},${top + 60 - k * 30} l14,-6`, 2.4, '#b8b0a0')), fist(cx + 158, top + 150, 15)]; },
    details: ({ cx, top }) => [L(`M${cx},${top + 40} L${cx},${top + 300}`, 4, '#4a465c'), ...[0, 1, 2, 3, 4].map(k => circ(cx, top + 70 + k * 44, 6, GOLD, 2.6)), ...[-1, 1].flatMap(s => [0, 1, 2].map(k => L(`M${cx + s * (40 + k * 26)},${top + 60} q${s * 6},100 0,220`, 3, '#46425a')))],
    arms: B => ({ front: [B.arm(-1, B.cx - 176, B.top + 140, 20), B.arm(1, B.cx + 158, B.top + 150, -16)] }) },

  // 6 QUEEN VICTORIA: black mourning dress, small crown, white veil falling wide
  { name: 'victoria', label: 'Queen Victoria', form: 'lady', coat: '#24212b', face: ['female', 'judging'],
    headBack: ({ cx, hy }) => [P(`M${cx - 40},${hy - 118} Q${cx - 112},${hy - 70} ${cx - 126},${hy + 30} L${cx - 132},${hy + 150} Q${cx - 112},${hy + 166} ${cx - 92},${hy + 150} Q${cx - 72},${hy + 166} ${cx - 52},${hy + 150} L${cx + 52},${hy + 150} Q${cx + 72},${hy + 166} ${cx + 92},${hy + 150} Q${cx + 112},${hy + 166} ${cx + 132},${hy + 150} L${cx + 126},${hy + 30} Q${cx + 112},${hy - 70} ${cx + 40},${hy - 118} Z`, '#f3f0f6', INK, 6),
      ...[-1, 1].flatMap(s => [ell(cx + s * 112, hy + 140, 5, 5, '#c3bfd0'), ell(cx + s * 92, hy + 142, 5, 5, '#c3bfd0'), L(`M${cx + s * 116},${hy + 20} q${s * 6},60 ${s * 6},110`, 3, '#c3bfd0')]), P(`M${cx - 104},${hy - 30} Q${cx - 118},${hy + 40} ${cx - 92},${hy + 80} L${cx + 92},${hy + 80} Q${cx + 118},${hy + 40} ${cx + 104},${hy - 30} Z`, '#4a3630', INK, 5)],
    faceTop: ({ cx, hy }) => [P(`M${cx},${hy - 108} Q${cx - 70},${hy - 110} ${cx - 92},${hy - 60} Q${cx - 106},${hy - 20} ${cx - 98},${hy + 26} Q${cx - 80},${hy - 20} ${cx - 50},${hy - 52} Q${cx - 20},${hy - 72} ${cx},${hy - 90} Q${cx + 20},${hy - 72} ${cx + 50},${hy - 52} Q${cx + 80},${hy - 20} ${cx + 98},${hy + 26} Q${cx + 106},${hy - 20} ${cx + 92},${hy - 60} Q${cx + 70},${hy - 110} ${cx},${hy - 108} Z`, '#4a3630', INK, 5),
      hl(`M${cx - 70},${hy - 84} Q${cx - 40},${hy - 100} ${cx - 14},${hy - 98}`, 6, .3), ...[-1, 1].map(s => circ(cx + s * 98, hy + 52, 7, '#f3f0f6', 3))],
    hat: ({ cx, hy }) => { const y = hy - 104; return [P(`M${cx - 40},${y + 6} L${cx - 46},${y - 34} L${cx - 22},${y - 14} L${cx},${y - 46} L${cx + 22},${y - 14} L${cx + 46},${y - 34} L${cx + 40},${y + 6} Q${cx},${y + 16} ${cx - 40},${y + 6} Z`, GOLD, INK, 5), circ(cx, y - 50, 7, GOLD, 3), circ(cx - 46, y - 38, 5, GOLD, 2.6), circ(cx + 46, y - 38, 5, GOLD, 2.6),
      ...[[-24, -2, RED], [0, 0, '#2f8fd0'], [24, -2, RED]].map(([dx, dy, c]) => circ(cx + dx, y + dy, 5, c, 2.4)), hl(`M${cx - 34},${y - 4} L${cx - 38},${y - 24}`, 4, .5)]; },
    details: ({ cx, top }) => [P(`M${cx - 54},${top - 4} Q${cx},${top + 40} ${cx + 54},${top - 4} L${cx + 40},${top + 30} Q${cx},${top + 60} ${cx - 40},${top + 30} Z`, '#f3f0f6', INK, 4), L(`M${cx - 70},${top + 30} L${cx + 90},${top + 200}`, 16, '#2f5fae'), star4(cx + 24, top + 150, 16, SILVERISH),
      ...[0, 1, 2, 3].map(k => L(`M${cx - 150 + k * 90},${top + 250} q10,60 -6,140`, 3, '#3a3644')), L(`M${cx - 170},${top + 372} ${[...Array(12)].map(() => 'q14,16 28,0').join(' ')}`, 4, '#4a4552')],
    props: ({ hdR }) => { const [x, y] = hdR; return [P(`M${x},${y} L${x - 30},${y + 70} Q${x},${y + 84} ${x + 30},${y + 70} Z`, '#24212b', INK, 4), ...[-20, -10, 0, 10, 20].map(d => L(`M${x},${y} L${x + d},${y + 74}`, 2.2, '#4a4552')), fist(x, y, 13)]; } },

  // 7 BEETHOVEN: wild storm-cloud mane, conducting furiously, notes flying
  { name: 'beethoven', label: 'Ludwig van Beethoven', form: 'chad', coat: '#2f4057', face: 'strain',
    headBack: ({ cx, hy }) => { const pts = []; for (let k = 0; k <= 22; k++) { const a = (-215 + k * 12.3) * Math.PI / 180, r = k % 2 ? 132 : 180; pts.push([cx + Math.cos(a) * r, hy - 4 + Math.sin(a) * r * .92]); }
      const d = 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L') + ` L${cx + 100},${hy + 80} L${cx - 100},${hy + 80} Z`;
      return [P(d, '#a8a5b2', INK, 7), ...[-150, -120, -90, -60, -30, -170, -10].map(a => { const r = a * Math.PI / 180; return L(`M${f1(cx + Math.cos(r) * 110)},${f1(hy + Math.sin(r) * 100)} L${f1(cx + Math.cos(r + .08) * 150)},${f1(hy + Math.sin(r + .08) * 136)}`, 3.4, '#77738a'); })]; },
    faceTop: ({ cx, hy }) => [P(`M${cx - 96},${hy - 50} L${cx - 70},${hy - 74} L${cx - 66},${hy - 52} L${cx - 40},${hy - 84} L${cx - 30},${hy - 62} L${cx},${hy - 92} L${cx + 14},${hy - 66} L${cx + 46},${hy - 86} L${cx + 50},${hy - 60} L${cx + 80},${hy - 72} L${cx + 96},${hy - 50} L${cx + 80},${hy - 104} Q${cx},${hy - 134} ${cx - 80},${hy - 104} Z`, '#a8a5b2', INK, 5)],
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 6} L${cx - 10},${top + 260} L${cx - 110},${top + 220} L${cx - 150},${top + 20} Z M${cx + 60},${top - 6} L${cx + 10},${top + 260} L${cx + 110},${top + 220} L${cx + 150},${top + 20} Z`, '#253247', INK, 4),
      P(`M${cx - 50},${top - 4} Q${cx},${top + 20} ${cx + 50},${top - 4} Q${cx + 40},${top + 70} ${cx + 10},${top + 110} Q${cx},${top + 130} ${cx - 10},${top + 110} Q${cx - 40},${top + 70} ${cx - 50},${top - 4} Z`, WHITE, INK, 4), L(`M${cx - 14},${top + 40} q14,10 28,0 M${cx - 10},${top + 70} q10,8 20,0`, 3, '#c9c3b6'), ...[0, 1, 2].map(k => circ(cx - 30 + k * 30, top + 290, 7, GOLD, 3))],
    arms: B => ({ front: [B.arm(-1, B.cx - 222, B.top + 120, -10), B.arm(1, B.cx + 200, B.top - 40, -30)] }),
    props: ({ cx, top }) => [rect(cx - 246, top + 70, 50, 70, CREAM, 4, 3), ...[0, 1, 2, 3].map(k => L(`M${cx - 240},${top + 86 + k * 12} l38,0`, 2, '#9a9080')), ell(cx - 226, top + 98, 4, 3, INK), ell(cx - 214, top + 110, 4, 3, INK), fist(cx - 222, top + 120, 20)],
    over: ({ cx, top }) => [L(`M${cx + 200},${top - 40} L${cx + 238},${top - 190}`, 13, INK), L(`M${cx + 200},${top - 40} L${cx + 238},${top - 190}`, 6, '#fff'), fist(cx + 200, top - 40, 20),
      note(cx - 200, top - 150, 1.1), note(cx - 140, top - 230, .9), note(cx + 150, top - 250, .85), L(`M${cx + 222},${top - 214} l6,-14 M${cx + 236},${top - 200} l6,-4 M${cx + 206},${top - 200} l-12,-10`, 4)] },

  // 8 MARIE CURIE: dark dress, brown bun, a GLOWING green flask held out
  { name: 'curie', label: 'Marie Curie', form: 'lady', coat: '#3c3f52', face: ['female', 'fangirl'], hair: 'bob',
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 4} L${cx},${top + 30} L${cx + 30},${top - 4} Z`, WHITE, INK, 3.4), ...[0, 1, 2, 3].map(k => circ(cx, top + 50 + k * 26, 4.5, '#8a8ca0', 2.4)), rect(cx - 80, top + 120, 160, 16, '#2b2d3c', 3.4, 2),
      ...[0, 1, 2, 3].map(k => L(`M${cx - 130 + k * 85},${top + 200} q8,90 -4,180`, 3, '#2e3040')), L(`M${cx - 170},${top + 372} ${[...Array(12)].map(() => 'q14,16 28,0').join(' ')}`, 4, '#2b2d3c')],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 160, 10), B.arm(1, B.cx + 168, B.top + 176, -10)] }),
    props: ({ cx, top }) => { const x = cx + 180, y = top + 112; return [
      `<circle cx="${x}" cy="${y}" r="62" fill="#9dff7a" opacity=".22"/><circle cx="${x}" cy="${y}" r="50" fill="#b8ff9a" opacity=".35"/>`,
      P(`M${x - 13},${y - 86} L${x - 13},${y - 40} Q${x - 44},${y - 26} ${x - 44},${y + 4} Q${x - 44},${y + 42} ${x},${y + 42} Q${x + 44},${y + 42} ${x + 44},${y + 4} Q${x + 44},${y - 26} ${x + 13},${y - 40} L${x + 13},${y - 86} Z`, '#eaf6f4', INK, 5),
      P(`M${x - 40},${y - 2} Q${x},${y + 8} ${x + 40},${y - 2} Q${x + 42},${y + 38} ${x},${y + 38} Q${x - 42},${y + 38} ${x - 40},${y - 2} Z`, '#6cf04f', 'none', 0), ell(x, y + 4, 40, 6, '#a8ff8a'), circ(x - 10, y + 18, 5, '#d8ffc8', 0), circ(x + 14, y + 12, 3.5, '#d8ffc8', 0),
      rect(x - 18, y - 96, 36, 14, WOOD, 4, 4), hl(`M${x - 28},${y - 10} Q${x - 30},${y + 18} ${x - 14},${y + 30}`, 5, .7), star4(x + 46, y - 64, 12, '#c8ff6a'), star4(x - 58, y - 52, 9, '#c8ff6a'), fist(cx + 168, top + 176, 13),
      `<g transform="rotate(8 ${cx - 120} ${top + 180})">${rect(cx - 150, top + 150, 56, 70, '#7a2d3a', 4, 4)}${L(`M${cx - 140},${top + 150} l0,70`, 4, '#5a1f2a')}</g>`, fist(cx - 120, top + 160, 13)]; } },

  // 9 TESLA: slick centre-parted hair, pencil moustache, his coil crackling beside him
  { name: 'tesla', label: 'Nikola Tesla', form: 'standard', coat: '#2b2a36', face: 'cool',
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 30} Q${cx - 108},${hy - 104} ${cx - 40},${hy - 124} Q${cx},${hy - 132} ${cx + 40},${hy - 124} Q${cx + 108},${hy - 104} ${cx + 104},${hy - 30} Q${cx + 96},${hy - 60} ${cx + 60},${hy - 70} Q${cx + 20},${hy - 74} ${cx + 4},${hy - 100} Q${cx - 20},${hy - 74} ${cx - 60},${hy - 70} Q${cx - 96},${hy - 60} ${cx - 104},${hy - 30} Z`, '#1f1c26', INK, 6),
      hl(`M${cx - 80},${hy - 84} Q${cx - 50},${hy - 112} ${cx - 16},${hy - 116}`, 9, .45), hl(`M${cx + 30},${hy - 112} Q${cx + 60},${hy - 106} ${cx + 80},${hy - 84}`, 5, .3)],
    faceTop: ({ cx, hy }) => [P(`M${cx},${hy + 22} Q${cx - 24},${hy + 14} ${cx - 50},${hy + 30} Q${cx - 30},${hy + 26} ${cx},${hy + 32} Q${cx + 30},${hy + 26} ${cx + 50},${hy + 30} Q${cx + 24},${hy + 14} ${cx},${hy + 22} Z`, '#1f1c26', INK, 3)],
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 6} L${cx},${top + 70} L${cx + 30},${top - 6} Z`, WHITE, INK, 4), P(`M${cx},${top + 20} l-14,-10 l0,20 Z M${cx},${top + 20} l14,-10 l0,20 Z`, INK, INK, 2),
      P(`M${cx - 32},${top - 6} L${cx - 60},${top + 110} L${cx - 4},${top + 200} Z M${cx + 32},${top - 6} L${cx + 60},${top + 110} L${cx + 4},${top + 200} Z`, '#3a3948', INK, 4), ...[0, 1].map(k => circ(cx + 14, top + 220 + k * 34, 5, '#5a5868', 2.4))],
    behind: ({ cx }) => { const x = cx - 178; return [rect(x - 44, 950, 88, 56, WOODD, 5, 4), rect(x - 26, 470, 52, 484, COPPER, 6, 6), ...[...Array(26)].map((_, k) => L(`M${x - 24},${484 + k * 18} L${x + 24},${490 + k * 18}`, 2.6, '#8a4e22')), hl(`M${x - 14},${490} L${x - 14},${940}`, 6, .35),
      L(`M${x},470 L${x},440`, 10, INK), ell(x, 420, 62, 26, STEEL, INK, 6), hl(`M${x - 44},${414} Q${x - 20},${402} ${x + 10},${402}`, 6, .6)]; },
    arms: B => ({ front: [B.arm(-1, B.cx - 130, B.top + 150, 24), B.arm(1, B.hdR[0], B.hdR[1])] }),
    over: ({ cx }) => { const x = cx - 178; return [bolt([[x - 30, 402], [x - 10, 340], [x - 48, 310], [x - 20, 230], [x - 50, 190]]), bolt([[x + 30, 402], [x + 50, 350], [x + 20, 320], [x + 46, 260]]), bolt([[x - 58, 418], [x - 52, 470], [x - 60, 520]]), star4(x - 50, 180, 16, '#bdf0ff'), star4(x + 48, 250, 12, '#bdf0ff'), star4(x - 62, 530, 10, '#bdf0ff')]; } },

  // 10 COLUMBUS: big boi explorer, plumed hat, brass spyglass up, map in hand
  { name: 'columbus', label: 'Christopher Columbus', form: 'bigboi', coat: '#2f5590', face: 'jawdrop',
    hat: ({ cx, hy }) => { const o = [];
      o.push(`<g transform="translate(${cx},${hy - 120}) scale(.9) translate(${-cx},${-(hy - 120)})">`, P(`M${cx + 20},${hy - 120} Q${cx + 70},${hy - 210} ${cx + 150},${hy - 180} Q${cx + 170},${hy - 140} ${cx + 156},${hy - 70} Q${cx + 140},${hy - 120} ${cx + 110},${hy - 128} Q${cx + 120},${hy - 100} ${cx + 110},${hy - 80} Q${cx + 80},${hy - 120} ${cx + 30},${hy - 100} Z`, WHITE, INK, 5), L(`M${cx + 40},${hy - 116} Q${cx + 110},${hy - 170} ${cx + 150},${hy - 100}`, 3, '#c9c3b6'), '</g>');
      o.push(P(`M${cx - 10},${hy - 120} Q${cx + 20},${hy - 220} ${cx + 100},${hy - 214} Q${cx + 60},${hy - 180} ${cx + 40},${hy - 120} Z`, RED, INK, 5));
      o.push(fillPts([[cx - 96, hy - 64], [cx - 90, hy - 116], [cx - 40, hy - 140], [cx + 30, hy - 142], [cx + 86, hy - 120], [cx + 96, hy - 64], [cx, hy - 76]], '#7a2430', 7));
      o.push(P(`M${cx - 132},${hy - 50} Q${cx},${hy - 96} ${cx + 132},${hy - 50} Q${cx + 124},${hy - 30} ${cx + 96},${hy - 38} Q${cx},${hy - 70} ${cx - 96},${hy - 38} Q${cx - 124},${hy - 30} ${cx - 132},${hy - 50} Z`, '#5e1a24', INK, 6), circ(cx + 70, hy - 82, 10, GOLD, 3.4), hl(`M${cx - 70},${hy - 110} Q${cx - 30},${hy - 132} ${cx + 10},${hy - 132}`, 8, .35));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 70},${top - 4} Q${cx},${top + 40} ${cx + 70},${top - 4} L${cx + 50},${top + 34} Q${cx},${top + 60} ${cx - 50},${top + 34} Z`, WHITE, INK, 4), L(`M${cx},${top + 50} L${cx},${top + 470}`, 10, GOLD), L(`M${cx},${top + 50} L${cx},${top + 470}`, 3, '#b0802a'),
      rect(cx - 240, top + 290, 480, 40, '#6e4527', 5, 3), rect(cx - 28, top + 284, 56, 52, GOLD, 5, 6), rect(cx - 14, top + 298, 28, 24, '#6e4527', 3, 3), ...[-1, 1].flatMap(s => [0, 1, 2, 3].map(k => L(`M${cx + s * (60 + k * 40)},${top + 40 + k * 10} q${s * 10},100 0,220`, 3, '#284878')))],
    arms: B => ({ front: [B.arm(-1, B.cx - 210, B.top + 260, 20), B.arm(1, B.cx + 196, B.top + 60, 20)] }),
    props: ({ cx, top }) => { const x = cx - 210, y = top + 260; return [`<g transform="rotate(-8 ${x} ${y})">${rect(x - 26, y - 40, 52, 120, '#efe2bf', 5, 4)}${ell(x, y - 40, 30, 10, '#e2d2a8', INK, 4)}${ell(x, y + 80, 30, 10, '#e2d2a8', INK, 4)}${L(`M${x - 14},${y - 14} q10,10 4,26 q-10,14 6,30 M${x + 4},${y + 50} l6,-8 M${x - 10},${y + 26} l16,0`, 3, '#5a8ac0')}${L(`M${x - 6},${y + 10} q10,20 16,40`, 3, '#c94a3a').replace('/>', ' stroke-dasharray="4 6"/>')}${P(`M${x + 6},${y + 54} l8,8 M${x + 14},${y + 54} l-8,8`, 'none', '#c94a3a', 3)}</g>`, fist(x, y, 17)]; },
    over: ({ cx, top }) => { const x0 = cx + 176, y0 = top + 90, x1 = cx + 214, y1 = top - 130; return [`<g transform="rotate(${f1(Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI)} ${x0} ${y0})">${rect(x0 - 10, y0 - 13, 90, 26, BRASS, 5, 4)}${rect(x0 + 76, y0 - 16, 80, 32, BRASS, 5, 4)}${rect(x0 + 150, y0 - 20, 76, 40, '#b8862e', 5, 4)}${rect(x0 + 222, y0 - 22, 16, 44, BRASS, 5, 4)}${hl(`M${x0},${y0 - 6} L${x0 + 220},${y0 - 10}`, 5, .5)}</g>`, fist(cx + 196, top + 60, 18)]; } },
];

