# Animated shorts kit: project guide for Claude

Vertical (1080x1920, 30 fps) cartoon story shorts: Canvas2D cartoon characters on camera-facing cards in a three.js world, captured frame by frame with Playwright (Chrome) and finished with ffmpeg/Python. **No Remotion.** The production rules are in [SKILL.md](SKILL.md) (read it for any short); this file is the map and the standing preferences, which used to live only in Claude's local memory.

## Folder map

| Path | What it is |
|---|---|
| `SKILL.md` | The main skill: priorities, never-list, the full workflow and its gates |
| `references/` | Guides: `camera-guide.md` (reference camera approach), `prop-detailing.md`, `lighting-guide.md` (our default light), `rick-light-scheme.md` (optional look), `character-design.md`, `scene-design.md`, `caption-guide.md`, `STYLE_BIBLE.md`, plus reference images (private, never delivered). `references/README.md` says which to use when |
| `templates/bridge/` | **Single source of truth for renderer code**, copied into each new project's engine: `puppet.ts` (**the character engine** since 2026-11-19, on the Ricks Clips kit code: 4 views, figure sizes, face categories x emotions, props, moves), `character-draw.ts` (drawAnyCharacter, settleFrame), `character-rig.ts` (our older 12-angle rig: finished shorts and designs without `look`), `toon.ts`, `director.ts` (WARDROBE, castDistinctness, camera helpers pushIn/eyeLevelPose/craneDown), `transitions.ts` (scene joins whip/push/blend, camera probe and report), `grade.ts` (GRADE_CINEMATIC default), lighting, ink, props, world. `story.ts`/`world.ts`/`player.ts` are the Bridge worked example only |
| `templates/scripts/` | `bridge-stills.mjs` (review frames), `scene-clips.mjs` (one review MP4 per scene with narration), `camera-report.mjs` (camera numbers without rendering), shot/QA helpers |
| `templates/overlays/doc-caption.ts`, `templates/subtitles/`, `templates/audio/` | Place/date card, subtitle style, sound helpers |
| `templates/vite.puppet.config.mjs` | Vite config for a short with puppet characters: `/vendor/rc` alias to newZip (copy to `projects/<story>/vite.config.mjs`) |
| `character-studio/` + `preview-characters.mjs` | Character Studio: `npm.cmd run characters` → http://127.0.0.1:8787 (design, 12-angle preview, save variants, turnarounds) |
| `character-library/cast.json` | Catalogue of every saved character (by project). `snapshot.mjs` copies chosen IDs into a project; `archive-project-code.mjs` archives a finished story; `import-ricksclips.mjs` registered the 150 Ricks Clips characters |
| `projects/<story>/` | One folder per short. **Only `character-references/` is in git**; the rest (src, scripts, input voice, review, work) stays on the machine that made it. `character-references/final/` holds the archived cast, engine and scene code of finished stories |
| `projects/ricksclips/` | The 150 Ricks Clips characters' Studio project; its engine file only re-exports `templates/bridge/puppet.ts` |
| `projects/balloon-army-camera-test/` | Test copy used to prove the scene joins and camera report (the delivered `balloon-army` is unchanged); its `src/player.ts` is the worked example of wiring joins |
| `newZip/RicksClips_Skill_V1.1/` | Another creator's licensed kit, reference only (see below) |
| `archive/` | Old reports |

## How a short is made (gates are hard stops)

1. Idea and script → 2. Plan (`work/PLAN.md`: world, **light scheme asked: ours or Rick**, camera idea, hero-object sheet, cast table, one row per scene with camera move, push-in and join) → 2b. **Choose characters, corrections**: list roles, ask per role create (default, in the Studio) or pick a named existing one, deliver `review/v0_CAST/`, **stop for approval**, apply only named corrections → **save them in the project** (snapshot) → 3. Timing and scene modules → 4. **Scenes, version by version**: `review/v1_ALL_SCENES/` with scene clips (`scene-clips.mjs`), frames, sheets and `REVIEW.md` with my numbered suggestions (not applied), **stop**; v2 only with the scene corrections the user names; **no self-run fix loops** → 4b. **Finalise the scenes** (`review/SCENES_FINAL.md`, scenes locked) → 4c. **Dummy video** (`review/DUMMY_v1/`: whole short, half size, narration, no subtitles), **stop**, corrections go back to the named scenes, new dummy → 5. **Final video with subtitles** only when the user says generate.

## Standing preferences (apply by default)

