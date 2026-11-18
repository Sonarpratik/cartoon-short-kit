// BODY FORMS (CB 21:23: "5 unique different body forms ... same like meme"). Same locked rig (char2d.mjs), meme-level proportions.
// Rick refs: pill/bean torso = the clothes, thin dark stick legs with L feet, kids ~half height with the same big head, round old men.
// Each form = settings for drawCharacter in the station-master frame (ground 1010). bodyPts = 8 half-widths at T8 down the torso.
import { INK } from './char2d.mjs';
import { MEMES } from './memes.mjs';
import { FEMALE, BABY, ELDER, BABY_HEAD, hairFor } from './memes2.mjs';

const T8 = [0, .03, .12, .32, .6, .82, .95, 1];
// rows: half-widths (front view). side view: front half = w*sk + belly, back half = w*sk - belly*.3, hunch pushes the top forward
export const prof = (rows, { belly = [0, 0, 0, 0, 0, 0, 0, 0], sk = .8, hunch = 0 } = {}) => ({ cx, bodyTop, bodyBot, side, dir }) => {
  const h = bodyBot - bodyTop, R = [], L = [];
  rows.forEach((w, i) => {
    const t = T8[i], y = bodyTop + t * h;
    if (!side) { R.push([cx + w, y]); L.push([cx - w, y]); return; }
    const off = dir * hunch * (1 - t), fw = w * sk + belly[i], bw = w * sk - belly[i] * .3;
    R.push([cx + off + (dir > 0 ? fw : bw), y]); L.push([cx + off - (dir > 0 ? bw : fw), y]);
  });
  return [...R, [cx, bodyBot + 1], ...L.reverse()];
};
// arms hanging (Rick: hands hang mid-torso). sh = shoulder [dx, dy from bodyTop], hd = hand [dx, dy], bow = outward bulge
const armsGen = (top, sh, hd, bow = 22, sideHd = [16, hd[1]]) => ({ cx, view, dir }) => {
  const one = s => ({ d: `M${cx + s * sh[0]},${top + sh[1]} Q${cx + s * (hd[0] + bow)},${top + (sh[1] + hd[1]) / 2} ${cx + s * hd[0]},${top + hd[1] - 6}`, hand: [cx + s * hd[0], top + hd[1]] });
  if (view === 'side') return { front: { d: `M${cx + dir * 8},${top + sh[1]} Q${cx - dir * 22},${top + (sh[1] + sideHd[1]) / 2} ${cx + dir * sideHd[0]},${top + sideHd[1] - 6}`, hand: [cx + dir * sideHd[0], top + sideHd[1]] } };
  return { front: [one(-1), one(1)] };
};
const withHair = (fn, key, shape) => (cx, hy) => { const M = fn(cx, hy), h = hairFor(key, cx, hy, shape); return { ...M, under: [...(M.under || []), ...h.back], over: [...h.front, ...M.over] }; };
const ln = (d, w = 5.5, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const btn = (x, y, r = 6.5, c = '#f3efe6') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${INK}" stroke-width="3"/>`;

export const FORMS = {
  // 0 the locked station-master proportions, plain coat, for scale
  standard: { label: 'standard (locked)', S: { coat: '#7d8596', legs: '#3b393f', wTop: 72, wBot: 106, bodyTop: 333, bodyBot: 640, face: { expr: 'standard' },
    arms: armsGen(333, [60, 52], [120, 240]),
    details: ({ cx, bodyTop }) => [ln(`M${cx},${bodyTop + 60} L${cx},${bodyTop + 300}`, 4), btn(cx + 12, bodyTop + 120), btn(cx + 12, bodyTop + 180)],
    // back of the coat: collar band, shoulder yoke, centre back seam with a vent at the hem, no buttons
    backDetails: () => [] } },   // CB 2026-11-12 03:38: "if is plain the back need to be plain also no lines" (the yoke and centre seam lines are gone; a costume draws its own back)

  // 1 GIGACHAD: huge V torso, tiny head, and he skipped leg day
  chad: { label: 'gigachad (skipped leg day)', S: { coat: '#2b2d3a', legs: '#3b393f', bodyTop: 300, bodyBot: 650, headK: 1.18, legW: 14, hipW: 10, stance: -6, armW: 24, handR: 20, meme: MEMES.cool,
    bodyPts: prof([0, 96, 168, 176, 128, 92, 74, 40], { belly: [0, 20, 40, 52, 28, 10, 4, 0] }),
    arms: armsGen(300, [130, 50], [214, 262], 46),
    details: ({ cx, bodyTop: t }) => [ln(`M${cx - 120},${t + 96} Q${cx - 60},${t + 136} ${cx - 4},${t + 104}`, 5), ln(`M${cx + 120},${t + 96} Q${cx + 60},${t + 136} ${cx + 4},${t + 104}`, 5), ln(`M${cx},${t + 60} L${cx},${t + 300}`, 4),
      ...[0, 1, 2].flatMap(k => [ln(`M${cx - 44},${t + 168 + k * 46} q22,8 40,0`, 4), ln(`M${cx + 4},${t + 168 + k * 46} q22,8 40,0`, 4)]), ln(`M${cx - 150},${t + 40} q-14,40 -4,70`, 4), ln(`M${cx + 150},${t + 40} q14,40 4,70`, 4),
      `<path d="M${cx - 116},${t + 30} Q${cx - 60},${t + 20} ${cx - 30},${t + 60}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/>`] } },

  // 2 BIG BOI: a ball on two little legs, wide stance
  bigboi: { label: 'big boi', S: { coat: '#d8473c', legs: '#3b393f', bodyTop: 330, bodyBot: 790, legW: 20, hipW: 40, stance: 26, armW: 17, handR: 17, meme: MEMES.hysterical,
    bodyPts: prof([0, 130, 186, 214, 220, 196, 138, 60], { belly: [0, 10, 30, 50, 56, 40, 20, 0] }),
    arms: armsGen(330, [150, 60], [236, 270], 30),
    details: ({ cx, bodyTop: t }) => [...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<rect x="${cx - 240}" y="${t + 40 + k * 50}" width="480" height="20" fill="#fff" opacity=".85"/>`),
      ...[-1, 1].flatMap(s => [`<path d="M${cx + s * 70},${t} L${cx + s * 60},${t + 470}" stroke="#2c4a8a" stroke-width="22"/>`, ln(`M${cx + s * 59},${t} L${cx + s * 49},${t + 470} M${cx + s * 81},${t} L${cx + s * 71},${t + 470}`, 3), btn(cx + s * 66, t + 140, 9, '#e2b13c')])] } },

  // 3 NOODLE: tall thin hoodie kid, endless legs
  noodle: { label: 'noodle', S: { coat: '#5c9a5a', legs: '#2a3550', bodyTop: 160, bodyBot: 560, headK: 1.32, legW: 15, hipW: 9, stance: -10, armW: 13, handR: 13, meme: MEMES.awkward,
    bodyPts: prof([0, 42, 60, 62, 60, 58, 52, 26], { belly: [0, 4, 6, 4, 2, 0, 0, 0] }),
    arms: armsGen(160, [44, 50], [84, 330], 14),
    details: ({ cx, bodyTop: t }) => [ln(`M${cx - 14},${t + 30} q-4,40 2,80`, 3.4), ln(`M${cx + 14},${t + 30} q4,40 -2,80`, 3.4), `<circle cx="${cx - 12}" cy="${t + 112}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${cx + 12}" cy="${t + 112}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
      `<path d="M${cx - 44},${t + 240} L${cx + 44},${t + 240} L${cx + 52},${t + 320} L${cx - 52},${t + 320} Z" fill="#4e8a4d" stroke="${INK}" stroke-width="4"/>`, `<rect x="${cx - 80}" y="${t + 370}" width="160" height="40" fill="#4e8a4d"/>`, ln(`M${cx - 70},${t + 370} L${cx + 70},${t + 370}`, 4)] } },

  // 4 KID: half height, same big head
  kid: { label: 'kid', S: { coat: '#f2c230', legs: '#3b393f', bodyTop: 650, bodyBot: 860, legW: 14, hipW: 9, stance: -12, armW: 13, handR: 13, meme: MEMES.starstruck,
    bodyPts: prof([0, 50, 70, 74, 76, 74, 60, 30], { belly: [0, 6, 12, 16, 16, 10, 4, 0] }),
    arms: armsGen(650, [50, 40], [92, 150], 16),
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx},${t + 52} l9,19 21,3 -15,15 4,21 -19,-10 -19,10 4,-21 -15,-15 21,-3 Z" fill="#e0453a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
      `<rect x="${cx - 100}" y="${t + 158}" width="200" height="70" fill="#3b5fa8"/>`, ln(`M${cx - 80},${t + 158} L${cx + 80},${t + 158}`, 4), ln(`M${cx},${t + 160} L${cx},${t + 214}`, 3)] } },

  // 5 DAD BOD: narrow shoulders, belly drops over the belt
  dad: { label: 'dad bod', S: { coat: '#4c7fc0', legs: '#b9a47a', thighCol: '#b9a47a', bodyTop: 330, bodyBot: 700, legW: 19, hipW: 16, stance: 4, meme: MEMES.tired,
    bodyPts: prof([0, 44, 62, 82, 122, 146, 126, 64], { belly: [0, 0, 6, 24, 60, 70, 40, 0] }),
    arms: armsGen(330, [54, 52], [120, 250], 30),
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx - 20},${t + 6} L${cx - 50},${t + 34} L${cx - 6},${t + 44} Z M${cx + 20},${t + 6} L${cx + 50},${t + 34} L${cx + 6},${t + 44} Z" fill="#6a97d0" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
      ln(`M${cx},${t + 40} L${cx},${t + 96}`, 3.4), btn(cx + 9, t + 58, 5), btn(cx + 9, t + 84, 5),
      `<rect x="${cx - 160}" y="${t + 326}" width="320" height="60" fill="#b9a47a"/>`, `<path d="M${cx - 160},${t + 304} Q${cx},${t + 330} ${cx + 160},${t + 304} L${cx + 160},${t + 326} Q${cx},${t + 352} ${cx - 160},${t + 326} Z" fill="#5a3a24" stroke="${INK}" stroke-width="3.5"/>`,
      `<rect x="${cx - 13}" y="${t + 313}" width="26" height="24" rx="4" fill="#e2b13c" stroke="${INK}" stroke-width="3.5"/>`, ln(`M${cx - 100},${t + 240} q30,12 60,6`, 3), ln(`M${cx - 30},${t + 270} q4,6 0,10`, 3)],
    // back of the shirt (CB 2026-11-11: back clothing is its own design): shoulder yoke, centre pleat, tucked-in tail folds, belt goes all round with loops, no buttons, no buckle, no collar points
    backDetails: ({ cx, bodyTop: t }) => [ln(`M${cx - 70},${t + 56} Q${cx},${t + 72} ${cx + 70},${t + 56}`, 3.4), ln(`M${cx},${t + 64} L${cx},${t + 112}`, 3), ln(`M${cx - 90},${t + 250} q24,30 20,58 M${cx + 90},${t + 250} q-24,30 -20,58 M${cx - 20},${t + 270} q4,20 0,36`, 3),
      `<rect x="${cx - 160}" y="${t + 326}" width="320" height="60" fill="#b9a47a"/>`, `<path d="M${cx - 160},${t + 304} Q${cx},${t + 330} ${cx + 160},${t + 304} L${cx + 160},${t + 326} Q${cx},${t + 352} ${cx - 160},${t + 326} Z" fill="#5a3a24" stroke="${INK}" stroke-width="3.5"/>`,
      ...[-70, 0, 70].map(dx => `<rect x="${cx + dx - 5}" y="${t + 306 + Math.abs(dx) * -.06}" width="10" height="30" rx="2" fill="#6e4a30" stroke="${INK}" stroke-width="2.6"/>`),
      `<path d="M${cx - 96},${t + 352} l60,0 l-4,30 l-52,0 Z M${cx + 36},${t + 352} l60,0 l-4,30 l-52,0 Z" fill="#a8946c" stroke="${INK}" stroke-width="3"/>`] } },

  // 6 LADY: hourglass + flared dress, bob and bun
  lady: { label: 'lady (dress)', S: { coat: '#2f9e96', legs: '#3b393f', bodyTop: 340, bodyBot: 740, head: 'egg', legW: 14, hipW: 10, stance: -8, armW: 13, handR: 13, meme: withHair(FEMALE.sassy, 'bob', 'egg'),
    bodyPts: prof([0, 48, 68, 52, 78, 120, 146, 138], { belly: [0, 8, 18, 6, 10, 20, 24, 20] }),
    arms: armsGen(340, [50, 46], [92, 200], 20),
    details: ({ cx, bodyTop: t }) => [...[...Array(26)].map((_, k) => `<circle cx="${cx - 150 + (k % 6) * 60 + (Math.floor(k / 6) % 2) * 30}" cy="${t + 170 + Math.floor(k / 6) * 52}" r="8" fill="#fff" opacity=".85"/>`),
      `<path d="M${cx - 70},${t + 112} Q${cx},${t + 126} ${cx + 70},${t + 112} L${cx + 70},${t + 140} Q${cx},${t + 154} ${cx - 70},${t + 140} Z" fill="#e8668a" stroke="${INK}" stroke-width="3.5"/>`, `<circle cx="${cx}" cy="${t + 132}" r="10" fill="#e8668a" stroke="${INK}" stroke-width="3.5"/>`,
      ln(`M${cx - 170},${t + 372} ${[...Array(12)].map((_, k) => `q14,16 28,0`).join(' ')}`, 4)],
    // back of the dress: same dots and hem, the belt goes all round and ties in a bow at the back, a zip from the neck to the waist
    backDetails: ({ cx, bodyTop: t }) => [...[...Array(26)].map((_, k) => `<circle cx="${cx - 150 + (k % 6) * 60 + (Math.floor(k / 6) % 2) * 30}" cy="${t + 170 + Math.floor(k / 6) * 52}" r="8" fill="#fff" opacity=".85"/>`),
      ln(`M${cx},${t + 20} L${cx},${t + 112}`, 3), `<rect x="${cx - 4}" y="${t + 20}" width="8" height="12" rx="2" fill="#e2b13c" stroke="${INK}" stroke-width="2"/>`,
      `<path d="M${cx - 70},${t + 112} Q${cx},${t + 126} ${cx + 70},${t + 112} L${cx + 70},${t + 140} Q${cx},${t + 154} ${cx - 70},${t + 140} Z" fill="#e8668a" stroke="${INK}" stroke-width="3.5"/>`,
      `<path d="M${cx},${t + 132} L${cx - 34},${t + 116} L${cx - 34},${t + 150} Z M${cx},${t + 132} L${cx + 34},${t + 116} L${cx + 34},${t + 150} Z" fill="#e8668a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`, `<path d="M${cx - 6},${t + 136} l-10,40 M${cx + 6},${t + 136} l12,38" stroke="#e8668a" stroke-width="9" stroke-linecap="round"/>`, `<circle cx="${cx}" cy="${t + 132}" r="9" fill="#d65579" stroke="${INK}" stroke-width="3"/>`,
      ln(`M${cx - 170},${t + 372} ${[...Array(12)].map((_, k) => `q14,16 28,0`).join(' ')}`, 4)] } },

  // 7 ELDER: short, round-shouldered, hunched, cane
  elder: { label: 'grandpa (hunched)', S: { coat: '#8a6a4c', legs: '#3b393f', bodyTop: 440, bodyBot: 720, head: 'potato', headK: 1.42, legW: 15, hipW: 12, armW: 14, handR: 14, meme: withHair(ELDER.grumpy, 'gramps', 'potato'),
    bodyPts: prof([0, 70, 92, 100, 100, 96, 80, 40], { belly: [0, 0, 10, 14, 12, 6, 0, 0], hunch: 40 }),
    arms: armsGen(440, [74, 40], [128, 180], 24),
    props: ({ cx }) => [`<path d="M${cx + 128},612 L${cx + 140},1004" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${cx + 128},612 L${cx + 140},1004" stroke="#a0703c" stroke-width="6" stroke-linecap="round"/>`, `<path d="M${cx + 128},614 Q${cx + 124},578 ${cx + 100},584 Q${cx + 86},590 ${cx + 92},606" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${cx + 128},614 Q${cx + 124},578 ${cx + 100},584 Q${cx + 86},590 ${cx + 92},606" fill="none" stroke="#a0703c" stroke-width="6" stroke-linecap="round"/>`, `<circle cx="${cx + 128}" cy="620" r="14" fill="${INK}"/>`],
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx - 24},${t} L${cx},${t + 70} L${cx + 24},${t} Z" fill="#f3efe6" stroke="${INK}" stroke-width="3.5"/>`, ln(`M${cx},${t + 70} L${cx},${t + 290}`, 4), ...[0, 1, 2, 3].map(k => btn(cx + 10, t + 100 + k * 44, 6.5, '#d9c7a8')),
      ...[-1, 1].map(s => `<rect x="${cx + s * 58 - 26}" y="${t + 170}" width="52" height="46" rx="6" fill="#7a5c40" stroke="${INK}" stroke-width="3.5"/>`), ...[0, 1, 2, 3, 4, 5].map(k => ln(`M${cx - 110},${t + 250 + k * 6} L${cx + 110},${t + 250 + k * 6}`, 1.6, '#6b4f36'))] } },

  // 8 BABY: tiny onesie blob, stubby legs, curl
  baby: { label: 'baby', S: { coat: '#9fd0ef', legs: '#3b393f', bodyTop: 860, bodyBot: 975, head: BABY_HEAD, headK: 1.06, legW: 13, hipW: 9, stance: -16, armW: 11, handR: 11, meme: withHair(BABY.giggle, 'curl', BABY_HEAD),
    bodyPts: prof([0, 42, 60, 70, 74, 72, 58, 26], { belly: [0, 6, 12, 18, 20, 14, 6, 0] }),
    arms: armsGen(860, [42, 26], [86, 78], 14),
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx},${t + 44} m-8,-4 a6,6 0 0,1 8,-2 a6,6 0 0,1 8,2 q0,8 -8,14 q-8,-6 -8,-14 Z" fill="#f05a78" stroke="${INK}" stroke-width="2.6"/>`, ln(`M${cx - 72},${t + 88} Q${cx},${t + 100} ${cx + 72},${t + 88}`, 3.4), ...[-1, 0, 1].map(s => btn(cx + s * 16, t + 106, 4.5, '#fff'))] } },

  // ===== v2 forms (CB 22:28: toddler, teenager, villains, monsters). Locked forms above unchanged. =====
  // 9 TODDLER: between baby and kid, chubby, wide waddle stance, overalls
  toddler: { label: 'toddler', S: { coat: '#f28c5a', legs: '#3b393f', bodyTop: 790, bodyBot: 930, head: BABY_HEAD, headK: 1.2, legW: 14, hipW: 12, stance: 6, armW: 12, handR: 12, meme: withHair(BABY.curious, 'curl', BABY_HEAD),
    bodyPts: prof([0, 50, 68, 80, 86, 86, 74, 36], { belly: [0, 6, 14, 22, 24, 16, 6, 0] }),
    arms: armsGen(790, [50, 30], [104, 92], 22),
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx - 48},${t + 50} L${cx + 48},${t + 50} L${cx + 56},${t + 150} L${cx - 56},${t + 150} Z" fill="#4f7fc4"/>`, `<rect x="${cx - 120}" y="${t + 96}" width="240" height="60" fill="#4f7fc4"/>`,
      ln(`M${cx - 48},${t + 50} L${cx + 48},${t + 50}`, 3.4), ...[-1, 1].map(s => `<path d="M${cx + s * 40},${t + 54} L${cx + s * 62},${t - 4}" stroke="#4f7fc4" stroke-width="13"/>`), ...[-1, 1].map(s => btn(cx + s * 38, t + 62, 5, '#e2b13c')),
      `<rect x="${cx - 20}" y="${t + 72}" width="40" height="22" rx="4" fill="#3d68aa" stroke="${INK}" stroke-width="3"/>`] } },

  // 10 TEEN: lanky slouch in an oversized hoodie, hands shoved in the pocket
  teen: { label: 'teen (hoodie slouch)', S: { coat: '#8a5cc4', legs: '#3b393f', bodyTop: 350, bodyBot: 650, headK: 1.36, legW: 14, hipW: 9, stance: -12, armW: 13, handR: 13, meme: MEMES.deadInside,
    bodyPts: prof([0, 50, 70, 78, 82, 84, 82, 62], { belly: [0, 4, 8, 10, 10, 8, 4, 0], hunch: 26 }),
    arms: ({ cx, view, dir }) => view === 'side' ? { front: { d: `M${cx + dir * 8},340 Q${cx + dir * 40},480 ${cx + dir * 30},560`, hand: [cx + dir * 30, 566] } }
      : { front: [-1, 1].map(s => ({ d: `M${cx + s * 52},398 Q${cx + s * 96},490 ${cx + s * 46},556`, hand: [cx + s * 40, 560] })) },
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx - 64},${t + 4} Q${cx},${t + 50} ${cx + 64},${t + 4} Q${cx},${t + 26} ${cx - 64},${t + 4} Z" fill="#7448aa" stroke="${INK}" stroke-width="3.5"/>`,
      ln(`M${cx - 14},${t + 30} q-4,44 0,86`, 3.2), ln(`M${cx + 14},${t + 30} q4,44 0,86`, 3.2), `<circle cx="${cx - 13}" cy="${t + 120}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${cx + 13}" cy="${t + 120}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
      `<path d="M${cx - 70},${t + 190} L${cx + 70},${t + 190} L${cx + 58},${t + 248} L${cx - 58},${t + 248} Z" fill="#7448aa" stroke="${INK}" stroke-width="4"/>`, `<rect x="${cx - 120}" y="${t + 270}" width="240" height="50" fill="#7448aa"/>`, ln(`M${cx - 90},${t + 270} L${cx + 90},${t + 270}`, 4)] } },

  // 11 TEEN GIRL: slim, cropped jacket over a pleated skirt
  teengirl: { label: 'teen girl', S: { coat: '#f0f0f4', legs: '#3b393f', bodyTop: 360, bodyBot: 640, head: 'egg', headK: 1.36, legW: 14, hipW: 9, stance: -10, armW: 12, handR: 12, meme: withHair(FEMALE.eyeRoll, 'bob', 'egg'),
    bodyPts: prof([0, 44, 58, 50, 54, 92, 112, 104], { belly: [0, 6, 14, 4, 8, 16, 18, 14] }),
    arms: armsGen(360, [46, 44], [86, 210], 18),
    details: ({ cx, bodyTop: t }) => [`<rect x="${cx - 140}" y="${t}" width="280" height="118" fill="#3f8fd8"/>`, ln(`M${cx - 70},${t + 118} L${cx + 70},${t + 118}`, 4), ln(`M${cx},${t + 30} L${cx},${t + 116}`, 3), ...[-1, 1].map(s => `<path d="M${cx + s * 6},${t + 2} L${cx + s * 40},${t + 52} L${cx + s * 16},${t + 60} Z" fill="#2f74b8" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>`),
      `<rect x="${cx - 160}" y="${t + 150}" width="320" height="160" fill="#c94a5f"/>`, ln(`M${cx - 70},${t + 150} L${cx + 70},${t + 150}`, 4), ...[-60, -30, 0, 30, 60].map(d => ln(`M${cx + d},${t + 156} L${cx + d * 1.6},${t + 290}`, 2.8)),
      ...[0, 1].map(k => `<rect x="${cx - 160}" y="${t + 200 + k * 50}" width="320" height="6" fill="#2a1a1f" opacity=".22"/>`)] } },

  // 12 BRUTE: tiny head, giant hunched shoulders, knuckles nearly drag (ogres, henchmen, monsters)
  brute: { label: 'brute (hunched)', S: { coat: '#6e7a5a', legs: '#3b393f', bodyTop: 310, bodyBot: 700, headK: 1.0, legW: 22, hipW: 34, stance: 34, armW: 28, handR: 26, meme: MEMES.rage,
    bodyPts: prof([0, 150, 206, 196, 160, 136, 116, 60], { belly: [0, 30, 50, 40, 30, 20, 10, 0], hunch: 60 }),
    arms: armsGen(310, [170, 60], [222, 610], 40),
    details: ({ cx, bodyTop: t }) => [`<path d="M${cx - 60},${t + 10} Q${cx},${t + 90} ${cx + 60},${t + 10}" fill="#5a6548" stroke="${INK}" stroke-width="4"/>`, ln(`M${cx - 70},${t + 140} q30,20 60,4 M${cx + 10},${t + 144} q30,16 60,-4`, 4),
      ln(`M${cx - 150},${t + 60} q-10,50 6,90 M${cx + 150},${t + 60} q10,50 -6,90`, 4), `<rect x="${cx - 200}" y="${t + 290}" width="400" height="34" fill="#8a6a3c"/>`, ln(`M${cx - 200},${t + 290} L${cx + 200},${t + 290} M${cx - 200},${t + 324} L${cx + 200},${t + 324}`, 3.4),
      `<path d="M${cx - 130},${t + 324} L${cx + 130},${t + 324} L${cx + 110},${t + 400} L${cx + 60},${t + 370} L${cx},${t + 410} L${cx - 60},${t + 370} L${cx - 110},${t + 400} Z" fill="#7a5a34" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`] } },

  // 13 GHOST: no legs, a floating bell sheet with a wavy hem, arms up "oooOOO"
  ghost: { label: 'ghost (floats, no legs)', S: { coat: '#e9eef6', legs: '#3b393f', bodyTop: 360, bodyBot: 900, noLegs: true, armW: 13, handR: 13, meme: MEMES.terrified,
    bodyPts: ({ cx, bodyTop, bodyBot }) => { const h = bodyBot - bodyTop, W = [0, 60, 84, 96, 116, 140, 162], T = [0, .03, .12, .32, .6, .82, .96];
      const R = W.map((w, i) => [cx + w, bodyTop + T[i] * h]), Lf = W.map((w, i) => [cx - w, bodyTop + T[i] * h]).reverse();
      const hem = [...Array(9)].map((_, k) => [cx + 150 - k * 37.5, bodyBot + (k % 2 ? -34 : 6)]);
      return [...R, ...hem, ...Lf]; },
    arms: armsGen(360, [70, 70], [176, -6], -10),
    details: ({ cx, bodyTop: t, bodyBot: b }) => [...[0, 1, 2].map(k => `<path d="M${cx - 60 + k * 50},${t + 160 + k * 30} q-14,160 ${10 - k * 6},${300 - k * 40}" fill="none" stroke="#b9c3d8" stroke-width="7" stroke-linecap="round"/>`)] } },
};
export const ORDER = ['standard', 'chad', 'bigboi', 'noodle', 'kid', 'dad', 'lady', 'elder', 'baby'];
export const ORDER2 = ['toddler', 'teen', 'teengirl', 'brute', 'ghost'];
// FOUR BODY SIZES on the same body line (first shown as five) (CB 2026-11-12 03:40: "create 5 different size from thin fot fat in the same body line").
// Same bean outline, same height, head, limbs and ink: only the width changes. Shoulders, hands and hips move out with the body so the arms still hang clear of it.
// THREE BODY SIZES (CB 2026-11-12 19:16-19:24 Bangkok, locked "ok lock"): "standard chnage to be thin. , fat is standard. extreme fat is fat/ use only this 3",
// "the body need to be littler longer too, with increse of body size", "now make the head also increase size by porpotion".
// thin = the old standard width, standard = the old fat, fat = the old extreme fat. With each size the body gets longer (legs shorter, feet stay on the ground) and the head bigger.
export const SIZES = { thin: 1, standard: 1.56, fat: 2.05 };                      // body width
export const SIZE_LONG = { thin: 20, standard: 55, fat: 90 };                     // px added to the body length (bodyBot)
export const SIZE_HEAD = { thin: 1.5, standard: 1.62, fat: 1.74 };                // headK (1.5 = the old head)
// Old four-size look, exact, for films already in animation: oldThin, oldStandard, oldFat, oldExtremeFat (width only, old body length and head). extremeFat = fat.
export const SIZES_OLD = { oldThin: .58, oldStandard: 1, oldFat: 1.56, oldExtremeFat: 2.05 };
export function sizeChar(S, size) {
  if (size === 'extremeFat') size = 'fat';
  const isNew = typeof size === 'string' && size in SIZES, k = typeof size === 'number' ? size : isNew ? SIZES[size] : SIZES_OLD[size];
  if (!k) { if (size) throw new Error('no body size ' + size + ' (use thin, standard, fat)'); return S; }
  if (k === 1 && !isNew) return S;
  const top = S.bodyTop ?? 333, wT = (S.wTop ?? 74) * k, wB = (S.wBot ?? 104) * k;
  return { ...S, wTop: wT, wBot: wB, sizeK: k, hipW: (S.hipW ?? 13) * (k < 1 ? .5 + k * .5 : k), stance: (S.stance ?? 0) + (k > 1 ? (k - 1) * 14 : 0),
    ...(isNew ? { bodyBot: (S.bodyBot ?? 640) + SIZE_LONG[size], headK: SIZE_HEAD[size], sizeName: size } : {}),
    arms: castArms(top, (S.bodyBot ?? 640) + (isNew ? SIZE_LONG[size] : 0), [Math.max(34, 60 * k), 52], [wB + 14, 240], 22, 16 * Math.max(.7, Math.min(k, 1.3))) };
}
// CAST SIZE ARMS = the film rig's arms (CB 2026-11-15, Moonrakers era preview: "the side view back arm looks bent backwards", "arm not too close to the head,
// a little space more down", "we had longer arms"). Same numbers as templates/motion_styles/rig.mjs and threejs_film/puppets.mjs:
//   front: shoulders as before, a hanging hand almost at the body's bottom edge (bodyBot - 22)
//   side: shoulder 35 lower (clear of the head), hand at bodyBot - 22
//   3/4: the NEAR arm (screen-left facing right, mirrored facing left) hangs like a real person's: from the near SHOULDER at the body's side (35 below the
//        shoulder line, clear of the head) straight down the SIDE, fist at -.85 W over the outline (CB 2026-11-15: "the arms need to be on the side not on
//        the middle", "think like is a human"; W = body half width, so wide bodies keep it
//        on the side); the FAR arm is drawn behind the body (arms.back), fist just past the far side edge.
// Every arm carries len0 = the OLD hanging-arm length, so the rig and the bridge keep their approved armL (len0 x 1.24) and the film does not change.
const castArms = (top, bot, sh, hd, bow, sideX) => {
  const len0 = Math.hypot(hd[0] - sh[0], hd[1] - sh[1]), hy = bot - 22, SH2 = 35, W = hd[0] - 14;
  const arc = (sx, sy, hx, h2, b) => ({ d: `M${sx},${sy} Q${(sx + hx) / 2 + b},${(sy + h2) / 2} ${hx},${h2 - 6}`, hand: [hx, h2], len0 });
  return ({ cx, view, dir = 1 }) => {
    if (view === 'side') return { front: arc(cx + dir * 8, top + sh[1] + SH2, cx + dir * sideX, hy, -dir * 22) };
    if (view === '34') return { front: arc(cx - dir * sh[0], top + sh[1] + SH2, cx - dir * .85 * W, hy, -dir * .2 * W), back: arc(cx + dir * sh[0], top + sh[1], cx + dir * hd[0], hy, dir * bow) };
    return { front: [-1, 1].map(s => arc(cx + s * sh[0], top + sh[1], cx + s * hd[0], hy, s * bow)) };
  };
};
export const formChar = (name, x, view = 'front', dir = 1) => ({ x, view, dir, ground: 1010, head: 'rick', ...FORMS[name].S, memeDy: 0 });
