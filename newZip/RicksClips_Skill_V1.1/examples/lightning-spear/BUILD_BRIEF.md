# Lightning spear: BUILD OUT AND POLISH. Brief for every stretch builder (lead, 2026-11-15)

CB passed the gate ("all ok", 2026-11-15) and asked for the film finished end to end while he sleeps. This round turns your stretch's approved rough board into FINISHED, fully animated, fully detailed frames for every film frame of your segments. One builder per stretch, fresh, cap 120 minutes of work (render waits in the shared queue do not count, but end your turn while a long render runs instead of polling).

## Read, in this order, and nothing more
1. `rules/dept/stretch-builder.md` (your slice; grep CB_RULES.md for a word if you need one more rule, never read it whole).
2. Your stretch's `STATE.md` (the last builder's hand-over: files, build_film.py, how to run).
3. `episodes/lightning-spear/LOOK_BIBLE.md` and `PICTURE_PLAN.md` (the safety line + YOUR rows; every row is a must).
4. `episodes/lightning-spear/EDIT_LIST.json` (your segments in FILM frames).
5. `episodes/lightning-spear/cast/CAST_KEYS.json` (cast import + face keys; card_shade.amount 0 and rim_amount 0 are binding).
6. `episodes/lightning-spear/sets/README.md` and `SET_CHANGES.md`.
7. The motion method: `episodes/moonrakers/moves/MOVES.md` top section only, and your stretch's `moves/` (studio_ep.mjs, the gate `check_motion_ep.mjs`: copy it from `episodes/lightning-spear-s1/moves/tools/` if you lack it).

## THE FLOOR (CB 2026-11-15: "and will the visual more details? it looks like a downgrade now")
1. Your approved board frames (`board/frames/`): every story element they show stays (props, characters, the gag, the named thing on its word, the light).
2. The first hook picture CB saw, `episodes/lightning-spear/pitch/hookA_rough/out/v3/f_00000.png`: no finished frame may look plainer than it. Flat one-colour walls, floors, ground and roofs are GONE in this round.

## What you build
A. DETAIL in your set file(s) in the shared sets folder (CB_RULES Hard Rule 2, Premium detail, Rick finish): real parts on every main object; walls with stone courses, plaster with corner stones, string courses, cracks, worn patches; ground with cobbles, packed earth with pebbles, wet mud with shine and texture, grass in clumps; roofs as tile rows; wood with planks and grain; metal with bolts and highlights; at least 30 kinds of props per place, story lettering where it fits (hand-painted, 1-4 words, Italian of the time, no real names); haze in the distance, two particle layers per shot, micro motion of the world (wind in cloth and leaves, smoke, candle flicker, rain); contact shadows under feet and props; one key light with long shadows. Strong colours stay (LOOK_BIBLE numbers). Name five specific details on every main object in your STATE.md.
B. MOTION for every frame of your segments: every act is an episode move in the STUDIO MOTION method, drawn new on every frame, timed on words.json; faces change on the word; the Priest's mouth lip-syncs his two quotes only; nobody else's mouth moves; dead still in holds (blinks only); feet planted; hands ON objects (round fists). No teleport, no pose jump. Crowds never in sync, never clones. Motion gate on all your moves: twos 0, linear 0, no-settle 0, creep 0, contact 0 px; plain kit poses 0, frozen moves 0.
C. CAMERA: each segment is one continuous take: fly, land, rest, fly on; the camera at character height (at most 10 degrees down on a character); faces and the named thing above the caption line; nobody cut by a frame edge on a rest (unless the plan row names a waiver); floor at most a third of a wide. Effects land on their word with build, hit and settle (lightning is branched light with a flash on the world, never white lines; steam and smoke are soft volume).
D. JOINS: render 12 handle frames before and after each of your segments (EDIT_LIST), so the join can blend 10 frames. If your segment ends where the next stretch begins in the same place (S2 seg 5 ends on the far bell that S4 seg 6 does not show), end on a calm moving shot; the join blends.

## Render and deliver
- Render ONLY on the graphics card through the shared queue: `bash ../moonrakers/tools_lead/gpu_render.sh film.json --frames <a>-<b> --scale 1 --stills-dir final/frames` (check the wrapper and the kit for the range syntax; render in chunks of about 100 frames, resumable, skip frames already on disk). Frames named by FILM frame number `f_<film frame 5 digits>.png`, 1080x1920, WITH the kit's captions (as the hook clip had them). If your film.json runs on stretch frames, map to film frames in the file names (write the map in OFFSET.txt).
- `final/strip_4fps.jpg` (scale 0.25), `final/line_check.jpg`, `final/eyes_feet_zoom.jpg`, `final/numbers.txt` (saturation and mean brightness per second; night at least 0.31), `final/random8.jpg` (8 random frames side by side, 1600 px wide), `node tools/frame_checks/check.mjs` 0 FAIL on your segment ranges (or the plan's waiver named), motion gate numbers.
- Look at your own sheets small (max 1600 px wide), at most 4 looks in all: board beside polish for the same moments (the floor), the faces (only the template's thin crescent, no grey band), the feet.
- `STATE.md` (max 60 lines): what is built, files, frame folder and range, numbers, weak points.
- Report in at most 25 lines: done, numbers, weak points, the frame folder and its film-frame ranges.
