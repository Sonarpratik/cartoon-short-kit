# Lightning spear: the rough board. Brief for every stretch builder (lead, 2026-11-15)

Film: "Why The Safest Tower Had A Spear On Top". CB confirmed the script and has seen ONE rough hook frame. This round is THE ONE GATE (CB_RULES 11a.2): 2-3 real three.js key frames for EVERY picture-plan row of your stretch, no polish, so CB can say yes or no to the whole film. HARD CAP 75 minutes of work. No judge, no department rounds, no Blender.

## Read, in this order, and nothing more
1. `rules/dept/stretch-builder.md` (your rule slice; never CB_RULES.md or SKILL.md whole; grep for a word).
2. `episodes/lightning-spear/LOOK_BIBLE.md` (world, palette, the light of your rows, faces, camera, Never).
3. `episodes/lightning-spear/PICTURE_PLAN.md`: the safety line at the top and YOUR rows (every row is a must).
4. `episodes/lightning-spear/SCRIPT.md` section 1: only your script rows (the picture column) and your beats in section 6.
5. `episodes/lightning-spear/cast/STATE.md` and `cast/CAST_KEYS.json` (how to import the cast; the face and shade keys every film.json must carry).
6. `episodes/lightning-spear/sets/README.md` (ONE shared sets folder, who owns which file, the world constants).
7. Pattern of a stretch board that passed CB's gate (list first, read only what you need): `episodes/goldrush-s2/` (film.json, build_film.py, board/make_sheets.py). Pattern of this film's first frame: `episodes/lightning-spear/pitch/hookA_rough/` (film.json, STATE.md).
8. `templates/pieces/INDEX.md` only if a plan row names a piece (technique only; say what you changed for this story).

## Set up
- Your folder: `episodes/lightning-spear-<S#>/` (create it): film.json, your moves, `board/`, `STATE.md`. Do NOT copy the sets or the cast: load them from `../lightning-spear/sets/` and `../lightning-spear/cast/`. If the kit cannot load a set from a sibling folder, tell the lead in your report rather than copying (a one-line re-export stub is fine).
- Your set is a NEW file in `episodes/lightning-spear/sets/` named in the README's owner list. Import the world constants so the landmarks (spear tower near, white tower with gold angel far, the ridge tree) stay in the same place from every side. Never edit a file another builder owns; write wishes into `episodes/lightning-spear/SET_CHANGES.md`.
- The voice is shared: `episodes/lightning-spear/voice/words.json` and `voice.wav`. Acts are plain frame numbers at 30 fps from words.json (frame = seconds x 30). Write your first frame and row range in `OFFSET.txt`.

## What a key frame must be
- A real moment of an episode move (`m:`), drawn for that act: plain kit poses 0, frozen moves 0 (count before render). For the board the moves may be simple, but each act is a move with hands ON the object (round fists, never a 3D hand).
- The named thing in frame ON its word, as the plan row says (CLOSE or IN SCENE). Doer + thing + result in one frame. Reads with the sound off at phone size.
- Colour from the first day: the light of your rows from the LOOK_BIBLE table, strong colours, ungraded saturation at least 0.36 (0.30 by day), night mean brightness at least 0.31. Faces clean white: `card_shade.rim_amount` 0, no `far` light, `costume_shade.smooth` 40 (copy CAST_KEYS.json).
- Camera at character height, at most 10 degrees down on a character; faces and the named thing above the caption line (71.5 %); nobody cut by a frame edge on a rest; every foot on a visible surface; floor or roof at most a third of a wide.
- Nothing generic in the MAIN things of each frame (the object the row names has its real parts). Background may stay simple this round.
- Period 1765, northern Italy. Nobody hurt; the safety line of the plan is a must.

## Deliver, in `episodes/lightning-spear-<S#>/board/`
- `frames/`: 2-3 key frames per plan row, 1080x1920, WITH captions, named `r<row>_<a|b|c>_f<filmframe>.png`.
- `sheet_360.jpg` (all panels 360 px wide, in row order, row number and words under each), `line_check.jpg` (each row's words beside its frames), `eyes_feet_zoom.jpg`.
- `node tools/frame_checks/check.mjs <your film.json>` = 0 FAIL (or name the plan row that waives it).
- `measure`: saturation and mean brightness per panel in `board/numbers.txt`.
- `STATE.md` (max 60 lines): built, files, numbers, weak, open.

## Render
ONLY on the graphics card through the shared queue (other films share the card; two slots): from your folder
`bash ../moonrakers/tools_lead/gpu_render.sh film.json --frames <list> --scale 1 --stills-dir board/frames`
Never render.mjs. Few calls, many frames per call. Guard pow, sqrt and divisions in any new shader (not-a-number is black on the card). ONE command per cycle; numbers before pictures; look at one small sheet (max 1600 px wide) at most 3 times in the whole job.

## Report (max 25 lines)
Done, numbers (frame checks, saturation, brightness), per row one word (ok / weak + why), set file and move file names, weak points, files.
