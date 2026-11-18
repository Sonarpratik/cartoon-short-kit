# CINEMATOGRAPHY: action shots, camera rigs, staging (CB 2026-11-09)

> **2026-11-09 pipeline audit.** This file is the rule book for ACTION beats (anything that flies, falls, races or crashes) and for the `blender_cine` rigs. The camera of the whole film (where it rests, how it travels, which word it lands on) is written once in `film.json` by the `camera-director` agent (`agents/camera-director.md`), proven before any render with `python tools/film_plan.py check`, and measured after render with `python tools/check_film.py`. Where this file and SKILL.md "THE PIPELINE" disagree, THE PIPELINE wins.

Part of the main skill. CB: "the cinematic shots like air plane make looping and camera catch it. like a cinematographer."
Measured, then turned into rules and Blender rigs. Package: `templates/blender_cine/cine.py`. Proof shot: `episodes/_test_cine_loop/`.
**Universal (CB 2026-11-09: "the skill need to apply for anything in scene thats can use cinematic action").** These rules apply to
every moving thing in every episode: vehicles, animals, people, thrown or falling objects, water, crowds. The plane loop is only
the test. Any animated object becomes a subject path with `cine.object_path(obj, f0, f1)`; section 4 says which shot to use.

## 1. What was measured (2026-11-09)
Instrument: `references/remeasure/cine_2026-11-09/scripts/cine_raw.py` + `cine_stats.py` (numbers only, nothing copied).
The motion.md camera fit plus a 6x8 block grid that sees the subject separately from the background. Validated on a synthetic
pan with a locked subject (grid reads 4.0 px around, 0.0 on the subject). px/f at 720x1280, 30 fps.

| Measure | Rick, 24 videos (median, range) | CB's example (61 s, action montage) |
|---|---|---|
| Hard cuts per 10 s | **0.4** (0-2.5) | 5.9 |
| Median shot length | **17.5 s** | 1.4 s |
| Hold (< 0.3 px/f) | 9.4 % | 16.5 % |
| Moving (>= 2 px/f) | **67.5 %** (42-94) | 42.8 % |
| Speed p90 | 23.3 px/f (10-34) | 12.1 |
| **Tracking** (subject held, world streams past) | **28 %** of frames (15-62) | 19.7 % |
| Subject crossing a held frame | 5.9 % | 15.1 % |
| Tracking bursts | 38 per minute, median 0.3 s, p90 0.9 s | |
| Shots with >= 3 deg roll (this reading includes parallax, so it is NOT a rule: see rule 7) | 86 % | 38 % |
| Shots that change scale >= 10 % | 100 % (long shots: median +100 %) | 27 % |
| Fast blurred moves (>= 40 px/f or smeared, >= 3 f) | ~4.8 per minute, ~8 f long (machine count; motion.md counted 0.45 true whips/min by eye, so most are fast reframes, not whips) | 0 (it cuts instead) |
| Shot starts / ends | enters moving (4.5 px/f), lands settled (1.4) | |
| Cuts made during motion | 100 % | 78 % |

**Reading:** Rick films one travelling camera that keeps re-catching moving things in short bursts, almost never cuts, rolls and
re-scales all the time. The example is an action montage: one idea per 1.4 s shot. **We take the example's action ideas and stage
them inside Rick-length moving takes.** That also matches CB's standing rule: fewer cuts.

### Action devices seen in CB's example (5 fps sheets; ideas only, never its shots)
- **Fly-through wipe** (0.0-0.5 s): the plane flies at the lens and fills the frame; the cut hides inside the pass.
- **Loop caught on a bright disc** (0.5-1.4 s): smoke trails draw the loop, the camera tilts and rolls with it, the move ends with
  the plane as a silhouette on the moon. The "catch" = the subject lands on the brightest shape in frame.
- **Orbit round a moving plane** (5.3-6.3 s): ~100 deg in 1 s, plane centred, roll -9 deg, ground streaming (88 % tracking).
- **Mounted cams**: over-the-tail looking down on the cockpit with the ground lights streaming (7.8-9.2 s), side two-shot on the
  wing (37-38.6 s), the camera rolls with the bank (-67 deg, 42.4-44.1 s).
