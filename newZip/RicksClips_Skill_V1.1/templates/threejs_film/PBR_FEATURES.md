# kit3d: real metal, surface relief, a real sky, detailed trees (three.js film kit)

Added 2026-11-15 for set-builder rule "THE CODED FRAME HAS REAL METAL, REAL SURFACE RELIEF AND A REAL SKY" (CB on the lightning spear film). Code: `look3d.mjs`. Backup of film.js before it: `_backup_2026-11-15_pbr/film.js`. Proof: `_pbr_test/` (`before_after.jpg`, `STATE.md`).

## Switching it on (film.json)

```
"kit3d": true                                            all four features
"kit3d": { "pbr": true, "relief": true, "sky": true, "trees": true }   pick
"places": { "yard": { "kit3d": false } }                 off for one place (or an object to override per place)
"places": { "yard": { "kit3d": { "envGround": "#2e2630" } } }   colour of the ground the metal reflects (default dark purple-brown)
```

Default is OFF. A film without `kit3d` renders exactly as before: `film.js` only adds `ctx.pbr / ctx.relief / ctx.sky / ctx.trees` to the set's ctx, and `finish()` returns the set's own `update` untouched when nothing of kit3d was used.
With a feature OFF the same calls return the OLD look (toon material, no clouds, a stick-and-ball tree), so one set file renders both ways. That is how `_pbr_test/film_off.json` makes the "before" picture.

## API (inside `build(THREE, scene, film, ctx)`)

| Call | Returns | Notes |
|---|---|---|
| `ctx.pbr.metal(kind, opts)` | MeshPhysicalMaterial | kind `iron` (dark blue-black, hammered, slight rust), `steel` (brushed), `bronze` (cast, green patina in recesses), `gold` (gilt, clearcoat), `brass` (brushed), `wet` (dark non-metal glossy, clearcoat: wet stone, glass-like). opts: `color`, `rough`, `nscale` (normal strength), `rust`, `patina`, `env` (reflection strength), `coat`, `coatRough`, `finish` (`hammered`/`brushed`/`cast`/`smooth`), `scale` (m per texture repeat, default .6), `seed`, `toon` (colour used when pbr is off). |
| `ctx.relief(kind, colorHex, opts)` | MeshToonMaterial with colour map + normal map | kind `stone` (flagstones), `brick`, `tile`, `cobble`, `plaster`, `wood` (planks), `mud`, `bark`, `grass`. Real-size defaults (2026-11-15 fix): cobble setts 0.18 m (repeat 1.8 m, 10x10 rounder setts), stone flags 0.5 m (repeat 2.0 m, 4x4, few split slabs), brick 0.23 x 0.077 m incl. mortar (repeat 0.92 m, 12 courses x 4), roof tile 0.3 m rows (repeat 1.8 m, unchanged); wood 2.4, bark 1.0, grass 2.5, mud 3, plaster 3 m unchanged. opts: `scale` = MULTIPLIER, kept in its old numbers: effective repeat = real default x scale / old default (old defaults: cobble 1.4, stone 3.2, brick 1.6, tile 1.8, wood 2.4, bark 1, grass 2.5, mud 3, plaster 3), so `scale: 1.4` on a cobble = the default and a set that passed a scale keeps its proportion and shrinks with the new real size; `size` = absolute metres per repeat (wins); `normal` (strength, default 1), `seed`. The kit's 3 light steps are kept but blended, so relief reads instead of speckling; cavities are darkened in the colour map too, so the texture reads even in flat light. |
| `ctx.sky.clouds(opts)` | Group (added to the scene) | kind `dusk-storm`, `clear-day`, `rain-overcast`, `night-storm`. Replaces the gradient sky with a per-pixel dome (3 colours + sun glow) unless `dome: false`, and adds 3 layers of lit soft clouds (120 / 200 / 320 m, far ones fade into the horizon colour) plus, for the storm and overcast kinds, a high flat canopy layer (26-58 degrees up). Since the 2026-11-15 fix each cloud is ONE mass: 16-26 large overlapping low-frequency puffs, shaded per pixel from the CLOUD's own shape (no per-puff ball shading, so no popcorn or cauliflower), a soft flat base cut in world height, lit top and cool shaded underside, large-scale value variation and dark cores for storms, and a rim only on the cloud's own silhouette (strongest toward the sun). clear-day = few large cumulus (3/4/4 per layer x coverage, plus 4 higher ones at 22-46 degrees for a low camera) + a faint high thin streak layer (`cirrus: false` drops it); storms and overcast keep a high deck (24-58 degrees) of broad smooth masses. Layers draw far to near. opts: `seed`, `coverage` (x count), `scale`, `minEl`/`maxEl` (degrees above the horizon), `arc` ([from, to] degrees, default all round), `layers` ([{d, fade, size, n}]), `colors` ({top, mid, hor, sun, lit, shade, rim}), `opacity`, `sunDir`. Slow drift (micro motion) is built in. **Since the storm fix (below) the storm kinds `night-storm`, `dusk-storm`, `rain-overcast` are painted per pixel on the dome instead** (no sprite layers unless `layers`, `dome: false` or `puffs: true` is passed); clear-day keeps the sprite layers. |
| `ctx.sky.flash(where, strength, opts)` | slot number (0-3) | Lights the storm clouds FROM INSIDE around one direction only (a gaussian cone, `opts.spread` radians, default .3): thin parts and silhouettes glow most, dense cores less, the clear sky gets a faint halo. `where` = `[x,y,z]` three.js direction, a `THREE.Vector3`, or `{ pos: [x,y,z] }` a three.js world point (e.g. `B2T(bolt).toArray()`). 4 slots shared by every storm dome and cloud layer; `opts.slot` picks one, else round robin. Call every frame from the set's update with the bolt's strength curve; strength 0 turns that slot off. Works on the painted dome and on sprite layers. |
| `ctx.trees.tree(opts)` | Group (added to the scene unless `parent: false`) | kind `cypress` (tall, dense spindle), `olive` (2-3 twisting stems, silver-green), `oak` (broad), `blossom` (fruit tree in white-pink flower). opts: `at` [x, y, z] plan metres, `height`, `seed`, `leaf`, `leaf2`, `bark`, `clusters`, `perCl` (cards per cluster), `leafSize`, `crownW`, `parent`. One merged trunk mesh (bark relief, 2-3 forks over 3 levels) + ONE InstancedMesh of leaf cards (sprig texture, alpha test, cards face out of their cluster: a lit and a shade side under the real sun, darker deep inside the crown, cast shadows). Gentle sway built in. |
| `ctx.pbr.on`, `ctx.relief.on`, `ctx.sky.on`, `ctx.trees.on` | bool | a set may branch on them (e.g. extra detail only when on). |

