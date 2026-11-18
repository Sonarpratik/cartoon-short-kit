# pitfall: a measured ON-SCREEN colour pasted as a CODE value lands darker — MED (earned ONODA scorecard r1)

**Symptom:** after setting toon.ts INK to the re-measured reference ink #231218, our rendered outline core read
(25,1,11): darker and greener-starved than the target (35,18,24). Day close-ups also failed the black-crush gate.
**Cause:** a character card's colour passes card shading (CHAR tint x ~0.86), the PBR-Neutral tone map toe and
the grade curve (GRADE_DAY2 ky[0] = 0 pressed blacks to zero) before it reaches the screen. A screen measurement is a
TARGET for the pipeline output, not an input value. The old #322228 was in fact close to right on screen.
**Fix (ONODA copy):** grade ky[0] 0 -> 0.035 (blacks to the measured ref black point (28,13,20)), INK code value
#2b1d21 -> screen core (30,11,18). Same idea as shade.ts `untone()` for sky/fog: invert the pipeline, then set.
**Detect:** after any colour-spec change, render one MCU and sample the darkest 5 % of the character outline.
**Permanent rule:** every spec colour is tagged CODE or SCREEN; SCREEN values are verified on a render. **Priority:** MED.
