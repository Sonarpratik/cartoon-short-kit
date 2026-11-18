# Rick light scheme and shaders (optional look)

An alternative to our own look, taken from the Ricks Clips V1.1 kit (`newZip/RicksClips_Skill_V1.1/`: `CB_RULES.md` sections 3, 5, 6b, 8; `examples/lightning-spear/LOOK_BIBLE.md`; `templates/threejs_film/look3d.mjs`, `PBR_FEATURES.md`). It is coded light and shaders only: no Blender pass.

**Our own scheme stays the default and is not changed** (`references/lighting-guide.md`, `templates/bridge/lighting.ts`, `cardshade.ts`, `shade.ts`, `grade.ts` with `GRADE_CINEMATIC`). At the start of every build, ask the user which scheme the short uses:

1. **Ours** (default): the current lighting guide, shaders and the dark cinematic grade.
2. **Rick**: this file.

Record the answer in `work/PLAN.md`. Never mix the two inside one short.

## 1. How the two differ

| | Ours (default) | Rick scheme |
|---|---|---|
| Overall brightness | Dark cinematic grade | **Bright and soft**: mean brightness 0.42-0.50, saturation 0.40-0.50, darkest 1 % lifted by haze to 0.08-0.15 |
| Colour worlds | Light arc across the story | **A clearly different colour world per kind of light**, 5-9 kinds in one film, each chapter its own light |
| Night | Our night palette | **Evenly lit blue night**, mean brightness never under 0.31, small white-hot bulbs and ONE warm lamp pool; never a dark scene with a spotlight |
| Faces | Our face shading and rim (`cardshade.ts`) | **Clean white faces** with only the drawn shade; no coloured rim light, no shadow from hair, hats, props or scene light on a face |
| Costumes | Our clothing rim | **Costume shade**: cloth, hats and accessories darker on the side away from the key; faces never get it |
| World outlines | Ink outlines on the world (`ink.ts`) | **No ink outlines on the world**: outlines on the characters only, plus fine BUILD lines inside objects (plank seams, panel edges, bolts) |
| Metal | Toon colour | **Real metal**: physical material reflecting the place's own sky, a bright streak along every rail and tool edge |
| Ground and walls | Painted procedural surfaces (`paint.ts`) | **Real-size relief**: normal-mapped stone, brick, cobble, tile, planks, mud, bark, grass at true real-world sizes |
| Sky | Our sky | **Painted cloud sky** per kind (dusk storm, clear day, rain overcast, night storm), clouds lit from inside on lightning |

## 2. Light schemes: one table per film

Before any set is built, write a light table in `work/PLAN.md`: the film's lights as named kinds (A, B, C...), one row per chapter. Each kind is a clearly different colour world.

| Field | What to write |
|---|---|
| Rows / scenes | which scenes use this light |
| Light | the name of the light kind (purple dusk before a storm, candle interior, clear morning...) |
| Key | the one strong key you can see or infer: source, direction, colour hex, hard or soft |
| Fill | what sets how dark the shadows get: sky colour, wall bounce |
| Notes | sky, air life, glows and the story accent in this light |

Example kinds from the reference film (use as starting points, never copied as a set):

