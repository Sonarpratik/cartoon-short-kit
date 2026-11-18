// LONG CLOTH OUTFITS (LOCKED by CB 2026-11-12 02:21 Bangkok: "ok lock that in. for long cloth outfit costume").
// Rule (from Rick's "How One Cart Stopped an Entire Army", CB corrections 01:54-02:13):
//  - the ORIGINAL body form is kept exactly (shape, round bottom, outline); the long cloth is its own piece that hangs UNDER / BEHIND the body,
//    in front of the legs (char2d S.skirt, drawn in the back layer). Legs only show below the hem; they are never drawn over the cloth.
//  - standing: the cloth starts at the body's own width and widens a little (A-line) to the hem; own colour, folds, a dark/gold hem band.
//  - sitting front / 3-4 / back: the cloth lies over the lap and hangs well past the knees (longer robes hang longer, never past 60 % of the shin);
//    side: it runs along the thigh, over the round knee, and hangs down in front of the shin.
//  - length follows the form's own legs: knee .32, mid-shin .51, ankle .69 of (ground 1010 - bodyBot).
// Use: formS = { ...FORMS.standard.S, ...COSTUME.doctor }  or  S.skirt = longCloth('robe', 'ankle', S)   or castkit spec.longCloth = { style, length, col, hem }
import { INK } from './char2d.mjs';
const ln = (d, w = 4, c = INK, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>`;
// DOCTOR GOWN: white lab coat, lapels, breast pocket with pens, stethoscope; long white skirt split at the front with two pockets
const doctor = { coat: '#f2f4f6',
  details: ({ cx, bodyTop: t, side, dir }) => side ? [ln(`M${cx},${t + 20} L${cx - dir * 30},${t + 120}`, 3.5), `<rect x="${cx - 18}" y="${t + 130}" width="34" height="30" rx="3" fill="#e3e7ec" stroke="${INK}" stroke-width="3"/>`] : [
    `<path d="M${cx - 6},${t + 4} L${cx - 54},${t + 20} L${cx - 30},${t + 120} L${cx},${t + 150} Z M${cx + 6},${t + 4} L${cx + 54},${t + 20} L${cx + 30},${t + 120} L${cx},${t + 150} Z" fill="#dfe4ea" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
    `<path d="M${cx - 6},${t + 6} L${cx},${t + 150} L${cx + 6},${t + 6} Z" fill="#7fb8d8" stroke="${INK}" stroke-width="3"/>`,
    ln(`M${cx},${t + 150} L${cx},${t + 320}`, 3.5), `<rect x="${cx + 34}" y="${t + 120}" width="44" height="40" rx="4" fill="#e7ebf0" stroke="${INK}" stroke-width="3"/>`,
    `<rect x="${cx + 42}" y="${t + 100}" width="7" height="30" rx="3" fill="#2f6fd0" stroke="${INK}" stroke-width="2.5"/>`, `<rect x="${cx + 56}" y="${t + 104}" width="7" height="26" rx="3" fill="#d04a3f" stroke="${INK}" stroke-width="2.5"/>`,
    ln(`M${cx - 40},${t + 24} Q${cx - 70},${t + 150} ${cx - 20},${t + 190}`, 5, '#3a3f48'), ln(`M${cx + 40},${t + 24} Q${cx + 20},${t + 120} ${cx - 10},${t + 190}`, 5, '#3a3f48'), `<circle cx="${cx - 16}" cy="${t + 200}" r="14" fill="#c9ced6" stroke="${INK}" stroke-width="3.5"/>`],
  backDetails: ({ cx, bodyTop: t }) => [ln(`M${cx - 50},${t + 22} Q${cx},${t + 40} ${cx + 50},${t + 22}`, 4), ln(`M${cx},${t + 40} L${cx},${t + 320}`, 3), ln(`M${cx - 60},${t + 230} L${cx + 60},${t + 230}`, 3.5), `<circle cx="${cx - 40}" cy="${t + 230}" r="6" fill="#e3e7ec" stroke="${INK}" stroke-width="2.5"/>`, `<circle cx="${cx + 40}" cy="${t + 230}" r="6" fill="#e3e7ec" stroke="${INK}" stroke-width="2.5"/>`],
  skirt: { len: 200, flare: 1.14, col: '#f2f4f6', hem: '#d9dee5', hemW: 14, folds: 2,
    pattern: ({ cx, y0, view, bent, side, dir }) => side ? [] : view === 'back' ? [ln(`M${cx},${y0 + 40} L${cx},${y0 + 600}`, 4), `<path d="M${cx},${y0 + 230} L${cx - 14},${y0 + 600} L${cx + 14},${y0 + 600} Z" fill="#cfd5dd"/>`] : [
      `<path d="M${cx},${y0 + 60} L${cx - 26},${y0 + 600} L${cx + 26},${y0 + 600} Z" fill="#9aa6b6" opacity=".55"/>`, ln(`M${cx - 4},${y0 + 60} L${cx - 26},${y0 + 600}`, 4), ln(`M${cx + 4},${y0 + 60} L${cx + 26},${y0 + 600}`, 4),
      ...[-1, 1].map(s => `<path d="M${cx + s * 40},${y0 + 150} L${cx + s * 96},${y0 + 150} L${cx + s * 92},${y0 + 200} L${cx + s * 44},${y0 + 200} Z" fill="#e3e7ec" stroke="${INK}" stroke-width="3"/>`)] } };
