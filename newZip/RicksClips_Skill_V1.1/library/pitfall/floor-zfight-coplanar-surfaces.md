# pitfall: floor flickers because two surfaces sit at exactly the same height (z-fighting) — CRITICAL (earned GOLDRUSH v2, CB 2026-11-15)

**Symptom:** CB on final v2: "0.11 floor is flicker", "0.54 floor flickering". Whole regions of the store's plank floor flipped
to flat grey stone for single frames as the camera crept (s2 f57, 69-72, 79-89; s5 f396-456, 640-700), and also with the camera
at rest (s5 f408-429). flicker.py: s2 f30-90 15 FAIL frames, floor pop max 26.3 grey levels; s5 pop max 10.3-14.1.
**Cause (proven):** the store floor top (FL 0.45 m, sets/store.js) was coplanar with the top of the hero lot's stone foundation
(`inst_stone`, sets/street.js line 344, top = deck zd = 0.45). Raycast probe: 466 of 1008 floor rays (s2) and 423 of 1512 (s5)
hit `floor_plank` and `inst_stone` at the SAME distance. Switching off post, every light or the sun did not remove it. The
builder's first guess (lamp shadows) was wrong: probe before guessing.
**Fix:** the hidden surface moved down: hero lot foundation top = zd - 0.03 (street.js, grep "FLICKER FIX"). After: 0 coplanar
rays, s2 pop max 0.22, s5 static-frame aba 0.12-0.42 (was 0.7-23.6).
**Detect:** `python tools/frame_checks/flicker.py <frames dir> --from a --to b` (exit 1 = FAIL) on every rendered stretch; for the
cause, the z-probe `episodes/continue-goldrush-from-handoff-md-section-0f-bui/out/flicker_fix/zprobe.js` (coplanar ray hits
must be 0). See solution/flicker-scan-flicker-py.md.
**Permanent rule:** CB_RULES 5 NO FLICKERING FLOOR. A surface placed under or inside another (floor over foundation, deck over
lot, decal on ground) gets a 2-3 cm offset; never reuse one height constant for two solids.
**Automation opportunity:** run the z-probe automatically on each set's first test render (needs a permanent scene hook
instead of the temporary `globalThis.__flk` line). **Priority:** CRITICAL.
