// SHEET 12 — BABIES, TODDLERS AND KIDS
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4, star5, heart, drop } from '../castkit.mjs';
export const TITLE = 'Cast sheet 12: Babies, toddlers and kids';

// ---------- local helpers ----------
const T = (x, y, s, size = 30, rot = 0, fill = INK) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}" transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
const rot = (a, x, y, s) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${[].concat(s).join('')}</g>`;
// crescent band hugging the head (bonnets, hoods): outer arc + inner arc, open at the bottom so no stroke crosses the face
const band = (cx, hy, ro, ri, yb, col, sw = 6) => P(`M${cx - ro},${hy + yb} C${cx - ro * 1.16},${hy - ro * .5} ${cx - ro * .7},${hy - ro * 1.16} ${cx},${hy - ro * 1.16} C${cx + ro * .7},${hy - ro * 1.16} ${cx + ro * 1.16},${hy - ro * .5} ${cx + ro},${hy + yb} L${cx + ri},${hy + yb - 6} C${cx + ri * 1.06},${hy - ri * .5} ${cx + ri * .62},${hy - ri * .92} ${cx},${hy - ri * .92} C${cx - ri * .62},${hy - ri * .92} ${cx - ri * 1.06},${hy - ri * .5} ${cx - ri},${hy + yb - 6} Z`, col, INK, sw);
const scoop = (x, y, r, col, dark) => P(`M${x - r},${y + r * .2} Q${x - r * 1.05},${y - r * .95} ${x},${y - r} Q${x + r * 1.05},${y - r * .95} ${x + r},${y + r * .2} q${-r * .25},${r * .3} ${-r * .45},0 q${-r * .3},${r * .4} ${-r * .6},0 q${-r * .3},${r * .35} ${-r * .55},0 q${-r * .2},${r * .25} ${-r * .4},0 Z`, col, INK, 5) + hl(`M${x - r * .6},${y - r * .35} Q${x - r * .5},${y - r * .75} ${x - r * .1},${y - r * .8}`, 7, .55);
const cookieBox = (x, y, w, h, col, a = 0) => rot(a, x + w / 2, y + h / 2, [rect(x, y, w, h, col, 5, 5), rect(x + 8, y + 8, w - 16, h - 16, 'none', 0, 3).replace(/stroke="[^"]*"/, '').replace('stroke-width="0"', 'stroke="#fff" stroke-opacity=".5" stroke-width="3"'), circ(x + w * .3, y + h / 2, h * .26, '#c98a4a', 3.4), ...[[-.4, -.3], [.3, -.1], [-.1, .35]].map(([dx, dy]) => ell(x + w * .3 + dx * h * .26, y + h / 2 + dy * h * .26, 3.4, 3, '#5a3418')), rect(x + w * .55, y + h * .3, w * .32, h * .14, '#fff', 0, 2), rect(x + w * .55, y + h * .56, w * .22, h * .12, '#fff', 0, 2)]);
const badge = (x, y, r, col, inner) => circ(x, y, r, col, 3.4) + circ(x, y, r * .55, inner, 2.4);
const motion = (x, y, s = 1, n = 3, len = 30) => [...Array(n)].map((_, k) => L(`M${x},${y + k * 16} l${s * len * (1 - k * .2)},0`, 4.5)).join('');

const PINK = '#f6a8c8', SKYB = '#bfe0f5', BLUEB = '#7fb3e0', MINT = '#9fe0c0', CHOC = '#8a5a3a', CONE = '#e8b46a';

export const CAST = [
  // 1 TOWEL HERO — bath-towel cape billowing, swim goggles, toilet-plunger "sword" raised
  { name: 'towelhero', label: 'Towel Hero', form: 'kid', coat: '#3f7fd0', face: 'proud',
    hat: ({ cx, hy }) => { const g = [L(`M${cx - 104},${hy - 52} Q${cx},${hy - 84} ${cx + 104},${hy - 52}`, 13, INK), L(`M${cx - 104},${hy - 52} Q${cx},${hy - 84} ${cx + 104},${hy - 52}`, 7, '#2fb3a8'),
      ...[-1, 1].flatMap(s => [ell(cx + s * 38, hy - 76, 32, 26, '#2fb3a8', INK, 6), ell(cx + s * 38, hy - 76, 21, 16, '#bdf2f0', INK, 4), hl(`M${cx + s * 38 - 12},${hy - 82} q6,-8 14,-8`, 5, .9)]), rect(cx - 8, hy - 82, 16, 10, '#2fb3a8', 3.4, 3),
      P(`M${cx - 70},${hy - 96} L${cx - 84},${hy - 150} L${cx - 40},${hy - 118} L${cx - 20},${hy - 172} L${cx + 10},${hy - 122} L${cx + 44},${hy - 160} L${cx + 50},${hy - 112} L${cx + 92},${hy - 128} L${cx + 76},${hy - 90} Q${cx},${hy - 112} ${cx - 70},${hy - 96} Z`, '#3a2a22', INK, 5)]; return [g.pop(), ...g]; },
    behind: ({ cx, top }) => { const o = [];
      const d = `M${cx - 40},${top + 6} Q${cx - 120},${top - 60} ${cx - 200},${top - 200} Q${cx - 250},${top - 100} ${cx - 240},${top + 20} Q${cx - 250},${top + 120} ${cx - 220},${top + 230} Q${cx - 170},${top + 250} ${cx - 140},${top + 280} Q${cx - 100},${top + 200} ${cx - 20},${top + 120} Z`;
      o.push(P(d, '#f2c230', INK, 6));
      for (const k of [0, 1, 2]) o.push(L(`M${cx - 200 + k * 8},${top - 170 + k * 28} Q${cx - 120},${top - 20 + k * 30} ${cx - 50},${top + 20 + k * 22}`, 9, k % 2 ? '#fff' : '#e0453a'));
      o.push(L(`M${cx - 220},${top + 200} Q${cx - 170},${top + 220} ${cx - 140},${top + 250}`, 9, '#e0453a'), L(`M${cx - 216},${top + 180} Q${cx - 160},${top + 196} ${cx - 126},${top + 226}`, 9, '#fff'), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${cx - 222 + k * 16},${top + 234 + k * 9} l-6,18`, 4)), hl(`M${cx - 226},${top - 40} Q${cx - 236},${top + 60} ${cx - 214},${top + 160}`, 9, .4));
      return o; },
    details: ({ cx, top }) => [ell(cx, top + 70, 44, 40, '#f2c230', INK, 4), P(`M${cx - 22},${top + 82} q-6,-26 14,-30 q6,-16 20,-6 q10,8 -2,16 q22,0 16,24 q-20,16 -48,-4 Z`, '#ffd84a', INK, 3.4), P(`M${cx + 12},${top + 60} l14,2 l-12,7 Z`, '#f08a2a', INK, 2.4), ell(cx + 8, top + 55, 2.6, 2.6, INK),
      `<rect x="${cx - 100}" y="${top + 160}" width="200" height="70" fill="#e0453a"/>`, L(`M${cx - 80},${top + 160} L${cx + 80},${top + 160}`, 4), rect(cx - 16, top + 150, 32, 20, GOLD, 3.4, 4), P(`M${cx - 30},${top} Q${cx},${top + 26} ${cx + 30},${top}`, '#f2c230', INK, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 70, B.top + 130, 36), B.arm(1, B.cx + 160, B.top - 80, -10)] }),
    over: ({ cx, top }) => { const x = cx + 160, y = top - 80; return [pole(x + 10, y + 70, x + 30, y - 300, '#c98a4a', 15), P(`M${x - 46},${y - 290} Q${x - 40},${y - 390} ${x + 30},${y - 394} Q${x + 100},${y - 390} ${x + 106},${y - 290} Q${x + 30},${y - 270} ${x - 46},${y - 290} Z`, '#e0453a', INK, 7), ell(x + 30, y - 290, 76, 14, '#b8322a', INK, 5), hl(`M${x - 26},${y - 310} Q${x - 22},${y - 360} ${x + 14},${y - 376}`, 9, .5), fist(x, y, 16), star4(x - 60, y - 380, 20, '#fff'), star4(x - 70, y - 320, 12, '#fff'), fist(cx - 70, top + 130, 14)]; } },

  // 2 NEWBORN — stork-delivery swaddle bundle with a knot on top, frilly bonnet
  { name: 'newborn', label: 'Newborn', form: 'baby', coat: SKYB, face: ['baby', 'yawn'],
    hat: ({ cx, hy }) => [band(cx, hy, 126, 100, 48, SKYB, 6), cloud([...Array(11)].map((_, k) => { const a = Math.PI * (1.0 + k / 10); return [cx + Math.cos(a) * 104, hy - 4 + Math.sin(a) * 96, 13]; }), '#fff', 4),
      L(`M${cx - 70},${hy - 112} Q${cx},${hy - 134} ${cx + 70},${hy - 112}`, 3, '#8fbedf'), L(`M${cx + 112},${hy + 46} q4,26 -6,44`, 7, INK), L(`M${cx + 112},${hy + 46} q4,26 -6,44`, 3, BLUEB),
      P(`M${cx + 106},${hy + 92} q-34,-22 -30,6 q4,22 30,-6 Z M${cx + 106},${hy + 92} q34,-26 32,4 q-4,24 -32,-4 Z`, BLUEB, INK, 4), circ(cx + 106, hy + 92, 7, BLUEB, 3.4)],
    behind: ({ cx }) => { const k = 440; return [P(`M${cx - 116},${940} Q${cx - 250},${700} ${cx - 34},${k + 12} L${cx + 34},${k + 12} Q${cx + 250},${700} ${cx + 116},${940} Z`, CREAM, INK, 6),
      ...[-1, 1].flatMap(s => [L(`M${cx + s * 170},${790} Q${cx + s * 130},${600} ${cx + s * 30},${k + 30}`, 3.4, '#cfc6b0'), L(`M${cx + s * 110},${640} Q${cx + s * 70},${540} ${cx + s * 14},${k + 30}`, 3.4, '#cfc6b0')]),
      ...[[cx - 190, 520, -30], [cx + 200, 600, 25], [cx - 150, 400, 10]].map(([fx, fy, a]) => rot(a, fx, fy, [P(`M${fx},${fy - 30} Q${fx + 18},${fy} ${fx},${fy + 30} Q${fx - 18},${fy} ${fx},${fy - 30} Z`, '#fff', INK, 3.4), L(`M${fx},${fy - 24} L${fx},${fy + 40}`, 2.6)])),
      P(`M${cx - 20},${k} Q${cx - 70},${k - 60} ${cx - 92},${k - 40} Q${cx - 80},${k + 6} ${cx - 20},${k + 14} Z M${cx + 20},${k} Q${cx + 70},${k - 60} ${cx + 92},${k - 40} Q${cx + 80},${k + 6} ${cx + 20},${k + 14} Z`, CREAM, INK, 5),
      ell(cx, k + 4, 34, 28, '#ece4d2', INK, 6), L(`M${cx - 14},${k - 8} q14,10 28,0`, 3, '#cfc6b0'),
      L(`M${cx + 24},${k + 20} Q${cx + 100},${k + 30} ${cx + 150},${k + 70}`, 3), rot(14, cx + 170, k + 100, [P(`M${cx + 140},${k + 70} L${cx + 210},${k + 70} L${cx + 210},${k + 130} L${cx + 140},${k + 130} L${cx + 126},${k + 100} Z`, '#fff', INK, 4.5), heart(cx + 178, k + 100, 16, '#f05a78')]),
      L(`M${cx - 196},${880} q-14,30 0,60 M${cx - 220},${870} q-16,40 0,80 M${cx + 196},${880} q14,30 0,60 M${cx + 220},${870} q16,40 0,80`, 4)]; },
    arms: () => ({ front: [] }),
    props: ({ cx }) => [fillPts([[cx - 66, 846], [cx - 112, 870], [cx - 128, 930], [cx - 104, 985], [cx, 1004], [cx + 104, 985], [cx + 128, 930], [cx + 112, 870], [cx + 66, 846], [cx, 860]], CREAM, 6),
      L(`M${cx - 98},${880} Q${cx},${906} ${cx + 98},${880}`, 9, BLUEB), L(`M${cx - 104},${898} Q${cx},${924} ${cx + 104},${898}`, 6, '#f29ab8'),
      L(`M${cx - 112},${950} Q${cx},${980} ${cx + 112},${950}`, 9, BLUEB), L(`M${cx - 104},${968} Q${cx},${996} ${cx + 104},${968}`, 6, '#f29ab8'),
      L(`M${cx - 118},${910} Q${cx - 20},${930} ${cx + 60},${998}`, 4.5), hl(`M${cx - 106},${900} Q${cx - 112},${940} ${cx - 90},${972}`, 7, .5)] },

  // 3 BACKPACK SCHOOLBOY — dwarfed by a backpack three times his size, ruler and pencil sticking out
  { name: 'backpack', label: 'First Day of School', form: 'kid', coat: '#f4f2ee', face: 'strain',
    hat: ({ cx, hy }) => [P(`M${cx - 92},${hy - 70} Q${cx - 60},${hy - 128} ${cx},${hy - 130} Q${cx + 70},${hy - 128} ${cx + 98},${hy - 66} Q${cx + 40},${hy - 96} ${cx - 10},${hy - 92} Q${cx - 60},${hy - 90} ${cx - 92},${hy - 70} Z`, '#8a5a2b', INK, 5)],
    behind: ({ cx }) => { const o = [], x = cx, y0 = 300, y1 = 930;
      o.push(pole(x - 120, y0 + 30, x - 150, y0 - 140, '#f2c230', 26), P(`M${x - 158},${y0 - 136} l7,-40 l20,36 Z`, '#f3d9b0', INK, 4), L(`M${x - 162},${y0 - 30} l26,4 M${x - 160},${y0 - 70} l26,4 M${x - 156},${y0 - 110} l20,3`, 3),
        rect(x + 60, y0 - 150, 48, 200, '#f4ec9a', 5, 4), ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => L(`M${x + 60},${y0 - 130 + k * 22} l${k % 2 ? 14 : 22},0`, 3)), rot(-8, x - 30, y0, rect(x - 70, y0 - 90, 80, 120, '#d8473c', 5, 4)));
      o.push(P(`M${x - 200},${y0 + 80} Q${x - 206},${y0 - 20} ${x},${y0 - 26} Q${x + 206},${y0 - 20} ${x + 200},${y0 + 80} L${x + 214},${y1 - 40} Q${x + 210},${y1} ${x + 160},${y1} L${x - 160},${y1} Q${x - 210},${y1} ${x - 214},${y1 - 40} Z`, '#d8473c', INK, 7),
        L(`M${x - 170},${y0 + 40} Q${x},${y0 - 6} ${x + 170},${y0 + 40}`, 5, '#a82e26'), L(`M${x - 170},${y0 + 40} Q${x},${y0 - 6} ${x + 170},${y0 + 40}`, 2, GOLD), rot(-20, x + 120, y0 + 30, [rect(x + 112, y0 + 26, 14, 34, GOLD, 3.4, 4)]),
        hl(`M${x - 186},${y0 + 90} Q${x - 196},${y0 + 300} ${x - 188},${y0 + 560}`, 12, .35));
      for (const s of [-1, 1]) o.push(P(`M${x + s * 206},${y1 - 260} q${s * 40},0 ${s * 40},40 l0,170 q0,30 ${-s * 40},30 Z`, '#a82e26', INK, 5), ell(x + s * 226, y1 - 262, 18, 10, '#7ad0f0', INK, 4), rect(x + s * 226 - 12, y1 - 330, 24, 70, '#7ad0f0', 4, 6));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 26},${top} L${cx},${top + 40} L${cx + 26},${top} Z`, '#2f5fae', INK, 3.4), ...[-1, 1].map(s => P(`M${cx + s * 50},${top - 6} L${cx + s * 30},${top + 210} L${cx + s * 54},${top + 210} L${cx + s * 76},${top + 4} Z`, '#a82e26', INK, 4)), ...[-1, 1].map(s => rect(cx + s * 42 - 12, top + 100, 24, 16, STEEL, 3, 3)),
      `<rect x="${cx - 100}" y="${top + 160}" width="200" height="70" fill="#3b5fa8"/>`, L(`M${cx - 80},${top + 160} L${cx + 80},${top + 160}`, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 40, B.top + 90, 40), B.arm(1, B.cx + 40, B.top + 90, -40)] }),
    props: ({ cx, top }) => [fist(cx - 40, top + 90, 14), fist(cx + 40, top + 90, 14), drop(cx - 190, 420, 12, '#8fd0f0'), drop(cx + 196, 470, 10, '#8fd0f0'), L(`M${cx - 60},${1000} l-20,8 M${cx + 60},${1000} l20,8`, 4)] },

  // 4 TODDLER PRINCESS — giant plastic tiara, star wand, puffy tutu, hmph
  { name: 'princess', label: 'Toddler Princess', form: 'toddler', coat: PINK, face: ['baby', 'pout'],
    headBack: ({ cx, hy }) => [cloud([[cx - 104, hy - 20, 26], [cx - 118, hy + 14, 24], [cx - 108, hy + 46, 22], [cx + 104, hy - 20, 26], [cx + 118, hy + 14, 24], [cx + 108, hy + 46, 22]], '#f6d25a', 4.5)],
    hat: ({ cx, hy }) => { const o = [], pk = '#e86bb0', g = [[-88, -96, 40], [-46, -116, 64], [0, -122, 110], [46, -116, 64], [88, -96, 40]];
      o.push(P(`M${cx - 106},${hy - 70} ${g.map(([dx, dy, h]) => `L${cx + dx - 18},${hy + dy + 10} L${cx + dx},${hy + dy - h} L${cx + dx + 18},${hy + dy + 10}`).join(' ')} L${cx + 106},${hy - 70} Q${cx},${hy - 112} ${cx - 106},${hy - 70} Z`, '#c8a8f0', INK, 6));
      o.push(P(`M${cx - 106},${hy - 70} Q${cx},${hy - 116} ${cx + 106},${hy - 70} L${cx + 102},${hy - 54} Q${cx},${hy - 98} ${cx - 102},${hy - 54} Z`, pk, INK, 5));
      for (const [dx, dy, h] of g) o.push(circ(cx + dx, hy + dy - h, h > 60 ? 12 : 8, h > 100 ? '#f05a78' : '#7ad0f0', 3.4));
      o.push(heart(cx, hy - 160, 24, '#f05a78'), ...[-60, -30, 30, 60].map(t => circ(cx + t, hy - 76 - (60 - Math.abs(t)) * .25, 6, '#fff', 2.6)), star4(cx - 70, hy - 210, 14, '#fff'), star4(cx + 80, hy - 190, 10, '#fff'), hl(`M${cx - 30},${hy - 150} L${cx - 8},${hy - 210}`, 4, .7));
      return o; },
    keepFormDetails: false,
    details: ({ cx, top }) => [P(`M${cx - 60},${top} Q${cx},${top + 40} ${cx + 60},${top}`, '#fff', INK, 3.4), ...[0, 1, 2].map(k => star4(cx - 30 + k * 30, top + 70 + (k % 2) * 16, 8, '#fff')), L(`M${cx - 90},${top + 92} Q${cx},${top + 108} ${cx + 90},${top + 92}`, 10, '#e86bb0')],
    behind: ({ cx, top }) => [...[-1, 1].map(s => cloud([[cx + s * 56, top + 22, 26], [cx + s * 78, top + 36, 22]], '#f8c4dc', 4.5))],
    arms: B => ({ front: [B.arm(-1, B.cx - 112, B.top + 70, 24), B.arm(1, B.cx + 140, B.top - 70, -20)] }),
    props: ({ cx, top }) => { const y = top + 100, o = [];
      const sk = [...Array(9)].map((_, k) => [cx - 170 + k * 42.5, y + 76 + (k % 2) * 10, 30]);
      o.push(cloud([[cx - 110, y + 30, 40], [cx - 60, y + 22, 44], [cx, y + 20, 46], [cx + 60, y + 22, 44], [cx + 110, y + 30, 40], ...sk], '#f8c4dc', 5));
      o.push(...[-120, -60, 0, 60, 120].map(t => L(`M${cx + t},${y + 30} l${t * .2},40`, 2.6, '#e88ab8')), ...[-130, -40, 50, 140].map((t, i) => star4(cx + t, y + 60 + (i % 2) * 14, 7, '#fff')), fist(cx - 112, top + 70, 13));
      return o; },
    over: ({ cx, top }) => { const x = cx + 140, y = top - 70; return [pole(x, y + 20, x + 50, y - 270, '#f8c4dc', 9), star5(x + 56, y - 300, 54, '#ffd84a'), hl(`M${x + 34},${y - 310} l14,-26`, 5, .8), circ(x + 56, y - 300, 10, '#f05a78', 3), L(`M${x + 50},${y - 250} q30,20 10,60 M${x + 50},${y - 250} q-10,30 -40,40`, 5, '#e86bb0'), star4(x - 30, y - 340, 16, '#fff'), star4(x + 100, y - 230, 12, '#fff'), star4(x - 40, y - 250, 9, '#fff'), fist(x, y, 13)]; } },

  // 5 SCOUT GIRL — badge sash, beret, teetering tower of cookie boxes
  { name: 'scout', label: 'Cookie Scout', form: 'kid', coat: '#4f8a4a', face: ['female', 'smug'], head: 'egg',
    headBack: ({ cx, hy }) => [fillPts([[cx - 108, hy - 40], [cx - 124, hy + 50], [cx - 112, hy + 112], [cx - 70, hy + 96], [cx, hy - 104], [cx + 70, hy + 96], [cx + 112, hy + 112], [cx + 124, hy + 50], [cx + 108, hy - 40], [cx, hy - 130]], '#8a4a24', 6)],
    hat: ({ cx, hy }) => [P(`M${cx - 98},${hy - 50} Q${cx - 70},${hy - 116} ${cx},${hy - 118} Q${cx + 64},${hy - 116} ${cx + 92},${hy - 60} Q${cx + 40},${hy - 70} ${cx + 10},${hy - 50} Q${cx - 40},${hy - 72} ${cx - 98},${hy - 50} Z`, '#8a4a24', INK, 5),
      P(`M${cx - 120},${hy - 84} Q${cx - 110},${hy - 160} ${cx - 10},${hy - 166} Q${cx + 100},${hy - 166} ${cx + 130},${hy - 110} Q${cx + 110},${hy - 82} ${cx + 40},${hy - 92} Q${cx - 50},${hy - 98} ${cx - 120},${hy - 84} Z`, '#3f7a3a', INK, 6), circ(cx - 4, hy - 170, 9, '#3f7a3a', 4), badge(cx + 66, hy - 120, 15, GOLD, '#d8473c'), hl(`M${cx - 90},${hy - 118} Q${cx - 60},${hy - 150} ${cx - 10},${hy - 152}`, 7, .4)],
    details: ({ cx, top }) => [P(`M${cx - 40},${top} L${cx},${top + 50} L${cx + 40},${top} Z`, '#f2c230', INK, 3.4),
      P(`M${cx + 50},${top - 10} L${cx + 84},${top + 10} L${cx - 70},${top + 220} L${cx - 104},${top + 200} Z`, '#e9d9a6', INK, 4),
      ...[[34, 30, '#d8473c', '#fff'], [8, 66, '#2f8fd0', GOLD], [-18, 102, '#f2c230', '#3f7a3a'], [-44, 138, '#e86bb0', '#fff'], [-68, 172, '#7ad0f0', '#d8473c']].map(([dx, dy, a, b]) => badge(cx + dx + 30, top + dy, 11, a, b)),
      `<rect x="${cx - 100}" y="${top + 160}" width="200" height="70" fill="#3f6a3a"/>`, L(`M${cx - 80},${top + 160} L${cx + 80},${top + 160}`, 4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 150, 20), B.arm(1, B.cx - 40, B.top + 100, -10)] }),
    props: ({ cx, top }) => { const o = [], cols = ['#3fae5a', '#8a5cc4', '#e8743b', '#d8473c', '#2f8fd0', '#e86bb0', '#f2c230', '#3fae5a', '#8a5cc4', '#d8473c'], w = 112, h = 62, x0 = cx - 246;
      cols.forEach((c, k) => o.push(cookieBox(x0 + Math.sin(k * 1.3) * 6 + k * 1.5, top + 172 - (k + 1) * h, w, h, c, (k % 2 ? 3 : -3) * (k / 4))));
      o.push(L(`M${x0 + 10},${top + 172 - 10 * h - 20} q-14,-14 -4,-26 M${x0 + w + 4},${top + 172 - 10 * h - 10} q14,-14 4,-26`, 4), fist(cx - 120, top + 150, 14), fist(cx - 40, top + 100, 14));
      return o; } },

  // 6 TANTRUM TODDLER — ice cream on the floor, cone upside down, fists flying
  { name: 'tantrum', label: 'Meltdown Toddler', form: 'toddler', coat: '#f2c230', face: ['baby', 'tantrum'], keepFormDetails: true,
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top - 54, -16), B.arm(1, B.cx + 150, B.top - 66, 16)] }),
    props: ({ cx }) => { const x = cx + 150, g = 1004, o = [];
      o.push(P(`M${x - 120},${g - 4} Q${x - 132},${g - 46} ${x - 92},${g - 52} Q${x - 84},${g - 90} ${x - 40},${g - 80} Q${x - 10},${g - 116} ${x + 36},${g - 86} Q${x + 84},${g - 100} ${x + 90},${g - 52} Q${x + 112},${g - 40} ${x + 100},${g - 4} Z`, '#f6a8c8', INK, 6));
      o.push(cloud([[x - 76, g - 58, 26], [x - 44, g - 72, 24]], MINT, 4.5), cloud([[x + 44, g - 60, 26], [x + 70, g - 44, 20]], CHOC, 4.5), ell(x - 30, g - 14, 50, 8, '#fbd0e0'), ell(x + 64, g - 104, 7, 7, '#f6a8c8', INK, 3));
      o.push(rot(24, x, g - 70, [P(`M${x - 62},${g - 70} L${x + 62},${g - 70} L${x + 6},${g - 320} L${x - 6},${g - 320} Z`, CONE, INK, 7), ...[0, 1, 2, 3, 4].map(k => L(`M${x - 54 + k * 10},${g - 84 - k * 46} L${x + 46 - k * 10},${g - 92 - k * 48}`, 3.4, '#b07a34')), ...[0, 1, 2, 3].map(k => L(`M${x - 46 + k * 10},${g - 80 - k * 52} L${x + 6},${g - 190 - k * 30}`, 3.4, '#b07a34')), hl(`M${x - 40},${g - 96} L${x - 6},${g - 290}`, 6, .45)]), cloud([[x - 20, g - 74, 20], [x + 22, g - 70, 18]], PINK, 4.5));
      o.push(circ(x - 160, g - 22, 18, RED, 4), L(`M${x - 160},${g - 40} q4,-22 18,-30`, 4), ...[0, 1, 2].map(k => drop(x - 80 + k * 70, g - 160 - (k % 2) * 40, 10, [PINK, MINT, CHOC][k])));
      return o; },
    over: ({ cx }) => [L(`M${cx - 50},${1004} l-20,-10 M${cx - 60},${990} l-24,-4 M${cx + 50},${1004} l20,-10`, 4)] },

  // 7 JUMP ROPE GIRL — giant whirling rope loop, ginger pigtails flying up
  { name: 'jumprope', label: 'Jump Rope Girl', form: 'kid', coat: '#2fb3a8', face: ['female', 'fangirl'], head: 'egg',
    headBack: ({ cx, hy }) => { const o = [], OR = '#e07a2e';
      for (const s of [-1, 1]) o.push(cloud([[cx + s * 140, hy - 70, 34], [cx + s * 176, hy - 110, 36], [cx + s * 200, hy - 160, 32], [cx + s * 206, hy - 206, 26]], OR, 5), ...[0, 1].map(k => L(`M${cx + s * (156 + k * 30)},${hy - 96 - k * 52} q${s * 10},-16 ${s * 4},-30`, 3, '#a8521a')));
      o.push(fillPts([[cx - 104, hy - 40], [cx - 112, hy + 40], [cx + 112, hy + 40], [cx + 104, hy - 40], [cx, hy - 126]], OR, 6));
      return o; },
    hat: ({ cx, hy }) => { const OR = '#e07a2e', o = [P(`M${cx - 100},${hy - 46} Q${cx - 80},${hy - 122} ${cx},${hy - 124} Q${cx + 80},${hy - 122} ${cx + 100},${hy - 46} Q${cx + 70},${hy - 84} ${cx + 20},${hy - 76} Q${cx - 30},${hy - 92} ${cx - 50},${hy - 70} Q${cx - 80},${hy - 76} ${cx - 100},${hy - 46} Z`, OR, INK, 5)];
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 118},${hy - 66} q${s * -30},-40 ${s * -36},-4 q${s * 6},20 ${s * 36},4 Z M${cx + s * 118},${hy - 66} q${s * 36},-6 ${s * 30},26 q${s * -24},6 ${s * -30},-26 Z`, '#ffd84a', INK, 4), circ(cx + s * 118, hy - 66, 8, '#ffd84a', 3.4));
      o.push(...[[-60, 34], [-48, 44], [-70, 46], [60, 34], [48, 44], [70, 46]].map(([dx, dy]) => ell(cx + dx, hy + dy, 3, 3, '#c8763e')));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 36},${top} Q${cx},${top + 36} ${cx + 36},${top}`, '#fff', INK, 3.4), ...[0, 1, 2, 3].map(k => circ(cx - 46 + k * 30, top + 80 + (k % 2) * 30, 9, '#fff', 0)), `<path d="M${cx - 100},${top + 150} L${cx + 100},${top + 150} L${cx + 120},${top + 240} L${cx - 120},${top + 240} Z" fill="#f05a9a"/>`, L(`M${cx - 90},${top + 150} L${cx + 90},${top + 150}`, 4)],
    behind: ({ cx, top }) => [`<ellipse cx="${cx}" cy="${top - 60}" rx="200" ry="390" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="14 18" opacity=".25"/>`],
    arms: B => ({ front: [B.arm(-1, B.cx - 140, B.top + 90, 20), B.arm(1, B.cx + 140, B.top + 90, -20)] }),
    over: ({ cx, top }) => { const o = [], y = top + 90, d = `M${cx - 160},${y - 10} C${cx - 260},${y - 300} ${cx - 220},${top - 470} ${cx},${top - 470} C${cx + 220},${top - 470} ${cx + 260},${y - 300} ${cx + 160},${y - 10}`;
      o.push(L(d, 15, INK), L(d, 7, '#f05a9a'));
      for (const s of [-1, 1]) o.push(rot(s * -18, cx + s * 150, y, [rect(cx + s * 150 - 13, y - 40, 26, 64, '#ffd84a', 5, 12)]), fist(cx + s * 140, y, 14));
      o.push(L(`M${cx - 200},${top - 380} q-30,40 -40,100 M${cx + 200},${top - 380} q30,40 40,100`, 4.5), L(`M${cx - 90},${1000} q-20,-6 -40,0 M${cx + 90},${1000} q20,-6 40,0`, 4), T(cx + 170, top - 420, 'whoosh', 26, 24));
      return o; } },

  // 8 RATTLE BABY — giant rattle shaken overhead, pacifier as big as her head, bow on the curl
  { name: 'rattle', label: 'Rattle Baby', form: 'baby', coat: '#f6b3c8', face: ['baby', 'giggle'], hair: 'curl',
    hat: ({ cx, hy }) => [P(`M${cx - 2},${hy - 96} q-50,-40 -56,-6 q-2,30 56,6 Z M${cx - 2},${hy - 96} q50,-40 56,-6 q2,30 -56,6 Z`, '#f05a9a', INK, 5), circ(cx - 2, hy - 96, 11, '#f05a9a', 4)],
    details: ({ cx, top }) => [P(`M${cx - 54},${top} Q${cx - 60},${top + 56} ${cx},${top + 62} Q${cx + 60},${top + 56} ${cx + 54},${top} Z`, '#fff', INK, 3.6), heart(cx, top + 30, 12, '#f05a78'), L(`M${cx - 72},${top + 88} Q${cx},${top + 100} ${cx + 72},${top + 88}`, 3.4)],
    arms: B => ({ front: [B.arm(-1, B.cx - 96, B.top + 20, -20), B.arm(1, B.cx + 120, B.top - 60, 10)] }),
    props: ({ cx, top }) => { const x = cx - 140, y = top - 30; return [rot(-24, x, y, [P(`M${x + 40},${y} Q${x + 60},${y - 30} ${x + 96},${y - 20} Q${x + 124},${y} ${x + 96},${y + 20} Q${x + 60},${y + 30} ${x + 40},${y} Z`, '#f6e6c8', INK, 5), P(`M${x + 34},${y - 80} Q${x + 60},${y - 40} ${x + 46},${y} Q${x + 60},${y + 40} ${x + 34},${y + 80} Q${x + 4},${y + 84} ${x + 2},${y + 40} Q${x + 14},${y} ${x + 2},${y - 40} Q${x + 4},${y - 84} ${x + 34},${y - 80} Z`, '#7ad0f0', INK, 7), hl(`M${x + 16},${y - 60} Q${x + 10},${y - 30} ${x + 20},${y - 6}`, 7, .6), rect(x - 12, y - 14, 30, 28, '#7ad0f0', 5, 6),
      `<circle cx="${x - 44}" cy="${y}" r="38" fill="none" stroke="${INK}" stroke-width="22"/><circle cx="${x - 44}" cy="${y}" r="38" fill="none" stroke="#f05a9a" stroke-width="12"/>`, hl(`M${x - 70},${y - 22} q10,-14 26,-16`, 4, .7)]), fist(cx - 96, top + 20, 12)]; },
    over: ({ cx, top }) => { const x = cx + 120, y = top - 60, bx = x + 40, by = y - 330, o = [];
      o.push(pole(x - 4, y + 30, bx - 4, by + 70, '#ffd84a', 20), ell(bx - 4, by + 92, 30, 12, '#f05a9a', INK, 5));
      o.push(circ(bx, by, 76, '#7ad0f0', 7), P(`M${bx - 74},${by + 4} Q${bx},${by + 40} ${bx + 74},${by + 4} L${bx + 70},${by - 20} Q${bx},${by + 14} ${bx - 70},${by - 20} Z`, '#f05a9a', INK, 5), ...[[-36, -40], [8, -50], [40, -30], [-16, 40], [30, 44]].map(([dx, dy], i) => circ(bx + dx, by + dy, 9, ['#ffd84a', '#fff', '#f05a9a', '#3fae5a', '#ffd84a'][i], 3.4)), hl(`M${bx - 54},${by - 30} Q${bx - 44},${by - 60} ${bx - 14},${by - 66}`, 9, .7), circ(bx, by - 84, 12, '#ffd84a', 4));
      o.push(L(`M${bx - 100},${by - 40} q-14,30 0,60 M${bx - 120},${by - 54} q-20,44 0,88 M${bx + 98},${by - 30} q12,30 0,60`, 4.5), T(bx - 20, by - 116, 'shake shake!', 26, -6), fist(x, y, 12));
      return o; } },

  // 9 SCIENCE FAIR KID — baking-soda volcano erupting a tower of foam, bow tie, blue ribbon
  { name: 'volcano', label: 'Science Fair Kid', form: 'kid', coat: '#7a5cc4', face: 'jawdrop',
    hat: ({ cx, hy }) => [P(`M${cx - 98},${hy - 54} Q${cx - 90},${hy - 128} ${cx},${hy - 130} Q${cx + 90},${hy - 128} ${cx + 98},${hy - 54} Q${cx + 70},${hy - 96} ${cx - 20},${hy - 92} Q${cx - 70},${hy - 90} ${cx - 98},${hy - 54} Z`, '#2a2230', INK, 5), L(`M${cx - 20},${hy - 92} Q${cx - 30},${hy - 116} ${cx - 50},${hy - 124}`, 3, '#5a4a68')],
    details: ({ cx, top }) => [P(`M${cx - 70},${top} L${cx},${top + 110} L${cx + 70},${top} Z`, '#fff', INK, 4), P(`M${cx},${top + 20} l-30,-16 l0,32 Z M${cx},${top + 20} l30,-16 l0,32 Z`, '#d8473c', INK, 3.4), circ(cx, top + 20, 7, '#d8473c', 3),
      ...[0, 1, 2].map(k => L(`M${cx - 80},${top + 60 + k * 36} l30,20 l30,-20 M${cx + 20},${top + 60 + k * 36} l30,20 l30,-20`, 3, '#5a3fa0')), rect(cx + 30, top + 40, 36, 44, '#fff', 3, 3), ...[0, 1].map(k => L(`M${cx + 38 + k * 12},${top + 34} l0,20`, 4, k ? '#d8473c' : '#2f5fae')),
      `<rect x="${cx - 100}" y="${top + 160}" width="200" height="70" fill="#5a5a66"/>`, L(`M${cx - 80},${top + 160} L${cx + 80},${top + 160}`, 4)],

    arms: B => ({ front: [B.arm(-1, B.cx - 168, B.top - 20, 30), B.arm(1, B.cx + 70, B.top + 120, 20)] }),
    props: ({ cx, top }) => { const o = [];
      o.push(circ(cx - 40, top + 40, 20, '#2f5fae', 4), P(`M${cx - 50},${top + 56} l-10,40 l10,-6 l8,8 l2,-40 Z M${cx - 30},${top + 56} l10,40 l-10,-6 l-8,8 l-2,-40 Z`, '#2f5fae', INK, 3), T(cx - 40, top + 48, '1', 20, 0, '#fff'));
      o.push(fist(cx + 70, top + 120, 14));
      return o; },
    over: ({ cx, top }) => { const x = cx + 172, t = top + 150, o = [];
      o.push(rect(x - 78, t, 156, 22, WOOD, 5, 3), ...[-1, 1].map(s => rect(x + s * 60 - 8, t + 22, 16, 1004 - t - 22, WOODD, 4, 2)));
      o.push(P(`M${x - 72},${t + 2} Q${x - 44},${t - 50} ${x - 22},${t - 130} L${x + 22},${t - 130} Q${x + 44},${t - 50} ${x + 72},${t + 2} Z`, '#8a5a3a', INK, 6), L(`M${x - 50},${t - 40} q14,-10 22,-30 M${x + 30},${t - 70} q10,20 30,30`, 3.4, '#5a3418'));
      o.push(P(`M${x - 22},${t - 128} Q${x - 50},${t - 80} ${x - 40},${t - 40} Q${x - 30},${t - 60} ${x - 28},${t - 100} Q${x - 10},${t - 60} ${x - 4},${t - 30} Q${x + 6},${t - 70} ${x + 4},${t - 110} Q${x + 30},${t - 70} ${x + 40},${t - 50} Q${x + 40},${t - 90} ${x + 22},${t - 128} Z`, '#f2683a', INK, 4.5));
      o.push(cloud([[x - 10, t - 160, 34], [x + 16, t - 214, 38], [x - 14, t - 270, 42], [x + 20, t - 330, 46], [x - 20, t - 390, 48], [x + 30, t - 440, 50], [x - 30, t - 490, 52], [x + 30, t - 530, 50], [x - 50, t - 556, 40], [x + 60, t - 560, 30]], '#f2683a', 5));
      o.push(...[[x - 4, t - 230, 14], [x + 10, t - 380, 18], [x - 20, t - 480, 20], [x + 30, t - 520, 14]].map(([a, b, r]) => ell(a, b, r, r * .7, '#ffd84a')), ...[[x - 70, t - 440], [x + 62, t - 420], [x - 70, t - 330], [x + 70, t - 260]].map(([a, b], i) => drop(a, b, 9 + (i % 2) * 3, '#f2683a')));
      o.push(rot(-24, cx - 168, top - 20, [rect(cx - 186, top - 120, 36, 96, '#fff', 4.5, 8), rect(cx - 182, top - 90, 28, 34, '#ffd84a', 0, 2), T(cx - 168, top - 66, 'V', 22), rect(cx - 177, top - 142, 18, 24, '#d8473c', 3.4, 3)]), fist(cx - 168, top - 20, 14));
      return o; } },

  // 10 DINO TODDLER — dinosaur onesie hood with a crest of spikes, swinging spiked tail, claws up
  { name: 'dino', label: 'Dino Toddler', form: 'toddler', coat: '#6cbf4a', face: ['baby', 'sneaky'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 126, hy + 70], [cx - 140, hy - 20], [cx - 112, hy - 110], [cx, hy - 150], [cx + 112, hy - 110], [cx + 140, hy - 20], [cx + 126, hy + 70], [cx, hy + 90]], '#5aa83c', 6)],
    hat: ({ cx, hy }) => { const o = [], SP = '#f2a23a';
      o.push(P(`M${cx - 58},${hy - 136} L${cx - 34},${hy - 216} L${cx - 14},${hy - 140} Z M${cx - 20},${hy - 142} L${cx + 6},${hy - 270} L${cx + 30},${hy - 140} Z M${cx + 26},${hy - 140} L${cx + 56},${hy - 216} L${cx + 70},${hy - 132} Z`, SP, INK, 6), hl(`M${cx - 4},${hy - 160} L${cx + 4},${hy - 236}`, 5, .5));
      o.push(band(cx, hy, 124, 98, 66, '#6cbf4a', 6));
      for (let k = -4; k <= 4; k++) { const a = Math.PI * (1.5 + k * .09), x = cx + Math.cos(a) * 92, y = hy - 2 + Math.sin(a) * 88; o.push(P(`M${f1(x - 8)},${f1(y - 2)} L${f1(x + 8)},${f1(y - 2)} L${f1(x)},${f1(y + 16)} Z`, '#fff', INK, 3)); }
      for (const s of [-1, 1]) o.push(circ(cx + s * 70, hy - 118, 22, '#fff', 5), circ(cx + s * 74, hy - 118, 9, INK, 0), circ(cx + s * 70 - 4, hy - 122, 3, '#fff', 0));
      o.push(ell(cx - 16, hy - 100, 4, 3, INK), ell(cx + 16, hy - 100, 4, 3, INK));
      return o; },
    details: ({ cx, top }) => [ell(cx, top + 96, 52, 62, '#d8f0a0', INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 36 + k * 4},${top + 62 + k * 30} q36,10 ${72 - k * 8},0`, 3, '#9ac860'))],
    behind: ({ cx, top }) => { const SP = '#f2a23a', o = [];
      for (const [x, y, a] of [[cx - 96, top + 70, 10], [cx - 150, top + 36, 35], [cx - 194, top - 6, 55]]) o.push(rot(a, x, y, P(`M${x - 20},${y + 8} L${x},${y - 50} L${x + 20},${y + 8} Z`, SP, INK, 5)));
      o.push(P(`M${cx - 40},${top + 130} Q${cx - 120},${top + 140} ${cx - 190},${top + 60} Q${cx - 236},${top - 4} ${cx - 222},${top - 70} Q${cx - 196},${top - 10} ${cx - 150},${top + 30} Q${cx - 100},${top + 70} ${cx - 40},${top + 60} Z`, '#6cbf4a', INK, 6), hl(`M${cx - 200},${top + 10} Q${cx - 170},${top + 70} ${cx - 120},${top + 100}`, 7, .4), L(`M${cx - 236},${top - 100} q-10,30 4,60 M${cx - 250},${top - 50} q-10,24 0,46`, 4));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top - 40, -20), B.arm(1, B.cx + 130, B.top - 50, 20)] }),
    over: ({ cx, top }) => [...[[-120, -40, -1], [130, -50, 1]].flatMap(([dx, dy, s]) => [fist(cx + dx, top + dy, 13), ...[-1, 0, 1].map(k => P(`M${cx + dx + k * 10 - 4},${top + dy - 10} L${cx + dx + k * 14 + s * 4},${top + dy - 34} L${cx + dx + k * 10 + 5},${top + dy - 10} Z`, '#fff', INK, 3))]), T(cx + 160, top - 290, 'RAWR!', 40, 10, '#3f7a2c')] },
];
