// HEAD GEAR v1: helmets, hoods and masks for the vector cast (CB 2026-11-12 03:08 Bangkok: "also helmet and mask costume").
// Works with hair_lib.mjs:  withGear(spec, hairKey, { helmet: 'knight', mask: 'medical', col, pieces })
//  - a helmet is a hat for hair_lib (drawn over the hair, never slid in 3/4). Open helmets press the hair flat and the hair still shows
//    at the sides and back (Rick's cart soldiers). Full helmets and hoods (covers: true) hide the hair; the eyes show through the opening.
//  - a mask is drawn in spec.faceTop, so it slides with the eyes and mouth in 3/4 and side views (VIEW_RULES 2) and sits UNDER the hair.
// Every piece has real parts (rivets, bands, straps, vents, stitches), per Hard Rule 2. Head space: centre 0,0, radius 100, facing +x in side view.
import { INK, shade, tint, brush } from './char2d.mjs';
import { withHair } from './hair_lib.mjs';

const f = v => (+v).toFixed(1);
let GID = 0;   // every filled part gets Rick's soft volume: lighter toward the light (top left), darker low right
const vol = c => { if (!/^#[0-9a-fA-F]{6}$/.test(c)) return ['', c]; const id = 'hg' + (GID++); return [`<defs><linearGradient id="${id}" x1="0.15" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${tint(c, .38)}"/><stop offset=".42" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, .74)}"/></linearGradient></defs>`, `url(#${id})`]; };
const P = (d, fill, sw = 7, extra = '') => { const [df, fl] = vol(fill); return df + P0(d, fl, sw, extra); };
const P0 = (d, fill, sw = 7, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const L = (d, sw = 3.4, col = INK, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;
const ring = (x, y, r, fill, sw = 5) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const dot = (x, y, r, fill) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
const ell = (x, y, rx, ry, fill, sw = 5, rot = 0) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const shine = (x0, y0, qx, qy, x1, y1, w = 7, col = '#ffffff') => brush(x0, y0, qx, qy, x1, y1, w, { col, tip: .15 });
const STEEL = '#aeb4c2', STEELD = '#7f8697', STEELL = '#e6e9f0', BRONZE = '#c8963c', BRONZED = '#96692a', GOLD = '#f2c230', LEATHER = '#8a5a34', LEATHERD = '#5f3c22', RED = '#d8473c', OLIVE = '#6b7046', WHITE = '#f6f4f0', BLACK = '#2a2630';
const rivets = (pts, col = STEELL) => pts.map(([x, y]) => dot(x, y, 3.2, col)).join('');
const plume = (x, y, col = RED, h = 70, lean = 0) => [P(`M${f(x - 12)},${f(y)} C${f(x - 40 + lean)},${f(y - h * .5)} ${f(x - 20 + lean)},${f(y - h)} ${f(x + lean)},${f(y - h)} C${f(x + 30 + lean)},${f(y - h)} ${f(x + 36 + lean)},${f(y - h * .4)} ${f(x + 12)},${f(y)} Z`, col, 6.5), L(`M${f(x)},${f(y - 6)} Q${f(x - 8 + lean)},${f(y - h * .5)} ${f(x + lean)},${f(y - h + 10)}`, 3, shade(col, .72)), shine(x - 12, y - 14, x - 22 + lean, y - h * .5, x - 8 + lean, y - h + 14, 5, tint(col, .4))];

// ============ HELMETS AND HOODS ============  h(PP) -> svg[]   (PP from hair_lib: view, crownY, brimY, widthAt(y), onHair)
const H = {};
// 1. Knight: closed bascinet with face opening, nasal bar, brow band with rivets, red plume
H.knight = PP => { const v = PP.view, o = [];
  if (v === 'back') return [P('M-112,62 C-124,-150 124,-150 112,62 Q0,84 -112,62 Z', STEEL), L('M0,-128 L0,70', 4, STEELD), L('M-108,20 Q0,40 108,20', 5, STEELD), rivets([[-80, 28], [-40, 34], [0, 36], [40, 34], [80, 28]]), ...plume(0, -122), shine(-84, 10, -92, -70, -46, -112)];
  if (v === 'side') return [P('M30,-128 C-150,-140 -130,60 -60,84 L20,84 C0,60 0,20 30,-10 L92,-22 L96,-44 C80,-100 60,-124 30,-128 Z', STEEL), P('M92,-46 L112,-6 L100,-2 L84,-34 Z', STEELD, 5), L('M-110,10 Q-40,36 16,30', 5, STEELD), rivets([[-90, 20], [-56, 30], [-22, 34], [40, -34], [70, -40]]), ...plume(-10, -126, RED, 70, -16), shine(-40, -112, -90, -80, -104, -20)];
  o.push(P('M-112,70 C-126,-150 126,-150 112,70 L62,78 C70,30 60,-24 0,-30 C-60,-24 -70,30 -62,78 Z', STEEL));
  o.push(P('M-10,-34 L10,-34 L8,26 L0,34 L-8,26 Z', STEELD, 5), L('M-108,-34 Q0,-56 108,-34', 6, STEELD), rivets([[-84, -40], [-56, -46], [-28, -50], [28, -50], [56, -46], [84, -40], [-92, 30], [92, 30]]));
  o.push(...plume(0, -122), shine(-88, 0, -96, -76, -50, -112));
  return o; };
H.knight.covers = true;
// 2. Great helm: crusader bucket, flat top, eye slit (the eyes show), gold cross, breathing holes
H.greatHelm = PP => { const v = PP.view;
  if (v === 'back') return [P('M-108,96 L-104,-116 Q0,-136 104,-116 L108,96 Q0,116 -108,96 Z', STEEL), L('M-104,-96 Q0,-80 104,-96', 5, STEELD), rivets([[-70, -92], [-24, -86], [24, -86], [70, -92]]), shine(-84, 40, -90, -40, -80, -96)];
  if (v === 'side') return [P('M-110,96 L-106,-116 Q0,-136 96,-112 L110,-30 L104,96 Q0,116 -110,96 Z M30,-30 L104,-34 L104,-12 L30,-8 Z', STEEL, 7, 'fill-rule="evenodd"'), L('M-106,-96 Q0,-80 100,-92', 5, STEELD), ...[0, 1, 2].flatMap(r => [0, 1, 2].map(c => dot(56 + c * 14, 20 + r * 16, 3.6, INK))), P('M64,-112 L74,-112 L76,-50 L62,-50 Z', GOLD, 4), shine(-86, 40, -92, -40, -82, -96)];
  return [P('M-108,96 L-104,-116 Q0,-136 104,-116 L108,96 Q0,116 -108,96 Z M-84,-34 L-12,-30 L-12,-8 L-84,-12 Z M12,-30 L84,-34 L84,-12 L12,-8 Z', STEEL, 7, 'fill-rule="evenodd"'),
    P('M-9,-118 L9,-118 L9,84 L-9,84 Z', GOLD, 4.5), P('M-96,-46 L96,-46 L96,-34 L12,-30 L-12,-30 L-96,-34 Z', GOLD, 4.5), L('M-104,-96 Q0,-80 104,-96', 5, STEELD),
    ...[-1, 1].flatMap(s => [0, 1, 2].flatMap(r => [0, 1, 2].map(c => dot(s * (30 + c * 16), 22 + r * 18, 3.6, INK)))), rivets([[-80, -100], [-40, -94], [40, -94], [80, -100]]), shine(-90, 60, -96, -20, -88, -90)]; };
H.greatHelm.covers = true;
// 3. Viking: round iron cap, rim band, nasal guard, rivet rows, two horns (cartoon classic)
H.viking = PP => { const v = PP.view, y = PP.brimY + 6, w = PP.widthAt(y) + 8, top = PP.crownY - 44, o = [];
  const horn = s => P(`M${f(s * (w - 14))},${f(y - 34)} C${f(s * (w + 40))},${f(y - 40)} ${f(s * (w + 62))},${f(y - 90)} ${f(s * (w + 40))},${f(y - 128)} C${f(s * (w + 36))},${f(y - 92)} ${f(s * (w + 14))},${f(y - 70)} ${f(s * (w - 20))},${f(y - 66)} Z`, '#f1e6cc', 6.5) + L(`M${f(s * (w + 4))},${f(y - 46)} q${f(s * 6)},-8 ${f(s * 2)},-18 M${f(s * (w + 26))},${f(y - 62)} q${f(s * 8)},-8 ${f(s * 4)},-20`, 3, '#c9b88e');
  const dome = P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 26)} ${f(w)},${f(top - 26)} ${f(w)},${f(y)} Z`, STEEL, 8), band = P(`M${f(-w - 4)},${f(y - 12)} L${f(w + 4)},${f(y - 12)} L${f(w + 4)},${f(y + 6)} L${f(-w - 4)},${f(y + 6)} Z`, BRONZE, 5.5);
  if (v === 'side') return [horn(-.2), dome, band, P(`M${f(w - 10)},${f(y + 4)} L${f(w + 6)},${f(y + 4)} L${f(w + 2)},${f(y + 54)} L${f(w - 8)},${f(y + 50)} Z`, STEELD, 5), L(`M0,${f(top - 4)} L0,${f(y - 12)}`, 4, STEELD), rivets([[-60, y - 3], [-20, y - 3], [20, y - 3], [60, y - 3]], '#ffe9a8'), shine(-w * .6, y - 24, -w * .6, top + 6, -w * .2, top - 6)];
  o.push(horn(-1), horn(1), dome, L(`M0,${f(top - 6)} L0,${f(y - 12)}`, 5, STEELD), L(`M${f(-w * .55)},${f(y - 12)} Q${f(-w * .5)},${f(top + 6)} 0,${f(top - 6)} Q${f(w * .5)},${f(top + 6)} ${f(w * .55)},${f(y - 12)}`, 4, STEELD), band, rivets([-.8, -.5, -.2, .2, .5, .8].map(u => [u * w, y - 3]), '#ffe9a8'));
  if (v !== 'back') o.push(P(`M-9,${f(y + 4)} L9,${f(y + 4)} L7,${f(y + 62)} L0,${f(y + 70)} L-7,${f(y + 62)} Z`, STEELD, 5));
  o.push(shine(-w * .7, y - 24, -w * .7, top + 6, -w * .3, top - 8));
  return o; };
// 4. Roman galea: bronze dome, brow ridge, hinged cheek guards, neck guard, red horsehair crest
H.roman = PP => { const v = PP.view, y = PP.brimY + 4, w = PP.widthAt(y) + 8, top = PP.crownY - 36, o = [];
  const crestF = [P(`M-16,${f(top - 6)} C-30,${f(top - 86)} 30,${f(top - 86)} 16,${f(top - 6)} Z`, RED, 6.5), ...[-8, 0, 8].map(x => L(`M${x},${f(top - 12)} L${x * 1.6},${f(top - 62)}`, 2.6, shade(RED, .7)))];
  const dome = P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 24)} ${f(w)},${f(top - 24)} ${f(w)},${f(y)} Z`, BRONZE, 8);
  if (v === 'side') { const cr = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.08 + k * .088), x = Math.cos(a) * (w * .96), yy = y - 10 + Math.sin(a) * (y - top + 16); cr.push([x, yy]); }
    return [P('M' + cr.map(([x, yy]) => `${f(x)},${f(yy)}`).join(' L') + ' L' + cr.slice().reverse().map(([x, yy]) => `${f(x * 1.3)},${f(yy - 34)}`).join(' L') + ' Z', RED, 6.5), dome, P(`M${f(-w - 26)},${f(y + 14)} L${f(-w + 20)},${f(y - 6)} L${f(-w + 24)},${f(y + 8)} L${f(-w - 18)},${f(y + 30)} Z`, BRONZE, 5.5), P(`M${f(w - 40)},${f(y - 8)} L${f(w + 14)},${f(y - 18)} L${f(w + 14)},${f(y - 4)} L${f(w - 40)},${f(y + 6)} Z`, BRONZED, 5), P(`M10,${f(y)} L52,${f(y)} L58,${f(y + 70)} L30,${f(y + 92)} L12,${f(y + 60)} Z`, BRONZE, 6), rivets([[22, y + 14], [44, y + 14], [34, y + 70]], GOLD), shine(-w * .6, y - 20, -w * .6, top + 6, -w * .2, top - 4, 7, '#ffe9a8')]; }
  o.push(...(v === 'back' ? [P(`M-14,${f(top - 6)} C-26,${f(top - 86)} 26,${f(top - 86)} 14,${f(y + 10)} L-14,${f(y + 10)} Z`, RED, 6.5)] : crestF), dome);
  if (v === 'back') { o.push(P(`M${f(-w - 6)},${f(y - 4)} Q0,${f(y + 34)} ${f(w + 6)},${f(y - 4)} L${f(w + 16)},${f(y + 22)} Q0,${f(y + 62)} ${f(-w - 16)},${f(y + 22)} Z`, BRONZE, 6), P(`M-14,${f(top - 6)} C-26,${f(top - 86)} 26,${f(top - 86)} 14,${f(top - 6)} L12,${f(y + 6)} L-12,${f(y + 6)} Z`, RED, 6.5)); return o; }
  o.push(P(`M${f(-w - 6)},${f(y - 16)} Q0,${f(y - 36)} ${f(w + 6)},${f(y - 16)} L${f(w + 6)},${f(y)} Q0,${f(y - 20)} ${f(-w - 6)},${f(y)} Z`, BRONZED, 5.5));
  for (const s of [-1, 1]) o.push(P(`M${f(s * (w - 4))},${f(y - 2)} L${f(s * (w - 34))},${f(y + 2)} L${f(s * (w - 44))},${f(y + 76)} L${f(s * (w - 26))},${f(y + 104)} L${f(s * (w - 2))},${f(y + 70)} Z`, BRONZE, 6), rivets([[s * (w - 20), y + 16], [s * (w - 24), y + 78]], GOLD));
  o.push(shine(-w * .7, y - 26, -w * .7, top + 6, -w * .3, top - 8, 7, '#ffe9a8'));
  return o; };
