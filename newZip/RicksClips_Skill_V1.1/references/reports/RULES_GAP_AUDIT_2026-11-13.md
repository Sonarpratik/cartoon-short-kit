# RULES GAP AUDIT, 2026-11-13 (librarian; read-only on CB_RULES.md and SKILL.md)

Question: which lessons sit in the side notes (`cloud_rules/`, `memory/`, `HANDOFF.md`) but not in `CB_RULES.md`?
**This audit is NOT complete.** The run was stopped before every source was read. Section 7 "NOT READ" lists what was skipped. Counts below cover only what was read.

Read in full: `CB_RULES.md` (all 262 lines), `cloud_rules/` except `look/TEXTURE_3D_2026-11-08.md` (fireworks `SHOT_SPEC.md`: about 60 %), 67 of about 107 `memory/` notes, `HANDOFF.md` sections 0c to 1a. `SKILL.md`: headings only, plus greps.
Code checks were done by looking: `templates/`, `tools/`, `episodes/` listings and greps of `film.js`, `render.mjs`, `puppets.mjs`, `poses.mjs`, `tools/film_plan.py`.

## 1. Summary

| Class | Meaning | Count (of what was read) |
|---|---|---|
| A | already in CB_RULES.md in substance | about 70 lessons (not listed one by one; see 1a) |
| B | MISSING, said or approved by CB | 14 rules + 1 block of 12 build fixes |
| C | MISSING, draft or agent proposal, CB has not approved | 9 |
| D | contradicted by a newer rule, or CB_RULES contradicts itself / its own tool | 9 outdated side notes + 6 contradictions inside CB_RULES or its tools |
| Tools | named in a note or rule, not on this PC | 19 |
| Dead references | CB_RULES / SKILL / agents name a file that is not here | 16 |

### 1a. Class A, where the big side lessons already are
- Cart army camera table (100 % moving, 6 cuts, 1 pull back in 8, half speed): CB_RULES 6 "CAMERA MOVEMENT, ALWAYS" (line 211). Hands on 3D tools, marching crowd, grass wind: section 5 "HANDS ON OBJECTS, MARCHING CROWDS, GRASS" (196).
- Roller coaster round 2 (9 points): section 8 "MECHANICS, BANNERS, EFFECTS" (261); point 9 costume shade: section 4 (142).
- Roller coaster handover point 7 (storyboard carries grade, haze, detail; the note says "NOT yet in CB_RULES"): now section 3 "ALWAYS GRADE" (83).
- Magic bell rebuild v4 notes: sections 2, 5, 6 (45-51, 173-177, 202-205) and section 8 (247-260).
- STUDIO_MOTION: the sequence names, on ones, snap 70 % in 5 frames, head leads / lags, arcs, counter-move, prop settle, dead still, smears, head pop are in section 5 (170, 171, 177, 188, 191). What is NOT covered: B1, B2 and C1 below.
- Grips, kneel, lying, grip logic, acting faces, long cloth motion, costume shade, three sizes, bible, hair, hats, face gear, outfits: section 4 (146-164) and 5 (189). The side notes that say "NOT on the PC yet, waits for CB's OK" for these are outdated: the files and keys are on the PC (checked: `grips.mjs`, `cloth_live.mjs`, `lie_cam.mjs`, `test_faces.mjs`, `costume_shade` in `film.js`, face presets in `char2d.mjs`).
- Feature-film finish, 16-frame check, signature detail, storyboard early, Blender layers, Blender never weaker, coded light: sections 3, 4, 6, 7.

---

## 2. CLASS B: missing from CB_RULES.md, said or approved by CB (ready to paste)

### Section 1, Script and voice

**B10. One narrator voice, also for quotes.** Source: `cloud_rules/episode_lessons/baboon-signalman/notes_memory_full_2026-11-10.md` (00:41).
```
- [ ] ONE VOICE, ALSO FOR QUOTED LINES (CB 2026-11-10, baboon film: "just tag different tone for speaker", "use same voice"). A character's quoted line is read by the same narrator voice with its own tone tag ([angry], [soft] ...). No second or third voice for characters, no cloned real-person voices. Reason: CB heard separate character voices and found them weird. Apply: the writer tags the quote line; the voice take is one speaker. Enforced by: writer check (one speaker id in the voice request).
```

