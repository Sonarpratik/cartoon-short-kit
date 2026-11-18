# Start here (for Claude)

## Read order
1. `CB_RULES.md`, section 11 first. It is the lean pipeline and the token rules.
2. `SKILL.md`: read the headings first, then the parts you need.
3. The lead reads all of `CB_RULES.md`. A helper reads only its own slice in `rules/dept/` (see `rules/dept/INDEX.md`).
4. Rebuild the slices with `python tools/slice_rules.py` after any rule change.

## The lean pipeline in 6 steps
1. Pitch three true stories. The user picks one.
2. Script, facts and sources. Voice lines with a style tag on every clause. Then the picture plan (`templates/PICTURE_PLAN.md`).
3. Look bible, cast and sets. Hero props are built first. Helpers work in parallel, each with its rule slice.
4. The one gate: the whole film as a rough board, plus the hook moving. The user approves it, or says what to change.
5. After the gate, Claude works alone: build, render on the GPU (`render_gpu.mjs`), sound, grade, join. Measure numbers before looking at pictures. A fix round uses a fresh helper.
6. Final film, `YOUTUBE.md` with titles, and the token report.

## Example film
`examples/lightning-spear/` holds the docs and code of one finished film: script, cast, look bible, picture plan, edit list, briefs, sets, grade, join and sound mix. It has no frames, no video and no audio. Copy its layout for a new film in `episodes/<name>/`.
