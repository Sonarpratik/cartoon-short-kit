// SHEET 10 — WORLD CULTURES (costume + props only; everyone keeps the same white skin and locked faces)
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, SILVER, BRONZE, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4 } from '../castkit.mjs';
export const TITLE = 'Cast sheet 10: World cultures';

// ---------- local helpers ----------
const clipG = (id, d, inner) => `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
// tartan: base + broad dark bands + thin light lines, both directions
const tartan = (x0, y0, w, h, base, band, line, step = 44) => {
  let o = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${base}"/>`;
  for (let k = -1; k * step < Math.max(w, h) + step; k++) {
    o += `<rect x="${x0 + k * step}" y="${y0}" width="${step * .42}" height="${h}" fill="${band}" opacity=".55"/><rect x="${x0}" y="${y0 + k * step}" width="${w}" height="${step * .42}" fill="${band}" opacity=".55"/>`;
    o += `<rect x="${x0 + k * step + step * .7}" y="${y0}" width="3" height="${h}" fill="${line}" opacity=".8"/><rect x="${x0}" y="${y0 + k * step + step * .7}" width="${w}" height="3" fill="${line}" opacity=".8"/>`;
  }
  return o;
};
// checks for a keffiyeh: red grid with small dots
const checks = (x0, y0, w, h, col, step = 17) => { let o = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#f7f4ee"/>`;
  for (let k = 0; k * step < w; k++) o += `<rect x="${x0 + k * step}" y="${y0}" width="4" height="${h}" fill="${col}"/>`;
  for (let k = 0; k * step < h; k++) o += `<rect x="${x0}" y="${y0 + k * step}" width="${w}" height="4" fill="${col}"/>`;
  for (let i = 0; i * step < w; i++) for (let j = 0; j * step < h; j++) if ((i + j) % 2) o += `<rect x="${x0 + i * step + 7}" y="${y0 + j * step + 7}" width="6" height="6" fill="${col}"/>`;
  return o; };
const flower5 = (x, y, r, col, mid = '#ffd23f', sw = 3) => { let o = ''; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; o += circ(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, col, sw); }
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; o += `<circle cx="${f1(x + Math.cos(a) * r * .55)}" cy="${f1(y + Math.sin(a) * r * .55)}" r="${f1(r * .5 - sw / 2)}" fill="${col}"/>`; }
  return o + circ(x, y, r * .26, mid, sw * .8); };
const hibiscus = (x, y, r, col = '#f0457a') => { let o = ''; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; o += `<g transform="rotate(${f1(a * 180 / Math.PI + 90)} ${x} ${y})">${P(`M${x},${y} C${x - r * .9},${y - r * .5} ${x - r * .7},${y - r * 1.1} ${x},${y - r} C${x + r * .7},${y - r * 1.1} ${x + r * .9},${y - r * .5} ${x},${y} Z`, col, INK, 3.4)}</g>`; }
  return o + L(`M${x},${y} l${r * .5},${-r * .55}`, 3, '#ffd23f') + circ(x + r * .52, y - r * .58, r * .1, '#ffd23f', 2.4); };
const tulip = (x, y, col, s = 1) => P(`M${x - 16 * s},${y - 22 * s} L${x - 8 * s},${y - 8 * s} L${x},${y - 26 * s} L${x + 8 * s},${y - 8 * s} L${x + 16 * s},${y - 22 * s} Q${x + 20 * s},${y + 10 * s} ${x},${y + 14 * s} Q${x - 20 * s},${y + 10 * s} ${x - 16 * s},${y - 22 * s} Z`, col, INK, 3.6);
// pretzel: centred at (x,y), size k
const pretzel = (x, y, k) => { const q = ([a, b]) => `${f1(x + a * k)},${f1(y + b * k)}`;
  const d = `M${q([.4, .42])} C${q([.1, .1])} ${q([-.2, -.3])} ${q([-.4, -.55])} C${q([-.6, -.8])} ${q([-1, -.5])} ${q([-.95, -.1])} C${q([-.9, .62])} ${q([.9, .62])} ${q([.95, -.1])} C${q([1, -.5])} ${q([.6, -.8])} ${q([.4, -.55])} C${q([.2, -.3])} ${q([-.1, .1])} ${q([-.4, .42])}`;
  const salt = [[-.7, -.6], [.7, -.62], [-.94, -.2], [.94, -.24], [0, .47], [-.45, .38], [.48, .38], [-.7, .2], [.72, .2]].map(([a, b]) => `<rect x="${f1(x + a * k - 3)}" y="${f1(y + b * k - 3)}" width="7" height="6" rx="1.5" fill="#fff" stroke="${INK}" stroke-width="1.6" transform="rotate(${f1(a * 60)} ${f1(x + a * k)} ${f1(y + b * k)})"/>`).join('');
  return L(d, 34, INK) + L(d, 23, '#b8682c') + L(d, 7, '#e4a35e').replace('stroke-width="7"', 'stroke-width="7" stroke-opacity=".7"') + salt; };
// matryoshka: bottom-centre (x, yb), height h
const doll = (x, yb, h, col = RED) => { const w = h * .62, hr = h * .27, hcY = yb - h + hr + 2, o = [];
  o.push(P(`M${f1(x - w / 2)},${f1(yb)} Q${f1(x - w * .62)},${f1(yb - h * .5)} ${f1(x - hr * 1.05)},${f1(hcY + hr * .4)} L${f1(x + hr * 1.05)},${f1(hcY + hr * .4)} Q${f1(x + w * .62)},${f1(yb - h * .5)} ${f1(x + w / 2)},${f1(yb)} Z`, col, INK, 4));
  o.push(circ(x, hcY, hr, col, 4), ell(x, hcY + 2, hr * .66, hr * .62, '#fbf7f2', INK, 3));
  o.push(ell(x - hr * .25, hcY, 1.8 + h * .01, 2 + h * .012, INK), ell(x + hr * .25, hcY, 1.8 + h * .01, 2 + h * .012, INK), ell(x - hr * .38, hcY + hr * .28, hr * .14, hr * .09, '#f39aac'), ell(x + hr * .38, hcY + hr * .28, hr * .14, hr * .09, '#f39aac'), ell(x, hcY + hr * .36, hr * .1, hr * .06, '#d9576b'));
  o.push(ell(x, yb - h * .3, w * .34, h * .22, '#fbf1d8', INK, 3), flower5(x, yb - h * .3, h * .16, '#e2b13c', RED, 2.4));
  o.push(L(`M${f1(x - w * .42)},${f1(yb - h * .56)} q${f1(w * .42)},${f1(h * .06)} ${f1(w * .84)},0`, 3, GOLD), hl(`M${f1(x - w * .36)},${f1(yb - h * .1)} Q${f1(x - w * .44)},${f1(yb - h * .4)} ${f1(x - hr * .8)},${f1(hcY + hr * .7)}`, 4, .4));
  return o.join(''); };

