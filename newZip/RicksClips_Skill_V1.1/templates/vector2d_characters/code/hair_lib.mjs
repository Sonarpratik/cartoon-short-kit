// HAIR LIBRARY v1 (CB 2026-11-12 02:33 Bangkok: "create more hair styles they can later also have head pcs or accessoires sitting on")
// Built from Rick's hair grammar (reference board: cart army, memory shop, pink prison, cashier, horse race):
//  - hair is a CAP that hugs the head, thick ink outline like the head, ends at the brow line, never covers the eyes
//  - three hard tones (light crown band, base, dark underside) + dark strand lines that follow the flow + one light streak on the lit side
//  - ONE shape break in the silhouette (cowlick, spikes, bun, quiff, curls) so the head reads at 1/8 size
//  - under a helmet or hat the hair still shows at the sides and back (Rick's cart soldiers)
// Views follow VIEW_RULES 3-5 and 18-19: 3/4 = the front hair unchanged; side = hair round the BACK of the head along the head's own edge;
// back = the head fully covered; same colour, length and amount in every view.
//
// Use:  import { withHair, HAIR_STYLES } from './hair_lib.mjs';
//       spec = withHair({ name:'curie', form:'lady', coat:'#2b2b33', face:'standard' }, 'gibson', { col:'#5a3a26', pieces:['barrette'], hat:null })
//       withHair fills spec.headBack (long hair behind the head) and spec.hat (front hair, then head pieces, then the hat on top).
//       pieces: names from PIECES (flower, bow, headband, barrette, tiara, laurel, sticks, pencil, goggles, shades) or functions (P) -> svg[]
//       hat:    a name from HATS (helmet, flatcap, beret, tophat, straw) or a function (H, P) -> svg[]; with a hat the hair is pressed flat
//               under it and only the sides, back and fringe show.
// Head space: centre (cx, hy), radius 100 (the rig scales it, strokes are auto-thinned).
import { INK, shade, tint, sampleSmooth, brush, HEADS } from './char2d.mjs';

