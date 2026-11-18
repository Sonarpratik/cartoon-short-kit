// SHEET 14 — VILLAINS (original archetypes; faces mostly from the VILLAIN set in faces_villain.mjs)
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud, bands } from '../castkit.mjs';
export const TITLE = 'Cast sheet 14: Villains';

// head-space point -> screen point (face rot/sx/sy + head scale), so stick arms can reach hands drawn by a face
const hp = (B, f, dx, dy) => { const a = (f.rot || 0) * Math.PI / 180, x = dx * (f.sx || 1), y = dy * (f.sy || 1); return [B.cx + B.K * (x * Math.cos(a) - y * Math.sin(a)), B.hy + B.K * (x * Math.sin(a) + y * Math.cos(a))]; };
const rot = (a, x, y, o) => `<g transform="rotate(${a} ${f1(x)} ${f1(y)})">${[].concat(o).join('')}</g>`;
// thick rope / cable: ink edge + colour core
const rope = (d, col = '#c9a26b', w = 9) => L(d, w + 7) + L(d, w, col);
const PURPLE = '#4a2a6a', DARK = '#2a2733', ARMOR = '#3a3846', ARMOR2 = '#4c4a5c', CRIMSON = '#7a1c24', GLOW = '#7be05a';
const F = { laugh: { rot: -16, sy: 1.03 }, scheme: { rot: 6 }, greedy: { rot: -6 }, whisper: { rot: -10 }, gloat: { rot: -14, sx: 1.03 } };