// 5. Spartan (Corinthian): full bronze, T-shaped opening, tall crest
H.spartan = PP => { const v = PP.view, crest = [P('M-16,-118 C-34,-216 34,-216 16,-118 Z', RED, 6.5), ...[-8, 0, 8].map(x => L(`M${x},-124 L${x * 1.8},-186`, 2.6, shade(RED, .7))), P('M-20,-124 L20,-124 L18,-110 L-18,-110 Z', BLACK, 4)];
  if (v === 'back') return [P('M-14,-118 C-30,-216 30,-216 14,-118 L12,90 L-12,90 Z', RED, 6.5), P('M-110,80 C-126,-150 126,-150 110,80 Q0,104 -110,80 Z', BRONZE, 8), P('M-12,-124 L12,-124 L10,96 L-10,96 Z', RED, 6), shine(-86, 20, -94, -70, -50, -112, 7, '#ffe9a8')];
  if (v === 'side') { const cr = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.02 + k * .096); cr.push([Math.cos(a) * 104, -10 + Math.sin(a) * 114]); }
    return [P('M' + cr.map(([x, y]) => `${f(x)},${f(y)}`).join(' L') + ' L' + cr.slice().reverse().map(([x, y]) => `${f(x * 1.34)},${f(y - 40)}`).join(' L') + ' Z', RED, 6.5), P('M40,-126 C-150,-136 -130,70 -70,96 L60,96 L70,40 L40,36 L44,-10 L100,-14 C96,-80 80,-120 40,-126 Z', BRONZE, 8), L('M-110,20 Q-50,50 30,40', 4, BRONZED), shine(-40, -110, -90, -80, -104, -20, 7, '#ffe9a8')]; }
  return [...crest, P('M-110,96 C-128,-150 128,-150 110,96 L22,104 L18,24 L78,-6 C80,-40 40,-44 0,-34 C-40,-44 -80,-40 -78,-6 L-18,24 L-22,104 Z', BRONZE, 8), L('M-106,-40 Q0,-66 106,-40', 5, BRONZED), L('M0,-34 L0,10', 6, BRONZED), shine(-90, 20, -98, -70, -52, -112, 7, '#ffe9a8')]; };