// KNIGHT: steel breastplate with rivets and a gorget; long red tabard with a gold cross hanging under it, mail showing at the sides
const knight = { coat: '#b4bdc8',
  details: ({ cx, bodyTop: t, side, dir }) => [`<path d="M${cx - 70},${t + 4} Q${cx},${t + 50} ${cx + 70},${t + 4} L${cx + 70},${t + 40} Q${cx},${t + 86} ${cx - 70},${t + 40} Z" fill="#8f9aa8" stroke="${INK}" stroke-width="3.5"/>`,
    ...(side ? [] : [ln(`M${cx},${t + 80} L${cx},${t + 290}`, 4), ln(`M${cx - 90},${t + 190} Q${cx},${t + 230} ${cx + 90},${t + 190}`, 3.5), ln(`M${cx - 100},${t + 250} Q${cx},${t + 290} ${cx + 100},${t + 250}`, 3.5)]),
    `<path d="M${cx - 40},${t + 90} Q${cx - 30},${t + 170} ${cx - 10},${t + 180}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10" stroke-linecap="round"/>`,
    ...[[-50, 120], [50, 120], [-60, 220], [60, 220]].map(([x, y]) => `<circle cx="${cx + x}" cy="${t + y}" r="6" fill="#e9edf2" stroke="${INK}" stroke-width="2.5"/>`)],
  backDetails: ({ cx, bodyTop: t }) => [`<path d="M${cx - 70},${t + 4} Q${cx},${t + 50} ${cx + 70},${t + 4} L${cx + 70},${t + 40} Q${cx},${t + 86} ${cx - 70},${t + 40} Z" fill="#8f9aa8" stroke="${INK}" stroke-width="3.5"/>`, ln(`M${cx},${t + 80} L${cx},${t + 300}`, 4), ln(`M${cx - 90},${t + 200} Q${cx},${t + 236} ${cx + 90},${t + 200}`, 3.5)],
  skirt: { len: 150, flare: 1.12, col: '#b8262e', hem: '#e2b13c', hemW: 22, folds: 2,
    pattern: ({ cx, y0, side, dir }) => [...(side ? [] : [`<path d="M${cx - 14},${y0 + 140} L${cx + 14},${y0 + 140} L${cx + 14},${y0 + 200} L${cx + 50},${y0 + 200} L${cx + 50},${y0 + 228} L${cx + 14},${y0 + 228} L${cx + 14},${y0 + 320} L${cx - 14},${y0 + 320} L${cx - 14},${y0 + 228} L${cx - 50},${y0 + 228} L${cx - 50},${y0 + 200} L${cx - 14},${y0 + 200} Z" fill="#e2b13c" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`])] } };
