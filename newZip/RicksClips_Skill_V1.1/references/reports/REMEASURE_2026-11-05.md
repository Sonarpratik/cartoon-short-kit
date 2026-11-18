# RE-MEASURE 2026-11-05: the eight specs, re-derived from what is on disk

HANDOFF §4 item 1. The eight measured reports (`characters`, `depth`, `outlines`, `lighting`, `grade`, `textures`,
`motion`, `camera_census`) cited working folders that no longer exist (`references/characters/`, `…/depth/`,
`…/outlines/`, `…/lighting/`, `…/grade/`, `…/textures/`, `…/motion/`, and `cam_census2.py`). Everything below was
re-measured from the material that survived: **`references/frames/` (21 episode folders, 3,864 frames)** and
**`references/video references/` (22 videos, 1,247 s)**, plus our own `rick-shorts/out/ep01/ep01_mixed.mp4`.

**Everything new lives in one folder that exists: `references/remeasure/`**
- `scripts/` — every script used (listed per section below), each with its method in its docstring
- `data/` — every raw and summary output (JSON / NPZ)
- `out/` — review sheets (`heads_sheet_*.jpg`, `label_check.jpg`) and synthetic calibration images (`calib/`)

The reports as they were before this pass are kept in `references/reports/_backup_2026-11-05_pre-remeasure/`.
Nothing was rendered, nothing in `rick-shorts` or `templates` was changed, nothing was uploaded.

**Rule followed throughout (HANDOFF §6): verify the instrument before trusting the reading.** Every tool below was run on
synthetic ground truth first. One tool failed its check (multi-scale DOF) and was not used; that is recorded in 5.

---

## 0. The answer in one table

| Spec | Old claim | Re-measured | Verdict |
|---|---|---|---|
| **Camera bands (motion.md §2.1)** | hold 10 %, drift 24 %, move 65 % | **hold 9.3 %, drift 22.5 %, move 67.5 %** (22 videos) | **§2.1 CONFIRMED** |
| Camera bands (camera_census.md §3) | hold 39 %, move 26 % | the census estimator was locked by the **burned-in caption** | **census §3-§5 WRONG** — retracted |
| Moves per 10 s | 6.0 | 6.8 | confirmed |
| Our film vs his, same estimator | census: hold 56 vs 39, p90 4.1 vs 12.1 ("3x too slow") | **hold 35 vs 9, move 26 vs 68, p90 3.9 vs 24 px/f — about 6x too slow** | gap is **twice as big** as reported |
| Quiet-frame push-in rate | 0.14 %/f | estimator reads true zoom at **68 %** → true rate ≈ **0.2 %/f** | §2.1 is an under-read |
| **Ink colour** (open item 3) | characters.md #241726 vs toon.ts #322228 | character outline core **#231218** (IQR (24,9,13)–(54,36,40)), 651 heads | **#231218; toon.ts #322228 is too light** |
| **Eye spacing** (open item 4) | 0.26 W (code 0.286) | **0.265 W** (IQR 0.235–0.281, n 296) | 0.26 confirmed; code too wide |
| Face fill luma | 0.93 | **0.955** (IQR 0.895–0.976) | confirmed |
| Head side gradient \|lr\| | 0.14 | **0.055**; top brighter tb −0.05 | report over-states the side gradient ~2.5x |
| Head H/W | 0.93 (bare-head fits) | visible face fill **0.76** (hair/hats included) | not comparable; 0.93 unconfirmed |
| Outline width | 5.0 % W | **6.9 % W** (IQR 5.1–8.2) | a bit thicker than spec |
| Grade, all frames | Y′p50 .449, sat .465, lit C* p50 31.9 | **.451, .463, 31.9** | **confirmed to the third decimal** |
| Grade, day sky | upper #5e93d9, low/upper 1.28 | **#5b96d3, 1.24** | confirmed |
| Black point (all) | (25,13,22) | **(28,13,20)** | confirmed |
| Vignette corner/centre (all) | 0.719 | **0.702** | confirmed |
| Edge-ink coverage | 45.1 % | **40.6 %** all, **44.3 %** day | confirmed |
| DOF: above-head blur median | 0.57 | **0.59** | confirmed |
| DOF: share of frames blurred | 27 % > 1.0 | **7 %** > 1.0 (lower bound, see 5) | **not reproduced** — treat "DOF on ~1/3 of shots" as unconfirmed |
| Torso width, body HH, shadow ratios, texture patches, step/blink timing | various | — | **not re-derived** (needed hand crops / hand labels; see 9) |

