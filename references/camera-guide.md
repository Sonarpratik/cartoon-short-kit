# Camera guide: the reference approach

The reference channel films one travelling camera that keeps catching the story's moving things. It almost never stops, and it almost never cuts. This guide is that approach, measured on 24 of its Shorts (numbers from the Ricks Clips V1.1 measurement set, `newZip/RicksClips_Skill_V1.1/CINEMATOGRAPHY.md`, `CB_RULES.md` section 3).

It replaces the older "about 80 % of frames are holds" guidance. That number came from a measurement that the same team later retracted: the tool was pinned by the burned-in captions and could not see zooms. Re-measured, the reference camera rests on only about 9 % of frames.

## 1. The numbers to aim for

| Measure | Reference | Our rule |
|---|---|---|
| Frames with the camera moving | 67 % clearly moving, ~9 % resting | Move nearly all the time; a rest is never frozen (section 3) |
| Hard cuts | 0.4 per 10 s, median shot ~17 s | At most **1 hard cut per short**, kept for a deliberate jolt |
| Scale change per shot | every shot ≥ 10 %, long shots ~+100 % | Subject grows **30-100 %** over a shot (`pushIn`) |
| Push in vs pull back | ~70 % push in, ~12 % pull back | Push by default; pull back for about one reveal in eight |
| Rests | ~3 per 10 s, each landing on a word | Land on the word the narration names, 0.15 s (5 f) early |
| Tracking | ~28 % of frames hold a moving subject while the world streams | Follow every mover: walkers, carts, thrown things |
| Ordinary move speed | p90 ~25 px/f at 720p (~37 px/f at 1080) | Faster only for whips (≤ 10 f) |
| Camera height with a character in frame | at the character's height | Lens between chest and eye; ≤ 10° down to the chest |

`templates/scripts/camera-report.mjs` measures a whole short against these rules from camera poses alone, without rendering a picture (section 6).

## 2. One camera idea per film

Before placing any camera, pick ONE idea for the whole film, taken from the story's own object or mechanism, so this camera could not belong to another story. Examples of families:

- **The mechanism is the path:** the camera moves the way the story's thing works (a clock hand sweeping, a pendulum, a coin rolling downhill, a fuse burning).
- **The object's journey:** the camera rides with one object from first hand to last; people enter and leave around it.
- **The scale ladder:** macro on the tiny cause, each beat one step wider, the last frame shows the whole consequence (or the reverse).
- **The vertical story:** 9:16 is tall, so tell it bottom to top (cellar to roof, sea bed to mast); the payoff is at the top.
- **Through the thing:** every place change goes through the story object (into the keyhole, out of the telescope).
- **The mirror loop:** the second half retraces the first half's path with everything changed; the last frame is the first frame.

Write the idea in `work/PLAN.md` with one line on why it fits this story and the one move people will remember. Give the film three hero moments (the hook, the turn "You see,", the payoff), each with one camera event landing on its punch word: a reveal, a catch, an impact, a rise, a pass-through. Keep the camera disciplined in between, so the hero moments read as events.

## 3. How the camera moves

- **One slow continuous move per beat.** Enter a shot moving and land it settled on the word. A "rest" is a slow push with a small sideways slide around the subject, never a frozen frame. The horizon is level while resting.
- **The scene picks the move:**

| The scene | The camera |
|---|---|
| Talk, a reaction, a joke on a face | Rest on the face with a slow push; short 1-2 s hops between faces |
| Something travels (walker, cart, letter, ball) | One 3-7 s move rides or follows it and lands on a face or on the noun; no rest in the middle |
| A place is introduced | Start on a detail and rise or pull back until the place towers over the character (or the reverse); the world leads the frame |
| A mechanism is explained | Follow the force through the machine in one move (hand, lever, rod, signal) |
| Time passes | A blend with a double exposure, or the light changes inside the shot |
| A big thing arrives | Low and close, the thing rises over the lens, the character small at the bottom |
| The payoff | Very close after a wide, or the object comes to the lens |
| A small object (coin, button, lever) | Push in on it inside the take on a longer lens, then glide back out; never a cut to a separate insert |

- **Push in all the time.** Over a shot the subject grows 30-100 % (`pushIn(from, 0.45)` in director.ts gives the end pose). Pull back for reveals.
- **Track movers.** When something moves, the camera rides beside or behind it so the world streams past. When the mover leaves (a jump, a turn), the camera keeps its momentum, slows to a stop over 40-60 f, and turns with a slight lag (0.08-0.15 s).
- **Roll** only inside a travel, 4-6°, back to zero on landing. Impact kicks flip sign every frame and die in about 7 frames.
- **Never zoom to reframe: move the camera.** Change the lens only for object inserts and deliberate snap zooms.
- **9:16 staging:** move subjects toward and away from the lens or up and down. A left-right crosser leaves a vertical frame in about 0.5 s; fast things pass above or below the lens, not beside it.

## 4. Angles and framing

