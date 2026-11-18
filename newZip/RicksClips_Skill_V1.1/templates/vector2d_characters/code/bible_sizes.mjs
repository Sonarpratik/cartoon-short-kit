// CHARACTER BIBLE IN THE THREE LOCKED BODY SIZES (CB 2026-11-12 19:24 Bangkok lock; 20:29 "update for all asset chracter bible with the new").
// The 150-character cast (sheets/sheet01-15.mjs) was drawn on the old body forms. bibleSpec(spec) moves every grown-up male body onto the
// standard body in one of the three sizes; story forms (lady, kid, elder, baby, toddler, teen, teengirl, ghost) stay as they are.
// The sheet files are NOT changed, so films already in animation keep their cast. New films: import { bibleCast } from './bible_sizes.mjs'.
// Mapping (mostly standard and fat, CB 2026-11-12): noodle -> thin, standard -> standard, dad -> standard, chad -> fat, bigboi -> fat, brute -> fat.
export const FORM_SIZE = { noodle: 'thin', standard: 'standard', dad: 'standard', chad: 'fat', bigboi: 'fat', brute: 'fat' };
export const BIBLE_OVERRIDE = {};   // name -> size, where a character reads better in another size
export function bibleSpec(spec) {
  const f = spec.form || 'standard';
  if (spec.size || !(f in FORM_SIZE)) return spec;
  return { ...spec, form: 'standard', size: BIBLE_OVERRIDE[spec.name] || FORM_SIZE[f], bibleFrom: f };
}
const SHEETS = {};
export async function bibleCast(n) { const k = String(n).padStart(2, '0'); if (!SHEETS[k]) SHEETS[k] = (await import(`./sheets/sheet${k}.mjs`)).CAST.map(bibleSpec); return SHEETS[k]; }
export async function bibleChar(name) { for (let i = 1; i <= 15; i++) { const c = (await bibleCast(i)).find(s => s.name === name); if (c) return c; } throw new Error('no cast member ' + name); }
