# pitfall: one film split over seven sibling folders, each with its own copy of the sets — MED (earned GOLDRUSH, 2026-11-15)

**Symptom:** goldrush lived in goldrush + goldrush-s2..s7, each with copied sets/cast/moves. The copies drifted: s5 kept an
older store.js (bottle/pans/lamp/scale spots, halo .55, coffee mill, ...); s2/s4/s5 cast.json lacked 2 of 6 roles; ep moves
existed in several versions. A set fix had to be made seven times.
**Fix:** one episode folder with ONE merged sets/ (master file + per-place keys, e.g. `places.store_night.store_v = "s5"`
restores s5's version; `places.<p>.joins {store, wharf}` replaces "file present in that folder"), one cast/, union of moves/,
film_s1..s7.json. Procedure and decisions: episode STATE.md. See solution/one-episode-folder-seeded-merge-proof.md.
**Detect:** more than one folder per film (rule: one folder per film, versions inside); `diff -r` of sets/ between stretch
folders shows any difference = drift.
**Priority:** MED.
