# LOCOMOTION — what the engine can do, and where the run came from

Built 2026-11-05 on CB's "now movement walking running etc".
Catalogue composition: `src/videos/bridge/Moves.tsx` (Remotion id `Moves`).

---

## 1. What was already right, and what was missing

`bodySide`'s walk was **already correct** and already built to the measured spec in `motion.md` §3:
stance/swing split, a cycloid swing path so the foot leaves and lands at zero ground speed, hip height
solved from the planted foot (so the bob falls out of the mechanics instead of being a sine laid on
top), and the measured lean cycle — 1° at passing, 7° at contact.

**Three real gaps:**

1. **There was no RUN.** Not in `bodyFront`, not in `bodySide`, not anywhere. The mode list was
   march / stroll / stand / sit / fall / kneel.
2. `bodyFront`'s walk is a simple alternating foot lift — no stance/swing, no planting. Acceptable
   walking toward camera, where lateral skate is nearly invisible, but it is not the same machine.
3. Arm swing was gated on `mode === "march"`, so a running figure would have had one arm undrawn.

## 2. The run

**A run is not a fast walk — it is a different duty factor.** In a walk each foot is on the ground for
half the cycle or more, so one foot is always planted. In a run each foot is down for about 36 % of the
cycle, which leaves two windows per cycle where **neither foot is on the ground**. That flight phase is
what the eye reads as running. Implemented in `bodySide`:

| | walk | run |
|---|---|---|
| duty factor (foot planted) | 0.50 | **0.36** |
| stride | 1.07 head widths | 1.68 head widths |
| swing foot lift | 34 u | 64 u, arc peaking earlier (heel tucks toward the hip) |
| support-leg compression | 3.5 % | 8 % |
| lean | 4° ± 3° with the step | **10°** ± 3°, held into the travel |
| arm swing | ±30° | ±44° |
| airborne | never | a ballistic parabola across each flight window |

`bodyFront` run: bob 9 % peak-to-peak (walk 5 %, stroll 3 %), foot lift ×2.1, lateral sway ×1.6,
arm swing ×1.9.

## 3. Verified, not assumed

Rendered the catalogue, then measured the lowest figure pixel per frame against the ground line:

| gait | cycle | max foot lift off the ground |
|---|---|---|
| stroll | 26 f | 6 px |
| walk | 22 f | 6 px |
| march | 18 f | **0 px** |
| **run** | 14 f | **76 px** |
| **sprint** | 11 f | **79 px** |

A 12× separation between the walks and the runs. The walks keep a foot down; the runs leave the ground.

**One honest caveat on that measurement:** it also reports "43 % of the cycle airborne" for the run
where the design says 28 %. That figure is inflated — the measurement window clips the stance foot when
it is extended far behind the body on the long run stride, so some stance frames are counted as flight.
The lift column above is sound; the percentage is not, and is not quoted anywhere as a result.

## 4. Where the run is NOT measured off the reference — stated plainly

`motion.md` §3 measured his **walks** (v04 cowboy, v13 carriers, v03 kid) and nothing else. I also
harvested **2,275 full figures across all 22 episodes** (`body_harvest.py`, 3 fps, deduplicated;
sheets at `C:\remotion-tmp\bodies_out`) and read through them. **I did not find a running figure.**

So the run's mechanics come from real running, not from him. What comes from him is the *drawing*: thin
near-straight single-line legs, noodle arms ending in a dot, a narrow capsule torso, the head dominating
the silhouette. If a run turns up later in the corpus, this is the thing to re-measure first.

What the body harvest **did** confirm about his figures, consistent across sheets:
- legs are two very thin, nearly straight lines with no visible knee joint, even mid-stride
- standing feet sit essentially under the hips — never splayed
- arms hang as thin curves ending in a small dark dot
- the torso capsule is far narrower than the head

## 5. Gait rates (from `motion.md` §3, measured on him)

9–12 frames per step, i.e. 2.5–3.3 steps/s. Ours used to be 15 f per step — 25–65 % too slow.
The catalogue now runs walk 11 f, march 9 f, run 7 f, sprint 5.5 f per step. Drawing is on ones:
a moving character changes every frame, never held for 2s or 3s.


