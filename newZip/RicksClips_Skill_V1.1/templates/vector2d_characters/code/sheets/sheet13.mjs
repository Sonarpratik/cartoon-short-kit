// SHEET 13 — TEENS, PARENTS & GRANDPARENTS
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, SILVER, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4, heart, drop } from '../castkit.mjs';
import { headPts, inkRing } from '../char2d.mjs';
import { BABY, BABY_HEAD } from '../memes2.mjs';
export const TITLE = 'Cast sheet 13: Teens, parents & grandparents';

// ---------- local helpers ----------
const NEON = '#39e07a', BRASS = '#e8b53a', BRASSD = '#b9822a', ORANGE = '#f39a2b';
// thick tube with ink edge (cables, brass tubing, straps)
const tubeD = (d, col, w = 14) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const txt = (x, y, s, size = 28, col = INK, rot = 0) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${col}" transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
// mini head (baby in a carrier): k = scale vs a normal head
const miniHead = (face, x, y, k, shape = BABY_HEAD) => { const M = face(x, y), HP = headPts(x, y, 100, shape);
  return `<g transform="translate(${x},${y}) scale(${k}) rotate(${M.rot || 0}) translate(${-x},${-y})">${(M.under || []).join('')}<path d="${smooth(HP)}" fill="url(#${M.skin || 'sk'})"/>${inkRing(HP, 11, { seed: 3 })}${M.over.join('')}</g>`; };