| Kind | Key | Fill | Character |
|---|---|---|---|
| Purple dusk before a storm | low orange sun from screen-left (#ffb46e), hard long shadows | violet sky (#9a86ea) | purple cloud wall with volume, one pale far flash, peach horizon gap |
| Candle interior | warm candles (#ffb347 cores, never clipped) | deep red and blue bounce, dusk violet through a door | dust in the door light |
| Bright clear morning | high white-gold sun (#fff1d6), hard shadows | deep blue sky | white surfaces near-white but never clipped; gold glints |
| Golden noon | warm high sun | yellow wall bounce | striped awning shadows on the ground |
| Drizzle, then sun | soft silver-green overcast, then one sunbeam | cool green-grey | wet stone shine |
| Grey rain with fire | flat grey storm light, white bolt, orange fire | green bounce | rain in sheets |
| Flash light | white flashes through openings | none between flashes, readable dark | |
| Blue night storm | cool blue moon-storm light, evenly lit (mean ≥ 0.31) | warm lantern points | white bolts |
| Rose dawn after | low rose-gold sun | washed blue | wet roofs shine |

Rules for the table:
- **The light follows the story clock**: the turn of the story gets its own light. Light direction and shadows stay the same across every shot of one place and time.
- **One signature constant light** for the film: a small recurring light tied to the hero object (the reference: a cold blue-white glint on the iron spear tip, a spark at dusk, a drop in spring, the whole wire lit at night). It is the only light of its colour in the film.
- **Palette**: one base world (no beige, no grey) plus ONE loud story accent, used on the hero object and nowhere else. Give the hero and the rival their own colours that nobody else wears.
- **Numbers before the grade** (measured on ungraded frames): saturation at least 0.36 for the film and 0.30 by day; night frames never under mean brightness 0.31; faces white by day.

## 3. Light in every frame

- **One strong key light** you can see or infer (sun, window, lamp). Hard long shadows of every character and prop from that key: no grey blob under the feet.
- **Contact shadow**: a small soft DARK patch right under each sole, prop leg and wheel, about the width of the foot and fading within a few centimetres, on top of the long cast shadow. Soft darkening in corners, under overhangs and where walls meet the floor.
- **Fill** keeps the shadow side readable, never black. **Rim** separates characters from the background (on the costume, never as a coloured rim on the face).
- **Shaped light patches** (window bars, awning stripes), colour bounce from strong colours, and every lamp glows.
- **Glints**: shiny highlights on chrome, paint, glass and lamps, about 1-2 % of the frame; dark accents in the shadows.
- **Depth**: something big and close in the frame, a pale far distance, corners a little darker.
- **Characters are lit by the scene**: the side toward the source is brighter and takes its colour; a character never goes dark because the light is behind it. The face takes the colour of the light but keeps only its drawn shade.
- **Light shafts** only on the hook or a dramatic beat. **Depth of field** only on close-ups, mild, and never blurring a character.
- **Dynamic light**: fire flicker, lightning flashes and moving lamps change the light on the set and the characters on their frame.

## 4. Shaders (coded, in three.js)

The reference kit's features, to implement in our engine when the Rick scheme is chosen. Their code is `newZip/RicksClips_Skill_V1.1/templates/threejs_film/look3d.mjs` (personal-use licence: use it for our own videos, but keep it out of the repo; read it for the method).

| Shader | What it does |
|---|---|
| **PBR metal** | `MeshPhysicalMaterial` with an environment map made from the place's OWN sky (PMREM), so metal reflects the scene. Kinds: iron (dark blue-black, hammered, slight rust), steel (brushed), bronze (cast, green patina in recesses), gold (gilt with clearcoat), brass (brushed), wet (dark glossy non-metal: wet stone, glass-like). Procedural normal and roughness maps; per-kind finish (hammered, brushed, cast, smooth). |
| **Relief surfaces** | Toon light look plus a normal map and colour variation per stone or board, at real sizes: cobble setts 0.18 m (repeat 1.8 m), stone flags 0.5 m (repeat 2.0 m), brick 0.23 × 0.077 m with mortar (repeat 0.92 m), roof tile rows 0.3 m (repeat 1.8 m), wood planks (repeat 2.4 m), bark 1.0 m, grass 2.5 m, mud and plaster 3 m. All textures tile seamlessly. |
| **Painted sky** | Clouds painted per pixel on the dome by kind: dusk storm (anvil deck, storm wall, rain curtains, scud), clear day (soft lit layers), rain overcast, night storm. A flash lights the clouds from inside around one direction or world point. Known issue: the storm sky goes black at a long lens. |
| **Kit trees** | Cypress, olive, oak, blossom: a bark trunk, 2-3 forks, 20-60 leaf clusters of many leaf cards, each with a light and a shade side. Trees grow in clumps and lines, never evenly spread balls. |
| **Lightning** | A branched bolt of light with a flash on the world (never white spaghetti lines). |
| **Costume shade** | On the character card: cloth, hats and accessories get a darker side away from the key (amount 0.45, start 0.35, cool 0.15, smoothed so hair shows no horizontal streaks). Skin and ink lines are skipped. |
| **Face** | No card rim light on faces (rim amount 0, no far light), in every place. |

Every `pow`, `sqrt`, `normalize` and division in these shaders is guarded: a not-a-number pixel renders black on the GPU.

## 5. The grade (last picture step)

- One grade **per light kind**: a colour-to-colour map per kind, plus an additive coloured haze that lifts the darkest tones.
- Targets after the grade: saturation about 0.40-0.50 (the reference measures 0.46), mean brightness 0.42-0.50, darkest 1 % 0.08-0.15, the white point not clipped.
- Guards: faces stay white (by day), the caption letters and the story's key reds are protected, and pixels darker than about 0.09 keep about 75 % of their darkness so a black hero object stays glossy black.
- Night floor: check EVERY night frame, not a sample; none under mean brightness 0.31.
- Measure with the caption band left out.

## 6. Checks before the user sees a frame

- One day and one night frame per film side by side: key direction, shadow colour, contact patch present and dark, cast shadow full-figure.
- Zoom on the feet of every look frame: planted, contact patch, hard shadow.
- Zoom on the faces: any grey or coloured patch the template did not draw is a fault.
- Phone check: frames at 360 px wide (captions on): subject visible and unblocked, one clear focal point.
