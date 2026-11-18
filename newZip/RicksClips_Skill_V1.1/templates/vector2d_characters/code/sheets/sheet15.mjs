// SHEET 15 — MONSTERS (original creatures; MONSTER face set from faces_monster.mjs)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, GOLD, GOLDL, STEEL, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4 } from '../castkit.mjs';
export const TITLE = 'Cast sheet 15: Monsters';

const FUR = '#7a5a40', FURL = '#a07a58', EARP = '#e89aa8', BONE = '#f2ead4', SLIME = '#8fc24a', WEED = '#4f8a36', TEAL = '#5db6a3', TEALL = '#a3e3d2';
const T = (x, y, s, size = 30, rot = 0, fill = INK, sw = 0) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}" paint-order="stroke"` : ''} transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
const q = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
const rib = (d, w, col) => L(d, w + 7) + L(d, w, col);                       // inked ribbon (bones, weeds, tails)
// three claw tears in the shirt with fur showing through
const slash = (x, y, k = 1) => [-22, 0, 22].map(t => { const x0 = x + t * k, d = `M${f1(x0 + 26 * k)},${f1(y - 44 * k)} L${f1(x0 + 8 * k)},${f1(y - 10 * k)} L${f1(x0 + 2 * k)},${f1(y - 16 * k)} L${f1(x0 - 14 * k)},${f1(y + 20 * k)} L${f1(x0 - 26 * k)},${f1(y + 44 * k)} L${f1(x0 - 4 * k)},${f1(y + 14 * k)} L${f1(x0 + 2 * k)},${f1(y + 18 * k)} L${f1(x0 + 16 * k)},${f1(y - 14 * k)} Z`; return P(d, FUR, INK, 4); }).join('');
const RIPR = [1, .5, .86, .62, 1.12, .44, .9, .7, 1.04, .52, .8, .58]; const rip = (x, y, w, h, n = 12) => { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .2, r = RIPR[k % 12]; pts.push([x + Math.cos(a) * w * r, y + Math.sin(a) * h * r]); } return poly(pts, FUR, 4) + L(`M${x - w * .3},${y - h * .1} l${f1(w * .2)},${f1(h * .3)} M${x + w * .1},${y - h * .2} l${f1(w * .2)},${f1(h * .3)}`, 3, '#5a3e2a'); };
const flake = (x, y, r = 14) => { const d = [0, 60, 120].map(a => { const c = Math.cos(a * Math.PI / 180) * r, s = Math.sin(a * Math.PI / 180) * r; return `M${f1(x - c)},${f1(y - s)} L${f1(x + c)},${f1(y + s)}`; }).join(' '); return L(d, 8) + L(d, 3.4, '#fff'); };
const coin = (x, y, r = 14) => circ(x, y, r, GOLD, 3.5) + circ(x, y, r * .55, 'none', 2.4) + L(`M${x - r * .5},${y - r * .4} q${r * .2},${-r * .3} ${r * .5},${-r * .4}`, 2.4, '#fff');
const ring = (x, y, rx, ry, n) => [...Array(n)].map((_, k) => { const a = k / n * Math.PI * 2; return [x + Math.cos(a) * rx, y + Math.sin(a) * ry]; });
// shaggy fur: polygon through pts with a pointed tuft between each pair, pushed outward (from the centroid) and a bit downward
const shag = (pts, len, col) => { const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n, out = [];
  for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.hypot(m[0] - mx, m[1] - my) || 1; out.push(a, [m[0] + (m[0] - mx) / d * len, m[1] + (m[1] - my) / d * len + len * .45]); }
  return poly(out, col, 6); };
const SKULL = { egg: -.1, aspect: .98, tilt: -3, lumps: [[2, .02, 1.0], [3, .02, 2.0]] };
const LUMPY = { egg: .03, aspect: .97, tilt: 14, lumps: [[2, .045, 2.6], [3, .035, .4], [5, .015, 1.3]] };

