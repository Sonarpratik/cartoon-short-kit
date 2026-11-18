# pitfall: calling a paid generation tool with a guessed parameter name silently charges for the wrong output — HIGH (earned EP01)

**Symptom:** text_to_speech charged 1529 credits and returned the DEFAULT voice ("Hannah") instead of the
mandated facty voice — the guessed parameter `reference_id` was silently ignored (real name: `voice_id`).
**Cause:** the tool's schema was deferred/unloaded; the call was made from memory of a similar API.
**Fix:** ALWAYS load a paid generation tool's schema (ToolSearch select:) and read its parameter names
before the first call; verify the result echoes the requested voice/model before using the output.
**Detect:** every TTS/gen result names the voice/model used — compare to the request in the same turn.
**Permanent rule:** no paid call on a guessed schema. **Also learned:** facty voice natural pace ≈ 2.5 w/s
(s2.1-pro); drama-3 with [fast] direction came out SLOWER (122 s vs 95 s) — acting mode stretches; the
working recipe is s2.1-pro + internal-pause tightening + atempo ≤ 1.35. **Priority:** HIGH.
