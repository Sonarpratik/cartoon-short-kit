# CHARACTER VIEW RULES (locked)

CB approved view sheet v5 on 2026-11-10 03:32: "now is fully correct. you should make a rule. so it not get mess up".
The approved sheet is `views_golden/APPROVED_character_views_v5.png`. These rules apply to every character of the vector2d cast, in every film.
Changing a rule or an approved picture needs CB's OK.

## The four views

A character is always shown as a full, unsquashed card in one of four drawn views. The view is picked from the camera angle (act key `look` in film.json, `tools/film_plan.py apply_looks`). A card is never squashed, stretched or foreshortened to fake a turn.

1. **Front** = the locked look of the cast. Nothing changes here.

2. **3/4 = the front view, with only the face parts moved to the side.**
   Head shape, hair, hat, ears, body, arms and legs are EXACTLY as in the front view. Only the eyes, the brows and the mouth (with what sits on the face around them: moustache, muzzle, nose) shift toward the side the character looks at.
   This holds for everyone, women too: a woman's 3/4 keeps her front hair.
   CB: "the 3/4 view is face body front same as front view. just the eye mouth eyebrow point to the side" and "women head is front so dont make the hair side".

3. **Side = a real profile, and the hair is still there.**
   - The hair covers the back of the head and follows the head's own edge. No gap between hair and head, and nobody who has hair in the front view is bald from the side.
   - The hair reaches only as far down as the front and back views show it. Example: the signalman's grey hair stops half way down his head in all views.
   - Women with bob hair: the hair wraps round the back of the head and leaves the face open, with the bun on top (this is the shape first drawn for 3/4; CB: "side view you should make the hair like is 3/4 now").
   - Hat brims and muzzles point the way the character looks. Raised hands go forward.

4. **Back** = the hair covers the head. Face parts (moustache, beard) go under the head so only ends that stick out past it show. Hats and coats are drawn from behind.

5. **The hair must agree in all four views**: same colour, same length, same amount. Check a new character's four views side by side for this before it is used.

## Mistakes already made (do not repeat)

- Turned the whole head and hair in 3/4. Wrong: only the face parts move.
- Gave women the turned hair in 3/4. Wrong: their head is front, so the hair is front.
- Signalman side view: a gap between hair and the back of the head, then hair down to the neck while front and back show it half way. Wrong both times.
- A `//` comment in the middle of a patched .mjs line swallowed the rest of the line and removed every face.

## The guard

`node tools/check_views.mjs` draws the reference characters (stationmaster, inspector, lady, dad, Jack) in all four views and compares each tile with the approved pictures in `views_golden/`. It must say PASS:
- after any change to `char2d.mjs`, `castkit.mjs`, `cast.mjs`, `memes*.mjs`, `bodies.mjs`, `templates/threejs_film/puppets.mjs` or `poses.mjs`;
- before an animatic or a film is rendered.

If it fails, undo the change that altered the view. If the change is wanted, show CB the new sheet (`views_golden/_last_sheet.png`) and run `node tools/check_views.mjs --update` only after his OK.

## A new character

1. Draw its four views: `node tools/check_views.mjs --add cast:<name> [--sheet episodes/<ep>/cast/sheets/<file>.mjs]`.
2. Check `views_golden/_added_sheet.png` by eye against rules 2 to 5.
3. Show CB the sheet. After his OK add the character to `views_golden/rows.json` and run `--update`.

## Where the code is

- `templates/threejs_film/puppets.mjs`: `turnedHair` (side hair, side view only), `backHair`, `unslide` (keeps hair still in 3/4).
- `templates/vector2d_characters/code/cast.mjs`: the signalman's side and back hair.
- `char2d.mjs` and `castkit.mjs`: flag `slideExtras` (which face extras slide with the face).
- A cast sheet that draws its own views sets `views: true` (example: `episodes/baboon-signalman/cast/sheets/jack.mjs`).

## Template upgrade (CB 2026-11-11 21:40 Bangkok: "perfect this is the template upgrade.")

Approved sheet now: `views_golden/APPROVED_character_views_v6.png` (v5 kept for history). Applies to every character in new episodes; roller coaster and magic bell finish on the old cast. Code: char2d.mjs + bodies.mjs; picture of the change: project files new-characters/style_change_2026-11-11/standard_before_after_v4.png. Backup of the old code: OneDrive RicksClipsBackup\character_template_upgrade_2026-11-11\before.

