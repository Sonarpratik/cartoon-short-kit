// PUPPET ADAPTER: film state -> one SVG card, using the character package exactly as it is (never edited from here).
// The package is injected (initPuppets) so its folder is one config value: film.json "puppet_pkg" or --puppets.
// A new character = a new export in the package's cast.mjs, or a body form; nothing changes in this file.
import { applyPose } from './poses.mjs';
export const CARD = { W: 800, H: 1500, CX: 400, GY: 1440 };      // card canvas in rig pixels; GY = the ground line (feet), kept explicit so cards stand on the floor
let M = null;
export function initPuppets(mods) { M = mods; }                  // { char2d, memes, memes2, memes3?, bodies, cast, castkit?, castIndex?, grips? (grips.mjs: hands closed round held things, 2026-11-12) }

// which face set and hair a body form uses. The forms carry hair INSIDE their default meme, so the adapter has to
// re-attach it for every other face (rig hook wanted: forms export hair separately).
const FORM_SET = { lady: ['FEMALE', 'bob', 'egg'], elder: ['ELDER', 'gramps', 'potato'], baby: ['BABY', 'curl', 'BABY_HEAD'] };
const DROP_PROPS = { stationmaster: true };                      // its props() bakes an arm holding the watch; poses redraw arm + watch
const warned = new Set(); const warn = m => { if (!warned.has(m)) { warned.add(m); console.warn('puppets.mjs: ' + m); } };

function baseS(entry, view, dir) {
  const p = entry.puppet || 'form:standard'; let S, form = null;
  let spec = null;
  if (p.startsWith('cast:') && M.castkit && M.castIndex && M.castIndex[p.slice(5)]) { spec = M.castIndex[p.slice(5)]; S = M.castkit.buildChar({ ...spec, face: 'standard' }, CARD.CX); }   // hat, hair, costume and props from the sheet; the face is set per frame in svgFor
  else if (p.startsWith('form:') && M.bodies.FORMS[p.slice(5)]) { form = p.slice(5); S = M.bodies.formChar(form, CARD.CX, view, dir); }
  else if (M.cast && typeof M.cast[p] === 'function') S = M.cast[p](CARD.CX, view, dir, 'standard');
  else { warn('unknown puppet "' + p + '", using form:standard'); S = M.bodies.formChar('standard', CARD.CX, view, dir); }
  S = { ...S, x: CARD.CX, view, dir }; S.dy = CARD.GY - (S.ground ?? 900);       // feet always on the card's ground line
  // NO SHADOW ON FACES (CB 2026-11-15, lightning spear final v1): char2d draws a grey face shadow unless S.faceShadow === false. castkit.buildChar used to drop
  // spec.faceShadow, so a sheet's switch never reached the drawing. Off when film.json "face_shadow": false (whole cast), the cast entry's "face_shadow": false,
  // or the sheet spec's faceShadow: false. Default (none of these) = unchanged, the template's own face shadow stays.
  if (M.faceShadow === false || entry.face_shadow === false || (spec && spec.faceShadow === false)) S.faceShadow = false;
  return { S, form, name: p, spec };
}
function faceFn(setName, face) {
  const more = M.memes3 ? [M.memes3.TEEN, M.memes3.VILLAIN, M.memes3.MONSTER] : [];
  const order = setName ? [M.memes2[setName], M.memes.MEMES, M.memes2.FEMALE, M.memes2.ELDER, M.memes2.BABY, ...more] : [M.memes.MEMES, M.memes2.FEMALE, M.memes2.ELDER, M.memes2.BABY, ...more];
  for (const set of order) if (set && set[face]) return set[face];
  return null;
}
export const stateKey = (who, st) => [who, st.view, st.dir, st.pose, st.face, st.mouth, st.blink, st.prop, st.hand, st.tw ? st.tw.pose + '>' + st.tw.prop + '>' + st.tw.hand + '>' + st.u : '', st.idle || '', st.mt ?? '', st.fw ? (st.fw.face || '') + '>' + st.fu : '', st.lie_art || '', st.tgt ? st.tgt.join(',') : '', st.pop || ''].join('|') + (st.h3 || st.hat ? '|h3:' + (st.h3 || '') + ':' + (st.hat ? ['R', 'L'].map(k => st.hat[k] ? st.hat[k].join(',') : '').join(';') : '') : '');   // fireworks kit_patch: hand target + head pop; kit 2026-11-13: a 3D held prop on this card (h3) and prop-driven fists (hat) are their own drawings, no h3 = the same key as before

// character height in rig pixels (ground to top of the bare head), so a card can be sized in metres
const customCard = entry => { const p = entry.puppet || ''; const sp = p.startsWith('cast:') && M.castIndex && M.castIndex[p.slice(5)]; return sp && sp.card ? sp : null; };   // kit_patch (character-artist 2026-11-13): a cast spec with its own card drawer (the cat: a new body form, spec.card = { svg(st, CARD), metrics })
export function metrics(entry) {
  { const cc = customCard(entry); if (cc) return { ...cc.card.metrics, hy: cc.card.metrics.hy }; }
  const { S } = baseS(entry, 'front', 1), K = S.headK ?? 1.5, bodyTop = S.bodyTop ?? 333, hy = bodyTop - 100 * K * .78;
  const top = Math.min(...M.char2d.headPts(CARD.CX, hy, 100, S.head || 'rick').map(p => hy + (p[1] - hy) * K));
  return { px: (S.ground ?? 900) - top, headPx: 200 * K, hy: hy + S.dy };
}

