// GRIPS: hands that really hold things (CB 2026-11-12: "how we can make chracter holding like human real hand holding item").
// Measured on Rick's clips (Spear vs Shield, Cart Army, Knight Loophole, Grave Bell):
//  1. POLE / HANDLE: the object is drawn FIRST and the round fist ON TOP, centred on the shaft line; the shaft comes out on BOTH sides of the fist
//     (spear, pointer stick, shovel, wheelbarrow handles, lantern ring). Two hands on one shaft = both fists on the same straight line.
//  2. EDGE: a flat thing held in front (sign, box, scroll): the fists sit ON its front face, half over its edge (Grave Bell "Bodies" sign).
//  3. BEHIND: a big flat thing between hand and lens (shield, board carried in front): the hand is hidden, only the arm reaches its rim.
//  4. HANG: a load hangs STRAIGHT DOWN from the fist by its handle (lantern, bucket, bag), whatever the arm angle (gravity).
//  5. SHOULDER: a pole rests on the shoulder, the fist in front holds it (two men carrying the chest on a pole).
//  6. CLOSE-UP: when the hand fills the frame Rick draws a real black glove hand with fingers wrapped round the handle and the thumb on top
//     (Cart Army drill macro). realHand() draws that, the same black, with a soft shine.
// Every fist on an object gets FINGER WRAP marks: 3 creases across the shaft on the knuckle side and the thumb lobe over the shaft, so the hand
// reads as fingers closed round the thing, while the outline stays Rick's round fist.
// Coordinates: rig px. Angles: screen degrees, 0 = pointing right (+x), -90 = straight up.

const f = v => (+v).toFixed(1), D = Math.PI / 180;
const INK0 = '#2a1a1f';
const WOOD = '#a5703f', WOODD = '#6e4527', WOODL = '#c99560', STEEL = '#c4cad6', STEELD = '#7d8596', GOLD = '#e2b13c', GOLDD = '#a87a1c', RED = '#c9392f';
const line = (x0, y0, x1, y1, col, w, cap = 'round', extra = '') => `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="${cap}" fill="none"${extra}/>`;
// a wooden shaft along the local x axis, x0..x1: ink edge, wood, darker lower half, grain lines, one highlight streak (CB rule: texture, fine lines, highlights)
function shaft(x0, x1, w, INK, col = WOOD) {
  return line(x0, 0, x1, 0, INK, w + 7) + line(x0, 0, x1, 0, col, w) + line(x0, w * .22, x1, w * .22, WOODD, w * .38, 'round', ' opacity=".45"')
    + [.12, .37, .61, .83].map((k, i) => { const a = x0 + (x1 - x0) * k, b = a + (x1 - x0) * .09; return line(a, (i % 2 ? -1 : 1) * w * .12, b, (i % 2 ? -1 : 1) * w * .12, WOODD, 1.6, 'round', ' opacity=".7"'); }).join('')
    + line(x0 + 10, -w * .28, x1 - 10, -w * .28, WOODL, Math.max(1.5, w * .16), 'round', ' opacity=".8"');
}
const steelGlint = (x, y, l) => `<path d="M${f(x - l)},${f(y)} L${f(x + l)},${f(y)}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>`;