export const CAST = [
  // 1 DARK LORD: giant horned helm, spiked pauldrons, tattered cape, two-hand sword planted
  { name: 'darklord', label: 'Dark Lord', form: 'chad', coat: ARMOR, face: ['villain', 'coldStare'],
    hat: ({ cx, hy }) => { const o = [], BONE = '#ece3cf';
      for (const s of [-1, 1]) { o.push(P(`M${cx + s * 78},${hy - 62} Q${cx + s * 150},${hy - 60} ${cx + s * 180},${hy - 118} Q${cx + s * 200},${hy - 170} ${cx + s * 170},${hy - 240} Q${cx + s * 180},${hy - 172} ${cx + s * 150},${hy - 142} Q${cx + s * 122},${hy - 108} ${cx + s * 88},${hy - 106} Z`, BONE, INK, 6));
        o.push(L(`M${cx + s * 124},${hy - 64} l${-s * 4},-42 M${cx + s * 158},${hy - 80} l${-s * 16},-36 M${cx + s * 180},${hy - 124} l${-s * 22},-22`, 3.6, '#b8ae98'), hl(`M${cx + s * 100},${hy - 72} Q${cx + s * 150},${hy - 74} ${cx + s * 170},${hy - 120}`, 5, .6)); }
      o.push(fillPts([[cx - 112, hy - 30], [cx - 106, hy - 88], [cx - 56, hy - 122], [cx, hy - 130], [cx + 56, hy - 122], [cx + 106, hy - 88], [cx + 112, hy - 30], [cx + 70, hy - 48], [cx, hy - 56], [cx - 70, hy - 48]], ARMOR, 7));
      for (const t of [-64, -32, 0, 32, 64]) { const by = hy - 124 + Math.abs(t) * .5; o.push(poly([[cx + t - 13, by + 6], [cx + t * 1.2, by - 48 + Math.abs(t) * .15], [cx + t + 13, by + 6]], ARMOR2, 5)); }
      o.push(fillPts([[cx - 112, hy - 30], [cx - 106, hy - 88], [cx - 56, hy - 122], [cx, hy - 130], [cx + 56, hy - 122], [cx + 106, hy - 88], [cx + 112, hy - 30], [cx + 70, hy - 48], [cx, hy - 56], [cx - 70, hy - 48]], ARMOR, 7));
      for (const s of [-1, 1]) o.push(poly([[cx + s * 84], [cx + s * 116, hy - 36], [cx + s * 108, hy + 64], [cx + s * 86, hy + 42]].map((p, i) => i ? p : [cx + s * 84, hy - 46]), ARMOR, 5));
      o.push(poly([[cx - 11, hy - 56], [cx + 11, hy - 56], [cx + 7, hy - 4], [cx, hy + 6], [cx - 7, hy - 4]], ARMOR, 4.5));
      o.push(brush(cx - 104, hy - 44, cx, hy - 62, cx + 104, hy - 44, 10, { col: '#6a6878', tip: .8 }), hl(`M${cx - 80},${hy - 84} Q${cx - 40},${hy - 112} ${cx},${hy - 114}`, 7, .35), P(`M${cx},${hy - 96} l12,16 l-12,16 l-12,-16 Z`, RED, INK, 4));
      return o; },
    behind: ({ cx, top }) => { let d = `M${cx - 150},${top + 20} Q${cx},${top - 10} ${cx + 150},${top + 20} L${cx + 235},${top + 640}`;
      for (let k = 1; k <= 10; k++) d += ` L${f1(cx + 235 - k * 47)},${top + (k % 2 ? 596 : 640)}`;
      return [P(d + ' Z', CRIMSON, INK, 7), ...[-2, -1, 0, 1, 2].map(k => L(`M${cx + k * 50},${top + 90} q${k * 14},300 ${k * 40},${500}`, 4, '#4f0f16'))]; },
    details: ({ cx, top }) => [...[0, 1, 2, 3, 4].map(k => poly([[cx - 200, top + 150 + k * 36], [cx + 200, top + 150 + k * 36], [cx + 200, top + 180 + k * 36], [cx - 200, top + 180 + k * 36]], k % 2 ? ARMOR2 : ARMOR, 4)),
      L(`M${cx - 120},${top + 90} Q${cx - 60},${top + 136} ${cx - 4},${top + 104} M${cx + 120},${top + 90} Q${cx + 60},${top + 136} ${cx + 4},${top + 104}`, 5, '#16141c'),
      P(`M${cx - 44},${top + 40} L${cx},${top + 120} L${cx + 44},${top + 40} L${cx + 22},${top + 62} L${cx},${top + 46} L${cx - 22},${top + 62} Z`, RED, INK, 4), rect(cx - 200, top + 320, 400, 30, '#1c1a22', 4, 3)],
    arms: B => ({ front: [B.arm(-1, B.cx - 4, B.top + 214, 40), B.arm(1, B.cx + 4, B.top + 256, -40)] }),
    props: ({ cx, top }) => { const o = [];
      o.push(poly([[cx - 22, top + 300], [cx + 22, top + 300], [cx + 18, top + 600], [cx, top + 650], [cx - 18, top + 600]], '#5a5868', 5), L(`M${cx},${top + 310} L${cx},${top + 600}`, 5, RED));
      o.push(poly([[cx - 90, top + 268], [cx - 70, top + 286], [cx + 70, top + 286], [cx + 90, top + 268], [cx + 70, top + 306], [cx - 70, top + 306]], ARMOR, 5), rect(cx - 10, top + 190, 20, 84, '#1c1a22', 4, 3), circ(cx, top + 184, 16, RED, 4));
      for (const s of [-1, 1]) { const x0 = cx + s * 70;
        o.push(P(`M${x0},${top + 70} Q${cx + s * 100},${top - 26} ${cx + s * 200},${top + 6} Q${cx + s * 232},${top + 60} ${cx + s * 196},${top + 110} Q${cx + s * 130},${top + 80} ${x0},${top + 70} Z`, ARMOR2, INK, 6));
        for (const [dx, dy, a] of [[104, 0, -14], [146, -12, 10], [186, 4, 34]]) o.push(rot(s * a, cx + s * dx, top + dy, poly([[cx + s * dx - 13, top + dy + 6], [cx + s * dx, top + dy - 58], [cx + s * dx + 13, top + dy + 6]], '#cfd3dd', 5)));
        o.push(hl(`M${cx + s * 96},${top + 34} Q${cx + s * 140},${top + 10} ${cx + s * 180},${top + 24}`, 6, .4)); }
      o.push(fist(cx - 4, top + 214, 18), fist(cx + 4, top + 256, 18));
      return o; } },

  // 2 EVIL QUEEN: giant ribbed stand-up collar, black widow's-peak hair, tall spiked crown, dark-orb sceptre
  { name: 'evilqueen', label: 'Evil Queen', form: 'lady', coat: PURPLE, face: ['female', 'smug'],
    behind: ({ cx, top }) => { const tips = [], c = [cx, top + 40], n = 12;
      for (let i = 0; i <= n; i++) { const a = Math.PI * (1.06 + i * .88 / n); tips.push([cx + 240 * Math.cos(a), c[1] + 370 * Math.sin(a)]); }
      const path = k => { let d = `M${f1(cx - 50)},${f1(c[1] + 30)} L${f1(c[0] + (tips[0][0] - c[0]) * k)},${f1(c[1] + (tips[0][1] - c[1]) * k)}`;
        for (let i = 1; i < tips.length; i++) { const m = [(tips[i - 1][0] + tips[i][0]) / 2, (tips[i - 1][1] + tips[i][1]) / 2]; d += ` Q${f1(c[0] + (m[0] - c[0]) * k * .84)},${f1(c[1] + (m[1] - c[1]) * k * .84)} ${f1(c[0] + (tips[i][0] - c[0]) * k)},${f1(c[1] + (tips[i][1] - c[1]) * k)}`; }
        return d + ` L${f1(cx + 50)},${f1(c[1] + 30)} Z`; };
      return [P(path(1), '#1d1626', INK, 7), P(path(.86), '#8a1f3e', 'none', 0), ...tips.map(t => L(`M${f1(cx + (t[0] - cx) * .25)},${f1(c[1] + (t[1] - c[1]) * .25)} L${f1(cx + (t[0] - cx) * .86)},${f1(c[1] + (t[1] - c[1]) * .86)}`, 4, '#d6a23a')), P(path(.86), 'none', '#d6a23a', 4)]; },
    hat: ({ cx, hy }) => { const o = [];
      o.push(P(`M${cx - 102},${hy + 14} Q${cx - 112},${hy - 70} ${cx - 62},${hy - 102} Q${cx},${hy - 128} ${cx + 62},${hy - 102} Q${cx + 112},${hy - 70} ${cx + 102},${hy + 14} Q${cx + 94},${hy - 44} ${cx + 44},${hy - 70} Q${cx + 18},${hy - 76} ${cx},${hy - 54} Q${cx - 18},${hy - 76} ${cx - 44},${hy - 70} Q${cx - 94},${hy - 44} ${cx - 102},${hy + 14} Z`, '#1d1a26', INK, 6), hl(`M${cx - 80},${hy - 70} Q${cx - 60},${hy - 98} ${cx - 24},${hy - 108}`, 7, .3));
      o.push(poly([[cx - 74, hy - 92], [cx - 84, hy - 196], [cx - 50, hy - 126], [cx - 40, hy - 220], [cx - 17, hy - 130], [cx, hy - 248], [cx + 17, hy - 130], [cx + 40, hy - 220], [cx + 50, hy - 126], [cx + 84, hy - 196], [cx + 74, hy - 92]], GOLD, 6));
      o.push(brush(cx - 74, hy - 100, cx, hy - 114, cx + 74, hy - 100, 12, { col: '#a87b10', tip: .8 }), ell(cx, hy - 150, 11, 15, '#7a2fc0', INK, 4), ...[-40, 40].map(t => ell(cx + t, hy - 140, 7, 9, '#7a2fc0', INK, 3.4)), ...[[-84, -196], [-40, -220], [0, -248], [40, -220], [84, -196]].map(([dx, dy]) => circ(cx + dx, hy + dy, 7, GOLDL, 3)), hl(`M${cx - 30},${hy - 126} L${cx - 36},${hy - 190}`, 5, .5));
      return o; },
    details: ({ cx, top, bot }) => [L(`M${cx - 90},${top - 4} L${cx},${top + 130} L${cx + 90},${top - 4}`, 12, INK), L(`M${cx - 90},${top - 4} L${cx},${top + 130} L${cx + 90},${top - 4}`, 6, '#d6a23a'), P(`M${cx},${top + 120} l14,22 l-14,30 l-14,-30 Z`, '#8a1f3e', INK, 3.5),
      rect(cx - 260, bot - 70, 520, 26, '#d6a23a', 4, 2), L(`M${cx},${top + 180} L${cx},${bot - 70}`, 5, '#2f1a48')],
    arms: B => ({ front: [B.arm(-1, B.cx - 66, B.top + 196, 74), B.arm(1, B.cx + 176, B.top + 150, 16)] }),
    props: ({ cx, top }) => [fist(cx - 66, top + 196, 13)],
    over: ({ cx, top }) => { const x = cx + 176, y = top + 150; return [pole(x - 10, y + 250, x + 14, y - 230, '#2a2236', 12), `<circle cx="${x + 16}" cy="${y - 268}" r="56" fill="#b56ef0" opacity=".25"/>`, P(`M${x - 18},${y - 236} q34,-14 64,0 l-10,-30 l-22,10 l-10,-24 l-10,24 l-22,-10 Z`, GOLD, INK, 4), circ(x + 16, y - 270, 30, '#5a2a8a', 6), L(`M${x + 2},${y - 284} q8,-10 20,-8`, 4, '#e2c2ff'), fist(x, y, 14)]; } },

  // 3 RAILWAY VILLAIN: towering top hat, curled handlebar moustache being twirled, swirling cape, coil of rope
  { name: 'railway', label: 'Railway Villain', form: 'noodle', coat: BLACK, face: ['villain', 'gloat'],
    hat: ({ cx, hy }) => [poly([[cx - 72, hy - 82], [cx - 80, hy - 236], [cx + 80, hy - 236], [cx + 72, hy - 82]], '#1d1b24', 6), ell(cx, hy - 236, 80, 14, '#2c2a36', INK, 5), rect(cx - 74, hy - 120, 148, 28, '#b8322a', 4.5, 2), hl(`M${cx - 54},${hy - 130} L${cx - 58},${hy - 222}`, 9, .3),
      P(`M${cx - 122},${hy - 74} Q${cx},${hy - 108} ${cx + 122},${hy - 74} Q${cx + 130},${hy - 58} ${cx + 104},${hy - 58} Q${cx},${hy - 84} ${cx - 104},${hy - 58} Q${cx - 130},${hy - 58} ${cx - 122},${hy - 74} Z`, '#1d1b24', INK, 5.5)],
    faceTop: ({ cx, hy }) => [-1, 1].map(s => P(`M${cx},${hy + 12} Q${cx + s * 34},${hy - 4} ${cx + s * 74},${hy + 12} Q${cx + s * 112},${hy + 26} ${cx + s * 126},${hy - 2} Q${cx + s * 132},${hy - 24} ${cx + s * 110},${hy - 28} Q${cx + s * 120},${hy - 4} ${cx + s * 94},${hy + 4} Q${cx + s * 60},${hy + 2} ${cx + s * 36},${hy + 22} Q${cx + s * 14},${hy + 30} ${cx},${hy + 22} Z`, '#1d1b24', INK, 4) + L(`M${cx + s * 20},${hy + 12} q${s * 20},-8 ${s * 40},0`, 3, '#5a5866')),
    behind: ({ cx, top }) => [P(`M${cx - 50},${top + 6} Q${cx},${top - 8} ${cx + 50},${top + 6} Q${cx + 110},${top + 300} ${cx + 96},${top + 600} Q${cx - 20},${top + 560} ${cx - 120},${top + 620} Q${cx - 200},${top + 560} ${cx - 238},${top + 470} Q${cx - 150},${top + 300} ${cx - 50},${top + 6} Z`, '#1d1b24', INK, 6),
      P(`M${cx - 238},${top + 470} Q${cx - 200},${top + 560} ${cx - 120},${top + 620} Q${cx - 150},${top + 520} ${cx - 120},${top + 400} Q${cx - 190},${top + 450} ${cx - 238},${top + 470} Z`, '#b8322a', INK, 5), L(`M${cx - 20},${top + 80} q-60,240 -120,420`, 4, '#3a3846')],
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 4} L${cx},${top + 110} L${cx + 30},${top - 4} Z`, CREAM, INK, 4), P(`M${cx - 20},${top + 20} L${cx + 20},${top + 34} L${cx + 20},${top + 14} L${cx - 20},${top + 34} Z`, '#b8322a', INK, 3.5), ...[0, 1, 2].map(k => circ(cx + 18, top + 150 + k * 50, 6, GOLD, 3))],
    arms: B => { const [x, y] = hp(B, F.gloat, 128, -6); return { front: [B.arm(-1, B.cx - 116, B.top + 250, 24), B.arm(1, x + 6, y + 8, 70)] }; },
    props: ({ cx, top }) => { const x = cx - 116, y = top + 250, o = [];
      for (const [dx, dy, r] of [[-8, 10, 56], [6, 18, 52], [-4, 28, 48]]) o.push(`<ellipse cx="${x + dx}" cy="${y + dy}" rx="${r * .8}" ry="${r}" fill="none" stroke="${INK}" stroke-width="17"/><ellipse cx="${x + dx}" cy="${y + dy}" rx="${r * .8}" ry="${r}" fill="none" stroke="#c9a26b" stroke-width="9"/>`);
      o.push(rope(`M${x - 30},${y + 70} q-20,80 10,150 q20,40 -6,90`), fist(x, y - 40, 14));
      return o; },
    over: B => { const [x, y] = hp(B, F.gloat, 128, -6); return [fist(x + 6, y + 8, 14), L(`M${x + 26},${y - 20} a16,16 0 1,1 -6,-22`, 4), P(`M${x + 14},${y - 46} l10,-2 l-4,10 Z`)]; } },

  // 4 MOB BOSS: big boi in a pinstripe suit, white fedora, fur stole, fat cigar, steepled fingers
  { name: 'mobboss', label: 'Mob Boss', form: 'bigboi', coat: '#3e2a52', face: ['villain', 'scheme'],
    hat: ({ cx, hy }) => [rot(-12, cx, hy - 90, [P(`M${cx - 84},${hy - 100} Q${cx - 92},${hy - 176} ${cx - 44},${hy - 186} Q${cx},${hy - 168} ${cx + 44},${hy - 186} Q${cx + 92},${hy - 176} ${cx + 84},${hy - 100} Z`, '#f2ede2', INK, 6),
      P(`M${cx - 86},${hy - 124} Q${cx},${hy - 136} ${cx + 86},${hy - 124} L${cx + 86},${hy - 100} Q${cx},${hy - 112} ${cx - 86},${hy - 100} Z`, '#1d1a26', INK, 4.5), L(`M${cx},${hy - 172} q-6,26 0,44`, 4, '#c9c1ae'), hl(`M${cx - 66},${hy - 140} Q${cx - 50},${hy - 172} ${cx - 24},${hy - 176}`, 7, .5),
      P(`M${cx - 144},${hy - 86} Q${cx},${hy - 124} ${cx + 144},${hy - 92} Q${cx + 156},${hy - 74} ${cx + 120},${hy - 72} Q${cx},${hy - 100} ${cx - 120},${hy - 70} Q${cx - 156},${hy - 70} ${cx - 144},${hy - 86} Z`, '#f2ede2', INK, 5.5)])],
    faceTop: ({ cx, hy }) => [rot(12, cx + 46, hy + 34, [rect(cx + 40, hy + 26, 70, 18, '#7a4a26', 4, 8), L(`M${cx + 60},${hy + 28} l0,14`, 3, '#d6a23a'), rect(cx + 104, hy + 26, 14, 18, '#c9c4d0', 3.4, 5), ell(cx + 117, hy + 35, 3, 6, '#ff6a3a')]),
      L(`M${cx + 128},${hy + 30} q14,-20 0,-40 q-14,-20 4,-44`, 5, '#bdb6c8'), L(`M${cx + 144},${hy + 4} q10,-14 0,-28`, 4, '#bdb6c8')],
    details: ({ cx, top }) => { const o = [];
      for (let x = cx - 230; x <= cx + 230; x += 26) o.push(L(`M${x},${top - 10} L${x},${top + 480}`, 2.6, '#8f7aa6'));
      o.push(P(`M${cx - 60},${top} L${cx},${top + 170} L${cx + 60},${top} Z`, '#1d1a26', INK, 4), P(`M${cx - 14},${top + 20} L${cx + 14},${top + 20} L${cx + 20},${top + 140} L${cx},${top + 168} L${cx - 20},${top + 140} Z`, '#f2ede2', INK, 3.5));
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 60},${top} L${cx + s * 120},${top + 70} L${cx + s * 74},${top + 90} L${cx + s * 6},${top + 210} Z`, '#2c1c3c', INK, 4));
      o.push(...[0, 1].map(k => circ(cx, top + 250 + k * 60, 9, '#f2ede2', 3)), P(`M${cx + 120},${top + 100} l40,0 l-4,-22 l-10,12 l-8,-16 l-8,16 l-10,-12 Z`, '#f2ede2', INK, 3.5));
      return o; },
    arms: B => { const a = hp(B, F.scheme, -26, 136), b = hp(B, F.scheme, 26, 136); return { front: [B.arm(-1, a[0], a[1], 40), B.arm(1, b[0], b[1], -40)] }; },
    props: ({ cx, top }) => [cloud([...Array(9)].map((_, k) => [cx - 200 + k * 50, top + 20 + Math.abs(k - 4) * 8 - (k === 4 ? 0 : 0), 36]), '#f4f1f6'), ...[-150, -50, 50, 150].map(t => L(`M${cx + t},${top + 20} q8,8 4,18`, 2.6, '#c9c4d0')), cloud([[cx - 120, top + 120, 20], [cx - 104, top + 132, 16]], '#d8473c')] },

  // 5 BURGLAR: striped shirt, beanie, domino mask, giant swag sack over the shoulder, hands rubbing
  { name: 'burglar', label: 'Burglar', form: 'standard', coat: '#f1eff4', face: ['villain', 'greedy'],
    hat: ({ cx, hy }) => [P(`M${cx - 104},${hy - 52} Q${cx - 108},${hy - 130} ${cx},${hy - 138} Q${cx + 108},${hy - 130} ${cx + 104},${hy - 52} Z`, '#24222c', INK, 6), ...[-60, -30, 0, 30, 60].map(t => L(`M${cx + t},${hy - 76} L${cx + t * 1.1},${hy - 124 + Math.abs(t) * .3}`, 3, '#3e3b48')),
      P(`M${cx - 110},${hy - 74} Q${cx},${hy - 90} ${cx + 110},${hy - 74} L${cx + 108},${hy - 46} Q${cx},${hy - 62} ${cx - 108},${hy - 46} Z`, '#24222c', INK, 5), hl(`M${cx - 70},${hy - 110} Q${cx - 40},${hy - 128} ${cx - 6},${hy - 128}`, 7, .3)],
    faceTop: ({ cx, hy }) => { const hole = (x, y, r) => `M${x - r},${y} A${r},${r} 0 1,0 ${x + r},${y} A${r},${r} 0 1,0 ${x - r},${y} Z`;
      return [`<path d="M${cx - 106},${hy - 34} Q${cx - 60},${hy - 60} ${cx},${hy - 44} Q${cx + 60},${hy - 60} ${cx + 106},${hy - 34} Q${cx + 102},${hy + 8} ${cx + 62},${hy + 10} Q${cx + 20},${hy + 6} ${cx},${hy - 8} Q${cx - 20},${hy + 6} ${cx - 62},${hy + 10} Q${cx - 102},${hy + 8} ${cx - 106},${hy - 34} Z ${hole(cx - 36, hy - 20, 30)} ${hole(cx + 36, hy - 20, 30)}" fill="#1b1922" fill-rule="evenodd" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
        P(`M${cx + 100},${hy - 28} Q${cx + 136},${hy - 40} ${cx + 152},${hy - 18} Q${cx + 130},${hy - 20} ${cx + 104},${hy - 12} Z`, '#1b1922', INK, 4), P(`M${cx + 100},${hy - 18} Q${cx + 134},${hy - 6} ${cx + 140},${hy + 20} Q${cx + 120},${hy + 4} ${cx + 98},${hy - 4} Z`, '#1b1922', INK, 4)]; },
    behind: ({ cx, top }) => [fillPts([[cx - 60, top + 30], [cx - 140, top - 4], [cx - 222, top + 70], [cx - 238, top + 190], [cx - 190, top + 300], [cx - 96, top + 310], [cx - 40, top + 230], [cx - 36, top + 110]], '#cdb98e', 6),
      L(`M${cx - 200},${top + 120} q-6,60 20,110 M${cx - 150},${top + 40} q30,20 40,60`, 3.6, '#a8956a'), rect(cx - 210, top + 210, 44, 40, '#b5a274', 3.5, 3), L(`M${cx - 206},${top + 214} l36,32 M${cx - 170},${top + 214} l-36,32`, 2, '#8a7a50'),
      `<text x="${cx - 136}" y="${top + 200}" font-family="Arial Black,Arial" font-weight="900" font-size="96" text-anchor="middle" fill="#3fae5a" stroke="${INK}" stroke-width="4">$</text>`,
      poly([[cx - 74, top + 40], [cx - 54, top - 30], [cx - 34, top - 26], [cx - 46, top + 44]], '#cdb98e', 5), ...[[-70, -40], [-40, -46], [-56, -62]].map(([dx, dy]) => circ(cx + dx, top + dy, 13, GOLD, 4)), rope(`M${cx - 76},${top + 22} q20,8 36,-2`, '#8a6a3a', 6)],
    details: ({ cx, top, bot }) => [bands(cx - 220, cx + 220, top - 10, bot + 10, [...Array(10)].map((_, k) => k % 2 ? '#24222c' : '#f1eff4'))],
    arms: B => { const a = hp(B, F.greedy, -18, 132), b = hp(B, F.greedy, 18, 134); return { front: [B.arm(-1, a[0], a[1], 40), B.arm(1, b[0], b[1], -40)] }; } },

  // 6 CAT BURGLAR: black catsuit, cat-ear cap + mask, ponytail, swinging grappling hook, stolen diamond
  { name: 'catburglar', label: 'Cat Burglar', form: 'lady', coat: '#25222e', face: ['female', 'sassy'],
    headBack: ({ cx, hy }) => [P(`M${cx - 40},${hy - 96} Q${cx - 150},${hy - 70} ${cx - 160},${hy + 40} Q${cx - 166},${hy + 120} ${cx - 132},${hy + 170} Q${cx - 130},${hy + 110} ${cx - 110},${hy + 50} Q${cx - 90},${hy - 20} ${cx - 30},${hy - 60} Z`, '#1d1a26', INK, 6), hl(`M${cx - 120},${hy - 40} Q${cx - 146},${hy + 10} ${cx - 144},${hy + 70}`, 6, .3)],
    hat: ({ cx, hy }) => { const o = [];
      for (const s of [-1, 1]) o.push(P(`M${cx + s * 34},${hy - 112} L${cx + s * 96},${hy - 196} L${cx + s * 104},${hy - 82} Z`, '#1d1a26', INK, 6), P(`M${cx + s * 58},${hy - 112} L${cx + s * 90},${hy - 164} L${cx + s * 94},${hy - 104} Z`, '#7a5a9e', 'none', 0));
      o.push(fillPts([[cx - 104, hy - 18], [cx - 108, hy - 82], [cx - 60, hy - 118], [cx, hy - 126], [cx + 60, hy - 118], [cx + 108, hy - 82], [cx + 104, hy - 18], [cx + 92, hy - 30], [cx + 72, hy - 86], [cx, hy - 98], [cx - 72, hy - 86], [cx - 92, hy - 30]], '#1d1a26', 6), hl(`M${cx - 76},${hy - 92} Q${cx - 40},${hy - 116} ${cx},${hy - 116}`, 7, .3));
      return o; },
    faceTop: ({ cx, hy }) => [`<path d="M${cx - 100},${hy - 30} Q${cx - 50},${hy - 52} ${cx},${hy - 34} Q${cx + 50},${hy - 52} ${cx + 100},${hy - 30} Q${cx + 96},${hy + 6} ${cx + 56},${hy + 8} Q${cx + 16},${hy + 4} ${cx},${hy - 8} Q${cx - 16},${hy + 4} ${cx - 56},${hy + 8} Q${cx - 96},${hy + 6} ${cx - 100},${hy - 30} Z M${cx - 62},${hy - 14} Q${cx - 34},${hy - 40} ${cx - 8},${hy - 14} Q${cx - 34},${hy + 2} ${cx - 62},${hy - 14} Z M${cx + 8},${hy - 14} Q${cx + 34},${hy - 40} ${cx + 62},${hy - 14} Q${cx + 34},${hy + 2} ${cx + 8},${hy - 14} Z" fill="#1d1a26" fill-rule="evenodd" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`],
    details: ({ cx, top, bot }) => [L(`M${cx},${top + 10} L${cx},${bot}`, 4, '#4a4658'), circ(cx, top + 40, 7, STEEL, 3), rect(cx - 220, top + 150, 440, 26, '#4a2f62', 4, 2), ...[-70, 50].map(t => rect(cx + t, top + 170, 30, 36, '#3a3448', 3.5, 5)), L(`M${cx - 150},${top + 300} q150,30 300,0`, 3, '#3a3448')],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top - 40, 30), B.arm(1, B.cx + 150, B.top + 240, -30)] }),
    props: ({ cx, top }) => { const x = cx + 150, y = top + 240, G = '#9fe6f2';
      return [poly([[x - 30, y - 40], [x - 18, y - 60], [x + 18, y - 60], [x + 30, y - 40], [x, y - 2]], G, 4.5), L(`M${x - 30},${y - 40} L${x + 30},${y - 40} M${x - 8},${y - 60} L${x - 12},${y - 40} L${x},${y - 2} M${x + 8},${y - 60} L${x + 12},${y - 40}`, 2.6), `<path d="M${x - 22},${y - 46} l8,-10" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
        ...[[-46, -74, 12], [40, -80, 9], [44, -30, 7]].map(([dx, dy, r]) => P(`M${x + dx},${y + dy - r} Q${x + dx + r * .2},${y + dy - r * .2} ${x + dx + r},${y + dy} Q${x + dx + r * .2},${y + dy + r * .2} ${x + dx},${y + dy + r} Q${x + dx - r * .2},${y + dy + r * .2} ${x + dx - r},${y + dy} Q${x + dx - r * .2},${y + dy - r * .2} ${x + dx},${y + dy - r} Z`, '#fff', INK, 2.6)), fist(x, y, 13)]; },
    over: ({ cx, top }) => { const hx = cx - 150, hy = top - 40, kx = cx - 196, ky = top - 262, o = [];
      o.push(rope(`M${hx},${hy} Q${cx - 232},${top - 110} ${kx},${ky}`, '#c9a26b', 7), rope(`M${hx},${hy} q-30,120 10,200 q40,80 -10,160`, '#c9a26b', 7));
      o.push(`<g opacity=".6">${[0, 1, 2].map(k => L(`M${cx - 230 + k * 14},${top - 230 + k * 30} q-14,24 -4,48`, 4)).join('')}</g>`);
      o.push(rect(kx - 9, ky - 46, 18, 46, '#8d93a3', 4, 3));
      for (const s of [-1, 0, 1]) o.push(rot(s * 40, kx, ky - 46, [L(`M${kx},${ky - 46} L${kx},${ky - 88} q0,-20 ${s >= 0 ? 18 : -18},-22`, 17), L(`M${kx},${ky - 46} L${kx},${ky - 88} q0,-20 ${s >= 0 ? 18 : -18},-22`, 9, '#b8bfcc')]));
      o.push(fist(hx, hy, 14));
      return o; } },

  // 7 HENCHMAN: brute in a black suit, bald with a scar, tiny sunglasses, earpiece, handcuffed briefcase
  { name: 'henchman', label: 'Henchman', form: 'brute', coat: '#26242e', face: ['villain', 'sneer'],
    hat: ({ cx, hy }) => [hl(`M${cx - 64},${hy - 62} Q${cx - 40},${hy - 88} ${cx - 6},${hy - 92}`, 10, .6), L(`M${cx - 76},${hy - 52} L${cx - 40},${hy - 80}`, 4.5, '#b46a7a'), ...[0, 1, 2].map(k => L(`M${cx - 72 + k * 13},${hy - 66 - k * 10} l10,10`, 3, '#b46a7a'))],
    faceTop: ({ cx, hy }) => [rect(cx - 56, hy - 26, 34, 20, '#141217', 3.5, 6), rect(cx + 18, hy - 26, 34, 20, '#141217', 3.5, 6), L(`M${cx - 22},${hy - 18} q20,-6 40,0`, 4), L(`M${cx - 50},${hy - 22} l8,0 M${cx + 24},${hy - 22} l8,0`, 3, '#fff'), L(`M${cx - 56},${hy - 18} L${cx - 96},${hy - 10} M${cx + 52},${hy - 18} L${cx + 96},${hy - 10}`, 3.4),
      ell(cx + 98, hy + 4, 7, 9, '#141217', INK, 2.6), L(`M${cx + 96},${hy + 12} q10,6 0,12 q-10,6 0,12 q10,6 0,12 q-10,6 0,12 q10,6 0,12`, 3, '#8d93a3')],
    details: ({ cx, top }) => [P(`M${cx - 54},${top + 4} L${cx},${top + 130} L${cx + 54},${top + 4} Z`, '#f1eff4', INK, 4), P(`M${cx - 12},${top + 20} L${cx + 12},${top + 20} L${cx + 16},${top + 110} L${cx},${top + 128} L${cx - 16},${top + 110} Z`, '#141217', INK, 3), ...[-1, 1].map(s => P(`M${cx + s * 54},${top + 4} L${cx + s * 120},${top + 60} L${cx + s * 84},${top + 80} L${cx + s * 10},${top + 170} Z`, '#1a1820', INK, 4)), ...[0, 1].map(k => circ(cx, top + 210 + k * 60, 8, '#141217', 3)), L(`M${cx - 120},${top + 240} q14,10 8,24 M${cx + 120},${top + 240} q-14,10 -8,24`, 3, '#4a4658')],
    arms: B => ({ front: [B.arm(-1, B.hdL[0], B.hdL[1], 20), B.arm(1, B.cx + 176, B.ground - 120, 30)] }),
    props: ({ cx, ground }) => { const x = cx + 176, y = ground - 120; return [L(`M${x},${y} q14,20 6,40`, 4, '#8d93a3'), rect(cx + 128, y + 38, 110, 74, '#2c2a36', 6, 8), rect(cx + 166, y + 26, 34, 16, '#2c2a36', 4, 6), rect(cx + 170, y + 62, 30, 10, GOLD, 3, 2), hl(`M${cx + 140},${y + 52} L${cx + 140},${y + 98}`, 5, .3), fist(x, y, 22), `<circle cx="${x}" cy="${y + 10}" r="12" fill="none" stroke="#b8bfcc" stroke-width="5"/>`]; } },

  // 8 EVIL SORCERER: tall pointed hood, rune robe, horned-skull staff with green fire, fireball in hand
  { name: 'sorcerer', label: 'Evil Sorcerer', form: 'elder', coat: '#2b2238', face: ['villain', 'maniac'], cane: false,
    headBack: ({ cx, hy }) => [P(`M${cx - 122},${hy + 90} Q${cx - 136},${hy - 70} ${cx - 70},${hy - 136} Q${cx},${hy - 190} ${cx + 34},${hy - 262} Q${cx + 84},${hy - 170} ${cx + 116},${hy - 80} Q${cx + 136},${hy} ${cx + 122},${hy + 90} Z`, '#3a2a52', INK, 6), hl(`M${cx - 90},${hy - 90} Q${cx - 40},${hy - 160} ${cx + 20},${hy - 220}`, 7, .25)],
    hat: ({ cx, hy }) => [P(`M${cx - 114},${hy + 76} Q${cx - 128},${hy - 112} ${cx},${hy - 122} Q${cx + 128},${hy - 112} ${cx + 114},${hy + 76} L${cx + 98},${hy + 66} Q${cx + 106},${hy - 92} ${cx},${hy - 100} Q${cx - 106},${hy - 92} ${cx - 98},${hy + 66} Z`, '#4a3768', INK, 5.5)],
    behind: ({ cx, top }) => [P(`M${cx - 110},${top + 40} L${cx - 170},${top + 560} L${cx + 170},${top + 560} L${cx + 110},${top + 40} Z`, '#2b2238', INK, 6), ...[-1, 1].map(s => L(`M${cx + s * 60},${top + 300} L${cx + s * 100},${top + 552}`, 4, '#1c1626')), P(`M${cx - 168},${top + 520} L${cx + 168},${top + 520} L${cx + 170},${top + 560} L${cx - 170},${top + 560} Z`, '#5a3a86', INK, 4)],
    details: ({ cx, top }) => [rect(cx - 30, top - 10, 60, 400, '#5a3a86', 4, 2), ...['M0,0 l12,-16 l12,16 l-12,16 Z', 'M2,-14 l20,0 l-20,28 l20,0', 'M12,-16 l0,32 M0,-4 l24,0', 'M0,-12 q12,24 24,0'].map((d, k) => `<path d="${d}" transform="translate(${cx - 12},${top + 60 + k * 64})" fill="none" stroke="${GLOW}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
      L(`M${cx - 160},${top + 150} Q${cx},${top + 180} ${cx + 160},${top + 150}`, 9, '#c9a26b'), L(`M${cx - 160},${top + 150} Q${cx},${top + 180} ${cx + 160},${top + 150}`, 3, INK)],
    arms: B => ({ front: [B.arm(-1, B.cx - 150, B.top + 110, 30), B.arm(1, B.cx + 176, B.top + 140, -10)] }),
    props: ({ cx, top }) => { const x = cx - 150, y = top + 110;
      return [`<circle cx="${x}" cy="${y - 44}" r="54" fill="${GLOW}" opacity=".25"/>`, P(`M${x - 26},${y - 20} Q${x - 34},${y - 60} ${x - 8},${y - 92} Q${x - 6},${y - 66} ${x + 4},${y - 70} Q${x + 2},${y - 98} ${x + 20},${y - 112} Q${x + 18},${y - 72} ${x + 30},${y - 50} Q${x + 34},${y - 20} ${x},${y - 12} Q${x - 20},${y - 10} ${x - 26},${y - 20} Z`, GLOW, INK, 4.5), P(`M${x - 10},${y - 22} Q${x - 14},${y - 46} ${x + 2},${y - 58} Q${x + 14},${y - 40} ${x + 12},${y - 22} Z`, '#e8ffd0', 'none', 0), fist(x, y, 14)]; },
    over: ({ cx, top, ground }) => { const x = cx + 176, y = top + 140, sx = x - 8, sy = top - 290, o = [];
      o.push(pole(x + 6, ground - 10, sx, sy + 30, WOODD, 13), `<circle cx="${sx}" cy="${sy}" r="70" fill="${GLOW}" opacity=".22"/>`);
      for (const s of [-1, 1]) o.push(P(`M${sx + s * 22},${sy - 20} Q${sx + s * 70},${sy - 50} ${sx + s * 66},${sy + 8} Q${sx + s * 60},${sy + 36} ${sx + s * 40},${sy + 24} Q${sx + s * 56},${sy + 4} ${sx + s * 44},${sy - 14} Q${sx + s * 34},${sy - 22} ${sx + s * 20},${sy - 4} Z`, '#d8cfb8', INK, 4.5));
      o.push(P(`M${sx - 34},${sy} Q${sx - 36},${sy - 42} ${sx},${sy - 44} Q${sx + 36},${sy - 42} ${sx + 34},${sy} Q${sx + 32},${sy + 20} ${sx + 18},${sy + 24} L${sx + 18},${sy + 38} L${sx - 18},${sy + 38} L${sx - 18},${sy + 24} Q${sx - 32},${sy + 20} ${sx - 34},${sy} Z`, '#f3efe6', INK, 5));
      o.push(ell(sx - 14, sy - 6, 10, 12, INK), ell(sx + 14, sy - 6, 10, 12, INK), ell(sx - 14, sy - 4, 4, 5, GLOW), ell(sx + 14, sy - 4, 4, 5, GLOW), P(`M${sx},${sy + 8} l-5,10 l10,0 Z`, INK, INK, 2), L(`M${sx - 10},${sy + 30} l0,8 M${sx},${sy + 30} l0,8 M${sx + 10},${sy + 30} l0,8`, 3));
      o.push(P(`M${sx - 16},${sy - 44} Q${sx - 24},${sy - 80} ${sx - 4},${sy - 104} Q${sx},${sy - 80} ${sx + 10},${sy - 84} Q${sx + 14},${sy - 106} ${sx + 28},${sy - 118} Q${sx + 30},${sy - 76} ${sx + 18},${sy - 44} Z`, GLOW, INK, 4), fist(x, y, 15));
      return o; } },

  // 9 SNAKE-OIL SWINDLER: bowler hat, pencil moustache, coat flung open to show rows of dodgy tonics, whispering a deal
  { name: 'swindler', label: 'Snake-Oil Swindler', form: 'dad', coat: '#d9b44a', face: ['villain', 'whisper'],
    hat: ({ cx, hy }) => [`<g transform="translate(-22,-10)">`, rot(10, cx, hy - 90, [P(`M${cx - 72},${hy - 92} Q${cx - 78},${hy - 172} ${cx},${hy - 176} Q${cx + 78},${hy - 172} ${cx + 72},${hy - 92} Z`, '#6b4a2e', INK, 6), rect(cx - 74, hy - 112, 148, 18, '#3a2616', 4, 2), hl(`M${cx - 52},${hy - 126} Q${cx - 40},${hy - 160} ${cx - 10},${hy - 164}`, 7, .4),
      P(`M${cx - 104},${hy - 98} Q${cx},${hy - 112} ${cx + 104},${hy - 98} Q${cx + 110},${hy - 84} ${cx + 92},${hy - 84} Q${cx},${hy - 98} ${cx - 92},${hy - 84} Q${cx - 110},${hy - 84} ${cx - 104},${hy - 98} Z`, '#6b4a2e', INK, 5)]), '</g>'],
    faceTop: ({ cx, hy }) => [brush(cx - 30, hy + 32, cx, hy + 24, cx + 30, hy + 30, 6, { tip: .2 }), L(`M${cx - 30},${hy + 32} q-6,-2 -8,-8 M${cx + 30},${hy + 30} q6,-2 8,-8`, 3)],
    details: ({ cx, top }) => { const o = [];
      for (let x = cx - 160; x <= cx + 160; x += 30) o.push(L(`M${x},${top - 10} L${x},${top + 400}`, 3, '#b08a2a'));
      for (let y = top + 20; y <= top + 400; y += 30) o.push(L(`M${cx - 200},${y} L${cx + 200},${y}`, 3, '#b08a2a'));
      o.push(P(`M${cx - 22},${top + 14} L${cx + 22},${top + 34} L${cx + 22},${top + 10} L${cx - 22},${top + 34} Z`, '#b8322a', INK, 3.5), ...[0, 1, 2, 3].map(k => circ(cx, top + 90 + k * 56, 7, GOLD, 3)), L(`M${cx},${top + 150} Q${cx + 50},${top + 190} ${cx + 90},${top + 160}`, 4, GOLD));
      return o; },
    arms: B => { const [x, y] = hp(B, F.whisper, 74, 66); return { front: [B.arm(-1, B.cx - 214, B.top + 170, 30), B.arm(1, x, y, 80)] }; },
    behind: ({ cx, top }) => [P(`M${cx + 20},${top - 4} Q${cx + 120},${top + 10} ${cx + 140},${top + 120} L${cx + 146},${top + 430} L${cx + 60},${top + 440} Q${cx + 50},${top + 200} ${cx + 20},${top - 4} Z`, '#5e3b5c', INK, 5)],
    props: ({ cx, top }) => { const o = [], COAT = '#5e3b5c', LIN = '#b8322a';
      o.push(P(`M${cx - 34},${top - 4} L${cx - 214},${top + 150} L${cx - 236},${top + 440} L${cx - 70},${top + 430} Q${cx - 70},${top + 200} ${cx - 34},${top - 4} Z`, LIN, INK, 5), L(`M${cx - 34},${top - 4} L${cx - 214},${top + 150}`, 14, COAT), L(`M${cx - 214},${top + 150} L${cx - 236},${top + 440}`, 12, COAT));
      const cols = ['#3fae5a', '#7a2fc0', '#2f8fd0', '#e07a2e', '#d8473c', '#3fae5a', '#e2b13c', '#2f8fd0', '#7a2fc0'];
      cols.forEach((c, k) => { const r = Math.floor(k / 3), i = k % 3, x = cx - 186 + i * 42 + r * 6, y = top + 190 + r * 80;
        o.push(rect(x - 13, y - 4, 26, 50, c, 3.5, 6), rect(x - 5, y - 20, 10, 18, c, 3, 2), rect(x - 6, y - 26, 12, 8, WOODD, 2.6, 2), rect(x - 10, y + 14, 20, 16, CREAM, 2.4, 2), L(`M${x - 7},${y + 4} l0,8`, 3, '#fff')); });
      o.push(...[0, 1, 2].map(r => L(`M${cx - 206 + r * 6},${top + 248 + r * 80} L${cx - 72},${top + 248 + r * 80}`, 4, '#7a1c24')));
      o.push(fist(cx - 214, top + 170, 15));
      return o; } },

  // 10 ROBOT OVERLORD: small robot with a steel skull-cap, a giant mech claw out of its back holding the whole world, big red button
  { name: 'robot', label: 'Robot Overlord', form: 'kid', coat: '#a7afc0', face: ['villain', 'laugh'],
    hat: ({ cx, hy }) => [P(`M${cx - 102},${hy - 56} Q${cx - 106},${hy - 126} ${cx},${hy - 134} Q${cx + 106},${hy - 126} ${cx + 102},${hy - 56} Q${cx + 80},${hy - 86} ${cx},${hy - 94} Q${cx - 80},${hy - 86} ${cx - 102},${hy - 56} Z`, STEEL, INK, 6), ...[-70, -36, 0, 36, 70].map(t => circ(cx + t, hy - 100 - (70 - Math.abs(t)) * .25, 4.5, '#e8ebf2', 2.4)), hl(`M${cx - 76},${hy - 92} Q${cx - 40},${hy - 120} ${cx},${hy - 122}`, 7, .5),
      ...[-1, 1].map(s => circ(cx + s * 106, hy - 6, 20, STEEL, 5) + circ(cx + s * 106, hy - 6, 8, '#e0453a', 3)), L(`M${cx - 118},${hy - 22} L${cx - 150},${hy - 96}`, 5), circ(cx - 152, hy - 100, 9, '#e0453a', 3)],
    behind: ({ cx, top }) => { const sx = cx + 20, sy = top + 40, ex = cx - 224, ey = top - 80, wx = cx - 192, wy = top - 414, gx = cx - 186, gy = top - 486, o = [];
      o.push(P(`M${cx - 70},${top + 20} Q${cx},${top} ${cx + 70},${top + 20} L${cx + 120},${top + 300} L${cx - 120},${top + 300} Z`, '#b8322a', INK, 5));
      o.push(pole(sx, sy, ex, ey, '#8d93a3', 30), pole(ex, ey, wx, wy, '#8d93a3', 26), circ(ex, ey, 24, STEEL, 5), circ(ex, ey, 8, '#5a5868', 3), circ(sx, sy, 22, STEEL, 5));
      o.push(`<g transform="translate(${gx},${gy}) scale(.9) translate(${-gx},${-gy})">`, `<circle cx="${gx}" cy="${gy}" r="66" fill="#4f9ad8" stroke="${INK}" stroke-width="6"/>`, P(`M${gx - 50},${gy - 40} q20,-20 44,-6 q10,24 -12,34 q-6,26 -28,22 q-16,-24 -4,-50 Z`, '#5cbf5a', INK, 3.5), P(`M${gx + 20},${gy - 10} q30,-14 44,8 q-4,30 -22,40 q-16,20 -30,4 q4,-24 8,-52 Z`, '#5cbf5a', INK, 3.5), hl(`M${gx - 56},${gy - 20} Q${gx - 50},${gy - 54} ${gx - 20},${gy - 66}`, 7, .5), '</g>');
      o.push(rect(wx - 34, wy - 22, 68, 40, STEEL, 5, 8));
      for (const [a, len] of [[-44, 96], [44, 96]]) o.push(rot(a, wx, wy - 10, [P(`M${wx - 13},${wy - 10} L${wx - 16},${wy - len + 20} Q${wx},${wy - len - 10} ${wx + 30},${wy - len + 6} L${wx + 12},${wy - len + 24} L${wx + 13},${wy - 10} Z`, STEEL, INK, 5)]));
      return o; },
    details: ({ cx, top, bot }) => [rect(cx - 46, top + 40, 92, 66, '#2c2a36', 4, 8), ...[[-26, '#e0453a'], [0, '#ffd23f'], [26, '#3fae5a']].map(([t, c]) => circ(cx + t, top + 62, 8, c, 3)), ...[-30, -10, 10, 30].map(t => L(`M${cx + t - 6},${top + 90} l12,0`, 3, '#8de0ff')), ...[-90, 90].flatMap(t => [0, 1, 2].map(k => circ(cx + t, top + 40 + k * 50, 4, '#e8ebf2', 2))), L(`M${cx - 120},${top + 150} L${cx + 120},${top + 150}`, 4, '#7d8596')],
    arms: B => ({ front: [B.arm(-1, B.cx - 116, B.top + 60, 20), B.arm(1, B.cx + 196, B.top - 10, 30)] }),
    props: ({ cx, top }) => [rect(cx - 150, top + 44, 56, 70, '#2c2a36', 5, 8), circ(cx - 122, top + 64, 14, '#e0453a', 4), L(`M${cx - 128},${top + 58} l6,-4`, 3, '#fff'), fist(cx - 116, top + 92, 13), fist(cx + 196, top - 10, 15), ...[0, 1, 2].map(k => L(`M${cx + 176 + k * 18},${top - 48 - k * 4} l${-4 + k * 6},-18`, 4))] },
];
