// Episode cast: ARMOR WHERE NOBODY SHOT (armor-no-holes), character-artist 2026-11-13.
// Built ONLY from the locked kit: three body sizes (spec.size), the 500-outfit library (outfit_lib dress through spec.outfit),
// hair + hats (hair_lib / head_wear wear), flying caps (head_gear withGear), face gear (face_gear withFace). No drawing code in this file.
// Story: a wartime bomber airfield, early 1940s, no place, no real unit. Palette from LOOK_BIBLE.md: warm olive, khaki, oiled brown, brass;
// the Mathematician is the ONLY cool slate grey; RED is ONLY the three pins in his left lapel; team mark = a yellow boomerang on a blue disc.
// EPISODE RECIPES: each outfit below is the library outfit named in its comment with its part list re-ordered from library PARTS only
// (dress(S, recipe, pal) takes a recipe object). Reason: the library recipes carry fixed reds and blues (wine tie, red badge, blue pocket,
// red and green medal ribbons) that this film's palette forbids. If the lead wants them as named library outfits, that is a library add (lead's OK).
import { shade, tint } from '../castkit.mjs';
import { OUTFITS, dress } from '../outfit_lib.mjs';
import { wear, HATS2 } from '../head_wear.mjs';
import { withGear } from '../head_gear.mjs';
import { withFace } from '../face_gear.mjs';
export const TITLE = 'Armor Where Nobody Shot: episode cast v1 (library dressed, early 1940s airfield)';

// ---- palette (LOOK_BIBLE.md "Palette"; each colour names the scene colour it comes from)
const SLATE = '#7b8794', SLATED = '#636e7c';          // the one cool grey in the film (the Mathematician only)
const PIN = '#d6262b';                                // THE red: the map pins and the three lapel pins, nothing else
const OLIVE = '#6f733c', OLIVED = '#55592e', OLIVEF = '#8d8f5e';   // aircraft olive drab; dark olive (trousers, caps); sun-faded olive
const KHAKI = '#b7a36b', TAN = '#cdb98c';             // khaki drill; tan shirts
const BROWN = '#6e4a2c', BROWND = '#4a2f1a', LEATHER = '#6e4527', RUSSET = '#7e5537';   // oiled brown: leather, belts, flying jackets
const OFFICER = '#6a5c3a';                            // olive-brown officer cloth
const BRASS = '#c9a13a', MUSTARD = '#c79a2c';         // brass fittings; the Mathematician's mustard tie (brass family)
const CHALK = '#f4f2ec', WHITE = '#f4f2ec', FLEECE = '#e8dcc0', CORD = '#efe6cf';
const TEAMB = '#2f5fa8', TEAMY = '#f2c230';           // team mark: yellow boomerang on a blue disc (banner, tail fins)
const DARK = '#2e2228';

// ---- episode recipes: library outfit + library parts only
const R = (base, parts, extra = {}) => ({ ...OUTFITS[base], key: base + '_armor', parts, ...extra });
// team patch = library badge 'circle' (blue disc) + library badge 'bolt' (the yellow bent mark; the library has no boomerang emblem and its 'moon' draws as a line), same spot
const team = (u, v, r = 17) => [['badge', 'circle', TEAMB, u, v, r], ['badge', 'bolt', TEAMY, u, v, r * .74]];
// SIGNATURE, the Mathematician: exactly three red glass-head pins in a row in his LEFT lapel (his left = screen right in the front view)
const pins3 = [['badge', 'circle', PIN, .28, .2, 8.5], ['badge', 'circle', PIN, .345, .28, 8.5], ['badge', 'circle', PIN, .41, .36, 8.5]];
// SIGNATURE, the Crew Chief: a white chalk handprint on his RIGHT hip (his right = screen left in the front view): palm, four fingers, thumb
const handprint = [['badge', 'circle', CHALK, -.55, .9, 17], ['badge', 'circle', CHALK, -.76, .79, 7], ['badge', 'circle', CHALK, -.635, .755, 7.6], ['badge', 'circle', CHALK, -.505, .755, 7.6], ['badge', 'circle', CHALK, -.38, .79, 7], ['badge', 'circle', CHALK, -.3, .9, 7]];