**B11. Caption detail.** Source: `memory/cb-captions-face-shadow-rick.md` (measured on 30 frames after CB "make caption font and size like ricks"). Add to the existing caption line (42):
```
  Caption detail (measured on 30 reference frames, CB 2026-11-11 "make caption font and size like ricks"): lowercase as spoken, punctuation kept, soft dark drop shadow; one word, or two only when the first has 3 letters or fewer ("a ball", "get out."). Enforced by: kit film.js default caption style (caption_style "old" is the old look; caption_scale is ignored).
```

### Section 4, Characters

**B3. No shade on faces (needs one word from CB because it strikes older lines).** Sources: `cloud_rules/episode_lessons/cart-army/CB_FIXES_2026-11-13.md` row 1 (CB 2026-11-13 08:42 Bangkok: "shadow on his face (rule: no face shadow)"); `memory/cart-army-cb-notes-v2.md` (CB 09:13: "sometimes his face is darker"); `memory/crew-test-shot-fireworks.md` ("Face side shadow off (card_shade amount 0, CB 2026-11-12 22:36Z), rim kept"). CB's exact 22:36Z words are not in the notes.
```
- [ ] NO SHADE ON FACES (CB 2026-11-13 08:42 Bangkok on cart army animatic v2, fix list row 1: "shadow on his face"; 09:13: "sometimes his face is darker"; fireworks test 2026-11-12 22:36Z: face side shadow off, rim kept). A face is never darkened: no brim band (hat_shadow 0), no costume shade on skin, no card light that dims the face, and film.json card_shade amount 0. The pale rim on the lit edge stays. Reason: CB has now removed a face shadow in three films. Apply: on every storyboard sheet zoom into each face; a grey patch = fix before sending. Enforced by: film.json card_shade.amount 0 and hat_shadow 0; costume_shade skips skin (kit film.js).
  OLDER LINES THIS TOUCHES (the lead asks CB which stand): "RICK EDGE SHADOW on every head" (line 132), "Face 3D shadow is now drawn by the template" (140), "The template's thin soft side crescent on the face stays" (141), "at night ... the face goes darker with the scene" (166).
```

**B12. Shoes.** Source: `memory/memory-index-more-4.md`.
```
  Footwear (CB 2026-11-10, Wrong Helmet cast): no shoes; if a story ever needs footwear it covers the whole foot.
```
(append to line 135)

**B13. One character first.** Source: `memory/character-long-outfits-2026-11-12.md` (CB 2026-11-12 01:52: "show only one charcter template first").
```
- [ ] ONE CHARACTER FIRST (CB 2026-11-12 01:52 Bangkok: "show only one charcter template first"). A new outfit idea, body idea or finish is shown to CB on ONE standard character in the four views, and only after his OK rolled out to other forms and the cast. Reason: CB corrected each step live; a full sheet of a wrong idea wastes a round.
```

**B14. Personality lives per film.** Source: `cloud_rules/crew/pending_not_yet_approved/char_id_rule_lines_2026-11-13.md` (CB 2026-11-13 02:57 Bangkok: "but this depends on the story"). The rest of that file is class C (C2). Edit inside CHARACTER PRESETS (153), section 3 of the preset:
```
  (CB 2026-11-13 02:57 Bangkok: "but this depends on the story") The personality profile belongs to the FILM: it is written in that film's CAST_PERSONALITY.md under the character's ID. A profile stored in the preset is only an optional default. A costume for a new story becomes an approved variant of the same ID after CB has seen it.
```

### Section 5, Movement and acting

**B1. Faces change as a step.** Source: `cloud_rules/motion/STUDIO_MOTION.md` section 1 rule 4 and `memory/studio-motion-2026-11-11.md` (CB 2026-11-11 17:37Z sent the five rules himself; measured: one-frame face changes at f1194-1195). CB_RULES says WHEN a face changes (on the word) but not HOW.
```
- [ ] FACES CHANGE AS A STEP (CB 2026-11-11 17:37Z, one of his five measured rules: "faces change as a step"). A face, eye, mouth shape, lamp or button state changes in ONE frame, with no in-between drawings; the head pop (HEAD WOBBLE) sells it. Reason: measured on the reference button film, breath-hold face to squeezed eyes in one frame. This replaces the 2026-11-10 pick of an 8-frame face blend. Apply: film.json "tween": { "face_frames": 0 }. Enforced by: film.js tween.face_frames; the motion gate "face in-betweens" that STUDIO_MOTION names is NOT in tools/film_plan.py on this PC (see section 5 of the audit).
```

