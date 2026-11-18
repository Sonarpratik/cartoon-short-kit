# Learning library — how we get better with every episode (CB rule, 2026-11-04)

One markdown file per note in `library/<kind>/`. Kinds:
- **pitfall** — something that went wrong. Fields: Symptom, Cause, Fix, Detect (how to catch it
  automatically), Root cause, Permanent rule, Automation opportunity, Priority (CRITICAL/HIGH/MED/LOW).
- **solution** — a reusable technique that worked (what, why it works, reusable pattern).
- **recipe** — a story/staging structure that worked.
- **module** — a reusable prop/set/effect (code path or GLB).

## The loop (non-negotiable)
1. **BEFORE every episode and every big step:** read `INDEX.md`, open every note whose tags match.
2. **THE MOMENT something breaks and gets fixed:** write the pitfall right away — not at the end.
3. **AFTER every episode:** harvest — new solutions/modules/recipes, one line each into INDEX.md.
4. **A fix seen twice becomes code**: a kit helper, a preset, or a check in `tools/qa/` (the Detect
   line of every pitfall is written so a script can test it).
5. Never delete a note — supersede it (note the replacement in both files).

Provenance: notes marked [adopted] were taken from CB's production library (claude-animated-shorts)
after verification; everything else was earned here.