H.spartan.covers = true;
// 6. Samurai kabuto: lacquered bowl with ribs, gold crescent crest, layered neck guard with red cords
H.kabuto = PP => { const v = PP.view, y = PP.brimY + 2, w = PP.widthAt(y) + 8, top = PP.crownY - 30, c = '#2e2a36', o = [];
  const guard = k => P(`M${f(-w - 10 - k * 14)},${f(y + 4 + k * 26)} Q0,${f(y + 30 + k * 26)} ${f(w + 10 + k * 14)},${f(y + 4 + k * 26)} L${f(w + 20 + k * 14)},${f(y + 28 + k * 26)} Q0,${f(y + 56 + k * 26)} ${f(-w - 20 - k * 14)},${f(y + 28 + k * 26)} Z`, c, 6);
  const cords = k => [-.6, -.2, .2, .6].map(u => L(`M${f(u * (w + k * 14))},${f(y + 20 + k * 26)} l0,10`, 4, RED)).join('');
  const dome = P(`M${f(-w)},${f(y)} C${f(-w)},${f(top - 22)} ${f(w)},${f(top - 22)} ${f(w)},${f(y)} Z`, c, 8), ribs = [-.5, 0, .5].map(u => L(`M${f(u * w)},${f(y - 6)} Q${f(u * w * .6)},${f(top + 10)} 0,${f(top - 8)}`, 3, '#55505e')).join('');
  if (v === 'back') return [guard(2), cords(2), guard(1), cords(1), guard(0), cords(0), dome, ribs, ring(0, top - 8, 8, GOLD, 4), shine(-w * .6, y - 20, -w * .6, top + 6, -w * .2, top - 4, 6, '#8a8494')];
  if (v === 'side') return [P(`M${f(-w - 44)},${f(y + 70)} L${f(-w + 4)},${f(y - 8)} L${f(-10)},${f(y - 2)} L${f(-30)},${f(y + 50)} Z`, c, 6), L(`M${f(-w - 14)},${f(y + 30)} L${f(-18)},${f(y + 22)} M${f(-w - 30)},${f(y + 52)} L${f(-26)},${f(y + 40)}`, 4, RED), dome, ribs, P(`M${f(w - 30)},${f(y - 10)} L${f(w + 34)},${f(y - 2)} L${f(w + 30)},${f(y + 10)} L${f(w - 30)},${f(y + 4)} Z`, c, 5.5), P(`M${f(w - 20)},${f(y - 14)} C${f(w + 10)},${f(y - 60)} ${f(w + 6)},${f(top - 30)} ${f(w - 30)},${f(top - 60)} C${f(w - 10)},${f(top - 20)} ${f(w - 20)},${f(y - 40)} ${f(w - 36)},${f(y - 16)} Z`, GOLD, 5.5), shine(-w * .6, y - 20, -w * .6, top + 6, -w * .2, top - 4, 6, '#8a8494')];
  o.push(P(`M${f(-w - 44)},${f(y + 70)} L${f(-w)},${f(y - 6)} L${f(-w + 30)},${f(y)} L${f(-w + 6)},${f(y + 76)} Z`, c, 6), P(`M${f(w + 44)},${f(y + 70)} L${f(w)},${f(y - 6)} L${f(w - 30)},${f(y)} L${f(w - 6)},${f(y + 76)} Z`, c, 6));
  for (const s of [-1, 1]) o.push(L(`M${f(s * (w + 14))},${f(y + 24)} L${f(s * (w - 12))},${f(y + 30)} M${f(s * (w + 28))},${f(y + 48)} L${f(s * (w - 4))},${f(y + 54)}`, 4, RED));
  o.push(P(`M-70,${f(y - 20)} C-84,${f(top - 60)} -40,${f(top - 96)} -34,${f(top - 100)} C-44,${f(top - 40)} 44,${f(top - 40)} 34,${f(top - 100)} C40,${f(top - 96)} 84,${f(top - 60)} 70,${f(y - 20)} Q0,${f(y - 50)} -70,${f(y - 20)} Z`, GOLD, 6), dome, ribs);
  o.push(P(`M${f(-w - 8)},${f(y - 12)} Q0,${f(y + 12)} ${f(w + 8)},${f(y - 12)} L${f(w + 8)},${f(y + 2)} Q0,${f(y + 28)} ${f(-w - 8)},${f(y + 2)} Z`, c, 6), ring(0, y - 22, 9, GOLD, 4), shine(-w * .7, y - 26, -w * .7, top + 6, -w * .3, top - 8, 6, '#8a8494'));
  return o; };
// 7. Soldier: steel pot helmet (1940s), olive, net lines, chin strap
H.soldier = PP => { const v = PP.view, y = PP.brimY + 10, w = PP.widthAt(y) + 12, top = PP.crownY - 44, o = [];
  o.push(P(`M${f(-w - 8)},${f(y + 4)} C${f(-w - 6)},${f(top - 30)} ${f(w + 6)},${f(top - 30)} ${f(w + 8)},${f(y + 4)} Q0,${f(y + 22)} ${f(-w - 8)},${f(y + 4)} Z`, OLIVE, 8));
  for (let k = -2; k <= 2; k++) o.push(L(`M${f(k * w * .38)},${f(y + 6)} Q${f(k * w * .3)},${f(top + 20)} ${f(k * w * .12)},${f(top - 14)}`, 2.4, shade(OLIVE, .72), .8));
  o.push(L(`M${f(-w)},${f(y - 30)} Q0,${f(y - 16)} ${f(w)},${f(y - 30)} M${f(-w * .86)},${f(y - 64)} Q0,${f(y - 52)} ${f(w * .86)},${f(y - 64)}`, 2.4, shade(OLIVE, .72), .8));
  if (v === 'front' ) o.push(L(`M${f(-w + 8)},${f(y + 10)} Q${f(-w + 14)},90 -30,112 M${f(w - 8)},${f(y + 10)} Q${f(w - 14)},90 30,112`, 6, LEATHERD));
  if (v === 'side') o.push(L(`M10,${f(y + 12)} Q24,80 40,104`, 6, LEATHERD));
  o.push(shine(-w * .7, y - 20, -w * .72, top + 10, -w * .3, top - 12, 6, tint(OLIVE, .4)));
  return o; };
// 8. Pilot: leather flying cap, ear flaps with buckle strap, goggles pushed up
H.pilot = PP => { const v = PP.view, o = [], gog = (x, y) => [ring(x, y, 24, '#9fd6ef', 7), dot(x - 8, y - 8, 6, '#ffffff'), L(`M${f(x - 12)},${f(y + 10)} q12,8 24,0`, 2.4, '#5aa7c9')];
  if (v === 'back') return [P('M-108,60 C-122,-146 122,-146 108,60 Q0,90 -108,60 Z', LEATHER, 8), L('M0,-126 L0,74', 3.4, LEATHERD), L('M-110,-56 Q0,-30 110,-56', 12, INK), L('M-110,-56 Q0,-30 110,-56', 7, '#4a4038'), shine(-84, 0, -92, -70, -50, -110, 6, tint(LEATHER, .35))];
  if (v === 'side') return [P('M50,-116 C-140,-150 -130,50 -70,76 L-10,84 L8,40 C-6,10 6,-20 30,-40 L78,-62 C72,-90 64,-108 50,-116 Z', LEATHER, 8), P('M-20,30 L10,30 L14,80 L-12,92 Z', LEATHERD, 5.5), ring(0, 58, 6, GOLD, 3), L('M-104,-60 Q-40,-90 30,-84', 12, INK), L('M-104,-60 Q-40,-90 30,-84', 7, '#4a4038'), ...gog(48, -84), shine(-30, -112, -80, -90, -100, -30, 6, tint(LEATHER, .35))];
  o.push(P('M-108,40 C-124,-150 124,-150 108,40 L96,96 L70,104 L66,40 C70,-10 50,-44 0,-48 C-50,-44 -70,-10 -66,40 L-70,104 L-96,96 Z', LEATHER, 8));
  o.push(L('M0,-128 L0,-50', 3.4, LEATHERD), L('M-74,100 Q0,128 74,100', 7, LEATHERD), ring(0, 114, 7, GOLD, 3.5), ...[-1, 1].map(s => L(`M${s * 84},20 q${s * 6},30 0,60`, 3, LEATHERD)));
  o.push(L('M-104,-70 Q0,-96 104,-70', 12, INK), L('M-104,-70 Q0,-96 104,-70', 7, '#4a4038'), ...gog(-30, -84), ...gog(30, -84), L('M-8,-84 L8,-84', 7), shine(-90, 10, -98, -60, -70, -104, 6, tint(LEATHER, .35)));
  return o; };
