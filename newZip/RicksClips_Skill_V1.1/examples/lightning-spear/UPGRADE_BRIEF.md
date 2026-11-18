# Lightning spear v2: THE VISUAL UPGRADE. Brief for every stretch builder (lead, 2026-11-15)

CB on final v1: "quality can be much better. more details. iron speeer need metallic detail and the sky looks weired. is like you dindit make details on visuals", "environment need more details", "gold angle more detailed. stomr bell made metallic gold. even the floor looks to vector with no textuire. the trees also, the bell wheel also", "everything is weak improve again", then "make visuals more better". He is asleep; this round must reach the finished film without him.

WHY v1 was weak (now rules in CB_RULES section 3 "THE CODED FRAME HAS REAL METAL, REAL SURFACE RELIEF AND A REAL SKY"): every set used the flat toon material, surfaces were flat painted pictures, the sky was a gradient with flat blobs, trees were simple clumps, and nobody looked at full size beside Rick.

## Read, in this order, and nothing more
1. `rules/dept/stretch-builder.md` (your slice; it has the new rule).
2. Your stretch's `STATE.md` (your build: files, the one command that renders).
3. `templates/threejs_film/PBR_FEATURES.md` (the NEW kit API: `"kit3d": true` in film.json; ctx.pbr.metal, ctx.relief, ctx.sky.clouds, ctx.trees.tree) and the test film `templates/threejs_film/_pbr_test/` (before_after.jpg shows what it does).
4. `episodes/lightning-spear/sets/hero_props_README.md` (the detailed hero objects in `sets/hero_props.js`: which ones your stretch uses and how to place them).
5. `episodes/lightning-spear/LOOK_BIBLE.md` (light per chapter), `PICTURE_PLAN.md` (your rows), `EDIT_LIST.json` (your frames; S6: the new ending in `_ending`).

## What you change (the story, staging, camera and timing of your approved build stay; this is a LOOK round)
1. `"kit3d": true` in your film.json(s) (keep `"face_shadow": false`, card_shade amount 0 and rim 0).
2. EVERY metal thing through ctx.pbr.metal (iron for spears, wire, staples, brackets, hinges, lantern frames, tools; bronze for bells; gold for the angel and gilt; brass for candlesticks); the hero objects from `hero_props.js`, not your old versions.
3. EVERY ground, floor, wall, roof and wooden surface through ctx.relief (cobble, stone, brick, tile, plaster, wood, mud, grass ground) at a texel scale that reads at phone size: no flat colour surface in any finished frame.
4. The SKY through ctx.sky.clouds with the kind of your light (dusk-storm for A, clear-day for C and D, rain-overcast for E and F, night-storm for H, and a rose dawn for A2: tune colours): volume, lit edges, depth. Storm skies must read heavy and dramatic, not fluffy.
5. TREES through ctx.trees.tree (cypress, olive, oak, blossom), several, in groups and lines, never single lollipop trees.
6. MORE ENVIRONMENT DETAIL: at three scales (one big set piece, mid story props, tiny life: birds, smoke, washing, flowers, pigeons); fill every empty floor or sky area that is more than a quarter of a frame with something that belongs there.
7. Keep the colours strong (LOOK_BIBLE numbers) and the night at least 0.31 mean brightness.

## Check before you report (the LEAD will check again at full size)
- Render a TEST first: 4 frames of your stretch at full size; make `final/v2_test.jpg` with your v1 frame beside the v2 frame for the same 4 moments (each at least 540 px wide); look at it and fix what is weaker (darker, muddier, a lost story element). Leaf cards may cut a square out of a character in front of a tree: keep trees behind characters or check the mask.
- Then render ALL your frames again (same names, same folder `final/frames/`; keep the v1 frames in `final/frames_v1/` by moving them first), through the shared GPU queue, in the background (end your turn while it runs; do not poll).
- Motion gate unchanged (nothing moved), frame checks 0 FAIL (or the plan's named waivers), `final/numbers.txt`, `final/random8.jpg` at 1600 px, `final/v2_compare.jpg` (8 moments, v1 above v2, 1600 px wide).
- STATE.md rewritten (max 60 lines). Report in at most 20 lines: done, numbers, what is still weak, folders.
Cap 120 minutes of work (queue waits not counted).
