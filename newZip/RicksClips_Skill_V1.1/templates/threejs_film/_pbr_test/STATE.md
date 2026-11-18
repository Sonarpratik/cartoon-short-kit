# _pbr_test: proof of kit3d (look3d.mjs), 2026-11-15

One frame, one set (`sets/pbrtest.js`): iron spear in a bracket on a stone post, brass wire to a bronze bell on a timber frame with a brass bell wheel, a gold angel on a stone pedestal, stone flag floor, cobble path, brick wall, grass, oak, olive, blossom tree, 11 cypresses, dusk storm sky. 35 metal meshes.
`film.json` = `"kit3d": true`; `film_off.json` = `"kit3d": false` (same set, old toon look). Camera and an empty cast are hand-written in `out/plan/`.

Render (shared GPU queue, one process each):
```
bash ../../../episodes/moonrakers/tools_lead/gpu_render.sh film_off.json --frames 0 --scale 1 --stills-dir stills_off
bash ../../../episodes/moonrakers/tools_lead/gpu_render.sh film.json     --frames 0 --scale 1 --stills-dir stills_on
```
Result: `before_after.jpg` (1600 px, left off, right on).

## Numbers (1080x1920, RTX 2070 SUPER, card shared with 3-4 other renders)
| | draw ms (frame 0, incl. shader compile) | spear p99.5 lum | bell p99.5 | angel p99.5 | floor std / grad | sky std |
|---|---|---|---|---|---|---|
| off | 248 | 122 | 162 | 148 | 4.1 / 0.02 | 14.5 |
| on  | 840-967 (3 runs) | 206 | 184 | 226 | 17.1 / 0.57 | 35.4 |
Set-up (texture generation, PMREM) is a few seconds of CPU once per process; a later frame costs less than frame 0.

## Tuning done
v1: clouds read as round cotton balls in one band, metal had no streak (the key strip was a flat horizontal band a vertical cylinder cannot reflect). v2: eroded noisy puff edges, more and smaller puffs, a high storm canopy layer, darker bases; tall vertical studio strips. v3: strips 3x brighter, iron smoother (rough .26).

## Still weak
- Clouds: volume and lit sides read, but the look is fluffy cumulus, not a heavy storm front; no lightning-lit undersides.
- Metal streaks are present but soft (spear, bell); the gold angel shines most. A camera-relative key strip would give a crisper streak on every cylinder.
- Leaf cards are squares in the character mask pass (see PBR_FEATURES.md).
- Only checked on this one frame; not run with --software, not exported through --export-lock.
