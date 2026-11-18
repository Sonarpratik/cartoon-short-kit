# pitfall: many small fix rounds, each adding fly-ins and fly-outs, make the measured camera worse — HIGH (earned GOLDRUSH v2 -> v3, 2026-11-15)

**Symptom:** check_film camera gates on goldrush: v2 = 1 FAIL (travel p90 1.48 s vs reference 2.1-6.3 s) + 4 WARN (rests
4.7 per 10 s, speed median, roll p99, one flicker); after the v3 fix rounds = 4 FAIL: rests 4.9 per 10 s, travel p90 1.2 s, roll
p99 2.4, whips 12.9/min. The camera hops between short moves instead of the reference's long flowing moves.
**Cause:** each fix round (gags, close-ups, restaging) patched its beat with its own fly-in/fly-out; nobody re-ran check_film
over the whole stretch after the rounds.
**Fix:** plan the camera flow ONCE per stretch (long travels that carry several beats); a fix round edits inside that flow
instead of adding moves. Goldrush v3 still needs a camera-only pass over all stretches (next big gain, HANDOFF 0i).
**Detect:** re-run check_film after EVERY fix round and compare with the previous round: any gate that got worse (rests per
10 s up, travel p90 down, whips per min up) blocks the round. Related: pitfall/too-many-shots-reads-choppy.md (cuts),
pitfall/camera-key-arrive-vs-depart.md.
**Priority:** HIGH.
