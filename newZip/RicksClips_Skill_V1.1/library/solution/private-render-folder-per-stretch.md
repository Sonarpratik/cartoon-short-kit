# solution: one private render folder per stretch, junctions to the shared parts (GOLDRUSH render_stretch.sh v2, 2026-11-15)

**What:** `bash render_stretch.sh sN [render_gpu.mjs flags]` in
`episodes/continue-goldrush-from-handoff-md-section-0f-bui/` renders stretch N from `sNep/`: its own out/plan (from
out/plan_sN) and output, with directory junctions to the ONE shared sets/, cast/, moves/, voice/. The wrapper also forces face
shading off (pitfall/drawn-face-shading-bands.md).
**Why it works:** the kit only reads `<film folder>/out/plan/`; giving each stretch its own film folder removes the shared
resource, so parallel builders never wait on each other except in the GPU queue itself, while a set fix is still seen by
every stretch at once.
**Reusable pattern:** shared, read-mostly assets = junctions; per-job, written state = private folder. Delete such a folder
only after removing its junctions (never `rm -rf` through them).
**Replaces:** render_stretch.sh v1 (copy plan under one film-wide lock): pitfall/shared-plan-folder-serialises-parallel-renders.md.
