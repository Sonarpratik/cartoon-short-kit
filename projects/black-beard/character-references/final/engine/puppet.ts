// Character Studio renderer for the Ricks Clips vector puppets (150 characters, sheets 01-15) and their motion
// library (195 move styles in 61 actions: sit, kneel, lie, dig, sweep, carry, ladder, crawl, fall ...).
// The puppet and motion code is NOT in this repo: preview-characters.mjs serves it read-only from
// newZip/RicksClips_Skill_V1.1/templates (personal-use licence; override with RC_TEMPLATES).
// Studio contract: drawCharacter(context, design, pose) in a 600x1000 design space, feet near y=975.
//  - action 'idle': the still puppet in one of its four views (yaw snapped to front, 3/4, side, back), alive:
//    blink, breathing, a little sway, a mouth flap for 'talk', and a squash pop + blink when the expression changes.
//  - action '<move>/<style>' (e.g. 'sit/A', 'kneel/B'): that library style, looping on the studio clock, drawn with the
//    motion rig, with the move's own props. The frame is fitted to everything the move draws over its whole length
//    (the library's 900-wide window cut lying, crawling, falling and pushing moves).
//  - expression: 'own' keeps the character's signature face (and in a move, the move's own acting face); any other
//    value is one of the Ricks Clips face presets (FACES in char2d: smug, laugh, angry, scared, think ...).
// The SVG decodes asynchronously; until a new frame is ready the last decoded frame of the same move is shown.
const RC = '/vendor/rc';
import { buildChar } from '/vendor/rc/vector2d_characters/code/castkit.mjs';
import { drawCharacter as drawSvg, FACES, EXT } from '/vendor/rc/vector2d_characters/code/char2d.mjs';
import { makeChar, drawPose } from '/vendor/rc/motion_styles/rig_cast.mjs';
import { LIB } from '/vendor/rc/motion_styles/library.mjs';
import { cycle, reachDrop, lerp, blinkAt } from '/vendor/rc/motion_styles/rig.mjs';
import { MEMES } from '/vendor/rc/vector2d_characters/code/memes.mjs';
import { FEMALE, BABY, ELDER } from '/vendor/rc/vector2d_characters/code/memes2.mjs';
import { TEEN, VILLAIN, MONSTER } from '/vendor/rc/vector2d_characters/code/memes3.mjs';
import { HAIR_STYLES } from '/vendor/rc/vector2d_characters/code/hair_lib.mjs';
import { wear, HATS2, PIECES2 } from '/vendor/rc/vector2d_characters/code/head_wear.mjs';
import { withGear, HELMETS } from '/vendor/rc/vector2d_characters/code/head_gear.mjs';
import { withFace, BEARDS, STACHES, ACCESSORIES as FACE_ACC } from '/vendor/rc/vector2d_characters/code/face_gear.mjs';
import { OUTFITS } from '/vendor/rc/vector2d_characters/code/outfit_lib.mjs';
import { FORMS, prof } from '/vendor/rc/vector2d_characters/code/bodies.mjs';
// Pot belly (2026-11-23, Black Beard): the dad bod with a much rounder, wider gut. bodyPts sets the silhouette directly
// (half-widths at 8 heights; belly = extra bulge forward in profile); wTop / wBot place the arms clear of the gut.
FORMS.potbelly = { label: 'pot belly', S: { ...FORMS.dad.S, details: undefined, bodyTop: 300, bodyBot: 690, hipW: 46, stance: 30, wTop: 70, wBot: 128,
  bodyPts: prof([0, 62, 118, 190, 246, 262, 236, 130], { belly: [0, 4, 30, 86, 136, 148, 104, 14], sk: .74 }) } };
import { INK, headPts, smooth } from '/vendor/rc/vector2d_characters/code/char2d.mjs';
import { angleDesign } from './angle-designs.js';   // OUR hair and hat shapes per view (templates/bridge/angle-designs.ts)
import * as S01 from '/vendor/rc/vector2d_characters/code/sheets/sheet01.mjs';
import * as S02 from '/vendor/rc/vector2d_characters/code/sheets/sheet02.mjs';
import * as S03 from '/vendor/rc/vector2d_characters/code/sheets/sheet03.mjs';
import * as S04 from '/vendor/rc/vector2d_characters/code/sheets/sheet04.mjs';
import * as S05 from '/vendor/rc/vector2d_characters/code/sheets/sheet05.mjs';
import * as S06 from '/vendor/rc/vector2d_characters/code/sheets/sheet06.mjs';
import * as S07 from '/vendor/rc/vector2d_characters/code/sheets/sheet07.mjs';
import * as S08 from '/vendor/rc/vector2d_characters/code/sheets/sheet08.mjs';
import * as S09 from '/vendor/rc/vector2d_characters/code/sheets/sheet09.mjs';
import * as S10 from '/vendor/rc/vector2d_characters/code/sheets/sheet10.mjs';
import * as S11 from '/vendor/rc/vector2d_characters/code/sheets/sheet11.mjs';
import * as S12 from '/vendor/rc/vector2d_characters/code/sheets/sheet12.mjs';
import * as S13 from '/vendor/rc/vector2d_characters/code/sheets/sheet13.mjs';
import * as S14 from '/vendor/rc/vector2d_characters/code/sheets/sheet14.mjs';
import * as S15 from '/vendor/rc/vector2d_characters/code/sheets/sheet15.mjs';
import * as M_act_bigfall from '/vendor/rc/motion_styles/moves/act_bigfall.mjs';
import * as M_act_bike from '/vendor/rc/motion_styles/moves/act_bike.mjs';
import * as M_act_bin from '/vendor/rc/motion_styles/moves/act_bin.mjs';
import * as M_act_button from '/vendor/rc/motion_styles/moves/act_button.mjs';
import * as M_act_carry from '/vendor/rc/motion_styles/moves/act_carry.mjs';
import * as M_act_cheer from '/vendor/rc/motion_styles/moves/act_cheer.mjs';
import * as M_act_desk from '/vendor/rc/motion_styles/moves/act_desk.mjs';
import * as M_act_drink from '/vendor/rc/motion_styles/moves/act_drink.mjs';
import * as M_act_eat from '/vendor/rc/motion_styles/moves/act_eat.mjs';
import * as M_act_fight from '/vendor/rc/motion_styles/moves/act_fight.mjs';
import * as M_act_hammer from '/vendor/rc/motion_styles/moves/act_hammer.mjs';
import * as M_act_inspect from '/vendor/rc/motion_styles/moves/act_inspect.mjs';
import * as M_act_ladder from '/vendor/rc/motion_styles/moves/act_ladder.mjs';
import * as M_act_lean from '/vendor/rc/motion_styles/moves/act_lean.mjs';
import * as M_act_lie from '/vendor/rc/motion_styles/moves/act_lie.mjs';
import * as M_act_misc from '/vendor/rc/motion_styles/moves/act_misc.mjs';
import * as M_act_peek from '/vendor/rc/motion_styles/moves/act_peek.mjs';
import * as M_act_phone from '/vendor/rc/motion_styles/moves/act_phone.mjs';
import * as M_act_push from '/vendor/rc/motion_styles/moves/act_push.mjs';
import * as M_act_ride from '/vendor/rc/motion_styles/moves/act_ride.mjs';
import * as M_act_sleep from '/vendor/rc/motion_styles/moves/act_sleep.mjs';
import * as M_act_sneak from '/vendor/rc/motion_styles/moves/act_sneak.mjs';
import * as M_act_tool from '/vendor/rc/motion_styles/moves/act_tool.mjs';
import * as M_act_tools2 from '/vendor/rc/motion_styles/moves/act_tools2.mjs';
import * as M_act_write from '/vendor/rc/motion_styles/moves/act_write.mjs';
import * as M_crawl from '/vendor/rc/motion_styles/moves/crawl.mjs';
import * as M_emo_angry from '/vendor/rc/motion_styles/moves/emo_angry.mjs';
import * as M_emo_happy from '/vendor/rc/motion_styles/moves/emo_happy.mjs';
import * as M_emo_helpers from '/vendor/rc/motion_styles/moves/emo_helpers.mjs';
import * as M_emo_sad from '/vendor/rc/motion_styles/moves/emo_sad.mjs';
import * as M_emo_scared from '/vendor/rc/motion_styles/moves/emo_scared.mjs';
import * as M_emo_think from '/vendor/rc/motion_styles/moves/emo_think.mjs';
import * as M_emo_wait from '/vendor/rc/motion_styles/moves/emo_wait.mjs';
import * as M_fall from '/vendor/rc/motion_styles/moves/fall.mjs';
import * as M_front_helpers from '/vendor/rc/motion_styles/moves/front_helpers.mjs';
import * as M_gest_a from '/vendor/rc/motion_styles/moves/gest_a.mjs';
import * as M_gest_b from '/vendor/rc/motion_styles/moves/gest_b.mjs';
import * as M_gest_helpers from '/vendor/rc/motion_styles/moves/gest_helpers.mjs';
import * as M_idle from '/vendor/rc/motion_styles/moves/idle.mjs';
import * as M_jump from '/vendor/rc/motion_styles/moves/jump.mjs';
import * as M_kneel from '/vendor/rc/motion_styles/moves/kneel.mjs';
import * as M_run from '/vendor/rc/motion_styles/moves/run.mjs';
import * as M_run_front from '/vendor/rc/motion_styles/moves/run_front.mjs';
import * as M_sit from '/vendor/rc/motion_styles/moves/sit.mjs';
import * as M_sit_front from '/vendor/rc/motion_styles/moves/sit_front.mjs';
import * as M_turn from '/vendor/rc/motion_styles/moves/turn.mjs';
import * as M_walk from '/vendor/rc/motion_styles/moves/walk.mjs';
import * as M_walk_front from '/vendor/rc/motion_styles/moves/walk_front.mjs';

// Static imports (not computed ones), so a Vite project resolves them through its /vendor/rc alias exactly like the Studio.
const SHEETS: any[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15];
const MOVE_FILES: Record<string, any> = { act_bigfall: M_act_bigfall, act_bike: M_act_bike, act_bin: M_act_bin, act_button: M_act_button, act_carry: M_act_carry, act_cheer: M_act_cheer, act_desk: M_act_desk, act_drink: M_act_drink, act_eat: M_act_eat, act_fight: M_act_fight, act_hammer: M_act_hammer, act_inspect: M_act_inspect, act_ladder: M_act_ladder, act_lean: M_act_lean, act_lie: M_act_lie, act_misc: M_act_misc, act_peek: M_act_peek, act_phone: M_act_phone, act_push: M_act_push, act_ride: M_act_ride, act_sleep: M_act_sleep, act_sneak: M_act_sneak, act_tool: M_act_tool, act_tools2: M_act_tools2, act_write: M_act_write, crawl: M_crawl, emo_angry: M_emo_angry, emo_happy: M_emo_happy, emo_helpers: M_emo_helpers, emo_sad: M_emo_sad, emo_scared: M_emo_scared, emo_think: M_emo_think, emo_wait: M_emo_wait, fall: M_fall, front_helpers: M_front_helpers, gest_a: M_gest_a, gest_b: M_gest_b, gest_helpers: M_gest_helpers, idle: M_idle, jump: M_jump, kneel: M_kneel, run: M_run, run_front: M_run_front, sit: M_sit, sit_front: M_sit_front, turn: M_turn, walk: M_walk, walk_front: M_walk_front };
export const VIEWS = Array.from({ length: 12 }, (_, i) => i * 30);
// ---------- our own moves on the RC motion rig (the library's walks are all stylised: bouncy, swagger, waddle) ----------
// A plain, natural walk: heel-to-toe step, small bob, gentle counter arm swing, no acting face (the chosen expression shows).
// view: the view the walk is SEEN in. side / 3/4 = a travelling stride (the camera follows); front / back = walking
// towards / away from the camera: the feet step on the spot under the hips (the shot moves the card), lifting in turn,
// the body bobs and sways over the planted foot, the arms swing towards and away from the camera.
function plainWalk(T: number, S: number, lift: number, swing: number) {
  return (t: number, ch: any, view = 'side') => {
    const dir = 1;
    if (view === 'front' || view === 'back') {
      const p = (t / (2 * T)) % 1, a = 2 * Math.PI * p, l = Math.max(0, Math.sin(a)), r = Math.max(0, -Math.sin(a)), spread = 34;
      const feet = [{ x: -spread, lift: lift * .75 * l, toe: 0 }, { x: spread, lift: lift * .75 * r, toe: 0 }];
      const sw = Math.sin(a), toward = view === 'front' ? 1 : -1;   // the arm opposite the lifted foot swings forward
      const P: any = { view, dir, x: 0, rot: 2.2 * sw, feet, head: -1.2 * sw,
        // f = out from the shoulder, d = down, in arm lengths: the forward-swinging hand rises a little and comes in
        hands: [{ f: .3 - .06 * toward * sw, d: .9 - .1 * toward * sw, bow: .4 }, { f: .3 + .06 * toward * sw, d: .9 + .1 * toward * sw, bow: .4 }] };
      P.y = 0; const need = reachDrop(ch, P); P.y = Math.max(need, 12 - 10 * Math.abs(Math.sin(a)));
      return { ...P, cam: 0, blink: blinkAt(t) };
    }
    const c = cycle(t, { T, S: view === '34' ? S * .8 : S, duty: .6, dir, swing: (u: number) => ({ lift: lift * Math.sin(Math.PI * u), toe: lerp(-14, 18, u) }) });
    const s2 = Math.cos(2 * Math.PI * c.stride);
    const P: any = { view, dir, x: c.bx, rot: 2 * dir, feet: c.feet, head: 1.5 * Math.sin(2 * Math.PI * c.p - 1),
      hands: [{ f: swing * s2, d: .9 - .06 * Math.max(0, s2), bow: .55 }, { f: -swing * s2, d: .9 - .06 * Math.max(0, -s2), bow: .55 }] };
    P.y = 0; const need = reachDrop(ch, P); P.y = Math.max(need, 14 - 12 * Math.sin(Math.PI * c.p) ** 2);
    return { ...P, cam: c.bx + 40, blink: blinkAt(t) };
  };
}
const OWN_MOVES: Record<string, { info: any; mv: any; st: any }> = {};
for (const [style, name, T, S, lift, swing] of [['normal', 'Normal walk', .5, 120, 40, .32], ['slow', 'Slow walk', .72, 95, 28, .2]] as const) {
  const id = 'walk/' + style;
  OWN_MOVES[id] = { info: { id, action: 'walk', feelings: ['neutral'], energy: style === 'slow' ? 1 : 2, views: ['side', 'front', '34', 'back'], module: 'own', style },
    mv: { dur: 6 }, st: { key: style, name, pose: plainWalk(T, S, lift, swing), viewPose: true } };
}
// Overhand throw (1.2 s, play once from time 0): wind-up 0-.45 s (throwing hand goes up behind the head), release at
// THROW_RELEASE (hand high and forward: spawn the thrown object there), follow-through down by 1.2 s.
export const THROW_RELEASE = .52;
const easeIO = (x: number) => x * x * (3 - 2 * x);
function throwOverhand(t: number, ch: any, view = 'side') {
  const up = t < .45 ? easeIO(t / .45) : t < .6 ? 1 : 1 - easeIO(Math.min(1, (t - .6) / .6));
  const fwd = t < .45 ? -easeIO(t / .45) * .35 : t < .6 ? -.35 + 1.25 * easeIO((t - .45) / .15) : .9 - .5 * easeIO(Math.min(1, (t - .6) / .6));
  const side = view === 'side' || view === '34', rest = { f: .3, d: .9, bow: .5 };
  const P: any = side
    ? { view, dir: 1, x: 0, rot: -6 * up + 8 * Math.max(0, fwd - .5), feet: [{ x: -26 }, { x: 22 }], head: -4 * up,
        hands: [{ f: -.15, d: .85, bow: .5 }, { f: fwd, d: .9 - 1.75 * up, bow: .3 }] }
    : { view, dir: 1, x: 0, rot: 4 * up, feet: [{ x: -36 }, { x: 34 }], head: -3 * up,
        hands: [rest, { f: .3 + .35 * up, d: .9 - 2.1 * up, bow: .25 }] };   // out to the side and well above the head, so it reads from behind
  P.y = reachDrop(ch, P); return { ...P, cam: 0 };
}
// Sit down on the ground (.9 s), then stay seated (hands resting on the ground, a slow breath); works from every
// side, and from behind it reads as someone sitting and watching (the sea, a sunset).
function sitGround(t: number, ch: any, view = 'back') {
  const k = easeIO(Math.min(1, t / .9)), drop = k * Math.max(0, ch.legL - 60);
  const side = view === 'side' || view === '34';
  const P: any = side
    ? { view, dir: 1, x: 0, rot: -4 * k, feet: [{ x: 40 + 90 * k, lift: 0 }, { x: 60 + 110 * k, lift: 0 }], head: 2 * Math.sin(t * .9),
        hands: [{ f: -.35 * k, d: .7, bow: .5 }, { f: -.2 * k, d: .7, bow: .5 }] }
    // front / back: the legs fold forward under the body, so the feet stay inside the body's outline (hidden from behind)
    : { view, dir: 1, x: 0, rot: 1.5 * Math.sin(t * .6), feet: [{ x: -44 + 26 * k }, { x: 42 - 26 * k }], head: 2.5 * Math.sin(t * .7),
        hands: [{ f: .55 + .2 * k, d: .82 - .12 * k, bow: .5 }, { f: .55 + .2 * k, d: .82 - .12 * k, bow: .5 }] };
  P.y = drop; return { ...P, cam: 0, blink: blinkAt(t) };
}
OWN_MOVES['throw/overhand'] = { info: { id: 'throw/overhand', action: 'throw', feelings: ['angry', 'determined'], energy: 3, views: ['side', 'front', '34', 'back'], module: 'own', style: 'overhand' },
  mv: { dur: 1.2 }, st: { key: 'overhand', name: 'Overhand throw', pose: throwOverhand, viewPose: true } };
