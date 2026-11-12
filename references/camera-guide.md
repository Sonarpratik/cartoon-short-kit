# Camera guide: when to move, how fast, and when to hold

This guide replaces the earlier mixed advice ("glide in every shot" and "symmetric ease-in-out" vs the measured reference). The measured reference rhythm in [STYLE_BIBLE.md](STYLE_BIBLE.md) wins: **mostly holds, with short ease-out bursts, slow creeps during holds, and continuous moves instead of hard cuts.**

## 1. Beat-by-beat grammar

Pick each shot's move from the story beat it illustrates. `CAMERA_PACE` in `templates/bridge/director.ts` holds the same table as data.

| Story beat | Move | Speed / easing | Duration |
|---|---|---|---|
| **Hook** (first 1–2 s) | Punch-in or whip onto the paradox (face + prop), then hold | Fast, `EASE.burst` | 6–10 frame move, then hold |
| **Setting** | Establishing glide or aerial descent that shows the world's geography and the set-piece | Slow, `EASE.inOut` | 2–4 s |
| **Escalation** | Short reframes between holds; low angles; dutch tilt (≤8°) on shocks and falls | Medium-fast, `EASE.burst` | 8–14 frame moves, 1–2 s holds |
| **Mystery** ("Wait…?") | Very slow push-in on one face | Creep, `EASE.creep` | 1.5–3 s |
| **Explanation** ("You see,") | Mostly holds with slow drift; insert close-ups of the mechanism | Slow, `EASE.inOut` | Long holds |
| **Payoff** (last line) | Snap zoom or impact kick, then a dead-still hold to the last word | Fastest, `EASE.burst` | 4–8 frame move, then hold |

Rules that apply to every beat:

- **About 80% of frames are holds** (under 0.5 px/frame of movement). A hold still gets a creep (`burstThenHold(..., creepTo)`) so the frame never looks frozen.
- **Burst moves front-load their speed.** Peak speed lands on the first frame of the move and decays over ~8–10 frames. Use `EASE.burst`, not the symmetric ease.
- Speed limits at 1080 px width: hold ≤0.5, slow ≤3, medium ≤12, fast ≤35, whip ≤80 px/frame (`CAMERA_SPEED_PX_PER_FRAME`).
- Slow down when the viewer must read something: a sign, a number, a face reacting. Speed up on surprises, impacts and changes of place.
- Never orbit or wobble every shot. No random shake; impact kicks are short and deterministic.

## 2. Transitions: travel instead of cuts

- Within one place, connect beats with continuous camera travel: reveal → reaction → hand/prop → consequence. A new sentence alone is not a reason to cut.
- Between places, prefer a motivated transition: follow a moving object (ball, bullet, stream) to the next subject, whip pan with motion blur, fly through a window or porthole, or a 6–8 frame crossfade.
- Hard cuts are rare (0–1 per short). Use one only for a deliberate jolt.
- Keep geography readable: show the door, road or window that explains travel, and keep set pieces fixed while the camera moves around them.

## 3. Angles: always on the faces

- Characters face the camera: front, three-quarter (25–45° preferred) or profile. **No back views and no over-the-shoulder shots** (see [character-design.md](character-design.md)). Place the camera in front of the action; when characters move away from where the story is going, lead them with the camera.
- Vary height across the short: low hero angles in escalation, eye level for dialogue, high or aerial for setting and scale.
- Mix shot sizes deliberately: wide (set-piece), medium (action), close (reaction), macro insert (prop detail). Avoid consecutive shots of the same size and angle.
- A foreground object passing the lens adds parallax to a slow move; keep it out of faces and hands.
- Front-on desk framing is not the default. Use it only for a reading or document insert.

## 4. Shared helpers (`templates/bridge/director.ts`)

```ts
import { cameraJourney, cameraSequence, burstThenHold, EASE, CAMERA_PACE } from './engine/director';

// Setting: slow multi-key establishing glide.
const establish = (u:number) => cameraJourney(u, [
  {at:0, position:[0,14,30], target:[0,2,0], fov:42},
  {at:1, position:[3,3,9],   target:[0,1.5,0], fov:38},
], EASE.inOut);

// Hook / payoff: 8-frame punch-in from frame 0, then a 60-frame creep.
const hook = (f:number) => burstThenHold(f, 0, 8,
  {position:[0,1.6,7], target:[0,1.5,0]},
  {position:[0,1.55,3.2], target:[0,1.5,0]},
  {position:[0,1.55,2.9], target:[0,1.5,0]});
```

- `cameraSequence(frame, keys)` places keys on exact frames, so one move can span several narrative beats without shifting cues. `cameraBoundary(a, b)` reports gaps at a same-location edit.
- Coordinates and beats belong to each story's scene modules, never to the shared defaults.
- Keep cameras inside real walls or validated apertures (`staging.ts`: `threeQuarterCamera`, `apertureCrossing`).

## 5. Review

- Review a short silent motion clip of each move, not just stills; check start, middle and end frames for blocked faces, clipped hats and hands, and focus.
- Check moving-camera frames for back views. The stills capture fails if a character is drawn past profile.
- When the user authorises a narration pause, insert silence at an existing phrase pause and update audio, word times, shot ranges, capture ranges and total duration together. Never add pauses without authorisation.

Private camera studies: `references/camera-study/` (roller-coaster reference: wide-to-character pushes, cross-loop pulls, foreground reveals) and `references/user-supplied/pirate-cannonballs/` (curved deck travel, high-to-low reveals). Study their speed and parallax; never copy their shots.
