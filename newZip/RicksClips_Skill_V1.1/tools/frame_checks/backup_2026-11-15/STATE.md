# frame_checks STATE (2026-11-15, one build round)

## Built
- `check.mjs` (node side: camera rests from `out/plan/camera_baked.json`, starts ONE `render_gpu.mjs --eval` at quarter size, writes the reports, exit code 1 on FAIL).
- `page_check.js` (runs in the film page: reads camera, card matrices, the card drawings' alpha and the set meshes per frame; draw call switched off during the scan; one crop per FAIL).
- `README.md` (what, how, numbers, limits). `tests/make_tests.mjs`, `tests/run_tests.mjs`, `tests/{head_top,side_half,in_cowl}/film.json` (+ their sets, cast, baked plan, results in `out/`), `tests/last_run.txt`.
- Proof output: `proof/s1/`, `proof/s5_dawn_108-262/` (frame_checks.json, .md, crops). Nothing was written into the film folders; no kit file was edited.

## Proven (numbers)
a. Approved stretches
- S5 dawn `final/armor-s5-payoff_dawn/film_dawn.json --frames 108-262` (the part the film uses): 0 FAIL, 0 WARN, 21 PASS, 69 rest frames. Man on the ladder: feet 0 cm, on `step_ladder_step_03` (17-25 cm to the side: the card stands in front of the step); chief on the briefcase -3.5 cm.
- S5 dawn frames 0-107 (not used in the film): 3 FAIL (chief head 79 % / body 59 % at the right edge f56-102; chief's face behind `step_ladder_step_04` f22-36). Not judged, those frames are never shown.
- S1 `final/armor-s1-hook/film.json`: 3 FAIL, 2 WARN, 37 PASS, 168 of 356 frames.
  - chief f184-205: head 30 % in frame, body 50 %, right edge, all 22 frames. Looked at the crop: his face is cut in half by the right edge. REAL by the rule (may be meant as a frame-edge figure in the ring close-up: lead decides).
  - chief f47-62: body 80 % at the right edge, 12 of 16 frames, head whole. Real but mild (his back and arm are past the edge; shot is on hole1, he is not its subject).
  - WARN chief f298-331: head 92 %, body 75 % on the last 2-3 frames of the rest (camera starts to go).
- False alarms found and fixed: (1) a slow travel counted as a rest (now the plan's `state` is used with the motion number); (2) hop off the briefcase and walk-ins flagged (moving frames are exempt); (3) the man on the ladder "floating 60-90 cm" because the card stands 15 cm in front of the step (surface at foot height within 25 cm counts).
b. Broken copies of S1 (`tests/last_run.txt`): all three CAUGHT, exit 1.
- head_top: chief `head_cut` 23 % in frame, top+right edge, f298-331, 34/34 frames.
- side_half: chief `body_side` 49 % of width, right edge, f222-283, 62/62 frames.
- in_cowl: mathematician `face_covered` 3 of 3 rays, head centre INSIDE `engine_push_rod_21` / `engine_cylinder_21`, in front `cowl_polished_band_03`, f0 and f96-127 (32/32); feet also 46 cm inside `cowl_rear_03`.
c. Time: S1 whole stretch 36-39 s (168 frames checked, scan 22-24 s); S5 dawn 108-262 22 s; S5 dawn whole 28-45 s; broken copies 45-55 s each. About 6,300 set meshes and 34,000 instanced copies are tested.

## Weak
- The thresholds (head 97 %, body 15-85 %, feet 4 cm, reach 25 cm, 4-frame minimum) are tuned on two stretches of ONE film.
- `feet` reach of 25 cm can hide a foot that is 20 cm beside a step. The row prints the sideways distance; nobody fails on it yet.
- The first proof of "inside a closed mesh" came from engine parts, not from the cowl skin (the cowl is an open ring; the face rays caught it).
- Moving exemption: a character who walks behind a wing strut for a whole rest is not reported.
- Crops are small (frame drawn at 270 x 480) with magenta at the sides.
- Not run on S2, S3, S4 or the S5 night film; not run on a film with a lying character or the cat.

## Open
- Lead: decide the two S1 flags (f184-205, f47-62): fix the frame, or accept and note it.
- Run on the other four stretches, then put the command into the builder's one-command cycle (CB_RULES 11d says "owed tool": the rule text can now name `node tools/frame_checks/check.mjs`).
- Possible next: character-covers-character, a `--allow who:check:frames` list for accepted edge figures, the GPU slot lock (`gpu_slot_1`) if runs must queue behind full renders (this tool's card use is a few quarter-size frames).