// EMPEROR: gold robe with a crossed red collar, round dragon emblem and jade belt; long red under-robe to the ankles with a wide gold wave hem
const emperor = { coat: '#e9b93a',
  details: ({ cx, bodyTop: t, side, dir }) => side ? [`<path d="M${cx - dir * 10},${t + 6} L${cx + dir * 30},${t + 150}" stroke="#b8262e" stroke-width="22" fill="none"/>`, `<rect x="${cx - 140}" y="${t + 268}" width="280" height="26" fill="#2f8f6a" stroke="${INK}" stroke-width="3.5"/>`] : [
    `<path d="M${cx - 50},${t + 10} L${cx + 40},${t + 170}" stroke="#b8262e" stroke-width="24" fill="none"/>`, `<path d="M${cx + 50},${t + 10} L${cx + 10},${t + 80}" stroke="#b8262e" stroke-width="24" fill="none"/>`,
    ln(`M${cx - 62},${t + 4} L${cx + 30},${t + 176} M${cx - 38},${t + 14} L${cx + 52},${t + 166}`, 3),
    `<circle cx="${cx - 30}" cy="${t + 210}" r="40" fill="#b8262e" stroke="${INK}" stroke-width="3.5"/>`, ln(`M${cx - 54},${t + 214} Q${cx - 40},${t + 190} ${cx - 28},${t + 214} Q${cx - 16},${t + 236} ${cx - 4},${t + 206}`, 5, '#f3d27a'),
    `<rect x="${cx - 140}" y="${t + 268}" width="280" height="26" fill="#2f8f6a" stroke="${INK}" stroke-width="3.5"/>`, `<rect x="${cx - 18}" y="${t + 264}" width="36" height="34" rx="6" fill="#7fd0b0" stroke="${INK}" stroke-width="3"/>`],
  backDetails: ({ cx, bodyTop: t }) => [`<path d="M${cx - 60},${t + 14} Q${cx},${t + 44} ${cx + 60},${t + 14}" stroke="#b8262e" stroke-width="22" fill="none"/>`, `<circle cx="${cx}" cy="${t + 170}" r="62" fill="#b8262e" stroke="${INK}" stroke-width="3.5"/>`, ln(`M${cx - 36},${t + 176} Q${cx - 18},${t + 140} ${cx},${t + 176} Q${cx + 18},${t + 206} ${cx + 36},${t + 164}`, 6, '#f3d27a'), `<rect x="${cx - 140}" y="${t + 268}" width="280" height="26" fill="#2f8f6a" stroke="${INK}" stroke-width="3.5"/>`],
  skirt: { len: 255, flare: 1.3, col: '#b8262e', hem: '#e9b93a', hemW: 46, folds: 4,
    pattern: ({ cx, y0 }) => [0, 1].map(k => `<path d="M${cx - 320},${y0 + 286 - k * 26} ${[...Array(22)].map(() => 'q15,-18 30,0').join(' ')}" fill="none" stroke="#f3d27a" stroke-width="5" opacity=".9"/>`) } };

// full costumes for the standard-shaped forms (body colour + front/back details + long cloth)
export const COSTUME = { doctor, knight, emperor };
// long cloth styles on their own (any form): gown = white split lab-coat skirt, tabard = red with gold cross, robe = red to the ankles with gold waves
export const CLOTH = { gown: doctor.skirt, tabard: knight.skirt, robe: emperor.skirt, plain: { flare: 1.2, folds: 3 } };
export const LENGTH = { knee: .32, midshin: .51, ankle: .69 };
export const longCloth = (style = 'plain', length = 'midshin', S = {}, over = {}) => ({ ...CLOTH[style], len: Math.round((1010 - (S.bodyBot ?? 640)) * (LENGTH[length] ?? length)), ...over });
