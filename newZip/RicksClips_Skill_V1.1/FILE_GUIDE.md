# What to keep and what can go (skill folder, updated 2026-11-09)

Start here: SKILL.md section "THE PIPELINE", then `WORKFLOW.md` (the steps) and `DENSITY_RULES.md` (the density rules). After changing SKILL.md, run `python tools/refresh_installed_skill.py`: this folder is the master copy.

Rule of thumb: **never delete, move to `_archive\` instead**, and empty the archive only after the OneDrive backup has it.
Ask me before a big clean-up and I'll tell you what is safe.

## Keep: these are assets (hard or slow to rebuild)
- `SKILL.md`, `HANDOFF.md`, `UPGRADE_PLAN.md`, `WHAT_IT_TAKES.md`, `NEXT_PROMPT.txt`: the rules and plans.
- `references\reports\`, `references\remeasure\`: all the measurements of his videos.
- `references\frames\` and `references\video\`: the reference frames (re-extracting takes time).
- `rick-shorts\src\`, `package.json`, `package-lock.json`: legacy Remotion code. It renders nothing since the toon.ts characters were removed on 2026-11-09 (a re-render of Onoda needs the copy in OneDrive `RicksClipsBackup\old_character_styles_2026-11-09\` put back). Safe to delete if Onoda will never be re-rendered.
- `tools\` (measure scripts and density checks), `templates\`, `library\`.
- Per episode, in `episodes\<name>\`: SCRIPT, **`film.json`** (the whole film in one file), voice audio, `words.json`, `out\lock\` (the frozen sets, cards and camera), the music/sfx mix, Blender build scripts,
  `.blend` files, character cards, the **final mp4**, thumbnail and metadata.
- `Downloads\FINAL\`: the delivered videos.

## Safe to delete (rebuilds by itself)
- `C:\remotion-tmp\` (Remotion's temp bundles).
- `rick-shorts\node_modules\` (about 1 GB; `npm install` brings it back exactly).
- `rick-shorts\out\` test stills and test renders, once the episode is delivered.
- Frame sequences (`frames_*`, `render_*` folders of PNGs) once the final mp4 has been checked.
- `episodes\<name>\out\plan\`, `out\storyboard*`, `out\animatic*`, `film_check\`: all rebuilt from `film.json` in minutes.
- `templates\threejs_film\node_modules\` if present (`npm install` brings it back).
- `*.blend1` files (Blender's automatic previous-save copies).

## Why it matters
The Night Witches folder was the only copy of the build scripts, cards and sound, so after it was deleted on Nov 6 the
episode had to be rebuilt from scratch. With the keep-list above (and OneDrive backups) a new episode starts from a
working base instead of zero.

## Locked look (2026-11-09)
- `templates/blender_look/` the reusable look package every episode imports. Keep.
- `episodes/_test_market_day/` the worked example of the package. Keep `build.py` and `cards/`.
- `references/look_locked/` the CB-approved stills. Keep.
- `tools/check_episode.py`, `tools/measure/look_3d.py`, `references/measure/gates_3d.json` the checks. Keep.

Density rule for empty cells (CB 2026-11-09): empty cells at or below his median for that light (night 18.8 %, day, golden and interior 14.6 %), measured with density_check.py --style 3d.

CB 2026-11-09: SKILL.md is the main skill for ALL Ricks Clips animation; its FULL WORKFLOW and MAIN LOOK apply to every episode. Blender materials are created in Step 5 from templates/blender_look/materials.py.

## Pipeline (2026-11-09 audit)
- `tools/film_plan.py`, `tools/check_film.py`, `tools/measure/film_motion.py`, `references/measure/gates_film.json`: the film gates. Keep.
- `templates/threejs_film/` the storyboard and animatic kit, `templates/film_example/` the plan that passes every gate, `templates/blender_look/from_lock.py` the bridge to Blender. Keep.
- `agents/` the camera director and the storyboard judge. Keep (the refresh script installs them).
- `episodes/_test_film_lock/` the Blender transfer proof of 2026-11-09 (lock zip, test script, four stills). Safe to delete; the result is written in `references/reports/PIPELINE_AUDIT_2026-11-09.md`.
- `references/skill_legacy/` older rules that no longer steer production. Keep for history; never follow them.
- `references/reports/_backup_2026-11-09_pipeline_audit/` the files as they were before the audit. Keep until the first episode on the new pipeline is delivered.
