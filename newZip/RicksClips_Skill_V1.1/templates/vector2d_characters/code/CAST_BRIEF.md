You are drawing cartoon characters IN CODE (SVG via Node) for an animated-Shorts studio. The lead built the rig, a costume kit and the first sheet; you build TWO more sheets of 10 characters each, matching sheet 01's look exactly.

WORKING DIR: /tmp/claude-0/-home-user/40db8a89-4bff-5cb5-bb46-8d1e3e72790d/scratchpad/nc/v2d   (run node from this dir)

READ FIRST:
- castkit.mjs: the header comment documents the character spec (form, coat, face, hair, hat, headBack, faceTop, details, behind, props, over, arms) and coordinate spaces. Read the whole file.
- sheets/sheet01.mjs: the quality bar (Ancient world). Copy its techniques. LOOK at out/sheet01.png (Read tool shows images).
- Face boards to pick expressions: out/meme_board_full.png (MEMES), out/female_board.png, out/baby_board.png, out/elder_board.png. Body forms: /mnt/project-files/new-characters/vector2d/LOCKED_body_forms_v1/body_forms_front.png.
- Optional style cues from the reference artist (DON'T copy his characters): /mnt/user-data/uploads/Downloads/Ricks Clips Animation Skill/references/sheets/short05_sheet.jpg and short12_sheet.jpg.
Face names: MEMES: troll bruh jawdrop wail hysterical rage evil disgust terrified heartEyes money tired sus starstruck awkward ko puppy proud confused scream deadInside flirty sick cool strain delight sideeye soul. FEMALE (face: ['female', name]): sassy eyeRoll judging blowKiss omg giggle mascaraCry deathGlare swoon mamaRage duckFace offended fangirl smug eek happyCry. BABY: giggle wail tantrum sleepy curious poop amazed drool pout raspberry yawn sneaky shy hiccup foodMess burp. ELDER: grumpy gumLaugh eh nodOff proudTears dentures suspicious sweetSmile angryFist confused nostalgic cackle. face 'standard' = calm default face. Forms: standard chad bigboi noodle kid dad lady elder baby. hair keys: bob granny gramps curl (or draw your own hair in headBack/hat).

RULES (the client is very picky: quality must match or beat sheet 01):
1. Every character is memorable and instantly recognisable from far away: ONE giant silhouette signature (hat, hair, headdress, prop, cape, body form). Check the far-away silhouette strip at the bottom of the rendered sheet; if two silhouettes look alike, change one.
2. Meme-level expressions: use the locked faces; never repeat a face on the same sheet; pick faces that fit the character's personality. Faces with big mouths low on the head clash with beards; choose accordingly (see sheet01 viking).
3. BODY (CB locked 2026-11-12, VIEW_RULES 32): use form 'standard' with spec.size thin | standard | fat for almost every character, mostly standard and fat. Other forms (kid, baby, toddler, teen, elder, lady, ghost...) only when the story needs them. Old line, no longer valid: "Vary body forms: at least 5 different forms per sheet. Women use form 'lady' (or kid/elder/baby etc. when it fits) with FEMALE faces."
4. Style: ink #2a1a1f outlines (INK), outline widths like sheet01 (head space 5-7, body 4-6), flat colours, highlights with hl(), white skin always, ALL arms/legs are plain ink sticks (never colour limbs, no shoes/gloves on limbs; hands are ink dots). Big, bold, simple shapes; detail where it helps read the character.
5. Keep each character inside its slot: everything within x = cx +/- 250, nothing above the canvas. Nothing may cover the face except deliberate items (helmet T-slot, mask, glasses).
6. Respect: real historical people are drawn as affectionate caricatures (no mockery of tragedy), cultures are shown through costume and props only (never exaggerated ethnic features; skin stays white like everyone else). No copyrighted/trademarked characters or logos.
7. DO NOT edit shared files (char2d.mjs, castkit.mjs, bodies.mjs, memes.mjs, memes2.mjs, castsheet.mjs). If you need a helper, define it inside your sheet file.
8. Iterate: render (`node castsheet.mjs sheets/sheetNN.mjs` -> out/sheetNN.png), look at the PNG (full sheet and crops with python PIL if needed), fix problems (overlaps, clipping, weak silhouettes, unreadable props), render again. At least two review passes per sheet.
9. Don't write to /mnt/project-files. Don't touch other sheets.

FINAL REPLY: the two PNG paths, one line per character (label, form, face, silhouette signature), and any problem you couldn't solve.
