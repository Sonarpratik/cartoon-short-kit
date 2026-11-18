// EXTRA EXPRESSION SETS (CB 20:54): female, baby, elder + lip-sync mouths + blink states.
// Same contract as memes.mjs: each face returns { skin, rot, sx, sy, under: [], over: [], hair? }.
// Rick refs: his women = same face kit + a hair helmet (side part, bun/ponytail); his elders = bald dome with
// white cloud tufts at the sides. No babies in his clips, so the baby set is our own design in the same ink style.
import { INK, brush, headPts, smooth, inkRing, faceKit } from './char2d.mjs';
import { PINK, BLUE, RED, GOLD, GREEN, f1, ell, P, L, drop, star4, star5, heart, brow, teethRow, veins, steamBurst, blush, bird, memeDefs } from './memes.mjs';

export const LIP = '#d9576b', LIPD = '#a8344a', CHEEK = '#f6a8b8', MASC = '#2b2433';
const T = (x, y, s, size = 30, rot = 0, fill = INK) => `<text x="${f1(x)}" y="${f1(y)}" font-family="Arial Black,Arial" font-weight="900" font-size="${size}" text-anchor="middle" fill="${fill}" transform="rotate(${rot} ${f1(x)} ${f1(y)})">${s}</text>`;
const flick = (x, y, dx, dy, w = 4.2) => brush(x, y, x + dx * .35, y + dy * .8, x + dx, y + dy, w, { bias: .12, tip: .12 });
// lashes at the outer end of a lid line (x,y), s = side
const lashes = (x, y, s, k = 1) => [[13, -3], [11, -10], [6, -14]].map(([dx, dy], i) => flick(x - s * i * 5 * k, y - i * .8, s * dx * k, dy * k));
// lashes on the upper outer part of an oval eye
const lashOval = (ex, ey, rx, ry, s, k = 1) => [14, 40, 66].map(d => { const a = d * Math.PI / 180, px = ex + s * rx * Math.cos(a), py = ey - ry * Math.sin(a); return flick(px, py, s * (Math.cos(a) * 12 + 3) * k, -Math.sin(a) * 12 * k - 2); });
// standard lid eye (pupil hangs under the lid line), scaled up for the extra sets
function lidEye(ex, ey, s, { pr = 9, ph = 13, lw = 18, w = 6, look = 0, tilt = 0, lash = 0, open = 1 } = {}) {
  const o = [], ly = ey - 3;
  if (open > 0) o.push(`<path d="M${f1(ex + look - pr)},${f1(ly + 1)} A${pr},${f1(ph * open)} 0 0,0 ${f1(ex + look + pr)},${f1(ly + 1)} Z" fill="${INK}"/>`);
  o.push(brush(ex - s * lw, ly + tilt, ex, ly - 1.5 + tilt * .4, ex + s * lw, ly, w, { tip: .45 }));
  if (lash) o.push(...lashes(ex + s * lw, ly, s, lash));
  return o;
}
// closed eyes: 'up' = happy ^ arc, 'down' = calm u arc. lash hangs off the outer end
function shut(ex, ey, s, { up = true, w = 19, h = 14, lw = 6.5, lash = 0 } = {}) {
  const o = [up ? brush(ex - w, ey + 5, ex, ey - h, ex + w, ey + 5, lw, { tip: .4 }) : brush(ex - w, ey - 4, ex, ey + h, ex + w, ey - 4, lw, { tip: .4 })];
  if (lash) o.push(...(up ? [flick(ex + s * w, ey + 4, s * 11, -2), flick(ex + s * (w - 6), ey - 2, s * 10, -9)] : [flick(ex + s * w * .9, ey - 2, s * 11, 4), flick(ex + s * w * .45, ey + 5, s * 6, 10), flick(ex, ey + 6, s * 1, 11)]));
  return o;
}
const squeeze = (ex, ey, s, w = 18, lw = 7) => [brush(ex - s * w, ey - 13, ex + s * 4, ey - 3, ex + s * w, ey + 1, lw, { tip: .4 }), brush(ex + s * w, ey + 1, ex + s * 4, ey + 5, ex - s * w, ey + 13, lw, { tip: .4 })];
const wEye = (ex, ey, rx, ry, px = 0, py = 0, pr = 4, sw = 5) => [ell(ex, ey, rx, ry, '#fff', INK, sw), ell(ex + px, ey + py, pr, pr * 1.1, INK)];
const glossy = (ex, ey, rx, ry, k = 1) => [ell(ex, ey, rx, ry, INK), ell(ex - rx * .32, ey - ry * .38, rx * .36 * k, ry * .32 * k, '#fff'), ell(ex + rx * .36, ey + ry * .36, rx * .17, rx * .17, '#fff')];
const shockLines = (cx, hy, r0 = 118, r1 = 150, w = 7) => [-.5, -.25, 0, .25, .5].map(a => { const g = -Math.PI / 2 + a; return L(`M${f1(cx + Math.cos(g) * r0)},${f1(hy + Math.sin(g) * r0)} L${f1(cx + Math.cos(g) * r1)},${f1(hy + Math.sin(g) * r1)}`, w); });
const zzz = (cx, hy) => [[92, -70, 14], [118, -98, 18], [148, -132, 22]].map(([dx, dy, z]) => L(`M${cx + dx - z / 2},${hy + dy - z / 2} L${cx + dx + z / 2},${hy + dy - z / 2} L${cx + dx - z / 2},${hy + dy + z / 2} L${cx + dx + z / 2},${hy + dy + z / 2}`, z * .28));
const snot = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d8f2ff" fill-opacity=".75" stroke="${INK}" stroke-width="3"/>` + L(`M${x - r * .5},${y - r * .4} q${r * .17},-${r * .33} ${r * .5},-${r * .38}`, 3, '#fff');
const hand = (x, y, k = 1, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${ell(x, y, 24 * k, 20 * k, '#fff', INK, 4.5)}${[-9, 0, 9].map(t => L(`M${f1(x + t * k)},${f1(y - 18 * k)} L${f1(x + t * k)},${f1(y - 6 * k)}`, 3)).join('')}</g>`;
const fist = (x, y, k = 1) => ell(x, y, 26 * k, 22 * k, '#fff', INK, 5) + [-10, 0, 10].map(t => L(`M${f1(x + t * k - 3)},${f1(y - 16 * k)} q4,6 0,12`, 3)).join('') + L(`M${f1(x - 18 * k)},${f1(y + 6 * k)} q10,6 20,0`, 3);
const shake = (x, y, s) => [0, 1, 2].map(i => L(`M${x + s * i * 9},${y - 18 + i * 2} q${s * 8},18 0,36`, 3.6)).join('');
const kissMark = (x, y, k = 1, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})">${P(`M${x - 16 * k},${y} Q${x - 8 * k},${y - 12 * k} ${x},${y - 5 * k} Q${x + 8 * k},${y - 12 * k} ${x + 16 * k},${y} Q${x},${y + 14 * k} ${x - 16 * k},${y} Z`, LIP, INK, 2.6)}${L(`M${x - 14 * k},${y} Q${x},${y + 3 * k} ${x + 14 * k},${y}`, 2.2)}</g>`;
// female pout / pucker lips
const pucker = (x, y, k = 1) => P(`M${x - 13 * k},${y} Q${x - 9 * k},${y - 13 * k} ${x},${y - 7 * k} Q${x + 9 * k},${y - 13 * k} ${x + 13 * k},${y} Q${x + 10 * k},${y + 14 * k} ${x},${y + 13 * k} Q${x - 10 * k},${y + 14 * k} ${x - 13 * k},${y} Z`, LIP, INK, 3.4) + L(`M${x - 8 * k},${y + 1} q${8 * k},3 ${16 * k},0`, 2.4, LIPD) + L(`M${x - 5 * k},${y - 6 * k} q-2,-4 1,-6`, 2.2, '#fff');
const bushy = (x, y, s, tilt = 0, k = 1) => { const p = [[-22, 4], [-20, -6], [-10, -12], [0, -10], [10, -14], [20, -8], [24, 2], [12, 6], [0, 4], [-12, 7]].map(([dx, dy]) => [x + s * dx * k, y + dy * k + s * dx * tilt * .04 * k]); return P(smooth(p), '#f4f2f6', INK, 3.6); };
const glasses = (cx, ey, dx = 34, r = 22, rot = 0, k = [1, 1]) => `<g transform="rotate(${rot} ${cx} ${ey})">${[-1, 1].map((s, i) => `<circle cx="${cx + s * dx}" cy="${ey}" r="${r * k[i]}" fill="#e6f4ff" fill-opacity=".35" stroke="${INK}" stroke-width="4.5"/>` + L(`M${cx + s * dx - r * k[i] * .45},${ey - r * k[i] * .5} q${r * .2},-${r * .2} ${r * .45},-${r * .22}`, 2.6, '#fff')).join('')}${L(`M${cx - dx + r * k[0]},${ey - 2} Q${cx},${ey - 10} ${cx + dx - r * k[1]},${ey - 2}`, 4)}</g>`;
const wrinkles = (cx, hy, y = -68) => [brush(cx - 30, hy + y, cx, hy + y - 5, cx + 30, hy + y, 3.6, { tip: .3 }), brush(cx - 22, hy + y - 11, cx, hy + y - 15, cx + 22, hy + y - 11, 3.2, { tip: .3 })];
const crow = (ex, ey, s) => [-7, 0, 7].map(t => brush(ex + s * 22, ey + t * .6, ex + s * 27, ey + t * .9, ex + s * 32, ey + t * 1.4, 2.8, { tip: .3 }));
const jowls = (cx, hy, y = 30) => [-1, 1].map(s => brush(cx + s * 34, hy + y, cx + s * 44, hy + y + 14, cx + s * 40, hy + y + 30, 3.4, { tip: .3 }));
const bEye = (ex, ey, k = 1, lx = 0, ly = 0) => [ell(ex, ey, 14 * k, 17 * k, INK), ell(ex - 4.5 * k + lx, ey - 6.5 * k + ly, 5.5 * k, 6.5 * k, '#fff'), ell(ex + 5 * k + lx * .4, ey + 6.5 * k + ly * .4, 2.6 * k, 2.6 * k, '#fff')];
const cheeks = (cx, hy, y = 38, k = 1) => [-1, 1].map(s => ell(cx + s * 62, hy + y, 21 * k, 12 * k, CHEEK));
const stink = (x, y) => L(`M${x},${y} q10,-8 0,-16 q-10,-8 0,-16 q10,-8 0,-16`, 4, '#7fae4a');

// ---------- HAIR LAYERS ----------
// woman: side-part bob down to the cheeks + top bun (Rick's women: hair helmet, part, bun/ponytail). col / lite / dark
function bob(cx, hy, shape, col = '#7a4a2e', lite = '#b07a4f', dark = '#4f2c1a', tie = '#e8668a') {
  const H = headPts(cx, hy, 100, shape), sc = ([x, y], k) => [cx + (x - cx) * k, hy + (y - hy) * k];
  const outer = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1].map(i => sc(H[i], 1.06));
  const inner = [[cx + 84, hy + 30], [cx + 82, hy - 4], [cx + 72, hy - 38], [cx + 44, hy - 60], [cx + 4, hy - 68], [cx - 32, hy - 84], [cx - 60, hy - 64], [cx - 78, hy - 30], [cx - 84, hy + 28]];
  const back = [ell(cx + 6, hy - 132, 34, 32, col, INK, 5), L(`M${cx - 10},${hy - 140} q14,-14 30,-2 q8,10 -4,18`, 3.4, dark), brush(cx - 14, hy - 148, cx, hy - 160, cx + 22, hy - 152, 6, { col: lite, tip: .3 })];
  const front = [P(smooth([...outer, ...inner]), col, INK, 5),
    brush(cx + 6, hy - 92, cx + 40, hy - 100, cx + 70, hy - 66, 7, { col: lite, tip: .25 }), brush(cx - 70, hy - 66, cx - 58, hy - 92, cx - 38, hy - 100, 5, { col: lite, tip: .25 }),
    L(`M${cx - 32},${hy - 84} Q${cx - 30},${hy - 96} ${cx - 20},${hy - 106}`, 3.6, dark), L(`M${cx + 14},${hy - 72} Q${cx + 44},${hy - 66} ${cx + 62},${hy - 44}`, 3, dark),
    ell(cx + 6, hy - 108, 19, 7, tie, INK, 3)];
  return { back, front };
}
// cloud = circles stroked, then the same circles filled on top: one clean bumpy outline
const cloud = (cs, col = '#f3f1f6', sw = 4.6) => cs.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}" stroke="${INK}" stroke-width="${sw}"/>`).join('') + cs.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r - sw / 2 + .2}" fill="${col}"/>`).join('');
function granny(cx, hy) { // tight grey perm of curls over the top of the head + a pearl hair clip
  const cs = [];
  for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.08 + k * .084); cs.push([cx + Math.cos(a) * 98, hy + Math.sin(a) * 96 - 4, 21]); }
  for (let k = 0; k <= 6; k++) { const a = Math.PI * (1.2 + k * .1); cs.push([cx + Math.cos(a) * 72, hy + Math.sin(a) * 70 - 6, 20]); }
  const curls = cs.filter((_, i) => i % 2 === 0).map(([x, y]) => L(`M${f1(x + 6)},${f1(y - 4)} a6,6 0 1,0 0,8`, 2.6, '#a39cb0')).join('');
  return { back: [], front: [cloud(cs, '#dedae6'), curls, ell(cx + 62, hy - 74, 9, 9, '#fff', INK, 3), L(`M${cx + 58},${hy - 78} q3,-3 6,-2`, 2, '#c9c3d4')] };
}
const curl = (cx, hy) => ({ back: [], front: [L(`M${cx + 2},${hy - 101} C${cx - 10},${hy - 124} ${cx + 22},${hy - 142} ${cx + 28},${hy - 122} C${cx + 32},${hy - 108} ${cx + 12},${hy - 106} ${cx + 13},${hy - 118}`, 6), L(`M${cx - 14},${hy - 99} q-6,-10 -2,-18`, 3.6), L(`M${cx + 18},${hy - 100} q8,-6 14,-4`, 3.6)] });
function gramps(cx, hy) {
  const puff = s => cloud([[84, -30, 15], [102, -24, 17], [112, -4, 16], [106, 16, 15], [92, 28, 12], [86, 6, 15]].map(([dx, dy, r]) => [cx + s * dx, hy + dy, r])) + L(`M${cx + s * 100},${hy - 22} q${s * 8},4 ${s * 8},12 M${cx + s * 102},${hy + 8} q${s * 6},4 ${s * 4},12`, 2.6, '#a9a3b5');
  return { back: [], front: [puff(-1), puff(1), L(`M${cx - 36},${hy - 98} Q${cx - 4},${hy - 124} ${cx + 34},${hy - 100}`, 3), L(`M${cx - 24},${hy - 101} Q${cx + 6},${hy - 130} ${cx + 44},${hy - 96}`, 2.6), ell(cx + 46, hy - 70, 7, 5, '#e8d9cf')] };
}

export const memes2Defs = () => memeDefs() + `
<radialGradient id="skPink" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="#ffd0cc"/><stop offset=".6" stop-color="#f7a39b"/><stop offset="1" stop-color="#e57c75"/></radialGradient>
<linearGradient id="skSepia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5ead6"/><stop offset="1" stop-color="#dcc6a2"/></linearGradient>`;

// ================= FEMALE (16) =================  eyes ~hy-14, dx 34, mouth ~hy+38
export const FEMALE = {
  sassy: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...lidEye(cx + s * 34, hy - 14, s, { open: .55, look: 6, lash: 1, tilt: s < 0 ? 2 : 0 }));
    o.push(brow(cx - 56, hy - 36, cx - 34, hy - 34, cx - 12, hy - 38, 8), brow(cx + 12, hy - 46, cx + 34, hy - 80, cx + 60, hy - 56, 8));
    o.push(P(`M${cx + 2},${hy + 38} Q${cx + 22},${hy + 24} ${cx + 42},${hy + 28} Q${cx + 30},${hy + 48} ${cx + 2},${hy + 38} Z`, LIP, INK, 3.4), L(`M${cx + 46},${hy + 22} q6,4 4,12`, 3));
    o.push(star4(cx + 116, hy - 60, 18), star4(cx + 96, hy - 98, 10), T(cx + 112, hy + 30, 'mhm.', 30, 10));
    return { over: o, rot: -12 }; },
  eyeRoll: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 12; o.push(ell(ex, ey, 21, 24, '#fff', INK, 5), ell(ex + 2, ey - 5, 9, 8, INK), P(`M${ex - 22},${ey - 1} A22,25 0 0,1 ${ex + 22},${ey - 1} Z`, '#f6f1f0', INK, 5), ...lashes(ex + s * 22, ey - 1, s), brow(ex - 18, ey - 38, ex, ey - 46, ex + 18, ey - 38, 7)); }
    o.push(brush(cx - 26, hy + 44, cx + 4, hy + 34, cx + 30, hy + 46, 6, { tip: .4 }), L(`M${cx - 76},${hy - 150} A76,26 0 1,1 ${cx + 76},${hy - 150}`, 5), P(`M${cx + 76},${hy - 164} l10,16 l-18,4 Z`), T(cx + 120, hy + 4, 'ugh', 32, 12));
    return { over: o, rot: 6, sy: .98 }; },
  judging: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...lidEye(cx + s * 34, hy - 12, s, { open: .5, look: -6, lash: 1, lw: 19 }), L(`M${cx + s * 34 - 14},${hy + 4} q14,6 28,0`, 2.6, '#8a7f99'));
    o.push(brow(cx - 56, hy - 30, cx - 34, hy - 30, cx - 12, hy - 28, 8), brow(cx + 12, hy - 34, cx + 34, hy - 44, cx + 56, hy - 38, 8));
    o.push(pucker(cx - 18, hy + 44, .7), L(`M${cx - 30},${hy + 72} q20,8 40,0`, 3.4), T(cx + 116, hy - 60, '...', 54, 0));
    return { over: o, rot: 4, sy: .97 }; },
  blowKiss: (cx, hy) => { const o = [];
    o.push(...shut(cx - 34, hy - 16, -1, { lash: 1 }), ...lidEye(cx + 34, hy - 14, 1, { lash: 1.1, pr: 10, ph: 15 }), brow(cx - 54, hy - 44, cx - 34, hy - 52, cx - 14, hy - 44, 7), brow(cx + 14, hy - 44, cx + 34, hy - 54, cx + 56, hy - 44, 7));
    o.push(pucker(cx + 8, hy + 40, 1.25), ...blush(cx, hy, 1.1), heart(cx + 76, hy + 34, 14), heart(cx + 108, hy + 4, 20), kissMark(cx + 128, hy - 50, 1, -18), kissMark(cx - 120, hy - 66, .8, 20));
    return { over: o, rot: -8 }; },
  omg: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 16; o.push(...wEye(ex, ey, 24, 30, 0, 2, 4), ...lashOval(ex, ey, 24, 30, s, 1.2), brow(ex - 18, ey - 52, ex, ey - 66, ex + 18, ey - 52, 7)); }
    o.push(`<ellipse cx="${cx}" cy="${hy + 52}" rx="17" ry="26" fill="${INK}" stroke="${LIP}" stroke-width="7"/>`, ell(cx, hy + 66, 9, 5, PINK), ...shockLines(cx, hy), T(cx - 118, hy + 10, 'OMG', 34, -18));
    return { over: o, sy: 1.06 }; },
  giggle: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 34, hy - 16, s, { lash: 1 }), brow(cx + s * 34 - 16, hy - 46, cx + s * 34, hy - 54, cx + s * 34 + 16, hy - 46, 7));
    o.push(...blush(cx, hy, 1.15), brush(cx - 20, hy + 34, cx, hy + 48, cx + 22, hy + 34, 5, { tip: .4 }), hand(cx + 10, hy + 46, 1.1, -12), T(cx + 120, hy - 50, 'tee', 28, 14), T(cx + 132, hy - 14, 'hee', 28, 14), star4(cx - 112, hy - 70, 13));
    return { over: o, rot: -10 }; },
  mascaraCry: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 16; o.push(...glossy(ex, ey, 22, 27), ...lashOval(ex, ey, 22, 27, s), L(`M${ex - 22},${ey + 24} Q${ex},${ey + 36} ${ex + 22},${ey + 24}`, 5, BLUE), brow(ex - s * 20, ey - 50, ex, ey - 44, ex + s * 22, ey - 34, 7));
      o.push(P(`M${ex - 4},${ey + 28} q-8,20 2,38 q-10,20 -2,44 q4,10 8,0 q-6,-24 4,-44 q-8,-18 -2,-38 Z`, MASC, MASC, 2), P(`M${ex + 10},${ey + 26} q6,22 -2,40 q4,8 8,0 q4,-22 -2,-40 Z`, MASC, MASC, 2)); }
    o.push(P(`M${cx - 26},${hy + 56} q8,-14 16,-4 q10,-12 20,0 q10,-10 16,4 Q${cx},${hy + 74} ${cx - 26},${hy + 56} Z`, INK, INK, 3), L(`M${cx - 26},${hy + 52} q8,-10 16,-4 q10,-12 20,0 q10,-10 16,4`, 3, LIP), drop(cx + 92, hy + 40, 8), drop(cx - 96, hy + 50, 7));
    return { skin: 'skPale', over: o, sy: 1.02 }; },
  deathGlare: (cx, hy) => { const o = [];
    const under = [...Array(14)].map((_, k) => { const a = k / 14 * Math.PI * 2, r0 = 124, r1 = 150; return L(`M${f1(cx + Math.cos(a) * r0)},${f1(hy + Math.sin(a) * r0)} Q${f1(cx + Math.cos(a + .1) * (r0 + r1) / 2)},${f1(hy + Math.sin(a + .1) * (r0 + r1) / 2)} ${f1(cx + Math.cos(a) * r1)},${f1(hy + Math.sin(a) * r1)}`, 5, '#5c4a78'); });
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 18; o.push(P(`M${ex - 22},${ey + 2} Q${ex},${ey - 12 + s * 0} ${ex + 22},${ey + 2} Q${ex},${ey + 12} ${ex - 22},${ey + 2} Z`, '#fff6b0', INK, 2.6), ell(ex, ey + 1, 2.8, 3.4, RED), ...lashes(ex + s * 22, ey + 2, s, .9), brush(ex - s * 26, ey - 34 + 0, ex, ey - 22, ex + s * 22, ey - 10, 12, { bias: .7, tip: .3 })); }
    o.push(brush(cx - 26, hy + 42, cx, hy + 40, cx + 26, hy + 42, 6, { tip: .5 }), L(`M${cx - 32},${hy + 36} l-4,10 M${cx + 32},${hy + 36} l4,10`, 3));
    return { skin: 'skShadow', under, over: o }; },
  swoon: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 34, hy - 12, s, { up: false, lash: 1.2, w: 18, h: 10 }), brow(cx + s * 34 - s * 18, hy - 36, cx + s * 34, hy - 48, cx + s * 34 + s * 18, hy - 42, 7));
    o.push(...blush(cx, hy, 1.3), brush(cx - 14, hy + 38, cx + 2, hy + 48, cx + 18, hy + 36, 5, { tip: .4 }));
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .55; o.push(heart(cx + Math.cos(a) * 140, hy - 30 + Math.sin(a) * 100, 10 + (k % 2) * 5)); }
    o.push(`<ellipse cx="${cx}" cy="${hy - 132}" rx="84" ry="16" fill="none" stroke="#f05a78" stroke-width="3" stroke-dasharray="6 7" opacity=".7"/>`, star4(cx - 120, hy + 10, 12));
    return { over: o, rot: 16 }; },
  mamaRage: (cx, hy) => { const o = [], y = hy + 22;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 20; o.push(...wEye(ex, ey, 18, 20, 0, 2, 2.8), P(`M${ex - s * 22},${ey - 24} L${ex + s * 22},${ey - 6} L${ex + s * 22},${ey - 26} Z`, '#f0604f', 'none', 0), brush(ex - s * 30, ey - 36, ex, ey - 24, ex + s * 24, ey - 6, 13, { bias: .7, tip: .3 }), ...lashes(ex + s * 20, ey - 8, s, .9)); }
    o.push(P(`M${cx - 54},${y - 10} Q${cx},${y - 20} ${cx + 54},${y - 10} Q${cx + 50},${y + 64} ${cx},${y + 66} Q${cx - 50},${y + 64} ${cx - 54},${y - 10} Z`), P(`M${cx - 48},${y - 8} Q${cx},${y - 17} ${cx + 48},${y - 8} L${cx + 46},${y + 4} Q${cx},${y - 4} ${cx - 46},${y + 4} Z`, '#fff', 'none', 0), teethRow(cx - 46, cx + 46, y - 14, y + 4, 8), ell(cx + 4, y + 46, 24, 11, PINK));
    o.push(...veins(cx + 54, hy - 66, 1.2), ...steamBurst(cx, hy, 1.2), T(cx - 4, hy - 178, '!!!', 40, 0, RED));
    return { skin: 'skRed', over: o, sx: 1.05, sy: .96 }; },
  duckFace: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...lidEye(cx + s * 34, hy - 16, s, { open: .6, lash: 1.2, look: 2 }), brow(cx + s * 34 - 18, hy - 42, cx + s * 34, hy - 54, cx + s * 34 + 18, hy - 44, 7), L(`M${cx + s * 56},${hy + 14} q${s * 4},14 ${-s * 2},26`, 3));
    o.push(P(`M${cx - 30},${hy + 40} Q${cx - 22},${hy + 18} ${cx},${hy + 26} Q${cx + 22},${hy + 18} ${cx + 30},${hy + 40} Q${cx + 22},${hy + 64} ${cx},${hy + 60} Q${cx - 22},${hy + 64} ${cx - 30},${hy + 40} Z`, LIP, INK, 4), L(`M${cx - 26},${hy + 41} Q${cx},${hy + 46} ${cx + 26},${hy + 41}`, 3, LIPD), L(`M${cx - 14},${hy + 28} q4,-3 9,-2`, 2.6, '#fff'));
    o.push(`<g transform="rotate(14 ${cx + 118} ${hy + 18})">${ell(cx + 118, hy + 30, 22, 18, '#fff', INK, 4.5)}<rect x="${cx + 102}" y="${hy - 26}" width="12" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="4.5"/><rect x="${cx + 120}" y="${hy - 30}" width="12" height="48" rx="6" fill="#fff" stroke="${INK}" stroke-width="4.5"/></g>`, star4(cx - 118, hy - 70, 22, '#fff'), star4(cx - 96, hy - 106, 10, '#fff'));
    return { over: o, rot: -14 }; },
  offended: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18; o.push(...wEye(ex, ey, 20, 24, -s * 1, 2, 4), ...lashOval(ex, ey, 20, 24, s), brow(ex - s * 18, ey - 50, ex, ey - 46, ex + s * 22, ey - 36, 7)); }
    o.push(pucker(cx, hy + 40, .62), L(`M${cx - 28},${hy + 66} q28,10 56,0`, 3.6), L(`M${cx - 18},${hy + 78} q18,6 36,0`, 3), T(cx + 118, hy - 56, '!?', 52, 12), ...[-1].map(s => shake(cx - 118, hy + 20, s)));
    return { over: o, rot: 8, sx: 1.03, sy: .94 }; },
  fangirl: (cx, hy) => { const o = [], y = hy + 30;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18; o.push(ell(ex, ey, 25, 31, INK), star5(ex - 6, ey - 8, 11, '#fff'), ell(ex + 9, ey + 12, 4, 4, '#fff'), ...lashOval(ex, ey, 25, 31, s, 1.1), brow(ex - 18, ey - 50, ex, ey - 62, ex + 18, ey - 50, 7)); }
    o.push(P(`M${cx - 44},${y - 4} Q${cx},${y + 4} ${cx + 44},${y - 4} Q${cx + 36},${y + 52} ${cx},${y + 54} Q${cx - 36},${y + 52} ${cx - 44},${y - 4} Z`), P(`M${cx - 36},${y} Q${cx},${y + 6} ${cx + 36},${y} L${cx + 33},${y + 10} Q${cx},${y + 16} ${cx - 33},${y + 10} Z`, '#fff', 'none', 0), ell(cx + 3, y + 38, 20, 9, PINK), ...blush(cx, hy, 1.15));
    o.push(T(cx + 104, hy + 70, 'EEEE!', 28, -10), star4(cx + 118, hy - 70, 18), star4(cx + 100, hy - 112, 10), star4(cx + 130, hy - 20, 9), heart(cx - 118, hy - 4, 10));
    return { over: o, sy: 1.04 }; },
  smug: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 34, hy - 18, s, { up: false, lash: 1, w: 18, h: 8 }), brow(cx + s * 34 - 18, hy - 46, cx + s * 34, hy - 58, cx + s * 34 + 18, hy - 48, 8));
    o.push(L(`M${cx - 20},${hy + 34} q10,10 20,0 q10,10 20,0`, 5), ...blush(cx, hy, .9), star4(cx - 112, hy - 70, 18), T(cx + 114, hy - 74, 'hmhm~', 26, 14));
    return { over: o, rot: -10, sx: 1.02 }; },
  eek: (cx, hy) => { const o = [], y = hy + 40;
    o.push(...wEye(cx - 34, hy - 16, 18, 22, 0, 0, 3), ...lashOval(cx - 34, hy - 16, 18, 22, -1), brow(cx - 54, hy - 52, cx - 34, hy - 50, cx - 14, hy - 42, 7));
    o.push(...squeeze(cx + 34, hy - 14, 1, 16, 6), ...lashes(cx + 52, hy - 13, 1, .8), L(`M${cx + 60},${hy - 34} l8,-6 M${cx + 64},${hy - 22} l10,-2`, 3), brow(cx + 14, hy - 40, cx + 34, hy - 40, cx + 54, hy - 34, 7));
    o.push(`<g transform="skewY(-8) translate(0 ${f1(cx * Math.tan(8 * Math.PI / 180))})">${P(`M${cx - 44},${y - 12} L${cx + 50},${y - 16} L${cx + 46},${y + 12} L${cx - 40},${y + 14} Z`, '#fff', INK, 5)}${L(`M${cx - 42},${y + 1} L${cx + 48},${y - 2}`, 2.6)}${teethRow(cx - 42, cx + 48, y - 14, y + 13, 8)}</g>`);
    o.push(drop(cx + 84, hy - 60, 14), drop(cx - 90, hy - 30, 9), drop(cx + 108, hy - 18, 7), ...[-1, 1].map(s => L(`M${cx + s * 120},${hy - 40} q${s * 8},10 0,20 q${-s * 8},10 0,20 q${s * 8},10 0,20`, 3.6)));
    return { over: o, rot: -3 }; },
  happyCry: (cx, hy) => { const o = [], y = hy + 30;
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy - 18; o.push(...shut(ex, ey, s, { lash: 1, w: 18 }), brow(ex - s * 18, ey - 34, ex, ey - 32, ex + s * 20, ey - 24, 7), P(`M${ex + s * 14},${ey + 4} Q${ex + s * 60},${ey - 40} ${ex + s * 96},${ey - 4} Q${ex + s * 80},${ey - 22} ${ex + s * 60},${ey - 16} Q${ex + s * 36},${ey - 10} ${ex + s * 18},${ey + 10} Z`, BLUE, INK, 3), drop(ex + s * 100, ey + 16, 9)); }
    o.push(P(`M${cx - 40},${y - 6} q10,-6 20,0 q10,-6 20,0 q10,-6 20,0 q10,-6 20,0 Q${cx + 34},${y + 42} ${cx},${y + 44} Q${cx - 34},${y + 42} ${cx - 40},${y - 6} Z`), ell(cx + 2, y + 30, 18, 8, PINK), ...blush(cx, hy, 1.15), star4(cx - 108, hy - 96, 12), star4(cx + 106, hy - 100, 14));
    return { over: o, sy: 1.02 }; },
};

// ================= BABY (16) =================  big round cranium, features LOW: eyes ~hy+8, mouth ~hy+52
export const BABY_HEAD = { egg: -.13, aspect: 1.06, tilt: -3, lumps: [[2, .014, 1.0], [3, .018, 2.2]] };
export const BABY = {
  giggle: (cx, hy) => { const o = [], y = hy + 46;
    for (const s of [-1, 1]) o.push(...shut(cx + s * 36, hy + 6, s, { w: 16, h: 13 }));
    o.push(P(`M${cx - 34},${y - 6} Q${cx},${y + 2} ${cx + 34},${y - 6} Q${cx + 28},${y + 38} ${cx},${y + 40} Q${cx - 28},${y + 38} ${cx - 34},${y - 6} Z`), P(`M${cx - 6},${y - 4} L${cx + 6},${y - 4} L${cx + 5},${y + 6} Q${cx},${y + 9} ${cx - 5},${y + 6} Z`, '#fff', 'none', 0), ell(cx + 2, y + 27, 15, 7, PINK), ...cheeks(cx, hy, 34, 1.1));
    o.push(T(cx - 96, hy - 64, 'he', 30, -16), T(cx + 116, hy - 54, 'he', 34, 14), T(cx + 120, hy - 6, 'he!', 24, 10));
    return { over: o, rot: -8 }; },
  wail: (cx, hy) => { const o = [], y = hy + 40;
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 4; o.push(...squeeze(ex, ey, s, 16, 7), brow(ex - s * 16, ey - 34, ex, ey - 30, ex + s * 18, ey - 22, 7), P(`M${ex + s * 18},${ey - 2} Q${ex + s * 70},${ey - 50} ${ex + s * 110},${ey - 6} Q${ex + s * 96},${ey - 16} ${ex + s * 74},${ey - 14} Q${ex + s * 46},${ey - 10} ${ex + s * 20},${ey + 8} Z`, BLUE, INK, 3), drop(ex + s * 108, ey + 14, 10), drop(ex + s * 84, ey + 34, 7)); }
    o.push(P(`M${cx - 40},${y - 4} Q${cx},${y - 16} ${cx + 40},${y - 4} Q${cx + 44},${y + 50} ${cx},${y + 54} Q${cx - 44},${y + 50} ${cx - 40},${y - 4} Z`), ell(cx + 2, y + 38, 22, 10, PINK), P(`M${cx - 4},${y - 8} q4,14 8,0 Z`, PINK, INK, 2), T(cx, hy - 140, 'WAAAH', 38, 0));
    return { skin: 'skPink', over: o, sy: 1.04 }; },
  tantrum: (cx, hy) => { const o = [], y = hy + 40;
    const under = [-1, 1].map(s => `<path d="${smooth(headPts(cx + s * 26, hy, 100, BABY_HEAD))}" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="8 9" opacity=".45"/>`);
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 2; o.push(...squeeze(ex, ey, s, 16, 7.5), brush(ex - s * 22, ey - 30, ex, ey - 22, ex + s * 20, ey - 10, 11, { bias: .7, tip: .3 })); }
    o.push(P(`M${cx - 42},${y - 8} L${cx + 42},${y - 8} Q${cx + 40},${y + 44} ${cx},${y + 46} Q${cx - 40},${y + 44} ${cx - 42},${y - 8} Z`), P(`M${cx + 8},${y - 8} L${cx + 20},${y - 8} L${cx + 14},${y + 4} Z`, '#fff', 'none', 0), ell(cx, y + 30, 20, 9, PINK), fist(cx - 128, hy + 30, .9), fist(cx + 128, hy + 20, .9), shake(cx - 160, hy + 30, -1), shake(cx + 160, hy + 20, 1), ...steamBurst(cx, hy - 20, .9), T(cx, hy - 150, 'NO!', 44, 0, RED));
    return { skin: 'skRed', under, over: o, rot: 8 }; },
  sleepy: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 36, hy + 6, s, { up: false, w: 15, h: 8, lw: 5.5 }));
    o.push(ell(cx, hy + 52, 30, 16, '#8fd0f0', INK, 4.5), `<circle cx="${cx}" cy="${hy + 64}" r="14" fill="none" stroke="#f08ab0" stroke-width="7"/><circle cx="${cx}" cy="${hy + 64}" r="14" fill="none" stroke="${INK}" stroke-width="2" opacity=".6"/>`, ell(cx, hy + 50, 7, 5, '#fff'), snot(cx - 32, hy + 32, 18), ...cheeks(cx, hy, 34, .9), ...zzz(cx, hy));
    return { over: o, rot: 12 }; },
  curious: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 4; o.push(...bEye(ex, ey, 1.25, 1, -2), brow(ex - 12, ey - 36 - (s > 0 ? 8 : 0), ex, ey - 42 - (s > 0 ? 10 : 0), ex + 12, ey - 36 - (s > 0 ? 8 : 0), 6)); }
    o.push(ell(cx + 4, hy + 54, 6, 7, INK), ...cheeks(cx, hy, 36, .9), T(cx + 110, hy - 80, '?', 64, 14), T(cx + 70, hy - 120, '?', 34, -10));
    return { over: o, rot: 14 }; },
  poop: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 34, ey = hy + 4; o.push(...squeeze(ex, ey, s, 15, 7.5), brush(ex - s * 20, ey - 22, ex + s * 2, ey - 30, ex + s * 20, ey - 34, 8, { tip: .3 })); }
    o.push(P(`M${cx - 12},${hy + 50} q6,-8 12,-2 q6,-6 12,2 q-6,10 -12,8 q-6,2 -12,-8 Z`, INK, INK, 2), L(`M${cx - 20},${hy + 40} l-6,-4 M${cx + 20},${hy + 40} l6,-4 M${cx - 18},${hy + 58} l-6,4 M${cx + 18},${hy + 58} l6,4`, 2.6), ...cheeks(cx, hy, 30, 1.1), ...veins(cx + 52, hy - 60, 1));
    o.push(stink(cx - 110, hy + 120), stink(cx - 80, hy + 132), stink(cx + 96, hy + 124), stink(cx + 126, hy + 110), bird(cx + 120, hy - 40).replace(/#ffe066/, '#5d5a6a').replace(/#f08a2a/, '#5d5a6a'), drop(cx - 90, hy - 60, 10), T(cx, hy - 140, 'nnngh', 30, 0));
    return { skin: 'skPink', over: o, sx: 1.06, sy: .94 }; },
  amazed: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 2; o.push(ell(ex, ey, 21, 26, INK), star4(ex - 6, ey - 9, 9, '#fff'), ell(ex + 8, ey + 10, 3.6, 3.6, '#fff'), ell(ex - 9, ey + 8, 2, 2, '#fff'), brow(ex - 10, ey - 46, ex, ey - 52, ex + 10, ey - 46, 5)); }
    o.push(`<ellipse cx="${cx}" cy="${hy + 58}" rx="13" ry="16" fill="${INK}"/>`, ell(cx, hy + 66, 7, 4, PINK), ...cheeks(cx, hy, 38, .9), star4(cx - 118, hy - 60, 16), star4(cx + 118, hy - 66, 20), star4(cx + 96, hy - 110, 10), star4(cx - 92, hy - 108, 9), star4(cx + 136, hy - 16, 8));
    return { over: o, sy: 1.03 }; },
  drool: (cx, hy) => { const o = [], y = hy + 46;
    o.push(...bEye(cx - 36, hy + 4, 1.1, -3, -3), ...bEye(cx + 36, hy + 6, 1.1, 4, 3));
    o.push(P(`M${cx - 26},${y - 4} Q${cx},${y + 4} ${cx + 26},${y - 4} Q${cx + 20},${y + 22} ${cx},${y + 24} Q${cx - 20},${y + 22} ${cx - 26},${y - 4} Z`), ell(cx + 2, y + 14, 12, 6, PINK), P(`M${cx + 14},${y + 14} Q${cx + 22},${y + 60} ${cx + 18},${y + 92} Q${cx + 40},${y + 98} ${cx + 52},${y + 104} Q${cx + 20},${y + 112} ${cx - 14},${y + 104} Q${cx + 4},${y + 98} ${cx + 10},${y + 90} Q${cx + 10},${y + 50} ${cx + 8},${y + 18} Z`, '#cfefff', INK, 2.6), ...cheeks(cx, hy, 34), T(cx - 114, hy - 60, 'ahh', 28, -12));
    return { over: o, rot: -6 }; },
  pout: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 6; o.push(...bEye(ex, ey, 1.05, -s * 2, 2), P(`M${ex - 17},${ey - 2} A17,20 0 0,1 ${ex + 17},${ey - 2} Z`, '#f6eeee', INK, 4), brush(ex - s * 18, ey - 30, ex, ey - 20, ex + s * 16, ey - 14, 8, { bias: .6, tip: .3 })); }
    o.push(P(`M${cx - 24},${hy + 52} Q${cx},${hy + 40} ${cx + 24},${hy + 52} Q${cx + 22},${hy + 76} ${cx},${hy + 74} Q${cx - 22},${hy + 76} ${cx - 24},${hy + 52} Z`, '#f08aa0', INK, 4), L(`M${cx - 16},${hy + 60} q16,6 32,0`, 2.4, '#fff'));
    o.push(...[-1, 1].map(s => ell(cx + s * 66, hy + 36, 26, 18, '#f7b3c0', INK, 3.4)), T(cx + 112, hy - 70, 'hmph!', 32, 14));
    return { over: o, rot: -6, sx: 1.06 }; },
  raspberry: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...squeeze(cx + s * 36, hy + 4, s, 15, 7));
    o.push(P(`M${cx - 22},${hy + 46} Q${cx},${hy + 38} ${cx + 22},${hy + 46} Q${cx},${hy + 56} ${cx - 22},${hy + 46} Z`), P(`M${cx - 16},${hy + 48} Q${cx - 22},${hy + 92} ${cx + 4},${hy + 96} Q${cx + 28},${hy + 90} ${cx + 18},${hy + 48} Z`, PINK, INK, 3.6), L(`M${cx + 2},${hy + 54} l0,26`, 2.6, '#a8344a'));
    o.push(...[[60, 60], [80, 40], [96, 70], [70, 90], [112, 50], [118, 84], [-70, 60], [-90, 80], [-104, 50]].map(([dx, dy], i) => ell(cx + dx, hy + dy, 3 + i % 3, 3 + i % 3, '#cfefff', INK, 2)), ...cheeks(cx, hy, 30, 1.2), T(cx, hy - 140, 'PFFFT', 40, 0));
    return { over: o, sx: 1.05, sy: .97 }; },
  yawn: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 38, ey = hy - 4; o.push(...squeeze(ex, ey, s, 15, 6), drop(ex + s * 22, ey + 14, 6), brow(ex - s * 14, ey - 30, ex, ey - 26, ex + s * 16, ey - 18, 6)); }
    o.push(`<ellipse cx="${cx}" cy="${hy + 58}" rx="26" ry="40" fill="${INK}"/>`, ell(cx + 2, hy + 84, 16, 9, PINK), ell(cx, hy + 26, 4, 7, PINK), ...cheeks(cx, hy, 34, .8), T(cx + 116, hy - 60, 'yaaawn', 26, 14), L(`M${cx - 120},${hy - 80} q-10,30 0,60`, 4), L(`M${cx + 124},${hy - 10} q10,30 0,60`, 4));
    return { over: o, sy: 1.08, sx: .96 }; },
  sneaky: (cx, hy) => { const o = [], y = hy + 46;
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 6; o.push(...bEye(ex, ey, 1, 8, 0), P(`M${ex - 16},${ey - 1} A16,19 0 0,1 ${ex + 16},${ey - 1} Z`, '#f6eeee', INK, 4), brow(ex - 14, ey - 26 - s * 4, ex, ey - 32, ex + 14, ey - 26 + s * 4, 6)); }
    o.push(P(`M${cx - 34},${y - 8} Q${cx},${y + 2} ${cx + 38},${y - 14} Q${cx + 26},${y + 22} ${cx},${y + 20} Q${cx - 24},${y + 18} ${cx - 34},${y - 8} Z`), P(`M${cx - 8},${y - 4} L${cx + 2},${y - 4} L${cx - 3},${y + 6} Z`, '#fff', 'none', 0), P(`M${cx + 8},${y - 5} L${cx + 18},${y - 7} L${cx + 13},${y + 4} Z`, '#fff', 'none', 0), ...cheeks(cx, hy, 34, .7), T(cx - 112, hy - 60, 'hehe', 26, -12), T(cx + 120, hy - 70, '♪', 40, 10));
    return { over: o, rot: 6 }; },
  shy: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 10; o.push(...bEye(ex, ey, .9, -2, 3), brush(ex - 14, ey - 16, ex, ey - 22, ex + 14, ey - 14, 5, { tip: .4 }), brow(ex - s * 12, ey - 36, ex, ey - 34, ex + s * 14, ey - 28, 5)); }
    o.push(...[-1, 1].flatMap(s => [ell(cx + s * 62, hy + 40, 28, 16, '#f39aac'), ...[-10, 0, 10].map(t => L(`M${cx + s * 62 + t - 3},${hy + 46} l6,-12`, 2.6, '#e0607a'))]), L(`M${cx - 12},${hy + 58} q4,4 8,0 q4,-4 8,0 q4,4 8,0`, 4), heart(cx + 110, hy - 70, 12), heart(cx + 130, hy - 30, 8));
    return { over: o, rot: -14 }; },
  hiccup: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 2; o.push(...wEye(ex, ey, 17, 20, 0, 0, 4.5), brow(ex - 12, ey - 36, ex, ey - 44, ex + 12, ey - 36, 5)); }
    o.push(ell(cx, hy + 54, 8, 9, INK), ...[-1, 1].map(s => ell(cx + s * 56, hy + 44, 22, 18, CHEEK, INK, 3)), P(smooth([[cx + 86, hy - 104], [cx + 120, hy - 128], [cx + 160, hy - 114], [cx + 164, hy - 80], [cx + 130, hy - 66], [cx + 96, hy - 76]]), '#fff', INK, 4), T(cx + 128, hy - 86, 'HIC!', 26, -8), ...[-30, 0, 30].map(t => L(`M${cx + t},${hy - 128 - Math.abs(t) * .3} l0,-20`, 5)));
    return { over: o, sy: 1.06 }; },
  foodMess: (cx, hy) => { const o = [], y = hy + 46, MUSH = '#f2a03d';
    for (const s of [-1, 1]) o.push(...shut(cx + s * 36, hy + 4, s, { w: 15, h: 12 }));
    o.push(P(`M${cx - 28},${y - 6} Q${cx},${y + 2} ${cx + 28},${y - 6} Q${cx + 22},${y + 26} ${cx},${y + 28} Q${cx - 22},${y + 26} ${cx - 28},${y - 6} Z`), ell(cx + 2, y + 16, 13, 6, PINK), ...cheeks(cx, hy, 32));
    const splat = (x, y, r) => P(smooth([...Array(9)].map((_, k) => { const a = k / 9 * Math.PI * 2, rr = r * (k % 2 ? .62 : 1.08); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; })), MUSH, INK, 3);
    o.push(splat(cx - 54, hy - 52, 18), splat(cx + 44, hy + 70, 14), splat(cx + 64, hy - 20, 11), splat(cx - 20, hy + 74, 10), splat(cx + 10, hy - 104, 16), ell(cx - 90, hy + 4, 5, 5, MUSH, INK, 2), ell(cx + 96, hy - 50, 6, 6, MUSH, INK, 2), T(cx + 118, hy - 70, 'nom', 30, 14));
    return { over: o, rot: -6 }; },
  burp: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 36, ey = hy + 2; o.push(...wEye(ex, ey, 16, 19, s * 2, 0, 4), brow(ex - 12, ey - 34, ex, ey - 40, ex + 12, ey - 34, 5)); }
    o.push(ell(cx + 4, hy + 54, 11, 9, INK), ...cheeks(cx, hy, 36, 1.1), P(smooth([[cx + 20, hy + 64], [cx + 56, hy + 34], [cx + 96, hy + 22], [cx + 138, hy + 36], [cx + 142, hy + 76], [cx + 110, hy + 100], [cx + 64, hy + 94]]), '#e8f3cf', INK, 4), T(cx + 92, hy + 72, 'BURP', 28, -8), `<circle cx="${cx + 132}" cy="${hy - 10}" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${cx + 152}" cy="${hy - 34}" r="6" fill="#fff" stroke="${INK}" stroke-width="3"/>`);
    return { over: o, sx: 1.04 }; },
};