// OBJECTS: drawn in a local frame, grip point at (0,0), long axis along +x. kind = how it is held by default; at = where the grip sits.
export const GRIP_OBJECTS = {
  spear: { sw: 16, kind: 'pole', angle: -78, draw: (INK, s = 1) => { const L = 600 * s;
    return shaft(-L * .32, L * .62, 16 * s, INK) + `<path d="M${f(L * .62)},${f(-16 * s)} Q${f(L * .62 + 70 * s)},${f(-14 * s)} ${f(L * .62 + 112 * s)},0 Q${f(L * .62 + 70 * s)},${f(14 * s)} ${f(L * .62)},${f(16 * s)} Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + `<path d="M${f(L * .62 + 8 * s)},0 L${f(L * .62 + 96 * s)},0" stroke="${STEELD}" stroke-width="2.5"/>` + steelGlint(L * .62 + 50 * s, -7 * s, 18 * s)
      + `<rect x="${f(L * .6 - 6 * s)}" y="${f(-11 * s)}" width="${f(16 * s)}" height="${f(22 * s)}" rx="3" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M${f(L * .6)},${f(8 * s)} q-6,${f(40 * s)} -16,${f(62 * s)} M${f(L * .6 + 6 * s)},${f(8 * s)} q2,${f(40 * s)} -2,${f(66 * s)}" stroke="${RED}" stroke-width="${f(9 * s)}" stroke-linecap="round" fill="none"/>`; } },
  staff: { sw: 15, kind: 'pole', angle: -84, draw: (INK, s = 1) => shaft(-300 * s, 280 * s, 15 * s, INK) + `<circle cx="${f(286 * s)}" cy="0" r="${f(13 * s)}" fill="${WOODD}" stroke="${INK}" stroke-width="5"/>` },
  pointer: { sw: 7, kind: 'pole', angle: -12, draw: (INK, s = 1) => shaft(-40 * s, 330 * s, 7 * s, INK, WOODL) + `<circle cx="${f(334 * s)}" cy="0" r="${f(7 * s)}" fill="${RED}" stroke="${INK}" stroke-width="3.5"/>` },
  broom: { sw: 12, kind: 'pole', angle: 104, draw: (INK, s = 1) => { const e = 330 * s;
    return shaft(-190 * s, e, 12 * s, INK) + `<path d="M${f(e - 6)},${f(-14 * s)} L${f(e + 26 * s)},${f(-20 * s)} L${f(e + 26 * s)},${f(20 * s)} L${f(e - 6)},${f(14 * s)} Z" fill="${RED}" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M${f(e + 24 * s)},${f(-22 * s)} L${f(e + 150 * s)},${f(-62 * s)} L${f(e + 150 * s)},${f(62 * s)} L${f(e + 24 * s)},${f(22 * s)} Z" fill="#e6c36a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + [-44, -26, -9, 9, 26, 44].map(y => line(e + 40 * s, y * s * .45, e + 146 * s, y * s, '#b48d36', 2.2)).join(''); } },
  shovel: { sw: 12, kind: 'pole', angle: 100, draw: (INK, s = 1) => { const e = 300 * s;
    return shaft(-170 * s, e, 12 * s, INK) + `<path d="M${f(e)},${f(-26 * s)} L${f(e + 40 * s)},${f(-34 * s)} Q${f(e + 140 * s)},${f(-40 * s)} ${f(e + 170 * s)},0 Q${f(e + 140 * s)},${f(40 * s)} ${f(e + 40 * s)},${f(34 * s)} L${f(e)},${f(26 * s)} Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + `<path d="M${f(e + 30 * s)},0 L${f(e + 130 * s)},0" stroke="${STEELD}" stroke-width="3"/>` + steelGlint(e + 90 * s, -18 * s, 22 * s)
      + `<path d="M${f(-170 * s)},${f(-22 * s)} L${f(-210 * s)},${f(-22 * s)} L${f(-210 * s)},${f(22 * s)} L${f(-170 * s)},${f(22 * s)}" fill="none" stroke="${INK}" stroke-width="${f(15 * s)}" stroke-linejoin="round"/>`; } },
  sword: { sw: 16, kind: 'pole', angle: -70, draw: (INK, s = 1) =>
      line(-34 * s, 0, 34 * s, 0, INK, 23 * s) + line(-34 * s, 0, 34 * s, 0, '#5a3a24', 16 * s) + `<circle cx="${f(-40 * s)}" cy="0" r="${f(12 * s)}" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M${f(34 * s)},${f(-40 * s)} L${f(50 * s)},${f(-40 * s)} L${f(50 * s)},${f(40 * s)} L${f(34 * s)},${f(40 * s)} Z" fill="${GOLD}" stroke="${INK}" stroke-width="4.5"/>`
      + `<path d="M${f(50 * s)},${f(-15 * s)} L${f(330 * s)},${f(-11 * s)} L${f(372 * s)},0 L${f(330 * s)},${f(11 * s)} L${f(50 * s)},${f(15 * s)} Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + line(60 * s, 0, 330 * s, 0, STEELD, 2.5) + steelGlint(200 * s, -7 * s, 40 * s) },
  hammer: { sw: 15, kind: 'pole', angle: -60, draw: (INK, s = 1) => shaft(-46 * s, 190 * s, 15 * s, INK)
      + `<rect x="${f(170 * s)}" y="${f(-52 * s)}" width="${f(54 * s)}" height="${f(104 * s)}" rx="${f(8 * s)}" fill="${STEELD}" stroke="${INK}" stroke-width="5"/><rect x="${f(176 * s)}" y="${f(-46 * s)}" width="${f(14 * s)}" height="${f(92 * s)}" rx="4" fill="#fff" opacity=".35"/>` },
  torch: { sw: 16, kind: 'pole', angle: -80, draw: (INK, s = 1) => shaft(-50 * s, 170 * s, 16 * s, INK)
      + `<path d="M${f(160 * s)},${f(-22 * s)} L${f(196 * s)},${f(-26 * s)} L${f(196 * s)},${f(26 * s)} L${f(160 * s)},${f(22 * s)} Z" fill="#5a3a24" stroke="${INK}" stroke-width="4"/>`
      + `<path d="M${f(196 * s)},${f(-26 * s)} Q${f(250 * s)},${f(-40 * s)} ${f(300 * s)},0 Q${f(250 * s)},${f(40 * s)} ${f(196 * s)},${f(26 * s)} Z" fill="#ffb33a"/><path d="M${f(198 * s)},${f(-13 * s)} Q${f(236 * s)},${f(-18 * s)} ${f(264 * s)},0 Q${f(236 * s)},${f(18 * s)} ${f(198 * s)},${f(13 * s)} Z" fill="#fff3b0"/>` },
  handles: { sw: 13, kind: 'pole', angle: 20, draw: (INK, s = 1) => shaft(-40 * s, 300 * s, 13 * s, INK) },   // one cart / wheelbarrow handle: the fist round its end, the handle runs on into the cart
  pole: { sw: 15, kind: 'shoulder', angle: 0, draw: (INK, s = 1) => shaft(-420 * s, 420 * s, 15 * s, INK) },
  lantern: { kind: 'hang', draw: (INK, s = 1) => `<path d="M${f(-15 * s)},${f(4 * s)} Q0,${f(-20 * s)} ${f(15 * s)},${f(4 * s)}" fill="none" stroke="${INK}" stroke-width="${f(6 * s)}"/>`
      + `<path d="M${f(-22 * s)},${f(14 * s)} L${f(22 * s)},${f(14 * s)} L${f(30 * s)},${f(28 * s)} L${f(-30 * s)},${f(28 * s)} Z" fill="#3a3a44" stroke="${INK}" stroke-width="4"/>`
      + `<rect x="${f(-28 * s)}" y="${f(28 * s)}" width="${f(56 * s)}" height="${f(78 * s)}" rx="${f(6 * s)}" fill="#ffd25a" stroke="${INK}" stroke-width="5"/><rect x="${f(-14 * s)}" y="${f(38 * s)}" width="${f(28 * s)}" height="${f(58 * s)}" rx="${f(10 * s)}" fill="#fff6c8"/>`
      + line(-28 * s, 67 * s, 28 * s, 67 * s, '#3a3a44', 4) + `<path d="M${f(-34 * s)},${f(106 * s)} L${f(34 * s)},${f(106 * s)} L${f(26 * s)},${f(120 * s)} L${f(-26 * s)},${f(120 * s)} Z" fill="#3a3a44" stroke="${INK}" stroke-width="4"/>` },
  bucket: { kind: 'hang', draw: (INK, s = 1) => `<path d="M${f(-52 * s)},${f(70 * s)} Q0,${f(-30 * s)} ${f(52 * s)},${f(70 * s)}" fill="none" stroke="${INK}" stroke-width="${f(6 * s)}"/>`
      + `<path d="M${f(-60 * s)},${f(66 * s)} L${f(60 * s)},${f(66 * s)} L${f(48 * s)},${f(170 * s)} L${f(-48 * s)},${f(170 * s)} Z" fill="${WOOD}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + [92, 146].map(y => line(-58 * s + (y - 66) * .1 * s, y * s, 58 * s - (y - 66) * .1 * s, y * s, STEELD, 7 * s, 'butt')).join('') + [-26, 4, 32].map(x => line(x * s, 70 * s, x * s * .82, 166 * s, WOODD, 2, 'round', ' opacity=".6"')).join('') },
  bag: { kind: 'hang', draw: (INK, s = 1) => `<path d="M${f(-14 * s)},${f(10 * s)} L${f(14 * s)},${f(10 * s)} L${f(18 * s)},${f(26 * s)} Q${f(72 * s)},${f(50 * s)} ${f(62 * s)},${f(112 * s)} Q${f(50 * s)},${f(146 * s)} 0,${f(146 * s)} Q${f(-50 * s)},${f(146 * s)} ${f(-62 * s)},${f(112 * s)} Q${f(-72 * s)},${f(50 * s)} ${f(-18 * s)},${f(26 * s)} Z" fill="#c9a36a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
      + line(-20 * s, 24 * s, 20 * s, 24 * s, '#7a5a2a', 6 * s) + `<text x="0" y="${f(112 * s)}" font-family="Georgia,serif" font-weight="bold" font-size="${f(50 * s)}" text-anchor="middle" fill="#2f6b2f">$</text>` + `<path d="M${f(-40 * s)},${f(70 * s)} q-8,20 -4,40" stroke="#fff" stroke-width="5" opacity=".4" fill="none" stroke-linecap="round"/>` },
  sign: { kind: 'edge', w: 230, h: 160, draw: (INK, s = 1, o = {}) => { const w = (o.w || 230) * s, h = (o.h || 160) * s;
    return `<rect x="${f(-w / 2)}" y="${f(-h)}" width="${f(w)}" height="${f(h)}" rx="${f(6 * s)}" fill="#f1e2bf" stroke="${INK}" stroke-width="5"/>`
      + [.25, .45, .65].map(k => line(-w * .36, -h * (1 - k), w * .36, -h * (1 - k), '#b9a37a', 3)).join('') + (o.text ? `<text x="0" y="${f(-h * .55)}" font-family="Georgia,serif" font-weight="bold" font-size="${f(h * .24)}" text-anchor="middle" fill="${INK}">${o.text}</text>` : '')
      + line(-w / 2 + 8, -h + 8, w / 2 - 30, -h + 8, '#fff', 4, 'round', ' opacity=".55"'); } },
  box: { kind: 'edge', w: 210, h: 150, draw: (INK, s = 1, o = {}) => { const w = (o.w || 210) * s, h = (o.h || 150) * s;
    return `<rect x="${f(-w / 2)}" y="${f(-h * .62)}" width="${f(w)}" height="${f(h)}" rx="${f(8 * s)}" fill="${WOOD}" stroke="${INK}" stroke-width="5"/>`
      + `<path d="M${f(-w / 2)},${f(-h * .62 + h * .3)} L${f(w / 2)},${f(-h * .62 + h * .3)}" stroke="${INK}" stroke-width="4"/>` + [-.5, .5].map(k => `<rect x="${f(k * w - (k < 0 ? 0 : 18 * s))}" y="${f(-h * .62)}" width="${f(18 * s)}" height="${f(h)}" fill="${STEELD}" stroke="${INK}" stroke-width="3"/>`).join('')
      + `<rect x="${f(-12 * s)}" y="${f(-h * .62 + h * .26)}" width="${f(24 * s)}" height="${f(30 * s)}" rx="3" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>` + [-.25, 0, .25].map(k => line(k * w - 30, -h * .62 + h * .55, k * w + 20, -h * .62 + h * .55, WOODD, 2, 'round', ' opacity=".7"')).join('')
      + line(-w / 2 + 12, -h * .62 + 8, w / 2 - 40, -h * .62 + 8, '#fff', 4, 'round', ' opacity=".45"'); } },
  scroll: { sw: 28, kind: 'pole', angle: 0, draw: (INK, s = 1) => `<rect x="${f(10 * s)}" y="${f(-44 * s)}" width="${f(170 * s)}" height="${f(88 * s)}" fill="#f3e6c4" stroke="${INK}" stroke-width="5"/>`
      + [-18, 0, 18].map(y => line(34 * s, y * s, 150 * s, y * s, '#b9a37a', 3)).join('') + `<rect x="${f(-14 * s)}" y="${f(-52 * s)}" width="${f(28 * s)}" height="${f(104 * s)}" rx="${f(12 * s)}" fill="#e7d3a2" stroke="${INK}" stroke-width="5"/><rect x="${f(170 * s)}" y="${f(-52 * s)}" width="${f(26 * s)}" height="${f(104 * s)}" rx="${f(12 * s)}" fill="#e7d3a2" stroke="${INK}" stroke-width="5"/>` },
  shield: { kind: 'behind', hand: 'L', back: (INK, s = 1, o = {}) => { const r = (o.r || 118) * s;   // the inside: wooden planks, the gold rim, a leather strap across
    return `<circle cx="0" cy="0" r="${f(r)}" fill="${GOLD}" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="0" r="${f(r * .86)}" fill="#a8743f" stroke="${INK}" stroke-width="4"/>`
      + [-.5, -.17, .17, .5].map(k => `<path d="M${f(k * r)},${f(-Math.sqrt(1 - k * k) * r * .86)} V${f(Math.sqrt(1 - k * k) * r * .86)}" stroke="#7a512a" stroke-width="4"/>`).join('')
      + `<rect x="${f(-r * .62)}" y="${f(-r * .1)}" width="${f(r * 1.24)}" height="${f(r * .2)}" rx="${f(r * .08)}" fill="#5a3a22" stroke="${INK}" stroke-width="4"/><path d="M${f(-r * .6)},${f(-r * .55)} Q${f(-r * .2)},${f(-r * .8)} ${f(r * .2)},${f(-r * .78)}" stroke="#fff" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>`; },
    draw: (INK, s = 1, o = {}) => { const r = (o.r || 118) * s, c = o.col || '#2f8f88';
    return `<circle cx="0" cy="0" r="${f(r)}" fill="${GOLD}" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="0" r="${f(r * .84)}" fill="${c}" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="0" r="${f(r * .6)}" fill="${STEEL}" stroke="${INK}" stroke-width="4"/>`
      + Array.from({ length: 12 }, (_, i) => { const a = i * 30 * D; return `<circle cx="${f(Math.cos(a) * r * .92)}" cy="${f(Math.sin(a) * r * .92)}" r="${f(4 * s)}" fill="${GOLDD}"/>`; }).join('')
      + `<circle cx="0" cy="0" r="${f(r * .24)}" fill="#e9edf4" stroke="${INK}" stroke-width="4"/><path d="M${f(-r * .5)},${f(-r * .3)} Q${f(-r * .3)},${f(-r * .58)} ${f(0)},${f(-r * .6)}" stroke="#fff" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>`; } },
};

// A fist closed ROUND an object: Rick's round black fist + finger creases on the knuckle side, across the shaft, + the thumb lobe over the shaft.
// (x,y) fist centre, r radius, ax = shaft direction (deg), kn = the knuckle side (+1/-1 normal to the shaft, away from the forearm).
export function wrapFist(x, y, r, ax, kn = 1, INK = INK0) {
  const a = ax * D, ux = Math.cos(a), uy = Math.sin(a), nx = -uy * kn, ny = ux * kn, CR = '#594852';
  const P = (u, n) => [x + ux * u + nx * n, y + uy * u + ny * n];
  const crease = u => { const p0 = P(u, r * .12), p1 = P(u * 1.06, r * .9); return `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="${CR}" stroke-width="${f(Math.max(2, r * .1))}" stroke-linecap="round"/>`; };
  const th = P(r * .55, -r * .55), hi = P(-r * .35, -r * .5);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${INK}"/>`
    + `<circle cx="${f(th[0])}" cy="${f(th[1])}" r="${f(r * .5)}" fill="${INK}"/>`                    // the thumb comes over the shaft on the arm side
    + [-r * .42, 0, r * .42].map(crease).join('')                                                       // three creases = four fingers round the shaft
    + `<path d="M${f(P(-r * .5, -r * .62)[0])},${f(P(-r * .5, -r * .62)[1])} Q${f(hi[0] - nx * r * .2)},${f(hi[1] - ny * r * .2)} ${f(P(r * .05, -r * .78)[0])},${f(P(r * .05, -r * .78)[1])}" stroke="#fff" stroke-width="${f(r * .13)}" stroke-linecap="round" fill="none" opacity=".22"/>`;   // soft shine
}

// CLOSE-UP HAND (Rick's drill macro): a real black glove hand wrapped round a handle of width w along direction ax.
// Palm and finger roots behind the handle, four fingers crossing over it with knuckle creases, thumb along the top. Size r = palm half width.
export function realHand(x, y, ax, w, r, INK = INK0, kn = 1, arm = null) {
  const a = ax * D, ux = Math.cos(a), uy = Math.sin(a), nx = -uy * kn, ny = ux * kn, P = (u, n) => [x + ux * u + nx * n, y + uy * u + ny * n];
  const blob = (pts, fill = '#26242c') => { const d = `M${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L')} Z`; return `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${f(r * .62)}" stroke-linejoin="round"/><path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="${f(r * .48)}" stroke-linejoin="round"/>`; };   // soft round palm corners
  const capsule = (u0, n0, u1, n1, wd, fill = '#2b2932') => { const p0 = P(u0, n0), p1 = P(u1, n1); return `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="${INK}" stroke-width="${f(wd + r * .12)}" stroke-linecap="round"/><path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="${fill}" stroke-width="${f(wd)}" stroke-linecap="round"/>`; };
  const under = blob([P(-r * .78, -w * .5), P(r * .78, -w * .5), P(r * .8, -w * .5 - r * 1.05), P(-r * .7, -w * .5 - r * 1.15)])   // back of the hand and wrist behind the handle
    + (() => { const c = P(0, -w * .5 - r * .75), dx = arm ? arm[0] - c[0] : -nx, dy = arm ? arm[1] - c[1] : -ny, l = Math.hypot(dx, dy) || 1, e = [c[0] + dx / l * r * 1.9, c[1] + dy / l * r * 1.9];
        return `<path d="M${f(c[0])},${f(c[1])} L${f(e[0])},${f(e[1])}" stroke="${INK}" stroke-width="${f(r * 1.15)}" stroke-linecap="round"/><path d="M${f(c[0])},${f(c[1])} L${f(e[0])},${f(e[1])}" stroke="#26242c" stroke-width="${f(r * 1.0)}" stroke-linecap="round"/>`; })();   // wrist toward the forearm
  const fw = r * .46, us = [-r * .72, -r * .24, r * .24, r * .72];
  const over = us.map((u, i) => capsule(u, -w * .45, u + r * .04, w * .55 + (i === 0 || i === 3 ? -r * .02 : r * .06), fw)).join('')   // four fingers curl over the front of the handle
    + us.map(u => { const p = P(u, w * .05), q = P(u + fw * .36, w * .05); return `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])}" stroke="#5f5a68" stroke-width="${f(r * .06)}" stroke-linecap="round"/>`; }).join('')   // knuckle creases
    + capsule(r * .95, -w * .35, r * 1.5, -w * .05, r * .44)                                                             // thumb laid along the handle, over it
    + us.map(u => { const p = P(u - fw * .2, -w * .3), q = P(u - fw * .2, w * .3); return `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])}" stroke="#fff" stroke-width="${f(r * .07)}" stroke-linecap="round" opacity=".22"/>`; }).join('');   // shine on each finger
  return { under, over };
}

// grip(spec, hands, env) -> { under: [svg], over: [svg], back: [svg] }
//  spec: { obj, kind?, angle?, at?, scale?, flip?, w, h, text, r, col, real? }   hands: [[x, y], ...] (1 or 2 fists, rig px)   env: { INK, r (fist radius), dir (+1/-1 screen side the object points to), arm: [[sx, sy] per hand], view }
//  under = drawn before the fists of the arms (the object), over = drawn after (the fists closed round it, or the object itself for 'behind').
export function grip(spec, hands, env) {
  const O = GRIP_OBJECTS[spec.obj] || GRIP_OBJECTS.staff, INK = env.INK || INK0, r = env.r ?? 24, s = spec.scale || 1, kind = spec.kind || O.kind, d = env.dir || 1;
  const out = { under: [], over: [], back: [] };
  const fist = (h, ax, i) => { const sh = env.arm && env.arm[i]; let kn = 1; if (sh) { const a = ax * D, nx = -Math.sin(a), ny = Math.cos(a); kn = ((h[0] - sh[0]) * nx + (h[1] - sh[1]) * ny) >= 0 ? 1 : -1; } return spec.real ? null : wrapFist(h[0], h[1], r, ax, kn, INK); };
  const mirrorAng = a => d < 0 ? 180 - a : a;
  if (kind === 'hang') {                                 // the load hangs straight down from the fist, whatever the arm does
    const h = hands[0]; out.under.push(`<g transform="translate(${f(h[0])},${f(h[1] - r * .2)})">${O.draw(INK, s, spec)}</g>`);
    out.over.push(wrapFist(h[0], h[1], r, 0, 1, INK)); return out;
  }
  if (kind === 'behind') {                               // shield / board between hand and lens: the object covers the fist
    const h = hands[0], ox = h[0] + d * (spec.dx ?? 18), oy = h[1] + (spec.dy ?? -10);
    if (env.view === 'back' && O.back) {                 // seen from behind (CB 2026-11-13 "logic"): the INSIDE of the shield, the fist on its strap
      out.under.push(`<g transform="translate(${f(ox)},${f(oy)})">${O.back(INK, s, spec)}</g>`); out.over.push(wrapFist(h[0], h[1], r, 90, 1, INK)); return out; }
    out.over.push(`<g transform="translate(${f(ox)},${f(oy)})">${O.draw(INK, s, spec)}</g>`); return out;
  }
  if (kind === 'edge') {                                 // flat thing held in front with both fists on its front face, half over the side / bottom edge
    const [a, b] = hands.length > 1 ? hands : [hands[0], [hands[0][0] + 160, hands[0][1]]];
    const cx = (a[0] + b[0]) / 2, w = Math.max((spec.w || O.w || 220), Math.abs(b[0] - a[0]) + r * 1.2) / s, bottom = Math.max(a[1], b[1]) + r * (spec.obj === 'box' ? -0.4 : 0.35);
    out.under.push(`<g transform="translate(${f(cx)},${f(bottom)})">${O.draw(INK, s, { ...spec, w })}</g>`);
    for (const [i, h] of [a, b].entries()) out.over.push(wrapFist(h[0], h[1], r, 90, i ? 1 : -1, INK));
    return out;
  }
  // POLE / SHOULDER: one straight shaft through every fist
  let ax, o;
  if (hands.length > 1) { const [a, b] = hands; ax = Math.atan2(b[1] - a[1], b[0] - a[0]) / D; if (spec.flip) ax += 180; o = spec.flip ? b : a; }
  else { ax = spec.angle != null ? mirrorAng(spec.angle) : mirrorAng(O.angle ?? -80); o = hands[0]; }
  const at = (spec.at || 0) * s;                         // slide the object along its axis (+ = toward its head)
  const g = `<g transform="translate(${f(o[0])},${f(o[1])}) rotate(${f(ax)}) translate(${f(-at)},0)">${O.draw(INK, s, spec)}</g>`;
  if (spec.old) { out.over.push(g); return out; }   // the OLD way, kept only for before/after sheets: the thing pasted over the hand, the fist hidden under it
  (env.view === 'back' ? out.back : out.under).push(g);
  if (env.view !== 'back') hands.forEach((h, i) => { const fs = fist(h, ax, i); if (fs) out.over.push(fs); });
  if (spec.real) hands.forEach((h, i) => { const sh = env.arm && env.arm[i], a = ax * D, kn = sh ? (((h[0] - sh[0]) * -Math.sin(a) + (h[1] - sh[1]) * Math.cos(a)) >= 0 ? 1 : -1) : 1, R = realHand(h[0], h[1], ax, (spec.w || O.sw || 14) * s, r * 1.1, INK, kn, sh); out.under.unshift(R.under); out.over.push(R.over); });
  return out;
}

// MOTION LIBRARY HOOK: a held entry { hand, svg, wrap?, grip?, hands? } -> svg. H = the move's arms ({ hand, sh? } per hand, sh optional), r = fist radius.
//  wrap: <deg>  the tool's handle direction at the hand: the move's own svg is drawn, then the fist closes ROUND it (creases + thumb on top)
//  grip: { obj, kind, angle, ... }  a library object from GRIP_OBJECTS instead of svg; hands: [0, 1] = one shaft through both fists
export function heldSvg(h, H, r, INK = INK0) {
  const p = H[h.hand].hand, sh = H[h.hand].sh || null;
  if (h.grip) { const pts = (h.hands || [h.hand]).map(i => H[i].hand), g = grip(h.grip, pts, { INK, r, dir: h.grip.dir || 1, arm: (h.hands || [h.hand]).map(i => H[i].sh || null) }); return [...g.back, ...g.under, ...g.over].join(''); }
  const base = h.svg ? h.svg(p[0], p[1]) : '';
  if (h.wrap == null) return base;
  const a = h.wrap * D, kn = sh ? (((p[0] - sh[0]) * -Math.sin(a) + (p[1] - sh[1]) * Math.cos(a)) >= 0 ? 1 : -1) : 1;
  return base + wrapFist(p[0], p[1], r, h.wrap, kn, INK);
}

grip.objects = GRIP_OBJECTS;   // poses.mjs reads each object's default hand (shield: 'L') and kind
