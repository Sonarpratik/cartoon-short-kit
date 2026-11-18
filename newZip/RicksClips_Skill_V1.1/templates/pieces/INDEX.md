# LIBRARY OF PROVEN PIECES (from "Armor Where Nobody Shot", built 2026-11-15)

## How to use (read this first)
1. CB's condition, 2026-11-15: "every story is different. it need to match to the story." A piece is a TECHNIQUE: timing, curve, order of events. It is never content.
2. A piece used unchanged is generic and fails Hard Rule No. 2 (CB_RULES section 11d). Every use is re-dressed: the object, the character, the light, the direction, the thing's own behaviour.
3. In `PICTURE_PLAN.md` a row names the piece AND what changes for this story ("hit piece; object = the church bell, payload = bare fist, answer = the bell swings and pigeons leave").
4. Pick a piece only where the scene asks for it. No piece is a quota; a film that uses none of them is fine.
5. Motion: an episode's own moves file imports the factory and passes ITS OWN values: `import { makeHit } from '<path>/templates/pieces/moves/hit_on_object.mjs'; const c_bell = makeHit({ strike: 30, payload: null, ... })`. The `ARMOR` values in each file exist only to prove the piece equals the film's move.
6. Effects: the files in `fx/` are numbers per frame (no three.js). The set module of the new film calls them and drives its own meshes; the look (mesh, colour, size) is built new.
7. Camera: `camera/camera_pieces.json` gives station ORDER and travel / hold / creep. Every `pos`, `aim` and `lens` there is the armor film's and must be replaced.
8. Each entry below says WHEN IT FITS and when not. Read that before the numbers.
9. Proof, no pictures: `node templates/pieces/prove.mjs` (motion, against the film's own moves) and `node templates/pieces/prove_fx.mjs` (effects). Both must print PASS after any edit here.
10. All frames are at 30 per second. "Move frames" count from the move's start; "film frames" are frames of that stretch's film.json. State of the library: `STATE.md`.

---
## MOTION

### 1. Hop onto a box  ·  `moves/hop_onto_box.mjs` (`makeHop`)
- WHAT: a small jump onto a low thing with body life: crouch, arc with tucked legs, squash, rebound, wobble; optional second stretched hop that taps something overhead with a tool.
- FITS: a small or eager character must get higher to reach the story's thing, and the climb is itself a beat. NOT: a heavy or old character (use a step up), a box higher than his hip, or when the climb is not worth 1.5 s.
- TIMING (move frames): crouch 0-5 · jump 5-12 · squash 12-15 (96 px) · rebound 15-20 (-16 px) · wobble 16-27 (7 deg, dying) · look up f22 · second crouch 27-31 · hop 31-37, tap at the top f37 (400 px) · fall 37-43 · squash 43-46 · settle.
- PARAMETERS: `crouchEnd, land, crouch, rise, tuck, squash, rebound, wobble, lookUp, tapHop {takeoff, top, land, height, crouch, squash, rebound, wobble} | null, feet, tool, startY, startRot`.
- THE FILM DOES ITS PART: it lifts the card onto the box over the jump frames (`act(m, at + 5, pos=BOX, move_s=7/30, linear=True)`), and the box rocks in the set.
- MUST CHANGE: box and its height, the body (weight decides squash and wobble), the tool and the thing tapped, the look-up frame, the pose it is entered from.
- ARMOR: pins stretch, film f0-46; `episodes/armor-no-holes/stretches/armor-pins-test/cast/ep_pins.mjs` lines 41-62; acts `build_film.py` line 88.
- LESSON: the first hop had the right frames and no body life; CB: "it looks stiff". The rewrite (round 7) added arms thrown, tucked legs, squash and a dying wobble. The arm and head key amounts stay in the file body: retune them per character.

### 2. Helpless laugh with the whole body  ·  `moves/laugh_whole_body.mjs` (`makeLaugh`)
- WHAT: a laugh that starts in the belly, throws the head back, folds the man double and ends in a slap on his own knee, then shakes out.
- FITS: the story needs one character to MOCK another and the mock is a beat the story must beat later. Whole figure in frame, side on. NOT: polite amusement, a close-up (the body is the laugh), a front view.
- TIMING (move frames): shoulders creep 7-14 · head back 14-19, belly bounce every 4 f (12 px) · hand up 22-25 · doubles over 25-29 (32 deg, body 84 px down, hips 200 px back) · SLAP f30 · dip 30-34 (10 px) · shakes die out over 16 f · still by f60.
- PARAMETERS: `shakeStart, throwBack, handUp, doubleOver, slap, dipN, dipAmp, beatPeriod, beatAmp, dieOut, beatEnd, drop, overDeg, hipsBack, backDeg, kneeX, feet, farAngle, farTool | null`.
- FACES in the film (not in the move): held breath 8 f in, open belly laugh 15 f in; the slap sits on the word.
- MUST CHANGE: who laughs and at what, what the far hand holds, what the slap lands on, the word, the faces, a second character's answer (armor: Rivets laughs one beat late).
- ARMOR: S1 film f243-303, slap on "laughing" f273; `episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs` lines 131-146; acts `build_film.py` lines 123-125.
- LESSON: doubled over at 36 deg about the feet, his head crossed the card's side edge and was cut in half (CB in CB_RULES section 10: "at second 9, he had removed by half"). Fix: hips go BACK over planted feet (`hipsBack` 200) and 32 deg. Check the head against the card edge whenever a body folds.

### 3. Slap or hit on an object  ·  `moves/hit_on_object.mjs` (`makeHit`)
- WHAT: show the thing, wind up far back on tiptoe, hold one frame, strike on an arc in 3 f, palm ON the object, body dips, hand rings, palm stays.
- FITS: a character proves a point by hitting a thing, and the thing can answer (quiver, dust, sound). NOT: a gentle placing, a hit the story does not pay off, or an object that cannot visibly answer.
- TIMING (move frames): out of the pose before 0-6 · shown f6 · lowered f22 · business 36-40 · COUNTER 43-47 · hold 47-48 · STRIKE 48-51 (u squared, 70 px arc) · CONTACT f51 · dip 51-55 (12 px) · ring 8 f · dead still.
- PARAMETERS: `from {y, rot, x, head, farAngleOff}, takeOut, show, lower, lowerEnd, business, counter, strike, strikeN, dipAmp, dipN, ringAmp, ringN, arc, tiptoe, feet, points(S), farAngle, farTool | null, payload | null, defaultTarget`; the contact point is `ch.tgt` (film `hand_at`).
- THE SET AND FILM DO THEIR PART: the object quivers (armor: `tire_hit` event, 14 f), dust ring, camera kick 0.8 on the contact frame, sound on the same frame.
- MUST CHANGE: the object and its answer, the payload, the business before the wind-up (the lick is the Chief's), the entry pose, the word, the kick.
- ARMOR: S1 film f283-355: the act starts at f283, the move's contact is its f51, the set answers from f335 (`F_SLAP`, word "flat"); `episodes/armor-no-holes/stretches/armor-s1-hook/cast/ep_s1.mjs` lines 150-170; `build_film.py` lines 23, 126.
- LESSON: the slap first sat on the wrong word; it was moved to "flat" and the camera had to be re-timed around frozen join frames (`patch_cam.py`). Fix the contact word BEFORE the camera is baked.

### 4. Exact double tap with a held tool  ·  `moves/double_tap_tool.mjs` (`makeDoubleTap`)
- WHAT: the tool's tip is ON one point, is drawn back, held long, then taps the point twice on two words; the fist is solved so the tip really lands there.
- FITS: a precise character names the one thing the story turns on, in a close-up. NOT: a wide (the tap is too small), an angry character (use the hit), a thing out of reach.
- TIMING (move frames): still 0-8 · free hand to the brim 8-15 · COUNTER 60-66 · HOLD 66-103 · STRIKE 104-108, TAP f108 · lift 109-112 (45 % of the counter) · STRIKE 114-117, TAP f117 · dips 7 and 9 px (3 f) · tool quivers 5 and 9 f · dead still.
- PARAMETERS: `tiptoe, toolLen, armShare, read, counter, strike1, n1, liftAt, liftK, strike2, n2, dips, rings, back, backDeg, restAngle, feet, tool`; the point is `ch.tgt`.
- THE SET AND FILM DO THEIR PART: `hand_at` holds the tap point for the whole move; a glint on the thing 3 f before each tap; kicks 0.3 and 0.4; camera piece 9 lands 12 f before the first tap.
- MUST CHANGE: tool and length, the thing and its answer, the two words (they set `counter`, `strike1`, `strike2`), the size of the counter, the free hand's business, tiptoe or flat.
- ARMOR: S1 film f0-141, taps on "clean" f108 and "spot" f117; `ep_s1.mjs` lines 36-56 (`m_hook`, `m_hook_l` = flat feet); events `build_film.py` lines 47-48.
- LESSON: until fix round 3 the tip was near the cowl, not on it. Fix: solve the fist from the tap point (two circles) and move the character (the briefcase) until the point is in reach; never eyeball a hand.

### 5. Chalk or drawing stroke drawn live  ·  `moves/stroke_drawn_live.mjs` (`makeStroke`)
- WHAT: the mark grows on the surface while the tool's tip rides the head of the line frame by frame; then a flourish.
- FITS: the voice says someone marks, writes or draws, and the mark matters later. NOT: a mark that is already there on its word (show it), writing longer than about 2 s, a surface the hand would hide.
- TIMING (move frames): notice 0-3 · tool up, stops a hand short 3-9 · tip ON 10-14 · STROKE 14-55 (41 f, the line closes on the word) · flourish 55-62 (one spin) · lands at rest 62-71 · still.
- PARAMETERS: `toolLen, armShare, raise, on, shortBy, strokeEnd, landAt, startAngle, restAngle, spin, leanMax, riseMax, feet, defaultTarget, tool`; the tip follows `ch.tgt`.
- THREE PARTS MUST AGREE: the set draws the line growing; the film gives one `hand_at` point per frame read from the set's real line (armor: `dump_ring.mjs` to `out/last_ring_line.json`, asserted within 0.05 m); the dust leaves from the same points (`chalk_head { f0, pts }`).
- MUST CHANGE: the mark and its real points, tool and length, the surface and the reach, stroke length, the flourish (it is character).
- ARMOR: S1 film f140-211, line f154-195 closing on "circle"; `ep_s1.mjs` lines 100-123; `build_film.py` lines 35, 136-137; camera piece 10.
- LESSON: the body first rode the circle on a guessed phase and leaned against its own hand, and the dust fell from where the chalk was not. Fix: the arm travels, the body stays planted, and every part reads the SAME points from the mesh. A 0.82 m stick left the far side of the ring out of reach: measure the reach first.

### 6. "I got it" (the realisation)  ·  `moves/got_it.mjs` (`makeGotIt`)
- WHAT: after a dead-still stare the head lifts, holds, tilts; the tool finds his chin, taps twice, one tiny nod. The face changes three times; the body almost not at all.
- FITS: the twist of the film happens inside one quiet character's head and the camera is close on him. NOT: a loud character, a wide shot, or without a stare before it (the stillness is half the piece).
- TIMING (move frames): head lifts 0-4 · hold 4-10 · tilt and tool up 10-18 · taps 21-23 and 26-28 · nod 30-37 · dead still. Faces in the film: brow up f0, eyes narrow f10, half-smile f18.
- PARAMETERS: `headFrom, headLift, headDown, toolUp, toolUpN, taps, tapN, nod, nodDeg, toolFrom, toolTo, feet, tool | null`.
- CAMERA: a last gentle push, travel 1.0 s, landing 45 f after the move starts, on his face and glasses.
- MUST CHANGE: what he stares at, the three faces and their words, the thinking gesture, how big the body answer may be for this character.
- ARMOR: pins stretch, film f576-621 (build lines 118-120 show 594, 604, 612 before the 18 f shift); `ep_pins.mjs` lines 208-213.
- LESSON: the realisation was one of CB's four notes of round 7 (`armor-pins-test/patch_r7.py` line 1): the stretch had the stare but no move for the moment he understands. A twist needs a face that turns, on the word.

### 7. "I told you so" (the last-frame pose)  ·  `moves/told_you_so.mjs` (`makeToldYou`)
- WHAT: arms crossed, chin down then up, a slow blink, one small gesture (a finger tips the hat brim), arms cross again, dead still to the end.
- FITS: the last acted beat, when the quiet character has been proved right and the loser is in frame. NOT: a hero who gloats loudly, or an ending that should stay open.
- TIMING (move frames): chin down 0-2 · chin up, body grows 6 px 2-7 · blink f6, smug face f10 · hand up 8-12 · finger ON the brim f12 · nod 8 deg 13-17 · hand down, arms cross 17-24 (3 f dip) · settle 24-27 · DEAD STILL. The loser answers 16 f after the start (4 f after the tip).
- PARAMETERS: `base {feet, hands, bow}, chinDown, grow, handUp, handUpN, brim, arc, tip, tipDeg, handDown, handDownN, land, headKeys, tuckAngle, tuck | null`.
- CAMERA: the take's last station lands 18 f after the move starts (travel 0.63 s, hold 0.8 s, creep 0), so the last frames are still.
- MUST CHANGE: the gesture (no hat: another small proud habit of THIS character), the tucked prop, the brim point, the word, the loser's answer.
- ARMOR: S5 film f220-262, on "clean spot"; `episodes/armor-no-holes/stretches/armor-s5-payoff/cast/ep_s5.mjs` lines 77-97; acts `build_film.py` lines 134, 140-142.
- LESSON: asked for by CB by name (2026-11-14); the ending before it was a head turn and a half-smile (`m_punch`, same file lines 85-87). Small is right: one gesture, then nothing moves.

### 8. Shared motion helpers  ·  `motion_core.mjs`
- WHAT: `snap` (the table 5, 16, 31, 48, 66, 79, 88, 93, 96, 98, 99, 100 %), `tr` (tracks of snapped keys that then hold dead still), `dip` (impact, 3-4 f), `ring` (settle), `arcUp`, `fistFor` and `shoulderAt` (a tool's tip ON a point), `walker` (planted foot does not slide), `H`, `mix2`, `F`, `barProp`, `sty`.
- FITS: every episode move. NOT: a camera or a set animation (those have their own easing).
- NUMBERS: a strike is 3-6 f; a counter 4-6 f; a dip 3-4 f and 7-12 px; a ring 5-10 f; a default snap 12 f with 66 % of the way after 5. `walker(t, v, Tstep)`: stride = v x Tstep and the film moves the card at v with `linear: true`.
- MUST CHANGE: nothing in the helpers; the numbers passed to them are the character.
- ARMOR: the head of every `episodes/armor-*/cast/ep_*.mjs` (the same 10 lines were copied into six files).
- LESSON: the copies are not the same any more (three of the six have no `arcUp`, one has no `H`). One exported copy ends that.

---
## CAMERA  ·  all in `camera/camera_pieces.json`

### 9. Push-in on a named thing inside one take  ·  key `09_push_in_on_named_thing`
- WHAT: push 0.3-0.5 s, the thing does something for about 1 s, pull back to a face. No cut.
- FITS: the thing is the twist, the proof, the joke or what the hero touches (a PICTURE_PLAN row marked CLOSE with a reason). NOT: "the voice says it"; a big or far thing (wide on the word); a list said fast (one picture where each item appears).
- NUMBERS: in 0.33-0.5 s (0.45 main example) · the thing's act starts 2 f after landing · rest 0.5-1.05 s, creep 0.0015-0.003 · out to a face in 0.27-0.47 s. Reference channel, measured: 96 % of named things on their word, about 40 % close, flight in 0.3-0.5 s, typical rest 0.9-1.3 s.
- MUST CHANGE: the thing and its act, the direction of the push, how close, the face it returns to.
- ARMOR: pins film f505-562 (bare ovals, then his stare), `build_film.py` lines 76-77; S4 f297-343 (barrel); S1 f63-127 (cowl).
- LESSON: 14 of CB's 23 notes were "named thing not shown, not close enough or not highlighted". But CB also: "It's not primary, it's secondary. It needs to match the scene." Decide in the picture plan, not during fixes.

### 10. Low-angle close-up on a mark being made  ·  key `10_low_angle_closeup_on_a_mark_being_made`
- WHAT: the camera drops to the ground, then rises and pushes in with a long lens onto the mark, looking up past the maker's arm and face; pulls back wide after.
- FITS: a mark is made overhead or on a wall and the maker's pride or care matters. NOT: a mark on a table (go over the shoulder), or when the hand hides the mark from below.
- NUMBERS: low point 0.12 m high, 19 mm, travel 0.73 s, hold 0.07 · close 0.55 m high, 68 mm, travel 1.1 s, hold 0.7 s, creep 0.002 · pull back 14 mm, travel 0.53 s, hold 2.0 s.
- MUST CHANGE: the mark, the surface and so the angle, the lens pair, what the wide reveals.
- ARMOR: S1 film f126-222, `build_film.py` lines 71-72, 82-87; use with piece 5.
- LESSON: closeness had to come from the lens: moving the camera nearer pushed the ring's points off the character's card (above about 205 px the kit cuts the drawing). Measure where the mark lands on the card before fixing the height.

### 11. Fly through an object to change place  ·  key `11_fly_through_an_object_to_change_place`
- WHAT: the take flies into a small opening of a story object until it fills the lens; the next place opens out of the same opening.
- FITS: the place changes AND an object of the story at that moment has an opening or a glow (the bullet hole, the lantern). NOT: the same place (use time passing), or no such object (use an 8-12 f blend).
- NUMBERS: bullet hole: travel 0.9 s, stop 0.62 m before a hole of radius 0.12 m, aim 1.2 m beyond it, hold 0.05; next stretch starts inside with hold 1.25 s and drift. Lantern: travel 0.2 s to 0.24 m from it, blend 10 f, out 0.24 m from its twin.
- MUST CHANGE: the object and why, which way the next place opens, the travel time.
- ARMOR: S1 f328-355 into S2 f0 (`armor-s1-hook/build_film.py` lines 16, 74, 90-91; `patch_cam.py`); S4 f163-170 (`armor-s4-turn/build_film.py` lines 86-88, 97-102, 128).
- LESSON: join frames are frozen once both sides are rendered; a later timing fix had to re-time the 11 frames before them onto the old path. And a shader the lens enters must guard `pow`, `sqrt` and divisions or the graphics card draws black.

### 12. Fly, land, rest  ·  key `12_fly_land_rest`
- WHAT: how a stretch is written: one take, stations that land on words, rests in which the acting happens.
- FITS: every stretch. NOT: an excuse for a restless camera: a rest with acting is 0.9-2.5 s.
- NUMBERS: travel 0.17-1.37 s · rest on a thing 0.5-1.05 s · pass-through 0.03-0.07 s · creep 0.0006-0.004 · drift 0.03-0.1 m · lens 24 default, 14-19 low wide, 40-68 close · kicks 0.3-1.0 · 8 stations in 11.9 s (S1), 15 in about 21 s (pins).
- MUST CHANGE: everything spatial; the film's own camera idea (`camera_idea`).
- ARMOR: `episodes/armor-no-holes/stretches/armor-s1-hook/build_film.py` lines 75-93 (each station with its purpose).
- LESSON: a stop on the wide "to show the wide" was cut in round 3 and replaced by one flight. Nobody cut by the frame edge at any frame of a rest: run `node tools/frame_checks/check.mjs`.

---
## EFFECTS

### 13. Highlight a named part with the part itself  ·  `fx/highlight_part.js` (`lightBand`, `markGlow`, `strongBlink`)
- WHAT: light ON the part: a warm band sweeping along it, a glow with a bright core on each marked spot, or hard blinks with a flash and an expanding ring. No outline, arrow or label; nothing else is dimmed.
- FITS: the voice names a PART of a bigger thing that is already in frame (wings, tail, engines). NOT: bright daylight (additive light washes out: use a glint or a colour change), more than about one highlight per sentence, or a part the camera could simply push in on.
- NUMBERS: band sweep 11-14 f from -1.1 rx to +1.1 rx, opacity 0.42-0.6 at the middle, fade in and out 5 f · mark glow 23 f · strong blink 3 x 9 f, each full on its first frame, decaying (1 - q) squared, glow swells 30 %.
- PARAMETERS: band `{f0, f1, rx, ry, band, dim, sweeps, axis}`; glow `{f0, f1, blinks, size}`; blink `{f0, n, len}`.
- MUST CHANGE: the part and its shape, the light colour (from the place's key light), the count of blinks (per syllable or per part), a cause in the world if there is one.
- ARMOR: pins film f108-131 (holes of plane one), f184-203 (paper wings), f250-277 (tail), f300-322 (paper tail), f520-546 (bare ovals); `sets_merged/airfield.js` lines 550-570, `hangar.js` lines 661-667; values `armor-pins-test/build_film.py` lines 60, 162-168.
- LESSON: round 7 (CB's note): the marks of plane one had to blink and the four bare ovals had to "blink hard", with the camera closer; a soft steady glow had not read. MEASURED HERE: `blinks: 3` gives only TWO visible pulses in the mark glow (the negative half wave is dark); for n pulses pass 2n - 1.

### 14. Many small things that fly and hit  ·  `fx/fly_and_hit.js` (`timetable`, `thingAt`, `boardShake`, `countIn`)
- WHAT: every small thing has a hit frame; it flies 5 f from a real muzzle point with a tapered streak, hits (one frame, head x1.7, mark x2.6, flash), quivers 16 f, throws 3 dust motes, then never moves; the surface shudders.
- FITS: the story has things put INTO or ONTO something in numbers, and a character sends them. NOT: things that are simply there (dress the set), fewer than about five (animate each by hand as an act), or a calm scene.
- NUMBERS: flight 5 f, arc 0.06 m, streak 1.7 f long · quiver 16 deg on the hit then 14 x exp(-d / 5.5) x cos(pi d / 3) · flash 8 f · dust 9 f · shake 12 f, capped · bursts one per frame (13, 9, 14), singles alone on words, a volley of 90 in 30 f with the last alone, a storm of about 300 in 53 f in 3 waves.
- PARAMETERS: `ARMOR` block (fly, arc, streak, scales, quiver, mark, flash, dust, shake) and the `groups` list.
- MUST CHANGE: the thing and its flight, the muzzle (a hand that fires on that frame), the mark, the quiver, the dust, what shudders, the landing ORDER (it tells the story).
- ARMOR: pins film f72-390; `sets_merged/hangar.js` lines 597-636; values `armor-pins-test/build_film.py` lines 17-22, 59-60.
- LESSON: the pins first simply appeared by a count; CB_RULES section 10 now says nothing just appears. The camera rides the first burst from the muzzle to the surface (stations at film f180 and f204).

### 15. The "hundreds" count close-up  ·  camera key `15_the_hundreds_count_closeup` + `fx/fly_and_hit.js` (storm, `countIn`) + `fx/highlight_part.js` (band)
- WHAT: the camera lands close on the surface while the things still arrive, so the number is seen growing; one pull back shows the whole.
- FITS: the voice gives a big number the viewer must believe. NOT: a number that is only said in passing, or when the things cannot be told apart at phone size.
- NUMBERS: in 0.5 s to 0.78 m, rest 0.95 s with a 0.05 m drift, out 0.8 s while the storm still lands · two band sweeps of 11 f · a counter plate inside the close frame · head size x1.8.
- MUST CHANGE: the thing counted, what makes the number believable here, the surface, the word, whether a hand places the newest.
- ARMOR: pins film f335-404; `build_film.py` lines 73-74, 59-60, 167; check script `armor-pins-test/hundreds_vs_rick.py`.
- LESSON: the head size factor, the flash on each hit, the second counter on the sheet and the light band were each added in later rounds (`armor-pins-test/SET_CHANGES.md`): plan them from the start. WEAK STILL: the reference reveals "many" in under half a second with a hand placing the newest; the armor close-up has no hand in it.

### 16. Burst of small living things from an opened container  ·  `fx/burst_of_living_things.js` (`posOf`, `stateOf`)
- WHAT: on the opening frame the creatures shoot up and out (spent after about 5 f), then each loops on its own orbit; a few have a job: two cross the lens, one lands on the rim and sits, one circles a character's head.
- FITS: a container of the story's own mess is opened and the smell or neglect is the point. NOT: sparks, dust or confetti (not alive), or a gag the story's world does not give (PICTURE_PLAN: leave the effect empty rather than add a stock one).
- NUMBERS: 14 creatures · burst out 0.25-0.75 m, up 0.55-1.15 m · loops 0.05-0.16 m radius · crossers at the lens 4-34 f after the burst · lander down by 26 f, sits from 28 f · life 66-110 f · wing beat 2.9 rad per frame.
- PARAMETERS: `{f0, n, at, land, lens, chief, life, out, up, burstTau, loop, driftFrom, drift, crossers, crossIn, crossOut, lander, landIn, sitFrom, visitor, visitIn, wingBeat}`.
- MUST CHANGE: the creature, the container and why it is full, the jobs, the count, the light they are seen against (dark bodies need a pale background).
- ARMOR: S4 film f306-416, lid f304, camera lands f312; `sets_merged/fx_s4.js` lines 85-100; `armor-s4-turn/build_film.py` lines 79, 113-114.
- LESSON: added in round 4 as the gag that grows out of this story's barrel. Sound on the burst frame (`flies_buzz_burst`) and the lid scrape 2 f before carry half of it.

### 17. Time passing in one shot  ·  `fx/time_pass.py`
- WHAT: the same take rendered in two lights, laid over each other across 24 frames with a soft edge that travels (sky first, ground last) while the camera flies.
- FITS: the place stays and hours pass (night to dawn, noon to dusk, a lamp lit). NOT: a change of place; or two renders whose camera or acts differ by a frame.
- NUMBERS: pass f108-132 of 263 (0.8 s), soft edge 0.6, during a flight that lands at f128; only the pass frames are rendered twice.
- PARAMETERS: `dir P0 P1 T --soft 0.6 --from top|bottom|left|right --a n --b d`.
- MUST CHANGE: the two light set-ups, where the change starts, the length, and what else in the set shows the time (armor: the lantern, the chalked words appearing).
- ARMOR: S5; `episodes/armor-no-holes/stretches/armor-s5-payoff/time_pass.py`, `build_film.py` lines 1-3, 19, `render_dawn.sh`.
- LESSON: a fix that touched only the dawn half re-rendered only frames P0 onward and reused the night frames (`render_dawn.sh`): keep the two halves in separate folders.
