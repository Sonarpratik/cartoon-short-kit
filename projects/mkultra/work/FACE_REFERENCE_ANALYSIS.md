# Character-face study: roller-coaster reference

Source: user-provided local MP4, 480x854, 30 fps, duration 63.17 seconds. Studied 63 roughly one-second samples and native-resolution samples near 5.0, 5.3, 5.6, 6.0, 13.5, 15.0, 20.0, 21.0, 27.0, 33.0 and 43.5 seconds. Extracts are private study material in work/private-reference; exclude them from deliveries and packages.

## Observations

- Near 5.3-6.0 seconds, the large face is off-white with a faint lavender-grey lower/right crescent. The face centre is bright and broadly flat, not peach or tan. Thick dark-plum contour and solid dark eyes remain readable.
- At 15 and 20 seconds, the environment is substantially darker than the character's face. Facial value stays high; the scene's lighting does not darken the face like an ordinary shaded object.
- Near 21 seconds, the character looking through a telescope has features shifted toward the viewed side, one eye closed and asymmetrical brows. The lamp supplies a restrained warm edge. This is not evidence of glossy skin or bright eye catchlights.
- Expressions are held and changed for story beats: open grin, lowered lids, pinched brows, round shocked eyes, small mouth and wink. The face does not visibly articulate every narrated phoneme in the inspected samples. Do not label the reference as full lip sync without further evidence.
- Head/body tilts and separate hand gestures reinforce reactions. Side-facing features need to move across the head drawing; rotating a camera-facing plane is insufficient.
- No strong object-shaped shadow across the large face is visible in these inspected shots. Ground and clothing shadows remain present. The exact original rendering implementation cannot be identified from this MP4 alone.

## Concrete differences in this project

- src/characters.ts currently assigns peach/tan face fills to all five cast members.
- The character pose wrapper does not pass facing/look controls to bodyFront. All nine scene definitions therefore mostly use centred, forward-facing features.
- The drawing API already has facing/look and side-view support, but the wrapper and scene poses do not use it for interaction.
- The painted head crescent multiplies the fill by [0.96, 0.86, 0.84], which produces a warmer/darker far side rather than the reference's nearly neutral off-white face.
- cardshade.ts adds another directional head gradient: world.ts sets uGrad=0.045 and the shader's head multiplier is 5.5. This layers shader shading on top of the painted crescent.
- Character meshes are not configured to receive cast shadows. Their present facial darkness comes from fill, painted shading and the shader gradient, not from a lamp's cast-shadow map. Preserve their ground-shadow proxy separately.
- headTilt is supplied in fractions of a degree, while bodyFront converts degrees to radians. The current head sway is consequently barely perceptible.

## Proposed next character revision

1. Use a common off-white face base, keeping identity through silhouette, hair, costume and expression.
2. Replace the warm skin crescent with a small neutral/lavender edge shade. Keep the centre bright in all scenes, with subtle local-light tint rather than glossy highlights.
3. Expose continuous facing, eye direction, eyelid amount, mouth state and head tilt through the project character wrapper. Apply the same transform to glasses so they follow the eyes.
4. Author scene-specific gaze and reaction cues: civilian looks toward the cup, researcher toward the civilian, investigator toward the subject, archivist toward the opened file. Preserve narration as voiceover; do not make every character mouth the narrator's words.
5. Check isolated face poses plus one warm, one lab and one night scene before regenerating affected scene sheets. These would be shared character changes affecting S01-S06 and S08; S07/S09 contain no characters and should retain their existing frames if dependencies are tracked at the consumed-feature level.

This pass is analysis only. Character source, scene files and existing review sheets have not been changed.