// orange slice (smile wedge)
const wedge = (x, y, r = 22, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${P(`M${x - r},${y} A${r},${r} 0 0,0 ${x + r},${y} Z`, ORANGE, INK, 3.4)}${P(`M${x - r + 6},${y + 1} A${r - 6},${r - 6} 0 0,0 ${x + r - 6},${y + 1} Z`, '#ffd08a', 'none', 0)}${[-.6, 0, .6].map(a => L(`M${x},${y + 1} L${f1(x + Math.sin(a) * (r - 7))},${f1(y + Math.cos(a) * (r - 7))}`, 2, ORANGE)).join('')}</g>`;
// pom-pom: a burst of ribbon strips
const pom = (x, y, r, c1, c2) => { const o = [];
  for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2 + (k % 2) * .1, rr = r * (k % 3 ? 1 : .86); o.push(P(`M${f1(x)},${f1(y)} L${f1(x + Math.cos(a - .14) * rr)},${f1(y + Math.sin(a - .14) * rr)} Q${f1(x + Math.cos(a) * rr * 1.12)},${f1(y + Math.sin(a) * rr * 1.12)} ${f1(x + Math.cos(a + .14) * rr)},${f1(y + Math.sin(a + .14) * rr)} Z`, k % 2 ? c1 : c2, INK, 3.4)); }
  o.push(circ(x, y, r * .3, c2, 3.4)); return o; };

export const CAST = [
  // ===================== TEENS =====================
  { name: 'gamer', label: 'Gamer', form: 'teen', coat: '#34384a', face: ['teen', 'hype'],
    hat: ({ cx, hy }) => { const o = [];
      o.push(tubeD(`M${cx - 116},${hy + 4} Q${cx - 120},${hy - 128} ${cx},${hy - 132} Q${cx + 120},${hy - 128} ${cx + 116},${hy + 4}`, '#26262e', 20), L(`M${cx - 70},${hy - 112} Q${cx},${hy - 134} ${cx + 70},${hy - 112}`, 5, NEON));
      for (const s of [-1, 1]) { const x = cx + s * 120;
        o.push(rect(x - 30, hy - 58, 60, 120, '#26262e', 7, 26), rect(x - 18, hy - 44, 36, 92, NEON, 4, 16), rect(x - 10, hy - 32, 20, 68, '#26262e', 3, 9), hl(`M${x - 22},${hy - 40} L${x - 22},${hy + 20}`, 5, .35)); }
      o.push(tubeD(`M${cx - 128},${hy + 40} Q${cx - 132},${hy + 110} ${cx - 76},${hy + 112}`, '#26262e', 8), ell(cx - 70, hy + 112, 13, 11, '#26262e', INK, 4), ell(cx - 70, hy + 112, 5, 4, RED));
      return o; },
    details: ({ cx, top }) => [rect(cx - 160, top + 252, 320, 80, '#2a2d3b', 0, 0), L(`M${cx - 120},${top + 252} L${cx + 120},${top + 252}`, 4),
      P(`M${cx - 66},${top + 6} Q${cx},${top + 54} ${cx + 66},${top + 6} Q${cx},${top + 28} ${cx - 66},${top + 6} Z`, '#2a2d3b', INK, 3.5),
      L(`M${cx - 120},${top + 70} L${cx + 120},${top + 70}`, 8, NEON), L(`M${cx - 120},${top + 90} L${cx + 120},${top + 90}`, 4, NEON),
      ...[[0, 1, 1, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0]].flatMap((r, j) => r.map((v, i) => v ? `<rect x="${cx - 49 + i * 14}" y="${top + 230 + j * 14}" width="14" height="14" fill="${NEON}"/>` : ''))],
    arms: B => ({ front: [B.arm(-1, B.cx - 54, B.top + 168, 26), B.arm(1, B.cx + 54, B.top + 168, -26)] }),
    props: ({ cx, top }) => { const y = top + 172; return [
      tubeD(`M${cx + 30},${y + 26} Q${cx + 70},${y + 200} ${cx + 30},${y + 320} Q${cx - 20},${y + 420} ${cx + 60},${y + 470} Q${cx + 140},${y + 500} ${cx + 170},${y + 486}`, '#26262e', 6),
      P(`M${cx - 86},${y - 18} Q${cx - 100},${y - 30} ${cx - 60},${y - 30} L${cx + 60},${y - 30} Q${cx + 100},${y - 30} ${cx + 86},${y - 18} L${cx + 92},${y + 30} Q${cx + 80},${y + 52} ${cx + 52},${y + 30} L${cx - 52},${y + 30} Q${cx - 80},${y + 52} ${cx - 92},${y + 30} Z`, '#eceef4', INK, 6), hl(`M${cx - 70},${y - 20} L${cx + 50},${y - 20}`, 5, .9),
      L(`M${cx - 60},${y - 8} l0,22 M${cx - 71},${y + 3} l22,0`, 8, '#3b393f'), circ(cx + 50, y - 12, 6, RED, 2.4), circ(cx + 64, y + 2, 6, NEON, 2.4), circ(cx + 36, y + 2, 6, '#4fa3f0', 2.4), circ(cx + 50, y + 16, 6, GOLD, 2.4),
      circ(cx - 22, y + 14, 9, '#4a4f60', 3), circ(cx + 18, y + 14, 9, '#4a4f60', 3), fist(cx - 66, y + 10, 14), fist(cx + 70, y + 10, 14)]; } },

  { name: 'skater', label: 'Skater', form: 'teen', coat: '#e8a83a', face: ['teen', 'smugOk'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 104, hy - 40], [cx - 126, hy + 10], [cx - 112, hy + 40], [cx - 130, hy + 64], [cx - 96, hy + 60], [cx, hy], [cx + 96, hy + 60], [cx + 128, hy + 62], [cx + 112, hy + 36], [cx + 124, hy + 4], [cx + 104, hy - 40]], '#7a4a2e', 6)],
    hat: ({ cx, hy }) => { const B = '#3e78c4', o = [];
      o.push(fillPts([[cx - 110, hy - 46], [cx - 100, hy - 110], [cx - 40, hy - 150], [cx + 50, hy - 160], [cx + 130, hy - 176], [cx + 176, hy - 150], [cx + 150, hy - 110], [cx + 112, hy - 70], [cx + 110, hy - 46]], B, 7));
      o.push(...[-1, 0, 1, 2].map(k => L(`M${cx - 70 + k * 46},${hy - 130 - k * 8} q6,30 2,62`, 3, '#2d5a98')), hl(`M${cx - 80},${hy - 110} Q${cx - 30},${hy - 146} ${cx + 40},${hy - 150}`, 8, .4));
      o.push(fillPts([[cx - 116, hy - 76], [cx, hy - 90], [cx + 116, hy - 76], [cx + 116, hy - 36], [cx, hy - 50], [cx - 116, hy - 36]], '#2d5a98', 6), ...[-90, -60, -30, 0, 30, 60, 90].map(t => L(`M${cx + t},${hy - 82 + Math.abs(t) * .1} l0,36`, 3, '#244a80')));
      o.push(rect(cx - 112, hy - 66, 26, 20, '#f3efe6', 3.4, 3));
      o.push(fillPts([[cx - 96, hy - 44], [cx - 70, hy - 20], [cx - 60, hy - 46], [cx - 30, hy - 24], [cx - 20, hy - 48]], '#7a4a2e', 4.5));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 66},${top + 6} Q${cx},${top + 54} ${cx + 66},${top + 6} Q${cx},${top + 28} ${cx - 66},${top + 6} Z`, '#c98a2c', INK, 3.5),
      L(`M${cx - 14},${top + 30} q-4,44 0,86 M${cx + 14},${top + 30} q4,44 0,86`, 3.2), rect(cx - 160, top + 270, 320, 60, '#c98a2c', 0, 0), L(`M${cx - 120},${top + 270} L${cx + 120},${top + 270}`, 4),
      P(`M${cx - 42},${top + 150} l84,0 l-14,60 l-56,0 Z`, '#fff', INK, 4), ell(cx - 18, top + 172, 8, 9, INK), ell(cx + 18, top + 172, 8, 9, INK), L(`M${cx - 14},${top + 200} l0,10 M${cx},${top + 200} l0,10 M${cx + 14},${top + 200} l0,10`, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top + 210, 30), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top }) => { const x = cx - 156, y0 = top + 120, y1 = 1004, D = '#d8473c';
      return [P(`M${x - 40},${y0 + 40} Q${x - 40},${y0} ${x},${y0} Q${x + 40},${y0} ${x + 40},${y0 + 40} L${x + 40},${y1 - 40} Q${x + 40},${y1} ${x},${y1} Q${x - 40},${y1} ${x - 40},${y1 - 40} Z`, D, INK, 7),
        P(`M${x - 18},${y0 + 140} L${x + 22},${y0 + 140} L${x - 4},${y0 + 230} L${x + 26},${y0 + 230} L${x - 24},${y0 + 360} L${x - 8},${y0 + 260} L${x - 30},${y0 + 260} Z`, GOLD, INK, 4),
        ...[y0 + 70, y1 - 80].flatMap(y => [rect(x - 50, y - 8, 100, 16, STEEL, 4, 4), circ(x - 48, y, 13, '#f3efe6', 4), circ(x + 48, y, 13, '#f3efe6', 4)]), hl(`M${x - 26},${y0 + 40} L${x - 26},${y1 - 120}`, 7, .35), fist(x + 16, top + 210, 15)]; } },

  { name: 'goth', label: 'Goth Teen', form: 'teengirl', coat: '#2a2730', face: ['teen', 'deadpan'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 100, hy - 70], [cx - 126, hy + 40], [cx - 132, hy + 150], [cx - 126, hy + 236], [cx - 76, hy + 226], [cx - 62, hy + 120], [cx, hy + 96], [cx + 62, hy + 120], [cx + 76, hy + 226], [cx + 126, hy + 236], [cx + 132, hy + 150], [cx + 126, hy + 40], [cx + 100, hy - 70], [cx, hy - 120]], '#1d1a26', 6),
      L(`M${cx + 110},${hy + 40} Q${cx + 118},${hy + 140} ${cx + 102},${hy + 220}`, 9, '#8a4fd0'), L(`M${cx - 100},${hy + 80} Q${cx - 112},${hy + 170} ${cx - 98},${hy + 210}`, 3, '#3a3446')],
    hat: ({ cx, hy }) => [fillPts([[cx - 106, hy - 24], [cx - 100, hy - 84], [cx - 50, hy - 118], [cx + 20, hy - 124], [cx + 80, hy - 104], [cx + 108, hy - 60], [cx + 110, hy - 20], [cx + 96, hy - 40], [cx + 60, hy - 66], [cx + 10, hy - 50], [cx - 22, hy - 10], [cx - 46, hy + 26], [cx - 76, hy + 34], [cx - 98, hy + 20]], '#1d1a26', 6),
      L(`M${cx + 60},${hy - 96} Q${cx},${hy - 90} ${cx - 40},${hy - 36} Q${cx - 56},${hy - 10} ${cx - 70},${hy + 20}`, 9, '#8a4fd0'), hl(`M${cx - 60},${hy - 96} Q${cx - 10},${hy - 118} ${cx + 50},${hy - 108}`, 6, .25)],
    behind: ({ cx, top }) => { const y = top + 150; return [...[-1, 1].map(s => P(`M${cx + s * 40},${y - 30} Q${cx + s * 150},${y - 130} ${cx + s * 246},${y - 90} Q${cx + s * 226},${y - 40} ${cx + s * 238},${y + 10} Q${cx + s * 200},${y - 6} ${cx + s * 186},${y + 36} Q${cx + s * 156},${y + 10} ${cx + s * 134},${y + 60} Q${cx + s * 110},${y + 30} ${cx + s * 60},${y + 70} Z`, '#3a3446', INK, 6)),
      ...[-1, 1].flatMap(s => [L(`M${cx + s * 60},${y - 20} Q${cx + s * 150},${y - 90} ${cx + s * 238},${y - 80}`, 3.4, '#5c5470'), L(`M${cx + s * 150},${y - 70} L${cx + s * 186},${y + 30} M${cx + s * 110},${y - 40} L${cx + s * 134},${y + 50}`, 3, '#5c5470')])]; },
    details: ({ cx, top }) => [rect(cx - 160, top, 320, 140, '#2a2730', 0, 0), P(`M${cx - 30},${top} L${cx},${top + 60} L${cx + 30},${top} Z`, '#f3efe6', INK, 3),
      L(`M${cx - 160},${top + 136} L${cx + 160},${top + 136}`, 18, INK), ...[-60, -30, 0, 30, 60].map(t => circ(cx + t, top + 136, 4, SILVER, 2)),
      rect(cx - 170, top + 146, 340, 180, '#3a2f48', 0, 0), ...[-90, -45, 0, 45, 90].map(t => L(`M${cx + t},${top + 146} L${cx + t * 1.5},${top + 330}`, 6, '#1d1a26')), ...[0, 1, 2].map(k => L(`M${cx - 170},${top + 186 + k * 46} L${cx + 170},${top + 186 + k * 46}`, 5, '#1d1a26')), ...[0, 1, 2].map(k => L(`M${cx - 170},${top + 196 + k * 46} L${cx + 170},${top + 196 + k * 46}`, 2.4, '#8a4fd0')),
      P(`M${cx - 14},${top + 70} l14,-10 l14,10 l-14,30 Z`, '#8a4fd0', INK, 3)],
    props: ({ cx, top }) => [L(`M${cx - 34},${top - 2} Q${cx},${top + 12} ${cx + 34},${top - 2}`, 12, INK), ...[-24, -8, 8, 24].map(t => P(`M${cx + t - 5},${top + 8} l5,12 l5,-12 Z`, SILVER, INK, 2))] },

  { name: 'cheer', label: 'Cheerleader', form: 'teengirl', coat: '#d8473c', face: ['teen', 'bracesGrin'],
    headBack: ({ cx, hy }) => [P(`M${cx + 30},${hy - 110} Q${cx + 40},${hy - 210} ${cx + 120},${hy - 200} Q${cx + 176},${hy - 186} ${cx + 172},${hy - 100} Q${cx + 168},${hy - 40} ${cx + 150},${hy + 10} Q${cx + 140},${hy - 60} ${cx + 126},${hy - 90} Q${cx + 134},${hy - 30} ${cx + 112},${hy + 20} Q${cx + 106},${hy - 70} ${cx + 90},${hy - 110} Z`, '#f0c040', INK, 6),
      L(`M${cx + 100},${hy - 180} Q${cx + 150},${hy - 170} ${cx + 152},${hy - 80}`, 4, '#c99a22'), hl(`M${cx + 56},${hy - 170} Q${cx + 90},${hy - 196} ${cx + 130},${hy - 186}`, 7, .5)],
    hat: ({ cx, hy }) => { const o = [fillPts([[cx - 110, hy + 10], [cx - 108, hy - 70], [cx - 56, hy - 116], [cx + 10, hy - 124], [cx + 76, hy - 108], [cx + 110, hy - 60], [cx + 112, hy + 10], [cx + 96, hy - 30], [cx + 70, hy - 70], [cx + 20, hy - 78], [cx - 30, hy - 74], [cx - 76, hy - 70], [cx - 96, hy - 30]], '#f0c040', 6),
      L(`M${cx - 60},${hy - 96} Q${cx},${hy - 112} ${cx + 60},${hy - 96}`, 3.4, '#c99a22'), hl(`M${cx - 70},${hy - 98} Q${cx - 30},${hy - 116} ${cx + 10},${hy - 114}`, 7, .5)];
      const x = cx + 40, y = hy - 124; o.push(P(`M${x},${y} Q${x - 60},${y - 70} ${x - 80},${y - 10} Q${x - 60},${y + 30} ${x},${y} Z`, '#fff', INK, 5), P(`M${x},${y} Q${x + 60},${y - 76} ${x + 84},${y - 16} Q${x + 64},${y + 30} ${x},${y} Z`, '#fff', INK, 5), L(`M${x - 50},${y - 30} q20,4 34,20 M${x + 50},${y - 34} q-20,6 -34,22`, 3, RED), circ(x, y, 13, RED, 4));
      return o; },
    details: ({ cx, top }) => [rect(cx - 160, top, 320, 330, '#d8473c', 0, 0), P(`M${cx - 40},${top} L${cx},${top + 50} L${cx + 40},${top} Z`, '#fff', INK, 3.5),
      P(`M${cx - 80},${top + 60} L${cx},${top + 104} L${cx + 80},${top + 60} L${cx + 80},${top + 82} L${cx},${top + 126} L${cx - 80},${top + 82} Z`, '#fff', INK, 3.5),
      txt(cx, top + 108 + 0, '', 10), P(`M${cx},${top + 66} l6,14 l15,0 l-12,9 l5,15 l-14,-9 l-14,9 l5,-15 l-12,-9 l15,0 Z`, GOLD, INK, 2.6),
      rect(cx - 170, top + 150, 340, 14, '#fff', 0, 0), L(`M${cx - 170},${top + 150} L${cx + 170},${top + 150} M${cx - 170},${top + 164} L${cx + 170},${top + 164}`, 3),
      ...[-75, -45, -15, 15, 45, 75].map(d => L(`M${cx + d},${top + 170} L${cx + d * 1.6},${top + 300}`, 3)), ...[-60, -30, 0, 30, 60].map(d => P(`M${cx + d - 6},${top + 260} L${cx + d * 1.5 - 8},${top + 300} L${cx + d * 1.5 + 8},${top + 300} L${cx + d + 6},${top + 260} Z`, '#fff', 'none', 0))],
    arms: B => ({ front: [B.arm(-1, B.cx - 192, B.top - 170, 40), B.arm(1, B.cx + 176, B.top + 150, -10)] }),
    over: ({ cx, top }) => [...pom(cx - 196, top - 186, 52, RED, '#fff'), ...pom(cx + 182, top + 160, 62, '#fff', RED), fist(cx - 192, top - 170, 14), fist(cx + 176, top + 150, 14)] },

  { name: 'band', label: 'Band Kid', form: 'teen', coat: '#2f4f9a', face: ['teen', 'mortified'],
    hat: ({ cx, hy }) => [fillPts([[cx - 104, hy - 40], [cx - 100, hy - 96], [cx - 50, hy - 124], [cx + 10, hy - 128], [cx + 70, hy - 116], [cx + 104, hy - 80], [cx + 106, hy - 36], [cx + 90, hy - 62], [cx + 60, hy - 66], [cx + 30, hy - 58], [cx, hy - 70], [cx - 30, hy - 60], [cx - 64, hy - 70], [cx - 88, hy - 60]], '#8a5a34', 6),
      L(`M${cx - 60},${hy - 102} q30,-14 60,-10 M${cx + 10},${hy - 112} q30,0 52,14`, 3.4, '#5e3a1e')],
    behind: ({ cx, top }) => { const x = cx - 104, y = top - 390; return [tubeD(`M${x + 10},${y + 90} Q${cx - 190},${top - 120} ${cx - 120},${top + 110}`, BRASS, 30),
      ell(x, y, 112, 100, BRASS, INK, 8), ell(x, y + 4, 86, 76, BRASSD, INK, 5), ell(x, y + 10, 50, 44, '#7a5418', INK, 4), hl(`M${x - 84},${y - 30} Q${x - 64},${y - 76} ${x - 20},${y - 86}`, 10, .55), ...[-1, 1].map(s => circ(x + s * 100, y + 30, 6, GOLDL, 2.4))]; },
    details: ({ cx, top }) => [rect(cx - 160, top, 320, 330, '#2f4f9a', 0, 0), P(`M${cx - 80},${top} L${cx},${top + 40} L${cx + 80},${top} L${cx + 80},${top + 20} L${cx},${top + 60} L${cx - 80},${top + 20} Z`, GOLD, INK, 3.5),
      ...[0, 1, 2, 3].flatMap(k => [circ(cx - 26, top + 90 + k * 46, 6, GOLD, 2.6), circ(cx + 26, top + 90 + k * 46, 6, GOLD, 2.6), L(`M${cx - 20},${top + 90 + k * 46} L${cx + 20},${top + 90 + k * 46}`, 4, GOLD)]),
      rect(cx - 160, top + 270, 320, 20, '#fff', 3.4, 0)],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 150, 20), B.arm(1, B.cx + 110, B.top + 120, -20)] }),
    props: ({ cx, top }) => { const o = [];
      // sousaphone: big brass loop around the body, valves at the right hand, giant bell up over the left shoulder
      o.push(`<g transform="rotate(-18 ${cx} ${top + 170})"><ellipse cx="${cx}" cy="${top + 170}" rx="170" ry="96" fill="none" stroke="${INK}" stroke-width="40"/><ellipse cx="${cx}" cy="${top + 170}" rx="170" ry="96" fill="none" stroke="${BRASS}" stroke-width="28"/><path d="M${cx - 150},${top + 120} A170,96 0 0,1 ${cx + 60},${top + 76}" fill="none" stroke="${GOLDL}" stroke-width="7" stroke-linecap="round"/></g>`);
      o.push(rect(cx + 88, top + 80, 48, 70, BRASS, 5, 6), ...[0, 1, 2].map(k => rect(cx + 92 + k * 15, top + 56, 10, 26, SILVER, 3, 3)), fist(cx + 110, top + 120, 15), fist(cx - 120, top + 150, 15));
      return o; }, },

  // ===================== PARENTS & GRANDPARENTS =====================
  { name: 'bbqdad', label: 'BBQ Dad', form: 'dad', coat: '#6aa9d8', face: 'cool',
    hat: ({ cx, hy }) => [fillPts([[cx - 108, hy - 40], [cx - 102, hy - 96], [cx - 50, hy - 128], [cx + 10, hy - 132], [cx + 70, hy - 120], [cx + 106, hy - 84], [cx + 110, hy - 40], [cx, hy - 56]], '#d8473c', 7),
      P(`M${cx - 108},${hy - 46} Q${cx - 136},${hy - 50} ${cx - 152},${hy - 30} Q${cx - 130},${hy - 18} ${cx - 104},${hy - 30} Z`, '#b8322a', INK, 6), rect(cx + 20, hy - 70, 40, 18, '#f3efe6', 3.4, 4), circ(cx + 6, hy - 132, 9, '#b8322a', 4),
      L(`M${cx - 40},${hy - 126} q-10,40 -6,80 M${cx + 46},${hy - 122} q10,40 4,76`, 3, '#8f2219'), hl(`M${cx - 76},${hy - 96} Q${cx - 30},${hy - 124} ${cx + 20},${hy - 124}`, 8, .45)],
    details: ({ cx, top }) => [P(`M${cx - 50},${top} L${cx},${top + 50} L${cx + 50},${top} Z`, '#4f88b8', INK, 4),
      P(`M${cx - 110},${top + 70} L${cx + 110},${top + 70} L${cx + 150},${top + 400} L${cx - 150},${top + 400} Z`, '#f3efe6', INK, 5), L(`M${cx - 72},${top + 70} L${cx - 54},${top} M${cx + 72},${top + 70} L${cx + 54},${top}`, 8, INK),
      ...[0, 1, 2, 3, 4, 5].flatMap(r => [0, 1, 2, 3, 4, 5, 6, 7].map(i => (r + i) % 2 ? `<rect x="${cx - 150 + i * 38}" y="${top + 70 + r * 38}" width="38" height="38" fill="#d8473c" opacity=".9"/>` : '')),
      P(`M${cx - 110},${top + 70} L${cx + 110},${top + 70} L${cx + 150},${top + 400} L${cx - 150},${top + 400} Z`, 'none', INK, 5),
      rect(cx - 60, top + 140, 120, 90, '#fff', 4, 10), P(`M${cx},${top + 150} Q${cx + 30},${top + 180} ${cx + 16},${top + 214} Q${cx + 6},${top + 196} ${cx},${top + 210} Q${cx - 8},${top + 192} ${cx - 18},${top + 214} Q${cx - 30},${top + 180} ${cx},${top + 150} Z`, ORANGE, INK, 3.4),
      L(`M${cx - 200},${top + 230} L${cx + 200},${top + 230}`, 6, INK)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 160, 30), B.arm(1, B.cx + 186, B.top - 80, -20)] }),
    props: ({ cx, top }) => { const x = cx - 150, y = top + 160; return [tubeD(`M${x},${y} L${x - 30},${y + 190}`, STEEL, 8), tubeD(`M${x + 10},${y} L${x - 4},${y + 200}`, STEEL, 8), tubeD(`M${x - 4},${y - 10} L${x + 12},${y + 40}`, '#3b393f', 14),
      P(`M${x - 30},${y + 180} q-6,30 6,40 M${x},${y + 192} q6,30 -6,40`, 'none', INK, 5), ...[0, 1, 2].map(k => P(`M${x - 10 + k * 10},${y + 230 + k * 12} q-10,-14 0,-28`, 'none', '#b9b2c4', 4)), fist(x, y, 17)]; },
    over: ({ cx, top }) => { const x = cx + 186, y = top - 80, px = x - 20, py = y - 300; return [tubeD(`M${x},${y + 20} L${x + 8},${y - 116}`, '#3b393f', 13), poly([[x - 18, y - 114], [x + 34, y - 114], [x + 44, y - 212], [x - 26, y - 216]], STEEL, 6), ...[0, 1, 2].map(k => L(`M${x - 6 + k * 16},${y - 132} l${1 + k * 2},-62`, 4, '#7d8696')), hl(`M${x - 14},${y - 130} L${x - 18},${y - 200}`, 5, .6),
      P(`M${px - 50},${py} Q${px},${py - 34} ${px + 50},${py} Q${px + 54},${py + 26} ${px},${py + 30} Q${px - 54},${py + 26} ${px - 50},${py} Z`, '#7a3f22', INK, 6), L(`M${px - 38},${py + 6} q38,8 76,0`, 4, '#5a2a14'), ...[[-24, 0], [6, -4], [30, 2]].map(([dx, dy]) => L(`M${px + dx},${py + dy} l10,-6`, 3, '#a8603a')),
      L(`M${px - 72},${py + 40} q-18,-34 4,-66`, 5), L(`M${x + 10},${y - 236} q-6,-20 2,-34`, 4), ...[0, 1, 2].map(k => L(`M${px - 34 + k * 34},${py - 44 - k * 4} q-12,-16 0,-30 q12,-14 0,-28`, 4, '#b9b2c4')), fist(x, y, 18)]; } },

  { name: 'soccermom', label: 'Soccer Mom', form: 'lady', coat: '#2fa39a', face: ['female', 'mamaRage'], hair: 'bob',
    hat: ({ cx, hy }) => [rect(cx - 108, hy - 76, 216, 30, '#f05a9a', 6, 12), P(`M${cx - 110},${hy - 60} Q${cx - 146},${hy - 46} ${cx - 150},${hy - 20} Q${cx},${hy + 6} ${cx + 150},${hy - 20} Q${cx + 146},${hy - 46} ${cx + 110},${hy - 60} Q${cx},${hy - 40} ${cx - 110},${hy - 60} Z`, '#f8f4fa', INK, 6),
      P(`M${cx - 146},${hy - 22} Q${cx},${hy + 4} ${cx + 146},${hy - 22} Q${cx},${hy - 6} ${cx - 146},${hy - 22} Z`, '#f05a9a', 'none', 0), hl(`M${cx - 140},${hy - 34} Q${cx - 60},${hy - 44} ${cx},${hy - 42}`, 7, .6),
      P(`M${cx - 44},${hy - 72} q-4,-8 4,-10 l80,0 q8,2 4,10`, 'none', '#fff', 0), txt(cx, hy - 52, 'MOM', 22, '#fff')],
    details: ({ cx, top }) => [L(`M${cx - 100},${top + 10} L${cx - 150},${top + 400} M${cx + 100},${top + 10} L${cx + 150},${top + 400}`, 14, '#fff'), L(`M${cx - 100},${top + 10} L${cx - 150},${top + 400} M${cx + 100},${top + 10} L${cx + 150},${top + 400}`, 3, INK),
      L(`M${cx},${top + 20} L${cx},${top + 400}`, 4), P(`M${cx - 40},${top} L${cx},${top + 40} L${cx + 40},${top} Z`, '#23807a', INK, 3.5),
      circ(cx + 52, top + 110, 32, '#fff', 4), P(`M${cx + 52},${top + 96} l13,10 l-5,15 l-16,0 l-5,-15 Z`, INK, INK, 2), ...[[-90], [-18], [54], [126], [198]].map(([a]) => { const r = a * Math.PI / 180; return L(`M${f1(cx + 52 + Math.cos(r) * 16)},${f1(top + 110 + Math.sin(r) * 16)} L${f1(cx + 52 + Math.cos(r) * 30)},${f1(top + 110 + Math.sin(r) * 30)}`, 3); })],
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top + 130, 30), B.arm(1, B.cx + 176, B.top - 40, -20)] }),
    props: ({ cx, top }) => { const x = cx - 150, y = top + 150; return [`<g transform="translate(${x},${y}) scale(1.3) translate(${-x},${-y})">`, P(`M${x - 74},${y - 30} L${x + 74},${y - 30} L${x + 62},${y + 40} L${x - 62},${y + 40} Z`, '#e8f6ff', INK, 6), L(`M${x - 66},${y + 6} L${x + 66},${y + 6}`, 3, '#a9cfe6'),
      ...[-48, -16, 16, 48].map((t, i) => wedge(x + t, y - 34, 20, 180 + (i % 2 ? 12 : -12))), ...[-48, -16, 16, 48].map((t, i) => wedge(x + t + 4, y - 12, 20, 180 + (i % 2 ? -10 : 10))), rect(x - 80, y - 34, 160, 14, '#5aa0e0', 4, 6), '</g>', fist(cx - 140, top + 130 - 20, 15)]; },
    over: ({ cx, top }) => { const x = cx + 180, y0 = top - 40, yt = top - 340; return [tubeD(`M${x - 4},${y0 + 40} L${x + 4},${yt}`, WOODD, 8), P(`M${x + 2},${yt + 4} L${x - 112},${yt + 40} L${x + 2},${yt + 80} Z`, RED, INK, 6), txt(x - 36, yt + 52, 'GO!', 28, '#fff', 6), circ(x + 4, yt - 4, 8, GOLD, 3), fist(x - 2, y0, 18)]; } },

  { name: 'newdad', label: 'New Dad', form: 'standard', coat: '#9aa5b4', face: 'tired',
    hat: ({ cx, hy }) => [fillPts([[cx - 98, hy - 50], [cx - 100, hy - 96], [cx - 70, hy - 120], [cx - 60, hy - 150], [cx - 30, hy - 128], [cx - 10, hy - 166], [cx + 16, hy - 128], [cx + 50, hy - 158], [cx + 60, hy - 118], [cx + 100, hy - 128], [cx + 96, hy - 92], [cx + 104, hy - 50], [cx + 70, hy - 76], [cx, hy - 84], [cx - 70, hy - 76]], '#6e4527', 6),
      L(`M${cx - 40},${hy - 100} q20,-10 40,0`, 3.4, '#4a2c16')],
    details: ({ cx, top }) => [...[-1, 1].map(s => L(`M${cx + s * 66},${top - 4} L${cx + s * 90},${top + 300}`, 30, INK)), ...[-1, 1].map(s => L(`M${cx + s * 66},${top - 4} L${cx + s * 90},${top + 300}`, 20, '#4f6b8f')),
      P(`M${cx - 130},${top + 40} Q${cx - 60},${top + 30} ${cx - 40},${top + 70} L${cx - 70},${top + 110} Q${cx - 100},${top + 80} ${cx - 140},${top + 90} Z`, '#f3efe6', INK, 3.5), ...[0, 1, 2].map(k => circ(cx - 110 + k * 22, top + 66 + k * 6, 4, '#8fd3f4', 1.6))],
    behind: ({ cx, top }) => [rect(cx + 110, top + 220, 120, 110, '#7a9a5a', 5, 14), L(`M${cx + 130},${top + 220} Q${cx + 170},${top + 100} ${cx + 210},${top + 220}`, 8), circ(cx + 170, top + 270, 18, '#f3efe6', 3.4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 220, 20), B.arm(1, B.cx + 132, B.top + 60, -50)] }),
    props: ({ cx, top }) => { const by = top + 92, o = [];
      o.push(P(`M${cx - 96},${by + 36} Q${cx},${by + 20} ${cx + 96},${by + 36} L${cx + 84},${by + 200} Q${cx},${by + 236} ${cx - 84},${by + 200} Z`, '#4f6b8f', INK, 6));
      o.push(miniHead(BABY.giggle, cx, by - 8, .56), P(`M${cx - 96},${by + 36} Q${cx},${by + 20} ${cx + 96},${by + 36} L${cx + 92},${by + 80} Q${cx},${by + 64} ${cx - 92},${by + 80} Z`, '#4f6b8f', INK, 6), L(`M${cx - 70},${by + 120} Q${cx},${by + 136} ${cx + 70},${by + 120}`, 3.4, '#36506f'));
      o.push(...[-1, 1].map(s => P(`M${cx + s * 70},${by + 76} q${s * 24},40 ${s * 44},44`, 'none', INK, 9)), ...[-1, 1].map(s => fist(cx + s * 116, by + 120, 11)));
      o.push(rect(cx - 170, top + 196, 40, 60, '#e9f6ff', 5, 10), rect(cx - 166, top + 176, 32, 22, '#8fd3f4', 4, 6), P(`M${cx - 158},${top + 176} q8,-26 16,0 Z`, '#f3c58a', INK, 3.4), L(`M${cx - 164},${top + 224} l20,0 M${cx - 164},${top + 238} l20,0`, 2.4, '#a9cfe6'), fist(cx - 150, top + 220, 15));
      return o; },
    over: ({ cx, top }) => { const x = cx + 150, y = top + 40; return [rect(x - 40, y - 60, 80, 96, '#fff', 6, 12), P(`M${x + 40},${y - 40} q40,0 40,30 q0,30 -40,30`, 'none', INK, 12), P(`M${x + 40},${y - 40} q40,0 40,30 q0,30 -40,30`, 'none', '#fff', 5), rect(x - 40, y - 34, 80, 30, '#c98a3c', 0, 0), L(`M${x - 40},${y - 34} l80,0 M${x - 40},${y - 4} l80,0`, 3.4), rect(x - 40, y - 60, 80, 96, 'none', 6, 12),
      ...[0, 1, 2].map(k => L(`M${x - 22 + k * 22},${y - 74} q-10,-14 0,-28 q10,-14 0,-28`, 4, '#b9b2c4')), fist(x - 18, y + 20, 16)]; } },

  { name: 'knitgran', label: 'Knitting Grandma', form: 'elder', coat: '#d0607e', face: ['elder', 'sweetSmile'], hair: 'granny',
    details: ({ cx, top }) => [P(`M${cx - 30},${top} L${cx},${top + 280} L${cx + 30},${top} Z`, '#f3efe6', INK, 4), ...[0, 1, 2, 3].map(k => circ(cx + 34, top + 80 + k * 50, 8, '#f3efe6', 3)),
      ...[-1, 1].map(s => rect(cx + s * 100 - 34, top + 180, 68, 60, '#b84a68', 4, 6)), P(`M${cx - 120},${top + 172} q10,-20 24,-6 q10,-18 24,0`, '#fff', INK, 3),
      ...[...Array(9)].map((_, k) => circ(cx - 64 + k * 16, top + 20 + Math.sin(k / 8 * Math.PI) * 30, 7, '#fff', 2.4))],
    arms: B => ({ front: [B.arm(-1, B.cx - 70, B.top + 120, 30), B.arm(1, B.cx + 76, B.top + 110, -30)] }),
    props: ({ cx, top }) => { const y = top + 116, o = [];
      // scarf hanging from the needles all the way down and pooling on the floor
      const S = [[cx - 40, y + 10], [cx + 40, y + 10], [cx + 46, y + 300], [cx + 42, 860], [cx + 60, 960], [cx + 200, 990], [cx + 210, 1008], [cx + 20, 1008], [cx - 20, 940], [cx - 38, 820], [cx - 44, y + 300]];
      o.push(P(smooth(S), '#5aa0e0', INK, 6));
      o.push(`<clipPath id="s13scarf"><path d="${smooth(S)}"/></clipPath><g clip-path="url(#s13scarf)">`); for (let k = 0; k < 13; k++) { const yy = y + 50 + k * 66; o.push(L(`M${cx - 80},${yy - 10} Q${cx + 40},${yy + 20} ${cx + 230},${yy + (yy > 900 ? 60 : 0)}`, 16, k % 2 ? GOLD : '#f3efe6')); } o.push('</g>');
      o.push(P(smooth(S), 'none', INK, 6), ...[cx + 110, cx + 140, cx + 170].map(x => L(`M${x},${1004} l-6,14 M${x + 10},${1004} l2,14`, 4, '#5aa0e0')));
      o.push(tubeD(`M${cx - 168},${y - 110} L${cx + 20},${y + 30}`, '#e8d9b0', 8), tubeD(`M${cx + 168},${y - 116} L${cx - 20},${y + 30}`, '#e8d9b0', 8), circ(cx - 168, y - 110, 11, RED, 3.4), circ(cx + 168, y - 116, 11, RED, 3.4), fist(cx - 70, top + 120, 15), fist(cx + 76, top + 110, 15));
      // giant yarn ball at her feet, thread up to the needles
      const bx = cx - 156, by = 920;
      o.push(L(`M${cx - 30},${y + 20} Q${cx - 200},${y + 200} ${bx + 30},${by - 70}`, 4, '#c94a5f'), circ(bx, by, 86, '#e05a78', 7));
      for (const [a, b] of [[-60, 40], [-40, 60], [-20, 70], [20, 70], [50, 50]]) o.push(L(`M${bx + a},${by - 60 + Math.abs(a) * .2} Q${bx + a * .2},${by} ${bx + b * .6},${by + 64}`, 4, '#b8405e'));
      o.push(L(`M${bx - 66},${by + 10} Q${bx},${by - 30} ${bx + 70},${by - 10}`, 4, '#b8405e'), hl(`M${bx - 50},${by - 40} Q${bx - 30},${by - 62} ${bx},${by - 66}`, 8, .45));
      return o; } },

  { name: 'fishgramps', label: 'Fishing Grandpa', form: 'elder', coat: '#7d8f4e', face: ['elder', 'proudTears'], hair: 'gramps',
    hat: ({ cx, hy }) => { const K = '#c9b27a', o = [];
      o.push(P(`M${cx - 150},${hy - 30} Q${cx - 120},${hy - 70} ${cx - 86},${hy - 76} L${cx + 86},${hy - 76} Q${cx + 120},${hy - 70} ${cx + 150},${hy - 30} Q${cx},${hy - 10} ${cx - 150},${hy - 30} Z`, K, INK, 6));
      o.push(fillPts([[cx - 90, hy - 66], [cx - 82, hy - 136], [cx - 40, hy - 160], [cx + 40, hy - 160], [cx + 82, hy - 136], [cx + 90, hy - 66], [cx, hy - 56]], K, 7), rect(cx - 90, hy - 92, 180, 22, '#6e5a3a', 5, 4), hl(`M${cx - 66},${hy - 130} Q${cx - 30},${hy - 154} ${cx + 20},${hy - 152}`, 8, .45));
      o.push(...[-110, -70, 70, 110].map((t, i) => L(`M${cx + t},${hy - 40 + Math.abs(t) * .08} l${i < 2 ? -2 : 2},10`, 3, '#9a8656')));
      o.push(P(`M${cx + 30},${hy - 128} l28,-8 l10,14 l-28,8 Z`, RED, INK, 3), P(`M${cx + 58},${hy - 136} l10,14`, 'none', '#fff', 0), L(`M${cx + 40},${hy - 112} q-4,10 4,14`, 3, SILVER));
      o.push(P(`M${cx - 50},${hy - 140} q10,-14 24,-4 l-6,18 Z`, GOLD, INK, 3), L(`M${cx - 44},${hy - 124} q6,10 0,16`, 3, SILVER));
      return [`<g transform="translate(0,-30)">`, ...o, '</g>']; },
    details: ({ cx, top }) => [rect(cx - 200, top, 400, 300, '#c94a4a', 0, 0), ...[-90, -45, 0, 45, 90].map(t => L(`M${cx + t},${top} L${cx + t},${top + 300}`, 6, '#9c2f33')), ...[30, 90, 150, 210].map(t => L(`M${cx - 200},${top + t} L${cx + 200},${top + t}`, 6, '#9c2f33')),
      ...[-1, 1].map(s => P(`M${cx + s * 30},${top} L${cx + s * 200},${top} L${cx + s * 200},${top + 300} L${cx + s * 30},${top + 300} Z`, '#7d8f4e', INK, 4)),
      ...[-1, 1].flatMap(s => [rect(cx + s * 80 - 34, top + 70, 68, 56, '#6b7c40', 3.6, 4), rect(cx + s * 80 - 34, top + 150, 68, 56, '#6b7c40', 3.6, 4), L(`M${cx + s * 80 - 34},${top + 86} l68,0 M${cx + s * 80 - 34},${top + 166} l68,0`, 3)])],
    arms: B => ({ front: [B.arm(-1, B.cx - 110, B.top + 130, 30), B.arm(1, B.cx + 128, B.top + 180, -10)] }),
    props: ({ cx, top }) => { const x = cx + 156, y = 960; return [rect(x - 64, y - 50, 128, 66, '#4f9a3a', 6, 6), rect(x - 64, y - 64, 128, 22, '#3f7a2c', 5, 6), rect(x - 16, y - 76, 32, 14, STEEL, 3.4, 4), circ(x, y - 20, 7, STEEL, 2.6)]; },
    over: ({ cx, top }) => { const x = cx - 110, y = top + 130, tx = cx - 238, ty = -20, fx = cx - 204, fy = 540;
      return [L(`M${x + 30},${y + 70} Q${cx - 222},${y - 40} ${tx},${ty}`, 15, INK), L(`M${x + 30},${y + 70} Q${cx - 222},${y - 40} ${tx},${ty}`, 7, '#3a5f8f'), rect(x - 6, y + 20, 30, 50, '#3b393f', 4, 6), circ(x + 26, y + 30, 16, SILVER, 4), L(`M${x + 26},${y + 30} l10,-8`, 3),
        L(`M${tx},${ty} Q${tx + 6},${ty + 200} ${fx},${fy - 40}`, 2.4), circ(fx, fy - 60, 7, RED, 2.4),
        `<g transform="translate(${fx},${fy}) scale(1.35) translate(${-fx},${-fy}) rotate(-70 ${fx} ${fy + 40})">${P(`M${fx - 70},${fy + 40} Q${fx - 20},${fy - 10} ${fx + 40},${fy + 40} L${fx + 80},${fy + 10} L${fx + 76},${fy + 70} L${fx + 40},${fy + 40} Q${fx - 20},${fy + 90} ${fx - 70},${fy + 40} Z`, '#8fb8d0', INK, 5)}${circ(fx - 44, fy + 32, 7, '#fff', 2.6)}${ell(fx - 44, fy + 32, 3, 3, INK)}${L(`M${fx - 16},${fy + 20} q10,20 0,40`, 3, '#5a86a0')}${L(`M${fx - 30},${fy + 50} q10,6 16,0`, 3)}</g>`,
        ...[[-30, -50], [40, -40], [-50, 20], [50, 30]].map(([dx, dy]) => drop(fx + dx, fy + 40 + dy, 7)), fist(x, y, 15)]; } },
];
