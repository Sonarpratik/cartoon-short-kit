# pitfall: `<primitive dispose={null}>` breaks video renders [adopted] — CRITICAL

**Symptom:** `fx.ink.dispose is not a function` when the React tree remounts mid-render (video only; stills fine).
**Cause:** R3F copies the `dispose={null}` prop onto the pass object itself, overwriting the class method.
**Fix:** never call `obj.dispose()` on a pass used via `<primitive dispose={null}>`; call the class method:
`InkPass.prototype.dispose.call(fx.ink)`. Applied in rick-shorts Bridge.tsx (2026-11-04).
**Detect:** grep for `\.dispose\(\)` on any object also rendered via `<primitive`; render a 2-shot video span crossing a remount.
**Root cause:** R3F prop-forwarding semantics on primitives. **Permanent rule:** prototype-call dispose for composer passes.
**Automation:** add the grep to the pre-render QA script. **Priority:** CRITICAL.
