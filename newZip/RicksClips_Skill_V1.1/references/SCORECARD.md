# Episode scorecard — the quality bar (locked 2026-11-04; raised to 10/10 by CB the same day)

Every episode is scored in these 8 categories before any full render. **Pass = all categories 10/10: every measured
number inside the ranges below (centre of range, not edge), AND a fresh verifier judges the side-by-side
indistinguishable from the reference in that category.** 1:1 applies to the measurable style only — story,
characters, props and shot layout are always ours (see Non-negotiables). The verifier's opinion breaks ties; the numbers decide. Sources: references/reports/*.md (measured from 20 reference shorts, 32,337 frames). Bridge-short final scores shown as the baseline to beat.

Measure our frames with `tools/measure/` (same methods as the reports; see each tool's header).

| # | Category | Bridge | Pass range (measured on our stills at output scale) | Measured by |
|---|---|---|---|---|
| 1 | Colour (day) | 7 | median Y' 0.52–0.62; non-ink p5 ≥ 0.20; p99 ≥ 0.92; lit C* p90 45–65; black point warm (R>B); corner/centre 0.82–0.92 | grade_metrics.py |
| 2 | Colour (golden) | 5–6 | median Y' 0.46–0.57; shadows violet (dark-zone b* < 0, never brown); horizon ≈ #ffd08a; HSV S p50 ≤ 0.55 | grade_metrics.py |
| 2n | Colour (NIGHT) — added 2026-11-05 for Night Witches | — | measured on 299 reference night frames / 13 episodes (episodes/night-witches/night_target.json, grade_metrics.py): median Y' p50 0.16–0.22 (median 0.19); Y mean ~0.25; p99 0.74–0.93; HSV sat mean 0.50–0.66; lit C* p90 52–68; dark b* < -18 (blue-violet, median -24); corner/centre 0.26–0.64 (light-pool vignette); non-ink p5 ~0.07 (the day crush rule does not apply at night) | grade_metrics.py |
| 3 | Lighting | 5–6 | same-surface shade/lit Y 0.44–0.57 (day); heads V ≥ 0.86 in EVERY light, side gradient 0.05–0.36 toward key; golden backlit (sun az ≤ 40° from view axis) | grade_metrics.py + story.ts audit |
| 4 | Ink | 6 | ≥ 60 % of strong geometry edges carry a line (ref 45 % frame-wide incl. soft edges; ref scans: 74 % of clean edges); world line EW 2.5–4.5 px @1080, core luma ≤ 40; NO line on wall/floor joins or horizon; characters NOINK (plum ink only) | ink_scan.py |
| 5 | Textures | 5–6 | lit surfaces L* 60–82 (never < 19); painted seams FWHM 3–5 px @1080 with ≤ 2.5 px edge ramps; sky C* ≥ 40 day; clouds ≥ 3 tones | grade_metrics.py + ink_scan.py line mode |
| 6 | Characters | 7 | head H/W 0.88–1.01 with chin taper + ~10 % asymmetry; body 3.3–3.7 head-heights; face luma ≥ 0.85; eye spacing ~0.26 W; blink gaps 0.5–2.3 s, 4-frame shape; no blush, no catchlights | head_fit.py + toon.ts audit |
| 7 | Depth | 6–7 | DOF on 25–40 % of screen time; when on, bg blur R 8–16 px @1080 (CU/MS), establishing shots sharp; aerial: far objects ≥ 30 % closer to horizon colour than near; sky horizon/top luminance 1.2–1.4 | blur_fit.py + grade_metrics.py |
| 8 | Composition/camera | 6–7 | **v2 targets (motion_v2.md + bar.md, 21 videos):** moving ≥ 90 % of frames (≥ 2 px/f in ~70 %); ~12 transitions/min, **95 % dissolves of 8 f (6–9), ≤ 1 hard cut/min**, shot median ~3.5 s; both shots MOVING through every dissolve; glides ~5/10 s, 10 f in / 11 f out, bigger moves FASTER not longer (peak p50 ~23 px/f combined, fly-throughs ≥ 45 px/f ≤ 4/min); holds creep 0.2–0.3 %/f (84 % push-in); rolls ~4/10 s, 2° typical, in-shot tilt up to 7° (19° showpiece); **move peaks + dissolve midpoints land 0–3 f before a word onset**; kicks ±2 px alternating, gone 4–7 f; HF ≤ 0.2 px. Angle mix (bar): ~60 % ground-level wide (20–24 mm, VP 0.3–0.45 H), ~15 % aerial, ~15 % eye, ~10 % macro; dutch 5–20° on character shots; very-near FG in ~half of moving frames | cam_track.py + motion_v2 |

## Scoring procedure (per round)
1. Render 6 stills minimum: 2 day (1 wide, 1 MS), 2 golden (1 backlit wide, 1 CU), 2 inserts/CU with DOF. Plus the 60 s camera path if composition is being scored.
2. Run the tools; paste their JSON next to the side-by-side sheets (`sbs_sheet.py`).
3. Fresh verifier agent scores /10 per category with a frame-numbered fix list; it sees the tool numbers first, the images second.
4. A category passes only on BOTH: verifier ≥ 8 and numbers in range. Log every round in the episode's PRODUCTION notes.

## Non-negotiables (instant fail regardless of scores)
- Pure-black crush: non-ink p5 < 0.15 on day frames.
- Brown golden shadows.
- A camera move > 60 px/f @720p without motion blur.
- Character card outlined by the world ink (double outline).
- Static hold ≥ 12 f (reads as a freeze in QA).
- Any trace of the reference channel's characters, props, stories or shots.