- **Climb-out follow-away** (30.4-32.4 s): sky, the plane rises past the lens from below, the camera tilts after it until it is small
  under the moon; speed decays 12 -> 4 px/f.
- **Fly-by with kick** (37.6-37.9 s): an enemy streaks through the foreground with heavy smear; 2-3 f shake on the pass.
- **Locked frame, fast crosser** (54.7-55.3 s): a car blasts through with smear + speed lines (6 f) + a small shake.
- **POV inserts**: gunsight, speed gauge (the punchline lives in the insert).
- **Effects on the word**: explosion on "explode", flash frames on cuts, smoke puffs and rings on the engine-stop beat.

## 2. Shot vocabulary (rig in `cine.py` for each)
| Shot | What it does | Rig |
|---|---|---|
| Chase / tracking | rides beside or behind the subject, horizon level, world streams | `chase(P, offset, look_ahead)` |
| Mounted / POV | fixed to the vehicle, inherits pitch and bank: the world rolls | `mount(P, offset, look)` |
| Orbit | circles the moving subject (az/el eased) | `orbit(P, radius, az, el, f0, f1)` |
| Catch (operator) | camera stands or coasts, turns to keep the subject, leads it, lags a little | `catch(cam_pos, P, lead)` + `bake(aim_lag)` |
| Fly-by / pass | subject passes the lens 5-8 m away, kick on the closest frame, whip after it | `catch` at a point beside the path + `shake` |
| Follow-away | subject leaves; lens zooms 30 -> 50 so it shrinks slowly | `catch(..., lens=f)` |
| Push hold | dialogue / reaction beats between action | `static(push(...))` (motion.md 0.15-0.35 %/f) |
| Crane / reveal | rise from low to high over the place | `static(pos=f, aim=f)` with eased pos |
| Hand-off | one rig becomes the next with no cut | `Shot.add(f, rig, blend=14-30)` |

## 3. Rules (binding for every action beat)
1. **Long takes.** 3-4 shots per 30 s (CB). Inside one shot the camera changes rig 2-4 times through blended hand-offs (14-30 f,
   smootherstep). Cut only on a place or time jump, and hide it: a foreground wipe (subject fills the lens), a blurred whip (~8 f) or
   a flash on an impact word.
2. **Always moving.** >= 2/3 of frames moving, holds <= 10 % and every hold pushes in. Enter a shot moving, land it settled.
3. **Track ~30 % of frames.** Chase, orbit and mount keep the subject still while the world streams. The world must have texture and
   props near the path, or the streaming does not read.
4. **The catch.** When the subject leaves the rig (loop, jump, turn), the camera keeps its momentum, slows to a stop over 40-60 f,
   and turns with an aim lag of 0.08-0.15 s. Lead room is sideways on screen only and never more than 0.35 x the distance (a lead
   along the view line flips the camera at a fly-by). Land the apex on the brightest thing in frame (sun, moon, lit cloud).
5. **9:16 staging.** Move subjects toward/away from the lens or up/down. A left-right crosser leaves a vertical frame in about 0.5 s.
   Fly-bys pass above or below the lens, not beside it (the frame is only ~41 deg wide at 18 mm).
6. **Speed.** Ordinary moves p90 <= 25 px/f at 720p. Only fly-bys and whips go faster, <= 10 f, always with motion blur
   (`cine.motion_blur`, shutter 0.5).
7. **Roll and scale.** The camera is level while it rests. Roll only inside a travel, 4-6 deg, back to zero on landing (action rigs 6-17 deg; mounted cams inherit the bank). The earlier "every shot rolls >= 3 deg" reading counted parallax as roll and is retracted. Every action shot still changes scale >= 10 %
   (push, pull or lens). Chase keeps the horizon level.
8. **Effects on the beat.** Smoke trails start with the manoeuvre and fade from the tail ~40 f later; impacts land 0-3 f before the
   word; flash <= 2 f; smear/speed lines 4-6 f on a crosser; shake 7 f, sign flips every frame (motion.md).
9. **Characters ride along.** Character cards (the vector puppets on camera-facing planes) are parented to the vehicle (they loop and bank with it); in every action shot the face
   reads for at least one beat (mount or close chase), with an expression change on the punch word.
