# pitfall: effect passes keep a stale camera near/far — DOF blurs the SUBJECT in video only [adopted] — CRITICAL

**Symptom:** the focus subject renders grey/smeared in the VIDEO while the background stays sharp; a fresh single
still of the same frame is sharp. Looks like a low-res card, impossible to see in still-based review.
**Cause:** EffectPass uniforms `cameraNear/cameraFar` (or `cameraNearFar`) are copied only at pass creation. Any
per-shot change of camera near/far leaves long-running render tabs with stale values → getViewZ mis-decodes depth
→ thin-lens CoC blurs the subject.
**Fix:** every frame after the camera update, sync all passes:
`composer.passes.forEach(p => { const u = p.fullscreenMaterial?.uniforms; if (u?.cameraNear) { u.cameraNear.value = cam.near; u.cameraFar.value = cam.far; } u?.cameraNearFar?.value.set(cam.near, cam.far); })`
plus `cam.updateMatrixWorld()` before `getWorldDirection()`. Guard applied in rick-shorts Bridge.tsx (2026-11-04)
even though our near/far is currently static.
**Detect:** sequence-vs-still check in render QA: render a span starting BEFORE any near/far/fov change and compare a
later frame to a fresh still (SSIM < 0.97 or subject sharpness below background = fail).
**Root cause:** postprocessing caches camera scalars. **Permanent rule:** per-frame uniform sync whenever the lens animates.
**Automation:** the sequence-vs-still check belongs in short_qa.py. **Priority:** CRITICAL.
