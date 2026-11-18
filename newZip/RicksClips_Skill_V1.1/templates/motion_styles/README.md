# Motion styles: funny movement library for the vector puppets (CB 2026-11-10)

Rule: SKILL.md, "Character movement: always funny, matched to the scene".

- `library.mjs`: `LIB` (every style with action, feelings, energy 1-3, views, module, style key), `pick({ action, feeling, energy, view, persona, avoid })`, `actionFromText(line)`.
- `moves/*.mjs`: one file per action, three styles A/B/C. Each style is `pose(t, ch)` returning a pose for `rig.mjs`. A second export named `front` holds the front view where it exists.
- `rig.mjs`: draws the locked puppet (`../vector2d_characters/code/`, unchanged) with its own planted, bending legs. Pose keys are listed at `drawPose`.
- `stage.mjs`, `render.mjs`: three panels side by side. `node render.mjs moves/walk.mjs out/walk.mp4`, `node render.mjs moves/act_sleep.mjs#front out/sleep_front.mp4`, stills with `--still 0.5,1.2`. Needs Node with `playwright` and `ffmpeg` on the path.

Limits of the puppet that every move must respect: the arm is about 209 units long, so hands cannot reach above the head or down to a low object; place objects where the hand ends (`grip()` in `moves/act_push.mjs`). The head is about 150 units in radius; check it against props when the body leans.
