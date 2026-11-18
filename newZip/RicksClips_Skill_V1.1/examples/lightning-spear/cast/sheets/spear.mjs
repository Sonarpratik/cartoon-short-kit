// CAST of "Why The Safest Tower Had A Spear On Top" (northern Italy, about 1765). character-artist 2026-11-15.
// Puppets: "cast:spear/mason" "cast:spear/priest" "cast:spear/rival" "cast:spear/ringer" "cast:spear/hen" and the market:
// "cast:spear/baker" "olive" "marketwoman" "picker" "oldman" "girl" "boy" "eggwoman". film.json: "puppet_pkg": ["<path to>/cast", "<path to>/templates/vector2d_characters/code"].
// Built ONLY from the locked kit: three-size bible bodies, hair_lib, head_wear, face_gear, outfit_lib parts. New RECIPES are registered here at load from library parts
// (same way as the hookA stand-in). Three small SIGNATURE pieces (neck knot + chalk hand, rosary, ear wool) and the hen card are drawn here; move them into the library when CB locks the cast.
//
// PERIOD CHECK 1765 northern Italy (hat / neckwear / facial hair), one line per character, done BEFORE rendering:
//  mason       knitted wool berretto, no pompom (workman's cap, 1700s) / open linen collar + knotted neckerchief (workman; no stock, no tie) / clean-shaven
//  priest      round low-crowned wide-brim clergy hat = cappello romano (in use since the 1600s) / narrow white linen collarino showing above the cassock collar (NOT the 1800s tab collar, NOT French rabat bands) / clean-shaven
//  rival       black tricorne with gold edge (gentleman's hat 1700-1790) over a powdered wig (the rich only) / white lace jabot (no cravat bow, no tie) / clean-shaven
//  ringer      long knitted stocking cap (workman and peasant cap all through the 1700s) / collarless shirt, no neckwear / clean-shaven
//  baker       bare head (the tall chef toque is 1800s: not used) / band-collar shirt / clean-shaven
//  olive       soft straw hat (farm labourer 1600s-1930s) / knotted kerchief / clean-shaven
//  marketwoman tied headscarf (fazzoletto) / chemise neck, laced bodice / -
//  picker      bare head, two braids / chemise neck, laced bodice / -
//  oldman      soft wide felt hat (countryman's hat, 1700s; no tricorne so no gold on the near hill) / open shirt collar / clean-shaven
//  girl        bare head, pigtails / laced bodice / -        boy   knitted cap, no pompom / open collar / -
//  eggwoman    bare head, grey bun / wool shawl crossed at the neck / -
// No one wears a beard, moustache or sideburns (men of the 1760s are clean-shaven). No shoes (kit rule). Hands are the kit's round fists.
// COLOUR (LOOK_BIBLE): teal = the mason only; madder red = his cap only; white + gold = the rival only; town = yellow, terracotta, olive, cream, dusty blue.
import { wear, HATS2 } from '../head_wear.mjs';
import { O, SK, skPat, SKIN, WHITE } from '../outfit_lib.mjs';
export const TITLE = 'Why The Safest Tower Had A Spear On Top: the cast (northern Italy, 1765)';

const INK = '#2a1a1f', f = n => (+n).toFixed(1);
const CREAM = '#f3ead6', TEAL = '#12907c', MADDER = '#cf3a2c', MUSTARD = '#d9a12b';
const YELLOW = '#e3b23c', TERRA = '#c8603a', OLIVE = '#7d8a3c', DBLUE = '#7d93b0', WOOD = '#a8743f', WOODD = '#6e4527';
const IVORY = '#f2e4c0', GOLDR = '#e0b040', GOLDD = '#c8962e', CASSOCK = '#3a3540', SASH = '#55405f';

// ---------- recipes (library parts only) ----------
O('mason1765s', 'Mason: linen shirt, buttoned waistcoat, neckerchief (1760s workman)', 'Europe history', 'm', [CREAM, TEAL, '#e2a93b'],
  [['vest', 'b', .05, .4], ['shirtCollar', 'a'], ['kerchief', MUSTARD], ['buttons', 5, 'c', .4, .9], ['low', '#7a4a2c', .9], ['seams']]);
