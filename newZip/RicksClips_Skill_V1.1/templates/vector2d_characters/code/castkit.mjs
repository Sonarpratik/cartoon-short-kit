// CAST KIT: build a character from a short spec on top of the LOCKED rig (char2d), body forms (bodies.mjs) and faces (memes, memes2).
// A sheet module exports CAST = [spec x10]. Render: node castsheet.mjs <sheet.mjs>.
//
// spec = {
//   name: 'pharaoh',  label: 'Pharaoh',
//   form: 'standard' | 'chad' | 'bigboi' | 'noodle' | 'kid' | 'dad' | 'lady' | 'elder' | 'baby'   (locked body forms)
//         | 'toddler' | 'teen' | 'teengirl' | 'brute' | 'ghost'   (v2 forms; ghost has no legs)
//   coat: '#hex',                         main clothing colour (body fill, soft light-left gradient is automatic)
//   face: 'standard' | memeName | ['female'|'baby'|'elder'|'meme'|'teen'|'villain'|'monster', name]      (locked faces; meme-level expressions)
//   hair: null | 'bob' | 'granny' | 'gramps' | 'curl'   (optional hair layer from memes2; or draw your own in hat/headBack)
//   head: 'rick' | 'potato' | 'bun' | 'egg' | object   (head shape; forms already set a default)
//   hat(H)        -> svg[]  HEAD SPACE: centre H.cx,H.hy, radius 100 (the rig scales it x1.5, strokes are auto-thinned). Drawn over face.
//   headBack(H)   -> svg[]  HEAD SPACE, drawn BEHIND the head (long hair, hood back, headdress feathers)
//   faceTop(H)    -> svg[]  HEAD SPACE, drawn over the face but under the hat (beards, moustaches, glasses, face paint)
//   details(B)    -> svg[]  BODY: clipped to the torso. B = { cx, top, bot, w (half width at middle), defs, grad(col,x0,x1) }
//   behind(B)     -> svg[]  full frame, behind legs + body (capes, wings, quivers, tails)
//   backOver(B)   -> svg[]  full frame, BACK VIEW ONLY, over the body (tail from the middle of the back)
//   props(B)      -> svg[]  full frame, in front of body, behind head (held items, belts that stick out)
//   over(B)       -> svg[]  full frame, in front of EVERYTHING (raised sword, torch flame in front of the face)
//   longCloth     'gown' | 'tabard' | 'robe' | 'plain'  or { style, length: 'knee'|'midshin'|'ankle'|0..1, col, hem, hemW, folds, flare, pattern }   long outfit UNDER/BEHIND the body (long_cloth.mjs, LOCKED 2026-11-12)
//   arms(B)       -> { front: [{d, hand:[x,y]}...] }   override the hanging arms; B.arm(side, hx, hy, bow) makes one from the shoulder
// }
// Frame: ground y = 1010. B.hy / B.K / B.R = head centre, head scale, head radius on screen (100*K). B.shL/B.shR shoulders, B.hdL/B.hdR default hands.
// STYLE RULES: ink #2a1a1f outlines (6-8 head space, 4-6 body), flat colours with ONE light-left gradient, white skin, ALL limbs = ink sticks.
// Every character needs ONE giant silhouette signature (hat / hair / prop) readable as a black shape at 1/8 size.
import { INK, drawCharacter, smooth, brush, shade, tint } from './char2d.mjs';
import { MEMES, memeDefs, P, L, ell, f1, star4, star5, heart, drop } from './memes.mjs';
import { FEMALE, BABY, ELDER, hairFor, memes2Defs } from './memes2.mjs';
import { FORMS, formChar, sizeChar } from './bodies.mjs';
import { TEEN, VILLAIN, MONSTER, memes3Defs } from './memes3.mjs';
import { longCloth } from './long_cloth.mjs';
import { dress as dressOutfit } from './outfit_lib.mjs'; import './outfits_100.mjs'; import './outfits_200.mjs'; import './outfits_300.mjs'; import './outfits_400.mjs'; import './outfits_500.mjs';   // 500 outfit library (CB 2026-11-12 16:33: "apply to all profjects")
export { INK, smooth, brush, shade, tint, P, L, ell, f1, star4, star5, heart, drop };