**B2. Cut on the word.** Same sources (rule 5; "our baboon film already passes the new gate (every cut within 2 f of a word)").
```
- [ ] CUT AND CHANGE ON THE WORD (CB 2026-11-11 17:37Z, one of his five measured rules: "cut on the word"). Every cut, blend start and place change starts within 2 frames of a narration word. Enforced by: the plan gate named in STUDIO_MOTION ("cuts on the word"); it is NOT in tools/film_plan.py on this PC.
```

**B4. Every narrated verb is seen.** Sources: `memory/cart-army-cb-notes-v2.md`, `cloud_rules/episode_lessons/cart-army/CB_FIXES_2026-11-13.md` (14 misses: drill not visible, board not carried, strings twist not seen, foot line, coat teleports, rope lit with no fire).
```
- [ ] EVERY NARRATED VERB IS SEEN (CB 2026-11-13 08:42 Bangkok on cart army animatic v2: "there so many details you missed. even we give the new rules. did you take the rules yet?"; 14 notes, most of them a spoken action that was not acted: drill, carry the board, twist the strings, mark the line with his foot, take the coat off, rip it off, light the rope). Before an animatic is shown, walk the script word by word: each verb has a shot where the doer does it with hands on the object, close enough to read (a close shot of the hands when the act is small). A prop that changes owner or place is carried there (NO TELEPORT). Fire, dust or sparks come with the act that makes them. Reason: the camera and effects were polished while the actions were missing. Enforced by: a "verb" column in the shot table (verb, shot, frame where it reads); a row without a frame = not sent. It extends PICTURE SENTENCE CHECK (section 0).
- [ ] FEET AND EYES ZOOM SHEET (CB 2026-11-13 09:13 Bangkok on the fix sheet: "soldier still stuck in the ground", "his face is on the side cant see eyes", "sometimes his face is darker"). Before any sheet or animatic goes to CB, make one sheet that zooms into every character's feet and every character's eyes: soles on the ground, both eyes readable, no face darker than the others.
```

**B8. One action or one feeling per beat.** Source: `memory/cb-motion-feedback-2026-11-10.md` (CB 2026-11-10 on baboon animatic v1: "one motion one feeling", "too many expression changes", "give me samples so I can pick").
```
- [ ] ONE ACTION OR ONE FEELING PER BEAT (CB 2026-11-10, baboon animatic: "one motion one feeling", "too many expression changes"). Each shown character plays ONE action or ONE feeling per narration beat: no stacked gags, about one face change per line on the word that earns it. For an open motion question CB gets side-by-side samples to pick from ("give me samples so I can pick").
```

### Section 6, Camera, transitions, effects, sound

**B6. A hold is a creep.** Source: `cloud_rules/episode_lessons/cart-army/LESSONS_FOR_FUTURE.md` section 1 (CB 2026-11-12 13:49Z "always remember the camera movement"), fireworks `SHOT_SPEC.md` ("every rest is a creep under 2 px/f ... the push continues at the same speed (no hop) ... the turn stays one way"). Add to CAMERA MOVEMENT, ALWAYS (211):
```
  A HOLD IS STILL A CREEP: the camera is never parked. On a face or a word it slows to a creep (about 0.3 to 2 px per frame at plan size) and keeps the same direction of travel into the next move: no hop to a new station, no change of turn direction inside a beat. His "whip up the wall" at 2.1 s is ONE move, not a cut. Reason: measured, the reference camera moves 100 % of the time. Enforced by: tools/film_plan.py gates "dead still % of frames" and "rests per 10 s" (the second one must be retuned, see D-T1).
```

**B5. Animatic at full size.** Source: `memory/no-teleport-follow-camera-move.md` (CB 2026-11-11 17:03Z: "character need to be sharp everytime he is in the frame"; cause: animatic rendered at 540x960 and upscaled). The kit README says `--animatic` writes half size by default.
```
- [ ] ANIMATICS ARE RENDERED AT FULL SIZE (CB 2026-11-11 17:03Z, roller coaster: "character need to be sharp everytime he is in the frame"). The soft characters came from a half-size animatic scaled up. Render every animatic CB sees with `render.mjs --animatic --scale 1` (1080x1920).
```