---

## 1. Camera — motion.md §2.1 vs camera_census.md (the main question)

Scripts: `cam_raw.py` (per-frame fit, same estimator as `tools/measure/cam_track.py`), `cam_bands.py` (statistics under
three definitions, plus `--validate`), `census_recon.py` (the lost census estimator rebuilt from its own description).
Data: `data/cam_raw/*.npz` (22 videos), `data/cam_raw_ours/ep01_mixed.npz`, `data/cam_bands.json`,
`data/cam_bands_ours.json`, `data/cam_validate.json`, `data/census_recon.json`, `data/census_caption_test.json`.

### 1.1 Instrument check (synthetic, through the same code)

| case | measured, motion.md definition (A) | translation only (B) |
|---|---|---|
| static frame + noise | 0.018 px/f → hold | 0.013 → hold |
| static + a character moving inside one tile | 0.020 → hold (outlier tile rejected) | 0.012 → hold |
| pan 1.0 px/f @720 | 0.996 → drift | 0.995 |
| pan 4.0 px/f @720 | 3.97 → move | 3.97 |
| push-in 0.14 %/f | zoom reads **0.095 %/f**; speed 0.71 → **drift** | 0.05 → **hold** |
| push-in 0.05 %/f | zoom reads 0.028 %/f; 0.22 → hold | hold |

Translation is exact. **Zoom is under-read to about 2/3** (tile phase correlation sees a zoom as small opposing shifts).
So every zoom rate in motion.md §2.1 is low by roughly a third.

### 1.2 Result, 22 reference videos (median over videos)

| definition | hold | drift | move | median px/f | p90 | moves / 10 s | peak median |
|---|---|---|---|---|---|---|---|
| **A** motion.md (translation + zoom×734, 720 px, 30 fps) | **9.3** (1.2–25.3) | 22.5 | **67.5** (42–95) | 4.1 | 24.1 | **6.8** | 20.4 |
| B translation only | 18.0 | 32.0 | 51.2 | 2.1 | 12.5 | 5.0 | 13.3 |
| C translation only, 1080 px, 15 fps step | 7.7 | 19.4 | 73.2 | 6.3 | 38.4 | — | — |
| motion.md §2.1 as written | 10 (1–27) | 24 | 65 (34–94) | 3.6 | 16.9 | 6.0 | 13.7 |
| camera_census.md §3 as written | 39.1 | 30.6 | 26.4 | 0.46 | 12.1 | 5.3 | — |
| **census estimator rebuilt** (`census_recon.py`) | **39.2** | **30.7** | **26.4** | **0.46** | **12.2** | | |

The rebuilt census reproduces the census exactly (and our film exactly: 56.2 / 25.7 / 18.1, p90 4.05). So the census is
now auditable — and wrong. Two faults, both measured:

1. **The burned-in caption.** The census correlates the whole frame and does not mask the caption band. The caption
   is a large, high-contrast, screen-fixed object, so it drags the estimate toward zero motion. Masking only the caption
   band, same estimator: Slot Machines hold 31 → **14 %**, Second Draw 51 → **16 %**, Winning Tickets 34 → **17 %**
   (`census_caption_test.json`). This is most of the gap.
