---
name: cartoon-short-review
description: Create original vertical cartoon shorts with Canvas2D characters in a Three.js world. Plan props from the script, review scene frames, apply scene-specific corrections, and capture the full video with Playwright and FFmpeg only after the user requests generation.
---

# Cartoon short with scene review

Bundled Three.js renderer with Canvas2D cartoon characters. Start from an idea, a script or uploaded narration. Output is 1080x1920 at 30 fps, timed to the narration. **Default length is 20–30 s** unless the user asks otherwise. The reference channel's ~60 s median in STYLE_BIBLE.md is a measurement, not our default.

Read [references/README.md](references/README.md) first: it says which reference to use for what, and which material is historical.

## Priorities (highest first)

1. **Workflow gate.** The cast is picked or created and approved by the user BEFORE any scene is built (§2b). Then show each version's scene clips and frames, accept corrections, stop. Render the full video only when the user explicitly says generate, render, make the video or go. Corrections touch only the named scenes.
2. **Faces to camera.** No back views and no over-the-shoulder shots. Characters stay within ±60° of facing the camera (±90° hard limit). Use `frontSafeYaw()`. The stills capture fails on back views. → [character-design.md](references/character-design.md)
3. **Distinct, dressed cast.** Design each story's cast from `WARDROBE` (10 hair styles, 9 headwear, 8 garments, 5 patterns, collars/ties/scarves/badges, face accessories). Run `castDistinctness()` and fix every clash. Costume shows job, era and status. → [character-design.md](references/character-design.md)
4. **A world, not a room.** Write a world concept: a signature set-piece, at least 3 distinct locations, a scale ladder (aerial wide → action → prop macro) and a light arc across the story. → [scene-design.md](references/scene-design.md)
5. **Alive in every shot.** Keep the rig's micro-motion on (breathing, weight shift, saccades, irregular blinks, hair follow-through). Add expression changes on cues, reactions from listeners, and at least two moving ambient elements per shot. → [scene-design.md](references/scene-design.md)
6. **Camera: the reference approach.** One camera idea per film, taken from the story's own mechanism. The camera moves nearly all the time; a rest is a slow push that lands on the narrated word, never a frozen frame. Every shot pushes in 30–100 % (pull back only for reveals). Scenes join with a move (`whip`, `push`, `blend` in `transitions.ts`), at most one deliberate hard cut per short. With a character in frame the lens sits between chest and eye, at most 10° looking down; high and top-down views only with no character in frame, craning down as one enters. Check with `camera-report.mjs` before review. → [camera-guide.md](references/camera-guide.md)
7. **Lighting and detail.** Motivated sources per location, readable faces, grounded shadows, detailed midground dressing, clear action area. **Ask the user which light scheme the short uses** before building sets: ours (default: current lighting, shaders and the dark cinematic grade) or the Rick scheme ([rick-light-scheme.md](references/rick-light-scheme.md)). Never mix them in one short. → [lighting-guide.md](references/lighting-guide.md), [physical-staging.md](references/physical-staging.md)
8. **Props with real detail.** Build the hero object first, alone, with real parts in the geometry (count the parts, five details per main object), real materials, a readable story mark and story lettering. Held props are real 3D objects gripped by the round fist. → [prop-detailing.md](references/prop-detailing.md)

## Never

- Show a character's back, or frame an over-the-shoulder shot.
- Give two characters the same head silhouette *and* the same garment, or give anyone a plain single-colour torso with only buttons when the story gives them a job.
- Start a cast from the legacy `CHARACTER_ARCHETYPES` office set.
- Reuse one room, shelf, desk or wall layout across locations, or default to front-on desk framing.
- Leave a shot with nothing moving in the background, or a character frozen for more than ~2 s.
- Freeze the camera, hard-cut between scenes (one deliberate cut per short at most), look down more than 10° at a character, or orbit/wobble for no reason.
- Build a prop as a plain box with a pattern on it, draw a held prop inside the character card, or fill a sign with filler words.
- Clutter the action area: faces, acting hands and the hero prop stay unobstructed.
- Copy reference characters, stories, shots or text, or deliver reference images. Use no real living people, brand mascots or logos as characters.
- Add captions unless asked (then use the karaoke style in [karaoke-guide.md](references/karaoke-guide.md)). In-world signs must read correctly.

