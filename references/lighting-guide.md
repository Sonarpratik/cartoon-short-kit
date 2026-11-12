# Persistent lighting and set-detail defaults

These are the user's preferred defaults for every new short, without asking them to repeat the request. Choose an appropriate scheme for the story and scene; inspect rendered frames rather than promising a universal best setting.

## Required for every room and place

Apply this to every interior, exterior, establishing view and connecting location. Give each setting its own motivated lighting scheme; choose the source, direction, colour, shadow softness and exposure for the time, weather and story. Record it with the camera and prop plan before building the scene. Do not leave secondary rooms or transition locations with unfinished default lighting.

- Day interiors: light enters actual openings; practical lamps contribute where appropriate. Use visible pane patterns or dust shafts when the source and atmosphere justify them. Furniture and people cast coherent shadows on receiving walls and floors.
- Night interiors: visible ceiling fixtures, desk lamps, instruments or exterior light through a window explain the illumination. Preserve darker areas and clear light pools while keeping expressions readable.
- Day exteriors: coordinate sky, sun or overcast key, ground/contact shadows, building scale, trees and distance haze. Overcast light can have soft shadows; preserve enough form and contact shading to ground objects.
- Night exteriors: motivate illumination with street lamps, windows, security lights or moon/sky light. Show their effect on nearby surfaces and retain readable silhouettes and depth.
- Alarm and other lighting changes: align source colour/intensity and room illumination to the narrative cue. Inspect before, during and after the change. Keep the effect within the intended space.

Review every location at the start, middle and end of its camera move, plus lighting cue frames. Check a visible source, a lit surface, a shadowed surface, grounded furniture/feet and readable faces. Confirm the shader actually responds to each light. Check enclosing walls, window blockers and intersecting ground slabs before increasing brightness to conceal missing illumination. Fix failures before delivering review images. These requirements are scene-specific; they do not mean adding the same beam or hard shadow to every setting.

The user explicitly likes the preserved background example in style-examples/backgrounds-approved-v3.jpg: detailed rooms and props, visible window light, clear surface lighting and grounded shadows. Treat it as the quality target for material detail, window light and shadows only. It is a single office room: do not reuse its layout, palette, shelves or desk framing; every story needs its own locations (see [scene-design.md](scene-design.md)). Plan and build the environment automatically from the story; background detail and lighting are part of the initial scene, rather than a later optional polish pass. Preserve original staging and adapt the light sources to the location and time of day.

## Private visual references

The user supplied two screenshots: a white-faced red-cap character at night with a warm highlight inside the left head edge; and a paint workshop with window-grid light on the wall, worktop and lower shelf, stocked shelves, brickwork, cans and joinery. Study their light placement and material hierarchy, never their character design or staging. The exact inline screenshots are described here; they are not bundled image files.

`lighting/night-face-study.jpg` and `lighting/face-light-study.jpg` are private study frames extracted from the user's previously supplied roller-coaster reference video at 20 and 21 seconds. Never include these reference images in public outputs or deliveries.

## White heads and directed light

The user also wants a glossy reflection across the top of hair/headwear, as in their close-up reference: a curved tapered white ribbon with a bright centre, a softer warm-white skirt and a small restrained secondary glint. Apply this automatically to suitable visible hair/headwear in future projects. This is a surface reflection distinct from the face's pearl edge. `CharacterPen.shadedFill` clips this ribbon inside upper-head materials; it follows head pose without repainting facial features or changing the setting. The original example in `references/style-examples/hair-reflection.jpg` demonstrates the implemented treatment; the user's supplied screenshot remains private study material.

Use `CharacterPen` from `templates/bridge/face-style.ts` for character drawing. It adds a soft pearl light layer inside the actual head contour and tapers the head ink strongly: thin on the lit side, thick below and on the far side. Keep the irregular bean contour; avoid a uniform circular border. The shared cast pool already uses this helper. The user explicitly prefers this brighter layered face treatment over the previous flat white face.

