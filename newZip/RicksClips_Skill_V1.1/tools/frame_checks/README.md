# frame_checks: automatic frame checks (CB_RULES 11d)

A script that tests what CB had to write by eye on the armor film: a figure cut by the side of the picture, a head or hat cut by the edge, a head behind or inside the set, feet not on the step; and (since 2026-11-15, goldrush final v2) a BODY INSIDE FURNITURE (CB_RULES 5, "NO BODY INSIDE FURNITURE"). It reads the live three.js scene (camera, every character card, every set mesh) and prints numbers. **A version with a FAIL is not sent to CB.**

## Run

```
node tools/frame_checks/check.mjs <film.json> [--frames a-b] [--puppets dir,dir] [--body-step 2] [--no-body] [--seat regex] [--debug]
```

- Needs the baked plan beside the film (`out/plan/camera_baked.json`, from `python tools/film_plan.py check|bake`).
- Writes beside the film: `out/frame_checks.json` (every row), `out/frame_checks.md` (the table), `out/frame_checks/FAIL_<check>_<who>_f#####.jpg` (one crop per FAIL, at most 400 px, the red box is the part that failed, magenta = outside the picture). `--out <dir>` puts them elsewhere.
- Console: at most 40 lines, worst first. **Exit code 1 on any FAIL**, 0 otherwise, 2 when it could not run.
- `--puppets` is passed on to the kit. Without it the film's own `puppet_pkg` is used, and a missing `vector2d_characters` path is replaced by the kit's locked package (so the `final/` copies work without the option).
- Time: about 30-55 s for a stretch of 260-360 frames (S1 whole with body_in_mesh on the moving frames: 55 s; `--body-step 0` = rests only). It starts ONE `render_gpu.mjs` process at quarter size, draws one frame at the start and one per crop; during the scan the draw call is switched off, so the graphics card is almost unused. The kit files are not changed.

## What is checked, and when

Frames checked: every frame of a CAMERA REST, plus frame 0 and the last frame. A rest = at least 8 frames (`--rest-min`) in one place where the plan says `rest` and the camera moves less than 1 % of its subject distance per frame (`--rest-thr 0.01`; hand-held drift is under that, a travel is over it). `--all-frames` checks everything, `--ignore-state` uses the motion number alone.

`body_in_mesh` is ALSO tested between the rests (camera travelling, character walking), on every 2nd frame (`--body-step 2`; `0` = only the rests, `--no-body` = off); those rows are labelled `f10-60 move`. A body inside a counter is a fault when the camera moves too, and walking is NOT an excuse for it.

One row per character, rest and check. The number is the WORST frame of the rest.

| check | number | FAIL when | PASS |
|---|---|---|---|
| `head_cut` | % of the head WITH its hat that is inside the picture | under 97 % (and over 2 %: a head fully outside is not in the shot and gives no row) | 97-100 |
| `body_side` | % of the figure's width that is inside the picture | the LEFT or RIGHT edge cuts him and 15-85 % is left. A cut by the bottom edge is normal framing and is never reported | under 15 (a sliver) or over 85 |
| `face_covered` | how many of 3 rays (lens to head centre, lens to each eye) hit set geometry first | head centre hit, or 2-3 rays, or the head centre is INSIDE a closed mesh. One eye only = WARN. The row names the mesh and how far in front of the face it is | 0 |
| `feet` | cm between the foot and the nearest surface (+ = floats above it, - = inside it) | more than 4 cm on one foot = WARN, on both feet = FAIL | within 4 cm |
| `body_in_mesh` | % of the body (neck to sole, drawn pixels) INSIDE a solid set part | 10 % or more of torso-hips-thighs inside (`--body-fail 0.10`), OR one part cuts 15 % or more of the body width on a torso-hips-thighs row with 8 cm or more of it running on BEHIND the card (`--body-band 0.15`, `--body-behind 0.08`). Under 4 bad frames = WARN | nothing inside. WARN: 3 % inside or an 8 % cut |