H.pilot.covers = true;
// 9. Motorbike: full-face shell, visor opening (the eyes show), chin bar with vents, racing stripe
H.moto = PP => { const v = PP.view, c = '#e23b3b';
  if (v === 'back') return [P('M-116,70 C-134,-160 134,-160 116,70 Q0,116 -116,70 Z', c, 8), P('M-16,-136 L16,-136 L14,96 L-14,96 Z', WHITE, 4.5), ...[-1, 1].map(s => L(`M${s * 50},60 l${s * 30},-6`, 5, shade(c, .7))), shine(-90, 0, -100, -80, -52, -122)];
  if (v === 'side') return [P('M10,-132 C-160,-140 -140,80 -60,104 L70,104 C104,96 116,60 112,30 L40,24 C30,0 36,-30 50,-44 L108,-50 C98,-104 60,-130 10,-132 Z', c, 8), P('M46,-48 L110,-54 L114,-30 L114,26 L40,22 C32,0 36,-28 46,-48 Z', '#bfe6f5', 5, 'fill-opacity=".35"'), ...[0, 1, 2].map(k => L(`M${70 + k * 12},56 l0,22`, 5, shade(c, .65))), L('M-120,-20 Q-40,-60 30,-128', 9, WHITE), shine(-50, -116, -100, -90, -116, -30)];
  return [P('M-116,60 C-136,-160 136,-160 116,60 C112,100 70,116 0,116 C-70,116 -112,100 -116,60 Z M-86,-40 C-60,-52 60,-52 86,-40 L88,10 C60,20 -60,20 -88,10 Z', c, 8, 'fill-rule="evenodd"'),
    P('M-86,-40 C-60,-52 60,-52 86,-40 L88,10 C60,20 -60,20 -88,10 Z', '#bfe6f5', 5.5, 'fill-opacity=".22"'), L('M-70,-30 Q-40,-40 -10,-40', 5, '#ffffff', .7),
    P('M-14,-140 L14,-140 L12,-48 L-12,-48 Z', WHITE, 4.5), ...[-2, -1, 0, 1, 2].map(k => L(`M${k * 14},50 l0,26`, 5, shade(c, .65))), L('M-96,26 Q0,44 96,26', 4, shade(c, .7)), shine(-94, 0, -104, -80, -56, -124)]; };
H.moto.covers = true;
// 10. Bike: vented foam helmet, straps under the chin
H.bike = PP => { const v = PP.view, y = PP.brimY + 2, w = PP.widthAt(y) + 10, top = PP.crownY - 40, c = '#2fa8d8', o = [];
  o.push(P(`M${f(-w)},${f(y)} C${f(-w - 4)},${f(top - 26)} ${f(w + 4)},${f(top - 26)} ${f(w)},${f(y)} Q0,${f(y + 16)} ${f(-w)},${f(y)} Z`, c, 8));
  const vents = v === 'side' ? [[-50, 1], [-10, 1], [30, 1]] : [[-52, -1], [-18, -1], [18, 1], [52, 1]];
  for (const [x, s] of vents) o.push(P(`M${f(x - 9)},${f(y - 16)} Q${f(x - 4 + s * 4)},${f(top + 14)} ${f(x + s * 6)},${f(top + 2)} Q${f(x + 10 + s * 4)},${f(top + 16)} ${f(x + 9)},${f(y - 16)} Z`, '#1b2630', 4));
  if (v === 'front') o.push(L(`M${f(-w + 8)},${f(y + 6)} L-20,108 M${f(w - 8)},${f(y + 6)} L20,108`, 5, BLACK), ring(0, 110, 6, BLACK, 3));
  if (v === 'side') o.push(L(`M-10,${f(y + 6)} L26,104 M40,${f(y + 6)} L26,104`, 5, BLACK));
  o.push(shine(-w * .7, y - 20, -w * .72, top + 10, -w * .3, top - 10, 6, tint(c, .5)));
  return o; };
// 11. Hard hat: yellow shell, centre ridge, brim, front badge
H.hardhat = PP => { const v = PP.view, y = PP.brimY + 4, w = PP.widthAt(y) + 6, top = PP.crownY - 44, c = '#f5c518', o = [];
  if (v !== 'back') o.push(P(v === 'side' ? `M${f(-w - 4)},${f(y + 2)} L${f(w + 44)},${f(y - 4)} L${f(w + 40)},${f(y + 12)} L${f(-w - 4)},${f(y + 14)} Z` : `M${f(-w - 16)},${f(y)} Q0,${f(y + 34)} ${f(w + 16)},${f(y)} Q0,${f(y + 10)} ${f(-w - 16)},${f(y)} Z`, shade(c, .86), 6));
  o.push(P(`M${f(-w)},${f(y + 4)} C${f(-w)},${f(top - 26)} ${f(w)},${f(top - 26)} ${f(w)},${f(y + 4)} Z`, c, 8));
  if (v === 'side') o.push(L(`M${f(-w * .9)},${f(y - 30)} Q0,${f(top - 30)} ${f(w * .9)},${f(y - 30)}`, 5, shade(c, .78)));
  else o.push(P(`M-12,${f(y + 2)} L-10,${f(top - 6)} Q0,${f(top - 14)} 10,${f(top - 6)} L12,${f(y + 2)} Z`, shade(c, .9), 4.5));
  if (v === 'front') o.push(`<rect x="-16" y="${f(y - 38)}" width="32" height="20" rx="3" fill="${WHITE}" stroke="${INK}" stroke-width="3.5"/>`, L(`M-8,${f(y - 28)} L8,${f(y - 28)}`, 3, RED));
  o.push(shine(-w * .7, y - 16, -w * .72, top + 10, -w * .3, top - 10, 6, '#fff3b0'));
  return o; };
// 12. Firefighter: red helmet with comb ridge, long rear brim, brass front shield with number
H.fire = PP => { const v = PP.view, y = PP.brimY + 4, w = PP.widthAt(y) + 6, top = PP.crownY - 46, c = '#d43a2f', o = [];
  if (v === 'side') o.push(P(`M${f(-w - 60)},${f(y + 30)} Q${f(-w)},${f(y - 6)} ${f(w + 30)},${f(y)} L${f(w + 28)},${f(y + 14)} Q${f(-w)},${f(y + 14)} ${f(-w - 56)},${f(y + 44)} Z`, shade(c, .84), 6));
  else o.push(P(`M${f(-w - 26)},${f(y + 4)} Q0,${f(y + (v === 'back' ? 60 : 34))} ${f(w + 26)},${f(y + 4)} Q0,${f(y - 8)} ${f(-w - 26)},${f(y + 4)} Z`, shade(c, .84), 6));
  o.push(P(`M${f(-w)},${f(y + 4)} C${f(-w)},${f(top - 26)} ${f(w)},${f(top - 26)} ${f(w)},${f(y + 4)} Z`, c, 8));
  if (v === 'side') o.push(L(`M${f(-w * .92)},${f(y - 20)} Q0,${f(top - 40)} ${f(w * .92)},${f(y - 20)}`, 8, shade(c, .72)));
  else o.push(P(`M-10,${f(y + 2)} L-8,${f(top - 8)} Q0,${f(top - 18)} 8,${f(top - 8)} L10,${f(y + 2)} Z`, shade(c, .76), 4.5));
  if (v === 'front') o.push(P(`M-28,${f(y - 4)} L-22,${f(y - 56)} Q0,${f(y - 74)} 22,${f(y - 56)} L28,${f(y - 4)} Q0,${f(y + 10)} -28,${f(y - 4)} Z`, GOLD, 5), `<text x="0" y="${f(y - 18)}" font-family="Arial Black,Arial" font-weight="900" font-size="30" text-anchor="middle" fill="${INK}">7</text>`);
  if (v === 'side') o.push(P(`M${f(w - 40)},${f(y - 2)} L${f(w - 30)},${f(y - 50)} L${f(w - 4)},${f(y - 40)} L${f(w + 2)},${f(y)} Z`, GOLD, 5));
  o.push(shine(-w * .7, y - 16, -w * .72, top + 10, -w * .3, top - 10, 6, tint(c, .45)));
  return o; };
// 13. Astronaut: glass bubble round the whole head (hair shows inside), white collar ring with red and blue bands, antenna
H.astronaut = PP => { const v = PP.view, o = { back: [], front: [] };
  o.back.push(`<circle cx="0" cy="-4" r="150" fill="#dff3fb" stroke="${INK}" stroke-width="8"/>`);
  o.front.push(`<circle cx="0" cy="-4" r="150" fill="#bfe6f5" fill-opacity=".16" stroke="${INK}" stroke-width="8"/>`, shine(-112, -40, -104, -108, -44, -136, 12), shine(-126, 6, -128, -14, -122, -30, 8), L('M70,90 Q104,60 118,20', 6, '#ffffff', .6));
  o.front.push(P('M-112,112 Q0,150 112,112 L118,146 Q0,186 -118,146 Z', WHITE, 8), L('M-112,126 Q0,164 112,126', 6, RED), L('M-114,138 Q0,176 114,138', 5, '#3a6fb0'), rivets([[-80, 150], [-40, 162], [0, 166], [40, 162], [80, 150]], STEELD));
  if (v !== 'side') o.front.push(L('M96,-118 L130,-176', 6), ring(132, -180, 8, RED, 4));
  return o; };
