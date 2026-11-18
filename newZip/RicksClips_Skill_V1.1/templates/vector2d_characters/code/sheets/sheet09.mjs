// SHEET 09 — SPORTS & SHOWBIZ
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, star5, heart, GOLD, GOLDL, SILVER, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 09: Sports & showbiz';

// ---------- local helpers ----------
const rot = (a, x, y, s) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${[].concat(s).join('')}</g>`;
const armQ = (B, side, hx, hy, qx, qy) => { const [sx, sy] = side < 0 ? B.shL : B.shR; return { d: `M${sx},${sy} Q${f1(qx)},${f1(qy)} ${f1(hx)},${f1(hy)}`, hand: [hx, hy] }; };
const txt = (x, y, t, size, col = '#fff', a = 0) => `<text x="${f1(x)}" y="${f1(y)}" transform="rotate(${a} ${f1(x)} ${f1(y)})" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${col}" stroke="${INK}" stroke-width="${size / 9}" paint-order="stroke">${t}</text>`;
const note = (x, y, s = 1, col = INK) => P(`M${x},${y} l0,${-46 * s} q${18 * s},${6 * s} ${22 * s},${22 * s}`, 'none', col, 5 * s) + ell(x - 9 * s, y, 12 * s, 9 * s, col);
// boxing glove (big mitt + cuff) centred on a hand; a = tilt
const glove = (x, y, a = 0, col = '#d8473c', k = 1.3) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${k}) translate(${f1(-x)} ${f1(-y)})">` + rot(a, x, y, [P(`M${x - 46},${y + 30} Q${x - 58},${y - 40} ${x - 20},${y - 58} Q${x + 30},${y - 74} ${x + 50},${y - 30} Q${x + 62},${y + 6} ${x + 40},${y + 32} Z`, col, INK, 6), P(`M${x - 46},${y + 4} Q${x - 70},${y - 6} ${x - 62},${y + 22} Q${x - 56},${y + 36} ${x - 40},${y + 26} Z`, col, INK, 5), rect(x - 46, y + 26, 88, 34, '#fff', 5, 8), L(`M${x - 40},${y + 43} l76,0`, 3, '#cfc6b0'), hl(`M${x - 34},${y - 36} Q${x - 14},${y - 56} ${x + 14},${y - 56}`, 8, .5)]) + '</g>';
const ribbonPts = (pts, w) => { const A = [], Bk = []; pts.forEach(([x, y], i) => { const [x0, y0] = pts[Math.max(0, i - 1)], [x1, y1] = pts[Math.min(pts.length - 1, i + 1)], dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1; A.push([x - dy / n * w, y + dx / n * w]); Bk.push([x + dy / n * w, y - dx / n * w]); }); return smooth([...A, ...Bk.reverse()]); };
const braid = (pts, w, col, tie) => { const o = [P(ribbonPts(pts, w), col, INK, 5)]; for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i]; o.push(L(`M${x - w * .9},${y - 6} q${w * .9},${12} ${w * 1.8},0`, 3, shade(col, .72))); } const [ex, ey] = pts[pts.length - 1]; o.push(rect(ex - w, ey - 6, w * 2, 12, tie, 3.5, 4), P(`M${ex - w * .8},${ey + 6} L${ex},${ey + 30} L${ex + w * .8},${ey + 6} Z`, col, INK, 4)); return o; };