How each is measured:
- The head, hat, silhouette and feet come from the DRAWING that is on the card on that frame (its alpha), so a hat, a raised arm, a turned or bowed head are measured as drawn. Every point is put through the card's own world matrix and the frame's camera.
- `face_covered` ignores: the character cards, generic held 3D props (`held3d`), props with `held_by`, see-through and additive materials, effect shaders, sky shells, and meshes whose name has sky, dome, cone, beam, haze, fog, dust, glow, halo, smoke, spark, cloud, backdrop (`--skip "a|b"` replaces the list).
- `body_in_mesh`: the drawn body from the neck to just above the sole (every 3rd pixel of the drawing on the card, about 300-400 points) goes through the card's world matrix. Boxes first: only set parts whose world box meets the body's box, then the part's own (rotated) box, then two rays per point along the card's normal: an odd number of the part's walls toward the camera AND away from it = inside, and the first wall each way = how much of the part is in front of / behind the card. A point counts when the part reaches 1 cm or more on both sides (a card touching a back face is not in it). On each torso-hips-thighs row with a hit, every pixel across the drawing is then tested: that is the "cuts N % of the body width" number, and "running on behind" is how far the part (a table top, a counter top) continues behind the body, which is what reads as "she is IN the table". Torso-hips-thighs = the upper 75 % from neck to sole; legs (lower 25 %) are counted separately and only when they are inside a solid, so a seated character's legs under an OPEN table top never count (open air is not inside anything). Not counted: the part the character sits on (name matches `seat|stool|bench|saddle|sofa|couch`, `--seat` replaces it; the row says "sits on ..."), parts only at the bottom 6 % of the figure (floor, steps: that is `feet`), a room shell or hill around the whole figure, plus everything `face_covered` ignores. The crop shows the whole figure. `--debug` adds every part's numbers to the row.
- `feet` uses the card's ground line (where the character stands), under the left and right foot of the drawing, only for feet that are inside the picture. A surface at foot height within 25 cm sideways (`--foot-reach`) counts, because a flat card is often placed a hand in front of the step or box it stands on; the row then says "(17 cm to the side)".
- MOVING IS NOT A FAULT: on a frame where the character's place changes (walk in, hop off, carried) a cut or a foot in the air is not counted (`body_in_mesh` excepted: walking through a counter is counted). A FAIL that lasts under 4 frames of a longer rest (`--min-bad`) is shown as WARN.

## Known limits

- It checks the three.js stage only. A Blender look pass that moves a set part or the camera is not seen by it.
- One character covering another is not reported (only set geometry is).
- A drawn hop or tiptoe inside a pose is not a foot fault here (the card's ground line is tested). A character whose pose is drawn lying gets no head and no feet rows (the head is not found in the drawing; the run says so in Notes).
- The head is found as the kit's head circle; if a pose moves the head far from it, the best-covered circle within 1.6 head radii is used. A long thing held straight over the head (inside 1.2 head radii) is counted as hat.
- Held things are known by `held3d`, `held_by` and name. A set-built prop that a character carries without one of those can be reported as covering his face: add its name with `--skip`.
- Inside-a-mesh works for single closed meshes (not instanced copies, not two solids that overlap) and skips a mesh that also contains the camera (a room).
- A slow camera move that the plan calls `rest` is checked as a rest; a real rest shorter than 8 frames is not checked.
- `body_in_mesh` knows a seat only by its name. A standing character inside a part named `..._seat` is not reported; a chair seat named otherwise under a seated card is (pass `--seat`). A card a few cm into a back face over a large share of the body counts (1 cm tolerance); it may be invisible from the front, the crop decides.
- Proof films: `tests/` (three broken copies of S1, `node tests/make_tests.mjs` then `node tests/run_tests.mjs`).
- body_in_mesh proof: goldrush s2/s5/s7 copies in `episodes/continue-goldrush-from-handoff-md-section-0f-bui/out/checker_test/` (see STATE.md), clean: `proof/s1_body/`, `proof/s5_dawn_body/`.
