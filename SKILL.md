---
name: cartoon-short-review
description: Create original vertical cartoon shorts with Canvas2D characters in a Three.js world. Plan props from the script, review scene frames, apply scene-specific corrections, and capture the full video with Playwright and FFmpeg only after the user requests generation.
---

# Cartoon short with scene review

Bundled Three.js renderer with Canvas2D cartoon characters. Start from an idea, a script or uploaded narration. Output is 1080x1920 at 30 fps, timed to the narration. **Default length is 20–30 s** unless the user asks otherwise. The reference channel's ~60 s median in STYLE_BIBLE.md is a measurement, not our default.

Read [references/README.md](references/README.md) first: it says which reference to use for what, and which material is historical.

## Priorities (highest first)

1. **Workflow gate.** Show scene frames, accept corrections, stop. Render the full video only when the user explicitly says generate, render, make the video or go. Corrections touch only the named scenes.
2. **Faces to camera.** No back views and no over-the-shoulder shots. Characters stay within ±60° of facing the camera (±90° hard limit). Use `frontSafeYaw()`. The stills capture fails on back views. → [character-design.md](references/character-design.md)
3. **Distinct, dressed cast.** Design each story's cast from `WARDROBE` (10 hair styles, 9 headwear, 8 garments, 5 patterns, collars/ties/scarves/badges, face accessories). Run `castDistinctness()` and fix every clash. Costume shows job, era and status. → [character-design.md](references/character-design.md)
4. **A world, not a room.** Write a world concept: a signature set-piece, at least 3 distinct locations, a scale ladder (aerial wide → action → prop macro) and a light arc across the story. → [scene-design.md](references/scene-design.md)
5. **Alive in every shot.** Keep the rig's micro-motion on (breathing, weight shift, saccades, irregular blinks, hair follow-through). Add expression changes on cues, reactions from listeners, and at least two moving ambient elements per shot. → [scene-design.md](references/scene-design.md)
6. **Camera by beat.** Hook = fast burst then hold; setting = slow glide; escalation = short bursts between holds; mystery = slow creep; explanation = holds and drift; payoff = snap then still hold. About 80% of frames are holds. Prefer travel and motivated transitions over hard cuts. → [camera-guide.md](references/camera-guide.md)
7. **Lighting and detail.** Motivated sources per location, readable faces, grounded shadows, detailed midground dressing, clear action area. → [lighting-guide.md](references/lighting-guide.md), [physical-staging.md](references/physical-staging.md)

## Never

- Show a character's back, or frame an over-the-shoulder shot.
- Give two characters the same head silhouette *and* the same garment, or give anyone a plain single-colour torso with only buttons when the story gives them a job.
- Start a cast from the legacy `CHARACTER_ARCHETYPES` office set.
- Reuse one room, shelf, desk or wall layout across locations, or default to front-on desk framing.
- Leave a shot with nothing moving in the background, or a character frozen for more than ~2 s.
- Glide the camera continuously through every shot with symmetric easing, or orbit/wobble for no reason.
- Clutter the action area: faces, acting hands and the hero prop stay unobstructed.
- Copy reference characters, stories, shots or text, or deliver reference images. Use no real living people, brand mascots or logos as characters.
- Add captions unless asked (then use the karaoke style in [karaoke-guide.md](references/karaoke-guide.md)). In-world signs must read correctly.
- Render the full video without an explicit instruction.

## Persistent visual style