export const CAST = [
  // 1 BOXER: satin robe, championship belt, giant gloves (one raised in victory)
  { name: 'boxer', label: 'Boxer', form: 'chad', coat: '#f4f1f6', face: 'rage', keepFormDetails: true,
    behind: ({ cx, top }) => [P(`M${cx - 150},${top + 10} Q${cx},${top - 30} ${cx + 150},${top + 10} L${cx + 226},${top + 540} Q${cx},${top + 580} ${cx - 226},${top + 540} Z`, '#6b2d7a', INK, 7), ...[-1, 1].map(s => L(`M${cx + s * 150},${top + 14} L${cx + s * 222},${top + 536}`, 12, GOLD)), ...[-1, 1].map(s => L(`M${cx + s * 150},${top + 14} L${cx + s * 222},${top + 536}`, 2.4, INK)), L(`M${cx - 226},${top + 540} Q${cx},${top + 580} ${cx + 226},${top + 540}`, 12, GOLD), L(`M${cx - 226},${top + 540} Q${cx},${top + 580} ${cx + 226},${top + 540}`, 2.4, INK), hl(`M${cx - 180},${top + 120} L${cx - 206},${top + 460}`, 10, .3)],
    details: ({ cx, top }) => [rect(cx - 200, top + 262, 400, 140, '#d8473c', 4, 0), ...[-1, 1].map(s => rect(cx + s * 52 - 6, top + 262, 12, 140, '#fff', 0, 0))],
    props: ({ cx, top }) => [rect(cx - 104, top + 240, 208, 46, GOLD, 5, 10), ...[-80, -56, 56, 80].map(dx => circ(cx + dx, top + 263, 6, '#d8473c', 2.4)), ell(cx, top + 262, 52, 42, GOLD, INK, 6), ell(cx, top + 262, 38, 30, GOLDL, INK, 3.5), star5(cx, top + 262, 20, '#d8473c'), hl(`M${cx - 34},${top + 240} Q${cx - 20},${top + 228} ${cx},${top + 226}`, 5, .7),
      ...[-1, 1].map(s => P(`M${cx + s * 30},${top - 4} Q${cx + s * 100},${top - 20} ${cx + s * 150},${top + 14} L${cx + s * 160},${top + 60} Q${cx + s * 100},${top + 20} ${cx + s * 40},${top + 30} Z`, '#6b2d7a', INK, 5))],
    over: ({ cx, top }) => [glove(cx + 168, top - 204, 14), glove(cx - 168, top + 200, -20), star4(cx + 120, top - 260, 20), star4(cx + 222, top - 120, 14)],
    arms: B => ({ front: [armQ(B, -1, B.cx - 168, B.top + 200, B.cx - 250, B.top + 100), armQ(B, 1, B.cx + 168, B.top - 204, B.cx + 262, B.top - 20)] }) },

  // 2 SOCCER PLAYER: kid, number-10 shirt, sweating to keep the ball balanced on his head
  { name: 'soccer', label: 'Soccer Player', form: 'kid', coat: '#2f9a4f', face: 'awkward',
    hat: ({ cx, hy }) => { const x = cx + 6, y = hy - 156, r = 54, o = [];
      o.push(circ(x, y, r, '#fbfaf6', 6));
      const pent = (px, py, pr, a = 0) => P([...Array(5)].map((_, k) => { const t = a + -Math.PI / 2 + k * 2 * Math.PI / 5; return `${k ? 'L' : 'M'}${f1(px + Math.cos(t) * pr)},${f1(py + Math.sin(t) * pr)}`; }).join(' ') + 'Z', '#2a2733', INK, 3);
      o.push(pent(x, y, 17), ...[0, 1, 2, 3, 4].map(k => { const t = -Math.PI / 2 + k * 2 * Math.PI / 5; return L(`M${f1(x + Math.cos(t) * 17)},${f1(y + Math.sin(t) * 17)} L${f1(x + Math.cos(t) * 40)},${f1(y + Math.sin(t) * 40)}`, 3); }));
      o.push(...[0, 1, 2, 3, 4].map(k => { const t = -Math.PI / 2 + (k + .5) * 2 * Math.PI / 5; return pent(x + Math.cos(t) * 52, y + Math.sin(t) * 52, 14, Math.PI); }));
      o.push(`<g>${circ(x, y, r, 'none', 6)}</g>`, hl(`M${x - 34},${y - 24} Q${x - 22},${y - 42} ${x - 2},${y - 46}`, 6, .8));
      o.push(L(`M${x - 74},${y - 30} q-10,20 0,40 M${x + 76},${y - 30} q10,20 0,40 M${x - 90},${y - 40} q-14,30 0,60`, 4));
      return o; },
    details: ({ cx, top }) => [...[-1, 1].map(s => rect(cx + s * 56 - 12, top - 10, 24, 170, '#fff', 0, 0)), P(`M${cx - 24},${top - 6} L${cx},${top + 22} L${cx + 24},${top - 6}`, 'none', '#fff', 7), txt(cx, top + 120, '10', 70, '#fff'), rect(cx - 120, top + 156, 240, 80, '#fbfaf6', 4, 0), L(`M${cx},${top + 170} L${cx},${top + 216}`, 3, '#cfc6b0')],
    arms: B => ({ front: [armQ(B, -1, B.cx - 170, B.top - 10, B.cx - 120, B.top + 70), armQ(B, 1, B.cx + 170, B.top - 10, B.cx + 120, B.top + 70)] }) },

  // 3 BASKETBALL PLAYER: noodle, headband, jersey + baggy shorts, ball spinning on one finger
  { name: 'basketball', label: 'Basketball Player', form: 'noodle', coat: '#6b3fb0', face: 'cool',
    hat: ({ cx, hy }) => [brush(cx - 112, hy - 44, cx, hy - 66, cx + 112, hy - 44, 24, { col: '#fff', tip: .95 }), L(`M${cx - 108},${hy - 52} Q${cx},${hy - 74} ${cx + 108},${hy - 52}`, 6, '#d8473c'), L(`M${cx - 108},${hy - 38} Q${cx},${hy - 60} ${cx + 108},${hy - 38}`, 3, '#cfc6b0')],
    details: ({ cx, top }) => [...[-1, 1].map(s => P(`M${cx + s * 16},${top - 10} Q${cx + s * 34},${top + 60} ${cx + s * 70},${top + 70} L${cx + s * 80},${top - 10} Z`, '#f4f1f6', INK, 4)), P(`M${cx - 16},${top - 8} Q${cx},${top + 40} ${cx + 16},${top - 8}`, 'none', GOLD, 7), txt(cx, top + 170, '7', 84, GOLD),
      rect(cx - 90, top + 250, 180, 180, '#5a2f98', 4, 0), ...[-1, 1].map(s => rect(cx + s * 54 - 7, top + 250, 14, 180, GOLD, 0, 0)), L(`M${cx - 90},${top + 250} L${cx + 90},${top + 250}`, 5)],
    props: ({ cx, bot }) => [P(`M${cx - 64},${bot - 30} L${cx - 70},${bot + 60} L${cx - 4},${bot + 60} L${cx},${bot + 20} L${cx + 4},${bot + 60} L${cx + 70},${bot + 60} L${cx + 64},${bot - 30} Z`, '#5a2f98', INK, 5), ...[-1, 1].map(s => L(`M${cx + s * 60},${bot - 20} L${cx + s * 64},${bot + 56}`, 9, GOLD))],
    over: ({ cx, hy }) => { const x = cx + 150, y = hy - 236, r = 58, o = [];
      o.push(L(`M${x - 96},${y + 30} A110,34 0 0,0 ${x + 92},${y + 6}`, 4), L(`M${x - 84},${y - 40} A100,30 0 0,1 ${x + 84},${y - 50}`, 3.4), circ(x, y, r, '#f28a1e', 6));
      o.push(L(`M${x - r},${y} Q${x},${y + 14} ${x + r},${y}`, 3.6), L(`M${x},${y - r} Q${x - 12},${y} ${x},${y + r}`, 3.6), L(`M${x - 40},${y - 42} Q${x - 18},${y} ${x - 40},${y + 42} M${x + 40},${y - 42} Q${x + 18},${y} ${x + 40},${y + 42}`, 3.6), hl(`M${x - 40},${y - 30} Q${x - 30},${y - 46} ${x - 12},${y - 50}`, 6, .5), L(`M${x},${y + r} L${x},${y + r + 30}`, 7), fist(x, y + r + 34, 13));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), armQ(B, 1, B.cx + 150, B.hy - 144, B.cx + 225, B.hy + 40)] }) },

  // 4 BALLERINA: sleek bun + tiara, pancake tutu, arms in a circle over her head
  { name: 'ballerina', label: 'Ballerina', form: 'lady', coat: '#f6b8cc', face: ['female', 'swoon'],
    hat: ({ cx, hy }) => { const o = [], HC = '#7a4a2e';
      o.push(ell(cx, hy - 132, 42, 36, HC, INK, 6), L(`M${cx - 22},${hy - 140} q22,-24 44,0 M${cx - 14},${hy - 126} q14,-14 28,0`, 3.4, '#4f2c1a'));
      o.push(fillPts([[cx - 104, hy + 10], [cx - 104, hy - 64], [cx - 56, hy - 110], [cx, hy - 118], [cx + 56, hy - 110], [cx + 104, hy - 64], [cx + 104, hy + 10], [cx + 92, hy - 30], [cx + 50, hy - 66], [cx, hy - 72], [cx - 50, hy - 66], [cx - 92, hy - 30]], HC, 6), L(`M${cx},${hy - 116} L${cx},${hy - 74}`, 3.4, '#4f2c1a'), hl(`M${cx - 76},${hy - 82} Q${cx - 50},${hy - 104} ${cx - 16},${hy - 108}`, 7, .3));
      o.push(P(`M${cx - 60},${hy - 82} L${cx - 40},${hy - 108} L${cx - 20},${hy - 92} L${cx},${hy - 124} L${cx + 20},${hy - 92} L${cx + 40},${hy - 108} L${cx + 60},${hy - 82} Q${cx},${hy - 96} ${cx - 60},${hy - 82} Z`, SILVER, INK, 4.5), circ(cx, hy - 104, 6, '#f05a78', 2.4));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 80},${top + 20} Q${cx},${top + 60} ${cx + 80},${top + 20}`, 'none', '#e88aa8', 5), ...[0, 1, 2].map(k => L(`M${cx - 40 + k * 40},${top + 70} l0,90`, 2.6, '#e88aa8')), rect(cx - 200, top + 230, 400, 200, '#fbe3ec', 0, 0), ...[...Array(13)].map((_, k) => L(`M${cx - 150 + k * 25},${top + 240} l${(k - 6) * 3},170`, 2.6, '#f2bccf'))],
    props: ({ cx, top }) => { const y = top + 196, o = [];
      for (const [rx, ry, col] of [[236, 54, '#f6b8cc'], [204, 44, '#fbd0dd'], [170, 34, '#fde4ec']]) { let d = ''; const n = 26; for (let k = 0; k <= n; k++) { const a = Math.PI * 2 * k / n, rr = k % 2 ? .9 : 1; d += `${k ? 'L' : 'M'}${f1(cx + Math.cos(a) * rx * rr)},${f1(y + Math.sin(a) * ry * rr)} `; } o.push(P(d + 'Z', col, INK, 5)); }
      o.push(P(`M${cx - 74},${y - 20} Q${cx},${y + 4} ${cx + 74},${y - 20} L${cx + 70},${y - 50} Q${cx},${y - 30} ${cx - 70},${y - 50} Z`, '#f6b8cc', INK, 4.5), heart(cx, y - 36, 10, '#fde4ec'), hl(`M${cx - 200},${y - 10} Q${cx - 120},${y - 40} ${cx - 40},${y - 40}`, 6, .5));
      return o; },
    over: ({ cx, top }) => [star4(cx - 210, top - 250, 18), star4(cx + 214, top - 210, 13), fist(cx - 16, top - 334, 13), fist(cx + 16, top - 334, 13)],
    arms: B => ({ front: [armQ(B, -1, B.cx - 16, B.top - 334, B.cx - 300, B.top - 150), armQ(B, 1, B.cx + 16, B.top - 334, B.cx + 300, B.top - 150)] }) },

  // 5 MAGICIAN: elder in a towering top hat with a rabbit popping out, cape, wand with sparkles
  { name: 'magician', label: 'Magician', form: 'elder', coat: '#24222c', face: ['elder', 'cackle'], hair: 'gramps', cane: false,
    behind: ({ cx, top }) => [P(`M${cx - 110},${top - 30} L${cx - 150},${top - 110} L${cx - 70},${top - 10} L${cx + 70},${top - 10} L${cx + 150},${top - 110} L${cx + 110},${top - 30} L${cx + 210},${top + 520} Q${cx},${top + 560} ${cx - 210},${top + 520} Z`, '#2a2733', INK, 7), P(`M${cx - 100},${top - 16} L${cx - 130},${top - 80} L${cx - 70},${top} Z M${cx + 100},${top - 16} L${cx + 130},${top - 80} L${cx + 70},${top} Z`, '#c8302e', INK, 4), P(`M${cx - 160},${top + 60} L${cx - 196},${top + 516} Q${cx - 170},${top + 530} ${cx - 140},${top + 534} Z M${cx + 160},${top + 60} L${cx + 196},${top + 516} Q${cx + 170},${top + 530} ${cx + 140},${top + 534} Z`, '#c8302e', INK, 4)],
    hat: ({ cx, hy }) => { const o = [], HB = '#24222c', x = cx + 6;
      // rabbit peeking out of the hat
      o.push(...[-1, 1].map(s => rot(s * 12, x + s * 16, hy - 330, [ell(x + s * 16, hy - 372, 14, 46, '#fff', INK, 5), ell(x + s * 16, hy - 366, 6, 32, '#f6a8b8')])), ell(x, hy - 316, 40, 34, '#fff', INK, 5), ...[-1, 1].map(s => ell(x + s * 15, hy - 320, 4.5, 6, INK)), ell(x, hy - 306, 6, 4.5, '#f05a78'), L(`M${x - 8},${hy - 298} q8,6 16,0`, 2.6), ...[-1, 1].map(s => circ(x + s * 34, hy - 292, 10, '#fff', 3.5)));
      o.push(P(`M${x - 74},${hy - 72} L${x - 80},${hy - 296} Q${x},${hy - 310} ${x + 80},${hy - 296} L${x + 74},${hy - 72} Z`, HB, INK, 7), ell(x, hy - 296, 80, 14, '#3a3446', INK, 5), P(`M${x - 76},${hy - 136} L${x + 76},${hy - 136} L${x + 75},${hy - 104} L${x - 75},${hy - 104} Z`, '#c8302e', INK, 5), hl(`M${x - 60},${hy - 150} L${x - 64},${hy - 280}`, 9, .3));
      o.push(P(`M${x - 140},${hy - 64} Q${x},${hy - 104} ${x + 140},${hy - 64} Q${x + 150},${hy - 46} ${x + 110},${hy - 44} Q${x},${hy - 76} ${x - 110},${hy - 44} Q${x - 150},${hy - 46} ${x - 140},${hy - 64} Z`, HB, INK, 6));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 54},${top - 10} L${cx},${top + 200} L${cx + 54},${top - 10} Z`, '#fbfaf6', INK, 4), ...[0, 1, 2].map(k => circ(cx, top + 70 + k * 40, 5, INK, 0)), ...[-1, 1].map(s => P(`M${cx + s * 54},${top - 8} L${cx + s * 96},${top + 20} L${cx + s * 40},${top + 160} Z`, '#3a3446', INK, 4))],
    props: ({ cx, top }) => [P(`M${cx},${top + 22} L${cx - 54},${top} L${cx - 54},${top + 44} Z M${cx},${top + 22} L${cx + 54},${top} L${cx + 54},${top + 44} Z`, '#c8302e', INK, 5), circ(cx, top + 22, 11, '#c8302e', 4)],
    over: ({ cx, top }) => { const x = cx + 120, y = top + 90, tx = cx + 200, ty = top - 120; return [L(`M${x},${y} L${tx},${ty}`, 17), L(`M${x},${y} L${tx},${ty}`, 9, '#24222c'), L(`M${tx - 14},${ty + 28} L${tx},${ty}`, 9, '#fff'), star4(tx + 6, ty - 30, 26, GOLDL), star4(tx - 40, ty - 50, 14, GOLDL), star4(tx + 20, ty - 80, 10, '#fff'), star4(tx - 60, ty - 4, 10, GOLDL), fist(x + 4, y - 4, 15)]; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), armQ(B, 1, B.cx + 124, B.top + 86, B.cx + 160, B.top + 60)] }) },

  // 6 CLOWN: bigboi, rainbow puff hair, red nose, giant polka bow tie, squirting flower
  { name: 'clown', label: 'Clown', form: 'bigboi', coat: '#f2d13a', face: 'hysterical',
    headBack: ({ cx, hy }) => { const cols = ['#e8407a', '#f2902a', '#f2d13a', '#4fb04a', '#2f8fd0', '#7a3fb0'], o = [];
      for (const s of [-1, 1]) { const cs = [[92, -70, 37], [118, -40, 37], [126, 0, 35], [118, 40, 33], [96, 66, 27], [98, -10, 37]]; cs.forEach(([dx, dy, r], i) => o.push(cloud([[cx + s * dx, hy + dy, r]], cols[(i + (s > 0 ? 2 : 0)) % 6], 6))); }
      return o; },
    hat: ({ cx, hy }) => [rot(-14, cx + 30, hy - 110, [rect(cx + 6, hy - 150, 48, 40, '#4fb04a', 5, 4), rect(cx - 6, hy - 114, 72, 12, '#4fb04a', 5, 4), rect(cx + 6, hy - 128, 48, 9, '#e8407a', 0, 0), daisy(cx + 50, hy - 140, 12)])],
    faceTop: ({ cx, hy }) => [circ(cx, hy + 4, 24, '#e0302e', 5), hl(`M${cx - 12},${hy - 6} q4,-8 12,-8`, 5, .8)],
    details: ({ cx, top }) => [...[...Array(30)].map((_, k) => circ(cx - 220 + (k % 6) * 88 + (Math.floor(k / 6) % 2) * 44, top + 80 + Math.floor(k / 6) * 90, 18, ['#e8407a', '#2f8fd0', '#4fb04a'][k % 3], 0)), ...[0, 1, 2].map(k => circ(cx, top + 140 + k * 90, 22, '#fff', 4)), ...[0, 1, 2].map(k => circ(cx, top + 140 + k * 90, 9, '#e8407a', 0))],
    props: ({ cx, top }) => { const y = top + 18; return [P(`M${cx},${y} L${cx - 150},${y - 70} Q${cx - 176},${y} ${cx - 150},${y + 70} Z`, '#2f8fd0', INK, 6), P(`M${cx},${y} L${cx + 150},${y - 70} Q${cx + 176},${y} ${cx + 150},${y + 70} Z`, '#2f8fd0', INK, 6), ...[[-110, -20], [-130, 30], [-80, 20], [110, -20], [130, 30], [80, 20], [-120, -50], [120, -50]].map(([dx, dy]) => circ(cx + dx, y + dy, 9, '#fff', 0)), L(`M${cx - 70},${y - 26} l20,26 l-20,26 M${cx + 70},${y - 26} l-20,26 l20,26`, 3, '#1f5f9a'), circ(cx, y, 30, '#e8407a', 6),
      daisy(cx - 110, top + 160, 36, '#fff', '#e8407a'), ...[0, 1, 2, 3].map(k => `<circle cx="${cx - 150 - k * 22}" cy="${top + 120 - k * 30 + k * k * 4}" r="${7 - k}" fill="#7fd4ef" stroke="${INK}" stroke-width="2.4"/>`)]; } },

  // 7 ROCK STAR: dad bod, wild long hair, star shades, red electric guitar
  { name: 'rockstar', label: 'Rock Star', form: 'dad', coat: '#2a2733', face: 'scream',
    headBack: ({ cx, hy }) => { const HC = '#2a2028'; return [P(`M${cx - 100},${hy - 90} Q${cx - 150},${hy - 20} ${cx - 140},${hy + 70} L${cx - 170},${hy + 120} L${cx - 130},${hy + 120} L${cx - 150},${hy + 180} L${cx - 100},${hy + 150} L${cx - 96},${hy + 200} L${cx - 60},${hy + 130} L${cx + 60},${hy + 130} L${cx + 96},${hy + 200} L${cx + 100},${hy + 150} L${cx + 150},${hy + 180} L${cx + 130},${hy + 120} L${cx + 170},${hy + 120} L${cx + 140},${hy + 70} Q${cx + 150},${hy - 20} ${cx + 100},${hy - 90} Q${cx},${hy - 150} ${cx - 100},${hy - 90} Z`, HC, INK, 6), ...[-1, 1].map(s => L(`M${cx + s * 124},${hy} q${s * 10},60 ${s * 2},120`, 3, '#4a3a46'))]; },
    hat: ({ cx, hy }) => [P(`M${cx - 108},${hy + 10} Q${cx - 116},${hy - 90} ${cx - 40},${hy - 120} Q${cx + 40},${hy - 136} ${cx + 100},${hy - 90} Q${cx + 120},${hy - 50} ${cx + 108},${hy + 10} L${cx + 92},${hy - 40} L${cx + 70},${hy - 30} L${cx + 50},${hy - 70} L${cx + 30},${hy - 50} L${cx + 6},${hy - 80} L${cx - 20},${hy - 54} L${cx - 46},${hy - 76} L${cx - 66},${hy - 40} L${cx - 88},${hy - 50} Z`, '#2a2028', INK, 6), hl(`M${cx - 80},${hy - 90} Q${cx - 40},${hy - 118} ${cx},${hy - 120}`, 7, .25)],
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => star5(cx + s * 38, hy - 22, 36, '#ff4fa0')), ...[-1, 1].map(s => star5(cx + s * 38, hy - 22, 18, '#ffb3d6')), L(`M${cx - 10},${hy - 26} q10,-6 20,0`, 5), ...[-1, 1].map(s => L(`M${cx + s * 72},${hy - 26} L${cx + s * 102},${hy - 34}`, 5))],
    details: ({ cx, top }) => [P(`M${cx - 30},${top + 60} L${cx + 20},${top + 60} L${cx - 4},${top + 120} L${cx + 30},${top + 120} L${cx - 30},${top + 210} L${cx - 10},${top + 140} L${cx - 40},${top + 140} Z`, GOLD, INK, 4), L(`M${cx - 120},${top + 300} l30,10 l-10,20 M${cx + 90},${top + 260} l20,16`, 3, '#5a5468')],
    over: ({ cx, top }) => { const gx = cx - 50, gy = top + 270, o = [L(`M${cx - 200},${top + 60} q-20,-30 0,-60 M${cx - 224},${top + 80} q-30,-50 0,-100`, 4.5)], RG = '#d8473c';
      o.push(L(`M${cx - 116},${top + 60} Q${cx - 60},${top + 150} ${gx + 70},${gy + 20}`, 14), L(`M${cx - 116},${top + 60} Q${cx - 60},${top + 150} ${gx + 70},${gy + 20}`, 7, '#3a3446'));
      o.push(`<g transform="translate(${gx} ${gy}) scale(1.08) translate(${-gx} ${-gy})">` + rot(-44, gx, gy, [rect(gx + 40, gy - 14, 230, 28, WOODD, 5, 4), ...[...Array(8)].map((_, k) => L(`M${gx + 60 + k * 26},${gy - 12} l0,24`, 2.4, SILVER)), P(`M${gx + 266},${gy - 22} L${gx + 330},${gy - 46} L${gx + 318},${gy - 4} L${gx + 330},${gy + 30} L${gx + 266},${gy + 20} Z`, RG, INK, 5),
        P(`M${gx - 100},${gy - 70} L${gx + 60},${gy - 40} Q${gx + 74},${gy} ${gx + 60},${gy + 40} L${gx - 100},${gy + 70} L${gx - 60},${gy} Z`, RG, INK, 6), rect(gx - 30, gy - 30, 18, 60, '#2a2733', 3, 3), rect(gx + 4, gy - 26, 14, 52, '#2a2733', 3, 3), L(`M${gx - 40},${gy - 6} L${gx + 270},${gy - 6} M${gx - 40},${gy + 6} L${gx + 270},${gy + 6}`, 1.6, '#eee'), hl(`M${gx - 80},${gy - 54} L${gx + 40},${gy - 34}`, 6, .45), fist(gx + 200, gy, 14)]) + '</g>');
      o.push(fist(gx - 6, gy + 30, 17)); return o; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 36, B.top + 280, B.cx - 130, B.top + 220), armQ(B, 1, B.cx + 106, B.top + 120, B.cx + 190, B.top + 200)] }) },

  // 8 DJ: snapback, giant headphones, hoodie, turntable deck, one hand in the air
  { name: 'dj', label: 'DJ', form: 'standard', coat: '#2a2733', face: 'proud',
    hat: ({ cx, hy }) => { const o = [], C = '#3fd06a';
      o.push(fillPts([[cx - 110, hy - 30], [cx - 106, hy - 96], [cx - 56, hy - 132], [cx, hy - 140], [cx + 56, hy - 132], [cx + 106, hy - 96], [cx + 110, hy - 30], [cx, hy - 50]], '#2a2733', 7), P(`M${cx - 116},${hy - 42} Q${cx},${hy - 66} ${cx + 116},${hy - 42} L${cx + 150},${hy - 22} Q${cx},${hy - 40} ${cx - 150},${hy - 22} Z`, C, INK, 6), hl(`M${cx - 80},${hy - 104} Q${cx - 40},${hy - 128} ${cx},${hy - 128}`, 8, .3), ell(cx, hy - 140, 10, 7, C, INK, 3.5));
      o.push(P(`M${cx - 120},${hy - 10} Q${cx - 130},${hy - 170} ${cx},${hy - 176} Q${cx + 130},${hy - 170} ${cx + 120},${hy - 10}`, 'none', INK, 22), P(`M${cx - 120},${hy - 10} Q${cx - 130},${hy - 170} ${cx},${hy - 176} Q${cx + 130},${hy - 170} ${cx + 120},${hy - 10}`, 'none', '#8a90a2', 11));
      for (const s of [-1, 1]) o.push(ell(cx + s * 116, hy + 10, 38, 58, '#2a2733', INK, 7), ell(cx + s * 121, hy + 10, 25, 42, C, INK, 4), ell(cx + s * 123, hy + 10, 12, 20, '#2a2733', INK, 3), hl(`M${cx + s * 106},${hy - 30} q${s * 10},-10 ${s * 20},-8`, 5, .5));
      return o; },
    details: ({ cx, top }) => [...[-1, 1].map(s => L(`M${cx + s * 22},${top + 10} q${s * 6},50 0,90`, 4, '#3fd06a')), P(`M${cx - 70},${top + 200} L${cx + 70},${top + 200} L${cx + 80},${top + 280} L${cx - 80},${top + 280} Z`, '#3a3446', INK, 4)],
    props: ({ cx, top }) => { const y = top + 230, o = [];
      o.push(rect(cx - 230, y, 460, 120, '#3a3446', 6, 10), rect(cx - 230, y, 460, 22, '#5a5468', 5, 6), ...[-1, 1].map(s => ell(cx + s * 120, y - 4, 96, 28, '#c9ccd6', INK, 5)), ...[-1, 1].map(s => ell(cx + s * 120, y - 8, 80, 22, '#1d1a26', INK, 3)), ...[-1, 1].map(s => ell(cx + s * 120, y - 8, 22, 7, s < 0 ? '#3fd06a' : '#ff4fa0', INK, 2.4)), ...[-1, 1].map(s => L(`M${cx + s * 120 + 30},${y - 14} q12,4 20,2`, 2.4, '#5a5468')),
        ...[-1, 0, 1].map(k => circ(cx + k * 30, y + 50, 9, k ? '#3fd06a' : '#ff4fa0', 3)), ...[-1, 1].map(s => rect(cx + s * 120 - 50, y + 44, 100, 12, '#2a2733', 2.4, 3)), ...[-1, 1].map(s => rect(cx + s * 120 - 6, y + 40, 12, 20, SILVER, 2.4, 2)), L(`M${cx - 190},${y + 90} l380,0`, 3, '#5a5468'), hl(`M${cx - 220},${y + 30} L${cx - 220},${y + 100}`, 6, .3));
      o.push(fist(cx - 110, y - 10, 15)); return o; },
    over: ({ cx, top }) => [note(cx + 150, top - 120, 1, '#3fd06a'), note(cx - 200, top - 170, .8, '#ff4fa0'), fist(cx + 200, top - 200, 15)],
    arms: B => ({ front: [armQ(B, -1, B.cx - 110, B.top + 220, B.cx - 160, B.top + 140), armQ(B, 1, B.cx + 200, B.top - 200, B.cx + 230, B.top + 20)] }) },

  // 9 OPERA SINGER: Valkyrie diva, winged-horn helmet, long blonde braids, enormous gown, singing
  { name: 'opera', label: 'Opera Singer', form: 'lady', coat: '#8f1f33', face: ['female', 'omg'],
    hat: ({ cx, hy }) => { const o = [], Y = '#f2d36a';
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 84},${hy - 70} Q${cx + s * 150},${hy - 80} ${cx + s * 162},${hy - 170} Q${cx + s * 168},${hy - 206} ${cx + s * 150},${hy - 230} Q${cx + s * 142},${hy - 160} ${cx + s * 92},${hy - 108} Z`, CREAM, INK, 6), L(`M${cx + s * 110},${hy - 90} l${s * 14},-16 M${cx + s * 136},${hy - 116} l${s * 14},-10`, 3, '#b8ae98'));
      o.push(fillPts([[cx - 108, hy - 34], [cx - 102, hy - 92], [cx - 50, hy - 124], [cx, hy - 130], [cx + 50, hy - 124], [cx + 102, hy - 92], [cx + 108, hy - 34], [cx, hy - 50]], STEEL, 7), rect(cx - 112, hy - 52, 224, 22, GOLD, 5, 6), ...[-70, -35, 0, 35, 70].map(dx => circ(cx + dx, hy - 41, 4.5, GOLDL, 2)), hl(`M${cx - 76},${hy - 90} Q${cx - 30},${hy - 118} ${cx + 10},${hy - 116}`, 8, .5));
      for (const s of [-1, 1]) o.push(...braid([[cx + s * 100, hy - 20], [cx + s * 108, hy + 30], [cx + s * 106, hy + 80], [cx + s * 100, hy + 130], [cx + s * 92, hy + 180]], 20, Y, '#2f8fd0'));
      return o; },
    details: ({ cx, top }) => [...[-1, 1].map(s => circ(cx + s * 34, top + 70, 30, GOLD, 5)), ...[-1, 1].map(s => circ(cx + s * 34, top + 70, 14, GOLDL, 3)), rect(cx - 90, top + 128, 180, 22, GOLD, 4, 3)],
    props: ({ cx, top }) => [P(`M${cx - 70},${top + 140} Q${cx - 140},${top + 330} ${cx - 236},${top + 640} Q${cx},${top + 680} ${cx + 236},${top + 640} Q${cx + 140},${top + 330} ${cx + 70},${top + 140} Q${cx},${top + 156} ${cx - 70},${top + 140} Z`, '#8f1f33', INK, 7),
      L(`M${cx - 222},${top + 618} Q${cx},${top + 656} ${cx + 222},${top + 618}`, 12, GOLD), ...[-1, 0, 1].map(k => L(`M${cx + k * 70},${top + 170} Q${cx + k * 110},${top + 400} ${cx + k * 150},${top + 640}`, 4, '#6a1424')), hl(`M${cx - 80},${top + 200} Q${cx - 130},${top + 400} ${cx - 190},${top + 600}`, 12, .25), ...[[-120, 480], [100, 420], [0, 560], [-40, 330], [150, 560]].map(([dx, dy]) => star4(cx + dx, top + dy, 10, GOLDL))],
    over: ({ cx, top }) => [note(cx + 196, top - 200, 1), note(cx + 230, top - 290, .7), note(cx - 210, top - 280, .8), fist(cx - 214, top - 40, 13)],
    arms: B => ({ front: [armQ(B, -1, B.cx - 214, B.top - 40, B.cx - 120, B.top + 10), armQ(B, 1, B.cx + 120, B.top + 150, B.cx + 150, B.top + 60)] }) },

  // 10 LUCHADOR: full mask with eye/mouth holes, flame trim, sparkly cape, title belt, double-biceps flex
  { name: 'luchador', label: 'Luchador', form: 'chad', coat: '#f4f1f6', face: 'troll', keepFormDetails: true,
    behind: ({ cx, top }) => [P(`M${cx - 120},${top} Q${cx},${top - 40} ${cx + 120},${top} L${cx + 240},${top + 640} Q${cx},${top + 600} ${cx - 240},${top + 640} Z`, '#e2b13c', INK, 7), P(`M${cx - 100},${top + 20} Q${cx},${top - 10} ${cx + 100},${top + 20} L${cx + 200},${top + 610} Q${cx},${top + 576} ${cx - 200},${top + 610} Z`, '#2f5fae', INK, 4), ...[[-150, 300], [130, 360], [-100, 480], [170, 520], [-180, 560]].map(([dx, dy]) => star4(cx + dx, top + dy, 14, GOLDL))],
    hat: ({ cx, hy }) => { const MB = '#2f5fae', o = [];
      const head = smooth([[cx - 108, hy + 70], [cx - 114, hy - 10], [cx - 100, hy - 86], [cx - 50, hy - 122], [cx, hy - 130], [cx + 50, hy - 122], [cx + 100, hy - 86], [cx + 114, hy - 10], [cx + 108, hy + 70], [cx + 60, hy + 100], [cx, hy + 106], [cx - 60, hy + 100]]);
      const eye = s => { const ex = cx + s * 34, ey = hy - 22; return `M${ex - 26},${ey} Q${ex - 24},${ey - 26} ${ex},${ey - 28} Q${ex + 26},${ey - 26} ${ex + 26},${ey} Q${ex + 22},${ey + 22} ${ex},${ey + 22} Q${ex - 22},${ey + 22} ${ex - 26},${ey} Z`; };
      const mouth = `M${cx - 82},${hy + 4} Q${cx},${hy - 6} ${cx + 82},${hy + 4} Q${cx + 70},${hy + 82} ${cx},${hy + 86} Q${cx - 70},${hy + 82} ${cx - 82},${hy + 4} Z`;
      o.push(`<path d="${head} ${eye(-1)} ${eye(1)} ${mouth}" fill="${MB}" fill-rule="evenodd" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`);
      for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 22; o.push(P(`M${ex - s * 26},${ey + 4} Q${ex - s * 30},${ey - 40} ${ex + s * 6},${ey - 48} Q${ex + s * 40},${ey - 54} ${ex + s * 64},${ey - 76} Q${ex + s * 62},${ey - 40} ${ex + s * 40},${ey - 22} Q${ex + s * 34},${ey - 34} ${ex},${ey - 34} Q${ex - s * 22},${ey - 30} ${ex - s * 26},${ey + 4} Z`, GOLD, INK, 4)); }
      o.push(P(`M${cx - 10},${hy - 128} L${cx + 10},${hy - 128} L${cx + 8},${hy - 54} L${cx - 8},${hy - 54} Z`, '#d8473c', INK, 4), P(mouth, 'none', '#d8473c', 6), hl(`M${cx - 86},${hy - 76} Q${cx - 50},${hy - 112} ${cx - 20},${hy - 116}`, 8, .4));
      o.push(...[-1, 1].map(s => P(`M${cx + s * 100},${hy + 30} l${s * 28},-8 l${-s * 6},14 l${s * 10},10 l${-s * 30},2 Z`, '#d8473c', INK, 3.5)));
      return o; },
    details: ({ cx, top }) => [rect(cx - 200, top + 262, 400, 140, '#2f5fae', 4, 0), ...[0, 1, 2, 3, 4].map(k => P(`M${cx - 140 + k * 60},${top + 400} q-14,-50 12,-90 q-2,40 18,50 q8,-20 0,-40 q30,30 10,80 Z`, '#f2902a', INK, 3))],
    props: ({ cx, top }) => [rect(cx - 110, top + 236, 220, 50, GOLD, 5, 10), ell(cx, top + 260, 64, 50, GOLD, INK, 6), ell(cx, top + 260, 48, 36, '#d8473c', INK, 4), star5(cx, top + 260, 26, GOLDL), ...[-90, -70, 70, 90].map(dx => circ(cx + dx, top + 261, 6, '#2f5fae', 2.4))],
    over: ({ cx, top }) => [fist(cx - 196, top - 60, 21), fist(cx + 196, top - 60, 21)],
    arms: B => ({ front: [armQ(B, -1, B.cx - 196, B.top - 60, B.cx - 290, B.top + 120), armQ(B, 1, B.cx + 196, B.top - 60, B.cx + 290, B.top + 120)] }) },
];
// daisy used by the clown (hoisted function so CAST can reference it)
function daisy(x, y, r, petal = '#fff', mid = GOLD) { return [...Array(7)].map((_, k) => rot(k / 7 * 360, x, y, ell(x, y - r * .62, r * .3, r * .5, petal, INK, 3))).join('') + circ(x, y, r * .32, mid, 3); }
