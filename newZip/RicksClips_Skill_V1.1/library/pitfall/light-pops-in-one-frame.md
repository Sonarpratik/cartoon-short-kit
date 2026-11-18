# pitfall: lights and effects that change in one frame read as flicker — HIGH (earned GOLDRUSH v2/v3, CB 2026-11-15)

**Symptom:** floor/water flicker that is NOT z-fighting: the s5 store-night oil lamp pumped +-10 % at 1.5 and 3.8 Hz; a
light-shaft cone in the store switched on in one frame; new river glints flipped on/off at camera rest (s4 f33-61 per-pixel aba
on the water band 0.05 -> 2.18, p95 0.27 -> 6.88; flicker.py WARN frames 8 -> 17 in f16-74); dig puffs popped onto the gravel
at full .55 opacity in one frame.
**Cause:** a fast sine sum on a light intensity (sets/store.js lamp `.9 + .06 sin(9.1t) + .04 sin(23.7t)`), and on/off switches
with no ramp (cone in store.js, glints in sets/river_nature.js, puffs in sets/river.js).
**Fix:** slow, small lamp curve `.95 + .03 sin(2.2t) + .02 sin(3.7t)` (flame sprite unchanged). Every light, cone, glint or puff
fades in/out, never switches: v3 lead rule = fades over 10-15 frames; the shortest fade seen working = 4 frames (puffs
`.42 min(1, (d+1)/4) (1 - d/14)`; glints "fade over 4+ frames", episode FLICKER_FIX.md).
**Not flicker:** a smooth story ramp (s5 "nine weeks" day light, floor 102 -> 135 grey, second difference ~0): flicker.py
passes it on purpose.
**Detect:** flicker.py on the range: FAIL frames (pop) for floor-wide pops; a growing WARN list (aba > 1.5) for local glints.
Look at WARN frames: a flicker covering under half of the floor region never FAILs. Grep set files for a `sin(` factor above
~4 on any light intensity or opacity. **Priority:** HIGH.
