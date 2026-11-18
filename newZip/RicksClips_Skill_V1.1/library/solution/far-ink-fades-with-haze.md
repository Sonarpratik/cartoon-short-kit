# solution: far ink fades with the haze [adopted, verified against our measurements]

**What:** the reference's world ink is ~2.5-3 px near/mid but FADES toward the horizon and drops off far
architecture entirely; ours stayed constant to the horizon, which is exactly why our frame-wide edge-ink
coverage measured +14 % over the reference for four rounds.
**Why it works:** ink is a near-field clarity device; at distance the haze owns the image. Constant far ink
reads mechanical.
**Pattern:** ink.ts fadeNear 90, fadeFar 260, farOpacity 0.7 (applied 2026-11-04); verify edge-ink coverage
returns to ~45 % on the next full sample.
