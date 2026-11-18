# solution: flicker.py finds floor and one-frame flicker on rendered frames, camera motion explained away (GOLDRUSH 2026-11-15)

**What:** `python tools/frame_checks/flicker.py <frames dir> [--from a --to b] [--region floor|all] [--json rows.json] [--top 8]`,
about 0.55 s per frame (quarter size, numpy only). Frames t-1 and t+1 are aligned onto t (global phase correlation, block
search +-64 px, then +-2 px), so the camera's own move cancels out.
**Numbers:** pop = second difference of the median block change (a fade or ramp = 0); shim = 75th pct block residual after the
best shift; aba = one-frame up-down flips per pixel. FAIL frame = pop > 1.0 AND pop > 0.25 x shim; the range FAILs (exit 1) with
2+ FAIL frames. WARN = aba > 1.5 where shim < 8 (glints, shadow shimmer, but also acting: look first). Caption band 62-79 % of
height is masked.
**Calibration:** clean s3 harbour f0-238 (pop max 2.06) and s7 restaurant f0-172 (0.53) = 0 FAIL frames; the flagged v2
ranges = 5-15 FAIL frames each.
**Limits:** a flicker on under half of the floor region shows only as WARN; flights over 0.5 m per frame are not fully followed
(v3 still flags 2 fast s2 moves, f265 pull-out and f315 coin flight: motion, not light).
**Cause finder:** z-probe `episodes/continue-goldrush-from-handoff-md-section-0f-bui/out/flicker_fix/zprobe.js` (temporary
`globalThis.__flk = { scene, THREE }` line in the set's build function, then `bash render_stretch.sh sN --frames F --eval <abs path>`,
hook removed after). Bisect by switching off post / lights / sun on a deterministic re-render before blaming a light.
**Reusable pattern:** before/after re-renders at `--seed 1` on the same frames. Full write-up: that episode's FLICKER_FIX.md.
Fixes it led to: pitfall/floor-zfight-coplanar-surfaces.md, pitfall/light-pops-in-one-frame.md.
