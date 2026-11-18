# v_bolt: proof of ctx.fx.bolt (fx_bolt.mjs), 2026-11-15, vfx-artist

Built: `templates/threejs_film/fx_bolt.mjs` (makeFx -> bolt). Hooks (marked `FX BOLT HOOK`): look3d.mjs line ~12 import + `const fx = makeFx(...)` in the return; film.js ctx `fx: k3.fx`. Docs: PBR_FEATURES.md "Lightning bolt".
Test film: `film.json` (place tower, night light, kit3d on), `sets/bolttest.js` (stone tower, tiled roof, iron spear, wire with 6 staples, 3 cypresses, night-storm clouds, far bolt f8, strike f26 down the wire), `out/plan/` 60 frames static-ish camera.
One command: `bash prove_bolt.sh` -> `frames/` (60 PNG 1080x1920), `bolt_test.mp4` (2 s, 540x960), `numbers.json`, `bolt_sheet.jpg` (film v2 bolt s5 f1440 vs far, leader, stroke, wire run, restrike, afterglow, crop).

## Numbers (frame mean / core px >245 / lower-picture mean)
idle 63.2/0/22.4; far bolt f8 68.8/0/33.1 (restrikes f11, f16); leader f23-25 core px 4, 231, 146; stroke f26 87.8/6409/50.4;
restrikes f30 92.1/6739/59.0, f35 92.3/5426/61.1, f40 92.4/5559/61.7; dim between 70-74 / 0-900 px; last channel f41, afterglow f42-47, idle again f48.
Strike-to-last-restrike 14 frames = 0.47 s. Draw 16-17 ms/frame for the whole frame (two bolts, kit3d), no NaN pixels.

## Weak / open
- A large soft lilac bloom around the strike on bright frames: the glow ribbons pile up where the channel runs toward the lens, plus the kit bloom. Try glowK .2-.25 or cap glow per pixel; reads like lit mist now, could read as a flat disc.
- Sparks at the staples are small at sheet size (2.4 px streaks); check full size in the mp4, maybe sparkN 24 and longer life for the close shot.
- Cloud interface: ctx.sky.clouds has no `userData.flash` yet (the cloud helper can add it: lift the puffs within radius of pos by strength). Until then the bolt's own noise billows glow in the cloud.
- The return stroke frame is not brighter on the world than the restrikes (lower mean 50 vs 59-62) because the wire is still lighting up on f26; raise `light` on fi 0 if a stretch needs the stroke to be the peak.
- Not compared with a Rick lightning frame (none named in the brief); compared with the film's current bolt only.
- frames/ (66 MB) can be deleted after review; prove_bolt.sh remakes them in ~30 s.
