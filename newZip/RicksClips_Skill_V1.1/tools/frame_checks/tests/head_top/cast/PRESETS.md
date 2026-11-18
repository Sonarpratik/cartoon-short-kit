# CHARACTER PRESETS: Armor Where Nobody Shot (character-artist, 2026-11-13)

Master asset for every preset: the castkit spec of that name in `cast/sheets/armor.mjs`, played as `"puppet": "cast:armor/<name>"` (entries in `cast/cast.json`). Sheet picture: `cast/CAST_SHEET.png`. Style family for all: locked 2D vector cast, template v12, clean bible look.
Status: NEW characters, shown to CB on the cast sheet; they are locked when CB says so. Until then nobody redraws them from a description: call the ID.
Sides: "his LEFT" is screen-right in the front view. Body details sit on the front of the body, so no signature shows in a back view; the back view is told apart by the item named under "back view".

Held props are real 3D objects made by props-hero and locked on the card hand (`held3d`). The grip kind and pose below say how the hand holds it. The flat stand-ins from grips.mjs are for blocking only; do not use the library `pointer` (red tip) or `bag` (dollar sign) as stand-ins in this film.

---
## CHAR_ARM_001 THE MATHEMATICIAN
1. ID: CHAR_ARM_001, `mathematician`; variant `mathematician_bare`. Original design, no likeness of any real person.
2. VISUAL BLUEPRINT (locked): thin body, 1.50 m, 3.10 heads; rick head; `sidePart` hair sandy `#c9a769`; `roundGlasses`; clean-shaven; slate `fedora` (`#636e7c`, dark band, no feather); `threePiece` recipe: slate `#7b8794` with a fine chalk stripe, waistcoat `#636e7c`, white shirt, mustard tie `#c79a2c`, three dark buttons, white pocket square in the LEFT breast pocket; ink limbs. Silhouette: the smallest figure, hat brim wider than his shoulders.
   SIGNATURE: exactly three red glass-head pins (`#d6262b`) in a diagonal row in his LEFT lapel. Seen in front, 3/4 and both side views. Back view: the fedora over sandy hair.