export const CAST = [
  // 1 WEREWOLF: torn flannel, fur bursting through, claws up, tall ears, bushy tail
  { name: 'werewolf', label: 'Werewolf', form: 'chad', coat: '#c4473a', face: ['monster', 'werewolf'],
    hat: ({ cx, hy }) => [-1, 1].flatMap(s => [P(`M${cx + s * 22},${hy - 92} L${cx + s * 72},${hy - 214} L${cx + s * 106},${hy - 64} Z`, FUR, INK, 6), P(`M${cx + s * 44},${hy - 98} L${cx + s * 72},${hy - 176} L${cx + s * 88},${hy - 86} Z`, EARP, INK, 3.5)]),
    behind: ({ cx, top }) => [fillPts([[cx + 90, top + 336], [cx + 190, top + 334], [cx + 238, top + 262], [cx + 240, top + 160], [cx + 214, top + 214], [cx + 200, top + 260], [cx + 160, top + 296], [cx + 90, top + 300]], FUR, 6),
      L(`M${cx + 236},${top + 168} l-14,30 l18,-6 l-12,30`, 3.4, '#5a3e2a')],
    details: ({ cx, top }) => { const o = [];
      for (let x = -220; x <= 220; x += 56) o.push(`<rect x="${cx + x}" y="${top}" width="18" height="420" fill="#7e2620" opacity=".5"/><rect x="${cx + x + 30}" y="${top}" width="4" height="420" fill="#f2d16b" opacity=".55"/>`);
      for (let y = 30; y < 300; y += 56) o.push(`<rect x="${cx - 240}" y="${top + y}" width="480" height="18" fill="#7e2620" opacity=".45"/>`);
      o.push(P(`M${cx - 56},${top - 20} L${cx},${top + 120} L${cx + 56},${top - 20} Z`, FUR, INK, 4.5), L(`M${cx - 16},${top + 40} l8,16 M${cx + 8},${top + 30} l8,18 M${cx - 4},${top + 76} l6,16`, 3, '#5a3e2a'));
      o.push(slash(cx - 96, top + 170, 1.1), slash(cx + 100, top + 120, .9));
      o.push(P(`M${cx - 240},${top + 290} L${cx - 180},${top + 270} L${cx - 150},${top + 304} L${cx - 104},${top + 264} L${cx - 64},${top + 300} L${cx - 20},${top + 266} L${cx + 20},${top + 302} L${cx + 64},${top + 264} L${cx + 104},${top + 300} L${cx + 146},${top + 266} L${cx + 184},${top + 298} L${cx + 240},${top + 270} L${cx + 240},${top + 440} L${cx - 240},${top + 440} Z`, '#3b4a6a', INK, 4.5), L(`M${cx},${top + 300} L${cx},${top + 440}`, 3, '#2a3550'));
      return o; },
    props: ({ cx, top }) => [-1, 1].map(s => poly([[cx + s * 130, top + 20], [cx + s * 168, top + 4], [cx + s * 156, top + 30], [cx + s * 186, top + 36], [cx + s * 150, top + 56], [cx + s * 128, top + 50]], FUR, 4)),
    arms: B => ({ front: [B.arm(-1, B.cx - 210, B.top - 30, 34), B.arm(1, B.cx + 210, B.top - 30, -34)] }),
    over: ({ cx, top }) => [-1, 1].map(s => { const x = cx + s * 210, y = top - 30; return L(`M${x - 12},${y - 8} q-8,-10 -6,-26 M${x},${y - 12} q0,-12 4,-26 M${x + 12},${y - 6} q8,-8 14,-22`, 6); }) },

  // 2 CHAINED GHOST: floating sheet, iron ball and chain on one wrist, old lantern in the other
  { name: 'ghost', label: 'Chained Ghost', form: 'ghost', coat: '#eef3fb', face: ['monster', 'booo'], keepFormDetails: true,
    props: ({ cx }) => { const o = [], hx = cx + 176, hy2 = 354, A = [hx, hy2 + 14], C = [hx + 70, hy2 + 260], E = [cx + 200, 790];
      for (let k = 0; k < 16; k++) { const t = k / 16, [x, y] = q(A, C, E, t), [x2, y2] = q(A, C, E, t + .01), a = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI + (k % 2 ? 0 : 90);
        o.push(`<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="15" ry="8" fill="none" stroke="${INK}" stroke-width="10"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="15" ry="8" fill="none" stroke="#9aa0ae" stroke-width="4"/></g>`); }
      o.push(circ(cx + 200, 830, 46, '#3a3846', 6), hl(`M${cx + 170},${812} Q${cx + 178},${794} ${cx + 196},${790}`, 7, .4), rect(hx - 20, hy2 - 6, 40, 22, '#9aa0ae', 4.5, 5));
      const lx = cx - 176, ly = hy2;
      o.push(`<circle cx="${lx}" cy="${ly + 52}" r="58" fill="#ffe27a" opacity=".3"/>`, L(`M${lx - 18},${ly + 16} Q${lx},${ly - 12} ${lx + 18},${ly + 16}`, 5), poly([[lx - 18, ly + 16], [lx + 18, ly + 16], [lx + 28, ly + 30], [lx - 28, ly + 30]], '#3a3846', 4), rect(lx - 24, ly + 30, 48, 58, '#ffe27a', 5, 4),
        L(`M${lx - 8},${ly + 32} L${lx - 8},${ly + 86} M${lx + 8},${ly + 32} L${lx + 8},${ly + 86}`, 4), P(`M${lx},${ly + 70} q-8,-10 0,-24 q8,14 0,24 Z`, '#ff9a3c', INK, 2.4), rect(lx - 28, ly + 86, 56, 12, '#3a3846', 4, 3), fist(lx, ly + 2, 13));
      return o; } },

  // 3 CYCLOPS: round brute in a leopard pelt, horn, giant nail-studded club
  { name: 'cyclops', label: 'Cyclops', form: 'bigboi', coat: '#9b6b3e', face: ['monster', 'cyclops'],
    details: ({ cx, top }) => [P(`M${cx - 240},${top + 30} Q${cx - 60},${top - 30} ${cx + 70},${top + 10} L${cx + 240},${top + 210} L${cx + 240},${top + 300} Q${cx + 60},${top + 120} ${cx - 240},${top + 170} Z`, '#e8c88a', INK, 5),
      ...[[-170, 80], [-110, 40], [-40, 70], [30, 50], [90, 110], [150, 160], [200, 230], [-200, 130], [-60, 120]].map(([x, y], i) => ell(cx + x, top + y, 12 + (i % 3) * 3, 9, '#7a5a34') + ell(cx + x + 2, top + y + 1, 5, 4, '#e8c88a')),
      rect(cx - 240, top + 330, 480, 28, '#c9a66b', 4, 6), P(`M${cx + 30},${top + 340} q-20,30 -10,70 l14,0 q-4,-34 10,-64 Z M${cx + 40},${top + 340} q20,30 14,66 l-14,2 q0,-34 -10,-62 Z`, '#c9a66b', INK, 3.5),
      rect(cx - 140, top + 390, 64, 54, '#7a5230', 3.5, 4), L(`M${cx - 134},${top + 398} l52,0 M${cx - 134},${top + 436} l52,0`, 2.4, '#e8c88a'), hl(`M${cx - 200},${top + 230} Q${cx - 190},${top + 300} ${cx - 150},${top + 370}`, 10, .3)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 196, B.top + 160, -12)] }),
    over: ({ cx, top }) => { const pts = [[cx + 186, top + 214], [cx + 208, top + 214], [cx + 226, top - 20], [cx + 236, top - 170], [cx + 220, top - 250], [cx + 186, top - 268], [cx + 150, top - 248], [cx + 140, top - 170], [cx + 168, top - 20]];
      return [...[[150, -200], [146, -140], [232, -210], [236, -140], [170, -262], [214, -262]].map(([x, y]) => { const s = x > 190 ? 1 : -1; return poly([[cx + x, top + y - 10], [cx + x + s * 16, top + y], [cx + x, top + y + 10]], STEEL, 3); }),
        fillPts(pts, WOOD, 6), L(`M${cx + 176},${top - 200} q10,40 4,90 M${cx + 206},${top - 230} q8,50 -2,110 M${cx + 196},${top - 60} q4,40 0,80`, 3.4, WOODD), hl(`M${cx + 160},${top - 230} Q${cx + 152},${top - 180} ${cx + 160},${top - 110}`, 7, .45),
        ...[[178, -220], [212, -186], [176, -150], [208, -110]].map(([x, y]) => circ(cx + x, top + y, 5, STEEL, 2.4)), fist(cx + 196, top + 160, 19)]; } },

  // 4 SKELETON: black suit with ink-bone ribcage, red bow tie, trumpet "DOOT"
  { name: 'skeleton', label: 'Skeleton', form: 'noodle', coat: '#24222c', face: ['monster', 'skull'], head: SKULL,
    details: ({ cx, top }) => { const o = [rib(`M${cx},${top + 44} L${cx},${top + 200}`, 13, BONE)];
      for (let k = 0; k < 5; k++) { const y = top + 62 + k * 30, w = 52 - k * 3; for (const s of [-1, 1]) o.push(rib(`M${cx + s * 6},${y} Q${cx + s * w},${y - 8} ${cx + s * (w - 4)},${y + 20}`, 8, BONE)); }
      for (let k = 0; k < 4; k++) o.push(ell(cx, top + 222 + k * 22, 11, 8, BONE, INK, 3.5));
      o.push(P(`M${cx - 8},${top + 306} Q${cx - 40},${top + 290} ${cx - 56},${top + 310} Q${cx - 50},${top + 340} ${cx - 20},${top + 350} L${cx},${top + 372} L${cx + 20},${top + 350} Q${cx + 50},${top + 340} ${cx + 56},${top + 310} Q${cx + 40},${top + 290} ${cx + 8},${top + 306} Z`, BONE, INK, 4));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 92, B.top + 240, 40), B.arm(1, B.cx + 148, 112, 10)] }),
    over: ({ cx }) => { const tube = `M${cx + 88},${102} L${cx + 196},${74}`;
      return [rib(tube, 9, GOLD), rib(`M${cx + 110},${100} q16,26 50,12 q14,-6 10,-20`, 6, GOLD), ...[0, 1, 2].map(k => rect(cx + 120 + k * 16, 70 - k * 4, 9, 18, GOLDL, 2.6, 2)),
        P(`M${cx + 188},${78} L${cx + 238},${28} Q${cx + 256},${78} ${cx + 246},${124} L${cx + 192},${88} Z`, GOLD, INK, 5), ell(cx + 243, 76, 9, 46, '#b8862a', INK, 3), hl(`M${cx + 200},${70} L${cx + 230},${42}`, 4, .6), circ(cx + 88, 102, 7, GOLDL, 3), fist(cx + 148, 112, 14),
        T(cx + 176, 196, 'DOOT', 46, -10, '#fff', 8), L(`M${cx + 236},${-12} l0,-34 l20,6 M${cx + 196},${-44} l0,-30 l18,6`, 5), ell(cx + 230, -10, 9, 7, INK), ell(cx + 190, -42, 9, 7, INK)]; } },

  // 5 SWAMP CREATURE: lily pad hat with a frog, weeds hanging everywhere, cattail
  { name: 'swamp', label: 'Swamp Creature', form: 'standard', coat: '#56703f', face: ['monster', 'swamp'],
    headBack: ({ cx, hy }) => [-1, 1].flatMap(s => [rib(`M${cx + s * 70},${hy - 70} q${s * 50},40 ${s * 34},90 q${-s * 16},50 ${s * 20},110`, 12, WEED), rib(`M${cx + s * 40},${hy - 90} q${s * 70},40 ${s * 84},70 q${s * 10},40 ${s * 20},70`, 10, '#3f6b2e')]),
    hat: ({ cx, hy }) => { const y = hy - 122, p1 = [cx + 44, y - 28], p2 = [cx - 22, y - 30];
      return [P(`M${cx + 4},${y} L${p1[0]},${p1[1]} A132,31 0 1,1 ${p2[0]},${p2[1]} Z`, '#5fa83a', INK, 6), ...[-110, -60, 60, 110].map(t => L(`M${cx},${y} L${cx + t},${y + (Math.abs(t) > 80 ? 4 : 18)}`, 3, '#3f7a2c')), hl(`M${cx - 104},${y - 6} Q${cx - 60},${y - 24} ${cx - 30},${y - 26}`, 6, .5),
        ...[-40, -10, 20].map((a, i) => `<g transform="rotate(${a} ${cx - 70} ${y - 10})">${ell(cx - 70, y - 34, 12, 26, '#f59ab4', INK, 3.5)}</g>`), ell(cx - 70, y - 12, 12, 8, GOLD, INK, 3),
        ell(cx + 72, y - 12, 30, 20, '#7ac04a', INK, 4.5), ...[-1, 1].map(s => circ(cx + 72 + s * 14, y - 32, 10, '#7ac04a', 4) + ell(cx + 72 + s * 14, y - 32, 4, 5, INK)), L(`M${cx + 60},${y - 6} q12,8 24,0`, 3), ell(cx + 66, y - 2, 4, 3, '#f59ab4')]; },
    faceTop: ({ cx, hy }) => [rib(`M${cx - 92},${hy - 62} q-20,30 -10,60 q8,30 -4,60`, 10, WEED), rib(`M${cx + 96},${hy - 56} q18,30 6,62 q-8,26 6,52`, 10, WEED)],
    details: ({ cx, top }) => [...[-120, -60, 0, 60, 120].map((x, i) => rib(`M${cx + x},${top - 10} q${i % 2 ? 20 : -20},60 0,120 q${i % 2 ? -20 : 20},60 0,${100 + i * 20}`, 12, i % 2 ? WEED : '#3f6b2e')),
      ...[[-80, 260, 18], [70, 200, 14], [10, 300, 12], [-30, 140, 10]].map(([x, y, r]) => ell(cx + x, top + y, r, r * .7, '#6b5a34', INK, 3)), ...[[-100, 40], [90, 60]].map(([x, y]) => P(`M${cx + x - 10},${top + y} L${cx + x - 10},${top + y + 40} A10,10 0 0,0 ${cx + x + 10},${top + y + 40} L${cx + x + 10},${top + y} Z`, SLIME, INK, 3))],
    props: ({ cx }) => [pole(cx + 120, 640, cx + 214, 100, '#5f8a3a', 9), `<g transform="rotate(10 ${cx + 206} ${160})">${ell(cx + 206, 160, 18, 56, '#7a4a2a', INK, 5)}${hl(`M${cx + 198},${130} l0,40`, 5, .4)}</g>`, L(`M${cx + 216},${100} l6,-34`, 5), fist(cx + 120, 573)],
    over: ({ cx }) => [P(`M${cx - 120},${590} Q${cx - 116},${620} ${cx - 120},${634} A6,6 0 0,1 ${cx - 130},${630} Q${cx - 128},${612} ${cx - 120},${590} Z`, SLIME, INK, 3)] },

  // 6 YETI: shaggy white fur cloud on a brute, little horns, icy roar, snowflakes
  { name: 'yeti', label: 'Yeti', form: 'brute', coat: '#f3f1f6', face: ['monster', 'roar'],
    hat: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 56},${hy - 80} Q${cx + s * 100},${hy - 120} ${cx + s * 132},${hy - 100} Q${cx + s * 140},${hy - 80} ${cx + s * 124},${hy - 70} Q${cx + s * 110},${hy - 92} ${cx + s * 76},${hy - 60} Z`, '#cfe3f5', INK, 5)),
      cloud([[cx - 40, hy - 92, 22], [cx - 12, hy - 104, 24], [cx + 18, hy - 102, 22], [cx + 44, hy - 90, 20]], '#f3f1f6', 5)],
    headBack: ({ cx, hy }) => [shag(ring(cx, hy + 10, 128, 124, 22), 30, '#f3f1f6')],
    props: ({ cx, top }) => { const o = [-1, 1].map(s => [[30, -6], [120, 6], [186, 40], [212, 110], [212, 190], [200, 270], [182, 340], [156, 400], [110, 430], [50, 440]].map(([x, y]) => [cx + s * x, top + y]));
      const pts = [...o[1], ...o[0].reverse()];
      return [shag(pts, 34, '#f3f1f6'), ...[[-150, 120], [-60, 200], [40, 150], [130, 230], [-110, 300], [60, 330], [-20, 90], [150, 330], [-170, 220]].map(([x, y]) => L(`M${cx + x},${top + y} l8,26 l8,-22 M${cx + x + 10},${top + y + 40} l6,18`, 3, '#b8b3c6')), hl(`M${cx - 196},${top + 80} Q${cx - 214},${top + 160} ${cx - 184},${top + 260}`, 10, .7)]; },
    over: ({ cx }) => [flake(cx - 214, 170, 16), flake(cx + 222, 230, 14), flake(cx - 196, 420, 12), flake(cx + 200, 470, 18), flake(cx - 230, 640, 12), flake(cx + 226, 690, 13)] },

  // 7 GOBLIN: bat ears, crooked stolen crown, sack of loot bigger than him, coins spilling
  { name: 'goblin', label: 'Goblin', form: 'kid', coat: '#7a6a3e', face: ['monster', 'goblin'],
    hat: ({ cx, hy }) => [`<g transform="rotate(22 ${cx + 40} ${hy - 110})">${poly([[cx + 4, hy - 96], [cx + 4, hy - 140], [cx + 20, hy - 120], [cx + 40, hy - 152], [cx + 60, hy - 120], [cx + 76, hy - 140], [cx + 76, hy - 96]], GOLD, 5)}${circ(cx + 40, hy - 112, 7, '#d8473c', 3)}${hl(`M${cx + 12},${hy - 104} L${cx + 12},${hy - 124}`, 4, .6)}</g>`],
    behind: ({ cx }) => [fillPts([[cx - 92, 572], [cx - 70, 640], [cx - 76, 720], [cx - 120, 790], [cx - 200, 800], [cx - 246, 730], [cx - 244, 630], [cx - 220, 576]], '#c9a66b', 6),
      ell(cx - 156, 574, 68, 18, '#5a3e2a', INK, 5), ...[[-196, 556], [-170, 548], [-140, 552], [-118, 562], [-180, 534], [-150, 532]].map(([x, y]) => coin(cx + x, y, 14)),
      P(`M${cx - 126},${540} L${cx - 132},${500} L${cx - 100},${500} L${cx - 106},${540} Z`, GOLD, INK, 4), ell(cx - 116, 500, 18, 6, GOLDL, INK, 3), poly([[cx - 214, 540], [cx - 200, 520], [cx - 186, 540], [cx - 200, 556]], '#e05aa0', 3.5),
      rect(cx - 220, 680, 50, 40, '#a8854f', 3.5, 4), L(`M${cx - 214},${688} l38,0 M${cx - 214},${712} l38,0`, 2.4, '#7a5a34'), hl(`M${cx - 232},${650} Q${cx - 232},${720} ${cx - 200},${770}`, 8, .35)],
    details: ({ cx, top }) => [L(`M${cx - 90},${top + 120} L${cx + 90},${top + 104}`, 10, '#c9a66b'), L(`M${cx - 90},${top + 120} L${cx + 90},${top + 104}`, 3, '#8a6a3c'),
      P(`M${cx - 100},${top + 170} L${cx - 70},${top + 200} L${cx - 40},${top + 172} L${cx - 10},${top + 204} L${cx + 20},${top + 172} L${cx + 50},${top + 204} L${cx + 80},${top + 172} L${cx + 100},${top + 200} L${cx + 100},${top + 240} L${cx - 100},${top + 240} Z`, '#5a4a2a', INK, 4), rect(cx + 20, top + 40, 34, 30, '#a8854f', 3, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 96, 578, 24), B.arm(1, B.cx + 118, 724, -20)] }),
    props: ({ cx }) => [coin(cx + 132, 700, 22), fist(cx + 118, 724, 13)],
    over: ({ cx }) => [fist(cx - 96, 578, 13), coin(cx - 170, 980, 12), coin(cx - 120, 996, 10), coin(cx - 212, 900, 10)] },

  // 8 PATCHWORK CREATURE: quilt body, lopsided head, one huge sewn-on ear, mismatched arms, giant needle
  { name: 'patchwork', label: 'Patchwork Creature', form: 'dad', coat: '#6a5c7a', face: ['monster', 'patchwork'], head: LUMPY,
    headBack: ({ cx, hy }) => [circ(cx - 112, hy + 4, 34, '#bccaa2', 6), L(`M${cx - 122},${hy - 14} q-14,18 0,36`, 4, '#8e9d7a'), circ(cx + 104, hy + 14, 14, '#e2a8a0', 5)],
    hat: ({ cx, hy }) => [L(`M${cx - 30},${hy - 92} q-14,-30 4,-52 M${cx - 6},${hy - 96} q4,-34 26,-40 M${cx + 18},${hy - 94} q20,-20 40,-14`, 6), `<g transform="rotate(-24 ${cx - 54} ${hy - 76})">${rect(cx - 84, hy - 88, 60, 22, '#f0d6b0', 4, 6)}${L(`M${cx - 62},${hy - 84} l0,14 M${cx - 46},${hy - 84} l0,14`, 2.4, '#c9a78a')}</g>`],
    details: ({ cx, top }) => { const cols = ['#8a6a4c', '#5c7a9a', '#9a5c5c', '#7a8a5a', '#6a5c7a', '#b08a4a'], o = [];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) { const x = cx - 180 + c * 64 + (r % 2) * 22, y = top - 10 + r * 60, col = cols[(r * 2 + c) % 6];
        o.push(`<rect x="${x}" y="${y}" width="64" height="60" fill="${col}" stroke="${INK}" stroke-width="3"/><rect x="${x + 7}" y="${y + 7}" width="50" height="46" fill="none" stroke="#f3efe6" stroke-width="2.4" stroke-dasharray="6 6" opacity=".7"/>`); }
      o.push(L(`M${cx - 4},${top + 30} L${cx - 10},${top + 330}`, 4), ...[0, 1, 2, 3, 4, 5, 6].map(k => L(`M${cx - 18},${top + 50 + k * 42} l18,6`, 3)));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 120, 20), B.arm(1, B.cx + 156, 800, 34)] }),
    props: ({ cx, top }) => [rib(`M${cx - 206},${top - 214} Q${cx - 248},${top - 40} ${cx - 222},${top + 80} Q${cx - 196},${top + 200} ${cx - 104},${top + 190}`, 4, '#d8473c'),
      P(`M${cx - 104},${top + 330} L${cx - 186},${top - 214} Q${cx - 206},${top - 248} ${cx - 222},${top - 214} Z`, STEEL, INK, 5), `<ellipse cx="${cx - 200}" cy="${top - 212}" rx="5" ry="14" transform="rotate(-14 ${cx - 200} ${top - 212})" fill="#e9e4da" stroke="${INK}" stroke-width="3"/>`,
      hl(`M${cx - 194},${top - 170} L${cx - 130},${top + 220}`, 4, .7), fist(cx - 150, top + 120, 16)] },

  // 9 IMP: tiny red devil, bat wings, arrow tail, pitchfork twice his height
  { name: 'imp', label: 'Imp', form: 'toddler', coat: '#c8352e', face: ['monster', 'demon'],
    behind: ({ cx }) => [...[-1, 1].map(s => P(`M${cx + s * 40},${830} L${cx + s * 150},${730} L${cx + s * 146},${780} L${cx + s * 180},${786} L${cx + s * 140},${822} L${cx + s * 156},${860} L${cx + s * 60},${872} Z`, '#7e1f1c', INK, 5)),
      rib(`M${cx - 30},${910} Q${cx - 190},${960} ${cx - 196},${810}`, 10, '#c8352e'), P(`M${cx - 196},${770} L${cx - 170},${816} L${cx - 196},${806} L${cx - 220},${818} Z`, '#c8352e', INK, 4.5)],
    details: ({ cx, top }) => [ell(cx, top + 92, 52, 44, '#e8735f'), P(`M${cx},${top + 112} q-16,-18 -6,-36 q2,14 6,4 q4,-20 12,-24 q8,22 -2,32 q-2,14 -10,24 Z`, GOLD, INK, 3), ...[-1, 1].map(s => circ(cx + s * 30, top + 30, 5, '#7e1f1c', 2.4))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 124, 852, 10)] }),
    props: ({ cx }) => [pole(cx + 124, 1004, cx + 168, 400, '#4a3040', 9), P(`M${cx + 126},${398} L${cx + 210},${404} L${cx + 210},${418} L${cx + 126},${412} Z`, '#4a3040', INK, 4),
      ...[-40, 0, 40].map(t => P(`M${cx + 168 + t - 6},${406} L${cx + 168 + t - 4},${350} L${cx + 168 + t},${336} L${cx + 168 + t + 5},${350} L${cx + 168 + t + 6},${406} Z`, '#4a3040', INK, 4)), hl(`M${cx + 164},${440} L${cx + 130},${880}`, 3, .4), fist(cx + 124, 852, 12)] },

  // 10 SEA-MONSTER FISHERMAN: yellow sou'wester and slicker, tentacle beard, bent rod with a catch, bucket
  { name: 'fisherman', label: 'Sea-Monster Fisherman', form: 'elder', coat: '#f0c12e', face: ['monster', 'blob'], cane: false,
    hat: ({ cx, hy }) => { const Y = '#f2c230'; return [P(`M${cx - 66},${hy - 92} Q${cx - 58},${hy - 158} ${cx},${hy - 162} Q${cx + 58},${hy - 158} ${cx + 66},${hy - 92} Z`, Y, INK, 6), L(`M${cx - 30},${hy - 150} Q${cx},${hy - 130} ${cx + 30},${hy - 150} M${cx},${hy - 160} L${cx},${hy - 100}`, 3, '#b88a1a'),
      P(`M${cx - 156},${hy - 50} Q${cx - 120},${hy - 112} ${cx},${hy - 112} Q${cx + 120},${hy - 112} ${cx + 156},${hy - 50} Q${cx + 110},${hy - 86} ${cx},${hy - 90} Q${cx - 110},${hy - 86} ${cx - 156},${hy - 50} Z`, Y, INK, 6), hl(`M${cx - 110},${hy - 92} Q${cx - 60},${hy - 108} ${cx - 10},${hy - 106}`, 6, .5)]; },
    faceTop: ({ cx, hy }) => { const ts = [[-62, 72, 104, -1], [-34, 86, 126, 1], [0, 92, 140, -1], [34, 86, 122, 1], [62, 72, 100, -1]].map(([x, y, len, d]) => `M${cx + x},${hy + y} C${cx + x + d * 18},${hy + y + len * .4} ${cx + x - d * 20},${hy + y + len * .7} ${cx + x + d * 4},${hy + y + len} q${d * 4},14 ${d * 18},8 q${d * 8},-6 ${d * 2},-14`);
      return [ts.map(d => L(d, 20)).join(''), ts.map(d => L(d, 13, TEAL)).join(''), ...[[-58, 120], [-30, 150], [4, 170], [36, 140], [66, 112], [-60, 150], [6, 130]].map(([x, y]) => ell(cx + x, hy + y, 3.6, 3.6, TEALL))]; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 6} L${cx},${top + 50} L${cx + 60},${top - 6} L${cx + 40},${top + 60} L${cx},${top + 70} L${cx - 40},${top + 60} Z`, '#e0ac1e', INK, 4), L(`M${cx},${top + 70} L${cx},${top + 290}`, 4),
      ...[0, 1, 2, 3].map(k => L(`M${cx + 8},${top + 100 + k * 46} l20,0`, 6, '#3a3846')), ...[-1, 1].map(s => rect(cx + s * 60 - 26, top + 180, 52, 40, '#e0ac1e', 3.5, 5)), L(`M${cx - 120},${top + 250} L${cx + 120},${top + 250}`, 10, '#fff7d0')],
    arms: B => ({ front: [B.arm(-1, B.cx - 132, 610, 10), B.arm(1, B.cx + 140, 566, -16)] }),
    props: ({ cx }) => { const rod = `M${cx + 116},${640} Q${cx + 160},${300} ${cx + 222},${70}`;
      return [L(rod, 13), L(rod, 6, WOOD), circ(cx + 128, 590, 13, STEEL, 3.5), L(`M${cx + 222},${70} L${cx + 214},${312}`, 2.4),
        `<g transform="translate(${cx + 214},352) scale(1.7) translate(${-cx - 232},-352) rotate(84 ${cx + 232} ${352})">${P(`M${cx + 204},${352} Q${cx + 228},${330} ${cx + 252},${352} Q${cx + 228},${374} ${cx + 204},${352} Z`, '#7fb0d8', INK, 4)}${P(`M${cx + 252},${352} L${cx + 268},${338} L${cx + 268},${366} Z`, '#7fb0d8', INK, 4)}${ell(cx + 216, 348, 3, 3, INK)}</g>`,
        L(`M${cx + 178},${336} q-8,6 0,12 M${cx + 180},${376} q-8,6 0,12`, 3), fist(cx + 140, 566, 14),
        L(`M${cx - 150},${634} Q${cx - 132},${600} ${cx - 114},${634}`, 5), poly([[cx - 160], [cx - 104, 634], [cx - 112, 704], [cx - 152, 704]].map((p, i) => i ? p : [cx - 160, 634]), '#7a9ab8', 4.5), L(`M${cx - 158},${648} L${cx - 106},${648}`, 3, '#4f6f8f'),
        P(`M${cx - 146},${630} q-10,-26 6,-36 q-2,14 8,18 q8,-10 18,-6 q-12,10 -12,24 Z`, '#7fb0d8', INK, 3.5), fist(cx - 132, 610, 13)]; } },
];