**B7. Highlight on the named object is light, not a sticker.** Source: `memory/cb-physical-and-highlight-rules.md` (CB 2026-11-10 04:21 "what about highlight vfx i didnt see anything?"; 05:11 "you use too much cartoon highlight effects. like stars etc. that looks too cartoonish. it needs to look cool. like ricks clips."; 05:49 on the light-only version: "Perfect now").
```
- [ ] THE HIGHLIGHT IS LIGHT ON THE NAMED OBJECT (CB 2026-11-10: "what about highlight vfx i didnt see anything?", then "too much cartoon highlight effects. like stars etc. that looks too cartoonish. it needs to look cool", then on the light-only version "Perfect now"). When a line names an object, that object's own surface glows in a flat saturated colour with a soft bloom for about a second, seen at first viewing. Metal gets ONE thin horizontal lens streak, never a cross (a cross reads as a star). No glow washed over a character; a face may change colour, only the face. Enforced by: film.json "highlights" (film.js: emissive tint + bloom, "flare": true).
  CONFLICT FOR CB: line 195 CARTOON POWER VFX (2026-11-12) lists "stars after a hit" and "shock lines"; line 191 says "never ... stars or clip-art bursts". See D-I3.
```

**B9. Places, light and scale (the 2026-11-10 cinematic rules).** Source: `cloud_rules/episode_lessons/wild-office/CINEMATIC_RULES_2026-11-10.md`, `memory/rick-compare-2026-11-10.md`, `HANDOFF.md` 0a (CB: "apply all to knowledge. but the camera movements really depends on the scene and situation"). They are in SKILL.md "Cinematic rules" but CB_RULES has no line for places or scale.
```
- [ ] PLACES, LIGHT AND SCALE ARE DECIDED BEFORE ANYTHING IS BUILT (CB 2026-11-10 on the baboon film: "our is less cinematic", "apply all to knowledge"). A film of 55 s or more uses 5 to 8 places and 2 to 3 kinds of light; a one-place story gets more views of it as places of their own (from the air, inside the vehicle, under the machine, the same set at dusk). A third to a half of the film is led by the world or the story object, with at least three towering shots; then go very close; the middle size is the dull one (about 20 % of the time). The beat list names place and light for every beat. Full text: SKILL.md "Cinematic rules". Enforced by: tools/film_plan.py gates places >= 4, most used light <= 75 %, world-led 25-40 %, medium <= 28 % (films under 30 s exempt).
  NOT CARRIED OVER: that rule's "aim for 3 rests per 10 s" is replaced by CAMERA MOVEMENT, ALWAYS (D-T1).
```

**B15. Crowd faces vary.** Source: `CB_FIXES_2026-11-13.md` row 11 (CB: "soldiers all look the same"); fix that worked: 8 face x beard cards as 64 instanced meshes. Add to 6b CROWDS AND TEAMS (224):
```
  Crowd figures are not clones (CB 2026-11-13 08:42 Bangkok, cart army: "soldiers all look the same"): vary eyes, mouths, beards and expressions across the crowd cards (cart army: 8 face and beard variants), and the crowd walks on its own step phases, never glides (CB 2026-11-12 11:59Z: "the arme need to walk not gliding").
```

**B16. Music folder and sound index.** Source: `memory/final-render-sound-notes.md` (library on the PC: `rick-shorts/audio/library.py`, `library_index.csv`, music in `Downloads\BACKGROUND MUSIC`; all three exist, checked). Add to SOUND EFFECTS COME FROM CB'S LIBRARY (208):
```
  Music comes from <YOUR_MUSIC_FOLDER> the same way. Search both folders through the index first (rick-shorts\audio\library.py, library_index.csv) before any synthetic sound.
```

### Section 0, How to work

**B17. Every thread links the PC first.** Source: `memory/connect-pc-at-thread-start.md` (CB 2026-11-11: "Every thread in this project should connected").
```
- [ ] EVERY THREAD LINKS THE PC IN ITS FIRST TURN (CB 2026-11-11: "It should connect to the skill", "Every thread in this project should connected"). A cloud thread posts the connect card before other work; until linked it works from project files and queues PC writes. Reason: rules could not be written to the skill and CB had to be asked mid-work.
```

### Section 8, Build fixes (CB's standing order: 2026-11-11 "make sure every problem is solve and upograde to the skill"; OPTIMIZE FIRST; LESSONS LIVE IN THIS FILE). No single CB quote per line.

