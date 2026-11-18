// SHEET 08 — 20TH CENTURY
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, star5, heart, GOLD, GOLDL, SILVER, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 08: 20th century';

// ---------- local helpers ----------
const rot = (a, x, y, s) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${[].concat(s).join('')}</g>`;
const armQ = (B, side, hx, hy, qx, qy) => { const [sx, sy] = side < 0 ? B.shL : B.shR; return { d: `M${sx},${sy} Q${f1(qx)},${f1(qy)} ${f1(hx)},${f1(hy)}`, hand: [hx, hy] }; };
const daisy = (x, y, r, petal = '#fff', mid = GOLD) => [...Array(7)].map((_, k) => { const a = k / 7 * 360; return rot(a, x, y, ell(x, y - r * .62, r * .3, r * .5, petal, INK, 3)); }).join('') + circ(x, y, r * .32, mid, 3);
const peace = (x, y, r, col = SILVER, sw = 4) => circ(x, y, r, col, sw) + L(`M${x},${y - r} L${x},${y + r} M${x},${y} L${f1(x - r * .7)},${f1(y + r * .7)} M${x},${y} L${f1(x + r * .7)},${f1(y + r * .7)}`, sw * .9) + circ(x, y, r, 'none', sw);
const stud = (x, y, r = 7) => `<path d="M${f1(x - r)},${f1(y + r * .6)} L${f1(x)},${f1(y - r)} L${f1(x + r)},${f1(y + r * .6)} Z" fill="${SILVER}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
const spin = (x, y, a, len = 44) => rot(a, x, y, [L(`M${x - len / 2},${y} L${x + len / 2 - 6},${y} a6,6 0 0,1 0,12 L${x - len / 2 + 10},${y + 12}`, 7), L(`M${x - len / 2},${y} L${x + len / 2 - 6},${y} a6,6 0 0,1 0,12 L${x - len / 2 + 10},${y + 12}`, 3, SILVER), rect(x - len / 2 - 8, y - 4, 14, 20, SILVER, 2.6, 3)]);
const ribbon = (pts, w, col, sw = 5) => { // thick wavy band along a polyline (scarves, streamers)
  const A = [], Bk = [];
  pts.forEach(([x, y], i) => { const [x0, y0] = pts[Math.max(0, i - 1)], [x1, y1] = pts[Math.min(pts.length - 1, i + 1)], dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1, ww = w * (1 - .35 * i / (pts.length - 1)); A.push([x - dy / n * ww, y + dx / n * ww]); Bk.push([x + dy / n * ww, y - dx / n * ww]); });
  return P(smooth([...A, ...Bk.reverse()]), col, INK, sw);
};

