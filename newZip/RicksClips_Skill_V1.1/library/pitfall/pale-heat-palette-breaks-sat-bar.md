# pitfall: "white-hot" heat palettes bleach below the reference saturation bar — HIGH (earned EP01 gate)

**Symptom:** CB rejected the storyboard: "colors look so fade.. rick clips all strong colors." August
beats measured sat_mean 0.10-0.19 vs the reference railroad's 0.30-0.47 (p75 0.42-0.72).
**Cause:** the set designer's August state used pale alkali ground + bright wash to say "hot" —
but the reference says HOT with saturated warm ochres, deep blue sky and the emissive worn band,
never with bleaching. Desaturation reads as faded, not heat. Compounding miss: character framing
drifted small (heads ~10 % of frame width vs the reference's 25-40 % in mediums).
**Fix:** rebuild hot states as saturated-warm; heat carried by emissives/shimmer/light warmth.
**Detect (gate check, automated):** before any board goes to CB, measure every panel:
PIL 200px thumb, HSV every 2nd px → require sat_mean ≥ 0.30 AND sat_p75 ≥ 0.45 on day exteriors;
and on character beats, key head width ≥ 22 % of frame width.
**Permanent rule:** every NEW palette/light state gets its sat numbers measured against the ref
cluster BEFORE it is boarded — states are style targets, not moods to invent freely.
**Creativity gap:** a "heat ladder" could keep saturation constant while shifting hue temperature
only (sage→ochre→ember) so seasonal cuts read as temperature, never as fading.
