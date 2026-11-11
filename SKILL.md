Cartoon short with review: idea → script → voiceover → scene frames → corrections → generate

This is a copy of cartoon-audio-short with one change to the workflow. The video is split into numbered scenes (S01, S02, ...). The user first gets review frames for every scene, sends corrections per scene, and only changed scenes are edited and re-rendered. The full video renders only when the user says "generate".

The look: flat 2D bean-head cartoon characters (canvas-drawn "cards" with plum outlines) in a colourful 3D world with black ink outlines, painted textures, depth-of-field and gliding cameras. The output is 1080x1920, 30 fps, exactly as long as the voiceover. The user's voice is unchanged. The music bed and SFX are synthesized and sit at 50 % of the voice level.

Rules
Stories, characters and shots are always original. Never recreate another creator's video shot for shot. Offer an original take on the same idea instead.
No real, named living people as characters, and no brand mascots or logos.
No captions unless the user asks. Diegetic text (a carved message, a sign) is fine, and it must read correctly (not mirrored).
Never edit or re-time the voice. The picture is timed to it, and every visual reaction lands 0-3 frames before its word.
Audio levels: the music bed sits at 50 % of the voice level (−6 dB, gated RMS). SFX sit at 50 % or slightly less, with peaks capped so no hit pokes out over the narration. Always mix with mix.py, never by hand. Use no ducking or compression that would change this ratio; only one linear gain plus a peak limiter goes on the whole mix.
The review gate: never start the full render before the user says "generate" (or "render", "make the video", "go"). Silence or "looks good" for some scenes is not "generate".
Scene isolation: a correction to a scene changes only that scene's file and re-renders only that scene's frames. Every other scene stays byte-identical.
Keep the user informed with a task list.
Stage 1: Intake (always first)

If an audio file is already attached, skip to Stage 4. If a script was also given, use it for the timing. Otherwise ask one AskUserQuestion (or plain text if that tool is missing): "Where are you starting from?"

Voiceover ready: ask them to upload it, plus the script text if they have it (the script makes the timing exact). Go to Stage 4 when it arrives.
I have a script, need the voiceover: tighten the script per Stage 3 if needed, give it back with recording tips, ask for the upload, then go to Stage 4.
Need video ideas and a script: go to Stage 2. Also ask the target length if they haven't said. The default is 20-30 s; 45-60 s is allowed.
Stage 2: 10 video ideas

Give exactly 10 ideas in one reply, numbered, and ask the user to reply with a number (or "more"). Each idea gets:

Title (5-8 words, curiosity-driven, e.g. "The Soldier Who Never Left").
Hook line: the first spoken sentence, a paradox stated as fact ("A man sold the Eiffel Tower. Twice.").
The twist in one line (the ironic payoff that ends the video).
Why it animates well: the 2-3 big visual moments (a collapse, a reveal, a chase).
True or legend: say plainly whether it is documented history, a disputed account or folklore.

What makes an idea "perfect" for this format:

One surprising story with a physical cause and effect you can show.
A clear everyman character, stakes that escalate, and a twist in the last line.
A setting that can be built from simple 3D shapes plus cartoon cards (towns, bridges, ships, castles, deserts, labs, palaces).
Mix the 10 across eras and themes: ancient, medieval, 1800s, modern, science, animals, inventions, disasters, weird laws, lucky accidents.
For anything presented as true, verify the key facts with a web search before offering it. Don't present a viral legend as fact. If the user wants it anyway, frame it as "legend says".
No real living people as the butt of a joke, nothing graphic and nothing political.
Stage 3: Script (after they pick)

Write the narration only (no stage directions in the spoken text), sized at about 3.7 words/s: 20 s ≈ 75 words, 30 s ≈ 110, 60 s ≈ 220. Formula:

Hook (sentence 1, no setup): the absurd fact.
Setting in 1-2 lines: when, where, who, a concrete detail.
Escalation, 2-4 beats, each bigger. Others doubt or mock. Use one exaggeration joke.
Mystery or pivot: "But when..." / "You see," introduces the real mechanism, often with an everyday analogy.
Twist / payoff: short, ironic, and the last words of the video. Use plain spoken English, contractions, sentences around 8-15 words, and numbers written as words. Never describe what the viewer already sees.

Then reply with:

The script in a copyable block, with the word count and estimated length.
A one-paragraph visual plan (the shots you'll animate).
Recording tips: one steady, warm narrator voice; ElevenLabs works well (a deep narrator voice, speed about 1.05-1.1, stability about 45-55 %). Mp3 or wav is fine. Leave natural pauses at sentence ends. Export without music.
The ask: "Upload the voiceover when it's ready and I'll make the scene frames for you to check." Keep the final script text. It drives the timing in Stage 4, so no speech recognition is needed. If they recorded a changed version, ask for the final text.
Stage 4: Build the scenes (after the voiceover is uploaded)

Work without stopping until the review frames are sent (4.6). Ask only if the timing cannot be resolved.

4.0 Get the kit

The code kit is meant to ship inside the cartoon-audio-short skill folder at kit/ (engine, tools, worked example, plus vendored three.js r160 and the toon.ts Pen library from github.com/mromidev/claude-animated-shorts, both MIT). Look for it with find / -type d -path "*cartoon-audio-short/kit" 2>/dev/null and treat it as read-only.

If kit/ is missing (an account copy of a skill can hold only SKILL.md), say so in one line, then clone github.com/mromidev/claude-animated-shorts into ~/shorts/_kit once and build the engine from it. At the end of the video, offer the user a zip of the project folder without node_modules or frames, so the next video starts from it instead of rebuilding the engine.

Then run bash <kit>/tools/setup.sh ~/shorts/<slug>. It copies the engine and tools into the project, installs the vendored three.js, strips the types from toon.ts with Node 22 module.stripTypeScriptTypes, and links Playwright. No network is needed. If the vendored files are missing, it falls back to npm or a git clone.

Requirements: Node 22.6+, Python 3 with numpy + Pillow, ffmpeg, and Playwright with Chromium (npm i -g playwright && npx playwright install chromium if missing).
If package registries are blocked, git over GitHub usually works. Never disable TLS or route around the proxy.
Chromium: use the pre-installed Playwright browser with --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist. That gives CPU WebGL at about 3-10 s per frame.
4.1 Timing

Run python3 timing.py voice.mp3 script.txt --out work.

With whisper or faster-whisper installed, it uses word timestamps.
Otherwise it aligns script phrases (split at punctuation) to silence-detected speech segments, with a DP that matches syllables to duration and penalises sentence ends inside a segment and long gaps inside a phrase.
With no ASR and no script, ask for the script. Claude cannot hear audio.
Check work/phrases.json: pauses should fall at sentence ends. Total frames = round(duration × 30).
4.2 Scene plan (work/PLAN.md before code)

One scene = one shot. Number them S01, S02, ... in order. Make one row per scene: id, frames f0-f1, seconds, the words spoken, setting, light, camera move, characters/poses/expressions, effects and SFX cue.

Frame 0 is already the hook image.
Usually one scene per phrase. Merge tiny phrases into the next scene.
Illustrate every sentence literally. Props carry the jokes.
Vary shot sizes: hook MCU → wide reveal → two-shot → insert close-up on the key object → reaction close-up → environment move for the payoff.
Use light for beats: day for normal, golden for decline or drama, night-blue for explanation. A time jump gets a 6-frame white flash.
The twist line gets a sting (music stops, low hit, push-in with roll). The last scene's physical payoff lands on the final word.
Scene frame ranges come from the voice timing and never change during corrections, so the sound stays in sync.
4.2b Scene files (this is what makes per-scene corrections safe)
Everything that belongs to one scene lives in web/scenes/S03.js: its frame range, light preset, camera keys, DOF, actors (actorsAt), effects (fxAt), set-piece progress and any scene-only props or overrides. It exports { id, f0, f1, light, cam, dof, actors, fx, world, sfx }.
story.js only imports the scene files and dispatches by frame (shotAt(f) → that scene's functions). It holds no scene content.
Shared things live in shared files: the world layout and props in main.js, character designs in roman.js, light presets, painters in paint.js.
A correction to one scene goes into that scene's file. If a scene needs a different prop, colour or light, add a scene-local override in its file (e.g. world: f => ({ hide: ['cart'], add: [...], tint: {...} })) instead of editing the shared world.
If a correction truly needs a shared change (a character's design, the whole town, a light preset), list the scenes it affects and ask before making it. Those scenes are then re-rendered too.
Cross-scene continuity: if a camera move or action carries across a cut, both scene files declare the shared values. When one changes, flag the neighbour and re-render its first or last frames.
Keep work/hashes.json: a hash of each scene file plus the shared files it uses. A scene whose hash hasn't changed is never re-rendered.
4.3 World (web/main.js)

Keep the engine sections: toon materials, ink contract, add/tbox, sky, lights, cards, render targets/post, applyLight, drawActors, swapForNd, renderFrame. Replace the example world between // ---------- world ---------- and // ---------- cards ----------, plus the story parts of worldState(), which now reads each scene's world overrides.

Build from primitives with painted canvas textures (paint.js: planks, beams, rotten wood, stone, moss/ivy, grass, dirt, plaster, roof tiles, marble, banners, carved text). Write new painters in the same flat-with-dark-seams style.
Use tbox for constant texel density, a 2-step toon gradient, and fog = horizon colour.
Background: hills (half-buried spheres), mountains (cones + snow caps), cypress/pine trees, distant houses, painted cloud billboards.
Set pieces (collapses, falls, doors) are pivoted groups driven by 0..1 progress from worldAt(f), with eased and staggered parts.
Curved diegetic text uses planar UVs. Check it isn't mirrored.
4.4 Cast (web/roman.js → web/toon.js)
romanFront(p, outfitKey, opts) draws on a 600x1000 design canvas with soles at y=975. The card is 2.25 m tall, so 1 unit = 0.00225 m.
Add outfits to OUTFITS (tunic/cape/armor/helmet/hair/cap/beard/apron/dress/toga) and new headgear and props in the same style.
Arm poses: hang, spear, point, up, wave, hip, belly, temple (+swirl), lift, reach (+lift), cheek, shield, cross, thumb.
Expressions: the toon.ts FACE set plus snore, stubborn, squint. Extend FACE for more.
Rebuild after edits with cat web/toonbase.js web/roman.js > web/toon.js. Render a character test sheet before using new designs.
Billboards turn on yaw only, get a contact blob and an alpha-tested shadow, and are never inked by the world pass.
Build card keys from q()-rounded values (so the canvas redraws only on visible change).
A detached part (e.g. a lifted helmet) is its own card, aligned with headCenter(seed): y = DECK + (partY − hc) × 0.00225.
4.4b Example images (the look target)

The example frames ship with the user's cartoon-3d-short skill. Find them with find / -type d -path "*cartoon-3d-short/references/frames" 2>/dev/null: 38 frames at 540x960 named shortNN_0060.jpg / shortNN_0180.jpg, plus contact sheets in ../sheets/ and measured numbers in ../reports/ (lighting.md, grade.md, outlines.md, depth.md, textures.md, characters.md, motion.md).

Before building, view 4-6 frames that match the story's settings and lights, and note the colour, ink weight, shadow colour, depth blur and framing to aim for.
Before sending review frames (4.6), put stills next to 2-3 matching frames in one sheet and fix the biggest gap first.
They are private study material: never send, upload or publish them, and never copy their stories, characters or shots. Use them only for the look.
If they can't be found, go by the numbers in 4.4d and say so in one line.
4.4c Prop library (build from primitives with tbox/add; origin at the base centre; sizes in metres)

Every prop is a function returning a Group, with castShadow = true on its meshes. Colours are muted mid-tones (never neon). Give every flat face a painted texture with dark seams. Hand-held props (a coin, a letter, a tool) are drawn on the hand's card, not built in 3D.

Setting	Prop	Build	Colours
Town	House	Box 6x7x5 + gable roof (2 slanted boxes overlapping the walls by 5 cm) + chimney 0.6x1.5; plinth, sills, door 1x2.1 with step	brick 
#a8573e / cream 
#e6d6b4 / ochre 
#c99a4e, roof 
#7a3b2e
Town	Lamppost	Cylinder r0.07 h3.2 + box lantern 0.3 with emissive glass	iron 
#2c2a30, glass 
#ffd98a
Town	Well	Cylinder r0.8 h0.8 (stone) + 2 posts + small gable roof + bucket	stone 
#b3a796, wood 
#7a5233
Town	Cart	Box bed 2x0.5x1.2 + 2 wheels (torus r0.45 + spokes) + shafts	wood 
#8a6038
Town	Barrel / crate	Cylinder r0.35 h0.9 with 2 dark hoops / box 0.7 with plank texture	
#8a6038, hoops 
#3a3236
Town	Bench, fence	Planks 1.6x0.05x0.35 on 2 legs / posts every 1.2 m + 2 rails	
#7a5233
Nature	Pine / oak	Cylinder trunk + 3 stacked cones / trunk + 3 overlapping spheres	trunk 
#6b4a32, leaves 
#4f7d3a / 
#6a9a45
Nature	Rock, hill, mountain	Squashed icosahedron / half-buried sphere r20-60 / cone + white cap cone	
#9a9488, grass 
#7fa556, snow 
#f2f4f7
Nature	Cloud	Painted billboard card, never inked, beyond the fog start	
#ffffff 90 %
Nature	River	Flat plane with scrolling stripe texture + foam edges	
#4a8fb8 → 
#7fb8d6
Coast	Ship	Hull = extruded boat outline 8x2.5 + mast cylinders + slightly curved sail planes	hull 
#6b4a32, sail 
#efe6d2
Coast	Dock, lighthouse	Planks on posts / tapered cylinder with red bands + glass lamp room	
#8a6038 / 
#f2eee4 + 
#c23b32
Castle	Tower, wall	Cylinder r3 h12 + merlons (small boxes) / box wall 3 m thick with merlons	stone 
#b8ad9a, roof cone 
#5a4a6a
Castle	Gate, banner, torch	Arch + portcullis grid / cloth plane with wave / stick + flame card	
#4a3a2e, banner 
#c23b32, flame emissive
Lab	Desk, chalkboard	Box top + 4 legs / dark green plane in a wood frame (diegetic chalk text reads correctly)	
#7a5233, board 
#2f4a3a
Lab	Flask, gear, lever machine	Sphere + cylinder neck with coloured liquid / extruded gear / box + lever arm on a pivot	glass 
#cfe8f0 at 60 %, brass 
#c9a54a
Desert	Pyramid, dune, palm, tent	4-sided cone / squashed sphere / curved trunk segments + leaf planes / cloth cone	sand 
#e3c48a, 
#d9b06e
City	Tower block, car, traffic light	Box with window texture / rounded boxes + 4 wheels / pole + box + 3 emissive lamps	
#c8c2b8, car 
#3fa7a0
Indoor	Table, chair, door, window, shelf	Boxes; window = frame + glass plane; shelf with book boxes in 4 muted colours	
#8a6038
Story items	Coin, scroll, crown, sword, clock	3D only for close-up inserts: cylinder / rolled plane / ring + spikes / box blade + cross guard / disc + 2 hands	gold 
#d8b04a, steel 
#9aa3ad
4.4d Lighting and shadows: day, golden, night

Shadows seat the cards in the world. Without them characters float.

Shadow setup (all lights):

Renderer: renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;.
Key light (sun or moon): castShadow = true; shadow.mapSize.set(4096, 4096); shadow.bias = -0.0004; shadow.normalBias = 0.03;. Keep the shadow camera tight around the action (±10-14 m): a frustum that is too big gives faint, blurry shadows, and one that misses the action gives none. Every scene: key.target.position.copy(actionCentre); key.position.copy(actionCentre).addScaledVector(keyDir, 60); key.target.updateMatrixWorld(); key.shadow.camera.updateProjectionMatrix();.
Receivers: custom toon ShaderMaterials don't receive shadows unless they include the shadow chunks. The reliable fix is a shadow catcher over every walkable surface (ground, deck, floor, street): new THREE.Mesh(planeGeo, new THREE.ShadowMaterial({ color, opacity })), receiveShadow = true, 5 mm above the surface, polygonOffset on. Colour and opacity per light are in the table below.
Casters: buildings and props castShadow = true. A camera-facing card casts only a sliver when the key is side-on, so give every card a shadow proxy that faces the KEY LIGHT, not the camera: same geometry, material = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), castShadow = true, customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: card.material.map, alphaTest: 0.5 }). Each frame copy the card's position and set proxy.rotation.y = Math.atan2(keyDir.x, keyDir.z). The card itself doesn't cast.
Contact blob under every standing card, even when key shadows work: CircleGeometry r ≈ 0.35 m with a radial-gradient texture (centre alpha 0.5 → 0), MeshBasicMaterial({ transparent: true, depthWrite: false }), flat, 1 cm above the ground, colour 
#241726. Shrink it and fade it to 60 % when a foot lifts or the character jumps.
Hide the catcher, proxies and blobs in the normal/depth pass (like blobs and clouds), so the ink never outlines a shadow.

