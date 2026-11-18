# pitfall: a "move then creep" leg that DEPARTS on its key frame shows each framing too early — MED (earned ONODA r1)

**Symptom:** the letter beat showed the NEXT set-up (the newspaper tree) while the narration was still on "letters".
**Cause:** the leg ease put the fast 92 % move at the START of the segment a->b, so the camera left framing `a` the
moment it arrived and reached `b` long before b.f. Key frames meant "depart", the shot table was written as "arrive".
**Fix (OnodaFilm.tsx camAt):** park first (creep 8 % of the way, never static), then the decisive `move`-frame leg
lands exactly ON b.f. Key frame = arrival frame, so a key can be authored as `word onset - lead`.
**Detect:** render the frame 2 f after each key word: it must show that key's framing.
**Priority:** MED.
