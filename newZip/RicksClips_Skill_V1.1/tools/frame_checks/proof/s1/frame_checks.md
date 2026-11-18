# Frame checks: armor-s1-hook/film.json

3 FAIL, 2 WARN, 37 PASS. 168 of 356 frames checked (camera rests: f47-62, f96-127, f184-205, f222-283, f298-331), cast mathematician, chief, rivets, 36 s.
Numbers: head_cut = % of head+hat inside the frame (100 = whole). body_side = % of the figure's width inside the frame. face_covered = face rays (head centre, two eyes) blocked by set geometry. feet = cm between the foot and the surface below (+ floats, - inside).

| result | who | rest | check | number | worst at | bad frames | what | crop |
|---|---|---|---|---|---|---|---|---|
| FAIL | chief | f184-205 | body_side | 50 % | f184 | 22/22 | cut by the right edge | [crop](frame_checks/FAIL_body_side_chief_f00184.jpg) |
| FAIL | chief | f184-205 | head_cut | 30 % | f195 | 22/22 | cut by the right edge | [crop](frame_checks/FAIL_head_cut_chief_f00195.jpg) |
| FAIL | chief | f47-62 | body_side | 80 % | f57 | 12/16 | cut by the right edge | [crop](frame_checks/FAIL_body_side_chief_f00057.jpg) |
| WARN | chief | f298-331 | body_side | 75 % | f331 | 3/34 | cut by the right edge (only 3 frames: WARN) |  |
| WARN | chief | f298-331 | head_cut | 92 % | f331 | 2/34 | cut by the right edge (only 2 frames: WARN) |  |
| PASS | mathematician | f0 (first) | body_side | 100 % | f0 | 0/1 |  |  |
| PASS | mathematician | f0 (first) | head_cut | 100 % | f0 | 0/1 |  |  |
| PASS | mathematician | f0 (first) | face_covered | 0 rays | f0 | 0/1 |  |  |
| PASS | mathematician | f0 (first) | feet | 0 cm | f0 | 0/1 | on briefcase_body/briefcase_pose/briefcase_body |  |
| PASS | chief | f0 (first) | body_side | 100 % | f0 | 0/1 |  |  |
| PASS | chief | f0 (first) | head_cut | 100 % | f0 | 0/1 |  |  |
| PASS | chief | f0 (first) | face_covered | 0 rays | f0 | 0/1 |  |  |
| PASS | chief | f0 (first) | feet | 0 cm | f0 | 0/1 | on apron_concrete |  |
| PASS | rivets | f0 (first) | body_side | 99 % | f0 | 0/1 |  |  |
| PASS | rivets | f0 (first) | head_cut | 100 % | f0 | 0/1 |  |  |
| PASS | rivets | f0 (first) | face_covered | 0 rays | f0 | 0/1 |  |  |
| PASS | rivets | f0 (first) | feet | 0 cm | f0 | 0/1 | on apron_concrete |  |
| PASS | chief | f47-62 | head_cut | 100 % | f47 | 0/16 |  |  |
| PASS | chief | f47-62 | face_covered | 0 rays | f47 | 0/16 |  |  |
| PASS | rivets | f47-62 | body_side | 2 % | f47 | 0/6 | cut by the right edge |  |
| PASS | mathematician | f96-127 | head_cut | 100 % | f96 | 0/32 |  |  |
| PASS | mathematician | f96-127 | face_covered | 0 rays | f96 | 0/32 |  |  |
| PASS | mathematician | f96-127 | body_side | 99 % | f104 | 0/32 | cut by the right edge |  |
| PASS | chief | f184-205 | face_covered | 0 rays | f184 | 0/22 |  |  |
| PASS | mathematician | f222-283 | body_side | 100 % | f222 | 0/62 |  |  |
| PASS | mathematician | f222-283 | head_cut | 100 % | f222 | 0/62 |  |  |
| PASS | mathematician | f222-283 | face_covered | 0 rays | f222 | 0/62 |  |  |
| PASS | mathematician | f222-283 | feet | 0 cm | f222 | 0/62 | on apron_concrete |  |
| PASS | chief | f222-283 | body_side | 100 % | f222 | 0/62 |  |  |
| PASS | chief | f222-283 | head_cut | 100 % | f222 | 0/62 |  |  |
| PASS | chief | f222-283 | face_covered | 0 rays | f222 | 0/62 |  |  |
| PASS | rivets | f222-283 | body_side | 100 % | f222 | 0/62 |  |  |
| PASS | rivets | f222-283 | head_cut | 100 % | f222 | 0/62 |  |  |
| PASS | rivets | f222-283 | face_covered | 0 rays | f222 | 0/62 |  |  |
| PASS | rivets | f222-283 | feet | 0 cm | f222 | 0/62 | on apron_concrete |  |
| PASS | chief | f222-283 | feet | 0 cm | f270 | 0/62 | on apron_concrete |  |
| PASS | mathematician | f298-331 | body_side | 100 % | f298 | 0/34 |  |  |
| PASS | mathematician | f298-331 | head_cut | 100 % | f298 | 0/34 |  |  |
| PASS | mathematician | f298-331 | face_covered | 0 rays | f298 | 0/34 |  |  |
| PASS | chief | f298-331 | face_covered | 0 rays | f298 | 0/34 |  |  |
| PASS | mathematician | f298-331 | feet | 0 cm | f301 | 0/34 | on apron_concrete |  |
| PASS | chief | f298-331 | feet | 0 cm | f330 | 0/34 | on apron_concrete |  |
