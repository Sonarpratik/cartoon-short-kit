# Camera travel and the shared director file

The user wants the reference's continuous glides as well as distinct cast designs in future projects. `templates/bridge/director.ts` is the canonical entry point for character presets, face/outline/reflection settings and camera interpolation. Copy it into a new project's engine along with its renderer helpers. Existing projects keep their own snapshot so future default changes do not silently alter approved videos.

## Private reference study

Studied the user's roller-coaster reference video directly at three samples per second. At about 7–8 s, a wide view moves into the character/workbench; around 17–20 s, the view pulls across the loop then approaches a character; around 36–39 s, it turns from the ride foreground to reveal the track below, with foreground/background parallax. These are apparent screen-space observations, not recovered original camera coordinates. Cuts and transitions are also present. Do not force a continuous flight between unrelated locations or copy the reference's shots.

Private analysis frames are in references/camera-study; never deliver them as project artwork.

## Defaults for new stories

Plan the camera with the lighting and props for every distinct place. Establish its geography, frame the action and reaction, and choose a move that reveals useful detail. Use a deliberate mix of three-quarter/side, wide, medium and close views across the story. Preserve the viewer's sense of direction between connected spaces; show the gate, door, window or road that explains travel. Verify source placement, shadow readability and prop/face occlusion through the actual moving camera, including intermediate frames. Lighting and set detail must work from the selected angle.

The user's later correction requires varied azimuths and physically enclosed rooms. Apply [physical-staging.md](physical-staging.md): use three-quarter and selected side angles, frame face reactions, and verify the camera passes through an actual small window rather than an omitted wall. `staging.ts` supplies `threeQuarterCamera` and `apertureCrossing`; use these alongside `cameraJourney` without changing unrelated reviewed scenes.

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

## Connected action and reference-informed angle variety (persistent)
The user explicitly requested fewer unnecessary cuts, more complex combinations of camera angles, and camera travel that follows arrivals and actions. A new sentence alone is not a reason to cut. Keep connected actions in one believable space on a continuous camera track whenever useful: reveal -> reaction -> hand/prop -> consequence. Mix purposeful lateral reveals, three-quarter/side views, low or elevated views, over-shoulder views and close inserts. Change angle, height and foreground parallax, not just zoom. Do not copy the reference's characters, staging or shot sequence.
For a character entering from the left, establish the left-side entry and track/pan left with the reveal, then maintain consistent geography through the exchange. Stage walking, carrying, sitting and entering vehicles/portals explicitly; do not substitute disappearance or an unexplained cut for travel.
`cameraSequence(frame, keys)` in the shared director uses absolute frame keys with continuous tangents, so camera moves can span scene/beat boundaries without restarting easing or moving a cue off its frame. `cameraBoundary` reports pose gaps. Review adjacent frames and a motion sample across every same-location boundary; use deliberate edits for different places/times or a motivated insert. Keep cameras inside real walls or validated apertures.
When the user authorizes a narration pause, insert silence at an existing phrase pause, retain the original speech samples and update audio, word times, shot ranges, capture ranges and total duration together. Do not compress actions simply to retain an old runtime. Do not add pauses without authorization.

## Set continuity during camera moves
Keep the same room geometry and window/door/furniture positions from the establishing frame through connected action. A new camera angle or narration sentence does not justify switching room roots or adding a window that was absent before. Check set continuity separately from camera-pose continuity: a smooth camera helper cannot hide a renderer dispatch to a different set. Build the opening in the actual room used for the later reveal. Persistent props, apertures and motivated light sources must remain fixed while the camera turns around them.
