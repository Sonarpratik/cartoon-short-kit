# Ricks Clips workflow

The main pipeline for every Ricks Clips style video, whatever the story, place, era or time of day. The binding version is "THE PIPELINE" in [SKILL.md](SKILL.md) (audit 2026-11-09); this page says the same thing in plain words. Density numbers: [DENSITY_RULES.md](DENSITY_RULES.md). Camera and action shots: [CINEMATOGRAPHY.md](CINEMATOGRAPHY.md).

## How to work (full text: SKILL.md, WORKING RULES)

- Finish the whole job. An error or a timeout is not a reason to stop: find the cause, retry, or go another way.
- No OK needed: retry a render or a check, regenerate one failing voice line, re-make a panel or a still, fix a set until its check passes, back up to OneDrive.
- CB's OK needed: the checks marked **CB** below, deleting or moving files, changing anything locked (characters, faces, main look, voice), changing a rule file, extra spending, publishing.
- Split across agents only where the order below says so (one agent per place, sound, references). Small jobs stay in one session.
- Reports to CB: result first, plain words, short.

## The order (each check must pass before the next step)

1. **Pick the story.** Pitch 3 true stories with first line, mocker, twist and title. Each pitch also names its places (5 to 8) and its kinds of light (2 or 3). CB picks.
2. **Write the script.** Show it with seconds per line and a beat list. CB approves. From here on: just do it.
3. **Make the voice.** Same voice, about 1.2x pace, a little less dramatic. Word times go into `voice/words.json`. Check: 3.5 to 4.5 words a second, no long gaps.
4. **Collect Rick's examples.** 2 to 4 of his frames for every beat, one line each on what to take (staging, framing, timing; never the shot).
5. **Plan the film in one file, `film.json`.** The camera director agent invents one camera idea for this story and writes every camera stop, every pose and face, every sound cue, all tied to words. Check: `python tools/film_plan.py check episodes/<name>/film.json` must show 0 FAIL. The cinematic checks in it (places, light, world-led frames, medium shots, rests, one long flowing move) may stay on WARN only with a reason from the scene. Nothing is rendered before that.
6. **Build simple sets in three.js and make the storyboard.** One agent per place. Each camera move gets a START and an END picture with the caption on, all on one page. The judge agent scores every picture; only 8.5 or better goes to CB. **CB sees every scene.**
7. **Make the whole film in three.js.** First 3 sample shots for the look, then everything, with voice, captions and rough sound. It renders in minutes. Check: `python tools/check_film.py out/animatic.mp4 --film film.json`, then watch it with the sound off. **CB watches the full preview.**
8. **Lock it.** `node templates/threejs_film/render.mjs film.json --export-lock`. From now on nobody changes layout, camera or timing.
9. **Blender look pass, last.** `from_lock.build()` rebuilds the locked film in Blender; then only materials, light, air, dressing and effects are added (MAIN LOOK; BlenderKit first for hero props). One agent per place, one render on the GPU at a time. Check: `python tools/check_episode.py`, and `python tools/measure/cine_look.py <look frames folder>` with 0 FAIL. **CB approves one still per place and one short clip.**
10. **Final render.** Slowest frame of each place first, then all frames. Check: `check_film.py` on the final, and `cine_look.py` on the final mp4 with 0 FAIL.
11. **Sound** (runs beside steps 9 and 10), from the cue list the plan wrote.
12. **Captions, QA, delivery.** MP4, 1080p preview, clean thumbnail, metadata, NOTES.md, OneDrive backup, lessons into `library/`.

Characters are the 2D vector puppets (drawn in code, 4 views, meme-level faces, lip-sync mouths, blinks). The plan decides, per frame, what each one does; three.js and Blender show the same drawings.

Building the whole world in Blender first (Stage A toon build, then Stage B materials) is still possible as the named option "full Blender world".

## Cinematic rules (CB 2026-11-10, full text: SKILL.md, THE PIPELINE, "Cinematic rules")

Our baboon film passed every check and still looked less cinematic than Rick's, because its world never changed. These seven rules fix that, most important first.

