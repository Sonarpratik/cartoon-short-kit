# Density rules

Rules for every Ricks Clips episode, any story, place or time of day. Used in steps 5 and 7 of [WORKFLOW.md](WORKFLOW.md).

## Measured gates
Run `python tools/measure/density_check.py --style 3d [--night|--day] still.png` (`--style 3d` is the default). `tools/check_episode.py` runs the same gates plus the look checks.
Numbers come from 193 frames of his 3 newest videos (`references/measure/gates_3d.json`): medians, except where noted. Morning, midday, golden and interior use the "other light" column, because the frames only split into night and non-night.

| Gate | What it measures | Night | Other light |
|---|---|---|---|
| G1 edge detail | share of strong-edge pixels | >= 0.141 | >= 0.14 |
| G2 shapes | distinct flat-colour regions | >= 783 | >= 702 |
| G3 empty cells | 6x10 grid, caption band masked | <= 18.8 % | <= 14.6 % |
| G4 lit chroma | C* p90, his p10-p90 band | 26.3-61.7 | 24.7-72.1 |
| G5 depth layers | frame thirds carrying detail | 3 of 3 | 3 of 3 |
| G6 surface noise | hf_surface at most his p75; painted variation lc_surface at least his p10 | hf <= 0.569, lc >= 1.508 | hf <= 0.614, lc >= 1.364 |
| G7 depth haze | far band's dark tones lifted, ignoring big dark objects there (his median, same method) | >= 6.22 | >= 12.08 |

`--style ink` keeps the old gates for older painted episodes only.

## Look checks (tools/check_episode.py)
| Check | Target |
|---|---|
| Texture share | >= 0.30 (his median 0.39) |
| Black point | 7,4,15, each channel within 8 |
| Shadow a* / b* | a* -2 to 14; b* below 0 (night -5 or lower); his overall +6 / -8 |
| Vignette corner/centre | 0.55-0.80, aim 0.67; fit once per shot with `grade.py --fit-vig` |
| Amber share | <= 0.14 (his 0.07) |
| Small glints | >= 0.007 (his median 0.018) |
| Clipped highlights | <= 2.5 % (his median 0.9 %) |

Standing checks by eye at every location: glints on metal and glass, reflections on wet or shiny surfaces, lights staying their colour instead of clipping to white, fabric that reads as cloth, wear that follows edges.

## World rules
- **Surfaces:** every surface is a procedural Blender material (or a painted image for big surfaces) plus wear. No flat fills.
- **Skies:** a painted gradient with soft cel clouds, and stars or haze bands to suit the light.
- **Ground:** carries a material and scatter: cobbles, turf and blades, mud and puddles, whatever belongs there.
- **Props per location:** 30+ kinds and 600+ objects, in clusters of big, medium and small, never lines or grids. Use `scatter.cluster3`, `scatter.field` and `scatter.TALLY.report()`.
- **Details:** 3 that only this place and time would have, plus 1-2 humour touches.
- **Motion:** 2+ moving things per shot: smoke, flags, flicker, birds, leaves, dust, water.
- **Hero objects:** real geometry and real materials at model detail (rivets, struts, wires, hinges, panel lines). No ink on the world.
- **Characters:** the 2D vector puppets (`templates/vector2d_characters`, cast by name in `film.json`) as cards with costume detail. Ink only on characters, drawn in the card.
- **Lights:** 2+ practical lights with glow on night and interior sets, plus a key that separates the hero from the background.

## What moves the gates
- G3 and G6 pull against each other. Soft focus and haze empty cells; fine detail raises noise. Fill the near band with large, smoothly lit shapes and props: they pass both.
- Grass blades start 1.2 m from the lens. Nearer, they measure as pixel noise.
- Haze needs a volume or mist that starts about 9 m out, in the sky's horizon colour, so near stays crisp and distance lifts.
- Fine weaves alias at distance. Keep weave scale fine and strength low.
- Use f/5.6. f/2.8 blurs the foreground and loses edge detail.

## Speed
- Instance repeated props (share one mesh across objects) and merge static meshes per material.
- Load only the current location per shot.
- Test the slowest frame of every shot at full size first (`render.slowest_frame_test`). Anything over 15 s per frame gets optimised before animation.
- No Freestyle on anything. If characters are ever built as 3D geometry, use inverted-hull ink, on characters only.

## Process
Two full stages, as on the approved airfield (`episodes/night-witches/density/`: `build_density_v1.py`, then `build_density.py` (rounds 1-2), then `build_density_v3.py`):
0. **Hero object first:** Build the story's hero object alone, as a detailed model, before the scene exists. Example: the airfield Po-2, about 38,000 triangles.
1. **Stage A:** the complete scene built in Python and finished in the toon look, in two passes: density and composition (one clear focal point, camera staged for 9:16, props along the view), then the fine pass against the quality gates. CB sees a page with rounds, scores and grids.
2. Storyboard stills come from the finished Stage A scene.
3. **Stage B:** the same scene converted to the main look (materials, engine light, grade, no world ink). It is not rebuilt.
   Every pass is render, look, fix, and ends when the picture is right, not only when the numbers pass. Guide from the airfield: about 8 rounds for pass 1, about 10 for pass 2, about 4 for Stage B. Keep a render log per pass: what changed, what the picture showed, the gate numbers. One final still per location must then pass `tools/check_episode.py` and `density_check.py` before animation.
4. Nothing ships above the limits: the final QA runs the gates on a frame sample from every shot and reports each FAIL with its measured gap.