- **Camera at the character's height.** With a character in frame, the lens sits between chest and eye level for talk and acts, or low near the ground looking up for power. At most 10° looking down at the chest (`downAngle` in transitions.ts). Characters are about 1.8 m tall: chest ≈ 0.9 m, eyes ≈ 1.45 m, so a close shot at 2-3 m needs the lens at about 1.3-1.45 m.
- **High and top-down views only with no character in frame** (a map, a crowd of objects, a place). If a shot starts high on the set, crane DOWN to the character's height before or as the character enters (`craneDown` in director.ts).
- **Wide and close.** The reference shoots a wide lens close to the subject (about 24 mm, ~70° tall), with the lens at knee to chest height, so near things are big and the world falls away behind. Use a wide fov close in for character shots; keep long lenses for object inserts.
- **Something big and close in many frames:** a foreground object near the lens adds depth to every move (keep it off faces and hands).
- **Heads** sit at about 45 % of frame height and never inside the caption band (58-76 % of the height) when captions are on. The first face is on screen within 1.5 s.
- **Faces to camera:** characters stay front-safe (`frontSafeYaw`, ±60°); our rig has no back views.

## 5. Joining scenes: a move, not a cut

Every scene change and every cut inside a scene is joined with a move (`templates/bridge/transitions.ts`). List the joins next to the scene table:

```ts
import type {Join} from './engine/transitions';
export const JOINS: Join[] = [
  {at: 150, kind: 'whip', dir: 1},          // place change: fast pan out, arrive from the other side (10 f, blurred)
  {at: 262, kind: 'push'},                   // next beat: fly into the outgoing shot, arrive moving forward (12 f)
  {at: 920, kind: 'blend', frames: 14},      // time jump (night, sunrise, years later): soft crossfade
];
```

| Join | Use for | What happens |
|---|---|---|
| `whip` | a change of place | the outgoing camera pans away fast (accelerating), the incoming one arrives from the other side (decelerating), ~2°/frame at the peak, blurred, 10 f |
| `push` | the next beat, a dive into an object, a cut inside a scene | the outgoing camera flies into its subject, the incoming camera arrives still moving forward, 12 f. `depth` < 0 pulls back instead |
| `blend` | a jump in time | crossfade, 10-14 f |
| `cut` | one deliberate jolt per short | a hard cut |

A same-place change can also be one continuous travel inside one scene module: start the next beat's camera exactly at the previous end pose and keep moving.

**Player wiring** (a single-renderer project player). The cameras keep moving through a join: each side continues at its own velocity past the cut frame.

```ts
import {joinAt, JoinCompositor, extrapolateCam, installCameraProbe} from './engine/transitions';
const compositor = new JoinCompositor();
api.renderFrame = (f) => {
  const j = joinAt(f, JOINS);
  if (!j) return drawScene(sceneAt(f), f, f);
  const at = j.join.at;
  drawScene(sceneAt(at - 1), j.outFrame, f, {hi: at - 1, mod: j.outCam});  // outgoing shot, camera continued past the cut
  compositor.capture(renderer.domElement);                                // renderer needs preserveDrawingBuffer: true
  drawScene(sceneAt(at), j.inFrame, f, {lo: at, mod: j.inCam});           // incoming shot, camera continued before the cut
  compositor.overlay(renderer, 1 - j.alphaIn);
};
```

`drawScene(def, sceneFrame, filmFrame, {lo, hi, mod})` poses the scene at `sceneFrame` and takes its camera at `filmFrame`, held to `lo..hi` and continued beyond with `extrapolateCam`, then applies `mod`. A working version: `projects/balloon-army-camera-test/src/player.ts` (a test copy; the delivered film is unchanged).

## 6. Check with numbers before pictures

Install the probe in the player (`installCameraProbe`, see the test copy), start the preview, then:

```powershell
node templates/scripts/camera-report.mjs http://127.0.0.1:8788 work/camera-report.json
```

It prints every shot with its push-in and the steepest look-down at a visible character, lists hard cuts, and ends with PASS/FAIL lines for the three rules (hard cuts, push-in, camera height). Fix every FAIL in the plan, or write the scene's reason in `work/PLAN.md` (a pan or a tilt that follows a mover is a fair exception to the push rule). Then review a short silent motion clip of the moves: blocked faces, clipped hats and hands, focus, and back views.

## 7. Shared helpers (`templates/bridge/director.ts`)

```ts
import {cameraSequence, pushIn, craneDown, eyeLevelPose, EASE, CAMERA_PACE} from './engine/director';
const start = eyeLevelPose([0, 0, 0], {distance: 6, yaw: 15});   // lens at chest-to-eye height, front-safe angle
const end = pushIn(start, 0.45);                                  // subject 45 % bigger at the end of the shot
const cam = (f: number) => cameraSequence(f, [{...start, frame: 150}, {...end, frame: 261}]);
```

- `cameraSequence(frame, keys)` places keys on exact frames; `cameraJourney(u, keys, ease)` runs a multi-key path over 0..1.
- `pushIn(pose, grow)` returns the pose that makes the subject `grow` bigger (0.45 = 45 %), lens change included.
- `eyeLevelPose(subject, {distance, yaw, height, fov})` puts the lens at character height looking at the chest-to-face area.
- `craneDown(u, highPose, eyePose)` eases from a high view down to character height (start it before the character enters).
- `CAMERA_PACE` holds the per-beat table as data. Coordinates belong to each story's scene modules, never to the shared defaults.
- Keep cameras inside real walls or validated apertures (`staging.ts`).