// 14. American football: shell with stripe, ear hole, face-mask bars
H.football = PP => { const v = PP.view, c = '#2f5fb5';
  if (v === 'back') return [P('M-114,60 C-132,-156 132,-156 114,60 Q0,104 -114,60 Z', c, 8), P('M-14,-134 L14,-134 L12,88 L-12,88 Z', WHITE, 4.5), shine(-90, 0, -100, -80, -52, -120)];
  if (v === 'side') return [P('M10,-130 C-158,-138 -138,76 -60,98 L20,98 C6,60 10,20 30,-10 L86,-30 C92,-90 60,-128 10,-130 Z', c, 8), ring(-30, 20, 12, shade(c, .6), 5), L('M-124,-10 Q-50,-70 30,-126', 9, WHITE), L('M28,-8 L118,-4 M22,30 L120,34 M22,70 L112,74 M118,-4 Q130,36 112,74 M70,-6 L70,72', 7, INK), L('M28,-8 L118,-4 M22,30 L120,34 M22,70 L112,74 M118,-4 Q130,36 112,74 M70,-6 L70,72', 3, STEELL), shine(-50, -114, -100, -88, -114, -30)];
  return [P('M-114,50 C-134,-158 134,-158 114,50 C110,84 96,100 78,104 L70,30 C70,-20 50,-46 0,-50 C-50,-46 -70,-20 -70,30 L-78,104 C-96,100 -110,84 -114,50 Z', c, 8), P('M-14,-138 L14,-138 L12,-50 L-12,-50 Z', WHITE, 4.5),
    L('M-76,30 Q0,14 76,30 M-78,64 Q0,50 78,64 M-76,98 Q0,86 76,98 M0,22 L0,90 M-40,26 L-40,92 M40,26 L40,92', 8, INK), L('M-76,30 Q0,14 76,30 M-78,64 Q0,50 78,64 M-76,98 Q0,86 76,98 M0,22 L0,90 M-40,26 L-40,92 M40,26 L40,92', 3.4, STEELL), shine(-92, 0, -102, -80, -56, -122)]; };
H.football.covers = true;
// 15. Deep-sea diver: brass ball, round bolted porthole (the face shows), side port, collar
H.diver = PP => { const v = PP.view, bolts = (cx, cy, r, n = 8) => [...Array(n)].map((_, k) => dot(cx + Math.cos(k / n * 6.283) * r, cy + Math.sin(k / n * 6.283) * r, 4, BRONZED)).join('');
  if (v === 'back') return [`<circle cx="0" cy="-6" r="138" fill="${BRONZE}" stroke="${INK}" stroke-width="8"/>`, ring(0, -30, 30, BRONZED, 6), bolts(0, -30, 22, 6), P('M-112,104 Q0,140 112,104 L122,140 Q0,180 -122,140 Z', BRONZE, 8), shine(-104, -30, -100, -100, -44, -128, 9, '#ffe9a8')];
  if (v === 'side') return [`<circle cx="0" cy="-6" r="138" fill="${BRONZE}" stroke="${INK}" stroke-width="8"/>`, P('M84,-70 L150,-56 L150,36 L84,50 Z', BRONZED, 7), `<path d="M96,-52 L140,-44 L140,24 L96,34 Z" fill="#bfe6f5" fill-opacity=".5" stroke="${INK}" stroke-width="4"/>`, ring(-20, -10, 34, BRONZED, 6), `<circle cx="-20" cy="-10" r="22" fill="#9fd6ef" stroke="${INK}" stroke-width="4"/>`, bolts(-20, -10, 29), P('M-112,104 Q0,140 112,104 L122,140 Q0,180 -122,140 Z', BRONZE, 8), shine(-104, -30, -100, -100, -44, -128, 9, '#ffe9a8')];
  return [P('M0,-144 A138,138 0 1,0 0.1,-144 Z M0,-78 A78,78 0 1,1 -0.1,-78 Z', BRONZE, 8, 'fill-rule="evenodd"'), `<circle cx="0" cy="0" r="92" fill="none" stroke="${BRONZED}" stroke-width="16"/>`, `<circle cx="0" cy="0" r="100" fill="none" stroke="${INK}" stroke-width="4"/>`, `<circle cx="0" cy="0" r="78" fill="#bfe6f5" fill-opacity=".14" stroke="${INK}" stroke-width="6"/>`, bolts(0, 0, 92, 10), L('M-50,-40 Q-30,-60 -6,-64', 6, '#ffffff', .7),
    P('M-112,108 Q0,144 112,108 L122,144 Q0,184 -122,144 Z', BRONZE, 8), rivets([[-70, 140], [0, 156], [70, 140]], BRONZED), ring(0, -138, 12, BRONZED, 5), shine(-116, -30, -112, -96, -60, -126, 9, '#ffe9a8')]; };
H.diver.covers = true;
// 16-18. Hoods: ninja (eye slit), luchador (wrestling mask), balaclava
// 3/4 view: the rig slides eyes and mouth by x' = 23.1 + .879 x (turn .55). shx moves the absolute x of a path (M L C Q A) the same way, so holes stay on the eyes.
const SX = 23.1, SK = .879;
const shx = d => d.replace(/([MLCQA])([^MLCQAZ]*)/g, (m, c, body) => { const n = body.trim().split(/[\s,]+/).map(Number), xi = c === 'A' ? [5] : n.map((_, i) => i).filter(i => i % 2 === 0); xi.forEach(i => { n[i] = +(SX + SK * n[i]).toFixed(1); }); return c + n.join(',') + ' '; });
const hood = (c, open, deco) => { const h = PP => { const v = PP.view;
    if (v === 'back') return [P('M-108,-4 C-112,-140 112,-140 108,-4 C112,60 80,110 0,112 C-80,110 -112,60 -108,-4 Z', c, 8), ...(deco.back || []), shine(-84, -20, -90, -80, -50, -110, 6, tint(c, .3))];
    if (v === 'side') return [P('M20,-106 C-130,-120 -124,90 -30,110 L60,108 C96,100 108,60 106,20 ' + open.side + ' C96,-70 70,-102 20,-106 Z', c, 8), ...(deco.side || []), shine(-30, -96, -80, -76, -98, -20, 6, tint(c, .3))];
    return [P('M0,-106 C-108,-106 -112,-30 -108,10 C-104,80 -60,112 0,112 C60,112 104,80 108,10 C112,-30 108,-106 0,-106 Z ' + (PP.v34 ? shx(open.front) : open.front), c, 8, 'fill-rule="evenodd"'), ...(deco.front || []), ...(deco.eyes ? [`<g${PP.v34 ? ` transform="translate(${SX},0) scale(${SK},1)"` : ''}>${deco.eyes.join('')}</g>`] : []), shine(-88, -10, -92, -70, -54, -98, 6, tint(c, .3))]; };
  h.covers = true; return h; };