OWN_MOVES['sit/ground'] = { info: { id: 'sit/ground', action: 'sit', feelings: ['calm', 'sad', 'tired'], energy: 1, views: ['back', 'side', 'front', '34'], module: 'own', style: 'ground' },
  mv: { dur: 3600 }, st: { key: 'ground', name: 'Sit on the ground', pose: sitGround, viewPose: true } };
/** 'idle', our plain walks, then every library style id, grouped by action (sit/A, sit/B, sit/C, kneel/A ...). */
export const ACTIONS = ['idle', ...Object.keys(OWN_MOVES), ...LIB.map((s: any) => s.id)];
// Blink and lip-flap variants of every preset, registered in this page's copy of FACES (the files are not changed).
const PRESETS = Object.keys(FACES).filter(k => !k.startsWith('_'));
for (const k of PRESETS) {
  FACES['_blink_' + k] = { ...FACES[k], eyes: 'closed' };
  FACES['_talk_' + k] = { ...FACES[k], mouth: 'talk' };
  FACES['_talkblink_' + k] = { ...FACES[k], eyes: 'closed', mouth: 'talk' };
}
/** 'own' = the character's own face, also during moves; 'move' = the move's own acting face (laughing in laugh/C ...);
 *  the rest are the Ricks Clips presets. 'neutral' is kept as an alias of 'own'. */
export const EXPRESSIONS = ['own', 'move', ...PRESETS];
/** Library entry for an action id: feelings it fits, energy 1-3, views it exists in. */
/** A move id may end in '!bare': the same move without the props it draws (the mug in the hand, the crate it sits on, its
 *  back / front prop layers), so a scene can use its own real 3D props instead. */
const bareOf = (id: string) => id.endsWith('!bare') ? id.slice(0, -5) : id;
export const moveInfo = (id: string) => { const b = bareOf(id); return OWN_MOVES[b]?.info ?? LIB.find((s: any) => s.id === b); };
const isOwn = (e?: string) => !e || e === 'own' || e === 'neutral' || e === 'move' || !FACES[e];

// ---------- FACE CATEGORIES x EMOTIONS ----------
// A face = a category (male, female, child, elder, villain, or a special signature look: star eyes, cyclops, skull,
// demon ...) + an emotion (any FACES preset). The category is a trait layer on the emotion: it can replace the OPEN eyes
// (an emotion that closes the eyes - laugh, happy, crying, blink - keeps its own closed eyes), add marks (lashes, fangs,
// stitches, wrinkles, a nose) and tint the skin. Everything is drawn inside the face layer, so it turns with the head.
const EXT_EYE = EXT.eye, EXT_FX = EXT.fx;
const pth = (d: string, fill: string, sw = 0, extra = '') => `<path d="${d}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"` : ''}${extra}/>`;
const elp = (x: number, y: number, rx: number, ry: number, fill: string, sw = 0) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}/>`;
const star = (x: number, y: number, r: number, fill: string, sw = 3) => pth('M' + Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; return f1(x + Math.cos(a) * q) + ',' + f1(y + Math.sin(a) * q); }).join(' L') + ' Z', fill, sw);
const heart = (x: number, y: number, r: number, fill: string, sw = 3) => pth(`M${f1(x)},${f1(y + r * .9)} C${f1(x - r * 1.4)},${f1(y - r * .1)} ${f1(x - r * .7)},${f1(y - r * 1.1)} ${f1(x)},${f1(y - r * .35)} C${f1(x + r * .7)},${f1(y - r * 1.1)} ${f1(x + r * 1.4)},${f1(y - r * .1)} ${f1(x)},${f1(y + r * .9)} Z`, fill, sw);
Object.assign(EXT_EYE, {
  none: () => [],
  star: ({ ex, ey, k }: any) => [star(ex, ey, 15 * k, '#f5c542', 3.4)],
  heart: ({ ex, ey, k }: any) => [heart(ex, ey, 13 * k, '#e8445a', 3.4)],
  money: ({ ex, ey, k }: any) => [elp(ex, ey, 13 * k, 15, '#ffffff', 4.2), `<path d="M${f1(ex + 5)},${f1(ey - 7)} Q${f1(ex - 7)},${f1(ey - 9)} ${f1(ex - 5)},${f1(ey - 2)} Q${f1(ex + 7)},${f1(ey + 2)} ${f1(ex + 5)},${f1(ey + 6)} Q${f1(ex - 5)},${f1(ey + 9)} ${f1(ex - 6)},${f1(ey + 5)} M${f1(ex)},${f1(ey - 12)} L${f1(ex)},${f1(ey + 12)}" fill="none" stroke="#2f9a4a" stroke-width="3.2" stroke-linecap="round"/>`],
  socket: ({ ex, ey, k, look }: any) => [elp(ex, ey, 14 * k, 16, '#1d1620'), elp(ex + look * .6, ey + 1, 3, 3.4, '#ffffff')],
  glow: ({ ex, ey, k, look }: any) => [elp(ex, ey, 12 * k, 13, '#f7d64a', 4.2), elp(ex + look * .6, ey, 2.4, 9, INK)],
  glowRed: ({ ex, ey, k, look }: any) => [elp(ex, ey, 12 * k, 13, '#e2443d', 4.2), elp(ex + look * .6, ey, 2.4, 9, INK)],
  hollow: ({ ex, ey, k }: any) => [elp(ex, ey + 2, 10 * k, 15, INK)],
  droopy: ({ ex, ey, k, look }: any) => [elp(ex + look * .6, ey + 2, 6.5 * k, 7, INK), `<path d="M${f1(ex - 12 * k)},${f1(ey - 2)} Q${f1(ex)},${f1(ey - 6)} ${f1(ex + 12 * k)},${f1(ey + 1)}" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>`],
  bolt: ({ ex, ey, k }: any) => [`<rect x="${f1(ex - 12 * k)}" y="${f1(ey - 9)}" width="${f1(24 * k)}" height="18" rx="4" fill="#9fe3ff" stroke="${INK}" stroke-width="4"/>`, elp(ex, ey, 4, 4, INK)],
});
/** the face layer is drawn scaled round the face centre: undo that for things placed on the whole head (tint) */
const unFace = (fx: number, ey: number, turn: number, inner: string) => { const side = Math.abs(turn) > .9, FK = side ? 1.2 : 1.3, fxs = side ? fx - Math.sign(turn) * 8 : fx, fcy = ey + 18;
  return `<g transform="translate(${f1(fxs)},${f1(fcy)}) scale(${(1 / FK).toFixed(4)}) translate(${f1(-fxs)},${f1(-fcy)})">${inner}</g>`; };
Object.assign(EXT_FX, {
  catTint: ({ cx, hy, fx, ey, turn, F }: any) => { if (!F.catTint || cx === undefined) return []; const id = 'ct' + (UID++), d = smooth(headPts(cx, hy, 100, F.catShape || 'rick', turn < 0));
    return [unFace(fx, ey, turn, `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" clip-path="url(#${id})" fill="${F.catTint}" style="mix-blend-mode:multiply"/>`)]; },
  lashes: ({ fx, ey, dx }: any) => [-1, 1].map(s => `<path d="M${f1(fx + s * (dx + 9))},${f1(ey - 6)} l${s * 9},-7 M${f1(fx + s * (dx + 6))},${f1(ey - 10)} l${s * 5},-9 M${f1(fx + s * (dx + 11))},${f1(ey - 1)} l${s * 10},-3" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`),
  lips: ({ fx, ey, turn }: any) => [elp(fx + turn * 7, ey + 47, 9, 4, '#e2647a')],
  cheeks: ({ fx, ey, dx }: any) => [-1, 1].map(s => elp(fx + s * (dx + 10), ey + 22, 12, 7, '#f6a8b8')),
  wrinkles: ({ fx, ey, dx }: any) => [`<path d="M${f1(fx - 20)},${f1(ey - 40)} q20,-6 40,0 M${f1(fx - 14)},${f1(ey - 33)} q14,-4 28,0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`,
    ...[-1, 1].map(s => `<path d="M${f1(fx + s * (dx - 9))},${f1(ey + 13)} q${s * 9},5 ${s * 18},0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>`)],
  bags: ({ fx, ey, dx }: any) => [-1, 1].map(s => `<path d="M${f1(fx + s * (dx - 10))},${f1(ey + 12)} q${s * 10},6 ${s * 20},0" fill="none" stroke="#5a3d6e" stroke-width="3" stroke-linecap="round" opacity=".75"/>`),
  cyclops: ({ fx, ey, F }: any) => { const closed = ['happy', 'happyXL', 'closed', 'squeeze', 'cry', 'shut'].includes(F.catEmoEye);
    return closed ? [`<path d="M${f1(fx - 22)},${f1(ey - 4)} Q${f1(fx)},${f1(ey + 10)} ${f1(fx + 22)},${f1(ey - 4)}" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/>`]
      : [elp(fx, ey - 4, 24, 26, '#ffffff', 5), elp(fx + (F.catLook || 0), ey - 2, 9, 10, INK), elp(fx - 3, ey - 7, 3, 3.4, '#ffffff')]; },
  fangs: ({ fx, ey, turn }: any) => { const mx = fx + turn * 7, my = ey + 43; return [-1, 1].map(s => pth(`M${f1(mx + s * 9)},${f1(my - 2)} L${f1(mx + s * 3)},${f1(my - 2)} L${f1(mx + s * 6)},${f1(my + 9)} Z`, '#ffffff', 2.4)); },
  skullNose: ({ fx, ey, turn }: any) => [heart(fx + turn * 6, ey + 26, 6, '#1d1620', 0).replace('<path', `<path transform="rotate(180 ${f1(fx + turn * 6)} ${f1(ey + 26)})"`)],
  stitches: ({ fx, ey, dx }: any) => [`<path d="M${f1(fx - dx - 14)},${f1(ey + 18)} L${f1(fx - dx + 16)},${f1(ey + 34)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`, ...[0, 1, 2, 3].map(i => { const x = fx - dx - 10 + i * 8, y = ey + 20 + i * 4.3; return `<path d="M${f1(x - 2)},${f1(y - 6)} l4,12" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`; })],
  clownNose: ({ fx, ey, turn }: any) => [elp(fx + turn * 9, ey + 24, 10, 10, '#e3342f', 3.4), elp(fx + turn * 9 - 3, ey + 21, 3, 2.4, '#ffffff')],
  fur: ({ fx, ey, dx }: any) => [-1, 1].map(s => pth(`M${f1(fx + s * (dx + 24))},${f1(ey + 2)} l${s * 14},8 l${s * -4},6 l${s * 12},8 l${s * -6},4 l${s * 8},10 L${f1(fx + s * (dx + 14))},${f1(ey + 40)} Z`, '#8a6a4e', 2.6)),
  antenna: ({ fx, ey }: any) => [`<path d="M${f1(fx)},${f1(ey - 70)} l0,-22" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`, elp(fx, ey - 96, 6, 6, '#e3342f', 3)],
});
type Cat = { label: string; group: string; eyes?: string | [string, string]; fx?: string[]; tint?: string; brow?: number; look?: number };
/** Face categories. group: the dropdown sub-heading. eyes replace the emotion's OPEN eyes; fx are added marks; tint = skin. */
export const FACE_CATS: Record<string, Cat> = {
  male: { label: 'Male', group: 'People' },
  female: { label: 'Female', group: 'People', fx: ['lashes', 'lips'] },
  child: { label: 'Child', group: 'People', eyes: 'bigOval', fx: ['cheeks'], brow: .75 },
  elder: { label: 'Elder', group: 'People', fx: ['wrinkles'] },
  villain: { label: 'Villain', group: 'People', fx: ['bags'], brow: 1.2 },
  stars: { label: 'Star eyes', group: 'Special eyes', eyes: 'star' },
  hearts: { label: 'Heart eyes', group: 'Special eyes', eyes: 'heart' },
  money: { label: 'Money eyes', group: 'Special eyes', eyes: 'money' },
  cool: { label: 'Cool (shades)', group: 'Special eyes', eyes: 'none', fx: ['shadesFx'] },
  cyclops: { label: 'Cyclops', group: 'Creatures', eyes: 'none', fx: ['cyclops'], tint: '#d7f0c8' },
  skull: { label: 'Skull', group: 'Creatures', eyes: 'socket', fx: ['skullNose'], tint: '#efe9dc' },
  demon: { label: 'Demon', group: 'Creatures', eyes: 'glowRed', fx: ['fangs'], tint: '#f2a093', brow: 1.25 },
  vampire: { label: 'Vampire', group: 'Creatures', eyes: 'glowRed', fx: ['fangs', 'bags'], tint: '#e4e1f2' },
  zombie: { label: 'Zombie', group: 'Creatures', eyes: ['droopy', 'oval'], fx: ['stitches', 'bags'], tint: '#bfe0a6' },
  ghost: { label: 'Ghost', group: 'Creatures', eyes: 'hollow', tint: '#e7f1ff' },
  goblin: { label: 'Goblin', group: 'Creatures', eyes: 'glow', fx: ['fangs'], tint: '#a9d98b' },
  werewolf: { label: 'Werewolf', group: 'Creatures', eyes: 'glow', fx: ['fur', 'fangs'], tint: '#e8d2b6', brow: 1.3 },
  robot: { label: 'Robot', group: 'Creatures', eyes: 'bolt', fx: ['antenna'], tint: '#d6dde6' },
  vulture: { label: 'Vulture (bald bird)', group: 'Creatures', fx: ['bags'], tint: '#eeb0a4', brow: 1.15 },
  clown: { label: 'Clown', group: 'Special eyes', fx: ['clownNose', 'cheeks'] },
  sick: { label: 'Sick', group: 'Special eyes', eyes: 'droopy', fx: ['bags'], tint: '#cfe8b4' },
};
EXT_FX.shadesFx = ({ fx, ey, dx }: any) => [-1, 1].map(s => pth(`M${f1(fx + s * 4)},${f1(ey - 12)} L${f1(fx + s * (dx + 20))},${f1(ey - 14)} Q${f1(fx + s * (dx + 20))},${f1(ey + 14)} ${f1(fx + s * (dx + 2))},${f1(ey + 12)} Q${f1(fx + s * 4)},${f1(ey + 10)} ${f1(fx + s * 4)},${f1(ey - 12)} Z`, '#1f1c26', 4)).concat([`<path d="M${f1(fx - 6)},${f1(ey - 10)} L${f1(fx + 6)},${f1(ey - 10)}" stroke="${INK}" stroke-width="4"/>`]);
const CLOSED_EYES = new Set(['happy', 'happyXL', 'closed', 'squeeze', 'cry', 'shut', 'x', 'spiral']);
/** FACES key for category x emotion face (an emotion key may already be a blink / talk variant). Registered once. */
export function catFace(cat: string | undefined, emo: string) {
  const C = cat && FACE_CATS[cat]; if (!C || cat === 'male') return emo;
  const key = `_c_${cat}_${emo}`; if (FACES[key]) return key;
  const F = FACES[emo] ?? FACES.standard, eyes = Array.isArray(F.eyes) ? F.eyes : [F.eyes, F.eyes];
  const newEyes = C.eyes ? eyes.map((e: string, i: number) => CLOSED_EYES.has(e) ? e : (Array.isArray(C.eyes) ? C.eyes[i] : C.eyes)) : eyes;
  const brows = F.brows && C.brow ? F.brows.map((b: number[]) => [b[0], b[1], b[2], (b[3] ?? 1) * C.brow!]) : F.brows;
  FACES[key] = { ...F, eyes: newEyes, brows, fx: [...(C.tint ? ['catTint'] : []), ...(F.fx || []), ...(C.fx || [])], catTint: C.tint, catEmoEye: eyes[0] };
  return key;
}
// ---------- EXPRESSION BUCKETS ----------
// A character's expression menu is its face category's bucket: every emotion drawn in that category, plus the category's
// own extra faces from the Ricks Clips face families (value 'fam:<set>:<name>'; set 'meme' = a single meme face).
const FAMILY_SETS: Record<string, any> = { meme: MEMES, female: FEMALE, baby: BABY, elder: ELDER, teen: TEEN, villain: VILLAIN, monster: MONSTER };
const CAT_EXTRAS: Record<string, [string, string[]][]> = {
  male: [['meme', Object.keys(MEMES)]], female: [['female', Object.keys(FEMALE)]], child: [['baby', Object.keys(BABY)], ['teen', Object.keys(TEEN)]],
  elder: [['elder', Object.keys(ELDER)]], villain: [['villain', Object.keys(VILLAIN)]],
  cyclops: [['monster', ['cyclops']]], skull: [['monster', ['skull']]], demon: [['monster', ['demon']]], goblin: [['monster', ['goblin', 'troll', 'blob']]],
  werewolf: [['monster', ['werewolf', 'roar']]], ghost: [['monster', ['booo']]], zombie: [['monster', ['patchwork', 'swamp']]],
  stars: [['meme', ['starstruck']]], hearts: [['meme', ['heartEyes']]], money: [['meme', ['money']]], cool: [['meme', ['cool']]], sick: [['meme', ['sick']]],
};
const pretty = (k: string) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
/** The expression menu for a character: [{ value, label, group }]. The first entry is its own face (signature or neutral). */
export function expressionsFor(design: any) {
  const D = describeCharacter(design), cat = design.faceCat ?? D.faceCat, C = FACE_CATS[cat];
  const out = [{ value: 'own', label: design.rc ? 'Signature face: ' + D.signature : 'Neutral', group: 'Face' }, { value: 'move', label: "Move's acting face", group: 'Face' }];
  for (const e of PRESETS) out.push({ value: e, label: pretty(e), group: (C?.label ?? 'Male') + ' emotions' });
  for (const [set, names] of CAT_EXTRAS[cat] ?? []) for (const n of names) if (FAMILY_SETS[set]?.[n]) out.push({ value: `fam:${set}:${n}`, label: pretty(n), group: (C?.label ?? 'Male') + ' special faces' });
  return out;
}
const famFace = (expr?: string) => { if (!expr?.startsWith('fam:')) return undefined; const [, set, n] = expr.split(':'); return FAMILY_SETS[set]?.[n] ? (set === 'meme' ? n : [set, n]) : undefined; };
/** The category a character's face uses: design.faceCat, else derived from a Ricks Clips signature face, else male. */
const FAMILY_CAT: Record<string, string> = { female: 'female', baby: 'child', teen: 'child', elder: 'elder', villain: 'villain' };
const MONSTER_CAT: Record<string, string> = { cyclops: 'cyclops', skull: 'skull', demon: 'demon', goblin: 'goblin', troll: 'goblin', swamp: 'zombie', patchwork: 'zombie', werewolf: 'werewolf', booo: 'ghost', blob: 'goblin', roar: 'werewolf' };
const MEME_CAT: Record<string, string> = { starstruck: 'stars', heartEyes: 'hearts', money: 'money', cool: 'cool', sick: 'sick', deadInside: 'zombie', evil: 'villain', flirty: 'female' };
export function faceCatOf(design: any, spec?: any) {
  if (design.faceCat && FACE_CATS[design.faceCat]) return design.faceCat;
  const f = (spec ?? (design.rc ? rcSpec(design) : null))?.face;
  if (Array.isArray(f)) return f[0] === 'monster' ? (MONSTER_CAT[f[1]] ?? 'male') : (FAMILY_CAT[f[0]] ?? 'male');
  if (typeof f === 'string') return MEME_CAT[f] ?? 'male';
  return 'male';
}

