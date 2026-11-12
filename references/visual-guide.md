# Reusable cartoon art direction

Use these criteria when adapting the worked example. Match the visual language while keeping characters, stories and staging original. Reference frames stay private.

Use [lighting-guide.md](lighting-guide.md) for the user's persistent window-light, white-head highlight and detailed-set preferences. Apply them automatically to new projects.

For requested subtitles, apply [karaoke-guide.md](karaoke-guide.md): white short phrases with only the current spoken word in goldenrod. Preserved rendered example frames are linked there.

## Characters

- Design the cast with [character-design.md](character-design.md): 10 hair styles, 9 headwear types, 8 garments, fabric patterns, collars, ties, scarves, badges and face accessories, checked with `castDistinctness()`. Costume shows each character's job and era. Characters never show their backs on screen. Check hats, glasses and facial hair through reactions and side glances, preserving eyes and mouth visibility.

- Include the user's preferred curved glossy reflection on suitable hair/headwear: a tapered white strip with a soft surrounding glow and a small secondary glint. Reuse CharacterPen in templates/bridge/face-style.ts. This is a standing preference for new projects; see lighting-guide.md for implementation and the distinction from face lighting.

- Start from the Pen/bodyFront/bodySide implementation in templates/bridge/toon.ts. Preserve thin ink limbs, bean torsos, readable facial expressions and contact with the ground.
- Shared line width and head variation are in style.ts. Make distinct silhouettes through head proportions, hair, headgear and clothing; do not just recolour identical sprites.
- Keep variation deterministic per character. Do not change the seed between frames or create frame-to-frame outline noise.
- Avoid excessive black borders around every clothing detail. Keep face detail lighter than the outer silhouette.
- Keep the rig's micro-motion on: breathing, weight shift, gaze saccades, irregular blinks and hair follow-through. Add acting on cues; never add random per-frame noise.
- Preserve bright readable faces under warm and cool lighting. Anticipation and settling help convey actions.
- Preview new cast designs in the character gallery and at their intended on-screen size.

## Props and backgrounds

- Claude selects props from the narration. Choose a hero object that explains the action and keep the action area clear, then dress the midground and background densely with story-specific objects (see [scene-design.md](scene-design.md)). Avoid random decoration that does not belong to the place.
- Reuse createProp from templates/bridge/props.ts for a crate, barrel, bench, table, desk, shelf or cabinet. All have base-centred origins and use metres. Position at the actual ground height; yaw is in radians. Validate custom dimensions and scale relative to the actors.
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

- Use templates/bridge/director.ts for camera helpers and pick each move from the story beat in [camera-guide.md](camera-guide.md): bursts then holds for hooks, escalation and payoff; slow glides for setting and explanation; slow creep for mystery. Review short motion excerpts alongside stills.

- Frame a clear subject and action. Avoid rails, posts, ropes and repeated characters covering faces or hands unless the obstruction has a story purpose.
- Review at least a character close-up, a medium action shot and a wide setting shot. Inspect the beginning and end of camera moves and both sides of cuts.
- Check hand/prop contact and ground placement during motion, not just in a still pose.
- Keep hands connected to the character's actual arm. Avoid a separate floating 3D sleeve/palm alongside a drawn character. For billboard characters gripping a 3D prop, project the grip onto the billboard using the current camera and compensate actor motion; check contact through the full camera glide.
- Keep verticals readable. Prefer deliberate camera moves and restrained roll; avoid tilting a wide view solely to fit a tall building.
- Compare before/after frames at equal resolution and the same frame number. Use matching lighting and shot size when selecting private reference frames for study.
- Evaluate character silhouette, materials, shadows, framing and motion separately. Improving one does not demonstrate that the whole video matches the target.


## Independent reusable library

See style-examples/README.md for preserved examples of approved background detail, face/hair/body reflections, cast variation and camera paths. Detailed interior/prop code is in templates/interior; central character/camera defaults are in templates/bridge/director.ts. These remain available if a story project is removed.