O('priest1765', 'Parish priest: black cassock, white collarino, sash (Italy 1700s)', 'Europe history', 'm', [CASSOCK, WHITE, WOOD],
  [['mandarin', WHITE], ['buttons', 9, '#6a6275', .24, .6], ['cummerbund', SASH, .62], ['seams']], { skirt: P => SK('ankle', P.a, { pat: skPat.pleats('#ffffff'), folds: 3 }) });
O('rival1765', 'Gentleman builder: ivory skirted coat, gold waistcoat, lace jabot (1760s)', 'Europe history', 'm', [IVORY, GOLDR, GOLDD],
  [['trimV', 'b', 0, .62], ['lapels', 'a', WHITE, 'cravat', WHITE], ['jabot', WHITE], ['buttons', 5, 'c', .5, .92, .3], ['pocket', -.64, .7, { c: IVORY, flap: 1, btn: GOLDD }], ['pocket', .64, .7, { c: IVORY, flap: 1, btn: GOLDD }], ['hem', 'b', .07], ['seams']],
  { skirt: P => SK('mini', P.a, { pat: skPat.split('#cdbb8e'), hem: P.b, folds: 3 }) });
O('ringer1765', 'Bell ringer: collarless shirt, short patched waistcoat, rope belt (1760s)', 'Europe history', 'm', ['#e6dcc3', '#8a5a34', '#b88a5a'],
  [['vest', 'b', .1, .46], ['mandarin', 'a'], ['buttons', 3, 'c', .5, .76], ['pocket', .5, .56, { c: '#b07a48', st: CREAM }], ['low', '#6b6450', .86], ['rope', '#c9b28a', .82], ['seams']]);
O('towns1765', 'Townsman: shirt, short waistcoat, breeches (1760s)', 'Europe history', 'm', [CREAM, DBLUE, '#5a4a3e'],
  [['vest', 'b', .08, .42], ['shirtCollar', 'a'], ['buttons', 4, 'c', .44, .88], ['low', '#6a5a48', .9], ['seams']]);
O('bodice1765', 'Market woman: chemise, laced bodice, skirt with apron (1760s)', 'Europe history', 'f', [YELLOW, CREAM, TERRA],
  [['top', 'b', .3], ['vneck', SKIN, .2], ['lacing', 'c', .36, .7, 5]], { skirt: P => SK('knee', P.a, { pat: skPat.front(P.b, 70), hem: P.c, hemW: 10, flare: 1.4, folds: 4 }) });
O('shawl1765', 'Old market woman: wool shawl crossed at the neck, plain skirt (1760s)', 'Europe history', 'f', [DBLUE, CREAM, OLIVE],
  [['scarf', 'b', 'c'], ['low', 'a', .5], ['rope', '#c9b28a', .56]], { skirt: P => SK('knee', P.a, { pat: skPat.band(P.c, 70, 14), flare: 1.3, folds: 4 }) });