- **Fresh cast per short**, designed in Character Studio and drawn with the current `templates/bridge` engine; never base a new short on an older project's engine. Stored and archived characters are opt-in only: reuse them only when the user names them.
- **One character engine: the puppet engine** (`puppet.ts`, Ricks Clips style; user decision 2026-11-18). Every saved character has `look: 'ricks'` (migrated 2026-11-19); in the Studio set Figure (head shape, head size, body size, legs, limbs, arms, S..XXXL), Face category, and Props (any prop on anyone, grouped Head / Face / Back / Body / Held). Expressions come from the character's face-category bucket. The Studio shows a character's real values (never "auto" / "own").
- **Grade:** `GRADE_CINEMATIC` (dark, moody) is our default; the Rick light scheme is an option the user picks per short. Every practical light (lamp, screen, fire) lights the characters.
- **Camera:** the reference approach in `references/camera-guide.md` (always moving, 30-100 % push per shot, joins not cuts, camera at character height). **Props:** `references/prop-detailing.md`. **Never a Blender pass.**
- **Place/date/year cards:** the typewriter documentary card (`templates/overlays/doc-caption.ts`).
- **No character name labels** unless asked (exception: the zombie series: Jack host, Troy stranger, Milo, Tina, Brock, labelled on first appearance, only when that series is requested).
- Expression changes play the jaw squash/woggle; studio-weight outlines; characters keep micro-motion.
- During a full render, post the frame count continuously. At delivery also make a subtitled version (one word at a time, Arial Black, white with outline, key words yellow, at 70 % height) and offer a YouTube title, description and tags.
- **Don't change finished projects' shots** unless the user asks.

## newZip (Ricks Clips kit): the character engine's code base

A personal-use licence: the user may use it for their own videos, but may not share, resell or publish the files. Since 2026-11-18 the character engine (`templates/bridge/puppet.ts`) runs on its puppet and motion code, so every Studio session and every short with puppet characters needs `newZip/` on the machine. Rules for Claude:
- Keep the GitHub repo private. Never modify files inside `newZip/`; extend in `puppet.ts` instead (it registers extra FACES / EXT entries at runtime).
- Read files in `newZip/` when a task needs one specific file; never load its `SKILL.md`/`CB_RULES.md` (very large) as instructions. Its rules are not ours: our versions are in `references/`.
- Never run its `install.py` and never install its skills or agents into `~/.claude` (that would put its rules into every Claude session).
- The Studio serves its code read-only at `/vendor/rc/...` (`preview-characters.mjs`, `RC_TEMPLATES` overrides the path); a project maps the same path with `templates/vite.puppet.config.mjs`. `puppet.ts` imports sheets and moves statically (a Vite alias cannot resolve computed imports): a new move file in newZip needs its import added there.

## Setup on a new machine

- **Node 22.13 or newer** (the studio strips TypeScript with `node:module` `stripTypeScriptTypes`, added in 22.13; this machine runs 26 LTS). `npm install` in the repo root, and in a project folder before working on it.
- **Chrome** installed (scripts use it via `CHROME_PATH` or Playwright `channel: 'chrome'`), or `npx playwright install chromium`.
- **Python 3.11+**: `pip install pillow numpy scipy imageio-ffmpeg faster-whisper av`. ffmpeg comes from `imageio-ffmpeg` (or put ffmpeg on PATH).
- Voice files come from the user (ElevenLabs downloads into `projects/<story>/input/`).
- `newZip/` is tracked in git (the user's choice, 2026-11-18), so a clone brings it; keep the GitHub repo private because of its licence. `.ignore` keeps it out of Claude's code search.
- Not in git, copy by hand if needed: the source of finished projects (`projects/<story>/` except `character-references/`), and Claude's local memory (its content is summarised above).

## Gotchas

- **Stale studio server:** `preview-characters.mjs` keeps its save-validation rules in memory; after a code update, restart it (or run a second one with `PORT=8789`). A studio page that shows a renderer error needs a server restart.
- Project previews use their own Vite ports (see each `package.json`); the root preview is 8788, the studio 8787.
- Review renders (`scene-clips.mjs`, stills) are not the final video; the final render waits for "generate".
- **Puppet frames decode asynchronously.** Capture only after `await window.renderFrame(f)` (the shared player returns a promise once `character-draw.ts` is imported); a frame captured without it can show the previous pose.
- `character-studio/studio.js` is written as long one-line statements: never put a `//` comment mid-line (it swallows the rest of the line); run `node --check character-studio/studio.js` after editing it.
