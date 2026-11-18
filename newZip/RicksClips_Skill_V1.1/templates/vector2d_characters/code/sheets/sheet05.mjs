// SHEET 05 — PIRATES & WILD WEST
import { INK, P, L, ell, f1, smooth, brush, shade, tint, star4, star5, GOLD, GOLDL, STEEL, SILVER, BRONZE, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud } from '../castkit.mjs';
export const TITLE = 'Cast sheet 05: Pirates & Wild West';
const WHITE = '#f6f3ee', NAVY = '#24345e', TAN = '#c8955a', LEATHER = '#8a5a34';
// thick ring (lifebuoy) along an elliptical arc from a0 to a1 (radians), red with white bands
const ringArc = (cx, cy, rx, ry, a0, a1) => { const p = a => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry], [x0, y0] = p(a0), [x1, y1] = p(a1), big = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const d = `M${f1(x0)},${f1(y0)} A${rx},${ry} 0 ${big},1 ${f1(x1)},${f1(y1)}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="46"/><path d="${d}" fill="none" stroke="#e0453a" stroke-width="35"/><path d="${d}" fill="none" stroke="#fff" stroke-width="35" stroke-dasharray="34 46"/>`; };
// six-shooter pointing up, grip at x,y
const revolver = (x, y) => `<g transform="translate(${x},${y}) scale(1.5) translate(${-x},${-y}) rotate(-80 ${x} ${y})">${P(`M${x - 8},${y - 6} L${x + 92},${y - 6} L${x + 92},${y + 8} L${x + 30},${y + 10} Z`, '#8d93a3', INK, 4.5)}${rect(x + 12, y - 12, 30, 28, '#aeb4c2', 4.5, 8)}${P(`M${x - 10},${y - 4} Q${x - 30},${y + 30} ${x - 18},${y + 44} L${x + 6},${y + 44} Q${x + 2},${y + 20} ${x + 14},${y + 8} Z`, WOOD, INK, 4.5)}${L(`M${x + 20},${y + 10} q4,16 -8,18`, 3.4)}</g>`;