// yaw 0 = front, 90 = facing screen-right, 180 = back, 270 = facing screen-left.
export function rcView(yaw: number) {
  const d = ((Number(yaw) || 0) % 360 + 360) % 360;
  if (d <= 15 || d >= 345) return ['front', 1] as const;
  if (d < 75) return ['34', 1] as const;
  if (d <= 120) return ['side', 1] as const;
  if (d < 240) return ['back', 1] as const;
  if (d <= 285) return ['side', -1] as const;
  return ['34', -1] as const;
}

// ---------- "Ricks look" for OUR characters (design.look === 'ricks') ----------
// Our wardrobe fields are mapped onto a Ricks Clips puppet spec, so our characters get the RC head shapes, bean body,
// brush ink, ink-stick bending legs, all FACES expressions and every library move. design.rcLook overrides any part
// with an RC library key ('auto' / missing = derived from our fields, 'none' = leave it off).
const OUR_HAIR: Record<string, string> = { sidepart: 'sidePart', receding: 'combOver', bob: 'sleekBob', spiky: 'spiky', curly: 'curlyCrop', afro: 'afro', bun: 'lowBun', ponytail: 'ponytail', long: 'longStraight', buzz: 'buzz', braid: 'braids' };
const OUR_HAT: Record<string, string> = { cap: 'baseball', fedora: 'fedora', beanie: 'beanie', helmet: 'soldier', peaked: 'police', tricorn: 'tricorn', bandana: 'pirateBandana', tophat: 'stovepipe', headband: 'sweatband', sheriff: 'cowboy', beret: 'beret' };
const OUR_ACC: Record<string, string> = { glasses: 'roundGlasses', sunglasses: 'aviators', eyepatch: 'eyePatchMed', freckles: 'freckles', scar: 'scar', bandages: 'plaster' };
const keysOf = (o: any) => Object.keys(o || {}).sort((a, b) => a.localeCompare(b));
/** Option lists for the Studio's Ricks look panel. */
export const RC_OPTIONS = {
  form: keysOf(FORMS), size: ['thin', 'standard', 'fat'], hair: keysOf(HAIR_STYLES), hat: [...keysOf(HATS2), 'beret', 'flatcap', 'tophat', 'straw', 'helmet'].filter((v, i, a) => a.indexOf(v) === i),
  helmet: keysOf(HELMETS), piece: keysOf(PIECES2), beard: keysOf(BEARDS), stache: keysOf(STACHES), acc: keysOf(FACE_ACC),
  outfit: Object.values(OUTFITS).map((o: any) => ({ key: o.key, label: o.label, group: o.group })),
};
const pick = (v: any, auto: any) => v === undefined || v === 'auto' ? auto : v === 'none' ? undefined : v;

// ---------- OUR hair, hats and face details drawn on the Ricks Clips head ----------
// Head space (castkit hat/headBack/faceTop hooks): centre (cx, hy), radius 100; the rig scales it by the head size and
// thins the strokes. Our angle-design patches are in head units (x = +-1 at the head edge, y = 0 at the centre).
// Our face kit is in u = 1 % of the head width with eyes at +-13u on the eye line; on the RC face the eyes sit at +-36 and
// 19 above the centre, so one u is 2.75 head-space units and our features land on the RC eyes and mouth.
const hex = (c: string) => { const n = parseInt((c || '#888888').slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mixc = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const f1 = (v: number) => v.toFixed(1);
let UID = 0;
const viewYaw = (view: string, dir: number) => view === 'front' ? 0 : view === '34' ? (dir > 0 ? 30 : 330) : view === 'side' ? (dir > 0 ? 90 : 270) : 180;
const headShapeOf = new Map<string, any>();
function headClip(H: any, shape: any) {
  const id = 'oh' + (UID++), d = smooth(headPts(H.cx, H.hy, 100, shape || 'rick', (H.dir || 1) < 0));
  return { id, def: `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>`, outline: `<path d="${d}" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linejoin="round"/>` };
}
/** One flat RC-style fill with a soft light-left gradient and a brush-weight ink edge. */
function rcFill(points: number[][], fill: string, sw = 6, alpha = 1) {
  const id = 'og' + (UID++), xs = points.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x0)}" y1="0" x2="${f1(x1)}" y2="0"><stop offset="0" stop-color="${mixc(fill, '#ffffff', .2)}"/><stop offset=".45" stop-color="${fill}"/><stop offset="1" stop-color="${mixc(fill, '#241726', .22)}"/></linearGradient></defs>`
    + `<path d="${smooth(points)}" fill="url(#${id})" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"${alpha < 1 ? ` opacity="${alpha.toFixed(2)}"` : ''}/>`;
}
/** Our hair and headwear patches for the RC view: 'back' (behind the head) or 'front' (over the face). */
function ourHair(d: any, H: any, layer: 'back' | 'front', shape: any) {
  const o = d.outfit || {}, yaw = viewYaw(H.view || 'front', H.dir || 1), A = angleDesign(d.hairStyle, o.hat ?? 'hair', yaw), R = 100;
  // our rig narrows the turned head (width a * hypot(cos, .85 sin)) and the patches are in those turned units
  const a = yaw * Math.PI / 180, sx = R * Math.hypot(Math.cos(a), .85 * Math.sin(a));
  const clipped: string[] = [], free: string[] = [];
  for (const p of A.hair) {
    if (p.layer !== layer || p.alpha < .01) continue;
    const pts = p.points.map(([x, y]: number[]) => [H.cx + x * sx, H.hy + y * R]);
    const base = p.accent ? (o.hatAccent ?? '#e8c45a') : p.id === 'hat-band' ? '#342d34' : p.kind === 'hat' ? (o.cap ?? d.hair) : d.hair;
    const fill = p.tone ? (p.tone > 0 ? mixc(base, '#241726', p.tone) : mixc(base, '#ffffff', -p.tone)) : base;
    (p.clip ? clipped : free).push(rcFill(pts, fill, p.id.startsWith('temple') ? 3.5 : 6, p.alpha));
  }
  if (!clipped.length) return free;
  const c = headClip(H, shape);   // hair that hugs the skull is clipped to the RC head, then the head edge is inked again over it
  return [c.def, `<g clip-path="url(#${c.id})">${clipped.join('')}</g>`, c.outline, ...free];
}
/** Our face details (moustache, beard, stubble, glasses, scars, burns ...) on the RC face. skip = parts an RC override replaces. */
function ourFace(d: any, H: any, shape: any, skip: Set<string>) {
  const view = H.view || 'front'; if (view === 'back') return [];
  const o = d.outfit || {}, list = new Set<string>(d.accessories || []), stout = d.build === 'stout', K = 2.75, side = view === 'side', dir = H.dir || 1;
  if (d.accessory === 'researcher' || d.accessory === 'archivist') list.add('glasses');
  // our face coordinates: (X, Y) in u around the face centre on the eye line; side view = profile, facing +X
  // Profile: our profile layout (mouth at X=33, Y=21) is anchored on the RC profile mouth (50 forward, 31.6 below the
  // head centre) a little narrower so it stays inside the head; drawn in final position, then the rig's profile slide
  // (translate 34 * dir, squash .78 round cx) is undone by the wrapper below.
  const cx = H.cx, ey = H.hy - 19, KS = 2.2;
  const Q = side ? (X: number, Y: number) => [cx + dir * (50 + (X - 33) * KS), H.hy + 31.6 + (Y - 21) * K * .9] : (X: number, Y: number) => [cx + X * K, ey + Y * K];
  const pts = (a: number[][]) => a.map(([x, y]) => Q(x, y)), poly = (a: number[][], fill: string, sw = 0, extra = '') => `<path d="M${pts(a).map(p => f1(p[0]) + ',' + f1(p[1])).join(' L')} Z" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"` : ''}${extra}/>`;
  const line = (a: number[][], w: number, col = INK, op = 1) => `<path d="M${pts(a).map(p => f1(p[0]) + ',' + f1(p[1])).join(' L')}" fill="none" stroke="${col}" stroke-width="${f1(w * K)}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`;
  const ell = (X: number, Y: number, rx: number, ry: number, fill: string, sw = 0, rot = 0) => { const [x, y] = Q(X, Y); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx * K)}" ry="${f1(ry * K)}" fill="${fill}"${sw ? ` stroke="${INK}" stroke-width="${f1(sw * K)}"` : ''}${rot ? ` transform="rotate(${rot.toFixed(0)} ${f1(x)} ${f1(y)})"` : ''}/>`; };
  const taper = (a: number[], b: number[], wa: number, wb: number, col: string) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    return poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col) + ell(a[0], a[1], wa / 2, wa / 2, col) + ell(b[0], b[1], wb / 2, wb / 2, col); };
  let seed = (d.seed || 1) * 97 + 13; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const inside: string[] = [], over: string[] = [], Ha = 50, Hb = 50, MY = 19.3;   // head half width / height in u; mouth line
  if (!side) {
    if (o.beard && !skip.has('beard')) { over.push(poly([[-36, 9], [-33, 30], [-24, 41], [-10, 47], [0, 49], [16, 44], [30, 32], [35, 10], [24, 15], [17, 29], [-17, 29], [-25, 15]], o.beard, 4));
      for (const x of [-19, -8, 6, 18]) over.push(line([[x, 33], [x + 2, 40]], .7, mixc(o.beard, '#000000', .3))); }
    if (list.has('stubble') && !skip.has('beard')) for (let i = 0; i < 120; i++) { const x = -31 + rnd() * 62, y = 13 + rnd() * 33, e = (x / 31) ** 2 + ((y - 26) / 22) ** 2 * .55 + Math.max(0, (y - 38) / 9) * (Math.abs(x) / 31);
      if (e > 1 || (y < 19 && Math.abs(x) > 14) || (y > 20 && y < 28 && Math.abs(x) < 15)) continue; inside.push(ell(x, y, .5 + .35 * rnd(), .5 + .35 * rnd(), '#8f8a86')); }
    if (o.moustache && !skip.has('stache')) {
      if (o.moustacheStyle === 'bold') { const half = [[.5, 10.6], [8, 10], [15, 11.4], [19.2, 14.8], [20.6, 20.8], [17.2, 18], [11, 16.2], [4, 16.6], [.5, 15.6]];
        over.push(poly([...half, ...[...half].reverse().map(([x, y]) => [-x, y])].map(([x, y]) => [x, y + MY - 20]), o.moustache, 3)); }
      else for (const s of [-1, 1]) over.push(taper([s * 1.5, MY - 7.5], [s * (stout ? 19 : 15), MY - (stout ? 9.5 : 5)], stout ? 5.5 : 4.5, 1.6, o.moustache));
    }
    if (list.has('scar')) { const hat = !!(o.hat && o.hat !== 'hair'), top = o.hat === 'headband' ? -.38 : hat ? -.31 : -.5, a = [-.44 * Ha, top * Hb], b = [-.3 * Ha, .02 * Hb];
      over.push(line([a, b], 2.3, '#c9787a'), line([a, b], .8, '#eab0ad'));
      for (const k of [.22, .5, .78]) { const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k; over.push(line([[x - 3.6, y - 1], [x + 3.6, y + 1]], .75, '#7a3b44')); } }
    if (list.has('burns')) { const e: number[][] = []; for (let i = 0; i <= 14; i++) { const t = i / 14; e.push([(-.04 - .12 * rnd() + .06 * Math.sin(t * 9)) * Ha, (-.5 + 1.2 * t) * Hb]); }
      for (let i = 0; i <= 16; i++) { const a = Math.PI * .6 + Math.PI * .78 * (1 - i / 16); e.push([Math.cos(a) * Ha * .9, Math.max(-.5, Math.sin(a) * .86) * Hb]); }
      inside.push(poly(e, 'rgba(214,104,92,.55)'));
      for (let i = 0; i < 7; i++) inside.push(ell(-(.18 + rnd() * .6) * Ha, (-.4 + rnd()) * Hb, (.08 + rnd() * .12) * Ha, (.05 + rnd() * .1) * Hb, 'rgba(158,52,48,.45)', 0, rnd() * 180));
      for (let i = 0; i < 12; i++) inside.push(ell(-(.12 + rnd() * .7) * Ha, (-.5 + rnd() * 1.1) * Hb, 1.6 + rnd() * 1.6, 1.3 + rnd() * 1.2, '#f6d2bd', .3)); }
    if (list.has('oldburns')) { const e: number[][] = []; for (let i = 0; i <= 12; i++) { const t = i / 12; e.push([(-.3 - .08 * rnd() + .05 * Math.sin(t * 8)) * Ha, (-.2 + .85 * t) * Hb]); }
      for (let i = 0; i <= 12; i++) { const a = Math.PI * .62 + Math.PI * .5 * (1 - i / 12); e.push([Math.cos(a) * Ha * .86, Math.max(-.2, Math.sin(a) * .8) * Hb]); }
      inside.push(poly(e, 'rgba(210,140,130,.4)')); }
    if (list.has('blood')) { const red = '#a3161c', x0 = -.38 * Ha, y0 = -.5 * Hb;
      over.push(line([[x0 - .16 * Ha, y0], [x0 + .14 * Ha, y0 - .05 * Hb]], 3.4, red));
      for (const [x, y, len, w, wob] of [[x0 - .08 * Ha, y0 + 1.5, Hb, 3.2, 1.6], [x0 + .13 * Ha, y0, .55 * Hb, 2.4, -1.2], [-.03 * Ha, .16 * Hb, .2 * Hb, 2, .6]]) {
        const tr = Array.from({ length: 7 }, (_, i) => [x + wob * Math.sin(i / 6 * 5), y + len * i / 6]); over.push(line(tr, w, red), ell(tr[6][0], tr[6][1] + w * .4, w * .62, w * .85, red)); } }
    if (list.has('bandages')) { const A = [.5 * Ha, -.98 * Hb], B = [-.92 * Ha, -.5 * Hb]; over.push(line([A, B], 7.5, INK), line([A, B], 6.3, '#f4efe4'));
      const r = -.25, c0 = [-.54 * Ha, .42 * Hb], pw = .15 * Ha, ph = .19 * Hb, Rt = (x: number, y: number) => [c0[0] + x * Math.cos(r) - y * Math.sin(r), c0[1] + x * Math.sin(r) + y * Math.cos(r)];
      over.push(poly([Rt(-pw, -ph), Rt(pw, -ph), Rt(pw, ph), Rt(-pw, ph)], '#f4efe4', 3)); }
    if (list.has('blush')) for (const s of [-1, 1]) inside.push(ell(s * .5 * Ha, .34 * Hb, .15 * Ha, .07 * Hb, 'rgba(236,128,128,.4)'));
    if (list.has('freckles')) for (const s of [-1, 1]) for (const [dx, dy] of [[.36, .28], [.46, .33], [.41, .4], [.53, .27]]) inside.push(ell(s * dx * Ha, dy * Hb, 1.1, 1.1, '#c48466'));
    if (!skip.has('acc')) {
      if (list.has('glasses')) { for (const s of [-1, 1]) over.push(ell(s * 13, 0, 13, 11.5, 'none', 1.6)); over.push(line([[-3, 0], [3, 0]], 1.6), line([[-27.5, -1.5], [-32.5, -3]], 1.3), line([[27.5, -1.5], [32.5, -3]], 1.3)); }
      if (list.has('sunglasses')) { for (const s of [-1, 1]) over.push(ell(s * 13, 1, 14, 10, '#1f1c26', 1.6), line([[s * 13 - 7, -3], [s * 13 - 2, -5.5]], 1.2, '#ffffff', .55)); over.push(line([[-4, -1], [4, -1]], 1.6), line([[-29, -1.5], [-35, -3]], 1.3), line([[29, -1.5], [35, -3]], 1.3)); }
      if (list.has('eyepatch')) over.push(line([[-Ha * .97, .08 * Hb], [-13, 0], [Ha * .9, -.6 * Hb]], 1.6, '#1d1a20'), ell(-13, 1, 12.5, 10.5, '#1d1a20', 1.2));
    }
  } else {   // profile: one moustache half, a beard along the jaw, one lens at the near eye
    if (o.beard && !skip.has('beard')) over.push(poly([[2, 9], [6, 30], [16, 44], [30, 49], [38, 42], [41, 28], [33, 24], [22, 29], [12, 18], [9, 8]], o.beard, 4));
    if (o.moustache && !skip.has('stache')) over.push(taper([38, MY - 7], [24, MY - (stout ? 8.5 : 4)], stout ? 5.5 : 4.5, 1.6, o.moustache));
    if (!skip.has('acc') && (list.has('glasses') || list.has('sunglasses'))) { const sun = list.has('sunglasses'); over.push(ell(27, 0, 7, sun ? 9 : 10.5, sun ? '#1f1c26' : 'none', 1.6), line([[20, -1], [-6, -4]], 1.3)); }
    if (list.has('blush')) over.push(ell(22, .34 * Hb, 6, 3.5, 'rgba(236,128,128,.4)'));
    return over.length ? [`<g transform="translate(${f1(cx)},0) scale(${(1 / .78).toFixed(4)},1) translate(${f1(-cx - dir * 34)},0)">${over.join('')}</g>`] : [];
  }
  if (!inside.length) return over;
  const c = headClip(H, shape);   // skin marks stay inside the head outline
  return [c.def, `<g clip-path="url(#${c.id})">${inside.join('')}</g>`, ...over];
}