6. **Legs** stand further apart (hips +16 px each side, feet ~60 px out) in front, 3/4 and back; side view legs a little more spread too.
7. **Feet angles**: front = both toes 45° down and outward (ankle lifted, toe tip on the ground). 3/4 = both toes 45° down, leaning to the facing side. Side = flat L feet forward (unchanged). Back = toes 45° outward and UP (pointing away from camera).
8. **Arms**: side view elbow bends backward (the other way from before). Back view: the arms are in front of the body, so they are drawn BEHIND the body card; only the parts sticking out show.
9. **Line weights**: arm and leg lines +2 px; fists +2 px radius. Body outline is a clean even line (no wobble), a little thicker at the bottom left. Head outline thicker under the chin.
10. **Face**: drawn face parts (eyes, brows, mouth) are 30 % bigger (side view 20 % so the brow stays inside the head). Meme faces are not scaled.
11. **Back of the outfit is its own design**, never a copy of the front. Hook: `S.backDetails` (used in the back view instead of `S.details`). Standard coat back = shoulder yoke, centre back seam, hem vent, no buttons. Other cast characters still need their own backDetails; add one whenever a character is shown from behind.
12. Faces are plain white (no gradient on the skin), per CB's face rule of 2026-11-11.

## STANDARD TEMPLATE v11 LOCKED (CB 2026-11-11 22:09 Bangkok: "Ok perfect. Lock this as standard template.")

Approved sheet: `views_golden/APPROVED_character_views_v7.png`. Pictures of the steps: project files new-characters/style_change_2026-11-11/ (v4 to v11). Code: char2d.mjs (v11). Backup of v4: OneDrive RicksClipsBackup\character_template_upgrade_2026-11-11\v4_installed.
Rule 12 above is replaced by rule 15 (the face now has a drawn shadow).

13. **LINE SHADOW COMES FROM THE LIGHT SOURCE** (CB: "Line shadow change from source light"). Every outline (head and body) is thin on the side the light comes from and heavy on the opposite side and along the bottom edge. The light side = the side the face looks to: 3/4 and side views take the light from the facing side (so the heavy line is on the back of the head and body); front and back take it from screen-left. Outlines are clean and even (no wobble). Code: INKL in drawCharacter.
14. **LEG AND FEET DIRECTION DEPENDS ON THE CAMERA VIEW ANGLE** (CB: "leg and feet direction depends on camera view angle"). Front: both toes 45 deg down and outward. 3/4: both toes 45 deg down, leaning to the facing side. Side: flat L feet pointing the way he faces, legs a little apart. Back: toes 45 deg outward and up (pointing away from the camera). Legs stand apart in every view.
15. **FACE 3D SHADOW**: a soft light grey shadow inside the head on the side away from the light (same side as the heavy line); the middle of the face stays white. Drawn in the card code (S.faceShadow, on by default).
16. **FACE DEPTH (physical geometry)**: in turned views the eye and brow toward the head's edge are the far ones: narrower and smaller. The bigger brow sits on the near side, in the middle of the face.
17. **LIMBS ACT LIKE HUMAN LIMBS** (CB: "All limbs are acting like human limbs can move and do everything"). Arms and legs bend only at real joints (shoulder, elbow, wrist, hip, knee, ankle) and only the way a person's can: elbows bend backward with the forearm forward, knees bend forward. They can do anything a person does (reach, grab, point, carry, push, climb, kick, sit, kneel, run) with the hand or foot ending ON what it touches. No rubber-hose bends, no reversed joints, no limb passing through the body or a set object. Side view: the elbow points back. Back view: the arms are in front of the body (drawn behind it).

## v12 LOCKED (CB 2026-11-11 22:28 Bangkok: "Perfect. Now lock it.") - sheet views_golden/APPROVED_character_views_v8.png

