// HEAD WEAR v1: more hats and head pieces for the vector cast (CB 2026-11-12 03:54 Bangkok: "next create more hats and head peices").
// Use with hair_lib withHair / head_gear withGear / face_gear withFace:
//   withHair(spec, 'sidePart', { hat: HATS2.tricorn, pieces: [PIECES2.feather] })      (a function is accepted wherever a key is)
//   or by key through wear(spec, hairKey, { hat: 'tricorn', pieces: ['feather'] }) which looks in this file first, then in hair_lib.
// Rick grammar (pirate bandana + tricorn, kettle helmet, kepi, bucket hat): one bold simple shape that hugs the head and stops just above the brows,
// thick ink, flat colour with a soft gradient, ONE or two telling details (dots, a skull button, a gold trim line), hair still showing at the sides and back.
// A hat h(PP) gets PP from hair_lib: view (front|side|back, side faces +x), brimY (hat line above the brows), crownY (top of the head), widthAt(y), onHair(aDeg, push).
import { INK, shade, tint, brush } from './char2d.mjs';
import { withHair, HATS, PIECES } from './hair_lib.mjs';
const f = v => (+v).toFixed(1);
export const HAT_INK = 1.25; // CB 2026-11-12 04:05 "the lines little more thicker": outline width x1.25 on every filled hat/piece shape (v1 = 1)
let GID = 0;
const vol = c => { if (!/^#[0-9a-fA-F]{6}$/.test(c)) return ['', c]; const id = 'hw' + (GID++); return [`<defs><linearGradient id="${id}" x1="0.15" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${tint(c, .34)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, .74)}"/></linearGradient></defs>`, `url(#${id})`]; };
// TEX: on big shapes, 3 soft cloth creases rising from the bottom edge + one near-white shine streak on the lit upper left (like the hair v2 shine line).
// A shape opts out with extra containing data-flat (metal crowns, tiny parts).
const TEX = (d, fill, extra = '') => { if (/data-flat/.test(extra)) return ''; const n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  if (xs.length < 4) return ''; const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, h = y1 - y0; if (w < 80 || h < 40) return '';
  const cr = [.3, .55, .76].map((u, i) => `<path d="M${f(x0 + w * u)},${f(y1 - 6)} Q${f(x0 + w * (u + .04))},${f(y1 - h * .3)} ${f(x0 + w * (u + (i - 1) * .03))},${f(y1 - h * (.42 + i * .05))}" fill="none" stroke="${shade(fill, .62)}" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>`).join('');
  return cr + `<path d="M${f(x0 + w * .2)},${f(y0 + h * .62)} Q${f(x0 + w * .19)},${f(y0 + h * .3)} ${f(x0 + w * .36)},${f(y0 + h * .16)}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".75"/>`; };
// v3 (CB 04:09 "they looks to flat add more details. high lights lines"): every filled shape gets a bevel inside its own outline:
// a light rim along the lit top-left edge, a darker rim along the bottom-right, then the ink outline on top. Small parts get a thinner bevel.
const P = (d, fill, sw = 7, extra = '') => { const [df, fl] = vol(fill); if (fill === 'none' || !/^#[0-9a-fA-F]{6}$/.test(fill)) return df + `<path d="${d}" fill="${fl}" stroke="${INK}" stroke-width="${f(sw * HAT_INK)}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const id = 'hc' + (GID++), k = sw < 5 ? .55 : 1;
  return df + `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${fl}" ${extra}/>`
    + `<g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${tint(fill, .62)}" stroke-opacity=".75" stroke-width="${f(12 * k)}" transform="translate(${f(5 * k)} ${f(7 * k)})"/>`
    + `<path d="${d}" fill="none" stroke="${shade(fill, .55)}" stroke-opacity=".55" stroke-width="${f(16 * k)}" transform="translate(${f(-6 * k)} ${f(-9 * k)})"/>${TEX(d, fill, extra)}</g>`
    + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(sw * HAT_INK)}" stroke-linejoin="round" stroke-linecap="round"/>`; };
const L = (d, sw = 3.4, col = INK, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;
const ring = (x, y, r, fill, sw = 5, col = INK) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${col}" stroke-width="${f(sw * HAT_INK)}"/>`;
const dot = (x, y, r, fill) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
const ell = (x, y, rx, ry, fill, sw = 5, rot = 0) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${f(sw * HAT_INK)}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const shine = (x0, y0, qx, qy, x1, y1, w = 6, col = '#ffffff') => brush(x0, y0, qx, qy, x1, y1, w, { col, tip: .15 });
const star = (x, y, r, fill, sw = 3) => `<path d="M${[...Array(10)].map((_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * .45 : r; return f(x + Math.cos(a) * q) + ',' + f(y + Math.sin(a) * q); }).join(' L')} Z" fill="${fill}" stroke="${INK}" stroke-width="${f(sw * HAT_INK)}" stroke-linejoin="round"/>`;
const GOLD = '#f2c230', RED = '#d8473c', BLACK = '#2a2630', WHITE = '#f6f4f0', FELT = '#5a4634', NAVY = '#27365e';

// crown shapes: w = half width at the base, y = base line, top = top line
const CROWN = {
  dome: (w, y, top) => `M${f(-w)},${f(y)} C${f(-w)},${f(top - (y - top) * .32)} ${f(w)},${f(top - (y - top) * .32)} ${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`,
  cyl: (w, y, top, k = .92) => `M${f(-w)},${f(y)} L${f(-w * k)},${f(top)} Q0,${f(top - 8)} ${f(w * k)},${f(top)} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`,
  cone: (w, y, top, tip = 0, bend = 0) => `M${f(-w)},${f(y)} Q${f(-w * .34 + bend)},${f((y + top) / 2)} ${f(tip)},${f(top)} Q${f(w * .5 + bend)},${f((y + top) / 2)} ${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`,
  pinch: (w, y, top) => `M${f(-w)},${f(y)} C${f(-w * 1.04)},${f(top + 14)} ${f(-w * .6)},${f(top - 6)} ${f(-w * .3)},${f(top)} Q0,${f(top + 18)} ${f(w * .3)},${f(top)} C${f(w * .6)},${f(top - 6)} ${f(w * 1.04)},${f(top + 14)} ${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`,
};
const brimAround = (w, y, b, c, { sag = 22, rise = 16, up = 0, sw = 6 } = {}) => P(`M${f(-w - b)},${f(y + 6 - up)} Q${f(-w * .5)},${f(y + sag + 8)} 0,${f(y + sag)} Q${f(w * .5)},${f(y + sag + 8)} ${f(w + b)},${f(y + 6 - up)} Q0,${f(y - rise)} ${f(-w - b)},${f(y + 6 - up)} Z`, c, sw);
const peak = (view, w, y, len, c, sw = 5.5) => view === 'back' ? [] : view === 'side' ? [P(`M${f(w - 14)},${f(y - 12)} L${f(w + len)},${f(y - 2)} Q${f(w + len + 4)},${f(y + 8)} ${f(w + len - 6)},${f(y + 10)} L${f(w - 14)},${f(y + 4)} Z`, c, sw)] : [P(`M${f(-w + 4)},${f(y - 4)} Q0,${f(y + len * 1.25)} ${f(w - 4)},${f(y - 4)} Q0,${f(y + 6)} ${f(-w + 4)},${f(y - 4)} Z`, c, sw), L(`M${f(-w * .6)},${f(y + len * .3)} Q0,${f(y + len * .55)} ${f(w * .6)},${f(y + len * .3)}`, 2.4, tint(c, .35), .7)];
const band = (w, y, h, c, sw = 4.5) => P(`M${f(-w)},${f(y - h)} Q0,${f(y - h + 9)} ${f(w)},${f(y - h)} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, c, sw) + (h >= 12 ? `<path d="M${f(-w + 8)},${f(y - h / 2)} Q0,${f(y - h / 2 + 9.5)} ${f(w - 8)},${f(y - h / 2)}" fill="none" stroke="${tint(c, .5)}" stroke-width="2.2" stroke-dasharray="6 6" stroke-linecap="round" opacity=".8"/>` : '');
const G = (PP, dy = 0, dw = 6, h = 44) => ({ v: PP.view, y: PP.brimY + dy, w: PP.widthAt(PP.brimY + dy) + Math.min(dw, 2), top: PP.crownY - h });   // v3: crown fits the head (CB 04:09 "some are bigger than the head")

const H = {};
const hat = (key, label, era, fn, extra = {}) => { H[key] = Object.assign(fn, { label, era }, extra); };
// ---- Rick's own hats first
hat('pirateBandana', 'Pirate bandana', '1700s pirate, sailor, biker', PP => { const { v, y, w, top } = G(PP, 10, 7, 34), c = PP.wearCol || '#d63a30', o = [P(CROWN.dome(w, y, top), c, 7.5)];
  o.push(...[[-.58, -.34], [-.14, -.52], [.3, -.34], [.66, -.2], [-.3, -.9], [.3, -.84]].map(([u, t]) => dot(u * w, y + t * (y - top), 8.5, "#f1cfc8")));
  if (v === 'back') o.push(P(`M-10,${f(y - 4)} L-46,${f(y + 44)} L-22,${f(y + 40)} L-6,${f(y + 10)} Z`, c, 5), P(`M10,${f(y - 4)} L40,${f(y + 54)} L16,${f(y + 44)} L4,${f(y + 10)} Z`, c, 5), ring(0, y, 11, shade(c, .8), 5));
  if (v === 'side') o.push(P(`M${f(-w + 4)},${f(y - 8)} L${f(-w - 44)},${f(y + 30)} L${f(-w - 20)},${f(y + 36)} L${f(-w + 10)},${f(y + 8)} Z`, c, 5), ring(-w + 4, y, 10, shade(c, .8), 5));
  return o; });
hat('tricorn', 'Tricorn', '1700s pirate captain, colonial officer', PP => { const { v, y, w, top } = G(PP, 2, 4, 34), c = PP.wearCol || '#4a3038', o = [];
  if (v === 'side') return [P(CROWN.dome(w * .82, y, top), c, 7), P(`M${f(-w - 30)},${f(y - 30)} Q${f(-w * .2)},${f(y + 26)} ${f(w + 56)},${f(y + 2)} Q${f(w * .2)},${f(y - 16)} ${f(-w - 30)},${f(y - 30)} Z`, c, 6.5), L(`M${f(-w - 24)},${f(y - 26)} Q${f(-w * .2)},${f(y + 18)} ${f(w + 48)},${f(y + 2)}`, 4, GOLD), ring(10, y - 34, 14, "#e9d9d6", 4.5)];
  o.push(P(CROWN.dome(w * .86, y, top), c, 7), P(`M${f(-w - 52)},${f(y - 34)} Q${f(-w * .5)},${f(y + 30)} 0,${f(y + 10)} Q${f(w * .5)},${f(y + 30)} ${f(w + 52)},${f(y - 34)} Q${f(w * .6)},${f(y - 6)} 0,${f(y - 20)} Q${f(-w * .6)},${f(y - 6)} ${f(-w - 52)},${f(y - 34)} Z`, c, 6.5), L(`M${f(-w - 44)},${f(y - 28)} Q${f(-w * .5)},${f(y + 22)} 0,${f(y + 4)} Q${f(w * .5)},${f(y + 22)} ${f(w + 44)},${f(y - 28)}`, 5, "#d9a441"));
  if (v !== 'back') o.push(ring(0, y - 40, 16, "#e9d9d6", 4.5), dot(-5.5, y - 41, 3.6, INK), dot(5.5, y - 41, 3.6, INK));
  return o; });
hat('kepi', 'Kepi', '1860s soldier, French officer, postman', PP => { const { v, y, w, top } = G(PP, 0, 2, 46), c = PP.wearCol || NAVY;
  return [P(CROWN.cyl(w, y, top, .84), c, 7), band(w, y, 16, shade(c, .7)), L(`M${f(-w * .84)},${f(top + 6)} Q0,${f(top - 2)} ${f(w * .84)},${f(top + 6)}`, 3, GOLD), ...(v === 'back' ? [] : [L(`M-12,${f(y - 40)} L12,${f(y - 24)} M12,${f(y - 40)} L-12,${f(y - 24)}`, 4, GOLD)]), ...peak(v, w, y, 40, BLACK)]; });
hat('bucket', 'Bucket hat', 'today: fisherman, festival, tourist', PP => { const { v, y, w, top } = G(PP, -6, 2, 30), c = PP.wearCol || '#7c9a5a';
  return [P(`M${f(-w - 34)},${f(y + 30)} Q0,${f(y + 54)} ${f(w + 34)},${f(y + 30)} L${f(w)},${f(y - 4)} Q0,${f(y - 14)} ${f(-w)},${f(y - 4)} Z`, c, 6.5), P(CROWN.cyl(w, y, top, .86), c, 7), L(`M${f(-w)},${f(y - 2)} Q0,${f(y + 8)} ${f(w)},${f(y - 2)}`, 3, shade(c, .7)), L(`M${f(-w - 26)},${f(y + 22)} Q0,${f(y + 44)} ${f(w + 26)},${f(y + 22)}`, 2.4, shade(c, .7), .8), ...(v === 'back' ? [] : [P(`M${f(-w * .2)},${f(y - 30)} l14,-4 l2,12 l-14,4 Z`, GOLD, 3)])]; });
// ---- brimmed hats
hat('cowboy', 'Cowboy hat', '1870s Wild West, rancher, country singer', PP => { const { v, y, w, top } = G(PP, 0, -4, 62), c = PP.wearCol || '#b98a55';
  const br = v === 'side' ? P(`M${f(-w - 60)},${f(y - 6)} Q${f(-w * .3)},${f(y + 34)} ${f(w + 74)},${f(y - 2)} Q${f(w * .3)},${f(y - 8)} ${f(-w - 60)},${f(y - 6)} Z`, c, 6.5) : P(`M${f(-w - 78)},${f(y - 26)} Q${f(-w * .7)},${f(y + 34)} 0,${f(y + 20)} Q${f(w * .7)},${f(y + 34)} ${f(w + 78)},${f(y - 26)} Q${f(w * .7)},${f(y + 2)} 0,${f(y - 8)} Q${f(-w * .7)},${f(y + 2)} ${f(-w - 78)},${f(y - 26)} Z`, c, 6.5);
  return [br, P(CROWN.pinch(w * .86, y, top), c, 7), band(w * .86, y, 14, '#5f3c22'), ...(v === 'back' ? [] : [star(0, y - 6, 9, GOLD)]), shine(-w * .6, y - 22, -w * .66, top + 20, -w * .36, top + 4, 6, tint(c, .5))]; });
hat('fedora', 'Fedora', '1930s-50s: detective, gangster, reporter', PP => { const { v, y, w, top } = G(PP, 0, -2, 52), c = PP.wearCol || '#6b6460';
  return [brimAround(w, y, v === 'side' ? 38 : 40, c, { sag: 18, rise: 12 }), P(CROWN.pinch(w * .9, y, top), c, 7), band(w * .9, y, 18, BLACK), ...(v === 'back' ? [] : [P(`M${f(w * .5)},${f(y - 18)} l6,-30 l12,4 l-6,26 Z`, '#c8322c', 3)]), shine(-w * .62, y - 26, -w * .66, top + 18, -w * .4, top + 6, 5, tint(c, .5))]; });
hat('bowler', 'Bowler', '1890s-1920s: banker, butler, silent comic', PP => { const { v, y, w, top } = G(PP, 0, -2, 50), c = PP.wearCol || '#2e2a30';
  return [brimAround(w, y, 26, c, { sag: 14, rise: 10, up: 6 }), P(CROWN.dome(w * .9, y, top), c, 7), band(w * .9, y, 14, '#4a4650'), shine(-w * .6, y - 22, -w * .62, top + 14, -w * .28, top - 4, 6, '#8a8694')]; });
// STOVEPIPE (CB 2026-11-14, goldrush Shopkeeper: "Yes, all three fixes"): the tall 1840s top hat. Crown about 1.5 head radii tall, flaring a little toward the top
// (concave sides), flat top with a light rim; narrow brim curled up at both sides; stitched band (bandCol); colour option wearCol; library finish (bevel rims, TEX creases and
// its one shine streak through P). Crown base 0.84 and top 0.92 of the head width: never wider than the head (VIEW_RULES 30, 33). Round hat, so the same shape in every view.
hat('stovepipe', 'Stovepipe top hat', '1830s-1860s: merchant, gentleman, banker, gold-rush storekeeper, undertaker', PP => { const { v, y, w } = G(PP, 0, -2, 0), c = PP.wearCol || '#26232b', bc = PP.bandCol || shade(c, .62);
  const wb = w * .84, wt = w * .92, top = y - 152, mid = (y + top) / 2;
  const crown = `M${f(-wb)},${f(y)} Q${f(-wb * .93)},${f(mid)} ${f(-wt)},${f(top)} Q0,${f(top - 9)} ${f(wt)},${f(top)} Q${f(wb * .93)},${f(mid)} ${f(wb)},${f(y)} Q0,${f(y + 10)} ${f(-wb)},${f(y)} Z`;
  return [brimAround(wb, y, 26, c, { sag: 11, rise: 8, up: 9, sw: 6 }), P(crown, c, 7), L(`M${f(-wt + 8)},${f(top + 6)} Q0,${f(top - 2)} ${f(wt - 8)},${f(top + 6)}`, 3, tint(c, .42), .8),
    band(wb, y, 22, bc), L(`M${f(wb * .55)},${f(y - 36)} Q${f(wb * .6)},${f(mid)} ${f(wt * .62)},${f(top + 16)}`, 2.6, shade(c, .5), .7)]; });
// SLOUCH HAT (CB 2026-11-14, goldrush Miner, period fix): the wide-brim soft felt hat of the 1849 diggings (the creased cowboy hat came in the 1860s-70s).
// A low round crown with a dent along the top, a wide soft brim that droops at both ends, a plain band. Options: wearCol (felt), bandCol, and PP.notch = a bite-shaped
// notch torn out of the FRONT edge of the brim (front / 3/4: the lower brim edge a little to his left, kept there when the head is mirrored; side: the brim's front tip; back: on the far edge, not seen).
hat('slouch', 'Slouch hat (wide soft felt brim)', '1840s-1860s: forty-niner, farmer, frontiersman, soldier in the field', PP => { const { v, y, w } = G(PP, 0, -2, 0), c = PP.wearCol || '#6b4a32', bc = PP.bandCol || shade(c, .58);
  const wc = w * .9, top = y - 64, side = v === 'side';
  const brim = side ? `M${f(-wc - 44)},${f(y + 22)} Q${f(-wc)},${f(y - 6)} 0,${f(y - 4)} Q${f(wc)},${f(y - 6)} ${f(wc + 60)},${f(y + 22)} Q${f(wc + 66)},${f(y + 30)} ${f(wc + 52)},${f(y + 30)} Q${f(wc)},${f(y + 8)} 0,${f(y + 10)} Q${f(-wc)},${f(y + 8)} ${f(-wc - 36)},${f(y + 30)} Q${f(-wc - 50)},${f(y + 30)} ${f(-wc - 44)},${f(y + 22)} Z`
    : `M${f(-wc - 66)},${f(y + 28)} Q${f(-wc * .7)},${f(y + 14)} 0,${f(y + 12)} Q${f(wc * .7)},${f(y + 14)} ${f(wc + 66)},${f(y + 28)} Q${f(wc + 76)},${f(y + 10)} ${f(wc + 40)},${f(y - 4)} Q0,${f(y - 16)} ${f(-wc - 40)},${f(y - 4)} Q${f(-wc - 76)},${f(y + 10)} ${f(-wc - 66)},${f(y + 28)} Z`;   // the front edge stays above the brows; only the sides droop
  let brimSvg = P(brim, c, 6.5);
  if (PP.notch && v !== 'back') { const [nx, ny] = side ? [wc + 56, y + 27] : [wc * .34 * (PP.dir || 1), y + 13], id = 'hn' + (GID++), cid = 'hc' + (GID++), cs = [[nx - 8, ny, 13], [nx + 8, ny + 1, 12]];
    const holes = cs.map(([a, b, r]) => `<circle cx="${f(a)}" cy="${f(b)}" r="${f(r)}" fill="#000"/>`).join(''), mask = `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="1000" height="1000"><rect x="-500" y="-500" width="1000" height="1000" fill="#fff"/>${holes}</mask><clipPath id="${cid}"><path d="${brim}"/></clipPath></defs>`;
    brimSvg = mask + `<g mask="url(#${id})">${brimSvg}<g clip-path="url(#${cid})">${cs.map(([a, b, r]) => `<circle cx="${f(a)}" cy="${f(b)}" r="${f(r)}" fill="none" stroke="${INK}" stroke-width="${f(10 * HAT_INK)}"/>`).join('')}</g></g>`; }
  const crown = `M${f(-wc)},${f(y)} C${f(-wc)},${f(top - 18)} ${f(wc)},${f(top - 18)} ${f(wc)},${f(y)} Q0,${f(y + 10)} ${f(-wc)},${f(y)} Z`;
  return [brimSvg, P(crown, c, 7), L(`M${f(-wc * .45)},${f(top + 8)} Q0,${f(top + 22)} ${f(wc * .45)},${f(top + 8)}`, 3.2, shade(c, .55), .9), band(wc, y, 14, bc), L(`M${f(-wc - 56)},${f(y + 20)} Q${f(-wc * .8)},${f(y + 12)} ${f(-wc * .4)},${f(y + 10)}`, 2.4, shade(c, .6), .7)]; });
// NIGHTCAP (2026-11-14, goldrush Rival Seller): the long soft knitted / linen nightcap of the 18th-19th c. A folded cuff round the head, a long body that
// flops over to the WEARER'S LEFT and hangs down beside the head, a tassel at the tip; stripes. wearCol = cap, bandCol = stripes and cuff, tassel = a light tint.
// Front / 3/4: the flop hangs on screen-right (his left); back: screen-left (his left); side: it flops backward. Kept on his left when the head is mirrored.
hat('nightcap', 'Nightcap (long, floppy, tasselled)', '1700s-1880s: sleeper in bed, night watchman, shopkeeper woken early', PP => { const { v, y, w } = G(PP, 0, 4, 0), t = PP.crownY - 95, c = PP.wearCol || '#7d93b0', sc = PP.bandCol || '#ece6d6', d = PP.dir || 1;
  const sx = v === 'side' ? -1 : v === 'back' ? -d : d, X = x => f(x * sx);
  const cap = `M${X(-w)},${f(y - 6)} C${X(-w * .95)},${f(t + 60)} ${X(-w * .4)},${f(t - 10)} ${X(w * .15)},${f(t - 36)} C${X(w * .7)},${f(t - 50)} ${X(w + 50)},${f(t + 10)} ${X(w + 52)},${f(y + 64)} L${X(w + 28)},${f(y + 60)} C${X(w + 24)},${f(t + 60)} ${X(w * .8)},${f(t + 24)} ${X(w * .6)},${f(t + 30)} Q${X(w * .95)},${f(t + 60)} ${X(w)},${f(y - 6)} Z`;   // a tall cone that folds over at a crease and hangs down his left side
  const id = 'nc' + (GID++), stripes = [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const x0 = -w + k * w * .36; return `<path d="M${X(x0)},${f(y + 70)} L${X(x0 + w * .7)},${f(t - 30)}" stroke="${sc}" stroke-width="13" stroke-linecap="butt" opacity=".9"/>`; }).join('');
  const tx = (w + 40) * sx, ty = y + 72;
  return [P(cap, c, 7), `<defs><clipPath id="${id}"><path d="${cap}"/></clipPath></defs><g clip-path="url(#${id})">${stripes}</g>`, `<path d="${cap}" fill="none" stroke="${INK}" stroke-width="${f(7 * HAT_INK)}" stroke-linejoin="round"/>`,
    band(w + 2, y - 6, 16, sc), L(`M${X(-w * .7)},${f(y - 14)} Q0,${f(y - 6)} ${X(w * .7)},${f(y - 14)}`, 2.4, shade(sc, .7), .8),   // the cuff stops above the brows
    ...[-8, 0, 8].map(dx => L(`M${f(tx + dx * .6)},${f(ty)} l${f(dx * .4)},18`, 3, shade(sc, .6))), ring(tx, ty, 11, tint(sc, .3), 5),
    shine(-w * .55 * sx, y - 20, -w * .5 * sx, t + 4, w * .1 * sx, t - 14, 5, tint(c, .55))]; });
hat('boater', 'Straw boater', '1900s-1920s: barbershop, rower, candy seller', PP => { const { v, y, w, top } = G(PP, 0, -2, 30), c = PP.wearCol || '#ecd38a';
  return [brimAround(w, y, 44, c, { sag: 12, rise: 10 }), P(CROWN.cyl(w * .9, y, top, .98), c, 7), band(w * .9, y, 18, '#c8322c'), L(`M${f(-w * .9)},${f(y - 9)} Q0,${f(y)} ${f(w * .9)},${f(y - 9)}`, 4, NAVY)]; });
hat('witch', 'Witch hat', 'fairy tale, Halloween', PP => { const { v, y, w, top } = G(PP, 0, -2, 150), c = PP.wearCol || '#3a2d52';
  return [brimAround(w, y, 62, c, { sag: 20, rise: 14 }), P(CROWN.cone(w * .9, y, top, v === 'side' ? -40 : 34, v === 'side' ? -30 : 26), c, 7), band(w * .9, y, 20, '#7a3fa0'), ...(v === 'back' ? [] : [`<rect x="-13" y="${f(y - 20)}" width="26" height="22" rx="3" fill="none" stroke="${GOLD}" stroke-width="5"/>`])]; });
hat('sunHat', 'Wide sun hat', 'summer, garden, beach lady', PP => { const { v, y, w, top } = G(PP, 0, -2, 34), c = PP.wearCol || '#f1e2b8', bc = PP.bandCol || '#e8466a';   // bandCol: colour option for the band and back ribbon (moonrakers 2026-11-13, CB MIX AND MATCH)
  return [brimAround(w, y, 86, c, { sag: 30, rise: 6 }), P(CROWN.dome(w * .9, y, top), c, 7), band(w * .9, y, 16, bc), ...(v === 'back' ? [P(`M-8,${f(y - 8)} L-26,${f(y + 30)} L-8,${f(y + 26)} Z M8,${f(y - 8)} L26,${f(y + 30)} L8,${f(y + 26)} Z`, bc, 4)] : [])]; });
// FARM STRAW HAT (moonrakers 2026-11-13, CB "Yes, add all four"): a soft working straw hat with a MEDIUM brim (about 1.45x the head width, Rick's band of brims),
// a low round crown that fits the head, woven straw rings on the crown and the brim, a stitched band in any colour (bandCol), a darker underside edge
// on the brim (ON the hat, never a shadow on the face), a band knot at the back. wearCol = straw, bandCol = band.
const domeRing = (w, y, top, t) => { const T = top - (y - top) * .32, yy = y + (T - y) * 3 * t * (1 - t), xx = w * Math.abs(-((1 - t) ** 3) - 3 * t * (1 - t) ** 2 + 3 * t * t * (1 - t) + t ** 3); return [xx, yy]; };
hat('farmStraw', 'Farm straw hat', '1600s-1930s: farm labourer, haymaker, shepherd, gardener, scarecrow', PP => { const { v, y, w, top } = G(PP, 0, -2, 40), c = PP.wearCol || '#e2c06a', bc = PP.bandCol || '#6e4a2c', d = shade(c, .7), b = 44, sag = 20, cw = w * .9;
  const o = [brimAround(w, y, b, c, { sag, rise: 10 })];
  o.push(L(`M${f(-w - b + 10)},${f(y + 4)} Q${f(-w * .5)},${f(y + sag + 2)} 0,${f(y + sag - 4)} Q${f(w * .5)},${f(y + sag + 2)} ${f(w + b - 10)},${f(y + 4)}`, 5, shade(c, .62), .6));   // underside edge, on the brim
  o.push(L(`M${f(-w - b * .55)},${f(y + 4)} Q${f(-w * .5)},${f(y + sag * .7 + 4)} 0,${f(y + sag * .62)} Q${f(w * .5)},${f(y + sag * .7 + 4)} ${f(w + b * .55)},${f(y + 4)}`, 2.2, d, .8));   // woven ring on the brim
  o.push(...[-.9, -.62, .62, .9].map(u => L(`M${f(u * (w + 4))},${f(y + 6 + (1 - Math.abs(u)) * 6)} L${f(u * (w + b * .8))},${f(y + 6 + (1 - Math.abs(u)) * 10)}`, 1.8, d, .6)));   // straw lines out along the brim
  o.push(P(CROWN.dome(cw, y, top), c, 7));
  o.push(...[.16, .3, .42].map(t => { const [xx, yy] = domeRing(cw, y, top, t); return L(`M${f(-xx + 4)},${f(yy)} Q0,${f(yy + 9)} ${f(xx - 4)},${f(yy)}`, 2.2, d, .75); }));   // woven rings on the crown
  o.push(band(cw, y, 16, bc));
  if (v === 'back') o.push(P(`M-10,${f(y - 10)} L-24,${f(y + 22)} L-8,${f(y + 18)} Z M10,${f(y - 10)} L24,${f(y + 22)} L8,${f(y + 18)} Z`, bc, 4), ring(0, y - 8, 9, shade(bc, .85), 4));   // band knot at the back
  o.push(shine(-cw * .62, y - 24, -cw * .66, top + 16, -cw * .36, top + 4, 6, tint(c, .55)));
  return o; });
hat('conical', 'Conical straw hat', 'East and Southeast Asia: rice farmer, boatman', PP => { const { v, y, w } = G(PP, 6, 0, 0), c = PP.wearCol || '#e2c078', top = PP.crownY - 44;
  return [P(`M${f(-w - 78)},${f(y + 10)} L0,${f(top)} L${f(w + 78)},${f(y + 10)} Q0,${f(y + 34)} ${f(-w - 78)},${f(y + 10)} Z`, c, 7), ...[-.66, -.33, 0, .33, .66].map(u => L(`M0,${f(top + 6)} L${f(u * (w + 70))},${f(y + 14 + (1 - Math.abs(u)) * 8)}`, 2.2, shade(c, .72), .85)), L(`M${f(-w * .5 - 30)},${f(y - 18)} Q0,${f(y - 6)} ${f(w * .5 + 30)},${f(y - 18)}`, 2.4, shade(c, .72)), ...(v === 'front' ? [L(`M${f(-w + 6)},${f(y + 14)} Q${f(-w + 16)},80 -20,108 M${f(w - 6)},${f(y + 14)} Q${f(w - 16)},80 20,108`, 4, '#8a5a34')] : [])]; });
hat('pith', 'Pith helmet', '1880s-1930s: explorer, safari, archaeologist', PP => { const { v, y, w, top } = G(PP, 0, 2, 50), c = PP.wearCol || '#d9c9a0';
  return [brimAround(w, y, v === 'side' ? 30 : 24, c, { sag: 20, rise: 4 }), P(CROWN.dome(w, y, top), c, 7), band(w, y, 14, '#8a6a3a'), L(`M0,${f(top - 10)} L0,${f(y - 16)}`, 2.6, shade(c, .72)), ring(0, top - 12, 8, c, 4.5)]; });
// ---- caps
hat('baseball', 'Baseball cap', 'today: kid, trucker, coach, delivery', PP => { const { v, y, w, top } = G(PP, 0, 2, 38), c = PP.wearCol || '#2f6fc0';
  return [P(CROWN.dome(w, y, top), c, 7), ...[-.5, 0, .5].map(u => L(`M0,${f(top - 8)} Q${f(u * w * .9)},${f((y + top) / 2)} ${f(u * w * 1.4)},${f(y)}`, 2.2, shade(c, .72), .8)), ring(0, top - 12, 6, shade(c, .8), 4), ...(v === 'front' ? [ring(0, y - 34, 15, WHITE, 4), `<text x="0" y="${f(y - 27)}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="${RED}">R</text>`] : []), ...(v === 'back' ? [P(`M-22,${f(y - 2)} Q0,${f(y - 30)} 22,${f(y - 2)} Z`, '#f0d9c4', 4), L(`M-22,${f(y)} L22,${f(y)}`, 6, shade(c, .7))] : []), ...peak(v, w, y, 50, shade(c, .82))]; });
hat('capBack', 'Cap worn backwards', 'today: skater, rapper, mechanic', PP => { const { v, y, w, top } = G(PP, 0, 2, 38), c = PP.wearCol || '#e23b3b';
  return [P(CROWN.dome(w, y, top), c, 7), ...(v === 'front' ? [P(`M-24,${f(y)} Q0,${f(y - 34)} 24,${f(y)} Z`, '#f6f4f0', 4), L(`M-24,${f(y + 2)} L24,${f(y + 2)}`, 6, shade(c, .7))] : []), ...(v === 'back' ? peak('front', w, y, 46, shade(c, .82)) : []), ...(v === 'side' ? [P(`M${f(-w + 14)},${f(y - 12)} L${f(-w - 46)},${f(y + 2)} Q${f(-w - 50)},${f(y + 12)} ${f(-w - 40)},${f(y + 12)} L${f(-w + 14)},${f(y + 4)} Z`, shade(c, .82), 5.5)] : []), ring(0, top - 12, 6, shade(c, .8), 4)]; });
hat('beanie', 'Beanie', 'today: winter, hipster, burglar, dock worker', PP => { const { v, y, w, top } = G(PP, 2, 6, 44), c = PP.wearCol || '#3f7f6a';
  return [P(CROWN.dome(w, y - 20, top), c, 7), P(`M${f(-w - 2)},${f(y - 26)} Q0,${f(y - 16)} ${f(w + 2)},${f(y - 26)} L${f(w + 2)},${f(y)} Q0,${f(y + 12)} ${f(-w - 2)},${f(y)} Z`, tint(c, .16), 6.5), ...[-.75, -.5, -.25, 0, .25, .5, .75].map(u => L(`M${f(u * w)},${f(y - 20 + (1 - u * u) * 6)} L${f(u * w)},${f(y - 2 + (1 - u * u) * 8)}`, 2.4, shade(c, .7), .85)), ring(0, top - 22, 17, '#f2efe8', 5)]; });
hat('police', 'Police cap', 'police, guard, pilot, station master', PP => { const { v, y, w, top } = G(PP, 0, 2, 40), c = PP.wearCol || NAVY;
  return [P(`M${f(-w)},${f(y)} L${f(-w - 16)},${f(top + 8)} Q0,${f(top - 26)} ${f(w + 16)},${f(top + 8)} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, c, 7), band(w, y, 16, BLACK), ...(v === 'back' ? [] : [P(`M0,${f(y - 46)} l11,6 l-2,13 l-9,7 l-9,-7 l-2,-13 Z`, GOLD, 3.5)]), ...peak(v, w, y, 38, BLACK)]; });
hat('sailor', 'Sailor cap', 'navy sailor, ship cook, cruise', PP => { const { v, y, w, top } = G(PP, -4, 0, 28), c = PP.wearCol || WHITE;
  return [P(`M${f(-w)},${f(y)} L${f(-w - 12)},${f(top + 4)} Q0,${f(top - 14)} ${f(w + 12)},${f(top + 4)} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, c, 7), band(w, y, 14, NAVY), ...(v === 'back' ? [P(`M-6,${f(y)} L-20,${f(y + 40)} L-6,${f(y + 34)} Z M6,${f(y)} L20,${f(y + 40)} L6,${f(y + 34)} Z`, NAVY, 3.5)] : [L(`M-8,${f(y - 2)} q8,-10 16,0`, 3, GOLD)])]; });
hat('graduation', 'Graduation cap', 'graduate, professor', PP => { const { v, y, w } = G(PP, -8, -6, 0), c = PP.wearCol || '#2a2630', t = PP.crownY - 26;
  return [P(CROWN.dome(w, y, t + 10), c, 7), P(v === 'side' ? `M${f(-w - 40)},${f(t)} L0,${f(t - 16)} L${f(w + 40)},${f(t)} L0,${f(t + 14)} Z` : `M${f(-w - 46)},${f(t)} L0,${f(t - 26)} L${f(w + 46)},${f(t)} L0,${f(t + 24)} Z`, c, 6.5), ring(0, t - 2, 6, GOLD, 3.5), L(`M0,${f(t - 2)} Q${f(w * .7)},${f(t + 6)} ${f(w + 30)},${f(t + 6)} L${f(w + 30)},${f(t + 46)}`, 3.4, GOLD), P(`M${f(w + 24)},${f(t + 44)} l12,0 l4,26 l-20,0 Z`, GOLD, 3)]; });
hat('nurse', 'Nurse cap', '1940s-60s nurse', PP => { const { v, y, w } = G(PP, -22, -18, 0), t = PP.crownY - 30;
  return v === 'back' ? [P(`M${f(-w)},${f(y)} L${f(-w + 6)},${f(t)} L${f(w - 6)},${f(t)} L${f(w)},${f(y)} Z`, WHITE, 6)] : [P(`M${f(-w)},${f(y)} L${f(-w - 12)},${f(t)} Q0,${f(t - 14)} ${f(w + 12)},${f(t)} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, WHITE, 6.5), L(`M-12,${f((y + t) / 2)} l24,0 M0,${f((y + t) / 2 - 12)} l0,24`, 8, RED)]; });
// ---- tall and special
hat('chef', 'Chef toque', 'chef, baker, pizza cook', PP => { const { v, y, w } = G(PP, -4, 0, 0), t = PP.crownY - 120, c = PP.wearCol || WHITE;
  return [P(`M${f(-w + 4)},${f(y - 20)} C${f(-w - 44)},${f(t + 60)} ${f(-w - 20)},${f(t - 10)} ${f(-w * .34)},${f(t + 8)} C${f(-w * .2)},${f(t - 30)} ${f(w * .2)},${f(t - 30)} ${f(w * .34)},${f(t + 8)} C${f(w + 20)},${f(t - 10)} ${f(w + 44)},${f(t + 60)} ${f(w - 4)},${f(y - 20)} Z`, c, 7), L(`M${f(-w * .34)},${f(t + 8)} Q${f(-w * .3)},${f(t + 50)} ${f(-w * .4)},${f(y - 30)} M${f(w * .34)},${f(t + 8)} Q${f(w * .3)},${f(t + 50)} ${f(w * .4)},${f(y - 30)}`, 2.6, '#c9c4ba'), band(w, y, 26, c, 6), ...[-.5, 0, .5].map(u => L(`M${f(u * w)},${f(y - 20)} l0,16`, 2.4, '#c9c4ba'))]; });
hat('crown', 'King crown', 'king, queen, prince', PP => { const { v, y, w } = G(PP, -14, -8, 0), t = y - 62, c = PP.wearCol || GOLD, n = 5, pts = [];
  for (let k = 0; k <= n * 2; k++) { const u = -1 + k / n, x = u * w * 1.06; pts.push(`${f(x)},${f(k % 2 ? t + 30 : t - (1 - Math.abs(u)) * 8)}`); }
  return [P(`M${f(-w)},${f(y)} L${pts.join(' L')} L${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, c, 6.5, 'data-flat="1"'), band(w, y, 16, '#d8a520', 4), ...[-.6, 0, .6].map((u, k) => ring(u * w, y - 8, 6, ['#d8473c', '#3aa0d8', '#3fb66a'][k], 3)), ...[0, 2, 4, 6, 8, 10].map(k => ring((-1 + k / n) * w * 1.06, t - (1 - Math.abs(-1 + k / n)) * 8 - 6, 6, WHITE, 3)), shine(-w * .7, y - 24, -w * .72, t + 26, -w * .6, t + 10, 5)]; });
hat('jester', 'Jester cap', 'medieval court fool, joker', PP => { const { v, y, w } = G(PP, 0, 4, 0), t = PP.crownY - 20, cs = ['#d8473c', '#3fb66a', '#7a3fa0'];
  const horn = (s, c) => P(`M${f(s * w * .1)},${f(t + 10)} Q${f(s * w * .9)},${f(t - 90)} ${f(s * (w + 70))},${f(t - 10)} Q${f(s * w * 1.1)},${f(t - 20)} ${f(s * w)},${f(y)} L${f(s * w * .1)},${f(y)} Z`, c, 6.5);
  return [horn(-1, cs[0]), horn(1, cs[1]), P(`M${f(-w * .4)},${f(y)} Q${f(v === 'side' ? -30 : 0)},${f(t - 130)} ${f(v === 'side' ? -50 : 10)},${f(t - 120)} Q${f(w * .3)},${f(t - 40)} ${f(w * .4)},${f(y)} Z`, cs[2], 6.5), ring(-(w + 70), t - 8, 10, GOLD, 4), ring(w + 70, t - 8, 10, GOLD, 4), ring(v === 'side' ? -50 : 10, t - 124, 10, GOLD, 4), band(w, y, 14, GOLD, 4)]; });
hat('wizard', 'Wizard hat', 'fantasy wizard, astrologer', PP => { const { v, y, w, top } = G(PP, 0, 2, 170), c = PP.wearCol || '#3a4fb0';
  return [brimAround(w, y, 30, c, { sag: 16, rise: 10 }), P(CROWN.cone(w * .94, y, top, v === 'side' ? -50 : 40, v === 'side' ? -34 : 30), c, 7), star(-w * .2, y - 50, 11, GOLD), star(w * .3, y - 86, 8, GOLD), dot(w * .1, y - 30, 4, GOLD), P(`M${f(-w * .5)},${f(y - 90)} a15,15 0 1,0 14,22 a12,12 0 1,1 -14,-22 Z`, GOLD, 3)]; });
hat('party', 'Party hat', 'birthday, New Year', PP => { const { v, y, w } = G(PP, -30, -34, 0), t = PP.crownY - 110, x = v === 'side' ? 0 : 20;
  return [P(`M${f(x - w)},${f(y)} L${f(x)},${f(t)} L${f(x + w)},${f(y)} Q${f(x)},${f(y + 12)} ${f(x - w)},${f(y)} Z`, '#f2c230', 6.5), ...[0, 1, 2].map(k => L(`M${f(x - w * (1 - (k + 1) * .26))},${f(y - (k + 1) * (y - t) * .26 + 4)} Q${f(x)},${f(y - (k + 1) * (y - t) * .26 + 12)} ${f(x + w * (1 - (k + 1) * .26))},${f(y - (k + 1) * (y - t) * .26 + 4)}`, 7, ['#e8466a', '#3aa0d8', '#3fb66a'][k])), ...[0, 1, 2, 3, 4, 5].map(k => L(`M${f(x)},${f(t)} l${f(Math.cos(k * 1.05 - 2.6) * 20)},${f(Math.sin(k * 1.05 - 2.6) * 20)}`, 4, ['#e8466a', '#3aa0d8', '#3fb66a'][k % 3]))]; });
hat('santa', 'Santa hat', 'Christmas', PP => { const { v, y, w } = G(PP, 0, 6, 0), t = PP.crownY - 78, c = PP.wearCol || '#d8343a';
  const cone = P(`M${f(-w)},${f(y - 8)} C${f(-w)},${f(t + 10)} ${f(-w * .1)},${f(t - 26)} ${f(w * .55)},${f(t + 6)} C${f(w + 26)},${f(t + 30)} ${f(w + 44)},${f(t + 70)} ${f(w + 40)},${f(y - 34)} C${f(w + 30)},${f(t + 84)} ${f(w + 8)},${f(t + 70)} ${f(w)},${f(y - 8)} Z`, c, 7);
  const fur = P(`M${f(-w - 6)},${f(y - 24)} Q0,${f(y - 12)} ${f(w + 6)},${f(y - 24)} Q${f(w + 14)},${f(y - 6)} ${f(w + 6)},${f(y + 6)} Q0,${f(y + 18)} ${f(-w - 6)},${f(y + 6)} Q${f(-w - 14)},${f(y - 6)} ${f(-w - 6)},${f(y - 24)} Z`, WHITE, 6.5);
  const pom = ring(w + 40, y - 26, 17, WHITE, 5.5), tip = cone + pom;
  return [v === 'side' ? `<g transform="scale(-1,1)">${tip}</g>` : tip, fur]; });
hat('fez', 'Fez', 'Ottoman, Morocco, magician', PP => { const { v, y, w } = G(PP, -18, -16, 0), t = PP.crownY - 66, c = PP.wearCol || '#b8323a';
  return [P(CROWN.cyl(w, y, t, .78), c, 7), dot(0, t - 2, 5, BLACK), L(`M0,${f(t - 2)} Q${f(w)},${f(t + 6)} ${f(w + 8)},${f(t + 50)}`, 3.4, BLACK), P(`M${f(w + 2)},${f(t + 48)} l12,0 l3,26 l-18,0 Z`, BLACK, 3)]; });
hat('ushanka', 'Fur ushanka', 'Russia, Siberia, winter soldier', PP => { const { v, y, w, top } = G(PP, 2, 8, 36), c = PP.wearCol || '#7a5a3c', o = [P(CROWN.dome(w, y, top), c, 7)];
  if (v === 'side') o.push(P(`M${f(-w * .5)},${f(y - 30)} L${f(w * .1)},${f(y - 30)} L${f(w * .16)},${f(y + 70)} Q${f(-w * .2)},${f(y + 84)} ${f(-w * .56)},${f(y + 70)} Z`, tint(c, .14), 6.5));
  else o.push(...[-1, 1].map(s => P(`M${f(s * (w + 4))},${f(y - 30)} L${f(s * (w - 30))},${f(y - 30)} L${f(s * (w - 34))},${f(y + 74)} Q${f(s * (w - 10))},${f(y + 88)} ${f(s * (w + 10))},${f(y + 74)} Z`, tint(c, .14), 6.5)));
  if (v !== 'back') o.push(P(`M${f(-w * .7)},${f(y)} Q0,${f(y + 12)} ${f(w * .7)},${f(y)} L${f(w * .62)},${f(y - 44)} Q0,${f(y - 34)} ${f(-w * .62)},${f(y - 44)} Z`, tint(c, .14), 6), star(0, y - 20, 11, RED));
  return [...o, ...[-.5, 0, .5].map(u => L(`M${f(u * w)},${f(top + 10)} l3,10 l3,-10`, 2.4, shade(c, .62)))]; });
hat('nemes', 'Pharaoh nemes', 'ancient Egypt pharaoh', PP => { const { v, y } = G(PP, 0, 0, 0), c = PP.wearCol || GOLD, d = '#2f4f9a', st = (pts) => pts.map(([a, b, e, g]) => L(`M${a},${b} L${e},${g}`, 6, d));
  if (v === 'back') return [P('M-118,90 C-130,-150 130,-150 118,90 L60,150 L-60,150 Z', c, 7), ...st([[-104, -40, 104, -40], [-112, 0, 112, 0], [-114, 40, 114, 40], [-104, 84, 104, 84], [-80, 124, 80, 124]]), P('M-14,150 L14,150 L10,230 L-10,230 Z', c, 5)];
  if (v === 'side') return [P(`M70,${f(y)} C60,-150 -130,-140 -120,0 L-110,150 L-30,150 L-40,40 C-40,0 -10,-30 30,-40 Z`, c, 7), ...st([[-116, -30, -20, -36], [-120, 10, -40, 6], [-116, 50, -40, 46], [-114, 90, -38, 88], [-112, 128, -34, 126]]), P(`M68,${f(y - 6)} q26,-14 20,-40 q-16,6 -20,26 Z`, '#3fb66a', 4)];
  return [P(`M0,-134 C-110,-134 -128,-40 -120,20 L-128,150 L-60,150 L-78,30 C-84,-20 -60,${f(y)} 0,${f(y)} C60,${f(y)} 84,-20 78,30 L60,150 L128,150 L120,20 C128,-40 110,-134 0,-134 Z`, c, 7), ...st([[-116, -40, -70, -24], [-122, 0, -80, 10], [-124, 40, -78, 44], [-126, 80, -72, 84], [-128, 120, -66, 122], [116, -40, 70, -24], [122, 0, 80, 10], [124, 40, 78, 44], [126, 80, 72, 84], [128, 120, 66, 122], [-50, -100, 50, -100], [-80, -70, 80, -70]]), P(`M-8,${f(y - 4)} q-6,-34 8,-44 q14,10 8,44 Z`, '#3fb66a', 4), dot(0, y - 36, 3, RED)]; }, { covers: true });
hat('mitre', 'Bishop mitre', 'bishop, pope, chess piece', PP => { const { v, y, w } = G(PP, -6, -2, 0), t = PP.crownY - 130, c = PP.wearCol || WHITE;
  return v === 'side' ? [P(`M${f(-w * .5)},${f(y)} L${f(-w * .6)},${f(t + 80)} L0,${f(t)} L${f(w * .6)},${f(t + 80)} L${f(w * .5)},${f(y)} Z`, c, 7), band(w * .5, y, 16, GOLD, 4)] : [P(`M${f(-w)},${f(y)} Q${f(-w - 14)},${f(t + 90)} 0,${f(t)} Q${f(w + 14)},${f(t + 90)} ${f(w)},${f(y)} Q0,${f(y + 10)} ${f(-w)},${f(y)} Z`, c, 7), L(`M0,${f(t + 16)} L0,${f(y - 18)} M${f(-w * .6)},${f(y - 60)} L${f(w * .6)},${f(y - 60)}`, 9, GOLD), band(w, y, 16, GOLD, 4), ...(v === 'back' ? [P(`M-22,${f(y)} L-28,${f(y + 70)} L-10,${f(y + 70)} L-8,${f(y)} Z M22,${f(y)} L28,${f(y + 70)} L10,${f(y + 70)} L8,${f(y)} Z`, c, 4)] : [])]; });
hat('headscarf', 'Headscarf (babushka)', 'old country grandmother, farm woman', PP => { const c = '#c8475a', d = shade(c, .74), dots = pts => pts.map(([x, y]) => dot(x, y, 5, '#f6e7c8'));
  if (PP.view === 'back') return [P('M-112,-10 C-120,-150 120,-150 112,-10 Q60,90 0,150 Q-60,90 -112,-10 Z', c, 7.5), ...dots([[-60, -70], [40, -84], [70, -20], [-30, -10], [10, 60], [-70, 20]])];
  if (PP.view === 'side') return [P('M64,-70 C40,-150 -124,-140 -118,-10 C-116,50 -70,96 -10,104 L40,112 L30,92 C0,70 -10,30 0,-10 C10,-40 40,-56 64,-62 Z', c, 7.5), P('M30,96 L62,134 L40,140 L22,112 Z', c, 5), ...dots([[-70, -70], [-20, -100], [-90, -10], [-50, 30], [-30, -40]])];
  return [P(`M0,-130 C-100,-130 -124,-40 -118,10 C-114,60 -90,90 -50,104 L-30,84 C-70,60 -88,20 -84,-20 C-80,-60 -40,${f(PP.brimY)} 0,${f(PP.brimY)} C40,${f(PP.brimY)} 80,-60 84,-20 C88,20 70,60 30,84 L50,104 C90,90 114,60 118,10 C124,-40 100,-130 0,-130 Z`, c, 7.5), P('M-34,98 L0,112 L34,98 L20,124 L0,116 L-20,124 Z', c, 5), P('M-8,116 L-30,160 L-6,150 Z M8,116 L30,160 L6,150 Z', c, 5), ...dots([[-70, -90], [0, -108], [70, -90], [-100, -30], [100, -30], [-102, 30], [102, 30]]), L('M-60,-60 Q0,-84 60,-60', 3, d)]; }, { covers: true });
hat('hood', 'Hoodie hood up', 'today: teen, hacker, boxer, monk-like', PP => { const c = '#5f6b7a', d = shade(c, .72);
  if (PP.view === 'back') return [P('M-116,0 C-124,-156 124,-156 116,0 C116,70 80,116 0,120 C-80,116 -116,70 -116,0 Z', c, 7.5), L('M0,-136 Q-6,0 0,112', 3, d)];
  if (PP.view === 'side') return [P('M70,-64 C50,-156 -130,-146 -122,-6 C-118,70 -70,116 -10,118 L50,116 C30,90 4,60 4,10 C4,-30 30,-54 70,-58 Z', c, 7.5), L('M-40,-130 Q-90,-40 -60,90', 3, d), L('M40,100 l6,40', 4, WHITE)];
  return [P(`M0,-136 C-110,-136 -126,-40 -120,20 C-116,80 -70,118 0,122 C70,118 116,80 120,20 C126,-40 110,-136 0,-136 Z M0,${f(PP.brimY - 4)} C-56,${f(PP.brimY - 4)} -86,-24 -84,24 C-82,70 -50,96 0,98 C50,96 82,70 84,24 C86,-24 56,${f(PP.brimY - 4)} 0,${f(PP.brimY - 4)} Z`, c, 7.5, 'fill-rule="evenodd"'), L('M-90,-70 Q-60,-112 -20,-124', 3, d), L('M-26,102 l-6,44 M26,102 l6,44', 4, WHITE)]; }, { covers: true });
hat('kippah', 'Kippah', 'Jewish skullcap', PP => { const { v, y, w } = G(PP, -40, -40, 0), t = PP.crownY - 10, x = v === 'side' ? -30 : 0, c = PP.wearCol || '#2f4f9a';
  return [P(`M${f(x - w)},${f(y)} Q${f(x)},${f(t - 26)} ${f(x + w)},${f(y)} Q${f(x)},${f(y + 10)} ${f(x - w)},${f(y)} Z`, c, 6), L(`M${f(x - w + 6)},${f(y - 2)} Q${f(x)},${f(y + 6)} ${f(x + w - 6)},${f(y - 2)}`, 3, WHITE)]; });
hat('deerstalker', 'Deerstalker', '1890s detective, hunter', PP => { const { v, y, w, top } = G(PP, 0, 4, 36), c = PP.wearCol || '#9a7b4f', o = [P(CROWN.dome(w, y, top), c, 7)];
  for (let k = -2; k <= 2; k++) o.push(L(`M${f(k * w * .4)},${f(y - 2)} Q${f(k * w * .34)},${f((y + top) / 2)} ${f(k * w * .16)},${f(top - 6)}`, 2.2, shade(c, .7), .8)); o.push(L(`M${f(-w)},${f(y - 30)} Q0,${f(y - 20)} ${f(w)},${f(y - 30)}`, 2.2, shade(c, .7), .8));
  o.push(P(`M-16,${f(top - 10)} Q0,${f(top - 36)} 16,${f(top - 10)} Q0,${f(top)} -16,${f(top - 10)} Z`, tint(c, .1), 5), ring(0, top - 18, 5, shade(c, .7), 3));
  if (v === 'side') o.push(...peak('side', w, y, 44, c), P(`M${f(-w + 14)},${f(y - 12)} L${f(-w - 40)},${f(y + 4)} L${f(-w - 34)},${f(y + 14)} L${f(-w + 14)},${f(y + 4)} Z`, c, 5.5)); else if (v === 'front') o.push(...peak('front', w, y, 44, c));
  else o.push(...peak('front', w, y, 44, c));
  return o; });
hat('propeller', 'Propeller beanie', '1950s kid, nerd, comic fan', PP => { const { v, y, w, top } = G(PP, -16, -6, 20), cs = ['#d8473c', '#f2c230', '#3aa0d8', '#3fb66a'];
  return [...[0, 1, 2, 3].map(k => P(`M${f(-w + k * w / 2)},${f(y - (1 - Math.abs(-1 + k / 2) ** 2) * 0)} Q${f(-w + k * w / 2)},${f(top - 18)} 0,${f(top - 20)} Q${f(-w + (k + 1) * w / 2)},${f(top - 18)} ${f(-w + (k + 1) * w / 2)},${f(y)} Z`, cs[k], 5.5)), L(`M${f(-w)},${f(y)} Q0,${f(y + 10)} ${f(w)},${f(y)}`, 7, INK), L(`M0,${f(top - 20)} l0,-22`, 5), P(`M0,${f(top - 44)} Q-40,${f(top - 62)} -50,${f(top - 40)} Q-30,${f(top - 34)} 0,${f(top - 44)} Z`, '#d8473c', 4), P(`M0,${f(top - 44)} Q40,${f(top - 26)} 50,${f(top - 48)} Q30,${f(top - 54)} 0,${f(top - 44)} Z`, '#3aa0d8', 4), ring(0, top - 44, 5, GOLD, 3)]; });
export const HATS2 = H;

// ============ HEAD PIECES ============  p(Pp) -> svg[]   (sit ON the hair edge via Pp.onHair)
const Q = {};
const pc = (key, label, fn) => { Q[key] = Object.assign(fn, { label }); };
const at = (Pp, f0, s0, b0, push = -4) => Pp.onHair(Pp.view === 'back' ? (b0 ?? f0) : Pp.view === 'side' ? s0 : f0, push);
pc('flowerCrown', 'Flower crown', Pp => { const o = [], a0 = Pp.view === 'side' ? -30 : 205, a1 = Pp.view === 'side' ? -160 : 335, n = 7, cs = ['#f27aa0', '#f2d24a', '#b06fe0', '#f58a3a'];
  for (let k = 0; k <= n; k++) { const [x, y] = Pp.onHair(a0 + (a1 - a0) * k / n, -8); o.push(ell(x - 10, y + 6, 9, 5, '#5fa85a', 3, 30)); for (let j = 0; j < 5; j++) { const a = j * 1.257; o.push(ring(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7.5, cs[k % 4], 3)); } o.push(ring(x, y, 5.5, '#fff3b0', 2.6)); } return o; });
pc('headphones', 'Headphones', Pp => { if (Pp.view === 'side') return [L(`M-4,-20 Q-10,${f(Pp.crownY - 30)} -4,${f(Pp.crownY - 34)}`, 13, INK), L(`M-4,-20 Q-10,${f(Pp.crownY - 30)} -4,${f(Pp.crownY - 34)}`, 6, '#4a4f5a'), ring(-4, 8, 32, '#3a3f4a', 7), ring(-4, 8, 16, '#e8466a', 4)];
  const pts = []; for (let k = 0; k <= 16; k++) pts.push(Pp.onHair(188 + 164 * k / 16, 10)); const d = 'M' + pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L');
  return [L(d, 15, INK), L(d, 8, '#4a4f5a'), ...[-1, 1].map(s => P(`M${s * 96},-30 Q${s * 132},-30 ${s * 132},8 Q${s * 132},46 ${s * 96},46 Z`, '#3a3f4a', 6.5)), ...[-1, 1].map(s => L(`M${s * 118},-10 L${s * 118},26`, 5, '#e8466a'))]; });
pc('catEars', 'Cat ears', Pp => { const one = (x, y, s) => [P(`M${f(x - 26)},${f(y + 14)} L${f(x + s * 6)},${f(y - 50)} L${f(x + 26)},${f(y + 14)} Z`, '#2a2630', 6), P(`M${f(x - 12)},${f(y + 8)} L${f(x + s * 4)},${f(y - 26)} L${f(x + 12)},${f(y + 8)} Z`, '#f58aa0', 0.1)];
  if (Pp.view === 'side') { const [x, y] = Pp.onHair(-100, -4); return one(x, y, -1); } const a = Pp.onHair(-128, -4), b = Pp.onHair(-52, -4); return [...one(a[0], a[1], -1), ...one(b[0], b[1], 1)]; });
pc('bunnyEars', 'Bunny ears', Pp => { const one = (x, y, lean) => [P(`M${f(x - 16)},${f(y + 10)} C${f(x - 30 + lean)},${f(y - 70)} ${f(x - 14 + lean)},${f(y - 130)} ${f(x + lean)},${f(y - 130)} C${f(x + 14 + lean)},${f(y - 130)} ${f(x + 30 + lean)},${f(y - 70)} ${f(x + 16)},${f(y + 10)} Z`, WHITE, 6), P(`M${f(x - 6)},${f(y - 4)} C${f(x - 14 + lean)},${f(y - 60)} ${f(x - 6 + lean)},${f(y - 108)} ${f(x + lean)},${f(y - 108)} C${f(x + 6 + lean)},${f(y - 108)} ${f(x + 14 + lean)},${f(y - 60)} ${f(x + 6)},${f(y - 4)} Z`, '#f7a6b4', 0.1)];
  if (Pp.view === 'side') { const [x, y] = Pp.onHair(-100, -4); return one(x, y, -14); } const a = Pp.onHair(-112, -4), b = Pp.onHair(-68, -4); return [...one(a[0], a[1], -16), ...one(b[0], b[1], 16)]; });
pc('devilHorns', 'Devil horns', Pp => { const one = (x, y, s) => [P(`M${f(x - 14)},${f(y + 10)} Q${f(x - s * 4)},${f(y - 30)} ${f(x + s * 22)},${f(y - 52)} Q${f(x + s * 20)},${f(y - 10)} ${f(x + 14)},${f(y + 10)} Z`, '#c8322c', 6), L(`M${f(x - s * 2)},${f(y - 8)} q${s * 6},-12 ${s * 14},-22`, 3, '#ff8a7a')];
  if (Pp.view === 'side') { const [x, y] = Pp.onHair(-84, -4); return one(x, y, 1); } const a = Pp.onHair(-126, -4), b = Pp.onHair(-54, -4); return [...one(a[0], a[1], -1), ...one(b[0], b[1], 1)]; });
pc('halo', 'Halo', Pp => { const y = Pp.crownY - 46, rx = Pp.view === 'side' ? 58 : 64; return [`<ellipse cx="0" cy="${f(y)}" rx="${rx}" ry="16" fill="none" stroke="${INK}" stroke-width="15"/>`, `<ellipse cx="0" cy="${f(y)}" rx="${rx}" ry="16" fill="none" stroke="${GOLD}" stroke-width="8"/>`, L(`M${-rx + 12},${f(y - 8)} q16,-10 34,-10`, 3, '#fff6c0')]; });
pc('antlers', 'Reindeer antlers', Pp => { const one = (x, y, s) => { const d = `M${f(x)},${f(y + 8)} Q${f(x + s * 8)},${f(y - 40)} ${f(x + s * 30)},${f(y - 80)} M${f(x + s * 8)},${f(y - 30)} L${f(x + s * 36)},${f(y - 34)} M${f(x + s * 18)},${f(y - 56)} L${f(x - s * 4)},${f(y - 78)} M${f(x + s * 26)},${f(y - 72)} L${f(x + s * 50)},${f(y - 70)}`; return [L(d, 15, INK), L(d, 8, '#a8743c')]; };
  if (Pp.view === 'side') { const [x, y] = Pp.onHair(-96, -4); return one(x, y, -1); } const a = Pp.onHair(-122, -4), b = Pp.onHair(-58, -4); return [...one(a[0], a[1], -1), ...one(b[0], b[1], 1)]; });
pc('unicornHorn', 'Unicorn horn', Pp => { const [x, y] = Pp.view === 'side' ? Pp.onHair(-64, -4) : Pp.onHair(-90, -4), lean = Pp.view === 'side' ? 24 : 0;
  return Pp.view === 'back' ? [] : [P(`M${f(x - 15)},${f(y + 10)} L${f(x + lean)},${f(y - 84)} L${f(x + 15)},${f(y + 10)} Z`, '#fbe9a6', 6), ...[0, 1, 2].map(k => L(`M${f(x - 12 + k * 4 + lean * k * .1)},${f(y - 8 - k * 24)} l${f(22 - k * 6)},-10`, 3, '#e2b84a'))]; });
pc('feather', 'Feather', Pp => { const [x, y] = at(Pp, -132, -150, -48, -6), fc = Pp.wearCol || '#e8466a';   // wearCol = colour option (moonrakers 2026-11-13, CB MIX AND MATCH)
  return [P(`M${f(x + 4)},${f(y + 16)} C${f(x - 44)},${f(y - 30)} ${f(x - 40)},${f(y - 90)} ${f(x - 6)},${f(y - 116)} C${f(x + 18)},${f(y - 80)} ${f(x + 24)},${f(y - 30)} ${f(x + 4)},${f(y + 16)} Z`, fc, 5.5), L(`M${f(x + 4)},${f(y + 20)} Q${f(x - 12)},${f(y - 50)} ${f(x - 6)},${f(y - 108)}`, 3, '#f6f4f0'), L(`M${f(x - 20)},${f(y - 40)} l12,10 M${f(x - 22)},${f(y - 64)} l14,10 M${f(x + 12)},${f(y - 44)} l-12,8`, 2.4, shade(fc, .7))]; });
// MALLARD FEATHER (moonrakers 2026-11-13): a duck's wing feather, brown-grey vane (wearCol), the blue speculum patch (accentCol) edged white then black,
// white quill, barb lines, darker tip. Tucked in the band like 'feather'. Reads as a feather, never as a leaf.
pc('mallardFeather', 'Mallard feather', Pp => { const [x, y] = at(Pp, -132, -150, -48, -6), vc = Pp.wearCol || '#7a6652', sc = Pp.accentCol || '#3a5cc0', id = 'mf' + (GID++);
  const vane = `M${f(x + 4)},${f(y + 16)} C${f(x - 38)},${f(y - 26)} ${f(x - 40)},${f(y - 92)} ${f(x - 10)},${f(y - 124)} C${f(x + 12)},${f(y - 88)} ${f(x + 20)},${f(y - 30)} ${f(x + 4)},${f(y + 16)} Z`;
  const pt = (a, b2) => `M${f(x - 50)},${f(y + a)} L${f(x + 40)},${f(y + a - 22)} L${f(x + 40)},${f(y + b2 - 22)} L${f(x - 50)},${f(y + b2)} Z`;
  return [P(vane, vc, 5.5), `<defs><clipPath id="${id}"><path d="${vane}"/></clipPath></defs><g clip-path="url(#${id})">`
    + `<path d="${pt(-74, -46)}" fill="${INK}"/><path d="${pt(-71, -49)}" fill="#ffffff"/><path d="${pt(-68, -52)}" fill="${sc}"/>`
    + `<path d="${pt(-130, -102)}" fill="${shade(vc, .72)}" opacity=".7"/></g>`
    + `<path d="${vane}" fill="none" stroke="${INK}" stroke-width="${f(5.5 * HAT_INK)}" stroke-linejoin="round"/>`,
    L(`M${f(x + 4)},${f(y + 20)} Q${f(x - 12)},${f(y - 50)} ${f(x - 9)},${f(y - 116)}`, 3, '#f6f4f0'),
    L(`M${f(x - 20)},${f(y - 10)} l12,10 M${f(x - 22)},${f(y - 26)} l13,10 M${f(x + 10)},${f(y - 14)} l-11,8 M${f(x - 24)},${f(y - 96)} l12,9`, 2.2, shade(vc, .62))]; });
pc('sweatband', 'Sweatband', Pp => { const y = Pp.brimY + 2, w = Pp.widthAt(y) + 4; return [band(w, y, 22, WHITE, 5), L(`M${f(-w + 4)},${f(y - 15)} Q0,${f(y - 6)} ${f(w - 4)},${f(y - 15)}`, 3.4, RED), L(`M${f(-w + 4)},${f(y - 7)} Q0,${f(y + 2)} ${f(w - 4)},${f(y - 7)}`, 3.4, '#2f62b8')]; });
pc('bigBow', 'Big bow on top', Pp => { const [x, y] = at(Pp, -90, -96, -90, -2), s = Pp.view === 'side' ? .6 : 1;
  return [P(`M${f(x)},${f(y - 6)} L${f(x - 62 * s)},${f(y - 46)} Q${f(x - 76 * s)},${f(y - 6)} ${f(x - 62 * s)},${f(y + 24)} Z`, '#e8466a', 6), P(`M${f(x)},${f(y - 6)} L${f(x + 62 * s)},${f(y - 46)} Q${f(x + 76 * s)},${f(y - 6)} ${f(x + 62 * s)},${f(y + 24)} Z`, '#e8466a', 6), ring(x, y - 8, 14, '#c22f52', 5), L(`M${f(x - 44 * s)},${f(y - 22)} l${f(20 * s)},10 M${f(x + 44 * s)},${f(y - 22)} l${f(-20 * s)},10`, 3, '#c22f52')]; });
pc('starClips', 'Star clips', Pp => Pp.view === 'back' ? [] : [[-48, GOLD, 12], [-30, '#3aa0d8', 9]].map(([a, c, r]) => { const [x, y] = Pp.onHair(Pp.view === 'side' ? a - 20 : a, -16); return star(x, y, r, c); }));
pc('headLamp', 'Head lamp', Pp => { const y = Pp.brimY - 2, w = Pp.widthAt(y) + 4, v = Pp.view, o = [band(w, y, 16, '#e8862a', 4.5), L(`M0,${f(y - 12)} L0,${f(Pp.crownY - 6)}`, 9, INK), L(`M0,${f(y - 12)} L0,${f(Pp.crownY - 6)}`, 4.5, '#e8862a')];
  if (v !== 'back') { const x = v === 'side' ? w + 4 : 0; o.push(v === 'side' ? P(`M${f(x - 16)},${f(y - 24)} L${f(x + 12)},${f(y - 28)} L${f(x + 12)},${f(y + 8)} L${f(x - 16)},${f(y + 4)} Z`, '#3a3f4a', 5) + ell(x + 13, y - 10, 6, 17, '#fff6b0', 4) : ring(x, y - 8, 21, '#3a3f4a', 5.5) + ring(x, y - 8, 12, '#fff6b0', 3.5) + dot(x - 4, y - 12, 3.5, '#ffffff')); }
  return o; });
pc('antenna', 'Alien antennae', Pp => { const one = (x, y, s) => [L(`M${f(x)},${f(y + 6)} Q${f(x + s * 6)},${f(y - 40)} ${f(x + s * 24)},${f(y - 64)}`, 11, INK), L(`M${f(x)},${f(y + 6)} Q${f(x + s * 6)},${f(y - 40)} ${f(x + s * 24)},${f(y - 64)}`, 5, '#5fb85a'), ring(x + s * 26, y - 68, 12, '#8ee06a', 5)];
  if (Pp.view === 'side') { const [x, y] = Pp.onHair(-92, -4); return one(x, y, 1); } const a = Pp.onHair(-116, -4), b = Pp.onHair(-64, -4); return [...one(a[0], a[1], -1), ...one(b[0], b[1], 1)]; });
pc('arrow', 'Arrow through the head (joke)', Pp => Pp.view === 'side' ? [ring(-30, -70, 9, '#8a5a34', 4)] : [L(`M-150,${f(Pp.crownY + 34)} L-104,${f(Pp.crownY + 30)} M104,${f(Pp.crownY + 22)} L160,${f(Pp.crownY + 18)}`, 13, INK), L(`M-150,${f(Pp.crownY + 34)} L-104,${f(Pp.crownY + 30)} M104,${f(Pp.crownY + 22)} L160,${f(Pp.crownY + 18)}`, 6, '#a8743c'), P(`M160,${f(Pp.crownY + 2)} L196,${f(Pp.crownY + 16)} L162,${f(Pp.crownY + 34)} Z`, '#9aa0ae', 5), P(`M-150,${f(Pp.crownY + 34)} l-26,-18 l10,18 l-10,18 Z`, '#d8473c', 4)]);
pc('sleepMask', 'Sleep mask pushed up', Pp => { if (Pp.view === 'back') return []; const [x, y] = Pp.view === 'side' ? Pp.onHair(-50, -16) : Pp.onHair(-90, -20), w = Pp.view === 'side' ? 26 : 58;
  return [P(`M${f(x - w)},${f(y - 14)} Q${f(x)},${f(y - 24)} ${f(x + w)},${f(y - 14)} Q${f(x + w + 6)},${f(y + 16)} ${f(x + w * .5)},${f(y + 18)} Q${f(x)},${f(y + 4)} ${f(x - w * .5)},${f(y + 18)} Q${f(x - w - 6)},${f(y + 16)} ${f(x - w)},${f(y - 14)} Z`, '#7a3fa0', 5.5), ...(Pp.view === 'side' ? [] : [L(`M${f(x - 36)},${f(y)} q10,8 20,0 M${f(x + 16)},${f(y)} q10,8 20,0`, 3, '#e0c8f4')])]; });
// EAR PENCIL (CB 2026-11-14, goldrush Clerk: "Approve, pencil behind his ear"): a short pencil stub tucked behind the wearer's RIGHT ear, sharpened point forward.
// The library pencil shape (hair_lib PIECES.pencil) at 0.74 size, re-coloured: wearCol = wood (default unpainted cedar), accentCol = the shaved point.
// Front and 3/4: on the hair over his right ear (screen-left), the point down and out, clear of the face. Side facing right (the near, right side): along the hair just
// behind the ear, the point forward-down ending at the hairline. Side facing left: the right ear is the far side, so the pencil is hidden by the head. Back: over his
// right ear (screen-right). The rig mirrors head space for dir < 0, so x is chosen before the mirror and the pencil stays on his right in every view.
pc('earPencil', 'Pencil stub behind the right ear', Pp => { const v = Pp.view, d = Pp.dir || 1, wood = Pp.wearCol || '#b5824f', point = Pp.accentCol || '#ead2a8';
  const pen = (x, y, sx, sy, rot) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${f(sx * .74)} ${f(sy * .74)})">` + PIECES.pencil({ view: 'front', onHair: () => [0, 0] }).map(t => t.replace(/#f2c230/g, wood).replace(/#f3dfc0/g, point)).join('') + '</g>';
  if (v === 'side') return d > 0 ? [pen(-46, 8, 1, -1, 6)] : [];
  if (v === 'back') return [pen(98 * d, 4, d, -1, 22 * d)];
  return [pen(-98 * d, 4, -d, -1, -22 * d)]; });
export const PIECES2 = Q;

// by key: this file first, then hair_lib
// HAT SIZE (Rick: hats sit lower and bigger on the head): scale about the brim line, drop = px lower toward the brows. {scale:1, drop:0} = v1 size.
['nemes', 'headscarf', 'hood'].forEach(k => { if (H[k]) H[k].wraps = true; }); // these wrap the whole head: never scaled
export const HAT_SIZE = { scale: 1, drop: 2 }; // v2 proposal 2026-11-12; v1 was { scale: 1, drop: 0 }
// NO BRIM SHADOW ON FACES (CB 2026-11-12 18:55 Bangkok, roller coaster film: remove the hat and hair shadow from every face, then "update this rule for all. other threads that working on chracter"):
// the soft shadow under the brim made a grey band over the eyes, so it is off. 0 = off (rule); the old v3 look was .28. Do not turn it back on without CB.
export const BRIM_SHADOW = 0;
export function wear(spec, hairKey, opts = {}) {
  const base = opts.hat ? (typeof opts.hat === 'function' ? opts.hat : H[opts.hat] || HATS[opts.hat]) : undefined;
  const sc = opts.hatScale ?? HAT_SIZE.scale, dr = opts.hatDrop ?? HAT_SIZE.drop;
  const hatFn = base && !base.wraps ? PP => { const Q2 = { ...PP, brimY: PP.brimY + dr, wearCol: opts.hatCol, bandCol: opts.bandCol }, by = Q2.brimY;
    return [`<g transform="translate(0 ${f(by)}) scale(${sc}) translate(0 ${f(-by)})">`, ...base(Q2), '</g>']; } : base && (opts.hatCol || opts.bandCol) ? Object.assign(PP => base({ ...PP, wearCol: opts.hatCol, bandCol: opts.bandCol }), base) : base;
  const hatFn2 = hatFn && !base.wraps && BRIM_SHADOW > 0 ? Object.assign(PP => { const w = PP.widthAt(PP.brimY) * .86, y = PP.brimY + (dr || 0);
    return [`<defs><filter id="hbs" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="6"/></filter></defs><ellipse cx="${PP.view === 'side' ? 10 : 0}" cy="${f(y + 12)}" rx="${f(w)}" ry="13" fill="#1a1028" opacity="${BRIM_SHADOW}" filter="url(#hbs)"/>`, ...hatFn(PP)]; }, base) : hatFn;
  const pieces = (opts.pieces || []).map(p => typeof p === 'function' ? p : Q[p] || PIECES[p]).map(fn => opts.pieceCol || opts.pieceAccent ? PP => fn({ ...PP, wearCol: opts.pieceCol, accentCol: opts.pieceAccent }) : fn);   // pieceAccent: second colour (mallardFeather speculum), moonrakers 2026-11-13
  // MIX AND MATCH (CB 04:13 "everything outfit accessoires can be match by different colors match era time age"): opts.hatCol / opts.pieceCol recolour the main colour; details, trims and the grade follow it.
  return withHair(spec, hairKey, { ...opts, hat: hatFn2, pieces });
}