H.ninja = hood('#2a2b3a', { front: 'M-84,-40 Q0,-52 84,-40 L84,-2 Q0,10 -84,-2 Z', side: 'L40,8 L44,-36 L100,-40' }, { front: [L('M-100,-50 Q0,-66 100,-50', 4, '#454760'), L('M-96,14 Q0,28 96,14', 4, '#454760')], side: [L('M-100,-50 Q-30,-70 50,-56', 4, '#454760'), P('M-104,-30 L-150,-10 L-140,10 L-104,-8 Z', '#2a2b3a', 6)], back: [P('M-10,-40 L-60,40 L-40,50 L0,-20 L40,50 L60,40 L10,-40 Z', '#2a2b3a', 6), ring(0, -40, 12, '#454760', 5)] });
H.luchador = hood('#e23b3b', { front: 'M-74,-34 C-60,-56 -20,-50 -14,-22 C-20,6 -66,4 -74,-34 Z M74,-34 C60,-56 20,-50 14,-22 C20,6 66,4 74,-34 Z M-30,44 Q0,30 30,44 Q0,70 -30,44 Z', side: 'L60,10 L50,-12 L70,-40 L100,-36' },
  { eyes: [L('M-74,-34 C-60,-56 -20,-50 -14,-22 C-20,6 -66,4 -74,-34 Z M74,-34 C60,-56 20,-50 14,-22 C20,6 66,4 74,-34 Z', 9, GOLD), L('M-74,-34 C-60,-56 -20,-50 -14,-22 C-20,6 -66,4 -74,-34 Z M74,-34 C60,-56 20,-50 14,-22 C20,6 66,4 74,-34 Z', 3, INK), L('M-30,44 Q0,30 30,44 Q0,70 -30,44 Z', 8, GOLD), L('M-30,44 Q0,30 30,44 Q0,70 -30,44 Z', 3, INK)], front: [P('M0,-104 L-16,-60 L0,-48 L16,-60 Z', GOLD, 4.5), ...[-1, 1].map(s => P(`M${s * 96},20 L${s * 60},40 L${s * 70},70 Z`, '#2f5fb5', 4.5))], side: [P('M-20,-104 L-40,-60 L-10,-50 Z', GOLD, 4.5), ...[0, 1, 2, 3].map(k => L(`M-112,${-30 + k * 26} l16,4 M-112,${-22 + k * 26} l16,-12`, 3.4, WHITE)), P('M-40,30 L10,50 L-10,84 Z', '#2f5fb5', 4.5)], back: [L('M0,-110 L0,100', 4, shade('#e23b3b', .7)), ...[0, 1, 2, 3, 4].map(k => L(`M-14,${-70 + k * 34} L14,${-52 + k * 34} M14,${-70 + k * 34} L-14,${-52 + k * 34}`, 3.4, WHITE))] });
H.balaclava = hood('#26242c', { front: 'M-66,-18 A22,16 0 1,1 -22,-18 A22,16 0 1,1 -66,-18 Z M22,-18 A22,16 0 1,1 66,-18 A22,16 0 1,1 22,-18 Z M-24,44 Q0,34 24,44 Q0,60 -24,44 Z', side: 'L70,14 L62,-8 L74,-34 L100,-30' }, { front: [...[0, 1, 2, 3].map(k => L(`M-96,${70 + k * 10} Q0,${92 + k * 10} 96,${70 + k * 10}`, 2.4, '#45424e'))], side: [...[0, 1, 2].map(k => L(`M-80,${76 + k * 10} Q-20,${98 + k * 10} 50,${96 + k * 6}`, 2.4, '#45424e'))], back: [...[0, 1, 2, 3].map(k => L(`M-96,${50 + k * 12} Q0,${76 + k * 12} 96,${50 + k * 12}`, 2.4, '#45424e'))] });
// FIT v2 (CB 2026-11-12: "some helm hair beard headpice are bigger than the head. please make them perfect fir."):
// a closed shell sits ON the head outline (radius 100): shell half width 104 to 108. Brims, horns, crests and cheek guards may stand out, the shell may not.
const fitS = (fn, s) => { const g = a => a && a.length ? [`<g transform="scale(${s})">${a.flat(9).join('')}</g>`] : (a || []);
  return Object.assign(PP => { const r = fn(PP); return Array.isArray(r) ? g(r) : { ...r, back: g(r.back), front: g(r.front) }; }, fn); };
export const SHELL_FIT = { knight: .94, greatHelm: .97, spartan: .95, pilot: .97, moto: .91, football: .93, astronaut: .86, diver: .88, ninja: .97, luchador: .97, balaclava: .97 };
for (const k in SHELL_FIT) H[k] = fitS(H[k], SHELL_FIT[k]);
export const HELMETS = H;

// ============ MASKS ============  m({ view, X }) -> svg[]   drawn in the face layer (slides with eyes and mouth).
// Front coords: eyes at (+-40, -19), mouth near (0, 34). Side view: use X(trueX) for x so the piece lands on the profile after the rig's slide.
const M = {};
const EYE0 = 'M-62,-19 A22,15 0 1,1 -18,-19 A22,15 0 1,1 -62,-19 Z M18,-19 A22,15 0 1,1 62,-19 A22,15 0 1,1 18,-19 Z'; let SLIDE = false;   // 3/4: the mask stays on the head, the eye holes follow the eyes
const eyeHoles = () => SLIDE ? shx(EYE0) : EYE0;
M.medical = ({ view, X }) => view === 'side' ? [L(`M${f(X(44))},14 Q${f(X(10))},4 ${f(X(-10))},-6 M${f(X(44))},60 Q${f(X(10))},40 ${f(X(-10))},8`, 3, WHITE), P(`M${f(X(44))},6 Q${f(X(96))},0 ${f(X(110))},30 Q${f(X(104))},70 ${f(X(60))},80 Q${f(X(40))},60 ${f(X(44))},6 Z`, '#9fd6ef', 6.5), L(`M${f(X(52))},28 Q${f(X(80))},22 ${f(X(104))},32 M${f(X(52))},46 Q${f(X(80))},42 ${f(X(102))},50`, 2.6, '#6fb3d1')]
  : [L('M-64,14 Q-90,4 -100,-10 M-64,60 Q-92,50 -100,10 M64,14 Q90,4 100,-10 M64,60 Q92,50 100,10', 3, WHITE), P('M-66,8 Q0,-6 66,8 L62,66 Q0,88 -62,66 Z', '#9fd6ef', 6.5), L('M-62,26 Q0,14 62,26 M-62,44 Q0,34 62,44 M-60,60 Q0,54 60,60', 2.6, '#6fb3d1'), L('M-20,6 Q0,0 20,6', 4, '#e6e9f0')];
M.domino = ({ view, X }) => view === 'side' ? [P(`M${f(X(20))},-36 L${f(X(100))},-40 L${f(X(102))},-4 L${f(X(24))},0 Z M${f(X(58))},-19 a14,13 0 1,1 28,0 a14,13 0 1,1 -28,0 Z`, BLACK, 6, 'fill-rule="evenodd"'), L(`M${f(X(20))},-18 L${f(X(-60))},-10`, 4, BLACK)]
  : [P('M-96,-34 Q-60,-52 0,-36 Q60,-52 96,-34 L84,2 Q40,14 0,-2 Q-40,14 -84,2 Z ' + eyeHoles(), BLACK, 6, 'fill-rule="evenodd"'), L('M-60,-40 Q-40,-46 -22,-40', 3, '#5a5666')];
M.masquerade = ({ view, X }) => view === 'side' ? [P(`M${f(X(16))},-40 L${f(X(102))},-44 L${f(X(104))},-2 L${f(X(20))},4 Z M${f(X(58))},-19 a14,13 0 1,1 28,0 a14,13 0 1,1 -28,0 Z`, '#7a3fa0', 6, 'fill-rule="evenodd"'), ...[0, 1, 2].map(k => P(`M${f(X(20))},-36 Q${f(X(-10 - k * 20))},${-90 - k * 10} ${f(X(-40 - k * 24))},${-110 + k * 26} Q${f(X(-10 - k * 10))},${-60 + k * 6} ${f(X(24))},-26 Z`, ['#3fb6a8', '#f2c230', '#e8466a'][k], 4.5))]
  : [...[0, 1, 2].map(k => P(`M-84,-30 Q${-110 - k * 14},${-90 - k * 8} ${-70 - k * 30},${-126 + k * 26} Q${-80 - k * 10},${-70 + k * 4} -70,-34 Z`, ['#3fb6a8', '#f2c230', '#e8466a'][k], 4.5)), P('M-98,-40 Q-60,-58 0,-38 Q60,-58 98,-40 Q104,-10 84,6 Q40,18 0,0 Q-40,18 -84,6 Q-104,-10 -98,-40 Z ' + eyeHoles(), '#7a3fa0', 6, 'fill-rule="evenodd"'),
    L('M-66,-19 A26,19 0 1,1 -14,-19 A26,19 0 1,1 -66,-19 M14,-19 A26,19 0 1,1 66,-19 A26,19 0 1,1 14,-19', 3, GOLD), ring(0, -34, 7, '#e8466a', 3), ...[-80, 80].map(x => dot(x, -22, 4, GOLD)), L('M-90,-36 Q-60,-50 -30,-42', 2.6, '#b07fd0')];