export const CAST = [
  // 1 FLAPPER: sleek black bob, jewelled headband with a giant plume, pearls, fringe dress, fan
  { name: 'flapper', label: '1920s Flapper', form: 'lady', coat: '#c8304a', face: ['female', 'blowKiss'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 110, hy - 60], [cx - 122, hy + 20], [cx - 120, hy + 78], [cx - 84, hy + 96], [cx + 84, hy + 96], [cx + 120, hy + 78], [cx + 122, hy + 20], [cx + 110, hy - 60], [cx, hy - 118]], '#1d1a26', 6)],
    hat: ({ cx, hy }) => { const o = [], HB = '#1d1a26';
      o.push(fillPts([[cx - 112, hy + 30], [cx - 112, hy - 60], [cx - 66, hy - 112], [cx, hy - 122], [cx + 66, hy - 112], [cx + 112, hy - 60], [cx + 112, hy + 30], [cx + 92, hy + 20], [cx + 88, hy - 24], [cx + 50, hy - 52], [cx + 10, hy - 40], [cx - 30, hy - 58], [cx - 70, hy - 44], [cx - 90, hy - 14], [cx - 94, hy + 26]], HB, 6));
      o.push(L(`M${cx - 92},${hy - 84} q24,-18 48,-4 q24,14 48,-4 q24,-18 48,0`, 3.4, '#3a3446'), hl(`M${cx - 80},${hy - 96} Q${cx - 30},${hy - 120} ${cx + 30},${hy - 114}`, 7, .3));
      o.push(L(`M${cx - 86},${hy + 6} c-14,-4 -14,-26 2,-24 c10,2 8,14 0,12`, 5, HB));
      // plume (behind band)
      const bx = cx + 64, by = hy - 82, tx = cx + 120, ty = hy - 262;
      o.push(P(`M${bx - 6},${by} C${bx - 40},${by - 90} ${bx + 10},${by - 180} ${tx},${ty} C${tx + 30},${ty + 70} ${bx + 70},${by - 100} ${bx + 18},${by} Z`, '#f6f2ea', INK, 5.5));
      for (let k = 1; k < 9; k++) { const t = k / 9, x = bx + 6 + (tx - bx - 6) * t * t * .9 + Math.sin(t * 3) * 6, y = by + (ty - by) * t; o.push(L(`M${f1(x)},${f1(y)} l-16,-10 M${f1(x)},${f1(y)} l18,-4`, 2.6, '#b8ae98')); }
      o.push(L(`M${bx + 6},${by} C${bx - 10},${by - 90} ${bx + 30},${by - 170} ${tx - 4},${ty + 8}`, 3, '#b8ae98'));
      o.push(brush(cx - 110, hy - 52, cx, hy - 70, cx + 110, hy - 52, 14, { col: SILVER, tip: .8 }), ...[-80, -50, -20, 10, 40].map(dx => circ(cx + dx, hy - 64 + Math.abs(dx) * .04, 4, '#fff', 2)));
      o.push(circ(bx + 4, by + 16, 20, GOLD, 5), circ(bx + 4, by + 16, 11, RED, 3), L(`M${bx - 2},${by + 10} l5,-3`, 2.4, '#fff'));
      return o; },
    details: ({ cx, top }) => { const o = [rect(cx - 160, top + 176, 320, 26, '#8f1f33', 4, 2)];
      for (let r = 0; r < 5; r++) { const y = top + 214 + r * 38; o.push(L(`M${cx - 200},${y} L${cx + 200},${y}`, 4, '#8f1f33')); for (let x = cx - 196; x < cx + 200; x += 11) o.push(L(`M${x},${y} l${r % 2 ? 2 : -2},30`, 3, GOLD)); }
      return o; },
    props: ({ cx, top, bot }) => { const o = [];
      for (let x = cx - 136; x <= cx + 136; x += 11) o.push(L(`M${x},${bot - 14} l${(x - cx) * .04},40`, 8), L(`M${x},${bot - 14} l${(x - cx) * .04},40`, 3.6, GOLD));
      // long pearl rope
      const pts = []; for (let k = 0; k <= 22; k++) { const t = k / 22, a = Math.PI * t; pts.push([cx - Math.cos(a) * 46, top + 6 + Math.sin(a) * 150]); }
      o.push(...pts.map(([x, y]) => circ(x, y, 6.5, '#fbf8f0', 2.4)), ...[0, 1, 2, 3, 4, 5].map(k => circ(cx + 4 - k * 2, top + 170 + k * 14, 6.5, '#fbf8f0', 2.4)));
      // fan in the raised left hand
      const fx = cx - 128, fy = top + 40, R = 108, a0 = -170, a1 = -66, pt = (a, r) => [fx + Math.cos(a * Math.PI / 180) * r, fy + Math.sin(a * Math.PI / 180) * r];
      let d = `M${fx},${fy}`; for (let a = a0; a <= a1; a += 8) { const [x, y] = pt(a, R), [x2, y2] = pt(a + 4, R + 10); d += ` L${f1(x)},${f1(y)} L${f1(x2)},${f1(y2)}`; } d += ` L${f1(pt(a1, R)[0])},${f1(pt(a1, R)[1])} Z`;
      o.push(P(d, '#1d1a26', INK, 5));
      for (let a = a0 + 4; a < a1; a += 8) { const [x, y] = pt(a, R + 4); o.push(L(`M${fx},${fy} L${f1(x)},${f1(y)}`, 2.6, GOLD)); }
      o.push(P(`M${f1(pt(a0, 60)[0])},${f1(pt(a0, 60)[1])} A60,60 0 0,1 ${f1(pt(a1, 60)[0])},${f1(pt(a1, 60)[1])}`, 'none', GOLD, 4), fist(fx, fy, 14));
      return o; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 128, B.top + 40, B.cx - 140, B.top + 150), armQ(B, 1, B.cx + 62, B.top + 140, B.cx + 140, B.top + 110)] }) },

  // 2 GANGSTER: pinstripe suit, tilted fedora, violin case
  { name: 'gangster', label: '1920s Gangster', form: 'dad', coat: '#3d4050', face: 'evil',
    hat: ({ cx, hy }) => { const o = [], HC = '#4b4d5c';
      o.push(fillPts([[cx - 92, hy - 56], [cx - 90, hy - 128], [cx - 54, hy - 170], [cx - 14, hy - 160], [cx, hy - 148], [cx + 14, hy - 160], [cx + 54, hy - 170], [cx + 90, hy - 128], [cx + 92, hy - 56], [cx, hy - 66]], HC, 7));
      o.push(L(`M${cx},${hy - 146} q-6,30 0,64`, 4, '#33343f'), hl(`M${cx - 70},${hy - 120} Q${cx - 50},${hy - 158} ${cx - 20},${hy - 156}`, 8, .35));
      o.push(P(`M${cx - 92},${hy - 96} Q${cx},${hy - 112} ${cx + 92},${hy - 96} L${cx + 92},${hy - 64} Q${cx},${hy - 80} ${cx - 92},${hy - 64} Z`, '#1d1a26', INK, 5), P(`M${cx + 56},${hy - 102} l26,-34 l8,30 Z`, '#d8473c', INK, 4));
      o.push(P(`M${cx - 156},${hy - 52} Q${cx - 120},${hy - 84} ${cx},${hy - 82} Q${cx + 120},${hy - 84} ${cx + 156},${hy - 64} Q${cx + 164},${hy - 46} ${cx + 130},${hy - 40} Q${cx},${hy - 64} ${cx - 130},${hy - 32} Q${cx - 166},${hy - 32} ${cx - 156},${hy - 52} Z`, HC, INK, 6), hl(`M${cx - 150},${hy - 48} Q${cx - 90},${hy - 72} ${cx - 30},${hy - 72}`, 6, .3));
      return [rot(-8, cx, hy - 60, o)]; },
    details: ({ cx, top }) => { const o = [];
      for (let x = cx - 176; x <= cx + 176; x += 22) o.push(L(`M${x},${top - 10} L${x},${top + 400}`, 2.4, '#8d91a6'));
      o.push(P(`M${cx - 38},${top - 10} L${cx},${top + 120} L${cx + 38},${top - 10} Z`, CREAM, INK, 4));
      o.push(P(`M${cx - 12},${top + 14} L${cx + 12},${top + 14} L${cx + 8},${top + 30} L${cx - 8},${top + 30} Z`, RED, INK, 3.5), P(`M${cx - 8},${top + 30} L${cx + 8},${top + 30} L${cx + 14},${top + 104} L${cx},${top + 122} L${cx - 14},${top + 104} Z`, RED, INK, 3.5), L(`M${cx - 6},${top + 50} l12,-6 M${cx - 8},${top + 74} l16,-8`, 2.4, '#8f2219'));
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 38},${top - 8} L${cx + s * 84},${top + 20} L${cx + s * 40},${top + 70} L${cx + s * 50},${top + 90} L${cx + s * 6},${top + 160} L${cx},${top + 124} Z`, '#2c2e3a', INK, 4));
      o.push(P(`M${cx + 70},${top + 104} l40,0 l-4,-22 l-10,12 l-8,-16 l-8,16 l-10,-12 Z`, '#fff', INK, 3.5), L(`M${cx + 66},${top + 104} l48,0`, 4));
      o.push(circ(cx - 66, top + 64, 13, RED, 3.5), circ(cx - 66, top + 64, 5, '#8f2219', 0));
      o.push(...[0, 1].map(k => circ(cx + 14, top + 190 + k * 50, 7, '#1d1a26', 2.4)));
      return o; },
    props: ({ hdL }) => { const [hx, hy] = hdL, x = hx - 20, y = hy + 24, CS = '#2a2733';
      return [P(`M${x - 20},${y} L${x - 24},${y + 70} Q${x - 62},${y + 80} ${x - 58},${y + 140} Q${x - 40},${y + 176} ${x - 52},${y + 200} Q${x - 78},${y + 300} ${x},${y + 318} Q${x + 78},${y + 300} ${x + 52},${y + 200} Q${x + 40},${y + 176} ${x + 58},${y + 140} Q${x + 62},${y + 80} ${x + 24},${y + 70} L${x + 20},${y} Q${x},${y - 12} ${x - 20},${y} Z`, CS, INK, 6),
        L(`M${x - 14},${y + 20} Q${x - 22},${y + 110} ${x - 40},${y + 160}`, 3, '#4a4656'), hl(`M${x - 40},${y + 180} Q${x - 52},${y + 250} ${x - 30},${y + 290}`, 7, .3), ...[0, 1].map(k => rect(x - 44 + k * 76, y + 228, 12, 22, GOLD, 3, 3)),
        L(`M${x - 14},${y + 4} Q${x - 10},${y - 34} ${hx},${y - 30} Q${x + 14},${y - 30} ${x + 12},${y + 4}`, 11), L(`M${x - 14},${y + 4} Q${x - 10},${y - 34} ${hx},${y - 30} Q${x + 14},${y - 30} ${x + 12},${y + 4}`, 5, '#5a5468'), fist(hx, hy, 17)]; } },

  // 3 WWII AVIATOR: leather cap + goggles, sheepskin collar, long white scarf streaming in the wind
  { name: 'aviator', label: 'WWII Aviator', form: 'chad', coat: '#8a5530', face: 'proud',
    hat: ({ cx, hy }) => { const o = [], LB = '#7a4a26';
      o.push(fillPts([[cx - 110, hy + 76], [cx - 116, hy - 10], [cx - 100, hy - 86], [cx - 50, hy - 122], [cx, hy - 128], [cx + 50, hy - 122], [cx + 100, hy - 86], [cx + 116, hy - 10], [cx + 110, hy + 76], [cx + 82, hy + 80], [cx + 84, hy - 6], [cx + 62, hy - 44], [cx, hy - 56], [cx - 62, hy - 44], [cx - 84, hy - 6], [cx - 82, hy + 80]], LB, 7));
      o.push(L(`M${cx},${hy - 126} L${cx},${hy - 98}`, 4, '#4f2c1a'), L(`M${cx - 98},${hy - 6} q4,40 0,76 M${cx + 98},${hy - 6} q-4,40 0,76`, 3, '#a8703f'), hl(`M${cx - 80},${hy - 94} Q${cx - 40},${hy - 118} ${cx + 10},${hy - 118}`, 8, .35));
      for (const s of [-1, 1]) o.push(L(`M${cx + s * 96},${hy + 78} q${-s * 6},40 ${-s * 30},56`, 8, LB), L(`M${cx + s * 96},${hy + 78} q${-s * 6},40 ${-s * 30},56`, 2.4, INK), circ(cx + s * 96, hy + 78, 7, BRONZE, 2.6));
      o.push(brush(cx - 112, hy - 70, cx, hy - 92, cx + 112, hy - 70, 16, { col: '#3a2a22', tip: .9 }));
      for (const s of [-1, 1]) o.push(circ(cx + s * 40, hy - 84, 34, BRONZE, 6), circ(cx + s * 40, hy - 84, 23, '#7fc6d8', 4), L(`M${cx + s * 40 - 12},${hy - 92} q6,-10 16,-10`, 4, '#fff'));
      o.push(L(`M${cx - 8},${hy - 86} q8,-8 16,0`, 7, BRONZE));
      return o; },
    details: ({ cx, top }) => [L(`M${cx},${top + 40} L${cx},${top + 360}`, 5), ...[-1, 1].map(s => rect(cx + s * 80 - 34, top + 210, 68, 56, '#6e4527', 4, 6)),
      P(`M${cx - 104},${top + 116} q20,-8 40,-2 q20,-8 40,2 l-14,12 q-26,-6 -52,0 Z`, GOLD, INK, 3.5), circ(cx - 64, top + 118, 8, '#d8473c', 2.6),
      cloud([...Array(9)].map((_, k) => [cx - 176 + k * 44, top + 26 + Math.abs(k - 4) * 4, 32]), '#efe4c8'), hl(`M${cx - 150},${top + 90} Q${cx - 120},${top + 70} ${cx - 80},${top + 80}`, 10, .4)],
    props: ({ cx, top }) => [ribbon([[cx + 10, top + 46], [cx - 6, top + 110], [cx + 14, top + 186]], 26, '#f8f5ee'), L(`M${cx - 8},${top + 150} l40,0`, 3, '#cfc6b0')],
    over: ({ cx, top: top0, hy }) => { const top = top0 + 26, W = [[cx + 24, top + 16], [cx + 70, top + 2], [cx + 110, top - 24], [cx + 150, top - 10], [cx + 184, top - 34], [cx + 212, top - 66]];
      return [ribbon(W, 30, '#f8f5ee', 6), L(`M${cx + 50},${top + 14} Q${cx + 90},${top - 4} ${cx + 110},${top - 14} Q${cx + 150},${top} ${cx + 180},${top - 26}`, 3, '#cfc6b0'), ...[0, 1].map(k => L(`M${cx + 186 + k * 18},${top - 26 - k * 22 - 18} l${18},${24}`, 7, RED)), ...[0, 1, 2, 3].map(k => L(`M${cx + 206 + k * 7},${top - 88 + k * 8} l12,-12`, 4)),
        circ(cx + 22, top + 18, 24, '#f8f5ee', 5), L(`M${cx + 10},${top + 12} q10,10 22,2`, 3, '#cfc6b0'), L(`M${cx - 128},${top + 52} Q${cx - 262},${top - 40} ${cx - 120},${hy - 58}`, 24), fist(cx - 120, hy - 58, 21)]; },
    arms: B => ({ front: [B.arm(1, B.hdR[0], B.hdR[1])] }) },

  // 4 1950s GREASER: giant glossy pompadour, leather jacket with popped collar, comb
  { name: 'greaser', label: '1950s Greaser', form: 'noodle', coat: '#26232e', face: 'flirty',
    hat: ({ cx, hy }) => { const o = [], HB = '#1d1a26';
      o.push(fillPts([[cx - 104, hy + 6], [cx - 112, hy - 70], [cx - 96, hy - 140], [cx - 50, hy - 200], [cx + 20, hy - 238], [cx + 100, hy - 250], [cx + 150, hy - 222], [cx + 146, hy - 182], [cx + 110, hy - 180], [cx + 90, hy - 156], [cx + 104, hy - 100], [cx + 108, hy + 6], [cx + 90, hy - 22], [cx + 64, hy - 62], [cx + 20, hy - 64], [cx - 30, hy - 70], [cx - 76, hy - 50], [cx - 90, hy - 16]], HB, 7));
      o.push(hl(`M${cx - 74},${hy - 120} Q${cx - 30},${hy - 200} ${cx + 70},${hy - 226}`, 10, .35), hl(`M${cx - 50},${hy - 96} Q${cx},${hy - 160} ${cx + 80},${hy - 184}`, 5, .25));
      o.push(L(`M${cx - 90},${hy - 60} Q${cx - 60},${hy - 150} ${cx + 30},${hy - 210} M${cx - 70},${hy - 54} Q${cx - 30},${hy - 130} ${cx + 60},${hy - 176}`, 3.4, '#3a3446'));
      o.push(L(`M${cx + 130},${hy - 200} a14,14 0 1,1 -10,-22`, 4, '#3a3446'));
      o.push(P(`M${cx + 6},${hy - 64} c-16,14 6,30 -6,48 c18,-10 4,-28 14,-44 Z`, HB, INK, 3.5));
      return o; },
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 92},${hy - 30} L${cx + s * 104},${hy - 28} L${cx + s * 100},${hy + 36} L${cx + s * 86},${hy + 30} Z`, '#1d1a26', INK, 3.5))],
    details: ({ cx, top }) => [P(`M${cx - 26},${top - 10} L${cx + 26},${top - 10} L${cx + 20},${top + 420} L${cx - 20},${top + 420} Z`, '#f6f3ec', INK, 4),
      ...[-1, 1].map(s => L(`M${cx + s * 24},${top + 30} L${cx + s * 22},${top + 420}`, 5, SILVER)), ...[-1, 1].map(s => P(`M${cx + s * 24},${top} L${cx + s * 66},${top + 40} L${cx + s * 34},${top + 120} Z`, '#3a3446', INK, 4)),
      hl(`M${cx - 52},${top + 60} Q${cx - 58},${top + 200} ${cx - 50},${top + 330}`, 9, .3), rect(cx - 80, top + 360, 160, 26, '#3a3446', 4, 2), rect(cx - 14, top + 358, 28, 30, SILVER, 3.5, 4)],
    props: ({ cx, top }) => [...[-1, 1].map(s => P(`M${cx + s * 18},${top + 4} L${cx + s * 70},${top - 36} L${cx + s * 74},${top + 30} L${cx + s * 40},${top + 40} Z`, '#2f2b38', INK, 5)), ...[-1, 1].map(s => hl(`M${cx + s * 30},${top - 2} L${cx + s * 62},${top - 26}`, 4, .35))],
    over: ({ cx, hy }) => { const x = cx - 168, y = hy - 30; return [rot(-62, x, y, [rect(x - 62, y - 12, 124, 22, RED, 4.5, 6), ...[...Array(14)].map((_, k) => L(`M${x - 50 + k * 7.5},${y + 10} l0,24`, 3.4)), ...[...Array(14)].map((_, k) => L(`M${x - 50 + k * 7.5},${y + 10} l0,20`, 2, RED)), hl(`M${x - 54},${y - 4} L${x + 50},${y - 4}`, 4, .5)]), fist(cx - 160, hy + 12, 14)]; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 160, B.hy + 12, B.cx - 170, B.top + 120), B.arm(1, B.hdR[0], B.hdR[1])] }) },

  // 5 1960s HIPPIE: long centre-parted hair, flower headband, round rose shades, tie-dye, peace pendant, daisy
  { name: 'hippie', label: '1960s Hippie', form: 'standard', coat: '#f2c230', face: 'heartEyes',
    headBack: ({ cx, hy }) => [fillPts([[cx - 100, hy - 84], [cx - 130, hy + 10], [cx - 142, hy + 120], [cx - 134, hy + 210], [cx - 96, hy + 222], [cx - 84, hy + 130], [cx + 84, hy + 130], [cx + 96, hy + 222], [cx + 134, hy + 210], [cx + 142, hy + 120], [cx + 130, hy + 10], [cx + 100, hy - 84], [cx, hy - 120]], '#7a4f2a', 6),
      ...[-1, 1].map(s => L(`M${cx + s * 116},${hy + 40} q${s * 10},80 ${s * 2},160 M${cx + s * 104},${hy + 120} q${s * 4},50 ${s * 0},90`, 3, '#5a3a1e'))],
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 108, hy + 30], [cx - 106, hy - 66], [cx - 58, hy - 114], [cx, hy - 122], [cx + 58, hy - 114], [cx + 106, hy - 66], [cx + 108, hy + 30], [cx + 90, hy - 20], [cx + 44, hy - 58], [cx, hy - 70], [cx - 44, hy - 58], [cx - 90, hy - 20]], '#7a4f2a', 6), L(`M${cx},${hy - 120} L${cx},${hy - 72}`, 4, '#5a3a1e'), hl(`M${cx - 80},${hy - 84} Q${cx - 50},${hy - 110} ${cx - 16},${hy - 112}`, 7, .3));
      o.push(brush(cx - 110, hy - 62, cx, hy - 86, cx + 110, hy - 62, 15, { col: '#e0662e', tip: .9 }), L(`M${cx - 100},${hy - 66} ${[...Array(10)].map(() => 'l10,-6 l10,6').join(' ')}`, 3, '#f2d13a'));
      o.push(daisy(cx - 92, hy - 74, 30), daisy(cx - 52, hy - 96, 22, '#f6a8b8'), daisy(cx + 86, hy - 78, 24, '#fff', '#e0662e'));
      return o; },
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => `<circle cx="${cx + s * 36}" cy="${hy - 18}" r="29" fill="#f2902a" fill-opacity=".28" stroke="${GOLD}" stroke-width="5"/>`), ...[-1, 1].map(s => circ(cx + s * 36, hy - 18, 29, 'none', 2)), L(`M${cx - 8},${hy - 22} q8,-6 16,0`, 4, GOLD), ...[-1, 1].map(s => L(`M${cx + s * 64},${hy - 22} L${cx + s * 100},${hy - 32}`, 4, GOLD))],
    details: ({ cx, top }) => { const o = [], cols = ['#e8407a', '#f2902a', '#f2d13a', '#4fb04a', '#2f8fd0', '#7a3fb0'];
      for (let k = 0; k < 12; k++) { const r = 260 - k * 21; o.push(`<path d="${smooth([...Array(14)].map((_, j) => { const a = j / 14 * Math.PI * 2, rr = r + Math.sin(j * 2.3 + k) * 9; return [cx + 10 + Math.cos(a) * rr, top + 190 + Math.sin(a) * rr]; }))}" fill="${cols[k % 6]}"/>`); }
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 50},${top - 10} L${cx + s * 140},${top - 10} L${cx + s * 150},${top + 290} L${cx + s * 74},${top + 290} Q${cx + s * 60},${top + 120} ${cx + s * 50},${top - 10} Z`, '#a8703f', INK, 4), ...[...Array(7)].map((_, k) => L(`M${cx + s * (80 + k * 10)},${top + 290} l0,24`, 3, '#6e4527')));
      return o; },
    props: ({ cx, top, hdR }) => [L(`M${cx - 40},${top + 6} Q${cx - 30},${top + 80} ${cx},${top + 110} Q${cx + 30},${top + 80} ${cx + 40},${top + 6}`, 3.4), peace(cx, top + 132, 26, SILVER, 4.5),
],
    over: ({ cx, top }) => { const x = cx + 196, y = top + 60; return [L(`M${x},${y} Q${x + 16},${y - 70} ${x + 4},${y - 150}`, 10), L(`M${x},${y} Q${x + 16},${y - 70} ${x + 4},${y - 150}`, 4.5, '#4f9a3a'), P(`M${x + 10},${y - 60} q-34,-26 -44,-6 q20,18 44,6 Z`, '#6cbf4a', INK, 3), daisy(x + 4, y - 166, 42), fist(x, y, 15)]; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 196, B.top + 60, 30)] }) },

  // 6 1970s DISCO: enormous afro, purple satin shirt with giant collar, white flares, disco ball raised
  { name: 'disco', label: '1970s Disco', form: 'bigboi', coat: '#8a3fc8', face: 'starstruck',
    headBack: ({ cx, hy }) => { const cs = []; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; cs.push([cx + Math.cos(a) * 112, hy - 34 + Math.sin(a) * 104, 46]); } cs.push([cx, hy - 34, 120]);
      return [cloud(cs, '#3a2418', 6), ...[[-90, -100], [60, -130], [110, -40], [-120, -10], [-20, -150]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} a8,8 0 1,1 10,6`, 3, '#5e3c26'))]; },
    hat: ({ cx, hy }) => [cloud([...Array(7)].map((_, k) => [cx - 84 + k * 28, hy - 82 + Math.abs(k - 3) * 8, 26]), '#3a2418', 6)],
    details: ({ cx, top }) => [P(`M${cx - 50},${top - 10} L${cx},${top + 150} L${cx + 50},${top - 10} Z`, '#fff', INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 10 + k * 8},${top + 40 + k * 26} q4,6 0,12`, 2.4, '#b8ae98')),
      ...[[-130, 120], [120, 180], [-80, 270], [150, 330], [40, 240], [-160, 360]].map(([dx, dy]) => star4(cx + dx, top + dy, 14, '#f6e7ff')),
      rect(cx - 260, top + 380, 520, 120, '#f6f3ec', 0, 0), L(`M${cx - 260},${top + 380} L${cx + 260},${top + 380}`, 5), rect(cx - 260, top + 360, 520, 28, '#2a2733', 4, 0), rect(cx - 36, top + 352, 72, 44, GOLD, 4.5, 8), L(`M${cx},${top + 396} L${cx},${top + 470}`, 3.4, '#b8ae98')],
    props: ({ cx, top }) => [...[-1, 1].map(s => P(`M${cx + s * 30},${top - 4} L${cx + s * 170},${top + 26} L${cx + s * 140},${top + 60} L${cx + s * 60},${top + 140} L${cx + s * 54},${top + 60} Z`, '#fff', INK, 5)), ...[-1, 1].map(s => hl(`M${cx + s * 50},${top + 10} L${cx + s * 150},${top + 30}`, 5, .9))],
    over: ({ cx, top }) => { const x = cx + 190, y = top - 404, r = 54, o = [L(`M${cx + 160},${top + 70} Q${cx + 270},${top - 110} ${cx + 192},${top - 340}`, 17), `<clipPath id="disco08"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`, circ(x, y, r, '#9ea4b4', 0)];
      const tiles = []; for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) tiles.push(`<rect x="${x + i * 14 - 7}" y="${y + j * 14 - 7}" width="14" height="14" fill="${[STEEL, '#e8ecf4', '#8a90a2', '#cfd5e2'][(i * 7 + j * 3 + 40) % 4]}" stroke="#5a6070" stroke-width="1.6"/>`);
      o.push(`<g clip-path="url(#disco08)">${tiles.join('')}<circle cx="${x + 18}" cy="${y + 18}" r="${r}" fill="none" stroke="#2a1a1f" stroke-opacity=".2" stroke-width="22"/></g>`, circ(x, y, r, 'none', 6), L(`M${x},${y - r} L${x},${y - r - 26}`, 4), hl(`M${x - 36},${y - 26} Q${x - 30},${y - 42} ${x - 14},${y - 46}`, 6, .8), star4(x - 70, y - 40, 20, '#fff'), star4(x + 40, y - 80, 14, GOLDL), star4(x - 44, y + 70, 12, GOLDL), fist(cx + 192, top - 340, 19));
      return o; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 236, B.top + 330, B.cx - 260, B.top + 160)] }) },

  // 7 1980s AEROBICS: crimped blonde hair + giant side ponytail, neon headband, striped leotard, leg warmers, dumbbell up
  { name: 'aerobics', label: '1980s Aerobics', form: 'lady', coat: '#ff4fa0', face: ['female', 'fangirl'],
    headBack: ({ cx, hy }) => { const Y = '#f2d36a'; return [cloud([[cx - 86, hy - 124, 40], [cx - 112, hy - 158, 34], [cx - 90, hy - 196, 34], [cx - 56, hy - 172, 30], [cx - 118, hy - 116, 28]], Y, 6), ...[[-110, -160], [-90, -126], [-80, -196]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} l10,-8 l8,8 l10,-8`, 3, '#c9a43a')),
      fillPts([[cx - 112, hy - 40], [cx - 126, hy + 40], [cx - 118, hy + 96], [cx + 118, hy + 96], [cx + 126, hy + 40], [cx + 112, hy - 40], [cx, hy - 110]], Y, 6)]; },
    hat: ({ cx, hy }) => { const Y = '#f2d36a', o = [];
      o.push(fillPts([[cx - 116, hy + 4], [cx - 114, hy - 66], [cx - 60, hy - 118], [cx, hy - 128], [cx + 60, hy - 118], [cx + 114, hy - 66], [cx + 116, hy + 4], [cx + 96, hy - 4], [cx + 88, hy - 50], [cx + 40, hy - 62], [cx, hy - 54], [cx - 40, hy - 62], [cx - 88, hy - 50], [cx - 96, hy - 4]], Y, 6));
      for (let k = 0; k < 3; k++) o.push(L(`M${cx - 70 + k * 10},${hy - 100 - k * 8} ${[...Array(7)].map(() => 'l8,-5 l8,5').join(' ')}`, 2.6, '#c9a43a'), L(`M${cx - 108},${hy - 30 - k * 20} l6,-6 l6,6 M${cx + 96},${hy - 30 - k * 20} l6,-6 l6,6`, 2.6, '#c9a43a'));
      o.push(brush(cx - 116, hy - 64, cx, hy - 92, cx + 116, hy - 64, 20, { col: '#2ec4c4', tip: .9 }), L(`M${cx - 100},${hy - 72} Q${cx},${hy - 94} ${cx + 100},${hy - 72}`, 3, '#fff'));
      o.push(cloud([[cx - 96, hy - 100, 16], [cx - 84, hy - 114, 14], [cx - 108, hy - 116, 14]], '#2ec4c4', 4));
      return o; },
    details: ({ cx, top, bot }) => [...[0, 1, 2, 3, 4, 5].map(k => rot(-28, cx, top + 200, rect(cx - 300, top + 20 + k * 64, 600, 22, k % 2 ? '#ffe14a' : '#2ec4c4', 0, 0))),
      rect(cx - 200, bot - 92, 400, 100, '#8a4fd0', 4, 0), ...[...Array(26)].map((_, k) => L(`M${cx - 180 + k * 14},${bot - 86} l0,90`, 3, '#6a34a8')), L(`M${cx - 200},${bot - 50} q50,12 100,0 q50,-12 100,0 q50,12 100,0 q50,-12 100,0`, 3, '#6a34a8')],
    over: ({ cx, top }) => { const x = cx + 166, y = top - 290; return [L(`M${cx + 52},${top + 46} Q${cx + 240},${top - 60} ${x},${y}`, 13), rot(-20, x, y, [rect(x - 54, y - 6, 108, 12, STEEL, 3.5, 4), rect(x - 74, y - 28, 26, 56, '#ff4fa0', 5, 8), rect(x + 48, y - 28, 26, 56, '#ff4fa0', 5, 8), hl(`M${x - 66},${y - 18} l0,30`, 4, .6), hl(`M${x + 56},${y - 18} l0,30`, 4, .6)]), fist(x, y, 15)]; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 60, B.top + 130, B.cx - 150, B.top + 90), ] }) },

  // 8 1980s PUNK: towering green mohawk, studded leather, spiked collar, safety pins, tartan
  { name: 'punk', label: '1980s Punk', form: 'kid', coat: '#26232e', face: 'scream',
    hat: ({ cx, hy }) => { const o = [], G = '#7ad13a', GD = '#4e9a22';
      const sp = [[-46, -230, -54], [-24, -296, -22], [0, -330, 0], [24, -296, 22], [46, -230, 54]];
      let d = `M${cx - 66},${hy - 80}`; sp.forEach(([bx, ty, tx], i) => { d += ` L${cx + tx},${hy + ty} L${cx + bx + (i < 4 ? 12 : 20)},${hy - 120 + Math.abs(bx) * .4}`; }); d += ` L${cx + 66},${hy - 80} Q${cx},${hy - 116} ${cx - 66},${hy - 80} Z`;
      o.push(P(d, G, INK, 7));
      sp.forEach(([bx, ty, tx]) => o.push(L(`M${cx + bx * .6},${hy - 110} L${cx + tx * .9},${hy + ty + 40}`, 3.4, GD)));
      
      return o; },
    faceTop: ({ cx, hy }) => [spin(cx + 104, hy + 46, 90, 36)],
    details: ({ cx, top }) => [rect(cx - 120, top + 150, 240, 80, '#c8302e', 0, 0), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${cx - 100 + k * 40},${top + 150} l0,80`, 5, '#1d1a26')), ...[0, 1].map(k => L(`M${cx - 120},${top + 172 + k * 30} l240,0`, 5, '#1d1a26')), ...[0, 1, 2].map(k => L(`M${cx - 120},${top + 164 + k * 30} l240,0`, 2, '#f2d13a')), L(`M${cx - 110},${top + 150} L${cx + 110},${top + 150}`, 4),
      ...[-1, 1].map(s => P(`M${cx + s * 10},${top} L${cx + s * 54},${top + 30} L${cx + s * 22},${top + 110} Z`, '#3a3446', INK, 3.5)), L(`M${cx},${top + 20} L${cx},${top + 148}`, 3.4, SILVER),
      ...[[-60, 20], [-44, 6], [-70, 44], [60, 20], [44, 6], [70, 44], [-56, 120], [56, 120]].map(([dx, dy]) => stud(cx + dx, top + dy)), rect(cx + 18, top + 56, 40, 40, '#f2d13a', 3, 3), L(`M${cx + 26},${top + 64} l24,24 M${cx + 50},${top + 64} l-24,24`, 4.5, '#c8302e'),
      spin(cx - 36, top + 80, -30, 34), spin(cx - 40, top + 116, 20, 30)],
    props: ({ cx, top }) => [rect(cx - 46, top - 8, 92, 18, '#1d1a26', 4, 6), ...[-32, -12, 8, 28].map(dx => P(`M${cx + dx - 5},${top + 10} L${cx + dx + 1},${top + 26} L${cx + dx + 7},${top + 10} Z`, SILVER, INK, 2.4))] },

  // 9 1990s HIP-HOP: oversized backwards cap, gold rope chain + mic medallion, colour-block windbreaker, boombox on the shoulder
  { name: 'hiphop', label: '1990s Hip-Hop', form: 'standard', coat: '#6b3fb0', face: 'cool',
    headBack: ({ cx, hy }) => [rot(-24, cx - 60, hy - 120, [P(`M${cx - 40},${hy - 110} Q${cx - 120},${hy - 146} ${cx - 160},${hy - 124} Q${cx - 166},${hy - 96} ${cx - 130},${hy - 86} Q${cx - 100},${hy - 84} ${cx - 50},${hy - 70} Z`, '#2f8fd0', INK, 6), L(`M${cx - 70},${hy - 92} Q${cx - 110},${hy - 118} ${cx - 150},${hy - 110}`, 3, '#1f5f9a')])],
    hat: ({ cx, hy }) => { const o = [], C = '#2f8fd0';
      o.push(fillPts([[cx - 118, hy - 16], [cx - 112, hy - 96], [cx - 60, hy - 138], [cx, hy - 146], [cx + 60, hy - 138], [cx + 112, hy - 96], [cx + 118, hy - 16], [cx + 60, hy - 34], [cx, hy - 38], [cx - 60, hy - 34]], C, 7));
      o.push(P(`M${cx - 36},${hy - 36} Q${cx - 36},${hy - 84} ${cx},${hy - 86} Q${cx + 36},${hy - 84} ${cx + 36},${hy - 36} Z`, '#f4f2f6', INK, 5), rect(cx - 34, hy - 60, 68, 12, '#1d1a26', 3, 4));
      o.push(L(`M${cx - 60},${hy - 128} Q${cx - 50},${hy - 80} ${cx - 50},${hy - 40} M${cx + 60},${hy - 128} Q${cx + 50},${hy - 80} ${cx + 50},${hy - 40}`, 3, '#1f5f9a'), ell(cx, hy - 146, 10, 7, C, INK, 3.5), hl(`M${cx - 90},${hy - 96} Q${cx - 60},${hy - 128} ${cx - 20},${hy - 132}`, 9, .4));
      return o; },
    details: ({ cx, top }) => [poly([[cx - 200, top - 20], [cx + 10, top - 20], [cx - 200, top + 170]], '#2ec4c4', 4), poly([[cx - 200, top + 200], [cx + 200, top + 80], [cx + 200, top + 140], [cx - 200, top + 260]], '#ff4fa0', 4), poly([[cx + 60, top + 260], [cx + 200, top + 200], [cx + 200, top + 400], [cx + 60, top + 400]], '#f2d13a', 4), L(`M${cx},${top - 10} L${cx},${top + 400}`, 5, SILVER)],
    props: ({ cx, top }) => { const o = [], pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20, a = Math.PI * t; pts.push([cx - Math.cos(a) * 62, top + 2 + Math.sin(a) * 120]); }
      pts.forEach(([x, y], i) => o.push(ell(x, y, 11, 8, i % 2 ? GOLD : GOLDL, INK, 3)));
      o.push(circ(cx, top + 170, 44, GOLD, 6), circ(cx, top + 170, 32, GOLDL, 3), ell(cx, top + 156, 13, 16, '#8a90a2', INK, 4), L(`M${cx},${top + 172} L${cx},${top + 196}`, 7), hl(`M${cx - 30},${top + 150} Q${cx - 24},${top + 136} ${cx - 12},${top + 132}`, 5, .7));
      return o; },
    over: ({ cx, top }) => { const x0 = cx + 112, y0 = top - 150, w = 134, h = 88, o = [];
      o.push(L(`M${x0 + 24},${y0} Q${x0 + 24},${y0 - 30} ${x0 + w / 2},${y0 - 30} Q${x0 + w - 24},${y0 - 30} ${x0 + w - 24},${y0}`, 12), L(`M${x0 + 24},${y0} Q${x0 + 24},${y0 - 30} ${x0 + w / 2},${y0 - 30} Q${x0 + w - 24},${y0 - 30} ${x0 + w - 24},${y0}`, 5, STEEL));
      o.push(rect(x0, y0, w, h, '#c9ccd6', 6, 10), circ(x0 + 34, y0 + 50, 26, '#2a2733', 4), circ(x0 + 34, y0 + 50, 11, '#5a5468', 3), circ(x0 + w - 34, y0 + 50, 26, '#2a2733', 4), circ(x0 + w - 34, y0 + 50, 11, '#5a5468', 3), rect(x0 + w / 2 - 14, y0 + 30, 28, 22, '#3a3446', 3, 3), ...[0, 1, 2].map(k => rect(x0 + w / 2 - 15 + k * 11, y0 + 62, 8, 10, RED, 2, 2)), rect(x0 + 12, y0 + 8, w - 24, 12, '#8a90a2', 2.4, 3), hl(`M${x0 + 10},${y0 + 12} L${x0 + 40},${y0 + 12}`, 4, .6));
      o.push(fist(x0 + w / 2 + 6, y0 + h + 8, 16));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), armQ(B, 1, B.cx + 185, B.top - 54, B.cx + 230, B.top + 80)] }) },

  // 10 2010s INFLUENCER: long sleek hair + shades on head, phone on a selfie stick, ring light glowing behind
  { name: 'influencer', label: '2010s Influencer', form: 'lady', coat: '#f2a7c3', face: ['female', 'duckFace'],
    behind: ({ cx, top }) => { const x = cx, y = top - 130, r = 200;
      return [L(`M${x + 150},${y + 100} L${x + 150},${1004} M${x + 150},${880} L${x + 100},${1004} M${x + 150},${880} L${x + 200},${1004}`, 11), L(`M${x + 150},${y + 100} L${x + 150},${1004} M${x + 150},${880} L${x + 100},${1004} M${x + 150},${880} L${x + 200},${1004}`, 4, '#5a5468'),
        `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fffbe6" stroke-opacity=".55" stroke-width="64"/>`, `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="34"/>`, `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fffdf4" stroke-width="24"/>`, `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ffe9a8" stroke-width="5"/>`, rect(x + 138, y + 120, 24, 30, '#3a3446', 4, 4)]; },
    headBack: ({ cx, hy }) => [fillPts([[cx - 104, hy - 84], [cx - 128, hy + 20], [cx - 130, hy + 120], [cx - 116, hy + 200], [cx - 76, hy + 212], [cx - 74, hy + 120], [cx + 74, hy + 120], [cx + 76, hy + 212], [cx + 112, hy + 196], [cx + 122, hy + 120], [cx + 128, hy + 20], [cx + 104, hy - 84], [cx, hy - 120]], '#b07a3e', 6), ...[-1, 1].map(s => L(`M${cx + s * 106},${hy + 60} q${s * 8},70 ${s * 2},130`, 3, '#8a5a2b'))],
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 110, hy + 40], [cx - 108, hy - 64], [cx - 60, hy - 114], [cx, hy - 122], [cx + 60, hy - 114], [cx + 108, hy - 64], [cx + 110, hy + 40], [cx + 90, hy - 10], [cx + 50, hy - 60], [cx - 20, hy - 80], [cx - 70, hy - 50], [cx - 92, hy - 4]], '#b07a3e', 6), L(`M${cx - 20},${hy - 80} Q${cx - 30},${hy - 104} ${cx - 34},${hy - 118}`, 3.4, '#8a5a2b'), hl(`M${cx + 20},${hy - 104} Q${cx + 60},${hy - 104} ${cx + 86},${hy - 72}`, 7, .35));
      o.push(L(`M${cx - 96},${hy - 86} Q${cx},${hy - 128} ${cx + 96},${hy - 86}`, 5), ...[-1, 1].map(s => P(`M${cx + s * 8},${hy - 108} Q${cx + s * 40},${hy - 120} ${cx + s * 76},${hy - 102} Q${cx + s * 80},${hy - 74} ${cx + s * 48},${hy - 72} Q${cx + s * 14},${hy - 76} ${cx + s * 8},${hy - 108} Z`, '#2a2733', INK, 5)), ...[-1, 1].map(s => hl(`M${cx + s * 30},${hy - 104} l${s * 18},-2`, 4, .6)));
      return o; },
    details: ({ cx, top }) => [rect(cx - 160, top + 120, 320, 18, '#fff', 3.5, 2), ...[[-90, 220], [60, 260], [-30, 320], [100, 350], [-120, 340]].map(([dx, dy]) => heart(cx + dx, top + dy, 11, '#fff'))],
    over: ({ cx, top }) => { const hx = cx - 120, hy = top + 30, px = cx - 200, py = top - 250, o = [];
      o.push(pole(hx, hy, px + 8, py + 70, STEEL, 7), rot(-14, px, py, [rect(px - 34, py - 60, 68, 120, '#2a2733', 6, 12), rect(px - 26, py - 50, 52, 96, '#7fd4ef', 3, 6), heart(px, py - 6, 14, '#f05a78'), rect(px - 22, py - 46, 26, 12, RED, 2, 3)]), circ(px + 6, py + 64, 12, STEEL, 4));
      o.push(rect(px + 36, py - 116, 70, 34, '#f05a78', 4, 17), heart(px + 56, py - 99, 8, '#fff'), `<text x="${px + 84}" y="${py - 91}" font-family="Arial Black,Arial" font-weight="900" font-size="18" text-anchor="middle" fill="#fff">99+</text>`);
      o.push(heart(px + 80, py - 20, 12), heart(px + 66, py + 26, 8), fist(hx, hy, 14));
      return o; },
    arms: B => ({ front: [armQ(B, -1, B.cx - 120, B.top + 30, B.cx - 150, B.top + 120), B.arm(1, B.hdR[0], B.hdR[1])] }) },
];