---

## 6. CB's corrections, 2026-11-05 — "he do small steps, also running dont spread legs too much"

Both were right. Measured off the render, in head widths:

| | before | now | stand, for scale |
|---|---|---|---|
| walk | 1.57 HW | **1.07 HW** | 0.36 HW |
| run | 2.37 HW | **1.68 HW** | |

The run also lost its athleticism: knee pitch 58° → 40°, lean 13° → 10°, support-leg compression
10.5% → 8%, swing lift 96 → 64, arm swing ±56° → ±44°. It still has its flight phase — that is what
makes it a run — but it no longer scissors.

**An error of mine, corrected here.** I first wrote in `toon.ts` that stride `S` was in `u` units, so
"240 u = 2.4 head widths". It is in canvas units, where one head width is ~236, so those were really
1.0 and 1.4 HW. I also measured his figures at a median 1.76 HW apart and nearly tuned to that number —
but the harvest crop is only 2.9 HW wide, so that distribution is censored at the top, and the
bottom-of-cell band picks up props and background edges as well as feet. **The stride numbers above are
set to CB's correction and to what the body sheets plainly show, not to that percentile.**

## 7. "Other movement also need to animate. Natural human"

Every pose and ride was a frozen photograph. Now:

- **`poseAt(name, t)`** in `toon.ts` turns each of the 12 named poses into an ACTION over a 0..1 cycle,
  blending the base `POSE_DEFS` entry toward one opposite key. The jump crouches, launches, flies and
  absorbs the landing; crawl and climb move their limbs in opposition; kick and throw wind up, **HOLD**,
  then go through — that held wind-up is measured on the reference in `motion.md` §3 (3 f to load,
  ~6 f held, a 1-frame strike) and it is what sells effort.
- **`gesture` on `FrontOpts`** drives the arm poses that are a movement rather than a position (wave,
  panic, cheer, scratch). This fixed a real bug: the ArmPose branch does `arms.length = 0`, so the older
  `wave` channel could never reach a posed arm — passing it did nothing at all.
- **`phase` on `ridePose`** turns the bicycle crank and travels the oar handle along its stroke. Because
  the legs and arms are IK'd to those points, the rider genuinely pedals and genuinely rows.
- **`breath` on `SideOpts`** so a side-view figure is not a photograph, and a standing figure sways
  about the ankles with the hold-then-shift law rather than a sine.

**Verified:** per-frame change measured inside every one of the 38 items. **Nothing is frozen.**
The near-still ones are the ones that should be — knockout 0.10, lie 0.13, sleep 0.17 (×10⁻³ per frame);
a sleeping body barely moves. Held arm poses sit at 0.26–0.32, gestures at 0.55–0.85, walks 8–11,
runs ~20.


## 8. CB 2026-11-05 — "natural more human, also the knee is curved not eckig"

**The knee was angular.** `legLine` filleted each joint with a radius of 14 against leg segments of
~150 units, so the knee read as a hard corner with a tiny chamfer on it. `smoothPath` clamps the radius
to 0.45 x the shorter adjacent segment, so the radius is now **70** — which means "as round as this
joint can be" at any scale: on a bent leg it becomes one long bow, on a near-straight leg the shallow
angle means it changes nothing. Arc segments raised 6 -> 10 so the curve itself is not faceted. The
ANKLE keeps a tighter radius (13), because a foot is a turn, not a bow.

**The arms were painted on the body.** The elbow sat at 1.12x the torso half-width, so the arm hugged
the capsule. In the reference the arm bows clearly OUTSIDE the body with daylight between the two, then
the hand comes back toward the hip. Elbow moved to 1.30x + 7u.

**The front-view swing leg flicked its heel backwards.** The knee control point only rose by 0.08 of the
lift, so the foot went up but the knee did not — which is not how a person walks toward you. Knee rise
is now 0.34 of the lift and the sideways bow dropped from 0.16 to 0.10, so the knee leads and the shin
hangs under it.

### A measurement error of mine, recorded so it is not repeated

