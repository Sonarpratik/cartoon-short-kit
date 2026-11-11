# Camera travel and the shared director file

The user wants the reference's continuous glides as well as distinct cast designs in future projects. `templates/bridge/director.ts` is the canonical entry point for character presets, face/outline/reflection settings and camera interpolation. Copy it into a new project's engine along with its renderer helpers. Existing projects keep their own snapshot so future default changes do not silently alter approved videos.

## Private reference study

Studied the user's roller-coaster reference video directly at three samples per second. At about 7–8 s, a wide view moves into the character/workbench; around 17–20 s, the view pulls across the loop then approaches a character; around 36–39 s, it turns from the ride foreground to reveal the track below, with foreground/background parallax. These are apparent screen-space observations, not recovered original camera coordinates. Cuts and transitions are also present. Do not force a continuous flight between unrelated locations or copy the reference's shots.

Private analysis frames are in references/camera-study; never deliver them as project artwork.

## Defaults for new stories

- Plan a moving camera path inside each shot: a wide-to-medium reveal, a lateral track past a foreground prop, a small arc, or a purposeful tilt towards the next action. Make changes in perspective and subject scale visible; a tiny zoom alone is insufficient.
- Tie the path to the story: establish the setting, approach the active character/prop, then reveal the consequence. Preserve eyes, acting hands and hero objects. Use cuts when time or place changes.
- `cameraJourney(u, keys)` moves camera position, look target, focus and lens continuously with shared smooth timing and continuous tangents at internal keys. `glideCamera(u, from, to)` handles a single move. Coordinates and narrative beats belong to each story's scene modules, not the global defaults file.
- Do not add random wobble or an orbit to every shot. Keep deterministic frame-based motion, restrained roll and clear staging. Draw key poses and inspect intermediate frames for blockers and frame-edge clipping.
- Review a short silent motion excerpt as well as stills. Inspect the full move at delivery aspect ratio, especially close-up hats, hands, table edges and focus shifts.

```ts
import { cameraJourney, CHARACTER_ARCHETYPES } from './engine/director';
const outfit={...CHARACTER_ARCHETYPES.investigator}; // adapt to the new story
const camera=(u:number)=>cameraJourney(u,[
  {at:0,position:[1.6,3,8],target:[0,1.5,0],focus:[0,1.6,0],fov:39},
  {at:1,position:[.5,2.5,5.8],target:[.3,1.5,0],focus:[.3,1.6,0],fov:39},
]);
```

The MKUltra project uses this shared module's snapshot for both its distinct cast designs and all nine camera paths. Its lab shot has several continuous keys; the destruction scene follows the stamp before gliding to the shredder. Preserve the approved narration's length and timing when adapting the camera.


Original rendered camera-path examples are preserved in references/style-examples/camera-paths.jpg. The source-only worked example in templates/examples/interior-short-source.zip preserves scene paths without requiring projects/mkultra to remain installed.