M.bandana = ({ view, X }) => view === 'side' ? [L(`M${f(X(44))},16 L${f(X(-70))},-4`, 6, RED), P(`M${f(X(-70))},-10 l-26,-10 l8,22 l-22,14 l40,-6 Z`, RED, 4.5), P(`M${f(X(40))},8 Q${f(X(100))},-2 ${f(X(112))},20 L${f(X(80))},120 Q${f(X(50))},70 ${f(X(40))},8 Z`, RED, 6.5), ...[[70, 40], [86, 64], [66, 76]].map(([x, y]) => ring(X(x), y, 4.5, WHITE, 2))]
  : [P('M-78,6 Q0,-10 78,6 Q60,70 0,128 Q-60,70 -78,6 Z', RED, 6.5), L('M-74,12 Q0,-2 74,12', 3, shade(RED, .7)), ...[[-40, 34], [0, 30], [40, 34], [-20, 60], [20, 60], [0, 90]].map(([x, y]) => ring(x, y, 5, WHITE, 2)), L('M-78,6 L-100,-6 M78,6 L100,-6', 6, RED)];
M.plague = ({ view, X }) => view === 'side' ? [P(`M${f(X(10))},-60 Q${f(X(60))},-70 ${f(X(104))},-40 L${f(X(110))},10 Q${f(X(60))},60 ${f(X(10))},50 Z`, LEATHER, 7), P(`M${f(X(96))},-22 Q${f(X(190))},-6 ${f(X(236))},40 Q${f(X(170))},34 ${f(X(96))},26 Z`, LEATHER, 7), L(`M${f(X(110))},4 Q${f(X(170))},14 ${f(X(226))},38`, 3, LEATHERD), ring(X(70), -19, 22, '#2a2630', 6), ring(X(70), -19, 14, '#7fd0e0', 3), dot(X(64), -25, 4, '#fff'), ...[0, 1, 2, 3].map(k => L(`M${f(X(18))},${-40 + k * 22} l12,0`, 2.6, '#e8d9b8')), ring(X(150), 14, 3, BLACK, 1.5)]
  : [P('M-96,-50 Q0,-76 96,-50 Q104,10 70,50 Q0,70 -70,50 Q-104,10 -96,-50 Z', LEATHER, 7), P('M-30,-6 Q0,-18 30,-6 L8,150 Q0,160 -8,150 Z', LEATHER, 7), L('M0,-8 L0,148', 3, LEATHERD), ...[0, 1, 2, 3, 4].map(k => L(`M-6,${10 + k * 26} l12,0`, 2.6, '#e8d9b8')),
    ...[-1, 1].flatMap(s => [ring(s * 44, -19, 26, '#2a2630', 6), ring(s * 44, -19, 17, '#7fd0e0', 3), dot(s * 44 - 6, -25, 5, '#fff')]), ...[-80, -60, 60, 80].map(x => dot(x, -52 + Math.abs(x) * .06, 3, '#e8d9b8')), L('M-96,-30 L-104,-36 M96,-30 L104,-36', 6, LEATHERD)];
M.gas = ({ view, X }) => view === 'side' ? [P(`M${f(X(10))},-56 Q${f(X(70))},-70 ${f(X(106))},-30 Q${f(X(120))},30 ${f(X(90))},80 Q${f(X(40))},90 ${f(X(10))},60 Z`, '#4f5a48', 7), ring(X(72), -19, 24, '#2a2630', 6), ring(X(72), -19, 16, '#b8d86a', 3), P(`M${f(X(96))},26 L${f(X(150))},34 L${f(X(150))},84 L${f(X(96))},76 Z`, '#3a4236', 6.5), ...[0, 1, 2].map(k => L(`M${f(X(150))},${44 + k * 14} l0,6`, 5, STEELL)), L(`M${f(X(12))},-40 L${f(X(-70))},-50 M${f(X(12))},40 L${f(X(-70))},30`, 6, '#3a4236')]
  : [P('M-92,-52 Q0,-76 92,-52 Q108,20 60,84 Q0,104 -60,84 Q-108,20 -92,-52 Z', '#4f5a48', 7), ...[-1, 1].flatMap(s => [ring(s * 44, -19, 28, '#2a2630', 6), ring(s * 44, -19, 19, '#b8d86a', 3), L(`M${s * 44 - 10},${-28} q8,-8 16,-4`, 3, '#eaf7b0')]), ring(0, 52, 34, '#3a4236', 7), ring(0, 52, 22, '#2a2630', 4), ...[0, 1, 2, 3, 4, 5].map(k => dot(Math.cos(k * 1.047) * 12, 52 + Math.sin(k * 1.047) * 12, 3.4, STEELL)), dot(0, 52, 3.4, STEELL), L('M-92,-40 L-104,-48 M92,-40 L104,-48 M-80,50 L-102,40 M80,50 L102,40', 6, '#3a4236'), L('M-20,6 Q0,-4 20,6', 3, '#6d7a64')];
M.hockey = ({ view, X }) => view === 'side' ? [P(`M${f(X(30))},-84 Q${f(X(96))},-80 ${f(X(110))},-20 Q${f(X(116))},50 ${f(X(84))},100 Q${f(X(50))},100 ${f(X(30))},70 Z M${f(X(60))},-19 a14,13 0 1,1 28,0 a14,13 0 1,1 -28,0 Z`, WHITE, 7, 'fill-rule="evenodd"'), ...[[80, 30], [92, 52], [72, 60], [84, 78]].map(([x, y]) => dot(X(x), y, 4, INK)), P(`M${f(X(70))},-78 L${f(X(86))},-50 L${f(X(60))},-52 Z`, RED, 3.5), L(`M${f(X(30))},-40 L${f(X(-70))},-50 M${f(X(30))},50 L${f(X(-70))},40`, 6, BLACK)]
  : [P('M0,-92 C-70,-92 -92,-50 -90,0 C-88,60 -60,104 0,108 C60,104 88,60 90,0 C92,-50 70,-92 0,-92 Z ' + eyeHoles(), WHITE, 7, 'fill-rule="evenodd"'), P('M0,-84 L-12,-50 L12,-50 Z', RED, 3.5), ...[-1, 1].map(s => P(`M${s * 64},10 L${s * 40},22 L${s * 60},34 Z`, RED, 3.5)), ...[[-20, 34], [20, 34], [-30, 56], [0, 50], [30, 56], [-16, 78], [16, 78], [0, 20], [-50, -56], [50, -56], [0, -44]].map(([x, y]) => dot(x, y, 4.4, INK)), L('M-90,-30 L-104,-38 M90,-30 L104,-38 M-80,50 L-100,44 M80,50 L100,44', 6, BLACK), L('M-70,-60 Q-50,-78 -24,-84', 4, '#ffffff')];
M.oni = ({ view, X }) => view === 'side' ? [P(`M${f(X(30))},-80 Q${f(X(96))},-80 ${f(X(110))},-20 Q${f(X(120))},50 ${f(X(86))},96 Q${f(X(50))},96 ${f(X(30))},70 Z M${f(X(60))},-19 a14,11 0 1,1 28,0 a14,11 0 1,1 -28,0 Z`, '#c8322c', 7, 'fill-rule="evenodd"'), P(`M${f(X(70))},-78 Q${f(X(80))},-130 ${f(X(110))},-140 Q${f(X(100))},-100 ${f(X(92))},-74 Z`, '#f1e6cc', 5.5), P(`M${f(X(84))},52 l8,30 l8,-28 Z`, WHITE, 4), L(`M${f(X(60))},50 Q${f(X(90))},40 ${f(X(110))},52`, 5, INK), L(`M${f(X(56))},-40 L${f(X(100))},-30`, 8, INK)]
  : [...[-1, 1].map(s => P(`M${s * 44},-80 Q${s * 50},-130 ${s * 84},-146 Q${s * 78},-106 ${s * 70},-74 Z`, '#f1e6cc', 5.5)), P('M0,-90 C-72,-90 -94,-46 -92,2 C-90,60 -60,100 0,104 C60,100 90,60 92,2 C94,-46 72,-90 0,-90 Z ' + eyeHoles(), '#c8322c', 7, 'fill-rule="evenodd"'),
    L('M-74,-48 L-16,-30 M74,-48 L16,-30', 10, INK), P('M-14,2 Q0,-8 14,2 L18,22 Q0,32 -18,22 Z', shade('#c8322c', .78), 4), P('M-56,46 Q0,30 56,46 Q40,84 0,86 Q-40,84 -56,46 Z', '#3a1416', 5.5), ...[-36, -12, 12, 36].map(x => P(`M${x - 9},46 L${x},${Math.abs(x) > 20 ? 78 : 62} L${x + 9},46 Z`, WHITE, 3.5)), L('M-70,-66 Q-40,-84 -10,-84', 4, tint('#c8322c', .4)), L('M-30,-70 Q0,-60 30,-70', 3, shade('#c8322c', .7))];
