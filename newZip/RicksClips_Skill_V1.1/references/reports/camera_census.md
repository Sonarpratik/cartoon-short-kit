# CAMERA CENSUS — all 22 reference episodes

> **RE-MEASURED 2026-11-05** — see [`REMEASURE_2026-11-05.md`](REMEASURE_2026-11-05.md). **§3–§5 RETRACTED.** `cam_census2.py` was rebuilt from §2 (`references/remeasure/scripts/census_recon.py`) and reproduces this report exactly — and the cause of its 39 % hold is now measured: it correlates the whole frame without masking the burned-in caption, which pins the estimate to zero (masking the caption alone: hold 31→14 %, 51→16 %, 34→17 %), and it has no zoom term (zoom active in 84 % of his frames). motion.md §2.1 stands. Our film vs his on the validated estimator: hold **35 vs 9 %**, p90 **3.9 vs 24 px/f** (≈6x too slow, not 3x). §6 (stations, parks) is unaffected in method but its reference park/travel counts used the same estimator and should be re-run.
> The working folders this report cites (`references/motion/…` *(lost)*, `cam_census2.py`, `camera_census.json` method) **no longer exist**; every re-derived number, its script and its data are in `references/remeasure/`. Paths to the lost folders below are kept only as history.


Rebuilt 2026-11-05 after the first attempt came back unusable.
Script: `cam_census2.py`. Data: `camera_census.json`.

---

## 1. What was broken

v1 decided "moving" with `(mag > 0.55) | (abs(scale) > 0.006)`, where `scale` was the best of five
discrete picks (0.975, 0.99, 1.0, 1.01, 1.025). The scale estimator is noisy and almost never lands
exactly on 1.0, so the second clause was true on nearly every frame: **every episode reported
"100 % moving, 1 segment"**. The scale term is gone — dolly is reported separately and never decides
stillness.

v1 also searched integer pixel shifts on a 128-px-wide thumbnail. Its finest measurable motion was
1 px = **0.78 % of frame width per frame** — coarser than the thing it was trying to measure. It could
not have worked even with the threshold fixed.

## 2. What v2 does, and the proof it works

Phase correlation on a 256-wide thumbnail with a parabolic sub-pixel peak fit, at 15 fps, reported in
pixels at 1080-wide. Cuts (frame difference > 0.085) are detected and excluded rather than counted as
enormous moves.

**Verified against synthetic ground truth before any number was trusted** — a frame shifted by a known
amount with an FFT phase ramp, then measured:

| true shift | measured | error |
|---|---|---|
| 0.00 px | 0.000 | 0.000 |
| 0.50 px | 0.504 | +0.004 |
| 1.00 px | 1.000 | 0.000 |
| 4.00 px | 4.000 | 0.000 |
| 8.00 px | 7.999 | −0.001 |

(At 0.25 px the parabolic fit reads 0.143 — sub-pixel fitting is weakest below half a pixel. Everything
above that is exact.)

## 3. The result — 22 episodes

> **RETRACTED 2026-11-05.** The table below is what this estimator reads, but the estimator is locked by the unmasked burned-in caption and blind to zoom (see the box at the top and `REMEASURE_2026-11-05.md` §1). Do not build to it.

Bands as `motion.md` §2.1 defines them: hold < 0.3 px/f, drift 0.3–2, move ≥ 2.

| | hold % | drift % | move % | median px/f | p90 px/f | moves/10 s |
|---|---|---|---|---|---|---|
| **median over 22 episodes** | **39.1** | **30.6** | **26.4** | **0.46** | **12.1** | **5.3** |
| range (min–max) | 29–61 | 17–54 | 14–39 | 0.17–0.80 | 3.4–30.9 | 3.0–8.3 |
| `motion.md` §2.1 (20 vids) | 10.0 | 24.0 | 65.0 | 3.60 | 16.9 | 6.0 |
| **OURS — ep01_mixed** | **56.2** | **25.7** | **18.1** | **0.22** | **4.1** | — |

Busiest: *The Burglar Who Only Moved* (39 % move), *The Science Behind Slot Machines* (38.7 %, p90 30.9).
Stillest: *The Window That Breaks Japan* (16.5 % move) and *He Could Spot Winning Tickets* (14.4 %).

## 4. The disagreement with `motion.md` §2.1, stated plainly

> **Resolved 2026-11-05, in §2.1's favour.** The "could not audit it" below is no longer true: §2.1's method was re-run on all 22 videos and reproduces it (hold 9.3 %, move 67.5 %). The "higher tracker noise floor" read below was wrong; the census was the measurement with the bias.

The two measurements **agree about the moves** — moves per 10 s 5.3 vs 6.0, p90 speed 12.1 vs 16.9,
same order of magnitude. They **disagree entirely about what counts as still**: §2.1 says the reference
moves in 65 % of frames and holds in 10 %; this census says it holds in 39 % and genuinely moves in 26 %.

What I did to resolve it:

- **Tested the obvious explanation and ruled it out.** I suspected §2.1 came from an integer-pixel
  tracker whose quantisation noise inflated everything — its median of 3.6 px/f is suspiciously close to
  one pixel of a ~300-wide thumb. Re-running the same footage with integer rounding gives hold 88 %, not
  10 %. **Hypothesis wrong.**
- **Found a partial reconciliation on speed.** §2.1's 3.60 px/f median matches my 4.61 px/f median *if
  dead-still frames are excluded from the denominator* (and its p90 of 16.9 matches my 15.2 on the same
  basis). So its speed figures are probably medians over moving frames, not over all frames.