const f = v => (+v).toFixed(1);
const rad = d => d * Math.PI / 180;
let UID = 0;
const P = (d, fill, sw = 6, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const L = (d, sw = 3.4, col = INK, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;
const ring = (x, y, r, fill, sw = 5) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const ell = (x, y, rx, ry, fill, sw = 5, rot = 0) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const poly = pts => 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L') + ' Z';
const open = pts => 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');

// the head's own edge (same formula as char2d headPts), at any angle, R = 100, offset from the centre
export function headEdge(a, shape = 'rick') {
  const H = typeof shape === 'string' ? HEADS[shape] : shape, tl = H.tilt * Math.PI / 180, sa = Math.sin(a);
  let r = 1 + H.egg * sa; for (const [h, amt, ph] of H.lumps) r += amt * Math.sin(h * a + ph);
  const x = Math.cos(a) * r * H.aspect, y = sa * r * .97 - H.egg * .35;
  return [(x * Math.cos(tl) - y * Math.sin(tl)) * 100, (x * Math.sin(tl) + y * Math.cos(tl)) * 100];
}
const edge = (a, push = 0, shape) => { const [x, y] = headEdge(a, shape), l = Math.hypot(x, y); return [x + x / l * push, y + y / l * push]; };

// three hard tones, like the template's hairFill
function tones(col, y0, y1, lite = .2, dark = .82) {   // CB 2026-11-12 02:50: soft shading like Rick, not hard bands: light crown -> base -> a little darker low
  const id = 'hl' + (UID++), lt = tint(col, lite), dk = shade(col, .66, 1), lo = shade(col, dark, 1);
  return { id, def: `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y0)}" x2="0" y2="${f(y1)}"><stop offset="0" stop-color="${lt}"/><stop offset=".42" stop-color="${col}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>`, lt, dk };
}
const BLUR = () => { const id = 'hb' + (UID++); return { id, def: `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>` }; };
const OUT = 9.5, IN = 7.5;   // CB 2026-11-12 02:50: "all have little thicker outer hair line" (head ink is about 7.8 in head space)

// ---------------- the cap: outer edge (volume + texture) and inner edge (hairline) per view ----------------
function volAt(st, a) {   // a in radians, y-down; top = -90 deg
  const t = Math.max(0, -Math.sin(a)), p = st.p ?? 1.4;
  return (st.side + (st.top - st.side) * Math.pow(t, p)) * (1 + (st.sweep || 0) * Math.cos(a));
}
function texture(st, u, a) {   // u = 0..1 along the arc
  const e = st.edge || { type: 'smooth' };
  if (e.type === 'spiky') { const s = (u * e.n + (e.ph || 0)) % 1, k = 1 - Math.abs(2 * s - 1); return e.len * Math.pow(k, e.sharp ?? 2.2) * (e.topOnly ? Math.max(0, -Math.sin(a)) : 1); }
  if (e.type === 'wavy') return e.len * Math.sin(u * e.n * Math.PI * 2);
  if (e.type === 'shaggy') { const s = (u * e.n) % 1, k = 1 - Math.abs(2 * s - 1), j = .6 + .4 * Math.sin(u * 37 + 1.3); return e.len * Math.pow(k, 1.6) * j; }
  return 0;
}
function outerPts(st, a0, a1, shape, n = 90, extraPush = 0) {
  const pts = [], e = st.edge || {}, N = e.type === 'spiky' || e.type === 'shaggy' ? Math.max(n, e.n * 10) : n;
  for (let k = 0; k <= N; k++) { const u = k / N, a = a0 + (a1 - a0) * u; pts.push(edge(a, volAt(st, a) + texture(st, u, a) + extraPush, shape)); }
  if (st.flatY != null) for (const p of pts) p[1] = Math.max(p[1], st.flatY);   // flat-top: cut level
  return pts;
}
// curls: circles along the outer edge (cloud outline)
function curlRing(st, a0, a1, shape) {
  const e = st.edge, cs = [];
  for (let k = 0; k <= e.n; k++) { const a = a0 + (a1 - a0) * k / e.n, [x, y] = edge(a, volAt(st, a) - e.r * .45, shape); cs.push([x, y, e.r * (k % 2 ? .88 : 1)]); }
  return cs;
}

// front hairline (right -> left). st.fr = y at x = 60, 30, 0, -30, -60; st.sideIn = x of the hairline at the temples; st.sideLow = y where the side hair ends
function frontInner(st, shape) {
  const d = st.drop ?? 12, tR = edge(rad(d), -1, shape), tL = edge(rad(180 - d), -1, shape), si = st.sideIn ?? 84, sl = st.sideLow ?? tR[1] - 4, fr = st.fr || [-50, -58, -62, -58, -50];
  return [tR, [si + 2, sl], [si - 4, Math.min(sl - 28, -18)], [60, fr[0]], [30, fr[1]], [0, fr[2]], [-30, fr[3]], [-60, fr[4]], [-(si - 4), Math.min(sl - 28, -18)], [-(si + 2), sl], tL];
}
// side hairline (facing +x): nape on the head edge, behind the ear, up to the temple, the forehead hairline at the front
function sideInner(st, shape) {
  const S = st.sd || {}, aN = rad(S.nape ?? 128), aF = rad(S.front ?? -40), nape = edge(aN, -1, shape), fr = edge(aF, -1, shape);
  const ny = S.napeY ?? 50, hl = S.hairY ?? -54;   // Rick profile: hair over the whole top and the back half; the line runs back along the forehead, down in front of the ear, then to the nape
  return S.inner ? [nape, ...S.inner, fr] : [nape, [-60, ny], [-30, ny - 14], [-16, ny - 40], [-12, -24], [6, hl + 4], [fr[0] * .7, hl - 2], fr];
}
function backInner(st, shape) {
  const bd = st.bd ?? 34, ny = st.napeY ?? 62;
  return [edge(rad(bd), -1, shape), [52, ny - 4], [0, ny + 4], [-52, ny - 4], edge(rad(180 - bd), -1, shape)];
}

// one cap for a view, in local coords (centre 0,0, facing +x in side view)
function capShape(st, view, shape) {
  const d = st.drop ?? 12, bd = st.bd ?? 34, S = st.sd || {};
  let a0, a1, inner;
  if (view === 'side') { a0 = rad(S.front ?? -40); a1 = rad(-360 + (S.nape ?? 128)); inner = sideInner(st, shape); }
  else if (view === 'back') { a0 = rad(180 - bd); a1 = rad(360 + bd); inner = backInner(st, shape); }
  else { a0 = rad(180 - d); a1 = rad(360 + d); inner = frontInner(st, shape); }
  const outer = outerPts(st, a0, a1, shape);
  const innerD = sampleSmooth(inner.slice().reverse().reverse(), false, 10);
  // outer runs a0 -> a1; the inner line must run back from the a1 end to the a0 end
  const inPts = innerD;
  return { outer, inner: inPts, a0, a1 };
}

// ---------------- strands and highlights ----------------
// Rick hair shading (measured on his close-ups: Kyle the cashier, the pink-cell guard, the memory-shop ginger, the cashier lady):
//  soft lighter crown, a soft darker band just inside the hairline, 2-3 long thin LIGHT streaks that follow the head's curve on the lit side,
//  one thin near-white reflection line along the top, a few thin tapered dark strand lines, curls = light c-arcs on each curl.
function arcAt(st, a0, a1, inset, shape, n = 3) { const pts = []; for (let k = 0; k < n; k++) { const a = rad(a0 + (a1 - a0) * k / (n - 1)); pts.push(edge(a, volAt(st, a) - inset, shape)); } return pts; }
function streak(st, A, inset, w, col, shape) { const [p0, pm, p1] = arcAt(st, A[0], A[1], inset, shape); const qx = 2 * pm[0] - (p0[0] + p1[0]) / 2, qy = 2 * pm[1] - (p0[1] + p1[1]) / 2; return brush(p0[0], p0[1], qx, qy, p1[0], p1[1], w, { col, tip: .12 }); }
function shading(st, view, cap, T, shape) {
  const o = [], bl = BLUR(), deep = shade(T.col, .6, 1), hi = tint(T.col, .42), hi2 = tint(T.col, .3), ref = tint(T.col, .72);
  o.push(bl.def, `<path d="${open(cap.inner)}" fill="none" stroke="${deep}" stroke-width="26" stroke-opacity=".55" filter="url(#${bl.id})"/>`);   // soft dark band inside the hairline
  if (st.buzz) { for (let k = 4; k < cap.outer.length - 4; k += 3) { const [x, y] = cap.outer[k], q = .84 + .08 * ((k * 7) % 3); o.push(`<circle cx="${f(x * q)}" cy="${f(y * q)}" r="2" fill="${T.dk}" opacity=".7"/>`); } }
  if (st.rows) {   // cornrows: braided rows flat on the scalp, from the hairline back over the crown
    const n = 7; for (let k = 0; k < n; k++) { const u = (k + .5) / n, x0 = view === 'side' ? 60 - u * 20 : -80 + u * 160, y0 = view === 'side' ? -70 + u * 70 : -70 - Math.sin(u * Math.PI) * 8, x1 = view === 'side' ? -90 + u * 20 : (x0) * .3, y1 = view === 'side' ? -20 + u * 60 : view === 'back' ? 60 : -112;
      const xa = view === 'back' ? -80 + u * 160 : x0, ya = view === 'back' ? -100 : y0, xb = view === 'back' ? xa * 1.05 : x1;
      o.push(L(`M${f(xa)},${f(ya)} Q${f((xa + xb) / 2)},${f((ya + y1) / 2 - 20)} ${f(xb)},${f(y1)}`, 3.4, tint(T.col, .28)));
      for (let j = 1; j < 6; j++) { const t = j / 6, px = xa + (xb - xa) * t, py = ya + (y1 - ya) * t - Math.sin(t * Math.PI) * 10; o.push(L(`M${f(px - 5)},${f(py - 3)} l10,6`, 2.4, tint(T.col, .35))); } }
  }
  if (st.edge && st.edge.type === 'curly') return o;   // curls get their own light arcs
  const lit = view === 'side' ? [-58, -112] : [-168, -112], top = view === 'side' ? [-70, -150] : [-150, -78];
  if (!st.noShine) {
    o.push(streak(st, lit, 14, (st.shine ?? 7) * .9, hi, shape), streak(st, [lit[0] + (view === 'side' ? -6 : 8), lit[1] + (view === 'side' ? -14 : 14)], 30, 5.5, hi2, shape), streak(st, [lit[0] + (view === 'side' ? -12 : 16), lit[1] + (view === 'side' ? -22 : 24)], 46, 4.5, hi2, shape));
    o.push(streak(st, top, 8, 2.6, ref, shape));
  }
  const lines = st.lines ?? 3, n = cap.outer.length;   // a few thin dark strands, tapered
  if (!st.buzz) for (let k = 1; k <= Math.min(lines, 4); k++) { const i = Math.round(k / (Math.min(lines, 4) + 1) * (n - 1)), [x, y] = cap.outer[i]; if (view !== 'back' && y > 10) continue;
    const fl = (st.flow ?? 0) * 12; o.push(brush(x * .6 + fl, y * .6 - 6, x * .8 + fl * 1.4, y * .8, x * .95, y * .95, 3.2, { col: T.dk, tip: .1 })); }
  return o;
}
function curlArcs(cs, T) { return cs.map(([x, y, r], i) => i % 1 === 0 ? L(`M${f(x - r * .45)},${f(y + r * .15)} A${f(r * .5)},${f(r * .5)} 0 1,1 ${f(x + r * .35)},${f(y + r * .35)}`, 3.4, tint(T.col, .38)) : '').join(''); }
// spiky hair = separate overlapping locks, each with its own ink line, darker at the root, a light stripe toward the tip (Rick's ginger)
function locks(st, view, T, shape, a0, a1) {
  const e = st.edge, o = [], n = e.n, span = (a1 - a0), lean = rad(e.lean ?? 16) * (view === 'side' ? -1 : 1);
  const order = [...Array(n).keys()];
  for (const i of order) { const u = (i + .5) / n, a = a0 + span * (.12 + .76 * u); if (-Math.sin(a) < .25) continue;
    const w = Math.abs(span) / n * .62, len = e.len * (.75 + .35 * Math.sin(i * 2.3 + 1)), v = volAt(st, a);
    const b1 = edge(a - w, v - 16, shape), b2 = edge(a + w, v - 16, shape), tip = edge(a + lean, v + len, shape), c1 = edge(a - w * .1 + lean * .2, v + len * .5, shape), c2 = edge(a + w * .9 + lean * .7, v + len * .35, shape);
    const id = 'lk' + (UID++);
    o.push(`<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f((b1[0] + b2[0]) / 2)}" y1="${f((b1[1] + b2[1]) / 2)}" x2="${f(tip[0])}" y2="${f(tip[1])}"><stop offset="0" stop-color="${shade(T.col, .78, 1)}"/><stop offset=".6" stop-color="${T.col}"/><stop offset="1" stop-color="${tint(T.col, .16)}"/></linearGradient></defs>`);
    o.push(P(`M${f(b1[0])},${f(b1[1])} Q${f(c1[0])},${f(c1[1])} ${f(tip[0])},${f(tip[1])} Q${f(c2[0])},${f(c2[1])} ${f(b2[0])},${f(b2[1])} Z`, `url(#${id})`, IN));
    const m = edge(a + lean * .3, v + len * .2, shape), m2 = edge(a + lean * .8, v + len * .78, shape);
    o.push(brush(m[0], m[1], (m[0] + m2[0]) / 2, (m[1] + m2[1]) / 2, m2[0], m2[1], 5, { col: tint(T.col, .4), tip: .1 }));
  }
  return o;
}

// ---------------- the styles ----------------
// top/side = volume over the head; edge = silhouette texture; fr = fringe line; long = hair below the head; extra = buns, tufts, tails
// era = where the style belongs (CB: hair must match the character's era and time)
const BROWN = '#7a4a2e', DARK = '#3b2a22', BLACKH = '#2c2630', GINGER = '#d8692e', BLOND = '#e4b85a', GREY = '#c9c6d2', AUBURN = '#9a3f24', CHESTNUT = '#8a5232';
export const HAIR_STYLES = {
  // ---- men / anyone ----
  sidePart:   { label: 'Side part', era: '1940s-today: office, police, dad', col: BROWN, top: 16, side: 6, sweep: .15, fr: [-64, -76, -70, -58, -48], sideIn: 86, flow: -1,
                sd: { front: -50 }, extra: 'partLine' },
  cowlick:    { label: 'Bowl + cowlick', era: 'today: shop clerk, kid, nerd', col: CHESTNUT, top: 16, side: 8, fr: [-46, -50, -52, -50, -46], sideIn: 84, sideLow: 4, extra: 'cowlick', sd: { front: -40 } },
  spiky:      { label: 'Swept spikes', era: 'today: teen, rebel, hero', col: GINGER, top: 16, side: 6, sweep: .2, edge: { type: 'locks', n: 6, len: 40, lean: 18 }, fr: [-48, -56, -52, -46, -44], sideIn: 84, flow: 1, sd: { front: -45 } },
  curlyCrop:  { label: 'Short curls', era: 'any era: soldier, farmer, ancient', col: DARK, top: 12, side: 6, edge: { type: 'curly', n: 13, r: 15 }, fr: [-56, -62, -64, -62, -56], sideIn: 86 },
  slickBack:  { label: 'Slicked back', era: '1920s-50s: gangster, banker, film star', col: BLACKH, top: 12, side: 5, fr: [-70, -80, -84, -80, -70], sideIn: 86, lines: 7, shine: 10, flow: 0, sd: { front: -62 }, },
  buzz:       { label: 'Buzz cut', era: 'any: soldier, prisoner, athlete', col: '#5a4a40', top: 4, side: 2, buzz: true, fr: [-66, -72, -74, -72, -66], sideIn: 88, noShine: true },
  pompadour:  { label: 'Pompadour', era: '1950s: greaser, rock and roll', col: BLACKH, top: 34, side: 5, p: 3, sweep: -.15, fr: [-70, -78, -80, -78, -70], sideIn: 86, extra: 'quiff', shine: 9, sd: { front: -62 } },
  mohawk:     { label: 'Mohawk', era: '1980s punk', col: '#4a3a32', crestCol: '#d6337f', top: 2, side: 1, buzz: true, fr: [-70, -76, -78, -76, -70], sideIn: 88, noShine: true, extra: 'crest' },
  baldTufts:  { label: 'Bald + side tufts', era: 'any era: grandpa, professor, king', col: GREY, top: 0, side: 0, bald: true, extra: 'tufts' },
  combOver:   { label: 'Comb-over', era: '1970s-today: boss, banker, uncle', col: '#8b8178', top: 0, side: 0, bald: true, extra: 'combover' },
  afro:       { label: 'Afro', era: '1970s: disco, funk', col: '#2e221e', top: 58, side: 44, p: .9, edge: { type: 'curly', n: 20, r: 24 }, fr: [-50, -56, -58, -56, -50], sideIn: 88, sideLow: 30, drop: 22, bd: 40, sd: { front: -50, nape: 130 } },
  mullet:     { label: 'Mullet', era: '1980s: rock fan, trucker', col: '#9a6a3a', top: 14, side: 7, edge: { type: 'shaggy', n: 9, len: 14 }, fr: [-50, -58, -60, -56, -50], sideIn: 84, long: { len: 150, w: 78, hem: 'shaggy', sides: false } },
  topknot:    { label: 'Samurai topknot', era: 'old Japan: samurai, ronin', col: BLACKH, top: 6, side: 5, fr: [-86, -94, -96, -94, -86], sideIn: 86, sideLow: 10, shaved: true, extra: 'chonmage', sd: { front: -78 } },
  romanCurls: { label: 'Roman curls', era: 'ancient Rome and Greece: senator, philosopher', col: '#4a3326', top: 12, side: 7, edge: { type: 'curly', n: 15, r: 14 }, fr: [-52, -56, -58, -56, -52], sideIn: 86, extra: 'fringeCurls' },
  bowlCut:    { label: 'Bowl cut', era: 'medieval: page, monk, squire', col: '#a8743c', top: 14, side: 10, fr: [-44, -46, -46, -46, -44], sideIn: 80, sideLow: 20, drop: 20, lines: 9, sd: { front: -30, nape: 140, inner: [[-60, 40], [-40, 26], [-20, 0], [10, -30]] }, bd: 18, napeY: 36 },
  longWild:   { label: 'Long wild hair', era: 'barbarian, hermit, castaway, rock star', col: '#6b4a2a', top: 18, side: 10, edge: { type: 'shaggy', n: 11, len: 14 }, fr: [-52, -60, -64, -60, -52], sideIn: 84, long: { len: 210, w: 100, hem: 'shaggy' } },
  queue:      { label: 'Shaved front + long braid', era: 'Qing China 1644-1912', col: BLACKH, top: 6, side: 5, fr: [-88, -94, -96, -94, -88], sideIn: 88, shaved: true, extra: 'queue', sd: { front: -82 } },
  dreads:     { label: 'Locs', era: 'today; Caribbean, Africa', col: '#3a2a22', top: 16, side: 8, fr: [-54, -60, -62, -60, -54], sideIn: 84, edge: { type: 'wavy', n: 9, len: 4 }, extra: 'locs' },
  // ---- women / anyone ----
  gibson:     { label: 'Pinned-up 1900s updo', era: '1890s-1910s: Marie Curie, Victorian lady', col: '#5a3a26', top: 26, side: 18, p: 1.1, fr: [-62, -70, -72, -70, -62], sideIn: 86, sideLow: -6, extra: 'topBun', lines: 8 },
  lowBun:     { label: 'Neat low bun', era: '1930s-60s: nurse, teacher, librarian', col: '#6a4630', top: 14, side: 9, sweep: .1, fr: [-56, -66, -62, -54, -46], sideIn: 84, sideLow: 0, extra: 'lowBun' },
  longStraight:{ label: 'Long straight, middle part', era: '1970s-today', col: BLOND, top: 12, side: 8, fr: [-40, -58, -76, -58, -40], sideIn: 80, sideLow: 40, drop: 30, long: { len: 200, w: 96, hem: 'straight' }, sd: { front: -48 }, extra: 'centrePart' },
  ponytail:   { label: 'High ponytail', era: 'today: athlete, student, 1950s girl', col: '#8a4e2a', top: 14, side: 6, fr: [-58, -66, -70, -64, -56], sideIn: 86, extra: 'ponytail' },
  braids:     { label: 'Two braids', era: 'farm girl, pioneer, Dutch, Bavarian', col: BLOND, top: 13, side: 7, fr: [-48, -60, -74, -60, -48], sideIn: 84, sideLow: 10, extra: 'braids', sd: { front: -50 } },
  fingerWave: { label: 'Finger-wave bob', era: '1920s: flapper, jazz singer', col: BLACKH, top: 12, side: 12, edge: { type: 'wavy', n: 5, len: 3 }, fr: [-40, -52, -64, -60, -54], sideIn: 76, sideLow: 46, drop: 32, shine: 9, extra: 'waves', bd: 40, napeY: 70 },
  beehive:    { label: 'Beehive', era: '1960s: singer, secretary', col: '#c7782e', top: 18, side: 12, fr: [-52, -62, -66, -62, -52], sideIn: 80, sideLow: 30, drop: 22, extra: 'hive' },
  perm:       { label: 'Curly perm', era: '1980s: mum, cashier, aerobics', col: '#a8582e', top: 34, side: 26, edge: { type: 'curly', n: 18, r: 19 }, fr: [-48, -54, -56, -54, -48], sideIn: 84, sideLow: 34, drop: 24, bd: 40 },
  flowing:    { label: 'Long flowing waves', era: 'fairy, princess, mermaid', col: '#e9a14a', top: 18, side: 12, edge: { type: 'wavy', n: 7, len: 5 }, fr: [-46, -58, -70, -56, -42], sideIn: 80, sideLow: 30, drop: 26, long: { len: 260, w: 112, hem: 'wavy' } },
  egyptBob:   { label: 'Blunt bob with bangs', era: 'ancient Egypt: queen, priestess', col: '#1f1c26', top: 14, side: 16, fr: [-40, -40, -40, -40, -40], sideIn: 78, sideLow: 60, drop: 42, bd: 46, napeY: 82, shine: 9, lines: 10, extra: 'egyptBand', sd: { front: -40, nape: 120, inner: [[-30, 74], [-10, 40], [10, -10], [30, -36]] } },
  pigtails:   { label: 'Pigtails', era: 'kids, any era', col: '#c9873a', top: 12, side: 6, fr: [-46, -56, -60, -56, -46], sideIn: 84, extra: 'pigtails' },
  pixie:      { label: 'Pixie cut', era: '1960s and today', col: '#4a3326', top: 12, side: 5, sweep: .2, edge: { type: 'spiky', n: 6, len: 10, topOnly: false }, fr: [-40, -48, -56, -66, -70], sideIn: 84, sideLow: -10 },
  geisha:     { label: 'Shimada updo', era: 'old Japan: geisha, maiko', col: '#1d1a24', top: 22, side: 20, fr: [-60, -68, -72, -68, -60], sideIn: 82, sideLow: 10, shine: 10, extra: 'shimada' },
  doubleBun:  { label: 'Double buns', era: 'old China: girl, dancer; today', col: BLACKH, top: 12, side: 7, fr: [-46, -56, -60, -56, -46], sideIn: 84, extra: 'twinBuns' },

  // ======== v3 (CB 2026-11-12 03:01: "create more different age differen era, ethic, nationality, culture") ========
  // ---- ages ----
  babyWisp:   { label: 'Baby wisp', age: 'baby', era: 'babies, any era', col: '#c9873a', top: 0, side: 0, bald: true, extra: 'wisp' },
  toddlerCurls:{ label: 'Toddler curls', age: 'toddler', era: 'toddlers, any era', col: '#e0a84e', top: 10, side: 4, edge: { type: 'curly', n: 9, r: 15 }, fr: [-62, -68, -70, -68, -62], sideIn: 88, sideLow: -20 },
  // 1840s CENTRE PART (CB 2026-11-14, goldrush Clerk, period fix): short hair parted in the middle and slicked flat with oil (macassar), combed down over the
  // tops of the ears, as clerks and young men wore it in the 1830s-1850s. The library's other centre parts are labelled 1990s / today.
  centrePart1840: { label: 'Centre part, oiled flat', age: 'adult', era: '1830s-1850s: clerk, shop boy, young gentleman', col: '#4a3b30', top: 10, side: 7, fr: [-54, -66, -82, -66, -54], sideIn: 86, sideLow: 16, lines: 7, shine: 10, flow: 0, extra: 'centrePart', sd: { front: -56 } },
  curtains90: { label: 'Curtain bangs', age: 'teen', era: '1990s teen, boy band', col: '#8a5a30', top: 14, side: 8, fr: [-48, -62, -80, -62, -48], sideIn: 84, sideLow: 10, extra: 'centrePart', sd: { front: -44 } },
  emoFringe:  { label: 'Side-swept long fringe', age: 'teen', era: '2000s emo, goth teen', col: '#1f1c26', top: 16, side: 8, sweep: -.15, edge: { type: 'spiky', n: 7, len: 12 }, fr: [-74, -66, -54, -44, -38], sideIn: 82, sideLow: 20, shine: 9 },
  wildWhite:  { label: 'Wild white hair', age: 'elder', era: 'old professor, inventor, wizard', col: '#e9e6ef', top: 14, side: 30, p: .6, edge: { type: 'shaggy', n: 16, len: 20 }, fr: [-82, -90, -92, -90, -82], sideIn: 90, sideLow: 30, drop: 24, bd: 38, sd: { front: -70 } },
  grannyBun:  { label: 'Grey curls + bun', age: 'elder', era: 'grandma, any era', col: '#cfcad8', top: 18, side: 12, edge: { type: 'curly', n: 13, r: 13 }, fr: [-56, -62, -64, -62, -56], sideIn: 86, sideLow: 0, extra: 'topBun' },
  elderGrey:  { label: 'Thin grey side part', age: 'elder', era: 'grandpa, judge, statesman', col: '#b9b6c2', top: 8, side: 6, sweep: .1, fr: [-80, -90, -84, -76, -70], sideIn: 88, sideLow: 10, extra: 'partLine', sd: { front: -68 } },
  tonsure:    { label: 'Monk tonsure', age: 'adult', era: 'medieval monk, friar', col: '#7a5530', top: 10, side: 8, fr: [-54, -58, -60, -58, -54], sideIn: 84, sideLow: 10, extra: 'tonsure' },
  // ---- eras ----
  victoryRolls:{ label: 'Victory rolls', age: 'adult', era: '1940s: war worker, pin-up, nurse', col: '#8a3a22', top: 14, side: 12, fr: [-60, -70, -72, -70, -60], sideIn: 84, sideLow: 30, drop: 22, extra: 'rolls', long: { len: 110, w: 92, hem: 'wavy' } },
  ringlets:   { label: 'Long ringlets', age: 'adult', era: '1800s: Regency, Victorian lady, Southern belle', col: '#6a3e24', top: 14, side: 10, fr: [-58, -70, -78, -70, -58], sideIn: 84, sideLow: 6, extra: 'ringlets' },
  feathered:  { label: 'Feathered flicks', age: 'adult', era: '1970s: TV star, disco', col: '#d9a24a', top: 20, side: 16, edge: { type: 'wavy', n: 6, len: 4 }, fr: [-50, -62, -74, -62, -50], sideIn: 80, sideLow: 50, drop: 30, extra: 'flicks', long: { len: 120, w: 104, hem: 'wavy' } },
  flattop:    { label: 'Flat-top', age: 'adult', era: '1950s soldier, 1980s-90s: hip-hop, coach', col: '#2c2630', top: 60, side: 3, p: .45, flatY: -136, fr: [-70, -76, -78, -76, -70], sideIn: 88, lines: 2 },
  moptop:     { label: 'Mop-top', age: 'adult', era: '1960s: British band, mod', col: '#3a2a22', top: 18, side: 14, fr: [-42, -44, -44, -44, -42], sideIn: 78, sideLow: 36, drop: 26, lines: 6, sd: { front: -30, nape: 132, inner: [[-60, 60], [-36, 48], [-20, 10], [8, -30]] }, bd: 30, napeY: 66 },
  powderWig:  { label: 'Powdered wig', age: 'adult', era: '1700s: founding father, judge, aristocrat', col: '#eeeaf2', top: 14, side: 10, fr: [-78, -86, -88, -86, -78], sideIn: 88, sideLow: -14, extra: 'wigRolls', shine: 6 },
  manBun:     { label: 'Man bun', age: 'adult', era: 'today: barista, yoga teacher', col: '#5a3a26', top: 10, side: 6, fr: [-74, -80, -82, -80, -74], sideIn: 86, extra: 'manBun', sd: { front: -62 } },
  twoBlock:   { label: 'Two-block cut', age: 'teen', era: 'today: K-pop idol, Korean student', col: '#2a2430', top: 18, side: 3, fr: [-42, -46, -50, -46, -42], sideIn: 80, sideLow: -24, extra: 'undercut', sd: { front: -36 } },
  // ---- cultures, nations, ethnic styles ----
  afroPuffs:  { label: 'Afro puffs', age: 'kid', era: 'African American, today and 1970s', col: '#2e221e', top: 6, side: 4, fr: [-64, -70, -72, -70, -64], sideIn: 86, extra: 'puffs' },
  cornrows:   { label: 'Cornrows', age: 'adult', era: 'West Africa, African American, Caribbean', col: '#2a201c', top: 4, side: 3, rows: true, fr: [-68, -74, -76, -74, -68], sideIn: 88, noShine: true },
  bantuKnots: { label: 'Bantu knots', age: 'adult', era: 'Southern Africa (Zulu), today', col: '#2e221e', top: 4, side: 3, buzz: true, fr: [-66, -72, -74, -72, -66], sideIn: 88, noShine: true, extra: 'knots' },
  fade:       { label: 'Curly top + fade', age: 'adult', era: 'today: African, Caribbean, Latino barber cut', col: '#2a201c', top: 14, side: 2, p: .6, edge: { type: 'curly', n: 9, r: 12 }, fr: [-68, -74, -76, -74, -68], sideIn: 88, extra: 'fadeSides' },
  plainsBraids:{ label: 'Long braids, middle part', age: 'adult', era: 'Native American (Plains), Andes', col: '#1f1c26', top: 10, side: 7, fr: [-46, -60, -76, -60, -46], sideIn: 82, sideLow: 20, extra: 'braidsLong', shine: 9, sd: { front: -46 } },
  vikingBraids:{ label: 'Viking side braids', age: 'adult', era: 'Norse, 800-1100', col: '#c98a3c', top: 14, side: 8, edge: { type: 'shaggy', n: 10, len: 10 }, fr: [-62, -70, -72, -70, -62], sideIn: 84, sideLow: 10, long: { len: 190, w: 92, hem: 'shaggy' }, extra: 'braidsLong' },
  sangtu:     { label: 'Joseon topknot', age: 'adult', era: 'old Korea (Joseon): scholar, nobleman', col: '#1d1a24', top: 8, side: 6, fr: [-78, -86, -90, -86, -78], sideIn: 86, extra: 'sangtu', shine: 9, sd: { front: -66 } },
  indianBraid:{ label: 'Long braid with jasmine', age: 'adult', era: 'India, Sri Lanka', col: '#1f1c26', top: 12, side: 8, fr: [-46, -60, -76, -60, -46], sideIn: 82, sideLow: 10, extra: 'jasmineBraid', shine: 9, sd: { front: -46 } },
  himeCut:    { label: 'Hime cut', age: 'adult', era: 'Japan: Heian court lady, today', col: '#1d1a24', top: 12, side: 10, fr: [-44, -44, -44, -44, -44], sideIn: 78, sideLow: 46, drop: 34, shine: 9, long: { len: 230, w: 96, hem: 'straight' }, extra: 'sideLocks' },
  mongolBraids:{ label: 'Loop braids', age: 'adult', era: 'Mongolia, Central Asia', col: '#1d1a24', top: 12, side: 8, fr: [-50, -62, -74, -62, -50], sideIn: 82, sideLow: 0, extra: 'loopBraids', shine: 9 },
  maoriTopknot:{ label: 'Warrior topknot', age: 'adult', era: 'Maori (tikitiki), Polynesia', col: '#2a201c', top: 10, side: 6, fr: [-70, -78, -80, -78, -70], sideIn: 86, extra: 'tikitiki', sd: { front: -60 } },
  mexicanBraids:{ label: 'Crown braids', age: 'adult', era: 'Mexico (Frida-style), Ukraine, Alps', col: '#1f1c26', top: 14, side: 8, fr: [-50, -62, -74, -62, -50], sideIn: 82, sideLow: 0, extra: 'crownBraid', shine: 9 },

  // ======== v4 modern (CB 2026-11-12 03:08: "create more modern hair style") ========
  quiffFade:  { label: 'Quiff + fade', age: 'adult', era: 'today: footballer, influencer', col: '#6a4428', top: 36, side: 2, p: 2.6, sweep: -.12, fr: [-72, -80, -82, -80, -72], sideIn: 88, extra: 'fadeSides', sd: { front: -64 } },
  texturedCrop:{ label: 'Textured crop', age: 'adult', era: 'today: student, gamer, barber classic', col: '#4a3326', top: 14, side: 2, edge: { type: 'spiky', n: 10, len: 8 }, fr: [-52, -56, -58, -56, -52], sideIn: 86, sideLow: -30, extra: 'fadeSides', sd: { front: -40 } },
  slickUnder: { label: 'Slick-back undercut', age: 'adult', era: 'today: bartender, tech boss', col: '#2c2630', top: 16, side: 2, p: 2, fr: [-74, -82, -86, -82, -74], sideIn: 88, extra: 'fadeSides', shine: 10, sd: { front: -66 } },
  messyBun:   { label: 'Messy bun', age: 'adult', era: 'today: student, young mum, artist', col: '#8a5a30', top: 14, side: 9, fr: [-56, -66, -72, -66, -58], sideIn: 84, sideLow: 4, extra: 'messyBun' },
  wolfCut:    { label: 'Wolf cut', age: 'teen', era: 'today: TikTok, K-style shag', col: '#3a2a22', top: 20, side: 14, edge: { type: 'shaggy', n: 10, len: 12 }, fr: [-44, -52, -58, -52, -44], sideIn: 80, sideLow: 40, drop: 28, long: { len: 130, w: 98, hem: 'shaggy' } },
  sleekBob:   { label: 'Sleek bob', age: 'adult', era: 'today: lawyer, editor, news anchor', col: '#5a2e22', top: 12, side: 14, fr: [-46, -62, -78, -62, -46], sideIn: 78, sideLow: 64, drop: 42, bd: 46, napeY: 84, shine: 9, extra: 'centrePart', sd: { front: -44, nape: 120, inner: [[-30, 76], [-12, 44], [2, -6], [24, -40]] } },
  beachWaves: { label: 'Beach waves', age: 'adult', era: 'today: surfer, influencer', col: '#d9a85a', top: 14, side: 10, sweep: .1, edge: { type: 'wavy', n: 7, len: 4 }, fr: [-52, -66, -70, -58, -46], sideIn: 82, sideLow: 30, drop: 24, long: { len: 160, w: 108, hem: 'wavy' }, extra: 'partLine' },
  halfUp:     { label: 'Half-up top knot', age: 'adult', era: 'today: student, festival', col: '#b0703a', top: 12, side: 8, fr: [-58, -68, -72, -68, -58], sideIn: 84, sideLow: 20, long: { len: 170, w: 96, hem: 'straight' }, extra: 'manBun' },
  sideShave:  { label: 'Side shave + long sweep', age: 'adult', era: 'today: DJ, tattoo artist, skater', col: '#3fb6a8', top: 20, side: 12, sweep: -.5, fr: [-84, -74, -58, -46, -40], sideIn: 84, sideLow: 30, extra: 'shavedSide', sd: { front: -46 } },
  boxBraids:  { label: 'Box braids', age: 'adult', era: 'today: African, African American, Caribbean', col: '#2a201c', top: 8, side: 5, rows: true, fr: [-66, -72, -74, -72, -66], sideIn: 86, noShine: true, extra: 'boxBraids' },
  curlyLong:  { label: 'Long natural curls', age: 'adult', era: 'today: singer, dancer, Latin, mixed', col: '#5a3422', top: 30, side: 34, p: .9, edge: { type: 'curly', n: 24, r: 20 }, fr: [-52, -60, -62, -60, -52], sideIn: 84, sideLow: 70, drop: 50, bd: 62, napeY: 92, sd: { front: -48, nape: 108, inner: [[-30, 86], [-14, 50], [-6, -10], [20, -44]] } },
  curtainLong:{ label: 'Long hair, curtain bangs', age: 'adult', era: 'today: model, teacher, vlogger', col: '#7a4a2e', top: 14, side: 9, fr: [-44, -60, -80, -60, -44], sideIn: 82, sideLow: 30, drop: 26, long: { len: 200, w: 100, hem: 'wavy' }, extra: 'centrePart', sd: { front: -46 } },
  braidedPony:{ label: 'Braided high ponytail', age: 'adult', era: 'today: athlete, fighter, pop star', col: '#1f1c26', top: 10, side: 5, fr: [-70, -78, -82, -78, -70], sideIn: 86, shine: 9, extra: 'braidPony', sd: { front: -62 } },
  splitDye:   { label: 'Split-dye bob', age: 'teen', era: 'today: e-girl, alt, streamer', col: '#1d1a24', split: '#f1e3c2', top: 12, side: 14, fr: [-42, -44, -70, -44, -42], sideIn: 78, sideLow: 56, drop: 40, bd: 44, napeY: 80, shine: 8, sd: { front: -42, nape: 122, inner: [[-30, 72], [-12, 40], [2, -6], [24, -40]] } },
};

// ---------------- extras: buns, tufts, tails (drawn per view, local coords) ----------------
const bunAt = (x, y, r, T, sw = 8) => [ring(x, y, r, T.col, sw), L(`M${f(x - r * .55)},${f(y - r * .1)} q${f(r * .4)},${f(-r * .6)} ${f(r * 1.1)},${f(-r * .1)}`, 3, T.dk), brush(x - r * .6, y - r * .35, x - r * .3, y - r * .8, x + r * .2, y - r * .75, 5, { col: T.lt, tip: .3 })];
function braidSeg(pts, w, T) {   // a braid: chain of lens shapes along a polyline
  const o = [];
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2, my = (y0 + y1) / 2, ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI, len = Math.hypot(x1 - x0, y1 - y0);
    o.push(ell(mx, my, len * .62, w, T.col, 4.5, ang), L(`M${f(mx - len * .3)},${f(my - w * .3)} q${f(len * .3)},${f(w * .5)} ${f(len * .6)},0`, 2.6, T.dk)); }
  return o;
}
const tie = (x, y, col = '#e8668a') => ell(x, y, 9, 7, col, 3.5);
function EXTRA(key, view, T, st) {
  const B = [], F = [], side = view === 'side', back = view === 'back';
  switch (key) {
    case 'partLine': if (!side && !back) F.push(L(`M30,-76 Q34,-90 40,-104`, 3.4, T.dk)); break;
    case 'centrePart': if (!side && !back) F.push(L(`M0,-76 L0,-104`, 3.4, T.dk)); else if (back) F.push(L(`M0,-108 L0,-60`, 3.2, T.dk)); break;
    case 'cowlick': {   // Rick's Kyle: one curl standing up from the crown, leaning forward
      const base = side ? [8, -112] : [6, -112];
      F.push(P(`M${base[0] - 12},${base[1] + 6} C${base[0] - 18},${base[1] - 26} ${base[0] + 20},${base[1] - 44} ${base[0] + 30},${base[1] - 22} C${base[0] + 34},${base[1] - 8} ${base[0] + 14},${base[1] - 6} ${base[0] + 14},${base[1] - 18} C${base[0] + 10},${base[1] - 8} ${base[0] + 4},${base[1] + 4} ${base[0] + 12},${base[1] + 8} Z`, T.col, 8));
      break; }
    case 'combLines': if (!back) for (let k = 0; k < 4; k++) F.push(L(`M${f(side ? 40 - k * 22 : -54 + k * 36)},${f(-86 - (k % 2) * 4)} q${side ? -26 : 4},-12 ${side ? -50 : 8},-22`, 2.6, T.lt, .8)); break;
    case 'quiff': {   // the 1950s roll in front: a big forward wave
      const q = side ? `M10,-104 C30,-150 96,-150 104,-112 C100,-96 76,-92 60,-100 C50,-108 36,-104 22,-96 Z` : '';
      if (q) F.push(P(q, T.col, 8), side ? L('M30,-120 Q60,-140 92,-118', 3, T.dk) : L('M-36,-118 Q0,-146 48,-122', 3, T.dk), side ? brush(30, -134, 56, -144, 84, -132, 7, { col: T.lt }) : brush(-40, -126, -10, -150, 30, -144, 8, { col: T.lt }));
      break; }
    case 'crest': {   // mohawk: one tall spiky crest from forehead to nape
      if (back) { F.push(P(poly([[-16, 56], [-18, -100], [-8, -116], [0, -150], [8, -116], [18, -100], [16, 56]]), st.crestCol || T.col, 8), L('M0,-110 L0,50', 3, shade(st.crestCol || T.col, .7))); break; }
      if (side) { const pts = [edge(rad(-60), 2)]; for (let k = 0; k <= 7; k++) { const a = rad(-60 - k * 22), [x, y] = edge(a, 2), [X, Y] = edge(a - rad(11), 40); pts.push([x, y], [X, Y]); } pts.push(edge(rad(-230), 2)); F.push(P(open(pts) + ' Z', st.crestCol || T.col, 8)); break; }
      { const pts = [[-16, -100]]; for (let k = 0; k <= 4; k++) pts.push([-12 + k * 6, -130 - (k % 2 ? 40 : 10)], [-8 + k * 6, -110]); pts.push([16, -100]); F.push(P(poly([[-14, -96], [-18, -158], [-6, -128], [0, -186], [6, -128], [18, -158], [14, -96]]), st.crestCol || T.col, 8)); }
      break; }
    case 'tufts': {   // bald dome, puffs over the ears and round the back (grey)
      const puff = (x, y, s, r = 1) => [ring(x, y - 14 * r, 16 * r, T.col, 4.6), ring(x + s * 10, y + 4, 18 * r, T.col, 4.6), ring(x + s * 2, y + 22 * r, 14 * r, T.col, 4.6), `<circle cx="${f(x)}" cy="${f(y - 14 * r)}" r="${f(16 * r - 2.4)}" fill="${T.col}"/><circle cx="${f(x + s * 10)}" cy="${f(y + 4)}" r="${f(18 * r - 2.4)}" fill="${T.col}"/>`, L(`M${f(x + s * 6)},${f(y - 6)} q${s * 6},4 ${s * 4},12`, 2.6, T.dk)];
      if (back) { const cs = [[-84, 10, 20], [-74, 36, 20], [-48, 52, 20], [-16, 60, 20], [16, 60, 20], [48, 52, 20], [74, 36, 20], [84, 10, 20]]; F.push(...cs.map(([x, y, r]) => ring(x, y, r, T.col, 4.6)), ...cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 2.4}" fill="${T.col}"/>`), L('M-70,30 q8,6 16,4 M30,52 q8,4 14,0', 2.6, T.dk)); }
      else if (side) F.push(...puff(-50, 20, -1, 1.15), ...puff(-82, 4, -1, .9));
      else F.push(...puff(-96, 10, -1), ...puff(96, 10, 1));
      F.push(ell(side ? 40 : 40, -72, 8, 5, '#f4ece6', 0)); break; }
    case 'combover': {   // a few long strands laid over the bald top + side fringe
      const sideBand = s => P(`M${s * 96},${-20} Q${s * 104},${10} ${s * 92},${36} L${s * 80},${30} Q${s * 86},${4} ${s * 82},${-18} Z`, T.col, 4.5);
      if (back) { F.push(P(`M-94,10 Q-80,56 0,62 Q80,56 94,10 L80,4 Q60,40 0,44 Q-60,40 -80,4 Z`, T.col, 4.5)); }
      else if (side) F.push(P(`M-20,10 Q-60,60 -96,30 L-90,12 Q-60,36 -30,0 Z`, T.col, 4.5));
      else F.push(sideBand(-1), sideBand(1));
      if (!back) for (let k = 0; k < 4; k++) { const d = side ? `M${f(40 - k * 4)},${f(-62 - k * 5)} Q${f(-10)},${f(-88 - k * 2)} ${f(-74 + k * 2)},${f(-58 - k * 4)}` : `M${f(-80 + k * 3)},${f(-44 - k * 7)} Q${f(-10)},${f(-84 - k * 2)} ${f(66 - k * 2)},${f(-56 - k * 6)}`; F.push(L(d, 3.6, T.col), L(d, 1.2, INK, .55)); }
      break; }
    case 'chonmage': {   // shaved pate (shown as a skin band), the oiled topknot folded forward over the crown
      if (back) F.push(...bunAt(0, -100, 16, T), P('M-8,-112 L-6,-150 L8,-150 L10,-112 Z', T.col, 4.5));
      else if (side) F.push(P('M-60,-84 Q-64,-104 -40,-108 Q-6,-112 26,-128 Q44,-136 50,-122 Q30,-110 -4,-96 Q-30,-86 -60,-84 Z', T.col, 8), L('M-34,-100 L-28,-108', 4, '#e8e4ee'));
      else F.push(P('M-10,-96 Q-12,-124 0,-132 Q14,-124 10,-96 Z', T.col, 8), P('M-8,-128 Q0,-150 8,-128', T.col, 4), L('M-12,-100 L12,-100', 4, '#e8e4ee'));
      break; }
    case 'queue': {
      if (back) F.push(...braidSeg([[0, 40], [2, 90], [-2, 140], [4, 190], [0, 240]], 11, T), tie(0, 246, '#c23b2f'));
      else if (side) B.push(...braidSeg([[-80, 40], [-96, 90], [-102, 140], [-100, 190], [-96, 240]], 11, T), tie(-96, 246, '#c23b2f'));
      break; }
    case 'fringeCurls': if (!back) { const n = side ? 3 : 6; for (let k = 0; k < n; k++) { const x = side ? 70 - k * 18 : -60 + k * 24, y = side ? -60 - k * 10 : -62 - (k % 2) * 4; F.push(L(`M${f(x - 8)},${f(y - 12)} q16,-2 12,12 q-4,8 -10,2`, 4, T.dk)); } } break;
    case 'locs': { const n = back ? 9 : 4, xs = back ? [...Array(n)].map((_, k) => -80 + k * 20) : null;
      const drawLoc = (x0, y0, x1, y1) => [L(`M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2 + 6)},${f((y0 + y1) / 2)} ${f(x1)},${f(y1)}`, 17, INK), L(`M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2 + 6)},${f((y0 + y1) / 2)} ${f(x1)},${f(y1)}`, 10, T.col), L(`M${f(x0 + 1)},${f(y0 + 10)} L${f(x0 + 1)},${f(y0 + 16)} M${f((x0 + x1) / 2)},${f((y0 + y1) / 2)} l0,6`, 2.4, T.dk)];
      if (back) xs.forEach((x, k) => F.push(...drawLoc(x, 30, x * 1.15, 150 + (k % 3) * 14)));
      else if (side) for (let k = 0; k < 6; k++) B.push(...drawLoc(-30 - k * 12, 30, -40 - k * 16, 150 + (k % 2) * 16));
      else for (const s of [-1, 1]) for (let k = 0; k < 3; k++) B.push(...drawLoc(s * (86 + k * 12), 10, s * (96 + k * 16), 130 + k * 14));
      break; }
    case 'topBun': {   // 1900s: big soft roll all round + a bun on top, pinned
      if (back) F.push(...bunAt(0, -112, 30, T), L('M-14,-120 L16,-104', 3, T.dk));
      else if (side) F.push(...bunAt(-34, -112, 30, T));
      else B.push(...bunAt(0, -128, 30, T));
      break; }
    case 'lowBun': {
      if (back) F.push(...bunAt(0, 42, 32, T), tie(0, 8, '#3a6fb0'));
      else if (side) F.push(...bunAt(-92, 30, 30, T), tie(-74, 6, '#3a6fb0'));
      // front: the low bun is hidden behind the head
      break; }
    case 'ponytail': {
      const tail = (x0, y0, c1x, c1y, x1, y1, w) => P(`M${f(x0 - w)},${f(y0)} C${f(c1x - w)},${f(c1y)} ${f(x1 - w * .4)},${f(y1 - 40)} ${f(x1)},${f(y1)} C${f(x1 + w * .6)},${f(y1 - 50)} ${f(c1x + w)},${f(c1y + 10)} ${f(x0 + w)},${f(y0)} Z`, T.col, 8);
      if (back) F.push(tail(0, -104, 10, -10, -6, 130, 22), tie(0, -100));
      else if (side) F.push(tail(-70, -86, -150, -40, -132, 100, 20), tie(-72, -84));
      else B.push(tail(40, -100, 130, -90, 120, 60, 20)), F.push(tie(58, -98));
      break; }
    case 'braids': {
      const L1 = s => [[s * 80, 20], [s * 88, 60], [s * 90, 100], [s * 88, 140], [s * 86, 178]];
      if (back) for (const s of [-1, 1]) F.push(...braidSeg(L1(s * .8), 13, T), tie(s * 70, 186, '#c23b2f'));
      else if (side) F.push(...braidSeg([[-50, 30], [-56, 70], [-56, 110], [-52, 150], [-48, 188]], 13, T), tie(-48, 196, '#c23b2f'));
      else for (const s of [-1, 1]) F.push(...braidSeg(L1(s), 13, T), tie(s * 86, 186, '#c23b2f'));
      break; }
    case 'waves': if (side) for (let k = 0; k < 3; k++) F.push(L(side ? `M${50 - k * 34},${-90 + k * 22} q-14,14 -6,30` : `M${-66 + k * 8},${-30 - k * 22} q24,-6 44,8 q22,10 44,-2`, 3.4, T.lt, .9)); break;
    case 'hive': {   // tall rounded beehive
      const d = side ? 'M-70,-80 C-90,-170 30,-200 60,-120 C50,-104 20,-96 -10,-96 Z' : back ? 'M-70,-80 C-80,-200 80,-200 70,-80 Z' : 'M-72,-82 C-84,-206 84,-206 72,-82 Z';
      B.push(P(d, T.col, 8), L(side ? 'M-50,-110 Q-10,-170 40,-130' : 'M-40,-104 Q0,-176 40,-104', 3, T.dk), brush(-46, -120, -36, -168, -6, -180, 8, { col: T.lt }));   // behind the head: the cap covers its base, so hive and cap read as one shape
      
      break; }
    case 'egyptBand': if (!back) F.push(P(side ? 'M28,-44 Q60,-48 92,-34 L90,-24 Q60,-38 28,-34 Z' : 'M-80,-38 Q0,-52 80,-38 L80,-28 Q0,-42 -80,-28 Z', '#e2b13c', 3.5), ell(side ? 70 : 0, side ? -40 : -46, 7, 7, '#3a8fc4', 3)); break;
    case 'pigtails': {
      const pt = (s, x, y) => [P(`M${f(x)},${f(y)} C${f(x + s * 40)},${f(y - 30)} ${f(x + s * 70)},${f(y + 20)} ${f(x + s * 50)},${f(y + 70)} C${f(x + s * 30)},${f(y + 40)} ${f(x + s * 30)},${f(y + 20)} ${f(x)},${f(y + 24)} Z`, T.col, 8), tie(x + s * 4, y + 12)];
      if (back) F.push(...pt(-1, -84, -40), ...pt(1, 84, -40));
      else if (side) F.push(...pt(-1, -84, -50));
      else F.push(...pt(-1, -92, -40), ...pt(1, 92, -40));
      break; }
    case 'shimada': {   // lacquered black updo: wide side wings + a folded loop on top
      const wings = s => P(`M${s * 70},${-40} C${s * 128},${-60} ${s * 124},${-10} ${s * 90},${8} Z`, T.col, 8);
      if (back) F.push(P('M-56,-100 C-70,-170 70,-170 56,-100 Z', T.col, 8), wings(-1), wings(1), L('M-50,-120 L50,-120', 5, '#d8473c'));
      else if (side) F.push(P('M-80,-90 C-110,-150 10,-170 20,-110 C-10,-100 -50,-96 -80,-90 Z', T.col, 8), P('M-96,-20 C-150,-10 -140,40 -90,30 Z', T.col, 8), L('M-60,-120 L0,-128', 5, '#d8473c'));
      else F.push(P('M-56,-100 C-72,-168 72,-168 56,-100 Z', T.col, 8), L('M-48,-122 L48,-122', 5, '#d8473c'), wings(-1), wings(1));
      break; }
    case 'twinBuns': {
      const pos = side ? [[-30, -116]] : back ? [[-56, -98], [56, -98]] : [[-60, -100], [60, -100]];
      for (const [x, y] of pos) F.push(...bunAt(x, y, 26, T), tie(x * .9, y + 18, '#d8473c'));
      break; }

    // ---- v3 extras ----
    case 'wisp': if (!back) F.push(L(`M${side ? -6 : 2},-98 C${side ? -18 : -10},-122 ${side ? 18 : 22},-140 ${side ? 26 : 28},-120 C${side ? 30 : 32},-106 ${side ? 10 : 12},-104 ${side ? 12 : 13},-116`, 7.5), L(`M${side ? -6 : 2},-98 C${side ? -18 : -10},-122 ${side ? 18 : 22},-140 ${side ? 26 : 28},-120`, 3, T.col)); else F.push(L('M0,-98 q-6,-16 4,-26', 6)); break;
    case 'tonsure': { const top = []; for (let k = 0; k <= 16; k++) top.push(edge(rad(-150 + k * 7.5), (st.top || 10) - 2));
      const base = back ? 'Q0,-60' : side ? 'Q-10,-70' : 'Q0,-86';
      if (back) F.push(P(open(top) + ` Q0,-50 ${f(top[0][0])},${f(top[0][1])} Z`, '#ffffff', 7.5));
      else F.push(P(open(top) + ` ${base} ${f(top[0][0])},${f(top[0][1])} Z`, '#ffffff', 7.5));
      break; }
    case 'rolls': if (!back) { const roll = (x, y, s) => [ell(x, y, 34, 26, T.col, 8, s * 20), L(`M${f(x - s * 18)},${f(y - 6)} a14,12 0 1,${s > 0 ? 1 : 0} ${f(s * 24)},4`, 3, T.dk), brush(x - 20, y - 14, x - 6, y - 24, x + 12, y - 20, 5, { col: T.lt })];
        if (side) F.push(...roll(10, -108, 1)); else F.push(...roll(-40, -110, -1), ...roll(40, -110, 1)); } break;
    case 'ringlets': { const curl = (x, y, len) => { const o = []; for (let k = 0; k < len; k++) o.push(ell(x + (k % 2 ? 3 : -3), y + k * 22, 13, 13, T.col, 7)); for (let k = 0; k < len; k++) o.push(`<ellipse cx="${f(x + (k % 2 ? 3 : -3))}" cy="${f(y + k * 22)}" rx="9.5" ry="9.5" fill="${T.col}"/>`, L(`M${f(x - 6)},${f(y + k * 22 - 2)} a6,6 0 0,1 10,4`, 2.6, T.lt)); return o; };
      if (back) for (let k = -2; k <= 2; k++) F.push(...curl(k * 34, 46, 5 - Math.abs(k)));
      else if (side) for (let k = 0; k < 3; k++) B.push(...curl(-60 - k * 20, 20, 6));
      else for (const sg of [-1, 1]) for (let k = 0; k < 2; k++) B.push(...curl(sg * (92 + k * 18), 10, 6 - k));
      break; }
    case 'flicks': if (!back) for (const sg of side ? [-1] : [-1, 1]) F.push(L(`M${f(sg * 70)},${f(-30)} q${f(sg * 30)},10 ${f(sg * 40)},40`, 3.2, T.lt), L(`M${f(sg * 76)},${f(0)} q${f(sg * 26)},10 ${f(sg * 36)},36`, 3, T.dk)); break;
    case 'wigRolls': { const roll = (x, y) => [ell(x, y, 22, 14, T.col, 7), L(`M${f(x - 12)},${f(y - 2)} q12,-8 24,0`, 2.6, '#c9c4d2')];
      if (back) F.push(L('M0,30 L0,100', 14, INK), L('M0,30 L0,100', 8, T.col), P('M-26,30 L0,40 L26,30 L20,50 L0,44 L-20,50 Z', '#24222c', 4), ...roll(-94, 0), ...roll(94, 0));
      else if (side) F.push(...roll(-30, -4), ...roll(-30, 22), L('M-80,30 L-110,90', 14, INK), L('M-80,30 L-110,90', 8, T.col), P('M-90,24 L-74,44 L-96,52 Z', '#24222c', 4));
      else F.push(...roll(-92, -6), ...roll(-94, 18), ...roll(92, -6), ...roll(94, 18));
      break; }
    case 'manBun': if (back) F.push(...bunAt(0, -108, 24, T), tie(0, -88, '#3a3036')); else if (side) F.push(...bunAt(-66, -100, 24, T), tie(-54, -86, '#3a3036')); else B.push(...bunAt(0, -128, 22, T)); break;
    case 'undercut': if (!back) for (const sg of side ? [-1] : [-1, 1]) { const x = side ? -40 : sg * 90; F.push(`<path d="M${f(x - 10)},-30 Q${f(x)},10 ${f(x + (side ? -30 : sg * 4))},40" fill="none" stroke="${shade(T.col, .9)}" stroke-width="18" stroke-opacity=".35" stroke-linecap="round"/>`); } break;
    case 'puffs': { const puff = (x, y, r) => { const cs = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; cs.push([x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, r * .45]); } return [...cs.map(([a, b, c]) => ring(a, b, c, T.col, 7)), ...cs.map(([a, b, c]) => `<circle cx="${f(a)}" cy="${f(b)}" r="${f(c - 3.4)}" fill="${T.col}"/>`), ring(x, y, r * .55, T.col, 0), ...[0, 1, 2].map(k => L(`M${f(x - 10 + k * 8)},${f(y - 12 + k * 6)} a6,6 0 0,1 10,2`, 2.6, tint(T.col, .38)))]; };
      if (side) F.push(...puff(-30, -128, 40), tie(-20, -98, '#f2c230')); else F.push(...puff(-70, -120, 40), ...puff(70, -120, 40), tie(-56, -94, '#f2c230'), tie(56, -94, '#f2c230'));
      break; }
    case 'knots': { const pos = side ? [[-60, -96], [-10, -114], [-80, -50]] : back ? [[-50, -92], [0, -110], [50, -92], [-60, -40], [0, -60], [60, -40]] : [[-56, -94], [0, -116], [56, -94]];
      for (const [x, y] of pos) F.push(ring(x, y, 19, T.col, 7), L(`M${f(x - 10)},${f(y + 4)} a10,10 0 1,1 14,-10 a5,5 0 1,1 -4,8`, 2.8, tint(T.col, .38)));
      break; }
    case 'fadeSides': if (!back) for (const sg of side ? [-1] : [-1, 1]) for (let k = 0; k < 12; k++) { const x = side ? -30 - (k % 4) * 12 : sg * (84 + (k % 3) * 5), y = -30 + Math.floor(k / 3) * 14; F.push(`<circle cx="${f(x)}" cy="${f(y)}" r="1.8" fill="${T.dk}" opacity=".55"/>`); } break;
    case 'braidsLong': { const BL = sg => [[sg * 84, 10], [sg * 92, 60], [sg * 94, 110], [sg * 92, 160], [sg * 90, 210], [sg * 88, 250]];
      const wrap = (x, y) => `<rect x="${f(x - 12)}" y="${f(y - 8)}" width="24" height="16" rx="4" fill="#c23b2f" stroke="${INK}" stroke-width="4"/>`;
      if (back) { if (!st.long) for (const sg of [-1, 1]) F.push(...braidSeg(BL(sg * .8), 13, T), wrap(sg * 70, 256)); }
      else if (side) F.push(...braidSeg([[-30, 30], [-34, 80], [-34, 130], [-30, 180], [-28, 230]], 13, T), wrap(-28, 236));
      else for (const sg of [-1, 1]) F.push(...braidSeg(BL(sg), 13, T), wrap(sg * 88, 256));
      break; }
    case 'sangtu': if (back) F.push(...bunAt(0, -118, 18, T), L('M-30,-118 L30,-118', 6, '#e2b13c')); else if (side) F.push(...bunAt(-10, -124, 18, T), L('M-40,-124 L20,-124', 6, '#e2b13c')); else F.push(P('M-14,-104 Q-16,-140 0,-146 Q16,-140 14,-104 Z', T.col, 7.5), L('M-34,-128 L34,-128', 6, '#e2b13c')); break;
    case 'jasmineBraid': { const pts = side ? [[-80, 20], [-92, 70], [-96, 120], [-94, 170], [-90, 220], [-86, 260]] : [[0, 40], [2, 90], [-2, 140], [2, 190], [0, 240]];
      if (back || side) { F.push(...braidSeg(pts, 14, T), tie(pts[pts.length - 1][0], pts[pts.length - 1][1] + 8, '#d8473c')); for (let k = 0; k < 7; k++) F.push(ring((side ? -76 : -26) + (side ? -k * 4 : k * 9), (side ? 0 : 20) + (side ? k * 9 : -Math.abs(k - 3) * 4), 6, '#fbfaf4', 3)); }
      break; }
    case 'sideLocks': if (!back) for (const sg of side ? [1] : [-1, 1]) { const x = side ? -2 : sg * 90; F.push(P(`M${f(x - 9)},-20 L${f(x + 9)},-20 L${f(x + 9)},72 L${f(x - 9)},72 Z`, T.col, 7), L(`M${f(x)},-10 L${f(x)},62`, 2.6, T.lt)); } break;   // Heian side-locks: cut at the cheek line, outside the eyes
    case 'loopBraids': { const loop = sg => P(`M${f(sg * 82)},0 C${f(sg * 150)},40 ${f(sg * 140)},140 ${f(sg * 92)},120 C${f(sg * 110)},100 ${f(sg * 112)},40 ${f(sg * 80)},24 Z`, T.col, 7.5);
      if (side) B.push(P('M-60,20 C-130,60 -120,160 -70,140 C-90,120 -92,60 -56,40 Z', T.col, 7.5)); else if (back) F.push(loop(-1), loop(1)); else B.push(loop(-1), loop(1));
      break; }
    case 'tikitiki': if (back) F.push(...bunAt(0, -118, 22, T)); else if (side) F.push(...bunAt(-18, -124, 22, T), L('M-18,-146 L-6,-176', 6, '#f3efe6')); else F.push(...bunAt(0, -128, 22, T), L('M6,-148 L18,-180', 6, '#f3efe6'));
      break;
    case 'crownBraid': { const pts = []; const a0 = side ? -40 : back ? 200 : 200, a1 = side ? -170 : back ? 340 : 340; for (let k = 0; k <= 9; k++) pts.push(edge(rad(a0 + (a1 - a0) * k / 9), (st.top || 10) - 4));
      F.push(...braidSeg(pts, 15, T)); if (!back) F.push(...[0, 1, 2].map(k => ring((side ? -40 : -40) + k * 26, (side ? -112 : -118) + (k === 1 ? -8 : 0), 11, ['#e8466a', '#f2c230', '#e8466a'][k], 3.5)));
      break; }

    // ---- v4 modern extras ----
    case 'messyBun': { const mb = (x, y) => [...[0, 1, 2, 3, 4].map(k => { const a = rad(-150 + k * 34); return L(`M${f(x)},${f(y)} L${f(x + Math.cos(a) * 44)},${f(y + Math.sin(a) * 44)}`, 9, INK) + L(`M${f(x)},${f(y)} L${f(x + Math.cos(a) * 42)},${f(y + Math.sin(a) * 42)}`, 4, T.col); }), ...bunAt(x, y, 26, T), L(`M${f(x - 14)},${f(y + 8)} q14,10 28,0`, 3, T.dk)];
      if (back) F.push(...mb(0, -112)); else if (side) F.push(...mb(-40, -112), L('M40,-52 q10,26 2,56', 7.5), L('M40,-52 q10,26 2,56', 3.4, T.col)); else { B.push(...mb(0, -130)); for (const sg of [-1, 1]) F.push(L(`M${sg * 84},-10 q${sg * 10},30 ${sg * -4},66`, 7.5), L(`M${sg * 84},-10 q${sg * 10},30 ${sg * -4},66`, 3.4, T.col)); }
      break; }
    case 'shavedSide': if (!back && !side) { for (let k = 0; k < 15; k++) F.push(`<circle cx="${f(74 + (k % 3) * 8)}" cy="${f(-52 + Math.floor(k / 3) * 13)}" r="2" fill="${T.dk}" opacity=".7"/>`); F.push(L('M70,-64 q16,30 12,66', 3, T.dk, .6)); } break;
    case 'boxBraids': { const bb = (x0, y0, x1, y1) => { const o = [L(`M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2 + 4)},${f((y0 + y1) / 2)} ${f(x1)},${f(y1)}`, 13, INK), L(`M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2 + 4)},${f((y0 + y1) / 2)} ${f(x1)},${f(y1)}`, 7, T.col)]; for (let j = 1; j < 7; j++) { const t = j / 7, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; o.push(L(`M${f(px - 3)},${f(py - 2)} l6,4`, 2, tint(T.col, .4))); } o.push(ring(x1, y1 + 4, 5, '#e2b13c', 3)); return o; };
      if (back) for (let k = 0; k < 11; k++) F.push(...bb(-84 + k * 16.8, 30, (-84 + k * 16.8) * 1.1, 200 + (k % 3) * 16));
      else if (side) for (let k = 0; k < 7; k++) B.push(...bb(-24 - k * 12, 30, -30 - k * 15, 200 + (k % 2) * 18));
      else for (const sg of [-1, 1]) for (let k = 0; k < 4; k++) B.push(...bb(sg * (82 + k * 10), 0, sg * (88 + k * 15), 190 + k * 12));
      break; }
    case 'braidPony': { const pts = back ? [[0, -104], [4, -50], [-2, 10], [4, 70], [0, 130], [-2, 180]] : side ? [[-72, -92], [-120, -60], [-140, -10], [-142, 50], [-136, 110], [-128, 160]] : [[44, -104], [100, -90], [122, -40], [124, 20], [118, 80]];
      const o = [...braidSeg(pts, 14, T), tie(pts[0][0], pts[0][1] + 2, '#e8466a'), tie(pts[pts.length - 1][0], pts[pts.length - 1][1] + 8, '#e8466a')];
      if (!back && !side) B.push(...o); else F.push(...o);
      break; }
  }
  return { back: B, front: F };
}

// long hair below the head (behind the head in front/side views, over it in the back view)
function longHair(st, view, T, shape) {
  const g = st.long; if (!g) return { back: [], front: [] };
  const len = g.len, w = g.w, hemPts = (x0, x1, y) => { const pts = [], n = 8; for (let k = 0; k <= n; k++) { const u = k / n, x = x0 + (x1 - x0) * u; let dy = 0;
      if (g.hem === 'wavy') dy = 10 * Math.sin(u * Math.PI * 3); else if (g.hem === 'shaggy') dy = (k % 2 ? -22 : 6); pts.push([x, y + dy]); } return pts; };
  let pts;
  if (view === 'side') { const top = outerPts(st, rad(-100), rad(-200), shape, 30); pts = [...top, [-w - 8, 40], [-w - 4, len - 30], ...hemPts(-w, -28, len), [-26, 60]]; }
  else { const top = outerPts(st, rad(155), rad(385), shape, 60); pts = [...top, [w, 40], [w + 4, len - 30], ...hemPts(w, -w, len), [-w - 4, len - 30], [-w, 40]]; }
  const tn = tones(T.col, -110, len, .2, .72), d = open(pts) + ' Z';
  const lines = []; for (let k = -3; k <= 3; k++) { const x = view === 'side' ? -40 - (k + 3) * 9 : k * w / 4; lines.push(L(`M${f(x)},${f(40)} Q${f(x + 10)},${f(len * .6)} ${f(x * 1.05)},${f(len - 16)}`, 3, tn.dk)); }
  const out = [tn.def, P(d, `url(#${tn.id})`, OUT - 1), ...lines];
  return view === 'back' ? { back: [], front: out } : { back: out, front: [] };
}

// ---------------- head pieces that sit ON the hair ----------------
// P = { view, dir, onHair(aDeg, push) -> [x,y] on the outer hair edge (front coords; side view = facing +x), crownY, widthAt(y), col }
export const PIECES = {
  flower: Pp => { const [x, y] = Pp.view === 'back' ? Pp.onHair(-40, -4) : Pp.view === 'side' ? Pp.onHair(-120, -4) : Pp.onHair(-30, -4), o = [];
    for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; o.push(ring(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 11, '#f27aa0', 3.5)); } o.push(ring(x, y, 8, '#f2d24a', 3)); return o; },
  bow: Pp => { const [x, y] = Pp.view === 'side' ? Pp.onHair(-110, -2) : Pp.onHair(-62, -2); return [P(`M${f(x)},${f(y)} L${f(x - 30)},${f(y - 18)} L${f(x - 30)},${f(y + 18)} Z`, '#e8466a', 4.5), P(`M${f(x)},${f(y)} L${f(x + 30)},${f(y - 18)} L${f(x + 30)},${f(y + 18)} Z`, '#e8466a', 4.5), ring(x, y, 8, '#c22f52', 4)]; },
  headband: Pp => { const a0 = Pp.view === 'side' ? -40 : 200, a1 = Pp.view === 'side' ? -150 : 340, pts = []; for (let k = 0; k <= 20; k++) pts.push(Pp.onHair(a0 + (a1 - a0) * k / 20, -12));
    return Pp.view === 'back' ? [] : [L(open(pts), 17, INK), L(open(pts), 10, '#3a8fc4')]; },
  barrette: Pp => { const [x, y] = Pp.view === 'side' ? Pp.onHair(-70, -14) : Pp.onHair(-40, -14); return [`<rect x="${f(x - 18)}" y="${f(y - 6)}" width="36" height="12" rx="6" fill="#e2b13c" stroke="${INK}" stroke-width="4" transform="rotate(${Pp.view === 'side' ? 30 : 40} ${f(x)} ${f(y)})"/>`]; },
  tiara: Pp => { if (Pp.view === 'back') return []; const [x, y] = Pp.view === 'side' ? Pp.onHair(-62, -6) : Pp.onHair(-90, -6), w = Pp.view === 'side' ? 26 : 50;
    return [P(`M${f(x - w)},${f(y + 10)} L${f(x - w * .6)},${f(y - 14)} L${f(x - w * .3)},${f(y + 2)} L${f(x)},${f(y - 28)} L${f(x + w * .3)},${f(y + 2)} L${f(x + w * .6)},${f(y - 14)} L${f(x + w)},${f(y + 10)} Z`, '#f2d24a', 4.5), ring(x, y - 8, 6, '#e8466a', 3)]; },
  laurel: Pp => { const o = [], a0 = Pp.view === 'side' ? -20 : 190, a1 = Pp.view === 'side' ? -170 : 350, n = 12;
    for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n, [x, y] = Pp.onHair(a, -10); o.push(ell(x, y, 12, 6, '#6aa84f', 3.5, a + 90 + (k % 2 ? 30 : -30))); } return Pp.view === 'back' ? o.slice(0, 0) : o; },
  sticks: Pp => { const [x, y] = Pp.view === 'side' ? Pp.onHair(-140, -14) : Pp.onHair(-120, -14); return [L(`M${f(x - 50)},${f(y + 20)} L${f(x + 40)},${f(y - 30)}`, 9, INK), L(`M${f(x - 50)},${f(y + 20)} L${f(x + 40)},${f(y - 30)}`, 4, '#d8473c'), ring(x + 44, y - 32, 7, '#f2d24a', 3), L(`M${f(x - 40)},${f(y - 24)} L${f(x + 50)},${f(y + 10)}`, 9, INK), L(`M${f(x - 40)},${f(y - 24)} L${f(x + 50)},${f(y + 10)}`, 4, '#e8c46a')]; },
  pencil: Pp => { if (Pp.view === 'back') return []; const [x, y] = Pp.view === 'side' ? [-44, -36] : Pp.onHair(-12, 4); return [P(`M${f(x - 34)},${f(y + 18)} L${f(x + 28)},${f(y - 18)} L${f(x + 34)},${f(y - 8)} L${f(x - 28)},${f(y + 28)} Z`, '#f2c230', 3.5), P(`M${f(x + 28)},${f(y - 18)} L${f(x + 46)},${f(y - 22)} L${f(x + 34)},${f(y - 8)} Z`, '#f3dfc0', 3)]; },
  goggles: Pp => { if (Pp.view === 'back') return [L(open([Pp.onHair(200, -20), Pp.onHair(270, -20), Pp.onHair(340, -20)]), 12, '#5a4a40')]; const [x, y] = Pp.view === 'side' ? Pp.onHair(-70, -10) : Pp.onHair(-90, -4), sp = Pp.view === 'side' ? 0 : 28;
    return [ring(x - sp, y, 20, '#9fd6ef', 6), ...(sp ? [ring(x + sp, y, 20, '#9fd6ef', 6), L(`M${f(x - 8)},${f(y)} L${f(x + 8)},${f(y)}`, 6)] : []), `<circle cx="${f(x - sp - 6)}" cy="${f(y - 6)}" r="5" fill="#fff" opacity=".8"/>`]; },
  shades: Pp => { if (Pp.view === 'back') return []; const [x, y] = Pp.view === 'side' ? Pp.onHair(-66, -12) : Pp.onHair(-90, -10), sp = Pp.view === 'side' ? 0 : 26;
    return [ell(x - sp, y, 22, 13, '#24222c', 5), ...(sp ? [ell(x + sp, y, 22, 13, '#24222c', 5)] : []), L(`M${f(x - sp - 12)},${f(y - 4)} l10,-4`, 3, '#fff', .7)]; },
};