Place, date and year cards are not captions: use the user-approved documentary card (typewriter title, small date line above, rule) from [caption-guide.md](references/caption-guide.md) / `templates/overlays/doc-caption.ts`.
- Render the full video without an explicit instruction.

## Acting and story rules (one line each)

- **No teleport, no morphing.** A character or prop changes place only by a move the viewer sees (walk, climb, carried, pushed) or across a scene join; nothing pops, slides or fades to a new spot inside a shot. Check every place change in the preview and name the move.
- **One motivated habit per significant action:** tongue out of one mouth corner while concentrating, one eye squinted while aiming, head tilt while thinking. It comes from what the character is thinking, never a random add-on.
- **Gags from the situation.** In every scene look for a visual joke in the character's goal, props or place, without waiting for the script to ask: the same action is played by feeling (a proud walk struts, a scared climb hugs the ladder).
- **One signature detail per character:** a small, fixed, odd detail (a patch on one sleeve, a bent hat brim, one odd button), written in the cast table and present in every scene, so drift is easy to spot.
- **The ending is the hero's punchline face** (smug, arms crossed) in front of the result. No moral or trivia after the reveal.
- **Big beats change the world:** the big word gets an effect that alters the scene (the ground cracks, rain falls in sheets, the sky fills with smoke trails), not only a small overlay.
- **Crowds and sides:** each side of a conflict has its own colours and a banner symbol, so the viewer knows who is who without words.

## Persistent visual style

