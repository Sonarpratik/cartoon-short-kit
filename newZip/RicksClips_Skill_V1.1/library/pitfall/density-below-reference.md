# pitfall: shipping at half the reference's detail density — HIGH (earned NIGHT WITCHES, CB 2026-11-07)

**Symptom:** CB asked for "maximum density, no empty space". NIGHT WITCHES measured edge density 0.046 vs the reference
night 0.086 and ~410 distinct shapes vs 736; sky, canyon and moon frames were sparse.
**Cause:** sets were built to look right on the board at half size; detail was never measured per frame, and Freestyle's
cost pushed toward fewer objects.
**Fix (standing rule):** DENSITY_RULES.md — gates G1-G7 per frame with tools/measure/density_check.py, a density
test render per location BEFORE animation, instanced scatter + hull ink so density does not cost render time.
**Detect:** density_check.py on a frame sample per shot at every QA round; any FAIL is reported with its gap.
**Priority:** HIGH.

**Rule update (CB 2026-11-09):** empty cells at or below his median for that light (night 18.8 %, day, golden and interior 14.6 %), measured with density_check.py --style 3d.
