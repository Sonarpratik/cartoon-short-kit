// 2D VECTOR PUPPET: every part is coded curves (SVG). One unit = head width D = 200 px.
// The sheet is drawn in "puppet space"; in 3D each part group becomes a flat card at depth.
export const INK = '#2a1a1f';
const LINE = 13, THIN = 5.5;

// --- tiny colour helpers ---
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const shade = (h, k, cool = 0) => { const [r, g, b] = hx(h); return toHex([r * k - cool * 6, g * k - cool * 4, b * k + cool * 10]); };
export const tint = (h, k) => { const [r, g, b] = hx(h); return toHex([r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k]); };

let GID = 0;
// soft "light from the left" gradient used on all clothing
function clothGrad(defs, col, x0, x1) {
  const id = 'g' + (GID++);
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0">
    <stop offset="0" stop-color="${tint(col, .1)}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, .68, 1)}"/></linearGradient>`);
  return `url(#${id})`;
}
function skinGrad(defs, cx, cy, r) {
  const id = 'g' + (GID++);
  defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx - r * .35}" cy="${cy - r * .4}" r="${r * 1.55}">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff"/></radialGradient>`);
  return `url(#${id})`;
}
// three hard hair tones + streaks, clipped to the hair shape
function hairFill(defs, col, y0, y1) {
  const id = 'g' + (GID++), dk = shade(col, .66, 1), lt = tint(col, .22);
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">
    <stop offset="0" stop-color="${lt}"/><stop offset=".34" stop-color="${lt}"/><stop offset=".34" stop-color="${col}"/><stop offset=".72" stop-color="${col}"/><stop offset=".72" stop-color="${dk}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`);
  return `url(#${id})`;
}
const path = (d, fill, stroke = INK, sw = LINE, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const clip = (defs, d) => { const id = 'c' + (GID++); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; };
// LIVE CLOTH helpers (2026-11-12, thread "Rework character motion for long cloth"): used only when the motion rig passes S.legsLive
const hull2 = P => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1)); };
const clipHalf = (P, o, g, m = 0) => { const sd = q => (q[0] - o[0]) * g[0] + (q[1] - o[1]) * g[1] + m, out = [];   // keep the side above the floor line (sd <= 0)
  P.forEach((a, i) => { const b = P[(i + 1) % P.length], da = sd(a), db = sd(b); if (da <= 0) out.push(a); if ((da < 0) !== (db < 0) && da !== db) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } }); return out; };
const legPath = (l, sMax, step = 14) => { const segs = [[l.H, l.K], [l.K, l.A]], pts = []; let s = 0, end = null, tan = [0, 1];   // points along hip -> knee -> ankle up to arc length sMax
  for (const [a, b] of segs) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    for (let d = 0; d <= L; d += step) { if (s + d > sMax) { end = [a[0] + u[0] * (sMax - s), a[1] + u[1] * (sMax - s)]; tan = u; pts.push(end); return { pts, end, tan }; } pts.push([a[0] + u[0] * d, a[1] + u[1] * d]); }
    s += L; tan = u; }
  end = [...l.A]; pts.push(end); return { pts, end, tan }; };
const legAt = (l, s) => legPath(l, s).end;
// SIDE KNEEL morph helpers (2026-11-14): a closed cloth path (M/L/Q/C/Z, absolute, as the cloth code writes them) as points, its turn sign, and N points evenly spaced along it from the point nearest 'anchor'
const closedPts = d => { const T = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [], o = []; let i = 0, c = 'M', p = [0, 0]; const n = () => +T[i++];
  while (i < T.length) { if (/^[MLQCZ]$/i.test(T[i])) c = T[i++].toUpperCase(); if (c === 'Z') { if (i < T.length && !/^[MLQCZ]$/i.test(T[i])) break; continue; } if (i + 1 >= T.length) break;
    if (c === 'M' || c === 'L') { p = [n(), n()]; o.push(p); if (c === 'M') c = 'L'; }
    else if (c === 'Q') { const a = [n(), n()], b = [n(), n()]; for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; o.push([u * u * p[0] + 2 * u * t * a[0] + t * t * b[0], u * u * p[1] + 2 * u * t * a[1] + t * t * b[1]]); } p = b; }
    else if (c === 'C') { const a = [n(), n()], b = [n(), n()], e = [n(), n()]; for (let k = 1; k <= 10; k++) { const t = k / 10, u = 1 - t; o.push([u * u * u * p[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * e[0], u * u * u * p[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * e[1]]); } p = e; }
    else break; }
  return o; };
const sgn = P => P.reduce((a, p, i) => { const q = P[(i + 1) % P.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) > 0 ? 1 : -1;
const resampleFrom = (P, N, anchor) => { let s0 = 0, bd = 1e18; P.forEach((p, i) => { const d = (p[0] - anchor[0]) ** 2 + (p[1] - anchor[1]) ** 2; if (d < bd) { bd = d; s0 = i; } });
  const Q = [...P.slice(s0), ...P.slice(0, s0)]; Q.push(Q[0]); const cum = [0]; for (let i = 1; i < Q.length; i++) cum.push(cum[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]));
  const L = cum[cum.length - 1] || 1, o = []; let j = 1; for (let k = 0; k < N; k++) { const s = L * k / N; while (j < cum.length - 1 && cum[j] < s) j++; const t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1); o.push([Q[j - 1][0] + (Q[j][0] - Q[j - 1][0]) * t, Q[j - 1][1] + (Q[j][1] - Q[j - 1][1]) * t]); }
  return o; };

// smooth closed curve through points (Catmull-Rom -> cubic bezier)
export function smooth(pts, closed = true, t = .5) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${P(0)[0].toFixed(1)},${P(0)[1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3], c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (closed ? 'Z' : '');
}

// ---- body bean: shoulders round into the head, widest low, flat-ish bottom ----

// sample the same Catmull-Rom curve smooth() draws, as a dense polyline
export function sampleSmooth(pts, closed = true, per = 14, t = .5) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))], out = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3], c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    for (let k = 0; k < per; k++) { const u = k / per, v = 1 - u;
      out.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]); }
  }
  return out;
}
// Rick-style ink: thin on the lit top-left, thick where the shade falls (bottom-right). Drawn as a filled ring.
export function inkRing(pts, w, { thin = .72, thick = 1.32, light = [-.62, -.78], nib = .5, wob = .06, seed = 1, extra = null, per = 16 } = {}) {   // extra = [dx, dy, amount]: more ink where the edge faces that way (CB 2026-11-11: body bottom-left thicker)
  const S = sampleSmooth(pts, true, per), n = S.length; let cxm = 0, cym = 0;
  for (const [x, y] of S) { cxm += x / n; cym += y / n; }
  const o = [], i = [];
  for (let k = 0; k < n; k++) {
    const a = S[(k - 1 + n) % n], b = S[(k + 1) % n]; let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1;
    let nx = ty / L, ny = -tx / L; if ((S[k][0] - cxm) * nx + (S[k][1] - cym) * ny < 0) { nx = -nx; ny = -ny; }  // outward
    const lit = -(nx * light[0] + ny * light[1]);                       // 1 = faces away from light (shade side)
    let f = thin + (thick - thin) * Math.pow(Math.max(0, (lit + 1) / 2), 1.4);
    f *= (1 - nib * .5) + nib * Math.abs(ty / L);                        // brush nib: up-down strokes thicker than across strokes
    f *= 1 + wob * Math.sin(k * .29 + seed) * Math.sin(k * .07 + seed * 2.3);  // hand-drawn unevenness
    if (extra) f *= 1 + extra[2] * Math.pow(Math.max(0, nx * extra[0] + ny * extra[1]), 1.5);
    const ww = w * f / 2;
    o.push([S[k][0] + nx * ww, S[k][1] + ny * ww]); i.push([S[k][0] - nx * ww * .85, S[k][1] - ny * ww * .85]);
  }
  const poly = A => 'M' + A.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
  return `<path d="${poly(o)}${poly(i.reverse())}" fill="${INK}" fill-rule="evenodd"/>`;
}
// a tapered brush stroke along a quadratic curve (thin ends, fat middle; 'bias' moves the fat part)
export function brush(x0, y0, qx, qy, x1, y1, w, { bias = .5, col = INK, tip = .25 } = {}) {
  const N = 18, L = [], Rr = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, u = 1 - t, x = u * u * x0 + 2 * u * t * qx + t * t * x1, y = u * u * y0 + 2 * u * t * qy + t * t * y1;
    const dx = 2 * u * (qx - x0) + 2 * t * (x1 - qx), dy = 2 * u * (qy - y0) + 2 * t * (y1 - qy), l = Math.hypot(dx, dy) || 1;
    const tt = t < bias ? t / bias : (1 - t) / (1 - bias), h = w / 2 * (tip + (1 - tip) * Math.sin(Math.min(1, tt) * Math.PI / 2));
    L.push([x - dy / l * h, y + dx / l * h]); Rr.push([x + dy / l * h, y - dx / l * h]);
  }
  const pts = L.concat(Rr.reverse());
  return `<path d="M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z" fill="${col}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/>`;
}
// Rick heads are NOT circles: hand-drawn eggs. Bigger end low, slightly tilted, lumpy, one cheek fuller.
// egg > 0 = fuller bottom, < 0 = fuller top; tilt in degrees; lumps = [harmonic, amount, phase]
export const HEADS = {
  rick:   { egg: .085, aspect: 1.0,  tilt: -7, lumps: [[2, .022, .4], [3, .03, 1.9], [5, .012, 3.1]] },
  potato: { egg: .06,  aspect: 1.04, tilt: 9,  lumps: [[2, .035, 2.2], [3, .025, .3], [4, .015, 1.2]] },
  bun:    { egg: .12,  aspect: 1.06, tilt: -4, lumps: [[2, .02, 1.1], [3, .022, 2.6], [5, .01, .2]] },
  egg:    { egg: -.09, aspect: .96,  tilt: 6,  lumps: [[2, .02, 2.9], [3, .028, .9], [4, .012, 2.0]] },
  round:  { egg: 0, aspect: 1, tilt: 0, lumps: [] },
};
export function headPts(cx, hy, R, shape = 'rick', mirror = false) {
  const H = typeof shape === 'string' ? HEADS[shape] : shape, n = 24, P = [], tl = H.tilt * Math.PI / 180;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, sa = Math.sin(a);
    let r = 1 + H.egg * sa;                                  // y-down: sin>0 is the lower half
    for (const [h, amt, ph] of H.lumps) r += amt * Math.sin(h * a + ph);
    let x = Math.cos(a) * r * H.aspect, y = sa * r * .97 - H.egg * .35;   // keep the centre steady
    [x, y] = [x * Math.cos(tl) - y * Math.sin(tl), x * Math.sin(tl) + y * Math.cos(tl)];
    P.push([cx + (mirror ? -x : x) * R, hy + y * R]);
  }
  return mirror ? P.reverse() : P;
}

export function beanPts(cx, top, bot, wTop, wBot, lean = 0) {
  const h = bot - top, P = [];
  const prof = [[0, .0], [.62, .03], [.9, .12], [1, .32], [1.03, .6], [.97, .82], [.78, .95], [.45, 1.0]];
  for (const [w, t] of prof) P.push([cx + lean * t * h + (wTop + (wBot - wTop) * t) * w, top + t * h]);
  P.push([cx + lean * h, bot + 1]);
  for (const [w, t] of prof.slice().reverse()) P.push([cx + lean * t * h - (wTop + (wBot - wTop) * t) * w, top + t * h]);
  return P;
}