export const CAST = [
  // 1 SCOTTISH PIPER — tam + toorie, tartan kilt, bagpipe drones fanning over the shoulder
  { name: 'piper', label: 'Highland Piper', form: 'standard', coat: '#24453a', face: 'strain',
    hat: ({ cx, hy }) => { const o = [];
      o.push(`<g transform="rotate(-9 ${cx} ${hy - 90})">${P(`M${cx - 118},${hy - 66} Q${cx - 150},${hy - 112} ${cx - 70},${hy - 136} Q${cx + 10},${hy - 152} ${cx + 100},${hy - 134} Q${cx + 160},${hy - 114} ${cx + 118},${hy - 70} Q${cx},${hy - 84} ${cx - 118},${hy - 66} Z`, '#263a6e', INK, 7)}
        ${hl(`M${cx - 104},${hy - 106} Q${cx - 60},${hy - 134} ${cx},${hy - 136}`, 8, .35)}
        ${P(`M${cx - 112},${hy - 76} Q${cx},${hy - 92} ${cx + 112},${hy - 78} L${cx + 110},${hy - 56} Q${cx},${hy - 70} ${cx - 110},${hy - 54} Z`, '#f3efe6', INK, 5)}
        ${[...Array(11)].map((_, k) => `<rect x="${cx - 104 + k * 19}" y="${hy - 80 + (k % 2) * 10 - Math.sin(k / 10 * Math.PI) * 13}" width="10" height="10" fill="${k % 3 === 1 ? '#2f5fae' : RED}"/>`).join('')}
        ${cloud([[cx + 8, hy - 162, 22], [cx + 28, hy - 166, 22], [cx + 18, hy - 182, 22], [cx + 2, hy - 176, 18], [cx + 34, hy - 180, 18]], RED, 5)}
        ${L(`M${cx + 4},${hy - 170} q8,-6 16,0 M${cx + 18},${hy - 158} q8,-6 16,0`, 3, '#8f2219')}
        ${P(`M${cx - 98},${hy - 96} q-14,-50 6,-96 q10,40 12,92 Z`, '#1d1a26', INK, 4)}${circ(cx - 92, hy - 92, 12, SILVER, 4)}</g>`);
      return o; },
    details: ({ cx, top }) => [rect(cx - 160, top + 184, 320, 200, '#b8322a', 0, 0), tartan(cx - 160, top + 184, 320, 200, '#b8322a', '#1f4a36', '#f2d24a', 40),
      ...[0, 1, 2, 3].map(k => circ(cx + 14, top + 60 + k * 36, 7, SILVER, 3)), L(`M${cx},${top + 40} L${cx},${top + 184}`, 4),
      P(`M${cx - 30},${top - 4} L${cx},${top + 40} L${cx + 30},${top - 4} Z`, '#f3efe6', INK, 4), rect(cx - 160, top + 174, 320, 22, '#1d1a26', 4, 2), rect(cx - 18, top + 170, 36, 30, SILVER, 4, 5)],
    arms: B => ({ front: [B.arm(-1, B.cx - 14, B.top + 192, 70), B.arm(1, B.cx + 26, B.top + 262, 34)] }),
    props: ({ cx, top }) => { const o = [];
      // kilt below the jacket (covers the top of the legs)
      const kd = `M${cx - 104},${top + 186} L${cx + 104},${top + 186} L${cx + 126},${top + 372} L${cx - 126},${top + 372} Z`;
      o.push(P(kd, '#b8322a', 'none', 0), clipG('kiltT', kd, tartan(cx - 130, top + 186, 260, 190, '#b8322a', '#1f4a36', '#f2d24a', 40) + [...Array(9)].map((_, k) => L(`M${cx - 80 + k * 20},${top + 220} L${cx - 100 + k * 25},${top + 372}`, 2.4, '#5a1612')).join('')), P(kd, 'none', INK, 5));
      o.push(P(`M${cx - 68},${top + 226} Q${cx - 30},${top + 216} ${cx + 6},${top + 226} Q${cx + 8},${top + 300} ${cx - 30},${top + 306} Q${cx - 68},${top + 300} ${cx - 68},${top + 226} Z`, '#f4f1ea', INK, 4.5), ...[-50, -30, -10].map(t => L(`M${cx + t},${top + 262} l0,40`, 6)), rect(cx - 66, top + 222, 70, 14, '#1d1a26', 3, 4));
      // drones (behind the head, over the left shoulder) with tartan cords
      const base = [cx - 112, top + 108], tips = [[cx - 128, -130], [cx - 186, -70], [cx - 234, 10]];
      tips.forEach(([x, y], i) => { o.push(pole(base[0] + i * 6, base[1], x, y, '#2a2230', i ? 13 : 16)); for (const t of [.35, .62, .88]) o.push(ell(base[0] + i * 6 + (x - base[0] - i * 6) * t, base[1] + (y - base[1]) * t, 13 + (i ? 0 : 2), 7, '#f1ead6', INK, 3.4)); o.push(P(`M${x - 16},${y + 6} L${x + 16},${y + 6} L${x + 12},${y - 22} Q${x},${y - 28} ${x - 12},${y - 22} Z`, '#f1ead6', INK, 4)); });
      o.push(L(`M${tips[0][0] + 12},${tips[0][1] + 100} Q${cx - 180},${80} ${tips[2][0] + 10},${tips[2][1] + 60}`, 6, '#1f4a36'), ...[[tips[0][0] + 8, tips[0][1] + 108], [tips[2][0] + 4, tips[2][1] + 70]].map(([x, y]) => P(`M${x},${y} l-10,30 l20,0 Z`, RED, INK, 3)));
      // the bag, tucked under the left arm
      const bd = `M${cx - 168},${top + 120} Q${cx - 176},${top + 52} ${cx - 104},${top + 60} Q${cx - 26},${top + 70} ${cx - 28},${top + 140} Q${cx - 36},${top + 206} ${cx - 104},${top + 200} Q${cx - 168},${top + 190} ${cx - 168},${top + 120} Z`;
      o.push(P(bd, '#b8322a', 'none', 0), clipG('bagT', bd, tartan(cx - 180, top + 50, 160, 160, '#b8322a', '#1f4a36', '#f2d24a', 36)), P(bd, 'none', INK, 6), hl(`M${cx - 150},${top + 100} Q${cx - 140},${top + 74} ${cx - 110},${top + 72}`, 7, .5));
      // chanter down the front
      o.push(pole(cx - 40, top + 160, cx + 44, top + 330, '#2a2230', 13), ...[.3, .45, .6, .75].map(t => ell(cx - 40 + 84 * t, top + 160 + 170 * t, 3, 3, '#f1ead6')), P(`M${cx + 30},${top + 318} L${cx + 58},${top + 322} L${cx + 56},${top + 346} L${cx + 26},${top + 342} Z`, '#f1ead6', INK, 3.4));
      o.push(fist(cx - 14, top + 192), fist(cx + 26, top + 262));
      return o; },
    over: ({ cx, top, hy }) => [pole(cx - 70, top + 70, cx - 22, 258, '#2a2230', 9), ell(cx - 24, 256, 9, 7, '#f1ead6', INK, 3)] },

  // 2 MARIACHI — giant embroidered sombrero, charro jacket with silver buttons, big guitar
  { name: 'mariachi', label: 'Mariachi', form: 'chad', coat: '#1d1b24', face: 'cool',
    hat: ({ cx, hy }) => { const o = [], RD = '#9c2a35', y = hy - 84;
      o.push(P(`M${cx - 202},${y + 4} Q${cx - 214},${y - 26} ${cx - 172},${y - 26} Q${cx - 100},${y - 46} ${cx},${y - 46} Q${cx + 100},${y - 46} ${cx + 172},${y - 26} Q${cx + 214},${y - 26} ${cx + 202},${y + 4} Q${cx + 160},${y + 40} ${cx},${y + 42} Q${cx - 160},${y + 40} ${cx - 202},${y + 4} Z`, RD, INK, 7));
      o.push(`<ellipse cx="${cx}" cy="${y + 2}" rx="168" ry="28" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="14 8"/>`, `<ellipse cx="${cx}" cy="${y + 2}" rx="186" ry="34" fill="none" stroke="${GOLDL}" stroke-width="3"/>`);
      o.push(P(`M${cx - 74},${y - 4} Q${cx - 70},${y - 120} ${cx - 44},${y - 150} Q${cx},${y - 176} ${cx + 44},${y - 150} Q${cx + 70},${y - 120} ${cx + 74},${y - 4} Q${cx},${y + 10} ${cx - 74},${y - 4} Z`, RD, INK, 7));
      o.push(L(`M${cx - 30},${y - 156} Q${cx},${y - 140} ${cx + 30},${y - 156}`, 4, '#6e1a24'), hl(`M${cx - 54},${y - 30} Q${cx - 56},${y - 110} ${cx - 34},${y - 140}`, 9, .35));
      o.push(P(`M${cx - 72},${y - 40} Q${cx},${y - 26} ${cx + 72},${y - 40} L${cx + 73},${y - 14} Q${cx},${y} ${cx - 73},${y - 14} Z`, GOLD, INK, 5));
      for (let k = 0; k < 8; k++) o.push(L(`M${cx - 64 + k * 18},${y - 34 + Math.abs(k - 3.5) * .8} l10,18`, 3, '#a8781e'));
      for (const s of [-1, 1]) o.push(L(`M${cx + s * 30},${y - 60} q${s * 16},-30 ${s * 2},-60 q${s * -14},-6 ${s * -10},10`, 4, GOLD), L(`M${cx + s * 120},${y + 14} q${s * 20},-18 ${s * 42},-6`, 4, GOLD));
      o.push(hl(`M${cx - 180},${y - 10} Q${cx - 120},${y - 34} ${cx - 60},${y - 36}`, 7, .4));
      return o; },
    faceTop: ({ cx, hy: hy0 }) => { const hy = hy0 + 9; return [P(`M${cx},${hy + 16} Q${cx - 26},${hy + 6} ${cx - 54},${hy + 18} Q${cx - 76},${hy + 26} ${cx - 82},${hy + 6} Q${cx - 84},${hy - 4} ${cx - 74},${hy - 4} Q${cx - 74},${hy + 12} ${cx - 56},${hy + 8} Q${cx - 26},${hy - 8} ${cx},${hy + 4} Q${cx + 26},${hy - 8} ${cx + 56},${hy + 8} Q${cx + 74},${hy + 12} ${cx + 74},${hy - 4} Q${cx + 84},${hy - 4} ${cx + 82},${hy + 6} Q${cx + 76},${hy + 26} ${cx + 54},${hy + 18} Q${cx + 26},${hy + 6} ${cx},${hy + 16} Z`, '#1d1a26', INK, 3.4), hl(`M${cx - 50},${hy + 10} Q${cx - 30},${hy + 2} ${cx - 10},${hy + 6}`, 3, .35)]; },
    details: ({ cx, top }) => [P(`M${cx - 44},${top} L${cx},${top + 150} L${cx + 44},${top} Z`, '#f6f3ec', INK, 4),
      ...[-1, 1].flatMap(s => [L(`M${cx + s * 46},${top + 2} L${cx + s * 4},${top + 160} L${cx + s * 10},${top + 350}`, 6, GOLD), L(`M${cx + s * 150},${top + 70} q${-s * 40},30 ${-s * 20},70 q${s * 30},20 ${-s * 10},60 q${-s * 30},10 ${-s * 10},50`, 5, GOLD), ...[0, 1, 2, 3, 4].map(k => circ(cx + s * (40 - k * 4), top + 186 + k * 30, 7, SILVER, 3)), ...[0, 1, 2].map(k => ell(cx + s * (150 + k * 6), top + 260 + k * 8, 6, 9, SILVER, INK, 2.6))]),
      rect(cx - 140, top + 300, 280, 50, RED, 4, 2)],
    arms: B => ({ front: [B.arm(-1, B.cx - 176, B.top + 108, 30), B.arm(1, B.cx + 66, B.top + 250, 40)] }),
    props: ({ cx, top }) => { const o = [], bx = cx + 54, by = top + 210;
      o.push(`<g transform="rotate(24 ${bx} ${by})">`, pole(bx - 40, by, bx - 290, by, '#5a3a24', 20), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${bx - 90 - k * 30},${by - 10} l0,20`, 2.4, '#d9c7a8')),
        P(`M${bx - 290},${by - 18} L${bx - 336},${by - 26} L${bx - 340},${by + 24} L${bx - 290},${by + 18} Z`, '#5a3a24', INK, 4), ...[0, 1, 2].map(k => circ(bx - 302 - k * 12, by - 28, 4, SILVER, 2) + circ(bx - 302 - k * 12, by + 28, 4, SILVER, 2)),
        cloud([[bx + 14, by, 86], [bx - 82, by, 64]], '#e7b26a', 6), P(`M${bx - 120},${by - 30} Q${bx - 60},${by - 46} ${bx},${by - 70}`, 'none', '#c98a3c', 4), circ(bx - 56, by, 26, '#2a1a1f', 4), `<circle cx="${bx - 56}" cy="${by}" r="34" fill="none" stroke="${GOLD}" stroke-width="5"/>`,
        rect(bx + 34, by - 30, 16, 60, '#5a3a24', 3, 4), ...[-1, 0, 1].map(k => L(`M${bx - 280},${by + k * 7} L${bx + 42},${by + k * 7}`, 1.6, '#f3efe6')), hl(`M${bx - 30},${by - 70} Q${bx + 40},${by - 84} ${bx + 80},${by - 36}`, 7, .45), '</g>');
      o.push(fist(cx - 176, top + 108, 18), fist(cx + 66, top + 250, 18));
      return o; } },

  // 3 BAVARIAN — big boi in lederhosen with braces, alpine hat with a giant gamsbart tuft, giant pretzel
  { name: 'bavarian', label: 'Bavarian', form: 'bigboi', coat: '#f6f4ee', face: 'heartEyes',
    hat: ({ cx, hy }) => { const o = [], G = '#3f6b3a', y = hy - 82;
      // gamsbart tuft (behind the crown) and a pheasant feather
      for (let k = 0; k < 13; k++) { const a = -Math.PI / 2 + (k - 6) * .12, x0 = cx + 58, y0 = y - 50, r = 120 + (k % 3) * 14; o.push(L(`M${x0},${y0} Q${f1(x0 + Math.cos(a) * r * .5 + 6)},${f1(y0 + Math.sin(a) * r * .5)} ${f1(x0 + Math.cos(a) * r)},${f1(y0 + Math.sin(a) * r)}`, 15, INK)); }
      for (let k = 0; k < 13; k++) { const a = -Math.PI / 2 + (k - 6) * .12, x0 = cx + 58, y0 = y - 50, r = 120 + (k % 3) * 14; o.push(L(`M${x0},${y0} Q${f1(x0 + Math.cos(a) * r * .5 + 6)},${f1(y0 + Math.sin(a) * r * .5)} ${f1(x0 + Math.cos(a) * r)},${f1(y0 + Math.sin(a) * r)}`, 8, k % 2 ? '#5a4636' : '#3d2e24'), L(`M${f1(x0 + Math.cos(a) * r * .8)},${f1(y0 + Math.sin(a) * r * .8)} L${f1(x0 + Math.cos(a) * r)},${f1(y0 + Math.sin(a) * r)}`, 7, '#e8dfd0')); }
      o.push(P(`M${cx - 60},${y - 30} Q${cx - 110},${y - 110} ${cx - 140},${y - 150} Q${cx - 96},${y - 96} ${cx - 48},${y - 40} Z`, '#c98a3c', INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 66 - k * 22},${y - 48 - k * 26} l-10,10`, 4, '#5a3a24')));
      o.push(fillPts([[cx - 66, y + 2], [cx - 60, y - 70], [cx - 30, y - 92], [cx, y - 78], [cx + 30, y - 92], [cx + 60, y - 70], [cx + 66, y + 2]], G, 6), hl(`M${cx - 50},${y - 10} Q${cx - 52},${y - 56} ${cx - 34},${y - 78}`, 7, .35));
      o.push(P(`M${cx - 122},${y + 6} Q${cx - 132},${y - 16} ${cx - 104},${y - 14} Q${cx},${y - 2} ${cx + 104},${y - 14} Q${cx + 132},${y - 16} ${cx + 122},${y + 6} Q${cx},${y + 28} ${cx - 122},${y + 6} Z`, G, INK, 6));
      o.push(P(`M${cx - 64},${y - 22} Q${cx},${y - 10} ${cx + 64},${y - 22} L${cx + 65},${y - 6} Q${cx},${y + 6} ${cx - 65},${y - 6} Z`, '#f3efe6', INK, 4), ...[...Array(8)].map((_, k) => L(`M${cx - 58 + k * 16},${y - 18} l8,10`, 3, RED)), circ(cx + 58, y - 50, 11, SILVER, 4));
      return o; },
    details: ({ cx, top }) => { const o = [`<rect x="${cx - 240}" y="${top}" width="480" height="300" fill="#f6f4ee"/>`];
      for (let k = 0; k < 15; k++) o.push(`<rect x="${cx - 240 + k * 34}" y="${top}" width="15" height="300" fill="#4c7fc0" opacity=".38"/><rect x="${cx - 240}" y="${top + k * 34}" width="480" height="15" fill="#4c7fc0" opacity=".38"/>`);
      o.push(rect(cx - 240, top + 280, 480, 200, '#7a4e2c', 5, 0), P(`M${cx - 80},${top + 290} L${cx + 80},${top + 290} L${cx + 70},${top + 400} L${cx - 70},${top + 400} Z`, '#8a5a34', INK, 4), ...[-1, 1].map(s => circ(cx + s * 60, top + 306, 8, '#d9c7a8', 3)), L(`M${cx - 66},${top + 316} q66,24 132,0`, 3, '#e8dfd0'), ...[-1, 1].map(s => L(`M${cx + s * 150},${top + 300} q${-s * 20},60 0,140`, 3, '#5a3a24')));
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 80},${top - 10} L${cx + s * 110},${top - 10} L${cx + s * 96},${top + 290} L${cx + s * 66},${top + 290} Z`, '#7a4e2c', INK, 4.5), L(`M${cx + s * 86},${top + 10} L${cx + s * 74},${top + 280}`, 2.4, '#e8dfd0').replace('fill="none"', 'fill="none" stroke-dasharray="8 6"'));
      o.push(rect(cx - 104, top + 120, 208, 56, '#7a4e2c', 4.5, 6), flower5(cx, top + 148, 30, '#fbf7f2', GOLD, 2.6), ...[-1, 1].map(s => L(`M${cx + s * 40},${top + 134} q${s * 24},14 ${s * 46},0 M${cx + s * 40},${top + 162} q${s * 24},-14 ${s * 46},0`, 3, '#5f9a4a')));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 188, B.top + 44, 60)] }),
    over: ({ cx, top }) => [pretzel(cx + 166, top - 30, 80), fist(cx + 188, top + 44, 18)] },

  // 4 DUTCH GIRL — winged white lace cap, blonde braids, apron, tulip bouquet, clogs at her feet
  { name: 'dutch', label: 'Dutch Girl', form: 'lady', coat: '#2f5fae', face: ['female', 'giggle'],
    headBack: ({ cx, hy }) => { const o = []; for (const s of [-1, 1]) { for (let k = 0; k < 7; k++) o.push(ell(cx + s * (86 + k * 4), hy + 20 + k * 24, 18 - k * .8, 16, '#f2cf5b', INK, 4.5), L(`M${cx + s * (78 + k * 4)},${hy + 14 + k * 24} q${s * 8},10 ${s * 18},8`, 2.6, '#c99a2a')); o.push(P(`M${cx + s * 112},${hy + 186} l${s * 16},12 l${-s * 22},10 l${-s * 4},-20 Z`, RED, INK, 3.4)); } return o; },
    hat: ({ cx, hy }) => { const o = [], W = '#fbfbf8';
      for (const s of [-1, 1]) { o.push(P(`M${cx + s * 90},${hy + 14} Q${cx + s * 140},${hy - 24} ${cx + s * 160},${hy - 70} Q${cx + s * 166},${hy - 112} ${cx + s * 140},${hy - 122} Q${cx + s * 124},${hy - 112} ${cx + s * 88},${hy - 92} Z`, W, INK, 5.5), L(`M${cx + s * 100},${hy - 10} Q${cx + s * 136},${hy - 40} ${cx + s * 150},${hy - 92}`, 2.6, '#c9ccd6'), L(`M${cx + s * 100},${hy - 50} Q${cx + s * 120},${hy - 80} ${cx + s * 134},${hy - 108}`, 2.6, '#c9ccd6'));
        for (let k = 0; k < 5; k++) o.push(`<circle cx="${f1(cx + s * (108 + k * 12))}" cy="${f1(hy - 4 - k * 15)}" r="5" fill="none" stroke="#c9ccd6" stroke-width="2.4"/>`); }
      o.push(P(`M${cx - 70},${hy - 50} Q${cx - 40},${hy - 70} ${cx},${hy - 66} Q${cx + 40},${hy - 70} ${cx + 70},${hy - 50} Q${cx + 40},${hy - 60} ${cx},${hy - 56} Q${cx - 40},${hy - 60} ${cx - 70},${hy - 50} Z`, '#f2cf5b', INK, 3.6));
      o.push(P(`M${cx - 104},${hy - 6} Q${cx - 110},${hy - 90} ${cx - 50},${hy - 122} Q${cx - 14},${hy - 140} ${cx},${hy - 172} Q${cx + 14},${hy - 140} ${cx + 50},${hy - 122} Q${cx + 110},${hy - 90} ${cx + 104},${hy - 6} Q${cx + 86},${hy - 46} ${cx + 60},${hy - 62} Q${cx},${hy - 80} ${cx - 60},${hy - 62} Q${cx - 86},${hy - 46} ${cx - 104},${hy - 6} Z`, W, INK, 6), L(`M${cx},${hy - 166} Q${cx - 6},${hy - 120} ${cx},${hy - 80}`, 2.6, '#c9ccd6'));
      o.push(...[...Array(9)].map((_, k) => { const a = Math.PI * (1.12 + k * .095); return `<circle cx="${f1(cx + Math.cos(a) * 82)}" cy="${f1(hy - 40 + Math.sin(a) * 62)}" r="6" fill="none" stroke="#c9ccd6" stroke-width="2.4"/>`; }), hl(`M${cx - 80},${hy - 84} Q${cx - 40},${hy - 114} ${cx + 10},${hy - 116}`, 7, .9).replace('#fff', '#ffffff'));
      for (const s of [-1, 1]) o.push(circ(cx + s * 94, hy - 4, 8, GOLD, 3));
      return o; },
    details: ({ cx, top }) => [rect(cx - 120, top, 240, 110, '#c23a3a', 0, 0), ...[...Array(10)].map((_, k) => flower5(cx - 90 + (k % 5) * 45, top + 22 + Math.floor(k / 5) * 44, 12, '#f6c84a', '#fff', 2)),
      rect(cx - 120, top + 100, 240, 46, '#1d1a26', 4, 0), ...[0, 1, 2, 3].map(k => L(`M${cx - 60 + k * 40},${top + 160} l0,240`, 4, '#24488a')),
      P(`M${cx - 70},${top + 150} L${cx + 70},${top + 150} L${cx + 92},${top + 420} L${cx - 92},${top + 420} Z`, '#fbfbf8', INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 74},${top + 196 + k * 22} L${cx + 74},${top + 196 + k * 22}`, 3, k === 1 ? RED : '#2f5fae')),
      ...[0, 1, 2, 3, 4, 5].map(k => circ(cx - 32 + k * 13, top + 12 + Math.sin(k / 5 * Math.PI) * 10, 6, '#d8473c', 2.4))],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 128, B.top + 150, 20)] }),
    props: ({ cx, top }) => { const o = [], hx = cx + 128, hyy = top + 150;
      const heads = [[hx - 30, hyy - 116, RED], [hx + 14, hyy - 132, '#f6c84a'], [hx + 56, hyy - 110, '#f05a9a'], [hx - 4, hyy - 86, '#f08a2a'], [hx + 40, hyy - 78, RED]];
      heads.forEach(([x, y]) => o.push(L(`M${hx},${hyy} Q${(hx + x) / 2},${(hyy + y) / 2 + 10} ${x},${y}`, 9, INK), L(`M${hx},${hyy} Q${(hx + x) / 2},${(hyy + y) / 2 + 10} ${x},${y}`, 4, '#4f9a3a')));
      o.push(P(`M${hx - 8},${hyy - 10} q-40,-40 -34,-90 q20,40 40,70 Z`, '#5fae4a', INK, 3.4), P(`M${hx + 8},${hyy - 10} q46,-30 52,-80 q-28,34 -56,58 Z`, '#5fae4a', INK, 3.4));
      heads.forEach(([x, y, c]) => o.push(tulip(x, y, c, 1.15)));
      o.push(P(`M${hx - 14},${hyy - 14} L${hx + 14},${hyy - 14} L${hx + 10},${hyy + 18} L${hx - 10},${hyy + 18} Z`, '#f3efe6', INK, 3.4), fist(hx, hyy, 14));
      // clogs on the ground
      const clog = (x, y, s) => P(`M${x - 34 * s},${y} Q${x - 40 * s},${y - 30} ${x - 14 * s},${y - 32} Q${x + 8 * s},${y - 34} ${x + 30 * s},${y - 22} Q${x + 48 * s},${y - 22} ${x + 46 * s},${y - 34} Q${x + 60 * s},${y - 14} ${x + 40 * s},${y} Z`, '#f2cf5b', INK, 4.5) + ell(x - 10 * s, y - 24, 18, 7, '#7a5a2a', INK, 3) + L(`M${x + 6 * s},${y - 16} q12,-6 22,0`, 3, RED) + hl(`M${x - 30 * s},${y - 10} Q${x - 30 * s},${y - 24} ${x - 16 * s},${y - 26}`, 4, .6);
      o.push(clog(cx - 168, 1004, -1), clog(cx - 116, 1006, -1));
      return o; } },

  // 5 BABUSHKA — rose headscarf knotted under the chin, apron, a family of nesting dolls
  { name: 'babushka', label: 'Babushka', form: 'elder', coat: '#b8322a', face: ['elder', 'sweetSmile'], cane: false,
    headBack: ({ cx, hy }) => [P(`M${cx - 116},${hy - 10} Q${cx - 150},${hy + 100} ${cx - 120},${hy + 180} L${cx},${hy + 140} L${cx + 120},${hy + 180} Q${cx + 150},${hy + 100} ${cx + 116},${hy - 10} Z`, '#2a4a9a', INK, 6), ...[...Array(12)].map((_, k) => L(`M${cx - 116 + k * 21},${hy + 168 - Math.abs(k - 5.5) * 6} l-2,16`, 3, RED))],
    hat: ({ cx, hy }) => { const o = [], BL = '#2a4a9a';
      const sd = `M${cx - 98},${hy + 96} Q${cx - 124},${hy + 40} ${cx - 120},${hy - 20} Q${cx - 118},${hy - 104} ${cx - 50},${hy - 128} Q${cx},${hy - 140} ${cx + 50},${hy - 128} Q${cx + 118},${hy - 104} ${cx + 120},${hy - 20} Q${cx + 124},${hy + 40} ${cx + 98},${hy + 96} Q${cx + 92},${hy + 60} ${cx + 96},${hy + 10} Q${cx + 96},${hy - 56} ${cx + 60},${hy - 78} Q${cx},${hy - 100} ${cx - 60},${hy - 78} Q${cx - 96},${hy - 56} ${cx - 96},${hy + 10} Q${cx - 92},${hy + 60} ${cx - 98},${hy + 96} Z`;
      o.push(P(sd, BL, 'none', 0), clipG('scarfB', sd, [[-90, -70], [-104, 20], [0, -114], [80, -86], [106, 30], [-40, -110], [40, -114]].map(([dx, dy], i) => flower5(cx + dx, hy + dy, i % 2 ? 22 : 28, i % 3 ? '#e04848' : '#f08aa0', GOLD, 2.6)).join('') + `<path d="${sd}" fill="none" stroke="${RED}" stroke-width="18" opacity=".9"/>`), P(sd, 'none', INK, 6));
      o.push(hl(`M${cx - 100},${hy - 40} Q${cx - 90},${hy - 100} ${cx - 40},${hy - 118}`, 7, .35));
      // knot + ends under the chin
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 6},${hy + 112} Q${cx + s * 50},${hy + 120} ${cx + s * 72},${hy + 168} Q${cx + s * 40},${hy + 170} ${cx + s * 4},${hy + 124} Z`, BL, INK, 5), L(`M${cx + s * 36},${hy + 162} l${s * 4},10 M${cx + s * 54},${hy + 164} l${s * 4},10`, 3, RED));
      o.push(P(`M${cx - 98},${hy + 96} Q${cx - 60},${hy + 110} ${cx - 14},${hy + 108} L${cx + 14},${hy + 108} Q${cx + 60},${hy + 110} ${cx + 98},${hy + 96} Q${cx + 60},${hy + 124} ${cx},${hy + 124} Q${cx - 60},${hy + 124} ${cx - 98},${hy + 96} Z`, BL, INK, 4.5), ell(cx, hy + 116, 20, 16, BL, INK, 5));
      return o; },
    details: ({ cx, top }) => [...[...Array(14)].map((_, k) => flower5(cx - 110 + (k % 5) * 55 + (Math.floor(k / 5) % 2) * 27, top + 30 + Math.floor(k / 5) * 60, 11, '#f6c84a', '#fff', 2)),
      P(`M${cx - 66},${top + 70} L${cx + 66},${top + 70} L${cx + 84},${top + 300} L${cx - 84},${top + 300} Z`, '#fbf7f2', INK, 4), rect(cx - 70, top + 90, 140, 22, '#e04848', 3, 0), ...[0, 1, 2, 3, 4].map(k => L(`M${cx - 60 + k * 30},${top + 94} l8,14 l8,-14`, 2.4, '#fbf7f2'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top + 210, 30), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top }) => [doll(cx + 104, 1006, 140, '#e04848'), doll(cx + 176, 1006, 104, '#2f8fd0'), doll(cx + 224, 1006, 70, '#f2a03a'), doll(cx - 150, top + 262, 150, RED), fist(cx - 140, top + 210, 15)] },

  // 6 BEDOUIN TRAVELLER — red-checked keffiyeh with black agal, long white thobe + dark bisht, brass dallah coffee pot
  { name: 'bedouin', label: 'Desert Traveller', form: 'noodle', coat: '#f6f3ec', face: 'proud',
    headBack: ({ cx, hy }) => { const d = `M${cx - 110},${hy - 30} Q${cx - 150},${hy + 100} ${cx - 140},${hy + 210} L${cx + 140},${hy + 210} Q${cx + 150},${hy + 100} ${cx + 110},${hy - 30} Z`; return [P(d, '#f7f4ee', 'none', 0), clipG('kefB', d, checks(cx - 160, hy - 40, 320, 260, '#c8322f', 11)), P(d, 'none', INK, 6), ...[...Array(13)].map((_, k) => L(`M${cx - 132 + k * 22},${hy + 210} l0,16`, 4, '#c8322f'))]; },
    hat: ({ cx, hy }) => { const o = [];
      const d = `M${cx - 120},${hy + 150} Q${cx - 124},${hy + 40} ${cx - 112},${hy - 40} Q${cx - 100},${hy - 114} ${cx},${hy - 124} Q${cx + 100},${hy - 114} ${cx + 112},${hy - 40} Q${cx + 124},${hy + 40} ${cx + 120},${hy + 150} L${cx + 96},${hy + 150} Q${cx + 98},${hy + 60} ${cx + 94},${hy - 10} Q${cx + 80},${hy - 64} ${cx},${hy - 70} Q${cx - 80},${hy - 64} ${cx - 94},${hy - 10} Q${cx - 98},${hy + 60} ${cx - 96},${hy + 150} Z`;
      o.push(P(d, '#f7f4ee', 'none', 0), clipG('kefF', d, checks(cx - 130, hy - 130, 260, 290, '#c8322f', 11)), P(d, 'none', INK, 6));
      for (const k of [0, 1]) o.push(L(`M${cx - 106},${hy - 78 - k * 18} Q${cx},${hy - 106 - k * 18} ${cx + 106},${hy - 78 - k * 18}`, 19, INK), L(`M${cx - 106},${hy - 78 - k * 18} Q${cx},${hy - 106 - k * 18} ${cx + 106},${hy - 78 - k * 18}`, 8, '#2f2b38'));
      o.push(hl(`M${cx - 70},${hy - 106} Q${cx - 20},${hy - 120} ${cx + 30},${hy - 114}`, 4, .4));
      return o; },
    behind: ({ cx, top }) => [P(`M${cx - 52},${top + 30} Q${cx - 120},${top + 300} ${cx - 116},${top + 720} L${cx + 116},${top + 720} Q${cx + 120},${top + 300} ${cx + 52},${top + 30} Z`, '#4a3426', INK, 6), ...[-1, 1].map(s => L(`M${cx + s * 54},${top + 40} Q${cx + s * 118},${top + 300} ${cx + s * 110},${top + 712}`, 6, GOLD)), hl(`M${cx - 100},${top + 300} Q${cx - 104},${top + 500} ${cx - 104},${top + 680}`, 6, .25)],
    details: ({ cx, top }) => [L(`M${cx},${top + 10} L${cx},${top + 120}`, 3), ...[0, 1, 2].map(k => circ(cx, top + 30 + k * 30, 4, '#e8dfd0', 2)), L(`M${cx - 34},${top + 200} q4,120 -2,200 M${cx + 30},${top + 220} q-6,100 2,180`, 2.6, '#d4cdbd')],
    arms: B => ({ front: [B.arm(-1, B.cx - 112, B.top + 250, 26), B.arm(1, B.cx + 104, B.top + 264, -10)] }),
    props: ({ cx, top, grad }) => { const o = [];
      o.push(P(`M${cx - 60},${top + 330} L${cx + 60},${top + 330} L${cx + 74},${top + 720} L${cx - 74},${top + 720} Z`, grad('#f6f3ec', cx - 74, cx + 74), 'none', 0), L(`M${cx - 60},${top + 330} L${cx - 74},${top + 720} L${cx + 74},${top + 720} L${cx + 60},${top + 330}`, 5), L(`M${cx - 24},${top + 420} q-6,140 -10,280 M${cx + 26},${top + 410} q4,150 10,290`, 2.6, '#d4cdbd'), hl(`M${cx - 58},${top + 420} L${cx - 66},${top + 700}`, 6, .5));
      // dallah coffee pot
      const x = cx + 146, y = top + 262;
      o.push(`<g transform="translate(${x},${y}) scale(1.25) translate(${-x},${-y})">`);
      o.push(P(`M${x - 34},${y + 50} Q${x - 50},${y + 6} ${x - 26},${y - 16} L${x - 16},${y - 40} L${x + 16},${y - 40} L${x + 26},${y - 16} Q${x + 50},${y + 6} ${x + 34},${y + 50} Z`, GOLD, INK, 5), rect(x - 38, y + 46, 76, 14, BRONZE, 4, 4), P(`M${x - 20},${y - 40} Q${x},${y - 80} ${x + 20},${y - 40} Z`, GOLD, INK, 4.5), P(`M${x - 6},${y - 66} L${x},${y - 98} L${x + 6},${y - 66} Z`, GOLDL, INK, 3.4));
      o.push(P(`M${x + 30},${y + 20} Q${x + 60},${y + 10} ${x + 58},${y - 40} Q${x + 60},${y - 70} ${x + 74},${y - 84} L${x + 80},${y - 76} Q${x + 70},${y - 64} ${x + 70},${y - 40} Q${x + 72},${y + 20} ${x + 34},${y + 36} Z`, GOLD, INK, 4), L(`M${x - 30},${y - 20} Q${x - 70},${y - 10} ${x - 66},${y + 30} Q${x - 62},${y + 40} ${x - 40},${y + 30}`, 7, INK), L(`M${x - 30},${y - 20} Q${x - 70},${y - 10} ${x - 66},${y + 30} Q${x - 62},${y + 40} ${x - 40},${y + 30}`, 3, GOLD), hl(`M${x - 26},${y + 36} Q${x - 34},${y + 6} ${x - 18},${y - 10}`, 6, .6), L(`M${x - 30},${y + 4} Q${x},${y + 14} ${x + 30},${y + 4}`, 3, BRONZE));
      for (const [dx, dy] of [[66, -96], [76, -120], [56, -136]]) o.push(L(`M${x + dx - 10},${y + dy + 30} q8,-10 0,-20 q-8,-10 0,-20`, 3.4, '#b9b2a6'));
      o.push('</g>');
      o.push(fist(cx + 104, top + 264), P(`M${cx - 134},${top + 226} L${cx - 90},${top + 226} L${cx - 96},${top + 252} L${cx - 128},${top + 252} Z`, '#f3efe6', INK, 3.6), fist(cx - 112, top + 250));
      return o; } },

  // 7 HAWAIIAN — kid with a flower crown + hibiscus, aloha shirt, flower lei, grass skirt, ukulele
  { name: 'hawaiian', label: 'Hawaiian', form: 'kid', coat: '#e8743b', face: 'delight',
    hat: ({ cx, hy }) => { const o = [], cols = ['#f05a9a', '#ffd23f', '#fbfbf8', '#a86ad8', '#f08a2a'];
      for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.06 + k * .088); o.push(P(`M${f1(cx + Math.cos(a) * 102)},${f1(hy - 6 + Math.sin(a) * 96)} q-12,-8 -20,4 q10,8 20,-4 Z`, '#4f9a3a', INK, 3)); }
      for (let k = 0; k <= 8; k++) { const a = Math.PI * (1.1 + k * .1); o.push(flower5(cx + Math.cos(a) * 98, hy - 6 + Math.sin(a) * 94, 22, cols[k % 5], k % 5 === 1 ? '#f08a2a' : '#ffd23f', 2.8)); }
      o.push(hibiscus(cx + 104, hy - 22, 44));
      return o; },
    details: ({ cx, top }) => [...[[-60, 40], [30, 30], [70, 110], [-40, 130], [0, 80]].map(([dx, dy], i) => hibiscus(cx + dx, top + dy, 22, i % 2 ? '#fbf7f2' : '#ffd23f')), ...[[-80, 90], [50, 70], [-10, 160]].map(([dx, dy]) => P(`M${cx + dx},${top + dy} q20,-24 40,-6 q-20,22 -40,6 Z`, '#3f8a3a', INK, 2.6))],
    arms: B => ({ front: [B.arm(-1, B.cx - 112, B.top + 36, 20), B.arm(1, B.cx + 58, B.top + 150, 28)] }),
    props: ({ cx, top }) => { const o = [], y0 = top + 120;
      for (let k = 0; k < 18; k++) { const t = k / 17, x0 = cx - 80 + t * 160, x1 = cx - 132 + t * 264; o.push(L(`M${x0},${y0} Q${(x0 + x1) / 2 + (k % 2 ? 6 : -6)},${y0 + 90} ${x1},${y0 + 180}`, 13, INK)); }
      for (let k = 0; k < 18; k++) { const t = k / 17, x0 = cx - 80 + t * 160, x1 = cx - 132 + t * 264; o.push(L(`M${x0},${y0} Q${(x0 + x1) / 2 + (k % 2 ? 6 : -6)},${y0 + 90} ${x1},${y0 + 180}`, 7, k % 3 ? '#8ab84a' : '#b8c95a')); }
      o.push(rect(cx - 86, y0 - 8, 172, 22, '#d9b878', 4, 6), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${cx - 76 + k * 30},${y0 - 6} l10,18`, 2.4, '#9b7a3e')));
      const cols = ['#f05a9a', '#ffd23f', '#a86ad8', '#fbfbf8', '#f08a2a'];
      for (let k = 0; k <= 10; k++) { const t = k / 10, x = cx - 80 + t * 160, y = top + 6 + Math.sin(t * Math.PI) * 70; o.push(flower5(x, y, 26, cols[k % 5], '#ffd23f', 2.8)); }
      // ukulele
      const bx = cx + 26, by = top + 120;
      o.push(`<g transform="rotate(30 ${bx} ${by}) scale(1.15) translate(${-bx * .15 / 1.15},${-by * .15 / 1.15})">`, pole(bx - 30, by, bx - 170, by, '#6e4527', 13), rect(bx - 196, by - 12, 30, 24, '#6e4527', 3.4, 5), cloud([[bx + 14, by, 44], [bx - 40, by, 34]], '#e0a35a', 5), circ(bx - 22, by, 12, INK, 3), rect(bx + 30, by - 14, 10, 28, '#6e4527', 2.6, 3), ...[-1, 1].map(k => L(`M${bx - 180},${by + k * 4} L${bx + 36},${by + k * 4}`, 1.4, '#fbf7f2')), hl(`M${bx - 10},${by - 34} Q${bx + 30},${by - 44} ${bx + 50},${by - 18}`, 5, .5), '</g>');
      o.push(fist(cx - 112, top + 36, 13), fist(cx + 58, top + 150, 13));
      return o; } },

  // 8 INUIT HUNTER — giant fur-ruff parka hood, trimmed parka, harpoon with coiled line, a char fish
  { name: 'inuit', label: 'Arctic Hunter', form: 'standard', coat: '#c49a62', face: 'sus',
    headBack: ({ cx, hy }) => [circ(cx, hy + 2, 142, '#a87c48', 7)],
    hat: ({ cx, hy }) => { const cs = []; for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, r = 124 + (k % 2) * 6; cs.push([cx + Math.cos(a) * r, hy + 2 + Math.sin(a) * r * .98, 24 + (k % 3) * 3]); }
      return [cloud(cs, '#f1ebe0', 5.5), ...cs.filter((_, i) => i % 2 === 0).map(([x, y]) => L(`M${f1(x - 6)},${f1(y - 4)} q6,8 12,2`, 2.6, '#b9ab98'))]; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top + 4} L${cx + 60},${top + 4} L${cx + 40},${top + 120} L${cx - 40},${top + 120} Z`, '#8a6034', INK, 4),
      rect(cx - 140, top + 196, 280, 30, '#fbf7f2', 4, 0), ...[...Array(10)].map((_, k) => `<rect x="${cx - 136 + k * 28}" y="${top + 200 + (k % 2) * 11}" width="13" height="11" fill="#2a1a1f"/>`), rect(cx - 140, top + 226, 280, 10, RED, 3, 0),
      ...[-1, 1].map(s => L(`M${cx + s * 90},${top + 40} q${-s * 10},80 0,150`, 3, '#8a6034'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 128, B.top + 220, 26), B.arm(1, B.cx + 172, B.top + 250, 20)] }),
    props: ({ cx, top }) => { const o = [];
      o.push(cloud([[cx - 104, top + 320, 22], [cx - 70, top + 330, 24], [cx - 34, top + 334, 24], [cx, top + 336, 24], [cx + 34, top + 334, 24], [cx + 70, top + 330, 24], [cx + 104, top + 320, 22]], '#f1ebe0', 5));
      // arctic char hanging from the left hand
      const x = cx - 128, y = top + 236;
      o.push(L(`M${x},${y} l0,26`, 4), P(`M${x},${y + 30} l-18,-10 l4,22 Z M${x},${y + 30} l18,-10 l-4,22 Z`, '#7a8fa8', INK, 3.4), P(`M${x - 22},${y + 50} Q${x},${y + 36} ${x + 22},${y + 50} Q${x + 30},${y + 120} ${x},${y + 170} Q${x - 30},${y + 120} ${x - 22},${y + 50} Z`, '#8fa8c0', INK, 5), P(`M${x - 20},${y + 100} Q${x},${y + 110} ${x + 20},${y + 100} Q${x + 18},${y + 140} ${x},${y + 168} Q${x - 18},${y + 140} ${x - 20},${y + 100} Z`, '#e8826a', 'none', 0), ...[[-8, 70], [8, 86], [-6, 120]].map(([dx, dy]) => circ(x + dx, y + dy, 3.5, '#f6c84a', 1.6)), ell(x - 8, y + 150, 4, 4, '#fff', INK, 2), fist(x, y, 15));
      return o; },
    over: ({ cx, top }) => { const x0 = cx + 150, y0 = 970, x1 = cx + 226, y1 = -40, at = t => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], [hx, hy2] = at(.36);
      return [pole(x0, y0, x1, y1, WOOD, 13), P(`M${x1 - 10},${y1 + 20} L${x1 - 4},${y1 - 60} L${x1 + 10},${y1 - 76} L${x1 + 14},${y1 - 56} L${x1 + 12},${y1 + 18} Z`, '#f1ead6', INK, 5), P(`M${x1 + 4},${y1 - 66} L${x1 + 4},${y1 - 120} L${x1 + 20},${y1 - 70} Z`, STEEL, INK, 4), rect(x1 - 14, y1 + 12, 24, 22, '#5a3a24', 3.4, 4),
        ...[0, 1, 2].map(k => `<ellipse cx="${f1(hx + 22)}" cy="${f1(hy2 - 120 + k * 12)}" rx="${26 - k * 3}" ry="16" fill="none" stroke="${INK}" stroke-width="9"/><ellipse cx="${f1(hx + 22)}" cy="${f1(hy2 - 120 + k * 12)}" rx="${26 - k * 3}" ry="16" fill="none" stroke="#d9c7a8" stroke-width="4"/>`),
        fist(cx + 172, top + 250, 16)]; } },

  // 9 INDIAN BRIDE — red veil with gold border, maang tikka, jhumkas, red sari with pallu, gold necklaces
  { name: 'bride', label: 'Indian Bride', form: 'lady', coat: '#c8202f', face: ['female', 'swoon'],
    headBack: ({ cx, hy }) => { const d = `M${cx - 106},${hy - 60} Q${cx - 150},${hy + 60} ${cx - 156},${hy + 176} Q${cx},${hy + 204} ${cx + 156},${hy + 176} Q${cx + 150},${hy + 60} ${cx + 106},${hy - 60} Z`;
      return [P(d, '#b81c2c', INK, 6), `<path d="M${cx - 148},${hy + 164} Q${cx},${hy + 192} ${cx + 148},${hy + 164}" fill="none" stroke="${GOLD}" stroke-width="12"/>`, ...[...Array(9)].map((_, k) => circ(cx - 116 + k * 29, hy + 174 + Math.sin(k / 8 * Math.PI) * 9, 4, GOLDL, 1.6)), ...[[-130, 60], [130, 60], [-140, 130], [140, 130]].map(([dx, dy]) => star4(cx + dx, hy + dy, 9, GOLD))]; },
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 96},${hy + 10} Q${cx - 96},${hy - 70} ${cx - 40},${hy - 92} Q${cx},${hy - 100} ${cx + 40},${hy - 92} Q${cx + 96},${hy - 70} ${cx + 96},${hy + 10} Q${cx + 84},${hy - 40} ${cx + 50},${hy - 64} Q${cx + 14},${hy - 78} ${cx},${hy - 74} Q${cx - 14},${hy - 78} ${cx - 50},${hy - 64} Q${cx - 84},${hy - 40} ${cx - 96},${hy + 10} Z`, '#1d1a26', INK, 4), L(`M${cx},${hy - 96} L${cx},${hy - 76}`, 3, '#d8473c'));
      const vd = `M${cx - 120},${hy + 70} Q${cx - 128},${hy - 30} ${cx - 104},${hy - 90} Q${cx - 60},${hy - 140} ${cx},${hy - 142} Q${cx + 60},${hy - 140} ${cx + 104},${hy - 90} Q${cx + 128},${hy - 30} ${cx + 120},${hy + 70} Q${cx + 112},${hy + 20} ${cx + 100},${hy - 30} Q${cx + 80},${hy - 84} ${cx},${hy - 96} Q${cx - 80},${hy - 84} ${cx - 100},${hy - 30} Q${cx - 112},${hy + 20} ${cx - 120},${hy + 70} Z`;
      o.push(P(vd, '#c8202f', INK, 6), L(`M${cx - 116},${hy + 64} Q${cx - 112},${hy + 10} ${cx - 98},${hy - 34} Q${cx - 76},${hy - 88} ${cx},${hy - 100} Q${cx + 76},${hy - 88} ${cx + 98},${hy - 34} Q${cx + 112},${hy + 10} ${cx + 116},${hy + 64}`, 10, GOLD), ...[...Array(9)].map((_, k) => { const a = Math.PI * (1.08 + k * .105); return circ(cx + Math.cos(a) * 108, hy - 10 + Math.sin(a) * 108, 4, GOLDL, 1.6); }), hl(`M${cx - 90},${hy - 90} Q${cx - 50},${hy - 128} ${cx},${hy - 130}`, 7, .35));
      // maang tikka
      o.push(L(`M${cx},${hy - 96} L${cx},${hy - 70}`, 3, GOLD), circ(cx, hy - 62, 10, GOLD, 3.4), circ(cx, hy - 62, 4, '#d8473c', 1.6), circ(cx, hy - 46, 4, '#fbf7f2', 2));
      // jhumka earrings
      for (const s of [-1, 1]) { const x = cx + s * 104, y = hy + 34; o.push(circ(x, y - 18, 7, GOLD, 3), P(`M${x - 18},${y + 16} Q${x - 16},${y - 12} ${x},${y - 12} Q${x + 16},${y - 12} ${x + 18},${y + 16} Z`, GOLD, INK, 3.4), ...[-12, -4, 4, 12].map(t => circ(x + t, y + 22, 3.4, '#fbf7f2', 1.6))); }
      return o; },
    details: ({ cx, top }) => [...[...Array(16)].map((_, k) => star4(cx - 110 + (k % 4) * 70 + (Math.floor(k / 4) % 2) * 35, top + 180 + Math.floor(k / 4) * 56, 7, GOLD)),
      P(`M${cx - 70},${top - 10} L${cx - 20},${top - 10} L${cx + 170},${top + 260} L${cx + 170},${top + 330} Z`, '#a8142a', INK, 4), L(`M${cx - 40},${top - 8} L${cx + 168},${top + 290}`, 9, GOLD), L(`M${cx - 68},${top - 8} L${cx + 168},${top + 326}`, 6, GOLD),
      rect(cx - 140, top + 400, 280, 16, GOLD, 3.4, 0), rect(cx - 90, top + 120, 180, 16, GOLD, 3.4, 4),
      `<path d="M${cx - 44},${top + 10} Q${cx},${top + 54} ${cx + 44},${top + 10}" fill="none" stroke="${INK}" stroke-width="14"/><path d="M${cx - 44},${top + 10} Q${cx},${top + 54} ${cx + 44},${top + 10}" fill="none" stroke="${GOLD}" stroke-width="8"/>`, circ(cx, top + 36, 9, '#2fb36a', 3), ...[-30, -15, 15, 30].map(t => circ(cx + t, top + 30 + Math.abs(t) * -.2 + 4, 4, '#fbf7f2', 1.6)),
      `<path d="M${cx - 50},${top + 14} Q${cx},${top + 92} ${cx + 50},${top + 14}" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="3 6"/>`],
    arms: B => ({ front: [B.arm(-1, B.cx - 26, B.top + 150, 50), B.arm(1, B.cx + 26, B.top + 150, 50)] }),
    props: ({ cx, top }) => { const o = [], y = top + 150;
      for (const s of [-1, 1]) for (const k of [0, 1, 2]) o.push(`<ellipse cx="${cx + s * (58 - k * 7)}" cy="${y - 34 + k * 8}" rx="11" ry="5" fill="${k === 1 ? '#d8473c' : GOLD}" stroke="${INK}" stroke-width="2.4" transform="rotate(${s * -40} ${cx + s * (58 - k * 7)} ${y - 34 + k * 8})"/>`);
      o.push(circ(cx - 16, y, 14, INK, 0), circ(cx + 16, y, 14, INK, 0), P(`M${cx - 8},${y - 16} L${cx + 8},${y - 16} L${cx + 6},${y + 14} L${cx - 6},${y + 14} Z`, INK, INK, 2));
      return o; } },

  // 10 GREEK FISHERMAN — black fisherman cap, blue-white stripes, a fish bigger than he is
  { name: 'fisherman', label: 'Greek Fisherman', form: 'dad', coat: '#f6f4ee', face: 'starstruck',
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 108, hy - 52], [cx - 124, hy - 98], [cx - 70, hy - 134], [cx, hy - 140], [cx + 70, hy - 134], [cx + 124, hy - 98], [cx + 108, hy - 52], [cx, hy - 66]], '#1f2236', 7), hl(`M${cx - 96},${hy - 100} Q${cx - 50},${hy - 128} ${cx},${hy - 130}`, 7, .3));
      o.push(P(`M${cx - 106},${hy - 66} Q${cx},${hy - 80} ${cx + 106},${hy - 66} L${cx + 104},${hy - 50} Q${cx},${hy - 64} ${cx - 104},${hy - 50} Z`, '#1f2236', INK, 5), L(`M${cx - 96},${hy - 66} Q${cx},${hy - 78} ${cx + 96},${hy - 66}`, 5, GOLD).replace('fill="none"', 'fill="none" stroke-dasharray="8 5"'));
      o.push(P(`M${cx - 86},${hy - 58} Q${cx},${hy - 76} ${cx + 86},${hy - 58} Q${cx + 70},${hy - 36} ${cx},${hy - 34} Q${cx - 70},${hy - 36} ${cx - 86},${hy - 58} Z`, '#0f1018', INK, 5), hl(`M${cx - 60},${hy - 50} Q${cx},${hy - 58} ${cx + 40},${hy - 52}`, 5, .5));
      for (const s of [-1, 1]) o.push(circ(cx + s * 98, hy - 62, 7, GOLD, 3));
      return o; },
    details: ({ cx, top }) => [...[...Array(9)].map((_, k) => `<rect x="${cx - 170}" y="${top + 14 + k * 36}" width="340" height="16" fill="#24488a"/>`), rect(cx - 170, top + 320, 340, 80, '#2a3550', 0, 0), L(`M${cx - 170},${top + 318} Q${cx},${top + 340} ${cx + 170},${top + 318}`, 9, '#d9c7a8'), L(`M${cx - 170},${top + 318} Q${cx},${top + 340} ${cx + 170},${top + 318}`, 3, '#9b7a3e').replace('fill="none"', 'fill="none" stroke-dasharray="6 6"')],
    arms: B => ({ front: [B.arm(-1, B.cx - 70, B.top + 252, 40), B.arm(1, B.cx + 118, B.top + 74, 40)] }),
    props: ({ cx, top }) => { const o = [], ang = -33, fx = cx + 6, fy = top + 160;
      const body = `M${fx - 250},${fy} Q${fx - 210},${fy - 84} ${fx - 40},${fy - 82} Q${fx + 120},${fy - 72} ${fx + 196},${fy - 10} L${fx + 196},${fy + 10} Q${fx + 120},${fy + 70} ${fx - 40},${fy + 76} Q${fx - 210},${fy + 78} ${fx - 250},${fy} Z`;
      o.push(`<g transform="rotate(${ang} ${fx} ${fy})">`,
        P(`M${fx + 186},${fy} L${fx + 262},${fy - 76} Q${fx + 244},${fy} ${fx + 262},${fy + 76} Z`, '#5f86b8', INK, 6), P(`M${fx - 80},${fy - 78} L${fx - 20},${fy - 128} L${fx + 40},${fy - 80} Z`, '#5f86b8', INK, 5), P(`M${fx - 40},${fy + 72} L${fx},${fy + 112} L${fx + 30},${fy + 70} Z`, '#5f86b8', INK, 5),
        P(body, '#8fb1d6', 'none', 0), clipG('fishB', body, `<rect x="${fx - 260}" y="${fy + 10}" width="470" height="80" fill="#e9f0f6"/>` + [...Array(7)].map((_, k) => P(`M${fx - 120 + k * 40},${fy - 70} q16,30 0,60`, 'none', '#5f86b8', 3)).join('')), P(body, 'none', INK, 7),
        L(`M${fx - 170},${fy - 60} Q${fx - 190},${fy} ${fx - 170},${fy + 60}`, 4), circ(fx - 214, fy - 18, 13, '#fff', 4), ell(fx - 216, fy - 18, 5, 6, INK), P(`M${fx - 250},${fy} l22,6 l-18,8 Z`, INK, INK, 2), hl(`M${fx - 180},${fy - 66} Q${fx - 60},${fy - 90} ${fx + 80},${fy - 66}`, 8, .5), '</g>');
      o.push(fist(cx - 70, top + 252, 17), fist(cx + 118, top + 74, 17), L(`M${cx - 90},${top + 230} l-10,-10 M${cx + 140},${top + 60} l12,-8`, 4));
      return o; } },
];