- **Could not audit it.** §2.1 cites `references/motion/scripts/` *(lost)*, `camstats.json` and `*_rob.npy`.
  **None of those exist on disk** — only the markdown survives. §2.1 cannot be re-derived or checked.

**My read:** the band percentages in §2.1 are inflated by a higher tracker noise floor pushing quiet
frames up into drift and move; its move-level statistics (moves per 10 s, peak speeds, attack/release
shape) are probably sound, since those agree with this census. Where the two conflict on stillness,
this one is the measurement whose estimator has been verified against ground truth.

## 5. What it means for us

> **Superseded 2026-11-05.** On the validated estimator we hold 35 % against his 9 % and our p90 is 3.9 against 24 px/f — about six times too slow, not three.

We have been building to "65 % of frames move". On this measurement **the reference is still in about
two frames out of five**, and our own film is stiller still:

- we hold **56 %** of frames against his 39 % — **17 points too static**
- we move in **18 %** against his 26 %
- our p90 move speed is **4.1 px/f against his 12.1** — when we do move, we move **three times too slowly**

This is the opposite of the error I reported earlier in the session. I measured our camera as "moving
96.7 % of frames", added `holdEase` to hold the camera still through the action — and overshot. The
grammar (move → hold → move) was right; the amount was not. The fix is not fewer holds but **faster,
more decisive moves between them**.

---

## 6. Continuous moves that carry from one object to another (CB, 2026-11-05)

**How our code handles it: it can't.** A beat in `Storyboard.tsx` is `cam: (w) => ({ pos, look })` —
**one** look target. A beat can push or track, but it always aims at a single point. To change subject
you must end the beat and dissolve or cut. A camera that leaves A, travels, and arrives on B inside one
uncut shot has no representation in the model.

**What happens in practice anyway.** Measured on the speed track — inside each uncut stretch, count the
PARKS (runs under 0.5 px/f lasting ≥ 0.4 s) and the real travels between them (≥ 2 px/f):

| | median uncut stretch | 2+ parks | a real travel between parks | longest chain |
|---|---|---|---|---|
| reference (8 episodes, 122 stretches) | **2.1 s** | 22 % | 17 % | 9 |
| ours (ep01_mixed, 7 stretches) | **4.7 s** | 57 % | 43 % | 6 |

So we already do park → travel → park *more often than he does* — but that is not authored
subject-to-subject movement. It is a long drifting beat that happens to pass things. **His travels
arrive on something and stop.** And his takes are less than half as long: his grammar is a short uncut
piece, usually about one thing, then a transition.

**Method caveat, stated rather than buried:** the cut detector (frame difference > 0.085) cannot tell a
hard cut from a fast whip, and almost certainly misses our own 8-frame cross-dissolves. So the *number*
of stretches is unreliable for both sides. The within-stretch structure — parks and travels — is the
part that holds.

**What it would take to do it properly:** a beat would need a LIST of look targets with dwell times
rather than one point, so a single shot can park on A, ease across, and arrive dead still on B. Plus
shorter takes.

### 6.1 Built — `aim.ts`, and what it cost to get the speed right

`src/videos/bridge/aim.ts` adds **stations**: a shot is a list of `{pos, look, dwell}` with a travel
time between them. `Beat` in `Storyboard.tsx` now takes `stations?: (w) => Station[]` and `travel?`,
and `Ep01Film`'s `poseAt` honours it — the run is scaled to fill the beat, so the authored
park/travel proportions survive whatever length the beat ends up being. A new `TRAVEL A-B-C` sample in
the camera study parks on three different objects inside one uncut shot.

Two details that decide whether it reads:
- the **park is held exactly** — `stationAt` returns the identical value every frame inside a dwell, so
  a still park is still, not nearly still. Measured: **0.00 px/f, max 0.00**. Our old beats drifted on
  arrival, which is why they read as wandering past things rather than arriving at them.
- the **arrival has zero velocity and zero acceleration** (smootherstep, not smoothstep), so the camera
  settles onto the subject rather than stopping at it. Measured deceleration into a park:
  27 · 27 · 23 · 22 · 17 · 17 · 13 · 9 · 9 · 4 · 4 · 4 · 0 · 0 …

**The speed took three passes, and the first was the old mistake again.** v1 swung the aim ~140° in 18
frames and peaked at **206 px/f** against his p90 of 12 — seventeen times too fast, exactly the "8x too
fast" error `motion.md` already caught us on once. The arithmetic that fixes it: at fov 42 on a
1080-wide frame **one degree of camera rotation is about 26 px**, so his measured move size of ~101 px
is **under four degrees of swing**. A travel between two subjects therefore has to be mostly camera
TRANSLATION with a small aim change, and it needs real time — 40 frames a leg.

| pass | aim spread | travel | peak px/f |
|---|---|---|---|
| v1 | ~140° | 18 f | **206** |
| v2 | ~45° | 40 f | 51 |
| v3 | ~22° | 40 f | **32 and 26** |

His move peaks: median 13.7, p75 24.6, p90 36. So v3 sits between his p75 and p90 — a strong move, but
inside his range.

**The lesson is in the numbers, not the code:** he reframes between NEIGHBOURS. He does not sweep the
room. A three-station travel costs about 5 seconds at his speeds, which is why only 17 % of his takes
contain one at all.