10. **One beat, one move.** Each action move answers one narration beat; the biggest moment (apex, pass, impact) lands on the punch word.

## 4. Any action, any subject: which shot to use
At the shot-plan step, scan the script for every beat where something moves fast, falls, flies, collides, races, jumps or
explodes. Each one gets a recipe from this table (or a mix). If nothing in a 30 s script moves, add one motivated mover per place
(a cart passing, a bird, a door swinging) so the camera has something to catch.

| Action in the story | Subject path | Camera recipe (rigs, in order, blended) |
|---|---|---|
| Vehicle: car, cart, train, boat, bike | `object_path` / `spline_path` | low `chase` beside the wheels (1-2 m up) -> `orbit` 60-120 deg to the front on the overtaking word -> `catch` at a bend as it passes the lens low |
| Flying: plane, bird, dragon, rocket, thrown spear | `loop_path` / `spline_path` / `ballistic_path` | `chase` -> camera runs on under the manoeuvre and `catch`es the apex against the sky or sun -> pass over or under the lens -> follow-away on a longer lens |
| Character or animal running | `object_path` of the card or rig | side `chase` at hip height with lead room -> on the stop the camera carries on 6-10 f and settles back (momentum) |
| Jump, fall, throw, launch | `ballistic_path` | `catch` from low at take-off, crane with the arc, apex on the punch word, follow it down, kick + dust on landing |
| Crash, impact, explosion | `object_path` of the projectile, or a point | slow `push` toward the impact point, contact 0-3 f before the word, kick 7 f scaled by size, flash <= 2 f, then a pull-out crane on the aftermath (-20 to -30 % scale) |
| Fight, duel, two characters clashing | `mix_path(A, B)` | `orbit` the midpoint 90-180 deg over the exchange, roll 4-8 deg on each hit, push in on the deciding blow |
| Pursuit: hunter and prey | `object_path` of both | `chase` the pursuer with the aim offset toward the prey -> hand off to a `catch` of the prey as it passes the lens |
| Crowd, army, stampede, flood | the mass as one path, or static | the crowd holds still and the camera supplies the motion: crane or truck over it (motion.md), one fast mover through the foreground |
| Big reveal: ship, building, monster | static | crane low -> high with a push; the subject fills >= 2/3 of the height at the end |
| Small object: coin, button, lever, pour | static | insert inside the take: push in on a 50-85 mm lens (f/2.8 allowed only here), then glide back out; never a cut to a separate insert |
| POV moments: cockpit, saddle, cart, gunsight | the vehicle's path | `mount` on the vehicle, the world rolls with it; overlays (gunsight, gauge) only with a story reason |

## 5. How to build an action shot
```python
from blender_cine import cine
P = cine.loop_path(entry, heading_deg, speed_m_per_f, radius, f_loop)      # or line_path / spline_path
cine.bake_subject(plane_root, P, f0, f1); cine.motion_blur(scene)
shot = cine.Shot(scene, cam, f0, f1)
shot.add(f0, cine.chase(P, offset=(4, -14, 2), look_ahead=10, lens=30))
shot.add(f_loop - 4, cine.catch(run_under, P, lead=.22, headroom=1, lens=24), blend=26)
shot.add(f_pass - 26, cine.catch(pass_point, P, lead=.32, lens=lambda f: 18 + 30 * cine.smooth((f - f_pass) / 34)), blend=20)
shot.shake(f_pass - 1, 1.6); shot.roll(f_loop, f_loop + 40, -6)
print(shot.bake(aim_lag=.08))       # prints rotation-speed peaks: check the fast frames are the pass, nothing else
```
Order inside the workflow (CB 2026-11-09): the camera plan (subject paths + rigs) is written at the shot plan. **Stage 1**
builds the whole scene in Python and polishes it to the round 2 toon look (ink, painted textures, real prop detail, grass, haze,
every density gate passing); the action shots are blocked there with these same rigs and shown to CB as a quick low-res animatic
(25 % size, 8 samples, ~1 s per frame) with the stills. Only after CB's check does **Stage 2** convert that same scene to Blender
materials and lighting; the baked cameras carry over unchanged. Then render and measure:
`python references/remeasure/cine_2026-11-09/scripts/cine_raw.py <outdir> film.mp4` then `cine_stats.py <outdir>/film.npz`.
The proof shot `episodes/_test_cine_loop/` is a camera test only: it went straight to the Stage 2 look to prove the rigs.
Hero models and props (CB 2026-11-09): CB has BlenderKit in Blender. Use it for the hero vehicle/creature and for props
whenever it gives a better or faster result than a hand-built model. Before rigging, check the asset: apply scale, put its
origin at the centre of mass with +Y forward and +Z up (the paths assume this), parent it under one empty and bake the path
onto that empty; keep moving parts (prop, wheels, rotor) as separate children so they can be keyed. Keep the poly count
reasonable for EEVEE and give it the locked look materials (`M.upgrade_principled`) so it matches the scene.