// A cast character (castkit spec). Its sheet gives the hat, hair, beard, costume and held things; the film gives the face, mouth, blink and pose.
// "standard" (or no face) = the character's own face from its sheet. With pose "stand" it keeps its own arms, so a sword or a staff stays in the hand it was drawn in.
const SETS = () => ({ meme: M.memes.MEMES, female: M.memes2.FEMALE, baby: M.memes2.BABY, elder: M.memes2.ELDER, teen: M.memes3 && M.memes3.TEEN, villain: M.memes3 && M.memes3.VILLAIN, monster: M.memes3 && M.memes3.MONSTER });
// KIT FACES (2026-11-10, CB: one standard face that changes smoothly with the narration): "k:angry", "k:smirk", ... are the rig's own
// calm face family (char2d FACES). Their brows are numbers, so a change is in-betweened; eyes and mouth swap at the half-way frame.
function kitFace(st) {
  const F = { ...M.char2d.FACES, ...(M.epFaces || {}) }, n = st.face && st.face.startsWith('k:') ? st.face.slice(2) : null; if (!n || !F[n]) return null;   // kit_patch: film.json faces_ep = episode faces made of kit parts
  const b = F[n], a = st.fw && st.fw.face && st.fw.face.startsWith('k:') ? F[st.fw.face.slice(2)] : st.fw && (!st.fw.face || st.fw.face === 'standard') ? F.standard : null, u = st.fu ?? 1;
  if (!a || u >= 1) return M.epFaces && M.epFaces[n] ? { ...M.epFaces[n] } : { expr: n };
  const L = (x, y) => x + (y - x) * u, src = u < .5 ? a : b, srcN = u < .5 ? (st.fw.face && st.fw.face.startsWith('k:') ? st.fw.face.slice(2) : 'standard') : n;
  return { expr: srcN, brows: b.brows.map((e, i) => e.map((v, j) => L(a.brows[i][j], v))), lidTilt: L(a.lidTilt || 0, b.lidTilt || 0) };
}
// 3/4 (CB 2026-11-10 03:22): head, hair and body stay exactly as in the front view; only eyes, brows and mouth shift. The rig slides the whole
// drawn-face layer, so hair that lives in that layer is wrapped in the inverse of that slide and stays where the front view has it.
const unslide = (parts, cx, view, dir) => { if (view !== '34' || !parts.length) return parts; const t = M.char2d.VIEWS['34'] * dir, k = 1 - .22 * Math.abs(t), sl = t * 100 * .42;
  return [`<g transform="translate(${cx},0) scale(${(1 / k).toFixed(4)},1) translate(${-cx},0) translate(${(-sl).toFixed(1)},0)">${parts.join('')}</g>`]; };
