# pitfall: walks slide because the body glides on a linear move while the legs cycle — HIGH (earned GOLDRUSH v2, CB 2026-11-15)

**Symptom:** CB on v2: "sliding walk".
**Cause:** the character's place was moved by a linear `move_s` glide while the leg cycle ran on its own clock, so the planted
foot drifts over the ground.
**Fix (v3, every walk in the film):** foot-locked walks: the planted foot stays fixed in the world and the stride length is
matched to the distance covered (whole number of steps for the distance, stride retuned to fit).
**Detect:** no automatic check yet. Proposed: in check.mjs or the motion gate, track the planted foot's world position per
frame during a walk; drift over ~1-2 cm per frame = FAIL. Until then: step through every walk at 2 fps watching one foot.
**Permanent rule:** CB_RULES 5 NO SLIDING WALK. **Priority:** HIGH.