export const CAST = [
  // 1 PIRATE CAPTAIN: big boi in a skull tricorn, eyepatch, hook, parrot on the shoulder
  { name: 'captain', label: 'Pirate Captain', form: 'bigboi', coat: '#8a2230', face: 'hysterical',
    faceTop: ({ cx, hy }) => [L(`M${cx - 96},${hy - 60} Q${cx - 30},${hy - 56} ${cx + 18},${hy - 30} M${cx + 64},${hy - 22} L${cx + 100},${hy - 12}`, 5, INK), P(`M${cx + 14},${hy - 32} Q${cx + 40},${hy - 44} ${cx + 66},${hy - 32} Q${cx + 72},${hy + 2} ${cx + 40},${hy + 14} Q${cx + 10},${hy + 2} ${cx + 14},${hy - 32} Z`, '#1d1a24', INK, 4), hl(`M${cx + 26},${hy - 26} q12,-6 26,-2`, 3, .4)],
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 148},${hy - 58} Q${cx - 124},${hy - 176} ${cx},${hy - 186} Q${cx + 124},${hy - 176} ${cx + 148},${hy - 58} Q${cx + 80},${hy - 104} ${cx},${hy - 60} Q${cx - 80},${hy - 104} ${cx - 148},${hy - 58} Z`, BLACK, INK, 7));
      o.push(L(`M${cx - 132},${hy - 70} Q${cx - 70},${hy - 110} ${cx},${hy - 72} Q${cx + 70},${hy - 110} ${cx + 132},${hy - 70}`, 8, GOLD), hl(`M${cx - 120},${hy - 110} Q${cx - 90},${hy - 160} ${cx - 30},${hy - 172}`, 9, .28));
      const y = hy - 128; o.push(L(`M${cx - 34},${y + 30} L${cx + 34},${y - 6} M${cx + 34},${y + 30} L${cx - 34},${y - 6}`, 12, INK), L(`M${cx - 34},${y + 30} L${cx + 34},${y - 6} M${cx + 34},${y + 30} L${cx - 34},${y - 6}`, 6, '#fff'),
        P(`M${cx - 22},${y + 4} Q${cx - 24},${y - 28} ${cx},${y - 30} Q${cx + 24},${y - 28} ${cx + 22},${y + 4} Q${cx + 20},${y + 14} ${cx + 12},${y + 16} L${cx + 12},${y + 22} L${cx - 12},${y + 22} L${cx - 12},${y + 16} Q${cx - 20},${y + 14} ${cx - 22},${y + 4} Z`, '#fff', INK, 3.4), ell(cx - 9, y - 4, 6, 7, INK), ell(cx + 9, y - 4, 6, 7, INK));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 4} L${cx},${top + 110} L${cx + 60},${top - 4} Z`, WHITE, INK, 4), ...[0, 1, 2].map(k => L(`M${cx - 14},${top + 30 + k * 22} q14,8 28,0`, 3, '#c9c3b6')),
      P(`M${cx - 62},${top - 4} L${cx - 10},${top + 140} L${cx - 10},${top + 470} L${cx - 250},${top + 470} L${cx - 250},${top - 4} Z`, 'none', INK, 4), L(`M${cx - 6},${top + 140} L${cx - 6},${top + 470} M${cx + 6},${top + 140} L${cx + 6},${top + 470}`, 6, GOLD),
      ...[0, 1, 2, 3].flatMap(k => [circ(cx - 34, top + 180 + k * 60, 8, GOLD, 3), circ(cx + 34, top + 180 + k * 60, 8, GOLD, 3)]), rect(cx - 240, top + 300, 480, 42, '#2a2230', 5, 3), rect(cx - 30, top + 292, 60, 58, GOLD, 5, 6), rect(cx - 16, top + 306, 32, 30, '#2a2230', 3, 3)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 210, B.top + 170, 30)] }),
    props: ({ cx, top }) => { const x = cx - 182, y = top + 18; return [`<g transform="translate(${x},${y + 90}) scale(1.25) translate(${-x},${-(y + 90)})">`,
      P(`M${x + 10},${y + 60} Q${x + 30},${y + 130} ${x + 4},${y + 200} L${x - 14},${y + 196} Q${x + 4},${y + 130} ${x - 8},${y + 66} Z`, '#2f6fd0', INK, 4.5),
      P(`M${x - 30},${y - 10} Q${x - 40},${y + 50} ${x - 6},${y + 84} Q${x + 30},${y + 80} ${x + 32},${y + 20} Q${x + 30},${y - 30} ${x},${y - 40} Q${x - 26},${y - 36} ${x - 30},${y - 10} Z`, '#3fae5a', INK, 5),
      P(`M${x + 24},${y} Q${x + 30},${y + 50} ${x + 2},${y + 78} Q${x + 10},${y + 40} ${x + 4},${y + 6} Z`, '#2c8a46', INK, 3.4),
      circ(x - 4, y - 46, 30, '#e0453a', 5), P(`M${x - 30},${y - 54} Q${x - 52},${y - 54} ${x - 50},${y - 28} Q${x - 42},${y - 36} ${x - 30},${y - 36} Z`, '#f2c230', INK, 4), circ(x - 8, y - 54, 9, '#fff', 3), circ(x - 10, y - 54, 4, INK, 0),
      L(`M${x - 14},${y + 82} l-6,14 M${x + 6},${y + 82} l4,14`, 5), '</g>']; },
    over: ({ cx, top }) => { const x = cx + 210, y = top + 170; return [rect(x - 18, y - 14, 36, 34, '#8a5a34', 5, 6), L(`M${x},${y + 18} L${x},${y + 50} Q${x},${y + 90} ${x - 30},${y + 86} Q${x - 50},${y + 80} ${x - 44},${y + 58}`, 14, INK), L(`M${x},${y + 18} L${x},${y + 50} Q${x},${y + 90} ${x - 30},${y + 86} Q${x - 50},${y + 80} ${x - 44},${y + 58}`, 7, '#d4d8e2')]; } },

  // 2 PIRATE LASS: polka-dot bandana with flying tails, long dark hair, cutlass raised
  { name: 'lass', label: 'Pirate Lass', form: 'lady', coat: '#2a5f6a', face: ['female', 'sassy'],
    headBack: ({ cx, hy }) => [P(`M${cx - 98},${hy - 40} Q${cx - 140},${hy + 60} ${cx - 120},${hy + 170} Q${cx - 100},${hy + 196} ${cx - 70},${hy + 170} Q${cx - 50},${hy + 196} ${cx - 30},${hy + 150} L${cx + 30},${hy + 150} Q${cx + 50},${hy + 196} ${cx + 70},${hy + 170} Q${cx + 100},${hy + 196} ${cx + 120},${hy + 170} Q${cx + 140},${hy + 60} ${cx + 98},${hy - 40} Z`, '#3a2420', INK, 6),
      L(`M${cx - 116},${hy + 40} q-6,60 2,110 M${cx + 116},${hy + 40} q6,60 -2,110`, 3, '#5e3a30')],
    faceTop: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 96},${hy - 40} Q${cx + s * 112},${hy + 10} ${cx + s * 100},${hy + 60} Q${cx + s * 88},${hy + 20} ${cx + s * 82},${hy - 30} Z`, '#3a2420', INK, 4))],
    hat: ({ cx, hy }) => { const o = [], RD = '#d8333a';
      o.push(P(`M${cx + 92},${hy - 54} Q${cx + 140},${hy - 70} ${cx + 158},${hy - 34} Q${cx + 132},${hy - 40} ${cx + 116},${hy - 30} Z M${cx + 94},${hy - 44} Q${cx + 140},${hy - 20} ${cx + 148},${hy + 26} Q${cx + 122},${hy} ${cx + 100},${hy - 20} Z`, RD, INK, 5));
      o.push(fillPts([[cx - 108, hy - 30], [cx - 102, hy - 92], [cx - 50, hy - 128], [cx, hy - 134], [cx + 50, hy - 128], [cx + 102, hy - 92], [cx + 108, hy - 34], [cx + 60, hy - 58], [cx, hy - 62], [cx - 60, hy - 56]], RD, 7));
      for (const [dx, dy] of [[-70, -80], [-30, -100], [10, -112], [50, -96], [80, -70], [-40, -70], [20, -80], [-80, -50], [60, -64]]) o.push(circ(cx + dx, hy + dy, 7, '#fff', 0));
      o.push(circ(cx + 100, hy - 48, 16, RD, 5), hl(`M${cx - 76},${hy - 96} Q${cx - 40},${hy - 120} ${cx},${hy - 122}`, 7, .35));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 54},${top - 4} Q${cx},${top + 50} ${cx + 54},${top - 4} L${cx + 60},${top + 60} L${cx - 60},${top + 60} Z`, WHITE, INK, 4), rect(cx - 70, top + 60, 140, 80, '#2a2230', 4, 4),
      L(`M${cx - 16},${top + 70} L${cx + 16},${top + 90} L${cx - 16},${top + 110} L${cx + 16},${top + 130}`, 3, '#d8c6a0'), rect(cx - 160, top + 134, 320, 26, '#d8333a', 4, 2), P(`M${cx + 30},${top + 150} q20,40 6,90 l-16,-4 q10,-40 -6,-80 Z`, '#d8333a', INK, 3.4),
      L(`M${cx - 170},${top + 372} ${[...Array(12)].map(() => 'q14,16 28,0').join(' ')}`, 4, '#1e4a52')],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 60, 14), B.arm(1, B.cx + 92, B.top + 170, -30)] }),
    props: ({ cx, top }) => [fist(cx + 92, top + 170, 13)],
    over: ({ cx, top }) => { const x = cx + 150, y = top + 60; return [`<g transform="translate(${2 * cx},0) scale(-1,1)">`, P(`M${x - 4},${y - 30} Q${x + 30},${y - 150} ${x + 96},${y - 250} Q${x + 98},${y - 210} ${x + 72},${y - 140} Q${x + 46},${y - 70} ${x + 14},${y - 24} Z`, '#d4d8e2', INK, 5), hl(`M${x + 14},${y - 60} Q${x + 40},${y - 140} ${x + 84},${y - 224}`, 4, .7),
      P(`M${x - 34},${y - 30} Q${x - 30},${y + 14} ${x + 6},${y + 26} Q${x + 30},${y + 20} ${x + 34},${y - 6} Q${x + 10},${y + 6} ${x - 4},${y - 26} Z`, GOLD, INK, 4.5), rect(x - 26, y - 38, 46, 14, GOLD, 4, 6), fist(x, y, 13), '</g>']; } },

  // 3 SAILOR: little seasick deckhand in a stripy shirt, white cap, stuck in a lifebuoy
  { name: 'sailor', label: 'Sailor', form: 'kid', coat: '#f4f2ee', face: 'sick',
    hat: ({ cx, hy }) => [P(`M${cx - 66},${hy - 92} Q${cx - 70},${hy - 150} ${cx},${hy - 156} Q${cx + 70},${hy - 150} ${cx + 66},${hy - 92} Z`, '#fbfbfd', INK, 6),
      P(`M${cx - 92},${hy - 84} Q${cx - 98},${hy - 112} ${cx - 64},${hy - 112} Q${cx},${hy - 120} ${cx + 64},${hy - 112} Q${cx + 98},${hy - 112} ${cx + 92},${hy - 84} Q${cx},${hy - 70} ${cx - 92},${hy - 84} Z`, '#fbfbfd', INK, 6), L(`M${cx - 70},${hy - 98} Q${cx},${hy - 108} ${cx + 70},${hy - 98}`, 2.6, '#c9c6d6'), hl(`M${cx - 46},${hy - 136} Q${cx - 20},${hy - 150} ${cx + 10},${hy - 150}`, 6, .5)],
    behind: ({ cx, top }) => [P(`M${cx - 70},${top - 6} L${cx + 70},${top - 6} L${cx + 84},${top + 70} L${cx - 84},${top + 70} Z`, NAVY, INK, 5), L(`M${cx - 66},${top + 54} L${cx + 66},${top + 54}`, 4, '#fff'), ringArc(cx, top + 140, 120, 40, Math.PI, Math.PI * 2)],
    details: ({ cx, top }) => [...[0, 1, 2, 3, 4, 5, 6].map(k => rect(cx - 120, top + 26 + k * 30, 240, 14, NAVY, 0, 0)), P(`M${cx - 44},${top - 4} L${cx},${top + 50} L${cx + 44},${top - 4} Z`, NAVY, INK, 4), P(`M${cx},${top + 44} l-18,22 l18,-6 l18,6 Z`, '#e0453a', INK, 3)],
    props: ({ cx, top }) => [ringArc(cx, top + 140, 120, 40, 0, Math.PI), ...[-1, 1].map(s => L(`M${cx + s * 120},${top + 120} l0,40`, 4)), fist(cx - 92, top + 150, 13), fist(cx + 92, top + 150, 13)],
    arms: B => ({ front: [B.arm(-1, B.cx - 92, B.top + 150, 10), B.arm(1, B.cx + 92, B.top + 150, 10)] }),
    over: ({ cx, top }) => [L(`M${cx - 190},${top - 320} q-16,-10 -30,0 M${cx - 170},${top - 260} q-14,-8 -26,0`, 4), L(`M${cx + 180},${top - 300} q12,-14 26,0 q12,-14 26,0`, 4)] },

  // 4 MUSKETEER: noodle fencer under a VAST plumed hat, blue tabard with cross, rapier en garde
  { name: 'musketeer', label: 'Musketeer', form: 'noodle', coat: '#2f5fae', face: 'flirty',
    headBack: ({ cx, hy }) => [...[-1, 1].map(s => P(`M${cx + s * 90},${hy - 50} Q${cx + s * 140},${hy + 20} ${cx + s * 130},${hy + 120} Q${cx + s * 116},${hy + 150} ${cx + s * 94},${hy + 128} Q${cx + s * 110},${hy + 60} ${cx + s * 70},${hy} Z`, '#6b4226', INK, 6)), ...[-1, 1].map(s => L(`M${cx + s * 116},${hy + 30} q${s * 10},40 ${s * 4},80`, 3, '#4a2c18'))],
    faceTop: ({ cx, hy }) => [
      P(`M${cx - 10},${hy + 66} Q${cx},${hy + 62} ${cx + 10},${hy + 66} L${cx},${hy + 96} Z`, '#6b4226', INK, 3.4)],
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx + 30},${hy - 120} Q${cx + 20},${hy - 230} ${cx + 110},${hy - 270} Q${cx + 170},${hy - 280} ${cx + 180},${hy - 230} Q${cx + 140},${hy - 250} ${cx + 116},${hy - 220} Q${cx + 150},${hy - 220} ${cx + 160},${hy - 190} Q${cx + 120},${hy - 200} ${cx + 90},${hy - 170} Q${cx + 70},${hy - 140} ${cx + 66},${hy - 112} Z`, '#f4f2f6', INK, 5), L(`M${cx + 46},${hy - 120} Q${cx + 50},${hy - 220} ${cx + 160},${hy - 256}`, 3, '#c3bfd0'));
      o.push(P(`M${cx + 20},${hy - 120} Q${cx + 40},${hy - 210} ${cx + 120},${hy - 214} Q${cx + 80},${hy - 180} ${cx + 52},${hy - 116} Z`, '#d8333a', INK, 4.5));
      o.push(fillPts([[cx - 80, hy - 70], [cx - 76, hy - 130], [cx - 30, hy - 158], [cx + 30, hy - 158], [cx + 76, hy - 130], [cx + 80, hy - 70]], '#2a2433', 7));
      o.push(P(`M${cx - 168},${hy - 54} Q${cx - 140},${hy - 96} ${cx},${hy - 92} Q${cx + 140},${hy - 96} ${cx + 168},${hy - 54} Q${cx + 120},${hy - 64} ${cx},${hy - 62} Q${cx - 120},${hy - 64} ${cx - 168},${hy - 54} Z`, '#2a2433', INK, 6), rect(cx - 80, hy - 92, 160, 16, GOLD, 4, 3), hl(`M${cx - 60},${hy - 110} Q${cx - 30},${hy - 146} ${cx + 10},${hy - 148}`, 7, .3));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 4} Q${cx},${top + 24} ${cx + 30},${top - 4} L${cx + 40},${top + 30} Q${cx},${top + 50} ${cx - 40},${top + 30} Z`, WHITE, INK, 3.4), rect(cx - 14, top + 60, 28, 260, '#e6e8f0', 3.4, 2), rect(cx - 60, top + 140, 120, 26, '#e6e8f0', 3.4, 2), rect(cx - 70, top + 320, 140, 18, '#6b4226', 3.4, 2), circ(cx, top + 153, 9, GOLD, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 100, B.top + 170, -30), B.arm(1, B.cx + 110, B.top + 230, 20)] }),
    props: ({ cx, top }) => [fist(cx - 100, top + 170, 13)],
    over: ({ cx, top }) => { const x = cx + 110, y = top + 230; return [L(`M${x},${y} L${x + 130},${y - 360}`, 9, INK), L(`M${x},${y} L${x + 130},${y - 360}`, 4, '#e6e8f0'), P(`M${x - 22},${y + 6} Q${x - 10},${y - 34} ${x + 26},${y - 30} Q${x + 30},${y + 10} ${x - 22},${y + 6} Z`, SILVER, INK, 4), L(`M${x - 4},${y + 4} l-10,26`, 8, INK), fist(x, y, 13)]; } },

  // 5 REDCOAT: gigachad guardsman under a towering bearskin, white cross belts, musket shouldered
  { name: 'redcoat', label: 'Redcoat', form: 'chad', coat: '#c8332b', face: 'bruh',
    hat: ({ cx, hy }) => { const pts = []; for (let k = 0; k < 40; k++) { const a = Math.PI * 2 * k / 40, r = 1 + (k % 2 ? .07 : -.02); let x = cx + Math.cos(a) * 112 * r, y = hy - 150 + Math.sin(a) * 150 * r; if (y > hy - 40) y = hy - 40 - (k % 2 ? 6 : 0); pts.push([x, y]); }
      return [fillPts(pts, '#1d1a22', 7), hl(`M${cx - 80},${hy - 150} Q${cx - 70},${hy - 250} ${cx - 20},${hy - 280}`, 9, .18), ...[[-50, -140], [10, -220], [40, -110], [-30, -240], [-70, -90]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q10,-10 22,-4`, 3, '#3a3644')), L(`M${cx - 100},${hy - 40} Q${cx - 104},${hy + 60} ${cx},${hy + 110} Q${cx + 104},${hy + 60} ${cx + 100},${hy - 40}`, 7, GOLD)]; },
    details: ({ cx, top }) => [rect(cx - 60, top - 6, 120, 30, '#1d2a4e', 4, 2), L(`M${cx - 150},${top + 20} L${cx + 120},${top + 300} M${cx + 150},${top + 20} L${cx - 120},${top + 300}`, 30, INK), L(`M${cx - 150},${top + 20} L${cx + 120},${top + 300} M${cx + 150},${top + 20} L${cx - 120},${top + 300}`, 22, '#f6f3ee'), circ(cx, top + 165, 18, GOLD, 4),
      rect(cx - 140, top + 300, 280, 30, '#f6f3ee', 4, 2)],
    props: ({ cx, top }) => [...[-1, 1].flatMap(s => [ell(cx + s * 136, top + 34, 36, 16, GOLD, INK, 4.5), ...[0, 1, 2, 3, 4].map(k => L(`M${cx + s * (110 + k * 12)},${top + 48} l${s * 2},18`, 4, GOLD))])],
    over: ({ cx, top }) => { const x = cx + 214, y = top + 262; return [pole(x + 8, y + 120, x + 12, y - 380, WOODD, 14), L(`M${x + 12},${y - 250} L${x + 14},${y - 420}`, 8, INK), L(`M${x + 12},${y - 250} L${x + 14},${y - 420}`, 3, STEEL), P(`M${x + 14},${y - 420} l-5,-70 l10,0 Z`, STEEL, INK, 3.4), rect(x - 2, y - 120, 22, 30, '#8d93a3', 3.4, 3), L(`M${x + 2},${y - 30} q-26,40 -10,90`, 3.4, '#f6f3ee'), fist(x, y, 20)]; } },

  // 6 COWBOY: GIANT stetson, red neckerchief, lasso loop spinning over his head
  { name: 'cowboy', label: 'Cowboy', form: 'standard', coat: '#b8423a', face: 'troll',
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 70},${hy - 70} Q${cx - 84},${hy - 170} ${cx - 50},${hy - 188} Q${cx - 24},${hy - 172} ${cx},${hy - 176} Q${cx + 24},${hy - 172} ${cx + 50},${hy - 188} Q${cx + 84},${hy - 170} ${cx + 70},${hy - 70} Z`, TAN, INK, 7), L(`M${cx},${hy - 172} Q${cx - 6},${hy - 140} ${cx},${hy - 116}`, 4, '#9e6e3a'));
      o.push(P(`M${cx - 72},${hy - 92} Q${cx},${hy - 102} ${cx + 72},${hy - 92} L${cx + 71},${hy - 72} Q${cx},${hy - 82} ${cx - 71},${hy - 72} Z`, '#5a3420', INK, 4));
      o.push(P(`M${cx - 150},${hy - 104} Q${cx - 142},${hy - 60} ${cx - 90},${hy - 60} Q${cx},${hy - 50} ${cx + 90},${hy - 60} Q${cx + 142},${hy - 60} ${cx + 150},${hy - 104} Q${cx + 132},${hy - 80} ${cx + 90},${hy - 78} Q${cx},${hy - 86} ${cx - 90},${hy - 78} Q${cx - 132},${hy - 80} ${cx - 150},${hy - 104} Z`, TAN, INK, 6), hl(`M${cx - 56},${hy - 110} Q${cx - 60},${hy - 160} ${cx - 40},${hy - 176}`, 7, .4));
      return o; },
    details: ({ cx, top }) => [...[0, 1, 2, 3, 4, 5, 6, 7].map(k => L(`M${cx - 140},${top + 20 + k * 40} L${cx + 140},${top + 20 + k * 40} M${cx - 120 + k * 36},${top} L${cx - 120 + k * 36},${top + 320}`, 5, '#9c3530')),
      P(`M${cx - 40},${top - 6} L${cx - 80},${top + 300} L${cx - 150},${top + 300} L${cx - 150},${top - 6} Z M${cx + 40},${top - 6} L${cx + 80},${top + 300} L${cx + 150},${top + 300} L${cx + 150},${top - 6} Z`, LEATHER, INK, 4.5), circ(cx - 64, top + 120, 5, GOLD, 2.4), circ(cx - 70, top + 170, 5, GOLD, 2.4),
      P(`M${cx - 54},${top - 4} Q${cx},${top + 30} ${cx + 54},${top - 4} L${cx},${top + 80} Z`, '#d8333a', INK, 4), ...[[-20, 20], [10, 30], [0, 50], [26, 12]].map(([dx, dy]) => circ(cx + dx, top + dy, 4, '#fff', 0)), rect(cx - 120, top + 250, 240, 26, '#5a3420', 4, 2), rect(cx - 24, top + 244, 48, 38, SILVER, 4, 8)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 168, B.top - 20, -20)] }),
    over: ({ cx, top }) => { const x = cx + 168, y = top - 20, lx = cx + 120, ly = -150; return [L(`M${x},${y} Q${x + 20},${y - 120} ${lx + 30},${ly + 24}`, 9, INK), L(`M${x},${y} Q${x + 20},${y - 120} ${lx + 30},${ly + 24}`, 4.5, '#d8b77a'),
      `<ellipse cx="${lx}" cy="${ly}" rx="112" ry="32" fill="none" stroke="${INK}" stroke-width="10"/><ellipse cx="${lx}" cy="${ly}" rx="112" ry="32" fill="none" stroke="#d8b77a" stroke-width="5"/>`, L(`M${lx - 140},${ly - 6} q-10,14 -2,28 M${lx + 112},${ly - 46} q14,6 14,22`, 4), fist(x, y, 15)]; },
    props: ({ cx, top }) => [`<circle cx="${cx - 150}" cy="${top + 290}" r="34" fill="none" stroke="${INK}" stroke-width="12"/><circle cx="${cx - 150}" cy="${top + 290}" r="34" fill="none" stroke="#d8b77a" stroke-width="6"/><circle cx="${cx - 150}" cy="${top + 290}" r="22" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="${cx - 150}" cy="${top + 290}" r="22" fill="none" stroke="#d8b77a" stroke-width="5"/>`] },

  // 7 SHERIFF: dad bod, huge tin star, walrus moustache, six-shooter held up
  { name: 'sheriff', label: 'Sheriff', form: 'dad', coat: '#2e2a33', face: 'sus',
    faceTop: ({ cx, hy }) => [P(`M${cx},${hy + 18} Q${cx - 36},${hy + 6} ${cx - 64},${hy + 30} Q${cx - 76},${hy + 52} ${cx - 64},${hy + 70} Q${cx - 50},${hy + 46} ${cx - 26},${hy + 42} Q${cx - 10},${hy + 40} ${cx},${hy + 34} Q${cx + 10},${hy + 40} ${cx + 26},${hy + 42} Q${cx + 50},${hy + 46} ${cx + 64},${hy + 70} Q${cx + 76},${hy + 52} ${cx + 64},${hy + 30} Q${cx + 36},${hy + 6} ${cx},${hy + 18} Z`, '#8a8590', INK, 4), L(`M${cx - 44},${hy + 26} l-6,12 M${cx - 24},${hy + 22} l-4,12 M${cx + 24},${hy + 22} l4,12 M${cx + 44},${hy + 26} l6,12`, 2.6, '#5e5a66')],
    hat: ({ cx, hy }) => [P(`M${cx - 66},${hy - 70} Q${cx - 80},${hy - 160} ${cx - 44},${hy - 172} Q${cx - 20},${hy - 156} ${cx},${hy - 162} Q${cx + 20},${hy - 156} ${cx + 44},${hy - 172} Q${cx + 80},${hy - 160} ${cx + 66},${hy - 70} Z`, '#e9dcc0', INK, 7), L(`M${cx},${hy - 158} Q${cx - 6},${hy - 130} ${cx},${hy - 108}`, 4, '#b8a682'),
      P(`M${cx - 68},${hy - 92} Q${cx},${hy - 100} ${cx + 68},${hy - 92} L${cx + 67},${hy - 72} Q${cx},${hy - 80} ${cx - 67},${hy - 72} Z`, '#2a2230', INK, 4),
      P(`M${cx - 132},${hy - 96} Q${cx - 124},${hy - 60} ${cx - 80},${hy - 62} Q${cx},${hy - 52} ${cx + 80},${hy - 62} Q${cx + 124},${hy - 60} ${cx + 132},${hy - 96} Q${cx + 112},${hy - 76} ${cx + 80},${hy - 78} Q${cx},${hy - 86} ${cx - 80},${hy - 78} Q${cx - 112},${hy - 76} ${cx - 132},${hy - 96} Z`, '#e9dcc0', INK, 6), hl(`M${cx - 46},${hy - 110} Q${cx - 54},${hy - 150} ${cx - 36},${hy - 164}`, 6, .5)],
    details: ({ cx, top }) => [P(`M${cx - 26},${top - 4} L${cx - 40},${top + 300} L${cx + 40},${top + 300} L${cx + 26},${top - 4} Z`, '#e8e2d6', INK, 4), ...[0, 1, 2, 3].map(k => circ(cx, top + 60 + k * 50, 5, '#c9c3b6', 2.4)),
      P(`M${cx - 26},${top - 4} L${cx},${top + 20} L${cx + 26},${top - 4} Z`, '#e8e2d6', INK, 3.4), P(`M${cx},${top + 18} l-20,-12 l0,24 Z M${cx},${top + 18} l20,-12 l0,24 Z`, '#d8333a', INK, 3),
      `<rect x="${cx - 160}" y="${top + 326}" width="320" height="60" fill="#5a4a3a"/>`, P(`M${cx - 160},${top + 300} Q${cx},${top + 326} ${cx + 160},${top + 300} L${cx + 160},${top + 330} Q${cx},${top + 356} ${cx - 160},${top + 330} Z`, '#6e4527', INK, 4), ...[-90, -66, -42, 42, 66, 90].map(dx => rect(cx + dx - 6, top + 304 + Math.abs(dx) * -.06, 12, 22, GOLD, 2.6, 3)), rect(cx - 16, top + 312, 32, 28, SILVER, 4, 5)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1], 30), B.arm(1, B.cx + 170, B.top + 80, 10)] }),
    props: ({ cx, top }) => { const x = cx - 52, y = top + 110; let d = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 18 : 42; d += (k ? 'L' : 'M') + f1(x + Math.cos(a) * r) + ',' + f1(y + Math.sin(a) * r); }
      return [P(d + 'Z', '#ffd860', INK, 5), ...[0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return circ(x + Math.cos(a) * 44, y + Math.sin(a) * 44, 7, '#ffd860', 3.4); }), circ(x, y, 12, '#f0b830', 3), hl(`M${x - 14},${y - 18} l8,-14`, 4, .7),
        P(`M${cx + 128},${top + 330} L${cx + 168},${top + 330} L${cx + 160},${top + 450} L${cx + 136},${top + 450} Z`, '#6e4527', INK, 4.5), P(`M${cx + 130},${top + 330} Q${cx + 160},${top + 300} ${cx + 172},${top + 336}`, 'none', INK, 4)]; },
    over: ({ cx, top }) => [revolver(cx + 170, top + 80), fist(cx + 170, top + 80, 17), L(`M${cx + 166},${top - 140} l-4,-20 M${cx + 186},${top - 136} l8,-16 M${cx + 148},${top - 130} l-12,-12`, 4)] },

  // 8 OUTLAW: bandana mask, black hat, sly side-eye, holding up his own WANTED poster
  { name: 'outlaw', label: 'Outlaw', form: 'standard', coat: '#4e4458', face: 'sideeye',
    faceTop: ({ cx, hy }) => { const RD = '#b8282e'; return [P(`M${cx - 102},${hy + 4} Q${cx},${hy + 20} ${cx + 102},${hy + 4} Q${cx + 100},${hy + 70} ${cx + 60},${hy + 110} Q${cx},${hy + 160} ${cx - 60},${hy + 110} Q${cx - 100},${hy + 70} ${cx - 102},${hy + 4} Z`, RD, INK, 5),
      ...[[-60, 40], [-20, 60], [30, 44], [60, 70], [-40, 96], [10, 104], [40, 120], [-70, 70]].map(([dx, dy]) => circ(cx + dx, hy + dy, 5, '#fff', 0)), L(`M${cx - 60},${hy + 40} q40,40 90,18`, 3, '#8a1c22'), hl(`M${cx - 80},${hy + 24} Q${cx - 40},${hy + 34} ${cx},${hy + 34}`, 5, .35)]; },
    hat: ({ cx, hy }) => [P(`M${cx - 74},${hy - 70} L${cx - 66},${hy - 150} Q${cx},${hy - 160} ${cx + 66},${hy - 150} L${cx + 74},${hy - 70} Z`, '#1d1a22', INK, 7), P(`M${cx - 74},${hy - 92} L${cx + 74},${hy - 92} L${cx + 74},${hy - 72} L${cx - 74},${hy - 72} Z`, '#5a3420', INK, 4),
      P(`M${cx - 146},${hy - 64} Q${cx},${hy - 44} ${cx + 146},${hy - 64} Q${cx + 152},${hy - 80} ${cx + 120},${hy - 84} Q${cx},${hy - 70} ${cx - 120},${hy - 84} Q${cx - 152},${hy - 80} ${cx - 146},${hy - 64} Z`, '#1d1a22', INK, 6), hl(`M${cx - 50},${hy - 104} L${cx - 46},${hy - 140}`, 7, .25)],
    behind: ({ cx, top }) => [P(`M${cx - 80},${top + 10} L${cx - 150},${top + 560} L${cx - 40},${top + 540} Z M${cx + 80},${top + 10} L${cx + 150},${top + 560} L${cx + 40},${top + 540} Z`, '#4e4458', INK, 6)],
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 6} L${cx},${top + 60} L${cx + 30},${top - 6} Z`, '#c9b896', INK, 4), P(`M${cx - 32},${top - 6} L${cx - 70},${top + 160} L${cx - 10},${top + 320} M${cx + 32},${top - 6} L${cx + 70},${top + 160} L${cx + 10},${top + 320}`, 'none', INK, 4),
      rect(cx - 130, top + 250, 260, 26, '#3a2c22', 4, 2), ...[-80, -60, -40, 40, 60, 80].map(dx => rect(cx + dx - 5, top + 246, 10, 20, GOLD, 2.4, 3)), rect(cx - 18, top + 244, 36, 38, SILVER, 4, 6)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 130, 30), B.arm(1, B.hdR[0], B.hdR[1])] }),
    props: ({ cx, top }) => { const x = cx - 172, y = top + 60; return [`<g transform="rotate(-6 ${x} ${y + 70})">${rect(x - 66, y - 30, 132, 180, '#efe0b8', 5, 3)}<text x="${x}" y="${y + 4}" font-family="Rockwell, Georgia, serif" font-weight="900" font-size="30" text-anchor="middle" fill="${INK}">WANTED</text>${rect(x - 34, y + 16, 68, 70, '#f8f1dc', 3.4, 2)}${circ(x, y + 54, 24, '#fff', 3)}${P(`M${x - 24},${y + 56} Q${x},${y + 62} ${x + 24},${y + 56} Q${x + 18},${y + 80} ${x},${y + 82} Q${x - 18},${y + 80} ${x - 24},${y + 56} Z`, '#b8282e', INK, 2.4)}${rect(x - 26, y + 26, 52, 8, '#1d1a22', 2, 2)}${ell(x - 9, y + 46, 3, 3.5, INK)}${ell(x + 9, y + 46, 3, 3.5, INK)}<text x="${x}" y="${y + 120}" font-family="Rockwell, Georgia, serif" font-weight="900" font-size="28" text-anchor="middle" fill="${INK}">$500</text>${L(`M${x - 40},${y + 136} l80,0`, 2.4, '#a89870')}</g>`, fist(cx - 150, top + 130, 15)]; } },

  // 9 GOLD PROSPECTOR: hunched old-timer, battered hat, pickaxe on the shoulder, pan of nuggets
  { name: 'prospector', label: 'Gold Prospector', form: 'elder', coat: '#b04a3c', face: 'money', hair: 'gramps', cane: false,
    faceTop: ({ cx, hy }) => [P(`M${cx - 64},${hy + 72} Q${cx - 40},${hy + 100} ${cx},${hy + 100} Q${cx + 40},${hy + 100} ${cx + 64},${hy + 72} Q${cx + 50},${hy + 130} ${cx + 30},${hy + 150} L${cx + 14},${hy + 136} L${cx},${hy + 170} L${cx - 14},${hy + 136} L${cx - 30},${hy + 150} Q${cx - 50},${hy + 130} ${cx - 64},${hy + 72} Z`, '#d6d4dc', INK, 4.5), ...[-30, 0, 30].map(dx => L(`M${cx + dx},${hy + 108} l${dx * .1},20`, 2.4, '#9e9aa8'))],
    hat: ({ cx, hy }) => [P(`M${cx - 76},${hy - 70} Q${cx - 86},${hy - 150} ${cx - 30},${hy - 160} Q${cx},${hy - 140} ${cx + 30},${hy - 166} Q${cx + 84},${hy - 150} ${cx + 74},${hy - 70} Z`, '#8a6a48', INK, 7), L(`M${cx - 20},${hy - 150} q10,30 0,60`, 3.4, '#5e4630'),
      P(`M${cx - 146},${hy - 50} Q${cx - 120},${hy - 90} ${cx},${hy - 86} Q${cx + 120},${hy - 90} ${cx + 150},${hy - 70} Q${cx + 110},${hy - 60} ${cx},${hy - 64} Q${cx - 110},${hy - 66} ${cx - 146},${hy - 50} Z`, '#8a6a48', INK, 6), rect(cx + 20, hy - 132, 26, 22, '#c9a26b', 3, 3), L(`M${cx + 20},${hy - 132} l26,22 M${cx + 46},${hy - 132} l-26,22`, 2.4, '#5e4630')],
    details: ({ cx, top }) => [...[-1, 1].map(s => L(`M${cx + s * 60},${top - 4} L${cx + s * 50},${top + 300}`, 14, '#3a2c22')), ...[0, 1, 2, 3].map(k => circ(cx + 10, top + 40 + k * 40, 5, '#e8e2d6', 2.4)), rect(cx - 90, top + 170, 44, 40, '#7a6a4a', 3.4, 4), L(`M${cx - 86},${top + 176} l36,0 M${cx - 86},${top + 204} l36,0`, 2, '#e8e2d6').replace('stroke-linecap="round"', 'stroke-dasharray="4 4"')],
    arms: B => ({ front: [B.arm(-1, B.cx - 128, B.top + 160, 20), B.arm(1, B.cx + 120, B.top + 110, 20)] }),
    props: ({ cx, top }) => { const x = cx - 168, y = top + 150; return [pole(cx + 140, top + 260, cx + 198, top - 150, WOOD, 13), P(`M${cx + 122},${top - 136} Q${cx + 192},${top - 196} ${cx + 238},${top - 112} Q${cx + 192},${top - 160} ${cx + 128},${top - 118} Z`, STEEL, INK, 5), rect(cx + 186, top - 160, 24, 30, '#8d93a3', 4, 4), fist(cx + 120, top + 110, 15),
      `<ellipse cx="${x}" cy="${y}" rx="76" ry="26" fill="#8d93a3" stroke="${INK}" stroke-width="6"/><ellipse cx="${x}" cy="${y - 4}" rx="58" ry="16" fill="#b4b9c6" stroke="${INK}" stroke-width="3"/>`, ...[[-26, -6], [0, -10], [22, -4], [-8, 2], [34, -12]].map(([dx, dy]) => P(`M${x + dx - 9},${y + dy} l5,-8 l9,1 l5,8 l-6,6 l-9,0 Z`, '#ffcf3a', INK, 3)), star4(x - 40, y - 40, 14), star4(x + 30, y - 46, 10), star4(x + 70, y - 30, 8), fist(cx - 128, top + 160, 15)]; } },

  // 10 SALOON SINGER: feather headdress, pink boa, big lace fan, blowing kisses
  { name: 'singer', label: 'Saloon Singer', form: 'lady', coat: '#c2185b', face: ['female', 'blowKiss'],
    headBack: ({ cx, hy }) => [cloud([[cx - 96, hy - 50, 34], [cx - 110, hy, 32], [cx - 104, hy + 50, 30], [cx - 80, hy + 90, 28], [cx + 96, hy - 50, 34], [cx + 110, hy, 32], [cx + 104, hy + 50, 30], [cx + 80, hy + 90, 28], [cx - 60, hy - 96, 36], [cx, hy - 112, 38], [cx + 60, hy - 96, 36]], '#f0c75a', 5)],
    faceTop: ({ cx, hy }) => [cloud([[cx - 70, hy - 76, 22], [cx - 36, hy - 90, 22], [cx + 4, hy - 94, 22], [cx + 42, hy - 88, 22], [cx + 74, hy - 72, 22], [cx - 92, hy - 46, 18], [cx + 94, hy - 42, 18]], '#f0c75a', 4), ...[[-50, -84], [-10, -96], [30, -92], [64, -76]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q8,-6 14,2`, 2.6, '#c8952a')),
      `<circle cx="${cx + 102}" cy="${hy + 70}" r="9" fill="#e8e8f0" stroke="${INK}" stroke-width="3"/>`],
    hat: ({ cx, hy }) => [P(`M${cx + 30},${hy - 100} Q${cx},${hy - 200} ${cx + 30},${hy - 280} Q${cx + 60},${hy - 220} ${cx + 52},${hy - 104} Z`, '#f06aa8', INK, 5), P(`M${cx + 40},${hy - 104} Q${cx + 70},${hy - 210} ${cx + 140},${hy - 250} Q${cx + 120},${hy - 170} ${cx + 60},${hy - 100} Z`, '#9b4fd0', INK, 5), P(`M${cx + 24},${hy - 104} Q${cx - 30},${hy - 190} ${cx - 50},${hy - 240} Q${cx},${hy - 210} ${cx + 44},${hy - 110} Z`, '#f2b8d4', INK, 5),
      L(`M${cx + 36},${hy - 110} Q${cx + 30},${hy - 190} ${cx + 32},${hy - 260} M${cx + 50},${hy - 110} Q${cx + 90},${hy - 190} ${cx + 128},${hy - 236}`, 2.4, '#7a2a5a'), circ(cx + 40, hy - 100, 16, GOLD, 4), circ(cx + 40, hy - 100, 7, '#2fb3a8', 2.4)],
    details: ({ cx, top }) => [P(`M${cx - 60},${top + 8} Q${cx},${top + 40} ${cx + 60},${top + 8}`, 'none', INK, 3.4), rect(cx - 70, top + 110, 140, 24, '#1d1a22', 3.4, 3), ...[0, 1, 2, 3].map(k => L(`M${cx - 120 + k * 80},${top + 160} q10,100 -6,210`, 3.4, '#9a1046')),
      ...[...Array(13)].map((_, k) => circ(cx - 180 + k * 30, top + 380, 18, '#1d1a22', 3)), L(`M${cx - 170},${top + 352} ${[...Array(12)].map(() => 'q14,16 28,0').join(' ')}`, 4, '#1d1a22')],
    behind: ({ cx, top }) => [cloud([...Array(9)].map((_, k) => [cx + 70 + Math.sin(k * .7) * 8, top + 20 + k * 32, 20]), '#f590c0', 4.4)],
    props: ({ cx, top }) => { const cs = []; for (let k = 0; k <= 12; k++) { const t = k / 12, a = Math.PI * t; cs.push([cx - Math.cos(a) * 80, top + 10 + Math.sin(a) * 40, 22]); } for (let k = 1; k < 8; k++) cs.push([cx - 86 - Math.sin(k * .8) * 8, top + 10 + k * 32, 20]);
      const x = cx + 150, y = top + 120, ribs = [...Array(9)].map((_, k) => { const a = -Math.PI * (.95 - k * .1); return [x + Math.cos(a) * 86, y + Math.sin(a) * 86]; });
      return [cloud(cs, '#f590c0', 4.4), ...cs.filter((_, i) => i % 3 === 0).map(([a, b]) => L(`M${f1(a - 8)},${f1(b)} q8,-8 16,0`, 2.4, '#d0508e')),
        P(`M${x},${y} ${ribs.map(([a, b]) => `L${f1(a)},${f1(b)}`).join(' ')} Z`, '#1d1a22', INK, 5), ...ribs.slice(0, -1).map(([a, b], i) => P(`M${x},${y} L${f1(a)},${f1(b)} L${f1(ribs[i + 1][0])},${f1(ribs[i + 1][1])} Z`, i % 2 ? '#c2185b' : '#1d1a22', INK, 2.4)),
        ...ribs.map(([a, b]) => circ(a, b, 6, '#f2b8d4', 2.4)), circ(x, y, 8, GOLD, 3), fist(x, y, 13), fist(cx - 92, top + 200, 13)]; },
    arms: B => ({ front: [B.arm(-1, B.cx - 92, B.top + 200, 20), B.arm(1, B.cx + 150, B.top + 120, -10)] }) },
];