```
- [ ] PLAN AND RENDER TRAPS (cart army, baboon, magic bell, roller coaster, 2026-11-10 to 11-13; sources cloud_rules/episode_lessons and memory notes of those films):
  1. After every `python plan/gen_film.py` run `python tools/film_plan.py check film.json` before rendering: the renderer reads the baked plan in out/plan, so without the check the OLD plan is rendered (cart army round 3).
  2. Never regenerate film.json while a render runs (the resume script skips frames by film.json time). Delete out/.puppet_cache after any cast change.
  3. Never add a `//` or `#` comment in the middle of a line when patching .mjs, .js or one-line Python: it swallows the rest of the line (hit three times: baboon kit, cart army fort.js lost its launch events, magic bell got a black silhouette). Comments go at the line end or in /* */.
  4. A push-in can carry the hit hand or the head out of frame: check the hit frame at the END of the push, and check head and subject inside the frame on EVERY frame of a move with a dense strip, not one still (CB 2026-11-11 20:30Z: "half of his head is missing in the first second").
  5. Compare with the reference in dense strips between the matched seconds too: the roller coaster film matched at the 33 chosen frames and differed a lot between them.
  6. Two characters shown one after the other at the same angle read as a morph: give each its own angle (magic bell booth shots).
  7. A library walk drawn with dir -1 still advances the same way, so the feet slide: draw dir 1 and flip the card.
  8. Blender mask pass: set the world to holdout, do not hide it, or the cast is pasted over things that stand in front of it (boy through the cookie jar).
  9. Screen direction: with the camera looking south, plan +X is screen LEFT. Pose names must be unique across kit and episode.
  10. Card light colour must be a THREE.Color (a Vector3 multiply gives NaN and a black card).
  11. Blender on the PC: start long jobs with subprocess.Popen, never subprocess.run inside the open Blender (it blocks the UI); a card image sequence needs image_user.frame_duration to cover every scene frame or cards turn magenta.
  12. An episode that patched the plan tool (per-station dof, aim_via) must be baked with ITS plan tool: re-running the master tools/film_plan.py drops the patch silently (fireworks round 5).