// threePiece: slate suit with a fine chalk stripe (library part 'pin', as on the library pinstripe suit) and waistcoat, white shirt, mustard tie, white pocket square; no wine tie, no watch chain (the pins are his only ornament)
const SUIT = R('threePiece', [['pin', '#ffffff', 11, .3], ['vest', 'b', .02, .3], ['lapels', 'a', WHITE, 'tie', 'c'], ['buttons', 3, DARK, .62, .84], ['pocket', .56, .44, { c: tint(SLATE, .14), st: WHITE, hankie: WHITE }], ...pins3, ['seams']]);
// mechanic: olive coverall, tan undershirt at the neck, brass zip, flap pocket, team patch, oiled leather belt, the chalk handprint
const COVERALL = R('mechanic', [['crew', 'b'], ['shirtCollar', 'a'], ['zip', 'c', .24], ...team(-.5, .38), ['pocket', .5, .34, { c: tint(OLIVE, .14), st: KHAKI, flap: 1, btn: BRASS }], ['belt', BROWN, 'sq', .64, 'c'], ...handprint]);
// workShirt: khaki shirt, olive trousers, flap pocket, team patch, leather tool belt with pouches
const WORKSHIRT = R('workShirt', [['low', 'b', .74], ['buttons', 4, BROWN, .3, .64], ['shirtCollar', 'a'], ['pocket', .45, .36, { c: shade(KHAKI, .9), st: BROWN, flap: 1, btn: BROWN }], ...team(-.45, .42, 14), ['toolBelt', 'c', .7]]);
// factory: faded olive shirt, oiled-brown bib front with brass buttons, khaki neckerchief (never red)
const BIB = R('factory', [['shirtCollar', tint(OLIVEF, .16)], ['bib', 'b', BRASS], ['kerchief', 'c']]);
// airForce: olive-brown officer jacket over a tan shirt, dark tie, brass buttons, shoulder straps, two flap pockets, cloth belt. No rank, no ribbons, no badge.
const TUNIC = R('airForce', [['lapels', 'a', TAN, 'tie', OLIVED], ['pocket', -.52, .4, { c: tint(OFFICER, .12), st: KHAKI, flap: 1, btn: BRASS }], ['pocket', .52, .4, { c: tint(OFFICER, .12), st: KHAKI, flap: 1, btn: BRASS }], ['buttons', 3, 'b', .64, .9], ['epaulettes', 'c'], ['belt', shade(OFFICER, .86), 'sq', .78, 'b'], ['seams']], { metal: 1 });
// ww2Soldier: pale tan shirt and dark brown tie, two flap pockets, olive-brown trousers, leather belt; no helmet, no webbing, no weapon.
// (officers = the tan and brown family, ground crew = the olive and khaki family, flyers = leather, the hero = slate: who belongs to whom reads by colour)
// SIGNATURE, the Adjutant: the pale pencil cord looped from his shirt front into his LEFT breast pocket (library part 'chain')
const CLERK = R('ww2Soldier', [['low', 'b', .8], ['shirtCollar', 'a'], ['tie', BROWND], ['pocket', .5, .36, { c: shade(TAN, .9), st: BROWN, flap: 1, btn: BROWN }], ['pocket', -.5, .36, { c: shade(TAN, .9), st: BROWN, flap: 1, btn: BROWN }], ['chain', CORD, .2, .5], ['belt', 'c', 'sq', .72, BRASS]]);
// bomberPilot: leather flying jacket with a fleece collar, brass zip, flap pockets, team patch in place of the library's red disc; harness = library 'straps' (parachute webbing)
const FLYJ = harness => R('bomberPilot', [['furCollar', 'b', false], ['zip', BRASS, .2], ['pocket', -.5, .56, { c: RUSSET, flap: 1 }], ['pocket', .5, .56, { c: RUSSET, flap: 1 }], ...team(.5, .38), ...(harness ? [['straps', KHAKI]] : []), ['hem', BROWND, .1]]);
// bomber: cloth flight jacket with a knit collar and hem, brass zip, flap pocket, team patch
const BOMBJ = R('bomber', [['zip', BRASS, .14], ['crew', 'c'], ['pocket', -.48, .38, { c: shade(OLIVE, .9), st: KHAKI, flap: 1, btn: BRASS }], ...team(.46, .38, 12), ['hem', 'c', .1]]);