UVs: after `build()` returns, every mesh whose material came from `metal()` or `relief()` gets UVs in metres / `scale` (box projection; cylinders, cones, lathes, spheres, tori and tubes keep their own UV layout, scaled to their real size). Its geometry is cloned first, so shared geometry is safe.
Env map: after `build()`, the dome, the clouds and a few invisible "studio strips" (a warm strip on the key side, a cool rim strip opposite, a soft top light, a dark ground disc) are drawn into a PMREM cube once per place; every metal gets it. So the metal shows the film's own sky colours plus one clean highlight per curve.

Roles for the Blender lock are unchanged: give meshes `userData.role` as before (`metal`, `stone`, `foliage`...). Clouds are `noExport`. The physical materials export to glTF as normal PBR materials (with their maps).

## Rules of use

- Metal, gold, bronze, glass and wet things: `ctx.pbr.metal`. Never the toon material for them once kit3d is on.
- Stone, brick, tile, wood, cobbles, mud, bark, ground: `ctx.relief`. A plain `toon()` floor fails the rule.
- One `ctx.sky.clouds()` per outdoor place, kind matched to the light. Interiors: none.
- Trees: `ctx.trees.tree`, never a sphere on a stick.
- Shaders in look3d.mjs guard every sqrt / normalize / division (`max(..., 1e-4)`), and the only pow has a `max(s, 1e-4)` base. Keep that in any change: one not-a-number pixel turns black and the kit's bloom spreads it.

## Cost (RTX 2070 SUPER, 1080x1920, `_pbr_test`, 35 metal meshes, 9 relief materials, 4 cloud layers, 16 trees)

Measured draw time of frame 0 (includes shader compile): 248 ms with kit3d off, 840-967 ms with it on (well under the 2.5 s budget). Details in `_pbr_test/STATE.md`. Texture generation is CPU work at set-up (each kind/colour/seed is generated once per process and cached; about 50-150 ms per 512 px map set). The PMREM env bake is one-off per place.

## Fix 2026-11-15 (clouds + relief scale)

