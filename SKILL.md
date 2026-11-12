---
name: cartoon-short-review
description: Create original vertical cartoon shorts with Canvas2D characters in a Three.js world. Plan props from the script, review scene frames, apply scene-specific corrections, and capture the full video with Playwright and FFmpeg only after the user requests generation.
---

# Cartoon short with scene review

Use this bundled Three.js renderer and its shared visual defaults. Start from an idea, script, or uploaded narration. The normal output is 1080x1920 at 30 fps, timed to the narration. Default story length is 20–30 seconds unless the user asks otherwise.

## Persistent visual defaults

For the user's current face and hair preferences, read [character-motion.md](references/character-motion.md). The user preferred the previous authored hair animation and explicitly reverted the 3D mesh experiment; keep that authored style using the twelve hair/body direction keys in `templates/bridge/angle-designs.ts`, rather than sliding or squeezing the front hair drawing. Save character-specific PNG/JSON sheets with `node character-studio/save-turnarounds.mjs` and review them in the studio before reuse. Keep the newer small round pupils, thin lidded eyes, rounded brows and compact curved mouths, plus the body/walking corrections. Study private reference frames without copying their characters. Preserve revised shared renderer sources with `node character-library/preserve-shared.mjs` after checking turns and expressions.

Before staging every new project, preserve each new original character in `character-library/cast.json` and its original design/renderer in `projects/<project>/character-references/original/` (never overwrite an approved design). The global studio must display our actual saved characters using their original renderer, face/head seed, proportions, hair and outfit; never substitute a newly invented generic rig. Snapshot selected cast with `node character-library/snapshot.mjs projects/story character-id ...`. Use the snapshot's character renderer for new characters: 12 yaw views at 30-degree steps, top/bottom camera elevation, walking/sitting/bending and subtle deterministic chin, eyelid and gaze animation. Read [character-library/README.md](character-library/README.md). Review the cast in Character Studio (`npm.cmd run characters`, localhost:8787), including directions and actions, before staging. Derive drawing views from camera-relative world heading. Keep project snapshots fixed so later library changes preserve existing projects. Apply these defaults to future projects; do not retrofit completed videos unless requested.

For every new scene and every distinct room or outdoor location, plan the lighting, camera and props together before coding. This is a standing requirement; the user does not need to request it again. Follow [lighting-guide.md](references/lighting-guide.md), [camera-guide.md](references/camera-guide.md) and [physical-staging.md](references/physical-staging.md). Record the actual light sources, direction/colour, intended wall/floor shadows, time of day, camera angle/path, hero prop and supporting details in `work/PLAN.md`. Verify each location through its final camera before presenting it for review.

Use templates/bridge/director.ts as the shared entry point for character archetypes, face/gloss/outline settings and gliding camera helpers. Copy it into each new project's engine with the renderer helpers; keep that project's story-specific cast and shot coordinates local. Read references/camera-guide.md and plan noticeable, purposeful travel inside shots (wide-to-character reveals, lateral parallax, arcs and tilts), alongside cuts for changes of time/place. Apply these character and camera preferences automatically in future projects.

Include the user's preferred curved glossy reflection on hair and headwear: a tapered bright white highlight with a soft glow and a restrained secondary glint. Reuse CharacterPen from templates/bridge/face-style.ts; consult references/lighting-guide.md. Apply it to suitable visible hair/headwear in new projects without waiting for the user to request it again.

Apply the user's preferences automatically: off-white faces, a soft inner head highlight aligned to the key light, visible window-shaped light across interior surfaces where appropriate, and detailed original props/backgrounds with joinery, hardware, trim and relevant shelf contents. Choose lighting for each scene and preserve readable shadows and faces. Read [lighting-guide.md](references/lighting-guide.md), including its private reference studies, before designing a new set. No repeated prop or lighting request is needed.

Background quality is a standing preference too: start with a fully designed setting, detailed furniture and story-relevant objects, painted materials, architectural trim, believable light sources, surface highlights, soft form shadows and grounded cast/contact shadows. For window-lit interiors, carry the pane-shaped light across walls, worktops and floors as appropriate. Use references/style-examples/backgrounds-approved-v3.jpg as the user's approved background direction, adapting the setting and lighting to each new story. Do not wait for the user to request background detail or lighting again; include them in the scene plan and review frames by default.

## Essential rules

For future shorts, apply the user's [physical staging and varied-view preferences](references/physical-staging.md): enclosed rooms inside believable buildings, populated workplaces, connected roads and junctions, designed day/night skies, three-quarter and side camera views, and expressive characters looking at their task or each other. Use `templates/bridge/staging.ts` for window-fit checks, connected access roads and enclosed-room geometry. Do not use an open-front showroom as a substitute for a room.

