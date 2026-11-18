// SHEET 03 — MEDIEVAL & RENAISSANCE (built on the lead's castkit, same techniques as sheet01)
import { INK, P, L, ell, f1, smooth, brush, shade, tint, GOLD, GOLDL, STEEL, BRONZE, WOOD, WOODD, CREAM, RED, fillPts, poly, rect, circ, hl, pole, fist, cloud, star4, drop } from '../castkit.mjs';
export const TITLE = 'Cast sheet 03: Medieval & Renaissance';

const BLUE = '#2f5fae', PURPLE = '#6b2d7a', GREEN = '#3f8a3a', LEATHER = '#8a5a34', IRON = '#5a5f70', PINK = '#f08fb0', HAIR = '#1d1a26';
const rot = (a, x, y, s) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${s}</g>`;
const cord = (d, col, w = 8) => L(d, w + 7, INK) + L(d, w, col);
const beads = (x0, y0, qx, qy, x1, y1, n, r, cols) => [...Array(n)].map((_, k) => { const t = k / (n - 1), u = 1 - t, x = u * u * x0 + 2 * u * t * qx + t * t * x1, y = u * u * y0 + 2 * u * t * qy + t * t * y1; return circ(x, y, r, cols[k % cols.length], Math.max(2, r * .45)); }).join('');
const bell = (x, y, r = 12) => circ(x, y, r, GOLD, 4) + L(`M${x - r * .6},${y + r * .2} L${x + r * .6},${y + r * .2}`, 2.6) + ell(x - r * .3, y - r * .35, r * .25, r * .2, '#fff');
// ermine fur: white cloud with black tail flecks
const ermine = (cs, flecks) => cloud(cs, '#f8f6f8', 5) + flecks.map(([x, y]) => P(`M${x},${y - 7} l5,10 l-5,4 l-5,-4 Z`, INK, INK, 1.5)).join('');
const kite = (x, y, w, h, col) => P(`M${x - w},${y - h * .3} Q${x - w},${y - h * .42} ${x},${y - h * .42} Q${x + w},${y - h * .42} ${x + w},${y - h * .3} Q${x + w * .9},${y + h * .2} ${x},${y + h * .58} Q${x - w * .9},${y + h * .2} ${x - w},${y - h * .3} Z`, col, INK, 7);

export const CAST = [
  // 1 KNIGHT: visor-up helmet with huge plume, heraldic tabard, kite shield, trembling sword
  { name: 'knight', label: 'Knight', form: 'standard', coat: BLUE, face: 'terrified',
    hat: ({ cx, hy }) => { const o = [];
      // plumes behind the helmet
      o.push(P(`M${cx - 10},${hy - 116} Q${cx - 20},${hy - 250} ${cx + 110},${hy - 268} Q${cx + 160},${hy - 268} ${cx + 156},${hy - 220} Q${cx + 120},${hy - 236} ${cx + 80},${hy - 210} Q${cx + 40},${hy - 180} ${cx + 30},${hy - 116} Z`, '#d8473c', INK, 6), P(`M${cx + 10},${hy - 112} Q${cx + 30},${hy - 200} ${cx + 120},${hy - 196} Q${cx + 158},${hy - 190} ${cx + 152},${hy - 150} Q${cx + 110},${hy - 168} ${cx + 70},${hy - 150} Q${cx + 50},${hy - 136} ${cx + 44},${hy - 108} Z`, '#f6f3f8', INK, 5));
      o.push(...[0, 1, 2, 3].map(k => L(`M${cx + 14 + k * 26},${hy - 200 - k * 12} q10,14 24,14`, 3, '#8f2219')), rect(cx - 12, hy - 132, 24, 30, GOLD, 4, 4));
      // cheek guards
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 88},${hy - 50} L${cx + s * 120},${hy - 50} L${cx + s * 118},${hy + 70} Q${cx + s * 104},${hy + 84} ${cx + s * 92},${hy + 66} Z`, STEEL, INK, 5), circ(cx + s * 104, hy + 40, 4, IRON, 0));
      o.push(fillPts([[cx - 112, hy - 34], [cx - 104, hy - 92], [cx - 52, hy - 124], [cx, hy - 130], [cx + 52, hy - 124], [cx + 104, hy - 92], [cx + 112, hy - 34], [cx + 70, hy - 50], [cx, hy - 56], [cx - 70, hy - 50]], STEEL, 7), hl(`M${cx - 80},${hy - 90} Q${cx - 36},${hy - 118} ${cx + 6},${hy - 118}`, 8, .55));
      // raised pig-face visor
      o.push(P(`M${cx - 106},${hy - 56} Q${cx - 98},${hy - 116} ${cx},${hy - 150} Q${cx + 98},${hy - 116} ${cx + 106},${hy - 56} Q${cx},${hy - 82} ${cx - 106},${hy - 56} Z`, '#c3c8d4', INK, 6), L(`M${cx - 74},${hy - 92} Q${cx},${hy - 112} ${cx + 74},${hy - 92}`, 6), L(`M${cx - 66},${hy - 76} Q${cx},${hy - 94} ${cx + 66},${hy - 76}`, 5), ...[-1, 1].map(s => circ(cx + s * 108, hy - 56, 9, GOLD, 4)));
      return o; },
    details: ({ cx, top, bot }) => [rect(cx - 160, top - 10, 320, 44, '#9aa0ae', 4, 2), ...[...Array(28)].map((_, k) => ell(cx - 150 + (k % 14) * 22 + Math.floor(k / 14) * 11, top + 6 + Math.floor(k / 14) * 16, 7, 5, 'none', IRON, 2.4)),
      P(`M${cx - 120},${top + 70} L${cx},${top + 170} L${cx + 120},${top + 70} L${cx + 120},${top + 120} L${cx},${top + 220} L${cx - 120},${top + 120} Z`, GOLD, INK, 4.5), rect(cx - 160, top + 240, 320, 26, LEATHER, 4, 2), rect(cx - 18, top + 236, 36, 34, GOLD, 4, 4),
      rect(cx - 160, bot - 46, 320, 60, '#9aa0ae', 4, 2), ...[...Array(26)].map((_, k) => ell(cx - 150 + (k % 13) * 24 + Math.floor(k / 13) * 12, bot - 34 + Math.floor(k / 13) * 16, 7, 5, 'none', IRON, 2.4))],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 170, 10), B.arm(1, B.cx + 166, B.top + 50, -20)] }),
    props: ({ cx, top }) => { const x = cx - 172, y = top + 210, o = [];
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 40},${top + 10} Q${cx + s * 110},${top - 10} ${cx + s * 124},${top + 70} L${cx + s * 70},${top + 80} Z`, STEEL, INK, 5), hl(`M${cx + s * 60},${top + 6} Q${cx + s * 96},${top} ${cx + s * 110},${top + 30}`, 5, .6));
      o.push(kite(x, y, 74, 340, BLUE), P(`M${x - 66},${y - 30} L${x},${y + 30} L${x + 66},${y - 30} L${x + 64},${y + 4} L${x},${y + 66} L${x - 64},${y + 4} Z`, GOLD, INK, 4), kite(x, y, 74, 340, 'none'), hl(`M${x - 56},${y - 110} Q${x - 56},${y} ${x - 20},${y + 100}`, 7, .35), star4(x, y - 80, 18, GOLDL));
      return o; },
    over: ({ cx, top }) => { const x = cx + 170, y = top + 40;
      return [P(`M${x - 12},${y - 16} L${x - 14},${y - 330} L${x + 2},${y - 366} L${x + 18},${y - 330} L${x + 16},${y - 16} Z`, STEEL, INK, 5.5), L(`M${x + 2},${y - 30} L${x + 2},${y - 320}`, 3, '#8a90a0'), rect(x - 46, y - 20, 94, 18, GOLD, 4.5, 6), rect(x - 8, y, 20, 54, LEATHER, 4, 4), circ(x + 2, y + 62, 11, GOLD, 4), fist(cx + 166, top + 50, 16),
        ...[[-30, -200], [34, -240], [-28, -120], [36, -150]].map(([dx, dy]) => L(`M${x + dx},${y + dy} q${dx > 0 ? 8 : -8},6 0,14 q${dx > 0 ? -8 : 8},6 0,14`, 3.4))]; } },

  // 2 KING: towering gold crown, ermine collar + red cape, sceptre and a turkey leg
  { name: 'king', label: 'King', form: 'dad', coat: PURPLE, face: 'troll',
    hat: ({ cx, hy }) => { const o = [];
      o.push(fillPts([[cx - 92, hy - 90], [cx - 80, hy - 170], [cx, hy - 196], [cx + 80, hy - 170], [cx + 92, hy - 90]], '#c8372f', 6), hl(`M${cx - 60},${hy - 150} Q${cx - 30},${hy - 180} ${cx + 10},${hy - 184}`, 6, .35));
      const pts = [[cx - 116, hy - 54]]; for (let k = 0; k < 5; k++) { const x = cx - 100 + k * 50; pts.push([x - 20, hy - 104], [x, hy - 232 + Math.abs(k - 2) * 26], [x + 20, hy - 104]); } pts.push([cx + 116, hy - 54]);
      o.push(poly(pts, GOLD, 7), ...[0, 1, 2, 3, 4].map(k => circ(cx - 100 + k * 50, hy - 238 + Math.abs(k - 2) * 26, 13, GOLDL, 5)), hl(`M${cx - 96},${hy - 70} L${cx - 96},${hy - 110}`, 7, .45));
      o.push(rect(cx - 118, hy - 92, 236, 40, GOLD, 6, 6), ...[[-80, '#2f5fae'], [-28, '#d8304a'], [28, '#3fae5a'], [80, '#2f5fae']].map(([t, c]) => ell(cx + t, hy - 72, t ? 13 : 16, 11, c, INK, 4)), circ(cx, hy - 140, 14, '#d8304a', 4));
      return o; },
    behind: ({ cx, top }) => [P(`M${cx - 120},${top} Q${cx - 210},${top + 300} ${cx - 236},${top + 660} Q${cx},${top + 690} ${cx + 236},${top + 660} Q${cx + 210},${top + 300} ${cx + 120},${top} Z`, '#c8372f', INK, 7), ...[-1, 0, 1].map(k => L(`M${cx + k * 90},${top + 120} q${k * 20},300 ${k * 50},520`, 4, '#8f2219')),
      cloud([...Array(11)].map((_, k) => [cx - 220 + k * 44, top + 664 - Math.sin(k / 10 * Math.PI) * 14, 22]), '#f8f6f8', 5)],
    details: ({ cx, top }) => [rect(cx - 160, top + 300, 320, 30, GOLD, 4.5, 2), circ(cx, top + 315, 22, '#d8304a', 4.5), L(`M${cx},${top + 120} L${cx},${top + 290}`, 4, '#4a1d56'), ...[0, 1, 2].map(k => circ(cx + 12, top + 160 + k * 40, 6, GOLD, 3))],
    props: ({ cx, top }) => { const o = [];
      o.push(ermine([[cx - 170, top + 40, 34], [cx - 120, top + 70, 40], [cx - 60, top + 86, 40], [cx, top + 92, 40], [cx + 60, top + 86, 40], [cx + 120, top + 70, 40], [cx + 170, top + 40, 34], [cx - 140, top + 20, 30], [cx + 140, top + 20, 30]], [[cx - 140, top + 70], [cx - 70, top + 96], [cx, top + 106], [cx + 70, top + 96], [cx + 140, top + 70], [cx - 170, top + 38], [cx + 170, top + 38]]));
      o.push(beads(cx - 80, top + 90, cx, top + 190, cx + 80, top + 90, 9, 8, [GOLD]), circ(cx, top + 196, 22, GOLD, 5), circ(cx, top + 196, 10, '#d8304a', 3));
      const sx = cx + 170, sy = top + 210; o.push(pole(sx, sy + 70, sx + 14, top - 170, GOLD, 13), circ(sx + 15, top - 196, 30, GOLD, 6), circ(sx + 15, top - 196, 13, '#d8304a', 4), P(`M${sx + 15},${top - 226} l-12,-24 l12,-14 l12,14 Z`, GOLD, INK, 4), hl(`M${sx},${top - 210} q4,-12 14,-14`, 5, .7), fist(sx, sy, 18));
      // turkey leg
      const tx = cx - 176, ty = top + 200; o.push(P(`M${tx - 10},${ty - 16} Q${tx - 60},${ty - 70} ${tx - 46},${ty - 120} Q${tx - 20},${ty - 160} ${tx + 20},${ty - 120} Q${tx + 40},${ty - 80} ${tx + 10},${ty - 16} Z`, '#c9762e', INK, 5), L(`M${tx - 2},${ty - 10} L${tx},${ty + 40}`, 15), L(`M${tx - 2},${ty - 10} L${tx},${ty + 40}`, 8, '#f3efe6'), circ(tx - 7, ty + 46, 9, '#f3efe6', 4), circ(tx + 7, ty + 46, 9, '#f3efe6', 4), hl(`M${tx - 36},${ty - 100} Q${tx - 30},${ty - 130} ${tx - 6},${ty - 134}`, 5, .5), fist(tx, ty, 18));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 176, B.top + 200, 20), B.arm(1, B.cx + 170, B.top + 210, -10)] }) },

  // 3 QUEEN (Renaissance): giant lace fan collar, red curls, tall crown, pearls
  { name: 'queen', label: 'Renaissance Queen', form: 'lady', coat: '#1f6f5a', face: ['female', 'judging'],
    headBack: ({ cx, hy }) => { const x = cx, y = hy + 40, R = 164, o = [];
      let d = `M${x},${y}`; for (let k = 0; k <= 24; k++) { const a = Math.PI * (.86 + k * 1.28 / 24), r = k % 2 ? R : R - 14; d += ` L${f1(x + Math.cos(a) * r)},${f1(y + Math.sin(a) * r * 1.38)}`; }
      o.push(P(d + ' Z', '#fbf8f2', INK, 6)); for (let k = 0; k <= 12; k++) { const a = Math.PI * (.86 + k * 1.28 / 12); o.push(L(`M${x},${y} L${f1(x + Math.cos(a) * (R - 14))},${f1(y + Math.sin(a) * (R - 14) * 1.38)}`, 2.4, '#c9c2d4')); }
      o.push(`<path d="${[...Array(21)].map((_, k) => { const a = Math.PI * (.9 + k * 1.2 / 20); return (k ? 'L' : 'M') + f1(x + Math.cos(a) * (R - 30)) + ',' + f1(y + Math.sin(a) * (R - 30) * 1.38); }).join(' ')}" fill="none" stroke="${GOLD}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>`);
      o.push(cloud([[cx - 100, hy - 10, 26], [cx + 100, hy - 10, 26], [cx - 104, hy + 26, 22], [cx + 104, hy + 26, 22]], '#d0572a', 5));
      return o; },
    hat: ({ cx, hy }) => { const o = [], RD = '#d0572a';
      o.push(fillPts([[cx - 40, hy - 140], [cx - 46, hy - 196], [cx - 20, hy - 214], [cx, hy - 256], [cx + 20, hy - 214], [cx + 46, hy - 196], [cx + 40, hy - 140]], GOLD, 6), ...[-28, 0, 28].map(t => circ(cx + t, hy - 196 - (t ? 0 : 50), 7, '#fff', 3)), ell(cx, hy - 168, 10, 12, '#d8304a', INK, 3.5));
      o.push(cloud([[cx - 96, hy - 50, 26], [cx - 78, hy - 90, 30], [cx - 40, hy - 118, 32], [cx, hy - 126, 32], [cx + 40, hy - 118, 32], [cx + 78, hy - 90, 30], [cx + 96, hy - 50, 26], [cx - 104, hy - 18, 20], [cx + 104, hy - 18, 20]], RD, 5.5));
      o.push(...[[-60, -96], [-14, -112], [34, -108], [76, -76], [-86, -60]].map(([dx, dy]) => L(`M${cx + dx},${hy + dy} q8,-8 16,0`, 3, '#9a3a14')), beads(cx - 84, hy - 64, cx, hy - 92, cx + 84, hy - 64, 9, 5.5, ['#fff']));
      return o; },
    details: ({ cx, top }) => [P(`M${cx - 60},${top - 10} L${cx + 60},${top - 10} L${cx},${top + 220} Z`, GOLD, INK, 4.5), ...[0, 1, 2, 3].map(k => circ(cx, top + 20 + k * 46, 9 - k, '#d8304a', 3)), ...[[-110, 220], [110, 220], [-140, 320], [140, 320], [-60, 300], [60, 300], [0, 360]].map(([dx, dy]) => circ(cx + dx, top + dy, 7, '#fff', 2.4)), L(`M${cx - 120},${top + 156} Q${cx},${top + 200} ${cx + 120},${top + 156}`, 5, GOLD)],
    props: ({ cx, top }) => [...[-1, 1].map(s => cloud([[cx + s * 64, top + 24, 26], [cx + s * 86, top + 52, 24]], '#2a8a72', 5)), beads(cx - 60, top + 30, cx, top + 160, cx + 60, top + 30, 11, 6, ['#fbf8f2']),
      pole(cx + 104, top + 210, cx + 140, top + 80, '#3f8a3a', 5), ...[0, 1, 2, 3, 4].map(k => { const a = k * Math.PI * 2 / 5; return ell(cx + 142 + Math.cos(a) * 10, top + 70 + Math.sin(a) * 10, 12, 12, '#d8304a', INK, 3); }), circ(cx + 142, top + 70, 8, '#a8203a', 3), fist(cx + 104, top + 180, 13)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 104, B.top + 180, 16)] }) },

  // 4 PRINCESS: tall hennin cone with streaming veil, long golden hair
  { name: 'princess', label: 'Princess', form: 'lady', coat: PINK, face: ['female', 'swoon'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 112, hy - 70], [cx - 124, hy + 40], [cx - 118, hy + 160], [cx - 86, hy + 186], [cx, hy + 120], [cx + 86, hy + 186], [cx + 118, hy + 160], [cx + 124, hy + 40], [cx + 112, hy - 70], [cx, hy - 104]], '#f2c84a', 6), ...[-1, 1].map(s => L(`M${cx + s * 110},${hy + 40} q${s * 8},60 ${-s * 4},130`, 3, '#c99a24'))],
    hat: ({ cx, hy }) => { const o = [], tx = cx + 34, ty = hy - 318;
      o.push(`<path d="M${tx},${ty} Q${cx + 150},${hy - 160} ${cx + 138},${hy + 40} Q${cx + 132},${hy + 120} ${cx + 138},${hy + 168} q-12,-14 -24,0 q-12,14 -22,0 q-10,-12 -20,0 Q${cx + 80},${hy + 40} ${cx + 94},${hy - 60} Q${cx + 104},${hy - 180} ${tx - 4},${ty + 40} Z" fill="#fdf2f8" fill-opacity=".62" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`, L(`M${tx + 6},${ty + 50} Q${cx + 128},${hy - 120} ${cx + 122},${hy + 120} M${tx},${ty + 70} Q${cx + 110},${hy - 120} ${cx + 100},${hy + 60}`, 2.4, '#d8bccb'));
      o.push(P(`M${cx - 64},${hy - 86} Q${cx - 30},${hy - 200} ${tx},${ty} Q${cx + 50},${hy - 200} ${cx + 64},${hy - 86} Q${cx},${hy - 100} ${cx - 64},${hy - 86} Z`, '#f6c4dc', INK, 6));
      for (let k = 0; k < 5; k++) { const y = hy - 116 - k * 42, w = 54 - k * 10; o.push(L(`M${cx - w + k * 4},${y + 6} Q${cx + 4 + k * 4},${y - 10} ${cx + w + k * 6},${y - 8}`, 4.5, GOLD)); }
      o.push(hl(`M${cx - 40},${hy - 110} Q${cx - 14},${hy - 210} ${tx - 10},${ty + 30}`, 6, .5), rect(cx - 104, hy - 96, 208, 18, GOLD, 4.5, 8), ...[-60, 0, 60].map(t => circ(cx + t, hy - 87, 6, t ? '#fff' : '#3fae7a', 2.6)));
      return o; },
    behind: ({ cx, top }) => [...[-1, 1].map(s => P(`M${cx + s * 40},${top + 30} Q${cx + s * 140},${top + 60} ${cx + s * 150},${top + 200} L${cx + s * 140},${top + 400} Q${cx + s * 110},${top + 420} ${cx + s * 90},${top + 380} L${cx + s * 96},${top + 140} Z`, '#f6c4dc', INK, 5))],
    details: ({ cx, top }) => [P(`M${cx - 66},${top - 6} Q${cx},${top + 50} ${cx + 66},${top - 6}`, 'none', GOLD, 8), P(`M${cx - 130},${top + 200} Q${cx},${top + 250} ${cx + 130},${top + 200} L${cx + 130},${top + 226} Q${cx},${top + 276} ${cx - 130},${top + 226} Z`, GOLD, INK, 4), circ(cx, top + 244, 12, '#3fae7a', 3.5), L(`M${cx},${top + 256} L${cx},${top + 400}`, 7, GOLD), ...[[-90, 300], [80, 320], [-40, 360], [120, 370]].map(([dx, dy]) => star4(cx + dx, top + dy, 9, '#fff'))],
    arms: B => ({ front: [B.arm(-1, B.cx - 10, B.top + 120, 50), B.arm(1, B.cx + 10, B.top + 120, -50)] }),
    props: ({ cx, top }) => [fist(cx - 10, top + 120, 13), fist(cx + 10, top + 120, 13)] },

  // 5 JESTER (kid): three-point bell hat, harlequin diamonds, zig-zag collar, marotte
  { name: 'jester', label: 'Jester', form: 'kid', coat: '#d8473c', face: 'hysterical',
    hat: ({ cx, hy }) => { const o = [], Y = '#f2c230', R = '#d8473c', G = '#3f8a3a';
      o.push(P(`M${cx - 96},${hy - 56} Q${cx - 106},${hy - 206} ${cx - 126},${hy - 156} Q${cx - 112},${hy - 160} ${cx - 106},${hy - 132} Q${cx - 90},${hy - 170} ${cx - 20},${hy - 110} Z`, Y, INK, 6), bell(cx - 122, hy - 142, 13));
      o.push(P(`M${cx + 96},${hy - 56} Q${cx + 106},${hy - 206} ${cx + 126},${hy - 156} Q${cx + 112},${hy - 160} ${cx + 106},${hy - 132} Q${cx + 90},${hy - 170} ${cx + 20},${hy - 110} Z`, G, INK, 6), bell(cx + 122, hy - 142, 13));
      o.push(P(`M${cx - 56},${hy - 100} Q${cx - 50},${hy - 230} ${cx + 30},${hy - 254} Q${cx + 90},${hy - 260} ${cx + 110},${hy - 210} Q${cx + 70},${hy - 226} ${cx + 50},${hy - 190} Q${cx + 40},${hy - 140} ${cx + 56},${hy - 100} Z`, R, INK, 6), bell(cx + 112, hy - 196, 14));
      o.push(fillPts([[cx - 104, hy - 46], [cx - 96, hy - 98], [cx - 50, hy - 124], [cx, hy - 128], [cx + 50, hy - 124], [cx + 96, hy - 98], [cx + 104, hy - 46], [cx, hy - 62]], Y, 7), L(`M${cx},${hy - 126} L${cx},${hy - 60}`, 4), P(`M${cx},${hy - 128} Q${cx + 96},${hy - 112} ${cx + 104},${hy - 46} L${cx},${hy - 62} Z`, R, INK, 4), hl(`M${cx - 76},${hy - 96} Q${cx - 40},${hy - 120} ${cx - 10},${hy - 120}`, 7, .5));
      o.push(brush(cx - 106, hy - 48, cx, hy - 66, cx + 106, hy - 48, 14, { col: '#3f8a3a', tip: .8 }));
      return o; },
    details: ({ cx, top }) => { const o = [], s = 40;
      for (let r = 0; r < 7; r++) for (let k = -4; k <= 4; k++) { const x = cx + k * s + (r % 2) * s / 2, y = top + r * s * .9; o.push(P(`M${x},${y - s * .45} L${x + s / 2},${y} L${x},${y + s * .45} L${x - s / 2},${y} Z`, (r + k) % 2 ? '#f2c230' : '#d8473c', INK, 2)); }
      return o; },
    props: ({ cx, top }) => { const o = [], cols = ['#f2c230', '#3f8a3a', '#d8473c'];
      for (let k = 0; k < 7; k++) { const x = cx - 96 + k * 32; o.push(P(`M${x - 18},${top - 6} L${x + 18},${top - 6} L${x},${top + 40 + (k % 2) * 6} Z`, cols[k % 3], INK, 4)); if (k % 2 === 0) o.push(bell(x, top + 46, 8)); }
      // marotte: stick with a mini jester head
      const x = cx + 192, y = top - 120; o.push(pole(cx + 120, top + 70, x, y + 30, WOOD, 8), P(`M${x - 20},${y - 18} Q${x - 46},${y - 50} ${x - 40},${y - 66} Q${x - 10},${y - 46} ${x},${y - 30} Q${x + 10},${y - 46} ${x + 40},${y - 66} Q${x + 46},${y - 50} ${x + 20},${y - 18} Z`, '#3f8a3a', INK, 4), circ(x, y, 26, '#fbf8f6', 5), bell(x - 40, y - 64, 7), bell(x + 40, y - 64, 7),
        ell(x - 8, y - 4, 3, 4, INK), ell(x + 8, y - 4, 3, 4, INK), P(`M${x - 11},${y + 7} Q${x},${y + 20} ${x + 11},${y + 7} Z`, INK, INK, 2), fist(cx + 120, top + 70, 13));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 120, B.top + 20, -20), B.arm(1, B.cx + 120, B.top + 70, -16)] }) },

  // 6 FRIAR (big boi): tonsure ring, brown habit, rope belt, big book
  { name: 'monk', label: 'Friar', form: 'bigboi', coat: '#7a5236', face: 'tired',
    hat: ({ cx, hy }) => { const o = [], cs = [];
      for (let k = 0; k <= 12; k++) { const a = Math.PI * (k / 12), x = cx - Math.cos(a) * 104, y = hy - 40 - Math.sin(a) * 22 + (k === 0 || k === 12 ? 30 : 0); cs.push([x, y, 18]); }
      cs.push([cx - 106, hy + 14, 16], [cx + 106, hy + 14, 16]);
      o.push(cloud(cs, '#6e4527', 5), hl(`M${cx - 60},${hy - 86} Q${cx - 30},${hy - 104} ${cx + 4},${hy - 104}`, 9, .9));
      return o; },
    details: ({ cx, top }) => [...[-1, 1].map(s => L(`M${cx + s * 120},${top + 140} q${s * 10},160 ${s * 40},300`, 4, '#5e3a24'))],
    props: ({ cx, top }) => { const o = [];
      o.push(P(`M${cx - 170},${top + 10} Q${cx},${top + 150} ${cx + 170},${top + 10} Q${cx + 150},${top + 90} ${cx},${top + 120} Q${cx - 150},${top + 90} ${cx - 170},${top + 10} Z`, '#8f6444', INK, 6), L(`M${cx - 110},${top + 50} Q${cx},${top + 112} ${cx + 110},${top + 50}`, 4, '#5e3a24'));
      o.push(cord(`M${cx - 236},${top + 300} Q${cx},${top + 330} ${cx + 236},${top + 300}`, '#efe6cc', 8), cord(`M${cx + 40},${top + 318} q10,80 -6,160 M${cx + 64},${top + 316} q20,70 18,140`, '#efe6cc', 7), ...[[34, 400], [36, 470], [80, 390], [82, 450]].map(([dx, dy]) => circ(cx + dx, top + dy, 9, '#efe6cc', 3.5)));
      // big book
      const x = cx - 50, y = top + 170; o.push(rot(-8, x, y, rect(x - 92, y - 70, 184, 140, '#f3efe6', 5, 6) + rect(x - 100, y - 78, 184, 140, '#a8323a', 6, 8) + [[-100, -78], [62, -78], [-100, 40], [62, 40]].map(([dx, dy]) => P(`M${x + dx + (dx > 0 ? 22 : 0)},${y + dy + (dy > 0 ? 22 : 0)} l${dx > 0 ? -22 : 22},0 l${dx > 0 ? 22 : -22},${dy > 0 ? -22 : 22} Z`, GOLD, INK, 3)).join('') + circ(x - 8, y - 8, 22, GOLD, 4) + star4(x - 8, y - 8, 12, '#fff') + L(`M${x + 70},${y - 70} L${x + 70},${y + 54}`, 6, GOLD)), fist(cx - 150, top + 180, 18), fist(cx + 40, top + 160, 18));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 180, -20), B.arm(1, B.cx + 40, B.top + 160, 40)] }) },

  // 7 WITCH (elder): giant crooked pointy hat, stringy grey hair, broom, bubbling potion
  { name: 'witch', label: 'Witch', form: 'elder', coat: '#3a2a4a', face: ['elder', 'cackle'],
    headBack: ({ cx, hy }) => [fillPts([[cx - 108, hy - 60], [cx - 130, hy + 30], [cx - 140, hy + 140], [cx - 100, hy + 130], [cx - 104, hy + 170], [cx - 60, hy + 100], [cx + 60, hy + 100], [cx + 104, hy + 170], [cx + 100, hy + 130], [cx + 140, hy + 140], [cx + 130, hy + 30], [cx + 108, hy - 60]], '#b8b4c4', 6), ...[-1, 1].map(s => L(`M${cx + s * 118},${hy + 10} q${s * 10},60 ${s * 6},120`, 3, '#8a8498'))],
    hat: ({ cx, hy }) => { const o = [], H = '#2e2a3a';
      o.push(P(`M${cx - 160},${hy - 70} Q${cx - 116},${hy - 100} ${cx},${hy - 104} Q${cx + 116},${hy - 100} ${cx + 164},${hy - 80} Q${cx + 116},${hy - 54} ${cx},${hy - 56} Q${cx - 116},${hy - 54} ${cx - 160},${hy - 70} Z`, H, INK, 7));
      o.push(fillPts([[cx - 74, hy - 90], [cx - 44, hy - 190], [cx + 4, hy - 270], [cx + 60, hy - 312], [cx + 120, hy - 296], [cx + 54, hy - 262], [cx + 30, hy - 200], [cx + 72, hy - 90]], H, 7));
      o.push(P(`M${cx - 70},${hy - 96} Q${cx},${hy - 116} ${cx + 72},${hy - 96} L${cx + 66},${hy - 128} Q${cx},${hy - 148} ${cx - 62},${hy - 128} Z`, '#7a4aa0', INK, 5), rect(cx - 18, hy - 136, 36, 36, GOLD, 5, 4), rect(cx - 8, hy - 126, 16, 16, '#7a4aa0', 3, 2));
      o.push(rot(-12, cx + 10, hy - 210, rect(cx - 6, hy - 230, 36, 34, '#4a3a5e', 4, 2) + L(`M${cx - 2},${hy - 226} l28,26 M${cx + 26},${hy - 226} l-28,26`, 2.4, '#b8b4c4')), hl(`M${cx - 44},${hy - 150} Q${cx - 20},${hy - 230} ${cx + 30},${hy - 280}`, 7, .3), star4(cx + 130, hy - 300, 12, '#c9b6e8'));
      return o; },
    details: ({ cx, top }) => [rect(cx - 130, top + 150, 260, 26, '#1d1a26', 4, 2), rect(cx - 14, top + 146, 28, 34, GOLD, 4, 4), P(`M${cx - 60},${top - 8} L${cx},${top + 60} L${cx + 60},${top - 8} Z`, '#7a4aa0', INK, 4), ...[[-60, 220], [50, 90]].map(([dx, dy]) => rect(cx + dx, top + dy, 34, 30, '#5a3a6e', 3, 2))],
    props: ({ cx, top }) => { const o = [], bx = cx + 150;
      o.push(pole(bx, top - 60, bx + 10, top + 450, WOOD, 11), P(`M${bx - 6},${top + 430} L${bx + 26},${top + 430} Q${bx + 70},${top + 500} ${bx + 84},${top + 566} L${bx - 64},${top + 566} Q${bx - 44},${top + 500} ${bx - 6},${top + 430} Z`, '#d9b25a', INK, 5), ...[-40, -16, 8, 32, 56].map(t => L(`M${bx + 10 + t * .3},${top + 446} L${bx + 10 + t},${top + 560}`, 2.6, '#a8822a')), rect(bx - 12, top + 440, 44, 14, '#8f2b1e', 3.5, 3), fist(bx + 4, top + 180, 15));
      const px = cx - 130, py = top + 170; o.push(P(`M${px - 12},${py - 40} L${px + 12},${py - 40} L${px + 12},${py - 20} Q${px + 44},${py} ${px + 40},${py + 30} Q${px + 30},${py + 56} ${px},${py + 56} Q${px - 30},${py + 56} ${px - 40},${py + 30} Q${px - 44},${py} ${px - 12},${py - 20} Z`, '#6cd06a', INK, 5), rect(px - 14, py - 52, 28, 16, WOOD, 3.5, 3), circ(px - 14, py + 20, 6, '#c8f5b0', 2.4), circ(px + 10, py + 36, 4, '#c8f5b0', 2), hl(`M${px - 26},${py + 6} q-2,20 10,32`, 5, .6), ...[[0, -76, 7], [12, -100, 5], [-8, -118, 4]].map(([dx, dy, r]) => circ(px + dx, py + dy, r, '#c8f5b0', 2.6)), fist(px, py - 10, 15));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 130, B.top + 160, -20), B.arm(1, B.cx + 154, B.top + 180, 10)] }) },

  // 8 BLACKSMITH (gigachad): bandana, leather apron, raised hammer, anvil with a glowing horseshoe
  { name: 'blacksmith', label: 'Blacksmith', form: 'chad', coat: '#4a4652', face: 'cool',
    hat: ({ cx, hy }) => [P(`M${cx + 90},${hy - 70} q40,-10 56,20 q-30,4 -40,30 Z M${cx + 92},${hy - 62} q34,20 40,56 q-26,-6 -44,-30 Z`, '#c8372f', INK, 5), fillPts([[cx - 106, hy - 40], [cx - 100, hy - 96], [cx - 50, hy - 124], [cx, hy - 128], [cx + 50, hy - 124], [cx + 100, hy - 96], [cx + 106, hy - 40], [cx, hy - 66]], '#c8372f', 7), ...[[-50, -100], [10, -112], [60, -96], [-20, -80]].map(([dx, dy]) => circ(cx + dx, hy + dy, 6, '#fff', 0)), hl(`M${cx - 76},${hy - 92} Q${cx - 40},${hy - 116} ${cx - 6},${hy - 116}`, 7, .5)],
    details: ({ cx, top }) => [P(`M${cx - 110},${top + 70} L${cx + 110},${top + 70} L${cx + 120},${top + 400} L${cx - 120},${top + 400} Z`, LEATHER, INK, 5), L(`M${cx - 110},${top + 70} L${cx - 60},${top - 10} M${cx + 110},${top + 70} L${cx + 60},${top - 10}`, 10, '#5e3a1e'), rect(cx - 60, top + 170, 120, 70, '#7a4a28', 4, 6), L(`M${cx - 30},${top + 160} l10,60 M${cx + 10},${top + 156} l-6,64`, 6, IRON), ...[[-70, 300], [60, 330], [-20, 120]].map(([dx, dy]) => ell(cx + dx, top + dy, 16, 9, '#3a2a20', '', 0)), hl(`M${cx - 96},${top + 90} L${cx - 104},${top + 360}`, 8, .3)],
    props: ({ cx, top }) => { const o = [], ax = cx - 166, ay = 880;
      o.push(P(`M${ax - 80},${ay} L${ax + 70},${ay} Q${ax + 86},${ay} ${ax + 86},${ay + 14} L${ax + 40},${ay + 30} L${ax + 40},${ay + 70} L${ax + 70},${ay + 70} L${ax + 70},${ay + 124} L${ax - 70},${ay + 124} L${ax - 70},${ay + 70} L${ax - 40},${ay + 70} L${ax - 40},${ay + 34} Q${ax - 70},${ay + 30} ${ax - 80},${ay} Z`, '#4a4e5c', INK, 6), hl(`M${ax - 60},${ay + 8} L${ax + 60},${ay + 8}`, 5, .4));
      o.push(P(`M${ax - 40},${ay - 4} q0,-40 34,-40 q34,0 34,40 l-16,0 q0,-24 -18,-24 q-18,0 -18,24 Z`, '#ff8a2a', INK, 4), L(`M${ax - 26},${ay - 26} q20,-14 40,0`, 3, '#ffe08a'));
      o.push(cord(`M${cx - 214},${top + 262} L${ax - 18},${ay - 30}`, IRON, 6), cord(`M${cx - 200},${top + 262} L${ax + 4},${ay - 34}`, IRON, 6), fist(cx - 210, top + 262, 20));
      o.push(...[[-60, -90, 14], [40, -110, 10], [-10, -140, 8], [80, -70, 9]].map(([dx, dy, r]) => star4(ax + dx, ay + dy, r, '#ffb43a')));
      return o; },
    over: ({ cx, top }) => { const x = cx + 196, y = top - 10;
      return [pole(x, y + 40, x - 6, y - 210, WOOD, 13), P(`M${x - 66},${y - 270} L${x + 50},${y - 270} L${x + 50},${y - 200} L${x - 66},${y - 200} Q${x - 80},${y - 235} ${x - 66},${y - 270} Z`, '#5a5f70', INK, 6), hl(`M${x - 56},${y - 258} L${x + 36},${y - 258}`, 6, .45), fist(x, y, 20), ...[[-80, -300], [60, -300], [-96, -240]].map(([dx, dy]) => L(`M${x + dx},${y + dy} l${dx > 0 ? 14 : -14},-10`, 4))]; },
    arms: B => ({ front: [B.arm(-1, B.cx - 210, B.top + 262, 30), B.arm(1, B.cx + 196, B.top - 10, 60)] }) },

  // 9 PLAGUE DOCTOR (noodle): long-beak mask with glass eyes, wide-brim hat, long coat, cane
  { name: 'plague', label: 'Plague Doctor', form: 'noodle', coat: '#2a2a30', face: 'evil',
    headBack: ({ cx, hy }) => [fillPts([[cx - 118, hy - 40], [cx - 126, hy + 60], [cx - 100, hy + 140], [cx, hy + 150], [cx + 100, hy + 140], [cx + 126, hy + 60], [cx + 118, hy - 40], [cx, hy - 110]], '#2a2a30', 6)],
    faceTop: ({ cx, hy }) => { const o = [], M = '#e6dcc4';
      o.push(fillPts([[cx - 94, hy - 54], [cx - 98, hy + 10], [cx - 76, hy + 62], [cx, hy + 80], [cx + 76, hy + 62], [cx + 98, hy + 10], [cx + 94, hy - 54], [cx, hy - 66]], M, 6));
      o.push(P(`M${cx - 34},${hy + 4} Q${cx - 20},${hy + 110} ${cx + 30},${hy + 190} Q${cx + 46},${hy + 200} ${cx + 44},${hy + 180} Q${cx + 30},${hy + 90} ${cx + 38},${hy + 4} Q${cx},${hy + 20} ${cx - 34},${hy + 4} Z`, M, INK, 6), L(`M${cx + 2},${hy + 20} Q${cx + 8},${hy + 110} ${cx + 38},${hy + 186}`, 3, '#b8ac90'), hl(`M${cx - 18},${hy + 30} Q${cx - 6},${hy + 100} ${cx + 20},${hy + 150}`, 5, .6), circ(cx - 4, hy + 40, 4, '#b8ac90', 0), circ(cx + 14, hy + 40, 4, '#b8ac90', 0));
      for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 26; o.push(circ(ex, ey, 27, '#b8862e', 6), `<circle cx="${ex}" cy="${ey}" r="19" fill="#2a1a1f" fill-opacity=".55"/>`, P(`M${ex - s * 14},${ey - 6} L${ex + s * 12},${ey + 2} Q${ex},${ey + 8} ${ex - s * 14},${ey - 6} Z`, '#fff6b0', 'none', 0), ell(ex + s * 2, ey, 2.6, 3.6, INK), L(`M${ex - 12},${ey - 10} q6,-6 14,-6`, 3, '#fff')); }
      o.push(L(`M${cx - 90},${hy + 20} q20,10 30,30 M${cx + 90},${hy + 20} q-20,10 -30,30`, 3, '#b8ac90'));
      return o; },
    hat: ({ cx, hy }) => [`<ellipse cx="${cx}" cy="${hy - 70}" rx="150" ry="24" fill="#24222c" stroke="${INK}" stroke-width="7"/>`, P(`M${cx - 72},${hy - 74} L${cx - 66},${hy - 170} Q${cx},${hy - 180} ${cx + 66},${hy - 170} L${cx + 72},${hy - 74} Q${cx},${hy - 62} ${cx - 72},${hy - 74} Z`, '#24222c', INK, 7), P(`M${cx - 70},${hy - 104} Q${cx},${hy - 92} ${cx + 70},${hy - 104} L${cx + 70},${hy - 82} Q${cx},${hy - 70} ${cx - 70},${hy - 82} Z`, '#6b2d3a', INK, 4), rect(cx - 12, hy - 104, 24, 26, '#b8862e', 4, 3), hl(`M${cx - 54},${hy - 160} L${cx - 58},${hy - 112}`, 6, .3), hl(`M${cx - 140},${hy - 78} Q${cx - 100},${hy - 92} ${cx - 60},${hy - 92}`, 4, .3)],
    behind: ({ cx, top }) => [P(`M${cx - 62},${top + 60} L${cx - 186},${top + 790} Q${cx},${top + 820} ${cx + 186},${top + 790} L${cx + 62},${top + 60} Z`, '#2a2a30', INK, 6), ...[-1, 1].map(s => L(`M${cx + s * 40},${top + 300} L${cx + s * 110},${top + 790}`, 4, '#45455a'))],
    details: ({ cx, top }) => [L(`M${cx},${top + 20} L${cx},${top + 400}`, 4, '#45455a'), ...[0, 1, 2, 3, 4].map(k => circ(cx + 14, top + 160 + k * 46, 6, '#b8862e', 3)), rect(cx - 70, top + 260, 140, 22, '#4a2a20', 4, 2)],
    props: ({ cx, top }) => [pole(cx + 110, top + 160, cx + 122, top + 846, '#24222c', 9), circ(cx + 109, top + 154, 12, '#b8862e', 4), fist(cx + 110, top + 200, 14)],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1]), B.arm(1, B.cx + 110, B.top + 200, 16)] }) },

  // 10 OUTLAW ARCHER: peaked cap with a long red feather, giant longbow, quiver of arrows
  { name: 'outlaw', label: 'Outlaw Archer', form: 'standard', coat: GREEN, face: 'flirty',
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 40},${hy - 92} Q${cx - 90},${hy - 200} ${cx - 112},${hy - 278} Q${cx - 90},${hy - 250} ${cx - 78},${hy - 196} Q${cx - 60},${hy - 140} ${cx - 20},${hy - 96} Z`, '#d8473c', INK, 5), L(`M${cx - 44},${hy - 104} Q${cx - 84},${hy - 186} ${cx - 106},${hy - 262}`, 2.6, '#8f2219'));
      o.push(fillPts([[cx - 110, hy - 44], [cx - 100, hy - 106], [cx - 40, hy - 146], [cx + 40, hy - 160], [cx + 150, hy - 194], [cx + 100, hy - 110], [cx + 110, hy - 44], [cx, hy - 60]], '#4f9a3a', 7));
      o.push(P(`M${cx - 116},${hy - 40} Q${cx - 120},${hy - 90} ${cx - 90},${hy - 96} Q${cx},${hy - 70} ${cx + 120},${hy - 100} Q${cx + 124},${hy - 60} ${cx + 110},${hy - 36} Q${cx},${hy - 64} ${cx - 116},${hy - 40} Z`, '#2f6e2a', INK, 6), hl(`M${cx - 70},${hy - 110} Q${cx - 20},${hy - 140} ${cx + 40},${hy - 150}`, 7, .4));
      return o; },
    behind: ({ cx, top }) => [rot(30, cx + 96, top + 80, rect(cx + 72, top - 40, 50, 230, LEATHER, 5, 10) + L(`M${cx + 72},${top - 10} L${cx + 122},${top - 10}`, 5, '#5e3a1e')), ...[0, 1, 2].map(k => rot(30, cx + 96, top + 80, L(`M${cx + 82 + k * 15},${top - 40} L${cx + 82 + k * 15},${top - 110}`, 4) + P(`M${cx + 82 + k * 15},${top - 110} l-8,22 l0,26 l8,-12 l8,12 l0,-26 Z`, k % 2 ? '#f3efe6' : '#d8473c', INK, 3)))],
    details: ({ cx, top, bot }) => [P(`M${cx - 30},${top - 6} L${cx},${top + 60} L${cx + 30},${top - 6} Z`, '#f3efe6', INK, 4), L(`M${cx - 12},${top + 16} l24,10 M${cx - 12},${top + 34} l24,10`, 3, '#5e3a1e'), rect(cx - 160, top + 210, 320, 26, LEATHER, 4, 2), rect(cx - 16, top + 206, 32, 34, GOLD, 4, 4), rect(cx + 40, top + 236, 46, 50, '#7a4a28', 4, 6),
      `<path d="M${cx - 160},${bot - 40} ${[...Array(8)].map((_, k) => `L${cx - 140 + k * 40},${bot - 10} L${cx - 120 + k * 40},${bot - 40}`).join(' ')} L${cx + 160},${bot + 20} L${cx - 160},${bot + 20} Z" fill="#2f6e2a" stroke="${INK}" stroke-width="4"/>`],
    props: ({ cx, top }) => { const x = cx - 150, o = [];
      o.push(cord(`M${x},${top - 360} Q${x - 160},${top + 140} ${x},${top + 600}`, '#9b6b3e', 11), L(`M${x},${top - 360} L${x},${top + 600}`, 2.4), rect(x - 92, top + 100, 24, 60, '#5e3a1e', 4, 6), hl(`M${x - 40},${top - 200} Q${x - 92},${top + 40} ${x - 80},${top + 80}`, 4, .4));
      o.push(P(`M${cx - 60},${top - 6} Q${cx - 90},${top + 40} ${cx - 50},${top + 60} L${cx + 50},${top + 60} Q${cx + 90},${top + 40} ${cx + 60},${top - 6} Z`, '#2f6e2a', INK, 5), fist(x - 80, top + 128, 16));
      return o; },
    arms: B => ({ front: [B.arm(-1, B.cx - 230, B.top + 128, 10), B.arm(1, B.cx + 110, B.top + 230, 20)] }) },
];