1. **More places, more light.** 5 to 8 places and 2 or 3 kinds of light per film. A one-place story gets extra views of the place (from the air, inside the vehicle, at night). A cutaway idea is a small 3D scene, not a flat card.
2. **Play with size.** A third to a half of the film shows the world or the story object, with the character tiny or absent. Then go very close. Put something big and close behind the character.
3. **Let the camera flow, as the scene asks.** Calm talk: short moves and rests on faces. Something travels: one long move of 3 to 7 seconds follows it. About 3 rests per 10 seconds, not 4 or 5.
4. **Low sun and real shadows.** Long hard shadows, the sun in frame sometimes, blue shadows, and one part of the film that goes dark. Every planned mood change must be visible in the final picture.
5. **Air and sky.** Sky pale at the horizon, soft clouds, haze on everything far away.
6. **Grade.** A clear vignette, calm big surfaces, one loud accent colour.
7. **Detail near the lens.** Dense ground, glints on metal and glass, a sharp picture outdoors.

Checks: the plan check (step 5) warns on rules 1 to 3; `tools/measure/cine_look.py` (steps 9 and 10) fails on rules 4 to 7.

## Craft rules for each step (a rule book, NOT a second order)

The numbers below are only labels. The order of work is always the list above. Rules 5-7 describe the "full Blender world" option; in the default order their density, material and light rules apply to the Blender look pass (step 9 above), and the storyboard comes from three.js (step 6 above).

1. **Topic and facts.** Pitch 3 true stories, each with its first line, the mocker, the twist and a title that hides the ending. Record sources.
2. **Script, 55-75 s (CB 2026-11-09).** 200-280 words at about 3.6-3.7 words per second. Rick's 24 scripts run 114-292 words, median 220. A soft target: the story always comes first, so never cut a story line to hit the time. An action hook of about 14 words, 3-4 beats, one quoted side line, a "You see" turn at about 70 %, the twist as the last line, a loop ending. Use the mocker formula and the writing rules (SKILL.md, UPGRADES 2-3), and show the script with seconds per line plus a beat list before any voice.
3. **Voice.** Fish Audio, facty voice. Trim silence, keep the breaths, never time-stretch. Gate every take (words a second, gaps, dead air, whispered words) and regenerate only failing lines. Get word times with faster-whisper into `words.json`, and anchor everything to `T('word', n)` (UPGRADES 4-5).
4. **Shot plan.** 3-4 shots per 30 s, so about 6-9 for a 55-75 s Short. The camera travels inside a shot; hard cut only on place or time jumps. A colour family per place, a signature sound, an expression track. For each shot, a camera plan: the subject's path and the camera rigs (chase, mount, orbit, catch, fly-by, follow-away) with their hand-offs.
   **Hero object first.** Build the story's hero object alone, as a detailed model, before the scene exists. Example: the airfield Po-2, about 38,000 triangles.
   **BlenderKit first (CB is on the Full plan):** search with `tools/blenderkit_tool.py` for the hero and props; use a model when it is better or faster than building one, build in Python only when nothing fits. Only assets the account already has, only Royalty Free or CC0. Prefer stylised or low-poly assets with cartoon proportions; if only a realistic model fits, simplify its proportions or keep it for small background props. Log every asset in the episode's `assets_log.md` and `library/blenderkit_assets.md`; cached files stay in `library/blenderkit/`. Stage 1: toon shading and ink like everything else. Stage 2: library or the asset's own PBR, whichever matches the look. Characters are always our vector puppets, never BlenderKit people.