// ================= ELDER (12) =================  hair 'gramps' (bald + cloud tufts) or 'granny' (grey bob + bun)
export const ELDER = {
  grumpy: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 12; o.push(...lidEye(ex, ey, s, { open: .5, pr: 7, ph: 10, lw: 15, tilt: 5 }), L(`M${ex - 14},${ey + 10} q14,7 28,0`, 2.6, '#8a7f99'), bushy(ex, ey - 22, s, -14)); }
    o.push(brush(cx - 32, hy + 48, cx, hy + 26, cx + 32, hy + 48, 6, { tip: .4 }), ...jowls(cx, hy, 40), ...wrinkles(cx, hy, -64), L(`M${cx - 70},${hy - 150} q10,-20 24,-4 q10,-20 26,-2 q12,-18 26,0 q14,-16 24,4 q-30,16 -100,2 Z`, 4), T(cx + 118, hy + 30, 'hmph', 28, 10));
    return { over: o, hair: 'gramps' }; },
  gumLaugh: (cx, hy) => { const o = [], y = hy + 18;
    for (const s of [-1, 1]) o.push(...shut(cx + s * 32, hy - 22, s, { w: 16, h: 12 }), ...crow(cx + s * 32, hy - 22, s), bushy(cx + s * 32, hy - 48, s, 6, .9));
    o.push(P(`M${cx - 50},${y - 6} Q${cx},${y + 4} ${cx + 50},${y - 6} Q${cx + 42},${y + 60} ${cx},${y + 62} Q${cx - 42},${y + 60} ${cx - 50},${y - 6} Z`), P(`M${cx - 44},${y - 3} Q${cx},${y + 5} ${cx + 44},${y - 3} Q${cx + 30},${y + 14} ${cx},${y + 14} Q${cx - 30},${y + 14} ${cx - 44},${y - 3} Z`, '#f08aa0', 'none', 0), ell(cx + 2, y + 44, 22, 10, PINK), drop(cx - 74, hy - 40, 9), drop(cx + 76, hy - 46, 9));
    o.push(T(cx - 116, hy - 64, 'HE', 30, -18), T(cx + 116, hy - 80, 'HE', 34, 16), T(cx + 130, hy - 30, 'HE!', 26, 10));
    return { over: o, rot: -12, hair: 'gramps' }; },
  eh: (cx, hy) => { const o = [];
    o.push(...squeeze(cx - 32, hy - 14, -1, 14, 6), bushy(cx - 32, hy - 40, -1, -10, .9));
    o.push(ell(cx + 36, hy - 14, 30, 34, '#fff', INK, 4), ell(cx + 36, hy - 12, 13, 15, INK), ell(cx + 31, hy - 18, 4, 5, '#fff'), bushy(cx + 36, hy - 62, 1, 10));
    o.push(`<circle cx="${cx + 36}" cy="${hy - 14}" r="38" fill="#e6f4ff" fill-opacity=".25" stroke="${INK}" stroke-width="5"/>`, `<circle cx="${cx - 32}" cy="${hy - 14}" r="22" fill="none" stroke="${INK}" stroke-width="4.5"/>`, L(`M${cx - 10},${hy - 18} Q${cx - 6},${hy - 26} ${cx - 2},${hy - 18}`, 4));
    o.push(P(`M${cx - 18},${hy + 44} Q${cx + 4},${hy + 30} ${cx + 26},${hy + 48} Q${cx + 4},${hy + 66} ${cx - 18},${hy + 44} Z`), ...jowls(cx, hy, 44), T(cx - 120, hy - 60, 'EH?!', 40, -14));
    return { over: o, rot: 10, hair: 'gramps' }; },
  nodOff: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 32, hy - 8, s, { up: false, w: 15, h: 6, lw: 5.5 }), L(`M${cx + s * 32 - 12},${hy + 6} q12,6 24,0`, 2.6, '#8a7f99'), bushy(cx + s * 32, hy - 30, s, 4, .85));
    o.push(glasses(cx, hy + 4, 32, 20, 6), `<ellipse cx="${cx - 2}" cy="${hy + 50}" rx="12" ry="14" fill="${INK}"/>`, snot(cx - 40, hy + 30, 20), ...zzz(cx, hy), ...wrinkles(cx, hy, -62));
    return { skin: 'skPale', over: o, rot: 22, sy: .97, hair: 'gramps' }; },
  proudTears: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 16; o.push(...shut(ex, ey, s, { up: false, w: 15, h: 8, lw: 5.5, lash: .8 }), brow(ex - s * 16, ey - 30, ex, ey - 26, ex + s * 18, ey - 18, 6), drop(ex + s * 6, ey + 24, 7), drop(ex + s * 2, ey + 52, 5)); }
    o.push(L(`M${cx - 24},${hy + 42} q6,8 12,2 q6,8 12,2 q6,8 12,2 q6,8 12,0`, 5), ...wrinkles(cx, hy, -58), ...blush(cx, hy, .8), star4(cx + 110, hy - 74, 16), star4(cx - 112, hy - 64, 12), star4(cx + 94, hy - 112, 9));
    return { over: o, rot: -8, hair: 'granny' }; },
  dentures: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 18; o.push(...wEye(ex, ey, 20, 24, 0, 2, 3), bushy(ex, ey - 44, s, 12, .95)); }
    o.push(`<ellipse cx="${cx}" cy="${hy + 44}" rx="16" ry="18" fill="${INK}"/>`, P(`M${cx - 14},${hy + 32} Q${cx},${hy + 26} ${cx + 14},${hy + 32} L${cx + 12},${hy + 36} Q${cx},${hy + 32} ${cx - 12},${hy + 36} Z`, '#f08aa0', 'none', 0), ...jowls(cx, hy, 44));
    const dx = cx + 96, dy = hy + 84;
    o.push(`<g transform="rotate(-24 ${dx} ${dy}) translate(${dx} ${dy}) scale(1.35) translate(${-dx} ${-dy})">${P(`M${dx - 34},${dy} Q${dx},${dy - 26} ${dx + 34},${dy} L${dx + 30},${dy + 10} Q${dx},${dy - 12} ${dx - 30},${dy + 10} Z`, '#f08aa0', INK, 3.4)}${P(`M${dx - 30},${dy + 2} Q${dx},${dy - 20} ${dx + 30},${dy + 2} L${dx + 28},${dy + 16} Q${dx},${dy - 2} ${dx - 28},${dy + 16} Z`, '#fff', INK, 3)}${teethRow(dx - 30, dx + 30, dy - 12, dy + 12, 7)}</g>`, ...[0, 1, 2].map(i => L(`M${cx + 40 + i * 4},${hy + 30 + i * 14} l26,${10 - i * 6}`, 3.4)), T(cx - 116, hy - 60, '!!', 46, -12), ...shockLines(cx, hy));
    return { over: o, sy: 1.04, hair: 'gramps' }; },
  suspicious: (cx, hy) => { const o = [];
    o.push(brush(cx - 54, hy - 16, cx - 32, hy - 12, cx - 10, hy - 16, 6, { tip: .4 }), L(`M${cx - 50},${hy - 6} q18,6 36,0`, 3), bushy(cx - 32, hy - 30, -1, -12, .9));
    o.push(ell(cx + 36, hy - 16, 18, 20, '#fff', INK, 4.5), ell(cx + 30, hy - 14, 6, 7, INK), `<circle cx="${cx + 36}" cy="${hy - 16}" r="28" fill="#e6f4ff" fill-opacity=".3" stroke="#c9a23a" stroke-width="6"/>`, L(`M${cx + 60},${hy}  q30,40 10,110`, 2.6, '#c9a23a'), bushy(cx + 36, hy - 56, 1, 14));
    o.push(P(`M${cx - 4},${hy + 44} q8,-6 16,0 q-8,6 -16,0 Z`), L(`M${cx - 10},${hy + 36} l-6,-4 M${cx - 10},${hy + 52} l-6,4`, 2.4), ...jowls(cx, hy, 40), T(cx - 116, hy - 70, 'hmmm', 26, -14));
    return { over: o, rot: 8, hair: 'gramps' }; },
  sweetSmile: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) o.push(...shut(cx + s * 32, hy - 12, s, { w: 14, h: 10, lw: 5.5 }), ...crow(cx + s * 30, hy - 12, s));
    o.push(glasses(cx, hy - 10, 32, 24), brush(cx - 26, hy + 36, cx, hy + 54, cx + 26, hy + 36, 6, { tip: .4 }), ...[-1, 1].map(s => ell(cx + s * 60, hy + 26, 20, 12, '#f39aac')), heart(cx + 114, hy - 70, 13), heart(cx - 110, hy - 60, 10), heart(cx + 132, hy - 30, 8));
    return { over: o, rot: -6, hair: 'granny' }; },
  angryFist: (cx, hy) => { const o = [], y = hy + 26;
    for (const s of [-1, 1]) { const ex = cx + s * 30, ey = hy - 16; o.push(...lidEye(ex, ey, s, { pr: 6, ph: 9, lw: 14, tilt: 7 }), bushy(ex, ey - 22, s, -20)); }
    o.push(P(`M${cx - 40},${y - 8} Q${cx},${y - 14} ${cx + 40},${y - 8} Q${cx + 34},${y + 40} ${cx},${y + 42} Q${cx - 34},${y + 40} ${cx - 40},${y - 8} Z`), P(`M${cx + 6},${y - 10} L${cx + 18},${y - 10} L${cx + 12},${y + 4} Z`, '#fff', 'none', 0), ell(cx, y + 28, 18, 8, PINK), fist(cx + 134, hy + 10), shake(cx + 168, hy + 10, 1), shake(cx + 100, hy + 10, -1), ...veins(cx - 50, hy - 64, 1.1), T(cx - 120, hy - 70, 'YOU KIDS!', 22, -16));
    return { skin: 'skRed', over: o, hair: 'gramps' }; },
  confused: (cx, hy) => { const o = [];
    o.push(...wEye(cx - 32, hy - 12, 12, 14, 2, 0, 3.2), ...wEye(cx + 32, hy - 14, 22, 26, -4, 2, 5), bushy(cx - 32, hy - 36, -1, 4, .8), bushy(cx + 32, hy - 54, 1, 12));
    o.push(glasses(cx, hy - 12, 32, 24, -14), L(`M${cx - 24},${hy + 44} q6,-6 12,0 q6,6 12,0 q6,-6 12,0 q6,6 12,0`, 4.5), ...jowls(cx, hy, 40));
    o.push(...[[100, -110, 1.2, 14], [-110, -90, .9, -16], [130, -46, .7, 22]].map(([dx, dy, k, r]) => T(cx + dx, hy + dy, '?', 56 * k, r)), T(cx - 110, hy + 96, 'huh?', 26, -8));
    return { over: o, rot: 12, hair: 'gramps' }; },
  nostalgic: (cx, hy) => { const o = [];
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 14; o.push(...glossy(ex, ey, 14, 16, .8).map((e, i) => i ? e : e.replace(`cy="${f1(ey)}"`, `cy="${f1(ey - 3)}"`)), L(`M${ex - 15},${ey + 16} Q${ex},${ey + 22} ${ex + 15},${ey + 16}`, 4, BLUE), brow(ex - s * 16, ey - 34, ex, ey - 32, ex + s * 18, ey - 24, 6)); }
    o.push(brush(cx - 18, hy + 40, cx, hy + 46, cx + 18, hy + 38, 4.6, { tip: .4 }), ...wrinkles(cx, hy, -60));
    o.push(`<circle cx="${cx + 84}" cy="${hy - 96}" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${cx + 100}" cy="${hy - 122}" r="11" fill="#fff" stroke="${INK}" stroke-width="3"/>`, P(smooth([[cx + 80, hy - 170], [cx + 120, hy - 196], [cx + 172, hy - 186], [cx + 186, hy - 150], [cx + 160, hy - 126], [cx + 110, hy - 130], [cx + 84, hy - 146]]), '#fff6e6', INK, 4), heart(cx + 132, hy - 160, 14, '#e8a04a'));
    return { skin: 'skSepia', over: o, rot: -10, hair: 'granny' }; },
  cackle: (cx, hy) => { const o = [], y = hy + 16;
    for (const s of [-1, 1]) { const ex = cx + s * 32, ey = hy - 24; o.push(...wEye(ex, ey, 17, 19, s * 3, -2, 3), brush(ex - s * 22, ey - 28, ex, ey - 22, ex + s * 20, ey - 30, 7, { tip: .3 }), ...crow(ex, ey, s)); }
    o.push(P(`M${cx - 52},${y - 4} Q${cx},${y + 6} ${cx + 52},${y - 4} Q${cx + 42},${y + 58} ${cx},${y + 60} Q${cx - 42},${y + 58} ${cx - 52},${y - 4} Z`), P(`M${cx - 18},${y + 1} L${cx - 6},${y + 2} L${cx - 12},${y + 16} Z`, '#fff', 'none', 0), ell(cx + 4, y + 42, 22, 10, PINK), ell(cx + 20, hy - 2, 5, 4, '#7fb86a', INK, 2));
    o.push(...[[-140, -40], [136, -70], [-136, 36], [142, 6]].map(([dx, dy]) => T(cx + dx, hy + dy, 'KE', 28, dx > 0 ? 18 : -18)));
    return { over: o, rot: -16, hair: 'granny' }; },
};