export const GOLD = '#e2b13c', GOLDL = '#ffe08a', SILVER = '#c9ccd6', BRONZE = '#c98a3c', WOOD = '#9b6b3e', WOODD = '#6e4527', STEEL = '#aeb4c2', RED = '#d8473c', CREAM = '#f3efe6', BLACK = '#24222c';
// filled shape with ink outline; closed smooth curve through points
export const fillPts = (pts, col, sw = 5) => P(smooth(pts), col, INK, sw);
export const poly = (pts, col, sw = 5) => P('M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L') + ' Z', col, INK, sw);
export const rect = (x, y, w, h, col, sw = 5, rx = 4) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${col}" stroke="${INK}" stroke-width="${sw}"/>`;
export const circ = (x, y, r, col, sw = 5) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" stroke="${INK}" stroke-width="${sw}"/>`;
export const hl = (d, w = 6, op = .45) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;   // highlight streak (lit left side)
// stick held in a hand: wood/metal pole with ink edge
export const pole = (x0, y0, x1, y1, col = WOOD, w = 12) => `<path d="M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="M${f1(x0)},${f1(y0)} L${f1(x1)},${f1(y1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
export const fist = (x, y, r = 15) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${INK}"/>`;

const FACE = (f) => {
  if (!f || f === 'standard') return null;
  if (typeof f === 'string') return MEMES[f];
  const [set, n] = f; return { meme: MEMES, female: FEMALE, baby: BABY, elder: ELDER, teen: TEEN, villain: VILLAIN, monster: MONSTER }[set][n];
};

