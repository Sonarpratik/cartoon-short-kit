# Window lighting and set detail review

The user requested visible window light on walls/furniture, a lit inner edge on white character heads, more detailed props/backgrounds, and persistent defaults in the shared skill/templates.

Implemented a softened world-space window-grid projector, aligned directional key and prop shadows, warm/cool inner head highlights, side-window frames, wall panels, shelf brackets/contents, desk drawers/pulls/stretchers, tape-reel details and shredder vents/status light. The interrogation shelf is moved clear of its sign. The shared library now includes desk, shelf and cabinet helpers plus more detailed tables.

Shared SKILL.md, visual-guide.md and lighting-guide.md record the preferences for future projects. Two private face-light study frames are stored in references/lighting; the user's inline workshop/red-cap screenshots are described in the guide, not stored as exact image files. All reference material remains private.

Validation: root and MKUltra production builds pass. Shared browser player renders day/golden frames without shader or page errors. All 31 project review frames across nine scenes render without shader or page errors at 1080x1920. Skill validation and git diff whitespace check pass. Visual review checks source direction, surface patterns, legible faces and unobstructed signs.

Final review: review/overview_v4.jpg and review/mkultra-lighting-review-v4.zip. Compare against v2 (S07/S09 against v1). Prior sheets are preserved.

This revision has not been exported as a full video. out/final.mp4 remains the earlier completed export. Narration, duration and scene frame boundaries are unchanged. Await an explicit generation request under the skill's review-first workflow.

Implementation limit: one directional, world-space stylised window projector; not volumetric light or arbitrary multi-window ray tracing. New room layouts must align the opening, key and projector and inspect blockers to avoid light leaks.