- Off-white faces (#faf9f5) with key-side pearl light inside the head contour; small round pupils under thin lidded eye curves, rounded brows, compact curved mouths.
- Tapered glossy reflection on hair and headwear (`CharacterPen` in `face-style.ts`); narrow contour-following rim on clothing.
- Painted 3D world with ink outlines, saturated sky, depth of field on backgrounds, warm key and cool shadows.
- Hair uses the authored 12-angle designs in `angle-designs.ts` (the 3D hair mesh experiment stays inactive).
- **One character engine (since 2026-11-19): the puppet engine** (`templates/bridge/puppet.ts`), built on the Ricks Clips kit code in `newZip`. Every saved character uses it (`look: 'ricks'`; Ricks Clips characters via `rc`). Four views (front, 3/4, side, back), brush-ink bodies and heads, ink-stick limbs. Per character: `figure` (body form, head shape, head size, body size, leg length, limb thickness, arm length; sizes S M L XL XXL XXXL, L = standard), `faceCat` (face category: Male, Female, Child, Elder, Villain, special eyes, creatures), `props` (any prop on anyone: Head, Face, Back, Body, Held), `noParts` (built-in parts removed). Expressions are the character's face-category bucket (all emotions in that category + its special faces). Our older 12-angle rig (`character-rig.ts`) stays for finished shorts and for a design without `look`.

## Characters and the library

- Saved cast lives in `character-library/cast.json`; finished projects keep frozen snapshots in `projects/<project>/character-references/`. Never overwrite an approved design; save variants under new IDs.
- Stored characters and archived project code (`projects/<project>/character-references/final/`) are opt-in only: never reuse them in a new short unless the user explicitly names the project or character. Otherwise design a fresh cast. After finishing a story run `node character-library/archive-project-code.mjs`.
- Review the cast in Character Studio (`npm.cmd run characters`, http://127.0.0.1:8787) at on-screen size before staging. Save sheets with `node character-studio/save-turnarounds.mjs`.
- Snapshot the selected cast into a new project with `node character-library/snapshot.mjs projects/<story> <id> ...`. After changing shared renderer code and checking it, run `node character-library/preserve-shared.mjs`.
- `templates/bridge/` is the single source of truth for renderer code. `character-library/shared/` is a checked backup copy.

## Use the bundled project

Resolve paths relative to this SKILL.md. For a new video, copy the project to a story folder (exclude node_modules, .npm-cache, dist, out, frames) and work there. Requirements: Node 22.13+ (26 LTS works), npm, Python with NumPy, SciPy and Pillow, FFmpeg, Playwright Chromium. On Windows use npm.cmd/npx.cmd.

```powershell
npm.cmd install
npx.cmd playwright install chromium
npm.cmd run dev
```

The 3D preview is at http://127.0.0.1:8788. Set CHROME_PATH to use an existing Chrome; PREVIEW_URL selects another preview server.

| File | Responsibility |
|---|---|
| templates/bridge/director.ts | WARDROBE, castDistinctness, camera helpers (pushIn, eyeLevelPose, craneDown), CAMERA_PACE, easing |
| templates/bridge/transitions.ts | Scene joins (whip, push, blend), JoinCompositor, camera probe and camera report |
| templates/scripts/camera-report.mjs | Camera numbers for a whole short from poses only: hard cuts, push-in per shot, look-down at characters |
| templates/bridge/puppet.ts | The character engine: drawCharacter for puppet characters (4 views, figure, face categories x emotions, props, Ricks Clips moves + walk/normal, walk/slow in every direction), expressionsFor, describeCharacter, puppetBusy/puppetSettled |
| templates/bridge/character-draw.ts | drawAnyCharacter (puppet or our rig, chosen by the design) and settleFrame; registers the player's frame-settle hook |
| templates/vite.puppet.config.mjs | Copy to projects/<story>/vite.config.mjs: /vendor/rc alias to newZip, dev-server access, esnext build |
| templates/bridge/character-rig.ts | Our older 12-angle rig (finished shorts, designs without `look`): drawCharacter, micro-motion, accessories, frontSafeYaw |
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
2. **Light scheme** (ask the user: ours or Rick). With the Rick scheme, add its light table: one named light kind per chapter with key, fill and notes, the signature constant light, the palette and its one story accent (rick-light-scheme.md §2).
3. **Camera idea and hero moments** (camera-guide.md §2): one camera idea from the story's mechanism, why it fits, its signature move, and the camera event on the hook, the turn and the payoff.
4. **Hero object sheet** (prop-detailing.md): the hero object and 2-3 supporting props, five details each, materials per part, the story mark, the lettering; every held prop and who holds it.
5. **Cast table** (character-design.md): each character's hair/hat, garment, pattern, accents, signature detail and why, plus the `castDistinctness()` result.
6. **One row per scene**: S01 etc., global start/end frames, spoken words, location, camera move and the word it lands on, the push-in, the join into the next scene (whip, push or blend), characters with front-safe headings and actions, hero prop, midground dressing, two ambient-life elements, light kind (or source/direction/colour/time), sound cue.

Infer props from the narration; ask only about ambiguous story-critical details. Plan each distinct room or outdoor place separately, and verify each through its final camera.

## 2b. Cast gate: pick or create the characters, then stop

No scene module, set or review frame is built before the user approves the cast.

1. **List the roles** from the script: every character who appears, with their job in the story, era, age and build, and the feeling they mostly play.
2. **Ask the user, per role: create or pick?**
   - **Create new** (the default): design it in Character Studio (Look: Ricks Clips puppet) from the wardrobe, then its Figure, Face category and Props; saved to `character-library/cast.json` under this project.
   - **Pick an existing character:** only one the user names (stored characters are opt-in, never suggested by default). This includes the 150 Ricks Clips library characters (project `ricksclips`); they draw in scenes through the same puppet engine.
3. **Design or load each character** in Character Studio (`npm.cmd run characters`, http://127.0.0.1:8787; restart a stale server first). For each: costume that shows job, era and status, the signature detail, and the "why" from the cast table. Run `castDistinctness()` and fix every clash.
4. **Cast review folder** `review/v0_CAST/`: one cast sheet with everyone side by side at on-screen size, each character's turnaround (`node character-studio/save-turnarounds.mjs`) and a short action strip (walk, the main action of their role, two expressions). `CAST.md` lists each character: role, design choices, signature detail, created or picked, and my suggestions (numbered, not applied).
5. **Stop.** Deliver the folder and wait. Change only the characters the user names, save a new cast version (`v1_CAST`...), and stop again.
6. **After approval:** snapshot exactly the approved IDs into the project (`node character-library/snapshot.mjs projects/<story> <id> ...`). Only then start §3.

## 3. Timing and scene implementation

- Get word timestamps from a transcription tool, or align the script to measured pauses and verify. No timing.py is bundled. Set FPS and TOTAL from the narration; update picture and audio timelines together.
- Split the story into scene modules (e.g. `scenes/S01.ts`) wired into the story/world/cast dispatchers, so corrections stay isolated. Scene-local overrides must actually be consumed by the renderer.
- Use frame numbers and seeded randomness for all animation. Drive `expression`, `fromExpression` and `expressionAge` from the timeline, 0–3 frames before the word.
- **Puppet engine in a project:** copy `templates/vite.puppet.config.mjs` to the project as `vite.config.mjs` (set its port). Scene code draws every actor with `drawAnyCharacter(g, design, { yaw, time, action, expression, fromExpression, expressionAge })` from `character-draw.ts` on the 600 x 1000 card canvas. `action` is `idle`, `walk/normal`, `walk/slow` or any Ricks Clips move id (`sit/A`, `dig/B`...); `yaw` picks the view (0 front = walking towards camera, 45/315 three-quarter, 90/270 side, 180 back) for idle and moves; between those angles the figure narrows and swaps drawing at the halfway point, so animate `yaw` smoothly for a turn (a few frames per 45°). `expression` is a value from `expressionsFor(design)` (an emotion, a category special face `fam:...`, `own`, or `move` for the move's acting face). Importing `character-draw.ts` registers the settle hook, so the player's `renderFrame` returns a promise that resolves on a finished frame; capture scripts already `await` it. Never capture a puppet frame without awaiting renderFrame.
- **Expression-change reaction (jaw woggle).** Every expression change plays the Second Draw beat automatically from the shared rig (`reactionBlink` + `reactionSquash` in `character-rig.ts`): 2-frame eye squeeze, 2–3-frame head squash with the jaw spreading wide, a slight tall overshoot, then a ~4-frame settle (done by 0.6 s). Always pass `fromExpression` and `expressionAge` so it fires; change expressions on story beats, not every few frames. Check it with a 16-frame strip around one change before generating. See character-design.md §6. (Puppet characters play their own version: a short squash pop plus a blink on the change.)
- Do not claim caching or resume unless implemented and verified in that project.

## 4. Review a version, then stop

Each review round is ONE version folder, `review/v1_ALL_SCENES/` first, then `v2`, `v3`... It holds scene-by-scene animation clips, the review frames and sheets, and `REVIEW.md` with my suggestions. The user reviews it; nothing moves to the next version without the user's reply.

**No loops on my own.** Before a version is sent, fix only what is broken (a crash, missing frames, a failing check below, a camera-report FAIL). Do not run judge or fix rounds, re-render a version, or "improve" scenes between the user's reviews: put every idea in REVIEW.md as a suggestion instead.

1. **Camera numbers** (camera-guide.md §6): `node templates/scripts/camera-report.mjs <previewUrl> work/camera-report.json`. Fix every FAIL or write the scene's reason in `work/PLAN.md`.
2. **Scene clips:** one MP4 per scene with its slice of the narration, half size: `node templates/scripts/scene-clips.mjs review/v1_ALL_SCENES/clips --audio input/<voice>.wav` (PREVIEW_URL set to the project's preview). This is a review render; the final video still waits for "generate".
3. **Frames:** start the preview server and capture each scene's first, middle and last frames plus key action frames:

```powershell
npm.cmd run stills -- review/v1_ALL_SCENES/S03/f 120,150,179 1
```

Frame arguments are global frame numbers. A non-zero exit with `*back-views.json` means a character was drawn from behind: restage before review.

Before sending, check: faces visible and front-facing; cast readable as different people; each scene in a visibly different place or composition from the previous one; something moving in the background; hand/prop contact; floating feet; mirrored signs; camera collisions; excessive blur; clipped colour. Compare against `references/sheets/` locally (never include reference images in deliveries).

4. **REVIEW.md** in the version folder: an overview sheet, then one row per scene with its frame range, words, clip, sheet and status, and **my suggested changes** for that scene, numbered (`S03.1`, `S03.2`), one line each with the reason. Suggestions are not applied.
5. **Deliver and stop:** give the folder path, list the suggestions, explain how to reply per scene (approve, a change in their own words, or "do S03.2"), and stop.

**Next version (v2, v3 ...) only after the user's reply:** apply exactly what the user named (their own notes plus the suggestions they accepted), only to the named scenes. Re-render clips and frames for the changed scenes into the new folder and copy the unchanged scenes' clips and frames across, marked unchanged in REVIEW.md, so every version folder is complete. Then stop again.

## 4b. Finalise the scenes, then stop

When every scene in the latest version is approved, write `review/SCENES_FINAL.md`: the approved version per scene (S01 v2, S02 v1 ...), its frame range and clip. From now on the scenes are locked: no scene changes unless the user names one (it then goes back to §4 as a new version for that scene only). Stop and ask for the dummy video.

## 4c. Dummy video, check, corrections

The dummy is the whole short in one file, built from the finalised scenes, so the user can judge flow, timing and joins before the final render:
- Render every scene at half size with the scene-clip pipeline (`scene-clips.mjs`, same settings as the review clips) and join them in order into `review/DUMMY_v1/dummy.mp4` with the full narration track (no music, no subtitles, a small "DUMMY" corner mark).
- `review/DUMMY_v1/CHECK.md`: total duration vs the narration, each join (frame numbers and how it reads), sync spots, anything that only shows when played through, and my numbered suggestions (`D1.1`, `D1.2`), not applied.
- **Stop.** Corrections go back to the named scenes (a new scene version, §4 rules), then a new dummy (`DUMMY_v2`...). Only the user's "generate" (or "final") moves on to §5.

## 5. Final video with subtitles (only after explicit instruction)

The final render is full size from the finalised scenes, then the music/SFX mix, then the delivery set: the main MP4 **and the subtitled version** (one word at a time, Arial Black, white with outline, key words yellow, at 70 % height), plus a YouTube title, description and tags. During the render post the frame count continuously.

```powershell
npm.cmd run stills -- frames/S03/f 120-179 1
ffmpeg -framerate 30 -i frames/all/f%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p out/video.mp4
```

Capture approved scenes into separate folders by global range, then assemble a contiguous `frames/all/f0000.jpg…` sequence without reordering or duplicating boundary frames. The capture script does not resume.

Audio: music at 50% of narration's gated RMS (−6.02 dB); SFX at or below that with peaks under the voice; one final common gain and limiter if needed; no ducking that changes the relative levels. `templates/audio/mix.py` is the original bridge-specific mixer (with ducking and fixed timing): adapt it or write a project mixer and measure the result.

Mux, then check duration, black/frozen frames, sync and loudness with `templates/scripts/short_qa.py`. Deliver the MP4 with a concise scene list. Post-render corrections return to scene review first.
