# Reusable cartoon art direction

Use these criteria when adapting the worked example. Match the visual language while keeping characters, stories and staging original. Reference frames stay private.

## Characters

- Start from the Pen/bodyFront/bodySide implementation in templates/bridge/toon.ts. Preserve thin ink limbs, bean torsos, readable facial expressions and contact with the ground.
- Shared line width and head variation are in style.ts. Make distinct silhouettes through head proportions, hair, headgear and clothing; do not just recolour identical sprites.
- Keep variation deterministic per character. Do not change the seed between frames or create frame-to-frame outline noise.
- Avoid excessive black borders around every clothing detail. Keep face detail lighter than the outer silhouette.
- Preserve bright readable faces under warm and cool lighting. Blinks, anticipation and settling help convey actions; do not move every body part continuously without purpose.
- Preview new cast designs in the character gallery and at their intended on-screen size.

## Props and backgrounds

- Claude selects props from the narration. Choose a hero object that explains the action, then two to four supporting objects where useful. Avoid clutter and random decoration.
- Reuse createProp from templates/bridge/props.ts for a crate, barrel, bench or table. All have base-centred origins and use metres. Position at the actual ground height; yaw is in radians. Validate custom dimensions and scale relative to the actors.
- Extend the library for story-specific objects such as a ship, well or laboratory machine. Give a new prop its own function rather than repeatedly copying geometry into scenes.
- Broad painted colour areas should dominate. Use sparse grain, wear and mortar; retain useful seams without speckling every surface.
- Vary building width, height, facade style and spacing where it matters to the camera. Generic repeated window grids across the whole background are a warning sign.
- Overlap joints slightly to avoid cracks. Add a few structural details, such as a roof overhang, table apron, barrel hoop or door frame, where they explain the object.
- Keep objects off the same plane to avoid z-fighting. Use enough cylinder segments to preserve a curved silhouette.
- Distant objects need less contrast and thinner ink. Avoid adding foreground detail to compensate for weak composition.

## Lighting, outlines and focus

- style.ts controls world ink, character ink, paint detail and depth blur. Keep the defaults for a new story, then tune against real frames instead of changing every setting at once.
- Use broad readable light/shadow shapes. Preserve colour in shadow; avoid crushed black, bright orange ground against uniformly purple buildings, or dark orange faces.
- Day and golden presets exist in lights.ts. Night is a design option requiring implementation in the lighting, world look, grade and timeline types; it is not a bundled preset.
- World lines should support silhouettes. Fine railings, chains and distant houses should not compete with faces.
- Close-ups can use depth blur, but preserve context in medium/wide shots. Keep eyes and the active hand/prop in focus. A blurrier background is not automatically more cinematic.
- Use contact shadows under standing characters and props. Directional shadows should agree with the key light.
- Keep bloom on bright emissive objects. Do not use full-screen haze to hide incomplete materials or scenery.

## Camera and review

- Frame a clear subject and action. Avoid rails, posts, ropes and repeated characters covering faces or hands unless the obstruction has a story purpose.
- Review at least a character close-up, a medium action shot and a wide setting shot. Inspect the beginning and end of camera moves and both sides of cuts.
- Check hand/prop contact and ground placement during motion, not just in a still pose.
- Keep verticals readable. Prefer deliberate camera moves and restrained roll; avoid tilting a wide view solely to fit a tall building.
- Compare before/after frames at equal resolution and the same frame number. Use matching lighting and shot size when selecting private reference frames for study.
- Evaluate character silhouette, materials, shadows, framing and motion separately. Improving one does not demonstrate that the whole video matches the target.
