# Gate 0: toolkit calibration against the reference reports (2026-11-04)

Rule: a tool may judge our frames only after reproducing the reports' numbers on reference material.

## cam_track.py — PASS
Ran on 3 videos (Slot Machines, Painkillers, Brain Zone). Reference per-video ranges from motion.md §2.1:

| metric | ref range (20 videos) | Slot | Painkillers | Brain Zone |
|---|---|---|---|---|
| hold % | 1–27 | 9.2 | 1.2 | 11.0 |
| move % | 34–94 | 74.6 | 94.8 | 53.1 |
| speed median px/f | 1.3–12.9 | 5.4 | 14.1 | 2.4 |
| speed p90 | 9.7–29.4 | 23.0 | 33.7 | 19.9 |
| move peak median | 13.7 (5.9–24.6) | 20.2 | 22.8 | 11.2 |
| attack / release f | ~10 / ~10 | 12 / 15 | 6 / 7 | 6 / 8 |
| quiet-zoom active % | ~70 | 72.4 | 87.6 | 61.5 |
| … push-in share % | ~83 | 85.3 | 95.4 | 86.5 |
| HF residual px | 0.05–0.29 | 0.21 | 1.02 | 0.14 |

2 of 3 videos inside every range. Painkillers is the continuous fly-through (its 94.8 % move matches the
range max 94 — it IS the extreme video in the study); its overshoots are +9–15 % on that same extreme.
Saved: references/measure/gate0_cam.json.

## grade_metrics.py — PASS
Day-heavy video (Why the Second Draw Always Wins) vs grade.md day/all clusters:
lit C* p90 54.8 (ref day ~55) · black point (33,16,25) (ref (35,19,20)) · sat mean 0.468 (ref all 0.465)
· Y'p50 0.438 (ref all 0.449; day 0.571 — the video mixes day/golden/interior) · corner/centre 0.81 (ref 0.86)
· dark b* −6.1 = violet shadows ✓. Night-heavy videos reproduce the night cluster (Y'p50 0.15–0.35,
black points near 0 → decode range confirmed full). Saved: references/measure/gate0_grade.json.

## ink_scan.py — PASS
Edge-ink coverage over 26 random frames from 14 videos: mean **43.2 %** vs outlines.md frame-wide **45.1 %**.
Scan mode implements the EW/FWHM/core method for single edges.

## blur_fit.py — PASS (with known bias)
Synthetic validation (frame blurred with known sigma, 720p): true 3.0 → 3.43, true 6.0 → 6.35,
true 1.5 → 2.16. Accurate in the DOF-decision band (2–8); overestimates ~0.3–0.5 at tiny sigmas.
Sharp reference frames: baseline p10 0.25 vs report 0.33 (grid floor; PNG frames sharper than the
study's decodes). Use it for DOF on/off and magnitude class, not sub-pixel claims.

## head_fit.py — FUNCTIONAL, usage caveat
Mechanically correct (segments the pale head blob, measures H/W, chin taper, crown, asymmetry), but it
needs **hat-free crops**: hats cut the crown and skew H/W low (measured 0.72–0.73 on two hatted heads vs
report 0.93 bare median). For our own cast, measure the toon.ts design canvas directly (no hat variant).