2. **No zoom term.** Zoom is active (≥ 0.05 %/f, either direction) in **84 %** of his frames (median over videos). A whole-frame translation estimator
   cannot see a push-in at all.

Our film has no captions, which is why the census measured *us* correctly-ish while measuring *him* wrongly — and why
the census made the gap look smaller than it is.

### 1.3 Our film against his, same estimator (definition A)

| | his (22 videos) | ours (ep01_mixed) | gap |
|---|---|---|---|
| hold | 9.3 % | **35.4 %** | 26 points too still |
| move | 67.5 % | **25.9 %** | |
| p90 speed | 24.1 px/f | **3.9** | **~6x too slow** |
| moves per 10 s | 6.8 | 2.5 | under half |
| zoom active | 84 % of frames | 55 % | |

HANDOFF item 2 ("hold 56 vs 39, p90 4.1 vs 12.1, three times too slow") should be read as **hold 35 vs 9, p90 3.9 vs 24**.
The direction of the fix is unchanged (more, faster, decisive moves between parks); the size of it doubles.

### 1.4 What in motion.md §2.1 stands

- Bands, speeds, moves/10 s: **confirmed** (definition A).
- "Move peak 13.7 px/f" matches the **translation-only** peak (13.3); with the zoom term peaks are 20.4. Keep 13.7
  for translation and note the definition.
- Quiet-frame zoom "0.14 %/f median": an under-read; the true rate is about **0.2 %/f**.
- p90 under definition A is 24 (range 12–34) against the written 16.9 (9.7–29.4): the written p90 is low, probably
  measured before smoothing settled or on a subset. Use 24 for A, 12.5 for translation only.
- Character-animation rows (§3: step 9–12 f, bob 3–7 %, blinks, reaction lead): **not re-measured** (needed tracking by hand).

---

## 2. Ink colour and the character heads (characters.md §1.1–1.4, lighting.md §5, open items 3 and 4)

Scripts: `heads.py` (harvest), `head_sheets.py` (numbered review sheets), `heads_clean.py` (rejects, tracks, summary),
`heads_calibrate.py` (synthetic check). Data: `data/heads.json` (2,458 detections), `data/heads_clean.json` (1,523),
`data/head_tracks.json` (**651 tracks from 20 episodes** — consecutive frames of one character count once),
`data/heads_summary.txt`, `data/heads_calibrate.json`. Review: `out/heads_sheet_00…22.jpg`.

**Line-pixel detector.** The failed attempt sampled the darkest 0.4 % of the frame and got letterboxing. This one
casts 72 rays outward from each head's centre and keeps only rays where a **thin** dark run (Y < 0.40, at most 0.20 W
long) starts right at the face edge — a dark mass (hair, hat, shadow) is rejected. Ink = darkest pixel on each run,
median over rays. Width = run length.