// ================= LIP-SYNC + BLINKS =================  standard face, eyes at hy-14 (faceKit), mouth centre hy+28
const stdFace = (cx, hy) => faceKit({ expr: 'standard', mouth: 'none' }, cx, hy - 14);
const stdBrows = (cx, ey) => [[-1, [0, 1, 1]], [1, [4, -1.5, 5]]].map(([s, [raise, tilt, arch]]) => { const ex = cx + s * 28, by = ey - 21 - raise, xi = ex - s * 13, xo = ex + s * 13, yi = by + tilt, yo = by - tilt * .4; return brush(xi, yi, ex + s * 2, (yi + yo) / 2 - arch, xo, yo, 7.2, { bias: .4, tip: .3 }); });
const darkMouth = (mx, my, w, top, bot, extra = '') => P(`M${mx - w},${my} Q${mx},${my - top} ${mx + w},${my} Q${mx},${my + bot} ${mx - w},${my} Z`, INK, INK, 2.5) + extra;
const big = (cx, hy, parts) => `<g transform="translate(${cx} ${hy + 28}) scale(1.6) translate(${-cx} ${-hy - 28})">${parts.join('')}</g>`;
export const VISEMES = {
  rest: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 28, 8, 5, 5)])] }),
  MBP: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [brush(cx - 16, hy + 28, cx, hy + 25, cx + 16, hy + 28, 6.5, { tip: .5 }), L(`M${cx - 18},${hy + 23} q-3,5 0,10 M${cx + 18},${hy + 23} q3,5 0,10`, 2.4), L(`M${cx - 8},${hy + 36} q8,3 16,0`, 2.4)])] }),
  AI: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 24, 19, 4, 40, P(`M${cx - 15},${hy + 23} Q${cx},${hy + 20} ${cx + 15},${hy + 23} L${cx + 13},${hy + 28} Q${cx},${hy + 26} ${cx - 13},${hy + 28} Z`, '#fff', 'none', 0) + ell(cx + 2, hy + 36, 10, 5, PINK))])] }),
  E: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 26, 22, 6, 22, P(`M${cx - 18},${hy + 24} Q${cx},${hy + 19} ${cx + 18},${hy + 24} L${cx + 17},${hy + 28} Q${cx},${hy + 24} ${cx - 17},${hy + 28} Z`, '#fff', 'none', 0) + P(`M${cx - 15},${hy + 33} Q${cx},${hy + 37} ${cx + 15},${hy + 33} L${cx + 12},${hy + 30} Q${cx},${hy + 33} ${cx - 12},${hy + 30} Z`, '#fff', 'none', 0))])] }),
  O: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [`<ellipse cx="${cx}" cy="${hy + 32}" rx="11" ry="14" fill="${INK}"/>`, ell(cx + 1, hy + 39, 6, 3.5, PINK)])] }),
  U: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [ell(cx, hy + 30, 6, 6.5, INK), ...[-1, 1].map(s => L(`M${cx + s * 10},${hy + 24} q${s * 4},6 0,12`, 2.4))])] }),
  FV: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 27, 15, 6, 10, P(`M${cx - 12},${hy + 25} L${cx + 12},${hy + 25} L${cx + 11},${hy + 31} L${cx - 11},${hy + 31} Z`, '#fff', INK, 1.6) + L(`M${cx},${hy + 25} l0,6`, 1.6)), brush(cx - 14, hy + 34, cx, hy + 37, cx + 14, hy + 34, 4, { tip: .4 })])] }),
  L: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 24, 16, 4, 32, P(`M${cx - 8},${hy + 36} Q${cx - 6},${hy + 24} ${cx + 1},${hy + 24} Q${cx + 8},${hy + 24} ${cx + 9},${hy + 36} Z`, PINK, 'none', 0))])] }),
  WQ: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [`<ellipse cx="${cx + 2}" cy="${hy + 30}" rx="8" ry="10" fill="${INK}" stroke="${INK}" stroke-width="5"/>`, ...[-1, 1].map(s => L(`M${cx + s * 15},${hy + 22} q${s * 5},8 0,16`, 2.4)), L(`M${cx - 4},${hy + 44} q6,2 12,0`, 2.4)])] }),
  CDGK: (cx, hy) => ({ over: [...stdFace(cx, hy), big(cx, hy, [darkMouth(cx, hy + 28, 18, 5, 12, P(`M${cx - 15},${hy + 26} Q${cx},${hy + 22} ${cx + 15},${hy + 26} L${cx + 14},${hy + 31} Q${cx},${hy + 34} ${cx - 14},${hy + 31} Z`, '#fff', 'none', 0) + L(`M${cx - 14},${hy + 28.5} Q${cx},${hy + 28} ${cx + 14},${hy + 28.5}`, 1.6))])] }),
};
// blink states: standard eye open / half / closed, and the female lash version
const blinkEyes = (cx, hy, st, lash) => { const ey = hy - 14, o = []; for (const s of [-1, 1]) { const ex = cx + s * 28, ly = ey - 3;
  if (st === 'open') o.push(...lidEye(ex, ey, s, { pr: 7.6, ph: 10.5, lw: 14, w: 4.6, lash: lash ? .8 : 0 }));
  else if (st === 'half') o.push(...lidEye(ex, ey + 5, s, { pr: 7.6, ph: 5.5, lw: 14, w: 4.6, lash: lash ? .8 : 0 }));
  else o.push(brush(ex - 14, ly + 4, ex, ly + 11, ex + 14, ly + 4, 4.8, { tip: .45 }), ...(lash ? [flick(ex + s * 12, ly + 6, s * 9, 6), flick(ex + s * 5, ly + 9, s * 4, 9)] : []));
} return [...o, ...stdBrows(cx, ey)]; };
export const BLINKS = {
  open: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'open'), darkMouth(cx, hy + 28, 8, 5, 5)] }),
  half: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'half'), darkMouth(cx, hy + 28, 8, 5, 5)] }),
  closed: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'closed'), darkMouth(cx, hy + 28, 8, 5, 5)] }),
  womanOpen: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'open', 1), darkMouth(cx, hy + 28, 8, 5, 5)], hair: 'bob' }),
  womanHalf: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'half', 1), darkMouth(cx, hy + 28, 8, 5, 5)], hair: 'bob' }),
  womanClosed: (cx, hy) => ({ over: [...blinkEyes(cx, hy, 'closed', 1), darkMouth(cx, hy + 28, 8, 5, 5)], hair: 'bob' }),
};