5. **Stage 1 (Stage A): build and finish the whole scene in Python, in the toon look.** Worked example: `episodes/night-witches/density/`: `build_density_v1.py`, then `build_density.py` (rounds 1-2).
   - 30+ prop kinds and 600+ objects, in big, medium and small clusters, at real model detail (crate planks and nails, barrel hoops, bucket handle, fruit stems, boat planking).
   - 3 place-and-time details and 1-2 humour touches. 2+ moving things per shot. 2+ glowing lights per night scene.
   - Finished toon look: soft toon shading, ink, painted textures at 2x resolution, grass blades from about 1.2 m out, warm lamp pools, soft and contact shadows, haze from about 9 m, mist, characters placed correctly.
   - Pass 1, density and composition: one hero object plus 1-2 characters as the clear focal point; 3-5 big readable props in the foreground; breathing room in the midground so the hero reads; density comes from the background, the ground detail and the sky, not from clutter edge to edge; lamps lead the eye to the character. Camera staged for 9:16, props along the view.
   - Target for every Stage 1 and Stage 2, compared side by side, not only by the gates: `references/look_locked/stage1_airfield_approved.png`, `stage1_camp_approved.png` (Stage 1), `night_airfield_approved.png`, `night_camp_approved.png` (Stage 2).
   - Pass 2, fine pass, in the finished toon-and-ink look of airfield round 2: softness, surfaces, light and atmosphere, until all 7 gates of `tools/measure/density_check.py` pass or the gap is clear.
   - Every pass is render, look, fix, and ends when the picture is right, not only when the numbers pass. Guide from the airfield: about 8 rounds for pass 1, about 10 for pass 2, about 4 for Stage B. Keep a render log per pass: what changed, what the picture showed, the gate numbers.
   - A page for CB: rounds, gate scores, empty-cell grids.
6. **Storyboard ("full Blender world" option only).** Stills from the finished Stage A scene, one per beat, with captions. CB approves it. Action shots also get a quick low-res camera animatic.
7. **Stage 2 (Stage B): convert the same finished scene to the main look.** Worked example: `build_density_v3.py` + `post_v3.py`. The scene is not rebuilt.
   - Pick the light preset: night, morning, midday (`day`), golden or interior.
   - Build every surface as a Blender material from `templates/blender_look/materials.py`: shader nodes, no downloaded textures. Painted images are allowed for big surfaces.
   - If the library lacks a material, write a recipe, test it on one still, and save it to the library.
   - No ink on the world; ink on characters only.
   - One hard key (moon, sun or window), practical lights that belong to the place, shafts, haze, raytraced reflections.
   - A darker, cooler grade: near-black blacks, cool shadows, one accent colour per episode.
   - Render, look, fix, about 4 rounds, with a render log.
   - Gate: one final still per location through `tools/check_episode.py` and `density_check.py` before animation.
   - Standing checks: glints on metal and glass, reflections on wet or shiny surfaces, lights not clipping, fabric texture, edge wear.
8. **Characters.** The 2D vector puppets as cards at real depth, half self-lit, 4 named characters at most, faces change on the word (baked from `film.json`).
9. **Camera.** Moving about 68 % of frames, f/5.6. Each beat holds with a slow push, then travels to the next with smootherstep easing. Motion blur on travels and fast passes only. Low lens, a big close-up for the mocker, a 3-5 s macro proof insert, the payoff coming at the lens. Card acting and 0-to-1 change controls as in UPGRADES 6-8. Action shots use the `blender_cine` rigs: track the moving subject about 30 % of the time, hand one rig to the next instead of cutting, catch the subject with lead room, let fly-bys pass above or below the lens. Rules in CINEMATOGRAPHY.md.
10. **Sound.** Library first, cues on their words. Mix (CB 2026-11-09): sidechain-duck music and SFX about 13 dB under the voice, music bed about 20 dB under the narrator; measure voice-only vs background-only K-weighted in 0.4 s windows: median gap >= 15 dB, background louder than voice in < 1 % of talking; two-pass loudnorm -14 LUFS, true peak -1.5.
11. **Render.** EEVEE on the RTX 2070 Super, 64 samples, 1440x2560, slowest frame first, local only.
12. **Captions.** One white bold word at a time, black outline, about 70 % height. It pops from 108 % to 100 % in 0.09 s and shows 0.1 s before the word.
13. **QA.** Scorecard, `tools/check_episode.py`, density, frame QA, the sound-off test, measured gaps listed. Plus a contact sheet of the first and last frame of every hold, and a glitch scan for jumps, flickers and pop-ins.
14. **Delivery.** MP4, 1080p preview, thumbnail (a clean payoff frame, no text), metadata (title "The [thing] That [strange act]" or "Why [something odd]"), NOTES.md, OneDrive backup.

Colour always follows MAIN LOOK (Rick's newest 3D style), whatever any other reference does.