export function buildChar(spec, x) {
  const F = FORMS[spec.form || 'standard'];
  let S = { ...formChar(spec.form || 'standard', x), coat: spec.coat || F.S.coat };
  if (spec.size) S = sizeChar(S, spec.size);   // THREE body sizes (bodies.mjs SIZES, CB 2026-11-12): thin, standard, fat; body longer and head bigger with each size. Old look: oldThin, oldStandard, oldFat, oldExtremeFat
  if (spec.head) S.head = spec.head;
  if (spec.faceShadow === false) S.faceShadow = false;   // CB 2026-11-15: a sheet's faceShadow: false reaches char2d (was dropped here, so the grey face shadow stayed)
  const K = S.headK ?? 1.5, top = S.bodyTop ?? 333, bot = S.bodyBot ?? 640, hy = top - 100 * K * .78;
  const def = S.arms({ cx: x, view: 'front', dir: 1 }).front, parse = a => a.d.match(/M([-\d.]+),([-\d.]+)/).slice(1).map(Number);
  const B = { cx: x, top, bot, hy, K, R: 100 * K, ground: 1010, shL: parse(def[0]), shR: parse(def[1]), hdL: def[0].hand, hdR: def[1].hand, form: spec.form || 'standard' };
  B.arm = (side, hx, hy2, bow = 20) => { const [sx, sy] = side < 0 ? B.shL : B.shR; return { d: `M${sx},${sy} Q${(sx + hx) / 2 + side * bow},${(sy + hy2) / 2} ${hx},${hy2}`, hand: [hx, hy2] }; };
  const fn = FACE(spec.face), hairKey = spec.hair, shape = S.head;
  const H = { cx: x, hy, R: 100 };
  // meme hook: face + optional hair + headBack + faceTop, all in head space
  S.meme = (cx, hy2, v = {}) => {
    const M = fn ? fn(cx, hy2) : { over: [], under: [] }, h = hairKey ? hairFor(hairKey, cx, hy2, shape) : { back: [], front: [] }, Hh = { cx, hy: hy2, R: 100, ...v };
    return { ...M, under: [...(spec.headBack ? spec.headBack(Hh) : []), ...(M.under || []), ...h.back], over: [...h.front, ...M.over, ...(spec.faceTop ? spec.faceTop(Hh) : [])] };
  };
  S.extraDefs = memes3Defs();
  if (!fn) {   // standard face: keep the rig's own faceKit; hair/headBack/faceTop go through hairBack/faceExtras
    delete S.meme; S.face = { expr: 'standard' };
    S.slideExtras = true;                                    // cast parts are drawn round cx: the rig slides them with the face (rig-native characters place their own parts with fx)
    S.hairBack = ({ cx, hy: h2, view, dir, turn }) => [...(spec.headBack ? spec.headBack({ cx, hy: h2, R: 100, view, dir, turn }) : []), ...(hairKey ? hairFor(hairKey, cx, h2, shape).back : [])];
    S.faceExtras = ({ cx, hy: h2, view, dir, turn }) => [...(hairKey ? hairFor(hairKey, cx, h2, shape).front : []), ...(spec.faceTop ? spec.faceTop({ cx, hy: h2, R: 100, view, dir, turn }) : [])];
  }
  if (spec.hat) S.hat = ({ cx, hy: h2, view, dir, turn }) => spec.hat({ cx, hy: h2, R: 100, view, dir, turn });
  S.memeDy = 0;
  const bodyB = ctx => ({ ...B, view: ctx.view, dir: ctx.dir, turn: ctx.turn, defs: ctx.defs, grad: (c, x0 = x - 150, x1 = x + 150) => ctx.clothGrad(ctx.defs, c, x0, x1) });
  { const base = S.details; S.details = ctx => [...(spec.keepFormDetails && base ? base(ctx) : []), ...(spec.details ? spec.details(bodyB(ctx)) : [])]; }
  if (spec.behind) S.behind = ctx => spec.behind(bodyB(ctx));
  if (spec.backOver) S.backOver = ctx => spec.backOver(bodyB(ctx));   // back view only: drawn OVER the body (a tail growing from the middle of the back)
  if (spec.props) S.props = ctx => spec.props(bodyB(ctx)); else if (spec.cane === false) delete S.props;
  if (spec.over) S.over = ctx => spec.over(bodyB(ctx));
  if (spec.arms) S.arms = () => spec.arms(B);
  if (spec.longCloth) { const L = spec.longCloth; S.skirt = typeof L === 'string' ? longCloth(L, 'midshin', S) : longCloth(L.style || 'plain', L.length || 'midshin', S, L); }   // CB 2026-11-12 lock: long cloth hangs behind the kept body form
  // OUTFIT LIBRARY HOOK (CB 2026-11-12 16:33 "apply to all profjects"): ONE call for every film. Any of these on a cast spec dresses the character from outfit_lib:
  //   outfit: 'samurai'                          library colours        |  outfit: 'samurai', outfitPal: { a, b, c }   own colours
  //   outfit: ['samurai', { a, b, c }]           same, as a pair        |  outfit: { key: 'samurai', pal: { a, b, c } }
  //   dress: S => { ... }                        last word for a film: runs after the outfit (own recipes, small changes on S)
  // The outfit replaces spec.details / longCloth for the body; hair, hats, face gear, props and body size stay as given.
  if (spec.outfit) { const o = spec.outfit, pair = Array.isArray(o), obj = !pair && typeof o === 'object'; dressOutfit(S, pair ? o[0] : obj ? o.key : o, (pair ? o[1] : obj ? o.pal : spec.outfitPal) || {}); }
  if (spec.dress) spec.dress(S);
  // SIDE VIEW SHOWS BOTH ARMS (CB 2026-11-13 02:31) for the standing side view, OPT-IN per cast spec (moonrakers 2026-11-13): sideFarArm: true (or a number = how far
  // the far fist sits behind the body's back edge, as a share of the side half width). The far arm hangs from a shoulder a little behind and above the near one,
  // drawn BEHIND the body (arms.back), so only the fist and a bit of forearm show past the back. Off by default so the approved goldens and casts already in
  // animation do not change; making it the default is CB's call (check_views would then show the far arm on the 5 golden side views).
  if (spec.sideFarArm && S.arms) { const a0 = S.arms, share = typeof spec.sideFarArm === 'number' ? spec.sideFarArm : .8;
    S.arms = c => { const r = a0(c); if (c.view !== 'side' || r.back) return r; const n = [].concat(r.front || [])[0]; if (!n) return r;
      // CB 2026-11-15 (Moonrakers era preview: "the back arm looks bent backwards, I can see round at the back"; Rick's side views never show the far fist
      // past the back): the far fist peeks out at the body's FRONT edge, a little above the near hand. It was c.cx - d * half (past the back).
      const m = n.d.match(/M([-\d.]+),([-\d.]+)/), d = c.dir || 1, half = (S.wBot ?? 104) * share, sx = +m[1] - d * 16, sy = +m[2] - 8, hx = c.cx + d * half, hy = n.hand[1] - 14;
      return { ...r, back: { d: `M${sx},${sy} Q${(sx + hx) / 2 - d * 10},${(sy + hy) / 2} ${hx},${hy - 6}`, hand: [hx, hy] } }; }; }
  return S;
}
export const renderChar = (spec, x) => drawCharacter(buildChar(spec, x));
// bumpy cloud shape (beards, fur, wigs, smoke): circles stroked then filled on top = one clean outline
export const cloud = (cs, col = '#f3f1f6', sw = 4.6) => cs.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}" stroke="${INK}" stroke-width="${sw}"/>`).join('') + cs.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r - sw / 2 + .2)}" fill="${col}"/>`).join('');
// stack of horizontal bands inside a polygon outline (striped cloth): pts = outline, cols = colours top->bottom
export const bands = (x0, x1, y0, y1, cols) => cols.map((c, i) => `<rect x="${f1(x0)}" y="${f1(y0 + (y1 - y0) * i / cols.length)}" width="${f1(x1 - x0)}" height="${f1((y1 - y0) / cols.length + .5)}" fill="${c}"/>`).join('');