```

---

## 3. CLASS C: missing, draft or agent proposal, CB has not approved (CB decides)

- **C1. STUDIO_MOTION numbers** (`cloud_rules/motion/STUDIO_MOTION.md`, header "draft v1, waiting for CB's OK"). CB approved the principle on 2026-11-13 evening (CB_RULES 170-171). NOT approved and NOT in CB_RULES: the per-beat frame table (notice 4-5 f + settle 6-8 f; read hold 8-18 f; anticipate 6 f at 25-35 % of the strike distance; hold 4-10 f; strike 7 f; impact dip 6-10 px; settle 8-12 f); per-move numbers (walk 12 / 17 / 7 f per step, run 3-6 f per step with a 2 f crouch and a 6-10 f skid, eyes lead the head by 2-3 f, blink 4 f every 0.5-2.3 s and never mid-line, take: freeze 6-10 f then hold 18-30 f, double take); squash on props only; key pose lean 8-15 degrees and readable as a black silhouette; hands on an arc with 15-25 % bend. Recommendation: CB sees the proof clip named in the guide (`studio-motion/press_old_vs_studio_v1.mp4`, not on this PC) and says OK; then the table goes into section 5 as "STUDIO MOTION NUMBERS".
- **C2. Character ID "HOW IT IS BUILT"** (`cloud_rules/crew/pending_not_yet_approved/`): registry path, `char:CHAR_xxx` in film.json, render stops on a look key, `char_id.mjs check` and `film` gates, new character = draft then lock. HOLD until CB OKs the install; the tool is not on the PC.
- **C3. Clean plate**: 40-50 % of the frame a plain calm area (`memory/picture-mechanism-rick.md` point 3, an agent measurement on one film). It pulls against ALWAYS GRADE / "more detail on EVERYTHING". CB to say which wins per shot kind.
- **C4. Same-kind frames beat the 6b medians**: fireworks lead used night sat 0.50-0.60 because his snow nights measure 0.59-0.73 against 6b's 0.40-0.50 (`LOOK_BIBLE.md` "Grade (lead's call)"; the note says "Tell CB"). No CB answer recorded.
- **C5. Card light by three rays** toward the key light (cart army `ep_card_light`). After CB's "sometimes his face is darker" the shade colours were moved close to the sun colour. Technique only; depends on B3.
- **C6. Honest time estimates** on long runs, updated when they slip (`memory/show-preview-early.md`; the agent's own conclusion from CB's "why it take so long?").
- **C7. Single writer and staged write** of the rule files (coordinator's decision 2026-11-11 after two overwrites; `memory/rule-files-single-writer.md`). CB_RULES line 5 says "add it HERE first" but not who writes or how. Note: the CB_RULES header still says "Last update 2026-11-11".
- **C8. Look-pass numbers of the 2026-11-10 cinematic rules** (sun 25-40 degrees, blue shadows b* -4 to -12, vignette 0.65-0.75, haze lift 6-14). They are in SKILL.md; the vignette number pulls against line 111 "no added contrast or dark corners in the finishing step".
- **C9. Night light**: roller coaster handover, CB decision 4 of 2026-11-11: "Night: light on platform and character; background trees and field stay dark". CB_RULES 111 says "Night = an evenly lit scene tinted blue". Both recorded as CB's; CB to say which.

### Proposed hard gates (the lead applies; nothing here was changed)
1. **Static pose gate** in `tools/film_plan.py`: count acts whose pose does not start with `m:` (walk exempt only if it is a library walk); FAIL above 0. CB_RULES 169 already says this gate exists; it does not (D-T2).
2. **Drawings per second gate**: after the bake, per character, unique drawn states per second while acting; FAIL under a set number when `tween.ones` is true (CB_RULES 171 "CHECK before any storyboard" has no script).
3. **Camera gate retune** (D-T1): "rests per 10 s" PASS band 0.5-2.0, "dead still" FAIL above 10 %, drop the fix text "add or lengthen station holds".
4. **Read gate**: the plan check refuses to run unless `episodes/<name>/crew/lead/RULES_READ.md` lists CB_RULES.md, `cloud_rules/episode_lessons/` and `cloud_rules/motion/` with the file dates read.

---

## 4. CLASS D: contradicted

### 4a. Side notes that a newer CB_RULES line replaces (newest wins)
| Side note | Says | Replaced by |
|---|---|---|
| `memory/cb-motion-feedback-2026-11-10.md` | tween 7 frames ease-out, face_frames 8, "no 1-frame snaps" | section 5 lines 170-171 (ones, snap) and B1 |
| same; `memory/cb-video-preferences.md` | captions 50 % smaller (`caption_scale` 0.5) | section 1 line 42 (3.9 % of frame height) |
| `memory/picture-mechanism-rick.md` point 4 | no haze, no dust | section 3 HAZE AND DUST (75) |
| `memory/cb-face-no-drawn-shading.md`, `cb-white-face-edge-shadow.md` | plain white, then self-lit lock | section 4 line 166, and B3 |
| `memory/no-rough-blockins-to-cb.md` | never show a rough block-in, depth first | section 7 STORYBOARD TO CB AS EARLY AS POSSIBLE (229) |
| `memory/body-sizes-2026-11-12.md` | four sizes, never thin | THREE BODY SIZES (151) |
| `cloud_rules/characters/style_change_2026-11-11` rule 22 | thighs become part of the outfit | SITTING / KNEELING legs lock (144) |
| `roller-coaster/README_HANDOVER.md` decision 2 | old Stage 1 / Stage 2 workflow stays | BLENDER = ONLY THE LAYERS (113) |
| `memory/cb-motion-feedback` rule 6, baboon notes | opening camera from above onto the hero | FULL BODY FORM: camera cranes down to character height (194) |

### 4b. CB_RULES.md against itself (the lead should strike or merge)
- **D-I1 Faces.** Line 131 "self-lit ... LOCKED ... Do not let scene light shade the heads" and line 132 "RICK EDGE SHADOW ... made by edge_shadow.py" are still unstruck; line 166 says it "replaces the 15:30 self lit lock"; lines 140 and 259 say do not use edge_shadow.py on v12+ cards. Then B3.
- **D-I2 Grain.** Lines 75, 77, 80: "no grain". Line 112 (2026-11-13): "fine film grain".
- **D-I3 Stars.** Line 191: "never ... stars or clip-art bursts". Line 195: "stars after a hit". CB 2026-11-10 rejected stars (B7).
- **D-I4 Held props.** Line 252: "Held props are drawn AT the hand in the card ... Never a separate floating prop". Line 124: "Held and near props are real 3D objects ... never drawn inside the flat character card". The kit now has `held3d` (README "Added 2026-11-13").

### 4c. Tools against the rules
- **D-T1 Camera gates reward stations.** `tools/film_plan.py` line 497: "at rest (< 2 px/f), % of frames" PASS at >= 30, fix text "add or lengthen station holds"; line 499: "rests per 10 s" PASS 2.2-4.5, "aim 3"; line 583: "at rest while a face is on screen" >= 40 %; line 534: word stations must be at rest. CB_RULES 96 says about 1 rest per 10 s (ours 4.9 was the fault) and 211 says the camera moves 100 % of the time. A plan that passes these gates hops between stations.
- **D-T2 A gate the rule claims does not exist.** CB_RULES 169: "GATE: the plan check counts acts that are not library moves; any above 0 fails the plan". `tools/film_plan.py` has no such gate (grep for library, m:, static: no gate). Its acting gates count pose or face CHANGES per 10 s, which static poses pass.

---

## 5. TOOLS, kit keys and code paths a note names that are NOT on this PC (checked by looking)

| Named in | Thing | Found |
|---|---|---|
| STUDIO_MOTION s7, `agents/animator.md` lines 24 and 30, SKILL.md line 105 | `templates/motion_styles/studio.mjs` (snap, step, arc, squash, kick, pop, blink) | MISSING |
| same | `templates/motion_styles/check_motion.mjs` (the animator's gate "0 twos, 0 linear, settles present") | MISSING |
| STUDIO_MOTION s7 | `compare.mjs`, `moves/act_button_studio.mjs` | MISSING |
| STUDIO_MOTION s7, `agents/animator.md` line 30 | motion gates in `tools/film_plan.py` (cuts on the word, face in-betweens, tween curve, moves on ones, idle sway) | NOT in the file |
| CB_RULES 169 | plan gate counting non-library acts | NOT in the file |
| CB_RULES 194 "compute the down-angle to every character per shot" | down-angle check | NOT in `tools/film_plan.py` (the fireworks `frame_check.json` came from its episode patch) |
| fireworks SHOT_SPEC round 5 | per-station `dof` pass-through in the plan tool | `film.js` reads `c.dof`; `tools/film_plan.py` has no `dof` |
| `memory/cart-army-episode.md` | `aim_via` in `tools/film_plan.py` | NOT in the file |
| CB_RULES 171 (episode moves "played by the kit's motion-library bridge") | a way to load an EPISODE move | `puppets.mjs` line 110 looks moves up only in the master library; `render.mjs` copies only `templates/motion_styles/moves/`. No episode hook found |
| CB_RULES 171 (the fireworks boy's moves kneel, pocket, flick, light, take, brave, flee, lookup, rise, home) | the source of those moves | `episodes/fireworks-test/` on the PC holds only `look/`, `out/lock`, `out/held3d`, `final/`, `assets_log.md`: no plan, sets, cast, film.json or kit_patch. The one worked example of "every action is a move" has no source here |
| CB_RULES 153; cloud_rules char_id README | `tools/char_id.mjs`, `templates/vector2d_characters/code/char_id/` | MISSING (waits for CB's OK) |
| `memory/no-teleport-follow-camera-move.md`, cart army WHAT_IT_TAKES | `ep_dissolves` / `renderCoast` (quick cross blends with both cameras moving) | NOT in `film.js` or `render.mjs` |
| cart army notes | `ep_arms`, `ep_card_light`, `ep_grade`, `ep_detail`, `fx_force`, `preview_grass` | NOT in master `film.js`; `ep_kit.js` exists only under `episodes/roller-coaster/fxkit` and `episodes/wild-office/sets` |
| CB_RULES 196, 211, 142; SKILL.md | `episodes/cart-army/` (LESSONS_FOR_FUTURE.md, `kit_patch/film_costume_shade.js`, render_resume.sh) | whole folder MISSING; the lessons file is at `cloud_rules/episode_lessons/cart-army/` |
| CB_RULES 217, SKILL.md, one agent | `research/rick-ref-2026-11-11/tools` (tr.py, measure.py, summ.py: the camera tracker for the side-by-side) | MISSING. `tools/measure/cam_track.py` exists; not checked whether it does the same |
| CB_RULES 247, 259, 260 | `proj.py`, `hall_head.py`, `post6b.py` (magic bell) | none found anywhere in the skill folder |
| CB_RULES 132 | `edge_shadow.py` | MISSING (`templates/blender_look/card_edge_shadow.py` exists) |
| kit README | head wobble on plain poses | fires only on `m:` poses in films with `tween.frames` |
| librarian brief | `<HOME>\Documents\claude-animated-shorts\library\` | path not found from this session; the skill's own `library/` exists and was not read |

## 6. DEAD REFERENCES in CB_RULES.md, SKILL.md and agents

1. SKILL.md line 116: `crew/TEST_SHOT_PLAN.md`. Not at the skill root; it is at `cloud_rules/crew/TEST_SHOT_PLAN.md`.
2. SKILL.md (2 places) and one agent: `tools/measure/script_stats.py`. The script exists but reads `references/scripts/*.txt` (folder missing) and `references/video references/` (the folder here is `references/video`).
3. `agents/animator.md` lines 24 and 30: `studio.mjs`, `check_motion.mjs`, "film_plan.py check motion gates" (section 5).
4. CB_RULES 169: the static-pose plan gate (D-T2).
5. CB_RULES 247: `proj.py tune.json` "before EVERY render". No proj.py here.
6. CB_RULES 259, 260: `hall_head.py`, `post6b.py`.
7. CB_RULES 132: `edge_shadow.py`.
8. CB_RULES 217 and 216: `research/rick-ref-2026-11-11`.
9. CB_RULES 196, 211: `episodes/cart-army/LESSONS_FOR_FUTURE.md`.
10. CB_RULES 142: `episodes/cart-army/kit_patch/film_costume_shade.js` (the key itself is in the master `film.js`).
11. CB_RULES 261: `episodes/roller-coaster/final/LESSONS_round2_2026-11-13.md` (copy at `cloud_rules/episode_lessons/roller-coaster/`).
12. CB_RULES 141: `episodes/roller-coaster/blender_check_2026-11-12/eye_shadow_before_after.png`.
13. CB_RULES 262: `episodes/fireworks-test crew/LEAD_QUEUE.md`, `look/hybrid_v1/README.md`, `look/dump_decals.mjs` (LOOK_LOG.md exists; dump_decals.mjs is in `templates/threejs_film/`).
14. CB_RULES 144: `new-characters/style_change_2026-11-11/v23_bigger_fists/`.
15. CB_RULES 153: "the master registry lives in the kit" (not installed).
16. HANDOFF.md open point 7: `library/lessons/` (the library has `pitfall/` and `solution/`, no `lessons/`).
Point of order: `START_HERE.md` line 14 already tells a new account to read `memory\` and `cloud_rules\episode_lessons\`; CB_RULES section 0 line 30 says "Notes and memory are not the skill" and names only CB_RULES, SKILL and HANDOFF. The two start instructions disagreed until line 172 was added today.

## 7. NOT READ (the audit does not cover these)

- **SKILL.md bodies**: only headings and greps. A rule that is in SKILL.md but not CB_RULES.md was caught only for the 2026-11-10 cinematic rules.
- **cloud_rules**: `look/TEXTURE_3D_2026-11-08.md`; about 40 % of `episode_lessons/fireworks-test/SHOT_SPEC.md` (blocks 4 to 11 and the beat-frame tables).
- **memory/** (about 40 notes): baboon-signalman-episode, blenderkit, cast-hair-review-2026-11-12, cinematic-master-qa-loop, creatorize-comparison, creatorize-video-2026-11-09, episode-files-lost-2026-11-06, explainer-video-skool, face-gear-2026-11-12, face-white-history, hair-library-2026-11-12, hand-grips-kneel-lie-2026-11-12, hands-grip-kneel-lying-2026-11-12, head-fit-body-test-2026-11-12, head-wear-2026-11-12, lock-v2-look-pass, magic-bell-episode, mix-and-match-wardrobe-rule, motion-styles-history-2026-11-10, niche-research-2026-11-10, night-witches-episode, onoda-episode, other-creator-formula-comparison, other-skills-comparison-2026-11-09, outfit-library-2026-11-12, outfit-library-applies-everywhere, pipeline-audit-2026-11-09, pov-survival-pilot, premium-finish-all-characters-2026-11-12, production-materials-blender, rick-3d-texture-style, rick-painted-style, roller-coaster-history, roller-coaster-history-2, roller-coaster-history-3, story-driven-world-building, vector2d-character-rig, vector2d-rig-hook-requests, wild-office-episode, wrong-helmet-episode. Several notes that were read were cut at about 2,400 characters per paragraph.
- **HANDOFF.md** lines 120-273 (the 2026-11-05 state): grepped only.
- **library/** (17 pitfalls, 4 solutions, INDEX.md, README.md, blenderkit_assets.md): not read. No library note was written or bumped by this audit.
- **references/reports/**: none read (gravebell_lessons.md, railway_notes.md, PIPELINE_AUDIT_2026-11-09.md, RICK_SCRIPT_PATTERN_2026-11-13.md, REMEASURE_2026-11-05.md, creatorize_comparison.md and the measurement reports).
- **rules/** (CB_cinematic_master_2026-11-13.md, CB_feature_film_prompt_2026-11-13.md), **agents/** (only greps), **episodes/** own notes (BLUEPRINT_NOTES, SET_NOTES, NOTES*.md, armor-no-holes `crew/`), CINEMATOGRAPHY.md, WORKFLOW.md, DENSITY_RULES.md, START_HERE.md (grep only).
- Not verified in code: whether `film.js` "ease": "snap" is the studio curve; whether `rig.mjs` has the face-as-parts and head-pop hooks; whether `tools/measure/cam_track.py` replaces the missing tracker.