// TURNED HAIR (CB 2026-11-10: "the hair needs to cover the side view ... in 3/4 the head stays front, only the eyes point to the side"):
// in the SIDE view the hair is redrawn round the BACK of the head (it does not slide with the face). 3/4 keeps the front head (CB 03:22).
// soft shaded hair colour (CB 2026-11-11: turned and back hair need the graded hair colour): lighter crown, mid, darker ends; smooth, not banded
let HGID = 0;
const softHair = (c0, col, y0, y1) => { if (!c0.defs) return col; const C = M.char2d, id = 'hs' + (HGID++);
  c0.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="${C.tint(col, .28)}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${C.shade(col, .62)}"/></linearGradient>`); return `url(#${id})`; };
function turnedHair(key, shape, view, dir) {
  return (c0) => { const { cx, hy } = c0, C = M.char2d, h = M.memes2.hairFor(key, cx, hy, shape), all = h.back.join('') + h.front.join(''), col = (all.match(/fill="(#[0-9a-fA-F]{6})"/) || [])[1], side = view === 'side';
    const hf = () => col;   // CB 2026-11-11: same hair colour as front and 3/4 (flat colour + light highlight strokes + dark lines), not a gradient
    const LITE = '#b07a4f', DARK = '#4f2c1a', TIE = '#e8668a';   // CB 2026-11-11: turned hair keeps the shaded hair colour (light / mid / dark bands), like the front
    if (!col) return h.front;
    if (key !== 'bob') return [...h.front.join('').matchAll(/<circle cx="([-\d.]+)"[^>]*\/>/g)].filter(m => (parseFloat(m[1]) - cx) * dir < (side ? 10 : 60)).map(m => m[0]);   // tufts: only the ones on the back half
    const X = u => cx + dir * u, a0 = -46, a1 = 124;   // CB 2026-11-10 03:29: the women's side hair = the shape first drawn for 3/4 (more face, hair round the back)
    const HP = C.headPts(cx, hy, 100, typeof shape === 'string' ? shape : 'egg', dir < 0).map(([x, y]) => [cx + (x - cx) * 1.06, hy + (y - hy) * 1.06]);
    const A = ([x, y]) => { const a = Math.atan2(y - hy, (x - cx) * dir) * 180 / Math.PI; return a <= 0 ? a : a - 360; };       // 0 = the way the face looks, -90 = top, -180 = back of the head
    const rim = HP.map(p => [A(p), p]).filter(([a]) => a <= a0 && a >= a1 - 360).sort((p, q) => q[0] - p[0]).map(([, p]) => p);
    const line = [[X(-58), hy + 52], [X(-50), hy + 6], [X(-34), hy - 40], [X(-2), hy - 66], [X(40), hy - 70]];
    const bun = `<ellipse cx="${X(-26)}" cy="${hy - 124}" rx="34" ry="32" fill="${hf(hy - 156, hy - 92)}" stroke="${C.INK}" stroke-width="5"/>`;
    const shine = [C.brush(X(-62), hy - 40, X(-50), hy - 84, X(-10), hy - 92, 7, { col: LITE, tip: .25 }), C.brush(X(-30), hy - 128, X(-22), hy - 144, X(-6), hy - 138, 6, { col: LITE, tip: .3 }),
      `<path d="M${X(-40)},${hy - 128} q${dir * 12},-14 ${dir * 28},-2" fill="none" stroke="${DARK}" stroke-width="3.4" stroke-linecap="round"/>`,
      `<ellipse cx="${X(-26)}" cy="${hy - 94}" rx="18" ry="7" fill="${TIE}" stroke="${C.INK}" stroke-width="3"/>`].join('');
    const strands = [0, 1, 2].map(i => `<path d="M${X(-30 - i * 22)},${hy - 78 + i * 16} q${-dir * (10 + i * 4)},40 ${-dir * (2 - i * 4)},${86 - i * 14}" fill="none" stroke="${DARK}" stroke-width="3.4" stroke-linecap="round"/>`);
    return [bun, `<path d="${C.smooth([...rim, ...line])}" fill="${hf(hy - 110, hy + 60)}" stroke="${C.INK}" stroke-width="5" stroke-linejoin="round"/>`, shine, ...strands]; };
}
// BACK VIEW (2026-11-10, CB: full silhouette from front, 3/4, side or back): from behind the head is covered by its hair, never bald,
// and face parts (beards, moustaches) go UNDER the head so only the ends that stick out past it show.
function backHair(key, shape) {
  return (c0) => { const { cx, hy } = c0, h = M.memes2.hairFor(key, cx, hy, shape), col = ((h.back.join('') + h.front.join('')).match(/fill="(#[0-9a-fA-F]{6})"/) || [])[1];
    if (key !== 'bob' || !col) return h.front;                  // side tufts and a baby curl read the same from behind
    const C = M.char2d, HP = C.headPts(cx, hy, 100, typeof shape === 'string' ? shape : 'egg').map(([x, y]) => [cx + (x - cx) * 1.05, Math.min(hy + (y - hy) * 1.05, hy + 58 + 9 * Math.cos((x - cx) / 16))]);
    const strands = [-44, -14, 18, 46].map((dx, i) => `<path d="M${cx + dx},${hy - 70 + (i % 2) * 14} q${6 - i * 3},48 ${-4 + i * 2},${96 - (i % 2) * 10}" fill="none" stroke="#4f2c1a" stroke-width="3.4" stroke-linecap="round"/>`);
    const hf = col, LITE = '#b07a4f', TIE = '#e8668a';   // CB 2026-11-11: same colour, highlights, lines and pink tie as the front
    const extra = [C.brush(cx - 70, hy - 50, cx - 50, hy - 92, cx - 6, hy - 100, 7, { col: LITE, tip: .25 }), C.brush(cx + 14, hy - 98, cx + 46, hy - 96, cx + 70, hy - 62, 6, { col: LITE, tip: .25 }),
      `<ellipse cx="${cx + 6}" cy="${hy - 104}" rx="19" ry="7" fill="${TIE}" stroke="${C.INK}" stroke-width="3"/>`];
    return [`<path d="${C.smooth(HP)}" fill="${hf}" stroke="${C.INK}" stroke-width="5" stroke-linejoin="round"/>`, ...strands, ...extra]; };
}

// ---- MOTION LIBRARY BRIDGE (2026-11-11). A pose "m:<id>[@offset | @=frozen time][+props]" plays a move from templates/motion_styles on ANY puppet (cast or form):
// <id> = a library id (hammer/A, sleep/B, walk/A ...) or "<module>[#export]/<style>". The move gives view, body lean, planted bending legs, hands and head tilt;
// the film keeps the face (CB: faces change on the word). The move's own drawn props (post, chair, hammer) are left out unless "+props": the film's props are 3D.
// Same drawing rules as motion_styles/rig.mjs drawPose, but on the film's character and in card pixels.
const MG = 1010, CENTRE = /^(walk|run|crawl|sneak|carry|push|bike|dragged|queue)\b/;
const rotP = (p, deg, c) => { const r = deg * Math.PI / 180, s = Math.sin(r), k = Math.cos(r), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * k - dy * s, c[1] + dx * s + dy * k]; };
const chNums = new Map();
function chOf(entry) {
  const k = entry.puppet || 'form:standard'; if (chNums.has(k)) return chNums.get(k);
  const { S } = baseS(entry, 'front', 1), bodyTop = S.bodyTop ?? 333, bodyBot = S.bodyBot ?? 640, ground = S.ground ?? 900, K = S.headK ?? 1.5, hipY = bodyBot - 30, legL = Math.hypot(23, (ground - 7) - hipY);
  const fr = S.arms({ cx: CARD.CX, view: 'front', dir: 1, turn: 0 }).front, a = fr[fr.length - 1], m = /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(a.d), sh = [Math.abs(+m[1] - CARD.CX), +m[2]], armL = (a.len0 ?? Math.hypot(a.hand[0] - +m[1], a.hand[1] - +m[2])) * 1.24;   /* len0: cast-size arms are drawn long now (bodies.mjs castArms); film length unchanged */   // CB 2026-11-15 (gold mine clip): arms a little LONGER, a hanging hand almost at the body's bottom edge (was x1.06)
  const ch = { form: 'cast', bodyTop, bodyBot, ground, K, hipY, legL, sh, armL, handX: Math.abs(a.hand[0] - CARD.CX), hy: bodyTop - 100 * K * .78, hipW: S.hipW ?? 13 }; chNums.set(k, ch); return ch;
}
function moveOf(entry, st) {
  if (!M.motion || !/^m:/.test(st.pose || '')) return null;
  const m = /^m:([^@+]+)(?:@(=?)([-\d.]+))?(\+props)?/.exec(st.pose), id = m[1], e = M.motion.LIB.find(x => x.id === id), k = id.lastIndexOf('/');
  const [mn, ex = 'default'] = (e ? e.module : id.slice(0, k)).split('#'), style = e ? e.style : id.slice(k + 1), mod = M.motion.mods[mn]; if (!mod) { warn('move "' + id + '" not loaded'); return null; }
  const frontal = st.view === 'front' || st.view === '34';
  let v = mod[ex]; if (frontal) v = (ex === 'default' ? mod.front || (M.motion.mods[mn + '_front'] || {}).default : mod[ex.replace(/Side$/, '') + 'Front']) || v;
  const sty = v && v.styles && v.styles.find(s => s.key === style); if (!sty) { warn('move "' + id + '" has no style ' + style); return null; }
  const ch0 = chOf(entry), t = m[2] ? +m[3] : (st.mt || 0) + (m[3] ? +m[3] : 0), flipT = (st.dir || 1) === -1, ch = st.tgt ? { ...ch0, tgt: flipT ? [-st.tgt[0], st.tgt[1]] : st.tgt } : ch0; let P = sty.pose(t, ch);   /* kit_patch: ch.tgt = film.json hand_at, projected on the card (mirrored when the card is) */ const lag = M.motion.cloth && !m[2] ? M.motion.cloth.clothLag(u => sty.pose(u, ch), t, ch) : [0, 0]; /* LIVE CLOTH 2026-11-12: follow-through of long cloth and capes (a frozen pose has none) */ const extra = P.poses ? P : null; if (P.poses) P = P.poses[0];
  const view = P.view || 'side'; if (st.tgt && flipT && (view === 'front' || view === 'back')) { P = sty.pose(t, { ...ch0, tgt: st.tgt }); if (P.poses) P = P.poses[0]; }
  return { P, ch, lag, dark: !!st.dark, lit: !!st.lit, pop: st.pop || 0, centre: CENTRE.test(e ? e.action : mn), props: !!m[4], back: (extra || P).back, front: (extra || P).front, mirror: (st.dir || 1) === -1 && view !== 'front' && view !== 'back' };
}
function moveArms(P, ch, xo) {
  const view = P.view || 'side', dir = P.dir || 1, side = view === 'side', x = (P.x || 0) - xo, y = P.y || 0, rot = P.rot || 0, piv = P.pivot ? [P.pivot[0] - xo, P.pivot[1]] : [x, ch.hipY + y];
  const toLocal = w => { const q = rotP([w[0] - xo, w[1]], -rot, piv); return [q[0] - x, q[1] - y]; }, toW = p => rotP([p[0] + x, p[1] + y], rot, piv);
  const shg = Array.isArray(P.shrug) ? P.shrug : [P.shrug || 0, P.shrug || 0], shY = [ch.sh[1] - shg[0], ch.sh[1] - shg[1]];   /* animator fix 6: P.shrug = shoulders hunched up (card units, one or per hand), e.g. fists on the ears */
  const near34 = view === '34' ? (dir === 1 ? 0 : 1) : -1;   // CB 2026-11-15: 3/4 facing right = the screen-RIGHT arm goes behind the body and the screen-LEFT (near) arm hangs from the MIDDLE of the body; facing left mirrored
  const shL = side ? [[dir * 8, shY[0] + 35], [dir * 8, shY[1] + 35]]   /* CB 2026-11-15 era preview: side shoulder lower, clear of the head */ : [[-ch.sh[0], shY[0]], [ch.sh[0], shY[1]]];
  const W34 = (ch.handX ?? 120) - 14;   /* body half width */
  if (near34 >= 0) shL[near34] = [-dir * ch.sh[0], shY[near34] + 35];   // CB 2026-11-15: "a little bit more down, not too close to the head"
  const restH = side ? [[dir * 16, ch.bodyBot - 22], [dir * 16, ch.bodyBot - 22]] : [[-110, ch.bodyBot - 22], [110, ch.bodyBot - 22]]; if (near34 >= 0) { restH[near34] = [-dir * .85 * W34, ch.bodyBot - 22]; restH[1 - near34] = [dir * (W34 + 14), ch.bodyBot - 22]; }   /* CB 2026-11-15: arms on the side, not the middle */ const f = v => (+v + 0).toFixed(1), cx = CARD.CX;
  const H = (P.hands || [null, null]).map((h, i) => {
    const sh = shL[i], s = side ? dir : (i ? 1 : -1), L = ch.armL; let hand = restH[i];
    if (h && h.wx != null) hand = toLocal([h.wx, h.wy]); else if (h && h.lx != null) hand = [h.lx, h.ly]; else if (h) hand = [sh[0] + s * h.f * L, sh[1] + h.d * L];
    const bias = h && h.bias ? h.bias : side ? [-dir * .8, .6] : [s, .6], bow = h && h.bow != null ? h.bow : .5;
    let dx = hand[0] - sh[0], dy = hand[1] - sh[1]; const d = Math.hypot(dx, dy) || 1; if (d > L) { hand = [sh[0] + dx * L / d, sh[1] + dy * L / d]; }
    const dd = Math.min(d, L), off = Math.max(.10 * L, Math.sqrt(Math.max(0, (L / 2) ** 2 - (dd / 2) ** 2)) * 1.25) * bow * 2;
    let nx = -dy / d, ny = dx / d; if (nx * bias[0] + ny * bias[1] < 0) { nx = -nx; ny = -ny; }
    return { d: `M${f(sh[0] + cx)},${f(sh[1])} Q${f(sh[0] + (hand[0] - sh[0]) / 2 + nx * off + cx)},${f(sh[1] + (hand[1] - sh[1]) / 2 + ny * off)} ${f(hand[0] + cx)},${f(hand[1])}`, hand: [+f(hand[0] + cx), +f(hand[1])], world: toW(hand), over: !!(h && h.over), behind: !!(h && h.behind), sh: [sh[0] + cx, sh[1]] };
  });
  if (P.arms) { H.length = 0; P.arms.forEach(a => { const s0 = toLocal(a.s), c0 = toLocal(a.c), h0 = toLocal(a.h);   // CB 2026-11-15: editor arms (shoulder, curve control, hand; world)
    H.push({ d: `M${f(s0[0] + cx)},${f(s0[1])} Q${f(c0[0] + cx)},${f(c0[1])} ${f(h0[0] + cx)},${f(h0[1])}`, hand: [+f(h0[0] + cx), +f(h0[1])], world: toW(h0), over: a.over ?? !a.behind, behind: !!a.behind }); }); }
  return { H, x, y, rot, piv, toW, side, dir, view };
}
// hands of a move in CARD pixels (after lean and mirror) + the angle the move holds its tool at: the film's 3D held prop follows these (ep_kit "hand")
export function moveHands(entry, st) {
  const mv = moveOf(entry, st); if (!mv) return null; const xo = mv.centre ? (mv.P.x || 0) : 0, A = moveArms(mv.P, mv.ch, xo), oy = CARD.GY - MG;
  const hs = (mv.P.held || [])[0], am = hs ? /rotate\(([-\d.]+)\)/.exec(hs.svg(0, 0)) : null;
  const obj = mv.props ? (mv.P.held || []).find(x => x.obj) : null;   // kit_patch: a held 3D object (film.json held3d): which hand, lid, flame
  return { hands: A.H.map(h => [mv.mirror ? CARD.CX - h.world[0] : CARD.CX + h.world[0], h.world[1] + oy]), ang: am ? +am[1] * (mv.mirror ? -1 : 1) : 0, mirror: mv.mirror, held_hand: hs ? hs.hand : 1, obj: obj ? { obj: obj.obj, hand: obj.hand, lid: obj.lid ?? 0, fl: obj.fl ?? 0 } : null, view: A.view, handR: 15 };   // kit 2026-11-13: + view, fist radius (data only)
}
// kit 2026-11-13 HELD 3D, generic (props-hero): both fists of a PLAIN pose in CARD px, exactly where svgFor draws them (same applyPose, then the pose's lean and drop),
// with their shoulders, the far-hand flags (that fist is behind the body), the side a held thing points to and the fist radius. null for moves (use moveHands) and own-drawer cast.
export function poseHands(entry, st) {
  if (customCard(entry) || /^m:/.test(st.pose || '')) return null;
  const view = st.view || 'front', dir = st.dir || 1, { S, name } = baseS(entry, view, dir), K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78;
  const pose = applyPose(S, { ...st, view, dir }, { INK: M.char2d.INK, headK: K, hy, dropProps: !!DROP_PROPS[name], grip: M.grips && M.grips.grip }); if (!pose.hands) return null;
  const tf = q => { const a = [q[0], q[1] + (S.dy || 0)], b = pose.rot ? rotP(a, pose.rot, [CARD.CX, CARD.GY]) : a; return [b[0], b[1] + (pose.dy || 0)]; };
  return { hands: { R: tf(pose.hands.R), L: tf(pose.hands.L) }, sh: { R: tf(pose.sh.R), L: tf(pose.sh.L) }, far: pose.far, gdir: pose.gdir, handR: pose.handR, view, dir };
}
function moveDraw(S, mv) {
  const C = M.char2d, { P, ch } = mv, xo = mv.centre ? (P.x || 0) : 0, A = moveArms(P, ch, xo), { H, x, y, rot, piv, toW, side, dir, view } = A, cx = CARD.CX, oy = CARD.GY - MG, f = v => (+v + 0).toFixed(1);
  S.view = view; S.dir = dir; S.noLegs = true; S.legPose = null; S.dy = oy; S.headTilt = P.head || 0; if (mv.pop) S.headK = (S.headK ?? 1.5) * (1 + mv.pop);   // kit_patch: HEAD WOBBLE, a quick head-size pop on a face change (CB_RULES s5)
  const armW = S.armW ?? (S.legW ?? 17) + 2, handR = (S.handR ?? 15) + 11, armSvg = a => `<path d="${a.d}" fill="none" stroke="${C.INK}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${handR}" fill="${C.INK}"/>`;
  const heldSvg = mv.props ? (P.held || []).map(h => h.obj && (M.held3d || []).includes(h.obj) ? { ...h, svg: () => '' } : h).map(h => ({ over: H[h.hand].over, s: M.grips && M.grips.heldSvg ? M.grips.heldSvg(h, H, S.handR ?? 15, C.INK) : h.svg(H[h.hand].hand[0], H[h.hand].hand[1]) })) : [];   // grips.mjs: held.wrap / held.grip close the fist round the tool
  // CB 2026-11-15 (references/rick_pose_traces): the limb AWAY from the lens = index farIdx (side 0; 3/4 the screen side behind the facing). The far arm goes
  // BEHIND the body in side and 3/4 (P.farArmFront keeps it in front); hand.behind / P.arms behind still choose it by hand (animator fix 7).
  const farIdx = side ? 0 : view === '34' ? (dir === 1 ? 1 : 0) : -1, overs = H.filter(a => a.over && !a.behind), ownProps = S.props;
  const behindArms = H.some(a => a.behind) ? H.filter(a => a.behind) : farIdx >= 0 && H[farIdx] && !H[farIdx].over && !P.farArmFront ? [H[farIdx]] : [];
  const frontArms = H.filter(a => !behindArms.includes(a)), extraBack = behindArms.slice(1);   /* animator fix 7: hand.behind = the arm goes BEHIND body + head (its held fist still draws over), e.g. a fist on the far side of a big head */   /* animator fix 7: hand.behind = the arm goes BEHIND body + head (its held fist still draws over), e.g. a fist on the far side of a big head */
  S.arms = () => ({ back: behindArms[0], front: frontArms.filter(a => !a.over) });
  S.over = () => [...overs.map(armSvg), ...heldSvg.filter(h => h.over).map(h => h.s)];
  S.props = () => heldSvg.filter(h => !h.over).map(h => h.s);
  const HIPW = (S.hipW ?? 13) * 2.4, spreadD = HIPW - (S.hipW ?? 13);   // CB 2026-11-15 (Rick, gold mine): front / 3/4 / back hips 2.4x wider, feet out by the same amount
  const hipLocal = side ? [[-12 * dir, ch.hipY], [10 * dir, ch.hipY]] : [[-HIPW, ch.hipY], [HIPW, ch.hipY]], hips = hipLocal.map(toW);
  // CB 2026-11-15: "when he looks to the right side, the left leg is the one at the front, the right leg behind the body": side = feet[0] (the rear hip) is the NEAR leg,
  // feet[1] the far one; 3/4 facing right = the screen-left leg near (mirrored facing left). Arms keep farIdx.
  const legFarIdx = side ? 1 : view === '34' ? (dir === 1 ? 1 : 0) : -1;
  const LEG = P.legW ?? S.legW ?? 17, legs = [], legsF = [], legsW = [], FAR = '#544656';   // FAR: the far leg one tone lighter when lit (Rick: near ~7 %, far ~19 % lightness)
  (P.feet || []).forEach((ft, i) => {
    const hp = hips[i]; let Aa = [ft.x - xo + (side ? 0 : (i ? 1 : -1) * spreadD), MG - 7 - (ft.lift || 0)], dx = Aa[0] - hp[0], dy = Aa[1] - hp[1], d = Math.hypot(dx, dy) || 1; const L = ch.legL * (ft.len || 1);
    if (d > L) { Aa = [hp[0] + dx * L / d, hp[1] + dy * L / d]; dx = Aa[0] - hp[0]; dy = Aa[1] - hp[1]; d = L; }
    const sd = side ? dir : (i ? 1 : -1), kd = side ? dir * (ft.knee || 1) : sd * (ft.knee || 1);
    let nx = -dy / d, ny = dx / d; if (nx * kd < 0) { nx = -nx; ny = -ny; }
    const off = Math.max(7, Math.sqrt(Math.max(0, (L / 2) ** 2 - (d / 2) ** 2)) * (ft.kneeK ?? 1)); let K = ft.kneeAt ? [ft.kneeAt[0] - xo, ft.kneeAt[1]] : [(hp[0] + Aa[0]) / 2 + nx * off, (hp[1] + Aa[1]) / 2 + ny * off];   // ft.kneeAt: exact knee (world)
    if (ft.thigh != null) { const a = ft.thigh * Math.PI / 180, kd2 = side ? dir : sd, K2 = [hp[0] + kd2 * L / 2 * Math.cos(a), hp[1] + L / 2 * Math.sin(a)], vx = Aa[0] - K2[0], vy = Aa[1] - K2[1], vl = Math.hypot(vx, vy) || 1, A2 = [K2[0] + vx / vl * L / 2, K2[1] + vy / vl * L / 2], mx = ft.mix ?? 1, L2 = (p, q) => p + (q - p) * mx;
      K = [L2(K[0], K2[0]), L2(K[1], K2[1])]; Aa = [L2(Aa[0], A2[0]), L2(Aa[1], A2[1])]; }
    const fdir = side ? dir : view === '34' ? (sd === dir ? dir : sd * .6) : sd, fl = side ? 44 : view === '34' && sd === dir ? 40 : 28, ta = (ft.toe ?? (side ? 0 : -25)) * Math.PI / 180, toe = [Aa[0] + fdir * fl * Math.cos(ta), Aa[1] - fl * Math.sin(ta)];
    const pts = ft.pts ? ft.pts.map(q => [q[0] - xo, q[1]]) : null;   // ft.pts: the whole leg as exact world points (CB's editor legs)
    legsW.push(pts ? { H: pts[0], K: pts[1] || pts[0], A: pts[2] || pts[pts.length - 1] } : { H: hp, K, A: Aa });
    const line = pts ? (ft.curve ? C.smooth(pts.slice(0, 3), false, .55) + pts.slice(3).map(q => ` L${f(q[0])},${f(q[1])}`).join('') : 'M' + pts.map(q => `${f(q[0])},${f(q[1])}`).join(' L')) : C.smooth([hp, K, Aa], false, .55) + ` L${f(toe[0])},${f(toe[1])}`, join = pts && !ft.curve ? 'round' : 'miter';
    // CB 2026-11-15: side and 3/4 = the NEAR leg OVER the body, the FAR leg behind it, lighter when lit, ink when dark (P.dark or film.json act "dark")
    const far = ft.far ?? i === legFarIdx, overBody = !S.skirt && (ft.over || (legFarIdx >= 0 && !far && !P.legsBehind && !ft.behind)), col = legFarIdx < 0 || ft.ink ? C.INK : far && (P.lit || mv.lit) && !(P.dark || mv.dark) ? FAR : C.INK;   // CB 2026-11-15: lighter far leg ONLY with a light source (move P.lit or film.json act "lit": true)
    (overBody ? legsF : legs).push(`<path d="${line}" fill="none" stroke="${col}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="${join}" stroke-miterlimit="4"/>`);
  });
  // LIVE CLOTH (2026-11-12): long cloth and capes follow the move's legs, gravity and follow-through (motion_styles/cloth_live.mjs + char2d S.legsLive)
  if (M.motion.cloth) { const toLocal = w => { const q = rotP(w, -rot, piv); return [q[0] - x, q[1] - y]; }; legsW.legL = ch.legL; M.motion.cloth.applyLive(S, legsW, toLocal, rot, MG, mv.lag || [0, 0], cx); }
  const r = C.drawCharacter(S), body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '');
  const W2C = `translate(${cx},${oy})`, shiftX = xo ? `translate(${-xo},0)` : '';
  const inner = `${mv.props && mv.back ? `<g transform="${W2C} ${shiftX}">${mv.back}</g>` : ''}<g transform="${W2C}">${legs.join('')}</g><g transform="rotate(${f(rot)},${f(piv[0] + cx)},${f(piv[1] + oy)}) translate(${f(x)},${f(y)})">${extraBack.length ? `<g transform="translate(0,${f(oy)})">${extraBack.map(armSvg).join('')}</g>` : ''}${body}${P.arms && view === 'back' ? `<g transform="translate(0,${f(oy)})">${H.filter(a => a.over && !a.behind).map(armSvg).join('')}</g>` : ''}</g><g transform="${W2C}">${legsF.join('')}</g>${mv.props && mv.front ? `<g transform="${W2C} ${shiftX}">${mv.front}</g>` : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.W}" height="${CARD.H}" viewBox="0 0 ${CARD.W} ${CARD.H}"><defs>${r.defs}</defs>${mv.mirror ? `<g transform="translate(${2 * cx},0) scale(-1,1)">${inner}</g>` : inner}</svg>`;
}
function castSvg(entry, st, S, spec, name) {
  const own = spec.face, ownSet = Array.isArray(own) ? own[0] : null, woman = ownSet === 'female' || spec.hair === 'bob' || spec.form === 'lady', B = M.memes2.BLINKS;
  const ownFn = !own || own === 'standard' ? null : typeof own === 'string' ? M.memes.MEMES[own] : (SETS()[own[0]] || {})[own[1]];
  let fn = null;
  if (st.mouth && M.memes2.VISEMES[st.mouth]) fn = M.memes2.VISEMES[st.mouth];
  else if (st.blink && (!st.face || st.face === 'standard') && !ownFn) fn = B[woman ? (st.blink === 'half' ? 'womanHalf' : 'womanClosed') : st.blink];
  else if (kitFace(st)) { fn = null; S.face = kitFace(st); if (st.blink) S.face = { ...S.face, eyes: 'closed' };   // CB 2026-11-11: calm faces blink when nothing happens
    if (S.meme) { const shape = S.head, V = c => ({ cx: c.cx, hy: c.hy, R: 100, view: c.view, dir: c.dir, turn: c.turn }); delete S.meme; S.slideExtras = true;       /* a sheet with its own drawn face: the calm kit face replaces it, hair, beard and hat stay */
      const tv = spec.hair && st.view === 'side', th = tv ? turnedHair(spec.hair, shape, st.view, st.dir || 1) : null;
      S.hairBack = c => [...(spec.headBack ? spec.headBack(V(c)) : []), ...(spec.hair && !tv ? M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).back : [])];
      S.faceExtras = c => [...(tv ? th(c) : spec.hair ? unslide(M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).front, c.cx, st.view, st.dir || 1) : []), ...(spec.faceTop ? spec.faceTop(V(c)) : [])]; } }
  else if (st.face && st.face !== 'standard') { fn = (ownSet && SETS()[ownSet] && SETS()[ownSet][st.face]) || faceFn(null, st.face); if (!fn) { warn('unknown face "' + st.face + '" for ' + name + ', using its own face'); fn = ownFn; } }
  else fn = ownFn;
  if (st.view === 'back') fn = null;                           // from behind there is no face: keep the sheet's own back-of-head layers (hair, mane, hat)
  if (fn) {                                                     // same layering as castkit.buildChar: headBack, face, hair, faceTop (the hat is its own layer)
    delete S.face; delete S.hairBack; delete S.faceExtras; const shape = S.head;
    const tv = spec.hair && st.view === 'side'; if (tv) S.faceExtras = turnedHair(spec.hair, shape, st.view, st.dir || 1);
    S.meme = (cx, hy, v = {}) => { const m = fn(cx, hy), h = spec.hair && !tv ? M.memes2.hairFor(spec.hair, cx, hy, shape) : { back: [], front: [] }, H = { cx, hy, R: 100, ...v }; return { ...m, under: [...(spec.headBack ? spec.headBack(H) : []), ...(m.under || []), ...h.back], over: [...unslide(h.front, cx, st.view, st.dir || 1), ...(m.over || []), ...(spec.faceTop ? spec.faceTop(H) : [])] }; };
  }
  if (st.view === 'back' && !spec.views) {                     // a sheet that is not view-aware: hair covers the head, face parts sit under it
    const shape = S.head, hb = S.hairBack, V = c => ({ cx: c.cx, hy: c.hy, R: 100, view: 'back', dir: c.dir, turn: 0 });
    delete S.meme; S.face = { expr: 'standard' };
    S.hairBack = c => [...(spec.faceTop ? spec.faceTop(V(c)) : []), ...(spec.headBack ? spec.headBack(V(c)) : []), ...(spec.hair ? M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).back : [])];
    S.faceExtras = spec.hair ? backHair(spec.hair, shape) : () => [];
    S.details = S.behind || (() => []);                       // chest details are hidden; what hangs on the back (cape, pack) is also drawn across the body
  }
  if (!spec.views && S.hat && st.view === 'side') { const h0 = S.hat, dx = -(st.dir || 1) * 16; S.hat = c => [`<g transform="translate(${dx},0)">${h0(c).join('')}</g>`]; }   // a hat that is not view-aware sits a little back on a turned head
  if (st._mv) return moveDraw(S, st._mv);
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78, ownArms = S.arms, ownProps = S.props, pose0 = !st.pose || st.pose === 'stand' || st.pose === 'own';
  const pose = applyPose(S, st, { INK: M.char2d.INK, headK: K, hy, dropProps: false, grip: M.grips && M.grips.grip });
  if (pose0 && !st.prop) { S.arms = ownArms; S.props = ownProps; }
  const r = M.char2d.drawCharacter(S), body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '');
  const over = pose.over.length && !(pose0 && !st.prop) ? `<g transform="translate(0,${S.dy})">${pose.over.join('')}</g>` : '';
  const tf = pose.rot || pose.dy ? ` transform="translate(0,${pose.dy}) rotate(${pose.rot},${CARD.CX},${CARD.GY})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.W}" height="${CARD.H}" viewBox="0 0 ${CARD.W} ${CARD.H}"><defs>${r.defs}</defs><g${tf}>${pose.under && pose.under.length ? `<g transform="translate(0,${S.dy || 0})">${pose.under.join('')}</g>` : ''}${body}${over}</g></svg>`;
}