3. PERSONALITY AND ACTING: quiet, precise, patient; upright, heels together, elbows in; small even moves with a short stop before each; reacts one beat after everyone else and smaller. Gestures: one tap with the slide-rule tip, a finger on the hat brim, thumb pushes a pin with a quarter turn, one slow blink, arms crossed with a half-smile (last frame only).
4. ALLOWED VARIATIONS: faces `k:concentrate`, `k:glanceCam`, `k:count1..3`, `k:slowBlink`, `k:halfSmile`, `k:think`, standard; poses and moves from FACES_POSES.md; the four views; hat off only as `mathematician_bare` in `hangar` and `hangar_night` (the hat hangs on the drawing's corner pin).
5. FORBIDDEN: any uniform, medal, salute or weapon; a moustache or beard; any red besides the three pins; a fourth pin or a missing pin; another hat; a different grey.
   HELD: boxwood slide rule with a brass cursor = grip kind `pole`, RIGHT hand in every view; pose `grip_pole` at rest, `grip_point` to point and tap; stand-in `"grip": { "obj": "staff", "scale": 0.4, "angle": -14 }`. Brown leather briefcase = grip kind `hang` (pose `grip_hang`); he stands on it upended (set prop, top z = 0.42).

## CHAR_ARM_002 THE CREW CHIEF
1. ID: CHAR_ARM_002, `chief`. Invented.
2. VISUAL BLUEPRINT (locked): fat body, 1.85 m, 2.79 heads (2.4 times the Mathematician's body width at film scale); `buzz` hair dark `#3a2a22` (side view: the face is open and the hair is only a thin band round the back of the head below the cap; back view: the head fully covered by its hair below the cap, as template v12 locks it; the side hairline is set with hair_lib's `over` option in the sheet); `capBack` dark olive `#55592e` (peak to the back); ginger `handlebar` `#c8642a` above the mouth; `mechanic` recipe: olive coverall `#6f733c`, tan undershirt at the neck, brass zip, flap pocket on his LEFT chest, team patch on his RIGHT chest, oiled leather belt with a brass buckle. Silhouette: the widest figure, round cap with a button on top.
   SIGNATURE: a white chalk handprint (palm, four fingers, thumb) on his RIGHT hip, below the belt. Seen in front, 3/4 and the side view facing screen-right; half hidden in the side view facing screen-left. Back view: the cap peak pointing at the viewer.
3. PERSONALITY AND ACTING: loud, warm, proud, first to laugh and first to move; feet wide, belly forward, fists on hips; big fast heavy moves with a bounce. Gestures: chalk circle with a flourish and a proud step back, knee slap, thumb jerked over the shoulder, patting the plane, counting on his fingers with the lamp up. The one slow reaction of his life is the mug in B8.
4. ALLOWED VARIATIONS: faces `k:proud`, `k:smug`, `k:holdBreath`, `k:laugh` or `k:bellyLaugh`, `k:mugFreeze`, `k:worried`, `k:sad`, standard; lip sync on line 3 only (`"say"`); poses and moves from FACES_POSES.md; the four views.
5. FORBIDDEN: cap worn straight or off; a clean hip; a moustache of another shape or colour; any red; a weapon.
   HELD: stick of white chalk = `point` (pose `grip_point`, or `point_up` / `point_out` with the finger); amber hurricane lantern (the film's signature light) = grip kind `hang` (pose `grip_hang`, moves `m:lantern/A..C`); thick white mug = grip kind `handles` (fist round the handle; pose `hold_watch`, move `m:drink/A`); steel plate with a second man = `box`, two hands (pose `grip_box`).

## CHAR_ARM_003 RIVETS
1. ID: CHAR_ARM_003, `rivets`. Invented.
2. VISUAL BLUEPRINT (locked): thin body, 1.68 m, 3.10 heads; `curlyCrop` light brown `#a9773f`; olive `bucket` fatigue hat `#6f733c` with its small brass tag; `workShirt` recipe: khaki shirt `#b7a36b`, four brown buttons, flap pocket on his LEFT chest, team patch on his RIGHT chest, dark olive trousers, leather tool belt with two pouches.
   SIGNATURE: freckles across both cheeks and the nose. Seen in front, 3/4 and side. Back view: the bucket hat over brown curls.
3. PERSONALITY AND ACTING: young, eager, clumsy; leans forward on his toes, neck stretched; quick jerky starts; laughs one beat late and one beat too long, then stops dead; checks the Chief's face first.
4. ALLOWED VARIATIONS: faces `k:nervousSmile`, `k:laugh`, `k:worried`, `k:sad`, `k:surprised`, standard; poses and moves from FACES_POSES.md; the four views.
5. FORBIDDEN: no hat or another hat; a tie; a moustache; any red.
   HELD: rivet gun on its hose = grip kind `shoulder` (pose `grip_shoulder`); the two marshalling paddles = `raise` (pose `cheer` with `"grip": { "each": 1 }` for both up, `grip_raise` for one); pin boxes = `box` (pose `grip_box`).

## CHAR_ARM_004 LADDER
1. ID: CHAR_ARM_004, `ladder`. Invented.
2. VISUAL BLUEPRINT (locked): standard body, 1.80 m, 2.93 heads; `baldTufts` grey `#b9b4ac`, no hat; `factory` recipe: faded olive shirt `#8d8f5e`, oiled-brown bib front `#6e4a2c` with brass buttons and cross straps on the back, khaki neckerchief.
   SIGNATURE: a straw in the corner of his mouth, pointing the way he faces. Seen in front, 3/4 and side. Back view: the bald crown with a ring of grey tufts and the crossed bib straps.
3. PERSONALITY AND ACTING: older, sleepy, unhurried; a slow lean on whatever is nearest; slow heavy economical moves; one eyebrow is his whole range; the first of the crew to understand, and he says nothing.
4. ALLOWED VARIATIONS: faces `k:browUp`, `k:skeptical`, `k:tired`, standard (never a laugh face: he snorts into his mug); poses and moves from FACES_POSES.md; the four views.
5. FORBIDDEN: a hat; a big laugh; fast moves; any red.
   HELD: wooden step ladder = grip kind `shoulder` (pose `grip_shoulder`), set down with one hand; steel plate = `box`, two hands (pose `grip_box`); enamel mug = `handles`.

## CHAR_ARM_005 THE COLONEL
1. ID: CHAR_ARM_005, `colonel`; variant `colonel_bare`. Invented; never speaks.
2. VISUAL BLUEPRINT (locked): standard body, 1.82 m, 2.93 heads; `slickBack` silver `#aeaaa6`; peaked cap (`police` in olive-brown `#6a5c3a`, brass badge); a WIDE pale-grey `bushy` moustache `#c4c0bb` above the mouth; `airForce` recipe: olive-brown tunic over a tan shirt, dark olive tie, three brass buttons, shoulder straps, two flap pockets, cloth belt with a brass buckle. No rank, no ribbons, no unit badge.
   SIGNATURE: a beauty spot on his LEFT cheek, beside the end of the moustache. Seen in front, 3/4 and side, with or without the cap. Back view: the peaked cap over silver hair.
3. PERSONALITY AND ACTING: stiff, tired, decent; straight back, hands clasped behind him, weight on his heels; measured, a little slow, small tired pauses; looks from one man to the other like a tennis match; rubs his neck.
4. ALLOWED VARIATIONS: faces `k:tired`, `k:think`, `k:worried`, `k:sad`, standard; poses and moves from FACES_POSES.md; the four views; cap off only as `colonel_bare` at the tally board (`row_dusk`).
5. FORBIDDEN: a small or dark moustache (lead's ruling 2026-11-13); medals, ribbons, rank marks; a salute to the camera; a weapon; any red.
   HELD: the folded armor limit sheet = grip kind `edge` (pose `grip_sign` with a small sign); his cap in his hand in B7 = `hang`.

## CHAR_ARM_006 THE ADJUTANT
1. ID: CHAR_ARM_006, `adjutant`. Invented; never speaks.
2. VISUAL BLUEPRINT (locked): thin body, 1.72 m, 3.10 heads; `cowlick` hair black `#2c2428`, no hat; no face gear; `ww2Soldier` recipe: pale tan shirt `#cdb98c`, dark brown tie, two flap pockets, olive-brown trousers `#6a5c3a` (the Colonel's cloth), leather belt with a brass buckle.
   SIGNATURE: the pale pencil cord looped from his shirt front into his LEFT breast pocket. Seen in front, 3/4 and both side views. Back view: the cowlick curl on top of the bowl cut (the curl shows in all four views).
3. PERSONALITY AND ACTING: neat, nervous, exact about paper; shoulders up, clipboard to his chest like a shield; short quick steps, then frozen; licks his pencil; looks up at the sky, then back at the board.
4. ALLOWED VARIATIONS: faces `k:pencilLick`, `k:nervous`, `k:worried`, `k:shocked`, standard; poses and moves from FACES_POSES.md; the four views.
5. FORBIDDEN: glasses (they belong to the Mathematician); a hat or helmet; webbing or a weapon; any red.
   HELD: clipboard = grip kind `edge`, two hands (pose `grip_sign`, stand-in `"grip": { "obj": "sign", "two": 1, "scale": 0.6 }`); stub of chalk = `point` (pose `grip_point`, `write`).

## CHAR_ARM_F01 .. F08 THE FLYERS (background)
1. ID: CHAR_ARM_F01..F08, `flyer1` .. `flyer8`. Invented, unnamed.
2. VISUAL BLUEPRINT (locked): 4 standard, 2 fat, 2 thin, 1.70-1.85 m; leather flying jackets in three browns with fleece collars (`bomberPilot` recipe) or olive cloth flight jackets (`bomber` recipe), brass zip, flap pockets, team patch; flyers 1, 3, 5, 7 wear the `pilot` flying cap with goggles; 2, 4, 6, 8 are bare-headed (`sidePart`, `slickBack`, `flattop`, `curlyCrop`); 1, 4, 8 wear parachute webbing; 2 has a short beard, 6 has stubble. No signature needed (background).
3. ACTING: tired, quiet; each does one different small thing (climbs down, pats the plane, takes a mug); never looks at the camera.
4. ALLOWED VARIATIONS: standard, `k:tired`, `k:happy` faces; walk, wait, drink and lean moves; the four views.
5. FORBIDDEN: shown hurt; bandages; weapons; a real badge; any red.

## PRESET COMPLIANCE CHECK (run on every shot before it goes on)
Per character in frame, in the view used: silhouette, colours, head shape, face design, outfit, proportions and line style match `cast/CAST_SHEET.png`; the signature is there and on the right side; only the allowed variations changed. Quick drift tells: count the pins (three), find the handprint (his RIGHT), freckles, straw, beauty spot, cord.
