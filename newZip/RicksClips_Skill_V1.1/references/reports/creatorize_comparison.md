# What the Creatorize engine does better than our skill

Read 2026-11-08 from `Documents\Creatorize Suite\projects\the-saddle-makers-two-needles`.
~10,200 lines of engine across 35 modules, with four API documents. It studies the **same reference
channel we do** — it cites his frame numbers directly ("his f420-431", "his f1369-77", "his cup
f828-845") — so this is a like-for-like comparison, not a different genre.

**The summary:** ours is a *drawing* engine plus a reference study. Theirs is an *animation system*.
We are competitive on how a character looks and on how well the reference is measured. We are far
behind on how a character is driven.

---

## 1. Animation is DATA, evaluated through a documented layer stack

Theirs: `evalPose(timeline, t, rest) -> Pose`. Pure, stateless, seekable anywhere, hashed noise,
compiled and cached at ~0.01 ms per frame. A timeline holds `base` tracks, `clips` (with `in`/`out`
blend frames, `hold`, `weight`, `mask`, additive channels, `'@'` = whatever is underneath),
`walk` paths, `face` keys, `say`, `blink`, `look`, `plants`, `sit_on`. The layer order is written
down: rest → base → face → walk root → clips in t0 order → walk legs/bob/arms → planted feet →
plants → look.

Ours: every composition hand-codes its own motion. `Faces.tsx`, `Moves.tsx` and `Reacts.tsx` each
define their own `held()`, `settle()`, `osc()`, `effort()`. There is no timeline, no clip, no
blending, no masking, no additive channel. `poseAt(name, t)` blends one base pose toward one key —
that is the whole system.

**This is the biggest gap and everything below follows from it.**

## 2. World-space constraints and IK

- `plants: [{ leg, t0, t1, at: [x,0,z] }]` — a foot pinned to a world point across a span.
- `armX.reach = { at: spot, w }` — the *drawn* hand pulled onto a world coordinate.
- `reachBend(rest, spot, root, side)` — solves the smallest torso bend that brings the shoulder
  within .85 armLen of a target, and prints `COMPOSE WARNING` when it is unreachable at 40°.
- `grab_collar` — a hand that finds another character's collar and **stays on it every frame** while
  that character turns, leans, steps or walks, via a pre-evaluated `_track` of the target's pose.

We have none of this. Our walk is mathematically planted, but nothing in our engine can touch,
hold, or reach a point in the world.

## 3. Props exist in the world and change hands

`props.<id>` flips between `{in:'world', at, rot}` and `{in:'hand:R'}` **on the contact frame**, with
grips, rotations, and `armEnds` bookkeeping so the giver's arm clip stops writing when the prop
leaves. `pick_up`, `put_down`, `eat`/`bite`, `sign`, `raise_prop`, a cane whose tip stays planted
between steps.

Ours draws props attached to a character. No world placement, no transfer, no contact frame.

## 4. Real lip sync, not a mouth flap

`say: [{ t0, words: [{ word, start, end }] }]` → nine visemes (`v_rest v_M v_E v_A v_O v_F v_L`),
2-frame lead, ~2.3 f per shape, vowel holds ≤ 5 f and consonants ≤ 3 f, the longest O promoted to
his big `o`, every second short closing drawn as his slanted line. It also returns `stress` — the
phrase's longest word — which drives a single brow raise.

Ours: `talkMouthK(open)` picks between three shapes from an amplitude number.

## 5. A deterministic face-rhythm limiter

This is the one that should sting. `compose.js faceLimiter` re-times the **combined** face once per
compiled timeline, forward over the frame grid: eyes hold ≥ 8 f, brows ≥ 8 f, mouth ≥ 6 f outside
speech; blinks and ≤ 2 f squints pass as in-betweens without resetting the clock; brows are LOCKED
during a character's own line except one raise on the stressed word; a closed-eye smile inside
dialogue is an accent that decays after 8 f.

That is the automated, tested version of the law I spent this session deriving by hand and then
enforcing with a hard-coded `HOLD = 34`. They made it a rule with a switch (`faceLimit: false`) and
a before/after trace tool.

## 6. Height, gravity and place

`height` keys with `over`/`ease`, `fall` under gravity (g = 20 D/s²) with knee-bend landings, jumps
with anticipation and apex, `legs: 'float' | 'tread' | 'hang' | 'climb' | 'stand'`, floor levels that
move when he stands somewhere, `place` keys that snap position and facing on one frame and correctly
end earlier clips' roots.

Ours has `fall` as a static pose.

## 7. Regression safety we do not have at all

- `node lab/eng10/same.mjs` — **every film's poses compared frame by frame, old vs new**, with the
  diffs named ("only blind6/bea differs: hips .003 D onto the seat").
- Per-change test suites: `lab/eng5/test.mjs`, `lab/eng7/`, `lab/eng8/`, `lab/fx1/`, `lab/motion/`.
- Contact sheets and before/after strips per clip and per walk.
- `tools/checks.py` over rendered frames: `same`, `calm`, `flicker`, `face`.

Ours is not under version control, and every measurement I ran this session was a throwaway script.

## 8. Typed, validated wardrobe

Layered garments (`shirt jumper vest jacket coat apron tie bowtie scarf belt`) with checked colour
keys: `"buckle": true` prints one warning line and falls back instead of silently painting the whole
torso in ink. `node lab/fx2/validate_specs.mjs` checks specs without rendering.

Our `Outfit` is a flat bag of optional strings. A wrong value draws something wrong in silence —
exactly the class of bug that produced the blank white hat card and the armpit stubs.

---

## Where WE are ahead

Not many places, but real ones:

- **Measurement depth.** 1,445 harvested faces, 2,275 harvested bodies, and a camera census over all
  22 episodes. They cite individual frames; we have distributions.
- **Verified instruments.** Our camera census validates its estimator against synthetic ground truth
  (0.5 px reads 0.504) before producing a number, and we caught a published spec (`motion.md` §2.1)
  being wrong because of it. Their `lessons/camera.md` is qualitative craft notes, not measurement.
- **Camera census and stride measured in head widths** — I see no equivalent on their side;
  `camera_moves.js` is 110 lines.

## What to take first, in order

1. **The timeline/clip model.** Replace per-composition hand-coded motion with
   `evalPose(timeline, t, rest)`. Everything else depends on it.
2. **The face-rhythm limiter.** We already know the law; make it a function with a switch and a test
   instead of a hand-tuned constant.
3. **`same.mjs`-style regression checking.** Compare every rendered frame before and after a change.
   Cheap to build, and it would have caught three of my mistakes this session.
4. **Visemes from word timings.** We already produce word times for the voice track.
5. **World props with a contact frame**, then reach/plants.

---

# PORTED — `anim.ts`, 2026-11-08

CB: "Port it." Item 1 and item 2 of the take-first list are in.

## What was built

| file | what |
|---|---|
| `rick-shorts/src/videos/bridge/anim.ts` | the system: `Pose`, channels, clips, `evalPose`, the face limiter, adapters |
| `rick-shorts/src/videos/bridge/timelines.ts` | performances as DATA — no React, no canvas, no engine |
| `rick-shorts/src/videos/bridge/TimelineDemo.tsx` | the `Anim` composition: a character driven only by a timeline |
| `rick-shorts/src/videos/bridge/animcheck.ts` | 8 contract checks |

**This is a port of the ARCHITECTURE, not of their rig.** Their channels (`body.bend`, `armR.hand` as
a 3-vector, shoulder sockets) belong to a 3D skeleton; ours is a 2D drawing engine whose parameters are
`FrontOpts` and `PoseDef`. The channel set is ours. The stack, the blending rules and the
snap-never-tween law for drawings are theirs.

## The one call

`evalPose(timeline, f) -> Pose`, then `toFront(pose)` or `toPose(pose)` hands it to our two rigs.
Layer order: **rest → base tracks → face keys → clips in t0 order → blink → face limiter.**

A timeline holds `base` tracks (constant or keyed with easing), `clips` (with `in`/`out` blend frames,
`hold`, `dur`, `mask`, `weight`), `face` keys, `blink` and `faceLimit`. Numbers blend; strings snap.
A channel name ending in `+` is additive, so a shake can ride a held prop without ending the hold.
A clip with no `out` holds its end pose forever — dead still, the identical value every frame.

## Verified, not asserted — `node C:/remotion-tmp/animcheck.cjs`

```
OK  pure: frame 137 identical after seeking all over
OK  seek: forwards and backwards agree on every frame
OK  limiter: shortest expression run 9 f (minimum 8)
OK  limiter: raw 8 swaps -> limited 8
OK  hold: body.tilt identical at f500 and f505 (2.199914)
OK  speed: 0.0040 ms per frame
OK  limiter bites: flicker 11 swaps -> 3
OK  limiter bites: shortest run 9 f (raw was 3 f)
```

Checks 7 and 8 exist because check 4 proves nothing on its own: the demo timeline's keys are already
well spaced, so the limiter changes nothing there. The adversarial case — 12 expression swaps three
frames apart — is what shows it working.

## Two mistakes made and fixed during the port

1. **The limiter was O(n²).** The first version rescanned from frame 0 on every frame, which made a
   520-frame render crawl and threw away the one property that makes this architecture worth having —
   that a pose is cheap and seekable. It now compiles once per timeline into a cached array:
   **0.0040 ms per frame**, and seeking backwards is free.
2. **The timeline lived inside the React component.** A timeline you can only evaluate inside a render
   is not data — it cannot be tested, diffed or reused, which is the whole point. Moved to
   `timelines.ts`, which imports nothing but a type. That is also what let the checks run at all.

Also, `Anim.tsx` had to become `TimelineDemo.tsx`: Windows treats it as the same filename as `anim.ts`.

## Not done

- The clip library is a **starter set** (`react`, `burn`, `drift`, `gesture`, `travel`, `sit`,
  `blink`). Their library is far larger (`pick_up`, `put_down`, `eat`, `sign`, `glasses_*`,
  `grab_collar`, `raise_prop`, `shake`, `sit_on`…).
- No world-space IK, no props that change hands, no visemes, no height/gravity — items 4 and 5 on the
  take-first list.
- The existing catalogues (`Faces`, `Moves`, `Reacts`) still use their own hand-coded motion. They
  work, so I left them; porting them onto the timeline is the natural next step.
- `src/videos/onoda/Bridge.tsx` has 6 pre-existing TypeScript errors (`EffectComposer` children typed
  as non-null). **Not mine, not touched.**

---

# CATALOGUES PORTED — 2026-11-08

All three catalogues now run on the timeline system. The motion helpers they had each grown
separately — five copies of `held()`, three of `settle()`, three blink shapes, two gaze models — are
one implementation in `anim.ts`.

| file | was | now |
|---|---|---|
| `faces_data.ts` | — | 49 expressions + ONE timeline that plays them all |
| `Faces.tsx` | own `held` `gazeAt` `weightAt` `settle` + blink | `evalPoseLimited(TL, f)` |
| `reacts_beats.ts` | — | the 12 beats + `beatTimeline(beat, index)` |
| `Reacts.tsx` | own `settle` `sm` + expression-track walk | `evalPose(TIMELINES[i], into)` |
| `moves_data.ts` | — | the 44 items + `itemTimeline(item)` |
| `Moves.tsx` | 5 inline sine expressions | channels from the timeline |

New clips carrying the laws: `idle` (hold → drift 26 f → hold, no sine), `gaze` (saccades),
`weight` (a step, not a wave), `breathe` (the one continuous channel, because it is non-rotational),
`bodypose` (a named pose played as an action into the `pose.*` channels).

**RIDES are deliberately not ported.** `ridePose` is a third rig that takes a vehicle name and a crank
phase rather than a Pose; forcing it through the channel set would be worse than leaving it honest.

## Verified — `node C:/remotion-tmp/catcheck.cjs`

```
OK  Faces: all 49 expressions on screen in their own slot (0 wrong)
OK  Faces: the idle law — head dead still on 57% of frames (a sine gives 0%)
OK  Faces: a SNAP throws the head 3.03 deg (an ARC must not)
OK  Reacts: all 12 beats land 0-3 f before the word (0 out of law)
OK  Reacts: leads spread across 4 distinct values 0/1/2/3
OK  Reacts: the 3 no-impact beats carry no head impulse (0 leaked one)
OK  Reacts: "DOUBLE TAKE" throws the head 7.00 deg
OK  Moves: all 50 items move between f5 and f25 (0 frozen)
OK  Moves: all 7 gait items advance their walk phase
```

## The regression check that earned its keep

Every frame compared before and after the port, then the motion laws re-measured end to end:

| | mid-hold still | idle motion | swap/idle | frozen frames |
|---|---|---|---|---|
| Faces pre-port | 58 % | 1.455e-3 | 5.7x | 0 |
| **Faces ported** | 53 % | **1.091e-3** | **7.6x** | 0 |
| Reacts pre-port | 60 % | 2.501e-3 | 0.7x | 0 |
| Reacts first port | 60 % | — | — | **11** ← caught here |
| **Reacts ported** | 62 % | 3.286e-3 | 0.5x | **0** |

**It caught a real regression.** The first port gave each beat its own breath track peaking at the
beat's midpoint — where a smootherstep has ZERO derivative, so 11 frames were completely frozen. The
pre-port version never had this because its breath sine ran on the GLOBAL frame and was never at a
turning point in the same place twice. Fixed by giving the `breathe` clip a negative `t0` of
`index x HOLD`, which makes its local frame the global frame: the breath now runs continuously across
the whole catalogue, as it used to, and the system expresses that rather than a special case.

Pixel-identical frames after the port: Faces 0 %, Reacts 0 %, Moves 34.5 % (the unported rides). The
motion is generated differently, so the picture moved; what had to survive — every expression in its
slot, the 0-3 f timing law, the no-impact beats staying impact-free, every gait cycling — did, and is
now checked by a test rather than by me looking at it.