function ricksSpec(d: any) {
  const L = d.rcLook || {}, o = d.outfit || {}, acc: string[] = d.accessories || [];
  let spec: any = { name: d.id || 'ours', label: d.name, form: pick(L.form, d.build === 'kid' ? 'kid' : 'standard'), coat: d.jacket, face: 'standard',
    ...(d.figure?.headShape && d.figure.headShape !== 'auto' ? { head: d.figure.headShape } : {}) };   // head shape first: our hair is clipped to it
  const size = pick(L.size, d.build === 'stout' ? 'fat' : d.build === 'kid' ? undefined : 'standard'); if (size) spec.size = size;
  const outfit = pick(L.outfit, undefined); if (outfit && OUTFITS[outfit]) { spec.outfit = outfit; spec.outfitPal = { a: d.jacket }; }
  // Default: OUR hair, hats and face details on the RC head (only the eyes, brows and mouth are RC, so every RC
  // expression plays). Picking an RC hair or hat in rcLook switches the head to the RC hair / hat libraries instead.
  if ((L.hair === undefined || L.hair === 'auto') && (L.hat === undefined || L.hat === 'auto') && (L.piece === undefined || L.piece === 'auto')) {
    const shape = buildChar({ ...spec }, 0).head || 'rick';
    const skip = new Set(['beard', 'stache', 'acc'].filter(k => L[k] !== undefined && L[k] !== 'auto'));
    spec.headBack = (H: any) => ourHair(d, H, 'back', shape);
    spec.hat = (H: any) => ourHair(d, H, 'front', shape);
    spec.faceTop = (H: any) => ourFace(d, H, shape, skip);
    spec.views = true;   // our head parts are already drawn per view: stop the move rig shifting the hat 16 units in profile
    const beard = pick(L.beard, undefined), stache = pick(L.stache, undefined), fa = L.acc && L.acc !== 'auto' && L.acc !== 'none' ? [L.acc] : [];
    if (beard || stache || fa.length) spec = withFace(spec, { beard: BEARDS[beard] ? beard : undefined, stache: STACHES[stache] ? stache : undefined, acc: fa.filter(a => FACE_ACC[a]), col: o.beard || o.moustache || d.hair });
    return spec;
  }
  // head: hair, then a hat / helmet / head piece on top (the RC libraries press the hair flat under a hat)
  let hair = pick(L.hair, OUR_HAIR[d.hairStyle] ?? 'sidePart'); if (hair && !HAIR_STYLES[hair]) hair = 'sidePart';
  let hat = pick(L.hat, o.hat && o.hat !== 'hair' ? OUR_HAT[o.hat] : undefined); const helmet = HELMETS[hat] ? hat : undefined;
  const piece = pick(L.piece, hat === 'sweatband' ? 'sweatband' : undefined); if (hat === 'sweatband') hat = undefined;
  const hcol = d.hair, pieces = piece && PIECES2[piece] ? [piece] : [];
  if (helmet) spec = withGear(spec, hair ?? 'buzz', { helmet, col: hcol });
  else if (hat || pieces.length || hair) spec = wear(spec, hair ?? 'buzz', { hat, hatCol: o.cap, pieces, pieceCol: o.hatAccent, col: hcol, ...(hair ? {} : { underHat: true }) });
  // face gear: beard, moustache, glasses / patches / marks
  const beard = pick(L.beard, o.beard ? 'full' : acc.includes('stubble') ? 'stubble' : undefined);
  const stache = pick(L.stache, o.moustache ? (STACHES[o.moustacheStyle] ? o.moustacheStyle : 'chevron') : undefined);
  const faceAcc = L.acc && L.acc !== 'auto' ? (L.acc === 'none' ? [] : [L.acc]) : [...acc.map(a => OUR_ACC[a]), d.accessory === 'researcher' || d.accessory === 'archivist' ? 'roundGlasses' : undefined].filter((a, i, all) => a && all.indexOf(a) === i) as string[];
  const marks = acc.includes('blush') ? ['blush'] : [];
  if (beard || stache || faceAcc.length || marks.length) spec = withFace(spec, { beard: BEARDS[beard] ? beard : undefined, stache: STACHES[stache] ? stache : undefined, acc: faceAcc.filter(a => FACE_ACC[a]), marks, col: o.beard || o.moustache || hcol });
  return spec;
}
// ---------- FIGURE: head shape + head size, body form + body size, legs, limbs, arms (any character) ----------
// design.figure = { form, headShape, headSize, bodySize, legs, limbs, arms }; sizes S M L XL XXL XXXL (L = the Ricks
// Clips 'standard' size). Missing fields keep the character's own look. The chosen numbers are registered as a body form
// of their own, so the still puppet, its hats and outfits and every move of the motion rig all use the same proportions.
export const SIZE_STEPS = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;
// steps line up with the Ricks Clips sizes: S = thin, L = standard, XXL = fat (head M = a form's own 1.5)
const BODY_W = [1, 1.28, 1.56, 1.8, 2.05, 2.4];        // body width x the form's own width
const BODY_LONG = [20, 38, 55, 72, 90, 110];           // added body length
const HEAD_K = [1.38, 1.5, 1.62, 1.74, 1.9, 2.1];      // head scale
const LEG_OFF = [-60, -30, 0, 35, 70, 105];            // longer legs lift the body (ground stays)
const LIMB_W = [11, 14, 17, 21, 25, 30];               // leg and arm line weight
const ARM_OFF = [-55, -28, 0, 28, 56, 85];             // hand drop below the body's bottom edge
export const HEAD_SHAPES = ['rick', 'potato', 'bun', 'egg', 'round'];
export const FIGURE_OPTIONS = { form: keysOf(FORMS).filter(k => !k.startsWith('fig_')), headShape: HEAD_SHAPES, size: [...SIZE_STEPS] };
/** Hanging arms for a figure (same construction as the RC cast arms: front pair, 3/4 near + far, one in profile). */
function figArms(top: number, bot: number, wB: number, k: number, drop: number) {
  const sh0 = Math.max(34, 60 * k), shY = 52, hd0 = wB + 14, hy = bot - 22 + drop, sideX = 16 * Math.max(.7, Math.min(k, 1.3)), len0 = Math.hypot(hd0 - sh0, hy - top - shY);
  const arc = (sx: number, sy: number, hx: number, h2: number, b: number) => ({ d: `M${f1(sx)},${f1(sy)} Q${f1((sx + hx) / 2 + b)},${f1((sy + h2) / 2)} ${f1(hx)},${f1(h2 - 6)}`, hand: [hx, h2], len0 });
  return ({ cx, view, dir = 1 }: any) => {
    if (view === 'side') return { front: arc(cx + dir * 8, top + shY + 35, cx + dir * sideX, hy, -dir * 22) };
    if (view === '34') return { front: arc(cx - dir * sh0, top + shY + 35, cx - dir * .85 * wB, hy, -dir * .2 * wB), back: arc(cx + dir * sh0, top + shY, cx + dir * hd0, hy, dir * 22) };
    return { front: [-1, 1].map(s => arc(cx + s * sh0, top + shY, cx + s * hd0, hy, s * 22)) };
  };
}
function figureForm(base: string, fig: any) {
  const key = 'fig_' + base + '_' + [fig.bodySize, fig.headSize, fig.legs, fig.limbs, fig.arms].map(v => v ?? '-').join('_');
  if (FORMS[key]) return key;
  const S0 = (FORMS[base] ?? FORMS.standard).S, i = (v: any) => SIZE_STEPS.includes(v) ? SIZE_STEPS.indexOf(v) : 2;
  const kW = BODY_W[i(fig.bodySize)], legOff = LEG_OFF[i(fig.legs)];
  const top = (S0.bodyTop ?? 333) - legOff, bot = (S0.bodyBot ?? 640) + BODY_LONG[i(fig.bodySize)] - legOff, wT = (S0.wTop ?? 74) * kW, wB = (S0.wBot ?? 104) * kW;
  FORMS[key] = { label: 'figure ' + key, S: { ...S0, wTop: wT, wBot: wB, sizeK: kW, hipW: (S0.hipW ?? 13) * (kW < 1 ? .5 + kW * .5 : kW), stance: (S0.stance ?? 0) + (kW > 1 ? (kW - 1) * 14 : 0),
    bodyTop: top, bodyBot: bot, headK: HEAD_K[i(fig.headSize)], legW: LIMB_W[i(fig.limbs)], handR: 15 * (.8 + .1 * i(fig.limbs)), arms: figArms(top, bot, wB, kW, ARM_OFF[i(fig.arms)]) } };
  return key;
}
/** Applies design.figure to a spec (sheet or ours). Only the fields given change the look. */
function withFigure(spec: any, fig: any, defaults: any = {}) {
  const f = { ...defaults, ...(fig || {}) };
  if (!Object.values(f).some(v => v !== undefined && v !== 'auto')) return spec;
  const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === 'auto' ? undefined : v]));
  const out = { ...spec };
  if (clean.headShape && HEAD_SHAPES.includes(clean.headShape as string)) out.head = clean.headShape;
  if (['bodySize', 'headSize', 'legs', 'limbs', 'arms'].some(k => clean[k] !== undefined) || clean.form) {
    out.form = figureForm((clean.form as string) || spec.form || 'standard', clean); delete out.size;
  }
  return out;
}
// ---------- PROPS: any prop on any character ----------
// design.props = [prop id, ...]. Groups (the Studio's sub-categories): Head, Face, Back, Body, Held.
// Sources: OUR wardrobe (hats, face details, tie / scarf / badge / apron / sash, rifle / sword) and every Ricks Clips
// character's own parts, one prop per part slot (its headwear, back-of-head piece, face piece, back piece - tail, wings,
// cape -, held item, raised item, body detail). Ricks Clips hooks draw relative to the body they are attached to, so a
// tail or a crook fits any body size.
type Prop = { id: string; label: string; group: 'Head' | 'Face' | 'Back' | 'Body' | 'Held'; slot: string; fn: (d: any, shape: any) => (x: any) => string[] };
export const PROPS: Record<string, Prop> = {};
const addProp = (p: Prop) => { PROPS[p.id] = p; };
const OUR_HATS = ['cap', 'fedora', 'beanie', 'helmet', 'peaked', 'tricorn', 'bandana', 'tophat', 'headband', 'sheriff', 'beret'];
/** our headwear only (no hair) from the angle designs, in the RC head space */
function ourHatOnly(hat: string, col: string, accent: string, H: any, layer: 'back' | 'front') {
  const yaw = viewYaw(H.view || 'front', H.dir || 1), A = angleDesign('buzz', hat, yaw), a = yaw * Math.PI / 180, sx = 100 * Math.hypot(Math.cos(a), .85 * Math.sin(a)), out: string[] = [];
  for (const p of A.hair) { if (p.layer !== layer || p.alpha < .01 || (p.kind !== 'hat' && !p.id.startsWith('band'))) continue;
    const base = p.accent ? accent : p.id === 'hat-band' ? '#342d34' : col, fill = p.tone ? (p.tone > 0 ? mixc(base, '#241726', p.tone) : mixc(base, '#ffffff', -p.tone)) : base;
    out.push(rcFill(p.points.map(([x, y]: number[]) => [H.cx + x * sx, H.hy + y * 100]), fill, 6, p.alpha)); }
  return out;
}
for (const hat of OUR_HATS) {
  const col = (d: any) => d.outfit?.cap ?? '#3d4a5c', acc = (d: any) => d.outfit?.hatAccent ?? '#e8c45a';
  addProp({ id: 'our:hat:' + hat, label: 'Our ' + hat, group: 'Head', slot: 'hat', fn: d => H => ourHatOnly(hat, col(d), acc(d), H, 'front') });
  addProp({ id: 'our:hatb:' + hat, label: 'Our ' + hat + ' (back part)', group: 'Head', slot: 'headBack', fn: d => H => ourHatOnly(hat, col(d), acc(d), H, 'back') });
}
const FACE_ITEMS: [string, string, (d: any) => any][] = [
  ['glasses', 'Glasses', () => ({ accessories: ['glasses'] })], ['sunglasses', 'Sunglasses', () => ({ accessories: ['sunglasses'] })], ['eyepatch', 'Eyepatch', () => ({ accessories: ['eyepatch'] })],
  ['freckles', 'Freckles', () => ({ accessories: ['freckles'] })], ['blush', 'Blush', () => ({ accessories: ['blush'] })], ['stubble', 'Stubble', () => ({ accessories: ['stubble'] })],
  ['scar', 'Scar', () => ({ accessories: ['scar'] })], ['burns', 'Burns', () => ({ accessories: ['burns'] })], ['oldburns', 'Old burns', () => ({ accessories: ['oldburns'] })],
  ['blood', 'Blood', () => ({ accessories: ['blood'] })], ['bandages', 'Bandages', () => ({ accessories: ['bandages'] })],
  ['moustache', 'Moustache', d => ({ outfit: { moustache: d.outfit?.moustache ?? d.hair ?? '#4a3020' } })], ['moustacheBold', 'Moustache (bold)', d => ({ outfit: { moustache: d.outfit?.moustache ?? d.hair ?? '#4a3020', moustacheStyle: 'bold' } })],
  ['beard', 'Beard', d => ({ outfit: { beard: d.outfit?.beard ?? d.hair ?? '#5b3a26' } })],
];
for (const [k, label, make] of FACE_ITEMS) addProp({ id: 'our:face:' + k, label: 'Our ' + label.toLowerCase(), group: 'Face', slot: 'faceTop', fn: (d, shape) => H => ourFace({ seed: d.seed ?? 1, build: d.build, ...make(d) }, H, shape, new Set()) });
// our body items, drawn in body space and clipped to the torso by the rig (B: cx, top, bot, view, dir, turn)
const BODY_ITEMS: Record<string, [string, (B: any, col: string) => string[]]> = {
  tie: ['Tie', (B, c) => B.view === 'back' || B.view === 'side' ? [] : (x => [pth(`M${x - 9},${B.top + 18} L${x + 9},${B.top + 18} L${x + 5},${B.top + 34} L${x + 14},${B.top + 150} L${x},${B.top + 170} L${x - 14},${B.top + 150} L${x - 5},${B.top + 34} Z`, c, 4)])(B.cx + (B.turn || 0) * 40)],
  scarf: ['Scarf', (B, c) => [pth(`M${B.cx - 140},${B.top - 6} Q${B.cx},${B.top + 40} ${B.cx + 140},${B.top - 6} L${B.cx + 140},${B.top + 30} Q${B.cx},${B.top + 76} ${B.cx - 140},${B.top + 30} Z`, c, 5),
    ...(B.view === 'back' ? [] : [pth(`M${B.cx + 30 + (B.turn || 0) * 30},${B.top + 40} l26,0 l10,110 l-30,6 Z`, c, 5)])]],
  badge: ['Badge', (B, c) => B.view === 'back' ? [] : [star(B.cx - 45 + (B.turn || 0) * 30, B.top + 95, 17, c, 3.5)]],
  apron: ['Apron', (B, c) => B.view === 'back' ? [] : [pth(`M${B.cx - 70},${B.top + 110} L${B.cx + 70},${B.top + 110} L${B.cx + 90},${B.bot + 20} L${B.cx - 90},${B.bot + 20} Z`, c, 5)]],
  sash: ['Sash', (B, c) => [pth(`M${B.cx - 120},${B.top + 10} L${B.cx - 70},${B.top - 10} L${B.cx + 140},${B.bot - 60} L${B.cx + 100},${B.bot - 20} Z`, c, 5)]],
};
const BODY_COL: Record<string, (d: any) => string> = { tie: d => d.outfit?.tie ?? '#c8423b', scarf: d => d.outfit?.scarf ?? '#e8b93c', badge: d => d.outfit?.badge ?? '#e8c45a', apron: d => d.outfit?.apron ?? '#f1ebdd', sash: d => d.outfit?.sash ?? '#c0353a' };
for (const [k, [label, draw]] of Object.entries(BODY_ITEMS)) addProp({ id: 'our:body:' + k, label: 'Our ' + label.toLowerCase(), group: 'Body', slot: 'details', fn: d => B => draw(B, BODY_COL[k](d)) });
// our held items, at the character's right hand (B.hdR)
const HELD_ITEMS: Record<string, [string, (B: any) => string[]]> = {
  rifle: ['Rifle', B => { const [x, y] = B.hdR || [B.cx + 140, B.bot]; return [`<g transform="rotate(-62 ${x} ${y})">${pth(`M${x - 150},${y - 10} L${x + 150},${y - 10} L${x + 150},${y + 2} L${x - 90},${y + 6} L${x - 150},${y + 26} Z`, '#6b4a2e', 4.5)}${pth(`M${x - 40},${y - 18} L${x + 210},${y - 18} L${x + 210},${y - 9} L${x - 40},${y - 9} Z`, '#4a4a52', 4)}</g>`, elp(x, y, 15, 15, INK)]; }],
  sword: ['Sword', B => { const [x, y] = B.hdR || [B.cx + 140, B.bot]; return [pth(`M${x - 7},${y - 30} L${x + 7},${y - 30} L${x + 6},${y - 250} L${x},${y - 272} L${x - 6},${y - 250} Z`, '#c9d1dc', 4), pth(`M${x - 34},${y - 30} L${x + 34},${y - 30} L${x + 34},${y - 18} L${x - 34},${y - 18} Z`, '#e8c45a', 4), pth(`M${x - 6},${y - 18} L${x + 6},${y - 18} L${x + 6},${y + 24} L${x - 6},${y + 24} Z`, '#6b4a2e', 4), elp(x, y, 15, 15, INK)]; }],
};
for (const [k, [label, draw]] of Object.entries(HELD_ITEMS)) addProp({ id: 'our:held:' + k, label: 'Our ' + label.toLowerCase(), group: 'Held', slot: 'over', fn: () => B => draw(B) });
// Bird parts (2026-11-22, Desert Car vulture): hooked beak (face), feather ruff and napkin bib (body), folded wings (back).
// Colours: outfit.beak, outfit.ruff, outfit.wing, outfit.bib (+ outfit.bibCheck).
const BIRD_INK = '#241c22';
function birdBeak(H: any, col: string) {
  const { cx, hy } = H, v = H.view || 'front', s = H.dir || 1;
  if (v === 'back') return [];
  if (v === 'front') return [pth(`M${cx - 20},${hy - 8} Q${cx},${hy - 22} ${cx + 20},${hy - 8} Q${cx + 22},${hy + 14} ${cx + 8},${hy + 30} Q${cx},${hy + 42} ${cx - 8},${hy + 30} Q${cx - 22},${hy + 14} ${cx - 20},${hy - 8} Z`, col, 5),
    pth(`M${cx - 8},${hy + 24} Q${cx},${hy + 44} ${cx + 8},${hy + 24} Q${cx},${hy + 30} ${cx - 8},${hy + 24} Z`, BIRD_INK, 0), elp(cx - 7, hy - 4, 3, 2.4, BIRD_INK), elp(cx + 7, hy - 4, 3, 2.4, BIRD_INK)];
  const bx = cx + s * (v === 'side' ? 52 : 34), tip = bx + s * (v === 'side' ? 74 : 60), y = H.hy + (v === 'side' ? 4 : 14);
  return [pth(`M${bx},${y - 16} Q${(bx + tip) / 2},${y - 22} ${tip},${y + 2} Q${tip + s * 6},${y + 18} ${tip - s * 6},${y + 30} Q${tip - s * 12},${y + 18} ${tip - s * 20},${y + 14} L${bx},${y + 16} Z`, col, 5),
    pth(`M${tip - s * 2},${y + 10} Q${tip + s * 4},${y + 20} ${tip - s * 6},${y + 30} Q${tip - s * 8},${y + 20} ${tip - s * 2},${y + 10} Z`, BIRD_INK, 0), elp(bx + s * 16, y - 4, 3, 2.4, BIRD_INK)];
}
addProp({ id: 'our:face:beak', label: 'Our hooked beak (bird)', group: 'Face', slot: 'faceTop', fn: d => H => birdBeak(H, d.outfit?.beak ?? '#e6d29a') });
addProp({ id: 'our:body:ruff', label: 'Our feather ruff (bird)', group: 'Body', slot: 'details', fn: d => B => { const c = d.outfit?.ruff ?? '#efe7d8', t = B.turn || 0;
  return [...Array(9)].map((_, k) => elp(B.cx + (k - 4) * 30 + t * 30, B.top + 14 + Math.abs(k - 4) * -2 + (k % 2) * 8, 28, 24, c, 4)); } });
