# Persistent lighting and set-detail defaults

These are the user's preferred defaults for every new short, without asking them to repeat the request. Choose an appropriate scheme for the story and scene; inspect rendered frames rather than promising a universal best setting.

The user explicitly likes the MKUltra v3 background direction: detailed rooms and props, visible window light, clear surface lighting and grounded shadows. Treat this as the default quality target for new settings, alongside the updated character lighting. Plan and build the environment automatically from the story; background detail and lighting are part of the initial scene, rather than a later optional polish pass. Preserve original staging and adapt the light sources to the location and time of day.

## Private visual references

The user supplied two screenshots: a white-faced red-cap character at night with a warm highlight inside the left head edge; and a paint workshop with window-grid light on the wall, worktop and lower shelf, stocked shelves, brickwork, cans and joinery. Study their light placement and material hierarchy, never their character design or staging. The exact inline screenshots are described here; they are not bundled image files.

`lighting/night-face-study.jpg` and `lighting/face-light-study.jpg` are private study frames extracted from the user's previously supplied roller-coaster reference video at 20 and 21 seconds. Never include these reference images in public outputs or deliveries.

## White heads and directed light

The user also wants a glossy reflection across the top of hair/headwear, as in their close-up reference: a curved tapered white ribbon with a bright centre, a softer warm-white skirt and a small restrained secondary glint. Apply this automatically to suitable visible hair/headwear in future projects. This is a surface reflection distinct from the face's pearl edge. `CharacterPen.shadedFill` clips this ribbon inside upper-head materials; it follows head pose without repainting facial features or changing the setting. The original example in `projects/mkultra/review/gloss-reflection-v8.jpg` demonstrates the implemented treatment; the user's supplied screenshot remains private study material.

Use `CharacterPen` from `templates/bridge/face-style.ts` for character drawing. It adds a soft pearl light layer inside the actual head contour and tapers the head ink strongly: thin on the lit side, thick below and on the far side. Keep the irregular bean contour; avoid a uniform circular border. The shared cast pool already uses this helper. The user explicitly prefers this brighter layered face treatment over the previous flat white face.

- Use off-white faces (#faf9f5), dark plum ink, restrained lavender form shading and plain dark eyes. Faces remain readable at night.
- Keep the highlight inside the face silhouette. Use a broad soft wrap plus a narrower lit edge, coloured by the source. Preserve the ink border and eyes. Avoid a duplicated outer silhouette or a uniformly glowing head.
- `templates/bridge/cardshade.ts` supplies the white-face mask and inner rim. `lighting.ts` exports FACE_LIGHT for warm/cool colour and strength. Update these uniforms when the shot's light changes.
- Key direction, the lit head edge, cast shadows and window pattern must agree. Character cards avoid hard environmental shadows across their faces; props receive real shadows.
- Heads need rounded form shading as well as a bright rim: use a soft cool shadow on the far side, a warm/cool lit crescent and restrained reflected light on hair. Keep the central face off-white and eyes/ink dark. A uniformly white disc with a narrow line is insufficient.
- `cardShade(material, faceFrame)` accepts a per-actor `{value: Vector4}` containing head centre UV and half-width/height UV. Update it from the character's actual seed, facing and head pose. The default adult frame is (.5,.691,.197,.111). Body cards receive cast shadows; the face retains a bright floor. Set the shadow proxy to face the light from the actor's actual position and keep a soft contact shadow under the feet.

## Interior window light

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