export function svgFor(entry, st) {
  { const cc = customCard(entry); if (cc) return cc.card.svg(st, CARD); }
  { const mv = moveOf(entry, st); if (mv) st = { ...st, view: mv.P.view || 'side', dir: mv.P.dir || 1, tw: undefined, _mv: mv }; }
  const view = st.view || 'front', dir = st.dir || 1, { S, form, name, spec } = baseS(entry, view, dir), B = M.memes2.BLINKS, set = form && FORM_SET[form];
  if (spec) return castSvg(entry, st, S, spec, name);
  const woman = set && set[0] === 'FEMALE';
  let fn = null;
  if (st.mouth && M.memes2.VISEMES[st.mouth]) fn = M.memes2.VISEMES[st.mouth];                     // talking: the mouth shape replaces the face
  else if (st.blink && (!st.face || st.face === 'standard')) fn = B[woman ? (st.blink === 'half' ? 'womanHalf' : 'womanClosed') : st.blink];
  else if (kitFace(st) && !set) { fn = null; S.face = kitFace(st); }
  else if (st.face && st.face !== 'standard') { fn = faceFn(set && set[0], st.face); if (!fn) warn('unknown face "' + st.face + '" for ' + name + ', using standard'); }
  // (a blink on a meme face keeps the meme face: 4 frames, and the rig has no lids for those faces yet)
  if (!fn && set) fn = B[woman ? 'womanOpen' : 'open'];                                            // standard face on a form that needs its hair re-attached
  const turnedV = view === 'side';   // CB 2026-11-10 03:29: 3/4 = head, hair and body exactly as the front view for everyone (women too); only eyes, brows and mouth shift. Hair turns in the side view only.
  if (fn && set) { const f0 = fn, shape = set[2] === 'BABY_HEAD' ? M.memes2.BABY_HEAD : set[2]; fn = (cx, hy) => { const m = f0(cx, hy), h = M.memes2.hairFor(set[1], cx, hy, shape); return turnedV ? { ...m, under: [...(m.under || [])], over: [...m.over] } : { ...m, under: [...(m.under || []), ...h.back], over: [...unslide(h.front, cx, view, dir), ...m.over] }; };
    if (turnedV) S.faceExtras = turnedHair(set[1], shape, view, dir); }
  if (fn) S.meme = fn; else { delete S.meme; if (!S.face) S.face = { expr: 'standard' }; }
  if (view === 'back' && set) { const shape = set[2] === 'BABY_HEAD' ? M.memes2.BABY_HEAD : set[2]; delete S.meme; S.face = { expr: 'standard' }; S.hairBack = q => M.memes2.hairFor(set[1], q.cx, q.hy, shape).back; S.faceExtras = backHair(set[1], shape); }
  S.extraDefs = M.memes2.memes2Defs();
  if (st._mv) return moveDraw(S, st._mv);
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78;
  const pose = applyPose(S, st, { INK: M.char2d.INK, headK: K, hy, dropProps: !!DROP_PROPS[name], grip: M.grips && M.grips.grip });
  const r = M.char2d.drawCharacter(S);
  const body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '');                             // the rig's flat floor shadow: the 3D scene casts a real one
  const over = pose.over.length ? `<g transform="translate(0,${S.dy})">${pose.over.join('')}</g>` : '';
  const tf = pose.rot || pose.dy ? ` transform="translate(0,${pose.dy}) rotate(${pose.rot},${CARD.CX},${CARD.GY})"` : '';   // lean and bob about the feet
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.W}" height="${CARD.H}" viewBox="0 0 ${CARD.W} ${CARD.H}"><defs>${r.defs}</defs><g${tf}>${pose.under && pose.under.length ? `<g transform="translate(0,${S.dy || 0})">${pose.under.join('')}</g>` : ''}${body}${over}</g></svg>`;
}
