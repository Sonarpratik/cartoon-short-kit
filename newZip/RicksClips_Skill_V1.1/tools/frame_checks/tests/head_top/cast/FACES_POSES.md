# FACES AND POSES: Armor Where Nobody Shot (character-artist, 2026-11-13)

How to call them in film.json acts: `"face": "k:<name>"`, `"pose": "<name>"` (poses.mjs; two can be joined with `+`, the later one wins), `"pose": "m:<id>"` (motion library; `m:<id>@=<seconds>` freezes it at that moment), held things with the act key `"grip": { "obj", "scale", "angle", "each", "two" }`, the holding hand `"hand": "R"`.
Episode faces live in `cast/cast.json` under `faces_ep` (kit parts only); copy that block into film.json.
Proof pictures (drawn through the kit's own puppet adapter): `crew/character_artist/acting_proof.png`, `crew/character_artist/grips_proof.png`; in the film kit with the motion library: `crew/character_artist/stills/kit_test_sheet.png`.
Every character starts on `standard` (calm) and the face changes ON the word. Lip sync: the Crew Chief only, line 3 only (`"say": [first word, last word]`); nobody else ever gets a mouth from the voice.

## 1. What CAST_TRAITS asks for and the exact kit name
| asked for | who, where | use | kind |
|---|---|---|---|
| concentrate, tongue tip | Mathematician, first pin (B5), tiptoe tap (B9) | `k:concentrate` | kit face |
| glance at the camera | Mathematician, B1 | `k:glanceCam` | kit face |
| the one slow blink instead of an answer | Mathematician, B2 | `k:slowBlink` for 6-8 frames, then `standard` | episode face (no head pop) |
| silent counting lips | Mathematician, B5-B6 | `k:count1`, `k:count2`, `k:count3` in turn, 3-4 frames each | episode faces (no head pop) |
| small half-smile, last frame only | Mathematician, B9 | `k:halfSmile` | episode face (calm eyes, kit `smirk` mouth) |
| dead still at the empty ovals | Mathematician, B6 | `standard`, no blink key, no move | kit face |
| hold breath before the laugh | Chief, B2 | `k:holdBreath` | kit face |
| belly laugh, eyes shut | Chief, B2 | `k:bellyLaugh` (no tear drops) or `k:laugh` (with tear drops) | episode face / kit face |
| proud at his plate stack | Chief, B5 | `k:proud` | kit face |
| cocky on the quote | Chief, line 3 | `k:smug` before and after, lip sync in between | kit face |
| caught by his own mug | Chief, B8 | `k:mugFreeze` | episode face (wide eyes, flat mouth) |
| quiet with his lamp | Chief, B7 | `k:worried` (has sweat drops) or `k:sad` | kit faces |
| late laugh, cut off | Rivets, B2 | `k:laugh` then `k:nervousSmile` | kit faces |
| one eyebrow | Ladder, B6 | `k:browUp` | kit face |
| sleepy calm | Ladder, flyers | `k:tired` | episode face (half lids, flat mouth) |
| tennis-match look | Colonel, B4-B5 | `k:think` (eyes to the side; turn the card with `dir`) | kit face |
| tired, undecided | Colonel | `k:tired`, `k:worried` | episode face / kit face |
| pencil lick | Adjutant, B5 | `k:pencilLick` | episode face (one eye squinted, tongue at the mouth corner) |
| the chalk stops at 9 | Adjutant, B7 | `k:nervous`, then `k:sad` | kit faces |
| frozenTongue | nobody | not used | |

No two characters share a face set: the Mathematician owns concentrate, count, slowBlink and halfSmile; the Chief owns holdBreath, bellyLaugh, smug, proud and mugFreeze; Rivets owns nervousSmile; Ladder owns browUp; the Colonel owns think and tired; the Adjutant owns pencilLick and nervous.

## 2. Poses and moves that exist, per action in the script
| action | use | note |
|---|---|---|
| fists on hips, belly forward (Chief's stance) | `hands_hips`; weight on one leg `cool` | |
| chalk circle with a flourish, proud step back | `grip_point` (chalk in the RIGHT hand), then `hands_hips` + `k:proud` | chalk = 3D prop on the hand |
| thumb jerked over the shoulder (line 3) | `point_out` with `dir` away from the wheel is the nearest; the rig has no thumb | see section 3 |
| belly laugh, body shaking | `m:laugh/A` (hands on the belly, whole body shakes; tested on the fat body); pointing and laughing `m:laugh/B` | |
| slide rule held at rest / pointing and tapping | `grip_pole` / `grip_point`, `"hand": "R"` | same hand in every view (tested front, 3/4, side) |
| reaching up to tap the cowl | `reach_up` with the act `pos` z = 0.42 (top of the briefcase) | tiptoe: section 3 |
| pushing a pin in with the thumb | `knock` (fist to the wall) or `m:button/A` | the quarter turn is a wrist move the rig does not have |
| lantern held up, counting planes | `grip_hang` (hangs straight down from the fist); walking with it `m:lantern/A` (careful), `/B` (march), `/C` (spooked) | lantern = 3D prop, the film's signature light |
| mug, drinking | `m:drink/A` (fancy sip), `/B` (chug) | the move's own drawn mug is red: never add `+props` |
| carrying the step ladder / rivet gun | `grip_shoulder`; walking `m:carry/A..C` | |
| two men carrying a plate | `grip_box` on both, facing each other | plate = 3D prop |
| heaving the plate onto the scale | `heave`, then `bend_down` | |
| marshalling paddles up | `cheer` with `"grip": { "obj": "staff", "each": 1, "scale": 0.3, "angle": -90 }` as stand-in; one paddle `grip_raise` | paddles = 3D props; coming slowly down = tween from `cheer` to `stand` |
| leaning on the ladder / wing strut | `m:lean/A` (cool), `/B` (tired) | |
| hands clasped behind (Colonel) | `stand` is the nearest; a hand with `behind: true` exists only inside motion moves | see section 3 |
| writing on the tally board, ticking a line | `write`, `m:write/C` (slow), `m:board/A` | |
| clipboard hugged to the chest | `grip_sign` with `"grip": { "obj": "sign", "two": 1, "scale": 0.6 }` | clipboard = 3D prop |
| hasty salute (Rivets) | `finger_up` is the nearest (fist beside the head) | see section 3 |
| waiting, tired flyers | `m:wait/C`, `m:idle/A`, `m:idle/C` | |
| climbing the step ladder (B9) | `m:ladder/A` (eager), `/C` (tired, old) | side or back view only |

## 3. What the rig does NOT have, and the proposal for each
The master kit has a film.json key for episode FACES (`faces_ep`) but none for episode POSES. The five proposed pose lines are in `crew/character_artist/poses_ep_proposal.json`; they were tested only in a temp copy of poses.mjs (never in `templates/`). To use them, the animator adds them to POSES in the episode's kit copy. That needs the lead's OK.
| asked for | in the rig today | proposal | how good it is |
|---|---|---|---|
| belly laugh with a KNEE SLAP on the fat body | the laugh yes (`m:laugh/A` + `k:bellyLaugh`), the knee slap no | proposed pose `knee_slap` (bent toward the facing side, one hand low, the other on the hip), keyed for 4-6 frames between two stretches of `m:laugh/A` | reads as a bent-over laugh; the low hand lands at the hip line, not on a knee, because the legs are ink lines below the body. A true slap needs a hand target on the knee (`hand_at` works on motion moves only), so a new motion-library move `laugh/slap` would be the proper fix |
| mug stopped halfway to the mouth, dead still | `m:drink/A@=0.6` freezes the sip half way up (tested, the hand holds still) | use it with `k:mugFreeze`; the mug must be the white 3D mug locked on the hand. The drink move has no named held object, so `held3d` cannot find the hand: the animator needs an episode copy of the move with `held: [{ hand: 1, obj: "mug" }]`. Fallback: proposed plain pose `mug_half` with `"prop": "mug"` (draws a lettered disc until a mug drawing exists) | the frozen move is good; the mug itself is missing |
| silent counting lips | not as a preset | `k:count1..3` (episode faces, kit mouths `o`, `flat`, `smileSmall`, calm eyes, no head pop) | good, tested |
| one finger on the hat brim | `finger_up` (fist beside the head, finger up) | proposed pose `hat_brim` (the fist at the brim end, finger along it) | fair on the thin body with the fedora; the fist touches the brim end, the finger is the rig's short ink line |
| tiptoe on the briefcase, one arm up | `reach_up` and the act `pos` z = 0.42 puts the soles on the case top | use `reach_up`; proposed `tiptoe_reach` only adds a head tilt | NO tiptoe: the rig has no toe-stand foot, and stretching the legs breaks the fixed limb length rule. A toe-stand leg pose is a rig add (kit owner) |
| arms crossed with a half-smile, on the ladder | no crossed-arm pose | proposed pose `arms_crossed` (each fist crosses to the far side of the chest) + `k:halfSmile`, act `pos` z = 0.9 on the third step | reads as folded arms in front and 3/4 (tested on the thin and fat body); side view not tested; the slide rule under the arm needs the 3D prop |
| thumb jerk, salute, neck rub, hands behind the back, pin quarter turn, mug snort | no | nearest existing poses are named in section 2; if a beat depends on one, ask for a motion-library move | stand-ins only |

## 4. Rules for whoever uses this
- The Mathematician reacts one beat late and small; the Chief first and big; Ladder only ever raises one eyebrow; the officers never open their mouths.
- Under the fedora the brows and the top of the glasses are hidden by the brim (library hat fit). His big face acting (first pin, the empty ovals, the pins in his glasses) is in the hangar, where he is `mathematician_bare`.
- Side views: the Mathematician's pins show facing either way; the Chief's handprint shows fully when he faces screen-right (his right side to the lens). In a 3/4 view both always show.
- After any pose or face is added, run `node tools/check_views.mjs` before a render.
