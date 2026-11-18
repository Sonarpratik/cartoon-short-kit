# pitfall: a video render running beside a stills batch silently kills the batch — MED (earned here)

**Symptom:** bridge-stills.mjs exits early (24 of 90 stills) with no error in the filtered output; downstream
steps fail on missing files.
**Cause:** a full `remotion render` (30+ Chrome processes) starves the stills renderer's Chrome of RAM/CPU;
it dies mid-loop.
**Fix:** serialize — never run a video render and a stills batch at once; stop one (TaskStop) before the other.
**Detect:** compare the rendered-still count to the requested frame list length before any step that consumes them.
**Permanent rule:** one Chrome-based render job at a time per machine. **Automation:** the count check is one line
in any batch script. **Priority:** MED.
