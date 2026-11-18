# pitfall: parallel stretch renders sharing one out/plan folder under one lock serialise every builder — HIGH (earned GOLDRUSH v2, 2026-11-15)

**Symptom:** 7 stretch builders queued behind each other; a dead render kept the lock 30 min and stalled all of them.
**Cause:** the kit reads `<film folder>/out/plan/`, and seven films shared one episode folder, so render_stretch.sh v1 copied
`out/plan_sN -> out/plan` and held ONE lock over the whole GPU wait (not only the copy), with no stale-lock release.
**Fix:** render_stretch.sh v2: each stretch renders from its own private folder `sNep/` (own out/plan), with directory
junctions to the shared sets/ cast/ moves/ voice/. No shared plan folder, no film-wide lock. See
solution/private-render-folder-per-stretch.md.
**Danger:** never `rm -rf` a folder that holds junctions: it can reach into the shared sets/cast/moves/voice. Remove the
junction links first, then the folder.
**Detect:** a lock file older than the longest expected render (~15 min) with no live render process = stale, report it;
grep a render wrapper for a lock taken before the GPU queue wait. Two parallel jobs writing the same out/plan = FAIL.
**Permanent rule:** never share one plan/output folder between parallel renders; a lock guards only the step that truly needs
it (see solution/render-lock-file-for-parallel-builders.md). **Priority:** HIGH.