// ---------- signature pieces (body space; drawn with the outfit so they move with the torso) ----------
const geo = ctx => { const { cx, bodyTop: t, bodyBot: b, wB: w, side } = ctx, H = b - t, k = Math.max(.75, Math.min(1.35, w / (side ? 83 : 104))); return { X: u => cx + u * w, Y: v => t + v * H, H, k, side }; };
const addSig = (front, back) => S => { const d = S.details, bd = S.backDetails; if (front) S.details = ctx => [...(d ? d(ctx) : []), ...front(ctx, geo(ctx))]; if (back) S.backDetails = ctx => [...(bd ? bd(ctx) : []), ...back(ctx, geo(ctx))]; };
// MASON: the neckerchief is knotted on HIS LEFT (screen-right from the front) + one white chalk handprint on his right hip
const masonSig = (ctx, G) => { const x = G.X(G.side ? .25 : .36), y = G.Y(.13), k = G.k, hx = G.X(G.side ? .05 : -.5), hy = G.Y(.74), o = [];
  o.push(`<path d="M${f(x)},${f(y)} L${f(x + 20 * k)},${f(y + 34 * k)} L${f(x + 5 * k)},${f(y + 30 * k)} Z M${f(x)},${f(y)} L${f(x - 6 * k)},${f(y + 38 * k)} L${f(x - 16 * k)},${f(y + 28 * k)} Z" fill="${MUSTARD}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(9 * k)}" fill="${MUSTARD}" stroke="${INK}" stroke-width="3"/>`);
  const fing = [[-12, -15, -15, -30], [-4, -17, -5, -35], [4, -17, 6, -34], [11, -14, 16, -28], [15, -2, 27, -8]].map(([a, b, c, d]) => `M${f(hx + a * k)},${f(hy + b * k)} L${f(hx + c * k)},${f(hy + d * k)}`).join(' ');
  o.push(`<g opacity=".9"><ellipse cx="${f(hx)}" cy="${f(hy)}" rx="${f(14 * k)}" ry="${f(15 * k)}" fill="#ffffff"/><path d="${fing}" stroke="#ffffff" stroke-width="${f(7 * k)}" stroke-linecap="round" fill="none"/></g>`);
  return o; };
// PRIEST: a big wooden rosary hangs from the sash on HIS RIGHT (screen-left from the front, screen-right from the back)
const rosary = back => (ctx, G) => { const k = G.k, x = G.X(G.side ? .1 : back ? .55 : -.55), y0 = G.Y(.68), ry = G.H * .12, rx = 18 * k, cy = y0 + ry, o = [];
  o.push(`<ellipse cx="${f(x)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="${INK}" stroke-width="2.4"/>`);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; o.push(`<circle cx="${f(x + Math.sin(a) * rx)}" cy="${f(cy - Math.cos(a) * ry)}" r="${f(6.6 * k)}" fill="${WOOD}" stroke="${INK}" stroke-width="2.2"/>`); }
  const yb = cy + ry, r = 13 * k, yc = yb + 30 * k;
  o.push(`<circle cx="${f(x)}" cy="${f(yb + 9 * k)}" r="${f(5.6 * k)}" fill="${WOOD}" stroke="${INK}" stroke-width="2.2"/>`,
    `<path d="M${f(x - r * .3)},${f(yc - r)} h${f(r * .6)} v${f(r * .6)} h${f(r * .7)} v${f(r * .6)} h${f(-r * .7)} v${f(r * 1.1)} h${f(-r * .6)} v${f(-r * 1.1)} h${f(-r * .7)} v${f(-r * .6)} h${f(r * .7)} Z" fill="${WOODD}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`);
  return o; };
// BELL RINGER: a tuft of white wool in each ear (head piece function like the library earPencil: sits over the hair, shows in all four views)
const earWool = Object.assign(Pp => (Pp.view === 'side' ? [[-34, 0]] : [[-110, -1], [110, 1]]).map(([x, s]) => { const c = [[0, 10, 14], [s ? s * 12 : -11, -1, 10], [s ? s * 11 : 10, 22, 10]];
  return c.map(([dx, y, r]) => `<circle cx="${f(x + dx)}" cy="${f(y)}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="7"/>`).join('') + c.map(([dx, y, r]) => `<circle cx="${f(x + dx)}" cy="${f(y)}" r="${r - 1}" fill="#ffffff"/>`).join(''); }), { label: 'White wool tuft in each ear' });