- Use off-white faces (#faf9f5), dark plum ink, restrained lavender form shading and plain dark eyes. Faces remain readable at night.
- Keep the highlight inside the face silhouette. Use a broad soft wrap plus a narrower lit edge, coloured by the source. Preserve the ink border and eyes. Avoid a duplicated outer silhouette or a uniformly glowing head.
- `templates/bridge/cardshade.ts` supplies the white-face mask and inner rim. `lighting.ts` exports FACE_LIGHT for warm/cool colour and strength. Update these uniforms when the shot's light changes.
- Key direction, the lit head edge, cast shadows and window pattern must agree. Character cards avoid hard environmental shadows across their faces; props receive real shadows.
- Heads need rounded form shading as well as a bright rim: use a soft cool shadow on the far side, a warm/cool lit crescent and restrained reflected light on hair. Keep the central face off-white and eyes/ink dark. A uniformly white disc with a narrow line is insufficient.
- `cardShade(material, faceFrame)` accepts a per-actor `{value: Vector4}` containing head centre UV and half-width/height UV. Update it from the character's actual seed, facing and head pose. The default adult frame is (.5,.691,.197,.111). Body cards receive cast shadows; the face retains a bright floor. Set the shadow proxy to face the light from the actor's actual position and keep a soft contact shadow under the feet.

## Interior window light

The user also prefers a coherent designed sky and believable enclosed architecture; see [physical-staging.md](physical-staging.md). Keep ceilings and walls present, make the window projector agree with the actual opening, and distinguish the exterior daylight from indoor practical lighting. Night windows, ceiling fixtures and instrument lamps should have visible sources. Fog must retain a readable connection between the factory, access road and city.

`templates/bridge/lighting.ts` exports WINDOW_LIGHT and setInteriorLight. It projects a softened 3-by-4 pane grid in world coordinates through the twoTone material shader, onto walls, tabletops, furniture and floors. It is disabled by default for outdoor scenes.

```ts
import { setInteriorLight, WINDOW_LIGHT } from './lighting';
setInteriorLight(false, .85); // warm daylight; true selects cool night light
// Place the source window at x=-5.46, y=2.7, z=.8, height=3, width=6.
// Directional key: position(-12,3.4,7.2), target(0,1,0).
// For other layouts update origin, direction, size AND the visible window/key.
```

The projector travels right, down and towards the back wall. Use its actual opening geometry as the visual source. A solid architectural shell must not shadow over the virtual opening. Props still cast shadows. This is a stylised directional projector, not volumetric light or general ray tracing; test for leaks and near-window blockers in the actual shot. Use perspective or another projector when multiple walls/openings require it. Do not paste transparent bars into screen coordinates.

## Set detail by importance

- Hero objects: correct proportions, seams, handles, controls, readable moving parts and hand contact.
- Midground: drawer fronts and pulls, table aprons/stretchers, cabinet seams, shelf brackets and a few relevant contents.
- Background: wall trim/panels or restrained masonry, window frames/sills and context-specific storage. Use broad quiet colours; reduce contrast and detail with distance.
- Invent original dressing appropriate to the setting. Keep signs and faces unobstructed. Avoid identical shelves in every room, excessive procedural grain, floating fittings and clutter around the action.

Review a daylight room, night close-up, hero-prop insert and camera endpoints. Check the window pattern crosses surfaces correctly, the head edge is visible without clipping, cast shadows agree and details survive at delivery size.


## Clothing reflection

Check every cast member, including the investigator and archivist. Seeded head proportions can move shoulders above an arbitrary canvas coordinate; identify valid garment shapes from their bounds and size rather than rejecting them with a fixed shoulder-height cutoff. Review the reflection on each outfit at its actual shot size.

The user clarified that the clothing reflection hugs the curved silhouette and tapers to pointed ends. Draw a narrow bright curved strip just inside the source-facing border, with a restrained soft skirt. Follow the actual clothing contour, retaining its dark outer ink; avoid a broad vertical stripe in the centre of the torso. CharacterPen.gradFill intersects the garment polygon at each height to place a deterministic tapered ribbon before buttons, collars and other costume details. The shader supplies only a subtle broad light wrap, not a second central streak. Hair/headwear retains its separate curved glossy reflection. Adapt the side to the key light and keep the far side shaded.


Reusable detailed interior construction and furniture live in templates/interior/world.ts and props.ts. This library and references/style-examples are independent of any story project. See style-examples/README.md for the full preserved example index.

## Source-driven interior light and alarms

The user prefers visible window shafts and practical bulbs with matching light on walls and floors, as in their private window-beam reference. Glowing fixture geometry alone is insufficient: place a real shadow-casting light below the fixture, and aim window light through the actual opening. Preserve darker unlit areas so shadows from furniture, window frames and workers remain visible. Keep beams in world space and stop them at receiving geometry. Check the wall and floor at the final shot angle.

For two-tone shaders that replace Lambert lighting, explicitly retain practical-light irradiance and its shadow visibility in an opt-in material wrapper; adding a Three.js spotlight alone may have no visible effect. Keep shared materials isolated between scenes. Emergency lighting must turn the room red at the alarm cue, with readable faces and indicators, while exterior walls retain their outdoor lighting.