- Create original stories, characters and staging. Reference images are private style study material: never deliver or publish them, or copy their characters, stories or shots.
- No real named living people, brand mascots or logos as characters.
- No captions unless requested. In-world signs must read correctly.
- When subtitles are requested, use the user's saved active-word karaoke style automatically: only the spoken word is goldenrod (#DAA520), with the remaining phrase white. Read [karaoke-guide.md](references/karaoke-guide.md) and its preserved example frames; keep separate clean and captioned exports.
- Preserve the narration's timing and delivery. Time visual reactions zero to three frames before the corresponding word.
- Review first. Show scene frames, accept corrections, and stop. Render the full sequence only when the user explicitly says generate, render, make the video, or go. Silence and approval of individual scenes do not authorize full generation.
- A correction affects only named scenes. Preserve other scene sources and frames. Ask before an unavoidable shared design change that would affect previously reviewed scenes.
- Keep a short task list and report progress on long captures.

## Preserved shared reference library

All required guides and visual examples live outside story projects. Read references/style-examples/README.md for the preserved background, face, hair/body reflection, cast and camera examples. Use templates/interior for detailed reusable rooms/props and templates/examples/interior-short-source.zip for a source-only worked example. New projects must not depend on projects/mkultra being present.

## Use the bundled project

Resolve paths relative to this SKILL.md, not a hard-coded home directory. This folder contains the renderer; do not fetch the original upstream repository as a replacement. It has a different integration.

For a new video, copy the project source to a story working folder, excluding node_modules, .npm-cache, dist, out and frames. Keep the installed skill and its examples unchanged. Work inside the copied project. Reuse package-lock.json and run npm install when dependencies are absent.

Requirements: Node 22.6+, npm, Python with NumPy, SciPy and Pillow for the audio/QA templates, FFmpeg, and Playwright Chromium. Windows commands use npm.cmd/npx.cmd to avoid PowerShell execution-policy problems; on other platforms use npm/npx.

```powershell
npm.cmd install
npx.cmd playwright install chromium
npm.cmd run dev
```

The 3D preview is at http://127.0.0.1:8788. The separate character gallery starts with `node preview-characters.mjs` at port 8787. Reuse an existing project server if its address is already occupied. Set CHROME_PATH to use an existing Chrome executable; PREVIEW_URL chooses another preview server.

Actual source map:

| File | Responsibility |
|---|---|
| templates/bridge/style.ts | Shared outline, blur and texture-detail defaults |
| templates/bridge/toon.ts | Pen API, bodyFront/bodySide, expressions and outfits |
| templates/bridge/props.ts | createProp: crate, barrel, bench, table, desk, shelf and cabinet |
| templates/bridge/lighting.ts, cardshade.ts, shade.ts | Window projection and white-face inner highlights |
| templates/bridge/paint.ts | Painted wood, stone, grass, facades and water |
| templates/bridge/build.ts | Buildings, scenery geometry and batching |
| templates/bridge/world.ts | World construction, lights, actors and per-frame posing |
| templates/bridge/story.ts | Shots, timing, cameras, crossfades, effects and focus |
| templates/bridge/cast.ts | Character staging, drawing cache, actions and expressions |
| templates/bridge/lights.ts, grade.ts | Day/golden lighting and colour |
| templates/bridge/player.ts | Browser player, window.ready and window.renderFrame(f) |
| templates/scripts/bridge-stills.mjs | Deterministic Playwright frame capture |

Optional Kenney GLB files go in public/bridge/kenney/. They are not bundled. Procedural scenery and the reusable props work without them. Do not assume a missing external asset will appear in the final image.

Read [visual-guide.md](references/visual-guide.md) when designing characters, props and cameras. Existing reports in references/reports are historical measurements, sometimes of older code; inspect the current implementation before applying their prescriptions.

## 1. Intake, ideas and script

If narration is attached, use it and ask for the final script only when needed for timing. Otherwise establish whether the user has narration, a script, or needs ideas. Ask target length only if it materially changes the plan.

For ideas, offer ten numbered options with a title, hook, twist, visual moments, and whether the account is documented, disputed or folklore. Verify historical claims with available web tools; identify legends plainly.

For a chosen story, write natural narration at roughly 3.7 words per second: hook, short setting, escalating action, explanation/pivot, then a final ironic payoff. Return a copyable script, word count, estimated duration and short visual plan. Have the user supply or approve the narration before timing the picture. Request clean speech without music.

## 2. Plan scenes and choose props automatically

The user does not need to provide a prop list. Infer the setting, essential objects and actions from the approved narration. Ask about props only for ambiguous story-critical details or a specific visual preference.

Write work/PLAN.md before scene coding, with one row per scene: S01 etc., global start/end frames, spoken words, setting, camera, characters/actions, hero prop, supporting props, lighting and sound cue. Include the proposed props in this plan for review.

Make the lighting entry concrete: visible source and position, key/fill balance, colour and time of day, shadow receivers/blockers, window-beam treatment where motivated, and any alarm or day/night cue. Make the camera entry concrete: angle, framing, travel, subject and unobstructed reaction/hand/prop. Plan each distinct room separately even when several rooms occur in one scene. A palette name or glowing bulb alone does not complete the lighting plan.

For each scene:

