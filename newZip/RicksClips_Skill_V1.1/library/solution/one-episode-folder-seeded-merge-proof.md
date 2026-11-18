# solution: merge stretch folders into one episode folder and prove it pixel-identical with --seed 1 (GOLDRUSH 2026-11-15)

**What:** merge the stretch folders' sets into one sets/ with place keys (pitfall/sibling-stretch-folders-copied-sets.md), then
render the same 2 frames per stretch at scale 0.5 from the old folder and from the merged folder, both with `--seed 1`
(render_gpu option), and diff. Goldrush result: all 7 stretches mean 0.0000, max 0-1 grey level = PASS.
**Why the seed:** the kit draws some things from Math.random, so unseeded repeats of the SAME old folder already differ
(s7 mean 2.81 / 1.65, s2 0.12 / 0.05). Without a seed a real regression hides in that noise.
**Bugs the proof caught:** a ternary inside a colour string in the store.js heap rocks (s2 mean 5.8 / 17.7); a hit-flash
sprite created in s5 mode shifted Math.random (UUIDs) and moved the moths (s5 max 145). Rule from it: creating an extra object
changes every later random draw; keep the random order identical across modes.
**Detect / gate:** any refactor of sets, cast or folders = seeded before/after stills, mean < 0.01 and max <= 1 per stretch.
Also use `--seed 1` for every before/after comparison (flicker fixes did the same).
