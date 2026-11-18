# GRADE v1: lightning-spear (editor-compositor, 2026-11-15)
Method: armor grade_final (per light kind colour-to-colour map, guards) + additive coloured haze lift, night floor lift (G/H), terracotta + fire guards.
Light kinds per frame: lights.json. Numbers: params.json (written by mkparams.py). Measured on every 15th frame from join.py's plan (exact pixels), caption band left out; night floor on EVERY G/H frame.
sat = mean HSV saturation (armor measure, Rick 0.46), mean = luma, p99 white point, p1 darkest 1 %, faces = armor head finder (lit half median).

## Before (ungraded film_test)
| kind (before) | n | sat | mean | white p99 | dark p1 | face rgb (median) | glint n/flat/max | orange share | min mean |
|---|---|---|---|---|---|---|---|---|---|
| A | 18 | 0.699 | 0.355 | 0.919 | 0.052 | [255, 255, 255] (21) | 77737/0/0.91 | 0.2027 | 0.278 @45 |
| B | 13 | 0.608 | 0.373 | 0.971 | 0.096 | [255, 255, 255] (21) | 19/0/0.84 | 0.1726 | 0.340 @285 |
| C | 14 | 0.687 | 0.481 | 0.860 | 0.167 | [240, 229, 239] (12) | 49579/0/0.91 | 0.1709 | 0.410 @615 |
| D | 7 | 0.698 | 0.474 | 0.928 | 0.113 | [255, 255, 255] (14) | 32859/0/0.93 | 0.1724 | 0.429 @675 |
| E | 21 | 0.476 | 0.540 | 0.911 | 0.143 | [255, 255, 255] (30) | 305025/0/0.94 | 0.0121 | 0.405 @870 |
| F | 7 | 0.405 | 0.457 | 0.877 | 0.120 | [254, 254, 254] (15) | 30464/0/0.92 | 0.0192 | 0.415 @1140 |
| G | 5 | 0.613 | 0.411 | 0.944 | 0.145 | [254, 254, 254] (2) | 52/0/0.94 | 0.1314 | 0.329 @1224 |
| H | 43 | 0.584 | 0.439 | 0.853 | 0.109 | [228, 234, 255] (38) | 421721/0/0.94 | 0.1001 | 0.293 @1717 |
| A2 | 11 | 0.714 | 0.397 | 0.810 | 0.049 | [255, 255, 255] (11) | 1370/0/0.82 | 0.2960 | 0.225 @2055 |
film: sat 0.604  mean 0.440
G/H frames under 0.31 (every frame checked): 20 [1403, 1404, 1405, 1406, 1407, 1676, 1677, 1678, 1679, 1680, 1681, 1682, 1683, 1684, 1685, 1686, 1687, 1716, 1717, 1718]

## After (film_v1, grade.py)
| kind (after) | n | sat | mean | white p99 | dark p1 | face rgb (median) | glint n/flat/max | orange share | min mean |
|---|---|---|---|---|---|---|---|---|---|
| A | 18 | 0.615 | 0.408 | 0.936 | 0.099 | [255, 255, 255] (24) | 75450/0/0.92 | 0.1878 | 0.331 @45 |
| B | 13 | 0.568 | 0.421 | 0.974 | 0.138 | [255, 255, 255] (19) | 0/0/0.00 | 0.1976 | 0.385 @345 |
| C | 14 | 0.508 | 0.502 | 0.898 | 0.172 | [244, 228, 225] (13) | 308094/0/0.90 | 0.0664 | 0.426 @615 |
| D | 7 | 0.547 | 0.490 | 0.935 | 0.141 | [255, 255, 255] (12) | 20287/0/0.92 | 0.1706 | 0.444 @675 |
| E | 21 | 0.482 | 0.527 | 0.910 | 0.152 | [255, 255, 255] (29) | 247682/0/0.93 | 0.0081 | 0.395 @870 |
| F | 7 | 0.394 | 0.461 | 0.890 | 0.139 | [246, 240, 230] (19) | 26495/0/0.92 | 0.0143 | 0.417 @1140 |
| G | 5 | 0.459 | 0.441 | 0.944 | 0.179 | [254, 254, 254] (2) | 19/0/0.92 | 0.0306 | 0.359 @1224 |
| H | 43 | 0.507 | 0.474 | 0.889 | 0.144 | [236, 240, 252] (45) | 553668/0/0.94 | 0.0560 | 0.324 @1407 |
| A2 | 11 | 0.611 | 0.463 | 0.888 | 0.105 | [255, 255, 255] (11) | 273728/0/0.84 | 0.3369 | 0.292 @2055 |
film: sat 0.526  mean 0.470
G/H frames under 0.31 (every frame checked): 0 []

Lab mean distance between kinds after (min pairs): E-F 10.2, D-F 10.4, B-A2 10.6, A-A2 11.3, C-H 12.0 (before: C-D 2.3, B-A2 4.7, B-G 5.8).
Caption letters: pure-white pixel count identical before/after in all 813 measured frames (3,664,715 px); black outline next to letters kept ungraded.
Glint: cold blue-white pixels flat at 255 = 0 before and after in every kind.
Faces: every face at 255 stays 255 (identity guard Y>0.62, S<0.14); the off-white detections are tinted faces/beige blobs and only moved lighter.
Fire: H orange share 0.100 -> 0.056 (lantern warm gain 0.88; fire pixels guarded as built).
Not met: film sat 0.526 (target 0.42-0.50); pushing lower made roofs salmon/beige and skies flat on the sheet (v1a tried 0.508, rejected). A mean 0.408, B 0.421, A2 min frame 0.292 @2055 (dawn, day frame). B p99 0.974 (candle cores / whites kept by guards).