// the library fedora carries a small red feather with no colour option; RED belongs to the pins only, so this film wears the same locked fedora without the feather
const fedora = Object.assign(PP => HATS2.fedora(PP).filter(s => !(typeof s === 'string' && s.includes('l6,-30 l12,4 l-6,26'))), HATS2.fedora);

// castkit's spec.outfit hook takes library keys; an episode recipe goes through its spec.dress hook ("own recipes"), the same dress() call
const base = ({ outfit, outfitPal, ...spec }) => ({ form: 'standard', face: 'standard', views: true, ...spec, dress: S => dress(S, outfit, outfitPal || {}) });
const S = (spec, hair, h = {}, face) => { const s = wear(base(spec), hair, h); return face ? withFace(s, face) : s; };
const G = (spec, hair, h = {}, face) => { const s = withGear(base(spec), hair, h); return face ? withFace(s, face) : s; };

// CHAR_ARM_001 THE MATHEMATICIAN (hero, thin): original design, no likeness of any real person.
const MATH = { size: 'thin', outfit: SUIT, outfitPal: { a: SLATE, b: SLATED, c: MUSTARD } }, SANDY = '#c9a769';
const CHIEFH = '#3a2a22', GINGER = '#c8642a', CURL = '#a9773f', GREY = '#b9b4ac', IRON = '#5a5458', SILVER = '#aeaaa6', SILVERL = '#c4c0bb', BLACKH = '#2c2428';

