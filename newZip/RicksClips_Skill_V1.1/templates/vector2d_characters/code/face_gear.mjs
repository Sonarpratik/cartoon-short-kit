// FACE GEAR v1: beards, moustaches, face accessories, tattoos and face paint for the vector cast
// (CB 2026-11-12 03:23 Bangkok: "now beard. face accessoires. tattoo , painting, etc.").
//   withFace(spec, { beard: 'full', stache: 'handlebar', acc: ['roundGlasses', 'hoop'], marks: ['warStripes'], col: '#6b4423' })
// Use it AFTER withHair / withGear: everything goes into spec.faceTop (over the face, under hair, hats and helmets).
// Rick grammar (cart-army commander, red-beard soldier, glasses soldier): the face stays clean white and the MOUTH IS NEVER COVERED;
// a beard is one inked shape that hugs the jaw and hangs BELOW the head, flat colour with a soft gradient and a few short dark ticks, ragged lower edge;
// glasses are thin ink rings over the eyes. Paint and tattoos are flat colour ON the skin (multiply), clipped to the head, never over eyes or mouth ink.
// Layers: marks (paint, tattoos) -> beard (fixed on the jaw) -> moustache -> accessories. Head space: centre 0,0, radius 100, eyes (+-40,-19), mouth (0,34).
// 3/4 and side: paint, tattoos, moustaches, glasses slide with the eyes and mouth (VIEW_RULES 2); beards and earrings stay on the head.
import { INK, shade, tint, headPts } from './char2d.mjs';
import { HAIR_STYLES } from './hair_lib.mjs';
const f = v => (+v).toFixed(1);
let GID = 0;
const vol = c => { if (!/^#[0-9a-fA-F]{6}$/.test(c)) return ['', c]; const id = 'fg' + (GID++); return [`<defs><linearGradient id="${id}" x1="0.15" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${tint(c, .32)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, .74)}"/></linearGradient></defs>`, `url(#${id})`]; };
const P = (d, fill, sw = 7, extra = '') => { const [df, fl] = vol(fill); return df + `<path d="${d}" fill="${fl}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`; };
const F = (d, fill, op = 1, extra = '') => `<path d="${d}" fill="${fill}"${op < 1 ? ` fill-opacity="${op}"` : ''} ${extra}/>`;   // flat paint, no ink
const L = (d, sw = 3.4, col = INK, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;
const ring = (x, y, r, fill, sw = 5, col = INK) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${col}" stroke-width="${sw}"/>`;
const dot = (x, y, r, fill) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
const ell = (x, y, rx, ry, fill, sw = 0, rot = 0) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const rnd = s => { let x = s * 9301 + 49297; return () => (x = (x * 9301 + 49297) % 233280) / 233280; };
const star = (x, y, r, fill, n = 5) => F('M' + [...Array(n * 2)].map((_, k) => { const a = -Math.PI / 2 + k * Math.PI / n, q = k % 2 ? r * .45 : r; return f(x + Math.cos(a) * q) + ',' + f(y + Math.sin(a) * q); }).join(' L') + ' Z', fill);
const GOLD = '#f2c230', RED = '#d8473c', TAT = '#31465c', BLACK = '#2a2630', WHITE = '#f6f4f0';

// ============ BEARDS ============  fixed on the jaw. b({ view, col }) -> svg[]
// one generator: y0 = where it leaves the head edge at the sides, top = inner edge under the mouth (>= 56 keeps the mouth free),
// len = lowest point, w = half width at the bottom, edge = lower edge type, ticks = number of short dark strand ticks
function beardShape(view, col, o) {
  const { y0 = 38, top = 70, len = 150, w = 70, edge = 'ragged', ticks = 15, seed = 3, sw = 7.5 } = o, r = rnd(seed), dk = shade(col, .58), out = [];
  const xe = y => Math.sqrt(Math.max(0, 100 * 100 - y * y)) - 3;       // FIT v2: ON the head outline at height y, never outside it
  const bottom = (x0, x1) => { const n = edge === 'ragged' ? 7 : edge === 'fork' ? 4 : 1, pts = [];
    if (edge === 'point') return `Q${f(x0 * .7)},${f(len * .82)} ${f((x0 + x1) / 2)},${f(len)} Q${f(x1 * .7 + (x0 + x1) * .15)},${f(len * .82)} `;
    if (edge === 'round') return `C${f(x0)},${f(len + 6)} ${f(x1)},${f(len + 6)} `;
    if (edge === 'square') return `L${f(x0 * .96)},${f(len)} L${f(x1 * .96)},${f(len)} `;
    for (let k = 0; k <= n * 2; k++) { const t = k / (n * 2), x = x0 + (x1 - x0) * t, arch = Math.sin(t * Math.PI); pts.push(`L${f(x)},${f((edge === 'fork' ? len * .8 : len * .84) + arch * len * .1 + (k % 2 ? (edge === 'fork' ? len * .2 : 13 + r() * 9) : 0))}`); }
    return pts.join(' ') + ' '; };
  if (view === 'side') { const xf = xe(y0 + 26) - 2, xb = -8;
    out.push(P(`M${f(xf)},${f(y0 + 26)} Q${f(xf + 1)},${f((y0 + len) / 2)} ${f(w * .5 + 42)},${f(len * .86)} ${bottom(w * .5 + 42, 6)}${edge === 'ragged' || edge === 'fork' ? '' : `${f(6)},${f(len * .8)} `}Q${f(xb - 18)},${f(len * .5)} ${f(xb - 6)},${f(y0 - 12)} L${f(xb + 16)},${f(y0 - 14)} Q${f(xb + 30)},${f(top + 6)} ${f(56)},${f(top + 4)} Q${f(xf - 14)},${f(top + 2)} ${f(xf)},${f(y0 + 26)} Z`, col, sw));
    for (let k = 0; k < ticks; k++) { const x = 6 + r() * 70, y = top + 16 + r() * Math.max(8, len * .8 - top - 26); out.push(L(r() < .55 ? `M${f(x)},${f(y)} l4,11 l4,-11` : `M${f(x)},${f(y)} l${f(-3 + r() * 6)},${f(9 + r() * 7)}`, 2.8, dk, .9)); }
    return out; }
  if (view === 'back') return o.backShow ? [P(`M${f(-w * .8)},88 ${bottom(-w * .8, w * .8)}${edge === 'ragged' || edge === 'fork' ? '' : `${f(w * .8)},88 `}L${f(w * .8)},88 Z`, col, sw)] : [];
  const xs = xe(y0);
  out.push(P(`M${f(-xs)},${f(y0)} Q${f(-xs + 2)},${f((y0 + len) / 2)} ${f(-w)},${f(len * .84)} ${bottom(-w, w)}${edge === 'ragged' || edge === 'fork' ? '' : `${f(w)},${f(len * .84)} `}Q${f(xs - 2)},${f((y0 + len) / 2)} ${f(xs)},${f(y0)} Q${f(70)},${f(top + 2)} 0,${f(top)} Q${f(-70)},${f(top + 2)} ${f(-xs)},${f(y0)} Z`, col, sw));
  for (let k = 0; k < ticks; k++) { const x = (-.8 + r() * 1.6) * w, y = top + 18 + r() * Math.max(8, len * .8 - top - 28); out.push(L(r() < .55 ? `M${f(x)},${f(y)} l4,11 l4,-11` : `M${f(x)},${f(y)} l${f(-3 + r() * 6)},${f(9 + r() * 7)}`, 2.8, dk, .9)); }
  return out;
}
const B = {};
const mk = (label, era, o) => Object.assign(({ view, col }) => beardShape(view, o.col || col, o), { label, era });
B.full       = mk('Full beard', 'any era: soldier, lumberjack, sailor', { len: 150, w: 66 });
B.short      = mk('Short boxed beard', 'today: barista, dad, office', { len: 118, w: 68, edge: 'round', top: 66, ticks: 9, y0: 30 });
B.long       = mk('Long beard', 'old: prophet, hermit, prospector', { len: 215, w: 62, ticks: 16, seed: 7 });
B.wizard     = mk('Wizard beard', 'fantasy, old sage', { len: 260, w: 40, edge: 'point', ticks: 18, seed: 11, col: '#e9e6df' });
B.viking     = mk('Forked Viking beard', '800-1100 Norse', { len: 200, w: 60, edge: 'fork', ticks: 12, seed: 5 });
B.goatee     = ({ view, col }) => view === 'back' ? [] : view === 'side' ? [P('M88,52 Q104,96 70,128 Q52,96 58,60 Q72,62 88,52 Z', col, 7), L('M72,76 l2,14 M80,90 l-2,12', 2.8, shade(col, .58))] : [P('M-30,62 Q0,52 30,62 Q30,112 0,136 Q-30,112 -30,62 Z', col, 7), L('M-8,78 l2,14 M10,84 l-2,14 M0,104 l0,12', 2.8, shade(col, .58))];
Object.assign(B.goatee, { label: 'Goatee', era: 'today, 1990s, musketeer with a moustache' });
B.soulPatch  = ({ view, col }) => view === 'back' ? [] : view === 'side' ? [P('M74,54 Q86,56 86,70 Q78,84 70,68 Z', col, 5.5)] : [P('M-11,54 Q0,50 11,54 Q10,74 0,82 Q-10,74 -11,54 Z', col, 5.5)];
Object.assign(B.soulPatch, { label: 'Soul patch', era: '1950s jazz, 2000s' });
B.chinstrap  = ({ view, col }) => view === 'back' ? [] : view === 'side' ? [P('M-4,0 L12,0 Q22,62 56,74 Q78,76 92,50 L100,58 Q88,98 54,98 Q4,92 -4,0 Z', col, 6.5)] : [P('M-98,6 L-84,8 Q-76,82 0,90 Q76,82 84,8 L98,6 Q98,104 0,110 Q-98,104 -98,6 Z', col, 6.5)];
Object.assign(B.chinstrap, { label: 'Chin strap', era: 'today, 2000s' });
B.muttonChops = ({ view, col }) => view === 'back' ? [] : view === 'side' ? [P('M-8,-10 L14,-12 Q30,40 70,52 L64,84 Q8,84 -14,40 Z', col, 7), L('M10,30 l4,12 M30,54 l6,10', 2.8, shade(col, .58))] : [-1, 1].flatMap(s => [P(`M${s * 99},-6 L${s * 84},-4 Q${s * 76},40 ${s * 34},58 L${s * 40},90 Q${s * 98},84 ${s * 99},30 Z`, col, 7), L(`M${s * 84},30 l${-s * 4},12 M${s * 70},62 l${-s * 6},10`, 2.8, shade(col, .58))]);
Object.assign(B.muttonChops, { label: 'Mutton chops', era: '1800s: general, banker, sea captain' });
// SIDE WHISKERS (CB 2026-11-14, goldrush Shopkeeper: "Yes, all three fixes"): short neat sideburns of the 1840s on a clean-shaven face. Front / 3/4: a narrow strip
// ON the head outline from the temple to the upper cheek (never wider than the head, VIEW_RULES 33), stopping well above the jaw. Side: a short strip just in front of the
// hairline, ending above the jaw line, so the cheek, the eye and the mouth stay open (the mutton chops covered half the side face). Back: hidden by the hair.
B.sideWhiskers = ({ view, col }) => { const dk = shade(col, .58); if (view === 'back') return [];
  if (view === 'side') return [P('M-17,-6 L0,-4 Q3,14 0,30 Q-6,37 -12,32 Q-18,12 -17,-6 Z', col, 6), L('M-9,4 l1,10', 2.6, dk)];
  return [-1, 1].flatMap(s => [P(`M${s * 97},-26 L${s * 80},-24 Q${s * 77},4 ${s * 79},30 Q${s * 86},40 ${s * 94},32 Q${s * 101},2 ${s * 97},-26 Z`, col, 6), L(`M${s * 88},-10 l${-s * 1},11 M${s * 87},12 l${-s * 1},10`, 2.6, dk)]); };
Object.assign(B.sideWhiskers, { label: 'Short side whiskers', era: '1830s-1860s: merchant, clerk, gentleman (clean-shaven face, short sideburns)' });
B.stubble    = ({ view }) => { const r = rnd(4), o = []; if (view === 'back') return o; for (let k = 0; k < 70; k++) { const a = Math.PI * (.08 + r() * .84), q = 58 + r() * 40, x = Math.cos(a) * q * (view === 'side' ? .5 : 1) + (view === 'side' ? 48 : 0), y = Math.sin(a) * q + 2; if (y > 44 && Math.hypot(x * (view === 'side' ? 1 : 1), y) < 99 && !(Math.abs(x - (view === 'side' ? 70 : 0)) < 26 && y < 58)) o.push(dot(x, y, 1.9, '#6a6470')); } return [`<g opacity=".75">${o.join('')}</g>`]; };
Object.assign(B.stubble, { label: 'Stubble', era: 'today: detective, tired dad' });
B.pharaoh    = ({ view }) => view === 'back' ? [] : [P(view === 'side' ? 'M40,96 L64,92 L70,178 Q58,188 48,178 Z' : 'M-14,96 L14,96 L18,180 Q0,192 -18,180 Z', '#2f4f9a', 6), ...[0, 1, 2, 3].map(k => L(view === 'side' ? `M${f(43 + k * .6)},${112 + k * 18} L${f(65 + k)},${110 + k * 18}` : `M${f(-15 - k)},${112 + k * 18} L${f(15 + k)},${112 + k * 18}`, 4, GOLD))];
Object.assign(B.pharaoh, { label: 'Pharaoh false beard', era: 'ancient Egypt' });
B.santa      = mk('Santa beard', 'Christmas, grandpa', { len: 186, w: 74, edge: 'round', top: 58, ticks: 0, col: '#f4f2ee', y0: 10 });
B.braided    = ({ view, col }) => view === 'back' ? [] : [...beardShape(view, col, { len: 128, w: 58, ticks: 5 }), ...(view === 'side' ? [[52, 0]] : [[-26, 0], [26, 0]]).flatMap(([x]) => [...[0, 1, 2, 3].map(k => `<ellipse cx="${f(x + (k % 2 ? 3 : -3))}" cy="${f(132 + k * 17)}" rx="10" ry="11" fill="${col}" stroke="${INK}" stroke-width="5"/>`), ring(x, 204, 7, GOLD, 4)])];
Object.assign(B.braided, { label: 'Braided beard', era: 'Viking, dwarf, pirate' });
export const BEARDS = B;

// ============ MOUSTACHES ============  slide with the mouth. s({ col }) -> svg[] (front coords, centre 0,20)
const S = {};
const st = (label, era, fn) => Object.assign(fn, { label, era });
S.chevron    = st('Chevron', '1970s-80s: cop, dad, pilot', ({ col }) => [P('M-34,24 Q-20,6 0,10 Q20,6 34,24 Q16,22 0,24 Q-16,22 -34,24 Z', col, 5.5)]);
S.handlebar  = st('Handlebar', '1890s: strongman, barber, villain', ({ col }) => [P('M0,14 Q-22,4 -40,18 Q-52,24 -56,8 Q-64,30 -44,32 Q-20,34 0,22 Q20,34 44,32 Q64,30 56,8 Q52,24 40,18 Q22,4 0,14 Z', col, 5.5)]);
S.walrus     = st('Walrus', '1900s: general, professor, grandpa', ({ col }) => [P('M-38,12 Q0,-4 38,12 Q46,34 34,50 Q24,38 12,48 Q0,38 -12,48 Q-24,38 -34,50 Q-46,34 -38,12 Z', col, 6), L('M-18,18 l-2,16 M0,16 l0,18 M18,18 l2,16', 2.6, shade(col, .58))]);
S.pencil     = st('Pencil', '1930s: film star, con man, waiter', ({ col }) => [L('M-28,19 Q-14,12 -3,17 M3,17 Q14,12 28,19', 9, INK), L('M-28,19 Q-14,12 -3,17 M3,17 Q14,12 28,19', 4.5, col)]);
S.horseshoe  = st('Horseshoe', '1970s-80s: biker, wrestler, trucker', ({ col }) => [P('M-34,10 Q0,-2 34,10 L38,74 L22,74 L20,26 Q0,18 -20,26 L-22,74 L-38,74 Z', col, 6)]);
S.fuManchu   = st('Long thin drooping', 'old East Asia: sage, official', ({ col }) => [L('M-6,16 Q-30,12 -34,40 Q-36,80 -30,112 M6,16 Q30,12 34,40 Q36,80 30,112', 10, INK), L('M-6,16 Q-30,12 -34,40 Q-36,80 -30,112 M6,16 Q30,12 34,40 Q36,80 30,112', 5, col)]);
S.dali       = st('Upturned needle', '1930s artist, magician', ({ col }) => [L('M-4,18 Q-30,24 -44,-2 Q-48,-22 -40,-40 M4,18 Q30,24 44,-2 Q48,-22 40,-40', 8.5, INK), L('M-4,18 Q-30,24 -44,-2 Q-48,-22 -40,-40 M4,18 Q30,24 44,-2 Q48,-22 40,-40', 4, col)]);
S.imperial   = st('Imperial', '1800s: emperor, cavalry officer', ({ col }) => [P('M0,14 Q-26,2 -50,10 Q-70,6 -76,-14 Q-84,22 -52,30 Q-22,34 0,22 Q22,34 52,30 Q84,22 76,-14 Q70,6 50,10 Q26,2 0,14 Z', col, 5.5)]);
S.bushy      = st('Bushy', 'any era: farmer, plumber, uncle', ({ col }) => [P('M-42,26 Q-40,4 0,6 Q40,4 42,26 Q30,32 20,26 Q10,34 0,26 Q-10,34 -20,26 Q-30,32 -42,26 Z', col, 6), L('M-20,12 l-2,10 M0,10 l0,12 M20,12 l2,10', 2.6, shade(col, .58))]);
export const STACHES = S;

// ============ FACE ACCESSORIES ============  a({ view, col }) -> svg[]  (slid with the face)  or { slid, fixed }
const A = {};
const ac = (label, fn) => Object.assign(fn, { label });
const arms = view => view === 'side' ? [] : [L('M-66,-22 L-100,-30 M66,-22 L100,-30', 5)];
A.roundGlasses  = ac('Round glasses', ({ view }) => [...arms(view), ...[-1, 1].map(s => ring(s * 40, -19, 25, '#dff1fa', 6)).map(c => c.replace('fill="#dff1fa"', 'fill="#dff1fa" fill-opacity=".12"')), L('M-15,-22 Q0,-30 15,-22', 5), L('M-52,-30 q8,-8 16,-6 M28,-30 q8,-8 16,-6', 3, '#ffffff')]);
A.squareGlasses = ac('Square glasses', ({ view }) => [...arms(view), ...[-1, 1].map(s => `<rect x="${s * 40 - 26}" y="-40" width="52" height="40" rx="8" fill="#dff1fa" fill-opacity=".12" stroke="${INK}" stroke-width="7"/>`), L('M-14,-24 L14,-24', 6)]);
A.catEye        = ac('Cat-eye glasses', ({ view }) => [...arms(view), ...[-1, 1].map(s => P(`M${s * 14},-34 Q${s * 40},-44 ${s * 76},-52 Q${s * 72},-10 ${s * 40},2 Q${s * 14},0 ${s * 14},-34 Z`, '#c8322c', 6)), ...[-1, 1].map(s => `<ellipse cx="${s * 40}" cy="-19" rx="19" ry="14" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`), L('M-14,-24 Q0,-30 14,-24', 5), dot(-66, -44, 3, GOLD), dot(66, -44, 3, GOLD)]);
A.aviators      = ac('Aviator sunglasses', ({ view }) => [...arms(view), ...[-1, 1].map(s => P(`M${s * 12},-38 L${s * 68},-40 Q${s * 74},-4 ${s * 44},6 Q${s * 14},4 ${s * 12},-38 Z`, '#3a3f4a', 6)), L('M-12,-34 Q0,-40 12,-34 M-12,-24 Q0,-28 12,-24', 4, GOLD), L('M-58,-32 L-40,-8 M26,-32 L44,-8', 5, '#ffffff', .55)]);
A.shutter3d     = ac('3D glasses', ({ view }) => [...arms(view), P('M-72,-42 L72,-42 L70,2 L10,2 L0,-12 L-10,2 L-70,2 Z', WHITE, 6), `<rect x="-62" y="-34" width="46" height="28" rx="3" fill="#d8473c" stroke="${INK}" stroke-width="4"/>`, `<rect x="16" y="-34" width="46" height="28" rx="3" fill="#3aa0d8" stroke="${INK}" stroke-width="4"/>`]);
A.monocle       = ac('Monocle', () => [ring(40, -19, 26, 'none', 7), ring(40, -19, 26, 'none', 3, GOLD), L('M56,2 Q70,60 40,110', 2.6, GOLD), L('M24,-34 q8,-8 16,-6', 3, '#ffffff')]);
A.eyePatchMed   = ac('Medical eye pad', () => [L('M4,-52 L22,-36 M76,-52 L58,-36 M10,10 L24,-4 M70,10 L56,-4', 9, '#e8b98f'), P('M14,-42 Q40,-50 66,-42 Q72,-6 40,6 Q8,-6 14,-42 Z', '#e9eef3', 5.5), L('M26,-36 L54,-36 M22,-26 L58,-26 M24,-16 L56,-16 M30,-6 L50,-6', 2, '#b9c4cf')]);
A.plaster       = ac('Sticking plaster', () => [`<g transform="rotate(-24 -52 30)"><rect x="-76" y="20" width="48" height="20" rx="9" fill="#f0c9a0" stroke="${INK}" stroke-width="4.5"/><rect x="-60" y="23" width="16" height="14" rx="2" fill="#f8e3c8"/>${dot(-70, 30, 1.6, '#b98d62')}${dot(-34, 30, 1.6, '#b98d62')}</g>`]);
A.scar          = ac('Cheek scar', () => [L('M34,10 Q52,30 60,62', 7, '#e9a9a0'), L('M34,10 Q52,30 60,62', 2.4, '#b8635c'), L('M36,24 l14,-6 M44,38 l14,-6 M50,52 l14,-5', 2.6, '#8a4a44')]);
A.eyeScar       = ac('Scar over the eye', () => [L('M-46,-66 Q-36,-20 -44,24', 7, '#e9a9a0'), L('M-46,-66 Q-36,-20 -44,24', 2.4, '#b8635c')]);
A.freckles      = ac('Freckles', () => [[-58, 6], [-46, 12], [-34, 4], [-50, 0], [-40, 16], [58, 6], [46, 12], [34, 4], [50, 0], [40, 16], [-8, 0], [8, 2]].map(([x, y]) => dot(x, y, 2.6, '#c98a5a')));
A.mole          = ac('Beauty spot', () => [dot(30, 40, 4.2, '#4a3028')]);
A.bindi         = ac('Bindi', () => [dot(0, -50, 5.5, '#c8322c'), dot(0, -50, 2, GOLD)]);
A.makeup        = ac('Make-up (lashes, shadow, lips)', () => [...[-1, 1].flatMap(s => [F(`M${s * 20},-34 Q${s * 40},-52 ${s * 64},-36 Q${s * 40},-42 ${s * 20},-34 Z`, '#8f6fd6', .8), L(`M${s * 58},-28 l${s * 12},-10 M${s * 62},-20 l${s * 13},-4`, 3.4)]), P('M-15,31 Q-7,25 0,29 Q7,25 15,31 Q0,45 -15,31 Z', '#d8344a', 3.5), F('M-66,8 a14,9 0 1,0 28,0 a14,9 0 1,0 -28,0 M38,8 a14,9 0 1,0 28,0 a14,9 0 1,0 -28,0', '#f7a6b4', .7)]);
A.clownNose     = ac('Red clown nose', () => [ring(0, 6, 17, RED, 5.5), dot(-6, 0, 4.5, '#ffb3ab')]);
A.pipe          = ac('Pipe', () => [L('M8,36 Q40,44 56,60', 11, INK), L('M8,36 Q40,44 56,60', 5.5, '#5f3c22'), P('M46,40 L78,40 L74,74 Q62,82 50,74 Z', '#7a4a2a', 5.5), L('M52,46 L72,46', 3, '#3a2416')]);
A.lollipop      = ac('Lollipop', () => [L('M6,36 L50,62', 8, INK), L('M6,36 L50,62', 3.6, WHITE), ring(62, 70, 19, '#e8466a', 5.5), L('M62,70 m-10,0 a10,10 0 1,1 10,10 a5,5 0 1,1 -5,-5', 3, '#ffd0da')]);
A.wheat         = ac('Wheat straw', () => [L('M4,36 Q50,34 96,10', 3.4, '#b8922e'), ...[0, 1, 2, 3].map(k => `<ellipse cx="${72 + k * 8}" cy="${22 - k * 4}" rx="6" ry="3" fill="#e2bd4a" stroke="${INK}" stroke-width="2" transform="rotate(-24 ${72 + k * 8} ${22 - k * 4})"/>`)]);
A.wheatOther    = ac('Wheat straw, other mouth corner', ({ view, col }) => view === 'side' ? A.wheat({ view, col }) : [`<g transform="scale(-1,1)">${A.wheat({ view, col }).join('')}</g>`]);   // moonrakers 2026-11-13: the straw switches corners (front / 3/4 mirrored; in profile it stays in the near corner)
A.pacifier      = ac('Pacifier', () => [ell(0, 36, 24, 16, '#7fd0e8', 5), ring(0, 56, 12, 'none', 5.5, '#f2c230'), dot(0, 36, 6, '#e8f7fc')]);
A.hoop          = ac('Hoop earrings', ({ view }) => ({ fixed: view === 'side' ? [ring(-6, 44, 15, 'none', 7), ring(-6, 44, 15, 'none', 3.5, GOLD)] : [-1, 1].flatMap(s => [ring(s * 98, 44, 15, 'none', 7), ring(s * 98, 44, 15, 'none', 3.5, GOLD)]) }));
A.hoop.back = true;
A.drops         = ac('Drop earrings', ({ view }) => ({ fixed: (view === 'side' ? [-6] : [-99, 99]).flatMap(x => [L(`M${x},26 l0,16`, 3, GOLD), P(`M${x},40 Q${x + 11},58 ${x},66 Q${x - 11},58 ${x},40 Z`, '#3fb6a8', 4)]) }));
A.drops.back = true;
A.studs         = ac('Ear studs', ({ view }) => ({ fixed: (view === 'side' ? [-6] : [-100, 100]).map(x => ring(x, 28, 5.5, '#e6f3ff', 3.5)) }));
A.studs.back = true;
A.earbuds       = ac('Wireless earbuds', ({ view }) => ({ fixed: (view === 'side' ? [-4] : [-101, 101]).flatMap(x => [P(`M${x - 6},14 q6,-8 12,0 l-2,34 q-4,4 -8,0 Z`, WHITE, 4)]) }));
A.earbuds.back = true;
A.headset       = ac('Headset mic', ({ view }) => ({ fixed: view === 'side' ? [ring(-2, 6, 22, '#3a3f4a', 6), L('M10,22 Q50,70 84,56', 5), ell(88, 54, 10, 7, '#3a3f4a', 4)] : view === 'back' ? [ring(-100, 6, 16, '#3a3f4a', 6), ring(100, 6, 16, '#3a3f4a', 6)] : [P('M-112,-14 L-96,-14 L-96,28 L-112,28 Z', '#3a3f4a', 5.5), P('M112,-14 L96,-14 L96,28 L112,28 Z', '#3a3f4a', 5.5), L('M-104,28 Q-90,70 -30,60', 5), ell(-24, 58, 11, 8, '#3a3f4a', 4)] }));
A.headset.back = true;
export const ACCESSORIES = A;

// ============ TATTOOS AND FACE PAINT ============  m({ view }) -> svg[]  front coords; flat colour on the skin (multiply), clipped to the head
const M = {};
const mkM = (label, kind, fn) => Object.assign(fn, { label, kind });
const tl = (d, sw = 3.4) => L(d, sw, TAT);
// --- tattoos (blue-black ink lines)
M.tear      = mkM('Teardrop', 'tattoo', () => [F('M40,2 Q49,18 40,24 Q31,18 40,2 Z', TAT)]);
M.anchor    = mkM('Anchor (cheek)', 'tattoo', () => [ring(-52, 18, 5, 'none', 3.2, TAT), tl('M-52,23 L-52,56 M-62,32 L-42,32 M-68,44 Q-66,60 -52,58 Q-38,60 -36,44 M-68,44 l-4,6 M-36,44 l4,6')]);
M.stars     = mkM('Three stars (temple)', 'tattoo', () => [star(66, -52, 9, TAT), star(78, -34, 6.5, TAT), star(60, -34, 5, TAT)]);
M.barbed    = mkM('Barbed wire (forehead)', 'tattoo', () => [tl('M-80,-58 Q-40,-66 0,-58 Q40,-50 80,-58', 3), ...[-60, -30, 0, 30, 60].map(x => tl(`M${x - 6},${-66 + Math.abs(x) * .03} l12,12 M${x + 6},${-66 + Math.abs(x) * .03} l-12,12`, 2.6))]);
M.web       = mkM('Spider web (temple)', 'tattoo', () => [tl('M96,-60 L44,-52 M96,-60 L58,-20 M96,-60 L84,-6 M62,-55 Q66,-40 72,-34 Q80,-24 87,-22 M76,-57 Q79,-48 84,-42', 2.6)]);
M.heart     = mkM('Heart with arrow (cheek)', 'tattoo', () => [L('M52,22 Q52,8 62,10 Q70,12 66,24 Q60,36 52,42 Q44,36 38,24 Q34,12 42,10 Q52,8 52,22 Z', 3.2, '#b8323e'), tl('M30,40 L76,6 M76,6 l-10,0 M76,6 l0,10', 2.6)]);
M.bolt      = mkM('Lightning bolt (eye)', 'tattoo', () => [F('M-48,-74 L-22,-74 L-36,-44 L-20,-44 L-52,8 L-44,-30 L-58,-30 Z', '#d8473c'), F('M-44,-70 L-30,-70 L-44,-40 L-32,-40 L-46,-12 L-40,-34 L-52,-34 Z', '#3a6fd8')]);
M.rose      = mkM('Rose (cheek)', 'tattoo', () => [L('M-52,24 m-12,0 a12,12 0 1,1 24,0 a12,12 0 1,1 -24,0 M-52,24 m-6,0 a6,6 0 1,1 12,0 M-58,18 q6,-8 12,0', 2.8, '#b8323e'), L('M-52,36 Q-50,54 -40,66 M-48,50 q-14,-2 -16,10 q12,2 16,-10', 2.8, '#3f7a4a')]);
M.barcode   = mkM('Barcode (forehead)', 'tattoo', () => [...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => F(`M${-26 + k * 5.6},-72 l${[3, 1.6, 4, 1.6, 2.6, 4, 1.6, 3, 1.6, 4][k]},0 l0,18 l${-[3, 1.6, 4, 1.6, 2.6, 4, 1.6, 3, 1.6, 4][k]},0 Z`, TAT))]);
M.tribal    = mkM('Curved lines (half face)', 'tattoo', () => [tl('M18,-70 Q60,-80 86,-44 M30,-58 Q60,-62 76,-40 M76,2 Q70,40 40,62 Q62,34 62,2 M88,6 Q86,56 46,80 M22,56 Q34,64 30,84', 4.2), F('M70,-30 Q84,-22 82,-6 Q74,-14 70,-30 Z', TAT)]);
M.cross     = mkM('Small cross (under eye)', 'tattoo', () => [tl('M-40,2 L-40,26 M-48,10 L-32,10', 3.6)]);
M.thirteen  = mkM('Number (cheek)', 'tattoo', () => [`<text x="50" y="40" font-family="Georgia,serif" font-weight="bold" font-size="30" fill="${TAT}" text-anchor="middle">13</text>`]);
// --- face paint (flat colour)
const eyeD = (s, c, h = 30) => F(`M${s * 40},${-19 - h} L${s * 52},-19 L${s * 40},${-19 + h} L${s * 28},-19 Z`, c);
M.clown     = mkM('Clown', 'paint', () => [eyeD(-1, '#3a8fd8'), eyeD(1, '#3a8fd8'), F('M-56,26 Q-30,40 0,40 Q30,40 56,26 Q44,70 0,74 Q-44,70 -56,26 Z', '#e23b3b'), F('M-40,36 Q0,50 40,36 Q30,60 0,62 Q-30,60 -40,36 Z', '#ffffff'), ell(-68, 22, 12, 12, '#f58aa0'), ell(68, 22, 12, 12, '#f58aa0')]);
M.mime      = mkM('Mime', 'paint', () => [L('M-40,-50 L-40,-36 M-40,-2 L-40,22 M40,-50 L40,-36 M40,-2 L40,22', 5, BLACK), F('M-40,22 q8,12 0,18 q-8,-6 0,-18 Z', BLACK), F('M-14,30 Q0,22 14,30 Q0,46 -14,30 Z', '#c8322c'), ell(-62, 20, 11, 11, '#f7a6b4'), ell(62, 20, 11, 11, '#f7a6b4')]);
M.sugarSkull = mkM('Sugar skull (Day of the Dead)', 'paint', () => [...[-1, 1].flatMap(s => [...[...Array(10)].map((_, k) => dot(s * 40 + Math.cos(k * .628) * 31, -19 + Math.sin(k * .628) * 27, 6.5, ['#e8466a', '#f2c230', '#3fb6a8'][k % 3])), F(`M${s * 40 - 27},-19 a27,23 0 1,0 54,0 a27,23 0 1,0 -54,0 Z M${s * 40 - 20},-19 a20,14 0 1,1 40,0 a20,14 0 1,1 -40,0 Z`, BLACK, 1, 'fill-rule="evenodd"')]), F('M0,0 Q-10,16 -5,20 Q0,14 5,20 Q10,16 0,0 Z', BLACK), L('M-44,36 Q0,48 44,36', 3, BLACK), ...[-36, -24, -12, 0, 12, 24, 36].map(x => L(`M${x},${32 + (1 - Math.abs(x) / 44) * 6} l0,12`, 2.6, BLACK)), ...[...Array(6)].map((_, k) => ell(Math.cos(k * 1.047) * 10, -62 + Math.sin(k * 1.047) * 10, 6, 6, '#e8466a')), dot(0, -62, 5, '#f2c230'), L('M-70,40 q10,10 4,22 M70,40 q-10,10 -4,22', 3, '#3fb6a8')]);
M.tiger     = mkM('Tiger (kids)', 'paint', () => [F('M-120,-120 L120,-120 L120,120 L-120,120 Z', '#f59a2e'), F('M-46,14 Q0,-6 46,14 Q50,70 0,84 Q-50,70 -46,14 Z', '#ffffff'), F('M-12,6 L12,6 L0,20 Z', BLACK), L('M0,20 L0,30 M-14,-70 L-6,-44 M0,-74 L0,-46 M14,-70 L6,-44 M-96,-20 L-70,-12 M-98,4 L-72,6 M-92,28 L-68,24 M96,-20 L70,-12 M98,4 L72,6 M92,28 L68,24', 6, BLACK), ...[[-24, 40], [-30, 50], [24, 40], [30, 50]].map(([x, y]) => dot(x, y, 2.6, BLACK)), L('M-34,44 l-30,-4 M-34,52 l-30,6 M34,44 l30,-4 M34,52 l30,6', 2, BLACK)]);
M.fanFlag   = mkM('Football fan stripes', 'paint', () => [-1, 1].flatMap(s => [['#d8473c', 0], ['#ffffff', 1], ['#2f5fb5', 2]].map(([c, k]) => F(`M${s * 34},${-2 + k * 11} L${s * 72},${-8 + k * 11} L${s * 72},${3 + k * 11} L${s * 34},${9 + k * 11} Z`, c)).concat(L(`M${s * 34},-2 L${s * 72},-8 L${s * 72},25 L${s * 34},31 Z`, 2, '#55607a'))));
M.warStripes = mkM('War stripes', 'paint', () => [...[-1, 1].flatMap(s => [L(`M${s * 28},4 L${s * 74},18`, 9, '#c8322c'), L(`M${s * 30},22 L${s * 70},36`, 9, '#c8322c')]), L('M-30,-62 L30,-62', 9, '#2a2630'), dot(0, -44, 5, '#c8322c')]);
M.woad      = mkM('Blue half face (woad)', 'paint', () => [F('M0,-120 L120,-120 L120,120 L0,120 L10,60 L-6,20 L8,-30 Z', '#2f6fc0'), L('M-70,-10 L-30,0 M-70,10 L-34,16', 7, '#2f6fc0')]);
M.camo      = mkM('Camouflage', 'paint', () => [F('M-120,-120 L120,-120 L120,120 L-120,120 Z', '#8a9a5b'), ...[[-50, -50, 34, 22, 20], [40, -60, 40, 20, -15], [-70, 30, 26, 34, 10], [60, 20, 30, 26, -30], [0, 70, 40, 18, 5], [0, -6, 22, 14, 40]].map(([x, y, a, b, r], k) => ell(x, y, a, b, k % 2 ? '#4a5a34' : '#5f4a30', 0, r))]);
M.kabuki    = mkM('Kabuki kumadori', 'paint', () => [...[-1, 1].flatMap(s => [L(`M${s * 14},-34 Q${s * 50},-70 ${s * 86},-56`, 8, '#c8322c'), L(`M${s * 66},-14 Q${s * 90},10 ${s * 78},48`, 8, '#c8322c'), L(`M${s * 26},4 Q${s * 50},20 ${s * 56},56`, 7, '#c8322c'), L(`M${s * 14},46 Q${s * 30},60 ${s * 30},80`, 6, '#c8322c')]), L('M0,-84 L0,-52', 8, '#c8322c')]);
M.eyeBlack  = mkM('Eye black (athlete)', 'paint', () => [-1, 1].map(s => F(`M${s * 20},2 Q${s * 40},-4 ${s * 62},2 Q${s * 58},16 ${s * 40},14 Q${s * 24},16 ${s * 20},2 Z`, BLACK)));
M.blush     = mkM('Rosy cheeks', 'paint', () => [ell(-62, 14, 17, 11, '#f58aa0'), ell(62, 14, 17, 11, '#f58aa0')]);
M.geisha    = mkM('Geisha red accents', 'paint', () => [...[-1, 1].map(s => F(`M${s * 56},-22 Q${s * 72},-34 ${s * 80},-22 Q${s * 70},-16 ${s * 56},-22 Z`, '#d8344a')), F('M-9,30 Q-4,25 0,28 Q4,25 9,30 Q0,41 -9,30 Z', '#d8344a'), ell(-60, 10, 14, 9, '#f9c0cc'), ell(60, 10, 14, 9, '#f9c0cc')]);
M.zombie    = mkM('Zombie', 'paint', () => [F('M-120,-120 L120,-120 L120,120 L-120,120 Z', '#b9d6a6'), ...[-1, 1].map(s => ell(s * 40, -17, 30, 24, '#7d6a8a')), L('M-70,40 Q-56,56 -62,74 M-70,52 l10,-4 M-68,64 l10,-2', 3, '#5a3c4a'), F('M40,44 Q60,40 70,56 Q54,70 40,60 Z', '#8a3c4a')]);
M.festival  = mkM('Festival glitter', 'paint', () => [...[-1, 1].flatMap(s => [[30, 4, 4, '#f2c230'], [42, 8, 5, '#e8466a'], [54, 4, 4, '#3fb6a8'], [64, -4, 3.4, '#8f6fd6'], [36, 16, 3, '#3fb6a8'], [50, 18, 3.4, '#f2c230'], [60, 12, 2.6, '#e8466a']].map(([x, y, r, c]) => dot(s * x, y, r, c))), star(0, -58, 9, '#f2c230'), star(-16, -48, 5, '#e8466a'), star(16, -48, 5, '#3fb6a8')]);
M.holi      = mkM('Holi colour powder', 'paint', () => [[-56, -40, 34, '#e8466a'], [50, -56, 30, '#f2c230'], [64, 20, 30, '#3fb6a8'], [-60, 36, 28, '#8f6fd6'], [0, 70, 26, '#f5822e'], [-10, -66, 20, '#3a8fd8']].flatMap(([x, y, r, c], k) => { const q = rnd(k + 2); return [ell(x, y, r, r * .8, c, 0, k * 30).replace('/>', ' fill-opacity=".8"/>'), ...[...Array(7)].map(() => dot(x + (q() - .5) * r * 2.6, y + (q() - .5) * r * 2.6, 2 + q() * 4, c))]; }));
M.butterfly = mkM('Butterfly (kids)', 'paint', () => [...[-1, 1].flatMap(s => [F(`M${s * 8},-20 Q${s * 30},-84 ${s * 86},-66 Q${s * 100},-20 ${s * 62},-2 Q${s * 30},0 ${s * 8},-20 Z M${s * 20},-19 a20,15 0 1,${s > 0 ? 1 : 0} ${s * 40},0 a20,15 0 1,${s > 0 ? 1 : 0} ${-s * 40},0 Z`, '#b06fe0', 1, 'fill-rule="evenodd"'), F(`M${s * 10},-8 Q${s * 40},10 ${s * 70},8 Q${s * 66},44 ${s * 34},40 Q${s * 14},24 ${s * 10},-8 Z`, '#f58ac0'), dot(s * 70, -52, 6, '#ffffff'), dot(s * 52, 24, 5, '#ffffff'), L(`M${s * 4},-40 Q${s * 10},-70 ${s * 22},-80`, 3, '#5a3c8a')]), ell(0, -8, 5, 22, '#5a3c8a')]);
export const MARKS = M;

// ============ put it on a spec ============
const SL = { '34': [23.1, .879], side: [34, .78] };   // the rig's slide of the face layer: x' = s + k x
export function withFace(spec, opts = {}) {
  const ft = spec.faceTop, shape = spec.head || ({ lady: 'egg', teengirl: 'egg', elder: 'potato' })[spec.form] || 'rick';
  const col = opts.col || spec.hairCol || '#6b4423';
  return { ...spec, faceTop: Hh => { const rv = Hh.view || 'front', view = rv === '34' ? 'front' : rv, dir = Hh.dir || 1, sl = SL[rv], prev = ft ? ft(Hh) : [];
      const inv = sl ? ` transform="scale(${(1 / sl[1]).toFixed(4)},1) translate(${-sl[0]},0)"` : '', fwd = sl ? ` transform="translate(${sl[0]},0) scale(${sl[1]},1)"` : '';
      const fixed = arr => arr.length ? `<g${inv}>${arr.join('')}</g>` : '', o = [];
      if (view !== 'back' && opts.marks && opts.marks.length) { const id = 'fc' + (GID++), [cs, ck] = sl || [0, 1], pts = headPts(0, 0, 100, shape, false).map(p => f((p[0] * .985 - cs) / ck) + ',' + f(p[1] * .985)).join(' ');
        // clip and blend sit on ONE element (a clip on a parent would isolate the group and switch the multiply off); the clip is the head edge mapped back through the rig's slide
        o.push(`<defs><clipPath id="${id}"><polygon points="${pts}"/></clipPath></defs><g clip-path="url(#${id})" style="mix-blend-mode:multiply">${opts.marks.map(k => (typeof k === 'function' ? k : M[k])({ view }).join('')).join('')}</g>`); }
      if (opts.beard) o.push(fixed((typeof opts.beard === 'function' ? opts.beard : B[opts.beard])({ view, col })));
      if (opts.stache && view !== 'back') o.push((typeof opts.stache === 'function' ? opts.stache : S[opts.stache])({ view, col }).join(''));
      for (const k of opts.acc || []) { const fn = typeof k === 'function' ? k : A[k]; if (view === 'back' && !fn.back) continue; const r = fn({ view, col }); o.push(Array.isArray(r) ? r.join('') : (r.slid || []).join('') + fixed(r.fixed || [])); }
      return [...prev, `<g transform="translate(${f(Hh.cx)},${f(Hh.hy)})${dir < 0 ? ' scale(-1,1)' : ''}">${o.join('')}</g>`]; } };
}