// ---------- sets + full head ----------
export const SETS = {
  female: { faces: FEMALE, shape: 'egg', hair: 'bob' },
  baby: { faces: BABY, shape: BABY_HEAD, hair: 'curl' },
  elder: { faces: ELDER, shape: 'potato', hair: 'gramps' },
  talk: { faces: { ...VISEMES, ...BLINKS }, shape: 'rick', hair: null },
};
const HAIR = { bob: (cx, hy, sh) => bob(cx, hy, sh), granny: (cx, hy) => granny(cx, hy), gramps: (cx, hy) => gramps(cx, hy), curl: (cx, hy) => curl(cx, hy) };
export function setHead(set, name, cx, hy) {
  const S = SETS[set], M = S.faces[name](cx, hy), hairKey = M.hair !== undefined ? M.hair : S.hair;
  const shape = hairKey === 'granny' ? 'bun' : hairKey === 'bob' && set === 'talk' ? 'egg' : S.shape, HP = headPts(cx, hy, 100, shape);
  const hr = hairKey ? HAIR[hairKey](cx, hy, shape) : { back: [], front: [] };
  const t = `translate(${cx},${hy}) rotate(${M.rot || 0}) scale(${M.sx || 1},${M.sy || 1}) translate(${-cx},${-hy})`;
  return `<g transform="${t}">${(M.under || []).join('')}${hr.back.join('')}<path d="${smooth(HP)}" fill="url(#${M.skin || 'sk'})"/>${inkRing(HP, 13 * 1.12 / 1.5, { seed: 5 })}${hr.front.join('')}${M.over.join('')}</g>`;
}

// hair layers for use on full characters (bodies.mjs): returns { back, front }
export const hairFor = (key, cx, hy, shape) => HAIR[key](cx, hy, shape);
