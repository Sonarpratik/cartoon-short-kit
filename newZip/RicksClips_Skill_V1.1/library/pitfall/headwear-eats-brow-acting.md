# pitfall: under a hat brim, brow-only expressions collapse into each other — MEDIUM (earned EP01 performance pass)

**Symptom:** two consecutive expression keys on a hatted character rendered as the SAME face
(Eli's "checked" vs "quiet.", Bigelow's "I" vs "built"), even though the Expr names differ.
**Cause:** `faceFront`'s hairline clamp holds brows below the hat/hair line, so a raised-brow
expression cannot raise. Pairs that differ only by brow angle (incredulous vs angry, serious vs
pensive) are identical under a low brim.
**Fix:** for a HATTED character, distinguish consecutive keys by EYE KIND or MOUTH KIND, never brow
angle alone. (EP01: "quiet." became `curious` — wide eyes + small open talk-o, which also reads the
word better; "built" became `wtf` — one eye blown wide.)
**Detect:** render the character's consecutive expression keys as a 3-up strip BEFORE animating —
the strip exposes collapsed pairs in one render. `PerfTest` composition in rick-shorts does this.
**Creativity gap:** the clamp is also an opportunity — a character who removes the hat gets a whole
second register of brow acting, which could mark the one beat where a character drops their guard.