// ---------------- hats that sit over the hair (hair pressed flat; sides and back still show) ----------------
export const HATS = {
  helmet: Pp => { const y = Pp.brimY + 8, w = Pp.widthAt(y) + 8, top = Pp.crownY - 40;   // Rick's cart army kettle helmet: steel dome, rim band, rivets, plume holder
    if (Pp.view === 'side') return [P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 20)} ${f(w)},${f(top - 20)} ${f(w)},${f(y)} Z`, '#aeb4c2', 6), P(`M${f(-w - 6)},${f(y - 8)} L${f(w + 10)},${f(y - 8)} L${f(w + 10)},${f(y + 6)} L${f(-w - 6)},${f(y + 6)} Z`, '#8d93a3', 5), ring(0, top - 4, 9, '#8d93a3', 4), brush(-w * .6, y - 20, -w * .5, top + 10, -w * .1, top, 7, { col: '#e6e9f0' })];
    return [P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 20)} ${f(w)},${f(top - 20)} ${f(w)},${f(y)} Z`, '#aeb4c2', 6), P(`M${f(-w - 8)},${f(y - 8)} L${f(w + 8)},${f(y - 8)} L${f(w + 8)},${f(y + 6)} L${f(-w - 8)},${f(y + 6)} Z`, '#8d93a3', 5),
      ...[-.6, -.3, 0, .3, .6].map(u => `<circle cx="${f(u * w)}" cy="${f(y - 1)}" r="3.4" fill="#e6e9f0"/>`), ring(0, top - 4, 9, '#8d93a3', 4), brush(-w * .6, y - 20, -w * .5, top + 10, -w * .1, top, 7, { col: '#e6e9f0' })]; },
  flatcap: Pp => { const y = Pp.brimY, w = Pp.widthAt(y) + 6, top = Pp.crownY - 6;
    if (Pp.view === 'back') return [P(`M${f(-w)},${f(y)} C${f(-w)},${f(top)} ${f(w)},${f(top)} ${f(w)},${f(y)} Z`, '#6b6f5a', 6), L(`M${f(-w * .8)},${f(y - 14)} Q0,${f(y - 4)} ${f(w * .8)},${f(y - 14)}`, 3, '#4b4e3e')];
    if (Pp.view === 'side') return [P(`M${f(-w)},${f(y)} C${f(-w)},${f(top)} ${f(w * .9)},${f(top - 6)} ${f(w + 24)},${f(y - 18)} L${f(w + 40)},${f(y)} Z`, '#6b6f5a', 6), L(`M${f(w - 10)},${f(y - 8)} L${f(w + 36)},${f(y - 2)}`, 4, '#4b4e3e')];
    return [P(`M${f(-w - 4)},${f(y)} C${f(-w)},${f(top - 10)} ${f(w)},${f(top - 10)} ${f(w + 4)},${f(y)} Z`, '#6b6f5a', 6), P(`M${f(-w + 6)},${f(y - 4)} Q0,${f(y + 22)} ${f(w - 6)},${f(y - 4)} Q0,${f(y + 6)} ${f(-w + 6)},${f(y - 4)} Z`, '#55594a', 5), L(`M${f(-w * .7)},${f(y - 24)} Q0,${f(y - 40)} ${f(w * .7)},${f(y - 24)}`, 3, '#4b4e3e')]; },
  beret: Pp => { const y = Pp.brimY - 6, w = Pp.widthAt(y) + 14, top = Pp.crownY - 4;
    return [P(`M${f(-w)},${f(y)} C${f(-w - 10)},${f(top - 10)} ${f(w + 20)},${f(top - 20)} ${f(w + 10)},${f(y - 4)} Q0,${f(y + 8)} ${f(-w)},${f(y)} Z`, '#c23b4a', 6), L(`M0,${f(top - 4)} l4,-12`, 6), brush(-w * .6, y - 14, -w * .3, top, w * .1, top - 6, 6, { col: '#e8707c' })]; },
  tophat: Pp => { const y = Pp.brimY, w = Pp.widthAt(y) * .74, top = Pp.crownY - 110;
    return [P(`M${f(-w)},${f(y)} L${f(-w + 6)},${f(top)} L${f(w - 6)},${f(top)} L${f(w)},${f(y)} Z`, '#24222c', 6), P(`M${f(-w)},${f(y - 26)} L${f(w)},${f(y - 26)} L${f(w)},${f(y - 6)} L${f(-w)},${f(y - 6)} Z`, '#a8323a', 4.5),
      P(`M${f(-w - 34)},${f(y + 4)} Q0,${f(y + 20)} ${f(w + 34)},${f(y + 4)} Q0,${f(y - 10)} ${f(-w - 34)},${f(y + 4)} Z`, '#24222c', 5.5), brush(-w * .7, top + 20, -w * .7, y - 60, -w * .6, y - 34, 6, { col: '#55525e' })]; },
  straw: Pp => { const y = Pp.brimY, w = Pp.widthAt(y) * .8, top = Pp.crownY - 38;
    return [P(`M${f(-w - 70)},${f(y + 8)} Q0,${f(y + 34)} ${f(w + 70)},${f(y + 8)} Q0,${f(y - 22)} ${f(-w - 70)},${f(y + 8)} Z`, '#e9c46a', 5.5), P(`M${f(-w)},${f(y)} C${f(-w)},${f(top)} ${f(w)},${f(top)} ${f(w)},${f(y)} Z`, '#e9c46a', 6), P(`M${f(-w)},${f(y - 18)} L${f(w)},${f(y - 18)} L${f(w)},${f(y)} L${f(-w)},${f(y)} Z`, '#d8473c', 4.5),
      ...[-2, -1, 0, 1, 2].map(k => L(`M${f(k * w * .4)},${f(y - 22)} L${f(k * w * .38)},${f(top + 8)}`, 2.2, '#c49a3e'))]; },

  // head coverings by culture (v3): cover the hair, so only what shows at the face edge is drawn
  turban: Pp => { const y = Pp.brimY + 10, w = Pp.widthAt(y) + 16, top = Pp.crownY - 86, c = '#e08a2e', d = shade(c, .76);   // Sikh dastar / Rajasthan pagri: wrapped layers, a peak at the front
    const dome = P(`M${f(-w)},${f(y)} C${f(-w - 8)},${f(top - 10)} ${f(w + 8)},${f(top - 10)} ${f(w)},${f(y)} Q0,${f(y + 12)} ${f(-w)},${f(y)} Z`, c, 7.5);
    const folds = Pp.view === 'back' ? [1, 2, 3].map(k => L(`M${f(-w + 6)},${f(y - k * 18)} Q0,${f(y - k * 18 + 10)} ${f(w - 6)},${f(y - k * 18)}`, 3.2, d)) : Pp.view === 'side' ? [1, 2, 3].map(k => L(`M${f(-w + 6)},${f(y - k * 20 + 8)} Q${f(10)},${f(y - k * 24)} ${f(w - 4)},${f(y - k * 12 - 10)}`, 3.2, d)) : [1, 2, 3].map(k => L(`M${f(-w + 6)},${f(y - k * 16)} L0,${f(y - k * 16 - 26)} L${f(w - 6)},${f(y - k * 16)}`, 3.2, d));
    return [dome, ...folds, brush(-w * .62, y - 30, -w * .6, y - 70, -w * .3, y - 96, 6, { col: tint(c, .35) })]; },
  hijab: Pp => { const c = '#3f7f8c', d = shade(c, .75), lt = tint(c, .3);   // covers the hair and neck; the face stays open
    if (Pp.view === 'back') return [P('M-112,-20 C-120,-150 120,-150 112,-20 C116,60 100,140 0,160 C-100,140 -116,60 -112,-20 Z', c, 7.5), L('M-60,40 Q0,70 60,40', 3.2, d), brush(-80, -60, -70, -110, -30, -126, 7, { col: lt })];
    if (Pp.view === 'side') return [P('M60,-76 C40,-150 -120,-140 -116,-20 C-114,70 -60,150 20,150 C60,140 70,120 64,100 C30,96 0,70 -6,40 C-10,0 20,-40 60,-60 Z', c, 7.5), L('M-80,20 Q-50,90 10,120', 3.2, d), brush(-60, -100, -20, -128, 30, -110, 7, { col: lt })];
    return [P('M0,-128 C-100,-128 -122,-40 -116,20 C-112,90 -70,140 0,148 C70,140 112,90 116,20 C122,-40 100,-128 0,-128 Z M0,-70 C-56,-70 -84,-30 -84,20 C-84,60 -60,90 0,96 C60,90 84,60 84,20 C84,-30 56,-70 0,-70 Z', c, 7.5, 'fill-rule="evenodd"'), L('M-70,100 Q0,130 70,100', 3.2, d), brush(-90, -20, -84, -80, -40, -112, 7, { col: lt })]; },
  kufi: Pp => { const y = Pp.brimY - 4, w = Pp.widthAt(y) + 2, top = Pp.crownY - 44, c = '#f3efe6';   // West African / Muslim round cap, embroidered band
    return [P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 10)} ${f(w)},${f(top - 10)} ${f(w)},${f(y)} Z`, c, 7.5), L(`M${f(-w + 4)},${f(y - 10)} L${f(w - 4)},${f(y - 10)}`, 6, '#c9a13a'), ...[-.5, 0, .5].map(u => `<circle cx="${f(u * w)}" cy="${f(y - 24)}" r="4" fill="#c9a13a"/>`)]; },
  sombrero: Pp => { const y = Pp.brimY, w = Pp.widthAt(y) * .8, top = Pp.crownY - 70, c = '#e2b85c';
    return [P(`M${f(-w - 110)},${f(y + 4)} Q${f(-w - 120)},${f(y - 30)} ${f(-w - 90)},${f(y - 26)} Q0,${f(y + 10)} ${f(w + 90)},${f(y - 26)} Q${f(w + 120)},${f(y - 30)} ${f(w + 110)},${f(y + 4)} Q0,${f(y + 44)} ${f(-w - 110)},${f(y + 4)} Z`, c, 7), P(`M${f(-w)},${f(y)} C${f(-w + 6)},${f(top)} ${f(w - 6)},${f(top)} ${f(w)},${f(y)} Z`, c, 7.5), L(`M${f(-w)},${f(y - 16)} Q0,${f(y - 8)} ${f(w)},${f(y - 16)}`, 7, '#d8473c'), L(`M${f(-w - 80)},${f(y + 8)} Q0,${f(y + 34)} ${f(w + 80)},${f(y + 8)}`, 4, '#2f8a5a')]; },
};

// ---------------- build ----------------
// returns head-space layers for one view, already mirrored for dir < 0 (the rig mirrors the head shape for dir < 0)
export function hairLayers(key, H, opts = {}) {
  const base = HAIR_STYLES[key]; if (!base) throw new Error('unknown hair ' + key);
  const st = { ...base, ...(opts.over || {}) }, shape = opts.shape || 'rick', view = H.view === '34' ? 'front' : (H.view || 'front'), dir = H.dir || 1;
  if (opts.underHat) { st.top = Math.min(st.top, 6); st.side = Math.min(st.side + 2, 14); if (st.edge && st.edge.type !== 'curly') st.edge = { type: 'smooth' }; }
  const col = opts.col || st.col, T = { col, lt: tint(col, .24), dk: shade(col, .7, 1) };
  const back = [], front = [];
  // long hair
  const lg = longHair(st, view, T, shape); back.push(...lg.back); front.push(...lg.front);
  // the cap
  if (!st.bald) {
    const cap = capShape(st, view, shape), ys = cap.outer.map(p => p[1]).concat(cap.inner.map(p => p[1])), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const tn = tones(col, y0, y1), d = open([...cap.outer, ...cap.inner]) + ' Z', cid = 'hc' + (UID++);
    front.push(tn.def, `<defs><clipPath id="${cid}"><path d="${d}"/></clipPath></defs>`);
    const outerLine = `<path d="${open(cap.outer)}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (st.edge && st.edge.type === 'curly') {   // cloud outline: stroked circles, the cap, then the circle fills on top, then a light c-arc on each curl
      const cs = curlRing(st, cap.a0, cap.a1, shape);
      front.push(...cs.map(([x, y, r]) => ring(x, y, r, col, OUT - 1)), P(d, `url(#${tn.id})`, IN), ...cs.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - (OUT - 1) / 2 + .2)}" fill="${y < y0 + (y1 - y0) * .35 ? tint(col, .12) : col}"/>`));
      front.push(`<g clip-path="url(#${cid})">${shading(st, view, cap, T, shape).join('')}</g>`, curlArcs(cs, T));
    } else {
      const split = st.split && view !== 'side' ? `<g clip-path="url(#${cid})"><rect x="${view === 'back' ? -220 : 0}" y="-260" width="220" height="520" fill="${st.split}"/><rect x="${view === 'back' ? -220 : 0}" y="-10" width="220" height="270" fill="${shade(st.split, .86)}" opacity=".5"/></g>` : '';
      front.push(P(d, `url(#${tn.id})`, IN), split, `<g clip-path="url(#${cid})">${shading(st, view, cap, T, shape).join('')}</g>`, outerLine);
      if (st.edge && st.edge.type === 'locks') front.push(...locks(st, view, T, shape, cap.a0, cap.a1));
    }
    if (st.shaved && view !== 'back') front.push(`<g clip-path="url(#${cid})">${L(view === 'side' ? 'M-70,-70 Q-10,-110 50,-84' : 'M-80,-62 Q0,-92 80,-62', 3, T.lt, .7)}</g>`);
  }
  if (st.extra && !(opts.underHat && ['cowlick', 'quiff', 'crest', 'topBun', 'hive', 'shimada', 'twinBuns', 'chonmage'].includes(st.extra))) { const ex = EXTRA(st.extra, view, T, st); back.push(...ex.back); front.push(...ex.front); }
  // anchors for pieces and hats (front coords)
  const anchorSt = st, onHair = (aDeg, push = 0) => { const a = rad(aDeg); return edge(a, (anchorSt.bald ? 0 : volAt(anchorSt, a)) + push, shape); };
  const crownY = onHair(-90)[1], brimY = opts.brimY ?? -48;
  const widthAt = y => { let w = 0; for (let k = 0; k <= 90; k++) { const a = rad(180 + k * 2), p = onHair(a * 180 / Math.PI); if (Math.abs(p[1] - y) < 14) w = Math.max(w, Math.abs(p[0])); } return w || 96; };
  const PP = { view, dir, onHair, crownY, brimY, widthAt, col, v34: H.view === '34' };
  for (const pc of opts.pieces || []) front.push(...(typeof pc === 'function' ? pc(PP) : PIECES[pc](PP)));
  if (opts.hat) { const hf = typeof opts.hat === 'function' ? opts.hat : HATS[opts.hat], parts = hf(PP, H);
    if (hf.covers || opts.hat === 'hijab') { back.length = 0; front.length = 0; }   // a full covering (hijab, full helmet, hood mask) hides the hair
    if (parts.back) { back.unshift(...parts.back); front.push(...parts.front); } else front.push(...parts); }
  const wrap = arr => arr.length ? [`<g transform="translate(${f(H.cx)},${f(H.hy)})${dir < 0 ? ' scale(-1,1)' : ''}">${arr.join('')}</g>`] : [];
  return { back: wrap(back), front: wrap(front), anchor: { crownY, brimY } };
}

// put a hair style (+ head pieces + hat) on a castkit spec. Front hair goes in spec.hat (never slid in 3/4, per VIEW_RULES 2),
// long hair in spec.headBack. An existing spec.hat / headBack / faceTop is kept and drawn after / before.
export function withHair(spec, key, opts = {}) {
  const shape = opts.shape || spec.head || ({ lady: 'egg', teengirl: 'egg', elder: 'potato' })[spec.form] || 'rick';
  const o = { ...opts, shape, underHat: !!opts.hat || !!opts.underHat }, hb = spec.headBack, ht = spec.hat;
  return { ...spec, hair: undefined, headBack: H => [...(hb ? hb(H) : []), ...hairLayers(key, H, o).back], hat: H => [...hairLayers(key, H, o).front, ...(ht ? ht(H) : [])] };
}