// ---------- head wear from the library, recoloured ----------
// knitted cap = the library beanie WITHOUT its pompom (a pompom is modern)
const berretto = Object.assign(PP => HATS2.beanie(PP).slice(0, -1), HATS2.beanie, { label: 'Knitted wool cap (berretto), no pompom' });
// the library headscarf has one fixed red: map its red family onto another colour (the cream dots stay)
const hx2 = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), lum = ([r, g, b]) => .3 * r + .59 * g + .11 * b;
const scarfIn = col => { const base = lum(hx2('#c8475a')), n = hx2(col);
  return Object.assign(PP => HATS2.headscarf(PP).map(s => String(s).replace(/#[0-9a-fA-F]{6}/g, m => { const c = hx2(m); if (!(c[0] > c[1] + 40 && c[0] > c[2] + 30)) return m; const q = lum(c) / base; return '#' + n.map(v => Math.max(0, Math.min(255, Math.round(v * q))).toString(16).padStart(2, '0')).join(''); })), HATS2.headscarf, { label: 'Headscarf (fazzoletto), recoloured' }); };

// ---------- THE WHITE HEN (own card: a small living thing, not on the human rig). Poses: stand, stare, puff (film.json pose or face name containing the word). ----------
let HID = 0;
function henSvg(st = {}) { const key = `${st.pose || ''} ${st.face || ''} ${st.prop || ''}`, pose = /puff/.test(key) ? 'puff' : /stare/.test(key) ? 'stare' : 'stand';
  const view = st.view === 'front' || st.view === 'back' ? st.view : 'side', dir = st.dir || 1, id = 'hen' + (HID++), RED = MADDER, BEAK = '#f0a63a', BLK = '#2a2530';
  const feather = (x, y, ang, len, wd, col) => `<path transform="translate(${x},${y}) rotate(${ang})" d="M0,0 C${-wd},${-len * .35} ${-wd * .8},${-len * .9} 0,${-len} C${wd * .8},${-len * .9} ${wd},${-len * .35} 0,0 Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` + `<path transform="translate(${x},${y}) rotate(${ang})" d="M0,${-len * .12} L0,${-len * .82}" stroke="${col === BLK ? '#6a6475' : '#cfcad6'}" stroke-width="3" stroke-linecap="round"/>`;
  const leg = (x, y0, toes = 1) => `<path d="M${x},${y0} L${x},1432 ${toes > 0 ? `M${x - 20},1436 L${x},1426 L${x + 30},1436 M${x},1426 L${x + 8},1438` : `M${x - 24},1436 L${x},1426 L${x + 24},1436 M${x},1426 L${x},1438`}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ball = (cx, cy, R, n = 20, sp = 30) => 'M' + [...Array(n * 2)].map((_, i) => { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? R : R + sp; return f(cx + Math.cos(a) * r) + ',' + f(cy + Math.sin(a) * r); }).join(' L') + ' Z';
  const fill = `url(#${id})`, shapes = [], under = [], over = [];   // shapes: [svg element without paint]; drawn once in ink (grown), once in white = one clean outline round the union
  const S = (el) => shapes.push(el), eye = (x, y, big, brow) => (big ? `<circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${x + (view === 'side' ? 4 : 0)}" cy="${y + 2}" r="7" fill="${INK}"/>` : `<circle cx="${x}" cy="${y}" r="9.5" fill="${INK}"/>`) + (brow ? `<path d="M${brow[0]},${brow[1]} L${brow[2]},${brow[3]}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>` : '');
  const comb = (x, y, s = 1) => `<path transform="translate(${x},${y}) scale(${s})" d="M-40,14 C-46,-18 -20,-24 -14,-2 C-14,-36 16,-36 16,-4 C24,-26 48,-14 40,16 Z" fill="${RED}" stroke="${INK}" stroke-width="6.5" stroke-linejoin="round"/>`;
  if (view === 'side') {
    if (pose === 'puff') { const cx = 390, cy = 1195;
      under.push(feather(250, 1120, -62, 190, 34, BLK), leg(350, 1380), leg(430, 1380));
      S(`<path d="${ball(cx, cy, 196)}"/>`); S(`<circle cx="520" cy="1090" r="62"/>`);
      over.push(comb(528, 1020), `<path d="M574,1076 L628,1094 L576,1112 Z" fill="${BEAK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`, `<ellipse cx="572" cy="1128" rx="11" ry="17" fill="${RED}" stroke="${INK}" stroke-width="5"/>`, eye(538, 1078, 0, [514, 1050, 560, 1066]),
        `<path d="M300,1150 l26,-22 M330,1260 l-30,10 M440,1290 l24,20 M470,1180 l30,-6 M360,1100 l6,-30" stroke="#cfcad6" stroke-width="5" stroke-linecap="round"/>`,
        feather(650, 990, 40, 60, 14, '#ffffff'), feather(170, 1010, -30, 54, 13, '#ffffff'), feather(640, 1300, 110, 50, 12, '#ffffff'));
    } else { const hx = pose === 'stare' ? 610 : 548, hy = pose === 'stare' ? 1108 : 1032;
      under.push(feather(262, 1170, -52, 150, 30, '#ffffff'), feather(250, 1150, -30, 200, 32, BLK), feather(268, 1200, -74, 130, 28, '#ffffff'), leg(360, 1330), leg(425, 1330));
      S(`<ellipse cx="385" cy="1215" rx="172" ry="132"/>`); S(`<path d="M480,1150 L${hx - 8},${hy + 10}" fill="none" stroke-width="96" stroke-linecap="round"/>`); S(`<circle cx="${hx}" cy="${hy}" r="64"/>`);
      over.push(comb(hx + 4, hy - 70), `<path d="M${hx + 58},${hy - 16} L${hx + 116},${hy + 6} L${hx + 58},${hy + 22} Z" fill="${BEAK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`, `<ellipse cx="${hx + 52}" cy="${hy + 42}" rx="11" ry="18" fill="${RED}" stroke="${INK}" stroke-width="5"/>`,
        eye(hx + 22, hy - 14, pose === 'stare', [hx - 2, hy - 44, hx + 44, hy - 30]),
        `<path d="M318,1190 C390,1150 480,1190 468,1244 C436,1296 350,1290 318,1190 Z" fill="${fill}" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/><path d="M356,1232 q26,22 52,2 M392,1256 q22,16 44,0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`); }
  } else if (view === 'front') {
    if (pose === 'puff') { under.push(feather(520, 1080, 38, 170, 32, BLK), leg(365, 1380, 0), leg(435, 1380, 0)); S(`<path d="${ball(400, 1200, 200)}"/>`);
      over.push(comb(400, 1066, .9), eye(366, 1128, 0, [338, 1096, 384, 1112]), eye(434, 1128, 0, [462, 1096, 416, 1112]), `<path d="M400,1132 L418,1152 L400,1176 L382,1152 Z" fill="${BEAK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
        `<path d="M300,1220 l-26,16 M500,1220 l26,16 M340,1300 l-14,26 M460,1300 l14,26 M400,1250 l0,30" stroke="#cfcad6" stroke-width="5" stroke-linecap="round"/>`, feather(640, 1010, 30, 56, 13, '#ffffff'), feather(160, 1040, -36, 52, 12, '#ffffff'));
    } else { const big = pose === 'stare', hy = big ? 1060 : 1040;
      under.push(feather(500, 1150, 34, 190, 32, BLK), feather(470, 1140, 12, 130, 28, '#ffffff'), leg(360, 1330, 0), leg(440, 1330, 0));
      S(`<ellipse cx="400" cy="1220" rx="158" ry="130"/>`); S(`<path d="M400,${hy + 10} L400,1160" fill="none" stroke-width="100" stroke-linecap="round"/>`); S(`<circle cx="400" cy="${hy}" r="${big ? 74 : 68}"/>`);
      over.push(comb(400, hy - (big ? 80 : 74)), eye(370, hy - 12, big, [344, hy - 44, 388, hy - 32]), eye(430, hy - 12, big, [456, hy - 44, 412, hy - 32]), `<path d="M400,${hy + 4} L418,${hy + 22} L400,${hy + 46} L382,${hy + 22} Z" fill="${BEAK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
        `<ellipse cx="388" cy="${hy + 58}" rx="9" ry="15" fill="${RED}" stroke="${INK}" stroke-width="4.5"/><ellipse cx="412" cy="${hy + 58}" rx="9" ry="15" fill="${RED}" stroke="${INK}" stroke-width="4.5"/>`,
        `<path d="M262,1180 C240,1240 262,1300 300,1320 M538,1180 C560,1240 538,1300 500,1320" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`); }
  } else {   // back: no face; the tail fan sits on the middle of the back, the black feather in the centre
    if (pose === 'puff') { under.push(leg(365, 1380, 0), leg(435, 1380, 0)); S(`<path d="${ball(400, 1200, 200)}"/>`); over.push(comb(400, 1010, .8), feather(400, 1210, 0, 190, 34, BLK));
    } else { under.push(leg(360, 1330, 0), leg(440, 1330, 0)); S(`<ellipse cx="400" cy="1220" rx="158" ry="130"/>`); S(`<circle cx="400" cy="1040" r="68"/>`); S(`<path d="M400,1050 L400,1160" fill="none" stroke-width="100" stroke-linecap="round"/>`);
      over.push(comb(400, 966), feather(372, 1240, -24, 150, 30, '#ffffff'), feather(428, 1240, 24, 150, 30, '#ffffff'), feather(400, 1236, 0, 200, 32, BLK)); }
  }
  const paint = (el, ink) => { const line = /stroke-width="(\d+)"/.exec(el); return ink ? (line ? el.replace(/stroke-width="(\d+)"/, (m, w) => `stroke-width="${+w + 15}" stroke="${INK}"`) : el.replace('/>', ` fill="${INK}" stroke="${INK}" stroke-width="15" stroke-linejoin="round"/>`)) : (line ? el.replace('fill="none"', `fill="none" stroke="${fill}"`) : el.replace('/>', ` fill="${fill}"/>`)); };
  const body = [...under, ...shapes.map(e => paint(e, 1)), ...shapes.map(e => paint(e, 0)), ...over].join('');
  // soft template-style shade: white on the side the hen looks to, soft light grey on the far side (never a second shade stacked)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1500" viewBox="0 0 800 1500"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="640" y1="1000" x2="200" y2="1340"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ffffff"/><stop offset="1" stop-color="#d9d5e1"/></linearGradient></defs><g${view === 'side' && dir < 0 ? ' transform="translate(800,0) scale(-1,1)"' : ''}>${body}</g></svg>`; }
export const HEN = { svg: henSvg, poses: ['stand', 'stare', 'puff'] };

// ---------- THE CAST ----------
const base = spec => ({ form: 'standard', face: 'standard', views: true, sideFarArm: true, ...spec });
export const CAST = [
  // CHAR_LS_001 THE MASON (hero; standard body). The stand-in CB has seen: teal buttoned waistcoat over a cream linen shirt, madder red knitted cap, curly brown hair (CB: keep the curls).
  // SIGNATURE: mustard neckerchief knotted on HIS LEFT + one white chalk handprint on his right hip.
  wear(base({ name: 'mason', label: 'The Young Mason', size: 'standard', outfit: 'mason1765s', outfitPal: { a: CREAM, b: TEAL, c: '#e2a93b' }, dress: addSig(masonSig) }), 'curlyCrop', { col: '#5a3320', hat: berretto, hatCol: MADDER }),
  // CHAR_LS_002 THE PRIEST (fat body): black cassock (the ONE allowed long cloth: it names the priest and the era), white collarino, violet-black sash, round clergy hat, ring of white hair. SIGNATURE: big wooden rosary at the sash on HIS RIGHT.
  wear(base({ name: 'priest', label: 'The Priest', size: 'fat', outfit: 'priest1765', dress: addSig(rosary(false), rosary(true)) }), 'baldTufts', { col: '#ece9f1', hat: 'sunHat', hatCol: CASSOCK, bandCol: '#55405f' }),
  // CHAR_LS_003 THE RIVAL (thin body = tall and narrow): ivory skirted coat with gold waistcoat, gold buttons and gold hem, lace jabot, powdered wig, the tallest hat of the cast (black tricorne, gold edge).
  // SIGNATURE: the long measuring cane with a gold knob, always in his RIGHT fist (a held prop: grips.mjs kind pole / obj staff); on the card: the gold-edged tricorne over the white wig.
  wear(base({ name: 'rival', label: 'The Rival Builder', size: 'thin', outfit: 'rival1765' }), 'powderWig', { col: '#f1eef5', hat: 'tricorn', hatCol: '#2e2a36' }),
  // CHAR_LS_004 THE BELL RINGER (thin body): big floppy knitted stocking cap, collarless shirt, short patched brown waistcoat, rope belt. SIGNATURE: a tuft of white wool in each ear.
  wear(base({ name: 'ringer', label: 'The Bell Ringer', size: 'thin', outfit: 'ringer1765' }), 'curlyCrop', { col: '#2e2622', hat: 'nightcap', hatCol: '#8d8f96', bandCol: '#a9abb2', pieces: [earWool] }),
  // ---- THE MARKET (8, no clones: body, hat, hair and colour all differ) ----
  wear(base({ name: 'baker', label: 'Baker', size: 'fat', outfit: 'baker', outfitPal: { a: TERRA, b: YELLOW, c: '#7a4a2c' } }), 'baldTufts', { col: '#3a2a22' }),                  // flour-splashed apron; SIG: bald head with dark side tufts + flour splats
  wear(base({ name: 'olive', label: 'Olive Seller', size: 'standard', outfit: 'smockFrock', outfitPal: { a: OLIVE, b: CREAM, c: TERRA } }), 'curlyCrop', { col: '#2a2420', hat: 'farmStraw', hatCol: '#e2c06a', bandCol: OLIVE }),   // SIG: straw hat with an olive band
  wear(base({ name: 'marketwoman', label: 'Market Woman', size: 'fat', outfit: 'bodice1765', outfitPal: { a: YELLOW, b: CREAM, c: TERRA } }), 'lowBun', { col: '#3a2a22', hat: scarfIn(DBLUE) }),   // SIG: dusty blue dotted headscarf
  wear(base({ name: 'picker', label: 'Grape Picker', size: 'thin', outfit: 'bodice1765', outfitPal: { a: TERRA, b: CREAM, c: OLIVE } }), 'braids', { col: '#4a2f22' }),                           // SIG: two dark braids
  wear(base({ name: 'oldman', label: 'Old Man', size: 'thin', head: 'potato', outfit: 'towns1765', outfitPal: { a: CREAM, b: DBLUE, c: '#5a4a3e' } }), 'elderGrey', { col: '#cfcbd6', hat: 'slouch', hatCol: '#8a6a44' }),   // SIG: wide soft felt hat
  wear(base({ name: 'girl', label: 'Girl', form: 'kid', outfit: 'bodice1765', outfitPal: { a: '#ecd27a', b: CREAM, c: DBLUE } }), 'pigtails', { col: '#3a2a22' }),                                 // SIG: pigtails
  wear(base({ name: 'boy', label: 'Boy (eats the olive)', form: 'kid', outfit: 'towns1765', outfitPal: { a: CREAM, b: OLIVE, c: '#5a4a3e' } }), 'curlyCrop', { col: '#7a4a26', hat: berretto, hatCol: YELLOW }),   // SIG: yellow knitted cap
  wear(base({ name: 'eggwoman', label: 'Egg Woman', size: 'standard', head: 'egg', outfit: 'shawl1765', outfitPal: { a: DBLUE, b: CREAM, c: OLIVE } }), 'grannyBun', { col: '#d6d2dc' }),         // SIG: grey bun, cream shawl
  // CHAR_LS_HEN THE WHITE HEN. SIGNATURE: ONE black tail feather. film.json: { "puppet": "cast:spear/hen", "height": 0.42, "heads_tall": 3.8 }, pose 'stand' | 'stare' | 'puff'.
  { name: 'hen', label: 'The White Hen', card: { metrics: { px: 515, headPx: 136, hy: 1035 }, svg: st => henSvg(st) } },
];