1. Choose the object that explains the action. Give it a readable silhouette and appropriate scale.
2. Add only a few supporting objects that establish place or help the action. Do not fill every empty area.
3. Reuse createProp for supported objects, and existing building/paint helpers for scenery. Build new reusable functions for other story-specific objects and record their dimensions and origin.
4. Keep the main action unobstructed. Check prop placement through the actual camera at the beginning, middle and end of each move.
5. Verify every location's visible light sources, surface modelling, cast/contact shadows and readable faces in rendered frames. Check walls and floors, practical-light response in the actual shader, and floor/seat/prop contact. Fix missing shadows, overlapping floors, light leaks or flat ambient-only lighting before presenting the scene for review. Recheck lighting changes and camera transitions at their cue frames.

Example in world.ts, where R is the world root:

```typescript
import { createProp } from './props';
R.add(createProp('crate', { position: [2, groundY, -3], yaw: 0.2 }));
```

The library contains seven prop types, not a universal asset generator. Claude writes any additional geometry/material code needed for a new setting. Do not reuse the bridge setting merely because it is the worked example.

## 3. Timing and scene implementation

Use word timestamps from an available transcription tool, or align the supplied script to measured narration pauses and verify the result. No timing.py is bundled: create a project helper if needed. Do not claim exact alignment without checking it. Set FPS and TOTAL to the narration duration and update picture/audio timelines together before review.

The bundled bridge is a worked example: its story, camera and sound timing are story-specific. It currently does not provide independent scene files or a render hash cache. Before promising isolated scene corrections, split the new story into modules such as templates/bridge/scenes/S01.ts and connect them to the actual story/world/cast dispatchers. Define each scene's frame range, camera, actors, light, props, world changes and SFX. Scene-local overrides must be consumed by the renderer, rather than merely recorded in an unused object.

Keep shared design changes separate from scene content. Add per-scene source/dependency hashes and completeness checks if reusing captured frames. A changed shared dependency invalidates affected scenes. Do not claim resume or automatic caching unless it has been implemented and verified in that project.

Use frame numbers and seeded randomness for all animation. Keep approved frame ranges fixed during corrections. Check first and last frames of neighbouring scenes when motion crosses a cut.

## 4. Review frames, then stop

Start the preview server. Capture each scene's first, middle and last frame plus important action frames at full resolution:

```powershell
npm.cmd run stills -- review/S03/f 120,150,179 1
```

Frame arguments are actual global frame numbers; capture filenames end with the zero-padded frame number. The output prefix is not a scene filter.

Inspect frames before sending: faces, hand/prop contact, floating feet, mirrored signs, camera collisions, repeated scenery, distracting rails, excessive blur, colour clipping and missing assets. Compare locally with matching reference settings; never include reference images in user deliveries.

Create labelled review sheets such as review/S03_v1.jpg. Labels belong only on sheets. Track scene range, words, version and status in work/REVIEW.md. Use an available image-sheet helper or write a project helper; do not assume review-sheet automation is bundled.

Send all scene sheets through the environment's file-delivery capability, or provide local file links. Explain how to request corrections by scene. Stop and wait. Apply corrections only to named scenes, save a new sheet version, show the changes, and stop again.

## 5. Generate after explicit instruction

Capture approved scenes into separate folders using their global ranges:

```powershell
npm.cmd run stills -- frames/S03/f 120-179 1
```

Skip existing frame folders only after verifying the source/dependency hashes and complete expected file set. The supplied capture script itself does not implement resume. Assemble a contiguous global sequence at frames/all/f0000.jpg etc. using copies, hard links or symlinks supported by the environment. Do not reorder or duplicate frames at scene boundaries.

Encode at 30 fps:

```powershell
ffmpeg -framerate 30 -i frames/all/f%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p out/video.mp4
```

Prepare narration, music and SFX separately. Target music at 50% of narration's gated RMS (-6.02 dB); SFX at or below that and cap their peaks below the voice. Preserve voice timing. Use one final common gain and peak limiter if needed; avoid ducking/compression that changes the requested relative levels.

Important: templates/audio/mix.py is the original bridge-specific mixer with ducking and fixed timing. It does not implement the requested 50% mix. Adapt it or create a project-local mixer, measure the actual result, and do not run it with a fabricated generic CLI. Similarly, no audio.py, render.mjs, finish.sh or setup.sh is bundled.

Mux the verified mix, then check duration, black/frozen frames, narration sync and loudness. The existing QA helper is templates/scripts/short_qa.py. Use it with actual shot metadata, and inspect its sheets. Deliver the MP4 with a concise scene list. Post-render corrections return to scene review before capturing an updated video.

## Saved camera continuity preference
For future shorts, automatically apply the connected-action and angle-variety guidance in references/camera-guide.md. Prefer purposeful camera movement across related beats over sentence-by-sentence cuts, including left-side reveals, side/three-quarter views, changes in height, foreground parallax and readable hand/prop actions. Use the shared director cameraSequence/cameraBoundary helpers where appropriate. Keep user-authorized silence insertions synchronized across narration and picture. These defaults do not silently modify existing story snapshots.