// ---- STANDARD FACE KIT (from Rick close-ups; head width W = 200 before the 1.5 head scale) ----
// standard eye = a lid line with the pupil hanging under it (they touch). Brows are uneven brush strokes,
// one flatter, one higher and arched. Mouth = small lens, slightly down, low on the face.
// brows: [raise, tilt, arch] per eye (left, right); tilt > 0 pulls the inner end down
export const FACES = {
  standard:  { eyes: 'lid',   brows: [[0, 1, 1], [4, -1.5, 5]],   mouth: 'lens' },
  open:      { eyes: 'oval',  brows: [[2, 0, 3], [5, -1, 5]],     mouth: 'lens' },
  smirk:     { eyes: 'lid',   brows: [[-1, 2, 1], [7, -3, 6]],    mouth: 'smirk' },
  happy:     { eyes: 'happy', brows: [[5, -2, 5], [7, -2, 6]],    mouth: 'grin' },
  angry:     { eyes: 'lid',   brows: [[-3, 7, 0], [-2, 6, 1]],    mouth: 'flat', lidTilt: 3 },
  sad:       { eyes: 'oval',  brows: [[2, -6, 2], [3, -7, 2]],    mouth: 'frown' },
  surprised: { eyes: 'wide',  brows: [[10, -2, 6], [12, -2, 7]],  mouth: 'o' },
  talk:      { eyes: 'lid',   brows: [[1, 0, 2], [5, -1, 5]],     mouth: 'talk' },
};
export function faceKit(face, fx, ey, turn = 0, mouthY, view = 'front', head = null) {
  if (view === 'back') return [];
  const F = typeof face === 'string' ? { ...FACES[face] } : { ...FACES[(face && face.expr) || 'standard'], ...(face || {}) };
  const o = [], at = Math.abs(turn), dir = Math.sign(turn) || 1;
  if (F.side == null && turn) F.side = dir;   // acting habits (tongue corner, side glance) default to the facing side
  const dx = 28 * (1 - .22 * at);                                   // eyes close up when the head turns
  const look = turn * 3.5;                                         // pupils slide toward the facing side
  for (const [i, s] of [[0, -1], [1, 1]]) {
    const far = s * turn > 0, k = far ? 1 - .3 * at : 1;          // far eye narrower (CB 2026-11-11: physical geometry - the eye toward the head's edge is the far one)
    const ex = fx + s * dx * (far ? 1 - .15 * at : 1);
    const et = Array.isArray(F.eyes) ? F.eyes[i] : F.eyes;
    if (et === 'lid') {
      const ly = ey - 3, lw = 14 * k, pr = 7.6 * k, py = ly + 1, lt = F.lidTilt || 0;
      o.push(`<path d="M${ex + look - pr},${py} A${pr},${10.5} 0 0,0 ${ex + look + pr},${py} Z" fill="${INK}"/>`);
      o.push(brush(ex - s * lw, ly + lt, ex, ly - 1.2 + lt * .4, ex + s * lw, ly, 4.6, { tip: .45 }));   // lid sits right on the pupil
    } else if (et === 'happy') {
      o.push(brush(ex - 10 * k, ey + 4, ex, ey - 13, ex + 10 * k, ey + 4, 5.5, { tip: .5 }));
    } else if (et === 'wide') {
      o.push(`<ellipse cx="${ex}" cy="${ey}" rx="${12 * k}" ry="13" fill="#ffffff" stroke="${INK}" stroke-width="4.3"/><circle cx="${ex + look}" cy="${ey + 1}" r="4.6" fill="${INK}"/>`);
    } else if (EXT.eye[et]) o.push(...EXT.eye[et]({ ex, ey, s, k, look, F }));
    else o.push(`<ellipse cx="${ex + look * .6}" cy="${ey}" rx="${7.8 * k}" ry="11"/>`.replace('/>', ` fill="${INK}"/>`));
    const bi = turn && F.brows && F.brows.length === 2 && dir > 0 ? 1 - i : i;   // CB 2026-11-11: turned head - the bigger brow sits on the near side (centre of the face), the far one is the smaller
    if (F.brows && F.brows[bi]) { const [raise, tilt, arch, bw = 1] = F.brows[bi], by = ey - 21 - raise, L = 13 * k * (bw > 1 ? 1.12 : 1);
    const xi = ex - s * L, xo = ex + s * L, yi = by + tilt, yo = by - tilt * .4;
    o.push(brush(xi, yi, ex + s * 2, (yi + yo) / 2 - arch, xo, yo, 7.2 * bw, { bias: .4, tip: .3 })); }
  }
  const mx = fx + turn * 7, my = ey + (mouthY ?? 41), m = F.mouth, sq = 1 - .25 * at;
  if (m === 'lens') o.push(`<path d="M${mx - 8 * sq},${my + 1.5} Q${mx},${my - 4} ${mx + 8 * sq},${my + 1.5} Q${mx},${my + 4} ${mx - 8 * sq},${my + 1.5} Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  else if (m === 'smirk') o.push(brush(mx - 9 * sq, my, mx + 1, my + 6, mx + 11 * sq, my - 5, 4.6, { bias: .6, tip: .4 }));
  else if (m === 'flat') o.push(brush(mx - 8 * sq, my + 1, mx, my - 1, mx + 8 * sq, my + 1, 4.4, { tip: .45 }));
  else if (m === 'frown') o.push(brush(mx - 9 * sq, my + 3, mx, my - 6, mx + 9 * sq, my + 3, 4.4, { tip: .4 }));
  else if (m === 'o') o.push(`<ellipse cx="${mx}" cy="${my + 2}" rx="${6 * sq}" ry="7.5" fill="${INK}"/>`);
  else if (m === 'talk') o.push(`<path d="M${mx - 12 * sq},${my - 3} Q${mx},${my - 6} ${mx + 12 * sq},${my - 3} Q${mx + 10 * sq},${my + 11} ${mx},${my + 11} Q${mx - 10 * sq},${my + 11} ${mx - 12 * sq},${my - 3} Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="${mx + 1}" cy="${my + 7}" rx="${5.5 * sq}" ry="3" fill="#b8475a"/>`);
  else if (m === 'grin') {
    o.push(`<path d="M${mx - 22 * sq},${my - 6} Q${mx},${my - 1} ${mx + 22 * sq},${my - 6} Q${mx + 17 * sq},${my + 16} ${mx},${my + 16} Q${mx - 17 * sq},${my + 16} ${mx - 22 * sq},${my - 6} Z" fill="${INK}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
    o.push(`<path d="M${mx - 17 * sq},${my - 3.5} Q${mx},${my + 1} ${mx + 17 * sq},${my - 3.5} L${mx + 15 * sq},${my + 3} Q${mx},${my + 7} ${mx - 15 * sq},${my + 3} Z" fill="#ffffff"/>`);
    for (const t of [-8.5, 0, 8.5]) o.push(`<path d="M${mx + t * sq},${my - 1} L${mx + t * sq},${my + 5}" stroke="${INK}" stroke-width="1.8"/>`);
  } else if (EXT.mouth[m]) o.push(...EXT.mouth[m]({ mx, my, sq, F }));
  const hc = head || { cx: fx - turn * 50, hy: ey + 14 };
  for (const f of F.fx || []) if (EXT.fx[f]) o.push(...EXT.fx[f]({ ...hc, fx, ey, dx, turn, F }));
  return o;
}

// VIEWS: front | 34 (body front, face to the side) | side (body + face to the side) | back (no face)
// dir = 1 faces screen-right, -1 faces screen-left
export const VIEWS = { front: 0, '34': .55, side: 1, back: 0 };
export function drawCharacter(S) {
  GID = 0; const defs = [], back = [], mid = [], front = [];
  const view = S.view || 'front', dir = S.dir || 1;
  const cx = S.x ?? 300, R = 100;                       // head is DRAWN at R=100, then scaled by K
  const K = S.headK ?? 1.5;                              // head scale (CB 20:07: heads 50% bigger)
  const turn = (S.turn ?? VIEWS[view]) * dir, at = Math.abs(turn), side = view === 'side';
  const bodyTop = S.bodyTop ?? 333, bodyBot = S.bodyBot ?? 640;
  const wT = (S.wTop ?? 74) * (side ? .78 : 1), wB = (S.wBot ?? 104) * (side ? .8 : 1);
  const headY = bodyTop - R * K * .78;                   // head overlaps the shoulders by .22 R
  const ground = S.ground ?? 900;
  const LEG = (S.legW ?? 17) + 2, lc = INK;   // CB 2026-11-11: limb lines 2 px thicker   // CB 21:53: legs and arms ALWAYS the same colour (ink); S.legs ignored
  // CB 2026-11-11: ink light = the side the face looks to (thin line there); the opposite side and the bottom edge get the heavy line, head and body. Front/back: light from screen-left.
  const INKL = (view === '34' || view === 'side') ? [dir * .95, -.3] : [-.95, -.3];
  const ctx = { view, dir, turn, defs, path, clothGrad, hairFill, smooth, shade, tint, THIN, brush };

  // legs: one line from hip to toe, sharp L at the ankle (LOCKED look 20:18)
  // front/back: feet point outward. 34: body front, feet slightly to the facing side. side: legs close, both feet forward, knees bend.
  const legs = side
    ? [[cx - 16 * dir, cx - 40 * dir, -dir, .7, true], [cx + 14 * dir, cx + 30 * dir, dir, 1, false]]   // CB 2026-11-11: side legs a little more spread
    : [[cx - (S.hipW ?? 13) - 16, cx - 60 - (S.stance ?? 0) + turn * 10, -1, 1, false], [cx + (S.hipW ?? 13) + 16, cx + 58 + (S.stance ?? 0) + turn * 10, 1, 1, false]]   // CB 2026-11-11: legs further apart;
  if (S.behind) { const bh = S.behind({ ...ctx, cx, bodyTop, bodyBot }), live = S.clothLag && S.noLegs, Gc = S.clothG || [0, 1], tip = live && Gc[1] < .8;
    // LIVE: a cape trails the move and hangs to gravity; on a tipped body it lies flat along the back when face down (crawl) and under the body when on the back (lie), never through the floor
    const cl = !live ? 0 : tip ? (side && Gc[0] * dir > 0 ? Math.atan2(dir * 110, 520) * 180 / Math.PI : 0) : Math.max(-22, Math.min(22, Math.atan2(S.clothLag[0] + Gc[0] / Math.max(.25, Gc[1]) * 300, 420) * 180 / Math.PI));
    let open = cl ? [`<g transform="translate(${cx},${bodyTop}) skewX(${cl.toFixed(2)}) translate(${-cx},${-bodyTop})">`] : [], close = cl ? ['</g>'] : [];
    if (live && S.clothFloor) { const F0 = S.clothFloor, T = [-Gc[1], Gc[0]], q = (a, b) => `${(F0[0] + T[0] * a - Gc[0] * b).toFixed(1)},${(F0[1] + T[1] * a - Gc[1] * b + 4).toFixed(1)}`, fid = clip(defs, `M${q(-4000, 0)} L${q(4000, 0)} L${q(4000, 4000)} L${q(-4000, 4000)} Z`);
      open = [`<g clip-path="url(#${fid})">`, ...open]; close = [...close, '</g>']; }
    back.push(...open, ...bh, ...close); }
const KNEE = (a, k, b, r = side ? 48 : 34) => { const f = v => v.toFixed(1), u = (p, q) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, t = Math.min(r, d * .45) / d; return [k[0] + (p[0] - k[0]) * t, k[1] + (p[1] - k[1]) * t]; }, i = u(a, k), o = u(b, k); return `M${f(a[0])},${f(a[1])} L${f(i[0])},${f(i[1])} Q${f(k[0])},${f(k[1])} ${f(o[0])},${f(o[1])} L${f(b[0])},${f(b[1])}`; };   // CB 2026-11-11 23:49: a knee is never a sharp corner, it bends
  let legI = 0; const thighs = [], knees = [];   // CB 2026-11-11 22:28: in a bent pose the thighs are part of the outfit (drawn after the body), ink legs start at the knee
  for (const [hx0, ax0, sd, depth, far] of (S.noLegs ? [] : legs)) {   // S.noLegs: ghosts / floating forms
    if (S.liePose && (S.liePose.art === 'feet' || S.liePose.art === 'head') && !side) {   // 'head' = the same body seen from the head end (film.js turns that card upside down): legs far away, small toes   // LYING SEEN FROM THE FEET (CB 2026-11-12 "perpective"): short legs toward the lens, big round soles on the floor in front
      const onB = S.liePose.lie === 'back', fy = ground - 7 - (S.lieDrop || 0), sx = cx + sd * wB * .5, f = v => v.toFixed(1), nearF = S.liePose.art === 'feet';
      if (!nearF) { back.push(`<ellipse cx="${f(sx)}" cy="${f(bodyTop - 4)}" rx="17" ry="14" fill="${INK}"/>`); legI++; continue; }   // seen from the head: only the far toes show past the chest
      const rx = wB * (onB ? .5 : .44), ry = onB ? rx * 1.65 : rx * .9, cy = fy - ry + 4, tilt = sd * (onB ? 10 : 3);   // on the back: two big soles face the lens, toes up and out; on the belly: two heels up
      const toes = onB ? [-.62, -.3, 0, .3, .55].map((t, i) => `<circle cx="${f(sx + sd * t * rx * .9)}" cy="${f(cy - ry * .93 + Math.abs(t) * rx * .35)}" r="${f(rx * [.2, .22, .24, .27, .32][sd > 0 ? i : 4 - i])}" fill="${INK}"/>`).join('') : '';
      front.push(`<g transform="rotate(${tilt},${f(sx)},${f(cy)})">${toes}<ellipse cx="${f(sx)}" cy="${f(cy)}" rx="${rx}" ry="${ry}" fill="${INK}"/><ellipse cx="${f(sx)}" cy="${f(cy + 8)}" rx="${rx - 13}" ry="${ry - 15}" fill="#5b4c57"/><ellipse cx="${f(sx - sd * 10)}" cy="${f(cy - ry * .4)}" rx="${rx * .3}" ry="${ry * .16}" fill="#ffffff" opacity=".22"/></g>`);
      legI++; continue; }
    if (S.liePose && side && (S.liePose.art || 'side') === 'side') {   // LYING (CB 2026-11-12 "the leg foot need natural also matching view angle"): drawn in body space, the card is then turned flat by film.js
      // floor side = the back (on the back) or the front (on the belly); heels / knees rest on that floor line, both legs one behind the other (far leg darker)
      const Lp = S.liePose, onB = Lp.lie === 'back', fs = onB ? -dir : dir, L0 = ground - 7 - (bodyBot - 20), H = [hx0, bodyBot - 20], xf = cx + fs * (Math.max(wB, R * K * 1.12) - LEG / 2) + (far ? -fs * 4 : 0), f = v => v.toFixed(1);
      let Kn, A, F;
      if (onB && Lp.legs === 'kneeUp' && !far) { A = [xf - fs * 10, H[1] + L0 * .74]; Kn = [cx - fs * L0 * .4, H[1] + L0 * .42]; F = [A[0] + fs * 4, A[1] + 46]; }   // knee up to the sky, foot flat on the floor
      else if (onB) { A = [xf - fs * 8, H[1] + L0 * (far ? .96 : 1)]; Kn = [(H[0] + A[0]) / 2 - fs * 10, (H[1] + A[1]) / 2]; F = [A[0] - fs * (far ? 44 : 52), A[1] + (far ? 24 : 12)]; }   // relaxed: heel on the floor, toes up and falling a little outward
      else if (Lp.legs === 'kick') { Kn = [xf - fs * 6, H[1] + L0 * .55]; A = [Kn[0] - fs * L0 * .44, Kn[1] + (far ? 26 : -30)]; F = [A[0] + fs * 8, A[1] + 34]; }   // belly on a bed: knees down, shins up in the air, crossed, toes pointed
      else { A = [xf - fs * 8, H[1] + L0 * (far ? .97 : 1)]; Kn = [(H[0] + A[0]) / 2 + fs * 4, (H[1] + A[1]) / 2]; F = [A[0] - fs * (far ? 22 : 30), A[1] + 34]; }   // belly: legs along the floor, top of the foot down, soles up
      const d = `${KNEE(H, Kn, A, 40)} L${f(F[0])},${f(F[1])}`, col = far ? shade(lc, .8) : lc;
      back.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="round"/>`, `<path d="${d}" fill="none" stroke="${col}" stroke-width="${LEG - 7}" stroke-linecap="round" stroke-linejoin="round"/>`);
      legI++; continue; }
    const LP = (S.legPose && S.legPose[legI++]) || [0, 0, 0];           // optional motion hook (2026-11-10): per leg [foot dx, foot lift, knee bend]; default = the locked standing legs
    const toe45 = view === 'front' || view === '34', toeUp = view === 'back', T45 = 26;   // CB 2026-11-11: front view toes point 45 deg down and outward (ankle lifted, toe tip on the ground)
    const ax = ax0 + LP[0] - (toe45 ? sd * 6 : 0), top = bodyBot - 20, ay = ground - 7 - LP[1] - (toe45 ? T45 : 0), mx = (hx0 + ax) / 2;
    const knee = (side ? dir * 48 * depth : sd * 6 + (view === '34' ? turn * 14 : 0)) + LP[2];
    const leg = `M${hx0},${top} C${mx + knee},${top + (ay - top) * .3} ${ax + knee * .35},${top + (ay - top) * .72} ${ax},${ay}`;
    const fdir = side ? dir : view === '34' ? (sd === dir ? dir : sd * .6) : sd, fl = side ? 44 : view === '34' && sd === dir ? 40 : 28;
    const tx = view === '34' ? (sd === dir ? dir * 32 : sd * 18) : sd * T45;
    const line = toe45 ? `${leg} L${ax + tx},${ay + T45}` : toeUp ? `${leg} L${ax + sd * T45},${ay - T45}` : `${leg} L${ax + fdir * fl},${ay}`;
    const col = far ? shade(lc, .8) : lc;
    const L0 = ground - 7 - top, span = Math.hypot(ax - hx0, ay - top), cmp = 1 - span / L0, kneelP = !!S.kneelPose, chairP = !!S.chairPose;
    if (S.legPose && cmp > .18) {   // SITTING / KNEELING / CROUCHING (rule 22): thigh = outfit shape hip -> knee, thin ink leg knee -> ankle -> foot
      const c = Math.min(1, cmp); let K, A2, foot, over = false, S0 = null;
      if (side) {
        if (chairP) { K = [hx0 + dir * L0 * .46, top + 4]; A2 = [K[0] + dir * 4, ay]; foot = [A2[0] + dir * 40, ay]; }   // on a chair: thigh level forward, shin straight down
        else if (kneelP && S.kneelOne && sd === dir) { K = [hx0 + dir * L0 * .44, top + 18]; A2 = [K[0] + dir * 6, ay]; foot = [A2[0] + dir * 42, ay]; }   // ONE KNEE UP (CB 2026-11-13, kneel to work): the work-side thigh forward and a little up, shin straight down, foot flat on the floor
        else if (kneelP) { K = [hx0 + dir * 12, ay]; A2 = [K[0] - dir * L0 * .42, ay]; foot = [A2[0] - dir * 8, ay - 22]; }
        else { const a = L0 * .52, mxp = (hx0 + ax) / 2, myp = (top + ay) / 2, dd = Math.max(1, span), h = Math.sqrt(Math.max(0, a * a - (dd / 2) ** 2)), ux = (ax - hx0) / dd, uy = (ay - top) / dd;
          let nx = -uy, ny = ux; if (nx * dir < 0) { nx = -nx; ny = -ny; }   // the knee bends forward, the way he looks
          K = [mxp + nx * h, myp + ny * h]; A2 = [ax, ay]; foot = [ax + dir * 40, ay]; }
      } else {
        // front / 3/4 / back: the thighs come toward the camera, so the knees show just BELOW the body and the feet lower still (closer to the lens)
        const floor = ground - 7 - LP[1], FL = floor + 48;   // the card has ~60 px below the ground line: nothing goes lower than this
        // CB 2026-11-11 23:40 (Rick seated cashier): every limb follows the camera. From the front the thigh points at the lens and is hidden,
        // so NO thigh shape: the ink leg starts ON the lower body (over the outfit) and runs from there to the floor.
        S0 = [hx0 + sd * 6, bodyBot - Math.max(34, (bodyBot - bodyTop) * .16)];
        if (chairP) { const t3 = view === '34' ? dir * 20 : 0; K = [hx0 + sd * 74 + t3, bodyBot + 30]; A2 = [K[0] + sd * 34 + t3, FL - 14]; foot = [A2[0] + (view === '34' ? (sd === dir ? dir * 32 : sd * 18) : sd * T45), FL + (view === 'back' ? 0 : 10)]; }   // shins come toward the lens: long legs, feet low in the frame; 3/4 = knees and feet turn toward the side he faces   // on a chair: out a little from the lower body, then long shins down to the floor, toes 45 out
        else if (kneelP && S.kneelOne && sd === (view === 'back' ? -S.kneelOne : S.kneelOne)) { const t3 = view === '34' ? dir * 14 : 0; K = [hx0 + sd * 62 + t3, bodyBot + 4]; A2 = [K[0] + sd * 10 + t3, FL - 16]; foot = [A2[0] + (view === 'back' ? sd * 22 : sd * T45), view === 'back' ? A2[1] - 22 : FL - 2]; }   // ONE KNEE UP seen from the front / 3/4 / back: that knee out to the work side at hip height, the shin down to a planted foot (closer to the lens)
        else if (kneelP && view === 'back') { K = [hx0 + sd * 12, Math.max(ay - 10, bodyBot + 10)]; A2 = [K[0] + sd * 8, Math.min(ay + 34, FL - 4)]; foot = [A2[0] + sd * 24, A2[1] - 24]; }   // KNEEL from behind (CB 2026-11-12, Rick): the shins lie on the floor coming TOWARD the lens, the soles face us, heels up
        else if (kneelP) { const t3 = view === '34' ? dir : 0; K = [hx0 + sd * 16 + t3 * 16, Math.min(Math.max(ay, bodyBot + 26), FL - 10)]; A2 = t3 ? [K[0] - dir * 30, K[1] - 8] : [K[0] + sd * 3, K[1] - 1]; foot = t3 ? [A2[0] - dir * 4, A2[1] - 16] : [A2[0], A2[1]]; }   // KNEEL front / 3-4 (CB 2026-11-12, Rick Grave Bell): thighs straight down to the knees ON the floor under the hips; the shins go AWAY from the lens, so only a short stub and the toes show behind the knee (3/4: behind, toward the far side). Never out to the side.
        else if (c > .7) { K = [hx0 + sd * 58, top - 46]; A2 = [K[0] + sd * 22, floor + 6]; foot = [A2[0] + sd * T45, A2[1] + T45 * .6]; over = true; }   // on the floor: knees up in front of the belly, feet flat on the floor
        else { K = [hx0 + sd * (44 + 30 * c), Math.min(bodyBot + 44 + 10 * c, FL - 80)]; A2 = [K[0] + sd * 6, Math.min(Math.max(K[1] + 70, ay + 70 * c), FL - T45)]; foot = [A2[0] + sd * T45, A2[1] + T45]; }
      }
      const TW = S.thighW ?? (side ? 52 : 66), H0 = [hx0, top - 6], f = v => v.toFixed(1);
      if (!S0) S0 = [hx0, top];   // CB 2026-11-11 23:44: no pants shapes in any view, only the black leg line, bent the way the camera sees it
      if (view === 'back' && !kneelP) { const fl0 = ground - 7 - LP[1]; A2 = [A2[0], fl0]; foot = [A2[0] + sd * T45, fl0 - T45]; }   // CB 2026-11-11 23:46: from behind the heel is to the lens, so the toe points UP 45 deg and out (same as the standing back view)
      knees.push({ K: [...K], A2: [...A2], hx0, sd, top });   // long outfits (S.skirt) drape over these knees
      if (view === 'back') { back.push(`<path d="${KNEE(S0, K, A2)} L${f(foot[0])},${f(foot[1])}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="round"/>`); continue; }   // from behind the thighs go away from the lens, hidden by the body: the legs come out from under it
      if (S0) { thighs.push({ ink: `${KNEE(S0, K, A2)} L${f(foot[0])},${f(foot[1])}`, col, far }); continue; }   // front / 3/4 / back: ink leg from the lower body
      back.push(`<path d="M${f(H0[0])},${f(H0[1])} L${f(K[0])},${f(K[1])}" stroke="${INK}" stroke-width="${TW + 12}" stroke-linecap="round" fill="none"/>`);
      const shin = `M${f(K[0])},${f(K[1])} L${f(A2[0])},${f(A2[1])} L${f(foot[0])},${f(foot[1])}`;
      thighs.push({ H0, K, TW, shin, col, far, over });
      continue;
    }
    back.push(`<path d="${line}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="${toeUp ? "round" : "miter"}" stroke-miterlimit="4"/>`);
    back.push(`<path d="${line}" fill="none" stroke="${col}" stroke-width="${LEG - 7}" stroke-linecap="round" stroke-linejoin="${toeUp ? "round" : "miter"}" stroke-miterlimit="4"/>`);
  }
  const armPath = (a) => `<path d="${a.d}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${(S.handR ?? 15) + 11}" fill="${INK}"/>`;
  const arms = S.arms ? S.arms({ cx, view, dir, turn }) : {};
  if (arms.back) back.push(armPath(arms.back));

  // LIVE CLOTH (2026-11-12, CB: "we need to work on the character motion again since we add long cloth"): the motion rig draws its own legs (S.noLegs) and passes them here
  // in body coords as S.legsLive [{H, K, A}], plus S.clothG (world down in body coords), S.clothFloor (a point on the floor in body coords) and S.clothLag ([dx, dy] follow-through).
  // Upright: the approved A-line, its hem follows the legs, hangs to gravity, trails the move and never goes through the floor (it piles out instead).
  // Thigh bent past 55 deg (sit, squat, tuck, ride): the approved lap drapes over the rig's knees. Body tipped 35 deg or more (crawl, fall, lie): the cloth wraps the legs and sags to the floor.
  const LL = S.noLegs && S.skirt && S.legsLive && S.legsLive.length ? S.legsLive : null, G0 = S.clothG || [0, 1], LAG = S.clothLag || [0, 0];
  let liveSleeve = false;
  if (LL) {
    if (Math.abs(Math.atan2(G0[0], G0[1])) >= 35 * Math.PI / 180) liveSleeve = true;
    else { const isB = l => { const tx = l.K[0] - l.H[0], ty = l.K[1] - l.H[1]; return (tx * G0[0] + ty * G0[1]) / (Math.hypot(tx, ty) || 1) < Math.cos(55 * Math.PI / 180); };
      const low = S.legLen ? LL.reduce((a, l) => a + 1 - Math.hypot(l.A[0] - l.H[0], l.A[1] - l.H[1]) / S.legLen, 0) / LL.length : 0;
      const allB = LL.every(isB), lowP = low > .3;   // sit / tuck = every thigh bent: the approved lap drapes. Kneel, crouch, lunge = hips low: side view wraps the legs, front view lap drape.
      if (lowP && !allB && side) liveSleeve = true;   // A high knee in a run or a step is neither: the A-line just makes room for it
      const bent = (allB || lowP) && !liveSleeve;
      if (bent) LL.forEach((l, i) => knees.push({ K: [...l.K], A2: [...l.A], hx0: l.H[0], sd: side ? dir : (i ? 1 : -1), top: l.H[1] })); }
  }
  // SIDE KNEEL ON ONE KNEE (CB 2026-11-14 "Yes, fix the kit"; moonrakers Farmer, judge: "leans, not down on one knee"): seen from the side, one knee down on the
  // floor with its shin roughly flat behind, the other thigh forward and bent (knee up, foot planted). The cloth then falls from the hips over the front thigh,
  // drapes past the front knee with a soft hem, wraps ONLY the kneeling thigh (its knee shows), and both shins and the front foot stay bare.
  // KW (0..1) is a product of soft ramps on the leg numbers, so the cloth morphs in and out over the frames the kneel builds or breaks (no pop);
  // KW = 0 on every other pose (standing, walking, running, sitting, both knees down, crawling, lying, front / 3-4 / back), which then draw exactly as before.
  // Short cloth only (smock, tunic, knee-length coat: len <= 130); gowns, robes and long coats keep their leg wrap (LONG CLOTH MOVES WITH THE BODY).
  let KN = null;
  if (LL && side && LL.length === 2 && S.clothFloor && !(S.skirt.mode === 'body') && (S.skirt.len ?? 130) <= 130 && Math.abs(Math.atan2(G0[0], G0[1])) < 35 * Math.PI / 180) {
    const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, un = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, l]; };
    const F0 = S.clothFloor, hgt = p => -((p[0] - F0[0]) * G0[0] + (p[1] - F0[1]) * G0[1]), fwd = [G0[1] * dir, -G0[0] * dir], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    for (const k of [0, 1]) { const kl = LL[k], fl = LL[1 - k], uk = un(kl.H, kl.K), sk = un(kl.K, kl.A), uf = un(fl.H, fl.K);
      const w = ss(.6, .8, dot(uk, G0))    // the kneeling thigh points down (within ~37 deg of the plumb line; a squat or duck-and-cover crouch has it at ~57 deg = no kneel)
        * ss(55, 28, hgt(kl.K))             // its knee is on the floor (a deep lunge or squat keeps it 60-70 px up = no kneel)
        * ss(.75, .5, Math.abs(dot(sk, G0)))   // its shin lies roughly flat
        * ss(.85, .6, dot(uf, G0))          // the other thigh is bent forward (32-53 deg off the plumb line or more)
        * ss(.2, .5, dot(uf, fwd))          // ... toward the way he faces
        * ss(45, 85, hgt(fl.K));            // ... with its knee up off the floor (two knees down = the old wrap)
      const wk = (w - .02) / .98; if (wk > 0 && (!KN || wk > KN.w)) KN = { w: Math.min(1, wk), kl, fl, hgt, fwd, un }; }   // under 2 % = no kneel (a foot touching down in a fall), still continuous
  }
  // LONG OUTFITS (skirt, dress, robe, long coat), CB 2026-11-12 from Rick's "How One Cart Stopped an Entire Army":
  // own piece from the waist down, wider than the body at the hem (A-line), its own colour, dark hem band, folds; legs never drawn over it.
  // Standing: hem below the body, legs come out under it. Bent pose: front/3-4/back = the hem lies across the knees, shins come out below;
  // side = the cloth runs along the thigh, over the round knee and hangs down in front of the shin.
  const skirtSvg = (lap = false) => {
    const SK = lap ? { ...S.skirt, belt: false, top: (S.skirt.top ?? bodyBot - 90) + 40 } : { belt: false, ...S.skirt }, f = v => v.toFixed(1), y0 = SK.top ?? bodyBot - 110, col = SK.col ?? S.coat;
    const Bp = (S.bodyPts ? S.bodyPts({ cx, bodyTop, bodyBot, side, dir, view }) : beanPts(cx + (side ? dir * 4 : 0), bodyTop, bodyBot, wT, wB, S.lean || 0)).filter(([, y]) => y >= y0 - 30);
    const Ball = S.bodyPts ? S.bodyPts({ cx, bodyTop, bodyBot, side, dir, view }) : beanPts(cx + (side ? dir * 4 : 0), bodyTop, bodyBot, wT, wB, S.lean || 0), Fs = side ? dir : 1, cross = [];
    Ball.forEach((p, i) => { const q = Ball[(i + 1) % Ball.length]; if ((p[1] - y0) * (q[1] - y0) <= 0 && p[1] !== q[1]) cross.push(p[0] + (q[0] - p[0]) * (y0 - p[1]) / (q[1] - p[1])); });
    const frMax = Math.max(...Bp.map(([x]) => Fs * (x - cx))) + 4, bkMax = Math.max(...Bp.map(([x]) => -Fs * (x - cx))) + 4;
    const fr = cross.length ? Math.max(...cross.map(x => Fs * (x - cx))) + 3 : frMax, bk = cross.length ? Math.max(...cross.map(x => -Fs * (x - cx))) + 3 : bkMax;   // the waist hugs the body (Rick: the robe flows out of the torso, no step)
    const len = SK.len ?? 130, fl = SK.flare ?? 1.25, curve = SK.curve ?? (side ? 8 : 18), out = [];
    let fill, ink, hemD, folds = [];
    let hemE = null;
    if (liveSleeve) {   // LIVE: crawl / fall / lie - the cloth wraps the legs from the waist, sags toward the floor, is cut at the floor
      const pad = LEG / 2 + 20, sH = len + 20, F = side ? dir : 1, pts = [[cx - F * bk, y0], [cx + F * fr, y0], [cx - F * bk * .9, y0 + 40], [cx + F * fr * .9, y0 + 40]], ends = [];
      for (const l of LL) { const lp = legPath(l, sH); ends.push(lp);
        for (const q of lp.pts) for (let k = 0; k < 8; k++) pts.push([q[0] + Math.cos(k * Math.PI / 4) * pad, q[1] + Math.sin(k * Math.PI / 4) * pad]);
        pts.push([lp.end[0] + G0[0] * 34, lp.end[1] + G0[1] * 34]); }
      let Hh = hull2(pts); if (S.clothFloor) Hh = clipHalf(Hh, S.clothFloor, G0, 4);
      fill = smooth(Hh, true, .35); ink = fill;
      const hw = SK.hemW ?? 34; hemD = ''; hemE = '';
      for (const lp of ends) { const q = lp.end, n = [-lp.tan[1], lp.tan[0]], c = [q[0] - lp.tan[0] * hw / 2, q[1] - lp.tan[1] * hw / 2], e = [q[0] - lp.tan[0] * hw, q[1] - lp.tan[1] * hw];
        hemD += `M${f(c[0] - n[0] * 300)},${f(c[1] - n[1] * 300)} L${f(c[0] + n[0] * 300)},${f(c[1] + n[1] * 300)} `; hemE += `M${f(e[0] - n[0] * 300)},${f(e[1] - n[1] * 300)} L${f(e[0] + n[0] * 300)},${f(e[1] + n[1] * 300)} `;
        const mid = legAt(LL[ends.indexOf(lp)], sH * .5); folds.push(`M${f(mid[0] + n[0] * pad * .5)},${f(mid[1] + n[1] * pad * .5)} L${f(q[0] + n[0] * pad * .6 - lp.tan[0] * 10)},${f(q[1] + n[1] * pad * .6 - lp.tan[1] * 10)}`); }
    } else if (!knees.length || (side && !knees.length)) {   // standing / walking
      let yH = bodyBot + len; const F = side ? dir : 1; let hf = Math.max(fr * fl, frMax * 1.08), hb = Math.max(bk * fl, bkMax * 1.08) * (side ? 1.12 : 1), kf = 0, kb = 0, dX = 0;
      if (LL) {   // LIVE: the hem makes room for the legs (stride, lifted knee), hangs to gravity, trails the move; on the floor it piles out to the sides
        const pad = LEG / 2 + 16, hang = yH;
        const LP = LL.map(l => legPath(l, 1e9, 12).pts).flat().filter(q => q[1] > y0 + 30 && q[1] <= yH + 6);
        for (const q of LP) { const u = F * (q[0] - cx); if (q[1] > yH - 70) { hf = Math.max(hf, u + pad); hb = Math.max(hb, -u + pad); } }   // the hem corners make room for the feet
        for (const q of LP) { const u = F * (q[0] - cx), w = (q[1] - y0) / Math.max(1, yH - y0); if (w < .2 || w > .85 || q[1] < bodyBot + 10) continue;   // under the body the body itself covers the leg
          const den = 2 * w * (1 - w);   // the edge is a curve from waist to hem: its control is set so the curve passes just outside this leg point at the leg point's height (no belly bulge)
          kf = Math.max(kf, (u + pad - (1 - w) ** 2 * fr - w * w * hf) / den); kb = Math.max(kb, (-u + pad - (1 - w) ** 2 * bk - w * w * hb) / den); }
        dX = (G0[0] / (G0[1] || 1)) * (yH - y0) * .5 + LAG[0]; yH += Math.max(-40, Math.min(40, LAG[1]));
        if (S.clothFloor) { const fy = S.clothFloor[1] - 6; if (yH > fy) { const pile = Math.min(55, (yH - fy) * .4); hf += pile; hb += pile; yH = fy; } }
      }
      const xf = cx + F * hf + dX, xb = cx - F * hb + dX;
      const cf = (LL ? Math.max((fr + hf) / 2, Math.min(kf, (fr + hf) / 2 + 90), (16 * (frMax + 6) - 9 * fr - hf) / 6) : Math.max(fr * (1 + (fl - 1) * .3), (4 * (frMax + 6) - fr - hf) / 2)) + dX * F * .5, cb = (LL ? Math.max((bk + hb) / 2, Math.min(kb, (bk + hb) / 2 + 90), (16 * (bkMax + 6) - 9 * bk - hb) / 6) : Math.max(bk * (1 + (fl - 1) * .3), (4 * (bkMax + 6) - bk - hb) / 2)) - dX * F * .5;   // LIVE: the back edge runs straight from the seat to the hem (no round bulge)
      fill = `M${f(cx - F * bk)},${f(y0)} L${f(cx + F * fr)},${f(y0)} Q${f(cx + F * cf)},${f((y0 + yH) / 2)} ${f(xf)},${f(yH)} Q${f((xf + xb) / 2)},${f(yH + curve)} ${f(xb)},${f(yH)} Q${f(cx - F * cb)},${f((y0 + yH) / 2)} ${f(cx - F * bk)},${f(y0)} Z`;
      ink = `M${f(cx + F * fr)},${f(y0)} Q${f(cx + F * cf)},${f((y0 + yH) / 2)} ${f(xf)},${f(yH)} Q${f((xf + xb) / 2)},${f(yH + curve)} ${f(xb)},${f(yH)} Q${f(cx - F * cb)},${f((y0 + yH) / 2)} ${f(cx - F * bk)},${f(y0)}`;
      hemD = `M${f(xf)},${f(yH)} Q${f((xf + xb) / 2)},${f(yH + curve)} ${f(xb)},${f(yH)}`;
      const n = SK.folds ?? 4; for (let i = 1; i <= n; i++) { const t = i / (n + 1), xt = (cx - F * bk) + (cx + F * fr - (cx - F * bk)) * t, xh = xb + (xf - xb) * t; folds.push(`M${f(xt)},${f(y0 + 30)} L${f(xh)},${f(yH + curve * .9 * (1 - (2 * t - 1) ** 2) - 4)}`); }
    } else if (!side) {   // bent, seen from front / 3-4 / back: cloth over the lap, hem across the knees
      const kx = Math.max(...knees.map(k => Math.abs(k.K[0] - cx))), ky = Math.max(...knees.map(k => k.K[1])), hang = SK.lapHang ?? Math.max(70, len * .55);   // CB 2026-11-12 02:13: sitting front a little longer (the cloth hangs well past the knees, longer robes hang longer)
      const shinCap = Math.min(...knees.map(k => k.K[1] + Math.max(20, (k.A2[1] - k.K[1]) * .6))), wH = Math.max(fr * fl, frMax * 1.05, LL ? Math.min(kx + 36, frMax * 2.1) : kx + 36), yH = Math.min(Math.max(ky + hang, y0 + 80), Math.max(shinCap, ky + 20))   /* never past 60 % of the shin: small forms (baby, toddler) keep their feet */, t3 = view === '34' ? dir * 14 : 0;
      const qy = LL ? (y0 + yH) / 2 : y0 + 40, qr = LL ? Math.max(fr, (fr + wH) / 2 * 1.08) : wH, ql = LL ? Math.max(bk, (bk + wH) / 2 * 1.08) : wH;   // LIVE: an A-line over the knees, not a dome
      fill = `M${f(cx - bk)},${f(y0)} L${f(cx + fr)},${f(y0)} Q${f(cx + qr + t3)},${f(qy)} ${f(cx + wH + t3)},${f(yH)} Q${f(cx + t3)},${f(yH + curve)} ${f(cx - wH + t3)},${f(yH)} Q${f(cx - ql + t3)},${f(qy)} ${f(cx - bk)},${f(y0)} Z`;
      ink = fill.replace(/^M[^L]+L/, 'M').replace(/ Z$/, '');
      hemD = `M${f(cx + wH + t3)},${f(yH)} Q${f(cx + t3)},${f(yH + curve)} ${f(cx - wH + t3)},${f(yH)}`;
      if (view !== 'back') for (const k of knees) folds.push(`M${f(cx + (k.K[0] - cx) * .25)},${f(y0 + 40)} Q${f(k.K[0] - k.sd * 6)},${f(k.K[1] - 20)} ${f(k.K[0] - k.sd * 10)},${f(yH + curve * .5 - 6)}`);   // the cloth pulls over each knee
      folds.push(`M${f(cx + t3)},${f(y0 + 60)} L${f(cx + t3)},${f(yH + curve - 8)}`);
    } else {   // bent, side view: along the thigh, over the knee, then hang
      const k = knees.reduce((a, b) => (b.K[0] - a.K[0]) * dir > 0 ? b : a), K = k.K, top = k.top, hang = SK.sideHang ?? Math.max(60, (k.A2[1] - K[1]) * .45);   // the cloth hangs from the knee about half way down the shin
      const ux = K[0] - cx, uy = K[1] - top, ul = Math.hypot(ux, uy) || 1, u = [ux / ul, uy / ul], nU = [u[1] * dir, -u[0] * dir];   // u: hip -> knee, nU: the upper side of the thigh
      const up = nU[1] > 0 ? [-nU[0], -nU[1]] : nU, T = LEG / 2 + 22;
      const kTop = [K[0] + up[0] * T, K[1] + up[1] * T], kFront = [K[0] + u[0] * (T + 6), K[1] + u[1] * (T + 6) + 10], yH = Math.min(K[1] + hang + Math.max(0, uy) * .2, ground - 4);
      const hemF = [kFront[0] + dir * 4, yH], hemB = [K[0] - dir * Math.min(70, ul * .5), yH - 8], seat = [cx - dir * bk * 1.02, Math.max(top + 24, y0 + 60)];
      fill = `M${f(cx - dir * bk)},${f(y0)} L${f(cx + dir * fr)},${f(y0)} Q${f(cx + dir * fr * 1.1)},${f((y0 + kTop[1]) / 2)} ${f(kTop[0] - u[0] * 30)},${f(kTop[1] - u[1] * 30)} Q${f(kFront[0])},${f(kTop[1])} ${f(kFront[0])},${f(kFront[1])} L${f(hemF[0])},${f(hemF[1])} Q${f((hemF[0] + hemB[0]) / 2)},${f(yH + curve)} ${f(hemB[0])},${f(hemB[1])} Q${f(hemB[0] - dir * 10)},${f(K[1] + 6)} ${f(seat[0] + dir * 40)},${f(seat[1] + 8)} Q${f(seat[0])},${f(seat[1] + 6)} ${f(seat[0])},${f(seat[1] - 20)} L${f(cx - dir * bk)},${f(y0)} Z`;
      ink = fill.replace(/^M[^L]+L/, 'M').replace(/ Z$/, '');
      hemD = `M${f(hemF[0])},${f(hemF[1])} Q${f((hemF[0] + hemB[0]) / 2)},${f(yH + curve)} ${f(hemB[0])},${f(hemB[1])}`;
      folds.push(`M${f(kFront[0] - dir * 10)},${f(kFront[1] + 6)} L${f(hemF[0] - dir * 14)},${f(yH - 4)}`, `M${f(K[0] - dir * 24)},${f(K[1] + T)} L${f(K[0] - dir * 30)},${f(yH - 2)}`, `M${f(cx + dir * 10)},${f(y0 + 40)} Q${f((cx + K[0]) / 2)},${f(kTop[1] - 4)} ${f(K[0] - u[0] * 20)},${f(kTop[1] + 6)}`);
    }
    let kb = null;   // SIDE KNEEL (see KN above): the drape, and while the kneel builds or breaks, a morph from the pose's usual cloth into it
    if (KN && !lap) {
      const { kl, fl, hgt, fwd, un } = KN, A = (p, v, s) => [p[0] + v[0] * s, p[1] + v[1] * s], T = LEG / 2 + 22, up = q => hgt(q), lift = (q, m = 6) => { const h = up(q); return h < m ? A(q, G0, h - m) : q; };
      const [ufx, ufy, LF] = un(fl.H, fl.K), uF = [ufx, ufy], nF = [-uF[1], uF[0]], upF = nF[0] * G0[0] + nF[1] * G0[1] > 0 ? [-nF[0], -nF[1]] : nF;   // front thigh, its upper side
      const [ukx, uky, LK] = un(kl.H, kl.K), uK = [ukx, uky], nK0 = [-uK[1], uK[0]], nK = nK0[0] * fwd[0] + nK0[1] * fwd[1] > 0 ? nK0 : [-nK0[0], -nK0[1]];   // kneeling thigh, its front side
      const SL = Math.hypot(fl.A[0] - fl.K[0], fl.A[1] - fl.K[1]), hang = Math.max(26, Math.min(SK.kneelHang ?? len * .55, SL * .3)), lg = [LAG[0] * .4, LAG[1] * .2];
      const K = fl.K, kTop = A(K, upF, T), kFront = A(A(K, uF, LEG / 2 + 10), upF, 4), TT = A(A(fl.H, uF, LF * .55), upF, T), lgv = [lg[0], lg[1]];   // the cloth rounds over the knee, just past the leg line
      const hemF = lift(A(A(A(K, fwd, LEG / 2 + 9), G0, hang * .8), lgv, 1)), hemM = lift(A(A(K, G0, hang), lgv, 1)), hemU = lift(A(A(K, G0, hang * .78), fwd, -(LEG / 2 + 11)));   // a soft round flap hanging off the knee, in front of / behind the shin
      const Ud = lift(A(A(A(fl.H, uF, LF * .52), upF, -T), G0, 14)), C = A(kl.H, uK, LK * (SK.kneelWrap ?? .7)), Tk = LEG / 2 + 17, Cf = lift(A(C, nK, Tk)), Cb = lift(A(C, nK, -Tk));   // the kneeling thigh: a slimmer wrap than the drape, so it still reads as a leg
      const Bk = A(A(kl.H, uK, LK * .32), nK, -(Tk + 6)), seat = A(kl.H, nK, -Tk * .6), Wb = [cx - dir * bk * .7, y0 + 24], Wf = [cx + dir * fr, y0];   // the back runs up the kneeling thigh and in under the body (no bulge past the seat)
      const ring = [Wb, Wf, TT, kTop, kFront, hemF, hemM, hemU, Ud, Cf, Cb, Bk, seat], hemP = [kFront, hemF, hemM, hemU, Ud, Cf, Cb, Bk];
      const kFill = smooth(ring, true, .42), area = ring.reduce((a, p, i) => { const q = ring[(i + 1) % ring.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0), sg = area > 0 ? 1 : -1, hw = SK.hemW ?? 34;
      const hemIn = hemP.slice(1, -1).map((p, i) => { const a = hemP[i], b = hemP[i + 2], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [p[0] - sg * ty / l * hw / 2, p[1] + sg * tx / l * hw / 2]; });
      const kg = { fill: kFill, ink: smooth([Wf, TT, kTop, kFront, hemF, hemM, hemU, Ud, Cf, Cb, Bk, seat, Wb], false, .42), hemD: smooth(hemP.slice(1, -1), false, .42), hemE: smooth(hemIn, false, .42),
        folds: [`M${f(A(A(fl.H, uF, LF * .4), upF, T * .3)[0])},${f(A(A(fl.H, uF, LF * .4), upF, T * .3)[1])} Q${f(A(K, upF, T * .2)[0])},${f(A(K, upF, T * .2)[1])} ${f(A(A(hemF, fwd, -14), G0, -6)[0])},${f(A(A(hemF, fwd, -14), G0, -6)[1])}`,
          `M${f(A(fl.H, uF, LF * .3)[0])},${f(A(fl.H, uF, LF * .3)[1])} L${f(A((Ud.map((v, i) => (v + Cf[i]) / 2)), G0, -8)[0])},${f(A((Ud.map((v, i) => (v + Cf[i]) / 2)), G0, -8)[1])}`,
          `M${f(A(kl.H, uK, LK * .2)[0])},${f(A(kl.H, uK, LK * .2)[1])} L${f(A(A(Cb, nK, Tk * .6), uK, -8)[0])},${f(A(A(Cb, nK, Tk * .6), uK, -8)[1])}`] };
      if (KN.w >= 1) { fill = kg.fill; ink = kg.ink; hemD = kg.hemD; hemE = kg.hemE; folds = kg.folds; }
      else { const w = KN.w, N = 160, anchor = Wf, pa = closedPts(fill), pb = closedPts(kg.fill), sA = sgn(pa), ra = resampleFrom(sA === sgn(pb) ? pa : pa.reverse(), N, anchor), rb = resampleFrom(pb, N, anchor);
        const mp = ra.map((p, i) => [p[0] + (rb[i][0] - p[0]) * w, p[1] + (rb[i][1] - p[1]) * w]), md = 'M' + mp.map(([x, y]) => `${f(x)},${f(y)}`).join('L') + 'Z';
        kb = { w, base: { hemD, hemE, folds }, kg }; fill = md; ink = md; }
    }
    const sc = clip(defs, fill), lo = cx - Math.max(fr, bk) * 1.6, hi = cx + Math.max(fr, bk) * 1.6;
    out.push(path(fill, clothGrad(defs, col, lo, hi), 'none', 0));
    out.push(`<g clip-path="url(#${sc})">`);
    if (SK.pattern) out.push(...SK.pattern({ ...ctx, cx, y0, bent: knees.length > 0, side }));
    if (kb) {   // the morph frames: the usual hem and folds fade out as the kneel's fade in, inside the morphing cloth
      for (const [g, op] of [[kb.base, 1 - kb.w], [kb.kg, kb.w]]) { out.push(...g.folds.map(d => `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity="${(.55 * op).toFixed(3)}" stroke-width="3.5" stroke-linecap="round"/>`));
        if (SK.hem !== false) out.push(`<path d="${g.hemD}" fill="none" stroke="${SK.hem ?? shade(col, .55)}" stroke-opacity="${op.toFixed(3)}" stroke-width="${SK.hemW ?? 34}"/>`, (g.hemE != null ? `<path d="${g.hemE}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-opacity="${(.8 * op).toFixed(3)}"/>` : `<path d="${g.hemD}" transform="translate(0,${-(SK.hemW ?? 34) / 2})" fill="none" stroke="${INK}" stroke-width="3.5" stroke-opacity="${(.8 * op).toFixed(3)}"/>`)); }
    } else {
    out.push(...folds.map(d => `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round"/>`));
    if (SK.hem !== false) out.push(`<path d="${hemD}" fill="none" stroke="${SK.hem ?? shade(col, .55)}" stroke-width="${SK.hemW ?? 34}"/>`, (hemE != null ? `<path d="${hemE}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-opacity=".8"/>` : `<path d="${hemD}" transform="translate(0,${-(SK.hemW ?? 34) / 2})" fill="none" stroke="${INK}" stroke-width="3.5" stroke-opacity=".8"/>`));   // Rick: a dark band along the hem
    }
    out.push(`<path d="${fill}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="22" transform="translate(${f(-INKL[0] * 10)},0)"/></g>`);   // shade away from the light
    out.push(`<path d="${ink}" fill="none" stroke="${INK}" stroke-width="${LINE * .8}" stroke-linecap="round" stroke-linejoin="round"/>`);
    if (SK.belt !== false) out.push(`<path d="M${f(cx - bk)},${f(y0)} Q${f(cx + (side ? dir * 6 : 0))},${f(y0 + 10)} ${f(cx + fr)},${f(y0)}" fill="none" stroke="${SK.belt ?? '#5a3a24'}" stroke-width="16" stroke-linecap="round"/>`, `<path d="M${f(cx - bk)},${f(y0 - 8)} Q${f(cx)},${f(y0 + 2)} ${f(cx + fr)},${f(y0 - 8)} M${f(cx - bk)},${f(y0 + 8)} Q${f(cx)},${f(y0 + 18)} ${f(cx + fr)},${f(y0 + 8)}" fill="none" stroke="${INK}" stroke-width="3.5"/>`);
    return out;
  };
  // body (side view: narrower, belly to the front)
  // CB 2026-11-12 01:54 ("ricks one the bodyform is on the long cloth"): a long coat / robe / dress is the SAME body form, just longer. The bean runs on down
  // to the hem, its lower part may take its own colour and a dark hem band. Sitting front / 3-4 / back: the long body ends just over the knees. Side sitting: body as normal + the lap cloth.
  const SKb = S.skirt && S.skirt.mode === 'body' ? S.skirt : null, sideLap = SKb && side && knees.length;
  let bBot = bodyBot;
  if (SKb && !knees.length) bBot = bodyBot + (SKb.len ?? 130);
  else if (SKb && !side) bBot = Math.min(bodyBot + (SKb.len ?? 130), Math.max(bodyBot + 20, Math.max(...knees.map(k => k.K[1])) + (SKb.lapHang ?? 40)));
  const B = S.bodyPts ? S.bodyPts({ cx, bodyTop, bodyBot: bBot, side, dir, view }) : beanPts(cx + (side ? dir * 4 : 0), bodyTop, bBot, wT, wB, S.lean || 0);   // optional custom silhouette (bodies.mjs)
  const bodyD = smooth(B);
  mid.push(path(bodyD, clothGrad(defs, S.coat, cx - wB, cx + wB), 'none', 0));
  const bodyClip = clip(defs, bodyD);
  const det = [];
  if (view !== 'back') det.push(`<ellipse cx="${cx + 14}" cy="${bodyTop + 6}" rx="${R * K * .7}" ry="${R * K * .26}" fill="#1a1028" opacity=".22"/>`);
  det.push(`<path d="${smooth(B.slice(9, 14).map(([x, y]) => [x + 9, y]), false)}" fill="none" stroke="#ffffff" stroke-opacity=".32" stroke-width="7" stroke-linecap="round"/>`);
  const dcx = cx + (side ? dir * wT * .62 : turn * 34);
  const detFn = view === 'back' && S.backDetails ? S.backDetails : S.details;   // CB 2026-11-11: the back of the outfit is drawn as a back, not a copy of the front
  if (detFn) det.push(...detFn({ ...ctx, cx: dcx, bodyTop, bodyBot, wT, wB, side }));
  if (SKb) {   // lower part of the long body: own colour, folds, pattern, dark hem band, belt at the waist
    const y0 = SKb.top ?? bodyBot - 90, colL = SKb.col ?? S.coat, hw = SKb.hemW ?? 30, f = v => v.toFixed(1), xs = B.map(p => p[0]), x0 = Math.min(...xs) - 10, x1 = Math.max(...xs) + 10;
    if (colL !== S.coat) det.push(`<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(bBot - y0 + 20)}" fill="${clothGrad(defs, colL, x0, x1)}"/>`);
    if (SKb.pattern) det.push(...SKb.pattern({ ...ctx, cx, y0, bent: knees.length > 0, side }));
    const n = SKb.folds ?? 3; for (let i = 1; i <= n; i++) { const t = i / (n + 1), x = x0 + 10 + (x1 - x0 - 20) * t; det.push(`<path d="M${f(cx + (x - cx) * .8)},${f(y0 + 30)} L${f(x)},${f(bBot)}" stroke="${INK}" stroke-opacity=".45" stroke-width="3.2" stroke-linecap="round"/>`); }
    if (SKb.hem !== false && !sideLap) det.push(`<rect x="${f(x0)}" y="${f(bBot - hw)}" width="${f(x1 - x0)}" height="${f(hw + 20)}" fill="${SKb.hem ?? shade(colL, .55)}"/>`, `<path d="M${f(x0)},${f(bBot - hw)} L${f(x1)},${f(bBot - hw)}" stroke="${INK}" stroke-width="3.5" stroke-opacity=".8"/>`);
    if (SKb.belt !== false) det.push(`<rect x="${f(x0)}" y="${f(y0 - 8)}" width="${f(x1 - x0)}" height="16" fill="${SKb.belt ?? '#5a3a24'}"/>`, `<path d="M${f(x0)},${f(y0 - 8)} L${f(x1)},${f(y0 - 8)} M${f(x0)},${f(y0 + 8)} L${f(x1)},${f(y0 + 8)}" stroke="${INK}" stroke-width="3.5"/>`);
  }
  mid.push(`<g clip-path="url(#${bodyClip})">${det.join('')}</g>`);
  const thighFill = S.thighCol ?? S.coat;
  mid.push(inkRing(B, LINE * 1.05, { seed: 2, wob: 0, nib: .15, thin: .55, thick: 1.2, light: INKL, per: 32, extra: [-INKL[0] * .3, .95, 1.0] }));   // CB 2026-11-11: cleaner body edge, a little thicker at the bottom left
  for (const t of thighs.sort((a, b) => (a.far ? 0 : 1) - (b.far ? 0 : 1))) {   // thigh in the outfit colour over the body's bottom ink, so hip and thigh read as one shape; then the shin in ink
    if (t.ink) { (S.skirt ? back : mid).push(`<path d="${t.ink}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="round"/>`); continue; }
    const f = v => v.toFixed(1), d = `M${f(t.H0[0])},${f(t.H0[1] - 20)} L${f(t.K[0])},${f(t.K[1])}`, tg = S.skirt ? back : mid;   // long cloth: thigh and shin go behind it
    if (t.over) tg.push(`<path d="M${f(t.H0[0])},${f(t.H0[1] + 10)} L${f(t.K[0])},${f(t.K[1])}" stroke="${INK}" stroke-width="${t.TW + 12}" stroke-linecap="round" fill="none"/>`);   // knees up in front of the body: the thigh keeps its outline over the coat
    tg.push(`<path d="${d}" stroke="${t.far ? shade(thighFill, .86) : thighFill}" stroke-width="${t.TW}" stroke-linecap="round" fill="none"/>`);
    tg.push(`<path d="${t.shin}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4"/>`);
  }
  if (S.skirt && !SKb) back.push(...skirtSvg());   // CB 2026-11-12 01:58: keep the original body form; the long cloth hangs UNDER / BEHIND it (in front of the legs)
  else if (sideLap) mid.push(...skirtSvg(true));   // CB 2026-11-12 (Rick's cart film: general's robe, samurai coat): a long outfit hangs from the waist over the legs; legs only show below the hem
  if (view === 'back' && S.backOver) mid.push(...S.backOver({ ...ctx, cx, bodyTop, bodyBot }));   // CB 2026-11-11: from behind, a tail grows from the middle of the back, over the body

  for (const a of [].concat(arms.front || [])) (view === 'back' ? back : front).push(armPath(a));   // CB 2026-11-11: seen from the back, the arms are in front of the body (drawn behind it)
  if (S.props && view !== 'back') front.push(...S.props({ ...ctx, cx }));
  const afterHead = S.over && view !== 'back' ? S.over({ ...ctx, cx }) : [];   // props that must sit in front of the head (raised swords, torches)

  // head
  const hy = headY, hstart = front.length, HP = headPts(cx, hy, R, S.head || 'rick', dir < 0), hd = smooth(HP);
  if (S.hairBack) front.push(...S.hairBack({ ...ctx, cx, hy, R }));
  const M = S.meme && view !== 'back' ? S.meme(cx, hy, { view, dir, turn }) : null;   // meme-level expression (memes.mjs)
  if (M && M.under) front.push(...M.under);
  front.push(path(hd, M && M.skin ? `url(#${M.skin})` : skinGrad(defs, cx, hy, R), 'none', 0));
  if (S.faceShadow !== false) {   // CB 2026-11-11 22:15: 3D feel - a light grey shadow inside the head on the side away from the light (same side as the heavy ink)
    const hc = clip(defs, hd), fid = 'fs' + (GID++), ox = (INKL[0] * 30).toFixed(1), oy = (INKL[1] * 30 - 9).toFixed(1);
    defs.push(`<filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>`);
    front.push(`<g clip-path="url(#${hc})"><path d="${hd}" fill="#c9c9ce"/><path d="${hd}" fill="#ffffff" filter="url(#${fid})" transform="translate(${ox},${oy}) scale(1)"/></g>`);
  }
  if (S.extraDefs) defs.push(S.extraDefs);
  const headInkAt = front.length;
  const fx = cx + turn * R * (side ? .4 : .5), ey = hy + (S.eyeY ?? -14);
  if (M) front.push(`<g transform="translate(${(turn * R * (M.turned ? 0 : side ? .34 : .42)).toFixed(1)},${S.memeDy || 0}) translate(${cx},0) scale(${M.turned ? 1 : (1 - .22 * at).toFixed(3)},1) translate(${-cx},0)">${M.over.join('')}</g>`);
 else { const FK = S.faceK ?? (side ? 1.2 : 1.3), fcy = ey + 18, fxs = side ? fx - dir * 8 : fx;   // CB 2026-11-11: eyes, brows and mouth bigger (x1.3 around the face centre)
    front.push(`<g transform="translate(${fxs.toFixed(1)},${fcy.toFixed(1)}) scale(${FK}) translate(${(-fxs).toFixed(1)},${(-fcy).toFixed(1)})">${faceKit(S.face, fx, ey, turn, S.mouthY, view, { cx, hy }).join('')}</g>`); }   // views hook (2026-11-10): a drawn face slides to the facing side and narrows a little, like the rig's own face kit, so 3/4 and side read as turned
  if (S.faceExtras) { const fe = S.faceExtras({ ...ctx, fx, ey, hy, R, cx }); front.push(M || !turn || !S.slideExtras ? fe.join('') : `<g transform="translate(${(turn * R * (side ? .34 : .42)).toFixed(1)},0) translate(${cx},0) scale(${(1 - .22 * at).toFixed(3)},1) translate(${-cx},0)">${fe.join('')}</g>`); }   // same slide as a drawn face, so muzzles, beards and glasses turn with the head
  if (S.hat) front.push(...S.hat({ ...ctx, cx, fx, hy, R }));
  front.splice(headInkAt, 0, inkRing(HP, LINE * 1.12 / K, { seed: 5, wob: 0, nib: .2, thin: .55, thick: 1.2, light: INKL, per: 32, extra: [-INKL[0] * .47, .9, .9] })   /* CB 2026-11-11 22:00: cleaner lines, no wobble */);   // CB 2026-11-11: thicker line under the face (chin)
  const headParts = front.splice(hstart).join('').replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${(+w / Math.sqrt(K)).toFixed(2)}"`);
  const lieArt = S.liePose && S.liePose.art, headG = h => lieArt === 'feet' ? back.unshift(`<g transform="translate(0,${(R * K * 1.15).toFixed(1)})">${h}</g>`) : lieArt === 'head' ? front.push(`<g transform="translate(0,${(R * K * 1.25).toFixed(1)})">${h}</g>`) : front.push(h);   // lying seen from the feet: the head is farthest, behind the belly, only its top half shows; from the head end it is nearest and covers the chest
  // CB 2026-11-15 "x1.1 is good, please make as standard": the whole head group (outline, face, hair, hat) is 1.1x wider than tall; S.headW overrides per character
  headG(`<g transform="translate(${cx},${hy}) scale(${(K * (S.headW ?? 1.1)).toFixed(4)},${K}) rotate(${(M ? M.rot || 0 : 0) + (S.headTilt || 0)}) scale(${M ? M.sx || 1 : 1},${M ? M.sy || 1 : 1}) translate(${-cx},${-hy})">${headParts}</g>`);

  front.push(...afterHead);
  const shadow = S.liePose || S.lieFlat ? '' : `<ellipse cx="${cx + 12}" cy="${ground + (S.shadowDy || 0)}" rx="${side ? 80 : 105}" ry="16" fill="#2a1a1f" opacity=".18"/>`;   // lying: no standing foot shadow (the film lays its own floor shadow)
  const all = shadow + back.join('') + mid.join('') + front.join('');
  return { defs: defs.join(''), body: S.dy ? `<g transform="translate(0,${S.dy})">${all}</g>` : all };
}

export function svgDoc(chars, W, H, bg = 'none') {
  const parts = chars.map(c => drawCharacter(c));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${parts.map(p => p.defs).join('')}</defs>${bg !== 'none' ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${parts.map(p => p.body).join('')}</svg>`;
}

// =====================================================================================
// EXPRESSION PARTS (from Rick's sheets, pushed EXTRA HUGE per CB 20:39). Head space: R = 100.
// =====================================================================================
const PINK = '#c94a5f', BLUE = '#8fd3f4', RED = '#e0453a';
const ell = (x, y, rx, ry, f, st = '', sw = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`;
const P = (d, f = INK, st = INK, sw = 2.2) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const drop = (x, y, sz, col = BLUE) => `<path d="M${x},${y - sz * 1.5} Q${x + sz},${y - sz * .2} ${x + sz},${y + sz * .35} A${sz},${sz} 0 0,1 ${x - sz},${y + sz * .35} Q${x - sz},${y - sz * .2} ${x},${y - sz * 1.5} Z" fill="${col}" stroke="${INK}" stroke-width="3"/><path d="M${x - sz * .45},${y + sz * .1} q0,${sz * .45} ${sz * .3},${sz * .6}" fill="none" stroke="#ffffff" stroke-width="${Math.max(1.6, sz * .22)}" stroke-linecap="round"/>`;
const star4 = (x, y, r, col = '#ffe066') => `<path d="M${x},${y - r} Q${x + r * .18},${y - r * .18} ${x + r},${y} Q${x + r * .18},${y + r * .18} ${x},${y + r} Q${x - r * .18},${y + r * .18} ${x - r},${y} Q${x - r * .18},${y - r * .18} ${x},${y - r} Z" fill="${col}" stroke="${INK}" stroke-width="2.6"/>`;
export const EXT = {
  eye: {
    lidHalf: ({ ex, ey, s, k, look }) => { const ly = ey + 1, pr = 7.2 * k; return [`<path d="M${ex + look - pr},${ly} A${pr},${7} 0 0,0 ${ex + look + pr},${ly} Z" fill="${INK}"/>`, brush(ex - 15 * k, ly, ex, ly - 1.5, ex + 15 * k, ly - .5, 4.8, { tip: .45 })]; },
    angry: ({ ex, ey, s, k, look }) => {   // pupil cut by a lid that slants down to the nose
      const ly = ey - 2, yIn = ly + 7, yOut = ly - 5, xIn = ex - s * 15 * k, xOut = ex + s * 15 * k;
      const lineY = x => yIn + (yOut - yIn) * (x - xIn) / (xOut - xIn), pts = [];
      for (let a = 0; a <= Math.PI * 2 + 1e-6; a += Math.PI / 36) { const x = ex + look + Math.cos(a) * 8.6 * k, y = ey + 2 + Math.sin(a) * 11.5; pts.push([x, Math.max(y, lineY(x))]); }
      return [`<path d="M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z" fill="${INK}"/>`, brush(xIn, yIn, ex, (yIn + yOut) / 2 - 1, xOut, yOut, 5.6, { tip: .45 })];
    },
    bigOval: ({ ex, ey, k, look }) => [ell(ex + look, ey, 10.5 * k, 15, INK), ell(ex + look - 3, ey - 6, 3, 3.6, '#ffffff')],
    dot: ({ ex, ey, k, look }) => [ell(ex + look, ey + 1, 5.6 * k, 6.4, INK)],
    wideXL: ({ ex, ey, k, look }) => [ell(ex, ey, 17 * k, 19, '#ffffff', INK, 4.6), ell(ex + look, ey + 1, 5.8, 6.4, INK)],
    shock: ({ ex, ey, k }) => [ell(ex, ey - 2, 19 * k, 22, '#ffffff', INK, 4.8), ell(ex, ey - 1, 2.8, 3.2, INK)],
    sparkle: ({ ex, ey, k }) => [ell(ex, ey, 12.5 * k, 17, INK), ell(ex - 4 * k, ey - 6, 4.6, 5.4, '#ffffff'), ell(ex + 4 * k, ey + 6, 2.2, 2.4, '#ffffff')],
    happyXL: ({ ex, ey, k }) => [brush(ex - 15 * k, ey + 6, ex, ey - 17, ex + 15 * k, ey + 6, 7, { tip: .45 })],
    squeeze: ({ ex, ey, s, k }) => [brush(ex - s * 12 * k, ey - 10, ex + s * 3 * k, ey - 3, ex + s * 12 * k, ey + 1, 6, { tip: .4 }), brush(ex + s * 12 * k, ey + 1, ex + s * 3 * k, ey + 4, ex - s * 12 * k, ey + 10, 6, { tip: .4 })],
    closed: ({ ex, ey, k }) => [brush(ex - 13 * k, ey, ex, ey + 6, ex + 13 * k, ey, 5.4, { tip: .45 })],
    cry: ({ ex, ey, k }) => [brush(ex - 14 * k, ey + 4, ex, ey - 8, ex + 14 * k, ey + 4, 6.2, { tip: .4 }), brush(ex - 9 * k, ey + 1, ex - 2, ey + 3, ex + 4 * k, ey + 8, 3.5, { tip: .3 })],
    spiral: ({ ex, ey }) => { let d = `M${ex},${ey}`; for (let a = 0; a < Math.PI * 5; a += .3) { const r = 1.3 * a; d += ` L${(ex + Math.cos(a) * r).toFixed(1)},${(ey + Math.sin(a) * r * 1.1).toFixed(1)}`; } return [`<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`]; },
    x: ({ ex, ey, k }) => [brush(ex - 11 * k, ey - 11, ex, ey, ex + 11 * k, ey + 11, 6, { tip: .5 }), brush(ex + 11 * k, ey - 11, ex, ey, ex - 11 * k, ey + 11, 6, { tip: .5 })],
    tearful: ({ ex, ey, k, look }) => [ell(ex + look, ey, 11 * k, 15, INK), ell(ex - 3.5, ey - 6, 3.8, 4.4, '#ffffff'), ell(ex + 3.5, ey + 5, 2, 2.2, '#ffffff'), `<path d="M${ex - 13 * k},${ey + 9} Q${ex},${ey + 17} ${ex + 13 * k},${ey + 9}" fill="none" stroke="${BLUE}" stroke-width="4.5" stroke-linecap="round"/>`],
  },
  mouth: {
    smile: ({ mx, my }) => [P(`M${mx - 16},${my - 4} Q${mx},${my + 2} ${mx + 16},${my - 4} Q${mx + 12},${my + 16} ${mx},${my + 16} Q${mx - 12},${my + 16} ${mx - 16},${my - 4} Z`), ell(mx + 2, my + 11, 7, 3.6, PINK)],
    smileXL: ({ mx, my }) => [P(`M${mx - 30},${my - 8} Q${mx},${my} ${mx + 30},${my - 8} Q${mx + 24},${my + 26} ${mx},${my + 27} Q${mx - 24},${my + 26} ${mx - 30},${my - 8} Z`), ell(mx + 3, my + 18, 13, 6, PINK)],
    smirkXL: ({ mx, my }) => [brush(mx - 20, my - 2, mx + 2, my + 12, mx + 24, my - 10, 6.4, { bias: .62, tip: .35 })],
    flatXL: ({ mx, my }) => [brush(mx - 18, my + 2, mx, my - 2, mx + 18, my + 2, 6, { tip: .45 })],
    smileSmall: ({ mx, my }) => [brush(mx - 12, my - 2, mx, my + 10, mx + 12, my - 2, 5, { tip: .4 })],
    grinXL: ({ mx, my }) => [P(`M${mx - 34},${my - 10} Q${mx},${my - 2} ${mx + 34},${my - 10} Q${mx + 28},${my + 28} ${mx},${my + 30} Q${mx - 28},${my + 28} ${mx - 34},${my - 10} Z`), P(`M${mx - 28},${my - 6} Q${mx},${my + 1} ${mx + 28},${my - 6} L${mx + 25},${my + 5} Q${mx},${my + 11} ${mx - 25},${my + 5} Z`, '#ffffff', 'none', 0), ...[-16, -6, 4, 14].map(t => `<path d="M${mx + t},${my - 2} L${mx + t},${my + 8}" stroke="${INK}" stroke-width="2"/>`), ell(mx + 3, my + 22, 11, 5, PINK)],
    teeth: ({ mx, my, F }) => { const w = (F.teethW || 25), h = (F.teethH || 12); const o = [P(`M${mx - w},${my - h} Q${mx},${my - h - 3} ${mx + w},${my - h} Q${mx + w + 3},${my} ${mx + w},${my + h} Q${mx},${my + h + 3} ${mx - w},${my + h} Q${mx - w - 3},${my} ${mx - w},${my - h} Z`, '#ffffff', INK, 4.4), `<path d="M${mx - w + 1},${my} L${mx + w - 1},${my}" stroke="${INK}" stroke-width="2.4"/>`]; for (let t = -w + w / 3; t < w - 2; t += w / 3) o.push(`<path d="M${mx + t},${my - h + 1} L${mx + t},${my + h - 1}" stroke="${INK}" stroke-width="2.2"/>`); return o; },
    gasp: ({ mx, my }) => [P(`M${mx},${my - 12} C${mx + 17},${my - 12} ${mx + 17},${my + 30} ${mx},${my + 30} C${mx - 17},${my + 30} ${mx - 17},${my - 12} ${mx},${my - 12} Z`), ell(mx + 1, my + 22, 8.5, 5, PINK)],
    gaspXL: ({ mx, my }) => [P(`M${mx},${my - 16} C${mx + 25},${my - 16} ${mx + 25},${my + 42} ${mx},${my + 42} C${mx - 25},${my + 42} ${mx - 25},${my - 16} ${mx},${my - 16} Z`), ell(mx + 1, my + 32, 12, 7, PINK), P(`M${mx - 12},${my - 9} Q${mx},${my - 13} ${mx + 12},${my - 9} L${mx + 10},${my - 4} Q${mx},${my - 7} ${mx - 10},${my - 4} Z`, '#ffffff', 'none', 0)],
    wavy: ({ mx, my, F }) => { const w = F.wavyW || 20; let d = `M${mx - w},${my}`; for (let k = 0; k < 4; k++) d += ` q${w / 4},${k % 2 ? 7 : -7} ${w / 2},0`; return [`<path d="${d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`]; },
    frownXL: ({ mx, my }) => [brush(mx - 22, my + 10, mx, my - 14, mx + 22, my + 10, 6.5, { tip: .35 })],
    wail: ({ mx, my }) => [P(`M${mx - 26},${my + 18} Q${mx - 20},${my - 14} ${mx},${my - 14} Q${mx + 20},${my - 14} ${mx + 26},${my + 18} Q${mx},${my + 8} ${mx - 26},${my + 18} Z`), ell(mx, my + 10, 10, 4.5, PINK)],
    shout: ({ mx, my }) => [P(`M${mx - 30},${my - 10} L${mx + 30},${my - 10} Q${mx + 26},${my + 30} ${mx},${my + 32} Q${mx - 26},${my + 30} ${mx - 30},${my - 10} Z`), P(`M${mx - 26},${my - 7} L${mx + 26},${my - 7} L${mx + 24},${my} L${mx - 24},${my} Z`, '#ffffff', 'none', 0), ell(mx + 2, my + 24, 13, 6, PINK)],
    evil: ({ mx, my }) => { const o = [P(`M${mx - 36},${my - 14} Q${mx},${my + 4} ${mx + 36},${my - 14} Q${mx + 22},${my + 22} ${mx},${my + 22} Q${mx - 22},${my + 22} ${mx - 36},${my - 14} Z`)]; let d = `M${mx - 30},${my - 8}`; for (let k = 0; k < 8; k++) d += ` L${mx - 30 + k * 7.5 + 3.75},${my + (k % 2 ? -1 : 6)}`; d += ` L${mx + 30},${my - 8} Q${mx},${my + 6} ${mx - 30},${my - 8} Z`; o.push(P(d, '#ffffff', 'none', 0)); return o; },
    tongue: ({ mx, my }) => [brush(mx - 16, my - 2, mx, my + 9, mx + 16, my - 2, 5, { tip: .4 }), P(`M${mx - 1},${my + 3} Q${mx - 2},${my + 20} ${mx + 7},${my + 20} Q${mx + 15},${my + 19} ${mx + 13},${my + 2}`, PINK, INK, 3.5)],
    sideways: ({ mx, my }) => [brush(mx - 2, my + 3, mx + 10, my + 3, mx + 20, my - 5, 5, { tip: .4 })],
    tiny: ({ mx, my }) => [ell(mx, my + 2, 4.2, 4.8, INK)],
    kiss: ({ mx, my }) => [brush(mx - 4, my - 6, mx + 8, my - 1, mx - 3, my + 2, 4.2, { tip: .5 }), brush(mx - 3, my + 2, mx + 8, my + 5, mx - 4, my + 10, 4.2, { tip: .5 })],
  },
  fx: {
    sweat: ({ cx, hy }) => [drop(cx + 74, hy - 46, 10)],
    sweats: ({ cx, hy }) => [drop(cx + 78, hy - 50, 11), drop(cx - 82, hy - 30, 8), drop(cx + 92, hy - 14, 6)],
    vein: ({ cx, hy }) => { const x = cx + 58, y = hy - 62, a = (dx1, dy1, dx2, dy2) => `<path d="M${x + dx1},${y + dy1} Q${x + (dx1 + dx2) * .2},${y + (dy1 + dy2) * .2} ${x + dx2},${y + dy2}" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>`; return [a(-4, -14, -4, -4), a(-14, -4, -4, -4), a(4, -14, 4, -4), a(14, -4, 4, -4), a(-4, 14, -4, 4), a(-14, 4, -4, 4), a(4, 14, 4, 4), a(14, 4, 4, 4)]; },
    redMarks: ({ cx, hy }) => [[118, -60, 132, -74], [126, -38, 145, -42], [126, -16, 144, -8], [-118, -60, -132, -74], [-126, -38, -145, -42]].map(([a, b, c, d]) => `<path d="M${cx + a},${hy + b} L${cx + c},${hy + d}" stroke="${RED}" stroke-width="5.5" stroke-linecap="round"/>`),
    steam: ({ cx, hy }) => { const puff = (x, y, s) => { const d = smooth([[x - 18 * s, y + 4 * s], [x - 14 * s, y - 10 * s], [x - 2 * s, y - 15 * s], [x + 12 * s, y - 12 * s], [x + 19 * s, y - 1 * s], [x + 12 * s, y + 11 * s], [x - 3 * s, y + 13 * s], [x - 14 * s, y + 11 * s]]); return P(d, '#e9e6ee', INK, 3.4); }; return [puff(cx - 118, hy - 8, 1.1), puff(cx - 140, hy - 34, .7), puff(cx + 118, hy - 8, 1.1), puff(cx + 140, hy - 34, .7)]; },
    blush: ({ fx, ey, dx }) => [-1, 1].flatMap(s => [ell(fx + s * (dx + 12), ey + 20, 15, 8, '#f39aac'), ...[-6, 0, 6].map(t => `<path d="M${fx + s * (dx + 12) + t - 2},${ey + 23} l4,-7" stroke="#e0607a" stroke-width="2" stroke-linecap="round"/>`)]),
    tears: ({ fx, ey, dx }) => [-1, 1].map(s => `<path d="M${fx + s * dx},${ey + 8} Q${fx + s * (dx + 4)},${ey + 40} ${fx + s * (dx + 2)},${ey + 76}" fill="none" stroke="${BLUE}" stroke-width="9" stroke-linecap="round" opacity=".95"/>`),
    joyTears: ({ fx, ey, dx }) => [drop(fx - dx - 22, ey - 4, 6), drop(fx + dx + 22, ey - 4, 6)],
    sparkles: ({ cx, hy }) => [star4(cx - 112, hy - 66, 13), star4(cx + 116, hy - 52, 16), star4(cx + 96, hy - 98, 9)],
    shockLines: ({ cx, hy }) => [[-.5, 1], [-.25, 1.15], [0, 1.2], [.25, 1.15], [.5, 1]].map(([a, l]) => { const ang = -Math.PI / 2 + a; return `<path d="M${cx + Math.cos(ang) * 112},${hy + Math.sin(ang) * 112} L${cx + Math.cos(ang) * (112 + 28 * l)},${hy + Math.sin(ang) * (112 + 28 * l)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`; }),
    gloom: ({ cx, hy }) => [`<g opacity=".5">${[-48, -32, -16, 0, 16, 32, 48].map(t => `<path d="M${cx + t},${hy - 90 + Math.abs(t) * .5} L${cx + t},${hy - 40}" stroke="#5a5fa8" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`],
    stars: ({ cx, hy }) => [`<ellipse cx="${cx}" cy="${hy - 108}" rx="70" ry="14" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 7" opacity=".6"/>`, star4(cx - 62, hy - 110, 11), star4(cx + 8, hy - 96, 13), star4(cx + 60, hy - 118, 10)],
    zzz: ({ cx, hy }) => [[cx + 92, hy - 70, 14], [cx + 118, hy - 98, 18], [cx + 148, hy - 132, 22]].map(([x, y, z]) => `<path d="M${x - z / 2},${y - z / 2} L${x + z / 2},${y - z / 2} L${x - z / 2},${y + z / 2} L${x + z / 2},${y + z / 2}" fill="none" stroke="${INK}" stroke-width="${z * .26}" stroke-linecap="round" stroke-linejoin="round"/>`),
    exclaim: ({ cx, hy }) => [P(`M${cx + 96},${hy - 150} L${cx + 112},${hy - 150} L${cx + 106},${hy - 108} L${cx + 102},${hy - 108} Z`, RED, INK, 3.5), ell(cx + 104, hy - 96, 7, 7, RED, INK, 3.5)],
    question: ({ cx, hy }) => [`<path d="M${cx + 88},${hy - 136} Q${cx + 92},${hy - 158} ${cx + 110},${hy - 156} Q${cx + 130},${hy - 152} ${cx + 124},${hy - 134} Q${cx + 118},${hy - 124} ${cx + 108},${hy - 120} L${cx + 108},${hy - 108}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`, ell(cx + 108, hy - 94, 5.5, 5.5, INK)],
    heart: ({ cx, hy }) => [P(`M${cx + 108},${hy - 84} C${cx + 86},${hy - 100} ${cx + 92},${hy - 124} ${cx + 108},${hy - 112} C${cx + 124},${hy - 124} ${cx + 130},${hy - 100} ${cx + 108},${hy - 84} Z`, '#f05a78', INK, 3.5)],
  },
};

// 24 expression presets, pushed bigger than Rick's (features ~1.3-1.8x, brows travel further, effects added)
Object.assign(FACES, {
  smug:      { eyes: 'lidHalf', brows: [[-3, 3, 1, 1.15], [15, -5, 9, 1.15]], mouth: 'smirkXL' },
  happy:     { eyes: 'happyXL', brows: [[10, -3, 7], [12, -3, 8]], mouth: 'smileXL' },
  laugh:     { eyes: 'squeeze', brows: [[12, -4, 6], [12, -4, 6]], mouth: 'grinXL', fx: ['joyTears'] },
  cheer:     { eyes: 'happyXL', brows: [[12, -3, 7], [12, -3, 7]], mouth: 'teeth', fx: ['sparkles'] },
  excited:   { eyes: 'sparkle', brows: [[14, -3, 8], [14, -3, 8]], mouth: 'grinXL', fx: ['sparkles'] },
  shy:       { eyes: 'happyXL', brows: [[4, -5, 4], [4, -5, 4]], mouth: 'smileSmall', fx: ['blush'] },
  love:      { eyes: 'closed', brows: [[6, -4, 5], [6, -4, 5]], mouth: 'kiss', fx: ['blush', 'heart'] },
  surprised: { eyes: 'wideXL', brows: [[18, -2, 9, 1.1], [20, -2, 9, 1.1]], mouth: 'gaspXL', fx: ['exclaim'] },
  shocked:   { eyes: 'shock', brows: [[22, -1, 9, 1.1], [22, -1, 9, 1.1]], mouth: 'gaspXL', fx: ['shockLines', 'sweat'] },
  scared:    { eyes: 'shock', brows: [[14, -9, 4], [14, -9, 4]], mouth: 'wavy', fx: ['gloom', 'sweats'], wavyW: 26 },
  worried:   { eyes: 'bigOval', brows: [[12, -12, 3, 1.1], [12, -12, 3, 1.1]], mouth: 'wavy', wavyW: 26, fx: ['sweats'] },
  nervous:   { eyes: 'dot', brows: [[8, -8, 3], [8, -8, 3]], mouth: 'teeth', teethW: 30, teethH: 10, fx: ['sweats'] },
  sad:       { eyes: 'bigOval', brows: [[8, -13, 2, 1.1], [8, -13, 2, 1.1]], mouth: 'frownXL', fx: ['gloom'] },
  crying:    { eyes: 'cry', brows: [[8, -11, 2], [8, -11, 2]], mouth: 'wail', fx: ['tears'] },
  teary:     { eyes: 'tearful', brows: [[8, -10, 2], [8, -10, 2]], mouth: 'wavy', wavyW: 14 },
  angry:     { eyes: 'angry', brows: [[-6, 12, -2, 1.25], [-6, 12, -2, 1.25]], mouth: 'teeth', teethW: 24, teethH: 9, fx: ['vein'] },
  furious:   { eyes: 'squeeze', brows: [[-8, 15, -2, 1.35], [-8, 15, -2, 1.35]], mouth: 'shout', fx: ['steam', 'vein', 'redMarks'] },
  annoyed:   { eyes: 'lidHalf', brows: [[-6, 6, 0, 1.15], [-5, 7, 0, 1.15]], mouth: 'flatXL', fx: ['redMarks', 'vein'] },
  frustrated:{ eyes: 'dot', brows: [[0, 9, 0, 1.15], [0, 9, 0, 1.15]], mouth: 'wavy', fx: ['steam'] },
  skeptical: { eyes: ['lidHalf', 'oval'], brows: [[-6, 5, 0], [18, -3, 9, 1.1]], mouth: 'sideways' },
  confused:  { eyes: ['dot', 'oval'], brows: [[12, -4, 6], [-2, 6, 0]], mouth: 'wavy', wavyW: 14, fx: ['question'] },
  evil:      { eyes: 'angry', brows: [[-4, 14, -3, 1.3], [-4, 14, -3, 1.3]], mouth: 'evil' },
  dizzy:     { eyes: ['spiral', 'x'], brows: null, mouth: 'tongue', fx: ['stars'] },
  sleepy:    { eyes: 'closed', brows: [[-2, 0, 1], [-2, 0, 1]], mouth: 'gasp', fx: ['zzz'] },
  wink:      { eyes: ['happyXL', 'oval'], brows: [[4, -2, 5], [12, -3, 7]], mouth: 'tongue', fx: ['sparkles'] },
});

// ---- ACTING HABITS (CB 2026-11-13 02:21 Bangkok "CHARACTER ACTING & MICRO-EXPRESSION RULES"): small unconscious human habits ----
// tongue out of one mouth corner while concentrating, one eye squinted or shut while aiming, lower lip bitten, one brow up when confused,
// cheeks puffed on a held breath, nervous and proud smiles. F.side picks the corner / eye (1 = screen right, -1 = screen left; default = facing side).
Object.assign(EXT.eye, {
  squint: ({ ex, ey, s, k, look }) => { const ly = ey + 1, pr = 7.4 * k; return [`<path d="M${ex + look - pr},${ly} A${pr},${6.5} 0 0,0 ${ex + look + pr},${ly} Z" fill="${INK}"/>`, brush(ex - s * 15 * k, ly + 3, ex, ly - 2.5, ex + s * 14 * k, ly - 1, 6.2, { tip: .4 }), brush(ex - 9 * k, ly + 9.5, ex, ly + 6.5, ex + 9 * k, ly + 9, 3, { tip: .35 })]; },
  shut: ({ ex, ey, s, k }) => [brush(ex + s * 13 * k, ey - 6, ex - s * 2 * k, ey, ex - s * 12 * k, ey + 2, 5.2, { tip: .4 }), brush(ex - s * 12 * k, ey + 2, ex - s * 2 * k, ey + 5, ex + s * 12 * k, ey + 9, 4.6, { tip: .4 }), `<path d="M${ex + s * 17 * k},${ey - 8} l${s * 5},-3 M${ex + s * 18 * k},${ey + 2} l${s * 6},0 M${ex + s * 17 * k},${ey + 11} l${s * 5},3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`],
  lookSide: ({ ex, ey, k, F }) => { const c = F.side || 1; return [`<path d="M${ex - 9 * k},${ey - 3} A${9 * k},10 0 0,0 ${ex + 9 * k},${ey - 3} Z" fill="#ffffff" stroke="${INK}" stroke-width="3.4"/>`, ell(ex + c * 5 * k, ey + 1, 4.2 * k, 5, INK), brush(ex - 11 * k, ey - 3, ex, ey - 5, ex + 11 * k, ey - 3, 4.4, { tip: .45 })]; },
});
Object.assign(EXT.mouth, {
  tongueCorner: ({ mx, my, sq, F }) => { const c = F.side || 1, tx = mx + c * 9 * sq;
    return [brush(mx - 12 * sq, my + 1, mx - c * 2, my - 2, mx + 12 * sq, my - 1, 4.6, { tip: .4 }),
      P(`M${tx - c * 4},${my - 1} Q${tx + c * 2},${my + 13} ${tx + c * 9},${my + 9} Q${tx + c * 14},${my + 5} ${tx + c * 7},${my - 2} Z`, PINK, INK, 3.2),
      `<path d="M${tx + c * 3},${my + 1} q${c * 2},4 ${c * 3},6" fill="none" stroke="#9e3247" stroke-width="1.8" stroke-linecap="round"/>`]; },
  lipBite: ({ mx, my, sq }) => [brush(mx - 13 * sq, my - 1, mx, my - 6, mx + 13 * sq, my - 1, 4.4, { tip: .4 }),
    P(`M${mx - 7 * sq},${my - 3} L${mx + 7 * sq},${my - 3} L${mx + 6.5 * sq},${my + 4} Q${mx},${my + 5.5} ${mx - 6.5 * sq},${my + 4} Z`, '#ffffff', INK, 2.6), `<path d="M${mx},${my - 3} L${mx},${my + 4.5}" stroke="${INK}" stroke-width="1.8"/>`,
    brush(mx - 10 * sq, my + 6, mx, my + 10, mx + 10 * sq, my + 6, 3.6, { tip: .4 })],
  pressed: ({ mx, my, sq }) => [brush(mx - 7 * sq, my + 1, mx, my - 1, mx + 7 * sq, my + 1, 4.6, { tip: .5 }), `<path d="M${mx - 9 * sq},${my - 3} q-2,4 0,8 M${mx + 9 * sq},${my - 3} q2,4 0,8" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`],
  nervous: ({ mx, my, sq }) => { const w = 15 * sq, h = 6; const o = [P(`M${mx - w},${my - h + 2} Q${mx},${my - h - 2} ${mx + w},${my - h} Q${mx + w + 2},${my} ${mx + w - 1},${my + h - 1} Q${mx},${my + h + 2} ${mx - w + 1},${my + h + 1} Q${mx - w - 2},${my + 1} ${mx - w},${my - h + 2} Z`, '#ffffff', INK, 3.6), `<path d="M${mx - w + 1},${my} L${mx + w - 1},${my}" stroke="${INK}" stroke-width="2"/>`]; for (const t of [-.5, 0, .5]) o.push(`<path d="M${mx + t * w},${my - h + 1} L${mx + t * w},${my + h}" stroke="${INK}" stroke-width="1.8"/>`); return o; },
  proud: ({ mx, my, sq }) => [brush(mx - 15 * sq, my - 4, mx + 1, my + 9, mx + 15 * sq, my - 6, 5.2, { bias: .55, tip: .35 }), `<path d="M${mx + 15 * sq},${my - 6} q3,-1 4,-4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`],
});
Object.assign(EXT.fx, {
  puff: ({ fx, ey, dx }) => [-1, 1].flatMap(s => [`<path d="M${fx + s * (dx + 4)},${ey + 22} q${s * 12},6 ${s * 4},20" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`, ell(fx + s * (dx + 2), ey + 31, 10, 6, '#f6c3cd')]),
  held: ({ cx, hy }) => [ell(cx + 104, hy - 84, 5, 5, '#ffffff', INK, 2.6), ell(cx + 118, hy - 102, 7, 7, '#ffffff', INK, 2.6)],
});
// presets: use as face 'k:<name>' in film.json acts. Mouth corner and squinted eye follow F.side.
Object.assign(FACES, {
  think:        { eyes: 'lookSide', brows: [[-2, 3, 1], [10, -3, 7]], mouth: 'sideways' },
  concentrate:  { eyes: ['squint', 'lid'], brows: [[-5, 8, 0, 1.1], [-1, 6, 1, 1.1]], mouth: 'tongueCorner', side: 1 },
  aim:          { eyes: ['shut', 'lid'], brows: [[-7, 6, -1, 1.1], [3, 3, 2]], mouth: 'tongueCorner', side: 1 },
  lipBite:      { eyes: 'lid', brows: [[3, -5, 3], [5, -6, 3]], mouth: 'lipBite' },
  holdBreath:   { eyes: 'oval', brows: [[6, -3, 4], [8, -3, 5]], mouth: 'pressed', fx: ['puff'] },
  browUp:       { eyes: ['lidHalf', 'oval'], brows: [[-4, 4, 0], [16, -3, 9, 1.1]], mouth: 'flat' },
  frozenTongue: { eyes: 'wide', brows: [[11, -2, 6], [13, -2, 7]], mouth: 'tongueCorner', side: 1 },
  glanceCam:    { eyes: 'oval', brows: [[6, -6, 3], [8, -7, 3]], mouth: 'tongueCorner', side: 1, fx: ['sweat'] },
  nervousSmile: { eyes: 'dot', brows: [[7, -8, 3], [9, -8, 3]], mouth: 'nervous', fx: ['sweat'] },
  proud:        { eyes: 'happy', brows: [[8, -2, 6], [12, -3, 8]], mouth: 'proud' },
  slyWink:      { eyes: ['happy', 'lidHalf'], brows: [[-2, 4, 1, 1.1], [14, -4, 8, 1.1]], mouth: 'proud' },   // moonrakers 2026-11-13 (CB 'add all four'): one eye shut as a curved line, the other open under a half lid, sly half-smile, no tongue. 'wink' stays the old cartoon wink (tongue, sparkles): roller coaster uses k:wink.
});