addProp({ id: 'our:body:bib', label: 'Our napkin bib (checked)', group: 'Body', slot: 'details', fn: d => B => { if (B.view === 'back') return [];
  const c = d.outfit?.bib ?? '#fbf8f1', ck = d.outfit?.bibCheck ?? '#d0413c', x = B.cx + (B.turn || 0) * 36, y = B.top + 30, w = B.view === 'side' ? 50 : 82;
  const tri = `M${x - w},${y} L${x + w},${y} L${x},${y + 150} Z`, lines: string[] = [];
  for (let i = 1; i < 5; i++) { const yy = y + i * 28, hw = w * (1 - i * 28 / 150); lines.push(`M${f1(x - hw)},${yy} L${f1(x + hw)},${yy}`); }
  for (let i = -2; i <= 2; i++) lines.push(`M${f1(x + i * w * .36)},${y} L${f1(x + i * w * .36 * .2)},${y + 120}`);
  return [pth(tri, c, 5), `<path d="${lines.join(' ')}" stroke="${ck}" stroke-width="7" fill="none" opacity=".85"/>`, pth(tri, 'none', 5), elp(x - w + 6, y + 2, 12, 9, c, 4), elp(x + w - 6, y + 2, 12, 9, c, 4)]; } });
addProp({ id: 'our:back:wings', label: 'Our folded wings (bird)', group: 'Back', slot: 'behind', fn: d => B => { const c = d.outfit?.wing ?? '#3b3038', hi = mixc(c, '#ffffff', .25), o: string[] = [], { cx, top } = B;
  for (const s of [-1, 1]) {
    const w = `M${cx + s * 60},${top + 20} Q${cx + s * 200},${top + 10} ${cx + s * 210},${top + 160} Q${cx + s * 214},${top + 300} ${cx + s * 170},${top + 420} L${cx + s * 150},${top + 380} L${cx + s * 130},${top + 430} L${cx + s * 108},${top + 380} L${cx + s * 86},${top + 420} Q${cx + s * 70},${top + 250} ${cx + s * 60},${top + 20} Z`;
    o.push(pth(w, c, 6), `<path d="M${cx + s * 90},${top + 70} Q${cx + s * 170},${top + 90} ${cx + s * 186},${top + 200} M${cx + s * 100},${top + 160} Q${cx + s * 160},${top + 190} ${cx + s * 176},${top + 300} M${cx + s * 105},${top + 260} Q${cx + s * 140},${top + 300} ${cx + s * 150},${top + 370}" stroke="${hi}" stroke-width="5" fill="none" stroke-linecap="round"/>`); }
  return o; } });
// Pirate parts (2026-11-23, Black Beard): ribbon bows on the braided beard's two braids, slow-match fuses under the hat
// brim (static cords + embers; scenes add the moving smoke), three pairs of pistols on two crossed silk slings.
// Colours: outfit.ribbon (bows), outfit.ribbonOdd (the one odd bow, on the left braid), outfit.sling.
const bow = (x: number, y: number, c: string) => [pth(`M${x},${y} L${x - 22},${y - 12} L${x - 20},${y + 12} Z M${x},${y} L${x + 22},${y - 12} L${x + 20},${y + 12} Z`, c, 4),
  pth(`M${x - 3},${y + 2} L${x - 9},${y + 26} L${x - 2},${y + 22} Z M${x + 3},${y + 2} L${x + 9},${y + 28} L${x + 2},${y + 22} Z`, c, 3.5), elp(x, y, 6, 6, mixc(c, '#000000', .2), 3.5)];
addProp({ id: 'our:face:beardRibbons', label: 'Our beard ribbons (braids)', group: 'Face', slot: 'faceTop', fn: d => H => {
  const v = H.view || 'front', s = H.dir || 1, c = d.outfit?.ribbon ?? '#c8302f', odd = d.outfit?.ribbonOdd ?? '#f0c43a';
  if (v === 'back') return [];
  if (d.rcLook?.beard === 'braided') {   // one bow at the end of each braid
    if (v === 'side') return bow(H.cx + s * 52, H.hy + 206, c);
    return [...bow(H.cx - 26, H.hy + 206, odd), ...bow(H.cx + 26, H.hy + 206, c)]; }
  // a big loose beard: ribbons tied into tufts all over it (the first one is the odd colour)
  const spots = v === 'side' ? [[34, 128, 1], [52, 176, 0], [40, 214, 0]] : [[-34, 126, 1], [30, 138, 0], [-12, 178, 0], [18, 212, 0]];
  return spots.flatMap(([x, y, o]) => bow(H.cx + (v === 'side' ? s * x : x), H.hy + y, o ? odd : c)); } });