- Off-white faces (#faf9f5) with key-side pearl light inside the head contour; small round pupils under thin lidded eye curves, rounded brows, compact curved mouths.
- Tapered glossy reflection on hair and headwear (`CharacterPen` in `face-style.ts`); narrow contour-following rim on clothing.
- Painted 3D world with ink outlines, saturated sky, depth of field on backgrounds, warm key and cool shadows.
- Hair uses the authored 12-angle designs in `angle-designs.ts` (the 3D hair mesh experiment stays inactive).

## Characters and the library

- Saved cast lives in `character-library/cast.json`; finished projects keep frozen snapshots in `projects/<project>/character-references/`. Never overwrite an approved design; save variants under new IDs.
- Stored characters and archived project code (`projects/<project>/character-references/final/`) are opt-in only: never reuse them in a new short unless the user explicitly names the project or character. Otherwise design a fresh cast. After finishing a story run `node character-library/archive-project-code.mjs`.
- Review the cast in Character Studio (`npm.cmd run characters`, http://127.0.0.1:8787) at on-screen size before staging. Save sheets with `node character-studio/save-turnarounds.mjs`.
- Snapshot the selected cast into a new project with `node character-library/snapshot.mjs projects/<story> <id> ...`. After changing shared renderer code and checking it, run `node character-library/preserve-shared.mjs`.
- `templates/bridge/` is the single source of truth for renderer code. `character-library/shared/` is a checked backup copy.

## Use the bundled project

Resolve paths relative to this SKILL.md. For a new video, copy the project to a story folder (exclude node_modules, .npm-cache, dist, out, frames) and work there. Requirements: Node 22.6+, npm, Python with NumPy, SciPy and Pillow, FFmpeg, Playwright Chromium. On Windows use npm.cmd/npx.cmd.

```powershell
npm.cmd install
npx.cmd playwright install chromium
npm.cmd run dev
```

The 3D preview is at http://127.0.0.1:8788. Set CHROME_PATH to use an existing Chrome; PREVIEW_URL selects another preview server.

| File | Responsibility |
|---|---|
| templates/bridge/director.ts | WARDROBE, castDistinctness, camera helpers, CAMERA_PACE, easing |
| templates/bridge/character-rig.ts | drawCharacter, 12-angle views, micro-motion, accessories, frontSafeYaw |
| templates/bridge/toon.ts | Pen API, bodies, garments/patterns, faces, expressions, fx sprites |
| templates/bridge/angle-designs.ts | Hair and headwear per view angle |
| templates/bridge/props.ts | createProp: crate, barrel, bench, table, desk, shelf, cabinet |
| templates/interior/ | Detailed reusable rooms and furniture |
| templates/bridge/lighting.ts, cardshade.ts, shade.ts, lights.ts, grade.ts, sky.ts | Light, face highlights, window projection, sky, colour |
| templates/bridge/paint.ts, build.ts, staging.ts | Painted materials, buildings, enclosed rooms, roads |
| templates/bridge/world.ts, story.ts, cast.ts, player.ts | Bridge worked example: world, shots, staging, deterministic player |
| templates/scripts/bridge-stills.mjs | Playwright frame capture with the no-backs gate |

The bridge story is a worked example. Do not reuse its setting, cast or camera coordinates. Optional Kenney GLB files go in public/bridge/kenney/ (not bundled).

## 1. Intake, ideas and script

If narration is attached, use it. Otherwise establish whether the user has narration, a script, or needs ideas. For ideas, offer ten numbered options with title, hook, twist, visual moments, and whether the account is documented, disputed or folklore; verify historical claims with web tools.

Script formula (STYLE_BIBLE.md): paradox hook in sentence one → 1–2 lines of concrete setting → 3–6 escalating beats → one mystery question → "You see," explanation → short ironic payoff that ends the video. About 3.7 words per second. Return a copyable script, word count, estimated duration and a short visual plan. Have the user supply or approve narration before timing. Request clean speech without music.

## 2. Plan the world, cast and scenes

Write `work/PLAN.md` before coding:

1. **World concept** (scene-design.md): set-piece, location list, scale ladder, light arc.
2. **Cast table** (character-design.md): each character's hair/hat, garment, pattern, accents and why, plus the `castDistinctness()` result.
3. **One row per scene**: S01 etc., global start/end frames, spoken words, location, camera beat type and move, characters with front-safe headings and actions, hero prop, midground dressing, two ambient-life elements, light source/direction/colour/time, sound cue.

Infer props from the narration; ask only about ambiguous story-critical details. Plan each distinct room or outdoor place separately, and verify each through its final camera.

## 3. Timing and scene implementation

- Get word timestamps from a transcription tool, or align the script to measured pauses and verify. No timing.py is bundled. Set FPS and TOTAL from the narration; update picture and audio timelines together.
- Split the story into scene modules (e.g. `scenes/S01.ts`) wired into the story/world/cast dispatchers, so corrections stay isolated. Scene-local overrides must actually be consumed by the renderer.
- Use frame numbers and seeded randomness for all animation. Drive `expression`, `fromExpression` and `expressionAge` from the timeline, 0–3 frames before the word.
- **Expression-change reaction (jaw woggle).** Every expression change plays the Second Draw beat automatically from the shared rig (`reactionBlink` + `reactionSquash` in `character-rig.ts`): 2-frame eye squeeze, 2–3-frame head squash with the jaw spreading wide, a slight tall overshoot, then a ~4-frame settle (done by 0.6 s). Always pass `fromExpression` and `expressionAge` so it fires; change expressions on story beats, not every few frames. Check it with a 16-frame strip around one change before generating. See character-design.md §6.
- Do not claim caching or resume unless implemented and verified in that project.

## 4. Review frames, then stop

Start the preview server and capture each scene's first, middle and last frames plus key action frames:

```powershell
npm.cmd run stills -- review/S03/f 120,150,179 1
```

Frame arguments are global frame numbers. A non-zero exit with `*back-views.json` means a character was drawn from behind: restage before review.

Before sending, check: faces visible and front-facing; cast readable as different people; each scene in a visibly different place or composition from the previous one; something moving in the background; hand/prop contact; floating feet; mirrored signs; camera collisions; excessive blur; clipped colour. Compare against `references/sheets/` locally (never include reference images in deliveries).

Make labelled review sheets (e.g. `review/S03_v1.jpg`), track scene range, words, version and status in `work/REVIEW.md`, deliver the sheets, explain how to request corrections by scene, and stop. Apply corrections only to named scenes, save a new sheet version, and stop again.

## 5. Generate after explicit instruction

```powershell
npm.cmd run stills -- frames/S03/f 120-179 1
ffmpeg -framerate 30 -i frames/all/f%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p out/video.mp4
```

Capture approved scenes into separate folders by global range, then assemble a contiguous `frames/all/f0000.jpg…` sequence without reordering or duplicating boundary frames. The capture script does not resume.

Audio: music at 50% of narration's gated RMS (−6.02 dB); SFX at or below that with peaks under the voice; one final common gain and limiter if needed; no ducking that changes the relative levels. `templates/audio/mix.py` is the original bridge-specific mixer (with ducking and fixed timing): adapt it or write a project mixer and measure the result.

Mux, then check duration, black/frozen frames, sync and loudness with `templates/scripts/short_qa.py`. Deliver the MP4 with a concise scene list. Post-render corrections return to scene review first.