M.welding = ({ view, X }) => view === 'side' ? [P(`M${f(X(20))},-96 L${f(X(110))},-80 L${f(X(118))},90 L${f(X(40))},104 Z`, '#5f6470', 7), `<rect x="${f(X(84))}" y="-38" width="${f(26 * .78)}" height="36" fill="#1b2a22" stroke="${INK}" stroke-width="4"/>`, ring(X(30), -20, 10, STEELD, 4), L(`M${f(X(20))},-60 Q${f(X(-40))},-110 ${f(X(-80))},-60`, 9, '#3a3d46')]
  : [P('M-88,-96 L88,-96 L96,60 Q0,130 -96,60 Z', '#5f6470', 7), `<rect x="-56" y="-44" width="112" height="46" rx="4" fill="#1b2a22" stroke="${INK}" stroke-width="6"/>`, L('M-44,-34 L-10,-34', 5, '#3f8f6a', .8), `<rect x="-66" y="-54" width="132" height="66" rx="6" fill="none" stroke="${STEELD}" stroke-width="4"/>`, rivets([[-74, -80], [74, -80], [-78, 40], [78, 40]]), ...[0, 1, 2].map(k => L(`M-30,${40 + k * 16} L30,${40 + k * 16}`, 4, '#454a55')), L('M-80,-80 Q-84,-20 -84,40', 5, '#8a909c')];
M.scuba = ({ view, X }) => view === 'side' ? [L(`M${f(X(20))},-20 L${f(X(-70))},-26`, 9, BLACK), P(`M${f(X(34))},-52 L${f(X(104))},-56 L${f(X(118))},-30 L${f(X(118))},20 L${f(X(36))},16 Z`, '#f2c230', 6.5), `<path d="M${f(X(48))},-42 L${f(X(100))},-46 L${f(X(108))},-26 L${f(X(108))},10 L${f(X(48))},6 Z" fill="#9fd6ef" fill-opacity=".5" stroke="${INK}" stroke-width="4"/>`, L(`M${f(X(10))},40 Q${f(X(-20))},-40 ${f(X(-10))},-150`, 15, INK), L(`M${f(X(10))},40 Q${f(X(-20))},-40 ${f(X(-10))},-150`, 8, '#e8466a')]
  : [L('M-84,-22 L-104,-28 M84,-22 L104,-28', 9, BLACK), P('M-86,-52 Q0,-62 86,-52 L88,6 Q40,20 14,6 L0,22 L-14,6 Q-40,20 -88,6 Z', '#f2c230', 6.5), `<path d="M-74,-42 Q0,-50 74,-42 L76,0 Q40,10 16,-4 L0,8 L-16,-4 Q-40,10 -76,0 Z" fill="#9fd6ef" fill-opacity=".45" stroke="${INK}" stroke-width="4"/>`, L('M-62,-34 Q-40,-42 -20,-40', 5, '#ffffff', .8), L('M100,50 Q130,-40 112,-160', 15, INK), L('M100,50 Q130,-40 112,-160', 8, '#e8466a'), L('M30,44 Q70,60 100,50', 13, INK), L('M30,44 Q70,60 100,50', 7, '#e8466a')];
M.eyepatch = ({ view, X }) => view === 'side' ? [L(`M${f(X(60))},-40 L${f(X(-60))},-70 M${f(X(60))},-6 L${f(X(-70))},20`, 4, BLACK), ell(X(74), -19, 16, 20, BLACK, 5)] : [L('M-100,-60 L20,-34 M96,-6 L56,-4', 4, BLACK), P('M16,-38 Q40,-48 64,-38 Q70,-8 40,6 Q10,-8 16,-38 Z', BLACK, 5), L('M26,-32 Q40,-38 52,-34', 2.6, '#5a5666')];
M.groucho = ({ view, X }) => view === 'side' ? [ring(X(74), -19, 22, 'none', 7), L(`M${f(X(52))},-22 L${f(X(-40))},-30`, 6), P(`M${f(X(92))},-10 Q${f(X(136))},10 ${f(X(124))},34 Q${f(X(100))},40 ${f(X(92))},24 Z`, '#f2b79a', 5.5), P(`M${f(X(60))},30 Q${f(X(96))},22 ${f(X(118))},40 Q${f(X(92))},58 ${f(X(60))},48 Z`, BLACK, 5), L(`M${f(X(56))},-52 Q${f(X(78))},-66 ${f(X(100))},-52`, 11, BLACK)]
  : [...[-1, 1].map(s => ring(s * 40, -19, 28, 'none', 7)), L('M-12,-22 Q0,-30 12,-22 M-68,-24 L-100,-34 M68,-24 L100,-34', 6), P('M-14,-8 Q0,-16 14,-8 Q26,22 14,34 Q0,42 -14,34 Q-26,22 -14,-8 Z', '#f2b79a', 5.5), P('M-56,40 Q-28,26 0,38 Q28,26 56,40 Q30,66 0,52 Q-30,66 -56,40 Z', BLACK, 5), L('M-70,-58 Q-40,-72 -14,-56 M14,-56 Q40,-72 70,-58', 12, BLACK)];
M.kitsune = ({ view, X }) => view === 'side' ? [P(`M${f(X(30))},-84 L${f(X(50))},-140 L${f(X(84))},-84 Q${f(X(112))},-40 ${f(X(150))},20 Q${f(X(90))},30 ${f(X(40))},20 Z M${f(X(62))},-22 q14,-12 28,-2 q-14,8 -28,2 Z`, WHITE, 7, 'fill-rule="evenodd"'), P(`M${f(X(44))},-96 L${f(X(52))},-124 L${f(X(68))},-92 Z`, RED, 3), dot(X(146), 18, 6, INK), L(`M${f(X(100))},0 Q${f(X(120))},10 ${f(X(140))},14`, 4, RED), L(`M${f(X(30))},-40 L${f(X(-70))},-50`, 5, RED)]
  : [P('M-88,-70 L-74,-142 L-36,-88 Q0,-98 36,-88 L74,-142 L88,-70 Q96,-10 40,20 L0,44 L-40,20 Q-96,-10 -88,-70 Z M-66,-22 q22,-18 44,-2 q-22,12 -44,2 Z M22,-24 q22,-16 44,2 q-22,10 -44,-2 Z', WHITE, 7, 'fill-rule="evenodd"'), ...[-1, 1].map(s => P(`M${s * 80},-80 L${s * 72},-122 L${s * 50},-90 Z`, RED, 3)), L('M-70,-30 Q-80,-50 -64,-62 M70,-30 Q80,-50 64,-62', 5, RED), P('M-8,26 L8,26 L0,38 Z', INK, 2), L('M0,-84 L0,-60 M-12,-78 L-6,-62 M12,-78 L6,-62', 4, RED), L('M-30,6 l-22,6 M-28,14 l-20,12 M30,6 l22,6 M28,14 l20,12', 2.6, INK), L('M-88,-40 L-104,-46 M88,-40 L104,-46', 5, RED)];
['plague', 'gas', 'hockey', 'oni', 'welding', 'kitsune'].forEach(k => { M[k].full = true; });   // full-face masks stay on the head in 3/4
export const MASKS = M;

// hair + helmet + mask on one castkit spec
export function withGear(spec, hairKey, opts = {}) {
  const hat = opts.helmet ? (typeof opts.helmet === 'function' ? opts.helmet : HELMETS[opts.helmet]) : opts.hat;
  const s = withHair(spec, hairKey, { ...opts, hat });
  if (!opts.mask) return s;
  const mf = typeof opts.mask === 'function' ? opts.mask : MASKS[opts.mask], ft = s.faceTop;
  return { ...s, faceTop: Hh => { const view = Hh.view === '34' ? 'front' : (Hh.view || 'front'), dir = Hh.dir || 1; if (view === 'back') return ft ? ft(Hh) : [];
      const X = view === 'side' ? v => (v - 34) / .78 : v => v, q = Hh.view === '34'; SLIDE = q && !!mf.full; let parts = mf({ view, X }); SLIDE = false;
      if (q && mf.full) parts = [`<g transform="scale(${(1 / SK).toFixed(4)},1) translate(${-SX},0)">${parts.join('')}</g>`];
      return [...(ft ? ft(Hh) : []), `<g transform="translate(${f(Hh.cx)},${f(Hh.hy)})${dir < 0 ? ' scale(-1,1)' : ''}">${parts.join('')}</g>`]; } };
}