// Belly shirt: a light shirt stretched over a big gut between open coat fronts, straining buttons, belt under the belly.
// Colour: outfit.shirt.
addProp({ id: 'our:body:bellyShirt', label: 'Our belly shirt (open coat)', group: 'Body', slot: 'details', fn: d => B => {
  if (B.view === 'back') return [];
  const c = d.outfit?.shirt ?? '#efe6d2', t = B.turn || 0, top = B.top, bot = B.bot, h = bot - top, side = B.view === 'side', s = B.dir || 1;
  const cx = side ? B.cx + s * 70 : B.cx + t * 40, rx = side ? 90 : 150 - Math.abs(t) * 30, cy = top + h * .64, ry = h * .4;
  const out = [elp(cx, cy, rx, ry, c, 5), `<path d="M${f1(cx - rx * .55)},${f1(cy - ry * .2)} Q${f1(cx - rx * .2)},${f1(cy + ry * .35)} ${f1(cx + rx * .1)},${f1(cy + ry * .55)}" stroke="${mixc(c, '#000000', .18)}" stroke-width="5" fill="none" stroke-linecap="round"/>`];
  // open at the top: a deep V of bare chest with a few hair curls (outfit.chestHair)
  const sk = d.skin ?? '#faf9f5', hc = d.outfit?.chestHair ?? d.outfit?.beard ?? '#17151b', vy = cy - ry, vd = ry * 1.55, vw = side ? rx * .35 : rx * .78;
  const vx = side ? cx + s * rx * .35 : cx;
  out.push(pth(`M${f1(vx - vw)},${f1(vy + 6)} Q${f1(vx - vw * .4)},${f1(vy + vd * .6)} ${f1(vx)},${f1(vy + vd)} Q${f1(vx + vw * .4)},${f1(vy + vd * .6)} ${f1(vx + vw)},${f1(vy + 6)} Z`, sk, 4.5));
  for (const [u, v] of [[-.5, .3], [.46, .32], [-.34, .44], [.3, .46], [-.18, .56], [.2, .6], [-.05, .7], [.08, .78], [0, .88]]) { const x = vx + u * vw, y = vy + v * vd;
    out.push(`<path d="M${f1(x - 6)},${f1(y)} q4,-7 8,0 q4,7 8,0" stroke="${hc}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`); }
  if (!side) for (const k of [.88]) { const y = cy + ry * k, x = cx + Math.sin(k * 2) * 6; out.push(`<path d="M${f1(x - 16)},${f1(y - 6)} Q${f1(x)},${f1(y + 2)} ${f1(x + 16)},${f1(y - 6)}" stroke="${INK}" stroke-width="3" fill="none"/>`, elp(x, y + 6, 6, 6, '#d8b24a', 3)); }
  out.push(pth(`M${f1(cx - rx * 1.05)},${f1(cy + ry * .78)} Q${f1(cx)},${f1(cy + ry * 1.02)} ${f1(cx + rx * 1.05)},${f1(cy + ry * .78)} L${f1(cx + rx * 1.05)},${f1(cy + ry * .98)} Q${f1(cx)},${f1(cy + ry * 1.22)} ${f1(cx - rx * 1.05)},${f1(cy + ry * .98)} Z`, '#2a1e1c', 4),
    pth(`M${f1(cx - 20)},${f1(cy + ry * .86)} L${f1(cx + 20)},${f1(cy + ry * .86)} L${f1(cx + 20)},${f1(cy + ry * 1.14)} L${f1(cx - 20)},${f1(cy + ry * 1.14)} Z`, '#d8b24a', 4));
  return out; } });