### Proof shot, measured with the same instrument (`out/measure/loop_catch_final_stats.json`)
One 7.3 s take, 1440x2560, EEVEE 64 samples, ~3.5 s per frame on the RTX 2070 Super (preview 720p/32 samples: 0.65 s).
| | ours | Rick median |
|---|---|---|
| cuts | 0 | 0.4 per 10 s |
| moving / hold | 85.4 % / 0.5 % | 67.5 % / 9.4 % |
| speed p90 | 21.8 px/f (peak 30.5 at the pass) | 23.3 |
| tracking | 51.6 % (in range, his max 62 %) | 28 % |
| roll / scale change | 15.6 deg / +68 % | action rig 6-17 deg inside the move / >= 10 % |
| enters / lands | 9.5 -> 1.1 px/f | 4.5 -> 1.4 |
Fixed on the way: the catch lead pointed past the lens at the fly-by (now sideways only, capped); the pilot card lost its seat
when parented (set the local offset with an identity parent inverse).

## 6. Camera flow in every scene (CB 2026-11-10)

CB after the baboon film: "the camera movements really depends on the scene and situation but we should make it more cinematic like his". So the scene picks the move, and the numbers are bands that warn, not laws. What was measured (same instrument, `references/remeasure/compare_2026-11-10/`):

| Film | Rests per 10 s | Long travels (p90), s | Frames pushing in | What the scenes are |
|---|---|---|---|---|
| Our baboon film | 4.1 | 2.0 | 32 % | one junction, talk and lever pulls |
| Railroads | 2.5 | 4.6 | 47 % | travel along a line, canyon, bridge |
| Roller Coasters | 2.7 | 4.7 | 51 % | rides, loops, fly-overs |
| Storm Oil | 2.0 | 3.5 | 42 % | ship, sea, storm |
| Drivers | 3.5 | 2.4 | 21 % | car interiors, locked dash-cam views |
| Pink Prison | 4.1 | 2.2 | 31 % | rooms, talk |

His talk films sit where ours sat; his travel films flow twice as long. Our film had trains, a trolley and a walk in it and still hopped, so it read as a slideshow of stations.

| The scene | The camera |
|---|---|
| Talk, a reaction, a joke on a face | Rest on the face with a slow push; short hops of 1-2 s between faces. |
| Something travels (train, cart, walker, letter, ball) | One move rides or follows it for 3-7 s and lands on a face or on the noun. No rest in the middle. |
| A place is introduced | Start on a detail and rise or pull back until the place towers over the character (or the reverse). The world leads the frame. |
| A mechanism is explained | Follow the force through the machine in one move (hand, lever, rod, signal). |
| Time passes | A dissolve with a double exposure, or the light changes in the shot. Not a flat card. |
| A big thing arrives | Low and close, the thing rises over the lens; the character is small at the bottom. |
| The payoff | Very close after a wide, or the object comes to the lens. |

In film.json: a flowing move is an explicit `travel` of 4-6 s on the landing station, or a chain of `hold: 0` stations with `via` points; `follow` trucks with a walker. Count the stations before writing them: about 3 rests per 10 s. Gates: plan rests 2.2-4.5 per 10 s and a longest travel of 3-7 s (`film_plan.py`); picture rests 2.2-3.8 and travel p90 2.1-6.3 s (`check_film.py`). A value outside the band is kept only with the scene's reason in CAMERA_NOTE.md.