I twice reported a gait as frozen by measuring "the lowest non-background pixel per frame". The
catalogue draws a **ground line spanning the full width**, so that measurement returns the ground line
every time and reads 0-1 px of movement no matter what the legs do. I claimed on that basis that the
front-view walk and run were static. **They were not** — looking at the frames showed a normal cycle.
Any future foot measurement must exclude the ground line's row explicitly (as `gaitcheck.py` does) or
track the figure's own pixels only.

## 9. CB 2026-11-05 — "the armelbow also curved" + seated behaviour

**The elbow was a corner.** `bodyFront` and `bodySide` already drew arms as a quadratic through the
elbow, but `bodyPose` — which draws every body pose AND every ride — used `p.stroke([s, e, h])`, a raw
3-point polyline. Hard corner at the elbow, while the legs beside it were filleted. Now filleted the
same way as the knee (radius 60, 10 segments).

**Seated behaviour.** Six new poses, because sitting is where a character's state shows most — the body
has nowhere to go, so the attitude has to carry it:

| pose | the shape | the tell (what MOVES) |
|---|---|---|
| `sit_nervous` | perched forward, knees together, hands clasped between them | the knee bounce — fast, small, never stops |
| `sit_afraid` | shrunk back into the seat, arms clamped across the chest, knees up | a held flinch that never finishes unclenching |
| `sit_rub` | elbows on knees, hands working together in front | the hands rub, fast and rhythmic |
| `sit_ready` | on the very edge, feet back under, weight forward | rocking, gathering to stand |
| `sit_slump` | poured in, legs stretched out, arm hanging | breathing, and a slow slide deeper |
| `sit_wait` | upright, hands on the lap | a weight shift every so often, nothing more |

**A geometry bug found and fixed.** The thigh and shin are each HALF the leg length, so a seated figure's
foot drops by `0.5L × (cos(thigh) + cos(shin))`. For the feet to reach the floor that must equal
`hipY × L` — which means a seated pose with a horizontal thigh (90°) and a vertical shin (0°) needs
**hipY = 0.50 exactly**. My first pass used 0.46–0.56 with tilted shins: some figures floated and the
slumped one's feet went through the ground. The catalogue's seat was also hard-coded at `sole − 250`
instead of being read from the actual leg length, so the stool floated behind the sitter.

**Still open, flagged not hidden:** at `sit_rub`'s extreme forward lean the torso overlaps the head and
slices its edge; `sit_slump`'s two legs overlap into one thick line; `panic` and `cheer` read very
similarly; and the `car` ride sits the rider's head oddly in the windscreen.

## 10. CB 2026-11-05 — "now sit from front also. leg spread to side, ad on move tap nervous with foot"

`bodyPose` is a profile rig, so the seated behaviours only existed in side view. Front-on sitting is a
different machine — `bodyFront` with mode `"sit"` — and it had ONE fixed posture for everybody: knees at
24u, feet at 27u, arms down the sides. Added `SitPose` and `tap` to `FrontOpts`.

**Knee spread is the whole tell front-on.** The torso half-width is only ~39u, so the old 24u knee sat
*inside* the body and no spread could read at all. The range now runs from well inside to well outside:

| | knee | foot | hands |
|---|---|---|---|
| afraid | 10u | 10u | wrapped across the chest |
| nervous | 14u | 15u | clasped down between the knees |
| wait | 40u | 44u | resting on the thighs |
| ready | 46u | **34u** — feet pulled BACK under the seat | braced on the knees |
| rub | 52u | 54u | together in the gap between the knees |
| slump | 68u | 80u | hanging outside the body |

**The foot tap** is the toe lifting while the heel stays planted — lifting the whole foot would read as
a kick. It runs on an 11-frame beat: **snaps up in 2 f, drops in 2 f, then waits.** Deliberately not a
sine; a tap is a beat, and a sine makes the foot look like it is swimming. This is the one place in the
whole catalogue where fast, hard motion is correct — everywhere else the law is slow and smooth.

**Still open:** `sit_rub`'s hands sit in the right place but read faintly against the torso;
`sit_ready` and `sit_wait` are close front-on; plus the four from §9.
