# Pipeline audit, 2026-11-09: what was tested and what is not proven

CB: "check everything and optimize this for better animation. workflow, effects, make it one of the best animation production pipeline", then "fix all issue we have. camera make a creative agent that can create something incredible". The rules that came out of it are in SKILL.md "THE PIPELINE"; this file is the proof list behind them. Old files: `references/reports/_backup_2026-11-09_pipeline_audit/`.

## Findings, ranked
1. Nothing checked the film as a film. Card Maker passed every look gate with: first face at 14.5 s, camera at rest 9 %, 6 of 19 sentences shown, props floating beside hands.
2. Camera, acting and sound each kept their own typed frame numbers.
3. The camera had rules but no idea: one film froze 35 % of the time (Rick 9 %), the next rested only 9 % (Rick 32 %).
4. "three.js first" had no kit, and the hand-over to Blender was done by eye.
5. SKILL.md held four overlapping workflows that contradicted each other (rulings table in THE PIPELINE).
6. The vector puppets were not wired in; the skill still described toon.ts.
7. The measuring scripts lived inside one episode folder.

## What ran, on what, with which result
All on the example film `templates/film_example/` ("The Station Master Who Stopped Every Clock", 15.3 s, 460 frames, a made-up story to exercise the pipeline, not fact-checked). The film in the folder now carries the camera from the camera-director run (last rows); the earlier rows were measured on its first demo camera.

| Piece | Test | Result |
|---|---|---|
| `tools/measure/film_motion.py` | "Why Perfect Railroads Don't Work" raw data against the stored numbers | identical |
| `tools/film_plan.py check` | 37 gates on the example plan | about 1 s; caught small figures, empty floor and a head under the caption in the first demo camera |
| `templates/threejs_film` | `--storyboard`, `--animatic`, `--frames`, `--visibility`, `--export-lock` | 20 panels in about 5 s; 460 frames at 540x960 in about 75 s; lock 16 MB in about 30 s. Run in the cloud session only (needs node, playwright, ffmpeg on the PC) |
| Plan vs picture | 4 animatics (rest creep x1, x3, x6 and the tuned one) rendered and measured | after the fit: rest share plan 58 / picture 49 %, p90 15.9 / 13.8 px/f, median 1.55 / 2.34 px/f, dead still 4 / 7 % |
| Rest creep | the first demo measured dead still (< 0.3 px/f) on 37 % of frames, Rick 9.3 % (range 1-29) | rests now drift by `REST_PX` (0.6-1.8 px/f by framing): 7 % |
| `tools/check_film.py` | the animatics above, with `--film` | planned mood changes, effects and kicks are no longer counted as cuts (6 false cuts on a one-take film before) |
| `templates/blender_look/from_lock.py` | background Blender 5.2.2 on the PC, `episodes/_test_film_lock/` | glb import 235 objects, clock at (1.5, 0.6, 2.62) = plan coordinates; 16 material kinds mapped; camera lens 16 mm on the 24 mm sensor = the plan's 24 mm on 36; frames 0, 196, 290, 430 rendered; frames 0 and 290 compared with the three.js stills: same layout (`out/blender_test/`). Build 2.2 s, stills under 3 s at half size, 16 samples |
| Bug found there | cards turned magenta after frame 27 | `image_user.frame_duration` must cover every scene frame (Blender clamps before it adds the offset). Fixed |
| Cast by name | example film recast with `cast:pharaoh`, `cast:cowboy`, `cast:sheet03/queen` | costumes, hats, meme faces and lip-sync mouths draw; front view |
| `agents/camera-director.md`, first real run | the agent redid the example film's camera from the brief alone (51 minutes, 15 plan checks, 6 storyboards) | 5 candidates scored, winner "The mainspring" (wind up, unwind, loop on frame 0); plan 0 FAIL, 1 WARN of 37; its note and its list of what no gate sees: `templates/film_example/CAMERA_NOTE.md` |
| What that run exposed, fixed the same night | its report | the automatic rest push drove a close camera 0.4-0.5 m into the subject: rests now use a small push plus a sideways slide (4-28 cm per rest). "Whole body fits" fought "same framing in a row": the run gate now counts the same size on the same person only. No way to end on frame 0: `"loop": true`. The storyboard skipped a `hold: 0` station (frame 0): it is drawn now. Brief: 10 gaps filled (keys explained, short characters and the caption, heard-not-seen action, plan B swap) |
| Example film with that camera, automatic rest motion and `loop` | animatic rendered and measured with `check_film.py` | 0 FAIL, 0 WARN of 21: at rest 41 % (Rick 32), median 4.6 px/f (Rick 4.1), p90 24 (Rick 23), dead still 7 % (Rick 9), heads in the caption band 2.2 %, first face 0.0 s, last frame = first frame. Plan against picture: rest share 47 / 41 %, but median 2.6 / 4.6 and p90 18 / 24 (the plan reads close cameras low) |
| `tools/refresh_installed_skill.py` | run against a copy of the installed skill in a temp home | installs SKILL.md and both agents with absolute paths |

## Not proven
- No real episode has run through all 12 stages. The first one is the test; write what breaks into `library/lessons/`.
- `SEEN` (0.70) and `REST_PX` in `tools/film_plan.py` are fitted on one 15 s film in one set, and on the fifth render (close cameras) the plan read the moving speeds low by about 40 % (median) and 25 % (p90). Re-fit after the first real episode (compare `out/plan/plan_report.json` with `film_check/film_check.json`). The camera director also reported that the speed gate rewards sideways moves over pushes.
- The plan tool trusts the `shows` and `subject` labels; it does not test whether a caption, a hat or another figure covers the noun. Only the storyboard judge and CB catch that. The storyboard-judge agent has not had a real run yet.
- The Blender transfer was proven on the first demo camera of the example film; the lock in the folder is the new camera and has not been rebuilt in Blender.
- The kit has not run on the PC.
- The Blender test is a bare rebuild: no dressing, practical lights, air volume, effects or grade from a locked export yet, and no full frame range render. Card shadows and the half self-lit look were not judged.
- Blinks do not show on meme faces; walk cycles have no leg poses; cast characters are front view only; a held item does not follow a gesture. All four need hooks in the puppet rig (asked of the characters work).
- Action rigs (`blender_cine`) are not driven from `film.json` yet: a take lists them under `rigs` as free text and they are built by hand at stage 9.
- Fine surface detail (about half of Rick's), golden and interior presets, and the dissolve count are as open as before.