Light presets:

	Day	Golden (drama, decline)	Night
Key	Sun az 75° / el 45-50°, warm white 
#fff4e0	Sun az ~6° / el 7-15°, backlit, 
#ffb36b ×1.5	Moon el 25-35°, cool 
#9fb4ff, ~0.6 of day intensity
Fill / sky light	Hemisphere sky 
#bcd4f0, ground 
#8a7a60	Hemisphere 
#ffc47c / 
#4a3f6a	Hemisphere 
#1b2550 / 
#0b0d1a at 0.35
Sky	top 
#3e7fd2 → horizon 
#b8d0ec	
#ffc47c → 
#8a6f8a	top 
#070a1f → horizon 
#1f2a5a, a star card, a moon disc with soft bloom
Fog = horizon colour	25 → 300 m	20 → 360 m, peach only past 50 m	
#141a3a, 15 → 200 m
Shadow catcher	
#3a2030 at 0.45 (shade ≈ half of lit, slightly warm, never grey)	
#3b3570 at 0.6 (violet-blue, never brown)	
#0a0c26 at 0.5
Shadow length	~1x character height	long, toward the camera	medium, soft (moon); short and hard under lamps

Night extras:

Practical lights carry the scene: windows, lamps, torches and fires are emissive (
#ffc76b, intensity ≈ 2 so the bloom threshold 1.0 catches them).
Use at most 1-2 PointLights near the action (
#ffb85c, distance 10-12 m, decay 2). Only the nearest casts shadows (mapSize 1024, bias -0.002), because point-light shadows render 6 times and are slow on the CPU renderer. A character between the camera and a lamp gets a proxy facing the lamp.
Under every lamp, a warm light-pool decal on the ground: a radial-gradient circle r 2-3 m, additive, 1 cm up.
Faces must stay readable. Cards get a faint cool fill so a face never drops below about 0.6 brightness, and the lamp side gets the warm colour. No black crush: night shadows are deep navy, not black.
Grade: saturation about 0.9, lift the blues a little, keep the emissives warm. Bloom only on the emissives.
4.4e Stability: no broken backgrounds, no crooked objects

Check every one of these while building, not after the render:

Flicker and stripes (z-fighting): never leave two faces on the same plane. Decals, catchers and blobs sit 5-10 mm above the surface with polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1. Keep camera.near at 0.2 or more and camera.far about 2000; never 0.01 near.
Background cut off or a visible ground edge: camera.far must reach past the fog end and the sky. The ground extends past the fog end in every direction, with a horizon ring of hills so no edge or empty sky shows under the horizon. The sky sphere's radius is below camera.far.
Crooked buildings (leaning verticals): keep camera pitch within ±8° on wides and establishing shots. To frame higher or lower, shift the lens instead of tilting: camera.filmOffset or setViewOffset. Wide vertical fov is 50° or less. Roll is deliberate and only on drama beats (3-5°), eased in and back to 0. Never roll an establishing shot.
Tilted or sunken props: every prop's origin is at its base centre, placed at y = groundAt(x, z). Use radians: THREE.MathUtils.degToRad(deg). A degree value passed as radians is the classic crooked-object bug. Rotate only on y unless the story needs a tilt, and line houses up on the street grid.
Gaps and cracks: overlap joining parts by 2-5 cm (roof over walls, wall corners, deck planks over beams). Use cylinders with 24+ segments for anything near the camera. Call computeVertexNormals() after merging geometry, and keep extrude bevels off.
Shadow artefacts: stripes on lit faces (acne) mean the bias is too small. Shadows detached from the feet (peter-panning) mean it's too big. Change normalBias before bias.
Swimming or blurry textures: use power-of-2 canvases, mipmaps, and texture.anisotropy = renderer.capabilities.getMaxAnisotropy(). Keep texel density constant with tbox, and never stretch one texture over a long box.
Background breaking into halos: the DOF's per-sample CoC test stays on (no foreground bleed), and ink fades with distance (140-520 m) so far geometry doesn't crawl.
Billboards: clouds and backdrop cards never cross geometry. Keep them beyond the fog start and turning on yaw only.
Jitter from frame to frame: everything is a pure function of the frame number. Never use Math.random() or clock time in a frame; use a seeded random keyed by the object's id.
Where it breaks: problems show at the start and end of camera moves and on cuts. That is why every scene's review frames include its first and last frame.
4.5 Motion: smooth and alive (web/motion.js)
Cameras: camFromKeys(keys, f, {kicks}). Use smootherstep glides (18-45 f), easeOut for reveals and whips, and path via-points (Catmull-Rom) for curved moves. Every hold creeps and nothing is static for 4+ frames. Use 3-5° rolls on drama and 7-frame flip-shakes on impacts.
Continuity: prefer continuous moves (pull back from a close-up into the wide, rack focus, crane through the deck, push into an object). Hard cut only on place or time jumps, with a flash.
Characters never freeze: apply idle(f, seed) to every card, blinkAt blinks, and head bobs on stressed words.
Actions: anticipation → back overshoot → spring settle. A stamp is a 2-frame dip + dust puff + kick. Laughs are an alternating tilt + bob.
Secondary motion: banner cloth waves, leaves/dust/drips/Zzz effect cards, flowing water. Something always moves.
Walks: walk() gives distance + step phase. Feet planted, bob 3-7 %.
Lens: DOF on close-ups and mediums (cInf 8-14 px), focus on the eyes. Wides are sharp. Racks take ~14 f.
Stage 5: Scene review (the gate)
5.1 Self-check first

Before the user sees anything, render each scene's review frames and fix these traps yourself:

Narrow vertical frame: horizontal half-width = d·tan(hfov/2), with hfov = 2·atan(tan(vfov/2)·0.5625). At 4 m and fov 40 that is ±0.8 m, so stage characters in depth.
Railings or posts across faces (camera inside the rail or ~2.5 m up). The camera path through houses, roofs or bushes. Foreground props under ~2 m away. The hero hidden behind a pillar.
Mirrored text. A detached-part card offset the wrong way.
Extrude material groups: 0 = caps, 1 = sides+top.
Missing ink: debug the edge-only output. Ink radius ~2.5 px at 1080. The sky counts as far depth, not a card.
Floating characters with no shadow: go through the shadow setup in 4.4d. Night scenes: check that faces are still readable and that lamp pools and windows glow.
Flicker, cut-off background, leaning buildings, tilted props, gaps: go through 4.4e.
Compare with 2-3 matching example frames (4.4b).
5.2 Review frames per scene
For each scene render its first, middle and last frame plus every key action frame (an impact, a reveal, an expression change), 3-6 frames per scene: node render.mjs review/S03 "<frames>". Full 1080x1920 quality, the same renderer as the final.
Make one sheet per scene, review/S03_v1.jpg: the frames side by side, each labelled with the scene id, frame number and time, and a header line with the words spoken in that scene. These labels are only on the review sheets, never in the video.
Keep work/REVIEW.md: one row per scene with id, frames, seconds, words, version and status (to check / needs fix / approved).
5.3 Send and stop

Send all scene sheets in one SendUserFile call, in order. Then send a short message:

A numbered list: S01 · 0.0-2.4 s · "words" · one-line description.
How to reply: "Send corrections by scene, e.g. S03: make it night, move the soldier left. Say S05 ok to approve one, or generate when everything looks right." Then stop and wait. Do not render the video.
5.4 Corrections loop

For each correction the user sends:

Map it to scene ids. If a correction names no scene, ask which scene it means, offering the most likely ones.
Edit only that scene's file (web/scenes/S03.js), using a scene-local override when the change would otherwise touch shared files (4.2b). If a shared change is unavoidable, name the other scenes it affects and ask first.
Re-render only the changed scenes' review frames, and, when a camera move or action crosses a cut, the first or last frame of the neighbour. Save as the next version (review/S03_v2.jpg) and never overwrite an older version.
Send only the changed sheets, each with the previous version beside it (before | after), plus one line per scene on what changed. Update work/REVIEW.md.
Stop and wait again. Repeat until the user says "generate". Scenes the user hasn't mentioned stay exactly as they are: no "while I was there" improvements. If you notice a problem in another scene, mention it in one line and leave it alone.
Stage 6: Generate (only after the user says "generate")
6.1 Sound (audio.py → stems → mix.py)

Rewrite the cue table for the story from each scene's sfx; the synths stay. audio.py writes only stems (music.wav, sfx.wav).

Music: a short march-like loop (kick/snare, plucked bass, brass pad). It stops at the twist line, then a low drone continues.
SFX on events (in frames/30): whooshes on big moves, thunk on stamps, rumble+crash on collapses, scrape on metal, ting on reveals, sting on the twist, creaks, snap, splash, snore, leaves, water ambience.
Mix with python3 mix.py voice.mp3 music.wav sfx.wav. It sets music to exactly 50 % of the voice's gated RMS (−6 dB) and SFX to 50 % with peaks capped at 0.7× the voice peak. It prints the measured levels: confirm music shows −6.0 dB vs voice and SFX is at or below that.
Scene frame ranges never change during corrections, so the sound only needs re-running when a scene's SFX cues changed.
6.2 Render scene by scene
Render each scene into its own folder: node render.mjs frames/S03 "<f0>-<f1>", with Bash run_in_background, watched by a Monitor loop that reports progress per scene and catches errors or process exit. RESUME=1 continues after an interruption. Don't run heavy Python at the same time on small machines.
Skip any scene whose folder is complete and whose hash in work/hashes.json is unchanged. Record the hash after each scene finishes.
Link the scene folders into one numbered sequence (frames/all/f0000.jpg ... as symlinks, in scene order), then run bash finish.sh "Title" on it. It applies one linear gain to about −14 LUFS plus a −1 dBFS peak limiter, encodes H.264 CRF 17 + AAC, runs freeze/black and loudness QA, and writes out/qa_sheet.jpg. Look at the sheet. Frozen spans ≥0.4 s or black frames need a fix.
Deliver the MP4 with SendUserFile and one line per scene on what it shows. Offer captions or the next idea from the list.
6.3 Corrections after the video is made

The same loop as 5.4: edit only the named scene, send its new review sheet, and wait. On "generate", re-render only the changed scenes' frame folders (plus neighbour frames across a continuous cut), relink, and re-run finish.sh. The encode takes a minute; the unchanged scenes are reused as they are.

Engine gotchas (kept in the kit; keep them if rebuilding)
#include <fog_vertex> / <fog_fragment> go on their own lines.
The final pass writes linearToOutputTexel(...) (render targets are linear HalfFloat).
The normal+depth pass swaps materials per mesh: world → normal/depth, cards → alpha-tested mask (rgb 0, a = depth), blobs/clouds/sky hidden, water → flat normal. Fog and shadows are off during it.
Ink goes on the near side of depth jumps only. Creases come from the normal dot. Card neighbours are skipped. Ink fades at ~140-520 m.
DOF: 48 taps with a per-sample CoC test (no foreground bleed).
The sun comes from az/el per light preset. The shadow camera is centred on each scene's action.
Architecture (reference for editing the kit)
web/index.html loads main.js (ES module) over a local HTTP server.
main.js: renderer, toon materials, world, cards (1200x2000 CanvasTexture planes, origin at soles), passes colour (RT samples 4) → normal/depth → ink+grade (saturation, gain/lift, vignette, flash) → DOF to screen. It exposes window.renderFrame(f) and window.ready.
web/scenes/SNN.js: one file per scene (4.2b). story.js imports them and exports SHOTS, shotAt, camAt, dofAt, LIGHTS/lightFor, worldAt, actorsAt(f, T), fxAt(f, T) by dispatching to the scene that owns frame f. All are pure functions of the frame.
render.mjs: Playwright → renderFrame(f) → toDataURL('image/jpeg', .95) → <out dir>/f0000.jpg (frame numbers are global, so scene folders link straight into one sequence).
mix.py: gated-RMS level lock (music and SFX at 50 % of the voice). finish.sh: linear loudness gain, limiter, encode, QA.
Characters: the Pen API from mromidev/claude-animated-shorts templates/bridge/toon.ts, extended in the same module scope by the cast file.
Project folders: review/ (scene sheets, all versions), frames/SNN/ (final frames per scene), frames/all/ (links), work/ (PLAN.md, REVIEW.md, hashes.json, timing).