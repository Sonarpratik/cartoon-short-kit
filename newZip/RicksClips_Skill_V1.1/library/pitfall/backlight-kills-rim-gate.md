# pitfall: a true backlight zeroes the rim light's own gate — HIGH (earned here)

**Symptom:** golden-hour characters show no rim exactly in backlit shots — the shots the rim exists for.
**Cause:** the rim gain was gated by `length(sunV.xy)` (screen-space sun direction); with the sun near the view
axis (az ~6°) that length is ~0.16 and `smoothstep(0.1,0.4,sl)` smothers the rim.
**Fix (cardshade.ts P2.7):** blend to a whole-silhouette HALO as the sun approaches the axis:
`back = 1 - smoothstep(0.12, 0.35, sl)` and `rim = warm * max(sideRim, 0.85 * back * halo) * ...` where halo
tests the alpha edge in ±x. The reference uses the same halo read (lottery ep trash-can POV).
**Detect:** render one backlit CU per episode; sample the silhouette edge for the rim colour; fail if absent.
**Root cause:** screen-space direction degenerates at the singularity. **Permanent rule:** every directional
screen-space effect needs an on-axis fallback. **Priority:** HIGH.