18. **Hats, hair and animal parts turn with the view.** 3/4: brims and caps point the way the character looks. Side: the hat in profile (brim only in front), fur or hair round the BACK of the head, one ear, snouts and muzzles in profile sticking out the way he looks. Back: the head fully covered by its hair or fur (never bald where the front has hair), the hat seen from behind. Example: cast:jack (views: true).
19. **Hair colour is the same in every view**: same colour, light highlight strokes, dark hair lines and accessories (the pink hair tie) as the front.
20. **Back clothing is its own design in every outfit** (S.backDetails / castkit backDetails): no front buttons, buckles, collar points or bows; show what the back has instead (yoke, seams, zip, belt loops, back pockets, a belt tied at the back).
21. **Tails and other back parts sit where the body has them**: side view = out of the back, away from the way he looks; back view = from the middle of the lower back, drawn over the body (hook S.backOver / castkit backOver).
22. **SITTING, KNEELING, CROUCHING: BLACK LEG LINES BY CAMERA ANGLE, NO PANTS SHAPES** (LOCKED CB 2026-11-12 00:10 "Ok lock"; replaces the 22:28 thighs-in-outfit version after CB 23:40-23:49: "Every limb is viewed by camera angle", "Dont create the other angle pants. The leg line stays black", "Leg show to front so legs need to be longer", "Knee never eckig its have a bend"). Front / 3/4: the thigh points at the lens and is hidden; the ink leg starts ON the lower body (over the outfit) and runs out and down to the floor; legs read longer and wider, feet low in the frame in front of the seat; 3/4 knees and feet turn to the facing side. Side: hip, level thigh line forward, soft round knee, shin straight down, flat L foot forward. Back: legs come out from under the body (drawn behind it), toes UP 45 deg and out. Poses: sit_chair (chair or bench, Rick cashier), sit (floor), kneel, crouch. Code: char2d.mjs S.chairPose / S.kneelPose, KNEE() round bend; poses.mjs sit_chair drop .30 off-side, .50 side. Reference: approved/REF_rick_cashier_seated.jpg; approved sheet approved/APPROVED_chair_sit_4_views.png.
23. **ARMS = LEG THICKNESS, SOFT ELBOW, BIG FISTS** (LOCKED CB 2026-11-12 00:10): arm line width = leg line width; every posed arm is upper arm + forearm with a small round elbow (poses.mjs arm()); side view elbow bends BACK away from the facing direction; fists about 2.5x the arm line (handR +9 posed, +11 own arms). Raised arms (pose cheer): out from the shoulder to the side, round elbow beside the head, forearm nearly straight up, hands at head-top height and well clear of the head (explicit elbow p.elbow [.74,-.32], hand [.92,-1.08]). Approved: approved/APPROVED_rick_vs_ours_chair_cheer.png.
24. **LONG CLOTH OUTFITS (skirt, dress, gown, robe, tabard, long coat)** (LOCKED CB 2026-11-12 02:21 "ok lock that in. for long cloth outfit costume"; from Rick's "How One Cart Stopped an Entire Army" and CB 01:54-02:13: "keep the original body form. just add a long cloth under or behind it", "sitting front little longer"). The body form stays exactly as it is (shape, round bottom, outline); the long cloth is its own piece hanging UNDER / BEHIND the body and IN FRONT of the legs. Legs only show below the hem and are never drawn over the cloth. Standing: the cloth starts at the body's own width and widens a little to the hem (A-line), its own colour, soft folds, a dark or gold hem band, own back design (back slit, vent, cross). Sitting front / 3/4 / back: the cloth lies over the lap and hangs well past the knees (longer cloth hangs longer, never past 60 % of the shin), shins come out below. Side sitting: along the thigh, over the round knee, down in front of the shin. Length follows the form's own legs: knee .32, mid-shin .51, ankle .69 of (ground 1010 - bodyBot). Code: char2d.mjs S.skirt (drawn in the back layer; legs of bent poses go behind it), long_cloth.mjs (CLOTH gown / tabard / robe / plain, COSTUME doctor / knight / emperor, longCloth(style, length, S)), castkit spec.longCloth. Approved: views_golden/long_cloth/APPROVED_long_cloth_standard_lengths.png, APPROVED_long_cloth_doctor_knight_emperor.png, APPROVED_long_cloth_all_forms.png.

## 25. HAIR LIBRARY v2 (LOCKED CB 2026-11-12 03:01 Bangkok: "yes much better. lock in")
From Rick's hair close-ups (cashier Kyle, the pink-cell guard, the memory-shop ginger, the curly cashier lady) and CB 02:50: "the subtle shading, highlights reflection and lines are not correct", "all have little thicker outer hair line".
- Code: `code/hair_lib.mjs`. Put hair on any cast spec with `withHair(spec, key, { col, pieces, hat })`. The front hair goes in spec.hat, so it never slides in 3/4 (rule 2); long hair goes in spec.headBack. Sheets: `node code/hairlib_sheet.mjs out.png [keys]` and `node code/pieces_sheet.mjs out.png '<combos json>'`.
- Drawing: the hair is a cap that hugs the head and stops above the brows. The OUTER hair line is thicker than the head line (9.5 in head space against the head's ~7.8) and the hairline against the face is 7.5. The colour is a soft gradient (light crown, then the base, then a little darker low), never hard bands, with a soft dark band just inside the hairline. 2-3 long thin LIGHT streaks follow the head's curve on the lit side, plus one thin near-white shine line on top, and 3-4 thin tapered dark strand lines. Curls get a light c-arc on each curl. Spikes are separate overlapping locks, each with its own ink line, darker at the root and lighter toward the tip.
- Views: 3/4 = the front hair. Side = hair over the top and the back half of the head; the hairline runs back along the forehead, down in front of the ear and then to the nape. Back = the head covered down to the nape.
- Head pieces (flower, bow, headband, barrette, tiara, laurel, sticks, pencil, goggles, shades) sit ON the outer hair edge. Hats (helmet, flatcap, beret, tophat, straw) press the hair flat, and the sides and back still show under them (Rick's cart soldiers).
- Every style carries an era label: pick hair that matches the character's era, age and culture.
- Approved pictures: `views_golden/hair_v2/`. Older shared presets in memes2 (bob, gramps, granny, curl) stay for the old cast until each character is moved to the library.

## 26. HAIR v4 (74 styles) + HELMETS + MASKS (LOCKED CB 2026-11-12 03:23 Bangkok: "ok lock in")
- `code/hair_lib.mjs` now has 74 styles: the 32 of rule 25 (unchanged), 28 by age, era and culture (baby wisp to elder grey, tonsure, powdered wig, cornrows, bantu knots, plains braids, sangtu, hime cut, Maori topknot...), and 14 modern (quiff + fade, textured crop, undercut, messy bun, wolf cut, sleek bob, beach waves, half-up knot, side shave, box braids, long curls, curtain bangs, braided ponytail, split-dye bob). Coverings turban, hijab (hides all hair), kufi and sombrero are hats.
- `code/head_gear.mjs`: `withGear(spec, hairKey, { helmet, mask })`. 18 HELMETS and hoods (knight, greatHelm, viking, roman, spartan, kabuto, soldier, pilot, moto, bike, hardhat, fire, astronaut, football, diver, ninja, luchador, balaclava) and 13 MASKS (medical, domino, masquerade, bandana, plague, gas, hockey, oni, welding, scuba, eyepatch, groucho, kitsune).
- A helmet is a hat: it sits over the hair, and the hair still shows at the sides and back where the real helmet leaves it (closed helmets hide it). A mask is a face piece: it turns with the eyes and mouth in 3/4 and side views and sits under the hair; a full-face mask stays on the head in 3/4 and only its eye holes follow the eyes; nothing of a mask shows from the back.
- Every helmet and mask is built from real parts (rivets, bands, straps, vents, stitches) and every filled part has a soft light-to-dark gradient toward the light, like Rick's metal. Still to push: his brighter highlight patch and gold riveted rim.
- Sheets: `node code/gear_sheet.mjs out.png '[[hairKey, helmet|null, mask|null, title, coat]]'`. Approved pictures: `views_golden/hair_v4_gear/`.

## 27. FACE GEAR: BEARDS, MOUSTACHES, FACE ACCESSORIES, TATTOOS, FACE PAINT (LOCKED CB 2026-11-12 03:34 Bangkok: "lock")
- `code/face_gear.mjs`: `withFace(spec, { beard, stache, acc: [], marks: [], col })`, used AFTER withHair / withGear. 13 BEARDS, 9 STACHES, 24 ACCESSORIES (glasses, monocle, eye pad, plaster, scars, freckles, make-up, bindi, clown nose, pipe, lollipop, pacifier, earrings, earbuds, headset), 28 MARKS (12 tattoos, 16 face paints).
- Rick's way (cart-army commander, red-beard soldier): the face stays white and the MOUTH IS NEVER COVERED. A beard is one inked shape that hangs BELOW the head from the jaw, flat colour with a soft gradient, short v and i ticks, ragged lower edge. Glasses are thin ink rings over the eyes.
- Layers: paint and tattoos, then beard, then moustache, then accessories; all over the face and under hair, hats and helmets.
- 3/4 and side: paint, tattoos, moustaches and glasses turn with the eyes and mouth; beards and earrings stay on the head. Back: only earrings and the headset show.
- Paint and tattoos are flat colour ON the skin (multiply, clipped to the head): eyes, mouth and face shadow stay visible through them. The clip and the blend must sit on the same group. Do not wrap a character in a group with opacity or a filter, or the paint turns opaque.
- Tattoos are on the face or head only: arms and legs are ink lines.
- Pick every piece to match the character's era, age, culture and job, and keep one clear signature per character rather than stacking everything.
- Sheets: `node code/face_sheet.mjs out.png '[[title, hairKey, faceOpts, coat, gearOpts]]'`. Approved pictures: `views_golden/face_gear/`. Known weak spots: side-view beards hang a little far forward; the horseshoe moustache reads like a doorway.

## 28. PLAIN OUTFIT = PLAIN BACK (LOCKED CB 2026-11-12 03:39 Bangkok: "if is plain the back need to be plain also no lines" / "yes lock it.")
- The standard body's back view has no drawn lines (the collar band, shoulder yoke, centre seam and vent are gone): only the coat colour with its soft shading.
- Back lines appear only when a costume has its own designed back (spec backDetails). Never add seams to a plain outfit.
- Approved picture: `views_golden/standard_body/APPROVED_standard_body_plain_back.png`. check_views PASS 20/20 with this change (cloud run on the PC files, 2026-11-12).

## 29. FOUR BODY SIZES = THE MAIN BODY FORMS (LOCKED CB 2026-11-12 03:49 Bangkok: "lock. and mostly use only these 4 body form for the chracters. the other bodyform only if neccessary")
- The standard body comes in four sizes on the same body line: `thin` (.58 of the width), `standard` (1), `fat` (1.56), `extremeFat` (2.05). Use castkit `spec.size` (bodies.mjs SIZES, sizeChar).
- Only the body width changes. Head, height, legs, arms, fists and ink are the same on all four; shoulders, hands and hips move out with the body so the arms hang clear of it.
- DEFAULT FOR EVERY CHARACTER: pick one of these four. The other body forms in bodies.mjs (gigachad, big boi, noodle, kid, dad, lady, grandpa, baby, toddler, teen, teengirl, brute, ghost) are used only when the story needs them, for example a child, a baby or a ghost.
- Make a character memorable with size + hair + head gear + face gear + costume, not with a special body form.
- `standard` is pixel-identical to before; check_views PASS 20/20 with this code. Approved picture: `views_golden/standard_body/APPROVED_four_body_sizes.png`. Sheet: `node code/size_sheet.mjs out.png`.

30. HATS AND HEAD PIECES v3 (CB LOCKED 2026-11-12 04:12 Bangkok, "yes thats perfect now. lock in."): code\head_wear.mjs, 34 hats (HATS2) + 16 head pieces (PIECES2), used as wear(spec, hairKey, { hat, pieces, hatCol, pieceCol }) on top of the locked hair library. Every hat fits the head: the crown is never wider than the head/hair edge, normal size (HAT_SIZE scale 1, 2 px lower). Every filled part has the colour grade, a light rim on the lit top-left edge, a dark rim bottom-right, cloth creases and one white shine streak (TEX; metal crown opts out), bands have stitching, and a soft shadow falls under the brim. Outlines x1.25 (HAT_INK). Hood, headscarf and nemes wrap the whole head and hide the hair. MIX AND MATCH (CB 04:13): hatCol / pieceCol recolour any hat or piece; pick colour, era and age to fit the story. Approved pictures: views_golden\head_wear\.

31. OUTFIT LIBRARY (CB 2026-11-12 04:32 Bangkok on the first 100: "yes thats its perfect", then asked for a full library of 500): code\outfit_lib.mjs (parts toolkit) + code\outfits_100.mjs (recipes). Use dress(S, key, { a, b, c }) on a buildChar result; it sets the body colour, front details, back details, long cloth and cape. Every outfit is built from layers and small parts (collar, closure, chest items, armour, belt, hem, long cloth) placed relative to the body, so it fits thin, standard, fat and extreme fat, and every outfit takes any palette (mix and match, but fit the story). Every part carries the finish rule: colour grade, light streak on the lit side, dark rim on the far side, crease lines, stitches, shine on metal. The long cloth follows rule 24 (hangs under/behind the kept body form). Check after any change: node code/of_check.mjs must report 0 bad. Sheets: node code/outfit_sheet.mjs out.png all. Approved pictures: views_golden\outfits\.

31b. OUTFIT LIBRARY = 500 (LOCKED CB 2026-11-12 05:03 Bangkok "Ok lock"): outfits 101-500 added in code\outfits_200.mjs (plain everyday), outfits_300.mjs (modern + jobs), outfits_400.mjs (world cultures + history, each named by its own name; use it where the story is set), outfits_500.mjs (sport, fantasy, sci-fi, party, stage). Shared colours and the K() skirt helper: code\outfit_cols.mjs. outfit_lib.mjs v2 adds 30 parts (peterPan, polo, tie, bow, chestBand, chevron, raglan, sideStripes, stripeDiag, ombre, scatter, waves, triBand, argyle, vest, corset, offShoulder, midriff, kangaroo, lanyard, chain, ribs, belly, sequins, feathers, xStraps, splat, ruffle, panel, hex, circuit, raceBib), wings(col, 'feather' | 'bat' | 'fairy') behind the body and more long-cloth patterns. Same use: dress(S, key, { a, b, c }). Check: node code/of_check.mjs = 8000 renders (500 x 4 sizes x 4 views), 0 bad. Legs stay the one limb colour (rule 22), so trousers read at the hip only. Pictures: views_golden\outfits\outfits_101_200 ... 401_500.

32. THREE BODY SIZES, REPLACES RULE 29's FOUR (LOCKED CB 2026-11-12 19:24 Bangkok "ok lock"; CB: "standard chnage to be thin. , fat is standard. extreme fat is fat/ use only this 3", "the body need to be littler longer too, with increse of body size", "now make the head also increase size by porpotion"; cart army thread: "never use thin" in the OLD names):
- castkit `spec.size`: `thin` (the old standard width, 1), `standard` (the old fat, 1.56), `fat` (the old extreme fat, 2.05). The old thin (.58) is gone. `extremeFat` now means `fat`.
- With each size the body is longer and the head bigger: body length +20 / +55 / +90 px (bodies.mjs SIZE_LONG), head 1.5 / 1.62 / 1.74 (SIZE_HEAD). Feet stay on the ground, so the legs get shorter and the bigger sizes stand a little taller.
- Legs and arms are drawn with the same line width (19 px, char2d LEG) on every size. Do not give a film its own limb width.
- A character with no `spec.size` is unchanged. Films already in animation can keep the exact old look with `oldThin`, `oldStandard`, `oldFat`, `oldExtremeFat` (SIZES_OLD: width only, old length and head).
- Approved picture: `views_golden/standard_body/APPROVED_three_body_sizes.png`. Sheet: `node code/size_lock_sheet.mjs out.png "{\"hair\":\"buzz\",\"lock\":1}"`.

33. HEAD ITEMS FIT THE HEAD (CB 2026-11-12: "some helm hair beard headpice are bigger than the head. please make them perfect fir."; lock 19:24): a beard starts ON the head outline and curves inward, never wider than the head (face_gear.mjs beardShape). A closed helmet or hood shell sits on the head outline, half width 104 to 108 on a head of radius 100 (head_gear.mjs SHELL_FIT). Brims, horns, crests and cheek guards may stand out; the shell may not. Do not scale beards or helmets in an episode. Picture: `views_golden/head_fit_before_after.png`.
