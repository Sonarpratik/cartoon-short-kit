# pitfall: in 9:16 the HORIZONTAL field of view is tiny — two-shots fall off the frame — HIGH (earned ONODA r1)

**Symptom:** first ONODA stills: 6 of 16 frames had the character half out of frame or missing, though every camera
"looked at" the right place. The stream two-shot had both people completely off-screen.
**Cause:** three.js `fov` is VERTICAL. At 1080x1920 the horizontal half-angle is atan(tan(fov/2) x 0.5625):
fov 34 -> only 19.4 deg wide in total. Visible width at distance d is about 0.34 d (fov 34) / 0.41 d (fov 40).
Two people 1.6 m apart need d >= 4.6 m at fov 34; a subject 13 deg off the look axis is already gone.
**Fix:** aim the look point AT the subject (or between the pair) and size the distance from width = 2 d tan(fov/2) x 0.5625.
Put the second subject behind the first along the view axis (OTS, depth staging) rather than beside it.
**Detect:** before rendering, project every cast position: lateral offset / (d x tan(fov/2) x 0.5625) must stay
within +-0.8. (A one-line check per key in the shot table.)
**Permanent rule:** stage vertical shots in DEPTH, not in width. **Priority:** HIGH.