// Peg leg: the figure's second leg becomes a wooden peg from the knee down (no foot). Done on the finished SVG (static
// pose and every move frame), because the rig draws legs itself: each leg is two strokes with the same path
// (ink outline, then the inner line), "M hip C .. [knee C ..] ankle L foot".
addProp({ id: 'our:body:pegLeg', label: 'Our wooden peg leg', group: 'Body', slot: 'pegLeg', fn: () => () => [] });
const hasPeg = (d: any) => (d.props || []).includes('our:body:pegLeg');
function pegLeg(svg: string) {
  const re = /<path d="(M[^"]*?C[^"]*? L[-\d.]+,[-\d.]+)" fill="none" stroke="([^"]+)" stroke-width="([\d.]+)"[^>]*\/>\s*<path d="\1" fill="none" stroke="[^"]+" stroke-width="([\d.]+)"[^>]*\/>/g;
  let n = 0;
  return svg.replace(re, (all, dd: string, ink: string, wOut: string) => {
    if (n++ !== 1) return all;   // the second leg only
    const nums = (dd.match(/-?[\d.]+/g) || []).map(Number), P: number[][] = []; for (let i = 0; i < nums.length; i += 2) P.push([nums[i], nums[i + 1]]);
    const foot = P[P.length - 1], ankle = P[P.length - 2], hip = P[0]; let thigh: string, knee: number[];
    if (P.length >= 8) { knee = P[3]; thigh = `M${f1(hip[0])},${f1(hip[1])} C${P[1].map(f1)} ${P[2].map(f1)} ${knee.map(f1)}`; }
    else { const [p0, p1, p2, p3] = [hip, P[1], P[2], ankle], mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const a = mid(p0, p1), b = mid(p1, p2), c = mid(p2, p3), ab = mid(a, b), bc = mid(b, c); knee = mid(ab, bc);
      thigh = `M${f1(p0[0])},${f1(p0[1])} C${a.map(f1)} ${ab.map(f1)} ${knee.map(f1)}`; }
    const W = Number(wOut), bot = [ankle[0], Math.max(ankle[1], foot[1])], dx = bot[0] - knee[0], dy = bot[1] - knee[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const w1 = W * .95, w2 = W * .5, q = (p: number[], w: number, s: number) => `${f1(p[0] + nx * w * s)},${f1(p[1] + ny * w * s)}`;
    const top = [knee[0] + dx / L * 6, knee[1] + dy / L * 6];
    return `<path d="${thigh}" fill="none" stroke="${ink}" stroke-width="${W}" stroke-linecap="round"/>`
      + `<path d="M${q(top, w1, 1)} L${q(bot, w2, 1)} L${q(bot, w2, -1)} L${q(top, w1, -1)} Z" fill="#94623a" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>`
      + `<path d="M${q(top, w1 * .3, 1)} L${q(bot, w2 * .3, 1)}" stroke="#b98a5a" stroke-width="3" fill="none" stroke-linecap="round"/>`
      + `<ellipse cx="${f1(knee[0])}" cy="${f1(knee[1] + 4)}" rx="${f1(w1 * 1.25)}" ry="${f1(W * .55)}" fill="#5a3a24" stroke="${ink}" stroke-width="4"/>`
      + `<ellipse cx="${f1(bot[0])}" cy="${f1(bot[1] - 2)}" rx="${f1(w2 * 1.2)}" ry="${f1(W * .3)}" fill="#3a2a22" stroke="${ink}" stroke-width="3.5"/>`;
  });
}
const ember = (x: number, y: number) => [elp(x, y, 15, 15, '#ff7a1a', 0).replace('/>', ' opacity=".35"/>'), elp(x, y, 7, 7, '#ff8a2a', 3), elp(x - 1, y - 1, 3, 3, '#fff0b0')];
addProp({ id: 'our:hat:fuses', label: 'Our smoking fuses (under the hat)', group: 'Head', slot: 'hat', fn: d => H => {
  const v = H.view || 'front', s = H.dir || 1, by = H.hy - 52, out: string[] = [];
  const cord = (x0: number, x1: number, y1: number, k: number) => { const p = `M${x0},${by} Q${x0 + k},${(by + y1) / 2} ${x1},${y1}`;
    out.push(`<path d="${p}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>`, `<path d="${p}" stroke="#9a7444" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,
      `<path d="M${x1},${y1 - 10} q${-8 * Math.sign(k || 1)},-16 0,-30 q8,-14 -2,-28" stroke="#d9d4cc" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`, ...ember(x1, y1)); };
  if (v === 'back') { cord(H.cx - 90, H.cx - 112, by + 52, -14); cord(H.cx + 90, H.cx + 112, by + 52, 14); return out; }
  if (v === 'side') { cord(H.cx - s * 40, H.cx - s * 62, by + 58, -s * 14); cord(H.cx - s * 74, H.cx - s * 98, by + 40, -s * 10); cord(H.cx + s * 66, H.cx + s * 84, by + 30, s * 12); return out; }
  cord(H.cx - 84, H.cx - 112, by + 62, -16); cord(H.cx - 104, H.cx - 136, by + 30, -12); cord(H.cx + 84, H.cx + 112, by + 62, 16); cord(H.cx + 104, H.cx + 136, by + 30, 12);
  return out; } });
const pistol = (x: number, y: number, a: number, k = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${k})">${[
  pth('M-2,-7 L72,-6 L72,6 L-2,7 Z', '#8d96a3', 4), pth('M66,-8 L76,-8 L76,8 L66,8 Z', '#c9a24a', 3.5),
  pth('M2,-9 L-16,-9 Q-34,4 -42,24 Q-46,36 -32,38 L-24,36 Q-18,18 -2,8 Z', '#6b4329', 4.5), elp(-37, 32, 9, 7, '#d4a948', 3.5),
  pth('M-8,-15 L4,-15 L4,-8 L-8,-8 Z', '#c9a24a', 3), `<path d="M4,7 Q12,20 -2,22" stroke="${INK}" stroke-width="3.5" fill="none"/>`].join('')}</g>`;
addProp({ id: 'our:body:pistols', label: 'Our pistol slings (3 pairs)', group: 'Body', slot: 'details', fn: d => B => {
  const c = d.outfit?.sling ?? '#a3242c', v = B.view, t = B.turn || 0, cx = B.cx + t * 30, top = B.top, bot = B.bot, out: string[] = [];
  if (v === 'back') return [pth(`M${cx - 120},${top + 10} L${cx - 92},${top} L${cx + 130},${bot - 50} L${cx + 104},${bot - 30} Z`, c, 5), pth(`M${cx + 120},${top + 10} L${cx + 92},${top} L${cx - 130},${bot - 50} L${cx - 104},${bot - 30} Z`, c, 5)];
  const sides = v === 'side' ? [B.dir || 1] : [-1, 1];
  const wide = d.figure?.form === 'potbelly';
  for (const s of sides) { const x0 = cx + s * (wide ? 150 : 118), y0 = top + 6, x1 = wide ? cx + s * 205 : cx - s * 112, y1 = bot - 40;
    out.push(pth(`M${x0 - s * 14},${y0 + 8} L${x0 + s * 12},${y0} L${x1 + s * 12},${y1 + 8} L${x1 - s * 14},${y1 + 18} Z`, c, 5));
    for (const u of wide ? [.4, .6, .8] : [.46, .66, .86]) out.push(pistol(x0 + (x1 - x0) * u - s * 6, y0 + (y1 - y0) * u + 4, wide ? (s > 0 ? 75 : 105) : s > 0 ? 118 : 62, 1.08)); }
  return out; } });
// Ricks Clips character parts: one prop per part slot of each of the 150 characters
// What each Ricks Clips back / held prop really is (named from contact sheets, 2026-11-19).
const PROP_NAMES: Record<string, string> = {
  "rc:1:spartan:behind": "Red cape",
  "rc:2:ninja:behind": "Sword on the back (seen from behind)",
  "rc:2:geisha:behind": "Paper parasol",
  "rc:2:emperor:behind": "Gold robe back",
  "rc:2:archer:behind": "Arrow quiver",
  "rc:2:scholar:behind": "Scholar back piece (seen from behind)",
  "rc:3:king:behind": "Royal cape with ermine",
  "rc:3:princess:behind": "Pink back bow",
  "rc:3:plague:behind": "Long black coat tail",
  "rc:3:outlaw:behind": "Bow on the back",
  "rc:4:einstein:behind": "Chalkboard E=mc2",
  "rc:4:tesla:behind": "Tesla coil",
  "rc:5:sailor:behind": "Sailor collar (seen from behind)",
  "rc:5:outlaw:behind": "Dark cloak tails",
  "rc:5:singer:behind": "Singer back piece (seen from behind)",
  "rc:6:teacher:behind": "Chalkboard on easel",
  "rc:7:astronaut:behind": "Backpack antenna",
  "rc:7:plumber:behind": "Smell lines",
  "rc:8:influencer:behind": "Ring light",
  "rc:9:boxer:behind": "Boxing robe",
  "rc:9:magician:behind": "Magician cape",
  "rc:9:luchador:behind": "Wrestler cape",
  "rc:10:bedouin:behind": "Long desert robe",
  "rc:11:vampire:behind": "Vampire cape",
  "rc:11:alien:behind": "Ray lamp",
  "rc:11:fairy:behind": "Fairy wings",
  "rc:11:hero:behind": "Superhero cape",
  "rc:11:timetraveller:behind": "Floating gears",
  "rc:12:towelhero:behind": "Towel cape",
  "rc:12:newborn:behind": "Baby mobile",
  "rc:12:backpack:behind": "School backpack",
  "rc:12:princess:behind": "Toddler princess back piece (seen from behind)",
  "rc:12:jumprope:behind": "Skipping rope loop",
  "rc:12:dino:behind": "Dino tail",
  "rc:13:goth:behind": "Bat wings",
  "rc:13:band:behind": "Sousaphone",
  "rc:13:newdad:behind": "Diaper bag",
  "rc:14:darklord:behind": "Ragged dark cape",
  "rc:14:evilqueen:behind": "Spiked high-collar cape",
  "rc:14:railway:behind": "Villain cape",
  "rc:14:burglar:behind": "Loot sack",
  "rc:14:sorcerer:behind": "Dark robe back",
  "rc:14:swindler:behind": "Coat tail",
  "rc:14:robot:behind": "Robot claw arm",
  "rc:15:werewolf:behind": "Wolf tail",
  "rc:15:goblin:behind": "Goblin sack",
  "rc:15:imp:behind": "Devil tail",
  "rc:1:pharaoh:props": "Crook",
  "rc:1:queen:props": "Ankh",
  "rc:1:emperor:props": "Small hand item",
  "rc:1:centurion:props": "Roman shield",
  "rc:1:philosopher:props": "Scroll",
  "rc:1:spartan:props": "Round bronze shield",
  "rc:1:spartan:over": "Spear (raised)",
  "rc:1:viking:props": "Battle axe",
  "rc:1:gladiator:props": "Small round shield",
  "rc:1:gladiator:over": "Short sword (raised)",
  "rc:1:mummy:props": "Loose bandages",
  "rc:1:eagle:props": "Feather shield and staff",
  "rc:2:samurai:props": "Shoulder armour",
  "rc:2:samurai:over": "Katana (raised)",
  "rc:2:ninja:props": "Throwing star",
  "rc:2:geisha:props": "Closed parasol",
  "rc:2:emperor:props": "Robe buttons",
  "rc:2:archer:props": "Longbow and arrow",
  "rc:2:monk:props": "Fighting staff",
  "rc:2:sumo:props": "Sumo apron",
  "rc:2:maharaja:props": "Pearl necklace and sword",
  "rc:2:terracotta:props": "Halberd and shoulder guards",
  "rc:2:scholar:props": "Folding fan",
  "rc:3:knight:props": "Kite shield",
  "rc:3:knight:over": "Longsword (raised)",
  "rc:3:king:props": "Ruff, orb and sceptre",
  "rc:3:queen:props": "Royal necklace and rose",
  "rc:3:princess:props": "Dress buttons",
  "rc:3:jester:props": "Jester stick",
  "rc:3:monk:props": "Book and rope belt",
  "rc:3:witch:props": "Broom and potion",
  "rc:3:blacksmith:props": "Anvil",
  "rc:3:blacksmith:over": "Smith hammer (raised)",
  "rc:3:plague:props": "Walking cane",
  "rc:3:outlaw:props": "Tall longbow",
  "rc:4:napoleon:props": "Hand in coat",
  "rc:4:einstein:props": "Chalk",
  "rc:4:lincoln:props": "Speech paper",
  "rc:4:leonardo:props": "Paint palette and brush",
  "rc:4:shakespeare:props": "Skull, quill and ruff",
  "rc:4:victoria:props": "Small black fan",
  "rc:4:beethoven:props": "Music card",
  "rc:4:beethoven:over": "Baton and music notes (raised)",
  "rc:4:curie:props": "Glowing flask and notebook",
  "rc:4:tesla:over": "Lightning sparks (raised)",
  "rc:4:columbus:props": "Rolled map",
  "rc:4:columbus:over": "Spyglass (raised)",
  "rc:5:captain:props": "Parrot",
  "rc:5:captain:over": "Hook hand (raised)",
  "rc:5:lass:props": "Dress button",
  "rc:5:lass:over": "Cutlass (raised)",
  "rc:5:sailor:props": "Lifebuoy ring",
  "rc:5:sailor:over": "Seagulls (raised)",
  "rc:5:musketeer:props": "Coat button",
  "rc:5:musketeer:over": "Rapier (raised)",
  "rc:5:redcoat:props": "Gold epaulettes",
  "rc:5:redcoat:over": "Musket (raised)",
  "rc:5:cowboy:props": "Coiled rope",
  "rc:5:cowboy:over": "Lasso (raised)",
  "rc:5:sheriff:props": "Sheriff star and holster",
  "rc:5:sheriff:over": "Revolver (raised)",
  "rc:5:outlaw:props": "WANTED poster",
  "rc:5:prospector:props": "Gold pan and pickaxe",
  "rc:5:singer:props": "Feather boa and fan",
  "rc:6:doctor:props": "Stethoscope and long bill",
  "rc:6:nurse:over": "Syringe (raised)",
  "rc:6:chef:over": "Ladle (raised)",
  "rc:6:firefighter:props": "Fire hose",
  "rc:6:firefighter:over": "Water spray (raised)",
  "rc:6:police:props": "Donut and baton",
  "rc:6:construction:over": "Jackhammer (raised)",
  "rc:6:scientist:over": "Test tube and flask (raised)",
  "rc:6:teacher:props": "Teacher small item",
  "rc:6:teacher:over": "Pointer stick (raised)",
  "rc:6:mail:props": "Mail satchel",
  "rc:6:mail:over": "Flying letters and dog (raised)",
  "rc:6:farmer:props": "Pitchfork",
  "rc:6:farmer:over": "Chicken (raised)",
  "rc:7:astronaut:props": "Flag on a pole",
  "rc:7:pilot:props": "Wheeled suitcase",
  "rc:7:pilot:over": "Sparkle (raised)",
  "rc:7:judge:props": "Gavel block",
  "rc:7:judge:over": "Gavel ORDER! (raised)",
  "rc:7:business:props": "Briefcase",
  "rc:7:business:over": "Phone SELL!! (raised)",
  "rc:7:programmer:props": "Laptop",
  "rc:7:programmer:over": "Coffee mug (raised)",
  "rc:7:barista:over": "Coffee cup (raised)",
  "rc:7:mechanic:over": "Wrench (raised)",
  "rc:7:plumber:props": "Tool belt",
  "rc:7:plumber:over": "Plunger (raised)",
  "rc:7:dentist:props": "Giant tooth",
  "rc:7:dentist:over": "Dental drill (raised)",
  "rc:7:lifeguard:props": "Lifebuoy and whistle",
  "rc:8:flapper:props": "Fringe skirt and pearls",
  "rc:8:gangster:props": "Violin case",
  "rc:8:aviator:props": "Scarf end",
  "rc:8:aviator:over": "Scarf tail (raised)",
  "rc:8:greaser:props": "Small item",
  "rc:8:greaser:over": "Comb (raised)",
  "rc:8:hippie:props": "Peace necklace",
  "rc:8:hippie:over": "Daisy (raised)",
  "rc:8:disco:props": "Disco collar",
  "rc:8:disco:over": "Disco ball (raised)",
  "rc:8:aerobics:over": "Dumbbell (raised)",
  "rc:8:punk:props": "Small item",
  "rc:8:hiphop:props": "Gold chain",
  "rc:8:hiphop:over": "Boombox (raised)",
  "rc:8:influencer:over": "Selfie stick (raised)",
  "rc:9:boxer:props": "Champion belt",
  "rc:9:boxer:over": "Boxing gloves (raised)",
  "rc:9:basketball:props": "Basketball shorts",
  "rc:9:basketball:over": "Spinning basketball (raised)",
  "rc:9:ballerina:props": "Tutu",
  "rc:9:ballerina:over": "Sparkles (raised)",
  "rc:9:magician:props": "Small item",
  "rc:9:magician:over": "Magic wand (raised)",
  "rc:9:clown:props": "Bow tie and flower",
  "rc:9:rockstar:over": "Electric guitar (raised)",
  "rc:9:dj:props": "DJ decks",
  "rc:9:dj:over": "Music notes (raised)",
  "rc:9:opera:props": "Opera gown",
  "rc:9:opera:over": "Music notes (raised)",
  "rc:9:luchador:props": "Champion belt",
  "rc:9:luchador:over": "Small item (raised)",
  "rc:10:piper:props": "Bagpipes",
  "rc:10:piper:over": "Pipe chanter (raised)",
  "rc:10:mariachi:props": "Acoustic guitar",
  "rc:10:bavarian:over": "Pretzel (raised)",
  "rc:10:dutch:props": "Tulips and clog",
  "rc:10:babushka:props": "Nesting dolls",
  "rc:10:bedouin:props": "Coffee pot and column",
  "rc:10:hawaiian:props": "Grass skirt and ukulele",
  "rc:10:inuit:props": "Fish and belt",
  "rc:10:inuit:over": "Harpoon (raised)",
  "rc:10:bride:props": "Small item",
  "rc:10:fisherman:props": "Big fish",
  "rc:11:wizard:props": "Starry robe front",
  "rc:11:wizard:over": "Magic staff (raised)",
  "rc:11:vampire:props": "Hand details",
  "rc:11:zombie:props": "Flies",
  "rc:11:zombie:over": "Flies (raised)",
  "rc:11:robot:over": "Serving cloche (raised)",
  "rc:11:alien:props": "Camera",
  "rc:11:scientist:props": "Small item",
  "rc:11:scientist:over": "Bubbling flask (raised)",
  "rc:11:fairy:props": "Fairy wand",
  "rc:11:hero:props": "Suit buttons",
  "rc:11:hacker:props": "Keyboard",
  "rc:11:hacker:over": "Cables (raised)",
  "rc:11:timetraveller:props": "Pocket watch",
  "rc:12:towelhero:over": "Plunger (raised)",
  "rc:12:newborn:props": "Baby blanket",
  "rc:12:backpack:props": "Teardrops",
  "rc:12:princess:props": "Pink tutu",
  "rc:12:princess:over": "Star wand (raised)",
  "rc:12:scout:props": "Stack of books",
  "rc:12:tantrum:props": "Dropped ice cream",
  "rc:12:tantrum:over": "Small item (raised)",
  "rc:12:jumprope:over": "Skipping rope (raised)",
  "rc:12:rattle:props": "Teething ring",
  "rc:12:rattle:over": "Rattle (raised)",
  "rc:12:volcano:props": "Small item",
  "rc:12:volcano:over": "Erupting volcano model (raised)",
  "rc:12:dino:over": "RAWR! (raised)",
  "rc:13:gamer:props": "Game controller",
  "rc:13:skater:props": "Skateboard",
  "rc:13:goth:props": "Small item",
  "rc:13:cheer:over": "Pom-poms (raised)",
  "rc:13:band:props": "Sousaphone ring",
  "rc:13:bbqdad:props": "BBQ tongs",
  "rc:13:bbqdad:over": "Spatula and burger (raised)",
  "rc:13:soccermom:props": "Snack box",
  "rc:13:soccermom:over": "Pennant flag (raised)",
  "rc:13:newdad:props": "Baby carrier and bottle",
  "rc:13:newdad:over": "Coffee mug (raised)",
  "rc:13:knitgran:props": "Knitting and yarn ball",
  "rc:13:fishgramps:props": "Tackle box",
  "rc:13:fishgramps:over": "Fishing rod with fish (raised)",
  "rc:14:darklord:props": "Dark armour and sword",
  "rc:14:evilqueen:props": "Small item",
  "rc:14:evilqueen:over": "Dark sceptre (raised)",
  "rc:14:railway:props": "Coiled whip",
  "rc:14:railway:over": "Music note (raised)",
  "rc:14:mobboss:props": "Fur collar and rose",
  "rc:14:catburglar:props": "Gem",
  "rc:14:catburglar:over": "Grappling hook (raised)",
  "rc:14:henchman:props": "Small bag",
  "rc:14:sorcerer:props": "Green flame",
  "rc:14:sorcerer:over": "Skull staff (raised)",
  "rc:14:swindler:props": "Coat full of watches",
  "rc:14:robot:props": "Remote control",
  "rc:15:werewolf:props": "Wolf claws",
  "rc:15:werewolf:over": "Claw marks (raised)",
  "rc:15:ghost:props": "Lantern and ball and chain",
  "rc:15:cyclops:over": "Spiked club (raised)",
  "rc:15:skeleton:over": "Trumpet DOOT (raised)",
  "rc:15:swamp:props": "Swamp reed",
  "rc:15:swamp:over": "Swamp weed (raised)",
  "rc:15:yeti:props": "Yeti fur coat",
  "rc:15:yeti:over": "Snowflakes (raised)",
  "rc:15:goblin:props": "Gold coin",
  "rc:15:goblin:over": "Dropped coins (raised)",
  "rc:15:patchwork:props": "Bone saw",
  "rc:15:imp:props": "Pitchfork",
  "rc:15:fisherman:props": "Fishing rod and bucket",
};
const RC_SLOTS: [string, Prop['group'], string][] = [['hat', 'Head', 'hat / headwear'], ['headBack', 'Head', 'hair or headdress (back)'], ['faceTop', 'Face', 'face piece'], ['behind', 'Back', 'back piece'],
  ['backOver', 'Back', 'back detail'], ['props', 'Held', 'held item'], ['over', 'Held', 'raised item'], ['details', 'Body', 'outfit detail']];
for (const [si, sh] of SHEETS.entries()) for (const c of sh.CAST) for (const [slot, group, what] of RC_SLOTS) if (typeof c[slot] === 'function')
  { const id = `rc:${si + 1}:${c.name}:${slot}`, who = c.label || c.name;   // named props: 'Wolf tail · Werewolf'; others: 'Knight hat / headwear'
    addProp({ id, label: PROP_NAMES[id] ? `${PROP_NAMES[id]} · ${who}` : `${who} ${what}`, group, slot, fn: () => c[slot] }); }
/** group -> props, for the Studio's grouped multi-select */
export const PROP_GROUPS = ['Head', 'Face', 'Back', 'Body', 'Held'].map(g => ({ group: g, props: Object.values(PROPS).filter(p => p.group === g).map(p => ({ id: p.id, label: p.label })) }));
/** Adds the design's props to a spec: each prop's hook is chained after the character's own one in the same slot. */
function withProps(spec: any, d: any) {
  const ids: string[] = (d.props || []).filter((id: string) => PROPS[id]); if (!ids.length) return spec;
  const out = { ...spec }, shape = buildChar({ ...spec }, 0).head || 'rick', body: any[] = [];
  // body items get the torso as top / bot (the rig passes bodyTop / bodyBot)
  const torso = (x: any) => ({ ...x, top: x.top ?? x.bodyTop, bot: x.bot ?? x.bodyBot });
  for (const id of ids) { const p = PROPS[id], fn = p.fn(d, shape);
    if (p.slot === 'details' && spec.outfit) { body.push(fn); continue; }
    const prev = out[p.slot], f = p.slot === 'details' ? (x: any) => fn(torso(x)) : fn;
    out[p.slot] = prev ? (x: any) => [...prev(x), ...f(x)] : f;
    if (p.slot === 'hat' || p.slot === 'faceTop') out.views = out.views ?? true; }
  // a library outfit replaces the body details when it is put on: add ours on top of it afterwards (castkit's dress hook)
  if (body.length) { const prevDress = out.dress;
    out.dress = (S: any) => { prevDress?.(S); const front = S.details, back = S.backDetails;
      S.details = (x: any) => [...(front ? front(x) : []), ...body.flatMap(fn => fn(torso(x)))];
      S.backDetails = (x: any) => [...(back ? back(x) : []), ...body.flatMap(fn => fn(torso(x)))]; }; }
  return out;
}
const ourSpecs = new Map<string, any>();
/** Cache key of the puppet a design draws (sheet character, or our design's mapped fields). */
export function specKey(d: any) {
  return d.rc ? `rc|${d.rc.sheet}|${d.rc.name}|${d.jacket}|${JSON.stringify([d.figure ?? null, d.props ?? null, d.noParts ?? null])}` : 'ours|' + JSON.stringify([d.id, d.jacket, d.hair, d.hairStyle, d.build, d.outfit, d.accessories, d.rcLook, d.figure, d.props]);
}
/** Props a design of OURS already wears through its wardrobe fields (hat, face details, tie, rifle ...). The hat and face
 *  details are drawn with the head; body and held items are added as props. The Studio shows all of them as ticked. */
export function wardrobeProps(d: any): string[] {
  if (d.rc) return [];
  const o = d.outfit || {}, acc: string[] = d.accessories || [], out: string[] = [];
  if (o.hat && o.hat !== 'hair' && OUR_HATS.includes(o.hat)) out.push('our:hat:' + o.hat);
  for (const a of acc) if (PROPS['our:face:' + a]) out.push('our:face:' + a);
  if (d.accessory === 'researcher' || d.accessory === 'archivist') out.push('our:face:glasses');
  if (o.moustache) out.push(o.moustacheStyle === 'bold' ? 'our:face:moustacheBold' : 'our:face:moustache');
  if (o.beard) out.push('our:face:beard');
  for (const k of ['tie', 'scarf', 'badge', 'apron', 'sash']) if (o[k]) out.push('our:body:' + k);
  for (const k of ['rifle', 'sword']) if (o[k]) out.push('our:held:' + k);
  return [...new Set(out)];
}
const sheetOf = (design: any) => { const s = SHEETS[(design.rc?.sheet ?? 0) - 1]?.CAST.find((x: any) => x.name === design.rc?.name); if (!s) throw Error('Unknown Ricks Clips character: ' + JSON.stringify(design.rc)); return s; };
/** The character before figure and props: ours mapped from the wardrobe, or the sheet character minus removed parts. */
function baseSpec(design: any) {
  if (!design.rc) return ricksSpec(design);
  const sheet = sheetOf(design), base: any = { ...sheet };
  // Garment colour edited in the Studio replaces the sheet's coat colour
  if (design.jacket && design.rc?.coat && design.jacket.toLowerCase() !== design.rc.coat.toLowerCase()) base.coat = design.jacket;
  for (const slot of design.noParts || []) delete base[slot];   // own parts the user unticked (tail, shield ...)
  return base;
}
/** A spec's current figure, as the Studio shows it (nearest size steps). */
function currentFigure(spec: any) {
  const S = buildChar({ ...spec }, 0), near = (v: number, t: number[]) => SIZE_STEPS[t.reduce((b, x, i) => Math.abs(x - v) < Math.abs(t[b] - v) ? i : b, 0)];
  return { form: spec.form && !String(spec.form).startsWith('fig_') ? spec.form : 'standard', headShape: S.head || 'rick', headSize: near(S.headK ?? 1.5, HEAD_K),
    bodySize: near(S.sizeK ?? 1, BODY_W), legs: 'L', limbs: near(S.legW ?? 17, LIMB_W), arms: 'L' };
}
const SLOT_OF_PART = Object.fromEntries(RC_SLOTS.map(([slot]) => [slot, slot]));
/** Everything the Studio shows for a character: its real figure values, face category, signature face, and the props it wears. */
export function describeCharacter(design: any) {
  const base = baseSpec(design), fig = { ...currentFigure(base), ...Object.fromEntries(Object.entries(design.figure || {}).filter(([, v]) => v !== 'auto')) };
  const sheet = design.rc ? sheetOf(design) : null, f = sheet?.face;
  const signature = !sheet ? 'Neutral' : Array.isArray(f) ? `${f[0]} · ${f[1]}` : typeof f === 'string' && f !== 'standard' ? f : 'Neutral';
  const ownParts = sheet ? RC_SLOTS.filter(([slot]) => typeof sheet[slot] === 'function' && !(design.noParts || []).includes(slot)).map(([slot]) => `rc:${design.rc.sheet}:${sheet.name}:${slot}`) : wardrobeProps(design);
  return { ...fig, faceCat: faceCatOf(design, sheet ?? undefined), signature, ownParts, partSlots: SLOT_OF_PART };
}
export function rcSpec(design: any) {
  const k = specKey(design); let s = ourSpecs.get(k); if (s) return s;
  if (ourSpecs.size > 300) ourSpecs.clear();
  const base = baseSpec(design);
  // a figure edit starts from the character's current figure, so untouched fields keep their look
  s = design.figure ? withFigure(base, { ...currentFigure(base), ...design.figure }) : base;
  // a character with its own posed arms (holding a shield, a staff ...) keeps them unless the arm length is changed:
  // then the figure's arms, at the chosen length, replace the pose
  if (design.figure?.arms && design.figure.arms !== 'L' && s.arms) { s = { ...s }; delete s.arms; }
  // our body and held wardrobe items (tie, scarf, rifle ...) are props on the puppet; then the props the user added
  const props = [...wardrobeProps(design).filter(id => id.startsWith('our:body:') || id.startsWith('our:held:')), ...(design.props || [])];
  s = withProps(s, { ...design, props: [...new Set(props)] });
  ourSpecs.set(k, s); return s;
}

// ---------- face timeline (deterministic from time + seed, like our rig) ----------
const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
/** Blink: 0 open, 1 closed. About every 3.2-4.6 s, 0.14 s long, plus a blink right after an expression change. */
export function rcBlink(t: number, seed: number, expressionAge?: number) {
  if (expressionAge !== undefined && expressionAge >= 0 && expressionAge < .12) return 1;
  const period = 3.2 + 1.4 * seed, local = ((t + seed * 7) % period + period) % period;
  return local < .14 ? 1 : 0;
}
/** Mouth open for 'talk': syllable-like flaps, about 7 per second with gaps. */
const talkOpen = (t: number, seed: number) => Math.sin(t * 44 + seed * 9) + .6 * Math.sin(t * 17 + seed * 3) > .15;
/** Face key the puppet draws: undefined = own face; otherwise a FACES key (with blink / flap variants). */
function faceKey(expr: string | undefined, blink: number, talking: boolean) {
  if (isOwn(expr)) return blink ? '_blink_standard' : undefined;
  // 'talk' flaps between the open talk mouth and the standard closed one
  if (expr === 'talk') return talking ? (blink ? '_talkblink_standard' : '_talk_standard') : (blink ? '_blink_standard' : 'standard');
  return blink ? '_blink_' + expr : expr;
}

// Still puppet: character centred at x=300, ground y=1010. Painted extents of all 150 (4 views, measured 2026-11-18):
// top -330, x -86..684, bottom 1040. One fixed viewBox keeps a common scale; feet land at y~971 of the 1000 canvas.
const VB = '-117 -340 834 1390';
/** face: a FACES key, or undefined for the character's own face. A blink on a signature (meme) face keeps the meme. */
export function rcSvg(design: any, yaw = 0, face?: string, fam?: any) {
  const [view, dir] = rcView(yaw), spec = rcSpec(design);
  const ownMeme = !face || (face === '_blink_standard' && spec.face && spec.face !== 'standard');
  // fam = a category special face (a meme name or [family, name]) drawn as the whole face
  const S = buildChar(fam ? { ...spec, face: fam } : ownMeme ? spec : { ...spec, face: 'standard' }, 300);
  if (!fam && !ownMeme) S.face = { expr: face };
  S.view = view; S.dir = dir;
  const r = drawSvg(S), body = hasPeg(design) ? pegLeg(r.body) : r.body;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="${VB}"><defs>${r.defs}</defs>${body}</svg>`;
}

// ---------- moves ----------
const modules = new Map<string, any>(), loading = new Set<string>();
function moveOf(id: string): any {
  if (id.endsWith('!bare')) { const m = moveOf(bareOf(id)); return m ? { ...m, bare: true } : undefined; }
  if (OWN_MOVES[id]) return OWN_MOVES[id];
  const s = moveInfo(id); if (!s) return undefined;
  const [file, exp = 'default'] = s.module.split('#'), mod = modules.get(file);
  if (!mod) { const m = MOVE_FILES[file]; if (!m) { if (!loading.has(file)) { loading.add(file); console.error('move file not bundled:', file); } return undefined; } modules.set(file, m); return moveOf(id); }
  const mv = mod[exp], st = mv?.styles.find((x: any) => x.key === s.style);
  return st ? { mv, st } : undefined;
}
const chars = new Map<string, any>();
function charOf(design: any) {
  const spec = rcSpec(design), ck = specKey(design);
  let ch = chars.get(ck); if (!ch) { ch = makeChar(spec.form || 'standard', { spec }); chars.set(ck, ch); }
  return ch;
}
/** One move frame: body + props SVG fragments and the library's own camera. face overrides every pose's face. */
// view: undefined = the move's own authored view; otherwise 'front' | '34' | 'side' | 'back' (the rig redraws the same
// pose in that view: the body, head and face turn; props stay where the move put them).
function moveParts(ch: any, m: any, t: number, face?: string, view?: string) {
  // our own moves build each view themselves (viewPose); library moves are re-viewed by the rig
  const tt = ((t % m.mv.dur) + m.mv.dur) % m.mv.dur, out = m.st.viewPose ? m.st.pose(tt, ch, view ?? 'side') : m.st.pose(tt, ch), poses = Array.isArray(out.poses) ? out.poses : [out];
  if (m.st.viewPose) view = undefined;
  const defs: string[] = [], body = poses.map((P: any, i: number) => {
    // face: a FACES key ('k:' kit face) or 'meme:<name>' (a signature meme face kept through the move)
    const Q = { ...P, ...(face ? { face: face.startsWith('meme:') ? face.slice(5) : 'k:' + face } : {}), ...(view ? { view } : {}), ...(m.bare ? { held: [] } : {}) };
    const r = drawPose(ch, Q), pre = `m${i}_`;
    defs.push(r.defs.replace(/id="([gc]\d+)"/g, (_: string, k: string) => `id="${pre}${k}"`));
    return r.svg.replace(/url\(#([gc]\d+)\)/g, (_: string, k: string) => `url(#${pre}${k})`);
  }).join('');
  const cam = m.st.cam ? m.st.cam(tt, out) : (out.cam ?? 0), camY = out.camY ?? -260, H = out.camH || 1500;
  return { defs: defs.join(''), body, back: m.bare ? '' : out.back || '', front: m.bare ? '' : out.front || '', cam, camY, H };
}

// Frame fitting: the union, over the whole move, of everything drawn (relative to the library's follow camera),
// joined with the library's own window so moves that already fit keep their framing. Scenery bigger than
// SCENERY units (walls, sky, ground strips) may still run off the edge, like a set in a real shot.
const SCENERY = 1600, ASPECT = .6, fits = new Map<string, { x0: number; y0: number; w: number; h: number }>();
let probe: SVGSVGElement | undefined;
function measure(svgInner: string) {
  if (typeof document === 'undefined') return undefined;
  if (!probe) { probe = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); probe.setAttribute('style', 'position:absolute;left:-99999px;top:0;width:10px;height:10px;visibility:hidden'); document.body.append(probe); }
  probe.innerHTML = svgInner;
  let box: number[] | undefined;
  const add = (b: DOMRect) => { if (!b.width && !b.height) return; box = box ? [Math.min(box[0], b.x), Math.min(box[1], b.y), Math.max(box[2], b.x + b.width), Math.max(box[3], b.y + b.height)] : [b.x, b.y, b.x + b.width, b.y + b.height]; };
  for (const el of Array.from(probe.children) as SVGGraphicsElement[]) {
    if (el.tagName === 'defs' || !el.getBBox) continue;
    const b = el.getBBox(), body = el.getAttribute('data-k') === 'body';
    if (body) { add(b); continue; }
    for (const c of Array.from(el.children) as SVGGraphicsElement[]) { if (!c.getBBox) continue; const cb = c.getBBox(); if (cb.width < SCENERY && cb.height < SCENERY) add(cb); }
  }
  probe.innerHTML = '';
  return box;
}
function fitOf(key: string, ch: any, m: any, view?: string) {
  let f = fits.get(key); if (f) return f;
  const N = 24, pad = 30; let u: number[] | undefined, lib: number[] | undefined;
  for (let i = 0; i < N; i++) {
    const p = moveParts(ch, m, m.mv.dur * i / N, undefined, view), W = p.H * ASPECT;
    const L = [-W / 2, p.camY, W / 2, p.camY + p.H];
    lib = lib ? [Math.min(lib[0], L[0]), Math.min(lib[1], L[1]), Math.max(lib[2], L[2]), Math.max(lib[3], L[3])] : L;
    const b = measure(`<g data-k="body">${p.body}</g><g>${p.back}${p.front}</g>`); if (!b) continue;
    const r = [b[0] - p.cam - pad, b[1] - pad, b[2] - p.cam + pad, b[3] + pad];
    u = u ? [Math.min(u[0], r[0]), Math.min(u[1], r[1]), Math.max(u[2], r[2]), Math.max(u[3], r[3])] : r;
  }
  const a = u ? [Math.min(lib![0], u[0]), Math.min(lib![1], u[1]), Math.max(lib![2], u[2]), Math.max(lib![3], u[3])] : lib!;
  let w = a[2] - a[0], h = a[3] - a[1], cx = (a[0] + a[2]) / 2;
  if (w / h > ASPECT) h = w / ASPECT; else w = h * ASPECT;   // grow the short side; the ground line stays at the bottom
  f = { x0: cx - w / 2, y0: a[3] - h, w, h }; fits.set(key, f); return f;
}

/** One move frame as SVG at time t (seconds, looping over the move's length), framed to fit the whole move. */
export function rcMoveSvg(design: any, id: string, t: number, face?: string, view?: string) {
  const m = moveOf(id); if (!m) return undefined;
  const ch = charOf(design), p = moveParts(ch, m, t, face, view), f = fitOf(`${specKey(design)}|${id}|${view ?? 'own'}`, ch, m, view);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="${p.cam + f.x0} ${f.y0} ${f.w} ${f.h}"><defs>${p.defs}</defs>${p.back}${hasPeg(design) ? pegLeg(p.body) : p.body}${p.front}</svg>`;
}

// ---------- drawing ----------
const cache = new Map<string, HTMLImageElement>(), lastShown = new Map<string, HTMLImageElement>();
function image(key: string, svg: () => string | undefined) {
  let img = cache.get(key);
  if (!img) {
    const s = svg(); if (!s) return undefined;
    if (cache.size > 900) cache.delete(cache.keys().next().value!);
    img = new Image(); pending.add(img); const done = () => pending.delete(img!); img.onload = done; img.onerror = done;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); cache.set(key, img);
  }
  return img;
}
// Frame-exact rendering: puppet frames are SVG images that decode asynchronously. A renderer draws, awaits
// puppetSettled(), and draws again until puppetBusy() is false (character-draw.ts settleFrame does exactly that).
const pending = new Set<HTMLImageElement>();
export const puppetBusy = () => pending.size > 0;
export async function puppetSettled() {
  await Promise.all([...pending].map(i => i.decode().catch(() => {}).finally(() => pending.delete(i))));
}
// ---------- turning between the four views ----------
// The puppet has four drawings (front, 3/4, side, back; left = mirrored). Each sits exactly on its own angle; between two
// angles the figure narrows like a body turning (narrowest halfway) and swaps drawing there, so a changing yaw reads as
// a turn instead of a jump. Nothing changes at the anchor angles themselves.
const TURN_ANCHORS = [0, 45, 90, 180, 270, 315, 360];
export function drawCharacter(context: CanvasRenderingContext2D, design: any, pose: any = {}) {
  if (pose.yaw === undefined) return drawView(context, design, pose);
  const y = ((Number(pose.yaw) || 0) % 360 + 360) % 360;
  let i = 0; while (i < TURN_ANCHORS.length - 2 && y >= TURN_ANCHORS[i + 1]) i++;
  const a = TURN_ANCHORS[i], b = TURN_ANCHORS[i + 1], t = (y - a) / (b - a);
  if (t < .03 || t > .97) return drawView(context, design, { ...pose, yaw: (t < .5 ? a : b) % 360 });
  // narrowing in proportion to the angle between the two drawings (front -> 3/4 is a small turn, side -> back a big one);
  // the drawing swaps cleanly at the narrowest point (a cross-fade showed both drawings see-through)
  const narrow = 1 - .42 * ((b - a) / 90) * Math.sin(Math.PI * t);
  context.save();
  context.translate(300, 0); context.scale(narrow, 1); context.translate(-300, 0);   // narrow about the body's centre line
  drawView(context, design, { ...pose, yaw: (t < .5 ? a : b) % 360 });
  context.restore();
}
function drawView(context: CanvasRenderingContext2D, design: any, pose: any = {}) {
  if (!design?.rc && design?.look !== 'ricks') return;
  const action = pose.action && pose.action !== 'idle' && moveInfo(pose.action) ? pose.action : 'idle';
  const t = pose.time ?? 0, micro = pose.micro !== false, seed = hash(design.id || design.rc?.name || 'ours'), expr = pose.expression, sk = specKey(design);
  const age = pose.expressionAge, changed = micro && age !== undefined && age >= 0 && age < .3 && (pose.fromExpression ?? 'own') !== (expr ?? 'own');
  let key: string, img: HTMLImageElement | undefined, flip = false, slotView = '';
  if (action === 'idle') {
    const [view, dir] = rcView(pose.yaw);
    const blink = micro ? rcBlink(t, seed, changed ? age : undefined) : 0, talking = expr === 'talk' && talkOpen(t, seed);
    // face = category x emotion. A Ricks Clips character on 'own' keeps its signature face; with an emotion it uses its
    // own category (a devil gets a sad devil face). Our characters always use their category (male by default).
    const cat = faceCatOf(design), ownSig = !!design.rc && !design.faceCat;
    const fam = view === 'back' ? undefined : famFace(expr);
    let face = view === 'back' || fam ? undefined : faceKey(expr, blink, talking);
    if (view !== 'back' && !fam) face = isOwn(expr) ? (ownSig ? face : catFace(cat, blink ? '_blink_standard' : 'standard')) : catFace(cat, face!);
    key = [sk, 'idle', view, dir, fam ? expr : face ?? 'own'].join('|');
    img = image(key, () => rcSvg(design, pose.yaw, face, fam));
  } else {
    const frame = Math.floor(t * 30);   // 30 fps steps, like the library's renders
    // 'move' = the move's own acting face. Otherwise the chosen face stays on through the move ('own' = the character's
    // own face: its signature meme face, or the standard kit face), and it blinks on the same clock as the idle.
    const blink = micro ? rcBlink(t, seed, changed ? age : undefined) : 0, spec = rcSpec(design);
    const cat = faceCatOf(design, spec), ownSig = !!design.rc && !design.faceCat;
    const meme = ownSig && typeof spec.face === 'string' && MEMES[spec.face] ? spec.face : undefined;
    const emo = isOwn(expr) ? (blink ? '_blink_standard' : 'standard')
      : expr === 'talk' ? (talkOpen(t, seed) ? (blink ? '_talkblink_standard' : '_talk_standard') : (blink ? '_blink_standard' : 'standard'))
      : blink ? '_blink_' + expr : expr;
    // a special face: a single meme face plays through the move; a family face falls back to the category's neutral face
    const fam = famFace(expr);
    const face = expr === 'move' ? undefined : typeof fam === 'string' ? 'meme:' + fam : fam ? catFace(cat, blink ? '_blink_standard' : 'standard')
      : isOwn(expr) && meme ? 'meme:' + meme : catFace(cat, emo);
    // Body direction: the slider picks the view (front, 3/4, side, back); facing left mirrors the whole frame so the
    // move still travels the way the character faces (a walk never turns into a moonwalk).
    const [view, dir] = pose.yaw === undefined ? [undefined, 1] : rcView(pose.yaw); flip = dir < 0; slotView = view ?? 'own';
    key = [sk, action, frame, face ?? 'own', view ?? 'own'].join('|');
    img = image(key, () => rcMoveSvg(design, action, frame / 30, face, view));
  }
  // fallback while a new frame decodes: the last decoded frame of the same move AND view (each atlas cell keeps its own)
  const slot = `${sk}|${action}|${slotView}`;
  if (img?.complete && img.naturalWidth) lastShown.set(slot, img); else img = lastShown.get(slot);
  if (!(img?.complete && img.naturalWidth)) return;
  // Idle life on the whole puppet, anchored at the feet (y=971): breathing stretch, slow sway, expression-change pop.
  let sx = 1, sy = 1, skew = 0;
  if (micro && action === 'idle') {
    const b = .5 - .5 * Math.cos(2 * Math.PI * t / 3.6 + seed * 5.7);
    sy += .008 * b; sx -= .003 * b;
    skew = .006 * Math.sin(2 * Math.PI * t / 5.3 + seed * 3) + .002 * Math.sin(2 * Math.PI * t / 2.3 + seed * 8);
    if (changed) { const k = Math.sin(Math.PI * Math.min(1, age / .3)) * Math.exp(-age * 4); sy -= .045 * k; sx += .03 * k; }
  }
  context.save();
  context.translate(300, 971); context.transform(flip ? -sx : sx, 0, skew, sy, 0, 0); context.translate(-300, -971);
  context.drawImage(img, 0, 0, 600, 1000);
  context.restore();
}