**Instrument check:** synthetic heads (W 90/160/300 px, outline 4/5/7 % W, ink #231426, H/W 0.93, eyes 0.26 W),
anti-aliased: read back H/W 0.925–0.933, outline within 0.002 W, ink (34–36, 19–21, 37–40), eyes 0.259–0.260. Exact.
**Review by eye:** sheets 00 and 11 (160 crops) were ~92 % real heads; the false hits (paper, shield face, a target ring)
are rejected by id and by rule.

| measure | spec | re-measured (median over 651 tracks, IQR) | |
|---|---|---|---|
| **ink core** | #241726 (characters.md) / #322228 (toon.ts) | **#231218** — (35,18,24), IQR (24,9,13)–(54,36,40); bright-lit heads #221318; big heads #24131a | **use #231218** |
| eye spacing | 0.26 W (code 0.286) | **0.265** (0.235–0.281, n 296) | 0.26 stands |
| eye height | 0.00 from centre | −0.10 W (above centre) | eyes sit higher than spec |
| eye-pair shift to facing side | +0.08 W | +0.008 (−0.03…+0.05) | report's +0.08 not found on the average head |
| outline width | 5.0 % W | **6.9 %** (5.1–8.2) | slightly thicker |
| thick/thin p90/p10 | 2.9–3.5 | 5.0 (hair-adjacent rays inflate p90) | direction not trustworthy here |
| fill luma | 0.93 | **0.955** (0.895–0.976); fill (252,242,241) | confirmed |
| side gradient \|lr\| | 0.14 | **0.055** | softer than spec |
| top–bottom tb | −0.11 (top brighter) | **−0.050** | same sign, half the size |
| H/W | 0.93 bare | 0.76 of the visible face fill | hair/hat caps cut the crown; the bare-head test is unreliable, so **0.93 is unconfirmed, not refuted** |

The ink is **less blue** than #241726: R and G agree, B is 24 not 38. On screen it reads as near-black plum-brown.

---

## 3. Grade (grade.md §2) — confirmed

Scripts: `frames_pass.py` (every frame: `tools/measure/grade_metrics.frame_metrics` + `ink_scan.frame_mode` + zones +
sky), `frames_summary.py`. Data: `data/frames_pass.json`, `data/frames_summary.json`.

grade.md's day/golden/night/interior hand labels are lost. A first automatic rule (from mid-tone colour) was checked by
eye on 10 frames (`out/label_check.jpg`) and got **5 of 10 wrong** (a classroom as golden, a moonlit castle as day), so
it was replaced by a rule on **sky colour only**: D = blue sky visible, G = warm sky visible, O = everything else. D is
reliable; G also catches warm pale walls, so G numbers are indicative only. "all" needs no labels and is the fair
comparison.

| per-frame median | grade.md ref all | **re-measured all (3,863)** | grade.md ref day | **re-measured D (692)** |
|---|---|---|---|---|
| Y′ p1 / p5 / p50 / p95 / p99 | .095 / .137 / .449 / .857 / .943 | **.101 / .152 / .451 / .858 / .948** | .134 / .205 / .571 / .895 / .967 | .118 / .195 / .554 / .890 / .959 |
| Y′ mean | .474 | **.475** | .558 | .542 |
| non-ink p5 | .151 | .167 | .234 | .229 |
| HSV S mean / p50 | .465 / .467 | **.463 / .467** | .439 / .429 | .452 / .451 |
| lit C* p50 / p90 | 31.9 / 56.6 | **31.9 / 54.8** | 33.8 / 54.9 | 33.0 / 50.7 |
| black point | (25,13,22) | **(28,13,20)** | (35,19,20) | (29,17,25) |
| corner / centre | .719 | **.702** | .856 | .806 |
| shadows a*/b* | +16.5 / −13.4 | +15.3 / −4.1 | +12.5 / −2.5 | +12.1 / −4.7 |
| ink fraction | .023 | .023 | .026 | .026 |

Per-video Y′ mean spans **0.23–0.63** and saturation **0.38–0.61** over all 21 frame folders (STYLE_BIBLE says 0.43–0.54
and 0.38–0.65: the luma range is wider because night-heavy episodes are now included).

---

## 4. Sky and atmosphere (depth.md §2, textures.md §3.12, lighting.md sky row)

From `frames_pass.py` (sky = smooth bright region connected to the top edge, depth.md 2.1 method).

| | depth.md day | **re-measured D (692 frames)** |
|---|---|---|
| upper sky | #5e93d9 | **#5b96d3** |
| sky just above skyline | #9fb6e6 | #85b7e7 |
| low / upper luminance | 1.28 (1.18–1.40) | **1.24** (1.11–1.37) |

Confirmed. The haze bands (dark floor, dA) were not re-run.

---

## 5. Depth of field (depth.md §1) — partly confirmed

Script: `dof.py` (vectorised edge-spread fit, same estimator as `tools/measure/blur_fit.py`, every 2nd frame,
1,782 frames with edges; `--validate`). Data: `data/dof.json`, `data/dof_validate.json`.

Instrument: blur 0/1.5/3/6 reads 0.54/2.16/3.43/6.35 (the known +0.3–0.5 bias at small sigma, same as GATE0); a frame
with only its top third blurred by 2 / 4 reads **2.52 / 4.67** there and 0.51 / 0.54 below. Passes.
**A multi-scale (1, 2, 4) version was also tried and failed** — on a sharp frame it read 4.67, because coarse scales
fit smooth shading ramps as blurred edges. It was not used.

| | depth.md | re-measured |
|---|---|---|
| above-head median | 0.57 (IQR 0.38–1.07, p90 2.75) | **0.59** (0.37–0.79, p90 1.04; n 334 frames with a detected head) |
| share of frames > 1.0 | 27 % | **7 %** |
| sharp baseline p10 | 0.33 | 0.25 (grid floor; PNG frames are sharper than the study's decodes — same note as GATE0) |

The typical frame agrees; **the blurred tail does not.** The 27 % / "DOF on in about a third of shots" came from hand
boxes and hand shot labels that are lost. Until re-labelled, build DOF as a **chosen-beat** effect (that part of the
report is consistent with both measurements), not as a third-of-the-film default.

---

## 6. Outlines (outlines.md §2.3)

| | outlines.md | re-measured |
|---|---|---|
| strong edges carrying ink | 45.1 % | **40.6 %** all frames, **44.3 %** day |
| dark-stroke pixels | 1.70 % | 2.76 % (different stroke threshold; trend only) |

Frame-wide claim confirmed. The 66 per-edge scans (EW 3.09 / 3.04 / 2.17 px by edge type) were hand-placed and are not
re-derived; `tools/measure/ink_scan.py --scan` can redo any one of them.

---

## 7. Lighting (lighting.md)

Re-derived: heads (section 2: V .955, |lr| .055, tb −.05) and the grade rows (section 3). Not re-derived: same-surface
shadow ratios (hand boxes), key direction (by eye), glows, contact profiles.

## 8. Textures (textures.md)

Re-derived: day sky stops (section 4). Not re-derived: every material patch (planks, stone, roofs, water, clouds) —
those were hand boxes.

## 9. What was NOT re-derived, and why

| item | report | why | how to redo |
|---|---|---|---|
| torso width 0.80 W, body 3.5 HH, limb widths | characters.md 1.5 | read by eye from 15 lost crops | crop 15 full figures from `frames/`, read on a grid |
| shot types CU/MS/FS/WS, camera height 0.79 | depth.md 4 | 539 hand labels | label a frame sample by eye |
| shadow/lit ratios, key direction | lighting.md 2–4 | hand boxes | `ink_scan`-style boxes per frame |
| material patches | textures.md 3 | hand boxes | |
| step 9–12 f, bob, blinks, reaction lead | motion.md 3 | hand tracking | |
| per-edge ink scans | outlines.md 2.1 | hand-placed scans | `tools/measure/ink_scan.py --scan` |

These numbers stay in their reports, marked **carried, not re-derived**. They remain unauditable until someone redoes them.

---

## 10. What this changes for the build

1. **Ink:** set the character outline to **#231218** (toon.ts has #322228). Open item 3 is settled.
2. **Eyes:** spacing **0.265 W** (toon.ts 0.286). Open item 4, half settled; torso width still open.
3. **Camera:** build to motion.md §2.1, not to the census. Our film needs to move in about two frames of three, and its
   p90 speed needs to rise about six-fold (3.9 → ~24 px/f at 720, translation + zoom). Push-ins in quiet frames ~0.2 %/f.
4. **Heads:** soften the side gradient (|lr| ≈ 0.05, not 0.14); keep fill near 0.95.
5. **DOF:** a chosen-beat effect; the one-third frequency is unconfirmed.