const CHIEF_BUZZ = { sd: { front: -168, nape: 140, inner: [[-62, 48], [-76, 24], [-80, 0], [-80, -20]] } };   // side hairline only; the back view keeps the library default (template v12: the head fully covered by its hair)
export const CAST = [
  S({ name: 'mathematician', label: 'The Mathematician', ...MATH }, 'sidePart', { col: SANDY, hat: fedora, hatCol: SLATED }, { acc: ['roundGlasses'], col: SANDY }),
  // approved variant: hat off (it hangs on the drawing's corner pin in the hangar)
  S({ name: 'mathematician_bare', label: 'The Mathematician (hat off, hangar)', ...MATH }, 'sidePart', { col: SANDY }, { acc: ['roundGlasses'], col: SANDY }),
  // CHAR_ARM_002 THE CREW CHIEF (the mocker, fat): cap pushed back, ginger handlebar above the mouth, chalk handprint on the right hip.
  // Lead's note 2026-11-13 (storyboard v2): in side and back view the buzz cut must NOT fill the head like a black helmet. hair_lib's own override hook (opts.over: sd = side hairline) keeps the library buzz and its front view, and draws the profile with the FACE OPEN: a thin band of short hair round the back of the head below the cap;
  // The back view is the library's own (template v12, locked: from behind the head is fully covered by its hair below the cap).
  S({ name: 'chief', label: 'The Crew Chief', size: 'fat', outfit: COVERALL, outfitPal: { a: OLIVE, b: TAN, c: BRASS } }, 'buzz', { col: CHIEFH, hat: 'capBack', hatCol: OLIVED, over: CHIEF_BUZZ }, { stache: 'handlebar', col: GINGER }),
  // CHAR_ARM_003 RIVETS (ground crew, thin): olive fatigue hat (library bucket hat, the period mechanics' "Daisy Mae"), curls, freckles
  S({ name: 'rivets', label: 'Rivets', size: 'thin', outfit: WORKSHIRT, outfitPal: { a: KHAKI, b: OLIVED, c: BROWN } }, 'curlyCrop', { col: CURL, hat: 'bucket', hatCol: OLIVE }, { acc: ['freckles'], col: CURL }),
  // CHAR_ARM_004 LADDER (ground crew, standard): bald with grey side tufts, a straw in the corner of his mouth
  S({ name: 'ladder', label: 'Ladder', size: 'standard', outfit: BIB, outfitPal: { a: OLIVEF, b: BROWN, c: KHAKI } }, 'baldTufts', { col: GREY }, { acc: ['wheat'], col: GREY }),
  // CHAR_ARM_005 THE COLONEL (officer, standard): peaked service cap (library police cap in olive-brown), silver slicked-back hair, a WIDE pale-grey bushy moustache, beauty spot.
  // Lead's note 2026-11-13: never a small dark clipped moustache under the peaked cap (too close to a real dictator's look). The library walrus was tried and hides the mouth, so the wide grey 'bushy' is used.
  S({ name: 'colonel', label: 'The Colonel', size: 'standard', outfit: TUNIC, outfitPal: { a: OFFICER, b: BRASS, c: OFFICER } }, 'slickBack', { col: SILVER, hat: 'police', hatCol: OFFICER }, { stache: 'bushy', acc: ['mole'], col: SILVERL }),
  // approved variant: cap in hand at the tally board (B7)
  S({ name: 'colonel_bare', label: 'The Colonel (cap off, tally board)', size: 'standard', outfit: TUNIC, outfitPal: { a: OFFICER, b: BRASS, c: OFFICER } }, 'slickBack', { col: SILVER }, { stache: 'bushy', acc: ['mole'], col: SILVERL }),
  // CHAR_ARM_006 THE ADJUTANT (officer's clerk, thin): black bowl cut with a cowlick, tan shirt and tie, the pencil cord
  S({ name: 'adjutant', label: 'The Adjutant', size: 'thin', outfit: CLERK, outfitPal: { a: TAN, b: OFFICER, c: BROWN } }, 'cowlick', { col: BLACKH }),
  // THE FLYERS (background, 8): leather and cloth flying jackets, fleece collars, flying caps with goggles or bare heads, some in parachute webbing
  G({ name: 'flyer1', label: 'Flyer 1', size: 'standard', outfit: FLYJ(true), outfitPal: { a: LEATHER, b: FLEECE } }, 'buzz', { col: '#4a3626', helmet: 'pilot' }),
  S({ name: 'flyer2', label: 'Flyer 2', size: 'fat', outfit: FLYJ(false), outfitPal: { a: RUSSET, b: FLEECE } }, 'sidePart', { col: '#5a4030' }, { beard: 'short', col: '#5a4030' }),
  G({ name: 'flyer3', label: 'Flyer 3', size: 'thin', outfit: BOMBJ, outfitPal: { a: OLIVE, c: BROWND } }, 'curlyCrop', { col: '#2e2420', helmet: 'pilot' }),
  S({ name: 'flyer4', label: 'Flyer 4', size: 'standard', outfit: FLYJ(true), outfitPal: { a: BROWND, b: '#d9c9a4' } }, 'slickBack', { col: '#2e2420' }),
  G({ name: 'flyer5', label: 'Flyer 5', size: 'fat', outfit: BOMBJ, outfitPal: { a: OLIVED, c: BROWN } }, 'buzz', { col: '#8a6a3c', helmet: 'pilot' }),
  S({ name: 'flyer6', label: 'Flyer 6', size: 'standard', outfit: FLYJ(false), outfitPal: { a: LEATHER, b: FLEECE } }, 'flattop', { col: '#c9a769' }, { beard: 'stubble', col: '#8a7a5a' }),
  G({ name: 'flyer7', label: 'Flyer 7', size: 'standard', outfit: FLYJ(false), outfitPal: { a: RUSSET, b: '#d9c9a4' } }, 'sidePart', { col: '#3a2a22', helmet: 'pilot' }),
  S({ name: 'flyer8', label: 'Flyer 8', size: 'thin', outfit: FLYJ(true), outfitPal: { a: BROWND, b: FLEECE } }, 'curlyCrop', { col: '#7a4a2a' }),
];