Lead on the lightning spear finals: clear-day clouds read as popcorn, storm clouds as cauliflower, cobbles and flags as big crazy paving. Backup: `look3d.mjs.bak_clouds_20261115`. Proof: `_pbr_test/clouds_fix_before_after.jpg` (rows: dusk-storm + ground, clear-day low camera looking up `_pbr_test/v_clear/`, night-storm low camera `_pbr_test/v_night/`). The test set now reads `places.<p>.sky_kind`.
Still weak: the clouds are smooth and simple (no fine wisps); night-storm has big masses but little dark-core contrast and no flash-lit rims unless the set passes a bright `rim` or `sunDir`; the cirrus layer is faint and was not seen in the test frames.

## Fix 2026-11-15 (storm clouds with drama)

Lead, full-size check: after the cloud fix the storm skies were soft blurred blobs (no dark cores, no lit rims, no drama). Backup: `look3d.mjs.bak_storm_20261115`. Method ported from the hook's storm dome (`episodes/lightning-spear/sets/tower_top.js`, S1 v2) and generalised: the storm kinds are painted per pixel on the kit dome (a dome is made if the set has none) with domain-warped 3D value noise cut by a narrow threshold, so shapes are crisp but soft-edged, never blurred. Four layers, back to front: (1) high anvil deck on a plane overhead (shrinks toward the horizon); (2) mid storm wall on a cylinder round the camera, towering ragged top against the lighter sky, ragged foot over a lighter horizon gap, dark cores (`contrast`), billow bellies lit from below, side and silhouette rims toward the key/low sun (`slit`, `srim`, `rimAmt`), warm underside (`under`, `underAmt`: burnt orange at dusk, sodium town light at night); (3) slanted streaked rain curtains hanging from the wall's foot (`rain`, `rainAmt`); (4) low dark scud on a near plane drifting about 6x faster (`scud`, `scudCov`). Per-kind numbers live in `SKY[kind].storm` (`wallTop` = sine of the wall top elevation, `foot`, `deck`, `scudCov`, ...); override with `opts.colors` or `opts.storm`. rain-overcast = the same with a full wall and deck, low contrast, heavy rain. Also fixed: the sprite-cloud rim line had been commented out by a stray `//` (rims never drew); now on (affects sets that keep sprite layers, e.g. the hook's `dome: false` layers). clear-day: fewer bubbles (`pw` .18, `ero` .4) plus fine crease shading inside each cloud (`det`).
Proof: `_pbr_test/storm_fix_sheet.jpg` (1600 px; rows night-storm low cam up + flash `v_night/`, dusk-storm low cam up + flash `v_dusk_up/`, dusk-storm level wide + far flash `v_dusk_wide/`, clear-day `v_clear/`; left = last fix, right = now). The test set reads `places.<p>.flash = { at, strength, spread }`. Frame 0 (incl. shader compile, shared GPU): 1.03-1.22 s per frame total (draw 770-910 ms), same as before the fix.
Still weak: the dusk wall's burnt-orange foot is mostly hidden by the test set's trees (not checked in an open-horizon shot); rain curtains only read where the horizon gap is visible; the flash is a soft cone (no bolt-shaped light channel); clear-day cumulus still has a rounded top.

## Known limits

- The leaf cards are drawn as full squares in the character mask pass (the mask's black override material ignores alpha test): a tree directly in front of a character would cut a square out of the sharp-character mask. Keep trees behind the cast, or ask for a mask fix.
- Box projection on curved non-primitive meshes (merged or extruded) can stretch the texture at 45 degree faces.
- The env map is static per place (made once): a light change inside a place does not change the reflections.
- Not checked with `--software` (SwiftShader) or the Blender lock export of physical materials.

## Lightning bolt: `ctx.fx.bolt(opts)` (fx_bolt.mjs, added 2026-11-15, vfx-artist)

CB on lightning spear v2: "you should make the thunder bolt much better than this". Code: `fx_bolt.mjs` (hooked by two marked lines `FX BOLT HOOK`: look3d.mjs `makeKit3d` returns `fx`, film.js puts it on `ctx.fx`). Always available, also with kit3d off; a place that never calls it is untouched. Proof: `_pbr_test/v_bolt/` (`bolt_sheet.jpg`, `bolt_test.mp4`, `STATE.md`, one command `bash prove_bolt.sh`).

```
const b = ctx.fx.bolt({ plan: true, from: [9, 40, 64], path: [TIP, ...wirePoints], sparks: [TIP, ...staples], frame: 160, leader: 5, runFrames: 6, clouds, seed: 11 });
```
The bolt animates itself on the film clock (the kit3d tick); `b.update(t)` may also be called by the set (idempotent). Returns `{ group, update, timing: { leaderStart, stroke, restrikeFrames, afterglowEnd }, end, start, main, path, restrikes }`.

| opt | default (close / far) | meaning |
|---|---|---|
| `from`, `to` | - | start in the cloud, strike point. Arrays are three.js world unless `plan: true` (plan x, y, z-up). No `to` and no `path` = an air bolt: `dir` (default down), `length` (40); it tapers out, no flash, no point light |
| `path` | [] | close variant: the channel runs from `from` to `path[0]` (spear tip) then hugs the points (wire), jitter `pathJit` .025 m |
| `sparks` | [] | points (staples, tip) that throw a spark burst when the current passes; `sparkN` 16, `groundY` (three y) where they bounce; drag, gravity, white-hot to orange to red |
| `frame` or `at` | - | return-stroke frame (or seconds); put it on the narration word |
| `leader` | 4 | stepped-leader frames before the stroke (0 = none); faint, crawls down in steps, with trial branches, hot tip |
| `restrikes` | 2-4 by seed | restrikes inside 0.55 s x `duration` (1); dim 0.1-0.2 between; then `after` (6) afterglow frames, the core cools to the glow colour |
| `runFrames` | 0 | frames the current takes to run down `path` (a hot head travels, sparks fire as it passes) |
| `branches`, `levels` | 8, 3 / 6, 2 | 0-12 branches from the upper 80 % of the channel, forking again; none reaches the lower 25 % of the drop |
| `width`, `rough`, `seg` | .22 m, .13, .28 m / .35, .13, .9 | core width (min `coreMinPx` 1.8 px), jaggedness, smallest segment |
| `core`, `glow`, `hot`, `glowK`, `glowWidth` | #fff, #9a8cff, 5, .32, 9 | colours, HDR strength (the kit bloom takes values over 1), glow strength and width x core |
| `far`, `haze`, `hazeColor` | false, 0 / .3 | far variant: thin, hazed, no point light, small lift |
| `light`, `point`, `reach`, `lift`, `lightColor` | 3.2, 140, 45, .55 / .9, 0 | flash rig: directional from the bolt, point light at the strike (hit bolts only), hemisphere lift on the return-stroke frame only |
| `clouds`, `cloudR`, `cloudGlow`, `cloudColor` | - | the cloud group the bolt leaves; 6-9 noisy billows glow from inside and flicker per restrike. If `clouds.userData.flash(posVec3, strength, radius)` exists (interface for ctx.sky.clouds) it is called every frame too |
| `seed`, `flashSize` | 7, 1.8 m | shape; strike flash sprite |

Timing (measured, `_pbr_test/v_bolt`, stroke f26): leader f21-25 (core px 0-231), return stroke f26 (lower-picture mean 22 -> 50), restrikes f30, f35, f40 (59-62), dim frames between (28-31), last channel frame f41, afterglow to f47, sparks fall to f45. Far bolt f8 with two restrikes f11, f16.
One flash rig per scene (3 lights, made once, intensity 0 when idle: no shader recompiles). Cards are MeshBasic, so characters keep their look; the world takes the light.

How each stretch uses it:
- Far storm / "counted to ten": `far: true`, `to` on the far ground, `leader: 2-3`; several seeds over the line, never two strokes on one frame.
- Strike on the spear: `path` = spear tip + the wire points from the set, `sparks` = tip + staples, `runFrames` 5-8, `frame` on the word; a 2-4 frame camera shake and the thunder SFX on the same frame (film.json kicks, sound_events).
- Gold angel / tree: `to` = the angel's head or the crown top, `sparks` on metal only; the tree split happens on `timing.stroke`.
- Trial branches that "try and choose" (night.js row 26): `leader: 6` and a long leader is the beat; add `restrikes: 0` for a single stroke.

Cost: one bolt = a few thousand vertices, 2 ribbon draw calls + sparks + 2-11 sprites; spark simulation is deterministic per frame (each frame renders alone) and costs well under 1 ms. The whole test frame draws in 16-17 ms (two bolts, kit3d on).
Limits: the soft glow piles up where the channel runs toward the lens (a big lilac bloom around the strike, see STATE.md); DOF blurs a very far bolt (its depth is the sky's); additive ribbons draw over clouds that are nearer than the bolt (clouds write no depth).
