# pitfall: bodies stand inside counters and tables — HIGH (earned GOLDRUSH v2, CB 2026-11-15)

**Symptom:** CB on v2: "bodies in counter/table" (store counter, restaurant table). v3 still has the s5 Miner 2 % in the counter
for 3 frames of a whip (waived).
**Cause:** the character card planes stood inside the furniture's volume, and the characters are short next to a counter whose
top sits at their shoulder height, so the top runs on behind the body and reads as "she is IN the table".
**Fix:** marks behind the counter's/table's back edge; only the reaching arm crosses the top; move the props (coins, scale,
tag) to within reach instead of moving the body into the furniture. Walking past is no excuse.
**Detect:** `node tools/frame_checks/check.mjs <film.json>` test `body_in_mesh`: FAIL at 10 %+ of torso-hips-thighs inside a solid,
or one part cutting 15 %+ of the body width with 8 cm+ running on behind the card; tested on rests AND every 2nd frame between
rests (`--body-step 2`). Seats are known by name only (`seat|stool|bench|saddle|sofa|couch`, `--seat`). Proof copies:
`episodes/continue-goldrush-from-handoff-md-section-0f-bui/out/checker_test/`. A version with a FAIL is not sent to CB.
**Permanent rule:** CB_RULES 5 NO BODY INSIDE FURNITURE. **Priority:** HIGH.
