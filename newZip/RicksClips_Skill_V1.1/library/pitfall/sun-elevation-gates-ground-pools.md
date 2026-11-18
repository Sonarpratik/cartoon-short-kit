# pitfall: sun elevation gates the warm ground pool non-linearly — MED (earned here)

**Symptom:** lowering the park sun from el 18 to 16 for longer sunset shadows killed the entire warm lawn pool
(ground rgb 131,134,97 warm at el 18 → 111,123,126 grey at el 16); the shot went day-grey, worse than before.
**Cause:** surrounding buildings' shadow line crosses the lawn between el 16 and 18 — occlusion is a hard gate,
not a gradient.
**Fix:** measure the lit-pool mean rgb at each candidate elevation BEFORE committing; get sunset from rim + warm
bounce + grade when geometry blocks the low sun.
**Detect:** patch-sample the hero ground area in a test still on any sun change; fail if chroma drops > 20 %.
**Permanent rule:** never tune sun angles blind; one still + one patch sample per candidate. **Priority:** MED.
